import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookText } from 'lucide-react';
import { Badge } from './ui/badge';

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground">
    {children}
  </code>
);

export function ApiDocsDialog() {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
          <BookText className="w-6 h-6 text-primary" /> API Documentation
        </DialogTitle>
        <DialogDescription>
          Access addon data programmatically using our simple JSON API.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-4 space-y-8 max-h-[60vh] overflow-y-auto pr-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Get All Addons</h3>
          <p className="text-muted-foreground">
            Returns a complete JSON list of all available addons. This endpoint is cached and updates every 4 hours.
          </p>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">GET</Badge>
            <Code>/api/addons/all</Code>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Search Addons</h3>
          <p className="text-muted-foreground">
            Returns a filtered and sorted list of addons based on query parameters.
          </p>
           <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">GET</Badge>
            <Code>/api/addons/search</Code>
          </div>
          <div className="space-y-3 mt-4">
            <h4 className="font-medium">Query Parameters</h4>
            <ul className="space-y-3 text-sm border-l-2 border-border pl-4 ml-2">
              <li className="space-y-1">
                <div className="flex items-center gap-2">
                    <Code>q</Code>
                    <Badge variant="outline">string</Badge>
                </div>
                <p className="text-muted-foreground">The search term. Searches addon name, summary, authors, and features.</p>
              </li>
              <li className="space-y-1">
                <div className="flex items-center gap-2">
                    <Code>sortBy</Code>
                    <Badge variant="outline">string</Badge>
                </div>
                <p className="text-muted-foreground">
                  The sort key. Can be one of: <Code>stars</Code>, <Code>downloads</Code>, <Code>last_update</Code>, <Code>name</Code>. Defaults to <Code>stars</Code>.
                </p>
              </li>
            </ul>
          </div>
           <div className="space-y-3 mt-4">
              <h4 className="font-medium">Example</h4>
                <div className="p-3 bg-muted/50 rounded-lg">
                    <Code>/api/addons/search?q=pvp&sortBy=downloads</Code>
                </div>
           </div>
        </div>
      </div>
    </DialogContent>
  );
}
