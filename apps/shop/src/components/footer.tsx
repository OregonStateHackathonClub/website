import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <Link
              href="https://beaverhacks.org"
              className="hover:text-foreground transition-colors"
            >
              BeaverHacks
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BeaverHacks. All sales final.
          </p>
        </div>
      </div>
    </footer>
  );
}
