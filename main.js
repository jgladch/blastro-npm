var swisseph = require('swisseph');

var Planets = [
  swisseph.SE_SUN,
  swisseph.SE_MOON,
  swisseph.SE_MERCURY,
  swisseph.SE_VENUS,
  swisseph.SE_MARS,
  swisseph.SE_JUPITER,
  swisseph.SE_SATURN,
  swisseph.SE_TRUE_NODE
];

var createChart = function(chartInput) {
  console.dir(chartInput);
  var result = {};

  var date = {
    year: chartInput.year,
    month: chartInput.month,
    day: chartInput.day,
    hour: chartInput.hour,
    minute: chartInput.minute,
    second: chartInput.second,
    timezone: chartInput.timezone
  };

  swisseph.swe_set_topo(chartInput.longitude, chartInput.latitude, chartInput.altitude);
  
  var flag = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH;

  if (chartInput.isVedic) {
    flag |= swisseph.SEFLG_SIDEREAL;
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
  }
    
  swisseph.swe_set_ephe_path('eph/');

  swisseph.swe_utc_time_zone(date.year, date.month, date.day, date.hour, date.minute, date.second, date.timezone, function(data) {
    var julianDay = swisseph.swe_utc_to_jd(data.year, data.month, data.day, data.hour, data.minute, data.second, swisseph.SE_GREG_CAL);
    var julianDayUT = julianDay['julianDayUT'];

    if (chartInput.isVedic) {
      var houseData = swisseph.swe_houses_ex(julianDayUT, swisseph.SEFLG_SIDEREAL, chartInput.latitude, chartInput.longitude,'E');
    } else {
      var houseData = swisseph.swe_houses(julianDayUT, chartInput.latitude, chartInput.longitude,'E'); 
    }
    if (houseData.error) return {};

    // Set the houseCusps
    result["houseCusps"] = houseData;

    // Set the planets
    result["planets"] = {}
    for (var i = 0; i < Planets.length; i++) {
      var planet = Planets[i]
      swisseph.swe_calc_ut(julianDayUT, planet, flag, function(body) {
        // Set each planets returned data
        result["planets"][swisseph.swe_get_planet_name(planet).name] = body;
      });
    }
  });
  console.log('Result is:'); 
  console.log(result); 
  return result;
};

var dummy = {
  second: 0,
  minute: 50,
  hour: 5,
  day: 14,
  month: 11,
  year: 1987,
  timezone: -4,
  longitude: -82,
  latitude: 42,
  altitude: 0,
  isVedic: true
}

createChart(dummy);


