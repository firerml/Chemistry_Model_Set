var Atom = function(holes, color, bondHead) {
  var atom;
  var shape;
  // grabbing the atom geometry object
  switch (holes) {
    case 6:
      shape = 'octahedral';
      atom = App.JSONLoader.parse(App.geometries.octahedralGeom).geometry;
      break;
    case 4:
      shape = 'tetrahedral';
      atom = App.JSONLoader.parse(App.geometries.tetrahedralGeom).geometry;
      break;
    case 3:
      shape = 'pyramidal';
      atom = App.JSONLoader.parse(App.geometries.pyramidalGeom).geometry;
      break;
    case 2:
      shape = 'bent';
      atom = App.JSONLoader.parse(App.geometries.bentGeom).geometry;
      break;
    case 1:
      shape = 'one hole';
      atom = App.JSONLoader.parse(App.geometries.oneHoleGeom).geometry;
      break;
  }


  var material = new THREE.MeshPhongMaterial({vertexColors: THREE.FaceColors});
  atom.colorsNeedUpdate = true;
  this.mesh = new THREE.Mesh(atom, material);
  this.mesh.userData.pieceName = 'atom';
  this.mesh.userData.fullHoles = [];
  colorFaces(this.mesh,color,shape);
  this.mesh.userData.holeHighlighted = -1;
  this.mesh.userData.myColor = color;
  this.mesh.userData.holeCount = holes;
  this.mesh.userData.shape = shape;
  this.mesh.userData.bondIDs = [];
  if (bondHead) {
    bondHead.add(this.mesh);
    this.mesh.userData.bondIDs.push(bondHead.parent.userData.id);
    bondHead.parent.userData.holes[this.mesh.uuid] = 0;
  }
  App.objects.push(this.mesh);
}

function colorFaces(atom,color,shape) {
  atomGeom = atom.geometry;
  var holeFaces = [[],[],[],[],[],[],[],[],[],[],[],[]];

  for (var i = 0; i < atomGeom.faces.length; i++) {
    var face = atomGeom.faces[i];
    face.color.setHex(color);
  }

  var makeHoleFaces = function(start,stop,holeNum) {
    for (var i = start; i <= stop; i++) {
      holeFaces[holeNum].push(atomGeom.faces[i]);
      atomGeom.faces[i].color.setHex(0x000000);
    }
  };

  // Uncomment this to randomize colors
  // for (var i = 0; i < atomGeom.faces.length; i++) {
  //   atomGeom.faces[i].color.setHex(Math.random()*0xffffff);
  // }

  switch (shape) {
    case 'octahedral':
      if (atom.userData.fullHoles.indexOf(0) === -1) makeHoleFaces(4498,4515,0);
      if (atom.userData.fullHoles.indexOf(4) === -1) makeHoleFaces(2268,2287,4);
      if (atom.userData.fullHoles.indexOf(5) === -1) makeHoleFaces(794,811,5);
      if (atom.userData.fullHoles.indexOf(6) === -1) makeHoleFaces(2058,2077,6);
      if (atom.userData.fullHoles.indexOf(7) === -1) makeHoleFaces(362,409,7);
      if (atom.userData.fullHoles.indexOf(8) === -1) makeHoleFaces(3380,3427,8);
      break;
    case 'tetrahedral':
      if (atom.userData.fullHoles.indexOf(0) === -1) makeHoleFaces(3250,3297,0);
      if (atom.userData.fullHoles.indexOf(1) === -1) makeHoleFaces(4560,4581,1);
      if (atom.userData.fullHoles.indexOf(2) === -1) makeHoleFaces(1943,1966,2);
      if (atom.userData.fullHoles.indexOf(3) === -1) makeHoleFaces(611,632,3);
      break;
    case 'pyramidal':
      if (atom.userData.fullHoles.indexOf(0) === -1) makeHoleFaces(4680,4699,0);
      if (atom.userData.fullHoles.indexOf(1) === -1) makeHoleFaces(1036,1053,1);
      if (atom.userData.fullHoles.indexOf(3) === -1) makeHoleFaces(3567,3598,3);
      break;
    case 'bent':
      // These checks are only necessary for pieces that are created via the
      // creation of multiple bonds
      if (atom.userData.fullHoles.indexOf(0) === -1) makeHoleFaces(4680,4697,0);
      if (atom.userData.fullHoles.indexOf(3) === -1) makeHoleFaces(3427,3474,3);
      break;
    case 'one hole':
      if (atom.userData.fullHoles.indexOf(0) === -1) makeHoleFaces(4650,4697,0);
      break;
    case 'trigonal planar':
      if (atom.userData.fullHoles.indexOf(0) === -1) makeHoleFaces(4678,4697,0);
      if (atom.userData.fullHoles.indexOf(9) === -1) makeHoleFaces(3585,3632,9);
      if (atom.userData.fullHoles.indexOf(10) === -1) makeHoleFaces(718,737,10);
      break;
    case 'linear':
      // hole 0 will never be empty, since you cannot start
      if (atom.userData.fullHoles.indexOf(11) === -1) makeHoleFaces(3200,3247,11)
    }
    atom.userData.holeFaces = holeFaces;
    atomGeom.colorsNeedUpdate = true;
    return holeFaces;
  }
