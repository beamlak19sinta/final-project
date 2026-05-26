import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

export default function LanguageToggle() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'am' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    return (
        <Button variant="outline" size="sm" onClick={toggleLanguage} className="font-bold">
            {i18n.language === 'en' ? 'አማ' : 'EN'}
        </Button>
    );
}
