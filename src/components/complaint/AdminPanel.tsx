import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { ComplaintTemplate } from './types';

interface AdminPanelProps {
  templates: ComplaintTemplate[];
  onTemplatesSave: (templates: ComplaintTemplate[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  templates,
  onTemplatesSave,
}) => {
  const [editingTemplate, setEditingTemplate] = useState<ComplaintTemplate | null>(null);

  const saveTemplate = () => {
    if (!editingTemplate) return;
    
    const updatedTemplates = templates.map(t => 
      t.id === editingTemplate.id ? editingTemplate : t
    );
    
    if (!templates.find(t => t.id === editingTemplate.id)) {
      updatedTemplates.push(editingTemplate);
    }
    
    onTemplatesSave(updatedTemplates);
    setEditingTemplate(null);
  };

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    onTemplatesSave(updatedTemplates);
  };

  const createNewTemplate = () => {
    const newId = `template-${Date.now()}`;
    setEditingTemplate({ 
      id: newId, 
      title: '', 
      description: '', 
      category: '', 
      template: '' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">Управление шаблонами</h2>
        <Button onClick={createNewTemplate}>
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          Новый шаблон
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map(template => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{template.title}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-neutral-100 px-2 py-1 rounded">
                      {template.category}
                    </span>
                    <span className="text-xs text-neutral-500">
                      ID: {template.id}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Icon name="Edit" className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (confirm('Удалить этот шаблон?')) {
                        deleteTemplate(template.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Icon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {templates.find(t => t.id === editingTemplate.id) ? 'Редактировать' : 'Создать'} шаблон
              </DialogTitle>
              <DialogDescription>
                Настройте параметры шаблона жалобы. Используйте переменные в фигурных скобках для автозамены.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    value={editingTemplate.title}
                    onChange={(e) => setEditingTemplate({...editingTemplate, title: e.target.value})}
                    placeholder="Жалоба на..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Категория</Label>
                  <Input
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value})}
                    placeholder="Прокуратура, Суд, ФССП..."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Описание</Label>
                <Input
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})}
                  placeholder="Краткое описание назначения шаблона"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Шаблон документа</Label>
                <div className="text-sm text-neutral-600 mb-2">
                  <strong>Доступные переменные:</strong><br />
                  {'{fullName}, {phone}, {address}, {email}, {additionalInfo}, {date}'}<br />
                  {'{executionNumber}, {bailiffName}, {bailiffDepartment}, {executiveDepartment}'}<br />
                  {'{prosecutorOffice}, {violatedLaws}, {attachments}'}
                </div>
                <Textarea
                  rows={12}
                  value={editingTemplate.template}
                  onChange={(e) => setEditingTemplate({...editingTemplate, template: e.target.value})}
                  placeholder="В [Название органа]

От: {fullName}
Телефон: {phone}
Адрес: {address}
E-mail: {email}

ЖАЛОБА

Прошу рассмотреть мою жалобу...

{additionalInfo}

Дата: {date}
Подпись: ___________"
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                  Отмена
                </Button>
                <Button 
                  onClick={saveTemplate}
                  disabled={!editingTemplate.title || !editingTemplate.template}
                  className="bg-government hover:bg-government/90"
                >
                  <Icon name="Save" className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {templates.length === 0 && (
        <Card className="text-center p-8">
          <CardContent>
            <Icon name="FileText" className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">Нет шаблонов</h3>
            <p className="text-neutral-500 mb-4">Создайте первый шаблон жалобы</p>
            <Button onClick={createNewTemplate}>
              <Icon name="Plus" className="w-4 h-4 mr-2" />
              Создать шаблон
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};