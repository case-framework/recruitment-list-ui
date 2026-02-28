import { Controller, useFormContext } from 'react-hook-form';

import { RecruitmentList } from '@/lib/backend/types';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';

const General = () => {
    const form = useFormContext<RecruitmentList>();

    return (
        <div className="space-y-8">
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
        </div>
    );
};

export default General;
