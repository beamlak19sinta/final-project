import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
    LogOut,
    Users,
    Play,
    CheckCircle,
    XCircle,
    Building2,
    Users2,
    Bell,
    Search,
    RefreshCcw,
    ArrowRight,
    User as UserIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import { translations } from '../lib/translations';

export default function OfficerDashboard() {
    const { user, logout } = useAuth();
    const { lang, setLang } = useLanguage();
    const t = translations[lang];
    const navigate = useNavigate();
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [queues, setQueues] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('live'); // 'live', 'appointments', or 'requests'
    const [walkInForm, setWalkInForm] = useState({ name: '', phoneNumber: '', serviceId: '' });
    const [showWalkIn, setShowWalkIn] = useState(false);

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const { data } = await api.get('/services/sectors');
                setSectors(data);
                if (data.length > 0) setSelectedSector(data[0]);
            } catch (err) {
                console.error('Failed to fetch sectors', err);
            }
        };
        fetchSectors();
    }, []);

    const fetchQueue = async () => {
        if (!selectedSector) return;
        setLoading(true);
        try {
            const [queueRes, appRes, reqRes] = await Promise.all([
                api.get(`/queues/list/${selectedSector.id}`),
                api.get(`/appointments/sector/${selectedSector.id}`),
                api.get(`/requests/sector/${selectedSector.id}`)
            ]);
            setQueues(queueRes.data);
            setAppointments(appRes.data);
            setRequests(reqRes.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, [selectedSector]);

    const handleUpdateRequestStatus = async (requestId, status) => {
        try {
            await api.patch(`/requests/status/${requestId}`, { status });
            fetchQueue();
        } catch (err) {
            console.error('Failed to update request status', err);
        }
    };

    const handleUpdateStatus = async (queueId, status) => {
        try {
            await api.patch(`/queues/status/${queueId}`, { status });
            fetchQueue();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleWalkInSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/queues/register-walkin', walkInForm);
            setShowWalkIn(false);
            setWalkInForm({ name: '', phoneNumber: '', serviceId: '' });
            fetchQueue();
        } catch (err) {
            console.error('Walk-in failed', err);
            alert(err.response?.data?.message || 'Walk-in registration failed');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background flex relative">
            {/* Sidebar */}
            <aside className="w-80 border-r border-border bg-card hidden lg:flex flex-col p-8 space-y-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                        <Building2 className="text-primary-foreground w-7 h-7" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-lg uppercase leading-none">{t.offPortal}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Dagmawi Menelik</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-4">Active Sector</h3>
                    <div className="space-y-2">
                        {sectors.map((sector) => (
                            <Button
                                key={sector.id}
                                variant={selectedSector?.id === sector.id ? 'secondary' : 'ghost'}
                                className={`w-full justify-start gap-4 h-14 rounded-2xl font-bold transition-all ${selectedSector?.id === sector.id ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-muted-foreground'}`}
                                onClick={() => setSelectedSector(sector)}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedSector?.id === sector.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <Users2 className="w-4 h-4" />
                                </div>
                                {sector.name}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto">
                    <Button variant="ghost" className="w-full justify-start gap-4 text-destructive font-bold h-12 rounded-xl" onClick={handleLogout}>
                        <LogOut className="w-5 h-5" />
                        {t.logout}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-muted/5">
                <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button variant="outline" size="sm" onClick={() => setLang(lang === 'en' ? 'am' : 'en')} className="rounded-full font-bold border-border">
                            {lang === 'en' ? 'አማርኛ' : 'English'}
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full gap-2 font-bold" onClick={fetchQueue}>
                            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
                        </Button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-sm font-black text-foreground">{user?.name}</div>
                            <div className="text-[10px] font-bold text-accent uppercase">{user?.role}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-black">
                            <UserIcon className="w-6 h-6" />
                        </div>
                    </div>
                </header>

                <div className="p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Tab Switcher */}
                        <div className="flex gap-4 mb-2">
                            <Button
                                variant={activeTab === 'live' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('live')}
                                className="rounded-2xl px-6 font-black"
                            >
                                LIVE QUEUE
                            </Button>
                            <Button
                                variant={activeTab === 'appointments' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('appointments')}
                                className="rounded-2xl px-6 font-black"
                            >
                                APPOINTMENTS <Badge className="ml-2 bg-white/20">{appointments.length}</Badge>
                            </Button>
                            <Button
                                variant={activeTab === 'requests' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('requests')}
                                className="rounded-2xl px-6 font-black"
                            >
                                ONLINE REQUESTS <Badge className="ml-2 bg-white/20">{requests.length}</Badge>
                            </Button>
                        </div>

                        {activeTab === 'live' ? (
                            <>
                                {/* Action Bar */}
                                <div className="flex justify-between items-center bg-card p-6 rounded-[32px] border border-border">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-primary/10 rounded-2xl">
                                            <Users className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-black">{t.offNowServing}: {queues.find(q => q.status === 'CALLING')?.ticketNumber || (lang === 'en' ? 'None' : 'ምንም')}</div>
                                            <div className="text-sm font-bold text-muted-foreground">Queue is active in {selectedSector?.name}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        {(user?.role === 'HELPDESK' || user?.role === 'HELP_DESK') && (
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="rounded-2xl h-14 px-8 font-bold gap-3"
                                                onClick={() => setShowWalkIn(true)}
                                            >
                                                <Users2 className="w-5 h-5" /> {t.offRegisterWalkin?.toUpperCase()}
                                            </Button>
                                        )}
                                        <Button
                                            size="lg"
                                            className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 font-black gap-3 shadow-xl shadow-primary/20"
                                            onClick={() => queues[0] && handleUpdateStatus(queues[0].id, 'CALLING')}
                                            disabled={queues.length === 0 || queues.some(q => q.status === 'CALLING')}
                                        >
                                            {t.offCallNext?.toUpperCase()} <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Queue Table */}
                                <Card className="rounded-[40px] border-border overflow-hidden">
                                    <div className="p-8 border-b border-border flex justify-between items-center">
                                        <h3 className="text-2xl font-black">Live Queue Monitor</h3>
                                        <Button variant="outline" size="sm" className="rounded-full gap-2 font-bold" onClick={() => setSelectedSector({ ...selectedSector })}>
                                            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                                        </Button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-muted/30">
                                                    <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground"># Ticket</th>
                                                    <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Citizen</th>
                                                    <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Service</th>
                                                    <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                                    <th className="px-8 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {queues.map((q) => (
                                                    <tr key={q.id} className={`hover:bg-muted/20 transition-colors ${q.status === 'CALLING' ? 'bg-primary/5' : ''}`}>
                                                        <td className="px-8 py-6">
                                                            <div className="text-2xl font-black text-primary">#{q.ticketNumber}</div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="font-bold">{q.user?.name}</div>
                                                            <div className="text-xs text-muted-foreground">{q.user?.phoneNumber}</div>
                                                        </td>
                                                        <td className="px-8 py-6 font-semibold">{q.service?.name}</td>
                                                        <td className="px-8 py-6">
                                                            <Badge className={`rounded-lg px-3 py-1 font-bold ${q.status === 'CALLING' ? 'bg-orange-500 text-white' :
                                                                q.status === 'PROCESSING' ? 'bg-blue-500 text-white' :
                                                                    'bg-muted text-muted-foreground'
                                                                }`}>
                                                                {q.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {q.status === 'CALLING' ? (
                                                                    <Button size="sm" className="rounded-xl font-bold bg-green-600 hover:bg-green-700 gap-2" onClick={() => handleUpdateStatus(q.id, 'PROCESSING')}>
                                                                        <Play className="w-4 h-4" /> Start
                                                                    </Button>
                                                                ) : q.status === 'PROCESSING' ? (
                                                                    <Button size="sm" className="rounded-xl font-bold bg-primary hover:bg-primary/90 gap-2" onClick={() => handleUpdateStatus(q.id, 'COMPLETED')}>
                                                                        <CheckCircle className="w-4 h-4" /> Complete
                                                                    </Button>
                                                                ) : (
                                                                    <Button size="sm" variant="outline" className="rounded-xl font-bold gap-2" onClick={() => handleUpdateStatus(q.id, 'CALLING')}>
                                                                        Call
                                                                    </Button>
                                                                )}
                                                                <Button size="sm" variant="ghost" className="rounded-xl font-bold text-destructive" onClick={() => handleUpdateStatus(q.id, 'REJECTED')}>
                                                                    <XCircle className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {queues.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="px-8 py-20 text-center text-muted-foreground font-bold italic">
                                                            No pending tickets found for this sector.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </>
                        ) : activeTab === 'appointments' ? (
                            <Card className="rounded-[40px] border-border overflow-hidden">
                                <div className="p-8 border-b border-border flex justify-between items-center">
                                    <h3 className="text-2xl font-black">Scheduled Appointments</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-muted/30">
                                                <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Citizen</th>
                                                <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Service</th>
                                                <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Date & Time</th>
                                                <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {appointments.map((app) => (
                                                <tr key={app.id} className="hover:bg-muted/20">
                                                    <td className="px-8 py-6">
                                                        <div className="font-bold">{app.user?.name}</div>
                                                        <div className="text-xs text-muted-foreground">{app.user?.phoneNumber}</div>
                                                    </td>
                                                    <td className="px-8 py-6 font-semibold">{app.service?.name}</td>
                                                    <td className="px-8 py-6">
                                                        <div className="font-bold">{new Date(app.date).toLocaleDateString()}</div>
                                                        <div className="text-xs text-muted-foreground">{app.timeSlot}</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <Badge variant="outline" className="rounded-lg px-3 py-1 font-bold">
                                                            {app.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                            {appointments.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="px-8 py-20 text-center text-muted-foreground font-bold italic">
                                                        No appointments scheduled for this sector.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        ) : (
                            <Card className="rounded-[40px] border-border overflow-hidden">
                                <div className="p-8 border-b border-border flex justify-between items-center">
                                    <h3 className="text-2xl font-black">Online Service Requests</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-muted/30">
                                                <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Citizen</th>
                                                <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Service</th>
                                                <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Submitted</th>
                                                <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                                <th className="px-8 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {requests.map((req) => (
                                                <tr key={req.id} className="hover:bg-muted/20">
                                                    <td className="px-8 py-6">
                                                        <div className="font-bold">{req.user?.name}</div>
                                                        <div className="text-xs text-muted-foreground">{req.user?.phoneNumber}</div>
                                                    </td>
                                                    <td className="px-8 py-6 font-semibold">{req.service?.name}</td>
                                                    <td className="px-8 py-6 text-sm">
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <Badge variant="secondary" className="rounded-lg px-3 py-1 font-bold">
                                                            {req.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" className="rounded-xl font-bold bg-green-600 hover:bg-green-700" onClick={() => handleUpdateRequestStatus(req.id, 'COMPLETED')}>Approve</Button>
                                                            <Button size="sm" variant="ghost" className="rounded-xl font-bold text-destructive" onClick={() => handleUpdateRequestStatus(req.id, 'REJECTED')}>Reject</Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {requests.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-8 py-20 text-center text-muted-foreground font-bold italic">
                                                        No online requests for this sector.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {/* Walk-in Modal Overlay */}
            {showWalkIn && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md rounded-[40px] p-8 shadow-2xl">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-2xl font-black">Register Walk-in Citizen</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleWalkInSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold px-1">Citizen Name</label>
                                <input
                                    className="w-full h-12 rounded-xl border border-border bg-muted/20 px-4 font-semibold"
                                    placeholder="Full Name"
                                    value={walkInForm.name}
                                    onChange={e => setWalkInForm({ ...walkInForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold px-1">Phone Number</label>
                                <input
                                    className="w-full h-12 rounded-xl border border-border bg-muted/20 px-4 font-semibold"
                                    placeholder="09..."
                                    value={walkInForm.phoneNumber}
                                    onChange={e => setWalkInForm({ ...walkInForm, phoneNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold px-1">Service Type</label>
                                <select
                                    className="w-full h-12 rounded-xl border border-border bg-muted/20 px-4 font-semibold outline-none"
                                    value={walkInForm.serviceId}
                                    onChange={e => setWalkInForm({ ...walkInForm, serviceId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Service</option>
                                    {selectedSector?.services?.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setShowWalkIn(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 rounded-xl h-12 font-black">Register</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
