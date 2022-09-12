USE chat;
-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: localhost    Database: chat
-- ------------------------------------------------------
-- Server version	8.0.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `clean_mode`
--

DROP TABLE IF EXISTS `clean_mode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clean_mode` (
  `pk` int NOT NULL DEFAULT '16',
  `cln_period` int NOT NULL,
  `cln_threshold` int NOT NULL,
  `cln_start` int NOT NULL,
  `service_stat` tinyint NOT NULL,
  `cln_period_unit` tinyint NOT NULL,
  `cln_threshold_unit` tinyint NOT NULL,
  `service_opts` tinyint NOT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clean_mode`
--

LOCK TABLES `clean_mode` WRITE;
/*!40000 ALTER TABLE `clean_mode` DISABLE KEYS */;
/*!40000 ALTER TABLE `clean_mode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `msgId` int NOT NULL AUTO_INCREMENT,
  `usrId` int NOT NULL,
  `message` varchar(256) NOT NULL,
  `sent` datetime NOT NULL,
  PRIMARY KEY (`msgId`),
  KEY `mesages_fk1_idx` (`usrId`) /*!80000 INVISIBLE */,
  KEY `mesages_fk2_idx` (`usrId`) /*!80000 INVISIBLE */,
  KEY `mesages_fk3_idx` (`sent`),
  CONSTRAINT `mesages_fk1` FOREIGN KEY (`usrId`) REFERENCES `users_names` (`usrId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (29,26,'Please don`t fludding','2022-09-08 20:49:28'),(30,22,'The weather wos bad.Somtimes it was raining and snowing.It was a storm.Our ship was in danger.Our capitan tell us that we can be brave. We knew that the russian warchip will go fuck yourself!','2022-09-08 20:49:35');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sym_keys`
--

DROP TABLE IF EXISTS `sym_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sym_keys` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `pubKey` blob NOT NULL,
  `initVect` blob NOT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sym_keys`
--

LOCK TABLES `sym_keys` WRITE;
/*!40000 ALTER TABLE `sym_keys` DISABLE KEYS */;
INSERT INTO `sym_keys` VALUES (1,_binary '[¤\Ì\ÍSó³3n\î\Û\Ò`#5¢m9ðì',_binary 'Á\É÷d·\åbOf1W');
/*!40000 ALTER TABLE `sym_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `usrId` int NOT NULL,
  `usrPassword` blob NOT NULL,
  `usrAvatar` blob NOT NULL,
  `failLogins` int NOT NULL DEFAULT '0',
  `usrStatus` int NOT NULL DEFAULT '0',
  UNIQUE KEY `idusers_UNIQUE` (`usrId`),
  CONSTRAINT `fk_01001` FOREIGN KEY (`usrId`) REFERENCES `users_names` (`usrId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (22,_binary '$2b$10$mcxc6CJyM3H4BVbJX8uWX.u0oxcJBukZlFmUX60kHGKD9JOasb626',_binary 'data:image/jpeg;base64,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',0,0),(25,_binary '$2b$10$qQGegdLxfNYPYkZYiQ7HDuS2t.FKA2UFvP57EGfVdnWauE68o1Qne',_binary 'data:image/jpeg;base64,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',0,0),(26,_binary '$2b$10$d1c5OUNlBc5m3.hxavC74.elwYzKT5EROdkmqt/9v4Khemnjcrgbm',_binary 'data:image/jpeg;base64,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',0,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_names`
--

DROP TABLE IF EXISTS `users_names`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_names` (
  `usrName` varchar(25) NOT NULL,
  `usrId` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`usrName`),
  UNIQUE KEY `usrId_UNIQUE` (`usrId`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_names`
--

LOCK TABLES `users_names` WRITE;
/*!40000 ALTER TABLE `users_names` DISABLE KEYS */;
INSERT INTO `users_names` VALUES ('User3',22),('Administrator',25),('User1',26);
/*!40000 ALTER TABLE `users_names` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-09-12 16:16:56
