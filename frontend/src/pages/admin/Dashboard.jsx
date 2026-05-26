import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
    MessageSquare,
    Star,
    ClipboardList,
    TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';

export default function Dashboard() {
    const [analytics, setAnalytics] = useState({
        feedback: { totalFeedback: 0, averageRating: 0, highestRatedFeedbackCount: 0, ratingDistribution: [], sentiment: [], timeline: [], highestRatedTrend: [] },
        serviceUsage: { appointmentUsage: [], queueUsage: [], onlineRequestsCount: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/analytics/admin-dashboard');
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        { label: 'Total Feedback', value: analytics.feedback.totalFeedback, icon: MessageSquare },
        { label: 'Average Rating', value: analytics.feedback.averageRating, icon: Star },
        { label: 'Online Service Requests', value: analytics.serviceUsage.onlineRequestsCount, icon: ClipboardList },
        { label: 'Highest Rated Feedback Trend', value: analytics.feedback.highestRatedFeedbackCount, icon: TrendingUp },
    ];
    const sentimentColors = ['#16a34a', '#f59e0b', '#dc2626'];

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-muted rounded-2xl w-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="h-40 bg-muted rounded-[32px]" />
                    <div className="h-40 bg-muted rounded-[32px]" />
                    <div className="h-40 bg-muted rounded-[32px]" />
                    <div className="h-40 bg-muted rounded-[32px]" />
                </div>
                <div className="h-80 bg-muted rounded-[32px]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl font-black tracking-tight">Admin Analytics Dashboard</h1>
                <p className="text-muted-foreground font-semibold mt-2">Feedback analytics, sentiment, and service usage insights.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="rounded-[32px] border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                                    <stat.icon className="w-8 h-8" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-5xl font-black text-foreground">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-[32px] border-border bg-card">
                    <CardHeader><CardTitle>Rating Distribution (1-5)</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.feedback.ratingDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="rating" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="rounded-[32px] border-border bg-card">
                    <CardHeader><CardTitle>Feedback Sentiment</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={analytics.feedback.sentiment} dataKey="value" nameKey="name" outerRadius={110} label>
                                    {analytics.feedback.sentiment.map((entry, index) => (
                                        <Cell key={entry.name} fill={sentimentColors[index % sentimentColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-[32px] border-border bg-card">
                    <CardHeader><CardTitle>Feedback Over Time</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.feedback.timeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line dataKey="count" stroke="#7c3aed" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="rounded-[32px] border-border bg-card">
                    <CardHeader><CardTitle>Highest Rated Feedback Trend</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.feedback.highestRatedTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line dataKey="count" stroke="#16a34a" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-[32px] border-border bg-card">
                    <CardHeader><CardTitle>Most Used Appointment Services</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.serviceUsage.appointmentUsage}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" hide />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#0f766e" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="rounded-[32px] border-border bg-card">
                    <CardHeader><CardTitle>Queue Usage Statistics</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.serviceUsage.queueUsage}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#ea580c" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
