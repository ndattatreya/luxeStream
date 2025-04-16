import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../authContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const recaptchaRef = useRef(null);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset reCAPTCHA on component mount
  useEffect(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login...'); // Debug log

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          recaptchaToken: captchaValue 
        }),
        credentials: 'include'
      });

      console.log('Response status:', response.status); // Debug log

      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and login
      localStorage.setItem('token', data.token);
      await login(data.user);

      // Navigate to appropriate page
      const intendedPath = location.state?.from || '/dashboard';
      navigate(intendedPath, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    setError(''); // Clear any existing errors when captcha is completed
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
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
              theme="dark"
              size="normal"
              hl="en"
              onExpired={() => {
                setCaptchaValue(null);
                setError('reCAPTCHA has expired, please verify again');
              }}
              onError={() => {
                setCaptchaValue(null);
                setError('Error loading reCAPTCHA');
              }}
            />
          </div>

          <button
            type="submit"
            className={`w-full ${
              isLoading ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } text-white py-4 rounded font-semibold transition duration-300`}
            disabled={isLoading || !captchaValue}
          >
            {isLoading ? 'Logging in...' : (isAdmin ? 'Admin Login' : 'User Login')}
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
      </div>
    </div>
  );
};

export default Login;