const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./db/dbconnect');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const app = express();

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const userProfileRoutes = require('./routes/userprofileRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentverification = require('./routes/paymentverification');
const formsfillController = require('./routes/formsfillRoutes')
const buildingpermit = require('./routes/buildingPermitRoutes')
const plumbingpermit = require('./routes/plumbingRoutes')
const fencingpermit = require('./routes/fencingPermitRoutes')
const electronicpermit = require('./routes/electronicpermitRoutes')
const fourpermits = require('./routes/permitstrackingRoutes')
const employeedash = require('./routes/employeedashRoutes')
const documentstorage = require('./routes/documentstorageRoutes')
const employeesidebarRoutes = require("./routes/employeesidebarRoutes");
const usernavRoutes = require('./routes/usernavRoutes');
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
/* ===================== FORMS AUTOFILLSROUTES ===================== */
app.use('/api', formsfillController);
/* ===================== FORMS BUILDING ROUTES ===================== */
app.use('/api', buildingpermit);
/* ===================== FORMS PLUMBINGPERMIT ROUTES ===================== */
app.use('/api', plumbingpermit);
/* ===================== FORMS FENCINGPERMIT ROUTES ===================== */
app.use('/api', fencingpermit);
/* ===================== FORMS ELECTRONIC ROUTES ===================== */
app.use('/api', electronicpermit);
/* ===================== New 4 document tracking routes ROUTES ===================== */
app.use('/api', fourpermits);
/* ===================== New 4 document employeedashboard routes ROUTES ===================== */
app.use('/api', employeedash);
/* ===================== Admin Requirements storage  routes ROUTES ===================== */
app.use('/api/document-storage', documentstorage);
/* =====================employee sidebar routes ROUTES ===================== */
app.use("/api", employeesidebarRoutes);
app.use('/api', usernavRoutes);
/* ===================== SMS routes ROUTES ===================== */
const smsRoutes = require('./routes/smsRoutes');
app.use('/api/sms', smsRoutes);
const admindocupriceRoutes = require('./routes/admindocupriceRoutes');
// ...
app.use('/api/document-prices', admindocupriceRoutes);

const admindashRoutes = require('./routes/admindashRoutes');
app.use('/api/admin-dashboard', admindashRoutes);
// Start the server
app.listen(8081, () => {
  console.log("Server running on port 8081");
});
