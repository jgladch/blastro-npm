var express = require('express');
var bodyParser = require('body-parser');
var main = require('./main-serve.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

var port = process.env.PORT || 3000;

app.listen(port);

console.log('Server now listening on port ' + port);

app.post('/', function(req, res){
  //Create inputs object to send to createCharts function
  chartInputs = {};
  //Convert string input to integer for charting
  for (var key in req.body) {
    chartInputs[key] = +req.body[key];
  }

  res.send(main.createChart(chartInputs));

});