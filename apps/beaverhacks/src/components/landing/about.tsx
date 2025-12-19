import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Countdown } from "@/components/countdown";

function AboutPage() {
  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-4">
        <div className="backdrop-blur-sm p-6 rounded-xl border flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-3 flex gap-2">
            <Clock />
            Time Remaining
          </h3>
          <Countdown targetDate={new Date(1743883200 * 1000)} />
        </div>

        <div className="backdrop-blur-sm p-6 rounded-xl border">
          <h3 className="text-xl font-semibold mb-3 flex gap-2">
            <MapPin />
            Location
          </h3>
          <p className="text-lg font-medium">Kelley Engineering Center</p>
          <p className="text-muted-foreground">Oregon State University</p>
          <p className="text-muted-foreground">110 SW Park Terrace</p>
          <p className="text-muted-foreground">Corvallis, OR 97331</p>
        </div>

        <div className="backdrop-blur-sm p-6 rounded-xl border">
          <h3 className="text-xl font-semibold mb-3 flex gap-2">
            <Calendar />
            Schedule
          </h3>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Hacker Check-in</span>
              <span className="text-muted-foreground">Apr 5, 11:00 AM</span>
            </li>
            <li className="flex justify-between">
              <span>Opening Ceremony</span>
              <span className="text-muted-foreground">Apr 5, 12:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Hacking Begins</span>
              <span className="text-muted-foreground">Apr 5, 1:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Hacking Ends</span>
              <span className="text-muted-foreground">Apr 6, 1:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Judging</span>
              <span className="text-muted-foreground">Apr 6, 2:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Closing Ceremony</span>
              <span className="text-muted-foreground">Apr 6, 3:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Discord */}
        <div className="backdrop-blur-sm p-6 rounded-xl border">
          <h3 className="text-xl font-semibold mb-3 flex gap-2">
            <Users />
            Join Our Discord
          </h3>
          <p className="mb-4">
            Connect with fellow hackers, get support, and stay updated about the
            event.
          </p>

          <a
            href="https://discord.gg/zkuDhSgznE"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            <Image
              src="/images/discord.svg"
              width={20}
              height={20}
              alt="Discord logo"
              className="w-5 h-5"
            />
            <span>Join Discord Server</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
