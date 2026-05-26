import React, { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import { Button } from '@/components/ui/button';

const chartColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];
const periodOptions = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' }
];

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({
        summary: {},
        trends: { daily: [], weekly: [], monthly: [] },
        appointmentsPerDay: [],
        statusDistribution: [],
        queueUsage: [],
        topServices: []
    });
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get('/admin/reports');
                setReportData(res.data?.data || {});
            } catch (err) {
                setError(getApiErrorMessage(err, 'Unable to load admin reports'));
                setReportData({
                    summary: {},
                    trends: { daily: [], weekly: [], monthly: [] },
                    appointmentsPerDay: [],
                    statusDistribution: [],
                    queueUsage: [],
                    topServices: []
                });
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const activeTrendData = reportData.trends[selectedPeriod] || [];
    const summary = reportData.summary || {};

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black">Admin Reports</h1>
                        <p className="text-muted-foreground font-semibold">Performance analytics for appointments, queues, and services.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {periodOptions.map((option) => (
                            <Button
                                key={option.id}
                                variant={selectedPeriod === option.id ? 'secondary' : 'outline'}
                                onClick={() => setSelectedPeriod(option.id)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>
                {error ? <p className="text-destructive font-semibold">{error}</p> : null}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-6">
                    <CardHeader><CardTitle>Total Appointments</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black">{summary.totalAppointments ?? 0}</p>
                    </CardContent>
                </Card>
                <Card className="p-6">
                    <CardHeader><CardTitle>Total Queue Items</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black">{summary.totalQueues ?? 0}</p>
                    </CardContent>
                </Card>
                <Card className="p-6">
                    <CardHeader><CardTitle>Active Queues</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black">{summary.activeQueues ?? 0}</p>
                    </CardContent>
                </Card>
                <Card className="p-6">
                    <CardHeader><CardTitle>Top Services</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {(reportData.topServices || []).map((service) => (
                                <li key={service.name} className="font-semibold text-sm">
                                    {service.name} · {service.count}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activeTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="appointments" stackId="1" stroke="#3b82f6" fill="#bfdbfe" />
                            <Area type="monotone" dataKey="queues" stackId="1" stroke="#22c55e" fill="#bbf7d0" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Appointments Per Day</CardTitle></CardHeader>
                <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reportData.appointmentsPerDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Status Distribution</CardTitle></CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={reportData.statusDistribution} dataKey="value" nameKey="status" outerRadius={100} label>
                                    {reportData.statusDistribution.map((entry, index) => (
                                        <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Queue Usage</CardTitle></CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.queueUsage}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#22c55e" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
