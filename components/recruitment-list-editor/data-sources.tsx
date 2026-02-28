import { Controller, useFormContext } from 'react-hook-form';

import { RecruitmentList } from '@/lib/backend/types';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Separator } from '../ui/separator';
import ParticipantInfoSourceEditor from './participant-info-source-editor';
import ResearchDataSourceEditor from './research-data-source-editor';

const DataSources = () => {
    const form = useFormContext<RecruitmentList>();

    return (
        <div className="space-y-8">
            <FieldGroup>
                <Controller
                    control={form.control}
                    name="participantData.participantInfos"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className='text-lg'>
                                Participant Info Source
                            </FieldLabel>
                            <ParticipantInfoSourceEditor
                                values={field.value}
                                onChange={field.onChange}
                            />
                            <FieldDescription>
                                Configure what data source should be used to populate the participant info. This will be used to create the participant info table.
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Separator />

                <Controller
                    control={form.control}
                    name="participantData.researchData"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className='text-lg'>
                                Research Data Source
                            </FieldLabel>
                            <ResearchDataSourceEditor
                                values={field.value}
                                onChange={field.onChange}
                            />
                            <FieldDescription>
                                What responses should be available in this recruitment list.
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldGroup>
        </div>
    );
};

export default DataSources;
