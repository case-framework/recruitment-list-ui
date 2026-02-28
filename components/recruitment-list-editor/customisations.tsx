import { ListCustomization } from '@/lib/backend/types';
import React from 'react';
import { ConfirmDialog } from '../confirm-dialog';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { LoadingButton } from '@/components/c-ui/loading-button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import EnumEditor from './enum-editor';
import { Separator } from '../ui/separator';

interface CustomisationsProps {
    isLoading: boolean;
    defaultValues: ListCustomization;
    onSubmit?: (values: ListCustomization) => void;
    onChange?: (values: ListCustomization) => void;
    onPrevious?: (values?: ListCustomization) => void;
    hideNavigation?: boolean;
}

const Customisations: React.FC<CustomisationsProps> = (props) => {
    const { onChange } = props;
    const onSubmit = props.onSubmit || (() => undefined);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const form = useForm<ListCustomization>({
        defaultValues: props.defaultValues,
    });

    const { isDirty } = form.formState

    React.useEffect(() => {
        if (!onChange) {
            return;
        }

        const subscription = form.watch((values) => {
            const statusValues = (values.recruitmentStatusValues || []).filter(
                (value): value is string => typeof value === 'string'
            );
            onChange({
                recruitmentStatusValues: statusValues,
            });
        });

        return () => subscription.unsubscribe();
    }, [form, onChange]);

    return (
        <>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FieldGroup>
                    <Controller
                        control={form.control}
                        name="recruitmentStatusValues"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Recruitment status values</FieldLabel>
                                <FieldDescription>
                                    These are the possible values for the recruitment status that can be assigned to participants.
                                </FieldDescription>
                                <EnumEditor
                                    values={field.value || []}
                                    onChange={field.onChange}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </FieldGroup>

                <Separator />

                {!props.hideNavigation && (
                    <div className='flex gap-4 justify-between pt-8'>
                        <Button
                            variant={'outline'}
                            className='w-52'
                            type='button'
                            disabled={props.isLoading}
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
                        <LoadingButton
                            type="submit"
                            isLoading={props.isLoading}
                            className='w-52'
                        >
                            Save
                        </LoadingButton>
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
                        props.onPrevious?.(form.getValues())

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

export default Customisations;
