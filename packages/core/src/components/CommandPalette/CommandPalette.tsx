/* eslint-disable no-unused-vars */
import * as React from 'react';

import { Dialog } from '../Dialog/Dialog.js';
import { VirtualList } from '../VirtualList/VirtualList.js';
import { trigramSimilarity } from '../../utils/trigram.js';
import { cn } from '../../utils/cn.js';

export interface CommandItem {
  value: string;
  label: string;
  category?: string;
  onSelect?: (_value: string) => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder = 'Type a command or search...',
}: CommandPaletteProps) {
  const [search, setSearch] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const baseId = React.useId();

  // 1. Run trigram similarity scoring: O(n log n)
  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    return items
      .map(item => ({
        item,
        score: trigramSimilarity(search, item.label),
      }))
      .filter(res => res.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .map(res => res.item);
  }, [items, search]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Focus input on open
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // 2. Keyboard event handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeOption = filteredItems[activeIndex];
      if (activeOption) {
        activeOption.onSelect?.(activeOption.value);
        onOpenChange(false);
      }
    }
  };

  const activeOptionId = filteredItems[activeIndex]
    ? `${baseId}-option-${filteredItems[activeIndex].value}`
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="overflow-hidden p-0 max-w-2xl">
        <div className="flex items-center border-b border-[var(--color-border-default,#d1d5db)] px-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5 opacity-50 text-[var(--color-text-primary,#111827)] mr-2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={`${baseId}-listbox`}
            aria-activedescendant={activeOptionId}
            placeholder={placeholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[var(--color-text-secondary,#6b7280)] text-[var(--color-text-primary,#111827)]"
          />
        </div>

        <div id={`${baseId}-listbox`} role="listbox" className="p-2">
          {filteredItems.length === 0 && (
            <div className="py-6 text-center text-sm text-[var(--color-text-secondary,#6b7280)]">
              No results found.
            </div>
          )}
          {filteredItems.length > 0 && (
            <VirtualList
              items={filteredItems}
              itemHeight={44}
              containerHeight={300}
              renderItem={(item, index) => {
                const isHighlighted = index === activeIndex;
                return (
                  <button
                    type="button"
                    key={item.value}
                    id={`${baseId}-option-${item.value}`}
                    role="option"
                    aria-selected={isHighlighted}
                    onClick={() => {
                      item.onSelect?.(item.value);
                      onOpenChange(false);
                    }}
                    className={cn(
                      'flex h-11 w-full cursor-default select-none items-center rounded-sm px-3 text-sm outline-none hover:bg-[var(--color-background-subtle,#f3f4f6)] transition-colors text-left',
                      isHighlighted && 'bg-[var(--color-background-subtle,#f3f4f6)] font-semibold'
                    )}
                  >
                    <span>{item.label}</span>
                    {item.category && (
                      <span className="ml-auto text-xs text-[var(--color-text-secondary,#6b7280)]">
                        {item.category}
                      </span>
                    )}
                  </button>
                );
              }}
            />
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
