const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Inicializar conexiones a bases de datos
require('./config/db');

const app = express();

// Rutas consolidadas (MVC)
const usuarioRoutes = require('./routes/usuario.routes');
const tourRoutes = require('./routes/tour.routes');
const vendedorRoutes = require('./routes/vendedor.routes');
const adminRoutes = require('./routes/admin.routes');

// Configuración del motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares estándar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Variables locales de sesión disponibles en todas las vistas EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.error = req.session.error || null;
  res.locals.success = req.session.success || null;
  next();
});

// Registrar Rutas por Módulo
app.use(usuarioRoutes);
app.use(tourRoutes);
app.use(vendedorRoutes);
app.use(adminRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
