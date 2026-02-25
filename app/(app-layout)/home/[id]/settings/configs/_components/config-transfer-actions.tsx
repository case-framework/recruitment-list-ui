'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Upload, Loader2, FileText, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { FileWithPath } from 'react-dropzone';

import { RecruitmentList } from '@/lib/backend/types';
import { updateRecruitmentList } from '@/lib/backend/recruitmentLists';
import {
    createRuiConfigPackage,
    parseRuiConfigPackage,
    RUI_CONFIG_EXTENSION,
    RuiConfigPackage
} from '@/lib/rui-config';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Filepicker from '@/components/Filepicker';

interface ConfigTransferActionsProps {
    recruitmentList: RecruitmentList;
    canDuplicate: boolean;
}

const sanitizeFileName = (rawName: string) => {
    const normalizedName = rawName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return normalizedName.length > 0 ? normalizedName : "recruitment-list";
}

const ConfigTransferActions: React.FC<ConfigTransferActionsProps> = ({ recruitmentList, canDuplicate }) => {
    const router = useRouter();
    const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [selectedFileName, setSelectedFileName] = React.useState<string>();
    const [validationError, setValidationError] = React.useState<string>();
    const [parsedPackage, setParsedPackage] = React.useState<RuiConfigPackage>();
    const [isPending, startTransition] = React.useTransition();

    const resetImportState = React.useCallback(() => {
        setSelectedFileName(undefined);
        setValidationError(undefined);
        setParsedPackage(undefined);
    }, []);

    const handleExport = () => {
        const configPackage = createRuiConfigPackage(recruitmentList, {
            recruitmentListId: recruitmentList.id,
            recruitmentListName: recruitmentList.name,
            host: window.location.host,
        });

        const fileContent = JSON.stringify(configPackage, null, 2);
        const blob = new Blob([fileContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sanitizeFileName(recruitmentList.name)}${RUI_CONFIG_EXTENSION}`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const parseAndValidateFile = async (file: FileWithPath) => {
        setSelectedFileName(file.name);
        setValidationError(undefined);
        setParsedPackage(undefined);

        if (!file.name.endsWith(RUI_CONFIG_EXTENSION)) {
            setValidationError(`File must use the ${RUI_CONFIG_EXTENSION} extension.`);
            return;
        }

        let parsedJson: unknown;
        try {
            const text = await file.text();
            parsedJson = JSON.parse(text);
        } catch {
            setValidationError("Could not parse file. Please provide valid JSON.");
            return;
        }

        const parsed = parseRuiConfigPackage(parsedJson);
        if (parsed.error !== undefined) {
            setValidationError(parsed.error);
            return;
        }

        setParsedPackage(parsed.data);
    }

    const handleFileChange = (files: readonly FileWithPath[]) => {
        if (!files.length) {
            resetImportState();
            return;
        }

        void parseAndValidateFile(files[0]);
    }

    const handleOverride = () => {
        const listId = recruitmentList.id;
        if (!listId || !parsedPackage) {
            return;
        }

        startTransition(async () => {
            const response = await updateRecruitmentList(listId, {
                ...parsedPackage.config,
                id: listId,
            });

            if (response.error !== undefined) {
                toast.error('Could not override recruitment list config', {
                    description: response.error,
                });
                return;
            }

            toast.success('Recruitment list configuration overridden');
            setIsConfirmOpen(false);
            setIsImportDialogOpen(false);
            resetImportState();
            router.refresh();
        });
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 size-4" />
                Export config
            </Button>

            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="mr-2 size-4" />
                Import config
            </Button>

            {canDuplicate && (
                <Button variant="outline" asChild>
                    <Link href={`/home/new?from=${recruitmentList.id}`}>
                        <Copy className="mr-2 size-4" />
                        Duplicate config
                    </Link>
                </Button>
            )}

            <Dialog
                open={isImportDialogOpen}
                onOpenChange={(open) => {
                    setIsImportDialogOpen(open);
                    if (!open) {
                        resetImportState();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import configuration package</DialogTitle>
                        <DialogDescription>
                            Upload a {RUI_CONFIG_EXTENSION} file to validate and override this list configuration.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Filepicker
                            id="config-file"
                            accept={{
                                "application/json": [RUI_CONFIG_EXTENSION, ".json"],
                                "text/plain": [RUI_CONFIG_EXTENSION],
                            }}
                            placeholders={{
                                upload: `Select a ${RUI_CONFIG_EXTENSION} file`,
                                drag: "or drag and drop it here",
                            }}
                            onChange={handleFileChange}
                        />

                        {selectedFileName && (
                            <div className="text-sm">
                                <p className="font-medium">Selected file</p>
                                <p className="text-muted-foreground">{selectedFileName}</p>
                            </div>
                        )}

                        {validationError && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {validationError}
                            </div>
                        )}

                        {parsedPackage && (
                            <div className="rounded-md border border-neutral-200 p-3 text-sm space-y-2">
                                <p className="font-medium">Validated package</p>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText className="size-4" />
                                    <span>Format: {parsedPackage.metadata.format} v{parsedPackage.metadata.version}</span>
                                </div>
                                <p className="text-muted-foreground">
                                    Exported at {new Date(parsedPackage.metadata.exportedAt).toLocaleString()}
                                </p>
                                <p className="text-muted-foreground">
                                    Config name: {parsedPackage.config.name}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsImportDialogOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => setIsConfirmOpen(true)}
                            disabled={parsedPackage === undefined || isPending}
                        >
                            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Override config
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleOverride}
                title="Override current configuration?"
                description="This replaces the current list setup with the imported configuration package."
                confirmText="Override"
                cancelText="Cancel"
            />
        </div>
    );
};

export default ConfigTransferActions;
