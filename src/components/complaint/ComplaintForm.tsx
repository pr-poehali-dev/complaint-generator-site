import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { ComplaintTemplate, FormData, ValidationErrors, ExportFormat, validationRules } from './types';

interface ComplaintFormProps {
  selectedTemplate: ComplaintTemplate | null;
  formData: FormData;
  validationErrors: ValidationErrors;
  exportFormat: ExportFormat;
  isFormComplete: boolean;
  onInputChange: (field: keyof FormData, value: string) => void;
  onFormatChange: (format: ExportFormat) => void;
  onGenerateDocument: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  selectedTemplate,
  formData,
  validationErrors,
  exportFormat,
  isFormComplete,
  onInputChange,
  onFormatChange,
  onGenerateDocument,
}) => {
  const getFieldsForTemplate = () => {
    if (!selectedTemplate) return [];
    
    const commonFields = [
      { key: 'executionNumber', label: 'Номер исполнительного производства', required: true },
      { key: 'bailiffName', label: 'ФИО судебного пристава-исполнителя', required: true },
      { key: 'bailiffDepartment', label: 'Отдел судебного пристава', required: false },
    ];

    if (selectedTemplate.id === 'bailiff-direct') {
      return [...commonFields, 
        { key: 'executiveDepartment', label: 'Отдел ФССП (куда подается жалоба)', required: false }
      ];
    } else if (selectedTemplate.id === 'prosecutor-bailiff') {
      return [...commonFields,
        { key: 'prosecutorOffice', label: 'Прокуратура (название)', required: false },
        { key: 'violatedLaws', label: 'Дополнительные нарушенные нормы', required: false }
      ];
    }
    
    return commonFields;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-neutral-900">Заполните данные</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Icon name="Save" className="w-3 h-3" />
            Форма автоматически сохраняется
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="format" className="text-sm">Формат:</Label>
            <Select value={exportFormat} onValueChange={onFormatChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">TXT</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {selectedTemplate && (
        <Card className="bg-government/5 border-government/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" className="w-4 h-4 text-government" />
              <span className="text-sm font-medium text-government">Выбран шаблон:</span>
              <span className="text-sm text-neutral-700">{selectedTemplate.title}</span>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Личные данные</CardTitle>
          <CardDescription>Эта информация будет автоматически вставлена в документ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic fields */}
          {[
            { key: 'fullName', label: 'ФИО полностью *', placeholder: 'Иванов Иван Иванович' },
            { key: 'phone', label: 'Телефон *', placeholder: '+7 (999) 123-45-67' },
            { key: 'address', label: 'Почтовый адрес *', placeholder: 'г. Москва, ул. Примерная, д. 1, кв. 1' },
            { key: 'email', label: 'E-mail *', placeholder: 'example@email.com', type: 'email' },
          ].map(field => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={formData[field.key as keyof FormData]}
                onChange={(e) => onInputChange(field.key as keyof FormData, e.target.value)}
                className={validationErrors[field.key] ? 'border-red-500' : ''}
              />
              {validationErrors[field.key] && (
                <p className="text-xs text-red-600">{validationErrors[field.key]}</p>
              )}
            </div>
          ))}

          <Separator />

          {/* Template-specific fields */}
          {selectedTemplate && getFieldsForTemplate().map(field => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>
                {field.label} {field.required && '*'}
              </Label>
              <Input
                id={field.key}
                placeholder={`Введите ${field.label.toLowerCase()}`}
                value={formData[field.key as keyof FormData]}
                onChange={(e) => onInputChange(field.key as keyof FormData, e.target.value)}
                className={validationErrors[field.key] ? 'border-red-500' : ''}
              />
              {validationErrors[field.key] && (
                <p className="text-xs text-red-600">{validationErrors[field.key]}</p>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Суть жалобы *</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Опишите детально суть вашей жалобы, обстоятельства нарушения..."
              rows={4}
              value={formData.additionalInfo}
              onChange={(e) => onInputChange('additionalInfo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Приложения (перечислите документы)</Label>
            <Input
              id="attachments"
              placeholder="Копия исполнительного листа, справка, переписка..."
              value={formData.attachments}
              onChange={(e) => onInputChange('attachments', e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={onGenerateDocument}
              disabled={!isFormComplete}
              className="flex-1 bg-government hover:bg-government/90"
            >
              <Icon name="Download" className="w-4 h-4 mr-2" />
              Скачать {exportFormat.toUpperCase()}
            </Button>
          </div>
          
          {!isFormComplete && (
            <p className="text-xs text-neutral-500 text-center">
              Заполните все обязательные поля и выберите шаблон
            </p>
          )}

          {Object.keys(validationErrors).length > 0 && (
            <Alert>
              <Icon name="AlertCircle" className="h-4 w-4" />
              <AlertDescription>
                Исправьте ошибки в форме перед скачиванием документа
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};