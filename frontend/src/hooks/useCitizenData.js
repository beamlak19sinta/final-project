import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

const mapApprovedSectors = (dbSectors) => {
    if (!dbSectors || !Array.isArray(dbSectors)) return [];
    return dbSectors;
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