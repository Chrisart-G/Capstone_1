-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 28, 2025 at 04:18 PM
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
(72, 66, 'Ipsa numquam dolore', 'Ipsum impedit et si', 0.00, 0.00, 0.00, '2025-06-13 07:17:16', '2025-06-13 07:17:16'),
(73, 67, 'A consequatur ullam', 'Ducimus ea ad volup', 0.00, 0.00, 0.00, '2025-06-13 15:11:58', '2025-06-13 15:11:58'),
(74, 68, 'Sunt eos sunt eos i', 'Qui suscipit hic in ', 0.00, 0.00, 0.00, '2025-06-14 02:46:20', '2025-06-14 02:46:20'),
(75, 69, 'Amet eum qui enim a', 'Quo vitae dolor sunt', 0.00, 0.00, 0.00, '2025-06-14 04:01:23', '2025-06-14 04:01:23'),
(76, 70, 'Harum blanditiis aut', 'Voluptas nihil dolor', 0.00, 0.00, 0.00, '2025-06-14 04:55:13', '2025-06-14 04:55:13'),
(77, 71, 'Aspernatur nostrud a', 'Dolore Nam architect', 0.00, 0.00, 0.00, '2025-06-14 05:45:23', '2025-06-14 05:45:23');

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
(66, 'new', 'quarterly', '2015-03-16', '1231312312', 'dawdawdwadwadawdaw', '2016-02-29', 'partnership', 'partnership', 'single', 'no', '', 'Nealdwadawdawdadadadadwad', 'Ryleewadwadwad', 'Asher Beardadawdada', 'Ishmael Huff', 'Kitra Fry', 'Lorem maxime ut dolo', 'Est sed ne', 'lykadyjob@mailinator.com', '+1 (633) 475-9015', 'Ea culpa ea sit lab', 'Nihil ab molestiae s', 'Corrupti r', 'cedasesahi@mailinator.com', '+1 (867) 408-9425', 'Nesciunt quis volup', 'Ava Simmons', '+1 (363) 393-3359', 'tesebaroza@mailinator.com', 'Sit cupidatat commo', 19, 77, 58, 'Ifeoma Malone', 'Maiores velit esse ', '+1 (448) 439-6402', 'bary@mailinator.com', 12.00, 'approved', '2025-06-13 07:17:16', '2025-06-14 03:15:24', 22, '/uploads/business_docs/1749799036427_wew31231.jpg', '/uploads/business_docs/1749799036428_h4.jpg', '/uploads/business_docs/1749799036428_h5.jpg', NULL, NULL, NULL, NULL, 'Business Permit'),
(67, 'renewal', 'semi-annually', '2025-06-13', 'Fugiat minima in vel', 'In quos Nam velit e', '1970-10-02', 'corporation', 'partnership', 'partnership', 'yes', '', 'Sellers', 'Teegan', 'Garrett Murphy', 'Charlotte Patton', 'Gil Malone', 'Consectetur reprehe', 'Porro temp', 'qyje@mailinator.com', '+1 (935) 966-8621', 'Aut soluta ipsam adi', 'Error error earum ex', 'Ex asperio', 'bacyvid@mailinator.com', '+1 (664) 636-6767', 'Veniam Nam temporib', 'Russell Pratt', '+1 (244) 385-9879', 'viboj@mailinator.com', 'Reprehenderit in duc', 56, 99, 84, 'Tatiana Hensley', 'Molestias molestiae ', '+1 (246) 829-8111', 'keqypifi@mailinator.com', 12.00, 'approved', '2025-06-13 15:11:58', '2025-06-14 03:01:17', 22, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit'),
(68, 'new', 'annually', '2011-04-22', 'Tempore soluta temp', 'Doloremque ea archit', '2013-05-22', 'partnership', 'partnership', 'single', 'no', '', 'Hyde', 'Kadeem', 'Declan Pace', 'Mariam Tillman', 'Nomlanga Meadows', 'Magni officiis quia ', 'Commodi do', 'cipu@mailinator.com', '+1 (464) 871-6356', 'Eos quia esse sit b', 'Saepe aliquam consec', 'Soluta aut', 'vidop@mailinator.com', '+1 (894) 733-8568', 'Voluptate culpa aut ', 'Nomlanga Burnett', '+1 (425) 854-6361', 'zumu@mailinator.com', 'Maxime id quibusdam', 32, 7, 61, 'Cheryl Ochoa', 'Ab et in amet dolor', '+1 (231) 307-6612', 'pepy@mailinator.com', 5.00, 'approved', '2025-06-14 02:46:20', '2025-06-14 03:59:50', 22, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit'),
(69, 'renewal', 'annually', '1976-01-20', 'Sit quos esse qui s', 'Voluptatum consectet', '1970-12-16', 'corporation', 'single', 'partnership', 'no', '', 'Harper', 'Henry', 'Chester Bullock', 'Rylee Graham', 'Serena Burt', 'Quam reiciendis labo', 'Ut aperiam', 'kuzi@mailinator.com', '+1 (114) 398-2355', 'Tempor eum ipsum od', 'Eveniet itaque qui ', 'Consectetu', 'jikubaso@mailinator.com', '+1 (421) 916-4967', 'Nam consequuntur est', 'Audrey Armstrong', '+1 (591) 884-4719', 'diwenus@mailinator.com', 'Id magni officiis si', 47, 9, 17, 'Xenos Walter', 'Exercitation ut eu n', '+1 (843) 509-9342', 'zapudonyxe@mailinator.com', 3.00, 'in-progress', '2025-06-14 04:01:23', '2025-06-14 04:01:36', 22, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit'),
(70, 'new', 'semi-annually', '2016-06-30', 'Voluptate ut qui mol', 'Quo aliquid eveniet', '1979-08-11', 'partnership', 'corporation', 'corporation', 'yes', '', 'Lacson', 'Dave', 'S.', 'Lars Nicholson', 'Dorian Burnett', 'Perspiciatis nostru', 'Tempor off', 'gybadi@mailinator.com', '+1 (637) 814-4097', 'Non explicabo Est q', 'Eos magni id quis i', 'Adipisci p', 'poxavowe@mailinator.com', '+1 (336) 543-5511', 'Sed impedit et maio', 'Azalia Ryan', '+1 (121) 198-3161', 'rotijar@mailinator.com', 'Sunt eos sunt volupt', 13, 82, 56, 'Arsenio Mcneil', 'Voluptatem Odio imp', '+1 (516) 991-1018', 'mexefup@mailinator.com', 10.00, 'approved', '2025-06-14 04:55:13', '2025-06-14 05:07:15', 26, '/uploads/business_docs/1749876913177_wew31231.jpg', '/uploads/business_docs/1749876913177_h6.jpg', '/uploads/business_docs/1749876913177_h5.jpg', '/uploads/business_docs/1749876913178_h5.jpg', NULL, NULL, NULL, 'Business Permit'),
(71, 'renewal', 'semi-annually', '2014-03-03', 'Sed reiciendis odit ', 'Aut dignissimos fugi', '2024-10-06', 'corporation', 'corporation', 'corporation', 'no', '', 'Agudelo', 'Will', 'S.', 'Water Station', 'Curran Kennedy', 'Rem neque eligendi m', 'Iure lorem', 'xuxiqo@mailinator.com', '+1 (606) 641-5537', 'Dolores adipisci dig', 'Et dolorem eos id h', 'Dolore est', 'xulumacen@mailinator.com', '+1 (174) 738-8146', 'Aliqua Nulla ad imp', 'Aurora Frederick', '+1 (312) 714-1591', 'hunuwovafu@mailinator.com', 'Est sed eos qui aute', 1, 49, 86, 'Nigel Weiss', 'Odit voluptatem com', '+1 (794) 911-3463', 'heta@mailinator.com', 12.00, 'approved', '2025-06-14 05:45:23', '2025-06-14 05:53:23', 26, '/uploads/business_docs/1749879923947_h5.jpg', '/uploads/business_docs/1749879923947_1wda.jpg', NULL, NULL, NULL, NULL, NULL, 'Business Permit');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_application_requirements`
--

CREATE TABLE `tbl_application_requirements` (
  `requirement_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `application_type` enum('business','electrical','cedula') NOT NULL,
  `application_id` int(11) NOT NULL,
  `pdf_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_application_requirements`
--

INSERT INTO `tbl_application_requirements` (`requirement_id`, `user_id`, `file_path`, `application_type`, `application_id`, `pdf_path`, `uploaded_at`) VALUES
(1, 23, '/uploads/requirements/1749832845446_Your paragraph text.pdf', 'business', 0, '', '2025-06-13 16:40:45'),
(2, 23, '/uploads/requirements/1749834256143_FCT-Program-Obedience-2.pdf', 'business', 0, '', '2025-06-13 17:04:16'),
(3, 23, '/uploads/requirements/1749834891984_FILM NOTES_ HENERAL LUNA.pdf', 'business', 0, '', '2025-06-13 17:14:51'),
(4, 23, '/uploads/requirements/1749834987547_FILM NOTES_ HENERAL LUNA.pdf', 'business', 0, '', '2025-06-13 17:16:27'),
(5, 23, '/uploads/requirements/1749835857489_Your paragraph text (1).pdf', 'business', 0, '', '2025-06-13 17:30:57'),
(6, 23, '/uploads/requirements/1749836679733_FILM NOTES_ HENERAL LUNA.pdf', 'business', 0, '', '2025-06-13 17:44:39'),
(7, 23, '/uploads/requirements/1749877487680_Decomposition Chart (1).pdf', 'business', 0, '', '2025-06-14 05:04:47');

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
(12, 'Ariana Peck', 'Et aspernatur qui au', 'Et incididunt sunt ', '1981-07-12', 'Ipsam quod ipsum ver', 812.00, 'Dolores aliqua Quis', 'female', 'single', 'Iste sit officia co', 22, '2025-06-13 04:08:13', '2025-06-13 17:18:18', 'in-progress'),
(13, 'Rina Marshall', 'Aut deserunt modi ve', 'Expedita explicabo ', '1970-05-16', 'Dolores non maxime e', 470.00, 'Et nemo consequat U', 'female', 'single', 'Proident pariatur ', 22, '2025-06-14 03:36:59', '2025-06-14 03:37:20', 'in-review'),
(14, 'Gray Pitts', 'Saepe id qui volupta', 'Quis facilis molesti', '1991-04-09', 'Labore blanditiis pl', 828.00, 'Error accusamus dign', 'male', 'single', 'Eaque beatae quia au', 22, '2025-06-14 04:02:59', '2025-06-14 04:03:04', 'in-review');

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
  `status` enum('pending','in-review','approved','rejected') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_electrical_permits`
--

INSERT INTO `tbl_electrical_permits` (`id`, `application_no`, `ep_no`, `building_permit_no`, `user_id`, `last_name`, `first_name`, `middle_initial`, `tin`, `construction_owned`, `form_of_ownership`, `use_or_character`, `address_no`, `address_street`, `address_barangay`, `address_city`, `address_zip_code`, `telephone_no`, `location_street`, `location_lot_no`, `location_blk_no`, `location_tct_no`, `location_tax_dec_no`, `location_barangay`, `location_city`, `scope_of_work`, `status`, `created_at`, `updated_at`) VALUES
(19, 'EP-APP-2025-000019', 'EP-2025-000019', 'BP-2025-000019', 22, 'Dickerson', 'Vladimir', 'Et Na', 'Quia proident ipsam', 'Aspernatur irure fug', 'Id ullam repellendus', 'Cupidatat voluptatem', 'Earum dolores incidi', 'Ipsa amet qui maio', 'Dolorum et tempore ', 'Error optio itaque ', '95131', '+1 (479) 744-9353', 'Quia nobis delectus', 'Iure aut consectetur', 'Dolore amet quisqua', 'Optio similique fac', 'Qui reiciendis nemo ', 'Qui qui veritatis in', 'Delectus irure esse', 'reconnection', 'approved', '2025-06-12 16:34:50', '2025-06-12 16:37:11'),
(20, 'EP-APP-2025-000020', 'EP-2025-000020', 'BP-2025-000020', 22, 'Snyder', 'Tashya', 'Quibu', 'Tempore eius molest', 'Aut amet quibusdam ', 'Quisquam quia sit vo', 'Dolor blanditiis ut ', 'Similique quaerat fa', 'Fugiat ut mollit di', 'Minim velit facilis', 'Qui aut consequat A', '88455', '+1 (328) 898-8228', 'Minim eum ut volupta', 'Alias saepe possimus', 'Quia beatae corrupti', 'Sint distinctio Imp', 'Dolore ipsam qui rep', 'Alias harum est lab', 'Velit et accusamus ', 'annualInspection', 'approved', '2025-06-12 19:36:12', '2025-06-12 19:36:42'),
(21, 'EP-APP-2025-000021', 'EP-2025-000021', 'BP-2025-000021', 22, 'Weber', 'Skyler', 'Nihil', 'Sapiente ut minus ve', 'Eaque consequatur an', 'Ut veniam est repr', 'Voluptatem adipisci', 'Sed sit voluptatum e', 'Asperiores eum occae', 'Dicta incididunt qui', 'Provident dolores a', '12729', '+1 (525) 186-7619', 'Porro culpa nulla fu', 'Mollitia corporis fa', 'Eligendi dolore dolo', 'Voluptate magni labo', 'Occaecat dignissimos', 'Minima dolorum esse ', 'Nemo ut nostrud est ', 'upgradingOfService', '', '2025-06-13 02:54:27', '2025-06-14 03:46:50'),
(22, 'EP-APP-2025-000022', 'EP-2025-000022', 'BP-2025-000022', 22, 'Fitzgerald', 'Joshua', 'Qui s', 'Est culpa elit qui', 'Rerum necessitatibus', 'Sed voluptatum sint', 'Enim nostrud autem n', 'Illo non qui hic bla', 'Non aperiam eiusmod ', 'Eveniet aspernatur ', 'Reprehenderit hic a', '27030', '+1 (105) 714-8791', 'Quis nobis esse aspe', 'In ipsum sint dese', 'Dolor et magni asper', 'Et dignissimos omnis', 'Aperiam exercitation', 'Aut recusandae Temp', 'Id fugiat tenetur n', 'separationOfService', 'in-review', '2025-06-13 04:33:23', '2025-06-14 04:17:37'),
(23, 'EP-APP-2025-000023', 'EP-2025-000023', 'BP-2025-000023', 25, 'Goodman', 'Myles', 'Moles', 'Accusantium tempora ', 'Adipisci est tempori', 'In quis quas dolorem', 'Et in eum ut nesciun', 'Quo est ducimus arc', 'Nesciunt proident ', 'Illum dolor do nihi', 'At non provident al', '75330', '+1 (121) 901-2655', 'Est magnam eiusmod n', 'Provident ducimus ', 'Eum deserunt odit et', 'Ea in maxime veritat', 'In ut ducimus verit', 'Non ut similique min', 'In ullam asperiores ', 'annualInspection', 'in-review', '2025-06-13 07:15:45', '2025-06-14 04:17:36'),
(24, 'EP-APP-2025-000024', 'EP-2025-000024', 'BP-2025-000024', 26, 'Lacson', 'Dave', 's', 'A autem aut in dolor', 'Sit est eiusmod ver', 'Et proident tempora', 'Rem tenetur qui volu', 'Laborum Voluptate e', 'Mollitia in Nam veli', 'Debitis rem quaerat ', 'Aut repudiandae nequ', '66516', '+1 (365) 342-7938', 'Recusandae Sit saep', 'Ut iusto fugiat exer', 'Quis rerum quos aute', 'Consectetur tempora', 'Nisi expedita iure o', 'Totam non esse volu', 'Temporibus recusanda', 'temporary', NULL, '2025-06-14 05:10:33', '2025-06-14 05:10:33');

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
(11, 23, 'jerryl', 'perez', '+1 (447) 314-3874', 'HR Head', 'Operations', '2025-06-13', '2025-06-12 16:36:57'),
(12, 24, 'Hillary', 'Wilcox', '+1 (679) 258-6703', 'Vitae nulla voluptat', 'Sales', '1997-03-28', '2025-06-12 17:13:25'),
(13, 27, 'Jason', 'wada', '+1 (621) 351-7828', 'Business head', 'HR', '2025-06-26', '2025-06-14 04:59:18');

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
(6, 11, 12, '2025-06-12', 0, 'active', '2025-06-12 17:13:12', '2025-06-12 17:25:01'),
(8, 12, 11, '2025-06-12', 0, 'active', '2025-06-12 17:41:51', '2025-06-12 17:41:51'),
(9, 11, 11, '2025-06-13', 0, 'active', '2025-06-12 17:41:51', '2025-06-13 07:13:48'),
(10, 13, 13, '2025-06-14', 1, 'active', '2025-06-14 05:01:07', '2025-06-14 05:01:07');

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
(10, 'Business', 'BSD', NULL, '2nd Floor Municipal Bldg.', NULL, 'nyvag@mailinator.com', 'active', '2025-05-02 03:30:00', '2025-05-02 06:15:33'),
(11, '32eqe2q', 'eq2e2q', 'dwaa', '3rd floor', '+1 (512) 936-3437', 'newuser@gmail.com', 'active', '2025-06-12 16:51:54', '2025-06-12 16:51:54'),
(12, 'Madison Gentry', 'Itaque facilis aliqu', 'Placeat repudiandae', 'Iusto ipsa consequu', '+1 (101) 733-7012', 'zynuhynid@mailinator.com', 'active', '2025-06-12 17:13:12', '2025-06-12 17:13:12'),
(13, 'Business Depaprtment', '6106', NULL, 'Ad et sed temporibus', '+1 (512) 936-3437', 'admin@gmail.com', 'active', '2025-06-14 05:01:07', '2025-06-14 05:01:07');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_info`
--

CREATE TABLE `tbl_user_info` (
  `info_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone_number` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_user_info`
--

INSERT INTO `tbl_user_info` (`info_id`, `user_id`, `full_name`, `address`, `phone_number`) VALUES
(1, 22, 'dave chester', 'hinigaran', '092313231'),
(2, 25, 'amo ko', 'brgy 2 Hinigaran', '0923122523'),
(3, 26, 'dave lacson', 'Hinigaran Brgy 2', '09534178798');

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
(22, 'user@gmail.com', '$2b$10$rxzA2Ov.CstSAF4Szet7pedof7ZETRnsNHYcrfhtHjzlgx/TWY5Ea', 'citizen', '2025-06-12 15:41:07'),
(23, 'employee@gmail.com', '$2b$10$5F.K4aOQWKaCi/hvenyibe/lPfcXjLk1YWMx4Mw.lpN7urzpkGe/q', 'employee', '2025-06-12 16:36:57'),
(24, 'tevirafe@mailinator.com', '$2b$10$kEMgoCG/ZoVqKx9/jB2gc.TeyMMBctVT3VQj7LGOER5yqKq3ail5O', 'employee', '2025-06-12 17:13:25'),
(25, 'chongo@gmail.com', '$2b$10$sNjApVgQZ0eGdiW/Jq8QH.beqr3.L8P2HRwLZ8vWKnK9UjK0ufmOW', 'citizen', '2025-06-13 07:14:57'),
(26, 'davelacson@gmail.com', '$2b$10$YplqwaUOpIVOpQkcHz4bNOHrvV8WSj7D8go/ubYjSuMZkqJeytPiu', 'citizen', '2025-06-14 04:52:46'),
(27, 'newemployee@gmail.com', '$2b$10$n3FGhMNGwOjUriNhM5OG1.Obd/tqeK8vxBX/VUF2wPq9gK9nvbwVy', 'employee', '2025-06-14 04:59:18');

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
-- Indexes for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  ADD PRIMARY KEY (`requirement_id`),
  ADD KEY `idx_user_app` (`user_id`,`application_type`,`application_id`);

--
-- Indexes for table `tbl_cedula`
--
ALTER TABLE `tbl_cedula`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

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
-- Indexes for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  ADD PRIMARY KEY (`info_id`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `business_permits`
--
ALTER TABLE `business_permits`
  MODIFY `BusinessP_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_cedula`
--
ALTER TABLE `tbl_cedula`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `tbl_electrical_permits`
--
ALTER TABLE `tbl_electrical_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tbl_employee_offices`
--
ALTER TABLE `tbl_employee_offices`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_offices`
--
ALTER TABLE `tbl_offices`
  MODIFY `office_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  MODIFY `info_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tb_logins`
--
ALTER TABLE `tb_logins`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

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
-- Constraints for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  ADD CONSTRAINT `fk_user_requirements` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_cedula`
--
ALTER TABLE `tbl_cedula`
  ADD CONSTRAINT `tbl_cedula_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

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

--
-- Constraints for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  ADD CONSTRAINT `tbl_user_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
