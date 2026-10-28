const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const shopRequire = createRequire(path.join(root, 'package.json'));
function load(relative, mocks) {
  const file = path.join(root, relative);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(
    id => id in mocks ? mocks[id] : shopRequire(id), module, module.exports,
  );
  return module.exports;
}
function findCheckout(node) {
  if (!node || typeof node !== 'object') return;
  if (node.props?.children === 'Checkout') return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = findCheckout(child);
    if (found) return found;
  }
}
for (const size of ['XS', 'S', 'M', 'L', 'XL', '2XL']) {
  test(`guest cart sends ${size} through server validation to the configured Stripe price`, async () => {
    for (const s of ['XS', 'S', 'M', 'L', 'XL', '2XL']) {
      process.env[`NEXT_PUBLIC_STRIPE_PRICE_${s}`] = `price_test_${s}`;
    }
    const { product } = load('src/lib/products.ts', {});
    const variant = product.variants.find(v => v.name === size);
    assert.ok(variant, `${size} must be selectable`);
    let stripeInput;
    const session = null;
    const constants = { MAX_CART_ITEMS: 3, SOLD_OUT: false };
    const { POST } = load('src/app/api/checkout/route.ts', {
      'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
      '@repo/auth': { getSessionCookie: () => null, auth: { api: { getSession: async () => session } } },
      '@/lib/stripe': { stripe: { checkout: { sessions: { create: async input => {
        stripeInput = input;
        return { url: 'https://checkout.stripe.com/test-session' };
      } } } } },
      '@/lib/products': { product }, '@/lib/constants': constants,
    });
    const items = [{ productId: product.id, variantId: variant.id, stripePriceId: variant.stripePriceId,
      name: product.name, variantName: size, price: product.price, quantity: 1 }];
    const { default: CartPage } = load('src/app/cart/page.tsx', {
      react: { ...shopRequire('react'), useState: x => [x, () => {}] },
      'next/image': { default: 'img' }, 'next/link': { default: 'a' },
      '@repo/auth/client': { useSession: () => ({ data: session, isPending: false }) },
      '@repo/ui/components/card': { Card: 'section' }, '@repo/ui/components/button': { Button: 'button' },
      '@/lib/cart': { useCart: () => ({ items, totalPrice: product.price, totalItems: 1 }) },
      '@/lib/constants': constants,
    });
    const button = findCheckout(CartPage());
    assert.ok(button);
    let response;
    global.window = { location: {} };
    global.alert = () => {};
    global.fetch = async (_, options) => {
      response = await POST({ headers: {}, json: async () => JSON.parse(options.body) });
      return { json: async () => response.body };
    };
    await button.props.onClick();
    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(stripeInput.customer_email, undefined);
    assert.deepEqual(stripeInput.line_items, [{ price: `price_test_${size}`, quantity: 1 }]);
    assert.equal(window.location.href, 'https://checkout.stripe.com/test-session');
  });
}

for (const scenario of [
  { name: 'unknown product', items: [{ productId: 'other', variantId: 's', quantity: 1 }] },
  { name: 'unknown size', variantId: 'invalid', quantity: 1 },
  { name: 'negative quantity', quantity: -1 },
  { name: 'fractional quantity', quantity: 1.5 },
  { name: 'quantity above limit', quantity: 4 },
  { name: 'combined quantity above limit', quantities: [2, 2] },
]) {
  test(`guest checkout rejects ${scenario.name} before contacting Stripe`, async () => {
    const { product } = load('src/lib/products.ts', {});
    let stripeCalled = false;
    const { POST } = load('src/app/api/checkout/route.ts', {
      'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
      '@/lib/stripe': { stripe: { checkout: { sessions: { create: async () => { stripeCalled = true; } } } } },
      '@/lib/products': { product }, '@/lib/constants': { MAX_CART_ITEMS: 3, SOLD_OUT: false },
    });
    const items = scenario.items || (scenario.quantities || [scenario.quantity]).map(quantity => ({
      productId: product.id, variantId: scenario.variantId || product.variants[0].id, quantity,
    }));
    const response = await POST({ json: async () => ({ items }) });
    assert.equal(response.status, 400);
    assert.equal(stripeCalled, false);
  });
}
