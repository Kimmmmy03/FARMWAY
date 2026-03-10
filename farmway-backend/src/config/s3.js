'use strict';
/**
 * Storage adapter — switches between local disk and AWS S3
 * based on STORAGE_MODE env variable.
 *
 * Local mode:  files saved to /uploads/<subdir>/<filename>
 *              served statically at /uploads/* by Express
 * S3 mode:     presigned URLs via aws-sdk
 */
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const MODE = process.env.STORAGE_MODE || 'local';
const LOCAL_DIR = path.join(process.cwd(), process.env.LOCAL_UPLOADS_DIR || 'uploads');
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

// Ensure uploads directory exists
if (MODE === 'local') {
    [
        LOCAL_DIR,
        path.join(LOCAL_DIR, 'products'),
        path.join(LOCAL_DIR, 'avatars'),
    ].forEach((dir) => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
}

// ─── S3 client (only loaded in s3 mode) ──────────────────
let s3;
if (MODE === 's3') {
    try {
        const AWS = require('aws-sdk');
        s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'ap-southeast-1',
        });
    } catch (e) {
        logger.warn('aws-sdk not available, falling back to local storage');
    }
}

const BUCKET = process.env.AWS_S3_BUCKET;

// ─── Public URL for a stored key ─────────────────────────
const getPublicUrl = (key) => {
    if (MODE === 'local') {
        return `${PUBLIC_BASE}/uploads/${key}`;
    }
    // S3 public URL (if bucket is public) or presigned
    return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

// ─── Presigned PUT URL ────────────────────────────────────
const getPresignedUploadUrl = async (key, contentType = 'image/webp', expiresSeconds = 300) => {
    if (MODE === 'local') {
        // Return a fake presigned URL pointing at our upload endpoint
        return `${PUBLIC_BASE}/api/upload?key=${encodeURIComponent(key)}`;
    }
    return s3.getSignedUrlPromise('putObject', {
        Bucket: BUCKET, Key: key, ContentType: contentType,
        ACL: 'private', Expires: expiresSeconds,
    });
};

// ─── Presigned GET URL ────────────────────────────────────
const getPresignedReadUrl = async (key, _expiresSeconds = 3600) => {
    // In local mode just return a public URL — no expiry needed
    return getPublicUrl(key);
};

// ─── Delete ───────────────────────────────────────────────
const deleteObject = async (key) => {
    if (MODE === 'local') {
        const filePath = path.join(LOCAL_DIR, key);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return;
    }
    return s3.deleteObject({ Bucket: BUCKET, Key: key }).promise();
};

// ─── Save a file buffer locally ───────────────────────────
const saveLocalFile = (key, buffer) => {
    const filePath = path.join(LOCAL_DIR, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return getPublicUrl(key);
};

// ─── Key builders ─────────────────────────────────────────
const productImageKey = (productId, filename) => `products/${productId}/${filename}`;
const avatarKey = (userId, filename) => `avatars/${userId}/${filename}`;

module.exports = {
    s3,
    MODE,
    LOCAL_DIR,
    getPublicUrl,
    getPresignedUploadUrl,
    getPresignedReadUrl,
    deleteObject,
    saveLocalFile,
    productImageKey,
    avatarKey,
};
