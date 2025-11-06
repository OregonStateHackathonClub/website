import Image from "next/image";
import { useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type * as z from "zod";
import { Button } from "@repo/ui/components/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@repo/ui/components/textarea";
import { type formSchema, totalImages } from "../schema";
import { MultiSelect } from "@/components/multi-select";
import { UploadCloud, X } from "lucide-react";

type FormType = UseFormReturn<z.infer<typeof formSchema>>;

export default function StepOne({ form, availableTracks }: { form: FormType; availableTracks: { id: string; name: string }[]; }) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    const ALLOWED = [
        "image/png",
        "image/jpeg",
        "image/webp",
    ] as const;
    type AllowedMime = (typeof ALLOWED)[number];
    const MAX_BYTES = 5 * 1024 * 1024; // 5MB
    const isImage = (url: string) => /\.(png|jpg|jpeg|webp)$/i.test(url);

    // Common upload logic that takes File[]
    const processFiles = async (
        files: File[],
        currentValue: string | string[],
        onFieldChange: (val: string[]) => void,
    ) => {
        setError("");
        if (files.length === 0) return;

        // Client-side guards
        for (const file of files) {
            if (!ALLOWED.includes(file.type as AllowedMime)) {
                setError("Unsupported file type. Use PNG, JPG, or WEBP");
                if (inputRef.current) inputRef.current.value = "";
                return;
            }
            if (file.size > MAX_BYTES) {
                setError("File too large. Max 5MB.");
                if (inputRef.current) inputRef.current.value = "";
                return;
            }
        }

        const current = Array.isArray(currentValue)
            ? currentValue
            : currentValue
                ? [currentValue]
                : [];
        const remaining = totalImages - current.length;
        if (remaining <= 0) {
            toast("You already have 5 photos. Remove one to add more.");
            if (inputRef.current) inputRef.current.value = "";
            return;
        }
        let toUpload = files;
        if (files.length > remaining) {
            toUpload = files.slice(0, remaining);
        }

        setIsUploading(true);
        try {
            const fd = new FormData();
            for (const file of toUpload) {
                fd.append("file", file);
            }
            const res = await fetch("/api/upload", {
                method: "POST",
                body: fd,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || "Upload failed");
            }
            const data = (await res.json()) as {
                url?: string;
                urls?: string[];
            };
            const uploaded: string[] = data.urls ?? (data.url ? [data.url] : []);
            onFieldChange([...current, ...uploaded]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Upload failed";
            setError(msg);
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleInputChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        currentValue: string | string[],
        onFieldChange: (val: string[]) => void,
    ) => {
        const files = Array.from(e.target.files || []);
        await processFiles(files, currentValue, onFieldChange);
    };

    const handleDrop = async (
        e: React.DragEvent<HTMLDivElement>,
        currentValue: string | string[],
        onFieldChange: (val: string[]) => void,
    ) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files || []);
        await processFiles(files, currentValue, onFieldChange);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleBlob = async (
        url: string,
        currentValue: string[],
        onFieldChange: (val: string[]) => void,
        setError: (msg: string) => void,
    ) => {
        setError("");
        try {
            const isBlob = /vercel-storage\.com\//.test(url);
            if (isBlob) {
                await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
                    method: "DELETE",
                });
            }
        } catch {}
        const next = currentValue.filter((u) => u !== url);
        onFieldChange(next);
    };

    // --- Sorting Logic ---
    const handleSort = (index: number) => {
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        const newFiles = [...(form.getValues("photos") || [])];
        const draggedItem = newFiles[draggedItemIndex];
        
        // Remove item from old position
        newFiles.splice(draggedItemIndex, 1);
        // Insert item at new position
        newFiles.splice(index, 0, draggedItem);

        // Update form state
        form.setValue("photos", newFiles, { shouldDirty: true });
        setDraggedItemIndex(index);
    };

    const trackOptions = availableTracks.map((track) => ({
        value: track.id,
        label: track.name, 
    }));

    return (
        <div>
            <h1 className="font-bold text-xl text-white">
                Project Title & Mini-Description
            </h1>
            <Separator className="mt-1 mb-6" />
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem className="w-full">
                        <FormLabel>Title*</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Enter your project's title"
                                type={"text"}
                                value={field.value}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    field.onChange(val);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="m-4" />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem className="w-full">
                        <FormLabel>Mini Description* (Keep it short and sweet, full description goes in the next step)</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Enter a short description"
                                value={field.value}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    field.onChange(val);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {/* TRACKS */}
            <div className="m-4" />
            <FormField
                control={form.control}
                name="tracks" 
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Available Tracks</FormLabel>
                        <FormControl>
                            <MultiSelect
                                options={trackOptions}
                                defaultValue={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select tracks"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="mt-6">
                <FormField
                    control={form.control}
                    name="photos"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Upload Image:</FormLabel>
                            <FormControl>
                                <div>
                                    {/* Drag & Drop Container */}
                                    <div
                                        className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer ${
                                            isDragging
                                                ? "border-orange-500 bg-orange-500/10"
                                                : "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-500"
                                        }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, field.value, field.onChange)}
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center pointer-events-none">
                                            <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? "text-orange-500" : "text-zinc-400"}`} />
                                            <p className="text-sm text-zinc-400">
                                                <span className="font-semibold text-orange-500">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                PNG, JPG, WEBP (MAX. 5MB)
                                            </p>
                                        </div>
                                        
                                        {/* Hidden Input Overlay */}
                                        <input
                                            ref={inputRef}
                                            type="file"
                                            multiple
                                            accept="image/png,image/jpeg,image/webp,application/pdf"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={isUploading}
                                            onChange={(e) =>
                                                handleInputChange(e, field.value, field.onChange)
                                            }
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <p className="mt-2 text-red-600 text-sm">{error}</p>
                                    )}

                                    {/* Loading State */}
                                    {isUploading && (
                                        <div className="mt-2 text-xs text-zinc-400 animate-pulse">
                                            Uploading files...
                                        </div>
                                    )}

                                    {/* Image Previews List (Sortable) */}
                                    {Array.isArray(field.value) &&
                                        field.value.length > 0 &&
                                        !error && (
                                            <div className="mt-4 flex flex-col gap-2">
                                                {field.value.map((url: string, index: number) => (
                                                    <div 
                                                        key={url} 
                                                        className={`group relative flex items-center justify-between border border-zinc-800 bg-zinc-900/50 rounded-lg p-2 pr-3 w-full transition-all duration-200 ${
                                                            draggedItemIndex === index 
                                                                ? 'opacity-40 border-orange-500 scale-[0.98]' 
                                                                : 'hover:border-zinc-600'
                                                        }`}
                                                        draggable
                                                        onDragStart={(e) => {
                                                            setDraggedItemIndex(index);
                                                            e.dataTransfer.effectAllowed = "move";
                                                            // Hide the ghost image for cleaner drag effect (optional)
                                                            // e.dataTransfer.setDragImage(new Image(), 0, 0); 
                                                        }}
                                                        onDragOver={(e) => {
                                                            e.preventDefault(); // Necessary to allow dropping
                                                            handleSort(index);
                                                        }}
                                                        onDragEnd={() => {
                                                            setDraggedItemIndex(null);
                                                        }}
                                                    >
                                                        {/* Use pointer-events-none on children so they don't block the drag event on the parent div */}
                                                        <div className="flex items-center gap-3 overflow-hidden pointer-events-none">
                                                            {/* Number Index */}
                                                            <span className="text-zinc-500 font-mono text-sm w-4 text-center">{index + 1}</span>
                                                            
                                                            {isImage(url) ? (
                                                                <div className="relative w-24 aspect-video shrink-0 rounded overflow-hidden bg-black">
                                                                    <Image
                                                                        src={url}
                                                                        alt="Preview"
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-24 aspect-video flex items-center justify-center bg-zinc-800 rounded text-zinc-400 shrink-0">
                                                                    PDF
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-xs text-zinc-300 truncate max-w-[200px]">
                                                                    {/* This is just a label now since dragging intercepts clicks */}
                                                                    File {index + 1}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                type="button"
                                                                disabled={isUploading}
                                                                className="text-zinc-500 hover:text-red-500 transition-colors z-10 relative" // Ensure button is clickable
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent drag start when clicking remove
                                                                    handleBlob(
                                                                        url,
                                                                        Array.isArray(field.value) ? field.value : [],
                                                                        field.onChange,
                                                                        setError,
                                                                    );
                                                                }}
                                                            >
                                                                <X size={16} />
                                                            </button>

                                                            {/* Drag Handle (2 Bars) */}
                                                            <div className="flex flex-col gap-1 cursor-grab active:cursor-grabbing p-1">
                                                                <div className="h-0.5 w-4 bg-zinc-600 rounded-full"></div>
                                                                <div className="h-0.5 w-4 bg-zinc-600 rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <Separator className="mt-10" />
        </div>
    );
}