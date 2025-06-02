-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 02, 2025 at 01:40 PM
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
(61, 55, 'Dolor necessitatibus', 'Dolorum voluptatibus', 0.00, 0.00, 0.00, '2025-05-31 18:48:33', '2025-05-31 18:48:33'),
(62, 56, 'Est quasi sunt duis ', 'Iste debitis eos lab', 0.00, 0.00, 0.00, '2025-05-31 19:34:59', '2025-05-31 19:34:59');

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
  `status` varchar(20) DEFAULT 'pending',
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
(55, 'renewal', 'quarterly', '1974-05-08', 'Dignissimos culpa i', 'Facilis odio perfere', '2005-09-12', 'corporation', 'corporation', 'single', 'no', '', 'Hendricks', 'Velma', 'Chadwick Aguirre', 'Noble Reynolds', 'Fritz Dunlap', 'Molestiae iure incid', 'Dolores la', 'pukycax@mailinator.com', '+1 (549) 513-2597', 'Ad odio qui neque ni', 'Autem officia quas s', 'Quis dolor', 'jovobehe@mailinator.com', '+1 (941) 299-3073', 'Excepteur quis ipsam', 'Eugenia Sutton', '+1 (658) 894-6185', 'ryweb@mailinator.com', 'Tempor porro anim ex', 15, 73, 60, 'Winifred Rocha', 'Ut corporis doloribu', '+1 (227) 263-2373', 'kyrabih@mailinator.com', 5.00, 'in-review', '2025-05-31 18:48:33', '2025-05-31 18:54:15', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit'),
(56, 'new', 'quarterly', '2003-11-29', 'Proident architecto', 'At et velit autem p', '2016-01-21', 'corporation', 'single', 'partnership', 'no', '', 'Eaton', 'Donovan', 'Inga Gill', 'Quynn Cox', 'Kirby Shannon', 'Culpa sapiente irure', 'Autem ut s', 'rifiq@mailinator.com', '+1 (412) 178-5625', 'Sunt voluptate sed t', 'Quo laudantium arch', 'Quas exerc', 'sedaqomuf@mailinator.com', '+1 (367) 113-3186', 'Quis minim qui culpa', 'Brenna William', '+1 (632) 367-6608', 'kazosy@mailinator.com', 'Nostrud incidunt re', 72, 7, 97, 'Russell Anderson', 'Incididunt vel eum a', '+1 (427) 254-8133', 'hixewyri@mailinator.com', 2.00, 'in-review', '2025-05-31 19:34:59', '2025-05-31 20:07:17', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit');

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
  `status` enum('pending','approved','rejected','processing') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_electrical_permits`
--

INSERT INTO `tbl_electrical_permits` (`id`, `application_no`, `ep_no`, `building_permit_no`, `user_id`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_owned`, `form_of_ownership`, `use_or_character`, `address_no`, `address_street`, `address_barangay`, `address_city`, `address_zip_code`, `telephone_no`, `location_street`, `location_lot_no`, `location_blk_no`, `location_tct_no`, `location_tax_dec_no`, `location_barangay`, `location_city`, `scope_of_work`, `status`, `created_at`, `updated_at`) VALUES
(14, 'EP-APP-2025-000014', 'EP-2025-000014', 'BP-2025-000014', 1, 'French', 'Francesca', 'Ex cu', 'Do quo possimus ut ', 'Reiciendis dolorem o', 'Qui saepe dolorem an', 'Vero libero veniam ', 'Impedit natus illum', 'Molestiae est repudi', 'Et officiis rerum ad', 'Occaecat non laborio', '29856', '+1 (147) 796-4759', 'Consectetur quis ass', 'Eiusmod error cum do', 'Quis a Nam deleniti ', 'Tempora est deserunt', 'Omnis velit id sint', 'Beatae consequuntur ', 'Nihil eum pariatur ', 'newInstallation', 'approved', '2025-05-31 19:48:50', '2025-05-31 20:06:53'),
(15, 'EP-APP-2025-000015', 'EP-2025-000015', 'BP-2025-000015', 1, 'Peters', 'Thomas', 'Et in', 'Aut maxime ea ab est', 'Autem sint illum vo', 'Unde dolores omnis n', 'Qui aut cumque molli', 'Optio proident ven', 'Rerum aut dicta nequ', 'Pariatur Sed velit ', 'Impedit voluptatem ', '28530', '+1 (163) 232-9543', 'Eiusmod magnam velit', 'Quia quo consequuntu', 'Aspernatur sed quasi', 'In atque sint tempor', 'Libero anim eum sit ', 'Optio cumque non ni', 'Asperiores mollitia ', 'newInstallation', 'approved', '2025-06-02 11:25:22', '2025-06-02 11:25:46');

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
(8, 13, 'dave', 'chester', '+1 (621) 351-7828', 'HR Head', 'Finance', '2025-04-17', '2025-04-23 03:59:09'),
(10, 16, 'jerryl', 'perez', '+1 (447) 314-3874', 'Senior Developer', 'IT', '2025-05-02', '2025-05-01 16:01:55');

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
(2, 8, 9, '2025-05-02', 1, 'active', '2025-05-02 03:14:23', '2025-05-02 03:14:23'),
(3, 10, 10, '2025-05-02', 1, 'active', '2025-05-02 03:30:00', '2025-05-02 03:30:00'),
(4, 8, 10, '2025-05-02', 0, 'active', '2025-05-02 03:30:00', '2025-05-02 03:30:00');

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
(9, 'Quin Spears', 'Molestiae dolores qu', NULL, 'Consectetur unde dol', NULL, 'satirawu@mailinator.com', 'active', '2025-05-02 03:14:23', '2025-05-02 03:14:37'),
(10, 'Business', 'BSD', NULL, '2nd Floor Municipal Bldg.', NULL, 'nyvag@mailinator.com', 'active', '2025-05-02 03:30:00', '2025-05-02 06:15:33');

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
(1, 'user@gmail.com', '$2b$10$3PAUVL8MIECE9WJSTOxWKuHCjEzsQC8NaGOZMypqX226P5a2hTt7u', 'citizen', '2025-03-30 13:53:33'),
(2, 'test@gmail.com', '$2b$10$h6/eMhF9Qv9E9Tt9KLO36.v8Gi6pve2SCsT1MkVjJhyUIPJHlitXG', 'citizen', '2025-03-30 13:57:38'),
(3, 'newuser@gmail.com', '$2b$10$XbYTOIZgb0toFNmnOOHDbO6/y3Dki21Vw1ewCA3uSl.6RtzO1p86O', 'citizen', '2025-04-21 07:09:12'),
(4, 'chongo@gmail.com', '$2b$10$d8PY3Ur.Y0tLuWWyvmOaKuMpP5vN3egNQ5dBAcODr9gCVT/i3lpwS', 'citizen', '2025-04-21 11:26:09'),
(5, 'admin@gmail.com', '$2b$10$eUG1ueO5DiTrewcQjYqLF.0lfQXR9IczTSXVPoAbldwzn9OxOPrcm', 'admin', '2025-04-22 08:08:23'),
(13, 'employee@gmail.com', '$2b$10$crg/YIEaYQ68Ydg.7fKo4.3qCvwPu7O0VczvwyObQp27akCBM3GJy', 'employee', '2025-04-23 03:59:09'),
(14, 'user123@gmail.com', '$2b$10$8jQEG9ceaPvcSnXjYO994.KlqQMQMLr9JZgz57/V7mP9tnUW6xnz.', 'citizen', '2025-04-30 06:11:45'),
(16, 'newempolyee@gmail.com', '$2b$10$t6XTP3Onf.NW8f/9O9TKtukMz0Ujb0T.ejeyfj4eBBFRHzavwElTm', 'employee', '2025-05-01 16:01:55'),
(17, 'dave@gmail.com', '$2b$10$h6S60B2q48yZZvs1/G4cHeZVmlqDT8w3lWsKgNOgv5aXC60bWSVFi', 'citizen', '2025-05-02 10:13:18'),
(18, 'testuser@gmail.com', '$2b$10$j60Ml/KTuqhun7UxDZmGwulBA6PNLRMdMVIg/XXROP/twd20e4LCa', 'citizen', '2025-05-07 03:25:33');

--
-- Indexes for dumped tables
--

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
-- Indexes for table `tbl_offices`
--
ALTER TABLE `tbl_offices`
  ADD PRIMARY KEY (`office_id`),
  ADD UNIQUE KEY `office_code` (`office_code`);

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
-- AUTO_INCREMENT for table `business_activities`
--
ALTER TABLE `business_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `business_permits`
--
ALTER TABLE `business_permits`
  MODIFY `BusinessP_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `tbl_electrical_permits`
--
ALTER TABLE `tbl_electrical_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_employee_offices`
--
ALTER TABLE `tbl_employee_offices`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_offices`
--
ALTER TABLE `tbl_offices`
  MODIFY `office_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tb_logins`
--
ALTER TABLE `tb_logins`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

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
-- Constraints for table `tbl_electrical_permits`
--
ALTER TABLE `tbl_electrical_permits`
  ADD CONSTRAINT `tbl_electrical_permits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
