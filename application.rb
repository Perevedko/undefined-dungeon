require 'sinatra'
require 'bson'
require 'mongoid'
require 'json/ext'
require 'date'
require 'sinatra/contrib'

SERVER_DIR = File.expand_path File.dirname(__FILE__)
PROJECT_DIR = File.expand_path '..', SERVER_DIR


configure do
  Mongoid.load! "#{SERVER_DIR}/config/mongoid.yml", :development
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
      default_to_json except: :_id
    end
  end
end

class GameState
  include Mongoid::Document

  field :status, type: String
  field :field, type: Array
end

get '/' do
  send_file "#{SERVER_DIR}/client/index.html"
end

set :public_folder, "#{SERVER_DIR}/client"

namespace '/api' do
  before do
    mime_type :json
    content_type :json
  end

  get '/games/all' do
    GameState.all.to_json
  end

  get '/games/new' do
    gs = GameState.create(:status => "Created at #{Time.now}")
    gs.to_json
  end
end