"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import ConfirmDialog, { type RequireConfirmationInput } from "./confirm-dialog";

export type { RequireConfirmationInput };

interface ConfirmOptions {
	title?: string;
	description?: string;
	confirmButtonText?: string;
	cancelButtonText?: string;
	variant?: "default" | "destructive";
	requireConfirmationInput?: RequireConfirmationInput;
}

interface ConfirmContextType {
	confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
	const [options, setOptions] = useState<ConfirmOptions>({});
	const [isOpen, setIsOpen] = useState(false);
	const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

	const confirm = useCallback((confirmOptions: ConfirmOptions) => {
		setResolver((prev: ((value: boolean) => void) | null) => {
			if (prev) {
				prev(false);
			}
			return null;
		});

		setOptions(confirmOptions);
		setIsOpen(true);
		return new Promise<boolean>((resolve) => {
			setResolver(() => resolve);
		});
	}, []);

	const handleConfirm = () => {
		if (resolver) {
			resolver(true);
		}
		setIsOpen(false);
		setResolver(null);
	};

	const handleCancel = () => {
		if (resolver) {
			resolver(false);
		}
		setIsOpen(false);
		setResolver(null);
	};

	return (
		<ConfirmContext.Provider value={{ confirm }}>
			{children}
			<ConfirmDialog
				isOpen={isOpen}
				title={options.title || "Confirm Action"}
				description={options.description || "Are you sure you want to proceed?"}
				confirmButtonText={options.confirmButtonText || "Confirm"}
				cancelButtonText={options.cancelButtonText || "Cancel"}
				variant={options.variant || "default"}
				requireConfirmationInput={options.requireConfirmationInput}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
			/>
		</ConfirmContext.Provider>
	);
};

export const useConfirm = () => {
	const context = useContext(ConfirmContext);
	if (!context) {
		throw new Error("useConfirm must be used within a ConfirmDialogProvider");
	}
	return context.confirm;
};
