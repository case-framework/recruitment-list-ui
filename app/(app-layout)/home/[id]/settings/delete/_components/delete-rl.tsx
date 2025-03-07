'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

import React from 'react';
import { Label } from "@radix-ui/react-label"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useRouter } from "next/navigation"
import LoadingButton from "@/components/loading-button"
import { deleteRecruitmentList } from "@/lib/backend/recruitmentLists"
import { toast } from "sonner"

interface DeleteRlProps {
    listName: string;
    listId: string;
}

const DeleteRl: React.FC<DeleteRlProps> = ({
    listName,
    listId
}) => {
    const [inputValue, setInputValue] = useState("")
    const [isPending, startTransition] = React.useTransition();
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const router = useRouter();

    const onDelete = async () => {
        startTransition(async () => {
            const resp = await deleteRecruitmentList(listId);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not delete recruitment list', {
                    description: resp.error,
                });
                return;
            }
            toast.success('Recruitment list deleted');
            setTimeout(() => {
                router.replace('/home');
            }, 1000);
        })
    }


    return (
        <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-bold">Delete Recruitment List</h2>
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning: Irreversible Action</AlertTitle>
                <AlertDescription>
                    This will permanently remove all participant data, notes, and research data from this list.
                </AlertDescription>
            </Alert>
            <div className="space-y-1.5">
                <Label htmlFor="rl-name"
                    className="text-sm font-medium"
                >
                    Please type the name of the recruitment list to confirm.
                </Label>
                <Input
                    id="rl-name"
                    placeholder={`Type "${listName}" to confirm`}
                    disabled={isPending}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoComplete="off"
                />
            </div>
            <LoadingButton
                variant="destructive"
                disabled={inputValue !== listName}
                isLoading={isPending}
                onClick={() => setConfirmDialogOpen(true)}
            >
                Delete List
            </LoadingButton>
            <ConfirmDialog
                isOpen={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={onDelete}
                title="Confirm Delete"
                description={`Are you sure you want to delete the recruitment list ${listName}?`}
                confirmText="Delete"
            />
        </div>
    );
};

export default DeleteRl;
