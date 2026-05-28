import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import {
    Building2,
    Layers,
    Plus,
    Edit3,
    Trash2,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default function ServiceManagement() {
    const { lang } = useLanguage();
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('sectors'); // 'sectors' or 'services'
    const [selectedSector, setSelectedSector] = useState(null);

    // Modal States
    const [showSectorModal, setShowSectorModal] = useState(false);
    const [editingSector, setEditingSector] = useState(null);
    const [sectorForm, setSectorForm] = useState({ name: '', description: '', icon: '' });

    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        name: '', description: '', mode: 'QUEUE', availability: '', icon: '', sectorId: ''
    });

    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null, name: '' });

    const fetchSectors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/services/sectors');
            setSectors(res.data);

            if (selectedSector) {
                const updated = res.data.find(s => s.id === selectedSector.id);
                if (updated) setSelectedSector(updated);
            }
        } catch (err) {
            console.error('Failed to fetch sectors', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSectors();
    }, []);

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            if (deleteConfirm.type === 'sector') {
                await api.delete(`/services/sectors/${deleteConfirm.id}`);
            } else {
                await api.delete(`/services/services/${deleteConfirm.id}`);
            }
            // If deleting a sector we are currently viewing, go back to sectors list
            if (deleteConfirm.type === 'sector' && selectedSector?.id === deleteConfirm.id) {
                setViewMode('sectors');
                setSelectedSector(null);
            }
            fetchSectors();
            setDeleteConfirm({ open: false, type: null, id: null, name: '' });
        } catch (err) {
            console.error('Failed to delete', err);
            alert(`Failed to delete: ${err.response?.data?.message || err.message}`);
        }
    };

    // --- Sector Handlers ---
    const handleSaveSector = async (e) => {
        e.preventDefault();
        try {
            if (editingSector) {
                await api.patch(`/services/sectors/${editingSector.id}`, sectorForm);
            } else {
                await api.post('/services/sectors', sectorForm);
            }
            setShowSectorModal(false);
            setEditingSector(null);
            setSectorForm({ name: '', description: '', icon: '' });
            fetchSectors();
        } catch (err) {
            console.error('Failed to save sector', err);
            alert(`Failed to save: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDeleteSector = (e, sector) => {
        e.stopPropagation();
        setDeleteConfirm({ open: true, type: 'sector', id: sector.id, name: sector.name });
    };

    const openAddSector = () => {
        setEditingSector(null);
        setSectorForm({ name: '', description: '', icon: '' });
        setShowSectorModal(true);
    };

    const openEditSector = (e, sector) => {
        e.stopPropagation();
        setEditingSector(sector);
        setSectorForm({ name: sector.name, description: sector.description, icon: sector.icon });
        setShowSectorModal(true);
    };

    // --- Service Handlers ---
    const handleSaveService = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await api.patch(`/services/services/${editingService.id}`, serviceForm);
            } else {
                await api.post('/services/services', { ...serviceForm, sectorId: selectedSector.id });
            }
            setShowServiceModal(false);
            setEditingService(null);
            fetchSectors();
        } catch (err) {
            console.error('Failed to save service', err);
            alert(`Failed to save: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDeleteService = (service) => {
        setDeleteConfirm({ open: true, type: 'service', id: service.id, name: service.name });
    };

    const openAddService = () => {
        setEditingService(null);
        setServiceForm({
            name: '',
            description: '',
            mode: 'QUEUE',
            availability: 'Mon-Fri, 8:30am-5:30pm',
            icon: '',
            sectorId: selectedSector?.id || ''
        });
        setShowServiceModal(true);
    };

    const openEditService = (service) => {
        setEditingService(service);
        setServiceForm({
            name: service.name,
            description: service.description,
            mode: service.mode,
            availability: service.availability,
            icon: service.icon,
            sectorId: service.sectorId
        });
        setShowServiceModal(true);
    };

    if (loading && sectors.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {viewMode === 'sectors' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">{lang === 'en' ? 'Service Sectors' : 'አገልግሎት ዘርፎች'}</h1>
                            <p className="text-muted-foreground font-semibold mt-2">
                                {lang === 'en' ? 'Manage main service categories and their departments.' : 'ዋና የአገልግሎት ምድቦችን እና ክፍሎቻቸውን ያስተዳድሩ።'}
                            </p>
                        </div>
                        <Button
                            className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 font-black gap-2 shadow-lg text-white"
                            onClick={openAddSector}
                        >
                            <Plus className="w-5 h-5 text-white" />
                            {lang === 'en' ? 'ADD SECTOR' : 'ዘርፍ ጨምር'}
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {sectors.map((sector) => (
                            <Card
                                key={sector.id}
                                onClick={() => { setSelectedSector(sector); setViewMode('services'); }}
                                className="rounded-[32px] p-8 border-border hover:border-primary/50 transition-all bg-card shadow-sm group cursor-pointer hover:shadow-md relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-16 h-16 bg-muted rounded-[24px] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <Building2 className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-xl w-10 h-10 hover:bg-primary/10 hover:text-primary border-border"
                                            onClick={(e) => openEditSector(e, sector)}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-xl w-10 h-10 hover:bg-destructive/10 hover:text-destructive border-border"
                                            onClick={(e) => handleDeleteSector(e, sector)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <h4 className="font-black text-2xl mb-2 group-hover:text-primary transition-colors">{sector.name}</h4>
                                <p className="text-muted-foreground font-medium line-clamp-2 h-10 mb-6">{sector.description}</p>

                                <div className="flex items-center justify-between pt-6 border-t border-border">
                                    <Badge variant="secondary" className="rounded-lg font-bold px-3 py-1">
                                        {sector.services?.length || 0} {lang === 'en' ? 'Services' : 'አገልግሎቶች'}
                                    </Badge>
                                    <div className="text-primary font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        {lang === 'en' ? 'Manage' : 'አስተዳድር'} <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Card>
                        ))}

                        <button
                            onClick={openAddSector}
                            className="rounded-[32px] p-8 border-2 border-dashed border-border hover:border-primary/50 transition-all flex flex-col items-center justify-center text-center gap-4 group min-h-[300px] bg-muted/5"
                        >
                            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div>
                                <h4 className="font-black text-xl text-muted-foreground group-hover:text-primary transition-colors">
                                    {lang === 'en' ? 'Add New Sector' : 'አዲስ ዘርፍ ጨምር'}
                                </h4>
                                <p className="text-sm font-bold text-muted-foreground/60 mt-1">Create a new service details</p>
                            </div>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl w-12 h-12 shrink-0 border-border"
                            onClick={() => setViewMode('sectors')}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm mb-1">
                                <span className="cursor-pointer hover:text-primary" onClick={() => setViewMode('sectors')}>Sectors</span>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-foreground">{selectedSector?.name}</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight">{lang === 'en' ? 'Sector Services' : 'የዘርፍ አገልግሎቶች'}</h1>
                        </div>
                        <Button
                            className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 font-black gap-2 shadow-lg text-white"
                            onClick={openAddService}
                        >
                            <Plus className="w-5 h-5 text-white" />
                            {lang === 'en' ? 'ADD SERVICE' : 'አገልግሎት ጨምር'}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {(selectedSector?.services || []).length > 0 ? (
                            selectedSector.services.map((service) => (
                                <Card key={service.id} className="rounded-[32px] p-6 border-border bg-card flex items-center justify-between hover:border-primary/20 transition-colors shadow-sm group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            {service.name[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-black text-xl">{service.name}</h4>
                                                <Badge variant="outline" className="rounded-lg border-primary/20 text-primary bg-primary/5 font-bold uppercase tracking-wider text-[10px]">
                                                    {service.mode}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground font-bold flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                                {service.availability || 'Standard Hours'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="rounded-xl px-4 font-bold hover:bg-primary/10" onClick={() => openEditService(service)}>Edit</Button>
                                        <Button variant="ghost" size="sm" className="rounded-xl px-4 font-bold text-destructive hover:bg-destructive/10" onClick={() => handleDeleteService(service)}>Delete</Button>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-20 rounded-[40px] border-2 border-dashed border-border bg-muted/5">
                                <Layers className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-black text-muted-foreground">No Services Found</h3>
                                <p className="text-muted-foreground font-semibold mt-2">Add a new service to get started.</p>
                                <Button className="mt-6 rounded-xl font-bold" variant="outline" onClick={openAddService}>Create First Service</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sector Form Modal */}
            <Dialog open={showSectorModal} onOpenChange={setShowSectorModal}>
                <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-muted/30 p-8 border-b border-border">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">
                                {editingSector ? (lang === 'en' ? 'Update Sector' : 'ዘርፍ አዘምን') : (lang === 'en' ? 'New Sector' : 'አዲስ ዘርፍ')}
                            </DialogTitle>
                            <DialogDescription className="font-semibold text-base">
                                Configure service categories for the system.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <form onSubmit={handleSaveSector} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Title</label>
                                <Input className="rounded-xl h-12 font-bold bg-muted/20 border-border" value={sectorForm.name} onChange={e => setSectorForm({ ...sectorForm, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Description</label>
                                <Textarea className="w-full rounded-xl min-h-[100px] p-4 border border-border bg-muted/20 font-bold resize-none" value={sectorForm.description} onChange={e => setSectorForm({ ...sectorForm, description: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="ghost" onClick={() => setShowSectorModal(false)} className="rounded-xl font-bold h-12 px-6">Cancel</Button>
                            <Button type="submit" className="rounded-xl font-black h-12 px-8 bg-primary hover:bg-primary/90 text-white">SAVE</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Service Form Modal */}
            <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
                <DialogContent className="sm:max-w-[600px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-muted/30 p-8 border-b border-border">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">
                                {editingService ? 'Update Service' : 'New Service'}
                            </DialogTitle>
                            <DialogDescription className="font-semibold text-base">
                                Define the workflow and availability for this service.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <form onSubmit={handleSaveService} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Service Name</label>
                                <Input className="rounded-xl h-12 font-bold bg-muted/20 border-border" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Mode</label>
                                    <Select value={serviceForm.mode} onValueChange={(val) => setServiceForm({ ...serviceForm, mode: val })}>
                                        <SelectTrigger className="w-full h-12 rounded-xl font-bold bg-muted/20 border-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="QUEUE" className="font-bold">QUEUE</SelectItem>
                                            <SelectItem value="APPOINTMENT" className="font-bold">APPOINTMENT</SelectItem>
                                            <SelectItem value="ONLINE" className="font-bold">ONLINE ONLY</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Availability</label>
                                    <Input className="rounded-xl h-12 font-bold bg-muted/20 border-border" value={serviceForm.availability} onChange={e => setServiceForm({ ...serviceForm, availability: e.target.value })} placeholder="e.g. Mon-Fri, 8-5" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Description</label>
                                <Textarea className="w-full rounded-xl min-h-[80px] p-4 border border-border bg-muted/20 font-bold resize-none" value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="ghost" onClick={() => setShowServiceModal(false)} className="rounded-xl font-bold h-12 px-6">Cancel</Button>
                            <Button type="submit" className="rounded-xl font-black h-12 px-8 bg-primary hover:bg-primary/90 text-white">SAVE SERVICE</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Shared Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirm.open}
                onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
            >
                <DialogContent className="sm:max-w-[425px] rounded-[32px] p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-destructive">
                            {deleteConfirm.type === 'sector'
                                ? (lang === 'en' ? 'Delete Sector?' : 'ዘርፍ ሰርዝ?')
                                : (lang === 'en' ? 'Delete Service?' : 'አገልግሎት ሰርዝ?')}
                        </DialogTitle>
                        <DialogDescription className="font-semibold text-base pt-2">
                            {lang === 'en'
                                ? `Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`
                                : `"${deleteConfirm.name}"ን መሰረዝ ይፈልጋሉ? ይህ እርምጃ ሊቀለበስ አይችልም።`}
                            {deleteConfirm.type === 'sector' &&
                                <span className="block mt-2 text-sm text-destructive font-black opacity-80 uppercase tracking-tight">
                                    {lang === 'en' ? 'Warning: All services in this sector will also be deleted.' : 'ማስጠንቀቂያ፡ በዚህ ዘርፍ ያሉ ሁሉም አገልግሎቶችም ይሰረዛሉ።'}
                                </span>
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirm(prev => ({ ...prev, open: false }))}
                            className="rounded-xl font-bold h-12 flex-1 border-border"
                        >
                            {lang === 'en' ? 'Cancel' : 'ሰርዝ'}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="rounded-xl font-black h-12 flex-1 shadow-lg shadow-destructive/20"
                        >
                            {lang === 'en' ? 'DELETE' : 'አጥፋ'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
