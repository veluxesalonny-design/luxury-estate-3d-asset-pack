#!/usr/bin/env python3
"""Validate the measured plot schedule, parcel overlap and binary asset signatures."""
from pathlib import Path
import csv, json, struct, hashlib, lzma
ROOT=Path(__file__).resolve().parent.parent
p=list(csv.DictReader((ROOT/'data/plot_schedule.csv').open(newline='')))
plots=[dict(id=x['id'], kind=int(x['kind']), x=float(x['x']), y=float(x['y']), w=float(x['width']), h=float(x['depth']), area=int(x['area'])) for x in p]
assert len(plots)==44, len(plots)
assert {k:sum(x['kind']==k for x in plots) for k in (1000,500,300)}=={1000:6,500:28,300:10}
for i,a in enumerate(plots):
 assert a['area']==a['w']*a['h'],a
 assert 0<=a['x'] and 0<=a['y'] and a['x']+a['w']<=200 and a['y']+a['h']<=150,a
 assert not (a['x']<105 and a['x']+a['w']>95),('plot crosses boulevard',a['id'])
 assert not (a['y']<70 and a['y']+a['h']>65),('plot crosses cross street 1',a['id'])
 assert not (a['y']<125 and a['y']+a['h']>120),('plot crosses cross street 2',a['id'])
 for b in plots[:i]:
  overlap=(a['x']<b['x']+b['w'] and a['x']+a['w']>b['x'] and a['y']<b['y']+b['h'] and a['y']+a['h']>b['y'])
  assert not overlap,('overlapping plots',a['id'],b['id'])
assert sum(x['area'] for x in plots)==23000
road_area=10*150+5*200*2-2*(10*5)
assert road_area==3400
assert 30000-23000-road_area==3600
glb=ROOT/'models/luxury-estate-masterplan.glb'
blend=ROOT/'models/luxury-estate-masterplan.blend'
if not glb.exists() or not (blend.exists() or blend.with_suffix('.blend.xz').exists()):
 raise SystemExit('Missing GLB or compressed BLEND source')
with glb.open('rb') as f: hdr=f.read(12)
magic,version,length=struct.unpack('<4sII',hdr)
assert magic==b'glTF' and version==2 and length==glb.stat().st_size
assert (blend.read_bytes() if blend.exists() else lzma.decompress(blend.with_suffix('.blend.xz').read_bytes()))[:7]==b'BLENDER'
meta=json.loads((ROOT/'data/asset_checksums.json').read_text())
for name,info in meta['assets'].items():
 folder='renders' if name.endswith('.png') else 'models'
 path=ROOT/folder/name
 if not path.exists() and name.endswith('.blend'): b=lzma.decompress(path.with_suffix('.blend.xz').read_bytes())
 else: b=path.read_bytes()
 assert hashlib.sha256(b).hexdigest()==info['sha256'], name
print('PASS — 44 nonoverlapping measured plots; area 23,000 + 3,400 + 3,600 = 30,000 m²; GLB/BLEND and checksums verified')
