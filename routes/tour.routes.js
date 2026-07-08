const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const { requireLogin, requireRole } = require('../middlewares/auth');
const upload = require('../utils/uploader');

// ─── RUTAS ESTÁTICAS PRIMERO (antes de las dinámicas /:id) ────────────────────

// Foro público - listado
router.get('/', tourController.getTours);

// Gestión de tours - crear
router.post('/tour', requireRole(['seller']), upload.array('images', 5), tourController.createTour);

// Editar tour (ruta estática antes de /:id)
router.post('/tour/editar/:id', requireRole(['seller', 'admin']), upload.array('images', 5), tourController.editTour);

// Finalizar tour
router.post('/tour/finalizar/:id', requireRole(['seller', 'admin']), tourController.finalizeTour);

// Eliminar tour (ruta estática antes de /:id)
router.get('/tour/eliminar/:id', requireRole(['seller', 'admin']), tourController.deleteTour);

// Comentarios (rutas estáticas)
router.post('/comentario', requireLogin, upload.array('photos', 3), tourController.createComentario);
router.post('/comentario/editar/:id', requireLogin, upload.array('photos', 3), tourController.editComentario);
router.get('/comentario/eliminar/:id', requireLogin, tourController.deleteComentario);

// ─── RUTAS DINÁMICAS AL FINAL ─────────────────────────────────────────────────

// Detalle de tour (debe ir DESPUÉS de todas las rutas /tour/algo)
router.get('/tour/:id', tourController.getTourDetalle);

module.exports = router;
