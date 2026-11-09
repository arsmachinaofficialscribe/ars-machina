import re
"""Power-line parsers for the bestiary data (v4.9.6.3). Book stat blocks print powers as
   Name, N points, Init +X, Form: text   (or  Name: N points, Init X, Form. text).
   These split a paragraph that holds several such lines into one entry per power."""
PW=re.compile(r'(?:(?<=^)|(?<=[.)\]!?”"]\s)|(?<=\s{2}))(?P<n>[A-Z‘’“"][^,:.]{1,70}?),\s*(?P<c>\d+(?:\s*(?:or more|to \d+|\+))?|[Vv]ariable|[Nn]o|[Ss]ee [^,]{1,30})\s*[Pp]oints?(?:\s*\([^)]*\))?,\s*(?:Init(?:iative)?\s*)?(?P<i>[+–\-−]?\s*\d+|[Vv]ariable|[Cc]onstant(?: effect)?|n/a|special|Special)?[^,:]{0,40}?,\s*(?P<f>[A-Z][A-Za-z/,() ]{1,40}?):\s*')
def split(text):
    t=re.sub(r'\s+',' ',text).strip()
    ms=list(PW.finditer(t))
    if not ms: return None
    out=[];lead=t[:ms[0].start()].strip()
    for k,m in enumerate(ms):
        end=ms[k+1].start() if k+1<len(ms) else len(t)
        x=t[m.end():end].strip()
        out.append({'n':m.group('n').strip(),'c':(m.group('c') or '').strip(),'i':(m.group('i') or '').replace(' ','').replace('–','-').replace('−','-'),'f':m.group('f').strip(),'x':x,'s':''})
    return lead,out

PW2=re.compile(r'(?:(?<=^)|(?<=[.)\]!?”"]\s)|(?<=\s{2}))(?P<n>[A-Z‘’“"][^,:.]{1,60}?):\s*(?P<c>\d+(?:\s*(?:or more|to \d+))?|[Vv]ariable|up to \d+)\s*[Pp]oints?[,:]?\s*(?:Init(?:iative)?[.:]?\s*(?P<i>[+–\-−]?\s*\d+|n/a))?[^,:.]{0,30}?[, ]\s*(?P<f>[A-Z][A-Za-z/() ]{1,30}?)[.,:(]\s*')
def split_colon(text):
    t=re.sub(r'\s+',' ',text).strip(); ms=list(PW2.finditer(t))
    if not ms: return None
    out=[]
    for k,m in enumerate(ms):
        end=ms[k+1].start() if k+1<len(ms) else len(t)
        out.append({'n':m.group('n').strip(),'c':m.group('c').strip(),'i':(m.group('i') or '').replace(' ','').replace('–','-').replace('−','-'),'f':m.group('f').strip(),'x':t[m.end():end].strip(),'s':''})
    return t[:ms[0].start()].strip(),out
def norm(s): return re.sub(r'[^a-z0-9]','',s.lower().replace('’',"'").replace('acknowledgement','acknowledgment'))
TEMPL=re.compile(r'^(?:Mastery of|Master of|Ruler of|Crafter of|Creator of|Lord of)\s+(?:\([^)]*\)|[A-Za-z]+(?:,? (?:or )?[A-Z][a-z]+){0,3}|the [A-Za-z]+|a [a-z ]{1,30}?|specific [a-z ]{1,30}?|particular [a-z ]{1,30}?)(?=[,;.)]|\s+and\s|\s+[A-Z]|$)')
def name_key(n):
    k=norm(n)
    return k[3:] if k.startswith('the') and len(k)>6 else k
def split_names(text, known):
    """A list of power names ("Apparition, Expel Demons, The Laborer's Boon The saint ...") followed by prose.
    known(name) says whether the catalogue holds a power of that name. Returns (prose, [names])."""
    t=re.sub(r'\s+',' ',text).strip(); pos=0; got=[]
    while pos<len(t):
        rest=t[pos:]
        tm=TEMPL.match(rest)
        if tm:
            nm=tm.group(0).strip(); got.append(nm); pos+=len(tm.group(0))
        else:
            m=re.search(r'\s*(?:,|;|\band\b)\s*',rest)
            seg=rest[:m.start()] if m else rest
            if seg and known(seg.strip()):
                got.append(seg.strip()); pos+=len(seg)
            else:
                w=rest.split(' '); hit=None
                for k in range(min(8,len(w)),0,-1):
                    cand=' '.join(w[:k]).rstrip('.,;')
                    if known(cand): hit=cand; break
                if not hit: break
                got.append(hit); pos+=len(hit)
                sep=re.match(r'\s*(?:,|;|\band\b)\s*',t[pos:])
                if sep and known_next(t[pos+sep.end():],known): pos+=sep.end(); continue
                break
        sep=re.match(r'\s*(?:,|;|\band\b)\s*',t[pos:])
        if sep: pos+=sep.end()
        else: break
    if not got: return None
    return t[pos:].strip(),got
def known_next(rest,known):
    if TEMPL.match(rest): return True
    w=rest.split(' ')
    return any(known(' '.join(w[:k]).rstrip('.,;')) for k in range(min(8,len(w)),0,-1))

SEG=r'(?:\d+(?:\s*(?:or more|to \d+))?\s*(?:Might\s*)?[Pp]oints?(?:\s*or more)?|[Vv]ariable(?:\s*points)?|Init(?:iative)?[.:]?\s*[+–\-−]?\s*\d+|[+–\-−]\d+|[Cc]onstant(?: [Ee]ffect)?|by (?:effect|spell)|(?:An|Aq|Au|Co|He|Ig|Im|Me|Te|Vi)\b|(?:Animal|Aquam|Auram|Corpus|Herbam|Ignem|Imaginem|Mentem|Terram|Vim)(?:\s*(?:or|/)\s*(?:Animal|Aquam|Auram|Corpus|Herbam|Ignem|Imaginem|Mentem|Terram|Vim))?)'
PW3=re.compile(r'(?:(?<=^)|(?<=[.)\]!?”"]\s))(?P<n>[A-Z‘’“"][^,:.;]{1,60}?),\s*(?P<segs>'+SEG+r'(?:\s*,\s*'+SEG+r'){1,3})\s*[:.;]\s*')
FORMS='Animal Aquam Auram Corpus Herbam Ignem Imaginem Mentem Terram Vim'.split()
def split_loose(text):
    t=re.sub(r'\s+',' ',text).strip(); ms=list(PW3.finditer(t))
    if not ms: return None
    out=[]
    for k,m in enumerate(ms):
        end=ms[k+1].start() if k+1<len(ms) else len(t)
        c=i=f=''
        for s in re.split(r'\s*,\s*',m.group('segs')):
            if re.search(r'[Pp]oints?|[Vv]ariable',s): c=re.sub(r'\s*(Might\s*)?[Pp]oints?','',s).strip()
            elif re.match(r'by ',s): f=s
            elif re.match(r'Init|[+–\-−]\d|[Cc]onstant',s): i=re.sub(r'^Init(?:iative)?[.:]?\s*','',s).replace('–','-').replace('−','-').replace(' ','')
            else: f=s
        out.append({'n':m.group('n').strip(),'c':c,'i':i,'f':f,'x':t[m.end():end].strip(),'s':''})
    return t[:ms[0].start()].strip(),out
