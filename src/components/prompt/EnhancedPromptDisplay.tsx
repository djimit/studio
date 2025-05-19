'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Sparkles, Loader2 } from 'lucide-react';
import { downloadTextFile } from '@/lib/download';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedPromptDisplayProps {
  enhancedPrompt: string | null;
  isLoading: boolean;
  selectedFormat: 'markdown' | 'json';
  fileName?: string;
  error?: string | null;
  onGenerate: () => void;
  showGenerateButton: boolean;
}

export function EnhancedPromptDisplay({
  enhancedPrompt,
  isLoading,
  selectedFormat,
  fileName = 'enhanced_prompt',
  error,
  onGenerate,
  showGenerateButton,
}: EnhancedPromptDisplayProps) {
  
  const handleDownload = () => {
    if (enhancedPrompt) {
      downloadTextFile(fileName, enhancedPrompt, selectedFormat);
    }
  };

  const renderContent = () => {
    if (isLoading && !enhancedPrompt && showGenerateButton) { // Loading after clicking generate
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
        <>
          <Textarea
            value={enhancedPrompt}
            readOnly
            rows={10}
            className="text-base bg-muted/30 font-mono"
          />
          <Button onClick={handleDownload} className="w-full sm:w-auto mt-4">
            <Download className="mr-2 h-4 w-4" />
            Download {selectedFormat === 'markdown' ? 'Markdown' : 'JSON'}
          </Button>
        </>
      );
    }
    
    if (showGenerateButton) { // If generate button is visible, but no prompt yet (and not loading from generate click)
        return <p className="text-muted-foreground">Click "Generate Enhanced Prompt" to see the result.</p>;
    }

    return null; // Initial state, before analysis is done
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /><span>Enhanced Prompt</span></CardTitle>
        <CardDescription>
          {enhancedPrompt 
            ? "Here is the AI-generated enhanced prompt. You can download it in your selected format." 
            : showGenerateButton 
              ? "Ready to generate the enhanced prompt based on the analysis and your chosen format."
              : "Complete the analysis to generate an enhanced prompt."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showGenerateButton && (
          <Button onClick={onGenerate} disabled={isLoading} className="w-full sm:w-auto mb-6">
            {isLoading ? (
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
