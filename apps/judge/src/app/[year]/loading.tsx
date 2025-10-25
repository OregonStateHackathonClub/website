import LoadingIndicator from "@/components/loadingIndicator";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950">
      <LoadingIndicator />
    </div>
  );
}
