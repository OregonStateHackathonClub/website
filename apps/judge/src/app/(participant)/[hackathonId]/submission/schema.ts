import { z } from "zod";

export const submissionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  tagline: z
    .string()
    .min(1, "Tagline is required")
    .max(200, "Tagline must be 200 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(10000, "Description must be 10,000 characters or less"),
  videoUrl: z
    .string()
    .min(1, "Demo video is required")
    .url("Must be a valid URL")
    .refine(
      (url) => /youtube\.com|youtu\.be/.test(url),
      "Must be a YouTube link"
    ),
  images: z.array(z.string().url()).max(5, "Maximum 5 images allowed"),
  githubUrl: z
    .string()
    .min(1, "GitHub repository is required")
    .url("Must be a valid URL")
    .refine((url) => url.includes("github.com"), "Must be a GitHub link"),
  deploymentUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  otherLinks: z.array(z.string().url("Must be a valid URL")),
  trackIds: z.array(z.string()).min(1, "Select at least one track"),
});

export const draftSchema = submissionSchema.partial();

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type DraftInput = z.infer<typeof draftSchema>;
