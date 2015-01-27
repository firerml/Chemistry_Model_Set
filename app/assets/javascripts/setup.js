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
  App.renderer.domElement.addEventListener('mousemove', onHover);
  App.renderer.domElement.addEventListener('mousedown', onClick);
  App.renderer.domElement.addEventListener('mouseup', onMouseUp);

  addCursorEvents();

  setLights(App.scene);

  render();
});

function addCursorEvents() {
  var addClickEvent = function(id,color) {
    $('#' + id + '-big').on('click',function() {
      $('html').attr('id',id);
      if (id !== 'single-bond') $('html').addClass('atom-cursor');
    });
  }
  var ids = ['black','white','red','blue3','blue4','yellow4','yellow6',
             'green','purple','gray','single-bond'];
  for (var i = 0; i < ids.length; i++) {
    addClickEvent(ids[i]);
  }

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
