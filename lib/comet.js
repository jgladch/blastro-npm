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

