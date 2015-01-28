class MoleculesController < ApplicationController

  def index
    molecules = Molecule.all
    render json: molecules
  end

  def show
    molecule = Molecule.find(params[:id])
    render json: molecule
  end

  def create
    molecule = Molecule.create(molecule_params)
    render json: molecule
  end

  def update
    molecule = Molecule.find(params[:id])
    molecule.update(molecule_params)
    render json: molecule
  end

  def destroy
    molecule = Molecule.find(params[:id])
    molecule.destroy
    render json: molecule
  end

  private

  def molecule_params
    params.require(:molecule).permit(:name,:instructions)
  end

end
