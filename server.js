/**
 * Created by ivan on 29/09/16.
 */
'use strict';

var port = process.env.PORT || 8000; // first change

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var routes = require("./routes");

var app = express();
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.enable('view cache');
app.set('view engine', 'html');



// change four
app.use('/', routes);


var server = http.createServer(app);
server.listen(port, function () { // fifth and final change
    console.log('Express server listening on port ' + app.get('port'));
});