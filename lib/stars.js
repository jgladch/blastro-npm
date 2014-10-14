// The star catalog object and selection of stars from Stéphane Macrez

// Copyright Ole Nielsen 2002-2003, Peter Hayes 1999-2001
// Please read copyright notice in index.html source

function starcat(star,cons,name,ra,de,mg,type,spec) {
  this.star = star;
  this.cons = cons;
  this.name = name;
  this.ra = ra;
  this.de = de;
  this.mg = mg;
  this.type = type;
  this.spec = spec;
}

// The star catalogue is a modified version of Peter's original catalogue
// Stars added: a Gru, a Hya, s SGR, l VEL (4 missing Vixen SS2K ref. stars), g AND
// Corrected: Capella is a AUR, not z AUR (all data replaced), g DRA: Rastaban -> Eltanin, a CET: Mekab -> Menkar, e PEG: Eniph -> Enif,
// a Psc: Kaitain -> Alrisha,
// Several stars deleted
// Epoch J2000.0 for added stars

var stars = new Array(
  new starcat("alp","AND","Alpheratz","00:08:23","+29:05:00","207","SD","B8"),
  new starcat("gam","AND","Almach","02:03:54","+42:19:47","210","SD","K3"),
  new starcat("alp","AQL","Altair","19:50:47","+08:52:00","075","SD","A7"),
  new starcat("alp","AQR","Sadalmelik","22:05:47","-00:19:00","293","SS","G2"),
  new starcat("del","AQR","Skat","22:54:39","-15:49:00","327","SS","A3"),
  new starcat("alp","ARI","Hamal","02:07:10","+23:27:00","201","SS","K2"),
  new starcat("alp","AUR","Capella","05:16:41","+45:59:53","008","SD","G0+G5"),
  new starcat("alp","BOO","Arcturus","14:15:40","+19:11:00","-11","SS","K2"),
  new starcat("bet","BOO","Nekkar","15:01:57","+40:23:00","349","SS","G8"),
  new starcat("del","CAP","Deneb Algiedi","21:47:02","-16:08:00","283","SD","A"),
  new starcat("alp","CAR","Canopus","06:23:57","-52:41:00","-72","SS","F0"),
  new starcat("alp","CAS","Schedar","00:40:31","+56:32:00","222","SD","K0"),
  new starcat("alp","CEN","Rigil Kentaurus","14:39:36","-60:50:00","033","SD","G2"),
  new starcat("alp","CEP","Alderamin","21:18:35","+62:35:00","244","SD","A7"),
  new starcat("gam","CEP","Alrai","23:39:20","+77:37:00","322","SS","K1"),
  new starcat("alp","CET","Menkar","03:02:17","+04:06:00","252","SS","M2"),
  new starcat("bet","CET","Diphda","00:43:35","-17:59:00","203","SS","K1"),
  new starcat("omi","CET","Mira","02:19:21","-02:59:00","200","SD","M6"),
  new starcat("alp","CMA","Sirius","06:45:09","-16:43:00","-146","SD","A1"),
  new starcat("eps","CMA","Adara","06:58:38","-28:58:00","150","SD","B2"),
  new starcat("alp","CMI","Procyon","07:39:18","+05:14:00","036","SD","F5"),
  new starcat("alp","COL","Phakt","05:39:39","-34:05:00","263","SD","B8"),
  new starcat("alp","CRA","Alkes","19:09:28","-37:55:00","410","SS","A2"),
  new starcat("alp","CRB","Alphecca","15:34:41","+26:43:00","223","SS","A0"),
  new starcat("alp1","CRU","Acrux","12:26:36","-63:06:00","080","SD","B2"),
  new starcat("alp2","CVN","Cor Caroli","12:56:02","+38:19:00","288","SD","B9"),
  new starcat("alp","CYG","Deneb","20:41:26","+45:16:00","125","SD","A2"),
  new starcat("bet","CYG","Albireo","19:30:43","+27:58:00","305","SD","K3"),
  new starcat("alp","DEL","Svalocin","20:39:39","+15:55:00","377","SD","B9"),
  new starcat("alp","DRA","Thuban","14:04:24","+64:22:00","365","SS","A0"),
  new starcat("gam","DRA","Eltanin","17:56:36","+51:29:00","223","SD","K5"),
  new starcat("alp","ERI","Achernar","01:37:42","-57:15:00","049","SS","B5"),
  new starcat("gam","ERI","Zaurak","03:58:02","-13:31:00","295","SD","M0"),
  new starcat("bet","GEM","Pollux","07:45:19","+28:01:00","115","SD","K0"),
  new starcat("alp","GRU","Al Na'ir","22:08:14","-46:57:40","173","SD","B7"),
  new starcat("bet","HER","Kornephoros","16:30:13","+21:29:00","278","SS","G8"),
  new starcat("alp","HYA","Alphard","09:27:35","-08:39:31","198","SS","K3"),
  new starcat("alp","LEO","Regulus","10:08:22","+11:58:00","135","SD","B7"),
  new starcat("bet","LEO","Denebola","11:49:04","+14:34:00","213","SD","A3"),
  new starcat("alp","LEP","Arneb","05:32:44","-17:50:00","258","SD","F0"),
  new starcat("bet","LIB","Zuben el Chamali","15:17:00","-09:23:00","261","SS","B8"),
  new starcat("alp","LYR","Vega","18:36:56","+38:47:00","004","SD","A0"),
  new starcat("alp","OPH","Ras Alhague","17:34:56","+12:34:00","207","SS","A5"),
  new starcat("eta","OPH","Sabik","17:10:23","-15:43:29","243","SD","A2"),
  new starcat("alp","ORI","Betelgeuse","05:55:10","+07:24:00","080","SD","M2"),
  new starcat("bet","ORI","Rigel","05:14:32","-08:12:00","015","SD","B8"),
  new starcat("alp","PEG","Markab","23:04:46","+15:12:00","250","SS","B9"),
  new starcat("eps","PEG","Enif","21:44:11","+09:53:00","240","SD","K2"),
  new starcat("alp","PER","Mirfak","03:24:20","+49:51:00","180","SS","F5"),
  new starcat("bet","PER","Algol","03:08:11","+40:57:00","215","SD","B8"),
  new starcat("alp","PSA","Fomalhaut","22:57:39","-29:37:00","115","SS","A3"),
  new starcat("alp","PSC","Alrisha (Kaitain)","02:02:02","+02:46:00","433","SD","A"),
  new starcat("alp","SCO","Antares","16:29:25","-26:26:00","108","SD","M1"),
  new starcat("lam","SCO","Shaula","17:33:36","-37:06:00","162","SS","B1"),
  new starcat("alp","SER","Unukalhay","15:44:17","+06:25:00","265","SD","K2"),
  new starcat("sig","SGR","Nunki","18:55:15","-26:17:48","202","SD","B2"),
  new starcat("alp","TAU","Aldebaran","04:35:55","+16:30:00","086","SD","K5"),
  new starcat("bet","TAU","Alnath","05:26:17","+28:36:00","165","SS","B7"),
  new starcat("alp","UMA","Dubhe","11:03:44","+61:45:00","179","SD","K0"),
  new starcat("zet","UMA","Mizar","13:23:56","+54:56:00","227","SD","A2"),
  new starcat("alp","UMI","Polaris","02:31:13","+89:15:00","204","SD","F8"),
  new starcat("bet","UMI","Kocab","14:50:43","+74:09:00","207","SS","K4"),
  new starcat("lam","VEL","Suhail","09:08:00","-43:25:57","221","SD","K4"),
  new starcat("alp","VIR","Spica","13:25:11","-11:09:00","097","SS","B1"),
  new starcat("eps","VIR","Vindemiatrix","13:02:11","+10:58:00","283","SS","G9")
);


// the Deep Sky Object

function dsocat(numb,cons,name,ra,de,mg,type,spec) {
  this.numb = numb;
  this.cons = cons;
  this.name = name;
  this.ra = ra;
  this.de = de;
  this.mg = mg;
  this.type = type;
  this.spec = spec;
}

// Deep sky catalogue.
// Positions are Epoch J2000 from Revised NGC/IC catalogue (W. Steinicke)
// Magnitudes from SAC v7.2 (Globular magnitudes from Rev. NGC/IC)

var dso = new Array(
  new dsocat("M1","TAU","Crab Neb.","05:34:32","+22:00:52","840","SNR",""),
  new dsocat("M2","AQR","","21:33:27","-00:49:24","650","GC",""),
  new dsocat("M3","CVN","","13:42:11","+28:22:32","620","GC",""),
  new dsocat("M4","SCO","","16:23:36","-26:31:31","560","GC",""),
  new dsocat("M5","SER","","15:18:34","+02:04:58","570","GC",""),
  new dsocat("M6","SCO","Butterfly Cl.","17:40:21","-32:15:15","400","OC",""),
  new dsocat("M7","SCO","","17:53:51","-34:47:34","330","OC",""),
  new dsocat("M8","SGR","Lagoon Neb.","18:03:41","-24:22:49","500","BN",""),
  new dsocat("M9","OPH","","17:19:12","-18:30:59","770","GC",""),
  new dsocat("M10","OPH","","16:57:09","-04:05:58","660","GC",""),
  new dsocat("M11","SCT","Wild Duck Cl.","18:51:06","-06:16:00","580","OC",""),
  new dsocat("M13","HER","Hercules Cl.","16:41:42","+36:27:37","580","GC",""),
  new dsocat("M14","OPH","","17:37:36","-03:14:45","760","GC",""),
  new dsocat("M15","PEG","","21:29:58","12:10:01","620","GC",""),
  new dsocat("M16","SER","Eagle Neb.","18:18:48","-13:47:00","600","OC+BN",""),
  new dsocat("M19","OPH","","17:02:38","-26:16:05","720","GC",""),
  new dsocat("M22","SGR","","18:36:24","-23:54:12","510","GC",""),
  new dsocat("M24","SGR","","18:16:42","-18:40:00","310","OC",""),
  new dsocat("M27","VUL","Dumbbell Neb.","19:59:36","+22:43:16","730","PN",""),
  new dsocat("M29","CYG","","20:23:54","+38:32:00","660","OC",""),
  new dsocat("M30","CAP","","21:40:22","-23:10:45","720","GC",""),
  new dsocat("M31","AND","Andromeda Gal.","00:42:44","+41:16:06","340","GAL",""),
  new dsocat("M33","TRI","Triangulum Gal.","01:33:52","+30:39:27","570","GAL",""),
  new dsocat("M34","PER","","02:42:05","+42:45:42","520","OC",""),
  new dsocat("M35","GEM","","06:08:12","+24:22:00","510","OC",""),
  new dsocat("M36","AUR","","05:36:18","+34:18:27","600","OC",""),
  new dsocat("M39","CYG","","21:31:42","+48:26:00","460","OC",""),
  new dsocat("M41","CMA","","06:46:00","-20:45:15","450","OC",""),
  new dsocat("M42","ORI","Orion Neb.","05:35:15","-05:23:25","400","BN",""),
  new dsocat("M44","CNC","Beehive","08:39:57","+19:40:21","310","OC",""),
  new dsocat("M45","TAU","Pleiades","03:47:00","+24:07:00","120","OC",""),
  new dsocat("M46","PUP","","07:41:47","-14:48:36","610","OC",""),
  new dsocat("M48","HYA","","08:13:43","-05:45:02","580","OC",""),
  new dsocat("M49","VIR","","12:29:46","+07:59:57","840","GAL",""),
  new dsocat("M50","MON","","07:02:30","-08:23:00","590","OC",""),
  new dsocat("M51","CVN","Whirlpool Gal.","13:29:53","47:11:42","840","GAL",""),
  new dsocat("M52","CAS","","23:24:51","+61:36:23","690","OC",""),
  new dsocat("M53","COM","","13:12:55","+18:10:09","770","GC",""),
  new dsocat("M54","SGR","","18:55:03","-30:28:42","770","GC",""),
  new dsocat("M55","SGR","","19:39:59","-30:57:44","630","GC",""),
  new dsocat("M57","LYR","Ring Nebula","18:53:35","+33:01:45","940","PN",""),
  new dsocat("M60","VIR","","12:43:40","+11:33:09","980","GAL",""),
  new dsocat("M61","VIR","","12:21:55","+04:28:20","1010","GAL",""),
  new dsocat("M62","OPH","","17:01:13","-30:06:44","650","GC",""),
  new dsocat("M64","COM","Blackeye Gal.","12:56:44","+21:40:57","850","GAL",""),
  new dsocat("M66","LEO","","11:20:15","+12:59:22","890","GAL",""),
  new dsocat("M67","CNC","","08:50:48","+11:49:00","690","OC",""),
  new dsocat("M68","HYA","","12:39:28","-26:44:34","780","GC",""),
  new dsocat("M70","SGR","","18:43:13","-32:17:31","790","GC",""),
  new dsocat("M72","AQR","","20:53:28","-12:32:13","930","GC",""),
  new dsocat("M74","PSC","","01:36:42","+15:46:58","940","GAL",""),
  new dsocat("M75","SGR","","20:06:05","-21:55:17","850","GC",""),
  new dsocat("M76","PER","Little Dumbb.","01:42:18","+51:35:00","1100","PN",""),
  new dsocat("M77","CET","","02:42:41","-00:00:48","890","GAL",""),
  new dsocat("M78","ORI","","05:46:48","+00:05:00","800","BN",""),
  new dsocat("M79","LEP","","05:24:11","-24:31:27","840","GC",""),
  new dsocat("M81","UMA","Bode's Galaxy","09:55:34","+69:04:00","690","GAL",""),
  new dsocat("M83","HYA","S. Pinwheel","13:37:00","-29:52:04","750","GAL",""),
  new dsocat("M85","COM","","12:25:25","+18:11:26","910","GAL",""),
  new dsocat("M87","VIR","Virgo A","12:30:49","+12:23:24","860","GAL",""),
  new dsocat("M92","HER","","17:17:07","+43:08:11","650","GC",""),
  new dsocat("M93","PUP","","07:44:29","-23:51:11","620","OC",""),
  new dsocat("M94","CVN","","12:50:54","+41:07:09","820","GAL",""),
  new dsocat("M96","LEO","","10:46:46","+11:49:10","1010","GAL",""),
  new dsocat("M97","UMA","Owl Nebula","11:14:48","+55:01:08","1100","PN",""),
  new dsocat("M100","COM","","12:22:55","+15:49:20","1010","GAL",""),
  new dsocat("M101","UMA","Pinwheel Gal.","14:03:12","+54:20:56","820","GAL",""),
  new dsocat("M103","CAS","","01:33:22","+60:39:29","740","OC",""),
  new dsocat("M104","VIR","Sombrero Gal.","12:39:59","-11:37:23","800","GAL",""),
  new dsocat("M106","CVN","","12:18:58","+47:18:23","910","GAL",""),
  new dsocat("M107","OPH","","16:32:32","-13:03:13","790","GC",""),
  new dsocat("M109","UMA","","11:57:36","+53:22:31","980","GAL",""),
  new dsocat("NGC 246","CET","","00:47:01","-11:52:37","850","PN",""),
  new dsocat("NGC 253","SCL","Sculptor Gal.","00:47:33","-25:17:17","720","GAL",""),
  new dsocat("NGC 292","TUC","Sm Magellanic Cld","00:52:38","-72:48:01","230","GAL",""),
  new dsocat("NGC 300","SCL","","00:54:53","-37:40:57","810","GAL",""),
  new dsocat("NGC 869","PER","Double Cluster","02:19:06","+57:08:00","530","OC",""),
  new dsocat("NGC 891","AND","","02:22:33","+42:20:48","990","GAL",""),
  new dsocat("NGC 1097","FOR","","02:46:19","-30:16:21","950","GAL",""),
  new dsocat("NGC 1232","ERI","","03:09:45","-20:34:51","990","GAL",""),
  new dsocat("NGC 1535","ERI","","04:14:14","-12:44:29","1040","PN",""),
  new dsocat("LMC","DOR","Lg Magellanic Cld","05:23:34","-69:45:22","040","GAL",""),
  new dsocat("NGC 2237","MON","Rosette Neb.","06:30:54","+05:03:00","550","BN",""),
  new dsocat("NGC 2392","GEM","Eskimo Neb.","07:29:11","+20:54:43","860","PN",""),
  new dsocat("NGC 2403","CAM","","07:36:55","+65:35:58","850","GAL",""),
  new dsocat("NGC 2841","UMA","","09:22:02","+50:58:30","920","GAL",""),
  new dsocat("NGC 2903","LEO","","09:32:10","+21:30:02","900","GAL",""),
  new dsocat("NGC 3132","VEL","Eight-Burst Neb.","10:07:01","-40:26:00","820","PN",""),
  new dsocat("NGC 3242","HYA","Ghost of Jupiter","10:24:46","-18:38:14","860","PN",""),
  new dsocat("NGC 3372","CAR","Eta Carinae Neb.","10:45:08","-59:52:00","300","BN",""),
  new dsocat("NGC 3521","LEO","","11:05:49","-00:02:14","900","GAL",""),
  new dsocat("NGC 4038","CRV","The Antennae","12:01:53","-18:51:54","1030","GAL",""),
  new dsocat("NGC 4565","COM","","12:36:21","+25:59:19","960","GAL",""),
  new dsocat("NGC 5128","CEN","Centaurus A","13:25:29","-43:00:59","680","GAL",""),
  new dsocat("NGC 5139","CEN","Omega Centauri","13:26:47","-47:28:53","370","GC",""),
  new dsocat("NGC 5907","DRA","","15:15:53","+56:19:33","1030","GAL",""),
  new dsocat("NGC 6397","ARA","","17:40:41","-53:40:25","570","GC",""),
  new dsocat("NGC 6543","DRA","Cat's Eye Neb.","17:58:33","+66:37:59","830","PN",""),
  new dsocat("NGC 6744","PAV","","19:09:45","-63:51:21","830","GAL",""),
  new dsocat("NGC 6752","PAV","","19:10:52","-59:58:55","540","GC",""),
  new dsocat("NGC 6781","AQL","","19:18:27","+06:32:31","1180","PN",""),
  new dsocat("NGC 6826","CYG","Blinking Pl.","19:44:51","+50:31:20","880","PN",""),
  new dsocat("NGC 6946","CYG","","20:34:52","+60:09:15","880","GAL",""),
  new dsocat("NGC 6960","CYG","Veil Neb. (West)","20:45:42","+30:43:00","700","SNR",""),
  new dsocat("NGC 7129","CEP","","21:43:00","+66:07:00","1150","BN",""),
  new dsocat("NGC 7293","AQR","Helix Neb.","22:29:38","-20:50:13","630","PN",""),
  new dsocat("NGC 7331","PEG","","22:37:05","+34:25:10","950","GAL",""),
  new dsocat("NGC 7662","AND","Blue Snowball","23:25:54","+42:32:30","860","PN",""),
  new dsocat("NGC 7793","SCL","","23:57:49","-32:35:23","910","GAL","")
);

