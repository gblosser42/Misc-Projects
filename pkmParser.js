'use strict';
var fs  = require('fs'),
	dex = fs.readFileSync('./list.txt').toString().split('\n');
dex.shift();
if (dex[dex.length-1]==='') {
	dex.pop();
}
fs.writeFileSync('./dex.txt','');

function growth(value) {
	value = parseInt(value, 10);
	if (value < 50) {
		return '+E';
	} else if (value < 75) {
		return '+D';
	} else if (value < 100) {
		return '+C';
	} else if (value < 125) {
		return '+B';
	} else if (value < 138) {
		return '+A';
	} else if (value < 150) {
		return '+S';
	} else  if (value < 163) {
		return '+SS';
	} else  if (value < 175) {
		return '+SSS';
	} else if (value < 188) {
		return '+X';
	} else {
		return '+GOD';
	}
}

String.prototype.toProperCase = function () {
	return this.replace(/\w\S*/g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

dex.forEach(function (mon, index) {
	var data = mon.split(' '),
		name = data[0],
		type = data[1],
		ability = data[2].replace('/', ' or ').replace(/\./g,' '),
		hp = data[3],
		atk = data[4],
		def = data[5],
		spatk = data[6],
		spdef = data[7],
		spd = data[8],
		male = data[9],
		female = 100 - male,
		eggs = data[10].replace(/,/g, ' and '),
		xp = data[11],
		cycles = data[12],
		output;
	hp += growth(parseInt(hp, 10) + 25);
	atk += growth(atk);
	def += growth(def);
	spatk += growth(spatk);
	spdef += growth(spdef);
	spd += growth(spd);
	output = ("000" + (parseInt(index, 10) + 1)).substr(-3, 3) + '\t' + name.toProperCase() + '\n'
	+ 'HP\tAtt\tDef\tSAtt\tSDef\tSpd\tSoc\tStr\tInt\tMov\n'
	+ hp + '\t' + atk + '\t' + def + '\t' + spatk + '\t' + spdef + '\t' + spd + '\t10+F\t+\t+\t6\n\n'
	+ 'Type: ' + type.toProperCase() + '\n'
	+ 'Ability: ' + ability.toProperCase() + '\n'
	+ 'Evolution: \nEgg Group: ' + eggs.toProperCase() + '\nGender Ratio: ' + (male!=='genderless'?male + '% Male, ' + female + '% Female ':'Genderless') + '\nEgg Points to Hatch: ' + cycles + '\nExp Value: ' + xp + '\n'
	+ 'Level Move List\n\nTM/HM Move List: \n\nEgg Move List: \n\n';
	fs.appendFileSync('./dex.txt',output);
});