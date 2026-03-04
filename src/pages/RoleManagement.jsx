import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

const RoleManagement = () => {
    const { token, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        roleName: 'Admin'
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && user?.role === 'Superadmin') {
            fetchUsers();
        }
    }, [token, user]);

    const handleOpenModal = (userToEdit = null) => {
        if (userToEdit) {
            setEditingUserId(userToEdit.id);
            setFormData({
                username: userToEdit.username || '',
                email: userToEdit.email || '',
                password: '', // Blank for editing, only fill if they want to change it
                roleName: userToEdit.role?.name || 'Admin'
            });
        } else {
            setEditingUserId(null);
            setFormData({
                username: '',
                email: '',
                password: '',
                roleName: 'Admin'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUserId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUserId) {
                // Update
                const payload = { ...formData };
                if (!payload.password) delete payload.password; // don't send empty password

                await axios.put(`http://localhost:5000/api/users/${editingUserId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Create
                await axios.post(`http://localhost:5000/api/users`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            handleCloseModal();
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error saving user');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await axios.delete(`http://localhost:5000/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error deleting user');
        }
    };

    const filteredUsers = users.filter(u =>
        (u.username?.toLowerCase().includes(search.toLowerCase())) ||
        (u.email?.toLowerCase().includes(search.toLowerCase()))
    );

    if (user?.role !== 'Superadmin') {
        return <div className="text-center mt-20 text-danger font-bold text-xl">Access Denied</div>;
    }

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Role Management</h1>
                    <p className="text-gray-400 mt-1">Manage system access, roles, and user accounts.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                            placeholder="Search users..."
                            className="bg-black/40 border-white/10 pl-10 h-10 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => handleOpenModal()} className="gap-2 shrink-0 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.5)]">
                        <Plus size={18} /> Add User
                    </Button>
                </div>
            </div>

            <Card className="bg-black/20 border-white/5 backdrop-blur-xl overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4 pl-6">Username</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Created Date</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="font-semibold text-white">{u.username}</div>
                                        </td>
                                        <td className="p-4 text-gray-300">{u.email || '-'}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${u.role?.name === 'Superadmin'
                                                    ? 'bg-secondary/20 text-secondary border border-secondary/20'
                                                    : 'bg-primary/20 text-primary border border-primary/20'
                                                }`}>
                                                {u.role?.name?.toUpperCase() || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(u)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {u.id !== user.id && ( // Prevent self-deletion visually
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* User Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <Card className="relative z-10 w-full max-w-md bg-gray-900 border-white/10 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingUserId ? 'Edit User' : 'Create New User'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Username</label>
                                <Input
                                    required
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="bg-black/40 border-white/10"
                                    placeholder="kasir_01"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email <span className="text-gray-600">(Optional)</span></label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-black/40 border-white/10"
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Password {editingUserId && <span className="text-gray-600 normal-case font-normal">(Leave blank to keep current)</span>}
                                </label>
                                <Input
                                    type="password"
                                    required={!editingUserId}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-black/40 border-white/10"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Role</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none transition-all"
                                    value={formData.roleName}
                                    onChange={e => setFormData({ ...formData, roleName: e.target.value })}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Superadmin">Superadmin</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                                <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                                <Button type="submit" className="shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                                    {editingUserId ? 'Save Changes' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
