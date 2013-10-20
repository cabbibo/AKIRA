define(function(require, exports, module) {


  var Audio     = require( 'app/audio/Audio'      );
  var UserAudio = require( 'app/audio/UserAudio'  );
  var Looper    = require( 'app/audio/Looper'     );
  
  function AudioController( toolbelt , params ){
  
    this.params = _.defaults( params || {}, {
        
      fbc:       1024,        // frequency bin count for all analysers
      bpm:        100,        // You gotta know how fast your track is!
      
    });


    /*
        CREATION
    */

    this.ctx      = new webkitAudioContext();

    this.toolbelt = toolbelt;

    // Start with the filter off
    this.filterOn   = false;
    this.filter     = this.ctx.createBiquadFilter();
    this.compressor = this.ctx.createDynamicsCompressor();
    this.gain       = this.ctx.createGain();
    this.analyser   = this.ctx.createAnalyser();

    this.analyser.frequencyBinCount = this.params.fbc;
    this.analyser.array = new Uint8Array( this.params.fbc );
    
    this.loops = {

      array:        [],
      analyser:     this.ctx.createAnalyser(),
      gain:         this.ctx.createGain()

    }

    this.notes = {

      array:        [],
      analyser:     this.ctx.createAnalyser(),
      gain:         this.ctx.createGain()

    }



    /*
        WIRING
    */

    this.compressor.connect(                     this.gain );
    this.gain.connect(                       this.analyser );
    this.analyser.connect(            this.ctx.destination );

    this.loops.gain.connect(           this.loops.analyser );
    this.loops.analyser.connect(           this.compressor );

    this.notes.gain.connect(           this.notes.analyser );
    this.notes.analyser.connect(           this.compressor );


  }


  AudioController.prototype.toggleFilter = function(){

    if( this.filterOn ){
      this.filterOn = false;
      this.filter.disconnect(0);
      this.compressor.disconnect( 0 );
      this.compressor.connect( this.gain );
    }else{
      this.filterOn = true;
      this.compressor.disconnect( 0 );
      this.compressor.connect( this.filter );
      this.filter.connect( this.gain );
    }

  }

  AudioController.prototype.turnOffFilter = function(){
    this.filterOn = false;
    this.filter.disconnect(0);
    this.compressor.disconnect( 0 );
    this.compressor.connect( this.gain );
  }

  AudioController.prototype.turnOnFilter = function(){
    this.filterOn = true;
    this.compressor.disconnect( 0 );
    this.compressor.connect( this.filter );
    this.filter.connect( this.gain );
  }



  AudioController.prototype.createUserAudio = function(){
    this.userAudio = new UserAudio( this , params );
  }

  AudioController.prototype.createLoop = function( file, params ){
    
    var p = params;
    if(!p) p = {};
    p.looping = true;

    var loop  = new Audio( this , file , p );
    this.loops.array.push( loop );
    
  }

  AudioController.prototype.createNote = function( file, params ){

    var note  = new Audio( this , file , params);
    this.notes.array.push( note );

  }

  AudioController.prototype.playAllLoops = function(){

    for( var i = 0; i < this.loops.array.length; i++ ){
      this.loops.array[i].play();
    }

  }


  AudioController.prototype._update = function(){


    this.analyser.getByteFrequencyData( this.analyser.array );

    //AudioController.looper._update();
    this.update();

    if( this.userAudio ){
      this.userAudio._update();
    }

    for( var i = 0; i < this.loops.length; i++ ){
      this.loops[i]._update();
    }

    for( var i = 0; i < this.notes.length; i++ ){
      this.notes[i]._update();
    }

  }

  AudioController.prototype.update = function(){

  }


  return AudioController

});
