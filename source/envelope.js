function Envelope(){
    var attackTime = 0.1;
    var releaseTime = 0.1;
    this.param;

    this.setAttack = function ( attack ) {
        attackTime = attack;
    }

    this.setRelease = function ( release ) {
        releaseTime = release;
    }

    this.connect = function(param){
        this.param = param;
    }

    this.trigger = function(time,startValue,endValue){
        this.param.cancelScheduledValues( time );
        this.param.setValueAtTime( 0, time );
        this.param.linearRampToValueAtTime( startValue , time + attackTime );
        this.param.linearRampToValueAtTime( endValue , time + attackTime + releaseTime );
    }
}