-- Script para crear la base de datos
-- Ejecutar en MySQL como root o usuario con permisos

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS despacho 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE despacho;

-- Mostrar confirmación
SELECT 'Base de datos creada exitosamente' as mensaje;
