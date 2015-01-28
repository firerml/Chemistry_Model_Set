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
      console.log('adding an atom');
      var bondHead;
      var cursorID = step[1];
      var bondID = step[2];
      if (bondID !== null) bondHead = App.bonds[bondID].children[0];
      addAtom(cursorID, bondHead);
      break;
    case 'add bond':
      console.log('adding a bond');
      var atomID = step[1];
      var atom = App.atoms[atomID];
      var holeNum = step[2];
      addSingleBond(atom,holeNum);
      break;
    case 'upgrade bond':
      console.log('upgrading bond');
      var bond = App.bonds[step[1]];
      var childAtom = App.atoms[step[2]];
      var parentAtom = App.atoms[step[3]];
      upgradeBond(bond,childAtom,parentAtom);
      break;
  }
}

function saveMolecule(name) {
  var instructionsJSON = JSON.stringify(App.instructions);

  var newMolecule = {
    molecule: {
      name: name,
      instructions: instructionsJSON
    }
  };

  $.post('/molecules', newMolecule, function(res) {
    console.log('Save successful');
    $('ul').append($('<li>').attr('id',res.id).text(res.name));
  });
}
