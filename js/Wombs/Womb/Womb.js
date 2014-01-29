define(function(require, exports, module) {

  /*       YOU        */  require( 'lib/three'                      );
  /*       ARE        */  require( 'lib/underscore'                 );
  /*      WOMBS       */  require( 'lib/stats.min'                  );
 

  var Creator           = require( 'Womb/Creator'                   );

  var Interface         = require( 'Womb/Interface'                 );
  
  var Animator          = require( 'Womb/Animator'                  );
  var Tweener           = require( 'Womb/Tweener'                   );
  
  var Raycaster         = require( 'Womb/Raycaster'                 );
  var EffectComposer    = require( 'Womb/EffectComposer'            );

  var AudioController   = require( 'Womb/audio/AudioController'     );

  var CameraController  = require( 'Womb/Camera/CameraController'   );

  var UserMediaTexture  = require( 'Womb/textures/UserMediaTexture' );
  var TextCreator       = require( 'Womb/textures/TextTexture'      );
  
  var Loader            = require( 'Womb/Loading/Loader'            );

  var ImageLoader       = require( 'Womb/Loading/ImageLoader'       );
  var ModelLoader       = require( 'Womb/Loading/ModelLoader'       );
  var ObjLoader         = require( 'Womb/Loading/ObjLoader'         );
  var JSONLoader        = require( 'Womb/Loading/JSONLoader'        );

  
  var LeapController    = require( 'Utils/LeapController'           );


  function Womb(params){

    this.params = _.defaults( params || {} , {
      raycaster:        false,
      cameraController: false,
      massController:   false,
      springController: false,
      leapController:   false,
      textCreator:      false,
      size:             100,
      color:            '#000000',
      neededTech:       [ 'webGL' , 'audio' , 'mobile' ],
      failureTitleText: "This project requires the following:",
      failureVideoText: "But here's a video which is probably better anyway",
      failureVideo:     69517912  // The Vimeo Video Number !
    });

    this.loaderParams = {};
    this.loaderParams.neededTech = this.params.neededTech;

    this.interface        = new Interface(        this );
    this.loader           = new Loader(           this );
    this.tweener          = new Tweener(          this );

    this.animator         = new Animator(         this );
    this.audioController  = new AudioController(  this );

    // Time uniform
    this.time = { type: "f", value: 1.0 } ;

    /*
     *
     * SETTING UP THE SCENE
     *
     */


    this.size = this.params.size;

    this.scene = new THREE.Scene();


    // CAMERA
    this.width = window.innerWidth;
    this.height = window.innerHeight;
 
    this.camera = new THREE.PerspectiveCamera( 
      40 ,
      this.width / this.height ,
      this.size / 100,
      this.size  * 40
    );

    this.camera.position.z = this.size;

    this.mouse = new THREE.Vector2();

    var c = this.params.color.replace( "#" , "0x" );
    this.color = new THREE.Color( );
    this.color.setHex( c );
   
    this.scene.fog = new THREE.Fog( this.color , this.size , this.camera.far * .8 );

    // Getting the container in the right location
    this.container = document.createElement( 'div' );
    this.container.id = 'renderingContainer';

    document.body.appendChild( this.container );

    this.renderer = new THREE.WebGLRenderer();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

 
    this.renderer.domElement.style.background = this.params.color;
    this.container.appendChild( this.renderer.domElement );

    if( this.params.leapController ){
      this.leapController = LeapController;
      this.leapController.size = this.size;
    }

    if( this.params.cameraController )
      this.cameraController = new CameraController( this , this.params.cameraController );
      
    if( this.params.raycaster )
      this.raycaster = new Raycaster( this );

    if( this.params.imageLoader )
      this.imageLoader = new ImageLoader( this );

    if( this.params.modelLoader )
      this.modelLoader = new ModelLoader( this );

    if( this.params.objLoader )
      this.objLoader = new ObjLoader( this );

    if( this.params.JSONLoader )
      this.JSONLoader = new JSONLoader( this );

    if( this.params.effectComposer )
      this.effectComposer  = new EffectComposer(  this );

    if( this.params.userMediaTexture )
      this.userMediaTexture = new UserMediaTexture( this );

    if( this.params.textCreator )
      this.textCreator = new TextCreator( this );

    this.creator  = new Creator( this );

    window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

    this.container.addEventListener( 'mousemove', this._onMouseMove.bind(  this ), false );
    this.container.addEventListener( 'mousedown', this._onMouseDown.bind(  this ), false );
    this.container.addEventListener( 'mouseup'  , this._onMouseUp.bind(    this ), false );



    this.clock            = new THREE.Clock();

    if( this.params.massController )
      this.massController   = new MassController( this );

    if( this.params.springController )
      this.springController = new SpringController( this , this.massController );

  }

  // This is what will be called in our loaded
  Womb.prototype._start = function(){
   
    if( this.leapController ){
      this.leapController.connect();
    }
    
    this.start();

    this.animator.start();

  }

   Womb.prototype.start = function(){

  }


  Womb.prototype._onMouseMove = function( e ){
  
    this.mouse.x = 1 - ( this.width  - e.clientX ) / this.width;
    this.mouse.y = 1 - ( this.height - e.clientY ) / this.height;
 
    this.onMouseMove(e);

  }
  Womb.prototype.onMouseMove = function(e){};


  Womb.prototype._onMouseDown = function(e){
  
    this.onMouseDown(e);
    this.mouseDown = true;

  }
  Womb.prototype.onMouseDown = function(e){};

  Womb.prototype._onMouseUp = function(e){
  
    this.onMouseUp(e);
    this.mouseDown = false;


  }
  Womb.prototype.onMouseUp = function(e){};




  Womb.prototype.console = function(){ 
    console.log( this ); 
  }

  Womb.prototype._update = function(){

    this.delta = this.clock.getDelta();

    this.time.value += this.delta;
    
    TWEEN.update();

    if( this.massController   ) this.massController._update();
    if( this.springController ) this.springController._update();
   
    this.audioController._update();
     
    this.creator._update();
    
    if( this.raycaster ) 
      this.raycaster._update();
    
    if( this.cameraController )
      this.cameraController._update( this.delta );

    if( this.userMediaTexture )
      this.userMediaTexture._update();


    this.update();

    this.render();


  }

  Womb.prototype.render = function(){

    if( this.effectComposer )
      this.effectComposer.render();
    else
      this.renderer.render( this.scene , this.camera );

  }

  Womb.prototype.onWindowResize = function(){

    this.width  = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

  }



  Womb.prototype.update = function(){

  }

  module.exports = Womb;

});