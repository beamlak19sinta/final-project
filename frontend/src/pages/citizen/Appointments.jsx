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
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Building2,
    CalendarCheck
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Appointments() {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;
    const { appointments = [], sectors = [], loading, refresh } = useCitizenData();
    const { showToast } = useToast();

    const [showBookModal, setShowBookModal] = useState(false);
    const [selectedService, setSelectedService] = useState('');
    const [bookingForm, setBookingForm] = useState({
        date: '',
        timeSlot: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState('');

    const fetchSlots = async (serviceId, date) => {
        if (!serviceId || !date) return;
        setSlotsLoading(true);
        setSlotsError('');
        setAvailableSlots([]);
        setBookingForm((prev) => ({ ...prev, timeSlot: '' }));
        try {
            const { data } = await api.get('/appointments/slots', {
                params: { serviceId, date }
            });
            setAvailableSlots(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length === 0) {
                setSlotsError(lang === 'en' ? 'No slots available for selected date.' : 'ለተመረጠው ቀን የሚገኝ ሰዓት የለም።');
            }
        } catch (err) {
            setSlotsError(err.response?.data?.message || (lang === 'en' ? 'Failed to fetch available slots' : 'የሚገኙ ሰዓታትን ማግኘት አልተሳካም'));
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!selectedService || !bookingForm.date || !bookingForm.timeSlot) {
                showToast(lang === 'en' ? 'Please fill all fields' : 'እባክዎ ሁሉንም መስኮች ይሙሉ', 'error');
                return;
            }

            await api.post('/appointments/book', {
                serviceId: String(selectedService),
                date: bookingForm.date,
                timeSlot: bookingForm.timeSlot
            });

            showToast(lang === 'en' ? 'Appointment booked successfully!' : 'ቀጠሮ በተሳካ ሁኔታ ተይዟል!', 'success');

            setShowBookModal(false);
            setSelectedService('');
            setBookingForm({ date: '', timeSlot: '' });
            setAvailableSlots([]);
            setSlotsError('');

            await refresh();

        } catch (err) {
            console.error(err);
            showToast(
                err.response?.data?.message || (lang === 'en' ? 'Failed to book appointment' : 'ቀጠሮ ማስያዝ አልተሳካም'),
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-48 bg-muted rounded-3xl" />
            </div>
        );
    }

    const appointmentServices = (sectors || []).flatMap(
        s => (s.services || []).filter(ser => ser.mode === 'APPOINTMENT').map(ser => ({ ...ser, sectorName: s.name }))
    );

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">
                        {lang === 'en' ? 'My Appointments' : 'ቀጠሮዎቼ'}
                    </h2>
                    <p className="text-muted-foreground font-semibold">
                        {lang === 'en' ? 'Manage your scheduled visits.' : 'ቀጠሮዎችዎን ያስተዳድሩ።'}
                    </p>
                </div>

                <Button
                    onClick={() => setShowBookModal(true)}
                    className="rounded-2xl font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    {lang === 'en' ? 'Book New' : 'ቀጠሮ ያዝ'}
                </Button>
            </div>

            {/* LIST */}
            {appointments.length > 0 ? (
                <div className="grid gap-6">
                    {appointments.map((app) => (
                        <Card
                            key={app.id}
                            className="rounded-3xl p-6 border-border bg-card flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary transition-colors"
                        >
                            <div className="flex items-center gap-6 w-full">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <CalendarCheck className="w-7 h-7" />
                                </div>

                                <div className="space-y-1 flex-1">
                                    <h4 className="font-black text-xl">
                                        {t[app?.service?.name] || app?.service?.name || 'Service'}
                                    </h4>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-primary" />
                                            <span>
                                                {app?.date
                                                    ? new Date(app.date).toDateString()
                                                    : 'N/A'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span>{app?.timeSlot || 'N/A'}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-primary" />
                                            <span>
                                                {t[app?.service?.sector?.name] || app?.service?.sector?.name || 'Sector'}
                                            </span>
                                        </div>
                                    </div>
                                    {app.status === 'REJECTED' && app.rejectionReason ? (
                                        <p className="mt-2 text-sm font-semibold text-red-500">
                                            {lang === 'en' ? 'Rejection reason:' : 'ውድቅ የተደረገበት ምክንያት:'} {app.rejectionReason}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6">
                                <Badge
                                    className={`rounded-xl font-bold px-4 py-1.5 border-none text-sm uppercase italic ${
                                        app.status === 'PENDING'
                                            ? 'bg-yellow-500/10 text-yellow-500'
                                            : app.status === 'SCHEDULED' || app.status === 'APPROVED'
                                            ? 'bg-blue-500/10 text-blue-500'
                                            : app.status === 'COMPLETED'
                                            ? 'bg-green-500/10 text-green-500'
                                            : app.status === 'CANCELLED'
                                            ? 'bg-red-500/10 text-red-500'
                                            : 'bg-gray-500/10 text-gray-500'
                                    }`}
                                >
                                    {t[app.status] || app.status}
                                </Badge>

                                <Button
                                    variant="outline"
                                    className="rounded-xl font-bold h-10 border-border md:hidden lg:flex"
                                    disabled
                                >
                                    {lang === 'en' ? 'Manage' : 'አስተዳድር'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[40px] p-16 border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <CalendarIcon className="w-10 h-10" />
                    </div>

                    <div>
                        <h3 className="text-2xl font-black">
                            {lang === 'en' ? 'No Appointments Yet' : 'እስካሁን ቀጠሮ የለም'}
                        </h3>
                        <p className="text-muted-foreground font-semibold max-w-sm mx-auto">
                            {lang === 'en' ? "You don't have any appointments yet. Book one now." : "እስካሁን ምንም ቀጠሮ የለዎትም። አሁኑኑ ቀጠሮ ይያዙ።"}
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => setShowBookModal(true)}
                        className="rounded-2xl font-black px-10 h-12"
                    >
                        {lang === 'en' ? 'Schedule First Visit' : 'የመጀመሪያ ቀጠሮ ይያዙ'}
                    </Button>
                </Card>
            )}

            {/* BOOK MODAL */}
            <Dialog open={showBookModal} onOpenChange={setShowBookModal}>
                <DialogContent className="sm:max-w-[425px] rounded-[32px] p-8">

                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">
                            {lang === 'en' ? 'Book Appointment' : 'ቀጠሮ ይያዙ'}
                        </DialogTitle>
                        <DialogDescription className="font-semibold text-muted-foreground">
                            {lang === 'en' ? 'Choose service and time.' : 'አገልግሎት እና ሰዓት ይምረጡ።'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBook} className="space-y-6 pt-4">

                        {/* SERVICE */}
                        <div className="space-y-2">
                            <Label className="font-bold">{lang === 'en' ? 'Service' : 'አገልግሎት'}</Label>
                            <select
                                required
                                value={selectedService}
                                onChange={(e) => {
                                    const serviceId = e.target.value;
                                    setSelectedService(serviceId);
                                    if (bookingForm.date) {
                                        fetchSlots(serviceId, bookingForm.date);
                                    } else {
                                        setAvailableSlots([]);
                                        setSlotsError('');
                                        setBookingForm((prev) => ({ ...prev, timeSlot: '' }));
                                    }
                                }}
                                className="w-full h-12 rounded-xl border px-3 font-bold"
                            >
                                <option value="">{lang === 'en' ? 'Select a service' : 'አገልግሎት ይምረጡ'}</option>
                                {appointmentServices.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {t[s.name] || s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* DATE */}
                        <div className="space-y-2">
                            <Label className="font-bold">{lang === 'en' ? 'Date' : 'ቀን'}</Label>
                            <Input
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={bookingForm.date}
                                onChange={(e) => {
                                    const nextDate = e.target.value;
                                    setBookingForm((prev) => ({ ...prev, date: nextDate, timeSlot: '' }));
                                    if (selectedService && nextDate) {
                                        fetchSlots(selectedService, nextDate);
                                    } else {
                                        setAvailableSlots([]);
                                        setSlotsError('');
                                    }
                                }}
                            />
                        </div>

                        {/* TIME */}
                        <div className="space-y-2">
                            <Label className="font-bold">{lang === 'en' ? 'Time Slot' : 'የጊዜ ክፍተት'}</Label>
                            {slotsLoading ? (
                                <div className="text-sm text-muted-foreground font-semibold">
                                    {lang === 'en' ? 'Loading available slots...' : 'የሚገኙ ሰዓታትን በመጫን ላይ...'}
                                </div>
                            ) : null}
                            {slotsError ? (
                                <div className="space-y-2">
                                    <div className="text-sm text-red-500 font-semibold">{slotsError}</div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl font-bold"
                                        onClick={() => fetchSlots(selectedService, bookingForm.date)}
                                        disabled={!selectedService || !bookingForm.date}
                                    >
                                        {lang === 'en' ? 'Retry' : 'ደግመው ይሞክሩ'}
                                    </Button>
                                </div>
                            ) : null}
                            <select
                                required
                                value={bookingForm.timeSlot}
                                onChange={(e) =>
                                    setBookingForm({ ...bookingForm, timeSlot: e.target.value })
                                }
                                disabled={slotsLoading || availableSlots.length === 0}
                                className="w-full h-12 rounded-xl border px-3 font-bold"
                            >
                                <option value="">{lang === 'en' ? 'Select time' : 'ሰዓት ይምረጡ'}</option>
                                {availableSlots.map((slotValue) => (
                                    <option key={slotValue} value={slotValue}>{slotValue}</option>
                                ))}
                            </select>
                        </div>

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 rounded-2xl font-black"
                            >
                                {isSubmitting ? (lang === 'en' ? 'Booking...' : 'በማስያዝ ላይ...') : (lang === 'en' ? 'Confirm Appointment' : 'ቀጠሮውን አረጋግጥ')}
                            </Button>
                        </DialogFooter>

                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}