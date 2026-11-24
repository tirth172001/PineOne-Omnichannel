# Renders assets/images/prime/crown.png (the Prime hero): all gold, front view, symmetric. Blender -b -P scripts/render-prime-crown.py, then trim to the alpha bounds.
import bpy, bmesh, math
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def gold(name, color=(1.0, 0.72, 0.30), rough=0.22):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Metallic'].default_value = 1.0
    b.inputs['Roughness'].default_value = rough
    return m

def gem(name, color):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = 0.05
    b.inputs['Metallic'].default_value = 0.0
    for key in ('Transmission Weight', 'Transmission'):
        if key in b.inputs: b.inputs[key].default_value = 0.6; break
    b.inputs['IOR'].default_value = 1.8
    return m

GOLD = gold('Gold', (1.0, 0.62, 0.16), 0.16); GOLD_DARK = gold('GoldDark', (0.85, 0.48, 0.10), 0.24)

# Crown band with five points: a tube whose top edge rises to peaks.
R, BASE, SPIKE, POINTS, SEG = 1.0, 0.55, 0.75, 5, 240
bm = bmesh.new()
bottom, top = [], []
for i in range(SEG):
    t = 2 * math.pi * i / SEG
    x, y = R * math.cos(t), R * math.sin(t)
    phase = (t * POINTS / (2 * math.pi)) % 1.0
    peak = max(0.0, 1 - abs(phase - 0.5) * 2) ** 1.6  # sharp points between soft valleys
    bottom.append(bm.verts.new((x, y, 0)))
    top.append(bm.verts.new((x, y, BASE + SPIKE * peak)))
for i in range(SEG):
    j = (i + 1) % SEG
    bm.faces.new((bottom[i], bottom[j], top[j], top[i]))
mesh = bpy.data.meshes.new('Band'); bm.to_mesh(mesh); bm.free()
band = bpy.data.objects.new('Band', mesh); scene.collection.objects.link(band)
band.data.materials.append(GOLD)
sol = band.modifiers.new('Solidify', 'SOLIDIFY'); sol.thickness = 0.06; sol.offset = 0
bev = band.modifiers.new('Bevel', 'BEVEL'); bev.width = 0.015; bev.segments = 3
band.modifiers.new('Smooth', 'WEIGHTED_NORMAL') if False else None
for p in band.data.polygons: p.use_smooth = True

def add(obj, mat):
    obj.data.materials.append(mat)
    for p in obj.data.polygons: p.use_smooth = True
    return obj

# Rims at the base and just above it.
bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=0.06, major_segments=160, minor_segments=24, location=(0, 0, 0.03))
add(bpy.context.object, GOLD_DARK)
bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=0.035, major_segments=160, minor_segments=16, location=(0, 0, 0.42))
add(bpy.context.object, GOLD)

# A ball on each point, and gems around the band (green, the brand, with red between).
for k in range(POINTS):
    t = 2 * math.pi * (k + 0.5) / POINTS
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.085, segments=48, ring_count=24, location=(R * math.cos(t), R * math.sin(t), BASE + SPIKE + 0.06))
    add(bpy.context.object, GOLD)
# Gold-only detail: studs on the band (diamond bosses with round ones between), each in a ring,
# a row of beads above the base rim and under the middle band, collars under the tip balls.
for k in range(POINTS * 2):
    t = 2 * math.pi * k / (POINTS * 2)
    diamond = k % 2 == 1
    loc = ((R + 0.04) * math.cos(t), (R + 0.04) * math.sin(t), 0.23)
    # Every stud the same: a domed boss in a ring, evenly spaced, one under each point and one between.
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, segments=64, ring_count=32, location=loc)
    o = bpy.context.object; o.rotation_euler = (0, math.pi / 2, t); o.scale.z = 0.5
    add(o, GOLD)
    ring_r = 0.108
    bpy.ops.mesh.primitive_torus_add(major_radius=ring_r, minor_radius=0.016, major_segments=48, minor_segments=12, location=((R + 0.035) * math.cos(t), (R + 0.035) * math.sin(t), 0.23), rotation=(0, math.pi / 2, t))
    add(bpy.context.object, GOLD_DARK)
for row_z, count, size in ((0.11, 72, 0.026), (0.36, 72, 0.02)):
    for k in range(count):
        t = 2 * math.pi * k / count
        bpy.ops.mesh.primitive_uv_sphere_add(radius=size, segments=16, ring_count=8, location=((R + 0.035) * math.cos(t), (R + 0.035) * math.sin(t), row_z))
        add(bpy.context.object, GOLD)
for k in range(POINTS):
    t = 2 * math.pi * (k + 0.5) / POINTS
    bpy.ops.mesh.primitive_torus_add(major_radius=0.05, minor_radius=0.018, major_segments=32, minor_segments=12, location=(R * math.cos(t), R * math.sin(t), BASE + SPIKE - 0.01))
    add(bpy.context.object, GOLD_DARK)
# Fluting: thin raised ribs running up the band between the studs.
for k in range(POINTS * 2):
    t = 2 * math.pi * k / (POINTS * 2) + math.pi / (POINTS * 2)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.16, vertices=12, location=((R + 0.03) * math.cos(t), (R + 0.03) * math.sin(t), 0.23))
    add(bpy.context.object, GOLD_DARK)

# Tilt the crown towards the camera a little, like the coins.
bpy.ops.object.empty_add(location=(0, 0, 0)); root = bpy.context.object
for o in list(scene.objects):
    if o is not root and o.type == 'MESH': o.parent = root
root.rotation_euler = (0, 0, math.radians(18))

# Camera: front, slightly above, framing the whole crown.
cam_data = bpy.data.cameras.new('Cam'); cam_data.lens = 70
cam = bpy.data.objects.new('Cam', cam_data); scene.collection.objects.link(cam); scene.camera = cam
cam.location = (0, -8.0, 1.05)
direction = Vector((0, 0, 0.66)) - cam.location
cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

# Studio light: a big soft key, a fill, a warm rim; a soft grey world for reflections.
def area(name, loc, energy, size, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.size = size; d.color = color
    o = bpy.data.objects.new(name, d); scene.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 0.6)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
area('Key', (-4, -4, 5), 1400, 3)
area('Fill', (3, -5, 1.5), 520, 4)
area('Rim', (0, 5, 4), 900, 3, (1, 0.9, 0.75))
area('Top', (0, 0, 7), 250, 6)
world = bpy.data.worlds.new('World'); scene.world = world; world.use_nodes = True
bg = world.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.16, 0.15, 0.13, 1); bg.inputs['Strength'].default_value = 1.0

scene.render.engine = 'CYCLES'
scene.cycles.samples = 160; scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.render.resolution_x = scene.render.resolution_y = 900
scene.render.image_settings.file_format = 'PNG'; scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'AgX' if 'AgX' in [i.identifier for i in bpy.types.ColorManagedViewSettings.bl_rna.properties['view_transform'].enum_items] else 'Filmic'
scene.view_settings.look = 'None'
scene.render.filepath = '/tmp/crown/crown.png'
bpy.ops.render.render(write_still=True)
print('RENDERED')
