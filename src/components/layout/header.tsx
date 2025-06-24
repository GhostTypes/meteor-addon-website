import { BookText, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Github } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ApiDocsDialog } from '../api-docs-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="mr-4 flex items-center">
          <ShoppingBag className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold font-headline">Meteor Addons</span>
        </Link>
        <nav className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <BookText className="h-5 w-5" />
                  <span className="sr-only">API Docs</span>
                </Button>
              </DialogTrigger>
              <ApiDocsDialog />
            </Dialog>
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com/GhostTypes" target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                </a>
            </Button>
        </nav>
      </div>
    </header>
  );
}
