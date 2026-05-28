import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HelpDesk() {
    const supportRequirements = [
        { service: 'Birth Certificate Online Request', items: ['Parent ID', 'Hospital certificate', 'Child name'] },
        { service: 'Marriage Certificate Online Request', items: ['Both partner IDs', 'Witness documents'] },
        { service: 'Title Transfer Online Service', items: ['Previous ownership document', 'ID verification', 'Tax clearance'] },
        { service: 'Land Management Service', items: ['Land parcel reference', 'Owner ID verification', 'Latest tax receipt'] },
        { service: 'ID Card Renewal / Digital ID Renewal', items: ['Old ID card', 'Recent photo'] },
    ];
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusText, setStatusText] = useState('');
    const [questionActionLoading, setQuestionActionLoading] = useState(false);
    const [answerDrafts, setAnswerDrafts] = useState({});

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const qRes = await api.get('/helpdesk/questions/triage');
                setAllQuestions(qRes.data?.data || []);
            } catch {
                setAllQuestions([]);
                setStatusText('Failed to load internal help desk queue.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const refreshQuestions = async () => {
        const qRes = await api.get('/helpdesk/questions/triage');
        setAllQuestions(qRes.data?.data || []);
    };

    const handleAnswer = async (questionId) => {
        const answer = (answerDrafts[questionId] || '').trim();
        if (!answer) {
            setStatusText('Please write an answer before submitting.');
            return;
        }
        setQuestionActionLoading(true);
        setStatusText('');
        try {
            await api.post('/helpdesk/questions/answer', { questionId, answer });
            await refreshQuestions();
            setAnswerDrafts((prev) => ({ ...prev, [questionId]: '' }));
            setStatusText('Question answered successfully.');
        } catch {
            setStatusText('Failed to answer question.');
        } finally {
            setQuestionActionLoading(false);
        }
    };

    const handleForward = async (questionId) => {
        setQuestionActionLoading(true);
        setStatusText('');
        try {
            await api.post('/helpdesk/questions/forward', { questionId });
            await refreshQuestions();
            setStatusText('Question forwarded to admin.');
        } catch {
            setStatusText('Failed to forward question.');
        } finally {
            setQuestionActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Help Desk Internal Dashboard</CardTitle>
                    <CardDescription>Internal request triage and escalation workflow</CardDescription>
                </CardHeader>
            </Card>

            {statusText ? <Badge variant="destructive">{statusText}</Badge> : null}

            <Card>
                <CardHeader><CardTitle>Question Triage Queue</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {loading ? <p className="font-semibold text-muted-foreground">Loading requests...</p> : null}
                    {allQuestions.length === 0 && !loading ? (
                        <p className="text-sm text-muted-foreground font-semibold">No pending questions available.</p>
                    ) : null}
                    {allQuestions.map((q) => (
                        <div key={q.id} className="p-4 border rounded-xl space-y-2">
                            <p className="font-semibold">{q.question}</p>
                            <p className="text-xs text-muted-foreground">Status: {q.status || 'PENDING'}</p>
                            {!q.reply ? (
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full min-h-20 rounded-xl border p-2"
                                        value={answerDrafts[q.id] || ''}
                                        onChange={(e) => setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                        placeholder="Write internal response"
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleAnswer(q.id)} disabled={questionActionLoading}>Answer</Button>
                                        <Button variant="outline" onClick={() => handleForward(q.id)} disabled={questionActionLoading}>Forward</Button>
                                    </div>
                                </div>
                            ) : (
                                <Badge>Answered</Badge>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Service Requirements Notes</CardTitle>
                    <CardDescription>Reference notes for support responses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {supportRequirements.map((entry) => (
                        <div key={entry.service} className="p-3 border rounded-xl">
                            <p className="font-semibold">{entry.service}</p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground font-semibold mt-1 space-y-1">
                                {entry.items.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
