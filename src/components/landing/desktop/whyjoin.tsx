import React from "react";
import InfoCard from "@/components/infocard";

function WhyJoin(){
    return(
        <div className="w-screen h-screen flex flex-col items-center justify-center">
            <div className="text-center mb-12 max-w-4xl">
                <div className="mb-8">
                    <div className="inline-block bg-white text-black px-6 py-2 rounded-full mb-8">
                        <span className="font-bold">Why Join?</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-6">Why Participate in Beaverhacks?</h1>
                </div>
                <div className="text-xl text-gray-300 leading-relaxed">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
            </div>

            <div className="grid grid-cols-3 grid-rows-[auto_auto] gap-6 w-[80%]">
                <InfoCard
                title="Placeholder"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                />

                <InfoCard
                title="Placeholder"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                />

                <InfoCard
                title="Placeholder"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                />

                <InfoCard
                title="Placeholder"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                />

                <InfoCard
                title="Placeholder"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                />

                <InfoCard
                title="Placeholder"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                />
            </div>
        </div>
    )
}

export default WhyJoin;