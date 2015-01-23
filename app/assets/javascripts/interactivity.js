function onHover(event) {
  var hovered = getMouseObject(event);
  var onHole = false;
  // If you're hovering on an atom and the cursor's a single bond
  if (!App.clicked && hovered && hovered.object.holeFaces
      && $('html').attr('id') === 'single-bond') {
    var atom = hovered.object;
    for (var i = 0; i < atom.holeFaces.length; i++) {
      // If you're hovering on a hole, the hole's empty
      if (atom.holeFaces[i].indexOf(hovered.face) !== -1
        && atom.fullHoles.indexOf(i) === -1) {
        for (var j = 0; j < atom.holeFaces[i].length; j++) {
          // Paint the whole hole yellow
          onHole = true;
          atom.holeFaces[i][j].color.setHex(0xD90065);
        }
        atom.geometry.colorsNeedUpdate = true;
        App.highlighted = {object: 'hole', atom: atom, hole: i, face: hovered};
      }
    }
  }
  // If you're hovering on a bondHead
  else if (!App.clicked && hovered
    && App.bondHeads.indexOf(hovered.object) !== -1
    && $('html').attr('class') === 'atom-cursor') {
    hovered.object.material.color.setHex(0xD90065);
    App.highlighted = {object: 'bondHead', atom: atom,
    bond: hovered.object.parent, bondHead: hovered.object};
  }
  // If you're hovering on a bond body with children and you aren't holding a piece
  else if (!$('html').attr('id') && hovered
           && hovered.object.pieceName === 'single bond body'
           // the bond body's parent is the 'bond' grouping, children[0] is the
           // bond head. Any attached pieces are children of the bond head.
           && hovered.object.parent.children[0].children.length) {
    $('html').attr('id','rotate');
  }
  // If you're hovering on a bond body with children and you're holding a bond
  else if ($('html').attr('id') === 'single-bond' && hovered
           && hovered.object.pieceName === 'single bond body') {
    $('html').attr('id','upgrade-bond');
  }
  // If the cursor is 'upgrade bond' and you're not on a bond body
  else if ($('html').attr('id') === 'upgrade-bond'
           && (!hovered || hovered.object.pieceName !== 'single bond body')) {
    $('html').attr('id','single-bond');
  }
  // If the cursor is 'rotate' and you're not on a bond body
  else if ($('html').attr('id') === 'rotate'
           && (!hovered || hovered.object.pieceName !== 'single bond body')) {
    $('html').attr('id','');
  }
  // Unpaint hole when not hovered on
  if (!onHole && App.highlighted && App.highlighted.object === 'hole') {
    changeHoleColor(0x000000);
  }
  // Unpaint bondHead when not hovered on
  else if (App.highlighted && App.highlighted.object === 'bondHead'
          && (!hovered || hovered.object !== App.highlighted.bondHead)) {
    App.highlighted.bondHead.material.color.setHex(0xD3D3D3);
    App.highlighted = null;
  }
}

function onClick(event) {
  var faceIndex;
  var clickedObj;
  var clickedInfo = getMouseObject(event);
  if (clickedInfo && clickedInfo.faceIndex) faceIndex = clickedInfo.faceIndex;
  if (clickedInfo && clickedInfo.object) clickedObj = clickedInfo.object;
  App.clicked = true;

  // // Uncomment this to see face indexes on click
  // if (clickedObj) console.log(clickedObj.faceIndex);

  // if this is the first object
  if (App.objects.length === 0 && $('html').attr('class') === 'atom-cursor') {
    var newAtom = addAtom();
    App.scene.add(newAtom.mesh);
  }
  // If clickedObj is a bondHead
  else if (App.highlighted && App.highlighted.object === 'bondHead'
           && clickedObj === App.highlighted.bondHead) {
    var newAtom = addAtom(clickedObj);
    changeHoleColor(newAtom.mesh.myColor, newAtom);
    newAtom.mesh.fullHoles.push(0);
  }
  // If clickedObj is a hole face
  else if (App.highlighted && clickedObj === App.highlighted.face.object
    && faceIndex === App.highlighted.face.faceIndex) {
    addSingleBond();
  }
  // If the cursor is 'rotate'
  else if ($('html').attr('id') === 'rotate') {
    // clickedObj.object.parent.rotateY(120*Math.PI/180);
    App.bondRotationTimer = setInterval(function() {
      clickedObj.parent.rotateY(2*Math.PI/180);
    }, 25);
  }
  // If the cursor is 'upgrade bond' and the two attached atoms each
  // have a free bonding site
  else if ($('html').attr('id') === 'upgrade-bond') {
    var nextAtom = clickedObj.parent.children[0].children[0];
    var prevAtom = clickedObj.parent.parent;
    if (nextAtom.holeCount > nextAtom.fullHoles.length
        && prevAtom.holeCount > prevAtom.fullHoles.length) {
      console.log('good');
    }
  }

  if ($('html').attr('id') !== 'rotate') {
    $('html').attr('id','').attr('class','');
  }
}

function onMouseUp() {
  clearInterval(App.bondRotationTimer);
  App.clicked = false;
}

function addSingleBond() {
  var atom = App.highlighted.atom;
  var holeNum = App.highlighted.hole;
  var bond = new SingleBond(atom, holeNum);
  changeHoleColor(atom.myColor);
  atom.fullHoles.push(holeNum);
}

function addAtom(bond) {
  var holes, color;
  switch ($('html').attr('id')) {
    case 'black':
      holes = 4;
      color = 0x363636;
      break;
    case 'white':
      holes = 1;
      color = 0xffffff;
      break;
    case 'red':
      holes = 2;
      color = 0xff0000;
      break;
    case 'blue3':
      holes = 3;
      color = 0x0000ff;
      break;
    case 'blue4':
      holes = 4;
      color = 0x0000ff;
      break;
    case 'yellow4':
      holes = 4;
      color = 0xffff00;
      break;
    case 'yellow6':
      holes = 6;
      color = 0xffff00;
      break;
    case 'green':
      holes = 1;
      color = 0x267f00;
      break;
    case 'purple':
      holes = 4;
      color = 0x57007f;
      break;
    case 'gray':
      holes = 1;
      color = 0xa9a9a9;
      break;
  }
  var newAtom = new Atom(holes,color,bond);
  if (bond) {
    var bondRotation = bond.rotation.toArray();
    newAtom.mesh.rotation.fromArray(bondRotation);
    newAtom.mesh.rotateX(180*Math.PI/180);
  }
  return newAtom;
}

function changeHoleColor(hexColor, newAtom) {
  if (!newAtom) {
    atom = App.highlighted.atom;
    holeNum = App.highlighted.hole;
  }
  else {
    atom = newAtom.mesh;
    holeNum = 0;
  }
  var faces = atom.holeFaces;
  for (var i = 0; i < faces[holeNum].length; i++) {
    faces[holeNum][i].color.setHex(hexColor);
  }
  atom.geometry.colorsNeedUpdate = true;
  App.highlighted = null;
}
