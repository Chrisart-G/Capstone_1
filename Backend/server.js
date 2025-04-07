const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./db/dbconnect')
const Routes = require('./routes/Routes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Fix CORS to properly allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:3000', // Make sure this exactly matches your frontend origin
  credentials: true
}));

app.use(express.json()); // Add this to parse JSON request bodies

app.use(session({
  secret: 'your-secret-key', // replace with environment variable in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Add these session check and logout routes
app.get('/api/check-session', (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ loggedIn: true, user: req.session.user });
  }
  return res.status(200).json({ loggedIn: false });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Then your existing routes
app.use('/api/auth', authRoutes);
app.use('/api', Routes);

app.listen(8081, () => {
  console.log("Server running on port 8081");
  console.log("ga gana paman ah");
});