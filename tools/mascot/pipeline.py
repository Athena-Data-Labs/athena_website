"""Turn one generated portrait into the site's mascot assets.

Keys the magenta ground, snaps every colour to the brand palette, locates the
sphere she is holding, and writes a dark/light pair plus the same pair with the
sphere cut to transparent so the live collision field can show through it.
"""
import sys, json
import numpy as np
from PIL import Image
from lib import flood, border_seed, dilate, erode, close, components

# Render scale. The drawing is 1024 square and she is laid out as a
# viewport-tall square, so on any 2x display she is asked for about 1800 device
# pixels and the browser stretches 1024 to fill them. That is the softness, and
# it is not in the plate — it is in the last resample, done bilinearly at draw
# time by something that does not know what the picture is.
#
# Rendering the plate at 2x does not invent detail the drawing does not have,
# and is worth doing anyway for two separate reasons. The resample is moved from
# the browser to Lanczos here, which is a better filter run once instead of on
# every paint. And everything this file decides *geometrically* — the disc, the
# hand mask, the contact shadow, the palette boundary between two clusters — is
# then decided at 2x and is genuinely twice as sharp, because none of it was
# sampled from the source in the first place.
SCALE = 1
if '--scale' in sys.argv:
    i = sys.argv.index('--scale')
    SCALE = int(sys.argv[i + 1])
    del sys.argv[i:i + 2]
# Overrides `SNAP` below. Parsed here with `--scale` rather than where it is
# used, because the positional arguments are read between the two and a flag
# left in `argv` is silently taken for one of them.
SNAP_OVERRIDE = None
if '--snap' in sys.argv:
    i = sys.argv.index('--snap')
    SNAP_OVERRIDE = float(sys.argv[i + 1])
    del sys.argv[i:i + 2]
# See `SOFT` below. Parsed here for the same reason.
# How many rungs the drawing is quantised onto. See the k-means below.
CLUSTERS = 40
if '--clusters' in sys.argv:
    i = sys.argv.index('--clusters')
    CLUSTERS = int(sys.argv[i + 1])
    del sys.argv[i:i + 2]
SOFT_OVERRIDE = None
if '--soft' in sys.argv:
    i = sys.argv.index('--soft')
    SOFT_OVERRIDE = float(sys.argv[i + 1])
    del sys.argv[i:i + 2]
def sc(n):
    """A distance in source pixels, at render scale."""
    return max(1, int(round(n * SCALE)))

SRC, OUT = sys.argv[1], sys.argv[2]
SEED = (int(sys.argv[3]) * SCALE, int(sys.argv[4]) * SCALE)   # y, x in the sphere
# Optional measured circle. Automatic fitting works on flat cel art, where the
# sphere is one connected fill with a clean ink ring. Hatched art defeats every
# version of it: flooding fragments on the hatch lines, a morphological close is
# a knife edge between under-filling and bridging into the shirt, and a Hough
# score saturates because ink is everywhere inside a hatched mass. When that
# happens the circle is measured off the silhouette by eye and passed in.
FIXED = tuple(float(v) * SCALE for v in sys.argv[5:8]) if len(sys.argv) > 7 else None
# Optional: a second drawing of the *same figure* to take the hand/sphere
# separation from. See "Where the hands come from" below.
HANDS_FROM = sys.argv[8] if len(sys.argv) > 8 else None

def hx(s): return np.array([int(s[i:i+2], 16) for i in (1, 3, 5)], np.float32)
def lum(c):
    c = np.asarray(c, float) / 255.
    c = np.where(c <= .03928, c / 12.92, ((c + .055) / 1.055) ** 2.4)
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]
def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + .05) / (min(la, lb) + .05)

_src = Image.open(SRC).convert('RGB')
if SCALE != 1:
    _src = _src.resize((_src.width * SCALE, _src.height * SCALE), Image.LANCZOS)
a = np.asarray(_src).astype(np.float32)
H, W, _ = a.shape
edge = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3),
                       a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
B = np.median(edge, 0)

# ── key ────────────────────────────────────────────────────────────────────
# Flood from the border rather than threshold on colour distance: her copper
# lock sits only ~64 units from the magenta ground, so a global threshold reads
# it as a half-transparent edge and despills it to yellow. Connectivity cannot.
#
# But the ground is *lit*. The sphere throws a glow onto the paper around it,
# and inside that glow the ground stops being the colour the border says it is:
# measured, the paper under her chin runs (175,119,96) against a border median
# of (147,43,102), 95 units away — further from its own background than her
# copper hair is. Keyed on one median it survives as figure, and it comes out as
# a flat tan lobe wedged between her chin and the sphere, reading as a stray
# light exactly where the drawing has none.
#
# No global colour test can fix that, because inside the glow the ground and her
# skin arrive at the same colour: lit paper (208,159,118) against lit jaw
# (217,168,126). Hue does not separate them, luminance does not, nothing does.
# What separates them is the same thing that separated them before — the drawing
# has an ink contour along her jaw and none across its own paper.
#
# So the flood is run with hysteresis: seeded only where the ground is
# unambiguous, then grown through a looser threshold that can walk the glow's
# gradient. A loose threshold cannot start a region, so nothing inside the
# figure can claim one; it can only continue ground the border already proved.
#
# Loose distance alone is not enough, and the thing it breaks is not subtle. Her
# forearm's mid-tone is a greyish mauve that sits within 50 units of the magenta
# ground, and it is connected to it, so at any threshold that reaches the pocket
# the flood also eats several thousand pixels out of the middle of her arm.
#
# What licenses the extra reach is the glow being *warm*: ground the tight key
# misses is ground the glow has warmed, and warmth is the evidence for that, not
# distance. So the grow is gated on it. The pocket runs R-B +89 and the forearm
# mid-tone +29, and the contour the flood would have to cross to reach anything
# else is ink, which is warm at neither. Gated, the pocket comes back whole
# (2137 px of a possible 2146) and the forearm and face lose nothing at all — 0
# px, at every threshold from 90 to 150.
TIGHT, LOOSE, GLOWED = 45, 90, 55
d = np.sqrt(((a - B) ** 2).sum(2))
bg = flood(d < TIGHT, border_seed((H, W)))
bg = flood((d < LOOSE) & ((a[..., 0] - a[..., 2]) > GLOWED), bg)
# Enclosed pockets of ground — between two crest slats, inside the crook of a
# thumb — never reach the border, so they are adopted by colour. The test has to
# be on the pocket's *mean*, not on its pixels: a per-pixel threshold is a
# guarantee that every patch sitting exactly at the threshold gets taken, and
# the darkest shadow inside her copper lock sits at 42 against a cut of 45. It
# was adopted, and it punched a three-pixel hole clean through the strand —
# ground showing through her hair, which read as the drawn line breaking. Real
# enclosed ground is not near the cut, it is the ground.
for size, comp in components((d < TIGHT) & ~bg):
    if size >= 30 * SCALE * SCALE and d[comp].mean() < TIGHT * 0.5:
        bg |= comp

# Ground too narrow to key is not kept as ground.
#
# The lock over her eye is drawn as two strands with a sliver of paper between
# them, and that sliver is about a pixel wide in the source. A flood has to
# answer yes or no per pixel, so down a gap that thin it answers yes here, no
# there, yes again — and the mask comes back with a dotted line of holes
# threaded through her hair. Composited, those are the saw teeth: a chain of
# background-coloured specks along the one part of the drawing thin enough to
# have no margin for the mistake.
#
# A gap the key cannot resolve is a gap that should not be in the mask, and the
# drawing does not need it to be: the ink line between the two strands is still
# there in the *colour*, which is what actually draws them apart. So ground
# narrower than the close's diameter is filled, and the lock becomes one clean
# silhouette with a line down it, which is what it looks like on paper.
#
# One pixel of radius, which is two of width at the source's own scale. It fills
# 1208 pixels of four million and touches nothing else — every real gap in this
# drawing, between her fingers and between the crest's slats, is an order of
# magnitude wider than the ones being closed.
bg = ~close(~bg, sc(1))
band = dilate(bg, sc(2)) & ~bg

# The feather and the despill are then measured against the ground *as it is
# there*, not against the median. A band pixel on lit paper is 95 units from the
# median and would take alpha 1 — no feather at all — while subtracting the
# median from it removes a magenta the glow had already replaced. Diffusing the
# ground's own colour inward from the keyed pixels costs four lines and makes
# both correct by construction.
Bloc = np.where(bg[..., None], a, 0.0)
known = bg.copy()
for _ in range(sc(4)):
    acc = np.zeros((H, W, 3), np.float32)
    cnt = np.zeros((H, W), np.float32)
    for sy, sx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        acc += np.roll(np.where(known[..., None], Bloc, 0), (sy, sx), (0, 1))
        cnt += np.roll(known.astype(np.float32), (sy, sx), (0, 1))
    take = ~known & (cnt > 0)
    Bloc[take] = acc[take] / cnt[take, None]
    known |= take
Bloc[~known] = B
dl = np.sqrt(((a - Bloc) ** 2).sum(2))

alpha = np.ones((H, W), np.float32)
alpha[bg] = 0.0
alpha[band] = np.clip((dl[band] - 20) / 65.0, 0, 1)
rgb = a.copy()
sel = band & (alpha > 0.05)
rgb[sel] = np.clip((a[sel] - (1 - alpha[sel])[:, None] * Bloc[sel]) / alpha[sel][:, None], 0, 255)
opaque = alpha > 250 / 255
# The ground creeps three pixels *past* the alpha edge. Measured ring by ring
# inward from the silhouette, the mean colour runs (79,36,55), (42,11,23),
# (33,12,18), (27,12,15) before settling neutral — magenta, at a blue-over-red
# ratio matching the ground, on pixels the key calls fully opaque because they
# are far too dark to be within 45 of a bright ground. Cluster on the clean
# interior only; the rim is filled from inside, below.
#
# Eroding by three is right for the outer silhouette and destroys anything thin,
# and the difference is not one of degree. The loose strand of hair over her eye
# runs 6 to 11 pixels wide against the keyed ground. Eroded by three it keeps a
# core of five pixels on some rows, two on others, and none at all below her
# cheekbone — so on those rows the strand has no colour of its own left to
# diffuse from and takes one from the nearest thing that does, which is her
# face. Measured down its length, the surviving core alternates between the
# strand's bright centre and its dark flank as the width wanders, and the
# diffusion then paints whole segments cream and the next ones brown. That is
# the ladder of light and dark rectangles down her hair, and it is neither
# banding nor resolution: it is a mask eating a structure narrower than itself.
#
# The radius was a proxy for contamination, and the contamination can be tested
# for directly. What the ground leaves behind is *its own hue*: magenta runs
# blue over green, and nothing in the drawing that gets near the silhouette
# does. Measured ring by ring on dark pixels, B-G above the figure's own
# interior baseline: +14.7 at ring one, +8.2 at ring two, +5.1 at ring three.
# On the strand, +3.6 at ring one and at or below baseline from ring two on —
# which is what a thin structure against a keyed ground should look like, since
# there is no thick dark mass beside it for the ground to ring against.
#
# So a pixel keeps its own colour if it carries no magenta, and is left to the
# diffusion if it does. The one-pixel erosion still goes, because the outermost
# ring is partial coverage rather than contamination and no colour test reaches
# it. Her navy crest reads as cast by this test and is diffused, which is what
# it already was.
#
# Measured against the erosion it replaces, on the strand: correlation with the
# source's own tone 0.54 -> 0.95, and the fraction of steps down it where the
# tone does not change at all — the flat top of each rectangle — 0.152 -> 0.077,
# against 0.021 for the source. The rust hairline the diffusion was written to
# prevent does not come back: dark silhouette rim pixels run R-B -0.3 against
# -4.0 before. Dropping the erosion outright instead scores about the same on
# the strand (0.93) and puts the rim at +10.1, which is the hairline, visible.
#
# Eight is where the two populations separate and there is room on either side:
# at 4 the strand still scores 0.94 and at 14 the rim is back to +7.4.
core = ~dilate(~opaque, sc(3))
CAST_MAX = 8.0
solid = core | (opaque & ((rgb[..., 2] - rgb[..., 1]) < CAST_MAX)
                & ~dilate(~opaque, sc(1)))

# ── quantise ───────────────────────────────────────────────────────────────
X = rgb[solid]
rng = np.random.default_rng(7)
# Forty rather than twenty-four, and it is a fix for banding rather than a
# fidelity setting.
#
# Every ramp in the drawing is laid down as a walk between cluster centres, so
# the coarser the centres, the bigger the jump at each hand-off. At 24 the
# nearest-neighbour spacing was 31 units and the jumps were plainly visible:
# measured as the variation in step size along a path the drawing shades
# smoothly, her shoulder ran 3.51 against the source's 1.73 — the change
# arriving in lumps rather than evenly, which is what banding is. At 40 the
# spacing is 22.7 and the same path measures 1.88, which is the source.
#
# It costs nothing that matters. Chroma is unchanged (28.6 against 28.3), the
# ladders below place 40 rungs as happily as 24, and the run is no slower in any
# way anyone would notice. Softening the assignment instead was tried first and
# was worse on both counts: it fixed the same broad areas, did nothing for the
# thin strand of hair the banding is most visible on, and pulled mean chroma
# down to 25.1 because every pixel became a little bit of every other cluster.
C = X[rng.choice(len(X), CLUSTERS, replace=False)]
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

# What the soft assignment's width has to be measured against: how far apart the
# centres actually landed. Printed rather than assumed, because it is a property
# of this drawing's gamut and moves with every redraw.
_nn = np.sort(np.sqrt(((C[:, None, :] - C[None]) ** 2).sum(2)), 1)[:, 1]
print('cluster spacing: nearest-neighbour median %.1f  min %.1f  max %.1f'
      % (np.median(_nn), _nn.min(), _nn.max()))

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

# Warm or cool by hue, with a wide margin. `c[0] > c[2]` on its own is a coin
# flip for the near-blacks — the deepest cluster here is 130k pixels at
# R-B = +0.6 — and sending the drawing's outline down the warm ladder wraps the
# whole crest in a rust halo. Neutral belongs on the cool ladder: she is lit
# warm by the sphere, so her shadows and her line work should read cool by
# contrast, which is also the more expensive-looking of the two mistakes.
#
# A wider margin is not the way to keep her *armour* off the warm ladder, and
# that is worth writing down because it looks like it is. Her helmet is drawn as
# neutral steel — the dome measures R-B -4 on the source, the brow band +6 — but
# it is lit by the same warm sphere as everything else, so its lit planes drift
# warm and cross this margin. The plate came back with the helmet in rose gold,
# reading as bronze jewellery rather than as metal.
#
# Every attempt to fix that here failed, and each failed somewhere else:
#
#   - A wider margin (34) does take the helmet cool, and takes her hair with it.
#     Hair in shadow and lit steel are both dark-ish and mildly warm; there is no
#     cut between them. The shaded mass by her ear went grey and the drawing lost
#     the one warm note it has above the shoulders.
#   - Normalising R-B by value should separate material from lighting — a warm
#     light adds R-B in proportion to how much of it a surface catches — but a
#     specular highlight is the *light's* colour on any material and so is
#     desaturated by construction. Normalising sends every highlight cool
#     regardless of what it sits on, and her fingers come back with pale blue
#     rims. Skin with cold highlights is a worse error than a warm helmet.
#   - A threshold sloped with brightness is the compromise between those two and
#     inherits both: at every setting, shaded hair and lit steel move together.
#
# They move together because they are the same thing to this test. What actually
# separates them is not which ladder they are on, it is how much colour they
# had: her hair is pigmented and her helmet is not. That is a per-pixel fact
# about the drawing, and it belongs to CHROMA below, which carries it exactly.
# A helmet on the warm ladder at the drawing's own saturation is a warm grey,
# which is what steel under a warm light is. So the margin stays small.
WARMTH = 10
warm = (C[:, 0] - C[:, 2]) > WARMTH

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
# to read — as a single number.
#
# It is applied as a *lift*, not a multiply. Multiplying overshoots the ladder
# at the top and clamps there, and a clamp is not a compression: it maps
# distinct clusters onto one rung and the two-nearest blend below then has
# nothing left to interpolate between, because both of a pixel's neighbours
# carry the same colour. Measured on the multiply, three warm clusters and two
# cool ones landed on their ladder's end — 66k pixels of her lit face and arm on
# a single cream, 113k pixels of line work on a single near-black. Those are the
# two places the plate looked banded and blocky, and they were the two ends of
# the range collapsing.
#
# A gamma lift does the same job with no end to clamp at: it raises the shadows,
# where the drawing needs the help, leaves the highlights the headroom they were
# already using, and is monotonic over the whole domain, so no two source tones
# can ever arrive at the same rung.
LIFT = 1.35

def place(ladder, c):
    """Ladder position for this colour's lightness, shadows lifted."""
    ts = np.linspace(0, 1, 257)
    ls = np.array([lstar(read(ladder, t)) for t in ts])
    lo, hi = ls[0], ls[-1]
    return float(np.interp(lo + (hi - lo) * (max(lstar(c), 0.0) / 100.0) ** (1 / LIFT),
                           ls, ts))

pos = np.array([place(WARM_D if warm[k] else COOL_D, C[k]) for k in range(len(C))])

PAL_D = np.array([read(WARM_D if warm[k] else COOL_D, pos[k]) for k in range(len(C))])
PAL_L = np.array([read(WARM_L if warm[k] else COOL_L, pos[k]) for k in range(len(C))])


# The ladder owns tone and hue. The drawing keeps its own chroma.
#
# One ladder per family means one saturation per lightness, and that is a
# stronger claim than the palette was ever meant to make. Her copper hair and
# her lit cheek sit at nearly the same lightness and are nothing like the same
# colour, so a ladder read by lightness alone hands them both the same rung and
# the hair comes out as skin. Measured on the multiply plate, the loose lock
# went from saturation 0.67 in the source to 0.40, and her lit cheek from 0.42
# to 0.23 — the ladder's top stops are cream, which is right for a specular and
# wrong for lit copper, and everything bright ended up there.
#
# So the palette colour keeps its value and its hue, and its saturation is drawn
# back toward the source pixel's own. Nothing leaves the brand hues; the drawing
# only gets to say how much colour it had.
#
# Weighted by value, because saturation is meaningless in the dark: at
# (12, 8, 10) it reads 0.33 and is nothing but JPEG noise, and restoring it puts
# coloured speckle through every shadow. Below `CFLOOR` the ladder is left to
# speak for itself and the weight ramps in above it.
#
# Restored in full, above that floor. A partial restore was a hedge, and the
# thing it was hedging against — the plate drifting back toward the source and
# away from the brand — does not happen, because hue and tone never move: only
# how much colour a pixel had. What it costs is the whole armour problem above.
# Her helmet is drawn near-neutral (R-B -4 on the dome), so at full restore it
# comes back near-neutral whichever ladder it landed on: brow band +12.5 on the
# source, +3.9 on the plate, against -11.7 for the widened margin that solved it
# by force. Her hair is drawn saturated and stays saturated — the lit lock at
# 0.595 against the source's 0.658, where the widened margin left it grey.
CHROMA, CFLOOR, CRAMP = 1.00, 60.0, 80.0

def chroma(pal, src):
    """`pal` recoloured to the source's saturation, at the ladder's value."""
    pv = pal.max(1)
    ps = np.where(pv > 0, (pv - pal.min(1)) / np.maximum(pv, 1e-6), 0.0)
    sv = src.max(1)
    ss = np.where(sv > 0, (sv - src.min(1)) / np.maximum(sv, 1e-6), 0.0)
    w = np.clip((pv - CFLOOR) / CRAMP, 0, 1) * CHROMA
    target = np.clip(ps + w * (ss - ps), 0, 1)
    # Rescale the pal->white distance so value and hue are untouched: a colour at
    # saturation s is v*(1-s) away from its own value at the least channel, so
    # scaling that gap by target/ps is exactly a saturation change.
    k = np.where(ps > 1e-4, target / np.maximum(ps, 1e-4), 0.0)[:, None]
    return np.clip(pv[:, None] - (pv[:, None] - pal) * k, 0, 255)


# How steeply a mixture is allowed to cross from one palette colour to the next,
# and it is `SCALE` because that is exactly what it undoes.
#
# Upsampling the source spreads every antialiased edge over twice as many
# pixels, so a plate rendered at 2x with the crossing left alone is not sharper
# than the 1x plate at all — it is the same physical softness measured on a
# finer grid, and the extra resolution buys only the geometry. Steepening the
# crossing by the same factor puts the ramp back to its original *width in
# source pixels*, which is where the drawing put it, and now it is drawn with
# twice the samples.
#
# It invents nothing. Flat regions are untouched, because there the second
# cluster is far away and `t` is already pinned at an end; on a ramp it only
# shortens the ramp. Much past the scale factor the antialiasing goes with it
# and thin strokes start to crawl.
SNAP = SNAP_OVERRIDE if SNAP_OVERRIDE is not None else float(SCALE)

# How far a pixel can see past its own two nearest clusters, in RGB distance.
#
# The two-nearest blend below recovers a mixture only when the mixture lies
# along the segment joining those two centres. A drawn edge does — it is
# literally two colours averaged — which is why it fixed the thin strokes it was
# written for. A broad, low-contrast *shading* ramp does not: it wanders through
# the gamut in its own direction, `t` sits pinned at an end for most of its
# length and then flips, and what should be a gradient comes out as plateaus
# with steps between them. Measured by walking a path and counting samples where
# the colour does not change at all: 24% of the source becomes 39% of the plate
# down the loose strand of hair, and 16% becomes 22% across her forehead. That
# is the blockiness, and it is not resolution — it is banding.
#
# So the assignment is made soft instead of nearest-two: every cluster gets a
# weight falling off with distance, and the output is their weighted palette
# colour. It is continuous in the input by construction, so no smooth ramp can
# come out stepped, and it costs nothing extra — the distances to all 24 centres
# were already computed to find the nearest two.
#
# The width is the thing to get right. Too tight and it is hard assignment
# again; too loose and every colour is the average of the whole palette and the
# drawing goes to mud. It is set against the actual spacing of the centres,
# printed at run time, rather than guessed.
SOFT = SOFT_OVERRIDE if SOFT_OVERRIDE is not None else 0.0


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
        d0 = d.copy()
        i1 = np.argmin(d, 1)
        d[np.arange(len(c)), i1] = np.inf
        i2 = np.argmin(d, 1)
        a1, a2 = C[i1], C[i2]
        v = a2 - a1
        t = np.clip(((c - a1) * v).sum(1) / np.maximum((v * v).sum(1), 1e-6), 0, 1)
        t = np.clip((t - 0.5) * SNAP + 0.5, 0, 1)
        mixed = PAL[i1] * (1 - t[:, None]) + PAL[i2] * t[:, None]
        if SOFT:
            w = np.exp(-d0 / (2.0 * SOFT * SOFT))
            mixed = (w / w.sum(1, keepdims=True)) @ PAL
        out[s:s + 100000] = chroma(mixed, c)
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
    # Until it converges, not for a fixed few passes. Anything thinner than the
    # erosion is *entirely* outside `solid` — a crest tip, the wisps at the hem,
    # the loose hairs by her jaw — so the colour has to travel the whole width of
    # it from the nearest place that could be clustered. A fixed eight passes
    # left 2.8k pixels never reached, and an unfilled pixel is not a subtle
    # error: it keeps the zero it was initialised with and prints as pure black
    # at full alpha, scattered over exactly the finest parts of the drawing.
    for _ in range(sc(64)):
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
    for rad in np.arange(6.0 * SCALE, 240.0 * SCALE, 1.0):
        px, py = int(round(cx0 + ux * rad)), int(round(cy0 + uy * rad))
        if not (0 <= px < W and 0 <= py < H):
            break
        if cool[py, px]:
            last = rad
        elif last and rad - last > 16 * SCALE:      # a real gap, not a hatch line
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
# The paper the sphere lights is not the sphere.
#
# She is drawn holding a glowing ball, and a glowing ball lights the paper
# around it. The key cannot take that paper: inside the glow it is a bright
# warm colour a hundred units from the magenta the border says the ground is —
# further from its own background than the ball's ink ring is (measured, 103
# against 95 to 120 across the band), so no threshold separates them and raising
# the flood's reach until it swallows the glow swallows the ball with it.
#
# What survives is an annulus of lit paper about 13% of the radius wide, held at
# one flat tone by the palette and cut off hard where the flood finally caught
# up. On the page that is a smooth pale ring around a hatched dome, with an edge
# of its own: two concentric spheres, which is exactly what it looks like.
#
# The circle passed in was measured off that silhouette, so it is the ring's
# outer edge and not the ball's. The ball ends at its ink line, and what tells
# the two apart is not colour but *texture*: the drawing is hatched and lit
# paper is not. Measured as the mean deviation from a 5x5 local mean, the dome
# runs 10.0 and the ring 0.75, and the change happens over three pixels at the
# ink line. So the ball's own radius is found by walking out until the texture
# dies, and smooth pixels beyond it are paper.
#
# Only out to `HALO_OUT`, and only where it is smooth, so nothing drawn is at
# risk: her fingers are hatched everywhere and the nearest of them is well
# outside this band in any case.
TEXTURED, HALO_OUT, HALO_FEATHER = 3.0, 1.5, sc(3)
_lm = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
_box = np.zeros_like(_lm)
for _dy in range(-sc(2), sc(2) + 1):
    for _dx in range(-sc(2), sc(2) + 1):
        _box += np.roll(np.roll(_lm, _dy, 0), _dx, 1)
_tex = np.abs(_lm - _box / (2 * sc(2) + 1) ** 2)
_rad = np.hypot(gx - cx, gy - cy)
_bin = _rad.astype(int)

# Where the ball ends is where its ink line ends, and a drawn rim is three
# unmistakable features in a row on a radial profile: a highlight, then a dark
# trough where the ink is, then the climb back out onto whatever is outside. So
# the edge is read as exactly that — the brightest ring on the outer half, the
# first minimum after it, the first maximum after that. Measured on this
# drawing: highlight at 0.73 of the circle passed in, ink at 0.77, edge at 0.81.
#
# Measured by eye instead, as it was, the circle comes back 208 for a ball that
# ends at 168 — because by eye the lit paper *is* the silhouette. Every number
# downstream inherited that: the disc the homepage's collision shows through has
# been a quarter too wide, and the closing panel drew its glass on a circle that
# was not the ball's.
#
# Read on the side away from her hand, because her fingers are in the profile
# otherwise and they have highlights and ink lines of their own.
_up = (alpha > 0.5) & (gy < cy - 0.2 * r)
_prof = np.array([_lm[_up & (_bin == _k)].mean()
                  if (_up & (_bin == _k)).any() else 0.0
                  for _k in range(int(r * 1.1))])
_prof = np.convolve(_prof, np.ones(sc(3)) / sc(3), 'same')
_lo, _hi = int(r * 0.55), int(r * 0.95)
_lit = _lo + int(np.argmax(_prof[_lo:_hi]))
_ink = _lit
while _ink + 1 < _hi and _prof[_ink + 1] < _prof[_ink]:
    _ink += 1
_edge = _ink
while _edge + 1 < _hi and _prof[_edge + 1] > _prof[_edge]:
    _edge += 1

# Everything smooth beyond that edge is paper the ball is lighting, not ball.
# Smooth is the test rather than bright, because the two are the same colour
# family by construction — the glow *is* the ball's light on the page — while
# the drawing is hatched everywhere and lit paper is not: measured, the dome
# runs 10.0 mean deviation from a 5x5 local mean and the ring 0.75. Her fingers
# are hatched too, and the nearest of them is outside this band in any case.
_out = (_rad > _edge) & (_rad < r * HALO_OUT)
_far = _rad >= r * HALO_OUT - sc(2)
_drawn = np.zeros_like(_out)
for _size, _comp in components(_out & (_tex >= TEXTURED) & (alpha > 0.5)):
    if _size >= 30 * SCALE * SCALE and (_comp & _far).any():
        _drawn |= _comp
halo = _out & ~dilate(_drawn, sc(2))
_soft = np.clip((_rad - _edge) / HALO_FEATHER, 0, 1)
alpha = np.where(halo, alpha * (1 - _soft), alpha)

# And the edge it leaves is a circle, because the ball is one.
#
# The drawing's outermost ink is hatched, so cutting it at the last opaque pixel
# leaves a fringe of loose strokes standing off the rim — texture that only read
# as texture while it had paper behind it. Against a page it reads as a bad cut.
# The circle is known to a pixel, so the last pixel of it is drawn as a circle:
# a two-pixel ramp centred on the edge, taken as a minimum so nothing anywhere
# else in the plate can be made *more* opaque by it, and skipped over anything
# the component test called drawn — a finger crossing the rim keeps its own
# silhouette.
TRUE = sc(2)
_round = np.clip((_edge + TRUE / 2 - _rad) / TRUE, 0, 1)
_near = (_rad > _edge - TRUE) & (_rad < r * HALO_OUT) & ~dilate(_drawn, sc(2))
alpha = np.where(_near, np.minimum(alpha, _round), alpha)
# The hole stays the circle that was measured, and only the ball's own radius is
# corrected. The two are different jobs. The hole has to enclose the ball with
# room to spare, because the hands are found below as the warm regions that
# cross its rim — which is how a finger in front of the sphere is told from a
# bright shape drawn inside it — and this ball is warm itself: cut close, the
# ball reads as a hand and nothing is cut at all. The ball's radius is what the
# closing panel draws its glass on, and there being flush is the whole point.
_hole = r * 0.985
print('sphere: measured %.0f, ink at %d, ball edge %d, hole %.0f; '
      'lit paper removed %d px'
      % (r, _ink, _edge, _hole, int((halo & (_soft > 0.5)).sum())))
r = float(_edge)

disc = _rad <= _hole
# ── where the hands come from ──────────────────────────────────────────────
# Normally: the warm family. Her hands are warm and the sphere is cool, so the
# two separate on hue and the connectivity test below does the rest.
#
# That holds only while the sphere is drawn cool. Re-lit versions of this figure
# exist where the sphere itself glows warm, and there the separation is not
# merely harder, it is *gone*: measured inside the disc, 98.7% of it reads warm,
# and a shaded finger (R-B +35) is less warm than the sphere's own mid-tone
# (+44). Luminance overlaps too (sphere 60-100, fingers 42-158), and so does
# local texture. No threshold exists, on any channel.
#
# But the re-lights are the *same drawing*: silhouettes differing by 0.62% of
# pixels, 83% of one's line art landing on the other's at zero shift. So the
# geometry can come from whichever version separates, and the pixels from
# whichever version is lit best. That is what HANDS_FROM is: not a fallback, a
# statement that occlusion is a property of the drawing rather than of the
# lighting pass.
if HANDS_FROM:
    _ref = Image.open(HANDS_FROM).convert('RGB')
    if SCALE != 1:
        _ref = _ref.resize((_ref.width * SCALE, _ref.height * SCALE), Image.LANCZOS)
    ref = np.asarray(_ref).astype(np.float32)
    if ref.shape[:2] != (H, W):
        sys.exit('hands reference is %dx%d, source is %dx%d' % (*ref.shape[1::-1], W, H))
    redge = np.concatenate([ref[:6].reshape(-1, 3), ref[-6:].reshape(-1, 3),
                            ref[:, :6].reshape(-1, 3), ref[:, -6:].reshape(-1, 3)])
    rB = np.median(redge, 0)
    rd = np.sqrt(((ref - rB) ** 2).sum(2))
    rbg = flood(rd < 45, border_seed((H, W)))
    for _size, comp in components((rd < 45) & ~rbg):
        if _size >= 30 * SCALE * SCALE:
            rbg |= comp
    handish = ((ref[..., 0] - ref[..., 2]) > 10) & ~rbg
    print('hands taken from %s' % HANDS_FROM.split('/')[-1])
else:
    handish = np.isin(labelled, np.nonzero(warm)[0]) & solid
# Whatever it came from, it cannot include paper the key has since dropped.
# `solid` and `labelled` were built before the ball's glow was taken off the
# plate, so without this the glow ring is still warm, still solid, and still
# joined to the ball — which makes the ball a warm region crossing the disc's
# rim, which is the definition of a hand below. Nothing was cut at all.
handish &= alpha > 0.5

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
fingers = dilate(reaching & disc, sc(4)) & disc
# Then close the ink the hands enclose. A nail's outline, the seam between two
# fingers and the hatching inside a palm are all cool, so the warm test skips
# them and leaves them as holes punched through the hand for the collision to
# shine out of. Anything inside the disc that cannot reach the rim without
# crossing a hand is under the hand.
rim = disc & ~erode(disc, sc(2))
outside = flood(disc & ~fingers, disc & ~fingers & rim)
fingers |= disc & ~fingers & ~outside
# The hole is the *ball*, not the disc the hands were found in. Those are two
# jobs and they want two radii: the search has to be generous or a warm ball cut
# flush with its own edge reads as a hand, and the hole has to be exact or the
# collision spills past the ink line it is supposed to be held inside. They were
# the same number while the lit paper was still on the plate and hid the
# difference — 13% of the radius of it.
ball = _rad <= _edge
print('disc %d px, ball %d px, hands preserved %d px'
      % (int(disc.sum()), int(ball.sum()), int(fingers.sum())))
cut = ball & ~fingers

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
CONTACT, OCCLUSION, FALLOFF = sc(9), 0.62, 2.1
reach = np.full((H, W), CONTACT + 1, np.int32)
cur = fingers.copy()
for step in range(1, CONTACT + 1):
    nxt = dilate(cur, 1)
    reach[nxt & ~cur & cut] = step
    cur = nxt
shade = np.clip(1.0 - (reach - 1) / CONTACT, 0, 1) ** FALLOFF * (reach <= CONTACT)
print('contact shadow %d px' % int((shade > 0).sum()))

# The drawing has no bottom edge. Her shirt runs off the foot of its own frame,
# so the plate ends in a straight opaque row of pixels — invisible while that
# row sits exactly on the viewport's bottom edge, and a hard horizontal line
# across her torso the moment anything lifts her off it. The page does lift her:
# she drifts forty pixels up the viewport as it scrolls, and the cut walks up
# with her, measured at 31 units of luminance in a single row.
#
# Fading it here rather than in CSS because the plate has four consumers — the
# image and three light layers that use its alpha as a mask — and a fade applied
# to one of them leaves the other three drawing a ghost of the same cut. Made
# generous enough to cover the drift several times over, and smoothstepped so
# the start of the fade is not itself an edge.
FADE = 0.10
_f = np.clip((np.arange(H) - (1 - FADE) * H) / (FADE * H), 0, 1)
alpha *= (1 - _f * _f * (3 - 2 * _f))[:, None]

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
                      'r': round(float(r), 1), 'hole': round(float(_hole), 1)},
           'ladders': {'coolDark': COOL_D, 'warmDark': WARM_D,
                       'coolLight': COOL_L, 'warmLight': WARM_L},
           'clusters': [{'family': 'warm' if warm[k] else 'cool',
                         'pos': round(float(pos[k]), 4),
                         'dark': '#%02X%02X%02X' % tuple(PAL_D[k].astype(int)),
                         'light': '#%02X%02X%02X' % tuple(PAL_L[k].astype(int))}
                        for k in range(len(C))]},
          open(f'{OUT}.json', 'w'), indent=2)
