'use strict';
var Client = require('node-teamspeak'),
	util = require('util');

var cl = new Client('127.0.0.1');
var uid = 'serveradmin';
var clid;
var cid = 1;

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
			builder += '[b][color=Red]' + result + '[/color][/b]';
		} else if (result >= double) {
			builder += '[b][color=Green]' + result + '[/color][/b]';
		} else if (result >= target) {
			builder += '[color=Green]' + result + '[/color]';
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

var wodDice = function (message) {
	var dice = message.match(/([0-9]+)w/);
	var again = message.match(/w([0-9]+)/);
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
	if (again) {
		again = parseInt(again[1], 10);
	} else {
		again = 10;
	}
	if (auto) {
		auto = parseInt(auto[0], 10);
	} else {
		auto = 0;
	}
	while (dice > 0) {
		result = Math.floor(Math.random() * 10);
		if (result === 0) {
			result = 10;
		}
		if (result >= 8) {
			successes += 1;
		}
		if (result >= again) {
			dice += 1;
			sucDice += 1;
		}
		if (result === 1) {
			builder += '[b][color=Red]' + result + '[/color][/b]';
		} else if (result >= again) {
			builder += '[b][color=Green]' + result + '[/color][/b]';
		} else  if (result >= 8) {
			builder += '[color=Green]' + result + '[/color]';
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

cl.send('login', {client_login_name: uid, client_login_password: 'GtzUz1Ev'}, function(err, response, rawResponse){
	cl.send('use', {sid: 1}, function(err, response, rawResponse){
		cl.send('clientfind', {pattern: uid}, function (err, response, rawResponse) {
			clid = response.clid;
			cl.send('clientupdate', {clid: response.clid, client_nickname: 'Dice Roller'}, function (err, response, rawResponse) {
				cl.send('servernotifyregister', {event: 'textchannel', id:0}, function(err, response, rawResponse){
					cl.on('textmessage', function (params) {
						var msgParts = params.msg.match(/\((.+?)\)/);
						var result;
						if (msgParts && params.invokeruid !== uid) {
							if (msgParts[1].indexOf('e') > -1) {
								result = exaltedDice(msgParts[1]);
							} else if (msgParts[1].indexOf('w') > -1) {
								result = wodDice(msgParts[1]);
							}
							cl.send('sendtextmessage', {targetmode: 2, msg: params.msg + '\n' + result}, function (err, response, rawResponse){});
						}
					});
				});
				cl.send('servernotifyregister', {event: 'channel', id:0}, function(err, response, rawResponse){
					cl.on('channelcreated', function (params) {
						cl.send('clientmove', {clid: clid, cid: params.cid}, function(){
							cid = params.cid;
						});
					});
				});
				cl.on('clientmoved', function (params) {
					if (cid !== 1) {
						cl.send('clientlist', {cid: cid}, function (err, response, rawResponse) {
							var empty = true;
							response.forEach(function (event) {
								if (event.cid === cid && event.clid !== clid) {
									empty = false;
								}
							});
							if (empty) {
								cl.send('clientmove', {clid: clid, cid: 1}, function () {
									cid = 1;
								});
							}
						});
					}
				});
			});
			cl.send('channellist', function(err, response, rawResponse){
				console.log(err,response,rawResponse);
			});
		});
	});
});