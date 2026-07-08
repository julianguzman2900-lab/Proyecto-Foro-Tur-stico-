-- Creación de la base de datos para el Foro Turístico
CREATE DATABASE IF NOT EXISTS foro_turistico;
USE foro_turistico;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) DEFAULT NULL,
  role ENUM('admin', 'seller', 'user') NOT NULL DEFAULT 'user',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  rejection_reason TEXT DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  company_name VARCHAR(200) DEFAULT NULL,
  google_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Reservas
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tour_id VARCHAR(50) NOT NULL, -- Almacena el ID del tour en MongoDB
  tour_title VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  spots INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de Quejas y Sugerencias
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  reply TEXT DEFAULT NULL,
  status ENUM('pending', 'answered') NOT NULL DEFAULT 'pending',
  replied_by VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertar usuario Administrador por defecto (Contraseña: admin123)
-- Hash bcrypt generado para admin123: $2a$10$.l1cISEkMmObeNt3DcVUduqCEqfRLQo9iG9jVwzWckm5DPFCIBmN.
INSERT INTO users (name, email, password, role, status)
VALUES ('Administrador Foro', 'admin@foro.com', '$2a$10$.l1cISEkMmObeNt3DcVUduqCEqfRLQo9iG9jVwzWckm5DPFCIBmN.', 'admin', 'approved')
ON DUPLICATE KEY UPDATE id=id;
