import React from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import {
    ShieldCheck,
    BarChart3,
    Users,
    Settings,
    Activity,
    LogOut,
    User as UserIcon,
    Menu,
    ChevronRight,
    FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AdminLayout() {
    const { user, logout, loading } = useAuth();
    const { lang } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    // If still loading auth state, show nothing or a spinner
    if (loading) return null;

    // Redirect if not authenticated or not admin
    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    const menuItems = [
        {
            id: 'dashboard',
            path: '/admin/dashboard',
            label: lang === 'en' ? 'System Overview' : 'የሲስተም አጠቃላይ እይታ',
            icon: BarChart3
        },
        {
            id: 'users',
            path: '/admin/users',
            label: lang === 'en' ? 'User Management' : 'ተጠቃሚዎች',
            icon: Users
        },
        {
            id: 'services',
            path: '/admin/services',
            label: lang === 'en' ? 'Service Management' : 'አገልግሎቶች',
            icon: Activity
        },
        {
            id: 'reports',
            path: '/admin/reports',
            label: lang === 'en' ? 'Reports' : 'ሪፖርቶች',
            icon: FileText
        },
        {
            id: 'questions',
            path: '/admin/questions',
            label: lang === 'en' ? 'Questions' : 'ጥያቄዎች',
            icon: Users
        },
        {
            id: 'settings',
            path: '/admin/settings',
            label: lang === 'en' ? 'System Settings' : 'ቅንብሮች',
            icon: Settings
        },
    ];

    const getPageTitle = () => {
        const currentPath = location.pathname;
        const item = menuItems.find(item => item.path === currentPath);
        if (item) return item.label;
        if (currentPath === '/admin') return 'Overview';
        return 'Admin Portal';
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background w-full">
                <Sidebar className="border-r border-border bg-card">
                    <SidebarHeader className="p-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-black text-sm uppercase leading-none truncate">
                                    {lang === 'en' ? 'Admin Panel' : 'አስተዳዳሪ ፓነል'}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate">
                                    Digital Service
                                </span>
                            </div>
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="p-4">
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={location.pathname === item.path}
                                        onClick={() => navigate(item.path)}
                                        className="gap-4 h-12 font-bold"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="truncate">{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter className="p-6 border-t border-border">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-4 text-destructive font-bold h-10 px-3 hover:bg-destructive/10"
                            onClick={logout}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>{lang === 'en' ? 'Log Out' : 'ውጣ'}</span>
                        </Button>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="lg:hidden" />
                            <Badge className="bg-primary/5 text-primary border-none px-4 py-1 font-bold hidden sm:flex">
                                LIVE SYSTEM
                            </Badge>
                            <h2 className="text-xl font-black truncate">
                                {getPageTitle()}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Separator orientation="vertical" className="h-8 mx-2" />
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-black text-foreground">{user?.name}</div>
                                    <div className="text-[10px] font-bold text-destructive uppercase">Admin</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive font-black">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="p-8 overflow-y-auto flex-1 bg-muted/5">
                        <div className="max-w-6xl mx-auto">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
