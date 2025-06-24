'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { scrapeAllAddons } from '@/lib/scraper';
import { getAddonsFromFile, writeAddonsToFile } from '@/lib/addon-data';
import type { Addon, ControlPanelData } from '@/types';
import { revalidatePath, revalidateTag } from 'next/cache';

const VERIFIED_PATH = path.join(process.cwd(), 'src', 'data', 'verified.json');
const LAST_SCRAPED_PATH = path.join(process.cwd(), 'src', 'data', 'last-scraped.json');
const BLACKLIST_PATH = path.join(process.cwd(), 'src', 'data', 'blacklist.json');

async function readJsonFile(filePath: string, defaultValue: any = []) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return defaultValue;
    }
    throw error;
  }
}

export async function getControlPanelData(): Promise<ControlPanelData> {
  try {
    const addons = await getAddonsFromFile();
    const verifiedRepoIds = await readJsonFile(VERIFIED_PATH);

    let lastRefreshed: string | null = null;
    try {
      const content = await fs.readFile(LAST_SCRAPED_PATH, 'utf-8');
      lastRefreshed = JSON.parse(content).lastScraped;
    } catch (error) {
      // File might not exist yet.
    }
    
    addons.sort((a, b) => a.name.localeCompare(b.name));

    return {
      addons,
      verifiedRepoIds,
      totalAddons: addons.length,
      lastRefreshed,
    };
  } catch (error) {
    console.error('Failed to get control panel data:', error);
    throw new Error('Could not load control panel data.');
  }
}

export async function updateVerifiedAddons(verifiedRepoIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    // Persist the selection for future scrapes by updating verified.json
    await fs.writeFile(VERIFIED_PATH, JSON.stringify(verifiedRepoIds, null, 2));

    // Apply the change instantly to the current dataset by modifying addons.json
    const addons = await getAddonsFromFile();
    const updatedAddons = addons.map(addon => ({
        ...addon,
        verified: verifiedRepoIds.includes(addon.id)
    }));
    await writeAddonsToFile(updatedAddons);

    // Revalidate the cache to show the changes across the site
    revalidateTag('addons-data');
    revalidatePath('/');
    revalidatePath('/control-panel');

    return { success: true, message: 'Verified addons updated successfully.' };
  } catch (error) {
    console.error('Failed to update verified addons:', error);
    return { success: false, message: 'Failed to update verified addons.' };
  }
}

export async function triggerRescrape(): Promise<{ success: boolean; message:string }> {
  try {
    console.log("Starting re-scrape...");
    const freshAddons = await scrapeAllAddons();
    console.log(`Scraping finished, found ${freshAddons.length} addons.`);
    
    await writeAddonsToFile(freshAddons);
    console.log("Saved addons to addons.json");

    await fs.writeFile(LAST_SCRAPED_PATH, JSON.stringify({ lastScraped: new Date().toISOString() }));
    
    revalidateTag('addons-data');
    revalidatePath('/');
    revalidatePath('/control-panel');
    
    return { success: true, message: 'Re-scrape completed successfully!' };
  } catch (error: any) {
    console.error('Failed to trigger re-scrape:', error);
    return { success: false, message: `Re-scrape failed: ${error.message}` };
  }
}

export async function removeAddon(repoId: string): Promise<{ success: boolean; message: string }> {
  try {
    const blacklist = await readJsonFile(BLACKLIST_PATH, []);
    if (!blacklist.includes(repoId)) {
      blacklist.push(repoId);
      await fs.writeFile(BLACKLIST_PATH, JSON.stringify(blacklist, null, 2));
    }
    
    const addons = await getAddonsFromFile();
    const filteredAddons = addons.filter(a => a.id !== repoId);
    await writeAddonsToFile(filteredAddons);
    
    revalidateTag('addons-data');
    revalidatePath('/');
    revalidatePath('/control-panel');

    return { success: true, message: 'Addon removed and will be excluded from the next scrape.' };
  } catch (error: any) {
    console.error(`Failed to remove addon ${repoId}:`, error);
    return { success: false, message: `Failed to remove addon: ${error.message}` };
  }
}
