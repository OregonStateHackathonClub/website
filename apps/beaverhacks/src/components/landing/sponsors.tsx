import Image from "next/image";
import Link from "next/link";

function SponsorsPage() {
  return (
    <div className="w-screen min-h-screen flex flex-col gap-12 items-center justify-center">
      <h2 className="text-4xl font-bold mb-6">Sponsors</h2>
      <div className="w-full px-4 flex flex-col items-center gap-10">
        <div className="grid grid-cols-2 md:grid-cols-4 justify-items-center items-center gap-8 md:gap-16">
          <Link
            className="transition-transform duration-300 hover:scale-105"
            href="https://developer.nvidia.com/join-nvidia-developer-program"
            target="_blank"
          >
            <Image
              src="/images/nvidia.png"
              width={200}
              height={100}
              alt="NVIDIA logo"
              className="object-contain w-48 sm:w-56 md:w-64"
            />
          </Link>
          <Link
            className="transition-transform duration-300 hover:scale-105"
            href="https://developers.google.com/"
            target="_blank"
          >
            <Image
              src="/images/google.png"
              width={200}
              height={100}
              alt="Google logo"
              className="object-contain w-36 sm:w-44 md:w-52"
            />
          </Link>
          <Link
            className="transition-transform duration-300 hover:scale-105"
            href="https://groq.com/how-to-win-hackathons-with-groq/"
            target="_blank"
          >
            <Image
              src="/images/groq.png"
              width={200}
              height={100}
              alt="Groq logo"
              className="object-contain w-36 sm:w-44 md:w-52"
            />
          </Link>
          <Link
            className="transition-transform duration-300 hover:scale-105 col-span-2 md:col-span-1 mt-4 md:mt-0"
            href="https://sui.io/"
            target="_blank"
          >
            <Image
              src="/images/sui.png"
              width={200}
              height={200}
              alt="Sui logo"
              className="object-contain w-24 sm:w-32 md:w-40"
            />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-8 sm:gap-8 md:gap-16 justify-items-center">
          <Link
            className="transition-transform duration-300 hover:scale-105"
            href="https://acm.oregonstate.edu/"
            target="_blank"
          >
            <Image
              src="/images/acmlogo.svg"
              width={80}
              height={80}
              alt="ACM logo"
              className="object-contain w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
            />
          </Link>
          <Link
            className="transition-transform duration-300 hover:scale-105"
            href="https://osuapp.club/"
            target="_blank"
          >
            <Image
              src="/images/appdev.png"
              width={80}
              height={80}
              alt="App Development Club logo"
              className="object-contain w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
            />
          </Link>
          <Link
            className="transition-transform duration-300 hover:scale-105"
            href="https://gdgc-osu.com/"
            target="_blank"
          >
            <Image
              src="/images/gdgc.png"
              width={80}
              height={80}
              alt="Google Developer Group on Campus logo"
              className="object-contain w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
            />
          </Link>
          <Link
            className="transition-transform duration-300 hover:scale-105"
            href="https://org.osu.edu/womenincyber/"
            target="_blank"
          >
            <Image
              src="/images/wicys.png"
              width={80}
              height={80}
              alt="Woman in Cyber Security logo"
              className="object-contain w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
            />
          </Link>
        </div>

        <p className="text-base sm:text-lg text-center mt-8 text-muted-foreground">
          Interested in becoming a sponsor? Contact us at{" "}
          <a
            href="mailto:sponsor@beaverhacks.org"
            className="underline hover:text-gray-300 transition-colors"
          >
            sponsor@beaverhacks.org
          </a>
        </p>
      </div>
    </div>
  );
}

export default SponsorsPage;
