import json,re,sys
S=sys.argv[1]
B={'MoH':'Magi of Hermes','HP':'Hermetic Projects','GotF':'Guardians of the Forest','TrME':'Transforming Mythic Europe','TMRE':'The Mysteries','L&L':'The Lion and the Lily','ToP':'Tales of Power','Cov':'Covenants','App':'Apprentices','RoP:D':'Divine','CI':'The Contested Isle','HoH:TL':'True Lineagaes','HoH:MC':'Mystery Cults','AM':'Ancient Magic'}
v=json.load(open(S+'/v33.json')); rec=json.load(open(S+'/rec.json'))
by={s['n']:s for s in v['spells']}
T={}
def W(s): return re.sub(r'\s+',' ',s.replace('\u00ad','')).strip()
TV=r'(Individual|Ind|Part|Group|Room|Structure|Boundary|Circle|Bloodline|Smell|Taste|Touch|Hearing|Vision|Sight|Pair)'
res=[]
for n in rec:
    s=by[n]
    if len(s['t'].split())<=2 and n!='Remain Within Those Walls': continue
    b=B[s['src']]
    if b not in T: T[b]=W(open(f'{S}/txt/{b}.txt',encoding='utf-8').read())
    t=T[b]
    m0=re.match(TV+r'\s+(.*)',s['t'])
    if not m0: res.append((n,'NOPARSE',s['t']));continue
    tgt,desc=m0.group(1),m0.group(2)
    dk=W(desc)[:30].replace(' ','')
    # find R line
    pat=r'R:\s*'+re.escape(s['r'])+r'\s*,\s*D:\s*'+re.escape(s['d'])+r'\s*,\s*T:\s*'+re.escape(tgt)+r'\b'
    hits=[]
    for m in re.finditer(pat,t):
        after=t[m.end():m.end()+200].replace(' ','')
        if dk[:20] in after[:80]:
            pre=t[max(0,m.start()-60):m.start()]
            tf=s['tf'].replace('(','\\(').replace(')','\\)')
            lvl='General' if s['l']=='Gen' else s['l']
            ok=bool(re.search(re.escape(s['tf'])+r'\s*'+re.escape(s['l'] if s['l']!='Gen' else 'Gen'),pre.replace('General','Gen')))
            hits.append((ok,pre[-45:],t[m.start():m.end()+12]))
    res.append((n,tgt,hits))
for r in res: print(r[0],'->',r[1],r[2] if isinstance(r[2],str) else [(h[0],h[1],h[2]) for h in r[2]])
json.dump([(r[0],r[1],bool(r[2]) and not isinstance(r[2],str) and any(h[0] for h in r[2])) for r in res],open(S+'/fixres.json','w'))
