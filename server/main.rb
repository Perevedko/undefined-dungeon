require 'sinatra'
require 'bson'
require 'mongoid'
require 'json/ext'
require 'date'

configure do
  Mongoid.load! 'config/mongoid.yml', :development
end

module Mongoid
  module Document
    alias :default_to_json :to_json

    def to_json
      default_to_json except: :_id
    end
  end

  class Criteria
    alias :default_to_json :to_json

    def to_json(*args)
      default_to_json *args, except: :_id
    end
  end
end

class GameState
  include Mongoid::Document
  field :status, type: String
end

get '/' do
  send_file '../client/index.html'
end

get '/games/all' do
  GameState.all.to_json
end

get '/games/new' do
  gs = GameState.create(:status => "Created at #{Time.now}")
  gs.to_json
end
