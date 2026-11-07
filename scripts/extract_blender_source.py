#!/usr/bin/env python3
"""Restore the authoritative editable .blend from the compact .blend.xz asset."""
from pathlib import Path
import hashlib,lzma,json
base=Path(__file__).resolve().parent.parent
archive=base/'models/luxury-estate-masterplan.blend.xz'
out=base/'models/luxury-estate-masterplan.blend'
info=json.loads((base/'data/asset_checksums.json').read_text())
raw=lzma.decompress(archive.read_bytes())
expected=info['assets']['luxury-estate-masterplan.blend']['sha256']
assert raw[:7]==b'BLENDER' and hashlib.sha256(raw).hexdigest()==expected
out.write_bytes(raw)
print('Restored verified editable Blender file:',out,len(raw),'bytes')
