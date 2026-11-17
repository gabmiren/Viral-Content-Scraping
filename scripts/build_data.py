"""Turn the scan CSV in data/ into data.js for the site.
Run after each scan:  python3 scripts/build_data.py
"""
import csv, json, os, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data')
NUM = {'rank', 'metric', 'median', 'followers', 'x_median', 'length_s'}

def load(name):
    p = os.path.join(D, name)
    if not os.path.exists(p): return []
    rows = []
    for r in csv.DictReader(open(p, encoding='utf-8')):
        for k in list(r):
            if k in NUM:
                try: r[k] = float(r[k]) if r[k] not in ('', None) else None
                except ValueError: r[k] = None
        rows.append(r)
    return rows

meta = {}
mp = os.path.join(D, 'meta.json')
if os.path.exists(mp): meta = json.load(open(mp))
meta['built'] = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%MZ')

out = {'meta': meta, 'posts': load('top50.csv')}
with open(os.path.join(ROOT, 'data.js'), 'w', encoding='utf-8') as f:
    f.write('window.DATA = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print({'posts': len(out['posts'])})
