// FUNCTIONS FOR FINDING EVENTS

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

