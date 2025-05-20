
'use server';
/**
 * @fileOverview An AI flow to apply a single suggestion to an original prompt.
 *
 * - applySingleSuggestion - A function that applies one suggestion to a prompt.
 * - ApplySingleSuggestionInput - The input type for the applySingleSuggestion function.
 * - ApplySingleSuggestionOutput - The return type for the applySingleSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApplySingleSuggestionInputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt text.'),
  suggestionToApply: z.string().describe('The specific suggestion to apply to the original prompt.'),
});
export type ApplySingleSuggestionInput = z.infer<
  typeof ApplySingleSuggestionInputSchema
>;

const ApplySingleSuggestionOutputSchema = z.object({
  previewPrompt: z.string().describe('The original prompt with the single suggestion applied.'),
});
export type ApplySingleSuggestionOutput = z.infer<
  typeof ApplySingleSuggestionOutputSchema
>;

export async function applySingleSuggestion(
  input: ApplySingleSuggestionInput
): Promise<ApplySingleSuggestionOutput> {
  return applySingleSuggestionFlow(input);
}

const applySuggestionPrompt = ai.definePrompt({
  name: 'applySingleSuggestionPrompt',
  input: {schema: ApplySingleSuggestionInputSchema},
  output: {schema: ApplySingleSuggestionOutputSchema},
  prompt: `You are an AI assistant that helps refine prompts.
Given the following original prompt and a specific suggestion, rewrite the original prompt to incorporate ONLY that one suggestion.
Focus on subtly integrating the suggestion while preserving the core intent of the original prompt.

Original Prompt:
{{{originalPrompt}}}

Suggestion to Apply:
{{{suggestionToApply}}}

Output the rewritten prompt incorporating the suggestion.
`,
});

const applySingleSuggestionFlow = ai.defineFlow(
  {
    name: 'applySingleSuggestionFlow',
    inputSchema: ApplySingleSuggestionInputSchema,
    outputSchema: ApplySingleSuggestionOutputSchema,
  },
  async input => {
    const {output} = await applySuggestionPrompt(input);
    return output!;
  }
);
