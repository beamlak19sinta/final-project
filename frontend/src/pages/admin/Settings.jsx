import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import {
    Settings as SettingsIcon,
    Moon,
    Globe,
    Clock,
    Shield,
    Save,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ThemeToggle from '../../components/ThemeToggle';

export default function Settings() {
    const { lang } = useLanguage();
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [workingHours, setWorkingHours] = useState({
        start: '08:30',
        end: '17:30',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/admin/settings');
                if (data.workingHours) {
                    setWorkingHours(data.workingHours);
                }
            } catch (err) {
                console.error('Failed to fetch settings', err);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveSchedule = async () => {
        setIsSaving(true);
        try {
            await api.patch('/admin/settings', {
                key: 'workingHours',
                value: workingHours
            });
            showToast('Schedule saved successfully', 'success');
        } catch (err) {
            console.error('Failed to save settings', err);
            showToast('Failed to save schedule', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const days = [
        { id: 'Mon', label: 'Monday' },
        { id: 'Tue', label: 'Tuesday' },
        { id: 'Wed', label: 'Wednesday' },
        { id: 'Thu', label: 'Thursday' },
        { id: 'Fri', label: 'Friday' },
        { id: 'Sat', label: 'Saturday' },
        { id: 'Sun', label: 'Sunday' },
    ];

    const toggleDay = (dayId) => {
        setWorkingHours(prev => {
            if (prev.days.includes(dayId)) {
                return { ...prev, days: prev.days.filter(d => d !== dayId) };
            } else {
                return { ...prev, days: [...prev.days, dayId] };
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl font-black tracking-tight">{lang === 'en' ? 'System Settings' : 'የሲስተም ቅንብሮች'}</h1>
                <p className="text-muted-foreground font-semibold mt-2">
                    {lang === 'en' ? 'Configure global system behavior and preferences.' : 'ዓለም አቀፍ የሲስተም ባህሪ እና ምርጫዎችን ያዋቅሩ።'}
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Working Hours Configuration */}
                <Card className="rounded-[32px] border-border bg-card shadow-sm">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black">Working Hours</CardTitle>
                                <CardDescription className="font-bold">Set the standard operating hours for queues.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground">Start Time</label>
                                <Input
                                    type="time"
                                    className="h-12 rounded-xl font-bold bg-muted/20 border-border"
                                    value={workingHours.start}
                                    onChange={e => setWorkingHours({ ...workingHours, start: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground">End Time</label>
                                <Input
                                    type="time"
                                    className="h-12 rounded-xl font-bold bg-muted/20 border-border"
                                    value={workingHours.end}
                                    onChange={e => setWorkingHours({ ...workingHours, end: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-muted-foreground">Active Days</label>
                            <div className="flex flex-wrap gap-2">
                                {days.map(day => (
                                    <button
                                        key={day.id}
                                        onClick={() => toggleDay(day.id)}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${workingHours.days.includes(day.id)
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            className="w-full rounded-xl font-black h-12 gap-2 mt-4"
                            onClick={handleSaveSchedule}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save Schedule
                        </Button>
                    </CardContent>
                </Card>

                {/* System Configuration */}
                <div className="space-y-8">
                    <Card className="rounded-[32px] border-border bg-card shadow-sm">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black">Localization</CardTitle>
                                    <CardDescription className="font-bold">Manage system language and regions.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border">
                                <div>
                                    <p className="font-black">Default Language</p>
                                    <p className="text-xs font-bold text-muted-foreground">Current: {lang === 'en' ? 'English' : 'Amharic'}</p>
                                </div>
                                {/* In a real app this would change global default, not just local session */}
                                <Badge variant="outline" className="font-bold">
                                    {lang === 'en' ? 'English' : 'Amharic'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[32px] border-border bg-card shadow-sm">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                                    <Moon className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black">Appearance</CardTitle>
                                    <CardDescription className="font-bold">Customize the look and feel.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border">
                                <div>
                                    <p className="font-black">Theme Mode</p>
                                    <p className="text-xs font-bold text-muted-foreground">Switch light/dark theme</p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
