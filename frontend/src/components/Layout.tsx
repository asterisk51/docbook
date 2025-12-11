import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const { user, isAdmin, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 border-b border-white/20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                                DocBook
                            </Link>

                            <nav className="hidden md:flex gap-6">
                                <NavLink to="/" active={location.pathname === '/'}>
                                    <Calendar className="w-4 h-4" />
                                    Book Appointment
                                </NavLink>
                                <NavLink to="/admin" active={location.pathname === '/admin'}>
                                    <LayoutDashboard className="w-4 h-4" />
                                    Admin Dashboard
                                </NavLink>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            {user || isAdmin ? (
                                <>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">{user?.name || (isAdmin ? 'Admin' : 'Guest')}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </main>

            <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
                    © {new Date().getFullYear()} DocBook. Premium Healthcare Scheduling.
                </div>
            </footer>
        </div>
    );
}

function NavLink({ to, children, active }: { to: string, children: React.ReactNode, active: boolean }) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-md ${active
                    ? 'text-teal-600 bg-teal-50'
                    : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                }`}
        >
            {children}
        </Link>
    );
}
