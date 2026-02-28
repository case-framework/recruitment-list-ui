import React from 'react';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { recruitmentListInfoSchema } from '@/lib/backend/types';
import { Controller, useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';

interface GeneralProps {
    onSubmit?: (values: z.infer<typeof recruitmentListInfoSchema>) => void;
    onChange?: (values: z.infer<typeof recruitmentListInfoSchema>) => void;
    defaultValues: z.infer<typeof recruitmentListInfoSchema>;
    hideNavigation?: boolean;
}

const General: React.FC<GeneralProps> = (props) => {
    const { onChange } = props;
    const form = useForm<z.infer<typeof recruitmentListInfoSchema>>({
        resolver: zodResolver(recruitmentListInfoSchema),
        defaultValues: props.defaultValues,
    })

    React.useEffect(() => {
        if (!onChange) {
            return;
        }

        const subscription = form.watch((values) => {
            onChange({
                name: values.name || "",
                description: values.description || "",
            });
        });

        return () => subscription.unsubscribe();
    }, [form, onChange]);

    const onSubmit = props.onSubmit || (() => undefined);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FieldGroup>
                <Controller
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Name</FieldLabel>
                            <Input placeholder="Name of the recruitment list" {...field} />
                            <FieldDescription>
                                This is your public display name.
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="description"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Description</FieldLabel>
                            <Textarea placeholder="Describe the goal or context of the recruitment list" {...field} />
                            <FieldDescription>
                                Add a short description for the recruitment list.
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldGroup>

            {!props.hideNavigation && (
                <div className='flex gap-4 justify-end'>
                    <Button type="submit"
                        className='w-52'
                    >
                        Next
                    </Button>
                </div>
            )}
        </form>
    );
};

export default General;
