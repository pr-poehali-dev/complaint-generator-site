import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComplaintTemplate } from './types';

interface TemplateSelectorProps {
  templates: ComplaintTemplate[];
  selectedTemplate: ComplaintTemplate | null;
  onTemplateSelect: (template: ComplaintTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Выберите тип жалобы</h2>
        <Badge variant="secondary" className="bg-government/10 text-government">
          {templates.length} шаблонов
        </Badge>
      </div>

      <div className="space-y-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTemplate?.id === template.id 
                ? 'ring-2 ring-government border-government' 
                : 'hover:border-government/50'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base text-neutral-900">{template.title}</CardTitle>
                  <CardDescription className="text-sm text-neutral-600 mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-3 text-xs">
                  {template.category}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};