#!/usr/bin/env nodejs
var http = require('http');
var sqlite3 = require('sqlite3').verbose();

var smadata = "/home/dan/smadata/SBFspot.db";
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
		response.write('{ "graph" : { "title" : "Solar panels 5 min average output", "type" : "line", "yAxis" : { "minValue" : 0, "maxValue" : 4000, "units" : { "suffix" : "kW" } }, "datasequences" : [');
		
		db.serialize(function() {
			db.all("SELECT strftime('%H:%M', TimeStamp) as title, power as value FROM vwDayData WHERE TimeStamp LIKE Date('now', '-1 day', 'localtime')||'%' ORDER BY title ASC;", function(error, rows) {
				response.write(' { "title" : "Yesterday", "color" : "orange", "datapoints" : '); // open this set of datapoints, give it a title and colour
				response.write(JSON.stringify(rows));
				response.write('},'); // close this set of datapoints
			});

			db.all("SELECT strftime('%H:%M', TimeStamp) as title, power as value FROM vwDayData WHERE TimeStamp LIKE Date('now', 'localtime')||'%' ORDER BY title ASC;", function(error, rows) {
				response.write('{ "title" : "Today", "color" : "green", "datapoints" : ');  // open this set of datapoints, give it a title and colour
				response.write(JSON.stringify(rows));
				response.write('}'); // close this set of datapoints
				response.write(']}}'); // close the set of dataseqiences, the graph, and the JSON data
				response.end(); // tell the HTTP server this is the final block of data to be sent
			});
		});
		
		db.close();
	});
}).listen(port, 'localhost');


