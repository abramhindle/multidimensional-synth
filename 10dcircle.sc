s.boot;

~n = 10;

SynthDef(\mysine, {
	|out=0,amp=1.0,freq=440,rq=0.5|
	Out.ar(0,
		Lag.kr(amp,0.1) * 
		RLPF.ar(
			Pulse.ar(  freq )
			,Lag.kr(  freq,0.1)
			,Lag.kr(rq,0.1))
	)
}).add;

~synths = ( 0 .. (~n - 1) ).collect {|i|
	Synth(\mysine,[\amp,0.01])
};

~pointSetta = {
	|msg|
	msg.postln;
	msg[ 1 .. ~n ].do {|x,i|
		var base = 30*(1+i);
		~synths[i].set(\freq, 2*base + (base*x))
	}
};


OSCdef(\point, ~pointSetta, '/point');
