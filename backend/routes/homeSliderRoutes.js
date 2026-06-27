const express = require('express');
const router = express.Router();
const {
    createHomeSlider,
    getHomeSliders,
    getHomeSliderById,
    updateHomeSlider,
    deleteHomeSlider
} = require('../controllers/homeSliderController');
const { adminProtect } = require('../middlewares/authMiddleware');

router.get('/', getHomeSliders);
router.get('/:id', getHomeSliderById);
router.post('/', adminProtect, createHomeSlider);
router.put('/:id', adminProtect, updateHomeSlider);
router.delete('/:id', adminProtect, deleteHomeSlider);

module.exports = router;

