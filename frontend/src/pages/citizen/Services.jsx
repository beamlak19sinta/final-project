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
    
    let queueId = '';
    let appointmentId = '';
    let onlineId = '';
    
    for (const s of dbSectors) {
        if (s.services && Array.isArray(s.services)) {
            for (const x of s.services) {
                if (x.mode === 'QUEUE' && !queueId) queueId = x.id;
                if (x.mode === 'APPOINTMENT' && !appointmentId) appointmentId = x.id;
                if (x.mode === 'ONLINE' && !onlineId) onlineId = x.id;
            }
        }
    }
    
    if (!queueId) queueId = 'fallback-queue-id';
    if (!appointmentId) appointmentId = 'fallback-appointment-id';
    if (!onlineId) onlineId = 'fallback-online-id';
    
    return [
        {
            id: 'sector-civil',
            name: 'Civil Status Services',
            description: 'Birth certificates, marriage registrations, land titles, household registration, and civil status changes.',
            services: [
                { id: queueId, name: 'National Digital ID Registration', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Register for a new digital national identity card.', sectorName: 'Civil Status Services' },
                { id: queueId, name: 'National Digital ID Renewal', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Renew an expired national digital identity card.', sectorName: 'Civil Status Services' },
                { id: queueId, name: 'Lost National ID Replacement', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request replacement for a lost or damaged identity card.', sectorName: 'Civil Status Services' },
                { id: queueId, name: 'Kebele Household Registration', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Queue for family household member registration.', sectorName: 'Civil Status Services' },
                { id: queueId, name: 'Resident ID Verification', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Verify local residential identity records.', sectorName: 'Civil Status Services' },
                { id: queueId, name: 'Civil Registration Record Verification', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Verify civil status, birth, or marriage registration records.', sectorName: 'Civil Status Services' },
                { id: appointmentId, name: 'Birth Certificate Request', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Schedule birth certificate verification and printing.', sectorName: 'Civil Status Services' },
                { id: appointmentId, name: 'Death Certificate Request', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Schedule death certificate verification and registration.', sectorName: 'Civil Status Services' },
                { id: appointmentId, name: 'Boundary Verification Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Book surveyor appointment for boundary check.', sectorName: 'Civil Status Services' },
                { id: appointmentId, name: 'Agricultural Land Certification Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Book appointment for agricultural land registration.', sectorName: 'Civil Status Services' },
                { id: onlineId, name: 'Request Document Correction', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Request corrections to official birth/marriage certificates.', sectorName: 'Civil Status Services' },
                { id: onlineId, name: 'Land Information Inquiry Portal', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Inquire about land registers, zoning, and plots.', sectorName: 'Civil Status Services' }
            ]
        },
        {
            id: 'sector-immigration',
            name: 'Immigration and Nationality',
            description: 'Passport applications, renewals, visa assistance, and official nationality document validations.',
            services: [
                { id: appointmentId, name: 'Passport Document Verification', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Verify original documents for passport registration.', sectorName: 'Immigration and Nationality' },
                { id: appointmentId, name: 'Immigration Interview Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Required interview for residency or travel permits.', sectorName: 'Immigration and Nationality' }
            ]
        },
        {
            id: 'sector-transport',
            name: 'Transport and Logistics',
            description: 'Vehicle registration, ownership transfers, driving licenses, and transport permit queues.',
            services: [
                { id: queueId, name: 'Vehicle Ownership Transfer', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Queue for registering vehicle purchase and transfer.', sectorName: 'Transport and Logistics' },
                { id: queueId, name: 'Driving License Renewal', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Queue for renewal or replacement of driver license.', sectorName: 'Transport and Logistics' }
            ]
        },
        {
            id: 'sector-tax',
            name: 'Revenue and Tax',
            description: 'Tax declarations, payments, clearance requests, and corporate tax inquiry services.',
            services: [
                { id: queueId, name: 'TIN Number Registration', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Register and obtain Tax Identification Number.', sectorName: 'Revenue and Tax' },
                { id: appointmentId, name: 'Tax Clearance Collection Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Collect official annual tax clearance statement.', sectorName: 'Revenue and Tax' },
                { id: appointmentId, name: 'Revenue Service Consultation', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Formal consulting with tax officers.', sectorName: 'Revenue and Tax' },
                { id: appointmentId, name: 'Property Valuation Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Property valuation and assessment session.', sectorName: 'Revenue and Tax' },
                { id: onlineId, name: 'Tax Record Summary Inquiry', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Retrieve tax statement records and payments.', sectorName: 'Revenue and Tax' }
            ]
        },
        {
            id: 'sector-business',
            name: 'Business and Trade',
            description: 'Register names, obtain licenses, and consult with urban planning for commercial buildings.',
            services: [
                { id: queueId, name: 'Business License Renewal', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Queue for annual renewal of commercial licenses.', sectorName: 'Business and Trade' },
                { id: appointmentId, name: 'Urban Planning Approval Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Plan review for construction permits.', sectorName: 'Business and Trade' },
                { id: appointmentId, name: 'Investment License Consultation', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Consult with investment board specialists.', sectorName: 'Business and Trade' },
                { id: appointmentId, name: 'Construction Permit Inspection Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Schedule onsite inspection for construction permit.', sectorName: 'Business and Trade' },
                { id: appointmentId, name: 'Business Inspection Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Onsite inspection for commercial businesses.', sectorName: 'Business and Trade' },
                { id: onlineId, name: 'Business Name Availability Check', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Search database for name availability.', sectorName: 'Business and Trade' }
            ]
        },
        {
            id: 'sector-general',
            name: 'General Inquiry',
            description: 'Social support, police clearances, certificates authentication, utility connection request and other general public queries.',
            services: [
                { id: queueId, name: 'Police Clearance Application', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request fingerprinting and background checks.', sectorName: 'General Inquiry' },
                { id: queueId, name: 'Education Certificate Authentication', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Authenticate school/university degrees.', sectorName: 'General Inquiry' },
                { id: queueId, name: 'Land Title Transfer Submission', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Submit documents for official land ownership transfer.', sectorName: 'General Inquiry' },
                { id: queueId, name: 'Utility Bill Support Counter', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Resolve utility bill issues and payment disputes.', sectorName: 'General Inquiry' },
                { id: queueId, name: 'Government Document Collection', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Collect approved and printed official documents.', sectorName: 'General Inquiry' },
                { id: appointmentId, name: 'Social Support Service Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Meet with social worker for welfare assessment.', sectorName: 'General Inquiry' },
                { id: appointmentId, name: 'New Water Connection Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request new water infrastructure installation connection.', sectorName: 'General Inquiry' },
                { id: appointmentId, name: 'New Electricity Connection Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request new electricity power installation connection.', sectorName: 'General Inquiry' },
                { id: appointmentId, name: 'Court Hearing Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Register for scheduled court arbitration.', sectorName: 'General Inquiry' },
                { id: appointmentId, name: 'Public Housing Application Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Apply for public/governmental housing schemes.', sectorName: 'General Inquiry' },
                { id: appointmentId, name: 'Land Lease Consultation Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Consultation for leasing government/urban land.', sectorName: 'General Inquiry' },
                { id: appointmentId, name: 'Disability Support Registration Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Registration for disability welfare programs.', sectorName: 'General Inquiry' },
                { id: onlineId, name: 'Download Government Forms', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Download PDF applications and regulations.', sectorName: 'General Inquiry' },
                { id: onlineId, name: 'Submit Complaint', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Submit formal service complaints to city board.', sectorName: 'General Inquiry' },
                { id: onlineId, name: 'Submit Feedback', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Submit anonymous portal usability reviews.', sectorName: 'General Inquiry' },
                { id: onlineId, name: 'Utility Bill Information Check', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Check unpaid utility bill dues.', sectorName: 'General Inquiry' },
                { id: onlineId, name: 'Government Notices Board', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Read latest municipal newsletters.', sectorName: 'General Inquiry' },
                { id: onlineId, name: 'Lost Document Reporting', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Formally report lost cards or files.', sectorName: 'General Inquiry' },
                { id: onlineId, name: 'FAQ Help Center', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Read dynamic help center answers.', sectorName: 'General Inquiry' }
            ]
        },
        {
            id: 'sector-support',
            name: 'Technical Support',
            description: 'Track applications, check status, verify certificates, and view notification center.',
            services: [
                { id: onlineId, name: 'Check Application Status (All Services)', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Verify queue status or online request.', sectorName: 'Technical Support' },
                { id: onlineId, name: 'Certificate Verification System', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Verify integrity of printed QR certificates.', sectorName: 'Technical Support' },
                { id: onlineId, name: 'Application Tracking System', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Dynamic dashboard tracking current requests.', sectorName: 'Technical Support' },
                { id: onlineId, name: 'Notification Center', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Real-time alert log.', sectorName: 'Technical Support' }
            ]
        }
    ];
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