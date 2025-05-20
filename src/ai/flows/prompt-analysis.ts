
// This is an AI-powered function that analyzes user-provided prompts and offers suggestions for improvement.
// It takes a prompt, LLM type, and research depth as input and returns an analysis with tailored suggestions, a recommended LLM model, and a clarity score.
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
  
  promptClarityScore: z.number().min(1).max(10).describe('A score from 1 (Very Unclear) to 10 (Very Clear) assessing the overall clarity of the prompt.').optional(),
  clarityScoreReasoning: z.string().describe('The reasoning behind the assigned clarity score.').optional(),

  specificityScore: z.number().min(1).max(10).describe('A score from 1 (Very Vague) to 10 (Very Specific) assessing the prompt\'s specificity.').optional(),
  specificityScoreReasoning: z.string().describe('The reasoning behind the assigned specificity score.').optional(),

  actionabilityScore: z.number().min(1).max(10).describe('A score from 1 (Unclear Task) to 10 (Clear Task) assessing the prompt\'s actionability.').optional(),
  actionabilityScoreReasoning: z.string().describe('The reasoning behind the assigned actionability score.').optional(),

  concisenessScore: z.number().min(1).max(10).describe('A score from 1 (Very Wordy) to 10 (Very Concise) assessing the prompt\'s conciseness.').optional(),
  concisenessScoreReasoning: z.string().describe('The reasoning behind the assigned conciseness score.').optional(),

  potentialAmbiguities: z.array(z.string()).describe("An array of strings, each identifying a word, phrase, or part of the prompt that could be ambiguous or lead to multiple interpretations. Empty if none significant.").optional(),
  
  tokenCountEstimation: z.number().optional().describe("A rough, general estimation of the prompt's token count. Highly approximate."),

  overallRating: z.string().describe("A qualitative overall rating for the prompt (e.g., 'Needs Significant Improvement', 'Good Start', 'Excellent').").optional(),
  overallRatingReasoning: z.string().describe("A brief justification for the overall rating based on the comprehensive analysis.").optional(),

  suggestedModel: z.string().optional().describe('The suggested LLM model from the provided list that would be best for this prompt. If no specific recommendation, state why.'),
  modelSuggestionReasoning: z.string().optional().describe('The reasoning behind suggesting the specific LLM model, or explanation if no specific model is recommended.'),
});
export type AnalyzePromptOutput = z.infer<typeof AnalyzePromptOutputSchema>;

export async function analyzePrompt(input: AnalyzePromptInput): Promise<AnalyzePromptOutput> {
  return analyzePromptFlow(input);
}

const availableModels = [
  "OpenAI GPT-4.1",
  "OpenAI GPT-4o",
  "OpenAI GPT-3.5",
  "OpenAI GPT-4 Mini",
  "Anthropic Claude 3.7 Sonnet",
  "Anthropic Claude 3 Opus",
  "Google Gemini 2.5 Pro",
  "Google Gemini Ultra 1.0",
  "Meta Llama 4 Maverick",
  "Meta Llama 4 Scout",
  "Meta Llama 3.1 70B",
  "Mistral Large 2",
  "Mistral Mixtral 8x22B Instruct",
  "Mistral Codestral 22B",
  "Cohere Command A",
  "Cohere Command R+",
  "Aleph Alpha Pharia-1-LLM-7B-control",
  "Perplexity Sonar Reasoning Pro High"
];

const analyzePromptPrompt = ai.definePrompt({
  name: 'analyzePromptPrompt',
  input: {schema: AnalyzePromptInputSchema},
  output: {schema: AnalyzePromptOutputSchema},
  prompt: `You are an AI prompt analyzer and LLM consultant. Analyze the following prompt and provide a comprehensive evaluation.
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

Analysis (General Evaluation):
Provide your general analysis of the prompt here.

Suggestions:
Provide an array of specific, actionable suggestions for improvement based on the prompt itself and the provided context like LLM type and research depth.

Advanced Prompt Metrics:

1.  Overall Rating:
    Provide a qualitative overall rating for the prompt (e.g., 'Needs Significant Improvement', 'Fair, but could be clearer', 'Good Start', 'Well-Constructed', 'Excellent').
    Populate 'overallRating' with the rating string and 'overallRatingReasoning' with a brief justification based on the comprehensive analysis.

2.  Clarity Score:
    Assess the prompt's overall clarity on a scale of 1 (Very Unclear) to 10 (Very Clear).
    Base your score on factors such as:
    - Specificity: Is the prompt concrete and detailed enough?
    - Unambiguity: Is it free of confusing language or multiple interpretations?
    - Actionability: Is it clear what the LLM is supposed to do?
    - Conciseness: Is it to the point, without unnecessary fluff?
    - Completeness: Does it contain all necessary information?
    Populate 'promptClarityScore' with the integer score and 'clarityScoreReasoning' with a brief explanation for your score.

3.  Specificity Score:
    Assess the prompt's specificity on a scale of 1 (Very Vague) to 10 (Very Specific).
    Consider: Does it clearly define the subject, desired output format, constraints, and context?
    Populate 'specificityScore' with the integer score and 'specificityScoreReasoning' with a brief explanation for your score.

4.  Actionability Score:
    Assess the prompt's actionability on a scale of 1 (Unclear Task) to 10 (Clear Task).
    Consider: Is it obvious what the LLM is supposed to *do* (e.g., generate, summarize, translate, list, explain, compare)?
    Populate 'actionabilityScore' with the integer score and 'actionabilityScoreReasoning' with a brief explanation for your score.

5.  Conciseness Score:
    Assess the prompt's conciseness on a scale of 1 (Very Wordy) to 10 (Very Concise).
    Consider: Is it free of redundant information or unnecessary fluff that doesn't contribute to the core request? Is it as short as possible while still being effective?
    Populate 'concisenessScore' with the integer score and 'concisenessScoreReasoning' with a brief explanation for your score.

6.  Potential Ambiguities:
    Identify any words, phrases, or parts of the prompt that could be ambiguous or lead to multiple interpretations by the LLM.
    Populate 'potentialAmbiguities' with an array of strings, each string being an identified ambiguity. If none are significant, provide an empty array.

7.  Token Count Estimation:
    Provide a rough, general estimation of the prompt's token count. Acknowledge this is highly approximate and can vary significantly between models.
    Populate 'tokenCountEstimation' with a number. If you cannot reliably estimate, you may omit this field or provide 0 and briefly state why in the general analysis.

Model Suggestion:
Based on the prompt's content, the selected LLM Type (if any), and whether it's for deep research, suggest the most suitable LLM model from the list below. Provide a brief reasoning for your choice.
- You MUST populate the 'suggestedModel' and 'modelSuggestionReasoning' fields in your JSON output.
- If a specific model is a clear fit, suggest it and explain why.
- If multiple models could work, pick the one you deem most versatile or generally applicable for the task and explain your choice.
- If the prompt is too vague to make a specific recommendation, set 'suggestedModel' to a message like "No specific model recommendation due to prompt vagueness" and for 'modelSuggestionReasoning' explain briefly why a specific recommendation cannot be made.
Do not leave 'suggestedModel' or 'modelSuggestionReasoning' empty or undefined in your JSON output.

Available Models:
${availableModels.map(m => `- ${m}`).join('\n')}

Output Format:
Ensure your output is a JSON object adhering to the specified output schema, including all fields: 'analysis', 'suggestions', 'promptClarityScore', 'clarityScoreReasoning', 'specificityScore', 'specificityScoreReasoning', 'actionabilityScore', 'actionabilityScoreReasoning', 'concisenessScore', 'concisenessScoreReasoning', 'potentialAmbiguities', 'tokenCountEstimation', 'overallRating', 'overallRatingReasoning', 'suggestedModel', and 'modelSuggestionReasoning'.
`,
});

const analyzePromptFlow = ai.defineFlow(
  {
    name: 'analyzePromptFlow',
    inputSchema: AnalyzePromptInputSchema,
    outputSchema: AnalyzePromptOutputSchema,
  },
  async input => {
    const {output} = await analyzePromptPrompt(input);
    
    // Ensure suggestions is always an array
    if (output && typeof output.suggestions === 'string') {
      // @ts-ignore
      output.suggestions = [output.suggestions];
    } else if (output && !Array.isArray(output.suggestions)) {
       // @ts-ignore
      output.suggestions = [];
    }

    // Ensure potentialAmbiguities is always an array
    if (output && typeof output.potentialAmbiguities === 'string') {
        // @ts-ignore
      output.potentialAmbiguities = [output.potentialAmbiguities];
    } else if (output && !Array.isArray(output.potentialAmbiguities)) {
         // @ts-ignore
      output.potentialAmbiguities = [];
    }

    return output!;
  }
);

