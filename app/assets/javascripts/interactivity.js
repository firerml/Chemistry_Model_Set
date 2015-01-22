function onHover(event) {
  var hovered = getMouseObject(event);
  var onHole = false;
  // If you're hovering on an atom
  if (!App.clicked && hovered && hovered.object.holeFaces) {
    var atom = hovered.object;
    for (var i = 0; i < atom.holeFaces.length; i++) {
      // If you're hovering on a hole, the hole's empty, and the cursor's a single bond
      console.log($('html').attr('id'));
      if (atom.holeFaces[i].indexOf(hovered.face) !== -1
        && atom.fullHoles.indexOf(i) === -1
        && $('html').attr('id') === 'single-bond-cursor') {
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
  else if (!App.clicked && hovered
    && App.bondHeads.indexOf(hovered.object) !== -1
    && $('html').attr('id') === 'red-cursor') {
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
  $('html').attr('id','');
}

function onMouseUp() {
  clearInterval(App.bondRotationTimer);
  App.clicked = false;
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
