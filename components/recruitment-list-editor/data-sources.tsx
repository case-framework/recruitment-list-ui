import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import ParticipantInfoSourceEditor from './participant-info-source-editor';
import { ParticipantData, participantDataSchema } from '@/lib/backend/types';
import { Button } from '../ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfirmDialog } from '../confirm-dialog';
import { Separator } from '../ui/separator';
import ResearchDataSourceEditor from './research-data-source-editor';

interface DataSourcesProps {
    onSubmit?: (values: ParticipantData) => void;
    onChange?: (values: ParticipantData) => void;
    defaultValues: ParticipantData;
    onPrevious?: () => void;
    hideNavigation?: boolean;
}

const DataSources: React.FC<DataSourcesProps> = (props) => {
    const { onChange } = props;
    const onSubmit = props.onSubmit || (() => undefined);
    const form = useForm<ParticipantData>({
        resolver: zodResolver(participantDataSchema),
        defaultValues: props.defaultValues,
    })

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

    const { isDirty } = form.formState;

    React.useEffect(() => {
        if (!onChange) {
            return;
        }

        const subscription = form.watch((values) => {
            const participantInfos = (values.participantInfos || []).filter((value) => value !== undefined);
            const researchData = (values.researchData || []).filter((value) => value !== undefined);
            onChange({
                participantInfos: participantInfos as ParticipantData["participantInfos"],
                researchData: researchData as ParticipantData["researchData"],
            });
        });

        return () => subscription.unsubscribe();
    }, [form, onChange]);


    return (
        <>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FieldGroup>
                    <Controller
                        control={form.control}
                        name="participantInfos"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel className='text-lg'>
                                    Participant Info Source
                                </FieldLabel>
                                <ParticipantInfoSourceEditor
                                    values={field.value}
                                    onChange={field.onChange}
                                />
                                <FieldDescription>
                                    Configure what data source should be used to populate the participant info. This will be used to create the participant info table.
                                </FieldDescription>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Separator />

                    <Controller
                        control={form.control}
                        name="researchData"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel className='text-lg'>
                                    Research Data Source
                                </FieldLabel>
                                <ResearchDataSourceEditor
                                    values={field.value}
                                    onChange={field.onChange}
                                />
                                <FieldDescription>
                                    What responses should be available in this recruitment list.
                                </FieldDescription>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </FieldGroup>

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
                        <Button type="submit"
                            className='w-52'
                        >
                            Next
                        </Button>
                    </div>
                )}
            </form>
            {!props.hideNavigation && (
                <ConfirmDialog
                    isOpen={confirmDialogOpen}
                    onClose={() => {
                        props.onPrevious?.()
                        setConfirmDialogOpen(false);
                    }}
                    onConfirm={() => {
                        setConfirmDialogOpen(false);
                        onSubmit(form.getValues());
                        props.onPrevious?.()

                    }}
                    title="Confirm"
                    description="You have unsaved changes on the current page. Apply these before continuing."
                    confirmText='Yes'
                    cancelText='No'
                />
            )}
        </>
    );
};

export default DataSources;
