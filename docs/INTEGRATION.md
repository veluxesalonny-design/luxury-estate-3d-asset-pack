# Engine integration guide

## What format should I use?

**GLB** is the handoff format: glTF 2.0 container, meshes, transforms and standard PBR material parameters. **BLEND** (distributed as the lossless **.blend.xz** archive) is the authoritative editable source for altering buildings, lighting, materials, cameras and estate layout.

Plot geometry is in local metre coordinates in **data/plots.json** and **data/plot_schedule.csv**. The whole site is conceptual and has no geographic lat/long anchor.

## Three.js and websites

Run the provided browser starter from the repository root:

~~~bash
npm install
npm run dev
npm run build
~~~

The viewer loads **models/luxury-estate-masterplan.glb** using GLTFLoader. Vite's asset URL import copies the model into **dist/assets/** during build. No external texture hosting is needed for the current material configuration.

For an existing Three.js website, install **three**, then use GLTFLoader:

~~~js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const loader = new GLTFLoader();
loader.load('/models/luxury-estate-masterplan.glb', (gltf) => {
  scene.add(gltf.scene);
});
~~~

Copy the GLB to the application's publicly served models folder and verify its URL.

## Unity

Use a glTF 2.0 importer compatible with your Unity version, such as the official/community **glTFast** package. Import the GLB as a scene asset and instantiate its root. Confirm render pipeline, material variants, lightmaps, collision meshes, orientation and metres-to-Unity-units. For production collisions, build simplified collision meshes rather than treating all 1,400+ scene objects as rigidbodies.

## Unreal Engine

Enable the engine's glTF import support where available. Import the GLB; check axis conversion, centimetres-to-metres scale (Unreal works in cm), materials, LODs, translucency and collision generation. For a more editable architectural source, bring in the Blender scene through an appropriate supported export pipeline.

## Godot

Drop the GLB into the Godot project. Godot can import glTF scenes and instanced meshes. Check inherited mesh materials, shader roughness, lighting and Y-up orientation. Prefer static bodies with purpose-built colliders for roads and building footprints.

## Blender

Run **python scripts/extract_blender_source.py**, then open **models/luxury-estate-masterplan.blend** directly; this preserves the richer procedural look-development material nodes. The scene is in metre scale. The delivery camera is **CAM_main**; a second entry camera is **CAM_entry**. Export as glTF/GLB after modifying geometry.

## Name prefixes

- **LOT_**: measured 44 land parcels
- **VILLA_**, **ARCH_**, **ROOF_**: illustrative residential geometry
- **AMEN_**: v3 clubhouse, pool, landscaping, playground, utilities, arrival, drainage
- **ROAD_**: measured internal roads and external context
- **TREE_**, **CAR_**, **LAMP_**, **MARK_**: environmental details
- **CAM_**, **LGT_**: cameras and lighting

## Quality and rights caution

Check glTF material parity and scene fidelity in each engine. Procedural nodes in Blender do not generally translate to glTF without baking. This pack is designed for **cross-engine integration**, not as a ready-to-build engineering plan, and includes no legal/planning approval.

The repository starts private; consult its owner before public redistribution or commercial sublicensing.
