"use client";

import type React from "react";
import { useId } from "react";
import { Input } from "@repo/ui/components/input"; // Assuming Input is from shadcn/ui and is in the same components directory
import { Label } from "@repo/ui/components/label"; // Assuming Label is from shadcn/ui

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
}

export function Field({ label, id: propId, ...props }: FieldProps) {
	const generatedId = useId();
	const id = propId || generatedId;

	return (
		<div className="grid gap-2">
			<Label htmlFor={id}>{label}</Label>
			<Input id={id} {...props} />
		</div>
	);
}
