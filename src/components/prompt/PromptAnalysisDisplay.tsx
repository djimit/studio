
'use client';

import type { AnalyzePromptOutput } from '@/ai/flows/prompt-analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lightbulb, ThumbsUp, ListChecks, FileText, Cpu, Eye, Star, Activity, HelpCircle, Loader2 as DialogLoader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';


interface PromptAnalysisDisplayProps {
  analysisResult: AnalyzePromptOutput | null;
  isLoading: boolean;
  error?: string | null;
  onPreviewSuggestion: (suggestion: string) => void;
  isPreviewingSuggestion: boolean;
  onExplainSuggestion: (suggestion: string) => void;
  isLoadingExplanation: boolean;
  suggestionExplanation: string | null;
  explanationError: string | null;
  currentSuggestionForExplanation: string | null;
  onCloseExplanationDialog: () => void;
}

export function PromptAnalysisDisplay({ 
  analysisResult, 
  isLoading, 
  error,
  onPreviewSuggestion,
  isPreviewingSuggestion,
  onExplainSuggestion,
  isLoadingExplanation,
  suggestionExplanation,
  explanationError,
  currentSuggestionForExplanation,
  onCloseExplanationDialog,
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
          <Skeleton className="h-8 w-full" />
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
  const isExplainDialogOpen = !!(currentSuggestionForExplanation && (suggestionExplanation || isLoadingExplanation || explanationError));

  return (
    <>
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
                    <div className="flex items-start flex-grow">
                      <ThumbsUp className="h-4 w-4 text-green-500 mr-3 mt-1 shrink-0" />
                      <span className="text-card-foreground/90 flex-grow">{suggestion}</span>
                    </div>
                    <div className="flex gap-2 self-start sm:self-center mt-2 sm:mt-0 shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onPreviewSuggestion(suggestion)}
                        disabled={isPreviewingSuggestion || isLoadingExplanation}
                        aria-label={`Preview suggestion: ${suggestion}`}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                       <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExplainSuggestion(suggestion)}
                        disabled={isLoadingExplanation || isPreviewingSuggestion}
                        aria-label={`Explain suggestion: ${suggestion}`}
                        className="text-primary hover:text-primary/80"
                      >
                        {isLoadingExplanation && currentSuggestionForExplanation === suggestion ? (
                          <DialogLoader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <HelpCircle className="mr-2 h-4 w-4" />
                        )}
                        Explain
                      </Button>
                    </div>
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

      <Dialog open={isExplainDialogOpen} onOpenChange={(open) => { if (!open) onCloseExplanationDialog(); }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              Explanation for Suggestion
            </DialogTitle>
            <DialogDescription>
              "{currentSuggestionForExplanation}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingExplanation && (
              <div className="flex items-center justify-center space-x-2">
                <DialogLoader className="h-6 w-6 animate-spin text-primary" />
                <span>Loading explanation...</span>
              </div>
            )}
            {explanationError && !isLoadingExplanation && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{explanationError}</AlertDescription>
              </Alert>
            )}
            {suggestionExplanation && !isLoadingExplanation && !explanationError && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{suggestionExplanation}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onCloseExplanationDialog}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
