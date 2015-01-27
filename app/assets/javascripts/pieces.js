var Atom = function(holes, color, bondHead) {
  var atom;
  var shape;
  // grabbing the atom geometry object
  switch (holes) {
    case 6:
      shape = 'octahedral';
      atom = App.loader.parse(App.geometries.octahedralGeom).geometry;
      break;
    case 4:
      shape = 'tetrahedral';
      atom = App.loader.parse(App.geometries.tetrahedralGeom).geometry;
      break;
    case 3:
      shape = 'pyramidal';
      atom = App.loader.parse(App.geometries.pyramidalGeom).geometry;
      break;
    case 2:
      shape = 'bent';
      atom = App.loader.parse(App.geometries.bentGeom).geometry;
      break;
    case 1:
      shape = 'one hole';
      atom = App.loader.parse(App.geometries.oneHoleGeom).geometry;
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
  this.mesh.userData.bonds = [];
  if (bondHead) {
    bondHead.add(this.mesh);
    this.mesh.userData.bonds.push(bondHead.parent);
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
      makeHoleFaces(4498,4515,0);
      makeHoleFaces(2268,2287,4);
      makeHoleFaces(794,811,5);
      makeHoleFaces(2058,2077,6);
      makeHoleFaces(362,409,7);
      makeHoleFaces(3380,3427,8);
      break;
    case 'tetrahedral':
      makeHoleFaces(3250,3297,0);
      makeHoleFaces(4560,4581,1);
      makeHoleFaces(1943,1966,2);
      makeHoleFaces(611,632,3);
      break;
    case 'pyramidal':
      makeHoleFaces(4680,4699,0);atom.geometry.colorsNeedUpdate = true;
      makeHoleFaces(1036,1053,1);
      makeHoleFaces(3567,3598,3);
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

var SingleBond = function(atom, holeNum) {
  var xRot = 0;
  var yRot = 0;
  var zRot = 0;

  this.bondBody = new THREE.Mesh( new THREE.CylinderGeometry(2, 2, 40, 32), new THREE.MeshPhongMaterial({color: 0xD3D3D3}));
  this.bondHead = new THREE.Mesh( new THREE.CylinderGeometry(2, 2, 4, 32), new THREE.MeshPhongMaterial({color: 0xD3D3D3}));
  this.bond = new THREE.Object3D();
  atom.userData.bonds.push(this.bond);
  this.bond.userData.holes = {};
  this.bond.userData.holes[atom.uuid] = holeNum;
  this.bondBody.userData.pieceName = 'single bond body'
  this.bondHead.userData.pieceName = 'bond head'
  this.bond.add(this.bondHead, this.bondBody);
  this.bond.position = atom.position;
  this.bondHead.translateY(22);

  switch(holeNum) {
    case 0:
      break;
    case 1:
      xRot = 109.47;
      yRot = 240;
      break;
    case 2:
      xRot = 109.47;
      yRot = 120;
      break;
    case 3:
      xRot = 109.47;
      break;
    case 4:
      zRot = 90;
      break;
    case 5:
      zRot = 180;
      break;
    case 6:
      zRot = 270;
      break;
    case 7:
      yRot = 90;
      zRot = 90;
      break;
    case 8:
      yRot = 270;
      zRot = 90;
      break;
    case 9:
      xRot = 240;
      break;
    case 10:
      xRot = 120;
      break;
    case 11:
      xRot = 180;
      break;
  }

  if (yRot) this.bond.rotateY(yRot*Math.PI/180);
  if (xRot) this.bond.rotateX(xRot*Math.PI/180);
  if (zRot) this.bond.rotateZ(zRot*Math.PI/180);
  this.bond.translateY(16);
  atom.add(this.bond);
  App.objects.push(this.bondBody, this.bondHead);
}
