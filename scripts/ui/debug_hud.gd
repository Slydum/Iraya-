class_name DebugHud
extends CanvasLayer

@onready var player: Player = get_node("../Player")
@onready var status_label: Label = %StatusLabel

func _process(_delta: float) -> void:
	status_label.text = "PHASE A · BROWSER SANDBOX\nPosition  %d, %d\nKeyboard / Touch  Move\nShift / RUN  Sprint" % [
		int(player.global_position.x),
		int(player.global_position.y),
	]
