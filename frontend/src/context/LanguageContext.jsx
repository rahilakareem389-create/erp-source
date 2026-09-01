import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('erp_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('erp_language', language);
    // Update document direction for RTL
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Add a class for font switching if needed
    if (language === 'ar') {
      document.body.classList.add('font-arabic');
      document.body.classList.remove('font-sans');
    } else {
      document.body.classList.add('font-sans');
      document.body.classList.remove('font-arabic');
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key) => {
    if (language === 'en') return translations.en[key] || key;
    return translations.ar[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Simple translations dictionary for demo
const translations = {
  en: {
    dashboard: 'Dashboard',
    hrCenter: 'HR Center',
    employees: 'Employees',
    attendance: 'Attendance',
    leaves: 'Leaves',
    payroll: 'Payroll',
    projectCosting: 'Project Costing',
    loans: 'Loans',
    biDashboard: 'Management BI',
    totalStaff: 'Total Staff',
    active: 'active',
    saudi: 'Saudi',
    nonSaudi: 'Non-Saudi',
    estPayroll: 'Est. Payroll',
    pendingLeaves: 'Pending Leaves',
    addEmployee: '+ Add Employee',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search...',
    print: 'Print',
    viewAll: 'View All',
  },
  ar: {
    dashboard: 'لوحة القيادة',
    hrCenter: 'مركز الموارد البشرية',
    employees: 'الموظفين',
    attendance: 'الحضور والانصراف',
    leaves: 'الإجازات',
    payroll: 'مسير الرواتب',
    projectCosting: 'تكاليف المشاريع',
    loans: 'السلف والقروض',
    biDashboard: 'ذكاء الأعمال الإداري',
    totalStaff: 'إجمالي الموظفين',
    active: 'نشط',
    saudi: 'سعودي',
    nonSaudi: 'غير سعودي',
    estPayroll: 'الرواتب المقدرة',
    pendingLeaves: 'طلبات إجازة معلقة',
    addEmployee: '+ إضافة موظف',
    save: 'حفظ',
    cancel: 'إلغاء',
    search: 'بحث...',
    print: 'طباعة',
    viewAll: 'عرض الكل',
  }
};
