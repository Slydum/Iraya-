class_name FarmWorld
extends Node2D

const WORLD_RECT := Rect2(0, 0, 960, 640)
const FARM_PLOT := Rect2(272, 224, 256, 176)
const POND_RECT := Rect2(680, 330, 176, 120)
const HOUSE_RECT := Rect2(104, 88, 176, 112)

var _tree_positions: Array[Vector2] = [
	Vector2(72, 74), Vector2(344, 82), Vector2(404, 96),
	Vector2(866, 82), Vector2(895, 145), Vector2(78, 520),
	Vector2(134, 554), Vector2(782, 548), Vector2(850, 526),
]


func _ready() -> void:
	_build_collision_geometry()
	queue_redraw()


func _draw() -> void:
	# Procedural fallback art keeps the public browser build license-safe.
	draw_rect(WORLD_RECT, Color("76a65d"), true)

	for y in range(0, int(WORLD_RECT.size.y), 16):
		for x in range(0, int(WORLD_RECT.size.x), 16):
			var grid_x := int(x / 16)
			var grid_y := int(y / 16)
			if (grid_x + grid_y) % 2 == 0:
				draw_rect(Rect2(x, y, 16, 16), Color("72a158"), true)

	# Main footpaths.
	draw_rect(Rect2(0, 292, 960, 56), Color("c8a66b"), true)
	draw_rect(Rect2(456, 0, 48, 640), Color("c8a66b"), true)

	# Farmhouse fallback.
	draw_rect(HOUSE_RECT, Color("e8d6ac"), true)
	draw_rect(Rect2(HOUSE_RECT.position - Vector2(10, 12), HOUSE_RECT.size + Vector2(20, 28)), Color("9f553f"), false, 10.0)
	draw_rect(Rect2(176, 152, 32, 48), Color("664536"), true)
	draw_rect(Rect2(126, 120, 30, 26), Color("8fc1c8"), true)
	draw_rect(Rect2(228, 120, 30, 26), Color("8fc1c8"), true)

	# The farm system overlays tilled, planted, and watered cell states here.
	draw_rect(FARM_PLOT.grow(8), Color("b58b56"), true)
	draw_rect(FARM_PLOT, Color("8a6549"), true)
	for x in range(int(FARM_PLOT.position.x), int(FARM_PLOT.end.x) + 1, 16):
		draw_line(Vector2(x, FARM_PLOT.position.y), Vector2(x, FARM_PLOT.end.y), Color(0.23, 0.15, 0.12, 0.25), 1.0)
	for y in range(int(FARM_PLOT.position.y), int(FARM_PLOT.end.y) + 1, 16):
		draw_line(Vector2(FARM_PLOT.position.x, y), Vector2(FARM_PLOT.end.x, y), Color(0.23, 0.15, 0.12, 0.25), 1.0)

	# Pond.
	draw_rect(POND_RECT.grow(8), Color("d8c27d"), true)
	draw_rect(POND_RECT, Color("4e9ca6"), true)
	for y in range(int(POND_RECT.position.y) + 12, int(POND_RECT.end.y), 24):
		draw_line(Vector2(POND_RECT.position.x + 10, y), Vector2(POND_RECT.end.x - 10, y), Color("73bbc0"), 2.0)

	# Trees double as visible obstacles.
	for tree_position in _tree_positions:
		draw_rect(Rect2(tree_position + Vector2(-4, 5), Vector2(8, 20)), Color("62452f"), true)
		draw_circle(tree_position, 19.0, Color("386f43"))
		draw_circle(tree_position + Vector2(-9, -4), 11.0, Color("4d8951"))
		draw_circle(tree_position + Vector2(10, -5), 10.0, Color("4d8951"))

	# World edge fence.
	draw_rect(WORLD_RECT.grow(-12), Color("6f533b"), false, 6.0)


func _build_collision_geometry() -> void:
	_add_wall(Rect2(-16, 0, 16, WORLD_RECT.size.y))
	_add_wall(Rect2(WORLD_RECT.size.x, 0, 16, WORLD_RECT.size.y))
	_add_wall(Rect2(0, -16, WORLD_RECT.size.x, 16))
	_add_wall(Rect2(0, WORLD_RECT.size.y, WORLD_RECT.size.x, 16))

	_add_wall(HOUSE_RECT.grow(8))
	_add_wall(POND_RECT.grow(4))
	for tree_position in _tree_positions:
		_add_wall(Rect2(tree_position - Vector2(12, 8), Vector2(24, 34)))


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
