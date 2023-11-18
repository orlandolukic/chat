-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 18, 2023 at 12:02 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chat`
--

-- --------------------------------------------------------

--
-- Table structure for table `active_chat_heads`
--

CREATE TABLE `active_chat_heads` (
  `active_chat_headID` int(11) NOT NULL,
  `senderID` int(11) NOT NULL,
  `receiverID` int(11) NOT NULL,
  `last_sent` tinyint(1) NOT NULL,
  `new_messages` int(11) NOT NULL DEFAULT 0,
  `minimized` tinyint(1) NOT NULL,
  `outside` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `append_messages`
--

CREATE TABLE `append_messages` (
  `apID` int(11) NOT NULL,
  `message` text NOT NULL,
  `date` date NOT NULL,
  `timestamp` int(11) NOT NULL,
  `seen` int(11) NOT NULL,
  `senderID` int(11) NOT NULL,
  `receiverID` int(11) NOT NULL,
  `message_type` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `memberID` int(11) NOT NULL,
  `groupID` int(11) NOT NULL,
  `username` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`memberID`, `groupID`, `username`) VALUES
(1, 1, 'marcus'),
(2, 1, 'napoleon');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `messageID` int(11) NOT NULL,
  `message` text NOT NULL,
  `date` date NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `seen` tinyint(4) NOT NULL DEFAULT 0,
  `senderID` int(11) NOT NULL,
  `receiverID` int(11) NOT NULL,
  `message_type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `settingsID` int(11) NOT NULL,
  `option_name` text NOT NULL,
  `option_value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`settingsID`, `option_name`, `option_value`) VALUES
(1, 'CHAT_DB_TYPE', 'localhost'),
(2, 'CHAT_DB_USERNAME', 'admin'),
(3, 'CHAT_DB_PASSWORD', 'lukaluka'),
(4, 'CHAT_DB_NAME', 'chat');

-- --------------------------------------------------------

--
-- Table structure for table `typing`
--

CREATE TABLE `typing` (
  `typeID` int(11) NOT NULL,
  `senderID` int(11) NOT NULL,
  `receiverID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` varchar(30) NOT NULL,
  `name` text NOT NULL,
  `surname` text NOT NULL,
  `search_value` text DEFAULT NULL,
  `sex` tinyint(1) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `profilepic` text DEFAULT NULL,
  `timestamp` int(11) NOT NULL,
  `sound_effect` tinyint(1) NOT NULL DEFAULT 1,
  `online` tinyint(1) NOT NULL,
  `force_offline` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `name`, `surname`, `search_value`, `sex`, `username`, `password`, `profilepic`, `timestamp`, `sound_effect`, `online`, `force_offline`) VALUES
('1111111111', 'Marcus', 'Aurelius', 'marcus aurelius', 0, 'marcus', 'marcus', 'marcus.jpg', 1700302795, 1, 1, 0),
('222222222', 'Napoleon', 'Bonaparte', 'napoleon bonaparte', 0, 'napoleon', 'napoleon', 'napoleon.jpg', 1700304441, 1, 1, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `active_chat_heads`
--
ALTER TABLE `active_chat_heads`
  ADD PRIMARY KEY (`active_chat_headID`);

--
-- Indexes for table `append_messages`
--
ALTER TABLE `append_messages`
  ADD PRIMARY KEY (`apID`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`memberID`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`messageID`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`settingsID`);

--
-- Indexes for table `typing`
--
ALTER TABLE `typing`
  ADD PRIMARY KEY (`typeID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `active_chat_heads`
--
ALTER TABLE `active_chat_heads`
  MODIFY `active_chat_headID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=493;

--
-- AUTO_INCREMENT for table `append_messages`
--
ALTER TABLE `append_messages`
  MODIFY `apID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1029;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `memberID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `messageID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `settingsID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `typing`
--
ALTER TABLE `typing`
  MODIFY `typeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
