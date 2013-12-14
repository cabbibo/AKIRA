define(function(require, exports, module) {

  var m                   = require( 'app/utils/Math'                 );
  var AudioGeometry       = require( 'app/three/AudioGeometry'        );
  var AnalyzingFunctions  = require( 'app/utils/AnalyzingFunctions'   );

  var ShaderMaterial      = require( 'app/utils/ShaderMaterial'       );

  var Womb                = require( 'app/Womb'                       );
  

  var fragmentShaders     = require( 'app/shaders/fragmentShaders'    );
  var vertexShaders       = require( 'app/shaders/vertexShaders'      );

  var fragmentShader = [

    "uniform sampler2D  texture;",
    "uniform vec3 color;",
    "varying vec2 vUv;",

    "void main( void ) {",

        "float audio = texture2D( texture , vec2( vUv.x , 0.0 ) ).g;",
        "gl_FragColor = vec4( audio * color.r , audio * color.g , audio * color.b , 1.0 );",

    "}"

  ].join( "\n" );


  var vertexShader = [

    "varying vec2 vUv;",
    "uniform sampler2D  texture;",
    "uniform float      textureSize;",


    "void main() {",
        "vUv = uv;",
        "vec3 nPos = normalize(position) * 1.0;",
        "nPos.x *=  texture2D( texture , vec2( abs(nPos.x) , 0.0 ) ).g;",
        "nPos.y *=  texture2D( texture , vec2( abs(nPos.y) , 0.0 ) ).g;",
        "nPos.z *=  texture2D( texture , vec2( abs(nPos.z) , 0.0 ) ).g;",
        "vec3 newPos = abs(nPos) * position;",
        "vec4 mvPosition = modelViewMatrix * vec4( newPos , 1.0 );",
        "gl_Position = projectionMatrix * mvPosition;",
    "}"

  ].join( "\n" );

  womb = new Womb({
    cameraController: 'OrbitControls',
    objLoader:        true,
    massController:   true,
    springController: true,
    test:             true, 
    //effectComposer:   true
  });
  
  womb.scene = womb.world.scene;
   
  womb.stream = womb.audioController.createUserAudio();
  /* womb.stream = womb.audioController.createStream( '../audio/quoi.mp3' );

  womb.stream.play();
  var s = womb.world.size / 10 ;
  var sphere = new THREE.Mesh( 
    new THREE.CubeGeometry( s , s , s ),
    material
  );
  womb.scene.add( sphere );
*/

  womb.stream.onStreamCreated = function(){ 
    
    var light = new THREE.AmbientLight( 0x404040 );


    var uniforms = {
      texture: { type: "t", value: womb.stream.texture.texture },
      color:{ type: "v3" , value: new THREE.Vector3( 0.1 , 0.8 , 0.9 ) }
    };

  womb.material = new THREE.ShaderMaterial( {

    uniforms: uniforms,
    //vertexShader: vertexShader,
    vertexShader: vertexShaders.audio.uv.absPos,
    //vertexShader: vertexShaders.passThrough,
    fragmentShader: fragmentShaders.audio.color.uv.absXY,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    transparent: true

  } );


  var numOf = 10;

  for( var i = 0; i < numOf; i++ ){
    
    var sphere = new THREE.Mesh( 
      new THREE.CubeGeometry( womb.world.size / 10 , womb.world.size / 10   , womb.world.size / 10 , 20 , 20 , 20  ),
      //new THREE.SphereGeometry( womb.world.size / 10 , 30 , 30 ),
      //new THREE.IcosahedronGeometry( womb.world.size / 2, 4 ),
      womb.material
    );

   var pos = m.toCart( womb.world.size / 4 ,  Math.PI * 2 * ( i / numOf ) , 0 );
   console.log( pos );
    sphere.position = pos;

    womb.scene.add( sphere );

  }

    womb.loader.loadBarAdd();
  };
 
  //womb.stream = womb.audioController.createStream( '../audio/quoi.mp3' );
 
  //womb.stream.play();

  womb.audioController.gain.gain.value = 0;

//  womb.world.objLoader.loadFile( 'js/lib/models/tree.obj' , function(geo){



  womb.loader.loadBarAdd();

  womb.update = function(){

    

  }

  womb.start = function(){


  }


});
