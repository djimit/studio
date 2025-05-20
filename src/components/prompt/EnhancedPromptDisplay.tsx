
'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Sparkles, Loader2, RefreshCw, Copy } from 'lucide-react';
import { downloadTextFile } from '@/lib/download';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface EnhancedPromptDisplayProps {
  enhancedPrompt: string | null;
  isLoading: boolean; // Specific to generating enhanced prompt
  globalIsLoading: boolean; // True if any AI operation is in progress
  selectedFormat: 'markdown' | 'json';
  fileName?: string;
  error?: string | null;
  onGenerate: () => void;
  showGenerateButton: boolean;
  canGenerate?: boolean;
  onRefineThisPrompt?: (promptText: string) => void;
}

export function EnhancedPromptDisplay({
  enhancedPrompt,
  isLoading,
  globalIsLoading,
  selectedFormat,
  fileName = 'enhanced_prompt',
  error,
  onGenerate,
  showGenerateButton,
  canGenerate = true,
  onRefineThisPrompt,
}: EnhancedPromptDisplayProps) {
  const { toast } = useToast();

  const handleCopyEnhancedPrompt = async () => {
    if (!enhancedPrompt) {
      toast({ title: 'Nothing to Copy', description: 'Enhanced prompt is empty.', variant: 'destructive' });
      return;
    }
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      toast({ title: 'Enhanced Prompt Copied!', description: 'The enhanced prompt has been copied to your clipboard.' });
    } catch (err) {
      console.error('Failed to copy enhanced prompt: ', err);
      toast({ title: 'Copy Failed', description: 'Could not copy the enhanced prompt.', variant: 'destructive' });
    }
  };
  
  const handleDownload = () => {
    if (enhancedPrompt) {
      downloadTextFile(fileName, enhancedPrompt, selectedFormat);
    }
  };

  const handleRefine = () => {
    if (enhancedPrompt && onRefineThisPrompt) {
      onRefineThisPrompt(enhancedPrompt);
    }
  };

  const renderContent = () => {
    // This condition is for when THIS component's action is loading
    if (isLoading && !enhancedPrompt && showGenerateButton) { 
      return (
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="shadow-md">
          <AlertTitle>Generation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (enhancedPrompt) {
      return (
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={enhancedPrompt}
              readOnly
              rows={10}
              className="text-base bg-muted/30 font-mono pr-12" // Add padding for copy button
              disabled={globalIsLoading} // Disable textarea if anything is loading globally
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleCopyEnhancedPrompt}
              disabled={globalIsLoading || !enhancedPrompt}
              aria-label="Copy enhanced prompt"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload} className="sm:w-auto" disabled={globalIsLoading}>
              <Download className="mr-2 h-4 w-4" />
              Download {selectedFormat === 'markdown' ? 'Markdown' : 'JSON'}
            </Button>
            {onRefineThisPrompt && (
              <Button onClick={handleRefine} variant="outline" className="sm:w-auto" disabled={globalIsLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refine This Enhanced Prompt
              </Button>
            )}
          </div>
        </div>
      );
    }
    
    if (showGenerateButton) { 
        if (!canGenerate) {
             return <p className="text-muted-foreground">Select at least one suggestion to generate an enhanced prompt, or if no suggestions are available, click "Generate Enhanced Prompt" for a general refinement.</p>;
        }
        return <p className="text-muted-foreground">Click "Generate Enhanced Prompt" to see the result.</p>;
    }

    return null; 
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /><span>Enhanced Prompt</span></CardTitle>
        <CardDescription>
          {enhancedPrompt 
            ? "Here is the AI-generated enhanced prompt. You can download it or send it back to the editor for further refinement." 
            : showGenerateButton 
              ? "Ready to generate the enhanced prompt based on the analysis and your chosen format."
              : "Complete the analysis to generate an enhanced prompt."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showGenerateButton && (
          <Button 
            onClick={onGenerate} 
            disabled={globalIsLoading || isLoading || !canGenerate} // Disabled if its own action is loading, any global action is loading, or cannot generate
            className="w-full sm:w-auto mb-6"
          >
            {isLoading ? ( // Specific loading state for this button's action
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Enhanced Prompt'
            )}
          </Button>
        )}
        {renderContent()}
      </CardContent>
    </Card>
  );
}
