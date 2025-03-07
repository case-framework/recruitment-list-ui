import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ResearchData } from '@/lib/backend/types';
import { Button } from '../ui/button';
import { CalendarIcon, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Textarea } from '../ui/textarea';

interface ResearchDataSourceRowProps {
    entry: ResearchData
    onUpdate: (updatedEntry: ResearchData) => void
    onDelete: (id: string) => void
}

export function ResearchDataSourceRow({ entry, onUpdate, onDelete }: ResearchDataSourceRowProps) {
    const [excludedColumnsText, setExcludedColumnsText] = useState(entry.excludedColumns?.join('\n') || '')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (field: keyof ResearchData, value: any) => {
        onUpdate({ ...entry, [field]: value })
    }

    const handleExcludedColumnsChange = (text: string) => {
        setExcludedColumnsText(text)
        const columns = text.split('\n').filter(column => column.trim() !== '')
        onUpdate({ ...entry, excludedColumns: columns })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }

    if (typeof entry.startDate === 'string') {
        entry.startDate = new Date(entry.startDate);
    }
    if (typeof entry.endDate === 'string') {
        entry.endDate = new Date(entry.endDate);
    }

    return (
        <TableRow>
            <TableCell className='min-w-32'>
                <Input
                    value={entry.surveyKey}
                    placeholder='Survey key...'
                    onChange={(e) => handleInputChange('surveyKey', e.target.value)}
                    className="w-full"
                    onKeyDown={handleKeyDown}
                />
            </TableCell>
            <TableCell>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            type='button'
                            className={`w-full justify-start text-left font-normal ${!entry.startDate && "text-muted-foreground"}`}
                        >
                            <span>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                            </span>
                            {entry.startDate ? format(entry.startDate, "PPP") : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={entry.startDate}
                            onSelect={(date) => handleInputChange('startDate', date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </TableCell>
            <TableCell>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${!entry.endDate && "text-muted-foreground"}`}
                            type='button'
                        >
                            <span>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                            </span>
                            {entry.endDate ? format(entry.endDate, "PPP") : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={entry.endDate}
                            onSelect={(date) => handleInputChange('endDate', date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </TableCell>
            <TableCell>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[180px] justify-between">
                            {entry.excludedColumns?.length || 0} exclusions
                            <Edit className="h-4 w-4 ml-2" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <Textarea
                            value={excludedColumnsText}
                            onChange={(e) => handleExcludedColumnsChange(e.target.value)}
                            placeholder="Enter excluded columns (one per line)"
                            className="min-h-[100px]"
                        />
                    </PopoverContent>
                </Popover>
            </TableCell>
            <TableCell className='text-center'>
                <Button
                    type='button'
                    variant="ghost" size="sm" onClick={() => onDelete(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    )
}

interface ResearchDataSourceEditorProps {
    values: ResearchData[]
    onChange: (values: ResearchData[]) => void
}

const ResearchDataSourceEditor: React.FC<ResearchDataSourceEditorProps> = (props) => {
    const [researchData, setResearchData] = useState<ResearchData[]>(props.values)

    useEffect(() => {
        props.onChange(researchData)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [researchData])

    const addNewRow = () => {
        setResearchData([...researchData, {
            id: Date.now().toString() + '-' + Math.floor((Math.random() * 100)).toString(),
            surveyKey: '',
            startDate: undefined,
            endDate: undefined,
            excludedColumns: []
        }])
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Survey Key</TableHead>
                        <TableHead>Start Date <span className='text-xs text-muted-foreground'>(optional)</span></TableHead>
                        <TableHead>End Date <span className='text-xs text-muted-foreground'>(optional)</span></TableHead>
                        <TableHead>Excluded Columns <span className='text-xs text-muted-foreground'>(optional)</span></TableHead>
                        <TableHead className='text-center'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!researchData || researchData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No research data sources. Add a new row using the button below.
                            </TableCell>
                        </TableRow>
                    ) : (
                        researchData.map((row, index) => (<ResearchDataSourceRow
                            key={row.id}
                            entry={row}
                            onUpdate={(updatedEntry) => setResearchData(researchData.map((entry, i) => i === index ? updatedEntry : entry))}
                            onDelete={(id) => setResearchData(researchData.filter(entry => entry.id !== id))}
                        />
                        ))
                    )}
                </TableBody>
            </Table>
            <div className='flex justify-center'>
                <Button
                    type='button'
                    onClick={addNewRow}
                    variant='outline'
                    className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Source
                </Button>
            </div>
        </div>
    );
};

export default ResearchDataSourceEditor;
