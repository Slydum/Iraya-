class_name DebugHud
extends CanvasLayer

@onready var player: Player = get_node("../Player")
@onready var status_label: Label = %StatusLabel

func _process(_delta: float) -> void:
	status_label.text = "PHASE A · FARM SANDBOX\nPosition  %d, %d\nWASD / Arrows  Move\nShift  Sprint" % [
		int(player.global_position.x),
		int(player.global_position.y),
	]
