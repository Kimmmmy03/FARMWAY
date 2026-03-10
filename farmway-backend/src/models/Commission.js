'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Commission = sequelize.define(
    'Commission',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false, unique: true },
        farmer_id: { type: DataTypes.UUID, allowNull: false },
        gross_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
        commission_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
        commission_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
        farmer_net_payout: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
        payout_status: { type: DataTypes.STRING(30), defaultValue: 'PENDING' },  // PENDING | PAID | ON_HOLD
        payout_at: { type: DataTypes.DATE },
        notes: { type: DataTypes.TEXT },
    },
    {
        tableName: 'commissions',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

module.exports = Commission;
