const multer = require('multer');
const express = require('express');
const asyncHandler = require('express-async-handler')

const ProductController = require('../Controllers/ProductController');
const authMiddleware = require('../Middlewares/authMiddleware');

const uploadConfig = require('../config/upload');

const upload = multer(uploadConfig);

const routes = express.Router();

routes.post(
  '/',
  authMiddleware,
  asyncHandler(upload.single('image')),
  asyncHandler(ProductController.store),
);
routes.get('/', asyncHandler(ProductController.index));
routes.get('/:productID', asyncHandler(ProductController.show));
routes.delete('/:productId', authMiddleware, asyncHandler(ProductController.delete));

module.exports = routes;
