import { Controller, useFormContext } from 'react-hook-form';

import { RecruitmentList } from '@/lib/backend/types';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import EnumEditor from './enum-editor';

const Customisations = () => {
    const form = useFormContext<RecruitmentList>();

    return (
        <div className='space-y-4'>
            <FieldGroup>
                <Controller
                    control={form.control}
                    name="customization.recruitmentStatusValues"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Recruitment status values</FieldLabel>
                            <FieldDescription>
                                These are the possible values for the recruitment status that can be assigned to participants.
                            </FieldDescription>
                            <EnumEditor
                                values={field.value ?? []}
                                onChange={field.onChange}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldGroup>
        </div>
    );
};

export default Customisations;
