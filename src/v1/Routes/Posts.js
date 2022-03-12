const multer = require('multer');
const express = require('express');

const PostController = require('../Controllers/PostController');
const authMiddleware = require('../Middlewares/authMiddleware');

const uploadConfig = require('../config/upload');

const upload = multer(uploadConfig);

const routes = express.Router();

routes.post('/', authMiddleware, upload.single('image'), PostController.store);
routes.get('/', PostController.index);
routes.get('/:id', PostController.show);
routes.post('/:id/like', authMiddleware, PostController.like);
routes.delete('/:id', authMiddleware, PostController.delete);
routes.put('/:id', authMiddleware, PostController.update);

module.exports = routes;
