const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./db/dbconnect');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const path = require('path');
const app = express();

/* ===================== STATIC UPLOADS ===================== */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ===================== FILE UPLOAD ===================== */
app.use(fileUpload());

/* ===================== CORS ===================== */
app.use(
  cors({
    origin: 'http://localhost:3000', // or Vite: 'http://localhost:5173'
    credentials: true,
  })
);

/* ===================== JSON PARSER ===================== */
app.use(express.json());

/* ===================== SESSION STORE (MySQL) ===================== */
const MySQLStore = require('express-mysql-session')(session);

// Use env vars or hardcode if needed
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'municipal_db', // change this
});

sessionStore.on('error', (err) => {
  console.error('Session store error:', err);
});

/* ===================== SESSION MIDDLEWARE ===================== */
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false, // true only if you're on HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
    },
  })
);

/* ===================== DEBUG ROUTES ===================== */
app.get('/api/debug-session', (req, res) => {
  console.log('Session debug:', req.session);
  res.json({
    sessionExists: !!req.session,
    userExists: !!req.session.user,
    userId: req.session.user ? req.session.user.user_id : null,
  });
});

app.get('/api/check-session', (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ loggedIn: true, user: req.session.user });
  }
  return res.status(200).json({ loggedIn: false });
});

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
const formsfillController = require('./routes/formsfillRoutes');
const buildingpermit = require('./routes/buildingPermitRoutes');
const plumbingpermit = require('./routes/plumbingRoutes');
const fencingpermit = require('./routes/fencingPermitRoutes');
const electronicpermit = require('./routes/electronicpermitRoutes');
const fourpermits = require('./routes/permitstrackingRoutes');
const employeedash = require('./routes/employeedashRoutes');
const documentstorage = require('./routes/documentstorageRoutes');
const employeesidebarRoutes = require('./routes/employeesidebarRoutes');
const usernavRoutes = require('./routes/usernavRoutes');
const smsRoutes = require('./routes/smsRoutes');
const admindocupriceRoutes = require('./routes/admindocupriceRoutes');
const admindashRoutes = require('./routes/admindashRoutes');

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
app.use('/api', paymentverification);

/* ===================== FORMS AUTOFILL ROUTES ===================== */
app.use('/api', formsfillController);

/* ===================== PERMIT ROUTES ===================== */
app.use('/api', buildingpermit);
app.use('/api', plumbingpermit);
app.use('/api', fencingpermit);
app.use('/api', electronicpermit);

/* ===================== TRACKING / DASHBOARD ROUTES ===================== */
app.use('/api', fourpermits);
app.use('/api', employeedash);

/* ===================== DOCUMENT STORAGE ROUTES ===================== */
app.use('/api/document-storage', documentstorage);

/* ===================== SIDEBAR / NAV ROUTES ===================== */
app.use('/api', employeesidebarRoutes);
app.use('/api', usernavRoutes);

/* ===================== SMS ROUTES ===================== */
app.use('/api/sms', smsRoutes);

/* ===================== ADMIN ROUTES ===================== */
app.use('/api/document-prices', admindocupriceRoutes);
app.use('/api/admin-dashboard', admindashRoutes);

/* ===================== START SERVER ===================== */
app.listen(8081, () => {
  console.log('Server running on port 8081');
});
