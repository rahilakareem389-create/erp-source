import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const themes = {
  blue: { 
    name: 'Blue Light',
    primary: '#0a84ff', hover: '#0055ff', rgb: '10, 132, 255', 
    c100: '#dbeafe', c500: '#3b82f6', c600: '#2563eb', c700: '#1d4ed8',
    bgBody: '#f8fafc', bgSurface: '#ffffff', bgHover: '#f1f5f9',
    textMain: '#0f172a', textMuted: '#64748b', borderMain: '#e2e8f0',
    isDark: false
  },
  blueDark: {
    name: 'Blue Dark',
    primary: '#3b82f6', hover: '#60a5fa', rgb: '59, 130, 246',
    c100: '#1e3a8a', c500: '#3b82f6', c600: '#2563eb', c700: '#1d4ed8',
    bgBody: '#0f172a', bgSurface: '#1e293b', bgHover: '#334155',
    textMain: '#f8fafc', textMuted: '#94a3b8', borderMain: '#334155',
    isDark: true
  },
  gold: { 
    name: 'Gold Dark (MERN)',
    primary: '#eab308', hover: '#ca8a04', rgb: '234, 179, 8', 
    c100: '#713f12', c500: '#eab308', c600: '#ca8a04', c700: '#a16207',
    bgBody: '#111827', bgSurface: '#1f2937', bgHover: '#374151',
    textMain: '#f9fafb', textMuted: '#9ca3af', borderMain: '#374151',
    isDark: true
  },
  green: { 
    name: 'Green Light',
    primary: '#22c55e', hover: '#16a34a', rgb: '34, 197, 94', 
    c100: '#dcfce7', c500: '#22c55e', c600: '#16a34a', c700: '#15803d',
    bgBody: '#f8fafc', bgSurface: '#ffffff', bgHover: '#f1f5f9',
    textMain: '#0f172a', textMuted: '#64748b', borderMain: '#e2e8f0',
    isDark: false
  },
  purple: { 
    name: 'Purple Dark',
    primary: '#a855f7', hover: '#9333ea', rgb: '168, 85, 247', 
    c100: '#3b0764', c500: '#a855f7', c600: '#9333ea', c700: '#7e22ce',
    bgBody: '#0f172a', bgSurface: '#1e293b', bgHover: '#334155',
    textMain: '#f8fafc', textMuted: '#94a3b8', borderMain: '#334155',
    isDark: true
  },
  cream: { 
    name: 'Cream Light',
    primary: '#d4a373', hover: '#cc9660', rgb: '212, 163, 115', 
    c100: '#faedcd', c500: '#d4a373', c600: '#cc9660', c700: '#b8824f',
    bgBody: '#fdfbf7', bgSurface: '#ffffff', bgHover: '#f7ede2',
    textMain: '#4a4036', textMuted: '#8b7d6b', borderMain: '#e8e0d5',
    isDark: false
  },
  black: { 
    name: 'Pure Black',
    primary: '#ffffff', hover: '#f1f5f9', rgb: '255, 255, 255', 
    c100: '#334155', c500: '#94a3b8', c600: '#cbd5e1', c700: '#f1f5f9',
    bgBody: '#000000', bgSurface: '#111111', bgHover: '#222222',
    textMain: '#ffffff', textMuted: '#a1a1aa', borderMain: '#333333',
    isDark: true
  }
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => localStorage.getItem('erp_theme') || 'blue');

  useEffect(() => {
    localStorage.setItem('erp_theme', themeName);
    const theme = themes[themeName] || themes.blue;
    const root = document.documentElement;
    
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-hover', theme.hover);
    root.style.setProperty('--theme-primary-rgb', theme.rgb);
    root.style.setProperty('--theme-100', theme.c100);
    root.style.setProperty('--theme-500', theme.c500);
    root.style.setProperty('--theme-600', theme.c600);
    root.style.setProperty('--theme-700', theme.c700);
    
    root.style.setProperty('--bg-body', theme.bgBody);
    root.style.setProperty('--bg-surface', theme.bgSurface);
    root.style.setProperty('--bg-hover', theme.bgHover);
    root.style.setProperty('--text-main', theme.textMain);
    root.style.setProperty('--text-muted', theme.textMuted);
    root.style.setProperty('--border-main', theme.borderMain);
    
    // Update body background globally
    document.body.style.backgroundColor = theme.bgBody;
    document.body.style.color = theme.textMain;
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
