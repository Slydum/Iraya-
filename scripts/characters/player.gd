class_name Player
extends CharacterBody2D

@export var walk_speed: float = 92.0
@export var sprint_multiplier: float = 1.55
@export var tool_action_duration: float = 0.22

enum ActorState {
	FREE,
	USING_TOOL,
}

const FARMER_SPRITE_DATA := preload("res://scripts/art/farmer_sprite_data.gd")
const WALK_FRAME_COUNT := 6
const WALK_FRAME_TIME := 0.12

@onready var farm_system: FarmSystem = get_node("../FarmSystem")
@onready var farmer_sprite: Sprite2D = %FarmerSprite

var _facing := Vector2.DOWN
var _is_moving := false
var _is_sprinting := false
var _actor_state: int = ActorState.FREE
var _tool_time_left := 0.0
var _walk_animation_time := 0.0
var _farmer_texture_ready := false


func _ready() -> void:
	collision_layer = 2
	collision_mask = 1
	_load_farmer_texture()
	_update_sprite_frame()
	queue_redraw()


func _physics_process(delta: float) -> void:
	farm_system.update_cursor(global_position, _facing)
	_handle_touch_actions()

	if _actor_state == ActorState.USING_TOOL:
		_tool_time_left -= delta
		velocity = Vector2.ZERO
		move_and_slide()
		_update_sprite_frame()
		if _tool_time_left <= 0.0:
			_actor_state = ActorState.FREE
			queue_redraw()
		return

	var input_direction := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	input_direction += Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	input_direction.x += float(Input.is_physical_key_pressed(KEY_D))
	input_direction.x -= float(Input.is_physical_key_pressed(KEY_A))
	input_direction.y += float(Input.is_physical_key_pressed(KEY_S))
	input_direction.y -= float(Input.is_physical_key_pressed(KEY_W))
	input_direction = input_direction.limit_length(1.0)

	_is_sprinting = Input.is_action_pressed("sprint") or Input.is_physical_key_pressed(KEY_SHIFT)
	var speed := walk_speed * (sprint_multiplier if _is_sprinting else 1.0)
	velocity = input_direction * speed

	var was_moving := _is_moving
	_is_moving = not input_direction.is_zero_approx()
	if _is_moving:
		_facing = input_direction.normalized()
		_walk_animation_time += delta * (1.45 if _is_sprinting else 1.0)
	else:
		_walk_animation_time = 0.0

	move_and_slide()
	farm_system.update_cursor(global_position, _facing)
	_update_sprite_frame()

	if was_moving != _is_moving:
		queue_redraw()


func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventKey):
		return

	var key_event := event as InputEventKey
	if not key_event.pressed or key_event.echo:
		return

	var key := key_event.physical_keycode if key_event.physical_keycode != 0 else key_event.keycode
	match key:
		KEY_Q:
			farm_system.cycle_tool(-1)
		KEY_E:
			farm_system.cycle_tool(1)
		KEY_1:
			farm_system.select_tool(FarmSystem.Tool.HAND)
		KEY_2:
			farm_system.select_tool(FarmSystem.Tool.HOE)
		KEY_3:
			farm_system.select_tool(FarmSystem.Tool.SEEDS)
		KEY_4:
			farm_system.select_tool(FarmSystem.Tool.WATERING_CAN)
		KEY_F, KEY_SPACE, KEY_ENTER, KEY_KP_ENTER:
			_use_selected_tool()


func get_actor_state_name() -> String:
	return "Using tool" if _actor_state == ActorState.USING_TOOL else "Free"


func _handle_touch_actions() -> void:
	if Input.is_action_just_pressed("tool_prev"):
		farm_system.cycle_tool(-1)
	if Input.is_action_just_pressed("tool_next"):
		farm_system.cycle_tool(1)
	if Input.is_action_just_pressed("interact"):
		_use_selected_tool()


func _use_selected_tool() -> void:
	if _actor_state != ActorState.FREE:
		return
	if not farm_system.interact():
		return

	_actor_state = ActorState.USING_TOOL
	_tool_time_left = tool_action_duration
	_is_moving = false
	velocity = Vector2.ZERO
	_update_sprite_frame()
	queue_redraw()


func _load_farmer_texture() -> void:
	var image := Image.new()
	var load_error := image.load_png_from_buffer(FARMER_SPRITE_DATA.get_png_bytes())
	if load_error != OK:
		push_error("Unable to decode embedded farmer sprite: %s" % error_string(load_error))
		_farmer_texture_ready = false
		farmer_sprite.visible = false
		queue_redraw()
		return

	farmer_sprite.texture = ImageTexture.create_from_image(image)
	_farmer_texture_ready = farmer_sprite.texture != null
	farmer_sprite.visible = _farmer_texture_ready
	queue_redraw()


func _update_sprite_frame() -> void:
	if not _farmer_texture_ready:
		return
	var frame_column := 0
	if _is_moving and _actor_state == ActorState.FREE:
		frame_column = 1 + int(_walk_animation_time / WALK_FRAME_TIME) % WALK_FRAME_COUNT
	farmer_sprite.frame_coords = Vector2i(frame_column, _direction_index())


func _draw() -> void:
	# A small ground shadow keeps the character readable over soil and paths.
	draw_circle(Vector2(0, 12), 6.0, Color(0.05, 0.07, 0.05, 0.28))

	# Never leave the player invisible if a browser rejects the runtime texture.
	if not _farmer_texture_ready:
		draw_circle(Vector2(0, -7), 5.0, Color("d69a68"))
		draw_rect(Rect2(-6, -3, 12, 13), Color("4b6f44"), true)
		draw_rect(Rect2(-7, -13, 14, 4), Color("c89b3c"), true)
		draw_rect(Rect2(-4, 10, 3, 5), Color("49372d"), true)
		draw_rect(Rect2(1, 10, 3, 5), Color("49372d"), true)

	if _actor_state == ActorState.USING_TOOL:
		var facing_cardinal := _cardinal_direction(_facing)
		var tool_color := Color("d9c26c")
		match farm_system.selected_tool:
			FarmSystem.Tool.HOE:
				tool_color = Color("b8b5aa")
			FarmSystem.Tool.SEEDS:
				tool_color = Color("e6c76b")
			FarmSystem.Tool.WATERING_CAN:
				tool_color = Color("73bbc0")
		draw_line(facing_cardinal * 5.0, facing_cardinal * 17.0, tool_color, 3.0)


func _direction_index() -> int:
	var cardinal := _cardinal_direction(_facing)
	if cardinal == Vector2.UP:
		return 1
	if cardinal == Vector2.LEFT:
		return 2
	if cardinal == Vector2.RIGHT:
		return 3
	return 0


func _cardinal_direction(direction: Vector2) -> Vector2:
	if direction.is_zero_approx():
		return Vector2.DOWN
	if abs(direction.x) > abs(direction.y):
		return Vector2(sign(direction.x), 0)
	return Vector2(0, sign(direction.y))
