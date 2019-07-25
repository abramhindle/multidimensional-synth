// const LM = require('ml-levenberg-marquardt').default;
const LM = require('ml-levenberg-marquardt');

// function that receives the parameters and returns
// a function with the independent variable as a parameter
function sinFunction([a, b]) {
  return (t) => a * Math.sin(b * t);
}
function circle([x,y,z]) {
    return (t) => Math.abs(x*x + y*y + z*z - 1.0);
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
let initialValues = [
   1.0, 1.0, 1.0
];

// Optionally, restrict parameters to minimum & maximum values
let minValues = [
  -2,-2,-2
];
let maxValues = [
  2,2,2
];

const options = {
  damping: 1.5,
  initialValues: initialValues,
  minValues: minValues,
  maxValues: maxValues,
  gradientDifference: 10e-2,
  maxIterations: 100,
  errorTolerance: 10e-3
};

for (let i = 0 ; i < 1000; i++) {
	initialValues[0] = Math.random();
	initialValues[1] = Math.random();
	initialValues[2] = Math.random();
	let fittedParams = LM(data, circle, options);
	console.log(fittedParams);
}
