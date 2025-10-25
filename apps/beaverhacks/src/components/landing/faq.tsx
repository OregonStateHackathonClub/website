import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion"

function FaqPage(){
    return(
    <div className="w-screen h-screen flex flex-col items-center justify-center">
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
    )
}

export default FaqPage;