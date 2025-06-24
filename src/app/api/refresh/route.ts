
import { triggerRescrape } from '@/app/control-panel/actions';
import { NextRequest, NextResponse } from 'next/server';

// This endpoint is protected by a secret token
// e.g. /api/refresh?token=YOUR_SECRET_TOKEN
// It can be called by an external cron job service to periodically refresh the addon data.

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const REVALIDATION_TOKEN = process.env.REVALIDATION_TOKEN;

  if (!REVALIDATION_TOKEN) {
    return NextResponse.json({ message: 'Revalidation token is not configured on the server.' }, { status: 500 });
  }

  if (token !== REVALIDATION_TOKEN) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    console.log('Periodic refresh triggered: Starting re-scrape...');
    const result = await triggerRescrape();
    if (result.success) {
      console.log('Periodic refresh finished successfully.');
      return NextResponse.json({ revalidated: true, now: Date.now(), message: result.message });
    } else {
      console.error('Periodic refresh failed:', result.message);
      return NextResponse.json({ revalidated: false, message: result.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error during periodic re-scrape:', error);
    return NextResponse.json({ message: 'An unexpected error occurred during scrape.', error: error.message }, { status: 500 });
  }
}
