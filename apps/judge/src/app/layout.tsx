import type { Metadata } from "next";
import { GeistSans } from "@repo/ui/fonts";

import "@repo/ui/globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
	title: "BeaverHacks Judge",
	description: "BeaverHacks Judge",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${GeistSans.className}`}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
