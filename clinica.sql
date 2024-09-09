-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-08-2024 a las 16:52:15
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `clinica`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria`
--

CREATE TABLE `auditoria` (
  `id_Auditoria` int(11) NOT NULL,
  `id_Usuario` int(11) DEFAULT NULL,
  `Fecha_Hora_Operacion` datetime DEFAULT NULL,
  `Operacion_Realizada` varchar(255) DEFAULT NULL,
  `Detalles_Adicionales` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `determinaciones`
--

CREATE TABLE `determinaciones` (
  `id_Determinacion` int(11) NOT NULL,
  `id_ValorReferencia` int(11) DEFAULT NULL,
  `id_Examen` int(11) DEFAULT NULL,
  `Nombre_Determinacion` varchar(255) DEFAULT NULL,
  `Valor` decimal(10,2) DEFAULT NULL,
  `Unidad_Medida` varchar(50) DEFAULT NULL,
  `Sexo` varchar(10) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `determinaciones`
--

INSERT INTO `determinaciones` (`id_Determinacion`, `id_ValorReferencia`, `id_Examen`, `Nombre_Determinacion`, `Valor`, `Unidad_Medida`, `Sexo`, `estado`) VALUES
(1, 1, 5, 'TPA', 1.20, 'ml', 'M', 1),
(2, 2, 6, 'LF', 1.00, '10', 'M', 0),
(3, 2, 5, 'Goteo', 1.00, 'ml', 'M', 1),
(4, 1, 5, 'Goteo', 1.00, 'ml', 'M', 1),
(5, 2, 7, 'LDL', 70.00, 'mg/dl', 'M', 1),
(7, 4, 9, 'pis', 10.00, 'ml', 'M', 1),
(8, 1, 5, 'Tiempo de Sangrado', 12.50, 'segundos', 'M', 0),
(9, 2, 5, 'Tiempo de Protrombina', 1.20, 'segundos', 'M', 0),
(10, 3, 5, 'Tiempo de Tromboplastina Parcial Activada', 35.00, 'segundos', 'M', 0),
(12, NULL, 5, 'Conteo globulos rojos', 123.00, 'mcl', 'M', 1),
(13, NULL, 156, 'Coprología Completa', 12.00, 'ml', 'M', 1),
(14, NULL, 171, 'Liquido cefaloprueba', 323.00, 'ml', 'M', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `examen`
--

CREATE TABLE `examen` (
  `id_examen` int(11) NOT NULL,
  `nombre_examen` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `tipo_muestra` varchar(50) NOT NULL,
  `estado` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `examen`
--

INSERT INTO `examen` (`id_examen`, `nombre_examen`, `descripcion`, `codigo`, `tipo_muestra`, `estado`) VALUES
(5, 'Hemograma', 'examen de sangre', '1', 'sangre', 0),
(6, 'urobilinógeno ', 'urobilinógeno ', '3', 'orina', 0),
(7, 'Perfil lipídico', 'Perfil lipídico', '123', 'sangre', 1),
(9, 'ACETONURIA', 'examen de ACETONURIA', '12121212', 'orina', 1),
(10, 'Bilirrubina', 'marcador de disfunción hepática', '660111', 'sangre', 1),
(11, 'Hemograma Completo', 'Conteo de células sanguíneas y parámetros relacionados', 'HEM001', 'sangre', 1),
(12, 'Glucosa en Ayunas', 'Medición de glucosa en sangre después de un período de ayuno', 'BIO001', 'sangre', 1),
(13, 'Perfil Lipídico', 'Medición de colesterol total, HDL, LDL y triglicéridos', 'BIO002', 'sangre', 1),
(14, 'Creatinina', 'Medición de creatinina en sangre para evaluar función renal', 'BIO003', 'sangre', 1),
(15, 'Urea', 'Medición de urea en sangre para evaluar función renal', 'BIO004', 'sangre', 1),
(16, 'Ácido Úrico', 'Medición de ácido úrico en sangre', 'BIO005', 'sangre', 1),
(17, 'Electrolitos', 'Medición de sodio, potasio, cloro y bicarbonato en sangre', 'BIO006', 'sangre', 1),
(18, 'Transaminasas (ALT y AST)', 'Medición de enzimas hepáticas ALT y AST en sangre', 'BIO007', 'sangre', 1),
(19, 'Bilirrubina Total y Fraccionada', 'Medición de bilirrubina total y fraccionada en sangre', 'BIO008', 'sangre', 1),
(20, 'Fosfatasa Alcalina', 'Medición de la enzima fosfatasa alcalina en sangre', 'BIO009', 'sangre', 1),
(21, 'Gammaglutamiltransferasa (GGT)', 'Medición de la enzima GGT en sangre', 'BIO010', 'sangre', 1),
(22, 'Proteínas Totales y Fraccionadas', 'Medición de proteínas totales y fraccionadas en sangre', 'BIO011', 'sangre', 1),
(23, 'Albúmina', 'Medición de la proteína albúmina en sangre', 'BIO012', 'sangre', 1),
(24, 'Amilasa', 'Medición de la enzima amilasa en sangre', 'BIO013', 'sangre', 1),
(25, 'Lipasa', 'Medición de la enzima lipasa en sangre', 'BIO014', 'sangre', 1),
(26, 'CK Total', 'Medición de la enzima creatina quinasa total en sangre', 'BIO015', 'sangre', 1),
(27, 'CK-MB', 'Medición de la fracción MB de la enzima creatina quinasa en sangre', 'BIO016', 'sangre', 1),
(28, 'Troponina', 'Medición de troponina en sangre para evaluar daño cardíaco', 'BIO017', 'sangre', 1),
(29, 'Dímero D', 'Medición del dímero D en sangre para evaluar trombosis', 'BIO018', 'sangre', 1),
(30, 'Citrato de Sodio', 'Medición de niveles de citrato de sodio en sangre', 'BIO019', 'sangre', 1),
(31, 'Fibrinógeno', 'Medición de fibrinógeno en sangre para evaluar coagulación', 'BIO020', 'sangre', 1),
(32, 'PCR (Proteína C Reactiva)', 'Medición de proteína C reactiva en sangre para evaluar inflamación', 'BIO021', 'sangre', 1),
(33, 'Velocidad de Sedimentación Globular (VSG)', 'Medición de la velocidad de sedimentación de los glóbulos rojos', 'BIO022', 'sangre', 1),
(34, 'Antiestreptolisinas (ASO)', 'Medición de anticuerpos antiestreptolisina en sangre', 'BIO023', 'sangre', 1),
(35, 'Factor Reumatoideo', 'Detección de factor reumatoideo en sangre', 'BIO024', 'sangre', 1),
(36, 'ANA (Anticuerpos Antinucleares)', 'Detección de anticuerpos antinucleares en sangre', 'BIO025', 'sangre', 1),
(37, 'Complemento C3 y C4', 'Medición de componentes del sistema del complemento en sangre', 'BIO026', 'sangre', 1),
(38, 'Hepatitis A IgM', 'Detección de anticuerpos IgM contra el virus de la hepatitis A', 'SERO001', 'sangre', 1),
(39, 'Hepatitis B HBsAg', 'Detección del antígeno de superficie del virus de la hepatitis B', 'SERO002', 'sangre', 1),
(40, 'Hepatitis B Anti-HBs', 'Detección de anticuerpos contra el antígeno de superficie del virus de la hepatitis B', 'SERO003', 'sangre', 1),
(41, 'Hepatitis B Anti-HBc IgM', 'Detección de anticuerpos IgM contra el core del virus de la hepatitis B', 'SERO004', 'sangre', 1),
(42, 'Hepatitis C Anti-VHC', 'Detección de anticuerpos contra el virus de la hepatitis C', 'SERO005', 'sangre', 1),
(43, 'VIH 1 y 2', 'Detección de anticuerpos contra el virus de la inmunodeficiencia humana', 'SERO006', 'sangre', 1),
(44, 'RPR (Prueba Rápida de Reagina)', 'Prueba de detección de sífilis', 'SERO007', 'sangre', 1),
(45, 'FTA-ABS', 'Prueba de confirmación de sífilis', 'SERO008', 'sangre', 1),
(46, 'Toxoplasma IgG', 'Detección de anticuerpos IgG contra Toxoplasma gondii', 'SERO009', 'sangre', 1),
(47, 'Toxoplasma IgM', 'Detección de anticuerpos IgM contra Toxoplasma gondii', 'SERO010', 'sangre', 1),
(48, 'Rubéola IgG', 'Detección de anticuerpos IgG contra el virus de la rubéola', 'SERO011', 'sangre', 1),
(49, 'Rubéola IgM', 'Detección de anticuerpos IgM contra el virus de la rubéola', 'SERO012', 'sangre', 1),
(50, 'CMV IgG', 'Detección de anticuerpos IgG contra citomegalovirus', 'SERO013', 'sangre', 1),
(51, 'CMV IgM', 'Detección de anticuerpos IgM contra citomegalovirus', 'SERO014', 'sangre', 1),
(52, 'Herpes Simplex IgG', 'Detección de anticuerpos IgG contra el virus del herpes simple', 'SERO015', 'sangre', 1),
(53, 'Herpes Simplex IgM', 'Detección de anticuerpos IgM contra el virus del herpes simple', 'SERO016', 'sangre', 1),
(54, 'Varicela Zóster IgG', 'Detección de anticuerpos IgG contra el virus varicela zóster', 'SERO017', 'sangre', 1),
(55, 'Varicela Zóster IgM', 'Detección de anticuerpos IgM contra el virus varicela zóster', 'SERO018', 'sangre', 1),
(56, 'Parotiditis IgG', 'Detección de anticuerpos IgG contra el virus de la parotiditis', 'SERO019', 'sangre', 1),
(57, 'Parotiditis IgM', 'Detección de anticuerpos IgM contra el virus de la parotiditis', 'SERO020', 'sangre', 1),
(58, 'Influenza A y B', 'Detección de anticuerpos contra los virus de la influenza A y B', 'SERO021', 'sangre', 1),
(59, 'Mycoplasma IgG', 'Detección de anticuerpos IgG contra Mycoplasma pneumoniae', 'SERO022', 'sangre', 1),
(60, 'Mycoplasma IgM', 'Detección de anticuerpos IgM contra Mycoplasma pneumoniae', 'SERO023', 'sangre', 1),
(61, 'Chlamydia IgG', 'Detección de anticuerpos IgG contra Chlamydia', 'SERO024', 'sangre', 1),
(62, 'Chlamydia IgM', 'Detección de anticuerpos IgM contra Chlamydia', 'SERO025', 'sangre', 1),
(63, 'COVID-19 IgG', 'Detección de anticuerpos IgG contra el SARS-CoV-2', 'SERO026', 'sangre', 1),
(64, 'COVID-19 IgM', 'Detección de anticuerpos IgM contra el SARS-CoV-2', 'SERO027', 'sangre', 1),
(65, 'Prueba de Embarazo en Orina', 'Detección de la hormona hCG en orina para confirmar embarazo', 'URIN001', 'orina', 1),
(66, 'Urocultivo', 'Cultivo de orina para detectar infecciones del tracto urinario', 'URIN002', 'orina', 1),
(67, 'Examen General de Orina', 'Análisis físico, químico y microscópico de la orina', 'URIN003', 'orina', 1),
(68, 'Microalbuminuria', 'Medición de pequeñas cantidades de albúmina en orina', 'URIN004', 'orina', 1),
(69, 'Proteinuria de 24 Horas', 'Medición de la cantidad de proteínas excretadas en la orina en 24 horas', 'URIN005', 'orina', 1),
(70, 'Clearance de Creatinina', 'Evaluación de la función renal midiendo la creatinina en orina y sangre', 'URIN006', 'orina', 1),
(71, 'Sedimento Urinario', 'Análisis microscópico del sedimento de la orina', 'URIN007', 'orina', 1),
(72, 'Glucosa en Orina', 'Medición de la cantidad de glucosa en la orina', 'URIN008', 'orina', 1),
(73, 'Cetonas en Orina', 'Medición de cetonas en la orina', 'URIN009', 'orina', 1),
(74, 'Hemoglobina en Orina', 'Detección de hemoglobina en la orina', 'URIN010', 'orina', 1),
(75, 'Bilirrubina en Orina', 'Detección de bilirrubina en la orina', 'URIN011', 'orina', 1),
(76, 'Hemograma Completo', 'Conteo de células sanguíneas y parámetros relacionados', 'HEM001', 'sangre', 1),
(77, 'Glucosa en Ayunas', 'Medición de glucosa en sangre después de un período de ayuno', 'BIO001', 'sangre', 1),
(78, 'Perfil Lipídico', 'Medición de colesterol total, HDL, LDL y triglicéridos', 'BIO002', 'sangre', 1),
(79, 'Creatinina', 'Medición de creatinina en sangre para evaluar función renal', 'BIO003', 'sangre', 1),
(80, 'Urea', 'Medición de urea en sangre para evaluar función renal', 'BIO004', 'sangre', 1),
(81, 'Ácido Úrico', 'Medición de ácido úrico en sangre', 'BIO005', 'sangre', 1),
(82, 'Electrolitos', 'Medición de sodio, potasio, cloro y bicarbonato en sangre', 'BIO006', 'sangre', 1),
(83, 'Transaminasas (ALT y AST)', 'Medición de enzimas hepáticas ALT y AST en sangre', 'BIO007', 'sangre', 1),
(84, 'Bilirrubina Total y Fraccionada', 'Medición de bilirrubina total y fraccionada en sangre', 'BIO008', 'sangre', 1),
(85, 'Fosfatasa Alcalina', 'Medición de la enzima fosfatasa alcalina en sangre', 'BIO009', 'sangre', 1),
(86, 'Gammaglutamiltransferasa (GGT)', 'Medición de la enzima GGT en sangre', 'BIO010', 'sangre', 1),
(87, 'Proteínas Totales y Fraccionadas', 'Medición de proteínas totales y fraccionadas en sangre', 'BIO011', 'sangre', 1),
(88, 'Albúmina', 'Medición de la proteína albúmina en sangre', 'BIO012', 'sangre', 1),
(89, 'Amilasa', 'Medición de la enzima amilasa en sangre', 'BIO013', 'sangre', 1),
(90, 'Lipasa', 'Medición de la enzima lipasa en sangre', 'BIO014', 'sangre', 1),
(91, 'CK Total', 'Medición de la enzima creatina quinasa total en sangre', 'BIO015', 'sangre', 1),
(92, 'CK-MB', 'Medición de la fracción MB de la enzima creatina quinasa en sangre', 'BIO016', 'sangre', 1),
(93, 'Troponina', 'Medición de troponina en sangre para evaluar daño cardíaco', 'BIO017', 'sangre', 1),
(94, 'Dímero D', 'Medición del dímero D en sangre para evaluar trombosis', 'BIO018', 'sangre', 1),
(95, 'Citrato de Sodio', 'Medición de niveles de citrato de sodio en sangre', 'BIO019', 'sangre', 1),
(96, 'Fibrinógeno', 'Medición de fibrinógeno en sangre para evaluar coagulación', 'BIO020', 'sangre', 1),
(97, 'PCR (Proteína C Reactiva)', 'Medición de proteína C reactiva en sangre para evaluar inflamación', 'BIO021', 'sangre', 1),
(98, 'Velocidad de Sedimentación Globular (VSG)', 'Medición de la velocidad de sedimentación de los glóbulos rojos', 'BIO022', 'sangre', 1),
(99, 'Antiestreptolisinas (ASO)', 'Medición de anticuerpos antiestreptolisina en sangre', 'BIO023', 'sangre', 1),
(100, 'Factor Reumatoideo', 'Detección de factor reumatoideo en sangre', 'BIO024', 'sangre', 1),
(101, 'ANA (Anticuerpos Antinucleares)', 'Detección de anticuerpos antinucleares en sangre', 'BIO025', 'sangre', 1),
(102, 'Complemento C3 y C4', 'Medición de componentes del sistema del complemento en sangre', 'BIO026', 'sangre', 1),
(103, 'Hepatitis A IgM', 'Detección de anticuerpos IgM contra el virus de la hepatitis A', 'SERO001', 'sangre', 1),
(104, 'Hepatitis B HBsAg', 'Detección del antígeno de superficie del virus de la hepatitis B', 'SERO002', 'sangre', 1),
(105, 'Hepatitis B Anti-HBs', 'Detección de anticuerpos contra el antígeno de superficie del virus de la hepatitis B', 'SERO003', 'sangre', 1),
(106, 'Hepatitis B Anti-HBc IgM', 'Detección de anticuerpos IgM contra el core del virus de la hepatitis B', 'SERO004', 'sangre', 1),
(107, 'Hepatitis C Anti-VHC', 'Detección de anticuerpos contra el virus de la hepatitis C', 'SERO005', 'sangre', 1),
(108, 'VIH 1 y 2', 'Detección de anticuerpos contra el virus de la inmunodeficiencia humana', 'SERO006', 'sangre', 1),
(109, 'RPR (Prueba Rápida de Reagina)', 'Prueba de detección de sífilis', 'SERO007', 'sangre', 1),
(110, 'FTA-ABS', 'Prueba de confirmación de sífilis', 'SERO008', 'sangre', 1),
(111, 'Toxoplasma IgG', 'Detección de anticuerpos IgG contra Toxoplasma gondii', 'SERO009', 'sangre', 1),
(112, 'Toxoplasma IgM', 'Detección de anticuerpos IgM contra Toxoplasma gondii', 'SERO010', 'sangre', 1),
(113, 'Rubéola IgG', 'Detección de anticuerpos IgG contra el virus de la rubéola', 'SERO011', 'sangre', 1),
(114, 'Rubéola IgM', 'Detección de anticuerpos IgM contra el virus de la rubéola', 'SERO012', 'sangre', 1),
(115, 'CMV IgG', 'Detección de anticuerpos IgG contra citomegalovirus', 'SERO013', 'sangre', 1),
(116, 'CMV IgM', 'Detección de anticuerpos IgM contra citomegalovirus', 'SERO014', 'sangre', 1),
(117, 'Herpes Simplex IgG', 'Detección de anticuerpos IgG contra el virus del herpes simple', 'SERO015', 'sangre', 1),
(118, 'Herpes Simplex IgM', 'Detección de anticuerpos IgM contra el virus del herpes simple', 'SERO016', 'sangre', 1),
(119, 'Varicela Zóster IgG', 'Detección de anticuerpos IgG contra el virus varicela zóster', 'SERO017', 'sangre', 1),
(120, 'Varicela Zóster IgM', 'Detección de anticuerpos IgM contra el virus varicela zóster', 'SERO018', 'sangre', 1),
(121, 'Parotiditis IgG', 'Detección de anticuerpos IgG contra el virus de la parotiditis', 'SERO019', 'sangre', 1),
(122, 'Parotiditis IgM', 'Detección de anticuerpos IgM contra el virus de la parotiditis', 'SERO020', 'sangre', 1),
(123, 'Influenza A y B', 'Detección de anticuerpos contra los virus de la influenza A y B', 'SERO021', 'sangre', 1),
(124, 'Mycoplasma IgG', 'Detección de anticuerpos IgG contra Mycoplasma pneumoniae', 'SERO022', 'sangre', 1),
(125, 'Mycoplasma IgM', 'Detección de anticuerpos IgM contra Mycoplasma pneumoniae', 'SERO023', 'sangre', 1),
(126, 'Chlamydia IgG', 'Detección de anticuerpos IgG contra Chlamydia', 'SERO024', 'sangre', 1),
(127, 'Chlamydia IgM', 'Detección de anticuerpos IgM contra Chlamydia', 'SERO025', 'sangre', 1),
(128, 'COVID-19 IgG', 'Detección de anticuerpos IgG contra el SARS-CoV-2', 'SERO026', 'sangre', 1),
(129, 'COVID-19 IgM', 'Detección de anticuerpos IgM contra el SARS-CoV-2', 'SERO027', 'sangre', 1),
(130, 'Prueba de Embarazo en Orina', 'Detección de la hormona hCG en orina para confirmar embarazo', 'URIN001', 'orina', 1),
(131, 'Urocultivo', 'Cultivo de orina para detectar infecciones del tracto urinario', 'URIN002', 'orina', 1),
(132, 'Examen General de Orina', 'Análisis físico, químico y microscópico de la orina', 'URIN003', 'orina', 1),
(133, 'Microalbuminuria', 'Medición de pequeñas cantidades de albúmina en orina', 'URIN004', 'orina', 1),
(134, 'Proteinuria de 24 Horas', 'Medición de la cantidad de proteínas excretadas en la orina en 24 horas', 'URIN005', 'orina', 1),
(135, 'Clearance de Creatinina', 'Evaluación de la función renal midiendo la creatinina en orina y sangre', 'URIN006', 'orina', 1),
(136, 'Sedimento Urinario', 'Análisis microscópico del sedimento de la orina', 'URIN007', 'orina', 1),
(137, 'Glucosa en Orina', 'Medición de la cantidad de glucosa en la orina', 'URIN008', 'orina', 1),
(138, 'Cetonas en Orina', 'Medición de cetonas en la orina', 'URIN009', 'orina', 1),
(139, 'Hemoglobina en Orina', 'Detección de hemoglobina en la orina', 'URIN010', 'orina', 1),
(140, 'Bilirrubina en Orina', 'Detección de bilirrubina en la orina', 'URIN011', 'orina', 1),
(141, 'Prueba de Embarazo en Orina', 'Detección de la hormona hCG en orina para confirmar embarazo', 'URIN001', 'orina', 1),
(142, 'Urocultivo', 'Cultivo de orina para detectar infecciones del tracto urinario', 'URIN002', 'orina', 1),
(143, 'Examen General de Orina', 'Análisis físico, químico y microscópico de la orina', 'URIN003', 'orina', 1),
(144, 'Microalbuminuria', 'Medición de pequeñas cantidades de albúmina en orina', 'URIN004', 'orina', 1),
(145, 'Proteinuria de 24 Horas', 'Medición de la cantidad de proteínas excretadas en la orina en 24 horas', 'URIN005', 'orina', 1),
(146, 'Clearance de Creatinina', 'Evaluación de la función renal midiendo la creatinina en orina y sangre', 'URIN006', 'orina', 1),
(147, 'Sedimento Urinario', 'Análisis microscópico del sedimento de la orina', 'URIN007', 'orina', 1),
(148, 'Glucosa en Orina', 'Medición de la cantidad de glucosa en la orina', 'URIN008', 'orina', 1),
(149, 'Cetonas en Orina', 'Medición de cetonas en la orina', 'URIN009', 'orina', 1),
(150, 'Hemoglobina en Orina', 'Detección de hemoglobina en la orina', 'URIN010', 'orina', 1),
(151, 'Bilirrubina en Orina', 'Detección de bilirrubina en la orina', 'URIN011', 'orina', 1),
(152, 'Urobilinógeno', 'Medición de urobilinógeno en la orina', 'URIN012', 'orina', 1),
(153, 'Ácido Úrico en Orina', 'Medición de ácido úrico en la orina', 'URIN013', 'orina', 1),
(154, 'Calcio en Orina', 'Medición de calcio en la orina', 'URIN014', 'orina', 1),
(155, 'Fósforo en Orina', 'Medición de fósforo en la orina', 'URIN015', 'orina', 1),
(156, 'Coprología Completa', 'Análisis físico, químico y microscópico de las heces', 'HEC001', 'heces', 1),
(157, 'Parásitos en Heces', 'Detección de parásitos en las heces', 'HEC002', 'heces', 1),
(158, 'Sangre Oculta en Heces', 'Detección de sangre no visible en las heces', 'HEC003', 'heces', 1),
(159, 'Elastasa en Heces', 'Medición de elastasa en las heces para evaluar función pancreática', 'HEC004', 'heces', 1),
(160, 'Calprotectina en Heces', 'Medición de calprotectina en las heces para evaluar inflamación intestinal', 'HEC005', 'heces', 1),
(161, 'Cultivo de Heces', 'Cultivo de muestras fecales para detectar bacterias patógenas', 'HEC006', 'heces', 1),
(162, 'Enzimas Digestivas en Heces', 'Medición de enzimas digestivas en las heces', 'HEC007', 'heces', 1),
(163, 'pH en Heces', 'Medición del pH en las heces', 'HEC008', 'heces', 1),
(164, 'Osmolaridad en Heces', 'Medición de osmolaridad en las heces', 'HEC009', 'heces', 1),
(165, 'Ácidos Grasos en Heces', 'Medición de ácidos grasos en las heces', 'HEC010', 'heces', 1),
(166, 'Lactoferrina en Heces', 'Medición de lactoferrina en las heces para evaluar inflamación intestinal', 'HEC011', 'heces', 1),
(167, 'Alpha-1-antitripsina en Heces', 'Medición de alpha-1-antitripsina en las heces', 'HEC012', 'heces', 1),
(168, 'pHmetria en Heces', 'Medición de pH en las heces', 'HEC013', 'heces', 1),
(169, 'Nitritos en Heces', 'Medición de nitritos en las heces', 'HEC014', 'heces', 1),
(170, 'Sangre en Heces', 'Detección de sangre en las heces', 'HEC015', 'heces', 1),
(171, 'Cultivo de Líquido Cefalorraquídeo', 'Cultivo del líquido cefalorraquídeo para detectar infecciones', 'LCR001', 'liquidoCefaloraquideo', 1),
(172, 'Análisis de Glucosa en Líquido Cefalorraquídeo', 'Medición de glucosa en el líquido cefalorraquídeo', 'LCR002', 'liquidoCefaloraquideo', 1),
(173, 'Proteínas en Líquido Cefalorraquídeo', 'Medición de proteínas en el líquido cefalorraquídeo', 'LCR003', 'liquidoCefaloraquideo', 1),
(174, 'Recuento de Células en Líquido Cefalorraquídeo', 'Recuento de células en el líquido cefalorraquídeo', 'LCR004', 'liquidoCefaloraquideo', 1),
(175, 'Tinción de Gram de Líquido Cefalorraquídeo', 'Tinción de Gram del líquido cefalorraquídeo para detectar bacterias', 'LCR005', 'liquidoCefaloraquideo', 1),
(176, 'Citoquímico de Líquido Cefalorraquídeo', 'Análisis citoquímico del líquido cefalorraquídeo', 'LCR006', 'liquidoCefaloraquideo', 1),
(177, 'Esterase Leucocitaria en Líquido Cefalorraquídeo', 'Detección de esterasa leucocitaria en el líquido cefalorraquídeo', 'LCR007', 'liquidoCefaloraquideo', 1),
(178, 'Tuberculina en Líquido Cefalorraquídeo', 'Detección de tuberculosis en el líquido cefalorraquídeo', 'LCR008', 'liquidoCefaloraquideo', 1),
(179, 'Biopsia Líquido Cefalorraquídeo', 'Análisis de biopsia en el líquido cefalorraquídeo', 'LCR009', 'liquidoCefaloraquideo', 1),
(180, 'Perfusión Líquido Cefalorraquídeo', 'Perfusión en el líquido cefalorraquídeo', 'LCR010', 'liquidoCefaloraquideo', 1),
(181, 'Mielina Líquido Cefalorraquídeo', 'Análisis de mielina en el líquido cefalorraquídeo', 'LCR011', 'liquidoCefaloraquideo', 1),
(182, 'Cortisol Líquido Cefalorraquídeo', 'Medición de cortisol en el líquido cefalorraquídeo', 'LCR012', 'liquidoCefaloraquideo', 1),
(183, 'Oligoclonales en Líquido Cefalorraquídeo', 'Análisis de oligoclonales en el líquido cefalorraquídeo', 'LCR013', 'liquidoCefaloraquideo', 1),
(184, 'Sobrecarga Líquido Cefalorraquídeo', 'Sobrecarga en el líquido cefalorraquídeo', 'LCR014', 'liquidoCefaloraquideo', 1),
(185, 'Antibióticos Líquido Cefalorraquídeo', 'Medición de antibióticos en el líquido cefalorraquídeo', 'LCR015', 'liquidoCefaloraquideo', 1),
(186, 'Cultivo de Saliva', 'Cultivo de muestras de saliva para detectar patógenos', 'SALI001', 'saliva', 1),
(187, 'Proteínas en Saliva', 'Medición de proteínas en la saliva', 'SALI002', 'saliva', 1),
(188, 'Amilasa en Saliva', 'Medición de amilasa en la saliva', 'SALI003', 'saliva', 1),
(189, 'pH en Saliva', 'Medición del pH en la saliva', 'SALI004', 'saliva', 1),
(190, 'Electrolitos en Saliva', 'Medición de electrolitos en la saliva', 'SALI005', 'saliva', 1),
(191, 'Sodio en Saliva', 'Medición de sodio en la saliva', 'SALI006', 'saliva', 1),
(192, 'Potasio en Saliva', 'Medición de potasio en la saliva', 'SALI007', 'saliva', 1),
(193, 'Calcio en Saliva', 'Medición de calcio en la saliva', 'SALI008', 'saliva', 1),
(194, 'Fósforo en Saliva', 'Medición de fósforo en la saliva', 'SALI009', 'saliva', 1),
(195, 'Cloruro en Saliva', 'Medición de cloruro en la saliva', 'SALI010', 'saliva', 1),
(196, 'Bicarbonato en Saliva', 'Medición de bicarbonato en la saliva', 'SALI011', 'saliva', 1),
(197, 'Urea en Saliva', 'Medición de urea en la saliva', 'SALI012', 'saliva', 1),
(198, 'Creatinina en Saliva', 'Medición de creatinina en la saliva', 'SALI013', 'saliva', 1),
(199, 'Colesterol en Saliva', 'Medición de colesterol en la saliva', 'SALI014', 'saliva', 1),
(200, 'Triglicéridos en Saliva', 'Medición de triglicéridos en la saliva', 'SALI015', 'saliva', 1),
(201, 'Cultivo de Secreción Nasofaríngea', 'Cultivo de muestras de secreción nasofaríngea para detectar patógenos', 'NASO001', 'nasofaringea', 1),
(202, 'PCR para Virus Respiratorios', 'Detección de virus respiratorios por PCR en secreción nasofaríngea', 'NASO002', 'nasofaringea', 1),
(203, 'Antígenos Virales en Secreción Nasofaríngea', 'Detección de antígenos virales en secreción nasofaríngea', 'NASO003', 'nasofaringea', 1),
(204, 'Cultivo de Bacterias en Secreción Nasofaríngea', 'Cultivo de bacterias en secreción nasofaríngea', 'NASO004', 'nasofaringea', 1),
(205, 'Inmunofluorescencia en Secreción Nasofaríngea', 'Análisis de inmunofluorescencia en secreción nasofaríngea', 'NASO005', 'nasofaringea', 1),
(206, 'Cultivo de Hongos en Secreción Nasofaríngea', 'Cultivo de hongos en secreción nasofaríngea', 'NASO006', 'nasofaringea', 1),
(207, 'Anticuerpos en Secreción Nasofaríngea', 'Detección de anticuerpos en secreción nasofaríngea', 'NASO007', 'nasofaringea', 1),
(208, 'Eosinófilos en Secreción Nasofaríngea', 'Medición de eosinófilos en secreción nasofaríngea', 'NASO008', 'nasofaringea', 1),
(209, 'pH en Secreción Nasofaríngea', 'Medición del pH en secreción nasofaríngea', 'NASO009', 'nasofaringea', 1),
(210, 'Células Epiteliales en Secreción Nasofaríngea', 'Recuento de células epiteliales en secreción nasofaríngea', 'NASO010', 'nasofaringea', 1),
(211, 'Neutrófilos en Secreción Nasofaríngea', 'Medición de neutrófilos en secreción nasofaríngea', 'NASO011', 'nasofaringea', 1),
(212, 'Adenovirus en Secreción Nasofaríngea', 'Detección de adenovirus en secreción nasofaríngea', 'NASO012', 'nasofaringea', 1),
(213, 'Eosinofilia en Secreción Nasofaríngea', 'Medición de eosinofilia en secreción nasofaríngea', 'NASO013', 'nasofaringea', 1),
(214, 'Hemocultivo en Secreción Nasofaríngea', 'Cultivo de hemocultivo en secreción nasofaríngea', 'NASO014', 'nasofaringea', 1),
(215, 'Líquido en Secreción Nasofaríngea', 'Análisis de líquido en secreción nasofaríngea', 'NASO015', 'nasofaringea', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `muestras`
--

CREATE TABLE `muestras` (
  `id_Muestra` int(11) NOT NULL,
  `id_Orden` int(11) NOT NULL,
  `id_Paciente` int(11) DEFAULT NULL,
  `Fecha_Recepcion` datetime DEFAULT NULL,
  `Tipo_Muestra` varchar(50) DEFAULT NULL,
  `Estado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `muestras`
--

INSERT INTO `muestras` (`id_Muestra`, `id_Orden`, `id_Paciente`, `Fecha_Recepcion`, `Tipo_Muestra`, `Estado`) VALUES
(35, 2, 1, '2024-06-07 23:33:10', 'sangre', 'analitica'),
(36, 2, 1, '2024-06-10 13:24:24', 'orina', 'analitica'),
(44, 8, 1, '2024-06-27 20:22:29', 'sangre', 'analitica'),
(45, 8, 1, '2024-06-16 13:39:15', 'orina', 'analitica'),
(46, 8, 1, '2024-06-28 07:08:50', 'heces', 'analitica'),
(47, 8, 1, '2024-06-30 18:46:24', 'liquidoCefaloraquideo', 'analitica'),
(48, 10, 6, '2024-07-04 22:37:39', 'sangre', 'analitica'),
(49, 10, 6, '2024-07-04 22:37:39', 'orina', 'analitica'),
(50, 3, 1, '2024-07-29 21:15:11', 'sangre', 'esperando_toma_muestra'),
(51, 3, 1, '2024-07-29 21:15:11', 'heces', 'esperando_toma_muestra');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_examenes`
--

CREATE TABLE `ordenes_examenes` (
  `id_OrdenExamen` int(11) NOT NULL,
  `id_Orden` int(11) DEFAULT NULL,
  `id_examen` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ordenes_examenes`
--

INSERT INTO `ordenes_examenes` (`id_OrdenExamen`, `id_Orden`, `id_examen`) VALUES
(1, 1, 5),
(3, 1, 9),
(4, 2, 9),
(5, 2, 5),
(6, 3, 5),
(12, 7, 5),
(13, 8, 5),
(14, 9, 6),
(15, 2, 10),
(16, 2, 6),
(17, 7, 9),
(26, 8, 42),
(27, 10, 5),
(28, 10, 17);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_trabajo`
--

CREATE TABLE `ordenes_trabajo` (
  `id_Orden` int(11) NOT NULL,
  `id_Paciente` int(11) DEFAULT NULL,
  `dni` int(11) NOT NULL,
  `Fecha_Creacion` datetime DEFAULT NULL,
  `Fecha_Entrega` date NOT NULL,
  `estado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ordenes_trabajo`
--

INSERT INTO `ordenes_trabajo` (`id_Orden`, `id_Paciente`, `dni`, `Fecha_Creacion`, `Fecha_Entrega`, `estado`) VALUES
(1, 3, 0, '2023-11-04 22:09:34', '2023-11-11', 'ingresada'),
(2, 1, 42207666, '2023-11-06 19:25:29', '2023-11-13', 'Cancelada'),
(3, 1, 42207666, '2024-06-21 22:42:17', '2024-06-28', 'Para validar'),
(4, 1, 42207666, '2024-06-21 23:29:19', '2024-06-28', 'ingresada'),
(7, 1, 42207666, '2024-06-21 23:42:14', '2024-06-28', 'Cancelada'),
(8, 1, 42207666, '2024-06-21 23:43:26', '2024-06-28', 'Para validar'),
(9, 3, 123123123, '2024-06-21 23:43:51', '2024-06-28', 'esperando_toma_muestra'),
(10, 6, 48527624, '2024-07-04 22:37:39', '2024-07-11', 'ingresada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id_paciente` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `dni` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `direccion` varchar(50) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` varchar(15) NOT NULL,
  `embarazo` tinyint(4) NOT NULL,
  `diagnostico` varchar(100) NOT NULL,
  `fecha_registro` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id_paciente`, `nombre`, `apellido`, `dni`, `email`, `telefono`, `direccion`, `fecha_nacimiento`, `genero`, `embarazo`, `diagnostico`, `fecha_registro`) VALUES
(1, 'Mauro', 'Corvalan Juarez', '42207666', 'maurocorvaa@gmail.com', '2664792991', 'Justo daract 123', '1999-09-22', 'M', 0, 'si', '2023-10-23'),
(2, 'Juan', 'Currenti', '20000000', 'juan@gmail.com', '123123', 'Mendoza', '2002-11-12', 'M', 0, 'faringitis', '2023-10-24'),
(3, 'Feliciana', 'Corvalan', '123123123', 'quiaca@gmail.com', '123', 'quiaca', '2000-02-01', 'F', 1, 'si', '2023-10-26'),
(4, 'Pepe', 'Mujica', '539763', 'pepemujica@gmail.com', '119238', 'Uruguay', '1995-01-24', 'M', 0, 'zurdo', '2023-10-27'),
(5, 'Mirta', 'Legrand', '1', 'lachiqui@gmail.com', '11092392', 'Buenos Aires', '1923-04-25', 'F', 0, 'vejez', '2023-10-27'),
(6, 'Tiziana', 'Corvalan', '48527624', 'corvalantiziana9@gmail.com', '2664731516', 'Barrio 123 viviendas, Manzana 233 casa 03', '2008-05-20', 'F', 0, 'No', '2024-07-04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultados`
--

CREATE TABLE `resultados` (
  `id_Resultado` int(11) NOT NULL,
  `id_Muestra` int(11) NOT NULL,
  `id_Determinacion` int(11) NOT NULL,
  `id_Orden` int(11) NOT NULL,
  `valor_final` varchar(50) NOT NULL,
  `fecha_resultado` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resultados`
--

INSERT INTO `resultados` (`id_Resultado`, `id_Muestra`, `id_Determinacion`, `id_Orden`, `valor_final`, `fecha_resultado`) VALUES
(5, 44, 1, 8, '3.0', '2024-06-25 20:32:22'),
(6, 44, 1, 8, '3.0', '2024-06-25 20:32:55'),
(7, 44, 1, 8, '3.0', '2024-06-25 20:33:20'),
(8, 44, 1, 8, '3.0', '2024-06-25 20:34:25'),
(9, 44, 1, 8, '2', '2024-06-25 20:36:49'),
(10, 44, 1, 8, '2', '2024-06-25 20:37:47'),
(11, 45, 7, 8, '0.2', '2024-06-25 20:38:17'),
(12, 45, 7, 8, '0.2', '2024-06-25 20:39:51'),
(13, 45, 7, 8, '0.2', '2024-06-25 20:40:12'),
(14, 48, 1, 8, '2.70', '2024-07-04 22:38:31'),
(15, 49, 2, 10, '500', '2024-07-04 22:38:40'),
(21, 44, 1, 8, '30 segundos', '2024-07-25 03:25:12'),
(22, 44, 12, 8, '5000000 millones/µL', '2024-07-29 16:36:17'),
(23, 50, 4, 3, '32 mmol/L', '2024-07-29 21:15:27'),
(24, 50, 10, 3, '123 g/dL', '2024-07-29 21:15:40'),
(25, 51, 13, 3, '1233 mg/dL', '2024-07-29 21:23:37'),
(26, 45, 2, 8, '322 mmol/L', '2024-07-31 22:51:25'),
(27, 46, 13, 8, '543543 UI/L', '2024-07-31 22:51:32'),
(28, 47, 14, 8, '5445 mg/dL', '2024-07-31 22:54:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_Usuario` int(11) NOT NULL,
  `Nombre_Usuario` varchar(50) DEFAULT NULL,
  `Rol` varchar(50) DEFAULT NULL,
  `Correo_Electronico` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_Usuario`, `Nombre_Usuario`, `Rol`, `Correo_Electronico`, `Password`) VALUES
(2, 'admin', 'admin', 'admin@gmail.com', '$2b$10$T6h9GFr3t0gUDUF3j6DUvuZto3KT/kFtmBW2rYN0SII6na7bc5GJC'),
(3, 'Juan Perez', 'tecnico', 'juan@gmail.com', '$2b$10$bUS0aYvPkcj5lsE45uyxeuiXXQBXMIah1VlM5zXMIOdjp.jbjhRrO'),
(4, 'Mauro Corvalan', 'recepcionista', 'mauro@gmail.com', '$2b$10$W6tbqwsmw67NaMDIndowBuDJ3XJfIxEZcIoNmUW5oPPEU/dmleRGO'),
(5, 'jose', 'bioquimico', 'jose@gmail.com', '$2b$10$hbumPUmxZs4huDPsBECm5eg3ud2ZkpRQv5ESv1zQ.QiH1.gY/9REW'),
(6, 'Facundo', 'recepcionista', 'facu@gmail.com', '$2b$10$dasB/IkIrDiz9UM4h3lH6.7DBEeJprqhW0MWl6IJfdZ2lQ/12zm.a');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `valoresreferencia`
--

CREATE TABLE `valoresreferencia` (
  `id_ValorReferencia` int(11) NOT NULL,
  `id_Determinacion` int(11) NOT NULL,
  `Valor_Referencia_Minimo` decimal(10,2) DEFAULT NULL,
  `Valor_Referencia_Maximo` decimal(10,2) DEFAULT NULL,
  `Sexo` varchar(10) DEFAULT NULL,
  `Edad_Minima` int(11) DEFAULT NULL,
  `Edad_Maxima` int(11) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `valoresreferencia`
--

INSERT INTO `valoresreferencia` (`id_ValorReferencia`, `id_Determinacion`, `Valor_Referencia_Minimo`, `Valor_Referencia_Maximo`, `Sexo`, `Edad_Minima`, `Edad_Maxima`, `estado`) VALUES
(1, 1, 1.24, 5.00, 'M', 5, 12, 1),
(2, 2, 1.00, 100.00, 'M', 1, 70, 1),
(3, 3, 12.00, 22.00, 'M', 1, 70, 1),
(4, 7, 0.00, 1.00, 'M', 4, 70, 1),
(5, 12, 4350000.00, 5350000.00, 'M', 14, 60, 1),
(6, 12, 4000000.00, 4999999.98, 'F', 5, 14, 1),
(7, 13, 123.00, 123123.00, 'M', 3, 25, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id_Auditoria`),
  ADD KEY `id_Usuario` (`id_Usuario`);

--
-- Indices de la tabla `determinaciones`
--
ALTER TABLE `determinaciones`
  ADD PRIMARY KEY (`id_Determinacion`),
  ADD KEY `id_Examen` (`id_Examen`),
  ADD KEY `fk_valoresreferencia` (`id_ValorReferencia`);

--
-- Indices de la tabla `examen`
--
ALTER TABLE `examen`
  ADD PRIMARY KEY (`id_examen`);

--
-- Indices de la tabla `muestras`
--
ALTER TABLE `muestras`
  ADD PRIMARY KEY (`id_Muestra`),
  ADD KEY `fk_Pacientes_Muestras` (`id_Paciente`),
  ADD KEY `fk_ordenes_trabajo_muestras` (`id_Orden`);

--
-- Indices de la tabla `ordenes_examenes`
--
ALTER TABLE `ordenes_examenes`
  ADD PRIMARY KEY (`id_OrdenExamen`),
  ADD KEY `id_orden` (`id_Orden`),
  ADD KEY `id_examen` (`id_examen`);

--
-- Indices de la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  ADD PRIMARY KEY (`id_Orden`),
  ADD KEY `fk_Pacientes_OrdenesTrabajo` (`id_Paciente`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id_paciente`);

--
-- Indices de la tabla `resultados`
--
ALTER TABLE `resultados`
  ADD PRIMARY KEY (`id_Resultado`),
  ADD KEY `id_Muestra` (`id_Muestra`),
  ADD KEY `id_Determinacion` (`id_Determinacion`),
  ADD KEY `id_Orden` (`id_Orden`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_Usuario`);

--
-- Indices de la tabla `valoresreferencia`
--
ALTER TABLE `valoresreferencia`
  ADD PRIMARY KEY (`id_ValorReferencia`),
  ADD KEY `id_Determinacion` (`id_Determinacion`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id_Auditoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `determinaciones`
--
ALTER TABLE `determinaciones`
  MODIFY `id_Determinacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `examen`
--
ALTER TABLE `examen`
  MODIFY `id_examen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=216;

--
-- AUTO_INCREMENT de la tabla `muestras`
--
ALTER TABLE `muestras`
  MODIFY `id_Muestra` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `ordenes_examenes`
--
ALTER TABLE `ordenes_examenes`
  MODIFY `id_OrdenExamen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  MODIFY `id_Orden` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id_paciente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `resultados`
--
ALTER TABLE `resultados`
  MODIFY `id_Resultado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_Usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `valoresreferencia`
--
ALTER TABLE `valoresreferencia`
  MODIFY `id_ValorReferencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`id_Usuario`) REFERENCES `usuarios` (`id_Usuario`);

--
-- Filtros para la tabla `determinaciones`
--
ALTER TABLE `determinaciones`
  ADD CONSTRAINT `determinaciones_ibfk_1` FOREIGN KEY (`id_Examen`) REFERENCES `examen` (`id_examen`),
  ADD CONSTRAINT `fk_valoresreferencia` FOREIGN KEY (`id_ValorReferencia`) REFERENCES `valoresreferencia` (`id_ValorReferencia`);

--
-- Filtros para la tabla `muestras`
--
ALTER TABLE `muestras`
  ADD CONSTRAINT `fk_Pacientes_Muestras` FOREIGN KEY (`id_Paciente`) REFERENCES `pacientes` (`id_paciente`),
  ADD CONSTRAINT `fk_ordenes_trabajo_muestras` FOREIGN KEY (`id_Orden`) REFERENCES `ordenes_trabajo` (`id_Orden`),
  ADD CONSTRAINT `muestras_ibfk_1` FOREIGN KEY (`id_Paciente`) REFERENCES `pacientes` (`id_paciente`);

--
-- Filtros para la tabla `ordenes_examenes`
--
ALTER TABLE `ordenes_examenes`
  ADD CONSTRAINT `ordenes_examenes_ibfk_1` FOREIGN KEY (`id_Orden`) REFERENCES `ordenes_trabajo` (`id_Orden`),
  ADD CONSTRAINT `ordenes_examenes_ibfk_2` FOREIGN KEY (`id_examen`) REFERENCES `examen` (`id_examen`);

--
-- Filtros para la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  ADD CONSTRAINT `fk_Pacientes_OrdenesTrabajo` FOREIGN KEY (`id_Paciente`) REFERENCES `pacientes` (`id_paciente`);

--
-- Filtros para la tabla `resultados`
--
ALTER TABLE `resultados`
  ADD CONSTRAINT `resultados_ibfk_1` FOREIGN KEY (`id_Muestra`) REFERENCES `muestras` (`id_Muestra`),
  ADD CONSTRAINT `resultados_ibfk_2` FOREIGN KEY (`id_Determinacion`) REFERENCES `determinaciones` (`id_Determinacion`),
  ADD CONSTRAINT `resultados_ibfk_3` FOREIGN KEY (`id_Orden`) REFERENCES `ordenes_trabajo` (`id_Orden`);

--
-- Filtros para la tabla `valoresreferencia`
--
ALTER TABLE `valoresreferencia`
  ADD CONSTRAINT `valoresreferencia_ibfk_1` FOREIGN KEY (`id_Determinacion`) REFERENCES `determinaciones` (`id_Determinacion`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
