var express = require('express');
var bodyParser = require('body-parser');
var make = require('./lib/concat/lib.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

var port = process.env.PORT || 3000;

app.listen(port);

console.log('Server now listening on port ' + port);

app.post('/', function(req, res){

  obs = {
    day: 14,
    dst: false,
    hours: 6,
    latitude: "42:43:38",
    longitude: "82:43:00",
    minutes: 50,
    month: 11,
    name: "JG: Birth",
    seconds: 0,
    tz: 0,
    year: 1987
  };

  obs.seconds = +req.body.seconds;
  obs.minutes = +req.body.minutes;
  obs.hours = +req.body.hours;
  obs.day = +req.body.day;
  obs.month = +req.body.month;
  obs.year = +req.body.year;
  obs.longitude = req.body.longitude;
  obs.latitude = req.body.latitude;

  console.log(obs);

  res.send(make.returnAllPlanets(obs));

});