import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const instructions = [
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
];

const importantInfo = {
  title: 'Важная информация',
  description: 'Все персональные данные обрабатываются локально в вашем браузере и не передаются на внешние серверы. Готовый документ сохраняется на ваше устройство в выбранном формате.'
};

const legalAdvice = [
  {
    title: 'Сроки подачи жалоб',
    description: 'Жалоба на действия судебного пристава может быть подана в течение 10 дней с момента совершения обжалуемого действия или бездействия.'
  },
  {
    title: 'Куда подавать',
    description: 'Жалобу на пристава сначала подают вышестоящему приставу. Если результата нет - в прокуратуру или суд.'
  },
  {
    title: 'Необходимые документы',
    description: 'Приложите копии: исполнительного листа, переписки с приставом, документов, подтверждающих нарушение.'
  },
  {
    title: 'Ответ на жалобу',
    description: 'Орган обязан дать письменный ответ в течение 30 дней с момента поступления жалобы.'
  }
];

export const InstructionsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Инструкция по заполнению жалоб</h2>
          <p className="text-neutral-600">Пошаговое руководство для подачи жалоб на судебных приставов</p>
        </div>

        {/* Step-by-step instructions */}
        <div className="space-y-6 mb-12">
          {instructions.map((instruction) => (
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

        {/* Legal advice */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">Юридические особенности</h3>
          <div className="grid gap-4">
            {legalAdvice.map((advice, index) => (
              <Card key={index} className="bg-amber-50 border-amber-200">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Icon name="Scale" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <CardTitle className="text-base text-amber-900 mb-1">{advice.title}</CardTitle>
                      <CardDescription className="text-amber-700">{advice.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Important info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Icon name="Info" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <CardTitle className="text-base text-blue-900 mb-1">{importantInfo.title}</CardTitle>
                <CardDescription className="text-blue-700">
                  {importantInfo.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Contact information */}
        <Card className="bg-green-50 border-green-200 mt-6">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Icon name="Phone" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <CardTitle className="text-base text-green-900 mb-1">Нужна помощь?</CardTitle>
                <CardDescription className="text-green-700">
                  Если возникли вопросы по заполнению, обратитесь за консультацией к юристу или в общественную приемную.
                  Бесплатная юридическая помощь: 8-800-100-00-00
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};