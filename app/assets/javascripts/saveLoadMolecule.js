function loadMolecule(molecule) {
  var instructions = JSON.parse(molecule.instructions);
  App.instructions = [];
  clearScreen();
  for (var i = 0; i < instructions.length; i++) {
    loadPiece(instructions[i]);
  }
}

function loadPiece(step) {
  switch (step[0]) {
    case 'add atom':
      var bondHead;
      var cursorID = step[1];
      var bondID = step[2];
      if (bondID !== null) bondHead = App.bonds[bondID].children[0];
      addAtom(cursorID, bondHead);
      break;
    case 'add bond':
      var atomID = step[1];
      var atom = App.atoms[atomID];
      var holeNum = step[2];
      addSingleBond(atom,holeNum);
      break;
    case 'upgrade bond':
      var bond = App.bonds[step[1]];
      var childAtom = App.atoms[step[2]];
      var parentAtom = App.atoms[step[3]];
      upgradeBond(bond,childAtom,parentAtom);
      break;
    case 'rotate bond':
      App.bonds[step[1]].rotation.fromArray(step[2]);
      break;
  }
}

function saveMolecule(name) {
  // save the rotations of bonds
  for (var i = 0; i < App.bonds.length; i++) {
    if (App.bonds[i].children[1].userData.pieceName === 'single bond body') {
      App.instructions.push(['rotate bond',i,App.bonds[i].rotation.toArray()]);
    }
  }

  var instructionsJSON = JSON.stringify(App.instructions);

  var newMolecule = {
    molecule: {
      name: name,
      instructions: instructionsJSON
    }
  };

  $.post('/molecules', newMolecule, function(res) {
    $('ul').append($('<li>').attr('id',res.id).text(res.name));
  });
}
