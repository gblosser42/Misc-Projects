var config      = require('./vamp.config.json'),
	prompt      = require('prompt'),
	clans       = config.clans,
	covenants   = config.covenants,
	disciplines = config.disciplines,
	masquerades       = config.masquerades,
	physical    = 0,
	social      = 0,
	mental      = 0,
	character,
	primary,
	secondary,
	tertiary,
	clan,
	covenant,
	discipline,
	seed;

prompt.start();
prompt.message = '>';
prompt.delimiter = '>';

function randomIntInc(low, high) {
	return Math.floor(Math.random() * (high - low + 1) + low);
}

character = {
	clan: Object.keys(clans)[randomIntInc(0, Object.keys(clans).length - 1)],
	covenant: Object.keys(covenants)[randomIntInc(0, Object.keys(covenants).length - 1)],
	bloodPotency: randomIntInc(1, 5),
	physical: 0,
	social: 0,
	mental: 0,
	disciplines: {},
	masquerade: masquerades[randomIntInc(0, masquerades.length - 1)],
	requiem: masquerades[randomIntInc(0, masquerades.length - 1)],
	defense: '',
	willpower: ''
};

while (character.masquerade === character.requiem) {
	character.requiem = masquerades[randomIntInc(0, masquerades.length - 1)];
}

clan = clans[character.clan];
covenant = covenants[character.covenant];

disciplines = disciplines.concat(clan.disciplines);
disciplines = disciplines.concat(clan.disciplines);
disciplines.push(clan.unique);
disciplines.push(clan.unique);

physical = clan.physical + covenant.physical;
social = clan.social + covenant.social;
mental = clan.mental + covenant.mental;

primary = 6 + (character.bloodPotency);
secondary = 5 + (character.bloodPotency);
tertiary = 4 + Math.floor(character.bloodPotency / 2);

seed = randomIntInc(1, physical + social + mental);

if (seed <= physical) {
	character.physical = primary;
	seed = randomIntInc(1, social + mental);
	if (seed < social) {
		character.social = secondary;
		character.mental = tertiary;
	} else {
		character.mental = secondary;
		character.social = tertiary;
	}
} else if (seed <= physical + social) {
	character.social = primary;
	seed = randomIntInc(1, physical + mental);
	if (seed < physical) {
		character.physical = secondary;
		character.mental = tertiary;
	} else {
		character.mental = secondary;
		character.physical = tertiary;
	}
} else {
	character.mental = primary;
	seed = randomIntInc(1, physical + social);
	if (seed < physical) {
		character.physical = secondary;
		character.social = tertiary;
	} else {
		character.social = secondary;
		character.physical = tertiary;
	}
}

for (var i = 0; i < (character.bloodPotency + 1); i++) {
	discipline = clan.disciplines[randomIntInc(0, clan.disciplines.length - 1)];
	while (character.disciplines[discipline] >= 5) {
		discipline = clan.disciplines[randomIntInc(0, clan.disciplines.length - 1)];
	}
	if (!character.disciplines[discipline]) {
		character.disciplines[discipline] = 1;
	} else {
		character.disciplines[discipline] += 1;
	}
}
for (var n = 0; n < (character.bloodPotency); n++) {
	if (randomIntInc(1, 10)) {
		disciplines.push(config.rareDisciplines[randomIntInc(0, config.rareDisciplines.length - 1)]);
	}
	discipline = disciplines[randomIntInc(0, disciplines.length - 1)];
	while (character.disciplines[discipline] >= 5) {
		discipline = disciplines[randomIntInc(0, disciplines.length - 1)];
	}
	if (!character.disciplines[discipline]) {
		character.disciplines[discipline] = 1;
	} else {
		character.disciplines[discipline] += 1;
	}
}

character.defense = Math.min(character.physical - 2, Math.ceil(character.physical / 2) + Math.floor(character.mental / 2) - 2);
if (!!character.disciplines.celerity) {
	character.defense += character.disciplines.celerity;
}
character.willpower = Math.ceil(character.social / 2) + Math.ceil(character.mental / 2) - 2;

console.log(character);