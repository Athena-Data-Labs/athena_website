"""Remove the generator's sparkle badge from the forearm.

    python3 unsparkle.py <in.jpg> <out.jpg>


The badge straddles the arm's right edge, so a patch has to satisfy two things
at once: continue the hatching, and continue the contour. Copying a band from
directly above satisfies neither — the arm tapers, so the edge lands in the
wrong place and leaves a step, and the strokes arrive out of phase. That is the
square of duplicated forearm.

Here the two sides are treated as the two different problems they are. Right of
the fitted edge the answer is known exactly: it is the flat ground. Left of it,
a band is copied from further up the arm, sheared by however far the edge has
moved between the two rows, at whichever offset best continues the structure
already surrounding the hole — measured, not assumed from a hatch period.
"""
import sys; sys.path.insert(0,'/Users/vahidinjupic/dev/athena_website/tools/mascot')
from lib import components, dilate
from PIL import Image
import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]

a=np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
H,W,_=a.shape
B=np.array([156.,52.,108.])
d=np.sqrt(((a-B)**2).sum(2))
sat=a.max(2)-a.min(2); L=a.mean(2)

# ── the edge, from rows a first-pass mask does not touch ───────────────────
rough=np.zeros((H,W),bool)
rough[890:1024,900:1024]=(sat[890:1024,900:1024]<45)&(L[890:1024,900:1024]>105)
rough=components(rough)[0][1]
def fit(skip):
    rows=[]
    for y in range(850,1024):
        if skip[y].any(): continue
        x=920
        while x<1015 and d[y,x]>=45: x+=1
        rows.append((y,x))
    rows=np.array(rows)
    return np.polyfit(rows[:,0],rows[:,1],2), rows
p,rows=fit(dilate(rough,6))
print('edge fit: %d clean rows, median residual %.2f px'%(len(rows),np.median(np.abs(np.polyval(p,rows[:,0])-rows[:,1]))))

gy,gx=np.mgrid[0:H,0:W]
edge=np.polyval(p,gy)
ground_side=gx>edge+1

# ── the badge: desaturated-and-bright on the arm, anything-but-ground on the
#    ground. One component, so a stray highlight elsewhere cannot join in. ──
odd=np.zeros((H,W),bool)
win=(gy>890)&(gy<1024)&(gx>900)
odd |= win & ~ground_side & (sat<42) & (L>110)
odd |= win & ground_side & (d>34)
mask=dilate(components(odd)[0][1],2)
ys,xs=np.nonzero(mask)
print('badge %d px  y %d-%d  x %d-%d'%(mask.sum(),ys.min(),ys.max(),xs.min(),xs.max()))

# ── ground side: the ground, exactly ───────────────────────────────────────
out=a.copy()
g=mask & ground_side
near=(~mask)&ground_side&(gy>ys.min()-30)&(gy<ys.max()+30)&(gx>900)
out[g]=np.median(a[near],0)
print('ground restored on %d px -> #%02X%02X%02X'%(g.sum(),*out[g][0].astype(int)))

# ── arm side: sheared copy, offset chosen by matching the ring around the hole
arm=mask & ~ground_side
ring=(dilate(mask,7)&~dilate(mask,2))&~ground_side
ry,rx=np.nonzero(ring)
def score(off):
    sy=ry-off
    shear=np.polyval(p,ry)-np.polyval(p,sy)
    sx=np.round(rx-shear).astype(int)
    if sy.min()<0: return 1e9
    return float(np.abs(a[sy,sx]-a[ry,rx]).mean())
# The source has to be clean, which is not automatic: an unconstrained search
# happily picked 39 rows, less than the badge's own height, and spent the whole
# repair cloning the badge onto itself. Anything shorter than the damage cannot
# be a source.
span=int(ys.max()-ys.min())+6
cands=[(score(o),o) for o in range(span,span+70)]
cands.sort()
off=cands[0][1]
print('badge spans %d rows, so offsets start there; best %d (ring mismatch %.2f); runners-up %s'
      % (span,off,cands[0][0],', '.join('%d:%.2f'%(o,s) for s,o in cands[1:4])))

def sample(y,x):
    y0,x0=int(np.floor(y)),int(np.floor(x)); fy,fx=y-y0,x-x0
    q=a[y0:y0+2,x0:x0+2]
    return ((q[0,0]*(1-fx)+q[0,1]*fx)*(1-fy)+(q[1,0]*(1-fx)+q[1,1]*fx)*fy)

# Split the repair by frequency, because the two things that need repairing live
# at different ones and no single copy can carry both.
#
# The arm's shading is a gradient that changes along its length: the lit rim is
# broad up here and narrow down there. Translating a band, however carefully it
# is sheared onto the edge, brings the wrong part of that gradient with it and
# lands a pale wedge where the arm should be dark. But interpolating the
# gradient across the hole — in arm space, at a fixed distance from the fitted
# edge — reproduces it exactly, and loses only the strokes.
#
# So take the low frequencies from the interpolation and the high frequencies
# from the sheared clone. The gradient is then right by construction and the
# hatching is real hatching rather than a blur.
TOP, BOT = int(ys.min())-1, int(ys.max())+1
BLUR = 5
def band(y0, n, u):
    """Mean colour n rows deep at arm-space offset u, going away from the hole."""
    acc=np.zeros(3,np.float32)
    for k in range(n):
        yy=y0+k*np.sign(n and 1)
        acc+=sample(yy, np.polyval(p,yy)+u)
    return acc/n
def lowpass(y,x):
    acc=np.zeros(3,np.float32); n=0
    for dy in range(-BLUR,BLUR+1):
        for dx in range(-BLUR,BLUR+1):
            acc+=sample(y+dy,x+dx); n+=1
    return acc/n

w=mask.astype(np.float32)
for _ in range(4):
    q=np.pad(w,1)
    w=np.maximum(w,(q[:-2,1:-1]+q[2:,1:-1]+q[1:-1,:-2]+q[1:-1,2:])/4.*0.92)
w[~mask]=np.minimum(w[~mask],0.85); w[mask]=1.0
w[ground_side]=0.0

ay,ax=np.nonzero(w>0)
print('painting %d px  (hole rows %d..%d, clone offset %d)'%(len(ay),TOP,BOT,off))
for y,x in zip(ay,ax):
    u = x - np.polyval(p,y)
    va = band(TOP-2, -4, u) if False else (sample(TOP-2,np.polyval(p,TOP-2)+u)
         + sample(TOP-4,np.polyval(p,TOP-4)+u) + sample(TOP-6,np.polyval(p,TOP-6)+u))/3.
    vb = (sample(BOT+2,np.polyval(p,BOT+2)+u)
         + sample(BOT+4,np.polyval(p,BOT+4)+u) + sample(BOT+6,np.polyval(p,BOT+6)+u))/3.
    t = (y-TOP)/float(BOT-TOP)
    base = va*(1-t)+vb*t
    sy=y-off; shear=np.polyval(p,y)-np.polyval(p,sy); sx=x-shear
    detail = sample(sy,sx)-lowpass(sy,sx)
    k=w[y,x]
    out[y,x]=out[y,x]*(1-k)+np.clip(base+detail,0,255)*k

# What is left of it. The badge's core is bright enough that its outermost
# pixels sit just inside whatever colour threshold catches the rest, and a
# threshold loose enough to get them starts eating the arm's own lit edge — and
# a second clone pass over a wider mask changes the matched offset, which pulls
# in structure that does not belong and notches the contour. So ask the question
# directly, then answer it with a median of what is already there: no new
# structure, nothing to misalign, just a few flecks folded into their
# surroundings.
resid=np.zeros((H,W),bool)
def srcref(y,x):
    return sample(y-off, x-(np.polyval(p,y)-np.polyval(p,y-off)))
by0,by1,bx0,bx1=ys.min()-6,ys.max()+7,xs.min()-6,xs.max()+7
for y in range(by0,by1):
    sy=y-off
    shear=np.polyval(p,y)-np.polyval(p,sy)
    for x in range(bx0,bx1):
        if ground_side[y,x]: continue
        if out[y,x].mean()-srcref(y,x).mean()>34: resid[y,x]=True
print('residual flecks: %d px'%resid.sum())
for _ in range(3):
    grow=dilate(resid,1)
    ry2,rx2=np.nonzero(resid)
    fill=np.zeros((len(ry2),3),np.float32)
    for i,(y,x) in enumerate(zip(ry2,rx2)):
        box=out[y-3:y+4,x-3:x+4].reshape(-1,3)
        keep=~resid[y-3:y+4,x-3:x+4].reshape(-1)
        fill[i]=np.median(box[keep],0) if keep.any() else out[y,x]
    out[ry2,rx2]=out[ry2,rx2]*0.25+fill*0.75
    del grow

Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(OUT,quality=96,subsampling=0)
o=np.asarray(Image.open(OUT).convert('RGB')).astype(np.float32)
s2=o.max(2)-o.min(2); l2=o.mean(2); d2=np.sqrt(((o-B)**2).sum(2))
left=(win & ((~ground_side&(s2<45)&(l2>105)) | (ground_side&(d2>34)))).sum()
print('badge-signature pixels remaining: %d (was %d)'%(left,odd.sum()))
print('wrote',OUT)
