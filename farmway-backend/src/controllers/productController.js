'use strict';
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { Product, ProductImage, User, Category } = require('../models');
const { getPresignedUploadUrl, getPresignedReadUrl, productImageKey } = require('../config/s3');
const { createError } = require('../middleware/errorHandler');

// ──────────────────────────────────────────────────────────
// GET /api/products  — Browse & search with filters
// Query: ?category=vegetables&state=Selangor&min_price=1&max_price=50
//        &listing_type=B2C&search=chili&page=1&limit=20&sort=price_asc
// ──────────────────────────────────────────────────────────
exports.listProducts = async (req, res) => {
    const {
        category, state, district, min_price, max_price,
        listing_type, search, organic, halal, page = 1, limit = 20, sort = 'created_at_desc',
    } = req.query;

    const where = { status: 'ACTIVE' };
    const include = [
        { model: User, as: 'farmer', attributes: ['id', 'full_name', 'is_verified_seller', 'avatar_s3_key'] },
        { model: ProductImage, as: 'images', where: { is_primary: true }, required: false, limit: 1 },
    ];

    if (state) where.state = state;
    if (district) where.district = district;
    if (listing_type) where.listing_type = { [Op.in]: [listing_type, 'BOTH'] };
    if (organic === 'true') where.organic_certified = true;
    if (halal === 'true') where.halal_certified = true;

    if (min_price || max_price) {
        where.price_per_unit = {};
        if (min_price) where.price_per_unit[Op.gte] = parseFloat(min_price);
        if (max_price) where.price_per_unit[Op.lte] = parseFloat(max_price);
    }

    if (category) {
        const cat = await Category.findOne({ where: { slug: category } });
        if (cat) where.category_id = cat.id;
    }

    if (search) {
        const searchLower = search.toLowerCase().replace(/'/g, "''");
        where[Op.or] = [
            require('sequelize').literal(
                `LOWER(\`Product\`.\`tags\`) LIKE '%${searchLower}%'`
            ),
            require('sequelize').literal(
                `LOWER(\`Product\`.\`name\`) LIKE '%${searchLower}%'`
            ),
        ];
    }

    const sortMap = {
        price_asc: [['price_per_unit', 'ASC']],
        price_desc: [['price_per_unit', 'DESC']],
        newest: [['created_at', 'DESC']],
        popular: [['sold_count', 'DESC']],
        rating: [['rating_average', 'DESC']],
        created_at_desc: [['created_at', 'DESC']],
    };
    const order = sortMap[sort] || [['created_at', 'DESC']];

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * pageSize;

    const { count, rows } = await Product.findAndCountAll({ where, include, order, limit: pageSize, offset });

    // Enrich with presigned image URLs
    const products = await Promise.all(
        rows.map(async (p) => {
            const obj = p.toJSON();
            if (obj.images?.[0]?.s3_key) {
                obj.images[0].url = await getPresignedReadUrl(obj.images[0].s3_key);
            }
            return obj;
        })
    );

    res.json({
        success: true,
        data: products,
        pagination: { total: count, page: pageNum, limit: pageSize, totalPages: Math.ceil(count / pageSize) },
    });
};

// ──────────────────────────────────────────────────────────
// GET /api/products/:id
// ──────────────────────────────────────────────────────────
exports.getProduct = async (req, res) => {
    const product = await Product.findByPk(req.params.id, {
        include: [
            { model: User, as: 'farmer', attributes: ['id', 'full_name', 'is_verified_seller', 'avatar_s3_key', 'phone'] },
            { model: Category, as: 'category', attributes: ['id', 'slug', 'name'] },
            { model: ProductImage, as: 'images', order: [['sort_order', 'ASC']] },
        ],
    });

    if (!product) throw createError(404, req.t('products.not_found'));

    // Increment view count (fire-and-forget)
    product.increment('view_count').catch(() => { });

    // Enrich image URLs
    const obj = product.toJSON();
    obj.images = await Promise.all(
        (obj.images || []).map(async (img) => ({
            ...img,
            url: await getPresignedReadUrl(img.s3_key),
        }))
    );

    res.json({ success: true, data: obj });
};

// ──────────────────────────────────────────────────────────
// POST /api/products  (FARMER only)
// ──────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
    const {
        name, description, category_id, price_per_unit, negotiable, min_order_quantity,
        unit, listing_type, stock_quantity, sku, state, district, latitude, longitude,
        harvest_date, expiry_date, organic_certified, pesticide_free, halal_certified, tags,
    } = req.body;

    const product = await Product.create({
        farmer_id: req.user.id,
        name, description, category_id, price_per_unit, negotiable, min_order_quantity,
        unit, listing_type, stock_quantity, sku, state, district, latitude, longitude,
        harvest_date, expiry_date, organic_certified, pesticide_free, halal_certified, tags,
    });

    res.status(201).json({ success: true, data: product });
};

// ──────────────────────────────────────────────────────────
// PUT /api/products/:id  (owner FARMER only)
// ──────────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw createError(404, req.t('products.not_found'));
    if (product.farmer_id !== req.user.id && req.user.role !== 'ADMIN') {
        throw createError(403, req.t('products.not_owner'));
    }

    const allowed = [
        'name', 'description', 'category_id', 'price_per_unit', 'negotiable',
        'min_order_quantity', 'unit', 'listing_type', 'stock_quantity', 'state',
        'district', 'latitude', 'longitude', 'harvest_date', 'expiry_date',
        'organic_certified', 'pesticide_free', 'halal_certified', 'tags', 'status',
    ];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    await product.update(updates);

    res.json({ success: true, data: product });
};

// ──────────────────────────────────────────────────────────
// DELETE /api/products/:id  (soft delete)
// ──────────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw createError(404, req.t('products.not_found'));
    if (product.farmer_id !== req.user.id && req.user.role !== 'ADMIN') {
        throw createError(403, req.t('products.not_owner'));
    }
    await product.update({ status: 'DELETED', deleted_at: new Date() });
    res.json({ success: true, message: req.t('general.success') });
};

// ──────────────────────────────────────────────────────────
// POST /api/products/:id/images/presign  — get S3 presigned URL for image upload
// ──────────────────────────────────────────────────────────
exports.getImageUploadUrl = async (req, res) => {
    const { filename, content_type = 'image/webp' } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) throw createError(404, req.t('products.not_found'));
    if (product.farmer_id !== req.user.id) throw createError(403, req.t('products.not_owner'));

    const ext = filename?.split('.').pop() || 'webp';
    const s3_key = productImageKey(product.id, `${uuidv4()}.${ext}`);
    const uploadUrl = await getPresignedUploadUrl(s3_key, content_type);

    res.json({ success: true, data: { upload_url: uploadUrl, s3_key } });
};

// ──────────────────────────────────────────────────────────
// POST /api/products/:id/images  — register uploaded image in DB
// ──────────────────────────────────────────────────────────
exports.addImage = async (req, res) => {
    const { s3_key, alt_text, is_primary = false, sort_order = 0 } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) throw createError(404, req.t('products.not_found'));
    if (product.farmer_id !== req.user.id) throw createError(403, req.t('products.not_owner'));

    if (is_primary) {
        // Remove primary flag from other images
        await ProductImage.update({ is_primary: false }, { where: { product_id: product.id } });
    }

    const image = await ProductImage.create({ product_id: product.id, s3_key, alt_text, is_primary, sort_order });
    image.url = await getPresignedReadUrl(s3_key);
    res.status(201).json({ success: true, data: image });
};

// ──────────────────────────────────────────────────────────
// GET /api/farmers/:farmerId/products  — public farmer storefront
// ──────────────────────────────────────────────────────────
exports.getFarmerProducts = async (req, res) => {
    const { farmerId } = req.params;
    const products = await Product.findAll({
        where: { farmer_id: farmerId, status: 'ACTIVE' },
        include: [{ model: ProductImage, as: 'images', where: { is_primary: true }, required: false, limit: 1 }],
        order: [['created_at', 'DESC']],
        limit: 50,
    });
    res.json({ success: true, data: products });
};
