import React, { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CitizenQuestions() {
    const [question, setQuestion] = useState('');
    const [status, setStatus] = useState({ type: '', text: '' });
    const [myQuestions, setMyQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadMyQuestions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/helpdesk/questions/my');
            setMyQuestions(res.data?.data || []);
        } catch (err) {
            setMyQuestions([]);
            setStatus({ type: 'error', text: getApiErrorMessage(err, 'Failed to load your questions') });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyQuestions();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        const trimmedQuestion = question.trim();
        if (!trimmedQuestion) {
            setStatus({ type: 'error', text: 'Question is required.' });
            return;
        }
        setSubmitting(true);
        setStatus({ type: '', text: '' });
        try {
            await api.post('/helpdesk/questions', { question: trimmedQuestion });
            setStatus({ type: 'success', text: 'Question submitted.' });
            setQuestion('');
            await loadMyQuestions();
        } catch (err) {
            setStatus({ type: 'error', text: getApiErrorMessage(err, 'Failed to submit question') });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="rounded-3xl">
            <CardHeader>
                <CardTitle>Citizen Questions</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-3">
                    {status.text ? <Badge variant={status.type === 'error' ? 'destructive' : 'default'}>{status.text}</Badge> : null}
                    <textarea
                        className="w-full min-h-28 rounded-xl border p-3"
                        placeholder="Ask your question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send Question'}</Button>
                </form>
                <div className="mt-8 space-y-3">
                    <h3 className="text-lg font-black">My Submitted Questions</h3>
                    {loading ? (
                        <p className="text-sm font-semibold text-muted-foreground">Loading your questions...</p>
                    ) : null}
                    {!loading && myQuestions.length === 0 ? (
                        <p className="text-sm font-semibold text-muted-foreground">No questions submitted yet.</p>
                    ) : (
                        myQuestions.map((item) => (
                            <div key={item.id} className="rounded-xl border p-3 space-y-2">
                                <p className="font-semibold">{item.question}</p>
                                {item.reply ? (
                                    <div className="text-sm text-green-600 font-semibold">
                                        Reply: {item.reply}
                                    </div>
                                ) : (
                                    <Badge variant="outline">Awaiting admin reply</Badge>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
