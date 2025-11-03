import type { UseFormReturn } from "react-hook-form";
import type * as z from "zod";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@/components/ui/separator";
import type { formSchema } from "../schema";

type FormType = UseFormReturn<z.infer<typeof formSchema>>;

export default function StepThree({ form }: { form: FormType }) {
	return (
		<div className="text-zinc-800 dark:text-zinc-100">
			<h1 className="font-bold text-3xl text-zinc-800 dark:text-zinc-100">
				Project Info
			</h1>
			<div className="w-full py-3">
				<Separator />
			</div>
			<FormField
				control={form.control}
				name="github"
				render={({ field }) => (
					<FormItem className="w-full">
						<FormLabel>GitHub*</FormLabel>
						<FormControl>
							<Input
								placeholder="Enter your GitHub link..."
								type={"url"}
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
				name="youtube"
				render={({ field }) => (
					<FormItem className="w-full">
						<FormLabel>YouTube</FormLabel>
						<FormControl>
							<Input
								placeholder="Provide your video URL"
								type={"url"}
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
			{/* Remove URL text field; uploads below handle array of URLs */}

			<div className="w-full py-3">
				<Separator />
			</div>
		</div>
	);
}
