import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api, { getApiErrorMessage } from '../../lib/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    BellOff,
    Info,
    AlertTriangle,
    CheckCircle,
    Clock,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Notifications() {
    const { lang } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [markingRead, setMarkingRead] = useState(false);

    const fetchNotifications = async () => {
        setError('');
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.data || []);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to fetch notifications'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        setMarkingRead(true);
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to mark notification as read'));
        } finally {
            setMarkingRead(false);
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingRead(true);
        try {
            await api.patch('/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to mark all notifications as read'));
        } finally {
            setMarkingRead(false);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to delete notification'));
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'ERROR': return <AlertTriangle className="w-5 h-5 text-destructive" />;
            default: return <Info className="w-5 h-5 text-primary" />;
        }
    };

    if (loading) return <div className="animate-pulse space-y-4"><div className="h-20 bg-muted rounded-2xl" /></div>;

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">{lang === 'en' ? 'Notifications' : 'ማሳወቂያዎች'}</h2>
                    <p className="text-muted-foreground font-semibold">Stay updated with your service status and system alerts.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold border-border"
                        onClick={fetchNotifications}
                        disabled={loading || markingRead}
                    >
                        Refresh
                    </Button>
                    {notifications.length > 0 && notifications.some((n) => !n.isRead) && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-xl font-bold"
                            onClick={handleMarkAllRead}
                            disabled={loading || markingRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>
            {error ? <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-4 text-destructive font-semibold">{error}</div> : null}
            {notifications.length > 0 ? (
                <div className="grid gap-4">
                    {notifications.map((n) => (
                        <Card key={n.id} className={`rounded-3xl border-border transition-all overflow-hidden ${n.isRead ? 'bg-card/50 opacity-80' : 'bg-card border-l-4 border-l-primary'}`}>
                            <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-start">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.isRead ? 'bg-muted' : 'bg-primary/10'}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <h4 className={`font-black text-lg ${n.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                                            {n.title}
                                        </h4>
                                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`font-medium leading-relaxed ${n.isRead ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                                        {n.message}
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        {!n.isRead && (
                                            <Button variant="link" className="p-0 h-auto text-primary font-black text-xs" onClick={() => markAsRead(n.id)}>
                                                Mark as read
                                            </Button>
                                        )}
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-muted-foreground hover:text-destructive font-black text-xs flex items-center gap-1"
                                            onClick={() => deleteNotification(n.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[40px] p-20 border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <BellOff className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-muted-foreground">No Notifications</h3>
                        <p className="text-muted-foreground font-semibold max-w-sm mx-auto">
                            We'll notify you here when there's an update on your services or account.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
