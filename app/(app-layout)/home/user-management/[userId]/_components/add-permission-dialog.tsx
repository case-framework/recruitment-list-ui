import LoadingButton from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { addUserPermission } from '@/lib/backend/permissions';
import { RecruitmentListInfo } from '@/lib/backend/types';
import { SelectValue } from '@radix-ui/react-select';

import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface AddPermissionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    recruitmentLists: Array<RecruitmentListInfo>
}

const actionOptions = [
    'create_recruitment_list',
    'delete_recruitment_list',
    'manage_recruitment_list',
    'access_recruitment_list',
]

const AddPermissionDialog: React.FC<AddPermissionDialogProps> = (props) => {
    const [isPending, startTransition] = React.useTransition();
    const [selectedAction, setSelectedAction] = React.useState<string | null>(null);
    const [resourceId, setResourceId] = React.useState<string | null>(null);

    useEffect(() => {
        setResourceId(null);
        setSelectedAction(null);
    }, [props.isOpen]);

    const onAddPermission = async () => {
        if (!validateForm()) {
            return;
        }
        startTransition(async () => {
            const resp = await addUserPermission(props.userId,
                {
                    action: selectedAction as string,
                    resourceId: resourceId || undefined
                });
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error(resp.error);
                return;
            }
            toast.success('Permission added');
            props.onClose();
        })

    }

    const validateForm = () => {
        if (!selectedAction) {
            return false;
        }
        if (selectedAction === 'manage_recruitment_list' || selectedAction === 'access_recruitment_list' || selectedAction === 'delete_recruitment_list') {
            if (!resourceId) {
                return false;
            }
        }
        return true;
    }

    const showRecruitmentListSelector = selectedAction === 'manage_recruitment_list' || selectedAction === 'access_recruitment_list' || selectedAction === 'delete_recruitment_list';
    const hasNoRecruitmentLists = props.recruitmentLists.length === 0;

    return (
        <Dialog open={props.isOpen}
            onOpenChange={props.onClose}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Permission</DialogTitle>
                    <DialogDescription>
                        Add a permission for the user to perform an action on a specific resource.
                    </DialogDescription>
                </DialogHeader>
                <div className='space-y-8 pb-4'>
                    <div className='space-y-1.5'>
                        <Label
                            htmlFor="action"
                        >
                            Action
                        </Label>
                        <Select
                            name="action"
                            value={selectedAction || ''}
                            onValueChange={setSelectedAction}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent>
                                {actionOptions.map(option => (
                                    <SelectItem key={option} value={option}
                                        disabled={hasNoRecruitmentLists && option !== 'create_recruitment_list'}
                                    >
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {showRecruitmentListSelector && (
                        <div className='space-y-1.5'>
                            <Label
                                htmlFor="recruitmentList"
                            >
                                Recruitment List
                            </Label>
                            <Select
                                name="recruitmentList"
                                value={resourceId || ''}
                                onValueChange={setResourceId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a recruitment list" />
                                </SelectTrigger>
                                <SelectContent className='w-full overflow-y-auto'>
                                    {props.recruitmentLists.map(option => (
                                        <SelectItem key={option.id} value={option.id!}
                                            className='text-wrap max-w-[450px] w-full overflow-hidden'>

                                            {option.name} <span className='text-xs font-mono text-muted-foreground'>({option.id})</span>


                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => props.onClose()}>
                        Cancel
                    </Button>
                    <LoadingButton

                        isLoading={isPending}
                        disabled={!validateForm()}
                        onClick={onAddPermission}>
                        Add Permission
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddPermissionDialog;
