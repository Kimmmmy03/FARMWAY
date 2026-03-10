'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define(
    'OrderItem',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false },
        product_id: { type: DataTypes.UUID, allowNull: false },
        product_name: { type: DataTypes.JSON, allowNull: false },   // snapshot
        product_image_url: { type: DataTypes.TEXT },
        unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        unit: { type: DataTypes.STRING(20), allowNull: false },
        line_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    },
    {
        tableName: 'order_items',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

module.exports = OrderItem;
