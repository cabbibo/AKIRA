define(function(require, exports, module) {


  var Tweener = require( 'app/utils/Tweener' );

  function Scene( world , params ){
  
    this.world = world;
    this.womb  = world.womb;

    var s = this.world.size * 10;

    this.params = _.defaults( params || {} , {

      transition:                                         'position',
      transitionTime:                                              1,
      inTarget:                       new THREE.Vector3( 0 , 0 , 0 ),
      outTarget:                      new THREE.Vector3( s , s , s ),
      onEnter: function(){ console.log('Transition In  Finished'); },
      onExit:  function(){ console.log('Transition Out Finished'); },

    });

    this.world = world;
    this.womb  = world.womb;

    // Only updates if active
    this.active = false;

    this.scene = new THREE.Object3D();

    // Makes sure that we start in the right place
    if( this.params.transition == 'position' ){

      this.scene.position = this.params.outTarget.clone();

    }else if( this.params.transition == 'scale' ){

      this.scene.scale = this.params.outTarget.clone();
  
    }

    this.transitionIn = this.womb.tweener.createTween({

      object:                   this.scene,
      target:         this.params.inTarget,
      type:         this.params.transition,
      time:     this.params.transitionTime,
      callback:         this.params.onEnter

    });

    // Makes sure that when a scene is finished,
    // it will ALWAYS be removed from the womb
    this.onExit = function(){
      this.params.onExit();
      this.world.scene.remove( this.scene );
    }

    this.transitionOut = this.womb.tweener.createTween({

      object:                   this.scene,
      target:        this.params.outTarget,
      type:         this.params.transition,
      time:     this.params.transitionTime,
      callback:                 this.onExit

    });


  }


  Scene.prototype.enter = function(){

    this.world.scene.add( this.scene );

    console.log( this.transitionIn );
    this.transitionIn.start();

  }

  Scene.prototype.exit = function(){

    this.transitionOut.start();

  }

  Scene.prototype.update = function(){

  }

  module.exports = Scene;


});
