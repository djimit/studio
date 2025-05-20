
'use client';

import type { ApplySingleSuggestionOutput } from '@/ai/flows/apply-single-suggestion-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, Loader2, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SuggestionPreviewDisplayProps {
  previewResult: ApplySingleSuggestionOutput | null;
  isLoading: boolean; // Specific to preview generation
  error?: string | null;
  onApplyPreview?: (previewText: string) => void;
  disabled?: boolean; // Global loading state from page
  originalPromptForComparison?: string | null;
}

export function SuggestionPreviewDisplay({ 
  previewResult, 
  isLoading, 
  error, 
  onApplyPreview,
  disabled = false,
  originalPromptForComparison,
}: SuggestionPreviewDisplayProps) {

  const renderContent = () => {
    if (isLoading) { 
      return (
         <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2 space-y-2">
            <Skeleton className="h-6 w-1/3" /> {/* Label Skeleton */}
            <Skeleton className="h-32 w-full" /> {/* Textarea Skeleton */}
          </div>
          <div className="w-full sm:w-1/2 space-y-2">
            <Skeleton className="h-6 w-1/3" /> {/* Label Skeleton */}
            <Skeleton className="h-32 w-full" /> {/* Textarea Skeleton */}
          </div>
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

    if (previewResult?.previewPrompt && originalPromptForComparison) {
      return (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2 space-y-2">
              <Label htmlFor="original-prompt-preview-area" className="text-sm font-medium">Original Prompt</Label>
              <Textarea
                id="original-prompt-preview-area"
                value={originalPromptForComparison}
                readOnly
                rows={8}
                className="text-sm bg-muted/20 font-mono"
                aria-label="Original prompt for comparison"
                disabled={disabled || isLoading}
              />
            </div>
            <div className="w-full sm:w-1/2 space-y-2">
              <Label htmlFor="suggested-prompt-preview-area" className="text-sm font-medium">Preview with Suggestion</Label>
              <Textarea
                id="suggested-prompt-preview-area"
                value={previewResult.previewPrompt}
                readOnly
                rows={8}
                className="text-sm bg-muted/30 font-mono"
                aria-label="Preview of prompt with suggestion applied"
                disabled={disabled || isLoading}
              />
            </div>
          </div>
          {onApplyPreview && (
            <Button 
              onClick={() => onApplyPreview(previewResult.previewPrompt)} 
              className="mt-4 w-full sm:w-auto"
              variant="outline"
              disabled={disabled || isLoading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Apply to Editor
            </Button>
          )}
        </>
      );
    } else if (previewResult?.previewPrompt) { // Fallback if originalPromptForComparison is not available
       return (
        <>
          <Textarea
            value={previewResult.previewPrompt}
            readOnly
            rows={8}
            className="text-base bg-muted/30 font-mono"
            aria-label="Preview of prompt with suggestion applied"
            disabled={disabled || isLoading}
          />
          {onApplyPreview && (
            <Button 
              onClick={() => onApplyPreview(previewResult.previewPrompt)} 
              className="mt-4 w-full sm:w-auto"
              variant="outline"
              disabled={disabled || isLoading}
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
          {originalPromptForComparison 
            ? "Compare the original prompt with the version incorporating a single suggestion. You can apply the previewed version to the main editor."
            : "This shows how the original prompt might look with a single selected suggestion applied. You can apply this version to the main editor."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
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

