'use strict';
// i18n resources for server-side messages (validation errors, notifications)
// Frontend uses its own i18n bundle
const i18next = require('i18next');
const middleware = require('i18next-http-middleware');

i18next.use(middleware.LanguageDetector).init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ms', 'zh', 'ta'],
    resources: {
        en: {
            translation: {
                auth: {
                    invalid_credentials: 'Invalid email or password.',
                    email_taken: 'An account with this email already exists.',
                    unauthorized: 'You are not authorized to perform this action.',
                    token_expired: 'Your session has expired. Please log in again.',
                },
                products: {
                    not_found: 'Product not found.',
                    not_owner: 'You can only modify your own listings.',
                    out_of_stock: 'This product is out of stock.',
                },
                orders: {
                    not_found: 'Order not found.',
                    invalid_status: 'Invalid order status transition.',
                    insufficient_stock: 'Insufficient stock for one or more items.',
                },
                general: {
                    success: 'Success.',
                    server_error: 'An internal server error occurred.',
                    validation_error: 'Validation failed. Please check your inputs.',
                    not_found: 'Resource not found.',
                },
            },
        },
        ms: {
            translation: {
                auth: {
                    invalid_credentials: 'E-mel atau kata laluan tidak sah.',
                    email_taken: 'Akaun dengan e-mel ini sudah wujud.',
                    unauthorized: 'Anda tidak dibenarkan untuk melakukan tindakan ini.',
                    token_expired: 'Sesi anda telah tamat. Sila log masuk semula.',
                },
                products: {
                    not_found: 'Produk tidak dijumpai.',
                    not_owner: 'Anda hanya boleh mengubah senarai anda sendiri.',
                    out_of_stock: 'Produk ini telah kehabisan stok.',
                },
                orders: {
                    not_found: 'Pesanan tidak dijumpai.',
                    invalid_status: 'Peralihan status pesanan tidak sah.',
                    insufficient_stock: 'Stok tidak mencukupi untuk satu atau lebih item.',
                },
                general: {
                    success: 'Berjaya.',
                    server_error: 'Ralat pelayan dalaman berlaku.',
                    validation_error: 'Pengesahan gagal. Sila semak input anda.',
                    not_found: 'Sumber tidak dijumpai.',
                },
            },
        },
        zh: {
            translation: {
                auth: {
                    invalid_credentials: '电子邮件或密码无效。',
                    email_taken: '此电子邮件已被注册。',
                    unauthorized: '您无权执行此操作。',
                    token_expired: '您的会话已过期，请重新登录。',
                },
                products: {
                    not_found: '未找到产品。',
                    not_owner: '您只能修改自己的商品。',
                    out_of_stock: '该产品已售罄。',
                },
                orders: { not_found: '未找到订单。', invalid_status: '订单状态转换无效。', insufficient_stock: '一个或多个商品库存不足。' },
                general: { success: '成功。', server_error: '发生内部服务器错误。', validation_error: '验证失败，请检查您的输入。', not_found: '资源未找到。' },
            },
        },
        ta: {
            translation: {
                auth: {
                    invalid_credentials: 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது.',
                    email_taken: 'இந்த மின்னஞ்சலுடன் ஒரு கணக்கு ஏற்கனவே உள்ளது.',
                    unauthorized: 'இந்த செயலை செய்ய உங்களுக்கு அனுமதி இல்லை.',
                    token_expired: 'உங்கள் அமர்வு காலாவதியானது. மீண்டும் உள்நுழையவும்.',
                },
                products: { not_found: 'தயாரிப்பு கிடைக்கவில்லை.', not_owner: 'உங்கள் சொந்த பட்டியல்களை மட்டுமே மாற்றலாம்.', out_of_stock: 'இந்த தயாரிப்பு இருப்பு இல்லை.' },
                orders: { not_found: 'ஆர்டர் கிடைக்கவில்லை.', invalid_status: 'தவறான நிலை மாற்றம்.', insufficient_stock: 'போதுமான இருப்பு இல்லை.' },
                general: { success: 'வெற்றி.', server_error: 'உள் சர்வர் பிழை ஏற்பட்டது.', validation_error: 'சரிபார்ப்பு தோல்வியடைந்தது.', not_found: 'வள கிடைக்கவில்லை.' },
            },
        },
    },
    detection: {
        order: ['header', 'querystring'],
        lookupHeader: 'accept-language',
        lookupQuerystring: 'lang',
    },
});

module.exports = { i18next, middleware };
