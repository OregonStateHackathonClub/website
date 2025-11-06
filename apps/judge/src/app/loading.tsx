import LoadingIndicator from "@/components/loadingIndicator";

export default function Loading() {
	// This component will be automatically shown by Next.js during page transitions
	return (
		<div className="flex min-h-screen items-center justify-center">
			<LoadingIndicator />
		</div>
	);
}
