class_name FarmWorld
extends Node2D

const WORLD_RECT := Rect2(0, 0, 960, 640)
const FARM_PLOT := Rect2(272, 224, 256, 176)
const POND_RECT := Rect2(672, 320, 256, 128)
const HOUSE_RECT := Rect2(90, 54, 124, 148)

# Positions are anchored at the base of the tree trunks in the rendered map.
var _tree_positions: Array[Vector2] = [
	Vector2(70, 130), Vector2(310, 120), Vector2(385, 118),
	Vector2(875, 135), Vector2(900, 230), Vector2(78, 575),
	Vector2(145, 590), Vector2(790, 590), Vector2(875, 570),
]

var _small_tree_positions: Array[Vector2] = [
	Vector2(340, 560), Vector2(650, 570), Vector2(610, 120),
]

var _stump_positions: Array[Vector2] = [
	Vector2(585, 250), Vector2(225, 455),
]


func _ready() -> void:
	_build_collision_geometry()


func _build_collision_geometry() -> void:
	# Invisible boundaries keep the player inside the 960x640 authored map.
	_add_wall(Rect2(-16, 0, 16, WORLD_RECT.size.y))
	_add_wall(Rect2(WORLD_RECT.size.x, 0, 16, WORLD_RECT.size.y))
	_add_wall(Rect2(0, -16, WORLD_RECT.size.x, 16))
	_add_wall(Rect2(0, WORLD_RECT.size.y, WORLD_RECT.size.x, 16))

	_add_wall(HOUSE_RECT)
	_add_wall(POND_RECT.grow(-6.0))

	# Tree collision is concentrated around the trunk so the canopy can overlap
	# the walkable ground without making the world feel unnecessarily blocked.
	for tree_position in _tree_positions:
		_add_wall(Rect2(tree_position - Vector2(10, 18), Vector2(20, 20)))

	for tree_position in _small_tree_positions:
		_add_wall(Rect2(tree_position - Vector2(7, 13), Vector2(14, 15)))

	for stump_position in _stump_positions:
		_add_wall(Rect2(stump_position - Vector2(12, 14), Vector2(24, 16)))


func _add_wall(rect: Rect2) -> void:
	var body := StaticBody2D.new()
	body.collision_layer = 1
	body.collision_mask = 0
	body.position = rect.get_center()
	body.name = "WorldCollision"

	var collision_shape := CollisionShape2D.new()
	var rectangle := RectangleShape2D.new()
	rectangle.size = rect.size
	collision_shape.shape = rectangle

	body.add_child(collision_shape)
	add_child(body)
