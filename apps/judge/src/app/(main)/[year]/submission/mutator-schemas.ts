import { z } from "zod";

// Track reference schema
const trackRefSchema = z.object({
  id: z.string().min(1),
});

// Create Draft Schema
export const createDraftSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  hackathonId: z.string().min(1, "Hackathon ID is required"),
  data: z.object({
    projectTitle: z.string().optional(),
    miniDescription: z.string().optional(),
    projectDescription: z.string().optional(),
    githubLink: z
      .string()
      .url("Invalid GitHub URL")
      .optional()
      .or(z.literal("")),
    youtubeLink: z
      .string()
      .url("Invalid YouTube URL")
      .optional()
      .or(z.literal("")),
    uploadPhotos: z.array(z.string().url()).optional(),
    tracks: z.array(trackRefSchema).optional(),
  }),
});

// Update Draft Schema
export const updateDraftSchema = z.object({
  draftId: z.string().min(1, "Draft ID is required"),
  data: z.object({
    projectTitle: z.string().optional(),
    miniDescription: z.string().optional(),
    projectDescription: z.string().optional(),
    githubLink: z
      .string()
      .url("Invalid GitHub URL")
      .optional()
      .or(z.literal("")),
    youtubeLink: z
      .string()
      .url("Invalid YouTube URL")
      .optional()
      .or(z.literal("")),
    uploadPhotos: z.array(z.string().url()).optional(),
    tracks: z.array(trackRefSchema).optional(),
  }),
});

// Create Submission from Draft Schema
export const createSubmissionFromDraftSchema = z.object({
  draftId: z.string().min(1, "Draft ID is required"),
});

// Validate draft has complete data before submission
export const completeDraftSchema = z.object({
  name: z.string().min(1, "Project title is required"),
  tagline: z.string().min(1, "Mini description is required"),
  description: z.string().min(1, "Project description is required"),
});

// Update Submission Schema
export const updateDataSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  data: z.object({
    projectTitle: z.string().min(1, "Project title is required"),
    miniDescription: z.string().min(1, "Mini description is required"),
    projectDescription: z.string().min(1, "Project description is required"),
    githubLink: z.string().url("Invalid GitHub URL").or(z.literal("")),
    youtubeLink: z.string().url("Invalid YouTube URL").or(z.literal("")),
    uploadPhotos: z.array(z.string().url()),
    teamId: z.string().min(1).nullable().optional(),
    tracks: z.array(trackRefSchema).optional(),
  }),
});

// Send Data (Create Submission) Schema
export const sendDataSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  miniDescription: z.string().min(1, "Mini description is required"),
  projectDescription: z.string().min(1, "Project description is required"),
  githubLink: z.string().url("Invalid GitHub URL").or(z.literal("")),
  youtubeLink: z.string().url("Invalid YouTube URL").or(z.literal("")),
  uploadPhotos: z.array(z.string().url()),
  status: z.string(),
  teamId: z.string().min(1, "Team ID is required").nullable().optional(),
  tracks: z.array(trackRefSchema).optional(),
});

// Extract types from schemas
export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
export type CreateSubmissionFromDraftInput = z.infer<
  typeof createSubmissionFromDraftSchema
>;
export type UpdateDataInput = z.infer<typeof updateDataSchema>;
export type SendDataInput = z.infer<typeof sendDataSchema>;
