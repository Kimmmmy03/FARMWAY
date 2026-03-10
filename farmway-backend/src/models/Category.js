'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
    'Category',
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        name: { type: DataTypes.JSON, allowNull: false },     // { en, ms, zh, ta }
        description: { type: DataTypes.JSON, defaultValue: {} },
        icon_url: { type: DataTypes.TEXT },
        parent_id: { type: DataTypes.INTEGER },
        sort_order: { type: DataTypes.SMALLINT, defaultValue: 0 },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
        tableName: 'categories',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

module.exports = Category;
