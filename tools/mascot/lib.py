import numpy as np

def flood(cand, seed):
    """4-connected flood of `seed` constrained to `cand`, both bool HxW."""
    cur = seed & cand
    while True:
        p = np.pad(cur, 1, constant_values=False)
        nxt = (p[:-2,1:-1] | p[2:,1:-1] | p[1:-1,:-2] | p[1:-1,2:] | cur) & cand
        if nxt.sum() == cur.sum():
            return nxt
        cur = nxt

def border_seed(shape):
    s = np.zeros(shape, bool)
    s[0,:] = s[-1,:] = True
    s[:,0] = s[:,-1] = True
    return s

def dilate(m, r=1):
    o = m.copy()
    for _ in range(r):
        p = np.pad(o, 1, constant_values=False)
        o = p[:-2,1:-1] | p[2:,1:-1] | p[1:-1,:-2] | p[1:-1,2:] | o
    return o

def components(mask):
    """Yield (size, component_mask) for each 4-connected component, largest first."""
    remaining = mask.copy()
    out = []
    while remaining.any():
        idx = np.argmax(remaining)
        seed = np.zeros(mask.shape, bool)
        seed.flat[idx] = True
        c = flood(remaining, seed)
        out.append((int(c.sum()), c))
        remaining &= ~c
    out.sort(key=lambda t: -t[0])
    return out

def erode(m, r=1):
    return ~dilate(~m, r)

def close(m, r=1):
    """Bridge hatching: fill gaps up to 2r wide without growing the region."""
    return erode(dilate(m, r), r)
