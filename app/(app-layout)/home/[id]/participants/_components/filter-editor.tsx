import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ParticipantFilters } from '@/lib/backend/participants';
import { areParticipantInfoFiltersEqual, parseParticipantInfoFiltersFromEntries, replaceParticipantInfoFiltersInQuery } from '@/lib/participants/filter-utils';
import { format } from 'date-fns';
import { CalendarIcon, FilterIcon, PlusIcon, XIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useEffectEvent, useState } from 'react';

interface FilterEditorProps {
    statusValues: string[]
}

interface InfoFilterRow {
    id: string
    key: string
    value: string
}

// Format a date for display
const formatDateForDisplay = (date: Date) => {
    return date ? format(date, 'yyyy-MM-dd') : ""
}

const createInfoFilterRow = (key = '', value = ''): InfoFilterRow => {
    return {
        id: `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`,
        key,
        value,
    }
}

const mapInfoFilterRowsToRecord = (rows: InfoFilterRow[]) => {
    const infoFilters: Record<string, string> = {}
    for (const row of rows) {
        const key = row.key.trim()
        const value = row.value
        if (!key || !value.trim()) {
            continue
        }

        infoFilters[key] = value
    }

    return infoFilters
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
        infos: {},
    })
    const [currentInfoFilters, setCurrentInfoFilters] = useState<InfoFilterRow[]>([])

    const onSetCurrentFilters = useEffectEvent(() => {
        const infoFilters = parseParticipantInfoFiltersFromEntries(searchParams)
        setCurrentFilters({
            participantId: searchParams.get('participantId') || null,
            recruitmentStatus: searchParams.get('recruitmentStatus') || null,
            includedSince: searchParams.get('includedSince') || null,
            includedUntil: searchParams.get('includedUntil') || null,
            infos: infoFilters,
        })
        setCurrentInfoFilters(Object.entries(infoFilters).map(([key, value]) => createInfoFilterRow(key, value)))
    })


    useEffect(() => {
        onSetCurrentFilters()
    }, [open])

    const hasChanges = () => {
        const searchParamInfos = parseParticipantInfoFiltersFromEntries(searchParams)
        return currentFilters.participantId !== searchParams.get('participantId') ||
            currentFilters.recruitmentStatus !== searchParams.get('recruitmentStatus') ||
            currentFilters.includedSince !== searchParams.get('includedSince') ||
            currentFilters.includedUntil !== searchParams.get('includedUntil') ||
            !areParticipantInfoFiltersEqual(mapInfoFilterRowsToRecord(currentInfoFilters), searchParamInfos)
    }

    const hasFilters = () => {
        return searchParams.get('participantId') !== null ||
            searchParams.get('recruitmentStatus') !== null ||
            searchParams.get('includedSince') !== null ||
            searchParams.get('includedUntil') !== null ||
            Object.keys(parseParticipantInfoFiltersFromEntries(searchParams)).length > 0
    }

    const createQueryString = useCallback(
        (filters: ParticipantFilters, infoFilters: InfoFilterRow[]) => {
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

            replaceParticipantInfoFiltersInQuery(params, mapInfoFilterRowsToRecord(infoFilters))
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

                    <Field>
                        <FieldLabel>Participant ID</FieldLabel>
                        <Input
                            placeholder='ID of participant to find'
                            className='w-full text-xs font-mono'
                            value={currentFilters.participantId || ''}
                            onChange={e => {
                                const value = e.target.value || null;
                                setCurrentFilters({ ...currentFilters, participantId: value })
                            }}
                        />
                    </Field>

                    {props.statusValues.length > 0 && (
                        <Field>
                            <FieldLabel>Recruitment status</FieldLabel>
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
                                    <SelectItem value="_empty_"
                                        className='text-muted-foreground'
                                    >
                                        Has no status
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
                        </Field>
                    )}

                    <div className='flex gap-4 justify-between'>
                        <Field className="w-44">
                            <FieldLabel htmlFor="startDate">Imported later than</FieldLabel>
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
                        </Field>

                        <Field className="w-44">
                            <FieldLabel htmlFor="endDate">Imported earlier than</FieldLabel>
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
                        </Field>
                    </div>

                    <Separator />

                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <FieldLabel>Info filters</FieldLabel>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setCurrentInfoFilters([...currentInfoFilters, createInfoFilterRow()])}
                            >
                                <PlusIcon className='size-3' />
                                Add info filter
                            </Button>
                        </div>

                        {currentInfoFilters.length === 0 && (
                            <p className='text-xs text-muted-foreground'>
                                No info filters added yet.
                            </p>
                        )}

                        {currentInfoFilters.map(infoFilter => (
                            <div
                                key={infoFilter.id}
                                className='grid grid-cols-[1fr_1fr_auto] items-center gap-2'
                            >
                                <Input
                                    value={infoFilter.key}
                                    className='font-mono text-xs'
                                    placeholder='Info key'
                                    onChange={(e) => {
                                        setCurrentInfoFilters(currentInfoFilters.map(row => row.id === infoFilter.id ? {
                                            ...row,
                                            key: e.target.value,
                                        } : row))
                                    }}
                                />
                                <Input
                                    value={infoFilter.value}
                                    className='font-mono text-xs'
                                    placeholder='Value'
                                    onChange={(e) => {
                                        setCurrentInfoFilters(currentInfoFilters.map(row => row.id === infoFilter.id ? {
                                            ...row,
                                            value: e.target.value,
                                        } : row))
                                    }}
                                />
                                <Button
                                    size='icon'
                                    variant='ghost'
                                    className='size-8'
                                    onClick={() => {
                                        setCurrentInfoFilters(currentInfoFilters.filter(row => row.id !== infoFilter.id))
                                    }}
                                >
                                    <XIcon className='size-3.5 text-muted-foreground' />
                                </Button>
                            </div>
                        ))}
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
                                    infos: {},
                                }
                                router.push(pathname + '?' + createQueryString(newFilters, []))
                                setOpen(false)
                            }}
                            disabled={!hasFilters()}
                        >
                            Clear filters
                        </Button>

                        <Button
                            disabled={!hasChanges()}
                            onClick={() => {
                                router.push(pathname + '?' + createQueryString(currentFilters, currentInfoFilters))
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
