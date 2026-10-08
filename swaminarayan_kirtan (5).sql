-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 21, 2026 at 11:51 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `swaminarayan_kirtan`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins_roles`
--

CREATE TABLE `admins_roles` (
  `id` bigint UNSIGNED NOT NULL,
  `subadmin_id` int NOT NULL,
  `module` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `view_access` tinyint NOT NULL DEFAULT '0',
  `edit_access` tinyint NOT NULL DEFAULT '0',
  `full_access` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `is_custom` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `type`, `value`, `is_custom`, `created_by`, `created_at`, `updated_at`) VALUES
(595, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"બ્રહ્માનંદ સ્વામી\",\"en\":\"Brahmanand swami\"}', 0, 1, '2026-09-18 07:58:24', '2026-09-19 01:41:17'),
(596, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"પ્રેમાનંદ સ્વામી\",\"en\":\"Pramanand swami\"}', 0, 1, '2026-09-18 08:01:17', '2026-09-19 01:40:32'),
(597, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"નિષ્કુળાનંદસ્વામી\",\"en\":\"Nishkulananda swami\"}', 0, 1, '2026-09-18 08:02:32', '2026-09-19 01:40:01'),
(598, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"દેવાનંદ સ્વામી\",\"en\":\"Devanand swami\"}', 0, 1, '2026-09-18 08:03:04', '2026-09-19 01:38:14'),
(599, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"મુક્તાનંદ સ્વામી\",\"en\":\"Muktanand swami\"}', 0, 1, '2026-09-18 08:07:30', '2026-09-19 01:37:47'),
(600, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"ભૂમાનંદ સ્વામી\",\"en\":\"Bhumanand swami\"}', 0, 1, '2026-09-18 08:07:58', '2026-09-19 01:37:19'),
(601, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"અવિનાશાનંદ સ્વામી\",\"en\":\"Avinashanand swami\"}', 0, 1, '2026-09-18 08:08:32', '2026-09-19 01:36:53'),
(602, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"જગદીશાનંદ સ્વામી\",\"en\":\"Jagadishanand swami\"}', 0, 1, '2026-09-18 08:12:31', '2026-09-19 01:35:51'),
(603, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"દયાનંદ સ્વામી\",\"en\":\"Dayanand Swami\"}', 0, 1, '2026-09-18 08:12:54', '2026-09-19 01:34:50'),
(604, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"પુર્ણાનંદ સ્વામી\",\"en\":\"Purnanand swami\"}', 0, 1, '2026-09-18 08:13:52', '2026-09-19 01:32:48'),
(605, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"મંજુકેશાનંદ સ્વામી\",\"en\":\"Manjukeshanand swami\"}', 0, 1, '2026-09-18 08:14:41', '2026-09-19 01:32:14'),
(607, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"કૃષ્ણાનંદ સ્વામી\",\"en\":\"Karshnanand swami\"}', 0, 1, '2026-09-18 08:17:05', '2026-09-19 01:29:18'),
(608, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"જ્ઞાનજીવનદાસજી સ્વામી-કુંડળ\",\"en\":\"Gyanjivandasji Swami -Kundal\"}', 0, 1, '2026-09-18 08:20:08', '2026-09-19 01:27:13'),
(609, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"શ્રી વિહારીલાલજી મહારાજ\",\"en\":\"Shri viharilalaji maharaja\"}', 0, 1, '2026-09-18 08:20:37', '2026-09-19 01:21:23'),
(610, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"શ્રી અયોધ્યાપ્રસાદજી મહારાજ\",\"en\":\"Shri ayodhyaprasadaji maharaja\"}', 0, 1, '2026-09-18 08:24:19', '2026-09-19 01:20:11'),
(611, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"દલપતરામજી\",\"en\":\"Dalapataramaji\"}', 0, 1, '2026-09-18 08:24:47', '2026-09-19 01:19:28'),
(612, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"માવદાનજી રત્નું\",\"en\":\"Mavadanaji ratnun\"}', 0, 1, '2026-09-18 08:25:31', '2026-09-19 01:17:46'),
(613, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"નારાયણદાસજી\",\"en\":\"Narayanadasaji\"}', 0, 1, '2026-09-18 08:25:58', '2026-09-19 01:16:33'),
(614, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"ત્રિભુવન વ્યાસ\",\"en\":\"Tribhuvan vyasa\"}', 0, 1, '2026-09-18 08:26:43', '2026-09-19 01:16:01'),
(615, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"મનમોહન\",\"en\":\"Manamohana\"}', 0, 1, '2026-09-18 08:28:06', '2026-09-19 01:14:06'),
(616, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"લક્ષ્મીનારાયણદાસજી સ્વામી\",\"en\":\"Lakshminarayanadasaji swami\"}', 0, 1, '2026-09-18 08:28:32', '2026-09-19 01:13:33'),
(617, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"કીર્તનપ્રિય-(રચયિતા)\",\"en\":\"Kirtanapriya-(rachayita)\"}', 0, 1, '2026-09-18 08:29:17', '2026-09-19 01:12:57'),
(618, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"નરસિંહ કવિ\",\"en\":\"Narasinh kavi\"}', 0, 1, '2026-09-18 08:30:09', '2026-09-19 01:12:04'),
(619, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"જ્ઞાનાનંદ સ્વામી\",\"en\":\"Gyananand swami\"}', 0, 1, '2026-09-18 08:30:27', '2026-09-19 01:11:06'),
(620, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"ધ્યાનાનંદ સ્વામી\",\"en\":\"Dhyananand swami\"}', 0, 1, '2026-09-18 09:26:19', '2026-09-19 01:09:59'),
(622, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"ત્યાગાનંદ સ્વામી\",\"en\":\"Tyaganand swami\"}', 0, 1, '2026-09-19 00:30:02', '2026-09-19 01:08:56'),
(623, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"ધર્માનંદ સ્વામી\",\"en\":\"Dharmanand swami\"}', 0, 1, '2026-09-19 00:30:24', '2026-09-19 01:08:21'),
(624, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"વૈષ્ણવાનંદ સ્વામી\",\"en\":\"Vaishnavanand swami\"}', 0, 1, '2026-09-19 00:30:54', '2026-09-19 01:07:46'),
(625, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"યોગાનંદ સ્વામી\",\"en\":\"Yoganand swami\"}', 0, 1, '2026-09-19 00:31:20', '2026-09-19 00:59:31'),
(626, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"સિદ્ધાનંદ સ્વામી\",\"en\":\"Siddhanand swami\"}', 0, 1, '2026-09-19 00:31:55', '2026-09-19 00:59:56'),
(627, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"સંતકીર્તન સ્વામી\",\"en\":\"SantKirtan swami\"}', 0, 1, '2026-09-19 00:35:26', '2026-09-19 00:51:01'),
(628, '{\"en\":\"Creator\",\"gu\":\"રચયિતા\"}', '{\"gu\":\"હરિભાઈ દેસાઈ - ઓલિયા\",\"en\":\"Haribhai Desai - oliya\"}', 0, 1, '2026-09-19 00:36:09', '2026-09-19 00:37:28'),
(629, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"નવમી, નોમ\",\"en\":\"Navami, noma\"}', 0, 1, '2026-09-19 02:22:10', '2026-09-19 02:33:11'),
(630, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"દિવાળી\",\"en\":\"Diwali\"}', 0, 1, '2026-09-19 02:22:30', '2026-09-19 02:32:46'),
(631, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"હોળી\",\"en\":\"Holi\"}', 0, 1, '2026-09-19 02:22:56', '2026-09-19 02:32:14'),
(632, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"શાકોત્સવ\",\"en\":\"Shakotsava\"}', 0, 1, '2026-09-19 02:23:35', '2026-09-19 02:31:52'),
(633, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"રંગ\",\"en\":\"Ranga\"}', 0, 1, '2026-09-19 02:23:56', '2026-09-19 02:31:23'),
(634, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"પૂનમ\",\"en\":\"Punama\"}', 0, 1, '2026-09-19 02:24:31', '2026-09-19 02:30:46'),
(635, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"હિંડોળા, ડોલ, ડોલો ,ઝૂલો,\",\"en\":\"Hindola, dol, dolo ,zhulo\"}', 0, 1, '2026-09-19 02:25:20', '2026-09-19 02:30:16'),
(636, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"શરદ\",\"en\":\"Sharada\"}', 0, 1, '2026-09-19 02:25:54', '2026-09-19 02:29:20'),
(637, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"રાસોત્સવ\",\"en\":\"Rasotsava\"}', 0, 1, '2026-09-19 02:27:00', '2026-09-19 02:34:13'),
(638, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"પ્રભાતિયા\",\"en\":\"Prabhatiya\"}', 0, 1, '2026-09-19 02:27:27', '2026-09-19 02:28:07'),
(640, '{\"en\":\"Place\",\"gu\":\"સ્થળ\"}', '{\"en\":\"Junagadh -jirnadurga\",\"gu\":\"જુનાગઢ -જીર્ણદુર્ગ\"}', 0, 1, '2026-09-19 03:27:25', '2026-09-19 03:45:42'),
(641, '{\"en\":\"Place\",\"gu\":\"સ્થળ\"}', '{\"en\":\"Bhuj - kachchha\",\"gu\":\"ભુજ - કચ્છ\"}', 0, 1, '2026-09-19 03:29:45', '2026-09-19 03:44:52'),
(642, '{\"en\":\"Place\",\"gu\":\"સ્થળ\"}', '{\"en\":\"Gomati\",\"gu\":\"ગોમતી\"}', 0, 1, '2026-09-19 03:30:23', '2026-09-19 03:43:35'),
(643, '{\"en\":\"Place\",\"gu\":\"સ્થળ\"}', '{\"en\":\"Dwaraka\",\"gu\":\"દ્વારકા\"}', 0, 1, '2026-09-19 03:32:46', '2026-09-19 03:43:24'),
(644, '{\"en\":\"Place\",\"gu\":\"સ્થળ\"}', '{\"en\":\"Shankhodvara\",\"gu\":\"શંખોદ્વાર\"}', 0, 1, '2026-09-19 03:34:23', '2026-09-19 03:42:38'),
(645, '{\"en\":\"Place\",\"gu\":\"સ્થળ\"}', '{\"en\":\"Aaranbhada\",\"gu\":\"આરંભડા\"}', 0, 1, '2026-09-19 03:34:58', '2026-09-19 03:41:46'),
(646, '{\"en\":\"Place\",\"gu\":\"સ્થળ\"}', '{\"en\":\"Narayanaghat\",\"gu\":\"નારાયણઘાટ\"}', 0, 1, '2026-09-19 03:36:03', '2026-09-19 03:41:20'),
(647, '{\"en\":\"Place\",\"gu\":\"સ્થળ\"}', '{\"en\":\"Dharmakulano utaro\",\"gu\":\"ધર્મકુલનો ઉતારો\"}', 0, 1, '2026-09-19 03:36:47', '2026-09-19 03:40:39'),
(648, '{\"en\":\"Place\",\"gu\":\"સ્થળ\"}', '{\"en\":\"Aksharadham, svadhama\",\"gu\":\"અક્ષરધામ, સ્વધામ\"}', 0, 1, '2026-09-19 03:37:28', '2026-09-19 03:39:42'),
(649, '{\"en\":\"Place\",\"gu\":\"સ્થળ\"}', '{\"en\":\"Ghela nadi ,unmataganga ,khalakhaliyo\",\"gu\":\"ઘેલા નદી ,ઉન્મતગંગા ,ખળખળીયો\"}', 0, 1, '2026-09-19 03:38:36', '2026-09-19 03:39:06'),
(668, '{\"en\":\"Kirtan Type\",\"gu\":\"કીર્તન પ્રકાર\"}', '{\"en\":\"Sakhi\",\"gu\":\"સાખી\"}', 1, 1, '2026-09-19 12:14:36', '2026-09-19 12:28:50'),
(672, '{\"gu\":\"કીર્તન પ્રકાર\",\"en\":\"Kirtan Type\"}', '{\"gu\":\"દુહા-કુંડલીયા\",\"en\":\"Duha-kundaliya\"}', 1, 1, '2026-09-19 13:01:15', '2026-09-19 13:01:50'),
(682, '{\"en\":\"Kirtan Type\",\"gu\":\"કીર્તન પ્રકાર\"}', '{\"en\":\"Chandravala\",\"gu\":\"ચંદ્રાવળા\"}', 1, 1, '2026-09-19 13:38:34', '2026-09-19 13:39:18'),
(684, '{\"gu\":\"કીર્તન પ્રકાર\",\"en\":\"Kirtan Type\"}', '{\"gu\":\"છંદ\",\"en\":\"Chhanda\"}', 1, 1, '2026-09-19 13:41:12', '2026-09-19 13:41:35'),
(685, '{\"en\":\"Adjective\",\"gu\":\"વિશેષણ\"}', '{\"en\":\"Bahurupa\",\"gu\":\"પ્રગટ\"}', 0, 1, '2026-09-19 13:47:24', '2026-09-20 03:49:01'),
(686, '{\"en\":\"Adjective\",\"gu\":\"વિશેષણ\"}', '{\"en\":\"Alaukika\",\"gu\":\"અલૌકિક\"}', 0, 1, '2026-09-19 13:47:51', '2026-09-19 13:51:49'),
(687, '{\"en\":\"Adjective\",\"gu\":\"વિશેષણ\"}', '{\"en\":\"Jadugara\",\"gu\":\"જાદુગર\"}', 0, 1, '2026-09-19 13:48:15', '2026-09-19 13:52:18'),
(688, '{\"en\":\"Adjective\",\"gu\":\"વિશેષણ\"}', '{\"en\":\"Bhaktadhina\",\"gu\":\"ભક્તાધીન\"}', 0, 1, '2026-09-19 13:49:08', '2026-09-19 13:53:19'),
(689, '{\"en\":\"Adjective\",\"gu\":\"વિશેષણ\"}', '{\"en\":\"Bahunami\",\"gu\":\"બહુનામી\"}', 0, 1, '2026-09-19 13:49:41', '2026-09-19 13:54:23'),
(690, '{\"en\":\"Adjective\",\"gu\":\"વિશેષણ\"}', '{\"en\":\"Bahurupa\",\"gu\":\"પ્રગટ\"}', 0, 1, '2026-09-19 13:50:02', '2026-09-19 13:54:59'),
(691, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"gu\":\"નૃત્યકલા\",\"en\":\"Nartyakala\"}', 0, 1, '2026-09-19 13:56:01', '2026-09-21 09:53:29'),
(692, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"gu\":\"વચનામૃત\",\"en\":\"Vachanamrut\"}', 0, 1, '2026-09-19 14:08:48', '2026-09-21 09:53:36'),
(693, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"gu\":\"ફૂલ\",\"en\":\"Fula\"}', 0, 1, '2026-09-19 14:09:15', '2026-09-21 09:53:40'),
(694, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"gu\":\"શ્વેત, સફેદ, ધોળા\",\"en\":\"Shvet, safed, dhola\"}', 0, 1, '2026-09-19 14:09:53', '2026-09-21 09:53:43'),
(695, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"gu\":\"લાલ ,રાતું\",\"en\":\"Lal ,ratun\"}', 0, 1, '2026-09-19 14:10:31', '2026-09-21 09:53:49'),
(696, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"gu\":\"લીલા-રંગ\",\"en\":\"Lila-ranga\"}', 0, 1, '2026-09-19 14:12:07', '2026-09-21 09:53:52'),
(697, '{\"en\":\"Book\",\"gu\":\"પુસ્તક\"}', '{\"en\":\"HariSmruti\",\"gu\":\"હરિસ્મૃતિ\"}', 0, 1, '2026-09-19 14:19:45', '2026-09-19 14:20:10'),
(698, '{\"en\":\"Book\",\"gu\":\"પુસ્તક\"}', '{\"en\":\"Kirtanavali\",\"gu\":\"કિર્તનાવલી\"}', 0, 1, '2026-09-19 14:20:40', '2026-09-19 14:21:06'),
(699, '{\"en\":\"Book\",\"gu\":\"પુસ્તક\"}', '{\"gu\":\"કીર્તનમાળા-૨\",\"en\":\"Kirtanmala-2\"}', 0, 1, '2026-09-19 14:21:36', '2026-09-19 14:21:56'),
(700, '{\"en\":\"Book\",\"gu\":\"પુસ્તક\"}', '{\"en\":\"Kirtanmala-1\",\"gu\":\"કીર્તનમાળા-૧\"}', 0, 1, '2026-09-19 14:22:29', '2026-09-19 14:22:53'),
(701, '{\"en\":\"Book\",\"gu\":\"પુસ્તક\"}', '{\"gu\":\"કીર્તનમાળા-૩\",\"en\":\"Kirtanmala-3\"}', 0, 1, '2026-09-19 14:23:12', '2026-09-19 14:23:54'),
(702, '{\"en\":\"Bhav\",\"gu\":\"ભાવ\"}', '{\"en\":\"Mahima\",\"gu\":\"મહિમા\"}', 0, 1, '2026-09-19 14:25:21', '2026-09-19 14:35:41'),
(703, '{\"en\":\"Bhav\",\"gu\":\"ભાવ\"}', '{\"en\":\"Bal Lila\",\"gu\":\"બાળ લીલા\"}', 0, 1, '2026-09-19 14:25:43', '2026-09-19 14:34:29'),
(704, '{\"en\":\"Bhav\",\"gu\":\"ભાવ\"}', '{\"en\":\"Lila Bhakti\",\"gu\":\"લીલા ભક્તિ\"}', 0, 1, '2026-09-19 14:26:18', '2026-09-19 14:30:37'),
(705, '{\"en\":\"Bhav\",\"gu\":\"ભાવ\"}', '{\"en\":\"Murti Varnan\",\"gu\":\"મૂર્તિ વર્ણન\"}', 0, 1, '2026-09-19 14:26:45', '2026-09-19 14:30:06'),
(706, '{\"en\":\"Bhav\",\"gu\":\"ભાવ\"}', '{\"en\":\"Stuti\",\"gu\":\"સ્તુતિ\"}', 0, 1, '2026-09-19 14:27:08', '2026-09-19 14:27:33'),
(707, '{\"en\":\"Name\",\"gu\":\"નામ\"}', '{\"gu\":\"લીલા, ચરિત્ર\",\"en\":\"Lila, charitra\"}', 0, 1, '2026-09-19 14:40:38', '2026-09-19 14:41:11'),
(708, '{\"gu\":\"વિવેચન\",\"en\":\"Vivechan\"}', '{\"gu\":\"ભાવાર્થઃ- ભક્ત ભગવાનને વિનવે છે કે અંતકાળે આવી સંભાળી લેજો શામળા. હે પ્રભુ! અમારા અવગુણ સામે જોશો નહીં. “મારા જનને અંતકાળે, જરૂર મારે આવવું, બિરૂદ મારું એ ન બદલે, તે સર્વેજનને જણાવવું.” એ બિરૂદ પ્રમાણે સ્વામી પ્રભુજીને ભલાંમણ કરે છે, કે “હે અધમના ઉદ્ધારક! કરુણાનાં સિંધુ ! તમે તમારું બિરુદ પાળજો. ફક્ત અર્ધનામ ઉચ્ચાર કરનાર ગજને ગ્રાહના મુખથી છોડાવ્યો. બસ એવી રીતે હે સુંદરવર શામળા ! તમે જલ્દી આવો, હું તમારી અનિમેષનયને વાટ જોઉ છું. સ્નેહભાવે “નારાયણ” એવા પુત્રનો પોકાર કરનાર અજામિલનો ઉદ્ધાર પણ આપે કર્યો છે. અર્થાત અંતકાળે એવા અલ્પજ્ઞ જીવોની પણ સંભાળ તમે લીધી છે. તો શું મારી સંભાળ નહીં લો ? હે પ્રભુ ! અમારે તો એક તમારો જ આધાર છે. વળી દોહ્યલી વેળામાં, એટલે કે દુઃખદ સમયે અમે કોની આશા કરીએ ? કોને શરણે જઈએ ? આપના વિના અન્ય કોઈ સ્વરૂપમાં ભરોસો બેસતો જ નથી. માટે આપ જ અમારો આધાર છો. અમારી ગતિ છો. અને અમારે ઠરવાનું ઠામ છો. માટે એવું વિચારી વ્હેલા આવી આ દાસને તેડી આપની પાસે લઈ લો પ્રભુ, II૧ થી ૪ II રહસ્યઃ- પ્રસ્તુત પદમાં કવિની હૈયાવરાળ શબ્દે શબ્દે ઝરે છે. પ્રાર્થના નિખાલસતાના ભાવે રજૂ કરાઈ છે. ભગવાન એકવાર પોતાનો હાથ ઝાલશે પછી છોડી નહીં દે એવી કવિને ખાતરી છે. ભગવાનના બિરુદ ઉપર કવિને ઊંડો ભરોસો છે. કાવ્યમાં કવિની ભાવાભિવ્યક્તિ આકર્ષક છે. શબ્દોમાં કોમળતા, ૠજુતા, અને મધુરતા સહજપણે ઊતરી આવે છે. પદોનો રાગ મેવાડો છે. મેવાડો રાગ વિરહપ્રધાન છે. મેવાડો રાગ વધુમાં વધુ લાંબા ઢાળથી ગવાય છે. અંતિમ ઘડીનો શ્વાસ પણ લાંબો હોય છે. જેને લોકો એક દંડો શ્વાસ કહે છે. આ રાગ ગાવામાં પણ શ્વાસને વધુ ઘૂંટવો પડે છે. એટલે કવિની રાગ પસંદગી પણ ઉચિત છે. વળી, પ્રસ્તુત પદના ચોથા પદમાં ભક્તની ભાવાત્મક અરજી ભગવાને સાંભળી અને મુક્તમુનિની અંતકાળે સાર લીધી છે. તેની ખાતરી આ શબ્દોથી થાય છે. “ભલેને પધાર્યા રે ગિરિધર ગાજતા રે, લીધી છેલછબીલે મારી સાર.” આમ, અનેક શબ્દોથી પ્રસ્તુત પ્રસંગે જ આ કીર્તન રચાણું છે. એવું નક્કી થાય છે. શબ્દો વિરહ અને વિનંતી પ્રધાન છે. ઢાળ સહેલો છે. અને તાલ કહરવા છે.\",\"en\":\"Bhakta bhagwan ne vinve chhe ke antkale aavi sambhali lejo shamla. He prabhu! Amara avgun same josho nahi. “Mara janne antkale, jarur mare aavvu, birud maru e na badle, te sarvejanne janavvu.” E birud pramane swami prabhuji ne bhalaman kare chhe, ke “He adham na uddharak! Karuna na sindhu! Tame tamaru birud paljo. Fakt ardhnam uchchar karnar gaj ne grah na mukh thi chhodavyo. Bas evi rite he sundarvar shamla! Tame jaldi aavo, hu tamari animeshnayane vat jou chhu. Snehbhave “Narayan” eva putra no pokar karnar ajamil no uddhar pan aape karyo chhe. Arthat antkale eva alpadnya jivo ni pan sambhal tame lidhi chhe. To shu mari sambhal nahi lo? He prabhu! Amare to ek tamaro ja aadhar chhe. Vali dohyali vela ma, etle ke dukhad samaye ame koni aasha karie? Kone sharne jaie? Aapna vina anya koi swarup ma bharoso besto ja nahi. Maate aap ja amaro aadhar chho. Amari gati chho. Ane amare tharvanu tham chho. Maate evu vichari vhela aavi aa das ne tedi aapni pase lai lo prabhu, ||1 thi 4|| Rahasya:- Prastut pad ma kavi ni haiyavaral shabde shabde jhare chhe. Prarthana nikhalasata na bhave raju karai chhe. Bhagwan ekvar potano hath jhalis pachhi chhodi nahi de evi kavi ne khatri chhe. Bhagwan na birud upar kavi ne undo bharoso chhe. Kavya ma kavi ni bhavabhivyakti aakarshak chhe. Shabdo ma komalta, rujuta, ane madhurta sahajpane utri aave chhe. Pado no rag mevado chhe. Mevado rag virahpradhan chhe. Mevado rag vadhu ma vadhu lamba dhal thi gavay chhe. Antim ghadi no shvas pan lambo hoy chhe. Jene loko ek dando shvas kahe chhe. Aa rag gava ma pan shvas ne vadhu ghutvo pade chhe. Etle kavi ni rag pasandgi pan uchit chhe. Vali, prastut pad na chautha pad ma bhakta ni bhavatmak arji bhagwane sambhali ane muktamuni ni antkale sar lidhi chhe. Teni khatri aa shabdo thi thay chhe. “Bhalene padharya re giridhar gajta re, lidhi chelchhabile mari sar.” Aam, anek shabdo thi prastut prasange ja aa kirtan rachanu chhe. Evu nakki thay chhe. Shabdo virah ane vinanti pradhan chhe. Dhal sahelo chhe. Ane tal kaharva chhe.\"}', 1, 1, '2026-09-19 22:44:02', '2026-09-19 22:46:57'),
(709, '{\"gu\":\"ઉત્પત્તિ\",\"en\":\"Origin\"}', '{\"gu\":\"ઉત્પત્તિઃ- સંવત ૧૮૮૬ જેઠ વદિ ૧૦ ના રોજ અનંત બ્રહ્મનિષ્ઠ ભક્તોના પ્રાણઆધાર એવા પરબ્રહ્મ પરમાત્મા ભગવાન સ્વામીનારાયણે પંચભૌતિક દેહનો ત્યાગ કર્યો. જીવનું જીવન જતાં અનેક ભક્તોના જીવનમાં કારમો ઘા લાગ્યો. પ્રાણ વિના પૂંજા ડોડિયા અને મહારાજને અખંડ ધારનારી માણકી ઘોડીએ મહારાજનાં તેરમાના દિવસે જ પ્રાણ છોડ્યા. સદ્ગુરુ મુક્તાનંદસ્વામી સારાયે સત્સંગની ‘મા’ કહેવાતા. પરંતુ બાપનું ઓઢણું બેટા ઉપરથી દૂર થતાં ‘મા’ નું જ��વન ઝેર થઈ ગયું. મહારાજ સ્વધામ સિધાવ્યા પછી સ્વામી જીવનથી ઉદાસ થઈ ગયા. એક પળ પણ એમને કલ્પસમ લાગવા માંડી. તીક્ષ્ણ ધારદાર ભાલા શરીરમાં ભોંકાય અને જે વેદના થાય, એવી અધિક વેદના ખાનપાનાદિક ભોગથી સ્વામીને થવા લાગી. ચિત્ત ક્યાંય ચોંટતું નથી. ગોપાળાનંદસ્વામી અને રઘુવીરજી મહારાજના આગ્રહથી સ્વામી અનીચ્છાએ લઘુઆહાર કરે છે. પણ મન મહારાજને મળવા મથી રહ્યું છે. વાતની વાતમાં સ્વામી ગાઈ ઊઠે છે. કે ‘ક્યારે હવે દેખું, હરિ હસતા મારા મંદિરમાં વસતા.’ શ્રીજી મહારાજ ધામમાં સિધાવ્યાને આજે દોઠ માસ થવા આવ્યો છે. ૧૮૮૬ ની અષાડ વદિ-૧૧ ની સવારનો સમય છે. સૌના અંતરમાં આજે અવનવા વિચારો અને અપશુકનો થઈ રહ્યાં છે. સૂરજનારાયણ પણ ભારેખમ થયા છે. ધૂંધળી અવસ્થામાં દશેય દિશાઓ નિસ્તેજ જણાય છે. વહેલી સવારની ગાયો ભાંભરી રહી છે. કૂતરાઓ દાદાની ડેલી આગળ આવી ઊંચુ મોં રાખી રડી રહ્યાં છે. પગ નીચેથી પૃથ્વી સરી જતી હોય તેવો અનુભવ સૌને થાય છે. એવા સમયે ગોપીનાથજી મહારાજની શણગાર આરતી બાદ દર્દીલા દિલમાંથી નીકળતો કરુણભીનો અવાજ સૌને સંભળાયો. ‘મેરે તો તુમ એક હી એક આધારા.’ આજે તોતેર વર્ષની વયના માંદગીભર્યા શરીરવાળા મુક્તાનંદસ્વામી જેમ પાણી વિના માછલી તરફડે તેમ પ્રભુ વિના વલવલી રહ્યા છે. બધા સંતો-ભક્તો મંદિરમાં એકત્રિત થઈ ગયા છે. સૌના હૈયા કકળી ઊઠ્યાં છે કે બાપ તો ગયા અને આ ‘મા’ પણ ચાલી. સૌ સ્વામીને વિનવી રહ્યા છે, કે ‘સ્વામી! આપ તો ધીરજના ડુંગર છો. સારાયે સત્સંગની આપ ‘મા’ છો. ‘મા’ જો ધીરજ છોડી દે તો દીકરાની શી દશા થાય? સ્વામી ! આપના સાન્નિધ્યથી સમગ્ર સત્સંગને શાતા વળે છે. માટે આપ ધામમાં જવાની ઉતાવળ ન કરો સ્વામી !” પરંતુ ઉદાસ બનેલા મુક્તાનંદ સ્વામી તો શ્રીજી મહારાજે વ.ગ.મ.-૫૮ માં કરેલ આજ્ઞા પ્રમાણે કલમ હાથમાં લઈને અંતિમ કીર્તન લખતા જાય છે. અને ગાતા જાય છે. ‘અંતકાળે આવી રે સંભાળી લેજો શ્યામળા.” એક પદ લખાણું, બીજું લખાણૂં, ત્રીજું અને ચોથું પદ લખવા જાય છે. ત્યાં તો ધ્રૂજતા હાથમાંથી કલમ નીચે સરી પડી. એટલે નિત્યાનંદસ્વામીએ કલમ પોતાના હાથમાં લઈ અંતસમયે સ્ફૂરતા શબ્દોને નોંધી લીધા. અને મુક્તાનંદસ્વામીની પાસે બેસીને કહ્યું, કે “સ્વામી ! તમારો અધૂરો રહેલો ધર્માખ્યાનનો ગ્રંથ હું પૂરો કરીશ અને રઘુવીરજી મહારાજને વડોદરામાં પધરાવીશ.” એમ કહી સ્વામીના શરીરે હાથ ફેરવવા લાગ્યા. જીવનભર શ્રીહરિની આજ્ઞા અણીશુદ્ધ પાળતાં પાળતાં પ્રભુભક્તિનાં પદો ગાતાં-ગાતાં અને ઈષ્ટદેવનાં લીલાચરિત્રો છેલ્લી ઘડી સુધી લખતાં થકા મુક્તાનંદસ્વામી શ્રીહરિના ધામમાં સિધાવ્યા. ભક્તો, પ્રસ્તુત પદ છે મુક્તાનંદસ્વામીના અંતિમ આર્તનાદની છેલ્લી પ્રસાદી.\",\"en\":\"utpatti- sanvat ૧૮૮૬ jeth vadi ૧ na roj anant brahmanishth bhaktona pranaaadhar aeva parabrahm paramatma bhagavan svaminarayane panchabhautik dehano tyag karyo. jivanun jivan jatan anek bhaktona jivanaman karamo gha lagyo. pran vina punja dodiya ane maharajane akhand dharanari manaki ghodiae maharajanan teramana divase j pran chhodya. sadguru muktanandasvami saraye satsangani ‘ma’ kahevata. parantu bapanun odhanun beta uparathi dur thatan ‘ma’ nun ja��van zher thai gayun. maharaj svadham sidhavya pachhi svami jivanathi udas thai gaya. aek pala pan aemane kalpasam lagava mandi. tikshn dharadar bhala shariraman bhonkay ane je vedana thay, aevi adhik vedana khanapanadik bhogathi svamine thava lagi. chitt kyany chontatun nathi. gopalanandasvami ane raghuviraji maharajana aagrahathi svami anichchhaae laghuaahar kare chhe. pan man maharajane malava mathi rahyun chhe. vatani vataman svami gai uthe chhe. ke ‘kyare have dekhun, hari hasata mara mandiraman vasata.’ shriji maharaj dhamaman sidhavyane aaje doth mas thava aavyo chhe. ૧૮૮૬ ni ashad vadi-૧૧ ni savarano samay chhe. sauna antaraman aaje avanava vicharo ane apashukano thai rahyan chhe. surajanarayan pan bharekham thaya chhe. dhundhali avasthaman dashey dishao nistej janay chhe. vaheli savarani gayo bhanbhari rahi chhe. kutarao dadani deli aagala aavi unchu mon rakhi radi rahyan chhe. pag nichethi parthvi sari jati hoy tevo anubhav saune thay chhe. aeva samaye gopinathaji maharajani shanagar aarati bad dardila dilamanthi nikalato karunabhino avaj saune sanbhalayo. ‘mere to tum aek hi aek aadhara.’ aaje toter varshani vayana mandagibharya shariravala muktanandasvami jem pani vina machhali tarafade tem prabhu vina valavali rahya chhe. badha santo-bhakto mandiraman aekatrit thai gaya chhe. sauna haiya kakali udhyan chhe ke bap to gaya ane aa ‘ma’ pan chali. sau svamine vinavi rahya chhe, ke ‘svami! aap to dhirajana dungar chho. saraye satsangani aap ‘ma’ chho. ‘ma’ jo dhiraj chhodi de to dikarani shi dasha thaya? svami ! aapana sannidhyathi samagr satsangane shata vale chhe. mate aap dhamaman javani utavala n karo svami !” parantu udas banela muktanand svami to shriji maharaje va.ga.ma.-૫૮ man karel aagya pramane kalam hathaman laine antim kirtan lakhata jay chhe. ane gata jay chhe. ‘antakale aavi re sanbhali lejo shyamala.” aek pad lakhanun, bijun lakhanun, trijun ane chothun pad lakhava jay chhe. tyan to dhrujata hathamanthi kalam niche sari padi. aetale nityanandasvamiae kalam potana hathaman lai antasamaye sfurata shabdone nondhi lidha. ane muktanandasvamini pase besine kahyun, ke “svami ! tamaro adhuro rahelo dharmakhyanano granth hun puro karish ane raghuviraji maharajane vadodaraman padharavisha.” aem kahi svamina sharire hath feravava lagya. jivanabhar shriharini aagya anishuddh palatan palatan prabhubhaktinan pado gatan-gatan ane ishtadevanan lilacharitro chhelli ghadi sudhi lakhatan thaka muktanandasvami shriharina dhamaman sidhavya. bhakto, prastut pad chhe muktanandasvamina antim aartanadani chhelli prasadi.\"}', 1, 1, '2026-09-19 22:48:29', '2026-09-19 22:49:20'),
(710, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"en\":\"Paracha\",\"gu\":\"પરચા\"}', 0, 1, '2026-09-20 03:34:42', '2026-09-21 09:53:58'),
(711, '{\"gu\":\"પ્રસંગ\",\"en\":\"Event\"}', '{\"gu\":\"તેડવા\",\"en\":\"Tedava\"}', 0, 1, '2026-09-20 03:49:01', '2026-09-20 03:49:01'),
(712, '{\"gu\":\"પ્રસંગ\",\"en\":\"Event\"}', '{\"gu\":\"જન્મ, જયંતી\",\"en\":\"Janm, jayanti\"}', 0, 1, '2026-09-20 03:49:01', '2026-09-20 03:49:01'),
(713, '{\"gu\":\"પ્રસંગ\",\"en\":\"Event\"}', '{\"en\":\"Sud, shukla\",\"gu\":\"સુદ, શુક્લ\"}', 0, 1, '2026-09-20 03:49:01', '2026-09-20 03:49:01'),
(714, '{\"gu\":\"પ્રસંગ\",\"en\":\"Event\"}', '{\"gu\":\"ચૈત્ર\",\"en\":\"Chaitra\"}', 0, 1, '2026-09-20 03:49:01', '2026-09-20 03:49:01'),
(715, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"gu\":\"હિન્દી\",\"en\":\"Hindi\"}', 0, 1, '2026-09-21 01:46:32', '2026-09-21 09:54:03'),
(716, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"en\":\"Sharanagati, aasharo\",\"gu\":\"શરણાગતિ, આશરો\"}', 0, 1, '2026-09-21 04:13:22', '2026-09-21 09:54:08'),
(717, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"en\":\"Karuna,karpa,daya,upakara\",\"gu\":\"કરુણા,કૃપા,દયા,ઉપકાર\"}', 0, 1, '2026-09-21 04:13:22', '2026-09-21 09:54:13'),
(718, '{\"en\":\"Adjective\",\"gu\":\"વિશેષણ\"}', '{\"gu\":\"અધમ ઉદ્ધારણ, પતિતપાવન, ગરીબ નિવાજ, દીનબંધુ\",\"en\":\"Adham uddharan, patitapavan, garib nivaj, dinabandhu\"}', 0, 1, '2026-09-21 04:13:22', '2026-09-21 04:13:22'),
(719, '{\"en\":\"Adjective\",\"gu\":\"વિશેષણ\"}', '{\"en\":\"Bhaktavatsala\",\"gu\":\"ભક્તવત્સલ\"}', 0, 1, '2026-09-21 04:13:22', '2026-09-21 04:13:22'),
(720, '{\"en\":\"Adjective\",\"gu\":\"વિશેષણ\"}', '{\"gu\":\"દયાનિધિ,દયાસાગર,દયાળુ\",\"en\":\"Dayanidhi,dayasagar,dayalu\"}', 0, 1, '2026-09-21 04:13:22', '2026-09-21 04:13:22'),
(721, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"en\":\"Avasara\",\"gu\":\"અવસર\"}', 0, 1, '2026-09-21 04:13:22', '2026-09-21 04:13:22'),
(723, '{\"gu\":\"વિશેષ નામ\",\"en\":\"Name\"}', '{\"gu\":\"બિરુદ, પણ, ટેક, પ્રતિજ્ઞા,બોલ, વરદાન\",\"en\":\"Birud, pan, tek, pratigya,bol, varadana\"}', 0, 1, '2026-09-21 04:32:52', '2026-09-21 04:32:52'),
(724, '{\"gu\":\"પુસ્તક\",\"en\":\"Book\"}', '{\"gu\":\"કિર્તન દિવાળી\",\"en\":\"Kirtan Dipavali\"}', 0, 1, '2026-09-21 04:39:25', '2026-09-21 04:39:25'),
(725, '{\"gu\":\"ભાવ\",\"en\":\"Bhav\"}', '{\"en\":\"Prathana\",\"gu\":\"પ્રાર્થના\"}', 0, 1, '2026-09-21 04:39:25', '2026-09-21 04:39:25'),
(726, '{\"en\":\"Adjective\",\"gu\":\"વિશેષણ\"}', '{\"en\":\"Sarvopari\",\"gu\":\"સર્વોપરી\"}', 0, 1, '2026-09-21 04:49:18', '2026-09-21 04:49:18'),
(727, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"gu\":\"આનંદ,હર્ષ,હરખ\",\"en\":\"Aanand,harsh,harakha\"}', 0, 1, '2026-09-21 04:49:18', '2026-09-21 04:49:18'),
(728, '{\"en\":\"Name\",\"gu\":\"વિશેષ નામ\"}', '{\"en\":\"Prapti, milan,melap\",\"gu\":\"પ્રાપ્તિ, મિલન,મેળાપ,\"}', 0, 1, '2026-09-21 04:49:18', '2026-09-21 04:49:18'),
(732, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"en\":\"Hanumanaji\",\"gu\":\"હનુમાનજી\"}', 0, 1, '2026-09-21 05:17:21', '2026-09-21 05:17:21'),
(733, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"વદ, કૃષ્ણપક્ષ\",\"en\":\"Vad, karshnapaksha\"}', 0, 1, '2026-09-21 05:17:21', '2026-09-21 05:17:21'),
(734, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"en\":\"Chaudas, chaturdashi\",\"gu\":\"ચૌદસ, ચતુર્દશી\"}', 0, 1, '2026-09-21 05:17:21', '2026-09-21 05:17:21'),
(735, '{\"en\":\"Event\",\"gu\":\"પ્રસંગ\"}', '{\"gu\":\"આસો\",\"en\":\"Aaso\"}', 0, 1, '2026-09-21 05:17:21', '2026-09-21 05:17:21');

-- --------------------------------------------------------

--
-- Table structure for table `category_pad`
--

CREATE TABLE `category_pad` (
  `id` bigint UNSIGNED NOT NULL,
  `pad_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category_pad`
--

INSERT INTO `category_pad` (`id`, `pad_id`, `category_id`, `created_at`, `updated_at`) VALUES
(490, 244, 595, '2026-09-19 20:16:40', '2026-09-19 20:16:40'),
(491, 244, 638, '2026-09-19 20:16:40', '2026-09-19 20:16:40'),
(492, 244, 707, '2026-09-19 20:16:40', '2026-09-19 20:16:40'),
(493, 245, 598, '2026-09-20 06:38:45', '2026-09-20 06:38:45'),
(494, 245, 708, '2026-09-20 06:38:45', '2026-09-20 06:38:45'),
(495, 245, 709, '2026-09-20 06:38:45', '2026-09-20 06:38:45'),
(496, 246, 711, '2026-09-20 09:19:01', '2026-09-20 09:19:01'),
(497, 246, 712, '2026-09-20 09:19:01', '2026-09-20 09:19:01'),
(498, 246, 713, '2026-09-20 09:19:01', '2026-09-20 09:19:01'),
(499, 246, 714, '2026-09-20 09:19:01', '2026-09-20 09:19:01'),
(500, 246, 685, '2026-09-20 09:19:01', '2026-09-20 09:19:01'),
(501, 246, 710, '2026-09-20 09:19:01', '2026-09-20 09:19:01'),
(502, 247, 600, '2026-09-21 07:16:03', '2026-09-21 07:16:03'),
(503, 247, 715, '2026-09-21 07:17:39', '2026-09-21 07:17:39'),
(504, 248, 600, '2026-09-21 07:19:24', '2026-09-21 07:19:24'),
(505, 248, 715, '2026-09-21 07:19:24', '2026-09-21 07:19:24'),
(506, 249, 600, '2026-09-21 07:29:18', '2026-09-21 07:29:18'),
(507, 249, 715, '2026-09-21 07:29:18', '2026-09-21 07:29:18'),
(508, 250, 600, '2026-09-21 07:31:06', '2026-09-21 07:31:06'),
(509, 250, 715, '2026-09-21 07:31:06', '2026-09-21 07:31:06'),
(510, 252, 613, '2026-09-21 09:26:37', '2026-09-21 09:26:37'),
(511, 253, 599, '2026-09-21 09:43:22', '2026-09-21 09:43:22'),
(512, 253, 716, '2026-09-21 09:43:22', '2026-09-21 09:43:22'),
(513, 253, 717, '2026-09-21 09:43:22', '2026-09-21 09:43:22'),
(514, 253, 718, '2026-09-21 09:43:22', '2026-09-21 09:43:22'),
(515, 253, 719, '2026-09-21 09:43:22', '2026-09-21 09:43:22'),
(516, 253, 720, '2026-09-21 09:43:22', '2026-09-21 09:43:22'),
(517, 253, 721, '2026-09-21 09:43:22', '2026-09-21 09:43:22'),
(518, 254, 723, '2026-09-21 10:02:52', '2026-09-21 10:02:52'),
(519, 254, 698, '2026-09-21 10:02:52', '2026-09-21 10:02:52'),
(520, 254, 599, '2026-09-21 10:02:52', '2026-09-21 10:02:52'),
(521, 255, 599, '2026-09-21 10:09:25', '2026-09-21 10:09:25'),
(522, 255, 724, '2026-09-21 10:09:25', '2026-09-21 10:09:25'),
(523, 255, 725, '2026-09-21 10:09:25', '2026-09-21 10:09:25'),
(524, 256, 597, '2026-09-21 10:19:18', '2026-09-21 10:19:18'),
(525, 256, 726, '2026-09-21 10:19:18', '2026-09-21 10:19:18'),
(526, 256, 727, '2026-09-21 10:19:18', '2026-09-21 10:19:18'),
(527, 256, 728, '2026-09-21 10:19:18', '2026-09-21 10:19:18'),
(529, 257, 596, '2026-09-21 10:47:21', '2026-09-21 10:47:21'),
(530, 257, 732, '2026-09-21 10:47:21', '2026-09-21 10:47:21'),
(531, 257, 733, '2026-09-21 10:47:21', '2026-09-21 10:47:21'),
(532, 257, 734, '2026-09-21 10:47:21', '2026-09-21 10:47:21'),
(533, 257, 735, '2026-09-21 10:47:21', '2026-09-21 10:47:21');

-- --------------------------------------------------------

--
-- Table structure for table `contact_submissions`
--

CREATE TABLE `contact_submissions` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason_for_contact` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','read','resolved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `languages`
--

CREATE TABLE `languages` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `languages`
--

INSERT INTO `languages` (`id`, `code`, `name`, `created_at`, `updated_at`) VALUES
(1, 'en', 'English', '2026-04-28 04:12:00', '2026-08-07 05:17:32'),
(3, 'gu', 'ગુજરાતી', '2026-08-07 05:17:12', '2026-08-26 07:01:17');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_04_22_102130_create_roles_table', 1),
(2, '2026_04_22_105858_create_languages_table', 2),
(3, '2026_04_28_092121_create_users_table', 3),
(4, '2026_04_22_112057_create_categories_table', 4),
(5, '2026_04_22_112418_create_kirtans_table', 5),
(6, '2026_04_22_112437_create_pads_table', 6),
(7, '2026_04_22_112635_create_pad_media_table', 7),
(8, '2026_04_22_114322_create_user_favorite_pads_table', 8),
(9, '2026_04_22_114443_create_settings_table', 9),
(10, '2026_04_22_114454_create_pages_table', 10),
(11, '2026_04_24_102103_create_contact_submissions_table', 11),
(12, '2014_10_12_100000_create_password_reset_tokens_table', 12),
(13, '2019_12_14_000001_create_personal_access_tokens_table', 12),
(14, '2026_04_30_095852_create_category_pad_table', 12),
(15, '2026_05_04_064139_create_category_pad_table', 13),
(16, '2026_08_04_055922_make_kirtans_title_nullable', 14),
(17, '2026_08_04_102829_make_kirtan_title_nullable', 15),
(19, '2026_08_06_085028_drop_column_from_pads_table', 16),
(20, '2026_08_07_110710_make_title_translatable_in_pads_table', 17),
(21, '2026_08_07_111558_add_title_translations_to_pads_table', 17),
(22, '2026_08_10_051705_create_sessions_table', 17),
(23, '2026_08_10_083721_make_pads_and_categories_translatable', 18),
(25, '2026_08_17_044501_create_admins_roles_table', 19),
(26, '2026_08_17_054550_create_permissions_table', 20),
(27, '2026_08_17_054600_create_role_permission_table', 20),
(28, '2026_08_18_091404_change_name_to_json_in_users_table', 21),
(29, '2026_08_20_070131_add_name_translations_to_roles_table', 22),
(30, '2026_08_20_070406_convert_roles_name_to_json', 23),
(31, '2026_09_09_092407_add_raga_to_pad_media_table', 24),
(32, '2026_09_14_085954_add_is_custom_to_categories_table', 25),
(33, '2026_09_16_110810_add_file_name_to_pad_media_table', 26),
(34, '2026_09_16_113555_add_youtube_url_to_pad_media_table', 26),
(35, '2026_09_17_120100_make_file_url_nullable_in_pad_media_table', 26),
(36, '2026_09_20_082616_make_media_type_nullable_on_pad_media_table', 27);

-- --------------------------------------------------------

--
-- Table structure for table `pads`
--

CREATE TABLE `pads` (
  `id` bigint UNSIGNED NOT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `title` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `status` enum('save','draft') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `establish_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pads`
--

INSERT INTO `pads` (`id`, `created_by`, `title`, `value`, `status`, `establish_date`, `created_at`, `updated_at`) VALUES
(244, 1, '{\"en\":\"Antarpat kholo hari hamshe hasi bolo\",\"gu\":\"અંતરપટ ખોલો હરિ હમસે હસી બોલો\"}', '{\"en\":\"Antarpat kholo Hari Hamse hasi bolo;\\r\\n         Kripake nidhan kan, antar pat kholo...tek\\r\\nNag nathan Nathjine, bandh dyu hindolo;\\r\\n         Natvar chhabi nirakh harkh, nakhungi zhalo...kṛ0 1\\r\\nKanak jadit ponchi kar, mugat shir amolo;\\r\\n         Suthni aru shobhita ati, paharau cholo...kṛ0 r\\r\\nThade nar nar dvaar, kachhuk antar tolo;\\r\\n         Aaye Balbhrat Nath, karuna kar jolo...kṛ0 3\\r\\nUtho Balveer neer, garamse angholo;\\r\\n          Brahmanand paas rakho, seva kaaj golo...kṛ0 4\",\"gu\":\"અંતરપટ ખોલો હરિ હમસે હસી બોલો;\\r\\n         કૃપાકે નિધાન કાન, અંતર પટ ખોલો...ટેક\\r\\nનાગ નાથન નાથજીને, બાંધ દ્યુ હિંડોલો;\\r\\n         નટવર છબી નિરખ હરખ, નાખૂંગી ઝોલો...કૃ૦ ૧\\r\\nકનક જડિત પોંચી કર, મુગટ શિર અમોલો;\\r\\n         સુથની અરુ શોભિત અતિ, પહેરાઉ ચોલો...કૃ૦ ર\\r\\nઠાડે નર નાર દ્વાર, કછુક અંતર તોલો;\\r\\n         આયે બલભ્રાત નાથ, કરુણા કર જોલો...કૃ૦ ૩\\r\\nઉઠો બલવીર નીર, ગરમસે અંઘોલો;\\r\\n          બ્રહ્માનંદ પાસ રખો, સેવા કાજ ગોલો...કૃ૦ ૪\"}', 'draft', '2026-09-20', '2026-09-19 14:46:40', '2026-09-19 14:48:27'),
(245, 1, '{\"gu\":\"અંતકાળે આવી રે મારી, શ્રીઘનશ્યામ કરો સહાય રે\",\"en\":\"Antakāḷe āvī re mārī, shrīghanashyām karo...\"}', '{\"gu\":\"અંતકાળે આવી રે મારી, શ્રીઘનશ્યામ કરો સહાય રે...અંત૦ ૧\\r\\nરોમ કોટિ વીંછીની તનમાં થાય વેદના, કફ જાળે કંઠ રુંધાય છે...અંત૦ ૨\\r\\nશૂધ ન રહે જ્યારે પોતાના શરીરની, તનડાની નાડી તૂટી જાય છે...અંત૦ ૩\\r\\nઘરનાં માણસ જ્યારે ઘેરી બેસે પાસળે, પૂમડું લઈને જળ પાય છે...અંત૦ ૪\\r\\nદેવાનંદ કહે દેહ તજ્યા ટાણે, હૈડું હાલક-ડોલક થાય છે...અંત૦ ૫\",\"en\":\"antakāḷe āvī re mārī, śrīghanaśyām karo sahāy re...ant 0 1\\r\\nrom koṭi vīṁchīnī tanmāṁ thāy vedanā, kaf jāḷe kanṭh ruṁdhāy chē...ant 0 2\\r\\nśūdh na rahe jyāre potānā śarīr nī, tanḍānī nāḍī tūṭī jāy chē...ant 0 3\\r\\ngharnā mānasa jyāre gherī bēsē pāsaḷē, pūmaḍuṁ lāīnē jaḷ pāy chē...ant 0 4\\r\\ndevānanda kehē dēha tajyā ṭāṇē, haīḍuṁ hālaka-ḍōlaka thāy chē...ant 0 5\"}', 'save', '2026-09-20', '2026-09-20 01:08:45', '2026-09-20 01:17:53'),
(246, 1, '{\"gu\":\"આજ અવનીમાં પ્રગટ્યા પોતે પુરુષોત્તમ સ્વામિનારાયણ,,,\",\"en\":\"Aaj avanimaan pragatya pote purushottam...\"}', '{\"gu\":\"આજ અવનીમાં પ્રગટ્યા પોતે પુરુષોત્તમ સ્વામિનારાયણ...શ્રી હરિ૦ ટેક\\r\\n          જેને મોટા મુનિવર ગોતે પુરુષોત્તમ સ્વામિનારાયણ...શ્રી હરિ૦ ૧\\r\\nજેનું અક્ષર બ્રહ્મ એવું ધામ છે, સ્વામી સહજાનંદજી જેનું નામ છે, \\r\\n         તેજ ભક્તિ ધર્મના પુત્ર પુરુષોત્તમ સ્વામિનારાયણ...શ્રી હરિ૦ ૨\\r\\nરામ કૃષ્ણાદિ રૂપ જેણે ધાર્યા, બહુ દુનિયાના દુષ્ટો સંહાર્યા, \\r\\n         કામ ક્રોધાદિ દોષો નિવાર્યા, પુરુષોત્તમ સ્વામિનારાયણ...શ્રી હરિ૦ ૩\\r\\nધર્મ ભકિતનાં રૂપ જેણે સ્થાપ્યાં, મોહ માયાના મુળીયા કાપ્યાં, \\r\\n         પ્રેમી ભક્તોને સુખ બહુ આપ્યાં પુરુષોત્તમ સ્વામિનારાયણ...શ્રી હરિ૦ ૪\\r\\nબહુ પ્રગટ પરચા બતાવ્યા, કઇક ધામમાં જઇને પાછા આવ્યાં\\r\\n         ત્યાંની ચીજો અલૌકિક લાવ્યા, પુરુષોત્તમ સ્વામિનારાયણ...શ્રી હરિ૦ ૫\\r\\nજેને વેદો વદે છે નેતિનેતિ કહી શકે નહીં મહીમાં અથેતી, \\r\\n         થાકે શારદા જશ જેનો કેતી, પુરુષોત્તમ સ્વામિનારાયણ...શ્રી હરિ૦ ૬\\r\\nનિજ ભક્તોને તેડવાને આવે, બેસી વિમાને ધામમાં સીધાવે, \\r\\n         એવો બીજો દયાળુ કોણ કાવે, પુરુષોત્તમ સ્વામિનારાયણ...શ્રી હરિ૦ ૭\\r\\nકીધો પ્રગટનો મહિમાં વિચારી, જેવી પહોંચી મતિ તેમાં મારી, \\r\\n         કહે વર્ણી શ્રીજીને સંભારી, પુરુષોત્તમ સ્વામિનારાયણ...શ્રી હરિ૦ ૮\",\"en\":\"AAj avanimaa pragatya pote purushottam swaminaraayan...shree hari0 tek\\r\\n          jene mota munivar gote purushottam swaminaraayan...shree hari0 1\\r\\njenu akshar brahm evu dhaam chhe, swaami sahajananndji jenu naam chhe,\\r\\n         tej bhakti dharmna putra purushottam swaminaraayan...shree hari0 2\\r\\nraam krishnaadi roop jene dhaarya, bahu duniyaana dushto sanhaarya,\\r\\n         kaam krodhaadi dosho nivaaryaa, purushottam swaminaraayan...shree hari0 3\\r\\ndharma bhaktina roop jene sthaapya, moha mayaana mulya kaapya,\\r\\n         premi bhakto ne sukh bahu aapya purushottam swaminaraayan...shree hari0 4\\r\\nbahu pragat paracha bataavya, keik dhaamamaa jine paachaa aavyaa\\r\\n         tyaanni cheejo alaukik laavyaa, purushottam swaminaraayan...shree hari0 5\\r\\njene vedo vade chhe netineti kahi sake nahi mahimaan apathit, \\r\\n         thaake shaaradaa jash jeno ketii, purushottam swaminaraayan...shree hari0 6\\r\\nnij bhakto ne tedvaane aave, besi vimaane dhaamamaa seedhaave,\\r\\n         evo beejo dayaalu koon kaave, purushottam swaminaraayan...shree hari0 7\\r\\nkIIDho pragatno maheema vichari, jevi pahunchi mati tema maari,\\r\\n         kah e varNi shreejine sambhaari, purushottam swaminaraayan...shree hari0 8\"}', 'save', '2026-09-20', '2026-09-20 03:49:00', '2026-09-20 03:53:01'),
(247, 1, '{\"gu\":\"છબી આયકે ઉર રઇ. સુંદરશ્યામ સનેહિકી...\",\"en\":\"Chhabi aayake ur rai. sundarashyam sanehi...\"}', '{\"gu\":\"છબી આયકે ઉર રઇ, સુંદરશ્યામ સનેહિકી....  ટેક ૧\\r\\n           નખશિખા પર્યંત હમ નિરખી, ચિન્હ સહિત જો કીન સઇ. ર\\r\\nહસત વદન હેરતહે દૃગસે, પ્રીત દેખાવત નિત નઇ.  ૩\\r\\n           મનમોહન કરતા મોસુ બતીયાં, કરહુસે મોર કર ગ્રઇ.  ૪\\r\\nભૂમાનંદ કહે મોકું ભેઠત, શામ સુંદર છતીયાં મેં લઇ.  પ\",\"en\":\"chhabi aayke ur rai, sundarshyaam snehiki....  tek 1\\r\\n           nakhshikha paryant ham nirakhi, chinh sahit jo keen sai. r\\r\\nhasat vadan herathe drgshe, preet dekhavat nit nai.  3\\r\\n           manmohan karta mosu batiyaan, karhuse mor kar grai.  4\\r\\nbhoomanand kahe mokun bhethat, shaam sundar chhathiyaan mein lai.  p\"}', 'save', '2026-09-21', '2026-09-21 01:46:03', '2026-09-21 01:48:39'),
(248, 1, '{\"en\":\"Sudh sanse lin hari nagar nand dulaarene, aay achanak milyo magahumein, natvar nautam vesh dhari...\",\"gu\":\"સુધ સાનસે લિન હરિ નાગર નંદ દુલારેને, આય અચાનક મી...\"}', '{\"en\":\"Sudh sanase lin Hari, Nagar nand dulare ne...tek 1\\r\\nAay achanak milyo magahumein, Natvar nautam vesh dharir\\r\\nDare bhruh kamata chadhayke, drign tir rasahumse bhari 3\\r\\nKorkaleja ghav lagoe, bhitar chhatiyaan chhed kari 4\\r\\nBhumaanand kahe naahi gothe, Shyam binu chit ek dharip\",\"gu\":\"સુધ સાનસે લિન હરિ, નાગર નંદ દુલારેને...ટેક૧\\r\\nઆય અચાનક મીલ્યો મગહુંમેં, નટવર નૌતમ વેશ ધરીર\\r\\nડારે ભ્રુહ કમાંન ચઢાયકે, દૃગન તીર રસહુંસે ભરી૩\\r\\nકોરકલેજા ઘાવ લગોહે, ભીતર છતીયાં છેદ કરી૪\\r\\nભૂમાનંદ કહે નાહિ ગોઠે, શ્યામ બીનું ચિત એક ધરીપ\"}', 'save', '2026-09-21', '2026-09-21 01:49:24', '2026-09-21 02:02:00'),
(249, 1, '{\"gu\":\"અંખી આયકે મોય લગી, જીવન જાદુગારે કી\",\"en\":\"Ankhi aaye ke moy lagi, jeevan jadugare ki\"}', '{\"gu\":\"અંખી આયકે મોય લગી, જીવન જાદુગારે કી...ટેક૦ ૧\\r\\nજાદુગારી અતિશય અનિયાલી, ડારી ગયો મોરી દેખ દૃગી...ર\\r\\nચિત ભેદી જીયરામેં ચોંટી, વે દિનસે મોહ નિંદ ભગી...૩\\r\\nઅબ આરામ હોવ જબ દેખુ, શિર પેચાળી જુત પઘી...૪\\r\\nભૂમાનંદ કહે ભ્રહ યાકે, લાગત મેં રહી હોય થગી...પ\",\"en\":\"Ankhi aaye ke moy lagi, jeevan jadugare ki...tek0 1\\r\\nJadugari atishay aniyaali, daari gayo mori dekh dragi...r\\r\\nChit bhedi jeeyramaan chonti, ve dinse moh nind bhagi...3\\r\\nAb aaraam hov jab dekhu, shir pechaali juta paghi...4\\r\\nBhumaanand kahe bhrah yake, lagat mein rahi hoy thagi...p\"}', 'save', '2026-09-21', '2026-09-21 01:59:18', '2026-09-21 02:00:04'),
(250, 1, '{\"en\":\"Chhabi antar aay basi shamsundar mukh mandhasi...\",\"gu\":\"છબી અંતર આય બસી શામસુંદર મુખ મંદહસી\"}', '{\"en\":\"Chhabi antar aay basi, Shamsundar mukh mandhasi... Tek 1\\r\\n           Bhaal vishaal dekhi dant pankit, til phool shobha chornasi. R\\r\\nPaheri tan jarakasiya jaama, paghiyaan par shirpech kasi. 3\\r\\n           Tora gajara haar hajari, ur anupam rahe lasi. 4\\r\\nBhoomanandke naathki akhiyan, varsat amrutroopi rasi. P\",\"gu\":\"છબી અંતર આય બસી, શામસુંદર મુખ મંદહસી... ટેક ૧\\r\\n           ભાલ વિશાલ દેખી દંત પંકિત, તિલ ફૂલ શોભા ચોરનસી.ર\\r\\nપહેરી તન જરકસીયા જામા, પઘીયાં પર શિરપેચ કસી.૩\\r\\n           તોરા ગજરા હાર હજારી, ઉર અનુપમ રહે લસી.૪\\r\\nભૂમાનંદકે નાથકી અખિયાં, વરસત અમૃતરૂપી રસી.પ\"}', 'save', '2026-09-21', '2026-09-21 02:01:06', '2026-09-21 02:01:52'),
(252, 1, '{\"gu\":\"અંગુઠી આપો અમને અવતારી, તમોને કર જોડી કહીએ\",\"en\":\"Anguthi aapo amane avatari, tamone kar jo\"}', '{\"gu\":\"અંગુઠી આપો અમને અવતારી, તમોને કર જોડી કહીએ...ટેક\\r\\nકર જોડી કહીયેરે તમારાં દાસડીયા છઇએ;\\r\\n          દિયરજી મારા દુઞ્ખડાંના હારી...તમોને૦ ૧\\r\\nદુઞ્ખડાંના હારીરે આપું સુખડી સુખકારી;\\r\\nહું વારી હું વારી તમપર ગુણવંત ગીરધારી...તમોને૦ ૨\",\"en\":\"Anguthi aapo amne avatarī, tamone kar jodi kahiye...tek\\r\\nKar jodi kahiye re tamaraṁ dasadiya chhayē;\\r\\n          Diyarji māra duṅkhaḍāna hārī...tamone 0 1\\r\\nDunḳhaḍāna hārī re āpuṁ sukhḍī sukhkārī;\\r\\nHuṁ vārī huṁ vārī tampar guṇavanta giradhārī...tamone 0 2\"}', 'draft', '2026-09-22', '2026-09-21 03:56:37', '2026-09-21 04:01:07'),
(253, 1, '{\"en\":\"Aa avasar re dayalu daya kari re, talavane\",\"gu\":\"આ અવસર રે દયાળુ દયા કરી રે, ટાળવાને જન્મ મરણના તાપ...\"}', '{\"en\":\"aa avasar re dayaalu daya kari re, taalvaane janm maran naa taap;      \\r\\n     vaahane chadine aavo cho maara vaalma re, naaraayan naamno japtan jaap-1\\r\\nanekne aavya re antasame tedva re, saathe lai sant janano saath;      \\r\\n     aeva to tamara re gun anant apaar chhe re, saambhaltaamaa sarve thaye sanaath-2\\r\\nadhama jaati re odhaari bahu naa rine re, jene ninde shaastra ved puraan;      \\r\\n     gun ne avgun re naath gantaa nathi re, sharane aavyana shyaam sujaan-3\\r\\nkarunaarasane re pragat karyo Kaanji re, karva anek janno uddhaar;      \\r\\n     muktaanandne vaale re mahaasukha aapiyu re, kari nitya navla neh vihaar-4\",\"gu\":\"આ અવસર રે દયાળુ દયા કરી રે, ટાળવાને જન્મ મરણના તાપ;\\r\\n     વાહને ચડીને આવો છો મારા વાલમા રે, નારાયણ નામનો જપતાં જાપ-૧\\r\\nઅનેકને આવ્યા રે અંતસમે તેડવા રે, સાથે લઈ સંત જનનો સાથ;\\r\\n     એવા તો તમારા રે ગુણ અનંત અપાર છે રે, સાંભળતામાં સર્વે થાય સનાથ-૨\\r\\nઅધમ જાતિ રે ઓધારી બહુ નારીને રે, જેને નિંદે શાસ્ત્ર વેદ પુરાણ;\\r\\n     ગુણ ને અવગુણ રે નાથ ગણતા નથી રે, શરણે આવ્યાના શ્યામ સુજાણ-૩\\r\\nકરુણારસને રે પ્રગટ કર્યો કાનજી રે, કરવા અનેક જનનો ઉદ્ધાર;\\r\\n     મુક્તાનંદને વાલે રે મહાસુખ આપિયું રે, કરી નિત્ય નવલા નેહ વિહાર-૪લાલજી ભગત-જ્ઞાન બાગ-વડતાલ\"}', 'save', '2026-09-23', '2026-09-21 04:13:22', '2026-09-21 04:15:05'),
(254, 1, '{\"gu\":\"અંતકાળે આવી રે સંભાળી લેજો શામળા રે,જોશો મા અ\",\"en\":\"Antakāḷe āvī re sambhāḷī lejō śāmaḷā re, jōś...\"}', '{\"gu\":\"અંતકાળે આવી રે સંભાળી લેજો શામળા રે,જોશો મા અમારા અવગુણ શ્યામરે;\\r\\nપણ છે પોતાનું રે પ્રભુજી તમે પાળજો રે;\\r\\n            અધમ ઓધારણ કરુણાના ધામ રે...અંત૦ ૧\\r\\nગજને છોડાવ્યો રે ગ્રાહનાં મુખ થકી રે, કરતાં કાંઈ અરધ નામ ઉચ્ચાર રે;\\r\\nએવી રીતે આવો રે સુંદર શામળા રે;\\r\\n            વાટડી જોઉ છું વારમવાર રે...અંત૦ ૨\\r\\nનારાયણ નામે રે ઓધાર્યો અજામેળને રે, કરતાં તે પુત્રતણો રે પોકાર રે;\\r\\nએવું તે વિચારી રે અલબેલા આવજો રે;\\r\\n            અમારે છે તમારો રે આધાર રે...અંત૦ ૩\\r\\nદોયલી વેળામાં રે દીનાનાથજી રે, કહોને અમે કેની કરીએ આશ રે;\\r\\nમુક્તાનંદના સ્વામી રે સુંદર શામળા રે;\\r\\n            અબળાને તેડી રાખો પાસ રે...અંત૦ ૪\",\"en\":\"antakāḷe āvī re sambhālī lejō śāmaḷā re, jōśō mā āmarā avaguṇa śyāmarē;\\r\\npaṇa chē potānu re prabhujī tamē pāḷjō re;\\r\\n            adham ōdhāraṇ karuṇānā dhāma re...antō 1\\r\\ngajanē chōḍāvyō re grāhanāṃ mukh thakī re, karatā kāṃī aradha nāma uchchāra re;\\r\\nēvī rītē āvō re sundar śāmaḷā re;\\r\\n            vāṭaḍī jōu chuṃ vāramavāra re...antō 2\\r\\nnārāyaṇ nāmē re ōdhāryō ajāmēḷanē re, karatā tē putrataṇō re pōkār re;\\r\\nēvuṁ tē vichārī re alabelā āvajō re;\\r\\n            amarē chē tamārō re ādhār re...antō 3\\r\\ndōyalī vēḷāmāṁ re dīnānāthajī re, kahōnē āme kēnī karīē āśa re;\\r\\nmuktānandnā svāmī re sundar śāmaḷā re;\\r\\n            abaḷānē ṭēḍī rākhō pās re...antō 4\"}', 'save', '2026-09-23', '2026-09-21 04:32:52', '2026-09-21 04:36:32'),
(255, 1, '{\"gu\":\"ભલેને પધાર્યા રે ગિરધર ગાજતા રે, હવે મુને કરી કૃતારથ કાન...\",\"en\":\"Bhalene Padharya Re Girdhar Gajta Re, Have Mune Kari Krutarath kan...\"}', '{\"gu\":\"ભલેને પધાર્યા રે ગિરધર ગાજતા રે, હવે મુને કરી કૃતારથ કાન;\\r\\n            નયણાં ઠરે છે રે નાથને નિરખતાં રે, જેનું નિત્ય ધરીને રહેતા ધ્યાન-૧\\r\\nદુ:ખડાના દા’ડા રે હવે તો દૂર ગયા રે, લીધી છેલછબીલે મારી સાર;\\r\\n            જીવન જોઈને રે જગ જૂઠો થયો રે, તમ સંગ લાગ્યો રંગ એકતાર-૨\\r\\nકમળા સરખી રે કરી મુને કાનજી રે, ગ્રહી ગુણવંતે મારો હાથ;\\r\\n            ભલું મારું ભાગ્ય રે ફળ્યું કોઈ કાળનું રે, પામી પતિ અખિલભુવનનો નાથ-૩\\r\\nઅખંડ સોહાગી રે તમને જે જાણશે રે, માણશે મહાસુખ મોજ અપાર;\\r\\n            મુક્તાનંદ કહે છે રે તમને પરહરી રે, ભવજળ કોઈ ન પામે પાર-૪\",\"en\":\"Bhale ne padharya re giradhar gajta re, have mune kari krutarath kan;             \\r\\n            nayanāṁ thare chhe re nāth ne nirakhtāṁ re, jenũ nity dharīne raheta dhyān-1\\r\\ndu:khḍānā dā’ḍā re have to dūr gayā re, līdhi chhalchhibe le māri sāar;             \\r\\n            jīvan joīne re jag jūṭho thayo re, tam sang lāgyo rang ekatār-2\\r\\nkamalā sarkhī re karī mune kānjī re, grahī guṇavante māro hāth;             \\r\\n            bhalu māru bhāgya re phalyu koi kāḷnu re, pāmi pati akhilabhuvan no nāth-3\\r\\nakhṇḍ sohāgī re tamne je jāṇshe re, māṇshe mahāsukh mojj apar;             \\r\\n            muktānand kahe chhe re tamne parharī re, bhavajal koi na pāme pār-4\"}', 'save', '2026-09-28', '2026-09-21 04:39:25', '2026-09-21 04:40:34'),
(256, 1, '{\"en\":\"Aaj aanand mara uraman, mali mane mah\",\"gu\":\"આજ આનંદ મારા ઉરમાં, મળી મને મહામોંઘી વાતરે\"}', '{\"en\":\"aaj aanand mara uraman, mali mane mahamonghi vatare ।\\r\\nkoti kasht kare hari nav male, te to mane maliya sakshat re;                   aaja ।।૧।।\\r\\nramadaya jamadaya rudi ritashun, malya vali varamavarare ।\\r\\nhete prite nitye sukh aapiyan, te to ke\'tan aave kem par re;                  aaja।।૨।।\\r\\nann jala fala ful panani, aapi aevi prasadi anup re ।\\r\\ncharanani chhap didhi chhatiye, aapyan saran vastr sukharup re;                   aaja ।।૩।।\\r\\naagala bhagat anek thaya, sahyan tene sharire bahu dukh re ।\\r\\ntoy prabhu pragat pamya nahi, pamya pan na\'vyan aavan sukhare;              aaja ।।૪।।\\r\\nkoikane aapi amaravati, koikane pur kailas re ।\\r\\nkoikane satyalok sonpiyun, koikane vaikunthe vas re;                                  aaja ।।૫।।\\r\\njujavan ae dham aapyan janane, joi nishkam sakam re ।\\r\\naaj to adhalak dhalya hari, aapyun sahune aksharadham re;                     aaja ।।૬।।\\r\\nsukh sukh sukh jyan sukh ghanun, te to mukhe ke\'tan n kahevay re ।\\r\\nnishkulanand ae aanandaman, harakhi harakhi gunagay re;                            aaja ।।૭।।\",\"gu\":\"આજ આનંદ મારા ઉરમાં, મળી મને મહામોંઘી વાતરે ।\\r\\n         કોટી કષ્ટ કરે હરિ નવ મળે, તે તો મને મળીયા સાક્ષાત રે;આજ૦ ।।૧।।\\r\\nરમાડયા જમાડયા રૂડી રીતશું, મળ્યા વળી વારમવારરે ।\\r\\n         હેતે પ્રીતે નિત્યે સુખ આપિયાં, તે તો કે\'તાં આવે કેમ પાર રે;આજ૦।।૨।।\\r\\nઅન્ન જળ ફળ ફૂલ પાનની, આપી એવી પ્રસાદી અનૂપ રે ।\\r\\n         ચરણની છાપ દીધી છાતિયે, આપ્યાં સારાં વસ્ત્ર સુખરૂપ રે;આજ૦ ।।૩।।\\r\\nઆગળ ભગત અનેક થયા, સહ્યાં તેણે શરીરે બહુ દુઃખ રે ।\\r\\n         તોય પ્રભુ પ્રગટ પામ્યા નહિ, પામ્યા પણ ના\'વ્યાં આવાં સુખરે;આજ૦ ।।૪।।\\r\\nકોઇકને આપી અમરાવતી, કોઇકને પુર કૈલાસ રે ।\\r\\n         કોઇકને સત્યલોક સોંપિયું, કોઇકને વૈકુંઠે વાસ રે;આજ૦ ।।૫।।\\r\\nજુજવાં એ ધામ આપ્યાં જનને, જોઇ નિષ્કામ સકામ રે ।\\r\\n         આજ તો અઢળક ઢળ્યા હરિ, આપ્યું સહુને અક્ષરધામ રે;આજ૦ ।।૬।।\\r\\nસુખ સુખ સુખ જ્યાં સુખ ઘણું, તે તો મુખે કે\'તાં ન કહેવાય રે ।\\r\\n         નિષ્કુલાનંદ એ આનંદમાં, હરખી હરખી ગુણગાય રે;આજ૦ ।।૭।।\"}', 'save', '2026-09-30', '2026-09-21 04:49:18', '2026-09-21 05:07:24'),
(257, 1, '{\"en\":\"Anjaniputra Mahabalavanta, Tribhuvanma\",\"gu\":\"અંજનીપુત્ર મહાબળવંતા, ત્રિભુવનમાં વિખ્યાત હો...\"}', '{\"en\":\"Anjaniputra Mahabalvanta, Tribhuvanma Vikhyat Ho;\\r\\n         Vinatasut Sam Veg Parakram, Kahi Nav Jaye Vaat Ho...Anjani० ૧\\r\\nSeeta Shodh Same Mahasindhu, Thkhi Gaya Tatkāl Ho;\\r\\n         Baali Jai Raavanki Lanka, Maarya Danav Vikraal Ho...Anjani० ૨\\r\\nVaagi Saang Lakshmanjinee Ranma, Moorchaa Aavi Gai Bhaari Ho;\\r\\n         Sanjeevani Moole Saaru Laavya, Dronaachal Shir Dhaari Ho...Anjani० ૩\\r\\nShokasindhume Bharat Budi Rahya, Kapiye Aavi Chinta Nivaari Ho;\\r\\n         Aavya Ram Raavanne Maari, Premanand Sukhaari Ho...Anjani० ૪\",\"gu\":\"અંજનીપુત્ર મહાબળવંતા, ત્રિભુવનમાં વિખ્યાત હો;\\r\\n         વિનતાસુત સમ વેગ પરાક્રમ, કહી નવ જાયે વાત હો...અંજની૦ ૧\\r\\nસીતા શોધ સમે મહાસિંધુ, ઠેકી ગયા તત્કાળ હો;\\r\\n         બાળી જાઇ રાવણકી લંકા, માર્યા દાનવ વિકરાળ હો...અંજની૦ ૨\\r\\nવાગી સાંગ લક્ષ્મણજીને રણમાં, મૂરછા આવી ગઇ ભારી હો;\\r\\n         સંજીવની મૂળી સારૂ લાવ્યા, દ્રોણાચળ શિર ધારી હો...અંજની૦ ૩\\r\\nશોકસિંધુમેં ભરત બુડી રહ્યા, કપિએ આવી ચિંતા નિવારી હો;\\r\\n         આવ્યા રામ રાવણને મારી, પ્રેમાનંદ સુખકારી હો...અંજની૦ ૪\"}', 'save', '2026-09-13', '2026-09-21 05:17:21', '2026-09-21 05:22:08');

-- --------------------------------------------------------

--
-- Table structure for table `pad_media`
--

CREATE TABLE `pad_media` (
  `id` bigint UNSIGNED NOT NULL,
  `pad_id` bigint UNSIGNED NOT NULL,
  `media_type` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `youtube_url` text COLLATE utf8mb4_general_ci,
  `singer` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `publisher` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `vocalization` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `raga` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `recording_type` enum('live','studio') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `pad_media`
--

INSERT INTO `pad_media` (`id`, `pad_id`, `media_type`, `file_url`, `file_name`, `youtube_url`, `singer`, `publisher`, `vocalization`, `raga`, `recording_type`, `created_at`, `updated_at`) VALUES
(37, 244, 'audio', 'pad-media/6aaeeda890750_1468630441_04 Antar Pat Kholo Hari-BRAHMANAND.mp3', '{\"en\":\"Antarpat kholo hari hamshe hasi bolo\",\"gu\":\"અંતરપટ ખોલો હરિ હમસે હસી બોલો\"}', NULL, '{\"en\":\"Harikarshn patela\",\"gu\":\"હરિકૃષ્ણ પટેલ\"}', '{\"en\":\"Shri svaminarayan mandir,bhuja-kachchha.svaminarayan rod,polis choki same, gujarat,india.fona. ૨૮૩૨ ૨૫૨૩૧/૨૫૩૩૧.\",\"gu\":\"શ્રી સ્વામિનારાયણ મંદિર,ભુજ-કચ્છ.સ્વામિનારાયણ રોડ,પોલીસ ચોકી સામે, gujarat,india.ફોન. ૦૨૮૩૨ ૨૫૦૨૩૧/૨૫૦૩૩૧.\"}', '{\"en\":\"Paranparagat (svarakara)\",\"gu\":\"પરંપરાગત (સ્વરકાર)\"}', '{\"en\":\"Bhupali\",\"gu\":\"ભુપાલી\"}', 'studio', '2026-09-19 14:46:41', '2026-09-19 14:48:27'),
(38, 245, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-20 01:08:46', '2026-09-20 03:28:58'),
(39, 246, 'audio', 'pad-media/6aafa50528f6f_1894866569_L100112010.mp3', '{\"gu\":\"આજ અવનીમાં પ્રગટ્યા પોતે પુરુષોત્તમ સ્વામિનારાયણ\",\"en\":\"Aaj avanimaan pragatya pote purushottam swa..\"}', NULL, '{\"gu\":\"કાંતિભગત\",\"en\":\"Kantibhagata\"}', '{\"gu\":\"શ્રી દેવ ઉત્સવ મંડળ,શ્રી સ્વામિનારાયણ મંદિર,ભુપેન્દ્ર રોડ, રાજકોટ. ગુજરાત ,INDIA. ફોન. નં +91 2232494\",\"en\":\"Shri dev utsav mandala,shri svaminarayan mandir,bhupendr rod, rajakota. gujarat ,INDIA. fona. nan +91 2232494\"}', '{\"gu\":\"પરંપરાગત (સ્વરકાર)\",\"en\":\"Paranparagat (svarakara)\"}', NULL, NULL, '2026-09-20 03:49:03', '2026-09-20 03:53:01'),
(40, 253, 'audio', 'pad-media/6ab0fc3a11135_1665639593_K-17 _ 09 aa avasar re (1).mp3', '{\"en\":\"Aa avasar re dayalu daya kari re, talavane janm m\",\"gu\":\"આ અવસર રે દયાળુ દયા કરી રે, ટાળવાને જન્મ મરણના તાપ\"}', NULL, '{\"en\":\"Lalaji bhagata-gyan baga-vadatala\",\"gu\":\"લાલજી ભગત-જ્ઞાન બાગ-વડતાલ\"}', '{\"en\":\"Kanaji bhagat gyan bag vadatala. fon nan. ૨૬૮ ૨૫૮૯૭૬૭ mo. ૯૯૯૬૭૬૫\",\"gu\":\"કાનજી ભગત જ્ઞાન બાગ વડતાલ. ફોન નં. ૦૨૬૮ ૨૫૮૯૭૬૭ મો. ૯૯૦૯૦૦૬૭૬૫\"}', '{\"en\":\"Lalaji bhagata-gyan baga-vadatal (svarakara)\",\"gu\":\"લાલજી ભગત-જ્ઞાન બાગ-વડતાલ (સ્વરકાર)\"}', NULL, 'studio', '2026-09-21 04:13:22', '2026-09-21 04:15:05'),
(41, 254, 'audio', 'pad-media/6ab100cc58a6e_956317408_084 ANTKALE AAVIRE SHANBHALI LEJO.mp3', '{\"gu\":\"અંતકાળે આવી રે સંભાળી લેજો શામળા રે,જોશો મા અમારા અ\",\"en\":\"Antakāḷe āvī re sambhāḷī lejō śāmaḷā re, jōśō m\"}', NULL, '{\"gu\":\"ચંદુભાઈ રાઠોડ (ગાયક)\",\"en\":\"Chandubhai rathod (gayaka)\"}', '{\"gu\":\"શ્રી સહજાનંદ સંસ્કારધામ મહામંત્રપીઠ ફરેણી જી.રાજકોટ gujarat india phone:-+91-2824-283383/283108/9662517626\",\"en\":\"Shri sahajanand sanskaradham mahamantrapith fareni ji.rajakot gujarat india phone:-+91-2824-283383/283108/9662517626\"}', '{\"gu\":\"પરંપરાગત (સ્વરકાર)\",\"en\":\"Paranparagat (svarakara)\"}', NULL, 'studio', '2026-09-21 04:32:52', '2026-09-21 04:36:32'),
(42, 254, 'audio', 'pad-media/6ab100cc5d910_1833575340_16 Ant Kale Aavire.mp3', '{\"gu\":\"અંતકાળે આવી રે સંભાળી લેજો શામળા રે,જોશો મા અમારા અવ...\",\"en\":\"Antakāḷe āvī re sambhāḷī lejō śāmaḷā re, jōśō\"}', NULL, '{\"gu\":\"જયેશ સોની\",\"en\":\"Jayesh soni\"}', NULL, NULL, NULL, 'studio', '2026-09-21 04:32:52', '2026-09-21 04:36:32'),
(43, 256, 'audio', 'pad-media/6ab106ad2d717_2129005529_107 Aaj re Aanand mara.mp3', '{\"en\":\"Aaj aanand mara uraman, mali mane mahamon\",\"gu\":\"આજ આનંદ મારા ઉરમાં, મળી મને મહામોંઘી વાતરે\"}', 'https://youtu.be/9FHIyF340KQ?si=pZU40JnXqTHnbxgY', '{\"en\":\"Bhajanaprakash swami\",\"gu\":\"ભજનપ્રકાશ સ્વામી\"}', '{\"en\":\"Shri svaminarayan sanskar dham gurukul,halavad rod,ji.surendranagar, mu.dhrangadhra.fona.+૯૧ ૨૭૫૪ ૨૯૩૫૩૫\",\"gu\":\"શ્રી સ્વામિનારાયણ સંસ્કાર ધામ ગુરુકુલ,હળવદ રોડ,જી.સુરેન્દ્રનગર, મુ.ધ્રાંગધ્રા.ફોન.+૯૧ ૨૭૫૪ ૨૯૩૫૩૫\"}', NULL, NULL, NULL, '2026-09-21 04:49:18', '2026-09-21 05:01:05'),
(44, 257, 'audio', 'pad-media/6ab10b39b29fb_71618212_L100101069 (1).mp3', '{\"en\":\"Anjaniputra Mahabalavanta, Tribhuvanma Vik\",\"gu\":\"અંજનીપુત્ર મહાબળવંતા, ત્રિભુવનમાં વિખ્યાત હો\"}', NULL, '{\"en\":\"Jayasukhabhai ranapara\",\"gu\":\"જયસુખભાઈ રાણપરા\"}', '{\"en\":\"Shri dev utsav mandala,shri svaminarayan mandir,bhupendr rod, rajakota. gujarat ,INDIA. fona. nan +91 2232494\",\"gu\":\"શ્રી દેવ ઉત્સવ મંડળ,શ્રી સ્વામિનારાયણ મંદિર,ભુપેન્દ્ર રોડ, રાજકોટ. ગુજરાત ,INDIA. ફોન. નં +91 2232494\"}', '{\"en\":\"Paranparagat (svarakara)\",\"gu\":\"પરંપરાગત (સ્વરકાર)\"}', '{\"en\":\"Sohini\",\"gu\":\"સોહિની\"}', NULL, '2026-09-21 05:17:21', '2026-09-21 05:20:56'),
(45, 257, 'audio', 'pad-media/6ab10b39b931d_2087030037_L100205015.mp3', '{\"en\":\"Anjaniputra Mahabalavanta, Tribhuvanma Vikh\",\"gu\":\"અંજનીપુત્ર મહાબળવંતા, ત્રિભુવનમાં વિખ્યાત હો\"}', NULL, '{\"en\":\"Viren fichadiya\",\"gu\":\"વિરેન ફીચડીયા\"}', '{\"en\":\"Shri dev utsav mandala,shri svaminarayan mandir,bhupendr rod, rajakota. gujarat ,INDIA. fona. nan +91 2232494\",\"gu\":\"શ્રી દેવ ઉત્સવ મંડળ,શ્રી સ્વામિનારાયણ મંદિર,ભુપેન્દ્ર રોડ, રાજકોટ. ગુજરાત ,INDIA. ફોન. નં +91 2232494\"}', '{\"en\":\"Paranparagat (svarakara)\",\"gu\":\"પરંપરાગત (સ્વરકાર)\"}', NULL, NULL, '2026-09-21 05:17:21', '2026-09-21 05:20:56'),
(46, 257, 'video', 'pad-media/6ab10b39bafc4_BAPS - Aaj anand mara urma - desiman909 (480p, h264, youtube).mp4', '{\"gu\":\"BAPS - આજ આનંદ મારા\",\"en\":\"BAPS - Aaj anand mara urma\"}', NULL, NULL, NULL, NULL, NULL, 'studio', '2026-09-21 05:17:21', '2026-09-21 05:21:29');

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` bigint UNSIGNED NOT NULL,
  `page_group` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('published','draft') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
('cexajo3823@prodbits.com', '$2y$12$PkSryMPycjYgBJ0gd8GBReq.H5/UQVlHGE85suUZgTNScol.Y1Tem', '2026-08-26 07:10:59');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `module`, `action`, `display_name`, `created_at`, `updated_at`) VALUES
(38, 'dashboard.view', 'dashboard', 'view', 'View Dashboard', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(39, 'users.view', 'users', 'view', 'View Users', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(40, 'users.create', 'users', 'create', 'Create User', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(41, 'users.edit', 'users', 'edit', 'Edit User', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(42, 'users.delete', 'users', 'delete', 'Delete User', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(43, 'roles.view', 'roles', 'view', 'View Roles', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(44, 'roles.create', 'roles', 'create', 'Create Role', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(45, 'roles.edit', 'roles', 'edit', 'Edit Role', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(46, 'roles.delete', 'roles', 'delete', 'Delete Role', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(47, 'pads.view', 'pads', 'view', 'View Pads', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(48, 'pads.create', 'pads', 'create', 'Create Pad', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(49, 'pads.edit', 'pads', 'edit', 'Edit Pad', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(50, 'pads.delete', 'pads', 'delete', 'Delete Pad', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(51, 'categories.view', 'categories', 'view', 'View Categories', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(52, 'categories.create', 'categories', 'create', 'Create Category', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(53, 'categories.edit', 'categories', 'edit', 'Edit Category', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(54, 'categories.delete', 'categories', 'delete', 'Delete Category', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(55, 'languages.view', 'languages', 'view', 'View Languages', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(56, 'languages.create', 'languages', 'create', 'Create Language', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(57, 'languages.edit', 'languages', 'edit', 'Edit Language', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(58, 'languages.delete', 'languages', 'delete', 'Delete Language', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(59, 'media.view', 'media', 'view', 'View Media', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(60, 'media.create', 'media', 'create', 'Upload Media', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(61, 'media.edit', 'media', 'edit', 'Edit Media', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(62, 'media.delete', 'media', 'delete', 'Delete Media', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(63, 'pages.view', 'pages', 'view', 'View Pages', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(64, 'pages.create', 'pages', 'create', 'Create Page', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(65, 'pages.edit', 'pages', 'edit', 'Edit Page', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(66, 'pages.delete', 'pages', 'delete', 'Delete Page', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(67, 'contacts.view', 'contacts', 'view', 'View Contacts', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(68, 'contacts.create', 'contacts', 'create', 'Create Contact', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(69, 'contacts.edit', 'contacts', 'edit', 'Edit Contact', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(70, 'contacts.delete', 'contacts', 'delete', 'Delete Contact', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(71, 'settings.view', 'settings', 'view', 'View Settings', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(72, 'settings.edit', 'settings', 'edit', 'Edit Settings', '2026-08-26 01:21:15', '2026-08-26 01:21:15'),
(73, 'more.view', 'more', 'view', 'View More Menu', '2026-08-26 01:21:15', '2026-08-26 01:21:15');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(5, 'Admin', '2026-04-28 09:42:00', '2026-08-20 07:15:57'),
(6, 'User', '2026-04-28 09:42:00', '2026-04-28 09:42:00'),
(17, 'xyz', '2026-09-10 06:58:39', '2026-09-10 06:58:39');

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL,
  `permission_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permission`
--

INSERT INTO `role_permission` (`id`, `role_id`, `permission_id`, `created_at`, `updated_at`) VALUES
(17, 6, 47, NULL, NULL),
(18, 6, 51, NULL, NULL),
(19, 6, 59, NULL, NULL),
(25, 17, 39, NULL, NULL),
(26, 17, 38, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('TcqFO51h5MitpBcyXQdXbi0jObTsWFz7DHNY1gx9', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiNXZYNGpZc0hkT0JkYlBMU3hIdlNTZzlaRm53Y2tJTzZVTkFCaTBXaiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czozNzoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2FkbWluL2Rhc2hib2FyZCI7czo1OiJyb3V0ZSI7czoyMDoicm9sZS5kYXNoYm9hcmQuaW5kZXgiO319', 1789991431);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint UNSIGNED NOT NULL,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `setting_group` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `created_at`, `updated_by`, `updated_at`) VALUES
(1, 'app_name', '{\"en\":\"Swaminarayan Kirtan\",\"gu\":\"\\u0ab8\\u0acd\\u0ab5\\u0abe\\u0aae\\u0abf\\u0aa8\\u0abe\\u0ab0\\u0abe\\u0aaf\\u0aa3 \\u0a95\\u0ac0\\u0ab0\\u0acd\\u0aa4\\u0aa8\"}', 'general', '2026-08-21 01:48:54', 1, '2026-08-21 01:48:54'),
(2, 'address', '{\"en\":\"Gandhinagar\",\"gu\":\"\\u0a97\\u0abe\\u0a82\\u0aa7\\u0ac0\\u0aa8\\u0a97\\u0ab0\"}', 'general', '2026-08-21 01:48:54', 1, '2026-09-10 07:22:46'),
(3, 'contact_email', '\"contact@webtwine.com\"', 'general', '2026-08-21 01:48:54', 1, '2026-09-21 03:30:15'),
(4, 'contact_phone', '\"9191919193\"', 'general', '2026-08-21 01:48:54', 1, '2026-08-28 12:36:03'),
(5, 'facebook_url', '\"\"', 'general', '2026-08-21 01:48:54', 1, '2026-08-21 01:48:54'),
(6, 'instagram_url', '\"\"', 'general', '2026-08-21 01:48:54', 1, '2026-08-21 01:48:54'),
(7, 'youtube_url', '\"\"', 'general', '2026-08-21 01:48:54', 1, '2026-08-21 01:48:54'),
(8, 'app_logo', '\"settings\\/logos\\/uL9NHzIXV5CbVLLx6Vfl38LOPAJNICedwlGBBJZE.png\"', 'general', '2026-08-21 01:48:54', 1, '2026-09-19 22:41:19'),
(9, 'mail_mailer', '\"smtp\"', 'general', '2026-08-26 05:18:12', 1, '2026-08-26 05:18:12'),
(10, 'mail_host', '\"smtp.gmail.com\"', 'general', '2026-08-26 05:18:12', 1, '2026-08-26 05:18:12'),
(11, 'mail_port', '\"587\"', 'general', '2026-08-26 05:18:12', 1, '2026-08-26 05:18:12'),
(12, 'mail_username', '\"contact@webtwine.com\"', 'general', '2026-08-26 05:18:12', 1, '2026-09-21 03:30:15'),
(13, 'mail_password', '\"zjvjmghdomhralok\"', 'general', '2026-08-26 05:18:12', 1, '2026-09-21 01:39:57'),
(14, 'mail_encryption', '\"tls\"', 'general', '2026-08-26 05:18:12', 1, '2026-08-26 05:18:12'),
(15, 'mail_from_address', '\"contact@webtwine.com\"', 'general', '2026-08-26 05:18:12', 1, '2026-09-21 03:30:15'),
(16, 'mail_from_name', '\"Swaminarayan Kirtan\"', 'general', '2026-08-26 05:18:12', 1, '2026-09-21 03:29:55'),
(17, 'layout_type', '\"horizontal\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:25:15'),
(18, 'layout_mode', '\"light\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:24:53'),
(19, 'layout_width', '\"fluid\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:24:53'),
(20, 'layout_position', '\"scrollable\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:24:53'),
(21, 'topbar_theme', '\"dark\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:24:53'),
(22, 'sidebar_size', '\"lg\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:24:53'),
(23, 'sidebar_view', '\"default\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:24:53'),
(24, 'sidebar_color', '\"dark\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:24:53'),
(25, 'sidebar_image', '\"none\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:24:53'),
(26, 'sidebar_visibility', '\"show\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:24:53'),
(27, 'preloader', '\"disable\"', 'layout', '2026-09-21 03:24:53', 1, '2026-09-21 03:24:53');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL,
  `language_id` bigint UNSIGNED NOT NULL,
  `name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('blocked','unblocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unblocked',
  `profile` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `theme_mode` enum('dark','light','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `text_size` int NOT NULL DEFAULT '14',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `language_id`, `name`, `email`, `phone`, `password`, `status`, `profile`, `theme_mode`, `text_size`, `email_verified_at`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 5, 3, '{\"en\":\"Daxesh\",\"gu\":\"\\u0aa6\\u0a95\\u0acd\\u0ab7\\u0ac7\\u0ab6\",\"hi\":\"\"}', 'daxsoni21@yopmail.com', '9999999999', '$2y$12$asqjwoYHk0KL7kUNuyUoKeu6.u/PLXS0MVIALbQ1d0IEL.FwLlgpm', 'unblocked', 'admin/logos/0Hx1WnyqIC69wAplAPrExJlhH14TRrZD6gB5E79G.jpg', 'system', 14, NULL, 'EfH07N3UlfrhRHTFHWG8nBJJGlWksbAIxrkGYUJiRW6pmirBx1ZwwIwZWepm', NULL, '2026-09-21 05:24:24'),
(2, 6, 1, '{\"en\":\"rahul\",\"gu\":\"\\u0ab0\\u0abe\\u0ab9\\u0ac1\\u0ab2\"}', 'rahul122@yopmail.com', NULL, '$2y$12$grudImZcS2BoKHrc8n8gx.E1c.w0KNxch23ZzIWn4ZHIEj.NOylda', 'unblocked', NULL, 'system', 14, NULL, NULL, '2026-04-28 05:01:09', '2026-08-20 00:53:37'),
(9, 6, 1, '{\"en\":\"Aarav\",\"gu\":\"\\u0a86\\u0ab0\\u0ab5\"}', 'aarav123@yopmail.com', '9999999990', '$2y$12$vY0PV/MCGAh6xVgbvBMGfuGGenNaQvpiRkoOlsg.VNSV3.af5044e', 'unblocked', 'admin/logos/X4kfwVIGKjUFznYq5U3CabtKtQ4MpkAemmYCZ6wB.jpg', 'system', 14, NULL, 'o8Y5DGR07lD6F9PO0xIyXyQIHSKfenKqptKjCpdc9E07DoVX0kgon2GMrbys', '2026-08-17 00:44:40', '2026-09-21 06:16:10');

-- --------------------------------------------------------

--
-- Table structure for table `user_favorite_pads`
--

CREATE TABLE `user_favorite_pads` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `pad_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_favorite_pads`
--

INSERT INTO `user_favorite_pads` (`id`, `user_id`, `pad_id`, `created_at`, `updated_at`) VALUES
(29, 1, 246, '2026-09-21 02:06:55', '2026-09-21 02:06:55'),
(30, 1, 253, '2026-09-21 04:41:13', '2026-09-21 04:41:13'),
(31, 1, 257, '2026-09-21 05:22:15', '2026-09-21 05:22:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins_roles`
--
ALTER TABLE `admins_roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categories_created_by_foreign` (`created_by`);

--
-- Indexes for table `category_pad`
--
ALTER TABLE `category_pad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_pad_pad_id_foreign` (`pad_id`),
  ADD KEY `category_pad_category_id_foreign` (`category_id`);

--
-- Indexes for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contact_submissions_user_id_foreign` (`user_id`);

--
-- Indexes for table `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `languages_code_unique` (`code`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pads`
--
ALTER TABLE `pads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pads_created_by_foreign` (`created_by`);

--
-- Indexes for table `pad_media`
--
ALTER TABLE `pad_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pad_media_pad_id_foreign` (`pad_id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pages_slug_unique` (`slug`),
  ADD KEY `pages_created_by_foreign` (`created_by`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_unique` (`name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_permission_role_id_foreign` (`role_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_setting_key_unique` (`setting_key`),
  ADD KEY `settings_updated_by_foreign` (`updated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_role_id_foreign` (`role_id`),
  ADD KEY `users_language_id_foreign` (`language_id`);

--
-- Indexes for table `user_favorite_pads`
--
ALTER TABLE `user_favorite_pads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_favorite_pads_user_id_foreign` (`user_id`),
  ADD KEY `user_favorite_pads_pad_id_foreign` (`pad_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins_roles`
--
ALTER TABLE `admins_roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=736;

--
-- AUTO_INCREMENT for table `category_pad`
--
ALTER TABLE `category_pad`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=534;

--
-- AUTO_INCREMENT for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `languages`
--
ALTER TABLE `languages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `pads`
--
ALTER TABLE `pads`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=259;

--
-- AUTO_INCREMENT for table `pad_media`
--
ALTER TABLE `pad_media`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_favorite_pads`
--
ALTER TABLE `user_favorite_pads`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `category_pad`
--
ALTER TABLE `category_pad`
  ADD CONSTRAINT `category_pad_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `category_pad_pad_id_foreign` FOREIGN KEY (`pad_id`) REFERENCES `pads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  ADD CONSTRAINT `contact_submissions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pads`
--
ALTER TABLE `pads`
  ADD CONSTRAINT `pads_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pad_media`
--
ALTER TABLE `pad_media`
  ADD CONSTRAINT `pad_media_pad_id_foreign` FOREIGN KEY (`pad_id`) REFERENCES `pads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pages`
--
ALTER TABLE `pages`
  ADD CONSTRAINT `pages_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `settings`
--
ALTER TABLE `settings`
  ADD CONSTRAINT `settings_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_language_id_foreign` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_favorite_pads`
--
ALTER TABLE `user_favorite_pads`
  ADD CONSTRAINT `user_favorite_pads_pad_id_foreign` FOREIGN KEY (`pad_id`) REFERENCES `pads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_favorite_pads_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
