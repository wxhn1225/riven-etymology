"""Turn data/affixes.json into data/affixes.js so index.html opens straight from disk (no server needed).

Usage:  python tools/build.py      (run tools/validate.py first)
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
data = json.loads((ROOT / 'data' / 'affixes.json').read_text(encoding='utf-8'))
js = '// Generated from affixes.json by tools/build.py. Edit the JSON, not this file.\nwindow.AFFIXES = ' + json.dumps(data, ensure_ascii=False) + ';\n'
(ROOT / 'data' / 'affixes.js').write_text(js, encoding='utf-8')
print(f'wrote data/affixes.js ({len(data["entries"])} entries)')
