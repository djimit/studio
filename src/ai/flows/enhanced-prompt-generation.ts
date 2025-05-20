
// This file holds the Genkit flow for generating an enhanced prompt based on suggestions, allowing users to download it in markdown or JSON format.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancedPromptGenerationInputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt uploaded by the user.'),
  suggestions: z.array(z.string()).describe('A list of AI suggestions selected by the user to improve the prompt.'),
  format: z.enum(['markdown', 'json']).describe('The desired output format (markdown or json).'),
});
export type EnhancedPromptGenerationInput = z.infer<
  typeof EnhancedPromptGenerationInputSchema
>;

const EnhancedPromptGenerationOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The enhanced prompt in the selected format.'),
});
export type EnhancedPromptGenerationOutput = z.infer<
  typeof EnhancedPromptGenerationOutputSchema
>;

export async function generateEnhancedPrompt(
  input: EnhancedPromptGenerationInput
): Promise<EnhancedPromptGenerationOutput> {
  return enhancedPromptGenerationFlow(input);
}

const enhancedPromptGenerationPrompt = ai.definePrompt({
  name: 'enhancedPromptGenerationPrompt',
  input: {schema: EnhancedPromptGenerationInputSchema},
  output: {schema: EnhancedPromptGenerationOutputSchema},
  prompt: `You are an AI prompt enhancer.
Take the original prompt and incorporate the following selected suggestions to create the best possible new prompt.
If no specific suggestions are provided, refine the original prompt based on its general quality, clarity, and completeness.

Original Prompt:
{{{originalPrompt}}}

{{#if suggestions.length}}
Selected Suggestions to Incorporate:
{{#each suggestions}}
- {{{this}}}
{{/each}}
{{else}}
(No specific suggestions were selected by the user. Perform a general enhancement of the original prompt.)
{{/if}}

Output the enhanced prompt in {{{format}}} format.
Ensure the output is only the enhanced prompt itself, formatted as requested.
`,
});

const enhancedPromptGenerationFlow = ai.defineFlow(
  {
    name: 'enhancedPromptGenerationFlow',
    inputSchema: EnhancedPromptGenerationInputSchema,
    outputSchema: EnhancedPromptGenerationOutputSchema,
  },
  async input => {
    const {output} = await enhancedPromptGenerationPrompt(input);
    return output!;
  }
);
