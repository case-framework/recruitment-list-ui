import { ExclusionCondition } from '@/lib/backend/types';
import React from 'react';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../confirm-dialog';
import MappingEditor from './mapping-editor';

interface ExclusionProps {
    onSubmit?: (values?: ExclusionCondition[]) => void;
    onChange?: (values: ExclusionCondition[]) => void;
    defaultValues?: ExclusionCondition[];
    onPrevious?: () => void;
    hideNavigation?: boolean;
}

const Exclusion: React.FC<ExclusionProps> = (props) => {
    const onSubmit = props.onSubmit || (() => undefined);
    const [currentExlusionConditions, setCurrentExlusionConditions] = React.useState<ExclusionCondition[]>(props.defaultValues || []);
    const [isDirty, setIsDirty] = React.useState(false);

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);



    return (
        <div className='space-y-8'>
            <div className=''>
                <p className='text-lg font-medium'>
                    Exclusion conditions (optional)
                </p>
                <p className='text-muted-foreground text-sm mb-4'>
                    If for any of the following the participant info contains the key and value, the participant will be excluded from the recruitment list. The participant infos and responses of this participant will be deleted form the list.
                </p>
                <MappingEditor
                    mapping={currentExlusionConditions}
                    onChange={(newMapping) => {
                        setCurrentExlusionConditions(newMapping);
                        setIsDirty(true);
                        props.onChange?.(newMapping);
                    }}
                />
            </div>
            {!props.hideNavigation && (
                <div className='flex gap-4 justify-between'>
                    <Button
                        variant={'outline'}
                        className='w-52'
                        type='button'
                        onClick={() => {
                            if (isDirty) {
                                setConfirmDialogOpen(true);
                                return;
                            }
                            props.onPrevious?.()
                        }}
                    >
                        Previous
                    </Button>
                    <Button

                        className='w-52'
                        onClick={() => {
                            onSubmit(currentExlusionConditions);
                        }}
                    >
                        Next
                    </Button>
                </div>
            )}

            {!props.hideNavigation && (
                <ConfirmDialog
                    isOpen={confirmDialogOpen}
                    onClose={() => {
                        props.onPrevious?.()
                        setConfirmDialogOpen(false);
                    }}
                    onConfirm={() => {
                        setConfirmDialogOpen(false);
                        onSubmit(currentExlusionConditions);
                        props.onPrevious?.()

                    }}
                    title="Confirm"
                    description="You have unsaved changes on the current page. Apply these before continuing."
                    confirmText='Yes'
                    cancelText='No'
                />
            )}
        </div>
    );
};

export default Exclusion;
