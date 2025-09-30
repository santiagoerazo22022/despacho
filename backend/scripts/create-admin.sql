-- Script para crear usuario admin inicial
-- Ejecutar después de que las tablas sean creadas por Sequelize

USE despacho_expedientes;

-- Insertar usuario admin
-- Contraseña: "admin123" (encriptada con bcrypt)
INSERT INTO users (
    nombre,
    apellido, 
    email,
    password,
    rol,
    activo,
    created_at,
    updated_at
) VALUES (
    'Administrador',
    'Sistema',
    'admin@sistema.com',
    '$2a$12$LQv3c1yqBw2uuCD6lgs31.hR9hrIx2yJRvixFecRQwdb62UzgLDJu', -- admin123
    'admin',
    true,
    NOW(),
    NOW()
);

-- Verificar que se creó correctamente
SELECT id, nombre, apellido, email, rol, activo, created_at 
FROM users 
WHERE email = 'admin@sistema.com';
