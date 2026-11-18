"""Add the places of tools/tides/arab-places.txt to src/data/places/places_index.json (Arab ports, no region), skipping
ids already there, and print their portSea lines for src/lib/seaNames.ts. Then: python tools/tides/extract.py
ocean_tides/ocean_tides <ids>, node tools/datum/lat.mjs <ids>."""
import json, os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
p = os.path.join(ROOT, 'src', 'data', 'places', 'places_index.json')
idx = json.load(open(p, encoding='utf-8')); have = {x['id'] for x in idx}; new = []
# Arab ports stay before the world places in the index
n_arab = sum(1 for x in idx if x.get('region') != 'world')
for line in open(os.path.join(os.path.dirname(__file__), 'arab-places.txt'), encoding='utf-8'):
    if not line.strip() or line.startswith('#'): continue
    pid, en, ar, c, lat, lon, sea = line.strip().split('|')
    if pid in have: continue
    idx.insert(n_arab, {'id': pid, 'name_en': en, 'name_ar': ar, 'country': c, 'lat': float(lat), 'lon': float(lon)})
    n_arab += 1; have.add(pid); new.append((pid, sea))
json.dump(idx, open(p, 'w', encoding='utf-8', newline='\r\n'), ensure_ascii=False, indent=1)
print(' '.join(i for i, _ in new))
