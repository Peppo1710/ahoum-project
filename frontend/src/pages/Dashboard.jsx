import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [mySessions, setMySessions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Session creation form state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        duration: 60,
        capacity: 10,
        price: '0.00',
    });
    const [creating, setCreating] = useState(false);

    // Profile editing state
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        avatar: '',
    });
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                avatar: user.avatar || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                if (user.role === 'USER') {
                    const response = await api.get('/bookings/');
                    setBookings(response.data);
                } else if (user.role === 'CREATOR') {
                    const [sessionsRes, bookingsRes] = await Promise.all([
                        api.get('/sessions/my_sessions/'),
                        api.get('/bookings/')
                    ]);
                    setMySessions(sessionsRes.data);
                    setBookings(bookingsRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/sessions/', {
                ...formData,
                duration: parseInt(formData.duration),
                capacity: parseInt(formData.capacity),
            });
            // Refresh sessions list
            const res = await api.get('/sessions/my_sessions/');
            setMySessions(res.data);
            setShowCreateForm(false);
            setFormData({ title: '', description: '', date: '', duration: 60, capacity: 10, price: '0.00' });
        } catch (error) {
            console.error("Failed to create session", error);
            alert(error.response?.data?.detail || "Failed to create session");
        } finally {
            setCreating(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await api.patch('/auth/me/', profileData);
            alert('Profile updated!');
            setEditingProfile(false);
            window.location.reload();
        } catch (error) {
            console.error("Failed to save profile", error);
            alert("Failed to save profile");
        } finally {
            setSavingProfile(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center text-gray-500">Please login to view your dashboard.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">
                    {user.role === 'CREATOR' ? 'Creator Dashboard' : 'User Dashboard'}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {user.role}
                </span>
            </div>

            {/* Profile Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
                    <button
                        onClick={() => setEditingProfile(!editingProfile)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        {editingProfile ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
                {editingProfile ? (
                    <form onSubmit={handleSaveProfile} className="px-4 py-5 sm:px-6 space-y-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    value={profileData.first_name}
                                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    value={profileData.last_name}
                                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                            <input
                                type="url"
                                value={profileData.avatar}
                                onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                                placeholder="https://example.com/avatar.png"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                        >
                            {savingProfile ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                ) : (
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Username</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user.username}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {user.first_name || user.last_name
                                        ? `${user.first_name} ${user.last_name}`.trim()
                                        : 'Not set'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user.email || 'Not set'}</dd>
                            </div>
                        </dl>
                    </div>
                )}
            </div>

            {/* Creator: My Sessions Section */}
            {user.role === 'CREATOR' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">My Sessions</h3>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {showCreateForm ? 'Cancel' : '+ Create Session'}
                        </button>
                    </div>

                    {/* Create Session Form */}
                    {showCreateForm && (
                        <form onSubmit={handleCreateSession} className="px-4 py-5 sm:px-6 space-y-4 border-t border-gray-200 bg-gray-50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="e.g. Introduction to React"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Describe your session..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (minutes) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="15"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                            >
                                {creating ? 'Creating...' : 'Create Session'}
                            </button>
                        </form>
                    )}

                    <ul className="divide-y divide-gray-200">
                        {mySessions.length === 0 ? (
                            <li className="px-4 py-8 text-sm text-gray-500 text-center">
                                You haven't created any sessions yet. Click "Create Session" above to get started!
                            </li>
                        ) : (
                            mySessions.map((session) => (
                                <li key={session.id} className="px-4 py-4 flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <div className="text-sm font-medium text-indigo-600 truncate">{session.title}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(session.date).toLocaleDateString()} · {session.duration} mins
                                            {session.price > 0 && ` · $${session.price}`}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.available_spots > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {session.available_spots} / {session.capacity} spots
                                        </span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {/* Bookings Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {user.role === 'CREATOR' ? 'Bookings on Your Sessions' : 'My Bookings'}
                    </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {bookings.length === 0 ? (
                        <li className="px-4 py-8 text-sm text-gray-500 text-center">No bookings found.</li>
                    ) : (
                        bookings.map((booking) => (
                            <li key={booking.id} className="px-4 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-indigo-600 truncate">
                                        {booking?.session_details?.title || 'Unknown Session'}
                                    </div>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                    {booking?.session_details && (
                                        <>
                                            {new Date(booking.session_details.date).toLocaleDateString()} · {booking.session_details.duration} mins
                                            {booking.session_details.price > 0 && ` · $${booking.session_details.price}`}
                                        </>
                                    )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
