import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function MobileFAQ(){
    return(
    <div className="w-screen text-white flex flex-col items-center justify-center px-[16px]">
        <div className="text-center mb-[8px]">
            <div className="inline-block bg-white text-black px-6 py-2 rounded-[21px] mb-[4px]">
                <span className="font-bold text-[16px]">FAQ</span>
            </div>
            <h1 className="text-[30px] font-bold mb-[8px]">Frequently Asked Questions</h1>
            <div className="text-[20px] text-gray-300 leading-relaxed">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
        </div>
            <div className="flex w-screen justify-center">
            <h1 className="text-[20px] text-center font-bold w-1/2 mt-[32px] mb-[10px]">General</h1>
            </div>
          <div className="bg-[#171717] border-[#262626] border rounded-[16px] w-full mb-[32px]">
            <Accordion type="multiple" className="">
              <AccordionItem value="item-1" className="">
                <AccordionTrigger className=" text-lg flex w-full items-center justify-between px-4 py-5">What is a Hackathon?</AccordionTrigger>
                <AccordionContent className="px-4">
                  A coding competition where teams build innovative projects from scratch. Network with fellow developers, learn new skills, and compete for prizes. 
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="">
                <AccordionTrigger className=" text-lg flex w-full items-center justify-between px-4 py-5">What is BeaverHacks?</AccordionTrigger>
                <AccordionContent className="px-4">
                  BeaverHacks is the official Hackathon hosted by the Hackathon Club at Oregon State University.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-none">
                <AccordionTrigger className=" text-lg flex w-full items-center justify-between px-4 py-5 ">Who can come?</AccordionTrigger>
                <AccordionContent className="px-4">
                  Anyone currently enrolled in a college over the age of 18.
                </AccordionContent>
              </AccordionItem>
            </Accordion>  
          </div>
    </div>
)
}
export default MobileFAQ;