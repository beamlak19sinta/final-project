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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
    FileText,
    Search,
    RefreshCcw,
    CheckCircle,
    XCircle,
    Send,
    Eye,
    AlertCircle,
    Clock,
    User
} from 'lucide-react';

export default function ServiceRequests() {
    const { lang } = useLanguage();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsDialog, setDetailsDialog] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);

    useEffect(() => {
        fetchSectors();
    }, []);

    useEffect(() => {
        if (selectedSector) {
            fetchRequests();
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

    const fetchRequests = async () => {
        if (!selectedSector) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/requests/sector/${selectedSector.id}`);
            setRequests(data);
        } catch (err) {
            console.error('Failed to fetch requests', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId, status) => {
        try {
            await api.patch(`/requests/status/${requestId}`, {
                status,
                remarks: remarks || undefined
            });
            setRemarks('');
            setDetailsDialog(false);
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setRemarks(request.remarks || '');
        setDetailsDialog(true);
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.user?.phoneNumber?.includes(searchQuery) ||
            req.service?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500';
            case 'PROCESSING': return 'bg-blue-500';
            case 'COMPLETED': return 'bg-green-500';
            case 'REJECTED': return 'bg-red-500';
            default: return 'bg-muted';
        }
    };

    const statusCounts = {
        all: requests.length,
        PENDING: requests.filter(r => r.status === 'PENDING').length,
        PROCESSING: requests.filter(r => r.status === 'PROCESSING').length,
        COMPLETED: requests.filter(r => r.status === 'COMPLETED').length,
        REJECTED: requests.filter(r => r.status === 'REJECTED').length,
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-black tracking-tight">
                        {lang === 'en' ? 'Service Requests' : 'የአገልግሎት ጥያቄዎች'}
                    </h2>
                    <p className="text-muted-foreground font-semibold mt-2">
                        {lang === 'en' ? 'Review and process online service requests' : 'የመስመር ላይ አገልግሎት ጥያቄዎችን ይገምግሙ እና ያስኬዱ'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRequests}
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

            {/* Search and Filter */}
            <Card className="rounded-3xl border-border">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={lang === 'en' ? 'Search by name, phone, or service...' : 'በስም፣ ስልክ ወይም አገልግሎት ይፈልጉ...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-xl font-semibold"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48 rounded-xl font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{lang === 'en' ? 'All Status' : 'ሁሉም ሁኔታ'} ({statusCounts.all})</SelectItem>
                                <SelectItem value="PENDING">{lang === 'en' ? 'Pending' : 'በመጠባበቅ ላይ'} ({statusCounts.PENDING})</SelectItem>
                                <SelectItem value="PROCESSING">{lang === 'en' ? 'Processing' : 'በሂደት ላይ'} ({statusCounts.PROCESSING})</SelectItem>
                                <SelectItem value="COMPLETED">{lang === 'en' ? 'Completed' : 'ተጠናቋል'} ({statusCounts.COMPLETED})</SelectItem>
                                <SelectItem value="REJECTED">{lang === 'en' ? 'Rejected' : 'ውድቅ ተደርጓል'} ({statusCounts.REJECTED})</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Requests List */}
            <Card className="rounded-[32px] border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-black">
                        {lang === 'en' ? 'Requests List' : 'የጥያቄዎች ዝርዝር'}
                    </CardTitle>
                    <CardDescription className="font-semibold">
                        {filteredRequests.length} {lang === 'en' ? 'requests found' : 'ጥያቄዎች ተገኝተዋል'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredRequests.length > 0 ? (
                        <div className="space-y-3">
                            {filteredRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="p-6 rounded-2xl border-2 border-border hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <FileText className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-black text-lg">{request.user?.name}</h4>
                                                    <Badge className={`${getStatusColor(request.status)} font-bold`}>
                                                        {request.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground font-semibold">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {request.user?.phoneNumber}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{request.service?.name}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleViewDetails(request)}
                                            className="rounded-xl font-bold gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {lang === 'en' ? 'View Details' : 'ዝርዝር ይመልከቱ'}
                                        </Button>
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
                                {lang === 'en' ? 'No Requests Found' : 'ምንም ጥያቄዎች አልተገኙም'}
                            </h3>
                            <p className="text-muted-foreground font-semibold">
                                {lang === 'en' ? 'No service requests match your filters' : 'ምንም የአገልግሎት ጥያቄዎች ከማጣሪያዎችዎ ጋር አይዛመዱም'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Request Details Dialog */}
            <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
                <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="shrink-0">
                        <DialogTitle className="text-2xl font-black">
                            {lang === 'en' ? 'Request Details' : 'የጥያቄ ዝርዝሮች'}
                        </DialogTitle>
                        <DialogDescription className="font-semibold">
                            {lang === 'en' ? 'Review and update request status' : 'የጥያቄ ሁኔታን ይገምግሙ እና ያዘምኑ'}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-6 py-4 overflow-y-auto flex-1">
                            {/* Citizen Info */}
                            <div className="grid grid-cols-2 gap-4 p-6 bg-muted/30 rounded-2xl">
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                        {lang === 'en' ? 'Citizen Name' : 'የዜጋ ስም'}
                                    </div>
                                    <div className="font-black">{selectedRequest.user?.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                        {lang === 'en' ? 'Phone Number' : 'ስልክ ቁጥር'}
                                    </div>
                                    <div className="font-black">{selectedRequest.user?.phoneNumber}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                        {lang === 'en' ? 'Service' : 'አገልግሎት'}
                                    </div>
                                    <div className="font-black">{selectedRequest.service?.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                        {lang === 'en' ? 'Submitted' : 'የቀረበበት'}
                                    </div>
                                    <div className="font-black">
                                        {new Date(selectedRequest.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                        {lang === 'en' ? 'Current Status' : 'የአሁኑ ሁኔታ'}
                                    </div>
                                    <Badge className={`${getStatusColor(selectedRequest.status)} font-bold`}>
                                        {selectedRequest.status}
                                    </Badge>
                                </div>
                            </div>

                            {/* Request Data */}
                            {selectedRequest.data && (
                                <div className="space-y-3">
                                    <label className="text-sm font-bold px-1">
                                        {lang === 'en' ? 'Request Data' : 'የጥያቄ መረጃ'}
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(selectedRequest.data).map(([key, value]) => (
                                            <div key={key} className="p-4 bg-muted/30 rounded-xl">
                                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </div>
                                                <div className="font-black text-foreground">
                                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Remarks */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold">
                                    {lang === 'en' ? 'Remarks / Notes' : 'ማስታወሻዎች'}
                                </label>
                                <Textarea
                                    placeholder={lang === 'en' ? 'Add notes or remarks...' : 'ማስታወሻዎችን ያክሉ...'}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="rounded-xl min-h-24 font-medium"
                                />
                            </div>

                            {/* Previous Remarks */}
                            {selectedRequest.remarks && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">
                                        {lang === 'en' ? 'Previous Remarks' : 'ቀደም ያሉ ማስታወሻዎች'}
                                    </label>
                                    <div className="p-4 bg-muted/20 rounded-xl text-sm font-medium text-muted-foreground">
                                        {selectedRequest.remarks}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="gap-2 shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => setDetailsDialog(false)}
                            className="rounded-xl font-bold"
                        >
                            {lang === 'en' ? 'Close' : 'ዝጋ'}
                        </Button>
                        {selectedRequest?.status !== 'COMPLETED' && selectedRequest?.status !== 'REJECTED' && (
                            <>
                                {selectedRequest?.status === 'PENDING' && (
                                    <Button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'PROCESSING')}
                                        className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700"
                                    >
                                        {lang === 'en' ? 'Start Processing' : 'ሂደት ጀምር'}
                                    </Button>
                                )}
                                <Button
                                    onClick={() => handleUpdateStatus(selectedRequest.id, 'COMPLETED')}
                                    className="rounded-xl font-bold bg-green-600 hover:bg-green-700 gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {lang === 'en' ? 'Approve' : 'ፈቅድ'}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleUpdateStatus(selectedRequest.id, 'REJECTED')}
                                    className="rounded-xl font-bold gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    {lang === 'en' ? 'Reject' : 'ውድቅ አድርግ'}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
