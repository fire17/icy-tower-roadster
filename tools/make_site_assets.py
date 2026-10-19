#!/usr/bin/env python3
"""Generate the website's game-style art: character sprite sheets, an ice-ledge
3-slice and a brick-wall tile.

    python3 tools/make_site_assets.py [--assets ../game/assets] [--out assets/img/game]

Sprite sheets are cut from the game's own character frames (the same frames the
game and the gameplay video show). The ice ledge and brick tile are drawn
procedurally here: they are our own art, made in the spirit of the tower, not
copied from it. Output is deterministic (fixed RNG seed).
"""
import argparse, random
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
CHARS = {
    # id: (frame dir relative to assets, frame file prefixes in sheet order: idle, walk1-4, jump1-3)
    'roadster': ('custom_characters/tesla_roadster/frames', ['000', '001', '002', '003', '004', '005', '006', '007']),
    'harold':   ('harold_the_homeboy', ['001', '002', '003', '004', '005', '006', '007', '008']),
    'dave':     ('disco_dave', ['001', '002', '003', '004', '005', '006', '007', '008']),
    'template': ('template', ['001', '002', '003', '004', '005', '006', '007', '008']),
}


def frame(path):
    im = Image.open(path)
    if im.mode == 'P':  # original 8-bit frames: palette index 0 is transparent
        idx = im.copy()
        im = im.convert('RGBA')
        px, ip = im.load(), idx.load()
        for y in range(im.height):
            for x in range(im.width):
                if ip[x, y] == 0:
                    px[x, y] = (0, 0, 0, 0)
    return im.convert('RGBA')


def sheet(assets, cid, out):
    d, keys = CHARS[cid]
    files = sorted((assets / d).glob('*.png'))
    frames = [frame(next(f for f in files if f.name.startswith(k + '_'))) for k in keys]
    cw = max(f.width for f in frames); ch = max(f.height for f in frames)
    cw += cw % 2; ch += ch % 2
    sh = Image.new('RGBA', (cw * len(frames), ch), (0, 0, 0, 0))
    for i, f in enumerate(frames):  # bottom-centre each frame in its cell
        sh.paste(f, (i * cw + (cw - f.width) // 2, ch - f.height), f)
    sh.save(out / f'{cid}.png', optimize=True)
    return cw, ch


def ice(out):
    """48x14 ice ledge: rounded caps (8 px) + a 32 px tileable middle."""
    W, H = 48, 14
    rnd = random.Random(17)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, W - 1, H - 1), radius=5, fill=(20, 22, 48, 255))          # outline
    d.rounded_rectangle((1, 1, W - 2, H - 2), radius=4, fill=(196, 206, 232, 255))       # body
    for y in range(2, H - 2):                                                           # vertical shade
        t = (y - 2) / (H - 5)
        c = (int(232 - 60 * t), int(238 - 58 * t), int(252 - 40 * t), 255)
        d.line((2 if y > 3 else 4, y, W - (3 if y > 3 else 5), y), fill=c)
    d.line((4, 2, W - 5, 2), fill=(250, 252, 255, 255))                                  # top highlight
    for _ in range(46):                                                                 # frost speckle
        x, y = rnd.randint(3, W - 4), rnd.randint(4, H - 4)
        d.point((x, y), fill=(150, 160, 200, 255) if rnd.random() < .6 else (255, 255, 255, 255))
    im.save(out / 'ice.png', optimize=True)


def bricks(out):
    """64x32 tileable brick wall in tower-indigo."""
    W, H = 64, 32
    rnd = random.Random(5)
    im = Image.new('RGBA', (W, H), (14, 14, 30, 255))
    d = ImageDraw.Draw(im)
    for row in range(4):
        y0 = row * 8
        off = 0 if row % 2 == 0 else -8
        for bx in range(off, W, 16):
            base = rnd.randint(54, 72)
            col = (base - 6, base - 4, base + 34, 255)
            d.rectangle((bx + 1, y0 + 1, bx + 14, y0 + 6), fill=col)
            d.line((bx + 1, y0 + 1, bx + 13, y0 + 1), fill=(base + 18, base + 18, base + 60, 255))
            for _ in range(5):
                d.point((bx + rnd.randint(2, 13), y0 + rnd.randint(2, 6)), fill=(base - 16, base - 14, base + 18, 255))
    # wrap the half bricks cleanly by redrawing the left column on the right edge
    im.paste(im.crop((0, 0, 1, H)), (W - 1, 0))
    im.save(out / 'bricks.png', optimize=True)


def tower(out):
    """120x180 vertically tileable tower strip: brick wall plus staggered ice ledges."""
    W, H = 120, 180
    br = Image.open(out / 'bricks.png'); ic = Image.open(out / 'ice.png')
    im = Image.new('RGBA', (W, H))
    for y in range(0, H, br.height):
        for x in range(0, W, br.width):
            im.paste(br, (x, y))
    def ledge(x, y, w):  # 3-slice paste of the ice ledge
        im.paste(ic.crop((0, 0, 8, 14)), (x, y), ic.crop((0, 0, 8, 14)))
        for xx in range(x + 8, x + w - 8, 32):
            seg = ic.crop((8, 0, 8 + min(32, x + w - 8 - xx), 14)); im.paste(seg, (xx, y), seg)
        im.paste(ic.crop((40, 0, 48, 14)), (x + w - 8, y), ic.crop((40, 0, 48, 14)))
    for (x, y, w) in ((8, 16, 64), (48, 76, 64), (20, 136, 56)):
        ledge(x, y, w)
    im.save(out / 'tower.png', optimize=True)


def portraits(assets, out):
    """Edition portraits, one strip of 3 expression frames each:
    harold = the title screen's own HEROFACE art at 1:1; dave/template = head-and-shoulders
    crops of their idle frames at 7x; roadster = its idle frame at 3x. Nearest-neighbour only."""
    def strip(frames, name):
        cw = max(f.width for f in frames); ch = max(f.height for f in frames)
        sh = Image.new('RGBA', (cw * len(frames), ch), (0, 0, 0, 0))
        for i, f in enumerate(frames):
            sh.paste(f, (i * cw + (cw - f.width) // 2, ch - f.height), f)
        sh.save(out / f'portrait-{name}.png', optimize=True)
        return cw, ch
    data = assets / 'data'
    print('portrait harold', strip([frame(data / f'HEROFACE00{i}.png') for i in range(3)], 'harold'))
    def head(d, keys, scale):
        fs = sorted((assets / d).glob('*.png'))
        res = []
        for k in keys:
            f = frame(next(x for x in fs if x.name.startswith(k + '_')))
            box = f.getbbox(); f = f.crop((box[0], box[1], box[2], min(box[3], box[1] + 32)))
            res.append(f.resize((f.width * scale, f.height * scale), Image.NEAREST))
        return res
    print('portrait dave', strip(head('disco_dave', ['001', '010', '011'], 7), 'dave'))
    print('portrait template', strip(head('template', ['001', '010', '011'], 7), 'template'))
    # Roadster: nose-up launch angles from its own 64-angle flip atlas (72x72 cells), 4x
    atlas = Image.open(assets / 'custom_characters/tesla_roadster/rot/rot.png').convert('RGBA')
    cells = [atlas.crop((0, k * 72, 72, k * 72 + 72)) for k in (5, 4, 6)]
    box = cells[0].getbbox()
    for c in cells[1:]:
        b = c.getbbox(); box = (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    car = [c.crop(box).resize(((box[2] - box[0]) * 4, (box[3] - box[1]) * 4), Image.NEAREST) for c in cells]
    print('portrait roadster', strip(car, 'roadster'))


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--assets', type=Path, default=HERE.parent.parent / 'game' / 'assets')
    ap.add_argument('--out', type=Path, default=HERE.parent / 'assets' / 'img' / 'game')
    a = ap.parse_args()
    a.out.mkdir(parents=True, exist_ok=True)
    for cid in CHARS:
        print(cid, 'cell %dx%d' % sheet(a.assets, cid, a.out))
    ice(a.out); bricks(a.out); tower(a.out); portraits(a.assets, a.out)
    for f in sorted(a.out.iterdir()):
        print(f.name, f.stat().st_size, 'bytes')


if __name__ == '__main__':
    main()
