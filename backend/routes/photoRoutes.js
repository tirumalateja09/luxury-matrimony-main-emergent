const express = require('express');
const router = express.Router();
const { uploadMixedFiles } = require('../config/cloudinary');
const { uploadPhotos } = require('../controllers/photoController');

// Accepts images, PDFs, and Word documents on the 'images' key
router.post('/upload-photos', uploadMixedFiles.array('images', 5), uploadPhotos);

module.exports = router;
