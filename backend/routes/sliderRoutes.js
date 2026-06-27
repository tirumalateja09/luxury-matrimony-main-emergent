const express = require('express');
const router = express.Router();
const {
    createSlider,
    getSliders,
    getSliderById,
    updateSlider,
    deleteSlider
} = require('../controllers/sliderController');
const { adminProtect } = require('../middlewares/authMiddleware');

router.get('/', getSliders);
router.get('/:id', getSliderById);
router.post('/', adminProtect, createSlider);
router.put('/:id', adminProtect, updateSlider);
router.delete('/:id', adminProtect, deleteSlider);

module.exports = router;
