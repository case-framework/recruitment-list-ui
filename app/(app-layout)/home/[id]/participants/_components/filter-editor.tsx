import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FilterIcon } from 'lucide-react';
import React from 'react';

interface FilterEditorProps {
}

const FilterEditor: React.FC<FilterEditorProps> = (props) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    className='flex items-center gap-2'
                    variant='outline'
                    size={'sm'}
                >
                    <span>
                        <FilterIcon className='size-3 text-muted-foreground' />
                    </span>
                    Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end'>
                <p>FilterEditor</p>
            </PopoverContent>
        </Popover>
    );
};

export default FilterEditor;
