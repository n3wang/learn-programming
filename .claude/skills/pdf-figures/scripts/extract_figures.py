#!/usr/bin/env python3
"""Pull book figures out of a PDF as PNGs, matched to their "Figure N.M" captions.

  chapters  PDF                         list chapter starts (TOC, else "This chapter covers")
  extract   PDF --pages A-B --out DIR   render every captioned figure in the range
  render    PDF --page N --clip x0,y0,x1,y1 --out F.png   re-crop one figure by hand

Raster figures: the embedded images above (or beside) the caption are unioned
and rendered, so vector overlays on top of them are kept. Vector figures (no
image): the band between the last wide body-text block and the caption.
Writes DIR/fig-N-M.png, DIR/captions.json, and DIR/_contact.png to eyeball.

Needs PyMuPDF (pip install pymupdf). 1-based page numbers everywhere.
"""
import argparse
import json
import os
import re
import shutil
import subprocess

import pymupdf

CAP = re.compile(r'^\s*(?:Figure|Fig\.)\s*(\d+)[.\-](\d+)\b')


def chapters(doc):
    toc = [(lvl, title, page) for lvl, title, page in doc.get_toc() if lvl <= 2]
    if toc:
        for lvl, title, page in toc:
            print(f'{"  " * (lvl - 1)}p{page:<5} {title}')
        return
    for i, page in enumerate(doc):
        text = page.get_text()
        if 'This chapter covers' in text or re.match(r'\s*(Chapter|CHAPTER)\s+\d+', text):
            print(f'p{i + 1:<5} {" ".join(text.split())[:80]}')


def figure_rect(page, cap_rect, prev_bottom):
    W = page.rect.width
    images = [page.get_image_bbox(im) for im in page.get_images(full=True)]
    images = [r for r in images if r.is_valid and not r.is_empty and r.width > 20 and r.height > 20]

    if cap_rect.width < 0.45 * W:
        # Caption set beside the figure: take images that overlap it vertically.
        side = [r for r in images if r.y0 < cap_rect.y1 and r.y1 > cap_rect.y0 - 20]
        if side:
            out = side[0]
            for r in side[1:]:
                out |= r
            return out
        # Vector figure to the left of the caption.
        near = pymupdf.Rect(0, cap_rect.y0 - 80, cap_rect.x0 - 2, cap_rect.y1 + 20)
        parts = [d['rect'] for d in page.get_drawings() if near.intersects(d['rect'])]
        parts += [pymupdf.Rect(b[:4]) for b in page.get_text('blocks')
                  if near.intersects(pymupdf.Rect(b[:4])) and b[2] < cap_rect.x0 and b[1] > prev_bottom]
        parts = [r for r in parts if r.y0 >= prev_bottom - 2]
        if parts:
            out = parts[0]
            for r in parts[1:]:
                out |= r
            return out + (-6, -4, 6, 4)

    band_top = prev_bottom
    above = [r for r in images if r.y1 <= cap_rect.y0 + 4 and r.y0 >= band_top - 2]
    if above:
        out = above[0]
        for r in above[1:]:
            out |= r
        # Keep vector callouts drawn over/around the image.
        for d in page.get_drawings():
            dr = d['rect']
            if dr.y0 >= band_top - 2 and dr.y1 <= cap_rect.y0 + 2 and dr.intersects(out + (-30, -30, 30, 30)):
                out |= dr
        return out

    # Vector figure: what's drawn between the previous body text and the caption.
    band = pymupdf.Rect(0, band_top + 1, W, cap_rect.y0 - 1)
    out = None
    for d in page.get_drawings():
        if band.contains(d['rect']) or (d['rect'] & band).height > 0.8 * d['rect'].height:
            out = d['rect'] if out is None else out | d['rect']
    for b in page.get_text('blocks'):
        r = pymupdf.Rect(b[:4])
        if band.contains(r):
            out = r if out is None else out | r
    if out is None:
        margin = min(b[0] for b in page.get_text('blocks')) if page.get_text('blocks') else 36
        return pymupdf.Rect(margin - 6, band.y0, W - margin + 6, band.y1)
    return (out + (-6, -4, 6, 4)) & band


def body_font(doc, first, last):
    """The font with the most characters in the range: the body copy."""
    count = {}
    for pno in range(first - 1, last):
        for b in doc[pno].get_text('dict')['blocks']:
            for line in b.get('lines', []):
                for s in line['spans']:
                    count[s['font']] = count.get(s['font'], 0) + len(s['text'])
    return max(count, key=count.get) if count else None


def first_font(page, rect):
    for b in page.get_text('dict')['blocks']:
        if pymupdf.Rect(b['bbox']).intersects(rect):
            for line in b.get('lines', []):
                for s in line['spans']:
                    if s['text'].strip():
                        return s['font']
    return None


def extract(doc, first, last, out, dpi, prefix):
    os.makedirs(out, exist_ok=True)
    meta = {}
    body = body_font(doc, first, last)
    for pno in range(first - 1, last):
        page = doc[pno]
        W = page.rect.width
        blocks = sorted(page.get_text('blocks'), key=lambda b: b[1])
        # Text that overlaps drawn lines/shapes is part of a figure, never body copy.
        art = [d['rect'] for d in page.get_drawings()
               if d['rect'].get_area() < 0.5 * page.rect.get_area()]
        prev_bottom = 40.0  # below the running header
        for b in blocks:
            rect = pymupdf.Rect(b[:4])
            m = CAP.match(b[4])
            # "Figure 4.2 shows…" in body copy is a reference, not the caption.
            if m and first_font(page, rect + (0, 0, 0, -max(0, rect.height - 12))) == body:
                m = None
            if not m:
                # Body copy bounds the next figure from above. Figure labels can be
                # wide too, but they're short lines in a non-body font.
                lines = [ln for ln in b[4].split('\n') if ln.strip()]
                prose = lines and sum(map(len, lines)) / len(lines) > 35
                in_body_font = first_font(page, rect) == body
                in_art = any(a.intersects(rect) for a in art)
                if not in_art and ((in_body_font and rect.width > 0.3 * W) or (rect.width > 0.55 * W and prose)):
                    prev_bottom = max(prev_bottom, rect.y1)
                continue
            name = f'{prefix}{m.group(1)}-{m.group(2)}'
            clip = figure_rect(page, rect, prev_bottom) & page.rect
            if clip.height < 15:
                print(f'  skip {name} p{pno + 1}: empty region')
                continue
            page.get_pixmap(dpi=dpi, clip=clip).save(os.path.join(out, f'{name}.png'))
            meta[name] = {
                'page': pno + 1,
                'caption': ' '.join(b[4].split()),
                'clip': [round(v, 1) for v in clip],
            }
            prev_bottom = rect.y1
    with open(os.path.join(out, 'captions.json'), 'w') as f:
        json.dump(meta, f, indent=1, ensure_ascii=False)
    print(f'{len(meta)} figures -> {out}')
    for k, v in meta.items():
        print(f'  {k:<10} p{v["page"]:<4} {v["caption"][:70]}')
    contact = shutil.which('magick')
    if contact and meta:
        files = [os.path.join(out, f'{k}.png') for k in meta]
        subprocess.run([contact, 'montage', '-label', '%t', *files, '-tile', '5x',
                        '-geometry', '320x200+6+6', os.path.join(out, '_contact.png')], check=False)
        print(f'contact sheet: {os.path.join(out, "_contact.png")}')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    c = sub.add_parser('chapters')
    c.add_argument('pdf')
    e = sub.add_parser('extract')
    e.add_argument('pdf')
    e.add_argument('--pages', required=True, help='1-based inclusive range, e.g. 38-75')
    e.add_argument('--out', required=True)
    e.add_argument('--dpi', type=int, default=220)
    e.add_argument('--prefix', default='fig-')
    r = sub.add_parser('render', help='re-crop one figure by hand (points, from captions.json "clip")')
    r.add_argument('pdf')
    r.add_argument('--page', type=int, required=True)
    r.add_argument('--clip', required=True, help='x0,y0,x1,y1 in PDF points')
    r.add_argument('--out', required=True, help='output .png')
    r.add_argument('--dpi', type=int, default=220)
    a = ap.parse_args()
    doc = pymupdf.open(a.pdf)
    if a.cmd == 'chapters':
        chapters(doc)
    elif a.cmd == 'render':
        clip = pymupdf.Rect(*(float(v) for v in a.clip.split(',')))
        doc[a.page - 1].get_pixmap(dpi=a.dpi, clip=clip).save(a.out)
        print(a.out)
    else:
        first, last = (int(x) for x in a.pages.split('-'))
        extract(doc, first, last, a.out, a.dpi, a.prefix)


if __name__ == '__main__':
    main()
