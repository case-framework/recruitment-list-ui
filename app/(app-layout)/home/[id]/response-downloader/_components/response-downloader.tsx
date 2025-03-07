'use client'

import LoadingButton from '@/components/loading-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { startResponseDownload } from '@/lib/backend/downloads';
import { Label } from '@/components/ui/label';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import DateRangeSelector from '@/components/ui/date-range-selector';
import { DateRange } from 'react-day-picker';
import { addDays, startOfDay } from 'date-fns';

interface ResponseDownloaderProps {
    recruitmentListId: string
    responseInfos?: Array<{
        surveyKey: string;
        count: number;
        firstArrivedAt: number;
        lastArrivedAt: number;
    }>
}

const ResponseDownloader: React.FC<ResponseDownloaderProps> = (props) => {
    const [isPending, startTransition] = React.useTransition();

    const [selectedSurveyKey, setSelectedSurveyKey] = React.useState<string>('');
    const [selectedFormat, setSelectedFormat] = React.useState<string>('csv');
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
    const [availableDateRange, setAvailableDateRange] = React.useState<DateRange | undefined>(undefined);

    useEffect(() => {
        if (selectedSurveyKey === '') {
            setAvailableDateRange(undefined);
        } else {
            const resp = props.responseInfos?.find(info => info.surveyKey === selectedSurveyKey);
            if (resp) {
                setAvailableDateRange({
                    from: resp.firstArrivedAt ? startOfDay(new Date(resp.firstArrivedAt * 1000)) : undefined,
                    to: resp.lastArrivedAt ? addDays(new Date(resp.lastArrivedAt * 1000), 1) : undefined,
                });
            }

        }
    }, [selectedSurveyKey, props.responseInfos])

    const onStartDownload = async () => {
        startTransition(async () => {
            const resp = await startResponseDownload(props.recruitmentListId, selectedSurveyKey, selectedFormat,
                undefined,
                dateRange ? dateRange.from?.toISOString() : undefined,
                dateRange ? dateRange.to?.toISOString() : undefined,
            );
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not start download', {
                    description: resp.error,
                });
                return;
            }
            toast.success('Download started');
        })
    }

    const hasNoDataSources = props.responseInfos === undefined || props.responseInfos.length === 0;

    const disabled = !selectedSurveyKey || isPending || hasNoDataSources;

    return (
        <div className='space-y-4 mt-4'>
            {hasNoDataSources && <div className='text-sm text-destructive'>
                No research data available yet. Check back later.
            </div>}

            <div className='space-y-1.5'>
                <Label
                    className='text-sm font-medium'
                    htmlFor="survey-key"
                >
                    Survey key
                </Label>
                <Select
                    name='survey-key'
                    value={selectedSurveyKey}
                    onValueChange={setSelectedSurveyKey}
                    disabled={isPending || hasNoDataSources}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select survey key" />
                    </SelectTrigger>
                    <SelectContent>
                        {props.responseInfos?.map(info => (
                            <SelectItem key={info.surveyKey} value={info.surveyKey}>
                                {info.surveyKey}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className='space-y-1.5'>
                <Label
                    className='text-sm font-medium'
                    htmlFor="format"
                >
                    Format
                </Label>
                <Select
                    name='format'
                    value={selectedFormat}
                    onValueChange={setSelectedFormat}
                    disabled={disabled}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select survey key" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                </Select>
            </div>


            <div className='space-y-1.5 flex flex-col'>
                <Label
                    className='text-sm font-medium'
                >
                    Date range (optional)
                </Label>
                <DateRangeSelector
                    disabled={disabled}
                    value={dateRange}
                    onChange={setDateRange}
                    to={availableDateRange?.to}
                    from={availableDateRange?.from}
                />
            </div>

            <LoadingButton
                isLoading={isPending}
                disabled={!selectedSurveyKey}
                onClick={onStartDownload}
            >
                Prepare download
            </LoadingButton>
        </div>
    );
};

export default ResponseDownloader;
