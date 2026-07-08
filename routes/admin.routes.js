const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireRole } = require('../middlewares/auth');

router.get('/admin/dashboard', requireRole(['admin']), adminController.getDashboard);
router.post('/admin/vendedor/auditar', requireRole(['admin']), adminController.auditarVendedor);
router.post('/admin/tour/auditar', requireRole(['admin']), adminController.auditarTour);

module.exports = router;
