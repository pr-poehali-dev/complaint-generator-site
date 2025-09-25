import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
}

const complaintTemplates: ComplaintTemplate[] = [
  {
    id: 'housing',
    title: 'Жалоба на управляющую компанию',
    description: 'Нарушения в содержании многоквартирного дома',
    category: 'ЖКХ',
    template: 'В Жилищную инспекцию\n\nОт: {fullName}\nТелефон: {phone}\nАдрес: {address}\nE-mail: {email}\n\nЖАЛОБА\nна нарушения управляющей компании\n\nПрошу рассмотреть мою жалобу на нарушения в содержании многоквартирного дома.\n\n{additionalInfo}\n\nПрошу провести проверку и принять меры.\n\nДата: {date}\nПодпись: ___________'
  },
  {
    id: 'medical',
    title: 'Жалоба на медицинское учреждение',
    description: 'Нарушения в оказании медицинских услуг',
    category: 'Здравоохранение',
    template: 'В Министерство здравоохранения\n\nОт: {fullName}\nТелефон: {phone}\nАдрес: {address}\nE-mail: {email}\n\nЖАЛОБА\nна качество медицинских услуг\n\nПрошу рассмотреть мою жалобу на нарушения в оказании медицинских услуг.\n\n{additionalInfo}\n\nПрошу провести проверку и принять соответствующие меры.\n\nДата: {date}\nПодпись: ___________'
  },
  {
    id: 'transport',
    title: 'Жалоба на общественный транспорт',
    description: 'Нарушения в работе общественного транспорта',
    category: 'Транспорт',
    template: 'В Департамент транспорта\n\nОт: {fullName}\nТелефон: {phone}\nАдрес: {address}\nE-mail: {email}\n\nЖАЛОБА\nна работу общественного транспорта\n\nПрошу рассмотреть мою жалобу на нарушения в работе общественного транспорта.\n\n{additionalInfo}\n\nПрошу принять меры для устранения нарушений.\n\nДата: {date}\nПодпись: ___________'
  },
  {
    id: 'education',
    title: 'Жалоба на образовательное учреждение',
    description: 'Нарушения в сфере образования',
    category: 'Образование',
    template: 'В Министерство образования\n\nОт: {fullName}\nТелефон: {phone}\nАдрес: {address}\nE-mail: {email}\n\nЖАЛОБА\nна образовательное учреждение\n\nПрошу рассмотреть мою жалобу на нарушения в сфере образования.\n\n{additionalInfo}\n\nПрошу провести проверку и принять необходимые меры.\n\nДата: {date}\nПодпись: ___________'
  }
];

const instructions = [
  {
    step: 1,
    title: 'Выберите тип жалобы',
    description: 'Выберите подходящий шаблон из предложенных категорий'
  },
  {
    step: 2,
    title: 'Заполните личные данные',
    description: 'Укажите ваши контактные данные - они будут автоматически вставлены в документ'
  },
  {
    step: 3,
    title: 'Добавьте детали',
    description: 'Опишите суть вашей жалобы в поле дополнительной информации'
  },
  {
    step: 4,
    title: 'Скачайте документ',
    description: 'Получите готовый документ для подачи в соответствующие органы'
  }
];

function Index() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ComplaintTemplate | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    address: '',
    email: '',
    complaintType: '',
    additionalInfo: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateDocument = () => {
    if (!selectedTemplate) return;
    
    const currentDate = new Date().toLocaleDateString('ru-RU');
    let document = selectedTemplate.template
      .replace(/{fullName}/g, formData.fullName)
      .replace(/{phone}/g, formData.phone)
      .replace(/{address}/g, formData.address)
      .replace(/{email}/g, formData.email)
      .replace(/{additionalInfo}/g, formData.additionalInfo)
      .replace(/{date}/g, currentDate);

    const blob = new Blob([document], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `жалоба_${selectedTemplate.id}_${currentDate.replace(/\./g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isFormComplete = formData.fullName && formData.phone && formData.address && formData.email && selectedTemplate;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-government rounded-lg flex items-center justify-center">
              <Icon name="FileText" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Портал жалоб</h1>
              <p className="text-sm text-neutral-600">Автоматическое формирование официальных жалоб</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Icon name="FileText" className="w-4 h-4" />
              Создание жалобы
            </TabsTrigger>
            <TabsTrigger value="instructions" className="flex items-center gap-2">
              <Icon name="HelpCircle" className="w-4 h-4" />
              Инструкция
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Template Selection */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-neutral-900">Выберите тип жалобы</h2>
                  <Badge variant="secondary" className="bg-government/10 text-government">
                    {complaintTemplates.length} шаблонов
                  </Badge>
                </div>

                <div className="space-y-4">
                  {complaintTemplates.map((template) => (
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
                    <div className="space-y-2">
                      <Label htmlFor="fullName">ФИО полностью *</Label>
                      <Input
                        id="fullName"
                        placeholder="Иванов Иван Иванович"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        placeholder="+7 (999) 123-45-67"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Почтовый адрес *</Label>
                      <Input
                        id="address"
                        placeholder="г. Москва, ул. Примерная, д. 1, кв. 1"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="additionalInfo">Суть жалобы</Label>
                      <Textarea
                        id="additionalInfo"
                        placeholder="Опишите детально суть вашей жалобы..."
                        rows={4}
                        value={formData.additionalInfo}
                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                      />
                    </div>

                    <Button 
                      onClick={generateDocument}
                      disabled={!isFormComplete}
                      className="w-full bg-government hover:bg-government/90"
                    >
                      <Icon name="Download" className="w-4 h-4 mr-2" />
                      Скачать готовый документ
                    </Button>
                    
                    {!isFormComplete && (
                      <p className="text-xs text-neutral-500 text-center">
                        Заполните все обязательные поля и выберите шаблон
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Инструкция по заполнению</h2>
                <p className="text-neutral-600">Следуйте этим простым шагам для создания официальной жалобы</p>
              </div>

              <div className="space-y-6">
                {instructions.map((instruction) => (
                  <Card key={instruction.step} className="relative">
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

              <Card className="bg-blue-50 border-blue-200 mt-8">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Icon name="Info" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <CardTitle className="text-base text-blue-900 mb-1">Важная информация</CardTitle>
                      <CardDescription className="text-blue-700">
                        Все персональные данные обрабатываются локально в вашем браузере и не передаются на внешние серверы. 
                        Готовый документ сохраняется на ваше устройство в текстовом формате.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Index;