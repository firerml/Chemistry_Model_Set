var App = {};
App.geometries = {};

$(function() {
  // basic setup
  width = window.innerWidth*0.8;
  height = window.innerHeight;
  $('#container').css('height',window.innerHeight);
  App.clicked = false;
  App.objects = [];
  App.highlighted = null;
  App.states = [];
  App.bondCount = 0;
  App.bonds = [];
  App.atomCount = 0;
  App.atoms = [];
  App.holeFaces = [
    // tetrahedral: 0,1,2,3
    [3250,3297],
    [4560,4581],
    [1943,1966],
    [611,632],
    // pyramidal: 4,5,6
    [4680,4699],
    [1036,1053],
    [3567,3598],
    // bent: 7,8
    [4680,4697],
    [3427,3474],
    // one hole: 9
    [4650,4697],
    // trigonal planar: 10,11,12
    [4678,4697],
    [3585,3632],
    [718,737],
    // linear: 13 (linear's first hole always starts full)
    [3200,3247]
    // octahedral:
    // [4498,4515],
    // [2268,2287],
    // [794,811],
    // [2058,2077],
    // [362,409],
    // [3380,3427]
  ];

  App.projector = new THREE.Projector();
  App.scene = new THREE.Scene();
  App.renderer = new THREE.WebGLRenderer();
  App.renderer.setClearColor('pink', 1);
  App.renderer.setSize(width, height);
  $('#threejs').append(App.renderer.domElement);

  App.camera = new THREE.PerspectiveCamera(70,width/height,0.1,1000);
  App.camera.position.set(75,75,60);
  App.controls = new THREE.TrackballControls(App.camera);
  App.JSONLoader = new THREE.JSONLoader();

  // Event listeners
  $('html').on('mousemove', onHover);
  $('html').on('mousedown', onClick);
  $('html').on('mouseup', onMouseUp);

  addCursorEvents();

  setLights(App.scene);

  render();
});

function addCursorEvents() {
  var addClickEvent = function(id) {
    $('#' + id + '-big').on('click',function() {
      $('html').attr('id',id);
      if (id !== 'single-bond') $('html').addClass('atom-cursor');
    });
  }

  var addKeyboardEvents = function() {
    var keyIDs = {
      // q, w, e
      81: 'black', 87: 'white', 69: 'red',
      // a, s, d
      65: 'blue3', 83: 'blue4', 68: 'yellow4',
      // z, x, c
      90: 'green', 88: 'purple', 67: 'gray',
      // f
      70: 'single-bond'

    }
    $('html').keydown(function(event) {
      if (keyIDs[event.keyCode.toString()]) {
        $('html').attr('id',keyIDs[event.keyCode]);
        if (keyIDs[event.keyCode] !== 'single-bond') $('html').addClass('atom-cursor');
        $('html').trigger('mousemove');
      }
    });
  }

  var ids = ['single-bond','black','white','red','blue3','blue4','yellow4',
             'green','purple','gray'];
  for (var i = 0; i < ids.length; i++) {
    addClickEvent(ids[i]);
  }
  addKeyboardEvents(ids);

  $('#clear').click(function() {
    App.states.push(App.scene.clone());
    App.scene.remove(App.objects[0]);
    App.objects = [];
    App.bonds = [];
  });

  $('#undo').click(function() {
    App.scene.remove(App.objects[0]);
    App.scene = App.states[App.states.length - 1];
    App.states.pop();

    App.bonds = [];
    App.objects = [];
    var updateObjectsList = function(object) {
      // No bond groups, just the bond pieces.
      if (object.type !== 'Object3D') App.objects.push(object);
      if (object.userData.pieceName === 'atom') {
        colorFaces(object,object.userData.myColor,object.userData.shape);
      }
      else if (object.userData.pieceName === 'bond head') {
        App.bonds.push(object.parent);
      }
      if (object.children.length) {
        for (var i = 0; i < object.children.length; i++) {
          updateObjectsList(object.children[i]);
        }
      }
    }
    if (App.scene.children[8]) updateObjectsList(App.scene.children[8]);
  });
}

function setLights() {
  var makeLight = function(intensity,x,y,z) {
    var light = new THREE.PointLight(0xffffff, intensity);
    light.position.set(x,y,z);
    App.scene.add(light);
  }
  makeLight(1,500,500,500);
  makeLight(1,-500,-500,-500);
  makeLight(.1,-500,500,500);
  makeLight(.1,500,-500,500);
  makeLight(.1,500,500,-500);
  makeLight(.1,-500,-500,500);
  makeLight(.1,-500,500,-500);
  makeLight(.1,500,-500,-500);
}

function render() {
  requestAnimationFrame(render);
  App.scene.updateMatrixWorld();
  App.controls.update();
  App.renderer.render(App.scene, App.camera);
}

function getMouseObject() {
  var mouse3D = new THREE.Vector3( (event.clientX/width) * 2 - 1,
  -1*(event.clientY/height) * 2 + 1,
  0.5 );
  mouse3D.unproject(App.camera);
  mouse3D.sub(App.camera.position);
  mouse3D.normalize();
  var raycaster = new THREE.Raycaster(App.camera.position, mouse3D);
  var intersects = raycaster.intersectObjects(App.objects);
  // Return the object closest to the App.camera
  return intersects[0] ? intersects[0] : null;
}
