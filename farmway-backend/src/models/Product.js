'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
    'Product',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        farmer_id: { type: DataTypes.UUID, allowNull: false },
        category_id: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.JSON, allowNull: false },
        description: { type: DataTypes.JSON, defaultValue: {} },
        price_per_unit: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        negotiable: { type: DataTypes.BOOLEAN, defaultValue: true },
        min_order_quantity: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1 },
        unit: { type: DataTypes.STRING(20), defaultValue: 'KG' },
        listing_type: { type: DataTypes.STRING(10), defaultValue: 'BOTH' },
        stock_quantity: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        sku: { type: DataTypes.STRING(100), unique: true },
        state: { type: DataTypes.STRING(100) },
        district: { type: DataTypes.STRING(100) },
        latitude: { type: DataTypes.DECIMAL(10, 7) },
        longitude: { type: DataTypes.DECIMAL(10, 7) },
        harvest_date: { type: DataTypes.DATEONLY },
        expiry_date: { type: DataTypes.DATEONLY },
        organic_certified: { type: DataTypes.BOOLEAN, defaultValue: false },
        pesticide_free: { type: DataTypes.BOOLEAN, defaultValue: false },
        halal_certified: { type: DataTypes.BOOLEAN, defaultValue: false },
        status: { type: DataTypes.STRING(20), defaultValue: 'ACTIVE' },
        view_count: { type: DataTypes.INTEGER, defaultValue: 0 },
        sold_count: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        rating_average: { type: DataTypes.DECIMAL(3, 2) },
        rating_count: { type: DataTypes.INTEGER, defaultValue: 0 },
        tags: { type: DataTypes.TEXT, defaultValue: '[]', get() { const v = this.getDataValue('tags'); return v ? (typeof v === 'string' ? JSON.parse(v) : v) : []; }, set(val) { this.setDataValue('tags', JSON.stringify(val || [])); } },
        deleted_at: { type: DataTypes.DATE },
    },
    {
        tableName: 'products',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: false, // We manage soft-delete manually via deleted_at
        defaultScope: {
            where: { deleted_at: null },
        },
    }
);

module.exports = Product;
