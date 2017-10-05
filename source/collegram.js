try {
    var ctx = new AudioContext || webkitAudioContext();
} catch (e) {
    console.log("No Web Audio API support");
}

try{
    var Reverb = require("soundbank-reverb");
}catch (e){
    console.log(e);
}

try{
    require("web-audio-recorder-js");
}catch (e){
    console.log(e);
}

try{
    var fs = require('fs');
}catch(e){
    console.log(e);
}

var audioOut = ctx.destination;

var masterMix = ctx.createGain();
masterMix.gain.value = 0.25;

audioRecorder = new WebAudioRecorder(masterMix,{
    workerDir: "../node_modules/web-audio-recorder-js/lib-minified/"     
});

function Collegram(){

    var snareSequence = 
    [0,0,0,0,
    1,0,0,0,
    0,0,0,0,
    1,0,0,0,
    0,0,0,0,
    1,0,0,0,
    0,0,0,0,
    1,0,0,0];

    var hihatSeq = 
    [1,1,1,1,
    1,1,1,1,
    1,1,1,1,
    1,1,1,1,
    1,1,1,1,
    1,1,1,1,
    1,1,1,1,
    1,1,1,1];

    var hihatOpen = 
    [0,0,0,0,
    0,0,0,0,
    0,0,0,0,
    0,0,0,0,
    0,0,0,0,
    0,0,0,0,
    0,0,0,0,
    0,0,0,0];
    
    masterMix.connect(audioOut);

    var channelCount = 8;

    var sequencer = new Sequencer(channelCount*32);

    var percs = new Array(channelCount);
    for(var i = 0; i < channelCount; i++){
        var p = new Percussion();
        percs[i] = p;
    }

    var hihat = new Hihat();
    var snare = new Snaredrum();

    var noteTime;
    var startTime;
    var rhythmIndex;
    var tempo = 120;
    var loopLength = 32;
 
    var secondsPerBeat;
    var requestId;

    this.start = function(){
        percs.forEach(
            function(item){
                item.generateNewSound();
            }
        )
        buildUI();
    }
    
    function handlePlay(event) {
        noteTime = 0.0;
        startTime = ctx.currentTime + 0.05;
        rhythmIndex = 0;
        schedule();
    }

    function handleStop(event) {
        cancelAnimationFrame(requestId);
    }

    function schedule(){
        var currentTime = ctx.currentTime;
        currentTime -= startTime;
        var sequenceData = sequencer.getSequence();

        while (noteTime < currentTime + 0.5) {
            var contextPlayTime = noteTime + startTime;
            
            for(var i = 0 ; i < channelCount; i++){
                var offset = i*loopLength;
                if(sequenceData[rhythmIndex+offset]===1){
                    percs[i].bang(contextPlayTime);
                }
            }
            if(snareSequence[rhythmIndex]===1){
                snare.bang(contextPlayTime);
            }
            if(hihatSeq[rhythmIndex]===1){
                hihat.bang(contextPlayTime,hihatOpen[rhythmIndex])
            }
            advanceTime();
        }
        requestId = requestAnimationFrame(schedule);
    }

    function advanceTime() {
        secondsPerBeat = 60.0 / tempo;

        rhythmIndex++;
        if (rhythmIndex == loopLength) {
            rhythmIndex = 0;
        }

        noteTime += 0.25 * secondsPerBeat;
    }

    function buildUI(){
        var playButton = document.createElement("BUTTON");
        playButton.innerHTML = "play";
        playButton.addEventListener('click', function(){
            handlePlay();
        })

        var stopButton = document.createElement("BUTTON");
        stopButton.innerHTML = "stop";
        stopButton.addEventListener('click', function(){
            handleStop();
            try{
                audioRecorder.finishRecording();
            }
            catch(e){
                console.log(e);
            }
        })

        var genButton = document.createElement("BUTTON");
        genButton.innerHTML = "randomise sounds";
        genButton.addEventListener('click', function(){

            percs.forEach(
                function(item){
                    item.generateNewSound();
                }
            )
        })

        var genSeq = document.createElement("BUTTON");
        genSeq.innerHTML = "randomise sequence";
        genSeq.addEventListener('click', function(){
            sequencer.randomiseSequence();
        })

        var masterVol = document.createElement("INPUT");
        masterVol.setAttribute("type","range");
        masterVol.setAttribute("min","0");
        masterVol.setAttribute("max","200");
        masterVol.oninput = function() {
            var g = masterVol.value/100.0;
            masterMix.gain.value = g;
        }

        var tempoControl = document.createElement("INPUT");
        tempoControl.setAttribute("type","number");
        tempoControl.setAttribute("min","40");
        tempoControl.setAttribute("max","300");
        tempoControl.setAttribute("value","120");
        tempoControl.onchange = function(){
            var t = tempoControl.value;
            tempo = t;
        }

        var exportLoop = document.createElement("BUTTON");
        exportLoop.innerHTML = "export loop";
        exportLoop.addEventListener('click', function(){
            handlePlay();
            try{
                audioRecorder.startRecording();
            }
            catch(e){
                console.log(e);
            }

        })

        audioRecorder.onComplete = function(recorder, blob){
            var reader = new FileReader();
            reader.onload = function(){
                var buffer = new Buffer(reader.result);
                fs.writeFile("./source/wav/hello.wav", buffer, {}, (err, res) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                })
            }
            reader.readAsArrayBuffer(blob)
        }

        document.body.appendChild(playButton);
        document.body.appendChild(stopButton);
        document.body.appendChild(genButton);
        document.body.appendChild(genSeq);
        document.body.appendChild(masterVol);
        document.body.appendChild(tempoControl);
        document.body.appendChild(exportLoop);
    }
}

function Sequencer(length){
        this.sequence = [];
        this.length = length;
        for(var i = 0 ; i < this.length; i++){
            var randomValue = getRandomInt(0,16);
            if(randomValue > 15){
                this.sequence[i] = 1;
            }
            else{
                this.sequence[i] = 0;
            }
        }

        this.getSequence = function(){
            return this.sequence;
        }

        this.randomiseSequence = function(){
            for(var i = 0 ; i < this.length; i++){
                var randomValue = getRandomInt(0,16);
                if(randomValue > 15){
                    this.sequence[i] = 1;
                }
                else{
                    this.sequence[i] = 0;
                }
            }
        }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var freqTable = [];
function createFreqTable(){
    var a = 440; // a = 440hz
    for(var i = 0; i < 127; i++){
        freqTable[i] = (a / 32) * (2 ^ ((i-9)/12));
    }
}

function mtof(note){
    return freqTable[note];
}

/*
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
*/