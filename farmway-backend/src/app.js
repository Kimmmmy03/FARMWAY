'use strict';
require('express-async-errors');
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { middleware: i18nMiddleware, i18next } = require('./config/i18n');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');

const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');

const app = express();
const IS_LOCAL = process.env.STORAGE_MODE === 'local';

// ─── Security Middleware ───────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
}));

// ─── Rate Limiting ────────────────────────────────────────
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use(globalLimiter);

// ─── Request Logging ──────────────────────────────────────
app.use(morgan('dev'));

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── i18n ─────────────────────────────────────────────────
app.use(i18nMiddleware.handle(i18next));

// ─── Local File Storage (replaces S3 in dev) ─────────────
if (IS_LOCAL) {
    const uploadsDir = path.join(process.cwd(), process.env.LOCAL_UPLOADS_DIR || 'uploads');
    ['', 'products', 'avatars'].forEach((sub) => {
        const dir = path.join(uploadsDir, sub);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Serve uploaded files as static assets
    app.use('/uploads', express.static(uploadsDir, { maxAge: '1h' }));
    logger.info(`📁 Serving local uploads from ${uploadsDir}`);

    // Unified file upload endpoint (used instead of S3 presigned PUT)
    const multer = require('multer');
    const { v4: uuidv4 } = require('uuid');

    const localStorage = multer.diskStorage({
        destination: (req, _file, cb) => {
            const key = decodeURIComponent(req.query.key || '');
            const dir = key ? path.join(uploadsDir, path.dirname(key)) : uploadsDir;
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, _file, cb) => {
            const key = decodeURIComponent(req.query.key || '');
            cb(null, key ? path.basename(key) : `${uuidv4()}.webp`);
        },
    });

    const uploadMiddleware = multer({
        storage: localStorage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            cb(null, allowed.includes(file.mimetype));
        },
    });

    // POST or PUT /api/upload?key=products/uuid/img.webp
    const handleUpload = (req, res) => {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file received.' });
        const key = decodeURIComponent(req.query.key || path.basename(req.file.path));
        const url = `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/uploads/${key}`;
        res.json({ success: true, data: { url, s3_key: key } });
    };

    app.post('/api/upload', uploadMiddleware.single('file'), handleUpload);
    app.put('/api/upload', uploadMiddleware.single('file'), handleUpload);
}

// ─── Health Check ─────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
    status: 'OK',
    service: 'farmway-api',
    version: '1.0.0',
    storage: process.env.STORAGE_MODE || 'local',
    ts: new Date().toISOString(),
}));

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

module.exports = app;
