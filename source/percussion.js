// -- White Noise Buffer -- //
var whiteNoise = ctx.createBufferSource(),
whiteNoiseBuffer = ctx.createBuffer(1,4096,ctx.sampleRate),
whiteNoiseData = whiteNoiseBuffer.getChannelData(0);

for (var i = 0; i < 4096; i++) {
whiteNoiseData[i] = Math.random();
}

whiteNoise.buffer = whiteNoiseBuffer;
whiteNoise.loop = true;
// -- //

// -- Pink Noise Buffer -- //
var pinkNoise = ctx.createBufferSource(),
pinkNoiseBuffer = ctx.createBuffer(1,4096,ctx.sampleRate),
pinkNoiseData = pinkNoiseBuffer.getChannelData(0);


var b0, b1, b2, b3, b4, b5, b6;
b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
for (var i = 0; i < 4096; i++) {
var white = Math.random() * 2 - 1;
b0 = 0.99886 * b0 + white * 0.0555179;
b1 = 0.99332 * b1 + white * 0.0750759;
b2 = 0.96900 * b2 + white * 0.1538520;
b3 = 0.86650 * b3 + white * 0.3104856;
b4 = 0.55000 * b4 + white * 0.5329522;
b5 = -0.7616 * b5 - white * 0.0168980;
pinkNoiseData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
pinkNoiseData[i] *= 0.11; // (roughly) compensate for gain
b6 = white * 0.115926;
}

pinkNoise.buffer = pinkNoiseBuffer;
pinkNoise.loop = true;
// -- //

class Percussion {
    constructor(){
        this.waveTypes = ["sine","triangle","square","sawtooth"];
        this.modWaveType = this.waveTypes[getRandomInt(0,3)];
        this.carWaveType = this.waveTypes[getRandomInt(0,3)];

        this.modFreq = getRandomArbitrary(100,880);
        this.carFreq = getRandomArbitrary(440,880);
        this.filterFreq = getRandomArbitrary(100,15000);

        this.modAmpEnvAttack = 0.01;
        this.modAmpEnvRelease = getRandomArbitrary(0.01,0.01);

        this.pitchEnvAttack = 0.00;
        this.pitchEnvRelease = getRandomArbitrary(0.01,1);

        this.ampEnvAttack = 0.01;
        this.ampEnvRelease = getRandomArbitrary(0.01,0.2);

        this.filterEnvAttack = 0.01;
        this.filterEnvRelease = getRandomArbitrary(0.01,0.7);

        this.modulator = ctx.createOscillator();
        this.carrier = ctx.createOscillator();
        this.modAmp = ctx.createGain();
        this.amp = ctx.createGain();
    
        this.modulator.frequency.value = this.modFreq;
        this.modulator.type = this.modWaveType;
        this.modAmp.gain.value = 0;
    
        this.carrier.frequency.value = this.carFreq;
        this.carrier.type = this.carWaveType;
        this.amp.gain.value = 0;
    
        this.modAmpEnv = new Envelope;
        this.modAmpEnv.setAttack( this.modAmpEnvAttack );
        this.modAmpEnv.setRelease( this.modAmpEnvRelease );
        this.modAmpEnv.connect( this.modAmp.gain );
    
        this.pitchEnv = new Envelope;
        this.pitchEnv.setAttack( this.pitchEnvAttack );
        this.pitchEnv.setRelease( this.pitchEnvRelease );
        this.pitchEnv.connect( this.carrier.frequency );
    
        this.ampEnv = new Envelope;
        this.ampEnv.setAttack( this.ampEnvAttack );
        this.ampEnv.setRelease( this.ampEnvRelease );
        this.ampEnv.connect( this.amp.gain );
    
        this.reverb = Reverb(ctx);
        this.reverb.time = getRandomArbitrary(0.5,2); //seconds
        this.reverb.wet.value = Math.random();
        this.reverb.dry.value = Math.random();
    
        this.reverb.filterType = 'lowpass';
        this.reverb.cutoff.value = getRandomInt(700,6000); //Hz

        this.filter = ctx.createBiquadFilter();
        this.filter.type = "lowpass";
        this.filter.frequency.value = this.filterFreq;
        this.filter.Q.value = 0.5;

        this.filterEnv = new Envelope;
        this.filterEnv.setAttack( this.filterEnvAttack );
        this.filterEnv.setRelease( this.filterEnvRelease );
        this.filterEnv.connect( this.filter.frequency );

        this.postReverb = Reverb(ctx);
        this.postReverb.time = getRandomArbitrary(0.5,2); //seconds
        this.postReverb.wet.value = Math.random();
        this.postReverb.dry.value = Math.random();
    
        this.postReverb.filterType = 'lowpass';
        this.postReverb.cutoff.value = getRandomInt(700,6000); //Hz
    
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

    bang(time){
        this.modAmpEnv.trigger(time, this.modFreq*3, 0);
        this.pitchEnv.trigger(time, this.carFreq/2, 50);
        this.ampEnv.trigger(time, 0.5, 0);
        this.filterEnv.trigger(time, this.filterFreq, 100);
    }

    generateNewSound(){

        this.modWaveType = this.waveTypes[getRandomInt(0,3)];
        this.carWaveType = this.waveTypes[getRandomInt(0,3)];
        this.modFreq = getRandomArbitrary(440,3000);
        this.carFreq = getRandomArbitrary(440,1000);

        this.modulator.frequency.value = this.modFreq;
        this.modulator.type = this.modWaveType;

        this.carrier.frequency.value = this.carFreq;
        this.carrier.type = this.carWaveType;

        this.modAmpEnvAttack = 0.01;
        this.modAmpEnvRelease = getRandomArbitrary(0.01,0.01);
        this.modAmpEnv.setAttack( this.modAmpEnvAttack );
        this.modAmpEnv.setRelease( this.modAmpEnvRelease );

        this.pitchEnvAttack = 0.00;
        this.pitchEnvRelease = getRandomArbitrary(0.01,0.1);
        this.pitchEnv.setAttack( this.pitchEnvAttack );
        this.pitchEnv.setRelease( this.pitchEnvRelease );

        this.ampEnvAttack = 0.01;
        this.ampEnvRelease = getRandomArbitrary(0.01,0.7);
        this.ampEnv.setAttack( this.ampEnvAttack );
        this.ampEnv.setRelease( this.ampEnvRelease );

        this.reverb.time = getRandomArbitrary(0.5,2); //seconds
        this.reverb.wet.value = Math.random();
        this.reverb.dry.value = Math.random();

        this.reverb.cutoff.value = getRandomInt(700,6000); //Hz

        this.filterFreq = getRandomArbitrary(100,15000);
        this.filter.frequency.value = this.filterFreq;

        this.postReverb.time = getRandomArbitrary(0.5,2); //seconds
        this.postReverb.wet.value = Math.random();
        this.postReverb.dry.value = Math.random();

        this.postReverb.cutoff.value = getRandomInt(700,6000); //Hz
    }
}