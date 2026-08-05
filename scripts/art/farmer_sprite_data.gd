extends RefCounted

const CHUNKS := [
	preload("res://scripts/art/farmer_sprite_chunk_0.gd").DATA,
	preload("res://scripts/art/farmer_sprite_chunk_1.gd").DATA,
	preload("res://scripts/art/farmer_sprite_chunk_2.gd").DATA,
	preload("res://scripts/art/farmer_sprite_chunk_3.gd").DATA,
	preload("res://scripts/art/farmer_sprite_chunk_4.gd").DATA,
	preload("res://scripts/art/farmer_sprite_chunk_5.gd").DATA,
	preload("res://scripts/art/farmer_sprite_chunk_6.gd").DATA,
	preload("res://scripts/art/farmer_sprite_chunk_7.gd").DATA,
]


static func get_png_bytes() -> PackedByteArray:
	return Marshalls.base64_to_raw("".join(CHUNKS))
