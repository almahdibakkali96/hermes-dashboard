"""Read EOT20 tidal constituents for a port from the nearest water grid cell.

  python tools/tides/extract.py <EOT20 ocean_tides dir> <id> [<id> ...]

Each id must already be in src/data/places/places_index.json (with lat/lon); the timezone is
given in TIMEZONES below by country. Writes src/data/places/<id>.json in the existing format.
EOT20: Hart-Davis et al. 2021, doi:10.17882/79489, CC BY 4.0.
"""
import json, math, os, sys
import numpy as np
import xarray as xr

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
PLACES = os.path.join(ROOT, 'src', 'data', 'places')
CONSTITUENTS = ['2N2', 'J1', 'K1', 'K2', 'M2', 'M4', 'MF', 'MM', 'N2', 'O1', 'P1', 'Q1', 'S1', 'S2', 'SA', 'SSA', 'T2']
TIMEZONES = {'TN': 'Africa/Tunis', 'LY': 'Africa/Tripoli', 'AE': 'Asia/Dubai'}
WINDOW = 0.75  # degrees searched around the port for the nearest water cell


def haversine(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lon2 - lon1) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def nearest_cell(ds, lat, lon):
    lon360 = lon % 360
    sub = ds.sel(lat=slice(lat - WINDOW, lat + WINDOW), lon=slice(lon360 - WINDOW, lon360 + WINDOW))
    amp = sub['amplitude'].values
    best = None
    for i, la in enumerate(sub['lat'].values):
        for j, lo in enumerate(sub['lon'].values):
            if np.isnan(amp[i, j]):
                continue
            lo180 = lo - 360 if lo > 180 else lo
            d = haversine(lat, lon, la, lo180)
            if best is None or d < best[0]:
                best = (d, float(la), float(lo))
    if best is None:
        raise SystemExit(f'no water cell within {WINDOW} deg of {lat},{lon}')
    return best


def main():
    src, ids = sys.argv[1], sys.argv[2:]
    index = {p['id']: p for p in json.load(open(os.path.join(PLACES, 'places_index.json'), encoding='utf-8'))}
    sets = {c: xr.open_dataset(os.path.join(src, f'{c}_ocean_eot20.nc')) for c in CONSTITUENTS}
    for pid in ids:
        p = index[pid]
        d, glat, glon = nearest_cell(sets['M2'], p['lat'], p['lon'])
        cons = {}
        for c in CONSTITUENTS:
            cell = sets[c].sel(lat=glat, lon=glon)
            cons[c] = {'amp': round(float(cell['amplitude']), 5), 'phase': round(float(cell['phase']), 3)}
        out = {
            'id': pid, 'name_en': p['name_en'], 'name_ar': p['name_ar'], 'country': p['country'],
            'lat': p['lat'], 'lon': p['lon'], 'timezone': TIMEZONES[p['country']],
            'grid': {'lat': glat, 'lon': glon - 360 if glon > 180 else glon, 'distance_km': round(d, 1)},
            'source': 'EOT20 ocean tide model, Hart-Davis et al. 2021, doi:10.17882/79489, CC BY 4.0. Values read from the nearest water grid cell.',
            'units': {'amplitude': 'cm', 'phase': 'degrees'},
            'constituents': cons,
        }
        with open(os.path.join(PLACES, f'{pid}.json'), 'w', encoding='utf-8', newline='\r\n') as f:
            json.dump(out, f, ensure_ascii=False, indent=1)
        print(f"{pid}: cell {glat},{out['grid']['lon']} ({out['grid']['distance_km']} km), M2 {cons['M2']['amp']} cm")


if __name__ == '__main__':
    main()
