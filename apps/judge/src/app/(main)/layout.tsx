import { Navbar } from "@/components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-dvh flex-col bg-neutral-900 text-neutral-200 pt-12">
            <Navbar />
            <div className="flex grow flex-col">{children}</div>
        </main>
    );
}