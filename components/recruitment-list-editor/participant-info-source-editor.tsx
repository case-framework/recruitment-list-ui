'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PlusCircle, Trash2, GripVertical, Settings } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ConfirmDialog } from '../confirm-dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ParticipantInfo } from '@/lib/backend/types'
import MappingEditor from './participant-info-mapping'


interface SortableTableRowProps {
    info: ParticipantInfo
    updateField: (id: string, field: keyof ParticipantInfo, value: string | boolean | Array<{ key: string, value: string }>) => void
    updateRow: (info: ParticipantInfo) => void
    deleteRow: (id: string) => void
}

function SortableTableRow({ info, updateField, updateRow, deleteRow }: SortableTableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: info.id })

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }

    return (
        <TableRow ref={setNodeRef} style={style}>
            <TableCell>
                <div {...attributes} {...listeners}>
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                </div>
            </TableCell>
            <TableCell
                className='min-w-[240px]'
            >
                <Input
                    value={info.label}
                    onChange={(e) => updateField(info.id, 'label', e.target.value)}
                    placeholder="Enter label"
                    onKeyDown={handleKeyDown}
                />
            </TableCell>
            <TableCell>
                <Select
                    value={info.sourceType}
                    onValueChange={(value) => updateField(info.id, 'sourceType', value)}
                >
                    <SelectTrigger
                        className='text-xs'
                    >
                        <SelectValue placeholder="Select source type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="flagValue">Flag Value</SelectItem>
                        <SelectItem value="confidentialData">Confidential Data</SelectItem>
                        <SelectItem value="responseData">Response Data</SelectItem>
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell
                className='min-w-[240px]'
            >
                <Input
                    value={info.sourceKey}
                    className='text-xs'
                    onChange={(e) => updateField(info.id, 'sourceKey', e.target.value)}
                    placeholder="Enter source key"
                    onKeyDown={handleKeyDown}
                />
            </TableCell>
            <TableCell className='text-center flex justify-center'>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className=" text-xs px-2 ">
                            {info.mappingType !== undefined ? `${info.mappingType}` : "None"}
                            <span>
                                <Settings className="w-4 h-4 ml-2 text-muted-foreground" />
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="space-y-4">
                            <h4 className="font-medium leading-none">Edit Mapping</h4>
                            <MappingEditor
                                infoDef={info}
                                onChange={(info) => {
                                    updateRow(info)
                                }}
                            />
                        </div>
                    </PopoverContent>
                </Popover>
            </TableCell>
            <TableCell className='text-center'>
                <Switch
                    checked={info.showInPreview}
                    onCheckedChange={(checked) => updateField(info.id, 'showInPreview', checked)}
                />
            </TableCell>
            <TableCell className='text-center'>
                <Button
                    type='button'
                    variant="ghost" size="icon" onClick={() => setConfirmDialogOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
            <ConfirmDialog
                isOpen={confirmDialogOpen}
                onClose={() => {
                    setConfirmDialogOpen(false);
                }}
                onConfirm={() => {
                    setConfirmDialogOpen(false);
                    deleteRow(info.id)
                }}
                title="Confirm deletion"
                description="Are you sure you want to delete this participant info source?"
                confirmText='Yes, delete'
                cancelText='Cancel'
            />
        </TableRow>
    )
}

interface ParticipantInfoSourceEditorProps {
    values: ParticipantInfo[]
    onChange: (values: ParticipantInfo[]) => void
}

const ParticipantInfoSourceEditor: React.FC<ParticipantInfoSourceEditorProps> = (props) => {
    const [infoSources, setInfoSources] = useState<ParticipantInfo[]>(props.values)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        props.onChange(infoSources)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [infoSources])

    const addNewRow = () => {
        const newRow: ParticipantInfo = {
            id: Date.now().toString() + '-' + Math.floor((Math.random() * 100)).toString(),
            label: '',
            sourceType: '',
            sourceKey: '',
            showInPreview: true
        }
        setInfoSources([...infoSources, newRow])
    }

    const deleteRow = (id: string) => {
        setInfoSources(infoSources.filter(source => source.id !== id))
    }

    const updateField = (id: string, field: keyof ParticipantInfo, value: string | boolean | Array<{ key: string, value: string }>) => {
        setInfoSources(infoSources.map(source =>
            source.id === id ? { ...source, [field]: value } : source
        ))
    }

    const updateRow = (info: ParticipantInfo) => {
        setInfoSources(infoSources.map(source =>
            source.id === info.id ? info : source
        ))
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = (event: any) => {
        const { active, over } = event

        if (active.id !== over.id) {
            setInfoSources((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)

                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    return (
        <div className="">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Source Type</TableHead>
                            <TableHead>Source Key</TableHead>
                            <TableHead className='text-center'>Mappings</TableHead>
                            <TableHead className='text-center'>Show in Preview</TableHead>
                            <TableHead className='text-center'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!infoSources || infoSources.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No participant info sources. Add a new row using the button below.
                                </TableCell>
                            </TableRow>
                        ) : (
                            <SortableContext
                                items={infoSources.map(s => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {infoSources.map((source) => (
                                    <SortableTableRow
                                        key={source.id}
                                        info={source}
                                        updateField={updateField}
                                        updateRow={updateRow}
                                        deleteRow={deleteRow}
                                    />
                                ))}
                            </SortableContext>
                        )}
                    </TableBody>
                </Table>
            </DndContext>
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
    )
}

export default ParticipantInfoSourceEditor;