var App = {};
App.geometries = {};

$(function() {
  // basic setup
  width = window.innerWidth*0.8;
  height = window.innerHeight;
  $('#container').css('height',window.innerHeight);
  App.clicked = false;
  App.objects = [];
  App.bondHeads = [];
  App.highlighted = null;

  App.projector = new THREE.Projector();
  App.scene = new THREE.Scene();
  App.renderer = new THREE.WebGLRenderer();
  App.renderer.setClearColor('pink', 1);
  App.renderer.setSize(width, height);
  $('#threejs').append(App.renderer.domElement);

  App.camera = new THREE.PerspectiveCamera(70,width/height,0.1,1000);
  App.camera.position.set(75,75,60);
  App.controls = new THREE.TrackballControls(App.camera);
  App.loader = new THREE.JSONLoader();

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
    App.objects = [];
    App.scene.children = App.scene.children.slice(0,8);
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
