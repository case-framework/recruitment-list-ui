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
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import InclusionCriteriaEditor from './inclusion-criteria-editor';
import NotificationEmailsEditor from './notification-emails-editor';
import { AlertTriangle } from 'lucide-react';


interface InclusionProps {
    onSubmit?: (values: ParticipantInclusion) => void;
    onChange?: (values: ParticipantInclusion) => void;
    defaultValues: ParticipantInclusion;
}

const Inclusion: React.FC<InclusionProps> = (props) => {
    const { onChange } = props;
    const onSubmit = props.onSubmit || (() => undefined);
    const form = useForm<ParticipantInclusion>({
        resolver: zodResolver(participantInclusionSchema),
        mode: 'onChange',
        defaultValues: props.defaultValues,
    })

    const studyKey = form.watch('studyKey');

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
                                {studyKey?.trim() === '__not_configured__' && (
                                    <p className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                        <span>
                                            This list is still using the placeholder study key. Set a real study key before production use.
                                        </span>
                                    </p>
                                )}
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
            </form>
        </>
    );
};

export default Inclusion;
