class_name Player
extends CharacterBody2D

@export var walk_speed: float = 92.0
@export var sprint_multiplier: float = 1.55

var _facing := Vector2.DOWN
var _is_moving := false
var _is_sprinting := false

func _ready() -> void:
	collision_layer = 2
	collision_mask = 1
	queue_redraw()

func _physics_process(_delta: float) -> void:
	var input_direction := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	# Physical-key checks keep WASD consistent across keyboard layouts.
	input_direction.x += float(Input.is_physical_key_pressed(KEY_D))
	input_direction.x -= float(Input.is_physical_key_pressed(KEY_A))
	input_direction.y += float(Input.is_physical_key_pressed(KEY_S))
	input_direction.y -= float(Input.is_physical_key_pressed(KEY_W))
	input_direction = input_direction.limit_length(1.0)

	_is_sprinting = Input.is_physical_key_pressed(KEY_SHIFT)
	var speed := walk_speed * (sprint_multiplier if _is_sprinting else 1.0)
	velocity = input_direction * speed

	var was_moving := _is_moving
	_is_moving = not input_direction.is_zero_approx()
	if _is_moving:
		_facing = input_direction.normalized()

	move_and_slide()

	if was_moving != _is_moving or _is_moving:
		queue_redraw()

func _draw() -> void:
	# Temporary Phase A player silhouette. It is replaced by Farmer_1 after
	# the licensed asset archive is installed locally.
	var bob := -1.0 if _is_moving and Time.get_ticks_msec() % 260 < 130 else 0.0
	var body_color := Color("4b6f44") if not _is_sprinting else Color("5d8754")

	draw_circle(Vector2(0, -7 + bob), 5.0, Color("d69a68"))
	draw_rect(Rect2(-6, -3 + bob, 12, 13), body_color, true)
	draw_rect(Rect2(-7, -13 + bob, 14, 4), Color("c89b3c"), true)
	draw_rect(Rect2(-4, 10 + bob, 3, 5), Color("49372d"), true)
	draw_rect(Rect2(1, 10 + bob, 3, 5), Color("49372d"), true)

	# Facing marker helps validate directional movement before sprite setup.
	draw_circle(_facing * 10.0 + Vector2(0, 1), 1.5, Color("fff3c4"))
