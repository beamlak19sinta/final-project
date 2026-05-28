import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'am');

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    const toggleLang = () => {
        setLang(prev => prev === 'en' ? 'am' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
