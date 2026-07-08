const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { requireLogin, requireRole } = require('../middlewares/auth');

// Autenticación
router.get('/login', usuarioController.getLogin);
router.post('/register', usuarioController.postRegister);
router.post('/login', usuarioController.postLogin);
router.get('/logout', usuarioController.logout);

// Reservas
router.post('/reservar', requireRole(['user']), usuarioController.createBooking);
router.get('/mis-reservas', requireRole(['user']), usuarioController.getMisReservas);

// Quejas y Sugerencias
router.get('/quejas', requireLogin, usuarioController.getQuejas);
router.post('/quejas', requireRole(['user']), usuarioController.createQueja);
router.post('/quejas/responder/:id', requireRole(['admin', 'seller']), usuarioController.responderQueja);

module.exports = router;
