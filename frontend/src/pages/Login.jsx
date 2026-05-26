import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getApiErrorMessage } from '../lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Lock, Loader2 } from 'lucide-react';

export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', {
                phoneNumber,
                password
            });

            console.log("FULL RESPONSE:", response.data);

            // FIXED: safe extraction
            const data = response.data?.data || response.data;
            const user = data.user;
            const token = data.token;

            if (!user || !token) {
                throw new Error("Invalid response from server");
            }

            // save auth
            login(user, token);
            localStorage.setItem('token', token);

            console.log("TOKEN SAVED:", token);

            // redirect by role
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else if (user.role === 'HELPDESK' || user.role === 'HELP_DESK') {
                navigate('/help-desk');
            } else if (user.role === 'OFFICER' || user.role === 'HELPDESK' || user.role === 'HELP_DESK') {
                navigate('/officer');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            console.error("LOGIN ERROR:", err);
            setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-32">
            <Card className="w-full max-w-md rounded-[32px] border-border shadow-2xl overflow-hidden">

                <div className="bg-primary p-8 text-primary-foreground flex flex-col items-center gap-4">
                    <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                    <div className="text-center">
                        <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">
                            Dagmawi Menelik
                        </CardTitle>
                        <CardDescription className="text-white/70 font-bold">
                            Portal Access
                        </CardDescription>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <CardContent className="p-8 space-y-6">

                        {error && (
                            <Badge variant="destructive" className="w-full py-2 flex justify-center rounded-lg">
                                {error}
                            </Badge>
                        )}

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/50" />
                                <Input
                                    type="tel"
                                    placeholder="0911XXXXXX"
                                    className="pl-10 h-12 rounded-xl"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/50" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12 rounded-xl"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                    </CardContent>

                    <CardFooter className="p-8 pt-0 flex flex-col gap-4">

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl text-lg font-bold"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Login'
                            )}
                        </Button>

                        <div className="text-center text-sm font-bold text-muted-foreground">
                            <Link to="/forgot-password" className="text-primary hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <div className="text-center text-sm font-bold text-muted-foreground">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary hover:underline">
                                Register here
                            </Link>
                        </div>

                    </CardFooter>
                </form>

            </Card>
        </div>
    );
}
