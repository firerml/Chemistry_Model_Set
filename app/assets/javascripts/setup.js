var App = {};
App.geometries = {};

$(function() {
  // basic setup
  window.innerWidth = window.innerWidth;
  window.innerHeight = window.innerHeight;
  $('#container').css('height',window.innerHeight);
  App.clicked = false;
  App.objects = [];
  App.highlighted = null;
  App.states = [];
  App.bondCount = 0;
  App.bonds = [];
  App.atomCount = 0;
  App.atoms = [];
  App.instructions = [];
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
    // linear: 13,14
    [4448,4495],
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
  App.renderer = new THREE.WebGLRenderer({ alpha: true });
  App.renderer.setSize(window.innerWidth, window.innerHeight);
  $('#threejs').append(App.renderer.domElement);

  App.camera = new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.1,1000);
  App.camera.position.set(75,75,60);
  App.controls = new THREE.TrackballControls(App.camera);
  App.JSONLoader = new THREE.JSONLoader();

  // Event listeners
  $('html').on('mousemove', onHover);
  $('html').on('mousedown', onClick);
  $('html').on('mouseup', onMouseUp);
  $('html').on('keydown', function(event) {
    if (event.shiftKey) $('html').trigger('mousemove');
  });
  window.addEventListener('resize',onWindowResize,false);

  addDOMEvents();

  setLights(App.scene);

  render();
});

function addDOMEvents() {
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
      if (keyIDs[event.keyCode.toString()] && App.controls.enabled) {
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

  $('#clear').click(clearScreen);

  $('#load').click(function() {
    $('#load-save-modal').fadeIn(250);
    App.controls.enabled = false;
  });

  $('#instructions').click(function() {
    $('#instructions-modal').fadeIn(250);
    App.controls.enabled = false;
  });

  $('.close').click(function() {
    $(this).closest('.modal').fadeOut(250);
    App.controls.enabled = true;
    $('#molecule-name-input').val('');
  });

  $('body').on('click','li',function() {
    var molID = $(this).attr('id');
    $('#load-save-modal').fadeOut(250, function() {
      $.get('/molecules/' + molID, loadMolecule);
      App.controls.enabled = true;
      $('#molecule-name-input').val('');
    });
  });

  // $('input').click(function() {
  //   $('input').focus();
  // });

  // $('input').focusout(function() {
  //   App.controls.enabled = true;
  // });

  $('#save-button').click(function() {
    var name = $('#molecule-name-input').val();
    if (name) {
      $('#load-save-modal').fadeOut(250, function() {
        saveMolecule(name);
        App.controls.enabled = true;
        $('#molecule-name-input').val('');
      });
    }
  });


  $('#undo').click(function() {
    App.scene.remove(App.objects[0]);
    if (App.states.length) {
      App.scene = App.states[App.states.length - 1];
      App.states.pop();
    }
    if (App.instructions.length) App.instructions.pop();

    App.bonds = [];
    App.objects = [];
    App.bondCount = 0;
    App.atomCount = 0;
    var updateObjectsList = function(object) {
      // No bond groups, just the bond pieces.
      if (object.type !== 'Object3D') App.objects.push(object);
      if (object.userData.pieceName === 'atom') {
        App.atomCount++;
        colorFaces(object,object.userData.myColor,object.userData.shape);
      }
      else if (object.userData.pieceName === 'bond head') {
        App.bondCount++;
        App.bonds.push(object.parent);
      }
      // If this object has children, send them through this function to add them
      if (object.children.length) {
        for (var i = 0; i < object.children.length; i++) {
          updateObjectsList(object.children[i]);
        }
      }
    }
    // indices 0-7 are lights and should be ignored
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

function onWindowResize() {
  var width = $(window).width();
  var height = $(window).height();
  $('#threejs').width(width);
  $('#threejs').height(height);
  App.camera.aspect = width/height;
  App.camera.updateProjectionMatrix();
  App.renderer.setSize(width,height);
}

function getMouseObject() {
  var mouse3D = new THREE.Vector3( (event.clientX/$(window).width()) * 2 - 1,
  -1*(event.clientY/$(window).height()) * 2 + 1,
  0.5 );
  mouse3D.unproject(App.camera);
  mouse3D.sub(App.camera.position);
  mouse3D.normalize();
  var raycaster = new THREE.Raycaster(App.camera.position, mouse3D);
  var intersects = raycaster.intersectObjects(App.objects);
  // Return the object closest to the App.camera
  return intersects[0] ? intersects[0] : null;
}

function clearScreen() {
  App.instructions = [];
  App.states = [];
  // App.states.push(App.scene.clone());
  App.scene.remove(App.objects[0]);
  App.objects = [];
  App.bonds = [];
  App.atoms = [];
  App.atomCount = 0;
  App.bondCount = 0;
}
