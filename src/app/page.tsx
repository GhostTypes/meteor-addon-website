
import { getAddonsFromFile } from '@/lib/addon-data';
import { AddonGrid } from '@/components/addon-grid';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import type { Addon } from '@/types';

// This page's data is now revalidated on-demand when the underlying data file changes
// via the control panel or the new /api/refresh endpoint.

export default async function Home() {
  let addons: Addon[] | null = null;
  let error: string | null = null;

  try {
    // Read from the local JSON file
    addons = await getAddonsFromFile();
  } catch (e: any) {
    console.error('Failed to fetch addons from file:', e);
    error = e.message || 'An unknown error occurred while reading addon data.';
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              Meteor Addon Shop
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-4">
              Discover a collection of community-made addons for the Meteor Client.
            </p>
          </div>
          {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Loading Addons</AlertTitle>
              <AlertDescription>
                <p>{error}</p>
                <p className="mt-2">The addon data file may be missing or corrupted. Please try again later or trigger a re-scrape from the control panel.</p>
              </AlertDescription>
            </Alert>
          )}
          {addons && <AddonGrid addons={addons} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
