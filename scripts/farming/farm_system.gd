class_name FarmSystem
extends Node2D

signal tool_changed(tool_name: String)
signal plot_changed
signal feedback_changed(message: String)

enum Tool {
	HAND,
	HOE,
	SEEDS,
	WATERING_CAN,
}

const CELL_SIZE := 16
const PLOT_POSITION := Vector2(272, 224)
const PLOT_SIZE_CELLS := Vector2i(16, 11)
const PLOT_PIXEL_SIZE := Vector2(PLOT_SIZE_CELLS.x * CELL_SIZE, PLOT_SIZE_CELLS.y * CELL_SIZE)

const FLAG_TILLED := 1
const FLAG_SEEDED := 2
const FLAG_WATERED := 4

const TOOL_ORDER: Array[int] = [
	Tool.HAND,
	Tool.HOE,
	Tool.SEEDS,
	Tool.WATERING_CAN,
]

const TOOL_NAMES := {
	Tool.HAND: "Hand",
	Tool.HOE: "Hoe",
	Tool.SEEDS: "Seeds",
	Tool.WATERING_CAN: "Watering Can",
}

var selected_tool: int = Tool.HOE
var feedback := "Choose a tool and work the field."

var _cells: Dictionary = {}
var _cursor_cell := Vector2i(-1, -1)
var _cursor_rect := Rect2()
var _cursor_valid := false


func _ready() -> void:
	z_index = 2
	queue_redraw()


func update_cursor(player_position: Vector2, facing: Vector2) -> void:
	var cardinal := _cardinal_direction(facing)
	var target_position := player_position + cardinal * 20.0
	var snapped_position := Vector2(
		floor(target_position.x / CELL_SIZE) * CELL_SIZE,
		floor(target_position.y / CELL_SIZE) * CELL_SIZE
	)
	var relative_position := snapped_position - PLOT_POSITION
	var next_cell := Vector2i(
		int(floor(relative_position.x / CELL_SIZE)),
		int(floor(relative_position.y / CELL_SIZE))
	)
	var next_rect := Rect2(snapped_position, Vector2(CELL_SIZE, CELL_SIZE))
	var next_valid := _is_valid_cell(next_cell)

	if next_cell == _cursor_cell and next_rect == _cursor_rect and next_valid == _cursor_valid:
		return

	_cursor_cell = next_cell
	_cursor_rect = next_rect
	_cursor_valid = next_valid
	queue_redraw()


func cycle_tool(direction: int) -> void:
	var current_index := TOOL_ORDER.find(selected_tool)
	if current_index < 0:
		current_index = 0
	var next_index := posmod(current_index + direction, TOOL_ORDER.size())
	select_tool(TOOL_ORDER[next_index])


func select_tool(tool: int) -> void:
	if not TOOL_ORDER.has(tool) or selected_tool == tool:
		return
	selected_tool = tool
	_set_feedback("Selected %s." % get_tool_name())
	tool_changed.emit(get_tool_name())
	queue_redraw()


func interact() -> bool:
	if not _cursor_valid:
		_set_feedback("Face a tile inside the farm plot.")
		return false

	var state := int(_cells.get(_cursor_cell, 0))
	var changed := false

	match selected_tool:
		Tool.HAND:
			if (state & FLAG_SEEDED) != 0:
				var water_note := "watered" if (state & FLAG_WATERED) != 0 else "dry"
				_set_feedback("This planted tile is %s." % water_note)
			else:
				_set_feedback("Nothing to pick up here yet.")
		Tool.HOE:
			if (state & FLAG_TILLED) != 0:
				_set_feedback("That tile is already tilled.")
			else:
				state |= FLAG_TILLED
				changed = true
				_set_feedback("Soil tilled.")
		Tool.SEEDS:
			if (state & FLAG_TILLED) == 0:
				_set_feedback("Till the soil before planting.")
			elif (state & FLAG_SEEDED) != 0:
				_set_feedback("Seeds are already planted here.")
			else:
				state |= FLAG_SEEDED
				changed = true
				_set_feedback("Seeds planted.")
		Tool.WATERING_CAN:
			if (state & FLAG_TILLED) == 0:
				_set_feedback("Water only stays on tilled soil.")
			elif (state & FLAG_WATERED) != 0:
				_set_feedback("That tile is already watered.")
			else:
				state |= FLAG_WATERED
				changed = true
				_set_feedback("Soil watered.")

	if changed:
		_cells[_cursor_cell] = state
		plot_changed.emit()
		queue_redraw()
	return changed


func get_tool_name() -> String:
	return String(TOOL_NAMES.get(selected_tool, "Unknown"))


func get_cursor_label() -> String:
	if not _cursor_valid:
		return "Outside plot"
	return "Tile %02d, %02d" % [_cursor_cell.x + 1, _cursor_cell.y + 1]


func get_progress_summary() -> String:
	var tilled := 0
	var planted := 0
	var watered := 0
	for value in _cells.values():
		var state := int(value)
		if (state & FLAG_TILLED) != 0:
			tilled += 1
		if (state & FLAG_SEEDED) != 0:
			planted += 1
		if (state & FLAG_WATERED) != 0:
			watered += 1
	return "Tilled %d  Planted %d  Watered %d" % [tilled, planted, watered]


func _draw() -> void:
	for cell_variant in _cells.keys():
		var cell: Vector2i = cell_variant
		var state := int(_cells[cell])
		var cell_rect := _cell_rect(cell).grow(-1.0)

		if (state & FLAG_TILLED) != 0:
			draw_rect(cell_rect, Color("76513d"), true)
			draw_line(cell_rect.position + Vector2(2, 5), cell_rect.end - Vector2(2, 9), Color("5e3d30"), 1.0)
			draw_line(cell_rect.position + Vector2(2, 10), cell_rect.end - Vector2(2, 4), Color("8e654d"), 1.0)

		if (state & FLAG_WATERED) != 0:
			draw_rect(cell_rect, Color(0.12, 0.28, 0.34, 0.42), true)
			draw_line(cell_rect.position + Vector2(3, 3), cell_rect.position + Vector2(9, 3), Color("73bbc0"), 1.0)

		if (state & FLAG_SEEDED) != 0:
			var center := cell_rect.get_center()
			draw_circle(center + Vector2(-3, -1), 1.25, Color("e6c76b"))
			draw_circle(center + Vector2(3, 1), 1.25, Color("e6c76b"))
			draw_circle(center + Vector2(0, 4), 1.0, Color("d59f45"))

	var cursor_color := Color("fff3c4") if _cursor_valid else Color("d8665f")
	draw_rect(_cursor_rect.grow(-1.0), cursor_color, false, 2.0)
	if _cursor_valid:
		var center := _cursor_rect.get_center()
		draw_line(center - Vector2(3, 0), center + Vector2(3, 0), cursor_color, 1.0)
		draw_line(center - Vector2(0, 3), center + Vector2(0, 3), cursor_color, 1.0)


func _cell_rect(cell: Vector2i) -> Rect2:
	return Rect2(
		PLOT_POSITION + Vector2(cell.x * CELL_SIZE, cell.y * CELL_SIZE),
		Vector2(CELL_SIZE, CELL_SIZE)
	)


func _is_valid_cell(cell: Vector2i) -> bool:
	return (
		cell.x >= 0
		and cell.y >= 0
		and cell.x < PLOT_SIZE_CELLS.x
		and cell.y < PLOT_SIZE_CELLS.y
	)


func _cardinal_direction(direction: Vector2) -> Vector2:
	if direction.is_zero_approx():
		return Vector2.DOWN
	if abs(direction.x) > abs(direction.y):
		return Vector2(sign(direction.x), 0)
	return Vector2(0, sign(direction.y))


func _set_feedback(message: String) -> void:
	feedback = message
	feedback_changed.emit(message)
