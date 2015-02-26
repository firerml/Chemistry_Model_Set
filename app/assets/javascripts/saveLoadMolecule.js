function loadMolecule(molecule) {
  // parse from string to array
  var instructions = JSON.parse(molecule.instructions);
  App.instructions = [];
  clearScreen();
  // follow the steps, rebuilding the molecule piece by piece
  for (var i = 0; i < instructions.length; i++) {
    loadPiece(instructions[i]);
  }
}

function loadPiece(step) {
  switch (step[0]) {
    case 'add atom':
      var bondHead;
      // which atom type to place
      var cursorID = step[1];
      // atom's parent bond
      var bondID = step[2];
      // there's no bondID, and therefore no bondHead, if it's the first atom
      if (bondID || bondID == 0) bondHead = App.bonds[bondID].children[0];
      addAtom(cursorID, bondHead);
      break;
    case 'add bond':
      // bond's parent atom
      var atomID = step[1];
      var atom = App.atoms[atomID];
      // hole on the atom this bond was placed in
      var holeNum = step[2];
      addSingleBond(atom,holeNum);
      break;
    case 'upgrade bond':
      // only bonds between atoms can be upgraded,
      // so they have a child atom and a parent atom
      var bond = App.bonds[step[1]];
      var childAtom = App.atoms[step[2]];
      var parentAtom = App.atoms[step[3]];
      upgradeBond(bond,childAtom,parentAtom);
      break;
    case 'rotate bond':
      App.bonds[step[1]].rotateY(step[2]);
      break;
  }
}

function saveMolecule(name) {
  // save the rotations of bonds
  for (var i = 0; i < App.bonds.length; i++) {
    // only single bonds can be rotated, so only save rotation of single bonds
    if (App.bonds[i].children[1].userData.pieceName === 'single bond body') {
      App.instructions.push(['rotate bond',i,App.bonds[i].userData.rotation]);
    }
  }

  // array -> string to be stored in database
  var instructionsJSON = JSON.stringify(App.instructions);

  // preparing data for ajax post request
  var newMolecule = {
    molecule: {
      name: name,
      instructions: instructionsJSON
    }
  };

  $.post('/molecules', newMolecule, function(res) {
    // Add the new molecule to the load list
    $('ul').append($('<li>').attr('id',res.id).text(res.name));
  });
}
