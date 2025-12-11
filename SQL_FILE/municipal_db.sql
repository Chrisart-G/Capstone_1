-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 11, 2025 at 05:57 AM
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
(0, '40', 'business', 85, 'in-progress', 'test', 35, 'user', '2025-11-29 04:30:22');

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
(11, 'electrical', 39, 29, '2025-10-24 12:55:38'),
(12, 'electronics', 5, 35, '2025-11-20 08:52:00'),
(13, 'business', 77, 29, '2025-11-20 15:07:27'),
(15, 'business', 79, 34, '2025-11-20 15:07:27'),
(16, 'business', 80, 35, '2025-11-20 15:07:27'),
(19, 'building', 2, 29, '2025-11-20 15:07:27'),
(20, 'plumbing', 2, 29, '2025-11-20 15:07:27'),
(22, 'fencing', 4, 29, '2025-11-20 15:07:27'),
(23, 'fencing', 5, 29, '2025-11-20 15:07:27'),
(26, 'electronics', 2, 29, '2025-11-20 15:07:27'),
(27, 'electronics', 3, 33, '2025-11-20 15:07:27'),
(29, 'business', 81, 35, '2025-11-20 15:20:18'),
(30, 'electrical', 43, 35, '2025-11-21 07:46:56'),
(31, 'business', 82, 35, '2025-11-21 15:16:24'),
(32, 'plumbing', 4, 35, '2025-11-21 15:23:09'),
(33, 'plumbing', 5, 35, '2025-11-21 16:57:29'),
(34, 'electronics', 6, 35, '2025-11-23 19:57:07'),
(35, 'business', 83, 35, '2025-11-24 17:11:08'),
(36, 'electrical', 44, 35, '2025-11-24 20:00:30'),
(37, 'cedula', 26, 35, '2025-11-25 16:07:14'),
(38, 'electrical', 45, 35, '2025-11-25 16:42:38'),
(39, 'business', 84, 35, '2025-11-27 07:17:34'),
(40, 'business', 85, 35, '2025-11-28 20:29:55'),
(41, 'electrical', 46, 35, '2025-12-03 19:47:28'),
(42, 'electronics', 7, 35, '2025-12-04 18:59:39'),
(43, 'fencing', 10, 35, '2025-12-05 16:38:49'),
(44, 'plumbing', 6, 35, '2025-12-10 18:48:34');

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
(89, 83, 'Nemo dolore unde exp', 'Voluptatem enim dele', 0.00, 0.00, 0.00, '2025-11-24 17:07:40', '2025-11-24 17:07:40'),
(90, 84, 'Ut doloribus non dol', 'Dolor odit rerum con', 0.00, 0.00, 0.00, '2025-11-27 07:13:43', '2025-11-27 07:13:43'),
(91, 85, 'Voluptatem ullam su', 'Autem et officia ali', 0.00, 0.00, 0.00, '2025-11-28 20:29:03', '2025-11-28 20:29:03');

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
(83, 'new', 'annually', '1977-08-18', 'Tempor est voluptat', 'Vitae voluptate simi', '2003-12-02', 'cooperative', 'partnership', 'single', 'no', '', 'Ge', 'Chris', 'Pa', 'Lawrence Frost', 'Florence Price', 'Rerum tempora volupt', 'In eiusmod', 'vavexuk@mailinator.com', '+1 (566) 117-4763', 'Dolore quibusdam ull', 'Repellendus Velit t', 'Iure sed c', 'necy@mailinator.com', '+1 (413) 685-4968', 'Velit ut saepe est n', 'Karyn Hurley', '+1 (617) 773-6057', 'winogenygy@mailinator.com', 'Ut labore in volupta', 9, 95, 69, 'Jorden Kirby', 'Quas quo omnis incid', '+1 (263) 308-6518', 'japisegi@mailinator.com', 2.00, 'ready-for-pickup', '2025-12-01 04:02:00', NULL, '2025-11-24 17:07:40', '2025-11-26 20:02:50', 35, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit'),
(84, 'new', 'annually', '2024-08-29', 'Dolor animi accusam', 'Ex labore aut dolore', '2000-12-06', 'partnership', 'corporation', 'partnership', 'no', '', 'Ge', 'Chris', 'Pa', 'Fiona Olson', 'Ashely Luna', 'Placeat lorem imped', 'Velit opti', 'dyfajok@mailinator.com', '+1 (498) 319-4896', 'Aut voluptates est e', 'Error rem deserunt a', 'Dolore mol', 'vozobow@mailinator.com', '+1 (286) 353-7009', '099932323', 'Nasim Mullins', '+1 (271) 102-3289', 'womocoha@mailinator.com', 'Lorem sunt error et ', 73, 44, 87, 'Lillian Aguilar', 'Ipsam aut eum et in ', '+1 (773) 229-4721', 'lazelevo@mailinator.com', 11.00, 'ready-for-pickup', '2025-12-01 15:23:00', NULL, '2025-11-27 07:13:43', '2025-12-03 10:34:50', 35, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit'),
(85, 'new', 'semi-annually', '1987-12-24', 'Iusto dolorem irure ', 'Sunt velit velit de', '2013-12-15', 'single', 'partnership', 'single', 'no', '', 'Ge', 'Chris', 'Pa', 'Russell Wynn', 'Reece Dickerson', 'Est similique ad non', 'Deserunt p', 'kuhaz@mailinator.com', '+1 (683) 231-4135', 'Quia labore tempore', 'Voluptates facere ei', 'Ut ut sunt', 'jolyduda@mailinator.com', '+1 (203) 632-4546', '0933333333', 'Athena Ayala', '+1 (358) 656-2421', 'pygenihy@mailinator.com', '900sqm', 22, 86, 18, 'John Conner', 'Rerum aut incidunt ', '+1 (338) 221-8541', 'jyda@mailinator.com', 19000.00, 'in-review', NULL, NULL, '2025-11-28 20:29:03', '2025-12-03 11:14:34', 35, '/uploads/requirements/business_permit_85_lgu_form.pdf', NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit');

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
(1, 85, '{\"gross_sales_tax\":{\"amount\":21,\"penalty\":32,\"total\":53},\"delivery_vans_trucks_tax\":{\"amount\":32,\"penalty\":32,\"total\":64},\"combustible_storage_tax\":{\"amount\":32,\"penalty\":32,\"total\":64},\"signboard_billboards_tax\":{\"amount\":32,\"penalty\":32,\"total\":64},\"mayors_permit_fee\":{\"amount\":323,\"penalty\":32,\"total\":355},\"garbage_charges\":{\"amount\":3,\"penalty\":2,\"total\":5},\"trucks_vans_permit_fee\":{\"amount\":232,\"penalty\":32,\"total\":264},\"sanitary_inspection_fee\":{\"amount\":323,\"penalty\":23,\"total\":346},\"building_inspection_fee\":{\"amount\":232,\"penalty\":3,\"total\":235},\"electrical_inspection_fee\":{\"amount\":23,\"penalty\":23,\"total\":46},\"mechanical_inspection_fee\":{\"amount\":23,\"penalty\":23,\"total\":46},\"plumbing_inspection_fee\":{\"amount\":23,\"penalty\":232,\"total\":255},\"signboard_renewal_fee\":{\"amount\":32,\"penalty\":232,\"total\":264},\"combustible_sale_storage_fee\":{\"amount\":32,\"penalty\":3,\"total\":35},\"others_fee\":{\"amount\":2,\"penalty\":323,\"total\":325}}', 2421.00, 363.15, '2025-12-03 15:12:41', '2025-12-03 18:01:17');

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
(1, 85, 'not_needed', 'not_needed', 'not_needed', 'not_needed', 'not_needed', 'not_needed', 'not_needed', 'not_needed', '2025-11-28 21:23:19', '2025-12-03 18:00:54');

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

--
-- Dumping data for table `electrical_form_submissions`
--

INSERT INTO `electrical_form_submissions` (`id`, `application_id`, `requirement_id`, `user_id`, `status`, `box2`, `box3`, `box4`, `box5`, `sig_box2`, `sig_owner`, `sig_lot`, `draft_pdf_path`, `final_pdf_path`, `created_at`, `updated_at`) VALUES
(1, 46, NULL, NULL, 'submitted', '{\"engineer_name\":\"Alberto D Lain-Ulo\",\"date\":\"2027-06-05\",\"address\":\"Molestiae mollit et \",\"prc_no\":\"21212\",\"validity\":\"ddddd\",\"ptr_no\":\"321312\",\"date_issued\":\"2024-02-25\",\"issued_at\":\"323\",\"tin\":\"21312312312\",\"signature_data_url\":\"data:image/png;base64,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\",\"professional_name\":\"A numquam eiusmod in\",\"professional_date\":\"1986-09-25\"}', '{\"role\":\"rme\",\"signed_name\":\"Nobis rem ut sed est\",\"date\":\"1992-09-27\",\"prc_no\":\"Non nobis quidem non\",\"validity\":\"Consequatur qui eu s\",\"ptr_no\":\"Cumque ea repudianda\",\"date_issued\":\"2007-10-10\",\"issued_at\":\"Non quia ut vel adip\",\"tin\":\"Aut consequuntur qui\",\"address\":\"Velit dolore volupta\",\"signed_date\":\"1981-07-20\",\"ptr_date_issued\":\"1975-05-13\"}', '{\"owner_name\":\"Temporibus voluptatu\",\"date\":\"1984-12-25\",\"address\":\"Eligendi est est ve\",\"signature_data_url\":\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAB4CAYAAAAKRZZvAAAQAElEQVR4AezczY4k2VUH8Ooey9jSaHpmWLFhwcYrngAWlngBHgiJR+IFWCABLwAbbxCwYYXmo8HYyNPdvv9yn5rb0ZGdFZURWRE3f6U+ExmR9+Pc362x7+msmpd3vggQIECAAAECBAgQIHAlAQXIlaBNQ+BjAU8IECBAgAABArcnoAC5vT23YgIECBAgQIAAAQLPJqAAeTZ6ExMgQIAAAQIEbk/AigkoQHwPECBAgAABAgQIECBwNQEFyNWopxO5J0CAAAECBAgQIHB7AgqQ29tzKyZAgAABAgQIECDwbAIKkGejNzEBAgQIELg9ASsmQICAAsT3AAECBAgQIECAAIHxBXazQgXIbrZCIgQIECBAgAABAgTGF1CAjL/HVjgVcE+AAAECBAgQIPBsAgqQZ6M3MQECBG5PwIoJECBAgIACxPcAAQIECBAgQGB8ASsksBsBBchutkIiBAgQIECAAAECBMYXuL0CZPw9tUICBAgQIECAAAECuxVQgOx2ayRGYDwBKyJAgAABAgQIKEB8DxAgQIAAgfEFrJAAAQK7EVCA7GYrJEKAAAECBAgQIDCegBVNBRQgUxH3BAgQIECAAAECBAhsJqAA2YzWwFMB9wQIECBAgAABAgQUIL4HCBAgML6AFRIgQIAAgd0IKEB2sxUSIUCAAAECBMYTsCICBKYCCpCpiHsCBAgQIECAAAECBDYTuFoBstkKDEyAAAECBAgQIECAwGEEFCCH2SqJEniygI4ECBAgQIAAgd0IKEB2sxUSIUCAAIHxBKyIAAECBKYCCpCpiHsCBAgQIECAAIHjC1jBbgUUILvdGokRIECAAAECBAgQGE9AATLenk5X5J4AAQIECBAgQIDAbgQUILvZCokQIDCegBURIECAAAECUwEFyFTEPQECBAgQIHB8ASsgQGC3AgqQ3W6NxAgQIECAAAECBAgcT+BcxgqQc0LeJ0CAAAECBAgQIEBgNQEFyGqUBiIwFXBPgAABAgQIECAwFVCATEXcEyBAgMDxBayAAAECBHYroADZ7dZIjAABAgQIECBwPAEZEzgnoAA5J+R9AgQIECBAgAABAgRWE1CArEY5Hcg9AQIECBAgQIAAAQJTAQXIVMQ9gUEFvvjiix+++uqrd7kOusQfl+UVAQIECBAgsFsBBchut0ZiBC4XSLGRoiPxWfvKiK9fv/5JroIAAQJbCBiTAAEC5wQUIOeEvE/goAJ90VFLeNe+6rUrAQIECBAgMJTAYRajADnMVkmUwOMFUnzMtf7uu+/8Oz8H4xkBAgQIECBwNQGHkatRm+hqAjc+UV98tA883q3NkR/r+vLLL98uifRZOw/jESBAgAABAscUUIAcc99kTWBWYFp89J94vGlfs50e8TAFRMZOfNa+Xiz8al0+e8Q0mgwgYAkECBAgQOCcgALknJD3CRxAoAqESjWffKT4SMFQz5b+8nmNmTEUEKXoSoAAgd0KSIzAYQQUIIfZKokSmBfIj0L1BcJc8ZFn870/fHqu6Ggforz59ttvXzw2PhzdHQECBAgQIEDg7m68AsSuErghgXw6kZ+GqiWnMJh+8pHiI8+qzfS6pOhY+inKdC73BAgQIECAAAEFiO8BAgcUqKKhTz3FR+5TlOSa+FTxUWP0n56kT6L/pGNJ0ZG+I0fM8onTY6J3SL/Ep/r17b0mQIAAAQIjCyhARt5daxtSIAfZvmhIkfHY4iN9U6Ak+jECVeNkrDWKjhy2M24iY+e6Vbx69er/EplzzYhTHzHLJ06PiWm/c323sjHuzQhYKAECBA4joAA5zFZJlMDdXQ61OciWRT6pqB+vysG7nufAX8/zrAqPvm+eJ1JwJPr2eX5p5JBeY1w6doqLRNYYg2m8fPny54nMuWZU/ltfs19bz2F8AgQIENhKwLhLBRQgS8W0J/AMAlVA9FOnaKhPKnIwz8E77+cwmwN/9clhfVp4pE36J9Jn7cicNeZj52j5/ibrSN9ppLhI1Bpr7D1fY5zI+k9F5Z/9qteuBAgQIEBgdAEFyOg7fMX1mWobgRzK+wKiDrU1Wzu4/9AfzN+2rxzg+z7Vtg7CWx54k2/Nl1zr9alry/837/P9Wb+OU+3recZO1Jrqmk+F8rzaLb2mb2JJv8zd98l9jBOnxsmaT73nOQECBAgQGFlAATLy7lrboQXawfyHHFL7Q3kdbPuFTQuN6X0OxumX6Ptt8To59/l+6gDe2j4UHnO5JO9E8p6LjJ1I3zbWvVW8sv4+h7w/Fxk7xUo/dp6lb2LaJ++12u5/cp2+l3nn+kzb1X3a1+u58eq9BVdNCRAgQIDAYQQUIIfZKonekkA+RchButacQ2oOynVf1/4gW8/qmvaJOqTX8y2vfc6Ze26uVizMFh5p30fyTsyNkWdtnA+KjjybRtwS/bj1OmP3P8IWy2kRUW1zTfvvv//+i1xz34qR76fz5T7z5XoqMk+9l7YZr+5PXb/++uu/T7S+//3YaO3/a61oc/7bwviX1v5c/GNrcyr+rr13H+3fhb895eI5gX0IyIIAgaUCCpClYtoT2FCgDtX9QTiH3ekhtR3O3iWmqeRAm/aJ6Xtb37eD4tua49T8ybkVKT+rdrmmbSKvz0X5vB/ns2n7fv0ZM26Jabu6T84Zq/fOe+mbyOtT0eb6fO69ufn6vKtP6/+u2rZC4Z8SLZ83yWcare1fJVrfP35stPZ/sla0Of9sYfx5a38u/rK1ORV/3d67j7Y3f9Ncftnu/SFAgACBQQRWK0AG8bAMAs8mkENqO5w/HKrb4fFdfwjO+3UwnSZZP0pUB9rp+9e4bwfFF5kneefaRztAvk3u/bOW82/79fXvTV9X/96n2mS+jJN47PprvMq5xsoYibo/dU3/uVym7bPmxFzbzJ33Em0Nf5Foz/xv8h8Q37VLxf+21/4QIECAwEAC/s9uoM20lOMK5BDaH1Lb4fxNHaar8Ojfr5W2Q2uKlBf1o0T1/NrXHMhrzsq77rO2drC+L07yrMv557k/FbXuaf9qn0IhMZ2v3p+71ph9PmmXcRJ5fS5m8vnXvk/er+ifP+H169bndfK6wXjZ1lzxVdvjf2gW/hAgQIDAIAIKkEE20jKOK5DDap99O3jdFxR1WJ4rPNI+B/l2MNvFv8N1oE9Oya2iL0zyLGs7lXOtNx6JuXWnf0XGWxJzY54bq/X5VVvD/7fr/Y+85TozZ37UaObxJx/9ur376+b2z5XDzPVVe/aqtfNn1wKSI0CAAIGlArs4vCxNWnsCowq0A+f9JwXt0Pt27gBe685B/9RBvtpc65pca64+p1ZQ/LYdsO/Xk/drbXld0dqc/UXyfBqUvonqt+Rac/R9Mlaif1avW5Hxqxb3BUd79ou2hp+26+I/fd6ZaxKft/vPv/nmm/wOxOKxdSBAgACBu7s7CIcVUIAcduskPoJAf3hPUZE15fDbDr0nD+5p1x/00+c5o3JNXn0erYD6o7pvh+379VQxkDUmWpuH33mptrn2h/dLfrxsOkdyrFwyT0Vr90HRUc+XXmv8zHFJ3kvn1Z4AAQIECBxJQAFypN2az9XTAwu8bV9JPwfX9vKjX9TOQbYdjvPLuGl2l3Z7Kj7uk3r/j+T//uVdn3OKidwnThUcWVfWWnHp4T2FXearfHLN2GXX3v/PFm8S79v9Im2eGpV/jf/UcfQjQIAAAQK3IKAAuYVdtsbdCuSgnYNxPkXoD+d1oH1/OL7PP8/2dsBtB/iH//Ru8k++ifuE3/8jz9+//OCSwiRrT6y1rvqEJZ41WdwyR923nH/Z3v/TFi8T9Xzp9Q/jfvsiY6+V/9IctCdAgAABAkcUUIAccdfkPJTA9MBeB9r+eQ67Rz/kZg1ZW0WKrzU3shUWH/3eTOaacfuP5PLUuTNmYmbcpw6pHwECTxHQhwCBwwooQA67dRI/ukD9bX2tI4fiHGxzf5Tio32CcP+7Hcm5IutI1P01rvHqc8n8+YQlRUne66O1+/cWH+X9qTwzVvYm8al23iNAgAABArcgcOkaFSCXCupP4AkCORj3P5qUA3P9jXoOyzVk/7ye7emaA/k0so5Ecu9zzaE/a0tk/U+J9J2Lfp68zlzxzTX3SyJ5T9e09qc1S/LRlgABAgQIjCagABltR63nigJPmyoH6P5gnMNufoE7zxM1ag7COcjX/dGuyT1ra58e/G6ae9b/lJiOs/Z98k3ea49rPAIECBAgQOBHAQXIjxZeEdhcoC8warI8y9/W132uRy8+soaK9unBT3OwT8wVI9Vu6TVGFW3cN0v79+0zTvLrn3m9cwHpESBAgMBhBRQgh906iY8okIN0DsKj/i18X4xknZdEjCrauD+J3ZLviSo6kkPGWdJXWwIECNyygLUTuFRAAXKpoP4ELhTIwTmH4EQO0hcOd7PdYxfDx4ai42a/VSycAAECBJ5ZQAHy5A3QkcBlAnVQzsH5spH0JkCAAAECBAgcR0ABcpy9kukAAv2P/QywnOdbgpkJECBAgACBwwooQA67dRI/ooAf+znirsmZAIFewGsCBAhcKqAAuVRQfwIECBAgQIAAAQLbCwwzgwJkmK20EAIECBAgQIAAAQL7F1CA7H+PZDgVcE+AAAECBAgQIHBYAQXIYbdO4gQIELi+gBkJECBAgMClAgqQSwX1J0CAAAECBAhsL2AGAsMIKECG2UoLIUCAAAECBAgQILB/geMVIPs3lSEBAgQIECBAgAABAicEFCAnYDwmQOBjAU8IECBAgAABApcKKEAuFdSfAAECBAhsL2AGAgQIDCOgABlmKy2EAAECBAgQIEBgfQEjri2gAFlb1HgECBAgQIAAAQIECJwUUICcpPHGVMA9AQIECBAgQIAAgUsFFCCXCupPgACB7QXMQIAAAQIEhhFQgAyzlRZCgAABAgQIrC9gRAIE1hZQgKwtajwCBAgQIECAAAECBE4KPLoAOTmCNwgQIECAAAECBAgQIPBIAQXII6E0I/CMAqYmQIAAAQIECAwjoAAZZisthAABAgTWFzAiAQIECKwtoABZW9R4BAgQIECAAAEClwsYYVgBBciwW2thBAgQIECAAAECBPYnoADZ355MM3JPgAABAgQIECBAYBgBBcgwW2khBAisL2BEAgQIECBAYG0BBcjaosYjQIAAAQIELhcwAgECwwooQIbdWgsjQIAAAQIECBAgsFxg6x4KkK2FjU+AAAECBAgQIECAwIOAAuSBwgsCUwH3BAgQIECAAAECawsoQNYWNR4BAgQIXC5gBAIECBAYVkABMuzWWhgBAgQIECBAYLmAHgS2FlCAbC1sfAIECBAgQIAAAQIEHgQUIA8U0xfuCRAgQIAAAQIECBBYW0ABsrao8QgQuFzACAQIECBAgMCwAgqQYbfWwggQIECAwHIBPQgQILC1gAJka2HjEyBAgAABAgQIEDgvcDMtFCA3s9UWSoAAAQIECBAgQOD5BRQgz78HMpgKuCdAgAABAgQIkBYeVgAAARBJREFUEBhWQAEy7NZaGAECBJYL6EGAAAECBLYWUIBsLWx8AgQIECBAgMB5AS0I3IyAAuRmttpCCRAgQIAAAQIECDy/wP4KkOc3kQEBAgQIECBAgAABAhsJKEA2gjUsgSMKyJkAAQIECBAgsLWAAmRrYeMTIECAAIHzAloQIEDgZgQUIDez1RZKgAABAgQIECDwsYAn1xZQgFxb3HwECBAgQIAAAQIEblhAAXLDmz9dunsCBAgQIECAAAECWwsoQLYWNj4BAgTOC2hBgAABAgRuRkABcjNbbaEECBAgQIDAxwKeECBwbQEFyLXFzUeAAAECBAgQIEDghgUeCpAbNrB0AgQIECBAgAABAgSuJPB7AAAA//9nVVUYAAAABklEQVQDACds0FrAzLNYAAAAAElFTkSuQmCC\",\"owner_date\":\"1989-04-24\"}', '{\"lot_owner_name\":\"Enim facere dolorem \",\"date\":\"2019-02-09\",\"address\":\"Ex est anim tempor f\",\"signature_data_url\":\"data:image/png;base64,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\",\"lot_owner_date\":\"1983-02-25\"}', 'data:image/png;base64,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', 'data:image/png;base64,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', 'data:image/png;base64,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', '/uploads/user_filled/electrical/electrical-46-signed-preview.pdf', '/uploads/user_filled/electrical/electrical-46-userfilled-1764939543246.pdf', '2025-12-03 21:55:17', '2025-12-05 12:59:03');

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

--
-- Dumping data for table `electronics_form_submissions`
--

INSERT INTO `electronics_form_submissions` (`id`, `application_id`, `status`, `box2`, `box3`, `box4`, `box5`, `sig_box2`, `sig_owner`, `sig_lot`, `draft_pdf_path`, `final_pdf_path`, `created_at`, `updated_at`) VALUES
(27, 7, 'submitted', '{\"engineer_name\":\"restwww\",\"date\":\"1984-05-03\",\"address\":\"Explicabo Exercitat\",\"prc_no\":\"Laudantium sint inv\",\"validity\":\"Et quo qui nihil nat\",\"ptr_no\":\"Sit laboriosam offi\",\"date_issued\":\"2025-07-28\",\"issued_at\":\"Quis ab illo iure qu\",\"tin\":\"Quis earum rerum ad \",\"signature_data_url\":\"data:image/png;base64,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\"}', '{\"role\":\"re\",\"signed_name\":\"Odio voluptas repreh\",\"date\":\"2007-04-20\",\"prc_no\":\"Et sed magni quia ne\",\"validity\":\"Dolor illo ea sit c\",\"ptr_no\":\"Et voluptas excepteu\",\"date_issued\":\"1982-04-26\",\"issued_at\":\"Totam ipsam corporis\",\"tin\":\"Recusandae Sed vero\",\"address\":\"Ad quo sed ratione m\",\"signature_data_url\":\"data:image/png;base64,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\"}', '{\"owner_name\":\"Et ipsa vel ullam s\",\"date\":\"2007-02-25\",\"address\":\"Cupiditate dolor sun\",\"signature_data_url\":\"data:image/png;base64,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\"}', '{\"lot_owner_name\":\"Accusamus dolor tene\",\"date\":\"2012-06-26\",\"address\":\"Dolor autem at facer\",\"signature_data_url\":\"data:image/png;base64,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\"}', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAB4CAYAAAAKRZZvAAAJL0lEQVR4AezXMZIjIQwF0K29/6Enc4DLhTHQSOJNNLgbkJ46+f//+SNAgAABAgQIECBAgMBDAgLIQ9CuIfAu4BcCBAgQIECAwH0CAsh9M9cxAQIECBAgQIAAgWMCAsgxehcTIECAAAECBO4T0DEBAcQ3QIAAAQIECBAgQIDAYwICyGPU7UXWBAgQIECAAAECBO4TEEDum7mOCRAgQIAAAQIECBwTEECO0buYAAECBAjcJ6BjAgQICCC+AQIECBAgQIAAAQL1BcJ0KICEGYVCCBAgQIAAAQIECNQXEEDqz1iHrYA1AQIECBAgQIDAMQEB5Bi9iwkQIHCfgI4JECBAgIAA4hsgQIAAAQIECNQX0CGBMAICSJhRKIQAAQIECBAgQIBAfYH7Akj9meqQAAECBAgQIECAQFgBASTsaBRGoJ6AjggQIECAAAECAohvgAABAgQI1BfQIQECBMIICCBhRqEQAgQIECBAgACBegI6agUEkFbEmgABAgQIECBAgACBbQICyDZaB7cC1gQIECBAgAABAgQEEN8AAQIE6gvokAABAgQIhBEQQMKMQiEECBAgQIBAPQEdESDQCgggrYg1AQIECBAgQIAAAQLbBB4LINs6cDABAgQIECBAgAABAmkEBJA0o1IogZ8FbCRAgAABAgQIhBEQQMKMQiEECBAgUE9ARwQIECDQCgggrYg1AQIECBAgQIBAfgEdhBUQQMKORmEECBAgQIAAAQIE6gkIIPVm2nZkTYAAAQIECBAgQCCMgAASZhQKIUCgnoCOCBAgQIAAgVZAAGlFrAkQIECAAIH8AjogQCCsgAASdjQKI0CAAAECBAgQIJBPoFexANIT8pwAAQIECBAgQIAAgWUCAsgySgcRaAWsCRAgQIAAAQIEWgEBpBWxJkCAAIH8AjogQIAAgbACAkjY0SiMAAECBAgQIJBPQMUEegICSE/IcwIECBAgQIAAAQIElgkIIMso24OsCRAgQIAAAQIECBBoBQSQVsSaAIH8AjogQIAAAQIEwgoIIGFHozACBAgQIJBPQMUECBDoCQggPSHPCRAgQIAAAQIECMQXSFOhAJJmVAolQIAAAQIECBAgkF9AAMk/Qx20AtYECBAgQIAAAQJhBQSQsKNRGAECBPIJqJgAAQIECPQEBJCekOcECBAgQIAAgfgCKiSQRkAASTMqhRIgQIAAAQIECBDIL1AvgOSfiQ4IECBAgAABAgQIlBUQQMqOVmMEnhdwIwECBAgQIECgJyCA9IQ8J0CAAAEC8QVUSIAAgTQCAkiaUSmUAAECBAgQIEAgnoCKRgUEkFEx7xMgQIAAAQIECBAg8LOAAPIznY2tgDUBAgQIECBAgACBnoAA0hPynAABAvEFVEiAAAECBNIICCBpRqVQAgQIECBAIJ6AiggQGBUQQEbFvE+AAAECBAgQIECAwM8CywLIzxXYSIAAAQIECBAgQIDANQICyDWj1mhhAa0RIECAAAECBNIICCBpRqVQAgQIEIgnoCICBAgQGBUQQEbFvE+AAAECBAgQIHBeQAVpBQSQtKNTOAECBAgQIECAAIF8AgJIvpm1FVsTIECAAAECBAgQSCMggKQZlUIJEIgnoCICBAgQIEBgVEAAGRXzPgECBAgQIHBeQAUECKQVEEDSjk7hBAgQIECAAAECBJ4XmL1RAJkVtJ8AAQIECBAgQIAAga8FBJCvqbxIoBWwJkCAAAECBAgQGBUQQEbFvE+AAAEC5wVUQIAAAQJpBQSQtKNTOAECBAgQIEDgeQE3EpgVEEBmBe0nQIAAAQIECBAgQOBrAQHka6r2RWsCBAgQIECAAAECBEYFBJBRMe8TIHBeQAUECBAgQIBAWgEBJO3oFE6AAAECBJ4XcCMBAgRmBQSQWUH7CRAgQIAAAQIECOwXKHODAFJmlBohQIAAAQIECBAgEF9AAIk/IxW2AtYECBAgQIAAAQJpBQSQtKNTOAECBJ4XcCMBAgQIEJgVEEBmBe0nQIAAAQIECOwXcAOBMgICSJlRaoQAAQIECBAgQIBAfIF8ASS+qQoJECBAgAABAgQIEPggIIB8gPEzAQLvAn4hQIAAAQIECMwKCCCzgvYTIECAAIH9Am4gQIBAGQEBpMwoNUKAAAECBAgQILBewImrBQSQ1aLOI0CAAAECBAgQIEDgo4AA8pHGg1bAmgABAgQIECBAgMCsgAAyK2g/AQIE9gu4gQABAgQIlBEQQMqMUiMECBAgQIDAegEnEiCwWkAAWS3qPAIECBAgQIAAAQIEPgp8HUA+nuABAQIECBAgQIAAAQIEvhQQQL6E8hqBgwKuJkCAAAECBAiUERBAyoxSIwQIECCwXsCJBAgQILBaQABZLeo8AgQIECBAgACBeQEnlBUQQMqOVmMECBAgQIAAAQIE4gkIIPFm0lZkTYAAAQIECBAgQKCMgABSZpQaIUBgvYATCRAgQIAAgdUCAshqUecRIECAAAEC8wJOIECgrIAAUna0GiNAgAABAgQIECAwLrB7hwCyW9j5BAgQIECAAAECBAi8BASQF4V/CLQC1gQIECBAgAABAqsFBJDVos4jQIAAgXkBJxAgQIBAWQEBpOxoNUaAAAECBAgQGBewg8BuAQFkt7DzCRAgQIAAAQIECBB4CQggL4r2H2sCBAgQIECAAAECBFYLCCCrRZ1HgMC8gBMIECBAgACBsgICSNnRaowAAQIECIwL2EGAAIHdAgLIbmHnEyBAgAABAgQIEOgLXPOGAHLNqDVKgAABAgQIECBA4LyAAHJ+BipoBawJECBAgAABAgTKCgggZUerMQIECIwL2EGAAAECBHYLCCC7hZ1PgAABAgQIEOgLeIPANQICyDWj1igBAgQIECBAgACB8wLxAsh5ExUQIECAAAECBAgQILBJQADZBOtYAhkF1EyAAAECBAgQ2C0ggOwWdj4BAgQIEOgLeIMAAQLXCAgg14xaowQIECBAgAABAu8CfnlaQAB5Wtx9BAgQIECAAAECBC4WEEAuHn7bujUBAgQIECBAgACB3QICyG5h5xMgQKAv4A0CBAgQIHCNgAByzag1SoAAAQIECLwL+IUAgacFBJCnxd1HgAABAgQIECBA4GKBVwC52EDrBAgQIECAAAECBAg8JPAHAAD//91JTAgAAAAGSURBVAMAOxUA8UEft98AAAAASUVORK5CYII=', 'data:image/png;base64,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', 'data:image/png;base64,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', '/uploads/system_generated/electronics/previews/electronics-preview-7-1764931420124.pdf', '/uploads/system_generated/electronics/user_filled/electronics-userfilled-7-1764931423542.pdf', '2025-12-05 08:29:57', '2025-12-05 10:43:43');

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

--
-- Dumping data for table `fencing_form_submissions`
--

INSERT INTO `fencing_form_submissions` (`application_id`, `status`, `box2`, `box3`, `box4`, `box5`, `sig_box2`, `sig_owner`, `sig_lot`, `draft_pdf_path`, `final_pdf_path`, `updated_at`) VALUES
(10, 'submitted', '{\"engineer_name\":\"Proident sed porro \",\"date\":\"1970-03-23\",\"address\":\"Corporis cupidatat n\",\"prc_no\":\"Quas consequuntur au\",\"validity\":\"Numquam vero minima \",\"ptr_no\":\"Qui non minus pariat\",\"date_issued\":\"1994-09-24\",\"issued_at\":\"Dolorem aut quas quo\",\"tin\":\"Et et minim minim qu\",\"signature_data_url\":\"data:image/png;base64,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\"}', '{\"role\":\"pe\",\"signed_name\":\"Expedita sunt aliqui\",\"date\":\"1997-06-24\",\"prc_no\":\"Ut nisi quo nihil vo\",\"validity\":\"Voluptatem ut repell\",\"ptr_no\":\"Et sequi provident \",\"date_issued\":\"2019-02-04\",\"issued_at\":\"Pariatur Sed sint c\",\"tin\":\"Eiusmod velit qui ip\",\"address\":\"Vel recusandae At a\",\"signature_data_url\":\"data:image/png;base64,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\"}', '{\"owner_name\":\"Ipsam expedita eius \",\"date\":\"1975-04-16\",\"address\":\"Ut necessitatibus ne\",\"signature_data_url\":\"data:image/png;base64,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\"}', '{\"lot_owner_name\":\"Eu labore qui eiusmo\",\"date\":\"2014-03-07\",\"address\":\"Dignissimos libero a\",\"signature_data_url\":\"data:image/png;base64,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\"}', 'data:image/png;base64,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', 'data:image/png;base64,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', 'data:image/png;base64,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', NULL, '/uploads/system_generated/fencing/user_filled/fencing-userfilled-10-1764954975425.pdf', '2025-12-06 01:16:15');

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

--
-- Dumping data for table `plumbing_form_submissions`
--

INSERT INTO `plumbing_form_submissions` (`application_id`, `status`, `box2`, `box3`, `box4`, `box5`, `box6`, `sig_box2`, `sig_box4`, `sig_box5`, `sig_box6`, `draft_pdf_path`, `final_pdf_path`, `updated_at`) VALUES
(6, 'submitted', '{\"fixtures_left\":{\"water_closet\":{\"qty\":\"63\",\"is_new\":true,\"is_existing\":false},\"floor_drain\":{\"qty\":\"94\",\"is_new\":true,\"is_existing\":false},\"lavatory\":{\"qty\":\"21\",\"is_new\":false,\"is_existing\":false},\"kitchen_sink\":{\"qty\":\"6\",\"is_new\":true,\"is_existing\":true},\"faucet\":{\"qty\":\"76\",\"is_new\":true,\"is_existing\":true},\"shower_head\":{\"qty\":\"52\",\"is_new\":true,\"is_existing\":true},\"water_meter\":{\"qty\":\"1\",\"is_new\":true,\"is_existing\":true},\"grease_trap\":{\"qty\":\"15\",\"is_new\":false,\"is_existing\":false},\"bath_tub\":{\"qty\":\"31\",\"is_new\":false,\"is_existing\":true},\"slop_sink\":{\"qty\":\"12\",\"is_new\":true,\"is_existing\":true},\"urinal\":{\"qty\":\"5\",\"is_new\":true,\"is_existing\":false},\"aircon_unit\":{\"qty\":\"56\",\"is_new\":true,\"is_existing\":false},\"water_tank\":{\"qty\":\"98\",\"is_new\":true,\"is_existing\":false}},\"fixtures_right\":{\"bidet\":{\"qty\":\"36\",\"is_new\":false,\"is_existing\":false},\"laundry_trays\":{\"qty\":\"14\",\"is_new\":false,\"is_existing\":true},\"dental_cuspidor\":{\"qty\":\"24\",\"is_new\":true,\"is_existing\":false},\"drinking_fountain\":{\"qty\":\"81\",\"is_new\":false,\"is_existing\":true},\"bar_sink\":{\"qty\":\"50\",\"is_new\":false,\"is_existing\":true},\"soda_fountain_sink\":{\"qty\":\"80\",\"is_new\":true,\"is_existing\":false},\"laboratory_sink\":{\"qty\":\"67\",\"is_new\":true,\"is_existing\":false},\"sterilizer\":{\"qty\":\"44\",\"is_new\":false,\"is_existing\":false},\"others\":{\"qty\":\"96\",\"is_new\":true,\"is_existing\":true,\"text\":\"Placeat dolor aliqu\"}},\"systems\":{\"water_distribution\":false,\"sewage_system\":false,\"septic_tank\":true,\"storm_drainage\":true},\"signature_data_url\":\"data:image/png;base64,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\"}', '{\"signed_name\":\"Et recusandae Est s\",\"date\":\"2022-12-17\",\"prc_no\":\"Praesentium mollit u\",\"validity\":\"Ut eum voluptatem E\",\"ptr_no\":\"Assumenda voluptatem\",\"date_issued\":\"2018-03-21\",\"issued_at\":\"Rerum nihil in obcae\",\"tin\":\"Similique illo volup\",\"address\":\"Unde dolor voluptas \",\"signature_data_url\":\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAB4CAYAAAAKRZZvAAAPIUlEQVR4AezdQY/jZhkHcLalCA6gmTnR264Eggt8ArZsvwGV4N4VFVKBQxEcQV0ER6RyKOVC1b2D1J6R0C60n6BcQIC2N3qaHcEBRGGH58nGkcczTpyNndivfygPsR3n9fv+3szW/0nieepj/keAAAECBAgQIECAAIE9CQgge4J2GAKXBWwhQIAAAQIECMxPQACZ35wbMQECBAgQIECAAIGDCQggB6N3YAIECBAgQIDA/ASMmIAA4jVAgAABAgQIECBAgMDeBASQvVE3D2SdAAECBAgQIECAwPwEBJD5zbkREyBAgAABAgQIEDiYgAByMHoHJkCAAAEC8xMwYgIECAggXgMECBAgQIAAAQIEyhcYzQgFkNFMhY4QIECAAAECBAgQKF9AACl/jo2wKWCdAAECBAgQIEDgYAICyMHoHZgAAQLzEzBiAgQIECAggHgNECBAgAABAgTKFzBCAqMREEBGMxU6QoAAAQIECBAgQKB8gfkFkPLn1AgJECBAgAABAgQIjFZAABnt1OgYgfIEjIgAAQIECBAgIIB4DRAgQIAAgfIFjJAAAQKjERBARjMVOkKAAAECBAgQIFCegBE1BQSQpoh1AgQIECBAgAABAgQGExBABqPVcFPAOgECBAgQIECAAAEBxGuAAAEC5QsYIQECBAgQGI2AADKaqdARAgQIECBAoDwBIyJAoCkggDRFrBMgQIAAAQIECBAgMJjA3gLIYCPQMAECBAgQIECAAAECkxEQQCYzVTpK4IkFPJEAAQIECBAgMBoBAWQ0U6EjBAgQIFCegBERIECAQFNAAGmKWCdAgAABAgQIEJi+gBGMVkAAGe3U6BgBAgQIECBAgACB8gQEkPLmtDki6wQIECBAgAABAgRGIyCAjGYqdIQAgfIEjIgAAQIECBBoCgggTRHrBAgQIECAwPQFjIAAgdEKCCCjnRodI0CAAAECBAgQIDA9gU09FkA2CXmcAAECBAgQIECAAIHeBASQ3ig1RKApYJ0AAQIECBAgQKApIIA0RawTIECAwPQFjIAAAQIERisggIx2anSMAAECBAgQIDA9AT0msElAANkk5HECBAgQIECAAAECBHoTEEB6o2w2ZJ0AAQIECBAgQIAAgaaAANIUsU6AwPQFjIAAAQIECBAYrYAAMtqp0TECBAgQIDA9AT0mQIDAJgEBZJOQxwkQIECAAAECBAiMX2AyPRRAJjNVOkqAAAECBAgQIEBg+gICyPTn0AiaAtYJECBAgAABAgRGKyCAjHZqDt+x4+Pjv0Wdq+N1Bo/CJ+s/cZ/1MO4fnpyc/Ckrlt+u1cuHn1U9IDCsgNYJECBAgMAmAQFkk9C8H//dvIffafTXYq+sZ+I+6yjuj87Pz7+QFctfq9UbEUauCjMZYLIywFS1CjGNIPNytCHIBKobAQIECFwQsEJgMgICyGSmav8dffjw4beirqmHFwxiJr5dq3di+Z1r1679OSuWz5b1Udxnncd9VbF45S0DTFYGmKpWIaYRZN6IFq4KMhlgsqoAk/dCTGC5ESBAgAABAuMSKC+AjMtXbwoUiED2y1q9EMsvnJ6efjErlo+X9Ym4z3oq7qtaBZlgaQ0xtSCTAaaqfYSY5rszH8W7LfX6R6zX60GsV/X7WK7X67G+qngX5+v1ivG7ESBAgAABAjMVEEBmOvGGfViBCCWtIaYWZDLAVHUpxEQb+a5JFWQuvBPzhCGmifLx2FCvT8d6va7HelXPxfJztfpOLK8q3sX5db0inDTDTnO9HnxyuR58crkKPnlfDz65vAo+cZzX68Enl6NfbgQIECBAgMABBQSQA+I79P4Fjo6OfpgVJ6bvZsUJ6d+j/lVVbPtfVPNkeLTrIbj4SFbcL75rEif5i++e5H1sy++jVB/pyvsMLFnx0Ohv9eCTy/Xgk8tV8Mn7vsPPaOf7AK/NDHhd6l70rbXi5+utjnUn9mut+Nl9sUPdin261PXYr7VG/xNyuYO2ECBAYDICAshkpkpH6wJx4rAKEnHCkiEiaxEk4kQoQ0TWpRPJeGfgJ1nR1ley4kT9s1GfrCq2+ZkIBDcCS4EMeF3qVuzfWvHz9WLHejX2a6342X2rQ92LfbrUg9ivteLfkfz340H8W5PjiuG5ESBAoE3A9m0FnGxtK2b/vQrEf/x/FicC70flx3DyS9Z5UnAeJw6rIBEnLBkishZBIjqYr+usWNx4exRt/btWH8Yz3suKdn+UH3NSF7+EX4pHzPHNrJjn7y3rzbh/M7bdj/prraoLC/w3tvVxy3ayqnarY93P49dq0a844M1DmUdfbnSs52O/dXU7Ht9Y8XP44w11Nx5fW+GV89elPoh911U87EaAAAECQwh0PUkb4tjaLEyg7+FE6Hg/Tja+H+1+KSo/htP28aFH8Xg9SHwYz+saJJ4+PT39VK2ejZO9POG7eXZ29tNo161QgZjn97Jinn++rJfi/qXY9nzU52tVXVjgmdi2uJBAkOwSXvK1nJUfkcv6XLSXdStet9+s1Wux/Fo8lh8XXATv+JnIIJ61+Hszsf6XZd2LsP6rWr0Sy6/EY/lOXzTxZLfw+KBj3Y/91tXdeHxjxc/hnQ11Ox5fWzFHOX9d6kbsu65yrm9EvzPMPBmgZxEgQIDAlQICyJUsNo5BIH5j+ttaP/I3xll/jJOGPDGo19OxrR4kno2TFEGihmexX4F4vY0tvIwuvPQrrjUCBAgQKElAAClpNgsbS/zm8QdxolcFjfztc9aXdx1m/Fb47ajqN8ruj4/zN+pXVV5tal21fTk5r0TVVheuUBXzsFo/OTm5cKnean3X+R7b8+M1LbyMbVL0h8BOAp5MgMC2AgLItmL2L0Gg/s5KCePZdQz5caCrKq82ta7avpzcvCpVfX11ad7o9IXleMfrwqV6q/UIKULi8fHCIMzezcqPZi1r8ZGt2JZflM6PcVWVH+3KynmNh3e+ZTtZ2WZWdZwu77ws+l7APPpC+s4vIw0QIEDgsUBvAeRxc/6fwPgF4jfQ+Tc4qndWir+PE9VvrKuYsV+01B9i+7pq+wLvP+N5bZUfo2ureJobAQIECBAgULqAAFL6DBvfHATWjvH09PQ36yoC2Xdb6quxfV21fYH3M/G8tsqP0bVV8WEwXGY1xngXq7qKVl4h63YE4bzK1d14weYXu7MyxMZqp1vum3U/2llcCSvar66sle3n63FIX19I7zRNdiJAgMBmAQFks5E9CBAgQOAJBM7OzqqraOUVsu5GEM6rXN2OIFZdpWoRGiJIZFDJELEIFFXAiEPWQ0r1kb9bsf/i74rEftXfBcm/+5HfScqPe+X9vZOTk+qPH945OjrKP2C4+OOE0WbPN80RIECAwLYCAsi2YvYnQIAAgV4Fzh4HlUVIieUMKotL7S6DSj2krIJKhI+2d1OuR+dWISXCyquxbwaVDCn3lt9FyZCStQoqR0dHGVKyMqhcjzbcCBAYu4D+TVZAAJns1Ok4AQIE5iMQwcS7KfOZbiMlQKBwAQFk+hNsBAQIECCwFFgGlX29m+LKWEt3dwQIENhGQADZRsu+BAgQuCBgZYoCy5CS76gsgsqO302ZIoE+EyBA4KACAshB+R2cAAECBMYqsAwqi5ASy1d9N8WVsQ45eY5NgMBkBQSQyU6djhMgQIAAAQIECBDYv8CuRxRAdhX0fAIECBAgQIAAAQIEOgsIIJ2p7EigKWCdAAECBAgQIEBgWwEBZFsx+xMgQIDA4QX0gAABAgQmKyCATHbqdJwAAQIECBAgsH8BRySwq4AAsqug5xMgQIAAAQIECBAg0FlAAOlM1dzROgECBAgQIECAAAEC2woIINuK2Z8AgcML6AEBAgQIECAwWQEBZLJTp+MECBAgQGD/Ao5IgACBXQUEkF0FPZ8AAQIECBAgQIDA8ALFHEEAKWYqDYQAAQIECBAgQIDA+AUEkPHPkR42BawTIECAAAECBAhMVkAAmezU6TgBAgT2L+CIBAgQIEBgVwEBZFdBzydAgAABAgQIDC/gCASKERBAiplKAyFAgAABAgQIECAwfoHpBZDxm+ohAQIECBAgQIAAAQItAgJIC4zNBAhcFrCFAAECBAgQILCrgACyq6DnEyBAgACB4QUcgQABAsUICCDFTKWBECBAgAABAgQI9C+gxb4FBJC+RbVHgAABAgQIECBAgECrgADSSuOBpoB1AgQIECBAgAABArsKCCC7Cno+AQIEhhdwBAIECBAgUIyAAFLMVBoIAQIECBAg0L+AFgkQ6FtAAOlbVHsECBAgQIAAAQIECLQKdA4grS14gAABAgQIECBAgAABAh0FBJCOUHYjcEABhyZAgAABAgQIFCMggBQzlQZCgAABAv0LaJEAAQIE+hYQQPoW1R4BAgQIECBAgMDuAlooVkAAKXZqDYwAAQIECBAgQIDA+AQEkPHNSbNH1gkQIECAAAECBAgUIyCAFDOVBkKAQP8CWiRAgAABAgT6FhBA+hbVHgECBAgQILC7gBYIEChWQAApdmoNjAABAgQIECBAgMD2AkM/QwAZWlj7BAgQIECAAAECBAisBASQFYUFAk0B6wQIECBAgAABAn0LCCB9i2qPAAECBHYX0AIBAgQIFCsggBQ7tQZGgAABAgQIENhewDMIDC0ggAwtrH0CBAgQIECAAAECBFYCAsiKorlgnQABAgQIECBAgACBvgUEkL5FtUeAwO4CWiBAgAABAgSKFRBAip1aAyNAgAABAtsLeAYBAgSGFhBAhhbWPgECBAgQIECAAIHNArPZQwCZzVQbKAECBAgQIECAAIHDCwggh58DPWgKWCdAgAABAgQIEChWQAApdmoNjAABAtsLeAYBAgQIEBhaQAAZWlj7BAgQIECAAIHNAvYgMBsBAWQ2U22gBAgQIECAAAECBA4vML4AcngTPSBAgAABAgQIECBAYCABAWQgWM0SmKKAPhMgQIAAAQIEhhYQQIYW1j4BAgQIENgsYA8CBAjMRkAAmc1UGygBAgQIECBAgMBlAVv2LSCA7Fvc8QgQIECAAAECBAjMWEAAmfHkN4dunQABAgQIECBAgMDQAgLI0MLaJ0CAwGYBexAgQIAAgdkICCCzmWoDJUCAAAECBC4L2EKAwL4FBJB9izseAQIECBAgQIAAgRkLrALIjA0MnQABAgQIECBAgACBPQn8HwAA///VXTTJAAAABklEQVQDAAzcvrTObewhAAAAAElFTkSuQmCC\"}', '{\"signed_name\":\"Non quia deserunt ve\",\"date\":\"2009-02-04\",\"prc_no\":\"Facere sint molestia\",\"validity\":\"Magni aut qui sapien\",\"ptr_no\":\"Quo delectus verita\",\"date_issued\":\"1986-04-16\",\"issued_at\":\"Nostrud suscipit com\",\"tin\":\"Praesentium molestia\",\"address\":\"Qui dolor aliqua Al\",\"signature_data_url\":\"data:image/png;base64,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\"}', '{\"signed_name\":\"Voluptatem do praes\",\"date\":\"2011-10-02\",\"address\":\"Rem culpa facilis si\",\"ctc_no\":\"Similique aspernatur\",\"ctc_date_issued\":\"1973-01-26\",\"ctc_place_issued\":\"Molestias fuga Eaqu\",\"signature_data_url\":\"\"}', '{\"signed_name\":\"Culpa nihil aliquid\",\"date\":\"1990-01-28\",\"address\":\"Alias sint aut ea so\",\"ctc_no\":\"Irure vel aut velit \",\"ctc_date_issued\":\"1992-03-24\",\"ctc_place_issued\":\"Anim in modi debitis\",\"signature_data_url\":\"\"}', 'data:image/png;base64,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', 'data:image/png;base64,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', NULL, NULL, '/uploads/previews/plumbing-preview-6-1765399526960.pdf', '/uploads/user_filled/plumbing-userfilled-6-1765399568280.pdf', '2025-12-11 04:46:08');

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
('2VU24kzi6qW8uhNJ6fgx9g6Wgv-qukh-', 1765487259, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-11T18:53:48.212Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"user_id\":35,\"email\":\"09xghagox09@gmail.com\",\"role\":\"citizen\"}}');

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
('sms_enabled', 'false', '2025-12-03 16:51:47');

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
(16, 11, 29, 'test', 'electrical', 39, '/uploads/requirements/1760640530994_application___resume_2_.pdf', NULL, NULL, '2025-10-24 12:55:38'),
(17, 11, 29, 'tested for multi', 'electrical', 39, '/uploads/requirements/1761309531840_Receipt-2237-1334.pdf', NULL, NULL, '2025-10-24 12:55:46'),
(18, 12, 35, 'elec try', 'electronics', 5, '/uploads/requirements/1763628500655_Untitled_design_18_.pdf', '/uploads/user_uploads/1763651636413_Soft_Green_Creative_Omnichannel_Marketing_VS_Multichannel_Marketing_Comparison_Infographic_Graph_1_.png', '2025-11-20 23:13:56', '2025-11-20 08:52:00'),
(19, 29, 35, 'try business permit', 'business', 81, '/uploads/requirements/1763652005667_Untitled_design_8_.pdf', '/uploads/user_uploads/1763654469434_Untitled_design_17_.pdf', '2025-11-21 00:01:09', '2025-11-20 15:20:18'),
(22, 30, 35, 'electrical', 'electrical', 43, '/uploads/requirements/1763711156380_Untitled_design_17_.pdf', NULL, NULL, '2025-11-21 07:46:56'),
(23, 16, 35, 'try business permit', 'business', 80, '/uploads/requirements/1763652005667_Untitled_design_8_.pdf', NULL, NULL, '2025-11-21 15:15:08'),
(24, 31, 35, 'try business permit', 'business', 82, '/uploads/requirements/1763652005667_Untitled_design_8_.pdf', NULL, NULL, '2025-11-21 15:16:24'),
(25, 32, 35, 'plumbingg', 'plumbing', 4, '/uploads/requirements/1763738564034_November.pdf', NULL, NULL, '2025-11-21 15:23:09'),
(26, 33, 35, 'plumbingg', 'plumbing', 5, '/uploads/requirements/1763738564034_November.pdf', NULL, NULL, '2025-11-21 16:57:29'),
(27, 34, 35, 'elec try', 'electronics', 6, '/uploads/requirements/1763628500655_Untitled_design_18_.pdf', '/uploads/user_uploads/1763927933018_Untitled_design_7_.pdf', '2025-11-24 03:58:53', '2025-11-23 19:57:07'),
(28, 35, 35, 'try business permit', 'business', 83, '/uploads/requirements/1763652005667_Untitled_design_8_.pdf', NULL, NULL, '2025-11-24 17:11:08'),
(29, 37, 35, 'cedula req 1', 'cedula', 26, '/uploads/requirements/1764086788075_Untitled_design_9_.pdf', '/uploads/user_uploads/1764086858589_Untitled_design_10_.pdf', '2025-11-26 00:07:38', '2025-11-25 16:07:14'),
(30, 37, 35, 'cedula requirem 2', 'cedula', 26, '/uploads/requirements/1764086819512_Untitled_design_7_.pdf', '/uploads/user_uploads/1764086863289_Untitled_design_16_.pdf', '2025-11-26 00:07:43', '2025-11-25 16:07:21'),
(32, 38, 35, 'try', 'electrical', 45, '/uploads/requirements/1763628431841_Untitled_design_10_.pdf', NULL, NULL, '2025-11-25 20:33:09'),
(296, 42, 35, 'Electronics Permit Filled Form', 'electronics', 7, '/uploads/system_generated/electronics/user_filled/electronics-userfilled-7-1764931423542.pdf', NULL, NULL, '2025-12-05 10:43:43'),
(297, 40, 35, 'Business Permit LGU Form', 'business', 85, '/uploads/requirements/business_permit_85_lgu_form.pdf', NULL, NULL, '2025-12-05 12:57:58'),
(298, 41, 35, 'Electrical Permit Filled Form', 'electrical', 46, '/uploads/system_generated/electrical/electrical-46-1764939501769.pdf', '/uploads/user_filled/electrical/electrical-46-userfilled-1764939543246.pdf', '2025-12-05 20:59:03', '2025-12-05 12:58:21'),
(299, 43, 35, 'Fencing Permit Filled Form', 'fencing', 10, '/uploads/system_generated/fencing/user_filled/fencing-userfilled-10-1764954975425.pdf', NULL, NULL, '2025-12-05 17:16:15'),
(305, 44, 35, 'Plumbing Permit Filled Form', 'plumbing', 6, '/uploads/user_filled/plumbing-userfilled-6-1765399568280.pdf', NULL, NULL, '2025-12-10 20:46:08');

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
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
  `status_updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Building permit applications linked to user accounts';

--
-- Dumping data for table `tbl_building_permits`
--

INSERT INTO `tbl_building_permits` (`id`, `user_id`, `application_no`, `bp_no`, `building_permit_no`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_owned`, `form_of_ownership`, `address_no`, `address_street`, `address_barangay`, `address_city`, `address_zip_code`, `telephone_no`, `location_lot_no`, `location_blk_no`, `location_tct_no`, `location_tax_dec_no`, `location_street`, `location_barangay`, `location_city`, `scope_of_work`, `group_a`, `group_b`, `group_c`, `group_d`, `group_e`, `group_f`, `group_g`, `group_h`, `group_i`, `group_j1`, `group_j2`, `applies_also_for`, `status`, `pickup_schedule`, `pickup_file_path`, `status_updated_at`, `created_at`, `updated_at`) VALUES
(4, 35, 'BP-APP-2025-000004', 'BP-2025-000004', 'BLDG-2025-000004', 'Ge', 'Chris', 'P', 'Neque tempore nihil', 'Vel laborum Eaque r', 'Laudantium non est', 'Dolor est consequunt', 'murcia', 'Autem dolores dolore', 'Hinigaran', '41764', '09458542757', 'Voluptate aspernatur', 'Dolor commodo laboru', 'Non vero aliquam rep', 'Enim sed et odit par', 'Sunt est saepe qui r', 'Quia dolor dolor cum', 'Esse eveniet quis a', 'Others', 'Duplex', 'Boarding House', 'Museum', 'Municipal Hall', 'Shopping Center', 'Workshop', 'Warehouse', 'Manufacturing Facility', 'Clinic', 'Agricultural Storage', 'Carport', 'plumbing', 'ready-for-pickup', '2025-12-02 04:07:00', '/uploads/pickup_docs/building/1764187664534_November.pdf', NULL, '2025-11-24 17:10:18', '2025-11-26 20:07:44');

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
  `application_status` enum('pending','in-review','in-progress','requirements-completed','ready-for-pickup','approved','rejected') DEFAULT 'pending',
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_cedula`
--

INSERT INTO `tbl_cedula` (`id`, `name`, `address`, `place_of_birth`, `date_of_birth`, `profession`, `yearly_income`, `purpose`, `sex`, `status`, `tin`, `user_id`, `created_at`, `updated_at`, `application_status`, `pickup_schedule`, `pickup_file_path`) VALUES
(25, 'Chris Pa Ge', 'murcia', 'Ad iste quaerat quae', '2001-10-06', 'Id alias qui quam n', 62.00, 'Et at nisi voluptate', 'male', 'single', 'Et repudiandae vel f', 35, '2025-11-24 17:09:34', '2025-11-28 20:27:37', 'ready-for-pickup', '2025-11-29 04:27:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_document_prices`
--

CREATE TABLE `tbl_document_prices` (
  `id` int(11) NOT NULL,
  `application_type` enum('business','electrical','cedula','mayors','building','plumbing','fencing','electronics','renewal_business') NOT NULL,
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
(1, 'business', 'Business Permit', 500.00, 400.00, 100.00, 1, 5, '2025-11-28 17:40:15'),
(2, 'electrical', 'Electrical Permit', 300.00, 200.00, 100.00, 1, 5, '2025-11-28 17:35:19'),
(3, 'cedula', 'Cedula Permit', 100.00, 100.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(4, 'mayors', 'Mayor\'s Permit', 150.00, 150.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(5, 'building', 'Building Permit', 800.00, 800.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(6, 'plumbing', 'Plumbing Permit', 250.00, 250.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(7, 'fencing', 'Fencing Permit', 200.00, 200.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(8, 'electronics', 'Electronics Permit', 350.00, 350.00, 100.00, 1, NULL, '2025-11-24 15:05:48'),
(9, 'renewal_business', 'Business Renewal Permit', 400.00, 400.00, 100.00, 1, NULL, '2025-11-24 15:05:48');

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
(14, 'try', 15, 7, 'electrical', 'try lng ', '/uploads/requirements/1763628431841_Untitled_design_10_.pdf', 'pdf', 1, 1, NULL, '2025-11-20 08:47:11', '2025-11-20 08:47:11'),
(15, 'elec try', 15, NULL, 'electronics', 'try lng ', '/uploads/requirements/1763628500655_Untitled_design_18_.pdf', 'pdf', 1, 1, NULL, '2025-11-20 08:48:20', '2025-11-20 08:48:20'),
(16, 'try business permit', 14, 8, 'business', '', '/uploads/requirements/1763652005667_Untitled_design_8_.pdf', 'pdf', 1, 1, NULL, '2025-11-20 15:20:05', '2025-11-20 15:20:05'),
(17, 'fencing test require', 15, 9, 'fencing', '', '/uploads/requirements/1763709880121_November.pdf', 'pdf', 1, 1, NULL, '2025-11-21 07:24:40', '2025-11-21 07:24:40'),
(18, 'electrical', 15, 10, 'electrical', '', '/uploads/requirements/1763711156380_Untitled_design_17_.pdf', 'pdf', 1, 1, NULL, '2025-11-21 07:45:56', '2025-11-21 07:45:56'),
(19, 'plumbingg', 15, 11, 'plumbing', '', '/uploads/requirements/1763738564034_November.pdf', 'pdf', 1, 1, NULL, '2025-11-21 15:22:44', '2025-11-21 15:22:44'),
(20, 'cedula req 1', 14, 12, 'cedula', 'test', '/uploads/requirements/1764086788075_Untitled_design_9_.pdf', 'pdf', 1, 1, NULL, '2025-11-25 16:06:28', '2025-11-25 16:06:28'),
(21, 'cedula requirem 2', 14, 12, 'cedula', 'test2', '/uploads/requirements/1764086819512_Untitled_design_7_.pdf', 'pdf', 1, 1, NULL, '2025-11-25 16:06:59', '2025-11-25 16:06:59');

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
  `status` enum('pending','in-review','in-progress','requirements-completed','approved','rejected','ready-for-pickup') DEFAULT 'pending',
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_electrical_permits`
--

INSERT INTO `tbl_electrical_permits` (`id`, `application_no`, `ep_no`, `building_permit_no`, `user_id`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_owned`, `form_of_ownership`, `use_or_character`, `address_no`, `address_street`, `address_barangay`, `address_city`, `address_zip_code`, `telephone_no`, `location_street`, `location_lot_no`, `location_blk_no`, `location_tct_no`, `location_tax_dec_no`, `location_barangay`, `location_city`, `scope_of_work`, `status`, `pickup_schedule`, `pickup_file_path`, `created_at`, `updated_at`) VALUES
(46, 'EP-APP-2025-000046', 'EP-2025-000046', 'BP-2025-000046', 35, 'Ge', 'Chris', 'P', 'Libero dolorum obcae', 'Dolores sed non faci', 'Consequat Ea dolor ', 'In excepturi nostrum', '123', 'mabini st', 'aboluy', 'Hinigaran', '85551', '09458542757', '21st', '3321', '3221', '3323', '333221', 'brgy 2', 'Iste quasi sequi in ', 'reconnection', 'in-review', '2025-11-27 10:54:00', '/uploads/pickup_docs/electrical/1764190481030_November.pdf', '2025-11-26 20:43:44', '2025-12-03 20:54:14');

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
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_electronics_permits`
--

INSERT INTO `tbl_electronics_permits` (`id`, `application_no`, `ep_no`, `building_permit_no`, `user_id`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_owned`, `form_of_ownership`, `use_or_character`, `address_no`, `address_street`, `address_barangay`, `address_city`, `address_zip_code`, `telephone_no`, `location_lot_no`, `location_blk_no`, `location_tct_no`, `location_tax_dec_no`, `location_street`, `location_barangay`, `location_city`, `scope_of_work`, `status`, `pickup_schedule`, `pickup_file_path`, `created_at`, `updated_at`) VALUES
(7, 'ELC-APP-2025-000007', 'ELC-2025-000007', 'ELEC-2025-000007', 35, 'Ge', 'Chris', 'P', '22212', 'dave Chester', 'test2', 'dwdwa', '2131', 'galo st', 'barangay2', 'Hinigaran', '6221', '09458542757', '3214', '1231', '31231', '23321', '32st', 'barangay2', 'Hinigaran', 'New Construction', 'in-review', '2025-11-07 03:53:00', '/uploads/pickup_docs/electronics/1764359643351_November.pdf', '2025-11-24 17:13:22', '2025-12-04 19:03:19');

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
(14, 30, 'jerryl', 'perez', '093213133', 'Business head', 'IT', '2025-09-27', '2025-09-27 08:16:47'),
(15, 36, 'Will', 'Agudelo', '098883928284', 'Business head', 'HR', '2025-11-27', '2025-11-27 07:00:32');

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
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_fencing_permits`
--

INSERT INTO `tbl_fencing_permits` (`id`, `application_no`, `fp_no`, `building_permit_no`, `user_id`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_ownership`, `ownership_form`, `use_or_character`, `address_no`, `street`, `barangay`, `city_municipality`, `zip_code`, `telephone_no`, `location_street`, `lot_no`, `block_no1`, `block_no2`, `tax_dec_no`, `location_barangay`, `location_city`, `scope_of_work`, `other_scope_specify`, `status`, `pickup_schedule`, `pickup_file_path`, `created_at`, `updated_at`) VALUES
(9, 'FP-APP-2025-000009', 'FP-2025-000009', 'FENC-2025-000009', 35, 'Ge', 'Chris', 'P', 'Fuga Dolores iste q', 'Dolores harum invent', 'Nulla vero voluptate', 'Qui eveniet dolor e', 'Minim omnis occaecat', 'murcia', 'Corrupti sed nobis ', 'Hinigaran', 'Nisi nulla', '09458542757', 'Nihil reprehenderit', 'Quidem deserunt quis', 'Qui molestiae atque ', 'Placeat rerum verit', 'Aliqua Reprehenderi', 'Molestiae consequatu', 'Reprehenderit quo n', 'erection', NULL, 'in-progress', '2025-11-14 04:07:00', '/uploads/pickup_docs/fencing/1764187673608_November.pdf', '2025-11-24 17:14:37', '2025-12-05 16:38:45'),
(10, 'FP-APP-2025-000010', 'FP-2025-000010', 'FENC-2025-000010', 35, 'Ge', 'Chris', 'P', 'Veniam pariatur De', 'Sint sint in nostru', 'Possimus perspiciat', 'Aliquip commodi comm', 'Inventore possimus ', 'murcia', 'Aspernatur vitae quo', 'Hinigaran', 'Ut et exce', '09458542757', 'Reprehenderit cillum', 'Sed accusamus iusto ', 'Tempora possimus ut', 'Corporis quas quae e', 'Eum voluptatem Quib', 'Mollit tempora eos o', 'Voluptatem aut veli', 'demolition', NULL, 'in-review', NULL, NULL, '2025-11-30 16:32:50', '2025-11-30 16:33:00');

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
(84, 35, 'business', 'Business Permit', '/uploads/receipts/receipt-1764353640870-882027685.jpg', 'other', 400.00, 100.00, 400.00, 'approved', 'e', 30, '2025-11-28 18:17:45', 1, 1, '2025-11-28 20:29:03', 0, NULL, 1, '2025-11-28 20:29:03', 85, '2025-11-28 18:14:00', '2025-11-28 20:29:03'),
(85, 35, 'business', 'Business Permit', '/uploads/receipts/receipt-1764621925714-143474517.jpg', 'other', 400.00, 100.00, 400.00, 'approved', 'cghe ah\n', 30, '2025-12-01 20:46:17', 1, 0, NULL, 0, NULL, 0, NULL, NULL, '2025-12-01 20:45:25', '2025-12-01 20:46:17');

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
(1, 38, '09467629128', '546071', '2025-12-02 01:11:33', 0, 0, '2025-12-01 17:01:33'),
(7, 43, '09666785458', '787574', '2025-12-02 01:52:08', 1, 1, '2025-12-01 17:42:08'),
(8, 35, '09458542757', '242297', '2025-12-04 00:49:12', 1, 1, '2025-12-03 16:39:12'),
(9, 44, '09534178798', '512633', '2025-12-04 00:51:12', 0, 1, '2025-12-03 16:41:12'),
(10, 44, '09534178798', '111376', '2025-12-04 00:53:10', 1, 1, '2025-12-03 16:43:10'),
(11, 44, '639534178798', '534859', '2025-12-04 00:59:59', 1, 1, '2025-12-03 16:49:59'),
(12, 44, '639534178798', '794287', '2025-12-04 01:00:56', 4, 0, '2025-12-03 16:50:56');

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
  `pickup_schedule` datetime DEFAULT NULL,
  `pickup_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_plumbing_permits`
--

INSERT INTO `tbl_plumbing_permits` (`id`, `application_no`, `pp_no`, `building_permit_no`, `user_id`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_owned`, `form_of_ownership`, `use_or_character`, `address_no`, `address_street`, `address_barangay`, `address_city`, `address_zip_code`, `telephone_no`, `location_street`, `location_lot_no`, `location_blk_no`, `location_tct_no`, `location_tax_dec_no`, `location_barangay`, `location_city`, `scope_of_work`, `other_scope_specify`, `status`, `pickup_schedule`, `pickup_file_path`, `created_at`, `updated_at`) VALUES
(6, 'PP-APP-2025-000006', 'PP-2025-000006', 'PLMB-2025-000006', 35, 'Ge', 'Chris', 'P', 'Nemo qui saepe et as', 'Dolor minus elit be', 'Est libero et tempo', 'Perspiciatis pariat', 'Quas fugiat excepte', 'murcia', 'Exercitation velit ', 'Hinigaran', '25435', '09458542757', 'Necessitatibus quo d', 'Blanditiis saepe por', 'Sequi et in sed quia', 'Occaecat optio dolo', 'Aperiam obcaecati ea', 'Omnis dicta Nam anim', 'Doloremque qui ipsa', 'moving', NULL, 'in-review', '2025-11-21 04:07:00', '/uploads/pickup_docs/plumbing/1764187634168_November.pdf', '2025-11-24 17:13:37', '2025-12-10 18:41:55');

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
(7, 15, 'Electrical 1', '', 'active', '2025-10-24 12:37:05', '2025-10-24 12:37:05'),
(8, 14, 'new permit bus try', '', 'active', '2025-11-20 15:19:39', '2025-11-20 15:19:39'),
(9, 15, 'fencing', '', 'active', '2025-11-21 07:24:19', '2025-11-21 07:24:19'),
(10, 15, 'electrical', '', 'active', '2025-11-21 07:45:12', '2025-11-21 07:45:12'),
(11, 15, 'Plumbing requirmentss', '', 'active', '2025-11-21 15:22:23', '2025-11-21 15:22:23'),
(12, 14, 'cedula requirements1', '', 'active', '2025-11-25 16:06:08', '2025-11-25 16:06:08');

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
(5, 29, 'dave', 'sumabong', 'chester', 'hinigaran brgy2', '09321731723', 0),
(8, 33, 'dave', 'chongo', 'amo', 'hinigaran.city', '', 0),
(9, 34, 'toto', 'wa', 'aldrin', 'awdwa', '09705048375', 0),
(10, 35, 'Chris', 'Pa', 'Ge', 'murcia', '09458542757', 0),
(17, 43, 'diane', 'd', 'd', 'bago', '09666785458', 1),
(18, 44, 'dave', 'gealolo', 'chester', 'hinigaran', '09534178798', 1);

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
(29, '2025-11-24 22:32:10', '2025-11-26 04:12:42', '2025-10-21 00:28:57', '2025-11-26 04:12:42'),
(31, '2025-11-21 16:02:11', '2025-11-21 16:02:12', '2025-10-21 00:29:06', '2025-11-21 16:02:12'),
(32, '2025-10-28 00:07:31', '2025-10-27 23:19:57', '2025-10-23 02:04:33', '2025-10-28 00:07:31'),
(33, '2025-10-27 22:58:53', '2025-10-27 22:59:24', '2025-10-27 22:58:51', '2025-10-27 22:59:24'),
(34, '2025-11-10 22:13:26', '2025-11-10 22:13:38', '2025-11-10 22:13:23', '2025-11-10 22:13:38'),
(35, '2025-12-11 02:53:49', '2025-12-11 02:53:50', '2025-11-10 22:23:26', '2025-12-11 02:53:50'),
(37, '2025-11-27 15:03:46', '2025-11-27 15:06:43', '2025-11-27 15:03:46', '2025-11-27 15:06:43'),
(44, NULL, '2025-12-04 03:47:52', '2025-12-04 03:47:52', '2025-12-04 03:47:52');

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
(33, 'dave@gmail.com', '$2b$10$ONgGAc6IKeCyDuqLKVgXauyU0BJ6CZcXAreOZ/Yv8yRssQfQ/NQpG', 'citizen', '2025-10-27 14:58:43'),
(34, 'aldrin@gmail.com', '$2b$10$KgIxePqqCH/TmkdlaRpcNOIbs9sbY5Oz.rI.4TgDjE.DSZTRCyICa', 'citizen', '2025-11-10 14:13:13'),
(35, '09xghagox09@gmail.com', '$2b$10$S6fiyCPu1HTMzgopZIYHOOedBgG9aMVe.IKJhFkriTUdsA64r3wfG', 'citizen', '2025-11-10 14:23:17'),
(36, 'willagudelo@gmail.com', '$2b$10$P4IWoTbFdaFYB2DarxSYBOspeY6ZHGVXGdWnoKuJIuX0Hsienr9Le', 'employee', '2025-11-27 07:00:32'),
(38, 'test@gmail.com', '$2b$10$QbGVXcw68RJaYGa9yjC08eD23Pu28RuQxvrz1v9Pi13Wt03T7.R2G', 'citizen', '2025-12-01 17:01:33'),
(43, 'dianne@gmail.com', '$2b$10$92co4k8NZPAkxGupD.aMXux04kJm9zcdgpZUqHa1Ro.7lJzdVE8Vu', 'citizen', '2025-12-01 17:42:08'),
(44, 'davechester@gmail.com', '$2b$10$45gbP68xzg4Pjgr2fzCYoONnkg/QnIKM3smefea9GiKn389Ymy9JS', 'citizen', '2025-12-03 16:41:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `application_index`
--
ALTER TABLE `application_index`
  ADD PRIMARY KEY (`app_uid`),
  ADD UNIQUE KEY `uq_app` (`application_type`,`application_id`),
  ADD UNIQUE KEY `ux_app_type_id` (`application_type`,`application_id`),
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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `application_index`
--
ALTER TABLE `application_index`
  MODIFY `app_uid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `business_activities`
--
ALTER TABLE `business_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `business_permits`
--
ALTER TABLE `business_permits`
  MODIFY `BusinessP_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `business_permit_assessment`
--
ALTER TABLE `business_permit_assessment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `business_permit_doc_verification`
--
ALTER TABLE `business_permit_doc_verification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `electrical_form_submissions`
--
ALTER TABLE `electrical_form_submissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `electronics_form_submissions`
--
ALTER TABLE `electronics_form_submissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=306;

--
-- AUTO_INCREMENT for table `tbl_building_permits`
--
ALTER TABLE `tbl_building_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_cedula`
--
ALTER TABLE `tbl_cedula`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `tbl_document_prices`
--
ALTER TABLE `tbl_document_prices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tbl_document_requirements`
--
ALTER TABLE `tbl_document_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `tbl_electrical_permits`
--
ALTER TABLE `tbl_electrical_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `tbl_electronics_permits`
--
ALTER TABLE `tbl_electronics_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tbl_employee_offices`
--
ALTER TABLE `tbl_employee_offices`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tbl_fencing_permits`
--
ALTER TABLE `tbl_fencing_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_offices`
--
ALTER TABLE `tbl_offices`
  MODIFY `office_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tbl_payment_receipts`
--
ALTER TABLE `tbl_payment_receipts`
  MODIFY `receipt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `tbl_phone_verifications`
--
ALTER TABLE `tbl_phone_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tbl_plumbing_permits`
--
ALTER TABLE `tbl_plumbing_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_requirement_categories`
--
ALTER TABLE `tbl_requirement_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  MODIFY `info_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `tb_logins`
--
ALTER TABLE `tb_logins`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

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
-- Constraints for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  ADD CONSTRAINT `tbl_user_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
