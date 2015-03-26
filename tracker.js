'use strict';
var tracker = {},
	prompt  = require('prompt'),
	fs      = require('fs'),
	async   = require('async'),
	parsed  = 0,
	back    = [],
	forward = [];

prompt.start();
prompt.message = '>';
prompt.delimiter = '>';

function load(file,cb) {
	var entries;
	file = './' + file;
	if (fs.existsSync(file)) {
		entries = fs.readFileSync(file).toString();
		entries = entries.split('\n');
		while (entries[entries.length - 1] === '') {
			entries.pop();
		}
		async.eachSeries(entries, function (entry, next) {
			if(entry.indexOf('#') === -1) {
				entry = entry.replace(/\t/g,' ').replace(/[ ]+/g,' ').split(' ');
				prompt.get([entry[0].replace(/_/g, ' ') + ' initiative'], function (err, results) {
					if (results[entry[0].replace(/_/g, ' ') + ' initiative'] !== '-1') {
						add(entry[0].replace(/_/g, ' '), results[entry[0].replace(/_/g, ' ') + ' initiative'], entry[1], entry[1], entry[2], entry[3], entry[4], entry[5]);
						next();
					}
				});
			} else {
				next();
			}
		}, cb);
	} else { cb(); }
}

function add(name, initiative, motes, maxMotes, willpower, health, defense, soak) {
	var actor = ({
		'name': name,
		'initiative': parseInt(initiative, 10),
		'motes': parseInt(motes, 10),
		'maxMotes': parseInt(maxMotes, 10),
		'willpower': parseInt(willpower, 10),
		'health': parseInt(health, 10),
		'defense': parseInt(defense, 10),
		'soak': parseInt(soak, 10),
		'acted': false
	});
	tracker[name] = actor;
	back.push(function (un) {
		if (un === 'undo') {
			delete tracker[name];
			console.log('Deleting ' + name);
		} else {
			tracker[name] = actor;
			console.log('Readding ' + name);
		}
	});
}

function next() {
	var highest = -99999999,
		active = [],
		output,
		oldMotes;
	Object.keys(tracker).forEach(function (actor) {
		actor = tracker[actor];
		if (!actor.acted) {
			if (actor.initiative > highest) {
				highest = actor.initiative;
				active = [actor];
			} else if (actor.initiative === highest) {
				active.push(actor);
			}
		}
	});
	if (active.length > 0) {
		output = highest + ':';
		active.forEach(function (actor) {
			actor.acted = true;
			oldMotes = actor.motes;
			actor.motes = Math.min(actor.motes + 5, actor.maxMotes);
			output += ' ' + actor.name + ',';
		});
		output = output.replace(/,$/,'');
		console.log(output);
		back.push(function (un) {
			if (un === 'undo') {
				active.forEach(function (actor) {
					actor.acted = false;
					actor.motes = oldMotes;
				});
				console.log('Undoing next turn');
			} else {
				active.forEach(function (actor) {
					actor.acted = true;
					actor.motes = Math.min(actor.motes + 5, actor.maxMotes);
				});
				console.log('Redoing next turn');
			}
		});
	} else {
		console.log('NEW TURN');
		Object.keys(tracker).forEach(function (actor) {
			actor = tracker[actor];
			actor.acted = false;
		});
		list();
		back.push(function (un) {
			if (un === 'undo') {
				Object.keys(tracker).forEach(function (actor) {
					actor = tracker[actor];
					actor.acted = true;
				});
				console.log('Undoing New Turn');
			} else {
				Object.keys(tracker).forEach(function (actor) {
					actor = tracker[actor];
					actor.acted = false;
				});
				console.log('NEW TURN');
				list();
				console.log('Redoing New Turn');
			}
		});
	}
}

function set(name, attribute, value) {
	var oldValue;
	if (!!tracker[name]) {
		oldValue = tracker[name][attribute];
		tracker[name][attribute] = attribute === 'name' ? value : parseInt(value, 10);
		console.log('Set ' + name + '\'s ' + attribute + ' to ' + value);
		back.push(function (un) {
			if (un === 'undo') {
				tracker[name][attribute] = oldValue;
				console.log('Reset ' + name + '\'s ' + attribute + ' to ' + tracker[name][attribute]);
			} else {
				tracker[name][attribute] = attribute === 'name' ? value : parseInt(value, 10);
				console.log('Re-set ' + name + '\'s ' + attribute + ' to ' + tracker[name][attribute]);
			}
		});
	} else {
		console.log('Name Error');
	}
}

function modify(name, attribute, value) {
	if (!!tracker[name]) {
		tracker[name][attribute] += parseInt(value, 10);
		console.log('Modifed ' + name + '\'s ' + attribute + ' to ' + tracker[name][attribute]);
		back.push(function (un) {
			if (un === 'undo') {
				tracker[name][attribute] -= parseInt(value, 10);
				console.log('Reset ' + name + '\'s ' + attribute + ' to ' + tracker[name][attribute]);
			} else {
				tracker[name][attribute] += parseInt(value, 10);
				console.log('Re-set ' + name + '\'s ' + attribute + ' to ' + tracker[name][attribute]);
			}
		});
	} else {
		console.log('Name Error');
	}
}

function wither(attacker, defender, amount) {
	var attackerInit,
		defenderInit;
	if (!!tracker[defender] && !!tracker[attacker]) {
		attackerInit = tracker[attacker].initiative;
		defenderInit = tracker[defender].initiative;
		tracker[defender].initiative -= parseInt(amount, 10);
		if (tracker[defender].initiative <= 0 && tracker[defender].initiative > (-1 * amount)) {
			console.log(defender + ' is CRASHED');
			tracker[attacker].initiative += 5;
		}
		tracker[attacker].initiative += parseInt(amount, 10) + 1;
		back.push(function (un) {
			if (un === 'undo') {
				console.log('Undoing ' + attacker + ' withering ' + defender + ' for ' + amount + ' initiative');
				tracker[defender].initiative = defenderInit;
				tracker[attacker].initiative = attackerInit;
			} else {
				tracker[defender].initiative -= parseInt(amount, 10);
				if (tracker[defender].initiative <= 0 && tracker[defender].initiative > (-1 * amount)) {
					console.log(defender + ' is CRASHED');
					tracker[attacker].initiative += 5;
				}
				tracker[attacker].initiative += parseInt(amount, 10) + 1;
				console.log('Redoing ' + attacker + ' withering ' + defender + ' for ' + amount + ' initiative');
			}
		});
	} else {
		console.log('Name Error');
	}
}

function decisive(attacker, defender, amount, reset) {
	var health, initiative, victim;
	if (!!tracker[defender] && !!tracker[attacker]) {
		victim = tracker[defender];
		health = tracker[defender].health;
		initiative = tracker[attacker].initiative;
		tracker[defender].health -= parseInt(amount, 10);
		if (tracker[defender].health <= 0) {
			delete tracker[defender];
			console.log(defender + ' was DEFEATED!');
		}
		if (reset) {
			tracker[attacker].initiative = parseInt(reset, 10);
		}
		back.push(function (un) {
			if (un === 'undo') {
				tracker[defender] = victim;
				tracker[defender].health = health;
				tracker[attacker].initiative = initiative;
				console.log('Undoing ' + attacker + ' harming ' + defender + ' for ' + amount + ' damage');
			} else {
				tracker[defender].health -= parseInt(amount, 10);
				if (tracker[defender].health <= 0) {
					delete tracker[defender];
					console.log(defender + ' was DEFEATED!');
				}
				if (reset) {
					tracker[attacker].initiative = parseInt(reset, 10);
				}
				console.log('Redoing ' + attacker + ' harming ' + defender + ' for ' + amount + ' damage');
			}
		});
	} else {
		console.log('Name Error');
	}
}

function remove(name) {
	var actor = tracker[name];
	if(!!actor) {
		delete tracker[name];
		back.push(function (un) {
			if (un === 'undo') {
				tracker[name] = actor;
				console.log('Re-adding ' + name);
			} else {
				delete tracker[name];
				console.log('Re-deleting ' + name);
			}
		});
	}
}

function list() {
	var output = [],
		toPrint = '';
	Object.keys(tracker).forEach(function (name) {
		output.push(tracker[name].initiative + ' ' + name);
	});
	output.sort(function (a, b) { return parseFloat(b.split(' ')[0]) - parseFloat(a.split(' ')[0]) });
	output.forEach(function (val) {
		toPrint += val + '\n';
	});
	console.log(toPrint.replace(/\n$/, ''));
}

function details(name) {
	var output = '';
	if (!!tracker[name]) {
		Object.keys(tracker[name]).forEach(function (att) {
			output += att + ': ' + tracker[name][att] + '\n';
		});
		console.log(output.replace(/\n$/, ''));
	} else {
		console.log('Name Error');
	}
}

function undo() {
	var func;
	if (back.length > 0) {
		func = back.pop();
		func('undo');
		forward.push(func);
	} else {
		console.log('Nothing to Undo');
	}
}

function redo() {
	var func;
	if (forward.length > 0) {
		func = forward.pop();
		func('redo');
		back.push(func);
	} else {
		console.log('Nothing to Redo');
	}
}

function copy(oldName, name, initiative) {
	var newActor = JSON.parse(JSON.stringify(tracker[oldName]));
	newActor.name = name;
	newActor.initiative = initiative;
	tracker[name] = newActor;
	back.push(function(un) {
		if (un==='undo') {
			delete tracker[name];
			console.log('Undoing copying ' + oldName);
		} else {
			tracker[name] = newActor;
			console.log('Re-Copying ' + oldName);
		}
	});
}

function help() {
	Object.keys(directMenu).forEach(function(entry){console.log(entry);});
}

function save(name, file) {
	var player;
	file = file || 'players';
	file = './' + file;
	if(!fs.existsSync(file)) {
		fs.appendFileSync(file, '#name motes willpower health defense soak\n');
	}
	if(name.toLowerCase() !== 'all') {
		player = tracker[name];
		fs.appendFileSync(file, [name,player.maxMotes,player.willpower,player.health,player.defense,player.soak].join(' ') + '\n');
	} else {
		Object.keys(tracker).forEach(function (pname) {
			player = tracker[pname];
			fs.appendFileSync(file, [pname,player.maxMotes,player.willpower,player.health,player.defense,player.soak].join(' ') + '\n');
		});
	}
}

var menu = {
	add: function (cb) {
		prompt.get([
			'name',
			'initiative',
			'motes',
			'maxMotes',
			'willpower',
			'health',
			'defense',
			'soak'
		], function (err, results) {
			if (err) {
				console.log(err);
			}
			add(results.name, results.initiative, results.motes, results.maxMotes, results.willpower, results.health, results.defense, results.soak);
			cb();
		});
	},
	next: function (cb) {
		next();
		cb();
	},
	set: function (cb) {
		prompt.get([
			'name',
			'attribute',
			'value'
		], function (err, results) {
			if (err) {
				console.log(err);
			}
			set(results.name, results.attribute, results.value);
			cb();
		});
	},
	modify: function (cb) {
		prompt.get([
			'name',
			'attribute',
			'value'
		], function (err, results) {
			if (err) {
				console.log(err);
			}
			modify(results.name, results.attribute, results.value);
			cb();
		});
	},
	wither: function (cb) {
		prompt.get([
			'attacker',
			'defender',
			'amount'
		], function (err, results) {
			if (err) {
				console.log(err);
			}
			wither(results.attacker, results.defender, results.amount);
			cb();
		});
	},
	decisive: function (cb) {
		prompt.get([
			'attacker',
			'defender',
			'amount',
			'reset'
		], function (err, results) {
			if (err) {
				console.log(err);
			}
			decisive(results.attacker, results.defender, results.amount, results.reset);
			cb();
		});
	},
	remove: function (cb) {
		prompt.get(['name'], function (err, results) {
			if (err) {
				console.log(err);
			}
			remove(results.name);
			cb();
		});
	},
	list: function (cb) {
		list();
		cb();
	},
	details: function (cb) {
		prompt.get(['name'], function (err, results) {
			if (err) {
				console.log(err);
			}
			details(results.name);
			cb();
		});
	},
	undo: function (cb) {
		undo();
		cb();
	},
	redo: function (cb) {
		redo();
		cb();
	},
	help: function (cb) {
		help();
		cb();
	},
	copy: function (cb) {
		prompt.get([
			'target',
			'name',
			'initiative'
		], function (err, results) {
			if (err) {
				console.log(err);
			}
			copy(results.target, results.name, results.initiative);
			cb();
		});
	},
	save: function (cb) {
		prompt.get(['name'], function (err, results) {
			if (err) {
				console.log(err);
			}
			save(results.name);
			cb();
		});
	},
	load: function (cb) {
		prompt.get(['file'], function (err, results) {
			if (err) {
				console.log(err);
			}
			load(results.file, cb);
		});
	}
};
menu.n = menu.next;
menu.withering = menu.wither;
var directMenu = {
	add: add,
	next: next,
	n: next,
	set: set,
	modify: modify,
	wither: wither,
	withering: wither,
	decisive: decisive,
	remove: remove,
	list: list,
	details: details,
	undo: undo,
	redo: redo,
	help: help,
	copy: copy,
	save: save,
	load: load,
	exit: ''
};

function terminal() {
	prompt.get(['command'], function (err, results) {
		var command,
			name,
			parts;
		if (err) {
			console.log(err);
		}
		command = results.command;
		name = command;
		if (command !== 'exit') {
			if (JSON.stringify(['undo','redo','list','details','help','save','copy','load']).indexOf(command.split(' ')[0]) === -1) {
				forward = [];
			}
			if (results.command.indexOf(' ') < 0) {
				if (typeof menu[command] === 'function') {
					try {
						menu[command](terminal);
					} catch (e) {
						console.log(e);
						terminal();
					}
				}
				else {
					console.log('No Such Command: ' + results.command);
					terminal();
				}
			} else {
				parts = command.replace(/\b(to|'s|by|have|for|with|on|against|resetting|levels|level)\b/g,'').replace(/[ ]+/g,' ').split(' ');
				console.log(parts);
				parts.forEach(function (param, index) {
					parts[index] = param.replace(/_/g, ' ');
				});
				command = parts[0];
				parts.shift();
				if (typeof directMenu[command] === 'function') {
					try {
						command = directMenu[command];
						parts.forEach(function (part) {
							command = command.bind(undefined, part);
						});
						if (JSON.stringify(['load']).indexOf(name.split(' ')[0]) === -1) {
							command();
							terminal();
						} else {
							command(terminal);
						}
					} catch (e) {
						console.log(e);
						terminal();
					}
				}
				else {
					console.log('No Such Complex Command: ' + command);
					terminal();
				}
			}
		}
	});
}

//load('players', terminal);
terminal();