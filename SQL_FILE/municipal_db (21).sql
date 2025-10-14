-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 14, 2025 at 07:49 AM
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
(81, 75, 'Doloribus suscipit n', 'Excepturi deserunt f', 0.00, 0.00, 0.00, '2025-09-28 17:16:23', '2025-09-28 17:16:23');

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
(75, 'new', 'quarterly', '1970-04-06', 'Velit labore aliqua', 'Mollit autem enim it', '2005-01-16', 'corporation', 'partnership', 'single', 'yes', '', 'chester', 'dave', 'sumabong', 'Melvin Johnston', 'Noah Tucker', 'Alias nemo non bland', 'Voluptatem', 'wyhimiq@mailinator.com', '+1 (281) 763-8466', 'Omnis nostrum asperi', 'Consequatur adipisic', 'Enim facil', 'racek@mailinator.com', '+1 (474) 329-7543', 'Aliquid quia ut lore', 'Beau Holland', '+1 (178) 183-7706', 'koza@mailinator.com', 'Omnis cillum et elig', 97, 85, 54, 'Armand Olson', 'Voluptate deserunt e', '+1 (587) 693-1524', 'vyvo@mailinator.com', 7.00, 'requirements-completed', '2025-09-28 17:16:23', '2025-10-12 17:00:22', 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Business Permit');

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
(1, 29, 'BP-APP-2025-000001', 'BP-2025-000001', 'BLDG-2025-000001', 'Wiley', 'Erica', 'Excepteur ', 'Pariatur Iste earum', 'Voluptatem A deleni', 'Ipsum in et eveniet', 'Officia soluta paria', 'Minima et optio exc', 'Eveniet repudiandae', 'Distinctio Nesciunt', '24826', '+1 (472) 867-3174', 'Pariatur Earum fugi', 'Id itaque id quia si', 'Aliquip dolore harum', 'Ut dolor esse fugit', 'Aperiam voluptatibus', 'A id nulla praesenti', 'Quod officia exceptu', 'Renovation', 'Apartment Building', 'Condominium', 'School', 'Office Building', 'Store', 'Workshop', 'Processing Plant', 'Factory', 'Clinic', 'Agricultural Storage', 'Tool Shed', 'electrical', 'in-review', '2025-10-12 16:55:46', '2025-10-10 15:47:30', '2025-10-12 16:55:46');

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
(18, 'dave sumabong chester', 'hinigaran brgy2', 'Omnis vel hic ipsum ', '1970-06-18', 'Ut et ex culpa sit b', 427.00, 'Omnis maiores qui ip', 'female', 'married', 'Eos omnis qui volup', 29, '2025-09-28 17:26:49', '2025-10-12 17:00:24', 'requirements-completed');

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
(36, 'EP-APP-2025-000036', 'EP-2025-000036', 'BP-2025-000036', 29, 'chester', 'dave', 'S', 'Voluptate et laborum', 'Possimus eveniet l', 'Illum non doloremqu', 'Dolore aut illum au', 'Aperiam velit qui as', 'hinigaran brgy2', NULL, 'Hinigaran', '62927', '09321731723', 'Eiusmod ullamco maxi', 'Non et pariatur Pla', 'Libero dolor repudia', 'Impedit in irure au', 'Magna sed alias illu', 'In quas reprehenderi', 'Ipsam et esse dolor', 'annualInspection', '', '2025-09-28 17:29:10', '2025-10-12 16:55:54');

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
(1, 'ELC-APP-2025-000001', 'ELC-2025-000001', 'ELEC-2025-000001', 29, '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '2', '1', '3', '2', '2', '2', '2', '2', '2', '2', 'Demolition', 'requirements-completed', '2025-10-11 09:18:56', '2025-10-12 17:00:28');

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
(1, 'FP-APP-2025-000001', 'FP-2025-000001', 'FENC-2025-000001', 29, 'Dolor non ex veritat', 'Provident ea et est', 'Quibu', 'Alias sint et eaque', 'Et magna in veritati', 'Quo delectus ducimu', 'Ullam inventore perf', 'Reprehenderit delect', 'Dolor aliquid recusa', 'Animi voluptatem E', 'Voluptatem Fuga La', 'Atque qui ', 'Ipsa nihil veniam ', 'Numquam unde qui adi', 'Architecto possimus', 'Explicabo Recusanda', 'Et illo voluptas lab', 'Amet quis excepteur', 'Quis perferendis ill', 'Maiores consequuntur', 'erection', NULL, 'requirements-completed', '2025-10-10 16:44:05', '2025-10-12 17:00:30');

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
(30, 29, 'business', 'Business Permit', '/uploads/receipts/receipt-1758961091054-618570082.png', 'other', 0.00, 20.00, 500.00, 'approved', 'okay na ah', 30, '2025-09-27 08:46:54', 1, 1, '2025-09-28 17:16:23', 0, NULL, 1, '2025-09-28 17:16:23', 75, '2025-09-27 08:18:11', '2025-09-28 17:16:23'),
(31, 29, 'cedula', 'Cedula Permit', '/uploads/receipts/receipt-1759080041959-143074415.png', 'other', 0.00, 20.00, 100.00, 'approved', 'goods', 30, '2025-09-28 17:22:36', 1, 1, '2025-09-28 17:26:49', 0, NULL, 1, '2025-09-28 17:26:49', 18, '2025-09-28 17:20:41', '2025-09-28 17:26:49'),
(32, 29, 'electrical', 'Electrical Permit', '/uploads/receipts/receipt-1759080427002-746573987.png', 'other', 0.00, 20.00, 300.00, 'approved', 'goods shit ', 30, '2025-09-28 17:27:42', 1, 1, '2025-09-28 17:29:10', 0, NULL, 1, '2025-09-28 17:29:10', 36, '2025-09-28 17:27:07', '2025-09-28 17:29:10'),
(36, 29, 'building', 'Building Permit', '/uploads/receipts/receipt-1760112388821-385308713.jpg', 'other', 160.00, 20.00, 800.00, 'approved', NULL, 30, '2025-10-10 16:07:13', 1, 0, NULL, 0, NULL, 0, NULL, NULL, '2025-10-10 16:06:28', '2025-10-10 16:07:13'),
(37, 29, 'plumbing', 'Plumbing Permit', '/uploads/receipts/receipt-1760113759777-118480161.png', 'other', 50.00, 20.00, 250.00, 'approved', NULL, 30, '2025-10-10 16:29:46', 1, 1, '2025-10-10 16:30:06', 0, NULL, 1, '2025-10-10 16:30:06', 1, '2025-10-10 16:29:19', '2025-10-10 16:30:06'),
(38, 29, 'fencing', 'Fencing Permit', '/uploads/receipts/receipt-1760114558786-371099870.png', 'other', 40.00, 20.00, 200.00, 'approved', '312', 30, '2025-10-10 16:42:58', 1, 1, '2025-10-10 16:44:05', 0, NULL, 1, '2025-10-10 16:44:05', 1, '2025-10-10 16:42:38', '2025-10-10 16:44:05'),
(39, 29, 'electronics', 'Electronics Permit', '/uploads/receipts/receipt-1760173828497-922792229.png', 'other', 70.00, 20.00, 350.00, 'approved', 'test\n', 30, '2025-10-11 09:10:51', 1, 1, '2025-10-11 09:18:56', 0, NULL, 1, '2025-10-11 09:18:56', 1, '2025-10-11 09:10:28', '2025-10-11 09:18:56');

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
(1, 'PP-APP-2025-000001', 'PP-2025-000001', 'PLMB-2025-000001', 29, 'Curry', 'Minerva', 'Labor', 'Velit enim ullamco v', 'Ipsam rem aut aut pr', 'Facere aut voluptate', 'Tempora modi ipsum ', 'Autem ea beatae enim', 'Blanditiis saepe mag', 'Excepteur corporis c', 'In laborum magnam do', '37021', '+1 (383) 745-1312', 'Quis beatae porro qu', 'Voluptatem adipisci ', 'Cupidatat id aute ve', 'Quia itaque exceptur', 'Labore omnis animi ', 'In asperiores suscip', 'Nulla dolore dolorib', 'accessoryBuilding', NULL, 'requirements-completed', '2025-10-10 16:30:06', '2025-10-12 17:00:26');

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
(5, 29, 'dave', 'sumabong', 'chester', 'hinigaran brgy2', '09321731723');

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
(30, 'employee@gmail.com', '$2b$10$3Dgwp/PC8/Odd0tmx75iXedlRA87Agu/SIH1EHtv39NI1PkgVDmVC', 'employee', '2025-09-27 08:16:47');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `business_permits`
--
ALTER TABLE `business_permits`
  MODIFY `BusinessP_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `tbl_application_requirements`
--
ALTER TABLE `tbl_application_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_building_permits`
--
ALTER TABLE `tbl_building_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_cedula`
--
ALTER TABLE `tbl_cedula`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `tbl_electrical_permits`
--
ALTER TABLE `tbl_electrical_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `tbl_electronics_permits`
--
ALTER TABLE `tbl_electronics_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_employeeinformation`
--
ALTER TABLE `tbl_employeeinformation`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `tbl_employee_offices`
--
ALTER TABLE `tbl_employee_offices`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_fencing_permits`
--
ALTER TABLE `tbl_fencing_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_offices`
--
ALTER TABLE `tbl_offices`
  MODIFY `office_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tbl_payment_receipts`
--
ALTER TABLE `tbl_payment_receipts`
  MODIFY `receipt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `tbl_plumbing_permits`
--
ALTER TABLE `tbl_plumbing_permits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  MODIFY `info_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tb_logins`
--
ALTER TABLE `tb_logins`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

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
-- Constraints for table `tbl_user_info`
--
ALTER TABLE `tbl_user_info`
  ADD CONSTRAINT `tbl_user_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_logins` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
