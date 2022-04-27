const multer = require('multer');
const express = require('express');
const asyncHandler = require('express-async-handler');

const PostController = require('../Controllers/PostController');
const authMiddleware = require('../Middlewares/authMiddleware');

const uploadConfig = require('../config/upload');

const upload = multer(uploadConfig);

const routes = express.Router();

routes.post('/', authMiddleware, asyncHandler(upload.single('image')), asyncHandler(PostController.store));
routes.get('/', asyncHandler(PostController.index));
routes.get('/:id', asyncHandler(PostController.show));
routes.post('/:id/like', authMiddleware, asyncHandler(PostController.like));
routes.delete('/:id', authMiddleware, asyncHandler(PostController.delete));
routes.put('/:id', authMiddleware, asyncHandler(PostController.update));

module.exports = routes;
