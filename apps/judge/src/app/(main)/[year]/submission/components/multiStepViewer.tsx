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
import { saveDraftAction, submitProjectAction } from "../server-action";
import StepOne from "./formStep1";
import StepTwo from "./formStep2";
import StepThree from "./formStep3";
import StepFour from "./formStep4";
import { useMultiStepForm } from "./useForm";

type FormValues = z.infer<typeof formSchema>;
type FormType = UseFormReturn<FormValues>;

export function MultiStepViewer({
	form,
	draftId,
	setDraftId,
	availableTracks,
}: {
	form: FormType;
	draftId: string | null;
	setDraftId: (id: string) => void;
	availableTracks: { id: string; name: string; }[];
}) {
	const router = useRouter();
	const stepFormElements: {
		[key: number]: JSX.Element;
	} = {
		// Step 1
		1: <StepOne form={form} availableTracks={availableTracks} />,
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
		| "tracks"
	)[] {
		return currentStep === 1
			? ["name", "description", "tracks"]
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
					const result = await saveDraftAction({
						...form.getValues(),
						draftId,
					});
					if (result.data?.success) {
						if (result.data.draft?.draft?.id) {
							setDraftId(result.data.draft.draft.id);
							setLastSaved(new Date());
						}
					} else {
						const errorMessage =
							result.serverError ||
							JSON.stringify(result.validationErrors) ||
							result.data?.error ||
							"An unknown error occurred.";
						toast(`There was an error saving your progress: ${errorMessage}`);
					}
				}
			}, delay);
		},
		[form, setDraftId, draftId],
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
								const result = await saveDraftAction({
									...form.getValues(),
									draftId,
								});

								if (result.data?.success) {
									if (result.data.draft?.draft?.id) {
										setDraftId(result.data.draft.draft.id);
										setLastSaved(new Date());
									}
								} else {
									// Handle server, validation, or custom errors from the action
									const errorMessage =
										result.serverError ||
										JSON.stringify(result.validationErrors) ||
										result.data?.error ||
										"An unknown error occurred.";
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
								const result = await saveDraftAction({
									...form.getValues(),
									draftId,
								});

								if (result.data?.success) {
									if (result.data.draft?.draft?.id) {
										setDraftId(result.data.draft.draft.id);
										setLastSaved(new Date());
									}
								} else {
									// Handle server, validation, or custom errors from the action
									const errorMessage =
										result.serverError ||
										JSON.stringify(result.validationErrors) ||
										result.data?.error ||
										"An unknown error occurred.";
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
								// First save the current form data as a draft if we don't have one
								let finalDraftId = draftId;
								// If we don't have a final draft ID
								if (!finalDraftId) {
									const draftResult = await saveDraftAction({
										...form.getValues(),
										draftId: null,
									});
									if (draftResult.data?.success && draftResult.data.draft?.draft?.id) {
										finalDraftId = draftResult.data.draft.draft.id;
										setDraftId(finalDraftId);
									} else {
										const errorMessage =
											draftResult.serverError ||
											JSON.stringify(draftResult.validationErrors) ||
											draftResult.data?.error ||
											"An unknown error occurred.";
										toast(`There was an error saving your draft: ${errorMessage}`);
										return;
									}
								} else {
									// Update existing draft with final data
									const draftResult = await saveDraftAction({
										...form.getValues(),
										draftId: finalDraftId,
									});
									if (!draftResult.data?.success) {
										const errorMessage =
											draftResult.serverError ||
											JSON.stringify(draftResult.validationErrors) ||
											draftResult.data?.error ||
											"An unknown error occurred.";
										toast(`There was an error updating your draft: ${errorMessage}`);
										return;
									}
								}

								// Then submit the project using the draft
								const result = await submitProjectAction({
									...form.getValues(),
									draftId: finalDraftId,
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
