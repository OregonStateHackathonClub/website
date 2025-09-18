import React from 'react';

function Footer(){
    return(
        <div className="w-full">
            <div className="grid grid-cols-12 gap-[20px] justify-center items-center mb-10">

                <div className="col-start-2 col-span-3 grid grid-rows-[auto_auto_auto] gap-3">
                    <p>Beaverhacks</p>
                    <p>Oregon's Largest Hackathon</p>
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