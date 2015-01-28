Molecule.destroy_all

methane = Molecule.create(name: 'methane',instructions: '[["add atom","black",null],["add bond",0,0],["add atom","white",0],["add bond",0,2],["add atom","white",1],["add bond",0,1],["add atom","white",2],["add bond",0,3],["add atom","white",3]]')

cyanide = Molecule.create(name: 'cyanide',instructions: '[["add atom","white",null],["add bond",0,9],["add atom","black",0],["add bond",1,2],["add atom","blue3",1],["upgrade bond",1,2,1],["upgrade bond",1,2,1]]')
