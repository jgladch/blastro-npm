// Javascript Astrotools
// FUNCTIONS FOR CREATING CHARTS

// Copyright Ole Nielsen 2002-2004
// Please read copyright notice in astrotools2.html source


SUNLIGHT = 0; PLANETLIGHT = 1; MOONLIGHT = 5;	// indices 2-4 no longer used

// first array stores colours used for visibility diagrams
// as RGB triplets of value RRGGBB, eg. #f60 means red=FF, green=66, blue=00 (orange colour)
var light = new Array();
light[SUNLIGHT] = ["#ccd","#88f","#44c","#00a","#000"];
light[PLANETLIGHT] = ["#eef","#8b8","#0b0","#0d0","#0f0"];
light[MOONLIGHT]= ["#eef","#bb9","#cc4","#ee0","#ff0"];
// light[MOONLIGHT]= ["#eef","#cc8","#bb0","#dd0","#ff0"];

var psyms = new Array("psym1.png","psym2.png","psym3.png","psym4.png","psym5.png","psym6.png","psym7.png","psym8.png","","psymsol.png","psymmoon.png","","","","","psym.png","","","","","psym.png");

var head1="<!doctype html public \"-//w3c//dtd html 4.0 transitional//en\">\n<HTML><HEAD><TITLE>";
var head3="</TITLE><style>\nbody {font: \"ariel\";}" +
	".lbl {position:absolute;font-size:11px;margin:0;padding:0;font:\"ariel\";}\n</style></HEAD>" +
	"<BODY><center><p><A HREF=\"javascript:window.close()\">close window</A></p>";


function box(x,y,w,h,bgr) {	// draw box with background parameter (colour and/or url as CSS)
	var str="<div style=\"position:absolute; left: " + x + "; top:" + y + "; width:" + w;  
	str += ";height:" + h + ";background:"+bgr+";font-size:2px;\"></div>";
	// the 'font-size' parameter needed due to IE6 bug for small boxes
	return str;
}

function writexlbl(leftoff,topoff,lbl,lblpos,xlbl,xpos) {	// write x-axis labels
	var str = "<p class=\"lbl\" style=\"position:absolute; left:"+(leftoff+xpos)+"; top:"+(topoff-34)+";\">"+xlbl+"</p>";
	for (var i=0; i<lbl.length; i++) {
		str += "<p class=\"lbl\" style=\"position:absolute; left:"+(leftoff+lblpos[i])+"; top:"+(topoff-18)+";\">"+lbl[i]+"</p>";
	}
	return str;
}

function txt_lft(x,y,s) {	// left adjusted text
	return "<p class=\"lbl\" style=\"left:" + x + "; top:"+ y + "\">" + s + "</p>";
}

function txt_rgt(x,y,w,rpad,s) {	// right adjusted text, w is necessary width, rpad space from right
	var str = "<div style=\"position:absolute; left:" + x + "; top:" + y + "; width:" + w + ";height:20;\">";
	str += "<p class=\"lbl\" style=\"right:"+rpad+"; text-align:right\">" + s + "</p></div>\n";
	return str;
}

function combineEvents(obj, jday, obs, transit) {
// Combines events of Sun and chosen object into a single array
// Comprises times as fractions of a day from jday and indices into 'lights' arrays
// last two entries store transit times in first index (-1 if not valid)
	var sunevents = findEvents(SUN,jday,obs);	// first entry is state at t=0;
	var objevents = findEvents(obj,jday,obs);	// same here
	var events = new Array();
	var k = 0; var i=1; var n = 1;	// counters for events and objevents arrays
	var tr = [-1,-1]; var trcnt=0;	// remember up to two transit times
	var twl = sunevents[0][1];	// kind of twilight
	var up = (objevents[0][1]==0);	// true if object is up
	var otype = (up && (obj!=SUN)) ? (obj==MOON?MOONLIGHT:PLANETLIGHT) : SUNLIGHT;
	events[k++] = new Array(sunevents[i][0],otype,twl);
	while (true) {
		var to = objevents[n][0]; var ts = sunevents[i][0]
		while ((ts = sunevents[i][0]) < to) {
			if (sunevents[i][1] == 0) {	// skip Sun transit
				i++;
				continue;
			}
			twl = sunevents[i][1];
			twl = (twl<0 ? -twl-1 : twl);
			events[k++] = new Array(ts,otype,twl);
			i++;
		}
		if (to >= 1.0) break;
		if (objevents[n][1]==0) {	// check for object transit
			tr[trcnt++] = to; 	
			n++;
			continue;
		}
		up = !up;	// object event must be rise or set
		otype = (up && (obj!=SUN)) ? (obj==MOON?MOONLIGHT:PLANETLIGHT) : SUNLIGHT;
		events[k++] = new Array(to,otype,twl);
		n++;
	}
	events[k] = new Array(1.0, -1, -1);
	events[k+1] = new Array(tr[0],0,0); events[k+2] = new Array(tr[1],0,0);
	return events;
}		// end combineEvents()


function makeBar(obs, obj, jday, transit,x,y) {
	var str="";
	var events = combineEvents(obj, jday, obs, transit);
	var el = events.length;
	var len = 480;		// = 3 min per pixel
	var h = 13;
	var l1 = 0; var l;
	for (var i = 0; i < el-3; i++) {
		l = Math.round( events[i+1][0]*len );
		if (l-l1>0) str += box(x+l1,y+1,(l-l1),h,light[events[i][1]][events[i][2]]);
		l1 = l;
	}
	for (var j=0;j<2;j++) { // plot red markers for transits
		if (transit && events[el-2+j][0] >= 0) str += box(x+events[el-2+j][0]*len,y+1,1,h,"#f00");
	}
	return str;
}		// end makeBar()


// function nextDate(obs1,dstep,origday) *** moved to makelist.js


function doVisibility(obs,obj,dspan,dstep,transit) {
// Create visibility diagrams for one object
	// obs is a reference variable, make a copy
	var obscopy=new Object(); var obsmax=new Object();
	for (var i in obs) {obscopy[i] = obs[i];  obsmax[i] = obs[i]; }
	if (dstep<1.0) dstep=1.0;
	obscopy.hours=12; obscopy.minutes=0;	// graphics only allows for 12:00
	var pwin=window.open("","moonlight","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var str = head1 + "Javascript: Visibility" + head3 + "\n<h2>Visibility</h2><h3>of "+bodies[obj].name+"</h3>";
	str += "<p>Observer location: "+sitename() + " (UT "+hmstring(-obs.tz/60.0,true)+")</p>\n";
	nextDate(obsmax, dspan, obs.day);	// 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	var jday=jd(obscopy);
	var tmax = Math.floor((jdmax-jday)/dstep);	// how many lines?
	if (dstep<0) tmax = Math.floor(dspan/dstep);
	var leftoff=130; var topoff=30;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15*tmax+50) + "; width:700;\">";
	str += box(leftoff-1,topoff,482,15*tmax+2,"#aaa url(hourline.png)");
	var lbl = ["12","14","16","18","20","22","00","02","04","06","08","10","12"];
	var lblpos = [-5,35,75,115,155,195,235,275,315,355,395,435,475];
	str += writexlbl(leftoff,topoff,lbl,lblpos,"hours",225);
	str += txt_lft(leftoff+488,topoff-30,"Illum.");
	for (var t=0; t<tmax; t++) {
		jday=jd(obscopy);
		var dw=Math.floor(jday+1.5)-7*Math.floor((jday+1.5)/7);
		str += txt_lft(leftoff-90,topoff+15*t+2,datestring(obscopy)+" "+dow[dw]);
		str += makeBar(obscopy, obj, jday,transit,leftoff,topoff+15*t+1);
		if (obj==MOON) {	
			bodies[MOON].update(jday+0.5, obscopy); // get illum. at mid interval
			str += txt_lft(leftoff+488,topoff+15*t+2,Math.round(100*bodies[MOON].illum) + "%");
		}
		nextDate(obscopy,dstep, obs.day); 
		obscopy.hours=12; obscopy.minutes=0;
	}
	str += "</div>\n";
	if (transit) str += "<p><span style=\"background:#f00;\">&nbsp;</span> = transit.</p>";
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p>";
	str += "</CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
}		// end doVisibility()


function doPlanetVisibility(obs,transit) {
// Create the diagram showing all planets for one date
	var obscopy=new Object();
	for (var i in obs) obscopy[i] = obs[i];
	obscopy.hours=12; obscopy.minutes=0;	// graphics only allows for 12:00
	var pwin=window.open("","planetvis","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var str = head1 + "Javascript: Visibility" + head3 + "<h2>Visibility</h2><h3>of Sun, Moon and Planets</h3>";
	str += "<p>Observer location: " +sitename()+ " (UT "+hmstring(-obs.tz/60.0,true)+")</p>";
	str += "<h4>Date: "+datestring(obscopy)+" </h4>\n";
	var objects=[SUN,MOON,0,1,3,4,5,6,7];
	var leftoff=120; var topoff=30;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15*9+50) + "; width:700;\">";
	str += box(leftoff-1,topoff,482,15*9+2,"#aaa url(hourline.png)");
	var lbl = ["12","14","16","18","20","22","00","02","04","06","08","10","12"];
	var lblpos = [-5,35,75,115,155,195,235,275,315,355,395,435,475];
	str += writexlbl(leftoff,topoff,lbl,lblpos,"hours",225);
	for (var t=0; t<objects.length;t++) {
		var p=objects[t];
		var jday=jd(obscopy);
		str += txt_lft(leftoff-45,topoff+15*t+2,bodies[p].name);
		str += makeBar(obscopy, p, jday,transit,leftoff,topoff+15*t+1);
	}
	str += "</div>\n";
	if (transit) str += "<p><span style=\"background:#f00;\">&nbsp;</span> = transit.</p>";
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p>";
	str += "</CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
}		// end doPlanetVisibility()


function doStars(obs,deepsky, minalt, rasort, transit) {
// Show visible stars or deep sky objects on selected date
	var obscopy=new Object();
	for (var i in obs) obscopy[i] = obs[i];
	obscopy.hours=12; obscopy.minutes=0;	// graphics only allows for start at 12:00
	// stepsize in Julian day
	var stepsize=1/96.0;

	var ord = new Array();	// for storing records of siderial time and index to catalogue
	var sid = local_sidereal(obscopy) + 12*1.002737;	// sidereal time for following midnight
	var objcnt = 0;	// calculate number of objects to show
	for (var t=0; t<(deepsky?dso.length:stars.length); t++) {
		var de = parsecol(deepsky?dso[t].de:stars[t].de);
		if (de >= obs.latitude-90+minalt && de <= obs.latitude+90-minalt) {
			var h = parsecol(deepsky?dso[t].ra:stars[t].ra) - sid;	// negative hour angle
			if (h<0) h+=24; if (h>12) h-=24;
			ord[objcnt++] = new Array(h,t);	// 
		}
	}
	if (rasort) isort(ord);		// sort according to transit time starting from north

	var pwin=window.open("","starvis","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var ostr = (deepsky?"Deep Sky Objects":"Stars");
	var str = head1 + "Javascript: Visibility" + head3 + "<h2>Visibility</h2>" + "<h3>of "+ostr+"</h3>";
	str += "<p>Observer location: "+sitename();
	str += " (UT "+hmstring(-obs.tz/60.0,true)+")</p>\n";
	str += "<p>Altitude limit: " + minalt + "&deg;</p>\n";
	str += "<p>Observation date: " + datestring(obs) + " </p>";
	var leftoff=130; var topoff=30;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15*objcnt+50) + "; width:600;\">";
	str += box(leftoff-1,topoff,482,15*objcnt+2,"#aaa url(hourline.png)");
	var lbl = ["12","14","16","18","20","22","00","02","04","06","08","10","12"];
	var lblpos = [-5,35,75,115,155,195,235,275,315,355,395,435,475];
	str += writexlbl(leftoff,topoff,lbl,lblpos,"hours",225);

	var jday = jd(obscopy);
	for (var t=0; t<objcnt; t++) {
		i = ord[t][1];	
		var ra = (deepsky?dso[i].ra:stars[i].ra);
		var de = (deepsky?dso[i].de:stars[i].de);
		bodies[20].ra = parsecol(ra)*15;	// use User object as temporary object
		bodies[20].dec = parsecol(de);
		if (deepsky) {
			str += txt_lft(leftoff-150,topoff+15*t+2,dso[i].numb+" ("+dso[i].name+" "+dso[i].cons+")");
		} 
		else {
			str += txt_lft(leftoff-150,topoff+15*t+2,stars[i].name+" ("+stars[i].star+" "+stars[i].cons+")");
		}
		str += makeBar(obscopy, 20, jday,transit,leftoff,topoff+15*t+1);
	}
	str += "</div>\n";
	if (transit) str += "<p><span style=\"background:#f00;\">&nbsp;</span> = transit.</p>";
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p>";
	str += "</CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
}		// end doStars()


function doDataGrph(obs,obj,dspan,dstep) {
	var obscopy=new Object(); var obsmax=new Object();
	for (var i in obs) {obscopy[i] = obs[i];  obsmax[i] = obs[i]; }

	var pwin=window.open("","illumdiam","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var str = head1 + "Javascript: Object Data"+ head3;
	str += "<h2>Object Data</h2><p>(Angular diameter, magnitude and illumination)</p><h3>of "+bodies[obj].name+"</h3>\n";
	str += "<p>Observer location: "+sitename() + " (UT "+hmstring(-obs.tz/60.0,true)+")</p>\n";

	nextDate(obsmax, dspan, obs.day);	// 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	var jday=jd(obscopy);
	var tmax = Math.floor((jdmax-jday)/dstep);
	if (dstep<0) tmax = Math.floor(dspan/dstep);
	var leftoff=130; var topoff=60;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15*tmax+50) + "; width:700;\">";
	str += box(leftoff,topoff,502,15*(tmax-1)+2,"#aaa url(grid.png)");
	lblillum = ["0%","10%","20%","30%","40%","50%","60%","70%","80%","90%","100%"];
	lblipos= [-3,42,92,142,192,242,292,342,392,442,492];
	if (obj==SUN || obj==MOON) {
		lbldiam = ["1600\"","1700\"","1800\"","1900\"","2000\"","2100\""];
		lbldpos = [-12,88,188,288,388,488];
	}
	else {
		lbldiam = ["0\"","10\"","20\"","30\"","40\"","50\""];
		lbldpos = [-3,95,195,295,395,495];
	}
	lblmag = ["14.0","12.0","10.0","8.0","6.0","4.0","2.0","0.0","-2.0","-4.0","-6.0"];
	lblmagpos= [-8,42,92,144,194,244,294,344,392,442,492];
	str += writexlbl(leftoff,topoff-12,lblmag,lblmagpos,"",180);
	str += writexlbl(leftoff,topoff,lblillum,lblipos,"",180);
	str += writexlbl(leftoff,topoff-24,lbldiam,lbldpos,"illumination (%) / magnitude / diameter (arcsec)",140);
//	str += txt_lft(leftoff+612,topoff-30,ylbl);
	for (var t=0; t<tmax; t++) {
		jday=jd(obscopy);
		// do line for current date
		str += txt_rgt(leftoff-120,(topoff-6+15*t),114,6,datestring(obscopy)+"&nbsp;&nbsp;"+hmstring2(obscopy.hours,obscopy.minutes,0));
		bodies[obj].update(jday,obs);
		var illum=Math.round(bodies[obj].illum*500);
		var dist = bodies[obj].dist;
		if (obj<SUN) var diam = ndiam[obj]/dist*10;
		else if (obj==SUN || obj==MOON) var diam = ndiam[obj]/dist-1600;
		else var diam = 0;
		var mag = -bodies[obj].mag*25+350;	// display interval +14 - -6, resol. 0.04 mag/px
		if (obj!=COMET && obj!=SUN) str += box(leftoff+illum-1,topoff-7+15*t,3,15,"#ff0");
		if (obj!=COMET) str += box(leftoff+diam-1,topoff-7+15*t,3,15,"#f22");
		if (obj!=MOON && obj!=SUN) 	str += box(leftoff+mag-1,topoff-7+15*t,3,15,"#0f0");
		nextDate(obscopy,dstep, obs.day); 
	}
	str += "</div>\n";
	str += "<p><span style=\"width:3;background:#f22;\">&nbsp;</span> = Diameter, "; 
	str += "<span style=\"background:#ff0;\">&nbsp;</span> = Illumination, "; 
	str += "<span style=\"background:#0f0;\">&nbsp;</span> = Magnitude</p>"; 
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p></CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
} 	// end doDataGrph()


function doTwilightVisibility(obs,obj,dspan,dstep,sunalt) {
// Altitude of object(s) when Sun 6 degrees below horizon
	var obscopy=new Object(); var obsmax=new Object();
	for (var i in obs) {obscopy[i] = obs[i];  obsmax[i] = obs[i]; }
	if (dstep<1.0) dstep=1.0;
	var objects = (obj==100 ? [7,6,5,4,3,1,0,10] : [obj]);	/* order of planets */
	var values=new Array(44);
	// stepsize in degrees
	var stepsize=1.0;
	// Now make the diagram
	var pwin=window.open("","mercvenus","menubar,scrollbars,resizable");
	var doc=pwin.document;
	if (obj>20) var ostr="Moon and Planets";
	else var ostr=bodies[obj].name;
	var str = head1 + "Javascript: Twilight Altitude" + head3 + "<h2>Twilight Altitude</h2>";
	str += "<h3>of "+ostr+"</h3>\n";
	str += "<p>at the time when the Sun is " + (-sunalt) + "&deg; below the horizon</p>";
	str += "<p>Observer location: " + sitename() + " (UT "+hmstring(-obs.tz/60.0,true)+")</p>\n";
	nextDate(obsmax, dspan, obs.day);	// 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	var jday=jd(obscopy);
	var tmax = Math.floor((jdmax-jday)/dstep);	// needed for calculating box sizes
	if (dstep<0) tmax = Math.floor(dspan/dstep);
	var leftoff=80; var off2 = 320; var topoff=30;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15*tmax+50) + "; width:700;\">";
	str += box(leftoff,topoff,221,15*(tmax-1)+2,"#aaa url(grid.png)");
	str += box(leftoff+off2,topoff,221,15*(tmax-1)+2,"#aaa url(grid.png)");
	var lbl = new Array("0&deg;","10&deg;","20&deg;","30&deg;","40&deg;");
	var lblpos = new Array(-3,45,95,145,195);
	var lblpos2 = new Array(-3+off2,45+off2,95+off2,145+off2,195+off2);
	str += writexlbl(leftoff,topoff,lbl,lblpos,"Altitude (morning)",70);
	str += writexlbl(leftoff,topoff,lbl,lblpos2,"Altitude (evening)",70+off2);
//	str += txt_lft(leftoff+612,topoff-30,"az");
	for (var t=0; t<tmax; t++) {
		// do line for current date
		jday=jd(obscopy);
		var rset=sunrise(obscopy,sunalt);
		str += txt_rgt(leftoff-100,(topoff-6+15*t),50,0,datestring(obscopy));
		for (var i=0;i<2;i++) {		// i=0: before sunrise, i=1: after sunset
			str += txt_rgt(leftoff-60+i*off2,(topoff-6+15*t),50,0,hmstring(rset[i+3],false));
			// fill with gray and grid
			for (var n in objects) {
				if (!rset[2]) continue;		// Sun never reaches sunalt deg on this day
				var p=objects[n];
				if (p!=obj && obj!=100) continue;		// skip if not desired object
				bodies[p].update(rset[i],obscopy);
				var h=bodies[p].alt;
				if (h>=0 && h<45) {
					str += "<img src=\""+psyms[p]+"\" style=\"position:absolute;left:" + (leftoff+i*off2+5*h-6) + ";top:" + (topoff-7+15*t) + ";\">\n";
				}
				if (obj<100) str += txt_lft(leftoff+i*off2+226,topoff-6+15*t,(bodies[p].az<180) ? "rising" : "setting");
			}
		}
		nextDate(obscopy,dstep, obs.day); 
	}
	str += "</div>\n";
	if (obj==100) {
		str += "<p>M=Moon, 1=Mercury, 2=Venus, 4=Mars, 5=Jupiter, 6=Saturn, 7=Uranus, 8=Neptune</p>\n";
	}
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p></CENTER></BODY></HTML>";
	doc.write(str);
	doc.close();
	pwin.focus();
} 	// end doTwilightVisibility()


function doAltitude(obs,obj,mstep) {
// altitude of one or more objects during one day, if obj=100 plot all planets and Sun/Moon
	var obscopy=new Object();		// make working copy
	for (var i in obs) obscopy[i] = obs[i];
	obscopy.minutes = 0;	// start at full hour for nice display
	// order of planets, later ones plot on top of earlier ones
	var objects = (obj==100 ? [7,6,5,4,3,1,0,10,9] : [obj]);	
	// dstep in julian days
	var dstep=mstep/1440;
	if (obj>20) var ostr="Sun, Moon and Planets";
	else var ostr=bodies[obj].name;
	var pwin=window.open("","pl_altitude","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var str = head1 + "Javascript: Altitude" + head3 + "<h2>Altitude</h2><h3>of " + ostr + "</h3>";
	str += "<p>Observer location: " + sitename();
	str += " (UT " + hmstring(-obs.tz/60.0,true) + ")</p>\n";
	doc.write(str);
	
	var leftoff=120; var topoff=30;
	var htot = 15*1440/mstep;
	str = "<div align=\"center\" style=\"position:relative; height:" + (15*1440/mstep+50) + "; width:700;\">";
	var jday=jd(obscopy);
	// shade according to sun up/down
	var ev = findEvents(SUN,jday,obs); var t0=0; 
	var vis = (ev[0][1]==0); var i=1;	// vis == true if sun up
	while (ev[i][0]<1.0) {
		if ((vis && (ev[i][1]==1)) || (!vis && (ev[i][1]==(-1)))) {
			str += box(leftoff+100,Math.round(topoff+t0*htot),452,(ev[i][0]-t0)*htot+1,(vis) ? "#ccd" : "#58f");
			t0 = ev[i][0];
			vis = !vis;
		}
		i++;
	} 
	str += box(leftoff+100,Math.round(topoff+t0*htot),452,(1.0-t0)*htot+1,(vis) ? "#ccd" : "#58f");
	str += box(leftoff,topoff,100,htot+2,"#888");	// paint box below horizon
//	str += box(leftoff+100,topoff,452,(15*1440/mstep+2),"#ddd");	// above horizon
	str += box(leftoff,topoff,552,htot+2,"url(grid.png)");	// transparent grid
	var lbl = new Array("-20&deg;","-10&deg;","0&deg;","10&deg;","20&deg;","30&deg;","40&deg;","50&deg;","60&deg;","70&deg;","80&deg;","90&deg;");
	var lblpos = new Array(-10,40,97,144,194,244,294,344,394,444,494,544);
	str += writexlbl(leftoff,topoff,lbl,lblpos,"Altitude",250);
	str += txt_lft(leftoff+562,topoff-30,"az");
	// for each mstep min do
	for (var t=0;t<1.0/dstep+0.001;t++) {
		str += txt_rgt(0,(topoff-5+15*t),114,6,datestring(obscopy)+"&nbsp;&nbsp;"+hmstring2(obscopy.hours,obscopy.minutes,0));
		bodies[9].update(jday,obs);
		for (var n in objects) {
			var p=objects[n];
			bodies[p].update(jday,obs);
			var h=bodies[p].alt;
			if (h>=-20.0) {
				str += "<img src=\""+psyms[p]+"\" style=\"position:absolute; left:" + (leftoff+93+(5.0*h)) + 
				"; top:" + (topoff-6+15*t) + ";\">\n";
			}
		}
		if (obj<21)	{	// write azimuth
			str += txt_lft(leftoff+562,topoff-5+15*t,Math.round(bodies[obj].az)+"&deg;");
		}	
		jday+=dstep;
		nextDate(obscopy,dstep, obs.day); 
	}
	str += "</div>";	// outer block
	if (obj==100) {
		str += "<p>S=Sun, M=Moon, 1=Mercury, 2=Venus, 4=Mars, 5=Jupiter, 6=Saturn, 7=Uranus, 8=Neptune</p>";
	}
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p></CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
} 	// end doAltitude()


function doAngles(obs,obj,dspan,dstep,type) {
// Common function for declination (0), longitude (1) and elongation (2)
	var obscopy=new Object(); var obsmax=new Object();
	for (var i in obs) {obscopy[i] = obs[i];  obsmax[i] = obs[i]; }

	var objects=(obj==100 ? [7,6,5,4,3,1,0,10,9] : [obj]);
	// objects to plot and order, later ones plot on top of earlier ones
	if (type==0) {
		var tstr="Declination";
		var lbl = new Array("-30&deg;","-25&deg;","-20&deg;","-15&deg;","-10&deg;","-5&deg;","0&deg;","5&deg;","10&deg;","15&deg;","20&deg;","25&deg;","30&deg;");
		var lblpos = new Array(-10,40,90,140,190,244,297,347,395,445,495,545,595);
		var ylbl = "R.A";
	}
	else if (type==1) {
		var tstr="Ecliptic Longitude";
		var lbl = new Array("0&deg;","30&deg;","60&deg;","90&deg;","120&deg;","150&deg;","180&deg;","210&deg;","240&deg;","270&deg;","300&deg;","330&deg;","360&deg;");
		var lblpos = new Array(-10,40,97,144,194,244,294,344,394,444,494,544,594);
		var ylbl = "Lat.";
	}
	else {
		var tstr="Elongation";
		var lbl = new Array("0&deg;","15&deg;","30&deg;","45&deg;","60&deg;","75&deg;","90&deg;","105&deg;","120&deg;","135&deg;","150&deg;","165&deg;","180&deg;");
		var lblpos = new Array(-3,45,95,145,195,245,295,342,392,442,492,542,592);
		var ylbl = "P.A.";
	}
	var ostr=(obj==100 ? "Sun, Moon and Planets" : bodies[obj].name);
	if (type==2 && obj==100) ostr = "Moon and Planets";
	// Now make the diagram
	var pwin=window.open("","position","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var str = head1 + "Javascript: " + tstr + head3 + "<h2>" + tstr + "</h2><h3>of "+ostr+"</h3>\n";
	str += "<p>at noon local time (UT " + hmstring(-obs.tz/60.0,true) + ")</p>\n";

	nextDate(obsmax, dspan, obs.day);	// 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	var jday=jd(obscopy);
	var tmax = Math.floor((jdmax-jday)/dstep);
	if (dstep<0) tmax = Math.floor(dspan/dstep);
	var leftoff=80; var topoff=30;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15*tmax+50) + "; width:700;\">";
	str += box(leftoff,topoff,602,15*(tmax-1)+2,"#aaa url(grid.png)");
	str += writexlbl(leftoff,topoff,lbl,lblpos,tstr,270);
	str += txt_lft(leftoff+612,topoff-30,ylbl);
	for (var t=0; t<tmax; t++) {
		jday=jd(obscopy);
		// do line for current date
		str += txt_rgt(leftoff-120,(topoff-6+15*t),114,6,datestring(obscopy)+"&nbsp;&nbsp;"+hmstring2(obscopy.hours,obscopy.minutes,0));
		bodies[9].update(jday,obs); /* need this for elongation */
		var ra1=bodies[9].ra; var dec1=bodies[9].dec;
		for (var n in objects) {
			var p=objects[n];
			bodies[p].update(jday,obs);
			if (type==0) {		/* range -30 deg to +30 deg in 0.5 deg steps, 0 deg == pos 60 */
				var ang=Math.round(bodies[p].dec*10) + 300; 
			} 
			else if (type==1) { 	/* longitude range 0 to 360 deg in 3 deg steps */
				var ang=Math.round(bodies[p].eclon/0.6); 
			} 
			else {		/* elongation 0 - 180 deg, 1.5 deg steps */
				if (p==9) continue;
				var ra=bodies[p].ra; var dec=bodies[p].dec;
				var ang=Math.round(acosd(sind(dec)*sind(dec1) + cosd(dec)*cosd(dec1)*cosd(ra-ra1))/0.3); 
			}
			str += "<img src=\""+psyms[p]+"\" style=\"position:absolute;left:" + (leftoff+ang-7) + ";top:" + (topoff-6+15*t) + ";\">\n";
		}
		if (obj<USER) {
			if (type==0) 
				var sval=hmstring(bodies[obj].ra/15.0,false);
			else if (type==1) 
				var sval=anglestring(bodies[obj].eclat,false,true);
			else {
				var ra=bodies[obj].ra; 
				var dec=bodies[obj].dec;
				var pa=Math.round(atan2d(sind(ra-ra1),cosd(dec1)*tand(dec)-sind(dec1)*cosd(ra-ra1)));
				var sval = (pa<0?pa+360:pa) + "&deg;";
			}
			str += txt_lft(leftoff+612,topoff-5+15*t,sval);
		}
		nextDate(obscopy,dstep, obs.day); 
	}
	str += "</div>\n";
	if (obj==100) {
		str += "<p>S=Sun, M=Moon, 1=Mercury, 2=Venus, 4=Mars, 5=Jupiter, 6=Saturn, 7=Uranus, 8=Neptune</p>\n";
	}
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p></CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
}		// end doAngles


