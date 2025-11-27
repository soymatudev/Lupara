-- ######################################################################
-- #                     AJUSTES INICIALES Y ESQUEMAS                   #
-- ######################################################################

-- Establecer configuración de codificación
SET client_encoding = 'UTF8';
SET standard_conforming_strings = 'on';

-- Eliminar esquemas existentes para un re-despliegue limpio
DROP SCHEMA IF EXISTS permisos CASCADE;
DROP SCHEMA IF EXISTS recursos CASCADE;
DROP SCHEMA IF EXISTS reserva CASCADE;

-- Crear esquemas
CREATE SCHEMA permisos;
CREATE SCHEMA recursos;
CREATE SCHEMA reserva;


-- ######################################################################
-- #                             SCHEMA PERMISOS                          #
-- ######################################################################

-- 1. Tabla: Rol (Maestra de roles)
CREATE TABLE permisos.rol (
    id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- Inserta los roles base
INSERT INTO permisos.rol (nombre_rol) VALUES
('administrador'),
('proveedor'),
('usuario');


-- ######################################################################
-- #                              SCHEMA RESERVA                          #
-- ######################################################################

-- 2. Tabla: Usuarios (Única fuente de verdad para usuarios)
CREATE TABLE reserva.usuarios (
    id SERIAL PRIMARY KEY,
    id_rol INTEGER NOT NULL REFERENCES permisos.rol(id), -- CLAVE FORÁNEA al rol normalizado
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- ALMACENAR SOLO EL HASH (bcrypt, Argon2, etc.)
    fecha_registro DATE DEFAULT CURRENT_DATE NOT NULL
);

-- 3. Tabla: Proveedores (El negocio que ofrece servicios)
CREATE TABLE reserva.proveedores (
    id SERIAL PRIMARY KEY,
    id_usuario_admin INTEGER REFERENCES reserva.usuarios(id) ON DELETE RESTRICT, -- El dueño/administrador del negocio
    nombre_proveedor VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    direccion VARCHAR(150),
    correo VARCHAR(100),
    telefono VARCHAR(20)
);

-- 4. Tabla: Reservacion
CREATE TABLE reserva.reservacion (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES reserva.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    id_proveedor INTEGER NOT NULL REFERENCES reserva.proveedores(id) ON UPDATE CASCADE ON DELETE CASCADE,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    -- Se recomienda añadir campos como 'estado_reserva', 'monto', 'comentarios', etc.
);

-- 5. Tabla: Horarios (Slots de tiempo que son ofrecidos por un Proveedor)
CREATE TABLE reserva.horarios (
    id SERIAL PRIMARY KEY,
    id_proveedor INTEGER NOT NULL REFERENCES reserva.proveedores(id), -- CRÍTICO: Conexión al negocio
    fecha DATE NOT NULL,
    hora_inicio TIME WITHOUT TIME ZONE NOT NULL,
    hora_fin TIME WITHOUT TIME ZONE NOT NULL,
    estado VARCHAR(20) DEFAULT 'disponible' NOT NULL, -- disponible, ocupado, bloqueado
    id_reservacion INTEGER REFERENCES reserva.reservacion(id) ON UPDATE CASCADE ON DELETE SET NULL, -- Si es ocupado, se enlaza a la reserva
    
    CONSTRAINT check_estado_horario CHECK (estado IN ('disponible', 'ocupado', 'bloqueado')),
    -- Constraint para asegurar que la hora de fin sea después de la hora de inicio
    CONSTRAINT check_hora_valida CHECK (hora_fin > hora_inicio)
);


-- ######################################################################
-- #                             SCHEMA RECURSOS                          #
-- ######################################################################

-- 6. Tabla: Ubicacion_Activo (Donde se muestra el asset en la interfaz)
CREATE TABLE recursos.ubicacion_activo (
    id SERIAL PRIMARY KEY,
    nombre_ubicacion VARCHAR(100) NOT NULL UNIQUE, -- Ejemplo: 'BANNER_HOME', 'GALERIA_PROVEEDOR', 'ICONO_FAVICON'
    descripcion VARCHAR(255)
);

-- 7. Tabla: Activo (El recurso/asset en sí, como una imagen)
CREATE TABLE recursos.activo (
    id SERIAL PRIMARY KEY,
    id_proveedor INTEGER NOT NULL REFERENCES reserva.proveedores(id) ON DELETE CASCADE, -- A qué negocio pertenece este recurso
    id_ubicacion INTEGER NOT NULL REFERENCES recursos.ubicacion_activo(id), -- Dónde se debe mostrar
    url VARCHAR(255) NOT NULL, -- La URL real del archivo (imagen, video, etc.)
    alt_text VARCHAR(255), -- Texto alternativo para SEO y accesibilidad
    fecha_subida DATE DEFAULT CURRENT_DATE
);

-- ######################################################################
-- #              ÍNDICES Y RESTRICCIONES ADICIONALES                     #
-- ######################################################################

-- Mejorar la búsqueda por correo, ya que se usará para el login
CREATE INDEX idx_usuarios_correo ON reserva.usuarios (correo);

-- Asegurar que no haya dos horarios idénticos disponibles por el mismo proveedor
CREATE UNIQUE INDEX idx_horarios_proveedor_fecha_inicio ON reserva.horarios (id_proveedor, fecha, hora_inicio)
WHERE estado = 'disponible';