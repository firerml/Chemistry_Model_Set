var SingleBond = function(atom, holeNum) {
  var xRot = 0;
  var yRot = 0;
  var zRot = 0;

  this.bondBody = new THREE.Mesh( new THREE.CylinderGeometry(2, 2, 40, 32), new THREE.MeshPhongMaterial({color: 0xD3D3D3}));
  this.bondHead = new THREE.Mesh( new THREE.CylinderGeometry(2, 2, 4, 32), new THREE.MeshPhongMaterial({color: 0xD3D3D3}));
  this.bond = new THREE.Object3D();
  this.bond.userData.id = App.bondCount;
  App.bondCount++;
  App.bonds.push(this.bond);
  // Need to clone scene for undo button, but the infinitely nested nature of
  // three.js objects, it seems, makes this impossible if I store bond objects
  // within atom objects, so I'm storing a unique ID. Can't use the uuid because
  // that changes when a three.js object is cloned.
  atom.userData.bondIDs.push(this.bond.userData.id);
  atom.userData.bondChildrenIDs.push(this.bond.userData.id);
  this.bond.userData.holes = {};
  this.bond.userData.holes[atom.uuid] = holeNum;
  this.bondBody.userData.pieceName = 'single bond body'
  this.bondHead.userData.pieceName = 'bond head'
  this.bond.add(this.bondHead, this.bondBody);
  this.bond.position = atom.position;
  this.bondHead.translateY(22);

  // Several numbers are missing because they get no rotation.
  switch(holeNum) {
    case 5:
    case 1:
      xRot = 109.47;
      yRot = 240;
      break;
    case 2:
      xRot = 109.47;
      yRot = 120;
      break;
    case 8:
    case 6:
    case 3:
      xRot = 109.47;
      break;
    case 11:
      xRot = 240;
      break;
    case 12:
      xRot = 120;
      break;
    case 14:
      xRot = 180;
    }

  if (yRot) this.bond.rotateY(yRot*Math.PI/180);
  if (xRot) this.bond.rotateX(xRot*Math.PI/180);
  if (zRot) this.bond.rotateZ(zRot*Math.PI/180);
  this.bond.translateY(16);
  atom.add(this.bond);
  App.objects.push(this.bondBody, this.bondHead);
}
