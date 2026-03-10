'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
    'User',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
        phone: { type: DataTypes.STRING(20), unique: true },
        password_hash: { type: DataTypes.TEXT, allowNull: false },
        role: { type: DataTypes.STRING(30), defaultValue: 'BUYER', allowNull: false },
        status: { type: DataTypes.STRING(30), defaultValue: 'ACTIVE' },
        is_verified_seller: { type: DataTypes.BOOLEAN, defaultValue: false },
        full_name: { type: DataTypes.STRING(255), allowNull: false },
        preferred_lang: { type: DataTypes.STRING(10), defaultValue: 'en' },
        avatar_s3_key: { type: DataTypes.TEXT },
        email_verified_at: { type: DataTypes.DATE },
        phone_verified_at: { type: DataTypes.DATE },
        last_login_at: { type: DataTypes.DATE },
    },
    {
        tableName: 'users',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        defaultScope: { attributes: { exclude: ['password_hash'] } },
        scopes: { withPassword: { attributes: {} } },
    }
);

module.exports = User;
