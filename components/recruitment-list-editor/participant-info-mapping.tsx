import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { Separator } from "../ui/separator";
import { ParticipantInfo } from "@/lib/backend/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface MappingEditorProps {
    infoDef: ParticipantInfo
    onChange: (info: ParticipantInfo) => void
}

function ParticipantInfoMappingEditor({ infoDef, onChange }: MappingEditorProps) {
    const [newKey, setNewKey] = useState('')
    const [newValue, setNewValue] = useState('')
    const refKey = useRef<HTMLInputElement>(null)

    const addPair = () => {
        if (newKey && newValue) {

            const newMapping = [...infoDef.mapping || [], { key: newKey, value: newValue }]
            onChange({ ...infoDef, mapping: newMapping })
            setNewKey('')
            setNewValue('')
            refKey.current?.focus()
        }
    }

    const removePair = (index: number) => {
        onChange({ ...infoDef, mapping: infoDef.mapping?.filter((_, i) => i !== index) })
    }

    const movePair = (from: number, to: number) => {
        const newArray = arrayMove(infoDef.mapping || [], from, to);
        onChange({ ...infoDef, mapping: [...newArray] })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Select
                    value={infoDef.mappingType}
                    onValueChange={(value) => {
                        if (value === 'default') {
                            onChange({ ...infoDef, mappingType: undefined })
                        }
                        onChange({ ...infoDef, mappingType: value })
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select mapping type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="ts2date">ts2date</SelectItem>
                        <SelectItem value="key2value">key2value</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                </Select>

                <Separator />

                {infoDef.mappingType === 'key2value' && (
                    <>
                        {infoDef.mapping?.map((pair, index) => (
                            <div key={index} className="flex items-center space-x-2 w-fit">
                                <Input
                                    value={pair.key} readOnly className="w-1/3" />
                                <Input value={pair.value} readOnly className="w-1/3" />
                                <Button size="icon" variant="ghost" onClick={() => removePair(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="flex flex-col gap-1 max-h-[40px] overflow-y-hidden grow">
                                    {index > 0 && (
                                        <Button size="icon"
                                            className="p-0 w-full grow"
                                            variant="ghost" onClick={() => movePair(index, index - 1)}>
                                            <ChevronUp className="size-4" />
                                        </Button>
                                    )}
                                    {index < (infoDef.mapping?.length || 0) - 1 && (
                                        <Button size="icon"
                                            className="p-0 w-full grow"
                                            variant="ghost" onClick={() => movePair(index, index + 1)}>
                                            <ChevronDown className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <Separator />
                        <div className="flex items-center space-x-2">
                            <Input
                                ref={refKey}
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                placeholder="Key"
                                className="w-1/3"
                            />
                            <Input
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder="Value"
                                className="w-1/3"
                            />
                            <Button onClick={addPair}>Add</Button>
                        </div>
                    </>
                )}

            </div>
        </div>
    )
}

export default ParticipantInfoMappingEditor;