
'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-6 w-6 text-primary" />
          <span>Simple Two-Step Chain Executor</span>
        </CardTitle>
        <CardDescription>
          Define two prompts. The output of Step 1 will be substituted into Step 2 where `{{{step1Output}}}` is written.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="step1-prompt-chain-executor-final-final-check-v2">Step 1 Prompt</Label>
            <Textarea
              id="step1-prompt-chain-executor-final-final-check-v2"
              placeholder="e.g., Summarize the following text: [some long text]"
              value={step1Prompt}
              onChange={(e) => setStep1Prompt(e.target.value)}
              rows={4}
              className="text-base"
              disabled={isLoading || disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="step2-prompt-template-chain-executor-final-final-check-v2">Step 2 Prompt Template (use `{{{step1Output}}}`)</Label>
            <Textarea
              id="step2-prompt-template-chain-executor-final-final-check-v2"
              placeholder="e.g., Based on the summary: {{{step1Output}}}, what are the key takeaways?"
              value={step2PromptTemplate}
              onChange={(e) => setStep2PromptTemplate(e.target.value)}
              rows={4}
              className="text-base"
              disabled={isLoading || disabled}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || disabled || !step1Prompt.trim() || !step2PromptTemplate.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Chain...
              </>
            ) : (
              'Run Chain'
            )}
          </Button>
        </form>

        {(isLoading && !step1Output && !finalOutput && !error) && (
          <div className="mt-6 space-y-4">
            <div>
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        )}

        {error && !isLoading &&(
          <Alert variant="destructive" className="mt-6 shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Chain Execution Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step1Output !== null && !error && (
          <div className="mt-6 space-y-2">
            <Label htmlFor="step1-output-chain-executor-final-final-check-v2" className="text-md font-semibold">Step 1 Output:</Label>
            <Textarea
              id="step1-output-chain-executor-final-final-check-v2"
              value={step1Output}
              readOnly
              rows={5}
              className="text-sm bg-muted/30 font-mono"
              disabled={isLoading || disabled}
            />
          </div>
        )}

        {finalOutput !== null && !error &&(
          <div className="mt-4 space-y-2">
            <Label htmlFor="final-output-chain-executor-final-final-check-v2" className="text-md font-semibold">Final Output (from Step 2):</Label>
            <Textarea
              id="final-output-chain-executor-final-final-check-v2"
              value={finalOutput}
              readOnly
              rows={8}
              className="text-sm bg-muted/40 font-mono"
              disabled={isLoading || disabled}
            />
          </div>
        )}
      </CardContent>
       { (step1Output !== null || finalOutput !== null || error) &&
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Note: This is a basic chain executor. Outputs are directly from the model.
            </p>
        </CardFooter>
       }
    </Card>
  );
}
