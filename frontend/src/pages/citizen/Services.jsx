import React, { useState, useEffect } from 'react';
import { ChevronRight, MessageSquareText } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../lib/translations';

const mapApprovedSectors = (dbSectors) => {
    if (!dbSectors || !Array.isArray(dbSectors)) return [];
    return dbSectors;
};

export default function Services() {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;

    const [appointmentServices, setAppointmentServices] = useState([]);
    const [queueServices, setQueueServices] = useState([]);
    const [onlineServices, setOnlineServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [bookingForm, setBookingForm] = useState({ date: '', timeSlot: '' });
    const [applicationForm, setApplicationForm] = useState({ remarks: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({ message: '', rating: '5' });
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchDashboardServices = async () => {
            try {
                const [citizenRes, helpDeskRes] = await Promise.all([
                    api.get('/services/citizen'),
                    api.get('/services/support')
                ]);

                const mappedCitizenSectors = mapApprovedSectors(citizenRes.data || []);
                const mappedOnlineSectors = mapApprovedSectors(helpDeskRes.data || []);

                const citizenServices = mappedCitizenSectors.flatMap((sector) =>
                    (sector.services || []).map((service) => ({ ...service, sectorName: sector.name }))
                );

                const onlineOnly = mappedOnlineSectors.flatMap((sector) =>
                    (sector.services || []).map((service) => ({ ...service, sectorName: sector.name }))
                );

                setAppointmentServices(citizenServices.filter((service) => service.mode === 'APPOINTMENT'));
                setQueueServices(citizenServices.filter((service) => service.mode === 'QUEUE'));
                setOnlineServices(onlineOnly.filter((service) => service.mode === 'ONLINE'));
            } catch (err) {
                console.error('Failed to fetch services:', err);
                showToast('Failed to load services', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardServices();
    }, [showToast]);

    const handleBooking = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (selectedService.mode === 'APPOINTMENT') {
                await api.post('/appointments/book', {
                    serviceId: selectedService.id,
                    ...bookingForm
                });
            } else if (selectedService.mode === 'QUEUE') {
                await api.post('/queues/take', {
                    serviceId: selectedService.id,
                });
            } else {
                await api.post('/requests/submit', {
                    serviceId: selectedService.id,
                    remarks: applicationForm.remarks
                });
            }
            showToast('Submission successful', 'success');
            setShowBookingModal(false);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitFeedback = async (event) => {
        event.preventDefault();
        setSubmittingFeedback(true);
        try {
            await api.post('/feedback', {
                message: feedbackForm.message,
                rating: Number(feedbackForm.rating)
            });
            setFeedbackForm({ message: '', rating: '5' });
            showToast('Anonymous feedback submitted', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit feedback', 'error');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const renderServices = (title, services) => (
        <section className="space-y-4">
            <h3 className="text-2xl font-black">{title}</h3>
            {services.length === 0 ? (
                <Card className="rounded-3xl p-6 text-muted-foreground font-semibold">
                    {lang === 'en' ? 'No services available.' : 'ምንም አገልግሎቶች የሉም።'}
                </Card>
            ) : services.map((service) => (
                <Card
                    key={service.id}
                    className="rounded-3xl p-6 border-border bg-card flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary transition-colors animate-in fade-in duration-300"
                >
                    <div className="flex items-center gap-6 w-full">
                        <div className="flex-1 space-y-1">
                            <h4 className="font-black text-xl">{t[service.name] || service.name}</h4>
                            <p className="text-sm font-semibold text-muted-foreground">{t[service.description] || service.description}</p>
                            <p className="text-xs font-bold text-primary uppercase">{t[service.sectorName] || service.sectorName}</p>
                        </div>
                    </div>
                    <div>
                        <Button
                            className="rounded-xl font-bold h-10 w-full md:w-auto"
                            onClick={() => { setSelectedService(service); setShowBookingModal(true); }}
                        >
                            {service.mode === 'QUEUE' ? (lang === 'en' ? 'Take Queue' : 'ተርታ ይውሰዱ') : service.mode === 'APPOINTMENT' ? (lang === 'en' ? 'Book' : 'ቀጠሮ ይያዙ') : (lang === 'en' ? 'Request' : 'ማመልከቻ አስገባ')}
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            ))}
        </section>
    );

    if (loading) return <div className="animate-pulse space-y-6"><div className="h-48 bg-muted rounded-3xl" /></div>;

    return (
        <div className="space-y-6">
            {renderServices(lang === 'en' ? 'Appointments' : 'ቀጠሮዎች', appointmentServices)}
            <div className="py-2"><hr className="border-border opacity-50" /></div>
            {renderServices(lang === 'en' ? 'Queue' : 'ወረፋ (ተርታ)', queueServices)}
            <div className="py-2"><hr className="border-border opacity-50" /></div>
            {renderServices(lang === 'en' ? 'Citizen Support Services (Online)' : 'የዜጋ ድጋፍ አገልግሎቶች (ኦንላይን)', onlineServices)}

            <Card className="rounded-3xl p-6">
                <h3 className="text-2xl font-black mb-3 flex items-center gap-2">
                    <MessageSquareText className="w-6 h-6 text-primary" />
                    Anonymous Feedback
                </h3>
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="rating">Rating</Label>
                        <select
                            id="rating"
                            className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 font-bold"
                            value={feedbackForm.rating}
                            onChange={(e) => setFeedbackForm((prev) => ({ ...prev, rating: e.target.value }))}
                        >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Neutral</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Very Poor</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Share your feedback (fully anonymous)"
                            className="min-h-[120px] rounded-xl"
                            value={feedbackForm.message}
                            onChange={(e) => setFeedbackForm((prev) => ({ ...prev, message: e.target.value }))}
                            required
                        />
                    </div>
                    <Button type="submit" className="rounded-xl font-bold" disabled={submittingFeedback}>
                        {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </form>
            </Card>

            {/* Booking / Application Dialog */}
            <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}><DialogContent className="sm:max-w-[425px] rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{selectedService?.name}</DialogTitle>
                        <DialogDescription className="font-semibold text-muted-foreground">
                            {selectedService?.mode === 'APPOINTMENT' ? 'Schedule your visit to the office.' : 'Submit your digital application.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBooking} className="space-y-6 pt-4">
                        {selectedService?.mode === 'APPOINTMENT' ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="font-bold">Preferred Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        required
                                        className="h-12 rounded-xl"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingForm.date}
                                        onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time" className="font-bold">Time Slot</Label>
                                    <select
                                        id="time"
                                        className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 font-bold focus:ring-2 focus:ring-primary outline-none"
                                        required
                                        value={bookingForm.timeSlot}
                                        onChange={e => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                                    >
                                        <option value="">Select a slot</option>
                                        <option value="08:30 - 09:30">08:30 - 09:30</option>
                                        <option value="09:30 - 10:30">09:30 - 10:30</option>
                                        <option value="10:30 - 11:30">10:30 - 11:30</option>
                                        <option value="14:00 - 15:00">14:00 - 15:00</option>
                                        <option value="15:00 - 16:30">15:00 - 16:30</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="remarks" className="font-bold">Remarks / Details</Label>
                                <Textarea
                                    id="remarks"
                                    placeholder="Describe your request..."
                                    className="min-h-[120px] rounded-xl"
                                    value={applicationForm.remarks}
                                    onChange={e => setApplicationForm({ ...applicationForm, remarks: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-2">
                                    Your profile data will be attached automatically.
                                </p>
                            </div>
                        )}

                        <DialogFooter className="pt-4">
 <Button
                                type="submit"
                                className="w-full h-12 rounded-2xl font-black shadow-lg shadow-primary/20"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm submission'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}