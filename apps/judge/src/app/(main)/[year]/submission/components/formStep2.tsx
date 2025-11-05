import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type * as z from "zod";
import { Button } from "@repo/ui/components/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/form";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@repo/ui/components/textarea";
import type { formSchema } from "../schema";

type FormType = UseFormReturn<z.infer<typeof formSchema>>;

export default function StepTwo({ form }: { form: FormType }) {
	const [showPreview, setShowPreview] = useState(false);
	const description = form.watch("mainDescription");
	return (
		<div className="text-zinc-800 dark:text-zinc-100">
			{" "}
			<h1 className="font-bold text-3xl text-zinc-800 dark:text-zinc-100">
				Main Description
			</h1>
			<div className="w-full py-3">
				<Separator />
			</div>
			<Button
				className="mb-1"
				type="button"
				onClick={() => setShowPreview((prev) => !prev)}
			>
				{showPreview ? "Edit Markdown" : "Preview Markdown"}
			</Button>
			{!showPreview ? (
				<FormField
					control={form.control}
					name="mainDescription"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="ml-1">Main Description*</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder="Enter your project description"
									className="resize-none"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			) : (
				<div className="prose prose-sm m-1 max-w-none rounded border-2 border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
					<ReactMarkdown remarkPlugins={[remarkGfm]}>
						{description}
					</ReactMarkdown>
				</div>
			)}
			<div className="w-full py-3">
				<Separator />
			</div>
		</div>
	);
}
