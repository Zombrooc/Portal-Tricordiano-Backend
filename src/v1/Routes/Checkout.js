const express = require('express');
const bodyParser = require('body-parser');

const CheckoutController = require('../Controllers/CheckoutController');
const authMiddleware = require('../Middlewares/authMiddleware');

const routes = express.Router();

routes.post('/clientSecret', authMiddleware, CheckoutController.clientSecret);
routes.post('/createCheckoutSession', authMiddleware, CheckoutController.createCheckoutSession);
routes.post('/paymentConfirmed', bodyParser.raw(), CheckoutController.webhook);
// routes.get('/:id', CheckoutController.show);
// routes.post('/:id/like', authMiddleware, CheckoutController.like);
// routes.delete('/:id', authMiddleware, CheckoutController.delete);
// routes.put('/:id', authMiddleware, CheckoutController.update);

module.exports = routes;
