import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    ArrowRight,
    Play,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCcw,
    Send,
    AlertCircle,
    History,
    PlayCircle
} from 'lucide-react';

export default function QueueManagement() {
    const { user } = useAuth();
    const { lang } = useLanguage();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [queues, setQueues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedQueue, setSelectedQueue] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [forwardDialog, setForwardDialog] = useState(false);
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [forwardSectorId, setForwardSectorId] = useState('');

    // Fetch user's sector and queue
    useEffect(() => {
        fetchSectors();
    }, []);

    useEffect(() => {
        if (selectedSector) {
            fetchQueue();
            const interval = setInterval(fetchQueue, 30000); // Auto-refresh every 30s
            return () => clearInterval(interval);
        }
    }, [selectedSector]);

    const fetchSectors = async () => {
        try {
            const { data } = await api.get('/services/sectors');
            setSectors(data);
            if (data.length > 0) {
                setSelectedSector(data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch sectors', err);
        }
    };

    const fetchQueue = async () => {
        if (!selectedSector) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/queues/list/${selectedSector.id}`);
            setQueues(data);
        } catch (err) {
            console.error('Failed to fetch queue', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCallNext = async () => {
        const nextQueue = queues.find(q => q.status === 'WAITING');
        if (!nextQueue) return;

        console.log('CALL NEXT', nextQueue.id, 'CALLING');
        try {
            const { data } = await api.patch(`/queues/${nextQueue.id}/status`, { status: 'CALLING' });
            if (data?.id) {
                setQueues((prev) => prev.map((q) => (q.id === data.id ? { ...q, ...data } : q)));
            }
            showToast(lang === 'en' ? 'Next customer called' : 'ቀጣዩ ተጠራ', 'success');
            await fetchQueue();
        } catch (err) {
            console.error('Failed to call next', err);
            showToast(
                err.response?.data?.message || err.message || 'Failed to call next',
                'error'
            );
        }
    };

    const handleUpdateStatus = async (queueId, status) => {
        if (status === 'COMPLETED') {
            console.log('APPROVE CLICKED', queueId, status);
        } else if (status === 'REJECTED') {
            console.log('REJECT CLICKED', queueId, status);
        } else {
            console.log('QUEUE STATUS CLICKED', queueId, status);
        }

        try {
            const payload = { status };
            if (remarks && (status === 'COMPLETED' || status === 'REJECTED')) {
                payload.remarks = remarks;
            }
            const { data } = await api.patch(`/queues/${queueId}/status`, payload);
            if (data?.id) {
                setQueues((prev) => prev.map((q) => (q.id === data.id ? { ...q, ...data } : q)));
            }
            setRemarks('');
            setSelectedQueue(null);
            showToast(
                lang === 'en' ? `Queue updated to ${status}` : `ወረፋ ወደ ${status} ተዘመነ`,
                'success'
            );
            await fetchQueue();
        } catch (err) {
            console.error('Failed to update queue status', err);
            showToast(
                err.response?.data?.message || err.message || 'Failed to update queue status',
                'error'
            );
        }
    };

    const handleForwardRequest = async () => {
        if (!selectedQueue || !forwardSectorId) return;

        try {
            await api.post(`/queues/forward/${selectedQueue.id}`, {
                targetSectorId: forwardSectorId,
                remarks: remarks || 'Forwarded to another sector'
            });
            setForwardDialog(false);
            setForwardSectorId('');
            setRemarks('');
            setSelectedQueue(null);
            showToast(lang === 'en' ? 'Request forwarded' : 'ጥያቄ አስተላልፏል', 'success');
            await fetchQueue();
        } catch (err) {
            console.error('Failed to forward request', err);
            showToast(
                err.response?.data?.message || err.message || 'Failed to forward',
                'error'
            );
        }
    };

    const activeQueues = queues.filter(q => q.status !== 'COMPLETED' && q.status !== 'REJECTED');
    const recentlyCompleted = queues.filter(q => q.status === 'COMPLETED' || q.status === 'REJECTED');
    const currentlyServing = activeQueues.find(q => (q.status === 'CALLING' || q.status === 'PROCESSING') && q.officerId === user?.id);
    const waitingCount = activeQueues.filter(q => q.status === 'WAITING').length;

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-black tracking-tight">
                        {lang === 'en' ? 'Queue Management' : 'የወረፋ አስተዳደር'}
                    </h2>
                    <p className="text-muted-foreground font-semibold mt-2">
                        {lang === 'en' ? 'Manage and process citizen queue' : 'የዜጎችን ወረፋ ያስተዳድሩ እና ያስኬዱ'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQueue}
                    className="rounded-xl gap-2 font-bold"
                    disabled={loading}
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {lang === 'en' ? 'Refresh' : 'አድስ'}
                </Button>
            </div>

            {/* Sector Selector */}
            {sectors.length > 1 && (
                <Card className="rounded-3xl border-border">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-bold">
                                {lang === 'en' ? 'Active Sector:' : 'ንቁ ዘርፍ:'}
                            </label>
                            <Select value={selectedSector?.id} onValueChange={(id) => setSelectedSector(sectors.find(s => s.id === id))}>
                                <SelectTrigger className="w-64 rounded-xl font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectors.map(sector => (
                                        <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Now Serving Card */}
            <Card className="rounded-[32px] border-border bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                    {lang === 'en' ? 'Now Serving' : 'አሁን በአገልግሎት ላይ'}
                                </div>
                                <div className="text-4xl font-black">
                                    {currentlyServing?.ticketNumber || (lang === 'en' ? 'None' : 'ምንም')}
                                </div>
                                {currentlyServing && (
                                    <div className="text-sm font-semibold text-muted-foreground mt-1">
                                        {currentlyServing.user?.name} • {currentlyServing.service?.name}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                            <div className="text-right">
                                <div className="text-sm font-bold text-muted-foreground">
                                    {lang === 'en' ? 'Waiting' : 'በመጠባበቅ ላይ'}
                                </div>
                                <div className="text-3xl font-black text-primary">{waitingCount}</div>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleCallNext}
                                disabled={waitingCount === 0 || currentlyServing}
                                className="rounded-2xl h-14 px-8 font-black gap-3 shadow-xl shadow-primary/20"
                            >
                                {lang === 'en' ? 'CALL NEXT' : 'ቀጣዩን ጥራ'}
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Service Panel */}
            {currentlyServing && (
                <Card className="rounded-[32px] border-border border-2 border-primary/20">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-black">
                            {lang === 'en' ? 'Active Service' : 'ንቁ አገልግሎት'}
                        </CardTitle>
                        <CardDescription className="font-semibold">
                            {lang === 'en' ? 'Process the current citizen' : 'የአሁኑን ዜጋ ያስኬዱ'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Citizen Info */}
                        <div className="grid grid-cols-2 gap-6 p-6 bg-muted/30 rounded-2xl">
                            <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                    {lang === 'en' ? 'Citizen Name' : 'የዜጋ ስም'}
                                </div>
                                <div className="text-lg font-black">{currentlyServing.user?.name}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                    {lang === 'en' ? 'Phone Number' : 'ስልክ ቁጥር'}
                                </div>
                                <div className="text-lg font-black">{currentlyServing.user?.phoneNumber}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                    {lang === 'en' ? 'Service' : 'አገልግሎት'}
                                </div>
                                <div className="text-lg font-black">{currentlyServing.service?.name}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                    {lang === 'en' ? 'Status' : 'ሁኔታ'}
                                </div>
                                <Badge className="font-bold">
                                    {currentlyServing.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold px-1">
                                {lang === 'en' ? 'Remarks / Notes' : 'ማስታወሻዎች'}
                            </label>
                            <Textarea
                                placeholder={lang === 'en' ? 'Add notes or remarks...' : 'ማስታወሻዎችን ያክሉ...'}
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="rounded-xl min-h-24 font-medium"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {currentlyServing.status === 'CALLING' && (
                                <Button
                                    size="lg"
                                    onClick={() => handleUpdateStatus(currentlyServing.id, 'PROCESSING')}
                                    className="flex-1 rounded-2xl h-14 font-black gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Play className="w-5 h-5" />
                                    {lang === 'en' ? 'START SERVICE' : 'አገልግሎት ጀምር'}
                                </Button>
                            )}
                            {currentlyServing.status === 'PROCESSING' && (
                                <>
                                    <Button
                                        size="lg"
                                        onClick={() => handleUpdateStatus(currentlyServing.id, 'COMPLETED')}
                                        className="flex-1 rounded-2xl h-14 font-black gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        {lang === 'en' ? 'COMPLETE' : 'ጨርስ'}
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedQueue(currentlyServing);
                                            setForwardDialog(true);
                                        }}
                                        className="flex-1 rounded-2xl h-14 font-black gap-2"
                                    >
                                        <Send className="w-5 h-5" />
                                        {lang === 'en' ? 'FORWARD' : 'አስተላልፍ'}
                                    </Button>
                                </>
                            )}
                            <Button
                                size="lg"
                                variant="destructive"
                                onClick={() => handleUpdateStatus(currentlyServing.id, 'REJECTED')}
                                className="rounded-2xl h-14 px-6 font-black gap-2"
                            >
                                <XCircle className="w-5 h-5" />
                                {lang === 'en' ? 'REJECT' : 'ውድቅ አድርግ'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Queue List */}
            <Card className="rounded-[32px] border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-black">
                        {lang === 'en' ? 'Active Queue' : 'የአሁኑ ተርታ'}
                    </CardTitle>
                    <CardDescription className="font-semibold">
                        {activeQueues.length} {lang === 'en' ? 'citizens waiting' : 'ዜጎች በመጠባበቅ ላይ'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeQueues.length > 0 ? (
                        <div className="space-y-3">
                            {activeQueues.map((queue) => (
                                <div
                                    key={queue.id}
                                    className={`p-6 rounded-2xl border-2 transition-all ${queue.status === 'CALLING' || queue.status === 'PROCESSING'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="text-3xl font-black text-primary">
                                                #{queue.ticketNumber}
                                            </div>
                                            <div>
                                                <div className="font-black text-lg">{queue.user?.name}</div>
                                                <div className="text-sm text-muted-foreground font-semibold">
                                                    {queue.service?.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                className={`font-bold px-4 py-1 ${queue.status === 'CALLING'
                                                    ? 'bg-orange-500'
                                                    : queue.status === 'PROCESSING'
                                                        ? 'bg-blue-500'
                                                        : 'bg-muted'
                                                    }`}
                                            >
                                                {queue.status}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {new Date(queue.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-black text-muted-foreground mb-2">
                                {lang === 'en' ? 'No Queue' : 'ወረፋ የለም'}
                            </h3>
                            <p className="text-muted-foreground font-semibold mb-4">
                                {lang === 'en' ? 'No citizens waiting in queue' : 'በወረፋ ውስጥ የሚጠብቁ ዜጎች የሉም'}
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/officer/history')}
                                className="rounded-xl font-bold gap-2"
                            >
                                <History className="w-4 h-4" />
                                {lang === 'en' ? 'View Queue History' : 'የወረፋ ታሪክ ይመልከቱ'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recently Completed */}
            {recentlyCompleted.length > 0 && (
                <Card className="rounded-[32px] border-border opacity-70">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-black">
                            {lang === 'en' ? 'Recently Processed' : 'በቅርብ የተጠናቀቁ'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recentlyCompleted.slice(0, 5).map((queue) => (
                                <div key={queue.id} className="p-4 rounded-xl border border-border flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-primary">#{queue.ticketNumber}</span>
                                        <span className="font-bold">{queue.user?.name}</span>
                                        <span className="text-muted-foreground">{queue.service?.name}</span>
                                    </div>
                                    <Badge variant="outline" className="font-bold border-green-500/50 text-green-600">
                                        {queue.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Forward Dialog */}
            <Dialog open={forwardDialog} onOpenChange={setForwardDialog}>
                <DialogContent className="rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">
                            {lang === 'en' ? 'Forward Request' : 'ጥያቄ አስተላልፍ'}
                        </DialogTitle>
                        <DialogDescription className="font-semibold">
                            {lang === 'en' ? 'Forward this request to another sector' : 'ይህን ጥያቄ ወደ ሌላ ዘርፍ አስተላልፍ'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">
                                {lang === 'en' ? 'Target Sector' : 'ዒላማ ዘርፍ'}
                            </label>
                            <Select value={forwardSectorId} onValueChange={setForwardSectorId}>
                                <SelectTrigger className="rounded-xl font-semibold">
                                    <SelectValue placeholder={lang === 'en' ? 'Select sector...' : 'ዘርፍ ይምረጡ...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectors.filter(s => s.id !== selectedSector?.id).map(sector => (
                                        <SelectItem key={sector.id} value={sector.id}>
                                            {sector.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">
                                {lang === 'en' ? 'Reason' : 'ምክንያት'}
                            </label>
                            <Textarea
                                placeholder={lang === 'en' ? 'Reason for forwarding...' : 'የማስተላለፍ ምክንያት...'}
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="rounded-xl min-h-20 font-medium"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setForwardDialog(false)}
                            className="rounded-xl font-bold"
                        >
                            {lang === 'en' ? 'Cancel' : 'ሰርዝ'}
                        </Button>
                        <Button
                            onClick={handleForwardRequest}
                            disabled={!forwardSectorId}
                            className="rounded-xl font-bold"
                        >
                            {lang === 'en' ? 'Forward' : 'አስተላልፍ'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
