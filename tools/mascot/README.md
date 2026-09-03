# Mascot pipeline

Turns one generated portrait into `src/assets/athena-agent.webp` and
`athena-agent-light.webp` — the figure behind the homepage collision reveal.

```bash
python3 pipeline.py mascot/image_4f79d699-clean.jpg out 768 752 752 768 135
#                    ^generated art  ^prefix  ^seed y,x  ^measured circle
```

Needs `numpy` and `pillow`. Writes `out-dark.png`, `out-light.png`, the same two
with the sphere cut to transparent (`-cut`), a cluster table, and `out.json`
carrying the measured circle and the palette every cluster landed on. Convert
the two `-cut` files to webp at quality 82 and drop them into `src/assets/`.

## Before the pipeline

The generator stamps a sparkle badge on the art, and on this figure it lands
straddling her right forearm's edge — half on her, half on the ground. That is
the hardest place for it to be, because a patch has to continue the hatching and
the contour at once. `unsparkle.py <in> <out>` does it:

```bash
python3 unsparkle.py ../../mascot/image_4f79d699.jpg ../../mascot/image_4f79d699-clean.jpg
```

Right of the fitted arm edge the answer is known exactly — it is the flat
ground. Left of it the repair is split by frequency, because the two things that
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

Colours are k-means clustered and then placed on one of **two tone ladders** —
warm and cool — by their own lightness times a gain, rather than snapped to the
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
stop looking at. A gain keeps the drawing's own tonal relationships and clamps at
the ladder's ends instead of dragging a family with it.

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
