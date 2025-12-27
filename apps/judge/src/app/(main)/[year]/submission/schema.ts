import * as z from "zod";

export const totalImages = 20;

export interface ActionResponse<T = z.infer<typeof formSchema>> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}
export const formSchema = z.object({
  submissionId: z.string().optional().nullable(),
  draftId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  name: z
    .string()
    .min(1)
    .max(50, {
      message: "Title should be between 3 and 50 characters",
    })
    .or(z.literal("")),
  description: z
    .string()
    .min(1)
    .max(250, {
      message: "Description should be between 3 and 250 characters",
    })
    .or(z.literal("")),
  mainDescription: z
    .string()
    .max(10000, {
      message: "Description should be between 3 and 10000 characters",
    })
    .optional(),
  github: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (val) => {
        try {
          const url = new URL(val);
          return url.hostname === "github.com";
        } catch {
          return false;
        }
      },
      {
        message: "Must be a valid GitHub link",
      },
    )
    .or(z.literal("")),
  youtube: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^https?:\/\/(www\.)?youtube\.com/.test(val),
      {
        message: "Must be a YouTube link",
      },
    )
    .optional(),
  photos: z
    .array(z.string())
    .max(totalImages, { message: "You can upload up to 5 photos" })
    .default([]),
  status: z.string().optional(),
  tracks: z.array(z.string()).default([]),
});

// Step-specific validation schemas that require fields to be filled
export const step1Schema = z.object({
  name: z.string().min(1, "Name is required").max(50, {
    message: "Title should be between 1 and 50 characters",
  }),
  description: z.string().min(1, "Description is required").max(250, {
    message: "Description should be between 1 and 250 characters", 
  }),
  tracks: z.array(z.string()).min(1, "Please select at least one track"),
});

export const step2Schema = z.object({
  mainDescription: z.string().min(1, "Main description is required").max(10000, {
    message: "Description should be between 1 and 10000 characters",
  }),
});

export const step3Schema = z.object({
  github: z
    .string()
    .min(1, "GitHub link is required")
    .url("Must be a valid URL")
    .refine(
      (val) => {
        try {
          const url = new URL(val);
          return url.hostname === "github.com";
        } catch {
          return false;
        }
      },
      {
        message: "Must be a valid GitHub link",
      },
    ),
  youtube: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^https?:\/\/(www\.)?youtube\.com/.test(val),
      {
        message: "Must be a valid YouTube link",
      },
    )
    .optional(),
  photos: z
    .array(z.string())
    .min(1, "Please upload at least one photo")
    .max(totalImages, { message: "You can upload up to 5 photos" }),
});
