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

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Configuración de Seguridad HTTP con Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// Prevenir ataques de inyección NoSQL en MongoDB
app.use(mongoSanitize());

// Limitador de peticiones general para evitar abuso (DDoS básico)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Máximo 300 peticiones por ventana
  message: 'Demasiadas peticiones desde esta IP. Por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Limitador estricto para rutas críticas de autenticación para mitigar fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Máximo 30 intentos en 15 minutos
  message: 'Demasiados intentos de acceso. Por favor intenta de nuevo en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/login', authLimiter);
app.use('/registro', authLimiter);

// Middlewares estándar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views', 'public')));

// Configuración de Sesiones Seguras
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true, // Evita acceso JavaScript a cookies de sesión (XSS)
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: 'lax' // Previene ataques CSRF
  }
}));

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

// Variables locales de sesión disponibles en todas las vistas EJS
app.use((req, res, next) => {
  res.locals.user = req.user || req.session.user || null;
  res.locals.error = req.session.error || null;
  res.locals.success = req.session.success || null;
  
  // Limpiar mensajes flash para que no reaparezcan en futuras peticiones
  delete req.session.error;
  delete req.session.success;
  
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
