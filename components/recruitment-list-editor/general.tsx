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
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { recruitmentListInfoSchema } from '@/lib/backend/types';
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';

interface GeneralProps {
    onSubmit: (values: z.infer<typeof recruitmentListInfoSchema>) => void;
    defaultValues: z.infer<typeof recruitmentListInfoSchema>;
}

const General: React.FC<GeneralProps> = (props) => {
    const form = useForm<z.infer<typeof recruitmentListInfoSchema>>({
        resolver: zodResolver(recruitmentListInfoSchema),
        defaultValues: props.defaultValues,
    })



    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(props.onSubmit)} className="space-y-8">

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Name of the recruitment list" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe the goal or context of the recruitment list" {...field} />
                            </FormControl>
                            <FormDescription>
                                Add a short description for the recruitment list.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <div className='flex gap-4 justify-end'>
                    <Button type="submit"
                        className='w-52'
                    >
                        Next
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default General;
