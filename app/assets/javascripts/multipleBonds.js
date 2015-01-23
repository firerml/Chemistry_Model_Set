function upgradeBond(bond,atom1,atom2) {
  changeShape(atom1);
}

function changeShape(atom) {
  switch(atom.shape) {
    case 'tetrahedral':
      atom.geometry = App.loader.parse(App.trigonalThreeHoleAtom).geometry;
      atom.shape = 'trigonal planar'
      break;
    // case 'tetrahedral':
    //   changeIntoTrigonalPlanar(atom);
    //   break;
    // case 'tetrahedral':
    //   changeIntoTrigonalPlanar(atom);
    //   break;
    // case 'tetrahedral':
    //   changeIntoTrigonalPlanar(atom);
    //   break;
    // case 'tetrahedral':
    //   changeIntoTrigonalPlanar(atom);
    //   break;
  }
  atom.holeFaces = colorFaces(atom.geometry,atom.myColor,atom.shape);
}
