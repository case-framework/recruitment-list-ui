import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUpDownIcon, SortAscIcon, SortDescIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback } from 'react';


const SortEditor: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            return params.toString()
        },
        [searchParams]
    )

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
                <DropdownMenuRadioGroup
                    value={searchParams.get('sortBy') || 'includedAt'}
                    onValueChange={value => router.push(pathname + '?' + createQueryString('sortBy', value))}
                >
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
                <DropdownMenuRadioGroup
                    value={searchParams.get('sortDir') || 'asc'}
                    onValueChange={value => router.push(pathname + '?' + createQueryString('sortDir', value))}
                >
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
