"use client";

import { createContext, useContext, useState, useCallback, useMemo, useRef, type ComponentProps, type ReactNode } from "react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface AlertOptions {
	title?: string;
	description?: string;
	buttonLabel?: string;
	dismissButtonClassName?: string;
	dismissButtonVariant?: ComponentProps<typeof AlertDialogCancel>["variant"];
	children?: ReactNode;
}

export interface AlertApi {
	(options: AlertOptions): Promise<void>;
	dismiss: () => void;
}

interface AlertContextType {
	alert: AlertApi;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

function AlertDialogContent_({
	isOpen,
	title,
	description,
	buttonLabel,
	dismissButtonClassName,
	dismissButtonVariant,
	children,
	onDismiss,
}: {
	isOpen: boolean;
	title: string;
	description: string;
	buttonLabel: string;
	dismissButtonClassName?: string;
	dismissButtonVariant?: ComponentProps<typeof AlertDialogCancel>["variant"];
	children?: ReactNode;
	onDismiss: () => void;
}) {
	return (
		<AlertDialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onDismiss();
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
				</AlertDialogHeader>
				{children != null ? <div className="py-2">{children}</div> : null}
				<AlertDialogFooter className="justify-center sm:justify-center">
					<AlertDialogCancel
						className={cn("min-w-24 active:scale-[0.97] transition-transform duration-150", dismissButtonClassName)}
						variant={dismissButtonVariant ?? "default"}
					>{buttonLabel}</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export const AlertDialogProvider = ({ children }: { children: ReactNode }) => {
	const [options, setOptions] = useState<AlertOptions>({});
	const [isOpen, setIsOpen] = useState(false);
	const resolverRef = useRef<(() => void) | null>(null);

	const resolvePending = useCallback(() => {
		const resolver = resolverRef.current;
		if (resolver) resolver();
		resolverRef.current = null;
	}, []);

	const handleDismiss = useCallback(() => {
		resolvePending();
		setIsOpen(false);
	}, [resolvePending]);

	const alertFn = useCallback((alertOptions: AlertOptions) => {
		resolvePending();
		setOptions(alertOptions);
		setIsOpen(true);
		return new Promise<void>((resolve) => {
			resolverRef.current = resolve;
		});
	}, [resolvePending]);

	const alert = useMemo(
		// eslint-disable-next-line react-hooks/refs
		() => Object.assign(alertFn, { dismiss: handleDismiss }),
		[alertFn, handleDismiss]
	);

	return (
		<AlertContext.Provider value={{ alert }}>
			{children}
			<AlertDialogContent_
				isOpen={isOpen}
				title={options.title ?? "Notice"}
				description={options.description ?? ""}
				buttonLabel={options.buttonLabel ?? "OK"}
				dismissButtonClassName={options.dismissButtonClassName}
				dismissButtonVariant={options.dismissButtonVariant}
				onDismiss={handleDismiss}
			>
				{options.children}
			</AlertDialogContent_>
		</AlertContext.Provider>
	);
};

export const useAlert = () => {
	const context = useContext(AlertContext);
	if (!context) {
		throw new Error("useAlert must be used within an AlertDialogProvider");
	}
	return context.alert;
};
