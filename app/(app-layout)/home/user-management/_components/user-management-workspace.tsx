'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import ErrorAlert from '@/components/error-alert';
import { useUserDetails } from '@/components/hooks/useUserDetails';
import { useUsers } from '@/components/hooks/useUsers';
import { useConfirm } from '@/components/c-ui/confirm-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { deleteUser, updateUserIsAdmin } from '@/actions/user-management';
import { deleteUserPermission } from '@/lib/backend/permissions';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/client';
import AddPermissionDialog from './add-permission-dialog';

interface UserManagementWorkspaceProps {
    currentUserSub?: string | null;
}

const ACTION_LABELS: Record<string, string> = {
    create_recruitment_list: 'Create',
    delete_recruitment_list: 'Delete',
    manage_recruitment_list: 'Manage',
    access_recruitment_list: 'Access',
};

const formatPermissionAction = (action: string) =>
    ACTION_LABELS[action] ?? action.replaceAll('_', ' ');

const formatDateValue = (iso: string) => {
    if (!iso) {
        return 'Unknown';
    }

    const parsedDate = new Date(iso);
    if (Number.isNaN(parsedDate.getTime())) {
        return 'Unknown';
    }

    return format(parsedDate, 'dd.MMM.yyyy HH:mm');
};

const UserManagementWorkspace = ({ currentUserSub }: UserManagementWorkspaceProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddPermissionOpen, setIsAddPermissionOpen] = useState(false);
    const [isMutating, startMutationTransition] = useTransition();
    const deferredSearchQuery = useDeferredValue(searchQuery);

    const confirm = useConfirm();
    const router = useRouter();
    const searchParams = useSearchParams();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const selectedUserId = searchParams.get('userId');
    const usersQuery = useUsers({
        query: deferredSearchQuery,
    });

    const detailsQuery = useUserDetails(selectedUserId);
    const selectedUser = useMemo(
        () => usersQuery.users.find((user) => user.id === selectedUserId),
        [selectedUserId, usersQuery.users]
    );

    const setSelectedUserId = useCallback((nextUserId: string | null) => {
        const nextSearchParams = new URLSearchParams(searchParams.toString());

        if (nextUserId) {
            nextSearchParams.set('userId', nextUserId);
        } else {
            nextSearchParams.delete('userId');
        }

        const query = nextSearchParams.toString();
        router.replace(query.length > 0 ? `/home/user-management?${query}` : '/home/user-management', { scroll: false });
    }, [router, searchParams]);

    useEffect(() => {
        if (usersQuery.isPending) {
            return;
        }

        if (usersQuery.users.length === 0) {
            if (selectedUserId) {
                setSelectedUserId(null);
            }
            return;
        }

        const hasSelectedUser = selectedUserId !== null && usersQuery.users.some((user) => user.id === selectedUserId);
        if (!hasSelectedUser) {
            setSelectedUserId(usersQuery.users[0].id);
        }
    }, [selectedUserId, setSelectedUserId, usersQuery.isPending, usersQuery.users]);

    const invalidateUserData = useCallback(async (userId: string | null) => {
        await queryClient.invalidateQueries(trpc.userManagement.getUsers.queryFilter());
        if (userId) {
            await queryClient.invalidateQueries(
                trpc.userManagement.getUserDetails.queryFilter({
                    userId,
                })
            );
        }
    }, [queryClient, trpc]);

    const onToggleAdmin = (checked: boolean) => {
        if (!selectedUserId) {
            return;
        }

        startMutationTransition(async () => {
            const response = await updateUserIsAdmin(selectedUserId, checked);
            if (response.error !== undefined) {
                toast.error(response.error);
                return;
            }

            await invalidateUserData(selectedUserId);
            toast.success('User updated');
        });
    };

    const onDeletePermission = async (permissionId: string) => {
        if (!selectedUserId) {
            return;
        }

        const isConfirmed = await confirm({
            title: 'Delete Permission',
            description: 'Remove this permission from the selected user?',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            variant: 'destructive',
        });

        if (!isConfirmed) {
            return;
        }

        startMutationTransition(async () => {
            const response = await deleteUserPermission(selectedUserId, permissionId);
            if (response.error !== undefined) {
                toast.error(response.error);
                return;
            }

            await invalidateUserData(selectedUserId);
            toast.success('Permission deleted');
        });
    };

    const onDeleteUser = async () => {
        if (!selectedUserId || !selectedUser) {
            return;
        }

        const isConfirmed = await confirm({
            title: 'Delete User',
            description: `Delete ${selectedUser.username}? This cannot be undone.`,
            confirmButtonText: 'Delete User',
            cancelButtonText: 'Cancel',
            variant: 'destructive',
            requireConfirmationInput: {
                confirmTerm: selectedUser.username,
                hint: 'Type the exact username to confirm this action.',
            },
        });

        if (!isConfirmed) {
            return;
        }

        const fallbackUserId = usersQuery.users.find((user) => user.id !== selectedUserId)?.id ?? null;
        startMutationTransition(async () => {
            const response = await deleteUser(selectedUserId);
            if (response.error !== undefined) {
                toast.error(response.error);
                return;
            }

            await queryClient.invalidateQueries(trpc.userManagement.getUsers.queryFilter());
            await queryClient.removeQueries(
                trpc.userManagement.getUserDetails.queryFilter({
                    userId: selectedUserId,
                })
            );
            setSelectedUserId(fallbackUserId);
            toast.success('User deleted');
        });
    };

    const permissionGroups = useMemo(() => {
        if (!detailsQuery.data) {
            return [];
        }

        const recruitmentListById = new Map(
            detailsQuery.data.recruitmentLists
                .filter((list) => Boolean(list.id))
                .map((list) => [list.id as string, list])
        );

        const groups = new Map<
            string,
            {
                key: string;
                name: string;
                description: string;
                tags: string[];
                permissions: Array<{
                    id: string;
                    action: string;
                }>;
            }
        >();

        for (const permission of detailsQuery.data.permissions) {
            const resourceId = permission.resourceId ?? '__global__';
            const recruitmentList = permission.resourceId ? recruitmentListById.get(permission.resourceId) : null;

            if (!groups.has(resourceId)) {
                groups.set(resourceId, {
                    key: resourceId,
                    name: recruitmentList?.name ?? (permission.resourceId ? permission.resourceId : 'Global permissions'),
                    description: recruitmentList?.description ?? '',
                    tags: recruitmentList?.tags ?? [],
                    permissions: [],
                });
            }

            groups.get(resourceId)?.permissions.push({
                id: permission.id,
                action: permission.action,
            });
        }

        return Array.from(groups.values()).sort((left, right) => {
            if (left.key === '__global__') {
                return -1;
            }
            if (right.key === '__global__') {
                return 1;
            }
            return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
        });
    }, [detailsQuery.data]);

    if (usersQuery.isError) {
        return (
            <div className="h-full p-6">
                <ErrorAlert
                    title="Failed to load users"
                    description={usersQuery.error instanceof Error ? usersQuery.error.message : 'Unknown error'}
                />
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 p-4 lg:p-6">
            <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
                <Card className="flex h-full min-h-0 flex-col border-border/80">
                    <CardHeader className="space-y-2">
                        <div className="space-y-1">
                            <CardTitle>Researcher Users</CardTitle>
                            <CardDescription>
                                Filter by username, email, or accessible recruitment list.
                            </CardDescription>
                        </div>

                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search users..."
                                className="pl-9"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Showing {usersQuery.filteredUsers} of {usersQuery.totalUsers} users
                        </p>
                    </CardHeader>
                    <Separator />
                    <CardContent className="min-h-0 flex-1 overflow-y-auto">
                        {usersQuery.isPending && (
                            <div className="space-y-2">
                                {Array.from({ length: 5 }, (_, idx) => idx).map((key) => (
                                    <div key={key} className="space-y-2 rounded-xl border p-3">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-52" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {!usersQuery.isPending && usersQuery.users.length === 0 && (
                            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                                No users match the current filter.
                            </div>
                        )}

                        {!usersQuery.isPending && usersQuery.users.length > 0 && (
                            <div className="space-y-2">
                                {usersQuery.users.map((user) => {
                                    const isSelected = user.id === selectedUserId;
                                    const resourceLabel = user.resourceCount === 1
                                        ? '1 resource'
                                        : `${user.resourceCount} resources`;

                                    return (
                                        <button
                                            type="button"
                                            key={user.id}
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={cn(
                                                'w-full rounded-xl border px-4 py-2 text-left transition-colors',
                                                isSelected ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/50'
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">
                                                        {user.username}
                                                        {user.sub === currentUserSub ? (
                                                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                                (You)
                                                            </span>
                                                        ) : null}
                                                    </p>
                                                    <p className="truncate text-xs">{user.email}</p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {resourceLabel}
                                                    </p>
                                                </div>
                                                <Badge variant={user.isAdmin ? 'default' : 'outline'}>
                                                    {user.isAdmin ? 'admin' : 'user'}
                                                </Badge>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="flex h-full min-h-0 flex-col border-border/80">
                    {!selectedUserId && (
                        <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
                            Select a user from the list to inspect permissions.
                        </div>
                    )}

                    {selectedUserId && detailsQuery.isError && (
                        <div className="p-6">
                            <ErrorAlert
                                title="Failed to load user details"
                                description={detailsQuery.error instanceof Error ? detailsQuery.error.message : 'Unknown error'}
                            />
                        </div>
                    )}

                    {selectedUserId && detailsQuery.isPending && (
                        <div className="space-y-4 p-6">
                            <Skeleton className="h-8 w-56" />
                            <Skeleton className="h-5 w-72" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    )}

                    {selectedUserId && detailsQuery.data && (
                        <>
                            <CardHeader>
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-12">
                                            <AvatarImage
                                                src={detailsQuery.data.user.imageUrl}
                                                alt={detailsQuery.data.user.username}
                                            />
                                            <AvatarFallback>
                                                {detailsQuery.data.user.username.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle>{detailsQuery.data.user.username}</CardTitle>
                                            <CardDescription className="text-base">
                                                {detailsQuery.data.user.email}
                                            </CardDescription>
                                            <div className="mt-2 flex gap-2">
                                                <Badge variant={detailsQuery.data.user.isAdmin ? 'default' : 'secondary'}>
                                                    {detailsQuery.data.user.isAdmin ? 'admin' : 'user'}
                                                </Badge>
                                                <Badge variant="outline">
                                                    Last login {formatDateValue(detailsQuery.data.user.lastLoginAt)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                                            <Switch
                                                id="is-admin"
                                                checked={detailsQuery.data.user.isAdmin}
                                                onCheckedChange={onToggleAdmin}
                                                disabled={isMutating}
                                            />
                                            <Label htmlFor="is-admin">Admin</Label>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsAddPermissionOpen(true)}
                                            disabled={isMutating}
                                        >
                                            <Plus className="mr-2 size-4" />
                                            Add Permission
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={onDeleteUser}
                                            disabled={isMutating}
                                        >
                                            Delete User
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <Separator />
                            <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
                                {permissionGroups.length === 0 && (
                                    <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                                        No permissions found for this user.
                                    </div>
                                )}

                                {permissionGroups.map((group) => (
                                    <div key={group.key} className="space-y-3 rounded-xl border p-3">
                                        <div className="flex items-start justify-between" >
                                            <div>
                                                <h3 className="text-sm font-semibold">{group.name}</h3>
                                                {group.description ? (
                                                    <p className="text-xs text-muted-foreground">{group.description}</p>
                                                ) : null}
                                            </div>
                                            {group.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {group.tags.map((tag) => (
                                                        <Badge key={`${group.key}-${tag}`} variant="secondary">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                        <Separator />
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Permissions</p>
                                            <div className="flex flex-wrap gap-2">
                                                {group.permissions.map((permission) => (
                                                    <Button
                                                        key={permission.id}
                                                        variant="secondary"
                                                        size="xs"
                                                        className="px-3 rounded-full"
                                                        onClick={() => onDeletePermission(permission.id)}
                                                        disabled={isMutating}
                                                    >
                                                        {formatPermissionAction(permission.action)}
                                                        <X className="ml-1 size-3" />
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>

                            <AddPermissionDialog
                                isOpen={isAddPermissionOpen}
                                onClose={() => setIsAddPermissionOpen(false)}
                                onAdded={() => invalidateUserData(selectedUserId)}
                                userId={selectedUserId}
                                recruitmentLists={detailsQuery.data.recruitmentLists}
                            />
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default UserManagementWorkspace;
