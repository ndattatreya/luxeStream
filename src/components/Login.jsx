import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false); // Toggle between User and Admin login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const recaptchaRef = useRef(null);
  const [captchaValue, setCaptchaValue] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaValue) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      const endpoint = isAdmin ? '/api/login' : '/api/login'; // Use appropriate endpoint
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        if (isAdmin) {
          localStorage.setItem('admin', JSON.stringify(data.admin));
          navigate('/admin'); // Redirect to Admin Dashboard
        } else {
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/dashboard'); // Redirect to User Dashboard
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Internal server error');
    }
  };

  const handleGoogleAuth = () => {
    window.open('http://localhost:5000/auth/google', '_self'); // Google OAuth endpoint
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
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
            User Login
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`px-4 py-2 rounded-r-lg ${
              isAdmin ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            Admin Login
          </button>
        </div>

        <h2 className="text-3xl font-bold text-white mb-8">
          {isAdmin ? 'Admin Login' : 'User Login'}
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} // Replace with your reCAPTCHA site key
              onChange={handleCaptchaChange}
              theme="dark"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-4 rounded font-semibold hover:bg-red-700 transition duration-300"
          >
            {isAdmin ? 'Admin Login' : 'User Login'}
          </button>
        </form>

        <div className="mt-6 text-gray-400">
          <p>
            New to LuxeStream?{' '}
            <Link to="/signup" className="text-white hover:underline">
              Sign up now
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleAuth}
            className="w-full bg-blue-600 text-white py-4 rounded font-semibold hover:bg-blue-700 transition duration-300"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;