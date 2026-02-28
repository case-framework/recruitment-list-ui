"use client"

import { useEffect, useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, GripVertical, X } from "lucide-react"
import { toast } from "sonner"

type EnumValue = { id: string; value: string }

function SortableItem({ id, value, onDelete }: { id: string; value: string; onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 mb-2">
            <GripVertical className="cursor-move" {...attributes} {...listeners} />
            <Input value={value} readOnly />
            <Button
                type="button"
                variant="ghost" size="icon" onClick={onDelete}><X className="h-4 w-4" /></Button>
        </div>
    )
}

interface EnumEditorProps {
    values: string[];
    onChange: (values: string[]) => void;
}

export default function Component(props: EnumEditorProps) {
    const [items, setItems] = useState<EnumValue[]>(props.values.map(value => ({ id: value, value })))
    const [newValue, setNewValue] = useState("")

    useEffect(() => {
        props.onChange(items.map(item => item.value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = (event: any) => {
        const { active, over } = event
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const addItem = () => {
        const trimmedValue = newValue.trim()
        if (trimmedValue) {
            if (items.some(item => item.value.toLowerCase() === trimmedValue.toLowerCase())) {
                toast.error("This enum value already exists.", {
                    description: "Please enter a unique value.",
                })
            } else {
                setItems([...items, { id: Date.now().toString(), value: trimmedValue }])
                setNewValue("")
            }
        }
    }

    const deleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    return (
        <div>
            {items.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm border border-dashed p-4 rounded-md">No enum values yet. Add some below.</p>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        {items.map((item) => (
                            <SortableItem key={item.id} id={item.id} value={item.value} onDelete={() => deleteItem(item.id)} />
                        ))}
                    </SortableContext>
                </DndContext>
            )}
            <div className="flex gap-2 mt-4">
                <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
                    placeholder="New enum value"
                />
                <Button
                    type="button"
                    size='sm'
                    variant={'outline'}
                    onClick={addItem}><Plus className="h-4 w-4 mr-2" /> Add</Button>
            </div>
        </div>
    )
}