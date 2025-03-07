import React from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import ParticipantInfoSourceEditor from './participant-info-source-editor';
import { ParticipantData, participantDataSchema } from '@/lib/backend/types';
import { Button } from '../ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ConfirmDialog } from '../confirm-dialog';
import { Separator } from '../ui/separator';
import ResearchDataSourceEditor from './research-data-source-editor';

interface DataSourcesProps {
    onSubmit: (values: ParticipantData) => void;
    defaultValues: ParticipantData;
    onPrevious?: () => void;
}

const DataSources: React.FC<DataSourcesProps> = (props) => {
    const form = useForm<ParticipantData>({
        resolver: zodResolver(participantDataSchema),
        defaultValues: props.defaultValues,
    })

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

    const { isDirty } = form.formState;


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(props.onSubmit)} className="space-y-8">

                <FormField
                    control={form.control}
                    name="participantInfos"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-lg'>
                                Participant Info Source
                            </FormLabel>
                            <FormDescription>
                                Configure what data source should be used to populate the participant info. This will be used to create the participant info table.
                            </FormDescription>
                            <FormControl>
                                <ParticipantInfoSourceEditor
                                    values={field.value}
                                    onChange={(values) => field.onChange(values)}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator />

                <FormField
                    control={form.control}
                    name="researchData"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-lg'>
                                Research Data Source
                            </FormLabel>
                            <FormDescription>
                                What responses should be available in this recruitment list.
                            </FormDescription>
                            <FormControl>
                                <ResearchDataSourceEditor
                                    values={field.value}
                                    onChange={(values) => field.onChange(values)}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )} />


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

export default DataSources;
