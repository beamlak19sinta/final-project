import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    RefreshCcw,
    CheckCircle,
    XCircle,
    Clock,
    User,
    FileText,
    AlertCircle,
} from 'lucide-react';

export default function History() {
    const { lang } = useLanguage();
    const [queueHistory, setQueueHistory] = useState([]);
    const [requestHistory, setRequestHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [historyType, setHistoryType] = useState('queue');
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);

    useEffect(() => {
        fetchSectors();
    }, []);

    useEffect(() => {
        if (selectedSector) {
            fetchHistory();
        }
    }, [selectedSector, historyType]);

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

    const fetchHistory = async () => {
        if (!selectedSector) return;
        setLoading(true);
        try {
            if (historyType === 'queue') {
                const { data } = await api.get(`/queues/history/${selectedSector.id}`);
                setQueueHistory(data);
            } else {
                const { data } = await api.get(`/requests/history/${selectedSector.id}`);
                setRequestHistory(data);
            }
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-500';
            case 'REJECTED': return 'bg-red-500';
            case 'CANCELLED': return 'bg-gray-400';
            default: return 'bg-muted';
        }
    };

    const getStatusIcon = (status) => {
        return status === 'COMPLETED' ? CheckCircle : XCircle;
    };

    const filterByDate = (items) => {
        if (dateFilter === 'all') return items;

        const now = new Date();
        const filtered = items.filter(item => {
            const itemDate = new Date(item.updatedAt || item.createdAt);
            const diffDays = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));

            switch (dateFilter) {
                case 'today': return diffDays === 0;
                case 'week': return diffDays <= 7;
                case 'month': return diffDays <= 30;
                default: return true;
            }
        });
        return filtered;
    };

    const filterBySearch = (items) => {
        if (!searchQuery) return items;

        return items.filter(item => {
            const searchLower = searchQuery.toLowerCase();
            if (historyType === 'queue') {
                return String(item.ticketNumber ?? '').toLowerCase().includes(searchLower) ||
                    item.user?.name?.toLowerCase().includes(searchLower) ||
                    item.user?.phoneNumber?.includes(searchQuery) ||
                    item.service?.name?.toLowerCase().includes(searchLower);
            } else {
                return item.user?.name?.toLowerCase().includes(searchLower) ||
                    item.user?.phoneNumber?.includes(searchQuery) ||
                    item.service?.name?.toLowerCase().includes(searchLower);
            }
        });
    };

    const filterByStatus = (items) => {
        if (statusFilter === 'all') return items;
        return items.filter(item => item.status === statusFilter);
    };

    const getFilteredItems = () => {
        const items = historyType === 'queue' ? queueHistory : requestHistory;
        let filtered = filterByStatus(items);
        filtered = filterByDate(filtered);
        filtered = filterBySearch(filtered);
        return filtered;
    };

    const filteredItems = getFilteredItems();

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black tracking-tight">
                        {lang === 'en' ? 'History' : 'ታሪክ'}
                    </h2>
                    <p className="text-muted-foreground font-semibold mt-1">
                        {lang === 'en' ? 'View completed and rejected services' : 'የተጠናቀቁ እና የተከለከሉ አገልግሎቶችን ይመልከቱ'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchHistory}
                    className="rounded-xl gap-2 font-bold"
                    disabled={loading}
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {lang === 'en' ? 'Refresh' : 'አድስ'}
                </Button>
            </div>

            {/* Filters - Single Row */}
            <Card className="rounded-3xl border-border">
                <CardContent className="p-6">
                    <div className="flex gap-3 flex-wrap items-center">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[250px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={lang === 'en' ? 'Search...' : 'ፈልግ...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-xl font-semibold w-full"
                            />
                        </div>

                        {/* History Type Selector */}
                        <Select value={historyType} onValueChange={setHistoryType}>
                            <SelectTrigger className="w-48 rounded-xl font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="queue">{lang === 'en' ? 'Queue History' : 'የወረፋ ታሪክ'}</SelectItem>
                                <SelectItem value="requests">{lang === 'en' ? 'Request History' : 'የጥያቄ ታሪክ'}</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sector Selector */}
                        {sectors.length > 1 && (
                            <Select value={selectedSector?.id} onValueChange={(id) => setSelectedSector(sectors.find(s => s.id === id))}>
                                <SelectTrigger className="w-48 rounded-xl font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectors.map(sector => (
                                        <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 rounded-xl font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{lang === 'en' ? 'All' : 'ሁሉም'}</SelectItem>
                                <SelectItem value="COMPLETED">{lang === 'en' ? 'Completed' : 'ተጠናቁዋል'}</SelectItem>
                                <SelectItem value="REJECTED">{lang === 'en' ? 'Rejected' : 'ውድቅ'}</SelectItem>
                                <SelectItem value="CANCELLED">{lang === 'en' ? 'Cancelled' : 'ተሰርዟል'}</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date Filter */}
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-40 rounded-xl font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{lang === 'en' ? 'All Time' : 'ሁሉም'}</SelectItem>
                                <SelectItem value="today">{lang === 'en' ? 'Today' : 'ዛሬ'}</SelectItem>
                                <SelectItem value="week">{lang === 'en' ? 'Week' : 'ሳምንት'}</SelectItem>
                                <SelectItem value="month">{lang === 'en' ? 'Month' : 'ወር'}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* History List */}
            <Card className="rounded-[32px] border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-black">
                        {historyType === 'queue'
                            ? (lang === 'en' ? 'Queue History' : 'የወረፋ ታሪክ')
                            : (lang === 'en' ? 'Request History' : 'የጥያቄ ታሪክ')
                        }
                    </CardTitle>
                    <CardDescription className="font-semibold">
                        {filteredItems.length} {lang === 'en' ? 'records found' : 'መዝገቦች ተገኝተዋል'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredItems.length > 0 ? (
                        <div className="space-y-3">
                            {filteredItems.map((item) => {
                                const StatusIcon = getStatusIcon(item.status);
                                return (
                                    <div
                                        key={item.id}
                                        className="p-6 rounded-2xl border-2 border-border hover:border-primary/30 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6 flex-1">
                                                {historyType === 'queue' ? (
                                                    <div className="text-3xl font-black text-primary">
                                                        #{item.ticketNumber}
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                        <FileText className="w-6 h-6 text-primary" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-black text-lg">{item.user?.name}</h4>
                                                        <Badge className={`${getStatusColor(item.status)} font-bold gap-1`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-semibold">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {item.user?.phoneNumber}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{item.service?.name}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {item.remarks && (
                                                        <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm font-medium">
                                                            <span className="text-xs font-bold text-muted-foreground uppercase">
                                                                {lang === 'en' ? 'Remarks:' : 'ማስታወሻ:'}
                                                            </span> {item.remarks}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-black text-muted-foreground mb-2">
                                {lang === 'en' ? 'No History Found' : 'ምንም ታሪክ አልተገኘም'}
                            </h3>
                            <p className="text-muted-foreground font-semibold">
                                {lang === 'en' ? 'No history matches your filters' : 'ምንም ታሪክ ከማጣሪያዎችዎ ጋር አይዛመድም'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
