require 'sinatra'
require 'bson'
require 'mongoid'
require 'json/ext'
require 'date'
require 'sinatra/contrib'
require 'yaml'

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
  WALL = 'x'
  EMPTY = '.'
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
  field :level_id, type: Integer

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

  def self.start_new(level = LEVELS.first)
    create(status: :new,
           board: level[:board],
           hero_location: LEVELS.last[:hero_location],
           level_id: level)
  end

  def board_with_hero
    hero_board = board.deep_dup
    raise ArgumentError if hero_board[hero_location.y][hero_location.x] != Tile::EMPTY
    hero_board[hero_location.y][hero_location.x] = 'h'
    hero_board
  end

  def board_at(*params)
    point =
      if params.length == 2 && params.all? { |p| p.is_a? Integer }
        Point.new params.first, params.last
      elsif params.first.is_a? Point
        params.first
      else
        raise ArgumentError, 'bad params', params
      end

    self.board[point.y][point.x]
  end

  def move(direction)
    dx, dy =
      case direction.to_sym
      when :north then [+0, -1]
      when :south then [+0, +1]
      when :west  then [-1, +0]
      when :east  then [+1, +0]
      else [+0, +0]
      end

    target = Point.new self.hero_location.x + dx, self.hero_location.y + dy

    if board_at(target) == Tile::EMPTY
      update hero_location: target
    else
      false
    end
  end
end

LEVELS_CONFIG = YAML.load_file "#{ROOT}/levels/info.yml"
LEVELS = LEVELS_CONFIG.map do |level|
  board = File.read("#{ROOT}/levels/#{level['file']}").split("\n").map(&:chars)
  hero_location = Point.new level['hero_location']['y'], level['hero_location']['x']
  {
    board: board,
    hero_location: hero_location,
    level_id: level['file'].to_i
  }
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

  get '/game/new/level/:id' do |id|
    level = LEVELS.find { |lvl| lvl[:level_id] == id.to_i }
    if level
      GameState.start_new(level).to_json
    else
      { error: true, message: "Cannot find level with id = #{id}" }
    end
  end

  get '/game/:id' do |id|
    GameState.find(id).to_json rescue nil
  end

  get '/game/:id/move/:direction' do |id, direction|
    game = GameState.find(id) rescue nil
    return nil unless game

    if game.move direction
      response = { moved: true, game: game }.to_json
      pp response
      response
    else
      { moved: false }.to_json
    end
  end
end