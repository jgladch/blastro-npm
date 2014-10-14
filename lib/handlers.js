// AstroTools - handlers.js

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


