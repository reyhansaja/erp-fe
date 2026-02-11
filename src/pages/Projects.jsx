import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableProjectRow } from '../components/ui/SortableProjectRow';
import { ExternalLink } from 'lucide-react';

const Projects = ({ doneOnly = false }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, DONE, REAL_LOSS
    const navigate = useNavigate();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/projects?is_done=${doneOnly}`);
                setProjects(res.data);
            } catch (error) {
                console.error("Error fetching projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [doneOnly]);

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setProjects((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Persist new order to backend
                // Extract IDs in new order
                const orderedIds = newOrder.map(p => p.id);

                axios.put('http://localhost:5000/api/projects/reorder', { orderedIds })
                    .catch(err => console.error("Failed to save order", err));

                return newOrder;
            });
        }
    };



    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">
                {doneOnly ? 'Project Status (Done)' : 'Projects (In Progress)'}
            </h1>

            <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                {!doneOnly ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="p-4">Project</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Progress</th>
                                    <th className="p-4">Last Update</th>
                                </tr>
                            </thead>
                            <SortableContext
                                items={projects.map(p => p.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <tbody className="divide-y divide-white/5">
                                    {projects.map((project) => (
                                        <SortableProjectRow
                                            key={project.id}
                                            project={project}
                                        />
                                    ))}
                                </tbody>
                            </SortableContext>
                        </table>
                    </DndContext>
                ) : (
                    <div>
                        <div className="flex gap-2 mb-4 px-4 pt-4">
                            <button
                                onClick={() => setFilter('ALL')}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === 'ALL' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                All Status
                            </button>
                            <button
                                onClick={() => setFilter('DONE')}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === 'DONE' ? 'bg-success/20 text-success border border-success/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                Done
                            </button>
                            <button
                                onClick={() => setFilter('REAL_LOSS')}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === 'REAL_LOSS' ? 'bg-danger/20 text-danger border border-danger/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                Real Loss
                            </button>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="p-4">Project</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Progress</th>
                                    <th className="p-4">Last Update</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {projects
                                    .filter(p => {
                                        if (filter === 'ALL') return true;
                                        if (filter === 'REAL_LOSS') return p.prospect.status === 'REAL_LOSS';
                                        if (filter === 'DONE') return p.prospect.status !== 'REAL_LOSS';
                                        return true;
                                    })
                                    .map((project) => (
                                        <tr
                                            key={project.id}
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                            className="cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <div className="font-bold text-white">{project.prospect.name_project}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{project.prospect.no_project}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-300">{project.prospect.client_name}</td>
                                            <td className="py-4 px-4">
                                                {project.prospect.status === 'REAL_LOSS' ? (
                                                    <span className="text-xs bg-danger/20 text-danger px-2 py-1 rounded-full font-bold">REAL LOSS</span>
                                                ) : (
                                                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-bold">DONE</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="w-32">
                                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                        <span>{project.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-success"
                                                            style={{ width: `${project.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-400 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                                                    {project.link && (
                                                        <a
                                                            href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-1 hover:bg-white/10 text-secondary rounded-full transition-colors"
                                                            title="Open Project Link"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>



            {projects.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No projects found. Win some prospects to see them here.
                </div>
            )}
        </div>
    );
};

export default Projects;
