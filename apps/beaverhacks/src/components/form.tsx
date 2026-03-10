"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Building2,
  Check,
  ChevronDown,
  FileUp,
  Globe,
  GraduationCap,
  Linkedin,
  Loader2,
  Mail,
  Phone,
  Shirt,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { COUNTRIES } from "../lib/countries";
import { SCHOOLS } from "../lib/schools";

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const SHIRT_SIZES = ["XS", "S", "M", "L", "XL"] as const;

const LEVEL_OF_STUDY_OPTIONS = [
  "High School",
  "Undergraduate University (2 year)",
  "Undergraduate University (3+ year)",
  "Graduate University (Masters, Professional, Doctoral, etc.)",
  "Code School / Bootcamp",
  "Other Vocational / Trade Program or Apprenticeship",
  "Not currently a student",
  "Prefer not to answer",
] as const;

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  university: z.string().min(1, { message: "University is required" }),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  levelOfStudy: z.string().min(1, { message: "Level of study is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  linkedinUrl: z
    .string()
    .url({ message: "Must be a valid URL" })
    .optional()
    .or(z.literal("")),
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
  inPersonAgreement: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must confirm in-person attendance requirements",
    ),
  agreement: z
    .boolean()
    .refine((val) => val === true, "You must agree to the requirements"),
  mlhCodeOfConduct: z
    .boolean()
    .refine((val) => val === true, "You must agree to the MLH Code of Conduct"),
  mlhPrivacy: z
    .boolean()
    .refine((val) => val === true, "You must agree to the MLH Privacy Policy"),
  mlhMarketing: z.boolean().optional(),
});

const labelClass = "text-xs font-medium text-neutral-400";
const messageClass = "text-xs text-red-500";
const inputClass =
  "w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors disabled:text-neutral-500 disabled:cursor-not-allowed";

const STEPS = ["Personal", "Details", "Agreements"] as const;

const STEP_1_FIELDS = ["name", "email", "phoneNumber", "country"] as const;
const STEP_2_FIELDS = [
  "university",
  "levelOfStudy",
  "shirtSize",
  "resume",
] as const;

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  icon: Icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  disabled?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = (
    search
      ? options.filter((opt) =>
          opt.toLowerCase().includes(search.toLowerCase()),
        )
      : options
  ).slice(0, 5);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 z-10" />
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        disabled={disabled}
        className={`w-full h-10 pl-10 pr-8 bg-transparent border border-neutral-800 text-sm text-left focus:outline-none transition-colors ${disabled ? "text-neutral-500 cursor-not-allowed" : "text-white focus:border-neutral-600 cursor-pointer"}`}
      >
        {value || <span className="text-neutral-600">{placeholder}</span>}
      </button>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-neutral-900 border border-neutral-800 shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-neutral-800">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-8 px-3 bg-neutral-800 border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-neutral-500">
                No results found
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-neutral-800 transition-colors ${value === opt ? "text-white bg-neutral-800" : "text-neutral-300"}`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 flex items-center justify-center text-xs font-medium border transition-colors ${
                i < step
                  ? "bg-white text-black border-white"
                  : i === step
                    ? "border-white text-white"
                    : "border-neutral-700 text-neutral-600"
              }`}
            >
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                i <= step ? "text-white" : "text-neutral-600"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-px mx-3 ${
                i < step ? "bg-white" : "bg-neutral-800"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export const ApplicationForm = ({
  email,
  applicationsOpen,
}: {
  email: string;
  applicationsOpen: boolean;
}) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email,
      university: "",
      phoneNumber: "",
      levelOfStudy: "",
      country: "",
      linkedinUrl: "",
      shirtSize: "",
      resume: undefined,
      inPersonAgreement: false,
      agreement: false,
      mlhCodeOfConduct: false,
      mlhPrivacy: false,
      mlhMarketing: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("university", values.university);
    formData.append("phoneNumber", values.phoneNumber);
    formData.append("levelOfStudy", values.levelOfStudy);
    formData.append("country", values.country);
    formData.append("linkedinUrl", values.linkedinUrl || "");
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

  const handleNext = async () => {
    const fields = step === 0 ? STEP_1_FIELDS : STEP_2_FIELDS;
    const valid = await form.trigger([...fields]);
    if (valid) setStep(step + 1);
  };

  return (
    <div className="w-full max-w-md border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-8">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-white">
          Apply to BeaverHacks
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Complete your registration below
        </p>
      </div>

      <StepIndicator step={step} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Step 1 — Personal Info */}
          {step === 0 && (
            <>
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={labelClass}>Name</FormLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                      <FormControl>
                        <input
                          type="text"
                          placeholder="John Doe"
                          disabled={!applicationsOpen}
                          className={inputClass}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={labelClass}>Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                      <FormControl>
                        <input
                          type="email"
                          disabled
                          className="w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-neutral-400 text-sm cursor-not-allowed"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={labelClass}>Phone Number</FormLabel>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                      <FormControl>
                        <input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          disabled={!applicationsOpen}
                          className={inputClass}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />

              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={labelClass}>Country</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={COUNTRIES}
                      placeholder="Search for your country..."
                      disabled={!applicationsOpen}
                      icon={Globe}
                    />
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Step 2 — Education & Details */}
          {step === 1 && (
            <>
              {/* University */}
              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={labelClass}>University</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={SCHOOLS}
                      placeholder="Search for your university..."
                      disabled={!applicationsOpen}
                      icon={Building2}
                    />
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />

              {/* Level of Study */}
              <FormField
                control={form.control}
                name="levelOfStudy"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={labelClass}>Level of Study</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!applicationsOpen}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-transparent border-neutral-800 text-sm text-white focus:border-neutral-600 rounded-none">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-neutral-600" />
                            <SelectValue placeholder="Select level of study" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-neutral-900 border-neutral-800">
                        {LEVEL_OF_STUDY_OPTIONS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />

              {/* LinkedIn URL (optional) */}
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={labelClass}>
                      LinkedIn URL{" "}
                      <span className="text-neutral-600">(optional)</span>
                    </FormLabel>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                      <FormControl>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
                          disabled={!applicationsOpen}
                          className={inputClass}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />

              {/* T-Shirt Size */}
              <FormField
                control={form.control}
                name="shirtSize"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={labelClass}>T-Shirt Size</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!applicationsOpen}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-transparent border-neutral-800 text-sm text-white focus:border-neutral-600 rounded-none">
                          <div className="flex items-center gap-2">
                            <Shirt className="w-4 h-4 text-neutral-600" />
                            <SelectValue placeholder="Select size" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-neutral-900 border-neutral-800">
                        {SHIRT_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />

              {/* Resume Upload */}
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={labelClass}>Resume</FormLabel>
                    <FormControl>
                      <div>
                        <input
                          type="file"
                          id="resume-upload"
                          className="hidden"
                          accept=".pdf,.jpeg,.jpg,.png"
                          disabled={!applicationsOpen}
                          onChange={(e) => {
                            const file = e.target?.files?.[0];
                            if (file) {
                              field.onChange(file);
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
                            {field.value ? (
                              <>
                                <p className="text-white text-sm truncate">
                                  {field.value.name}
                                </p>
                                <p className="text-neutral-600 text-xs">
                                  Click to replace
                                </p>
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
                    </FormControl>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Step 3 — Agreements */}
          {step === 2 && (
            <>
              {/* In-Person Agreement */}
              <FormField
                control={form.control}
                name="inPersonAgreement"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!applicationsOpen}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-xs text-neutral-400 leading-relaxed font-normal cursor-pointer">
                        I understand BeaverHacks is an in-person hackathon, and
                        I am required to be present at check-in and the closing
                        ceremony.
                      </FormLabel>
                      <FormMessage className={messageClass} />
                    </div>
                  </FormItem>
                )}
              />

              {/* 18+ Agreement */}
              <FormField
                control={form.control}
                name="agreement"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!applicationsOpen}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-xs text-neutral-400 leading-relaxed font-normal cursor-pointer">
                        I confirm that I am at least 18 years of age, currently
                        enrolled at a college or university, and understand that
                        I may be required to provide proof of enrollment
                        (student ID, transcript, etc.).
                      </FormLabel>
                      <FormMessage className={messageClass} />
                    </div>
                  </FormItem>
                )}
              />

              {/* MLH Disclaimers */}
              <div className="border-t border-neutral-800 pt-4 space-y-4">
                <p className="text-xs text-neutral-500">
                  We participate in Major League Hacking (MLH) as a Member
                  Event. Please review and agree to the following:
                </p>

                <FormField
                  control={form.control}
                  name="mlhCodeOfConduct"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!applicationsOpen}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-xs text-neutral-400 leading-relaxed font-normal cursor-pointer">
                          <span>
                            I have read and agree to the{" "}
                            <a
                              href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white underline hover:text-neutral-300"
                            >
                              MLH Code of Conduct
                            </a>
                            .
                          </span>
                        </FormLabel>
                        <FormMessage className={messageClass} />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mlhPrivacy"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!applicationsOpen}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-xs text-neutral-400 leading-relaxed font-normal cursor-pointer">
                          <span>
                            I authorize you to share my application/registration
                            information with Major League Hacking for event
                            administration, ranking, and MLH administration
                            in-line with the{" "}
                            <a
                              href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white underline hover:text-neutral-300"
                            >
                              MLH Privacy Policy
                            </a>
                            . I further agree to the terms of both the{" "}
                            <a
                              href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white underline hover:text-neutral-300"
                            >
                              MLH Contest Terms and Conditions
                            </a>{" "}
                            and the{" "}
                            <a
                              href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white underline hover:text-neutral-300"
                            >
                              MLH Privacy Policy
                            </a>
                            .
                          </span>
                        </FormLabel>
                        <FormMessage className={messageClass} />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mlhMarketing"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!applicationsOpen}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-neutral-400 leading-relaxed font-normal cursor-pointer">
                        I authorize MLH to send me occasional emails about
                        relevant events, career opportunities, and community
                        announcements. (optional)
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="h-10 px-5 border border-neutral-800 text-sm text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
              >
                Back
              </button>
            )}

            {step < 2 && (
              <button
                type="button"
                disabled={!applicationsOpen}
                onClick={handleNext}
                className="flex-1 h-10 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            )}

            {step === 2 && (
              <button
                type="submit"
                disabled={
                  !applicationsOpen ||
                  !form.formState.isValid ||
                  form.formState.isSubmitting
                }
                className="flex-1 h-10 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {!applicationsOpen ? (
                  "Applications Closed"
                ) : form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
