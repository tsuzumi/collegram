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

class Percussion{
    constructor(){

        // node creation
        this.modulator = ctx.createOscillator();
        this.carrier = ctx.createOscillator();
        this.modAmp = ctx.createGain();
        this.amp = ctx.createGain();

        this.modAmpEnv = new Envelope();
        this.pitchEnv = new Envelope();
        this.ampEnv = new Envelope();
        this.reverb = Reverb(ctx);
        this.filter = ctx.createBiquadFilter();
        this.postReverb = Reverb(ctx);
        //---------------------------->
        //param
        this.waveTypes = ["sine","triangle","square","sawtooth"];
        this.filterTypes = ["highpass","lowpass","bandpass"];

        this.modWaveType = this.waveTypes[getRandomInt(0,3)];
        this.carWaveType = this.waveTypes[getRandomInt(0,3)];

        this.modFreq = getRandomArbitrary(50,6000);
        this.carFreq = getRandomArbitrary(50,6000);

        this.filterFreq = getRandomArbitrary(100,15000);

        this.modAmpEnvAttack = 0.001;
        this.modAmpEnvRelease = getRandomArbitrary(0.01,0.05);
    
        this.pitchEnvAttack = 0.00;
        this.pitchEnvRelease = getRandomArbitrary(0.01,0.02);
    
        this.ampEnvAttack = 0.001;
        this.ampEnvRelease = getRandomArbitrary(0.01,0.3);

        this.modAmpPeak = getRandomArbitrary(500,5000);
        this.pitchPeak = getRandomArbitrary(this.carFreq,this.carFreq*2);
        //---------------------------->
        // node setup
        this.modulator.frequency.value = this.modFreq;
        this.modulator.type = this.modWaveType;
        this.modAmp.gain.value = 0;
    
        this.carrier.frequency.value = this.carFreq;
        this.carrier.type = this.carWaveType;
        this.amp.gain.value = 0;

        this.modAmpEnv.setAttack( this.modAmpEnvAttack );
        this.modAmpEnv.setRelease( this.modAmpEnvRelease );
        this.modAmpEnv.connect( this.modAmp.gain );
    
        this.pitchEnv.setAttack( this.pitchEnvAttack );
        this.pitchEnv.setRelease( this.pitchEnvRelease );
        this.pitchEnv.connect( this.carrier.frequency );
    
        this.ampEnv.setAttack( this.ampEnvAttack );
        this.ampEnv.setRelease( this.ampEnvRelease );
        this.ampEnv.connect( this.amp.gain );
        //---------------------------->
        // dsp
        this.reverb.time = getRandomArbitrary(0.5,1); 
        this.reverb.filterType = this.filterTypes[getRandomInt(0,2)];
        this.reverb.cutoff.value = getRandomInt(700,22000);

        this.reverb.wet.value = Math.random();
        this.reverb.dry.value = 1;
    
        this.filter.type = "lowpass";
        this.filter.frequency.value = this.filterFreq;
        this.filter.Q.value = 0.5;
    
        this.postReverb.time = getRandomArbitrary(0.5,1); 

        this.postReverb.filterType = this.filterTypes[getRandomInt(0,2)];
        this.postReverb.cutoff.value = getRandomInt(700,22000);

        this.postReverb.wet.value = Math.random();
        this.postReverb.dry.value = 1;
        //---------------------------->
        // node connection
        this.modulator.connect(this.modAmp);
        this.modAmp.connect(this.carrier.frequency);
        this.carrier.connect(this.amp);
        this.amp.connect(this.reverb);
        
        this.reverb.connect(this.filter);
        this.filter.connect(this.postReverb);
        this.postReverb.connect(masterMix);
    
        this.modulator.start();
        this.carrier.start();
    }

    generateNewSound(){
        this.modWaveType = this.waveTypes[getRandomInt(0,3)];
        this.carWaveType = this.waveTypes[getRandomInt(0,3)];
        this.modulator.type = this.modWaveType;
        this.carrier.type = this.carWaveType;

        this.modFreq = getRandomArbitrary(50,6000);
        this.carFreq = getRandomArbitrary(50,6000);
        this.modulator.frequency.value = this.modFreq;
        this.carrier.frequency.value = this.carFreq;

        this.modAmpEnvAttack = 0.001;
        this.modAmpEnvRelease = getRandomArbitrary(0.01,0.05);
    
        this.pitchEnvAttack = 0.00;
        this.pitchEnvRelease = getRandomArbitrary(0.01,0.02);
    
        this.ampEnvAttack = 0.001;
        this.ampEnvRelease = getRandomArbitrary(0.01,0.3);

        this.modAmpEnv.setAttack( this.modAmpEnvAttack );
        this.modAmpEnv.setRelease( this.modAmpEnvRelease );

        this.pitchEnv.setAttack( this.pitchEnvAttack );
        this.pitchEnv.setRelease( this.pitchEnvRelease );

        this.ampEnv.setAttack( this.ampEnvAttack );
        this.ampEnv.setRelease( this.ampEnvRelease );

        this.reverb.time = getRandomArbitrary(0.1,1);
        this.reverb.filterType = this.filterTypes[getRandomInt(0,2)];
        this.reverb.cutoff.value = getRandomInt(700,22000); 

        this.reverb.wet.value = Math.random();
        this.reverb.dry.value = 1;

        this.filterFreq = getRandomArbitrary(100,15000);
        this.filter.frequency.value = this.filterFreq;
        
        this.postReverb.time = getRandomArbitrary(0.5,1);
        this.postReverb.filterType = this.filterTypes[getRandomInt(0,2)];
        this.postReverb.cutoff.value = getRandomInt(700,22000);

        this.postReverb.wet.value = Math.random();
        this.postReverb.dry.value = 1;

        this.modAmpPeak = getRandomArbitrary(500,5000);
        this.pitchPeak = getRandomArbitrary(this.carFreq,this.carFreq*2);

        //console.log(JSON.stringify(this));
    }

    bang(time){
        this.modAmpEnv.trigger(time, this.modAmpPeak, 0);
        this.pitchEnv.trigger(time, this.pitchPeak, 50);
        this.ampEnv.trigger(time, 0.125, 0);
    }
}

