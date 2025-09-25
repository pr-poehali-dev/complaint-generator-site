export interface ComplaintTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
}

export interface FormData {
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

export interface ValidationErrors {
  [key: string]: string;
}

export type ExportFormat = 'txt' | 'docx' | 'pdf';

export const initialTemplates: ComplaintTemplate[] = [
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

export const validationRules = {
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