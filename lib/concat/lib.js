// Functions for comets

// Copyright Ole Nielsen 2002-2004
// Please read copyright notice in astrotools2.html source

// Formulae from Paul Schlyter's article "Computing planetary positions" available at 
// http://hem.passagen.se/pausch/comp/ppcomp.html

// Orbital elements in Skymap format, retrieve fresh elements from 
// http://cfa-www.harvard.edu/cfa/ps/Ephemerides/Comets/SoftwareComets.html
// All elements must be referred to epoch J2000.0 
// Paste desired lines from the Skymap file into the variable assignment below, 
// start line with a " then the pasted line and append ", to end of line.
// Fields: name: 0-46; Ty: 47-51; Tm: 52-53; Td: 55-61; q: 64-71; e: 79-86; wL 88-95; N: 97-104; i: 106-113; G: 116-119; H: 122-125

// namenamenamenamenamenamenamename             yyyy mm dd.dddd  q.qqqqqq       e.eeeeee www.wwww NNN.NNNN iii.iiii  GG.G  HH.H
var c_elements = [
"9P Tempel                                      2005 07 05.3591  1.505418       0.517589 178.8667  68.9595  10.5303   5.5  10.0",
"29P Schwassmann-Wachmann                       2004 07 07.3544  5.723424       0.044075  48.7097 312.7067   9.3911   4.0   4.0",
"C/2001 Q4 NEAT                                 2004 05 15.9643  0.961943       1.000664   1.2020 210.2789  99.6428   3.5   4.0",
"C/2003 K4 LINEAR                               2004 10 13.7174  1.023611       1.000323 198.4422  18.6755 134.2525   3.5   4.0",
"C/2003 T4 LINEAR                               2005 04 03.6349  0.849682       1.000544 181.6772  93.9026  86.7614   6.0   4.0",
"C/2004 Q2 Machholz                             2005 01 24.9244  1.205767       1.000000  19.4475  93.6600  38.5864   5.5   4.0",
""];

var c_index = -1;	// currently selected comet

function comet(name,Ty,Tm,Td,q,e,w,N,i,G,H) {
// The comet object
	this.name=name;	// IAU designation
	this.Ty=Ty;	// year of perihelion
	this.Tm=Tm;	// month of perihelion
	this.Td=Td;	// date of perihelion
	this.q=q;	// perihelion distance
	this.e=e;	// eccentricity
	this.w=w;	// argument of perihelion (= lowercase omega)
	this.N=N; 	// longitude of ascending node (= uppercase omega)
	this.i=i;	// inclination
	this.G=G; 	// absolute magnitude
	this.H=H;	// slope parameter
}

var comets=new Array();	// orbital elements in internal format


function add_comets() {
// convert element text format to internal format
	var elm = c_elements;
	for (var i=0; i < elm.length-1; i++) {
		comets[i] = new comet(elm[i].substring(0,31),
			parseInt(elm[i].substring(47,51),10),
			parseInt(elm[i].substring(52,54),10),
			parseFloat(elm[i].substring((elm[i].charAt(55)=="0"?56:55),62)),
			parseFloat(elm[i].substring(64,72)),
			parseFloat(elm[i].substring(79,87)),
			parseFloat(elm[i].substring(88,96)),
			parseFloat(elm[i].substring(97,105)),
			parseFloat(elm[i].substring(106,114)),
			parseFloat(elm[i].substring(116,120)),
			parseFloat(elm[i].substring(122,126)));
	}
}	// add_comets()


function comet_xyz(cn,jday) {
// heliocentric xyz for comet (cn is index to comets)
// based on Paul Schlyter's page http://www.stjarnhimlen.se/comp/ppcomp.html
// returns heliocentric x, y, z, distance, longitude and latitude of object
	var d = jday-2451543.5;
	var cm = comets[cn];
	var q = cm.q;
	var e = cm.e; 
	var Tj = jd0(cm.Ty,cm.Tm,cm.Td);	// get julian day of perihelion time
	if (e > 0.98)	{ 
		// treat as near parabolic (approx. method valid inside orbit of Pluto)
		var k = 0.01720209895;	// Gaussian gravitational constant
		var a = 0.75 * (jday-Tj) * k * Math.sqrt( (1 + e) / (q*q*q) ); 
		var b = Math.sqrt( 1 + a*a );
		var W = cbrt(b + a) - cbrt(b - a);
		var c = 1 + 1/(W*W);
		var f = (1 - e) / (1 + e);
		var g = f / (c*c);
		var a1 = (2/3) + (2/5) * W*W;
		var a2 = (7/5) + (33/35) * W*W + (37/175) * W*W*W*W;
		var a3 = W*W * ( (432/175) + (956/1125) * W*W + (84/1575) * W*W*W*W);
		var w = W * ( 1 + g * c * ( a1 + a2*g + a3*g*g ) );
		var v = 2 * atand(w);
		var r = q * ( 1 + w*w ) / ( 1 + w*w * f );
	}
	else {		// treat as elliptic
		var a = q / (1.0 - e);
		var P = 365.2568984 * Math.sqrt(a*a*a);	// period in days
		var M = 360.0 * (jday-Tj)/P; 	// mean anomaly
		// eccentric anomaly E
		var E0 = M + RAD2DEG*e*sind(M) * ( 1.0+e*cosd(M) );
		var E1 = E0 - ( E0-RAD2DEG*e*sind(E0)-M ) / ( 1.0-e*cosd(E0) );
		while (Math.abs(E0-E1) > 0.0005) {
			E0 = E1;
			E1 = E0 - ( E0 - RAD2DEG*e*sind(E0)-M ) / ( 1.0-e*cosd(E0) );
		}
		var xv = a*(cosd(E1) - e);
		var yv = a*Math.sqrt(1.0 - e*e) * sind(E1);
		var v = rev(atan2d( yv, xv ));		// true anomaly
		var r = Math.sqrt( xv*xv + yv*yv );	// distance
	}	// from here common for all orbits
	var N = cm.N + 3.82394E-5 * d;	// precess from J2000.0 to now;
	var w = cm.w;	// why not precess this value?
	var i = cm.i;
	var xh = r * ( cosd(N)*cosd(v+w) - sind(N)*sind(v+w)*cosd(i) );
	var yh = r * ( sind(N)*cosd(v+w) + cosd(N)*sind(v+w)*cosd(i) );
	var zh = r * ( sind(v+w)*sind(i) );
	var lonecl = atan2d(yh, xh);
	var latecl = atan2d(zh, Math.sqrt(xh*xh + yh*yh + zh*zh));
	return new Array(xh,yh,zh,r,lonecl,latecl);
}	// comet_xyz()


function CometAlt(jday,obs) {
// Alt/Az, hour angle, ra/dec, ecliptic long. and lat, illuminated fraction (=1.0), dist(Sun), dist(Earth), brightness of planet p
	var cn = c_index;
	var sun_xyz = sunxyz(jday);
	var planet_xyz = comet_xyz(cn,jday);
	var dx = planet_xyz[0]+sun_xyz[0];
	var dy = planet_xyz[1]+sun_xyz[1];
	var dz = planet_xyz[2]+sun_xyz[2];
	var lon = rev( atan2d(dy, dx) );
	var lat = atan2d(dz, Math.sqrt(dx*dx+dy*dy));
	var radec = radecr(planet_xyz, sun_xyz, jday, obs);
	var ra = radec[0]; 
	var dec = radec[1];
	var altaz = radec2aa(ra, dec, jday, obs);
	var dist = radec[2];
	var r = planet_xyz[3];
	var mag = comets[cn].G  + 5*log10(dist) + 2.5*comets[cn].H*log10(r);	// Schlyter's formula is wrong!
	return new Array (altaz[0], altaz[1], altaz[2], ra, dec, lon, lat, 1.0, r, dist, mag); 
}	// CometAlt()

;// Cookie functions

// Copyright Ole Nielsen 2002-2003
// Please read copyright notice in index.html source

// cookie value has format "place='Den Haag'&lat=52.03&lng=4.23&tz=-60&dst=false" (unescaped form)
// placeid is name of cookie (more than just "home" cookie possible)
// dst is true if tz is DST

// search for cookie "placeid" and initialize observer from it if found, else return 'false'
function getCookie(placeid,obs) {
	var place=""; var lat=9999.0; var lng=9999.0; var tz=9999;
	var thisCookie=document.cookie.split("; ");
	if (thisCookie=="") return false;
	for (var i=0; i<thisCookie.length; i++) {
		if (placeid == thisCookie[i].split("=")[0]) {
			var argstr = unescape(thisCookie[i].split("=")[1]);
			var args = argstr.split('&');
			if (args.length<4) return false;
			for (var i=0; i<args.length; i++) eval(args[i]);
		}
	}
	// check if valid values were read
	if (Math.abs(lat)>90.0 || Math.abs(lng)>180.0 || Math.abs(tz)>960) return false;
	obs.name = place;
	obs.latitude = lat;
	obs.longitude = lng;
	obs.tz = tz;
	obs.dst = dst;
//	tbl.Place.options[0].selected=true;
	rewritePlace();
	rewrite2();
	// rewrite cookie to refresh expire date
	setCookie(placeid,obs);
	return true;
}


// remember observatory in cookie 
function setCookie(placeid,obs) {
	var expireDate=new Date;
	expireDate.setFullYear(expireDate.getFullYear()+2);
	var argstr="place='"+obs.name+"'&lat="+obs.latitude+"&lng="+obs.longitude+"&tz="+obs.tz+"&dst="+obs.dst;
	document.cookie=placeid+"="+escape(argstr)+"; expires="+expireDate.toGMTString();
}


function deleteCookie(placeid) {
	var expireDate=new Date;
	expireDate.setFullYear(expireDate.getFullYear()-1);
	document.cookie=placeid+"=; expires="+expireDate.toGMTString();
}

;// Various date and time functions

// Copyright Peter Hayes 1999-2001, Ole Nielsen 2002-2004


// must be updated using leapyear() if year changed
var month_length=new Array(31,28,31,30,31,30,31,31,30,31,30,31);
var dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];


function leapyear(year) {
  var leap=false;
  if (year % 4 == 0) leap = true;
  if (year % 100 == 0 ) leap = false;
  if (year % 400 == 0) leap = true;
  return leap;
}


function jd0(year,month,day) {
// The Julian date at 0 hours(*) UT at Greenwich
// (*) or actual UT time if day comprises time as fraction
  var y  = year;
  var m = month;
  if (m < 3) {m += 12; y -= 1};
  var a = Math.floor(y/100);
  var b = 2-a+Math.floor(a/4);
  var j = Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+day+b-1524.5;
  return j;
}	// jd0()


function jdtocd(jd) {
// The calendar date from julian date, see Meeus p. 63
// Returns year, month, day, day of week, hours, minutes, seconds
  var Z=Math.floor(jd+0.5);
  var F=jd+0.5-Z;
  if (Z < 2299161) {
    var A=Z;
  } else {
    var alpha=Math.floor((Z-1867216.25)/36524.25);
    var A=Z+1+alpha-Math.floor(alpha/4);
  }
  var B=A+1524;
  var C=Math.floor((B-122.1)/365.25);
  var D=Math.floor(365.25*C);
  var E=Math.floor((B-D)/30.6001);
  var d=B-D-Math.floor(30.6001*E)+F;
  if (E < 14) {
    var month=E-1;
  } else {
    var month=E-13;
  }
  if ( month>2) {
    var year=C-4716;
  } else {
    var year=C-4715;
  }
  var day=Math.floor(d);
  var h=(d-day)*24;
  var hours=Math.floor(h);
  var m=(h-hours)*60;
  var minutes=Math.floor(m);
  var seconds=Math.round((m-minutes)*60);
  if (seconds >= 60) {
    minutes=minutes+1;
    seconds=seconds-60;
  }
  if (minutes >= 60) {
    hours=hours+1;
    minutes=0;
  }
  var dw=Math.floor(jd+1.5)-7*Math.floor((jd+1.5)/7);
  return new Array(year,month,day,dw,hours,minutes,seconds);  
}	// jdtocd()


function g_sidereal(year,month,day) {
// sidereal time in hours for Greenwich
  var T=(jd0(year,month,day)-2451545.0)/36525;
  var res=100.46061837+T*(36000.770053608+T*(0.000387933-T/38710000.0));
  return rev(res)/15.0;
}

;// FUNCTIONS FOR FINDING EVENTS

// Copyright Ole Nielsen 2002-2004
// Please read copyright notice in astrotools2.html source

// 'Meeus' means "Astronomical Algorithms", 2nd ed. by Jean Meeus

var H0SUN = -0.833; var H0STAR = -0.583;	// standard altitudes for rise and set


function findEvents(obj, jday, obs) {
// Version 2
// Calculate daily events (rise, transit, set etc) for one day starting at jday
// Returns chronological sorted array of records, each record comprising time [0<=t<1] relative to jday
// and event type. Event type codes are: 
//	0: transit; -1/1: rise/set; -2/2: civ. twil. start/end; -3/3 naut twil; -4/4: astr twil
// The first record is different: Type code is 0 for object up, 1 for less than 6 deg below horizon etc
// The code is a little bit 'hairy'. Basically, it determines the nearest transit time of the 
// object at each side of the middle of the time interval, and from these transit times it 
// calculates rise and set times (and twilights for the Sun). 

	if (obj == MOON) {		// reference horizon h0 for Moon depends on parallax, see Meeus p. 102
		bodies[obj].update(jday+0.5, obs);
		var par = asind(6378.14/bodies[obj].dist);
		var h0moon = 0.7275*par - 0.567;
	}
	var href0 = ((obj==SUN) ? H0SUN : H0STAR);	// rise/set altitude depends on object
	if (obj == MOON) href0 = h0moon;
 
	var events = new Array();		// stores the various events in records of [t, type]
	var count = 0;
	// find situation at start of interval (not currently used by AstroTools but needed by Skyplanner)
	bodies[obj].update(jday, obs);
	var altaz = radec2aa(bodies[obj].ra, bodies[obj].dec, jday, obs);
	var alt = altaz[0]; var type = 4;
	if (alt > href0) type = 0;		// object is visible
	else if (alt > -6) type = 1;		// civil twilight
	else if (alt > -12) type = 2;	// naut. twil.
	else if (alt > -18) type = 3;	// astr. twil.
	events[count++] = new Array(0,type);		

	bodies[obj].update(jday+0.5, obs); var dec1 = bodies[obj].dec;
	var altaz = radec2aa(bodies[obj].ra, bodies[obj].dec, jday + 0.5, obs);
	var H = altaz[2];		// H is hour angle
	var m = -H/360.0;		// first transit approx.
	for (var i = 0; i<2; i++)	{		// check for events around first and second transit
		bodies[obj].update(jday+0.5+m, obs);
		var altaz = radec2aa(bodies[obj].ra, bodies[obj].dec, jday + 0.5 + m, obs);
		var H = altaz[2]>180.0 ? altaz[2]-360 : altaz[2];
		m0 = m - H/360.0;		// correction to transit time (Meeus page 103)
		if (m0 >= -0.5 && m0 < 0.5) 
			events[count++] = new Array(m0+0.5,0);	// save transit time
		// find rise and set times (and start/end of twilights if sun)
		for (var j = 0; j <= (obj==SUN ? 3 : 0) ; j++) {
			var href = -6.0*j; 	// href is the desired reference horizon
			if (href == 0.0) {href = href0;}
			var cosH0 = (sind(href)-sind(obs.latitude)*sind(dec1)) / (cosd(obs.latitude)*cosd(dec1));	
			// (Meeus 15.1)
			if (cosH0>=-1.0 && cosH0<=1.0) {		
			// this may miss occasional rises/sets in polar regions, especially for Moon
				var H0 = acosd(cosH0);	

				var m1 = m0 - H0/360.0;		// rise (Meeus 15.2)
				bodies[obj].update(jday+0.5+m1, obs);
				var altaz = radec2aa(bodies[obj].ra, bodies[obj].dec, jday + 0.5 + m1, obs);
				H = altaz[2];
				// correction to rise time
				m1 += (altaz[0]-href) / (360*cosd(bodies[obj].dec)*cosd(obs.latitude)*sind(H));
				if (m1 >= -0.5 && m1 < 0.5) {		// only keep event within interval of interest
					events[count++] = new Array(m1+0.5, -j-1);
				}

				var m2 = m0 + H0/360.0;		// set
				bodies[obj].update(jday+0.5+m2, obs);
				var altaz = radec2aa(bodies[obj].ra, bodies[obj].dec, jday + 0.5 + m2, obs);
				H = altaz[2];
				// correction to set time
				m2 += (altaz[0]-href) / (360*cosd(bodies[obj].dec)*cosd(obs.latitude)*sind(H));
				if (m2 >= -0.5 && m2 < 0.5) {
					events[count++] = new Array(m2+0.5, j+1);
				}
			}
		}				
		m += 1.0;		// second transit approx.
	}	
	events[count++] = new Array(1.0,-9);	// end marker
	isort(events);	// bring in chronological order
	return events;
}		// end findEvents()

;// AstroTools - handlers.js

// various functions for handling events of user interface

function rewrite2() {
// rewrite2 updates table1 date/time info
	tbl.local_date.value = datestring(observer);
	tbl.local_time.value = hmstring2(observer.hours,observer.minutes,0);
	var jdstr = fixnum(jd(observer),11,3);
	if (tbl.julian) tbl.julian.value=jdstr.substring(1,jdstr.length);	// strip off leading space
	if (tbl.siderial) tbl.siderial.value=hmstring(local_sidereal(observer),false);
}		// end rewrite2()


function reset1() {
// reset1 restores the input table to its default settings
	// initialize date from system clock
	setNow();			
	tbl.Place.selectedIndex = 0;
	updateplace(true);
}		// end reset1()


function setDateTime(rel) {
	// handles changes to the time and date fields in table1. Also handles time step buttons.
	// 'rel' is relative adjustment in minutes. If rel = 0 evaluate date and time fields.
	if (rel != 0) {
		adjustTime(observer,rel);
		rewrite2();
		return;
	}
	var vald = tbl.local_date.value;
	// date field
	var col1 = vald.indexOf(":");
	var col2 = vald.lastIndexOf(":");
	var col3 = vald.length;
	observer.year = parseInt(vald.substring(0,col1),10);
	month_length[1] = leapyear(observer.year)?29:28;
	observer.month = parseInt(vald.substring(col1+1,col2),10);
	observer.day = parseInt(vald.substring(col2+1,col3),10);
	if (observer.day > month_length[observer.month-1]) {
		observer.day = month_length[observer.month-1];
	}
	// time field
	var valt = tbl.local_time.value;
	col1 = valt.indexOf(":");
	col2 = valt.length;
   	if (col1 <= 0) col1 = col2;
   	observer.hours = parseInt(valt.substring(0,col1),10);
   	if (col2 > (col1+1)) {
   		observer.minutes = parseInt(valt.substring(col1+1,col2),10);
   	} else {
		observer.minutes = 0;
    }
	observer.seconds = 0;
	rewrite2();
}	// setDateTime()


function setNow(settimezone,changeDST) {
	// Handles 'Now' button
	var now = new Date();
	observer.year = now.getFullYear();
	month_length[1] = leapyear(observer.year)?29:28;
	observer.month = now.getMonth()+1;
	observer.day = now.getDate();
	observer.hours = now.getHours();
	observer.minutes = now.getMinutes();
	observer.seconds = 0;
	rewrite2();
}		// setNow()


function set12(noon) {
// set to noon or midnight
	if (noon) {
		observer.hours = 12;
		observer.minutes = 0;
	}
	else {
		observer.hours = 0;
		observer.minutes = 0;
	}
	rewrite2();
}	// set12()


function jd2dt() {
	// handle julian day input
	var zdt = jdtocd(parseFloat(tbl.julian.value)-observer.tz/1440.0);
	tbl.local_date.value = zdt[0]+":"+zdt[1]+":"+zdt[2];
	tbl.local_time.value = zdt[4]+":"+zdt[5]+":"+zdt[6];
	setDateTime(0);
}		// end jd2dt()


function setUTCOff() {
	observer.tz = -60.0*parsecol(tbl.ut_offset.value);
	rewrite2();
	rewritePlace();
}


function setTZ(changeDST) {
	// handles 'Set TZ from computer' buttons and DST checkbox
	if (changeDST) {	// toggle DST
		observer.dst = tbl.DSTactive.checked;
		observer.tz -= (observer.dst?60:-60);
	} 
	else {	// set time zone to computer time zone
		var now = new Date();
		observer.tz = now.getTimezoneOffset();
		// find out if this is DST (idea picked from a discussion forum about javascript)
		var winter = new Date(020101);
		var summer = new Date(020701);
		var off = Math.min(summer.getTimezoneOffset(),winter.getTimezoneOffset());
		observer.dst = (observer.tz==off?false:true)
	}
	rewritePlace();
	rewrite2();
}


function updateplace(fromtable) {
	// updateplace handles the place selection in table1
	// if 'fromtable' is true get data from 'selected' table entry, else just read Placename field
	var ndx = tbl.Place.selectedIndex;
	if (fromtable) {
		if ((ndx >= 0) && (ndx <= atlas.length)) {
			observer.name = atlas[ndx].name;
			var lat = parsecol(atlas[ndx].latitude);
			observer.latitude = atlas[ndx].ns==0?lat:-lat;
			var lon = parsecol(atlas[ndx].longitude);
			observer.longitude = atlas[ndx].we==0?lon:-lon;
			observer.tz = atlas[ndx].zone;
			// This code makes a lot of assumptions about typical rules
			observer.dst = (checkdst(observer)==-60);
			observer.tz += (observer.dst?-60:0);
			rewritePlace();
			rewrite2();
		} 
	}
	else {
		observer.name = tbl.Placename.value;
	}
}	// end updateplace()


function rewritePlace() {
	tbl.Placename.value = observer.name;
	tbl.Latitude.value = dmstring(observer.latitude);
	tbl.Longitude.value = dmstring(observer.longitude);
	tbl.North.selectedIndex = observer.latitude>0?0:1;
	tbl.West.selectedIndex = observer.longitude>0?0:1;
  	tbl.ut_offset.value = hmstring(-observer.tz/60.0,true);
	tbl.DSTactive.checked = observer.dst;
}	// rewritePlace()


function updatell() {
	// updatell handles the latitude/longitude changes in table1
	var lat = parsecol(tbl.Latitude.value);
	observer.latitude = tbl.North.selectedIndex==0?lat:-lat;
	var lon = parsecol(tbl.Longitude.value);
	observer.longitude = tbl.West.selectedIndex==0?lon:-lon;
	rewrite2();
}		// end updatell()


function updateobject(cat,deepsky) {
	// updateobject handles the user object selection in table1
	// if cat use catalogue, if deepsky==true get data from 'dso' else get them from 'stars' 
	tbl.object.selectedIndex = 10;
	if (cat) {
		var objlist = (deepsky ? tbl.deepskyobj : tbl.fixstar);
		var ndx = objlist.selectedIndex - 1; 
		if (ndx<0) return false;
		if (deepsky) {
			tbl.objname.value = dso[ndx].numb;
			if (dso[ndx].name != "") tbl.objname.value += ( " (" + dso[ndx].name + ")" );
			tbl.ra.value = dso[ndx].ra;
			tbl.dec.value = dso[ndx].de;
		}
		else {
			tbl.objname.value = stars[ndx].star + " " + stars[ndx].cons + " (" + stars[ndx].name + ")";
			tbl.ra.value = stars[ndx].ra;
			tbl.dec.value = stars[ndx].de;
		}
	}
}		// end updateobject()


function updatecomet() {
	// updateobject handles the user object selection in table1
	c_index = tbl.comet.selectedIndex-1; 
	if (c_index<0) return false;
	tbl.object.selectedIndex = 9;
	bodies[COMET].name = "Comet " + comets[c_index].name;
	tbl.perihel.value = datestring2(comets[c_index].Ty,comets[c_index].Tm,comets[c_index].Td);
//	alert("Elements are: Ty="+comets[c_index].Ty+" Tm="+comets[c_index].Tm+" Td="+comets[c_index].Td+
//	" q="+comets[c_index].q+" e="+comets[c_index].e+" w="+comets[c_index].w+" N="+comets[c_index].N+
//	" i="+comets[c_index].i+" G="+comets[c_index].G+" H="+comets[c_index].H);
}		// end updateobject()


function switchboard(funct) {
	// find out what has been requested and call corresponding page maker
	var starttime = new Date();	// if timer_on: Measure execution time
	var dspan = datecount[tbl.Times.selectedIndex];
	var dstep = daystep[tbl.Step.selectedIndex];
	// check if an excessive number of lines would be generated, limit dspan if necessary
	if (dstep < 1 && dstep > 0 && dspan < -2) dspan = -2;
	if (dstep < 7 && dstep > 0 && dspan < -12) dspan = -12;
	var chart=tbl.outputtype[0].checked;
	var deepsky = (tbl.Starordso.selectedIndex == 1);
	var p = objlist[tbl.object.selectedIndex];
	if (p==USER) {	
		bodies[USER].ra = 15.0*parsecol(tbl.ra.value);
		bodies[USER].dec = parsecol(tbl.dec.value);
		bodies[USER].name = tbl.objname.value;
	}
	if (p==COMET && c_index<0) return;	// no comet selected

	if (chart && !(funct==L_EV || funct==P_EV)) {
		if (funct==VIS) {
			if (p==100) doPlanetVisibility(observer,true);	// all planets
			else doVisibility(observer, p, dspan, dstep, true);
		} 
		else if (funct==A_A)	doAltitude(observer,p,aastep[tbl.Altaz_step.selectedIndex]);
		else if (funct==TWI && p!=SUN) doTwilightVisibility(observer,p, dspan, dstep,twl_alt[tbl.Twil_alt.selectedIndex]);
		else if (funct==DAT && p<USER) doDataGrph(observer,p, dspan, dstep);
		else if (funct==POS && tbl.postool[1].checked && p!=USER) doAngles(observer,p, dspan, dstep,LON);
		else if (funct==POS && tbl.postool[2].checked && p!=SUN) doAngles(observer,p, dspan, dstep,ELON);
		else if (funct==POS && p!=USER) doAngles(observer,p, dspan, dstep,DEC);
		else if (funct==STAR) doStars(observer,deepsky, cut_alt[tbl.Cutoff_alt.selectedIndex],tbl.RA_sort.checked, true);
	}
	else {
		if ((funct==VIS || funct==DAT || funct==POS) && p==100) doAllPlanets(observer);
		else if (funct==VIS && p<=USER)	doDailyEvents(observer, p, dspan, dstep, tbl.sunrises.checked);
		else if (funct==DAT && p < USER) doObjectData(observer,p,dspan, dstep);
		else if (funct==POS && p < USER) doPositions(observer,p,dspan, dstep);
		else if (funct==A_A && p <= USER) doAltAz(observer,p,aastep[tbl.Altaz_step.selectedIndex]);
		else if (funct==SEP && p <= USER) 
			doSeparation(observer,p,obj2[tbl.Object2.selectedIndex],aastep[tbl.Altaz_step.selectedIndex]);
		else if (funct==TWI && p <= USER && p!=SUN)
			doTwilightAltAz(observer,p,dspan,dstep,twl_alt[tbl.Twil_alt.selectedIndex]);
//		else if (funct==L_EV) doPlanetEvents(observer, dspan, true, false);
//		else if (funct==P_EV) doPlanetEvents(observer, dspan, tbl.lun_ev.checked, true);
		else if (funct==STAR) doVisible(observer,deepsky,cut_alt[tbl.Cutoff_alt.selectedIndex],tbl.RA_sort.checked);
	}
	var endtime = new Date();
	if (timer_on) alert("Function executed in " + ((endtime.getTime() - starttime.getTime())/1000) + "seconds");
}


;// Javascript AstroTools
// FUNCTIONS FOR CREATING EPHEMERIDES

// Copyright Ole Nielsen 2002-2004
// Please read copyright notice in astrotools2.html source


// var head1="<!doctype html public \"-//w3c//dtd html 4.0 transitional//en\">\n<HTML><HEAD><TITLE>";
// var head2="</TITLE><style>\npre {font-size:12px}\n</style></HEAD><BODY>";



function nextDate(obs1,dstep,origday) {
	// update date and time, origday is day of month at start (some months may not allow this day)
	if (dstep < 0) { 	// dstep is in months (integer!)
		dstep = -dstep;
		if (dstep >= 12) {
			obs1.year += Math.floor(dstep/12); 
		}
		else {
			obs1.month += dstep;
			if (obs1.month > 12) {
				obs1.year++;
				obs1.month -= 12;
			}
		}
		month_length[1]=leapyear(obs1.year)?29:28;	// check for leapyear
		obs1.day = ( origday>month_length[obs1.month-1] ? month_length[obs1.month-1] : origday);
	}
	else {	// dstep is in days (max 31)
		var m = Math.round(1440*(dstep-Math.floor(dstep)));
		obs1.minutes += m - 60*(Math.floor(m/60));
		obs1.hours += Math.floor(m/60);
		obs1.day += Math.floor(dstep);
		if (obs1.minutes > 59) {
			obs1.minutes -= 60;
			obs1.hours++;
		}
		if (obs1.hours > 23) {
			obs1.hours -= 24;
			obs1.day++;
		}
		month_length[1]=leapyear(obs1.year)?29:28;	// check for leapyear
		while (obs1.day > month_length[obs1.month-1]) {
			obs1.day -= month_length[obs1.month-1];
			obs1.month++; 
			if (obs1.month == 13) {
				obs1.year++;
				obs1.month = 1;
			}
		}
	}
}		// end nextDate()


function dfrac2tstr(t) {
	// returns time string from fraction of day (0 <= t < 1). If t < 0 return '--:--'
	if (t < 0 || t >= 1) return "--:--";
	t1 = Math.round(1440*t);	// round to nearest minute
	var hours = Math.floor(t1/60);
	var minutes = t1 - 60*hours;
	return hmstring2(hours, minutes,0);
}


function pheader(doc,obj,obs,title,descrip,line1,line2) {
	// common code for page header
	var str = head1 + "Javascript: " + title + head2;
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p>\n";
	str += "<h2>" + title + "</h2><p><b>" + descrip + "</b></p>";
	if (obj>=0 && obj<100) str += "<h3>Object: " + bodies[obj].name + "</h3>";
	if (obj==100) str += "<h3>Object: All planets</h3>";
	str += "<p>Observer location: "+sitename();
	str += " (UT "+hmstring(-obs.tz/60.0,true)+")</p>\n";
	var line3="";
	for (var i=0; i<line2.length; i++) line3 += "-";
	str += "<pre>" + line1 + "\n" + line2 + "\n" + line3 + "\n";
	doc.write(str);
}		//	end pheader()


function pbottom(doc,pwin,line2) {
	// finish the page
	var line3="";
	for (var i=0; i<line2.length; i++) line3 += "-";
	var str = line3 + "</pre>\n";
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p>\n";
	str += "</CENTER></BODY></HTML>";
	doc.write(str);
	doc.close();
	pwin.focus();
}		// end pbottom()


function doTwilightAltAz(obs,obj,dspan,dstep,sunalt) {
	// Altitude of object at specified Sun depression (twilight visibility)
	var obscopy=new Object(); var obsmax=new Object();
	for (var i in obs) {
		obscopy[i] = obs[i]; obsmax[i] = obs[i];
	}
	obscopy.hours = 12;	// set to local noon
	obscopy.minutes = 0;
	if (dstep > 0 && dstep < 1.0) dstep = 1.0;	// time step must be at least one day

	var pwin=window.open("","twilight","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var descrip="at the times when the Sun is " + (-sunalt) + "&deg; below the horizon";
	var line1="                     Morning Twilight                    Evening Twilight  ";
	var line2="   Date          Time     Alt      Az   Elong       Time     Alt      Az   Elong";
	pheader(doc,obj,obs,"Twilight Altitude",descrip,line1,line2);
	nextDate(obsmax, dspan, obs.day);	// 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	while (true) {
		var jday=jd0(obscopy.year,obscopy.month,obscopy.day) + obscopy.tz/1440.0;
		if (jday >= jdmax) break;
		var rset=sunrise(obscopy,sunalt);
		// do line for current date
		doc.write(datestring(obscopy));
		for (var t=0; t<2; t++) {
			doc.write("      " + (rset[2] ? hmstring(rset[t+3],false) : "--:--"));
			if (rset[2]) {		// false if Sun never reaches specified altitude on this day
				bodies[obj].update(rset[t],obscopy);
				bodies[obj].elongupdate(rset[t],obscopy);
				doc.write("   " + fixnum(bodies[obj].alt, 5, 1));
				doc.write("  " + fixnum(bodies[obj].az, 6, 1));
				doc.write("  " + fixnum(bodies[obj].elong, 6, 1));
			}
			else doc.write("    --.-    --.-    --.-");
		}
		doc.writeln("");
		nextDate(obscopy,dstep); 
	}
	pbottom(doc,pwin,line2);
} 	// end doTwilightAltAz()


function doAltAz(obs,obj,dt) {
	// alt-az of object during one day in steps of dt minutes
	var obscopy=new Object();		// make working copy
	for (var i in obs) obscopy[i] = obs[i];
	var ostr = bodies[obj].name;
	var pwin = window.open("","pl_altitude","menubar,scrollbars,resizable");
	var doc = pwin.document;
	var line2="      Date    Time      Alt       Az     Sun    Moon";
	pheader(doc,obj,obs,"Alt-Azimuth"," ","",line2);
	var jday=jd(obscopy);
	// for each 0.5 hours do
	for (var t = 0; t < 1440/dt; t++) {
		doc.write(datestring(obscopy));
		doc.write("   " + hmstring2(obscopy.hours,obscopy.minutes,0));
		bodies[SUN].update(jday,obs);
		var sunalt = bodies[SUN].alt;
		bodies[MOON].update(jday,obs);
		var moonalt = bodies[MOON].alt;
		bodies[obj].update(jday,obs);
		doc.write("   " + fixnum(bodies[obj].alt,6,1));
		doc.write("   " + fixnum(bodies[obj].az,6,1) + "   ");
		if (sunalt > -0.833) doc.write("  Day");
		else if (sunalt > -6.0) doc.write("Civ-t");
		else if (sunalt > -12.0) doc.write("Nau-t");
		else if (sunalt > -18.0) doc.write("Ast-t");
		else doc.write(" Dark");
		if (moonalt > -0.833) doc.writeln("      Up");
		else doc.writeln("    Down");
		jday += dt/1440.0;
		adjustTime(obscopy,dt);
	}
	pbottom(doc,pwin,line2);
} 	// end doAltAz()


function doObjectData(obs,obj,dspan,dstep) {
	// list object physical data (diameter, illumination, distance, brightness)
	// eq. diameters at dist=1 AU/1km
	var obscopy=new Object(); var obsmax=new Object();
	for (var i in obs) {
		obscopy[i] = obs[i]; obsmax[i] = obs[i];
	}
	var pwin=window.open("","illumdiam","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var line1="    Date      Time  Dist(Sun) Dist(Earth)    Diam.  Illum.  Brightn.";
	var line2="                         [AU]       [km]       [\"]     [%]    [mag]";
	if (obj!=MOON) 
		line2="                         [AU]       [AU]       [\"]     [%]    [mag]";
	pheader(doc,obj,obs,"Object Data"," ",line1,line2);
	nextDate(obsmax, dspan, obs.day);	// 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	while (true) {
		var jday=jd(obscopy);
		if (jday >= jdmax) break;
		// do line for current date
		doc.write(datestring(obscopy));
		doc.write("   " + hmstring2(obscopy.hours, obscopy.minutes,0));
		bodies[obj].update(jday,obscopy);
		var dist = bodies[obj].dist;
		var r= bodies[obj].r;
		doc.write(fixnum(r,11,3) + "    " + (obj==MOON ? fixnum(dist,7,0) : fixnum(dist,7,3)));
		if (obj<COMET) {
			doc.write(fixnum(ndiam[obj]/dist,10,1));
			doc.write(fixnum(bodies[obj].illum*100,8,1));
		} else {
			doc.write("    ----.-   ---.-");
		}
		doc.writeln(fixnum(bodies[obj].mag,9,1));
		nextDate(obscopy, dstep, obs.day); 
	}
	pbottom(doc,pwin,line2);
} 	// end doObjectData()


function doPositions(obs,obj,dspan,dstep) {
	// RA, declination, longitude, latitude and elongation
	var obscopy=new Object(); var obsmax=new Object();
	for (var i in obs) {
		obscopy[i] = obs[i]; obsmax[i] = obs[i];
	}
	var pwin=window.open("","declination","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var descrip="Geocentric positions!";
	var line1="   Date       Time      RA        Dec      Alt.     Az.   Longitude  Latitude   Elongation";
	var line2="                      [h m s]    [&deg; \']      [&deg;]     [&deg;]     [&deg; \']      [&deg; \']        [&deg;]";
	pheader(doc,obj,obs,"Position",descrip,line1,line2);
	nextDate(obsmax, dspan, obs.day);	// 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	while (true) {
		var jday=jd(obscopy);
		if (jday >= jdmax) break;
		// do line for current date
		doc.write(datestring(obscopy));
		doc.write("   " + hmstring2(obscopy.hours, obscopy.minutes,0));
		bodies[obj].update(jday,obs);
		bodies[obj].elongupdate(jday,obs);
		var pa = bodies[obj].pa;
		doc.write("   " + hmsstring(bodies[obj].ra/15));
		doc.write("   " + anglestring(bodies[obj].dec,false,true));
		doc.write(fixnum(bodies[obj].alt,7,1));
		doc.write(fixnum(bodies[obj].az,8,1));
		doc.write("    " + anglestring(bodies[obj].eclon,true,true));
		doc.write("   " + anglestring(bodies[obj].eclat,false,true));
		doc.write(fixnum(bodies[obj].elong,8,1) + "&deg;" + (pa >= 180 ? " W" : " E"));
		doc.writeln(""); 
		nextDate(obscopy, dstep, obs.day); 
	}
	pbottom(doc,pwin,line2);
}		// end doPositions()


function doAllPlanets(obs) {
	// print data for all planets for ONE day. Positions are for local noon.
	var obscopy=new Object();
	for (var i in obs) {
		obscopy[i] = obs[i];
	}
	obscopy.hours = 0;	// set to local midnight
	obscopy.minutes = 0;
	var ndiam = [6.72, 16.68, 1, 9.36, 196.88, 165.46, 70.04, 67.0, 1, 1919.3, 716900000.0];	

	var pwin=window.open("","declination","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var descrip="Date: " + datestring(obscopy);
	var line1="Object     Rise  Transit   Set       RA        Dec       Elong     Dist     Diam    Illum  Brightn";
	var line2="                                   [h m s]    [deg]      [deg]   [AU/km]     [\"]     [%]    [mag]";
	pheader(doc,-1,obs,"Data for all planets",descrip,line1,line2);
	var objects=[9,10,0,1,3,4,5,6,7];
	for (var n in objects) {
		var obj=objects[n];
		var jday=jd(obscopy);
		doc.write(bodies[obj].name);
		// rise, transit, set
		var objevents = findEvents(obj,jday,obs);
		var rise=-1; var set=-1; var objtr = -1;
		for (var i=objevents.length-2; i>0; i--) {		// scan array for relevant events
			var t=objevents[i][0]; var e = objevents[i][1];
			if (e == -1) rise = t;
			if (e == 1) set = t;
			if (e == 0) objtr = t;
		}
		doc.write("   " + dfrac2tstr(rise));
		doc.write("   " + dfrac2tstr(objtr));
		doc.write("   " + dfrac2tstr(set));
		// positions
		bodies[obj].update(jday+0.5,obs);
		bodies[obj].elongupdate(jday+0.5,obs);
		var pa = bodies[obj].pa;
		doc.write("   " + hmsstring(bodies[obj].ra/15));
		doc.write("   " + anglestring(bodies[obj].dec,false,true));
		doc.write(" " + fixnum(bodies[obj].elong,6,1) + "&deg;" + (pa >= 180 ? " W" : " E"));
		var dist = bodies[obj].dist;
		doc.write("  " + (obj==MOON ? fixnum(dist,7,0) : fixnum(dist,7,3)));
		doc.write("  " + fixnum(ndiam[obj]/dist,7,1));
		doc.write("  " + fixnum(bodies[obj].illum*100,6,1));
		doc.writeln("   " + fixnum(bodies[obj].mag,5,1));
	}
	pbottom(doc,pwin,line2);
} 	// doAllPlanets()

exports.returnAllPlanets = function(obs) {
	// debugger;
	// print data for all planets for ONE day. Positions are for local noon.
	var obscopy=new Object();
	for (var i in obs) {
		obscopy[i] = obs[i];
	}
	// obscopy.hours = 0;	// set to local midnight
	// obscopy.minutes = 0;

	var ndiam = [6.72, 16.68, 1, 9.36, 196.88, 165.46, 70.04, 67.0, 1, 1919.3, 716900000.0];

	var objects=[9,10,0,1,3,4,5,6,7];

	var result = {
		observer: obs,
		coords: []
	};

	for (var n in objects) {
		var objData = {};
		var obj = objects[n]
		var jday = jd(obscopy);

		bodies[obj].update(jday, obs);
		bodies[obj].elongupdate(jday, obs);
		
		var pa = bodies[obj].pa;

		objData.name = bodies[obj].name.trim();
		objData.rightAscension = hmsstring(bodies[obj].ra/15);
		objData.declination = anglestring(bodies[obj].dec,false,true);
		objData.elong = (fixnum(bodies[obj].elong,6,1) + "&deg;" + (pa >= 180 ? " W" : " E")).trim();
		objData.dist = bodies[obj].dist;


		result.coords.push(objData);
	}
	return result;
}


function doSeparation(obs,obj1,obj2,dt) {
	var obscopy=new Object();		// make working copy
	for (var i in obs) obscopy[i] = obs[i];
	var pwin = window.open("","pl_altitude","menubar,scrollbars,resizable");
	var doc = pwin.document;
	var descrip = "of " + bodies[obj1].name + " and " + bodies[obj2].name;
	var line1 = "                        Object 1       Object 2";
	var line2 = "      Date    Time     Alt     Az     Separ.     PA    Occult.   Sun";
	pheader(doc,-1,obs,"Separation",descrip,line1,line2);
	var jday=jd(obscopy);
	// for each dt minutes do
	for (var t = 0; t < 1440/dt; t++) {
		doc.write(datestring(obscopy));
		doc.write("   " + hmstring2(obscopy.hours,obscopy.minutes,0));
		bodies[SUN].update(jday,obs);
		var sunalt = bodies[SUN].alt;
		bodies[obj1].update(jday,obs);
		bodies[obj2].update(jday,obs);
		alt1=bodies[obj1].alt; alt2=bodies[obj2].alt;
		az1=bodies[obj1].az; az2=bodies[obj2].az;
		doc.write("  " + fixnum(alt1,6,1) + "  " + fixnum(az1,6,1));
		var sep = separation(az1,az2,alt1,alt2);
		doc.write("  " + fixnum(sep[0],7,2) + "&deg;" + "  " + fixnum(sep[1],6,1) + "   ");
		touchd = (ndiam[obj1]/bodies[obj1].dist + ndiam[obj2]/bodies[obj2].dist)/(2*3600);
		if (touchd > sep[0])		// check if occultation (eclipse, transit)
			doc.write("  Yes   ");
		else
			doc.write("        "); 
		if (sunalt > -0.833) doc.write("  Day");
		else if (sunalt > -6.0) doc.write("Civ-t");
		else if (sunalt > -12.0) doc.write("Nau-t");
		else if (sunalt > -18.0) doc.write("Ast-t");
		else doc.write(" Dark");
		doc.writeln("");
		jday += dt/1440.0;
		adjustTime(obscopy,dt);
	}
	pbottom(doc,pwin,line2);
} 	// end doSeparation()


function doVisible(obs,deepsky,minalt,rasort) {
// show visible stars or DSO
	var obscopy=new Object();
	for (var i in obs) {obscopy[i] = obs[i];	}
	var pwin=window.open("","visible","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var descrip="Date: " + datestring(obscopy) + "  Time: " + hmstring2(obscopy.hours,obscopy.minutes,0);
	var line1="";
	var line2="Ident     Proper name         RA        Dec       Alt      Az      Rise  Transit   Set ";
	if (deepsky) 
		line2="Ident    Name          Const     RA        Dec       Alt      Az      Rise  Transit   Set ";
	pheader(doc,-1,obs,"Visible " + (deepsky?"Deep sky objects":"Stars"),descrip,line1,line2);

	var jday = jd(obscopy);
	var ord = new Array();	// for storing records of siderial time and index to catalogue
	var sid = local_sidereal(obs);
	for (var i=0; i<(deepsky?dso.length:stars.length); i++) {
		var h = parsecol(deepsky?dso[i].ra:stars[i].ra) - sid;	// negative hour angle
		if (h<0) h+=24; if (h>12) h-=24;
		ord[i] = new Array(h,i);	// 
	}
	if (rasort) isort(ord);		// sort according to transit time starting from north
	for (var k=0; k<(deepsky?dso.length:stars.length); k++) {
		i = ord[k][1];	
		var ra = (deepsky?dso[i].ra:stars[i].ra);
		var de = (deepsky?dso[i].de:stars[i].de);
		bodies[20].ra = parsecol(ra)*15;	// use User object as temporary object
		bodies[20].dec = parsecol(de);
		bodies[20].update(jday,obscopy);
		if (bodies[20].alt < minalt) continue;	// object not visible, skip it	
		if (deepsky) {
			doc.write(fixstr(dso[i].numb,9) + fixstr(dso[i].name,14) + " " + dso[i].cons);
		} 
		else {
			doc.write(fixstr(stars[i].star,6) + fixstr(stars[i].cons,4) + fixstr(stars[i].name,14))
		}
		doc.write("   " + hmsstring(bodies[20].ra/15));
		doc.write("   " + anglestring(bodies[20].dec,false,true));
		doc.write(" " + fixnum(bodies[20].alt,6,1));
		doc.write("   " + fixnum(bodies[20].az,6,1));

		var objevents = findEvents(20,jday-0.5,obs);	// center "day" on observation time
		var rise=-1; var set=-1; var objtr = -1;
		for (var j=objevents.length-2; j>0; j--) {		// scan array for relevant events
			var t=objevents[j][0]+jday-obs.tz/1440; t = t-Math.floor(t); 
			var e = objevents[j][1];
			if (e == -1) rise = t;
			if (e == 1) set = t;
			if (e == 0) objtr = t;
		}
		doc.write("    " + dfrac2tstr(rise));
		doc.write("   " + dfrac2tstr(objtr));
		doc.write("   " + dfrac2tstr(set));

		doc.writeln("");
	}

	pbottom(doc,pwin,line2);
}		// end doVisible()


function doDailyEvents(obs,obj,dspan,dstep, sunevents) {
	// List daily events (rise, set etc) for one object, optionally include solar events
	// obs is a reference variable, make a copy
	var obscopy=new Object(); var obsmax=new Object();
	for (var i in obs) {
		obscopy[i] = obs[i]; obsmax[i] = obs[i];
	}
	obscopy.hours = 0;	// set to local midnight
	obscopy.minutes = 0;
	if (dstep > 0 && dstep < 1.0) dstep = 1.0;	// time step must be at least one day
	var ostr = bodies[obj].name;
	var pwin=window.open("","daily","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var line1 = "               "; var line2 = "      Date     ";
	if (obj != SUN) {
		line1 += "  |         Object        ";
		line2 += "  |   Rise  Transit   Set ";
	}
	if (obj == SUN || sunevents) {
		line1 += "  |     Morning Twilight               Sun                Evening Twilight  ";
		line2 += "  |   Astr    Naut   Civil     Rise  Transit   Set     Civil    Naut    Astr";
	}
	pheader(doc,obj,obs,"Daily Events","",line1,line2);
	nextDate(obsmax, dspan, obs.day);	// 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	while (true) {
		var jday=jd0(obscopy.year,obscopy.month,obscopy.day) + obscopy.tz/1440.0;
		if (jday >= jdmax) break;
		// do line for current date
		if (obj != SUN) {
			var objevents = findEvents(obj,jday,obs);
			var rise=-1; var set=-1; var objtr = -1;
			for (var i=objevents.length-2; i>0; i--) {		// scan array for relevant events
				var t=objevents[i][0]; var e = objevents[i][1];
				if (e == -1) rise = t;
				if (e == 1) set = t;
				if (e == 0) objtr = t;
			}
		}
		if (sunevents || obj == SUN) {
			var events = findEvents(SUN,jday,obs);
			srise=-1; sset=-1; ctw_b=-1; ctw_e=-1; ntw_b=-1; ntw_e=-1;  atw_b=-1; atw_e=-1; 
			for (var i=events.length-2; i>0; i--) {
				var t = events[i][0]; var e = events[i][1];
				if (e == 0) suntr = t;
				else if (e == -1) srise=t;
				else if (e == 1) sset=t;
				else if (e == -2) ctw_b = t;
				else if (e == 2) ctw_e = t;
				else if (e == -3) ntw_b = t;
				else if (e == 3) ntw_e = t;
				else if (e == -4) atw_b = t;
				else if (e == 4) atw_e = t;
			}
		}
		var dw=Math.floor(jday+1.5)-7*Math.floor((jday+1.5)/7);
		doc.write(datestring(obscopy) + "  " + dow[dw]);
		if (obj != SUN) {
			doc.write("     " + dfrac2tstr(rise) + "   " + dfrac2tstr(objtr) + "   " + dfrac2tstr(set));
		}
		if (obj == SUN || sunevents) {
			doc.write("     " + dfrac2tstr(atw_b) + "   " + dfrac2tstr(ntw_b) + "   " + dfrac2tstr(ctw_b));
			doc.write("    " + dfrac2tstr(srise) + "   " + dfrac2tstr(suntr) + "   " + dfrac2tstr(sset));
			doc.write("    " + dfrac2tstr(ctw_e) + "   " + dfrac2tstr(ntw_e) + "   " + dfrac2tstr(atw_e));
		}
		doc.writeln("");
		nextDate(obscopy,dstep); 
	}
	pbottom(doc,pwin,line2);
}		// end doDailyEvents()


;// Javascript Astrotools
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


;// Extensions to the Math routines - Trig routines in degrees

// Copyright Peter Hayes 1999-2001, Ole Nielsen 2003-2004

var DEG2RAD = Math.PI/180.0;
var RAD2DEG = 180.0/Math.PI;

function rev(angle) 	{return angle-Math.floor(angle/360.0)*360.0;}		// 0<=a<360
function rev2(angle)	{var a = rev(angle); return (a>=180 ? a-360.0 : a);}	// -180<=a<180
function sind(angle) 	{return Math.sin(angle*DEG2RAD);}
function cosd(angle) 	{return Math.cos(angle*DEG2RAD);}
function tand(angle) 	{return Math.tan(angle*DEG2RAD);}
function asind(c) 		{return RAD2DEG*Math.asin(c);}
function acosd(c) 		{return RAD2DEG*Math.acos(c);}
function atand(c) 		{return RAD2DEG*Math.atan(c);}
function atan2d(y,x) 	{return RAD2DEG*Math.atan2(y,x);}

function log10(x) 		{return Math.LOG10E*Math.log(x);}

function sqr(x)			{return x*x;}
function cbrt(x)		{return Math.pow(x,1/3.0);}

function SGN(x) 		{ return (x<0)?-1:+1; }

;// The place, observatory definitions and daylight savings functions

// Copyright Ole Nielsen 2002-2003, Peter Hayes 1999-2001

function place(name,latitude,ns,longitude,we,zone,dss,dse) {
  this.name      = name;
  this.latitude  = latitude;
  this.ns        = ns;
  this.longitude = longitude;
  this.we        = we;
  this.zone      = zone;
  this.dss       = dss;
  this.dse       = dse;
}

// A selection of places
// Please leave Greenwich in the first entry as the default
// The second entry is my home town, I suggest you change it to yours
// is you keep a copy for your personal use.
// This database is based on Peter Hayes' original database with several places added

var atlas = new Array(
  new place("UK:Greenwich","51:28:38",0,"00:00:00",0,0,"3:5:0","10:5:0"),
  new place("NL:Rijswijk","52:02:00",0,"4:19:00",1,-60,"3:5:0","10:5:0"),
  new place("AT:Vienna","48:13:00",0,"16:22:00",1,-60,"3:5:0","10:5:0"),
  new place("AU:Melbourne","37:48:00",1,"144:58:00",1,-600,"10:5:0","03:5:0"),
  new place("AU:Perth","31:58:00",1,"115:49:00",1,-480,"10:5:0","03:5:0"),
  new place("BE:Brussels","50:50:00",0,"4:21:00",1,-60,"3:5:0","10:5:0"),
  new place("BR:Rio de Janeiro","22:54:00",1,"43:16:00",0,180,"",""),
  new place("CA:Calgary","51:03:00",0,"114:05:00",0,420,"04:1:0","10:5:0"),
  new place("CA:Halifax","44:35:00",0,"63:39:00",0,240,"04:1:0","10:5:0"),
  new place("CA:Toronto","43:39:00",0,"79:23:00",0,300,"04:1:0","10:5:0"),
  new place("CH:Zurich","47:22:40",0,"08:33:04",1,-60,"3:5:0","10:5:0"),
  new place("CL:Santiago","33:30:00",1,"70:40:00",0,240,"10:5:0","03:5:0"),
  new place("DE:Berlin","52:32:00",0,"13:25:00",1,-60,"3:5:0","10:5:0"),
  new place("DE:Frankfurt/Main","50:06:00",0,"8:41:00",1,-60,"3:5:0","10:5:0"),
  new place("DE:Hamburg","53:33:00",0,"10:00:00",1,-60,"3:5:0","10:5:0"),
  new place("DE:Munich","48:08:00",0,"11:35:00",1,-60,"3:5:0","10:5:0"),
  new place("DK:Copenhagen","55:43:00",0,"12:34:00",1,-60,"3:5:0","10:5:0"),
  new place("DK:Kolding","55:31:00",0,"9:29:00",1,-60,"3:5:0","10:5:0"),
  new place("DK:Aalborg","57:03:00",0,"9:51:00",1,-60,"3:5:0","10:5:0"),
  new place("DK:�rhus","56:10:00",0,"10:13:00",1,-60,"3:5:0","10:5:0"),
  new place("EG:Cairo","30:03:00",0,"31:15:00",1,-120,"",""),
  new place("ES:Madrid","40:25:00",0,"03:42:00",0,-60,"3:5:0","10:5:0"),
  new place("ES:Malaga","36:43:00",0,"04:25:00",0,-60,"3:5:0","10:5:0"),
  new place("ES:Las Palmas","28:08:00",0,"15:27:00",0,60,"3:5:0","10:5:0"),
  new place("FI:Helsinki","60:08:00",0,"25:00:00",1,-120,"3:5:0","10:5:0"),
  new place("FR:Bordeaux","44:50:00",0,"0:34:00",0,-60,"3:5:0","10:5:0"),
  new place("FR:Brest","48:24:00",0,"4:30:00",0,-60,"3:5:0","10:5:0"),
  new place("FR:Lille","50:38:00",0,"03:04:00",1,-60,"3:5:0","10:5:0"),
  new place("FR:Lyon","45:46:00",0,"04:50:00",1,-60,"3:5:0","10:5:0"),
  new place("FR:Marseille","43:18:00",0,"5:22:00",1,-60,"3:5:0","10:5:0"),
  new place("FR:Paris","48:48:00",0,"02:14:00",1,-60,"3:5:0","10:5:0"),
  new place("FR:Puimichel","43:58:00",0,"06:01:00",1,-60,"3:5:0","10:5:0"),
  new place("FR:Strasbourg","48:35:00",0,"7:45:00",1,-60,"3:5:0","10:5:0"),
  new place("GL:Nuuk","64:15:00",0,"51:34:00",0,180,"3:5:0","10:5:0"),
  new place("GR:Athens","38:00:00",0,"23:44:00",1,-120,"3:5:0","10:5:0"),
  new place("HK:Hong Kong","22:15:00",0,"114:11:00",1,-480,"",""),
  new place("HR:Zagreb","45:48:00",0,"15:58:00",1,-60,"3:5:0","10:5:0"),
  new place("IE:Dublin","53:19:48",0,"06:15:00",0,0,"3:5:0","10:5:0"),
  new place("IN:New Delhi","28:22:00",0,"77:13:00",1,-330,"",""),
  new place("IQ:Baghdad","33:20:00",0,"44:26:00",1,-180,"",""),
  new place("IR:Teheran","35:44:00",0,"51:30:00",1,-210,"",""),
  new place("IS:Reykjavik","64:09:00",0,"21:58:00",0,60,"3:5:0","10:5:0"),
  new place("IT:Milan","45:28:00",0,"9:12:00",1,-60,"3:5:0","10:5:0"),
  new place("IT:Palermo","38:08:00",0,"13:23:00",1,-60,"3:5:0","10:5:0"),
  new place("IT:Rome","41:53:00",0,"12:30:00",1,-60,"3:5:0","10:5:0"),
  new place("JP:Tokyo","35:70:00",0,"139:46:00",1,-540,"3:5:0","10:5:0"),
  new place("LU:Luxembourg","49:36:00",0,"6:09:00",1,-60,"3:5:0","10:5:0"),
  new place("NL:Amsterdam","52:22:23",0,"4:53:33",1,-60,"3:5:0","10:5:0"),
  new place("NL:Apeldoorn","52:13:00",0,"5:57:00",1,-60,"3:5:0","10:5:0"),
  new place("NL:Maastricht","50:51:00",0,"5:04:00",1,-60,"3:5:0","10:5:0"),
  new place("NL:Groningen","53:13:00",0,"6:33:00",1,-60,"3:5:0","10:5:0"),
  new place("NL:The Hague","52:05:00",0,"4:29:00",1,-60,"3:5:0","10:5:0"),
  new place("NL:Utrecht","52:05:10",0,"05:07:45",1,-60,"3:5:0","10:5:0"),
  new place("NO:Bergen","60:21:00",0,"5:20:00",1,-60,"3:5:0","10:5:0"),
  new place("NO:Oslo","59:56:00",0,"10:45:00",1,-60,"3:5:0","10:5:0"),
  new place("NO:Troms�","69:70:00",0,"19:00:00",1,-60,"3:5:0","10:5:0"),
  new place("NZ:Wellington","41:17:00",1,"174:47:00",1,-720,"10:5:0","03:5:0"),
  new place("PL:Warszawa","52:15:00",0,"21:00:00",1,-60,"3:5:0","10:5:0"),
  new place("PT:Faro","37:01:00",0,"7:56:00",0,0,"3:5:0","10:5:0"),
  new place("PT:Lisbon","38:44:00",0,"9:08:00",0,0,"3:5:0","10:5:0"),
  new place("PR:San Juan","18:28:00",0,"66:08:00",0,240,"04:1:0","10:5:0"),
  new place("RO:Bucharest","44:25:00",0,"26:07:00",1,-120,"3:5:0","10:5:0"),
  new place("RU:Irkutsk","52:18:00",0,"104:15:00",1,-480,"3:5:0","10:5:0"),
  new place("RU:Moscow","55:45:00",0,"37:35:00",1,-180,"3:5:0","10:5:0"),
  new place("RU:Omsk","55:00:00",0,"73:22:00",1,-360,"3:5:0","10:5:0"),
  new place("SE:Gothenburg","57:43:00",0,"11:58:00",1,-60,"3:5:0","10:5:0"),
  new place("SE:Stockholm","59:35:00",0,"18:06:00",1,-60,"3:5:0","10:5:0"),
  new place("SE:Lule�","65:35:00",0,"22:09:00",1,-60,"3:5:0","10:5:0"),
  new place("SG:Singapore","01:20:00",0,"103:50:00",1,-450,"",""),
  new place("VC:Kingstown","13:15:00",0,"61:12:00",0,240,"",""),
  new place("UK:Birmingham","52:30:00",0,"01:49:48",0,0,"3:5:0","10:5:0"),
  new place("UK:Belfast","54:34:48",0,"05:55:12",0,0,"3:5:0","10:5:0"),
  new place("UK:Cambridge","52:10:00",0,"00:06:00",0,0,"3:5:0","10:5:0"),
  new place("UK:Cardiff","51:30:00",0,"03:12:00",0,0,"3:5:0","10:5:0"),
  new place("UK:Edinburgh","55:55:48",0,"03:13:48",0,0,"3:5:0","10:5:0"),
  new place("UK:London","51:30:00",0,"00:10:12",0,0,"3:5:0","10:5:0"),
  new place("US:Anchorage","61:10:00",0,"149:53:00",0,560,"04:1:0","10:5:0"),
  new place("US:Dallas","32:48:00",0,"96:48:00",0,360,"04:1:0","10:5:0"),
  new place("US:Denver","39:45:00",0,"104:59:00",0,420,"04:1:0","10:5:0"),
  new place("US:Honolulu","21:19:00",0,"157:86:00",0,600,"04:1:0","10:5:0"),
  new place("US:Los Angeles","34:03:15",0,"118:14:28",0,480,"04:1:0","10:5:0"),
  new place("US:Miami","25:47:00",0,"80:20:00",0,300,"04:1:0","10:5:0"),
  new place("US:Minneapolis","44:58:01",0,"93:15:00",0,360,"04:1:0","10:5:0"),
  new place("US:Seattle","47:36:00",0,"122:19:00",0,480,"04:1:0","10:5:0"),
  new place("US:Washington DC","38:53:51",0,"77:00:33",0,300,"04:1:0","10:5:0"),
  new place("VC:St Vincent","13:15:00",0,"61:12:00",0,240,"",""),
  new place("ZA:Cape Town","33:56:00",1,"18:28:00",1,-120,"",""),
  new place("ZM:Lusaka","15:26:00",1,"28:20:00",1,-120,"","")
);


function observatory(place,year,month,day,hr,min,sec) {
// The observatory object holds local date and time,
// timezone correction in minutes with daylight saving if applicable,
// latitude and longitude (west is positive)
	this.name = place.name;
	this.year = year;
	this.month = month;
	this.day = day;
	this.hours = hr;
	this.minutes = min;
	this.seconds = sec;
	this.tz = place.tz;
	this.dst = false;	// is it DST?
	this.latitude = place.latitude;
	this.longitude = place.longitude;
}

// The default observatory (Greenwich noon Jan 1 2000) 
// changed by user setting place and time from menu

var observer  = new observatory(atlas[0],2000,1,1,12,0,0);

// Site name returns name and latitude / longitude as a string
function sitename() {
  var sname=observer.name;
  var latd=Math.abs(observer.latitude)+0.00001;
  var latdi=Math.floor(latd);
  sname+=((latdi < 10) ? " 0" : " ") + latdi;
  latm=60*(latd-latdi); latmi=Math.floor(latm);
  sname+=((latmi < 10) ? ":0" : ":") + latmi;
//  lats=60*(latm-latmi); latsi=Math.floor(lats);
//  sname+=((latsi < 10) ? ":0" : ":") + latsi;
  sname+=((observer.latitude >= 0) ? " N, " : " S, ");
  var longd=Math.abs(observer.longitude)+0.00001;
  var longdi=Math.floor(longd);
  sname+=((longdi < 10) ? "0" : "") + longdi;
  longm=60*(longd-longdi); longmi=Math.floor(longm);
  sname+=((longmi < 10) ? ":0" : ":") + longmi;
//  longs=60*(longm-longmi); longsi=Math.floor(longs);
//  sname+=((longsi < 10) ? ":0" : ":") + longsi;
  sname+=((observer.longitude >= 0) ? " W" : " E");
  return sname;
}	// sitename()


function checkdst(obs) {
	// Check DST is an attempt to check daylight saving, its not perfect.
	// Returns 0 or -60 that is amount to remove to get to zone time.
	// this function is now only called when selecting a place from the dropdown list. No dst check when updating the time!
	// We only know daylight saving if in the atlas
	if ((tbl.Place.selectedIndex < 0) || (tbl.Place.selectedIndex >= atlas.length))
		return 0;
	var dss=atlas[tbl.Place.selectedIndex].dss;
	var dse=atlas[tbl.Place.selectedIndex].dse;
	var ns=atlas[tbl.Place.selectedIndex].ns;
	if (dss.length==0) return 0;
	if (dse.length==0) return 0;
	// parse the daylight saving start & end dates
	var col1=dss.indexOf(":");
	var col2=dss.lastIndexOf(":");
	var col3=dss.length;
	var dssm=parseInt(dss.substring(0,col1),10);
	var dssw=parseInt(dss.substring(col1+1,col2),10);
	var dssd=parseInt(dss.substring(col2+1,col3),10);
	col1=dse.indexOf(":");
	col2=dse.lastIndexOf(":");
	col3=dse.length;
	var dsem=parseInt(dse.substring(0,col1),10);
	var dsew=parseInt(dse.substring(col1+1,col2),10);
	var dsed=parseInt(dse.substring(col2+1,col3),10);
	// Length of months
	// year,month,day and day of week
	var jdt=jd0(obs.year,obs.month,obs.day);
	var ymd=jdtocd(jdt);
	// first day of month - we need to know day of week
	var fymd=jdtocd(jdt-ymd[2]+1);
	// look for daylight saving / summertime changes
	// first the simple month checks
	// Test for the northern hemisphere
	if (ns==0) {
		if ((ymd[1]>dssm) && (ymd[1]<dsem)) return -60;
		if ((ymd[1]<dssm) || (ymd[1]>dsem)) return 0;
	} 
	else{
		// Southern hemisphere, New years day is summer.
		if ((ymd[1]>dssm) || (ymd[1]<dsem)) return -60;
		if ((ymd[1]<dssm) && (ymd[1]>dsem)) return 0;
	}
	// check if we are in month of change over
	if (ymd[1]==dssm) { // month of start of summer time
		// date of change over
		var ddd=dssd-fymd[3]+1;
		ddd=ddd+7*dssw;
		while (ddd>month_length[ymd[1]-1]) ddd-=7;
		if (ymd[2]<ddd) return 0;
		// assume its past the change time, its impossible
		// to know if the change has occured.
		return -60;
	} 
	if (ymd[1]==dsem) { // month of end of summer time
		// date of change over
		var ddd=dsed-fymd[3]+1;
		ddd=ddd+7*dsew;
		while (ddd>month_length[ymd[1]-1]) ddd-=7;
		if (ymd[2]<ddd) return -60;
		// see comment above for start time
		return 0;
	}
	return 0;
}	// checkdst()


function jd(obs) {
// The Julian date at observer time
  var tz = obs.tz || 0;

	var j = jd0(obs.year,obs.month,obs.day);
	j+=(obs.hours+((obs.minutes+tz)/60.0)+(obs.seconds/3600.0))/24;
	return j;
}	// jd()


function local_sidereal(obs) {
// sidereal time in hours for observer
	var res=g_sidereal(obs.year,obs.month,obs.day);
	res+=1.00273790935*(obs.hours+(obs.minutes+obs.tz+(obs.seconds/60.0))/60.0);
	res-=obs.longitude/15.0;
	while (res < 0) res+=24.0;
	while (res > 24) res-=24.0;
	return res;
}

;// Functions for the planets

// Copyright Ole Nielsen 2002-2004
// Please read copyright notice in astrotools2.html source

// Formulae and elements from Paul Schlyter's article "Computing planetary positions" available at 
// http://hem.passagen.se/pausch/comp/ppcomp.html

MERCURY = 0; VENUS = 1; EARTH = 2; MARS = 3; JUPITER = 4; SATURN = 5; 
URANUS = 6; NEPTUNE = 7; SUN = 9; MOON = 10; COMET = 15; USER = 20;

// Planet diameters at 1 AU in arcsec (km for Moon)
var ndiam = [6.72, 16.68, 1, 9.36, 196.88, 165.46, 70.04, 67.0, 1, 1919.3, 716900000.0];

// The planet object

function planet(name,num,N,i,w,a,e,M) {
	this.name=name;
	this.num=num;
	this.N=N; 	// longitude of ascending node
	this.i=i;		// inclination
	this.w=w;	// argument of perihelion
	this.a=a;	// semimajor axis
	this.e=e;		// eccentricity
	this.M=M;	// mean anomaly
}

// elements from Paul Schlyter
var planets=new Array();
planets[0]=new planet("Mercury",0,
   new Array(48.3313, 3.24587E-5),
   new Array(7.0047, 5.00E-8),
   new Array(29.1241, 1.01444E-5),
   new Array(0.387098, 0),
   new Array(0.205635, 5.59E-10),
   new Array(168.6562, 4.0923344368));

planets[1]=new planet("Venus  ",1,
   new Array(76.6799, 2.46590E-5),
   new Array(3.3946, 2.75E-8),
   new Array(54.8910, 1.38374E-5),
   new Array(0.723330, 0),
   new Array(0.006773, -1.302E-9),
   new Array(48.0052, 1.6021302244));

planets[2]=new planet("Earth  ",2,
   new Array(0,0),
   new Array(0,0),
   new Array(0,0),
   new Array(0.0, 0.0),
   new Array(0.0, 0.0),
   new Array(0,0));

planets[3]=new planet("Mars   ",3,
   new Array(49.5574, 2.11081E-5),
   new Array(1.8497, -1.78E-8),
   new Array(286.5016, 2.92961E-5),
   new Array(1.523688, 0),
   new Array(0.093405, 2.516E-9),
   new Array(18.6021, 0.5240207766));

planets[4]=new planet("Jupiter",4,
   new Array(100.4542, 2.76854E-5),
   new Array(1.3030, -1.557E-7),
   new Array(273.8777, 1.64505E-5),
   new Array(5.20256, 0),
   new Array(0.048498, 4.469E-9),
   new Array(19.8950, 0.0830853001));

planets[5]=new planet("Saturn ",5,
	new Array(113.6634, 2.38980E-5),
	new Array(2.4886, -1.081E-7),
	new Array(339.3939, 2.97661E-5),
	new Array(9.55475, 0),
	new Array(0.055546, -9.499E-9),
	new Array(316.9670, 0.0334442282));

planets[6]=new planet("Uranus ",6,
	new Array(74.0005, 1.3978E-5),
	new Array(0.7733, 1.9E-8),
	new Array(96.6612, 3.0565E-5),
	new Array(19.18171, -1.55E-8),
	new Array(0.047318, 7.45E-9),
	new Array(142.5905, 0.011725806));

planets[7]=new planet("Neptune",7,
	new Array(131.7806, 3.0173E-5),
	new Array(1.7700, -2.55E-7),
	new Array(272.8461, -6.027E-6),
	new Array(30.05826, 3.313E-8),
	new Array(0.008606, 2.15E-9),
	new Array(260.2471, 0.005995147));

// Body holds current data of planet, Sun or Moon), method .update(jday,obs)
function Body(name,number,colour,colleft,colright) {
	this.name=name;
	this.number=number;
	this.colour=colour;
	this.colleft=colleft;
	this.colright=colright;
	this.alt=0;
	this.az=0;
	this.dec=0;
	this.ra=0;
	this.H=0;
	this.eclon=0;
	this.eclat=0;
	this.illum=1;
	this.r=1;	// heliocentric distance
	this.dist=1;	//geocentric distance
	this.mag=-1.0;
	this.elong=0;
	this.pa=0;	// position angle (elongation)
	this.update=updatePosition;	
	this.elongupdate=updateElong;
}

bodies = new Array();
bodies[0] = new Body("Mercury",MERCURY,0,24,25);
bodies[1] = new Body("Venus  ",VENUS,1,24,25);
bodies[2] = new Body("Earth  ",2,3,24,25);
bodies[3] = new Body("Mars   ",MARS,3,24,25);
bodies[4] = new Body("Jupiter",JUPITER,4,24,25);
bodies[5] = new Body("Saturn ",SATURN,5,24,25);
bodies[6] = new Body("Uranus ",URANUS,6,24,25);
bodies[7] = new Body("Neptune",NEPTUNE,7,24,25);
bodies[8] = new Body("",8,0,0,0);
bodies[9] = new Body("Sun    ",SUN,9,26,27);
bodies[10] = new Body("Moon   ",MOON,10,28,29);
bodies[COMET] = new Body("Comet  ",COMET,2,24,25);
bodies[20] = new Body("User object",USER,2,24,25);

function updatePosition(jday,obs) {
// update body-object with current positions
// elongation NOT calculated! (use updateElong for that)
	this.p=this.number;
	if (this.p==USER) {		// fixed/user object
		var altaz=radec2aa(this.ra, this.dec, jday, obs);
		this.alt=altaz[0];
		this.az=altaz[1];
		this.H=altaz[2];
		return;
	}
	var dat=PlanetAlt(this.p,jday,obs);
	this.alt=dat[0];
	this.az=dat[1];
	this.H=dat[2];
	this.ra=dat[3];
	this.dec=dat[4] - (dat[4]>180.0 ? 360 : 0);
	this.eclon=rev(dat[5]);
	this.eclat=dat[6];
	this.r=dat[8];
	this.dist=dat[9];
	this.illum=dat[7];
	this.mag=dat[10];
}

function updateElong(jday,obs) {
	// calculate elongation for object
	if (this.number==SUN) return;
	bodies[SUN].update(jday,obs); 
	var ra2=bodies[SUN].ra; var dec2=bodies[SUN].dec;
	this.update(jday,obs);
	var dat = separation(this.ra, ra2, this.dec, dec2);
	this.elong = dat[0];
	this.pa = dat[1];
}

// heliocentric xyz for planet p
// this is not from Meeus' book, but from Paul Schlyter http://hem.passagen.se/pausch/comp/ppcomp.html
// account for pertuberations of Jupiter, Saturn, Uranus (Uranus and Neptune mutual pertubs are included in elements)
// returns heliocentric x, y, z, distance, longitude and latitude of object
function helios(p,jday) {
	var d = jday-2451543.5;
	var w = p.w[0] + p.w[1]*d;		// argument of perihelion
	var e = p.e[0] + p.e[1]*d; 
	var a = p.a[0] + p.a[1]*d;
	var i = p.i[0] + p.i[1]*d;
	var N = p.N[0] + p.N[1]*d;
	var M = rev( p.M[0] + p.M[1]*d ); 	// mean anomaly
	var E0 = M + RAD2DEG*e*sind(M) * ( 1.0+e*cosd(M) );
	var E1 = E0 - ( E0-RAD2DEG*e*sind(E0)-M ) / ( 1.0-e*cosd(E0) );
	while (Math.abs(E0-E1) > 0.0005) {
		E0 = E1;
		E1 = E0 - ( E0 - RAD2DEG*e*sind(E0)-M ) / ( 1.0-e*cosd(E0) );
	}
	var xv = a*(cosd(E1) - e);
	var yv = a*Math.sqrt(1.0 - e*e) * sind(E1);
	var v = rev(atan2d( yv, xv ));		// true anomaly
	var r = Math.sqrt( xv*xv + yv*yv );	// distance
	var xh = r * ( cosd(N)*cosd(v+w) - sind(N)*sind(v+w)*cosd(i) );
	var yh = r * ( sind(N)*cosd(v+w) + cosd(N)*sind(v+w)*cosd(i) );
	var zh = r * ( sind(v+w)*sind(i) );
	var lonecl = atan2d(yh, xh);
	var latecl = atan2d(zh, Math.sqrt(xh*xh + yh*yh + zh*zh));
	if (p.num==JUPITER) {		// Jupiter pertuberations by Saturn
		var Ms = rev(planets[SATURN].M[0] + planets[SATURN].M[1]*d);
		lonecl += (-0.332)*sind(2*M-5*Ms-67.6) - 0.056*sind(2*M-2*Ms+21) + 0.042*sind(3*M-5*Ms+21) -
				0.036*sind(M-2*Ms) + 0.022*cosd(M-Ms) + 0.023*sind(2*M-3*Ms+52) - 0.016*sind(M-5*Ms-69);
		xh=r*cosd(lonecl)*cosd(latecl);		// recalc xh, yh
		yh=r*sind(lonecl)*cosd(latecl);
	}
	if (p.num==SATURN) {		// Saturn pertuberations
		var Mj = rev(planets[JUPITER].M[0] + planets[JUPITER].M[1]*d);
		lonecl += 0.812*sind(2*Mj-5*M-67.6) - 0.229*cosd(2*Mj-4*M-2) + 0.119*sind(Mj-2*M-3) + 
				0.046*sind(2*Mj-6*M-69) + 0.014*sind(Mj-3*M+32);
		latecl += -0.020*cosd(2*Mj-4*M-2) + 0.018*sind(2*Mj-6*M-49);
		xh = r*cosd(lonecl)*cosd(latecl);		// recalc xh, yh, zh
		yh = r*sind(lonecl)*cosd(latecl);
    	zh = r*sind(latecl);
	}
	if (p.num==URANUS) {		// Uranus pertuberations
		var Mj = rev(planets[JUPITER].M[0] + planets[JUPITER].M[1]*d);
		var Ms = rev(planets[SATURN].M[0] + planets[SATURN].M[1]*d);
		lonecl += 0.040*sind(Ms-2*M+6) + 0.035*sind(Ms-3*M+33) - 0.015*sind(Mj-M+20);
		xh=r*cosd(lonecl)*cosd(latecl);		// recalc xh, yh
		yh=r*sind(lonecl)*cosd(latecl);
	}
	return new Array(xh,yh,zh,r,lonecl,latecl);
}	// helios()


function radecr(obj,sun,jday,obs) {
// radecr returns ra, dec and earth distance
// obj and sun comprise Heliocentric Ecliptic Rectangular Coordinates
// (note Sun coords are really Earth heliocentric coordinates with reverse signs)
		// Equatorial geocentric co-ordinates
		var xg=obj[0]+sun[0];
		var yg=obj[1]+sun[1];
		var zg=obj[2];
		// Obliquity of Ecliptic (exponent corrected, was E-9!)
		var obl = 23.4393 - 3.563E-7 * (jday-2451543.5);
		// Convert to eq. co-ordinates
		var x1=xg;
		var y1=yg*cosd(obl) - zg*sind(obl);
		var z1=yg*sind(obl) + zg*cosd(obl);
		// RA and dec (33.2)
		var ra=rev(atan2d(y1, x1));
		var dec=atan2d(z1, Math.sqrt(x1*x1+y1*y1));
		var dist=Math.sqrt(x1*x1+y1*y1+z1*z1);
		return new Array(ra,dec,dist);
} 


function radec2aa(ra,dec,jday,obs) {
// Convert ra/dec to alt/az, also return hour angle, azimut = 0 when north
// DOES NOT correct for parallax!
// TH0=Greenwich sid. time (eq. 12.4), H=hour angle (chapter 13)
		var TH0 = 280.46061837 + 360.98564736629*(jday-2451545.0);
		var H = rev(TH0-obs.longitude-ra);
		var alt = asind( sind(obs.latitude)*sind(dec) + cosd(obs.latitude)*cosd(dec)*cosd(H) );
		var az = atan2d( sind(H), (cosd(H)*sind(obs.latitude) - tand(dec)*cosd(obs.latitude)) );
		return new Array (alt, rev(az+180.0), H);
}


function separation(ra1, ra2, dec1, dec2) {		
// ra, dec may also be long, lat, but PA is relative to the chosen coordinate system
	var d = acosd(sind(dec1)*sind(dec2) + cosd(dec1)*cosd(dec2)*cosd(ra1-ra2));		// (Meeus 17.1)
	if (d < 0.1) d = Math.sqrt(sqr( rev2(ra1-ra2)*cosd((dec1+dec2)/2) ) + sqr(dec1-dec2));	// (17.2)
	var pa = atan2d(sind(ra1-ra2),cosd(dec2)*tand(dec1)-sind(dec2)*cosd(ra1-ra2));		// angle
	return new Array(d, rev(pa));
}	// end separation()


function PlanetAlt(p,jday,obs) {
// Alt/Az, hour angle, ra/dec, ecliptic long. and lat, illuminated fraction, dist(Sun), dist(Earth), brightness of planet p
		if (p==SUN) return SunAlt(jday,obs);
		if (p==MOON) return MoonPos(jday,obs);
		if (p==COMET) return CometAlt(jday,obs);
		var sun_xyz = sunxyz(jday);
		var planet_xyz = helios(planets[p],jday);

		var dx = planet_xyz[0]+sun_xyz[0];
		var dy = planet_xyz[1]+sun_xyz[1];
		var dz = planet_xyz[2]+sun_xyz[2];
		var lon = rev( atan2d(dy, dx) );
		var lat = atan2d(dz, Math.sqrt(dx*dx+dy*dy));

		var radec = radecr(planet_xyz, sun_xyz, jday, obs);
		var ra = radec[0]; 
		var dec = radec[1];
		var altaz = radec2aa(ra, dec, jday, obs);

		var dist = radec[2];
		var R = sun_xyz[3];	// Sun-Earth distance
		var r = planet_xyz[3];	// heliocentric distance
		var k = ((r+dist)*(r+dist)-R*R) / (4*r*dist);		// illuminated fraction (41.2) 
		// brightness calc according to Meeus p. 285-86 using Astronomical Almanac expressions
		var absbr = new Array(-0.42, -4.40, 0, -1.52, -9.40, -8.88, -7.19, -6.87);
		var i = acosd( (r*r+dist*dist-R*R) / (2*r*dist) );	// phase angle
		var mag = absbr[p] + 5 * log10(r*dist);	// common for all planets
		switch(p) {
		case MERCURY:
			mag += i*(0.0380 + i*(-0.000273 + i*0.000002)); break;
		case VENUS:
			mag += i*(0.0009 + i*(0.000239 - i*0.00000065)); break;
		case MARS:
			mag += i*0.016; break;
		case JUPITER:
			mag += i*0.005; break;
		case SATURN:	// (Ring system needs special treatment, see Meeus Ch. 45)
			var T = (jday-2451545.0)/36525;		// (22.1)
			var incl = 28.075216 - 0.012998*T + 0.000004*T*T;	// (45.1)
			var omega = 169.508470 + 1.394681*T + 0.000412*T*T;	// (45.1)
			var B = asind(sind(incl)*cosd(lat)*sind(lon-omega) - cosd(incl)*sind(lat));
			var l = planet_xyz[4];	// heliocentric longitude of Saturn
			var b = planet_xyz[5];	// heliocentric latitude (do not confuse with 'b' in step 6, page 319)
			// correction for Sun's aberration skipped
			var U1 = atan2d(sind(incl)*sind(b)+cosd(incl)*cosd(b)*sind(l-omega), cosd(b)*cosd(l-omega));
			var U2 = atan2d(sind(incl)*sind(lat)+cosd(incl)*cosd(lat)*sind(lon-omega), cosd(lat)*cosd(lon-omega));
			var dU = Math.abs(U1 - U2);
			mag += 0.044*dU - 2.60*sind(Math.abs(B)) + 1.25*sind(B)*sind(B);
			break;
		}
		return new Array (altaz[0], altaz[1], altaz[2], ra, dec, lon, lat, k, r, dist, mag); 
}

;// The star catalog object and selection of stars from St�phane Macrez

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

;// SUN and MOON
// Alternative version of Sun position based on Schlyter's method

// Copyright Ole Nielsen 2002-2004
// Please read copyright notice in astrotools2.html source

// 'Meeus' means "Astronomical Algorithms", 2nd ed. by Jean Meeus

// ecliptic position of the Sun relative to Earth (basically simplified version of planetxyz calc)
function sunxyz(jday) {
	// return x,y,z ecliptic coordinates, distance, true longitude
	// days counted from 1999 Dec 31.0 UT
	var d=jday-2451543.5;
	var w = 282.9404 + 4.70935E-5 * d;		// argument of perihelion
	var e = 0.016709 - 1.151E-9 * d; 
	var M = rev(356.0470 + 0.9856002585 * d); // mean anomaly
	var E = M + e*RAD2DEG * sind(M) * ( 1.0 + e * cosd(M) );
	var xv = cosd(E) - e;
	var yv = Math.sqrt(1.0 - e*e) * sind(E);
	var v = atan2d( yv, xv );		// true anomaly
	var r = Math.sqrt( xv*xv + yv*yv );	// distance
	var lonsun = rev(v + w);	// true longitude
	var xs = r * cosd(lonsun);		// rectangular coordinates, zs = 0 for sun 
	var ys = r * sind(lonsun);
	return new Array(xs,ys,0,r,lonsun,0);
}

function SunAlt(jday,obs) {
// return alt, az, time angle, ra, dec, ecl. long. and lat=0, illum=1, 0, dist, brightness 
	var sdat=sunxyz(jday);
	var ecl = 23.4393 - 3.563E-7 * (jday-2451543.5); 
	var xe = sdat[0];
	var ye = sdat[1]*cosd(ecl);
	var ze = sdat[1]*sind(ecl);
	var ra = rev(atan2d(ye,xe));
	var dec = atan2d(ze, Math.sqrt(xe*xe+ye*ye));
	var topo=radec2aa(ra,dec,jday,obs);
	return new Array( topo[0] , topo[1] , topo[2] , ra , dec , sdat[4], 0, 1, 0, sdat[3], -26.74 );
}


// Sun rise and set times (if twilight==-0.833) or desired twilight time. Return julian days
function sunrise(obs,twilight) {
	// obs is a reference variable make a copy
	var obscopy=new Object();
	for (var i in obs) obscopy[i] = obs[i];
	obscopy.hours=12;
	obscopy.minutes=0;
	obscopy.seconds=0;
	var riseset=new Array(0.0, 0.0, false, 0.0, 0.0);
	var lst=local_sidereal(obscopy);
	var jday=jd(obscopy);
	var radec = SunAlt(jday, obscopy);
	var ra = radec[3]; var dec = radec[4];
	var UTsun=12.0+ra/15.0-lst;
	if (UTsun < 0.0) UTsun+=24.0;
	if (UTsun > 24.0) UTsun-=24.0;
	var cosLHA = (sind(twilight)-sind(obs.latitude)*sind(dec)) / (cosd(obs.latitude)*cosd(dec));
	// Check for midnight sun and midday night. "riseset[2]" false if no rise and set found
	riseset[2]=false;
	if (cosLHA <= 1.0 && cosLHA >= -1.0) {
		// rise/set times allowing for not today.
		riseset[2]=true;
		var lha=acosd(cosLHA)/15.0;
		if ((UTsun-lha) < 0.0) {
			var rtime=24.0+UTsun-lha;
		} else {
			var rtime=UTsun-lha;
		}
		riseset[0]=jday+rtime/24.0-0.5;
		if ((UTsun+lha) > 24.0) {
			var stime=UTsun+lha-24.0;
		} else {
			var stime=UTsun+lha;
			riseset[4]=stime;
		}
		riseset[1]=jday+stime/24.0-0.5;
		// riseset[3] and [4] are times in UT hours
		riseset[3]=rtime;
		riseset[4]=stime;
	}
	return(riseset);
}


function MoonPos(jday,obs) {
// MoonPos calculates the Moon position and distance, based on Meeus chapter 47
// and the illuminated percentage from Meeus equations 48.4 and 48.1
// OPN: This version of MoonPos calculates the position to a precision of about 2' or so
// All T^2, T^3 and T^4 terms skipped. NB: Time is not taken from obs but from jday (julian day)
// Returns alt, az, hour angle, ra, dec (geocentr!), eclip. long and lat (geocentr!), 
// illumination, distance, brightness and phase angle 
	var T=(jday-2451545.0)/36525;
	// Moons mean longitude L'
	var LP=rev(218.3164477+481267.88123421*T);
	// Moons mean elongation
	var D=rev(297.8501921+445267.1114034*T);
	// Suns mean anomaly
	var M=rev(357.5291092+35999.0502909*T);
	// Moons mean anomaly M'
	var MP=rev(134.9633964+477198.8675055*T);
	// Moons argument of latitude
	var F=rev(93.2720950+483202.0175233*T);
	// The "further arguments" A1, A2 and A3  and the term E have been ignored
	// Sum of most significant terms from table 45.A and 45.B (terms less than 0.004 deg / 40 km dropped)
	var Sl = 6288774*sind(MP) + 1274027*sind(2*D-MP) + 658314*sind(2*D) + 213618*sind(2*MP) -
		185116*sind(M) - 114332*sind(2*F) + 58793*sind(2*D-2*MP) + 57066*sind(2*D-M-MP) +
		53322*sind(2*D+MP) + 45758*sind(2*D-M) - 40923*sind(M-MP) - 34720*sind(D) - 
		30383*sind(M+MP) + 15327*sind(2*D-2*F) - 12528*sind(MP+2*F) + 10980*sind(MP-2*F) +
		10675*sind(4*D-MP) + 10034*sind(3*MP) + 8548*sind(4*D-2*MP) - 7888*sind(2*D+M-MP) -
		6766*sind(2*D+M) - 5163*sind(D-MP) + 4987*sind(D+M) + 4036*sind(2*D-M+MP);
	var Sb = 5128122*sind(F) + 280602*sind(MP+F) + 277602*sind(MP-F) + 173237*sind(2*D-F) +
		55413*sind(2*D-MP+F) + 46271*sind(2*D-MP-F) + 32573*sind(2*D+F) + 17198*sind(2*MP+F) +
		9266*sind(2*D+MP-F) + 8822*sind(2*MP-F) + 8216*sind(2*D-M-F) + 4324*sind(2*D-2*MP-F) +
		4200*sind(2*D+MP+F);
	var Sr = (-20905355)*cosd(MP) - 3699111*cosd(2*D-MP) - 2955968*cosd(2*D) - 569925*cosd(2*MP) +
		246158*cosd(2*D-2*MP) - 152138*cosd(2*D-M-MP) - 170733*cosd(2*D+MP) - 204586*cosd(2*D-M) -
		129620*cosd(M-MP) + 108743*cosd(D) + 104755*cosd(M+MP) + 79661*cosd(MP-2*F) + 48888*cosd(M);
	// geocentric longitude, latitude
	var mglong = rev(LP+Sl/1000000.0);
	var mglat = Sb/1000000.0;
	// Obliquity of Ecliptic
	var obl = 23.4393-3.563E-7*(jday-2451543.5);
	var ra = rev(atan2d(sind(mglong)*cosd(obl)-tand(mglat)*sind(obl),cosd(mglong)));
	var dec = asind(sind(mglat)*cosd(obl)+cosd(mglat)*sind(obl)*sind(mglong));
	var moondat=radec2aa(ra,dec,jday,obs);
	// phase angle (48.4)
	var pa = Math.abs(180.0 - D - 6.289*sind(MP) + 2.100*sind(M) - 1.274*sind(2*D-MP) - 
		0.658*sind(2*D) - 0.214*sind(2*MP) - 0.11*sind(D));
	var k = (1+cosd(pa))/2;
	var mr = Math.round(385000.56+Sr/1000.0);
	var h = moondat[0];
	// correct for parallax, equatorial horizontal parallax, see Meeus p. 337
	h -= asind(6378.14/mr)*cosd(h);
	// brightness, use Paul Schlyter's formula (based on common phase law for Moon)
	var sdat=sunxyz(jday);
	var r = sdat[3];	// Earth (= Moon) distance to Sun in AU
	var R = mr/149598000;	// Moon distance to Earth in AU
	var mag = 0.23 + 5*log10(r*R) + 0.026 * pa + 4.0E-9 * pa*pa*pa*pa
	return new Array(h,moondat[1],moondat[2],ra,dec,mglong, mglat, k, r, mr, mag);
}	// Moonpos()


;// Utility functions

// Copyright Ole Nielsen 2002-2004, Peter Hayes 1999-2001


function datestring(obs) {
// datestring provides a locale independent format
  var datestr = "";  datestr += obs.year;
  datestr += ((obs.month < 10) ? ":0" : ":") + obs.month;
  datestr += ((obs.day < 10) ? ":0" : ":") + obs.day;
  return datestr;
}		// end datestring()


function datestring2(year,month,day) {
  var datestr = "";  datestr += year;
  datestr += ((month < 10) ? ":0" : ":") + month;
  datestr += ((day < 10) ? ":0" : ":") + day;
  return datestr;
}		// end datestring2()


function adjustTime(obs,amount) {
// update date and time, amount is in minutes (may be negative)
// added 2004
    month_length[1] = leapyear(obs.year) ? 29 : 28;
	if (amount<0) {
		amount = Math.abs(amount);
		obs.minutes -= amount%60; amount = Math.floor(amount/60.0);
		obs.hours -= amount%24; amount = Math.floor(amount/24.0);
		obs.day -= amount;
		if (obs.minutes < 0) {
			obs.minutes += 60;
			obs.hours -= 1;
		}
		if (obs.hours < 0) {
			obs.hours += 24;
			obs.day -= 1;
		}
		while (obs.day < 1) {
			obs.day += month_length[obs.month-2+(obs.month==1?12:0)];
			obs.month -= 1; 
			if (obs.month == 0) {
				obs.year -= 1;
				obs.month = 12;
				month_length[1] = (leapyear(obs.year) ? 29 : 28);
			}
		}
	}
	else {
		obs.minutes+=amount%60; amount=Math.floor(amount/60.0);
		obs.hours+=amount%24; amount=Math.floor(amount/24.0);
		obs.day+=amount;
		if (obs.minutes > 59) {
			obs.minutes -= 60;
			obs.hours += 1;
		}
		if (obs.hours > 23) {
			obs.hours -= 24;
			obs.day += 1;
		}
		while (obs.day > month_length[obs.month-1]) {
			obs.day -= month_length[obs.month-1];
			obs.month += 1; 
			if (obs.month == 13) {
				obs.year += 1;
				obs.month = 1;
				month_length[1] = (leapyear(obs.year) ? 29 : 28);
			}
		}
	}
}		// end adjustTime()


function hmsstring(t) {
// the caller must add a leading + if required.
  var hours = Math.abs(t);
  var minutes = 60.0*(hours-Math.floor(hours));
  hours=Math.floor(hours);
  var seconds = Math.round(60.0*(minutes-Math.floor(minutes)));
  minutes=Math.floor(minutes);
  if (seconds >= 60) { minutes+=1; seconds-=60; }
  if (minutes >= 60) { hour+=1; minutes-=60; }
  if (hours >= 24) { hours-=24; }
  var hmsstr=(t < 0) ? "-" : "";
  hmsstr=((hours < 10) ? "0" : "" )+hours;
  hmsstr+=((minutes < 10) ? ":0" : ":" )+minutes;
  hmsstr+=((seconds < 10) ? ":0" : ":" )+seconds;
  return hmsstr;
}		// end hmsstring()


function hmstring(t,plus) {
// hmstring converts hours to a string (+/-)hours:minutes, used for relative time (TZ)
  var hours = Math.abs(t);
  var minutes = Math.round(60.0*(hours-Math.floor(hours)));
  hours=Math.floor(hours);
  if (minutes >= 60) { hours+=1; minutes-=60; }	// minutes could be 60 due to rounding
  if (hours >= 24) { hours-=24; }
  var hmstr = (t < 0) ? "-" : (plus?"+":"");
  hmstr += ((hours < 10) ? "0" : "" )+hours;
  hmstr += ((minutes < 10) ? ":0" : ":" )+minutes;
  return hmstr;
}		// end hmstring()


function hmstring2(hours,minutes,seconds) {
// hmstring2 returns time as a string HH:MM (added 2004.01.02), seconds needed for rounding
	if (seconds>=30) minutes++;
	if (minutes>=60) {hours++; minutes=0;}
	var timestr = ((hours < 10) ? "0" : "") + hours;	
	timestr += ((minutes < 10) ? ":0" : ":") + minutes;
	return timestr;
}		// end hmstring2()


function dmsstring(d) {
// dmsstring converts lat/long angle to unsigned string d:m:s
  var deg = Math.abs(d);
  var minutes = 60.0*(deg-Math.floor(deg));
  deg=Math.floor(deg);
  var seconds = Math.round(60.0*(minutes-Math.floor(minutes)));
  minutes=Math.floor(minutes);
  if (seconds >= 60) { minutes+=1; seconds-=60; }
  if (minutes >= 60) { deg+=1; minutes-=60; }
  hmsstr=((deg < 10) ? "0" : "" )+deg;
  hmsstr+=((minutes < 10) ? ":0" : ":" )+minutes;
  hmsstr+=((seconds < 10) ? ":0" : ":" )+seconds;
  return hmsstr;
}		// end dmsstring()


function dmstring(d) {
// dmstring converts lat/long angle to unsigned string d:m
  var deg = Math.abs(d);
  var minutes = 60.0*(deg-Math.floor(deg));
  deg=Math.floor(deg);
  var seconds = Math.round(60.0*(minutes-Math.floor(minutes)));
  minutes=Math.floor(minutes);
  if (seconds >= 30) { minutes+=1; }
  if (minutes >= 60) { deg+=1; minutes-=60; }
  hmstr=((deg < 10) ? "0" : "" )+deg;
	hmstr+=((minutes < 10) ? ":0" : ":" )+minutes;
  return hmstr;
} // end dmstring()


function anglestring(a,circle,arcmin) {
	// Return angle as degrees:minutes. 'circle' is true for range between 0 and 360 
	// and false for -90 to +90, if 'arcmin' use deg and arcmin symbols
  var ar=Math.round(a*60)/60;
  var deg=Math.abs(ar);
  var min=Math.round(60.0*(deg-Math.floor(deg)));
  if (min >= 60) { deg+=1; min=0; }
  var anglestr="";
  if (!circle) anglestr+=(ar < 0 ? "-" : "+");
  if (circle) anglestr+=((Math.floor(deg) < 100) ? "0" : "" );
  anglestr+=((Math.floor(deg) < 10) ? "0" : "" )+Math.floor(deg);
  if (arcmin) anglestr+=((min < 10) ? "&deg;0" : "&deg;")+(min)+"' ";
	else anglestr+=((min < 10) ? ":0" : ":" )+(min);
  return anglestr;
} // end anglestring()


function fixnum(n,l,d) {
	// convert float n to right adjusted string of length l with d digits after decimal point.
	// the sign always requires one character, allow for that in l!
	var m = 1;
	for (var i=0; i<d; i++) m*=10;
	var n1 = Math.round(Math.abs(n)*m);
	var nint = Math.floor(n1/m);
	var nfract = (n1 - m*nint) + ""; // force conversion to string
	while (nfract.length < d) nfract = "0" + nfract;
	var str = (n<0 ? "-" : " ") + nint;
	if (d > 0) str = str + "." + nfract;
	while (str.length<l) str = " " + str;
	return str;
} // end fixnum()


function fixstr(str,l) {
	// returns left-adjusted string of length l, pad with spaces or truncate as necessary
	if (str.length > l) return str.substring(0,l); 
	while (str.length < l) {
		str += " ";
	}
	return str;
}		// end fixstr()


function parsecol(str) {
	// parsecol converts deg:min:sec or hr:min:sec to a number
  var col1=str.indexOf(":");
  var col2=str.lastIndexOf(":");
  if (col1 < 0) return parseInt(str);
  if (str.substring(0,1) == "-") {
    var res=parseInt(str.substring(1,col1),10);
  } else {
    var res=parseInt(str.substring(0,col1),10);
  }
  if (col2 > col1) {
    res+=(parseInt(str.substring(col1+1,col2),10)/60.0) +
         (parseInt(str.substring(col2+1,str.length),10)/3600.0);
  } else {
    res+=(parseInt(str.substring(col1+1,str.length),10)/60.0);
  }
  if (str.substring(0,1) == "-") {
    return -res;
  } else {
    return res;
  }
}	// end parsecol()


function interpol(n,y1,y2,y3) {
	// interpolate y (Meeus 3.3)
	var a = y2-y1;
	var b = y3-y2;
	var c = b-a;
	return y2+(n/2)*(a+b+n*c);
}


function nzero(y1,y2,y3) {
	// Calculate value of interpolation factor for which y=zero. n0 should be within [-1:1] 
	// Meeus formula (3.7)	
	var a = y2-y1; var b = y3-y2; var c = b-a;
	var n0 = 0;
	do {
		dn0 = -(2*y2 + n0*(a+b+c*n0)) / (a+b+2*c*n0);
		n0 += dn0;
	} while (Math.abs(dn0) > 0.0001);
	return n0;
}		// end nzero()


function nextrem(y1,y2,y3) {
	// Calculate value of interpolation factor for which y reaches extremum (-1<n<1);
	var a = y2-y1; var b = y3-y2; var c = b-a;
	var nm = -(a+b)/(2*c);	// (3.5)
	return nm;
}		// end nextrem();


function isort(arr) {
// Sort 2D array in ascending order on first column of each element using insertion sort 
	for (var c=0; c<arr.length-1; c++) {	
		var tmp = arr[c+1]; var a = c;
		while (a>=0 && arr[a][0]>tmp[0]) {
			arr[a+1] = arr[a];
			a--;
		}
		arr[a+1] = tmp;
	}
}	// end isort()


