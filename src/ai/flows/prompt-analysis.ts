// This is an AI-powered function that analyzes user-provided prompts and offers suggestions for improvement.
// It takes a prompt as input and returns an analysis of the prompt with improvement suggestions.
// - analyzePrompt - Analyzes the prompt and provides improvement suggestions.
// - AnalyzePromptInput - Input type for analyzePrompt.
// - AnalyzePromptOutput - Output type for analyzePrompt.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePromptInputSchema = z.object({
  prompt: z.string().describe('The prompt to be analyzed.'),
});
export type AnalyzePromptInput = z.infer<typeof AnalyzePromptInputSchema>;

const AnalyzePromptOutputSchema = z.object({
  analysis: z.string().describe('The AI analysis of the prompt.'),
  suggestions: z.array(z.string()).describe('Suggestions for improving the prompt.'),
});
export type AnalyzePromptOutput = z.infer<typeof AnalyzePromptOutputSchema>;

export async function analyzePrompt(input: AnalyzePromptInput): Promise<AnalyzePromptOutput> {
  return analyzePromptFlow(input);
}

const analyzePromptPrompt = ai.definePrompt({
  name: 'analyzePromptPrompt',
  input: {schema: AnalyzePromptInputSchema},
  output: {schema: AnalyzePromptOutputSchema},
  prompt: `You are an AI prompt analyzer. Analyze the following prompt and provide suggestions for improvement.

Prompt: {{{prompt}}}

Analysis:
Suggestions:`, // Provide an analysis of the prompt and suggestions for improvement.
});

const analyzePromptFlow = ai.defineFlow(
  {
    name: 'analyzePromptFlow',
    inputSchema: AnalyzePromptInputSchema,
    outputSchema: AnalyzePromptOutputSchema,
  },
  async input => {
    const {output} = await analyzePromptPrompt(input);
    return output!;
  }
);
