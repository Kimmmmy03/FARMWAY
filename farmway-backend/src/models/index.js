'use strict';
// Central model registry — define all associations here
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Commission = require('./Commission');
const Message = require('./Message');

// ─── User Associations ────────────────────────────────────
User.hasMany(Product, { foreignKey: 'farmer_id', as: 'listings' });
User.hasMany(Order, { foreignKey: 'buyer_id', as: 'purchases' });
User.hasMany(Order, { foreignKey: 'farmer_id', as: 'sales' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'recipient_id', as: 'receivedMessages' });
User.hasMany(Commission, { foreignKey: 'farmer_id', as: 'commissions' });

// ─── Category Associations ────────────────────────────────
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'subCategories' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

// ─── Product Associations ─────────────────────────────────
Product.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

// ─── Order Associations ───────────────────────────────────
Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
Order.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
Order.hasOne(Commission, { foreignKey: 'order_id', as: 'commission' });
Order.hasMany(Message, { foreignKey: 'order_id', as: 'messages' });

// ─── OrderItem Associations ───────────────────────────────
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ─── Payment Associations ─────────────────────────────────
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Payment.belongsTo(User, { foreignKey: 'payer_id', as: 'payer' });

// ─── Commission Associations ──────────────────────────────
Commission.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Commission.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });

// ─── Message Associations ─────────────────────────────────
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });
Message.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Message.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = { User, Category, Product, ProductImage, Order, OrderItem, Payment, Commission, Message };
