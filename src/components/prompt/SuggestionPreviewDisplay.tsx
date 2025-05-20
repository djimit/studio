
'use client';

import type { ApplySingleSuggestionOutput } from '@/ai/flows/apply-single-suggestion-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SuggestionPreviewDisplayProps {
  previewResult: ApplySingleSuggestionOutput | null;
  isLoading: boolean; // Specific to preview generation
  error?: string | null;
  onApplyPreview?: (previewText: string) => void;
  disabled?: boolean; // Global loading state from page
}

export function SuggestionPreviewDisplay({ 
  previewResult, 
  isLoading, 
  error, 
  onApplyPreview,
  disabled = false 
}: SuggestionPreviewDisplayProps) {
  const renderContent = () => {
    if (isLoading) { // This is for when THIS component's action is loading
      return (
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="shadow-md">
          <AlertTitle>Suggestion Preview Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (previewResult?.previewPrompt) {
      return (
        <>
          <Textarea
            value={previewResult.previewPrompt}
            readOnly
            rows={8}
            className="text-base bg-muted/30 font-mono"
            aria-label="Preview of prompt with suggestion applied"
            disabled={disabled || isLoading} // Also disable if its own content is loading
          />
          {onApplyPreview && (
            <Button 
              onClick={() => onApplyPreview(previewResult.previewPrompt)} 
              className="mt-4 w-full sm:w-auto"
              variant="outline"
              disabled={disabled || isLoading} // Disable if global loading or its own content is loading
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Apply to Editor
            </Button>
          )}
        </>
      );
    }
    
    return <p className="text-muted-foreground">Click a "Preview" button on a suggestion to see its effect here.</p>;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          <span>Suggestion Preview</span>
        </CardTitle>
        <CardDescription>
          This shows how the original prompt might look with a single selected suggestion applied. You can apply this version to the main editor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && ( // Shows a spinner if THIS component's action is loading
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Generating Preview...</span>
          </div>
        )}
        {!isLoading && renderContent()}
      </CardContent>
    </Card>
  );
}
