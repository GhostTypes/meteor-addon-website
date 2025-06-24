
import { getAddonsFromFile } from '@/lib/addon-data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Read from the local JSON file
    const addons = await getAddonsFromFile();
    return NextResponse.json(addons);
  } catch (error: any) {
    console.error('API Error fetching all addons:', error);
    return NextResponse.json({ error: 'Failed to fetch addons from file', details: error.message }, { status: 500 });
  }
}
