// const LM = require('ml-levenberg-marquardt').default;
const LM = require('ml-levenberg-marquardt');
const Benchmark = require('benchmark');
const _ = require('lodash');
let dims = 10;
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
function defaultOptions(initialValues) {
    return  {
        damping: 1.5,
        initialValues: initialValues,
        minValues: minValues,
        maxValues: maxValues,
        gradientDifference: 10e-2,
        maxIterations: 100,
        errorTolerance: 10e-4
    };
}

const options = defaultOptions(initialValues);

function lmFit(f, options) {
    // arbitrary X and Y
    let data = {
        x: [
            0.0,0.0
        ],
        y: [
            0.0,0.0
        ]
    };
    let fittedParams = LM(data, circle, options);
    return fittedParams;
};

function benchIt() {
    var errors = [];
    var suite = new Benchmark.Suite;
    suite.add('LM',function() {
        initialValues.forEach( (v,i) => initialValues[i] = Math.random() );
        let fittedParams = LM(data, circle, options);
        console.log(fittedParams);
        errors.push(fittedParams.parameterError);
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({ 'async': true });
}

// this is a listener
class MySlider {
    //readCB is a callback that when called will produce the current value it should be
    //writeCB is what it writes to
    constructor(readCB,writeCB) {
        this.writeCB = writeCB;
        this.readCB = readCB;
        var span = document.createElement("span");
        var input = document.createElement("input");
        input.setAttribute('type', 'range');
        input.setAttribute('min', -1.1);
        input.setAttribute('max', 1.1);
        input.setAttribute('step', 0.05);
        input.value = 0;
        span.appendChild(input);
        var input2 = document.createElement("input");
        input2.setAttribute('type', 'text');
        input2.style.width = "3em";
        span.appendChild(input2);
        var update = function() {
            var v = parseFloat(input.value);
            input2.value = v;
            if (writeCB) {
                writeCB(v);
            }
        }
        input.addEventListener("input", update);
        input.addEventListener("change", update);
        input2.addEventListener("keypress", function(e) {
            if (!e) e = window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == '13'){
                if (! isNaN(input2.value)) {
                    input.value = input2.value;
                    update();
                }            
            }
        });
        input2.value = 0.0;
        this.input = input;
        this.textinput = input2;
        this.dom = span;
    }
    domObject() {
        return this.dom;
    }
    update(model) {
        if (this.readCB) {
            var v = this.readCB();
            this.input.value = v;
            this.textinput.value = v;            
        }
    }
}

// make a bank of sliders


var model = {
    dims: dims
}

class PointModel {
    constructor(dims,f) {
        this.dims = dims;
        this.values = new Array(this.dims).fill(0);
        this.options = defaultOptions(this.initialValues);
        this.listeners = [];
        this.f = f;
    }
    solve() {
        this.options.initialValues = this.copyOfVec();
        var out = lmFit(this.f, this.options);
        this.setVec( out.parameterValues );
        console.log(out);
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    update() {
        this.solve();
        // console.log(this.values);
        this.listeners.forEach( listener => {
            listener.update(this);
        });
    }
    setDim(i, v) {
        this.values[i] = v;
        this.update();
    }
    set setVec(v) {
        this.values = v;
        this.update();
    }
    set setCopyVec(v) {
        this.values = [...v];
        this.update();
    }
    at(i) {
        return this.values[i];
    }
    get vec() {
        return this.values;
    }
    copyOfVec() {
        return [...this.values];
    }
}

function installSliders(domID, model) {   
    var div = document.getElementById(domID);
    var inputs = _.range( dims ).map( function(i) {
        readCB = () => model.at(i);
        writeCB = (v) => model.setDim(i,v);
        return new MySlider(readCB,writeCB);
    });
    inputs.forEach( x => { div.appendChild(document.createElement("br")); div.appendChild( x.domObject() ) } );
    inputs.forEach( x => model.addListener( x ) );
    
}
exports.installSliders = installSliders;
exports.PointModel = PointModel;
exports.HyperSphere = circle;
