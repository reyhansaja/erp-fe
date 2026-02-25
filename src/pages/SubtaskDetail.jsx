import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Save, ExternalLink, Clock, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const SubtaskDetail = () => {
    const { projectId, subtaskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [subtask, setSubtask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        deadline: '',
        progress: 0,
        link: ''
    });

    const fetchSubtask = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/projects/subtasks/${subtaskId}`);
            setSubtask(res.data);
            setFormData({
                name: res.data.name,
                description: res.data.description || '',
                deadline: new Date(res.data.deadline).toISOString().slice(0, 16),
                progress: res.data.progress,
                link: res.data.link || ''
            });
        } catch (error) {
            console.error("Error fetching subtask", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubtask();
    }, [subtaskId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/projects/subtasks/${subtaskId}`, formData);
            setIsEditing(false);
            fetchSubtask();
        } catch (error) {
            alert('Error updating subtask');
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;
    if (!subtask) return <div className="text-white">Subtask not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Button
                variant="ghost"
                onClick={() => navigate(`/projects/${projectId}`)}
                className="mb-6 gap-2 text-gray-400 hover:text-white"
            >
                <ArrowLeft size={16} /> Back to Project
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">{subtask.name}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <User size={14} /> {subtask.createdBy?.username}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} /> Created {format(new Date(subtask.createdAt), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>
                            {subtask.progress === 100 && (
                                <div className="flex items-center gap-2 bg-success/20 text-success px-3 py-1 rounded-full text-xs font-bold border border-success/20">
                                    <CheckCircle size={14} /> COMPLETED
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Description</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {subtask.description || 'No description provided.'}
                                </p>
                            </div>

                            {subtask.link && (
                                <div>
                                    <h3 className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Resource Link</h3>
                                    <a
                                        href={subtask.link.startsWith('http') ? subtask.link : `https://${subtask.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-secondary hover:underline bg-secondary/10 px-3 py-2 rounded-lg transition-colors"
                                    >
                                        <ExternalLink size={16} /> {subtask.link}
                                    </a>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <h3 className="text-lg font-bold text-white mb-4">Task Management</h3>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Progress Status</span>
                                    <span className={cn(
                                        "font-bold text-xs px-2 py-0.5 rounded",
                                        formData.progress === 100 ? "text-success bg-success/10" : "text-primary bg-primary/10"
                                    )}>
                                        {formData.progress === 100 ? 'DONE' :
                                            formData.progress === 80 ? 'IFC' :
                                                formData.progress === 60 ? 'IFA' :
                                                    formData.progress === 40 ? 'IFR' :
                                                        formData.progress === 20 ? 'IFI' : 'NEW'}
                                    </span>
                                </div>

                                {/* Status Selector Buttons */}
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { label: 'IFI', val: 20 },
                                        { label: 'IFR', val: 40 },
                                        { label: 'IFA', val: 60 },
                                        { label: 'IFC', val: 80 },
                                        { label: 'DONE', val: 100 }
                                    ].map((s) => (
                                        <button
                                            key={s.label}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, progress: s.val })}
                                            className={cn(
                                                "w-full py-2.5 rounded-lg font-bold text-xs transition-all border",
                                                formData.progress === s.val
                                                    ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                                    : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-gray-200"
                                            )}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-2">
                                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-500",
                                                formData.progress === 100 ? "bg-success" : "bg-primary"
                                            )}
                                            style={{ width: `${formData.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Deadline</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="bg-transparent border-white/10 text-white"
                                />
                                {new Date(subtask.deadline) < new Date() && subtask.progress < 100 && (
                                    <p className="text-danger text-xs font-bold mt-1">OVERDUE</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full gap-2">
                                <Save size={18} /> Save Changes
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SubtaskDetail;
