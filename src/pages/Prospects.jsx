import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

// DnD Kit
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { createPortal } from 'react-dom';

const STATUSES = ['LEAD', 'PROPOSAL', 'WON', 'LOSS', 'HOLD'];

// Droppable Column Component
const KanbanColumn = ({ status, children }) => {
    const { setNodeRef } = useDroppable({
        id: status,
    });

    return (
        <div
            ref={setNodeRef}
            className="w-80 flex flex-col bg-white/5 rounded-xl p-4 border border-white/10"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className={cn("font-bold",
                    status === 'WON' ? 'text-success' :
                        status === 'LOSS' ? 'text-danger' :
                            'text-primary'
                )}>{status}</h3>
                <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-400">{React.Children.count(children)}</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar min-h-[200px]">
                {children}
            </div>
        </div>
    );
};

// Draggable Card Component
const DraggableProspectCard = ({ prospect, onMoveToRealLoss }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: prospect.no_project,
        data: { ...prospect },
    });

    const [showMenu, setShowMenu] = useState(false);

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} className="touch-none relative group">
            <Card className={cn(
                "p-4 cursor-grab active:cursor-grabbing hover:bg-white/10 relative",
                isDragging && "opacity-50 ring-2 ring-primary"
            )}>
                <div {...listeners} {...attributes}>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500 font-mono">{prospect.no_project}</span>
                        {prospect.status === 'LOSS' && (
                            <div className="relative" onPointerDown={e => e.stopPropagation()}>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10"
                                >
                                    <MoreHorizontal size={16} />
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                                        <button
                                            onClick={() => {
                                                setShowMenu(false);
                                                onMoveToRealLoss(prospect);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-white/5 transition-colors"
                                        >
                                            Move to Real Loss
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <h4 className="font-bold text-white mb-1">{prospect.name_project}</h4>
                    <p className="text-sm text-gray-400">{prospect.client_name}</p>
                    <p className="text-xs text-gray-500 mt-2">{prospect.contact_name}</p>
                </div>
            </Card>
        </div>
    );
};

// Overlay for Dragging
const ProspectOverlay = ({ prospect }) => {
    if (!prospect) return null;
    return (
        <Card className="p-4 bg-gray-800 border-primary shadow-2xl cursor-grabbing rotate-3 scale-105 opacity-90">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500 font-mono">{prospect.no_project}</span>
            </div>
            <h4 className="font-bold text-white mb-1">{prospect.name_project}</h4>
            <p className="text-sm text-gray-400">{prospect.client_name}</p>
            <p className="text-xs text-gray-500 mt-2">{prospect.contact_name}</p>
        </Card>
    )
}

const Prospects = () => {
    const { token, user } = useAuth();
    const [prospects, setProspects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeId, setActiveId] = useState(null); // For drag overlay

    // Form State
    const [formData, setFormData] = useState({
        no_project: '',
        name_project: '',
        client_name: '',
        contact_name: '',
        status: 'LEAD'
    });

    const fetchProspects = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/prospects`);
            setProspects(res.data);
        } catch (error) {
            console.error("Error fetching prospects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProspects();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/prospects`, formData);
            setShowModal(false);
            fetchProspects();
            setFormData({ no_project: '', name_project: '', client_name: '', contact_name: '', status: 'LEAD' });
        } catch (error) {
            alert('Error creating prospect');
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    }

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const prospectId = active.id;
        const newStatus = over.id; // Droppable ID is the status string

        // Find the prospect
        const prospect = prospects.find(p => p.no_project === prospectId);

        if (prospect && prospect.status !== newStatus) {
            // Optimistic Update
            const oldStatus = prospect.status;
            setProspects(prev => prev.map(p =>
                p.no_project === prospectId ? { ...p, status: newStatus } : p
            ));

            // API Call
            try {
                await axios.put(`${import.meta.env.VITE_API_URL}/prospects/${prospectId}`, { status: newStatus });
                // Should verify/refetch if WON to show project link? 
                // Ideally yes, but for now simple update is fine.
            } catch (error) {
                console.error("Failed to update status", error);
                // Revert
                setProspects(prev => prev.map(p =>
                    p.no_project === prospectId ? { ...p, status: oldStatus } : p
                ));
            }
        }
    };

    const handleMoveToRealLoss = async (prospect) => {
        if (!confirm(`Move ${prospect.name_project} to Real Loss? This will create a 'Done' project for it.`)) return;

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/prospects/${prospect.no_project}`, { status: 'REAL_LOSS' });
            fetchProspects(); // Refresh to remove from list (since REAL_LOSS isn't in STATUSES column)
        } catch (error) {
            console.error("Update failed:", error);
            alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Prospects</h1>
                    {['Sales', 'Manager', 'Superadmin'].includes(user?.role) && (
                        <Button onClick={() => setShowModal(true)} variant="primary" className="gap-2">
                            <Plus size={18} /> New Prospect
                        </Button>
                    )}
                </div>

                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-6 min-w-max h-full pb-4">
                        {STATUSES.map(status => (
                            <KanbanColumn key={status} status={status}>
                                {prospects.filter(p => p.status === status).map(prospect => (
                                    <DraggableProspectCard
                                        key={prospect.no_project}
                                        prospect={prospect}
                                        onMoveToRealLoss={handleMoveToRealLoss}
                                    />
                                ))}
                            </KanbanColumn>
                        ))}
                    </div>
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeId ? <ProspectOverlay prospect={prospects.find(p => p.no_project === activeId)} /> : null}
                    </DragOverlay>,
                    document.body
                )}

                {/* Basic Create Modal */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full max-w-lg"
                            >
                                <Card className="border-primary/50">
                                    <h2 className="text-xl font-bold mb-4">New Prospect</h2>
                                    <form onSubmit={handleCreate} className="space-y-4">
                                        <Input placeholder="No Project (e.g. IMX.2026...)" value={formData.no_project} onChange={e => setFormData({ ...formData, no_project: e.target.value })} required />
                                        <Input placeholder="Project Name" value={formData.name_project} onChange={e => setFormData({ ...formData, name_project: e.target.value })} required />
                                        <Input placeholder="Client Name" value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} required />
                                        <Input placeholder="Contact Name" value={formData.contact_name} onChange={e => setFormData({ ...formData, contact_name: e.target.value })} required />
                                        <div className="flex justify-end gap-3 mt-6">
                                            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                                            <Button type="submit">Create Prospect</Button>
                                        </div>
                                    </form>
                                </Card>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DndContext>
    );
};

export default Prospects;
