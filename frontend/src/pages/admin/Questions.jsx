import React, { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminQuestions() {
    const [questions, setQuestions] = useState([]);
    const [replyDrafts, setReplyDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sendingId, setSendingId] = useState('');

    const loadQuestions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/questions');
            setQuestions(res.data?.data || []);
        } catch (err) {
            setQuestions([]);
            setError(getApiErrorMessage(err, 'Failed to fetch questions'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuestions();
    }, []);

    const submitReply = async (id) => {
        const reply = (replyDrafts[id] || '').trim();
        if (!reply) return;
        setSendingId(id);
        try {
            await api.patch(`/admin/questions/${id}/reply`, { reply });
            await loadQuestions();
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to send reply'));
        } finally {
            setSendingId('');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Citizen Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error ? <Badge variant="destructive">{error}</Badge> : null}
                {loading ? <p className="font-semibold text-muted-foreground">Loading questions...</p> : null}
                {questions.map((q) => (
                    <div key={q.id} className="border rounded-xl p-4 space-y-3">
                        <div className="text-sm text-muted-foreground">{q.user?.name || 'Anonymous'} ({q.user?.phoneNumber || 'N/A'})</div>
                        <div className="font-semibold">{q.question}</div>
                        <div className="text-xs text-muted-foreground">Status: {q.status || 'PENDING'}</div>
                        {q.reply ? (
                            <div className="text-sm text-green-600 font-semibold">Reply: {q.reply}</div>
                        ) : (
                            <div className="space-y-2">
                                <textarea
                                    className="w-full min-h-20 rounded-xl border p-2"
                                    value={replyDrafts[q.id] || ''}
                                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                    placeholder="Write admin reply"
                                />
                                <Button size="sm" onClick={() => submitReply(q.id)} disabled={sendingId === q.id}>
                                    {sendingId === q.id ? 'Sending...' : 'Send Reply'}
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
