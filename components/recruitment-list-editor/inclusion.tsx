import { ParticipantInclusion, participantInclusionSchema } from '@/lib/backend/types';
import React from 'react';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from '../ui/button';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ConfirmDialog } from '../confirm-dialog';
import InclusionCriteriaEditor from './inclusion-criteria-editor';
import NotificationEmailsEditor from './notification-emails-editor';


interface InclusionProps {
    onSubmit?: (values: ParticipantInclusion) => void;
    onChange?: (values: ParticipantInclusion) => void;
    defaultValues: ParticipantInclusion;
    onPrevious?: () => void;
    hideNavigation?: boolean;
}

const Inclusion: React.FC<InclusionProps> = (props) => {
    const { onChange } = props;
    const onSubmit = props.onSubmit || (() => undefined);
    const form = useForm<ParticipantInclusion>({
        resolver: zodResolver(participantInclusionSchema),
        defaultValues: props.defaultValues,
    })

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

    const { isDirty } = form.formState;

    React.useEffect(() => {
        if (!onChange) {
            return;
        }

        const subscription = form.watch((values) => {
            const notificationEmails = values.notificationEmails?.filter(
                (value): value is string => typeof value === 'string'
            );
            onChange({
                studyKey: values.studyKey || "",
                type: values.type === 'auto' ? 'auto' : 'manual',
                autoConfig: values.autoConfig,
                notificationEmails: notificationEmails,
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
                        name="studyKey"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Study Key</FieldLabel>
                                <Input placeholder="enter the study key..." {...field} />
                                <FieldDescription>
                                    Define the study key from which participants will be selected.
                                </FieldDescription>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="type"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Participant inclusion type</FieldLabel>
                                <RadioGroup
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        if (value === 'manual') {
                                            form.setValue('autoConfig', undefined);
                                        }
                                    }}
                                    value={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <label className="font-normal flex items-center space-x-3 space-y-0 cursor-pointer">
                                        <RadioGroupItem value="manual" />
                                        <span>Manual only</span>
                                    </label>
                                    <label className="font-normal flex items-center space-x-3 space-y-0 cursor-pointer">
                                        <RadioGroupItem value="auto" />
                                        <span>Automatically</span>
                                    </label>
                                </RadioGroup>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {form.watch('type') === 'auto' && (
                        <Controller
                            control={form.control}
                            name="autoConfig"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <InclusionCriteriaEditor
                                        autoConfig={field.value}
                                        onChange={field.onChange}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    )}

                    {form.watch('type') === 'auto' && (
                        <Controller
                            control={form.control}
                            name="notificationEmails"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <NotificationEmailsEditor
                                        notificationEmails={field.value}
                                        onChange={field.onChange}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    )}
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

export default Inclusion;
