import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Textarea } from "@repo/ui/components/textarea";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type * as z from "zod";
import { Separator } from "@/components/ui/separator";
import type { formSchema } from "../schema";

type FormType = UseFormReturn<z.infer<typeof formSchema>>;

export default function StepTwo({ form }: { form: FormType }) {
  const [showPreview, setShowPreview] = useState(false);
  const description = form.watch("mainDescription");

  return (
    <div className="text-zinc-800 dark:text-zinc-100">
      <h1 className="font-bold text-3xl text-zinc-800 dark:text-zinc-100">
        Main Description
      </h1>
      <div className="w-full py-3">
        <Separator />
      </div>

      {/* Content Area */}
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
                  placeholder="Enter your project description (Markdown supported)"
                  className="resize-y min-h-[300px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert m-1 max-w-none rounded border-2 border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 min-h-[300px]">
          {description ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          ) : (
            <p className="text-zinc-400 italic">No description entered yet.</p>
          )}
        </div>
      )}

      {/* Toggle Switch */}
      <div className="mt-6 flex justify-center">
        <div
          className="relative flex h-10 w-64 cursor-pointer items-center rounded-full bg-zinc-200 p-1 dark:bg-neutral-800 shadow-inner"
          onClick={() => setShowPreview(!showPreview)}
        >
          {/* Sliding Indicator Background */}
          <div
            className={`absolute h-8 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out dark:bg-neutral-600 ${
              showPreview ? "translate-x-[100%]" : "translate-x-0"
            }`}
          />

          {/* Edit Label */}
          <span
            className={`z-10 w-1/2 text-center text-sm font-medium transition-opacity duration-300 ${
              !showPreview ? "opacity-100 font-semibold" : "opacity-50"
            }`}
          >
            Edit
          </span>

          {/* Preview Label */}
          <span
            className={`z-10 w-1/2 text-center text-sm font-medium transition-opacity duration-300 ${
              showPreview ? "opacity-100 font-semibold" : "opacity-50"
            }`}
          >
            Preview
          </span>
        </div>
      </div>

      <div className="w-full py-3">
        <Separator />
      </div>
    </div>
  );
}
