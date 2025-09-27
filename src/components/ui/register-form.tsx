"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { E, v } from "node_modules/better-auth/dist/shared/better-auth.Da_FnxgM";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RegsiterForm() {

    const searchParams = useSearchParams();
    const nameParam = searchParams.get('name') || "";
    const emailParam = searchParams.get('email') || "";

    const router = useRouter();

    const [name, setName] = useState(nameParam);
    const [email, setEmail] = useState(emailParam);
    const [school, setSchool] = useState("N/A");
    const [year, setYear] = useState("N/A");
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    useEffect(() => {
        async function fetchApplicationData() {
            try {
                // const resumeBlob = await fetch("/api/upload-resume", {
                //     method: "GET",
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                // });

                // console.log("got the resume blob!", resumeBlob);

                const response = await fetch("/api/application-status", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.application) {
                        const { name, email, school, graduationYear, resumeFile } = data.application;

                        // some resume fetching logic
                        const blobURL = resumeFile;
                        const blobResponse = await fetch(blobURL);
                        const blob = await blobResponse.blob();
                        const uploadedFileName = blobURL.split('/').pop();

                        setName(name);
                        setEmail(email);
                        setSchool(school);
                        setYear(graduationYear);
                        setResumeFile(new File([blob], decodeURIComponent(decodeURIComponent(uploadedFileName))))
                    }
                }
            } catch (error) {
                console.error("Failed to load application data:", error);
                toast.error("Failed to load saved progress.");
            }
        }

        fetchApplicationData();
    }, []); // makes sure this only runs once when the window loads

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (name === "") {
            toast.error("Please enter your name.");
            return;
        }
        if (email === "") {
            toast.error("Please enter your email.");
            return;
        }
        if (school === "N/A" || school === "") {
            toast.error("Please enter the school you currently attend.");
            return;
        }
        if (year === "N/A" || year === "") {
            toast.error("Please enter your expected graduation year.");
            return;
        }
        if (!resumeFile) {
            toast.error("Please upload your resume.");
            return;
        }

        const formData = new FormData();
        formData.append('resume', resumeFile);

        try {
            // uploading resume & receiving a Vercel Blob link through separate API
            const resumeResponse = await fetch("/api/upload-resume", {
                method: "POST",
                body: formData
            });

            if (!resumeResponse.ok) {
                const errorData = await resumeResponse.json();
                toast.error(errorData.error || "Failed to upload resume.");
                return;
            }

            const { url: resumeURL } = await resumeResponse.json();

            // uploading name, email, school, graduation year, and vercel blob resume link to application
            const response = await fetch("/api/submit-application", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    school,
                    graduationYear: year,
                    resumeFile: resumeURL,
                }),
            });

            if (response.ok) {
                toast.success("Application submitted!");
                router.push("/profile");
            }
            else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to submit application.")
            }
        }
        catch (error) {
            console.log("Error submitting the application: ", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    }

    const saveApplication = async () => {
        if (!resumeFile) {
            toast.error("Resume must be uploaded to save progress.");
            return;
        }
        const formData = new FormData();
        formData.append('resume', resumeFile);

        try {
            // uploading resume & receiving a Vercel Blob link through separate API
            const resumeResponse = await fetch("/api/upload-resume", {
                method: "POST",
                body: formData
            });

            if (!resumeResponse.ok) {
                const errorData = await resumeResponse.json();
                toast.error(errorData.error || "Failed to upload resume.");
                return;
            }

            const { url: resumeURL } = await resumeResponse.json();

            const response = await fetch("/api/application-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    school,
                    graduationYear: year,
                    resumeFile: resumeURL,
                }),
            });

            if (response.ok) {
                toast.success("Application progress saved!");
                router.push("/profile");
            }
            else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to save application progress.")
            }
        }
        catch (error) {
            console.log("Error saving the application: ", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    }

    return (
        <div className="">
            <form onSubmit={handleSubmit}>
                <div className="space-y-10 text-left">
                    {/* Personal Information Section */}
                    <div className="space-y-5">
                        <h1 className="text-lg text-white font-bold">Personal Information</h1>
                        {/* Name & Email */}
                        <div className="grid grild-cols-1 md:grid-cols-2 space-y-2 md:space-y-0 space-x-0 md:space-x-5">
                            <div className="text-left">
                                <label className="text-slate-100">
                                    Name<span className="ml-2 text-gray-400">(First & Last)</span>
                                </label>
                                <input
                                    defaultValue={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }}
                                    className="w-full mt-2 bg-transparent text-sm border rounded-md px-3 py-2 focus:outline-none focus:border-slate-100 transition duration-300" />
                            </div>
                            <div>
                                <div className="text-left">
                                    <label className="text-slate-100">
                                        Email
                                    </label>
                                </div>
                                <input
                                    defaultValue={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                    }}
                                    className="w-full mt-2 bg-transparent text-sm border rounded-md px-3 py-2 focus:outline-none focus:border-slate-100 transition duration-300" />
                            </div>
                        </div>
                        {/* School & Graduation Year */}
                        <div className="grid grild-cols-1 md:grid-cols-2 space-y-2 md:space-y-0 space-x-0 md:space-x-5">
                            {/* needs to be added: search university, form validation – scrape all schools from College Board */}
                            <div className="text-left">
                                <label className="text-slate-100">
                                    School Name<span className="ml-2 text-gray-400">(Oregon State University, etc.)</span>
                                </label>
                                <input
                                    defaultValue={school === "N/A" ? "" : school}
                                    onChange={(e) => {
                                        setSchool(e.target.value);
                                    }}
                                    className="w-full mt-2 bg-transparent text-sm border rounded-md px-3 py-2 focus:outline-none focus:border-slate-100  transition duration-300" />
                            </div>
                            <div>
                                <div className="text-left">
                                    <label className="text-slate-100">
                                        Graduation Year
                                    </label>
                                </div>
                                <select

                                    onChange={(e) => {
                                        setYear(e.target.value);
                                    }}
                                    className="w-full mt-2 bg-[#0A0A0A] text-sm border rounded-md px-3 py-2 focus:outline-none focus:border-slate-100 transition duration-300" >
                                    {year === "N/A" ? <option>-- Please Select Year --</option> : <option>{year}</option>}

                                    <option value="2029">2029</option>
                                    <option value="2028">2028</option>
                                    <option value="2027">2027</option>
                                    <option value="2026">2026</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Resume Section */}
                    <div className="space-y-5">
                        <h1 className="text-lg text-white font-bold">Resume</h1>
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10">
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="mx-auto size-6 text-slate-400">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                </svg>

                                <div className="mt-4 flex text-sm/6 text-gray-400">
                                    {!resumeFile ?
                                        <div className="flex">
                                            <label className="relative cursor-pointer rounded-md bg-transparent font-semibold text-orange-700 focus-within:outline-2 focus-within:outline-offset-2 hover:text-orange-600 transition-all duration-200">
                                                <span>Upload a file</span>
                                                <input
                                                    id="file-id"
                                                    className="hidden"
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files.length > 0) {
                                                            setResumeFile(e.target.files[0]);
                                                        }
                                                    }} ></input>
                                            </label>
                                            <p className="pl-1">PDF files only</p>
                                        </div>
                                        :
                                        <div className="flex">
                                            <label className="relative cursor-pointer rounded-md bg-transparent font-semibold text-orange-700 focus-within:outline-2 focus-within:outline-offset-2 hover:text-orange-600 transition-all duration-200">
                                                <span className="mr-2">{resumeFile.name}</span>
                                                <input
                                                    id="file-id"
                                                    className="hidden"
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files.length > 0) {
                                                            setResumeFile(e.target.files[0]);
                                                        }
                                                    }} ></input>
                                            </label>

                                            <p>Click on file to change it</p>
                                        </div>
                                    }


                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                {/* Save & Submit Buttons */}
                <div className="flex md:justify-start mt-10 mx-auto">
                    <div className="mr-2 border rounded-md w-[80%] md:w-[35%] mx-auto text-center px-2 py-2 bg-background shadow-sm hover:bg-accent hover:cursor-pointer hover:text-accent-foreground transition-all duration-200">
                        <button className="text-white" onClick={saveApplication} type="button">Save Progress</button>
                    </div>
                    <div className="border rounded-md w-[80%] md:w-[35%] mx-auto text-center px-2 py-2 bg-gradient-to-r from-red-600 to-orange-600 shadow-sm hover:border-slate-500 hover:cursor-pointer transition-all duration-200">
                        <button className="text-white" type="submit">Submit Application</button>
                    </div>
                </div>
            </form >
        </div >
    )
}