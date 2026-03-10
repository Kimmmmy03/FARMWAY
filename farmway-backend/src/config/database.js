'use strict';
require('dotenv').config();
const path = require('path');
const { Sequelize } = require('sequelize');
const logger = require('./logger');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../data/farmway.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: (msg) => logger.debug(msg),
  define: {
    underscored: true,
    timestamps: true,
  },
});

module.exports = sequelize;
