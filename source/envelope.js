function Envelope(){
    this.attackTime = 0.1;
    this.releaseTime = 0.1;

    this.setAttack = function ( attack ) {
        this.attackTime = attack;
    }

    this.setRelease = function ( release ) {
        this.releaseTime = release;
    }

    this.connect = function(param){
        this.param = param;
    }

    this.trigger = function(time,startValue,endValue){
        this.param.cancelScheduledValues( time );
        this.param.setValueAtTime( 0, time );
        this.param.linearRampToValueAtTime( startValue , time + this.attackTime );
        this.param.linearRampToValueAtTime( endValue , time + this.attackTime + this.releaseTime );
    }
}