import React from 'react';
import Image from "next/image";

function MobileAboutPage(){
    return(
        <div className="w-screen min-h-screen text-white flex flex-col items-center justify-center px-[16px]">
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
        </div>
    )
}

export default MobileAboutPage;