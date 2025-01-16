"use client"

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import { ChevronButton } from "@/components/chevron";
import { Navbar } from "@/components/navbar";
import { Countdown } from "@/components/countdown";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const Home = () => {

  const about = useRef(null)
  const sponsors = useRef(null)
  const faq = useRef(null)

  return (
    <>
      <Navbar aboutRef={about} sponsorsRef={sponsors} faqRef={faq}/>
      <div className="w-screen h-screen flex items-center justify-center">
        <ChevronButton targetRef={about}/>
      </div>
      <div ref={about} className="w-screen h-screen flex flex-col items-center justify-center">
        <span>Oregon State&apos;s Biggest Hackathon</span>
        <Countdown targetDate={new Date(1743807600 * 1000)} />
      </div>
      <div ref={sponsors} className="w-screen h-screen flex flex-col gap-8 items-center justify-center">
        <span>Sponsors</span>
        <div className="flex flex-wrap gap-12 w-screen justify-center">
          <Link className="flex items-center" href="https://groq.com/" target="_blank">
            <Image 
              src="/images/groq_white.png"
              width={256}
              height={256}
              alt="Groq logo"
            />
          </Link>
          <Link className="flex items-center" href="https://sui.io/" target="_blank">
            <Image 
              src="/images/sui_sea.png"
              width={256}
              height={256}
              alt="Groq logo"
            />
          </Link>
        </div>
        <p>Interested in becoming a sponsor? Contact us at sponsor@beaverhacks.org.</p>
      </div>
      <div ref={faq} className="w-screen h-screen flex flex-col items-center">
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
            <AccordionTrigger className="hover:no-underline text-lg">What if I don't have a team?</AccordionTrigger>
            <AccordionContent>
              Meet potential teammates during team formation at the start of the event. We'll help match you with others based on skills and interests.
            </AccordionContent>
          </AccordionItem>
        </Accordion>  
      </div>
    </>
  );
}

export default Home;