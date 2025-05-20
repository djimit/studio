
'use client';

import { useState, useEffect } from 'react';
import type { AnalyzePromptOutput, AnalyzePromptInput } from '@/ai/flows/prompt-analysis';
import { analyzePrompt } from '@/ai/flows/prompt-analysis';
import { generateEnhancedPrompt, type EnhancedPromptGenerationInput } from '@/ai/flows/enhanced-prompt-generation';
import { applySingleSuggestion, type ApplySingleSuggestionInput } from '@/ai/flows/apply-single-suggestion-flow';
import type { ApplySingleSuggestionOutput } from '@/ai/flows/apply-single-suggestion-flow';
import { explainSuggestion, type ExplainSuggestionInput, type ExplainSuggestionOutput } from '@/ai/flows/explain-suggestion-flow';
import { getHistory, addHistoryItem, clearHistory as clearHistoryStorage, type HistoryItem } from '@/lib/history';
import type { Persona } from '@/lib/personas';
import { getPersonas, addPersona as addPersonaStorage, deletePersona as deletePersonaStorage } from '@/lib/personas';
import type { PersonaFormData } from '@/components/persona/CreatePersonaDialog';


import { AppHeader } from '@/components/layout/AppHeader';
import { PromptUploader } from '@/components/prompt/PromptUploader';
import type { LlmType } from '@/components/prompt/PromptUploader';
import { PromptAnalysisDisplay } from '@/components/prompt/PromptAnalysisDisplay';
import { SuggestionPreviewDisplay } from '@/components/prompt/SuggestionPreviewDisplay';
import { FormatSelector } from '@/components/prompt/FormatSelector';
import { EnhancedPromptDisplay } from '@/components/prompt/EnhancedPromptDisplay';
import { PromptTemplateLibrary, type PromptTemplate } from '@/components/prompt/PromptTemplateLibrary';
import { PromptHistoryDisplay } from '@/components/prompt/PromptHistoryDisplay';
import { PersonaManager } from '@/components/persona/PersonaManager';
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
  },
  {
    title: "Marketing: Ad Copy Brainstorm",
    description: "Generate several ad copy options for a new product targeting a specific audience.",
    llmType: "creative",
    prompt: "Brainstorm 3-5 variations of ad copy for a new [product type, e.g., 'eco-friendly water bottle', 'AI-powered scheduling app']. The target audience is [describe target audience, e.g., 'environmentally conscious millennials', 'busy professionals']. The key selling points are [list 2-3 key benefits, e.g., 'reduces plastic waste, keeps water cold for 24 hours', 'saves time, integrates with all calendars']. The tone should be [desired tone, e.g., 'playful and engaging', 'professional and efficient']. Include a call to action."
  },
  {
    title: "Technical: API Endpoint Design",
    description: "Outline the design for a REST API endpoint, including request/response structure.",
    llmType: "code",
    prompt: "Design a REST API endpoint for [specific action, e.g., 'creating a new user profile', 'fetching product details by ID']. Specify:\n1. HTTP Method (e.g., POST, GET)\n2. Endpoint URL (e.g., /users, /products/{id})\n3. Request Body (JSON structure, if applicable, including field names and example data types)\n4. Success Response (Status code, JSON structure, including field names and example data types)\n5. Potential Error Responses (Status codes and example error messages for common failure scenarios like 'not found' or 'invalid input')."
  },
  {
    title: "Image Generation: Abstract Concept",
    description: "Visualize an abstract concept or emotion as an image.",
    llmType: "image",
    prompt: "Generate an image that visually represents the concept of '[abstract concept/emotion, e.g., 'serenity', 'the flow of time', 'digital chaos']'. The artistic style should be [artistic style, e.g., 'surrealism', 'minimalist vector art', 'impressionistic oil painting']. Key visual elements to consider are [suggest elements, e.g., 'soft, diffused light and calm water for serenity', 'intertwining clock hands and flowing sand for flow of time', 'glitching pixels and fragmented data streams for digital chaos']. The color palette should evoke [mood/feeling, e.g., 'calm blues and greens', 'dynamic oranges and reds', 'monochromatic with stark contrasts']."
  },
  {
    title: "Research: Scientific Literature Review Query",
    description: "Formulate a detailed query for a preliminary literature review on a scientific topic.",
    llmType: "research",
    isDeepResearch: true,
    prompt: "Generate a search query strategy and key terms for a preliminary literature review on the topic: '[Specific scientific topic, e.g., 'the impact of microplastics on marine ecosystems', 'CRISPR-Cas9 applications in genetic disease treatment']'. \nInclude:\n1. A concise statement of the research question or area of interest.\n2. A list of primary keywords and their synonyms/related terms.\n3. Suggested boolean operators (AND, OR, NOT) to combine terms for effective searching.\n4. Potential databases or academic search engines relevant to this field (e.g., PubMed, Scopus, Web of Science).\n5. Any exclusion criteria (e.g., articles published before a certain year, non-peer-reviewed sources)."
  }
];

// Helper function to extract a more detailed error message
const getDetailedErrorMessage = (error: unknown, context: string): string => {
  console.error(`Error during ${context}:`, error); 

  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return `An unknown error occurred during ${context}.`;
};


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
  const [promptForPreviewComparison, setPromptForPreviewComparison] = useState<string | null>(null);


  const [suggestionExplanation, setSuggestionExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState<boolean>(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [currentSuggestionForExplanation, setCurrentSuggestionForExplanation] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedSuggestionsForEnhancement, setSelectedSuggestionsForEnhancement] = useState<Record<string, boolean>>({});

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | undefined>(undefined);

  const { toast } = useToast();

  useEffect(() => {
    setHistory(getHistory());
    setPersonas(getPersonas());
  }, []);

  const resetSecondaryStates = () => {
    setAnalysisResult(null); 
    setAnalysisError(null); 
    setEnhancedPrompt(null);
    setGenerationError(null);
    setSuggestionPreview(null);
    setSuggestionPreviewError(null);
    setPromptForPreviewComparison(null);
    setSuggestionExplanation(null);
    setCurrentSuggestionForExplanation(null);
    setExplanationError(null);
    setSelectedSuggestionsForEnhancement({});
    // Note: selectedPersonaId is NOT reset here, user's persona choice should persist
  }

  const handleAnalyzePrompt = async (prompt: string, llmType?: LlmType, isDeepResearch?: boolean, personaInstructions?: string) => {
    setOriginalPrompt(prompt); 
    setOriginalLlmType(llmType);
    setOriginalIsDeepResearch(isDeepResearch);
    // selectedPersonaId is already managed by its own handler

    setIsLoadingAnalysis(true);
    resetSecondaryStates(); 


    const analysisInput: AnalyzePromptInput = { prompt };
    if (llmType) {
      analysisInput.llmType = llmType;
    }
    if (isDeepResearch !== undefined) {
      analysisInput.isDeepResearch = isDeepResearch;
    }
    if (personaInstructions) {
      analysisInput.personaInstructions = personaInstructions;
    }

    try {
      const result = await analyzePrompt(analysisInput);
      setAnalysisResult(result);
      if (result && result.suggestions) {
        const initialSelectedSuggestions: Record<string, boolean> = {};
        result.suggestions.forEach(s => initialSelectedSuggestions[s] = true); 
        setSelectedSuggestionsForEnhancement(initialSelectedSuggestions);
      }
      // Add to history with current persona context
      const activePersona = personas.find(p => p.id === selectedPersonaId);
      setHistory(addHistoryItem({ 
        originalPrompt: prompt, 
        originalLlmType: llmType, 
        originalIsDeepResearch: isDeepResearch, 
        // Consider storing selectedPersonaId or personaName in history if needed for display
        analysisResult: result 
      }));
      toast({
        title: "Analysis Complete",
        description: "Prompt analysis finished successfully.",
      });
    } catch (error) {
      const errorMessage = getDetailedErrorMessage(error, "prompt analysis");
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
    
    const currentOriginalPrompt = originalPrompt; 
    setIsPreviewingSuggestion(true);
    setSuggestionPreview(null);
    setSuggestionPreviewError(null);
    setPromptForPreviewComparison(null);

    const activePersona = personas.find(p => p.id === selectedPersonaId);
    const applyInput: ApplySingleSuggestionInput = {
      originalPrompt: currentOriginalPrompt,
      suggestionToApply: suggestion,
    };
    if (activePersona?.instructions) {
      applyInput.personaInstructions = activePersona.instructions;
    }

    try {
      const result = await applySingleSuggestion(applyInput);
      setSuggestionPreview(result);
      setPromptForPreviewComparison(currentOriginalPrompt); 
      toast({
        title: "Suggestion Previewed",
        description: "Successfully generated a preview for the suggestion.",
      });
    } catch (error) {
      const errorMessage = getDetailedErrorMessage(error, "suggestion preview");
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

  const handleApplyPreviewToEditor = (previewText: string) => {
    setOriginalPrompt(previewText);
    resetSecondaryStates(); 
    toast({
      title: "Preview Applied",
      description: "The previewed prompt has been loaded into the editor.",
    });
  };

  const handleExplainSuggestion = async (suggestion: string) => {
    if (!originalPrompt) return;

    setCurrentSuggestionForExplanation(suggestion);
    setIsLoadingExplanation(true);
    setSuggestionExplanation(null);
    setExplanationError(null);

    const activePersona = personas.find(p => p.id === selectedPersonaId);
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
    if (activePersona?.instructions) {
      input.personaInstructions = activePersona.instructions;
    }
    
    try {
      const result = await explainSuggestion(input);
      setSuggestionExplanation(result.explanation);
      toast({
        title: "Suggestion Explained",
        description: "Successfully generated explanation.",
      });
    } catch (error) {
      const errorMessage = getDetailedErrorMessage(error, "suggestion explanation");
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

    const activeSuggestions = analysisResult.suggestions.filter(
      (suggestion) => selectedSuggestionsForEnhancement[suggestion]
    );
    
    const activePersona = personas.find(p => p.id === selectedPersonaId);
    const generationInput: EnhancedPromptGenerationInput = {
      originalPrompt,
      suggestions: activeSuggestions,
      format: selectedFormat,
    };
    if (activePersona?.instructions) {
      generationInput.personaInstructions = activePersona.instructions;
    }

    try {
      const result = await generateEnhancedPrompt(generationInput);
      setEnhancedPrompt(result.enhancedPrompt);
      toast({
        title: "Enhanced Prompt Generated",
        description: `Prompt generated in ${selectedFormat} format.`,
      });
    } catch (error) {
      const errorMessage = getDetailedErrorMessage(error, "enhanced prompt generation");
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
    // Consider if selecting a template should clear the selected persona or not. For now, it persists.
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
    // Note: Persona selection from history item is not implemented yet. Current persona selection persists.
    
    resetSecondaryStates(); 
    
    setAnalysisResult(item.analysisResult); 
    if (item.analysisResult && item.analysisResult.suggestions) {
      const initialSelected: Record<string, boolean> = {};
      item.analysisResult.suggestions.forEach(s => initialSelected[s] = true);
      setSelectedSuggestionsForEnhancement(initialSelected);
    } else {
      setSelectedSuggestionsForEnhancement({});
    }

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

  const handleToggleSuggestionForEnhancement = (suggestion: string) => {
    setSelectedSuggestionsForEnhancement(prev => ({
      ...prev,
      [suggestion]: !prev[suggestion],
    }));
  };

  const handleRefineFurther = (promptToRefine: string) => {
    setOriginalPrompt(promptToRefine);
    resetSecondaryStates();
    toast({
      title: "Prompt Loaded for Re-analysis",
      description: "The enhanced prompt has been loaded into the editor for further refinement.",
    });
  };

  const handlePersonasChanged = (updatedPersonas: Persona[]) => {
    setPersonas(updatedPersonas);
    // If the currently selected persona was deleted, reset selection
    if (selectedPersonaId && !updatedPersonas.find(p => p.id === selectedPersonaId)) {
      setSelectedPersonaId(undefined);
    }
  };

  const handleSelectPersona = (personaId?: string) => {
    setSelectedPersonaId(personaId);
    // Optionally, re-analyze if a prompt is already present when persona changes. For now, user needs to click Analyze.
    // resetSecondaryStates(); // Or just reset analysisResult
  };


  const anyLoading = isLoadingAnalysis || isLoadingEnhancedPrompt || isPreviewingSuggestion || isLoadingExplanation;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <PromptTemplateLibrary 
            templates={promptTemplates} 
            onSelectTemplate={handleSelectTemplate} 
            disabled={anyLoading}
          />
          <Separator />
          <PersonaManager 
            personas={personas}
            onPersonasChange={handlePersonasChanged}
            disabled={anyLoading}
          />
          <Separator />
          <PromptUploader 
            onAnalyze={handleAnalyzePrompt} 
            isLoading={isLoadingAnalysis}
            initialPrompt={originalPrompt}
            initialLlmType={originalLlmType}
            initialIsDeepResearch={originalIsDeepResearch}
            personas={personas}
            selectedPersonaId={selectedPersonaId}
            onSelectPersona={handleSelectPersona}
          />

          {(analysisResult || isLoadingAnalysis || analysisError) && (
            <PromptAnalysisDisplay 
              analysisResult={analysisResult} 
              isLoading={isLoadingAnalysis}
              error={analysisError}
              onPreviewSuggestion={handlePreviewSuggestion}
              globalIsLoading={anyLoading} 
              onExplainSuggestion={handleExplainSuggestion}
              suggestionExplanation={suggestionExplanation}
              isLoadingExplanation={isLoadingExplanation}
              explanationError={explanationError}
              currentSuggestionForExplanation={currentSuggestionForExplanation}
              onCloseExplanationDialog={() => {
                setSuggestionExplanation(null);
                setCurrentSuggestionForExplanation(null);
                setExplanationError(null);
              }}
              selectedSuggestionsForEnhancement={selectedSuggestionsForEnhancement}
              onToggleSuggestionForEnhancement={handleToggleSuggestionForEnhancement}
            />
          )}

          {(suggestionPreview || isPreviewingSuggestion || suggestionPreviewError || promptForPreviewComparison) && (
             <SuggestionPreviewDisplay
                previewResult={suggestionPreview}
                isLoading={isPreviewingSuggestion}
                error={suggestionPreviewError}
                onApplyPreview={handleApplyPreviewToEditor}
                disabled={anyLoading}
                originalPromptForComparison={promptForPreviewComparison}
              />
          )}


          {analysisResult && !analysisError && (
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
                globalIsLoading={anyLoading} 
                selectedFormat={selectedFormat}
                fileName="refined_prompt"
                error={generationError}
                onGenerate={handleGenerateEnhancedPrompt}
                showGenerateButton={!!analysisResult && !analysisError}
                canGenerate={Object.values(selectedSuggestionsForEnhancement).some(Boolean) || (analysisResult?.suggestions?.length === 0)}
                onRefineThisPrompt={handleRefineFurther}
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
