'use client'

import React from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
    ChevronDown,
    CircleCheck,
    CircleDotDashed,
    Database,
    Download,
    FileText,
    Filter,
    Loader2,
    Save,
    SlidersHorizontal,
    Upload,
    X,
} from 'lucide-react';
import { FileWithPath } from 'react-dropzone';
import { toast } from 'sonner';

import {
    RecruitmentList,
    participantInclusionSchema,
    recruitmentListInfoSchema,
    recruitmentListSchema,
} from '@/lib/backend/types';
import {
    createRecruitmentList,
    updateRecruitmentList,
    updateRecruitmentListTags,
} from '@/lib/backend/recruitmentLists';
import {
    createRuiConfigPackage,
    parseRuiConfigPackage,
    RUI_CONFIG_EXTENSION,
    RuiConfigPackage,
} from '@/lib/rui-config';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Label } from '../ui/label';
import Filepicker from '../Filepicker';
import General from './general';
import Inclusion from './inclusion';
import ExclusionEditor from './exclusion';
import DataSources from './data-sources';
import Customisations from './customisations';
import TagEditorCompact from '../tag-editor-compact';

interface RecruitmentListEditorProps {
    recruitmentList?: RecruitmentList;
    availableTags?: string[];
    initialTags?: string[];
}

type SectionName = 'general' | 'inclusion' | 'exclusion' | 'data' | 'customization';

type SectionProgress = {
    section: SectionName;
    label: string;
    helperText: string;
    isRequired: boolean;
    isComplete: boolean;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    iconClassName: string;
};

const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

const normalizeTags = (rawTags: unknown): string[] => {
    if (!Array.isArray(rawTags)) {
        return [];
    }

    const cleanedTags = rawTags
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter((tag): tag is string => tag.length > 0);

    return Array.from(new Set(cleanedTags)).sort((a, b) => collator.compare(a, b));
};

const areTagsEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) {
        return false;
    }

    return a.every((tag, index) => tag === b[index]);
};

const createDefaultRecruitmentList = (): RecruitmentList => ({
    id: undefined,
    name: '',
    description: '',
    participantInclusion: {
        studyKey: '',
        type: 'manual',
        autoConfig: undefined,
    },
    participantData: {
        participantInfos: [],
        researchData: [],
    },
    customization: {
        recruitmentStatusValues: [],
    },
    tags: [],
});

const sanitizeFileName = (rawName: string) => {
    const normalizedName = rawName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return normalizedName.length > 0 ? normalizedName : 'recruitment-list';
};

const RecruitmentListEditor: React.FC<RecruitmentListEditorProps> = (props) => {
    const initialRecruitmentList = props.recruitmentList || createDefaultRecruitmentList();

    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();

    const [formSeed, setFormSeed] = React.useState(0);
    const [openSections, setOpenSections] = React.useState<SectionName[]>(['general']);
    const [recruitmentList, setRecruitmentList] = React.useState<RecruitmentList>(initialRecruitmentList);
    const [savedTags, setSavedTags] = React.useState<string[]>(() => (
        normalizeTags(props.initialTags ?? initialRecruitmentList.tags)
    ));
    const [draftTags, setDraftTags] = React.useState<string[]>(() => (
        normalizeTags(props.initialTags ?? initialRecruitmentList.tags)
    ));

    const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
    const [selectedImportFileName, setSelectedImportFileName] = React.useState<string>();
    const [importValidationError, setImportValidationError] = React.useState<string>();
    const [importedPackage, setImportedPackage] = React.useState<RuiConfigPackage>();

    const isNew = recruitmentList.id === undefined;

    const availableTagOptions = React.useMemo(
        () => normalizeTags([...(props.availableTags || []), ...savedTags, ...draftTags]),
        [props.availableTags, savedTags, draftTags]
    );

    const stepProgress: SectionProgress[] = [
        {
            section: 'general',
            label: 'Basic information',
            helperText: 'Name, description, and tags',
            isRequired: true,
            isComplete: recruitmentListInfoSchema.safeParse({
                name: recruitmentList.name,
                description: recruitmentList.description,
            }).success,
            icon: FileText,
            iconClassName: 'text-blue-600',
        },
        {
            section: 'inclusion',
            label: 'Participant inclusion',
            helperText: 'Study key, inclusion type, and criteria',
            isRequired: true,
            isComplete: participantInclusionSchema.safeParse(recruitmentList.participantInclusion).success,
            icon: Filter,
            iconClassName: 'text-emerald-600',
        },
        {
            section: 'exclusion',
            label: 'Exclusion conditions',
            helperText: 'Rules to exclude participants',
            isRequired: false,
            isComplete: (recruitmentList.exclusionConditions?.length || 0) > 0,
            icon: X,
            iconClassName: 'text-red-500',
        },
        {
            section: 'data',
            label: 'Participant data',
            helperText: 'Participant info and research data sources',
            isRequired: true,
            isComplete: recruitmentList.participantData.participantInfos.length > 0 && recruitmentList.participantData.researchData.length > 0,
            icon: Database,
            iconClassName: 'text-fuchsia-600',
        },
        {
            section: 'customization',
            label: 'List customization',
            helperText: 'Custom recruitment status values',
            isRequired: false,
            isComplete: (recruitmentList.customization.recruitmentStatusValues?.length || 0) > 0,
            icon: SlidersHorizontal,
            iconClassName: 'text-orange-600',
        },
    ];

    const remainingRequiredCount = stepProgress.filter((item) => item.isRequired && !item.isComplete).length;

    const resetImportState = React.useCallback(() => {
        setSelectedImportFileName(undefined);
        setImportValidationError(undefined);
        setImportedPackage(undefined);
    }, []);

    const ensureSectionOpen = React.useCallback((section: SectionName) => {
        setOpenSections((previousValue) => (
            previousValue.includes(section) ? previousValue : [...previousValue, section]
        ));
    }, []);

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
            setImportValidationError('Could not parse file. Please provide valid JSON.');
            return;
        }

        const parsedResult = parseRuiConfigPackage(parsedJson);
        if (parsedResult.error !== undefined) {
            setImportValidationError(parsedResult.error);
            return;
        }

        setImportedPackage(parsedResult.data);
    };

    const onImportFileChange = (files: readonly FileWithPath[]) => {
        if (files.length === 0) {
            resetImportState();
            return;
        }

        void parseImportFile(files[0]);
    };

    const applyImportedPackage = () => {
        if (importedPackage === undefined) {
            return;
        }

        setRecruitmentList((previousValue) => ({
            ...previousValue,
            ...importedPackage.config,
            id: previousValue.id,
        }));
        setDraftTags(normalizeTags(importedPackage.config.tags));
        ensureSectionOpen('general');
        setFormSeed((previousValue) => previousValue + 1);
        setIsImportDialogOpen(false);
        resetImportState();
        toast.success('Configuration imported. Review and save.');
    };

    const handleExport = () => {
        const configPackage = createRuiConfigPackage(
            {
                ...recruitmentList,
                tags: draftTags,
            },
            {
                recruitmentListId: recruitmentList.id,
                recruitmentListName: recruitmentList.name,
                host: window.location.host,
            }
        );

        const fileContent = JSON.stringify(configPackage, null, 2);
        const blob = new Blob([fileContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sanitizeFileName(recruitmentList.name)}${RUI_CONFIG_EXTENSION}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const persistRecruitmentList = (values: z.infer<typeof recruitmentListSchema>) => {
        const parsedValues = recruitmentListSchema.safeParse({
            ...values,
            tags: draftTags,
        });

        if (!parsedValues.success) {
            const firstIssue = parsedValues.error.issues[0];
            const topLevelField = String(firstIssue?.path?.[0] || '');
            const sectionByField: Record<string, SectionName> = {
                name: 'general',
                description: 'general',
                tags: 'general',
                participantInclusion: 'inclusion',
                participantData: 'data',
                exclusionConditions: 'exclusion',
                customization: 'customization',
            };
            const targetSection = sectionByField[topLevelField];
            if (targetSection !== undefined) {
                ensureSectionOpen(targetSection);
            }

            toast.error('Please resolve validation issues before saving', {
                description: firstIssue?.message,
            });
            return;
        }

        const normalizedDraftTags = normalizeTags(draftTags);

        startTransition(async () => {
            if (isNew) {
                const createResponse = await createRecruitmentList(parsedValues.data);
                if (createResponse.error !== undefined) {
                    toast.error('Could not create recruitment list', {
                        description: createResponse.error,
                    });
                    return;
                }

                const createdListId = createResponse.id as string | undefined;
                if (createdListId !== undefined) {
                    const tagResponse = await updateRecruitmentListTags(createdListId, normalizedDraftTags);
                    if (tagResponse.error !== undefined) {
                        toast.error('List was created, but tags could not be saved', {
                            description: tagResponse.error,
                        });
                        router.push(`/home/${createdListId}/settings/configs`);
                        return;
                    }
                }

                setSavedTags(normalizedDraftTags);
                toast.success('Recruitment list created');
                if (createdListId !== undefined) {
                    router.push(`/home/${createdListId}/settings/configs`);
                    return;
                }
                router.push('/home');
                return;
            }

            if (recruitmentList.id === undefined) {
                return;
            }

            const updateResponse = await updateRecruitmentList(recruitmentList.id, {
                ...parsedValues.data,
                id: recruitmentList.id,
            });

            if (updateResponse.error !== undefined) {
                toast.error('Could not update recruitment list', {
                    description: updateResponse.error,
                });
                return;
            }

            if (!areTagsEqual(savedTags, normalizedDraftTags)) {
                const tagResponse = await updateRecruitmentListTags(recruitmentList.id, normalizedDraftTags);
                if (tagResponse.error !== undefined) {
                    toast.error('Configuration saved, but tags could not be updated', {
                        description: tagResponse.error,
                    });
                    return;
                }
            }

            setSavedTags(normalizedDraftTags);
            toast.success('Recruitment list updated');
            router.refresh();
        });
    };

    const renderSectionContent = (section: SectionName) => {
        if (section === 'general') {
            return (
                <div className='space-y-6'>
                    <General
                        key={`general-${formSeed}`}
                        hideNavigation
                        defaultValues={{
                            name: recruitmentList.name,
                            description: recruitmentList.description,
                        }}
                        onChange={(general) => {
                            setRecruitmentList((previousValue) => ({
                                ...previousValue,
                                name: general.name,
                                description: general.description,
                            }));
                        }}
                    />

                    <div className='space-y-2'>
                        <Label>Tags</Label>
                        <TagEditorCompact
                            key={`tags-${formSeed}`}
                            availableTags={availableTagOptions}
                            initialTags={draftTags}
                            onChange={setDraftTags}
                        />
                        <p className='text-sm text-muted-foreground'>
                            Tags help categorize this list on the overview page.
                        </p>
                    </div>
                </div>
            );
        }

        if (section === 'inclusion') {
            return (
                <Inclusion
                    key={`inclusion-${formSeed}`}
                    hideNavigation
                    defaultValues={recruitmentList.participantInclusion}
                    onChange={(inclusion) => {
                        setRecruitmentList((previousValue) => ({
                            ...previousValue,
                            participantInclusion: inclusion,
                        }));
                    }}
                />
            );
        }

        if (section === 'exclusion') {
            return (
                <ExclusionEditor
                    key={`exclusion-${formSeed}`}
                    hideNavigation
                    defaultValues={recruitmentList.exclusionConditions}
                    onChange={(exclusionConditions) => {
                        setRecruitmentList((previousValue) => ({
                            ...previousValue,
                            exclusionConditions,
                        }));
                    }}
                />
            );
        }

        if (section === 'data') {
            return (
                <DataSources
                    key={`data-${formSeed}`}
                    hideNavigation
                    defaultValues={recruitmentList.participantData}
                    onChange={(data) => {
                        setRecruitmentList((previousValue) => ({
                            ...previousValue,
                            participantData: data,
                        }));
                    }}
                />
            );
        }

        return (
            <Customisations
                key={`customization-${formSeed}`}
                hideNavigation
                isLoading={isPending}
                defaultValues={recruitmentList.customization}
                onChange={(customization) => {
                    setRecruitmentList((previousValue) => ({
                        ...previousValue,
                        customization,
                    }));
                }}
            />
        );
    };

    return (
        <div className='space-y-5'>
            <div className='sticky top-3 z-10 rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div>
                        <p className='text-sm font-medium'>
                            {remainingRequiredCount === 0
                                ? 'All required sections are configured.'
                                : `${remainingRequiredCount} required section${remainingRequiredCount > 1 ? 's' : ''} still need attention.`}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                            Save changes at any time while editing sections below.
                        </p>
                    </div>
                    <div className='flex flex-wrap items-center gap-2'>
                        <Button variant='outline' onClick={handleExport}>
                            <Download className='mr-2 size-4' />
                            Export
                        </Button>
                        <Button variant='outline' onClick={() => setIsImportDialogOpen(true)}>
                            <Upload className='mr-2 size-4' />
                            Import
                        </Button>
                        <Button
                            onClick={() => persistRecruitmentList(recruitmentList)}
                            disabled={isPending}
                            size='lg'
                        >
                            {isPending ? <Loader2 className='mr-2 size-4 animate-spin' /> : <Save className='mr-2 size-4' />}
                            Save changes
                        </Button>
                    </div>
                </div>
            </div>

            <div className='space-y-3'>
                {stepProgress.map((section) => {
                    const isOpen = openSections.includes(section.section);
                    const SectionIcon = section.icon;

                    return (
                        <Collapsible
                            key={section.section}
                            open={isOpen}
                            onOpenChange={(nextValue) => {
                                setOpenSections((previousValue) => (
                                    nextValue
                                        ? (previousValue.includes(section.section)
                                            ? previousValue
                                            : [...previousValue, section.section])
                                        : previousValue.filter((value) => value !== section.section)
                                ));
                            }}
                        >
                            <div className={cn('overflow-hidden rounded-lg border bg-white', isOpen && 'ring-1 ring-border/80')}>
                                <CollapsibleTrigger asChild>
                                    <button
                                        type='button'
                                        className='flex w-full items-center gap-3 px-4 py-3 text-left bg-muted/50 hover:bg-accent/30'
                                    >
                                        <SectionIcon className={cn('size-5 shrink-0', section.iconClassName)} />
                                        <div className='min-w-0'>
                                            <p className='font-medium'>{section.label}</p>
                                            <p className='text-sm text-muted-foreground'>{section.helperText}</p>
                                        </div>
                                        <div className='ml-auto flex items-center gap-3'>
                                            {section.isComplete ? (
                                                <CircleCheck className='size-4 text-emerald-600' />
                                            ) : section.isRequired ? (
                                                <CircleDotDashed className='size-4 text-amber-600' />
                                            ) : null}
                                            <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                                        </div>
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className='border-t px-4 pb-4 pt-5 bg-white'>
                                        {renderSectionContent(section.section)}
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    );
                })}
            </div>

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
                            Upload a {RUI_CONFIG_EXTENSION} file to prefill this list. Changes are local until you save.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <Filepicker
                            id='setup-config-file'
                            accept={{
                                'application/json': [RUI_CONFIG_EXTENSION, '.json'],
                                'text/plain': [RUI_CONFIG_EXTENSION],
                            }}
                            placeholders={{
                                upload: `Select a ${RUI_CONFIG_EXTENSION} file`,
                                drag: 'or drag and drop it here',
                            }}
                            onChange={onImportFileChange}
                        />
                        {selectedImportFileName && (
                            <p className='text-sm text-muted-foreground'>
                                Selected file: {selectedImportFileName}
                            </p>
                        )}
                        {importValidationError && (
                            <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                                {importValidationError}
                            </div>
                        )}
                        {importedPackage && (
                            <div className='rounded-md border p-3 text-sm text-muted-foreground'>
                                Valid package found for config <span className='font-medium text-foreground'>{importedPackage.config.name}</span>.
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setIsImportDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={applyImportedPackage}
                            disabled={importedPackage === undefined}
                        >
                            <Upload className='mr-2 size-4' />
                            Use imported config
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RecruitmentListEditor;
