import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

// Import complaint components
import { TemplateSelector } from '@/components/complaint/TemplateSelector';
import { ComplaintForm } from '@/components/complaint/ComplaintForm';
import { AdminPanel } from '@/components/complaint/AdminPanel';
import { InstructionsTab } from '@/components/complaint/InstructionsTab';
import { 
  ComplaintTemplate, 
  FormData, 
  ValidationErrors, 
  ExportFormat, 
  initialTemplates,
  validationRules 
} from '@/components/complaint/types';

function Index() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ComplaintTemplate | null>(null);
  const [templates, setTemplates] = useState<ComplaintTemplate[]>(() => {
    const saved = localStorage.getItem('complaintTemplates');
    return saved ? JSON.parse(saved) : initialTemplates;
  });
  
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('complaintForm');
    return saved ? JSON.parse(saved) : {
      fullName: '',
      phone: '',
      address: '',
      email: '',
      complaintType: '',
      additionalInfo: '',
      executionNumber: '',
      bailiffName: '',
      bailiffDepartment: '',
      executiveDepartment: '',
      prosecutorOffice: '',
      violatedLaws: '',
      attachments: ''
    };
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [exportFormat, setExportFormat] = useState<ExportFormat>('txt');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Auto-save form data
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('complaintForm', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Validate field
  const validateField = (field: keyof FormData, value: string): string => {
    const rule = validationRules[field as keyof typeof validationRules];
    if (rule) {
      return rule(value, selectedTemplate?.id || '');
    }
    return '';
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Basic required fields
    const basicFields: (keyof FormData)[] = ['fullName', 'phone', 'email', 'address'];
    basicFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    // Template-specific fields
    if (selectedTemplate) {
      const templateFields: (keyof FormData)[] = ['executionNumber', 'bailiffName'];
      templateFields.forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
          isValid = false;
        }
      });
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Generate document with different formats
  const generateDocument = async (format: ExportFormat = exportFormat) => {
    if (!selectedTemplate || !validateForm()) return;
    
    const currentDate = new Date().toLocaleDateString('ru-RU');
    let document = selectedTemplate.template
      .replace(/{fullName}/g, formData.fullName)
      .replace(/{phone}/g, formData.phone)
      .replace(/{address}/g, formData.address)
      .replace(/{email}/g, formData.email)
      .replace(/{additionalInfo}/g, formData.additionalInfo)
      .replace(/{executionNumber}/g, formData.executionNumber)
      .replace(/{bailiffName}/g, formData.bailiffName)
      .replace(/{bailiffDepartment}/g, formData.bailiffDepartment)
      .replace(/{executiveDepartment}/g, formData.executiveDepartment)
      .replace(/{prosecutorOffice}/g, formData.prosecutorOffice)
      .replace(/{violatedLaws}/g, formData.violatedLaws)
      .replace(/{attachments}/g, formData.attachments)
      .replace(/{date}/g, currentDate);

    const filename = `жалоба_${selectedTemplate.id}_${currentDate.replace(/\./g, '-')}`;

    if (format === 'txt') {
      const blob = new Blob([document], { type: 'text/plain;charset=utf-8' });
      downloadFile(blob, `${filename}.txt`);
    } else if (format === 'docx') {
      // Simple DOCX generation (would need a library like docx for full support)
      const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>${document.replace(/\n/g, '</w:t></w:r></w:p><w:p><w:r><w:t>')}</w:t></w:r></w:p></w:body>
        </w:document>`;
      const blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      downloadFile(blob, `${filename}.docx`);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setAdminPassword('');
    } else {
      alert('Неверный пароль');
    }
  };

  const handleTemplatesSave = (updatedTemplates: ComplaintTemplate[]) => {
    setTemplates(updatedTemplates);
    localStorage.setItem('complaintTemplates', JSON.stringify(updatedTemplates));
  };

  const isFormComplete = formData.fullName && formData.phone && formData.address && formData.email && selectedTemplate;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-government rounded-lg flex items-center justify-center">
                <Icon name="FileText" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">Портал жалоб на приставов</h1>
                <p className="text-sm text-neutral-600">Автоматическое формирование официальных жалоб</p>
              </div>
            </div>
            
            {/* Admin Panel Access */}
            {!isAdmin ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Icon name="Settings" className="w-4 h-4 mr-2" />
                    Админ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Вход в админ-панель</DialogTitle>
                    <DialogDescription>Введите пароль для доступа к управлению шаблонами</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="password"
                      placeholder="Пароль"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                    <Button onClick={handleAdminLogin} className="w-full">
                      Войти
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setIsAdmin(false)}>
                <Icon name="LogOut" className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} mb-8`}>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Icon name="FileText" className="w-4 h-4" />
              Создание жалобы
            </TabsTrigger>
            <TabsTrigger value="instructions" className="flex items-center gap-2">
              <Icon name="HelpCircle" className="w-4 h-4" />
              Инструкция
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Icon name="Settings" className="w-4 h-4" />
                Админ-панель
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Template Selection */}
              <TemplateSelector
                templates={templates}
                selectedTemplate={selectedTemplate}
                onTemplateSelect={setSelectedTemplate}
              />

              {/* Form */}
              <ComplaintForm
                selectedTemplate={selectedTemplate}
                formData={formData}
                validationErrors={validationErrors}
                exportFormat={exportFormat}
                isFormComplete={isFormComplete}
                onInputChange={handleInputChange}
                onFormatChange={setExportFormat}
                onGenerateDocument={generateDocument}
              />
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            <InstructionsTab />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminPanel
                templates={templates}
                onTemplatesSave={handleTemplatesSave}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default Index;