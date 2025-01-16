import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ButtonProps {
  aboutRef: React.RefObject<HTMLDivElement>
  sponsorsRef: React.RefObject<HTMLDivElement>
  faqRef: React.RefObject<HTMLDivElement>
}

export const Navbar = ({ aboutRef, sponsorsRef, faqRef }: ButtonProps) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 8) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  })

  return (
    <nav className={`z-50 fixed w-screen flex items-center justify-between p-4 border-b transition-colors bg-background duration-300 ${ isScrolled && "bg-background/95 backdrop-blur-sm"}`}>
      <div className="flex items-center gap-8">
        <Image src="/images/RightJellyBean.png" width={48} height={48} alt="logo"/>
        <h1 className="text-xl">Hackathon Club at Oregon State University</h1>
      </div>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => {aboutRef.current?.scrollIntoView({ behavior: "smooth" })}}
        >About</Button>
        <Button 
          variant="outline" 
          onClick={() => {sponsorsRef.current?.scrollIntoView({ behavior: "smooth" })}}
        >Sponsors</Button>        
        <Button 
          variant="outline" 
          onClick={() => {faqRef.current?.scrollIntoView({ behavior: "smooth" })}}
        >FAQ</Button>
        <Link href="/apply"><Button variant="outline">Apply</Button></Link>
      </div>
    </nav>
  )
}