import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ResetPassword() {
    const token = new URLSearchParams(window.location.search).get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!token) {
            setError('Missing reset token');
            return;
        }
        if (newPassword.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSuccess('Password reset successful. You can now login.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-32">
            <Card className="w-full max-w-md rounded-[32px] border-border shadow-2xl overflow-hidden">
                <div className="bg-primary p-8 text-primary-foreground text-center">
                    <CardTitle className="text-2xl font-black">Reset Password</CardTitle>
                    <CardDescription className="text-white/70 font-bold">Use your reset token and set a new password</CardDescription>
                </div>
                <form onSubmit={onSubmit}>
                    <CardContent className="p-8 space-y-4">
                        {error && <Badge variant="destructive" className="w-full justify-center">{error}</Badge>}
                        {success && <Badge className="w-full justify-center bg-green-600">{success}</Badge>}
                        <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </CardContent>
                    <CardFooter className="p-8 pt-0 flex flex-col gap-3">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                        <Link to="/login" className="text-primary text-sm font-bold hover:underline">Back to login</Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
