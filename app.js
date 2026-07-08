const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Inicializar conexiones a bases de datos
require('./config/db');
// Cargar configuración de Passport
require('./config/passport');

const app = express();

// Rutas consolidadas (MVC)
const usuarioRoutes = require('./routes/usuario.routes');
const tourRoutes = require('./routes/tour.routes');
const vendedorRoutes = require('./routes/vendedor.routes');
const adminRoutes = require('./routes/admin.routes');
const chatRoutes = require('./routes/chat.routes');

// Configuración del motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares estándar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views', 'public')));

// Configuración de Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

// Variables locales de sesión disponibles en todas las vistas EJS
app.use((req, res, next) => {
  res.locals.user = req.user || req.session.user || null;
  res.locals.error = req.session.error || null;
  res.locals.success = req.session.success || null;
  next();
});

// Registrar Rutas por Módulo
app.use(usuarioRoutes);
app.use(tourRoutes);
app.use(vendedorRoutes);
app.use(adminRoutes);
app.use(chatRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  
  // Migración para asignar una fecha de actividad a tours antiguos sin ella
  try {
    const Tour = require('./models/Tour');
    const result = await Tour.updateMany(
      {
        $or: [
          { activity_date: { $exists: false } },
          { activity_date: null },
          { activity_date: "" }
        ]
      },
      { activity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ Migración: se actualizaron ${result.modifiedCount} publicaciones antiguas con fecha de actividad por defecto.`);
    }
  } catch (error) {
    console.error('❌ Error al ejecutar migración de activity_date:', error.message);
  }
});

module.exports = app;
