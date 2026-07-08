const express = require('express');
const router = express.Router();
const vendedorController = require('../controllers/vendedor.controller');
const { requireRole } = require('../middlewares/auth');

router.get('/vendedor/dashboard', requireRole(['seller']), vendedorController.getDashboard);

module.exports = router;
