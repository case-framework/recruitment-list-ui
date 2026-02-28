import { ExclusionCondition } from '@/lib/backend/types';
import React, { useState } from 'react';
import MappingEditor from './mapping-editor';

interface ExclusionProps {
    onSubmit?: (values?: ExclusionCondition[]) => void;
    onChange?: (values: ExclusionCondition[]) => void;
    defaultValues?: ExclusionCondition[];
}

const Exclusion: React.FC<ExclusionProps> = (props) => {
    const [currentExlusionConditions, setCurrentExlusionConditions] = useState<ExclusionCondition[]>(props.defaultValues || []);

    return (
        <div className='space-y-8'>
            <div className=''>
                <p className='text-lg font-medium'>
                    Exclusion conditions (optional)
                </p>
                <p className='text-muted-foreground text-sm mb-4'>
                    If for any of the following the participant info contains the key and value, the participant will be excluded from the recruitment list. The participant infos and responses of this participant will be deleted form the list.
                </p>
                <MappingEditor
                    mapping={currentExlusionConditions}
                    onChange={(newMapping) => {
                        setCurrentExlusionConditions(newMapping);
                        props.onChange?.(newMapping);
                    }}
                />
            </div>
        </div>
    );
};

export default Exclusion;
