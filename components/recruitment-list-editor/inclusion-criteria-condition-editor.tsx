import React, { useEffect } from 'react';

import { useState } from 'react'
import { PlusCircle, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Condition = {
    type: 'flagExists' | 'flagHasValue' | 'flagNotExists' | 'flagNotHasValue' | 'hasStatus'
    key: string
    value?: string
}

type Group = {
    operator: 'AND' | 'OR'
    conditions: (Condition | Group)[]
}


interface InclusionCriteriaConditionEditorProps {
    condition?: string;
    onChange: (condition?: string) => void;
}

const availableStatusValues = ['active', 'temporary']

const InclusionCriteriaConditionEditor: React.FC<InclusionCriteriaConditionEditorProps> = (props) => {
    const [rootGroup, setRootGroup] = useState<Group>(
        props.condition ? JSON.parse(props.condition) : { operator: 'AND', conditions: [] }
    )

    useEffect(() => {
        if (rootGroup.conditions.length === 0) {
            props.onChange(undefined)
            return
        }
        props.onChange(JSON.stringify(rootGroup))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rootGroup])

    const addCondition = (group: Group) => {
        group.conditions.push({ type: 'flagExists', key: '' })
        setRootGroup({ ...rootGroup })
    }

    const addGroup = (parentGroup: Group) => {
        parentGroup.conditions.push({ operator: 'AND', conditions: [] })
        setRootGroup({ ...rootGroup })
    }

    const updateCondition = (condition: Condition, updates: Partial<Condition>) => {
        Object.assign(condition, updates)
        setRootGroup({ ...rootGroup })
    }

    const updateGroupOperator = (group: Group, operator: 'AND' | 'OR') => {
        group.operator = operator
        setRootGroup({ ...rootGroup })
    }

    const removeItem = (group: Group, index: number) => {
        group.conditions.splice(index, 1)
        setRootGroup({ ...rootGroup })
    }

    const renderGroup = (group: Group, depth = 0) => (
        <div>
            <Select value={group.operator} onValueChange={(value) => updateGroupOperator(group, value as 'AND' | 'OR')}>
                <SelectTrigger className="w-24 mb-2 bg-secondary/20">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
            </Select>
            <div className='border-l-2 border-border pl-4 w-full'>
                {group.conditions.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2 pl-2 mb-2 w-full group">
                        {('operator' in item) ? (
                            renderGroup(item as Group, depth + 1)
                        ) : (
                            renderCondition(item as Condition)
                        )}
                        <Button
                            type='button'
                            className='group-hover:flex hidden'
                            variant="ghost" size="icon" onClick={() => removeItem(group, index)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type='button'
                        variant="outline" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add
                        <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => addCondition(group)}>
                        Add Condition
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addGroup(group)}>
                        Add Group
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )

    const renderCondition = (condition: Condition) => {
        let conditionEditor: React.ReactNode = null;

        switch (condition.type) {
            case 'flagExists':
            case 'flagNotExists':
                conditionEditor = <>
                    <Input
                        placeholder="Flag key"
                        value={condition.key}
                        onChange={(e) => updateCondition(condition, { key: e.target.value })}
                        className="w-40"
                    />
                </>
                break;
            case 'flagHasValue':
            case 'flagNotHasValue':
                conditionEditor = <>
                    <Input
                        placeholder="Flag key"
                        value={condition.key}
                        onChange={(e) => updateCondition(condition, { key: e.target.value })}
                        className="w-40"
                    />
                    <Input
                        placeholder="Flag value"
                        value={condition.value || ''}
                        onChange={(e) => updateCondition(condition, { value: e.target.value })}
                        className="w-40"
                    />
                </>
                break;
            case 'hasStatus':
                conditionEditor = <>
                    <Select
                        value={condition.value}
                        onValueChange={(value) => updateCondition(condition, { value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableStatusValues.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </>
                break;
            default:
                conditionEditor = <></>

        }


        return (
            <div className="flex items-center space-x-2 w-fit">
                <Select
                    value={condition.type}
                    onValueChange={(value) => updateCondition(condition, { type: value as Condition['type'] })}
                >
                    <SelectTrigger className="bg-secondary min-w-fit">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="flagExists">Flag exists</SelectItem>
                        <SelectItem value="flagHasValue">Flag value is equal</SelectItem>
                        <SelectItem value="flagNotExists">Flag not exists</SelectItem>
                        <SelectItem value="flagNotHasValue">Flag value is not equal</SelectItem>
                        <SelectItem value="hasStatus">Has status</SelectItem>
                    </SelectContent>
                </Select>
                {conditionEditor}
            </div>
        )
    }

    return (
        <>
            {renderGroup(rootGroup)}
        </>
    );
};

export default InclusionCriteriaConditionEditor;
