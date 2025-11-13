-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2025 at 10:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `municipal_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `application_comments`
--

CREATE TABLE `application_comments` (
  `id` int(11) NOT NULL,
  `app_uid` varchar(64) DEFAULT NULL,
  `application_type` varchar(50) NOT NULL,
  `application_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `author_user_id` int(11) NOT NULL,
  `author_role` varchar(20) DEFAULT 'employee',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `application_index`
--

CREATE TABLE `application_index` (
  `app_uid` int(11) NOT NULL,
  `application_type` enum('business','renewal_business','special_sales','cedula','building','electrical','plumbing','fencing','electronics','zoning','mayors') NOT NULL,
  `application_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `application_index`
--

INSERT INTO `application_index` (`app_uid`, `application_type`, `application_id`, `user_id`, `created_at`) VALUES
(1, 'business', 75, 29, '2025-10-16 17:27:34'),
(2, 'electrical', 36, 29, '2025-10-16 17:27:34'),
(3, 'building', 1, 29, '2025-10-16 17:27:34'),
(4, 'plumbing', 1, 29, '2025-10-16 17:27:34'),
(5, 'fencing', 1, 29, '2025-10-16 17:27:34'),
(6, 'electronics', 1, 29, '2025-10-16 17:27:34'),
(7, 'cedula', 18, 29, '2025-10-16 17:27:34'),
(8, 'business', 76, 29, '2025-10-16 19:03:48'),
(9, 'electrical', 37, 29, '2025-10-16 19:03:48'),
(10, 'electrical', 38, 31, '2025-10-24 12:42:38'),
(11, 'electrical', 39, 29, '2025-10-24 12:55:38');

-- --------------------------------------------------------

--
-- Table structure for table `business_activities`
--

CREATE TABLE `business_activities` (
  `id` int(11) NOT NULL,
  `permit_id` int(11) NOT NULL,
  `line_of_business` varchar(200) NOT NULL,
  `units` varchar(20) DEFAULT NULL,
  `capitalization` decimal(15,2) DEFAULT NULL,
  `gross_essential` decimal(15,2) DEFAULT NULL,
  `gross_non_essential` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_activities`
--

INSERT INTO `business_activities` (`id`, `permit_id`, `line_of_business`, `units`, `capitalization`, `gross_essential`, `gross_non_essential`, `created_at`, `updated_at`) VALUES
(83, 77, 'Voluptatum debitis i', 'Eiusmod autem quaera', 0.00, 0.00, 0.00, '2025-10-24 13:51:26', '2025-10-24 13:51:26'),
(84, 78, 'Nostrum et in amet ', 'Assumenda autem cum ', 0.00, 0.00, 0.00, '2025-11-10 13:41:00', '2025-11-10 13:41:00'),
(85, 79, 'Beatae praesentium d', 'Nobis placeat ratio', 0.00, 0.00, 0.00, '2025-11-10 14:14:04', '2025-11-10 14:14:04'),
(86, 80, 'Natus quae sed nihil', 'Maxime iste deleniti', 0.00, 0.00, 0.00, '2025-11-10 14:24:03', '2025-11-10 14:24:03');

-- --------------------------------------------------------

--
-- Table structure for table `business_permits`
--

CREATE TABLE `business_permits` (
  `BusinessP_id` int(11) NOT NULL,
  `application_type` varchar(20) NOT NULL,
  `payment_mode` varchar(20) NOT NULL,
  `application_date` date NOT NULL,
  `tin_no` varchar(20) DEFAULT NULL,
  `registration_no` varchar(50) DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `business_type` varchar(20) NOT NULL,
  `amendment_from` varchar(20) DEFAULT NULL,
  `amendment_to` varchar(20) DEFAULT NULL,
  `tax_incentive` varchar(5) DEFAULT NULL,
  `tax_incentive_entity` varchar(100) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `business_name` varchar(100) NOT NULL,
  `trade_name` varchar(100) DEFAULT NULL,
  `business_address` text NOT NULL,
  `business_postal_code` varchar(10) DEFAULT NULL,
  `business_email` varchar(100) DEFAULT NULL,
  `business_telephone` varchar(20) DEFAULT NULL,
  `business_mobile` varchar(20) DEFAULT NULL,
  `owner_address` text DEFAULT NULL,
  `owner_postal_code` varchar(10) DEFAULT NULL,
  `owner_email` varchar(100) DEFAULT NULL,
  `owner_telephone` varchar(20) DEFAULT NULL,
  `owner_mobile` varchar(20) DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `emergency_email` varchar(100) DEFAULT NULL,
  `business_area` varchar(20) DEFAULT NULL,
  `male_employees` int(11) DEFAULT NULL,
  `female_employees` int(11) DEFAULT NULL,
  `local_employees` int(11) DEFAULT NULL,
  `lessor_name` varchar(100) DEFAULT NULL,
  `lessor_address` text DEFAULT NULL,
  `lessor_phone` varchar(20) DEFAULT NULL,
  `lessor_email` varchar(100) DEFAULT NULL,
  `monthly_rental` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','in-review','in-progress','requirements-completed','ready-for-pickup','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  `filled_up_forms` varchar(255) DEFAULT NULL,
  `sec_dti_cda_certificate` varchar(255) DEFAULT NULL,
  `local_sketch` varchar(255) DEFAULT NULL,
  `sworn_statement_capital` varchar(255) DEFAULT NULL,
  `tax_clearance` varchar(255) DEFAULT NULL,
  `brgy_clearance_business` varchar(255) DEFAULT NULL,
  `cedula` varchar(255) DEFAULT NULL,
  `docu_type` varchar(100) DEFAULT 'Business Permit'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_permits`
--

INSERT INTO `business_permits` (`BusinessP_id`, `application_type`, `payment_mode`, `application_date`, `tin_no`, `registration_no`, `registration_date`, `business_type`, `amendment_from`, `amendment_to`, `tax_incentive`, `tax_incentive_entity`, `last_name`, `first_name`, `middle_name`, `business_name`, `trade_name`, `business_address`, `business_postal_code`, `business_email`, `business_telephone`, `business_mobile`, `owner_address`, `owner_postal_code`, `owner_email`, `owner_telephone`, `owner_mobile`, `emergency_contact`, `emergency_phone`, `emergency_email`, `business_area`, `male_employees`, `female_employees`, `local_employees`, `lessor_name`, `lessor_address`, `lessor_phone`, `lessor_email`, `monthly_rental`, `status`, `created_at`, `updated_at`, `user_id`, `filled_up_forms`, `sec_dti_cda_certificate`, `local_sketch`, `sworn_statement_capital`, `tax_clearance`, `brgy_clearance_business`, `cedula`, `docu_type`) VALUES
(77, 'new', 'semi-annually', '1973-07-01', 'Est et sunt accusant', 'Laudantium voluptas', '1977-05-08', 'cooperative', 'corporation', 'corporation', 'no', '', 'chester', 'dave', 'sumabong', 'Garrison Barron', 'Tanya Buckley', 'Quidem est exercita', 'Nostrud nu', 'jyjasuf@mailinator.com', '+1 (756) 369-7361', 'Est vitae ut repudia', 'Laboris explicabo T', 'Dolore et ', 'kuwig@mailinator.com', '+1 (848) 677-1209', 'Pariatur Ducimus i', 'Octavia Cooper', '+1 (579) 167-3073', 'qulemevaq@mailinator.com', 'Ea voluptas et asper', 4, 30, 36, 'Camden Daugherty', 'Id dolor et minim do', '+1 (355) 542-3975', 'picym@mailinator.com', 6.00, 'approved', '2025-10-24 13:51:26', '2025-10-24 13:51:41', 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit'),
(78, 'new', 'annually', '2009-04-10', 'Officiis officia et ', 'Modi possimus volup', '1983-11-14', 'cooperative', 'single', 'single', 'yes', '', 'Getida', 'Chris', 'Paura', 'Clementine David', 'Liberty Vazquez', 'Omnis unde sed sapie', 'Error even', 'cewocyb@mailinator.com', '+1 (759) 828-9172', 'Magna veritatis numq', 'Explicabo Quisquam ', 'Ut quas ha', 'gyloj@mailinator.com', '+1 (346) 936-9233', 'Nisi sed quae odit a', 'Sylvia Flowers', '+1 (181) 892-3974', 'gafoti@mailinator.com', 'Quia in et ut aliqui', 47, 31, 33, 'Harriet Gibbs', 'Aspernatur cumque do', '+1 (969) 183-7412', 'hexuru@mailinator.com', 9.00, 'requirements-completed', '2025-11-10 13:41:00', '2025-11-10 14:15:10', 31, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit'),
(79, 'new', 'semi-annually', '1974-05-14', 'Adipisci alias at do', 'Dolor repudiandae se', '1972-04-28', 'single', 'corporation', 'single', 'yes', '', 'aldrin', 'toto', 'wa', 'Elaine Pace', 'Rylee Coffey', 'Voluptas dolor deser', 'Ullam fugi', 'zejaz@mailinator.com', '+1 (585) 652-3543', 'Ullam quis nostrud q', 'Odio rerum quis null', 'Ipsam et i', 'vyxajit@mailinator.com', '+1 (187) 445-7511', 'Qui reprehenderit a', 'Asher Watkins', '+1 (971) 377-7322', 'sanoxefa@mailinator.com', 'Molestiae labore in ', 88, 30, 33, 'Nita Blackburn', 'Nam assumenda deleni', '+1 (847) 218-9102', 'pugi@mailinator.com', 1.00, 'requirements-completed', '2025-11-10 14:14:04', '2025-11-10 14:15:12', 34, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit'),
(80, 'new', 'quarterly', '1993-03-19', 'Omnis culpa iure dol', 'Est explicabo Sunt ', '2018-01-23', 'partnership', 'partnership', 'partnership', 'yes', '', 'Ge', 'Chris', 'Pa', 'Florence Levy', 'Jamal Herman', 'Repellendus Minima ', 'Reiciendis', 'nuvosy@mailinator.com', '+1 (683) 151-1792', 'Pariatur Molestias ', 'Excepteur duis at au', 'Exercitati', 'wemofik@mailinator.com', '+1 (466) 584-8106', 'Et rerum quo incidid', 'Brendan Emerson', '+1 (995) 343-1228', 'ximumi@mailinator.com', 'Voluptatem laboris ', 67, 42, 77, 'Brittany Welch', 'Animi quo sed ut au', '+1 (655) 584-4555', 'senujubo@mailinator.com', 9.00, 'in-review', '2025-11-10 14:24:03', '2025-11-13 09:30:08', 35, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `k` varchar(64) NOT NULL,
  `v` varchar(255) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`k`, `v`, `updated_at`) VALUES
('sms_enabled', 'false', '2025-11-13 09:30:45');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_application_requirements`
--

CREATE TABLE `tbl_application_requirements` (
  `requirement_id` int(11) NOT NULL,
  `app_uid` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `application_type` enum('business','renewal_business','special_sales','cedula','building','electrical','plumbing','fencing','electronics','zoning','mayors') NOT NULL,
  `application_id` int(11) NOT NULL,
  `pdf_path` varchar(255) NOT NULL,
  `user_upload_path` varchar(255) DEFAULT NULL,
  `user_uploaded_at` datetime DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_application_requirements`
--

INSERT INTO `tbl_application_requirements` (`requirement_id`, `app_uid`, `user_id`, `file_path`, `application_type`, `application_id`, `pdf_path`, `user_upload_path`, `user_uploaded_at`, `uploaded_at`) VALUES
(9, 1, 29, 'test bs', 'business', 75, '/uploads/requirements/1760632085606_Decomposition_Chart_1_.pdf', '/uploads/user_uploads/1760638708370_Decomposition_Chart_1_.pdf', '2025-10-17 02:18:28', '2025-10-16 17:31:38'),
(10, 2, 29, 'test', 'electrical', 36, '/uploads/requirements/1760640530994_application___resume_2_.pdf', NULL, NULL, '2025-10-16 18:50:29'),
(11, 8, 29, 'test bs', 'business', 76, '/uploads/requirements/1760632085606_Decomposition_Chart_1_.pdf', '/uploads/user_uploads/1760641802340_act5.png', '2025-10-17 03:10:02', '2025-10-16 19:09:17'),
(12, 9, 29, 'test', 'electrical', 37, '/uploads/requirements/1760640530994_application___resume_2_.pdf', NULL, NULL, '2025-10-16 19:09:30'),
(13, 9, 29, 'tested for multi', 'electrical', 37, '/uploads/requirements/1761309531840_Receipt-2237-1334.pdf', NULL, NULL, '2025-10-24 12:39:54'),
(14, 10, 31, 'tested for multi', 'electrical', 38, '/uploads/requirements/1761309531840_Receipt-2237-1334.pdf', '/uploads/user_uploads/1761309819105_Jecille-new.pdf', '2025-10-24 20:43:39', '2025-10-24 12:42:38'),
(15, 10, 31, 'test', 'electrical', 38, '/uploads/requirements/1760640530994_application___resume_2_.pdf', '/uploads/user_uploads/1761309832140_Romeo_Ellaga_jr.pdf', '2025-10-24 20:43:52', '2025-10-24 12:42:42'),
(16, 11, 29, 'test', 'electrical', 39, '/uploads/requirements/1760640530994_application___resume_2_.pdf', NULL, NULL, '2025-10-24 12:55:38'),
(17, 11, 29, 'tested for multi', 'electrical', 39, '/uploads/requirements/1761309531840_Receipt-2237-1334.pdf', NULL, NULL, '2025-10-24 12:55:46');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_building_permits`
--

CREATE TABLE `tbl_building_permits` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `application_no` varchar(50) DEFAULT NULL,
  `bp_no` varchar(50) DEFAULT NULL,
  `building_permit_no` varchar(50) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_initial` varchar(10) DEFAULT NULL,
  `tin` varchar(50) DEFAULT NULL,
  `construction_owned` varchar(255) DEFAULT NULL,
  `form_of_ownership` varchar(100) DEFAULT NULL,
  `address_no` varchar(50) DEFAULT NULL,
  `address_street` varchar(255) DEFAULT NULL,
  `address_barangay` varchar(100) DEFAULT NULL,
  `address_city` varchar(100) DEFAULT NULL,
  `address_zip_code` varchar(20) DEFAULT NULL,
  `telephone_no` varchar(50) DEFAULT NULL,
  `location_lot_no` varchar(50) DEFAULT NULL,
  `location_blk_no` varchar(50) DEFAULT NULL,
  `location_tct_no` varchar(50) DEFAULT NULL,
  `location_tax_dec_no` varchar(50) DEFAULT NULL,
  `location_street` varchar(255) DEFAULT NULL,
  `location_barangay` varchar(100) DEFAULT NULL,
  `location_city` varchar(100) DEFAULT NULL,
  `scope_of_work` varchar(100) DEFAULT NULL,
  `group_a` varchar(100) DEFAULT NULL,
  `group_b` varchar(100) DEFAULT NULL,
  `group_c` varchar(100) DEFAULT NULL,
  `group_d` varchar(100) DEFAULT NULL,
  `group_e` varchar(100) DEFAULT NULL,
  `group_f` varchar(100) DEFAULT NULL,
  `group_g` varchar(100) DEFAULT NULL,
  `group_h` varchar(100) DEFAULT NULL,
  `group_i` varchar(100) DEFAULT NULL,
  `group_j1` varchar(100) DEFAULT NULL,
  `group_j2` varchar(100) DEFAULT NULL,
  `applies_also_for` varchar(100) DEFAULT NULL,
  `status` enum('pending','in-review','in-progress','requirements-completed','approved','ready-for-pickup','completed','rejected') DEFAULT 'pending',
  `status_updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Building permit applications linked to user accounts';

--
-- Dumping data for table `tbl_building_permits`
--

INSERT INTO `tbl_building_permits` (`id`, `user_id`, `application_no`, `bp_no`, `building_permit_no`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_owned`, `form_of_ownership`, `address_no`, `address_street`, `address_barangay`, `address_city`, `address_zip_code`, `telephone_no`, `location_lot_no`, `location_blk_no`, `location_tct_no`, `location_tax_dec_no`, `location_street`, `location_barangay`, `location_city`, `scope_of_work`, `group_a`, `group_b`, `group_c`, `group_d`, `group_e`, `group_f`, `group_g`, `group_h`, `group_i`, `group_j1`, `group_j2`, `applies_also_for`, `status`, `status_updated_at`, `created_at`, `updated_at`) VALUES
(2, 29, 'BP-APP-2025-000002', 'BP-2025-000002', 'BLDG-2025-000002', 'Freeman', 'Rhea', 'Natus est ', 'Incididunt dicta off', 'Rerum atque est accu', 'Itaque nesciunt lab', 'Et sunt eum sunt aut', 'Quod autem quis sed ', 'Quo anim necessitati', 'Nesciunt sit conse', '65615', '+1 (853) 347-3215', 'Dolores exercitation', 'Placeat aut ipsam i', 'Reiciendis ipsam vol', 'Ea corrupti porro o', 'Qui ut consequatur ', 'Dolore nihil ullamco', 'Nemo sunt qui aut el', 'Repair', 'Townhouse', 'Boarding House', 'Museum', 'Bank', 'Shopping Center', 'Service Shop', 'Warehouse', 'Heavy Industrial Plant', 'Clinic', 'Agricultural Storage', 'Carport', 'mechanical', 'approved', '2025-10-24 13:56:02', '2025-10-24 13:55:42', '2025-10-27 14:06:15');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_cedula`
--

CREATE TABLE `tbl_cedula` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `place_of_birth` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `profession` varchar(255) NOT NULL,
  `yearly_income` decimal(15,2) NOT NULL,
  `purpose` text NOT NULL,
  `sex` enum('male','female') NOT NULL,
  `status` enum('single','married','widowed') NOT NULL,
  `tin` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `application_status` enum('pending','in-review','in-progress','requirements-completed','ready-for-pickup','approved','rejected') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_cedula`
--

INSERT INTO `tbl_cedula` (`id`, `name`, `address`, `place_of_birth`, `date_of_birth`, `profession`, `yearly_income`, `purpose`, `sex`, `status`, `tin`, `user_id`, `created_at`, `updated_at`, `application_status`) VALUES
(23, 'Chris Paura Getida', 'hinigaran', 'Est aut ea vel dolor', '1996-12-26', 'Est architecto qui ', 397.00, 'Commodi elit ut ali', 'female', 'widowed', 'Rerum sequi rem alia', 31, '2025-10-29 15:47:31', '2025-10-29 18:04:40', 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_document_requirements`
--

CREATE TABLE `tbl_document_requirements` (
  `requirement_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `office_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `permit_type` enum('business','renewal_business','special_sales','cedula','building','electrical','plumbing','fencing','electronics','zoning','mayors') NOT NULL,
  `instructions` text DEFAULT NULL,
  `template_path` varchar(255) DEFAULT NULL,
  `allowed_extensions` varchar(200) DEFAULT 'pdf,doc,docx,jpg,png',
  `is_required` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_document_requirements`
--

INSERT INTO `tbl_document_requirements` (`requirement_id`, `name`, `office_id`, `category_id`, `permit_type`, `instructions`, `template_path`, `allowed_extensions`, `is_required`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(9, 'test bs', 14, 4, 'business', 'trial', '/uploads/requirements/1760632085606_Decomposition_Chart_1_.pdf', 'pdf', 1, 1, NULL, '2025-10-16 16:28:05', '2025-10-16 16:28:05'),
(10, 'test', 15, 5, 'electrical', 'test', '/uploads/requirements/1760640530994_application___resume_2_.pdf', 'pdf', 1, 1, NULL, '2025-10-16 18:48:50', '2025-10-16 18:48:50'),
(11, 'ddada', 15, 6, 'electronics', 'dadadada', '/uploads/requirements/1760640851053_Untitled_document.pdf', 'pdf', 1, 1, NULL, '2025-10-16 18:54:11', '2025-10-16 18:54:11'),
(12, 'tested for multi', 15, 7, 'electrical', '', '/uploads/requirements/1761309531840_Receipt-2237-1334.pdf', 'pdf', 1, 1, NULL, '2025-10-24 12:37:41', '2025-10-24 12:38:51'),
(13, 'tested 2 for multi', 15, 7, 'electrical', 'test', NULL, 'pdf', 1, 1, NULL, '2025-10-24 12:38:35', '2025-10-24 12:38:35');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_electrical_permits`
--

CREATE TABLE `tbl_electrical_permits` (
  `id` int(11) NOT NULL,
  `application_no` varchar(50) NOT NULL,
  `ep_no` varchar(50) DEFAULT NULL,
  `building_permit_no` varchar(50) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_initial` varchar(5) DEFAULT NULL,
  `tin` varchar(20) DEFAULT NULL,
  `construction_owned` varchar(255) DEFAULT NULL,
  `form_of_ownership` varchar(100) DEFAULT NULL,
  `use_or_character` varchar(255) DEFAULT NULL,
  `address_no` varchar(20) DEFAULT NULL,
  `address_street` varchar(255) DEFAULT NULL,
  `address_barangay` varchar(100) DEFAULT NULL,
  `address_city` varchar(100) DEFAULT NULL,
  `address_zip_code` varchar(10) DEFAULT NULL,
  `telephone_no` varchar(20) DEFAULT NULL,
  `location_street` varchar(255) DEFAULT NULL,
  `location_lot_no` varchar(50) DEFAULT NULL,
  `location_blk_no` varchar(50) DEFAULT NULL,
  `location_tct_no` varchar(50) DEFAULT NULL,
  `location_tax_dec_no` varchar(50) DEFAULT NULL,
  `location_barangay` varchar(100) DEFAULT NULL,
  `location_city` varchar(100) DEFAULT NULL,
  `scope_of_work` enum('newInstallation','annualInspection','temporary','reconnection','separationOfService','upgradingOfService','relocation','others') NOT NULL,
  `status` enum('pending','in-review','in-progress','requirements-completed','approved','rejected') NOT NULL DEFAULT 'pending',
  `pickup_schedule` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_electrical_permits`
--

INSERT INTO `tbl_electrical_permits` (`id`, `application_no`, `ep_no`, `building_permit_no`, `user_id`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_owned`, `form_of_ownership`, `use_or_character`, `address_no`, `address_street`, `address_barangay`, `address_city`, `address_zip_code`, `telephone_no`, `location_street`, `location_lot_no`, `location_blk_no`, `location_tct_no`, `location_tax_dec_no`, `location_barangay`, `location_city`, `scope_of_work`, `status`, `pickup_schedule`, `created_at`, `updated_at`) VALUES
(42, 'EP-APP-2025-000042', 'EP-2025-000042', 'BP-2025-000042', 31, 'Getida', 'Chris', 'P', 'Nesciunt proident ', 'Magni ut eaque fugia', 'Qui tempora officia ', 'Est veritatis nisi s', 'Sed qui labore quis ', 'hinigaran', NULL, 'Hinigaran', '71027', '09467629128', 'Ullamco in magnam te', 'Ut molestiae nihil n', 'Dolore quidem rerum ', 'Voluptates sed ut vo', 'Consectetur eveniet', 'Rerum voluptas in pe', 'Recusandae Tenetur ', 'reconnection', 'approved', NULL, '2025-10-29 15:56:15', '2025-10-29 16:38:46');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_electronics_permits`
--

CREATE TABLE `tbl_electronics_permits` (
  `id` int(11) NOT NULL,
  `application_no` varchar(50) NOT NULL,
  `ep_no` varchar(50) DEFAULT NULL,
  `building_permit_no` varchar(50) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_initial` varchar(5) DEFAULT NULL,
  `tin` varchar(20) DEFAULT NULL,
  `construction_owned` varchar(255) DEFAULT NULL,
  `form_of_ownership` varchar(100) DEFAULT NULL,
  `use_or_character` varchar(255) DEFAULT NULL,
  `address_no` varchar(20) DEFAULT NULL,
  `address_street` varchar(255) DEFAULT NULL,
  `address_barangay` varchar(100) DEFAULT NULL,
  `address_city` varchar(100) DEFAULT NULL,
  `address_zip_code` varchar(10) DEFAULT NULL,
  `telephone_no` varchar(20) DEFAULT NULL,
  `location_lot_no` varchar(50) DEFAULT NULL,
  `location_blk_no` varchar(50) DEFAULT NULL,
  `location_tct_no` varchar(50) DEFAULT NULL,
  `location_tax_dec_no` varchar(50) DEFAULT NULL,
  `location_street` varchar(255) DEFAULT NULL,
  `location_barangay` varchar(100) DEFAULT NULL,
  `location_city` varchar(100) DEFAULT NULL,
  `scope_of_work` varchar(100) NOT NULL,
  `status` enum('pending','in-review','in-progress','requirements-completed','ready-for-pickup','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_electronics_permits`
--

INSERT INTO `tbl_electronics_permits` (`id`, `application_no`, `ep_no`, `building_permit_no`, `user_id`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_owned`, `form_of_ownership`, `use_or_character`, `address_no`, `address_street`, `address_barangay`, `address_city`, `address_zip_code`, `telephone_no`, `location_lot_no`, `location_blk_no`, `location_tct_no`, `location_tax_dec_no`, `location_street`, `location_barangay`, `location_city`, `scope_of_work`, `status`, `created_at`, `updated_at`) VALUES
(2, 'ELC-APP-2025-000002', 'ELC-2025-000002', 'ELEC-2025-000002', 29, 'Bradshaw', 'd', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', '332', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'Installation of Equipment', 'approved', '2025-10-24 14:01:18', '2025-10-24 14:01:38'),
(3, 'ELC-APP-2025-000003', 'ELC-2025-000003', 'ELEC-2025-000003', 33, 'd', 'd', 'd', 'd', 'd', 'd', 'd', '1', '2', '3', 'd', '3', '3', '3', '3', '3', '3', '3', '3', '3', 'Change of Occupancy', 'approved', '2025-10-27 14:59:45', '2025-10-29 18:04:49'),
(4, 'ELC-APP-2025-000004', 'ELC-2025-000004', 'ELEC-2025-000004', 31, 'dd', 'd', 'd', '33', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', 'Change of Occupancy', 'in-review', '2025-10-27 15:06:46', '2025-10-27 15:06:52');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_employeeinformation`
--

CREATE TABLE `tbl_employeeinformation` (
  `employee_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `position` varchar(100) NOT NULL,
  `department` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_employeeinformation`
--

INSERT INTO `tbl_employeeinformation` (`employee_id`, `user_id`, `first_name`, `last_name`, `phone`, `position`, `department`, `start_date`, `created_at`) VALUES
(14, 30, 'jerryl', 'perez', '093213133', 'Business head', 'IT', '2025-09-27', '2025-09-27 08:16:47');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_employee_offices`
--

CREATE TABLE `tbl_employee_offices` (
  `assignment_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `office_id` int(11) NOT NULL,
  `assignment_date` date NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_employee_offices`
--

INSERT INTO `tbl_employee_offices` (`assignment_id`, `employee_id`, `office_id`, `assignment_date`, `is_primary`, `status`, `created_at`, `updated_at`) VALUES
(11, 14, 14, '2025-10-15', 1, 'active', '2025-10-15 15:11:18', '2025-10-15 15:11:18'),
(12, 14, 15, '2025-10-15', 1, 'active', '2025-10-15 15:12:45', '2025-10-15 15:12:45');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_fencing_permits`
--

CREATE TABLE `tbl_fencing_permits` (
  `id` int(11) NOT NULL,
  `application_no` varchar(50) NOT NULL,
  `fp_no` varchar(50) DEFAULT NULL,
  `building_permit_no` varchar(50) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_initial` varchar(5) DEFAULT NULL,
  `tin` varchar(20) DEFAULT NULL,
  `construction_ownership` varchar(255) DEFAULT NULL,
  `ownership_form` varchar(100) DEFAULT NULL,
  `use_or_character` varchar(255) DEFAULT NULL,
  `address_no` varchar(20) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `city_municipality` varchar(100) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `telephone_no` varchar(20) DEFAULT NULL,
  `location_street` varchar(255) DEFAULT NULL,
  `lot_no` varchar(50) DEFAULT NULL,
  `block_no1` varchar(50) DEFAULT NULL,
  `block_no2` varchar(50) DEFAULT NULL,
  `tax_dec_no` varchar(50) DEFAULT NULL,
  `location_barangay` varchar(100) DEFAULT NULL,
  `location_city` varchar(100) DEFAULT NULL,
  `scope_of_work` enum('new-construction','erection','addition','repair','demolition','others') NOT NULL,
  `other_scope_specify` varchar(255) DEFAULT NULL,
  `status` enum('pending','in-review','in-progress','requirements-completed','ready-for-pickup','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_fencing_permits`
--

INSERT INTO `tbl_fencing_permits` (`id`, `application_no`, `fp_no`, `building_permit_no`, `user_id`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_ownership`, `ownership_form`, `use_or_character`, `address_no`, `street`, `barangay`, `city_municipality`, `zip_code`, `telephone_no`, `location_street`, `lot_no`, `block_no1`, `block_no2`, `tax_dec_no`, `location_barangay`, `location_city`, `scope_of_work`, `other_scope_specify`, `status`, `created_at`, `updated_at`) VALUES
(4, 'FP-APP-2025-000004', 'FP-2025-000004', 'FENC-2025-000004', 29, 'Sit perferendis ear', 'Facilis debitis quas', 'At qu', 'Hic quis irure quaer', 'Similique nobis eu d', 'Assumenda perferendi', 'Ipsum quidem adipis', 'Sit in sunt dolores ', 'Reiciendis eiusmod u', 'Laboris aut pariatur', 'Sit quis commodo mo', 'Enim magna', 'Modi perferendis qua', 'Perspiciatis conseq', 'Velit dicta anim ita', 'Voluptatem ducimus ', 'Enim alias aut quia ', 'Est iusto voluptas r', 'Corrupti nesciunt ', 'Enim dolorem deserun', 'others', 'ddd', 'approved', '2025-10-24 14:00:00', '2025-10-24 14:00:20'),
(5, 'FP-APP-2025-000005', 'FP-2025-000005', 'FENC-2025-000005', 29, 'd', 'd', 'adad', 'daedwa', 'd', 'dwa', 'dwa', 'dwa', 'dwa', 'dwa', 'dawe', '231', '09467629128', 'dadw', '1', '23', '23', '23321', 'dada', 'dadada', 'new-construction', NULL, 'approved', '2025-10-27 14:02:13', '2025-10-27 14:06:28'),
(6, 'FP-APP-2025-000006', 'FP-2025-000006', 'FENC-2025-000006', 31, 'da', 'da', 'da', '231', 'da', 'ad', 'da', '1', 'da', 'da', '123', 'da', '12312312', '123', '231', '231', '321', '321', 'dada', '123312321', 'new-construction', NULL, 'in-progress', '2025-10-27 14:33:17', '2025-11-10 14:16:46'),
(7, 'FP-APP-2025-000007', 'FP-2025-000007', 'FENC-2025-000007', 32, 'Amet a et quo est ', 'Illum sit impedit', 'Ab no', 'Aut expedita repudia', 'Et ut quibusdam ut u', 'Sint distinctio Qu', 'Lorem corporis nisi ', 'Aut placeat dolore ', 'Aspernatur similique', 'Tempor quasi laborio', 'Eveniet dignissimos', 'Laudantium', 'Ut impedit recusand', 'Saepe facilis cillum', 'Voluptas facere null', 'Voluptas elit assum', 'Eum dolores ut tempo', 'Modi totam molestiae', 'Sint sunt et totam ', 'Sed ea odio est reru', 'addition', NULL, 'in-review', '2025-10-27 15:19:55', '2025-10-27 15:20:16');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_offices`
--

CREATE TABLE `tbl_offices` (
  `office_id` int(11) NOT NULL,
  `office_name` varchar(100) NOT NULL,
  `office_code` varchar(20) NOT NULL,
  `office_description` text DEFAULT NULL,
  `office_location` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_offices`
--

INSERT INTO `tbl_offices` (`office_id`, `office_name`, `office_code`, `office_description`, `office_location`, `phone_number`, `email`, `status`, `created_at`, `updated_at`) VALUES
(14, 'Business Permit & Licensing Permits', 'BPLP', 'test', 'Hinigaran Ground Floor Bldg', '+1 (512) 936-3437', 'BPLP@gmail.com', 'active', '2025-10-15 15:11:18', '2025-10-15 15:11:18'),
(15, 'Municipal Planning & Development Office', 'MPDO', 'test', 'Hinigaran Ground Floor Bldg', '+1 (512) 936-3437', 'MPDO@gmail.com', 'active', '2025-10-15 15:12:45', '2025-10-15 15:12:45');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_payment_receipts`
--

CREATE TABLE `tbl_payment_receipts` (
  `receipt_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `application_type` enum('business','electrical','cedula','mayors','building','plumbing','fencing','electronics','renewal_business') NOT NULL,
  `permit_name` varchar(100) NOT NULL,
  `receipt_image` varchar(255) NOT NULL,
  `payment_method` enum('gcash','maya','other') NOT NULL,
  `payment_amount` decimal(10,2) DEFAULT 0.00,
  `payment_percentage` decimal(5,2) DEFAULT 20.00,
  `total_document_price` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `form_access_granted` tinyint(1) DEFAULT 0,
  `form_access_used` tinyint(1) DEFAULT 0,
  `form_access_used_at` timestamp NULL DEFAULT NULL,
  `form_accessed` tinyint(1) DEFAULT 0,
  `form_accessed_at` timestamp NULL DEFAULT NULL,
  `form_submitted` tinyint(1) DEFAULT 0,
  `form_submitted_at` timestamp NULL DEFAULT NULL,
  `related_application_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_payment_receipts`
--

INSERT INTO `tbl_payment_receipts` (`receipt_id`, `user_id`, `application_type`, `permit_name`, `receipt_image`, `payment_method`, `payment_amount`, `payment_percentage`, `total_document_price`, `payment_status`, `admin_notes`, `approved_by`, `approved_at`, `form_access_granted`, `form_access_used`, `form_access_used_at`, `form_accessed`, `form_accessed_at`, `form_submitted`, `form_submitted_at`, `related_application_id`, `created_at`, `updated_at`) VALUES
(65, 31, 'plumbing', 'Plumbing Permit', '/uploads/receipts/receipt-1761596761972-613463114.png', 'other', 50.00, 20.00, 250.00, 'approved', 'test if ma send', 30, '2025-10-27 20:29:19', 1, 0, NULL, 0, NULL, 0, NULL, NULL, '2025-10-27 20:26:01', '2025-10-27 20:29:19'),
(66, 31, 'cedula', 'Cedula Permit', '/uploads/receipts/receipt-1761752788122-998725228.jpg', 'other', 20.00, 20.00, 100.00, 'approved', 'e', 30, '2025-10-29 15:46:42', 1, 1, '2025-10-29 15:47:31', 0, NULL, 1, '2025-10-29 15:47:31', 23, '2025-10-29 15:46:28', '2025-10-29 15:47:31'),
(67, 31, 'electrical', 'Electrical Permit', '/uploads/receipts/receipt-1761753330171-863912613.jpg', 'other', 60.00, 20.00, 300.00, 'approved', 'okay ni sa sir ', 30, '2025-10-29 15:55:46', 1, 1, '2025-10-29 15:56:15', 0, NULL, 1, '2025-10-29 15:56:15', 42, '2025-10-29 15:55:30', '2025-10-29 15:56:15'),
(68, 31, 'business', 'Business Permit', '/uploads/receipts/receipt-1762781902737-487654148.png', 'other', 100.00, 20.00, 500.00, 'approved', NULL, 30, '2025-11-10 13:40:41', 1, 1, '2025-11-10 13:41:00', 0, NULL, 1, '2025-11-10 13:41:00', 78, '2025-11-10 13:38:22', '2025-11-10 13:41:00'),
(69, 34, 'business', 'Business Permit', '/uploads/receipts/receipt-1762784016270-837377546.png', 'other', 100.00, 20.00, 500.00, 'approved', 'dd', 30, '2025-11-10 14:13:46', 1, 1, '2025-11-10 14:14:04', 0, NULL, 1, '2025-11-10 14:14:04', 79, '2025-11-10 14:13:36', '2025-11-10 14:14:04'),
(70, 35, 'business', 'Business Permit', '/uploads/receipts/receipt-1762784613813-561783684.jpg', 'other', 100.00, 20.00, 500.00, 'approved', 'goos nana \n', 30, '2025-11-10 14:23:43', 1, 1, '2025-11-10 14:24:03', 0, NULL, 1, '2025-11-10 14:24:03', 80, '2025-11-10 14:23:33', '2025-11-10 14:24:03');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_plumbing_permits`
--

CREATE TABLE `tbl_plumbing_permits` (
  `id` int(11) NOT NULL,
  `application_no` varchar(50) NOT NULL,
  `pp_no` varchar(50) DEFAULT NULL,
  `building_permit_no` varchar(50) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_initial` varchar(5) DEFAULT NULL,
  `tin` varchar(20) DEFAULT NULL,
  `construction_owned` varchar(255) DEFAULT NULL,
  `form_of_ownership` varchar(100) DEFAULT NULL,
  `use_or_character` varchar(255) DEFAULT NULL,
  `address_no` varchar(20) DEFAULT NULL,
  `address_street` varchar(255) DEFAULT NULL,
  `address_barangay` varchar(100) DEFAULT NULL,
  `address_city` varchar(100) DEFAULT NULL,
  `address_zip_code` varchar(10) DEFAULT NULL,
  `telephone_no` varchar(20) DEFAULT NULL,
  `location_street` varchar(255) DEFAULT NULL,
  `location_lot_no` varchar(50) DEFAULT NULL,
  `location_blk_no` varchar(50) DEFAULT NULL,
  `location_tct_no` varchar(50) DEFAULT NULL,
  `location_tax_dec_no` varchar(50) DEFAULT NULL,
  `location_barangay` varchar(100) DEFAULT NULL,
  `location_city` varchar(100) DEFAULT NULL,
  `scope_of_work` enum('newConstruction','erection','addition','alteration','renovation','moving','repair','conversion','accessoryBuilding','demolition','others') NOT NULL,
  `other_scope_specify` varchar(255) DEFAULT NULL,
  `status` enum('pending','in-review','in-progress','requirements-completed','ready-for-pickup','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_plumbing_permits`
--

INSERT INTO `tbl_plumbing_permits` (`id`, `application_no`, `pp_no`, `building_permit_no`, `user_id`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_owned`, `form_of_ownership`, `use_or_character`, `address_no`, `address_street`, `address_barangay`, `address_city`, `address_zip_code`, `telephone_no`, `location_street`, `location_lot_no`, `location_blk_no`, `location_tct_no`, `location_tax_dec_no`, `location_barangay`, `location_city`, `scope_of_work`, `other_scope_specify`, `status`, `created_at`, `updated_at`) VALUES
(2, 'PP-APP-2025-000002', 'PP-2025-000002', 'PLMB-2025-000002', 29, 'Sweeney', 'Austin', 'Moles', 'Amet sed dolor minu', 'Deserunt dolorem ame', 'Ipsam laboris labore', 'Amet laboriosam in', 'Vitae in eos est es', 'Aut voluptas sint v', 'Dolorem cupidatat di', 'Sed quidem deleniti ', '13098', '+1 (789) 744-7646', 'Incidunt voluptatib', 'Odit in dolores debi', 'Excepteur itaque et ', 'Et laborum Eum volu', 'Eos laboriosam est', 'Sint exercitation et', 'Consequatur Laborum', 'erection', NULL, 'in-review', '2025-10-24 13:58:28', '2025-10-27 14:20:29'),
(3, 'PP-APP-2025-000003', 'PP-2025-000003', 'PLMB-2025-000003', 31, 'Clay', 'Basil', 'Qui i', 'Nulla a molestiae ul', 'In quaerat dignissim', 'Officiis dolores qui', 'Dignissimos cum recu', 'Saepe id odio ut es', 'Odio corrupti incid', 'Sint possimus repre', 'Ea veritatis officii', '13656', '+1 (731) 291-8062', 'Iure est occaecat o', 'Fugiat tempor sint ', 'Labore quia voluptat', 'Saepe sed reprehende', 'Veniam voluptatem s', 'Sequi ut natus omnis', 'Beatae in enim susci', 'others', 'wewewew', 'in-review', '2025-10-27 20:11:13', '2025-11-10 14:19:06');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_requirement_categories`
--

CREATE TABLE `tbl_requirement_categories` (
  `category_id` int(11) NOT NULL,
  `office_id` int(11) NOT NULL,
  `category_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_requirement_categories`
--

INSERT INTO `tbl_requirement_categories` (`category_id`, `office_id`, `category_name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(4, 14, 'test bus', '', 'active', '2025-10-16 16:27:20', '2025-10-16 16:27:20'),
(5, 15, 'test e', '', 'active', '2025-10-16 18:48:03', '2025-10-16 18:48:03'),
(6, 15, 'eeeeee', '', 'active', '2025-10-16 18:53:50', '2025-10-16 18:53:50'),
(7, 15, 'Electrical 1', '', 'active', '2025-10-24 12:37:05', '2025-10-24 12:37:05');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_info`
--

CREATE TABLE `tbl_user_info` (
  `info_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `middlename` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `phone_number` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_user_info`
--

INSERT INTO `tbl_user_info` (`info_id`, `user_id`, `firstname`, `middlename`, `lastname`, `address`, `phone_number`) VALUES
(5, 29, 'dave', 'sumabong', 'chester', 'hinigaran brgy2', '09321731723'),
(6, 31, 'Chris', 'Paura', 'Getida', 'hinigaran', '09467629128'),
(7, 32, 'Dianne', NULL, 'Delosantos', 'bago city', '09123161303'),
(8, 33, 'dave', 'chongo', 'amo', 'hinigaran.city', '09534178798'),
(9, 34, 'toto', 'wa', 'aldrin', 'awdwa', '09705048375'),
(10, 35, 'Chris', 'Pa', 'Ge', 'murcia', '09458542757');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_nav_seen`
--

CREATE TABLE `tbl_user_nav_seen` (
  `user_id` int(11) NOT NULL,
  `last_seen_request_doc_at` datetime DEFAULT NULL,
  `last_seen_track_status_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_user_nav_seen`
--

INSERT INTO `tbl_user_nav_seen` (`user_id`, `last_seen_request_doc_at`, `last_seen_track_status_at`, `created_at`, `updated_at`) VALUES
(29, '2025-11-10 21:15:50', '2025-11-10 21:15:52', '2025-10-21 00:28:57', '2025-11-10 21:15:52'),
(31, '2025-11-10 21:38:14', '2025-11-10 22:08:51', '2025-10-21 00:29:06', '2025-11-10 22:08:51'),
(32, '2025-10-28 00:07:31', '2025-10-27 23:19:57', '2025-10-23 02:04:33', '2025-10-28 00:07:31'),
(33, '2025-10-27 22:58:53', '2025-10-27 22:59:24', '2025-10-27 22:58:51', '2025-10-27 22:59:24'),
(34, '2025-11-10 22:13:26', '2025-11-10 22:13:38', '2025-11-10 22:13:23', '2025-11-10 22:13:38'),
(35, '2025-11-10 22:23:26', '2025-11-13 17:28:24', '2025-11-10 22:23:26', '2025-11-13 17:28:24');

-- --------------------------------------------------------

--
-- Table structure for table `tb_logins`
--

CREATE TABLE `tb_logins` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('citizen','admin','moderator','employee') NOT NULL DEFAULT 'citizen',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tb_logins`
--

INSERT INTO `tb_logins` (`user_id`, `email`, `password`, `role`, `created_at`) VALUES
(5, 'admin@gmail.com', '$2b$10$eUG1ueO5DiTrewcQjYqLF.0lfQXR9IczTSXVPoAbldwzn9OxOPrcm', 'admin', '2025-04-22 08:08:23'),
(29, 'user@gmail.com', '$2b$10$tjk85faZsEs/qqqbWkzyA.DhJYO.MteWFD47cgJClebYuPWWyOAti', 'citizen', '2025-09-27 08:15:15'),
(30, 'employee@gmail.com', '$2b$10$3Dgwp/PC8/Odd0tmx75iXedlRA87Agu/SIH1EHtv39NI1PkgVDmVC', 'employee', '2025-09-27 08:16:47'),
(31, 'newuser@gmail.com', '$2b$10$mHdtFqzxdThlV2e3fsmwW.1BKJ7bTmeH2Pwni/JDrNIgfhYf9vbfS', 'citizen', '2025-10-20 16:12:59'),
(32, 'dianne@gmail.com', '$2b$10$7BxPV3wGff4yR5pip0drZ.ii.dwwUqJjoNfIMUSQvSRkn9QlEp7ji', 'citizen', '2025-10-22 18:04:19'),
(33, 'dave@gmail.com', '$2b$10$ONgGAc6IKeCyDuqLKVgXauyU0BJ6CZcXAreOZ/Yv8yRssQfQ/NQpG', 'citizen', '2025-10-27 14:58:43'),
(34, 'aldrin@gmail.com', '$2b$10$KgIxePqqCH/TmkdlaRpcNOIbs9sbY5Oz.rI.4TgDjE.DSZTRCyICa', 'citizen', '2025-11-10 14:13:13'),
(35, '09xghagox09@gmail.com', '$2b$10$P3lYfRCEEyoKHVoMUK9GNOnd1vMcZNu9XSK2cPNgg7T9zQt4CLjpm', 'citizen', '2025-11-10 14:23:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `application_comments`
--
ALTER TABLE `application_comments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `application_index`
--
ALTER TABLE `application_index`
  ADD PRIMARY KEY (`app_uid`),
  ADD UNIQUE KEY `uq_app` (`application_type`,`application_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `business_activities`
--
ALTER TABLE `business_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `permit_id` (`permit_id`);

--
-- Indexes for table `business_permits`
--
ALTER TABLE `business_permits`
  ADD PRIMARY KEY (`BusinessP_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`k`);

--
-- Indexes for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  ADD PRIMARY KEY (`requirement_id`),
  ADD KEY `idx_user_app` (`user_id`,`application_type`,`application_id`),
  ADD KEY `fk_appreq_appuid` (`app_uid`);

--
-- Indexes for table `tbl_building_permits`
--
ALTER TABLE `tbl_building_permits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `application_no` (`application_no`),
  ADD UNIQUE KEY `bp_no` (`bp_no`),
  ADD UNIQUE KEY `building_permit_no` (`building_permit_no`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_application_no` (`application_no`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `tbl_cedula`
--
ALTER TABLE `tbl_cedula`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `tbl_document_requirements`
--
ALTER TABLE `tbl_document_requirements`
  ADD PRIMARY KEY (`requirement_id`),
  ADD KEY `idx_office` (`office_id`),
  ADD KEY `idx_permit_type` (`permit_type`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `fk_docreq_createdby` (`created_by`),
  ADD KEY `fk_docreq_category` (`category_id`);

--
-- Indexes for table `tbl_electrical_permits`
--
ALTER TABLE `tbl_electrical_permits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `application_no` (`application_no`),
  ADD UNIQUE KEY `ep_no` (`ep_no`),
  ADD KEY `idx_application_no` (`application_no`),
  ADD KEY `idx_ep_no` (`ep_no`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `tbl_electronics_permits`
--
ALTER TABLE `tbl_electronics_permits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `application_no` (`application_no`),
  ADD UNIQUE KEY `ep_no` (`ep_no`),
  ADD KEY `idx_application_no` (`application_no`),
  ADD KEY `idx_ep_no` (`ep_no`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  ADD PRIMARY KEY (`employee_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_employee_offices`
--
ALTER TABLE `tbl_employee_offices`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `unique_employee_office` (`employee_id`,`office_id`),
  ADD KEY `office_id` (`office_id`);

--
-- Indexes for table `tbl_fencing_permits`
--
ALTER TABLE `tbl_fencing_permits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `application_no` (`application_no`),
  ADD UNIQUE KEY `fp_no` (`fp_no`),
  ADD KEY `idx_application_no` (`application_no`),
  ADD KEY `idx_fp_no` (`fp_no`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `tbl_offices`
--
ALTER TABLE `tbl_offices`
  ADD PRIMARY KEY (`office_id`),
  ADD UNIQUE KEY `office_code` (`office_code`);

--
-- Indexes for table `tbl_payment_receipts`
--
ALTER TABLE `tbl_payment_receipts`
  ADD PRIMARY KEY (`receipt_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_application_type` (`application_type`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_approved_by` (`approved_by`),
  ADD KEY `idx_user_app_type` (`user_id`,`application_type`),
  ADD KEY `idx_payment_date` (`created_at`),
  ADD KEY `idx_access_status` (`form_access_granted`,`form_access_used`),
  ADD KEY `idx_total_price` (`total_document_price`),
  ADD KEY `idx_form_status` (`form_access_granted`,`form_accessed`,`form_submitted`);

--
-- Indexes for table `tbl_plumbing_permits`
--
ALTER TABLE `tbl_plumbing_permits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `application_no` (`application_no`),
  ADD UNIQUE KEY `pp_no` (`pp_no`),
  ADD KEY `idx_application_no` (`application_no`),
  ADD KEY `idx_pp_no` (`pp_no`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `tbl_requirement_categories`
--
ALTER TABLE `tbl_requirement_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD KEY `idx_office` (`office_id`);

--
-- Indexes for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  ADD PRIMARY KEY (`info_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_user_nav_seen`
--
ALTER TABLE `tbl_user_nav_seen`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `tb_logins`
--
ALTER TABLE `tb_logins`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `application_comments`
--
ALTER TABLE `application_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `application_index`
--
ALTER TABLE `application_index`
  MODIFY `app_uid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `business_activities`
--
ALTER TABLE `business_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `business_permits`
--
ALTER TABLE `business_permits`
  MODIFY `BusinessP_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `tbl_building_permits`
--
ALTER TABLE `tbl_building_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_cedula`
--
ALTER TABLE `tbl_cedula`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `tbl_document_requirements`
--
ALTER TABLE `tbl_document_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tbl_electrical_permits`
--
ALTER TABLE `tbl_electrical_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `tbl_electronics_permits`
--
ALTER TABLE `tbl_electronics_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `tbl_employee_offices`
--
ALTER TABLE `tbl_employee_offices`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tbl_fencing_permits`
--
ALTER TABLE `tbl_fencing_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_offices`
--
ALTER TABLE `tbl_offices`
  MODIFY `office_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tbl_payment_receipts`
--
ALTER TABLE `tbl_payment_receipts`
  MODIFY `receipt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `tbl_plumbing_permits`
--
ALTER TABLE `tbl_plumbing_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_requirement_categories`
--
ALTER TABLE `tbl_requirement_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  MODIFY `info_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tb_logins`
--
ALTER TABLE `tb_logins`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `application_index`
--
ALTER TABLE `application_index`
  ADD CONSTRAINT `fk_appidx_user` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `business_activities`
--
ALTER TABLE `business_activities`
  ADD CONSTRAINT `business_activities_ibfk_1` FOREIGN KEY (`permit_id`) REFERENCES `business_permits` (`BusinessP_id`) ON DELETE CASCADE;

--
-- Constraints for table `business_permits`
--
ALTER TABLE `business_permits`
  ADD CONSTRAINT `business_permits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`);

--
-- Constraints for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  ADD CONSTRAINT `fk_appreq_appuid` FOREIGN KEY (`app_uid`) REFERENCES `application_index` (`app_uid`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_requirements` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_building_permits`
--
ALTER TABLE `tbl_building_permits`
  ADD CONSTRAINT `fk_building_permit_user` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_cedula`
--
ALTER TABLE `tbl_cedula`
  ADD CONSTRAINT `tbl_cedula_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_document_requirements`
--
ALTER TABLE `tbl_document_requirements`
  ADD CONSTRAINT `fk_docreq_category` FOREIGN KEY (`category_id`) REFERENCES `tbl_requirement_categories` (`category_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_docreq_createdby` FOREIGN KEY (`created_by`) REFERENCES `tb_logins` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_docreq_office` FOREIGN KEY (`office_id`) REFERENCES `tbl_offices` (`office_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_electrical_permits`
--
ALTER TABLE `tbl_electrical_permits`
  ADD CONSTRAINT `tbl_electrical_permits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_electronics_permits`
--
ALTER TABLE `tbl_electronics_permits`
  ADD CONSTRAINT `tbl_electronics_permits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  ADD CONSTRAINT `tbl_employeeinformation_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_employee_offices`
--
ALTER TABLE `tbl_employee_offices`
  ADD CONSTRAINT `tbl_employee_offices_ibfk_1` FOREIGN KEY (`office_id`) REFERENCES `tbl_offices` (`office_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_employee_offices_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `tbl_employeeinformation` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_fencing_permits`
--
ALTER TABLE `tbl_fencing_permits`
  ADD CONSTRAINT `tbl_fencing_permits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_payment_receipts`
--
ALTER TABLE `tbl_payment_receipts`
  ADD CONSTRAINT `fk_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `tb_logins` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_plumbing_permits`
--
ALTER TABLE `tbl_plumbing_permits`
  ADD CONSTRAINT `tbl_plumbing_permits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_requirement_categories`
--
ALTER TABLE `tbl_requirement_categories`
  ADD CONSTRAINT `fk_category_office` FOREIGN KEY (`office_id`) REFERENCES `tbl_offices` (`office_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  ADD CONSTRAINT `tbl_user_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
