import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, CheckCircle, Plus, Trash2, ExternalLink, Save } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const ProspectDetail = () => {
    const { id } = useParams(); // id is no_project
    const navigate = useNavigate();
    const { user } = useAuth();
    const [prospect, setProspect] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    const [taskForm, setTaskForm] = useState({
        name: '',
        deadline: '',
        description: '',
        link: ''
    });

    const fetchProspect = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/prospects/${id}`);
            setProspect(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProspect();
    }, [id]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/projects/subtasks', {
                prospectId: id,
                ...taskForm
            });
            setShowAdd(false);
            setTaskForm({ name: '', deadline: '', description: '', link: '' });
            fetchProspect();
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding task');
        }
    };

    const updateProgress = async (taskId, newProgress) => {
        try {
            await axios.put(`http://localhost:5000/api/projects/subtasks/${taskId}`, {
                progress: newProgress
            });
            fetchProspect();
        } catch (error) {
            alert('Error updating progress');
        }
    };

    const deleteTask = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/projects/subtasks/${taskId}`);
            fetchProspect();
        } catch (error) {
            alert('Error deleting task');
        }
    }

    if (loading || !prospect) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <Button variant="ghost" onClick={() => navigate('/prospects')} className="mb-6 gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={16} /> Back to Kanban
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Prospect Info */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-8 bg-white/5 border-white/10 backdrop-blur-xl">
                        <div className="mb-6">
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest mb-2 inline-block",
                                prospect.status === 'WON' ? "text-success bg-success/10" : "text-primary bg-primary/10"
                            )}>
                                Prospect {prospect.status}
                            </span>
                            <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{prospect.name_project}</h1>
                            <p className="text-gray-400 font-medium">{prospect.client_name}</p>
                            <p className="text-xs font-mono text-gray-500 mt-1">{prospect.no_project}</p>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div>
                                <span className="text-xs text-gray-500 block uppercase font-bold tracking-wider mb-2">Contact Person</span>
                                <p className="text-gray-300 text-sm">{prospect.contact_name}</p>
                            </div>

                            {prospect.project && (
                                <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Active Project</p>
                                    <Button
                                        onClick={() => navigate(`/projects/${prospect.project.id}`)}
                                        className="w-full gap-2 justify-center"
                                        variant="primary"
                                    >
                                        Go to Project Detail <ExternalLink size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Subtasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                        <h2 className="text-xl font-bold text-white">Subtasks</h2>
                        <Button onClick={() => setShowAdd(!showAdd)} variant="outline" size="sm" className="gap-2 border-primary/30 hover:border-primary">
                            <Plus size={16} /> Add Task
                        </Button>
                    </div>

                    {showAdd && (
                        <Card className="border-primary/30 bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                            <form onSubmit={handleAddTask} className="space-y-4 p-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input placeholder="Task Name" value={taskForm.name} onChange={e => setTaskForm({ ...taskForm, name: e.target.value })} required />
                                    <Input type="datetime-local" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} required className="text-white" />
                                </div>
                                <Input placeholder="Description" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                                <Input placeholder="Resource Link (Optional)" value={taskForm.link} onChange={e => setTaskForm({ ...taskForm, link: e.target.value })} />
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                                    <Button type="submit">Create Subtask</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    <div className="space-y-4">
                        {prospect.subtasks?.map(task => {
                            const timeLeft = formatDistanceToNow(parseISO(task.deadline), { addSuffix: true });
                            const isOverdue = new Date(task.deadline) < new Date() && task.progress < 100;

                            return (
                                <Card
                                    key={task.id}
                                    className="group relative overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-300 border-white/5 hover:border-white/10"
                                    onClick={() => navigate(`/projects/${prospect.project?.id || 'prospect'}/subtasks/${task.id}`)}
                                >
                                    <div className="flex justify-between items-start gap-4 p-5">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors truncate">{task.name}</h3>
                                                {task.progress === 100 && <CheckCircle size={16} className="text-success" />}
                                            </div>
                                            <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">{task.description || 'No description'}</p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs">
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                                    By: {task.createdBy?.username || 'Unknown'}
                                                </div>
                                                <div className={cn("flex items-center gap-1 font-medium", isOverdue ? 'text-danger' : 'text-primary')}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full", isOverdue ? 'bg-danger' : 'bg-primary')}></span>
                                                    Deadline: {timeLeft}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-48 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Status</span>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded",
                                                    task.progress === 100 ? "text-success bg-success/10" : "text-primary bg-primary/10"
                                                )}>
                                                    {task.progress === 100 ? 'DONE' :
                                                        task.progress === 80 ? 'IFC' :
                                                            task.progress === 60 ? 'IFA' :
                                                                task.progress === 40 ? 'IFR' :
                                                                    task.progress === 20 ? 'IFI' : 'NEW'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-5 gap-1">
                                                {[
                                                    { label: 'IFI', val: 20 },
                                                    { label: 'IFR', val: 40 },
                                                    { label: 'IFA', val: 60 },
                                                    { label: 'IFC', val: 80 },
                                                    { label: 'DONE', val: 100 }
                                                ].map((s) => (
                                                    <button
                                                        key={s.label}
                                                        onClick={() => updateProgress(task.id, s.val)}
                                                        className={cn(
                                                            "h-7 text-[9px] font-bold rounded-md transition-all",
                                                            task.progress === s.val
                                                                ? "bg-primary text-white shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)] scale-105"
                                                                : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                                                        )}
                                                        title={s.label}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {['Manager', 'Superadmin'].includes(user?.role) && (
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="self-end text-gray-600 hover:text-danger p-2 transition-colors rounded-lg hover:bg-danger/10"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`absolute bottom-0 left-0 h-1 transition-all duration-700 ease-out ${task.progress === 100 ? 'bg-success shadow-[0_0_10px_rgba(var(--success-rgb),0.5)]' : 'bg-primary'}`} style={{ width: `${task.progress}%` }} />
                                </Card>
                            );
                        })}
                        {prospect.subtasks?.length === 0 && (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-gray-500 font-medium italic">No subtasks created for this prospect yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProspectDetail;
