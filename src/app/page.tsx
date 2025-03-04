"use client"

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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

  // Logic for the parallax image movements
  const [mousePos, setMousePos] = useState({x: 0, y: 0});

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!about.current) return;

      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;

      // Normalize mouse position (-1 to 1)
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;

      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);



  return (
    <>
      <Navbar aboutRef={about} sponsorsRef={sponsors} faqRef={faq}/>
      <div className="w-screen h-screen flex items-center justify-center">
        <ChevronButton targetRef={about}/>
      </div>
      <div ref={about} className="w-screen h-screen relative flex flex-col items-center justify-center">

        <div className="hidden md:block lg:block xl:block">

          <motion.img 
            className="absolute hover:scale-110 hover:outline hover:outline-orange-500 transition duration-300"
            src="/parallaxPhotos/img1.jpg"
            width={200}
            height={200}
            alt="Officer Owen presenting"
            style={{ top: '10%', left: '20%' }}
            animate={{
              x: mousePos.x * 25,
              y: mousePos.y * 25,
            }}
            transition={{ type: "spring", stiffness: 100 }}
          />
          <motion.img
            className="absolute hover:scale-110 hover:outline hover:outline-orange-500 transition duration-300"
            src="/parallaxPhotos/img2.png"
            width={200}
            height={200}
            alt="Havel teaching"
            style={{ top: '30%', right: '15%' }}
            animate={{
              x: mousePos.x * -50,
              y: mousePos.y * -50,
            }}
            transition={{ type: "spring", stiffness: 100 }}
          />
          <motion.img
            className="absolute hover:scale-110 hover:outline hover:outline-orange-500 transition duration-300"
            src="/parallaxPhotos/img3.jpg"
            width={250}
            height={250}
            alt="UO Hackathon Podcast"
            style={{ bottom: '20%', left: '50%' }}
            animate={{
              x: mousePos.x * 25,
              y: mousePos.y * -25,
            }}
            transition={{ type: "spring", stiffness: 100 }}
          />
          <motion.img 
            className="absolute hover:scale-110 hover:outline hover:outline-orange-500 transition duration-300"
            src="/parallaxPhotos/img4.jpg"
            width={200}
            height={200}
            alt="Tom presentation"
            style={{ bottom: '20%', left: '10%' }}
            animate={{
              x: mousePos.x * 100,
              y: mousePos.y * 100,
            }}
            transition={{ type: "spring", stiffness: 100 }}
          />
          <motion.img 
            className="absolute hover:scale-110 hover:outline hover:outline-orange-500 transition duration-300"
            src="/parallaxPhotos/img5.jpg"
            width={200}
            height={200}
            alt="Programming"
            style={{ top: '10%', left: '50%' }}
            animate={{
              x: mousePos.x * 75,
              y: mousePos.y * -75,
            }}
            transition={{ type: "spring", stiffness: 100 }}
          />
          <motion.img 
            className="absolute hover:scale-110 hover:outline hover:outline-orange-500 transition duration-300"
            src="/parallaxPhotos/img6.jpg"
            width={200}
            height={200}
            alt="Officers"
            style={{ bottom: '10%', right: '10%' }}
            animate={{
              x: mousePos.x * -50,
              y: mousePos.y * 50,
            }}
            transition={{ type: "spring", stiffness: 100 }}
          />
          <motion.img 
            className="absolute hover:scale-110 hover:outline hover:outline-orange-500 transition duration-300"
            src="/parallaxPhotos/img7.jpg"
            width={200}
            height={200}
            alt="Dudes programming"
            style={{ bottom: '10%', left: '30%' }}
            animate={{
              x: mousePos.x * 50,
              y: mousePos.y * 50,
            }}
            transition={{ type: "spring", stiffness: 100 }}
          />

        </div>

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