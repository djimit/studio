
'use client';

import { useState } from 'react';
import type { AnalyzePromptOutput, AnalyzePromptInput } from '@/ai/flows/prompt-analysis';
import { analyzePrompt } from '@/ai/flows/prompt-analysis';
import { generateEnhancedPrompt } from '@/ai/flows/enhanced-prompt-generation';
import { applySingleSuggestion } from '@/ai/flows/apply-single-suggestion-flow';
import type { ApplySingleSuggestionOutput } from '@/ai/flows/apply-single-suggestion-flow';

import { AppHeader } from '@/components/layout/AppHeader';
import { PromptUploader } from '@/components/prompt/PromptUploader';
import type { LlmType } from '@/components/prompt/PromptUploader';
import { PromptAnalysisDisplay } from '@/components/prompt/PromptAnalysisDisplay';
import { SuggestionPreviewDisplay } from '@/components/prompt/SuggestionPreviewDisplay';
import { FormatSelector } from '@/components/prompt/FormatSelector';
import { EnhancedPromptDisplay } from '@/components/prompt/EnhancedPromptDisplay';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function PromptRefinerPage() {
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzePromptOutput | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'json'>('markdown');
  
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isLoadingEnhancedPrompt, setIsLoadingEnhancedPrompt] = useState<boolean>(false);
  
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [isPreviewingSuggestion, setIsPreviewingSuggestion] = useState<boolean>(false);
  const [suggestionPreview, setSuggestionPreview] = useState<ApplySingleSuggestionOutput | null>(null);
  const [suggestionPreviewError, setSuggestionPreviewError] = useState<string | null>(null);


  const { toast } = useToast();

  const handleAnalyzePrompt = async (prompt: string, llmType?: LlmType, isDeepResearch?: boolean) => {
    setOriginalPrompt(prompt);
    setIsLoadingAnalysis(true);
    setAnalysisResult(null); 
    setEnhancedPrompt(null);
    setSuggestionPreview(null);
    setAnalysisError(null);
    setGenerationError(null);
    setSuggestionPreviewError(null);

    const analysisInput: AnalyzePromptInput = { prompt };
    if (llmType) {
      analysisInput.llmType = llmType;
    }
    if (isDeepResearch !== undefined) {
      analysisInput.isDeepResearch = isDeepResearch;
    }

    try {
      const result = await analyzePrompt(analysisInput);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Prompt analysis finished successfully.",
      });
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
      setAnalysisError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handlePreviewSuggestion = async (suggestion: string) => {
    if (!originalPrompt) return;
    
    setIsPreviewingSuggestion(true);
    setSuggestionPreview(null);
    setSuggestionPreviewError(null);

    try {
      const result = await applySingleSuggestion({
        originalPrompt,
        suggestionToApply: suggestion,
      });
      setSuggestionPreview(result);
      toast({
        title: "Suggestion Previewed",
        description: "Successfully generated a preview for the suggestion.",
      });
    } catch (error) {
      console.error("Error previewing suggestion:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during preview.";
      setSuggestionPreviewError(errorMessage);
      toast({
        title: "Preview Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPreviewingSuggestion(false);
    }
  };


  const handleGenerateEnhancedPrompt = async () => {
    if (!originalPrompt || !analysisResult || !analysisResult.suggestions) return;

    setIsLoadingEnhancedPrompt(true);
    setEnhancedPrompt(null); 
    setGenerationError(null);

    try {
      const result = await generateEnhancedPrompt({
        originalPrompt,
        suggestions: analysisResult.suggestions.join('\n- '), 
        format: selectedFormat,
      });
      setEnhancedPrompt(result.enhancedPrompt);
      toast({
        title: "Enhanced Prompt Generated",
        description: `Prompt generated in ${selectedFormat} format.`,
      });
    } catch (error) {
      console.error("Error generating enhanced prompt:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during generation.";
      setGenerationError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingEnhancedPrompt(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-8">
          <PromptUploader onAnalyze={handleAnalyzePrompt} isLoading={isLoadingAnalysis} />

          {(analysisResult || isLoadingAnalysis || analysisError) && (
            <PromptAnalysisDisplay 
              analysisResult={analysisResult} 
              isLoading={isLoadingAnalysis}
              error={analysisError}
              onPreviewSuggestion={handlePreviewSuggestion}
              isPreviewingSuggestion={isPreviewingSuggestion}
            />
          )}

          {(suggestionPreview || isPreviewingSuggestion || suggestionPreviewError) && (
             <SuggestionPreviewDisplay
                previewResult={suggestionPreview}
                isLoading={isPreviewingSuggestion}
                error={suggestionPreviewError}
              />
          )}


          {analysisResult && !analysisError && analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
            <>
              <Separator />
              <FormatSelector
                selectedFormat={selectedFormat}
                onFormatChange={setSelectedFormat}
                disabled={isLoadingEnhancedPrompt || isPreviewingSuggestion}
              />
              <Separator />
              <EnhancedPromptDisplay
                enhancedPrompt={enhancedPrompt}
                isLoading={isLoadingEnhancedPrompt}
                selectedFormat={selectedFormat}
                fileName="refined_prompt"
                error={generationError}
                onGenerate={handleGenerateEnhancedPrompt}
                showGenerateButton={!!analysisResult && !analysisError}
              />
            </>
          )}
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} PromptRefiner. All rights reserved.</p>
      </footer>
    </div>
  );
}
