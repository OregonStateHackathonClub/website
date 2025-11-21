import type { UseFormReturn } from "react-hook-form";
import type * as z from "zod";
import type { formSchema } from "../schema";
import Image from "next/image";
import { ProjectLinks } from "@/components/projectLinks";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";

type FormType = UseFormReturn<z.infer<typeof formSchema>>;

export default function StepFour({ form }: { form: FormType }) {
	const formData = form.getValues();

	return (
		<div className="text-zinc-800 dark:text-zinc-100">
			<h1 className="font-bold text-3xl text-zinc-800 dark:text-zinc-100">
				Project Review
			</h1>
			<p className="text-base text-zinc-700 dark:text-zinc-300 mb-4">
				Please review the information below to ensure everything is correct:
			</p>

			<Card className="group flex flex-col overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
				<CardHeader className="p-4">
					<CardTitle className="font-bold text-2xl text-black leading-snug">
						Title: {formData.name}
					</CardTitle>
					<div>
						<h3 className="font-bold text-lg text-black mb-2">Mini Description:</h3>
						<p className="text-black-300">{formData.description}</p>
					</div>
				</CardHeader>

				

				<div className="relative aspect-video rounded-lg overflow-hidden">
					<Image
						src={formData.photos[0]}
						alt={`${formData.name} cover`}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						className="object-cover rounded-l"
					/>
				</div>

				<CardContent className="space-y-4 px-4 pt-4 pb-4">	
					{formData.mainDescription && (
						<div>
							<h3 className="font-bold text-lg text-black mb-2">About this Project:</h3>
							<p className="text-black-300">{formData.mainDescription}</p>
						</div>
					)}
				</CardContent>

				<CardFooter className="p-4">
					<ProjectLinks
						githubURL={formData.github || null}
						ytVideo={formData.youtube || null}
					/>
				</CardFooter>
			</Card>
			<p className="mt-2 text-base text-zinc-700 dark:text-zinc-300 mb-4">Changes can be made after this submission.</p>
		</div>
	);
}
