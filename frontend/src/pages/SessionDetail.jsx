import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SessionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await api.get(`/sessions/${id}/`);
                setSession(response.data);
            } catch (error) {
                console.error("Failed to fetch session", error);
                if (error.response && error.response.status === 404) {
                    alert("Session not found");
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSession();
        }
    }, [id, navigate]);

    const handleBook = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!confirm("Confirm booking?")) return;

        setBookingLoading(true);
        try {
            await api.post('/bookings/', { session: session.id });
            alert("Booking successful!");
            // Refresh session data to update spots/status
            const response = await api.get(`/sessions/${id}/`);
            setSession(response.data);
            navigate('/dashboard');
        } catch (error) {
            console.error("Booking failed", error);
            alert(error.response?.data?.detail || "Booking failed");
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading session...</div>;
    if (!session) return <div className="p-8 text-center">Session not found.</div>;

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {session.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Hosted by {session.creator.username}
                </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {session.description}
                        </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {new Date(session.date).toLocaleString()}
                        </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Duration</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {session.duration} minutes
                        </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Availability</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {session.available_spots} / {session.capacity} spots remaining
                        </dd>
                    </div>
                </dl>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
                {user ? (
                    session.is_booked_by_user ? (
                        <button disabled className="bg-green-100 text-green-800 px-4 py-2 rounded-md cursor-not-allowed">
                            You have booked this
                        </button>
                    ) : session.available_spots > 0 ? (
                        <button
                            onClick={handleBook}
                            disabled={bookingLoading}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {bookingLoading ? 'Booking...' : 'Book Now'}
                        </button>
                    ) : (
                        <button disabled className="bg-red-100 text-red-800 px-4 py-2 rounded-md cursor-not-allowed">
                            Session Full
                        </button>
                    )
                ) : (
                    <Link
                        to="/login"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Login to Book
                    </Link>
                )}
            </div>
        </div>
    );
}
