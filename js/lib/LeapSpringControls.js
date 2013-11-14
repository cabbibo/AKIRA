/**
 * @author cabbibo / http://cabbibo.com
 *
 * Circle to create a new anchor! 
 * Will need to pass in a Scene, as well as a leap controller
 * In order to create the camera, so that you can place the 
 * UI elements
 *
 *
 */

THREE.LeapSpringControls = function ( object , controller , scene , params , domElement ) {

  this.object     = object;
  this.controller = controller;
  this.scene      = scene;
  this.domElement = ( domElement !== undefined ) ? domElement : document;

  // API
  
  this.enable = true;

  this.velocity = new THREE.Vector3();
  this.acceleration = new THREE.Vector3();

  this.dampening = ( object.dampening !== undefined ) ? object.dampening : .95;

  this.weakDampening    = .99;
  this.strongDampening  = .8;

  this.dampening        = this.strongDampening;

  this.size             = 120;
  this.springConstant   = 7;
  this.staticLength     = this.size ;
  this.mass             = 1000;

  this.anchorToTarget   = 24;


  this.placesTraveled   = [];
  
  //this.lDivisionFactor     = 50;


  this.target = new THREE.Object3D();
  this.targetIndicator = new THREE.Mesh( 
    new THREE.IcosahedronGeometry( this.size / 250 , 1 ), 
    new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: .5 , transparent:true }) 
  );
  this.target.add( this.targetIndicator );
  this.scene.add( this.target );

  this.anchor = new THREE.Object3D();
  this.anchorIndicator = new THREE.Mesh( 
    new THREE.IcosahedronGeometry( this.size/200 , 1 ),
    new THREE.MeshBasicMaterial({ color:0x00ff00  }) 
  );
  //this.anchor.add( this.anchorIndicator );
  this.scene.add( this.anchor );


  this.fingerIndicator = new THREE.Mesh(
    new THREE.IcosahedronGeometry( this.size/200 , 1 ),
    new THREE.MeshBasicMaterial({ color:0xffffff , opacity: .5 , transparent:true }) 
  );

  scene.add( this.fingerIndicator );

  this.getForce = function(){

    var difference = new THREE.Vector3();
    difference.subVectors( this.object.position , this.anchor.position );

    var l = difference.length();
    var x = l - this.staticLength;


    // Hooke's Law
    var f = difference.normalize().multiplyScalar(x).multiplyScalar( this.springConstant );

   /* if( x < 0 ){
      var addForce = difference.normalize().multiplyScalar( - x / l );
      f.add( addForce );
    }*/

    return f;

  }

  this.applyForce = function( f ){

    this.acceleration = f.multiplyScalar( 1 / this.mass );

    this.velocity.add( this.acceleration );

    this.velocity.multiplyScalar( this.dampening );

    this.object.position.sub( this.velocity );

  }


  // Non - rigid, don't update if past x = 0 , only look at if x > 0
  this.update = function(){


    /*
     
       Since we always want to look at the anchor,
       This means that we want to make sure that it doesn't jump
       from position to position whenever we select a new target

       Because of this, always move the anchor towards the target

    */

    var a = this.anchor.position;
    var t = this.target.position;
   
    // Moves the anchor towards the target
    a.x   = a.x - ( a.x - t.x ) / this.anchorToTarget;
    a.y   = a.y - ( a.y - t.y ) / this.anchorToTarget;
    a.z   = a.z - ( a.z - t.z ) / this.anchorToTarget;
   

    // Get and apply the spring photos
    f = this.getForce();
    this.applyForce( f );


    // Makes sure that we are always looking at the 
    // anchor position
    this.object.lookAt( this.anchor.position );

    this.frame = this.controller.frame();
    if( !this.oFrame ) this.oFrame = this.frame;
  
    if( this.frame ){

      if( this.frame.hands[0] && this.frame.pointables.length ){


        /*

           First off move the finger indicator to the correct position

        */
        var position    = this.controller.leapToScene( this.frame , this.frame.pointables[0].tipPosition );
        position.z     -= this.size;
        position.applyMatrix4( this.object.matrix ); 

        this.fingerIndicator.position = position;

        if( this.frame.pointables.length == 1 ){

          if( this.frame.gestures[0] && !this.oFrame.gestures[0] ){
            if( this.frame.gestures[0].type == 'circle' ){

              //if( this.frame.gestures[0].

              var g         = this.frame.gestures[0];

              var center    = g.center;
              var position  = this.controller.leapToScene( this.frame , center );
              position.z   -= this.size;
              position.applyMatrix4( this.object.matrix ); 

              this.target.position = position;

              this.placesTraveled.push( position );


              // Uses the gesture radius to define the size of attraction
              this.staticLength = (g.radius/50) * this.size;
              console.log( g.radius );

            }

          }
        }

      }else{

        this.fingerIndicator.position.x = this.size * 10000;

      }

    }

    this.oFrame = this.frame;


  }

}
