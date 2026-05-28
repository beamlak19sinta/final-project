import React from 'react';
import { useCitizenData } from '../../hooks/useCitizenData';
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
    ClipboardList,
    Clock,
    CheckCircle2,
    XCircle,
    Building2,
    Calendar,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TrackStatus() {
    const { lang } = useLanguage();
    const { onlineRequests, activeQueue, queueHistory, loading } = useCitizenData();
    const [searchTerm, setSearchTerm] = React.useState('');

    if (loading) return <div className="animate-pulse space-y-6"><div className="h-48 bg-muted rounded-3xl" /></div>;

    // Combine different types of "trackable" items
    const allItems = [
        ...onlineRequests.map(req => ({
            id: req.id,
            type: 'REQUEST',
            name: req.service?.name,
            sector: req.service?.sector?.name,
            date: req.createdAt,
            status: req.status,
            remarks: req.remarks,
            icon: <ClipboardList className="w-8 h-8" />
        })),
        ...(activeQueue ? [{
            id: activeQueue.id,
            type: 'QUEUE',
            name: activeQueue.service?.name,
            sector: activeQueue.service?.sector?.name,
            date: activeQueue.createdAt,
            status: activeQueue.status,
            ticketNumber: activeQueue.ticketNumber,
            icon: <Clock className="w-8 h-8" />
        }] : []),
        ...queueHistory.map(q => ({
            id: q.id,
            type: 'HISTORY',
            name: q.service?.name,
            sector: q.service?.sector?.name,
            date: q.createdAt,
            status: q.status,
            ticketNumber: q.ticketNumber,
            icon: <Clock className="w-8 h-8" />
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const filteredItems = allItems.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'REJECTED': return <XCircle className="w-5 h-5 text-destructive" />;
            case 'CALLING': return <Badge className="bg-orange-500 animate-pulse">YOUR TURN</Badge>;
            case 'PROCESSING': return <Badge className="bg-blue-500">BEING SERVED</Badge>;
            default: return <Clock className="w-5 h-5 text-primary" />;
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'REJECTED': return 'destructive';
            case 'PROCESSING':
            case 'CALLING': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">{lang === 'en' ? 'Track Progress' : 'ሁኔታን ይከታተሉ'}</h2>
                    <p className="text-muted-foreground font-semibold">Monitor all your active requests and queue positions.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-10 h-11 rounded-2xl bg-muted/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredItems.length > 0 ? (
                <div className="grid gap-6">
                    {filteredItems.map((item, i) => (
                        <Card key={i} className={`rounded-3xl border-border bg-card overflow-hidden hover:border-primary transition-all ${item.status === 'CALLING' ? 'ring-2 ring-orange-500' : ''}`}>
                            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6 w-full">
                                    <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center text-primary shrink-0 relative">
                                        {item.icon}
                                        <div className="absolute -top-1 -right-1">
                                            {typeof getStatusIcon(item.status) === 'object' && !getStatusIcon(item.status).props?.className?.includes('Badge') ? getStatusIcon(item.status) : null}
                                        </div>
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-black text-xl">{item.name}</h4>
                                            <Badge variant={getStatusVariant(item.status)} className="rounded-lg font-bold">
                                                {item.type === 'QUEUE' ? `TICKET #${item.ticketNumber}` : item.status}
                                            </Badge>
                                            {item.status === 'CALLING' && getStatusIcon(item.status)}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
                                            <span className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                {item.sector}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(item.date).toLocaleDateString()}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] font-bold">
                                                {item.type}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2 text-center md:text-right">
                                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Current Status</div>
                                    <div className={`font-black uppercase text-lg italic tracking-tight ${item.status === 'CALLING' ? 'text-orange-500' : 'text-primary'}`}>
                                        {item.status === 'CALLING' ? 'GO TO COUNTER' : item.status}
                                    </div>
                                </div>
                            </div>
                            {item.remarks && (
                                <div className="bg-muted/30 border-t border-border p-4 px-8 text-sm font-medium text-muted-foreground italic">
                                    " {item.remarks} "
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[40px] p-20 border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <ClipboardList className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black">No Active Requests</h3>
                        <p className="text-muted-foreground font-semibold max-w-sm mx-auto">
                            You haven't submitted any online applications yet. Explore our services to get started.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
