"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { use, useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import type * as z from "zod";
import SubmissionCard from "@/components/submissionCard";
import { Form } from "@repo/ui/components/form";
import { MultiStepViewer } from "./components/multiStepViewer";
import { formSchema } from "./schema";

type FormValues = z.infer<typeof formSchema>;

export type InitialFormData = {
  draftId?: string | null;
  submissionId?: string | null;
  teamId?: string | null;
  name: string;
  description: string;
  mainDescription?: string;
  github?: string;
  youtube?: string;
  photos: string[];
  status?: string;
  tracks: string[];
};

export default function FormClient({
  initialData,
  availableTracks,
}: {
  initialData: Promise<InitialFormData>;
  availableTracks: Promise<{ id: string; name: string; }[]>;
}) {
  // Unwrap server-fetched data using React's use() hook with Suspense
  const data = use(initialData);
  const tracks = use(availableTracks);

  const [draftId, setDraftId] = useState<string | null>(data.draftId ?? null);

  const defaultValues: FormValues = useMemo(
    () => ({
      submissionId: data.submissionId ?? undefined,
      draftId: data.draftId ?? undefined,
      teamId: data.teamId ?? undefined,
      name: data.name || "",
      description: data.description || "",
      mainDescription: data.mainDescription || "",
      github: data.github || "",
      youtube: data.youtube || "",
      photos: Array.isArray(data.photos) ? data.photos : [],
      status: data.status || "draft",
      tracks: Array.isArray(data.tracks) ? data.tracks : [],
    }),
    [data],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    mode: "onBlur",
    defaultValues,
  });

  const selectedTrackIds = form.watch("tracks") || [];
  const selectedTracks = tracks.filter((t) => selectedTrackIds.includes(t.id));


  // Note: Form submission is now handled entirely through the MultiStepViewer component
  // This ensures proper draft workflow and prevents direct submission bypassing

  return (
    <div className="flex grow flex-col justify-center px-4 md:my-6 lg:flex-row lg:px-0">
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Form submission is handled by MultiStepViewer
          }}
          className="flex w-full max-w-3xl grow flex-col gap-2 rounded-md lg:mr-14"
        >
          <MultiStepViewer
            form={form}
            draftId={draftId}
            setDraftId={setDraftId}
            availableTracks={tracks}
          />
        </form>
      </Form>
      <div className="min-w-76">
        <SubmissionCard
          submission={{
            id: "preview",
            name: form.watch("name") || "Title Preview",
            images: form.watch("photos") || "/beaver.png",
            tagline: form.watch("description") || "Description Preview",
            githubUrl: form.watch("github") || null,
            videoUrl: form.watch("youtube") || null,
            tracks: selectedTracks,
          }}
          index={0}
          showOpenButton={false}
          onClick={() => null}
        />
      </div>
    </div>
  );
}
