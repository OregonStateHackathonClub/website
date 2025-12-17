import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavbarProps = {
  aboutRef: React.RefObject<HTMLDivElement | null>;
  sponsorsRef: React.RefObject<HTMLDivElement | null>;
  faqRef: React.RefObject<HTMLDivElement | null>;
};

export const Navbar = ({ aboutRef, sponsorsRef, faqRef }: NavbarProps) => {
  const [isOnVideoSection, setIsOnVideoSection] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < window.innerHeight) {
        setIsOnVideoSection(true);
      } else {
        setIsOnVideoSection(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`z-50 fixed w-screen flex items-center justify-between p-4 border-b transition-all duration-300 ${
        isOnVideoSection
          ? "border-white/10 bg-black/30 backdrop-blur-sm text-white"
          : "border-border bg-background"
      }`}
    >
      <div className="flex gap-8">
        <Link href="/" className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/beaver.png"
              width={40}
              height={40}
              className="w-10 h-10 sm:w-12 sm:h-12"
              alt="logo"
            />
            <div className="flex flex-col">
              <h1 className="text-lg uppercase font-bold sm:text-xl">
                BeaverHacks
              </h1>
              <p className="text-xs uppercase text-muted-foreground text-nowrap hidden sm:block">
                Oregon State University
              </p>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="https://instagram.com/beaverhacks"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Instagram"
          >
            <Image
              src="/images/instagram.svg"
              width={20}
              height={20}
              alt="Instagram logo"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </Link>
          <Link
            href="https://youtube.com/@osubeaverhacks"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="YouTube"
          >
            <Image
              src="/images/youtube.svg"
              width={20}
              height={20}
              alt="Youtube logo"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
          </Link>
          <Link
            href="https://discord.gg/vuepffJxub"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Discord"
          >
            <Image
              src="/images/discord.svg"
              width={20}
              height={20}
              alt="Discord logo"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
          </Link>
        </div>
      </div>

      <div className="flex gap-2 md:gap-4">
        <Button
          variant="outline"
          className="hidden md:block"
          onClick={() => {
            aboutRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          About
        </Button>
        <Button
          variant="outline"
          className="hidden md:block"
          onClick={() => {
            sponsorsRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Sponsors
        </Button>
        <Button
          variant="outline"
          className="hidden md:block"
          onClick={() => {
            faqRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          FAQ
        </Button>

        <Link href="/apply">
          <Button
            variant="default"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Register
          </Button>
        </Link>
      </div>
    </nav>
  );
};
