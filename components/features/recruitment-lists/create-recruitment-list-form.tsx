'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import TagEditorCompact from '@/components/tag-editor-compact';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateRecruitmentList } from '@/components/hooks/use-create-recruitment-list';
import { useTRPC } from '@/trpc/client';
import { useMemo } from 'react';

const createRecruitmentListFormSchema = z.object({
    name: z.string().trim().min(2).max(50),
    description: z.string().trim().min(2).max(500),
    tags: z.array(z.string().trim().min(1)),
});

type CreateRecruitmentListFormValues = z.infer<typeof createRecruitmentListFormSchema>;

interface CreateRecruitmentListFormProps {
    initialValues?: {
        name?: string;
        description?: string;
        tags?: string[];
    };
}

const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

const normalizeTags = (rawTags: string[] | undefined): string[] => {
    if (!Array.isArray(rawTags)) {
        return [];
    }

    const cleanedTags = rawTags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

    return Array.from(new Set(cleanedTags)).sort((a, b) => collator.compare(a, b));
};

const CreateRecruitmentListForm: React.FC<CreateRecruitmentListFormProps> = ({ initialValues }) => {
    const router = useRouter();
    const trpc = useTRPC();
    const createRecruitmentList = useCreateRecruitmentList();

    const form = useForm<CreateRecruitmentListFormValues>({
        resolver: zodResolver(createRecruitmentListFormSchema),
        defaultValues: {
            name: initialValues?.name ?? '',
            description: initialValues?.description ?? '',
            tags: normalizeTags(initialValues?.tags),
        },
    });

    const watchedTags = useWatch({
        control: form.control,
        name: 'tags',
        defaultValue: normalizeTags(initialValues?.tags),
    });

    const availableTagsQuery = useQuery(trpc.recruitmentListManagement.getAvailableTags.queryOptions());
    const availableTags = useMemo(() => {
        return normalizeTags([...(availableTagsQuery.data?.tags ?? []), ...(watchedTags ?? [])]);
    }, [availableTagsQuery.data?.tags, watchedTags]);

    const handleSubmit = form.handleSubmit(async (values) => {
        try {
            const response = await createRecruitmentList.mutateAsync({
                name: values.name,
                description: values.description,
                tags: values.tags,
            });

            if (response.tagsSaved) {
                toast.success('Recruitment list created');
            } else {
                toast.warning('Recruitment list created, but tags could not be saved', {
                    description: response.tagsError,
                });
            }
            router.push(`/home/${response.id}/settings/configs`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error('Could not create recruitment list', { description: message });
        }
    });

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                After creating this list, you can configure inclusion rules, data sources, and customizations in
                the <span className="font-medium text-foreground">Settings {'>'} Configs</span> menu.
            </p>

            <FieldGroup>
                <Controller
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="create-recruitment-list-name">Name</FieldLabel>
                            <Input
                                id="create-recruitment-list-name"
                                placeholder="Name of the recruitment list"
                                aria-invalid={fieldState.invalid}
                                {...field}
                            />
                            <FieldDescription>
                                This is the list name shown in your recruitment list overview.
                            </FieldDescription>
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="description"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="create-recruitment-list-description">Description</FieldLabel>
                            <Textarea
                                id="create-recruitment-list-description"
                                placeholder="Describe the goal or context of the recruitment list"
                                aria-invalid={fieldState.invalid}
                                {...field}
                            />
                            <FieldDescription>
                                Add a short summary to help your team understand this list.
                            </FieldDescription>
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="tags"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="create-recruitment-list-tags">Tags</FieldLabel>
                            <div id="create-recruitment-list-tags">
                                <TagEditorCompact
                                    availableTags={availableTags}
                                    value={normalizeTags(field.value)}
                                    onChange={(nextTags) => field.onChange(normalizeTags(nextTags))}
                                />
                            </div>
                            <FieldDescription>
                                Optional. Use tags to group and find recruitment lists faster.
                            </FieldDescription>
                            {availableTagsQuery.isPending && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Loader2 className="size-3 animate-spin motion-reduce:animate-none" />
                                    <span>Loading available tags...</span>
                                </div>
                            )}
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />
            </FieldGroup>


            <div className="flex justify-end">
                <Button type="submit" disabled={createRecruitmentList.isPending}>
                    {createRecruitmentList.isPending && (
                        <Loader2 className="mr-2 size-4 animate-spin motion-reduce:animate-none" />
                    )}
                    Create New
                </Button>
            </div>
        </form>
    );
};

export default CreateRecruitmentListForm;
