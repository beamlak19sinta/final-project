import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import {
    Users,
    FileText,
    LogOut,
    Building2,
    Calendar,
    Search,
    ChevronDown,
    User,
    History as HistoryIcon
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from '../components/ThemeToggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OfficerLayout() {
    const { user, logout } = useAuth();
    const { lang, setLang } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const t = translations[lang];

    const menuItems = [
        ...(user?.role === 'HELP_DESK' || user?.role === 'HELPDESK' ? [{
            id: 'helpdesk',
            path: '/help-desk',
            label: lang === 'en' ? 'Help Desk' : 'እገዛ ጠረጴዛ',
            icon: FileText
        }] : []),
        {
            id: 'queue',
            path: '/officer/queue',
            label: lang === 'en' ? 'Queue Management' : 'የወረፋ አስተዳደር',
            icon: Users
        },
        {
            id: 'requests',
            path: '/officer/requests',
            label: lang === 'en' ? 'Service Requests' : 'የአገልግሎት ጥያቄዎች',
            icon: FileText
        },
        {
            id: 'appointments',
            path: '/officer/appointments',
            label: lang === 'en' ? 'Appointments' : 'ቀጠሮዎች',
            icon: Calendar
        },
        {
            id: 'history',
            path: '/officer/history',
            label: lang === 'en' ? 'History' : 'ታሪክ',
            icon: HistoryIcon
        },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon" className="bg-card sticky top-0 self-start">
                <SidebarHeader className="p-4">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                            <span className="font-black text-lg uppercase tracking-tight leading-none">
                                {lang === 'en' ? 'Officer Portal' : 'የሰራተኛ መግቢያ'}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                Dagmawi Menelik
                            </span>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-2 pt-6">
                    <SidebarGroup>
                        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden mb-2">
                            {lang === 'en' ? 'Main Menu' : 'ዋና ምናሌ'}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={location.pathname === item.path}
                                        onClick={() => navigate(item.path)}
                                        tooltip={item.label}
                                    >
                                        <item.icon />
                                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="p-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={handleLogout}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                tooltip={t.logout}
                            >
                                <LogOut />
                                <span className="group-data-[collapsible=icon]:hidden">{t.logout}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset className="flex flex-col">
                <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md px-6 md:px-10 flex items-center justify-between shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="relative w-64 md:w-96 hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={lang === 'en' ? "Search..." : "ፈልግ..."}
                                className="pl-10 h-10 rounded-xl border-border bg-muted/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-full font-bold border-border px-3">
                                    {lang === 'en' ? 'English' : 'አማርኛ'}
                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setLang('en')}>English</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLang('am')}>አማርኛ</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-8 w-px bg-border mx-1" />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-black text-foreground">{user?.name}</div>
                                <div className="text-[10px] font-bold text-primary uppercase">
                                    {user?.role === 'OFFICER'
                                        ? (lang === 'en' ? 'Officer' : 'ሰራተኛ')
                                        : (user?.role === 'HELP_DESK' || user?.role === 'HELPDESK')
                                            ? (lang === 'en' ? 'Help Desk' : 'እገዛ ጠረጴዛ')
                                            : user?.role}
                                </div>
                            </div>
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
                                <User className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-muted/5">
                    <div className="container py-10 px-6 md:px-10 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
