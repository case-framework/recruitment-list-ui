"use client";

import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface RequireConfirmationInput {
	confirmTerm: string;
	/** Custom label with {{confirmTerm}} placeholder for the required term (bold). Default: "Type {{confirmTerm}} to confirm" */
	label?: string;
	hint?: string;
}

interface ConfirmDialogProps {
	title: string;
	description: string;
	confirmButtonText: string;
	cancelButtonText: string;
	onConfirm: () => void;
	onCancel: () => void;
	variant: "default" | "destructive";
	isOpen: boolean;
	requireConfirmationInput?: RequireConfirmationInput;
}

const ConfirmDialog = (props: ConfirmDialogProps) => {
	const [typedValue, setTypedValue] = useState("");

	const requireTyped = props.requireConfirmationInput;
	const requiredTerm = requireTyped?.confirmTerm ?? "";
	const canConfirm = !requireTyped || typedValue === requiredTerm;

	const labelMessage = requireTyped?.label ?? "Type {{confirmTerm}} to confirm";
	const labelParts = labelMessage.split("{{confirmTerm}}");

	return (
		<AlertDialog
			open={props.isOpen}
			onOpenChange={(open) => {
				if (!open) {
					setTypedValue("");
					props.onCancel();
				}
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{props.title}</AlertDialogTitle>
					<AlertDialogDescription>{props.description}</AlertDialogDescription>
				</AlertDialogHeader>
				{requireTyped && (
					<div className="grid gap-2">
						<Label htmlFor="confirm-type-input">
							<span>
								{labelParts.map((part, i) =>
									i < labelParts.length - 1 ? (
										<span key={i}>
											{part}
											<span className="font-bold">{requiredTerm}</span>
										</span>
									) : (
										<span key={i}>{part}</span>
									)
								)}
							</span>
						</Label>
						<Input
							id="confirm-type-input"
							value={typedValue}
							onChange={(e) => setTypedValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && canConfirm) {
									e.preventDefault();
									setTypedValue("");
									props.onConfirm();
								}
							}}
							placeholder={requiredTerm}
							autoComplete="off"
						/>
						{requireTyped.hint && (
							<p className="text-muted-foreground text-xs">{requireTyped.hint}</p>
						)}
					</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel
						className="active:scale-[0.97] transition-transform duration-150"
						onClick={(e) => {
							e.preventDefault();
							setTypedValue("");
							props.onCancel();
						}}
					>
						{props.cancelButtonText}
					</AlertDialogCancel>
					<AlertDialogAction
						variant={props.variant}
						className="active:scale-[0.97] transition-transform duration-150"
						disabled={!canConfirm}
						onClick={(e) => {
							e.preventDefault();
							setTypedValue("");
							props.onConfirm();
						}}
					>
						{props.confirmButtonText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ConfirmDialog;
