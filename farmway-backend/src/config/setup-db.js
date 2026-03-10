'use strict';
/**
 * Database setup script for local development (SQLite).
 * Run:  node src/config/setup-db.js
 *
 * This script:
 *  1. Ensures the data directory exists
 *  2. Syncs Sequelize models (creates tables)
 *  3. Seeds demo users and categories
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const logger = require('./logger');

async function run() {
    // Ensure data directory exists
    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        logger.info('📁 Created data directory.');
    }

    // Import sequelize and models (triggers associations)
    const sequelize = require('./database');
    const { User, Category } = require('../models');

    // Sync all models
    logger.info('🔄 Syncing database schema...');
    await sequelize.sync();
    logger.info('✅ Database schema synced.');

    // Seed categories
    const catCount = await Category.count();
    if (catCount === 0) {
        await Category.bulkCreate([
            { slug: 'vegetables', name: { en: 'Vegetables', ms: 'Sayur-sayuran', zh: '蔬菜', ta: 'காய்கறிகள்' }, sort_order: 1 },
            { slug: 'fruits', name: { en: 'Fruits', ms: 'Buah-buahan', zh: '水果', ta: 'பழங்கள்' }, sort_order: 2 },
            { slug: 'livestock', name: { en: 'Livestock', ms: 'Ternakan', zh: '牲畜', ta: 'கால்நடை' }, sort_order: 3 },
            { slug: 'aquaculture', name: { en: 'Aquaculture', ms: 'Akuakultur', zh: '水产', ta: 'மீன்வளர்ப்பு' }, sort_order: 4 },
            { slug: 'grains', name: { en: 'Grains', ms: 'Bijirin', zh: '谷物', ta: 'தானியங்கள்' }, sort_order: 5 },
            { slug: 'herbs', name: { en: 'Herbs', ms: 'Herba', zh: '草药', ta: 'மூலிகைகள்' }, sort_order: 6 },
            { slug: 'farm_tools', name: { en: 'Farm Tools', ms: 'Peralatan', zh: '农具', ta: 'கருவிகள்' }, sort_order: 7 },
            { slug: 'services', name: { en: 'Services', ms: 'Perkhidmatan', zh: '服务', ta: 'சேவைகள்' }, sort_order: 8 },
        ]);
        logger.info('✅ Seeded categories.');
    }

    // Seed admin user
    const admin = await User.unscoped().findOne({ where: { role: 'ADMIN' } });
    if (!admin) {
        const hash = await bcrypt.hash('admin1234', 12);
        await User.create({ email: 'admin@farmway.my', password_hash: hash, full_name: 'Farmway Admin', role: 'ADMIN', status: 'ACTIVE' });
        logger.info('✅ Seeded admin user: admin@farmway.my / admin1234');
    }

    // Seed demo farmer
    const farmer = await User.unscoped().findOne({ where: { email: 'farmer@farmway.my' } });
    if (!farmer) {
        const hash = await bcrypt.hash('farmer123', 12);
        await User.create({ email: 'farmer@farmway.my', password_hash: hash, full_name: 'Ahmad @ Ladang Segar', role: 'FARMER', status: 'ACTIVE', is_verified_seller: true, phone: '0123456789' });
        logger.info('✅ Seeded demo farmer: farmer@farmway.my / farmer123');
    }

    // Seed demo buyer
    const buyer = await User.unscoped().findOne({ where: { email: 'buyer@farmway.my' } });
    if (!buyer) {
        const hash = await bcrypt.hash('buyer123', 12);
        await User.create({ email: 'buyer@farmway.my', password_hash: hash, full_name: 'Siti Buyer', role: 'BUYER', status: 'ACTIVE', phone: '0198765432' });
        logger.info('✅ Seeded demo buyer: buyer@farmway.my / buyer123');
    }

    logger.info('\n🌾 Farmway local database is ready!\n');
    logger.info('   Admin:  admin@farmway.my  / admin1234');
    logger.info('   Farmer: farmer@farmway.my / farmer123');
    logger.info('   Buyer:  buyer@farmway.my  / buyer123');
    logger.info('\n   Run:  npm run dev   to start the API server\n');
}

run().catch((err) => {
    logger.error('❌ Setup failed:', err.message);
    process.exit(1);
});
