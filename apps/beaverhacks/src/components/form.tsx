"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  FileUp,
  GraduationCap,
  Building2,
  Calendar,
  Loader2,
  User,
  Mail,
  Shirt,
} from "lucide-react";
import { Checkbox } from "@repo/ui/components/checkbox";

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const SHIRT_SIZES = ["XS", "S", "M", "L", "XL"] as const;

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  university: z.string().min(1, { message: "University is required" }),
  graduationYear: z.string().min(1, { message: "Graduation year is required" }),
  shirtSize: z.string().min(1, { message: "T-shirt size is required" }),
  resume: z
    .instanceof(File)
    .optional()
    .refine((file) => file !== undefined, "Resume is required")
    .refine((file) => {
      if (file) {
        return file.size <= MAX_FILE_SIZE;
      }
    }, "Max file size is 5MB")
    .refine((file) => {
      if (file) {
        return ACCEPTED_FILE_TYPES.includes(file.type);
      }
    }, "Only .pdf, .jpeg and .png formats are supported"),
  agreement: z
    .boolean()
    .refine((val) => val === true, "You must agree to the requirements"),
});

export const ApplicationForm = ({
  email,
  applicationsOpen,
}: {
  email: string;
  applicationsOpen: boolean;
}) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email,
      university: "",
      graduationYear: "",
      shirtSize: "",
      resume: undefined,
      agreement: false,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const resumeFile = watch("resume");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("university", values.university);
    formData.append("graduationYear", values.graduationYear);
    formData.append("shirtSize", values.shirtSize);
    formData.append("resume", values.resume!);

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        router.push("/profile");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearsArray = Array.from({ length: 10 }, (_, i) =>
    (currentYear + i).toString(),
  );

  return (
    <div className="w-full max-w-md border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-white">
          Apply to BeaverHacks
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Complete your registration below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name and Email */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="text"
                {...register("name")}
                placeholder="John Doe"
                disabled={!applicationsOpen}
                className={`w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-sm focus:outline-none transition-colors ${!applicationsOpen ? "text-neutral-500 cursor-not-allowed" : "text-white placeholder:text-neutral-600 focus:border-neutral-600"}`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="email"
                {...register("email")}
                disabled
                className="w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-neutral-400 text-sm cursor-not-allowed"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* University */}
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            University
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <input
              type="text"
              {...register("university")}
              placeholder="Oregon State University"
              disabled={!applicationsOpen}
              className={`w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-sm focus:outline-none transition-colors ${!applicationsOpen ? "text-neutral-500 cursor-not-allowed" : "text-white placeholder:text-neutral-600 focus:border-neutral-600"}`}
            />
          </div>
          {errors.university && (
            <p className="text-xs text-red-500 mt-1">
              {errors.university.message}
            </p>
          )}
        </div>

        {/* Graduation Year */}
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Graduation Year
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <select
              {...register("graduationYear")}
              disabled={!applicationsOpen}
              className={`w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-sm focus:outline-none transition-colors appearance-none ${!applicationsOpen ? "text-neutral-500 cursor-not-allowed" : "text-white focus:border-neutral-600 cursor-pointer"}`}
            >
              <option value="" disabled className="bg-neutral-900">
                Select year
              </option>
              {yearsArray.map((year) => (
                <option key={year} value={year} className="bg-neutral-900">
                  {year}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
          </div>
          {errors.graduationYear && (
            <p className="text-xs text-red-500 mt-1">
              {errors.graduationYear.message}
            </p>
          )}
        </div>

        {/* T-Shirt Size */}
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            T-Shirt Size
          </label>
          <div className="relative">
            <Shirt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <select
              {...register("shirtSize")}
              disabled={!applicationsOpen}
              className={`w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-sm focus:outline-none transition-colors appearance-none ${!applicationsOpen ? "text-neutral-500 cursor-not-allowed" : "text-white focus:border-neutral-600 cursor-pointer"}`}
            >
              <option value="" disabled className="bg-neutral-900">
                Select size
              </option>
              {SHIRT_SIZES.map((size) => (
                <option key={size} value={size} className="bg-neutral-900">
                  {size}
                </option>
              ))}
            </select>
          </div>
          {errors.shirtSize && (
            <p className="text-xs text-red-500 mt-1">
              {errors.shirtSize.message}
            </p>
          )}
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Resume
          </label>
          <div className="relative">
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.jpeg,.jpg,.png"
              disabled={!applicationsOpen}
              onChange={(e) => {
                const file = e.target?.files?.[0];
                if (file) {
                  setValue("resume", file, { shouldValidate: true });
                }
              }}
            />
            <label
              htmlFor="resume-upload"
              className={`flex items-center gap-3 w-full h-20 px-4 bg-transparent border border-dashed border-neutral-800 text-sm transition-colors ${!applicationsOpen ? "cursor-not-allowed" : "cursor-pointer hover:border-neutral-600"}`}
            >
              <div className="w-10 h-10 flex items-center justify-center border border-neutral-800 bg-neutral-900">
                <FileUp className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1 min-w-0">
                {resumeFile ? (
                  <>
                    <p className="text-white text-sm truncate">
                      {resumeFile.name}
                    </p>
                    <p className="text-neutral-600 text-xs">Click to replace</p>
                  </>
                ) : (
                  <>
                    <p className="text-neutral-400 text-sm">
                      Upload your resume
                    </p>
                    <p className="text-neutral-600 text-xs">
                      PDF, JPEG, PNG (max 5MB)
                    </p>
                  </>
                )}
              </div>
            </label>
          </div>
          {errors.resume && (
            <p className="text-xs text-red-500 mt-1">{errors.resume.message}</p>
          )}
        </div>

        {/* Agreement */}
        <div>
          <label
            htmlFor="agreement"
            className="flex items-start gap-3 cursor-pointer"
          >
            <Checkbox
              id="agreement"
              checked={watch("agreement")}
              onCheckedChange={(checked) =>
                setValue("agreement", checked === true, {
                  shouldValidate: true,
                })
              }
              disabled={!applicationsOpen}
              aria-invalid={!!errors.agreement}
              className="mt-0.5"
            />
            <span className="text-xs text-neutral-400 leading-relaxed">
              I confirm that I am at least 18 years of age, currently enrolled at
              a college or university, and understand that I may be required to
              provide proof of enrollment (student ID, transcript, etc.).
            </span>
          </label>
          {errors.agreement && (
            <p className="text-xs text-red-500 mt-1">
              {errors.agreement.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!applicationsOpen || !isValid || isSubmitting}
          className="w-full h-10 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {!applicationsOpen ? (
            "Applications Closed"
          ) : isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Complete Registration"
          )}
        </button>
      </form>
    </div>
  );
};
