-- MariaDB dump 10.19  Distrib 10.4.27-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: ecommerce
-- ------------------------------------------------------
-- Server version	10.4.27-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,NULL,2,249.00),(2,2,NULL,2,249.00),(3,3,NULL,2,24.90),(4,4,NULL,1,24.90),(5,5,NULL,1,12.50),(6,6,NULL,2,18.00),(7,7,NULL,1,39.50);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `payment_method` varchar(20) NOT NULL DEFAULT 'cod',
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,NULL,'Mouin','mouin@ecommerce.com',NULL,NULL,498.00,'cod','processing','2026-08-08 13:27:11'),(2,2,'Mouin','mouin@ecommerce.com',NULL,NULL,498.00,'cod','pending','2026-08-08 13:27:40'),(3,2,'Mouin','mouin@ecommerce.com','Avenue Habib Bourguiba, Tunis','20123456',49.80,'cod','processing','2026-08-08 14:13:02'),(4,2,'Mouin','mouin@ecommerce.com','Rue Habib Thameur, Tunis','+21620123456',24.90,'cod','pending','2026-08-08 15:30:57'),(5,2,'Mouin','mouin@ecommerce.com','Test','+21620123456',12.50,'cod','pending','2026-08-08 15:37:36'),(6,NULL,'Karim Ben Ali','karim@gmail.com','Avenue Habib Bourguiba, Sousse','+21655123456',36.00,'cod','pending','2026-08-08 15:45:53'),(7,NULL,'mouinehasni','mouinehosni7@gmail.com','Rades','50161520',39.50,'cod','pending','2026-08-08 15:49:48');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Materna Disque D├®maquillant Bt 80 Unit├®s','Double face en coton ┬À Id├®al pour peaux sensibles ┬À D├®maquillage doux des yeux ┬À D├®maquillage profond du visage ┬À 80 unit├®s ┬À Marque Materna ┬À BT (Beauty Tool) ┬À Haute qualit├®',3.57,49,'products/p1-materna-disque-demaquillant-bt-80-unites-300x300.webp','Visage','2026-08-08 16:19:01'),(2,'Eucerin Serum Duo Anti-Pigment ÔÇô 30ml','R├®duit les taches brunes ┬À Att├®nue les taches de vieillesse ┬À Pr├®vient les taches de soleil ┬À Rend la peau plus lisse et lumineuse ┬À Unifie le teint ┬À Formule unique avec Thiamol actif brevet├® et Acide Hyaluronique concentr├® ┬À Texture l├®g├¿re et agr├®able ┬À R├®sultats visibles en 2 semaines',191.55,50,'products/p2-eucerin-serum-duo-anti-pigment-enhanced-1778504529874-300x300.png','Visage','2026-08-08 16:19:01'),(3,'Svr Topialyse Gel Lavant Flacon Pompe  1L','SVR TOPIALYSE GEL LAVANT ┬À Protecteur anti-dess├¿chement ┬À Peaux sensibles et s├¿ches ┬À Pour toute la famille ┬À Nettoie tout le corps ┬À Hydrate, apaise & nourrit ┬À R├®duit les irritations ┬À Contenance 1 litre',41.75,50,'products/p3-topialyse-gel-lavant-flacon-pompe-1l-300x300.jpg','Visage','2026-08-08 16:19:01'),(4,'La Roche Posay Effaclar Gel Moussant Purifiant  400mlroch','La roche posay Effaclar ┬À Gel Moussant Purifiant ┬À Pour peaux mixtes, peaux grasses ┬À Pour peaux ├á tendance acn├®ique ┬À Respecte les peaux sensibles ┬À Nettoie et purifie la peau en douceur ┬À Agit sur les imperfections, les points noirs ┬À Elimine les impuret├®s et lÔÇÖexc├¿s de s├®bum ┬À Hypoallerg├®nique, Non com├®dog├¿ne ┬À Contenance 400 ml',69.98,50,'products/p4-la-roche-posay-effaclar-gel-moussant-purifiant-400mlroch-300x300.jpg','Visage','2026-08-08 16:19:01'),(5,'Svr Sebiaclear Gel Moussant  400ml','SVR SEBIACLEAR GEL MOUSSANT ┬À Nettoyant purifiant d├®sincrustant ┬À Peaux sensibles, mixtes ├á grasses ┬À Peaux ├á tendance acn├®iques ┬À Elimine les impuret├®s ┬À Limite lÔÇÖexc├¿s de s├®bum ┬À Combat les imperfections ┬À Contenance 400 ml',53.06,50,'products/p5-svr-sebiaclear-gel-moussant-400ml-300x300.jpg','Visage','2026-08-08 16:19:01'),(6,'Eucerin Soin De Nuit Anti-Pigment 50ml','R├®duit les taches brunes ┬À Pr├®vient lÔÇÖapparition des taches de vieillesse ┬À Uniformise la peau ┬À Rend la peau plus ├®clatante ┬À Agit en profondeur sur lÔÇÖhyperpigmentation ┬À R├®duit la production de m├®lanine ┬À Favorise la r├®g├®n├®ration de la peau la nuit ┬À Texture non grasse et p├®n├¿tre rapidement',100.82,50,'products/p6-eucerin-soin-de-nuit-anti-pigment-50ml-enhanced-1778504592166-300x300.png','Visage','2026-08-08 16:19:01'),(7,'Vita Citral Baume ├Ç┬á L├¿vres 15ml','Hydrate et nourrit les l├¿vres ┬À Diminue les sensations de tiraillement ┬À R├®pare les l├¿vres ab├«m├®es et r├®duit les fissures ┬À Prot├¿ge des agressions ext├®rieures (froid, vent) ┬À Formule avec beurre de Karit├®, cire dÔÇÖAbeille, huile dÔÇÖEchium, huile dÔÇÖArgousier et vitamine E ┬À Contenance de 15ml ┬À Id├®al pour les l├¿vres dess├®ch├®es, ab├«m├®es et gerc├®es.',20.00,50,'products/p7-1-5-300x300.png','Visage','2026-08-08 16:19:01'),(8,'Svr Sebiaclear Gel Moussant 200ml','SVR SEBIACLEAR GEL MOUSSANT ┬À Nettoyant purifiant d├®sincrustant ┬À Peaux sensibles, mixtes ├á grasses ┬À Peaux ├á tendance acn├®iques ┬À Elimine les impuret├®s ┬À Limite lÔÇÖexc├¿s de s├®bum ┬À Combat les imperfections ┬À Contenance 200 ml',36.73,50,'products/p8-svr-sebiaclear-gel-moussant-200ml-300x300.jpg','Visage','2026-08-08 16:19:01'),(9,'Avene Cleanance Gel Nettoyant  400 ml','Avene cleanance gel nettoyant ┬À Pour peaux mixtes ├á grasses ┬À Pour peaux acn├®iques ┬À Nettoie la peau en douceur ┬À Agit sur les imperfections ┬À Elimine les boutons, lÔÇÖacn├® ┬À R├®duit les points noirs ┬À Pour visage et corps ┬À Application : Matin et soir ┬À Contenance 400 ml',59.07,50,'products/p9-157f91-38-300x300.jpg','Visage','2026-08-08 16:19:01'),(10,'Uriage Hyseac Gel Nettoyant Doux  150ml','Uriage Hyseac gel nettoyant doux ┬À Sans savon se rince ├á lÔÇÖeau ┬À Pour peaux grasses ├á imperfections ┬À Pour peaux mixtes ├á grasses ┬À Nettoie et purifie la peau ┬À Elimine les impuret├®s ┬À Elimine lÔÇÖexc├¿s de s├®bum ┬À Contenance 150 ml',31.94,50,'products/p10-uriage-hyseac-gel-nettoyant-doux-150ml-300x300.jpg','Visage','2026-08-08 16:19:01'),(11,'Svr Sebiaclear Hydra Soin R├®parateur Apaisant Anti-Marques  40 ml','SVR Sebiaclear Hydra ┬À Soin R├®parateur Apaisant ┬À Anti-Marques, anti-acn├® ┬À Effet apaisant imm├®diat ┬À Peaux ├á tendance acn├®ique ┬À Hydrate intens├®ment ┬À Texture cr├¿me-mousse ┬À Contenance 40 ml',42.84,50,'products/p11-svr-sebiaclear-hydra-soin-reparateur-apaisant-anti-marques-40-ml-300x300.jpg','Visage','2026-08-08 16:19:01'),(12,'Aktiv Zinc+Histidine+Vitamine C  30 Comprim├®s','AKTIV ZINC+HISTIDINE+VITAMINE C ┬À De la marque Doppelherz ┬À Compl├®ment alimentaire indispensable ┬À A prendre en cure dÔÇÿun mois renouvelables ┬À 1 Comprim├® par jour ┬À Renforce le syst├¿me immunitaire ┬À Ralentit le vieillissement cellulaire ┬À R├®v├¿le lÔÇÖ├®clat de la peau ┬À Traite les probl├¿me de peaux ( acn├® ) ┬À Renforce les cheveux et les ongles ┬À Boite de 30 comprim├®s',34.28,50,'products/p12-aktiv-zinchistidinevitamine-c-30-comprimes-enhanced-1778501499900-300x300.png','Cheveux','2026-08-08 16:19:01'),(13,'Aktiv Capilvit  30 G├®lules','Aktiv Capilvit  30 G├®lules',35.30,50,'products/p13-aktiv-capilvit-30-gelules-enhanced-1778502155245-300x300.png','Cheveux','2026-08-08 16:19:01'),(14,'BIOXCIN SHAMPOOING VEGETAL A LÔÇÖAIL NOIR 300ML','Les vitamines (A, B1, B2, B5, B7, B9) assurent la force des cheveux. ┬À Les min├®raux (cuivre, zinc, fer, calcium) nourrissent les cheveux. ┬À LÔÇÖextrait dÔÇÖail noir montre un fort effet contre la chute des cheveux. ┬À Contenance : 300 ml',40.73,50,'products/p14-bioxsine-shampooing-vegetal-a-l-ail-noir-300ml-300x300.jpg','Cheveux','2026-08-08 16:19:01'),(15,'BIOXCIN SHAMPOOING ANTI CHUTE FORTE TOUS TYPES DE CHEVEUX 300ML','<span class=\"a-list-item\">BIOXSINE FORTE shampooing Formule Intense renforce les follicules de cheveux faibles et aide cheveux look dynamique, fort et sain en nourrissant les cheveux et le cuir chevelu avec ses vitamine extra-forts et formule min├®rale.</span> ┬À <span class=\"a-list-item\">Il renforce, augmente la r├®sistance, ajoute du volume et cr├®e lÔÇÖenvironnement saine n├®cessaire ├á faire revivre les follicules de cheveux faibles.</span>',42.45,50,'products/p15-bioxcin-shampooing-anti-chute-forte-tous-types-de-cheveux-300ml-300x300.webp','Cheveux','2026-08-08 16:19:01'),(16,'Bio Orient Huile De Noisette 10 ml','Bio Orient Huile De Noisette 10 ml',5.00,50,'products/p16-bio-orient-huile-de-noisette-10ml-300x300.jpg','Cheveux','2026-08-08 16:19:01'),(17,'Apothica Keraliss Apres Shampooing Lissant ÔÇô 200 ml','APOTHICA KERALISS APRES SHAMPOOING ┬À Lissant ┬À Sans sulfate ┬À Sans parabens ┬À Sans silicones ┬À DÔÇÖorigine v├®g├®tales ┬À Contient de lÔÇÖacide hyaluronique ┬À Contient de la k├®ratine ┬À pour enfants et adultes ┬À Contenance :<span style=\"font-size: 1rem;\"> 250ML</span>',28.00,50,'products/p17-Sans-titre-47-1-300x300.jpg','Cheveux','2026-08-08 16:19:01'),(18,'Forcapil Cheveux Et Ongles 180 G├®lules','Forcapil Cheveux Et Ongles 180 G├®lules',102.48,50,'products/p18-forcapil-180-300x300.jpg','Cheveux','2026-08-08 16:19:01'),(19,'Eric Favre Programme 10 Jours Pure Collagen +','Eric Favre Programme 10 Jours Pure Collagen +',77.56,50,'products/p19-ecric-favre-300x300.png','Cheveux','2026-08-08 16:19:01'),(20,'Forcapil Cheveux Et Ongles  60 G├®lules','Forcapil Cheveux Et Ongles  60 G├®lules',51.76,50,'products/p20-forcapil-60-300x300.jpg','Cheveux','2026-08-08 16:19:01'),(21,'Ducray Neoptide Expert Serum Fortifiant Redensifiant 2*50ml','Le S├®rum NEOPTIDE EXPERT ┬À Double action contribue ├á lutter contre la chute de cheveux chronique ┬À Stimule la croissance du cheveu. ┬À Efficace d├¿s 2 mois sur les 6 marqueurs de la chute chronique. ┬À Femmes/Hommes. ┬À Anti-chute et croissance. ┬À Augmente lÔÇÖancrage. ┬À Volume et ├®paisseur.',128.26,50,'products/p21-dermaceutic-300x300.jpg','Cheveux','2026-08-08 16:19:01'),(22,'Apothica Keraliss Creme Protectrice ÔÇô 100 ml','APOTHICA KERALISS CREME PROTECTRICE ┬À Lissante et protectrice ┬À Sans sulfate ┬À Sans parabens ┬À Sans silicones ┬À DÔÇÖorigine v├®g├®tales ┬À Contient de lÔÇÖacide hyaluronique ┬À Contient de la k├®ratine ┬À Sans rin├ºage ┬À pour enfants et adultes ┬À Contenance :<span style=\"font-size: 1rem;\"> 100 ml</span>',30.96,50,'products/p22-Sans-titre-48-1-300x300.jpg','Cheveux','2026-08-08 16:19:01'),(23,'Oleo-Glycerine Creme 100ml','Cr├¿me nourrissante et revitalisante ┬À ├Ç base dÔÇÖhuile de ma├»s ┬À Pour peaux s├¿ches ┬À Pr├®vient la d├®perdition dÔÇÖeau ┬À Rend la peau souple et ├®lastique ┬À Convient au visage, au corps et aux mains ┬À Contenance de 50ml ┬À Marque non sp├®cifi├®e',5.35,50,'products/p23-oleo-glycerine-creme-50ml-300x300.jpg','Corps','2026-08-08 16:19:01'),(24,'Avene Cicalfate+ Creme Reparatrice Protectrice 100ml','Av├¿ne Cicalfate+ ┬À Cr├¿me r├®paratrice protectrice ┬À Pour peaux sensibles et irrit├®es ┬À Pour peaux abim├®es et fragilis├®es ┬À Nourrissons, enfants et adultes ┬À R├®pare lÔÇÖ├®piderme irrit├® ┬À Soulage les irritations cutan├®es ┬À Nourrit la peau intens├®ment ┬À Apaise la peau fragilis├®e ┬À Contenance 100ml',50.20,50,'products/p24-avene--300x300.jpg','Corps','2026-08-08 16:19:01'),(25,'Avene Cicalfate+ Creme Reparatrice Protectrice 40ml','Av├¿ne Cicalfate+ ┬À Cr├¿me r├®paratrice protectrice ┬À Pour peaux sensibles et irrit├®es ┬À Pour peaux abim├®es et fragilis├®es ┬À Nourrissons, enfants et adultes ┬À R├®pare lÔÇÖ├®piderme irrit├® ┬À Soulage les irritations cutan├®es ┬À Nourrit la peau intens├®ment ┬À Apaise la peau fragilis├®e ┬À Contenance 40 ml',32.87,50,'products/p25-avene-1-300x300.jpg','Corps','2026-08-08 16:19:01'),(26,'Bioderma Pigmentbio Sensitive Areas 75ml','Gel d├®pigmentant ┬À Pour les zones sensibles ┬À Format 75ml ┬À Marque BIODERMA ┬À Efficace sur les taches ┬À R├®sultats visibles rapidement ┬À Adapt├® ├á tous les types de peau ┬À Test├® dermatologiquement',52.93,50,'products/p26-BIODERMA-PIGMENTBIO-SENSITIVE-AREAS-75ML-300x300.jpg','Corps','2026-08-08 16:19:01'),(27,'Phyteal Phytovera Gel Apaisant  100ml','PHYTEAL PHYTOVERA GEL ┬À A base dÔÇÖalo├® vera ┬À sans parab├¿ne ┬À Hydratante, apaisante ┬À R├®g├®n├®ratrice ┬À Pour piqures dÔÇÖinsectes et m├®duses ┬À Coups de soleil ┬À Irritation cutan├®es ┬À Post ├®pilation ou traitement laser ┬À Pour usage externe ┬À Contient 100 ml',26.38,50,'products/p27-phytovera-gel-apaisant-100ml-300x300.jpg','Corps','2026-08-08 16:19:01'),(28,'Da-Derm Cr├¿me Mains 100 ml','Da-Derm Cr├¿me Mains 100 ml',10.22,50,'products/p28-da-derm-aloe-vera-karite-bio-creme-pour-les-mains--300x300.png','Corps','2026-08-08 16:19:01'),(29,'Clarenia Gel Eclaircissant Zones Intimes ÔÇô 100 ml','├ëclaircit la peau ┬À Nourrit et prot├¿ge ┬À ├ëlimine les t├óches sombres ┬À Formule 100% naturelle ┬À Non agressif ┬À Convient aux zones intimes ┬À Contenance de 100 ml ┬À R├®sultats visibles',29.70,50,'products/p29-clarenia-gel-eclaircissant-zones-intimes-100-ml-300x300.jpg','Corps','2026-08-08 16:19:01'),(30,'Vaseline Ultra Cr├¿me Dermique ÔÇô 100G','Tube 100g ┬À Hydratante ┬À Traitement d\'appoint ┬À L├®sions d\'irritations ┬À S├®cheresses cutan├®es ┬À Hydratation imm├®diate ┬À Soulagement instantan├® ┬À Protection durable',7.80,50,'products/p30-vaseline-ultra-creme-dermique-100g-300x300.jpg','Corps','2026-08-08 16:19:01'),(31,'Cytolnat Arthrogine Gel-Creme  50ml','Gel de massage pour les cartilages et articulations ┬À Optimise la sensation de d├®tente ┬À Appliquer sur une peau saine ┬À Masser par des mouvements circulaires ┬À P├®n├®tration totale du gel ┬À Renouveler l\'application si n├®cessaire ┬À Contenance de 50ml ┬À Marque CYTOLNAT',8.96,50,'products/p31-arthrogine-gel-creme-50ml-300x300.jpg','Corps','2026-08-08 16:19:01'),(32,'Vichy Cr├¿me D├®pilatoire Dermo Tol├®rance  150ml','Vichy cr├¿me d├®pilatoire ┬À Dermo tol├®rance ┬À Convient aux peaux sensibles ┬À Epilation douce, rapide et facile ┬À Elimine les poils ind├®sirables ┬À Minimise les risques dÔÇÖirritations ┬À R├®duit la repousse des poils ┬À A base dÔÇÖEau Thermale apaisante ┬À A lÔÇÖHuile dÔÇÖAmande adoucissante ┬À Contenance 150 ml',51.42,50,'products/p32-vichy-creme-depilatoire-dermo-tolerance-150ml-300x300.jpg','Corps','2026-08-08 16:19:01'),(33,'Cerave Lait Hydratant 236 ml','Cerave lait hydratant ┬À Pour peaux s├¿ches ├á tr├¿s s├¿ches ┬À Convient aux peaux sensibles ┬À Hydrate et prot├¿ge la peau ┬À Nourrit en profondeur ┬À Restaure la barri├¿re cutan├®e ┬À Texture cr├¿me l├®g├¿re non collante ┬À Visage et Corps ┬À Contenance 236ml',47.31,50,'products/p33-cerave-lait-hydratant-236-ml-2-300x300.png','Corps','2026-08-08 16:19:01'),(34,'Ecran Svr Sun Secure Blur Invisible Spf50 50ml','SVR SUN SECURE BLUR SPF50 ┬À Cr├¿me Solaire Haute protection ┬À Tous types de peaux ┬À Agit sur 100% des rayons ┬À Lisse et unifie le teint ┬À Texture mousse magique ┬À Base de maquillage ┬À Contenance 50 ml',59.91,50,'products/p34-enhanced-1778280174511-300x300.png','Solaire','2026-08-08 16:19:01'),(35,'La Roche Posay Anthelios Gel Creme Toucher Sec Invisible Anti Brillance Spf50+ 50ml','La roche posay Anthelios gel cr├¿me ┬À Toucher sec invisible anti brillance ┬À Spf50+ haute protection solaire ┬À Pour peaux mixtes ├á grasses ┬À Pour peaux sensibles et r├®actives ┬À Peaux intol├®rantes au soleil ┬À Prot├¿ge des rayons UV ┬À Effet matifiant anti-brillance ┬À R├®sistant ├á lÔÇÖeau et frottements ┬À Non com├®dog├¿ne, sans parfum ┬À Contenance 50 ml',68.05,50,'products/p35-anthelios-gel-creme-invisible-300x300.jpg','Solaire','2026-08-08 16:19:01'),(36,'Eucerin Pigment Control Fluid Spf 50 Solaire Anti Taches 50 ml','Tr├¿s haute protection solaire ┬À Pr├®vient et r├®duit lÔÇÖhyperpigmentation ┬À Emp├¬che la r├®apparition des taches ┬À Formule enrichie de Thiamidol et de filtres UVA/UVB ┬À Efficacement prot├¿ge la peau ┬À ├Ç utiliser quotidiennement ┬À Gel cr├¿me ┬À Contenance de 50 ml',63.01,50,'products/p36-eucerin-pigment-control-fluid-spf-50-solaire-anti-taches-50-ml-2-enhanced-1778504455669-300x300.png','Solaire','2026-08-08 16:19:01'),(37,'La Roche Posay Anthelios Gel Creme Toucher Sec Anti Brillance Teint├® Spf50+  50ml','La roche posay Anthelios gel cr├¿me ┬À Toucher sec anti brillance teint├® ┬À Spf50+ haute protection solaire ┬À Pour peaux mixtes ├á grasses ┬À Pour peaux sensibles et r├®actives ┬À Peaux intol├®rantes au soleil ┬À Prot├¿ge des rayons UV ┬À Effet matifiant anti-brillance ┬À R├®sistant ├á lÔÇÖeau et frottements ┬À Non com├®dog├¿ne, sans parfum ┬À Contenance 50 ml',68.05,50,'products/p37-anthelios-gel-creme-teinte-300x300.jpg','Solaire','2026-08-08 16:19:01'),(38,'Vichy Capital Soleil Soin Anti-Taches Teint├® 3-En-1 Spf50+ 50ml','Vichy CAPITAL SOLEIL Soin anti-taches ┬À Teint├® 3-en-1 SPF50+ ┬À Cr├¿me solaire teint├®e ┬À Unifie le teint imm├®diatement ┬À Corrige les taches, les marques ┬À Prot├¿ge contre les rayons UV ┬À SÔÇÖabsorbe rapidement ┬À Excellente base de maquillage ┬À Formule hypoallerg├®nique ┬À Contenance 50 ml',78.13,50,'products/p38-vichy-3-en-1-capital-soleil-teinte-spf50-300x300.webp','Solaire','2026-08-08 16:19:01'),(39,'Daylong Actinica Lotion, 80ml','Protection optimale ├á votre peau ┬À Pour visage et corps ┬À Tr├¿s haute protection contre les UVB et UVA SPF 50+ ┬À Pour pr├®venir des k├®ratoses actiniques ┬À Pour pr├®venir des cancers non-m├®lanome ┬À LÔÇÖefficacit├® a ├®t├® cliniquement prouv├® ┬À Une application par jour suffit g├®n├®ralement ┬À A renouveler en cas de baignade ┬À A renouveler apr├¿s une s├®ance de sport ┬À Forme : Lotion ┬À Texture : fluide et facile ├á ├®taler ┬À Contenance : 80 ml',81.91,50,'products/p39-daylong-actinica-lotion-80ml-300x300.jpg','Solaire','2026-08-08 16:19:01'),(40,'Ecran Vichy Capital Soleil Bb Emulsion Toucher Sec Teint├®e Spf 50  50ml','Vichy IDEAL SOLEIL BB ┬À Emulsion Toucher Sec Teint├®e SPF 50 ┬À Cr├¿me solaire teint├®e ┬À Pour peaux sensibles, mixtes ├á grasses ┬À Prot├¿ge des rayons UVA / UVB ┬À Illumine la peau imm├®diatement ┬À Unifie et matifie la peau ┬À Toucher sec teint├® ┬À Non com├®dog├¿ne ┬À Hypoallerg├®nique ┬À Contenance 50 ml',58.60,50,'products/p40-157F91-8-300x300.jpg','Solaire','2026-08-08 16:19:01'),(41,'Ecran Vichy Capital Soleil ├ëmulsion Toucher Sec Spf 50+, 50ml','<span style=\"font-weight: 400;\">Cr├¿me solaire pour peau mixte ├á grasse sensible</span> ┬À Syst├¿me filtrant large spectre UVA-UVB ┬À <span style=\"font-weight: 400;\">R├®sistant ├á lÔÇÖeau, aux frottements</span> ┬À <span style=\"font-weight: 400;\">Hypoallerg├®nique, non com├®dog├¿ne</span> ┬À Ne fait pas briller la peau',58.60,50,'products/p41-157F91-20-300x300.jpg','Solaire','2026-08-08 16:19:01'),(42,'Svr Sun Secure Brume Spf50+   200 ml','SVR SUN SECURE BRUME ┬À SPF50+ Haute protection ┬À Peaux hypersensibles ┬À Adultes & Enfants ┬À Visage & Corps ┬À Diffusion 360┬░ pratique ┬À Non gras, non collant ┬À Contenance 200 ml',72.33,50,'products/p42-svr-sun-secure-brume-spf50-200-ml-300x300.jpg','Solaire','2026-08-08 16:19:01'),(43,'Daylong Extr├¬me Lotion Solaire Spf50+ 100ml','Daylong extreme SPF 50+ ┬À Lotion liposomale ┬À Pour peaux tr├¿s sensibles ┬À Extra resistant ├á lÔÇÖeau et ├á la transpiration ┬À Sans parfum et sans colorant ┬À Une application par jour est suffisante ┬À Contient 100 ml',82.04,50,'products/p43-daylong-extreme-lotion-solaire-spf50-100ml-300x300.jpg','Solaire','2026-08-08 16:19:01'),(44,'Uriage Hys├®ac Fluide Spf 50+  50 ml','Protection solaire SPF 50+ ┬À Adapt├® aux peaux mixtes ├á grasses ┬À Texture non collante et non grasse ┬À Hydrate la peau ┬À Effet matifiant durable ┬À Pr├®vient lÔÇÖapparition de nouvelles imperfections ┬À Application toutes les 2 heures ┬À Sans paraben',44.87,50,'products/p44-uriage-hyseac-fluide-spf-50-50-ml-300x300.jpg','Solaire','2026-08-08 16:19:01'),(45,'Mustela Musti Eau De Soin 50ml','MUSTELA Musti Eau de Soin parfum├®e ┬À Pour la peau d├®licate et sensible ┬À Pour nourrissons, b├®b├®s et enfants ┬À Pour b├®b├®s sortis de n├®onatologie ┬À Parfume d├®licatement la peau ┬À Apporte une touche de fra├«cheur ┬À Extrait de camomille et de miel ┬À Notes dÔÇÖagrumes, de rose et de lilas ┬À Sans alcool ÔÇô Hypoallerg├®nique ┬À Sans paraben ÔÇô sans ph├®noxy├®thanol ┬À <label class=\"option-name\">Contenance 50 ml┬á</label>',43.32,50,'products/p45-musti-eau-de-soin-100ml-300x300.jpg','B├®b├® & Maman','2026-08-08 16:19:01'),(46,'Esthelle Calino Eau De Senteur 250 ml','Esthelle calino eau de senteur ┬À Respecte la peau sensible du b├®b├® ┬À Formul├® pour : Corps et cheveux ┬À (Ne pas appliquer sur le visage) ┬À Rafraichit et apaise la peau ┬À Parfume le cuir chevelu et le corps ┬À D├®veloppe lÔÇÖodorat du b├®b├® ┬À Facilite le coiffage des cheveux ┬À Sans alcool, Hypoallerg├®nique ┬À Notes fraiches & naturelles ┬À Contenance 250 ml',23.95,50,'products/p46-Sans-titre-2022-12-23T111757.493-300x300.jpg','B├®b├® & Maman','2026-08-08 16:19:01'),(47,'Biolane Gel Corps Et Cheveux 2En1 750ml','Biolane Gel Corps et Cheveux 2en1 350ml ┬À Ultra-pratique ┬À pour nettoyer en un seul geste ┬À Pour peau fragile et les cheveux fins des b├®b├®s et des enfants.',39.92,50,'products/p47-2-1-300x300.jpg','B├®b├® & Maman','2026-08-08 16:19:01'),(48,'Physiomer Mouche B├®b├® Avec Embout Et 5 Filtres Jetables','Physiomer Mouche B├®b├® Avec Embout Et 5 Filtres Jetables',18.30,50,'products/p48-physiomer-mouche-bebe-avec-embout-et-5-filtres-jetables-300x300.jpg','B├®b├® & Maman','2026-08-08 16:19:01'),(49,'Liquide Nettoyant Biberons ÔÇô Soins Essentiels  500 ml','Nettoyant biberons et accessoires b├®b├® ┬À ├ëlimine r├®sidus de lait et aliments ┬À Sans parfum, colorant, pH neutre ┬À Formule douce et biod├®gradable ┬À Bouchon s├®curis├®, format pratique ┬À Contenance : 500 mL',10.90,50,'products/p49-liquide-nettoyant-biberon-500-ml-300x300.webp','B├®b├® & Maman','2026-08-08 16:19:01'),(50,'Biolane Eau De Toilette Fra├«cheur 200ml','Biolane eau de toilette fra├«cheur 200ml ┬À Aide ├á rafra├«chir votre b├®b├® ├á tout moment de la journ├®e. ┬À Tr├¿s fleuri ┬À Sans alcool et ├á pH physiologique ┬À Ne pas vaporiser vers le visage',17.58,50,'products/p50-1-5-300x300.jpg','B├®b├® & Maman','2026-08-08 16:19:01'),(51,'Nuk Biberon Mickey First Choice  6-18 M 300 ml','Nuk Biberon Mickey First Choice  6-18 M 300 ml',24.03,50,'products/p51-nuk-biberon-mickey-first-choice-300-ml-300x300.jpg','B├®b├® & Maman','2026-08-08 16:19:01'),(52,'Milva Lingette Bebe 72P','Lingettes pour b├®b├® ┬À Douces et d├®licates ┬À Nettoient en douceur ┬À Sans parfum ┬À Hypoallerg├®niques ┬À Pratiques ├á utiliser ┬À Id├®ales pour la peau sensible ┬À Marque de confiance MILVA',4.32,50,'products/p52-MILVA-LINGETTE-BEBE-300x300.jpg','B├®b├® & Maman','2026-08-08 16:19:01'),(53,'Vital Lanorose  30 Gr','VITAL LANOROSE ┬À Prot├¿ge lÔÇÖar├®ole mammaire ┬À Soulage les mamelons douloureux ┬À Pr├®vient les crevasses ┬À Appliquer sur les mamelons irrit├®s ┬À Plusieurs fois par jour ┬À Avant et apr├¿s lÔÇÖallaitement, sans rin├ºage ┬À Contient de Lanoline extra pure ┬À Contient du Miel ┬À Contient de lÔÇÖHuile dÔÇÖolive ┬À Contient de lÔÇÖEau de fleur dÔÇÖoranger ┬À Tube de 35 gr',21.94,50,'products/p53-LANOROSE-creme-300x300.jpg','B├®b├® & Maman','2026-08-08 16:19:01'),(54,'Materna Bb Lingette Bt/72 Bleu','Lingettes pour b├®b├® ┬À Bo├«te de 72 lingettes ┬À Couleur bleu ┬À Marque Materna ┬À Douces et r├®sistantes ┬À Id├®ales pour la peau d├®licate des b├®b├®s ┬À Nettoient en douceur ┬À Pratiques et faciles ├á utiliser',6.62,50,'products/p54-MATERNA-BB-LINGETTE-BT_72-BLEU-300x300.jpg','B├®b├® & Maman','2026-08-08 16:19:01'),(55,'Nuk Sucette Sensitive Bleu 0-6M','Nuk Sucette Sensitive Bleu 0-6M',23.08,50,'products/p55-nuk-sucette-rosebleu-0-6m-300x300.jpg','B├®b├® & Maman','2026-08-08 16:19:01'),(56,'Profertil Female 28 Capsules + 28 Tablettes','Profertil Female 28 Capsules + 28 Tablettes',218.62,50,'products/p56-profertil-female-28-capsules-28-tablettes-enhanced-1778503154111-300x300.png','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(57,'Candys Gouttes   10 ml','Candys Gouttes   10 ml',3.95,50,'products/p57-candys-gouttes-10-ml-300x300.jpg','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(58,'Aktiv Zinc+Histidine+Vitamine C  30 Comprim├®s','AKTIV ZINC+HISTIDINE+VITAMINE C ┬À De la marque Doppelherz ┬À Compl├®ment alimentaire indispensable ┬À A prendre en cure dÔÇÿun mois renouvelables ┬À 1 Comprim├® par jour ┬À Renforce le syst├¿me immunitaire ┬À Ralentit le vieillissement cellulaire ┬À R├®v├¿le lÔÇÖ├®clat de la peau ┬À Traite les probl├¿me de peaux ( acn├® ) ┬À Renforce les cheveux et les ongles ┬À Boite de 30 comprim├®s',34.28,50,'products/p58-aktiv-zinchistidinevitamine-c-30-comprimes-enhanced-1778501499900-300x300.png','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(59,'Biohealth Mare Mag  60 G├®lules','Biohealth Mar├® Mag ┬À Compl├®ment alimentaire ┬À Aide au bon fonctionnement du syst├¿me nerveux ┬À Garde les fonctions musculaires normales ┬À Garde les fonctions psychologiques normales ┬À Une g├®lule couvre 42% de vos besoins journaliers ┬À Contient du Magn├®sium et la vitamine B6 ┬À Prendre une ├á deux g├®lules par jour ┬À Boite de 60 g├®lules',24.66,50,'products/p59-mare-mag-biohealth-60-gelules-300x300.jpg','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(60,'Aktiv Az Action Durable  30 Comprim├®s','Aktiv Az Action Durable  30 Comprim├®s',31.76,50,'products/p60-aktiv-a-z-action-durable-30-comprimes-enhanced-1778502152839-300x300.png','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(61,'Lo.Li.Pharma Andrositol  30 Sachets Loli Pharma','Lo.Li.Pharma Andrositol  30 Sachets Loli Pharma',113.88,50,'products/p61-andrositol-30-sachets-300x300.jpg','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(62,'Aktiv Omega-3 Marin 60 Capsules','Aktiv Omega-3 Marin 60 Capsules',48.64,50,'products/p62-aktiv-omega-3-marin-60-capsules-enhanced-1778502460964-300x300.png','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(63,'Aktiv Magnesium Et Vitamines  30 Comprim├®s','Aktiv Magnesium Et Vitamines  30 Comprim├®s',29.37,50,'products/p63-aktiv-magnesium-vitamines-30-comprimes-enhanced-1778498641803-300x300.jpg','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(64,'Aktiv Vital Yeux+Om├®ga-3  30 G├®lules','Aktiv Vital Yeux+Om├®ga-3  30 G├®lules',42.25,50,'products/p64-vital-yeuxomega-3-30-gelules-enhanced-1778501420535-300x300.png','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(65,'Promotil Mforte 30 Stickers','Promotil MForte ┬À Un compl├®ment alimentaire ├á base de L-Carnitine, L-Arginine, Vitamines, Min├®raux et Coenzyme Q10 ┬À Sp├®cialement con├ºu pour les hommes d├®sirant concevoir un enfant. ┬À Booste la fertilit├® des hommes ┬À Am├®liore la quantit├® et la qualit├® du sperme',119.90,50,'products/p65-promotil-mforte-30-stickers-enhanced-1778528889321-300x300.png','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(66,'2X Optalux 28 Capsules + 1 Offert','2X Optalux 28 Capsules + 1 Offert',98.00,50,'products/p66-2-300x300.jpg','Compl├®ments Alimentaires','2026-08-08 16:19:01'),(67,'Compresse Kingflex 40*40','Compresses st├®riles ┬À Toile de gaze en coton blanchi ┬À Hydrophile 17 fils/cm2 ┬À Sachet individuel ┬À St├®rilis├®es ├á la vapeur ┬À Normes de la pharmacop├®e europ├®enne ┬À Utilisation en milieu hospitalier et en pharmacie ┬À Diff├®rentes dimensions et pliages',7.07,50,'products/p67-compresse-kingflex-4040-300x300.jpg','Mat├®riel M├®dical','2026-08-08 16:19:01'),(68,'Compresse Kingflex 30*30','Compresses st├®riles en gaze de coton ┬À Hydrophile et blanchi ┬À Contr├┤l├®es selon normes pharmacop├®e europ├®enne ┬À Utilisation en milieu hospitalier et en pharmacie ┬À Disponibles en diff├®rentes dimensions ┬À Sachets individuels st├®rilis├®s ├á la vapeur ┬À Toile de gaze en coton 17 fils/cm2 ┬À Marque KINGFLEX',4.40,50,'products/p68-compresse-kingflex-3030-300x300.jpg','Mat├®riel M├®dical','2026-08-08 16:19:01'),(69,'Compresse Kingflex 20*20','Compresses st├®riles ┬À Toile de gaze en coton ┬À Hydrophile ┬À 17 fils/cm2 ┬À Sachet individuel ┬À St├®rilis├®es ├á la vapeur ┬À Utilisation en milieu hospitalier ┬À Disponible en diff├®rentes dimensions',2.44,50,'products/p69-compresse-kingflex-300x300.jpg','Mat├®riel M├®dical','2026-08-08 16:19:01'),(70,'Compresse 20*20 Mega 16 Plis','COMPRESSE 20*20 MEGA 16 PLIS ┬À Marque MEGAPLAST ┬À Haute qualit├® ┬À R├®sistant et durable ┬À Grande capacit├® dÔÇÖabsorption ┬À Facile ├á utiliser ┬À Parfait pour les professionnels ┬À Id├®al pour les grandes surfaces',2.15,50,'products/p70-compresse-2020-mega-16-plis-300x300.webp','Mat├®riel M├®dical','2026-08-08 16:19:01'),(71,'Test De Grossesse Acon Stylo','Test de grossesse stylo ┬À Mesure l\'hormone de grossesse ┬À Sensibilit├® ├®lev├®e ┬À Fiabilit├® garantie ┬À Utilisation in vitro ┬À Marque ACON ┬À R├®f├®rence 6921756425135 ┬À Test d\'autodiagnostic',5.67,50,'products/p71-11111-300x300.png','Mat├®riel M├®dical','2026-08-08 16:19:01'),(72,'Compresse 40*40 Mega 16 Plis','COMPRESSE 40*40 MEGA 16 PLIS ┬À Marque MEGAPLAST ┬À Haute qualit├® ┬À R├®sistant et durable ┬À Grande capacit├® dÔÇÖabsorption ┬À Facile ├á utiliser ┬À Id├®al pour le nettoyage ┬À Format pratique',5.78,50,'products/p72-COMPRES-40_40-MEGA-16-PLIS-300x300.jpg','Mat├®riel M├®dical','2026-08-08 16:19:01'),(73,'Accu-Chek Performa Bandelettes  50 Bandelettes','Bandelettes de test ┬À Marque : ACCU-CHEK ┬À 50 bandelettes ┬À Autosurveillance glyc├®mique ┬À Absorption instantan├®e ┬À R├®sultats en 5 secondes ┬À Plage de temp├®rature : 8┬░C ├á 44┬░C ┬À Conservation entre 2┬░C et 30┬░C',41.99,50,'products/p73-1-300x300.png','Mat├®riel M├®dical','2026-08-08 16:19:01'),(74,'On Call Plus Bandelette Bt 50Pcs','Facilit├® dÔÇÖapplication du sang ┬À Action dÔÇÖabsorption efficace ┬À Bandelettes de test abordables ┬À Tests fr├®quents possibles ┬À Pour glucom├¿tre On Call Plus ┬À Flacon de 50 bandelettes ┬À Marque ACON ┬À R├®f├®rence 682607535217',35.84,50,'products/p74-22222-300x300.png','Mat├®riel M├®dical','2026-08-08 16:19:01'),(75,'On Call Vivid Bandelette Bt 50Pcs','Facilit├® dÔÇÖapplication du sang ┬À Action dÔÇÖabsorption efficace ┬À Bandelettes de test abordables ┬À Flacon pratique pour les tests fr├®quents ┬À Marque ACON ┬À On Call Vivid Bandelette Bt 50pcs ┬À Qualit├® garantie ┬À R├®sultats pr├®cis',40.32,50,'products/p75-33333-300x300.png','Mat├®riel M├®dical','2026-08-08 16:19:01'),(76,'Beurer Amplificateur Auditif Ha 50','Discret et pratiquement invisible ┬À Zone de fr├®quence ├®largie ┬À Adaptation id├®ale ├á tous les conduits auditifs ┬À Id├®al pour les personnes avec une d├®ficience auditive ┬À Amplifie le volume de tous les sons en int├®rieur et ext├®rieur ┬À Rendu peu bruyant ┬À 3 embouts pour s\'adapter ├á chaque conduit auditif ┬À Plage de fr├®quences de 100 ├á 6 000 Hz',91.24,50,'products/p76-beurer-ha-50-amplificateur-auditif-300x300.jpg','Mat├®riel M├®dical','2026-08-08 16:19:01'),(77,'50 X Alcool Pad Lingette De Pr├®-Injection 70% Alcool ÔÇô Polypharma','Lingettes de pr├®injection (60*30 mm) ┬À Imbib├®es dÔÇÖalcool 70% destin├®es : ┬À Soin des plaies superficielles peu ├®tendues ┬À D├®sinfection cutan├®e avant injection et pr├®l├¿vement',7.47,50,'products/p77-Protection-solaire-personne-agee-300x300.jpg','Mat├®riel M├®dical','2026-08-08 16:19:01');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `rating` tinyint(3) unsigned NOT NULL DEFAULT 5,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_reviews_product` (`product_id`),
  KEY `fk_reviews_user` (`user_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@ecommerce.com','$2b$10$Detze.sK4STWK661VBcS0uk/PKuEHo.mqK.Q343r86TcwShm0cvX2','admin','2026-08-08 13:22:58'),(2,'Mouin','mouin@ecommerce.com','$2b$10$Lq1a.eDgnIl0Z7y4r3kxReL1V2h/9dJWCPJxUAdwD9c79L1pfpAcC','user','2026-08-08 13:22:58');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wishlist` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist_user_product` (`user_id`,`product_id`),
  KEY `fk_wishlist_product` (`product_id`),
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'ecommerce'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-11 19:55:46
