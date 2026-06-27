const express = require('express');
const router = express.Router();
const {
    listBlogs, getBlog, createBlog, updateBlog, deleteBlog,
    listFAQs, createFAQ, updateFAQ, deleteFAQ,
    getContentPage, upsertContentPage,
} = require('../controllers/contentController');
const { adminProtect, requireSuperAdmin } = require('../middlewares/authMiddleware');

// Public
router.get('/blogs', listBlogs);
router.get('/blogs/:slug', getBlog);
router.get('/faqs', listFAQs);
router.get('/pages/:pageKey', getContentPage);

// Admin
router.post('/blogs', adminProtect, createBlog);
router.put('/blogs/:id', adminProtect, updateBlog);
router.delete('/blogs/:id', adminProtect, requireSuperAdmin, deleteBlog);
router.post('/faqs', adminProtect, createFAQ);
router.put('/faqs/:id', adminProtect, updateFAQ);
router.delete('/faqs/:id', adminProtect, requireSuperAdmin, deleteFAQ);
router.put('/pages/:pageKey', adminProtect, requireSuperAdmin, upsertContentPage);

module.exports = router;
