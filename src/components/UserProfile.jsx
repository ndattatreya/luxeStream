import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHistory, FaCrown, FaHeart, FaCog, FaChartLine } from 'react-icons/fa';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { useAuth } from '../authContext';

const UserProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  const [watchHistory, setWatchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [watchTimeData, setWatchTimeData] = useState({});

  useEffect(() => {
    fetchUserData();
  }, [user?._id]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user?._id) {
        throw new Error('Authentication required');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const responses = await Promise.allSettled([
        fetch(`http://localhost:5000/api/users/${user._id}/watch-history`, { headers }),
        fetch(`http://localhost:5000/api/users/${user._id}/favorites`, { headers }),
        fetch(`http://localhost:5000/api/users/${user._id}/subscription`, { headers })
      ]);

      const [historyRes, favoritesRes, subscriptionRes] = responses;

      if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
        const history = await historyRes.value.json();
        setWatchHistory(history.data);
      }

      if (favoritesRes.status === 'fulfilled' && favoritesRes.value.ok) {
        const favorites = await favoritesRes.value.json();
        setFavorites(favorites.data);
      }

      if (subscriptionRes.status === 'fulfilled' && subscriptionRes.value.ok) {
        const subscription = await subscriptionRes.value.json();
        setSubscriptionData(subscription.data);
      }

      // Process watch time data
      const watchTimeByGenre = watchHistory.reduce((acc, movie) => {
        acc[movie.genre] = (acc[movie.genre] || 0) + (movie.watchTime || 0);
        return acc;
      }, {});

      setWatchTimeData(watchTimeByGenre);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Handle error state here if needed
    }
  };

  const renderWatchHistory = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {watchHistory.map((movie) => (
        <div key={movie._id} className="bg-gray-800 rounded-lg p-4 flex gap-4">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-24 h-36 object-cover rounded"
          />
          <div>
            <h3 className="font-bold mb-2">{movie.title}</h3>
            <p className="text-sm text-gray-400">Watched on: {new Date(movie.watchedAt).toLocaleDateString()}</p>
            <p className="text-sm text-gray-400">Watch time: {Math.round(movie.watchTime / 60)} mins</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFavorites = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map((movie) => (
        <div key={movie._id} className="bg-gray-800 rounded-lg p-4 flex gap-4">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-24 h-36 object-cover rounded"
          />
          <div>
            <h3 className="font-bold mb-2">{movie.title}</h3>
            <p className="text-sm text-gray-400">{movie.genre}</p>
            <p className="text-sm text-gray-400">Rating: {movie.rating}/10</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSubscription = () => (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Current Plan</h3>
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-bold text-lg">{subscriptionData?.planName}</p>
              <p className="text-gray-400">₹{subscriptionData?.amount}/month</p>
            </div>
            <FaCrown className="text-yellow-500 text-2xl" />
          </div>
          <div className="space-y-2">
            <p>Status: <span className="text-green-500">Active</span></p>
            <p>Next billing date: {new Date(subscriptionData?.nextBilling).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Watch Time by Genre</h3>
        <div className="h-64">
          <Pie
            data={{
              labels: Object.keys(watchTimeData),
              datasets: [{
                data: Object.values(watchTimeData),
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF'
                ]
              }]
            }}
          />
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Viewing Activity</h3>
        <div className="h-64">
          <Line
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Hours Watched',
                data: [10, 15, 8, 12, 9, 14],
                borderColor: '#FF6384',
                tension: 0.1
              }]
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Account Settings</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Email Notifications</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                New releases
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Recommendations
              </label>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Playback Settings</label>
            <select className="bg-gray-700 w-full p-2 rounded">
              <option>Auto-play next episode</option>
              <option>Ask before playing next</option>
            </select>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-3xl">{user?.username?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.username}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <p className="text-gray-400">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg h-fit">
            <nav className="space-y-2">
              <button
                className={`w-full text-left px-4 py-2 rounded flex items-center gap-3 ${activeTab === 'history' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('history')}
              >
                <FaHistory /> Watch History
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded flex items-center gap-3 ${activeTab === 'subscription' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('subscription')}
              >
                <FaCrown /> Subscription
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded flex items-center gap-3 ${activeTab === 'favorites' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('favorites')}
              >
                <FaHeart /> Favorites
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded flex items-center gap-3 ${activeTab === 'analytics' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('analytics')}
              >
                <FaChartLine /> Analytics
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded flex items-center gap-3 ${activeTab === 'settings' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('settings')}
              >
                <FaCog /> Settings
              </button>
            </nav>
          </div>

          <div className="md:col-span-4">
            {activeTab === 'history' && renderWatchHistory()}
            {activeTab === 'subscription' && renderSubscription()}
            {activeTab === 'favorites' && renderFavorites()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;