const fmin = require('fmin');
/* const optimjs = require('optimization-js'); */
function circle(X) {
    var x = X[0], y = X[1];
    return Math.abs(x*x + y*y - 1.0);
}
function circleSqr(X) {
    var x = X[0], y = X[1];
    return (x*x + y*y - 1.0)^2;
}

function zero(X) {
    var x = X[0], y = X[1];
    return Math.sin(y) * x  + Math.sin(x) * y  +  x * x +  y *y;
}

for (let i = 0 ; i < 10000; i++) {
	var input = [Math.random(),Math.random()];
	//var solution = fmin.nelderMead(circle, [input[0],input[1]]);
	//var solution = fmin.conjugateGradient(circleSqr, [input[0], input[1]]);
	var solution = fmin.gradientDescentLineSearch(circle, [input[0], input[1]]);
	console.log("solution is at " + solution.x + "\t\tfor\t\t" + input);
}

/*
for (let i = 0 ; i < 10000; i++) {
	var input = [Math.random(),Math.random()];
	var solution = optimjs.minimize_Powell(circle, input);
	//var solution = fmin.conjugateGradient(circle, [input[0], input[1]]);
	console.log("solution is at " + solution + "\t\tfor\t\t" + input);
}
*/
