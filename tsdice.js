'use strict';
var Client = require('node-teamspeak'),
	util = require('util');

var cl = new Client('ts.rpnation.com');
var first = true;
cl.send("login", {client_login_name: "Lord of Chaos", client_login_password: "##PASSWORD##"}, function(err, response, rawResponse){
	cl.send("use", {sid: 1}, function(err, response, rawResponse){
		cl.send("servernotifyregister", {event: 'textchannel'}, function(err, response, rawResponse){
			cl.on('textchannel', function (params) {
				if (first) {
					first = false;
					cl.send('sendtextmessage', {targetmode: 2, msg: params}, function (){});
				}
			});
			cl.send('sendtextmessage', {targetmode: 2, msg: 'Hello\sWorld'}, function (){});
		});
	});
});