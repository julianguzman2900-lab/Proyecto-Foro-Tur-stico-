# Explicación del Proyecto - Foro Turístico & Reservas

Este proyecto es una plataforma web completa de foro turístico y reserva de actividades integrada con **MySQL** y **MongoDB**, desarrollada en Node.js, Express.js y EJS. Cuenta con un diseño responsivo, moderno y premium diseñado exclusivamente en Vanilla CSS.

---

## 🛠️ Qué se implementó y Cómo funciona

### 1. División Inteligente de Bases de Datos
- **MySQL**: Almacena datos relacionales y de transacciones críticas como información de usuarios, estado de aprobación de cuentas de vendedores, registro histórico de reservas y gestión de quejas o sugerencias.
- **MongoDB**: Almacena documentos flexibles e imágenes adjuntas correspondientes a publicaciones de tours (título, continente, país, ciudad, precio, cupos, fotos) y los hilos de comentarios con calificaciones por estrellas e imágenes subidas por los viajeros.

### 2. Control de Flujo de Usuarios
- **Vendedor / Proveedor**: Inicia con estado "Pendiente" y no puede publicar hasta ser aprobado. Una vez aprobado, puede publicar tours (con títulos/descripciones validados por expresión regular para admitir únicamente caracteres válidos) y adjuntar múltiples fotos. Puede revisar el estado de auditoría y los motivos de sus rechazos, además de responder quejas de clientes.
- **Administrador**: Posee la facultad de auditar y aprobar/rechazar cuentas de vendedores y publicaciones de tours (obligatorio dar un motivo en caso de rechazo). Puede moderar, editar o eliminar cualquier publicación, comentario o queja del foro.
- **Viajero / Usuario registrado**: Puede buscar, filtrar tours de forma avanzada y reservar cupos si hay disponibilidad en tiempo real. En su perfil, cuenta con un historial de reservas con botones interactivos que redireccionan a Google Maps y Waze para guiar su llegada física. Adicionalmente, puede calificar tours, subir fotos testimoniales y enviar quejas.

### 3. Sistema de Recomendaciones Inteligentes
- Al visualizar el detalle de un tour, la plataforma busca y muestra de forma automática recomendaciones de otros tours del mismo país creados por cualquier proveedor.

---

## 📂 Estructura de Archivos (Arquitectura MVC)

```
proyecto-foro-turistico/
├── app.js                         # Punto de entrada del servidor
├── package.json                   # Dependencias del proyecto
├── init.sql                       # Script de inicialización de MySQL
├── init_mongo.js                  # Script de inicialización de MongoDB
├── .env                           # Variables de entorno
│
├── config/
│   └── db.js                      # Conexiones a MySQL y MongoDB
│
├── models/                        # Capa de Modelos (acceso a datos)
│   ├── User.js                    # Consultas MySQL para usuarios
│   ├── Booking.js                 # Consultas MySQL para reservas
│   ├── Complaint.js               # Consultas MySQL para quejas
│   ├── Tour.js                    # Schema MongoDB para tours
│   └── Comment.js                 # Schema MongoDB para comentarios
│
├── controllers/                   # Capa de Controladores (lógica de negocio)
│   ├── usuario.controller.js      # Auth + Reservas + Quejas
│   ├── tour.controller.js         # Tours (CRUD) + Comentarios
│   ├── vendedor.controller.js     # Panel del proveedor
│   └── admin.controller.js        # Panel del administrador
│
├── routes/                        # Capa de Rutas (solo enrutamiento)
│   ├── usuario.routes.js          # /login, /register, /reservar, /quejas
│   ├── tour.routes.js             # /, /tour/:id, /comentario
│   ├── vendedor.routes.js         # /vendedor/dashboard
│   └── admin.routes.js            # /admin/dashboard, /admin/*/auditar
│
├── middlewares/
│   └── auth.js                    # Verificación de sesión y roles
│
├── utils/
│   └── uploader.js                # Configuración de Multer para imágenes
│
├── public/
│   └── css/style.css              # Estilos globales del sistema
│
└── views/                         # Capa de Vistas (EJS)
    ├── partials/
    │   ├── header.ejs             # Cabecera y navegación compartida
    │   └── footer.ejs             # Pie de página compartido
    ├── index.ejs                  # Página principal del foro
    ├── tour.ejs                   # Detalle del tour + reserva + comentarios
    ├── login.ejs                  # Login / Registro
    ├── my-bookings.ejs            # Historial de reservas del viajero
    ├── seller-dashboard.ejs       # Panel del proveedor
    ├── admin-dashboard.ejs        # Panel del administrador
    └── complaints.ejs             # Quejas y sugerencias
```

### Por qué se crearon los archivos agrupados así

- **`usuario.controller.js`**: Agrupa autenticación, reservas y quejas porque todos pertenecen a acciones realizadas por el rol de usuario/viajero, evitando 3 archivos con pocas líneas de código.
- **`tour.controller.js`**: Fusiona la lógica de tours y comentarios porque los comentarios son una sub-funcionalidad directamente dependiente de los tours.
- **`vendedor.controller.js`** y **`admin.controller.js`**: Se mantienen separados porque sus responsabilidades son independientes y más extensas.

---

## 🚀 Cómo probar el funcionamiento

1. Asegúrate de tener **Node.js**, **MySQL** y **MongoDB** instalados.
2. Inicia tu servidor local de **MongoDB** y **MySQL**.
   - En Windows, si el servicio de MongoDB está detenido, puedes iniciarlo desde una terminal de administrador (`PowerShell`) ejecutando:
     ```powershell
     Start-Service -Name MongoDB
     ```
3. Abre tu terminal de MySQL y ejecuta el script `init.sql` para crear la base de datos `foro_turistico` y sus tablas.
4. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
5. Configura el archivo `.env` si tus credenciales de MySQL o MongoDB son distintas a las por defecto.
6. Inicializa y crea las colecciones y datos semilla en la base de datos de **MongoDB** ejecutando:
   ```bash
   node init_mongo.js
   ```
7. Inicia el servidor:
   ```bash
   npm start
   ```
8. Ve a tu navegador en: [http://localhost:3000](http://localhost:3000)
9. Para probar el rol de Administrador, inicia sesión con:
   - **Correo**: `admin@foro.com`
   - **Contraseña**: `admin123`
10. Registra una nueva cuenta de Vendedor, ve al panel del administrador y apruébalo. Luego ingresa con el vendedor para crear un tour e intentar reservar con una cuenta de Viajero.

---

## Sugerencias de mejora

1. **Pasarela de Pagos Real**: Integrar un servicio de pagos en línea (como Stripe o PayPal) para cobrar las reservas de los tours de manera automática al momento de confirmar.
2. **Notificaciones por Correo Electrónico**: Implementar envíos automáticos de correos (usando Nodemailer) al usuario cuando se confirme su reserva, y al vendedor cuando un administrador apruebe o rechace sus publicaciones.
3. **Geolocalización en Tiempo Real**: Reemplazar las direcciones de texto con mapas interactivos dinámicos de Mapbox o Google Maps API para que los proveedores puedan pinchar directamente las coordenadas de partida del tour.
4. **Chat en Vivo Interno**: Crear un sistema de chat en tiempo real mediante WebSockets (Socket.io) para comunicar directamente al viajero con el proveedor del viaje sin tener que depender de un canal externo.
