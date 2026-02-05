-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: tubeflowsaas
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'Admin Teste','caseiro.henrique@gmail.com','$2b$12$1IvwNeALEGKeKuF/xzIOge.pyhvG/ANSyH4uuT5DWZuG3LFoSnb1a','admin','2025-07-22 19:06:39','2025-07-22 19:06:39'),(2,'Admin','admin@gmail.com','$2b$10$q1btf7nEiemxZSL8AZyQOOisRO7eCyhduvbJA4mEZMG6cfAuC0Jy2','admin','2025-07-23 05:06:35','2025-09-05 14:54:32'),(14,'testesteste','caserio.henrique@gmail.com','$2b$12$Gv4ac6r7foUM5rAJbQsJQOqiea5aiTwEcBfRPV5No7cS0y1nuL5mC','admin','2025-09-10 20:57:40','2025-09-10 20:57:40');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `youtube_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `channels_ibfk_1` (`company_id`),
  CONSTRAINT `channels_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channels`
--

LOCK TABLES `channels` WRITE;
/*!40000 ALTER TABLE `channels` DISABLE KEYS */;
INSERT INTO `channels` VALUES (3,2,'teste','teste231','https://www.youtube.com/@PanicoRetroOficial',1,'2025-08-05 20:02:17','2025-08-05 20:02:17'),(30,9,'Cultura Nostalgica','---','#',1,'2025-09-30 16:31:05','2025-09-30 16:31:05'),(31,9,'Cine Cultura','#','#',1,'2025-09-30 17:18:30','2025-09-30 17:18:30'),(32,9,'Cultura Espanhol','#','/3',1,'2025-10-10 13:59:39','2025-10-10 13:59:39'),(33,9,'Cultura e Nostalgia','#','#',1,'2025-10-13 16:30:54','2025-10-13 16:30:54'),(34,9,'Beleza Feminina','beleza','#',1,'2025-11-11 14:36:31','2025-11-11 14:36:31'),(35,9,'Cinema e Cultura','lll','#',1,'2026-01-05 16:21:39','2026-01-05 16:21:39'),(36,9,'Cine Espanhol','Ghgfd','#',1,'2026-01-14 22:37:44','2026-01-14 22:37:44');
/*!40000 ALTER TABLE `channels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `video_id` int NOT NULL,
  `text` text COLLATE utf8mb4_general_ci NOT NULL,
  `user_type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `freelancer_id` int DEFAULT NULL,
  `company_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `freelancer_id` (`freelancer_id`),
  KEY `company_id` (`company_id`),
  KEY `comments_ibfk_1` (`video_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`freelancer_id`) REFERENCES `freelancers` (`id`),
  CONSTRAINT `comments_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=251 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (3,3,'teste','freelancer',NULL,NULL,2,'2025-08-05 20:37:28'),(4,4,'Eu quero a thumb pronta até amanhã','user',2,NULL,2,'2025-08-07 04:03:41'),(150,212,'Link do Roteiro:\nhttps://docs.google.com/document/d/1qeTX86kCP5zoSz2_i6vExMyD1PVg1z9j58GLrioNDpc/edit?usp=sharing','user',13,NULL,9,'2025-09-30 17:28:26'),(151,212,'Voz:\nhttps://drive.google.com/file/d/1NjI_j6jk14dpBOvib2Udjinc44tdnAbw/view?usp=sharing','user',13,NULL,9,'2025-09-30 17:29:53'),(152,213,'Roteiro:\nhttps://docs.google.com/document/d/1Mbg7HBvL-zMt5ZJKD_EZGByraX1J7cquUel5Af5psZw/edit?usp=sharing','user',13,NULL,9,'2025-10-02 01:14:12'),(153,213,'voz:https://drive.google.com/file/d/1ilzJTkpDJNtgp0WmRagDOtmSmaMV80oC/view?usp=sharing','user',13,NULL,9,'2025-10-02 01:43:02'),(154,214,'Voz:\nhttps://drive.google.com/file/d/1bk60mcD_9u4v8nYWAZPz6PoeqA09dAHh/view?usp=sharing','user',13,NULL,9,'2025-10-02 14:26:12'),(155,214,'Roteiro:\nhttps://docs.google.com/document/d/1Hy-X9I6_GXnOl3uZWkB3_kR7amiWSCesgh527ENKMU0/edit?usp=sharing','user',13,NULL,9,'2025-10-02 14:26:52'),(156,215,'Roteiro:\nhttps://docs.google.com/document/d/18g4Png_xZunVdu4oYp7B54UbGNIiIymLcWpL85xuXrs/edit?usp=sharing','user',13,NULL,9,'2025-10-06 14:18:52'),(157,215,'voz: https://drive.google.com/file/d/1Rjd_Y_Ge6XDRMpRksEcsk7GrXI82dnbI/view?usp=sharing','user',13,NULL,9,'2025-10-06 14:26:46'),(158,217,'Voz:\nhttps://drive.google.com/file/d/1fTQ30XYts4EZvrOJ_QiV-YHl3qQIz-Kx/view?usp=sharing','user',13,NULL,9,'2025-10-10 14:01:32'),(159,217,'roteiro:\nhttps://docs.google.com/document/d/1dO5oaHBoteZd_t-0GpNPuFrPAsFSzadG8IWntyhyliM/edit?usp=sharing','user',13,NULL,9,'2025-10-10 14:02:20'),(160,218,'Roteiro:\nhttps://docs.google.com/document/d/1lxzP_zZWdvaxzu1iLgJ6MhWp-sXnA6sqMza5caecP9M/edit?usp=sharing','user',13,NULL,9,'2025-10-13 15:05:44'),(161,218,'Voz:\nhttps://drive.google.com/file/d/1MLgO8jnW2qkNYMdxVKfx_bT2NB43L-xm/view?usp=sharing','user',13,NULL,9,'2025-10-13 15:07:55'),(162,219,'voz:\n\nhttps://docs.google.com/document/d/1KyHInCg708l88bcgPmWSRcrw2qJ4XLBekIIENUTStyg/edit?usp=sharing','user',13,NULL,9,'2025-10-13 16:32:12'),(163,219,'Roteiro:\nhttps://drive.google.com/file/d/1OvwXjeAlAdEaaADVsb9kfu6QHmeypDgw/view?usp=sharing','user',13,NULL,9,'2025-10-13 16:33:18'),(164,219,'Troquei os links da voz e do roteiro','user',13,NULL,9,'2025-10-13 16:33:28'),(165,219,'Opa, agora eu vi aqui os links 👍🏽','freelancer',NULL,34,9,'2025-10-15 07:54:17'),(166,220,'roteiro:   \nhttps://docs.google.com/document/d/1RJWISXbyCUms-DCVf-8KmAWXgXF4-EtwOMe4ICgaRwQ/edit?usp=sharing','user',13,NULL,9,'2025-10-15 22:37:50'),(167,220,'voz:\nhttps://drive.google.com/file/d/1wpHZ6SATVI4qbc_GhWXmLOze2D04qxzg/view?usp=sharing','user',13,NULL,9,'2025-10-15 22:39:02'),(168,221,'roteiro:\n\nhttps://docs.google.com/document/d/1sGJ0Y1OwVhB0ojnxkXt7L47Zd0WVhBPFsBZNH4_BsMg/edit?usp=sharing','user',13,NULL,9,'2025-10-18 20:04:24'),(169,221,'voz:\nhttps://drive.google.com/file/d/1Eh9oCcq3ZKwehens3L8e9ceZxe4LOw2l/view?usp=sharing','user',13,NULL,9,'2025-10-18 20:05:11'),(170,222,'Roteiro:\nhttps://docs.google.com/document/d/1jTtP0lIYPWPW0frPCECSRIoSr-ufyIg1ThKmJCRJxjI/edit?usp=sharing','user',13,NULL,9,'2025-10-20 14:26:38'),(171,222,'Voz:\nhttps://drive.google.com/file/d/1suPv0wM_ZeyvMs71NFFRQ0gXTPKegbjb/view?usp=sharing','user',13,NULL,9,'2025-10-20 14:27:27'),(172,222,'correcoão de audio e propaganda\nhttps://drive.google.com/file/d/1ESrCqWgJisi4JzCb4nuzQsHTwSk2dI-B/view?usp=sharing','user',13,NULL,9,'2025-10-20 14:31:26'),(173,223,'https://docs.google.com/document/d/1zV3WQglZgypff4eIDkFot-pULwBNmHFOHQHYRBLgSu0/edit?usp=sharing','user',13,NULL,9,'2025-10-29 23:18:16'),(174,223,'https://drive.google.com/file/d/1zZt1Gml9r82y7QjI6sMWxIKKj9kPOywM/view?usp=sharing','user',13,NULL,9,'2025-10-29 23:19:21'),(175,224,'Roteiro:\n\nhttps://docs.google.com/document/d/1ATpIjRitxgtY_m8Hq5Km_wgidVBJLYtv8BsOeHy__-g/edit?usp=sharing','user',13,NULL,9,'2025-10-30 03:07:51'),(176,224,'voz:\n\nhttps://drive.google.com/file/d/1uZjldM-wNVa-wmXXDH_HobDxGee_-Z_t/view?usp=sharing','user',13,NULL,9,'2025-10-30 03:08:31'),(177,230,'roteiro: \nhttps://docs.google.com/document/d/1CVc7AhbT-mxi2et8uEj2qJ3M39mun0CRegTbJkk-9aU/edit?usp=sharing','user',13,NULL,9,'2025-11-03 14:52:49'),(178,230,'voz:\nhttps://drive.google.com/file/d/1kJh6_nrTfP1IL3OaDx7bBXosFXk31Ack/view?usp=sharing','user',13,NULL,9,'2025-11-03 14:54:02'),(179,231,'voz:\nhttps://drive.google.com/file/d/1Sc1GaIBVj0Ffte7TbsXJU8HUqHTkmfYt/view?usp=sharing','user',13,NULL,9,'2025-11-05 12:47:12'),(180,231,'roteiro:\nhttps://docs.google.com/document/d/1qxlCxFaBf0OYRb2iwvIGfnPpv0m81aDJC2mGRLYj6P8/edit?usp=sharing','user',13,NULL,9,'2025-11-05 12:47:43'),(181,232,'Roteiro:\nhttps://docs.google.com/document/d/1Sc4rjzQQmrE7WU8UUnsjjbVxnFLKN7sSDzjoikYNowI/edit?usp=sharing','user',13,NULL,9,'2025-11-07 13:37:08'),(182,232,'voz:\nhttps://drive.google.com/file/d/1VVLcvYuusBqnSGRAbOyjpa4xQAYse52b/view?usp=sharing','user',13,NULL,9,'2025-11-07 13:37:54'),(183,233,'voz:\nhttps://drive.google.com/file/d/19ovqXgYAETe_6dPWe4gbFGyzlA8hXP32/view?usp=sharing','user',13,NULL,9,'2025-11-11 14:38:46'),(184,233,'texto:\nhttps://docs.google.com/document/d/1Zug_jNcokr30fy5V9VO3lb__LrErxJc0JU2EseQ4s78/edit?usp=sharing','user',13,NULL,9,'2025-11-11 14:47:47'),(185,234,'Voz: https://drive.google.com/file/d/1yMA8eLJdBKxbV6sNylVFCG1p0uyDpsVN/view?usp=sharing','user',13,NULL,9,'2025-11-15 15:42:37'),(186,234,'roteiro:\nhttps://docs.google.com/document/d/1mCfgvq2JLw1cfsRczgbmIlCcMUra8BSG-xw_Ta-reiQ/edit?usp=sharing','user',13,NULL,9,'2025-11-15 15:43:06'),(187,234,'Eu gostaria que você colocasse bastante música nesse vídeo — pode repetir faixas, porque essa banda tem muitos sucessos no Brasil.\n\nTambém preciso que você remova a parte em que é mencionado “cabelos Black Power”.\n\nHá um momento em que o narrador fala “Éua” ao invés de “Estados Unidos”; por favor, corte essa parte também.\n\nSe você encontrar qualquer outra palavra ou pronúncia errada ao longo do vídeo, pode corrigir ou me avisar.\n\nObrigado!','user',13,NULL,9,'2025-11-15 15:49:37'),(188,234,'Obs: nesse último vídeo a única parte estranha na narração está em  4:30-4:32','freelancer',NULL,34,9,'2025-11-16 21:22:57'),(189,237,'TExto: https://docs.google.com/document/d/1mtvOt1IQpD7eSZ976IuKdac9pk7ZpffBjcWiiDcRcyY/edit?usp=sharing','user',13,NULL,9,'2025-11-25 14:58:18'),(190,237,'voz:\n\nhttps://drive.google.com/file/d/1i7BSIriVTW1nZxFrOTwlxvo9LkRqtVyI/view?usp=sharing','user',13,NULL,9,'2025-11-25 14:59:30'),(191,237,'Editor, pode cortar a parte que diz a frase: [INTRODUÇÃO - Contexto Emocional]\nessa frase foi errada no audio.','user',13,NULL,9,'2025-11-25 15:00:28'),(192,238,'Roteiro:\nhttps://docs.google.com/document/d/1XKO-Pp1g6ieht1bwX56iFHcnk7EwmlnRvoSdorVQaQg/edit?usp=sharing','user',13,NULL,9,'2025-11-26 13:53:25'),(193,238,'voz:\nhttps://drive.google.com/file/d/1XVUD0rodej-dZ9jbjlhENguZPDNijdcZ/view?usp=sharing','user',13,NULL,9,'2025-11-26 13:54:09'),(194,240,'Voz:\nhttps://drive.google.com/file/d/17cHZ7uI5APp3PQdCUUqbUBqCrA3QKakU/view?usp=sharing','user',13,NULL,9,'2025-12-12 14:14:35'),(195,240,'Chamadas: nesse audio tem 3 chamadas pra recortar e distribuir ao longo do video:\n\nhttps://drive.google.com/file/d/15xXgV0XwYZVTQcGoziuU7wLQGv_fjrcE/view?usp=sharing','user',13,NULL,9,'2025-12-12 14:15:28'),(196,240,'roteiro:\nhttps://docs.google.com/document/d/1tAgzO4JMJKG6Sdgbuur1P0S2ZS6KGP1T/edit?usp=sharing&ouid=116027736235794657003&rtpof=true&sd=true','user',13,NULL,9,'2025-12-12 14:16:28'),(197,241,'Roteiro:','user',13,NULL,9,'2025-12-16 13:58:22'),(198,241,'https://docs.google.com/document/d/1QQ6xxJvtvvDL3-ZsK7-C2Q8PyZDMmCEnRrh0gs8-vig/edit?usp=sharing','user',13,NULL,9,'2025-12-16 13:58:39'),(199,241,'Voz:\nhttps://drive.google.com/file/d/15RLuFECQxDdrYSio-dVKku5WXv3rifA5/view?usp=sharing','user',13,NULL,9,'2025-12-16 13:59:21'),(200,241,'Tem uma parte do video que diz: se voce tem bom gosto.\n\nMas o audio está ruim.\n\nAqui a correcao:\nhttps://drive.google.com/file/d/1rpLbiDTgHl9PxnjOpa-p3jpb82CU6Owg/view?usp=sharing','user',13,NULL,9,'2025-12-16 14:00:02'),(201,242,'Roteiro:\nhttps://docs.google.com/document/d/1SzvQPyM0BG3RSKU3Pw7WLnyonMNcJyOvSzVbiNCjmLk/edit?usp=sharing','user',13,NULL,9,'2025-12-17 14:31:39'),(202,242,'Voz:\nhttps://drive.google.com/file/d/1H1GsoHcWsmiV77QAUPev_fyJMKprHxZS/view?usp=sharing','user',13,NULL,9,'2025-12-17 14:33:01'),(203,243,'Roteiro:\nhttps://docs.google.com/document/d/1jh5TUG1ksejYvLTWNlopUneXwrxb9IsHLRNIqIzhhTo/edit?usp=sharing','user',13,NULL,9,'2025-12-22 13:33:13'),(204,243,'Audio:\nhttps://drive.google.com/file/d/15RA2KN27KJ0Va4Fh5EiQFvt2D0WqCnZM/view?usp=sharing','user',13,NULL,9,'2025-12-22 13:59:20'),(205,243,'No primeiro momento que diz Steven Seagal, diz errado mas logo em seguida diz certo, se possivel fazer uma colagem no audio.','user',13,NULL,9,'2025-12-22 13:59:51'),(206,244,'Roteiro','user',13,NULL,9,'2025-12-23 19:06:09'),(207,244,'https://docs.google.com/document/d/17p9d-D-1wrODEYbOfAtqw8mmGb8cmQHbcYT5ipn6HeQ/edit?usp=sharing','user',13,NULL,9,'2025-12-23 19:06:13'),(208,244,'Voz: https://drive.google.com/file/d/1adh12T7G4NkkBv4mUpjr_JLqT7t1VJTd/view?usp=drive_link','freelancer',NULL,43,9,'2025-12-23 20:36:40'),(209,245,'roteiro:\n\nhttps://docs.google.com/document/d/1d9qy5ZhZF0ao56ZNeY2JP87Z5K_ypRsVH5f6lGJgeG8/edit?usp=sharing','user',13,NULL,9,'2025-12-24 15:29:35'),(210,245,'VOZ:https://drive.google.com/file/d/1g5X7ed4WLOdXLukZXVkb8RUUyPwHuHQx/view?usp=drive_link','freelancer',NULL,43,9,'2025-12-24 16:28:00'),(211,246,'roteiro:\nhttps://docs.google.com/document/d/1CNN_E4P8iHV0ITwTlvu38rmMdrwElZpTqawZlwRZZno/edit?usp=sharing','user',13,NULL,9,'2025-12-24 16:53:03'),(212,246,'VOZ: https://drive.google.com/file/d/11NikrL8-VmiQhFUlbdbEy3IAlqy71nwZ/view?usp=sharing','freelancer',NULL,43,9,'2025-12-27 13:10:30'),(213,247,'Roteiro:\n\nhttps://docs.google.com/document/d/1hI8lmDKYSkY291ZONZPhN0O_Goq0cn6wmyMX6yhQhsE/edit?usp=sharing','user',13,NULL,9,'2025-12-27 13:29:31'),(214,247,'VOZ:https://drive.google.com/file/d/1KPBBw3vkzsap2-jmXV7oeciLbIKeJtb5/view?usp=sharing','freelancer',NULL,43,9,'2025-12-27 15:04:46'),(215,248,'roteiro: https://docs.google.com/document/d/1jEOBhzjiGqS7Pocb9vmwVnKeYKEmPHHn-Ihz7r6ZCUk/edit?usp=sharing','user',13,NULL,9,'2025-12-27 15:10:20'),(216,248,'VOZ:\nhttps://drive.google.com/file/d/1Bw9gYmLGRtnOe36yLu0CxaCJFl_EWrXx/view?usp=sharing','freelancer',NULL,43,9,'2025-12-27 16:02:10'),(217,250,'https://docs.google.com/document/d/1cWIW1nUUaUqObjRiey70pEyv5hgO-9x9W3BY_-7oGRg/edit?usp=sharing','user',13,NULL,9,'2025-12-31 14:36:00'),(218,251,'https://docs.google.com/document/d/15MLWzOnhOpobH_entKRwXcizFXYTMd4MeAhFGgpogVk/edit?usp=sharing','user',13,NULL,9,'2025-12-31 14:56:36'),(219,252,'https://docs.google.com/document/d/1YP9_wXPB9IwNQoG_wK4SecPv38F6gAJl8WcXpM-xw_8/edit?usp=sharing\n\nroteiro','user',13,NULL,9,'2025-12-31 15:06:32'),(220,250,'\nVOZ:\nhttps://drive.google.com/file/d/1q74_pQay_vSI6eFd-FWJYfIsRvm-wMN4/view?usp=sharing','freelancer',NULL,43,9,'2025-12-31 19:46:00'),(221,251,'VOZ:','freelancer',NULL,43,9,'2025-12-31 20:17:28'),(222,251,'https://drive.google.com/file/d/1I2s3JcVPkxmscFDHXCbZuV-jnVsRgvO1/view?usp=drive_link','freelancer',NULL,43,9,'2025-12-31 20:17:46'),(223,252,'VOZ:\nhttps://drive.google.com/file/d/13wthj8L7g6YqcBGxAQvvUptFxB4i5IG1/view?usp=sharing','freelancer',NULL,43,9,'2025-12-31 20:55:51'),(224,253,'roteiro:\n\nhttps://docs.google.com/document/d/10MxPEsc3beY-kA0AVMIudQ2j3dLUly8LbnJXeLkIg7A/edit?usp=sharing','user',13,NULL,9,'2026-01-05 14:31:03'),(225,253,'VOZ:\nhttps://drive.google.com/file/d/1Yqbwe9NZFuf-9dXf8hMxW-087zLiet2L/view?usp=drive_link','freelancer',NULL,43,9,'2026-01-05 15:47:10'),(226,254,'Roteiro:\nhttps://docs.google.com/document/d/1A-PDCoKPZT2OZS4G9paT6owmhMTFJKpY_XbqlQc1Ozc/edit?usp=sharing','user',13,NULL,9,'2026-01-05 16:22:50'),(227,254,'VOZ:\nhttps://drive.google.com/file/d/1yNEcY0D88jL8iPHBLuqA83CkhTdPAG3O/view?usp=drive_link','freelancer',NULL,43,9,'2026-01-05 21:09:46'),(228,258,'Roteiro:\nhttps://docs.google.com/document/d/1lyptA0mVFAq4I6IFdYGRTDku1FeEpf9MkEiF0h8TSRM/edit?usp=sharing','user',13,NULL,9,'2026-01-14 13:28:45'),(229,259,'roteiro:\nhttps://docs.google.com/document/d/1VvkQ_kImcXBq6zSfIdG-OReyekhbF_nsyu6gf1xycT0/edit?usp=sharing','user',13,NULL,9,'2026-01-14 14:08:21'),(230,260,'roteiro:\nhttps://docs.google.com/document/d/1AZhZGpOOQoEphmUAFGfdI3x6zErCg_271yhEn0FX_LM/edit?usp=sharing','user',13,NULL,9,'2026-01-14 22:38:30'),(231,261,'Roteiro: https://docs.google.com/document/d/1-jBaZllyQgrKWSf-BUppOtBcL6V5e7PaFMubth07GiQ/edit?usp=sharing','user',13,NULL,9,'2026-01-14 22:49:44'),(232,258,'VOZ:\nhttps://drive.google.com/file/d/1YuQUc0W9FgcJk-LKh4jcQWY9GBTAieOg/view?usp=sharing','freelancer',NULL,43,9,'2026-01-14 23:14:03'),(233,259,'VOZ:\nhttps://drive.google.com/file/d/1plqgc8lrjz7cLuCxpBtlZyWZGew545ay/view?usp=drive_link','freelancer',NULL,43,9,'2026-01-15 01:19:04'),(234,260,'VOZ:','freelancer',NULL,43,9,'2026-01-15 01:50:10'),(235,260,'https://drive.google.com/file/d/1ti9G-PlNlMrPoILqc32tPm8Oih-bAjR7/view?usp=sharing','freelancer',NULL,43,9,'2026-01-15 01:50:14'),(236,261,'VOZ:\nhttps://drive.google.com/file/d/1s1K_42xksFmzjY5cHHT3uzzbNWBGKFYZ/view?usp=sharing','freelancer',NULL,43,9,'2026-01-15 02:16:18'),(237,262,'roteiro:\nhttps://docs.google.com/document/d/17v9w5eZDjyOeYKbWrLuBNBcZNERpmtrCwqHkWVE_Hc0/edit?usp=sharing','user',13,NULL,9,'2026-01-16 13:36:53'),(238,262,'VOZ:\nhttps://drive.google.com/file/d/1w06VX49KmBIDqR1N1rW1n5cH5AgFbxA4/view?usp=drive_link','freelancer',NULL,43,9,'2026-01-17 23:34:52'),(239,263,'Roteiro:\nhttps://docs.google.com/document/d/1jwwKvLbo_kkzepNZXRCEYv0kLHPeb7aa-dI2mSzTkww/edit?usp=sharing','user',13,NULL,9,'2026-01-19 13:21:24'),(240,263,'Narrador, muitas vezes aparece o nome DMX, Se lê Di é mex','user',13,NULL,9,'2026-01-19 13:21:49'),(241,264,'Roteiro:\nhttps://docs.google.com/document/d/17rVUCewlEGvukyPIskrsTIq2Eg8TSOsXpCq-WsE6jxE/edit?usp=sharing','user',13,NULL,9,'2026-01-19 13:41:44'),(242,263,'VOZ:https://drive.google.com/file/d/1E394MEkE6gvosH67-K6wOCF1E_peVrty/view?usp=sharing','freelancer',NULL,43,9,'2026-01-20 02:08:58'),(243,264,'VOZ:','freelancer',NULL,43,9,'2026-01-20 02:41:49'),(244,264,'https://drive.google.com/file/d/1j2lvLZrjO946ppjCyw9JJOc25VOJ4BnW/view?usp=drive_link','freelancer',NULL,43,9,'2026-01-20 02:41:53'),(245,265,'roteiro:  https://docs.google.com/document/d/1oDaXk0yluZs_ibbyBeh1eo08mesDQ_U_ygZG6CtwYGk/edit?usp=sharing','user',13,NULL,9,'2026-01-28 13:35:46'),(246,265,'Observações :\nEditor 4:53 erro no áudio palavra \"TOCAR\" \n\nOnde aparecer \"CBGB\" trocar pela pronuncia desse áudio:\nhttps://drive.google.com/file/d/1CMNqoA03vkxzN7ZiiQx_Sb-fE_6BnEtr/view?usp=drive_link\n\n\nVOZ:\nhttps://drive.google.com/file/d/17z1rPHd1l756op06Tz64U2UaeEWzo9r_/view?usp=drive_link','freelancer',NULL,43,9,'2026-01-28 23:09:45'),(247,266,'Roteiro:\nhttps://docs.google.com/document/d/1X-6hhUhKyu4-ZgooJgL2TNQX8nyVwiqWR794TUKYKOA/edit?usp=sharing','user',13,NULL,9,'2026-01-29 13:27:37'),(248,267,'Roteiro:\nhttps://docs.google.com/document/d/1rLg0JigRwh8u3oOks4Mq3z_9Re3euJJ9xqkRLws3bic/edit?usp=sharing','user',13,NULL,9,'2026-01-29 18:08:26'),(249,266,'VOZ:https://drive.google.com/file/d/1JhkqeDxifGDWN-XhGSwatRbPs4_f0as0/view?usp=sharing','freelancer',NULL,43,9,'2026-01-29 22:10:06'),(250,267,'VOZ:https://drive.google.com/file/d/1zFHd9MIBkpKC6KTvN5-eyHy0OwDWtUo0/view?usp=sharing','freelancer',NULL,43,9,'2026-01-29 22:24:16');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `subdomain` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `subscription_start` timestamp NULL DEFAULT NULL,
  `subscription_end` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (2,'Empresa Teste','',1,'2025-07-22 18:45:54','2026-08-22 18:45:54','2025-07-28 23:35:41'),(9,'VROX','vrox',1,'2025-09-11 13:34:54','2030-08-09 00:00:00','2025-09-11 13:34:54');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `footer_settings`
--

DROP TABLE IF EXISTS `footer_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `footer_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `footer_settings_chk_1` CHECK (json_valid(`config`))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `footer_settings`
--

LOCK TABLES `footer_settings` WRITE;
/*!40000 ALTER TABLE `footer_settings` DISABLE KEYS */;
INSERT INTO `footer_settings` VALUES (1,'{\"enabled\":true,\"padding\":\"sm\",\"borderTop\":true,\"columns\":[{\"id\":\"1\",\"title\":\"Empresa\",\"width\":\"md\",\"order\":1,\"elements\":[{\"id\":\"1-1\",\"type\":\"text\",\"title\":\"\",\"content\":\"Nossa empresa é líder em soluções inovadoras para criação de conteúdo digital. teste teste\",\"style\":{\"alignment\":\"left\",\"textColor\":\"#d1d5db\",\"fontSize\":\"sm\",\"fontWeight\":\"normal\",\"spacing\":\"normal\"},\"order\":1,\"columnId\":\"1\"}]},{\"id\":\"2\",\"title\":\"Links Rápidos\",\"width\":\"md\",\"order\":2,\"elements\":[{\"id\":\"2-1\",\"type\":\"links\",\"content\":[{\"text\":\"Início\",\"url\":\"/\"},{\"text\":\"Sobre\",\"url\":\"/about\"},{\"text\":\"Serviços\",\"url\":\"/services\"},{\"text\":\"Contato\",\"url\":\"/contact\"}],\"style\":{\"alignment\":\"left\",\"textColor\":\"#d1d5db\",\"fontSize\":\"sm\",\"fontWeight\":\"normal\",\"spacing\":\"normal\"},\"order\":1,\"columnId\":\"2\"}]},{\"id\":\"3\",\"title\":\"Contato\",\"width\":\"md\",\"order\":3,\"elements\":[{\"id\":\"3-1\",\"type\":\"contact\",\"content\":{\"email\":\"contato@empresa.com\",\"phone\":\"+55 11 99999-9999\",\"address\":\"São Paulo, SP\"},\"style\":{\"alignment\":\"left\",\"textColor\":\"#d1d5db\",\"fontSize\":\"sm\",\"fontWeight\":\"normal\",\"spacing\":\"normal\"},\"order\":1,\"columnId\":\"3\"}]}],\"copyright\":{\"enabled\":true,\"text\":\"© 2024 Sua Empresa. Todos os direitos reservados.\",\"alignment\":\"center\"},\"socialLinks\":{\"enabled\":true,\"links\":[{\"platform\":\"Facebook\",\"url\":\"https://facebook.com\",\"icon\":\"Facebook\"},{\"platform\":\"Twitter\",\"url\":\"https://twitter.com\",\"icon\":\"Twitter\"},{\"platform\":\"Instagram\",\"url\":\"https://instagram.com\",\"icon\":\"Instagram\"},{\"platform\":\"YouTube\",\"url\":\"https://youtube.com\",\"icon\":\"Youtube\"}]}}','2025-08-05 17:21:21','2025-08-11 17:21:22');
/*!40000 ALTER TABLE `footer_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `freelancer_roles`
--

DROP TABLE IF EXISTS `freelancer_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `freelancer_roles` (
  `freelancer_id` int NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`freelancer_id`,`role`),
  CONSTRAINT `fk_freelancer_roles_freelancer` FOREIGN KEY (`freelancer_id`) REFERENCES `freelancers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `freelancer_roles`
--

LOCK TABLES `freelancer_roles` WRITE;
/*!40000 ALTER TABLE `freelancer_roles` DISABLE KEYS */;
INSERT INTO `freelancer_roles` VALUES (12,'editor'),(12,'narrador'),(12,'roteirista'),(12,'thumb_maker'),(31,'editor'),(32,'editor'),(32,'narrador'),(32,'roteirista'),(32,'thumb_maker'),(34,'editor'),(36,'editor'),(36,'narrador'),(36,'roteirista'),(36,'thumb_maker'),(43,'narrador'),(43,'roteirista'),(44,'roteirista'),(47,'editor');
/*!40000 ALTER TABLE `freelancer_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `freelancers`
--

DROP TABLE IF EXISTS `freelancers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `freelancers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `freelancers_ibfk_1` (`company_id`),
  CONSTRAINT `freelancers_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `freelancers`
--

LOCK TABLES `freelancers` WRITE;
/*!40000 ALTER TABLE `freelancers` DISABLE KEYS */;
INSERT INTO `freelancers` VALUES (12,2,'Vinicius Almeida','vnc.dealmeida@gmail.com','roteirista','(31) 98646-1665','$2b$10$c4Sg4EK3d.1gqNVMRLJ1vOkNk5hPPighDmj0qy2W1SdaGheH.5HqW','2025-09-05 14:40:02','2025-09-30 16:29:43'),(31,9,'Kelvyn','kelvynhenrique.eu@gmail.com','editor','(87) 99150-6998','$2b$12$eIex.leNJZwJVtUY70JFB.mk1uHy6xehJ4Ftpg4SsDt60DcNgcR5O','2025-09-30 16:33:43','2025-10-07 02:26:55'),(32,9,'Vinicius','vnc.dealmeida+tubeflow@gmail.com','roteirista','(31) 98646-1665','$2b$10$.kz9rBJb7vAIPUsDFlEdD.4EitS/lVEaaWvMvVAwEAPCVbTYTltEK','2025-09-30 17:17:49','2025-10-07 02:29:10'),(34,9,'Salomão','salomaoddt@gmail.com','editor','(11) 97098-2458','$2b$10$U1N1LuzOJ9s3sT2e1PQDyOE1hGbLMaqXRwgJGXgTSEw/pfxguh8OO','2025-10-02 14:35:37','2025-10-13 15:43:49'),(36,9,'Lericia','leticiaalmeoda.@gmail.com','roteirista','(31) 98020-6014','$2b$12$ZFkfMIfwIrlDwZvFsvYxV.KNro7Z7avtzaPW2TBxCPB56VcfB/0wu','2025-10-09 14:52:34','2025-10-09 14:52:34'),(43,9,'Deisiane','deisianearaujo370@gmail.com','narrador','31972356011','$2b$12$3Cs/uyy8aeNN/gwluUu.xexGq9b4YlUhqHFidonXXsKCE62eI1AVm','2025-12-23 17:23:57','2025-12-23 17:23:57'),(44,9,'Vinicius Teste','vnc.dealmeida+roteirista@gmail.com','roteirista','31986461665','$2b$12$Q.1BrulgwDV2wvjOKUpOZ.P1rbUdv8fwcOlyYWVCauSlkbfRyUFQK','2026-01-12 13:42:57','2026-01-12 13:42:57'),(47,2,'Henrique Caseiro','caseiro.henrique@gmail.com','editor','19987272715','$2b$12$lCmUKK8zExLyp1B8jrFlRuXbXt.fY5YHxO.lJHjCezntp7CMMn04m','2026-01-12 23:43:58','2026-01-12 23:43:58');
/*!40000 ALTER TABLE `freelancers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_cpf` varchar(14) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mercadopago_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `external_reference` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `plan_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `subscription_updated` tinyint(1) NOT NULL DEFAULT '0',
  `attempts` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,'caseiro.henrique@gmail.com','39618038890','119032503239',0.01,'pending','pix','9d67b4c2-d3e9-4123-9aa0-79ab03b98a08','monthly',NULL,0,0,'2025-07-22 21:54:16','2025-07-22 21:54:16');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_months` int NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,'monthly',0.01,1,'Plano mensal','2025-07-22 21:01:14'),(2,'quarterly',233.00,3,'Plano trimestral','2025-07-22 20:45:39'),(3,'annual',333.00,12,'Plano anual','2025-07-22 20:45:39');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `api_key` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sender_phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message_template` text COLLATE utf8mb4_general_ci,
  `auto_notify` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status_change_template` text COLLATE utf8mb4_general_ci,
  `welcome_template` text COLLATE utf8mb4_general_ci,
  `whatsapp_api_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,2,'83a00584-2820-4655-81fc-d57de9439a3c','5519986119067','Olá, {name}!\\n\\nUm novo vídeo foi atribuído a você para análise e execução:\\n\\n📝 Título do Vídeo: {titulo}\\n\\nAcesse o sistema para mais detalhes:\\n🌐 https://cms.vroxmidias.com/videos\\n\\nAtenciosamente,\\nRodolfo',1,'2026-01-12 23:43:39',NULL,NULL,''),(6,9,'e473785d-0053-4b7e-ac5f-9774191feb3d','5531995884181','Olá, *{name}*\\n\\nUm novo vídeo foi atribuído a você para análise e execução:\\n\\n📝 Título do Vídeo: *{titulo}*\\n\\nAcesse o sistema para mais detalhes:\\n🌐 https://tubeflow10x.com/videos\\n\\nAo enviar o arquivo, lembre-se da seguinte estrutura:\\n\\n*Titulo do Vídeos - Nome do Canal*',1,'2025-12-24 15:32:09',NULL,NULL,NULL);
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `cpf` varchar(14) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `users_ibfk_1` (`company_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,2,'admin','admin@gmail.com','$2b$10$q1btf7nEiemxZSL8AZyQOOisRO7eCyhduvbJA4mEZMG6cfAuC0Jy2','admin','','2025-07-28 23:35:41','2025-07-28 23:35:41'),(5,2,'testesteste','teste3@gmail.com','$2b$12$ROZlhYRuY1WiHC4U/baX0OnZBXXPvKgJHOPogzd0j7.F9bcT0wzza','admin','','2025-08-04 21:49:37','2025-08-04 21:49:37'),(6,2,'teste5','teste2@gmail.com','$2b$12$L5Ec2zpOADNhpshuLqJLqu5w.kNHkMfL5WNeB5IHdem363os7bc0u','admin','','2025-08-04 21:50:23','2025-08-04 21:50:23'),(13,9,'Vinicius','vnc.dealmeida@gmail.com','$2b$10$c4Sg4EK3d.1gqNVMRLJ1vOkNk5hPPighDmj0qy2W1SdaGheH.5HqW','admin','','2025-09-11 13:35:16','2025-09-30 16:29:43');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_freelancer_roles`
--

DROP TABLE IF EXISTS `video_freelancer_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_freelancer_roles` (
  `video_id` int NOT NULL,
  `freelancer_id` int NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`video_id`,`freelancer_id`,`role`),
  KEY `fk_vfr_freelancer` (`freelancer_id`),
  CONSTRAINT `fk_vfr_freelancer` FOREIGN KEY (`freelancer_id`) REFERENCES `freelancers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vfr_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_freelancer_roles`
--

LOCK TABLES `video_freelancer_roles` WRITE;
/*!40000 ALTER TABLE `video_freelancer_roles` DISABLE KEYS */;
INSERT INTO `video_freelancer_roles` VALUES (4,12,'editor'),(4,12,'narrador'),(4,12,'thumb_maker'),(257,12,'narrador'),(257,12,'roteirista'),(257,12,'thumb_maker'),(212,31,'editor'),(213,31,'editor'),(215,31,'editor'),(217,31,'editor'),(220,31,'editor'),(221,31,'editor'),(230,31,'editor'),(231,31,'editor'),(233,31,'editor'),(212,32,'narrador'),(212,32,'roteirista'),(212,32,'thumb_maker'),(213,32,'narrador'),(213,32,'roteirista'),(213,32,'thumb_maker'),(214,32,'narrador'),(214,32,'roteirista'),(214,32,'thumb_maker'),(215,32,'narrador'),(215,32,'roteirista'),(215,32,'thumb_maker'),(217,32,'narrador'),(217,32,'roteirista'),(217,32,'thumb_maker'),(218,32,'narrador'),(218,32,'roteirista'),(218,32,'thumb_maker'),(219,32,'narrador'),(219,32,'roteirista'),(219,32,'thumb_maker'),(220,32,'narrador'),(220,32,'roteirista'),(220,32,'thumb_maker'),(221,32,'narrador'),(221,32,'roteirista'),(221,32,'thumb_maker'),(222,32,'narrador'),(222,32,'roteirista'),(222,32,'thumb_maker'),(223,32,'narrador'),(223,32,'roteirista'),(223,32,'thumb_maker'),(224,32,'narrador'),(224,32,'roteirista'),(224,32,'thumb_maker'),(230,32,'narrador'),(230,32,'roteirista'),(230,32,'thumb_maker'),(231,32,'narrador'),(231,32,'roteirista'),(231,32,'thumb_maker'),(232,32,'narrador'),(232,32,'roteirista'),(232,32,'thumb_maker'),(233,32,'narrador'),(233,32,'roteirista'),(233,32,'thumb_maker'),(234,32,'narrador'),(234,32,'roteirista'),(234,32,'thumb_maker'),(237,32,'narrador'),(237,32,'roteirista'),(237,32,'thumb_maker'),(238,32,'narrador'),(238,32,'roteirista'),(238,32,'thumb_maker'),(239,32,'narrador'),(239,32,'roteirista'),(239,32,'thumb_maker'),(240,32,'narrador'),(240,32,'roteirista'),(240,32,'thumb_maker'),(241,32,'narrador'),(241,32,'roteirista'),(241,32,'thumb_maker'),(242,32,'narrador'),(242,32,'roteirista'),(242,32,'thumb_maker'),(243,32,'narrador'),(243,32,'roteirista'),(243,32,'thumb_maker'),(244,32,'narrador'),(244,32,'thumb_maker'),(245,32,'roteirista'),(245,32,'thumb_maker'),(246,32,'roteirista'),(246,32,'thumb_maker'),(247,32,'roteirista'),(247,32,'thumb_maker'),(248,32,'roteirista'),(248,32,'thumb_maker'),(250,32,'roteirista'),(250,32,'thumb_maker'),(251,32,'roteirista'),(251,32,'thumb_maker'),(252,32,'roteirista'),(252,32,'thumb_maker'),(253,32,'roteirista'),(253,32,'thumb_maker'),(254,32,'roteirista'),(254,32,'thumb_maker'),(258,32,'roteirista'),(258,32,'thumb_maker'),(259,32,'roteirista'),(259,32,'thumb_maker'),(260,32,'roteirista'),(260,32,'thumb_maker'),(261,32,'roteirista'),(261,32,'thumb_maker'),(262,32,'roteirista'),(262,32,'thumb_maker'),(263,32,'roteirista'),(263,32,'thumb_maker'),(264,32,'roteirista'),(264,32,'thumb_maker'),(265,32,'roteirista'),(265,32,'thumb_maker'),(266,32,'roteirista'),(266,32,'thumb_maker'),(267,32,'roteirista'),(267,32,'thumb_maker'),(268,32,'roteirista'),(268,32,'thumb_maker'),(214,34,'editor'),(218,34,'editor'),(219,34,'editor'),(222,34,'editor'),(223,34,'editor'),(224,34,'editor'),(232,34,'editor'),(234,34,'editor'),(237,34,'editor'),(238,34,'editor'),(239,34,'editor'),(240,34,'editor'),(241,34,'editor'),(242,34,'editor'),(243,34,'editor'),(244,34,'editor'),(245,34,'editor'),(246,34,'editor'),(247,34,'editor'),(248,34,'editor'),(250,34,'editor'),(251,34,'editor'),(252,34,'editor'),(253,34,'editor'),(254,34,'editor'),(258,34,'editor'),(259,34,'editor'),(260,34,'editor'),(261,34,'editor'),(262,34,'editor'),(263,34,'editor'),(264,34,'editor'),(265,34,'editor'),(266,34,'editor'),(267,34,'editor'),(268,34,'editor'),(244,43,'roteirista'),(245,43,'narrador'),(246,43,'narrador'),(247,43,'narrador'),(248,43,'narrador'),(250,43,'narrador'),(251,43,'narrador'),(252,43,'narrador'),(253,43,'narrador'),(254,43,'narrador'),(258,43,'narrador'),(259,43,'narrador'),(260,43,'narrador'),(261,43,'narrador'),(262,43,'narrador'),(263,43,'narrador'),(264,43,'narrador'),(265,43,'narrador'),(266,43,'narrador'),(267,43,'narrador'),(268,43,'narrador'),(257,47,'editor');
/*!40000 ALTER TABLE `video_freelancer_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_logs`
--

DROP TABLE IF EXISTS `video_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `video_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `freelancer_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `from_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `to_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` int DEFAULT NULL,
  `is_user` tinyint(1) NOT NULL DEFAULT '0',
  `company_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `freelancer_id` (`freelancer_id`),
  KEY `company_id` (`company_id`),
  KEY `video_logs_ibfk_1` (`video_id`),
  CONSTRAINT `video_logs_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `video_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `video_logs_ibfk_3` FOREIGN KEY (`freelancer_id`) REFERENCES `freelancers` (`id`),
  CONSTRAINT `video_logs_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2466 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_logs`
--

LOCK TABLES `video_logs` WRITE;
/*!40000 ALTER TABLE `video_logs` DISABLE KEYS */;
INSERT INTO `video_logs` VALUES (17,3,2,NULL,'Alteração de Status','Pendente','Publicado','2025-08-05 20:35:18',0,1,2),(18,3,2,NULL,'Alteração de Status','Publicado','Cancelado','2025-08-05 20:35:23',0,1,2),(19,3,2,NULL,'Alteração de Status','Cancelado','Pendente','2025-08-05 20:35:26',0,1,2),(20,3,2,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-08-05 20:37:09',0,1,2),(21,3,2,NULL,'Alteração de Status','Roteiro_Solicitado','Roteiro_Concluído','2025-08-05 20:38:11',0,0,2),(22,3,2,NULL,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2025-08-05 20:55:20',0,0,2),(23,3,2,NULL,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2025-08-05 20:55:22',0,0,2),(24,3,2,NULL,'Alteração de Status','Thumbnail_Solicitada','Thumbnail_Concluída','2025-08-05 20:55:23',0,0,2),(25,4,2,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-08-07 04:06:35',0,1,2),(26,4,2,NULL,'Alteração de Status','Roteiro_Solicitado','Roteiro_Concluído','2025-08-07 04:06:38',0,1,2),(27,4,2,NULL,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2025-08-07 04:06:43',0,1,2),(28,4,2,NULL,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2025-08-07 04:06:47',0,1,2),(29,4,2,NULL,'Alteração de Status','Thumbnail_Solicitada','Thumbnail_Concluída','2025-08-07 04:06:50',0,1,2),(30,5,2,NULL,'Alteração de Status','Pendente','Thumbnail_Concluída','2025-08-13 15:22:08',0,1,2),(2132,212,13,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-09-30 17:19:38',0,1,9),(2133,212,13,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2025-09-30 17:20:38',0,1,9),(2134,212,13,NULL,'Alteração de Status','Narração_Solicitada','Edição_Solicitada','2025-09-30 17:21:59',0,1,9),(2135,212,13,NULL,'Alteração de Status','Edição_Solicitada','Roteiro_Solicitado','2025-09-30 17:23:07',0,1,9),(2136,212,13,NULL,'Alteração de Status','Roteiro_Solicitado','Roteiro_Em_Andamento','2025-09-30 17:23:49',0,1,9),(2137,212,13,NULL,'Alteração de Status','Roteiro_Em_Andamento','Roteiro_Solicitado','2025-09-30 17:23:54',0,1,9),(2138,212,13,NULL,'Alteração de Status','Roteiro_Solicitado','Roteiro_Em_Andamento','2025-09-30 17:24:40',0,1,9),(2139,212,13,NULL,'Alteração de Status','Roteiro_Em_Andamento','Edição_Solicitada','2025-09-30 17:25:32',0,1,9),(2140,212,13,31,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-09-30 17:30:11',0,0,9),(2141,212,13,31,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-10-02 00:23:10',111179,0,9),(2142,213,13,NULL,'Alteração de Status','Pendente','Narração_Concluída','2025-10-02 01:44:07',0,1,9),(2143,213,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 01:44:35',0,1,9),(2144,213,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 01:46:10',0,1,9),(2145,213,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 01:46:35',0,1,9),(2146,213,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 01:46:57',0,1,9),(2147,213,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 01:48:03',0,1,9),(2148,213,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 01:48:15',0,1,9),(2149,213,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 01:49:13',0,1,9),(2150,213,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 01:49:23',0,1,9),(2151,213,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 01:49:36',0,1,9),(2152,213,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 01:50:15',0,1,9),(2153,213,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 01:50:50',0,1,9),(2154,213,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 01:50:57',0,1,9),(2155,213,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 01:52:06',0,1,9),(2156,213,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 01:52:12',0,1,9),(2157,213,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 01:53:22',0,1,9),(2158,213,13,NULL,'Alteração de Status','Edição_Solicitada','Roteiro_Solicitado','2025-10-02 01:54:02',0,1,9),(2159,213,13,NULL,'Alteração de Status','Roteiro_Solicitado','Roteiro_Concluído','2025-10-02 01:57:28',0,1,9),(2160,213,13,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Concluído','2025-10-02 01:57:53',0,1,9),(2161,213,13,NULL,'Alteração de Status','Narração_Solicitada','Pendente','2025-10-02 01:58:21',0,1,9),(2162,213,13,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-10-02 01:58:35',0,1,9),(2163,213,13,NULL,'Alteração de Status','Roteiro_Solicitado','Pendente','2025-10-02 01:58:54',0,1,9),(2164,213,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 01:58:58',0,1,9),(2165,213,13,31,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-10-02 11:06:41',0,0,9),(2166,212,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-10-02 13:09:53',0,1,9),(2167,214,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 14:27:49',0,1,9),(2168,214,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 14:29:44',0,1,9),(2169,214,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 14:30:37',0,1,9),(2170,214,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 14:30:48',0,1,9),(2171,214,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 14:35:46',0,1,9),(2172,214,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 14:36:24',0,1,9),(2173,214,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 14:36:28',0,1,9),(2174,214,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 14:37:59',0,1,9),(2175,214,13,NULL,'Alteração de Status','Pendente','Narração_Concluída','2025-10-02 14:38:10',0,1,9),(2176,214,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 14:39:05',0,1,9),(2177,214,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 14:39:10',0,1,9),(2178,214,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 14:41:26',0,1,9),(2179,214,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 14:41:32',0,1,9),(2180,214,13,NULL,'Alteração de Status','Edição_Solicitada','Roteiro_Solicitado','2025-10-02 14:41:50',0,1,9),(2181,214,13,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Concluída','2025-10-02 14:42:28',0,1,9),(2182,214,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Solicitada','2025-10-02 14:43:07',0,1,9),(2183,214,13,NULL,'Alteração de Status','Narração_Solicitada','Edição_Solicitada','2025-10-02 14:43:53',0,1,9),(2184,214,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 14:48:32',0,1,9),(2185,214,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-02 14:48:39',0,1,9),(2186,214,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 14:49:53',0,1,9),(2187,214,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-02 15:03:49',0,1,9),(2188,214,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-02 15:04:23',0,1,9),(2189,214,13,NULL,'Alteração de Status','Pendente','Narração_Concluída','2025-10-02 15:04:27',0,1,9),(2190,6,2,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-10-03 21:07:12',0,1,2),(2191,6,2,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2025-10-03 21:08:05',0,1,2),(2192,6,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Solicitado','2025-10-03 21:08:57',0,1,2),(2193,6,2,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2025-10-03 21:22:37',0,1,2),(2194,6,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Solicitado','2025-10-03 21:22:42',0,1,2),(2195,6,2,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2025-10-03 21:23:11',0,1,2),(2196,6,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Solicitado','2025-10-03 21:25:03',0,1,2),(2197,6,2,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2025-10-03 21:26:52',0,1,2),(2198,6,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Solicitado','2025-10-03 21:27:47',0,1,2),(2199,6,2,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2025-10-03 23:25:04',0,1,2),(2200,6,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Solicitado','2025-10-03 23:25:32',0,1,2),(2201,6,2,NULL,'Alteração de Status','Roteiro_Solicitado','Publicado','2025-10-03 23:26:31',0,1,2),(2202,6,2,NULL,'Alteração de Status','Publicado','Thumbnail_Concluída','2025-10-03 23:26:36',0,1,2),(2203,3,2,NULL,'Alteração de Status','Thumbnail_Concluída','Publicado','2025-10-03 23:45:44',0,1,2),(2204,4,2,NULL,'Alteração de Status','Thumbnail_Concluída','Roteiro_Solicitado','2025-10-03 23:45:47',0,1,2),(2205,6,2,NULL,'Alteração de Status','Thumbnail_Concluída','Thumbnail_Em_Andamento','2025-10-03 23:46:19',0,1,2),(2206,6,2,NULL,'Alteração de Status','Thumbnail_Em_Andamento','Roteiro_Concluído','2025-10-03 23:46:25',0,1,2),(2207,6,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Concluído','2025-10-03 23:46:36',0,1,2),(2208,4,2,NULL,'Alteração de Status','Roteiro_Solicitado','Roteiro_Concluído','2025-10-03 23:53:05',0,1,2),(2209,4,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Solicitado','2025-10-03 23:53:55',0,1,2),(2210,6,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Solicitado','2025-10-03 23:54:52',0,1,2),(2211,4,2,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2025-10-03 23:55:14',0,1,2),(2212,4,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Concluído','2025-10-03 23:55:17',0,1,2),(2213,4,2,NULL,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2025-10-03 23:55:26',0,1,2),(2214,4,2,NULL,'Alteração de Status','Edição_Solicitada','Roteiro_Solicitado','2025-10-04 00:02:14',0,1,2),(2215,4,2,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2025-10-04 00:02:25',0,1,2),(2216,4,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Solicitado','2025-10-04 00:06:25',0,1,2),(2217,5,2,NULL,'Alteração de Status','Thumbnail_Concluída','Roteiro_Solicitado','2025-10-04 00:06:31',0,1,2),(2218,4,2,NULL,'Alteração de Status','Roteiro_Solicitado','Roteiro_Solicitado','2025-10-04 00:10:04',0,1,2),(2219,214,13,NULL,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2025-10-04 02:52:00',0,1,9),(2220,214,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Pendente','2025-10-04 02:53:52',0,1,9),(2221,214,13,NULL,'Alteração de Status','Pendente','Edição_Concluída','2025-10-04 02:53:57',0,1,9),(2222,214,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Pendente','2025-10-04 02:54:58',0,1,9),(2223,214,13,NULL,'Alteração de Status','Pendente','Thumbnail_Solicitada','2025-10-04 02:55:37',0,1,9),(2224,213,13,NULL,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-10-06 14:14:44',356883,1,9),(2225,215,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-06 14:26:55',0,1,9),(2226,215,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-06 14:28:21',0,1,9),(2227,215,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-06 14:28:25',0,1,9),(2228,215,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-07 02:23:09',0,1,9),(2229,214,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-10-07 02:24:10',0,1,9),(2231,215,13,NULL,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-10-07 02:25:42',0,1,9),(2234,213,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Narração_Solicitada','2025-10-07 02:30:21',0,1,9),(2235,4,2,NULL,'Alteração de Status','Roteiro_Solicitado','Thumbnail_Solicitada','2025-10-08 18:34:03',0,1,2),(2236,217,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-10 14:02:30',0,1,9),(2237,213,13,NULL,'Alteração de Status','Narração_Solicitada','Publicado','2025-10-12 15:50:32',0,1,9),(2238,217,13,NULL,'Alteração de Status','Edição_Solicitada','Publicado','2025-10-12 15:50:35',0,1,9),(2239,4,2,NULL,'Alteração de Status','Thumbnail_Solicitada','Roteiro_Solicitado','2025-10-13 12:53:16',0,1,2),(2240,4,2,NULL,'Alteração de Status','Roteiro_Solicitado','Roteiro_Em_Andamento','2025-10-13 13:17:33',0,1,2),(2241,4,2,NULL,'Alteração de Status','Roteiro_Em_Andamento','Narração_Solicitada','2025-10-13 13:17:38',0,1,2),(2242,4,2,NULL,'Alteração de Status','Narração_Solicitada','Roteiro_Solicitado','2025-10-13 13:17:43',0,1,2),(2243,218,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-13 15:08:07',0,1,9),(2244,219,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-13 16:33:36',0,1,9),(2245,218,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-10-13 22:15:44',0,0,9),(2246,215,13,NULL,'Alteração de Status','Edição_Em_Andamento','Publicado','2025-10-14 01:52:52',0,1,9),(2247,217,13,NULL,'Alteração de Status','Publicado','Edição_Em_Andamento','2025-10-14 16:54:03',0,1,9),(2248,217,13,31,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-10-14 16:54:55',52,0,9),(2249,217,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-10-14 21:51:49',0,1,9),(2250,218,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-10-14 21:52:44',85020,0,9),(2251,218,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Edição_Solicitada','2025-10-15 11:23:38',0,1,9),(2252,218,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-10-15 11:48:01',0,0,9),(2253,218,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-10-15 17:18:09',19807,0,9),(2254,219,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-10-15 19:42:31',0,0,9),(2255,220,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-15 22:39:12',0,1,9),(2256,220,13,31,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2025-10-16 02:10:16',0,0,9),(2257,218,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-10-16 03:01:44',0,1,9),(2258,220,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Edição_Em_Andamento','2025-10-16 12:21:54',0,1,9),(2259,219,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-10-16 14:39:36',68225,0,9),(2260,221,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-18 20:05:20',0,1,9),(2261,219,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-10-18 20:15:26',0,1,9),(2262,220,13,31,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-10-18 23:40:21',213507,0,9),(2263,220,13,31,'Alteração de Status','Thumbnail_Solicitada','Edição_Concluída','2025-10-19 00:40:30',0,0,9),(2264,222,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-20 14:27:35',0,1,9),(2265,222,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-10-20 19:16:41',0,0,9),(2266,221,13,31,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-10-21 10:33:38',0,0,9),(2267,220,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-10-21 12:45:54',0,1,9),(2268,222,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-10-21 16:42:54',77173,0,9),(2269,221,13,31,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-10-22 03:13:37',59999,0,9),(2270,221,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-10-28 14:46:18',0,1,9),(2271,222,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-10-28 14:46:21',0,1,9),(2272,223,13,NULL,'Alteração de Status','Pendente','Narração_Concluída','2025-10-29 23:19:32',0,1,9),(2273,223,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-29 23:20:36',0,1,9),(2274,223,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-29 23:21:35',0,1,9),(2275,223,13,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2025-10-29 23:22:12',0,1,9),(2276,223,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-10-29 23:23:37',0,1,9),(2277,223,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-29 23:23:49',0,1,9),(2278,224,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-10-30 03:08:44',0,1,9),(2279,224,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-10-30 15:49:13',0,0,9),(2280,224,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-10-31 15:26:51',85058,0,9),(2281,223,13,31,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-11-01 14:18:07',0,0,9),(2282,223,13,31,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-11-01 17:56:51',13124,0,9),(2283,224,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-11-02 18:20:59',0,1,9),(2284,223,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-11-02 18:20:59',0,1,9),(2285,223,13,NULL,'Alteração de Status','Publicado','Edição_Solicitada','2025-11-02 23:49:00',0,1,9),(2286,223,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-11-03 14:46:52',0,0,9),(2287,230,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-11-03 14:54:11',0,1,9),(2288,223,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-11-04 14:29:28',85356,0,9),(2289,223,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-11-05 12:46:40',0,1,9),(2290,231,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-11-05 12:47:52',0,1,9),(2291,230,13,31,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-11-05 20:27:42',0,0,9),(2292,232,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-11-07 13:38:30',0,1,9),(2293,230,13,NULL,'Alteração de Status','Edição_Em_Andamento','Publicado','2025-11-08 16:30:06',0,1,9),(2294,232,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-11-08 16:44:55',0,0,9),(2295,232,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-11-09 07:47:41',54166,0,9),(2296,231,13,31,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-11-09 21:33:25',0,0,9),(2297,233,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-11-11 16:44:44',0,1,9),(2298,233,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-11-11 16:44:44',0,1,9),(2299,231,13,31,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-11-12 02:50:23',191818,0,9),(2300,233,13,31,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-11-12 02:50:48',0,0,9),(2301,233,13,31,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-11-12 12:51:37',36050,0,9),(2302,232,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-11-12 17:56:26',0,1,9),(2303,233,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-11-14 02:05:56',0,1,9),(2304,231,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-11-14 02:05:56',0,1,9),(2305,234,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-11-15 15:43:18',0,1,9),(2306,234,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-11-16 11:18:54',0,0,9),(2307,234,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-11-16 21:23:03',36249,0,9),(2308,234,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-11-24 19:41:10',0,1,9),(2309,237,13,NULL,'Alteração de Status','Pendente','Narração_Concluída','2025-11-25 14:57:46',0,1,9),(2310,237,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-11-25 15:01:35',0,1,9),(2311,237,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-11-25 15:01:42',0,1,9),(2312,237,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-11-25 22:28:42',0,0,9),(2313,238,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-11-26 13:56:11',0,1,9),(2314,237,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-11-26 18:12:39',71037,0,9),(2315,237,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-11-26 23:18:00',0,1,9),(2316,238,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-11-27 15:20:05',0,0,9),(2317,238,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-11-27 21:35:58',22553,0,9),(2318,238,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-11-27 21:58:43',0,1,9),(2319,239,13,NULL,'Alteração de Status','Pendente','Publicado','2025-12-05 20:42:11',0,1,9),(2320,240,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-12-12 14:16:40',0,1,9),(2321,240,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-12-12 14:22:33',0,1,9),(2322,240,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-12-12 14:22:41',0,1,9),(2323,240,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-12-13 15:18:53',0,0,9),(2324,240,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-12-13 22:49:50',27057,0,9),(2325,240,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-12-16 13:58:13',0,1,9),(2326,241,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-12-16 14:00:11',0,1,9),(2327,241,13,34,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2025-12-17 11:28:03',0,0,9),(2328,242,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-12-17 14:33:12',0,1,9),(2329,241,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-12-17 14:46:22',0,1,9),(2330,242,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-12-18 09:51:07',0,0,9),(2331,242,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-12-19 15:11:09',105602,0,9),(2332,242,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-12-22 13:19:19',0,1,9),(2333,243,13,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-12-22 13:19:30',0,1,9),(2334,243,13,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Concluída','2025-12-22 14:00:01',0,1,9),(2335,243,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-12-22 14:01:01',0,1,9),(2336,243,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-12-22 14:01:09',0,1,9),(2337,243,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-12-23 12:53:27',0,0,9),(2338,244,13,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-12-23 19:06:20',0,1,9),(2339,244,13,43,'Alteração de Status','Roteiro_Solicitado','Roteiro_Em_Andamento','2025-12-23 19:12:09',0,0,9),(2340,244,13,43,'Alteração de Status','Roteiro_Em_Andamento','Roteiro_Concluído','2025-12-23 20:36:49',0,0,9),(2341,243,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-12-24 13:19:30',87963,0,9),(2342,245,13,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-12-24 15:30:09',0,1,9),(2343,245,13,NULL,'Alteração de Status','Roteiro_Solicitado','Pendente','2025-12-24 15:30:48',0,1,9),(2344,245,13,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-12-24 15:30:53',0,1,9),(2345,245,13,NULL,'Alteração de Status','Roteiro_Solicitado','Pendente','2025-12-24 15:31:28',0,1,9),(2346,245,13,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-12-24 15:31:34',0,1,9),(2347,245,13,NULL,'Alteração de Status','Roteiro_Solicitado','Pendente','2025-12-24 15:32:18',0,1,9),(2348,245,13,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-12-24 15:32:34',0,1,9),(2349,245,13,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2025-12-24 15:32:43',0,1,9),(2350,245,13,43,'Alteração de Status','Narração_Solicitada','Narração_Em_Andamento','2025-12-24 15:44:05',0,0,9),(2351,245,13,43,'Alteração de Status','Narração_Em_Andamento','Narração_Concluída','2025-12-24 16:28:11',2646,0,9),(2352,246,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2025-12-24 16:53:17',0,1,9),(2353,245,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-12-26 18:11:12',0,1,9),(2354,245,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-12-26 18:11:24',0,1,9),(2355,246,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2025-12-27 13:10:45',0,0,9),(2356,247,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2025-12-27 13:29:41',0,1,9),(2357,247,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2025-12-27 15:04:57',0,0,9),(2358,248,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2025-12-27 15:10:30',0,1,9),(2359,248,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2025-12-27 16:02:24',0,0,9),(2360,245,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-12-27 16:32:36',0,0,9),(2361,245,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2025-12-28 16:06:49',84853,0,9),(2362,247,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-12-29 13:09:11',0,1,9),(2363,247,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-12-29 13:09:27',0,1,9),(2364,243,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-12-30 13:07:42',0,1,9),(2365,245,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2025-12-30 13:07:44',0,1,9),(2366,246,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2025-12-31 14:29:33',0,1,9),(2367,246,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2025-12-31 14:29:39',0,1,9),(2368,250,13,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2025-12-31 14:36:28',0,1,9),(2369,250,13,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2025-12-31 14:37:01',0,1,9),(2370,251,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2025-12-31 14:56:53',0,1,9),(2371,252,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2025-12-31 15:06:41',0,1,9),(2372,250,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2025-12-31 19:46:41',0,0,9),(2373,251,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2025-12-31 20:18:00',0,0,9),(2374,246,13,34,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2025-12-31 20:49:42',0,0,9),(2375,247,13,34,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2025-12-31 20:49:49',0,0,9),(2376,248,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2025-12-31 20:50:08',0,0,9),(2377,252,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2025-12-31 20:55:57',0,0,9),(2378,248,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2026-01-01 11:30:48',52840,0,9),(2379,251,13,34,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2026-01-01 15:22:53',0,0,9),(2380,252,13,34,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2026-01-01 22:49:06',0,0,9),(2381,250,13,34,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2026-01-02 10:31:04',0,0,9),(2382,246,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-03 15:53:43',0,1,9),(2383,247,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-03 15:53:44',0,1,9),(2384,252,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-03 15:53:50',0,1,9),(2385,253,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-05 14:31:20',0,1,9),(2386,253,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-05 15:47:58',0,0,9),(2387,253,13,43,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2026-01-05 15:48:13',0,0,9),(2388,254,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-05 16:23:03',0,1,9),(2389,253,13,NULL,'Alteração de Status','Edição_Solicitada','Pendente','2026-01-05 16:23:39',0,1,9),(2390,253,13,NULL,'Alteração de Status','Pendente','Edição_Solicitada','2026-01-05 16:23:47',0,1,9),(2391,254,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-05 21:12:04',0,0,9),(2392,253,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2026-01-06 12:49:47',0,0,9),(2393,253,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2026-01-07 09:11:19',73292,0,9),(2394,254,13,34,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2026-01-07 09:11:21',0,0,9),(2399,4,2,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Em_Andamento','2026-01-12 23:46:14',0,1,2),(2400,4,2,NULL,'Alteração de Status','Narração_Em_Andamento','Narração_Concluída','2026-01-12 23:46:16',2,1,2),(2401,257,2,NULL,'Alteração de Status','Pendente','Narração_Concluída','2026-01-12 23:47:31',0,1,2),(2402,257,2,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2026-01-12 23:53:38',0,1,2),(2403,257,2,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2026-01-12 23:55:47',0,1,2),(2404,257,2,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2026-01-12 23:57:51',0,1,2),(2405,257,2,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2026-01-12 23:58:35',0,1,2),(2406,257,2,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2026-01-12 23:59:09',0,1,2),(2407,257,2,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2026-01-13 00:02:05',0,1,2),(2408,257,2,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2026-01-13 00:21:58',0,1,2),(2409,257,2,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2026-01-13 00:23:07',0,1,2),(2410,257,2,NULL,'Alteração de Status','Edição_Solicitada','Narração_Concluída','2026-01-13 00:24:18',0,1,2),(2411,258,13,NULL,'Alteração de Status','Pendente','Roteiro_Solicitado','2026-01-14 13:28:53',0,1,9),(2412,258,13,NULL,'Alteração de Status','Roteiro_Solicitado','Narração_Solicitada','2026-01-14 13:29:11',0,1,9),(2413,259,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-14 14:08:29',0,1,9),(2414,248,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-14 22:38:40',0,1,9),(2415,251,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-14 22:38:43',0,1,9),(2416,250,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-14 22:38:46',0,1,9),(2417,253,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-14 22:38:50',0,1,9),(2418,254,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-14 22:38:53',0,1,9),(2419,260,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-14 22:39:04',0,1,9),(2420,261,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-14 22:49:51',0,1,9),(2421,258,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-14 23:14:17',0,0,9),(2422,259,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-15 01:19:52',0,0,9),(2423,260,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-15 01:50:42',0,0,9),(2424,261,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-15 02:16:26',0,0,9),(2425,260,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2026-01-15 19:06:11',0,0,9),(2426,260,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2026-01-16 13:16:54',65443,0,9),(2427,262,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-16 13:36:19',0,1,9),(2428,259,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2026-01-16 17:56:47',0,0,9),(2429,259,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2026-01-17 11:04:55',61688,0,9),(2430,261,13,34,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2026-01-17 21:32:36',0,0,9),(2431,258,13,34,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2026-01-17 21:32:38',0,0,9),(2432,262,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-17 23:35:00',0,0,9),(2433,263,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-19 13:23:33',0,1,9),(2434,260,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-19 13:23:38',0,1,9),(2435,259,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-19 13:23:41',0,1,9),(2436,264,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-19 13:41:51',0,1,9),(2437,262,13,34,'Alteração de Status','Edição_Solicitada','Edição_Concluída','2026-01-19 14:19:14',0,0,9),(2438,263,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-20 02:09:16',0,0,9),(2439,264,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-20 02:41:59',0,0,9),(2440,262,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-20 14:22:36',0,1,9),(2441,264,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2026-01-21 10:39:07',0,0,9),(2442,258,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-21 14:08:57',0,1,9),(2443,263,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2026-01-22 12:37:29',0,0,9),(2444,263,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2026-01-22 19:47:27',25797,0,9),(2445,264,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2026-01-22 19:47:29',119302,0,9),(2446,261,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-25 16:05:25',0,1,9),(2447,264,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-25 16:05:29',0,1,9),(2448,263,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-28 13:13:51',0,1,9),(2449,265,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-28 13:35:53',0,1,9),(2450,265,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-28 23:10:43',0,0,9),(2451,266,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-29 13:27:46',0,1,9),(2452,267,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-01-29 18:08:38',0,1,9),(2453,266,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-29 22:10:19',0,0,9),(2454,265,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2026-01-29 22:15:44',0,0,9),(2455,267,13,43,'Alteração de Status','Narração_Solicitada','Narração_Concluída','2026-01-29 22:24:22',0,0,9),(2456,265,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2026-01-30 20:15:18',79174,0,9),(2457,266,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2026-01-30 21:02:42',0,0,9),(2458,265,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-01-31 18:17:05',0,1,9),(2459,266,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2026-01-31 21:57:28',89687,0,9),(2460,267,13,34,'Alteração de Status','Edição_Solicitada','Edição_Em_Andamento','2026-02-01 13:48:16',0,0,9),(2461,267,13,34,'Alteração de Status','Edição_Em_Andamento','Edição_Concluída','2026-02-01 17:09:19',12063,0,9),(2462,267,13,34,'Alteração de Status','Thumbnail_Solicitada','Edição_Concluída','2026-02-01 17:09:23',0,0,9),(2463,267,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-02-02 13:31:40',0,1,9),(2464,266,13,NULL,'Alteração de Status','Thumbnail_Solicitada','Publicado','2026-02-03 13:11:16',0,1,9),(2465,268,13,NULL,'Alteração de Status','Pendente','Narração_Solicitada','2026-02-04 14:25:11',0,1,9);
/*!40000 ALTER TABLE `video_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `channel_id` int NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `observations` text COLLATE utf8mb4_general_ci,
  `youtube_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `script_writer_id` int DEFAULT NULL,
  `narrator_id` int DEFAULT NULL,
  `editor_id` int DEFAULT NULL,
  `thumb_maker_id` int DEFAULT NULL,
  `company_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `script_writer_id` (`script_writer_id`),
  KEY `narrator_id` (`narrator_id`),
  KEY `editor_id` (`editor_id`),
  KEY `thumb_maker_id` (`thumb_maker_id`),
  KEY `company_id` (`company_id`),
  KEY `videos_ibfk_1` (`channel_id`),
  CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `videos_ibfk_2` FOREIGN KEY (`script_writer_id`) REFERENCES `freelancers` (`id`),
  CONSTRAINT `videos_ibfk_3` FOREIGN KEY (`narrator_id`) REFERENCES `freelancers` (`id`),
  CONSTRAINT `videos_ibfk_4` FOREIGN KEY (`editor_id`) REFERENCES `freelancers` (`id`),
  CONSTRAINT `videos_ibfk_5` FOREIGN KEY (`thumb_maker_id`) REFERENCES `freelancers` (`id`),
  CONSTRAINT `videos_ibfk_6` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=269 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES (3,'testetes',3,'Publicado','https://www.youtube.com/watch?v=0dLX40UMUKo&list=RD0dLX40UMUKo&start_radio=1',NULL,NULL,NULL,NULL,NULL,2,'2025-08-05 20:20:00','2025-10-03 23:45:44'),(4,'teste',3,'Edição_Solicitada','https://www.youtube.com/watch?v=8gwowS3eVjE',NULL,NULL,NULL,NULL,NULL,2,'2025-08-07 04:03:20','2026-01-12 23:46:16'),(5,'tteste',3,'Roteiro_Solicitado','https://www.youtube.com/watch?v=90pGpjStE7U',NULL,NULL,NULL,NULL,NULL,2,'2025-08-13 14:44:12','2025-10-04 00:06:31'),(6,'Titulo do vídeo',3,'Roteiro_Solicitado','https://www.youtube.com/watch?v=o2Q7zHCQrh0',NULL,NULL,NULL,NULL,NULL,2,'2025-08-13 15:06:06','2025-10-03 23:54:52'),(212,'5 Atores que Jason Mais odeia',31,'Publicado','https://www.youtube.com/watch?v=d8XcoyZ0i2k&t=2s&pp=ygURYmVlZiBldGVybm8gamFzb24%3D',NULL,NULL,NULL,NULL,NULL,9,'2025-09-30 17:19:33','2025-10-02 13:09:53'),(213,'11 Atores que Sao Armas Letais na vida real',31,'Publicado','https://www.youtube.com/watch?v=BpJqPtZu4Lc&pp=ygUcYXRvcmVzIHF1ZSBzb24gYXJtYXMgbGV0YWxlcw%3D%3D',NULL,NULL,NULL,NULL,NULL,9,'2025-10-02 01:13:14','2025-10-12 15:50:31'),(214,'O Gigante de 300kg que criou um hino israel',30,'Publicado','--',NULL,NULL,NULL,NULL,NULL,9,'2025-10-02 14:25:22','2025-10-07 02:24:10'),(215,'Rambo Programaado Para Matar x curiosidades',31,'Publicado','https://www.youtube.com/watch?v=iXucTCOc9l4&pp=ygUccmFtYm8gZmlyc3QgYmxvb2QgMTk4MiB3ZWlyZA%3D%3D',NULL,NULL,NULL,NULL,NULL,9,'2025-10-06 14:18:28','2025-10-14 01:52:52'),(217,'El Gigante de 300 kilos con la Voz más Dulce del Mundo',32,'Publicado','https://youtu.be/VFoi4jWK9D8?list=RDVFoi4jWK9D8',NULL,NULL,NULL,NULL,NULL,9,'2025-10-10 14:00:22','2025-10-14 21:51:49'),(218,'Jhonny Cash',30,'Publicado','https://www.youtube.com/watch?v=IodTXIOFWs4&pp=ygUXaHV0IGhzaXRvcnkgamhvbm55IGNhc2g%3D',NULL,NULL,NULL,NULL,NULL,9,'2025-10-13 15:03:15','2025-10-16 03:01:44'),(219,'Aos 78 Barry Gibb adminte...',33,'Publicado','https://www.youtube.com/watch?v=p4DR4hc8QKI&pp=ygUPYXQgNzggYmFycnkgZ2li',NULL,NULL,NULL,NULL,NULL,9,'2025-10-13 16:31:40','2025-10-18 20:15:26'),(220,'Atores que Jack Nicholson mais odeia',31,'Publicado','https://youtu.be/SnteV62vR_w',NULL,NULL,NULL,NULL,NULL,9,'2025-10-15 21:05:08','2025-10-21 12:45:54'),(221,'7 Atores que Vin Diesel mais Odeia',31,'Publicado','https://youtu.be/3EUnccp64vo',NULL,NULL,NULL,NULL,NULL,9,'2025-10-18 20:03:49','2025-10-28 14:46:18'),(222,'Jhonny Cash 2 Homem de Preto Hurt',30,'Publicado','https://www.youtube.com/watch?v=eo-M9djBUBQ&pp=ygUSY3VsdHVyYSBub3N0YWxnaWNh0gcJCfwJAYcqIYzv',NULL,NULL,NULL,NULL,NULL,9,'2025-10-20 14:26:06','2025-10-28 14:46:21'),(223,'Assim estao os Atores de Velozes e Furiosos Desafio em Tokyio ',31,'Publicado','https://www.youtube.com/watch?v=DCgkpghpIdk',NULL,NULL,NULL,NULL,NULL,9,'2025-10-29 23:17:33','2025-11-05 12:46:40'),(224,'ERA O grupos mais misterioso da musica',30,'Publicado','https://youtu.be/QWhX6w6RL5U',NULL,NULL,NULL,NULL,NULL,9,'2025-10-30 03:06:58','2025-11-02 18:20:59'),(230,'A Verdade por Tras de Tarto feito',31,'Publicado','https://youtu.be/ZNRx78kPkqw',NULL,NULL,NULL,NULL,NULL,9,'2025-11-03 14:30:32','2025-11-08 16:30:06'),(231,'11 atores que sao armas letais 2',31,'Publicado','https://www.youtube.com/watch?v=oYiLD3mh334',NULL,NULL,NULL,NULL,NULL,9,'2025-11-05 12:46:28','2025-11-14 02:05:56'),(232,' Sandra Bullock Revelos os 6 Atores mais Asquerosos que Trabalhou',31,'Publicado','https://www.youtube.com/watch?v=_yN6iVPTSCo&pp=ygUjc2FuZHJhIGJ1bGxvY2sgcmV2ZWxvIGxvcyA2IGFjdG9yZXM%3D',NULL,NULL,NULL,NULL,NULL,9,'2025-11-07 13:36:15','2025-11-12 17:56:26'),(233,'Cores que Envelhecem',34,'Publicado','https://youtu.be/gmqpsFqAT7U',NULL,NULL,NULL,NULL,NULL,9,'2025-11-11 14:36:54','2025-11-14 02:05:56'),(234,'Eles se odiavam mas dominaram os anos 80 Tears for fears',30,'Publicado',NULL,NULL,NULL,NULL,NULL,NULL,9,'2025-11-15 15:41:49','2025-11-24 19:41:09'),(237,'Atores que Jim Carey Mais Odeia',31,'Publicado','https://youtu.be/TWosqu2u-7o',NULL,NULL,NULL,NULL,NULL,9,'2025-11-25 14:57:40','2025-11-26 23:17:59'),(238,'A Ultima Canção do Abba',30,'Publicado','https://youtu.be/C6JpKjwUuSo',NULL,NULL,NULL,NULL,NULL,9,'2025-11-26 13:53:03','2025-11-27 21:58:43'),(239,'Atores que Denzel Mais odeia',31,'Publicado','https://www.youtube.com/watch?v=5nts5k6qiYA&pp=ygUZYWN0b3JlcyBkZW56ZWwgbWFzIG9kaWFiYQ%3D%3D',NULL,NULL,NULL,NULL,NULL,9,'2025-12-05 20:42:07','2025-12-05 20:42:11'),(240,'As mães mais gostosa de Hollywood',31,'Publicado','https://www.youtube.com/watch?v=Okq_90NQy1E&t=4s&pp=ygUZNzUgbW9zdCBpcnJlc2lzdGl2ZWwgbW9tcw%3D%3D',NULL,NULL,NULL,NULL,NULL,9,'2025-12-12 14:12:48','2025-12-16 13:58:13'),(241,'Aos 57 Jason Confessa o que Todos Sabiamos ',31,'Publicado','https://youtu.be/MxyBYSZN5dA',NULL,NULL,NULL,NULL,NULL,9,'2025-12-16 13:58:03','2025-12-17 14:46:22'),(242,'Os Segredos Sombrios Por Trás de 11 Canções Clássicas ',30,'Publicado','https://youtu.be/_hwbWPqDbGE',NULL,NULL,NULL,NULL,NULL,9,'2025-12-17 14:30:59','2025-12-22 13:19:19'),(243,'Atores que Dolph Lundgren Mais Odeia',31,'Publicado','https://youtu.be/L2wAFEn0Z94',NULL,NULL,NULL,NULL,NULL,9,'2025-12-22 13:18:35','2025-12-30 13:07:42'),(244,'61 LENDAS IMORTAIS DO KUNG FU: Antes e depois',31,'Narração_Solicitada','https://youtu.be/wTkh6DRaMLo',NULL,NULL,NULL,NULL,NULL,9,'2025-12-23 19:02:59','2025-12-23 20:36:49'),(245,'Aos 56 anos, Pauley Perrette FINALMENTE confirma os rumores',31,'Publicado','https://www.youtube.com/watch?v=8CzCVeF8diE',NULL,NULL,NULL,NULL,NULL,9,'2025-12-24 15:28:43','2025-12-30 13:07:44'),(246,'Aos 63 anos, Enya finalmente revelou o que todos esperávamos',33,'Publicado','https://www.youtube.com/watch?v=ud1htxWUejE',NULL,NULL,NULL,NULL,NULL,9,'2025-12-24 16:52:45','2026-01-03 15:53:43'),(247,'EL GIGANTE GENTIL - LA VOZ QUE SANÓ AL MUNDO',32,'Publicado','https://www.youtube.com/watch?v=VFoi4jWK9D8',NULL,NULL,NULL,NULL,NULL,9,'2025-12-27 13:29:11','2026-01-03 15:53:44'),(248,'AS 15 CELEBRIDADES QUE ODEIAM STEVEN SEAGAL ',31,'Publicado','https://youtu.be/KwS6_wj1SS4',NULL,NULL,NULL,NULL,NULL,9,'2025-12-27 15:09:59','2026-01-14 22:38:40'),(250,'Atores que Keanu Revees mais Odeia',31,'Publicado','https://www.youtube.com/watch?v=ZowstuIOfTQ',NULL,NULL,NULL,NULL,NULL,9,'2025-12-31 14:29:13','2026-01-14 22:38:46'),(251,'Porque Tony Jaa de OngBack pegou prisao Perpetua',31,'Publicado','https://www.youtube.com/watch?v=TA1rWHdOM0E',NULL,NULL,NULL,NULL,NULL,9,'2025-12-31 14:54:54','2026-01-14 22:38:43'),(252,'Aos 62 Wesley Snipes Chocou Hollywood ao dizer...',31,'Publicado','https://youtu.be/Ybefd4EEjhI',NULL,NULL,NULL,NULL,NULL,9,'2025-12-31 15:00:37','2026-01-03 15:53:50'),(253,'Rick james o cantor que sofreu um AVC no Palco ',30,'Publicado','https://youtu.be/kFfLOaK_LfM',NULL,NULL,NULL,NULL,NULL,9,'2026-01-05 14:30:27','2026-01-14 22:38:50'),(254,'AOS 67, DOLPH LUNDGREN FINALMENTE REVELA O QUE TODOS SUSPEITÁVAMOS',35,'Publicado','https://www.youtube.com/watch?v=2SPcczr91-0',NULL,NULL,NULL,NULL,NULL,9,'2026-01-05 16:22:18','2026-01-14 22:38:53'),(257,'teste',3,'Edição_Solicitada','teste',NULL,NULL,NULL,NULL,NULL,2,'2026-01-12 23:47:29','2026-01-13 00:24:18'),(258,'Atores que se odeiam até a morte',31,'Publicado','https://www.youtube.com/watch?v=IRpnojMWuiU&pp=ugUEEgJlc9IHCQlNCgGHKiGM7w%3D%3D',NULL,NULL,NULL,NULL,NULL,9,'2026-01-14 13:23:25','2026-01-21 14:08:57'),(259,'6 Irmãos Se Tornaram Inimigos Por Causa da Fama, The Commodores',30,'Publicado','https://youtu.be/tZrXw-omAUY',NULL,NULL,NULL,NULL,NULL,9,'2026-01-14 14:07:40','2026-01-19 13:23:41'),(260,'LOS 7 ACTORES QUE JASON STATHAM JAMÁS PERDONARÁ',36,'Publicado','https://www.youtube.com/watch?v=gBZZ46l9gPI&t=133s',NULL,NULL,NULL,NULL,NULL,9,'2026-01-14 22:38:12','2026-01-19 13:23:38'),(261,'El Misterio Musical Más Grande de los 90',32,'Publicado','https://www.youtube.com/watch?v=SebMn_-c-v8',NULL,NULL,NULL,NULL,NULL,9,'2026-01-14 22:49:34','2026-01-25 16:05:25'),(262,'Aqua Barbie Girl Musica processada',30,'Publicado','https://youtu.be/kdiLnjuFqTk',NULL,NULL,NULL,NULL,NULL,9,'2026-01-16 13:35:37','2026-01-20 14:22:36'),(263,'Porque Hoywood Abandonou Jet li?',31,'Publicado','https://www.youtube.com/watch?v=LYeaxFT44wA',NULL,NULL,NULL,NULL,NULL,9,'2026-01-19 13:20:50','2026-01-28 13:13:51'),(264,'Ele Criou a Balada Mais Linda do Rock, Mas Um Tumor Crescia ',30,'Publicado','https://youtu.be/NFwNp1pbQLI',NULL,NULL,NULL,NULL,NULL,9,'2026-01-19 13:33:54','2026-01-25 16:05:29'),(265,' DEBBIE HARRY a lenda a musica que quase morreu nas maos de um serial killer - Cultura Nostalgica',30,'Publicado','https://youtu.be/FMF9bTK-ZmM',NULL,NULL,NULL,NULL,NULL,9,'2026-01-28 13:35:28','2026-01-31 18:17:05'),(266,'Denzel Washington Los Nueve Actores Que Mas Odia',36,'Publicado','https://www.youtube.com/watch?v=qtZSNZOgy8c&pp=ygUYYWN0b3JlcyBkZW56ZWwgbW9zIGhhdGVk',NULL,NULL,NULL,NULL,NULL,9,'2026-01-29 13:25:14','2026-02-03 13:11:16'),(267,'7 Atores que Arnold Mias Odia',31,'Publicado','https://youtu.be/HimXVhSFIPg',NULL,NULL,NULL,NULL,NULL,9,'2026-01-29 18:02:44','2026-02-02 13:31:40'),(268,'O Trágico Final de Mestres da restauração',31,'Narração_Solicitada','https://youtu.be/xXu5DZu1-x8',NULL,NULL,NULL,NULL,NULL,9,'2026-02-04 13:58:23','2026-02-04 14:25:11');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `welcome_settings`
--

DROP TABLE IF EXISTS `welcome_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `welcome_settings` (
  `id` bigint NOT NULL,
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `welcome_settings_chk_1` CHECK (json_valid(`config`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `welcome_settings`
--

LOCK TABLES `welcome_settings` WRITE;
/*!40000 ALTER TABLE `welcome_settings` DISABLE KEYS */;
INSERT INTO `welcome_settings` VALUES (1,'{\"hero\":{\"badge\":{\"text\":\"Bem-vindo à Nossa Plataforma\",\"icon\":\"Sparkles\"},\"title\":{\"main\":\"Sua solução completa para\",\"highlight\":\"gerenciar criação de conteúdo\"},\"description\":\"Gerencie projetos, colabore com freelancers e organize seus canais de conteúdo de forma eficiente e profissional.\"},\"features\":[{\"id\":\"1\",\"title\":\"Organizations\",\"description\":\"Crie ou participe de organizações para gerenciar seus projetos de criação de conteúdo.\",\"icon\":\"Building2\",\"order\":1},{\"id\":\"2\",\"title\":\"Channels\",\"description\":\"Configure canais para organizar seu conteúdo. Cada canal pode conter múltiplos vídeos.\",\"icon\":\"Youtube\",\"order\":2},{\"id\":\"3\",\"title\":\"Freelancers\",\"description\":\"Gerencie seus membros freelancers, atribua tarefas e acompanhe o progresso.\",\"icon\":\"Users\",\"order\":3}],\"video\":{\"title\":\"Tutorial: Primeiros Passos\",\"description\":\"Aprenda a usar a plataforma em 5 minutos\",\"enabled\":true,\"videoUrl\":\"https://www.youtube.com/watch?v=UByjcpf9oHU\"},\"ad\":{\"title\":\"Espaço para Anúncios\",\"description\":\"Conteúdo HTML personalizado será exibido aqui\",\"htmlContent\":\"<div style=\\\"text-align: center; color: #6b7280; font-size: 14px;\\\">\\n        <div style=\\\"background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px; border-radius: 8px; margin-bottom: 8px;\\\">\\n          <strong>Anúncio Exemplo</strong>\\n        </div>\\n        <p style=\\\"margin: 0; font-size: 12px;\\\">Substitua este conteúdo pelo seu HTML de anúncio</p>\\n      </div>\",\"enabled\":true},\"cta\":{\"title\":\"Pronto para começar?\",\"description\":\"Explore o dashboard para ver todas as funcionalidades disponíveis.\",\"buttonText\":\"Explorar Dashboard\",\"buttonIcon\":\"Play\",\"enabled\":true}}','2025-08-05 14:48:41','2025-08-11 20:31:27');
/*!40000 ALTER TABLE `welcome_settings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-05 17:14:15
