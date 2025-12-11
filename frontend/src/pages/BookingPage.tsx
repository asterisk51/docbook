import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

export default function BookingPage() {
    const { user, loginAsUser } = useAuth();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        if (user) fetchDoctors();
    }, [user]);

    useEffect(() => {
        if (selectedDoctor) {
            fetchSlots(selectedDoctor);
            setSelectedDate(null); // Reset date when doctor changes
        }
    }, [selectedDoctor]);

    const fetchDoctors = async () => {
        const res = await api.get('/doctors');
        setDoctors(res.data);
    };

    const fetchSlots = async (doctorId: string) => {
        try {
            const res = await api.get(`/doctors/${doctorId}/slots`);
            setSlots(res.data);

            // Auto-select first date if available
            if (res.data.length > 0) {
                const dates: string[] = Array.from(new Set(res.data.map((s: any) =>
                    format(parseISO(s.time), 'yyyy-MM-dd')
                ))).sort() as string[];
                if (dates.length > 0) setSelectedDate(dates[0]);
            }
        } catch (error) {
            console.error("Failed to fetch slots", error);
        }
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

    // Derived state for unique dates
    const uniqueDates = useMemo(() => {
        const dates = new Set(slots.map(slot => format(parseISO(slot.time), 'yyyy-MM-dd')));
        return Array.from(dates).sort();
    }, [slots]);

    // Derived state for filtered slots
    const filteredSlots = useMemo(() => {
        if (!selectedDate) return [];
        return slots.filter(slot =>
            format(parseISO(slot.time), 'yyyy-MM-dd') === selectedDate
        ).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }, [slots, selectedDate]);

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
                        Experience premium healthcare scheduling. Book appointments with top doctors effortlessly.
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Doctors List */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-800">Available Doctors</h2>
                        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-1 rounded-full">{doctors.length} Doctors</span>
                    </div>

                    <div className="space-y-3">
                        {doctors.map((doc: any) => (
                            <motion.div
                                key={doc.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Card
                                    className={`cursor-pointer transition-all border-l-4 ${selectedDoctor === doc.id
                                        ? 'border-l-teal-500 ring-1 ring-teal-500/20 shadow-md bg-white'
                                        : 'border-l-transparent hover:bg-white hover:shadow-sm bg-slate-50/50'
                                        }`}
                                    onClick={() => setSelectedDoctor(doc.id)}
                                >
                                    <div className="p-4 flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${selectedDoctor === doc.id ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            {doc.name.charAt(0)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h3 className={`font-semibold truncate ${selectedDoctor === doc.id ? 'text-teal-900' : 'text-slate-700'}`}>
                                                {doc.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 truncate">{doc.specialty}</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Slots Selection */}
                <div className="lg:col-span-8">
                    <Card className="min-h-[500px] border-slate-200/60 shadow-sm flex flex-col">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-teal-600" />
                                {selectedDoctor ? 'Select Date & Time' : 'Schedule'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 flex-1 flex flex-col">
                            {selectedDoctor ? (
                                <div className="space-y-8 flex-1">
                                    {/* Date Selector */}
                                    {uniqueDates.length > 0 ? (
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-700 px-1">Available Dates</label>
                                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent px-1">
                                                {uniqueDates.map(dateStr => {
                                                    const date = parseISO(dateStr);
                                                    const isSelected = selectedDate === dateStr;
                                                    return (
                                                        <button
                                                            key={dateStr}
                                                            onClick={() => setSelectedDate(dateStr)}
                                                            className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border transition-all ${isSelected
                                                                ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-200'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                                                                }`}
                                                        >
                                                            <span className="text-xs font-medium opacity-80">{format(date, 'EEE')}</span>
                                                            <span className="text-lg font-bold">{format(date, 'd')}</span>
                                                            <span className="text-xs opacity-60">{format(date, 'MMM')}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                            <p className="text-slate-400">No slots available for this doctor yet.</p>
                                        </div>
                                    )}

                                    {/* Time Slots Grid */}
                                    {selectedDate && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <label className="text-sm font-medium text-slate-700 px-1">
                                                Available Times for {format(parseISO(selectedDate), 'MMMM do, yyyy')}
                                            </label>

                                            {filteredSlots.length === 0 ? (
                                                <p className="text-slate-400 text-sm px-1">No slots for this date.</p>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                    {filteredSlots.map((slot: any) => (
                                                        <Button
                                                            key={slot.id}
                                                            variant="outline"
                                                            disabled={slot.isBooked || loading}
                                                            className={`h-auto py-3 flex flex-col gap-1 transition-all ${slot.isBooked
                                                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                                                : 'hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 border-slate-200 bg-white text-slate-700 shadow-sm'
                                                                }`}
                                                            onClick={() => handleBook(slot.id)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Clock className={`w-4 h-4 ${!slot.isBooked && 'text-teal-500'}`} />
                                                                <span className="font-semibold text-base">{format(parseISO(slot.time), 'hh:mm a')}</span>
                                                            </div>
                                                            {slot.isBooked && (
                                                                <span className="text-[10px] uppercase font-bold text-slate-400">Booked</span>
                                                            )}
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-4 opacity-60">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                        <ChevronRight className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="font-medium">Select a doctor to view their schedule</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
