'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "better-auth";

export default function ProfilePage({ name, email }: { name: string, email: string }) {

    // this is variable will be accessible from the user's personal data in the future
    const [applicationSubmitted, setApplicationSubmitted] = useState(false);

    useEffect(() => {
        const getApplicationStatus = async () => {
            try {
                const response = await fetch("/api/application-status", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.application) {
                        const { applicationSubmitted } = data.application;
                        setApplicationSubmitted(applicationSubmitted);
                    }
                }
            } catch (error) {
                console.error("Failed to load application data:", error);
            }
        }
        getApplicationStatus();
    }, [])

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
\\ ___________________________________________ /
                                  |  /
                                  | /
                                  |/`}
                    </pre>
                </div>
                :
                <div className="text-center">
                    <pre className="text-xs sm:text-base font-mono">
                        {`
________________________________________
/                                          \\
|  Hey there, ${name}!                   ${' '.repeat(Math.max(0, 10 - name.length))}|
|  You may now register for the upcoming    |
|  BeaverHacks 2026!                        |
\\ ________________________________________ /
                                  |  /
                                  | /
                                  |/`}
                    </pre>
                    <Link href={`../../register?name=${name}&email=${email}`}>
                        <button className="mt-5 py-2 px-4 border rounded-lg hover:cursor-pointer hover:border-gray-500 transition duration-200">
                            <p className="font-mono">View Application</p>
                        </button>
                    </Link>
                </div>
            }

        </section>
    )
}