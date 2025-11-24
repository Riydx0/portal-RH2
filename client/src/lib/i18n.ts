import { useState } from 'react';

export type Language = 'en' | 'ar';

const translations = {
  en: {
    dashboard: 'Dashboard',
    downloads: 'Downloads',
    tickets: 'Tickets',
    users: 'Users',
    groups: 'Groups',
    categories: 'Categories',
    software: 'Software',
    licenses: 'Licenses',
    settings: 'Settings',
    appearance: 'Appearance',
    branding: 'Branding',
    sso: 'SSO Settings',
    changePassword: 'Change Password',
    language: 'Language',
    administration: 'Administration',
    mainMenu: 'Main Menu',
    logout: 'Logout',
    account: 'Account',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    downloads: 'التنزيلات',
    tickets: 'التذاكر',
    users: 'المستخدمون',
    groups: 'المجموعات',
    categories: 'الفئات',
    software: 'البرامج',
    licenses: 'الرخص',
    settings: 'الإعدادات',
    appearance: 'المظهر',
    branding: 'العلامة التجارية',
    sso: 'إعدادات SSO',
    changePassword: 'تغيير كلمة المرور',
    language: 'اللغة',
    administration: 'الإدارة',
    mainMenu: 'القائمة الرئيسية',
    logout: 'تسجيل الخروج',
    account: 'الحساب',
  },
};

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('language') as Language;
  return stored || 'en';
}

export function setLanguage(lang: Language) {
  localStorage.setItem('language', lang);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}

export function initLanguage() {
  const lang = getLanguage();
  setLanguage(lang);
}

export function t(key: keyof typeof translations.en, lang: Language = getLanguage()): string {
  return translations[lang][key] || translations.en[key] || key;
}

export function useLanguage() {
  const [lang, setLang] = useState<Language>(getLanguage());
  
  const changeLang = (newLang: Language) => {
    setLanguage(newLang);
    setLang(newLang);
  };

  return { lang, changeLang };
}
