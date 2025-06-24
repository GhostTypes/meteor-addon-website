'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Addon } from '@/types';
import { unstable_cache } from 'next/cache';

const ADDONS_PATH = path.join(process.cwd(), 'src', 'data', 'addons.json');

// Using unstable_cache to cache the file read operation.
// It will be invalidated when we revalidate the tag 'addons-data'.
export const getAddonsFromFile = unstable_cache(
  async (): Promise<Addon[]> => {
    try {
      const content = await fs.readFile(ADDONS_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // If the file doesn't exist, create it with an empty array
        await writeAddonsToFile([]);
        return [];
      }
      console.error('Failed to read addons.json:', error);
      throw new Error('Could not load addon data.');
    }
  },
  ['addons-file-cache'], // Cache key
  {
    tags: ['addons-data'], // Cache tag for revalidation
  }
);


export async function writeAddonsToFile(addons: Addon[]): Promise<void> {
  try {
    await fs.writeFile(ADDONS_PATH, JSON.stringify(addons, null, 2));
  } catch (error) {
    console.error('Failed to write to addons.json:', error);
    throw new Error('Could not save addon data.');
  }
}
