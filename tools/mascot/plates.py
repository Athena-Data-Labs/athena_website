"""Turn the pipeline's four PNGs into the eight webp plates the site imports.

Two sizes, and the reason is in `src/lib/mascot.ts`: a 1x screen showing her at
576 or 900 CSS pixels is asked to throw away three quarters of a 2048 plate at
paint time, with whatever filter the browser has. The downscale is done here
instead, once, with Lanczos.

The pipeline renders at `--scale 2`, so its PNGs come out at twice the source —
2508 for the 1254 drawing. Both plates are a Lanczos step down from that, which
is the point: 2048 now carries a real 1254 of drawing behind it rather than an
upsample of 1024.

Quality is lower on the large plate than the small one on purpose. The large one
is shown at one device pixel per image pixel at most, so its artefacts are at or
below the display grid; the small one is shown at exactly one, where they are
not.
"""
from PIL import Image

BIG, SMALL, Q_BIG, Q_SMALL = 2048, 1024, 76, 82
OUT = '../../src/assets'

PLATES = [
    ('out-dark-cut.png', 'athena-agent'),
    ('out-light-cut.png', 'athena-agent-light'),
    ('out-dark.png', 'athena-agent-whole'),
    ('out-light.png', 'athena-agent-whole-light'),
]

for src, stem in PLATES:
    im = Image.open(src).convert('RGBA')
    for size, q, suffix in ((BIG, Q_BIG, ''), (SMALL, Q_SMALL, '-1024')):
        out = f'{OUT}/{stem}{suffix}.webp'
        im.resize((size, size), Image.LANCZOS).save(out, 'WEBP', quality=q, method=6)
        print('%-46s %d  q%d' % (out, size, q))
