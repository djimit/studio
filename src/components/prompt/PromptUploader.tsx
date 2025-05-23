
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2, Brain, SearchCheck, Copy, Users, Image as ImageIcon } from 'lucide-react'; // Added Users icon
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Persona } from '@/lib/personas';

export type LlmType = 'general' | 'code' | 'creative' | 'image' | 'research';

interface PromptUploaderProps {
  onAnalyze: (
    prompt: string, 
    llmType?: LlmType, 
    isDeepResearch?: boolean, 
    personaInstructions?: string,
    imageDataUri?: string,
  ) => void;
  isLoading: boolean;
  initialPrompt?: string;
  initialLlmType?: LlmType;
  initialIsDeepResearch?: boolean;
  initialImageDataUri?: string;
  personas: Persona[];
  selectedPersonaId?: string;
  onSelectPersona: (personaId?: string) => void;
}

const NONE_PERSONA_VALUE = "__none__";

export function PromptUploader({ 
  onAnalyze, 
  isLoading,
  initialPrompt = '',
  initialLlmType,
  initialIsDeepResearch = false,
  initialImageDataUri = '',
  personas,
  selectedPersonaId,
  onSelectPersona,
}: PromptUploaderProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [llmType, setLlmType] = useState<LlmType | undefined>(initialLlmType);
  const [isDeepResearch, setIsDeepResearch] = useState<boolean>(initialIsDeepResearch);
  const [imageDataUri, setImageDataUri] = useState<string>(initialImageDataUri);
  const { toast } = useToast();

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    setLlmType(initialLlmType);
  }, [initialLlmType]);

  useEffect(() => {
    setIsDeepResearch(initialIsDeepResearch);
  }, [initialIsDeepResearch]);

  useEffect(() => {
    setImageDataUri(initialImageDataUri);
  }, [initialImageDataUri]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      const activePersona = personas.find(p => p.id === selectedPersonaId);
      onAnalyze(
        prompt, 
        llmType, 
        isDeepResearch, 
        activePersona?.instructions,
        imageDataUri.trim() ? imageDataUri : undefined
      );
    }
  };

  const handleCopyPrompt = async () => {
    if (!prompt) {
      toast({
        title: 'Nothing to Copy',
        description: 'Prompt is empty.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: 'Prompt Copied!',
        description: 'The current prompt has been copied to your clipboard.',
      });
    } catch (err) {
      console.error('Failed to copy prompt: ', err);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy the prompt.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6" />
          <span>Refine Your Prompt</span>
        </CardTitle>
        <CardDescription>
          Enter your prompt below. Optionally, provide context like LLM type, research depth, AI persona, or an Image Data URI for multi-modal analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Label htmlFor="main-prompt-area">Main Textual Prompt</Label>
            <Textarea
              id="main-prompt-area"
              placeholder="Enter your textual prompt here or select a template above..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="text-base pr-12 mt-1" 
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-8 right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleCopyPrompt}
              disabled={isLoading || !prompt.trim()}
              aria-label="Copy prompt"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-data-uri-area" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Image Data URI (Optional)
            </Label>
            <Textarea
              id="image-data-uri-area"
              placeholder="Paste Image Data URI here (e.g., data:image/png;base64,iVBORw0KGgo...)"
              value={imageDataUri}
              onChange={(e) => setImageDataUri(e.target.value)}
              rows={3}
              className="text-sm font-mono"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              For multi-modal analysis, provide image context as a Data URI. The AI will consider this image when refining your textual prompt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="llmTypeSelect" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                LLM Type (Optional)
              </Label>
              <Select
                value={llmType || ''} 
                onValueChange={(value) => setLlmType(value as LlmType || undefined)}
                disabled={isLoading}
                name="llmTypeSelect"
              >
                <SelectTrigger id="llmTypeSelect" className="w-full">
                  <SelectValue placeholder="Select LLM type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="code">Code Generation</SelectItem>
                  <SelectItem value="creative">Creative Writing</SelectItem>
                  <SelectItem value="image">Image Generation</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="personaSelect" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    AI Persona (Optional)
                </Label>
                <Select
                    value={selectedPersonaId || NONE_PERSONA_VALUE}
                    onValueChange={(value) => onSelectPersona(value === NONE_PERSONA_VALUE ? undefined : value)}
                    disabled={isLoading || personas.length === 0}
                    name="personaSelect"
                >
                    <SelectTrigger id="personaSelect" className="w-full">
                        <SelectValue placeholder={personas.length === 0 ? "No personas available" : "Select a persona"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={NONE_PERSONA_VALUE}>None</SelectItem>
                        {personas.map(persona => (
                            <SelectItem key={persona.id} value={persona.id}>
                                {persona.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center space-x-2 md:pt-8"> {/* Adjusted padding for alignment */}
                <Checkbox
                    id="isDeepResearchCheckbox"
                    checked={isDeepResearch}
                    onCheckedChange={(checked) => setIsDeepResearch(checked as boolean)}
                    disabled={isLoading}
                />
                <Label htmlFor="isDeepResearchCheckbox" className="flex items-center gap-2 cursor-pointer">
                     <SearchCheck className="h-4 w-4" />
                    Is this for deep research?
                </Label>
            </div>
          </div>
          <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Prompt'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

