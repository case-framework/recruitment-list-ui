'use client'
import { Permission, RecruitmentListInfo, ResearcherUser } from '@/lib/backend/types';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Plus, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { deleteUser, updateUserIsAdmin } from '@/actions/user-management';
import { toast } from 'sonner';
import AddPermissionDialog from './add-permission-dialog';
import { deleteUserPermission } from '@/lib/backend/permissions';

interface UserEditorProps {
    user: ResearcherUser;
    permissions: Array<Permission>
    recruitmentLists: Array<RecruitmentListInfo>
}

const UserEditor: React.FC<UserEditorProps> = ({ user, permissions, recruitmentLists }) => {
    const [isPending, startTransition] = React.useTransition();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isAddPermissionDialogOpen, setIsAddPermissionDialogOpen] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
        }
    }, []);

    if (!isMounted) {
        return null;
    }

    const handleToggleAdmin = async (shouldBeAdmin: boolean) => {
        startTransition(async () => {
            const resp = await updateUserIsAdmin(user.id, shouldBeAdmin);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error(resp.error);
                return;
            }
            toast.success('User updated');
        })
    }

    const handleDelete = () => {
        startTransition(async () => {
            setIsDeleteDialogOpen(false);
            const resp = await deleteUser(user.id);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error(resp.error);
                return;
            }
            toast.success('User deleted');
            router.replace('/home/user-management');
        })
    }

    const handleDeletePermission = async (permissionId: string) => {
        if (!confirm('Are you sure you want to delete this permission?')) {
            return;
        }
        startTransition(async () => {
            const resp = await deleteUserPermission(user.id, permissionId);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error(resp.error);
                return;
            }
            toast.success('Permission deleted');
            setIsAddPermissionDialogOpen(false);
        })
    }


    return (
        <>
            <div>
                <Card className="max-w-2xl mx-auto z-20 relative">
                    <CardHeader className='flex flex-row justify-between items-center'>
                        <CardTitle className="text-2xl font-bold">User Details
                            {isPending && <span className='ml-2 text-sm text-muted-foreground animate-pulse'>(Updating ...)</span>}
                        </CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0"
                                    disabled={isPending}
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete User
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-2 gap-2 h-full'>
                            <div>
                                <div className="flex items-center space-x-4 mb-6">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={user.imageUrl} alt={user.username} />
                                        <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-2xl font-semibold">{user.username}</h2>
                                        <p className="text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">


                                    <div className='text-sm'>
                                        <Label>Last Login</Label>
                                        <p>{format(new Date(user.lastLoginAt), 'dd.MMM.yyyy HH:mm')}</p>
                                    </div>
                                    <div className='text-sm'>
                                        <Label>Created At</Label>
                                        <p>{format(new Date(user.createdAt), 'dd.MMM.yyyy HH:mm')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col items-end'>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="admin"
                                        checked={user.isAdmin}
                                        onCheckedChange={(checked) => {
                                            handleToggleAdmin(checked);
                                        }}
                                        disabled={isPending}
                                    />
                                    <Label htmlFor="admin">Admin</Label>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="max-w-xl mx-auto -mt-4 p-4 pt-6 z-10 relative ">
                    <h3 className="text-lg font-bold flex items-center justify-between">
                        Permissions
                        <Button variant="ghost"
                            size={'icon'}
                            onClick={() => setIsAddPermissionDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>

                    </h3>

                    <div className='space-y-2'>
                        {!permissions || permissions.length === 0 && (
                            <p className="text-sm text-muted-foreground">No specific permissions</p>
                        )}
                        {permissions.map(permission => {
                            const resourceInfo = recruitmentLists.find(list => list.id === permission.resourceId);
                            return (
                                <div key={permission.id} className="flex items-center gap-2 border border-border p-2 rounded-lg">
                                    <div className='space-y-2 grow'>
                                        <p className='font-mono w-fit text-xs font-bold px-2 py-1 bg-muted rounded-lg text-primary'>
                                            {permission.action}
                                        </p>
                                        {resourceInfo && (
                                            <div className='font-semibold'>
                                                {resourceInfo.name}
                                            </div>)}
                                    </div>
                                    <div>
                                        <Button variant="ghost" size={'icon'}
                                            onClick={() => handleDeletePermission(permission.id)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            <AddPermissionDialog
                isOpen={isAddPermissionDialogOpen}
                onClose={() => setIsAddPermissionDialogOpen(false)}
                userId={user.id}
                recruitmentLists={recruitmentLists}
            />

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm User Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the user {user.username}? This action cannot be undone.
                            <span className='block'>
                                The user will loose all of their permissions, but might still have access to the recruitment list portal through the identity provider.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive"
                            disabled={isPending}
                            onClick={handleDelete}>
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserEditor;
