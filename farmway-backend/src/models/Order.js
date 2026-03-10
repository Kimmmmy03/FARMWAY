'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
    'Order',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        buyer_id: { type: DataTypes.UUID, allowNull: false },
        farmer_id: { type: DataTypes.UUID, allowNull: false },
        status: { type: DataTypes.STRING(20), defaultValue: 'PENDING' },
        subtotal_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
        commission_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
        delivery_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        discount_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        total_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
        farmer_payout: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
        delivery_address: { type: DataTypes.JSON, allowNull: false },
        delivery_notes: { type: DataTypes.TEXT },
        estimated_delivery: { type: DataTypes.DATEONLY },
        delivered_at: { type: DataTypes.DATE },
        tracking_number: { type: DataTypes.STRING(100) },
        buyer_notes: { type: DataTypes.TEXT },
        cancelled_reason: { type: DataTypes.TEXT },
        cancelled_by: { type: DataTypes.UUID },
        invoice_number: { type: DataTypes.STRING(50), unique: true },
    },
    {
        tableName: 'orders',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = Order;
