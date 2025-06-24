'use client';

import { useState, useMemo } from 'react';
import type { Addon } from '@/types';
import { AddonCard } from './addon-card';
import { AddonFilters } from './addon-filters';
import { subMonths } from 'date-fns';

interface AddonGridProps {
  addons: Addon[];
}

export type SortKey = 'stars' | 'downloads' | 'last_update' | 'name';
export type UpdatedWithin = 'all' | '6' | '12';

export function AddonGrid({ addons }: AddonGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('stars');
  const [updatedWithin, setUpdatedWithin] = useState<UpdatedWithin>('all');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showUnverified, setShowUnverified] = useState(true);

  const availableVersions = useMemo(() => {
    const versions = new Set(addons.map(a => a.mc_version).filter((v): v is string => !!v && !!v.trim()));
    const invalidVersionFragments = ['properties', 'project.'];
    // Basic semver sort: split by '.', parse to int, compare. Handle non-numeric parts.
    return Array.from(versions)
      .filter(v => !invalidVersionFragments.some(fragment => v.includes(fragment)))
      .sort((a, b) => {
        const partsA = a.split('.').map(p => parseInt(p, 10) || 0);
        const partsB = b.split('.').map(p => parseInt(p, 10) || 0);
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            const valA = partsA[i] || 0;
            const valB = partsB[i] || 0;
            if (valA !== valB) return valB - valA;
        }
        return 0;
    });
  }, [addons]);

  const filteredAndSortedAddons = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    let filtered = addons;

    // Filter by search term
    if (lowerCaseSearchTerm) {
        filtered = addons.filter(addon => 
          addon.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          addon.summary.toLowerCase().includes(lowerCaseSearchTerm) ||
          addon.authors.some(author => author.toLowerCase().includes(lowerCaseSearchTerm)) ||
          addon.features.some(feature => feature.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }

    // Filter by last updated
    if (updatedWithin !== 'all') {
      const months = parseInt(updatedWithin, 10);
      const cutoffDate = subMonths(new Date(), months);
      filtered = filtered.filter(addon => new Date(addon.last_update) >= cutoffDate);
    }
    
    // Filter by Minecraft version
    if (selectedVersions.length > 0) {
      filtered = filtered.filter(addon => addon.mc_version && selectedVersions.includes(addon.mc_version));
    }
    
    // Filter by verified status
    if (!showUnverified) {
      filtered = filtered.filter(addon => addon.verified);
    }


    return filtered.sort((a, b) => {
      switch (sortKey) {
        case 'stars':
          return b.stars - a.stars;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'last_update':
          return new Date(b.last_update).getTime() - new Date(a.last_update).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [searchTerm, sortKey, addons, updatedWithin, selectedVersions, showUnverified]);

  return (
    <div>
      <AddonFilters
          addons={addons}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
          updatedWithin={updatedWithin}
          onUpdatedWithinChange={setUpdatedWithin}
          selectedVersions={selectedVersions}
          onSelectedVersionsChange={setSelectedVersions}
          availableVersions={availableVersions}
          showUnverified={showUnverified}
          onShowUnverifiedChange={setShowUnverified}
      />
      
      {filteredAndSortedAddons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedAddons.map((addon) => (
            <AddonCard key={addon.id} addon={addon} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-xl font-semibold">No addons found</p>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
