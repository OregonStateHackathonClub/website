export default function Loading() {
	return (
		<div className="flex items-center justify-center p-8">
			<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
			<span className="ml-3 text-sm text-zinc-600">
				Loading submission maker…
			</span>
		</div>
	);
}
