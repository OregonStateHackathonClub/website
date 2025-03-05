"use client"

import { useRef } from "react";
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

const Home = () => {
  const about = useRef<HTMLDivElement>(null)
  const sponsors = useRef<HTMLDivElement>(null)
  const faq = useRef<HTMLDivElement>(null)

  return (
    <>
      <Navbar aboutRef={about} sponsorsRef={sponsors} faqRef={faq}/>
      <div className="relative w-screen h-screen">
        <video
          className="absolute w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/promo_vid.mp4" type="video/mp4" />
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
      <div ref={about} className="w-screen h-screen flex flex-col items-center justify-center">
        <Countdown targetDate={new Date(1743807600 * 1000)} />
      </div>
      <div ref={sponsors} className="w-screen min-h-screen flex flex-col gap-12 items-center justify-center py-20">
        <h2 className="text-4xl font-bold mb-12">Sponsors</h2>
        <div className="w-full max-w-7xl px-4 flex flex-col items-center gap-10">
          <div className="w-full flex justify-center items-center gap-16">
            <Link 
              className="transition-transform duration-300 hover:scale-105" 
              href="https://google.com/" 
              target="_blank"
            >
              <Image 
                src="/images/google.png"
                width={200}
                height={100}
                alt="Google logo"
                className="object-contain"
              />
            </Link>
            <Link 
              className="transition-transform duration-300 hover:scale-105" 
              href="https://groq.com/" 
              target="_blank"
            >
              <Image 
                src="/images/groq.png"
                width={200}
                height={100}
                alt="Groq logo"
                className="object-contain"
              />
            </Link>
            <Link 
              className="transition-transform duration-300 hover:scale-105" 
              href="https://sui.io/" 
              target="_blank"
            >
              <Image 
                src="/images/sui.png"
                width={200}
                height={100}
                alt="Sui logo"
                className="object-contain"
              />
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-16">
            <Link 
              className="transition-transform duration-300 hover:scale-105" 
              href="https://acm.oregonstate.edu/" 
              target="_blank"
            >
              <Image 
                src="/images/acmlogo.svg"
                width={100}
                height={100}
                alt="ACM logo"
                className="object-contain"
              />
            </Link>
            <Link 
              className="transition-transform duration-300 hover:scale-105" 
              href="https://osuapp.club/" 
              target="_blank"
            >
              <Image 
                src="/images/appdev.png"
                width={100}
                height={100}
                alt="App Development Club logo"
                className="object-contain"
              />
            </Link>
          </div>
          <p className="text-lg text-center mt-8 text-muted-foreground">
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
              A competition where teams build innovative projects from scratch. Network with fellow developers, learn new skills, and compete for prizes. 
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