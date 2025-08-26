const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./db/dbconnect');
const fileUpload = require('express-fileupload');

const app = express();

// Serve uploads folder
app.use('/uploads', express.static('uploads'));

// File upload middleware
app.use(fileUpload());

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));

// Debug route
app.get('/api/debug-session', (req, res) => {
  console.log("Session debug:", req.session);
  res.json({
    sessionExists: !!req.session,
    userExists: !!req.session.user,
    userId: req.session.user ? req.session.user.user_id : null
  });
});

// Check session
app.get('/api/check-session', (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ loggedIn: true, user: req.session.user });
  }
  return res.status(200).json({ loggedIn: false });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Failed to logout' });
    res.clearCookie('connect.sid'); 
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});

/* ===================== ROUTE IMPORTS ===================== */
const authRoutes = require('./routes/authRoutes');
const businessPermitRoutes = require('./routes/businessPermitRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const officeRoutes = require('./routes/officeRoutes');
const electricalPermitRoutes = require('./routes/electricalPermitRoutes');
const cedulaRoutes = require('./routes/cedulaRoutes');
const applicationRequirementsRoutes = require('./routes/applicationRequirementsRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentverification = require('./routes/paymentverification');
/* ===================== USE ROUTES ===================== */
app.use('/api/auth', authRoutes);
app.use('/api', businessPermitRoutes, cedulaRoutes);
app.use('/api', employeeRoutes);
app.use('/api', officeRoutes);
app.use('/api', electricalPermitRoutes);

app.use('/api', applicationRequirementsRoutes);
app.use('/api', userProfileRoutes);
/* ===================== PAYMENT ROUTES ===================== */
app.use('/api/payments', paymentRoutes);
/* ===================== PAYMENT VERIFICATION ===================== */
app.use('/api', paymentverification);
// Start the server
app.listen(8081, () => {
  console.log("Server running on port 8081");
});
