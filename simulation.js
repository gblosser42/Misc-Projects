var dCheck = function (dice, crit) {
	var criticals = 0;
	var highest = 0;
	var n;
	var result;
	for (n = 0; n < dice; n++) {
		result = Math.floor(Math.random() * 10) + 1;
		if (result > highest) {
			highest = result;
		}
		if (result >= crit) {
			criticals++;
		}
	}
	if (criticals === 0){
		return highest;
	} else {
		return 10 + dCheck(criticals,crit);
	}
};

var stringBuilder = '';
var iterations = 100000;
for (var d = 1; d <= 20; d++) {
		var total = {};
		for (var i = 0; i < iterations; i++) {
			var result = (dCheck(d, 11));
			for (var n = 1; n <= 30; n++) {
				if (result >= n) {
					if (!total[n]) {
						total[n] = 0;
					}
					total[n]++;
				}
			}
		}
	for (var x = 1; x <= 30; x++) {
		stringBuilder+=(total[x]/iterations) + ' ';
	}
	stringBuilder+='\n';
}
console.log(stringBuilder);