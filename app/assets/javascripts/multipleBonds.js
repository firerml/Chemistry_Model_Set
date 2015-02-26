function upgradeBond(bond,childAtom,parentAtom) {
  // Save this step for save/load
  App.instructions.push(['upgrade bond',bond.userData.id,childAtom.userData.id,parentAtom.userData.id]);
  // Save this state for undoing
  App.states.push(App.scene.clone());
  changeAtomGeom(childAtom, true);
  changeAtomGeom(parentAtom);
  changeBondGeom(bond);
}

// Only the child atom realigns its first bond.
// The parent atom's first bond is a child of a previous atom! Can't be messed with.
function changeAtomGeom(atom, isChildAtom) {

  // The switch statement below figures out the atom's info,
  // but this function does the actual realigning
  function realign(atom,geomName,newShape,holeCount,bondRots,isChildAtom) {
    // take on a new shape
    atom.geometry = App.JSONLoader.parse(App.geometries[geomName]).geometry;
    // and be labeled with that new shape
    atom.userData.shape = newShape;
    // this is how many holes you now have
    atom.userData.holeCount = holeCount;

    for (var i = 0; i < bondRots.length; i++) {
      // only realign the bond being upgraded if you're the child of the bond
      if (i !== 0 || (i === 0 && isChildAtom)) {
        bond = bondRots[i].bond;
        // Realign a bond:
        // pull it back to the middle of the atom
        bond.translateY(-16);
        // re-rotate it
        bond.rotation.set(bondsRot[i].rot*Math.PI/180,0,0);
        // push it back out into its new location
        bond.translateY(16);
      }
      atom.userData.fullHoles.push(bondRots[i].holeID);
    }
  }

  // Find this atom's bonds (the atom stores only the IDs of its bonds)
  var bonds = [];
  var bondIDs = atom.userData.bondIDs;
  for (var i = 0; i < bondIDs.length; i++) {
    // A bond's is always the same as its index in App.bonds
    bonds.push(App.bonds[bondIDs[i]]);
  }

  atom.userData.fullHoles = [];
  // current shape
  switch(atom.userData.shape) {
    case 'tetrahedral':
      var bondRots = [{bond: bonds[0], rot: 0, holeID: 10}];
      if (bonds.length > 1) bondRots.push({bond: bonds[1], rot: 120, holeID: 12});
      if (bonds.length > 2) bondRots.push({bond: bonds[2], rot: 240, holeID: 11});
      realign(atom,'trigonalGeom','trigonal planar',3,bondRots,isChildAtom);
      break;
    case 'pyramidal':
      var bondRots = [{bond: bonds[0], rot: 0, holeID: 7}];
      if (bonds.length > 1) bondRots.push({bond: bonds[1], rot: 120, holeID: 8});
      realign(atom,'bentGeom','bent',2,bondRots,isChildAtom);
      break;
    case 'trigonal planar':
      var bondRots = [{bond: bonds[0], rot: 0, holeID: 13}];
      if (bonds.length > 1) bondRots.push({bond: bonds[1], rot: 180, holeID: 14});
      realign(atom,'linearGeom','linear',2,bondRots,isChildAtom);
      break;
    case 'bent':
      var bondRots = [{bond: bonds[0], rot: 0, holeID: 9}];
      realign(atom,'oneHoleGeom','one hole',1,bondRots,isChildAtom);
      break;
  }
  // color the atom, painting any empty holes black
  colorFaces(atom,atom.userData.myColor,atom.userData.shape);
}

function changeBondGeom(bond) {
  upgrade(newBondType,cylRad) {
    bond.children[1].userData.pieceName = newBondType;
    var cyl1 = new THREE.CylinderGeometry(cylRad, cylRad, 40, 32);
    var cyl2 = cyl1.clone();
    if (newBondType === 'triple bond body') cyl3 = cyl1.clone();
    var matrix1 = new THREE.Matrix4();
    matrix1.makeTranslation(0,0,-2);
    cyl1.applyMatrix(matrix1);
    var matrix2 = new THREE.Matrix4();
    matrix2.makeTranslation(0,0,2);
    cyl1.merge(cyl2,matrix2);
    if (newBondType === 'triple bond body') cyl1.merge(cyl3);
    bond.children[1].geometry = cyl1;
  }

  switch (bond.children[1].userData.pieceName) {
    case 'single bond body':
      upgrade('double bond body',1);
      break;
    case 'double bond body':
      upgrade('triple bond body',0.5)
      break;
  }
}
