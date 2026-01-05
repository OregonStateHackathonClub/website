"use client";

import { useState } from "react";

const FAQ_DATA = [
  {
    id: "what-is-beaverhacks",
    tag: "about",
    question: "What is BeaverHacks?",
    answer:
      "BeaverHacks is Oregon State University's premier hackathon event. It's a 24-hour coding competition where students come together to build innovative projects, learn new technologies, and compete for prizes.",
  },
  {
    id: "who-can-participate",
    tag: "eligibility",
    question: "Who can participate?",
    answer:
      "BeaverHacks is open to all university students, regardless of major or experience level. Whether you're a seasoned developer or just starting out, you're welcome to join!",
  },
  {
    id: "cost",
    tag: "registration",
    question: "How much does it cost?",
    answer:
      "BeaverHacks is completely free to attend! We provide meals, snacks, and swag throughout the event.",
  },
  {
    id: "team-size",
    tag: "teams",
    question: "What is the team size?",
    answer:
      "Teams can have up to 4 members. You can register solo and find teammates at the event, or come with a pre-formed team.",
  },
  {
    id: "what-to-bring",
    tag: "checklist",
    question: "What should I bring?",
    answer:
      "Bring your laptop, charger, and any hardware you want to hack with. We recommend also bringing toiletries, a sleeping bag or blanket if you plan to rest, and a refillable water bottle.",
  },
  {
    id: "experience",
    tag: "beginners",
    question: "Do I need coding experience?",
    answer:
      "No prior experience is required! We have workshops and mentors available to help beginners get started. Hackathons are a great way to learn!",
  },
];

export const Faq = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="font-secondary text-[10px] md:text-xs h-full flex flex-col overflow-hidden">
      {/* Vim help header */}
      <div className="shrink-0 border-b border-amber-muted/30 pb-2 mb-3">
        <div className="flex items-center justify-between text-amber-muted">
          <span>
            <span className="text-amber-dim">:h</span> beaverhacks-faq
          </span>
          <span className="text-amber-muted/50">*faq.txt*</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {/* Questions */}
        <div className="space-y-1">
          {FAQ_DATA.map((faq, index) => {
            const isExpanded = expanded === faq.id;
            const lineNum = (index + 1) * 10;

            return (
              <div key={faq.id} className="group">
                {/* Question header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : faq.id)}
                  className="w-full text-left flex items-start gap-2 py-1 hover:bg-amber-muted/5 transition-all"
                >
                  {/* Line number */}
                  <span className="text-amber-muted/30 w-6 text-right shrink-0 select-none">
                    {lineNum}
                  </span>

                  {/* Fold indicator */}
                  <span className="text-amber-dim shrink-0 w-4">
                    {isExpanded ? "▾" : "▸"}
                  </span>

                  {/* Tag */}
                  <span className="shrink-0 text-amber-dim">
                    *{faq.tag}*
                  </span>

                  {/* Question */}
                  <span className={`${isExpanded ? "text-amber-bright" : "text-amber-normal group-hover:text-amber-bright"} transition-all`}>
                    {faq.question}
                  </span>
                </button>

                {/* Answer (collapsible) */}
                {isExpanded && (
                  <div className="flex gap-2 py-2">
                    <span className="text-amber-muted/30 w-6 text-right shrink-0">
                      {lineNum + 1}
                    </span>
                    <span className="w-4 shrink-0" />
                    <p className="text-amber-normal/80 leading-relaxed pl-1 border-l border-amber-muted/30">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-amber-muted/20">
          <div className="flex gap-2 text-amber-muted">
            <span className="text-amber-muted/30 w-6 text-right shrink-0">99</span>
            <span className="w-4 shrink-0" />
            <span className="text-amber-dim">
              vim: tw=78 ts=8 ft=help norl
            </span>
          </div>
        </div>
      </div>

      {/* Status line */}
      <div className="shrink-0 flex items-center justify-between border-t border-amber-muted/30 pt-2 mt-2 text-[9px] md:text-[10px]">
        <div className="flex items-center gap-2">
          <span className="bg-amber-bright/90 text-screen-dark px-1.5 font-bold">HELP</span>
          <span className="text-amber-bright/90"></span>
          <span className="text-amber-dim">faq.txt</span>
        </div>
        <div className="flex items-center gap-3 text-amber-muted">
          <span>{FAQ_DATA.length} questions</span>
          <span className="text-amber-muted/50">│</span>
          <span>utf-8</span>
        </div>
      </div>
    </div>
  );
};
