'use client'

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecruitmentList, StudyAction } from '@/lib/backend/types';
import { Plus, Loader2, EyeIcon, GripVerticalIcon, EditIcon, DownloadIcon } from 'lucide-react';
import React from 'react';
import SortableWrapper from '@/components/sortable/SortableWrapper';
import SortableItem from '@/components/sortable/SortableItem';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import StudyActionEditor from './study-action-editor';
import { updateStudyActions } from '@/lib/backend/recruitmentLists';
import ExpressionPreview from '@/components/expression-preview/expression-preview';

interface StudyActionsContentProps {
    recruitmentList: RecruitmentList;
}

interface StudyActionItemProps {
    isPending?: boolean;
    isBeingDragged?: boolean;
    action: StudyAction;
    onChange?: (action: StudyAction) => void;
    onDelete?: (action: StudyAction) => void;

}

function StudyActionItem({ action, isBeingDragged, isPending, onChange, onDelete }: StudyActionItemProps) {
    const [isEditActionPopoverOpen, setIsEditActionPopoverOpen] = React.useState(false);

    const handleDownloadAction = () => {
        const blob = new Blob([action.encodedAction], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = action.label.replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <SortableItem id={action.id}>
            <div className={`flex justify-between items-center gap-2 p-2 border rounded-md border-border group bg-background relative ${isBeingDragged ? 'opacity-0' : ''}`}>
                <div className="absolute h-full top-0 -left-4 group-hover:flex hidden items-center justify-center">
                    <GripVerticalIcon className="size-4 text-muted-foreground " />
                </div>
                <div>
                    <p className="font-medium">{action.label}</p>
                    <pre className="text-muted-foreground text-xs">{action.description}</pre>
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon"><EyeIcon className="size-4" /></Button>
                        </PopoverTrigger>
                        <PopoverContent align='end'
                            className='w-[500px] max-h-[400px] overflow-y-auto relative'
                            data-no-dnd="true"
                        >
                            <ExpressionPreview
                                expressions={JSON.parse(action.encodedAction)}
                            />
                            <div className="flex items-center gap-2 mt-2 justify-end absolute bottom-4 right-4">
                                <Button variant="ghost" size="icon" onClick={handleDownloadAction}><DownloadIcon className="size-4" /></Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover
                        open={isEditActionPopoverOpen}
                        onOpenChange={setIsEditActionPopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon"><EditIcon className="size-4" /></Button>
                        </PopoverTrigger>
                        <PopoverContent align='end'
                            className='overflow-y-auto w-fit'
                            data-no-dnd="true"
                        >
                            <StudyActionEditor
                                isLoading={isPending || false}
                                open={isEditActionPopoverOpen}
                                action={action}
                                onChange={(action) => {
                                    onChange?.(action);
                                    setIsEditActionPopoverOpen(false);
                                }}
                                onDelete={() => {
                                    if (confirm('Are you sure you want to delete this action?')) {
                                        onDelete?.(action);
                                    }
                                    setIsEditActionPopoverOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </SortableItem>
    );
}

const StudyActionsContent: React.FC<StudyActionsContentProps> = ({ recruitmentList }) => {
    const [studyActions, setStudyActions] = React.useState<StudyAction[]>(recruitmentList.studyActions || []);
    const [draggedId, setDraggedId] = React.useState<string | null>(null);
    const [isPending, startTransition] = React.useTransition();

    const [isNewActionPopoverOpen, setIsNewActionPopoverOpen] = React.useState(false);



    const onUpdateStudyActions = async (actions: StudyAction[]) => {
        startTransition(async () => {
            if (!recruitmentList.id) {
                return;
            }
            await updateStudyActions(recruitmentList.id, actions);
        });
    }

    const draggedItem = studyActions.find((action) => action.id === draggedId);

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center gap-2">
                <div>
                    <h2 className="text-lg font-bold">Study Actions</h2>
                    <p className="text-muted-foreground text-sm">
                        Define the list of actions that can be triggered for participants in this recruitment list.
                    </p>
                </div>
                <Popover
                    open={isNewActionPopoverOpen}
                    onOpenChange={setIsNewActionPopoverOpen}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Action
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align='end'
                        className="w-fit"
                    >
                        <StudyActionEditor
                            isLoading={isPending}
                            open={isNewActionPopoverOpen}
                            action={undefined}
                            onChange={(action) => {
                                const newStudyActions = [...studyActions, action];
                                setStudyActions(newStudyActions);
                                setIsNewActionPopoverOpen(false);
                                onUpdateStudyActions(newStudyActions);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {studyActions.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div>
                            <h3 className="text-lg text-muted-foreground font-semibold">No Study Actions available yet.</h3>
                        </div>
                        <Button onClick={() => setIsNewActionPopoverOpen(true)}
                            className="flex items-center gap-2"
                            variant="outline"
                        >
                            <Plus className="h-4 w-4" />
                            Create First Action
                        </Button>
                    </div>
                </Card>
            ) : (
                <SortableWrapper
                    sortableID={`columns-for-responsive-matrix`}
                    items={studyActions.map((action) => ({
                        id: action.id,
                    }))}
                    onDraggedIdChange={(id) => {
                        setDraggedId(id);
                    }}
                    onReorder={(activeIndex, overIndex) => {
                        const newItems = [...studyActions];
                        newItems.splice(activeIndex, 1);
                        newItems.splice(overIndex, 0, studyActions[activeIndex]);
                        setStudyActions(newItems);
                        onUpdateStudyActions(newItems);
                    }}
                    dragOverlayItem={(draggedId && draggedItem) ?
                        <StudyActionItem
                            action={draggedItem}

                        />
                        : null}
                >
                    <ol className='px-1 space-y-1 py-2'>
                        {studyActions.map((action) => (
                            <StudyActionItem
                                key={action.id}
                                action={action}
                                isBeingDragged={draggedId === action.id}
                                onChange={(action) => {
                                    const newStudyActions = [...studyActions];
                                    const index = newStudyActions.findIndex((a) => a.id === action.id);
                                    newStudyActions[index] = action;
                                    setStudyActions(newStudyActions);
                                    onUpdateStudyActions(newStudyActions);
                                }}
                                onDelete={(action) => {
                                    const newStudyActions = [...studyActions];
                                    const index = newStudyActions.findIndex((a) => a.id === action.id);
                                    newStudyActions.splice(index, 1);
                                    setStudyActions(newStudyActions);
                                    onUpdateStudyActions(newStudyActions);
                                }}
                            />
                        ))}
                    </ol>
                </SortableWrapper>
            )}

            {isPending && <div className="flex justify-center items-center h-full gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Updating study actions...</p>
            </div>}
        </div>
    );
};

export default StudyActionsContent;