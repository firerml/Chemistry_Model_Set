function upgradeBond(bond,childAtom,parentAtom) {
  changeAtomGeom(childAtom);
  changeAtomGeom(parentAtom, true);
  changeBondGeom(bond);
}

function changeAtomGeom(atom, isParentAtom) {
  atom.fullHoles = [];
  switch(atom.shape) {
    case 'tetrahedral':
      atom.geometry = App.loader.parse(App.geometries.trigonalGeom).geometry;
      atom.shape = 'trigonal planar';
      atom.holeCount = 3;
      if (isParentAtom) {
        if (App.objects[0] === atom) {
          atom.fullHoles.push(0);
          realignBond(atom.bonds[0],0,0,0);
        }
        else atom.fullHoles.push(10);
      }
      else {
        atom.fullHoles.push(0);
        realignBond(atom.bonds[0],0,0,0);
      }
      if (atom.bonds.length > 1) {
        realignBond(atom.bonds[1],120,0,0);
        atom.fullHoles.push(-1);
      }
      if (atom.bonds.length > 2) {
        realignBond(atom.bonds[2],240,0,0);
        atom.fullHoles.push(-2);
      }
      break;
    case 'pyramidal':
      atom.geometry = App.loader.parse(App.geometries.bentGeom).geometry;
      atom.shape = 'bent'
      atom.holeCount = 2;
      if (!isParentAtom) realignBond(atom.bonds[0],0,0,0);
      atom.fullHoles.push(0);
      if (atom.bonds.length > 1) {
        realignBond(atom.bonds[1],120,0,0);
        atom.fullHoles.push(3);
      }
      break;
    case 'trigonal planar':
      atom.geometry = App.loader.parse(App.geometries.linearGeom).geometry;
      atom.shape = 'linear';
      atom.holeCount = 2;
      if (!isParentAtom) realignBond(atom.bonds[0],0,0,0);
      atom.fullHoles.push(0);
      if (atom.bonds.length > 1) {
        realignBond(atom.bonds[1],180,0,0);
        atom.fullHoles.push(11);
      }
      break;
      case 'bent':
        atom.fullHoles.push(0);
        atom.geometry = App.loader.parse(App.geometries.oneHoleGeom).geometry;
        atom.shape = 'one hole';
        atom.holeCount = 1;
        if (!isParentAtom) realignBond(atom.bonds[0],0,0,0);
        break;
  }
  atom.holeFaces = colorFaces(atom,atom.myColor,atom.shape);
}

function realignBond(bond,rotXDeg,rotYDeg,rotZDeg) {
  bond.translateY(-16);
  bond.rotation.set(rotXDeg*Math.PI/180,rotYDeg*Math.PI/180,rotZDeg*Math.PI/180);
  bond.translateY(16);
}

function changeBondGeom(bond) {
  switch (bond.children[1].pieceName) {
    case 'single bond body':
      bond.children[1].pieceName = 'double bond body';
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
      bond.children[1].pieceName = 'triple bond body';
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
