class_name DebugHud
extends CanvasLayer

@onready var player: Player = get_node("../Player")
@onready var farm_system: FarmSystem = get_node("../FarmSystem")
@onready var status_label: Label = %StatusLabel


func _process(_delta: float) -> void:
	status_label.text = "PHASE B · FARM TOOLS\nPosition  %d, %d\nTool  %s  ·  %s\n%s\n%s\nQ/E or 1–4  Select · F/Space  Use" % [
		int(player.global_position.x),
		int(player.global_position.y),
		farm_system.get_tool_name(),
		farm_system.get_cursor_label(),
		farm_system.get_progress_summary(),
		farm_system.feedback,
	]
