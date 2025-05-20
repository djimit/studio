'use client';

import { useState } from 'react';
import type { AnalyzePromptOutput, AnalyzePromptInput } from '@/ai/flows/prompt-analysis';
import { analyzePrompt } from '@/ai/flows/prompt-analysis';
import { generateEnhancedPrompt } from '@/ai/flows/enhanced-prompt-generation';
import { AppHeader } from '@/components/layout/AppHeader';
import { PromptUploader } from '@/components/prompt/PromptUploader';
import type { LlmType } from '@/components/prompt/PromptUploader';
import { PromptAnalysisDisplay } from '@/components/prompt/PromptAnalysisDisplay';
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

  const { toast } = useToast();

  const handleAnalyzePrompt = async (prompt: string, llmType?: LlmType, isDeepResearch?: boolean) => {
    setOriginalPrompt(prompt);
    setIsLoadingAnalysis(true);
    setAnalysisResult(null); // Reset previous results
    setEnhancedPrompt(null);
    setAnalysisError(null);
    setGenerationError(null);

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

  const handleGenerateEnhancedPrompt = async () => {
    if (!originalPrompt || !analysisResult) return;

    setIsLoadingEnhancedPrompt(true);
    setEnhancedPrompt(null); // Reset previous result
    setGenerationError(null);

    try {
      const result = await generateEnhancedPrompt({
        originalPrompt,
        suggestions: analysisResult.suggestions.join('\n- '), // Join suggestions into a single string
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
            />
          )}

          {analysisResult && !analysisError && (
            <>
              <Separator />
              <FormatSelector
                selectedFormat={selectedFormat}
                onFormatChange={setSelectedFormat}
                disabled={isLoadingEnhancedPrompt}
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
