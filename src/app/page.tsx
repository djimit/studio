
'use client';

import { useState, useEffect } from 'react';
import type { AnalyzePromptOutput, AnalyzePromptInput } from '@/ai/flows/prompt-analysis';
import { analyzePrompt } from '@/ai/flows/prompt-analysis';
import { generateEnhancedPrompt } from '@/ai/flows/enhanced-prompt-generation';
import { applySingleSuggestion } from '@/ai/flows/apply-single-suggestion-flow';
import type { ApplySingleSuggestionOutput } from '@/ai/flows/apply-single-suggestion-flow';
import { explainSuggestion, type ExplainSuggestionInput, type ExplainSuggestionOutput } from '@/ai/flows/explain-suggestion-flow';
import { getHistory, addHistoryItem, clearHistory as clearHistoryStorage, type HistoryItem } from '@/lib/history';


import { AppHeader } from '@/components/layout/AppHeader';
import { PromptUploader } from '@/components/prompt/PromptUploader';
import type { LlmType } from '@/components/prompt/PromptUploader';
import { PromptAnalysisDisplay } from '@/components/prompt/PromptAnalysisDisplay';
import { SuggestionPreviewDisplay } from '@/components/prompt/SuggestionPreviewDisplay';
import { FormatSelector } from '@/components/prompt/FormatSelector';
import { EnhancedPromptDisplay } from '@/components/prompt/EnhancedPromptDisplay';
import { PromptTemplateLibrary, type PromptTemplate } from '@/components/prompt/PromptTemplateLibrary';
import { PromptHistoryDisplay } from '@/components/prompt/PromptHistoryDisplay';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const promptTemplates: PromptTemplate[] = [
  {
    title: "Code Generation: Python Function",
    description: "Generate a Python function based on a detailed description of its purpose, inputs, and outputs.",
    llmType: "code",
    prompt: "Write a Python function that takes [input parameters, e.g., 'a list of integers', 'a string'] and returns [expected output, e.g., 'the sum of the list', 'the string reversed']. The function should [specific requirements or constraints, e.g., 'handle empty lists gracefully', 'be case-insensitive', 'use a specific algorithm if necessary']."
  },
  {
    title: "Creative Writing: Short Story Idea",
    description: "Brainstorm a short story idea with a specific genre, character archetypes, and a central conflict.",
    llmType: "creative",
    prompt: "Generate a short story concept for the [genre, e.g., 'sci-fi mystery', 'fantasy romance'] genre. The story should feature a [main character archetype, e.g., 'cynical detective', 'naive hero'] who uncovers [a secret or conflict, e.g., 'a hidden conspiracy', 'a magical artifact']. The setting is [describe the setting, e.g., 'a futuristic dystopian city', 'an enchanted forest']. The desired tone is [mood/tone, e.g., 'dark and suspenseful', 'lighthearted and adventurous'], and it should explore the theme of [theme, e.g., 'the price of knowledge', 'the power of friendship']."
  },
  {
    title: "General Question: Explain a Concept",
    description: "Get a clear, concise, and easy-to-understand explanation of a complex concept, suitable for a beginner.",
    llmType: "general",
    prompt: "Explain the concept of [concept name, e.g., 'blockchain technology', 'general relativity', 'machine learning'] in simple, accessible terms. Imagine you are explaining it to someone with no prior background in the subject. Use an analogy or a real-world example to aid understanding. Avoid jargon where possible, or explain it clearly if essential."
  },
  {
    title: "Image Generation: Fantasy Landscape",
    description: "Describe a vivid scene for an AI image generator to create a fantasy landscape.",
    llmType: "image",
    prompt: "Generate an image of a breathtaking fantasy landscape. The scene should prominently feature [key elements, e.g., 'floating islands connected by ancient stone bridges', 'a colossal, bioluminescent tree at the heart of a mystical forest', 'a ruined castlehalf-submerged in a crystal-clear lake']. The artistic style should be [artistic style, e.g., 'highly detailed photorealism', 'ethereal watercolor', 'epic matte painting']. The lighting should be [lighting conditions, e.g., 'golden hour with long shadows', 'moonlit with an aurora borealis in the sky']. The dominant color palette should consist of [color palette, e.g., 'deep blues, purples, and silver', 'earthy greens and browns with vibrant red accents']."
  },
  {
    title: "Deep Research: Historical Event Analysis",
    description: "Formulate a comprehensive query for deep research on a significant historical event, seeking multifaceted analysis.",
    llmType: "research",
    isDeepResearch: true,
    prompt: "Provide an in-depth analysis of the [historical event, e.g., 'Cuban Missile Crisis', 'Renaissance period in Florence']. Your analysis should cover: \n1. Key actors and their motivations. \n2. The socio-political context leading up to the event. \n3. The immediate and long-term consequences (political, economic, social, cultural). \n4. Different historical interpretations or historiographical debates surrounding the event. \n5. The event's significance in the broader sweep of history. \nPlease cite specific examples or evidence to support your points and, where appropriate, refer to major scholarly works or primary sources."
  }
];


export default function PromptRefinerPage() {
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [originalLlmType, setOriginalLlmType] = useState<LlmType | undefined>(undefined);
  const [originalIsDeepResearch, setOriginalIsDeepResearch] = useState<boolean | undefined>(undefined);
  
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

  const [suggestionExplanation, setSuggestionExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState<boolean>(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [currentSuggestionForExplanation, setCurrentSuggestionForExplanation] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const resetSecondaryStates = () => {
    setEnhancedPrompt(null);
    setSuggestionPreview(null);
    setSuggestionPreviewError(null);
    setSuggestionExplanation(null);
    setCurrentSuggestionForExplanation(null);
    setExplanationError(null);
    setGenerationError(null);
  }

  const handleAnalyzePrompt = async (prompt: string, llmType?: LlmType, isDeepResearch?: boolean) => {
    setOriginalPrompt(prompt);
    setOriginalLlmType(llmType);
    setOriginalIsDeepResearch(isDeepResearch);

    setIsLoadingAnalysis(true);
    setAnalysisResult(null); 
    setAnalysisError(null);
    resetSecondaryStates();


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
      setHistory(addHistoryItem({ originalPrompt: prompt, originalLlmType: llmType, originalIsDeepResearch: isDeepResearch, analysisResult: result }));
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

  const handleExplainSuggestion = async (suggestion: string) => {
    if (!originalPrompt) return;

    setCurrentSuggestionForExplanation(suggestion);
    setIsLoadingExplanation(true);
    setSuggestionExplanation(null);
    setExplanationError(null);

    const input: ExplainSuggestionInput = {
      originalPrompt,
      suggestionToExplain: suggestion,
    };
    if (originalLlmType) {
      input.llmType = originalLlmType;
    }
    if (originalIsDeepResearch !== undefined) {
      input.isDeepResearch = originalIsDeepResearch;
    }

    try {
      const result = await explainSuggestion(input);
      setSuggestionExplanation(result.explanation);
      toast({
        title: "Suggestion Explained",
        description: "Successfully generated explanation.",
      });
    } catch (error) {
      console.error("Error explaining suggestion:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during explanation.";
      setExplanationError(errorMessage);
      toast({
        title: "Explanation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingExplanation(false);
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

  const handleSelectTemplate = (template: PromptTemplate) => {
    setOriginalPrompt(template.prompt);
    setOriginalLlmType(template.llmType);
    setOriginalIsDeepResearch(template.isDeepResearch);
    setAnalysisResult(null);
    setAnalysisError(null);
    resetSecondaryStates();
    toast({
      title: "Template Loaded",
      description: `"${template.title}" has been loaded into the editor.`,
    });
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setOriginalPrompt(item.originalPrompt);
    setOriginalLlmType(item.originalLlmType);
    setOriginalIsDeepResearch(item.originalIsDeepResearch);
    setAnalysisResult(item.analysisResult);
    setAnalysisError(null); // Clear any previous errors
    resetSecondaryStates();
    toast({
      title: "History Item Loaded",
      description: "Selected refinement has been loaded.",
    });
  };

  const handleClearHistory = () => {
    setHistory(clearHistoryStorage());
    toast({
      title: "History Cleared",
      description: "All refinement history has been deleted.",
    });
  };

  const anyLoading = isLoadingAnalysis || isLoadingEnhancedPrompt || isPreviewingSuggestion || isLoadingExplanation;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <PromptTemplateLibrary templates={promptTemplates} onSelectTemplate={handleSelectTemplate} />
          <Separator />
          <PromptUploader 
            onAnalyze={handleAnalyzePrompt} 
            isLoading={isLoadingAnalysis}
            initialPrompt={originalPrompt}
            initialLlmType={originalLlmType}
            initialIsDeepResearch={originalIsDeepResearch}
          />

          {(analysisResult || isLoadingAnalysis || analysisError) && (
            <PromptAnalysisDisplay 
              analysisResult={analysisResult} 
              isLoading={isLoadingAnalysis}
              error={analysisError}
              onPreviewSuggestion={handlePreviewSuggestion}
              isPreviewingSuggestion={isPreviewingSuggestion}
              onExplainSuggestion={handleExplainSuggestion}
              isLoadingExplanation={isLoadingExplanation}
              suggestionExplanation={suggestionExplanation}
              explanationError={explanationError}
              currentSuggestionForExplanation={currentSuggestionForExplanation}
              onCloseExplanationDialog={() => {
                setSuggestionExplanation(null);
                setCurrentSuggestionForExplanation(null);
                setExplanationError(null);
              }}
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
                disabled={anyLoading}
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
          <Separator />
          <PromptHistoryDisplay
            history={history}
            onLoadHistoryItem={handleLoadHistoryItem}
            onClearHistory={handleClearHistory}
            isLoading={anyLoading}
          />
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} PromptRefiner. All rights reserved.</p>
      </footer>
    </div>
  );
}
