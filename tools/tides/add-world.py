"""Add the places of tools/tides/world-places.txt to src/data/places/places_index.json (region "world"), skipping ids
already there. Then: python tools/tides/extract.py ocean_tides/ocean_tides <ids>, node tools/datum/lat.mjs <ids>."""
import json, os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
p = os.path.join(ROOT, 'src', 'data', 'places', 'places_index.json')
idx = json.load(open(p, encoding='utf-8')); have = {x['id'] for x in idx}; new = []
for line in open(os.path.join(os.path.dirname(__file__), 'world-places.txt'), encoding='utf-8'):
    if not line.strip() or line.startswith('#'): continue
    pid, en, ar, c, lat, lon, tz = line.strip().split('|')
    if pid in have: continue
    idx.append({'id': pid, 'name_en': en, 'name_ar': ar, 'country': c, 'lat': float(lat), 'lon': float(lon), 'region': 'world', 'timezone': tz})
    have.add(pid); new.append(pid)
json.dump(idx, open(p, 'w', encoding='utf-8', newline='\r\n'), ensure_ascii=False, indent=1)
print(' '.join(new))
