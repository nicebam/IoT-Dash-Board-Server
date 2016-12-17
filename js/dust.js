(function() {
    'use strict';

    function DustService($http) {
        var service = {};
		var socket;
		try {
		  socket = require('socket.io-client')('http://192.168.1.115:3000');
		}
		catch (e) {
		  socket = io();
		}

		service.getRequest = function (callback) {
			socket.on('dust', function(data){
				return callback(data);
			});
       }
	   
	   return service;
    }

    angular.module('SmartMirror')
        .factory('DustService', DustService);

}());
