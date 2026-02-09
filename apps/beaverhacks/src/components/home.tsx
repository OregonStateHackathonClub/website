"use client";

import { useState, useRef, useEffect } from "react";
import type { Page } from "@/components/navbar";
import { Ascii } from "@/components/ascii";

type HistoryEntry = {
  command: string;
  output?: React.ReactNode;
  timestamp: Date;
};

const COMMANDS = [
  "beavfetch",
  "home",
  "sponsors",
  "faq",
  "register",
  "clear",
  "help",
  "whoami",
  "date",
  "fortune",
  "credits",
];

const FORTUNES = [
  "A hackathon a day keeps the boredom away.",
  "In the land of bugs, the debugger is king.",
  "You will write code that works on the first try. (Just kidding.)",
  "A merge conflict is just a conversation waiting to happen.",
  "The best time to start coding was yesterday. The next best time is now.",
  "404: Fortune not found. Try again after coffee.",
  "git commit -m 'it works, don't touch it'",
  "Your next side project will definitely be finished. Trust.",
];

const MOTD = () => (
  <div className="mb-4 text-[10px] md:text-xs">
    <pre className="text-amber-bright text-glow-base font-primary text-[14px] leading-[13px]">
      {`    ____  ___________ _    ____________  __  _____   ________ _______
   / __ )/ ____/   | | |  / / ____/ __ \\/ / / /   | / ____/ //_/ ___/
  / __  / __/ / /| | | | / / __/ / /_/ / /_/ / /| |/ /   / ,<  \\__ \\
 / /_/ / /___/ ___ | | |/ / /___/ _, _/ __  / ___ / /___/ /| |___/ /
/_____/_____/_/  |_| |___/_____/_/ |_/_/ /_/_/  |_\\____/_/ |_/____/`}
    </pre>
    <div className="mt-2 pl-1 space-y-0.5 text-amber-dim">
      <p>
        Welcome to <span className="text-amber-bright">BeaverHacks 2026</span>{" "}
        Terminal v1.0.0
      </p>
      <p>Oregon State University&apos;s Premier Hackathon</p>
      <p className="text-amber-muted">
        Type &apos;<span className="text-amber-normal">help</span>&apos; for
        available commands
      </p>
    </div>
    <div className="mt-2 text-amber-muted border-l-2 border-amber-muted/30 ml-1 pl-2">
      <p>
        <span className="text-amber-dim">Date:</span> April 18-19, 2026
      </p>
      <p>
        <span className="text-amber-dim">Location:</span> TBD
      </p>
      <p>
        <span className="text-amber-dim">Status:</span>{" "}
        <span className="text-green-500">Registration Open</span>
      </p>
    </div>
  </div>
);

const BeavfetchOutput = () => (
  <div className="flex gap-4 md:gap-6 items-start py-1">
    <div className="shrink-0">
      <Ascii fontSize="text-[10px]" leading="leading-[0.8]" />
    </div>
    <div className="text-[10px] md:text-xs font-secondary min-w-0">
      <p className="text-amber-bright text-glow-base font-bold">
        hacker<span className="text-amber-dim">@</span>beaverhacks
      </p>
      <p className="text-amber-muted tracking-tight">─────────────────────</p>
      <div className="space-y-0.5 mt-1">
        <p>
          <span className="text-amber-bright">OS</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">BeaverOS 2026.04</span>
        </p>
        <p>
          <span className="text-amber-bright">Host</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">TBD</span>
        </p>
        <p>
          <span className="text-amber-bright">Kernel</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">6.9.0-hackathon</span>
        </p>
        <p>
          <span className="text-amber-bright">Uptime</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">24 hours</span>
        </p>
        <p>
          <span className="text-amber-bright">Packages</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">500+ (hackers)</span>
        </p>
        <p>
          <span className="text-amber-bright">Shell</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">beavsh 1.0</span>
        </p>
        <p>
          <span className="text-amber-bright">Terminal</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">beaverhacks-term</span>
        </p>
        <p>
          <span className="text-amber-bright">CPU</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">Caffeine Powered @ 3.0GHz</span>
        </p>
        <p>
          <span className="text-amber-bright">Memory</span>
          <span className="text-amber-dim">:</span>{" "}
          <span className="text-amber-normal">$10,000+ (prizes)</span>
        </p>
      </div>
      <p className="mt-2">
        <span className="text-amber-muted">░░░</span>
        <span className="text-amber-dim">▒▒▒</span>
        <span className="text-amber-normal">▓▓▓</span>
        <span className="text-amber-bright">███</span>
      </p>
    </div>
  </div>
);

const HelpOutput = () => (
  <div className="text-[10px] md:text-xs py-1">
    <div className="border border-amber-muted/30 bg-amber-muted/5">
      <div className="border-b border-amber-muted/30 px-2 py-1 bg-amber-muted/10">
        <span className="text-amber-bright font-bold">
          BEAVERHACKS TERMINAL
        </span>
        <span className="text-amber-dim"> - Available Commands</span>
      </div>
      <div className="p-2 space-y-2">
        <div>
          <p className="text-amber-bright mb-1">Navigation</p>
          <div className="pl-2 space-y-0.5 text-amber-muted">
            <p>
              <span className="text-amber-normal w-20 inline-block">home</span>{" "}
              Navigate to home
            </p>
            <p>
              <span className="text-amber-normal w-20 inline-block">
                sponsors
              </span>{" "}
              View sponsors
            </p>
            <p>
              <span className="text-amber-normal w-20 inline-block">faq</span>{" "}
              Frequently asked questions
            </p>
            <p>
              <span className="text-amber-normal w-20 inline-block">
                register
              </span>{" "}
              Open registration form
            </p>
          </div>
        </div>
        <div>
          <p className="text-amber-bright mb-1">System</p>
          <div className="pl-2 space-y-0.5 text-amber-muted">
            <p>
              <span className="text-amber-normal w-20 inline-block">
                beavfetch
              </span>{" "}
              Display system info
            </p>
            <p>
              <span className="text-amber-normal w-20 inline-block">
                whoami
              </span>{" "}
              Display current user
            </p>
            <p>
              <span className="text-amber-normal w-20 inline-block">date</span>{" "}
              Display current date/time
            </p>
            <p>
              <span className="text-amber-normal w-20 inline-block">clear</span>{" "}
              Clear terminal
            </p>
            <p>
              <span className="text-amber-normal w-20 inline-block">
                credits
              </span>{" "}
              Meet the team
            </p>
          </div>
        </div>
        <div>
          <p className="text-amber-bright mb-1">Fun</p>
          <div className="pl-2 space-y-0.5 text-amber-muted">
            <p>
              <span className="text-amber-normal w-20 inline-block">
                fortune
              </span>{" "}
              Get a random fortune
            </p>
            <p>
              <span className="text-amber-normal w-20 inline-block">help</span>{" "}
              Show this help message
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TeamOutput = () => (
  <div className="text-[10px] md:text-xs py-1 font-secondary">
    <pre className="text-amber-bright">{`
╭─ LEADERSHIP ─────────────────────────────────────╮`}</pre>
    <pre className="text-amber-normal">{`│  Havel Kondah        President                   │
│  Owen Krause         Vice President              │
│  Violette Davis      Marketing Director          │
│  Caleb Chia          Production Director         │
│  Joshua Chilango     Financial Director          │`}</pre>
    <pre className="text-amber-bright">{`╰──────────────────────────────────────────────────╯

╭─ MARKETING ──────────────────────────────────────╮`}</pre>
    <pre className="text-amber-normal">{`│  Ally Chen     Alyssa       Ben                  │
│  Claire        Kiarra       Zakia                │`}</pre>
    <pre className="text-amber-bright">{`╰──────────────────────────────────────────────────╯

╭─ EVENTS ─────────────────────────────────────────╮`}</pre>
    <pre className="text-amber-normal">{`│  Ireland       Joshua                            │`}</pre>
    <pre className="text-amber-bright">{`╰──────────────────────────────────────────────────╯

╭─ DEVELOPERS ─────────────────────────────────────╮`}</pre>
    <pre className="text-amber-normal">{`│  Lukas Sueffert      Lead                        │
│  Noam Yaffe          Lead                        │
│  Aadarsh      Brandon      Faith                 │
│  Kishore      Pedro        Stanley               │`}</pre>
    <pre className="text-amber-bright">{`╰──────────────────────────────────────────────────╯`}</pre>
  </div>
);

type HomeProps = {
  onNavigateAction: (page: Page) => void;
};

export const Home = ({ onNavigateAction }: HomeProps) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showMotd, setShowMotd] = useState(true);
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const timestamp = new Date();

    switch (trimmed) {
      case "beavfetch":
        setHistory((prev) => [
          ...prev,
          { command: cmd, output: <BeavfetchOutput />, timestamp },
        ]);
        break;
      case "home":
        setHistory((prev) => [...prev, { command: cmd, timestamp }]);
        onNavigateAction("home");
        break;
      case "sponsors":
      case "sponsor":
        setHistory((prev) => [...prev, { command: cmd, timestamp }]);
        onNavigateAction("sponsors");
        break;
      case "faq":
        setHistory((prev) => [...prev, { command: cmd, timestamp }]);
        onNavigateAction("faq");
        break;
      case "register":
        setHistory((prev) => [...prev, { command: cmd, timestamp }]);
        window.location.href = "/apply";
        break;
      case "clear":
        setHistory([]);
        setShowMotd(false);
        break;
      case "help":
        setHistory((prev) => [
          ...prev,
          { command: cmd, output: <HelpOutput />, timestamp },
        ]);
        break;
      case "whoami":
        setHistory((prev) => [
          ...prev,
          {
            command: cmd,
            output: (
              <p className="text-amber-normal text-xs py-1">
                <span className="text-amber-bright">hacker</span>
                <span className="text-amber-dim">@</span>
                <span className="text-amber-bright">beaverhacks</span>
                <span className="text-amber-muted">
                  {" "}
                  (future hackathon winner)
                </span>
              </p>
            ),
            timestamp,
          },
        ]);
        break;
      case "date":
        setHistory((prev) => [
          ...prev,
          {
            command: cmd,
            output: (
              <p className="text-amber-normal text-xs py-1">
                {new Date().toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZoneName: "short",
                })}
              </p>
            ),
            timestamp,
          },
        ]);
        break;
      case "fortune":
        const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        setHistory((prev) => [
          ...prev,
          {
            command: cmd,
            output: (
              <div className="text-xs py-1 pl-2 border-l-2 border-amber-dim/50">
                <p className="text-amber-normal italic">
                  &ldquo;{fortune}&rdquo;
                </p>
              </div>
            ),
            timestamp,
          },
        ]);
        break;
      case "credits":
        setHistory((prev) => [
          ...prev,
          { command: cmd, output: <TeamOutput />, timestamp },
        ]);
        break;
      case "":
        break;
      default:
        setHistory((prev) => [
          ...prev,
          {
            command: cmd,
            output: (
              <div className="text-xs py-1">
                <p className="text-red-400">
                  bash: {trimmed}: command not found
                </p>
                <p className="text-amber-muted">
                  Type &apos;<span className="text-amber-normal">help</span>
                  &apos; for available commands
                </p>
              </div>
            ),
            timestamp,
          },
        ]);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Simple tab completion
      const matches = COMMANDS.filter((cmd) =>
        cmd.startsWith(input.toLowerCase()),
      );
      if (matches.length === 1) {
        setInput(matches[0]);
      }
    }
  };

  const Prompt = ({
    children,
    time,
  }: {
    children?: React.ReactNode;
    time?: Date;
  }) => (
    <div className="flex items-start gap-2 text-[11px] md:text-xs">
      {time && (
        <span className="text-amber-muted/50 shrink-0 text-[9px] md:text-[10px] pt-0.5">
          {formatTime(time)}
        </span>
      )}
      <div className="flex items-center gap-0 shrink-0">
        <span className="bg-amber-bright/90 text-screen-dark px-1.5 font-bold text-[10px]">
          hacker
        </span>
        <span className="text-amber-bright/90"></span>
        <span className="bg-amber-dim/30 text-amber-normal px-1.5 text-[10px]">
          ~/beaverhacks
        </span>
        <span className="text-amber-dim/30"></span>
      </div>
      <span className="text-amber-muted">$</span>
      <span className="text-amber-normal break-all">{children}</span>
    </div>
  );

  const HistoryItem = ({ entry }: { entry: HistoryEntry }) => (
    <div className="pb-2">
      <Prompt time={entry.timestamp}>{entry.command}</Prompt>
      {entry.output && <div className="pl-0 md:pl-14 mt-1">{entry.output}</div>}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto scrollbar-hide font-secondary"
      onClick={handleClick}
    >
      <div className="flex flex-col gap-2">
        {showMotd && <MOTD />}

        {history.map((entry, i) => (
          <HistoryItem key={i} entry={entry} />
        ))}

        <div className="relative cursor-text shrink-0">
          <Prompt time={new Date()}>
            {input}
            <span className="inline-flex items-center">
              <span className="-translate-y-px text-[10px] animate-blink">
                █
              </span>
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
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};
