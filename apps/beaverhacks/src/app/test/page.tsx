"use client";

import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Ascii } from "@/components/ascii";

const Test = () => {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        ((document.documentElement.scrollTop || document.body.scrollTop) /
          ((document.documentElement.scrollHeight ||
            document.body.scrollHeight) -
            document.documentElement.clientHeight)) *
        100;

      if (scrollPercent < 40) {
        setSelected(null);
      } else if (scrollPercent < 45) {
        setSelected(0);
      } else if (scrollPercent < 50) {
        setSelected(1);
      } else if (scrollPercent < 55) {
        setSelected(2);
      } else {
        setSelected(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // return <Loading />

  return (
    <div className="bg-[#262624]">
      <div className="w-screen h-screen relative">
        <div className="fixed w-full text-white/90 px-5 py-4 flex justify-between z-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold">BEAVERHACKS</h1>
            <h2>About</h2>
            <h2>Logistics</h2>
            <h2>Sponsors</h2>
          </div>

          <svg
            width="160"
            height="50"
            viewBox="-1 -1 130 42"
            className="cursor-pointer"
          >
            <path
              d="M6 4Q0 4 0 10M0 10V34q0 6 6 6h98q6 0 10-4l10-10q4-4 4-10V10q0-6-6-6H6"
              fill="#9d5839"
            />
            <g
              className="transition-all duration-100"
              style={{ transform: "translateY(0)" }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "translateY(4px)")
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <path
                d="M6 0Q0 0 0 6M0 6V30q0 6 6 6h98q6 0 10-4l10-10q4-4 4-10V6q0-6-6-6H6"
                fill="#D97757"
                stroke="#E89070"
                strokeWidth=".5"
                className="hover:fill-[#E08565] transition-all duration-200"
              />
              <g transform="translate(100,24) rotate(-135) scale(0.7)">
                <path
                  d="M 0 12 L 11 1 M 0 13 L 0 0 M 0 12 L 11 12"
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
              <text
                className="fill-white uppercase font-semibold text-sm"
                x="48"
                y="19"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                Register
              </text>
            </g>
          </svg>
        </div>
        <Ascii />
      </div>

      <div className="w-screen h-screen">
        <h1 className="px-5 pt-40 text-7xl">LOGISTICS</h1>
        <div className="grid grid-cols-3 items-center px-5">
          <ul className="flex gap-10 flex-col text-3xl text-white/20">
            <li className={cn(selected === 0 && "text-white/80")}>Location</li>
            <li className={cn(selected === 1 && "text-white/80")}>Sponsors</li>
            <li className={cn(selected === 2 && "text-white/80")}>FAQ</li>
          </ul>

          <div className="col-span-2">
            <ul className="flex gap-10 flex-col text-3xl text-white/20">
              <li className={cn(selected === 0 ? "text-white/80" : "hidden")}>
                <Image
                  className="rounded-lg"
                  src="/map.png"
                  width={512}
                  height={256}
                  alt="map"
                />
              </li>
              <li className={cn(selected === 1 ? "text-white/80" : "hidden")}>
                Sponsors
              </li>
              <li className={cn(selected === 2 ? "text-white/80" : "hidden")}>
                FAQ
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <h1 className="text-5xl text-white mb-10">SPONSORS</h1>
        <div className="w-full max-w-6xl overflow-hidden relative">
          <div className="flex animate-[marquee_20s_linear_infinite] gap-8">
            {[
              "Sponsor 1",
              "Sponsor 2",
              "Sponsor 3",
              "Sponsor 4",
              "Sponsor 5",
              "Sponsor 6",
              "Sponsor 1",
              "Sponsor 2",
              "Sponsor 3",
              "Sponsor 4",
              "Sponsor 5",
              "Sponsor 6",
            ].map((sponsor, index) => (
              <div key={index} className="shrink-0">
                <div className="bg-white/10 rounded-lg p-6 min-w-[200px] flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {sponsor}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-[#262624] to-transparent pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-[#262624] to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default Test;
