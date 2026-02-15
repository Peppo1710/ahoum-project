import { useEffect, useState } from 'react';
import api from '../services/api';
import SessionCard from '../components/SessionCard';

export default function Home() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await api.get('/sessions/');
                // Ensure we always have an array
                const data = Array.isArray(response.data) ? response.data : [response.data];
                setSessions(data);
            } catch (error) {
                console.error("Failed to fetch sessions", error);
                setSessions([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    Discover Sessions
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    Browse and book sessions from top creators.
                </p>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    No sessions available at the moment.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => (
                        <SessionCard key={session.id} session={session} />
                    ))}
                </div>
            )}
        </div>
    );
}
