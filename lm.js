// const LM = require('ml-levenberg-marquardt').default;
const LM = require('ml-levenberg-marquardt');

var dims = 10;
// function that receives the parameters and returns
// a function with the independent variable as a parameter
function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}
function circle(vec) {
    return (t) => Math.abs(vec.map( x => x*x ).reduce( (acc,y) => acc + y) - 1.0);
}

// array of points to fit
let data = {
  x: [
    0.0,0.0
  ],
  y: [
    0.0,0.0
  ]
};

// array of initial parameter values
let initialValues = new Array(dims).fill(0);

// Optionally, restrict parameters to minimum & maximum values
/* let minValues = [
  -2,-2,-2
]; */
let minValues = new Array(dims).fill(-2.0);
let maxValues = new Array(dims).fill(2.0);
/* let maxValues = [
  2,2,2
];
*/

const options = {
  damping: 1.5,
  initialValues: initialValues,
  minValues: minValues,
  maxValues: maxValues,
  gradientDifference: 10e-2,
  maxIterations: 100,
  errorTolerance: 10e-4
};

for (let i = 0 ; i < 1000; i++) {
	initialValues.forEach( (v,i) => initialValues[i] = Math.random() );
	// initialValues[0] = Math.random();
	// initialValues[1] = Math.random();
	// initialValues[2] = Math.random();
	let fittedParams = LM(data, circle, options);
	console.log(fittedParams);
}
