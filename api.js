var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var Float = require('mongoose-float').loadType(mongoose, 2);
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)



var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected');
});

// configuration =================

//mongoose.connect('mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu');     // connect to mongoDB database on modulus.io
mongoose.connect(process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/smart_board');
app.use(express.static(__dirname + '/'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// listen (start app with node server.js) ======================================
http.listen(3000);
console.log("App listening on port 3000");

//===================================================

var temperatureSchema = new mongoose.Schema({
    temperature: Float,
    humedity: Float,
    date: { type: Date, default: Date.now }
});
var Temperature = mongoose.model('Temperature', temperatureSchema);

var dustSchema = new mongoose.Schema({
    ug: Float,
    date: { type: Date, default: Date.now }
});
var Dust = mongoose.model('Dust', dustSchema);

// Temperature  ===============================================
app.get('/api/Temperature', function(req, res) {
	// use mongoose to get all temperatures in the database
	Temperature.find(function(err, temperatures) {

		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
		if (err)
			res.send(err)

		res.json(temperatures); // return all temperatures in JSON format
	});
});

// create todo and send back all temperatures after creation
app.post('/api/Temperature', function(req, res) {

	//console.log("temperature  : " + req.body.temperature);
	//console.log("humidity  : " + req.body.humidity);
	io.emit('temperature', req.body);
	// create a todo, information comes from AJAX request from Angular
	Temperature.create({
		temperature: req.body.temperature,
		humedity: req.body.humedity,
		done : false
	}, function(err, temperature) {
		if (err)
			res.send(err);

	});

});

// delete a todo
app.delete('/api/Temperature/:_id', function(req, res) {
	Temperature.remove({
		_id : req.params._id
	}, function(err, temperature) {
		if (err)
			res.send(err);

		// get and return all the todos after you create another
		Temperature.find(function(err, temperatures) {
			if (err)
				res.send(err)
			res.json(temperatures);
		});
	});
});

// Dust  ===============================================
app.get('/api/Dust', function(req, res) {
	// use mongoose to get all dusts in the database
	Dust.find(function(err, dusts) {

		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
		if (err)
			res.send(err)

		res.json(dusts); // return all dusts in JSON format
	});
});

// create todo and send back all dusts after creation
app.post('/api/Dust', function(req, res) {
	io.emit('dust', req.body);
	// create a todo, information comes from AJAX request from Angular
	Dust.create({
		ug: req.body.dust,
		done : false
	}, function(err, dust) {
		if (err)
			res.send(err);

	});

});

// delete a todo
app.delete('/api/Dust/:_id', function(req, res) {
	Dust.remove({
		_id : req.params._id
	}, function(err, dust) {
		if (err)
			res.send(err);

		// get and return all the todos after you create another
		Dust.find(function(err, dusts) {
			if (err)
				res.send(err)
			res.json(dusts);
		});
	});
});

// application -------------------------------------------------------------
    app.get('*', function(req, res) {
		res.redirect('/index.html');
        //res.sendfile('./index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });


module.exports = app;