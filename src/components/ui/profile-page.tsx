"use client"

import Link from "next/link";
import { useState } from "react";

export default function ProfilePage({ name }: { name: string }) {

    // these are placeholder variables that will be accessible from the user's personal data in the future
    const [applicationStarted, setApplicationStarted] = useState(false);
    const [applicationSubmitted, setApplicationSubmitted] = useState(false);

    return (
        <section>
            {applicationSubmitted ?
                <div className="text-center">
                    <pre className="text-xs sm:text-base font-mono">
                        {`
____________________________________________
/                                             \\
|  Welcome back, ${name}!                   ${' '.repeat(Math.max(0, 10 - name.length))}|
|  Thank you for applying to BeaverHacks       |
|  2026! Your submission has been recorded.    |
\\_____________________________________________/
                                  |  /
                                  | /
                                  |/`}
                    </pre>
                    { /* Potential idea: re-route to a page where a user can check their application status (whether they got in, waiting on results, etc.) */}
                    <button onClick={(e) => { setApplicationStarted(true) }} className="mt-5 py-2 px-4 border rounded-lg hover:cursor-pointer hover:border-gray-500 transition duration-200">
                        <p className="font-mono">Check Application Status</p>
                    </button>
                </div>
                :
                <div>
                    {!applicationStarted ?
                        <div className="text-center">
                            <pre className="text-xs sm:text-base font-mono">
                                {`
________________________________________
/                                          \\
|  Hey there, ${name}!                   ${' '.repeat(Math.max(0, 10 - name.length))}|
|  You may now register for the upcoming    |
|  BeaverHacks 2026!                        |
\\__________________________________________/
                                  |  /
                                  | /
                                  |/`}
                            </pre>
                            <Link href="../../register">
                                <button onClick={(e) => { setApplicationStarted(true) }} className="mt-5 py-2 px-4 border rounded-lg hover:cursor-pointer hover:border-gray-500 transition duration-200">
                                    <p className="font-mono">Start Application</p>
                                </button>
                            </Link>
                        </div>
                        :
                        <div className="text-center">
                            <pre className="text-xs sm:text-base font-mono">
                                {`
________________________________________
/                                          \\
|  Welcome back, ${name}!                ${' '.repeat(Math.max(0, 10 - name.length))}|
|  Please continue your registration for    |
|  BeaverHacks 2026!                        |
\\__________________________________________/
                                  |  /
                                  | /
                                  |/`}
                            </pre>
                            <button className="mt-5 py-2 px-4 border rounded-lg hover:cursor-pointer hover:border-gray-500 transition duration-200">
                                <p className="font-mono">Continue Application</p>
                            </button>
                        </div>
                    }
                </div>
            }

        </section>
    )
}