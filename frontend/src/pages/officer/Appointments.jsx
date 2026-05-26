import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

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
    AlertCircle
} from 'lucide-react';

export default function AppointmentControl() {

    const { lang } = useLanguage();
    const { showToast } = useToast();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [rejectModal, setRejectModal] = useState({ open: false, appointmentId: null });
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchSectors();
    }, []);

    useEffect(() => {
        if (selectedSector?.id) {
            fetchAppointments(selectedSector.id);
        }
    }, [selectedSector]);

    const fetchSectors = async () => {
        try {
            const res = await api.get('/services/sectors');
            const data = res.data || [];

            setSectors(data);

            if (data.length > 0) {
                setSelectedSector(data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch sectors', err);
        }
    };

    // ✅ FIXED FETCH
    const fetchAppointments = async (sectorId) => {
        if (!sectorId) return;

        setLoading(true);

        try {
            const res = await api.get(`/appointments/sector/${sectorId}`);

            console.log("RAW APPOINTMENTS:", res.data);

            const data = Array.isArray(res.data) ? res.data : [];

            setAppointments(data);

        } catch (err) {
            console.error('Failed to fetch appointments', err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (appointmentId, status, extraPayload = {}) => {
        const id = String(appointmentId);
        if (status === 'SCHEDULED') {
            console.log('APPROVE CLICKED', id, status);
        } else if (status === 'REJECTED') {
            console.log('REJECT CLICKED', id, status);
        } else {
            console.log('APPOINTMENT STATUS CLICKED', id, status);
        }

        try {
            const { data } = await api.patch(`/appointments/${id}/status`, { status, ...extraPayload });

            const updated = data?.data;
            if (updated && typeof updated === 'object') {
                setAppointments((prev) =>
                    (prev || []).map((a) => (String(a.id) === id ? { ...a, ...updated } : a))
                );
            }

            showToast(data?.message || 'Appointment updated', 'success');
            await fetchAppointments(selectedSector?.id);
        } catch (err) {
            console.error('Failed to update appointment status', err);
            showToast(
                err.response?.data?.message || err.message || 'Failed to update appointment',
                'error'
            );
        }
    };

    const openRejectModal = (appointmentId) => {
        setRejectionReason('');
        setRejectModal({ open: true, appointmentId });
    };

    const submitReject = async () => {
        if (!rejectionReason.trim()) {
            showToast('Rejection reason is required', 'error');
            return;
        }
        await handleUpdateStatus(rejectModal.appointmentId, 'REJECTED', { rejectionReason: rejectionReason.trim() });
        setRejectModal({ open: false, appointmentId: null });
        setRejectionReason('');
    };

    // ✅ SAFE FILTER
    const filteredAppointments = (appointments || []).filter(app => {

        const matchesSearch =
            app?.user?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
            app?.user?.phoneNumber?.includes(searchQuery) ||
            app?.service?.name?.toLowerCase()?.includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || app?.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500';
            case 'SCHEDULED': return 'bg-blue-500';
            case 'COMPLETED': return 'bg-green-500';
            case 'CANCELLED': return 'bg-red-500';
            case 'REJECTED': return 'bg-gray-500';
            default: return 'bg-muted';
        }
    };

    return (
        <div className="space-y-8">

            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-black">
                        {lang === 'en' ? 'Appointments' : 'ቀጠሮዎች'}
                    </h2>
                    <p className="text-muted-foreground font-semibold mt-2">
                        Manage scheduled visits and registrations
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchAppointments(selectedSector?.id)}
                    disabled={loading}
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardContent className="p-6 flex gap-4 items-center">
                    <label className="font-bold">Sector:</label>

                    <Select
                        value={String(selectedSector?.id || '')}
                        onValueChange={(id) =>
                            setSelectedSector(
                                sectors.find(s => String(s.id) === String(id))
                            )
                        }
                    >
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select sector" />
                        </SelectTrigger>

                        <SelectContent>
                            {sectors.map(sector => (
                                <SelectItem key={sector.id} value={String(sector.id)}>
                                    {sector.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-4 h-4" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>
                        {filteredAppointments.length} found
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : filteredAppointments.length > 0 ? (
                        <div className="space-y-3">
                            {filteredAppointments.map(app => (
                                <div
                                    key={app.id}
                                    className="p-4 border rounded-xl flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold">{app?.user?.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {app?.service?.name} • {new Date(app?.date).toDateString()} • {app?.timeSlot}
                                        </p>

                                        <Badge className={getStatusColor(app.status)}>
                                            {app.status}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2">
                                        {app.status === 'PENDING' && (
                                            <>
                                                <Button size="sm" onClick={() => handleUpdateStatus(app.id, 'SCHEDULED')}>
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => openRejectModal(app.id)}>
                                                    Reject
                                                </Button>
                                            </>
                                        )}

                                        {app.status === 'SCHEDULED' && (
                                            <>
                                                <Button size="sm" onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}>
                                                    Complete
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}>
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <AlertCircle className="mx-auto mb-2" />
                            No appointments found
                        </div>
                    )}
                </CardContent>
            </Card>
            <Dialog open={rejectModal.open} onOpenChange={(open) => setRejectModal({ open, appointmentId: open ? rejectModal.appointmentId : null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Appointment</DialogTitle>
                        <DialogDescription>Provide a clear rejection reason for the citizen.</DialogDescription>
                    </DialogHeader>
                    <Input
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Reason for rejection"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectModal({ open: false, appointmentId: null })}>Cancel</Button>
                        <Button variant="destructive" onClick={submitReject}>Submit Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
               