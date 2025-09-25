import Link from "next/link";
import Image from "next/image";

interface LogoLinkProps {
  href: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function LogoLink({
  href,
  src,
  alt,
  width = 200,
  height = 100,
  className = "object-contain w-48 sm:w-56 md:w-64",
}: LogoLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      className="transition-transform duration-300 hover:scale-105"
    >
      <Image
        src={src}
        width={width}
        height={height}
        alt={alt}
        className={className}
      />
    </Link>
  );
}
