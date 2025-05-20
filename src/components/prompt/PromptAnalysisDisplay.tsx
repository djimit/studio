
'use client';

import type { AnalyzePromptOutput } from '@/ai/flows/prompt-analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lightbulb, ThumbsUp, ListChecks, FileText, Cpu, Eye, Star, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress'; // Added for clarity score visualization

interface PromptAnalysisDisplayProps {
  analysisResult: AnalyzePromptOutput | null;
  isLoading: boolean;
  error?: string | null;
  onPreviewSuggestion: (suggestion: string) => void;
  isPreviewingSuggestion: boolean;
}

export function PromptAnalysisDisplay({ 
  analysisResult, 
  isLoading, 
  error,
  onPreviewSuggestion,
  isPreviewingSuggestion
}: PromptAnalysisDisplayProps) {
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
          <Skeleton className="h-6 w-1/2 mt-4" />
          <Skeleton className="h-8 w-full" /> {/* Skeleton for clarity score */}
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
    return null;
  }

  const clarityScorePercentage = analysisResult.promptClarityScore ? (analysisResult.promptClarityScore / 10) * 100 : 0;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6" /><span>Prompt Analysis</span></CardTitle>
        <CardDescription>Here's what our AI thinks about your prompt, its clarity, how it can be improved, and a model suggestion.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-foreground">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Evaluation
          </h3>
          <p className="text-card-foreground/90">{analysisResult.analysis}</p>
        </div>

        {analysisResult.promptClarityScore !== undefined && analysisResult.promptClarityScore !== null && (
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              Prompt Clarity Score: {analysisResult.promptClarityScore}/10
            </h3>
            <Progress value={clarityScorePercentage} className="w-full h-3 mb-1" />
            {analysisResult.clarityScoreReasoning && (
              <p className="text-sm text-muted-foreground">{analysisResult.clarityScoreReasoning}</p>
            )}
          </div>
        )}
        
        {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-foreground">
              <ListChecks className="h-5 w-5 text-primary" />
              Improvement Suggestions
            </h3>
            <ul className="list-none space-y-3 pl-0">
              {analysisResult.suggestions.map((suggestion, index) => (
                <li key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border rounded-md bg-muted/20">
                  <div className="flex items-start">
                    <ThumbsUp className="h-4 w-4 text-green-500 mr-3 mt-1 shrink-0" />
                    <span className="text-card-foreground/90">{suggestion}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onPreviewSuggestion(suggestion)}
                    disabled={isPreviewingSuggestion}
                    className="self-start sm:self-center"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
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

