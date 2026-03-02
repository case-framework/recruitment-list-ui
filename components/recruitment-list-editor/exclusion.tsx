import { useFormContext, useWatch } from 'react-hook-form';

import { RecruitmentList } from '@/lib/backend/types';
import MappingEditor from './mapping-editor';

const Exclusion = () => {
    const form = useFormContext<RecruitmentList>();
    const exclusionConditions = useWatch({
        control: form.control,
        name: 'exclusionConditions',
    });

    return (
        <div className='space-y-8'>
            <div>
                <p className='text-lg font-medium'>
                    Exclusion conditions (optional)
                </p>
                <p className='text-muted-foreground text-sm mb-4'>
                    If for any of the following the participant info contains the key and value, the participant will be excluded from the recruitment list. The participant infos and responses of this participant will be deleted form the list.
                </p>
                <MappingEditor
                    mapping={exclusionConditions ?? []}
                    onChange={(newMapping) => {
                        form.setValue('exclusionConditions', newMapping, {
                            shouldDirty: true,
                            shouldTouch: true,
                        });
                    }}
                />
            </div>
        </div>
    );
};

export default Exclusion;
