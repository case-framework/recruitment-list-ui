import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { AutoConfig } from '@/lib/backend/types';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ConfirmDialog } from '../confirm-dialog';
import DateRangeSelector from '../ui/date-range-selector';
import { DateRange } from 'react-day-picker';
import InclusionCriteriaConditionEditor from './inclusion-criteria-condition-editor';

interface InclusionCriteriaEditorProps {
    autoConfig?: AutoConfig;
    onChange: (autoConfig?: AutoConfig) => void;
}

const InclusionCriteriaEditor: React.FC<InclusionCriteriaEditorProps> = (props) => {
    const [removeCriteriaDialogOpen, setRemoveCriteriaDialogOpen] = React.useState(false);

    const hasAutoConfig = props.autoConfig !== undefined;

    let currentDateRange: DateRange | undefined = undefined;
    if (hasAutoConfig) {
        currentDateRange = {
            from: props.autoConfig?.startDate ? new Date(props.autoConfig.startDate) : undefined,
            to: props.autoConfig?.endDate ? new Date(props.autoConfig.endDate) : undefined,
        }
    }

    return (
        <Card>
            <CardHeader>
                <h4 className='text-lg font-medium'>Which participants should be included?</h4>
                <p className='text-muted-foreground text-sm'>The inclusion job will run periodically and include participants based on the criteria you define here.</p>
            </CardHeader>

            <CardContent className='space-y-8'>
                <Label className='flex items-center gap-2 cursor-pointer'>
                    <Switch
                        checked={!hasAutoConfig}
                        onCheckedChange={(checked) => {
                            if (!checked) {
                                props.onChange({
                                    criteria: undefined,
                                    startDate: undefined,
                                    endDate: undefined,
                                })
                            } else {
                                setRemoveCriteriaDialogOpen(true);
                            }
                        }}
                    />

                    Include all participants <span className='font-normal text-xs'>(unconditionally include new participants)</span>
                </Label>

                {hasAutoConfig && <div className='flex flex-col gap-1.5'>
                    <Label>
                        Limit date range
                    </Label>
                    <DateRangeSelector
                        value={currentDateRange}
                        onChange={(value) => {
                            props.onChange({
                                criteria: undefined,
                                startDate: value?.from?.toISOString(),
                                endDate: value?.to?.toISOString(),
                            })
                        }}
                    />
                    <p className='text-muted-foreground text-xs'>Only include participants who entered the study between the selected dates.</p>
                </div>}

                {hasAutoConfig && <div className='space-y-1.5'>
                    <Label>
                        Inclusion criteria
                    </Label>
                    <InclusionCriteriaConditionEditor
                        condition={props.autoConfig?.criteria}
                        onChange={(condition) => {
                            props.onChange({
                                criteria: condition,
                                startDate: currentDateRange?.from?.toISOString(),
                                endDate: currentDateRange?.to?.toISOString(),
                            })
                        }}
                    />
                    <p className='text-muted-foreground text-xs'>
                        Only include participant who fullfil the above criteria
                    </p>
                </div>}

            </CardContent>


            <ConfirmDialog
                isOpen={removeCriteriaDialogOpen}
                onClose={() => {
                    setRemoveCriteriaDialogOpen(false);
                }}
                onConfirm={() => {
                    setRemoveCriteriaDialogOpen(false);
                    props.onChange(undefined);
                }}
                title="Remove inclusion criteria"
                description="By selecting this option, all inclusion criteria will be removed. This will include all participants."
                confirmText='Yes, remove'
                cancelText='Cancel'
            />

        </Card>
    );
};

export default InclusionCriteriaEditor;
