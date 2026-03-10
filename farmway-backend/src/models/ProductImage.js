'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define(
    'ProductImage',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        product_id: { type: DataTypes.UUID, allowNull: false },
        s3_key: { type: DataTypes.TEXT, allowNull: false },
        alt_text: { type: DataTypes.STRING(255) },
        sort_order: { type: DataTypes.SMALLINT, defaultValue: 0 },
        is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        tableName: 'product_images',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

module.exports = ProductImage;
