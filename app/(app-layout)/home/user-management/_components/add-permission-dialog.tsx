'use client';

import { useEffect, useEffectEvent, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/c-ui/loading-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addUserPermission } from '@/lib/backend/permissions';

interface ResourceOption {
    id?: string;
    name: string;
}

interface AddPermissionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdded: () => Promise<void> | void;
    userId: string;
    recruitmentLists: ResourceOption[];
}

const actionOptions = [
    'create_recruitment_list',
    'delete_recruitment_list',
    'manage_recruitment_list',
    'access_recruitment_list',
];

const needsResource = (action: string | null) =>
    action === 'manage_recruitment_list' ||
    action === 'access_recruitment_list' ||
    action === 'delete_recruitment_list';

const AddPermissionDialog = ({
    isOpen,
    onClose,
    onAdded,
    userId,
    recruitmentLists,
}: AddPermissionDialogProps) => {
    const [isPending, startTransition] = useTransition();
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [resourceId, setResourceId] = useState<string | null>(null);

    const onReset = useEffectEvent(() => {
        setSelectedAction(null);
        setResourceId(null);
    });

    useEffect(() => {
        if (isOpen) {
            onReset();
        }
    }, [isOpen]);

    const validateForm = () => {
        if (!selectedAction) {
            return false;
        }

        if (needsResource(selectedAction) && !resourceId) {
            return false;
        }

        return true;
    };

    const onAddPermission = () => {
        if (!validateForm()) {
            return;
        }

        startTransition(async () => {
            const response = await addUserPermission(userId, {
                action: selectedAction as string,
                resourceId: resourceId || undefined,
            });

            if (response.error !== undefined) {
                toast.error(response.error);
                return;
            }

            await onAdded();
            toast.success('Permission added');
            onClose();
        });
    };

    const showResourceSelector = needsResource(selectedAction);
    const hasNoRecruitmentLists = recruitmentLists.length === 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Permission</DialogTitle>
                    <DialogDescription>
                        Grant a permission to this user for a specific recruitment list resource.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 pb-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="action">Action</Label>
                        <Select
                            name="action"
                            value={selectedAction || ''}
                            onValueChange={setSelectedAction}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent>
                                {actionOptions.map((option) => (
                                    <SelectItem
                                        key={option}
                                        value={option}
                                        disabled={hasNoRecruitmentLists && option !== 'create_recruitment_list'}
                                    >
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {showResourceSelector && (
                        <div className="space-y-1.5">
                            <Label htmlFor="resource">Recruitment list</Label>
                            <Select
                                name="resource"
                                value={resourceId || ''}
                                onValueChange={setResourceId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a recruitment list" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64 overflow-y-auto">
                                    {recruitmentLists
                                        .filter((list) => Boolean(list.id))
                                        .map((list) => (
                                            <SelectItem
                                                key={list.id}
                                                value={list.id as string}
                                                className="max-w-[420px] overflow-hidden text-wrap"
                                            >
                                                {list.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <LoadingButton
                        isLoading={isPending}
                        disabled={!validateForm()}
                        onClick={onAddPermission}
                    >
                        Add Permission
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddPermissionDialog;
