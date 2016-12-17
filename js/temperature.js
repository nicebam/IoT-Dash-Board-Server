(function() {
    'use strict';

    function TemperatureService($http) {
        var service = {};
		var socket;
		try {
		  socket = require('socket.io-client')('http://192.168.1.115:3000');
		}
		catch (e) {
		  socket = io();
		}

		//var socket = require('socket.io-client')('http://192.168.1.115:3000');//io();


		service.getRequest = function (callback) {
			socket.on('temperature', function(data){
				return callback(data);
			});
       }
	   
	   return service;
    }

    angular.module('SmartMirror')
        .factory('TemperatureService', TemperatureService);

}());
