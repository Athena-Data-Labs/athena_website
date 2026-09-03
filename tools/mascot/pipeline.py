"""Turn one generated portrait into the site's mascot assets.

Keys the magenta ground, snaps every colour to the brand palette, locates the
sphere she is holding, and writes a dark/light pair plus the same pair with the
sphere cut to transparent so the live collision field can show through it.
"""
import sys, json
import numpy as np
from PIL import Image
from lib import flood, border_seed, dilate, erode, components

SRC, OUT = sys.argv[1], sys.argv[2]
SEED = (int(sys.argv[3]), int(sys.argv[4]))          # y, x inside the sphere
# Optional measured circle. Automatic fitting works on flat cel art, where the
# sphere is one connected fill with a clean ink ring. Hatched art defeats every
# version of it: flooding fragments on the hatch lines, a morphological close is
# a knife edge between under-filling and bridging into the shirt, and a Hough
# score saturates because ink is everywhere inside a hatched mass. When that
# happens the circle is measured off the silhouette by eye and passed in.
FIXED = tuple(float(v) for v in sys.argv[5:8]) if len(sys.argv) > 7 else None

def hx(s): return np.array([int(s[i:i+2], 16) for i in (1, 3, 5)], np.float32)
def lum(c):
    c = np.asarray(c, float) / 255.
    c = np.where(c <= .03928, c / 12.92, ((c + .055) / 1.055) ** 2.4)
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]
def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + .05) / (min(la, lb) + .05)

a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
H, W, _ = a.shape
edge = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3),
                       a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
B = np.median(edge, 0)

# ── key ────────────────────────────────────────────────────────────────────
# Flood from the border rather than threshold on colour distance: her copper
# lock sits only ~64 units from the magenta ground, so a global threshold reads
# it as a half-transparent edge and despills it to yellow. Connectivity cannot.
d = np.sqrt(((a - B) ** 2).sum(2))
bg = flood(d < 45, border_seed((H, W)))
for size, comp in components((d < 45) & ~bg):
    if size >= 30:
        bg |= comp
band = dilate(bg, 2) & ~bg
alpha = np.ones((H, W), np.float32)
alpha[bg] = 0.0
alpha[band] = np.clip((d[band] - 20) / 65.0, 0, 1)
rgb = a.copy()
sel = band & (alpha > 0.05)
rgb[sel] = np.clip((a[sel] - (1 - alpha[sel])[:, None] * B) / alpha[sel][:, None], 0, 255)
opaque = alpha > 250 / 255
# The ground creeps three pixels *past* the alpha edge. Measured ring by ring
# inward from the silhouette, the mean colour runs (79,36,55), (42,11,23),
# (33,12,18), (27,12,15) before settling neutral — magenta, at a blue-over-red
# ratio matching the ground, on pixels the key calls fully opaque because they
# are far too dark to be within 45 of a bright ground. Cluster on the clean
# interior only; the rim is filled from inside, below.
solid = ~dilate(~opaque, 3)

# ── quantise ───────────────────────────────────────────────────────────────
X = rgb[solid]
rng = np.random.default_rng(7)
C = X[rng.choice(len(X), 24, replace=False)]
def assign(P, C):
    out = np.empty(len(P), np.int32)
    for s in range(0, len(P), 100000):
        c = P[s:s + 100000]
        out[s:s + 100000] = np.argmin(((c[:, None, :] - C[None]) ** 2).sum(2), 1)
    return out
for _ in range(60):
    lbl = assign(X, C)
    for k in range(len(C)):
        m = lbl == k
        if m.any():
            C[k] = X[m].mean(0)

# The dark plate's shadows are lifted well off the page's own black, and that
# is a decision about the drawing rather than a taste.
#
# Ink used to sit at #0B0E14 — a hair from the page background. That worked
# while the figure was lit flat and its shadows were a minority of the picture.
# Relighting her from the sphere alone made shadow most of the drawing, and all
# of it then dissolved into the page. Ink has to be lighter than the paper it
# sits on, and on this site the paper is black.
#
# ── two tone ladders, read by tone ─────────────────────────────────────────
# Clusters are placed on a ladder by *luminance rank*, not snapped to whichever
# brand colour is nearest in RGB.
#
# The nearest-in-RGB snap this replaces looks reasonable and is wrong for dark
# art, because at low luminance RGB distance is dominated by hue. Measured on
# the plate it produced: her crest's four tone clusters span 29.6 L* units in
# the source and 8.9 after the snap — and it is a convergence, not merely a
# compression. The near-blacks were pushed *up* (L* 1.8 -> 11.2) while the
# mid-tone feather fill was pushed *down* (31.4 -> 20.1), because the nearest
# brand colour to a desaturated mid-dark blue-grey is `navyDeep`, which is
# darker than the shirt it ought to be lighter than. Line and surface arrive at
# the same value, the hatching stops reading as line work, and the crest becomes
# one moulded lump — it reads as clay rather than as feathers. The old palette
# also had a hole with nothing at all between L 0.030 and L 0.159, which is
# exactly the band a hatched crest's mid-tones occupy.
#
# So: sort each family's clusters by L*, normalise, and read the ladder at that
# position. Tone order is preserved by construction and the whole ladder gets
# used. The light plate is the same position read from a second ladder, which is
# what keeps the two variants the same drawing rather than two drawings.
COOL_D = ['#0A1420', '#18202C', '#28313F', '#3C4757', '#556274', '#697C93', '#D7DFE7']
WARM_D = ['#1A0D0B', '#3A211A', '#6B3A28', '#A85A38', '#C98A6A', '#F3CBB4', '#FCEEE2']
COOL_L = ['#0A101A', '#141C28', '#1F2A38', '#2E3B4C', '#455465', '#697C93', '#9FB0C2']
WARM_L = ['#180C0A', '#331B15', '#5E3323', '#A85A38', '#C08060', '#E9B296', '#F5D8C4']

def lstar(c):
    y = lum(c)
    return 116 * y ** (1 / 3) - 16 if y > 0.008856 else 903.3 * y

def read(ladder, p):
    """Sample a ladder of hex stops at 0..1, interpolating between stops."""
    stops = np.array([hx(s) for s in ladder])
    t = np.clip(p, 0, 1) * (len(stops) - 1)
    i = min(int(t), len(stops) - 2)
    return stops[i] + (stops[i + 1] - stops[i]) * (t - i)

# Warm or cool by hue, with a margin. `c[0] > c[2]` on its own is a coin flip
# for the near-blacks — the deepest cluster here is 130k pixels at R-B = +0.6 —
# and sending the drawing's outline down the warm ladder wraps the whole crest
# in a rust halo. Neutral belongs on the cool ladder: she is lit warm by the
# sphere, so her shadows and her line work should read cool by contrast, which
# is also the more expensive-looking of the two mistakes.
warm = (C[:, 0] - C[:, 2]) > 10

# Placement is by *absolute* lightness times a gain, not by normalising each
# family across its own extremes.
#
# Normalising min-to-max looks like the obvious way to use a whole ladder and it
# has a trapdoor: it forces some cluster onto the top rung whether or not the
# drawing has anything that bright. This art is lit by one warm sphere, so every
# highlight in it is warm and the cool family is nothing but shadow and
# mid-tone — its brightest cluster is #585864, L* 38. Stretching that onto a
# rung meant for a specular lifted it to L* 88, a seven-fold jump, and the
# brightest cool thing in the drawing turned out to be the little wedges of grey
# at the base of each V between the crest slats. They came out near-white:
# small, hard-edged, brighter than the helmet, and impossible to stop looking at
# once seen.
#
# A gain keeps the drawing's own tonal relationships and states the one thing
# the plate is actually for — lifting engraved art off a black page far enough
# to read — as a single number. Anything the ladder cannot reach clamps at its
# ends instead of dragging a whole family with it.
GAIN = 1.35

def place(ladder, c):
    """Ladder position whose lightness is this colour's, gained and clamped."""
    ts = np.linspace(0, 1, 257)
    ls = np.array([lstar(read(ladder, t)) for t in ts])
    return float(np.interp(lstar(c) * GAIN, ls, ts))

pos = np.array([place(WARM_D if warm[k] else COOL_D, C[k]) for k in range(len(C))])

PAL_D = np.array([read(WARM_D if warm[k] else COOL_D, pos[k]) for k in range(len(C))])
PAL_L = np.array([read(WARM_L if warm[k] else COOL_L, pos[k]) for k in range(len(C))])


def blend(P, PAL):
    """Palette colour per pixel, mixed between its two nearest clusters.

    Snapping each pixel to one rung is what a quantiser normally does and it
    destroys anything thin. The loose strand of hair on her right is about a
    dozen pixels across, with an antialiased edge and a gradient down its
    length: hard assignment stair-steps that edge and breaks the gradient into
    bands, and the strand stops looking drawn and starts looking rendered at too
    low a resolution.

    An antialiased pixel is not a third colour, it is a *mixture* of two — so
    recover the mixture instead of picking a winner. Project the pixel onto the
    segment between its two nearest cluster centres, and lay the same fraction
    down between those two clusters' palette colours. Flat regions are
    unaffected, because there the second cluster is far away and the projection
    lands at an end. Only the pixels that were always a blend come back as one.
    """
    out = np.empty((len(P), 3), np.float32)
    for s in range(0, len(P), 100000):
        c = P[s:s + 100000]
        d = ((c[:, None, :] - C[None]) ** 2).sum(2)
        i1 = np.argmin(d, 1)
        d[np.arange(len(c)), i1] = np.inf
        i2 = np.argmin(d, 1)
        a1, a2 = C[i1], C[i2]
        v = a2 - a1
        t = np.clip(((c - a1) * v).sum(1) / np.maximum((v * v).sum(1), 1e-6), 0, 1)
        out[s:s + 100000] = PAL[i1] * (1 - t[:, None]) + PAL[i2] * t[:, None]
    return out

# Every pixel the figure covers, not only the ones clean enough to cluster —
# and the rim takes its colour from inside by diffusion, not by rule.
#
# It has to come from inside: over-subtracting magenta from a dark edge leaves a
# red-dominant residue, so a rim quantised on its own terms draws a rust hairline
# right around her. The first version of this took the *darkest* label within
# reach, on the reasoning that a silhouette on engraved art is an ink line. That
# is true of the outside of the figure and false of everything else. The loose
# strand of hair by her cheek is twelve pixels across against the keyed ground,
# so three pixels off each side went to ink and half the strand came back as
# outline: stair-stepped, banded, no taper. A rule about the outside of a figure
# had been quietly applied to the inside of one.
#
# Diffusing the palette colour outward has no such opinion. Next to the
# silhouette the neighbouring colour *is* the ink line, so the edge still reads
# as drawn; next to a hair strand it is the strand, so the strand keeps its own
# colour and its width. Both plates diffuse together, from the same mask.
labelled = np.full((H, W), -1, np.int32)
labelled[solid] = lbl
def plate(pal):
    """Palette image: blended inside, diffused across the keyed rim."""
    v = np.zeros((H, W, 3), np.float32)
    v[solid] = blend(rgb[solid], pal)
    known = solid.copy()
    todo = (alpha > 0) & ~known
    for _ in range(8):
        if not todo.any():
            break
        acc = np.zeros((H, W, 3), np.float32)
        cnt = np.zeros((H, W), np.float32)
        for sy, sx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            acc += np.roll(np.where(known[..., None], v, 0), (sy, sx), (0, 1))
            cnt += np.roll(known.astype(np.float32), (sy, sx), (0, 1))
        take = todo & (cnt > 0)
        v[take] = acc[take] / cnt[take, None]
        known |= take
        todo &= ~take
    return v, known

flat, filled = plate(PAL_D)

# ── locate the sphere ──────────────────────────────────────────────────────
# The cool family is the sphere's own vocabulary: lit across its upper half and
# shaded below, and both of those land cool.
cool = np.isin(labelled, np.nonzero(~warm)[0]) & solid

# Hatching quantises to ink and cuts the fill into hundreds of islands, so a
# flood stops a few pixels from its seed, and a morphological close is a knife
# edge: one radius under-fills, the next bridges into the shirt. March outward
# from the seed instead and take the last cool pixel along each ray. Rays her
# fingers block come back short, and the trimmed fit below discards them.
cy0, cx0 = SEED
pts = []
for th in np.linspace(0, 2 * np.pi, 720, endpoint=False):
    ux, uy = np.cos(th), np.sin(th)
    last = 0.0
    for rad in np.arange(6.0, 240.0, 1.0):
        px, py = int(round(cx0 + ux * rad)), int(round(cy0 + uy * rad))
        if not (0 <= px < W and 0 <= py < H):
            break
        if cool[py, px]:
            last = rad
        elif last and rad - last > 16:      # a real gap, not a hatch line
            break
    if last:
        pts.append((cx0 + ux * last, cy0 + uy * last))
pts = np.array(pts, float)
x, y = pts[:, 0], pts[:, 1]


keep = np.ones(len(x), bool)
for _ in range(0 if FIXED else 8):
    A = np.c_[x[keep], y[keep], np.ones(int(keep.sum()))]
    sol, *_ = np.linalg.lstsq(A, x[keep] ** 2 + y[keep] ** 2, rcond=None)
    cx, cy = sol[0] / 2, sol[1] / 2
    r = np.sqrt(sol[2] + cx ** 2 + cy ** 2)
    res = np.abs(np.hypot(x - cx, y - cy) - r)
    keep = res < max(1.5, 1.5 * np.median(res[keep]))
if FIXED:
    cx, cy, r = FIXED
    print('circle measured: cx=%.1f cy=%.1f r=%.1f' % (cx, cy, r))
else:
    print('rim samples %d, kept %d  circle cx=%.1f cy=%.1f r=%.1f  residual %.2f px'
          % (len(x), int(keep.sum()), cx, cy, r, float(np.median(res[keep]))))

# Cut the disc geometrically. Colour-flooding a hatched sphere would leave a web
# of ink behind, so the disc goes as a circle and her hands are lifted back out.
#
# What counts as a hand is the *whole warm family*, not its lit half. Keying on
# lit skin alone loses every shaded part of a finger — the underside of a
# fingertip, the crescent at the base of a nail, the shadow a knuckle throws —
# and those are exactly the parts that touch the sphere. Cut them and the hands
# stop resting on the sphere and start sinking into it, with the nails the first
# thing to go, because a nail is a light shape whose only definition is the dark
# line around it.
gy, gx = np.mgrid[0:H, 0:W]
disc = np.hypot(gx - cx, gy - cy) <= r * 0.985
handish = np.isin(labelled, np.nonzero(warm)[0]) & solid
# Only warm that reaches out of the disc. Fingers enter the sphere from
# outside it, so every real one is part of a region that crosses the rim;
# anything warm and entirely enclosed is inside the glass, not in front of it.
# Without this a bright core drawn inside the sphere — a flame, a spark, the
# glow itself — is preserved as an island floating in the middle of the hole
# the live collision is supposed to show through.
reaching = np.zeros_like(disc)
for _size, comp in components(handish):
    if (comp & ~disc).any():
        reaching |= comp
fingers = dilate(reaching & disc, 4) & disc
# Then close the ink the hands enclose. A nail's outline, the seam between two
# fingers and the hatching inside a palm are all cool, so the warm test skips
# them and leaves them as holes punched through the hand for the collision to
# shine out of. Anything inside the disc that cannot reach the rim without
# crossing a hand is under the hand.
rim = disc & ~erode(disc, 2)
outside = flood(disc & ~fingers, disc & ~fingers & rim)
fingers |= disc & ~fingers & ~outside
print('disc %d px, hands preserved %d px' % (int(disc.sum()), int(fingers.sum())))
cut = disc & ~fingers

# A contact shadow, baked into the plate rather than added in CSS.
#
# The hole is where the live collision shows through, and light coming through
# it runs at full strength right up to the edge of her fingers. Nothing does
# that. Where a hand meets a lit sphere the light is occluded just before the
# contact, and the absence of that gradient is most of why hands laid over a
# bright hole read as cut out and pasted on rather than as resting on anything.
#
# It belongs in the plate because the plate already knows exactly where her
# hands are, to the pixel, and a CSS layer would have to be told — and told
# again every time the drawing changes. These are cut pixels given a little
# opacity back, in the ladder's darkest ink, falling off over `CONTACT` pixels.
# `CONTACT` is priced against the drawing's own line weight, not chosen for
# effect. Measured outward from lit flesh, the ink around a finger is three
# pixels at full alpha — rings 4 to 6, matching the source almost exactly — and
# this shadow adds its own band beyond that. At 13 the two together read as a
# heavy contour rather than as light being occluded, which is the wrong note
# entirely for engraved line art.
#
# `FALLOFF` above 1 is what makes it read as occlusion rather than as a smudge:
# light returns quickly once there is any gap, so the shadow has to be dense in
# the first two or three pixels and nearly gone by the middle of its reach. A
# linear ramp over the same distance spreads an even grey wash around the thumb.
CONTACT, OCCLUSION, FALLOFF = 9, 0.62, 2.1
reach = np.full((H, W), CONTACT + 1, np.int32)
cur = fingers.copy()
for step in range(1, CONTACT + 1):
    nxt = dilate(cur, 1)
    reach[nxt & ~cur & cut] = step
    cur = nxt
shade = np.clip(1.0 - (reach - 1) / CONTACT, 0, 1) ** FALLOFF * (reach <= CONTACT)
print('contact shadow %d px' % int((shade > 0).sum()))

# ── write ──────────────────────────────────────────────────────────────────
for name, pal in (('dark', PAL_D), ('light', PAL_L)):
    v = flat if name == 'dark' else plate(pal)[0]
    img = np.dstack([v, alpha * 255]).astype(np.uint8)
    Image.fromarray(img, 'RGBA').save(f'{OUT}-{name}.png')
    holed = img.copy()
    holed[cut, 3] = 0
    ink = read(COOL_D if name == 'dark' else COOL_L, 0.0)
    band = shade > 0
    holed[band, :3] = ink
    holed[band, 3] = (shade[band] * OCCLUSION * 255).astype(np.uint8)
    Image.fromarray(holed, 'RGBA').save(f'{OUT}-{name}-cut.png')

BG_D, BG_L = hx('#0A0E14'), hx('#F8FAFC')
order = np.argsort(pos + np.where(warm, 10, 0))
print('\n%-4s %-5s %-6s %-9s %6s   %-9s %6s  %8s'
      % ('#', 'fam', 'pos', 'dark', 'ratio', 'light', 'ratio', 'px'))
count = np.bincount(lbl, minlength=len(C))
for k in order:
    hd = '#%02X%02X%02X' % tuple(PAL_D[k].astype(int))
    hl = '#%02X%02X%02X' % tuple(PAL_L[k].astype(int))
    print('%-4d %-5s %-6.3f %-9s %5.2f:1   %-9s %5.2f:1  %8d'
          % (k, 'warm' if warm[k] else 'cool', pos[k], hd, ratio(PAL_D[k], BG_D),
             hl, ratio(PAL_L[k], BG_L), count[k]))

json.dump({'source': SRC, 'size': [W, H],
           'sphere': {'cx': round(float(cx), 1), 'cy': round(float(cy), 1),
                      'r': round(float(r), 1)},
           'ladders': {'coolDark': COOL_D, 'warmDark': WARM_D,
                       'coolLight': COOL_L, 'warmLight': WARM_L},
           'clusters': [{'family': 'warm' if warm[k] else 'cool',
                         'pos': round(float(pos[k]), 4),
                         'dark': '#%02X%02X%02X' % tuple(PAL_D[k].astype(int)),
                         'light': '#%02X%02X%02X' % tuple(PAL_L[k].astype(int))}
                        for k in range(len(C))]},
          open(f'{OUT}.json', 'w'), indent=2)
