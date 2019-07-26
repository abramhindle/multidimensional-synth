"use strict";
// const LM = require('ml-levenberg-marquardt').default;
const LM = require('ml-levenberg-marquardt');
const Benchmark = require('benchmark');
const _ = require('lodash');
// let dims = 10;
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
// let initialValues = new Array(dims).fill(0);

// Optionally, restrict parameters to minimum & maximum values
/* let minValues = [
  -2,-2,-2
]; */
// let minValues = new Array(dims).fill(-2.0);
// let maxValues = new Array(dims).fill(2.0);
/* let maxValues = [
  2,2,2
];
*/
function defaultOptions(iV) {
    let min = iV.map( x => -1.1 );
    let max = iV.map( x =>  1.1 );
    return  {
        damping: 1.5,
        initialValues:  iV,
        minValues:      min,
        axValues:       max,
        gradientDifference: 10e-3,
        maxIterations: 100,
        errorTolerance: 10e-5
    };
}

// const options = defaultOptions(initialValues);

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
    var initialValues = new Array(10).fill(0);
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


// var model = {
//     dims: dims
// }
// 
class PointModel {
    constructor(dims,f) {
        this.dims = dims;
        this.values = new Array(this.dims).fill(0);
        this.options = defaultOptions([...this.values]);
        this.listeners = [];
        this.f = f;
        this.fixI = false;
    }
    get getDims() {
        return this.dims;
    }
    solve() {
        this.options.initialValues = this.copyOfVec();
        this.options.minValues = new Array(this.dims).fill(-1.1);
        this.options.maxValues = new Array(this.dims).fill(1.1);
        if (this.fixI && this.lastI) {
            var g = 1.05*this.values[this.lastI];
            var s = 0.95*this.values[this.lastI];
            if (g < s) {
                var t = g;
                g = s;
                s = t;
            }
            this.options.maxValues[this.lastI] = g;
            this.options.minValues[this.lastI] = s;
        }
        var out = lmFit(this.f, this.options);
        this.values = [...out.parameterValues];
        // console.log(out);
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
        this.lastI = i;
        this.fixI = true;
        this.update();
    }
    setDims(tuples) {
        tuples.forEach( (t) => this.values[t[0]] = t[1] );
        this.fixI = false;        
        this.update();
    }
    setVec(v) {
        this.values = v;
        this.fixI = false;
        this.update();
    }
    set setCopyVec(v) {
        this.fixI = false;
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

function installSliders(dims, domID, model) {   
    var div = document.getElementById(domID);
    var inputs = _.range( dims ).map( function(i) {
        var readCB = () => model.at(i);
        var writeCB = (v) => model.setDim(i,v);
        return new MySlider(readCB,writeCB);
    });
    inputs.forEach( x => { div.appendChild(document.createElement("br")); div.appendChild( x.domObject() ) } );
    inputs.forEach( x => model.addListener( x ) );
    
}
function clamp(x,min,max) {
    return Math.max(min, Math.min(max, x));
}
// patriques  https://stackoverflow.com/users/931738/patriques https://stackoverflow.com/a/18053642
function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return { x: x, y: y};
}
class PointPlot {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.i = 0;
        this.pmin = -1.1;
        this.pmax = 1.1;
        this.prange = this.pmax - this.pmin;
        this.installClickListeners();
    }
    update(model) {
        this.drawPoints(model);
    }
    drawPoint(col,row,x,y,color) {
        let pmax = this.pmax;
        let pmin = this.pmin;
        if (x < pmin || x > pmax || y < pmin || y > pmax) {
            return;
        }
        var yoffset = this.ph * row;
        var xoffset = this.pw * col;
        let prange = this.prange;
        var px = xoffset + this.pw * (x - pmin)/prange;
        var py = yoffset + this.ph * (y - pmin)/prange;        
        var bw = 5;
        ctx.fillStyle = color;
        ctx.fillRect(px - bw/2, py - bw/2, bw, bw);
    }
    initCache(dims) {
        if (this.cache === undefined) {
            this.cache = _.range(dims).map( x => new Array(dims) );
        }
    }
    getLastPoint(col,row) {
        return this.cache[row][col];
    }
    putLastPoint(col,row,vx,vy,color) {
        this.cache[row][col] = { x: vx, y: vy, color: color };
    }
    drawPoints(model) {
        let dims = model.getDims;
        this.dims = dims;
        this.initCache(dims);
        this.lastModel = model;
        let width = canvas.width;
        let height = canvas.height;
        this.pw = width / dims;
        this.ph = height / dims;
        for (let row = 0; row < dims; row++) {
            for (let col = 0; col < dims; col++) {
                let lastPoint = this.getLastPoint(col,row);
                if (lastPoint === undefined) {
                    
                } else {
                    this.drawPoint(col,row,lastPoint.x, lastPoint.y, lastPoint.color);
                }
                let vx = model.at(col);
                let vy = model.at(row);
                let color = `hsl( ${this.i % 360}, 75%, 50%)`;
                let boldColor = `hsl( 61, 94%, 53%)`;
                this.drawPoint(col,row,vx,vy,boldColor);
                this.putLastPoint(col,row,vx,vy,color);
            }
        }
        this.i++;
    }
    installClickListeners() {
        let canvas = this.canvas;
        let clicked = false;
        canvas.addEventListener('mousedown', (e) => clicked = true);
        canvas.addEventListener('mouseup', (e) => clicked = false);
        canvas.addEventListener('mouseout', (e) => clicked = false);
        let listener = (e) => {
            if (! clicked ) { return; }
            if (this.dims === undefined || this.lastModel === undefined) {
                return;
            }
            const pos = getCursorPosition(canvas, e);
            let row = Math.floor( pos.y / this.ph );
            let col = Math.floor( pos.x / this.pw );
            let x = this.pmin + this.prange * (pos.x - col * this.pw) / this.pw;
            let y = this.pmin + this.prange * (pos.y - row * this.ph) / this.ph;
            let tuples = [[row,y],[col,x]];
            //console.log({ pos: pos, tuple:tuples });
            // console.log(`X: ${x} Y: ${y} R: ${row} C: ${col}`);
            this.lastModel.setDims([[row,y],[col,x]]);
        };
        // canvas.addEventListener('click', listener);
        canvas.addEventListener('mousemove', listener);
    }
}

exports.installSliders = installSliders;
exports.PointModel = PointModel;
exports.HyperSphere = circle;
exports.PointPlot = PointPlot;
