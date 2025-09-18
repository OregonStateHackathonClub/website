import React from 'react';
import { Clock, MapPin, Calendar, Users } from "lucide-react";
import { Countdown } from "@/components/countdown";
import Image from "next/image";

function MobileAboutPage(){
    return(
        <div className="w-screen text-white flex flex-col items-center justify-center px-[16px]">
            <div className="text-center mb-12">
                <div className="mb-[8px]">
                    <div className="inline-block bg-white text-black px-6 py-2 rounded-[21px] mb-[4px]">
                        <span className="font-bold text-[16px]">About</span>
                    </div>
                    <h1 className="text-[30px] font-bold">What is BeaverHacks?</h1>
                </div>

                <div className="text-[20px] text-gray-300 leading-relaxed">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
            </div>

            <div className='grid grid-cols-2 items-center justify-center gap-y-[16px] gap-x-[8px]'>
                {/* Event Countdown */}
                <div className="col-span-2 bg-[#171717] border-[#262626] border p-6 rounded-[32px] h-[186px] w-[343px]">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-white mb-8 justify-center">
                        <Clock className="w-5 h-5"/>
                        Event Countdown
                    </h3>
                    <Countdown targetDate={new Date(1743883200 * 1000)} />
                </div>

                {/*Schedule*/}
                <div className="col-span-2 bg-[#171717] border-[#262626] border p-6 rounded-[32px] h-[267px] w-[343px]">
                    <h3 className="text-xl font-semibold justify-center mb-4 flex items-center gap-2 text-white">
                    <Calendar className="w-5 h-5" />
                    Schedule
                    </h3>
                    {/*Ugly AF, put into it's own component sooner rather than later - Daniel*/}
                    <ul className="space-y-[8px]">
                    <li className="flex justify-between items-center">
                        <span className="text-white">Hacker Check-In</span>
                        <span className="text-gray-400 font-mono text-sm">Apr 5, 11:00 AM</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-white">Opening Ceremony</span>
                        <span className="text-gray-400 font-mono text-sm">Apr 5, 12:00 PM</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-white">Hacking Begins</span>
                        <span className="text-gray-400 font-mono text-sm">Apr 5, 1:00 PM</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-white">Hacking Ends</span>
                        <span className="text-gray-400 font-mono text-sm">Apr 6, 1:00 PM</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-white">Judging</span>
                        <span className="text-gray-400 font-mono text-sm">Apr 6, 2:00 PM</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-white">Closing Ceremony</span>
                        <span className="text-gray-400 font-mono text-sm">Apr 6, 3:00 PM</span>
                    </li>
                    </ul>
                </div>

                {/*Location*/}
                <div className="col-span-2 bg-[#171717] border-[#262626] border backdrop-blur-sm p-[16px] rounded-[32px] h-[359px] w-[343px]">
                    <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2 text-white">
                    <MapPin className="w-5 h-5" />
                    Location
                    </h3>
                    <div className="mb-4 text-center h-[104px]">
                        <p className="text-lg font-medium text-white">Kelley Engineering Center</p>
                        <p className="text-white">Oregon State University</p>
                        <p className="text-white">110 SW Park Terrace</p>
                        <p className="text-white">Corvallis, OR 97331</p>
                    </div>

                    <div className="bg-gray-700 h-[160px] flex items-center justify-center">
                        <span className="text-gray-400">Map placeholder</span>
                    </div>
                </div>

                {/*Discord*/}
                <div className="col-span-1 bg-[#171717] border-[#262626] border p-6 rounded-[32px] w-[167.5px]">
                    <h3 className="text-xl font-semibold mb-4 justify-center flex items-center gap-2 text-white">
                    <Users className="w-5 h-5" />
                    Updates
                    </h3>
                    <p className="text-center mb-4 text-gray-300">Join the BeaverHacks Discord to hear all the latest news!</p>
                    <div className="flex justify-center">
                    <a 
                        href="https://discord.gg/zkuDhSgznE" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-[32px] transition-colors font-medium"
                    >
                    <Image
                        src="/images/discord.svg"
                        width={20}
                        height={20}
                        alt="Discord logo"
                        className="w-5 h-5"
                        />
                        <span>Discord</span>
                    </a>
                    </div>
                </div>

                {/*Workshop*/}
                <div className="col-span-1 bg-[#171717] border-[#262626] border p-6 rounded-[32px] items-center w-[167.5px]">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white justify-center">
                    Workshops
                    </h3>
                    <p className="text-center mb-4 text-gray-300">OSU students are eligible to sign-up for supplementary workshops!</p>
                    <div className="flex justify-center">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-[32px] transition-colors font-medium">
                        Register
                    </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MobileAboutPage;