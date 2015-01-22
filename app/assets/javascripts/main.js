var App = {};

$(function() {
  // basic setup
  App.dragging = null;
  App.width = window.innerWidth*0.8;
  App.height = window.innerHeight;
  $('#container').css('height',window.innerHeight);
  App.clicked = false;
  App.objects = [];
  App.bondHeads = [];
  App.atoms = [];
  App.highlighted = null;

  App.projector = new THREE.Projector();
  App.scene = new THREE.Scene();
  App.renderer = new THREE.WebGLRenderer();
  App.renderer.setClearColor('lavender', 1);
  App.renderer.setSize(App.width, App.height);
  $('#threejs').append(App.renderer.domElement);

  App.camera = new THREE.PerspectiveCamera(70,App.width/App.height,0.1,1000);
  App.camera.position.set(75,75,60);
  App.controls = new THREE.TrackballControls(App.camera);
  App.loader = new THREE.JSONLoader();
  // grabbing the atomGeom object from the other file
  App.atomGeom = atomGeom;

  // Event listeners
  App.renderer.domElement.addEventListener('mousemove', onHover);
  App.renderer.domElement.addEventListener('mousedown', onClick);
  App.renderer.domElement.addEventListener('mouseup', onMouseUp);

  addCursorEvents();

  setLights(App.scene);

  var atom = new Atom(8, 0, 0, 0, 'red');
  App.atoms.push(atom);

  App.molecule = new THREE.Object3D();
  App.molecule.add(atom.mesh);
  App.scene.add(App.molecule);
  render();
});

function addCursorEvents() {
  $('#carbon').on('click',function() {
    $('body').attr('id','red-cursor');
  });
  $('#single-bond').on('click',function() {
    $('body').attr('id','single-bond-cursor');
  });

}

function onMouseUp() {
  clearInterval(App.bondRotationTimer);
  App.clicked = false;
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

function onHover(event) {
  var hovered = getMouseObject(event);
  var onHole = false;
  // If you're hovering on an atom
  if (!App.clicked && hovered && hovered.object.holeFaces) {
    var atom = hovered.object;
    for (var i = 0; i < atom.holeFaces.length; i++) {
      // If you're hovering on a hole and that hole isn't full
      if (atom.holeFaces[i].indexOf(hovered.face) !== -1 && atom.fullHoles.indexOf(i) === -1) {
        for (var j = 0; j < atom.holeFaces[i].length; j++) {
          // Paint the whole hole yellow
          onHole = true;
          atom.holeFaces[i][j].color.setHex(0xFFFF00);
        }
        atom.geometry.colorsNeedUpdate = true;
        App.highlighted = {object: 'hole', atom: atom, hole: i, face: hovered};
      }
    }
  }
  // If you're hovering on a bondHead
  else if (!App.clicked && hovered && App.bondHeads.indexOf(hovered.object) !== -1) {
    hovered.object.material.color.setHex(0xFFFF00);
    App.highlighted = {object: 'bondHead', atom: atom,
                       bond: hovered.object.parent, bondHead: hovered.object};
  }

  // Unpaint objects when not hovered on
  // Unpaint hole
  if (!onHole && App.highlighted && App.highlighted.object === 'hole') {
    changeHoleColor(0x000000);
  }
  // Unpaint bondHead
  else if (App.highlighted && App.highlighted.object === 'bondHead' && (!hovered || hovered.object !== App.highlighted.bondHead)) {
    App.highlighted.bondHead.material.color.setHex(0xD3D3D3);
  }

}

function onClick(event) {
  App.clicked = true;
  var clickedObj = getMouseObject(event);

  // Uncomment this to see face indexes on click
  // console.log(clickedObj.faceIndex);
  // If clickedObj is a bondHead
  if (clickedObj && App.highlighted && App.highlighted.object === 'bondHead' && clickedObj.object === App.highlighted.bondHead) {
    var newAtom = addAtom(clickedObj.object);
    changeHoleColor(0xff0000, newAtom);
    newAtom.mesh.fullHoles.push(3);
  }
  // If clickedObj is a hole face
  else if (clickedObj && App.highlighted && clickedObj.object && clickedObj.object === App.highlighted.face.object && clickedObj.faceIndex === App.highlighted.face.faceIndex) {
    addSingleBond();
  }
  // If clickedObj is a bond with children
  else if (clickedObj && clickedObj.object.pieceName === 'single bond body') {
    App.bondRotationTimer = setInterval(function() {
      clickedObj.object.parent.rotateY(1*Math.PI/180);
    }, 25);
  }
}

function addSingleBond() {
  var atom = App.highlighted.atom;
  var holeNum = App.highlighted.hole;
  var bond = new SingleBond(atom, holeNum);
  // App.scene.add(bond.bond);
  changeHoleColor(0xff0000);
  atom.fullHoles.push(holeNum);
}

function addAtom(bond) {
  var newAtom = new Atom(8,'red',bond);
  var bondRotation = bond.rotation.toArray();
  newAtom.mesh.rotation.fromArray(bondRotation);
  newAtom.mesh.rotateX(180*Math.PI/180);
  // App.scene.add(newAtom.mesh);
  return newAtom;
}

function render() {
  requestAnimationFrame(render);
  App.scene.updateMatrixWorld();
  App.controls.update();
  App.renderer.render(App.scene, App.camera);
}

function changeHoleColor(hexColor, newAtom) {
  if (!newAtom) {
    atom = App.highlighted.atom;
    holeNum = App.highlighted.hole;
  }
  else {
    atom = newAtom.mesh;
    holeNum = 3;
  }
  var faces = atom.holeFaces;
  for (var i = 0; i < faces[holeNum].length; i++) {
    faces[holeNum][i].color.setHex(hexColor);
  }
  atom.geometry.colorsNeedUpdate = true;
  App.highlighted = null;
}

function getMouseObject() {
  var mouse3D = new THREE.Vector3( (event.clientX/App.width) * 2 - 1,
  -1*(event.clientY/App.height) * 2 + 1,
  0.5 );
  mouse3D.unproject(App.camera);
  mouse3D.sub(App.camera.position);
  mouse3D.normalize();
  var raycaster = new THREE.Raycaster(App.camera.position, mouse3D);
  var intersects = raycaster.intersectObjects(App.objects);
  // Return the object closest to the App.camera
  return intersects[0] ? intersects[0] : null;
}
