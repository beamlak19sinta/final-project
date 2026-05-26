import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ForgotPassword() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/auth/forgot-password', { phoneNumber });
            const token = res.data.token;
            setSuccess('Redirecting to reset password...');
            navigate(`/reset-password?token=${token}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request reset token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-32">
            <Card className="w-full max-w-md rounded-[32px] border-border shadow-2xl overflow-hidden">
                <div className="bg-primary p-8 text-primary-foreground text-center">
                    <CardTitle className="text-2xl font-black">Forgot Password</CardTitle>
                    <CardDescription className="text-white/70 font-bold">Reset using your phone or email</CardDescription>
                </div>
                <form onSubmit={onSubmit}>
                    <CardContent className="p-8 space-y-4">
                        {error && <Badge variant="destructive" className="w-full justify-center">{error}</Badge>}
                        {success && <Badge className="w-full justify-center bg-green-600">{success}</Badge>}
                        <Input
                            placeholder="Phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </CardContent>
                    <CardFooter className="p-8 pt-0 flex flex-col gap-3">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Reset Token'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
