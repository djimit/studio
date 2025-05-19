// This file holds the Genkit flow for generating an enhanced prompt based on suggestions, allowing users to download it in markdown or JSON format.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancedPromptGenerationInputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt uploaded by the user.'),
  suggestions: z.string().describe('AI suggestions for improving the prompt.'),
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
  prompt: `You are an AI prompt enhancer. Take the original prompt and the suggestions and create the best prompt possible in the requested format.

Original Prompt: {{{originalPrompt}}}

Suggestions: {{{suggestions}}}

Output the enhanced prompt in {{{format}}} format.
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
