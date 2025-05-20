
'use client';

import type { AnalyzePromptOutput } from '@/ai/flows/prompt-analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Lightbulb, ThumbsUp, ListChecks, FileText, Cpu, Eye, Star, Activity, HelpCircle, Loader2 as DialogLoader, Copy, BarChart3, AlertTriangle, Sigma, Target, Edit, BadgeCheck, MessageCircleQuestion, Gauge } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';


interface PromptAnalysisDisplayProps {
  analysisResult: AnalyzePromptOutput | null;
  isLoading: boolean; // Specific to analysis loading
  error?: string | null;
  onPreviewSuggestion: (suggestion: string) => void;
  globalIsLoading: boolean; // True if any AI operation is in progress
  onExplainSuggestion: (suggestion: string) => void;
  suggestionExplanation: string | null;
  isLoadingExplanation: boolean; // Specific to explanation loading
  explanationError: string | null;
  currentSuggestionForExplanation: string | null;
  onCloseExplanationDialog: () => void;
  selectedSuggestionsForEnhancement: Record<string, boolean>;
  onToggleSuggestionForEnhancement: (suggestion: string) => void;
}

const ScoreDisplay: React.FC<{ title: string; score?: number; reasoning?: string; icon?: React.ReactNode }> = ({ title, score, reasoning, icon }) => {
  if (score === undefined || score === null) return null;
  const scorePercentage = (score / 10) * 100;
  return (
    <div className="space-y-1">
      <h4 className="text-md font-semibold flex items-center gap-2 text-foreground">
        {icon || <BarChart3 className="h-5 w-5 text-primary" />}
        {title}: <span className="text-primary">{score}/10</span>
      </h4>
      <Progress value={scorePercentage} className="w-full h-2.5 mb-1" aria-label={`${title} score: ${score} out of 10`} />
      {reasoning && <p className="text-xs text-muted-foreground">{reasoning}</p>}
    </div>
  );
};


export function PromptAnalysisDisplay({ 
  analysisResult, 
  isLoading, 
  error,
  onPreviewSuggestion,
  globalIsLoading,
  onExplainSuggestion,
  suggestionExplanation,
  isLoadingExplanation,
  explanationError,
  currentSuggestionForExplanation,
  onCloseExplanationDialog,
  selectedSuggestionsForEnhancement,
  onToggleSuggestionForEnhancement,
}: PromptAnalysisDisplayProps) {
  const { toast } = useToast();

  const handleCopyText = async (textToCopy: string | null | undefined, type: string) => {
    if (!textToCopy) {
      toast({ title: 'Nothing to Copy', description: `${type} is empty.`, variant: 'destructive' });
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({ title: `${type} Copied!`, description: `${type} copied to clipboard.` });
    } catch (err) {
      console.error(`Failed to copy ${type}: `, err);
      toast({ title: 'Copy Failed', description: `Could not copy ${type}.`, variant: 'destructive' });
    }
  };
  
  if (isLoading) { // This is for the initial analysis loading
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6" /><span>Prompt Analysis</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-1/4" /> {/* Overall Rating */}
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-3/4 mt-2" /> {/* AI Evaluation */}
          <Skeleton className="h-16 w-full" />
          
          <Skeleton className="h-6 w-1/2 mt-4" /> {/* Clarity Score */}
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-1/2 mt-2" /> {/* Specificity Score */}
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-1/2 mt-2" /> {/* Actionability Score */}
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-1/2 mt-2" /> {/* Conciseness Score */}
          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-6 w-1/2 mt-4" /> {/* Ambiguities */}
          <Skeleton className="h-12 w-full" />

          <Skeleton className="h-6 w-1/2 mt-4" /> {/* Suggestions */}
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />

          <Skeleton className="h-6 w-1/2 mt-4" /> {/* Token Count & Model */}
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

  const isExplainDialogOpen = !!(currentSuggestionForExplanation && (suggestionExplanation || isLoadingExplanation || explanationError));

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /><span>Prompt Analysis</span></CardTitle>
          <CardDescription>Here's a detailed breakdown of your prompt, including ratings, suggestions, and a model recommendation. Select suggestions to include in the enhanced prompt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {analysisResult.overallRating && (
            <div className="p-4 border rounded-md bg-card shadow">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-1 text-foreground">
                <BadgeCheck className="h-5 w-5 text-primary" />
                Overall Rating: <Badge variant="secondary" className="text-base">{analysisResult.overallRating}</Badge>
              </h3>
              {analysisResult.overallRatingReasoning && (
                <p className="text-sm text-muted-foreground">{analysisResult.overallRatingReasoning}</p>
              )}
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-foreground">
              <Lightbulb className="h-5 w-5 text-primary" />
              AI Evaluation
            </h3>
            <p className="text-card-foreground/90">{analysisResult.analysis}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <ScoreDisplay title="Clarity" score={analysisResult.promptClarityScore} reasoning={analysisResult.clarityScoreReasoning} icon={<Activity className="h-5 w-5 text-primary" />} />
            <ScoreDisplay title="Specificity" score={analysisResult.specificityScore} reasoning={analysisResult.specificityScoreReasoning} icon={<Target className="h-5 w-5 text-primary" />} />
            <ScoreDisplay title="Actionability" score={analysisResult.actionabilityScore} reasoning={analysisResult.actionabilityScoreReasoning} icon={<Gauge className="h-5 w-5 text-primary" />} />
            <ScoreDisplay title="Conciseness" score={analysisResult.concisenessScore} reasoning={analysisResult.concisenessScoreReasoning} icon={<Edit className="h-5 w-5 text-primary" />} />
          </div>

          {(analysisResult.potentialAmbiguities && analysisResult.potentialAmbiguities.length > 0) && (
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-foreground">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Potential Ambiguities
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-amber-700 dark:text-amber-400">
                {analysisResult.potentialAmbiguities.map((ambiguity, index) => (
                  <li key={index}>{ambiguity}</li>
                ))}
              </ul>
            </div>
          )}
          
          {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-foreground">
                <ListChecks className="h-5 w-5 text-primary" />
                Improvement Suggestions (Select to apply)
              </h3>
              <ul className="list-none space-y-3 pl-0">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex flex-col sm:flex-row items-start gap-2 p-3 border rounded-md bg-muted/20 hover:shadow-sm transition-shadow">
                    <div className="flex items-start flex-grow">
                       <Checkbox
                        id={`suggestion-checkbox-${index}`}
                        checked={selectedSuggestionsForEnhancement[suggestion] ?? false}
                        onCheckedChange={() => onToggleSuggestionForEnhancement(suggestion)}
                        className="mr-3 mt-1 shrink-0"
                        aria-label={`Select suggestion: ${suggestion}`}
                        disabled={globalIsLoading}
                      />
                      <Label htmlFor={`suggestion-checkbox-${index}`} className="flex-grow cursor-pointer">
                        <div className="flex items-start">
                          <ThumbsUp className="h-4 w-4 text-green-500 mr-2 mt-1 shrink-0" />
                          <span className="text-card-foreground/90 flex-grow">{suggestion}</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex gap-1.5 self-start sm:self-center mt-2 sm:mt-0 shrink-0 sm:ml-auto pl-7 sm:pl-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyText(suggestion, "Suggestion")}
                        disabled={globalIsLoading}
                        aria-label={`Copy suggestion: ${suggestion}`}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onPreviewSuggestion(suggestion)}
                        disabled={globalIsLoading || (isLoadingExplanation && currentSuggestionForExplanation === suggestion)}
                        aria-label={`Preview suggestion: ${suggestion}`}
                      >
                        { globalIsLoading && !isLoadingExplanation && !(currentSuggestionForExplanation === suggestion) ? <DialogLoader className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                        Preview
                      </Button>
                       <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExplainSuggestion(suggestion)}
                        disabled={globalIsLoading} 
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
           {(analysisResult.suggestions && analysisResult.suggestions.length === 0) && (
             <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-foreground">
                    <ListChecks className="h-5 w-5 text-primary" />
                    Improvement Suggestions
                </h3>
                <p className="text-muted-foreground">No specific improvement suggestions were identified for this prompt. It might already be quite good, or very short. You can still try generating an enhanced prompt for a general refinement.</p>
            </div>
           )}


          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysisResult.tokenCountEstimation !== undefined && analysisResult.tokenCountEstimation !== null && (
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-foreground">
                        <Sigma className="h-5 w-5 text-primary" />
                        Token Count Estimation
                    </h3>
                    <p className="text-card-foreground/90 font-medium">{analysisResult.tokenCountEstimation} tokens</p>
                    <p className="text-xs text-muted-foreground mt-1">(This is a highly approximate, general estimation and can vary significantly between LLM models.)</p>
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={isExplainDialogOpen} onOpenChange={(open) => { if (!open) onCloseExplanationDialog(); }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageCircleQuestion className="h-6 w-6 text-primary" />
                Explanation for Suggestion
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopyText(suggestionExplanation, "Explanation")}
                disabled={isLoadingExplanation || !suggestionExplanation}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Copy explanation"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              "{currentSuggestionForExplanation}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
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
              <Button type="button" variant="outline" onClick={onCloseExplanationDialog} disabled={isLoadingExplanation}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

