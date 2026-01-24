"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { deleteImage, saveDraft, submitProject, uploadImages } from "./actions";
import { DescriptionEditor } from "./components/description-editor";
import { ImageUploader } from "./components/image-uploader";
import { OtherLinks } from "./components/other-links";
import { ReviewStep } from "./components/review-step";
import { SaveIndicator, type SaveStatus } from "./components/save-indicator";
import { TrackSelector } from "./components/track-selector";
import type { InitialData } from "./page";
import { type SubmissionInput, submissionSchema } from "./schema";

interface SubmissionFormProps {
  hackathonId: string;
  initialData: InitialData;
  tracks: { id: string; name: string }[];
  hasSubmission: boolean;
}

export function SubmissionForm({
  hackathonId,
  initialData,
  tracks,
  hasSubmission,
}: SubmissionFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      tagline: initialData?.tagline ?? "",
      description: initialData?.description ?? "",
      videoUrl: initialData?.videoUrl ?? "",
      images: initialData?.images ?? [],
      githubUrl: initialData?.githubUrl ?? "",
      deploymentUrl: initialData?.deploymentUrl ?? "",
      otherLinks: initialData?.otherLinks ?? [],
      trackIds: initialData?.trackIds ?? [],
    },
    mode: "onBlur",
  });

  const autosave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      const result = await saveDraft(hackathonId, form.getValues());
      setSaveStatus(result.success ? "saved" : "error");

      if (!result.success) {
        toast.error(result.error);
      }

      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  }, [hackathonId, form]);

  useEffect(() => {
    const subscription = form.watch(() => {
      autosave();
    });
    return () => subscription.unsubscribe();
  }, [form, autosave]);

  const handleFileUpload = async (files: FileList) => {
    const currentImages = form.getValues("images");
    const remaining = 5 - currentImages.length;

    if (remaining <= 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    const formData = new FormData();
    for (const file of toUpload) {
      formData.append("file", file);
    }

    setIsUploading(true);
    const result = await uploadImages(hackathonId, formData);
    setIsUploading(false);

    if (result.success && result.data) {
      form.setValue("images", [...currentImages, ...result.data.urls]);
      autosave();
    } else if (!result.success) {
      toast.error(result.error);
    }
  };

  const handleDeleteImage = async (url: string) => {
    const result = await deleteImage(url);
    if (result.success) {
      const current = form.getValues("images");
      form.setValue(
        "images",
        current.filter((u) => u !== url)
      );
      autosave();
    } else {
      toast.error(result.error);
    }
  };

  const handleReorderImages = (images: string[]) => {
    form.setValue("images", images);
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      setStep(1);
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    await saveDraft(hackathonId, form.getValues());
    const result = await submitProject(hackathonId);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Project submitted successfully!");
      router.push(`/${hackathonId}`);
    } else {
      toast.error(result.error);
    }
  };

  const toggleTrack = (trackId: string) => {
    const current = form.getValues("trackIds");
    if (current.includes(trackId)) {
      form.setValue(
        "trackIds",
        current.filter((id) => id !== trackId)
      );
    } else {
      form.setValue("trackIds", [...current, trackId]);
    }
    autosave();
  };

  const images = form.watch("images");
  const description = form.watch("description");
  const otherLinks = form.watch("otherLinks");
  const selectedTrackIds = form.watch("trackIds");

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              {hasSubmission ? "Edit Submission" : "Submit Project"}
            </h1>
            <p className="text-sm text-neutral-500">
              {step === 1 ? "Step 1: Project Details" : "Step 2: Review & Submit"}
            </p>
          </div>
          <SaveIndicator status={saveStatus} />
        </div>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            {step === 1 && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="border border-neutral-800 bg-neutral-950/80 p-6">
                  <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Basic Info
                  </h2>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-neutral-400">
                            Title *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="My Awesome Project"
                              className="border-neutral-800 bg-neutral-900"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-neutral-400">
                            Tagline *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="A one-sentence description of your project"
                              className="border-neutral-800 bg-neutral-900"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Description */}
                <DescriptionEditor
                  value={description}
                  onChange={(value) => form.setValue("description", value)}
                  error={form.formState.errors.description?.message}
                />

                {/* Media */}
                <div className="border border-neutral-800 bg-neutral-950/80 p-6">
                  <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Media
                  </h2>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-neutral-400">
                            Demo Video (YouTube) *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://youtube.com/watch?v=..."
                              className="border-neutral-800 bg-neutral-900"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <ImageUploader
                      images={images}
                      isUploading={isUploading}
                      onUpload={handleFileUpload}
                      onDelete={handleDeleteImage}
                      onReorder={handleReorderImages}
                    />
                  </div>
                </div>

                {/* Links */}
                <div className="border border-neutral-800 bg-neutral-950/80 p-6">
                  <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Links
                  </h2>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="githubUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-neutral-400">
                            GitHub Repository *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://github.com/username/repo"
                              className="border-neutral-800 bg-neutral-900"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deploymentUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-neutral-400">
                            Deployment URL (optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://myproject.vercel.app"
                              className="border-neutral-800 bg-neutral-900"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <OtherLinks
                      links={otherLinks}
                      onChange={(links) => {
                        form.setValue("otherLinks", links);
                        autosave();
                      }}
                      errors={
                        Array.isArray(form.formState.errors.otherLinks)
                          ? form.formState.errors.otherLinks.map((e) => e?.message)
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Tracks */}
                <TrackSelector
                  tracks={tracks}
                  selectedIds={selectedTrackIds}
                  onToggle={toggleTrack}
                  error={form.formState.errors.trackIds?.message}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-white text-black hover:bg-neutral-200"
                  >
                    Review Submission
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <ReviewStep
                data={form.getValues()}
                tracks={tracks}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                hasSubmission={hasSubmission}
              />
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
