import { Navbar } from "@/components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<main className="flex min-h-dvh flex-col">
			<Navbar />
			<div className="flex grow flex-col">{children}</div>
		</main>
	);
}