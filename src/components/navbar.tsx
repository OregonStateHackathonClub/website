import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  aboutRef: React.RefObject<HTMLDivElement>
  sponsorsRef: React.RefObject<HTMLDivElement>
  faqRef: React.RefObject<HTMLDivElement>
}

export const Navbar = ({ aboutRef, sponsorsRef, faqRef }: NavbarProps) => {
  const [isOnVideoSection, setIsOnVideoSection] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < window.innerHeight) {
        setIsOnVideoSection(true)
      } else {
        setIsOnVideoSection(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, []) 

  return (
    <nav className={`z-50 fixed w-screen flex items-center justify-between p-4 border-b transition-all duration-300 ${
      isOnVideoSection 
        ? "border-white/10 bg-black/30 backdrop-blur-sm text-white" 
        : "border-border bg-background"
      }`}
    >
      <Link href="/" className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <Image src="/images/beaver.png" width={40} height={40} className="w-10 h-10 sm:w-12 sm:h-12" alt="logo"/>
          <div className="flex flex-col">
            <h1 className="text-lg uppercase font-bold sm:text-xl">
              BeaverHacks
            </h1>
            <p className="text-xs uppercase text-muted-foreground hidden sm:block">
              Oregon State University
            </p>
          </div>
        </div>
      </Link>

      <div className="flex gap-2 md:gap-4">
        <Button 
          variant="outline" 
          className="hidden md:block"
          onClick={() => {aboutRef.current?.scrollIntoView({ behavior: "smooth" })}}
        >About</Button>
        <Button 
          variant="outline" 
          className="hidden md:block"
          onClick={() => {sponsorsRef.current?.scrollIntoView({ behavior: "smooth" })}}
        >Sponsors</Button>        
        <Button 
          variant="outline" 
          className="hidden md:block"
          onClick={() => {faqRef.current?.scrollIntoView({ behavior: "smooth" })}}
        >FAQ</Button>
        
        <Link href="/apply">
          <Button 
            variant="default"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >Register</Button>
        </Link>
      </div>
    </nav>
  )
}