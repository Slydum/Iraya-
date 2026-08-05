class_name Player
extends CharacterBody2D

@export var walk_speed: float = 92.0
@export var sprint_multiplier: float = 1.55
@export var tool_action_duration: float = 0.22

enum ActorState {
	FREE,
	USING_TOOL,
}

const FARMER_TEXTURE := preload("res://assets/game/farmer_basic.png")
const FRAME_SIZE := Vector2(48, 64)
const WALK_FRAME_COUNT := 5
const WALK_FRAME_TIME := 0.12

@onready var farm_system: FarmSystem = get_node("../FarmSystem")

var _facing := Vector2.DOWN
var _is_moving := false
var _is_sprinting := false
var _actor_state: int = ActorState.FREE
var _tool_time_left := 0.0
var _walk_animation_time := 0.0


func _ready() -> void:
	collision_layer = 2
	collision_mask = 1
	queue_redraw()


func _physics_process(delta: float) -> void:
	farm_system.update_cursor(global_position, _facing)
	_handle_touch_actions()

	if _actor_state == ActorState.USING_TOOL:
		_tool_time_left -= delta
		velocity = Vector2.ZERO
		move_and_slide()
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

	if was_moving != _is_moving or _is_moving:
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
	queue_redraw()


func _draw() -> void:
	var direction_index := _direction_index()
	var row := direction_index
	var frame := 0

	if _is_moving:
		row += 4
		frame = int(_walk_animation_time / WALK_FRAME_TIME) % WALK_FRAME_COUNT

	var source_rect := Rect2(Vector2(frame * 48, row * 64), FRAME_SIZE)
	var destination_rect := Rect2(Vector2(-24, -42), FRAME_SIZE)
	draw_texture_rect_region(FARMER_TEXTURE, destination_rect, source_rect)

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
