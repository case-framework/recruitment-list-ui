import { ParticipantInclusion, participantInclusionSchema } from '@/lib/backend/types';
import React from 'react';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ConfirmDialog } from '../confirm-dialog';
import InclusionCriteriaEditor from './inclusion-criteria-editor';
import NotificationEmailsEditor from './notification-emails-editor';


interface InclusionProps {
    onSubmit: (values: ParticipantInclusion) => void;
    defaultValues: ParticipantInclusion;
    onPrevious?: () => void;
}

const Inclusion: React.FC<InclusionProps> = (props) => {
    const form = useForm<ParticipantInclusion>({
        resolver: zodResolver(participantInclusionSchema),
        defaultValues: props.defaultValues,
    })

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

    const { isDirty } = form.formState;


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(props.onSubmit)} className="space-y-8">

                <FormField
                    control={form.control}
                    name="studyKey"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Study Key</FormLabel>
                            <FormControl>
                                <Input placeholder="enter the study key..." {...field} />
                            </FormControl>
                            <FormDescription>
                                Define the study key from which participants will be selected.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Participant inclusion type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={(value) => {

                                        field.onChange(value);
                                        if (value === 'manual') {
                                            form.setValue('autoConfig', undefined);
                                        }
                                    }}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormLabel className="font-normal flex items-center space-x-3 space-y-0 cursor-pointer">
                                            <FormControl>
                                                <RadioGroupItem value="manual" />
                                            </FormControl>
                                            <span>
                                                Manual only
                                            </span>
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="">
                                        <FormLabel className="font-normal flex items-center space-x-3 space-y-0 cursor-pointer">
                                            <FormControl>
                                                <RadioGroupItem value="auto" />
                                            </FormControl>
                                            <span>
                                                Automatically
                                            </span>
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {form.watch('type') === 'auto' && (
                    <FormField
                        control={form.control}
                        name="autoConfig"
                        render={({ field }) => (
                            <FormItem>
                                <InclusionCriteriaEditor
                                    autoConfig={field.value}
                                    onChange={(autoConfig) => field.onChange(autoConfig)}
                                />
                            </FormItem>
                        )}
                    />
                )}

                {form.watch('type') === 'auto' && (
                    <FormField
                        control={form.control}
                        name="notificationEmails"
                        render={({ field }) => (
                            <FormItem>
                                <NotificationEmailsEditor
                                    notificationEmails={field.value}
                                    onChange={(notificationEmails) => field.onChange(notificationEmails)}
                                />
                            </FormItem>
                        )}
                    />
                )}

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
                            props.onPrevious && props.onPrevious()
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
            </form>
            <ConfirmDialog
                isOpen={confirmDialogOpen}
                onClose={() => {
                    props.onPrevious && props.onPrevious()
                    setConfirmDialogOpen(false);
                }}
                onConfirm={() => {
                    setConfirmDialogOpen(false);
                    props.onSubmit(form.getValues());
                    props.onPrevious && props.onPrevious()

                }}
                title="Confirm"
                description="You have unsaved changes on the current page. Apply these before continuing."
                confirmText='Yes'
                cancelText='No'
            />
        </Form >
    );
};

export default Inclusion;
