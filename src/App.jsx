import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './authContext.jsx';
import ProtectedRoute from './components/ProtectedRoute'; // Add this import
import UserDashboard from './components/UserDashboard';
import Login from './components/Login';
import SignUp from './components/SignUp.jsx';
import MovieDetails from './components/MovieDetails.jsx';
import Homepage from './components/Homepage.jsx';
import Footer from './components/Footer.jsx';
import ContactUs from './components/ContactUs.jsx';
import AboutUs from './components/AboutUs.jsx';
import Careers from './components/Careers.jsx';
import Press from './components/Press.jsx';
import HelpCenter from './components/HelpCenter.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import TermsOfUse from './components/TermsOfUse.jsx';
import CookiePreferences from './components/CookiePrefernces.jsx';
import CorporateInformation from './components/CorporateInformation.jsx';
import SubscriptionPage from './components/SubscriptionPage.jsx';
import PaymentSuccess from './components/PaymentSuccess';
import VideoPlayer from './components/VideoPlayer';
import Video from './components/Video';
import AdminDashboard from './components/AdminDashboard';
import AdminSignup from './components/AdminSignup';
import AdminLogin from './components/AdminLogin';
import UserProfile from './components/UserProfile.jsx';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />                {/* Home Page */}
          <Route path="/login" element={<Login />} />              {/* Login Page */}
          <Route path="/signup" element={<SignUp />} />            {/* Signup Page */}
          <Route path="/userdashboard" element={<UserDashboard />} />      {/* Dashboard */}
          <Route path="/moviedetails/:id" element={<MovieDetails />} />  {/* Movie Details with Dynamic ID */}
          <Route path="/contactus" element={<ContactUs />} />      {/* Contact Us */}
          <Route path="/navbar" element={<Navigate to="/" />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/press" element={<Press />} />
          <Route path="/helpcenter" element={<HelpCenter />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsofuse" element={<TermsOfUse />} />
          <Route path="/cookiepreferences" element={<CookiePreferences />} />
          <Route path="/corporateinformation" element={<CorporateInformation />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/video-player" element={<VideoPlayer />} />
          <Route path="/video" element={<Video />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route
            path="/userdashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
