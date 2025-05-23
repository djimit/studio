
import { config } from 'dotenv';
config();

import '@/ai/flows/prompt-analysis.ts';
import '@/ai/flows/enhanced-prompt-generation.ts';
import '@/ai/flows/apply-single-suggestion-flow.ts';
import '@/ai/flows/explain-suggestion-flow.ts';
import '@/ai/flows/execute-two-step-chain.ts';
