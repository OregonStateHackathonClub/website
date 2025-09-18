"use client"

import { Navbar } from "@/components/navbar";
import { useRef, useState, useEffect } from "react";

import AboutPage from "@/components/landing/desktop/about";
import SponsorPage from "@/components/landing/desktop/sponsors";
import FaqPage from "@/components/landing/desktop/faq";
import Footer from "@/components/landing/desktop/footer";

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
    {/*Eventually the video should go into it's own component - Daniel*/}
      <Navbar aboutRef={about} sponsorsRef={sponsors} faqRef={faq}/>
      
      <div className="relative w-screen h-screen overflow-hidden">
        <video
          ref={videoRef}
          className={`absolute w-full h-full object-cover z-1`}
          autoPlay
          loop
          muted
          playsInline
        >
          {/*temporarily cut video for visual clarity - Daniel*/}
          {/*<source src={isMobile ? "/promo_vid_tall.mp4" : "/promo_vid_wide.mp4"}  type="video/mp4" />*/}
        </video>
        <div className="relative flex flex-col items-center justify-center h-full z-10">
          <p className="text-white text-[96px] font-bold">BEAVERHACKS</p>
          <p className="font-medium text-center text-white text-[24px] w-[35%] mb-5">Oregon’s Largest Hackathon presented by the Oregon State University Hackathon Club</p>
          <div className="flex justify-center">
            <a 
              href="" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-white py-3 px-6 rounded-[32px] bg-[#FF680B] font-medium border border-[#262626]"
            >
              <span>Register Here!</span>
            </a>
          </div>
        </div>
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

      {/*about page*/}
      <div ref={about} className = "py-16">
        <AboutPage/>
      </div>

      {/*sponsors page*/}
      <div ref={sponsors} className = "py-20">
        <SponsorPage/>
      </div>

      {/*FAQ page*/}
      <div ref={faq}>
        <FaqPage/>
      </div>
      <Footer></Footer>
    </>
  );
}

export default Home;