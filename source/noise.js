function Noise(){
    var whiteNoise = ctx.createBufferSource();
    var pinkNoise = ctx.createBufferSource();
    var brownNoise = ctx.createBufferSource();

    whiteNoiseBuffer = ctx.createBuffer(1,4096,ctx.sampleRate),
    whiteNoiseData = whiteNoiseBuffer.getChannelData(0);

    pinkNoiseBuffer = ctx.createBuffer(1,4096,ctx.sampleRate),
    pinkNoiseData = pinkNoiseBuffer.getChannelData(0);

    brownNoiseBuffer = ctx.createBuffer(1,4096,ctx.sampleRate),
    brownNoiseData = brownNoiseBuffer.getChannelData(0);

    for (var i = 0; i < 4096; i++) {
        whiteNoiseData[i] = Math.random();
    }
    
    whiteNoise.buffer = whiteNoiseBuffer;
    whiteNoise.loop = true;
    
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
        pinkNoiseData[i] *= 0.11; 
        b6 = white * 0.115926;
    }
    pinkNoise.buffer = pinkNoiseBuffer;
    pinkNoise.loop = true;
    
    var lastOut = 0.0;
    for (var i = 0; i < 4096; i++) {
        var white = Math.random() * 2 - 1;
        brownNoiseData[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = brownNoiseData[i];
        brownNoiseData[i] *= 3.5; 
    }
    brownNoise.buffer = brownNoiseBuffer;
    brownNoise.loop;
    
    this.getWhiteNoise = function(){
        return whiteNoise;
    }

    this.getPinkNoise = function(){
        return pinkNoise;
    }

    this.getBrownNoise = function(){
        return brownNoise;
    }
}