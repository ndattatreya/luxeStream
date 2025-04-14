import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false); // Toggle between User and Admin signup
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const endpoint = isAdmin ? '/api/admin/signup' : '/api/signup'; // Use appropriate endpoint
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(isAdmin ? 'Admin registered successfully!' : 'User registered successfully!');
        setTimeout(() => navigate(isAdmin ? '/admin-login' : '/login'), 2000); // Redirect to login
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setError('Internal server error');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-black bg-opacity-50 pt-20"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=1920')`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="z-10 p-8 bg-black bg-opacity-80 rounded-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsAdmin(false)}
            className={`px-4 py-2 rounded-l-lg ${
              !isAdmin ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            User Signup
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`px-4 py-2 rounded-r-lg ${
              isAdmin ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            Admin Signup
          </button>
        </div>

        <h2 className="text-3xl font-bold text-white mb-8">
          {isAdmin ? 'Admin Signup' : 'User Signup'}
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-4 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full p-4 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-4 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-4 rounded font-semibold hover:bg-red-700 transition duration-300"
          >
            {isAdmin ? 'Admin Signup' : 'User Signup'}
          </button>
        </form>

        <div className="mt-6 text-gray-400 text-sm">
          <p>
            By signing up, you agree to our{' '}
            <a href="/termsofuse" className="text-white hover:underline">
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="/privacypolicy" className="text-white hover:underline">
              Privacy Policy
            </a>
            .
          </p>
          <p className="mt-2">
            This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
            <a href="/helpcenter" className="text-white hover:underline">
              Learn more
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;