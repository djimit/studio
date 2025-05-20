
'use client';

import type { HistoryItem } from '@/lib/history';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, History, ListRestart, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PromptHistoryDisplayProps {
  history: HistoryItem[];
  onLoadHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  isLoading: boolean; // To disable buttons during other operations
}

export function PromptHistoryDisplay({ history, onLoadHistoryItem, onClearHistory, isLoading }: PromptHistoryDisplayProps) {
  if (!history || history.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <span>Refinement History</span>
          </CardTitle>
          <CardDescription>
            No history yet. Your analyzed prompts will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <span>Refinement History</span>
        </CardTitle>
        <CardDescription>
          Review and reload your past prompt refinements. History is stored locally.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="p-3 border rounded-md bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:shadow-md transition-shadow">
                <div className="flex-grow">
                  <p className="text-sm font-medium text-foreground truncate max-w-xs sm:max-w-sm md:max-w-md" title={item.originalPrompt}>
                    {item.originalPrompt}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                  {item.analysisResult.suggestedModel && (
                     <p className="text-xs text-muted-foreground mt-0.5">
                        Model: {item.analysisResult.suggestedModel.length > 30 ? item.analysisResult.suggestedModel.substring(0,27) + "..." : item.analysisResult.suggestedModel }
                     </p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onLoadHistoryItem(item)}
                  disabled={isLoading}
                  className="mt-2 sm:mt-0 shrink-0"
                >
                  <ListRestart className="mr-2 h-4 w-4" />
                  Load
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isLoading}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear All History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" /> Are you sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete all your refinement history from this browser. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onClearHistory} className="bg-destructive hover:bg-destructive/90">
                Yes, Clear History
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
