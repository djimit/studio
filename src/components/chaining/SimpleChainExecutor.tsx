'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Play, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface SimpleChainExecutorProps {
  onRunChain: (step1Prompt: string, step2PromptTemplate: string) => void;
  isLoading: boolean;
  step1Output: string | null;
  finalOutput: string | null;
  error: string | null;
  disabled?: boolean;
}

export function SimpleChainExecutor({
  onRunChain,
  isLoading,
  step1Output,
  finalOutput,
  error,
  disabled = false,
}: SimpleChainExecutorProps) {
  const [step1Prompt, setStep1Prompt] = React.useState<string>('');
  const [step2PromptTemplate, setStep2PromptTemplate] = React.useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step1Prompt.trim() && step2PromptTemplate.trim()) {
      onRunChain(step1Prompt, step2PromptTemplate);
    }
  };

  const uniqueIdPrefix = "chain-exec-final-attempt";

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-6 w-6 text-primary" />
          <span>Simple Two-Step Chain Executor</span>
        </CardTitle>
        <CardDescription>
          Define two prompts. The output of Step 1 will be substituted into Step 2 where {'{{'}{'step1Output'}{'}}'} is written.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`${uniqueIdPrefix}-step1-prompt`}>Step 1 Prompt</Label>
            <Textarea
              id={`${uniqueIdPrefix}-step1-prompt`}
              placeholder="e.g., Summarize the following text: [some long text]"
              value={step1Prompt}
              onChange={(e) => setStep1Prompt(e.target.value)}
              rows={4}
              className="text-base"
              disabled={isLoading || disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uniqueIdPrefix}-step2-template`}>Step 2 Prompt Template (use {'{{'}{'step1Output'}{'}}'})</Label>
            <Textarea
              id={`${uniqueIdPrefix}-step2-template`}
              placeholder="e.g., Based on the summary: {{{step1Output}}}, what are the key takeaways?"
              value={step2PromptTemplate}
              onChange={(e) => setStep2PromptTemplate(e.target.value)}
              rows={4}
              className="text-base"
              disabled={isLoading || disabled}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || disabled}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              'Run Chain'
            )}
          </Button>
        </form>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isLoading && (
          <div className="mt-4">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        )}
        {step1Output && (
          <div className="mt-4">
            <Label>Step 1 Output</Label>
            <div className="p-2 bg-muted rounded">{step1Output}</div>
          </div>
        )}
        {finalOutput && (
          <div className="mt-4">
            <Label>Final Output</Label>
            <div className="p-2 bg-muted rounded">{finalOutput}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
