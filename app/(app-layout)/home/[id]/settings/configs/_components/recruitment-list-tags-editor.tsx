'use client'

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TagEditorCompact from '@/components/tag-editor-compact';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { updateRecruitmentListTags } from '@/lib/backend/recruitmentLists';

interface RecruitmentListTagsEditorProps {
    recruitmentListId: string;
    availableTags: string[];
    initialTags: string[];
}

const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

const normalizeTags = (tags: string[]) => {
    const cleaned = tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

    return Array.from(new Set(cleaned)).sort((a, b) => collator.compare(a, b));
};

const areTagsEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) {
        return false;
    }

    return a.every((tag, index) => tag === b[index]);
};

const RecruitmentListTagsEditor: React.FC<RecruitmentListTagsEditorProps> = ({
    recruitmentListId,
    availableTags,
    initialTags,
}) => {
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();
    const [editorSeed, setEditorSeed] = React.useState(0);
    const [savedTags, setSavedTags] = React.useState<string[]>(() => normalizeTags(initialTags));
    const [draftTags, setDraftTags] = React.useState<string[]>(() => normalizeTags(initialTags));

    const isDirty = !areTagsEqual(savedTags, draftTags);
    const availableTagOptions = React.useMemo(
        () => normalizeTags([...availableTags, ...savedTags, ...draftTags]),
        [availableTags, savedTags, draftTags]
    );

    const onReset = () => {
        setDraftTags(savedTags);
        setEditorSeed((previousValue) => previousValue + 1);
    };

    const onSave = () => {
        startTransition(async () => {
            const response = await updateRecruitmentListTags(recruitmentListId, draftTags);
            if (response.error !== undefined) {
                toast.error('Could not update recruitment list tags', {
                    description: response.error,
                });
                return;
            }

            setSavedTags(draftTags);
            toast.success('Recruitment list tags updated');
            router.refresh();
        });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Tags</CardTitle>
                <CardDescription>
                    Add tags to help categorize this list on the overview page.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TagEditorCompact
                    key={editorSeed}
                    availableTags={availableTagOptions}
                    initialTags={draftTags}
                    onChange={setDraftTags}
                />
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    disabled={!isDirty || isPending}
                >
                    Reset
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={!isDirty || isPending}
                >
                    {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Save tags
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RecruitmentListTagsEditor;
