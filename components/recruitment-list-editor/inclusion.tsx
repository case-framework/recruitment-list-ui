import { AlertTriangle } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { RecruitmentList } from '@/lib/backend/types';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import InclusionCriteriaEditor from './inclusion-criteria-editor';
import NotificationEmailsEditor from './notification-emails-editor';

const Inclusion = () => {
    const form = useFormContext<RecruitmentList>();

    const studyKey = useWatch({
        control: form.control,
        name: 'participantInclusion.studyKey',
    });

    const type = useWatch({
        control: form.control,
        name: 'participantInclusion.type',
    });

    const autoConfig = useWatch({
        control: form.control,
        name: 'participantInclusion.autoConfig',
    });

    return (
        <div className="space-y-8">
            <FieldGroup>
                <Controller
                    control={form.control}
                    name="participantInclusion.studyKey"
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
                    name="participantInclusion.type"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Participant inclusion type</FieldLabel>
                            <RadioGroup
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    if (value === 'manual') {
                                        form.setValue('participantInclusion.autoConfig', undefined, { shouldDirty: true });
                                        form.setValue('participantInclusion.notificationEmails', undefined, { shouldDirty: true });
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

                {type === 'auto' && (
                    <Controller
                        control={form.control}
                        name="participantInclusion.autoConfig"
                        render={({ fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <InclusionCriteriaEditor
                                    autoConfig={autoConfig}
                                    onChange={(nextAutoConfig) => {
                                        form.setValue(
                                            'participantInclusion.autoConfig',
                                            nextAutoConfig === undefined ? undefined : nextAutoConfig,
                                            {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                                shouldValidate: true,
                                            }
                                        );
                                    }}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                )}

                {type === 'auto' && (
                    <Controller
                        control={form.control}
                        name="participantInclusion.notificationEmails"
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
        </div>
    );
};

export default Inclusion;
