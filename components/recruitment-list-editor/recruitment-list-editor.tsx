'use client'

import React, { useState } from 'react';
import { z } from "zod"
import { useRouter } from 'next/navigation';

import { RecruitmentList, recruitmentListSchema } from '@/lib/backend/types';
import { createRecruitmentList, updateRecruitmentList } from '@/lib/backend/recruitmentLists';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import General from './general';
import { cn } from '@/lib/utils';
import Inclusion from './inclusion';
import ExclusionEditor from './exclusion';
import DataSources from './data-sources';
import Customisations from './customisations';

interface RecruitmentListEditorProps {
    recruitmentList?: RecruitmentList;
}

const steps = ['general', 'inclusion', 'data', 'exclusion', 'customization']

const RecruitmentListEditor: React.FC<RecruitmentListEditorProps> = (props) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [finishedSteps, setFinishedSteps] = useState<Array<string>>([])

    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();

    const [recruitmentList, setRecruitmentList] = useState<RecruitmentList>(props.recruitmentList || {
        id: undefined,
        name: "",
        description: "",
        participantInclusion: {
            studyKey: "",
            type: "manual",
            autoConfig: undefined,
        },
        participantData: {
            participantInfos: [],
            researchData: [],
        },
        customization: {
            recruitmentStatusValues: [],
        },
    })

    const isNew = recruitmentList.id === undefined;



    function onSubmit(values: z.infer<typeof recruitmentListSchema>) {
        startTransition(async () => {
            // Perform the form submission logic here.
            if (isNew) {
                const resp = await createRecruitmentList(values);
                if (resp.error !== undefined) {
                    console.error(resp.error);
                    toast.error('Could not create recruitment list', {
                        description: resp.error,
                    });
                    return;
                }
                router.push(`/home/${resp.id}`);
            } else {
                if (recruitmentList.id === undefined) {
                    return;
                }
                const resp = await updateRecruitmentList(recruitmentList.id, values);
                if (resp.error !== undefined) {
                    console.error(resp.error);
                    toast.error('Could not update recruitment list', {
                        description: resp.error,
                    });
                    return;
                }
                setCurrentStep(0);
                toast.success('Recruitment list updated');
            }
        })
    }

    return (
        <Tabs value={steps[currentStep]} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                {steps.map((step, index) => (
                    <TabsTrigger
                        key={step}
                        value={step}
                        disabled={!finishedSteps.includes(step) && index > currentStep}
                        className={cn(index < currentStep && "text-primary")}
                    >
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value="general" className='pt-4'>
                <General
                    defaultValues={{
                        name: recruitmentList.name,
                        description: recruitmentList.description,
                    }}
                    onSubmit={(general) => {
                        setRecruitmentList({
                            ...recruitmentList,
                            name: general.name,
                            description: general.description,
                        })
                        setCurrentStep(1);
                        setFinishedSteps(prev => {
                            if (prev.includes('general')) {
                                return prev;
                            }
                            return [...prev, 'general'];
                        });
                    }}
                />
            </TabsContent>

            <TabsContent value="inclusion" className='pt-4'>
                <Inclusion
                    defaultValues={recruitmentList.participantInclusion}
                    onSubmit={(inclusion) => {
                        setRecruitmentList({
                            ...recruitmentList,
                            participantInclusion: inclusion,
                        })
                        setCurrentStep(2);
                        setFinishedSteps(prev => {
                            if (prev.includes('inclusion')) {
                                return prev;
                            }
                            return [...prev, 'inclusion'];
                        });
                    }}
                    onPrevious={() => {
                        setCurrentStep(0);
                    }}
                />
            </TabsContent>

            <TabsContent value="data" className='pt-4'>
                <DataSources
                    defaultValues={recruitmentList.participantData}
                    onSubmit={(data) => {
                        setRecruitmentList({
                            ...recruitmentList,
                            participantData: data,
                        })
                        setCurrentStep(3);
                        setFinishedSteps(prev => {
                            if (prev.includes('data')) {
                                return prev;
                            }
                            return [...prev, 'data'];
                        });
                    }}
                    onPrevious={() => {
                        setCurrentStep(1);
                    }}
                />
            </TabsContent>

            <TabsContent value="exclusion" className='pt-4'>
                <ExclusionEditor
                    defaultValues={recruitmentList.exclusionConditions}
                    onSubmit={(exclusionConditions) => {
                        const newRecruitmentList = {
                            ...recruitmentList,
                            exclusionConditions: exclusionConditions,
                        }
                        setRecruitmentList(newRecruitmentList);
                        setCurrentStep(4);
                        setFinishedSteps(prev => {
                            if (prev.includes('exclusion')) {
                                return prev;
                            }
                            return [...prev, 'exclusion'];
                        });
                    }}
                    onPrevious={() => {
                        setCurrentStep(2);
                    }}
                />


            </TabsContent>

            <TabsContent value="customization" className='pt-4'>
                <Customisations
                    isLoading={isPending}
                    defaultValues={recruitmentList.customization}
                    onSubmit={(customization) => {
                        const newRecruitmentList = {
                            ...recruitmentList,
                            customization: customization,
                        }
                        setRecruitmentList({
                            ...newRecruitmentList,
                        })
                        onSubmit(newRecruitmentList);
                    }}
                    onPrevious={(customization) => {
                        if (customization !== undefined) {
                            setRecruitmentList({
                                ...recruitmentList,
                                customization: customization,
                            })
                        }
                        setCurrentStep(3);
                    }}
                />
            </TabsContent>
        </Tabs>
    );
};

export default RecruitmentListEditor;
