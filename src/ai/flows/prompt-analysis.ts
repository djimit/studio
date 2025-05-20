// This is an AI-powered function that analyzes user-provided prompts and offers suggestions for improvement.
// It takes a prompt, LLM type, and research depth as input and returns an analysis with tailored suggestions.
// - analyzePrompt - Analyzes the prompt and provides improvement suggestions.
// - AnalyzePromptInput - Input type for analyzePrompt.
// - AnalyzePromptOutput - Output type for analyzePrompt.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePromptInputSchema = z.object({
  prompt: z.string().describe('The prompt to be analyzed.'),
  llmType: z.enum(['general', 'code', 'creative', 'image', 'research']).describe('The type of LLM the prompt is intended for (e.g., general text, code generation, creative writing, image generation, research).').optional(),
  isDeepResearch: z.boolean().describe('Whether the prompt is intended for deep research.').optional(),
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
Consider the context provided:
{{#if llmType}}
- LLM Type: {{{llmType}}} (Tailor suggestions if the prompt is for code generation, creative writing, image generation, specific research, or general purpose.)
{{/if}}
{{#if isDeepResearch}}
- Deep Research: Yes (The user intends to use this prompt for in-depth research. Suggestions should help in formulating queries that yield comprehensive and detailed results. Focus on specificity, asking for sources, or breaking down complex topics.)
{{else}}
- Deep Research: No
{{/if}}

Prompt: {{{prompt}}}

Analysis:
Suggestions: (Provide an analysis of the prompt and specific, actionable suggestions for improvement based on the prompt itself and the provided context like LLM type and research depth.)`,
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
