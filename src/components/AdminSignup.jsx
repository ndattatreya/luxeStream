import React, { useState } from 'react';

const AdminSignup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Admin registered successfully!');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setError('Internal server error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-8 bg-gray-800 rounded-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6">Admin Signup</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 rounded bg-gray-700 text-white placeholder-gray-400"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded bg-gray-700 text-white placeholder-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded bg-gray-700 text-white placeholder-gray-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded hover:bg-blue-700"
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;