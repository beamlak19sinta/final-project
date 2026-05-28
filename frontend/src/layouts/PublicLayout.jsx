import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
    Building2,
    Globe,
    Menu,
    X,
    Facebook,
    Twitter,
    Linkedin,
    Phone,
    Mail,
    MapPin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { translations } from '../lib/translations';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';

export default function PublicLayout() {
    const { lang, setLang } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const t = translations[lang];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/20 flex flex-col">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-11 h-11 object-contain" />
                        <span className="text-xl font-bold tracking-tight hidden sm:block">
                            {lang === 'en' ? 'Dagmawi Menelik' : 'ዳግማዊ ምኒልክ'}
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            <a href="/#services" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wide">{t.navServices}</a>
                            <a href="/#about" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wide">{t.navAbout}</a>
                            <a href="/#contact" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wide">{t.navContact}</a>
                        </div>

                        <div className="h-6 w-px bg-border mx-2" />

                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            <Button variant="outline" size="sm" onClick={() => setLang(lang === 'en' ? 'am' : 'en')} className="flex items-center gap-2 rounded-full font-bold border-border">
                                <Globe className="w-4 h-4" />
                                {lang === 'en' ? 'አማርኛ' : 'English'}
                            </Button>

                            <Link to="/login">
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 shadow-sm">
                                    {t.navPortal}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <button className="md:hidden p-2 text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border p-6 space-y-4 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col gap-4">
                            <a href="/#services" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold">{t.navServices}</a>
                            <a href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold">{t.navAbout}</a>
                            <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold">{t.navContact}</a>
                            <div className="h-px bg-border w-full" />
                            <div className="flex items-center justify-between">
                                <ThemeToggle />
                                <Button variant="outline" size="sm" onClick={() => { setLang(lang === 'en' ? 'am' : 'en'); setIsMobileMenuOpen(false); }} className="gap-2">
                                    <Globe className="w-4 h-4" />
                                    {lang === 'en' ? 'አማርኛ' : 'English'}
                                </Button>
                            </div>
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full bg-primary">{t.navPortal}</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="pt-24 bg-background border-t border-border">
                <div className="w-full bg-slate-950 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
                    <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10">
                        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
                            <div className="lg:col-span-5 space-y-8">
                                <div className="flex items-center gap-3">
                                    <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                                    <span className="text-2xl font-black tracking-tight uppercase">Dagmawi Menelik</span>
                                </div>
                                <p className="text-white/60 text-lg leading-relaxed max-w-md italic">{t.footerSlogan}</p>
                                <div className="flex gap-4">
                                    {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                                        <button key={i} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 border border-white/10">
                                            <Icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                                <div className="space-y-6">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-neutral-200">{lang === 'en' ? 'Quick Links' : 'አቋራጭ ሊንኮች'}</h4>
                                    <ul className="space-y-4 text-sm font-semibold text-white/60">
                                        <li><a href="#" className="hover:text-primary transition-colors">{t.navServices}</a></li>
                                        <li><a href="#" className="hover:text-primary transition-colors">{t.navAbout}</a></li>
                                        <li><a href="#" className="hover:text-primary transition-colors">{lang === 'en' ? 'Latest News' : 'ወቅታዊ መረጃዎች'}</a></li>
                                        <li><a href="#" className="hover:text-primary transition-colors">{lang === 'en' ? 'Office Map' : 'ቢሮ አድራሻ'}</a></li>
                                    </ul>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-neutral-200">{lang === 'en' ? 'Support' : 'እገዛ'}</h4>
                                    <ul className="space-y-4 text-sm font-semibold text-white/60">
                                        <li className="flex items-start gap-3"><Phone className="w-4 h-4 text-neutral-200 shrink-0" /> +251 58 220 XXXX</li>
                                        <li className="flex items-start gap-3"><Mail className="w-4 h-4 text-neutral-200 shrink-0" /> info@dms.gov.et</li>
                                        <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-neutral-200 shrink-0" /> Bahir Dar, Ethiopia</li>
                                    </ul>
                                </div>
                                <div className="space-y-6 col-span-2 sm:col-span-1">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-neutral-200">{lang === 'en' ? 'Office Hours' : 'የስራ ሰዓት'}</h4>
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                        <div>
                                            <div className="text-[10px] font-bold text-white/40 uppercase mb-1">{lang === 'en' ? 'Weekdays' : 'የስራ ቀናት'}</div>
                                            <div className="font-black text-white">8:30 AM - 5:30 PM</div>
                                        </div>
                                        <div className="h-px bg-white/10" />
                                        <div>
                                            <div className="text-[10px] font-bold text-white/40 uppercase mb-1">{lang === 'en' ? 'Saturday' : 'ቅዳሜ'}</div>
                                            <div className="font-black text-white">9:00 AM - 12:00 PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
