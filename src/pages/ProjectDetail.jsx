import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, CheckCircle, Circle, Plus, Trash2, ExternalLink, Edit2, Save, X } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false); // Add Subtask Form
    const [editingLink, setEditingLink] = useState(false);
    const [projectLink, setProjectLink] = useState('');

    // New Task Form
    const [taskForm, setTaskForm] = useState({
        name: '',
        deadline: '',
        description: '',
        link: ''
    });

    const fetchProject = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
            setProject(res.data);
            setProjectLink(res.data.link || '');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const location = useLocation();

    useEffect(() => {
        fetchProject();
        if (location.state?.openAddSubtask) {
            setShowAdd(true);
            // Optional: clear state to prevent reopening on refresh? 
            // navigate(location.pathname, { replace: true, state: {} });
            // But verify first.
        }
    }, [id, location.state]);

    const handleUpdateProjectLink = async () => {
        try {
            await axios.put(`http://localhost:5000/api/projects/${id}`, { link: projectLink });
            setEditingLink(false);
            fetchProject();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating project link: ' + error.message);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/projects/subtasks', {
                projectId: id,
                ...taskForm
            });
            setShowAdd(false);
            setTaskForm({ name: '', deadline: '', description: '', link: '' });
            fetchProject();
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding task');
        }
    };

    const updateProgress = async (taskId, newProgress) => {
        try {
            await axios.put(`http://localhost:5000/api/projects/subtasks/${taskId}`, {
                progress: newProgress
            });
            fetchProject();
        } catch (error) {
            alert('Error updating progress');
        }
    };

    const deleteTask = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/projects/subtasks/${taskId}`);
            fetchProject();
        } catch (error) {
            alert('Error deleting task');
        }
    }

    if (loading || !project) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-4 gap-2">
                <ArrowLeft size={16} /> Back to Projects
            </Button>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Project Info Side */}
                <div className="w-full md:w-1/3">
                    <Card className="sticky top-8">
                        <h1 className="text-2xl font-bold text-white mb-2">{project.prospect.name_project}</h1>
                        <p className="text-gray-400 mb-4">{project.prospect.client_name}</p>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500 uppercase font-bold">Project Link</span>
                                {['Manager', 'Superadmin', 'Engineer'].includes(user?.role) && (
                                    <button
                                        onClick={() => setEditingLink(!editingLink)}
                                        className="text-primary hover:text-white transition-colors"
                                    >
                                        {editingLink ? <X size={14} /> : <Edit2 size={14} />}
                                    </button>
                                )}
                            </div>

                            {editingLink ? (
                                <div className="flex gap-2">
                                    <Input
                                        value={projectLink}
                                        onChange={(e) => setProjectLink(e.target.value)}
                                        placeholder="https://example.com"
                                        className="h-8 text-sm"
                                    />
                                    <Button size="sm" onClick={handleUpdateProjectLink} className="h-8 w-8 p-0">
                                        <Save size={14} />
                                    </Button>
                                </div>
                            ) : (
                                project.link ? (
                                    <a
                                        href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-secondary hover:underline truncate"
                                    >
                                        <ExternalLink size={14} />
                                        <span className="truncate">{project.link}</span>
                                    </a>
                                ) : (
                                    <span className="text-gray-600 text-sm italic">No link added</span>
                                )
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="bg-black/40 p-3 rounded-lg">
                                <span className="text-xs text-gray-500 block">Status</span>
                                <span className={`font-bold ${project.is_done ? 'text-success' : 'text-primary'}`}>
                                    {project.is_done ? 'COMPLETED' : 'IN PROGRESS'}
                                </span>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Overall Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-500 ${project.progress === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${project.progress}%` }} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Subtasks List */}
                <div className="w-full md:w-2/3">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Subtasks</h2>
                        {!project.is_done && (
                            <Button onClick={() => setShowAdd(!showAdd)} variant="outline" size="sm" className="gap-2">
                                <Plus size={16} /> Add Task
                            </Button>
                        )}
                    </div>

                    {/* Add Task Form */}
                    {showAdd && (
                        <Card className="mb-6 border-primary/30">
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <Input placeholder="Task Name" value={taskForm.name} onChange={e => setTaskForm({ ...taskForm, name: e.target.value })} required />
                                <Input type="datetime-local" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} required className="text-white" />
                                <Input placeholder="Description" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                                <Input placeholder="Link (Optional)" value={taskForm.link} onChange={e => setTaskForm({ ...taskForm, link: e.target.value })} />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                                    <Button type="submit">Save Task</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    <div className="space-y-4">
                        {project.subtasks.map(task => {
                            const timeLeft = formatDistanceToNow(parseISO(task.deadline), { addSuffix: true });
                            const isOverdue = new Date(task.deadline) < new Date() && task.progress < 100;

                            return (
                                <Card key={task.id} className="group relative overflow-hidden">
                                    {/* Detailed Progress Bar as background tint? No, maybe simpler UI */}
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-white">{task.name}</h3>
                                                {task.progress === 100 && <CheckCircle size={16} className="text-success" />}
                                            </div>
                                            <p className="text-sm text-gray-400 mb-2">{task.description || 'No description'}</p>

                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="text-gray-500">By: {task.createdBy?.username || 'Unknown'}</span>
                                                <span className={isOverdue ? 'text-danger' : 'text-primary'}>Deadline: {timeLeft}</span>
                                                {task.link && (
                                                    <a href={task.link.startsWith('http') ? task.link : `https://${task.link}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-secondary hover:underline">
                                                        <ExternalLink size={12} /> Link
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-32 flex flex-col items-end gap-2">
                                            <div className="text-right">
                                                <span className="text-xs text-gray-400 block">Progress</span>
                                                <span className={`text-lg font-bold ${task.progress === 100 ? 'text-success' : 'text-white'}`}>{task.progress}%</span>
                                            </div>
                                            {/* Slider for Progress */}
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={task.progress}
                                                onChange={(e) => updateProgress(task.id, e.target.value)}
                                                disabled={project.is_done}
                                                className="w-full accent-primary cursor-pointer"
                                            />
                                            {['Manager', 'Superadmin'].includes(user?.role) && (
                                                <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-danger p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Full green bar if 100% */}
                                    <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${task.progress === 100 ? 'bg-success w-full' : 'bg-primary'}`} style={{ width: `${task.progress}%` }} />
                                </Card>
                            );
                        })}
                        {project.subtasks.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No subtasks yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProjectDetail;
