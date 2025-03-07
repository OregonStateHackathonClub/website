"use client"

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { Navbar } from "@/components/navbar";
import { Countdown } from "@/components/countdown";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Clock, MapPin, Calendar, Users } from "lucide-react";

const Home = () => {
  const about = useRef<HTMLDivElement>(null)
  const sponsors = useRef<HTMLDivElement>(null)
  const faq = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth < 768
    
      if (currentIsMobile !== isMobile) {
        setIsMobile(currentIsMobile)
        
        if (videoRef.current) {
          videoRef.current.load()
        }
      }
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobile])

  return (
    <>
      <Navbar aboutRef={about} sponsorsRef={sponsors} faqRef={faq}/>
      <div className="relative w-screen h-screen">
        <video
          ref={videoRef}
          className={`absolute w-full h-full object-cover`}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={isMobile ? "/promo_vid_tall.mp4" : "/promo_vid_wide.mp4"}  type="video/mp4" />
        </video>
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 text-white cursor-pointer z-40 opacity-70 hover:opacity-100 transition-opacity duration-300"
          onClick={() => about.current?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-xs uppercase tracking-widest">Discover</span>
          <div className="h-12 flex flex-col items-center justify-start overflow-hidden">
            <div className="w-px h-8 bg-white animate-pulse"></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background z-10"></div>
      </div>
      <div ref={about} className="w-screen min-h-screen flex flex-col items-center justify-center py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-4">
          <div className="backdrop-blur-sm p-6 rounded-xl border flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-3 flex gap-2">
              <Clock />
              Time Remaining
            </h3>
            <Countdown targetDate={new Date(1743883200 * 1000)} />
          </div>
          
          <div className="backdrop-blur-sm p-6 rounded-xl border">
            <h3 className="text-xl font-semibold mb-3 flex gap-2">
              <MapPin />
              Location
            </h3>
            <p className="text-lg font-medium">Kelley Engineering Center</p>
            <p className="text-muted-foreground">Oregon State University</p>
            <p className="text-muted-foreground">110 SW Park Terrace</p>
            <p className="text-muted-foreground">Corvallis, OR 97331</p>
          </div>
          
          <div className="backdrop-blur-sm p-6 rounded-xl border">
            <h3 className="text-xl font-semibold mb-3 flex gap-2">
              <Calendar />
              Schedule
            </h3>
            <ul className="space-y-2">
            <li className="flex justify-between">
                <span>Hacker Check-in</span>
                <span className="text-muted-foreground">Apr 5, 11:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>Opening Ceremony</span>
                <span className="text-muted-foreground">Apr 5, 12:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Hacking Begins</span>
                <span className="text-muted-foreground">Apr 5, 1:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Hacking Ends</span>
                <span className="text-muted-foreground">Apr 6, 1:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Judging</span>
                <span className="text-muted-foreground">Apr 6, 2:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Closing Ceremony</span>
                <span className="text-muted-foreground">Apr 6, 3:00 PM</span>
              </li>
            </ul>
          </div>
          
          {/* Discord */}
          <div className="backdrop-blur-sm p-6 rounded-xl border">
            <h3 className="text-xl font-semibold mb-3 flex gap-2">
              <Users />
              Join Our Discord
            </h3>
            <p className="mb-4">Connect with fellow hackers, get support, and stay updated about the event.</p>
            
            <a 
              href="https://discord.gg/zkuDhSgznE" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              <Image
                src="/images/discord.svg"
                width={20}
                height={20}
                alt="Discord logo"
                className="w-5 h-5"
              />
              <span>Join Discord Server</span>
            </a>
          </div>
        </div>
      </div>
      <div ref={sponsors} className="w-screen min-h-screen flex flex-col gap-12 items-center justify-center py-20">
        <h2 className="text-4xl font-bold mb-6">Sponsors</h2>
        <div className="w-full px-4 flex flex-col items-center gap-10">
          <div className="grid grid-cols-2 md:grid-cols-3 justify-items-center items-center gap-8 md:gap-16">
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
                height={100}
                alt="Sui logo"
                className="object-contain w-36 sm:w-44 md:w-52"
              />
            </Link>
          </div>
    
          <div className="grid grid-cols-3 gap-8 sm:gap-8 md:gap-16 justify-items-center">
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
      <div ref={faq} className="w-screen h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl w-1/2 py-8">FAQs</h1>
        <Accordion type="multiple" className="w-1/2">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="hover:no-underline text-lg">What is a Hackathon?</AccordionTrigger>
            <AccordionContent>
              A coding competition where teams build innovative projects from scratch. Network with fellow developers, learn new skills, and compete for prizes. 
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-none">
            <AccordionTrigger className="hover:no-underline text-lg">What is BeaverHacks?</AccordionTrigger>
            <AccordionContent>
              BeaverHacks is the official Hackathon hosted by the Hackathon Club at Oregon State University.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-none">
            <AccordionTrigger className="hover:no-underline text-lg">Who can come?</AccordionTrigger>
            <AccordionContent>
              Anyone currently enrolled in a college over the age of 18.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border-none">
            <AccordionTrigger className="hover:no-underline text-lg">What if I don&apos;t have a team?</AccordionTrigger>
            <AccordionContent>
              Meet potential teammates during team formation at the start of the event. We&apos;ll help match you with others based on skills and interests.
            </AccordionContent>
          </AccordionItem>
        </Accordion>  
      </div>
    </>
  );
}

export default Home;