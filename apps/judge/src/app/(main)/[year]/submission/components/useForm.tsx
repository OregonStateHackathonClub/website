import { useState } from "react";

//------------------------------use-multi-step-form.tsx
type UseFormStepsProps = {
	initialSteps: number[];
	onStepValidation?: (step: number) => Promise<boolean> | boolean;
};
export type UseMultiFormStepsReturn = {
	steps: number[];
	currentStep: number;
	// currentStepData: any;
	progress: number;
	isFirstStep: boolean;
	isLastStep: boolean;
	goToNext: () => Promise<boolean>;
	goToPrevious: () => void;
	resetSteps: () => void;
};
export function useMultiStepForm({
	initialSteps,
	onStepValidation,
}: UseFormStepsProps): UseMultiFormStepsReturn {
	const steps = initialSteps;
	const [currentStep, setCurrentStep] = useState(1);
	const resetSteps = () => setCurrentStep(1);
	const goToNext = async () => {
		const currentStepData = initialSteps[currentStep];
		if (onStepValidation) {
			const isValid = await onStepValidation(currentStepData);
			if (!isValid) return false;
		}
		if (currentStep < steps.length) {
			setCurrentStep((prev) => prev + 1);
			return true;
		}
		return false;
	};
	const goToPrevious = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1);
		}
	};
	return {
		steps,
		currentStep,
		// currentStepData: steps[currentStep - 1],
		progress: (currentStep / steps.length) * 100,
		isFirstStep: currentStep === 1,
		isLastStep: currentStep === steps.length,
		goToNext,
		goToPrevious,
		resetSteps,
	};
}
