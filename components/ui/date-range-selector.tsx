"use client"

import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"

interface DateRangeSelectorProps {
    from?: Date
    to?: Date
    value: DateRange | undefined
    disabled?: boolean
    onChange: (value: DateRange | undefined) => void
}

export default function DateRangeSelector(props: DateRangeSelectorProps) {
    const { value } = props

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[300px] justify-start text-left font-normal"
                    disabled={props.disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value?.from ? (
                        value.to ? (
                            <>
                                {value.from.toDateString()} - {value.to.toDateString()}
                            </>
                        ) : (
                            value.from.toDateString()
                        )
                    ) : (
                        <span>Pick a date range</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    disabled={props.disabled}
                    initialFocus
                    mode="range"
                    defaultMonth={value?.from || props.from}
                    selected={value}
                    onSelect={props.onChange}
                    numberOfMonths={2}
                    fromDate={props.from}
                    toDate={props.to}
                />
                <div className="p-3 border-t">
                    <Button variant="outline" className="w-full" onClick={() => props.onChange(undefined)}>
                        <X className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}