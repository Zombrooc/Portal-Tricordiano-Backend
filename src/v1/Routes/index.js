const express = require('express');

const router = express.Router();

router.use('/users', require('./Users'));
router.use('/posts', require('./Posts'));
router.use('/properties', require('./Properties'));
router.use('/products', require('./Products'))
router.use('/checkout', require('./Checkout'));

module.exports = router;