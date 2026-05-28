import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full w-10 h-10 border-border bg-background shadow-sm hover:bg-muted transition-colors">
            {theme === 'light' ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-foreground" />}
            <span className="sr-only">Toggle Theme</span>
        </Button>
    );
}
