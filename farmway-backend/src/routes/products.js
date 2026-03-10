'use strict';
const router = require('express').Router();
const { body, param, query } = require('express-validator');
const controller = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');

// Public routes (no auth)
router.get('/', controller.listProducts);
router.get('/:id', param('id').isUUID(), validateRequest, controller.getProduct);

// Farmer storefront (public)
router.get('/farmer/:farmerId', param('farmerId').isUUID(), validateRequest, controller.getFarmerProducts);

// Authenticated farmer routes
const farmerOnly = [authenticate, authorize('FARMER', 'ADMIN')];

const productRules = [
    body('name').notEmpty().withMessage('Product name (i18n object) is required.'),
    body('category_id').isInt(),
    body('price_per_unit').isFloat({ min: 0.01 }),
    body('stock_quantity').isFloat({ min: 0 }),
    body('unit').isIn(['KG', 'GRAM', 'UNIT', 'BUNDLE', 'BOX', 'LITRE', 'DOZEN']),
];

router.post('/', ...farmerOnly, productRules, validateRequest, controller.createProduct);
router.put('/:id', ...farmerOnly, param('id').isUUID(), validateRequest, controller.updateProduct);
router.delete('/:id', ...farmerOnly, param('id').isUUID(), validateRequest, controller.deleteProduct);
router.post('/:id/images/presign', ...farmerOnly, controller.getImageUploadUrl);
router.post('/:id/images', ...farmerOnly, body('s3_key').notEmpty(), validateRequest, controller.addImage);

module.exports = router;
