import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUpDownIcon, SortAscIcon, SortDescIcon } from 'lucide-react';
import React from 'react';

interface SortEditorProps {
}

const SortEditor: React.FC<SortEditorProps> = (props) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={'outline'}
                    size={'sm'}
                    className='flex items-center gap-2'
                >
                    <span>
                        <ArrowUpDownIcon className='size-3 text-muted-foreground' />
                    </span>
                    Sort
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    Sort by
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value='includedAt'>
                    <DropdownMenuRadioItem value='includedAt'>
                        Imported at
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value='participantId'>
                        Participant ID
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value='recruitmentStatus'>
                        Status
                    </DropdownMenuRadioItem>

                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                    Sort direction
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value='asc'>
                    <DropdownMenuRadioItem value='asc'>
                        <SortAscIcon className='mr-2 text-muted-foreground size-3' />
                        Ascending
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value='desc'>
                        <SortDescIcon className='mr-2 text-muted-foreground size-3' />
                        Descending
                    </DropdownMenuRadioItem>

                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default SortEditor;
