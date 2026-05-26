import React, { useState } from 'react';
import api, { getApiErrorMessage } from '../lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Feedback() {
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', text: '' });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            setStatus({ type: 'error', text: 'Message is required.' });
            return;
        }
        if (rating !== '' && (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)) {
            setStatus({ type: 'error', text: 'Rating must be between 1 and 5.' });
            return;
        }
        setLoading(true);
        setStatus({ type: '', text: '' });
        try {
            await api.post('/feedback', { message, rating: rating === '' ? null : Number(rating) });
            setStatus({ type: 'success', text: 'Thank you for your feedback.' });
            setMessage('');
            setRating('');
        } catch (err) {
            setStatus({ type: 'error', text: getApiErrorMessage(err, 'Failed to submit feedback') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-32">
            <Card className="w-full max-w-lg rounded-[32px] border-border shadow-2xl overflow-hidden">
                <div className="bg-primary p-8 text-primary-foreground text-center">
                    <CardTitle className="text-2xl font-black">Anonymous Feedback</CardTitle>
                    <CardDescription className="text-white/70 font-bold">Share your experience (no login required)</CardDescription>
                </div>
                <form onSubmit={onSubmit}>
                    <CardContent className="p-8 space-y-4">
                        {status.text && (
                            <Badge variant={status.type === 'error' ? 'destructive' : 'default'} className="w-full justify-center">
                                {status.text}
                            </Badge>
                        )}
                        <textarea
                            className="w-full min-h-32 rounded-xl border p-3"
                            placeholder="Write your feedback"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                        <Input
                            type="number"
                            min={1}
                            max={5}
                            placeholder="Optional rating (1-5)"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
