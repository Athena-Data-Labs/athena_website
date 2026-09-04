# Mascot pipeline

Turns one generated portrait into `src/assets/athena-agent.webp` and
`athena-agent-light.webp` — the figure behind the homepage collision reveal.

```bash
python3 pipeline.py ../../mascot/mascot_refined/athena-source-1254.png out \
    566 257   257 566 130   --scale 2
#   ^seed y,x ^measured circle
python3 plates.py            # the four PNGs -> the eight webp files src/assets/ imports
```

An optional last positional argument takes the hand/sphere separation from a
second drawing of the same figure — see "Where the hands come from" below. This
source does not need it.

`--scale 2` is what ships. The drawing is 1254 square, so that renders the plate
at 2508, and `plates.py` takes it down to the 2048 the site imports — which is
the step that makes 2048 mean something, since it used to be a 1024 drawing
upsampled to fill the file. She is laid out as a viewport-tall square, so on any
2x display the browser is asked to stretch the source across about 1800 device
pixels — that last bilinear resample, done at paint time by something that does
not know what the picture is, is the softness. Rendering at 2x invents no detail the drawing does
not have, and is still worth it twice over: the resample moves to Lanczos, run
once here instead of on every paint; and everything this file decides
*geometrically* — the disc, the hand mask, the contact shadow, the boundary
between two palette colours — is decided at 2x and is genuinely twice as sharp,
because none of it was sampled from the source to begin with. It costs a few
minutes to run.

Needs `numpy` and `pillow`. Writes `out-dark.png`, `out-light.png`, the same two
with the sphere cut to transparent (`-cut`), a cluster table, and `out.json`
carrying the measured circle and the palette every cluster landed on. Then
`python3 plates.py` turns those four into the eight webp files `src/assets/`
imports, at both sizes.

## Before the pipeline, on a lossless source

The ground is flat but it is not uniform: the generator lays about a unit of
per-pixel noise across it, sd 1.0 measured on a PNG. A JPEG never showed this,
because an 8x8 DCT at any sane quality spends none of its budget on ±1 in a flat
block and averages it away. Keying the same drawing from each, the noise the
flood cannot walk through arrives as figure at 889 px and 1.4% of the ground
from the JPEG, and 150918 px and 18.8% from the PNG — a pepper over the whole
sheet, invisible on the dark plate and grit thrown across the page on the light
one.

It is removed by erosion rather than by enumerating components, and that is a
memory decision as much as a correctness one: `components()` materialises one
full-frame mask per component, and tens of thousands of one-pixel islands at
render scale is hundreds of gigabytes. The run was killed outright before the
erosion went in.

## Before the pipeline

Some renders carry a sparkle badge and some do not — the 1254 source does not,
so this step is skipped for it. When it is there it lands straddling her right
forearm's edge — half on her, half on the ground. That is the hardest place for
it to be, because a patch has to continue the hatching and the contour at once. `unsparkle.py <in> <out>` does it:

```bash
python3 unsparkle.py ../../mascot/mascot_refined/image_a818b3a6.jpg \
                     ../../mascot/mascot_refined/image_a818b3a6-clean.jpg
```

Two thresholds do the detecting, and both are needed. The badge is a
near-neutral grey overlay at saturation ~16, luminance ~165. Her arm *in
shadow* has the same saturation, 16, and only luminance separates them, at 113.
Her arm *in the sphere's light* reaches the same luminance, 153, and only
saturation separates them, at 40 to 78. A luminance floor of 110 lets the
shaded arm in, and on the brighter of the two candidate drawings that was
enough to swallow a third of her forearm.

The fitted arm edge is everything here, and it is found by marching in from the
left to the first **run** of ground, not the first pixel of it. Her arm's mauve
shadow passes within 45 units of the magenta ground on some rows, so a
single-pixel test stops early there — reporting the edge at x 942 on rows whose
real edge is 970. A handful of rows like that drag the quadratic to a median
residual of 8.6 px, which is enough to put the ground side *inside* her arm and
lay flat ground over her contour: the repaired arm then ends in a hard straight
cut where a drawn line should be. Four consecutive ground pixels takes the fit
to 0.30 px, worst row 1.0, and the badge mask with it from 2287 px to 1275 —
the difference between the star plus a strip of her arm, and the star.

Right of that edge the answer is known exactly — it is the flat ground. Left of it the repair is split by frequency, because the two things that
need repairing live at different ones. The arm's shading is a gradient that
changes along its length, so translating a band brings the wrong part of it and
lands a pale wedge where the arm should be dark; but interpolating that gradient
across the hole *in arm space*, at a fixed distance from the fitted edge,
reproduces it exactly and loses only the strokes. So the low frequencies come
from the interpolation and the high frequencies from a sheared clone. The clone
offset is measured, not assumed, and constrained to exceed the badge's own
height — an unconstrained search happily picked an offset shorter than the
damage and spent the repair cloning the badge onto itself.

## Arguments

**Seed** (`768 752`) is a y,x pixel anywhere inside the sphere, used to march
outward and find its rim.

**Circle** (`752 768 135`) is optional and overrides the fit: cx, cy, r in source
pixels. Pass it. Automatic fitting works on flat cel art, where the sphere is one
connected fill with a clean ink ring, and it fails three different ways on the
engraved version — flooding fragments on the hatch lines, a morphological close
is a knife edge between under-filling and bridging into the shirt, and a Hough
score saturates because ink is everywhere inside a hatched mass. Measure the
circle off the silhouette by eye and pass it in.

**Hands reference** (the last argument) is optional: a second drawing of the
same figure to take the hand/sphere separation from. See "Where the hands come
from" below. Leave it off and the separation runs on the source itself.

**These same three numbers, as fractions of the image width, are `SPHERE` in
`src/components/hero/CollisionReveal.tsx`.** They are what turns the drawing into
the aperture the collision contracts into, so a regenerated figure means updating
both. Getting them wrong does not fail loudly: it puts the collision somewhere
near her elbow.

## Why it is shaped this way

The ground is keyed by **flooding from the border**, not by colour distance. Her
copper lock sits about 64 units from the magenta ground, so a global threshold
reads it as a half-transparent edge and despills it to yellow. Connectivity
cannot make that mistake.

But the ground is **lit**. The sphere throws a glow onto the paper around it,
and inside that glow the paper stops being the colour the border says it is: the
ground under her chin measures (175,119,96) against a border median of
(147,43,102), 95 units away — further from its own background than her hair is.
One median keeps it as figure, and it ships as a flat tan lobe wedged between
her chin and the sphere, reading as a stray light the drawing does not have.

No global colour test fixes that, because inside the glow the ground and her
skin arrive at the same colour: lit paper (208,159,118) against lit jaw
(217,168,126). So the flood is run with **hysteresis** — seeded where the ground
is unambiguous, then grown through a looser threshold. A loose threshold cannot
*start* a region, so nothing inside the figure can claim one.

Loose distance alone is still not enough, and what it breaks is not subtle: her
forearm's mid-tone is a greyish mauve within 50 units of the ground and
connected to it, so at any threshold that reaches the pocket the flood also eats
thousands of pixels out of the middle of her arm. What licenses the extra reach
is the glow being *warm* — ground the tight key misses is ground the glow
warmed, and warmth is the evidence for it, not distance. Gated on R-B, the
pocket comes back whole and the forearm and face lose nothing: 0 px, at every
threshold from 90 to 150.

The feather and the despill then work against the ground **as it is there**,
diffused inward from the keyed pixels rather than taken from the median. A band
pixel on lit paper is 95 units from the median and would take alpha 1 — no
feather at all — while subtracting the median from it removes a magenta the glow
had already replaced.

Enclosed pockets of ground that never reach the border — between two crest
slats, inside the crook of a thumb — are adopted by colour, and that test is on
the pocket's **mean**. A per-pixel threshold is a guarantee that every patch
sitting exactly at the cut gets taken: the darkest shadow inside her copper lock
measures 42 against a cut of 45, and it was adopted, punching a three-pixel hole
clean through the strand. Ground showing through her hair reads as the drawn
line breaking.

Colours are k-means clustered and then placed on one of **two tone ladders** —
warm and cool — by their own lightness, lifted, rather than snapped to the
nearest brand colour. Nearest-in-RGB is the obvious thing to do and it is wrong
for dark art, because at low luminance RGB distance is dominated by hue: it took
her helmet crest from a 29.6 L\* spread down to 8.9, and did it by *converging*
the near-blacks upward and the mid-tone feather fill downward until the drawn
line and the surface it was drawn on had the same value. The crest stopped
reading as feathers and started reading as clay. A ladder read by lightness
preserves tone order by construction; the light plate is the same position read
from a second ladder, which is what keeps the two variants one drawing instead
of two.

**A gain, not a normalisation.** Normalising each family between its own extremes
uses the whole ladder and has a trapdoor: it forces some cluster onto the top
rung whether or not the drawing has anything that bright. This art is lit by one
warm sphere, so every highlight in it is warm and the cool family is nothing but
shadow — its brightest cluster is L\* 38. Stretched onto a rung meant for a
specular it went to L\* 88, and the brightest cool thing in the drawing turned
out to be the wedges of grey at the base of each V between the crest slats. They
came out near-white: small, hard-edged, brighter than the helmet, impossible to
stop looking at. A gain keeps the drawing's own tonal relationships.

**A lift, not a multiply.** Multiplying overshoots the ladder at the top and
clamps there, and a clamp is not a compression — it maps distinct clusters onto
one rung, and the two-nearest blend below then has nothing to interpolate
between because both of a pixel's neighbours carry the same colour. Measured,
three warm clusters and two cool ones landed on their ladder's end: 66k pixels
of her lit face and arm on a single cream, 113k pixels of line work on a single
near-black. Those were the two places the plate looked banded and blocky, and
they were the two ends of the range collapsing. A gamma lift raises the shadows
where the drawing needs it, leaves the highlights the headroom they were already
using, and is monotonic over the whole domain, so no two source tones can arrive
at the same rung.

**The ladder owns tone and hue; the drawing keeps its own chroma.** One ladder
per family means one saturation per lightness, which is a stronger claim than
the palette was ever meant to make. Her copper hair and her lit cheek sit at
nearly the same lightness and are nothing like the same colour, so a ladder read
by lightness alone hands them the same rung and the hair comes out as skin — the
loose lock went from saturation 0.67 in the source to 0.40, and her lit cheek
from 0.42 to 0.23, because the ladder's top stops are cream, which is right for
a specular and wrong for lit copper. So the palette colour keeps its value and
its hue, and its saturation is restored to the source pixel's own. Weighted by
value, because saturation is meaningless in the dark: at (12,8,10) it reads 0.33
and is nothing but JPEG noise, and restoring it puts coloured speckle through
every shadow.

**This is also what makes her armour read as steel**, and that is worth saying
because the obvious place to fix armour is the warm/cool test, where it cannot
be fixed. Her helmet is drawn neutral — R-B -4 on the dome — but it is lit by
the same warm sphere as everything else, so its lit planes drift warm, cross the
margin, and the plate comes back with the helmet in rose gold. Three ways to
widen or reshape that margin were tried and each broke something worse:

| test | helmet | what it cost |
|---|---|---|
| margin 10 | rose gold | — |
| margin 34 | steel | shaded hair goes grey; the mass by her ear loses its only warm note |
| R-B ÷ value | steel | every specular is the *light's* colour and so desaturated by construction, so all of them go cool — her fingers come back with pale blue rims |
| sloped with brightness | in between | inherits both; shaded hair and lit steel move together at every setting |

They move together because to that test they are the same thing: dark-ish and
mildly warm. What separates them is not which ladder they are on, it is how much
colour they *had* — her hair is pigmented and her helmet is not — and that is a
per-pixel fact the chroma restore already carries. A helmet on the warm ladder
at the drawing's own saturation is a warm grey, which is what steel under a warm
light is. Restored in full: the brow band measures +12.5 R-B on the source and
+3.9 on the plate, against -11.7 for the widened margin that solved it by force,
while the lit lock keeps saturation 0.595 against the source's 0.658.

Metal then reads as metal for a second reason, which is the cool ladder's shape.
Metal is not a hue, it is a tone curve — a dark body, a small very bright
specular, and little in between — and #697C93 to #D7DFE7 is a 37-point jump in
L\* across the ladder's last rung against 10 across the one before. A highlight
landing there gets a hard bright edge instead of a roll-off.

Restoring chroma also stops the plate *amplifying* the drawing. Her forehead is
cross-hatched in a diamond that already reads a little like scales; pulling the
fill up the ladder while the ink went down took its tonal span from 60 L\* in
the source to 78 and made the grid far more legible than it was drawn. With the
lift and the chroma restore it measures 61 — the drawing's own.

**Twenty-four clusters, not eighteen.** At eighteen, lit skin and its highlight
share a cluster, which puts most of her face on one rung and blows it out.

**Pixels are mixed between their two nearest clusters, not snapped to one.**
Hard assignment is what a quantiser normally does and it destroys anything thin.
The loose strand of hair by her cheek is a dozen pixels across, with an
antialiased edge and a gradient down its length; snapping stair-steps the edge
and breaks the gradient into bands, and the strand stops looking drawn and
starts looking rendered at too low a resolution. An antialiased pixel is not a
third colour, it is a *mixture* of two, so the mixture is recovered — project
the pixel onto the segment between its two nearest cluster centres and lay the
same fraction down between those clusters' palette colours. Flat regions are
untouched, because there the second cluster is far away and the projection lands
at an end.

The keyed rim never speaks for itself. The ground creeps about three pixels
*past* the alpha edge — measured ring by ring, the mean runs (79,36,55),
(42,11,23), (33,12,18), (27,12,15) before settling neutral, at a blue-over-red
ratio matching the ground — on pixels the key calls fully opaque because they
are far too dark to be within 45 of a bright ground. So clustering runs on the
eroded interior and the rim is filled from inside — left alone it kept its own
residue and drew a rust hairline right around her, invisible under a near-black
palette and obvious once the ladder gave the drawing some range.

Filled by **diffusion**, not by rule. The first version took the *darkest* label
within reach, on the reasoning that a silhouette on engraved art is an ink line.
True of the outside of the figure, false of everything else: that same hair
strand is twelve pixels wide against the keyed ground, so three pixels off each
side went to ink and half of it came back as outline. Diffusing the palette
colour outward has no such opinion — next to the silhouette the neighbouring
colour *is* the ink line, and next to a strand it is the strand.

The diffusion runs until it converges, not for a fixed few passes. Anything
thinner than the erosion is *entirely* outside the clustered interior — a crest
tip, the wisps at the hem, the loose hairs by her jaw — so colour has to travel
the whole width of it. Eight passes left 2.8k pixels never reached, and an
unfilled pixel is not a subtle error: it keeps the zero it was initialised with
and prints as pure black at full alpha, scattered over exactly the finest parts
of the drawing.

### The bottom edge

The drawing has none — her shirt runs off the foot of its own frame, so the
plate ends in a straight opaque row of pixels. That row is invisible while it
sits exactly on the viewport's bottom edge, and a hard horizontal line across
her torso the moment anything lifts her off it. The page does lift her: she
drifts forty pixels up the viewport as it scrolls, and the cut walks up with
her, measured at 31 units of luminance in a single row against a page baseline
of 4.

It is faded here rather than in CSS because the plate has four consumers — the
image and the three light layers that use its alpha as a mask — and a fade
applied to one of them leaves the other three drawing a ghost of the same cut.
Smoothstepped over the bottom tenth, so the start of the fade is not itself an
edge, and generous enough to cover the drift several times over.

### Where the hands come from

Normally the warm family: her hands are warm, the sphere is cool, and hue
separates them. That holds only while the sphere is *drawn* cool. On a re-lit
version where the sphere itself glows warm the separation is not harder, it is
gone — 98.7% of the disc reads warm, a shaded finger (R-B +35) is *less* warm
than the sphere's own mid-tone (+44), luminance overlaps (sphere 60-100, fingers
42-158), and so does local texture. No threshold exists on any channel.

But the re-lights are the same drawing: silhouettes differing by 0.62% of
pixels, 83% of one's line art falling on the other's at zero shift. So the
geometry comes from whichever version separates and the pixels from whichever
version is lit best. Occlusion is a property of the drawing, not of the
lighting pass.

The sphere is cut **geometrically** rather than by colour: flood-filling a
hatched sphere leaves a web of ink behind. Her hands are then lifted back out by
the **whole warm family**, not its lit half, and the ink they enclose is closed
by a flood from the rim. Keying on lit skin alone loses every shaded part of a
finger — the underside of a fingertip, the crescent at the base of a nail — and
those are exactly the parts that touch the sphere, so the hands stop resting on
it and start sinking into it, nails first. Anything warm and *entirely* enclosed
by the disc stays cut, which is what keeps a flame drawn inside the glass from
being preserved as an island floating in the hole.

The **contact shadow** is baked in for the same reason the hands are lifted out
here rather than in CSS: this file already knows where her fingers are, to the
pixel. Cut pixels within nine of a hand get a little opacity back in the darkest
ink, on a squared falloff — nine because the drawing's own ink around a finger
measures three pixels at full alpha, and at thirteen the two together read as a
heavy contour rather than as light being occluded, so the light coming through the hole is
occluded just before the contact. Without it the plasma runs at full strength up
to the edge of a finger, which nothing does, and hands laid over a bright hole
read as pasted on rather than as resting on anything.
