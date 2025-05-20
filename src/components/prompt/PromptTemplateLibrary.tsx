
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LlmType } from './PromptUploader';
import { Code2, Palette, MessagesSquare, Image as ImageIcon, Search, BookOpenCheck } from 'lucide-react';

export interface PromptTemplate {
  title: string;
  description: string;
  llmType?: LlmType;
  isDeepResearch?: boolean;
  prompt: string;
}

interface PromptTemplateLibraryProps {
  templates: PromptTemplate[];
  onSelectTemplate: (template: PromptTemplate) => void;
  disabled?: boolean;
}

const llmTypeIcons: Record<LlmType, React.ReactNode> = {
  code: <Code2 className="h-4 w-4" />,
  creative: <Palette className="h-4 w-4" />,
  general: <MessagesSquare className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  research: <Search className="h-4 w-4" />,
};

const llmTypeColors: Record<LlmType, string> = {
    code: "bg-blue-100 text-blue-700 border-blue-300",
    creative: "bg-purple-100 text-purple-700 border-purple-300",
    general: "bg-green-100 text-green-700 border-green-300",
    image: "bg-orange-100 text-orange-700 border-orange-300",
    research: "bg-indigo-100 text-indigo-700 border-indigo-300",
};


export function PromptTemplateLibrary({ templates, onSelectTemplate, disabled = false }: PromptTemplateLibraryProps) {
  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <span>Prompt Template Library</span>
        </CardTitle>
        <CardDescription>
          Get started quickly by selecting a template from the grid below. Templates are shown in up to 3 columns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <Card key={`template-${index}`} className="w-full min-h-[220px] flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                {template.llmType && (
                  <Badge
                    variant="outline"
                    className={`mt-1 text-xs normal-case ${llmTypeColors[template.llmType] || 'border-border'}`}
                  >
                    {llmTypeIcons[template.llmType]}
                    <span className="ml-1.5">{template.llmType.charAt(0).toUpperCase() + template.llmType.slice(1)}{template.isDeepResearch ? " (Deep Research)" : ""}</span>
                  </Badge>
                )}
                 {!template.llmType && template.isDeepResearch && (
                   <Badge variant="outline" className={`mt-1 text-xs normal-case ${llmTypeColors['research'] || 'border-border'}`}>
                     <Search className="h-4 w-4" />
                     <span className="ml-1.5">Deep Research</span>
                   </Badge>
                 )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground whitespace-normal line-clamp-3">
                  {template.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => onSelectTemplate(template)}
                  className="w-full"
                  variant="outline"
                  disabled={disabled}
                >
                  Use this Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
