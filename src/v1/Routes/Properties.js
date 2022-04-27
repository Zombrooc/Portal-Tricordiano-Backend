const multer = require('multer');
const express = require('express');

const PropertyController = require('../Controllers/PropertyController');
const authMiddleware = require('../Middlewares/authMiddleware');

const uploadConfig = require('../config/upload');

const upload = multer(uploadConfig);

const routes = express.Router();

routes.post('/', authMiddleware, upload.array('image'), PropertyController.store);
// routes.get('/', PropertyController.index);
// routes.get('/:id', PropertyController.show);
// routes.post('/:id/like', authMiddleware, PropertyController.like);
// routes.delete('/:id', authMiddleware, PropertyController.delete);
// routes.put('/:id', authMiddleware, PropertyController.update);

module.exports = routes;
