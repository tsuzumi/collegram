function Snaredrum(){
    var noise = new Noise();

    var tone = ctx.createOscillator();
    var pinkNoise = noise.getPinkNoise();
    
    var toneAmp = ctx.createGain();
    var noiseAmp = ctx.createGain();
    var amp = ctx.createGain();

    var filter = ctx.createBiquadFilter();
    var distortion = ctx.createWaveShaper();

    var toneEnv = new Envelope();
    var tonePitchEnv = new Envelope();

    var noiseEnv = new Envelope();

    tone.frequency.value = 440;
    tone.type = "triangle";

    toneAmp.gain.value = 0;
    noiseAmp.gain.value = 0.0;
    amp.gain.value = 0.5;

    distortion.curve = makeDistortionCurve(50);
    distortion.oversample = "2x";

    filter.type = "highpass";
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    tone.connect(toneAmp);
    toneAmp.connect(distortion);
    pinkNoise.connect(noiseAmp);
    noiseAmp.connect(distortion);
    distortion.connect(filter);
    filter.connect(amp);
    amp.connect(masterMix);

    toneEnv.setAttack( 0.00 );
    toneEnv.setRelease( 0.1 );
    toneEnv.connect( toneAmp.gain );

    tonePitchEnv.setAttack( 0.00 );
    tonePitchEnv.setRelease( 0.01 );
    tonePitchEnv.connect( tone.frequency );

    noiseEnv.setAttack( 0.05 );
    noiseEnv.setRelease( 0.16 );
    noiseEnv.connect( noiseAmp.gain );

    pinkNoise.start();
    tone.start();

    function makeDistortionCurve(amount) {
        var k = typeof amount === 'number' ? amount : 50,
          n_samples = 44100,
          curve = new Float32Array(n_samples),
          deg = Math.PI / 180,
          i = 0,
          x;
        for ( ; i < n_samples; ++i ) {
          x = i * 2 / n_samples - 1;
          curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }
        return curve;
    }

    this.bang = function (time){
        toneEnv.trigger(time, 0.08, 0); 
        tonePitchEnv.trigger(time, 880, 50);
        noiseEnv.trigger(time, 0.05, 0); 
    }
}

function Hihat(){
    var noise = new Noise();
    var whiteNoise = noise.getWhiteNoise();
    var filter = ctx.createBiquadFilter();
    var amp = ctx.createGain();
    var envelope = new Envelope();

    filter.type = "highpass";
    filter.frequency.value = 8000;
    filter.Q.value = 0.5;

    amp.gain.value = 0.0;

    whiteNoise.connect(filter);
    filter.connect(amp);
    amp.connect(masterMix);

    envelope.setAttack( 0.01 );
    envelope.setRelease( 0.02 );
    envelope.connect( amp.gain );

    whiteNoise.start();
    
    this.bang = function (time,open){
        if(open===0){
            envelope.setRelease( 0.02 );
            envelope.trigger(time, 0.05, 0); 
        }
        else{
            envelope.setRelease( 0.5 );
            envelope.trigger(time, 0.05, 0); 
        }
    }
}

function Percussion(){
    var waveTypes = ["sine","triangle","square","sawtooth"];
    var filterTypes = ["highpass","lowpass","bandpass"];

    var modWaveType = waveTypes[getRandomInt(0,3)];
    var carWaveType = waveTypes[getRandomInt(0,3)];

    var modAmpPeak = getRandomArbitrary(50,5000);
    var pitchPeak = getRandomArbitrary(50,5000);

    var modFreq = getRandomArbitrary(50,6000);
    var carFreq = getRandomArbitrary(100,880);
    var filterFreq = getRandomArbitrary(100,15000);

    var modAmpEnvAttack = 0.001;
    var modAmpEnvRelease = getRandomArbitrary(0.01,0.05);

    var pitchEnvAttack = 0.00;
    var pitchEnvRelease = getRandomArbitrary(0.01,0.02);

    var ampEnvAttack = 0.001;
    var ampEnvRelease = getRandomArbitrary(0.01,1);

    var modulator = ctx.createOscillator();
    var carrier = ctx.createOscillator();
    var modAmp = ctx.createGain();
    var amp = ctx.createGain();

    var modAmpEnv = new Envelope();
    var pitchEnv = new Envelope();
    var ampEnv = new Envelope();
    var reverb = Reverb(ctx);
    var postReverb = Reverb(ctx);

    var filter = ctx.createBiquadFilter();

    modulator.frequency.value = modFreq;
    modulator.type = modWaveType;
    modAmp.gain.value = 0;

    carrier.frequency.value = carFreq;
    carrier.type = carWaveType;
    amp.gain.value = 0;

    modAmpEnv.setAttack( modAmpEnvAttack );
    modAmpEnv.setRelease( modAmpEnvRelease );
    modAmpEnv.connect( modAmp.gain );

    pitchEnv.setAttack( pitchEnvAttack );
    pitchEnv.setRelease( pitchEnvRelease );
    pitchEnv.connect( carrier.frequency );

    ampEnv.setAttack( ampEnvAttack );
    ampEnv.setRelease( ampEnvRelease );
    ampEnv.connect( amp.gain );

    reverb.time = getRandomArbitrary(0.5,1); 
    reverb.wet.value = Math.random();
    reverb.dry.value = 1

    reverb.filterType = 'lowpass';
    reverb.cutoff.value = getRandomInt(700,22000); 

    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.5;

    postReverb.time = getRandomArbitrary(0.5,1); 
    postReverb.wet.value = Math.random();
    postReverb.dry.value = 1

    postReverb.filterType = filterTypes[getRandomInt(0,2)];
    postReverb.cutoff.value = getRandomInt(700,22000); 

    modulator.connect(modAmp);
    modAmp.connect(carrier.frequency);
    carrier.connect(amp);
    amp.connect(reverb);
    reverb.connect(filter);
    filter.connect(postReverb);
    postReverb.connect(masterMix);

    modulator.start();
    carrier.start();

    this.generateNewSound = function(){
        modWaveType = waveTypes[getRandomInt(0,3)];
        carWaveType = waveTypes[getRandomInt(0,3)];

        modFreq = getRandomArbitrary(50,6000);
        carFreq = getRandomArbitrary(100,880);
        filterFreq = getRandomArbitrary(100,15000);

        modulator.frequency.value = modFreq;
        modulator.type = modWaveType;

        carrier.frequency.value = carFreq;
        carrier.type = carWaveType;

        modAmpEnvAttack = 0.001;
        modAmpEnvRelease = getRandomArbitrary(0.01,0.05);
        modAmpEnv.setAttack( modAmpEnvAttack );
        modAmpEnv.setRelease( modAmpEnvRelease );

        pitchEnvAttack = 0.0;
        pitchEnvRelease = getRandomArbitrary(0.01,0.02);
        pitchEnv.setAttack( pitchEnvAttack );
        pitchEnv.setRelease( pitchEnvRelease );

        ampEnvAttack = 0.001;
        var ampEnvRelease = getRandomArbitrary(0.01,1);
        ampEnv.setAttack( ampEnvAttack );
        ampEnv.setRelease( ampEnvRelease );

        reverb.time = getRandomArbitrary(0.5,1); 
        reverb.wet.value = Math.random();
        reverb.dry.value = Math.random();

        reverb.cutoff.value = getRandomInt(700,22000); 

        filter.frequency.value = filterFreq;

        postReverb.time = getRandomArbitrary(0.5,2); 
        postReverb.wet.value = Math.random();
        postReverb.dry.value = Math.random();
    
        postReverb.filterType = filterTypes[getRandomInt(0,2)];
        postReverb.cutoff.value = getRandomInt(700,22000); 

        modAmpPeak = getRandomArbitrary(50,5000);
        pitchPeak = getRandomArbitrary(carFreq,carFreq*2);
    }

    this.bang = function(time){
        modAmpEnv.trigger(time, modAmpPeak, 0);
        pitchEnv.trigger(time, pitchPeak, 50);
        ampEnv.trigger(time, 0.05, 0);
    }
}
