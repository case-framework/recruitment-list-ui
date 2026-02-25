
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemFooter,
    ItemGroup,
    ItemSeparator,
    ItemTitle,
} from "@/components/ui/item";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { hasCreateRecruitmentListPermission } from "@/lib/backend/permissions";
import { getRecruitmentLists } from "@/lib/backend/recruitmentLists";
import { RecruitmentListInfo } from "@/lib/backend/types";
import { ChevronDown, ChevronRight, PlusCircle } from "lucide-react";
import Link from "next/link";


export const dynamic = 'force-dynamic';

type RecruitmentListWithTags = RecruitmentListInfo & { tags?: unknown };

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

const getListTags = (list: RecruitmentListWithTags) => {
    if (!Array.isArray(list.tags)) {
        return [];
    }

    const cleanedTags = list.tags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter((tag): tag is string => tag.length > 0);

    return Array.from(new Set(cleanedTags)).sort((a, b) => collator.compare(a, b));
};

const sortByListName = (a: RecruitmentListInfo, b: RecruitmentListInfo) => collator.compare(a.name, b.name);

const renderListItems = (items: RecruitmentListWithTags[]) => (
    <ItemGroup className="rounded-md border">
        {items.map((list, index) => {
            const tags = getListTags(list);
            const listId = typeof list.id === "string" && list.id.length > 0 ? list.id : undefined;

            return (
                <div key={list.id ?? `${list.name}-${index}`}>
                    {listId ? (
                        <Item
                            asChild
                            variant="default"
                            size="default"
                            className="flex-nowrap rounded-none px-4 py-3 hover:bg-accent/30"
                        >
                            <Link href={`/home/${listId}`} aria-label={`Open ${list.name}`}>
                                <ItemContent className="gap-2">
                                    <div className="space-y-1">
                                        <ItemTitle className="text-base">{list.name}</ItemTitle>
                                        <ItemDescription className="line-clamp-none text-sm">
                                            {list.description}
                                        </ItemDescription>
                                    </div>
                                    {tags.length > 0 && (
                                        <ItemFooter className="justify-start">
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag) => (
                                                    <Badge key={`${list.id}-${tag}`} variant="secondary">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </ItemFooter>
                                    )}
                                </ItemContent>
                                <ChevronRight className="size-5 shrink-0 self-center text-muted-foreground" />
                            </Link>
                        </Item>
                    ) : (
                        <Item variant="default" size="default" className="flex-nowrap rounded-none px-4 py-3">
                            <ItemContent className="gap-2">
                                <div className="space-y-1">
                                    <ItemTitle className="text-base">{list.name}</ItemTitle>
                                    <ItemDescription className="line-clamp-none text-sm">
                                        {list.description}
                                    </ItemDescription>
                                </div>
                                {tags.length > 0 && (
                                    <ItemFooter className="justify-start">
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <Badge key={`${list.id}-${tag}`} variant="secondary">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </ItemFooter>
                                )}
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

export default async function Page() {

    const allowedToCreateRecruitmentList = await hasCreateRecruitmentListPermission();


    const resp = await getRecruitmentLists();
    const lists: RecruitmentListWithTags[] = (resp.recruitmentLists || []).slice().sort(sortByListName);
    const untaggedLists = lists.filter((list) => getListTags(list).length === 0);

    const listsByTag = lists.reduce<Map<string, RecruitmentListWithTags[]>>((acc, list) => {
        const tags = getListTags(list);
        tags.forEach((tag) => {
            const group = acc.get(tag) || [];
            group.push(list);
            acc.set(tag, group);
        });
        return acc;
    }, new Map());

    const tagGroups = Array.from(listsByTag.entries())
        .sort(([tagA], [tagB]) => collator.compare(tagA, tagB))
        .map(([tag, groupedLists]) => [tag, groupedLists.sort(sortByListName)] as const);

    return (
        <div className="flex items-center justify-center h-full py-6">
            <Card className="max-w-4xl w-full p-4 max-h-full overflow-y-auto">
                <div className="flex justify-between items-end mb-6 gap-8">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold">Recruitment Lists</h1>
                        <p className="text-muted-foreground text-sm">
                            Select a recruitment list to view the participants and responses.
                        </p>
                    </div>
                    {allowedToCreateRecruitmentList && <Button
                        variant={'secondary'}
                        asChild
                    >
                        <Link href="/home/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Recruitment List
                        </Link>
                    </Button>}
                </div>

                {lists.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyTitle>No recruitment lists yet</EmptyTitle>
                            <EmptyDescription>
                                Create a recruitment list first to start.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium text-muted-foreground">Without tags</h2>
                                <span className="text-xs text-muted-foreground">{untaggedLists.length}</span>
                            </div>
                            {untaggedLists.length > 0 ? (
                                renderListItems(untaggedLists)
                            ) : (
                                <p className="text-sm text-muted-foreground">No recruitment lists without tags.</p>
                            )}
                        </div>

                        {tagGroups.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-medium text-muted-foreground">Grouped by tag</h2>
                                {tagGroups.map(([tag, groupedLists]) => (
                                    <Collapsible key={tag} className="space-y-2">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                <span className="flex items-center gap-2">
                                                    <Badge variant="outline">{tag}</Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {groupedLists.length} list{groupedLists.length === 1 ? "" : "s"}
                                                    </span>
                                                </span>
                                                <ChevronDown className="size-4 text-muted-foreground" />
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            {renderListItems(groupedLists)}
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        )}
                    </div>
                )
                }
            </Card >
        </div>
    );
}
