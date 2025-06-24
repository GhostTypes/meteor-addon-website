'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { SortKey, UpdatedWithin } from '@/components/addon-grid';
import { Switch } from './ui/switch';

interface AddonFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortKey: SortKey;
  onSortKeyChange: (value: SortKey) => void;
  updatedWithin: UpdatedWithin;
  onUpdatedWithinChange: (value: UpdatedWithin) => void;
  selectedVersions: string[];
  onSelectedVersionsChange: (value: string[]) => void;
  availableVersions: string[];
  showUnverified: boolean;
  onShowUnverifiedChange: (value: boolean) => void;
}

export function AddonFilters({
  searchTerm,
  onSearchChange,
  sortKey,
  onSortKeyChange,
  updatedWithin,
  onUpdatedWithinChange,
  selectedVersions,
  onSelectedVersionsChange,
  availableVersions,
  showUnverified,
  onShowUnverifiedChange,
}: AddonFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Local state for the dialog form
  const [localSortKey, setLocalSortKey] = useState<SortKey>(sortKey);
  const [localUpdatedWithin, setLocalUpdatedWithin] = useState<UpdatedWithin>(updatedWithin);
  const [localSelectedVersions, setLocalSelectedVersions] = useState<string[]>(selectedVersions);
  const [localShowUnverified, setLocalShowUnverified] = useState<boolean>(showUnverified);

  useEffect(() => {
    if (isOpen) {
      setLocalSortKey(sortKey);
      setLocalUpdatedWithin(updatedWithin);
      setLocalSelectedVersions(selectedVersions);
      setLocalShowUnverified(showUnverified);
    }
  }, [isOpen, sortKey, updatedWithin, selectedVersions, showUnverified]);

  const handleApply = () => {
    onSortKeyChange(localSortKey);
    onUpdatedWithinChange(localUpdatedWithin);
    onSelectedVersionsChange(localSelectedVersions);
    onShowUnverifiedChange(localShowUnverified);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultSortKey: SortKey = 'stars';
    const defaultUpdatedWithin: UpdatedWithin = 'all';
    const defaultSelectedVersions: string[] = [];
    const defaultShowUnverified = true;

    setLocalSortKey(defaultSortKey);
    setLocalUpdatedWithin(defaultUpdatedWithin);
    setLocalSelectedVersions(defaultSelectedVersions);
    setLocalShowUnverified(defaultShowUnverified);
    
    onSortKeyChange(defaultSortKey);
    onUpdatedWithinChange(defaultUpdatedWithin);
    onSelectedVersionsChange(defaultSelectedVersions);
    onShowUnverifiedChange(defaultShowUnverified);
    setIsOpen(false);
  };
  
  const handleVersionChange = (version: string, checked: boolean | 'indeterminate') => {
    setLocalSelectedVersions(prev => 
        checked ? [...prev, version] : prev.filter(v => v !== version)
    );
  };
  
  const activeFilterCount =
    (sortKey !== 'stars' ? 1 : 0) +
    (updatedWithin !== 'all' ? 1 : 0) +
    selectedVersions.length +
    (!showUnverified ? 1 : 0);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search addons by name, author, or feature..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    {activeFilterCount}
                </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90dvh]">
          <DialogHeader>
            <DialogTitle>Filter & Sort</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid gap-6 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-unverified" className="cursor-pointer">
                  Show Unverified Addons
                </Label>
                <Switch
                  id="show-unverified"
                  checked={localShowUnverified}
                  onCheckedChange={setLocalShowUnverified}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="sort-key">Sort by</Label>
                <Select value={localSortKey} onValueChange={(v) => setLocalSortKey(v as SortKey)}>
                  <SelectTrigger id="sort-key">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stars">Stars</SelectItem>
                    <SelectItem value="downloads">Downloads</SelectItem>
                    <SelectItem value="last_update">Last Updated</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label>Last updated</Label>
                <RadioGroup value={localUpdatedWithin} onValueChange={(v) => setLocalUpdatedWithin(v as UpdatedWithin)} className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="r-all"/>
                        <Label htmlFor="r-all">Any time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6" id="r-6"/>
                        <Label htmlFor="r-6">Last 6 months</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="12" id="r-12"/>
                        <Label htmlFor="r-12">Last year</Label>
                    </div>
                </RadioGroup>
              </div>
              <div className="grid gap-3">
                <Label>Minecraft version</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-md border p-4">
                    {availableVersions.map(version => (
                      <div key={version} className="flex items-center space-x-3">
                        <Checkbox
                          id={`version-${version}`}
                          checked={localSelectedVersions.includes(version)}
                          onCheckedChange={(checked) => handleVersionChange(version, checked)}
                        />
                        <Label htmlFor={`version-${version}`} className="font-normal">{version}</Label>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
            </Button>
            <Button onClick={handleApply}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
