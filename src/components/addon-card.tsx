'use client';

import type { Addon } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Code, Download, Github, Home, Puzzle, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';
import { AddonDetailsDialog } from './addon-details-dialog';
import { Dialog, DialogTrigger } from './ui/dialog';

interface AddonCardProps {
  addon: Addon;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};


export function AddonCard({ addon }: AddonCardProps) {
  const discordLink = addon.links.discord;
  const DiscordIcon = () => (
    <svg role="img" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.36981C18.7915 3.72559 17.1858 3.28418 15.5212 3.0686C15.2428 3.52837 14.9228 4.09332 14.656 4.59578C12.5638 4.23418 10.4717 4.23418 8.37953 4.59578C8.11273 4.09332 7.79275 3.52837 7.51433 3.0686C5.84978 3.28418 4.24407 3.72559 2.71855 4.36981C0.291501 9.35166 -0.320799 14.2125 0.817112 18.8924C2.62863 20.2803 4.63357 21.2872 6.78651 21.9314C7.26514 21.3149 7.68019 20.6569 8.01633 19.9658C7.03432 19.6465 6.10594 19.2217 5.25629 18.6912C5.52309 18.4962 5.77924 18.2905 6.02473 18.074C9.44848 19.6122 13.5939 19.6122 17.0176 18.074C17.2631 18.2905 17.5192 18.4962 17.786 18.6912C16.9364 19.2217 16.008 19.6465 15.026 19.9658C15.3621 20.6569 15.7772 21.3149 16.2558 21.9314C18.4088 21.2872 20.4137 20.2803 22.2252 18.8924C23.3734 14.0205 22.7183 9.11721 20.317 4.36981ZM8.02231 15.8821C7.07235 15.8821 6.27915 15.0234 6.27915 13.9981C6.27915 12.9729 7.05033 12.1142 8.02231 12.1142C8.99428 12.1142 9.78748 12.9729 9.76546 13.9981C9.76546 15.0234 8.99428 15.8821 8.02231 15.8821ZM15.0194 15.8821C14.0694 15.8821 13.2762 15.0234 13.2762 13.9981C13.2762 12.9729 14.0474 12.1142 15.0194 12.1142C15.9914 12.1142 16.7846 12.9729 16.7626 13.9981C16.7626 15.0234 15.9914 15.8821 15.0194 15.8821Z"/>
    </svg>
  );

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="flex flex-col h-full transition-all duration-300 bg-card/50 backdrop-blur-xl border-border/60 hover:border-primary/80 hover:shadow-xl hover:shadow-primary/20 cursor-pointer">
          <CardHeader className="flex flex-row items-start gap-4 p-4">
            <Avatar className="w-16 h-16 rounded-xl flex-shrink-0">
              <AvatarImage asChild src={addon.icon || ''} >
                <Image src={addon.icon!} alt={`${addon.name} icon`} width={64} height={64} className="object-cover" data-ai-hint="abstract geometric" />
              </AvatarImage>
              <AvatarFallback className="rounded-xl bg-muted">
                <Puzzle className="w-8 h-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="font-headline text-lg">{addon.name}</CardTitle>
                {addon.verified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <ShieldCheck className="w-5 h-5 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Addon</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                   {addon.authors.map((author) => (
                       <Badge key={author} variant="secondary">{author}</Badge>
                   ))}
               </div>
            </div>
            <div className="flex items-center gap-0.5">
              {addon.links.download && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0 text-primary hover:text-primary" asChild>
                        <a href={addon.links.download} target="_blank" rel="noopener noreferrer" onClick={stopPropagation}>
                          <Download className="w-4 h-4" />
                          <span className="sr-only">Download</span>
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Download</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0">
            <CardDescription className="text-base line-clamp-3">{addon.summary}</CardDescription>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2 p-4 pt-2">
            <TooltipProvider>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <button className="flex items-center gap-1.5 cursor-default">
                              <Star className="w-4 h-4 text-primary" />
                              <span>{formatNumber(addon.stars)}</span>
                          </button>
                      </TooltipTrigger>
                      <TooltipContent><p>{addon.stars.toLocaleString()} stars</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <button className="flex items-center gap-1.5 cursor-default">
                              <Download className="w-4 h-4 text-primary" />
                              <span>{formatNumber(addon.downloads)}</span>
                          </button>
                      </TooltipTrigger>
                      <TooltipContent><p>{addon.downloads.toLocaleString()} downloads</p></TooltipContent>
                  </Tooltip>
                  {addon.mc_version && (
                      <div className="flex items-center gap-1.5">
                          <Code className="w-4 h-4 text-primary" />
                          <span className="truncate">{addon.mc_version}</span>
                      </div>
                  )}
              </div>
            </TooltipProvider>
            
            <div className='flex items-center gap-0 flex-shrink-0'>
             <TooltipProvider>
              {addon.links.github && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={addon.links.github} target="_blank" rel="noopener noreferrer" onClick={stopPropagation}><Github className="w-4 h-4" /></a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>View on GitHub</p></TooltipContent>
                </Tooltip>
              )}
              {discordLink && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={discordLink} target="_blank" rel="noopener noreferrer" onClick={stopPropagation}><DiscordIcon /></a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Join Discord Server</p></TooltipContent>
                </Tooltip>
              )}
              {addon.links.homepage && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={addon.links.homepage} target="_blank" rel="noopener noreferrer" onClick={stopPropagation}><Home className="w-4 h-4" /></a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Visit Homepage</p></TooltipContent>
                </Tooltip>
              )}
              </TooltipProvider>
            </div>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <AddonDetailsDialog addon={addon} />
    </Dialog>
  );
}
