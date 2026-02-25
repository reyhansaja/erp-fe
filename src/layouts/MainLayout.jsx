import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Briefcase, Settings, LogOut, CheckCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex min-h-screen bg-background text-white font-sans selection:bg-primary/30">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-30">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    ERP
                </h1>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white hover:bg-white/10">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
            </header>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={cn(
                "w-64 border-r border-white/10 bg-black/40 backdrop-blur-3xl flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:bg-transparent lg:shadow-none",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-white/10 hidden lg:block">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        ERP
                    </h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">v1.0.0 // {user?.role}</p>
                </div>

                <div className="p-6 border-b border-white/10 lg:hidden flex flex-col gap-1">
                    <p className="text-sm font-bold text-primary mb-1 uppercase tracking-widest leading-none outline-none">Control Panel</p>
                    <p className="text-xs text-gray-500 font-medium">Logged in as {user?.username}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {filteredNav.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", isActive && "text-primary shadow-glow")} />
                                    <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-glow"
                                            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 mb-2 lg:mb-0">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl h-11"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        <span className="font-semibold text-sm">Sign Out</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden pt-16 lg:pt-0">
                {/* Background Gradients */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[160px] opacity-40 animate-pulse-slow" />
                    <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[160px] opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10 flex-1 overflow-y-auto px-4 py-8 md:px-8 md:py-10 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
