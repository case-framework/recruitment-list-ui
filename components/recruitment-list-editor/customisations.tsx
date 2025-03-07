import { ListCustomization } from '@/lib/backend/types';
import React from 'react';
import { ConfirmDialog } from '../confirm-dialog';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import LoadingButton from '../loading-button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import EnumEditor from './enum-editor';
import { Separator } from '../ui/separator';

interface CustomisationsProps {
    isLoading: boolean;
    defaultValues: ListCustomization;
    onSubmit: (values: ListCustomization) => void;
    onPrevious: (values?: ListCustomization) => void;
}

const Customisations: React.FC<CustomisationsProps> = (props) => {
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const form = useForm<ListCustomization>({
        defaultValues: props.defaultValues,
    });

    const { isDirty } = form.formState

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(props.onSubmit)} className='space-y-4'>
                <FormField
                    control={form.control}
                    name="recruitmentStatusValues"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Recruitment status values</FormLabel>
                            <FormDescription>
                                These are the possible values for the recruitment status that can be assigned to participants.
                            </FormDescription>
                            <FormControl>
                                <EnumEditor
                                    values={field.value || []}
                                    onChange={values => field.onChange(values)}
                                />

                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator />

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
                            props.onPrevious && props.onPrevious()
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

            </form>
            <ConfirmDialog
                isOpen={confirmDialogOpen}
                onClose={() => {
                    props.onPrevious && props.onPrevious()
                    setConfirmDialogOpen(false);
                }}
                onConfirm={() => {
                    setConfirmDialogOpen(false);
                    props.onPrevious && props.onPrevious(form.getValues())

                }}
                title="Confirm"
                description="You have unsaved changes on the current page. Apply these before continuing."
                confirmText='Yes'
                cancelText='No'
            />
        </Form>
    );
};

export default Customisations;
