import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { Separator } from "../ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

interface MappingEditorProps {
    mapping: { key: string; value: string }[]
    onChange: (newMapping: { key: string; value: string }[]) => void
    keyOptions?: string[]
}

const NO_KEY_SELECTED = '__mapping_editor_no_key_selected__';

function MappingEditor({ mapping, onChange, keyOptions }: MappingEditorProps) {
    const [newKey, setNewKey] = useState('')
    const [newValue, setNewValue] = useState('')
    const refKey = useRef<HTMLInputElement>(null)
    const hasKeyOptions = keyOptions !== undefined && keyOptions.length > 0;
    const selectedKey = newKey || NO_KEY_SELECTED;

    const addPair = () => {
        if (newKey && newValue) {
            onChange([...mapping, { key: newKey, value: newValue }])
            setNewKey('')
            setNewValue('')
            refKey.current?.focus()
        }
    }

    const removePair = (index: number) => {
        onChange(mapping.filter((_, i) => i !== index))
    }

    const movePair = (from: number, to: number) => {
        const newMapping = arrayMove(mapping, from, to)
        onChange(newMapping)
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {mapping.map((pair, index) => (
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
                            {index < mapping.length - 1 && (
                                <Button size="icon"
                                    className="p-0 w-full grow"
                                    variant="ghost" onClick={() => movePair(index, index + 1)}>
                                    <ChevronDown className="size-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <Separator />
            <div className="flex items-center space-x-2">
                {keyOptions === undefined ? (
                    <Input
                        ref={refKey}
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder="Key"
                        className="w-1/3"
                    />
                ) : (
                    <Select
                        value={selectedKey}
                        onValueChange={(value) => {
                            if (value !== NO_KEY_SELECTED) {
                                setNewKey(value);
                            }
                        }}
                        disabled={!hasKeyOptions}
                    >
                        <SelectTrigger className="w-1/3 min-w-48">
                            <SelectValue placeholder={hasKeyOptions ? 'Key' : 'No participant data keys'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_KEY_SELECTED} disabled>
                                {hasKeyOptions ? 'Key' : 'No participant data keys'}
                            </SelectItem>
                            {keyOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Value"
                    className="w-1/3"
                />
                <Button onClick={addPair} disabled={keyOptions !== undefined && !hasKeyOptions}>Add</Button>
            </div>
        </div>
    )
}

export default MappingEditor;
