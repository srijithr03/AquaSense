import bpy
import bmesh
import math
from mathutils import Vector

# ==============================================================================
# AquaSense AI Smart Water Monitor - 3D Enclosure Generator
# ==============================================================================

# --- Parametric Dimensions (in meters, Blender's default unit) ---
WIDTH = 0.110          # 110 mm
HEIGHT = 0.145         # 145 mm
DEPTH = 0.055          # 55 mm
CORNER_RADIUS = 0.010  # 10 mm
WALL_THICK = 0.002     # 2 mm

FRONT_DEPTH = 0.035
REAR_DEPTH = 0.020

# Internal dimensions
INNER_WIDTH = WIDTH - (2 * WALL_THICK)
INNER_HEIGHT = HEIGHT - (2 * WALL_THICK)
DIVIDER_X = 0.0        # Center divider

# ==============================================================================
# Helper Functions
# ==============================================================================

def clear_scene():
    """Clears all objects in the current scene to start fresh."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_collection(name):
    """Creates a new collection or returns existing one."""
    if name not in bpy.data.collections:
        coll = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(coll)
    return bpy.data.collections[name]

def link_to_collection(obj, coll_name):
    """Links an object to a specific collection and unlinks from master."""
    coll = create_collection(coll_name)
    if obj.name not in coll.objects:
        coll.objects.link(obj)
    # Unlink from main scene if present there
    if obj.name in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.unlink(obj)

def apply_transforms(obj):
    """Applies location, rotation, and scale to the object."""
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    obj.select_set(False)

def create_rounded_box(name, w, h, d, radius, location=(0, 0, 0)):
    """Creates a box with rounded Z-axis edges using a Bevel modifier."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    
    # Scale to dimensions
    obj.scale = (w, h, d)
    apply_transforms(obj)
    
    # Add Bevel Modifier for rounded corners (only vertical edges)
    bevel = obj.modifiers.new(name="Bevel", type='BEVEL')
    bevel.width = radius
    bevel.segments = 12
    bevel.limit_method = 'ANGLE'
    bevel.angle_limit = math.radians(45)
    
    # Apply modifier to bake the rounded shape
    bpy.ops.object.modifier_apply(modifier="Bevel")
    return obj

def create_box(name, w, h, d, location=(0, 0, 0)):
    """Creates a simple box/cube."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (w, h, d)
    apply_transforms(obj)
    return obj

def create_cylinder(name, radius, depth, location=(0, 0, 0), rot=(0, 0, 0)):
    """Creates a simple cylinder."""
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=location, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    apply_transforms(obj)
    return obj

def add_boolean(target, cutter, operation='DIFFERENCE', apply=False):
    """Adds a boolean modifier to target using cutter."""
    bool_mod = target.modifiers.new(name=f"Bool_{cutter.name}", type='BOOLEAN')
    bool_mod.operation = operation
    bool_mod.object = cutter
    bool_mod.solver = 'EXACT'
    if apply:
        bpy.context.view_layer.objects.active = target
        bpy.ops.object.modifier_apply(modifier=bool_mod.name)
        # Delete cutter if applied
        bpy.data.objects.remove(cutter, do_unlink=True)

def create_text(name, body, size, location, extrude=0.001):
    """Creates 3D text."""
    bpy.ops.object.text_add(location=location)
    text_obj = bpy.context.active_object
    text_obj.name = name
    text_obj.data.body = body
    text_obj.data.align_x = 'CENTER'
    text_obj.data.align_y = 'CENTER'
    text_obj.data.size = size
    text_obj.data.extrude = extrude
    
    # Convert text to mesh
    bpy.ops.object.convert(target='MESH')
    return text_obj

# ==============================================================================
# Core Component Generation
# ==============================================================================

def build_front_cover():
    """Generates the front cover with cutouts and compartments."""
    # 1. Base Solid
    front_z = FRONT_DEPTH / 2
    front = create_rounded_box("Front_Cover", WIDTH, HEIGHT, FRONT_DEPTH, CORNER_RADIUS, location=(0, 0, front_z))
    
    # 2. Hollow out inner space (leave front wall)
    # The cutter is slightly longer in Z to ensure complete cutout at the back
    inner_cutter_z = front_z + WALL_THICK
    inner_cutter_depth = FRONT_DEPTH
    cutter = create_rounded_box("Front_Inner_Cutter", INNER_WIDTH, INNER_HEIGHT, inner_cutter_depth, CORNER_RADIUS - WALL_THICK, location=(0, 0, inner_cutter_z))
    add_boolean(front, cutter, 'DIFFERENCE', apply=True)
    
    # 3. Add internal divider wall (separates Water chamber and Electronics)
    divider = create_box("Front_Divider", WALL_THICK, INNER_HEIGHT, FRONT_DEPTH - WALL_THICK, location=(DIVIDER_X, 0, front_z + WALL_THICK/2))
    # Join divider to front
    add_boolean(front, divider, 'UNION', apply=True)
    
    # 4. LCD Cut-out (Centered in right compartment)
    lcd_w = 0.071
    lcd_h = 0.024
    lcd_x_center = (DIVIDER_X + (WIDTH/2 - WALL_THICK)) / 2 # Center of right compartment
    lcd_y_center = 0.035 # Top part
    lcd_cutter = create_box("LCD_Cutter", lcd_w, lcd_h, WALL_THICK * 4, location=(lcd_x_center, lcd_y_center, 0))
    add_boolean(front, lcd_cutter, 'DIFFERENCE', apply=True)
    
    # 5. Engraved Text
    text1 = create_text("Text_AquaSense", "AquaSense", 0.008, location=(lcd_x_center, lcd_y_center - 0.025, 0.0))
    text2 = create_text("Text_Sub", "AI Smart Water Monitor", 0.004, location=(lcd_x_center, lcd_y_center - 0.035, 0.0))
    # Move text up slightly so it embeds into the front face for a boolean difference
    text1.location.z = WALL_THICK / 2
    text2.location.z = WALL_THICK / 2
    apply_transforms(text1)
    apply_transforms(text2)
    add_boolean(front, text1, 'DIFFERENCE', apply=True)
    add_boolean(front, text2, 'DIFFERENCE', apply=True)

    # 6. Pipe Inlets/Outlets (Left side - Water Chamber)
    # Left side X = -WIDTH/2
    pipe_radius = 0.008
    pipe_y = 0.0
    pipe_in_cutter = create_cylinder("Pipe_Inlet_Cutter", pipe_radius, WALL_THICK * 4, location=(-WIDTH/2, pipe_y, FRONT_DEPTH/2), rot=(0, math.pi/2, 0))
    # Divider pipe cut-out
    pipe_out_cutter = create_cylinder("Pipe_Outlet_Cutter", pipe_radius, WALL_THICK * 4, location=(DIVIDER_X, pipe_y, FRONT_DEPTH/2), rot=(0, math.pi/2, 0))
    
    add_boolean(front, pipe_in_cutter, 'DIFFERENCE', apply=True)
    add_boolean(front, pipe_out_cutter, 'DIFFERENCE', apply=True)

    # 7. Rubber Gasket Groove
    # Create a thin rectangular frame cutter along the rim
    rim_cutter_outer = create_rounded_box("Rim_Cutter_O", INNER_WIDTH + WALL_THICK, INNER_HEIGHT + WALL_THICK, 0.002, CORNER_RADIUS - (WALL_THICK/2), location=(0, 0, FRONT_DEPTH))
    rim_cutter_inner = create_rounded_box("Rim_Cutter_I", INNER_WIDTH, INNER_HEIGHT, 0.004, CORNER_RADIUS - WALL_THICK, location=(0, 0, FRONT_DEPTH))
    add_boolean(rim_cutter_outer, rim_cutter_inner, 'DIFFERENCE', apply=True)
    add_boolean(front, rim_cutter_outer, 'DIFFERENCE', apply=True)

    # 8. Mounting Pillars for Right Compartment
    # ESP32 and DS3231 platform pillars
    pillar_z = WALL_THICK + (FRONT_DEPTH/2)
    pillar_h = FRONT_DEPTH - WALL_THICK - 0.005
    build_mounting_pillars(front, lcd_x_center, -0.045, pillar_h, pillar_z, "ESP32_Pillars") # Bottom
    build_mounting_pillars(front, lcd_x_center, -0.005, pillar_h, pillar_z, "RTC_Pillars")   # Middle
    
    # LCD Mounting Posts
    build_mounting_pillars(front, lcd_x_center, lcd_y_center, pillar_h, pillar_z, "LCD_Pillars", spacing=(0.075, 0.031))

    # 9. ESP32 USB-C Cut-out (Right side wall)
    usb_w = 0.012
    usb_h = 0.006
    usb_cutter = create_box("USB_Cutter", WALL_THICK * 4, usb_w, usb_h, location=(WIDTH/2, -0.045, FRONT_DEPTH - 0.005))
    add_boolean(front, usb_cutter, 'DIFFERENCE', apply=True)

    link_to_collection(front, "AquaSense_Enclosure")
    return front

def build_mounting_pillars(parent_obj, center_x, center_y, height, z_offset, name, spacing=(0.04, 0.02)):
    """Creates a set of 4 mounting pillars with screw holes."""
    sx, sy = spacing[0]/2, spacing[1]/2
    positions = [
        (center_x + sx, center_y + sy, z_offset),
        (center_x - sx, center_y + sy, z_offset),
        (center_x + sx, center_y - sy, z_offset),
        (center_x - sx, center_y - sy, z_offset)
    ]
    
    for i, pos in enumerate(positions):
        # Pillar body
        pillar = create_cylinder(f"{name}_{i}", 0.003, height, location=pos)
        # Screw hole (cutter)
        hole = create_cylinder(f"{name}_hole_{i}", 0.0012, height + 0.001, location=(pos[0], pos[1], pos[2] + 0.001))
        add_boolean(pillar, hole, 'DIFFERENCE', apply=True)
        # Union with parent
        add_boolean(parent_obj, pillar, 'UNION', apply=True)

def build_rear_cover():
    """Generates the rear cover with snap-fit lip and ventilation."""
    rear_z = FRONT_DEPTH + (REAR_DEPTH / 2)
    rear = create_rounded_box("Rear_Cover", WIDTH, HEIGHT, REAR_DEPTH, CORNER_RADIUS, location=(0, 0, rear_z))
    
    # Hollow out
    inner_cutter_z = rear_z - WALL_THICK
    inner_cutter_depth = REAR_DEPTH
    cutter = create_rounded_box("Rear_Inner_Cutter", INNER_WIDTH, INNER_HEIGHT, inner_cutter_depth, CORNER_RADIUS - WALL_THICK, location=(0, 0, inner_cutter_z))
    add_boolean(rear, cutter, 'DIFFERENCE', apply=True)
    
    # Internal divider alignment (to press against front gasket)
    divider = create_box("Rear_Divider", WALL_THICK, INNER_HEIGHT, REAR_DEPTH - WALL_THICK, location=(DIVIDER_X, 0, rear_z - WALL_THICK/2))
    add_boolean(rear, divider, 'UNION', apply=True)
    
    # Snap-fit lip (extends into the front cover's gasket groove)
    lip_outer = create_rounded_box("Lip_Outer", INNER_WIDTH + 0.001, INNER_HEIGHT + 0.001, 0.002, CORNER_RADIUS - (WALL_THICK/2), location=(0, 0, FRONT_DEPTH))
    lip_inner = create_rounded_box("Lip_Inner", INNER_WIDTH - 0.001, INNER_HEIGHT - 0.001, 0.004, CORNER_RADIUS - WALL_THICK, location=(0, 0, FRONT_DEPTH))
    add_boolean(lip_outer, lip_inner, 'DIFFERENCE', apply=True)
    add_boolean(rear, lip_outer, 'UNION', apply=True)
    
    # Ventilation Slots (Right compartment, top & bottom)
    slot_w = 0.03
    slot_h = 0.002
    slot_spacing = 0.004
    
    for i in range(5):
        # Top vents (above LCD)
        vent_top = create_box(f"Vent_T_{i}", slot_w, slot_h, WALL_THICK * 4, location=(DIVIDER_X/2 + WIDTH/4, 0.05 + i*slot_spacing, rear_z + REAR_DEPTH/2))
        add_boolean(rear, vent_top, 'DIFFERENCE', apply=True)
        # Bottom vents (below ESP32)
        vent_bot = create_box(f"Vent_B_{i}", slot_w, slot_h, WALL_THICK * 4, location=(DIVIDER_X/2 + WIDTH/4, -0.05 - i*slot_spacing, rear_z + REAR_DEPTH/2))
        add_boolean(rear, vent_bot, 'DIFFERENCE', apply=True)

    # Wire Clips / Cable routing in Right Compartment
    clip1 = create_box("Wire_Clip1", 0.005, 0.002, 0.004, location=(DIVIDER_X + 0.01, -0.02, rear_z - REAR_DEPTH/2 + 0.002))
    clip2 = create_box("Wire_Clip2", 0.005, 0.002, 0.004, location=(WIDTH/2 - 0.01, -0.02, rear_z - REAR_DEPTH/2 + 0.002))
    
    add_boolean(rear, clip1, 'UNION', apply=True)
    add_boolean(rear, clip2, 'UNION', apply=True)

    link_to_collection(rear, "AquaSense_Enclosure")
    return rear

# ==============================================================================
# Main Execution
# ==============================================================================

def main():
    print("Starting AquaSense Enclosure Generation...")
    
    # Prepare Scene
    clear_scene()
    
    # Build Parts
    front = build_front_cover()
    rear = build_rear_cover()
    
    # Final cleanup: Move objects apart slightly for visual explosion
    front.location.z -= 0.02
    apply_transforms(front)
    
    rear.location.z += 0.02
    apply_transforms(rear)
    
    # Apply a nice color/material for visualization
    mat_front = bpy.data.materials.new(name="Material_Front")
    mat_front.diffuse_color = (0.1, 0.6, 0.8, 1.0) # Aqua Blue
    front.data.materials.append(mat_front)
    
    mat_rear = bpy.data.materials.new(name="Material_Rear")
    mat_rear.diffuse_color = (0.2, 0.2, 0.2, 1.0) # Dark Grey
    rear.data.materials.append(mat_rear)
    
    # Set view to see the model
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.shading.type = 'SOLID'
                    space.shading.color_type = 'MATERIAL'
    
    print("Generation Complete! Objects organized in 'AquaSense_Enclosure' collection.")

if __name__ == "__main__":
    main()
