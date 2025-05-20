
'use server';
/**
 * @fileOverview An AI flow to explain a specific suggestion for a prompt.
 *
 * - explainSuggestion - A function that provides an explanation for a given suggestion.
 * - ExplainSuggestionInput - The input type for the explainSuggestion function.
 * - ExplainSuggestionOutput - The return type for the explainSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainSuggestionInputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt text.'),
  suggestionToExplain: z.string().describe('The specific suggestion to explain.'),
  llmType: z.enum(['general', 'code', 'creative', 'image', 'research']).optional().describe('The type of LLM the prompt is intended for.'),
  isDeepResearch: z.boolean().optional().describe('Whether the prompt is intended for deep research.'),
  personaInstructions: z.string().optional().describe('Specific instructions defining an AI persona. If provided, the explanation should align with this persona.'),
});
export type ExplainSuggestionInput = z.infer<
  typeof ExplainSuggestionInputSchema
>;

const ExplainSuggestionOutputSchema = z.object({
  explanation: z.string().describe('The detailed explanation of why the suggestion is helpful.'),
});
export type ExplainSuggestionOutput = z.infer<
  typeof ExplainSuggestionOutputSchema
>;

export async function explainSuggestion(
  input: ExplainSuggestionInput
): Promise<ExplainSuggestionOutput> {
  return explainSuggestionFlow(input);
}

const explainSuggestionPrompt = ai.definePrompt({
  name: 'explainSuggestionPrompt',
  input: {schema: ExplainSuggestionInputSchema},
  output: {schema: ExplainSuggestionOutputSchema},
  prompt: `You are an AI assistant that helps users understand prompt engineering principles.
Given the original prompt and a specific suggestion, provide a detailed explanation of *why* this suggestion is beneficial and how it improves the original prompt.
Consider the following context if provided:
{{#if llmType}}
- LLM Type context: This prompt is intended for a '{{{llmType}}}' LLM.
{{/if}}
{{#if isDeepResearch}}
- Deep Research context: The user intends this for deep research.
{{/if}}
{{#if personaInstructions}}

Active AI Persona Instructions (Your explanation should align with and consider these instructions):
---
{{personaInstructions}}
---
{{/if}}

Original Prompt:
{{{originalPrompt}}}

Suggestion to Explain:
{{{suggestionToExplain}}}

Provide a clear, concise, and educational explanation. Focus on the underlying prompt engineering principle if applicable.
For example, if the suggestion is "Add more specific details about the desired output format," explain that LLMs perform better with explicit instructions.
If the suggestion is "Clarify ambiguous terms," explain how ambiguity can lead to off-target responses.
Output ONLY the explanation.
`,
});

const explainSuggestionFlow = ai.defineFlow(
  {
    name: 'explainSuggestionFlow',
    inputSchema: ExplainSuggestionInputSchema,
    outputSchema: ExplainSuggestionOutputSchema,
  },
  async input => {
    const {output} = await explainSuggestionPrompt(input);
    return output!;
  }
);
