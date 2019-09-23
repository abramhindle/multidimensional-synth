s.options.memSize = 655360;
s.boot;

~n = 10;

~ffreqs = Scale.minor.degreeToFreq((0..(8*7)), 29.midicps, 0);
~fnotes = (0..7).collect {|x| (Scale.minor.degrees) + (x*12)+29 }.flatten;


SynthDef(\tritri,{
	|sweepfreq=10,freq=440,amp=1|
	var sweep, sout;
	sweep = LFSaw.ar(sweepfreq,add:0.01);
	sout = LFTri.ar([freq,freq*1.1]);
	sout = BPF.ar(sout, 50+freq*sweep);
	//sout = LPF.ar(sout, 20+freq*sweep);
	sout = sout + GVerb.ar(sout);
	sout = Normalizer.ar(sout,level: amp);
	Out.ar(0,sout)
}).load(s);

SynthDef(\hydro3, {
	|out=0,amp=1.0,freq=440|
	var nsize,n = (2..10);
	nsize = n.size;
	Out.ar(0,
		amp * 
		(
			n.collect {arg i; 
				SinOsc.ar( (1.0 - (1/(i*i))) * freq ) +
				SinOsc.ar( ((1/4) - (1/((i+1)*(i+1)))) * freq)
			}).sum / (2 * nsize)
	)
}).add;


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

~ssynth = \mysine;
~ssynths = ( 0 .. (~n - 1) ).collect {|i|
	Synth(~ssynth,[\amp,0.01])
};

~ssynth = \tritri;

~tsynths = ( 0 .. (~n - 1) ).collect {|i|
	Synth(~ssynth,[\amp,0.01])
};
~ssynth = \hydro3;
~hsynths = ( 0 .. (~n - 1) ).collect {|i|
	Synth(~ssynth,[\amp,0.01])
};

~ssynthamp = 0.2;
~tsynthamp = 0.0;
~hsynthamp = 0.0;
~pianoamp = 0.3;

~sinebase = 10;
~pointSettaSine = {
	|msg|
	msg.postln;
	msg[ 1 .. ~n ].do {|x,i|
		var nx = (1+x)/2.0;
		var px = msg[ ((i-1) % ~n) + 1];
		var npx = (1+px)/2.0;
		// var note = ~fnotes[(~fnotes.size - 21 - (4*i+1)) % ~fnotes.size] + (10*nx.round);
		var note = ~fnotes[~sinebase+(2*i)];
		var amp = ~ssynthamp * x.abs * 0.1;
		~ssynths[i].set(\freq, note.midicps);
		~ssynths[i].set(\amp, amp + 0.0001);
	}
};

~bsweep = -15.0;
~pointSettaTriTri = {
	|msg|
	msg.postln;
	msg[ 1 .. ~n ].do {|x,i|
		var nx = (1+x)/2.0;
		var px = msg[ ((i-1) % ~n) + 1];
		var npx = (1+px)/2.0;
		var note = ~fnotes[(3*i) % ~fnotes.size].midicps;
		var amp = ~tsynthamp * x.abs * 0.1;
		~tsynths[i].set(\freq, note);
		~tsynths[i].set(\amp, amp + 0.0001);
		~tsynths[i].set(\sweepfreq, ~bsweep*npx+0.01);		
	}
};
~pointSetta = ~pointSettaTriTri;
~pointSettaHydro3 = {
	|msg|
	msg.postln;
	msg[ 1 .. ~n ].do {|x,i|
		var nx = (1+x)/2.0;
		var px = msg[ ((i-1) % ~n) + 1];
		var npx = (1+px)/2.0;
		var note = ~fnotes[(2*i + ~sinebase) % ~fnotes.size].midicps;
		var amp = ~hsynthamp * x.abs * 0.2;
		~hsynths[i].set(\freq, note);
		~hsynths[i].set(\amp, amp + 0.0001);
	}
};
~pointSetta = ~pointSettaHydro3;
~pointSettaPiano = {
	|msg|
	msg.postln;
	msg[ 1 .. ~n ].do {|x,i|
		var nx = (1+x)/2.0;
		var px = msg[ ((i-1) % ~n) + 1];
		var npx = (1+px)/2.0;
		var note = ~fnotes[(3*i) % ~fnotes.size].midicps;
		var amp = ~pianoamp * x.abs * 0.2;
		(amp: amp, freq: note, dur: 4.0.rand + 0.8).play;
	}
};
//(amp: 0.3, freq: ~fnotes[10].midicps, dur: 2.0).play

~pointSetta = {
	|msg|
	~pointSettaSine.(msg);
	~pointSettaTriTri.(msg);
	~pointSettaHydro3.(msg);
	~pointSettaPiano.(msg);
};
OSCdef(\point, ~pointSetta, '/point');
~pointSetta.((0 .. (~n + 1)) * 0)