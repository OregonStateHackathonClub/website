"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";

const FAQ_DATA = [
  {
    id: "what-is-beaverhacks",
    question: "What is BeaverHacks?",
    answer:
      "BeaverHacks is Oregon State University's premier hackathon event. It's a 24-hour coding competition where students come together to build innovative projects, learn new technologies, and compete for prizes.",
  },
  {
    id: "who-can-participate",
    question: "Who can participate?",
    answer:
      "BeaverHacks is open to all university students, regardless of major or experience level. Whether you're a seasoned developer or just starting out, you're welcome to join!",
  },
  {
    id: "cost",
    question: "How much does it cost?",
    answer:
      "BeaverHacks is completely free to attend! We provide meals, snacks, and swag throughout the event.",
  },
  {
    id: "team-size",
    question: "What is the team size?",
    answer:
      "Teams can have up to 4 members. You can register solo and find teammates at the event, or come with a pre-formed team.",
  },
  {
    id: "what-to-bring",
    question: "What should I bring?",
    answer:
      "Bring your laptop, charger, and any hardware you want to hack with. We recommend also bringing toiletries, a sleeping bag or blanket if you plan to rest, and a refillable water bottle.",
  },
  {
    id: "experience",
    question: "Do I need coding experience?",
    answer:
      "No prior experience is required! We have workshops and mentors available to help beginners get started. Hackathons are a great way to learn!",
  },
];

export const Faq = () => (
  <div className="font-secondary text-sm md:text-base h-full flex flex-col">
    <div className="flex-1 min-h-0">
      <div className="flex justify-between text-amber-dim mb-4 text-xs md:text-sm">
        <span>FAQ(1)</span>
        <span>BEAVERHACKS MANUAL</span>
        <span>FAQ(1)</span>
      </div>

      <section className="mb-4">
        <h2 className="text-amber-bright text-glow-base font-bold">NAME</h2>
        <p className="text-amber-normal pl-8">
          faq - frequently asked questions about BeaverHacks
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-amber-bright text-glow-base font-bold">
          DESCRIPTION
        </h2>
        <p className="text-amber-normal pl-8">
          Click any question below to expand the answer.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-amber-bright text-glow-base font-bold">
          QUESTIONS
        </h2>
        <div className="pl-8">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_DATA.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-b border-amber-muted/25"
              >
                <AccordionTrigger className="text-amber-normal hover:text-amber-bright hover:text-glow-base transition-all py-3 text-left [&>svg]:text-amber-dim [&>svg]:hover:text-amber-bright">
                  <span>
                    <span className="text-amber-dim mr-2">&gt;</span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-amber-normal/80 pl-6 pr-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>

    <div className="flex justify-between text-amber-dim pt-4 text-xs md:text-sm border-t border-amber-muted/25 shrink-0">
      <span>BeaverHacks 2026</span>
      <span>April 17-18</span>
      <span>FAQ(1)</span>
    </div>
  </div>
);
