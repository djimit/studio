'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileJson, FileText as FileMarkdown } from 'lucide-react'; // Using FileText for Markdown

interface FormatSelectorProps {
  selectedFormat: 'markdown' | 'json';
  onFormatChange: (format: 'markdown' | 'json') => void;
  disabled?: boolean;
}

export function FormatSelector({ selectedFormat, onFormatChange, disabled }: FormatSelectorProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileMarkdown className="h-6 w-6" />
          <span>Select Output Format</span></CardTitle>
        <CardDescription>Choose the format for your enhanced prompt.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedFormat}
          onValueChange={(value) => onFormatChange(value as 'markdown' | 'json')}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6"
          disabled={disabled}
        >
          <div className="flex items-center space-x-2 p-3 rounded-md border border-border hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent">
            <RadioGroupItem value="markdown" id="markdown" />
            <Label htmlFor="markdown" className="flex items-center gap-2 cursor-pointer text-base">
              <FileMarkdown className="h-5 w-5" /> Markdown
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-md border border-border hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent">
            <RadioGroupItem value="json" id="json" />
            <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer text-base">
              <FileJson className="h-5 w-5" /> JSON
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
