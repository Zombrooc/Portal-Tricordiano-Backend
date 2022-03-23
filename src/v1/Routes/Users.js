const express = require('express');
const multer = require('multer');
const asyncHandler = require('express-async-handler')

const UserController = require('../Controllers/UserController');
const AuthMiddleware = require('../Middlewares/authMiddleware');

const routes = express.Router();

const upload = require('../config/upload');

routes.post('/', asyncHandler(UserController.store));
routes.post('/authenticate',asyncHandler( UserController.authenticate));
routes.get('/', AuthMiddleware, asyncHandler(UserController.show));
routes.put('/', AuthMiddleware, asyncHandler(UserController.update));
routes.post('/forgot_password', asyncHandler(UserController.forgotPass));
routes.post('/reset_pass', asyncHandler(UserController.resetPass));
routes.post('/validate_email', asyncHandler(UserController.validateEmail));

module.exports = routes;
