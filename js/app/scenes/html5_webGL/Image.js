define(function(require, exports, module) {

  var m                   = require('app/utils/Math'              );
  var AudioGeometry       = require('app/three/AudioGeometry'     );
  var AnalyzingFunctions  = require('app/utils/AnalyzingFunctions');


  var Womb                = require( 'app/Womb'                       );

  var recursiveFunctions  = require( 'app/utils/RecursiveFunctions'   );
  
  var fragmentShaders     = require( 'app/shaders/fragmentShaders'    );
  var vertexShaders       = require( 'app/shaders/vertexShaders'      );
  var physicsShaders      = require( 'app/shaders/physicsShaders'     );
  var shaderChunks        = require( 'app/shaders/shaderChunks'       );

  var PhysicsSimulator    = require( 'app/shaders/PhysicsSimulator'   );
  var physicsShaders      = require( 'app/shaders/physicsShaders'     );


  function Credits( womb , params ){

    this.womb = womb;

    this.womb.loader.addToLoadBar();

    var self = this;
    this.params = _.defaults( params || {} , {

      text: 'HELLO',
      spin: .001,
      color: new THREE.Vector3( .3 , .5 , 1.9 ),
      radius: 10,
      size:   .3,
      modelScale: 1,
      audioPower: 0.5,
      noisePower: 0.1,
      texture:    womb.stream.texture.texture,
      image: '/lib/img/centerLogoWhite.png',
      fragmentAudio: true,
      vertexAudio:    true,
      geo: new THREE.CubeGeometry( 1 , 1 , 1 , 10 , 10 ,10 ),
      numOf: 50

    });

    this.world = this.womb.sceneController.createScene();

    this.scene = this.world.scene;

    this.texture = this.params.texture;

    if( this.params.audio )
      this.audio = this.params.audio;

    var self = this;

    this.geo = this.params.geo;

    this.links = [];

    this.u = {
      texture:    { type: "t", value: womb.stream.texture.texture },
      image:      { type: "t", value: womb.stream.texture.texture },

      color:      { type: "v3", value: this.params.color },
      time:       womb.time,
      pow_noise:  { type: "f" , value: 0.01 },
      pow_audio:  { type: "f" , value: .04 },
    }
    
    this.t_CENTER = womb.imageLoader.load( this.params.image );
    console.log( this.t_CENTER );


    this.u_CENTER= THREE.UniformsUtils.merge( [
        THREE.ShaderLib['basic'].uniforms,
        this.u,
    ]);

    this.u_CENTER.time          = this.womb.time;
    this.u_CENTER.image.value   = this.t_CENTER;
    this.u_CENTER.texture.value = this.params.texture;
    
    if( this.audio )
      this.u_CENTER.texture.value = this.audio.texture.texture;

    // Have to switch out for the picture if we aren't doing an 
    // Audio Fragment Shader
     if( this.params.fragmentAudio ){
      this.fragmentShader = fragmentShaders.audio.color.image.sample_pos_diamond
    }else{
      this.u_CENTER.texture.value = this.u_CENTER.image.value;
      this.fragmentShader = fragmentShaders.texture;
    }

    if( this.params.vertexAudio ){
      this.vertexShader = vertexShaders.audio.noise.position
    }else{
      this.vertexShader = vertexShaders.passThrough;
    }


    this.m_CENTER = new THREE.ShaderMaterial( {
      uniforms:       this.u_CENTER, 
      vertexShader:   this.vertexShader,
      fragmentShader: this.fragmentShader,
      transparent:    true,
      fog:            true,
      opacity:        0.1,
      side:           THREE.DoubleSide
    });

    mate = new THREE.MeshNormalMaterial();
    this.CENTER = new THREE.Mesh(
      this.params.geo,
      this.m_CENTER
      //mate
    );

    //this.CENTER.scale.x = this.t_CENTER.scaledWidth;
    //this.CENTER.scale.y = this.t_CENTER.scaledHeight;

    this.scene.add( this.CENTER );
  
    this.womb.loader.loadBarAdd();

    //this.world.update = this.update.bind( this );

  }


   

  Credits.prototype.enter = function(){

    if( this.audio ){
      this.audio.play();
      this.audio.gain.gain.value = 0.0
      this.audio.fadeIn( 1 );
    }
    //this.audio.turnOnFilter();
    this.world.enter();
  }

  Credits.prototype.exit = function(){
   
    if( this.audio ){
      this.audio.fadeOut();
    }
  
    this.world.exit();
  
  }

  module.exports = Credits;

});
