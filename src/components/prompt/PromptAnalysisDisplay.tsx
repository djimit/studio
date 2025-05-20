
'use client';

import type { AnalyzePromptOutput } from '@/ai/flows/prompt-analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, ThumbsUp, ListChecks, FileText, Cpu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PromptAnalysisDisplayProps {
  analysisResult: AnalyzePromptOutput | null;
  isLoading: boolean;
  error?: string | null;
}

export function PromptAnalysisDisplay({ analysisResult, isLoading, error }: PromptAnalysisDisplayProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6" /><span>Prompt Analysis</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-6 w-1/2 mt-4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-1/2 mt-4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="shadow-md">
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysisResult) {
    return null; // Don't show anything if there's no result and not loading (e.g., initial state)
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6" /><span>Prompt Analysis</span></CardTitle>
        <CardDescription>Here's what our AI thinks about your prompt and how it can be improved, including a model suggestion.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-foreground">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Evaluation
          </h3>
          <p className="text-card-foreground/90">{analysisResult.analysis}</p>
        </div>
        
        {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-foreground">
              <ListChecks className="h-5 w-5 text-primary" />
              Improvement Suggestions
            </h3>
            <ul className="list-disc list-inside space-y-2 pl-2 text-card-foreground/90">
              {analysisResult.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <ThumbsUp className="h-4 w-4 text-green-500 mr-2 mt-1 shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysisResult.suggestedModel && analysisResult.modelSuggestionReasoning && (
           <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-foreground">
              <Cpu className="h-5 w-5 text-primary" />
              Suggested Model
            </h3>
            <p className="text-card-foreground/90 font-medium">{analysisResult.suggestedModel}</p>
            <p className="text-sm text-muted-foreground mt-1">{analysisResult.modelSuggestionReasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

