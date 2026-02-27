'use client';

import { useMemo, useState } from 'react';
import type { inferRouterOutputs } from '@trpc/server';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemSeparator,
    ItemTitle,
} from '@/components/ui/item';
import type { AppRouter } from '@/trpc/routers/_app';
import { useMyRecruitmentLists } from '../../hooks/use-my-recruitment-lists';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type RecruitmentListWithTags =
    RouterOutputs['recruitmentListManagement']['getMyRecruitmentLists']['recruitmentLists'][number];

const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

const getListTags = (list: RecruitmentListWithTags) => {
    if (!Array.isArray(list.tags)) {
        return [];
    }

    const cleanedTags = list.tags
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter((tag): tag is string => tag.length > 0);

    return Array.from(new Set(cleanedTags)).sort((a, b) => collator.compare(a, b));
};

const sortByListName = (a: RecruitmentListWithTags, b: RecruitmentListWithTags) => {
    return collator.compare(a.name, b.name);
};

const renderListItems = (items: RecruitmentListWithTags[]) => (
    <ItemGroup className="gap-2 ps-2">
        {items.map((list, index) => {
            const listId = typeof list.id === 'string' && list.id.length > 0 ? list.id : undefined;

            return (
                <div key={list.id ?? `${list.name}-${index}`}>
                    {listId ? (
                        <Item
                            asChild
                            variant="outline"
                            size="sm"
                            className="flex-nowrap px-3 py-2 hover:bg-accent/30"
                        >
                            <Link href={`/home/${listId}`} aria-label={`Open ${list.name}`}>
                                <ItemContent className="gap-1">
                                    <div className="space-y-1">
                                        <ItemTitle className="text-sm">{list.name}</ItemTitle>
                                        <ItemDescription className="line-clamp-2 text-xs">
                                            {list.description}
                                        </ItemDescription>
                                    </div>
                                </ItemContent>
                                <ChevronRight className="size-5 shrink-0 self-center text-muted-foreground" />
                            </Link>
                        </Item>
                    ) : (
                        <Item variant="default" size="sm" className="flex-nowrap rounded-none px-3 py-2">
                            <ItemContent className="gap-1">
                                <div className="space-y-1">
                                    <ItemTitle className="text-sm">{list.name}</ItemTitle>
                                    <ItemDescription className="line-clamp-2 text-xs">
                                        {list.description}
                                    </ItemDescription>
                                </div>
                            </ItemContent>
                            <ChevronRight className="size-5 shrink-0 self-center text-muted-foreground" />
                        </Item>
                    )}
                    {index < items.length - 1 && <ItemSeparator />}
                </div>
            );
        })}
    </ItemGroup>
);

const matchesSearch = (list: RecruitmentListWithTags, searchTerm: string) => {
    if (searchTerm.length === 0) {
        return true;
    }

    const normalized = searchTerm.toLocaleLowerCase();
    const fields = [list.name, list.description ?? '', ...getListTags(list)];

    return fields.some((field) => field.toLocaleLowerCase().includes(normalized));
};

const RecruitmentLists = () => {
    const [search, setSearch] = useState('');
    const { data, isPending, error } = useMyRecruitmentLists();

    const lists = useMemo(() => {
        return (data?.recruitmentLists ?? []).slice().sort(sortByListName);
    }, [data?.recruitmentLists]);

    const filteredLists = useMemo(() => {
        return lists.filter((list) => matchesSearch(list, search.trim()));
    }, [lists, search]);

    const untaggedLists = useMemo(() => {
        return filteredLists.filter((list) => getListTags(list).length === 0);
    }, [filteredLists]);

    const tagGroups = useMemo(() => {
        const listsByTag = filteredLists.reduce<Map<string, RecruitmentListWithTags[]>>((acc, list) => {
            const tags = getListTags(list);
            tags.forEach((tag) => {
                const group = acc.get(tag) ?? [];
                group.push(list);
                acc.set(tag, group);
            });
            return acc;
        }, new Map());

        return Array.from(listsByTag.entries())
            .sort(([tagA], [tagB]) => collator.compare(tagA, tagB))
            .map(([tag, groupedLists]) => [tag, groupedLists.sort(sortByListName)] as const);
    }, [filteredLists]);

    if (isPending) {
        return (
            <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed bg-muted/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span>Loading recruitment lists...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>Failed to load recruitment lists</EmptyTitle>
                    <EmptyDescription>{error.message}</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    if (lists.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>No recruitment lists yet</EmptyTitle>
                    <EmptyDescription>Create a recruitment list first to start.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="recruitment-list-search" className="text-sm font-medium">
                    Search
                </label>
                <Input
                    id="recruitment-list-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, description, or tag..."
                />
            </div>

            {filteredLists.length === 0 ? (
                <Empty>
                    <EmptyHeader>
                        <EmptyTitle>No matching recruitment lists</EmptyTitle>
                        <EmptyDescription>
                            Try another search term to find recruitment lists.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="space-y-6">
                    {untaggedLists.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium text-muted-foreground">Without tags</h2>
                                <span className="text-xs text-muted-foreground">{untaggedLists.length}</span>
                            </div>
                            {renderListItems(untaggedLists)}
                        </div>
                    )}

                    {tagGroups.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-medium text-muted-foreground">Grouped by tag</h2>
                            {tagGroups.map(([tag, groupedLists]) => (
                                <Collapsible key={tag} className="space-y-2" defaultOpen>
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="group w-full justify-between active:scale-[0.99]"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Badge variant="outline">{tag}</Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {groupedLists.length} list
                                                    {groupedLists.length === 1 ? '' : 's'}
                                                </span>
                                            </span>
                                            <ChevronLeft className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:-rotate-90" />
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>{renderListItems(groupedLists)}</CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecruitmentLists;
