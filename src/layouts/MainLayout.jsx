import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Briefcase, Settings, LogOut, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['Superadmin', 'Manager', 'Sales', 'Engineer'] },
        { icon: Users, label: 'Prospects', path: '/prospects', roles: ['Superadmin', 'Manager', 'Sales'] },
        { icon: Briefcase, label: 'Projects', path: '/projects', roles: ['Superadmin', 'Manager', 'Engineer'] },
        { icon: CheckCircle, label: 'Project Status', path: '/project-status', roles: ['Superadmin', 'Manager', 'Engineer', 'Sales'] },
        { icon: Settings, label: 'Role Mgmt', path: '/admin', roles: ['Superadmin'] },
    ];

    const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="flex min-h-screen bg-background text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        ERP
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">v1.0.0 // {user?.role}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {filteredNav.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                                isActive
                                    ? "bg-primary/20 text-primary border border-primary/50 shadow-neon-blue"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[128px]" />
                </div>

                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
