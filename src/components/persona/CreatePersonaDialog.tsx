
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserSquare2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const personaFormSchema = z.object({
  name: z.string().min(2, { message: "Persona name must be at least 2 characters." }).max(50, { message: "Persona name must not exceed 50 characters." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }).max(200, { message: "Description must not exceed 200 characters." }),
  instructions: z.string().min(10, { message: "AI instructions must be at least 10 characters." }).max(2000, { message: "AI instructions must not exceed 2000 characters." }),
  examples: z.string().max(5000, { message: "Examples must not exceed 5000 characters." }).optional(),
});

export type PersonaFormData = z.infer<typeof personaFormSchema>;

interface CreatePersonaDialogProps {
  onPersonaCreated: (data: PersonaFormData) => void;
  children: React.ReactNode; // For the trigger button
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreatePersonaDialog({ onPersonaCreated, children, open, onOpenChange }: CreatePersonaDialogProps) {
  const form = useForm<PersonaFormData>({
    resolver: zodResolver(personaFormSchema),
    defaultValues: {
      name: "",
      description: "",
      instructions: "",
      examples: "",
    },
  });
  const { toast } = useToast();

  const handleDialogStateChange = (newOpenState: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpenState);
    }
    if (!newOpenState) {
      form.reset(); // Reset form when dialog closes
    }
  };

  const onSubmit = (data: PersonaFormData) => {
    onPersonaCreated(data);
    toast({
      title: "Persona Created",
      description: `"${data.name}" has been successfully created.`,
    });
    if (onOpenChange) {
      onOpenChange(false); // Request close
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogStateChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px] md:max-w-[750px]"> {/* Increased width for examples */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserSquare2 className="h-6 w-6 text-primary" /> Create New AI Persona
          </DialogTitle>
          <DialogDescription>
            Define a new persona with specific instructions and examples for the AI. This will help tailor analysis and suggestions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Expert Python Developer" {...field} />
                  </FormControl>
                  <FormDescription>A short, memorable name for this persona.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., A persona that analyzes prompts assuming the target is a senior Python engineer." {...field} rows={3} />
                  </FormControl>
                  <FormDescription>A brief description of this persona's role or characteristics.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., You are an expert Python developer. When analyzing prompts, assume the user wants to generate Python code. Focus on clarity, efficiency, and adherence to Python best practices like PEP 8. Suggest improvements that would lead to more robust and idiomatic Python code. If the prompt is about general programming, steer it towards Python-specific solutions where appropriate." 
                      {...field} 
                      rows={6} 
                    />
                  </FormControl>
                  <FormDescription>Detailed instructions for the AI when this persona is active. This will be included in the context for analysis.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="examples"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Examples (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide examples of prompts this persona might write, or desired output styles. For instance:\n\nExample Input Prompt Persona Might Refine:\n'How do I sort a list in Python?'\n\nExample Output Style this Persona Aims For:\n'For sorting lists in Python, the `sort()` method modifies the list in-place, while `sorted()` returns a new sorted list. For simple ascending order, `my_list.sort()` is common. For custom sorting, use the `key` argument...'"
                      {...field} 
                      rows={8} 
                    />
                  </FormControl>
                  <FormDescription>
                    Add example prompts, desired output styles, or other contextual examples. This will be appended to the AI Instructions when the persona is active.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Persona"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
