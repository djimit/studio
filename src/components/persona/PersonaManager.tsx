
'use client';

import * as React from 'react';
import type { Persona } from '@/lib/personas';
import { addPersona, deletePersona as deletePersonaStorage } from '@/lib/personas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreatePersonaDialog, type PersonaFormData } from './CreatePersonaDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus2, Users2, Trash2, AlertCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PersonaManagerProps {
  personas: Persona[];
  onPersonasChange: (updatedPersonas: Persona[]) => void; // Callback to update parent state
  disabled?: boolean;
}

export function PersonaManager({ personas, onPersonasChange, disabled }: PersonaManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handlePersonaCreated = (data: PersonaFormData) => {
    const updatedPersonas = addPersona(data);
    onPersonasChange(updatedPersonas);
    setIsCreateDialogOpen(false); 
  };

  const handleDeletePersona = (personaId: string, personaName: string) => {
    const updatedPersonas = deletePersonaStorage(personaId);
    onPersonasChange(updatedPersonas);
    toast({
      title: "Persona Deleted",
      description: `Persona "${personaName}" has been removed.`,
      variant: "destructive"
    });
  };

  return (
    <TooltipProvider>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-6 w-6 text-primary" />
            <span>Manage AI Personas</span>
          </CardTitle>
          <CardDescription>
            Create, view, and manage your custom AI personas. Selected personas (instructions & examples) will influence prompt analysis and generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personas.length === 0 ? (
            <p className="text-muted-foreground">No personas created yet. Click "Add New Persona" to get started.</p>
          ) : (
            <ScrollArea className="h-[200px] w-full pr-4">
              <div className="space-y-3">
                {personas.map((persona) => (
                  <div key={persona.id} className="p-3 border rounded-md bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:shadow-sm transition-shadow">
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-foreground">{persona.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-sm md:max-w-md" title={persona.description}>
                        {persona.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(persona.timestamp).toLocaleDateString()}
                        </p>
                        {persona.examples && (
                           <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <FileText className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-xs whitespace-pre-wrap"><strong>Examples Provided:</strong><br/>{persona.examples.substring(0, 200)}{persona.examples.length > 200 ? '...' : ''}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 shrink-0 h-8 w-8" disabled={disabled}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete {persona.name}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-destructive" /> Delete Persona: {persona.name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the persona "{persona.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePersona(persona.id, persona.name)} className="bg-destructive hover:bg-destructive/90">
                            Yes, Delete Persona
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter>
          <CreatePersonaDialog onPersonaCreated={handlePersonaCreated} open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button className="w-full sm:w-auto" disabled={disabled} onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus2 className="mr-2 h-4 w-4" /> Add New Persona
            </Button>
          </CreatePersonaDialog>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
