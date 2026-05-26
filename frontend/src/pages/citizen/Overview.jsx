import React from 'react';
import { useCitizenData } from '../../hooks/useCitizenData';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    Ticket,
    MapPin,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Overview() {
    const { user } = useAuth();
    const { lang } = useLanguage();
    const { activeQueue, appointments, loading } = useCitizenData();
    const navigate = useNavigate();

    const firstName = user?.name?.split(' ')[0] || (lang === 'en' ? 'Citizen' : 'ዜጋ');

    if (loading) {
        return (
            <div className="flex flex-col gap-8 animate-pulse">
                <div className="h-20 bg-muted rounded-3xl w-3/4" />
                <div className="h-64 bg-muted rounded-[40px]" />
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-48 bg-muted rounded-3xl" />
                    <div className="h-48 bg-muted rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight mb-2">
                    {lang === 'en' ? `Welcome back, ${firstName}!` : `እንኳን ደህና መጡ፣ ${firstName}!`}
                    </h2>
                    <p className="text-muted-foreground font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Bahir Dar City Portal
                    </p>
                </div>
                <div className="bg-primary/5 px-6 py-4 rounded-3xl border border-primary/10 text-right w-full md:w-auto">
                    <div className="text-xs font-black text-primary uppercase mb-1">Status</div>
                    <div className="text-2xl font-black">Online</div>
                </div>
            </div>

            {/* Active Queue Card */}
            {activeQueue ? (
                <Card className="bg-primary text-primary-foreground border-none rounded-[40px] shadow-2xl shadow-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-transform hover:scale-[1.01]">
                    <div className="space-y-4">
                        <Badge className={`${activeQueue.status === 'CALLING' || activeQueue.status === 'PROCESSING' ? 'bg-orange-500 animate-pulse' : 'bg-white/20'} text-white font-bold px-4 py-1.5 border-none`}>
                            {activeQueue.status === 'CALLING' ? 'YOUR TURN! GO TO COUNTER' :
                                activeQueue.status === 'PROCESSING' ? 'CURRENTLY SERVING' : 'Active Ticket'}
                        </Badge>
                        <h3 className="text-3xl font-black">{activeQueue.service?.name}</h3>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 opacity-70" />
                                <span className="font-bold">Est. Wait: {(activeQueue.peopleAhead || 0) * 5} mins</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Ticket className="w-5 h-5 opacity-70" />
                                <span className="font-bold">Sector: {activeQueue.service?.sector?.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-[10px] font-black uppercase opacity-70 mb-2">Your Number</div>
                            <div className="text-7xl font-black leading-none">{activeQueue.ticketNumber}</div>
                        </div>
                        <div className="w-px h-16 bg-white/20 hidden md:block" />
                        <div className="text-center">
                            <div className="text-[10px] font-black uppercase opacity-70 mb-2">People Ahead</div>
                            <div className="text-7xl font-black leading-none">{activeQueue.peopleAhead || 0}</div>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="border-dashed border-2 rounded-[40px] p-10 flex flex-col items-center justify-center text-center space-y-4 bg-muted/5">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Ticket className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black">No Active Tickets</h3>
                        <p className="text-muted-foreground font-semibold">Need a service? Take a digital queue ticket now.</p>
                    </div>
                    <Button
                        onClick={() => navigate('/dashboard/queue')}
                        className="rounded-2xl font-black px-8 h-12 shadow-lg shadow-primary/20"
                    >
                        Take a Ticket
                    </Button>
                </Card>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* Upcoming Appointment */}
                <Card className="rounded-[32px] p-6 bg-card border-border">
                    <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">Upcoming Appointment</CardTitle>
                            <CardDescription>Your next scheduled service</CardDescription>
                        </div>
                        <Calendar className="text-primary w-6 h-6" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {appointments.length > 0 ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/30 rounded-2xl border border-border flex items-center justify-between">
                                    <div>
                                        <div className="font-black">{appointments[0].service?.name}</div>
                                        <div className="text-sm text-muted-foreground font-bold">
                                            {new Date(appointments[0].date).toLocaleDateString()} at {appointments[0].timeSlot}
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="font-bold">{appointments[0].status}</Badge>
                                </div>
                                <Button variant="ghost" className="w-full gap-2 font-bold" onClick={() => navigate('/dashboard/appointments')}>
                                    View All <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        ):
(
                            <div className="text-center py-6 space-y-3">
                                <p className="text-sm text-muted-foreground font-semibold italic">No upcoming appointments.</p>
                                <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => navigate('/dashboard/appointments')}>
                                    Book Now
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Shortcuts */}
                <Card className="rounded-[32px] p-6 bg-card border-border">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                        <CardDescription>Navigate directly to key services</CardDescription>
                    </CardHeader>
                    {/* Add your quick action buttons here if needed */}
                </Card>
            </div>
        </div>
    );
}