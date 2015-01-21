var Atom = function(diameter, x, y, z, color) {
  var atom = App.loader.parse(App.atomGeom);
  for (var i = 0; i < atom.geometry.faces.length; i++) {
    var face = atom.geometry.faces[i];
    // face.color.setHex(Math.random() * 0xffffff);
    face.color.setHex(0xff0000);
  }

  var holeFaces = [[],[],[],[]];
  var makeHoleFaces = function(start,stop,holeNum) {
    for (var i = start; i <= stop; i++) {
      holeFaces[holeNum].push(atom.geometry.faces[i]);
      atom.geometry.faces[i].color.setHex(0x000000);
    }
  }.bind(this);

  // Uncomment this to randomize colors
  // for (var i = 0; i < atom.geometry.faces.length; i++) {
  //   atom.geometry.faces[i].color.setHex(Math.random()*0xffffff);
  // }

  makeHoleFaces(611,632,0);
  makeHoleFaces(4560,4581,1)
  makeHoleFaces(1943,1966,2);
  makeHoleFaces(3250,3297,3)

  var material = new THREE.MeshPhongMaterial({vertexColors: THREE.FaceColors });
    atom.geometry.colorsNeedUpdate = true;
    this.mesh = new THREE.Mesh(atom.geometry, material);
    this.mesh.holeHighlighted = -1;
    this.mesh.holeFaces = holeFaces;
    this.mesh.fullHoles = [];
    this.mesh.position.set(x,y,z);


    App.objects.push(this.mesh);
}

var SingleBond = function(atom, holeNum) {
  var xRot = 0;
  var yRot = 0;
  var zRot = 0;

  this.bondBody = new THREE.Mesh( new THREE.CylinderGeometry(2, 2, 40, 32), new THREE.MeshPhongMaterial({color: 0xD3D3D3}));
  this.bondHead = new THREE.Mesh( new THREE.CylinderGeometry(2, 2, 4, 32), new THREE.MeshPhongMaterial({color: 0xD3D3D3}));
  App.bondHeads.push(this.bondHead);
  this.bond = new THREE.Object3D();
  this.bond.add(this.bondBody, this.bondHead);
  this.bond.position.fromArray(atom.position.toArray());
  this.bond.rotation.fromArray(atom.rotation.toArray());
  this.bondHead.translateY(22);

  switch(holeNum) {
    case 0:
      xRot = 109.47;
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
      break;
  }

  if (yRot) this.bond.rotateY(yRot*Math.PI/180);
  if (xRot) this.bond.rotateX(xRot*Math.PI/180);
  if (zRot) this.bond.rotateZ(zRot*Math.PI/180);
  this.bond.translateY(16);
  App.objects.push(this.bondBody, this.bondHead);
}
