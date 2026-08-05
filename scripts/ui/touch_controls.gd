class_name TouchControls
extends CanvasLayer

const ACTIONS: Array[StringName] = [
	&"move_left",
	&"move_right",
	&"move_up",
	&"move_down",
	&"sprint",
	&"interact",
	&"tool_prev",
	&"tool_next",
]

@onready var root: Control = %Root
@onready var fullscreen_button: Button = %FullscreenButton


func _ready() -> void:
	root.visible = DisplayServer.is_touchscreen_available() or OS.has_feature("mobile")
	_bind_button(%LeftButton, &"move_left")
	_bind_button(%RightButton, &"move_right")
	_bind_button(%UpButton, &"move_up")
	_bind_button(%DownButton, &"move_down")
	_bind_button(%SprintButton, &"sprint")
	_bind_button(%ActionButton, &"interact")
	_bind_button(%PreviousToolButton, &"tool_prev")
	_bind_button(%NextToolButton, &"tool_next")
	fullscreen_button.pressed.connect(_toggle_fullscreen)


func _bind_button(button: BaseButton, action: StringName) -> void:
	button.button_down.connect(_press_action.bind(action))
	button.button_up.connect(_release_action.bind(action))


func _press_action(action: StringName) -> void:
	Input.action_press(action)


func _release_action(action: StringName) -> void:
	Input.action_release(action)


func _toggle_fullscreen() -> void:
	var current_mode := DisplayServer.window_get_mode()
	if current_mode == DisplayServer.WINDOW_MODE_FULLSCREEN:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
		fullscreen_button.text = "FULL"
	else:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
		fullscreen_button.text = "EXIT"


func _exit_tree() -> void:
	for action in ACTIONS:
		Input.action_release(action)
