-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 02, 2025 at 04:04 AM
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
(29, 28, 'Sapiente iusto ut vo', 'Aut enim iure repell', 0.00, 0.00, 0.00, '2025-05-01 10:36:16', '2025-05-01 10:36:16'),
(30, 29, 'Maxime aperiam est ', 'Sapiente vel ullam q', 0.00, 0.00, 0.00, '2025-05-01 16:05:10', '2025-05-01 16:05:10');

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
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_permits`
--

INSERT INTO `business_permits` (`BusinessP_id`, `application_type`, `payment_mode`, `application_date`, `tin_no`, `registration_no`, `registration_date`, `business_type`, `amendment_from`, `amendment_to`, `tax_incentive`, `tax_incentive_entity`, `last_name`, `first_name`, `middle_name`, `business_name`, `trade_name`, `business_address`, `business_postal_code`, `business_email`, `business_telephone`, `business_mobile`, `owner_address`, `owner_postal_code`, `owner_email`, `owner_telephone`, `owner_mobile`, `emergency_contact`, `emergency_phone`, `emergency_email`, `business_area`, `male_employees`, `female_employees`, `local_employees`, `lessor_name`, `lessor_address`, `lessor_phone`, `lessor_email`, `monthly_rental`, `status`, `created_at`, `updated_at`, `user_id`) VALUES
(28, 'renewal', 'semi-annually', '1982-11-14', 'Esse duis in in tem', 'Voluptate id incidid', '1979-01-09', 'corporation', 'corporation', 'single', 'no', '', 'Stanley', 'Nathaniel', 'Benedict Hoffman', 'Patience Graham', 'Garrison Willis', 'Soluta voluptatem ut', 'Est nostru', 'symic@mailinator.com', '+1 (468) 962-7219', 'Cupiditate quos magn', 'Harum corrupti ipsu', 'Nisi quasi', 'kuwa@mailinator.com', '+1 (133) 386-8659', 'Animi nostrud unde ', 'Adara Weiss', '+1 (714) 511-3977', 'necyvaquz@mailinator.com', 'Eum quo quas ipsum v', 72, 28, 16, 'Yasir Jones', 'Quis ducimus praese', '+1 (115) 353-8343', 'vaficugiri@mailinator.com', 12.00, 'pending', '2025-05-01 10:36:16', '2025-05-01 10:36:16', 1),
(29, 'new', 'quarterly', '1985-05-31', 'Modi culpa aliquam ', 'Ut eligendi quia qui', '1991-11-23', 'cooperative', 'corporation', 'partnership', 'no', '', 'perez', 'jerryl', 'wala', 'Iris Wolf', 'Ivy Soto', 'Ut fugit itaque dol', 'Veniam cor', 'zufasume@mailinator.com', '+1 (474) 507-5453', 'Dolorem enim consect', 'Neque dolor sit exp', 'Excepteur ', 'pubuqanuj@mailinator.com', '+1 (901) 444-9984', 'Nesciunt eaque inve', 'Eden Rosa', '+1 (901) 747-9376', 'cuwyke@mailinator.com', 'Deleniti qui quasi a', 72, 13, 58, 'Raya Rowe', 'Aut incidunt esse ', '+1 (705) 186-5906', 'tyliz@mailinator.com', 7.00, 'pending', '2025-05-01 16:05:10', '2025-05-01 16:05:10', 2);

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
(8, 13, 'dave', 'chester', '+1 (621) 351-7828', 'tambay', 'HR', '2025-04-17', '2025-04-23 03:59:09'),
(10, 16, 'jerryl', 'perez', '+1 (447) 314-3874', 'IT head', 'IT', '2025-05-02', '2025-05-01 16:01:55');

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
(6, 'Shafira Mays', 'Laboriosam aut volu', 'Nihil optio qui ani', 'At quia alias quas c', '+1 (282) 273-1031', 'befysafaha@mailinator.com', 'active', '2025-05-01 20:16:21', '2025-05-01 20:16:21'),
(7, 'Idona Kemp', 'Ullam est sed aliqu', 'Autem et tempore il', 'Cumque iure aut sunt', '+1 (756) 398-8827', 'jivicij@mailinator.com', 'active', '2025-05-01 20:17:27', '2025-05-01 20:17:27');

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
(16, 'newempolyee@gmail.com', '$2b$10$t6XTP3Onf.NW8f/9O9TKtukMz0Ujb0T.ejeyfj4eBBFRHzavwElTm', 'employee', '2025-05-01 16:01:55');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `business_permits`
--
ALTER TABLE `business_permits`
  MODIFY `BusinessP_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_employee_offices`
--
ALTER TABLE `tbl_employee_offices`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_offices`
--
ALTER TABLE `tbl_offices`
  MODIFY `office_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tb_logins`
--
ALTER TABLE `tb_logins`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
