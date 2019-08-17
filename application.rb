require 'sinatra'
require 'bson'
require 'mongoid'
require 'json/ext'
require 'date'
require 'sinatra/contrib'

ROOT = File.expand_path '.'

configure do
  Mongoid.load! "#{ROOT}/config/mongoid.yml", :development
end

module Mongoid
  module Document
    def as_json(options={})
      attrs = super(options)
      attrs['id'] = attrs['_id'].to_s
      attrs.except '_id'
    end
  end
end


module Tile
  WALL = 'X'
  EMPTY = ' '
  HERO = 'h'
end

class Point
  attr_accessor :x, :y

  def initialize(x, y)
    @x, @y = x, y
  end

  def mongoize
    [ x, y ]
  end

  def self.demongoize(object)
    new object[0], object[1]
  end

  def self.mongoize(object)
    case object
    when self
      object.mongoize
    when Hash
      new(object[:x], object[:y]).mongoize
    else
      object
    end
  end

  def self.evolve(object)
    case object
    when self
      object.mongoize
    else
      object
    end
  end
end

class GameState
  include Mongoid::Document

  field :status, type: String, default: :new
  field :board, type: Array
  field :hero_location, type: Point

  def as_json(options={})
    attrs = super(options)
    attrs['board'] = board_with_hero
    attrs
  end

  def self.default_game_field
    [
        'XXXXX',
        'X   X',
        'X   X',
        'X   X',
        'XXXXX'
    ].map(&:chars)
  end


  def self.default_hero_location
    Point.new 2, 2
  end

  def self.start_new
    create status: :new, board: default_game_field, hero_location: default_hero_location
  end

  def board_with_hero
    hero_board = board.deep_dup
    raise ArgumentError if hero_board[hero_location.x][hero_location.y] != Tile::EMPTY
    hero_board[hero_location.x][hero_location.y] = 'h'
    hero_board
  end

  def board_at(*params)
    point =
        if params.length == 2 && params.all? { |p| p.is_a? Integer }
          Point.new params.first, params.last
        elsif params.first.is_a? Point
          params.first
        else
          raise ArgumentError, params
        end

    self.board[point.x][point.y]
  end

  def move(direction)
    dx, dy =
        case direction.to_sym
        when :north
          [-1, +0]
        when :south
          [+1, +0]
        when :west
          [+0, -1]
        when :east
          [+0, +1]
        else
          [+0, +0]
        end
    target = Point.new hero_location.x + dx, hero_location.y + dy

    if board_at(target) == Tile::EMPTY
      update hero_location: target
    else
      false
    end
  end
end

set :public_folder, "#{ROOT}/client"


get '/' do
  send_file "#{ROOT}/client/index.html"
end


namespace '/api' do
  before do
    mime_type :json
    content_type :json
  end

  get '/games' do
    GameState.all.to_json
  end

  get '/game/new' do
    GameState.start_new.to_json
  end

  get '/game/:id' do |id|
    GameState.find(id).to_json rescue nil
  end

  get '/game/:id/move/:direction' do |id, direction|
    game = GameState.find(id) rescue nil
    return nil unless game

    if game.move direction
      { moved: true, game: game }.to_json
    else
      { moved: false }.to_json
    end
  end
end