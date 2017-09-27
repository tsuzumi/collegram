
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

function Snaredrum(){
    var noise = pinkNoise;
    var filter = ctx.createBiquadFilter();
    var amp = ctx.createGain();
    var envelope = new Envelope();

    filter.type = "highpass";
    filter.frequency.value = 100;
    filter.Q.value = 0.5;

    amp.gain.value = 0.0;

    noise.connect(filter);
    filter.connect(amp);
    amp.connect(masterMix);


    envelope.setAttack( 0.01 );
    envelope.setRelease( 0.2 );
    envelope.connect( amp.gain );

    noise.start();
        
    this.bang = function (time){
        envelope.trigger(time, 0.08, 0);  
    }

}

function Hihat(){
    var noise = whiteNoise;
    var filter = ctx.createBiquadFilter();
    var amp = ctx.createGain();
    var envelope = new Envelope();

    filter.type = "highpass";
    filter.frequency.value = 8000;
    filter.Q.value = 0.5;

    amp.gain.value = 0.0;

    noise.connect(filter);
    filter.connect(amp);
    amp.connect(masterMix);

    envelope.setAttack( 0.01 );
    envelope.setRelease( 0.02 );
    envelope.connect( amp.gain );

    noise.start();
    
    this.bang = function (time,open){
        if(open===0){
            envelope.setRelease( 0.02 );
            envelope.trigger(time, 0.125, 0); 
        }
        else{
            envelope.setRelease( 0.5 );
            envelope.trigger(time, 0.07, 0); 
        }
    }
}

function Percussion(ctx){
    var waveTypes = ["sine","triangle","square","sawtooth"];
    var modWaveType = waveTypes[getRandomInt(0,3)];
    var carWaveType = waveTypes[getRandomInt(0,3)];

    var modAmpPeak = getRandomArbitrary(50,5000);
    var pitchPeak = getRandomArbitrary(50,5000);

    var modFreq = getRandomArbitrary(100,4186);
    var carFreq = getRandomArbitrary(440,880);
    var filterFreq = getRandomArbitrary(100,15000);

    var modAmpEnvAttack = 0.01;
    var modAmpEnvRelease = getRandomArbitrary(0.01,0.01);

    var pitchEnvAttack = 0.00;
    var pitchEnvRelease = getRandomArbitrary(0.01,1);

    var ampEnvAttack = 0.01;
    var ampEnvRelease = getRandomArbitrary(0.01,0.2);

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

    reverb.time = getRandomArbitrary(0.5,2); //seconds
    reverb.wet.value = Math.random();
    reverb.dry.value = Math.random();

    reverb.filterType = 'lowpass';
    reverb.cutoff.value = getRandomInt(700,6000); //Hz

    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.5;

    postReverb.time = getRandomArbitrary(0.5,2); //seconds
    postReverb.wet.value = Math.random();
    postReverb.dry.value = Math.random();

    postReverb.filterType = 'lowpass';
    postReverb.cutoff.value = getRandomInt(700,6000); //Hz

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
        modFreq = getRandomArbitrary(100,3000);
        carFreq = getRandomArbitrary(100,1000);

        modulator.frequency.value = modFreq;
        modulator.type = modWaveType;

        carrier.frequency.value = carFreq;
        carrier.type = carWaveType;

        modAmpEnvAttack = 0.001;
        modAmpEnvRelease = getRandomArbitrary(0.01,0.1);
        modAmpEnv.setAttack( modAmpEnvAttack );
        modAmpEnv.setRelease( modAmpEnvRelease );

        pitchEnvAttack = 0.0;
        pitchEnvRelease = getRandomArbitrary(0.01,0.05);
        pitchEnv.setAttack( pitchEnvAttack );
        pitchEnv.setRelease( pitchEnvRelease );

        ampEnvAttack = 0.001;
        ampEnvRelease = getRandomArbitrary(0.01,0.7);
        ampEnv.setAttack( ampEnvAttack );
        ampEnv.setRelease( ampEnvRelease );

        reverb.time = getRandomArbitrary(0.01,0.5); //seconds
        reverb.wet.value = Math.random();
        reverb.dry.value = Math.random();

        reverb.cutoff.value = getRandomInt(700,22000); //Hz

        filterFreq = getRandomArbitrary(350,15000);
        filter.frequency.value = filterFreq;

        postReverb.time = getRandomArbitrary(0.1,1); //seconds
        postReverb.wet.value = Math.random();
        postReverb.dry.value = Math.random();

        postReverb.cutoff.value = getRandomInt(700,22000); //Hz

        modAmpPeak = getRandomArbitrary(50,5000);
        pitchPeak = getRandomArbitrary(carFreq,carFreq*2);
    }

    this.bang = function(time){
        modAmpEnv.trigger(time, modAmpPeak, 0);
        pitchEnv.trigger(time, pitchPeak, 50);
        ampEnv.trigger(time, 0.05, 0);
    }
}
