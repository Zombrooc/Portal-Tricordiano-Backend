const multer = require('multer');
const express = require('express');

const ProductController = require('../Controllers/ProductController');
const authMiddleware = require('../Middlewares/authMiddleware');

const uploadConfig = require('../config/upload');

const upload = multer(uploadConfig);

const routes = express.Router();

routes.post(
  '/',
  authMiddleware,
  upload.single('image'),
  ProductController.store,
);
routes.get('/', ProductController.index);
routes.get('/:productID', ProductController.show);
routes.delete('/:productId', authMiddleware, ProductController.delete);

module.exports = routes;
