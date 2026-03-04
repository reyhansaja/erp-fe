import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ExternalLink } from 'lucide-react';
import { AdminSelect } from './AdminSelect';

export const SortableProjectRow = ({ project, allUsers, currentUser, onAssignAdmin, isMenuOpen, onToggleMenu }) => {
    const navigate = useNavigate();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : (isMenuOpen ? 40 : 1),
        position: 'relative',
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            onClick={() => navigate(`/projects/${project.id}`)}
            className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isDragging ? 'bg-white/10 shadow-xl opacity-50' : ''}`}
        >
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <span
                        className="text-gray-500 cursor-grab active:cursor-grabbing hover:text-white p-2"
                        {...attributes}
                        {...listeners}
                    >
                        :::
                    </span>
                    <div>
                        <div className="font-bold text-white">{project.prospect.name_project}</div>
                        <div className="text-xs text-gray-500 font-mono">{project.prospect.no_project}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4 overflow-visible">
                {currentUser?.role === 'Superadmin' ? (
                    <AdminSelect
                        allAdmins={allUsers}
                        selectedAdminIds={project.admins?.map(a => a.id) || []}
                        onChange={(newAdminIds) => onAssignAdmin(project.id, newAdminIds)}
                        disabled={project.is_done}
                        onToggle={onToggleMenu}
                    />
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {project.admins?.map((admin) => (
                            <span key={admin.id} className="text-[10px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {admin.username}
                            </span>
                        ))}
                        {(!project.admins || project.admins.length === 0) && (
                            <span className="text-xs text-gray-500 italic">Unassigned</span>
                        )}
                    </div>
                )}
            </td>
            <td className="py-4 px-4 text-gray-300">{project.prospect.client_name}</td>
            <td className="py-4 px-4">
                {project.prospect.status === 'REAL_LOSS' ? (
                    <span className="text-xs bg-danger/20 text-danger px-2 py-1 rounded-full font-bold">REAL LOSS</span>
                ) : project.is_done ? (
                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-bold">DONE</span>
                ) : (
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">IN PROGRESS</span>
                )}
            </td>
            <td className="py-4 px-4">
                <div className="w-32">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{project.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            className={`h-full ${project.progress === 100 ? 'bg-success' : 'bg-primary'}`}
                        />
                    </div>
                </div>
            </td>
            <td className="py-4 px-4 text-gray-400 text-sm">
                <div className="flex items-center justify-between">
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
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
                        {!project.is_done && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/projects/${project.id}`, { state: { openAddSubtask: true } });
                                }}
                                className="p-1 hover:bg-primary/20 hover:text-primary rounded-full transition-colors"
                                title="Add Subtask"
                            >
                                <Plus size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
};
