// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-lg">Page not found</p>
      </div>
    </div>
  );
}
