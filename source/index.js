/*

WEB AUDIO EXPLORATION

COLLEGRAM PROCEDURAL RYTHMIC GENERATOR V0.001DEV

CREATED BY : Félix Montmorency

DATE : 2017-09-21

*/

var ctx = new AudioContext || webkitAudioContext();
var out = ctx.destination;
var Reverb = require('soundbank-reverb');

var masterMix = ctx.createGain();
masterMix.gain.value = 1;

var compressor = ctx.createDynamicsCompressor();
compressor.threshold.value = -50;
compressor.knee.value = 40;
compressor.ratio.value = 12;
compressor.attack.value = 0.1;
compressor.release.value = 0.25;

masterMix.connect(compressor);
compressor.connect(out);

// -- Envelope Class -- //
Envelope = ( function( ctx ) {
    function Envelope() {
        this.attackTime = 0.1;
        this.releaseTime = 0.1;
    };
    Envelope.prototype.setAttack = function ( attack ) {
        this.attackTime = attack;
    };
    Envelope.prototype.setRelease = function ( release ) {
        this.releaseTime = release;
    };
    Envelope.prototype.trigger = function(time, startValue, endValue ) {
        this.param.cancelScheduledValues( time );
        this.param.setValueAtTime( 0, time );
        this.param.linearRampToValueAtTime( startValue , time + this.attackTime );
        this.param.linearRampToValueAtTime( endValue , time + this.attackTime + this.releaseTime );
    };
    Envelope.prototype.connect = function(param) {
        this.param = param;
    };
    return Envelope;
})(ctx);
// -- //

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class SnareDrum {

    constructor(amplitude,decay){
        this.amplitude = amplitude;
        this.decay = decay;

        this.noise = pinkNoise;

        this.filter = ctx.createBiquadFilter();
        this.filter.type = "highpass";
        this.filter.frequency.value = 100;
        this.filter.Q.value = 0.5;

        this.amp = ctx.createGain();

        this.amp.gain.value = 0.0;
  
        this.noise.connect(this.filter);
        this.filter.connect(this.amp);
        this.amp.connect(out);

        this.envelope = new Envelope;
        this.envelope.setAttack( 0.01 );
        this.envelope.setRelease( 0.1 );
        this.envelope.connect( this.amp.gain );

        this.noise.start();
        
    }

    bang(time){
        this.envelope.trigger(time, 1, 0);  
    }

}

class HiHat {
    
        constructor(amplitude,decay){
            this.amplitude = amplitude;
            this.decay = decay;
    
            this.noise = whiteNoise;

            this.filter = ctx.createBiquadFilter();
            this.filter.type = "highpass";
            this.filter.frequency.value = 15000;
            this.filter.Q.value = 0.5;

            this.amp = ctx.createGain();
    
            this.amp.gain.value = 0.0;
    
            this.noise.connect(this.filter);
            this.filter.connect(this.amp);
            this.amp.connect(out);

            this.envelope = new Envelope;
            this.envelope.setAttack( 0.01 );
            this.envelope.setRelease( 0.02 );
            this.envelope.connect( this.amp.gain );

            this.noise.start();
        }
    
        bang(time){
            this.envelope.trigger(time, 0.5, 0); 
        }
    
}

var noteTime;
var startTime;
var rhytmIndex;
var timeoutId;
var requestId;

var rythmA,
rythmB,
rythmC,
rythmD;

var bassDrum;
var snare;
var hihat;
var perc;

var x = document.createElement("CANVAS");
var pencil = x.getContext("2d");

var xValues = [],
yValues = [];

var w = 10,
posX = 320,
posY = 0;

var centerX = 640/2;
var centerY = 480/2;

var radius = 200,
steps = 16;

var sequence1 = new Array
(1,0,0,0,
 0,0,0,0,
 0,0,1,0,
 0,0,0,0,

 0,0,0,0,
 1,0,0,0,
 0,0,0,0,
 1,0,0,0,

 0,1,0,0,
 0,0,0,0,
 0,0,0,1,
 0,1,0,0);

 var seq = [];

function init(){

    for(var i = 0 ; i < 64; i++){
        var randomValue = getRandomInt(0,16);
        if(randomValue > 8){
            seq[i] = 1;
        }
        else{
            seq[i] = 0;
        }
        console.log(seq[i]);
    }
    
    snare = new SnareDrum(0.2,0.4);
    hihat = new HiHat(0.5,0.08);

    perc = new Percussion();
    perc1 = new Percussion();
    perc2 = new Percussion();
    perc3 = new Percussion();

    pencil.canvas.width  = window.innerWidth;
    pencil.canvas.height = window.innerHeight;
    pencil.fillStyle = "white";
    pencil.font = "12px Arial";
    pencil.fillText("Collegram V0.001",10,50);

    document.body.appendChild(x);
}

function drawPlayhead(index){
    pencil.clearRect(0, 0, pencil.canvas.width, pencil.canvas.height);
    pencil.fillText("Collegram V0.001",10,50);
    pencil.fillRect(xValues[index],yValues[index],20,20);

    pencil.fillStyle = "white";   
    for (var i = 0; i < steps; i++) {
        xValues[i] = (centerX + radius * Math.cos(2 * Math.PI * i / steps));
        yValues[i] = (centerY + radius * Math.sin(2 * Math.PI * i / steps));
        pencil.fillRect(xValues[i],yValues[i],w,w);
    }
    pencil.fillStyle = "gray";
    pencil.strokeStyle = 'gray';
}

function handlePlay(event) {
    noteTime = 0.0;
    startTime = ctx.currentTime + 0.005;
    rhythmIndex = 0;

    rythmA = 0;
    rythmB = 0;
    rythmC = 0;
    rythmD = 0;
    schedule();
}

function handleStop(event) {
    cancelAnimationFrame(requestId);
}

function schedule() {
    var currentTime = ctx.currentTime;

    currentTime -= startTime;

    while (noteTime < currentTime + 0.200) {
        var contextPlayTime = noteTime + startTime;

        if(sequence1[rhythmIndex+16]===1){
            snare.bang(contextPlayTime);
        }
        if(seq[rythmA] === 1){
            perc.bang(contextPlayTime);
        }
        if(seq[rythmB+16] === 1){
            perc1.bang(contextPlayTime);
        }
        if(seq[rythmC+32] === 1){
            perc2.bang(contextPlayTime);
        }
        if(seq[rythmD+48] === 1){
            perc3.bang(contextPlayTime);
        }
        hihat.bang(contextPlayTime);
        advanceTime();
    }
    drawPlayhead(rhythmIndex);

    requestId = requestAnimationFrame(schedule);
}

function advanceTime() {
    var tempo = 82.0;
    var secondsPerBeat = 60.0 / tempo;

    rhythmIndex++;

    rythmA++;
    rythmB++;
    rythmC++;
    rythmD++;
    if (rhythmIndex == 16) {
        rhythmIndex = 0;
    }

    if(rythmA == 3){
        rythmA = 0;
    }
    if(rythmB == 6){
        rythmB = 0;
    }
    if(rythmC == 8){
        rythmC = 0;
    }
    if(rythmD == 16){
        rythmD = 0;
    }
    noteTime += 0.25 * secondsPerBeat;
}

var isPlaying = false;

window.addEventListener('load', init, false);

window.onkeyup = function(e) {
    console.log(e.keyCode);
    var key = e.keyCode;
    if(key===32){
        if(!isPlaying){
            handlePlay();
            isPlaying=true;
        }
        else{
            handleStop();
            isPlaying=false;
        }
    }

    if(key==81){
        for(var i = 0 ; i < 64; i++){
            var randomValue = getRandomInt(0,16);
            if(randomValue > 8){
                seq[i] = 1;
            }
            else{
                seq[i] = 0;
            }
            console.log(seq[i]);
        }
    }

}

window.onclick = function(e){
    perc.generateNewSound();
    perc1.generateNewSound();
    perc2.generateNewSound();
    perc3.generateNewSound();
}