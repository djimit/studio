
'use client';

import type { AnalyzePromptOutput } from '@/ai/flows/prompt-analysis';
import type { LlmType } from '@/components/prompt/PromptUploader';

export interface HistoryItem {
  id: string;
  originalPrompt: string;
  originalLlmType?: LlmType;
  originalIsDeepResearch?: boolean;
  analysisResult: AnalyzePromptOutput;
  timestamp: number; // Store as number for sorting, e.g., Date.now()
}

const HISTORY_STORAGE_KEY = 'promptRefinerHistory';
const MAX_HISTORY_ITEMS = 20; // Optional: Limit the number of items

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory) as HistoryItem[];
      // Sort by timestamp descending (newest first)
      return parsedHistory.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (error) {
    console.error("Error loading history from localStorage:", error);
  }
  return [];
}

export function saveHistory(history: HistoryItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    // Sort by timestamp descending before saving
    const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp);
    const limitedHistory = sortedHistory.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Error saving history to localStorage:", error);
  }
}

export function addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem[] {
  const currentHistory = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // More robust ID
    timestamp: Date.now(),
  };
  const updatedHistory = [newItem, ...currentHistory];
  saveHistory(updatedHistory);
  return getHistory(); // Return the potentially sorted and limited list
}

export function clearHistory(): HistoryItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing history from localStorage:", error);
  }
  return [];
}
