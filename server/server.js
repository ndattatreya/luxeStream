const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Import the User model
const Movie = require('./models/Movie'); // Create a Movie model
const userRoutes = require('./routes/userRoutes');

require('dotenv').config();

const app = express();

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow multiple origins
  credentials: true, // Allow cookies and credentials
}));

// Force JSON content type
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use(session({
  secret: 'luxestream_secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Mount routes
app.use('/api/users', userRoutes);

// Razorpay setup
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Razorpay route
app.post('/create-order', async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Error creating Razorpay order' });
  }
});

// Passport serialize/deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value,
    });
  }
  return done(null, user);
}));

// GitHub OAuth strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ githubId: profile.id });
  if (!user) {
    user = await User.create({
      githubId: profile.id,
      username: profile.username,
      email: profile.emails[0].value,
    });
  }
  return done(null, user);
}));

// OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:3000',
    failureRedirect: '/login',
  })
);

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback',
  passport.authenticate('github', {
    successRedirect: 'http://localhost:3000',
    failureRedirect: '/login',
  })
);

// Get current user
app.get('/api/user', (req, res) => {
  res.json(req.user || null);
});

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000');
  });
});

// Signup route
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword, role: 'user' });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Signup route
app.post('/api/admin/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the admin already exists
    const existingAdmin = await User.findOne({ email, role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new User({ username, email, password: hashedPassword, role: 'admin' });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Error during admin signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Login route
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email and role
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Admin login successful', admin });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a new movie
app.post('/api/movies', async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json({ message: 'Movie added successfully', movie });
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all movies
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a movie
app.put('/api/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json({ message: 'Movie updated successfully', movie });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a movie
app.delete('/api/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
