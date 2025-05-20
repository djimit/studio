'use client';

import type * as React from 'react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2, Brain, SearchCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export type LlmType = 'general' | 'code' | 'creative' | 'image' | 'research';

interface PromptUploaderProps {
  onAnalyze: (prompt: string, llmType?: LlmType, isDeepResearch?: boolean) => void;
  isLoading: boolean;
}

export function PromptUploader({ onAnalyze, isLoading }: PromptUploaderProps) {
  const [prompt, setPrompt] = useState('');
  const [llmType, setLlmType] = useState<LlmType | undefined>(undefined);
  const [isDeepResearch, setIsDeepResearch] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onAnalyze(prompt, llmType, isDeepResearch);
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
          Enter your prompt below. Provide additional context for more tailored suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="text-base"
            disabled={isLoading}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="llmType" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                LLM Type (Optional)
              </Label>
              <Select
                value={llmType}
                onValueChange={(value) => setLlmType(value as LlmType)}
                disabled={isLoading}
              >
                <SelectTrigger id="llmType" className="w-full">
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
            <div className="space-y-2 md:pt-8">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isDeepResearch"
                        checked={isDeepResearch}
                        onCheckedChange={(checked) => setIsDeepResearch(checked as boolean)}
                        disabled={isLoading}
                    />
                    <Label htmlFor="isDeepResearch" className="flex items-center gap-2 cursor-pointer">
                         <SearchCheck className="h-4 w-4" />
                        Is this for deep research?
                    </Label>
                </div>
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
