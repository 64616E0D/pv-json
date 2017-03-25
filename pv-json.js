#!/usr/bin/env nodejs
var http = require('http');
var sqlite3 = require('sqlite3').verbose();

var smadata = "/home/dan/smadata/SBFspot.db";
var inverter = "2130346114"; // Inverter serial number
var port = 8000;

http.createServer(function(request, response) {
	var db = new sqlite3.Database(smadata, sqlite3.OPEN_READONLY);

	request.on('error', function(err) {
		console.error(err);
	});

	request.on('data', function(chunk) {
		console.log('data');
	});

	request.on('end', function() {

	    response.on('error', function(err) {
			console.error(err);
	    });

	    response.statusCode = 200;
	    response.setHeader('Content-Type', 'application/json');

		db.all("SELECT strftime('%H:%M', TimeStamp) as title, power as value from vwDayData where TimeStamp like Date('now')||'%';", function(error, rows) {
			response.write('{ "graph" : { "title" : "PV Output", "yAxis" : { "minValue" : 0, "maxValue" : 4000 }, "datasequences" : [ { "title" : "", "datapoints" : ');
			response.write(JSON.stringify(rows));
			response.write('}]}}');
			response.end();
		});

	});
}).listen(port, 'localhost');


