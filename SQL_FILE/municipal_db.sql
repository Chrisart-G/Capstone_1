-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2025 at 09:11 AM
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
(25, 24, 'Officia doloribus ad', 'Sed ut quaerat anim ', 0.00, 0.00, 0.00, '2025-04-23 07:35:05', '2025-04-23 07:35:05'),
(26, 25, 'Officiis minima haru', 'Eligendi nostrum rer', 0.00, 0.00, 0.00, '2025-04-23 08:15:12', '2025-04-23 08:15:12'),
(27, 26, 'Deleniti quibusdam s', 'Quas itaque ipsa do', 0.00, 0.00, 0.00, '2025-04-23 09:16:07', '2025-04-23 09:16:07'),
(28, 27, 'Voluptatem Aut temp', 'Perferendis velit e', 0.00, 0.00, 0.00, '2025-04-30 06:12:16', '2025-04-30 06:12:16');

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
(24, 'new', 'semi-annually', '1970-12-11', 'In excepteur repelle', 'Beatae tenetur aut p', '2002-03-29', 'partnership', 'single', 'corporation', 'no', '', 'Arnold', 'Claire', 'Ivor Cobb', 'Ria Wilcox', 'Maggy Weaver', 'Ex alias sit at ali', 'Molestiae ', 'nemeqy@mailinator.com', '+1 (421) 138-4357', 'Praesentium qui enim', 'Est fugiat sit se', 'Dolore ame', 'bewigapuno@mailinator.com', '+1 (395) 832-4824', 'Sint dolor placeat ', 'Isabelle Huff', '+1 (595) 147-3135', 'himonu@mailinator.com', 'Commodi labore quia ', 18, 82, 6, 'Abigail Potter', 'Aut sed laboriosam ', '+1 (885) 698-7854', 'raci@mailinator.com', 4.00, 'pending', '2025-04-23 07:35:05', '2025-04-23 07:35:05', 1),
(25, 'new', 'annually', '2021-08-28', 'Ipsum in Nam accusan', 'Asperiores eum eum q', '1984-07-13', 'corporation', 'corporation', 'partnership', 'no', '', 'Francis', 'Melyssa', 'Lamar Gould', 'Nicholas Wooten', 'Orli Lewis', 'Consequuntur eiusmod', 'Qui incidi', 'fyradeduga@mailinator.com', '+1 (233) 611-5656', 'Non ipsum qui quam ', 'Velit soluta laborum', 'Nisi nulla', 'zazatyta@mailinator.com', '+1 (692) 523-9954', 'Sint dolores ullamc', 'Cody Barrera', '+1 (344) 182-9269', 'saneb@mailinator.com', 'Ut veritatis iste pe', 41, 61, 71, 'Zeus Taylor', 'Dolores et dignissim', '+1 (611) 831-1614', 'hajubawotu@mailinator.com', 2.00, 'pending', '2025-04-23 08:15:12', '2025-04-23 08:15:12', 1),
(26, 'renewal', 'annually', '2025-03-04', 'Vel voluptatibus off', 'Quia dolores non in ', '2005-04-25', 'partnership', 'corporation', 'partnership', 'no', '', 'Love', 'Preston', 'Nolan Washington', 'Lana Becker', 'Amaya Joseph', 'Rerum suscipit nesci', 'Et ipsum p', 'topomydive@mailinator.com', '+1 (769) 637-5776', 'Corporis officia acc', 'Ut et cum mollit rep', 'Molestiae ', 'puqov@mailinator.com', '+1 (692) 671-7256', 'Odit nostrud animi ', 'Colt Santos', '+1 (213) 903-9482', 'wymiki@mailinator.com', 'Consequuntur molliti', 13, 39, 96, 'Melinda Lowery', 'Ut qui placeat labo', '+1 (945) 239-5308', 'letojegagi@mailinator.com', 3.00, 'pending', '2025-04-23 09:16:07', '2025-04-23 09:16:07', 1),
(27, 'new', 'annually', '1983-06-15', '12312321', 'dwaadawdadawdwadaw', '1992-07-29', 'partnership', 'corporation', 'single', 'yes', '', 'Flynn', 'Brenna', 'Lareina Schwartz', 'Macy Albert', 'Velma Atkinson', 'Ea hic ut id quis d', 'Commodi se', 'qedu@mailinator.com', '+1 (485) 907-6578', 'Duis voluptatibus il', 'Commodi rerum corrup', 'Non assume', 'guveqah@mailinator.com', '+1 (769) 585-2674', 'A est tempore accu', 'Thane Sharpe', '+1 (221) 447-8122', 'puwejaweka@mailinator.com', 'Blanditiis quibusdam', 84, 82, 61, 'Raja Reeves', 'Atque asperiores ull', '+1 (499) 845-3064', 'vuhaj@mailinator.com', 4.00, 'pending', '2025-04-30 06:12:16', '2025-04-30 06:12:16', 14);

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
(8, 13, 'dave', 'chester', '+1 (621) 351-7828', 'tambay', 'HR', '2025-04-17', '2025-04-23 03:59:09'),
(9, 15, 'dave', 'chester', '+1 (447) 314-3874', 'head', 'HR', '2025-04-23', '2025-04-30 06:36:34');

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
(13, 'employee@gmail.com', '$2b$10$crg/YIEaYQ68Ydg.7fKo4.3qCvwPu7O0VczvwyObQp27akCBM3GJy', 'employee', '2025-04-23 03:59:09'),
(14, 'user123@gmail.com', '$2b$10$8jQEG9ceaPvcSnXjYO994.KlqQMQMLr9JZgz57/V7mP9tnUW6xnz.', 'citizen', '2025-04-30 06:11:45'),
(15, 'newempolyee@gmail.com', '$2b$10$/b5HQ1gkktLem0FRIAZGVudIFWgw5XDRt02qGGG5Asw0kxXfKIMa2', 'employee', '2025-04-30 06:36:34');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `business_permits`
--
ALTER TABLE `business_permits`
  MODIFY `BusinessP_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tb_logins`
--
ALTER TABLE `tb_logins`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
