"use client";
import { Progress } from "@radix-ui/react-progress";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type JSX, useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@repo/ui/components/button";
import type { formSchema } from "../schema";
import { serverAction } from "../server-action";
import StepOne from "./formStep1";
import StepTwo from "./formStep2";
import StepThree from "./formStep3";
import StepFour from "./formStep4";
import { useMultiStepForm } from "./useForm";

type FormValues = z.infer<typeof formSchema>;
type FormType = UseFormReturn<FormValues>;

export function MultiStepViewer({
	form,
	submissionId,
	setSubmissionId,
}: {
	form: FormType;
	submissionId: string | null;
	setSubmissionId: (id: string) => void;
}) {
	const router = useRouter();
	const stepFormElements: {
		[key: number]: JSX.Element;
	} = {
		// Step 1
		1: <StepOne form={form} />,
		// Step 2
		2: <StepTwo form={form} />,
		// Step 3
		3: <StepThree form={form} />,
		// Step 4
		4: <StepFour form={form} />,
	};

	function fieldsToValidate(
		currentStep: number,
	): (
		| "name"
		| "submissionId"
		| "description"
		| "mainDescription"
		| "github"
		| "youtube"
		| "photos"
		| "status"
	)[] {
		return currentStep === 1
			? ["name", "description"]
			: currentStep === 2
				? ["mainDescription"]
				: currentStep === 3
					? ["github", "youtube", "photos"]
					: [];
	}
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	const steps = Object.keys(stepFormElements).map(Number);
	const { currentStep, isLastStep, goToNext, goToPrevious } = useMultiStepForm({
		initialSteps: steps,
		onStepValidation: async (currentStep) => {
			const isValid = await form.trigger(fieldsToValidate(currentStep));
			return isValid;
		},
	});
	const current = stepFormElements[currentStep];
	const {
		formState: { isSubmitting },
	} = form;

	const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const autosaveDraft = useCallback(
		(fieldName: keyof FormValues | string, delay: number = 500) => {
			if (autosaveTimeoutRef.current) {
				clearTimeout(autosaveTimeoutRef.current);
			}

			autosaveTimeoutRef.current = setTimeout(async () => {
				const valid = await form.trigger(
					fieldName as keyof FormValues | `photos.${number}`,
				);
				if (valid) {
					const result = await serverAction({
						...form.getValues(),
						submissionId,
					});
					console.log("Submission result: ", result);
					if (result.data?.success) {
						if (result.data.submission?.submission?.id) {
							setSubmissionId(result.data.submission.submission.id);
							setLastSaved(new Date());
						}
					} else {
						const errorMessage =
							result.serverError ||
							JSON.stringify(result.validationErrors) ||
							result.data?.error ||
							"An unknown error occurred.";
						console.error("Submission failed:", errorMessage);
						toast(`There was an error saving your progress: ${errorMessage}`);
					}
				}
			}, delay);
		},
		[form, setSubmissionId, submissionId],
	);

	useEffect(() => {
		const subscription = form.watch((_, info) => {
			const fieldName = info?.name as string | undefined;
			if (!fieldName) return;

			autosaveDraft(fieldName);
		});

		return () => subscription.unsubscribe();
	}, [form, autosaveDraft]);

	return (
		<div className="flex flex-col gap-2">
			<div className="mb-4 flex flex-col items-center justify-start">
				<Progress value={(currentStep / steps.length) * 100} />
			</div>
			<AnimatePresence mode="popLayout">
				<motion.div
					key={currentStep}
					initial={{ opacity: 0, x: 15 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -15 }}
					transition={{ duration: 0.4, type: "spring" }}
					className="flex flex-col gap-2"
				>
					{current}
				</motion.div>
			</AnimatePresence>
			<div className="flex w-full items-center gap-3 pt-3">
				{currentStep !== 1 && (
					<Button
						size="sm"
						variant="outline"
						type="button"
						onClick={async () => {
							// List the field names for the current stepS
							const valid = await form.trigger(fieldsToValidate(currentStep));

							if (valid) {
								goToPrevious();
								const result = await serverAction({
									...form.getValues(),
									submissionId,
								});
								console.log("Submission result: ", result);

								if (result.data?.success) {
									if (result.data.submission?.submission?.id) {
										setSubmissionId(result.data.submission.submission.id);
										setLastSaved(new Date());
									}
								} else {
									// Handle server, validation, or custom errors from the action
									const errorMessage =
										result.serverError ||
										JSON.stringify(result.validationErrors) ||
										result.data?.error ||
										"An unknown error occurred.";
									console.error("Submission failed:", errorMessage);
									toast(
										`There was an error saving your progress: ${errorMessage}`,
									);
								}
							}
							// If not valid, errors will show automatically via <FormMessage />
						}}
					>
						Previous
					</Button>
				)}
				<div className="ml-auto font-thin opacity-65">
					Last Saved: {lastSaved ? lastSaved.toLocaleTimeString() : "—"}
				</div>
				{!isLastStep && (
					<Button
						size="sm"
						type="button"
						className="ml-auto"
						onClick={async () => {
							// List the field names for the current stepS
							const valid = await form.trigger(fieldsToValidate(currentStep));

							if (valid) {
								goToNext();
								const result = await serverAction({
									...form.getValues(),
									submissionId,
								});
								console.log("Submission result: ", result);

								if (result.data?.success) {
									if (result.data.submission?.submission?.id) {
										setSubmissionId(result.data.submission.submission.id);
										setLastSaved(new Date());
									}
								} else {
									// Handle server, validation, or custom errors from the action
									const errorMessage =
										result.serverError ||
										JSON.stringify(result.validationErrors) ||
										result.data?.error ||
										"An unknown error occurred.";
									console.error("Submission failed:", errorMessage);
									toast(
										`There was an error saving your progress: ${errorMessage}`,
									);
								}
							}
							// If not valid, errors will show automatically via <FormMessage />
						}}
					>
						Next
					</Button>
				)}

				{isLastStep && (
					<Button
						size="sm"
						type="button"
						className="ml-auto"
						disabled={isSubmitting}
						onClick={async () => {
							const valid = await form.trigger();
							if (valid) {
								const result = await serverAction({
									...form.getValues(),
									submissionId,
									status: "submitted",
								});
								if (result.data?.success) {
									toast("Project submitted successfully.");
									router.push("/");
								} else {
									const errorMessage =
										result.serverError ||
										JSON.stringify(result.validationErrors) ||
										result.data?.error ||
										"An unknown error occurred.";
									console.error("Submission failed:", errorMessage);
									toast(
										`There was an error submitting your project: ${errorMessage}`,
									);
								}
							}
						}}
					>
						{isSubmitting ? "Submitting..." : "Submit"}
					</Button>
				)}
			</div>
		</div>
	);
}
