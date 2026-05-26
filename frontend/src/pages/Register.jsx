import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getApiErrorMessage } from '../lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Phone, Lock, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        identificationNumber: '',
        nationalId: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (!/^\d{16}$/.test(formData.nationalId)) {
            setError('National ID must be exactly 16 digits.');
            setLoading(false);
            return;
        }
        try {
            await api.post('/auth/register', { ...formData, role: 'CITIZEN' });
            navigate('/login');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Registration failed.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-32">
            <Card className="w-full max-w-md rounded-[32px] border-border shadow-2xl overflow-hidden my-12">
                <div className="bg-primary p-8 text-primary-foreground flex flex-col items-center gap-4">
                    <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                    <div className="text-center">
                        <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Citizen Registration</CardTitle>
                        <CardDescription className="text-white/70 font-bold">Create your digital profile</CardDescription>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <CardContent className="p-8 space-y-5">
                        {error && (
                            <Badge variant="destructive" className="w-full py-2 flex justify-center rounded-lg">
                                {error}
                            </Badge>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/50" />
                                <Input
                                    placeholder="John Doe"
                                    className="pl-10 h-12 rounded-xl"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/50" />
                                <Input
                                    type="tel"
                                    placeholder="0911XXXXXX"
                                    className="pl-10 h-12 rounded-xl"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">National ID (Required)</label>
                            <p className="text-xs text-muted-foreground">Enter exactly 16 numeric digits.</p>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/50" />
                                <Input
                                    placeholder="1234567890123456"
                                    className="pl-10 h-12 rounded-xl"
                                    value={formData.nationalId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nationalId: e.target.value.replace(/\D/g, '').slice(0, 16)
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/50" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12 rounded-xl"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-8 pt-0 flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
                        </Button>
                        <div className="text-center text-sm font-bold text-foreground/60">
                            Already have an account? <Link to="/login" className="text-primary hover:underline">Login here</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
