import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import {
    Search,
    User as UserIcon,
    MoreVertical,
    Plus,
    Edit3,
    Trash2,
    Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function UserManagement() {
    const { lang } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        name: '',
        phoneNumber: '',
        nationalId: '',
        password: '',
        role: 'CITIZEN'
    });

    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
    const [formError, setFormError] = useState(null);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/users');
            if (Array.isArray(res.data)) {
                setUsers(res.data);
            } else {
                setError('Received invalid data from server');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setFormError(null);
        try {
            if (editingUser) {
                // Determine if we need to send password
                const data = { ...userForm };
                if (!data.password) delete data.password;

                await api.patch(`/admin/users/${editingUser.id}`, data);
            } else {
                await api.post('/auth/register', userForm);
            }
            setShowUserModal(false);
            setEditingUser(null);
            setUserForm({ name: '', phoneNumber: '', nationalId: '', password: '', role: 'CITIZEN' });
            fetchUsers();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || 'Failed to save user');
        }
    };

    const confirmDeleteUser = (id) => {
        setDeleteConfirm({ open: true, id });
    };

    const handleDeleteUser = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/admin/users/${deleteConfirm.id}`);
            setDeleteConfirm({ open: false, id: null });
            fetchUsers();
        } catch (err) {
            setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
            setDeleteConfirm({ open: false, id: null });
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormError(null);
        setUserForm({
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
            nationalId: user.nationalId || '',
            password: '' // Don't fill password
        });
        setShowUserModal(true);
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormError(null);
        setUserForm({ name: '', phoneNumber: '', nationalId: '', password: '', role: 'CITIZEN' });
        setShowUserModal(true);
    };

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phoneNumber || '').includes(searchTerm) ||
        (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-muted rounded-2xl w-1/2" />
                <div className="h-16 bg-muted rounded-[24px]" />
                <div className="h-[520px] bg-muted rounded-[32px]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">{lang === 'en' ? 'User Directory' : 'ተጠቃሚዎች'}</h1>
                    <p className="text-muted-foreground font-semibold mt-2">
                        {lang === 'en' ? 'Manage users, roles and permissions.' : 'ተጠቃሚዎችን፣ ሚናዎችን እና ፈቃዶችን ያስተዳድሩ።'}
                    </p>
                </div>
                <Button
                    className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 font-black gap-2 shadow-lg hover:shadow-primary/20 transition-all"
                    onClick={openAddModal}
                >
                    <Plus className="w-5 h-5" />
                    {lang === 'en' ? 'ADD USER' : 'ተጠቃሚ ጨምር'}
                </Button>
            </div>

            <Card className="rounded-[32px] border-border bg-card overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={lang === 'en' ? 'Search users...' : 'ተጠቃሚዎችን ምረጥ...'}
                            className="pl-10 rounded-xl bg-background border-border h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="h-9 px-4 rounded-lg font-bold">
                        {filteredUsers.length} {lang === 'en' ? 'Users' : 'ተጠቃሚዎች'}
                    </Badge>
                </div>

                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive border-b border-destructive/20 font-bold">
                        Error: {error}
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-muted-foreground pl-8">{lang === 'en' ? 'User' : 'ተጠቃሚ'}</TableHead>
                            <TableHead className="font-bold text-muted-foreground">{lang === 'en' ? 'Phone' : 'ስልክ'}</TableHead>
                            <TableHead className="font-bold text-muted-foreground">{lang === 'en' ? 'Role' : 'ሚና'}</TableHead>
                            <TableHead className="font-bold text-muted-foreground text-right pr-8">{lang === 'en' ? 'Actions' : 'ተግባራት'}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((u) => (
                            <TableRow key={u.id} className="hover:bg-muted/30 transition-colors h-20">
                                <TableCell className="font-black pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shadow-sm">
                                            {(u.name || '?')[0]}
                                        </div>
                                        <div>
                                            <div className="text-base">{u.name || 'Unknown'}</div>
                                            <div className="text-xs font-bold text-muted-foreground">ID: ...{u.id.slice(-6)}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-bold text-muted-foreground text-base">
                                    {u.phoneNumber}
                                </TableCell>
                                <TableCell>
                                    <Badge className={`rounded-lg px-3 py-1 font-bold ${u.role === 'ADMIN' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                        u.role === 'OFFICER' ? 'bg-primary/10 text-primary border-primary/20' :
                                            u.role === 'HELPDESK' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                                'bg-secondary text-secondary-foreground border-border'
                                        }`}>
                                        <Shield className="w-3 h-3 mr-1.5" />
                                        {u.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-xl w-10 h-10 hover:bg-muted">
                                                <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                            <DropdownMenuLabel>{lang === 'en' ? 'Actions' : 'ተግባራት'}</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => openEditModal(u)} className="gap-2 font-bold cursor-pointer">
                                                <Edit3 className="w-4 h-4" /> {lang === 'en' ? 'Edit User' : 'አስተካክል'}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => confirmDeleteUser(u.id)} className="gap-2 font-bold text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                <Trash2 className="w-4 h-4" /> {lang === 'en' ? 'Delete User' : 'ሰረዝ'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Edit/Add User Dialog */}
            <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-muted/30 p-8 border-b border-border">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">
                                {editingUser
                                    ? (lang === 'en' ? 'Edit User' : 'ተጠቃሚን አስተካክል')
                                    : (lang === 'en' ? 'Add New User' : 'አዲስ ተጠቃሚ ጨምር')}
                            </DialogTitle>
                            <DialogDescription className="font-semibold text-base">
                                {lang === 'en' ? 'Configure user details and access role.' : 'የተጠቃሚ ዝርዝሮችን እና የመዳረሻ ሚናን ያዋቅሩ።'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleSaveUser} className="p-8 space-y-6">
                        {formError && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20">
                                {formError}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">{lang === 'en' ? 'Full Name' : 'ሙሉ ስም'}</label>
                                <Input
                                    className="rounded-xl h-12 font-bold bg-muted/20 border-border focus:bg-background transition-colors"
                                    value={userForm.name}
                                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                    required
                                    placeholder="ex. Abebe Kebede"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">{lang === 'en' ? 'Phone Number' : 'ስልክ ቁጥር'}</label>
                                <Input
                                    className="rounded-xl h-12 font-bold bg-muted/20 border-border focus:bg-background transition-colors"
                                    value={userForm.phoneNumber}
                                    onChange={e => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                                    required
                                    placeholder="+251..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">National ID (16 digits)</label>
                                <Input
                                    className="rounded-xl h-12 font-bold bg-muted/20 border-border focus:bg-background transition-colors"
                                    value={userForm.nationalId}
                                    onChange={e => setUserForm({ ...userForm, nationalId: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                    required
                                    placeholder="1234567890123456"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                                    {lang === 'en' ? 'Password' : 'የይለፍ ቃል'}
                                    {editingUser && <span className="text-xs normal-case ml-2 text-muted-foreground opacity-70">({lang === 'en' ? 'Leave empty to keep current' : 'የድሮውን ለማቆየት ባዶ ይተዉት'})</span>}
                                </label>
                                <Input
                                    type="password"
                                    className="rounded-xl h-12 font-bold bg-muted/20 border-border focus:bg-background transition-colors"
                                    value={userForm.password}
                                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                    required={!editingUser}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">{lang === 'en' ? 'Role Access' : 'ሚና መዳረሻ'}</label>
                                <Select
                                    value={userForm.role}
                                    onValueChange={(val) => setUserForm({ ...userForm, role: val })}
                                >
                                    <SelectTrigger className="w-full h-12 rounded-xl font-bold bg-muted/20 border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CITIZEN" className="font-bold">CITIZEN</SelectItem>
                                        <SelectItem value="OFFICER" className="font-bold">OFFICER</SelectItem>
                                        <SelectItem value="HELPDESK" className="font-bold">HELPDESK</SelectItem>
                                        <SelectItem value="HELP_DESK" className="font-bold">HELP_DESK</SelectItem>
                                        <SelectItem value="ADMIN" className="font-bold text-destructive">ADMIN</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="ghost" onClick={() => setShowUserModal(false)} className="rounded-xl font-bold h-12 px-6">
                                {lang === 'en' ? 'Cancel' : 'ይቅር'}
                            </Button>
                            <Button type="submit" className="rounded-xl font-black h-12 px-8 bg-primary hover:bg-primary/90 shadow-lg">
                                {editingUser ? (lang === 'en' ? 'Update User' : 'አሁን አዘምን') : (lang === 'en' ? 'Create User' : 'ፍጠር')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, id: null })}>
                <DialogContent className="sm:max-w-[400px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-destructive/10 p-8 border-b border-destructive/20 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4 text-destructive">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-destructive">
                            {lang === 'en' ? 'Delete User?' : 'ተጠቃሚን ሰረዝ?'}
                        </DialogTitle>
                        <DialogDescription className="font-semibold text-base mt-2 text-destructive/80">
                            {lang === 'en'
                                ? 'This action cannot be undone. This will permanently delete the user account.'
                                : 'ይህ ድርጊት ሊቀለበስ አይችልም። ይህ የተጠቃሚ መለያን በቋሚነት ይሰርዘዋል።'}
                        </DialogDescription>
                    </div>

                    <div className="p-6 bg-card flex justify-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteConfirm({ open: false, id: null })}
                            className="rounded-xl font-bold h-12 px-6"
                        >
                            {lang === 'en' ? 'Cancel' : 'ይቅር'}
                        </Button>
                        <Button
                            onClick={handleDeleteUser}
                            className="rounded-xl font-black h-12 px-8 bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                        >
                            {lang === 'en' ? 'Yes, Delete' : 'አዎ፣ ሰረዝ'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

