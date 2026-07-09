/**
 * Script de inicialización y creación de la Base de Datos MongoDB
 * para el Foro Turístico.
 * 
 * Este script se conecta a la base de datos MongoDB usando la URI
 * configurada en el archivo .env (o la URI por defecto), crea las
 * colecciones requeridas e inserta datos iniciales de prueba (seed).
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Importar los modelos de MongoDB
const Tour = require('./models/Tour');
const Comment = require('./models/Comment');
const Message = require('./models/Message');

const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foro_turistico').trim();

async function initializeMongoDB() {
  try {
    console.log(`🔌 Conectando a MongoDB en: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión establecida con éxito.');

    // 1. Limpiar colecciones previas (opcional, para evitar duplicados en pruebas)
    console.log('🧹 Limpiando datos de prueba anteriores...');
    await Tour.deleteMany({});
    await Comment.deleteMany({});
    await Message.deleteMany({});
    console.log('✅ Colecciones limpiadas.');

    // 2. Crear datos semilla para Tours
    console.log('🌱 Insertando tours iniciales de prueba...');
    const seedTours = [
      {
        seller_id: 1, // Simula un administrador o vendedor con ID 1 en MySQL
        seller_name: 'Guías de Aventura S.A.',
        title: 'Exploración de la Selva Amazónica',
        description: 'Disfruta de una caminata guiada de 3 días por el corazón del Amazonas, avistamiento de fauna exótica y campamento nocturno seguro.',
        continent: 'América del Sur',
        country: 'Brasil',
        city: 'Manaos',
        activity: 'Senderismo y Aventura',
        duration: '3 días',
        difficulty: 'Difícil',
        price: 250,
        spots_total: 15,
        spots_available: 12,
        images: [
          'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552751753-078450575982?auto=format&fit=crop&w=800&q=80'
        ],
        contact_info: 'info@aventuraamazonas.com | +55 92 9999-9999',
        start_address: 'Puerto de Manaos, Muelle 4, Manaos, Brasil',
        coordinates: '-3.1362,-60.0241',
        activity_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // En 15 días
        status: 'approved',
        rejection_reason: ''
      },
      {
        seller_id: 2,
        seller_name: 'Europa Tours',
        title: 'Recorrido Histórico por el Coliseo y Foro Romano',
        description: 'Evita las filas con este acceso prioritario al Coliseo, Foro Romano y Monte Palatino junto a un historiador certificado.',
        continent: 'Europa',
        country: 'Italia',
        city: 'Roma',
        activity: 'Cultura e Historia',
        duration: '4 horas',
        difficulty: 'Fácil',
        price: 49,
        spots_total: 30,
        spots_available: 30,
        images: [
          'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
        ],
        contact_info: 'contacto@europatours.com | +39 06 123456',
        start_address: 'Piazza del Colosseo, Entrada Principal, Roma, Italia',
        coordinates: '41.8902,12.4922',
        activity_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // En 20 días
        status: 'approved',
        rejection_reason: ''
      },
      {
        seller_id: 2,
        seller_name: 'Europa Tours',
        title: 'Tour en Bote por los Canales de Venecia',
        description: 'Paseo romántico en góndola por los canales más emblemáticos de Venecia acompañado de un músico tradicional.',
        continent: 'Europa',
        country: 'Italia',
        city: 'Venecia',
        activity: 'Paseos y Navegación',
        duration: '1 hora',
        difficulty: 'Fácil',
        price: 80,
        spots_total: 6,
        spots_available: 6,
        images: [
          'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80'
        ],
        contact_info: 'contacto@europatours.com | +39 06 123456',
        start_address: 'Muelle de San Marcos, Venecia, Italia',
        coordinates: '45.4343,12.3388',
        activity_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // En 25 días
        status: 'pending', // Tour en revisión
        rejection_reason: ''
      }
    ];

    const insertedTours = await Tour.insertMany(seedTours);
    console.log(`✅ ${insertedTours.length} Tours insertados correctamente.`);

    // 3. Crear datos semilla para Comentarios (asociados al primer tour de Brasil)
    console.log('🌱 Insertando comentarios iniciales...');
    const seedComments = [
      {
        tour_id: insertedTours[0]._id,
        user_id: 3, // Simula usuario de MySQL
        user_name: 'Juan Pérez Viajero',
        rating: 5,
        comment: '¡Una experiencia inolvidable! Los guías sabían muchísimo sobre la flora y fauna local y nos sentimos súper seguros todo el tiempo.',
        photos: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
        ],
        created_at: new Date()
      },
      {
        tour_id: insertedTours[0]._id,
        user_id: 4,
        user_name: 'María Gómez López',
        rating: 4,
        comment: 'Hermoso paisaje. La caminata es un poco pesada y desafiante físicamente, pero vale la pena por completo.',
        photos: [],
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    await Comment.insertMany(seedComments);
    console.log('✅ Comentarios insertados correctamente.');

    // 4. Crear mensajes de prueba para el foro interactivo
    console.log('🌱 Insertando mensajes iniciales del foro...');
    const seedMessages = [
      {
        user_id: 3,
        user_name: 'Juan Pérez Viajero',
        user_role: 'user',
        message: 'Hola a todos, ¿alguien ha realizado el tour por el Amazonas recientemente? ¿Qué repelente recomiendan?',
        reply_to: null,
        reply_to_name: null,
        mentions: [],
        is_edited: false,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        user_id: 1,
        user_name: 'Guías de Aventura S.A.',
        user_role: 'seller',
        message: '¡Hola Juan! Recomendamos repelentes con alta concentración de DEET o Icaridina. Nosotros también proveemos algunos al inicio.',
        reply_to: null, // Se puede linkear por ID si se desea simular hilo
        reply_to_name: 'Juan Pérez Viajero',
        mentions: ['Juan Pérez Viajero'],
        is_edited: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    await Message.insertMany(seedMessages);
    console.log('✅ Mensajes del foro insertados correctamente.');

    console.log('\n⭐ ¡Base de datos de MongoDB creada e inicializada con éxito! ⭐\n');
  } catch (error) {
    console.error('❌ Error al inicializar MongoDB:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB.');
    process.exit(0);
  }
}

initializeMongoDB();
