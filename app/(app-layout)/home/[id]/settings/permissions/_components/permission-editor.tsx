'use client'
import { ConfirmDialog } from '@/components/confirm-dialog';
import LoadingButton from '@/components/loading-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { addRecruitmentListPermission, deleteRecruitmentListPermission } from '@/lib/backend/permissions';
import { Permission, ResearcherUser } from '@/lib/backend/types';
import { Label } from '@radix-ui/react-label';
import { Check, PlusCircle, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface PermissionEditorProps {
    permissions: Array<Permission>
    recruitmentListId: string
    users: Array<ResearcherUser>
}

const PermissionItem: React.FC<{
    recruitmentListId: string
    permission: Permission
    users: Array<ResearcherUser>
}> = (props) => {
    const [isPending, startTransition] = React.useTransition();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const user = props.users.find(user => user.id === props.permission.userId);
    if (!user) {
        return null;
    }

    return (
        <div className="flex items-center justify-between p-2 border rounded bg-background">
            <div className="flex items-center space-x-4">
                <Avatar>
                    <AvatarImage src={user.imageUrl} alt={user.username} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
            </div>
            <div>
                <span className="px-2 py-1 text-sm bg-gray-100 rounded">{props.permission.action}</span>
            </div>
            <Button variant="ghost" size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isPending}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={async () => {
                    startTransition(async () => {
                        const resp = await deleteRecruitmentListPermission(props.recruitmentListId, props.permission.id);
                        if (resp.error !== undefined) {
                            console.error(resp.error);
                            toast.error(resp.error);
                            return;
                        }
                        toast.success('Permission deleted');
                        setIsDeleteDialogOpen(false);
                    })
                }}
                title="Confirm Permission Deletion"
                description="Are you sure you want to delete this permission?"
            />
        </div>
    );
}

const PermissionEditor: React.FC<PermissionEditorProps> = (props) => {
    const { permissions, recruitmentListId, users } = props;

    const [isPending, startTransition] = React.useTransition();
    const [selectedAction, setSelectedAction] = React.useState<string | null>(null);
    const [userId, setUserId] = React.useState<string | null>(null);
    const [openCombobox, setOpenCombobox] = React.useState(false);


    const onAddPermission = async () => {
        if (!selectedAction || !userId) {
            return;
        }
        startTransition(async () => {
            const resp = await addRecruitmentListPermission(recruitmentListId, {
                action: selectedAction as string,
                userId: userId,
            });
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error(resp.error);
                return;
            }
            toast.success('Permission added');
            setSelectedAction(null);
            setUserId(null);
        })
    }



    const selectedUser = users.find(user => user.id === userId);

    return (
        <div className='space-y-4'>
            <div className="space-y-2">
                {permissions.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No permissions yet specifically for this recruitment list.
                    </p>
                )}
                {permissions.map((permission) => (
                    <PermissionItem
                        key={permission.id}
                        recruitmentListId={recruitmentListId}
                        permission={permission}
                        users={users}
                    />
                ))}
            </div>
            <Separator />
            <div>
                <h3 className='font-semibold'>Add Permission</h3>
                <div className='flex items-end gap-4 py-2'>
                    <div className='space-y-1.5 grow'>
                        <Label
                            className='text-sm font-medium'
                            htmlFor='user'>
                            User
                        </Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    {selectedUser ? (
                                        <>
                                            <Avatar className="mr-2 h-5 w-5">
                                                <AvatarImage src={selectedUser.imageUrl} alt={selectedUser.username} />
                                                <AvatarFallback>{selectedUser.username[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            {selectedUser.username}
                                        </>
                                    ) : (
                                        "Select user..."
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search users..." />
                                    <CommandList>
                                        <CommandEmpty>No users found.</CommandEmpty>
                                        <CommandGroup>
                                            {users.map((user) => (
                                                <CommandItem
                                                    key={user.email}
                                                    onSelect={() => {
                                                        setUserId(user.id)
                                                        setOpenCombobox(false)
                                                    }}
                                                >
                                                    <Avatar className="mr-2 h-5 w-5">
                                                        <AvatarImage src={user.imageUrl} alt={user.username} />
                                                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{user.username}</span>
                                                    <span className="ml-auto text-sm text-gray-500">{user.email}</span>
                                                    {selectedUser?.email === user.email && <Check className="ml-2 h-4 w-4" />}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className='space-y-1.5 grow'>
                        <Label
                            htmlFor='action'
                            className='text-sm font-medium'
                        >Action</Label>
                        <Select onValueChange={setSelectedAction}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="access_recruitment_list">Access recruitment list</SelectItem>
                                <SelectItem value="delete_recruitment_list">Delete recruitment list</SelectItem>
                                <SelectItem value="manage_recruitment_list">Manage recruitment list</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <LoadingButton
                        variant={'outline'}
                        isLoading={isPending}
                        disabled={!selectedAction || !userId}
                        onClick={onAddPermission}
                    >
                        <PlusCircle className="mr-1 h-4 w-4" />
                        Add Permission
                    </LoadingButton>
                </div>
            </div>
        </div>
    );
};

export default PermissionEditor;
