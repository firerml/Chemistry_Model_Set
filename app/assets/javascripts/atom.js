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
  this.mesh.userData.bondChildrenIDs = [];

  this.mesh.userData.id = App.atomCount;
  App.atomCount++;
  App.atoms.push(this.mesh);
  App.objects.push(this.mesh);

  if (bondHead) {
    this.mesh.userData.bondIDs.push(bondHead.parent.userData.id);
    bondHead.parent.userData.holes[this.mesh.uuid] = 0;

    var bondRotation = bondHead.rotation.toArray();
    this.mesh.rotation.fromArray(bondRotation);
    this.mesh.rotateX(180*Math.PI/180);

    changeHoleColor(this.mesh.userData.myColor, this.mesh);
    this.mesh.userData.fullHoles.push(0);
    bondHead.material.color.setHex(0xD3D3D3);
  }
}

function colorFaces(atom,color,shape) {
  atom.userData.holeFaceNums = [];
  atomGeom = atom.geometry;

  for (var i = 0; i < atomGeom.faces.length; i++) {
    var face = atomGeom.faces[i];
    face.color.setHex(color);
  }

  // Uncomment this to randomize colors
  // for (var i = 0; i < atomGeom.faces.length; i++) {
  //   atomGeom.faces[i].color.setHex(Math.random()*0xffffff);
  // }

  var makeHole = function(holeNum) {
    atom.userData.holeFaceNums.push(holeNum);
    for (var i = App.holeFaces[holeNum][0]; i <= App.holeFaces[holeNum][1]; i++) {
      atomGeom.faces[i].color.setHex(0x000000);
    }
  };

  var makeAllHoles = function(holeNumRange) {
    for (var i = holeNumRange[0]; i <= holeNumRange[1]; i++) {
      if (atom.userData.fullHoles.indexOf(i) === -1) makeHole(i);
    }
  };

  switch (shape) {
    case 'tetrahedral':
      makeAllHoles([0,3]);
      break;
    case 'pyramidal':
      makeAllHoles([4,6]);
      break;
    case 'bent':
      makeAllHoles([7,8]);
      break;
    case 'one hole':
      makeAllHoles([9,9]);
      break;
    case 'trigonal planar':
      makeAllHoles([10,12]);
      break;
    case 'linear':
      makeAllHoles([13,14]);
    }
    atomGeom.colorsNeedUpdate = true;
  }
