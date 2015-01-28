Rails.application.routes.draw do
  root to: 'application#index'

  resources :users, only: [:index, :create, :update, :destroy]
  resources :molecules, only: [:index, :show, :create, :update, :destroy]
end
