"""Validate data/affixes.json.

Checks:
  * required fields, unique ids, known ratings, https links;
  * the "cut" markup actually spells the fragment:
      [x] = letters the prefix keeps, {x} = letters the suffix keeps,
      (+x) = vowel added to the prefix, everything else = dropped letters.
    Diacritics are ignored and k/c count as the same letter (Greek kappa is
    usually written c in the riven names, e.g. akron -> cron).

Usage:  python tools/validate.py
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / 'data' / 'affixes.json'
RATINGS = {'3', '2', '1', 'g', '0'}
CJK = re.compile(r'[　-鿿＀-￯]')


def norm(s: str) -> str:
    s = ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')
    return s.replace('k', 'c').replace('ı', 'i')


def spell(cut: str):
    """Return (prefix letters, suffix letters) spelled by one cut alternative."""
    pre = ''.join(re.findall(r'\[([^\]]*)\]', cut)) + ''.join(re.findall(r'\(\+([a-z]+)\)', cut))
    suf = ''.join(re.findall(r'\{([^}]*)\}', cut))
    return pre, suf


def main() -> int:
    data = json.loads(DATA.read_text(encoding='utf-8'))
    errors, seen = [], set()
    for e in data['entries']:
        tag = f"{e.get('id')} ({e.get('zh')})"
        for key in ('id', 'zh', 'en', 'prefix', 'suffix'):
            if not e.get(key):
                errors.append(f'{tag}: missing {key}')
        if e['id'] in seen:
            errors.append(f'{tag}: duplicate id')
        seen.add(e['id'])
        if e.get('status') not in ('active', 'dedicated', 'reserved', 'removed'):
            errors.append(f'{tag}: unknown status {e.get("status")!r}')
        if e.get('status') == 'dedicated' and not e.get('shownAs'):
            errors.append(f'{tag}: dedicated entry needs shownAs')
        halves = [('prefix', e['prefix']), ('suffix', e['suffix'])]
        for name, h in halves:
            if h.get('rating') not in RATINGS:
                errors.append(f'{tag}: {name} rating {h.get("rating")!r}')
            for link in h.get('links', []):
                if not link['url'].startswith('https://'):
                    errors.append(f'{tag}: non-https link {link["url"]}')

        # English version: every explanation needs whyEn, every link label with Chinese in it needs labelEn
        for name, h in halves:
            for x in [h] + h.get('alts', []):
                if x.get('why') and not x.get('whyEn'):
                    errors.append(f'{tag}: {name} {x.get("word", "")!r} has why but no whyEn')
                for link in x.get('links', []):
                    if CJK.search(link['label']) and not link.get('labelEn'):
                        errors.append(f'{tag}: link {link["label"]!r} needs labelEn')

        pf, sf = norm(e['prefix']['frag']), norm(e['suffix']['frag'])
        # alternative candidate sources: each needs word/lang/why; a cut, if given, must spell its half
        for idx, (name, h) in enumerate(halves):
            for a in h.get('alts', []):
                for key in ('word', 'lang', 'why'):
                    if not a.get(key):
                        errors.append(f'{tag}: {name} alt missing {key}')
                for link in a.get('links', []):
                    if not link['url'].startswith('https://'):
                        errors.append(f'{tag}: non-https link {link["url"]}')
                if not a.get('cut'):
                    continue
                pre, suf = (norm(s) for s in spell(a['cut']))
                if e['whole']:
                    ok = (pre or suf) and (not pre or pre == pf) and (not suf or suf == sf)
                else:
                    ok = (pre, suf)[idx] == (pf, sf)[idx]
                if not ok:
                    errors.append(f'{tag}: {name} alt cut {a["cut"]!r} spells ({pre}, {suf})')
        if e['whole']:
            alts = [a for a in e['prefix']['cut'].split(' / ') if a]
            if not any(spell(a) == (pf, sf) or (norm(spell(a)[0]), norm(spell(a)[1])) == (pf, sf) for a in alts):
                got = [tuple(map(norm, spell(a))) for a in alts]
                errors.append(f'{tag}: whole-word cut spells {got}, expected ({pf}, {sf})')
            continue
        for name, h, want, idx in (('prefix', e['prefix'], pf, 0), ('suffix', e['suffix'], sf, 1)):
            if not h.get('cut'):
                if h['rating'] != '0':
                    errors.append(f'{tag}: {name} has no cut but is rated {h["rating"]}')
                continue
            alts = [a for a in h['cut'].split(' / ') if a]
            got = [norm(spell(a)[idx]) for a in alts]
            if want not in got:
                errors.append(f'{tag}: {name} cut spells {got}, expected {want}')

    print(f'{len(data["entries"])} entries checked')
    for err in errors:
        print('  ERROR', err)
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
