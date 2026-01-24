export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse bg-neutral-800" />
          <div className="mt-2 h-4 w-32 animate-pulse bg-neutral-800" />
        </div>

        <div className="space-y-6">
          <div className="border border-neutral-800 bg-neutral-950/80 p-6">
            <div className="mb-4 h-4 w-24 animate-pulse bg-neutral-800" />
            <div className="space-y-4">
              <div className="h-10 animate-pulse bg-neutral-800" />
              <div className="h-10 animate-pulse bg-neutral-800" />
            </div>
          </div>

          <div className="border border-neutral-800 bg-neutral-950/80 p-6">
            <div className="mb-4 h-4 w-32 animate-pulse bg-neutral-800" />
            <div className="h-48 animate-pulse bg-neutral-800" />
          </div>

          <div className="border border-neutral-800 bg-neutral-950/80 p-6">
            <div className="mb-4 h-4 w-20 animate-pulse bg-neutral-800" />
            <div className="space-y-4">
              <div className="h-10 animate-pulse bg-neutral-800" />
              <div className="h-32 animate-pulse bg-neutral-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
