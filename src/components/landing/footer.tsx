import React from 'react';

function Footer(){
    return(
        <div className="w-full px-4 md:px-8">
            {/* Mobile Layout */}
            <div className="md:hidden flex flex-col items-center text-center gap-4 mb-10">
                <div className="space-y-2">
                    <p className="text-lg font-semibold">Beaverhacks</p>
                    <p className="text-gray-300">Oregon&apos;s Largest Hackathon</p>
                    <p className="text-gray-300">Socials</p>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full max-w-sm">
                    <div className="space-y-1">
                        <p className="font-bold">Quick Links</p>
                        <p className="text-gray-300">About</p>
                        <p className="text-gray-300">Why Participate</p>
                        <p className="text-gray-300">Sponsors</p>
                        <p className="text-gray-300">FAQ</p>
                    </div>

                    <div className="space-y-1">
                        <p className="font-bold">Company</p>
                        <p className="text-gray-300">Beaverhacks Next</p>
                        <p className="text-gray-300">Beaverhacks Career</p>
                        <p className="text-gray-300">Sponsor Us</p>
                        <p className="text-gray-300">Contact</p>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-12 gap-[20px] justify-center items-center mb-10">
                <div className="col-start-2 col-span-3 grid grid-rows-[auto_auto_auto] gap-3">
                    <p>Beaverhacks</p>
                    <p>Oregon&apos;s Largest Hackathon</p>
                    <p>Socials</p>
                </div>

                <div className='col-start-9 col-span-2 grid grid-rows-[auto_auto_auto_auto_auto] gap-1'>
                    <p className='font-bold'>Quick Links</p>
                    <p>About</p>
                    <p>Why Participate</p>
                    <p>Sponsors</p>
                    <p>FAQ</p>
                </div>

                <div className='col-start-11 col-span-2 grid grid-rows-[auto_auto_auto_auto_auto] gap-1'>
                    <p className='font-bold'>Company</p>
                    <p>Beaverhacks Next</p>
                    <p>Beaverhacks Career</p>
                    <p>Sponsor Us</p>
                    <p>Contact</p>
                </div>
            </div>
        </div>
    )
}

export default Footer;