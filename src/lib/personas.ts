
'use client';

export interface Persona {
  id: string;
  name: string;
  description: string;
  instructions: string; // Instructions for the AI
  timestamp: number;
}

const PERSONAS_STORAGE_KEY = 'promptRefinerPersonas';
const MAX_PERSONAS = 50; // Optional: Limit the number of personas

export function getPersonas(): Persona[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedPersonas = localStorage.getItem(PERSONAS_STORAGE_KEY);
    if (storedPersonas) {
      const parsedPersonas = JSON.parse(storedPersonas) as Persona[];
      return parsedPersonas.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (error) {
    console.error("Error loading personas from localStorage:", error);
  }
  return [];
}

export function savePersonas(personas: Persona[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const sortedPersonas = personas.sort((a, b) => b.timestamp - a.timestamp);
    const limitedPersonas = sortedPersonas.slice(0, MAX_PERSONAS);
    localStorage.setItem(PERSONAS_STORAGE_KEY, JSON.stringify(limitedPersonas));
  } catch (error) {
    console.error("Error saving personas to localStorage:", error);
  }
}

export function addPersona(personaData: Omit<Persona, 'id' | 'timestamp'>): Persona[] {
  const currentPersonas = getPersonas(); // Corrected: was getHistory()
  const newPersona: Persona = {
    ...personaData,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };
  const updatedPersonas = [newPersona, ...currentPersonas];
  savePersonas(updatedPersonas);
  return getPersonas();
}

export function getPersonaById(id: string): Persona | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const personas = getPersonas();
  return personas.find(p => p.id === id);
}

export function deletePersona(id: string): Persona[] {
  if (typeof window === 'undefined') {
    return [];
  }
  let personas = getPersonas();
  personas = personas.filter(p => p.id !== id);
  savePersonas(personas);
  return getPersonas();
}
