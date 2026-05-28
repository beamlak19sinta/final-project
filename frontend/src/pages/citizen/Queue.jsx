import React, { useState } from 'react';
import { useCitizenData } from '../../hooks/useCitizenData';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import { translations } from '../../lib/translations';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Ticket,
    Clock,
    AlertCircle,
    History,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Queue() {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;
    const { activeQueue, queueHistory, sectors, loading, refresh } = useCitizenData();
    const { showToast } = useToast();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCancelTicket = async () => {
        setIsCancelling(true);
        try {
            await api.delete(`/queues/${activeQueue.id}`);
            showToast(lang === 'en' ? 'Ticket cancelled' : 'ቲኬት ተሰርዟል', 'info');
            setShowCancelDialog(false);
            await refresh();
        } catch {
            showToast(lang === 'en' ? 'Failed to cancel ticket' : 'ቲኬት መሰረዝ አልተሳካም', 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleTakeTicket = async (serviceId) => {
        try {
            await api.post('/queues/take', { serviceId });
            showToast(lang === 'en' ? 'Ticket taken successfully!' : 'ቲኬት በተሳካ ሁኔታ ተወስዷል!', 'success');
            await refresh();
        } catch (err) {
            showToast(err.response?.data?.message || (lang === 'en' ? 'Failed to take ticket' : 'ቲኬት መውሰድ አልተሳካም'), 'error');
        }
    };

    if (loading) return <div className="animate-pulse space-y-8"><div className="h-64 bg-muted rounded-[40px]" /></div>;

    const queueAvailableServices = (sectors || []).flatMap(s =>
        (s.services || []).filter(ser => ser.mode === 'QUEUE').map(ser => ({ ...ser, sectorName: s.name }))
    );
    const filteredQuickTake = queueAvailableServices.filter(s => {
        const localizedName = t[s.name] || s.name;
        return localizedName.toLowerCase().includes(searchTerm.toLowerCase()) || s.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-black tracking-tight">
                    {lang === 'en' ? 'Digital Queue' : 'ዲጂታል ወረፋ'}
                </h2>
                <p className="text-muted-foreground font-semibold">
                    {lang === 'en' ? 'Track your position and take new tickets.' : 'የተርታ ቁጥርዎን ይከታተሉ እና አዲስ ቲኬቶችን ይውሰዱ።'}
                </p>
            </div>

            {/* Active Ticket Section */}
            {activeQueue ? (
                <Card className="bg-primary text-primary-foreground border-none rounded-[40px] shadow-2xl shadow-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <Badge className={`${activeQueue.status === 'CALLING' || activeQueue.status === 'PROCESSING' ? 'bg-orange-500 animate-pulse' : 'bg-white/20'} text-white font-bold px-4 py-1.5 border-none`}>
                            {activeQueue.status === 'CALLING' ? (lang === 'en' ? 'YOUR TURN! GO TO COUNTER' : 'የእርስዎ ተራ ነው! ወደ መስኮቱ ይሂዱ') :
                                activeQueue.status === 'PROCESSING' ? (lang === 'en' ? 'CURRENTLY SERVING' : 'አሁን እየተገለገሉ ነው') : (lang === 'en' ? 'Active Ticket' : 'ንቁ ተርታ')}
                        </Badge>
                        <h3 className="text-3xl font-black">{t[activeQueue.service?.name] || activeQueue.service?.name}</h3>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 opacity-70" />
                                <span className="font-bold">
                                    {lang === 'en' ? `Est. Wait: ${(activeQueue.peopleAhead || 0) * 5} mins` : `የሚገመት የጥበቃ ጊዜ: ${(activeQueue.peopleAhead || 0) * 5} ደቂቃ`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Ticket className="w-5 h-5 opacity-70" />
                                <span className="font-bold">
                                    {lang === 'en' ? 'Sector' : 'ክፍል'}: {t[activeQueue.service?.sector?.name] || activeQueue.service?.sector?.name}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold h-10 mt-4"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            {lang === 'en' ? 'Cancel Ticket' : 'ቲኬት ሰርዝ'}
                        </Button>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-[10px] font-black uppercase opacity-70 mb-2">
                                {lang === 'en' ? 'Your Number' : 'የእርስዎ ቁጥር'}
                            </div>
                            <div className="text-7xl font-black leading-none">{activeQueue.ticketNumber}</div>
                        </div>
                        <div className="w-px h-16 bg-white/20 hidden md:block" />
                        <div className="text-center">
                            <div className="text-[10px] font-black uppercase opacity-70 mb-2">
                                {lang === 'en' ? 'People Ahead' : 'ከፊት ያሉ ሰዎች'}
                            </div>
                            <div className="text-7xl font-black leading-none">{activeQueue.peopleAhead || 0}</div>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="border-dashed border-2 rounded-[40px] p-8 bg-muted/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                                <Ticket className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black">
                                    {lang === 'en' ? 'No Active Ticket' : 'ንቁ ቲኬት የለም'}
                                </h3>
                                <p className="text-muted-foreground font-semibold">
                                    {lang === 'en' ? 'Ready to be served? Take a ticket below.' : 'ለመገልገል ዝግጁ ነዎት? ከታች ቲኬት ይውሰዱ።'}
                                </p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={lang === 'en' ? 'Search queue services...' : 'የሰልፍ አገልግሎቶችን ፈልግ...'}
                                className="pl-10 rounded-xl bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                        {filteredQuickTake.map((service, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                className="h-auto py-4 px-6 rounded-2xl flex flex-col items-center gap-2 border-border hover:border-primary hover:bg-primary/5 transition-all w-full"
                                onClick={() => handleTakeTicket(service.id)}
                            >
                                <span className="font-black text-center whitespace-normal break-words">{t[service.name] || service.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">{t[service.sectorName] || service.sectorName}</span>
                            </Button>
                        ))}
                    </div>
                </Card>
            )}

            {/* Queue History */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-black">
                        {lang === 'en' ? 'Recent History' : 'የቅርብ ጊዜ ታሪክ'}
                    </h3>
                </div>
                {queueHistory.length > 0 ? (
                    <div className="grid gap-4">
                        {queueHistory.map((req, i) => (
                            <Card key={i} className="rounded-3xl p-6 border-border bg-card flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                        #{req.ticketNumber}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">{t[req.service?.name] || req.service?.name}</h4>
                                        <p className="text-sm text-muted-foreground font-semibold">{new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Badge variant={req.status === 'COMPLETED' ? 'success' : req.status === 'REJECTED' ? 'destructive' : req.status === 'CANCELLED' ? 'secondary' : 'secondary'} className="rounded-lg font-bold">
                                    {t[req.status] || req.status}
                                </Badge>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="rounded-[32px] p-10 border-border bg-card text-center text-muted-foreground font-bold italic">
                        {lang === 'en' ? 'No previous queue history found.' : 'ምንም የሰልፍ ታሪክ አልተገኘም።'}
                    </Card>
                )}
            </div>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="sm:max-w-[400px] rounded-[32px] p-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-center">
                                {lang === 'en' ? 'Cancel Ticket?' : 'ቲኬት ይሰረዝ?'}
                            </DialogTitle>
                            <DialogDescription className="text-center font-semibold text-muted-foreground">
                                {lang === 'en' ? 'Are you sure you want to release your spot in the queue? This action cannot be undone.' : 'እርግጠኛ ነዎት ከተርታ መውጣት ይፈልጋሉ? ይህ ድርጊት ሊመለስ አይችልም።'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button variant="ghost" className="flex-1 rounded-2xl font-bold h-12" onClick={() => setShowCancelDialog(false)}>
                            {lang === 'en' ? 'Keep Ticket' : 'ቲኬት አቆይ'}
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 rounded-2xl font-black h-12 shadow-lg shadow-destructive/20"
                            onClick={handleCancelTicket}
                            disabled={isCancelling}
                        >
                            {isCancelling ? (lang === 'en' ? 'Cancelling...' : 'በመሰረዝ ላይ...') : (lang === 'en' ? 'Yes, Cancel' : 'አዎ፣ ሰርዝ')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}