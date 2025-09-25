import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface ComplaintTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
}

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  email: string;
  complaintType: string;
  additionalInfo: string;
  executionNumber: string;
  bailiffName: string;
  bailiffDepartment: string;
  executiveDepartment: string;
  prosecutorOffice: string;
  violatedLaws: string;
  attachments: string;
}

interface ValidationErrors {
  [key: string]: string;
}

type ExportFormat = 'txt' | 'docx' | 'pdf';

const initialTemplates: ComplaintTemplate[] = [
  {
    id: 'bailiff-direct',
    title: 'Жалоба на действия судебного пристава-исполнителя',
    description: 'В вышестоящему судебному приставу (старшему судебному приставу)',
    category: 'Судебные приставы',
    template: 'Старшему судебному приставу\n{executiveDepartment}\n\nОт: {fullName}\nТелефон: {phone}\nАдрес: {address}\nE-mail: {email}\n\nЖАЛОБА\nна действия (бездействие) судебного пристава-исполнителя\n\nИсполнительное производство № {executionNumber}\nСудебный пристав-исполнитель: {bailiffName}\nОтдел: {bailiffDepartment}\n\nПрошу рассмотреть мою жалобу на неправомерные действия (бездействие) судебного пристава-исполнителя.\n\nОбстоятельства дела:\n{additionalInfo}\n\nПрошу:\n1. Провести служебную проверку действий судебного пристава-исполнителя\n2. Принять меры для устранения нарушений\n3. Дать письменный ответ о результатах рассмотрения жалобы\n\nПриложения: {attachments}\n\nДата: {date}\nПодпись: ___________'
  },
  {
    id: 'prosecutor-bailiff',
    title: 'Жалоба в прокуратуру на действия судебного пристава',
    description: 'В прокуратуру на нарушения при исполнительном производстве',
    category: 'Прокуратура',
    template: 'В прокуратуру {prosecutorOffice}\n\nОт: {fullName}\nТелефон: {phone}\nАдрес: {address}\nE-mail: {email}\n\nЗАЯВЛЕНИЕ\nо нарушении закона судебным приставом-исполнителем\n\nИсполнительное производство № {executionNumber}\nСудебный пристав-исполнитель: {bailiffName}\nОтдел: {bailiffDepartment}\n\nПрошу провести прокурорскую проверку действий судебного пристава-исполнителя в связи с нарушением требований федерального законодательства.\n\nОбстоятельства нарушения:\n{additionalInfo}\n\nНарушены нормы:\n- Федеральный закон "Об исполнительном производстве"\n- Федеральный закон "О судебных приставах"\n{violatedLaws}\n\nПрошу:\n1. Провести прокурорскую проверку\n2. Принести протест на незаконные действия\n3. Обеспечить восстановление нарушенных прав\n4. Дать письменный ответ о принятых мерах\n\nПриложения: {attachments}\n\nДата: {date}\nПодпись: ___________'
  }
];

const validationRules = {
  fullName: (value: string) => {
    if (!value.trim()) return 'ФИО обязательно для заполнения';
    if (value.trim().split(' ').length < 2) return 'Введите полное ФИО (минимум имя и фамилия)';
    return '';
  },
  phone: (value: string) => {
    if (!value.trim()) return 'Телефон обязателен для заполнения';
    const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Введите корректный номер телефона';
    return '';
  },
  email: (value: string) => {
    if (!value.trim()) return 'Email обязателен для заполнения';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Введите корректный email';
    return '';
  },
  address: (value: string) => {
    if (!value.trim()) return 'Адрес обязателен для заполнения';
    if (value.trim().length < 10) return 'Введите полный адрес';
    return '';
  },
  executionNumber: (value: string, templateId: string) => {
    if (templateId && !value.trim()) return 'Номер исполнительного производства обязателен';
    return '';
  },
  bailiffName: (value: string, templateId: string) => {
    if (templateId && !value.trim()) return 'ФИО пристава обязательно';
    return '';
  }
};

function Index() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ComplaintTemplate | null>(null);
  const [templates, setTemplates] = useState<ComplaintTemplate[]>(initialTemplates);
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
  const [editingTemplate, setEditingTemplate] = useState<ComplaintTemplate | null>(null);
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

  const saveTemplate = () => {
    if (!editingTemplate) return;
    
    const updatedTemplates = templates.map(t => 
      t.id === editingTemplate.id ? editingTemplate : t
    );
    
    if (!templates.find(t => t.id === editingTemplate.id)) {
      updatedTemplates.push(editingTemplate);
    }
    
    setTemplates(updatedTemplates);
    setEditingTemplate(null);
    localStorage.setItem('complaintTemplates', JSON.stringify(updatedTemplates));
  };

  const isFormComplete = formData.fullName && formData.phone && formData.address && formData.email && selectedTemplate;

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
            {/* Auto-save indicator */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Icon name="Save" className="w-3 h-3" />
                Форма автоматически сохраняется
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="format" className="text-sm">Формат:</Label>
                <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
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

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Template Selection */}
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
                      onClick={() => setSelectedTemplate(template)}
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

              {/* Form */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900">Заполните данные</h2>
                
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
                          onChange={(e) => handleInputChange(field.key as keyof FormData, e.target.value)}
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
                          onChange={(e) => handleInputChange(field.key as keyof FormData, e.target.value)}
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
                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="attachments">Приложения (перечислите документы)</Label>
                      <Input
                        id="attachments"
                        placeholder="Копия исполнительного листа, справка, переписка..."
                        value={formData.attachments}
                        onChange={(e) => handleInputChange('attachments', e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => generateDocument()}
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
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            {/* Instructions content similar to before but updated for bailiff complaints */}
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Инструкция по заполнению жалоб</h2>
                <p className="text-neutral-600">Пошаговое руководство для подачи жалоб на судебных приставов</p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: 'Выберите тип жалобы',
                    description: 'Определите, куда подавать жалобу: вышестоящему приставу или в прокуратуру'
                  },
                  {
                    step: 2,
                    title: 'Заполните личные данные',
                    description: 'Укажите точные контактные данные - они попадут в официальный документ'
                  },
                  {
                    step: 3,
                    title: 'Укажите данные исполнительного производства',
                    description: 'Номер производства, ФИО пристава и отдел обязательны для рассмотрения'
                  },
                  {
                    step: 4,
                    title: 'Опишите нарушения',
                    description: 'Детально изложите факты нарушения с датами и обстоятельствами'
                  },
                  {
                    step: 5,
                    title: 'Скачайте и подайте документ',
                    description: 'Выберите формат, скачайте и подайте в соответствующий орган'
                  }
                ].map((instruction) => (
                  <Card key={instruction.step}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-government text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {instruction.step}
                        </div>
                        <div>
                          <CardTitle className="text-base text-neutral-900 mb-1">{instruction.title}</CardTitle>
                          <CardDescription>{instruction.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-neutral-900">Управление шаблонами</h2>
                  <Button onClick={() => setEditingTemplate({ id: '', title: '', description: '', category: '', template: '' })}>
                    <Icon name="Plus" className="w-4 h-4 mr-2" />
                    Новый шаблон
                  </Button>
                </div>

                <div className="grid gap-4">
                  {templates.map(template => (
                    <Card key={template.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{template.title}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Icon name="Edit" className="w-4 h-4" />
                          </Button>
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
                          {editingTemplate.id ? 'Редактировать' : 'Создать'} шаблон
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Название</Label>
                            <Input
                              value={editingTemplate.title}
                              onChange={(e) => setEditingTemplate({...editingTemplate, title: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Категория</Label>
                            <Input
                              value={editingTemplate.category}
                              onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Описание</Label>
                          <Input
                            value={editingTemplate.description}
                            onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Шаблон документа</Label>
                          <Textarea
                            rows={12}
                            value={editingTemplate.template}
                            onChange={(e) => setEditingTemplate({...editingTemplate, template: e.target.value})}
                            placeholder="Используйте {fullName}, {phone}, {address} и другие переменные"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                            Отмена
                          </Button>
                          <Button onClick={saveTemplate}>
                            Сохранить
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default Index;