'use client'

import React, { useState } from 'react';
import { z } from "zod"
import { useRouter } from 'next/navigation';

import {
    ParticipantInclusion,
    RecruitmentList,
    participantInclusionSchema,
    recruitmentListInfoSchema,
    recruitmentListSchema
} from '@/lib/backend/types';
import { createRecruitmentList, updateRecruitmentList } from '@/lib/backend/recruitmentLists';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import General from './general';
import { cn } from '@/lib/utils';
import Inclusion from './inclusion';
import ExclusionEditor from './exclusion';
import DataSources from './data-sources';
import Customisations from './customisations';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { CircleCheck, CircleDotDashed, FileUp, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import Filepicker from '../Filepicker';
import { FileWithPath } from 'react-dropzone';
import { parseRuiConfigPackage, RUI_CONFIG_EXTENSION, RuiConfigPackage } from '@/lib/rui-config';

interface RecruitmentListEditorProps {
    recruitmentList?: RecruitmentList;
}

const steps = ['general', 'inclusion', 'data', 'exclusion', 'customization'] as const;
type StepName = typeof steps[number];
type StepProgress = {
    step: StepName;
    label: string;
    helperText: string;
    isRequired: boolean;
    isComplete: boolean;
};

const createDefaultRecruitmentList = (): RecruitmentList => ({
    id: undefined,
    name: "",
    description: "",
    participantInclusion: {
        studyKey: "",
        type: "manual",
        autoConfig: undefined,
    },
    participantData: {
        participantInfos: [],
        researchData: [],
    },
    customization: {
        recruitmentStatusValues: [],
    },
});

const hasEssentials = (recruitmentList: RecruitmentList) => (
    recruitmentListInfoSchema.safeParse({
        name: recruitmentList.name,
        description: recruitmentList.description,
    }).success &&
    recruitmentList.participantInclusion.studyKey.trim().length > 0
);

const RecruitmentListEditor: React.FC<RecruitmentListEditorProps> = (props) => {
    const initialRecruitmentList = props.recruitmentList || createDefaultRecruitmentList();

    const [currentStep, setCurrentStep] = useState(0)
    const [finishedSteps, setFinishedSteps] = useState<Array<StepName>>(() => (
        props.recruitmentList !== undefined ? [...steps] : []
    ))
    const [formSeed, setFormSeed] = useState(0);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [selectedImportFileName, setSelectedImportFileName] = useState<string>();
    const [importValidationError, setImportValidationError] = useState<string>();
    const [importedPackage, setImportedPackage] = useState<RuiConfigPackage>();
    const [quickSetupState, setQuickSetupState] = useState({
        name: initialRecruitmentList.name,
        description: initialRecruitmentList.description,
        studyKey: initialRecruitmentList.participantInclusion.studyKey,
        type: initialRecruitmentList.participantInclusion.type as ParticipantInclusion['type'],
    });

    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();

    const [recruitmentList, setRecruitmentList] = useState<RecruitmentList>(initialRecruitmentList)

    const isNew = recruitmentList.id === undefined;
    const [isQuickSetupComplete, setIsQuickSetupComplete] = useState<boolean>(() => (
        !isNew || hasEssentials(initialRecruitmentList)
    ));

    const markStepsAsFinished = (stepNames: StepName[]) => {
        setFinishedSteps((previousSteps) => {
            const nextSteps = [...previousSteps];
            stepNames.forEach((step) => {
                if (!nextSteps.includes(step)) {
                    nextSteps.push(step);
                }
            });
            return nextSteps;
        });
    };

    const onTabChange = (step: string) => {
        const nextStep = steps.indexOf(step as StepName);
        if (nextStep === -1) {
            return;
        }

        // Keep the setup flow linear for brand-new lists, while still letting
        // users jump around when editing an existing/pre-filled configuration.
        if (!finishedSteps.includes(step as StepName) && nextStep > currentStep) {
            return;
        }

        setCurrentStep(nextStep);
    }

    const stepProgress: StepProgress[] = [
        {
            step: 'general',
            label: 'Essentials',
            helperText: 'Name and description',
            isRequired: true,
            isComplete: recruitmentListInfoSchema.safeParse({
                name: recruitmentList.name,
                description: recruitmentList.description,
            }).success,
        },
        {
            step: 'inclusion',
            label: 'Participant inclusion',
            helperText: 'Study key and inclusion type',
            isRequired: true,
            isComplete: participantInclusionSchema.safeParse(recruitmentList.participantInclusion).success,
        },
        {
            step: 'data',
            label: 'Data sources',
            helperText: 'Participant infos and research data',
            isRequired: true,
            isComplete: recruitmentList.participantData.participantInfos.length > 0 && recruitmentList.participantData.researchData.length > 0,
        },
        {
            step: 'exclusion',
            label: 'Exclusion rules',
            helperText: 'Optional',
            isRequired: false,
            isComplete: (recruitmentList.exclusionConditions?.length || 0) > 0,
        },
        {
            step: 'customization',
            label: 'Customisation',
            helperText: 'Optional status values',
            isRequired: false,
            isComplete: (recruitmentList.customization.recruitmentStatusValues?.length || 0) > 0,
        },
    ];

    const remainingRequiredCount = stepProgress.filter((item) => item.isRequired && !item.isComplete).length;

    const resetImportState = () => {
        setSelectedImportFileName(undefined);
        setImportValidationError(undefined);
        setImportedPackage(undefined);
    };

    const parseImportFile = async (file: FileWithPath) => {
        setSelectedImportFileName(file.name);
        setImportValidationError(undefined);
        setImportedPackage(undefined);

        if (!file.name.endsWith(RUI_CONFIG_EXTENSION)) {
            setImportValidationError(`File must use the ${RUI_CONFIG_EXTENSION} extension.`);
            return;
        }

        let parsedJson: unknown;
        try {
            parsedJson = JSON.parse(await file.text());
        } catch {
            setImportValidationError("Could not parse file. Please provide valid JSON.");
            return;
        }

        const parsedResult = parseRuiConfigPackage(parsedJson);
        if (parsedResult.error !== undefined) {
            setImportValidationError(parsedResult.error);
            return;
        }

        setImportedPackage(parsedResult.data);
    }

    const onImportFileChange = (files: readonly FileWithPath[]) => {
        if (files.length === 0) {
            resetImportState();
            return;
        }

        void parseImportFile(files[0]);
    }

    const applyImportedPackage = () => {
        if (importedPackage === undefined) {
            return;
        }

        setRecruitmentList((previousValue) => ({
            ...previousValue,
            ...importedPackage.config,
            id: previousValue.id,
        }));
        setQuickSetupState({
            name: importedPackage.config.name,
            description: importedPackage.config.description,
            studyKey: importedPackage.config.participantInclusion.studyKey,
            type: importedPackage.config.participantInclusion.type,
        });
        markStepsAsFinished([...steps]);
        setCurrentStep(0);
        setIsQuickSetupComplete(true);
        setFormSeed((previousValue) => previousValue + 1);
        setIsImportDialogOpen(false);
        resetImportState();
        toast.success("Configuration imported. Review and save.");
    };

    const applyQuickSetup = () => {
        const generalValidation = recruitmentListInfoSchema.safeParse({
            name: quickSetupState.name,
            description: quickSetupState.description,
        });
        if (!generalValidation.success) {
            toast.error('Please complete the essential fields', {
                description: generalValidation.error.issues[0]?.message,
            });
            return;
        }
        if (quickSetupState.studyKey.trim().length === 0) {
            toast.error('Please complete the essential fields', {
                description: 'Study key is required.',
            });
            return;
        }

        setRecruitmentList((previousValue) => ({
            ...previousValue,
            name: quickSetupState.name,
            description: quickSetupState.description,
            participantInclusion: {
                ...previousValue.participantInclusion,
                studyKey: quickSetupState.studyKey,
                type: quickSetupState.type,
                autoConfig: quickSetupState.type === 'manual' ? undefined : previousValue.participantInclusion.autoConfig,
            }
        }));
        markStepsAsFinished(['general', 'inclusion']);
        setCurrentStep(2);
        setIsQuickSetupComplete(true);
        setFormSeed((previousValue) => previousValue + 1);
    };


    function onSubmit(values: z.infer<typeof recruitmentListSchema>) {
        const parsedValues = recruitmentListSchema.safeParse(values);
        if (!parsedValues.success) {
            const firstIssue = parsedValues.error.issues[0];
            const topLevelField = String(firstIssue?.path?.[0] || '');
            const stepByField: Record<string, StepName> = {
                name: 'general',
                description: 'general',
                participantInclusion: 'inclusion',
                participantData: 'data',
                exclusionConditions: 'exclusion',
                customization: 'customization',
            };
            const targetStep = stepByField[topLevelField];
            if (targetStep !== undefined) {
                setCurrentStep(steps.indexOf(targetStep));
            }

            toast.error('Please resolve validation issues before saving', {
                description: firstIssue?.message,
            });
            return;
        }

        startTransition(async () => {
            // Perform the form submission logic here.
            if (isNew) {
                const resp = await createRecruitmentList(parsedValues.data);
                if (resp.error !== undefined) {
                    console.error(resp.error);
                    toast.error('Could not create recruitment list', {
                        description: resp.error,
                    });
                    return;
                }
                router.push(`/home/${resp.id}`);
            } else {
                if (recruitmentList.id === undefined) {
                    return;
                }
                const resp = await updateRecruitmentList(recruitmentList.id, parsedValues.data);
                if (resp.error !== undefined) {
                    console.error(resp.error);
                    toast.error('Could not update recruitment list', {
                        description: resp.error,
                    });
                    return;
                }
                setCurrentStep(0);
                toast.success('Recruitment list updated');
            }
        })
    }

    if (isNew && !isQuickSetupComplete) {
        return (
            <>
                <Card>
                    <CardHeader>
                        <CardTitle>Quick setup</CardTitle>
                        <CardDescription>
                            Start with essential fields first, then continue section by section.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="quick-name">List name</Label>
                            <Input
                                id="quick-name"
                                value={quickSetupState.name}
                                onChange={(event) => setQuickSetupState((previousValue) => ({
                                    ...previousValue,
                                    name: event.target.value,
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quick-description">Description</Label>
                            <Textarea
                                id="quick-description"
                                value={quickSetupState.description}
                                onChange={(event) => setQuickSetupState((previousValue) => ({
                                    ...previousValue,
                                    description: event.target.value,
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quick-study-key">Study key</Label>
                            <Input
                                id="quick-study-key"
                                value={quickSetupState.studyKey}
                                onChange={(event) => setQuickSetupState((previousValue) => ({
                                    ...previousValue,
                                    studyKey: event.target.value,
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Inclusion type</Label>
                            <RadioGroup
                                value={quickSetupState.type}
                                onValueChange={(value) => setQuickSetupState((previousValue) => ({
                                    ...previousValue,
                                    type: value === 'auto' ? 'auto' : 'manual',
                                }))}
                                className="flex gap-6"
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="manual" id="quick-manual" />
                                    <Label htmlFor="quick-manual" className="font-normal">Manual</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="auto" id="quick-auto" />
                                    <Label htmlFor="quick-auto" className="font-normal">Automatic</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                                <Upload className="mr-2 size-4" />
                                Import {RUI_CONFIG_EXTENSION}
                            </Button>
                            <Button onClick={applyQuickSetup}>
                                Continue setup
                            </Button>
                        </div>
                    </CardContent>
                </Card>
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
                                Upload a {RUI_CONFIG_EXTENSION} file to prefill this new list.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Filepicker
                                id="quick-config-file"
                                accept={{
                                    "application/json": [RUI_CONFIG_EXTENSION, ".json"],
                                    "text/plain": [RUI_CONFIG_EXTENSION],
                                }}
                                placeholders={{
                                    upload: `Select a ${RUI_CONFIG_EXTENSION} file`,
                                    drag: "or drag and drop it here",
                                }}
                                onChange={onImportFileChange}
                            />
                            {selectedImportFileName && (
                                <p className="text-sm text-muted-foreground">
                                    Selected file: {selectedImportFileName}
                                </p>
                            )}
                            {importValidationError && (
                                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {importValidationError}
                                </div>
                            )}
                            {importedPackage && (
                                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                                    Valid package found for config <span className="font-medium text-foreground">{importedPackage.config.name}</span>.
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={applyImportedPackage}
                                disabled={importedPackage === undefined}
                            >
                                <FileUp className="mr-2 size-4" />
                                Use imported config
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Setup overview</CardTitle>
                    <CardDescription>
                        {remainingRequiredCount === 0
                            ? 'All required sections are configured.'
                            : `${remainingRequiredCount} required section${remainingRequiredCount > 1 ? 's' : ''} still need attention.`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {stepProgress.map((item) => (
                        <div
                            key={item.step}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                            <div className="flex items-center gap-3">
                                {item.isComplete ? (
                                    <CircleCheck className="size-4 text-emerald-600" />
                                ) : (
                                    <CircleDotDashed className="size-4 text-amber-600" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">
                                        {item.label}
                                        {item.isRequired && <span className="text-xs text-muted-foreground ml-2">Required</span>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{item.helperText}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentStep(steps.indexOf(item.step))}
                            >
                                Open
                            </Button>
                        </div>
                    ))}
                    {isNew && (
                        <div className="pt-2">
                            <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
                                <Upload className="mr-2 size-4" />
                                Import {RUI_CONFIG_EXTENSION}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs
                value={steps[currentStep]}
                onValueChange={onTabChange}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-5">
                    {steps.map((step, index) => (
                        <TabsTrigger
                            key={step}
                            value={step}
                            disabled={!finishedSteps.includes(step) && index > currentStep}
                            className={cn(index < currentStep && "text-primary")}
                        >
                            {step.charAt(0).toUpperCase() + step.slice(1)}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value="general" className='pt-4' forceMount>
                    <General
                        key={`general-${formSeed}`}
                        defaultValues={{
                            name: recruitmentList.name,
                            description: recruitmentList.description,
                        }}
                        onChange={(general) => {
                            setRecruitmentList((prev) => ({
                                ...prev,
                                name: general.name,
                                description: general.description,
                            }))
                        }}
                        onSubmit={(general) => {
                            setRecruitmentList((prev) => ({
                                ...prev,
                                name: general.name,
                                description: general.description,
                            }))
                            setCurrentStep(1);
                            markStepsAsFinished(['general']);
                        }}
                    />
                </TabsContent>

                <TabsContent value="inclusion" className='pt-4' forceMount>
                    <Inclusion
                        key={`inclusion-${formSeed}`}
                        defaultValues={recruitmentList.participantInclusion}
                        onChange={(inclusion) => {
                            setRecruitmentList((prev) => ({
                                ...prev,
                                participantInclusion: inclusion,
                            }))
                        }}
                        onSubmit={(inclusion) => {
                            setRecruitmentList((prev) => ({
                                ...prev,
                                participantInclusion: inclusion,
                            }))
                            setCurrentStep(2);
                            markStepsAsFinished(['inclusion']);
                        }}
                        onPrevious={() => {
                            setCurrentStep(0);
                        }}
                    />
                </TabsContent>

                <TabsContent value="data" className='pt-4' forceMount>
                    <DataSources
                        key={`data-${formSeed}`}
                        defaultValues={recruitmentList.participantData}
                        onChange={(data) => {
                            setRecruitmentList((prev) => ({
                                ...prev,
                                participantData: data,
                            }))
                        }}
                        onSubmit={(data) => {
                            setRecruitmentList((prev) => ({
                                ...prev,
                                participantData: data,
                            }))
                            setCurrentStep(3);
                            markStepsAsFinished(['data']);
                        }}
                        onPrevious={() => {
                            setCurrentStep(1);
                        }}
                    />
                </TabsContent>

                <TabsContent value="exclusion" className='pt-4' forceMount>
                    <ExclusionEditor
                        key={`exclusion-${formSeed}`}
                        defaultValues={recruitmentList.exclusionConditions}
                        onChange={(exclusionConditions) => {
                            setRecruitmentList((prev) => ({
                                ...prev,
                                exclusionConditions,
                            }));
                        }}
                        onSubmit={(exclusionConditions) => {
                            const newRecruitmentList = {
                                ...recruitmentList,
                                exclusionConditions: exclusionConditions,
                            }
                            setRecruitmentList(newRecruitmentList);
                            setCurrentStep(4);
                            markStepsAsFinished(['exclusion']);
                        }}
                        onPrevious={() => {
                            setCurrentStep(2);
                        }}
                    />


                </TabsContent>

                <TabsContent value="customization" className='pt-4' forceMount>
                    <Customisations
                        key={`customization-${formSeed}`}
                        isLoading={isPending}
                        defaultValues={recruitmentList.customization}
                        onChange={(customization) => {
                            setRecruitmentList((prev) => ({
                                ...prev,
                                customization,
                            }))
                        }}
                        onSubmit={(customization) => {
                            const newRecruitmentList = {
                                ...recruitmentList,
                                customization: customization,
                            }
                            setRecruitmentList({
                                ...newRecruitmentList,
                            })
                            onSubmit(newRecruitmentList);
                        }}
                        onPrevious={(customization) => {
                            if (customization !== undefined) {
                                setRecruitmentList({
                                    ...recruitmentList,
                                    customization: customization,
                                })
                            }
                            setCurrentStep(3);
                        }}
                    />
                </TabsContent>
            </Tabs>

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
                            Upload a {RUI_CONFIG_EXTENSION} file to prefill this list.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Filepicker
                            id="setup-config-file"
                            accept={{
                                "application/json": [RUI_CONFIG_EXTENSION, ".json"],
                                "text/plain": [RUI_CONFIG_EXTENSION],
                            }}
                            placeholders={{
                                upload: `Select a ${RUI_CONFIG_EXTENSION} file`,
                                drag: "or drag and drop it here",
                            }}
                            onChange={onImportFileChange}
                        />
                        {selectedImportFileName && (
                            <p className="text-sm text-muted-foreground">
                                Selected file: {selectedImportFileName}
                            </p>
                        )}
                        {importValidationError && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {importValidationError}
                            </div>
                        )}
                        {importedPackage && (
                            <div className="rounded-md border p-3 text-sm text-muted-foreground">
                                Valid package found for config <span className="font-medium text-foreground">{importedPackage.config.name}</span>.
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={applyImportedPackage}
                            disabled={importedPackage === undefined}
                        >
                            <FileUp className="mr-2 size-4" />
                            Use imported config
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RecruitmentListEditor;
