const express = require('express');
// const multer = require('multer');

const UserController = require('../Controllers/UserController');
const AuthMiddleware = require('../Middlewares/authMiddleware');

const routes = express.Router();

// const upload = require('../config/upload');

routes.post('/', UserController.store);
routes.post('/authenticate', UserController.authenticate);
routes.get('/', AuthMiddleware, UserController.show);
routes.put('/', AuthMiddleware, UserController.update);
routes.post('/forgot_password', UserController.forgotPass);
routes.post('/reset_pass', UserController.resetPass);
routes.post('/validate-email', UserController.validateEmail);

module.exports = routes;
