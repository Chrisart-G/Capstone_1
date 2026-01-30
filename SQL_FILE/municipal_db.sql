-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 28, 2026 at 08:24 PM
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
-- Table structure for table `application_archives`
--

CREATE TABLE `application_archives` (
  `id` int(11) NOT NULL,
  `application_type` varchar(64) NOT NULL,
  `application_id` int(11) NOT NULL,
  `document_type` varchar(128) NOT NULL,
  `applicant_name` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `archived_at` datetime NOT NULL DEFAULT current_timestamp(),
  `archived_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `application_comments`
--

CREATE TABLE `application_comments` (
  `id` int(11) NOT NULL,
  `app_uid` varchar(64) DEFAULT NULL,
  `application_type` varchar(50) NOT NULL,
  `application_id` int(11) NOT NULL,
  `status_at_post` varchar(50) DEFAULT NULL,
  `comment` text NOT NULL,
  `author_user_id` int(11) NOT NULL,
  `author_role` varchar(20) DEFAULT 'employee',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `application_comments`
--

INSERT INTO `application_comments` (`id`, `app_uid`, `application_type`, `application_id`, `status_at_post`, `comment`, `author_user_id`, `author_role`, `created_at`) VALUES
(0, '35', 'business', 83, 'approved', 'eeee', 30, 'employee', '2025-11-25 05:28:09'),
(0, '35', 'business', 83, 'approved', 'test', 35, 'user', '2025-11-25 05:29:07'),
(0, '36', 'electrical', 44, 'approved', 'test', 35, 'user', '2025-11-25 22:58:08'),
(0, NULL, 'electronics', 7, 'approved', 'test', 30, 'employee', '2025-11-25 22:58:35'),
(0, '36', 'electrical', 44, 'approved', 'wew', 35, 'user', '2025-11-25 22:58:49'),
(0, '36', 'electrical', 44, 'approved', 'testt', 30, 'employee', '2025-11-25 22:59:06'),
(0, NULL, 'business', 84, 'pending', 'test', 30, 'employee', '2025-11-27 15:16:34'),
(0, '39', 'business', 84, 'pending', 'test balos', 35, 'user', '2025-11-27 15:17:34'),
(0, '40', 'business', 85, 'in-progress', 'test', 30, 'employee', '2025-11-29 04:30:11'),
(0, '40', 'business', 85, 'in-progress', 'test', 35, 'user', '2025-11-29 04:30:22'),
(0, '47', 'business', 86, 'in-review', 'tst', 30, 'employee', '2025-12-13 02:00:36'),
(0, '35', 'cedula', 25, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 35, 'user', '2025-12-13 10:31:20'),
(0, '47', 'business', 86, 'requirements-completed', 'test submit', 30, 'employee', '2025-12-13 14:00:06'),
(0, '55', 'business', 90, 'in-progress', 'test', 49, 'employee', '2025-12-13 17:28:38'),
(0, '55', 'business', 90, 'in-progress', 'tes', 44, 'user', '2025-12-13 17:28:53'),
(0, '57', 'cedula', 28, 'pending', 'test', 35, 'user', '2026-01-05 11:56:02'),
(0, '57', 'cedula', 28, 'pending', 'tes2\n', 30, 'employee', '2026-01-05 11:56:14'),
(0, '55', 'business', 90, 'in-review', 'ff', 30, 'employee', '2026-01-05 12:04:15'),
(0, '52', 'business', 93, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 00:32:21'),
(0, '52', 'business', 94, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 00:36:44'),
(0, '52', 'business', 95, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 00:55:10'),
(0, '52', 'electrical', 49, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:25:25'),
(0, '52', 'electrical', 48, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:25:33'),
(0, '52', 'fencing', 12, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:31:59'),
(0, '52', 'electrical', 50, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:32:58'),
(0, '52', 'fencing', 13, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:44:16'),
(0, '52', 'fencing', 14, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:44:20'),
(0, '52', 'fencing', 15, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:45:42'),
(0, '52', 'electrical', 51, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:46:03'),
(0, '60', 'electrical', 53, 'requirements-completed', 'test232', 29, 'user', '2026-01-12 17:05:09'),
(0, '52', 'cedula', 29, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-16 01:03:20'),
(0, '35', 'business', 83, 'approved', 'eeee', 30, 'employee', '2025-11-25 05:28:09'),
(0, '35', 'business', 83, 'approved', 'test', 35, 'user', '2025-11-25 05:29:07'),
(0, '36', 'electrical', 44, 'approved', 'test', 35, 'user', '2025-11-25 22:58:08'),
(0, NULL, 'electronics', 7, 'approved', 'test', 30, 'employee', '2025-11-25 22:58:35'),
(0, '36', 'electrical', 44, 'approved', 'wew', 35, 'user', '2025-11-25 22:58:49'),
(0, '36', 'electrical', 44, 'approved', 'testt', 30, 'employee', '2025-11-25 22:59:06'),
(0, NULL, 'business', 84, 'pending', 'test', 30, 'employee', '2025-11-27 15:16:34'),
(0, '39', 'business', 84, 'pending', 'test balos', 35, 'user', '2025-11-27 15:17:34'),
(0, '40', 'business', 85, 'in-progress', 'test', 30, 'employee', '2025-11-29 04:30:11'),
(0, '40', 'business', 85, 'in-progress', 'test', 35, 'user', '2025-11-29 04:30:22'),
(0, '47', 'business', 86, 'in-review', 'tst', 30, 'employee', '2025-12-13 02:00:36'),
(0, '35', 'cedula', 25, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 35, 'user', '2025-12-13 10:31:20'),
(0, '47', 'business', 86, 'requirements-completed', 'test submit', 30, 'employee', '2025-12-13 14:00:06'),
(0, '55', 'business', 90, 'in-progress', 'test', 49, 'employee', '2025-12-13 17:28:38'),
(0, '55', 'business', 90, 'in-progress', 'tes', 44, 'user', '2025-12-13 17:28:53'),
(0, '57', 'cedula', 28, 'pending', 'test', 35, 'user', '2026-01-05 11:56:02'),
(0, '57', 'cedula', 28, 'pending', 'tes2\n', 30, 'employee', '2026-01-05 11:56:14'),
(0, '55', 'business', 90, 'in-review', 'ff', 30, 'employee', '2026-01-05 12:04:15'),
(0, '52', 'business', 93, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 00:32:21'),
(0, '52', 'business', 94, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 00:36:44'),
(0, '52', 'business', 95, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 00:55:10'),
(0, '52', 'electrical', 49, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:25:25'),
(0, '52', 'electrical', 48, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:25:33'),
(0, '52', 'fencing', 12, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:31:59'),
(0, '52', 'electrical', 50, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:32:58'),
(0, '52', 'fencing', 13, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:44:16'),
(0, '52', 'fencing', 14, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:44:20'),
(0, '52', 'fencing', 15, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:45:42'),
(0, '52', 'electrical', 51, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:46:03'),
(0, '60', 'electrical', 53, 'requirements-completed', 'test232', 29, 'user', '2026-01-12 17:05:09'),
(0, '52', 'cedula', 29, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-16 01:03:20'),
(0, '35', 'business', 83, 'approved', 'eeee', 30, 'employee', '2025-11-25 05:28:09'),
(0, '35', 'business', 83, 'approved', 'test', 35, 'user', '2025-11-25 05:29:07'),
(0, '36', 'electrical', 44, 'approved', 'test', 35, 'user', '2025-11-25 22:58:08'),
(0, NULL, 'electronics', 7, 'approved', 'test', 30, 'employee', '2025-11-25 22:58:35'),
(0, '36', 'electrical', 44, 'approved', 'wew', 35, 'user', '2025-11-25 22:58:49'),
(0, '36', 'electrical', 44, 'approved', 'testt', 30, 'employee', '2025-11-25 22:59:06'),
(0, NULL, 'business', 84, 'pending', 'test', 30, 'employee', '2025-11-27 15:16:34'),
(0, '39', 'business', 84, 'pending', 'test balos', 35, 'user', '2025-11-27 15:17:34'),
(0, '40', 'business', 85, 'in-progress', 'test', 30, 'employee', '2025-11-29 04:30:11'),
(0, '40', 'business', 85, 'in-progress', 'test', 35, 'user', '2025-11-29 04:30:22'),
(0, '47', 'business', 86, 'in-review', 'tst', 30, 'employee', '2025-12-13 02:00:36'),
(0, '35', 'cedula', 25, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 35, 'user', '2025-12-13 10:31:20'),
(0, '47', 'business', 86, 'requirements-completed', 'test submit', 30, 'employee', '2025-12-13 14:00:06'),
(0, '55', 'business', 90, 'in-progress', 'test', 49, 'employee', '2025-12-13 17:28:38'),
(0, '55', 'business', 90, 'in-progress', 'tes', 44, 'user', '2025-12-13 17:28:53'),
(0, '57', 'cedula', 28, 'pending', 'test', 35, 'user', '2026-01-05 11:56:02'),
(0, '57', 'cedula', 28, 'pending', 'tes2\n', 30, 'employee', '2026-01-05 11:56:14'),
(0, '55', 'business', 90, 'in-review', 'ff', 30, 'employee', '2026-01-05 12:04:15'),
(0, '52', 'business', 93, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 00:32:21'),
(0, '52', 'business', 94, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 00:36:44'),
(0, '52', 'business', 95, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 00:55:10'),
(0, '52', 'electrical', 49, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:25:25'),
(0, '52', 'electrical', 48, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:25:33'),
(0, '52', 'fencing', 12, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:31:59'),
(0, '52', 'electrical', 50, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:32:58'),
(0, '52', 'fencing', 13, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:44:16'),
(0, '52', 'fencing', 14, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:44:20'),
(0, '52', 'fencing', 15, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:45:42'),
(0, '52', 'electrical', 51, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-12 01:46:03'),
(0, '60', 'electrical', 53, 'requirements-completed', 'test232', 29, 'user', '2026-01-12 17:05:09'),
(0, '52', 'cedula', 29, 'rejected', 'Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.', 52, 'user', '2026-01-16 01:03:20');

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
(1, 'business', 1, 3, '2026-01-24 06:46:50'),
(2, 'business', 2, 7, '2026-01-24 08:40:28');

-- --------------------------------------------------------

--
-- Table structure for table `application_lgu_checks`
--

CREATE TABLE `application_lgu_checks` (
  `id` int(11) NOT NULL,
  `application_type` varchar(64) NOT NULL,
  `application_id` int(11) NOT NULL,
  `checks_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`checks_json`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 1, 'ew', '3', 23.00, 23.00, 32.00, '2026-01-24 06:34:23', '2026-01-24 06:34:23'),
(2, 2, '', '', 0.00, 0.00, 0.00, '2026-01-24 08:35:16', '2026-01-24 08:35:16');

-- --------------------------------------------------------

--
-- Table structure for table `business_clearance_form`
--

CREATE TABLE `business_clearance_form` (
  `application_id` int(11) NOT NULL,
  `status` enum('draft','submitted') DEFAULT 'draft',
  `zoning` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`zoning`)),
  `fitness` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fitness`)),
  `environment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`environment`)),
  `sanitation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sanitation`)),
  `market` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`market`)),
  `agriculture` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`agriculture`)),
  `draft_pdf_path` varchar(512) DEFAULT NULL,
  `final_pdf_path` varchar(512) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_clearance_form`
--

INSERT INTO `business_clearance_form` (`application_id`, `status`, `zoning`, `fitness`, `environment`, `sanitation`, `market`, `agriculture`, `draft_pdf_path`, `final_pdf_path`, `updated_at`) VALUES
(1, '', '{\"action\":\"approved\",\"deficiencies\":{},\"remarks\":\"test\"}', '{\"action\":\"approved\",\"deficiencies\":{},\"remarks\":\"test\"}', '{}', '{}', '{}', '{}', NULL, '/uploads/requirements/business_permit_1_filled_final.pdf', '2026-01-24 15:44:30');

-- --------------------------------------------------------

--
-- Table structure for table `business_esignatures`
--

CREATE TABLE `business_esignatures` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `section` varchar(50) NOT NULL,
  `esign_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `business_lgu_requirements_status`
--

CREATE TABLE `business_lgu_requirements_status` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `requirement_key` varchar(64) NOT NULL,
  `office_name` varchar(128) NOT NULL,
  `status` enum('pending','in-review','on-hold','approved','approved_with_conditions','denied') NOT NULL DEFAULT 'pending',
  `remarks` text DEFAULT NULL,
  `pdf_path` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_lgu_requirements_status`
--

INSERT INTO `business_lgu_requirements_status` (`id`, `application_id`, `requirement_key`, `office_name`, `status`, `remarks`, `pdf_path`, `updated_at`) VALUES
(3, 1, 'sanitary_clearance', 'MHO', 'pending', NULL, NULL, '2026-01-24 15:05:25'),
(4, 1, 'occupancy_permit', 'MPDO', 'pending', NULL, NULL, '2026-01-24 15:05:25');

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
  `status` enum('pending','in-review','in-progress','requirements-completed','approved','on-hold','pickup-document','ready-for-pickup','rejected') NOT NULL DEFAULT 'pending',
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
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

INSERT INTO `business_permits` (`BusinessP_id`, `application_type`, `payment_mode`, `application_date`, `tin_no`, `registration_no`, `registration_date`, `business_type`, `amendment_from`, `amendment_to`, `tax_incentive`, `tax_incentive_entity`, `last_name`, `first_name`, `middle_name`, `business_name`, `trade_name`, `business_address`, `business_postal_code`, `business_email`, `business_telephone`, `business_mobile`, `owner_address`, `owner_postal_code`, `owner_email`, `owner_telephone`, `owner_mobile`, `emergency_contact`, `emergency_phone`, `emergency_email`, `business_area`, `male_employees`, `female_employees`, `local_employees`, `lessor_name`, `lessor_address`, `lessor_phone`, `lessor_email`, `monthly_rental`, `status`, `pickup_schedule`, `pickup_file_path`, `created_at`, `updated_at`, `user_id`, `filled_up_forms`, `sec_dti_cda_certificate`, `local_sketch`, `sworn_statement_capital`, `tax_clearance`, `brgy_clearance_business`, `cedula`, `docu_type`) VALUES
(1, 'new', 'annually', '2026-01-24', 'Quia duis consequatu', 'In veniam alias dol', '2026-01-24', 'cooperative', 'single', 'single', 'no', '', 'Velit omnis eiusmod', 'Cupidatat voluptatum', 'Deserunt rerum perfe', 'Aut qui nisi error o', 'In in ducimus dolor', 'Et ducimus beatae r', 'Quia qui m', 'pukulo@mailinator.com', 'Non iste tempore pe', 'Laudantium fugiat', 'Doloribus rem quis f', 'Quia qui m', 'user@gmail.com', 'Non iste tempore pe', '09231232121', 'dwa', '09231232121', 'user@gmail.com', 'daw', 2, 3, 32, 'Ullamco neque tempor', 'Est magni repellend', 'Fugiat voluptatum v', 'hoduwyw@mailinator.com', 48.00, 'in-review', NULL, NULL, '2026-01-24 06:34:23', '2026-01-24 06:46:45', 3, '/uploads/requirements/business_permit_1_lgu_form.pdf', '/uploads/business_docs/1769236463488_ZONING PERMIT FORM (2).pdf', '/uploads/business_docs/1769236463488_OJT-RESUME_jex.pdf', '/uploads/business_docs/1769236463489_IT SOFTWARE (CAPSTONE) PROJECT 2 LOG BOOK (1).pdf', '/uploads/business_docs/1769236463489_IT SOFTWARE (CAPSTONE) PROJECT 2 LOG BOOK (1).pdf', '/uploads/business_docs/1769236463489_IT SOFTWARE (CAPSTONE) PROJECT 2 LOG BOOK (1).pdf', '/uploads/business_docs/1769236463489_Jecille-new pdf.pdf', 'Business Permit'),
(2, 'new', 'annually', '2026-01-24', '123-456-000', '234-566-999', '2026-01-24', 'single', 'single', 'single', 'no', '', 'Gealolo', 'Chester', 'S.', 'AAA Water Station', 'jex barsana', 'Kahilwayan', '6106', 'elwhise@gmail.com', '09876567656', '09876945326', 'brgy2 osmena st negros occ', '6106', 'elwhise@gmail.com', '09876567656', '09534178798', 'el whise ', '09534178798', 'elwhise@gmail.com', '2 sq ', 1, 1, 1, 'art getida', 'murcia', '09875647897', 'art@gmail.com', 180000.00, 'approved', NULL, NULL, '2026-01-24 08:35:16', '2026-01-24 08:57:44', 7, '/uploads/requirements/business_permit_2_lgu_form.pdf', '/uploads/business_docs/1769243716423_02_dti_certificate_sample.pdf', '/uploads/business_docs/1769243716423_03_local_sketch_sample.pdf', '/uploads/business_docs/1769243716423_04_sworn_statement_of_capital_sample.pdf', '/uploads/business_docs/1769243716423_05_tax_clearance_sample.pdf', '/uploads/business_docs/1769243716424_06_barangay_business_clearance_sample.pdf', '/uploads/business_docs/1769243716424_07_cedula_sample.pdf', 'Business Permit');

-- --------------------------------------------------------

--
-- Table structure for table `business_permit_assessment`
--

CREATE TABLE `business_permit_assessment` (
  `id` int(11) NOT NULL,
  `BusinessP_id` int(11) NOT NULL,
  `items_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items_json`)),
  `total_fees_lgu` decimal(12,2) DEFAULT 0.00,
  `fsif_15` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_permit_assessment`
--

INSERT INTO `business_permit_assessment` (`id`, `BusinessP_id`, `items_json`, `total_fees_lgu`, `fsif_15`, `created_at`, `updated_at`) VALUES
(1, 1, '{}', 0.00, 0.00, '2026-01-24 06:42:34', '2026-01-24 06:42:34'),
(2, 2, '{\"gross_sales_tax\":{\"amount\":0,\"penalty\":0,\"total\":0},\"delivery_vans_trucks_tax\":{\"amount\":0,\"penalty\":0,\"total\":0},\"combustible_storage_tax\":{\"amount\":0,\"penalty\":0,\"total\":0},\"signboard_billboards_tax\":{\"amount\":400,\"penalty\":0,\"total\":400},\"mayors_permit_fee\":{\"amount\":1100,\"penalty\":0,\"total\":1100},\"garbage_charges\":{\"amount\":300,\"penalty\":0,\"total\":300},\"trucks_vans_permit_fee\":{\"amount\":0,\"penalty\":0,\"total\":0},\"sanitary_inspection_fee\":{\"amount\":300,\"penalty\":0,\"total\":300},\"building_inspection_fee\":{\"amount\":0,\"penalty\":0,\"total\":0},\"electrical_inspection_fee\":{\"amount\":0,\"penalty\":0,\"total\":0},\"mechanical_inspection_fee\":{\"amount\":0,\"penalty\":0,\"total\":0},\"plumbing_inspection_fee\":{\"amount\":300,\"penalty\":0,\"total\":300},\"signboard_renewal_fee\":{\"amount\":0,\"penalty\":0,\"total\":0},\"combustible_sale_storage_fee\":{\"amount\":0,\"penalty\":0,\"total\":0},\"others_fee\":{\"amount\":0,\"penalty\":0,\"total\":0}}', 2400.00, 360.00, '2026-01-24 08:43:31', '2026-01-24 08:54:40');

-- --------------------------------------------------------

--
-- Table structure for table `business_permit_doc_verification`
--

CREATE TABLE `business_permit_doc_verification` (
  `id` int(11) NOT NULL,
  `BusinessP_id` int(11) NOT NULL,
  `occupancy_permit` enum('yes','no','not_needed') DEFAULT 'not_needed',
  `zoning_clearance` enum('yes','no','not_needed') DEFAULT 'not_needed',
  `barangay_clearance` enum('yes','no','not_needed') DEFAULT 'not_needed',
  `sanitary_clearance` enum('yes','no','not_needed') DEFAULT 'not_needed',
  `environment_certificate` enum('yes','no','not_needed') DEFAULT 'not_needed',
  `market_clearance` enum('yes','no','not_needed') DEFAULT 'not_needed',
  `fire_safety_certificate` enum('yes','no','not_needed') DEFAULT 'not_needed',
  `river_floating_fish` enum('yes','no','not_needed') DEFAULT 'not_needed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_permit_doc_verification`
--

INSERT INTO `business_permit_doc_verification` (`id`, `BusinessP_id`, `occupancy_permit`, `zoning_clearance`, `barangay_clearance`, `sanitary_clearance`, `environment_certificate`, `market_clearance`, `fire_safety_certificate`, `river_floating_fish`, `created_at`, `updated_at`) VALUES
(1, 1, 'yes', 'not_needed', 'not_needed', 'yes', 'not_needed', 'not_needed', 'not_needed', 'not_needed', '2026-01-24 06:42:34', '2026-01-24 07:05:25'),
(2, 2, 'not_needed', 'not_needed', 'not_needed', 'not_needed', 'not_needed', 'not_needed', 'not_needed', 'not_needed', '2026-01-24 08:40:28', '2026-01-24 08:54:41');

-- --------------------------------------------------------

--
-- Table structure for table `electrical_form_submissions`
--

CREATE TABLE `electrical_form_submissions` (
  `id` bigint(20) NOT NULL,
  `application_id` bigint(20) NOT NULL,
  `requirement_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `status` enum('draft','submitted') NOT NULL DEFAULT 'draft',
  `box2` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box2`)),
  `box3` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box3`)),
  `box4` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box4`)),
  `box5` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box5`)),
  `sig_box2` longtext DEFAULT NULL,
  `sig_owner` longtext DEFAULT NULL,
  `sig_lot` longtext DEFAULT NULL,
  `draft_pdf_path` varchar(512) DEFAULT NULL,
  `final_pdf_path` varchar(512) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `electronics_form_submissions`
--

CREATE TABLE `electronics_form_submissions` (
  `id` bigint(20) NOT NULL,
  `application_id` bigint(20) NOT NULL,
  `status` enum('draft','submitted') DEFAULT 'draft',
  `box2` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box2`)),
  `box3` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box3`)),
  `box4` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box4`)),
  `box5` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box5`)),
  `sig_box2` longtext DEFAULT NULL,
  `sig_owner` longtext DEFAULT NULL,
  `sig_lot` longtext DEFAULT NULL,
  `draft_pdf_path` varchar(255) DEFAULT NULL,
  `final_pdf_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fencing_form_submissions`
--

CREATE TABLE `fencing_form_submissions` (
  `application_id` int(11) NOT NULL,
  `status` enum('draft','submitted') DEFAULT 'draft',
  `box2` longtext DEFAULT NULL,
  `box3` longtext DEFAULT NULL,
  `box4` longtext DEFAULT NULL,
  `box5` longtext DEFAULT NULL,
  `sig_box2` longtext DEFAULT NULL,
  `sig_owner` longtext DEFAULT NULL,
  `sig_lot` longtext DEFAULT NULL,
  `draft_pdf_path` varchar(500) DEFAULT NULL,
  `final_pdf_path` varchar(500) DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plumbing_form_submissions`
--

CREATE TABLE `plumbing_form_submissions` (
  `application_id` int(11) NOT NULL,
  `status` enum('draft','submitted') DEFAULT 'draft',
  `box2` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box2`)),
  `box3` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box3`)),
  `box4` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box4`)),
  `box5` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box5`)),
  `box6` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`box6`)),
  `sig_box2` longtext DEFAULT NULL,
  `sig_box4` longtext DEFAULT NULL,
  `sig_box5` longtext DEFAULT NULL,
  `sig_box6` longtext DEFAULT NULL,
  `draft_pdf_path` varchar(255) DEFAULT NULL,
  `final_pdf_path` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('2k5wPki1d6C-pPddFZgSJ2hBOFfW-go3', 1769332530, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-01-25T08:36:33.870Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"user_id\":5,\"email\":\"BPLO@gmail.com\",\"role\":\"employee\",\"department\":\"BPLO\",\"position\":\"BPLO Head\"}}'),
('QA7hwVY61rGmHJCixY03hweGJhyMapbN', 1769332530, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-01-25T08:56:55.778Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"user_id\":4,\"email\":\"MTO@gmail.com\",\"role\":\"employee\",\"department\":\"MTO\",\"position\":\"MTO HEAD\"}}'),
('hDePZjLtHIW9lUUMUt54Bv_IZ0il9MDr', 1769332530, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-01-25T08:26:51.274Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"user_id\":7,\"email\":\"elwhise@gmail.com\",\"role\":\"citizen\",\"department\":null,\"position\":null}}');

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
('sms_enabled', 'false', '2026-01-28 19:23:45');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_admin_notifications`
--

CREATE TABLE `tbl_admin_notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `status` enum('unread','read','resolved') DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_announcements`
--

CREATE TABLE `tbl_announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `posted_by` int(11) DEFAULT NULL,
  `posted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 1, 3, 'Business Permit LGU Form', 'business', 1, '/uploads/requirements/business_permit_1_lgu_form.pdf', NULL, NULL, '2026-01-24 07:05:26'),
(2, 1, 3, 'Business Permit – Verification Sheet (User Filled)', 'business', 1, '/uploads/requirements/business_permit_1_filled_final.pdf', NULL, NULL, '2026-01-24 07:44:30'),
(3, 2, 7, 'Business Permit LGU Form', 'business', 2, '/uploads/requirements/business_permit_2_lgu_form.pdf', NULL, NULL, '2026-01-24 08:54:41'),
(4, 2, 7, 'Mayor’s Permit – Final Output', 'business', 2, '/uploads/system_generated/mayors_permit/mayors_permit_final_2_1769245142751.pdf', NULL, NULL, '2026-01-24 08:59:02');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_archived_documents`
--

CREATE TABLE `tbl_archived_documents` (
  `archive_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `application_type` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `office` varchar(100) DEFAULT NULL,
  `document_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`document_data`)),
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `archived_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_archived_payments`
--

CREATE TABLE `tbl_archived_payments` (
  `archive_id` int(11) NOT NULL,
  `receipt_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `application_type` varchar(50) DEFAULT NULL,
  `permit_name` varchar(100) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_amount` decimal(10,2) DEFAULT NULL,
  `total_document_price` decimal(10,2) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT NULL,
  `receipt_image` varchar(255) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `archived_by` int(11) DEFAULT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `office` varchar(100) DEFAULT NULL,
  `archived_reason` varchar(255) DEFAULT NULL,
  `original_created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `status` enum('pending','in-review','in-progress','requirements-completed','approved','on-hold','pickup-document','ready-for-pickup','rejected') NOT NULL DEFAULT 'pending',
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
  `status_updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Building permit applications linked to user accounts';

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
  `application_status` enum('pending','in-review','in-progress','requirements-completed','approved','on-hold','pickup-document','ready-for-pickup','rejected') NOT NULL DEFAULT 'pending',
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_cedula_drafts`
--

CREATE TABLE `tbl_cedula_drafts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_cedula_drafts`
--

INSERT INTO `tbl_cedula_drafts` (`id`, `user_id`, `data`, `created_at`, `updated_at`) VALUES
(1, 52, '{\"name\":\"Chris Art P Getida\",\"address\":\"brgy 2 hinigaran\",\"placeOfBirth\":\"Quis deserunt placea\",\"dateOfBirth\":\"1980-04-05\",\"profession\":\"Corrupti sapiente i\",\"yearlyIncome\":\"386\",\"purpose\":\"Minim nesciunt dolo\",\"sex\":\"male\",\"status\":\"married\",\"tin\":\"Commodi facilis reru\"}', '2026-01-15 16:41:42', '2026-01-15 16:47:58');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_document_prices`
--

CREATE TABLE `tbl_document_prices` (
  `id` int(11) NOT NULL,
  `application_type` enum('business','electrical','cedula','mayors','building','plumbing','fencing','electronics','renewal_business','zoning') NOT NULL,
  `permit_name` varchar(100) NOT NULL,
  `default_price` decimal(10,2) NOT NULL,
  `current_price` decimal(10,2) NOT NULL,
  `payment_percentage` decimal(5,2) NOT NULL DEFAULT 100.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_document_prices`
--

INSERT INTO `tbl_document_prices` (`id`, `application_type`, `permit_name`, `default_price`, `current_price`, `payment_percentage`, `is_active`, `updated_by`, `updated_at`) VALUES
(1, 'business', 'Business Permit', 500.00, 400.00, 100.00, 1, NULL, '2025-11-28 17:40:15'),
(2, 'electrical', 'Electrical Permit', 300.00, 200.00, 100.00, 1, NULL, '2025-11-28 17:35:19'),
(3, 'cedula', 'Cedula Permit', 100.00, 100.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(5, 'building', 'Building Permit', 800.00, 800.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(6, 'plumbing', 'Plumbing Permit', 250.00, 250.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(7, 'fencing', 'Fencing Permit', 200.00, 200.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(8, 'electronics', 'Electronics Permit', 350.00, 350.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(9, 'renewal_business', 'Business Renewal Permit', 400.00, 400.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(10, 'zoning', 'Zoning Permit', 500.00, 500.00, 100.00, 1, NULL, '2026-01-23 20:16:27');

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
(1, 'BusinessPermit', 1, NULL, 'business', '', '/uploads/requirements/1769242105857_business_permit_full_template.pdf', 'pdf', 1, 1, NULL, '2026-01-24 08:08:25', '2026-01-24 08:08:25');

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
  `status` enum('pending','in-review','in-progress','requirements-completed','approved','on-hold','pickup-document','ready-for-pickup','rejected') NOT NULL DEFAULT 'pending',
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `status` enum('pending','in-review','in-progress','requirements-completed','approved','on-hold','pickup-document','ready-for-pickup','rejected') NOT NULL DEFAULT 'pending',
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 2, 'jerryl', 'Perez', '+1 (938) 533-5736', 'MPDO HEAD', 'MPDO', '2026-01-24', '2026-01-24 06:15:31'),
(2, 4, 'chris art ', 'g', '0932123413', 'MTO HEAD', 'MTO', '2026-01-24', '2026-01-24 06:20:19'),
(3, 5, 'BPLO ', 'Employee', '132131221', 'BPLO Head', 'BPLO', '2026-01-24', '2026-01-24 06:36:07'),
(4, 8, 'jerryl', 'Getida', '+1 (621) 351-7828', 'MEO Head', 'MEO', '2026-01-24', '2026-01-24 08:45:29');

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
  `status` enum('pending','in-review','in-progress','requirements-completed','approved','on-hold','pickup-document','ready-for-pickup','rejected') NOT NULL DEFAULT 'pending',
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'Business Permit & Licensing Permits', 'BPLO', 'daw', 'Ground Floor', '093213213', 'BPLO@gmail.com', 'active', '2026-01-24 06:08:55', '2026-01-24 06:08:55'),
(2, 'Municipal Environment / Solid Waste Management Office', 'MEO', '123dwa', 'Hinigaran Ground Floor Bldg', '+1 (512) 936-3437', 'MEO@gmail.com', 'active', '2026-01-24 06:10:31', '2026-01-24 06:10:31'),
(3, 'Municipal Agriculture Office', 'MAO', 'dwa', 'Hinigaran Ground Floor Bldg', '+1 (512) 936-3437', 'MAO@gmail.com', 'active', '2026-01-24 06:11:11', '2026-01-24 06:11:11'),
(4, 'Municipal Health Office', 'MHO', '123121', 'Hinigaran Ground Floor Bldg', '+1 (512) 936-3437', 'MHOemployee@gmail.com', 'active', '2026-01-24 06:12:13', '2026-01-24 06:12:13'),
(5, 'Municipal Planning & Development Office', 'MPDO', 'daw', 'Hinigaran Ground Floor Bldg', '+1 (512) 936-3437', 'MPDO@gmail.com', 'active', '2026-01-24 06:13:17', '2026-01-24 06:13:17'),
(6, 'Municipal Treasurer\'s Office', 'MTO', 'daw', 'Hinigaran Ground Floor Bldg', '+1 (524) 381-1012', 'MTO@gmail.com', 'active', '2026-01-24 06:14:06', '2026-01-24 06:19:10');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_office_positions`
--

CREATE TABLE `tbl_office_positions` (
  `position_id` int(11) NOT NULL,
  `office_id` int(11) NOT NULL,
  `position_name` varchar(100) NOT NULL,
  `access_level` enum('normal','mid','max') NOT NULL DEFAULT 'normal',
  `can_approve` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_office_positions`
--

INSERT INTO `tbl_office_positions` (`position_id`, `office_id`, `position_name`, `access_level`, `can_approve`, `created_at`, `updated_at`) VALUES
(1, 1, 'BPLO Head', 'max', 1, '2026-01-24 06:08:55', '2026-01-24 06:08:55'),
(2, 2, 'MEO Head', 'max', 1, '2026-01-24 06:10:31', '2026-01-24 06:10:31'),
(3, 3, 'MAO HEAD', 'max', 1, '2026-01-24 06:11:11', '2026-01-24 06:11:11'),
(4, 4, 'MHO HEAD', 'max', 1, '2026-01-24 06:12:13', '2026-01-24 06:12:13'),
(5, 5, 'MPDO HEAD', 'max', 1, '2026-01-24 06:13:17', '2026-01-24 06:13:17'),
(6, 6, 'MTO HEAD', 'max', 0, '2026-01-24 06:19:07', '2026-01-24 06:19:09');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_payment_receipts`
--

CREATE TABLE `tbl_payment_receipts` (
  `receipt_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `application_type` enum('business','electrical','cedula','mayors','building','plumbing','fencing','electronics','renewal_business','zoning') NOT NULL,
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
  `previous_business_permit_id` int(11) DEFAULT NULL,
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

INSERT INTO `tbl_payment_receipts` (`receipt_id`, `user_id`, `application_type`, `permit_name`, `receipt_image`, `payment_method`, `payment_amount`, `payment_percentage`, `total_document_price`, `payment_status`, `admin_notes`, `approved_by`, `approved_at`, `form_access_granted`, `form_access_used`, `form_access_used_at`, `previous_business_permit_id`, `form_accessed`, `form_accessed_at`, `form_submitted`, `form_submitted_at`, `related_application_id`, `created_at`, `updated_at`) VALUES
(2, 7, 'business', 'Business Permit', '/uploads/receipts/receipt-1769243295512-513306001.jpg', 'other', 400.00, 100.00, 400.00, 'approved', 'Your Payment is Okay', 4, '2026-01-24 08:30:55', 1, 1, '2026-01-24 08:35:16', NULL, 0, NULL, 1, '2026-01-24 08:35:16', 2, '2026-01-24 08:28:15', '2026-01-24 08:35:16');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_phone_verifications`
--

CREATE TABLE `tbl_phone_verifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `phone_number` varchar(32) NOT NULL,
  `otp_code` varchar(8) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` tinyint(4) NOT NULL DEFAULT 0,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_phone_verifications`
--

INSERT INTO `tbl_phone_verifications` (`id`, `user_id`, `phone_number`, `otp_code`, `expires_at`, `attempts`, `is_used`, `created_at`) VALUES
(1, 1, '09321232121', '837268', '2026-01-24 14:13:04', 0, 1, '2026-01-24 06:03:04'),
(2, 3, '09231232121', '847540', '2026-01-24 14:26:48', 0, 1, '2026-01-24 06:16:48'),
(3, 6, '09467629128', '722086', '2026-01-24 16:30:51', 0, 0, '2026-01-24 08:20:51'),
(4, 7, '09534178798', '892288', '2026-01-24 16:36:02', 0, 1, '2026-01-24 08:26:02');

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
  `status` enum('pending','in-review','in-progress','requirements-completed','approved','on-hold','pickup-document','ready-for-pickup','rejected') NOT NULL DEFAULT 'pending',
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_business_info`
--

CREATE TABLE `tbl_user_business_info` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_business_owner` tinyint(1) NOT NULL DEFAULT 1,
  `business_name` varchar(255) NOT NULL,
  `trade_name` varchar(255) DEFAULT NULL,
  `business_type` enum('single','partnership','corporation','cooperative') DEFAULT NULL,
  `tin_no` varchar(50) DEFAULT NULL,
  `registration_no` varchar(50) DEFAULT NULL,
  `business_address` text DEFAULT NULL,
  `business_postal_code` varchar(10) DEFAULT NULL,
  `business_email` varchar(255) DEFAULT NULL,
  `business_telephone` varchar(50) DEFAULT NULL,
  `business_mobile` varchar(50) DEFAULT NULL,
  `lessor_full_name` varchar(255) DEFAULT NULL,
  `lessor_address` text DEFAULT NULL,
  `lessor_phone` varchar(50) DEFAULT NULL,
  `lessor_email` varchar(255) DEFAULT NULL,
  `monthly_rental` decimal(12,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_user_business_info`
--

INSERT INTO `tbl_user_business_info` (`id`, `user_id`, `is_business_owner`, `business_name`, `trade_name`, `business_type`, `tin_no`, `registration_no`, `business_address`, `business_postal_code`, `business_email`, `business_telephone`, `business_mobile`, `lessor_full_name`, `lessor_address`, `lessor_phone`, `lessor_email`, `monthly_rental`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 'Aut qui nisi error o', 'In in ducimus dolor', 'cooperative', 'Quia duis consequatu', 'In veniam alias dol', 'Et ducimus beatae r', 'Quia qui m', 'pukulo@mailinator.com', 'Non iste tempore pe', 'Laudantium fugiat', 'Ullamco neque tempor', 'Est magni repellend', 'Fugiat voluptatum v', 'hoduwyw@mailinator.com', 48.00, '2026-01-24 14:16:48', '2026-01-24 14:16:48'),
(2, 6, 1, 'AAA Water Refilling Station', NULL, 'single', '123-456-000', '234-234-456', 'Kahilwayan', '6106', 'AAA@gmail.com', '09094563456', '09876567859', 'Dave Chester', 'Brgy 2 Osmena', '09534178798', 'dave@gmail.com', 180000.00, '2026-01-24 16:20:51', '2026-01-24 16:20:51'),
(3, 7, 1, 'AAA Water Station', NULL, 'single', '123-456-000', '234-566-999', 'Kahilwayan', '6106', 'elwhise@gmail.com', '09876567656', '09876945326', 'art getida', 'murcia', '09875647897', 'art@gmail.com', 180000.00, '2026-01-24 16:26:02', '2026-01-24 16:26:02');

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
  `phone_number` varchar(20) NOT NULL,
  `phone_verified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_user_info`
--

INSERT INTO `tbl_user_info` (`info_id`, `user_id`, `firstname`, `middlename`, `lastname`, `address`, `phone_number`, `phone_verified`) VALUES
(1, 1, 'admin', '1dwa', 'admin', '123dwdaw', '09321232121', 1),
(2, 3, 'Cupidatat voluptatum', 'Deserunt rerum perfe', 'Velit omnis eiusmod', 'Doloribus rem quis f', '09231232121', 1),
(3, 6, 'Caren Joy', 'G', 'Pacto', 'Brgy 2 Osmena Street', '09467629128', 0),
(4, 7, 'Chester', 'S.', 'Gealolo', 'brgy2 osmena st negros occ', '09534178798', 1);

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
(3, '2026-01-24 15:17:38', '2026-01-24 15:16:36', '2026-01-24 14:17:03', '2026-01-24 15:17:38'),
(7, '2026-01-24 17:00:33', '2026-01-24 17:00:39', '2026-01-24 16:26:55', '2026-01-24 17:00:39');

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
(1, 'admin@gmail.com', '$2b$10$g.WpgQlDiS4wKqckB/a.gu8DKRYpLpEmHFHHkND7neiua2AT0Xkvi', 'admin', '2026-01-24 06:03:04'),
(2, 'employee@gmail.com', '$2b$10$TdKSPgacxS6pRQuWljHyre2S3oOd.YnxD8Lhjx12/.5Qu.yWY3Nxm', 'employee', '2026-01-24 06:15:30'),
(3, 'user@gmail.com', '$2b$10$pwtnUpL314CpLJQ1x0/.ju0r11M5LE1/YLlHv28.P3LeWHN6q6YOa', 'citizen', '2026-01-24 06:16:48'),
(4, 'MTO@gmail.com', '$2b$10$7IGSr2oF.q1Hw3HFavirMuy0ivM8MVH5TAfTYtsABIsa494EbgY3y', 'employee', '2026-01-24 06:20:19'),
(5, 'BPLO@gmail.com', '$2b$10$RsmZuNkcrCT96anfmegWFOPvcvaoxays6NwWzt2eQKooyn/Hx7nBi', 'employee', '2026-01-24 06:36:07'),
(6, 'carenjoy@gmail.com', '$2b$10$0EXe1mZoSPkChdXvM4MsB.6iuS8ZNy21DdQmZ4FkIVuslxYCEs4SK', 'citizen', '2026-01-24 08:20:51'),
(7, 'elwhise@gmail.com', '$2b$10$iuqU6ZKbWt.JvCgjIlK5QeyXqnCJJZXrwiSUgNQXrwsGg9Nhxv9tq', 'citizen', '2026-01-24 08:26:02'),
(8, 'MEO@gmail.com', '$2b$10$rQgMpCYxgmYGrq43X8pSKebwnWiJAazeDhoIvp9XekZl.OqJKY3Cu', 'employee', '2026-01-24 08:45:29');

-- --------------------------------------------------------

--
-- Table structure for table `zoning_permits`
--

CREATE TABLE `zoning_permits` (
  `zoning_id` int(11) NOT NULL,
  `application_no` varchar(255) NOT NULL,
  `status` enum('pending','in-review','in-progress','requirements-completed','approved','ready-for-pickup','rejected') DEFAULT 'pending',
  `date_of_receipt` date DEFAULT NULL,
  `pmd_or_no` varchar(255) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `applicant_last_name` varchar(255) DEFAULT NULL,
  `applicant_first_name` varchar(255) DEFAULT NULL,
  `applicant_middle_initial` varchar(1) DEFAULT NULL,
  `corporation_name` varchar(255) DEFAULT NULL,
  `applicant_address` text DEFAULT NULL,
  `corporation_address` text DEFAULT NULL,
  `authorized_rep_name` varchar(255) DEFAULT NULL,
  `project_nature` enum('newDevelopment','improvement','others') DEFAULT NULL,
  `project_nature_other_specify` varchar(255) DEFAULT NULL,
  `project_type` varchar(255) DEFAULT NULL,
  `project_area_type` enum('lot','bldg','improvement') DEFAULT NULL,
  `project_area_sqm` int(11) DEFAULT NULL,
  `project_location` text DEFAULT NULL,
  `project_tenure` enum('permanent','temporary','others') DEFAULT NULL,
  `project_tenure_other_specify` varchar(255) DEFAULT NULL,
  `right_over_land` enum('owner','lease','others') DEFAULT NULL,
  `right_over_land_other_specify` varchar(255) DEFAULT NULL,
  `existing_land_use` enum('vacantIdle','residential','industrial','agricultural','institutional','commercial','tenanted','others') DEFAULT NULL,
  `existing_land_use_agri_specify` varchar(255) DEFAULT NULL,
  `existing_land_use_other_specify` varchar(255) DEFAULT NULL,
  `commercial_specify` varchar(255) DEFAULT NULL,
  `crop` varchar(255) DEFAULT NULL,
  `project_cost_words` varchar(255) DEFAULT NULL,
  `project_cost_figures` decimal(10,2) DEFAULT NULL,
  `q14_written_notice` enum('yes','no') DEFAULT NULL,
  `q16a_office_filed` text DEFAULT NULL,
  `q14b_dates_filed` text DEFAULT NULL,
  `q16c_actions_taken` text DEFAULT NULL,
  `release_mode` enum('pickup','mail') DEFAULT NULL,
  `mail_address_to` enum('applicant','authorizedRep') DEFAULT NULL,
  `mail_addressed_name` varchar(255) DEFAULT NULL,
  `signature_applicant` varchar(255) DEFAULT NULL,
  `signature_authorized_rep` varchar(255) DEFAULT NULL,
  `notary_day` int(11) DEFAULT NULL,
  `notary_month` int(11) DEFAULT NULL,
  `notary_year` int(11) DEFAULT NULL,
  `notary_at_municipality` varchar(255) DEFAULT NULL,
  `notary_province` varchar(255) DEFAULT NULL,
  `residence_cert_no` varchar(255) DEFAULT NULL,
  `residence_cert_issued_on` date DEFAULT NULL,
  `residence_cert_issued_at` varchar(255) DEFAULT NULL,
  `doc_no` varchar(255) DEFAULT NULL,
  `page_no` varchar(255) DEFAULT NULL,
  `book_no` varchar(255) DEFAULT NULL,
  `series_year` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `application_archives`
--
ALTER TABLE `application_archives`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_app` (`application_type`,`application_id`),
  ADD KEY `idx_archived_at` (`archived_at`),
  ADD KEY `idx_application_type` (`application_type`);

--
-- Indexes for table `application_index`
--
ALTER TABLE `application_index`
  ADD PRIMARY KEY (`app_uid`),
  ADD UNIQUE KEY `uq_app` (`application_type`,`application_id`),
  ADD UNIQUE KEY `ux_app_type_id` (`application_type`,`application_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `application_lgu_checks`
--
ALTER TABLE `application_lgu_checks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_app` (`application_type`,`application_id`);

--
-- Indexes for table `business_activities`
--
ALTER TABLE `business_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `permit_id` (`permit_id`);

--
-- Indexes for table `business_clearance_form`
--
ALTER TABLE `business_clearance_form`
  ADD PRIMARY KEY (`application_id`);

--
-- Indexes for table `business_esignatures`
--
ALTER TABLE `business_esignatures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_section_per_app` (`application_id`,`section`);

--
-- Indexes for table `business_lgu_requirements_status`
--
ALTER TABLE `business_lgu_requirements_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_app_req` (`application_id`,`requirement_key`);

--
-- Indexes for table `business_permits`
--
ALTER TABLE `business_permits`
  ADD PRIMARY KEY (`BusinessP_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `business_permit_assessment`
--
ALTER TABLE `business_permit_assessment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bp_assess` (`BusinessP_id`);

--
-- Indexes for table `business_permit_doc_verification`
--
ALTER TABLE `business_permit_doc_verification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bp_verif_business_idx` (`BusinessP_id`);

--
-- Indexes for table `electrical_form_submissions`
--
ALTER TABLE `electrical_form_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_form_app` (`application_id`);

--
-- Indexes for table `electronics_form_submissions`
--
ALTER TABLE `electronics_form_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_app` (`application_id`);

--
-- Indexes for table `fencing_form_submissions`
--
ALTER TABLE `fencing_form_submissions`
  ADD PRIMARY KEY (`application_id`);

--
-- Indexes for table `plumbing_form_submissions`
--
ALTER TABLE `plumbing_form_submissions`
  ADD PRIMARY KEY (`application_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`k`);

--
-- Indexes for table `tbl_admin_notifications`
--
ALTER TABLE `tbl_admin_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_notifications_status` (`status`),
  ADD KEY `idx_admin_notifications_employee` (`employee_id`);

--
-- Indexes for table `tbl_announcements`
--
ALTER TABLE `tbl_announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_announcements_published` (`is_published`),
  ADD KEY `idx_announcements_posted_at` (`posted_at`);

--
-- Indexes for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  ADD PRIMARY KEY (`requirement_id`),
  ADD KEY `idx_user_app` (`user_id`,`application_type`,`application_id`),
  ADD KEY `fk_appreq_appuid` (`app_uid`);

--
-- Indexes for table `tbl_archived_documents`
--
ALTER TABLE `tbl_archived_documents`
  ADD PRIMARY KEY (`archive_id`),
  ADD KEY `idx_office` (`office`),
  ADD KEY `idx_application_type` (`application_type`),
  ADD KEY `idx_archived_at` (`archived_at`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `archived_by` (`archived_by`);

--
-- Indexes for table `tbl_archived_payments`
--
ALTER TABLE `tbl_archived_payments`
  ADD PRIMARY KEY (`archive_id`),
  ADD KEY `idx_office` (`office`),
  ADD KEY `idx_archived_at` (`archived_at`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `receipt_id` (`receipt_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `archived_by` (`archived_by`);

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
-- Indexes for table `tbl_cedula_drafts`
--
ALTER TABLE `tbl_cedula_drafts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cedula_drafts_user` (`user_id`);

--
-- Indexes for table `tbl_document_prices`
--
ALTER TABLE `tbl_document_prices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_doc_price_type` (`application_type`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_updated_at` (`updated_at`),
  ADD KEY `fk_doc_price_updated_by` (`updated_by`);

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
-- Indexes for table `tbl_office_positions`
--
ALTER TABLE `tbl_office_positions`
  ADD PRIMARY KEY (`position_id`),
  ADD KEY `idx_office_id` (`office_id`);

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
-- Indexes for table `tbl_phone_verifications`
--
ALTER TABLE `tbl_phone_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_phoneverif_user` (`user_id`);

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
-- Indexes for table `tbl_user_business_info`
--
ALTER TABLE `tbl_user_business_info`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_business_user_id` (`user_id`);

--
-- Indexes for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  ADD PRIMARY KEY (`info_id`),
  ADD UNIQUE KEY `uq_phone` (`phone_number`),
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
-- Indexes for table `zoning_permits`
--
ALTER TABLE `zoning_permits`
  ADD PRIMARY KEY (`zoning_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `application_archives`
--
ALTER TABLE `application_archives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `application_index`
--
ALTER TABLE `application_index`
  MODIFY `app_uid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `application_lgu_checks`
--
ALTER TABLE `application_lgu_checks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `business_activities`
--
ALTER TABLE `business_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `business_esignatures`
--
ALTER TABLE `business_esignatures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `business_lgu_requirements_status`
--
ALTER TABLE `business_lgu_requirements_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `business_permits`
--
ALTER TABLE `business_permits`
  MODIFY `BusinessP_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `business_permit_assessment`
--
ALTER TABLE `business_permit_assessment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `business_permit_doc_verification`
--
ALTER TABLE `business_permit_doc_verification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `electrical_form_submissions`
--
ALTER TABLE `electrical_form_submissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `electronics_form_submissions`
--
ALTER TABLE `electronics_form_submissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_admin_notifications`
--
ALTER TABLE `tbl_admin_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_announcements`
--
ALTER TABLE `tbl_announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_archived_documents`
--
ALTER TABLE `tbl_archived_documents`
  MODIFY `archive_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_archived_payments`
--
ALTER TABLE `tbl_archived_payments`
  MODIFY `archive_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_building_permits`
--
ALTER TABLE `tbl_building_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_cedula`
--
ALTER TABLE `tbl_cedula`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_cedula_drafts`
--
ALTER TABLE `tbl_cedula_drafts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_document_prices`
--
ALTER TABLE `tbl_document_prices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_document_requirements`
--
ALTER TABLE `tbl_document_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_electrical_permits`
--
ALTER TABLE `tbl_electrical_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_electronics_permits`
--
ALTER TABLE `tbl_electronics_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_employee_offices`
--
ALTER TABLE `tbl_employee_offices`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_fencing_permits`
--
ALTER TABLE `tbl_fencing_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_offices`
--
ALTER TABLE `tbl_offices`
  MODIFY `office_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_office_positions`
--
ALTER TABLE `tbl_office_positions`
  MODIFY `position_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_payment_receipts`
--
ALTER TABLE `tbl_payment_receipts`
  MODIFY `receipt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_phone_verifications`
--
ALTER TABLE `tbl_phone_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_plumbing_permits`
--
ALTER TABLE `tbl_plumbing_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_requirement_categories`
--
ALTER TABLE `tbl_requirement_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_user_business_info`
--
ALTER TABLE `tbl_user_business_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  MODIFY `info_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tb_logins`
--
ALTER TABLE `tb_logins`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `zoning_permits`
--
ALTER TABLE `zoning_permits`
  MODIFY `zoning_id` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `business_esignatures`
--
ALTER TABLE `business_esignatures`
  ADD CONSTRAINT `business_esignatures_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `business_permits` (`BusinessP_id`) ON DELETE CASCADE;

--
-- Constraints for table `business_permits`
--
ALTER TABLE `business_permits`
  ADD CONSTRAINT `business_permits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`);

--
-- Constraints for table `business_permit_assessment`
--
ALTER TABLE `business_permit_assessment`
  ADD CONSTRAINT `fk_bp_assess` FOREIGN KEY (`BusinessP_id`) REFERENCES `business_permits` (`BusinessP_id`) ON DELETE CASCADE;

--
-- Constraints for table `business_permit_doc_verification`
--
ALTER TABLE `business_permit_doc_verification`
  ADD CONSTRAINT `bp_verif_business_fk` FOREIGN KEY (`BusinessP_id`) REFERENCES `business_permits` (`BusinessP_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  ADD CONSTRAINT `fk_appreq_appuid` FOREIGN KEY (`app_uid`) REFERENCES `application_index` (`app_uid`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_requirements` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_archived_documents`
--
ALTER TABLE `tbl_archived_documents`
  ADD CONSTRAINT `tbl_archived_documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tbl_archived_documents_ibfk_2` FOREIGN KEY (`archived_by`) REFERENCES `tb_logins` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `tbl_archived_payments`
--
ALTER TABLE `tbl_archived_payments`
  ADD CONSTRAINT `tbl_archived_payments_ibfk_1` FOREIGN KEY (`receipt_id`) REFERENCES `tbl_payment_receipts` (`receipt_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_archived_payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tbl_archived_payments_ibfk_3` FOREIGN KEY (`archived_by`) REFERENCES `tb_logins` (`user_id`) ON DELETE SET NULL;

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
-- Constraints for table `tbl_document_prices`
--
ALTER TABLE `tbl_document_prices`
  ADD CONSTRAINT `fk_doc_price_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `tb_logins` (`user_id`) ON DELETE SET NULL;

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
-- Constraints for table `tbl_office_positions`
--
ALTER TABLE `tbl_office_positions`
  ADD CONSTRAINT `fk_office_positions_office` FOREIGN KEY (`office_id`) REFERENCES `tbl_offices` (`office_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_payment_receipts`
--
ALTER TABLE `tbl_payment_receipts`
  ADD CONSTRAINT `fk_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `tb_logins` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_phone_verifications`
--
ALTER TABLE `tbl_phone_verifications`
  ADD CONSTRAINT `fk_phoneverif_user` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

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
-- Constraints for table `tbl_user_business_info`
--
ALTER TABLE `tbl_user_business_info`
  ADD CONSTRAINT `fk_user_business_user` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  ADD CONSTRAINT `tbl_user_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `zoning_permits`
--
ALTER TABLE `zoning_permits`
  ADD CONSTRAINT `zoning_permits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
