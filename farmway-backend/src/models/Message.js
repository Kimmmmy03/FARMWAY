'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define(
    'Message',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        order_id: { type: DataTypes.UUID },       // nullable for pre-order inquiry chats
        sender_id: { type: DataTypes.UUID, allowNull: false },
        recipient_id: { type: DataTypes.UUID, allowNull: false },
        product_id: { type: DataTypes.UUID },
        message_type: { type: DataTypes.STRING(20), defaultValue: 'TEXT' },
        content: { type: DataTypes.TEXT },
        s3_key: { type: DataTypes.TEXT },
        is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
        read_at: { type: DataTypes.DATE },
    },
    {
        tableName: 'messages',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

module.exports = Message;
