
'use client';

import { useState, useEffect } from 'react';
import type { Addon, ControlPanelData } from '@/types';
import { getControlPanelData, updateVerifiedAddons, triggerRescrape, removeAddon } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { HardDriveDownload, RefreshCw, ShieldCheck, Trash, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ControlPanelPage() {
  const [data, setData] = useState<ControlPanelData | null>(null);
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [addonToRemove, setAddonToRemove] = useState<Addon | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getControlPanelData();
      setData(result);
      setVerifiedIds(new Set(result.verifiedRepoIds));
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading data',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifiedChange = async (addonId: string, checked: boolean | 'indeterminate') => {
    if (isUpdating) return;

    const currentIds = new Set(verifiedIds);
    if (checked) {
        currentIds.add(addonId);
    } else {
        currentIds.delete(addonId);
    }
    const nextVerifiedIds = Array.from(currentIds);

    setIsUpdating(true);
    const result = await updateVerifiedAddons(nextVerifiedIds);

    if (result.success) {
        setVerifiedIds(new Set(nextVerifiedIds));
        toast({
            title: 'Updated',
            description: 'Addon verification status saved.',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message,
        });
        fetchData();
    }
    setIsUpdating(false);
  };
  
  const handleRescrape = async () => {
    setIsScraping(true);
    const result = await triggerRescrape();
     if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      fetchData();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
    setIsScraping(false);
  };
  
  const handleRemoveAddon = async () => {
    if (!addonToRemove) return;

    setIsUpdating(true);
    const result = await removeAddon(addonToRemove.id);

    if (result.success) {
      toast({
        title: 'Addon Removed',
        description: `'${addonToRemove.name}' has been blacklisted and removed from the current data.`,
      });
      await fetchData();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Removing Addon',
        description: result.message,
      });
    }

    setAddonToRemove(null);
    setIsUpdating(false);
  };

  const lastRefreshedText = data?.lastRefreshed 
    ? `${formatDistanceToNow(new Date(data.lastRefreshed), { addSuffix: true })}`
    : 'Never';

  const isActionInProgress = isUpdating || isScraping;

  return (
    <>
      <div className="container mx-auto py-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
              <h1 className="text-3xl font-headline font-bold">Control Panel</h1>
              <p className="text-muted-foreground">Manage addons and site data.</p>
          </div>
          <div className="flex gap-2">
              <Button onClick={handleRescrape} disabled={isActionInProgress} variant="outline">
                  <RefreshCw className={`mr-2 ${isScraping ? 'animate-spin' : ''}`}/>
                  {isScraping ? 'Scraping...' : 'Force Rescrape'}
              </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Addons</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{data?.totalAddons ?? 0}</div> }
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Addons</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{verifiedIds.size}</div> }
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Refresh</CardTitle>
              <HardDriveDownload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{lastRefreshedText}</div> }
            </CardContent>
          </Card>
        </section>

        <Card>
            <CardHeader>
                <CardTitle>Addon Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-auto border rounded-md" style={{height: '60vh'}}>
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                            <TableRow>
                                <TableHead className="w-[50px]">Verified</TableHead>
                                <TableHead>Addon Name</TableHead>
                                <TableHead>Authors</TableHead>
                                <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-5 rounded" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                                    </TableRow>
                                ))
                            ) : data?.addons.length ? (
                                data.addons.map((addon) => (
                                    <TableRow key={addon.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={verifiedIds.has(addon.id)}
                                                onCheckedChange={(checked) => handleVerifiedChange(addon.id, checked)}
                                                id={`verified-${addon.id}`}
                                                disabled={isActionInProgress}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium whitespace-nowrap">{addon.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-nowrap gap-1">
                                                {addon.authors.map(author => <Badge variant="secondary" key={author}>{author}</Badge>)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                          <Button variant="ghost" size="icon" onClick={() => setAddonToRemove(addon)} disabled={isActionInProgress}>
                                            <Trash className="w-4 h-4 text-destructive" />
                                            <span className="sr-only">Remove Addon</span>
                                          </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                    No addons found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!addonToRemove} onOpenChange={(open) => !open && setAddonToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently blacklist and remove the addon <span className="font-semibold text-foreground">{addonToRemove?.name}</span> from the site. This cannot be undone from the UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAddonToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAddon} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, remove it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
