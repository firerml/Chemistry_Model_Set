function upgradeBond(bond,childAtom,parentAtom) {
  App.instructions.push(['upgrade bond',bond.userData.id,childAtom.userData.id,parentAtom.userData.id]);
  App.states.push(App.scene.clone());
  changeAtomGeom(childAtom);
  changeAtomGeom(parentAtom, true);
  changeBondGeom(bond);
}

function changeAtomGeom(atom, isParentAtom) {
  var bonds = [];
  for (var i = 0; i < App.bonds.length; i++) {
    if (atom.userData.bondIDs.indexOf(App.bonds[i].userData.id) !== -1) {
      bonds.push(App.bonds[i]);
    }
  }

  atom.userData.fullHoles = [];
  switch(atom.userData.shape) {
    case 'tetrahedral':
      atom.geometry = App.JSONLoader.parse(App.geometries.trigonalGeom).geometry;
      atom.userData.shape = 'trigonal planar';
      atom.userData.holeCount = 3;

      if (!isParentAtom) realignBond(bonds[0],0,0,0);
      atom.userData.fullHoles.push(10);
      if (bonds.length > 1) {
        realignBond(bonds[1],120,0,0);
        atom.userData.fullHoles.push(12);
      }
      if (bonds.length > 2) {
        realignBond(bonds[2],240,0,0);
        atom.userData.fullHoles.push(11);
      }
      break;
    case 'pyramidal':
      atom.geometry = App.JSONLoader.parse(App.geometries.bentGeom).geometry;
      atom.userData.shape = 'bent'
      atom.userData.holeCount = 2;
      if (!isParentAtom) realignBond(bonds[0],0,0,0);
      atom.userData.fullHoles.push(7);
      if (bonds.length > 1) {
        realignBond(bonds[1],120,0,0);
        atom.userData.fullHoles.push(8);
      }
      break;
    case 'trigonal planar':
      atom.geometry = App.JSONLoader.parse(App.geometries.linearGeom).geometry;
      atom.userData.shape = 'linear';
      atom.userData.holeCount = 2;
      if (!isParentAtom) realignBond(bonds[0],0,0,0);
      atom.userData.fullHoles.push(13);
      if (bonds.length > 1) {
        realignBond(bonds[1],180,0,0);
        atom.userData.fullHoles.push(14);
      }
      break;
      case 'bent':
        atom.geometry = App.JSONLoader.parse(App.geometries.oneHoleGeom).geometry;
        atom.userData.shape = 'one hole';
        atom.userData.holeCount = 1;
        if (!isParentAtom) realignBond(bonds[0],0,0,0);
        atom.userData.fullHoles.push(9);
        break;
  }
  colorFaces(atom,atom.userData.myColor,atom.userData.shape);
}

function realignBond(bond,rotXDeg,rotYDeg,rotZDeg) {
  bond.translateY(-16);
  bond.rotation.set(rotXDeg*Math.PI/180,rotYDeg*Math.PI/180,rotZDeg*Math.PI/180);
  bond.translateY(16);
}

function changeBondGeom(bond) {
  switch (bond.children[1].userData.pieceName) {
    case 'single bond body':
      bond.children[1].userData.pieceName = 'double bond body';
      var cyl1 = new THREE.CylinderGeometry(1, 1, 40, 32);
      var cyl2 = cyl1.clone();
      var matrix1 = new THREE.Matrix4();
      matrix1.makeTranslation(0,0,-2);
      cyl1.applyMatrix(matrix1);
      var matrix2 = new THREE.Matrix4();
      matrix2.makeTranslation(0,0,2);
      cyl1.merge(cyl2,matrix2);
      bond.children[1].geometry = cyl1;
      break;
    case 'double bond body':
      bond.children[1].userData.pieceName = 'triple bond body';
      var cyl1 = new THREE.CylinderGeometry(0.5, 0.5, 40, 32);
      var cyl2 = cyl1.clone();
      var cyl3 = cyl1.clone();
      var matrix1 = new THREE.Matrix4();
      matrix1.makeTranslation(0,0,-2);
      cyl1.applyMatrix(matrix1);
      var matrix2 = new THREE.Matrix4();
      matrix2.makeTranslation(0,0,2);
      cyl1.merge(cyl2,matrix2);
      cyl1.merge(cyl3);
      bond.children[1].geometry = cyl1;
      break;
  }
}
