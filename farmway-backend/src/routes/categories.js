'use strict';
const router = require('express').Router();
const { Category } = require('../models');

// GET /api/categories
router.get('/', async (req, res) => {
    const categories = await Category.findAll({
        where: { is_active: true, parent_id: null },
        include: [{ model: Category, as: 'subCategories', where: { is_active: true }, required: false }],
        order: [['sort_order', 'ASC']],
    });
    res.json({ success: true, data: categories });
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
    const cat = await Category.findOne({ where: { slug: req.params.slug, is_active: true } });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, data: cat });
});

module.exports = router;
