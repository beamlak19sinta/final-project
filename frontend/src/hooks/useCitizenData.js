import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

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
                { id: queueId, name: 'Digital ID Registration', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Register for a new digital national identity card.', sectorName: 'Civil Status Services' },
                { id: queueId, name: 'Digital ID Renewal', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Renew an expired national digital identity card.', sectorName: 'Civil Status Services' },
                { id: queueId, name: 'Lost ID Replacement', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request replacement for a lost or damaged identity card.', sectorName: 'Civil Status Services' },
                { id: queueId, name: 'Land Title Transfer', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Transfer of official land ownership deeds and titles.', sectorName: 'Civil Status Services' },
                { id: queueId, name: 'Kebele Household Registration Queue', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Queue for family household member registration.', sectorName: 'Civil Status Services' },
                { id: appointmentId, name: 'Birth Certificate Request', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Schedule birth certificate verification and printing.', sectorName: 'Civil Status Services' },
                { id: appointmentId, name: 'Death Certificate Request', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Schedule death certificate verification and registration.', sectorName: 'Civil Status Services' },
                { id: appointmentId, name: 'Boundary Verification', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Book surveyor appointment for boundary check.', sectorName: 'Civil Status Services' },
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
                { id: appointmentId, name: 'Tax Clearance Collection', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Collect official annual tax clearance statement.', sectorName: 'Revenue and Tax' },
                { id: appointmentId, name: 'Revenue Service Consultation', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Formal consulting with tax officers.', sectorName: 'Revenue and Tax' },
                { id: appointmentId, name: 'Property Valuation', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Property valuation and assessment session.', sectorName: 'Revenue and Tax' },
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
                { id: appointmentId, name: 'Investment License Consultation Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Consult with investment board specialists.', sectorName: 'Business and Trade' },
                { id: onlineId, name: 'Business Name Availability Check', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Search database for name availability.', sectorName: 'Business and Trade' }
            ]
        },
        {
            id: 'sector-general',
            name: 'General Inquiry',
            description: 'Social support, police clearances, certificates authentication, utility connection request and other general public queries.',
            services: [
                { id: queueId, name: 'Education Certificate Authentication Queue', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Authenticate school/university degrees.', sectorName: 'General Inquiry' },
                { id: queueId, name: 'Police Clearance Application Queue', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request fingerprinting and background checks.', sectorName: 'General Inquiry' },
                { id: appointmentId, name: 'Social Support Services', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Meet with social worker for welfare assessment.', sectorName: 'General Inquiry' },
                { id: appointmentId, name: 'New Utility Connection Request', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request new water, power or waste connection.', sectorName: 'General Inquiry' },
                { id: appointmentId, name: 'Court Hearing Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Register for scheduled court arbitration.', sectorName: 'General Inquiry' },
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

export function useCitizenData() {

    const [sectors, setSectors] = useState([]);
    const [activeQueue, setActiveQueue] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [onlineRequests, setOnlineRequests] = useState([]);
    const [queueHistory, setQueueHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const { showToast } = useToast();

    // ✅ SAFE DATA EXTRACTOR
    const extractData = (res) => {
        if (!res) return [];
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        if (Array.isArray(res.data?.appointments)) return res.data.appointments;
        return res.data || [];
    };

    // ✅ FIXED FETCH (no crash if one fails)
    const fetchData = useCallback(async () => {

        setLoading(true);

        try {
            const results = await Promise.allSettled([
                api.get('/services/citizen'),
                api.get('/queues/my-status'),
                api.get('/appointments/my'),
                api.get('/queues/my-history'),
                api.get('/requests/my-requests')
            ]);

            // ✅ sectors
            if (results[0].status === 'fulfilled') {
                const sectorsRes = results[0].value;
                console.log("SERVICES:", sectorsRes.data);
                setSectors(mapApprovedSectors(sectorsRes.data || []));
            }

            // ✅ active queue
            if (results[1].status === 'fulfilled') {
                setActiveQueue(results[1].value.data || null);
            }

            // ✅ appointments (MAIN FIX 🔥)
            if (results[2].status === 'fulfilled') {
                const data = extractData(results[2].value);
                console.log("CITIZEN APPOINTMENTS:", data);
                setAppointments(Array.isArray(data) ? data : []);
            }

            // ✅ history
            if (results[3].status === 'fulfilled') {
                setQueueHistory(extractData(results[3].value));
            }

            // ✅ requests
            if (results[4].status === 'fulfilled') {
                setOnlineRequests(extractData(results[4].value));
            }

        } catch (err) {
            console.error('Unexpected error:', err);
            showToast('Failed to fetch dashboard data', 'error');
        } finally {
            setLoading(false);
        }

    }, [showToast]);

    // ✅ INITIAL LOAD + POLLING
    useEffect(() => {

        fetchData();

        const interval = setInterval(async () => {
            try {
                const { data } = await api.get('/queues/my-status');
                setActiveQueue(data);
            } catch (err) {
                console.error('Status poll failed', err);
            }
        }, 10000);

        return () => clearInterval(interval);

    }, [fetchData]);

    return {
        sectors,
        activeQueue,
        appointments,
        onlineRequests,
        queueHistory,
        loading,
        refresh: fetchData,
        setActiveQueue
    };
}