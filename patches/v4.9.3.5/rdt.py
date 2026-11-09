import json,re,sys
S=sys.argv[1]
B={'MoH':'Magi of Hermes','HP':'Hermetic Projects','GotF':'Guardians of the Forest','TrME':'Transforming Mythic Europe','TMRE':'The Mysteries','L&L':'The Lion and the Lily','ToP':'Tales of Power','Cov':'Covenants','App':'Apprentices','RoP:D':'Divine','CI':'The Contested Isle','HoH:TL':'True Lineagaes','HoH:MC':'Mystery Cults','AM':'Ancient Magic'}
v=json.load(open(S+'/v33.json')); rec=json.load(open(S+'/rec.json'))
by={s['n']:s for s in v['spells']}
txt={}
def norm(s): return re.sub(r'\s+',' ',s.replace('’',"'").replace('‘',"'")).strip().lower()
out=[]
for n in rec:
    s=by[n]; b=B[s['src']]
    if b not in txt:
        raw=open(f'{S}/txt/{b}.txt',encoding='utf-8').read()
        txt[b]=raw.split('\n')
    L=txt[b]; nn=norm(n); cands=[]
    for i,l in enumerate(L):
        if norm(l)==nn or (norm(l).startswith(nn) and len(norm(l))<len(nn)+12):
            # look ahead for TeFo line and R: line within 6 lines
            win=' '.join(L[i+1:i+8])
            m=re.search(r'R:\s*([^,]+?),\s*D:\s*([^,]+?),\s*T:\s*(.+?)(?=\s{2,}|$| [A-Z][a-z]+ [a-z])',win)
            if m: cands.append((i,[x.strip() for x in m.groups()],win[:160]))
    out.append({'n':n,'src':s['src'],'p':s['p'],'tf':s['tf'],'l':s['l'],'cur':[s['r'],s['d'],s['t']],'cands':cands})
json.dump(out,open(S+'/rdt_check.json','w'),ensure_ascii=False,indent=0)
for o in out:
    print(f"{o['n']} [{o['src']} {o['p']}] {o['tf']}{o['l']} cur={o['cur']}")
    for c in o['cands'][:3]: print('    ',c[1],'|',c[2][:110])
