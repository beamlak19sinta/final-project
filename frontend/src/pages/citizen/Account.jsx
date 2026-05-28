import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User,
    Lock,
    Phone,
    Fingerprint,
    ShieldCheck,
    Save,
    KeyRound
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Account() {
    const { user, updateProfileUser } = useAuth();
    const { lang } = useLanguage();
    const { showToast } = useToast();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phoneNumber: user?.phoneNumber || ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await api.patch('/auth/profile', profileForm);
            updateProfileUser(data.user);
            setIsEditingProfile(false);
            showToast('Profile updated successfully', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return showToast('New passwords do not match', 'error');
        }
        setIsSubmitting(true);
        try {
            await api.patch('/auth/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setIsChangingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showToast('Password updated successfully', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update password', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-black tracking-tight">{lang === 'en' ? 'My Account' : 'መለያዬ'}</h2>
                <p className="text-muted-foreground font-semibold">Manage your profile and security settings.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[40px] overflow-hidden border-border bg-card">
                        <div className="h-32 bg-primary/10 relative">
                            <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-3xl bg-primary border-4 border-background flex items-center justify-center text-primary-foreground text-4xl font-black shadow-xl">
                                <User className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="pt-16 p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-3xl font-black">{user?.name}</h3>
                                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs flex items-center gap-2 mt-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified Citizen
                                    </p>
                                </div>
                                {!isEditingProfile && (
                                    <Button
                                        onClick={() => setIsEditingProfile(true)}
                                        variant="outline"
                                        className="rounded-xl font-bold border-border"
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </div>

                            {isEditingProfile ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-6 animate-in fade-in duration-300">
                                    <Separator />
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="font-bold">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    value={profileForm.name}
                                                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    className="pl-10 h-12 rounded-xl"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="font-bold">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    value={profileForm.phoneNumber}
                                                    onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                                                    className="pl-10 h-12 rounded-xl"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            type="submit"
                                            className="rounded-xl font-black gap-2 px-6"
                                            disabled={isSubmitting}
                                        >
                                            <Save className="w-4 h-4" /> Save Changes
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="rounded-xl font-bold"
                                            onClick={() => setIsEditingProfile(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <Separator />
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Phone Number</div>
                                            <div className="font-bold text-lg flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-primary" /> {user?.phoneNumber}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Identification</div>
                                            <div className="font-bold text-lg flex items-center gap-2">
                                                <Fingerprint className="w-4 h-4 text-primary" /> {user?.identificationNumber || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Account ID</div>
                                            <div className="font-mono text-sm bg-muted px-2 py-1 rounded truncate">
                                                {user?.id}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Member Since</div>
                                            <div className="font-bold text-lg">
                                                {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Security Card */}
                <div className="space-y-8">
                    <Card className="rounded-[40px] border-border bg-card overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-6 border-b border-border">
                            <CardTitle className="flex items-center gap-3">
                                <Lock className="w-6 h-6 text-primary" />
                                <span className="font-black">Security</span>
                            </CardTitle>
                            <CardDescription className="font-semibold">Manage your authentication settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            {isChangingPassword ? (
                                <form onSubmit={handleUpdatePassword} className="space-y-4 animate-in slide-in-from-top duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase">Current Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="rounded-xl h-11"
                                            value={passwordForm.currentPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase">New Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="rounded-xl h-11"
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase">Confirm New Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="rounded-xl h-11"
                                            value={passwordForm.confirmPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 pt-4">
                                        <Button
                                            type="submit"
                                            className="w-full h-11 rounded-xl font-black gap-2"
                                            disabled={isSubmitting}
                                        >
                                            <KeyRound className="w-4 h-4" /> Update Password
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full h-11 rounded-xl font-bold"
                                            onClick={() => setIsChangingPassword(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col gap-4 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto text-primary">
                                            <KeyRound className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black">Two-Step Verification</p>
                                            <p className="text-xs text-muted-foreground font-semibold">Change your password to keep your account safe.</p>
                                        </div>
                                        <Button
                                            onClick={() => setIsChangingPassword(true)}
                                            className="rounded-xl font-black h-11"
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
