'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define(
    'Payment',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false },
        payer_id: { type: DataTypes.UUID, allowNull: false },
        amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
        currency: { type: DataTypes.CHAR(3), defaultValue: 'MYR' },
        method: { type: DataTypes.STRING(30), allowNull: false },
        status: { type: DataTypes.STRING(20), defaultValue: 'PENDING' },
        gateway_name: { type: DataTypes.STRING(100) },
        gateway_txn_id: { type: DataTypes.STRING(255), unique: true },
        gateway_response: { type: DataTypes.JSON, defaultValue: {} },
        failure_reason: { type: DataTypes.TEXT },
        paid_at: { type: DataTypes.DATE },
        refunded_at: { type: DataTypes.DATE },
        refund_amount: { type: DataTypes.DECIMAL(14, 2) },
    },
    {
        tableName: 'payments',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = Payment;
