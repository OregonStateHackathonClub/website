"use client";

import { useState, useRef, useEffect } from "react";
import { Ascii } from "@/components/ascii";
import type { Page } from "@/components/navbar";

type HistoryEntry = {
  command: string;
  output?: string[];
  type?: "text" | "beavfetch";
};

const HELP_OUTPUT = [
  "USAGE",
  "  <command> [options]",
  "",
  "COMMANDS",
  "  beavfetch    display system info",
  "  home         navigate to home dir",
  "  sponsors     navigate to sponsors dir",
  "  faq          navigate to faq dir",
  "  register     open registration form",
  "  clear        clear terminal history",
  "  help         show this message",
];

const BeavfetchOutput = () => (
  <div className="flex gap-8 items-center">
    <Ascii />
    <div className="text-sm md:text-base">
      <p className="text-amber-bright text-glow-base">
        2026<span className="text-amber-dim">@</span>beaverhacks
      </p>
      <p className="text-amber-bright tracking-[-0.2em]">
        ------------------------
      </p>
      <div className="space-y-0.5">
        <p>
          <span className="text-amber-bright">Date</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">April 17-18, 2026</span>
        </p>
        <p>
          <span className="text-amber-bright">Location</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">Kelley Engineering Center</span>
        </p>
        <p>
          <span className="text-amber-bright">Hackers</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">500+</span>
        </p>
        <p>
          <span className="text-amber-bright">Duration</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">24 Hours</span>
        </p>
        <p>
          <span className="text-amber-bright">Prizes</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">$10k+</span>
        </p>
      </div>
      <p className="mt-3">
        <span className="text-amber-muted">░░░</span>
        <span className="text-amber-dim">▒▒▒</span>
        <span className="text-amber-normal">▓▓▓</span>
        <span className="text-amber-bright">███</span>
      </p>
    </div>
  </div>
);

const INITIAL_HISTORY: HistoryEntry[] = [
  { command: "beavfetch", type: "beavfetch" },
];

type HomeProps = {
  onNavigateAction: (page: Page) => void;
};

export const Home = ({ onNavigateAction }: HomeProps) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(INITIAL_HISTORY);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    switch (trimmed) {
      case "beavfetch":
        setHistory((prev) => [...prev, { command: cmd, type: "beavfetch" }]);
        break;
      case "home":
        onNavigateAction("home");
        break;
      case "sponsors":
      case "sponsor":
        onNavigateAction("sponsors");
        break;
      case "faq":
        onNavigateAction("faq");
        break;
      case "register":
        window.location.href = "/apply";
        break;
      case "clear":
        setHistory([]);
        break;
      case "help":
        setHistory((prev) => [...prev, { command: cmd, output: HELP_OUTPUT }]);
        break;
      case "":
        break;
      default:
        setHistory((prev) => [
          ...prev,
          {
            command: cmd,
            output: [
              `command not found: ${trimmed}`,
              "type 'help' for available commands",
            ],
          },
        ]);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input);
    }
  };

  const Prompt = ({ children }: { children?: React.ReactNode }) => (
    <div className="text-amber-bright text-glow-base break-all">
      2026<span className="text-amber-dim">@</span>beaverhacks ~ # {children}
    </div>
  );

  const HistoryItem = ({ entry }: { entry: HistoryEntry }) => (
    <div className="pb-2">
      <Prompt>
        <span className="text-amber-normal">{entry.command}</span>
      </Prompt>
      {entry.type === "beavfetch" ? (
        <BeavfetchOutput />
      ) : entry.output ? (
        <pre className="text-amber-normal text-sm mt-1 font-secondary whitespace-pre">
          {entry.output.join("\n")}
        </pre>
      ) : null}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="h-full overflow-hidden font-secondary"
      onClick={handleClick}
    >
      <div className="flex flex-col gap-2">
        {history.map((entry, i) => (
          <HistoryItem key={i} entry={entry} />
        ))}

        <div className="relative cursor-text shrink-0">
          <Prompt>
            <span className="text-amber-normal">{input}</span>
            <span className="inline-flex items-center">
              <span className="-translate-y-px text-xs animate-blink">█</span>
            </span>
          </Prompt>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute top-0 left-0 opacity-0 w-full h-full cursor-text"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
