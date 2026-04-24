CREATE DATABASE IF NOT EXISTS auditoria;
USE auditoria;

CREATE TABLE IF NOT EXISTS farmacia_datos (
  id              INT(11)        NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sicm            INT(11),
  rif             VARCHAR(20)    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  nombre          VARCHAR(255)   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  clasificacion_horar_caja VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  cantidad_doc_e  INT(11),
  promedio_mora   INT(11),
  cod_juan_bd     INT(11),
  ejecutiva       VARCHAR(100)   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  codigo_profit   VARCHAR(255)   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  vendedor        VARCHAR(255)   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  cod_profit_vendedor VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  user_app        INT(11),
  unid_mensual    DECIMAL(15,2),
  crist_mensual   DECIMAL(15,2),
  peso_de_la_drogueria DECIMAL(5,2),
  ultima_compra   DATE,
  municipio_y_parroquia VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  contacto_farmap VARCHAR(255)   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  numero          VARCHAR(50)    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  numero_2        VARCHAR(50)    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  fecha_creacion  DATETIME       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
