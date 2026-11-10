"""The 4.9.11.1 seal: fifteen marks on the rim (five Techniques, ten Forms), two pentagons for the ten Forms'
points, a rayed inner ring and the eye. Three turning layers (.turn, .turn-mid, .turn-in) and a still centre.
Classes: s-a = lines kept at every size; s-f = fine work shown only on the large seal.  viewBox 0 0 120 120."""
import math
C = 60
def pt(r, deg): a = math.radians(deg); return C + r * math.cos(a), C + r * math.sin(a)
def f(x): return ('%.2f' % x).rstrip('0').rstrip('.')
def poly(r, n, start, step=1): return ' '.join('%s,%s' % tuple(map(f, pt(r, start + 360.0 * step * i / n))) for i in range(n))
def inner():
    o = []
    # rim: two rings and fifteen marks between them
    o.append('<g class="turn" fill="none" stroke="currentColor">')
    o.append('<circle class="s-a" cx="60" cy="60" r="57" stroke-width="1.9"/>')
    o.append('<circle class="s-f" cx="60" cy="60" r="50.5" stroke-width=".7"/>')
    for i in range(15):
        d = -90 + 24 * i; x, y = pt(53.75, d)
        if i % 3 == 0:
            o.append('<path class="s-b" fill="currentColor" stroke="none" transform="rotate(%s %s %s)" d="M%s %sl1.5 2.3l-1.5 2.3l-1.5-2.3z"/>' % (f(d + 90), f(x), f(y), f(x), f(y - 2.3)))
        else:
            o.append('<circle class="s-f" fill="currentColor" stroke="none" cx="%s" cy="%s" r=".95"/>' % (f(x), f(y)))
    o.append('</g>')
    # the ten points: two pentagons, the fine decagram inside them, a node on each point
    o.append('<g class="turn-mid" fill="none" stroke="currentColor" stroke-linejoin="round">')
    o.append('<polygon class="s-a" stroke-width="1.45" points="%s"/>' % poly(47, 5, -90))
    o.append('<polygon class="s-a s-p2" stroke-width="1.45" points="%s"/>' % poly(47, 5, 90))
    o.append('<polygon class="s-f" stroke-width=".5" opacity=".55" points="%s"/>' % poly(47, 10, -90, 3))
    for i in range(10):
        x, y = pt(47, -90 + 36 * i)
        o.append('<circle class="s-f" fill="currentColor" stroke="none" cx="%s" cy="%s" r="1.5"/>' % (f(x), f(y)))
    o.append('</g>')
    # inner ring with five rays
    o.append('<g class="turn-in" fill="none" stroke="currentColor" stroke-linecap="round">')
    o.append('<circle class="s-f" cx="60" cy="60" r="30" stroke-width=".6" stroke-dasharray="1.2 3.5"/>')
    o.append('<circle class="s-a" cx="60" cy="60" r="16.5" stroke-width="1.5"/>')
    for i in range(5):
        d = -90 + 72 * i; x1, y1 = pt(20.5, d); x2, y2 = pt(26.5, d)
        o.append('<path class="s-r" stroke-width="1.5" d="M%s %sL%s %s"/>' % (f(x1), f(y1), f(x2), f(y2)))
        x, y = pt(23.5, d + 36)
        o.append('<circle class="s-f" fill="currentColor" stroke="none" cx="%s" cy="%s" r="1.1"/>' % (f(x), f(y)))
    o.append('</g>')
    # the eye
    o.append('<path class="s-f" fill="none" stroke="currentColor" stroke-width=".8" d="M49.5 60q10.5-9 21 0q-10.5 9-21 0z"/>')
    o.append('<circle class="s-c" cx="60" cy="60" r="4.6" fill="currentColor"/>')
    return ''.join(o)
if __name__ == '__main__':
    print(inner())
