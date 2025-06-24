
'use client';

import type { Addon } from '@/types';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Download, Users, Clock, Code, Github, Home, Puzzle, List, Info, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DiscordIcon = () => (
    <svg role="img" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.36981C18.7915 3.72559 17.1858 3.28418 15.5212 3.0686C15.2428 3.52837 14.9228 4.09332 14.656 4.59578C12.5638 4.23418 10.4717 4.23418 8.37953 4.59578C8.11273 4.09332 7.79275 3.52837 7.51433 3.0686C5.84978 3.28418 4.24407 3.72559 2.71855 4.36981C0.291501 9.35166 -0.320799 14.2125 0.817112 18.8924C2.62863 20.2803 4.63357 21.2872 6.78651 21.9314C7.26514 21.3149 7.68019 20.6569 8.01633 19.9658C7.03432 19.6465 6.10594 19.2217 5.25629 18.6912C5.52309 18.4962 5.77924 18.2905 6.02473 18.074C9.44848 19.6122 13.5939 19.6122 17.0176 18.074C17.2631 18.2905 17.5192 18.4962 17.786 18.6912C16.9364 19.2217 16.008 19.6465 15.026 19.9658C15.3621 20.6569 15.7772 21.3149 16.2558 21.9314C18.4088 21.2872 20.4137 20.2803 22.2252 18.8924C23.3734 14.0205 22.7183 9.11721 20.317 4.36981ZM8.02231 15.8821C7.07235 15.8821 6.27915 15.0234 6.27915 13.9981C6.27915 12.9729 7.05033 12.1142 8.02231 12.1142C8.99428 12.1142 9.78748 12.9729 9.76546 13.9981C9.76546 15.0234 8.99428 15.8821 8.02231 15.8821ZM15.0194 15.8821C14.0694 15.8821 13.2762 15.0234 13.2762 13.9981C13.2762 12.9729 14.0474 12.1142 15.0194 12.1142C15.9914 12.1142 16.7846 12.9729 16.7626 13.9981C16.7626 15.0234 15.9914 15.8821 15.0194 15.8821Z"/>
    </svg>
);

interface AddonDetailsDialogProps {
  addon: Addon;
}

export function AddonDetailsDialog({ addon }: AddonDetailsDialogProps) {
  const lastUpdated = formatDistanceToNow(new Date(addon.last_update), { addSuffix: true });
  const discordLink = addon.links.discord;

  return (
    <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
      <DialogHeader className="flex-shrink-0 flex flex-col sm:flex-row items-start gap-6 pr-6">
          <Avatar className="w-24 h-24 rounded-2xl flex-shrink-0">
              <AvatarImage asChild src={addon.icon || ''} >
                  <Image src={addon.icon!} alt={`${addon.name} icon`} width={96} height={96} className="object-cover" data-ai-hint="abstract geometric" />
              </AvatarImage>
              <AvatarFallback className="rounded-2xl bg-muted">
                  <Puzzle className="w-12 h-12 text-muted-foreground" />
              </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-3">
                <DialogTitle className="font-headline text-3xl">{addon.name}</DialogTitle>
                {addon.verified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <ShieldCheck className="w-6 h-6 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Addon</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <DialogDescription>{addon.summary}</DialogDescription>
          </div>
      </DialogHeader>
      
      <div className="my-4 pr-6">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t">
            <div className="flex flex-col gap-8">
              <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><Info className="w-5 h-5"/> Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> {addon.stars.toLocaleString()} Stars</div>
                      <div className="flex items-center gap-2"><Download className="w-4 h-4 text-primary" /> {addon.downloads.toLocaleString()} Downloads</div>
                      <div className="flex items-center gap-2"><Code className="w-4 h-4 text-primary" /> MC {addon.mc_version || 'N/A'}</div>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {lastUpdated}</div>
                  </div>
              </div>
              <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><Users className="w-5 h-5"/> Authors</h4>
                  <div className="flex flex-wrap gap-2">
                      {addon.authors.map((author) => (
                          <Badge key={author} variant="secondary">{author}</Badge>
                      ))}
                  </div>
              </div>
            </div>
            <div className="space-y-3 flex flex-col">
                <h4 className="font-semibold flex items-center gap-2 flex-shrink-0"><List className="w-5 h-5"/> Features ({addon.feature_count})</h4>
                {addon.feature_count > 0 ? (
                    <ScrollArea className="rounded-md border h-56"> 
                        <ul className="p-3 space-y-2">
                            {addon.features.map((feature, index) => (
                                <li key={index} className="text-sm flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50" style={{marginTop: '0.4rem'}} />
                                  <span>{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No features listed.</p>
                )}
            </div>
        </div>
      </div>
      
      <DialogFooter className="flex-shrink-0 flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t pr-6">
          {addon.links.github && (
              <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href={addon.links.github} target="_blank" rel="noopener noreferrer"><Github /> GitHub</a>
              </Button>
          )}
          {discordLink && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href={discordLink} target="_blank" rel="noopener noreferrer"><DiscordIcon /> <span className="ml-1">Discord</span></a>
              </Button>
          )}
          {addon.links.homepage && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href={addon.links.homepage} target="_blank" rel="noopener noreferrer"><Home /> Homepage</a>
              </Button>
          )}
          {addon.links.download && (
              <Button asChild className="w-full sm:w-auto">
                  <a href={addon.links.download} target="_blank" rel="noopener noreferrer"><Download /> Download</a>
              </Button>
          )}
      </DialogFooter>
    </DialogContent>
  );
}
