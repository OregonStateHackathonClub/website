import Link from "next/link";

export default function Page() {
  return (
    <main className="h-screen bg-screen-dark flex items-center justify-center p-4">
      <div className="crt-screen crt-scanlines crt-vignette w-full max-w-xl border border-amber-muted/25 p-8 text-center">
        <h1 className="text-amber-bright text-glow-base font-primary text-3xl md:text-4xl tracking-wide mb-2">
          BEAVERHACKS
        </h1>
        <p className="text-amber-muted text-sm mb-8">
          Oregon State Hackathon
        </p>

        <div className="text-amber-normal font-secondary text-lg mb-8">
          Site under maintenance
        </div>

        <p className="text-amber-dim text-sm mb-6">
          Looking to apply for the online hackathon?
        </p>

        <Link
          href="/apply"
          className="inline-block px-6 py-3 border border-amber-muted/50 text-amber-bright hover:text-glow-base hover:border-amber-bright transition-all font-secondary"
        >
          Click here to apply
        </Link>
      </div>
    </main>
  );
}
