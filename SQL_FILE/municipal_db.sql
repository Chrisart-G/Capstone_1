-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 23, 2025 at 06:11 AM
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
(16, 16, 'Ut aut quis voluptat', 'Eveniet iure nostru', 0.00, 0.00, 0.00, '2025-04-21 07:03:46', '2025-04-21 07:03:46'),
(17, 17, 'Ea sint consectetur ', 'Dolores voluptas dol', 0.00, 0.00, 0.00, '2025-04-21 10:59:40', '2025-04-21 10:59:40'),
(18, 18, 'Dolorum officia sunt', 'Aperiam inventore ut', 0.00, 0.00, 0.00, '2025-04-21 11:10:09', '2025-04-21 11:10:09'),
(19, 19, 'Non dolores veritati', 'Corporis enim est pe', 0.00, 0.00, 0.00, '2025-04-21 11:23:54', '2025-04-21 11:23:54'),
(20, 20, 'Do assumenda ad sunt', 'Saepe libero repelle', 0.00, 0.00, 0.00, '2025-04-21 11:26:51', '2025-04-21 11:26:51'),
(21, 20, 'Modi similique conse', 'Quas esse ex esse d', 0.00, 0.00, 0.00, '2025-04-21 11:26:51', '2025-04-21 11:26:51');

-- --------------------------------------------------------

--
-- Table structure for table `business_permits`
--

CREATE TABLE `business_permits` (
  `id` int(11) NOT NULL,
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

INSERT INTO `business_permits` (`id`, `application_type`, `payment_mode`, `application_date`, `tin_no`, `registration_no`, `registration_date`, `business_type`, `amendment_from`, `amendment_to`, `tax_incentive`, `tax_incentive_entity`, `last_name`, `first_name`, `middle_name`, `business_name`, `trade_name`, `business_address`, `business_postal_code`, `business_email`, `business_telephone`, `business_mobile`, `owner_address`, `owner_postal_code`, `owner_email`, `owner_telephone`, `owner_mobile`, `emergency_contact`, `emergency_phone`, `emergency_email`, `business_area`, `male_employees`, `female_employees`, `local_employees`, `lessor_name`, `lessor_address`, `lessor_phone`, `lessor_email`, `monthly_rental`, `status`, `created_at`, `updated_at`, `user_id`) VALUES
(16, 'renewal', 'annually', '2007-11-28', 'Proident necessitat', 'Nam dolores do et in', '2023-07-13', 'corporation', 'corporation', 'corporation', 'yes', '', 'Kirby', 'Dante', 'Ray Mclean', 'Ivor Maynard', 'Tamekah King', 'Eiusmod reprehenderi', 'Totam offi', 'kusydepux@mailinator.com', '+1 (113) 287-6538', 'Quia earum nisi dolo', 'Expedita culpa do id', 'Ullam solu', 'waxopakyfa@mailinator.com', '+1 (799) 848-9768', 'Rerum ullam autem ex', 'Simone Wyatt', '+1 (508) 294-8117', 'tixipemyme@mailinator.com', 'Laborum Earum omnis', 14, 100, 51, 'Yuri Mcdonald', 'Voluptatibus fugit ', '+1 (701) 433-7419', 'ridojiqesy@mailinator.com', 4.00, 'pending', '2025-04-21 07:03:46', '2025-04-21 07:03:46', 1),
(17, 'renewal', 'quarterly', '1994-10-10', 'Voluptatem mollit oc', 'Vel temporibus est p', '1979-04-06', 'cooperative', 'single', 'single', 'yes', '', 'Olsen', 'Gareth', 'Jasper Clayton', 'Brent Guerrero', 'Chase Clay', 'Qui voluptatem erro', 'Amet solut', 'dufec@mailinator.com', '+1 (621) 196-6733', 'Quos magni do aspern', 'Totam ut aut consequ', 'Exercitati', 'vuholola@mailinator.com', '+1 (353) 739-3164', 'Est quo deserunt omn', 'Boris Pope', '+1 (214) 943-6581', 'nifo@mailinator.com', 'Facilis sed sunt est', 7, 9, 90, 'Ciaran Stout', 'Non nemo reprehender', '+1 (958) 142-9906', 'kyfum@mailinator.com', 10.00, 'pending', '2025-04-21 10:59:40', '2025-04-21 10:59:40', 3),
(18, 'renewal', 'semi-annually', '2012-09-21', 'Velit deserunt dolo', 'Et non consequatur d', '2021-10-12', 'cooperative', 'single', 'corporation', 'no', '', 'Stafford', 'Ashely', 'Ava Lynn', 'Ora Wade', 'Michelle Washington', 'Voluptatibus amet c', 'Asperiores', 'witificemo@mailinator.com', '+1 (323) 397-6763', 'Est qui odio consequ', 'Voluptatibus ullam q', 'Pariatur I', 'qyguda@mailinator.com', '+1 (696) 378-4048', 'Consectetur facere e', 'Zephr Mcpherson', '+1 (929) 519-4718', 'hamihawena@mailinator.com', 'Cum labore dolor in ', 18, 30, 84, 'Adria Lewis', 'Veritatis odit sit ', '+1 (845) 105-6238', 'bevorogy@mailinator.com', 2.00, 'pending', '2025-04-21 11:10:09', '2025-04-21 11:10:09', 3),
(19, 'new', 'annually', '2011-12-26', 'Accusantium occaecat', 'Necessitatibus molli', '1973-02-06', 'single', 'single', 'single', 'yes', '', 'Miller', 'Lunea', 'Kalia Gallagher', 'Lawrence Porter', 'Sylvester Barnett', 'Placeat ut dolorem ', 'Fuga Volup', 'lezeny@mailinator.com', '+1 (154) 755-1844', 'Autem in facilis con', 'Minima ut dolores ea', 'Sunt sit v', 'qewelam@mailinator.com', '+1 (491) 786-1496', 'Quos et enim sint v', 'Deborah Fuller', '+1 (174) 351-5402', 'bysoqyzyd@mailinator.com', 'Et labore adipisci d', 47, 28, 96, 'Ashely Gallagher', 'Nihil voluptatem lab', '+1 (264) 644-4634', 'cogavyha@mailinator.com', 10.00, 'pending', '2025-04-21 11:23:54', '2025-04-21 11:23:54', 3),
(20, 'renewal', 'annually', '2013-07-09', 'In quasi necessitati', 'Veritatis nostrum il', '2020-10-27', 'partnership', 'single', 'single', 'yes', '', 'Jimenez', 'Mark', 'Hanae Mullen', 'Steel Arnold', 'Nigel Clemons', 'Est in laborum vero ', 'Amet adipi', 'ryqajowyn@mailinator.com', '+1 (661) 968-1642', 'Tenetur perferendis ', 'Vel minima incididun', 'Illum sed ', 'cabixeme@mailinator.com', '+1 (147) 719-8924', 'Illum eos laborum e', 'Moana Zimmerman', '+1 (712) 621-9941', 'xuturifo@mailinator.com', 'Aut numquam est quis', 34, 96, 36, 'Boris Henry', 'Id molestiae asperi', '+1 (159) 684-1125', 'vemalyh@mailinator.com', 5.00, 'pending', '2025-04-21 11:26:51', '2025-04-21 11:26:51', 4);

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
(7, 12, 'Allegra', 'Underwood', '+1 (675) 229-2259', 'Incididunt dolorem e', 'Customer Service', '1998-08-17', '2025-04-23 03:51:20'),
(8, 13, 'dave', 'chester', '+1 (621) 351-7828', 'tambay', 'HR', '2025-04-17', '2025-04-23 03:59:09');

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
(12, 'posu@mailinator.com', '$2b$10$6MxscDrHgvpytDVRvktjNe0Wpm2L8CjeOctT.t/S1E7lq/.e8GfzO', 'employee', '2025-04-23 03:51:20'),
(13, 'employee@gmail.com', '$2b$10$crg/YIEaYQ68Ydg.7fKo4.3qCvwPu7O0VczvwyObQp27akCBM3GJy', 'employee', '2025-04-23 03:59:09');

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  ADD PRIMARY KEY (`employee_id`),
  ADD KEY `user_id` (`user_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `business_permits`
--
ALTER TABLE `business_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tb_logins`
--
ALTER TABLE `tb_logins`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `business_activities`
--
ALTER TABLE `business_activities`
  ADD CONSTRAINT `business_activities_ibfk_1` FOREIGN KEY (`permit_id`) REFERENCES `business_permits` (`id`) ON DELETE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
