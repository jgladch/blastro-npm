var app = angular.module('blastro', []);

app.controller('ChartController', function($scope, Chart) {
    $scope.day = 14;
    $scope.dst = false;
    $scope.hours = 6;
    $scope.latitude = "42:43:38";
    $scope.longitude = "82:43:00";
    $scope.minutes = 50;
    $scope.month = 11;
    $scope.name = "JG: Birth";
    $scope.seconds = 0;
    $scope.tz = 0;
    $scope.year = 1987;
    $scope.coords = [];

    $scope.genChart = function(){

      var obs = {
        day: $scope.day,
        dst: $scope.dst,
        hours: $scope.hours,
        latitude: $scope.latitude,
        longitude: $scope.longitude,
        minutes: $scope.minutes,
        month: $scope.month,
        name: $scope.name,
        seconds: $scope.seconds,
        tz: $scope.tz,
        year: $scope.year
      }

      Chart.genChart(obs)
      .then(function(data){
        $scope.coords = data.data.coords;
        console.log($scope.coords);
        // console.log(data);
      })
    };

});

app.factory('Chart', function($http){
  var genChart = function(data){
    return $http({
      method: 'POST',
      url: '/',
      data: data
    })
    .success(function(res){
      return res.data;
    });
  };

  return {
    genChart: genChart
  };
});