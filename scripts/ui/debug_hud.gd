class_name DebugHud
extends CanvasLayer

@onready var player: Player = get_node("../Player")
@onready var farm_system: FarmSystem = get_node("../FarmSystem")
@onready var panel: ColorRect = $Panel
@onready var status_label: Label = %StatusLabel

var _mobile_mode := false


func _ready() -> void:
	_mobile_mode = DisplayServer.is_touchscreen_available() or OS.has_feature("mobile")
	if _mobile_mode:
		panel.offset_left = 8.0
		panel.offset_top = 8.0
		panel.offset_right = 174.0
		panel.offset_bottom = 50.0
		status_label.offset_left = 7.0
		status_label.offset_top = 5.0
		status_label.offset_right = 160.0
		status_label.offset_bottom = 38.0
		status_label.add_theme_font_size_override("font_size", 7)


func _process(_delta: float) -> void:
	if _mobile_mode:
		status_label.text = "IRAYA · %s · %s\n%s" % [
			farm_system.get_tool_name(),
			farm_system.get_cursor_label(),
			farm_system.get_progress_summary(),
		]
		return

	status_label.text = "PHASE B · FARM TOOLS\nPosition  %d, %d\nTool  %s  ·  %s\n%s\n%s\nQ/E or 1–4  Select · F/Space  Use" % [
		int(player.global_position.x),
		int(player.global_position.y),
		farm_system.get_tool_name(),
		farm_system.get_cursor_label(),
		farm_system.get_progress_summary(),
		farm_system.feedback,
	]
