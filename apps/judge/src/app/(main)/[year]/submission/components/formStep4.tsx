import type { UseFormReturn } from "react-hook-form";
import type * as z from "zod";
import type { formSchema } from "../schema";

type FormType = UseFormReturn<z.infer<typeof formSchema>>;

export default function StepFour({ form }: { form: FormType }) {
  return (
    <div className="text-zinc-800 dark:text-zinc-100">
      <h1 className="font-bold text-3xl text-zinc-800 dark:text-zinc-100">
        Project Review
      </h1>
      <p className="text-base text-zinc-700 dark:text-zinc-300">
        Please review the information below to ensure everything is correct:
      </p>
      <div className="mt-4 space-y-2">
        <h3 className="font-bold text-xl">Title: </h3>
        <p>{form.getValues().name}</p>
        <h3 className="font-bold text-xl">Mini-Description:</h3>
        <p>{form.getValues().description}</p>
        <h3 className="font-bold text-xl">Main Description:</h3>
        <p>{form.getValues().mainDescription}</p>
        <h3 className="font-bold text-xl">GitHub: </h3>
        <p>{form.getValues().github}</p>
        <h3 className="font-bold text-xl">YouTube:</h3>
        <p>{form.getValues().youtube}</p>
      </div>
    </div>
  );
}
