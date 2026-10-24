extends Node2D
## Night Bloom — cozy-horror greenhouse caretaker (Godot MVP loop)
## Full art/systems: multi-month. This proves day cycle + plant stress + scare beat.

var day := 1
var soil_moisture := 0.7
var bloom := 0.0
var stress := 0.0
var label: Label

func _ready() -> void:
	label = Label.new()
	label.position = Vector2(24, 24)
	label.add_theme_font_size_override("font_size", 22)
	add_child(label)
	_refresh()
	print("Night Bloom: tend plants by day; something watches at night.")

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_W:
				soil_moisture = clampf(soil_moisture + 0.15, 0.0, 1.0)
				bloom += 0.05
			KEY_F:
				# fertilize — raises bloom, slight stress
				bloom += 0.08
				stress += 0.04
			KEY_N:
				_advance_night()
			KEY_R:
				day = 1
				soil_moisture = 0.7
				bloom = 0.0
				stress = 0.0
		_refresh()

func _advance_night() -> void:
	day += 1
	soil_moisture = clampf(soil_moisture - 0.2, 0.0, 1.0)
	if soil_moisture < 0.3:
		stress += 0.12
		print("The glass fogged. Something moved between the rows.")
	else:
		bloom += 0.03
		stress = maxf(0.0, stress - 0.02)
	if stress > 0.85:
		print("NIGHT BLOOM EVENT — the greenhouse remembers you.")

func _refresh() -> void:
	label.text = "Night Bloom  ·  Day %d\nMoisture %.0f%%  Bloom %.0f%%  Stress %.0f%%\n[W] water  [F] feed  [N] next night  [R] restart" % [
		day, soil_moisture * 100.0, bloom * 100.0, stress * 100.0
	]
