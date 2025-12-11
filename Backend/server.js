// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const http = require('http');

const db = require('./db/dbconnect');

const app = express();

/* ===================== TRUST PROXY (for cookies behind localhost proxies) ===================== */
app.set('trust proxy', 1);

/* ===================== STATIC UPLOADS ===================== */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ===================== JSON / URLENCODED (BIG LIMITS FIRST!) ===================== */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ===================== FILE UPLOAD (only affects multipart/form-data) ===================== */
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    abortOnLimit: false,
    useTempFiles: false,
  })
);

/* ===================== CORS (allow your actual frontend) ===================== */
const FRONTENDS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || FRONTENDS.includes(origin)),
    credentials: true,
  })
);

/* ===================== SESSION STORE (MySQL) ===================== */
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'municipal_db',
});
sessionStore.on('error', (err) => {
  console.error('Session store error:', err);
});

app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false,          // set true only if HTTPS
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

/* ===================== DEBUG / HEALTH ===================== */
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// quick way to test body size/transport without hitting your PDF code
app.post('/api/debug/echo', (req, res) => {
  const raw = JSON.stringify(req.body || {});
  res.json({ ok: true, size: raw.length, keys: Object.keys(req.body || {}) });
});

app.get('/api/debug-session', (req, res) => {
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
    res.clearCookie('sid');
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
const userdashRoutes = require('./routes/userdashRoutes');
const fencingfillRoutes = require('./routes/PDF_fencingfillRoutes')
const plumbingfillRoutes = require('./routes/PDF_fillplumbingRoutes');

/* ===================== USE ROUTES (mounted under /api) ===================== */
app.use('/api/auth', authRoutes);
app.use('/api', businessPermitRoutes, cedulaRoutes);
app.use('/api', employeeRoutes);
app.use('/api', officeRoutes);
app.use('/api', electricalPermitRoutes);
app.use('/api', applicationRequirementsRoutes);
app.use('/api', userProfileRoutes);

app.use('/api/payments', paymentRoutes);
app.use('/api', paymentverification);

app.use('/api', formsfillController);

app.use('/api', buildingpermit);
app.use('/api', plumbingpermit);
app.use('/api', fencingpermit);
app.use('/api', electronicpermit);

app.use('/api', fourpermits);
app.use('/api', employeedash);

app.use('/api/document-storage', documentstorage);

app.use('/api', employeesidebarRoutes);
app.use('/api', usernavRoutes);

app.use('/api/sms', smsRoutes);

app.use('/api/document-prices', admindocupriceRoutes);
app.use('/api/admin-dashboard', admindashRoutes);
app.use('/api', userdashRoutes);
app.use('/api', fencingfillRoutes);
app.use('/api', plumbingfillRoutes);


/* ===================== CENTRAL ERROR HANDLER (prevents hard resets) ===================== */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: 'Server error.' });
});

/* ===================== START HTTP SERVER WITH LONGER TIMEOUTS ===================== */
const PORT = process.env.PORT || 8081;
const server = http.createServer(app);

// Give large JSON uploads + PDF generation enough time
server.headersTimeout = 120_000;   // 120s
server.requestTimeout = 120_000;   // 120s
server.keepAliveTimeout = 75_000;  // 75s
process.on("uncaughtException", (e) => console.error("UNCAUGHT:", e));
process.on("unhandledRejection", (e) => console.error("UNHANDLED REJECTION:", e));
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
