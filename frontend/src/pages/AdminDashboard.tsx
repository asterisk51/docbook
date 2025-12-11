import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';


export default function AdminDashboard() {
    const { isAdmin, loginAsAdmin } = useAuth();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [newDoctorName, setNewDoctorName] = useState('');
    const [newSpecialty, setNewSpecialty] = useState('');

    useEffect(() => {
        if (isAdmin) fetchDoctors();
    }, [isAdmin]);

    const fetchDoctors = async () => {
        const res = await api.get('/doctors');
        setDoctors(res.data);
    };

    const handleCreateDoctor = async () => {
        try {
            if (!newDoctorName.trim()) {
                alert('Doctor Name is required');
                return;
            }
            await api.post('/doctors', { name: newDoctorName, specialty: newSpecialty });
            setNewDoctorName('');
            setNewSpecialty('');
            fetchDoctors();
            alert('Doctor created successfully!');
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || error.message;
            const errorDetails = error.response?.data?.details ? JSON.stringify(error.response.data.details) : '';
            alert(`Failed to create doctor: ${errorMsg}\nDetails: ${errorDetails}`);
        }
    };

    const handleCreateSlot = async (doctorId: string) => {
        // specific time for demo: next day 10am
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        await api.post('/slots', { time: tomorrow.toISOString(), doctorId });
        alert('Slot created for 10:00 AM tomorrow');
        fetchDoctors();
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <h2 className="text-3xl font-bold text-slate-800">Admin Access Required</h2>
                    <p className="text-slate-500">Please login as an administrator to manage doctors and slots.</p>
                    <Button onClick={loginAsAdmin} className="bg-teal-600 hover:bg-teal-700">Login as Admin</Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-2">Manage doctors, set schedules, and oversee appointments.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Create Doctor Section */}
                <div className="md:col-span-1">
                    <Card className="sticky top-24 shadow-md border-teal-100 bg-gradient-to-br from-white to-teal-50/30">
                        <CardHeader>
                            <CardTitle className="text-teal-800">Add New Doctor</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Doctor Name</label>
                                <input
                                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. Dr. Sarah Smith"
                                    value={newDoctorName}
                                    onChange={e => setNewDoctorName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Specialty</label>
                                <input
                                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. Cardiologist"
                                    value={newSpecialty}
                                    onChange={e => setNewSpecialty(e.target.value)}
                                />
                            </div>
                            <Button className="w-full bg-teal-600 hover:bg-teal-700 mt-2" onClick={handleCreateDoctor}>
                                Create Doctor
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Doctors List Section */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold text-slate-800">Doctors Management</h2>
                    <div className="grid gap-4">
                        {doctors.map((doc: any) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                layout
                            >
                                <Card className="hover:shadow-md transition-shadow bg-white">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                                {doc.name.charAt(0)}
                                            </div>
                                            <div>
                                                <CardTitle className="text-base text-slate-900">{doc.name}</CardTitle>
                                                <p className="text-sm text-slate-500">{doc.specialty}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCreateSlot(doc.id)}
                                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 border-teal-200"
                                        >
                                            + Add Demo Slot
                                        </Button>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
