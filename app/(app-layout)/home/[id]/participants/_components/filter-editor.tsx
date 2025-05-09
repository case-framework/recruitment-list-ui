import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ParticipantFilters } from '@/lib/backend/participants';
import { format } from 'date-fns';
import { CalendarIcon, FilterIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

interface FilterEditorProps {
    statusValues: string[]
}

// Format a date for display
const formatDateForDisplay = (date: Date) => {
    return date ? format(date, 'yyyy-MM-dd') : ""
}

const FilterEditor: React.FC<FilterEditorProps> = (props) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);

    const [currentFilters, setCurrentFilters] = useState<ParticipantFilters>({
        participantId: null,
        recruitmentStatus: null,
        includedSince: null,
        includedUntil: null,
    })


    useEffect(() => {
        setCurrentFilters({
            participantId: searchParams.get('participantId') || null,
            recruitmentStatus: searchParams.get('recruitmentStatus') || null,
            includedSince: searchParams.get('includedSince') || null,
            includedUntil: searchParams.get('includedUntil') || null,
        })
    }, [open, searchParams])

    const hasChanges = () => {
        return currentFilters.participantId !== searchParams.get('participantId') ||
            currentFilters.recruitmentStatus !== searchParams.get('recruitmentStatus') ||
            currentFilters.includedSince !== searchParams.get('includedSince') ||
            currentFilters.includedUntil !== searchParams.get('includedUntil')
    }

    const hasFilters = () => {
        return searchParams.get('participantId') !== null ||
            searchParams.get('recruitmentStatus') !== null ||
            searchParams.get('includedSince') !== null ||
            searchParams.get('includedUntil') !== null
    }

    const createQueryString = useCallback(
        (filters: ParticipantFilters) => {
            const params = new URLSearchParams(searchParams.toString())
            if (filters.participantId !== null) {
                params.set('participantId', filters.participantId)
            } else {
                params.delete('participantId')
            }
            if (filters.recruitmentStatus !== null) {
                params.set('recruitmentStatus', filters.recruitmentStatus)
            } else {
                params.delete('recruitmentStatus')
            }
            if (filters.includedSince !== null) {
                params.set('includedSince', filters.includedSince)
            } else {
                params.delete('includedSince')
            }
            if (filters.includedUntil !== null) {
                params.set('includedUntil', filters.includedUntil)
            } else {
                params.delete('includedUntil')
            }
            return params.toString()
        },
        [searchParams]
    )

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
        >
            <PopoverTrigger asChild>
                <Button
                    className='flex items-center gap-2'
                    variant={hasFilters() ? 'default' : 'outline'}
                    size={'sm'}
                >
                    <span>
                        <FilterIcon className='size-3' />
                    </span>
                    Filters
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end'
                className='w-fit'
            >
                <div className='w-96 space-y-4'>
                    <h3 className='text-lg font-bold'>Filter by</h3>

                    <Label
                        className='space-y-1.5 block'
                    >
                        <span>
                            Participant ID
                        </span>
                        <Input
                            placeholder='ID of participant to find'
                            className='w-full text-xs font-mono'
                            value={currentFilters.participantId || ''}
                            onChange={e => {
                                const value = e.target.value || null;
                                setCurrentFilters({ ...currentFilters, participantId: value })
                            }}
                        />

                    </Label>

                    {props.statusValues.length > 0 && <Label
                        className='space-y-1.5 block'
                    >
                        <span>
                            Recruitment status
                        </span>
                        <Select
                            value={currentFilters.recruitmentStatus || ''}
                            onValueChange={value => {
                                if (value === '___') {
                                    setCurrentFilters({ ...currentFilters, recruitmentStatus: null })
                                    return;
                                }
                                setCurrentFilters({ ...currentFilters, recruitmentStatus: value })
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select recruitment status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="___"
                                    className='text-muted-foreground'
                                >
                                    Clear status filter
                                </SelectItem>
                                <Separator />
                                {props.statusValues.map(status => (
                                    <SelectItem
                                        key={status}
                                        value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Label>}

                    <div className='flex gap-4 justify-between'>
                        <div className="space-y-1 w-44">
                            <Label htmlFor="startDate">Imported later than</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="startDate"
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {currentFilters.includedSince ? formatDateForDisplay(new Date(currentFilters.includedSince)) : "Pick a start date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={currentFilters.includedSince ? new Date(currentFilters.includedSince) : undefined}
                                        defaultMonth={currentFilters.includedSince ? new Date(currentFilters.includedSince) : undefined}
                                        onSelect={(date) => {
                                            if (!date) {
                                                setCurrentFilters({ ...currentFilters, includedSince: null })
                                                return;
                                            }
                                            setCurrentFilters({ ...currentFilters, includedSince: date.toISOString() })
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-1 w-44">
                            <Label htmlFor="endDate">Imported earlier than</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="endDate"
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {currentFilters.includedUntil ? formatDateForDisplay(new Date(currentFilters.includedUntil)) : "Pick a end date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        defaultMonth={currentFilters.includedUntil ? new Date(currentFilters.includedUntil) : undefined}
                                        selected={currentFilters.includedUntil ? new Date(currentFilters.includedUntil) : undefined}
                                        onSelect={(date) => {
                                            if (!date) {
                                                setCurrentFilters({ ...currentFilters, includedUntil: null })
                                                return;
                                            }
                                            setCurrentFilters({ ...currentFilters, includedUntil: date.toISOString() })
                                        }}

                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <Separator />

                    <div className='flex items-center justify-end gap-2'>
                        <Button
                            variant={'outline'}
                            onClick={() => {
                                const newFilters = {
                                    participantId: null,
                                    recruitmentStatus: null,
                                    includedSince: null,
                                    includedUntil: null,
                                }
                                router.push(pathname + '?' + createQueryString(newFilters))
                                setOpen(false)
                            }}
                            disabled={!hasFilters()}
                        >
                            Clear filters
                        </Button>

                        <Button
                            disabled={!hasChanges()}
                            onClick={() => {
                                router.push(pathname + '?' + createQueryString(currentFilters))
                                setOpen(false)
                            }}
                        >
                            Apply
                        </Button>
                    </div>

                </div>
            </PopoverContent>
        </Popover>
    );
};

export default FilterEditor;
