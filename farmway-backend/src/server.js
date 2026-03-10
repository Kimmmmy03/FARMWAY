'use strict';
require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
const logger = require('./config/logger');

// Load models and associations
require('./models/index');

const PORT = parseInt(process.env.PORT || '3000');

const start = async () => {
    try {
        await sequelize.authenticate();
        logger.info('✅ PostgreSQL connection established.');

        // Sync associations (does NOT run migrations; use schema.sql for DDL)
        // sequelize.sync({ alter: true }) — only enable for development convenience
        await sequelize.sync({ force: false });
        logger.info('✅ Sequelize models synced.');

        app.listen(PORT, () => {
            logger.info(`🚀 Farmway API Server running on port ${PORT} [${process.env.NODE_ENV}]`);
        });
    } catch (err) {
        logger.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

// Graceful shutdown
const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    await sequelize.close();
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
