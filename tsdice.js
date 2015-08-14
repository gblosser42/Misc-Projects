'use strict';
var Client = require('node-teamspeak'),
	util = require('util');

var cl = new Client('ts.rpnation.com');
var first = true;

var exaltedDice = function (message) {
	var dice = message.match(/([0-9]+)e/);
	var double = message.match(/e([0-9]+)/);
	var reroll = message.match(/r([0-9]+)/);
	var target = message.match(/t([0-9]+)/);
	var auto = message.match(/(\+|-)([0-9]+)/);
	var result;
	var builder = '';
	var successes = 0;
	var sucDice = 0;
	if (dice) {
		dice = parseInt(dice[1], 10);
	} else {
		dice = 0;
	}
	if (double) {
		double = parseInt(double[1], 10);
	} else {
		double = 10;
	}
	if (reroll) {
		reroll = reroll[1];
	} else {
		reroll = '';
	}
	if (target) {
		target = parseInt(target[1], 10);
	} else {
		target = 7;
	}
	if (auto) {
		auto = parseInt(auto[0], 10);
	} else {
		auto = 0;
	}
	while (dice > 0) {
		result = Math.floor(Math.random() * 10);
		while (reroll.indexOf(result) > -1) {
			result = Math.floor(Math.random() * 10);
		}
		if (result === 0) {
			result = 10;
		}
		if (result >= target) {
			successes += 1;
			sucDice += 1;
		}
		if (result >= double) {
			successes += 1;
		}
		if (result === 1) {
			builder += '[b]' + result + '[/b]';
		} else if (result === 10) {
			builder += '[b]' + result + '[/b]';
		} else {
			builder += result;
		}
		dice -= 1;
		if (dice > 0) {
			builder += ','
		}
	}
	successes += auto;
	return builder + '\n' + 'SUCCESSES: ' + successes + '(' + sucDice + ')';
};

cl.send("login", {client_login_name: "Lord of Chaos", client_login_password: ""}, function(err, response, rawResponse){
	console.log(err,response,rawResponse);
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