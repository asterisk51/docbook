import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

export default function BookingPage() {
    const { user, loginAsUser } = useAuth();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) fetchDoctors();
    }, [user]);

    useEffect(() => {
        if (selectedDoctor) fetchSlots(selectedDoctor);
    }, [selectedDoctor]);

    const fetchDoctors = async () => {
        const res = await api.get('/doctors');
        setDoctors(res.data);
    };

    const fetchSlots = async (doctorId: string) => {
        const res = await api.get(`/doctors/${doctorId}/slots`);
        setSlots(res.data);
    };

    const handleBook = async (slotId: string) => {
        if (!user) return;
        try {
            setLoading(true);
            await api.post('/bookings', { userId: user.id, slotId });
            alert('Booking Confirmed!');
            fetchSlots(selectedDoctor!);
        } catch (err: any) {
            alert('Booking Failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <h2 className="text-3xl font-bold text-slate-800">Welcome to DocBook</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Experience premium healthcare scheduling. Book appointments with top doctos effortlessly.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={loginAsUser} size="lg" className="bg-teal-600 hover:bg-teal-700">Continue as Guest</Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Book an Appointment</h1>
                <p className="text-slate-500 mt-2">Select a doctor and find a time that works for you.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-800">Available Doctors</h2>
                        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-1 rounded-full">{doctors.length} Doctors</span>
                    </div>

                    <div className="space-y-3">
                        {doctors.map((doc: any) => (
                            <motion.div
                                key={doc.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card
                                    className={`cursor-pointer transition-all border-l-4 ${selectedDoctor === doc.id
                                        ? 'border-l-teal-500 ring-1 ring-teal-500/20 shadow-md bg-white'
                                        : 'border-l-transparent hover:bg-white hover:shadow-sm bg-slate-50/50'
                                        }`}
                                    onClick={() => setSelectedDoctor(doc.id)}
                                >
                                    <div className="p-4 flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${selectedDoctor === doc.id ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            {doc.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${selectedDoctor === doc.id ? 'text-teal-900' : 'text-slate-700'}`}>
                                                {doc.name}
                                            </h3>
                                            <p className="text-sm text-slate-500">{doc.specialty}</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <Card className="min-h-[500px] border-slate-200/60 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-xl">
                                {selectedDoctor ? 'Select a Time Slot' : 'Schedule'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {selectedDoctor ? (
                                <div className="space-y-6">
                                    {slots.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-slate-400">No available slots for this doctor.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {slots.map((slot: any) => (
                                                <Button
                                                    key={slot.id}
                                                    variant="outline"
                                                    disabled={slot.isBooked || loading}
                                                    className={`h-auto py-4 flex flex-col gap-2 transition-all ${slot.isBooked
                                                        ? 'bg-slate-50 text-slate-400 border-slate-100'
                                                        : 'hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-700 border-slate-200'
                                                        }`}
                                                    onClick={() => handleBook(slot.id)}
                                                >
                                                    <Clock className={`w-4 h-4 ${!slot.isBooked && 'text-teal-600'}`} />
                                                    <span className="font-semibold text-lg">{format(new Date(slot.time), 'hh:mm a')}</span>
                                                    <span className="text-[10px] uppercase tracking-wider font-semibold">
                                                        {slot.isBooked ? 'Booked' : 'Available'}
                                                    </span>
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 gap-4">
                                    <Clock className="w-12 h-12 opacity-20" />
                                    <p>Select a doctor from the list to view their available schedule.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
