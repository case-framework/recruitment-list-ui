"use client";

import { X, Plus } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { useEffect, useEffectEvent, useMemo, useState } from 'react';

interface TagEditorCompactProps {
  availableTags: string[];
  initialTags?: string[];
  value?: string[];
  onChange?: (tags: string[]) => void;
}

const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

const normalizeTags = (rawTags: string[] | undefined): string[] => {
  if (!rawTags) {
    return [];
  }

  const cleanedTags = rawTags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return Array.from(new Set(cleanedTags)).sort((a, b) => collator.compare(a, b));
};

const TagEditorCompact = ({ availableTags, initialTags = [], value, onChange }: TagEditorCompactProps) => {
  const isControlled = value !== undefined;
  const [internalTags, setInternalTags] = useState<string[]>(() => normalizeTags(initialTags));
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');


  const onSetInternalTags = useEffectEvent(() => {
    setInternalTags(normalizeTags(initialTags));
  });

  useEffect(() => {
    if (!isControlled) {
      onSetInternalTags();
    }
  }, [isControlled]);

  const tags = useMemo(
    () => (isControlled ? normalizeTags(value) : internalTags),
    [isControlled, value, internalTags]
  );

  const updateTags = (newTags: string[]) => {
    const nextTags = normalizeTags(newTags);
    if (!isControlled) {
      setInternalTags(nextTags);
    }
    onChange?.(nextTags);
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      updateTags([...tags, tag]);
    }
    setSearchValue('');
    setOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    updateTags(tags.filter(tag => tag !== tagToRemove));
  };

  const unusedTags = normalizeTags(availableTags.filter(tag => !tags.includes(tag)));

  const filteredTags = searchValue
    ? unusedTags.filter(tag => tag.toLowerCase().includes(searchValue.toLowerCase()))
    : unusedTags;

  const canCreateCustom = searchValue.trim() &&
    !tags.includes(searchValue.trim()) &&
    !availableTags.some(tag => tag.toLowerCase() === searchValue.trim().toLowerCase());

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap min-h-12 p-2 border rounded-lg bg-white">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="h-8 px-3 gap-2 pr-1 text-sm">
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-gray-300 rounded-full p-0.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </Badge>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="h-8 px-3 text-sm gap-1.5 font-medium">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-64" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search or create tag..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                {canCreateCustom && (
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => addTag(searchValue.trim())}
                      className="cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create &quot;<span className="font-medium">{searchValue.trim()}</span>&quot;
                    </CommandItem>
                  </CommandGroup>
                )}
                {filteredTags.length > 0 && (
                  <CommandGroup heading="Available Tags">
                    {filteredTags.map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => addTag(tag)}
                        className="cursor-pointer"
                      >
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {filteredTags.length === 0 && !canCreateCustom && (
                  <CommandEmpty>No tags found</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default TagEditorCompact;
