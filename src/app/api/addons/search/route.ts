
import { getAddonsFromFile } from '@/lib/addon-data';
import type { Addon } from '@/types';
import { NextResponse, type NextRequest } from 'next/server';

type SortKey = 'stars' | 'downloads' | 'last_update' | 'name';

export async function GET(request: NextRequest) {
  try {
    // Read from the local JSON file
    const addons = await getAddonsFromFile();
    const { searchParams } = new URL(request.url);

    const searchTerm = searchParams.get('q')?.toLowerCase() || '';
    const sortKey = (searchParams.get('sortBy') as SortKey) || 'stars';

    let filteredAddons = addons;

    if (searchTerm) {
      filteredAddons = addons.filter(addon => 
        addon.name.toLowerCase().includes(searchTerm) ||
        addon.summary.toLowerCase().includes(searchTerm) ||
        addon.authors.some(author => author.toLowerCase().includes(searchTerm)) ||
        addon.features.some(feature => feature.toLowerCase().includes(searchTerm))
      );
    }

    const sortedAddons = [...filteredAddons].sort((a, b) => {
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

    return NextResponse.json(sortedAddons);

  } catch (error: any) {
    console.error('API Error searching addons:', error);
    return NextResponse.json({ error: 'Failed to fetch or process addons from file', details: error.message }, { status: 500 });
  }
}
