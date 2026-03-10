import{r as J}from"./config-C2QjskFB.js";const tn=256,oe=0,st=1,So=2,Oo=3,Zo=4,Lo=5,Do=6,Ko=7,Bo=8,Ho=9,Eo=10,Po=11,To=12,Ro=13,Go=14,Yo=15,ur="monochrome",No=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]],fr=new Uint32Array(tn);let vn=new Uint32Array(tn),Gn=ur;function dt(e,t,n,A){fr[e]=(t&255)<<16|(n&255)<<8|A&255}function Uo(){dt(oe,255,255,255),dt(st,0,0,0),dt(So,221,0,0),dt(Oo,0,168,0),dt(Zo,0,0,202),dt(Lo,0,151,255),dt(Do,255,0,151),dt(Ko,255,255,0),dt(Bo,255,101,0),dt(Ho,54,0,151),dt(Eo,101,54,0),dt(Po,151,101,54),dt(To,185,185,185),dt(Ro,134,134,134),dt(Go,69,69,69),dt(Yo,255,170,204);const e=[0,95,135,175,215,255];let t=16;for(let n=0;n<e.length;n++)for(let A=0;A<e.length;A++)for(let i=0;i<e.length;i++)dt(t++,e[n],e[A],e[i]);for(let n=0;t<tn;n++,t++){const A=8+n*10;dt(t,A,A,A)}vn=new Uint32Array(fr)}Uo();function Fo(){return ur}function Jt(){return Gn}function si(e){Gn=e}function Bt(e){if(!Number.isFinite(e))return st;const t=e|0;return t<0?oe:t>=tn?tn-1:t}function Xo(e){return vn[Bt(e)]&16777215}function pr(e){const t=Xo(e);return{r:t>>16&255,g:t>>8&255,b:t&255}}function jo(e,t,n){return e*.299+t*.587+n*.114}function Jo(e,t,n){let A=oe,i=Number.POSITIVE_INFINITY;for(let r=0;r<vn.length;r++){const o=vn[r],s=o>>16&255,l=o>>8&255,a=o&255,c=s-e,d=l-t,u=a-n,f=c*c+d*d+u*u;if(f<i&&(i=f,A=r,f===0))break}return A}function qr(e,t,n,A,i){const r=jo(e,t,n),o=(No[i&3][A&3]+.5)/16*255;return r<o?1:0}function mr(e,t,n){const A=Bt(e);if(A===oe)return 0;if(A===st)return 1;const{r:i,g:r,b:o}=pr(A);return qr(i,r,o,t,n)}function Qt(e){const t=Bt(e);return Gn==="colors"?t:t===oe?oe:st}function IA(e){return Qt(e)}function li(e,t,n){const A=Bt(e);return Gn==="colors"?pr(A):mr(A,t,n)===0?{r:255,g:255,b:255}:{r:0,g:0,b:0}}const h=1,B=0;class zA{constructor(t,n){this.clipStack=[],this.imageData=null,this.width=t,this.height=n,this.pixels=new Uint8Array(t*n),this.clip={x:0,y:0,w:t,h:n}}pushClip(t,n,A,i){this.clipStack.push({...this.clip});const r=Math.max(this.clip.x,t),o=Math.max(this.clip.y,n),s=Math.min(this.clip.x+this.clip.w,t+A),l=Math.min(this.clip.y+this.clip.h,n+i);this.clip={x:r,y:o,w:Math.max(0,s-r),h:Math.max(0,l-o)}}popClip(){const t=this.clipStack.pop();t&&(this.clip=t)}getClip(){return{...this.clip}}flush(t){(!this.imageData||this.imageData.width!==this.width||this.imageData.height!==this.height)&&(this.imageData=t.createImageData(this.width,this.height));const n=this.imageData.data,A=this.width*this.height;for(let i=0;i<A;i++){const r=i%this.width,o=i/this.width|0,s=li(this.pixels[i],r,o),l=i*4;n[l]=s.r,n[l+1]=s.g,n[l+2]=s.b,n[l+3]=255}t.putImageData(this.imageData,0,0)}captureRegion(t,n,A,i){if(t=Math.max(0,t|0),n=Math.max(0,n|0),A=Math.min(A|0,this.width-t),i=Math.min(i|0,this.height-n),A<=0||i<=0)return"";const r=document.createElement("canvas");r.width=A,r.height=i;const o=r.getContext("2d"),s=o.createImageData(A,i),l=s.data;for(let a=0;a<i;a++)for(let c=0;c<A;c++){const d=(n+a)*this.width+(t+c),u=li(this.pixels[d],t+c,n+a),f=(a*A+c)*4;l[f]=u.r,l[f+1]=u.g,l[f+2]=u.b,l[f+3]=255}return o.putImageData(s,0,0),r.toDataURL("image/png")}drawHLine(t,n,A,i=h){if(t=t|0,n=n|0,A=A|0,n<this.clip.y||n>=this.clip.y+this.clip.h)return;const r=Math.max(t,this.clip.x,0),o=Math.min(t+A,this.clip.x+this.clip.w,this.width),s=n*this.width;for(let l=r;l<o;l++)this.pixels[s+l]=i}drawVLine(t,n,A,i=h){if(t=t|0,n=n|0,A=A|0,t<this.clip.x||t>=this.clip.x+this.clip.w)return;const r=Math.max(n,this.clip.y,0),o=Math.min(n+A,this.clip.y+this.clip.h,this.height);for(let s=r;s<o;s++)this.pixels[s*this.width+t]=i}drawRect(t,n,A,i,r=h){this.drawHLine(t,n,A,r),this.drawHLine(t,n+i-1,A,r),this.drawVLine(t,n,i,r),this.drawVLine(t+A-1,n,i,r)}fillRect(t,n,A,i,r=h){t=t|0,n=n|0,A=A|0,i=i|0;const o=Math.max(t,this.clip.x,0),s=Math.max(n,this.clip.y,0),l=Math.min(t+A,this.clip.x+this.clip.w,this.width),a=Math.min(n+i,this.clip.y+this.clip.h,this.height);for(let c=s;c<a;c++){const d=c*this.width;for(let u=o;u<l;u++)this.pixels[d+u]=r}}}const Qo="…",_o=127,ai=63;function hr(e,t){if(!t)return-1;if(t===Qo)return _o;const n=t.codePointAt(0);return n===void 0?-1:n>=0&&n<=255?n:e.glyphWidths[ai]>0?ai:-1}function gr(e,t){return t<0||t>255?0:e.glyphWidths[t]??0}function $o(e,t){return t*e.glyphStride}function ts(e,t,n,A){const i=gr(e,t);if(i<1||n<0||n>=i||A<0||A>=e.glyphHeight)return!1;const r=Math.ceil(e.maxWidth/8),o=$o(e,t)+A*r+Math.floor(n/8),s=e.glyphData[o],l=1<<7-n%8;return(s&l)!==0}function es(e,t){let n=0,A=0,i=e.glyphHeight;for(let r=0;r<t.length;r++){const o=t[r];if(o===`
`){A=Math.max(A,n),n=0,i+=e.glyphHeight;continue}const s=hr(e,o);n+=gr(e,s)+e.spacing,A=Math.max(A,n)}return{width:A,height:i}}const Rt=`// lil: Learning in Layers

let allocs=0,calldepth=0,do_panic=0
NIL  =                   {t:'nil'},                       linil=x=>x&&x.t=='nil'
lmn  =x      =>(allocs++,{t:'num',v:isFinite(x)?+x:0}),   lin  =x=>x&&x.t=='num'
lms  =x      =>(allocs++,{t:'str',v:''+x }),              lis  =x=>x&&x.t=='str'
lml  =x      =>(allocs++,{t:'lst',v:x    }),              lil  =x=>x&&x.t=='lst'
lmd  =(k,v)  =>(allocs++,{t:'dic',k:k||[],v:v||[]}),      lid  =x=>x&&x.t=='dic'
lmt  =_      =>(allocs++,{t:'tab',v:new Map()}),          lit  =x=>x&&x.t=='tab'
lmi  =(f,n,x)=>(allocs++,{t:'int',f,n}),                  lii  =x=>x&&x.t=='int'
lmon =(n,a,b)=>(allocs++,{t:'on' ,n:n,a:a,b:b,c:null}),   lion =x=>x&&x.t=='on'
lmnat=f      =>(allocs++,{t:'nat',f:f}),                  linat=x=>x&&x.t=='nat'
lmblk=_      =>(allocs++,{t:'blk',b:[],locals:[]}),       liblk=x=>x&&x.t=='blk'
lmbool=x     =>          x?ONE:ZERO
lmenv=p      =>{allocs++;const r={t:'env',v:new Map(),p:p};r.local=(n,x)=>env_local(r,lms(n),x);return r}

ZERO=lmn(0), ONE=lmn(1), seed=0x12345, max=Math.max, min=Math.min, abs=Math.abs
ISODATE=lms('%04i-%02i-%02iT%02i:%02i:%02iZ%n%m'), PARTS=['year','month','day','hour','minute','second'].map(lms)
drom_toupper=x=>x.replace(/([ßẞ])|([^ßẞ])/g,(_,s,e)=>s?'ẞ': e.toUpperCase())
drom_tolower=x=>x.replace(/([ßẞ])|([^ßẞ])/g,(_,s,e)=>s?'ß': e.toLowerCase())
clchars=x=>x.normalize("NFC").replace(
	/(\\r)|(\\t)|([‘’])|([“”])|([^\\x20-\\x7E\\n…ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĒēĘęĪīıŁłŃńŌōŐőŒœŚśŠšŪūŰűŸŹźŻżŽžȘșȚțẞ¡¿«»€°]$)/gm,
	(_,r,t,sq,dq)=>r?'': t?' ': sq?\`'\`: dq?\`"\`: '�'
)
drom_chars=\`…ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĒēĘęĪīıŁłŃńŌōŐőŒœŚśŠšŪūŰűŸŹźŻżŽžȘșȚțẞ¡¿«»€°\`.split('')
drom_idx=new Map();drom_chars.forEach((c,i)=>drom_idx.set(c.charCodeAt(0),127+i))
drom_to_ord=x=>{const i=x.charCodeAt(0);return i==10||(i>=32&&i<=126)?i: drom_idx.get(i)||255}
drom_from_ord=x=>x==9?' ': x==10?'\\n': x==13?'': (x>=32&&x<=126)?String.fromCharCode(x): (x>=127&&x<=240)?drom_chars[x-127]: '�'
wnum=y=>{
	let w='',d='',s=y<0?(y=-y,'-'):'',i=Math.floor(y);y=Math.round((y-Math.floor(y))*1000000);if(y>=1000000)i++
	while(i>0){w=(0|i%10)+w,i=i/10}for(let z=0;z<6;z++){d=(0|y%10)+d,y=y/10}
	return s+('0'+w).replace(/^(0+)(?=[^0])/,'')+('.'+d).replace(/(\\.?0+)$/,'')
}
mod=(x,y)=>x-y*Math.floor(x/y)
range=x=>Array.from(Array(0|x)).map((_,i)=>i)
tab_get=(t,c)=>t.v.get(c)
tab_has=(t,c)=>t.v.get(c)!=undefined
tab_cell=(t,c,i)=>(t.v.get(c)||[])[i]
tab_set=(t,c,v)=>t.v.set(c,v)
tab_cols=t        =>{const r=[]   ;for(let k of t.v.keys())r.push(k);return r}
tab_row=(t,i)     =>{const r=lmd();for(let k of t.v.keys())dset(r,lms(k),tab_cell(t,k,i));return r}
tab_splice=(f,x,t)=>{const r=lmt();for(let k of t.v.keys())tab_set(r,k,f(x,tab_get(t,k)));return r}
tab_clone=t       =>{const r=lmt();for(let k of t.v.keys())tab_set(r,k,tab_get(t,k).slice(0));return r}
tab_rowcount=t=>!t.v.size?0: t.v.values().next().value.length
torect=t=>{
	let n=0;for(let x of t.v.values())n=max(n,lil(x)?count(x):1);
	for(let k of t.v.keys()){const v=tab_get(t,k);tab_set(t,k,take(n,lil(v)?v.v:[v]))}
}
count=x=>lin(x)?1: lis(x)||lil(x)||lid(x)?x.v.length: lit(x)?tab_rowcount(x): 0
rows=x=>{const t=lt(x);return lml(range(tab_rowcount(t)).map(i=>tab_row(t,i)))}
coltab=x=>{
	const n=lmn(x.v.reduce((x,y)=>max(x,lil(y)?count(y):1),0)),r=lmt()
	x.k.map((k,i)=>tab_set(r,ls(k),dyad.take(n,dyad.take(n,lil(x.v[i])?x.v[i]:lml([x.v[i]]))).v));return r
}
rowtab=x=>{
	const ok=[],t=lmt(),v=x.v.map(ld)
	v.map(r=>r.k.map(k=>{if(!tab_has(t,ls(k)))ok.push(k);tab_set(t,ls(k),[])}))
	v.map(x=>ok.map(k=>tab_get(t,ls(k)).push(dget(x,k)||NIL)));return t
}
listab=x=>{
	const v=x.v.map(ll), m=v.reduce((r,x)=>max(r,x.length),0);const t=lmt();for(let z=0;z<m;z++)tab_set(t,'c'+z,[])
	v.map(row=>{for(let z=0;z<m;z++)tab_get(t,'c'+z).push(z>=row.length?NIL:row[z])});return t
}
tflip=x=>{
	const c=tab_cols(x),kk=c.indexOf('key')>-1?'key':c[0],k=(tab_get(x,kk)||[]).map(ls),cc=c.filter(k=>k!=kk),r=lmt()
	tab_set(r,'key',cc.map(lms));k.map((k,i)=>tab_set(r,k,cc.map(c=>tab_cell(x,c,i))));return r
}
tcat=(x,y)=>{
	const r=lmt()
	tab_cols(x).map(k=>tab_set(r,k,tab_get(x,k).concat(tab_has(y,k)?[]:range(count(y)).map(x=>NIL))))
	tab_cols(y).map(k=>tab_set(r,k,(tab_has(x,k)?tab_get(x,k):range(count(x)).map(x=>NIL)).concat(tab_get(y,k))));return r
}
zip=(x,y,f)=>{const n=count(x),o=count(y)<n?take(n,y.v):y.v;return x.v.map((x,i)=>f(x,o[i%n]))}
dzip=(x,y,f)=>{
	const r=lmd(x.k.slice(0),x.v.map((z,i)=>f(z,dget(y,x.k[i])||NIL)))
	y.k.filter(k=>!dget(x,k)).map(k=>dset(r,k,f(NIL,dget(y,k))));return r
}
match=(x,y)=>x==y?1: (x.t!=y.t)||(count(x)!=count(y))?0: (lin(x)||lis(y))?x.v==y.v:
	         lil(x)?x.v.every((z,i)=>dyad['~'](z,y.v[i]).v): lit(x)?dyad['~'](rows(x),rows(y)).v:
	         lid(x)?x.v.every((z,i)=>dyad['~'](z,y.v[i]).v&&dyad['~'](x.k[i],y.k[i]).v):0
splice=(f,x,y)=>lis(y)?lms(f(x,ll(y)).map(ls).join('')): lid(y)?lmd(f(x,y.k),f(x,y.v)): lit(y)?tab_splice(f,x,y): lml(f(x,ll(y)))
ina=(x,y)=>lmn(lis(y)?y.v.indexOf(ls(x))>=0: lil(y)?y.v.some(y=>match(x,y)): lid(y)?dget(y,x)!=undefined: lit(y)?tab_has(y,ls(x)): x==y)
filter=(i,x,y)=>{
	x=(lis(x)||linil(x))?monad.list(x):lml(ll(x))
	if(lid(y)){const r=lmd();y.k.forEach((k,v)=>i==lb(ina(k,x))&&dset(r,k,y.v[v]));return r}
	if(!lit(y))return lml(ll(y).filter(z=>i==lb(ina(z,x))))
	const n=x.v.every(lin),nx=x.v.map(ln),ix=range(tab_rowcount(y))
	if(n&& i){const r=dyad.take(ZERO,y);nx.forEach(i=>{for(c of y.v.keys()){const v=tab_cell(y,c,i);if(v)tab_get(r,c).push(v)}});return r}
	if(n&&!i){const r=dyad.take(ZERO,y);ix.forEach(i=>{if(nx.indexOf(i)<0){for(let c of y.v.keys())tab_get(r,c).push(tab_cell(y,c,i))}});return r}
	const r=lmt();for(let k of y.v.keys())if(i==lb(ina(lms(k),x)))tab_set(r,k,tab_get(y,k));return r
}
take=(x,y)=>{const n=y.length, s=x<0?mod(x,n):0; return range(abs(x)).map(z=>y[mod(z+s,n)]||NIL)}
dkix=(dict,key)=>dict.k.findIndex(x=>match(key,x)), dget=(dict,key)=>dict.v[dkix(dict,key)]
dvix=(dict,val)=>dict.v.findIndex(x=>match(val,x)), dkey=(dict,val)=>dict.k[dvix(dict,val)]
dset=(d,k,v)=>{const i=d.k.findIndex(x=>match(x,k));if(i<0){d.k.push(k),d.v.push(v)}else{d.v[i]=v};return d}
union=(x,y)=>{const r=lmd(x.k.slice(0),x.v.slice(0));y.k.forEach(k=>dset(r,k,dget(y,k)));return r}
amend=(x,i,y)=>{
	if(lii(x))return x.f(x,i,y)
	if(lit(x)&&lin(i)){
		const r=tab_clone(x), rn=count(x), cols=ll(monad.keys(x)), ri=0|ln(i); y=lid(y)?y: lmd(cols, new Array(cols.length).fill(y))
		if(ri>=0&&ri<rn)y.k.map((k,i)=>{k=ls(k);if(tab_has(r,k))tab_get(r,k)[ri]=y.v[i]});return r
	}
	if(lit(x)&&lis(i)){
		const r=tab_clone(x), rn=count(x), c=lil(y)?ll(y).slice(0,rn): new Array(rn).fill(y)
		while(c.length<rn)c.push(NIL);tab_set(r,ls(i),c);return r
	}
	if(!lis(x)&&!lil(x)&&!lid(x))return amend(lml([]),i,y)
	if((lil(x)||lis(x))&&(!lin(i)||(ln(i)<0||ln(i)>count(x))))return amend(ld(x),i,y)
	if(lil(x)){const r=lml(x.v.slice(0));r.v[ln(i)|0]=y;return r}
	return lid(x)?dset(lmd(x.k.slice(0),x.v.slice(0)),i,y): lis(x)?lms(ls(x).slice(0,ln(i))+ls(y)+ls(x).slice(1+ln(i))): lml([])
}
l_at=(x,y)=>{
	if(linil(x))return NIL; if(lii(x))return lis(y)&&y.v=='type'?lms(x.n): x.f(x,y)
	if(lit(x)&&lin(y))x=monad.rows(x); if((lis(x)||lil(x))&&linil(y))y=ZERO; if((lis(x)||lil(x))&&!lin(y))x=ld(x)
	if(lit(x)&&lis(y)){const r=tab_get(x,ls(y));return r?lml(r):NIL}
	return lis(x)?lms(x.v[ln(y)|0]||''): lil(x)?x.v[ln(y)|0]||NIL: lid(x)?dget(x,y)||NIL: NIL
}
amendv=(x,i,y,n,tla)=>{
	if(lii(x))tla.v=0;const f=monad.first(i[n]||NIL)
	return (!tla.v&&n+1 <i.length)?amendv(l_at(x,f),i,y,n+1,tla):
	       (n+1<i.length)?amend(x,f,amendv(l_at(x,f),i,y,n+1,tla)): (n+1==i.length)?amend(x,f,y): y
}
lb=x=>linil(x)?0: lin(x)?x.v!=0: lis(x)?x.v!='': lil(x)||lid(x)?x.v.length: 1
ln=x=>linil(x)?0: lin(x)?x.v: lis(x)?(isFinite(x.v)?+x.v:0): lil(x)||lid(x)?ln(x.v[0]): 0
ls=x=>lin(x)?wnum(x.v): lis(x)?x.v: lil(x)?x.v.map(ls).join(''): ''
ll=x=>linil(x)?[]: lis(x)?x.v.split('').map(lms): lil(x)||lid(x)?x.v: lit(x)?rows(x).v: [x]
ld=x=>lid(x)?x:lit(x)?monad.cols(x):lil(x)||lis(x)?lmd(range(count(x)).map(lmn),lis(x)?ll(x):x.v):lmd()
lt=x=>{if(lit(x))return x;const r=lmt();if(linil(x))return r;if(lid(x)){tab_set(r,'key',x.k.slice(0))};tab_set(r,'value',ll(x));return r}
vm=f=>{const r=x=>lid(x)?lmd(x.k,x.v.map(r)):lil(x)?lml(x.v.map(r)):f(x);return r}
vd=f=>{const r=(x,y)=>
	 lid(x)&lid(y)?dzip(x,y,r)    :lid(x)&!lid(y)?lmd(x.k.slice(0),x.v.map(x=>r(x,y))):!lid(x)&lid(y)?lmd(y.k.slice(0),y.v.map(y=>r(x,y))):
	 lil(x)&lil(y)?lml(zip(x,y,r)):lil(x)&!lil(y)?lml(x.v.map(x=>r(x,y)))             :!lil(x)&lil(y)?lml(y.v.map(y=>r(x,y))): f(x,y);return r}
vmnl=f=>{const r=x=>lil(x)?(ll(x).some(x=>!lin(x))?lml(x.v.map(r)):f(x)):f(x);return r}
fstr=x=>{
	let ct=0;return x.split('').map(x=>{
		let e=0;if(x=='<'){ct=1}else if(x=='/'&&ct){e=1}else if(x!=' '&&x!='\\n'){ct=0}
		return e?'\\\\/':({'\\n':'\\\\n','\\\\':'\\\\\\\\','"':'\\\\"'})[x]||x
	}).join('')
}
fjson=x=>lin(x)?wnum(x.v): lit(x)?fjson(rows(x)): lil(x)?\`[\${x.v.map(fjson).join(',')}]\`:
         lis(x)?\`"\${fstr(x.v)}"\`:lid(x)?\`{\${x.k.map((k,i)=>\`\${fjson(lms(ls(k)))}:\${fjson(x.v[i])}\`).join(',')}}\`:'null'
fii  =x=>{const e=ifield(x,'encoded');return linil(e)?'null':ls(e)}
flove=x=>lin(x)||lis(x)?fjson(x): lil(x)?\`[\${x.v.map(flove).join(',')}]\`:
         lid(x)?\`{\${x.k.map((k,i)=>\`\${flove(k)}:\${flove(x.v[i])}\`).join(',')}}\`:
         lit(x)?\`<\${tab_cols(x).map(k=>\`\${flove(lms(k))}:\${flove(lml(tab_get(x,k)))}\`).join(',')}>\`:
         lii(x)?fii(x): 'null'
pjson=(y,h,n)=>{
	const si=h, hn=_=>m&&y[h]&&(n?h-si<n:1), hnn=x=>m&&h+x<=y.length&&(n?h+x-si<n:1)
	const jd=_=>{while(hn()&&/[0-9]/.test(y[h]))h++}, jm=x=>hn()&&y[h]==x?(h++,1):0, iw=_=>/[ \\n]/.test(y[h]), ws=_=>{while(hn()&&iw())h++}
	const esc=e=>e=='n'?'\\n': /[\\\\/"']/.test(e)?e: e=='u'&&hnn(4)?String.fromCharCode(parseInt(y.slice(h,h+=4),16)):' '
	let f=1, m=1, rec=_=>{
		const t={null:NIL,false:ZERO,true:ONE};for(let k in t)if(hnn(k.length)&&y.slice(h,h+k.length)==k)return h+=k.length,t[k]
		if(jm('[')){const r=lml([]);while(f&&hn()){ws();if(jm(']'))break;r.v.push(rec()),ws(),jm(',')}return r}
		if(jm('{')){const r=lmd();while(f&&hn()){ws();if(jm('}'))break;const k=rec();ws(),jm(':'),ws();if(f)dset(r,k,rec());ws(),jm(',')}return r}
		if(jm('"')){let r='';while(f&&hn()&&!jm('"'))r+=hnn(2)&&jm('\\\\')?esc(y[h++]):y[h++];return lms(clchars(r))}
		if(jm("'")){let r='';while(f&&hn()&&!jm("'"))r+=hnn(2)&&jm('\\\\')?esc(y[h++]):y[h++];return lms(clchars(r))}
		const ns=h;jm('-'),jd(),jm('.'),jd();if(jm('e')||jm('E')){jm('-')||jm('+');jd();}return h<=ns?(f=0,NIL): lmn(+y.slice(ns,h))
	}, r=rec();return {value:r,index:h}
}
idecode=x=>{
	const p=x.slice(0,5).toLowerCase()
	return p=='%%img'?image_read(x): p=='%%snd'?sound_read(x): p=='%%dat'?array_read(x): NIL
}
plove=(y,h,n)=>{
	const si=h, hn=_=>m&&y[h]&&(n?h-si<n:1), hnn=x=>m&&h+x<=y.length&&(n?h+x-si<n:1)
	const jd=_=>{while(hn()&&/[0-9]/.test(y[h]))h++}, jm=x=>hn()&&y[h]==x?(h++,1):0, iw=_=>/[ \\n]/.test(y[h]), ws=_=>{while(hn()&&iw())h++}
	const esc=e=>e=='n'?'\\n': /[\\\\/"']/.test(e)?e: e=='u'&&hnn(4)?String.fromCharCode(parseInt(y.slice(h,h+=4),16)):' '
	let f=1, m=1, rec=_=>{
		const t={null:NIL,false:ZERO,true:ONE};for(let k in t)if(hnn(k.length)&&y.slice(h,h+k.length)==k)return h+=k.length,t[k]
		if(jm('[')){const r=lml([]);while(f&&hn()){ws();if(jm(']'))break;r.v.push(rec()),ws(),jm(',')}return r}
		if(jm('{')){const r=lmd();while(f&&hn()){ws();if(jm('}'))break;const k=rec();ws(),jm(':'),ws();if(f)dset(r,       k,         rec()  );ws(),jm(',')}return r}
		if(jm('<')){const r=lmd();while(f&&hn()){ws();if(jm('>'))break;const k=rec();ws(),jm(':'),ws();if(f)dset(r,lms(ls(k)),lml(ll(rec())));ws(),jm(',')}return monad.table(r)}
		if(jm('%')){jm('%');let r='%%';while(f&&hn()&&/[a-zA-Z0-9+/=]/.test(y[h]))r+=y[h++];return idecode(r)}
		if(jm('"')){let r='';while(f&&hn()&&!jm('"'))r+=hnn(2)&&jm('\\\\')?esc(y[h++]):y[h++];return lms(r)}
		if(jm("'")){let r='';while(f&&hn()&&!jm("'"))r+=hnn(2)&&jm('\\\\')?esc(y[h++]):y[h++];return lms(r)}
		const ns=h;jm('-'),jd(),jm('.'),jd();if(jm('e')||jm('E')){jm('-')||jm('+');jd();}return h<=ns?(f=0,NIL): lmn(+y.slice(ns,h))
	}, r=rec();return {value:r,index:h}
}
format_has_names=x=>{
	let f=0;while(x[f]){
		if(x[f]!='%'){f++;continue;}f++;if(x[f]=='[')return 1
		if(x[f]=='*')f++;if(x[f]=='-')f++;if(x[f]=='0')f++;while(/[0-9]/.test(x[f]))f++;if(x[f]=='.')f++
		let d=0;while(/[0-9]/.test(x[f]))d=d*10+(+x[f++]);if(!x[f])break;const t=x[f++];if(t=='r'||t=='o')while(d&&x[f])d--,f++
	}return 0
}
razetab=x=>{const k=tab_cols(x);return dyad.dict(lml(tab_get(x,k[0])||[]),lml(tab_get(x,k[1])||[]))}
monad={
	'-':    vm(x=>lmn(-ln(x))),
	'!':    vm(x=>lmbool(!lb(x))),
	floor:  vm(x=>lmn(Math.floor(ln(x)))),
	ceil:   vm(x=>lmn(Math.ceil(ln(x)))),
	cos:    vm(x=>lmn(Math.cos(ln(x)))),
	sin:    vm(x=>lmn(Math.sin(ln(x)))),
	tan:    vm(x=>lmn(Math.tan(ln(x)))),
	exp:    vm(x=>lmn(Math.exp(ln(x)))),
	ln:     vm(x=>lmn(Math.log(ln(x)))),
	sqrt:   vm(x=>lmn(Math.sqrt(ln(x)))),
	trim:   vm(x=>lms(ls(x).trim())),
	unit:   vm(x=>{const n=ln(x);return lml([lmn(Math.cos(n)),lmn(Math.sin(n))])}),
	mag:    vmnl(x=>lmn(Math.sqrt(ll(x).reduce((x,y)=>x+Math.pow(ln(y),2),0)))),
	heading:vmnl(x=>{const a=getpair(x);return lmn(Math.atan2(a.y,a.x))}),
	sum:    x=>ll(x).reduce(dyad['+'],ZERO),
	prod:   x=>ll(x).reduce(dyad['*'],ONE),
	raze:   x=>lit(x)?razetab(x) :ll(x).slice(1).reduce(dyad[','],monad.first(x)),
	max:    x=>ll(x).slice(1).reduce(dyad['|'],monad.first(x)),
	min:    x=>ll(x).slice(1).reduce(dyad['&'],monad.first(x)),
	count:  x=>lmn(count(x)),
	first:  x=>linil(x)?NIL: lis(x)?(x.v.length?lms(x.v[0           ]):NIL): lit(x)?monad.first(rows(x)): lion(x)?lms(x.n): linat(x)?lms('native'): count(x)?ll(x)[0]: NIL,
	last:   x=>linil(x)?NIL: lis(x)?(x.v.length?lms(x.v[x.v.length-1]):NIL): lit(x)?monad.last (rows(x)): count(x)?ll(x)[count(x)-1]: NIL,
	keys:   x=>lml(lii(x)?[]: lion(x)?x.a.map(lms): ld(x).k),
	range:  x=>lml(lin(x)?range(max(0,0|ln(x))).map(lmn): ld(x).v),
	list:   x=>lml([x]),
	typeof: x=>lms(({num:"number",str:"string",lst:"list",dic:"dict",tab:"table",on:"function",nat:"function",nil:"nil"})[x.t]||x.n||"interface"),
	flip:   x=>lit(x)?tflip(x):lml(range(ll(x).reduce((w,z)=>max(w,lil(z)?count(z):1),0)).map(i=>lml(ll(x).map(c=> !lil(c)?c: i<count(c)?c.v[i]: NIL)))),
	rows:   x=>rows(x),
	cols:   x=>{const t=lt(x),k=tab_cols(t);return lmd(k.map(lms),k.map(x=>lml(tab_get(t,x))))},
	table:  x=>lid(x)?coltab(x): lil(x)&&x.v.every(x=>lid(x)||linil(x))?rowtab(x): lil(x)&&x.v.every(x=>lil(x)||linil(x))?listab(x): lt(x),
	rev:    x=>{
		if(lis(x)&&count(x)>1)return lms(ls(x).split('').reverse().join(''))
		if(lil(x)&&count(x)>1)return lml(ll(x).slice(0).reverse())
		if(lit(x)&&count(x)>1){const r=lmt();for(let k of x.v.keys())tab_set(r,k,tab_get(x,k).slice(0).reverse());return r}
		if(lid(x)){const r=lmd();x.v.map((v,i)=>dset(r,v,x.k[i]));return r;}
		return x
	},
	distinct: x=>{
		if(lis(x)&&count(x)>1){const d=new Map();return lms(ls(x).split('').filter(x=>d.get(x)?0: (d.set(x,1),1)).join(''))}
		if(lil(x)&&count(x)>1){const d=lmd();return lml(ll(x).filter(x=>dget(d,x)?0: (dset(d,x,1),1)))}
		if(lit(x)&&count(x)>1)return monad.table(monad.distinct(monad.rows(x)))
		return x
	},
	'@tab': t=>{
		t=lt(t);const r=tab_clone(t)
		tab_set(r,'index' ,range(count(r)).map(lmn))
		tab_set(r,'gindex',range(count(r)).map(lmn))
		tab_set(r,'group' ,range(count(r)).map(x=>ZERO))
		return r
	},
}
dyad={
	'+':  vd((x,y)=>lmn(ln(x)+ln(y))),
	'-':  vd((x,y)=>lmn(ln(x)-ln(y))),
	'*':  vd((x,y)=>lmn(ln(x)*ln(y))),
	'/':  vd((x,y)=>lmn(ln(x)/ln(y))),
	'%':  vd((x,y)=>lmn(mod(ln(y),ln(x)))),
	'^':  vd((x,y)=>lmn(Math.pow(ln(x),ln(y)))),
	'<':  vd((x,y)=>lmn(lin(x)||lin(y)?ln(x)< ln(y): ls(x)< ls(y))),
	'>':  vd((x,y)=>lmn(lin(x)||lin(y)?ln(x)> ln(y): ls(x)> ls(y))),
	'=':  vd((x,y)=>lmn(lii(x)||lii(y)?x==y: linil(x)||linil(y)?x==y: lin(x)&&lin(y)?ln(x)==ln(y): ls(x)==ls(y))),
	'&':  vd((x,y)=>lin(x)||lin(y)?lmn(min(ln(x),ln(y))): lms(ls(x)<ls(y)?ls(x):ls(y))),
	'|':  vd((x,y)=>lin(x)||lin(y)?lmn(max(ln(x),ln(y))): lms(ls(x)>ls(y)?ls(x):ls(y))),
	split:(x,y)=>lml(ls(y).split(ls(x)).map(lms)),
	fuse: (x,y)=>lms(ll(y).map(ls).join(ls(x))),
	dict: (x,y)=>(y=ll(y),ll(x).reduce((d,x,i)=>dset(d,x,y[i]||NIL),lmd())),
	take: (x,y)=>lis(y)&&lin(x)&&ln(x)<0&&abs(ln(x))<=count(y)?lms(y.v.slice(count(y)+ln(x))):
                 lis(y)&&lin(x)&&ln(x)>=0&&ln(x)<=count(y)?lms(y.v.slice(0,ln(x))):
	             lin(x)?splice(take,ln(x),y):filter(1,x,y),
	drop: (x,y)=>lis(y)&&lin(x)&&ln(x)>=0?lms(y.v.slice(ln(x))):
                 lis(y)&&lin(x)&&ln(x)<0 ?lms(y.v.slice(0,max(0,count(y)+ln(x)))):
	             lin(x)?splice((x,y)=>x<0?y.slice(0,x):y.slice(x),ln(x),y):filter(0,x,y),
	limit:(x,y)=>count(y)>ln(x)?dyad.take(lmn(ln(x)),y):y,
	in:   (x,y)=>lil(x)?lml(x.v.map(x=>ina(x,y))):ina(x,y),
	',':  (x,y)=>lit(x)&&lit(y)?tcat(x,y): lid(x)?union(x,ld(y)):
                 (lis(x)||linil(x))?dyad[','](lml([x]),y): (lis(y)||linil(y))?dyad[','](x,lml([y])): lml(ll(x).concat(ll(y))),
	'~':  (x,y)=>lmbool(match(x,y)),
	unless:(x,y)=>linil(y)?x:y,
	join: (x,y)=>{ // natural join on tables.
		const f=x=>lin(x)?monad.range(x):lml(ll(x));if(!lit(x)||!lit(y))return lml(zip(f(x),f(y),dyad[',']))
		const a=x,b=y,ak=tab_cols(a),bk=tab_cols(b), ik=bk.filter(x=>ak.indexOf(x)>=0),dk=bk.filter(x=>ak.indexOf(x)<0)
		const r=lmt(); ak.forEach(k=>tab_set(r,k,[])), dk.forEach(k=>tab_set(r,k,[]))
		for(let ai=0;ai<count(a);ai++)for(let bi=0;bi<count(b);bi++)if(ik.every(k=>match(tab_cell(a,k,ai),tab_cell(b,k,bi))))
			ak.forEach(k=>tab_get(r,k).push(tab_cell(a,k,ai))),dk.forEach(k=>tab_get(r,k).push(tab_cell(b,k,bi)))
		return r
	},
	cross: (x,y)=>{ // cartesian join; force columns to be unique:
		const f=x=>lt(lin(x)?monad.range(x):lml(ll(x)));if(!lit(x)||!lit(y))return lml(rows(dyad.cross(f(x),f(y))).v.map(x=>lml(x.v)))
		const a=lt(x),b=lt(y), ak=tab_cols(a),bk=tab_cols(b),uk=[]
		const r=lmt(); ak.forEach(k=>tab_set(r,k,[])), bk.forEach(k=>{
			while(tab_has(r,k))k=k+'_';tab_set(r,k,[]),uk.push(k)
		})
		for(let bi=0;bi<count(b);bi++)for(let ai=0;ai<count(a);ai++){
			ak.forEach(k=>tab_get(r,k).push(tab_cell(a,k,ai)))
			bk.forEach((k,i)=>tab_get(r,uk[i]).push(tab_cell(b,k,bi)))
		}return r
	},
	parse: (x,y)=>{
		if(lil(y))return lml(y.v.map(y=>dyad.parse(x,y)))
		x=ls(x),y=ls(y);let f=0,h=0,m=1,pi=0,named=format_has_names(x),r=named?lmd():lml([]);while(x[f]){
			if(x[f]!='%'){if(m&&x[f]==y[h]){h++}else{m=0}f++;continue}f++
			let nk=null;if(x[f]=='['){f++;nk='';while(x[f]&&x[f]!=']')nk+=x[f++];if(x[f]==']')f++}
			let im=m,n=0,d=0,v=null,si=h,sk=x[f]=='*'&&(f++,1),lf=x[f]=='-'&&(f++,1);if(x[f]=='0')f++
			const hn=_=>m&&y[h]&&(n?h-si<n:1), id=x=>/[0-9]/.test(x), ix=_=>/[0-9a-fA-F]/.test(y[h]), iw=_=>/[ \\n]/.test(y[h])
			while(id(x[f]))n=n*10+(+x[f++]);x[f]=='.'&&f++
			while(id(x[f]))d=d*10+(+x[f++]);if(!x[f])break;const t=x[f++]
			if('%mnzsluqarojJ'.indexOf(t)<0)while(hn()&&iw())h++
			if(t=='%'){if(m&&t==y[h]){h++}else{m=0}}
			else if(t=='m'){v=lmbool(m)}
			else if(t=='n'){v=lmn(h)}
			else if(t=='z'){v=lmbool(m&&h==y.length)}
			else if(t=='s'||t=='l'||t=='u'){v=lms('');while(hn()&&(n?1:y[h]!=x[f]))v.v+=y[h++];if(t=='l')v.v=drom_tolower(v.v);if(t=='u')v.v=drom_toupper(v.v)}
			else if(t=='a'){v=lml([]);while(hn()&&(n?1:y[h]!=x[f]))v.v.push(lmn(drom_to_ord(y[h++])))}
			else if(t=='b'){v=lmbool(/[tTyYx1]/.test(y[h]));while(hn()&&(n?1:y[h]!=x[f]))h++}
			else if(t=='i'){v=lmn(0);const s=(y[h]=='-')?(h++,-1):1;m&=id(y[h]);while(hn()&&id(y[h]))v.v=v.v*10+(+y[h++]);v.v*=s}
			else if(t=='h'||t=='H'){v=lmn(0),                       m&=ix();    while(hn()&&ix())v.v=v.v*16+parseInt(y[h++],16)}
			else if(t=='j'){if(m){const j=pjson(y,h,n);h=j.index,v=j.value}else{v=NIL}}
			else if(t=='J'){if(m){const j=plove(y,h,n);h=j.index,v=j.value}else{v=NIL}}
			else if(t=='v'){v=lms(''),m&=!id(y[h]);while(hn()&&/[0-9a-zA-Z_?]/.test(y[h]))v.v+=y[h++];m&=count(v)>0}
			else if(t=='q'){
				v=lms(''),m&=y[h]=='"';if(m)h++;while(hn()&&y[h]!='"'){
					if(y[h]=='\\\\'){h++;if(/[n\\\\"]/.test(y[h])){v.v+=y[h]=='n'?'\\n':y[h]}else{m=0}}else{v.v+=y[h]}h++
				}if(m&=y[h]=='"')h++;if(!m)v=NIL
			}
			else if(t=='f'||t=='c'||t=='C'){
				v=lmn(0);let p=10,s=(y[h]=='-')?(h++,-1):1; if(t=='c'&&m&&y[h]=='$')h++
				m&=id(y[h])||y[h]=='.';  while(hn()&&id(y[h]))v.v=v.v*10+(+y[h++])
				m&&hn()&&y[h]=='.'&&h++; while(hn()&&id(y[h]))v.v+=(+y[h++])/p,p*=10;v.v*=s
			}
			else if(t=='r'||t=='o'){
				let cc=x.slice(f,f+(d||1));v=lms(''),f+=(d||1);
				while(hn()){if(cc.indexOf(y[h])>=0==lf?1:0){if(n)m=0;break}v.v+=y[h++];if(t=='o')break;}if(!m)v.v='';
			}
			else if(t=='e'||t=='p'){
				const [dy,dm,dd,dh,dmi,ds,dl,dma]=ll(dyad.parse(ISODATE,lms(y.slice(h)))), l=ln(dl), d=new Date(y.slice(h,h+l))
				if(l&&ln(dma)){h+=l}else{m=0}; v=t=='e'?lmn(m?0|(d.getTime()/1000):0):lmd(PARTS,[dy,dm,dd,dh,dmi,ds].map(x=>lmn(ln(x))))
			}else{m=0}while(n&&y[h]&&h-si<n)h++,m=0;
			if(!sk&&v){
				if     (!im&&'%mnz'.indexOf(t)==-1)v=NIL              // some previous pattern failed
				else if((h-si)==0&&'fcCihHv'.indexOf(t)>=0)v=NIL,m=0  // no characters consumed
				named?dset(r,nk!=null?lms(nk):lmn(pi),v):r.v.push(v);pi++
			}
		}return named?r: r.v.length==1?r.v[0]:r
	},
	format: (x,y)=>{
		const frec=(i,x,y)=>{
			if(i>=count(x))return y
			const fuse=(count(x)-i)%2?0:1,named=format_has_names(ls(x.v[i+fuse]))
			const r=lml(ll(lit(y)?rows(y):y).map(z=>dyad.format(x.v[i+fuse],frec(i+fuse+1,x,lit(y)&&!named?lml(ll(z)):z))))
			return fuse?dyad.fuse(x.v[i],r):r
		};if(lil(x))return frec(0,x,y)
		x=ls(x);let r='',f=0,h=0,named=format_has_names(x);y=named?ld(y):lil(y)?y:monad.list(y);while(x[f]){
			if(x[f]!='%'){r+=x[f++];continue}f++
			let nk=null;if(x[f]=='['){f++;nk='';while(x[f]&&x[f]!=']')nk+=x[f++];if(x[f]==']')f++}
			let o='',n=0,d=0,sk=x[f]=='*'&&(f++,1),lf=x[f]=='-'&&(f++,1),pz=x[f]=='0'&&(f++,1)
			const hn=_=>m&&y[h]&&(n?h-si<n:1), id=x=>/[0-9]/.test(x)
			while(id(x[f]))n=n*10+(+x[f++]);x[f]=='.'&&f++
			while(id(x[f]))d=d*10+(+x[f++]);if(!x[f])break;const t=x[f++]
			const an=named?dget(y,nk!=null?lms(nk):lmn(h)): null
			const a=t=='%'?NIL: named?(an?an:NIL): (!sk&&h<count(y))?y.v[h]: NIL; if(t!='%'&&!sk)h++
			if     (t=='%'){o='%'}
			else if(t=='s'||t=='v'){o=ls(a)}
			else if(t=='l'){o=drom_tolower(ls(a))}
			else if(t=='u'){o=drom_toupper(ls(a))}
			else if(t=='r'||t=='o'){o=ls(a),lf=1;d=max(1,d);while(d&&x[f])d--,f++;d=n;}
			else if(t=='a'){o=ll(a).map(x=>drom_from_ord(ln(x))).join('')}
			else if(t=='b'){o=lb(a)?'true':'false'}
			else if(t=='f'){o=d?ln(a).toFixed(min(100,d)):wnum(ln(a))}
			else if(t=='c'){const v=ln(a);o=(v<0?'-':'')+'$'+abs(v).toFixed(min(100,d)||2)}
			else if(t=='C'){const v=ln(a);o=(v<0?'-':'')    +abs(v).toFixed(min(100,d)||2)}
			else if(t=='i'){o=''+Math.trunc(ln(a))}
			else if(t=='h'||t=='H'){o=ln(a).toString(16);if(t=='H')o=o.toUpperCase()}
			else if(t=='e'){o=new Date(ln(a)*1000).toISOString().split('.')[0]+'Z'}
			else if(t=='p'){const d=ld(a);o=dyad.format(ISODATE,lml(PARTS.map(x=>dget(d,x)))).v}
			else if(t=='j'){o=fjson(a)}
			else if(t=='J'){o=flove(a)}
			else if(t=='q'){o=fjson(lms(ls(a)))}
			let vn=o.length; if(d&&(t=='f'||t=='c'||t=='C'))d=0;if(d&&lf)vn=min(d,vn)
			if(n&&!lf)for(let z=0;z<n-vn;z++)r+=pz?'0':' '
			for(let z=d&&!lf?max(0,vn-d):0;z<vn;z++)r+=o[z]
			if(n&&lf)for(let z=0;z<n-vn;z++)r+=pz?'0':' '
		}return lms(r)
	},
	like: (x,y)=>{
		if(!lil(y))y=monad.list(y);const pats=y.v.map(pat=>{
			const r={m:'',l:'',a:[]},ch=ls(pat).split('');for(let i=0;i<ch.length;i++){
				r.m+=ch[i]=='\`'&&i<ch.length-1?(r.l+=ch[++i],'a'): ch[i]in{'.':1,'*':1,'#':1}?(r.l+='!',ch[i]): (r.l+=ch[i],'a')
				while(ch[i]=='*'&&ch[i+1]=='*')i++
			}return r
		})
		const test=str=>{
			for(let pi=0;pi<pats.length;pi++){
				const m=pats[pi].m, l=pats[pi].l, sc=m.length, a=new Uint8Array(sc);a[0]=m[0]=='*'
				if(!sc&&!str.length){return ONE}else if(!sc)continue;for(let ci=0;ci<str.length;ci++){
					const c=str[ci];for(let si=sc-1;si>=0;si--){
						const prev=(si>0&&a[si-1])||(si==0&&ci==0)||(si>1&&m[si-1]=='*'&&a[si-2])
						a[si]=m[si]=='*'?a[si]||prev: m[si]=='.'?prev: m[si]=='#'?/[0-9]/.test(c)&&prev: c==l[si]&&prev
					}
				}if(a[sc-1]||(sc>1&&m[sc-1]=='*'&&a[sc-2]))return ONE
			}return ZERO
		};return lil(x)?lml(x.v.map(x=>test(ls(x)))): test(ls(x))
	},
	window: (x,y)=>{
		let n=ln(x), r=[], con;if(lis(y)){y=ls(y),con=lms}else{y=ll(y),con=lml}
		if(n>0){     for(let z=0;z    <y.length;z+=n)r.push(con(y.slice(z,z+n)))}
		if(n<0){n=-n;for(let z=0;z+n-1<y.length;z++ )r.push(con(y.slice(z,z+n)))}
		return lml(r)
	},
	fill: (x,y)=>{
		if(lit(y)){const r=lmt();for(let k of y.v.keys())tab_set(r,k,ll(dyad.fill(x,lml(tab_get(y,k)))));return r}
		return lil(y)?lml(ll(y).map(z=>dyad.fill(x,z))): lid(y)?lmd(y.k.slice(0),y.v.map(z=>dyad.fill(x,z))): linil(y)?x: y
	},
	'@where': (col,tab)=>{
		const w=dyad.take(lmn(count(tab)),lml(ll(col)))
		const p=lml(range(count(tab)).filter(i=>lb(w.v[i])).map(lmn))
		const r=dyad.take(p,tab);tab_set(r,'gindex',range(count(r)).map(lmn));return r
	},
	'@by': (col,tab)=>{
		const b=dyad.take(lmn(count(tab)),lml(ll(col))), r=monad.rows(tab), u=b.v.reduce((x,y)=>{dset(x,y,y);return x},lmd([],[]))
		const rows=u.v.map((v,group)=>{
			const p=lml(range(count(tab)).filter(x=>match(v,b.v[x])).map(lmn))
			const s=dyad.take(p,tab);tab_set(s,'gindex',range(count(s)).map(lmn)),tab_set(s,'group',range(count(s)).map(_=>lmn(group)));return s
		});return lml(rows)
	},
}
merge=(vals,keys,widen)=>{
	const i=lms('@index');let ix=null
	if(!widen){ix=lml([]);vals.v.map((val,z)=>{dget(val,i).v.map(x=>ix.v.push(x))})}
	if(widen)vals.v=vals.v.filter(x=>count(dget(x,i)))
	if(count(vals)==0)vals.v.push(keys.v.reduce((x,y)=>dset(x,y,lml([])),lmd()))
	let r=monad.raze(lml(vals.v.map(x=>monad.table(widen?x:dyad.drop(i,x)))))
	if(widen){ix=lml(tab_get(r,'@index')),r=dyad.drop(i,r)}
	return {r,ix}
}
n_uplevel=([a])=>{let i=2, e=getev(), r=null, name=ls(a); while(e&&i){r=e.v.get(name);if(r)i--;e=e.p};return r||NIL}
n_eval=([x,y,extend])=>{
	y=y?ld(y):lmd();const yy=lmd(y.k.slice(0),y.v.slice(0)), r=lmd(['value','vars'].map(lms),[NIL,yy])
	const feval=([r,x])=>{
		dset(r,lms('value'),x);const b=dget(r,lms('vars')), v=getev().v;
		for(let k of v.keys()){dset(b,lms(k),v.get(k))};return r
	}
	try{
		const prog=parse(x?ls(x):'')
		blk_opa(prog,op.BUND,2),blk_lit(prog,lmnat(feval)),blk_op(prog,op.SWAP),blk_op(prog,op.CALL)
		issue(env_bind(extend&&lb(extend)?getev():null,yy.k.map(ls),lml(yy.v)),prog)
	}catch(e){dset(r,lms('error'),lms(e.x)),dset(r,lms('errorpos'),lml([lmn(e.r),lmn(e.c)]))};return r
}
triad={
	'@orderby': (col,tab,order_dir)=>{
		const lex_list=(x,y,a,ix)=>{
			if(x.length<ix&&y.length<ix)return 0;const xv=x[ix]||NIL,yv=y[ix]||NIL
			return lex_less(xv,yv)?a: lex_more(xv,yv)?!a: lex_list(x,y,a,ix+1)
		}
		const lex_less=(a,b)=>lil(a)&&lil(b)? lex_list(a.v,b.v,1,0): lb(dyad['<'](a,b))
		const lex_more=(a,b)=>lil(a)&&lil(b)? lex_list(a.v,b.v,0,0): lb(dyad['>'](a,b))
		const o=dyad.take(lmn(count(tab)),lml(ll(col)));order_dir=ln(order_dir)
		const pv=range(count(tab)).sort((a,b)=>{
			if(lex_less(o.v[a],o.v[b]))return  order_dir
			if(lex_more(o.v[a],o.v[b]))return -order_dir
			return a-b // produce a stable sort
		})
		const rt=dyad.take(lml(pv.map(lmn)),tab)
		tab_set(rt,'gindex',range(count(tab)).map(lmn));return rt
	},
	'@sel': (orig,vals,keys)=>{
		const mv=merge(vals,keys,0);return count(keys)>1?mv.r: dyad.take(mv.ix,dyad.drop(lml(['index','gindex','group'].map(lms)),orig))
	},
	'@ext': (orig,vals,keys)=>{
		const r=monad.cols(triad['@sel'](orig,vals,keys))
		return count(keys)==1?(count(r)?monad.first(r):lml([])): count(r)!=1||count(r.k[0])?r: monad.first(r)
	},
	'@upd': (orig,vals,keys)=>{
		orig=dyad.drop(lml(['index','gindex','group'].map(lms)),orig);const mv=merge(vals,keys,1),r=mv.r,ix=mv.ix
		tab_cols(r).map(c=>{
			if(tab_get(r,c)==ix)return;const ci=tab_has(orig,c),col=range(count(orig)).map(z=>ci?tab_cell(orig,c,z):NIL)
			tab_set(orig,c,col),ix.v.map((x,row)=>col[0|ln(x)]=tab_cell(r,c,row))
		});return orig
	},
	'@ins': (v,n,x)=>{
		const nc=count(n), rc=Math.ceil(count(v)/nc), r=monad.table(lmd(n.v,n.v.map((_,z)=>lml(range(rc).map(r=>v.v[nc*r+z]||NIL)))))
		return lin(x)?r:dyad[','](lt(x),r)
	},
}

findop=(n,prims)=>Object.keys(prims).indexOf(n), as_enum=x=>x.split(',').reduce((x,y,i)=>{x[y]=i;return x},{})
let tnames=0;tempname=_=>lms(\`@t\${tnames++}\`)
op=as_enum('JUMP,JUMPF,JUMPT,LIT,DUP,DROP,SWAP,OVER,BUND,OP1,OP2,OP3,GET,SET,LOC,AMEND,TAIL,CALL,BIND,ITER,EACH,NEXT,COL,IPRE,IPOST,FIDX,FMAP')
oplens=   [ 3   ,3    ,3    ,3  ,1  ,1   ,1   ,1   ,3   ,3  ,3  ,3  ,3  ,3  ,3  ,3    ,1   ,1   ,1   ,1   ,3   ,3   ,1  ,3   ,3    ,3   ,3    ]
blk_addb=(x,n  )=>x.b.push(0xFF&n)
blk_here=(x    )=>x.b.length
blk_setb=(x,i,n)=>x.b[i]=0xFF&n
blk_getb=(x,i  )=>0xFF&x.b[i]
blk_adds=(x,n  )=>{blk_addb(x,n>>8),blk_addb(x,n)}
blk_sets=(x,i,n)=>{blk_setb(x,i,n>>8),blk_setb(x,i+1,n)}
blk_gets=(x,i  )=>0xFFFF&(blk_getb(x,i)<<8|blk_getb(x,i+1))
blk_op  =(x,o  )=>{blk_addb(x,o);if(o==op.COL)blk_addb(x,op.SWAP)}
blk_opa =(x,o,i)=>{blk_addb(x,o),blk_adds(x,i);return blk_here(x)-2}
blk_imm =(x,o,k)=>{let i=x.locals.findIndex(x=>match(x,k));if(i==-1)i=x.locals.length,x.locals.push(k);blk_opa(x,o,i)}
blk_op1 =(x,n)=>blk_opa(x,op.OP1,findop(n,monad))
blk_op2 =(x,n)=>blk_opa(x,op.OP2,findop(n,dyad ))
blk_op3 =(x,n)=>blk_opa(x,op.OP3,findop(n,triad))
blk_lit =(x,v)=>blk_imm(x,op.LIT,v)
blk_set =(x,n)=>blk_imm(x,op.SET,n)
blk_loc =(x,n)=>blk_imm(x,op.LOC,n)
blk_get =(x,n)=>blk_imm(x,op.GET,n)
blk_getimm=(x,i)=>x.locals[i]
blk_cat=(x,y)=>{
	let z=0,base=blk_here(x);while(z<blk_here(y)){
		const b=blk_getb(y,z);if(b==op.LIT||b==op.GET||b==op.SET||b==op.LOC||b==op.AMEND){blk_imm(x,b,blk_getimm(y,blk_gets(y,z+1)))}
		else if(b==op.JUMP||b==op.JUMPF||b==op.JUMPT||b==op.EACH||b==op.NEXT||b==op.FIDX){blk_opa(x,b,blk_gets(y,z+1)+base)}
		else{for(let i=0;i<oplens[b];i++)blk_addb(x,blk_getb(y,z+i))}z+=oplens[b]
	}
}
blk_loop=(b,names,f)=>{
	blk_op(b,op.ITER);const head=blk_here(b);blk_lit(b,names);const each=blk_opa(b,op.EACH,0)
	f(),blk_opa(b,op.NEXT,head),blk_sets(b,each,blk_here(b))
}
blk_end=x=>{
	let z=0;while(z<blk_here(x)){
		let b=blk_getb(x,z);z+=oplens[b];if(b!=op.CALL)continue
		let t=1,i=z;while(i<blk_here(x)){if(blk_getb(x,i)!=op.JUMP){t=0;break}const a=blk_gets(x,i+1);if(a<=i){t=0;break}i=a}if(t)blk_setb(x,z-1,op.TAIL)
	}return x
}

parse=text=>{
	let i=0,r=0,c=0, tq=null // text index, row, column, token queued
	const er=x=>{throw {x,r,c,i,stack:new Error().stack}}
	const nc=_=>{const x=text[i++];x=='\\n'?(r++,c=0):(c++);return x}
	const iw=_=>text[i]in{' ':1,'\\t':1,'\\n':1,'#':1}
	const sw=_=>{while(iw())if(text[i]=='#')while(i<text.length&&text[i]!='\\n')nc();else nc()}
	const id=_=>0<='0123456789'.indexOf(text[i])
	//          !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~
	const tcc=' s" sss ()ssssdsdddddddddd: sssn@nnnnnnnnnnnnnnnnnnnnnnnnnn[ ]sn nnnnnnnnnnnnnnnnnnnnnnnnnn s s'
	const ncc='                nnnnnnnnnn     n nnnnnnnnnnnnnnnnnnnnnnnnnn    n nnnnnnnnnnnnnnnnnnnnnnnnnn    '
	const mcc='     xx x xxxx x          x xxx x                          x  x                             x x'
	const esc={'\\\\':'\\\\','"':'"','n':'\\n'}
	const ne=_=>{const e=nc();return esc[e]?esc[e]: er(\`Invalid escape character '\\\\\${e}' in string.\`)}
	const nw=x=>{let v=+x;    while(id())v=(v*10)+(+nc());  return v} 
	const nf=_=>{let v=0,p=10;while(id())v+=(+nc())/p,p*=10;return v}
	const nn=(x,tr,tc,v,sign)=>{
		if(x=='.'&&!id())return{t:'.',r:tr,c:tc}
		if(x=='.')v=nf();else v=nw(x),v+=(text[i]=='.')?(nc(),nf()):0
		return {t:'number',v:sign*v,r:tr,c:tc}
	}
	const tok=_=>{
		const w=iw()||i==0||(mcc[text[i-1].charCodeAt(0)-32]=='x');sw();if(i>=text.length)return{t:'the end of the script'}
		const tr=r,tc=c, x=nc(), cc=tcc[x.charCodeAt(0)-32]; let v=0
		if(cc==' '||cc==undefined)er(\`Invalid character '\${x}'.\`)
		if(x=='-'&&w&&tcc[(text[i]||'').charCodeAt(0)-32]=='d')return nn(nc(),r,c,v,-1)
		if(cc=='n'){let v=x; while(ncc[(text[i]||' ').charCodeAt(0)-32]=='n')v+=nc();return {t:'name',v,r:tr,c:tc}}
		if(cc=='"'){let v='',c;while(i<text.length&&(c=nc())!='"')v+=(c=='\\\\'?ne():clchars(c));return{t:'string',v,r:tr,c:tc}}
		return cc=='s'?{t:'symbol',v:x,r:tr,c:tc}: cc=='d'?nn(x,tr,tc,v,1):{t:x,r:tr,c:tc}
	}
	const peek=_=>{if(!tq)tq=tok();return tq}
	const hasnext=_=>peek().t!='the end of the script'
	const peek2=_=>{const pi=i,pr=r,pc=c,pq=tq;next();const v=peek();i=pi,r=pr,c=pc,tq=pq;return v}
	const next=_=>{if(tq){const r=tq;tq=null;return r};return tok()}
	const matchp=k=>peek().t=='name'&&peek().v==k
	const match=k=>matchp(k)?(next(),1):0
	const matchsp=k=>peek().t==k?(next(),1):0
	const expect=t=>peek().t==t?next().v:er(\`Expected \${t}, but found \${peek().t}.\`)
	const ident=n=>{
		const kw={while:1,each:1,send:1,on:1,if:1,elseif:1,else:1,end:1,do:1,with:1,local:1,select:1,extract:1,update:1,insert:1,
			into:1,from:1,where:1,by:1,orderby:1,asc:1,desc:1};return !(kw.hasOwnProperty(n)||monad.hasOwnProperty(n)||dyad.hasOwnProperty(n))
	}
	const name=n=>{const r=expect('name');if(!ident(r)&&n!='member')er(\`'\${r}' is a keyword, and cannot be used for a \${n} name.\`);return r}
	const names=(x,n)=>{const r=[];while(!match(x))r.push(name(n));return r}
	const quote=_=>{const r=lmblk();expr(r);blk_end(r);return r}
	const block=_=>{const r=lmblk();iblock(r);return r}
	const quotesub=_=>{let c=0,r=lmblk();while(hasnext()&&!matchsp(']'))expr(r),c++;blk_opa(r,op.BUND,c);return r}
	const quotedot=_=>{const r=lmblk();blk_lit(r,lml([lms(name('member'))]));return r}
	const iblock=r=>{let c=0;while(hasnext()){if(match('end')){if(!c)blk_lit(r,NIL);return}if(c)blk_op(r,op.DROP);expr(r),c++};er(\`Expected 'end' for block.\`)}
	const parseclause=(b,func)=>{
		const iter_group=(g,f)=>{if(g){const n=tempname();blk_loop(b,[ls(n)],_=>{blk_get(b,n),f()})}else{f()}}
		if(match('where')){
			const ex=quote(),grouped=parseclause(b,func)
			iter_group(grouped,_=>{blk_lit(b,ex),blk_op(b,op.COL),blk_op2(b,'@where')});return grouped
		}
		if(match('orderby')){
			const ex=quote(),dir=match('asc')?-1: match('desc')?1: er(\`Expected 'asc' or 'desc'.\`), grouped=parseclause(b,func)
			iter_group(grouped,_=>{blk_lit(b,ex),blk_op(b,op.COL),blk_lit(b,lmn(dir)),blk_op3(b,'@orderby')});return grouped
		}
		if(match('by')){
			const ex=quote(),grouped=parseclause(b,func);if(grouped)blk_op1(b,'raze')
			blk_lit(b,ex),blk_op(b,op.COL),blk_op2(b,'@by');return 1
		}
		if(!match('from'))er(\`Expected 'from'.\`);expr(b),blk_op1(b,'@tab'),blk_op(b,op.DUP);return 0
	}
	const parsequery=(b,func,dcol)=>{
		const cols=lmd([],[]);while(!matchp('from')&&!matchp('where')&&!matchp('by')&&!matchp('orderby')){
			let set=peek2().t==':', lit=peek().t=='string', name=lms(lit?(set?peek().v:''):peek().t=='name'?peek().v:'')
			let get=ident(ls(name)), unique=ls(name).length&&dkix(cols,name)==-1; if(set&&lit&&!unique)next(),next()
			const x=set&&unique?(next(),next(),name): get&&unique&&dcol?name: lms(dcol?\`c\${cols.k.length}\`: '')
			cols.k.push(x),cols.v.push(quote())
		}
		const grouped=parseclause(b,func), index=lmblk();blk_get(index,lms('index'))
		const keys=lml(cols.k.concat([lms('@index')])),n=tempname();if(!grouped)blk_op1(b,'list')
		blk_loop(b,[ls(n)],_=>{
			blk_lit(b,keys),blk_get(b,n),cols.v.map(x=>(blk_lit(b,x),blk_op(b,op.COL)))
			blk_lit(b,index),blk_op(b,op.COL),blk_op(b,op.DROP),blk_opa(b,op.BUND,count(keys)),blk_op2(b,'dict')
		}),blk_lit(b,keys),blk_op3(b,func)
	}
	const parseindex=(b,name)=>{
		const i=[];while(({'[':1,'.':1})[peek().t]){
			if(matchsp('['))i.push(quotesub())
			if(matchsp('.')){
				if(({'[':1,'.':1})[peek().t]){
					const vn=tempname()
					i.map(v=>(blk_cat(b,v),blk_op(b,op.CALL))),blk_loop(b,[vn.v],_=>{blk_get(b,vn),parseindex(b)});return
				}else{i.push(quotedot())}
			}
		}
		if(matchsp(':')){
			i.map(v=>blk_cat(b,v)),blk_opa(b,op.BUND,i.length),blk_op(b,op.OVER)
			for(let z=0;z<i.length-1;z++)blk_opa(b,op.IPRE,z),blk_opa(b,op.IPOST,z);expr(b),blk_imm(b,op.AMEND,name||ZERO)
		}else{i.map(v=>(blk_cat(b,v),blk_op(b,op.CALL)))}
	}
	const term=b=>{
		if(peek().t=='number'){blk_lit(b,lmn(next().v));return}
		if(peek().t=='string'){blk_lit(b,lms(next().v));return}
		if(match('if')){
			const fin=[];let c=0,e=0,next=-1;expr(b);next=blk_opa(b,op.JUMPF,0);while(hasnext()){
				if(match('elseif')){
					if(e)er(\`Expected 'end'.\`)
					if(!c)blk_lit(b,NIL);c=0;fin.push(blk_opa(b,op.JUMP,0)),blk_sets(b,next,blk_here(b)),expr(b),next=blk_opa(b,op.JUMPF,0);continue
				}
				if(match('else')){
					if(e)er(\`Expected 'end'.\`)
					if(!c)blk_lit(b,NIL);c=0,e=1;fin.push(blk_opa(b,op.JUMP,0)),blk_sets(b,next,blk_here(b)),next=-1;continue
				}
				if(match('end')){
					if(!c)blk_lit(b,NIL);c=0;if(!e)fin.push(blk_opa(b,op.JUMP,0));if(next!=-1)blk_sets(b,next,blk_here(b));if(!e)blk_lit(b,NIL)
					fin.map(x=>blk_sets(b,x,blk_here(b)));return
				}
				if(c)blk_op(b,op.DROP);expr(b),c++
			}
		}
		if(match('while')){
			blk_lit(b,NIL);const cond=blk_opa(b,op.JUMP,0);const e=lmblk();expr(e);const head=blk_here(b)
			if(!match('end')){blk_op(b,op.DROP),iblock(b)}
			blk_sets(b,cond,blk_here(b)),blk_cat(b,e),blk_opa(b,op.JUMPT,head);return
		}
		if(match('each')){const n=names('in','variable');expr(b),blk_loop(b,n,_=>iblock(b));return}
		if(match('on')){
			const n=name('function'),v=matchsp('.')&&matchsp('.')&&matchsp('.');let a=names('do','argument')
			if(v&&a.length!=1)return er(\`Variadic functions must take exactly one named argument.\`);if(v)a=['...'+a[0]]
			blk_lit(b,lmon(n,a,blk_end(block()))),blk_op(b,op.BIND);return
		}
		if(match('send')){
			blk_lit(b,lmnat(n_uplevel)),blk_lit(b,lml([lms(name('function'))])),blk_op(b,op.CALL)
			expect('['),blk_cat(b,quotesub()),blk_op(b,op.CALL);return
		}
		if(match('local')){const n=lms(name('variable'));expect(':'),expr(b),blk_loc(b,n);return}
		if(match('select' )){parsequery(b,'@sel',1);return}
		if(match('extract')){parsequery(b,'@ext',0);return}
		if(match('update' )){parsequery(b,'@upd',1);return}
		if(match('insert')){
			const n=lml([]);while(!match('with')){n.v.push(lms(peek().t=='string'?next().v:name('column')))}
			let v=0,i=0;while(1){if(match('into')){i=1;break}if(match('end')){i=0;break}expr(b),v++}
			if(n.v.length==0&&v==0&&i==0){blk_lit(b,lmt());return}
			if(n.v.length<1)n.v.push(lms('value'));blk_opa(b,op.BUND,v),blk_lit(b,n);if(i){expr(b)}else{blk_lit(b,ZERO)}
			blk_op3(b,'@ins');return
		}
		if(matchsp('(')){if(matchsp(')')){blk_lit(b,lml([]));return}expr(b),expect(')');return}
		const s=peek().v;if(findop(s,monad)>=0&&({'symbol':1,'name':1})[peek().t]){
			next();if(matchsp('@')){
				let depth=0,l=lmblk();while(matchsp('@'))depth++
				expr(b),blk_opa(l,op.FMAP,findop(s,monad))
				while(depth-->0){const t=tempname(),m=lmblk();blk_loop(m,[ls(t)],_=>{blk_get(m,t),blk_cat(m,l)}),l=m}
				blk_cat(b,l)
			}else{expr(b),blk_op1(b,s)};return
		}const n=lms(name('variable'));if(matchsp(':')){expr(b),blk_set(b,n);return}blk_get(b,n),parseindex(b,n)
	}
	const expr=b=>{
		term(b);if(({'[':1,'.':1})[peek().t]){parseindex(b)}
		if(matchsp('@')){
			let depth=0;while(matchsp('@'))depth++
			const func=tempname();blk_set(b,func),blk_op(b,op.DROP),expr(b)
			let l=lmblk();blk_get(l,func),blk_op(l,op.SWAP);const fidx=blk_opa(l,op.FIDX,0)
			blk_loop(l,['v'],_=>{blk_get(l,func),blk_get(l,lms('v')),blk_opa(l,op.BUND,1),blk_op(l,op.CALL)})
			blk_sets(l,fidx,blk_here(l))
			while(depth-->0){const t=tempname(),m=lmblk();blk_loop(m,[ls(t)],_=>{blk_get(m,t),blk_cat(m,l)}),l=m}
			blk_cat(b,l);return
		}const s=peek().v;if(findop(s,dyad)>=0&&({'symbol':1,'name':1})[peek().t]){next(),expr(b),blk_op2(b,s)}
	}
	const b=lmblk();if(hasnext())expr(b);while(hasnext())blk_op(b,op.DROP),expr(b)
	if(blk_here(b)==0)blk_lit(b,NIL);return b
}

env_local=(e,n,x)=>{e.v.set(ls(n),x)}
env_getr =(e,n  )=>{const k=ls(n);r=e.v.get(k);return r?r: e.p?env_getr(e.p,n): null}
env_setr =(e,n,x)=>{const k=ls(n);r=e.v.get(k);return r?e.v.set(k,x): e.p?env_setr(e.p,n,x): null}
env_get  =(e,n  )=>env_getr(e,n)||NIL
env_set  =(e,n,x)=>{const r=env_getr(e,n);r?env_setr(e,n,x):env_local(e,n,x)}
env_bind =(e,k,v)=>{const r=lmenv(e); k.map((a,i)=>env_local(r,lms(a),v.v[i]||NIL));return r}
const monadi=Object.values(monad), dyadi=Object.values(dyad), triadi=Object.values(triad), states=[]; let state=null, op_count=0
pushstate=env=>{if(state){states.push(state)};state={e:[env],p:[],t:[],pcs:[]}}
popstate =_=>{state=states.pop()}
halt     =_=>{state.p=[],state.t=[],state.e=[state.e[0]]}
running  =_=>state.t.length>0
getev    =_=>state.e  [state.e  .length-1]
getblock =_=>state.t  [state.t  .length-1]
getpc    =_=>state.pcs[state.pcs.length-1]
setpc    =x=>state.pcs[state.pcs.length-1]=x
issue    =(env,blk)=>(state.e.push(env),state.t.push(blk),state.pcs.push(0))
descope  =_=>(state.e.pop(),state.t.pop(),state.pcs.pop())
ret      =x=>state.p.push(x)
arg      =_=>state.p.pop()
docall=(f,a,tail)=>{
	if(linat(f)){ret(f.f(ll(a)));return}
	if(!lion(f)){ret(l_at(f,monad.first(a)));return}
	if(tail){descope()}
	issue(f.a.length==1&&f.a[0][0]=='.'?env_bind(f.c,[f.a[0].slice(3)],monad.list(a)): env_bind(f.c,f.a,a),f.b)
	calldepth=max(calldepth,state.e.length)
}
runop=_=>{
	op_count+=1
	const b=getblock();if(!liblk(b))ret(state.t.pop())
	const pc=getpc(),o=blk_getb(b,pc),imm=(oplens[o]==3?blk_gets(b,1+pc):0); setpc(pc+oplens[o])
	switch(o){
		case op.DROP :arg();break
		case op.DUP  :{const a=arg();ret(a),ret(a);break}
		case op.SWAP :{const a=arg(),b=arg();ret(a),ret(b);break}
		case op.OVER :{const a=arg(),b=arg();ret(b),ret(a),ret(b);break}
		case op.JUMP :setpc(imm);break
		case op.JUMPF:if(!lb(arg()))setpc(imm);break
		case op.JUMPT:if( lb(arg()))setpc(imm);break
		case op.LIT  :ret(blk_getimm(b,imm));break
		case op.GET  :{ret(env_get(getev(),blk_getimm(b,imm)));break}
		case op.SET  :{const v=arg();env_set(getev(),blk_getimm(b,imm),v),ret(v);break}
		case op.LOC  :{const v=arg();env_local(getev(),blk_getimm(b,imm),v),ret(v);break}
		case op.BUND :{const r=[];for(let z=0;z<imm;z++)r.push(arg());r.reverse(),ret(lml(r));break}
		case op.OP1  :{                      ret(monadi[imm](arg()    ));break}
		case op.OP2  :{const         y=arg();ret(dyadi [imm](arg(),y  ));break}
		case op.OP3  :{const z=arg(),y=arg();ret(triadi[imm](arg(),y,z));break}
		case op.IPRE :{const s=arg(),i=arg();ret(i),docall(s,i.v[imm]);if(lion(s)||lii(s)||linat(s)){for(let z=0;z<=imm;z++)i.v[z]=null}break}
		case op.IPOST:{const s=arg(),i=arg(),r=arg();ret(i.v[imm]?r:s),ret(i),ret(s);break}
		case op.AMEND:{
			let v=arg(),r=arg(),i=ll(arg()),ro=arg(),n=blk_getimm(b,imm),t={v:1}
			if(i.length&&!i[0]){i=i.filter(x=>x),t.v=0}r=amendv(ro,i,v,0,t);if(t.v&&!lin(n))env_set(getev(),n,r);ret(r);break
		}
		case op.CALL : // fall through:
		case op.TAIL :{const a=arg(),f=arg();docall(f,a,o==op.TAIL);break}
		case op.BIND :{const f=arg(),r=lmon(f.n,f.a,f.b);r.c=getev(),env_local(getev(),lms(f.n),r),ret(r);break}
		case op.ITER :{const x=arg();ret(lil(x)?x:ld(x));ret(lid(x)?lmd():lml([]));break}
		case op.FIDX :{const x=arg(),f=arg();if((lid(f)||lil(f)||lis(f))&&lil(x)){ret(lml(x.v.map(x=>l_at(f,x))));setpc(imm)}else{ret(x)};break}
		case op.FMAP :{const x=arg(),f=monadi[imm];ret(lid(x)?lmd(x.k,x.v.map(f)):lml(ll(x).map(f)));break}
		case op.EACH :{
			const n=arg(),r=arg(),s=arg();if(count(r)==count(s)){setpc(imm),ret(r);break}
			const z=count(r), v=lml([s.v[z],lid(s)?s.k[z]:lmn(z),lmn(z)]);
			state.e.push(env_bind(getev(),n,v)),ret(s),ret(r);break
		}
		case op.NEXT :{const v=arg(),r=arg(),s=arg();state.e.pop();if(lid(r))r.k.push(s.k[r.v.length]);r.v.push(v),ret(s),ret(r),setpc(imm);break}
		case op.COL  :{
			const ex=arg(),t=arg(),n=tab_cols(t),v=ll(monad.cols(t));ret(t)
			n.push('column'),v.push(t),issue(env_bind(getev(),n,lml(v)),ex);break
		}
	}while(running()&&getpc()>=blk_here(getblock()))descope()
}

fchar=x=>x=='I'?'i': x=='B'?'b': x=='L'?'s': x=='t'?'J': x=='T'?'J': x
n_writecsv=([x,y,d])=>{
	let r='', spec=y?ls(y).split(''):[];const t=lt(x), c=tab_cols(t).length; d=d?ls(d)[0]:','
	while(spec.length<c)spec.push('s')
	let n=0;spec.forEach((x,i)=>{if(x=='_')return;if(n)r+=d;n++;r+=tab_cols(t)[i]||\`c\${i+1}\`})
	rows(t).v.forEach(row=>{
		r+='\\n';let n=0;spec.forEach((x,i)=>{
			if(x=='_')return;if(n)r+=d;n++
			const vv=row.v[i], fc=fchar(x), sv=dyad.format(lms('%'+fc),fc=='j'||fc=='a'?monad.list(vv):vv).v
			r+=(/["\\n]/.test(sv)||sv.indexOf(d)>=0?\`"\${sv.replace(/"/g,'""')}"\`:sv)
		})
	});return lms(r)
}
n_readcsv=([x,y,d])=>{
	let i=0,n=0, spec=y&&lis(y)?ls(y):null, text=count(x)?ls(x):'', r=lmt(); d=d?ls(d)[0]:','
	const nv=_=>{let r='';while(text[i]&&text[i]!='\\n'&&text[i]!=d)r+=text[i++];return r}, match=x=>text[i]==x?(i++,1):0
	while(i<text.length&&text[i]!='\\n'){
		while(match(' '));const v=nv();if(!spec||(n<spec.length&&spec[n]!='_'))tab_set(r,v,[]);n++;if(match('\\n'))break;while(match(' '));match(d)
	}
	while(spec&&n<spec.length){if(spec[n]!='_'){tab_set(r,'c'+n,[])};n++}
	if(!spec)spec='s'.repeat(tab_cols(r).length)
	let slots=0,slot=0;spec.split('').map(z=>{if(z!='_')slots++;});slots=min(slots,tab_cols(r).length),n=0
	if(i>=text.length)return r;while(i<=text.length){
		while(match(' '));
		let val='';if(match('"')){while(text[i]){if(match('"')){if(match('"')){val+='"'}else{break}}else{val+=text[i++]}}}else{val=nv()}
		if(spec[n]&&spec[n]!='_'){
			const k=tab_cols(r)[slot], x=(val[0]||'').toLowerCase(), s=spec[n]
			let sign=1,o=0; if(val[o]=='-')sign=-1,o++;if(val[o]=='$')o++;
			tab_get(r,k).push(dyad.parse(lms('%'+fchar(s)),lms(val))),slot++
		};n++
		if(i>=text.length||text[i]=='\\n'){
			while(n<spec.length){const u=spec[n++];if(u!='_'&&slot<slots)tab_get(r,tab_cols(r)[slot++]).push(NIL);}
			if(text[i]=='\\n'&&i==text.length-1)break;i++,n=0,slot=0
		}else{while(match(' '));match(d)}
	};return r
}
n_writexml=([x,fmt])=>{
	fmt=fmt?lb(fmt):0
	const esc=x=>{const e={'&':'amp',"'":'apos','"':'quot','<':'lt','>':'gt'};return ls(x).replace(/[&'"<>]/g,x=>e[x]?\`&\${e[x]};\`:x)}
	const rec=(x,tab)=>{
		if(array_is(x)){
			const ck=lms('cast'),c=ifield(x,'cast');iwrite(x,ck,lms('char'))
			const r=iwrite(x,lml([ZERO,ifield(x,'size')]));iwrite(x,ck,c);return ls(r)
		}
		if(lil(x))return x.v.map(x=>rec(x,tab)).join(''); if(!lid(x))return esc(x)+((tab&&fmt)?'\\n':'')
		const t=ls(dget(x,lms('tag'))||lms('')),a=ld(dget(x,lms('attr'))||lmd()),c=ll(dget(x,lms('children'))||lml([]))
		const r=\`<\${t}\${a.k.map((k,i)=>\` \${ls(k)}="\${esc(a.v[i])}"\`).join('')}\${c.length?'':'/'}>\${fmt?'\\n':''}\`
		return c.length?\`\${r}\${c.map(x=>(' '.repeat(fmt?tab+2:0))+rec(x,tab+2)).join('')}\${' '.repeat(fmt?tab:0)}</\${t}>\${fmt?'\\n':''}\`:r
	};return lms(rec(x,0))
}
n_readxml=([x])=>{
	let i=0,t=ls(x)
	const xm=x=>t[i]==x?(i++,1):0
	const xc=_=>{while(t[i]&&t[i]!='>')i++;i++}
	const xs=_=>{let w=0;while(/[ \\n]/.test(t[i]))i++,w=1;return w}
	const xe=(a,b)=>t.slice(i,i+2+a.length)==\`&\${a};\`?(i+=2+a.length,b):null
	const name=_=>{let r='';xs();while(t[i]&&!/[>/= \\n]/.test(t[i]))r+=t[i++];xs();return r.toLowerCase()}
	const text=stop=>{
		let r='';while(t[i]&&!(stop==' '&&/[>/ \\n]/.test(t[i]))){
			if(xs())r+=' ';if(stop==t[i]||!t[i])break;r+=xe('amp','&')||xe('apos',"'")||xe('quot','"')||xe('lt','<')||xe('gt','>')||xe('nbsp',' ')||t[i++]
		}if(/['"]/.test(stop)&&t[i])i++;return lms(r)
	}
	const rec=ctag=>{
		let r=[];while(t[i]){
			const w=xs();if(t.slice(i,i+9)=='<![CDATA['){i+=9;let c='';while(t[i]&&t.slice(i,i+3)!=']]>')c+=t[i++];i+=3;r.push(lms(c));continue}
			if(t[i]!='<'){if(w)i--;r.push(text('<'));continue}i++,xs()
			if(xm('!')||xm('?')){xc();continue};if(xm('/')){const n=name();xm('>');if(ctag==n)break;continue}
			const tag=lmd(),attr=lmd(),n=name();r.push(tag),dset(tag,lms('tag'),lms(n)),dset(tag,lms('attr'),attr),dset(tag,lms('children'),lml([]))
			while(t[i]&&!/[>/]/.test(t[i])){const n=lms(name());if(xm('=')){xs(),dset(attr,n,text(xm("'")?"'":xm('"')?'"':' '))}else{dset(attr,n,ONE)}}
			if(xm('/')){xc()}else{if(t[i])i++;dset(tag,lms('children'),rec(n))}
		}return lml(r)
	}
	return rec('')
}
n_random=z=>{
	const randint=x=>{let y=seed;y^=(y<<13),y^=(y>>>17),(y^=(y<<15));return mod(seed=y,x);} // xorshift32
	const randelt=x=>lin(x)?lmn(randint(ln(x))): count(x)<1?NIL: l_at(x,lmn(randint(count(x))))
	if(z.length==0){randint(1);return lmn((seed&0x7FFFFFFF)/0x7FFFFFFF)}
	let x=z[0]||NIL;if(lid(x))x=monad.range(x);if(z.length<2)return randelt(x)
	const y=ln(z[1]);if(y>=0){const r=[];for(let z=0;z<y;z++)r.push(randelt(x));return lml(r);}
	x=lin(x)?monad.range(x).v:ll(x);if(x.length<1)x=[NIL];const p=range(x.length),r=[]
	for(let i=x.length-1;i>0;i--){const j=randint(i+1),t=p[j];p[j]=p[i],p[i]=t}
	for(let z=0;z<abs(y);z++)r.push(x[p[z%x.length]]);return lml(r)
}
let frame_count=0
interface_system=lmi((self,i,x)=>{
	if(!i)return NIL
	if(x){
		if(lis(i)&&i.v=='seed'){seed=0|ln(x);return x}
		if(lis(i)&&i.v=='ops' ){op_count=ln(x);return x}
	}
	if(lis(i)&&i.v=='version'   )return lms(VERSION)
	if(lis(i)&&i.v=='platform'  )return lms('web')
	if(lis(i)&&i.v=='seed'      )return lmn(seed)
	if(lis(i)&&i.v=='frame'     )return lmn(frame_count)
	if(lis(i)&&i.v=='ops'       )return lmn(op_count)
	if(lis(i)&&i.v=='now'       )return lmn(0|(new Date().getTime()/1000))
	if(lis(i)&&i.v=='z'         )return lmn(0|(new Date().getTimezoneOffset()/-60))
	if(lis(i)&&i.v=='ms'        )return lmn(Math.round(Date.now()))
	if(lis(i)&&i.v=='workspace' )return lmd(['allocs','depth'].map(lms),[allocs,calldepth].map(lmn))
	return x?x:NIL
},'system')
showt=(x,toplevel)=>{
	if(!toplevel){
		const d=monad.rows(x).v.map(r=>r.v.map(v=>show(v)).join(' ')).join(' ')
		return \`insert \${tab_cols(x).map(x=>x+' ').join('')}with \${d?d+' ':''}end\`
	}
	try{
	const w=tab_cols(x).map(k=>tab_get(x,k).reduce((x,y)=>max(x,min(40,show(y).length)+2),k.length+2))
	const s='+'+tab_cols(x).map((x,i)=>"-".repeat(w[i])).join('+')+'+'
	const v=range(tab_rowcount(x)).map(r=>tab_cols(x).map(k=>' '+show(tab_cell(x,k,r))).map((f,i)=>f.slice(0,41)+(' '.repeat(max(0,w[i]-min(41,f.length))))))
	         .map(x=>\`|\${x.join('|')}|\`).join('\\n')
	return \`\${s}\\n|\${tab_cols(x).map((x,i)=>\` \${x+(' '.repeat(w[i]-x.length-2))} \`).join('|')}|\\n\${s}\${v.length?'\\n'+v+'\\n'+s:''}\`
	}catch(err){console.log('cannot serialize',x);throw err}
}
show=(x,toplevel)=>linat(x)?'on native x do ... end': linil(x)?(toplevel?'':'nil'):
		lil(x)?\`(\${x.v.map(x=>show(x)).join(',')})\`: lit(x)?showt(x,toplevel): lion(x)?\`on \${x.n}\${x.a.map(x=>' '+x).join('')} do ... end\`:
		lis(x)?\`"\${x.v.split('').map(x=>({'\\n':'\\\\n','\\\\':'\\\\\\\\','"':'\\\\"'})[x]||x).join('')}"\`:
		lin(x)?fjson(x):lid(x)?\`{\${x.k.map((k,i)=>\`\${show(k)}:\${show(x.v[i])}\`).join(',')}}\`:
		lii(x)?\`<\${x.n}>\`:\`<INVALID \${x}>\`

// dom + utilities

FORMAT_VERSION=1, RTEXT_END=2147483647, SFX_RATE=8000, ANTS=255
FRAME_QUOTA=MODULE_QUOTA=10*4096, TRANS_QUOTA=2*4096, LOOP_QUOTA=1*4096, ATTR_QUOTA=1*4096, BRUSH_QUOTA=128
sleep_frames=0, sleep_play=0, pending_popstate=0
DEFAULT_HANDLERS=\`
on link x do go[x] end
on drag x do if !me.locked|me.draggable me.line[(pointer.prev-me.offset)/me.scale x] end end
on order x do if !me.locked me.value:select orderby me.value[x] asc from me.value end end
on changecell x do
	f:me.format[me.col] f:if count f f else "s" end
	me.cellvalue:if "t"~f x else ("%%%l" format f) parse x end
	me.event["change" me.value]
end
on navigate x do if x~"right" go["Next"] end if x~"left" go["Prev"] end end
on loop x do x end
\`
DEFAULT_TRANSITIONS=\`
transition[on SlideRight c a b t do  c.paste[a c.size*t,0   ] c.paste[b c.size*(t-1),0]      end]
transition[on SlideLeft  c a b t do  c.paste[a c.size*(-t),0] c.paste[b c.size*(1-t),0]      end]
transition[on SlideDown  c a b t do  c.paste[a c.size*0,t   ] c.paste[b c.size*0,t-1  ]      end]
transition[on SlideUp    c a b t do  c.paste[a c.size*0,-t  ] c.paste[b c.size*0,1-t  ]      end]
transition[on WipeRight  c a b t do  c.rect[0,0        c.size*t,1    ]          c.merge[a b] end]
transition[on WipeLeft   c a b t do  c.rect[0,0        c.size*(1-t),1]          c.merge[b a] end]
transition[on WipeDown   c a b t do  c.rect[0,0        c.size*1,t    ]          c.merge[a b] end]
transition[on WipeUp     c a b t do  c.rect[0,0        c.size*1,1-t  ]          c.merge[b a] end]
transition[on BoxIn      c a b t do  c.rect[c.size/2   c.size*t   "center"]     c.merge[a b] end]
transition[on BoxOut     c a b t do  c.rect[c.size/2   c.size*1-t "center"]     c.merge[b a] end]
\`
FONTS={
	body:"%%FNT1CAoBIAEAAAAAAAAAAAAAIQEAgICAgIAAgAAAIgMAoKAAAAAAAAAAIwUAAFD4UPhQAAAAJAUgcKigcCiocCAAJQg"+
	"Af5KUbhkpRgAAJgcwSFAgVIiUYgAAJwEAgIAAAAAAAAAAKAMgQICAgICAQCAAKQOAQCAgICAgQIAAKgUAUCD4IFAAAAAA"+
	"KwUAACAg+CAgAAAALAIAAAAAAAAAQECALQQAAAAA8AAAAAAALgEAAAAAAAAAgAAALwQQECAgQECAgAAAMAUAcIiIiIiIc"+
	"AAAMQUAIGAgICAgIAAAMgUAcIgIECBA+AAAMwUA+BAgcAiIcAAANAUAEDBQkPgQEAAANQUA+IDwCAiIcAAANgUAMECA8I"+
	"iIcAAANwUA+AgQECAgIAAAOAUAcIiIcIiIcAAAOQUAcIiIeAgQYAAAOgIAAABAAAAAQAAAOwMAAAAgAAAAICBAPAQAABA"+
	"gQCAQAAAAPQUAAAD4APgAAAAAPgQAAEAgECBAAAAAPwUAMEgIECAAIAAAQAcAOESaqqqcQDgAQQUAICBQUPiIiAAAQgUA"+
	"8IiI8IiI8AAAQwUAcIiAgICIcAAARAUA4JCIiIiQ4AAARQQA8ICA4ICA8AAARgQA8ICA4ICAgAAARwUAcIiAmIiIcAAAS"+
	"AUAiIiI+IiIiAAASQIAQEBAQEBAQAAASgUACAgICIiIcAAASwUAiJCgwKCQiAAATAQAgICAgICA8AAATQcAgsaqkoKCgg"+
	"AATgUAyMioqJiYiAAATwUAcIiIiIiIcAAAUAUA8IiI8ICAgAAAUQUAcIiIiIiocBAAUgUA8IiI8KCQiAAAUwUAcIiAcAi"+
	"IcAAAVAUA+CAgICAgIAAAVQUAiIiIiIiIcAAAVgUAiIiIUFAgIAAAVwcAgoJUVCgoKAAAWAUAiIhQIFCIiAAAWQUAiIhQ"+
	"ICAgIAAAWgQA8BAgQICA8AAAWwNgQEBAQEBAQGAAXASAgEBAICAQEAAAXQNgICAgICAgIGAAXgMAQKAAAAAAAAAAXwYAA"+
	"AAAAAAA/AAAYAIAgEAAAAAAAAAAYQQAAABgEHCQcAAAYgQAgIDgkJCQ4AAAYwQAAABgkICQYAAAZAQAEBBwkJCQcAAAZQ"+
	"QAAABgkPCAYAAAZgQAMEDgQEBAQAAAZwQAAABwkJCQcBBgaAQAgIDgkJCQkAAAaQIAQADAQEBAQAAAagMAIABgICAgICD"+
	"AawQAgICQoMCgkAAAbAIAwEBAQEBAQAAAbQcAAADskpKSkgAAbgQAAADgkJCQkAAAbwQAAABgkJCQYAAAcAQAAADgkJCQ"+
	"4ICAcQQAAABwkJCQcBAQcgQAAACwwICAgAAAcwQAAABwgGAQ4AAAdAMAQEDgQEBAIAAAdQQAAACQkJCQcAAAdgUAAACIU"+
	"FAgIAAAdwcAAACCVFQoKAAAeAUAAACIUCBQiAAAeQQAAACQkJCQcBBgegQAAADwIECA8AAAewMgQEBAgEBAQCAAfAGAgI"+
	"CAgICAgIAAfQOAQEBAIEBAQIAAfgUAaLAAAAAAAAAAfwUAAAAAAAAAqAAAgAVAIAAgUFD4iAAAgQUQIAAgUFD4iAAAggU"+
	"gUAAgUFD4iAAAgwUoUAAgUFD4iAAAhAVQACAgUFD4iAAAhQUgUCAgUFD4iAAAhgYAPDBQUPiQnAAAhwUAcIiAgICIcCBg"+
	"iARAIADwgOCA8AAAiQQgQADwgOCA8AAAigQgUADwgOCA8AAAiwRQAPCA4ICA8AAAjAKAQABAQEBAQAAAjQMgQABAQEBAQ"+
	"AAAjgNAoABAQEBAQAAAjwOgAEBAQEBAQAAAkAUA4JCI6IiQ4AAAkQUoUADIqKiYmAAAkgVAIHCIiIiIcAAAkwUQIHCIiI"+
	"iIcAAAlAUgUHCIiIiIcAAAlQUoUHCIiIiIcAAAlgVQAHCIiIiIcAAAlwcAOkRMVGREuAAAmAVAIIiIiIiIcAAAmQUQIIi"+
	"IiIiIcAAAmgUgUACIiIiIcAAAmwVQAIiIiIiIcAAAnAUQIIiIUCAgIAAAnQUAgPCIiPCAgAAAngUAcIiwiIiIsAAAnwRA"+
	"IABgEHCQcAAAoAQgQABgEHCQcAAAoQQgUABgEHCQcAAAogRQoABgEHCQcAAAowQAUABgEHCQcAAApAQgUCBgEHCQcAAAp"+
	"QcAAAB8En6QfAAApgQAAABgkICQYCBgpwRAIABgkPCAYAAAqAQgQABgkPCAYAAAqQQgUABgkPCAYAAAqgQAUABgkPCAYA"+
	"AAqwKAQADAQEBAQAAArAMgQADAQEBAQAAArQNAoADAQEBAQAAArgMAoADAQEBAQAAArwUAaBAoeIiIcAAAsARQoADgkJC"+
	"QkAAAsQRAIABgkJCQYAAAsgQgQABgkJCQYAAAswQgUABgkJCQYAAAtARQoABgkJCQYAAAtQQAUABgkJCQYAAAtgYAAAA0"+
	"SHhIsAAAtwRAIACQkJCQcAAAuAQgQACQkJCQcAAAuQQgUACQkJCQcAAAugQAUACQkJCQcAAAuwQgQACQkJCQcBBgvAUAA"+
	"ICwyIjIsIAAvQQAUACQkJCQcBBgvgVwICBQUPiIiAAAvwQAcABgEHCQcAAAwAVQcCAgUFD4iAAAwQRQcABgEHCQcAAAwg"+
	"UAICBQUPiIiBAIwwQAAABgEHCQcCAQxAUQIHCIgICIcAAAxQQgQABgkICQYAAAxgRwAPCA4ICA8AAAxwQAcABgkPCAYAA"+
	"AyAQA8ICA4ICA8CAQyQQAAABgkPCAYEAgygPgAEBAQEBAQAAAywMA4ADAQEBAQAAAzAIAAADAQEBAQAAAzQUAQEBQYMBA"+
	"eAAAzgUAYCgwYKAgIAAAzwUQIMjIqKiYmAAA0AQgQADgkJCQkAAA0QVwAHCIiIiIcAAA0gQAcABgkJCQYAAA0wVIkHCIi"+
	"IiIcAAA1AVIkABgkJCQYAAA1QcAfpCQnJCQfgAA1gYAAAB4pLygeAAA1wUQIHiAcAiIcAAA2AQgQABwgGAQ4AAA2QVQIH"+
	"iAcAiIcAAA2gRQIABwgGAQ4AAA2wVwAIiIiIiIcAAA3AQAcACQkJCQcAAA3QVIkACIiIiIcAAA3gVIkACQkJCQcAAA3wV"+
	"QAIiIUCAgIAAA4AQgQPAQIECA8AAA4QQgQADwIECA8AAA4gQgAPAQIECA8AAA4wQAIADwIECA8AAA5ARQIPAQIECA8AAA"+
	"5QRQIADwIECA8AAA5gUAcIiAcAiIcCBA5wQAAABwgGAQ4CBA6AUA+CAgICAgACAg6QMAQEDgQEBAIEBA6gUA+IiQsIiIs"+
	"AAA6wEAAIAAgICAgIAA7AUAABAAECBASDAA7QUAAChQoFAoAAAA7gUAAKBQKFCgAAAA7wYAOETwQPBEOAAA8AUwSEgwAA"+
	"AAAAAA/wYA/My05Pzs/AAA",
	menu:"%%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"+
	"D/CAAAfwBjAF0AXQB7AHcAdwB/AHcAfwAAAAAA",
	mono:"%%FNT1BQsBIAUAAAAAAAAAAAAAACEFAAAgICAgIAAgAAAiBQAAUFBQAAAAAAAAIwUAAFD4UPhQAAAAACQFACBwqKBwKKh"+
	"wIAAlBQAASKhQIFCokAAAJgUAAGCQoECokGgAACcFACAgIAAAAAAAAAAoBQAQICBAQEAgIBAAKQUAIBAQCAgIEBAgACoF"+
	"AAAgqHCoIAAAAAArBQAAACAg+CAgAAAALAUAAAAAAAAAYGAgQC0FAAAAAAD4AAAAAAAuBQAAAAAAAAAwMAAALwUICBAQI"+
	"CBAQICAADAFAABwiJioyIhwAAAxBQAAIGAgICAgIAAAMgUAAHCICBAgQPgAADMFAABwiAgwCIhwAAA0BQAAEDBQkPgQEA"+
	"AANQUAAPiA8AgIiHAAADYFAABwgPCIiIhwAAA3BQAA+AgIECAgIAAAOAUAAHCIiHCIiHAAADkFAABwiIiIeAhwAAA6BQA"+
	"AADAwAAAwMAAAOwUAAABgYAAAYGAgQDwFAAAIECBAIBAIAAA9BQAAAAD4APgAAAAAPgUAAEAgEAgQIEAAAD8FAABwiAgQ"+
	"IAAgAABABQBwiIio6LCAiHAAQQUAAHCIiPiIiIgAAEIFAADwiIjwiIjwAABDBQAAcIiAgICIcAAARAUAAPCIiIiIiPAAA"+
	"EUFAAD4gIDwgID4AABGBQAA+ICA8ICAgAAARwUAAHCIgJiIiHAAAEgFAACIiIj4iIiIAABJBQAAICAgICAgIAAASgUAAA"+
	"gICAiIiHAAAEsFAACIkKDAoJCIAABMBQAAgICAgICA+AAATQUAAIjYqIiIiIgAAE4FAACIyKiYiIiIAABPBQAAcIiIiIi"+
	"IcAAAUAUAAPCIiPCAgIAAAFEFAABwiIiIiIhwCABSBQAA8IiI8IiIiAAAUwUAAHCIgHAIiHAAAFQFAAD4ICAgICAgAABV"+
	"BQAAiIiIiIiIcAAAVgUAAIiIiFBQICAAAFcFAACIiIiIqNiIAABYBQAAiFAgICBQiAAAWQUAAIiIiFAgICAAAFoFAAD4C"+
	"BAgQID4AABbBQAwICAgICAgIDAAXAWAgEBAICAQEAgIAF0FADAQEBAQEBAQMABeBQAgUIgAAAAAAAAAXwUAAAAAAAAAAP"+
	"gAAGAFAEAgEAAAAAAAAABhBQAAAAB4iIiYaAAAYgUAAICA8IiIiPAAAGMFAAAAAHCIgIB4AABkBQAACAh4iIiIeAAAZQU"+
	"AAAAAcIj4gHgAAGYFAAAYIHAgICAgAABnBQAAAAB4iIiIeAhwaAUAAICA8IiIiIgAAGkFAAAgACAgICAgAABqBQAAIAAg"+
	"ICAgICDAawUAAICAkKDgkIgAAGwFAAAgICAgICAwAABtBQAAAADwqKioqAAAbgUAAAAAsMiIiIgAAG8FAAAAAHCIiIhwA"+
	"ABwBQAAAADwiIiI8ICAcQUAAAAAeIiIiHgICHIFAAAAALDIgICAAABzBQAAAAB4gHAI8AAAdAUAACAgeCAgIBgAAHUFAA"+
	"AAAIiIiJhoAAB2BQAAAACIiFBQIAAAdwUAAAAAqKioqFAAAHgFAAAAAIhQIFCIAAB5BQAAAACIiIiIeAhwegUAAAAA+BA"+
	"gQPgAAHsFABggICDAICAgGAB8BSAgICAgICAgICAgfQUAwCAgIBggICDAAH4FAABosAAAAAAAAAB/BQAAAAAAAAAAqAAA"+
	"gAVAIHCIiPiIiIgAAIEFECBwiIj4iIiIAACCBSBQcIiI+IiIiAAAgwUoUHCIiPiIiIgAAIQFUABwiIj4iIiIAACFBSBQI"+
	"FCI+IiIiAAAhgUAADhQUPiQkJgAAIcFAABwiICAgIhwIGCIBUAg+ICA8ICA+AAAiQUQIPiAgPCAgPgAAIoFIFD4gIDwgI"+
	"D4AACLBVAA+ICA8ICA+AAAjAVAIAAgICAgICAAAI0FECAAICAgICAgAACOBSBQACAgICAgIAAAjwVQACAgICAgICAAAJA"+
	"FAADwiIjoiIjwAACRBShQiMiomIiIiAAAkgVAIHCIiIiIiHAAAJMFECBwiIiIiIhwAACUBSBQcIiIiIiIcAAAlQUoUHCI"+
	"iIiIiHAAAJYFUABwiIiIiIhwAACXBQAAaJCoqKhIsAAAmAVAIIiIiIiIiHAAAJkFECCIiIiIiIhwAACaBSBQAIiIiIiIc"+
	"AAAmwVQAIiIiIiIiHAAAJwFECCIiIhQICAgAACdBQAAgPCIiPCAgAAAngUAAOCQoJCIiLAAAJ8FAEAgAHiIiJhoAACgBQ"+
	"AQIAB4iIiYaAAAoQUAIFAAeIiImGgAAKIFAChQAHiIiJhoAACjBQAAUAB4iIiYaAAApAUAIFAgeIiImGgAAKUFAAAAAHC"+
	"ouKBYAACmBQAAAABwiICAeCBgpwUAQCAAcIj4gHgAAKgFABAgAHCI+IB4AACpBQAgUABwiPiAeAAAqgUAAFAAcIj4gHgA"+
	"AKsFAEAgACAgICAgAACsBQAQIAAgICAgIAAArQUAIFAAICAgICAAAK4FAABQAGAgICAgAACvBQBoECh4iIiIcAAAsAUAK"+
	"FAAsMiIiIgAALEFAEAgAHCIiIhwAACyBQAQIABwiIiIcAAAswUAIFAAcIiIiHAAALQFAChQAHCIiIhwAAC1BQAAUABwiI"+
	"iIcAAAtgUAAABokKioSLAAALcFAEAgAIiIiJhoAAC4BQAQIACIiIiYaAAAuQUAIFAAiIiImGgAALoFAABQAIiIiJhoAAC"+
	"7BQAQIACIiIiIeAhwvAUAAICwyIjIsIAAAL0FAABQAIiIiIh4CHC+BXAAcIiI+IiIiAAAvwUAAHAAeIiImGgAAMAFUCBw"+
	"iIj4iIiIAADBBQBQIAB4iIiYaAAAwgUAAHCIiPiIiIgQCMMFAAAAAHiIiJhoEAjEBRAgcIiAgICIcAAAxQUAABAgcIiAg"+
	"HgAAMYFcAD4gIDwgID4AADHBQAAcABwiPiAeAAAyAUAAPiAgPCAgPAQCMkFAAAAAHCI+IBwEAjKBXAAICAgICAgIAAAyw"+
	"UAAHAAYCAgICAAAMwFAAAAAGAgICAgAADNBQAAQFBgQMBAeAAAzgUAACAgKDBgoDAAAM8FECCIyKiYiIiIAADQBQAQIAC"+
	"wyIiIiAAA0QVwAHCIiIiIiHAAANIFAABwAHCIiIhwAADTBUiQAHCIiIiIcAAA1AUASJAAcIiIiHAAANUFAAB4oKCwoKB4"+
	"AADWBQAAAABQqLigWAAA1wUQIHCIgHAIiHAAANgFABAgAHiAcAjwAADZBVAgcIiAcAiIcAAA2gUAUCAAeIBwCPAAANsFc"+
	"ACIiIiIiIhwAADcBQAAcACIiIiYaAAA3QVIkACIiIiIiHAAAN4FAEiQAIiIiJhoAADfBVAAiIiIUCAgIAAA4AUQIPgIEC"+
	"BAgPgAAOEFABAgAPgQIED4AADiBSAA+AgQIECA+AAA4wUAACAA+BAgQPgAAOQFUCD4CBAgQID4AADlBQBQIAD4ECBA+AA"+
	"A5gUAcIiAcAiIcAAgIOcFAAAAeIBwCPAAICDoBQAA+CAgICAgACAg6QUAACAgeCAgGAAgIOoFAAD4iJCgkIiwAADrBQAA"+
	"ACAAICAgICAA7AUAAAAgACBAgIhwAO0FAAAAKFCgUCgAAADuBQAAAKBQKFCgAAAA7wUAADBI4EDgSDAAAPAFADBISDAAA"+
	"AAAAAD/BQAA+IiIiIiI+AAA",
}

COLORS=[
	0xFFFFFFFF,0xFFFFFF00,0xFFFF6500,0xFFDC0000,0xFFFF0097,0xFF360097,0xFF0000CA,0xFF0097FF,
	0xFF00A800,0xFF006500,0xFF653600,0xFF976536,0xFFB9B9B9,0xFF868686,0xFF454545,0xFF000000,
]
DEFAULT_COLORS=COLORS.slice(0)
BRUSHES=[
	0x00,0x00,0x00,0x10,0x00,0x00,0x00,0x00, 0x00,0x00,0x10,0x38,0x10,0x00,0x00,0x00,
	0x00,0x00,0x18,0x3C,0x3C,0x18,0x00,0x00, 0x00,0x38,0x7C,0x7C,0x7C,0x38,0x00,0x00,
	0x38,0x7C,0xFE,0xFE,0xFE,0x7C,0x38,0x00, 0x10,0x00,0x41,0x08,0x80,0x11,0x00,0x22,
	0x00,0x00,0x00,0x18,0x18,0x00,0x00,0x00, 0x00,0x00,0x38,0x38,0x38,0x00,0x00,0x00,
	0x00,0x00,0x3C,0x3C,0x3C,0x3C,0x00,0x00, 0x00,0x7C,0x7C,0x7C,0x7C,0x7C,0x00,0x00,
	0xFE,0xFE,0xFE,0xFE,0xFE,0xFE,0xFE,0x00, 0x20,0x0A,0x80,0x24,0x01,0x48,0x02,0x51,
	0x00,0x00,0x10,0x10,0x10,0x00,0x00,0x00, 0x10,0x10,0x10,0x10,0x10,0x10,0x10,0x00,
	0x10,0x00,0x10,0x00,0x10,0x00,0x10,0x00, 0x00,0x00,0x08,0x10,0x20,0x00,0x00,0x00,
	0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x00, 0x02,0x00,0x08,0x00,0x20,0x00,0x80,0x00,
	0x00,0x00,0x00,0x38,0x00,0x00,0x00,0x00, 0x00,0x00,0x00,0xFE,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0xAA,0x00,0x00,0x00,0x00, 0x00,0x00,0x20,0x10,0x08,0x00,0x00,0x00,
	0x80,0x40,0x20,0x10,0x08,0x04,0x02,0x00, 0x80,0x00,0x20,0x00,0x08,0x00,0x02,0x00,
]
ALIGN={left:0,center:1,right:2}
DEFAULT_ANIMS='[[13,9,5,1,5,9],[4,4,8,14,14,8],[18,18,20,19,19,20],[0,0,0,0,1,1,1,1]]'
DEFAULT_PATTERNS=
	'%%IMG0AAgA4AAAAAAAAAAA//////////+AgID/CAgI/yBAgMEiHAgQgAAIAIAACAD/d//d/3f/3XEiF49HInT4iFAgAgW'+
	'IiIiIACIAiAAiAHfdd9133XfdQIAACAQCACABAQOESDAMAogiiCKIIogiqlWqVapVqlWABEAIASACEMAMjbEwAxvYqgCq'+
	'AKoAqgD/Vf9V/1X/Vf8A/wD/AP8AqqqqqqqqqqpEiBEiRIgRIt27d+7du3fuQIABAgQIECC/f/79+/fv3wgAqgAIAIgAj'+
	'493mPj4d4mqAIgUIkGIALCwsL8Av7+w'

array_is      =x=>lii(x)&&x.n=='array'
image_is      =x=>lii(x)&&x.n=='image'
sound_is      =x=>lii(x)&&x.n=='sound'
keystore_is   =x=>lii(x)&&x.n=='keystore'
font_is       =x=>lii(x)&&x.n=='font'
button_is     =x=>lii(x)&&x.n=='button'
field_is      =x=>lii(x)&&x.n=='field'
grid_is       =x=>lii(x)&&x.n=='grid'
slider_is     =x=>lii(x)&&x.n=='slider'
canvas_is     =x=>lii(x)&&x.n=='canvas'
contraption_is=x=>lii(x)&&x.n=='contraption'
proxy_is      =x=>lii(x)&&x.n=='proxy'
prototype_is  =x=>lii(x)&&x.n=='prototype'
deck_is       =x=>lii(x)&&x.n=='deck'
card_is       =x=>lii(x)&&x.n=='card'
patterns_is   =x=>lii(x)&&x.n=='patterns'
module_is     =x=>lii(x)&&x.n=='module'
widget_is     =x=>lii(x)&&({button:1,field:1,grid:1,slider:1,canvas:1,contraption:1,proxy:1})[x.n]
ikey  =(x,k)=>lis(x)&&x.v==k
ivalue=(x,k,d)=>x.hasOwnProperty(k)?x[k]:d
ifield=(x,k)  =>x.f(x,lms(k))
iindex=(x,k,v)=>x.f(x,lmn(k),v)
iwrite=(x,k,v)=>x.f(x,k,v)
value_inherit=(self,key)=>{
	let r=self[key];if(typeof r=='string')r=lms(r);if(typeof r=='number'||typeof r=='boolean')r=lmn(r);
	const card=self.card;if(!contraption_is(card))return r
	const p=dget(card.def.widgets,ifield(self,'name'));if(!p)return r
	const v=ifield(p,key);if(r&&v&&match(r,v))delete self[key];return r||v
}
init_field=(dst,key,src)=>{const k=lms(key),v=dget(src,k);if(v)iwrite(dst,k,v)}
normalize_enum=(x,v)=>x.hasOwnProperty(v)?v:Object.keys(x)[0]
normalize_font=(x,v)=>ls(dkey(x,v)||x.k[dkix(x,v)]||lms('body'))
data_enc=x=>x[5]==undefined?-1:+x[5]
data_read=(type,x)=>(x.slice(0,2)!='%%'||x.slice(2,5)!=type)?null:new Uint8Array(atob(x.slice(6)).split('').map(x=>x.charCodeAt(0)))
data_write=(type,x)=>\`%%\${type}\${btoa(Array.from(x).map(x=>String.fromCharCode(x)).join(''))}\`
is_rooted=x=>card_is(x)?!x.dead: widget_is(x)?(is_rooted(x.card)&&!x.dead): 1

ceil=Math.ceil, clamp=(a,x,b)=>x<a?a:x>b?b:x, sign=x=>x>0?1:-1
first=x=>x[0]
last=x=>x[x.length-1]
rect=(x,y,w,h)=>({x:x||0,y:y||0,w:w||0,h:h||0})
rpair=(a,b)=>rect(a.x,a.y,b.x,b.y)
rcopy=r=>rect(r.x,r.y,r.w,r.h)
rint=r=>rect(0|r.x,0|r.y,0|r.w,0|r.h)
radd=(a,b)=>rect(a.x+b.x,a.y+b.y,a.w+b.w,a.h+b.h)
rsub=(a,b)=>rect(a.x-b.x,a.y-b.y,a.w-b.w,a.h-b.h)
rmul=(a,n)=>rect(a.x*n,a.y*n,a.w*n,a.h*n)
rdiv=(a,n)=>rint(rmul(a,1/n))
inset=(r,n)=>rect(r.x+n,r.y+n,r.w-2*n,r.h-2*n)
rin=(r,p)=>p.x>=r.x&&p.y>=r.y&&p.x<r.x+r.w&&p.y<r.y+r.h           // point-in-rect
ron=(a,b)=>b.x+b.w>=a.x&&b.x<=a.x+a.w&&b.y+b.h>=a.y&&b.y<=a.y+a.h // rect-overlaps-rect
requ=(a,b)=>a.x==b.x&&a.y==b.y&&a.w==b.w&&a.h==b.h
rmax=(a,b)=>rect(max(a.x,b.x),max(a.y,b.y),max(a.w,b.w),max(a.h,b.h))
rmin=(a,b)=>rect(min(a.x,b.x),min(a.y,b.y),min(a.w,b.w),min(a.h,b.h))
rclip=(a,b)=>{const c=rmax(a,b);return rect(c.x,c.y,min(a.x+a.w,b.x+b.w)-c.x,min(a.y+a.h,b.y+b.h)-c.y)}
runion=(a,b)=>{const c=rmin(a,b);return rect(c.x,c.y,max(a.x+a.w,b.x+b.w)-c.x,max(a.y+a.h,b.y+b.h)-c.y)}
rcenter=(a,b)=>rint(rect(a.x+(a.w-b.x)/2,ceil(a.y+(a.h-b.y)/2.0),b.x,b.y))
rnorm=r=>{r=rcopy(r);if(r.w<0)r.w*=-1,r.x-=r.w;if(r.h<0)r.h*=-1,r.y-=r.h;return rint(r)}
rclamp=(a,b,c)=>rmin(rmax(a,b),c)
lmpair=r=>lml([lmn(r.x),lmn(r.y)])
lmrect=r=>lml([lmn(r.x),lmn(r.y),lmn(r.w),lmn(r.h)])
getpair=x=>(!x||!lil(x))?rect(): rect(x.v.length>0?ln(x.v[0]):0, x.v.length>1?ln(x.v[1]):0)
getrect=x=>(!x||!lil(x))?rect(): rect(x.v.length>0?ln(x.v[0]):0, x.v.length>1?ln(x.v[1]):0, x.v.length>2?ln(x.v[2]):0, x.v.length>3?ln(x.v[3]):0)
getimage=x=>(!x||!image_is(x))? image_make(rect()): x
ukey=(dict,name,root,original)=>{
	if(original&&match(name,original))return name
	if(name&&lis(name)&&!dget(dict,name))return name
	let i=1;while(1){let n=lms(root+(i++));if(!dget(dict,n))return n}
}
uset=(dict,name,root,x)=>(dset(dict,ukey(dict,name,root),x),x)
reorder=(dict,a,b)=>{
	b=clamp(0,b,count(dict)-1);const k=dict.k[a],v=dict.v[a]
	if(b<a){for(let z=a;z>b;z--)dict.k[z]=dict.k[z-1],dict.v[z]=dict.v[z-1]}
	else   {for(let z=a;z<b;z++)dict.k[z]=dict.k[z+1],dict.v[z]=dict.v[z+1]}
	dict.k[b]=k,dict.v[b]=v
}
anchors={top_left:0,top_center:1,top_right:2,center_left:3,center:4,center_right:5,bottom_left:6,bottom_center:7,bottom_right:8}
anchor=(r,a)=>{
	if(a==undefined)return rint(r);a=anchors[ls(a)]||0
	if(a==1||a==4||a==7)r.x-=r.w/2; if(a==2||a==5||a==8)r.x-=r.w
	if(a==3||a==4||a==5)r.y-=r.h/2; if(a==6||a==7||a==8)r.y-=r.h
	return rint(r)
}
unpack_rect=(z,size)=>{
	let s=size||frame.image.size, v=rect(0,0,s.x,s.y)
	if(z.length>=1){const a=rint(getpair(z[0])),b=rint(getpair(z[1]));if(b.x<0)a.x+=1+b.x,b.x*=-1;if(b.y<0)a.y+=1+b.y,b.y*=-1;v=rpair(a,b)}
	return anchor(v,z[2])
}
unpack_poly=z=>{
	const r=[];z.map(x=>{if(lil(x)&&x.v.every(x=>!lin(x))){ll(x).map(x=>r.push(getpair(x)))}else{r.push(getpair(x))}})
	if(r.length==1)r.push(r[0]);return r
}
readcolor=(cr,cg,cb,grayscale)=>{
	if(grayscale){
		// perceptually weighted gray: http://entropymine.com/imageworsener/grayscale/
		const rf=0.2126*Math.pow(cr,2.2), gf=0.7152*Math.pow(cg,2.2), bf=0.0722*Math.pow(cb,2.2), gg=Math.pow(rf+gf+bf,1/2.2)
		return clamp(0,0|gg,255)
	}
	let ci=0,cd=1e20;for(let c=0;c<16;c++){
		const dr=abs(((COLORS[c]>>16)&0xFF)/256.0-cr/256.0),
			  dg=abs(((COLORS[c]>> 8)&0xFF)/256.0-cg/256.0),
			  db=abs(((COLORS[c]    )&0xFF)/256.0-cb/256.0),
			  diff=(dr*dr)+(dg*dg)+(db*db)
		if(diff<cd)ci=c,cd=diff
	}if(ci==15)return 1;return ci+32
}

let audio_playing=0
interface_app=lmi((self,i,x)=>{
	if(x&&lis(i)){
		if(i.v=='fullscreen')return set_fullscreen(lb(x)),x
		if(i.v=='gridsize'  )return dr.grid_size=rmax(rect(1,1),rint(getpair(x))),x
	}else if(lis(i)){
		if(i.v=='fullscreen')return lmn(is_fullscreen())
		if(i.v=='gridsize'  )return lmpair(dr.grid_size)
		if(i.v=='playing'   )return lmn(audio_playing)
		if(i.v=='save'      )return lmnat(_=>((modal_enter&&modal_enter('save_deck'),NIL)))
		if(i.v=='exit'      )return lmnat(_=>NIL) // does nothing in web-decker
		if(i.v=='show')return lmnat(z=>{
			const sp=x=>lis(x)?ls(x): lin(x)?ln(x): show(x)
			if(lit(z[0])){console.table(rows(z[0]).v.map(r=>r.k.reduce((a,k,i)=>{a[ls(k)]=sp(r.v[i]);return a},{})))}
			else{console.log(z.map(x=>show(x,z.length==1)).join(' '))}
			return z[0]||NIL
		})
		if(i.v=='print')return lmnat(z=>{
			const r=ls(z.length>1?dyad.format(z[0],lml(z.slice(1))):z[0]||NIL);console.log(r)
			return lms(r)
		})
		if(i.v=='render')return draw_con==undefined?NIL:lmnat(([a])=>{
			return widget_is(a)?draw_widget(a): card_is(a)?draw_con(a,1): image_make(rect())
		})
	}return x?x:NIL
},'app')

interface_bits=lmi((self,i,x)=>{
	const lbits=x=>0xFFFFFFFF&ln(x), cb=f=>lmnat(a=>{
		let l=a.length<2?ll(a[0]||NIL): a, r=l[0]||NIL
		for(let z=1;z<l.length;z++)r=vd(f)(r,l[z]);return r
	})
	if(ikey(i,'and'))return cb((x,y)=>lmn((lbits(x)&lbits(y))>>>0))
	if(ikey(i,'or' ))return cb((x,y)=>lmn((lbits(x)|lbits(y))>>>0))
	if(ikey(i,'xor'))return cb((x,y)=>lmn((lbits(x)^lbits(y))>>>0))
	return x?x:NIL
},'bits')

let frame=null
inclip=p=>rin(frame.clip,p)
gpix=p=>frame.image.pix[p.x+p.y*frame.image.size.x]
pix=(p,v)=>frame.image.pix[p.x+p.y*frame.image.size.x]=v
pal_pat=(pal,p,x,y)=>pal[(x%8)+(8*(y%8))+(8*8*p)]
draw_pattern=(pal,pix,pos)=>pix<2?(pix?1:0): pix>31?(pix==32?0:1): pal_pat(pal,pix,pos.x,pos.y)&1
draw_hline=(x0,x1,y,pattern)=>{
	if(y<frame.clip.y||y>=frame.clip.y+frame.clip.h)return
	x0=max(frame.clip.x,x0),x1=min(frame.clip.x+frame.clip.w,x1);for(let z=x0;z<x1;z++)pix(rect(z,y),pattern)
}
draw_vline=(x,y0,y1,pattern)=>{
	if(x<frame.clip.x||x>=frame.clip.x+frame.clip.w)return
	y0=max(frame.clip.y,y0),y1=min(frame.clip.y+frame.clip.h,y1);for(let z=y0;z<y1;z++)pix(rect(x,z),pattern)
}
draw_rect=(r,pattern)=>{r=rclip(r,frame.clip);for(let a=r.y;a<r.y+r.h;a++)for(let b=r.x;b<r.x+r.w;b++)pix(rect(b,a),pattern)}
draw_invert_raw=(pal,r)=>{r=rclip(r,frame.clip);for(let a=r.y;a<r.y+r.h;a++)for(let b=r.x;b<r.x+r.w;b++){const h=rect(b,a);pix(h,1^draw_pattern(pal,gpix(h),h))}}
draw_icon=(p,i,pattern)=>{const s=i.size;for(let a=0;a<s.y;a++)for(let b=0;b<s.x;b++){const h=rect(p.x+b,p.y+a);if(i.pix[b+(a*s.x)]&&inclip(h))pix(h,pattern)}}
draw_iconc=(r,i,pattern)=>draw_icon(rcenter(r,i.size),i,pattern)

draw_line_simple=(r,brush,pattern)=>{
	r=rint(r);const bsh=(z,x,y)=>(BRUSHES[(z*8)+y]>>(7-x))&1
	let dx=abs(r.w-r.x), dy=-abs(r.h-r.y), err=dx+dy, sx=r.x<r.w ?1:-1, sy=r.y<r.h?1:-1;while(1){
		if(brush==0){if(inclip(r))pix(r,pattern)}
		else{for(let b=0;b<8;b++)for(let a=0;a<8;a++){const h=rect(r.x+a-3,r.y+b-3);if(bsh(brush,a,b)&&inclip(h))pix(h,pattern)}}
		if(r.x==r.w&&r.y==r.h)break;let e2=err*2; if(e2>=dy)err+=dy,r.x+=sx; if(e2<=dx)err+=dx,r.y+=sy
	}
}
draw_line_custom=(r,mask,pattern)=>{
	let dx=abs(r.w-r.x), dy=-abs(r.h-r.y), err=dx+dy, sx=r.x<r.w ?1:-1, sy=r.y<r.h?1:-1, ms=mask.size, mc=rint(rdiv(ms,2));while(1){
		for(let b=0;b<ms.y;b++)for(let a=0;a<ms.x;a++){const h=rect(r.x+a-mc.x,r.y+b-mc.y), mp=mask.pix[a+b*ms.x];if(mp&&inclip(h))pix(h,mp==1?pattern: mp==47?1: mp)}
		if(r.x==r.w&&r.y==r.h)break;let e2=err*2; if(e2>=dy)err+=dy,r.x+=sx; if(e2<=dx)err+=dx,r.y+=sy
	}
}
draw_line_function=(r,func,pattern)=>{
	const a=lml([lmpair(rect(r.w-r.x,r.h-r.y)),ONE,NIL]),p=lmblk(),e=lmenv();blk_lit(p,func),blk_lit(p,a),blk_op(p,op.CALL),pushstate(e)
	let dx=abs(r.w-r.x), dy=-abs(r.h-r.y), err=dx+dy, sx=r.x<r.w ?1:-1, sy=r.y<r.h?1:-1;while(!do_panic){
		if(func.a.length>2)a.v[2]=lmpair(r)
		state.e=[e],state.t=[],state.pcs=[];issue(e,p);let quota=BRUSH_QUOTA;while(quota&&running())runop(),quota--;const v=running()?ZERO:arg()
		if(image_is(v)){
			const ms=v.size, mc=rint(rdiv(ms,2))
			for(let b=0;b<ms.y;b++)for(let a=0;a<ms.x;a++){const h=rect(r.x+a-mc.x,r.y+b-mc.y), mp=v.pix[a+b*ms.x];if(mp&&inclip(h))pix(h,mp==1?pattern: mp==47?1: mp)}
		}if(r.x==r.w&&r.y==r.h)break;let e2=err*2; if(e2>=dy)err+=dy,r.x+=sx; if(e2<=dx)err+=dx,r.y+=sy; a.v[1]=ZERO
	}popstate()
}
draw_line=(r,brush,pattern,deck)=>{
	if(brush>=0&&brush<=23){draw_line_simple(r,brush,pattern);return}
	const b=deck.brushes;if(brush<0||brush-24>=b.v.length)return;const f=b.v[brush-24]
	if(image_is(f)){draw_line_custom(r,f,pattern)}else if(lion(f)){draw_line_function(r,f,pattern)}
}
n_brush=(z,deck)=>{
	const b=deck.brushes,bt=deck.brusht,f=z[0],s=z[1]
	if(lion(f)){
		const k=lms(f.n),v=image_make(rect(64,32)),t=frame; dset(b,k,f),frame=({size:v.size,clip:rect(0,0,64,32),image:v})
		draw_line(rect(16,16,32,16),24+dkix(b,k),1,deck)
		draw_line(rect(32,16,40,16),24+dkix(b,k),1,deck)
		draw_line(rect(40,16,44,16),24+dkix(b,k),1,deck)
		draw_line(rect(44,16,48,16),24+dkix(b,k),1,deck)
		frame=t,dset(bt,lms(f.n),v)
	}
	if(lis(f)&&s&&image_is(s))dset(b,f,s),dset(bt,f,s)
	return b
}

draw_box=(r,brush,pattern)=>{
	const size=frame.image.size
	if(r.w==0||r.h==0||!ron(r,rect(0,0,size.x,size.y)))return
	if(r.y         >=0)draw_line_simple(rect(r.x      ,r.y      ,r.x+r.w-1,r.y      ),brush,pattern)
	if(r.y+r.h<=size.y)draw_line_simple(rect(r.x      ,r.y+r.h-1,r.x+r.w-1,r.y+r.h-1),brush,pattern)
	if(r.x         >=0)draw_line_simple(rect(r.x      ,r.y      ,r.x      ,r.y+r.h-1),brush,pattern)
	if(r.x+r.w<=size.x)draw_line_simple(rect(r.x+r.w-1,r.y      ,r.x+r.w-1,r.y+r.h-1),brush,pattern)
}
draw_boxf=(r,brush,pattern,deck)=>{
	const size=frame.image.size
	if(r.w==0||r.h==0||!ron(r,rect(0,0,size.x,size.y)))return
	if(r.y         >=0)draw_line(rect(r.x      ,r.y      ,r.x+r.w-1,r.y      ),brush,pattern,deck)
	if(r.y+r.h<=size.y)draw_line(rect(r.x      ,r.y+r.h-1,r.x+r.w-1,r.y+r.h-1),brush,pattern,deck)
	if(r.x         >=0)draw_line(rect(r.x      ,r.y      ,r.x      ,r.y+r.h-1),brush,pattern,deck)
	if(r.x+r.w<=size.x)draw_line(rect(r.x+r.w-1,r.y      ,r.x+r.w-1,r.y+r.h-1),brush,pattern,deck)
}
draw_lines=(poly,brush,pattern,deck)=>{for(let z=0;z<poly.length-1;z++)draw_line(rpair(poly[z],poly[z+1]),brush,pattern,deck)}
poly_bounds=poly=>{
	const d=rect(frame.clip.x+frame.clip.w,frame.clip.y+frame.clip.h,frame.clip.x,frame.clip.y)
	for(let z=0;z<poly.length;z++){const p=poly[z];d.x=min(d.x,p.x),d.y=min(d.y,p.y),d.w=max(d.w,p.x),d.h=max(d.h,p.y)}
	d.w-=d.x,d.h-=d.y,d.w++,d.h++;return d
}
poly_in=(poly,pos)=>{
	let r=0;for(let i=0,j=poly.length-1;i<poly.length;i++){
		if(pos.x==poly[i].x&&pos.y==poly[i].y)return 1
		if(((poly[i].y>=pos.y)!=(poly[j].y>=pos.y))&&(pos.x<=(poly[j].x-poly[i].x)*(pos.y-poly[i].y)/(poly[j].y-poly[i].y)+poly[i].x))r^=1
		j=i
	}return r
}
draw_poly=(poly,pattern)=>{
	const r=rint(rclip(frame.clip,poly_bounds(poly)))
	for(let a=0;a<r.h;a++)for(let b=0;b<r.w;b++){const h=rect(b+r.x,a+r.y);if(poly_in(poly,h))pix(h,pattern)}
}
draw_fill=(r,pattern,ref)=>{
	if(!inclip(r))return
	const src=ref||frame.image, visited=new Uint8Array(src.size.x*src.size.y)
	const spix=p=>src.pix[p.x+p.y*src.size.x], source=spix(r), fringe=[r]
	const OFFSETS=[rect(-1,0),rect(0,-1),rect(1,0),rect(0,1)], stride=frame.image.size.x
	while(fringe.length){
		const here=fringe.pop();if(gpix(here)==pattern)continue;pix(here,pattern)
		for(let z=0;z<4;z++){
			const there=radd(here,OFFSETS[z]),ti=there.x+there.y*stride
			if(inclip(there)&&!visited[ti]&&spix(there)==source)fringe.push(there),visited[ti]=1
		}
	}
}
draw_char=(pos,font,c,pattern)=>{
	const iw=font_w(font),ih=font_h(font);
	for(let a=0;a<ih;a++)for(let b=0;b<iw;b++)if(font_gpix(font,c,b,a)){
		const h=rect(pos.x+b,pos.y+a);if(inclip(h))pix(h,pattern)
	}
}
draw_text=(pos,text,font,pattern)=>{
	const cursor=rect(pos.x,pos.y);for(let z=0;z<text.length;z++){
		const c=text[z];
		if(c!='\\n'){draw_char(cursor,font,c,pattern),cursor.x+=font_gw(font,c)+font_sw(font)}
		else{cursor.x=pos.x,cursor.y+=font_h(font)}
	}
}
const ELLIPSIS='…'
layout_plaintext=(text,font,align,mx)=>{
	let layout=[],lines=[],cursor=rect(0,0), lnl=_=>(cursor.x=0,cursor.y+=1), ws=x=>x=='\\n'||x==' '
	const fh=font_h(font),fs=font_sw(font)
	for(let z=0;z<text.length;z++){
		let a=z,w=text[z]=='\\n'?0:(font_gw(font,text[z])+fs)
		if(!ws(text[z]))while(text[z+1]&&!ws(text[z+1]))w+=font_gw(font,text[++z])+fs // find word
		if(cursor.x+w>=mx.x&&cursor.x>0)lnl() // word won't fit this line
		for(let i=a;i<=z;i++){                 // append word to line
			const c=text[i], size=rect(c=='\\n'?0:font_gw(font,c)+fs,fh)
			if(c==' '&&cursor.x==0&&layout.length>0&&!ws(last(layout).char))size.x=0 // squish lead space after a soft-wrap
			if(cursor.x+size.x>=mx.x)lnl() // hard-break overlong words
			layout.push({pos:rpair(cursor,size),line:cursor.y,char:c,font,arg:NIL,pat:1})
			if(c=='\\n'){lnl()}else{cursor.x+=size.x}
			if(cursor.y>=(mx.y/fh)){
				layout=layout.slice(0,max(1,layout.length-3))
				layout[layout.length-1].char=ELLIPSIS,layout[layout.length-1].pos.w=font_gw(font,ELLIPSIS)+fs
				z=text.length-1;break
			}
		}
	}
	let y=0;for(let i=0,line=0;i<layout.length;i++,line++){
		let a=i;while(i<(layout.length-1)&&(layout[i+1].pos.y==line))i++          // find bounds of line
		let h=0;for(let z=a;z<=i;z++)h=max(h,layout[z].pos.h)                     // find height of line
		let w=(a&&a==i)?0:(layout[i].pos.x+layout[i].pos.w)                       // find width of line
		let x=align==ALIGN.center?0|((mx.x-w)/2): align==ALIGN.right?(mx.x-w): 0  // justify
		lines.push({pos:rect(x,y,w,h),range:rect(a,i)})
		for(let z=a;z<=i;z++){const g=layout[z].pos;g.y=y+0|((h-g.h)/2);g.x+=x;}if(i<layout.length-1)y+=h
	}return {size:rect(mx.x,y+fh),layout,lines}
}
layout_richtext=(deck,table,font,align,width)=>{
	const layout=[],lines=[],cursor=rect(0,0), lnl=_=>(cursor.x=0,cursor.y+=1), ws=x=>x=='\\n'||x==' '
	const texts=tab_get(table,'text'), fonts=tab_get(table,'font'), args=tab_get(table,'arg'), pats=tab_get(table,'pat')
	for(let chunk=0;chunk<texts.length;chunk++){
		const f=dget(deck.fonts,fonts[chunk])||font, fh=font_h(f), fs=font_sw(f)
		if(image_is(args[chunk])){
			const size=args[chunk].size;if(cursor.x+size.x>=width&&cursor.x>0)lnl()
			layout.push({pos:rpair(cursor,size),line:cursor.y,char:'i',font:f,arg:args[chunk],pat:ln(pats[chunk])})
			cursor.x+=size.x;continue
		}
		const t=ls(texts[chunk]);for(let z=0;z<t.length;z++){
			let a=z, w=t[z]=='\\n'?0:(font_gw(f,t[z])+fs)
			if(!ws(t[z]))while(z+1<t.length&&!ws(t[z+1]))w+=font_gw(f,t[++z])+fs
			if(cursor.x+w>=width&&cursor.x>0)lnl()
			for(let i=a;i<=z;i++){
				const c=t[i], size=rect(c=='\\n'?0:font_gw(f,c)+fs,fh)
				if(c==' '&&cursor.x==0&&layout.length>0&&!ws(last(layout).char))size.x=0
				if(cursor.x+size.x>=width)lnl()
				layout.push({pos:rpair(cursor,size),line:cursor.y,char:c,font:f,arg:args[chunk],pat:ln(pats[chunk])})
				if(c=='\\n'){lnl()}else{cursor.x+=size.x}
			}
		}
	}
	let y=0;for(let i=0,line=0;i<layout.length;i++,line++){
		let a=i;while(i<(layout.length-1)&&(layout[i+1].pos.y==line))i++            // find bounds of line
		let h=0;for(let z=a;z<=i;z++)h=max(h,layout[z].pos.h)                       // find height of line
		let w=layout[i].pos.x+layout[i].pos.w                                       // find width of line
		let x=align==ALIGN.center?0|((width-w)/2): align==ALIGN.right?(width-w): 0  // justify
		lines.push({pos:rect(x,y,w,h),range:rect(a,i)})
		for(let z=a;z<=i;z++){const g=layout[z].pos;g.y=y+0|((h-g.h)/2);g.x+=x;}y+=h
	}return {size:rect(width,y),layout,lines}
}
draw_text_wrap=(r,l,pattern)=>{
	r=rint(r);const oc=frame.clip;frame.clip=r;for(let z=0;z<l.layout.length;z++){
		const g=l.layout[z];if(g.pos.w<1)continue
		draw_char(radd(g.pos,r),g.font,g.char,g.pat==1?pattern:g.pat)
	}frame.clip=oc;
}
draw_text_rich_raw=(r,l,pattern,opaque,alink)=>{
	for(let z=0;z<l.layout.length;z++){
		const g=l.layout[z];if(g.pos.w<1)continue
		if(g.pos.y+g.pos.h<0||g.pos.y>r.h)continue
		g.pos.x+=r.x, g.pos.y+=r.y
		if(lis(g.arg)&&count(g.arg))draw_hline(g.pos.x,g.pos.x+g.pos.w,g.pos.y+g.pos.h-1,alink==g.arg?pattern:19)
		if(image_is(g.arg)){image_paste(g.pos,frame.clip,g.arg,frame.image,opaque)}
		else{draw_char(g.pos,g.font,g.char,g.pat==1?pattern:g.pat)}
		g.pos.x-=r.x,g.pos.y-=r.y
	}
}
draw_text_rich=(r,l,pattern,opaque)=>{
	const oc=frame.clip;frame.clip=r;draw_text_rich_raw(r,l,pattern,opaque,null),frame.clip=oc
}
draw_text_align=(r,text,font,pattern,align,outline)=>{
	const fh=font_h(font),l=layout_plaintext(text,font,align,rect(r.w,max(r.h,fh))),c=rcenter(r,l.size)
	if(outline){
		draw_text_rich_raw(rect(c.x-1,c.y  ,c.w,c.h),l,outline,1,null)
		draw_text_rich_raw(rect(c.x  ,c.y-1,c.w,c.h),l,outline,1,null)
		draw_text_rich_raw(rect(c.x+1,c.y  ,c.w,c.h),l,outline,1,null)
		draw_text_rich_raw(rect(c.x  ,c.y+1,c.w,c.h),l,outline,1,null)
		draw_text_rich_raw(rect(c.x-1,c.y-1,c.w,c.h),l,outline,1,null)
		draw_text_rich_raw(rect(c.x-1,c.y+1,c.w,c.h),l,outline,1,null)
		draw_text_rich_raw(rect(c.x+1,c.y-1,c.w,c.h),l,outline,1,null)
		draw_text_rich_raw(rect(c.x+1,c.y+1,c.w,c.h),l,outline,1,null)
	}
	draw_text_rich_raw(rcenter(r,l.size),l,pattern,1,null)
}
draw_9seg=(r,dst,src,m,clip,opaque,pal)=>{
	const o=rect(r.x,r.y), s=src.size, ss=s, ds=dst.size; if(s.x<1||s.y<1)return
	const draw_wrapped=(o,sr)=>{
		const r=rclip(o,clip),d=rsub(r,o);sr=rclip(sr,rpair(rect(0,0),ss));if(r.w<=0||r.h<=0||sr.w<=0||sr.h<=0)return
		if(!pal){ // solid/opaque
			for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++){const c=src.pix[(sr.x+((x+d.x)%sr.w))+(sr.y+((y+d.y)%sr.h))*ss.x];if(opaque||c)dst.pix[(r.x+x)+(r.y+y)*ds.x]=c}
		}
		else{ // invert
			const draw_pattern=(pix,x,y)=>pix<2?(pix?1:0): pix>31?(pix==32?0:1): pal_pat(pal,pix,x,y)&1
			for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++){
				let dx=r.x+x,dy=r.y+y, c=draw_pattern(src.pix[(sr.x+((x+d.x)%sr.w))+(sr.y+((y+d.y)%sr.h))*ss.x],dx,dy), di=(r.x+x)+(r.y+y)*ds.x
				dst.pix[di]=c^draw_pattern(dst.pix[di],dx,dy)
			}
		}
	}
	draw_wrapped(radd(rect(0      ,0      ,m.x          ,m.y          ),o),rect(0      ,0      ,m.x          ,m.y          )) // NW
	draw_wrapped(radd(rect(0      ,r.h-m.h,m.x          ,m.h          ),o),rect(0      ,s.y-m.h,m.x          ,m.h          )) // SW
	draw_wrapped(radd(rect(r.w-m.w,0      ,m.w          ,m.y          ),o),rect(s.x-m.w,0      ,m.w          ,m.y          )) // NE
	draw_wrapped(radd(rect(r.w-m.w,r.h-m.h,m.w          ,m.h          ),o),rect(s.x-m.w,s.y-m.h,m.w          ,m.h          )) // SE
	draw_wrapped(radd(rect(0      ,m.y    ,m.x          ,r.h-(m.y+m.h)),o),rect(0      ,m.y    ,m.x          ,s.y-(m.y+m.h))) // W
	draw_wrapped(radd(rect(m.x    ,0      ,r.w-(m.x+m.w),m.y          ),o),rect(m.x    ,0      ,s.x-(m.x+m.w),m.y          )) // N
	draw_wrapped(radd(rect(r.w-m.w,m.y    ,m.w          ,r.h-(m.y+m.h)),o),rect(s.x-m.w,m.y    ,m.w          ,s.y-(m.y+m.h))) // E
	draw_wrapped(radd(rect(m.x    ,r.h-m.h,r.w-(m.x+m.w),m.h          ),o),rect(m.x    ,s.y-m.h,s.x-(m.x+m.w),m.h          )) // S
	draw_wrapped(radd(rect(m.x    ,m.y    ,r.w-(m.x+m.w),r.h-(m.y+m.h)),o),rect(m.x    ,m.y    ,s.x-(m.x+m.w),s.y-(m.y+m.h))) // C
}

pointer={f:(self,i,x)=>{
	if(ikey(i,'held' ))return lmn(self.held)
	if(ikey(i,'down' ))return lmn(self.down)
	if(ikey(i,'up'   ))return lmn(self.up)
	if(ikey(i,'pos'  ))return lmpair(self.pos)
	if(ikey(i,'start'))return lmpair(self.start)
	if(ikey(i,'prev' ))return lmpair(self.prev)
	if(ikey(i,'end'  ))return lmpair(self.end)
	return x?x:NIL
},t:'int',n:'pointer',held:0,down:0,up:0,pos:rect(),start:rect(),prev:rect(),end:rect()}

keystore_read=x=>{
	let store=lmd();if(x)x.k.filter((k,i)=>!linil(x.v[i])).map((k,i)=>dset(store,k,x.v[i]))
	return {f:(self,i,x)=>{
		const keystore_value=(k,v)=>{
			if(!v)return dget(self.data,k)||NIL
			if(linil(v)){self.data=dyad.drop(monad.list(k),self.data)}else{dset(self.data,k,v)}return self
		}
		if(ikey(i,'keys'))return monad.keys(self.data)
		if(ikey(i,'dict'))return dyad.drop(ZERO,self.data)
		if(ikey(i,'value'))return lmnat(([k,v])=>!k?self: keystore_value(k,v))
		return keystore_value(i,x)
	},t:'int',n:'keystore',data:store}
}
keystore_strip=x=>{const r=lmd();x.data.k.map((k,i)=>dset(r,lms(ls(k)),x.data.v[i]));return r}
n_keystore=([x])=>keystore_read(!x?null: keystore_is(x)?x.data: ld(x))

module_read=(x,deck)=>{
	const ri=lmi((self,i,x)=>{
		if(x){
			if(ikey(i,'description'))return self.description=ls(x),x
			if(ikey(i,'version'))return self.version=ln(x),x
			if(ikey(i,'name')){
				if(ls(x)=='')return x
				self.name=ls(ukey(self.deck.modules,lms(ls(x)),ls(x),lms(self.name)))
				self.deck.modules.k[dvix(self.deck.modules,self)]=self.name
				return x
			}
			if(ikey(i,'script')){
				self.script=ls(x),self.error='',self.value=lmd();try{
					const prog=parse(self.script),root=lmenv();primitives(root,deck),constants(root),root.local('data',self.data)
					pushstate(root),issue(root,prog);let q=MODULE_QUOTA;while(running()&&q>0)runop(),q--
					if(running()){self.error='initialization took too long.'}
					else{self.value=ld(arg())};popstate()
				}catch(e){self.error=e.x;return x}
			}
		}else{
			if(ikey(i,'name'       ))return lms(self.name)
			if(ikey(i,'data'       ))return self.data
			if(ikey(i,'description'))return lms(self.description||'')
			if(ikey(i,'version'    ))return lmn(self.version||0.0)
			if(ikey(i,'script'     ))return lms(self.script||'')
			if(ikey(i,'error'      ))return lms(self.error||'')
			if(ikey(i,'value'      ))return self.value
		}return x?x:NIL
	},'module')
	const n=dget(x,lms('name'))
	ri.deck=deck
	ri.name=ls(ukey(deck.modules,n&&lis(n)&&count(n)==0?null:n,'module'))
	ri.data=keystore_read(dget(x,lms('data')))
	ri.value=lmd()
	init_field(ri,'description',x)
	init_field(ri,'version',x)
	init_field(ri,'script',x)
	return ri
}
module_write=x=>{
	const r=lmd()
	dset(r,lms('name'  ),ifield(x,'name'))
	dset(r,lms('data'  ),keystore_strip(x.data))
	dset(r,lms('script'),ifield(x,'script'))
	if(x.description)dset(r,lms('description'),ifield(x,'description'))
	if(x.version)dset(r,lms('version'),ifield(x,'version'))
	return r
}

const casts={u8:1,i8:1,u16b:2,u16l:2,i16b:2,i16l:2,u32b:4,u32l:4,i32b:4,i32l:4,char:1}
array_write=x=>data_write('DAT'+String.fromCharCode(48+Object.keys(casts).indexOf(x.cast)),x.data.slice(x.base,x.base+x.size))
array_read=x=>{const f=x.charCodeAt(5),d=data_read('DAT',x);return d?array_make(d.length,Object.keys(casts)[clamp(0,f-48,10)],0,d):array_make(0,'u8',0)}
n_array=([x,y])=>{if(lis(x))return array_read(ls(x));const size=ln(x),cast=y?normalize_enum(casts,ls(y)):'u8';return array_make(size,cast,0)}
array_make=(size,cast,base,buffer)=>{
	const offset=x=>({offset:ln(lil(x)?monad.first(x):x),len:lil(x)?max(0,ln(monad.last(x))):-1})
	const shift=(a,here)=>({here:0, size:a.size-here, base:a.base+here, cast:a.cast, data:a.data})
	const resize=(a,size)=>{
		if(a.slice)return;size=max(0,size);const old=a.data;a.data=new Uint8Array(size)
		for(let z=0;z<a.data.length;z++)a.data[z]=z>=old.length?0:old[z];a.size=size
	}
	const get_raw=(a,index)=>{
		const step=casts[a.cast];if(index<0||index>=(0|(a.size/step)))return 0
		const ix=a.base+step*index;if(ix<0||ix+step>a.data.length)return 0
		const ur=(i,s)=>a.data[ix+i]<<s
		const s8 =x=>x<<24>>24
		const s16=x=>x<<16>>16
		const u32=(a,b,c,d)=>(2*a)+(b|c|d)
		if(a.cast=='u8'  )return     ur(0,0)
		if(a.cast=='i8'  )return  s8(ur(0,0))
		if(a.cast=='u16b')return    (ur(0,8)|ur(1,0))
		if(a.cast=='u16l')return    (ur(1,8)|ur(0,0))
		if(a.cast=='i16b')return s16(ur(0,8)|ur(1,0))
		if(a.cast=='i16l')return s16(ur(1,8)|ur(0,0))
		if(a.cast=='u32b')return u32(ur(0,23),ur(1,16),ur(2,8),ur(3,0))
		if(a.cast=='u32l')return u32(ur(3,23),ur(2,16),ur(1,8),ur(0,0))
		if(a.cast=='i32b')return    (ur(0,24)|ur(1,16)|ur(2,8)|ur(3,0))
		if(a.cast=='i32l')return    (ur(3,24)|ur(2,16)|ur(1,8)|ur(0,0))
		return drom_from_ord(ur(0,0))
	}
	const set_raw=(a,index,v)=>{
		if('string'==typeof v)v=drom_to_ord(v)
		const step=casts[a.cast];if(index<0||index>=(0|(a.size/step)))return
		const ix=a.base+step*index;if(ix<0||ix+step>a.data.length)return
		const uw=(i,s)=>a.data[ix+i]=v>>>s
		if     (a.cast=='u16b'||a.cast=='i16b')uw(0,8),uw(1,0)
		else if(a.cast=='u16l'||a.cast=='i16l')uw(1,8),uw(0,0)
		else if(a.cast=='u32b'||a.cast=='i32b')uw(0,24),uw(1,16),uw(2,8),uw(3,0)
		else if(a.cast=='u32l'||a.cast=='i32l')uw(3,24),uw(2,16),uw(1,8),uw(0,0)
		else uw(0,0)
	}
	const get=(a,index,len)=>{
		if(a.cast=='char'&&len<0)len=1
		if(a.cast=='char'){
			const t=a.cast;a.cast='u8';
			const r=range(len).map(x=>drom_from_ord(get_raw(a,index+x))).join('')
			return a.cast=t,lms(r)
		}
		return len<0?lmn(get_raw(a,index)): lml(range(len).map(x=>lmn(get_raw(a,index+x))))
	}
	const set=(a,index,len,v)=>{
		if(len<0)len=1
		if(array_is(v)){for(let z=0;z<len;z++)set_raw(a,index+z,get_raw(v,z))}             // array copy
		else if(lis(v)){for(let z=0;z<len;z++)set_raw(a,index+z,z>=count(v)?0:v.v[z])}     // copy chars up to len
		else if(lil(v)){for(let z=0;z<len;z++)set_raw(a,index+z,z>=count(v)?0:ln(v.v[z]))} // copy numbers up to len
		else{const vv=ln(v);for(let z=0;z<len;z++)set_raw(a,index+z,vv)}                   // spread a number up to len
	}
	const slice=(a,z)=>{
		const o=offset(z[0]||ZERO),cast=z[1]?normalize_enum(casts,ls(z[1])):a.cast, step=casts[cast];o.offset*=casts[a.cast]
		if(o.len<0)o.len=0|((a.size-o.offset)/step);const r=array_make(o.len,cast,o.offset,a.data);r.slice=1;return r
	}
	const copy=(a,z)=>{
		const o=offset(z[0]||ZERO),cast=z[1]?normalize_enum(casts,ls(z[1])):a.cast, step=casts[cast];o.offset*=casts[a.cast]
		if(o.len<0)o.len=0|((src.size-o.offset)/step);const r=array_make(o.len,cast,0)
		for(let z=0;z<o.len;z++)set_raw(r,z,get_raw(shift(a,o.offset),z));return r
	}
	const struct_size=shape=>{
		if( lis(shape))return (casts[ls(shape)]||1)
		if( lil(shape))return (casts[ls(monad.first(shape))]||1)*max(0,ln(monad.last(shape)))
		if(!lid(shape))return 0
		let bit=0, r=0;shape.v.map(type=>{
			if(!lin(type)&&bit)bit=0,r++
			if(lin(type)){bit+=clamp(1,ln(type),31),r+=0|(bit/8),bit%=8}else{r+=struct_size(type)}
		});return r
	}
	const struct_read=(a,shape)=>{
		if(lis(shape)){a.cast=normalize_enum(casts,ls(shape));const r=get(shift(a,a.here),0,-1);a.here+=casts[a.cast];return r}
		if(lil(shape)){
			const n=max(0,ln(monad.last(shape)))
			a.cast=normalize_enum(casts,ls(monad.first(shape)));const r=get(shift(a,a.here),0,n);a.here+=n*casts[a.cast];return r
		}
		if(!lid(shape))return ZERO;let bit=0,r=lmd();shape.v.map((type,i)=>{
			let v=ZERO;if(!lin(type)&&bit)bit=0,a.here++
			if(lin(type)){
				let n=clamp(1,ln(type),31),t=0;a.cast='u8'
				while(n>0){t=(t<<1)|(1&(get_raw(a,a.here)>>(7-bit))),bit++,n--;if(bit==8)bit=0,a.here++}v=lmn(t)
			}else{v=struct_read(a,type)}dset(r,shape.k[i],v)
		});return r
	}
	const struct_write=(a,shape,value)=>{
		if(lis(shape)||lil(shape)){
			let n=lis(shape)?1:max(0,ln(monad.last(shape)));a.cast=normalize_enum(casts,ls(lis(shape)?shape:monad.first(shape)))
			set(shift(a,a.here),0,n,value),a.here+=n*casts[a.cast];return
		}if(!lid(shape))return
		let bit=0;shape.v.map((type,i)=>{
			let v=dget(value,shape.k[i])||ZERO
			if(!lin(type)){if(bit)bit=0,a.here++;struct_write(a,type,v);return}
			let n=clamp(1,ln(type),31), t=ln(v),m=(1<<n)-1;t&=m,a.cast='u8';for(let z=0;z<n;z++){
				let pos=1<<(7-bit),dst=get_raw(a,a.here)&~pos
				set_raw(a,a.here,t&(1<<(n-1-z))?dst|pos:dst),bit++;if(bit==8)bit=0,a.here++
			}
		})
	}
	const struct=(a,z)=>{
		const oc=a.cast, shape=z[0]||ZERO, value=z[1], size=struct_size(shape);if(value&&a.here+size>=a.size)resize(a,a.here+size)
		const r=value?(struct_write(a,shape,value),value):struct_read(a,shape);return a.cast=oc,r
	}
	const cat=(a,z)=>{
		return z.map(v=>{
			const s=lin(v)?lms(a.cast): lil(v)?lml([lms(a.cast),monad.count(v)]):
			      array_is(v)?lml([ifield(v,'cast'),ifield(v,'size')]): (v=lms(ls(v)),lml([lms('char'),monad.count(v)]))
			struct(a,[s,v])
		}),a
	}
	const ri=lmi((self,i,x)=>{
		if(!lis(i)){const o=offset(i);if(x){set(self,o.offset,o.len,x);return x;}else{return get(self,o.offset,o.len);}}
		if(x){
			if(ikey(i,'size'))return resize(self,ln(x)*casts[self.cast]),x
			if(ikey(i,'cast'))return self.cast=normalize_enum(casts,ls(x)),x
			if(ikey(i,'here'))return self.here=max(0,ln(x)),x
		}else{
			if(ikey(i,'encoded'))return lms(array_write(self))
			if(ikey(i,'cast'   ))return lms(self.cast)
			if(ikey(i,'size'   ))return lmn(self.size/casts[self.cast])
			if(ikey(i,'here'   ))return lmn(self.here)
			if(ikey(i,'slice'  ))return lmnat(z=>slice (self,z))
			if(ikey(i,'copy'   ))return lmnat(z=>copy  (self,z))
			if(ikey(i,'struct' ))return lmnat(z=>struct(self,z))
			if(ikey(i,'cat'    ))return lmnat(z=>cat   (self,z))
		}return x?x:NIL
	},'array')
	ri.size=size*casts[cast],ri.here=0,ri.base=base,ri.cast=cast,ri.data=buffer||new Uint8Array(ri.size)
	return ri
}

find_occupied=(image,mask)=>{
	const s=image.size,d=rcopy(s);for(let z=0;z<image.pix.length;z++){
		if(image.pix[z]==mask)continue;const x=z%s.x, y=0|(z/s.x);d.x=min(d.x,x), d.y=min(d.y,y), d.w=max(d.w,x), d.h=max(d.h,y)
	}d.w-=d.x,d.h-=d.y,d.w++,d.h++;return d
}
image_copy=(i,r)=>{
	r=r?rint(r):rect(0,0,i.size.x,i.size.y);const c=image_make(rect(r.w,r.h)), clip=rect(0,0,i.size.x,i.size.y)
	for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++)c.pix[x+r.w*y]=rin(clip,rect(r.x+x,r.y+y))?i.pix[(r.x+x)+i.size.x*(r.y+y)]:0
	return c
}
image_paste=(r,clip,src,dst,opaque)=>{
	r=rint(r);const s=src.size,ds=dst.size
	for(let y=0;y<s.y;y++)for(let x=0;x<s.x;x++)if(rin(clip,rect(r.x+x,r.y+y))&&(opaque||src.pix[x+s.x*y]))dst.pix[r.x+x+ds.x*(r.y+y)]=src.pix[x+s.x*y]
}
lerp_scale=(r,s)=>rect(r.w/s.x,r.h/s.y)
image_paste_scaled=(r,clip,src,dst,opaque)=>{
	r=rint(r);if(r.w==0||r.h==0)return;const s=src.size,ds=dst.size,sc=lerp_scale(r,s)
	if(r.w==s.x&&r.h==s.y)return image_paste(r,clip,src,dst,opaque)
	for(let a=0;a<r.h;a++)for(let b=0;b<r.w;b++){
		let sx=0|(b/sc.x), sy=0|(a/sc.y), c=src.pix[sx+sy*s.x]
		if((opaque||c!=0)&&rin(clip,rect(r.x+b,r.y+a)))dst.pix[r.x+b+ds.x*(r.y+a)]=c
	}
}
image_dither=i=>{
	const stride=2*i.size.x, m=[0,1,i.size.x-2,i.size.x-1,i.size.x,stride-1], e=new Float32Array(stride)
	for(let ei=0,z=0;z<i.pix.length;z++){
		const pix=((0xFF&i.pix[z])/256.0)+e[ei], col=pix>.5?1:0, err=(pix-col)/8.0
		e[ei]=0, ei=(ei+1)%stride; for(let x=0;x<6;x++)e[(ei+m[x])%stride]+=err; i.pix[z]=!col
	}
}
image_flip_h=i=>{const s=i.size;for(let z=0;z<s.y;z++){let a=z*s.x,b=(z+1)*s.x-1;while(a<b){let t=i.pix[a];i.pix[a]=i.pix[b];i.pix[b]=t;a++;b--}}}
image_flip_v=i=>{const s=i.size;for(let z=0;z<s.x;z++){let a=z,b=z+s.x*(s.y-1);while(a<b){let t=i.pix[a];i.pix[a]=i.pix[b];i.pix[b]=t;a+=s.x;b-=s.x}}}
image_flip=i=>{const s=i.size,r=image_make(rect(s.y,s.x));for(let a=0;a<s.y;a++)for(let b=0;b<s.x;b++)r.pix[a+s.y*b]=i.pix[b+s.x*a];i.pix=r.pix,i.size=r.size}
image_resize=(i,size)=>{
	const os=i.size,ob=i.pix;size=rint(rmax(size,rect()));if(requ(os,size))return i;if(size.x==0||size.y==0)size=rect()
	i.pix=new Uint8Array(size.x*size.y),i.size=size;
	for(let a=0;a<size.y;a++)for(let b=0;b<size.x;b++)i.pix[b+a*size.x]=a>=os.y||b>=os.x?0: ob[b+a*os.x];return i
}
buffer_map=(buff,x,fill)=>{
	const m=new Uint8Array(256);for(let z=0;z<256;z++)m[z]=fill?ln(fill):z;x=ld(x)
	for(let z=0;z<x.k.length;z++){let k=0|ln(x.k[z]);if(k>=-128&&k<=255)m[0xFF&k]=0xFF&ln(x.v[z])}
	for(let z=0;z<buff.length;z++)buff[z]=m[buff[z]]
}
buffer_hist=(buff,sign)=>{
	const b_extend=u=>(u)|(0-((u)&0x80)),r=lmd(),c=new Float32Array(256);for(let z=0;z<buff.length;z++)c[buff[z]]++
	for(let z=0;z<256;z++)if(c[z]!=0)dset(r,lmn(sign?b_extend(z):z),lmn(c[z]));return r
}
image_bounds=i=>{
	const s=i.size,d=rect(s.x,s.y,0,0)
	for(let z=0;z<i.pix.length;z++)if(i.pix[z]!=0){const x=z%s.x,y=0|(z/s.x);d.x=min(d.x,x),d.y=min(d.y,y),d.w=max(d.w,x),d.h=max(d.h,y)}
	return lmd(["pos","size"].map(lms),[d,rmin(s,rect(max(0,d.w-d.x+1),max(0,d.h-d.y+1)))].map(lmpair))
}
image_merge_op=(target,src,op)=>{
	const ts=target.size,bs=src.size,t=target.pix,b=src.pix;if(bs.x==0||bs.y==0)return
	if(op=='+')for(let y=0,i=0;y<ts.y;y++)for(let x=0;x<ts.x;x++,i++)t[i]+=        b[(x%bs.x)+(y%bs.y)*bs.x]
	if(op=='-')for(let y=0,i=0;y<ts.y;y++)for(let x=0;x<ts.x;x++,i++)t[i]-=        b[(x%bs.x)+(y%bs.y)*bs.x]
	if(op=='*')for(let y=0,i=0;y<ts.y;y++)for(let x=0;x<ts.x;x++,i++)t[i]*=        b[(x%bs.x)+(y%bs.y)*bs.x]
	if(op=='&')for(let y=0,i=0;y<ts.y;y++)for(let x=0;x<ts.x;x++,i++)t[i]=min(t[i],b[(x%bs.x)+(y%bs.y)*bs.x])
	if(op=='|')for(let y=0,i=0;y<ts.y;y++)for(let x=0;x<ts.x;x++,i++)t[i]=max(t[i],b[(x%bs.x)+(y%bs.y)*bs.x])
	if(op=='<')for(let y=0,i=0;y<ts.y;y++)for(let x=0;x<ts.x;x++,i++)t[i]=t[i] <   b[(x%bs.x)+(y%bs.y)*bs.x]
	if(op=='>')for(let y=0,i=0;y<ts.y;y++)for(let x=0;x<ts.x;x++,i++)t[i]=t[i] >   b[(x%bs.x)+(y%bs.y)*bs.x]
	if(op=='=')for(let y=0,i=0;y<ts.y;y++)for(let x=0;x<ts.x;x++,i++)t[i]=t[i]==   b[(x%bs.x)+(y%bs.y)*bs.x]
}
image_outline=(target,p)=>{
	if(p<1||p>47)return;const t=image_copy(target),s=target.size
	for(let a=0,i=0;a<s.y;a++)for(let b=0;b<s.x;b++,i++){
		if(t.pix[i])continue;let n=0
		if(b>0    )n|=t.pix[(b-1)+(a  )*s.x]
		if(b<s.x-1)n|=t.pix[(b+1)+(a  )*s.x]
		if(a>0    )n|=t.pix[(b  )+(a-1)*s.x]
		if(a<s.y-1)n|=t.pix[(b  )+(a+1)*s.x]
		if(n)target.pix[i]=p
	}
}
image_make=size=>{
	size=rint(size)
	const f=(self,i,x)=>{
		const s=self.size
		if(i&&lil(i)){ // read/write single pixels
			const p=rint(getpair(i)),ib=p.x>=0&&p.y>=0&&p.x<s.x&&p.y<s.y
			if(x){if(ib)self.pix[p.x+p.y*s.x]=ln(x);return x}
			return ib?lmn(self.pix[p.x+p.y*s.x]):NIL
		}
		if(ikey(i,'pixels')){ // read/write all pixels
			if(x){ll(monad.raze(lml(ll(x)))).forEach((v,i)=>self.pix[i]=ln(v));return x}
			const r=[];for(let y=0;y<s.y;y++){const t=[];for(let x=0;x<s.x;x++)t.push(lmn(self.pix[x+y*s.x]));r.push(lml(t))}return lml(r)
		}
		if(ikey(i,'encoded'))return lms(image_write(self))
		if(ikey(i,'hist'))return buffer_hist(self.pix,0)
		if(ikey(i,'bounds'))return image_bounds(self)
		if(ikey(i,'size'))return x?(image_resize(self,getpair(x)),x): lmpair(self.size)
		if(ikey(i,'map'))return lmnat(([x,fill])=>(buffer_map(self.pix,x,fill),self))
		if(ikey(i,'merge'))return lmnat(z=>{
			if(lis(z[0])){if(image_is(z[1]))image_merge_op(self,z[1],ls(z[0])[0]);return self}
			if(lil(z[0]))z=ll(z[0]);const nice=x=>x&&image_is(x)&&x.size.x>0&&x.size.y>0, s=self.size
			const v=new Uint8Array(256),sx=new Uint32Array(256),sy=new Uint32Array(256)
			for(let p=0;p<z.length&&p<256;p++)if(nice(z[p]))v[p]=1,sx[p]=z[p].size.x,sy[p]=z[p].size.y
			for(let y=0,i=0;y<s.y;y++)for(let x=0;x<s.x;x++,i++){const p=self.pix[i],c=v[p]?z[p].pix[(x%sx[p])+(y%sy[p])*sx[p]]:0;self.pix[i]=c}
			return self
		})
		if(ikey(i,'transform'))return lmnat(([x])=>{
			if(x.v=='horiz')image_flip_h(self); if(x.v=='vert')image_flip_v(self); if(x.v=='flip')image_flip(self); if(x.v=='dither')image_dither(self)
			if(x.v=='left' )image_flip_h(self),image_flip(self); if(x.v=='right')image_flip(self),image_flip_h(self)
			return self
		})
		if(ikey(i,'rotate'))return lmnat(([n])=>{
			n=-(ln(n)%(2*Math.PI));if(abs(n)>Math.PI/2&&abs(n)<Math.PI*3/2)image_flip_v(self),image_flip_h(self),n+=(n<0?1:-1)*Math.PI
			const s=self.size,t=image_make(s)
			const shx=n=>{for(let y=0;y<s.y;y++){const o=0|(n*(y-s.y/2));for(let x=0;x<s.x;x++)t.pix[x+y*s.x]=self.pix[mod(x+o,s.x)+y*s.x]};self.pix.set(t.pix)}
			const shy=n=>{for(let x=0;x<s.x;x++){const o=0|(n*(x-s.x/2));for(let y=0;y<s.y;y++)t.pix[x+y*s.x]=self.pix[x+mod(y+o,s.y)*s.x]};self.pix.set(t.pix)}
			shx(-Math.tan(n/2)),shy(Math.sin(n)),shx(-Math.tan(n/2));return self
		})
		if(ikey(i,'translate'))return lmnat(([x,y])=>{
			const o=rint(getpair(x)), w=y?lb(y):0;if(o.x==0&&o.y==0)return self;const s=self.size,t=image_make(s)
			if(w){for(let y=0,z=0;y<s.y;y++)for(let x=0;x<s.x;x++,z++)                           t.pix[z]=self.pix[mod(x-o.x,s.x)+mod(y-o.y,s.y)*s.x]}
			else {for(let y=0,z=0;y<s.y;y++)for(let x=0;x<s.x;x++,z++){const i=rect(x-o.x,y-o.y);t.pix[z]=(i.x<0||i.x>=s.x||i.y<0||i.y>=s.y)?0: self.pix[i.x+i.y*s.x]}}
			self.pix.set(t.pix);return self
		})
		if(ikey(i,'scale'))return lmnat(([z,a])=>{
			const o=image_copy(self), n=lin(z)?rect(ln(z),ln(z)):getpair(z), r=rmax(rect(),rint(a&&lb(a)?n:rect(n.x*o.size.x,n.y*o.size.y))), d=rpair(rect(),r)
			image_resize(self,r),image_paste_scaled(d,d,o,self,1);return self
		})
		if(ikey(i,'outline'))return lmnat(([pat])=>(image_outline(self,ln(pat)),self))
		if(ikey(i,'copy'))return lmnat(z=>image_copy(self,unpack_rect(z,self.size)))
		if(ikey(i,'paste'))return lmnat(([img,pos,t])=>{
			img=getimage(img), pos=(pos?ll(pos):[]).map(ln); let solid=t?!lb(t):1, cl=rect(0,0,self.size.x,self.size.y); if(img==self)img=image_copy(img)
			image_paste_scaled(pos.length<=2?rect(pos[0],pos[1],img.size.x,img.size.y):rect(pos[0],pos[1],pos[2],pos[3]),cl,img,self,solid);return self
		})
		return x?x:NIL
	};return {t:'int',f:f,n:'image',size:size,pix:new Uint8Array(size.x*size.y)}
}
encode_lzw=(src,min_code_size,segment)=>{
	const lw=min_code_size, r=[]
	let w=1+lw,hi=(1<<lw)+1,ov=1<<(lw+1),sc=-1,b=0,nb=0,t={}, bo=0
	const bw=b=>{if(segment){if(bo==r.length)r.push(0);r[bo]++;}r.push(b);if(segment&&r[bo]==255)bo=r.length}
	const wb=c=>{b|=c<<nb;nb+=w;while(nb>=8){bw(b&0xff),b>>=8,nb-=8}}
	const ih=()=>{hi++;if(hi==ov){w++,ov<<=1}if(hi==0xfff){let c=1<<lw;wb(c),w=lw+1,hi=c+1,ov=c<<1,t={};return 1}}
	for(let z=0;z<src.length;z++){
		const b=0xFF&src[z]
		let c=sc;if(c==-1){wb(1<<lw),sc=b;continue;} /* first write sends clear code */
		let k=(c<<8)|b;if(t[k]!==undefined){sc=t[k]}else{wb(c),sc=b;if(!ih())t[k]=hi}
	}wb(sc),ih(),wb((1<<lw)+1),nb>0&&bw(b&0xff);return r
}
decode_lzw=(src,dst_size,min_code_size)=>{
	const min_code=clamp(2,min_code_size,8), dst=new Uint8Array(dst_size)
	const prefix=new Int32Array(4096), suffix=new Int32Array(4096), code=new Int32Array(4096)
	const clear=1<<min_code; let size=min_code+1, mask=(1<<size)-1, next=clear+2, old=-1, first=0, i=0,b=0,d=0, di=0
	for(let z=0;z<clear;z++)suffix[z]=z
	while(i<src.length){
		while(b<size)d+=(0xFF&src[i++])<<b, b+=8
		let t=d&mask; d>>=size, b-=size
		if(t>next||t==clear+1)break
		if(t==clear){size=min_code+1, mask=(1<<size)-1, next=clear+2, old=-1}
		else if (old==-1) dst[di++]=suffix[old=first=t]
		else{
			let ci=0,tt=t
			if   (t==next)code[ci++]=first,    t=old
			while(t>clear)code[ci++]=suffix[t],t=prefix[t]
			dst[di++]=first=suffix[t]
			while(ci>0)dst[di++]=code[--ci]
			if(next<4096){prefix[next]=old, suffix[next++]=first;if((next&mask)==0&&next<4096)size++, mask+=next}
			old=tt
		}
	}return dst
}
image_read=x=>{
	const data=data_read('IMG',x);if(!data||data.length<4)return image_make(rect())
	const f=data_enc(x), w=(data[0]<<8)|data[1], h=(data[2]<<8)|data[3], r=image_make(rect(w,h))
	if(f==0&&data.length-4>=w*h/8){let s=ceil(w/8),o=0;for(let a=0;a<h;a++)for(let b=0;b<w;b++)r.pix[o++]=data[4+(0|b/8)+a*s]&(1<<(7-(b%8)))?1:0}
	if(f==1&&data.length-4>=w*h){r.pix=data.slice(4)}
	if(f==2){let i=4,o=0;while(i+2<=data.length){let p=data[i++],c=0xFF&data[i++];while(c&&o+1<=r.pix.length)c--,r.pix[o++]=p;}}
	if(f==3){const mc=data[4];r.pix=decode_lzw(data.slice(5),w*h,mc)}
	return r
}
image_write=x=>{
	x=image_is(x)?x:image_make(rect());let f=0,s=x.size,t=[0xFF&(s.x>>8),0xFF&s.x,0xFF&(s.y>>8),0xFF&s.y],l=t.slice(0)
	for(let z=0;z<x.pix.length;){let c=0,p=x.pix[z];while(c<255&&z<x.pix.length&&x.pix[z]==p)c++,z++;l.push(p),l.push(c)}
	const maxcol=x.pix.reduce((x,y)=>max(x,y),1), rawsize=4+s.x*s.y, packedsize=4+(ceil(s.x/8)*s.y), colors=maxcol>1
	const mc=max(2,(ceil(Math.log2(maxcol+1)))), lzw=t.slice(0).concat([mc],encode_lzw(x.pix,mc,0))
	if     (  colors &&                         (lzw.length<l.length)){f='3',t=lzw}
	else if((!colors)&&(lzw.length<packedsize)&&(lzw.length<l.length)){f='3',t=lzw}
	else if((!colors)&&(l.length  >packedsize)){
		f='0';let stride=8*ceil(s.x/8);for(let a=0;a<s.y;a++)for(let b=0;b<stride;b+=8)
		{let v=0;for(let i=0;i<8;i++)v=(v<<1)|(b+i>=s.x?0: x.pix[b+i+a*s.x]?1:0);t.push(v)}
	}
	else if(l.c>rawsize){f='1';for(let z=0;z<s.x*s.y;z++)t.push(x.pix[z])}else{f='2',t=l}
	return data_write('IMG'+f,t)
}
n_image=([size])=>lis(size)?image_read(ls(size)):image_make(getpair(size))
is_blank=x=>!image_is(x)?0: !x.pix.some(x=>x>0)

sound_make=data=>{
	const sign_extend=x=>(x<<24>>24)
	const ri=lmi((self,i,x)=>{
		const fetch=ix=>ix<0||ix>=self.data.length?NIL:lmn(sign_extend(self.data[ix]))
		if(i&&lin(i)){ // read/write single samples
			return x?((self.data[ln(i)]=0xFF&ln(x)),x): fetch(ln(i))
		}
		if(i&&lil(i)){ // read/write ranges
			const n=getpair(i);n.x=min(n.x,self.data.length),n.y=max(0,n.y);if(x){
				const s=ll(x),dc=self.data.length,sc=s.length, r=new Uint8Array(clamp(0,(dc-n.y)+sc,10*SFX_RATE))
				for(let z=0;z<n.x         ;z++)r[z]=self.data[z]
				for(let z=0;z<sc          ;z++)r[n.x+z   ]=0xFF&ln(s[z])
				for(let z=0;z<dc-(n.x+n.y);z++)r[n.x+sc+z]=0xFF&self.data[n.x+n.y+z]
				return self.data=r,x
			}else{return lml(range(n.y).map(x=>fetch(x+n.x)))}
		}
		if(ikey(i,'encoded'))return lms(sound_write(self))
		if(ikey(i,'hist'))return buffer_hist(self.data,1)
		if(ikey(i,'size')){
			if(!x)return lmn(self.data.length)
			const n=clamp(0,ln(x),10*SFX_RATE),o=self.data;self.data=new Uint8Array(n)
			for(let z=0;z<o.length&&z<n;z++)self.data[z]=o[z];return x
		}
		if(ikey(i,'duration'))return lmn(self.data.length/SFX_RATE)
		if(ikey(i,'map'))return lmnat(([x,fill])=>(buffer_map(self.data,x,fill),self))
		return x?x:NIL
	},'sound')
	if(data&&data.length>10*SFX_RATE)data=data.slice(0,10*SFX_RATE)
	ri.data=data||new Uint8Array(0)
	return ri
}
sound_read=x=>sound_make((typeof x=='string')?data_read('SND',x):new Uint8Array(clamp(0,+x,10*SFX_RATE)))
sound_write=x=>data_write('SND0',x.data)
n_sound=([x])=>!x?sound_read(0): lis(x)?sound_read(ls(x)): lin(x)?sound_read(ln(x)): sound_make(Uint8Array.from(ll(x).map(ln)))

pal_col_get=(pal,c)=>{const b=(8*224)+(3*c);return 0xFF000000|((pal[b]<<16)|(pal[b+1]<<8)|pal[b+2])}
pal_col_set=(pal,c,x)=>{const b=(8*224)+(3*c);pal[b]=0xFF&(x>>16),pal[b+1]=0xFF&(x>>8),pal[b+2]=0xFF&x}
pick_palette=deck=>{for(let z=0;z<16;z++)COLORS[z]=pal_col_get(deck.patterns.pal.pix,z)}
patterns_read=x=>{
	const set=(pal,p,x,y,v)=>pal[(x%8)+(8*(y%8))+(8*8*p)]=v
	const ri=lmi((self,i,x)=>{
		let r=null, t=i&&ln(i)?ln(i):0
		if(x){
			if(t>= 2&&t<=27&&image_is(x)){for(let a=0;a<8;a++)for(let b=0;b<8;b++)set(self.pal.pix,t,b,a,lb(iwrite(x,lmpair(rect(b,a)))))}
			if(t>=28&&t<=31){r=ll(x);if(r.length>256)r=r.slice(0,256);self.anim[t-28]=r.map(x=>{const f=clamp(0,ln(x),47);return f>=28&&f<=31?0:f});r=lml(r)}
			if(t>=32&&t<=47){pal_col_set(self.pal.pix,t-32,0xFF000000|ln(x));r=x}
		}else{
			if(t>= 0&&t<=27){r=image_copy(self.pal,rect(0,t*8,8,8))}
			if(t>=28&&t<=31){r=lml(self.anim[t-28].map(lmn))}
			if(t>=32&&t<=47){r=lmn(0xFFFFFF&pal_col_get(self.pal.pix,t-32))}
		}return r?r:x?x:NIL
	},'patterns')
	let i=image_read(x.patterns?ls(x.patterns):DEFAULT_PATTERNS)
	if(i.size.x!=8||i.size.y!=224+6){i=image_resize(i,rect(8,224+6));for(let z=0;z<16;z++)pal_col_set(i.pix,z,DEFAULT_COLORS[z])}
	ri.pal=i
	ri.anim=JSON.parse(DEFAULT_ANIMS);if(x.animations&&lil(x.animations))ll(x.animations).map((x,i)=>iindex(ri,28+i,x))
	return ri
}
patterns_write=x=>{
	const p=x.pal.pix, c=DEFAULT_COLORS.some((x,i)=>(0xFFFFFF&x)!=(0xFFFFFF&pal_col_get(p,i)))
	return image_write(image_resize(image_copy(x.pal),rect(8,224+(6*c))))
}
anims_write=x=>lml(x.anim.map(x=>lml(x.map(lmn))))

font_get=(i,f,v)=>{if(v!=undefined)f.pix[i]=v;return f.pix[i]}
font_w =(f,v)=>font_get(0,f,v)
font_h =(f,v)=>font_get(1,f,v)
font_sw=(f,v)=>font_get(2,f,v)
font_gs=(f,v)=>font_h(f)*ceil(font_w(f)/8)+1
font_gb=(f,c)=>3+drom_to_ord(c)*font_gs(f)
font_gbi=(f,c)=>3+c*font_gs(f)
font_gw=(f,c,v)=>font_get(font_gb(f,c),f,v)
font_gwi=(f,c,v)=>font_get(font_gbi(f,c),f,v)
font_pp=(f,c,x,y,v)=>font_get(font_gb(f,c)+1+y*ceil(font_w(f)/8)+Math.floor(x/8),f,v)
font_bit=(x,v)=>(v<<(7-(x%8)))
font_gpix=(f,c,x,y)=>((font_pp(f,c,x,y)&font_bit(x,1))?1:0)
font_spix=(f,c,x,y,v)=>font_pp(f,c,x,y,(font_pp(f,c,x,y)&~font_bit(x,1))|font_bit(x,v))
font_textsize=(f,t)=>{
	const cursor=rect(),size=rect(0,font_h(f))
	for(let z=0;t[z];z++){if(t[z]!='\\n'){cursor.x+=font_gw(f,t[z])+font_sw(f),size.x=max(size.x,cursor.x)}else{cursor.x=0,size.y+=font_h(f)}}
	return size
}
font_read=arg=>{
	const ri=lmi((self,i,x)=>{
		if(lin(i)||(lis(i)&&count(i)==1)){ // read/write glyphs
			let ix=lin(i)?ln(i): drom_to_ord(ls(i));const ch=drom_from_ord(ix)
			if(x){
				if(ix<0||ix>255)return x;if(!image_is(x))x=image_make(rect());
				font_gwi(self,ix,min(x.size.x,font_w(self)));const s=rect(font_gwi(self,ix),font_h(self))
				for(let a=s.y-1;a>=0;a--)for(let b=s.x-1;b>=0;b--)font_spix(self,ch,b,a, b>=(x.size.x||a>=x.size.y)?0:x.pix[b+a*x.size.x]?1:0)
				return x
			}
			if(ix<0||ix>255)return image_make(rect())
			const s=rect(font_gwi(self,ix),font_h(self)),r=image_make(s)
			for(let a=s.y-1;a>=0;a--)for(let b=s.x-1;b>=0;b--)r.pix[b+a*s.x]=font_gpix(self,ch,b,a)
			return r
		}
		if(x){
			if(ikey(i,'space'))return font_sw(self,ln(x)),x
			if(ikey(i,'size')){
				const r=font_read(rmax(rint(getpair(x)),rect(1,1)));iwrite(r,lms('space'),ifield(self,'space'))
				for(let z=0;z<256;z++)iindex(r,z,iindex(self,z));self.pix=r.pix;return x
			}
		}else{
			if(ikey(i,'size'))return lmpair(rect(font_w(self),font_h(self)))
			if(ikey(i,'space'))return lmn(font_sw(self))
			if(ikey(i,'textsize'))return lmnat(([x])=>lmpair(font_textsize(self,x?ls(x):'')))
			if(ikey(i,'glyphs'))return lml(range(256).filter(x=>font_gwi(self,x)).map(lmn))
		}return x?x:NIL
	},'font')
	const make=sz=>{ri.pix=new Uint8Array(3+256*(1+sz.y*ceil(sz.x/8.0)));font_w(ri,sz.x),font_h(ri,sz.y),font_sw(ri,1)}
	if(typeof arg=='string'){
		const r=data_read('FNT',arg), s=rmax(rect(r[0],r[1]),rect(1,1)), gs=ceil(s.x/8)*s.y;make(s),font_sw(ri,r[2])
		if(arg[5]=='0'){
			for(let z=3,ci=32;(z<r.length)&&(ci<128);ci++,z+=gs){
				const gw=r[z++];if(z+gs>r.length)break
				for(let zz=0;zz<gs;zz++)font_get(font_gbi(ri,ci)+1+zz,ri,r[z+zz])
				font_gwi(ri,ci,gw)
			}
		}
		if(arg[5]=='1'){
			for(let z=3;z+1<r.length;z+=gs){
				const ci=r[z++],gw=r[z++];if(z+gs>r.length)break
				for(let zz=0;zz<gs;zz++)font_get(font_gbi(ri,ci)+1+zz,ri,r[z+zz])
				font_gwi(ri,ci,gw)
			}
		}
	}
	if(!ri.pix){make(rmax(rint(arg),rect(1,1)))}
	return ri
}
font_write=x=>{
	const s=rect(font_w(x),font_h(x)), gs=font_gs(x), r=[s.x,s.y,font_sw(x)]
	const dense=range(256).every(z=>(font_gwi(x,z)!=0)==(z>=32&&z<=127))
	if(dense){
		for(let ci=32;ci<128;ci++){
			r.push(font_gwi(x,ci))
			for(let z=0;z<gs-1;z++)r.push(font_get(font_gbi(x,ci)+z+1,x))
		};return data_write('FNT0',r)
	}else{
		for(let ci=0;ci<256;ci++)if(font_gwi(x,ci)){
			r.push(ci),r.push(font_gwi(x,ci))
			for(let z=0;z<gs-1;z++)r.push(font_get(font_gbi(x,ci)+z+1,x))
		};return data_write('FNT1',r)
	}
}

rtext_empty=_=>{const r=lmt();tab_set(r,'text',[]),tab_set(r,'font',[]),tab_set(r,'arg',[]),tab_set(r,'pat',[]);return r}
rtext_len=tab=>tab_get(tab,'text').reduce((x,y)=>x+ls(y).length,0)
rtext_get=(tab,n)=>{const t=tab_get(tab,'text');let i=0;for(let z=0;z<t.length;z++){i+=count(t[z]);if(i>=n)return z}return -1}
rtext_getr=(tab,x)=>{const t=tab_get(tab,'text');let i=0;for(let z=0;z<t.length;z++){const c=count(t[z]);if(i+c>=x)return rect(i,i+c);i+=c}return rect(x,x)}
rtext_make=(t,f,a,p)=>{
	a=!a?'':image_is(a)?a:ls(a), f=!f?'':ls(f), t=image_is(a)?'i':!t?'':count(t)?ls(t):'', p=!p?1:clamp(0,ln(p),255)
	const r=lmt();tab_set(r,'text',[lms(t)]),tab_set(r,'font',[lms(f)]),tab_set(r,'arg',[image_is(a)?a:lms(a)]),tab_set(r,'pat',[lmn(p)]);return r
}
rtext_cast=x=>{
	if(!x)x=lms('');if(image_is(x))return rtext_make('','',x);if(lid(x))x=monad.table(x);if(!lit(x))return rtext_make(x)
	const tv=tab_get(x,'text'),fv=tab_get(x,'font'),av=tab_get(x,'arg'),pv=tab_get(x,'pat')
	if(tv&&fv&&av&&pv&&tv.every((t,i)=>lis(t)&&lis(fv[i])&&(image_is(av[i])||lis(av[i]))&&lin(pv[i])&&ln(pv[i])>=0&&ln(pv[i])<=255))return x
	const r=lmt();tab_set(r,'text',tv||[lms('')]),tab_set(r,'font',fv||[lms('')]),tab_set(r,'arg',av||[lms('')]),tab_set(r,'pat',pv||[ONE])
	const tr=tab_get(r,'text'),fr=tab_get(r,'font'),ar=tab_get(r,'arg'),pr=tab_get(r,'pat')
	tr.map((_,z)=>{const i=image_is(ar[z]);tr[z]=i?lms('i'):lms(ls(tr[z]));fr[z]=lms(ls(fr[z]));ar[z]=i?ar[z]:lms(ls(ar[z]));pr[z]=lin(pr[z])?lmn(clamp(0,ln(pr[z]),255)):ONE});return r
}
rtext_append=(tab,t,f,a,p)=>{
	if(image_is(a)){if(count(t)>1)t=lms('i');if(count(t)<1)return 0;}if(!count(t))return 0;
	const tv=tab_get(tab,'text'),fv=tab_get(tab,'font'),av=tab_get(tab,'arg'),pv=tab_get(tab,'pat')
	if(tv.length&&match(f,last(fv))&&!image_is(a)&&match(a,last(av))&&match(p,last(pv))){tv[tv.length-1]=lms(ls(last(tv))+ls(t))}
	else{tv.push(t),fv.push(f),av.push(a),pv.push(p)}return count(t)
}
rtext_appendr=(tab,row)=>{fv=tab_get(row,'font'),av=tab_get(row,'arg'),pv=tab_get(row,'pat');tab_get(row,'text').map((t,i)=>rtext_append(tab,t,fv[i],av[i],pv[i]))}
rtext_string=(tab,pos,preserve_images)=>{
	pos=pos||rect(0,RTEXT_END);let r='',i=0,a=min(pos.x,pos.y),b=max(pos.x,pos.y),g=tab_get(tab,'arg')
	tab_get(tab,'text').map((s,ix)=>{const img=(!preserve_images)&&image_is(g[ix]);for(let z=0;z<s.v.length;z++,i++)if(!img&&i>=a&&i<b)r+=s.v[z]});return lms(r)
}
rtext_is_plain=x=>{
	if(!lit(x))return 0;const tv=tab_get(x,'text'),fv=tab_get(x,'font'),av=tab_get(x,'arg'),pv=tab_get(x,'pat');
	if(!tv||!fv||!av||!pv||tv.length>1)return 0;if(tv.length==0)return 1
	return ls(fv[0])==''&&!image_is(av[0])&&ls(av[0])==''&&ln(pv[0])==1
}
rtext_is_image=x=>{
	let r=null,t=tab_get(x,'text'),a=tab_get(x,'arg'); // look for at least one image, and other spans must be only whitespace.
	for(let z=0;z<count(x);z++){if(image_is(a[z])){if(!r)r=a[z]}else if(ls(t[z]).trim()!=''){return null}}
	return r
}
rtext_read_images=x=>lml((tab_get(x,'arg')||[]).filter(image_is))
rtext_write_images=x=>rtext_cat(ll(x))
rtext_span=(tab,pos)=>{
	const tv=tab_get(tab,'text'),fv=tab_get(tab,'font'),av=tab_get(tab,'arg'),pv=tab_get(tab,'pat')
	let r=dyad.take(ZERO,tab), i=0,c=0,a=min(pos.x,pos.y),b=max(pos.x,pos.y), partial=_=>{
		let rr='';for(let z=0;z<count(tv[c]);z++,i++)if(i>=a&&i<b)rr+=tv[c].v[z]
		rtext_append(r,lms(rr),fv[c],av[c],pv[c]),c++
	}
	while(c<tv.length&&(i+count(tv[c]))<a)i+=count(tv[c++])                             ;if(c<tv.length&&i<=a)partial()
	while(c<tv.length&&(i+count(tv[c]))<b)i+=rtext_append(r,tv[c],fv[c],av[c],pv[c]),c++;if(c<tv.length&&i< b)partial()
	return r
}
rtext_splice=(tab,font,arg,pat,text,cursor,endcursor)=>{
	const a=min(cursor.x,cursor.y),b=max(cursor.x,cursor.y),r=rtext_cast()
	rtext_appendr(r,rtext_span(tab,rect(0,a)))
	rtext_append (r,lms(text),font,arg,lmn(pat))
	rtext_appendr(r,rtext_span(tab,rect(b,RTEXT_END)))
	endcursor.x=endcursor.y=a+text.length;return r
}
rtext_splicer=(tab,insert,cursor,endcursor)=>{
	const a=min(cursor.x,cursor.y),b=max(cursor.x,cursor.y),r=rtext_cast()
	rtext_appendr(r,rtext_span(tab,rect(0,a)))
	rtext_appendr(r,insert)
	rtext_appendr(r,rtext_span(tab,rect(b,RTEXT_END)))
	endcursor.x=endcursor.y=a+rtext_len(insert);return r
}
rtext_write=x=>{
	let r=monad.cols(x),arg=dget(r,lms('arg')),pat=dget(r,lms('pat'))
	if(arg){arg.v=arg.v.map(x=>image_is(x)?lms(image_write(x)):x)};
	if(pat){if(pat.v.every(x=>ln(x)==1))r=dyad.drop(lms('pat'),r)}
	return r
}
rtext_read=x=>{
	if(lis(x))return x;x=ld(x)
	const a=dget(x,lms('arg'));if(a){dset(x,lms('arg'),lml(ll(a).map(a=>ls(a).startsWith('%%IMG')?image_read(ls(a)):lms(ls(a)))))}
	return rtext_cast(x)
}
rtext_encode=x=>\`%%RTX0\${fjson(rtext_write(x))}\`
rtext_decode=x=>rtext_read(pjson(x,6,x.length-6).value)
rtext_cat=x=>{let r=rtext_empty();x.map(x=>rtext_appendr(r,rtext_cast(x)));return r}
interface_rtext=lmi((self,i,x)=>{
	if(ikey(i,'end'   ))return lmn(RTEXT_END)
	if(ikey(i,'make'  ))return lmnat(([t,f,a,p])=>rtext_make(t,f,a,p))
	if(ikey(i,'len'   ))return lmnat(([t])=>lmn(rtext_len(rtext_cast(t))))
	if(ikey(i,'get'   ))return lmnat(([t,n])=>lmn(rtext_get(rtext_cast(t),n?ln(n):0)))
	if(ikey(i,'string'))return lmnat(([t,i,p])=>rtext_string(rtext_cast(t),i?getpair(i):undefined,p&&lb(p)))
	if(ikey(i,'span'  ))return lmnat(([t,i])=>rtext_span  (rtext_cast(t),i?getpair(i):undefined))
	if(ikey(i,'cat'   ))return lmnat(rtext_cat)
	if(ikey(i,'split' ))return lmnat(([x,y])=>{
		const d=ls(x),v=rtext_cast(y),t=ls(rtext_string(v,null,true)),r=lml([]);if(d.length<1||!x||!y)return r
		let n=0;for(let z=0;z<t.length;z++){
			let m=1;for(let w=0;w<d.length;w++)if(d[w]!=t[z+w]){m=0;break}if(m){r.v.push(rtext_span(v,rect(n,z))),z+=d.length-1,n=z+1}
		}if(n<=t.length)r.v.push(rtext_span(v,rect(n,t.length)));return r
	})
	if(ikey(i,'trim'))return lmnat(([tab,d])=>{
		tab=rtext_cast(tab);const delim=(d?ls(d):'\\n ').split(''),t=ls(rtext_string(tab))
		let a=0         ;while(delim.indexOf(t[a])>=0)a++;
		let b=t.length-1;while(delim.indexOf(t[b])>=0)b--;
		return rtext_span(tab,rect(a,b+1));
	})
	if(ikey(i,'replace'))return lmnat(([tab,k,v,i])=>{
		if(!k||!v)return tab||NIL;const t=rtext_cast(tab),r=[],tx=ls(rtext_string(t,null,true)),nocase=i&&lb(i),text=nocase?tx.toLowerCase():tx,c=rect(0,0)
		if(!lil(k))k=monad.list(k);if(!lil(v))v=monad.list(v)
		k=dyad.take(lmn(max(count(k),count(v))),k),k.v=k.v.map(nocase?x=>ls(x).toLowerCase():ls)
		v=dyad.take(lmn(max(count(k),count(v))),v),v.v=v.v.map(rtext_cast)
		while(c.y<text.length){
			let any=0;for(let ki=0;ki<k.v.length;ki++){
				const key=k.v[ki],val=v.v[ki];if(key.length<1)break;let f=1;for(let i=0;i<key.length;i++)if(text[c.y+i]!=key[i]){f=0;break}
				if(f){if(c.x!=c.y)r.push(rtext_span(t,c));r.push(r,val),c.x=c.y=(c.y+key.length),any=1}
			};if(!any)c.y++
		}if(c.x<text.length)r.push(rtext_span(t,rect(c.x,RTEXT_END)));return rtext_cat(r)
	})
	if(ikey(i,'find'))return lmnat(([tab,k,i])=>{
		const r=[];if(!tab||!k)return lml(r);const nocase=i&&lb(i),tx=ls(rtext_string(rtext_cast(tab),null,true)),text=nocase?tx.toLowerCase():tx
		k=lil(k)?ll(k):[k];k=k.map(x=>nocase?ls(x).toLowerCase(): ls(x))
		for(let x=0;x<text.length;){
			let any=0;for(let ki=0;ki<k.length;ki++){
				const key=k[ki];let f=1;for(let i=0;i<key.length;i++)if(text[x+i]!=key[i]){f=0;break}
				if(f){r.push(lml([lmn(x),lmn(x+key.length)])),x+=max(1,key.length),any=1;break}
			}if(!any)x++
		}return lml(r)
	})
	if(ikey(i,'index'))return lmnat(([tab,g])=>{
		if(!tab)return ZERO;let r=0;const t=ls(rtext_string(rtext_cast(tab),null,true));g=g?rint(getpair(g)):rect()
		while(r<t.length&&g.x>0)if(t[r++]=='\\n')g.x--;while(r<t.length&&g.y>0&&t[r]!='\\n'){g.y--,r++};return lmn(r)
	})
	return x?x:NIL
},'rtext')
button_styles={round:1,rect:1,check:1,invisible:1}
normalize_shortcut=x=>ls(x).toLowerCase().replace(/[^a-z0-9 ]/g,'').slice(0,1)
button_read=(x,card)=>{
	const ri=lmi((self,i,x)=>{
		if(!is_rooted(self))return NIL
		if(x){
			if(ikey(i,'value'   ))return self.value=lb(x),x
			if(ikey(i,'text'    ))return self.text=ls(x),x
			if(ikey(i,'style'   ))return self.style=normalize_enum(button_styles,ls(x)),x
			if(ikey(i,'shortcut'))return self.shortcut=normalize_shortcut(x),x
		}else{
			if(ikey(i,'value'   ))return value_inherit(self,ls(i))||ZERO
			if(ikey(i,'text'    ))return lms(ivalue(self,ls(i),''))
			if(ikey(i,'style'   ))return lms(ivalue(self,ls(i),'round'))
			if(ikey(i,'size'    ))return lmpair(ivalue(self,ls(i),rect(60,20)))
			if(ikey(i,'shortcut'))return lms(ivalue(self,ls(i),''))
		}return interface_widget(self,i,x)
	},'button');ri.card=card
	init_field(ri,'text'    ,x)
	init_field(ri,'style'   ,x)
	init_field(ri,'value'   ,x)
	init_field(ri,'shortcut',x)
	return ri
}
button_write=x=>{
	const r=lmd([lms('type')],[lms('button')])
	if(x.text)dset(r,lms('text' ),lms(x.text))
	if(x.style&&x.style!='round')dset(r,lms('style'),lms(x.style))
	if(x.value!=undefined&&!x.volatile)dset(r,lms('value'),lmn(x.value))
	if(x.shortcut)dset(r,lms('shortcut'),lms(x.shortcut))
	return r
}
field_styles={rich:1,plain:1,code:1}
field_aligns={left:1,center:1,right:1}
field_read=(x,card)=>{
	const ri=lmi((self,i,x)=>{
		if(!is_rooted(self))return NIL
		if(x){
			if(ikey(i,'text'  ))return self.value=rtext_cast(lms(ls(x))),field_notify(self),x
			if(ikey(i,'images'))return self.value=rtext_write_images(x),field_notify(self),x
			if(ikey(i,'data'  ))return self.value=rtext_cast(dyad.format(lms('%J'),monad.list(x))),field_notify(self),x
			if(ikey(i,'scroll'))return self.scroll=max(0,ln(x)),x
			if(ikey(i,'value' )){
				if(ls(ifield(self,'style'))!='rich'&&!rtext_is_plain(x))x=rtext_string(rtext_cast(x))
				return self.value=rtext_cast(x),field_notify(self),x
			}
			if(ikey(i,'border'   ))return self.border=lb(x),x
			if(ikey(i,'scrollbar'))return self.scrollbar=lb(x),x
			if(ikey(i,'style'    ))return self.style=normalize_enum(field_styles,ls(x)),iwrite(self,lms('value'),ifield(self,'value')),x
			if(ikey(i,'align'    ))return self.align=normalize_enum(field_aligns,ls(x)),x
		}else{
			if(ikey(i,'text'     )){const v=value_inherit(self,'value');return v!=undefined?rtext_string(v):lms('')}
			if(ikey(i,'images'   )){const v=value_inherit(self,'value');return v!=undefined?rtext_read_images(v):lml([])}
			if(ikey(i,'data'     )){const v=value_inherit(self,'value');return v!=undefined?dyad.parse(lms('%J'),rtext_string(v)):NIL}
			if(ikey(i,'border'   ))return lmn(ivalue(self,ls(i),1))
			if(ikey(i,'value'    ))return value_inherit(self,ls(i))||rtext_cast()
			if(ikey(i,'scroll'   ))return value_inherit(self,ls(i))||ZERO
			if(ikey(i,'scrollbar'))return lmn(ivalue(self,ls(i),0))
			if(ikey(i,'style'    ))return lms(ivalue(self,ls(i),'rich'))
			if(ikey(i,'align'    ))return lms(ivalue(self,ls(i),'left'))
			if(ikey(i,'size'     ))return lmpair(ivalue(self,ls(i),rect(100,20)))
			if(ikey(i,'font'     ))return dget(self.card.deck.fonts,lms(self.font||(self.style=='code'?'mono':'body')))
			if(ikey(i,'scrollto' ))return lmnat(([x])=>{
				const bi=inset(rpair(getpair(ifield(self,'pos')),getpair(ifield(self,'size'))),2);if(lb(ifield(self,'scrollbar')))bi.w-=12+3
				const l=layout_richtext(self.card.deck,ifield(self,'value'),ifield(self,'font'),ALIGN[ls(ifield(self,'align'))],bi.w)
				const i=x?min(max(0,0|ln(monad.first(x))),l.layout.length-1):0, c=rcopy(l.layout[i].pos), os=ln(ifield(self,'scroll'));c.y-=os
				const ch=min(bi.h,c.h);let t=os;if(c.y<0){t+=c.y};if(c.y+ch>=bi.h){t+=((c.y+ch)-bi.h)}
				if(t!=os)iwrite(self,lms('scroll'),lmn(t));return self
			})
		}return interface_widget(self,i,x)
	},'field');ri.card=card
	{const k=lms('value'),v=dget(x,k);if(v)iwrite(ri,k,rtext_read(v))}
	init_field(ri,'border'   ,x)
	init_field(ri,'scrollbar',x)
	init_field(ri,'style'    ,x)
	init_field(ri,'align'    ,x)
	init_field(ri,'scroll'   ,x)
	return ri
}
field_write=x=>{
	const r=lmd([lms('type')],[lms('field')])
	if(x.border!=undefined)dset(r,lms('border'),lmn(x.border))
	if(x.scrollbar!=undefined)dset(r,lms('scrollbar'),lmn(x.scrollbar))
	if(x.style&&x.style!='rich')dset(r,lms('style'),lms(x.style))
	if(x.align&&x.align!='left')dset(r,lms('align'),lms(x.align))
	if(x.scroll&&!x.volatile)dset(r,lms('scroll'),lmn(x.scroll))
	if(x.value&&!x.volatile){if(rtext_is_plain(x.value)){const v=rtext_string(x.value);if(ls(v))dset(r,lms('value'),v)}else{dset(r,lms('value'),rtext_write(x.value))}}
	return r
}
slider_styles={horiz:1,vert:1,bar:1,compact:1}
slider_normalize=(self,n)=>{const i=getpair(ifield(self,'interval')),s=ln(ifield(self,'step'));return clamp(i.x,Math.round(n/s)*s,i.y)}
slider_read=(x,card)=>{
	const update=self=>iwrite(self,lms('value'),ifield(self,'value'))
	const ri=lmi((self,i,x)=>{
		if(!is_rooted(self))return NIL
		if(x){
			if(ikey(i,'value'   ))return self.value=slider_normalize(self,ln(x)),x
			if(ikey(i,'step'    ))return self.step=max(0.000001,ln(x)),update(self),x
			if(ikey(i,'format'  ))return self.format=ls(x),x
			if(ikey(i,'style'   ))return self.style=normalize_enum(slider_styles,ls(x)),x
			if(ikey(i,'interval')){const v=getpair(x);return self.interval=rect(min(v.x,v.y),max(v.x,v.y)),update(self),x}
		}else{
			if(ikey(i,'value'   )){const v=getpair(ifield(self,'interval'));return value_inherit(self,ls(i))||lmn(clamp(v.x,0,v.y))}
			if(ikey(i,'format'  ))return lms(ivalue(self,ls(i),'%f'))
			if(ikey(i,'step'    ))return lmn(ivalue(self,ls(i),1))
			if(ikey(i,'interval'))return lmpair(ivalue(self,ls(i),rect(0,100)))
			if(ikey(i,'style'   ))return lms(ivalue(self,ls(i),'horiz'))
			if(ikey(i,'size'    ))return lmpair(ivalue(self,ls(i),rect(100,25)))
		}return interface_widget(self,i,x)
	},'slider');ri.card=card
	init_field(ri,'interval',x)
	init_field(ri,'step'    ,x)
	init_field(ri,'value'   ,x)
	init_field(ri,'format'  ,x)
	init_field(ri,'style'   ,x)
	return ri
}
slider_write=x=>{
	const r=lmd([lms('type')],[lms('slider')])
	if(x.interval)dset(r,lms('interval'),lmpair(x.interval))
	if(x.value!=undefined&&x.value!=0&&!x.volatile)dset(r,lms('value'),lmn(x.value))
	if(x.step!=undefined&&x.step!=1)dset(r,lms('step'),lmn(x.step))
	if(x.format!=undefined&&x.format!='%f')dset(r,lms('format'),lms(x.format))
	if(x.style&&x.style!='horiz')dset(r,lms('style'),lms(x.style))
	return r
}
grid_pv=self=>{
	let pv=null,vp=null
	if(self&&!self.pv){
		const t=ifield(self,'value'),c=tab_get(t,'_hideby'),nr=tab_rowcount(t);pv=[],vp=[]
		if(!c){for(let z=0;z<nr;z++)pv.push(z);vp=pv}
		else  {for(let z=0;z<nr;z++){const n=lb(c[z]);vp.push(n?-1:pv.length);if(!n)pv.push(z)}}
		self.pv=pv,self.vp=vp
	}else if(self){pv=self.pv,vp=self.vp}
	const permuted_row=disp_row=> disp_row==-1?-1: !pv?disp_row: pv[disp_row]
	const display_row =perm_row=> perm_row==-1?-1: !vp?perm_row: vp[perm_row]
	return {pv,vp,permuted_row,display_row}
}
grid_nrd=(rowcount,g)=>{
	const head=g.headers?10+5:0          // default to body font height
	const row=g.font?font_h(g.font):11   // default to mono font height
	return min(rowcount,0|((g.size.h-head+1)/(row+5)))
}
grid_scrollto=(self,g,s,r)=>{
	let nrd=0;if((typeof self)!='number'){
		const p=grid_pv(self);nrd=grid_nrd(p.pv.length,g);r=clamp(0,r,p.vp.length-1)
		let rs=0;while(r<p.vp.length){rs=p.vp[r];if(rs!=-1)break;r++};r=rs
	}else{nrd=grid_nrd(self,g)};return (r-s<0)?r: (r-s>=nrd)?r-(nrd-1): s
}
grid_read=(x,card)=>{
	const ints=(x,n)=>{const r=[];for(let z=0;z<n&&z<x.length;z++)r.push(ln(x[z]));return r}
	const ri=lmi((self,i,x)=>{
		if(!is_rooted(self))return NIL
		if(x){
			if(ikey(i,'value'    ))return self.value=lt(x),self.pv=null,self.vp=null,x
			if(ikey(i,'scroll'   ))return self.scroll=max(0,ln(x)),x
			if(ikey(i,'row'      ))return self.row=max(-1,ln(x)),x
			if(ikey(i,'col'      ))return (!lin(x)?iwrite(self,lms('colname'),x): self.col=max(-1,ln(x))),x
			if(ikey(i,'colname'  ))return iwrite(self,lms('col'),lmn(tab_cols(ifield(self,'value')).indexOf(ls(x)))),x
			if(ikey(i,'cell'     ))return iwrite(self,lms('col'),l_at(x,ZERO)),iwrite(self,lms('row'),l_at(x,ONE)),x
			if(ikey(i,'scrollbar'))return self.scrollbar=lb(x),x
			if(ikey(i,'headers'  ))return self.headers=lb(x),x
			if(ikey(i,'lines'    ))return self.lines=lb(x),x
			if(ikey(i,'bycell'   ))return self.bycell=lb(x),x
			if(ikey(i,'widths'   ))return self.widths=ints(ll(x),255),x
			if(ikey(i,'format'   ))return self.format=ls(x),x
			if(ikey(i,'rowvalue' ))return iwrite(self,lms('value'   ),amend(ifield(self,'value'   ),ifield(self,'row'    ),x)),x
			if(ikey(i,'cellvalue'))return iwrite(self,lms('rowvalue'),amend(ifield(self,'rowvalue'),ifield(self,'colname'),x)),x
		}else{
			if(ikey(i,'value'    ))return value_inherit(self,ls(i))||lmt()
			if(ikey(i,'scroll'   ))return value_inherit(self,ls(i))||ZERO
			if(ikey(i,'scrollbar'))return lmn(ivalue(self,ls(i),1))
			if(ikey(i,'headers'  ))return lmn(ivalue(self,ls(i),1))
			if(ikey(i,'lines'    ))return lmn(ivalue(self,ls(i),1))
			if(ikey(i,'bycell'   ))return lmn(ivalue(self,ls(i),0))
			if(ikey(i,'widths'   ))return lml((ivalue(self,ls(i),[])).map(lmn))
			if(ikey(i,'format'   ))return lms(ivalue(self,ls(i),''))
			if(ikey(i,'size'     ))return lmpair(ivalue(self,ls(i),rect(100,50)))
			if(ikey(i,'cell'     ))return lml([ifield(self,'col'),ifield(self,'row')])
			if(ikey(i,'row'      )){const r=value_inherit(self,ls(i))||lmn(-1);return lmn(clamp(-1,ln(r),count(ifield(self,'value'))-1))}
			if(ikey(i,'col'      )){const c=value_inherit(self,ls(i))||lmn(-1);return lmn(clamp(-1,ln(c),count(monad.keys(ifield(self,'value')))-1))}
			if(ikey(i,'colname'  )){const c=ln(ifield(self,'col'));k=tab_cols(ifield(self,'value'));return c<0||c>=k.length?NIL: lms(k[c])}
			if(ikey(i,'rowvalue' )){const r=ln(ifield(self,'row')),v=ifield(self,'value');return r<0||r>=count(v)?lmd():l_at(v,lmn(r))}
			if(ikey(i,'cellvalue')){
				const r=ln(ifield(self,'row')),c=ln(ifield(self,'col')),v=ifield(self,'value'),cn=tab_cols(v);
				return r<0||c<0||r>=count(v)||c>=tab_cols(v).length?NIL: tab_cell(v,cn[c],r)
			}
			if(ikey(i,'scrollto'))return lmnat(z=>{
				const sz=rpair(getpair(ifield(self,'pos')),getpair(ifield(self,'size'))), s=ln(ifield(self,'scroll'))
				const g={size:sz,font:ifield(self,'font'),headers:lb(ifield(self,'headers'))}
				const t=grid_scrollto(self,g,s,ln(z.length?z[0]:ZERO))
				if(t!=s)iwrite(self,lms('scroll'),lmn(t));return self
			})
		}return interface_widget(self,i,x)
	},'grid');ri.card=card
	init_field(ri,'scrollbar',x)
	init_field(ri,'headers'  ,x)
	init_field(ri,'lines'    ,x)
	init_field(ri,'bycell'   ,x)
	init_field(ri,'widths'   ,x)
	init_field(ri,'format'   ,x)
	init_field(ri,'scroll'   ,x)
	init_field(ri,'row'      ,x)
	init_field(ri,'col'      ,x)
	{const k=lms('value'),v=dget(x,k);if(v)iwrite(ri,k,monad.table(v))}
	return ri
}
grid_write=x=>{
	const r=lmd([lms('type')],[lms('grid')])
	if(x.scrollbar!=undefined)dset(r,lms('scrollbar'),lmn(x.scrollbar))
	if(x.headers!=undefined)dset(r,lms('headers'),lmn(x.headers))
	if(x.lines!=undefined)dset(r,lms('lines'),lmn(x.lines))
	if(x.bycell!=undefined)dset(r,lms('bycell'),lmn(x.bycell))
	if(x.widths)dset(r,lms('widths'),lml(x.widths.map(lmn)))
	if(x.format)dset(r,lms('format'),lms(x.format))
	if(x.value &&!x.volatile)dset(r,lms('value'),monad.cols(x.value))
	if(x.scroll&&!x.volatile)dset(r,lms('scroll'),lmn(x.scroll))
	if(x.row!=undefined&&x.row!=-1&&!x.volatile)dset(r,lms('row'),lmn(x.row))
	if(x.col!=undefined&&x.col!=-1&&!x.volatile)dset(r,lms('col'),lmn(x.col))
	return r
}
canvas_clip=(canvas,z)=>{
	const i=container_image(canvas,1),s=i.size,w=rect(0,0,s.x,s.y);canvas.clip=!z||z.length<1?w:rint(rclip(w,unpack_rect(z,w)))
}
canvas_pick=canvas=>{
	container_image(canvas,1)
	if(!canvas.brush  )iwrite(canvas,lms('brush'  ),ifield(canvas,'brush'  ))
	if(!canvas.pattern)iwrite(canvas,lms('pattern'),ifield(canvas,'pattern'))
	if(!canvas.font   )iwrite(canvas,lms('font'   ),ifield(canvas,'font'   ))
	if(!canvas.clip   )canvas_clip(canvas)
	frame=canvas
}
container_image=(canvas,build)=>{
	if(canvas.image||!build)return canvas.image
	const i=canvas.image,scale=!canvas_is(canvas)?1.0:ln(ifield(canvas,'scale')),size=getpair(ifield(canvas,'size'))
	canvas.image=i?image_copy(i):image_make(rect(ceil(size.x/scale),ceil(size.y/scale))),canvas_clip(canvas);return canvas.image
}
canvas_resize=(canvas,size)=>{
	if(!canvas.image)return
	const scale=ln(ifield(canvas,'scale'));image_resize(canvas.image,rect(ceil(size.x/scale),ceil(size.y/scale))),canvas_clip(canvas)
}
canvas_read=(x,card)=>{
	const wid_pal=x=>x.card.deck.patterns.pal.pix
	const wid_rect=(x,z)=>rint(unpack_rect(z,container_image(x).size))
	const wid_crect=(x,z)=>rint(rclip(unpack_rect(z,container_image(x).size),frame.clip))
	const text=(t,pos,a)=>{
		const font=ifield(frame,'font')
		if(pos&&lil(pos)&&count(pos)>=4){
			a=anchors[ls(a)]||0;const r=rint(getrect(pos)), align=(a==0||a==3||a==6)?ALIGN.left:(a==2||a==5||a==8)?ALIGN.right:ALIGN.center
			const l=lit(t)?layout_richtext(frame.card.deck,t,font,align,r.w):layout_plaintext(ls(t),font,align,rect(r.w,r.h))
			const valign=s=>rect(align==ALIGN.left?0:align==ALIGN.right?r.w-s.x:0|((r.w-s.x)/2), y=(a==0||a==1||a==2)?0:(a==6||a==7||a==8)?r.h-s.y:0|((r.h-s.y)/2))
			const rbox=s=>{const a=valign(s);return rint(rect(r.x+a.x,r.y+a.y,s.x,s.y))}
			draw_text_rich_raw(rbox(l.size),l,frame.pattern,0,null)
		}else{
			if(lit(t)){const p=getpair(pos);return text(t,lml([p.x,p.y,RTEXT_END/1000,RTEXT_END].map(lmn)))}
			const p=anchor(rpair(getpair(pos),font_textsize(font,ls(t))),a)
			draw_text(p,ls(t),font,frame.pattern)
		}
	}
	const ri=lmi((self,i,x)=>{
		if(!is_rooted(self))return NIL
		if(x){
			if(ikey(i,'brush'    )){let n=0|max(0,ln(x));if(lis(x)){const v=dkix(self.card.deck.brushes,x);if(v!=-1)n=24+v};return self.brush=n,x}
			if(ikey(i,'font'     ))return self.font=normalize_font(self.card.deck.fonts,x),x
			if(ikey(i,'pattern'  ))return interface_widget(self,i,x)
			if(!lis(i)){const img=container_image(self,1);return img.f(img,i,x)}
			if(self.free)return x
			if(ikey(i,'border'   ))return self.border=lb(x),x
			if(ikey(i,'draggable'))return self.draggable=lb(x),x
			if(ikey(i,'lsize'    )){i=lms('size'),x=lmpair(rmul(getpair(x),ln(ifield(self,'scale'))))}
			if(ikey(i,'size'     )){canvas_resize(self,getpair(x))}
			if(ikey(i,'scale'    )){return self.scale=max(0.1,ln(x)),canvas_resize(self,getpair(ifield(self,'size'))),x}
		}else{
			if(!lis(i)){const img=container_image(self,0);return img?img.f(img,i,x):NIL}
			if(ikey(i,'border'   ))return lmn(ivalue(self,ls(i),1))
			if(ikey(i,'draggable'))return lmn(ivalue(self,ls(i),0))
			if(ikey(i,'brush'    ))return lmn(ivalue(self,ls(i),0))
			if(ikey(i,'size'     ))return lmpair(ivalue(self,ls(i),rect(100,100)))
			if(ikey(i,'scale'    ))return lmn(ivalue(self,ls(i),1.0))
			if(ikey(i,'lsize'    )){const s=getpair(ifield(self,'size')),z=ln(ifield(self,'scale'));return lmpair(rect(ceil(s.x/z),ceil(s.y/z)))}
			if(ikey(i,'clip'     ))return lmnat(z=>(canvas_clip(self,z),self))
			if(ikey(i,'clear'    ))return lmnat(z=>(canvas_pick(self),draw_rect(wid_crect(self,z),0            )                          ,self))
			if(ikey(i,'rect'     ))return lmnat(z=>(canvas_pick(self),draw_rect(wid_crect(self,z),frame.pattern)                          ,self))
			if(ikey(i,'invert'   ))return lmnat(z=>(canvas_pick(self),draw_invert_raw(wid_pal(self),wid_crect(self,z))                    ,self))
			if(ikey(i,'box'      ))return lmnat(z=>(canvas_pick(self),draw_boxf(wid_rect(self,z),frame.brush,frame.pattern,self.card.deck),self))
			if(ikey(i,'poly'     ))return lmnat(z=>(canvas_pick(self),draw_poly(unpack_poly(z),frame.pattern)                             ,self))
			if(ikey(i,'line'     ))return lmnat(z=>(canvas_pick(self),draw_lines(unpack_poly(z),frame.brush,frame.pattern,self.card.deck) ,self))
			if(ikey(i,'fill'     ))return lmnat(([pos])=>(canvas_pick(self),draw_fill(rint(getpair(pos)),self.pattern)                    ,self))
			if(ikey(i,'copy'     ))return lmnat(z=>{const img=container_image(self,1);return image_copy(img,unpack_rect(z,img.size))})
			if(ikey(i,'paste'    ))return lmnat(([img,pos,t])=>{
				canvas_pick(self);const dst=container_image(self,1)
				img=getimage(img),pos=(pos?ll(pos):[]).map(ln); let solid=t?!lb(t):1
				image_paste_scaled(pos.length<=2?rect(pos[0],pos[1],img.size.x,img.size.y):rect(pos[0],pos[1],pos[2],pos[3]),frame.clip,img,dst,solid)
				return self
			})
			if(ikey(i,'merge'))return lmnat(z=>{
				canvas_pick(self)
				if(lis(z[0])){if(image_is(z[1]))image_merge_op(frame.image,z[1],ls(z[0])[0]);return self}
				if(lil(z[0]))z=ll(z[0]);const nice=x=>x&&image_is(x)&&x.size.x>0&&x.size.y>0, s=frame.image.size
				const v=new Uint8Array(256),sx=new Uint32Array(256),sy=new Uint32Array(256)
				for(let p=0;p<z.length&&p<256;p++)if(nice(z[p]))v[p]=1,sx[p]=z[p].size.x,sy[p]=z[p].size.y
				for(let y=0;y<s.y;y++)for(let x=0;x<s.x;x++){const h=rect(x,y);if(inclip(h)){const p=gpix(h),c=v[p]?z[p].pix[(x%sx[p])+(y%sy[p])*sx[p]]:0;pix(h,c)}}
				return self
			})
			if(ikey(i,'segment'))return lmnat(([img,x,y])=>{
				canvas_pick(self);if(!image_is(img))return self;const r=rint(getrect(x)),m=normalize_margin(y,img.size)
				r.w=max(r.w,m.x+m.w),r.h=max(r.h,m.y+m.h),draw_9seg(r,frame.image,img,m,frame.clip,0,null);return self
			})
			if(ikey(i,'outline'))return lmnat(([pat])=>(canvas_pick(self),image_outline(frame.image,ln(pat)),self))
			if(ikey(i,'text'))return lmnat(([x,pos,a])=>(canvas_pick(self),text(x=lit(x)?rtext_cast(x):lms(ls(x)),pos,a),self))
			if(ikey(i,'textsize'))return lmnat(([x,wid])=>{
				const l=layout_richtext(self.card.deck,rtext_cast(x||lms('')),ifield(self,'font'),ALIGN.left,wid?ln(wid):RTEXT_END)
				if(!wid)l.size.x=l.lines.reduce((x,y)=>max(x,y.pos.x+y.pos.w),0);return lmpair(l.size)
			})
		}return interface_widget(self,i,x)
	},'canvas');ri.card=card
	ri.card=card
	{const v=dget(x,lms('image'));if(v)ri.image=image_read(ls(v)),iwrite(ri,lms('size'),lmpair(ri.image.size))}
	{const v=dget(x,lms('size' ));if(v)ri.size=getpair(v)}
	{const v=dget(x,lms('scale'));if(v)ri.scale=max(0.1,ln(v))}
	{const v=dget(x,lms('clip' ));if(v)canvas_clip(ri,[dyad.take(lmn(2),v),dyad.drop(lmn(2),v)])}
	init_field(ri,'border'   ,x)
	init_field(ri,'draggable',x)
	init_field(ri,'brush'    ,x)
	init_field(ri,'font'     ,x)
	return ri
}
canvas_write=x=>{
	const r=lmd([lms('type')],[lms('canvas')])
	if(x.border!=undefined)dset(r,lms('border'),lmn(x.border))
	if(x.image&&!is_blank(x.image)&&!x.volatile)dset(r,lms('image'),lms(image_write(x.image)))
	if(x.draggable)dset(r,lms('draggable'),lmn(x.draggable))
	if(x.brush    )dset(r,lms('brush'    ),lmn(x.brush))
	if(x.scale)dset(r,lms('scale'),lmn(x.scale))
	if(x.clip&&!requ(x.clip,rpair(rect(),getpair(ifield(x,'lsize')))))dset(r,lms('clip'),lml([x.clip.x,x.clip.y,x.clip.w,x.clip.h].map(lmn)))
	return r
}
contraption_read=(x,card)=>{
	x=ld(x);const dname=dget(x,lms('def')), def=dname?dget(card.deck.contraptions,dname):null;if(!def)return null
	const corner_reflow=(p,s,m,d)=>rect(
		(p.x<m.x)?p.x: (p.x>s.x-m.w)?d.x-(s.x-p.x): s.x==0?0:Math.round((p.x/s.x)*d.x), // left | right  | stretch horiz
		(p.y<m.y)?p.y: (p.y>s.y-m.h)?d.y-(s.y-p.y): s.y==0?0:Math.round((p.y/s.y)*d.y)  // top  | bottom | stretch vert
	)
	const reflow=c=>{
		const def=c.def, swids=def.widgets, dwids=c.widgets, m=def.margin, s=def.size, d=getpair(ifield(c,'size'))
		swids.k.map((k,i)=>{
			const swid=swids.v[i],dwid=dget(dwids,k);if(!dwid)return
			let a=getpair(ifield(swid,'pos')), b=radd(getpair(ifield(swid,'size')),a)
			a=corner_reflow(a,s,m,d), b=corner_reflow(b,s,m,d)
			iwrite(dwid,lms('pos'),lmpair(a)),iwrite(dwid,lms('size'),lmpair(rsub(b,a)))
		})
	}
	const masks={name:1,index:1,image:1,script:1,locked:1,animated:1,volatile:1,pos:1,show:1,font:1,pattern:1,toggle:1,event:1,offset:1,parent:1}
	const ri=lmi((self,i,x)=>{
		if(!is_rooted(self))return NIL
		if(x){
			if(ikey(i,'def'  ))return x // not mutable!
			if(ikey(i,'image'))return x // not mutable!
			if(ikey(i,'size' )){
				const m=self.def.margin
				return self.size=rmax(rect(m.x+m.w,m.y+m.h),getpair(x)),reflow(self),x
			}
			if(lis(i)&&masks.hasOwnProperty(ls(i)))return interface_widget(self,i,x)
			return fire_attr_sync(self,'set_'+ls(i),x),x
		}else{
			if(ikey(i,'def'  ))return self.def
			if(ikey(i,'size' ))return lmpair((def.resizable?self.size:def.size)||def.size)
			if(ikey(i,'image'))return ifield(self.def,'image')
			if(lis(i)&&masks.hasOwnProperty(ls(i)))return interface_widget(self,i,x)
			return fire_attr_sync(self,'get_'+ls(i),null)
		}
	},'contraption')
	ri.card   =card
	ri.deck   =card.deck
	ri.def    =def
	ri.widgets=lmd()
	let w=dget(x,lms('widgets')),d=def.widgets;if(w){w=ld(w)}else{w=lmd();def.widgets.k.map(k=>dset(w,k,lmd()))}
	d.k.map((k,i)=>{const a=widget_write(d.v[i]),o=dget(w,k);widget_add(ri,o?dyad[','](a,o):a)})
	{const k=lms('size'),v=dget(x,k);iwrite(ri,k,v?v:ifield(def,'size'))}
	{ri.viewproxy=lmi(interface_widget,'proxy'),ri.viewproxy.card=ri}
	return ri
}
contraption_write=x=>{
	const wids=lmd(), r=lmd(['type','def','widgets'].map(lms),[lms('contraption'),ifield(x.def,'name'),wids])
	const dict_delta=(a,b)=>{const r=lmd();b.k.map((k,i)=>{const av=dget(a,k),bv=b.v[i];if(!av||!match(av,bv))dset(r,k,bv)});return r}
	x.widgets.v.map(w=>{
		let wid=widget_write(w), n=ifield(w,'name'), src=dget(x.def.widgets,n)
		dset(wids,n,dyad.drop(lms('name'),src?dict_delta(widget_write(src),wid):wid))
	});return r
}
widget_shows={solid:1,invert:1,transparent:1,none:1}
default_pattern=wid=>button_is(wid)?32: (slider_is(wid)&&ls(ifield(wid,'style'))=='compact')?32: 1
interface_widget=(self,i,x)=>{
	widget_rename=(card,a,b)=>{const w=card.widgets,i=dkix(w,a);w.k[i]=b,w.v[i].name=ls(b)}
	if(x){
		if(ikey(i,'name'    ))return widget_rename(self.card,lms(self.name),ukey(self.card.widgets,lms(ls(x)),ls(x),lms(self.name))),x
		if(ikey(i,'index'   ))return reorder(self.card.widgets,dvix(self.card.widgets,self),ln(x)),x
		if(ikey(i,'font'    ))return self.font=normalize_font(self.card.deck.fonts,x),x
		if(ikey(i,'pattern' ))return self.pattern=0|clamp(0,ln(x),255),x
		if(ikey(i,'script'  ))return self.script=ls(x),x
		if(ikey(i,'locked'  ))return self.locked=lb(x),x
		if(ikey(i,'animated'))return self.animated=lb(x),x
		if(ikey(i,'volatile'))return self.volatile=lb(x),x
		if(ikey(i,'size'    ))return self.size=rint(rclamp(rect(),getpair(x),rect(4096,4096))),x
		if(ikey(i,'pos'     ))return self.pos=rint(getpair(x)),x
		if(ikey(i,'show'    ))return self.show=normalize_enum(widget_shows,ls(x)),x
	}else{
		if(ikey(i,'name'    ))return lms(self.name)
		if(ikey(i,'index'   ))return lmn(dvix(self.card.widgets,self))
		if(ikey(i,'script'  ))return lms(ivalue(self,ls(i),''))
		if(ikey(i,'locked'  ))return lmn(ivalue(self,ls(i),0))
		if(ikey(i,'animated'))return lmn(ivalue(self,ls(i),0))
		if(ikey(i,'volatile'))return lmn(ivalue(self,ls(i),0))
		if(ikey(i,'pos'     ))return lmpair(ivalue(self,ls(i),rect()))
		if(ikey(i,'show'    ))return lms(ivalue(self,ls(i),'solid'))
		if(ikey(i,'font'    ))return dget(self.card.deck.fonts,lms(ivalue(self,ls(i),button_is(self)?'menu':'body')))
		if(ikey(i,'pattern' ))return lmn(ivalue(self,ls(i),default_pattern(self)))
		if(ikey(i,'event'   ))return lmnat(args=>n_event(self,args))
		if(ikey(i,'parent'  ))return self.card
		if(ikey(i,'toggle'  ))return lmnat(([s,v])=>{
			const a=v==undefined;s=s||lms('solid'),v=v||ZERO;const o=ifield(self,'show'),n=lms('none')
			const r=(a?match(o,n):(lb(v)&&!match(v,n)))?s:n;iwrite(self,lms('show'),r);return r
		})
		if(ikey(i,'offset')){
			let c=getpair(ifield(self.card,'size')), p=getpair(ifield(self,'pos')), d=self.card.deck.size, con=self.card
			while(contraption_is(con)){p=radd(p,getpair(ifield(con,'pos'))),con=con.card,c=getpair(ifield(con,'size'))}
			return lmpair(radd(p,rcenter(rect(0,0,d.x,d.y),c)))
		}
	}return x?x:NIL
}
widget_read=(x,card)=>{
	const type=ls(dget(x,lms('type'))||lms('button')), tname=type=='contraption'?ls(dget(x,lms('def'))||lms(type)):type
	const ctors={button:button_read,field:field_read,slider:slider_read,grid:grid_read,canvas:canvas_read,contraption:contraption_read}
	const ri=(ctors[type]||button_read)(ld(x),card);if(!lii(ri))return null
	ri.name=ls(ukey(card.widgets,dget(x,lms('name')),tname))
	if(!canvas_is(ri))init_field(ri,'size',x)
	init_field(ri,'script'  ,x)
	init_field(ri,'font'    ,x)
	init_field(ri,'pattern' ,x)
	init_field(ri,'locked'  ,x)
	init_field(ri,'animated',x)
	init_field(ri,'volatile',x)
	init_field(ri,'pos'     ,x)
	init_field(ri,'show'    ,x)
	return ri
}
widget_write=x=>{
	const r=lmd()
	dset(r,lms('name'),lms(x.name))
	dset(r,lms('type'),lms(x.n))
	dset(r,lms('size'),ifield(x,'size'))
	dset(r,lms('pos' ),ifield(x,'pos' ))
	if(x.size    )dset(r,lms('size'    ),lmpair(x.size))
	if(x.pos     )dset(r,lms('pos'     ),lmpair(x.pos))
	if(x.locked  )dset(r,lms('locked'  ),lmn(x.locked))
	if(x.animated)dset(r,lms('animated'),lmn(x.animated))
	if(x.volatile)dset(r,lms('volatile'),lmn(x.volatile))
	if(x.script  )dset(r,lms('script'  ),lms(x.script))
	if(x.font&&x.font!=(button_is(x)?"menu":"body"))dset(r,lms('font'),lms(x.font))
	if(x.pattern!=null&&x.pattern!=default_pattern(x))dset(r,lms('pattern'),lmn(x.pattern))
	if(x.show&&x.show!='solid')dset(r,lms('show'),lms(x.show))
	return dyad[','](r,button_is(x)?button_write(x): field_is (x)?field_write (x):slider_is(x)?slider_write(x):
	                   grid_is  (x)?grid_write  (x): canvas_is(x)?canvas_write(x):contraption_is(x)?contraption_write(x): lmd())
}

widget_strip=x=>dyad.take(lml([lms('name'),lms('type')]),x)
widget_add=(card,x)=>{const r=widget_read(x,card);if(lii(r))dset(card.widgets,ifield(r,'name'),r);return r}
card_add=(card,type,name,n2)=>{
	if(prototype_is(card)&&(contraption_is(type)||ls(type)=='contraption'))return NIL
	if(lis(type)){
		if(ls(type)=='contraption'){
			const defs=card.deck.contraptions, ct=lms(name?ls(name):''), def=dget(defs,ct);if(!def)return NIL
			const a=lmd(['type','def'].map(lms),[lms('contraption'),ct]);if(n2)dset(a,lms('name'),lms(ls(n2)));return widget_add(card,a)
		}
		if(!ls(type)in{button:1,field:1,slider:1,canvas:1,grid:1})return NIL
		const a=lmd([lms('type')],[type]);if(name)dset(a,lms('name'),lms(ls(name)));return widget_add(card,a)
	}
	if(widget_is(type)){const a=widget_write(type);if(name)dset(a,lms('name'),name);return widget_add(card,a)}
	return NIL
}
card_remove=(card,x)=>{
	if(lil(x)||lid(x))return x.v.reduce((x,y)=>x&card_remove(card,y),1)
	if(!widget_is(x)||!dkey(card.widgets,x))return 0
	const name=ifield(x,'name');dget(card.widgets,name).dead=true,card.widgets=dyad.drop(name,card.widgets);return 1
}
con_copy_raw=(card,z)=>z.filter(w=>widget_is(w)&&w.card==card).map(widget_write)
con_paste_raw=(card,payload)=>payload.map(p=>widget_add(card,ld(p)))
find_fonts=(deck,target,widgets)=>{
	let fonts=lmd([],[]);widgets.filter(widget_is).map(wid=>{
		if(wid.font)dset(fonts,lms(wid.font),dget(deck.fonts,lms(wid.font))) // directly on widgets
		if(contraption_is(wid)){ // inside contraption instances
			wid.widgets.v.map(w=>ifield(w,'font')).map(f=>dset(fonts,dkey(deck.fonts,f),f))
		}
		if(field_is(wid)&&match(ifield(wid,'style'),lms('rich'))){ // inside rtext field values
			tab_get(ifield(wid,'value'),'font').filter(n=>count(n)&&!dget(fonts,n)&&dget(deck.fonts,n)).map(n=>dset(fonts,n,dget(deck.fonts,n)))
		}
	})
	fonts=dyad.drop(lml(['body','menu','mono'].map(lms)),fonts),fonts.v.map((x,i)=>{fonts.v[i]=lms(font_write(x))})
	if(count(fonts))dset(target,lms('f'),fonts)
}
merge_fonts=(deck,f)=>{
	if(!f)return;f=ld(f)
	f.v.map((x,i)=>{const k=f.k[i],v=font_read(ls(x));if(font_is(v)&&!dget(deck.fonts,k))dset(deck.fonts,k,v)})
}
con_copy=(card,z)=>{
	z=lil(z)||lid(z)?ll(z):[z];
	const wids=lml(con_copy_raw(card,z)),defs=lmd(),v=lmd(['w','d'].map(lms),[wids,defs])
	const condefs=card.deck.contraptions;find_fonts(card.deck,v,z),wids.v.map(wid=>{
		const type=dget(wid,lms('type')),def=dget(wid,lms('def'))
		if(ls(type)=='contraption'&&dget(defs,def)==null)dset(defs,def,prototype_write(dget(condefs,def)))
	});return lms(\`%%WGT0\${flove(v)}\`)
}
merge_prototypes=(deck,defs,uses)=>{
	const condefs=deck.contraptions;defs.v.map(def=>{
		const name=dget(def,lms('name'));let desc=dget(def,lms('description'));if(!lis(name))return;if(!desc)desc=lms('')
		const ver=dget(def,lms('version')),version=ver?ln(ver):0.0
		if(condefs.v.some(con=>{
			const r=match(name,ifield(con,'name'))&&match(desc,ifield(con,'description'))
			if(r&&ln(ifield(con,'version'))<version)deck_add(deck,prototype_read(def,deck_read('')))
			return r
		}))return
		const p=prototype_read(def,deck),nn=ifield(p,'name');dset(condefs,nn,p)
		uses.map(wid=>{
			const type=dget(wid,lms('type')),def=dget(wid,lms('def'))
			if(lis(type)&&ls(type)=='contraption'&&lis(def)&&ls(def)==ls(name))dset(wid,lms('def'),nn)
		})
	})
}
con_paste=(card,z)=>{
	if(!lis(z)||!z.v.startsWith('%%WGT0'))return NIL
	const v=ld(plove(ls(z),6,count(z)-6).value),defs=dget(v,lms('d'));let wids=dget(v,lms('w'));wids=wids?ll(wids):[]
	merge_fonts(card.deck,dget(v,lms('f'))),merge_prototypes(card.deck,defs?ld(defs):lmd(),wids);return lml(con_paste_raw(card,wids))
}
card_read=(x,deck,cdata)=>{
	x=ld(x);const nav_dirs={right:1,left:1,up:1,down:1},ri=lmi((self,i,x)=>{
		if(self.dead)return NIL
		if(x){
			if(ikey(i,'name')){
				if(ls(x).length==0)return x;const n=ukey(deck.cards,lms(ls(x)),ls(x),lms(self.name))
				deck.cards.k[dvix(deck.cards,self)]=n,self.name=ls(n);return x
			}
			if(ikey(i,'script'))return self.script=ls(x),x
			if(ikey(i,'image' ))return self.image=image_is(x)?x:image_make(rect()),x
			if(ikey(i,'index'))return reorder(self.deck.cards,dvix(self.deck.cards,self),ln(x)),self.deck.history=[ln(ifield(self,'index'))],x
		}else{
			if(ikey(i,'name'   ))return lms(self.name)
			if(ikey(i,'size'   ))return lmpair(deck.size)
			if(ikey(i,'index'  ))return lmn(dvix(deck.cards,self))
			if(ikey(i,'script' ))return lms(self.script||'')
			if(ikey(i,'widgets'))return self.widgets
			if(ikey(i,'parent' ))return self.deck
			if(ikey(i,'image'  ))return self.image
			if(ikey(i,'add'    ))return lmnat(([t,n1,n2])=>card_add(self,t,n1,n2))
			if(ikey(i,'remove' ))return lmnat(([x])=>lmn(card_remove(self,x)))
			if(ikey(i,'event'  ))return lmnat(args=>n_event(self,args))
			if(ikey(i,'copy'   ))return lmnat(([z])=>con_copy(self,z))
			if(ikey(i,'paste'  ))return lmnat(([z])=>con_paste(self,z))
		}return x?x:NIL
	},'card')
	const n=dget(x,lms('name'))
	ri.deck=deck
	ri.widgets=lmd()
	ri.name=ls(ukey(deck.cards,n&&lis(n)&&count(n)==0?null:n,'card'))
	ri.script=ls(dget(x,lms('script'))||lms(''))
	{const v=dget(x,lms('image'));ri.image=v?image_read(ls(v)):image_make(deck.size)}
	ll(dget(x,lms('widgets'))||lml([])).filter(w=>dget(w,lms('name'))).map(w=>{const i=widget_read(w,ri);if(lii(i))dset(ri.widgets,ifield(i,'name'),i)})
	return ri
}
card_write=card=>{
	const r=lmd(),wids=lmd()
	dset(r,lms('name'),lms(card.name)),dset(r,lms('widgets'),wids)
	if(card.script.length)dset(r,lms('script'),lms(card.script))
	if(card.image&&!is_blank(card.image))dset(r,lms('image'),lms(image_write(card.image)))
	card.widgets.k.map((k,i)=>{
		let wid=widget_write(card.widgets.v[i]),n=dget(wid,lms('name'))
		wid=dyad.drop(lms('name'),wid)
		if(count(wid))dset(wids,n,wid)
	});return r
}
contraption_update=(deck,def)=>{
	const contraption_strip=x=>{
		const r=lmd();x.widgets.v.map(w=>{
			let p=widget_write(w)
			if(button_is(w))p=dyad.take(lms('value'),p)
			if(slider_is(w))p=dyad.take(lms('value'),p)
			if(field_is (w))p=dyad.take(lml(['value','scroll'].map(lms)),p)
			if(grid_is  (w))p=dyad.take(lml(['value','scroll','row','col'].map(lms)),p)
			if(canvas_is(w))p=dyad.take(lms('image'),p)
			dset(r,ifield(w,'name'),p)
		});return r
	}
	deck.cards.v.map(card=>{
		card.widgets.v.filter(x=>contraption_is(x)&&x.def==def).map(widget=>{
			const d=widget_write(widget), n=widget.name
			dset(d,lms('widgets'),contraption_strip(widget))
			for(var k in widget)delete widget[k];Object.assign(widget,widget_read(d,card));widget.name=n
		})
	})
}
normalize_margin=(x,s)=>{
	const m=rint(getrect(x))
	return rmax(rect(min(m.x,s.x),min(m.y,s.y),min(m.w,s.x-m.x),min(m.h,s.y-m.y)),rect(0,0,0,0))
}
prototype_read=(x,deck)=>{
	x=ld(x)
	const attribute_types={'':1,bool:1,number:1,string:1,code:1,rich:1}
	const normalize_attributes=x=>{
		const r=lmt();tab_set(r,'name',[]),tab_set(r,'label',[]),tab_set(r,'type',[]);if(!lit(x))return r
		const sn=tab_get(x,'name'),sl=tab_get(x,'label')||sn,st=tab_get(x,'type')
		if(sn&&st)sn.filter(n=>lis(n)&&count(n)).map((n,i)=>{
			const type=normalize_enum(attribute_types,ls(st[i]))
			if(type.length)tab_get(r,'name').push(n),tab_get(r,'label').push(lms(ls(sl[i]))),tab_get(r,'type').push(lms(type))
		});return r
	}
	const prototype_pos=self=>lmpair(rcenter(rect(0,0,deck.size.x,deck.size.y),self.size))
	const ri=lmi((self,i,x)=>{
		if(self.dead)return NIL
		if(x){
			if(ikey(i,'name')){
				const defs=self.deck.contraptions, o=self.name, n=ukey(defs,lms(ls(x)),ls(x),lms(o))
				defs.k[dvix(defs,self)]=n,self.name=ls(n);return x
			}
			if(ikey(i,'description'))return self.description=ls(x),x
			if(ikey(i,'version'    ))return self.version=ln(x),x
			if(ikey(i,'size'       ))return self.size=rint(getpair(x)),contraption_update(deck,self),x
			if(ikey(i,'margin'     ))return self.margin=normalize_margin(x,getpair(ifield(self,'size'))),contraption_update(deck,self),x
			if(ikey(i,'resizable'  ))return self.resizable=lb(x),contraption_update(deck,self),x
			if(ikey(i,'image'      ))return self.image=image_is(x)?x:image_make(rect(0,0)),x
			if(ikey(i,'script'     ))return self.script=ls(x),x
			if(ikey(i,'template'   ))return self.template=ls(x),x
			if(ikey(i,'attributes' ))return self.attributes=normalize_attributes(x),x
		}else{
			if(ikey(i,'name'       ))return lms(self.name)
			if(ikey(i,'description'))return lms(self.description||'')
			if(ikey(i,'version'    ))return lmn(self.version||0.0)
			if(ikey(i,'script'     ))return lms(self.script||'')
			if(ikey(i,'template'   ))return lms(self.template||'')
			if(ikey(i,'font'       ))return monad.first(self.deck.fonts)
			if(ikey(i,'pattern'    ))return ONE
			if(ikey(i,'show'       ))return lms('solid')
			if(ikey(i,'parent'     ))return ifield(self.deck,'card')
			if(ikey(i,'size'       ))return lmpair(self.size)
			if(ikey(i,'margin'     ))return lmrect(self.margin)
			if(ikey(i,'resizable'  ))return lmn(self.resizable)
			if(ikey(i,'image'      ))return self.image
			if(ikey(i,'widgets'    ))return self.widgets
			if(ikey(i,'attributes' ))return self.attributes||normalize_attributes(NIL)
			if(ikey(i,'offset'     ))return prototype_pos(self)
			if(ikey(i,'pos'        ))return prototype_pos(self)
			if(ikey(i,'add'        ))return lmnat(([t,n1,n2])=>{const r=card_add(self,t,n1,n2);if(widget_is(r))contraption_update(deck,self);return r})
			if(ikey(i,'remove'     ))return lmnat(([x])=>{const r=card_remove(self,x);if(lb(r))contraption_update(deck,self);return r})
			if(ikey(i,'update'     ))return lmnat(_=>{contraption_update(deck,self);return NIL})
		}return x?x:NIL
	},'prototype')
	ri.deck   =deck
	ri.widgets=lmd()
	{const v=dget(x,lms('name'      ));ri.name=ls(ukey(deck.contraptions,v&&lis(v)&&count(v)==0?null:v,'prototype'))}
	{const v=dget(x,lms('attributes'));if(v)iwrite(ri,lms('attributes'),monad.table(v))}
	{const v=dget(x,lms('size'      ));ri.size=v?rint(getpair(v)):rect(100,100)}
	{const v=dget(x,lms('image'     ));ri.image=v?image_read(ls(v)):image_make(ri.size)}
	{const v=dget(x,lms('resizable' ));ri.resizable=v?lb(v):0}
	let w=dget(x,lms('widgets'));if(lid(w)){w.v.map((v,i)=>dset(v,lms('name'),w.k[i]))}
	(w?ll(w):[]).map(w=>{const n=dget(w,lms('name'));if(n){const i=widget_read(w,ri);if(lii(i))dset(ri.widgets,ifield(i,'name'),i)}})
	init_field(ri,'description',x)
	init_field(ri,'version'    ,x)
	init_field(ri,'script'     ,x)
	init_field(ri,'template'   ,x)
	ri.margin=normalize_margin(dget(x,lms('margin'))||NIL,getpair(ifield(ri,'size')))
	return ri
}
prototype_write=x=>{
	const r=lmd(), wids=lmd(), nice=x=>x&&image_is(x)&&x.size.x>0&&x.size.y>0&&!is_blank(x)
	dset(r,lms('name'),lms(x.name))
	dset(r,lms('size'),ifield(x,'size'))
	if(x.resizable)dset(r,lms('resizable'),ONE)
	dset(r,lms('margin'),ifield(x,'margin'))
	if(x.description&&x.description.length)dset(r,lms('description'),lms(x.description))
	if(x.version    &&x.version!=0.0      )dset(r,lms('version'    ),lmn(x.version    ))
	if(x.script     &&x.script.length     )dset(r,lms('script'     ),lms(x.script     ))
	if(x.template   &&x.template.length   )dset(r,lms('template'   ),lms(x.template   ))
	if(nice(x.image)                      )dset(r,lms('image'      ),lms(image_write(x.image)))
	if(x.attributes                       )dset(r,lms('attributes' ),monad.cols(x.attributes))
	x.widgets.v.map(v=>{
		let wid=widget_write(v),n=dget(wid,lms('name'))
		wid=dyad.drop(lms('name'),wid);if(count(wid))dset(wids,n,wid)
	}),dset(r,lms('widgets'),wids);return r
}
rename_sound=(deck,sound,name)=>{
	const sounds=deck.sounds,oldname=dkey(sounds,sound)
	sounds.k[dkix(sounds,oldname)]=ukey(sounds,name,ls(name),oldname)
}
deck_add=(deck,type,y,z)=>{
	const unpack_name=x=>x?lms(ls(x)):NIL
	if(font_is(type))return uset(deck.fonts,unpack_name(y),'font',font_read(font_write(type)))
	if(ikey(type,'font'))return uset(deck.fonts,unpack_name(z),'font',font_read(getpair(y)))
	if(sound_is(type))return uset(deck.sounds,unpack_name(y),'sound',sound_read(sound_write(type)))
	if(ikey(type,'sound'))return uset(deck.sounds,unpack_name(z),'sound',sound_read(y?ln(y):0))
	if(module_is(type)){
		if((!y)&&dget(deck.modules,ifield(type,'name'))){
			deck_remove(deck,dget(deck.modules,ifield(type,'name')))
			const r=module_read(module_write(type),deck);
			return dset(deck.modules,ifield(r,'name'),r),r
		}else{
			const a=module_write(type);if(y)dset(a,lms('name'),lms(ls(y)));
			const r=module_read(a,deck);return dset(deck.modules,ifield(r,'name'),r),r
		}
	}
	if(ikey(type,'module')){const a=lmd();if(y)dset(a,lms('name'),lms(ls(y)));const r=module_read(a,deck);return dset(deck.modules,ifield(r,'name'),r),r}
	if(card_is(type))return deck_paste(deck,deck_copy(deck,type),y?lms(ls(y)):null)
	if(ikey(type,'card')){const a=lmd();if(y)dset(a,lms('name'),lms(ls(y)));const r=card_read(a,deck);return dset(deck.cards,ifield(r,'name'),r),r}
	if(prototype_is(type)){
		if((!y)&&dget(deck.contraptions,ifield(type,'name'))){
			const name=ifield(type,'name'),r=dget(deck.contraptions,name)
			for(var k in r)delete r[k];Object.assign(r,prototype_read(prototype_write(type),deck));r.name=ls(name)
			contraption_update(deck,r);return r
		}else{
			const a=prototype_write(type);if(y)dset(a,lms('name'),lms(ls(y)));
			const r=prototype_read(a,deck);return dset(deck.contraptions,ifield(r,'name'),r),r
		}
	}
	if(ikey(type),'contraption'){const a=lmd();if(y)dset(a,lms('name'),lms(ls(y)));const r=prototype_read(a,deck);return dset(deck.contraptions,ifield(r,'name'),r),r}
	return NIL
}
deck_remove=(deck,t)=>{
	if(widget_is(t)&&is_rooted(t))return card_remove(t.card,t)
	if(patterns_is(t)){const r=patterns_read({});return t.pal=r.pal,t.anim=r.anim,1}
	if(module_is(t)){const k=dkey(deck.modules,t);if(k)return deck.modules=dyad.drop(k,deck.modules),1}
	if(sound_is(t)){const k=dkey(deck.sounds,t);if(k)return deck.sounds=dyad.drop(k,deck.sounds),1}
	if(font_is(t)){
		const k=dkey(deck.fonts,t);if(!k||ls(k)in{body:1,menu:1,mono:1})return 0
		const remove=w=>w.v.map(w=>{if(w.font==ls(k))w.font='body';if(contraption_is(w))remove(w.widgets)})
		deck.cards.v.map(c=>remove(c.widgets))
		deck.contraptions.v.map(c=>remove(c.widgets))
		return deck.fonts=dyad.drop(k,deck.fonts),1
	}
	if(prototype_is(t)){
		const k=dkey(deck.contraptions,t);if(!k)return 0
		deck.cards.v.map(card=>card.widgets.v.filter(w=>contraption_is(w)&&w.def==t).map(w=>card_remove(card,w)))
		return deck.contraptions=dyad.drop(k,deck.contraptions),t.dead=true,1
	}
	if(card_is(t)){
		if(count(deck.cards)<=1)return 0
		deck.cards=dyad.drop(dkey(deck.cards,t)||NIL,deck.cards),t.dead=true
		if(deck.card>=count(deck.cards))deck.card=count(deck.cards-1)
		deck.history=[ln(ifield(ifield(deck,'card'),'index'))]
		return 1
	}return 0
}
deck_copy=(deck,z)=>{
	if(!card_is(z))return NIL;const defs=lmd(),v=lmd(['c','d'].map(lms),[card_write(z),defs]);find_fonts(deck,v,z.widgets.v)
	z.widgets.v.filter(contraption_is).map(wid=>{const d=wid.def,n=ifield(d,'name');if(dget(defs,n)==null)dset(defs,n,prototype_write(d))})
	return lms(\`%%CRD0\${flove(v)}\`)
}
deck_paste=(deck,z,name)=>{
	if(!lis(z)||!ls(z).startsWith('%%CRD0'))return NIL
	const v=ld(plove(ls(z),6,count(z)-6).value);let payload=dget(v,lms('c')),defs=dget(v,lms('d'));payload=payload?ld(payload):lmd()
	const wids=dget(payload,lms('widgets'));if(wids&&lid(wids))wids.v.map((v,i)=>dset(v,lms('name'),wids.k[i]))
	merge_fonts(deck,dget(v,lms('f')))
	merge_prototypes(deck,defs?ld(defs):lmd(),wids?ll(wids):[]);const r=card_read(payload,deck);dset(deck.cards,name||ifield(r,'name'),r);return r
}
widget_purge=x=>{
	if(!x.volatile)return
	if(button_is(x))iwrite(x,lms('value'),ZERO)
	if(slider_is(x))iwrite(x,lms('value'),ZERO)
	if(field_is (x))iwrite(x,lms('value'),lms('')),iwrite(x,lms('scroll'),ZERO)
	if(grid_is  (x))iwrite(x,lms('value'),lmt()  ),iwrite(x,lms('scroll'),ZERO)
	if(canvas_is(x)){const t=frame;canvas_pick(x),draw_rect(frame.clip,0);frame=t}
	if(contraption_is(x))x.widgets.v.map(w=>widget_purge(w))
}
deck_purge=x=>{x.cards.v.map(c=>c.widgets.v.map(w=>widget_purge(w)))}
deck_read=x=>{
	const deck={},scripts=new Map(),cards={},modules={},defs={}, fonts=lmd(),sounds=lmd(); let i=0,m=0,md=0,lc=0
	Object.keys(FONTS).map(k=>dset(fonts,lms(k),font_read(FONTS[k])))
	const match=k=>x.startsWith(k,i)?(i+=k.length,1):0
	const end=_=>i>=x.length||x.startsWith('<\\/script>',i)
	const str=e=>{let r='';while(!end()&&!match(e))r+=match('{l}')?'{': match('{r}')?'}': match('{c}')?':': match('{s}')?'/': x[i++];return clchars(r)}
	const last=dict=>{const k=Object.keys(dict);return dict[k[k.length-1]]||lmd()}
	match('<meta charset="UTF-8">');
	match('<body><script language="decker">');while(!end()){
		if(x[i]=='\\n')i++
		else if(x[i]=='#')while(!end()&&x[i]!='\\n')i++
		else if(match('{deck}\\n'   ))m=1
		else if(match('{fonts}\\n'  ))m=2
		else if(match('{sounds}\\n' ))m=3
		else if(match('{widgets}\\n'))m=4
		else if(match('{card:')){const k=str('}');cards['~'+k]=lmd(['name','widgets'].map(lms),[lms(k),lml([])]),m=5,lc=0}
		else if(match('{script:')){const k=str('}\\n');scripts.set(k,str('\\n{end}'))}
		else if(match('{module:')){const k=str('}');modules['~'+k]=lmd(['name','script','data'].map(lms),[lms(k),lms(''),lmd()]),m=6,md=0}
		else if(match('{contraption:')){const k=str('}');defs['~'+k]=lmd(['name','widgets'].map(lms),[lms(k),lml([])]),m=7,lc=1}
		else if(m==6&&match('{data}\\n')){md=1}
		else if(m==6&&match('{script}\\n')){dset(last(modules),lms('script'),lms(str('\\n{end}'))),m=1}
		else{
			const k=str(':'),j=plove(x,i,x.length-i),v=j.value;i=j.index
			if(m==1)deck[k]=v
			if(m==2)dset(fonts,lms(k),font_read(ls(v)))
			if(m==3)dset(sounds,lms(k),sound_read(ls(v)))
			if(m==4&&!lc){if(Object.keys(cards).length)dget(last(cards),lms('widgets')).v.push(dset(ld(v),lms('name'),lms(k)))}
			if(m==4&& lc){if(Object.keys(defs ).length)dget(last(defs ),lms('widgets')).v.push(dset(ld(v),lms('name'),lms(k)))}
			if(m==5)dset(last(cards),lms(k),v)
			if(m==6)dset(md?dget(last(modules),lms('data')):last(modules),lms(k),v)
			if(m==7)dset(last(defs),lms(k),v)
		}
	}
	const dscript=x=>{const k=lms('script'),s=dget(x,k);if(s)dset(x,k,lms(scripts.get(ls(s))))}
	Object.values(cards).map(c=>{dscript(c),dget(c,lms('widgets')).v.map(dscript)})
	Object.values(defs ).map(c=>{dscript(c),dget(c,lms('widgets')).v.map(dscript)})
	const ri=lmi((self,i,x)=>{
		if(x){
			if(ikey(i,'locked' ))return self.locked=lb(x),x
			if(ikey(i,'name'   ))return self.name=ls(x),x
			if(ikey(i,'author' ))return self.author=ls(x),x
			if(ikey(i,'corners'))return self.corners=clamp(0,ln(x),47),x
			if(ikey(i,'script' ))return self.script=ls(x),x
			if(ikey(i,'card'   ))return n_go([x],self),x
		}else{
			if(ikey(i,'version' ))return lmn(self.version)
			if(ikey(i,'locked'  ))return lmn(self.locked)
			if(ikey(i,'name'    ))return lms(self.name)
			if(ikey(i,'author'  ))return lms(self.author)
			if(ikey(i,'corners' ))return lmn(self.corners)
			if(ikey(i,'script'  ))return lms(self.script)
			if(ikey(i,'patterns'))return self.patterns
			if(ikey(i,'sounds'  ))return dyad.drop(ZERO,self.sounds)
			if(ikey(i,'fonts'   ))return dyad.drop(ZERO,self.fonts)
			if(ikey(i,'cards'   ))return self.cards
			if(ikey(i,'modules' ))return self.modules
			if(ikey(i,'contraptions'))return self.contraptions
			if(ikey(i,'card'    ))return self.cards.v[min(count(self.cards)-1,self.card)]
			if(ikey(i,'add'     ))return lmnat(([x,y,z])=>deck_add(self,x,y,z))
			if(ikey(i,'remove'  ))return lmnat(([x])=>lmn(deck_remove(self,x)))
			if(ikey(i,'event'   ))return lmnat(args=>n_event(self,args))
			if(ikey(i,'copy'    ))return lmnat(([x])=>deck_copy(self,x))
			if(ikey(i,'paste'   ))return lmnat(([x])=>deck_paste(self,x))
			if(ikey(i,'purge'   ))return lmnat(()=>{deck_purge(self);return self})
			if(ikey(i,'encoded' ))return lms(deck_write(self))
		}return x?x:NIL
	},'deck')
	ri.fonts       =fonts
	ri.sounds      =sounds
	ri.contraptions=lmd()
	ri.cards       =lmd()
	ri.modules     =lmd()
	ri.transit     =lmd()
	ri.brushes     =lmd()
	ri.brusht      =lmd()
	ri.patterns    =patterns_read(deck)
	ri.version     =deck.hasOwnProperty('version')?ln(deck.version):1
	ri.locked      =deck.hasOwnProperty('locked' )?lb(deck.locked ):0
	ri.name        =deck.hasOwnProperty('name'   )?ls(deck.name   ):''
	ri.author      =deck.hasOwnProperty('author' )?ls(deck.author ):''
	ri.corners     =deck.hasOwnProperty('corners')?clamp(0,ln(deck.corners),47):1
	ri.script      =deck.hasOwnProperty('script' )?scripts.get(ls(deck.script)):''
	ri.card        =deck.hasOwnProperty('card'   )?clamp(0,ln(deck.card),Object.keys(cards).length-1):0
	ri.size        =deck.hasOwnProperty('size'   )?rclamp(rect(8,8),getpair(deck.size),rect(4096,4096)):rect(512,342)
	if(Object.keys(cards).length==0)cards.home=lmd(['name'].map(lms),[lms('home')])
	const root=lmenv();constants(root),primitives(root,ri)
	pushstate(root),issue(root,parse(DEFAULT_TRANSITIONS));while(running())runop();popstate()
	Object.values(defs   ).map(x=>{const v=prototype_read(x,ri)      ;dset(ri.contraptions,ifield(v,'name'),v)})
	Object.values(cards  ).map(x=>{const v=card_read     (x,ri,cards);dset(ri.cards       ,ifield(v,'name'),v)})
	Object.values(modules).map(x=>{const v=module_read   (x,ri)      ;dset(ri.modules     ,ifield(v,'name'),v)})
	ri.history=[ln(ifield(ifield(ri,'card'),'index'))]
	return ri
}
deck_write=(x,html)=>{
	if(!deck_is(x))return '';let deck=x,scripts=lmd(),si=0,sci=0,r=(html?'<meta charset=\\"UTF-8\\"><body><script language=\\"decker\\">\\n':'')+'{deck}\\nversion:1\\n'
	const esc_write=(id,x)=>{
		let c='\\0',lc=c,r='';for(let z=0;z<x.length;z++){
			lc=c,c=x[z],r+=c=='{'?'{l}': c=='}'?'{r}': c==':'&&id?'{c}': c=='/'&&lc=='<'?'{s}': c
		}return r
	}
	const script_ref=(base,x,suff)=>{
		if(ls(x)=='undefined')throw new Error('welp')
		for(let z=0;z<scripts.v.length;z++)if(match(scripts.v[z],x))return scripts.k[z]
		const k=lms(base?\`\${base}.\${sci}\${suff||''}\`:\`\${sci}\${suff||''}\`);sci++;dset(scripts,k,x);return k
	}
	const write_scripts=_=>{while(si<scripts.v.length)r+=\`\\n{script:\${esc_write(1,ls(scripts.k[si]))}}\\n\${esc_write(0,ls(scripts.v[si++]))}\\n{end}\\n\`}
	const write_line=(s,k,p,f)=>{const v=s[k];if(p(v))r+=\`\${k}:\${fjson(f(v))}\\n\`}
	const write_key =(s,k,p,f)=>{const v=dget(s,lms(k));if(p(v))r+=\`\${k}:\${fjson(f(v))}\\n\`}
	const write_dict=(k,x,f)=>r+=\`\${count(x)?k:''}\${x.k.map((k,i)=>\`\${esc_write(1,ls(k))}:\${flove(f(x.v[i]))}\\n\`).join('')}\`
	const pp=patterns_write(x.patterns),pa=anims_write(x.patterns),da=dyad.parse(lms('%j'),lms(DEFAULT_ANIMS))
	let f=deck.fonts;const strip_fnt=n=>{const k=lms(n),v=dget(f,k);if(font_write(v)==FONTS[n])f=dyad.drop(lml([k]),f)}
	strip_fnt('body'),strip_fnt('menu'),strip_fnt('mono')
	write_line(x,'card'      ,x=>1                                  ,lmn                       )
	write_line(x,'size'      ,x=>1                                  ,lmpair                    )
	write_line(x,'locked'    ,x=>x                                  ,lmn                       )
	write_line(x,'script'    ,x=>x.length                           ,x=>script_ref(null,lms(x)))
	write_line(x,'name'      ,x=>x.length                           ,lms                       )
	write_line(x,'author'    ,x=>x.length                           ,lms                       )
	write_line(x,'corners'   ,x=>x!=1                               ,lmn                       )
	write_line(x,'patterns'  ,x=>pp!=DEFAULT_PATTERNS               ,x=>lms(pp)                )
	write_line(x,'animations',x=>!match(pa,da)                      ,x=>pa                     )
	write_scripts()
	write_dict('\\n{fonts}\\n',f,x=>lms(font_write(x)))
	write_dict('\\n{sounds}\\n',deck.sounds,x=>lms(sound_write(x)))
	deck.cards.v.map(c=>{
		const data=card_write(c),wids=dget(data,lms('widgets')),base=ls(dget(data,lms('name')));sci=0
		r+=\`\\n{card:\${esc_write(1,base)}}\\n\`
		write_key(data,'image' ,x=>x ,x=>x                 )
		write_key(data,'script',count,x=>script_ref(base,x))
		wids.v.map(wid=>{const k=lms('script'),v=dget(wid,k);if(v)dset(wid,k,script_ref(base,v))})
		write_dict('{widgets}\\n',wids,x=>x)
		write_scripts()
	})
	deck.modules.v.map(m=>{
		const data=module_write(m)
		r+=\`\\n{module:\${esc_write(1,ls(dget(data,lms('name'))))}}\\n\`
		write_key(data,'description',x=>x,x=>x)
		write_key(data,'version'    ,x=>x,x=>x)
		write_dict('{data}\\n',dget(data,lms('data')),x=>x)
		r+=\`{script}\\n\${esc_write(0,ls(ifield(m,'script')))}\\n{end}\\n\`
	})
	deck.contraptions.v.map(def=>{
		const data=prototype_write(def),wids=dget(data,lms('widgets')),base=ls(dget(data,lms('name')));sci=0
		r+=\`\\n{contraption:\${esc_write(1,base)}}\\n\`
		write_key(data,'size'       ,x=>1       ,x=>x)
		write_key(data,'resizable'  ,x=>x&&lb(x),x=>x)
		write_key(data,'margin'     ,x=>1       ,x=>x)
		write_key(data,'description',x=>x       ,x=>x)
		write_key(data,'version'    ,x=>x       ,x=>x)
		write_key(data,'image'      ,x=>x       ,x=>x)
		write_key(data,'script'     ,x=>count(x),x=>script_ref(base,x,'p'))
		write_key(data,'template'   ,x=>count(x),x=>x)
		write_key(data,'attributes' ,x=>count(x),x=>x)
		wids.v.map(wid=>{const k=lms('script'),v=dget(wid,k);if(v)dset(wid,k,script_ref(base,v,'p'))})
		write_dict('{widgets}\\n',wids,x=>x)
		write_scripts()
	})
	return r+'\\n'+(html?'<\\/script>\\nRuntime stub is NYI.':'')
}

n_go=([x,t,delay],deck)=>{
	let r=null, i=deck.card
	if(lin(x))r=clamp(0,ln(x),count(deck.cards)-1)
	else if(card_is(x)){const i=dvix(deck.cards,x);if(i>=0)r=i}
	else{
		x=ls(x);if(deck.history.length>1&&x=='Back'){
			deck.history.pop();const ix=last(deck.history);
			if(ix>=0&&ix<count(deck.cards)){go_notify(deck,ix,t,x,delay),deck.card=ix;return lmn(deck.card)}
		}
		else if(x=='First')r=0
		else if(x=='Last' )r=count(deck.cards)-1
		else if(x=='Prev' )r=mod(i-1,count(deck.cards))
		else if(x=='Next' )r=mod(i+1,count(deck.cards))
		else{const ix=dkix(deck.cards,lms(x));if(ix>=0)r=ix}
	}if(r!=null){go_notify(deck,r,t,x,delay),deck.card=r;if(i!=r)deck.history.push(r)}else{go_notify(deck,-1,t,x,delay)}return lmn(deck.card)
}
n_sleep=([z])=>{if(lis(z)&&ls(z)=='play'){sleep_play=1}else{sleep_frames=max(1,ln(z))};return z}
n_transition=(f,deck)=>{const t=deck.transit;if(lion(f))dset(t,lms(f.n),f);return t}

const ext={}
const ext_constants={}
constants=env=>{
	env.local('sys'    ,interface_system)
	env.local('app'    ,interface_app)
	env.local('bits'   ,interface_bits)
	env.local('rtext'  ,interface_rtext)
	env.local('pointer',pointer)
	env.local('pi'   ,lmn(3.141592653589793))
	env.local('e'    ,lmn(2.718281828459045))
	env.local('colors',lmd(
		'white|yellow|orange|red|magenta|purple|blue|cyan|green|darkgreen|brown|tan|lightgray|mediumgray|darkgray|black'.split('|').map(lms),
		range(16).map(x=>lmn(x+32))
	))
	Object.keys(ext_constants).map(key=>env.local(key,ext_constants[key]))
}
primitives=(env,deck)=>{
	env.local('show'      ,lmnat(n_show    ))
	env.local('print'     ,lmnat(n_print   ))
	env.local('panic'     ,lmnat(n_panic   ))
	env.local('play'      ,lmnat(n_play    ))
	env.local('go'        ,lmnat(([x,t,d])=>n_go([x,t,d],deck)))
	env.local('transition',lmnat(([f])=>n_transition(f,deck)))
	env.local('brush'     ,lmnat(x=>n_brush(x,deck)))
	env.local('sleep'     ,lmnat(n_sleep   ))
	env.local('eval'      ,lmnat(n_eval    ))
	env.local('random'    ,lmnat(n_random  ))
	env.local('array'     ,lmnat(n_array   ))
	env.local('image'     ,lmnat(n_image   ))
	env.local('sound'     ,lmnat(n_sound   ))
	env.local('keystore'  ,lmnat(n_keystore))
	env.local('newdeck'   ,lmnat(([x])=>deck_read(lis(x)?ls(x):'')))
	env.local('readcsv'   ,lmnat(n_readcsv ))
	env.local('writecsv'  ,lmnat(n_writecsv))
	env.local('readxml'   ,lmnat(n_readxml ))
	env.local('writexml'  ,lmnat(n_writexml))
	env.local('alert'     ,lmnat(n_alert   ))
	env.local('read'      ,lmnat(n_open    ))
	env.local('write'     ,lmnat(n_save    ))
}
let in_attr=0
fire_attr_sync=(target,name,a)=>{
	if(in_attr>=2)return NIL;in_attr++;const bf=frame;
	const root=lmenv();primitives(root,target.deck),constants(root)
	root.local('me',target),root.local('card',target),root.local('deck',target.deck),root.local('patterns',target.deck.patterns)
	const b=lmblk();target.widgets.v.map((v,i)=>{blk_lit(b,v),blk_loc(b,target.widgets.k[i]),blk_op(b,op.DROP)})
	try{blk_cat(b,parse(target.def.script)),blk_op(b,op.DROP)}catch(e){}
	blk_get(b,lms(name)),blk_lit(b,lml(a?[a]:[])),blk_op(b,op.CALL)
	pushstate(root),issue(root,b);let q=ATTR_QUOTA;while(running()&&q>0)runop(),q--;const r=running()?NIL:arg();popstate();frame=bf;return in_attr--,r
}
parent_deck=x=>deck_is(x)?x: card_is(x)||prototype_is(x)?x.deck: parent_deck(x.card)
event_invoke=(target,name,arg,hunk,nodiscard)=>{
	const scopes=lmd([ZERO],[parse(DEFAULT_HANDLERS)]); let deck=null
	const ancestors_record=(target,src)=>{try{dset(scopes,target,parse(ls(ifield(src,'script'))))}catch(e){dset(scopes,target,lmblk())}}
	const ancestors_inner=target=>{
		if(deck_is(target)){deck=target;return}
		if(contraption_is(target)){deck=target.card.deck}
		else if(card_is(target)||prototype_is(target)){deck=target.deck}
		else{ancestors_inner(target.card)}
		ancestors_record(target,contraption_is(target)?ifield(target,'def'):target)
	}
	const ancestors_outer=target=>{
		if(deck_is(target)){deck=target}
		else if(widget_is(target)){ancestors_outer(target.card)}
		else{ancestors_outer(target.deck)}
		ancestors_record(target,target)
	}
	(prototype_is(target)||prototype_is(target.card)||contraption_is(target.card))?ancestors_inner(target):ancestors_outer(target)
	const bind=(b,n,v)=>{blk_lit(b,v),blk_loc(b,n),blk_op(b,op.DROP)}
	const func=(b,n,v)=>{blk_lit(b,lmon(n,[],blk_end(v))),blk_op(b,op.BIND),blk_op(b,op.DROP),name=n,arg=lml([])}
	let core=null
	for(let z=scopes.v.length-1;z>=0;z--){
		let t=scopes.k[z], b=lmblk(), sname='!widget_scope'
		if(lin(t))sname='!default_handlers'
		if(deck_is(t)){
			t.modules.v.map((v,i)=>bind(b,t.modules.k[i],ifield(v,'value')))
			t.cards  .v.map((v,i)=>bind(b,t.cards  .k[i],v                ))
			sname='!deck_scope'
		}
		if(card_is(t)||prototype_is(t)||(contraption_is(t)&&target!=t)){
			bind(b,lms('card'),t)
			t.widgets.v.map((v,i)=>bind(b,t.widgets.k[i],v))
			sname='!card_scope'
		}
		blk_cat(b,scopes.v[z]),blk_op(b,op.DROP)
		if(!core&&hunk){func(b,'!hunk',hunk)}
		else if(core){func(b,sname,core)}
		blk_get(b,lms(name)),blk_lit(b,arg),blk_op(b,op.CALL);if(!hunk&&!nodiscard)blk_op(b,op.DROP);core=b
	}
	const r=lmblk();bind(r,lms('me'),proxy_is(target)?ivalue(target,'card'):target)
	bind(r,lms('deck'),deck),bind(r,lms('patterns'),deck.patterns)
	return blk_cat(r,core),r
}
fire_async=(target,name,arg,hunk,nest)=>{
	const root=lmenv();primitives(root,parent_deck(target)),constants(root)
	if(nest)pushstate(root),pending_popstate=1;issue(root,event_invoke(target,name,arg,hunk,0))
}
fire_event_async=(target,name,x)=>fire_async(target,name,lml([x]),null,1)
fire_hunk_async=(target,hunk)=>fire_async(target,null,lml([]),hunk,1)
n_event=(self,args)=>{
	const root=lmenv();primitives(root,parent_deck(self)),constants(root)
	const b=lmblk();blk_op(b,op.DROP),blk_cat(b,event_invoke(self,ls(args[0]),lml(args.slice(1)),null,1))
	return issue(root,b),NIL
}
readgif=(data,hint)=>{
	const gray=hint=='gray'||hint=='gray_frames', frames=hint=='frames'||hint=='gray_frames'
	let i=0;const ub=_=>data[i++]||0, s=_=>ub()|(ub()<<8), struct=(f,d)=>lmd(['frames','delays'].map(lms),[lml(f),lml(d)])
	function readcolors(r,packed){const c=1<<((packed&0x07)+1);for(let z=0;z<c;z++)r[z]=readcolor(ub(),ub(),ub(),gray);return r}
	if(ub()!=71||ub()!=73||ub()!=70)return frames?struct([],[]):image_make(rect());i+=3;const r_frames=[],r_delays=[],r_disposal=[],r_dict=lmd()
	const w=s(),h=s(),gpal=new Uint8Array(256),packed=ub(),back=ub();ub()
	let hastrans=0,trans=255,delay=0,dispose=0,r=image_make(rect(w,h));if(packed&0x80)readcolors(gpal,packed)
	while(i<data.length){
		const type=ub()
		if(type==0x3B)break // end
		if(type==0x21){ // text, gce, comment, app...?
			if((0xFF&ub())==0xF9){
				ub();const packed=ub();delay=s()
				const tindex=ub();ub();dispose=(packed>>2)&7
				if(packed&1){hastrans=1,trans=tindex}else{hastrans=0}
			}else{while(1){const s=ub();if(!s)break;i+=s}}
		}
		if(type==0x2C){ // image descriptor
			const xo=s(),yo=s(),iw=s(),ih=s(),packed=ub(),local=packed&0x80
			const lpal=new Uint8Array(gpal);if(local)readcolors(lpal,packed);if(hastrans)lpal[trans]=gray?255:0
			const min_code=ub(),src=new Uint8Array(iw*ih*2);let si=0
			while(1){const s=ub();if(!s)break;for(let z=0;z<s;z++)src[si++]=ub()}
			const dst=decode_lzw(src,iw*ih,min_code)
			for(let y=0;y<ih;y++)for(let x=0;x<iw;x++)if(xo+x>=0&&yo+y>=0&&xo+x<w&&yo+y<h&&(!hastrans||dst[x+y*iw]!=trans))r.pix[(xo+x)+(yo+y)*w]=lpal[dst[x+y*iw]]
			r_frames.push(image_copy(r)),r_delays.push(lmn(delay)),r_disposal.push(dispose);if(!frames)break
			if(dispose==2){r.pix.fill(hastrans?0:lpal[back])} // dispose to background
			if(dispose==3){let i=r_frames.length-2;while(i&&r_disposal[i]>=2)i--;for(let z=0;z<r.pix.length;z++)r.pix[z]=r_frames[i].pix[z];}// dispose to previous
		}
	}return frames?struct(r_frames,r_delays): r_frames.length?r_frames[0]: image_make(rect())
}
`;function ns(e,t){let n=t;if(e[n]!=='"')throw new Error(`Expected string literal at ${t}`);n+=1;let A="";for(;n<e.length;){const i=e[n];if(i==="\\"){A+=e[n+1]??"",n+=2;continue}if(i==='"')return[A,n+1];A+=i,n+=1}throw new Error("Unterminated string literal while reading Decker built-ins")}function jn(e){const t=`${e}:`,n=Rt.indexOf(t);if(n<0)throw new Error(`Could not find built-in Decker font "${e}"`);let A=n+t.length;for(;A<Rt.length&&/\s/.test(Rt[A]);)A+=1;let i="";for(;A<Rt.length;){const[r,o]=ns(Rt,A);for(i+=r,A=o;A<Rt.length&&/\s/.test(Rt[A]);)A+=1;if(Rt[A]!=="+")break;for(A+=1;A<Rt.length&&/\s/.test(Rt[A]);)A+=1}return i}const As={body:jn("body"),menu:jn("menu"),mono:jn("mono")};function is(e){if(typeof atob=="function")return new Uint8Array(Array.from(atob(e),n=>n.charCodeAt(0)));const t=Buffer.from(e,"base64");return new Uint8Array(t.buffer,t.byteOffset,t.byteLength)}function rs(e,t){if(!t.startsWith(`%%${e}`))throw new Error(`Invalid ${e} data block`);return is(t.slice(6))}function os(e,t="unnamed"){if(!e.startsWith("%%FNT0")&&!e.startsWith("%%FNT1"))throw new Error("Expected a %%FNT0 or %%FNT1 Decker font record");const n=e.slice(2,6),A=rs("FNT",e);if(A.length<3)throw new Error("Decker font payload is too short");const i=Math.max(1,A[0]),r=Math.max(1,A[1]),o=A[2],s=Math.ceil(i/8)*r,l=new Uint8Array(256),a=new Uint8Array(256*s);if(n==="FNT0"){let c=3;for(let d=32;d<128&&!(c>=A.length);d++){const u=A[c++];if(c+s>A.length)break;l[d]=u,a.set(A.subarray(c,c+s),d*s),c+=s}}else{let c=3;for(;c+1<A.length;){const d=A[c++],u=A[c++];if(c+s>A.length)break;l[d]=u,a.set(A.subarray(c,c+s),d*s),c+=s}}return{name:t,maxWidth:i,glyphHeight:r,spacing:o,glyphStride:s,glyphWidths:l,glyphData:a,sourceFormat:n}}const MA=new Map;let ci=!1;function Jn(e){MA.set(e,os(As[e],e))}function CA(){ci||(Jn("body"),Jn("menu"),Jn("mono"),ci=!0)}function ss(e="body"){return CA(),MA.get(String(e))??null}function WA(e="body"){const t=ss(e);if(!t)throw new Error(`Unknown font: ${String(e)}`);return t}function ls(e){return CA(),MA.has(e)}function gt(e){return WA(e).glyphHeight}function kn(e,t={}){const n=gt(e),A=t.lineHeight??n+(t.lineSpacing??0),i=Math.max(1,Math.floor(A));return{glyphHeight:n,lineHeight:i,glyphOffsetY:Math.max(0,i-n)}}function Q(e,t="body",n=0){const A=es(WA(t),e).width;if(!e||n===0)return A;let i=0;for(let r=0;r<e.length;r++)e[r]!==`
`&&(i+=1);return A+i*n}function as(e,t,n,A,i,r,o,s,l,a,c,d,u){if(!l)return;const f=WA(d),q=IA(u),p=0;let m=a;for(let g=0;g<l.length;g++){const w=l[g];if(w===`
`){m=a,c+=f.glyphHeight;continue}const S=hr(f,w),y=Q(w,d,p)-f.spacing,v=f.glyphHeight;if(S>=0&&y>0){const C=m|0,W=c|0,b=Math.max(0,i-C),k=Math.max(0,r-W),V=Math.min(y,o-C),z=Math.min(v,s-W);for(let E=k;E<z;E++){const K=W+E;if(K<0)continue;const D=(K-A)*t;for(let H=b;H<V;H++)if(ts(f,S,H,E)){const N=C+H;N>=0&&(e[D+(N-n)]=q)}}}m+=Q(w,d,p)}}function cs(){return CA(),Promise.resolve()}function Yn(e,t,n="body",A=0){if(!e)return[""];const i=[],r=e.split(`
`);for(const o of r){if(!o.trim()){i.push("");continue}const s=o.split(" ");let l="";for(const a of s){const c=l?`${l} ${a}`:a;Q(c,n,A)>t&&l?(i.push(l),l=a):l=c}l&&i.push(l)}return i}function fn(e,t){return{v:t,h:e}}function F(e,t,n,A){return{top:e,left:t,bottom:n,right:A}}function tt(e){return{top:e.top,left:e.left,bottom:e.bottom,right:e.right}}const we=8,SA=10,OA=33,ZA=30,Re=0,ln=1,LA=2,Nn=3,DA=4,U={thePort:null,white:new Uint8Array([0,0,0,0,0,0,0,0]),black:new Uint8Array([255,255,255,255,255,255,255,255]),gray:new Uint8Array([170,85,170,85,170,85,170,85]),ltGray:new Uint8Array([136,34,136,34,136,34,136,34]),dkGray:new Uint8Array([119,221,119,221,119,221,119,221]),arrow:{data:new Uint16Array([0,16384,24576,28672,30720,31744,32256,32512,32640,31744,27648,17920,1536,768,768,0]),mask:new Uint16Array([49152,57344,61440,63488,64512,65024,65280,65408,65472,65504,65024,61184,52992,34688,1920,896]),hotSpot:{v:1,h:1}},screenBits:{baseAddr:new Uint8Array(0),rowBytes:0,bounds:F(0,0,0,0)},randSeed:1,wideOpen:{rgn:{rgnSize:10,rgnBBox:F(-32767,-32767,32767,32767)}},rgnBuf:null,rgnIndex:0,rgnMax:0,thePoly:null,polyMax:0,_fontMeasure:null,_fontDraw:null,_screen:null};function ds(e,t){U._fontMeasure=e,U._fontDraw=t}function us(e,t){const n=BigInt(e)*BigInt(t),A=0xffffffffn;return{hiLong:Number(n>>32n&A)|0,loLong:Number(n&A)|0}}function di(e,t){const n=BigInt(e|0)*BigInt(t|0)>>16n;return Number(n)|0}function xr(e,t){return t===0?e>=0?2147483647:-2147483648:(e<<16)/t|0}function fs(e,t,n){const A=e[n&7],i=7-(t&7);return A>>i&1}function ps(e,t,n){switch(e){case 0:return t;case 1:return t|n;case 2:return t^n;case 3:return t&~n;case 4:return 1-t;case 5:return 1-t|n;case 6:return 1-t^n;case 7:return 1-t&~n;case 8:return t;case 9:return t|n;case 10:return t^n;case 11:return t&~n;case 12:return 1-t;case 13:return 1-t|n;case 14:return 1-t^n;case 15:return 1-t&~n;default:return t}}function qs(e,t,n,A,i){const r=i.visRgn.rgn.rgnBBox;e=Math.max(e,r.left),t=Math.max(t,r.top),n=Math.min(n,r.right),A=Math.min(A,r.bottom);const o=i.clipRgn.rgn.rgnBBox;e=Math.max(e,o.left),t=Math.max(t,o.top),n=Math.min(n,o.right),A=Math.min(A,o.bottom),e=Math.max(e,i.portRect.left),t=Math.max(t,i.portRect.top),n=Math.min(n,i.portRect.right),A=Math.min(A,i.portRect.bottom);const s=i.portBits.bounds;return e=Math.max(e,s.left),t=Math.max(t,s.top),n=Math.min(n,s.right),A=Math.min(A,s.bottom),e>=n||t>=A?null:{left:e,top:t,right:n,bottom:A}}function ui(e,t,n){const A=e.rgn;if(n<A.rgnBBox.top||n>=A.rgnBBox.bottom||t<A.rgnBBox.left||t>=A.rgnBBox.right)return!1;if(!A.scanlines||A.scanlines.length===0)return!0;for(const i of A.scanlines)if(i.y===n){let r=!1;for(const o of i.xs){if(o>t)break;r=!r}return r}return!1}function ht(e,t,n,A,i,r,o){const s=qs(e,t,n,A,o);if(!s)return;const l=o.portBits.baseAddr,a=o.portBits.rowBytes,c=o.portBits.bounds,d=o.visRgn.rgn.scanlines&&o.visRgn.rgn.scanlines.length>0||o.clipRgn.rgn.scanlines&&o.clipRgn.rgn.scanlines.length>0;for(let u=s.top;u<s.bottom;u++){const f=(u-c.top)*a;for(let q=s.left;q<s.right;q++){if(d&&(!ui(o.visRgn,q,u)||!ui(o.clipRgn,q,u)))continue;const p=fs(i,q,u),m=f+(q-c.left);l[m]=ps(r,p,l[m])&1}}}function Tt(e,t,n,A,i,r){ht(e,n,t,n+1,A,i,r)}function In(e,t){return e.v>=t.top&&e.v<t.bottom&&e.h>=t.left&&e.h<t.right}function ms(e,t,n){e.top+=n,e.left+=t,e.bottom-=n,e.right-=t}function hs(e,t,n){n.top=Math.min(e.top,t.top),n.left=Math.min(e.left,t.left),n.bottom=Math.max(e.bottom,t.bottom),n.right=Math.max(e.right,t.right)}function an(e,t,n){const A=U.thePort;if(A){if(A.grafProcs&&A.grafProcs.rectProc){n&&(A.fillPat=new Uint8Array(n)),A.grafProcs.rectProc(e,t);return}gs(e,t,n)}}function gs(e,t,n){const A=U.thePort;if(A&&!(t.top>=t.bottom||t.left>=t.right))switch(e){case Re:{const i=Math.max(1,A.pnSize.h),r=Math.max(1,A.pnSize.v);ht(t.left,t.top,t.right,t.top+r,A.pnPat,A.pnMode,A),ht(t.left,t.bottom-r,t.right,t.bottom,A.pnPat,A.pnMode,A),ht(t.left,t.top+r,t.left+i,t.bottom-r,A.pnPat,A.pnMode,A),ht(t.right-i,t.top+r,t.right,t.bottom-r,A.pnPat,A.pnMode,A);break}case ln:ht(t.left,t.top,t.right,t.bottom,A.pnPat,A.pnMode,A);break;case LA:ht(t.left,t.top,t.right,t.bottom,A.bkPat,we,A);break;case Nn:ht(t.left,t.top,t.right,t.bottom,U.black,SA,A);break;case DA:{const i=n??A.fillPat;ht(t.left,t.top,t.right,t.bottom,i,we,A);break}}}function xs(e){an(Re,e)}function fe(e){an(ln,e)}function ys(e){an(LA,e)}function Vs(e){an(Nn,e)}function yr(e,t){an(DA,e,t)}function Ke(e){return{rgn:{rgnSize:10,rgnBBox:tt(e)}}}function Qn(e){return new Uint8Array(e)}function fi(e){U._screen=e,U.screenBits={baseAddr:e.pixels,rowBytes:e.width,bounds:F(0,0,e.height,e.width)},U.randSeed=1,U.thePort=null}function bs(e){const t=tt(U.screenBits.bounds);e.visRgn=Ke(t),e.clipRgn=Ke(F(-32767,-32767,32767,32767)),ws(e)}function ws(e){U.thePort=e,e.device=0,e.portBits={baseAddr:U.screenBits.baseAddr,rowBytes:U.screenBits.rowBytes,bounds:tt(U.screenBits.bounds)},e.portRect=tt(U.screenBits.bounds),e.visRgn?(e.visRgn.rgn.rgnBBox=tt(e.portRect),e.visRgn.rgn.scanlines=void 0):e.visRgn=Ke(e.portRect),e.clipRgn?(e.clipRgn.rgn.rgnBBox=tt(U.wideOpen.rgn.rgnBBox),e.clipRgn.rgn.scanlines=void 0):e.clipRgn=Ke(tt(U.wideOpen.rgn.rgnBBox)),e.bkPat=Qn(U.white),e.fillPat=Qn(U.black),e.pnLoc={v:0,h:0},e.pnSize={v:1,h:1},e.pnMode=we,e.pnPat=Qn(U.black),e.pnVis=0,e.txFont=0,e.txFace=0,e.txMode=1,e.txSize=0,e.spExtra=0,e.fgColor=OA,e.bkColor=ZA,e.colrBit=0,e.patStretch=0,e.picSave=null,e.rgnSave=null,e.polySave=null,e.grafProcs=null}function jt(e){U.thePort=e}function Vr(){return U.thePort}function br(e){const t=U.thePort;t&&(t.clipRgn={rgn:{rgnSize:e.rgn.rgnSize,rgnBBox:tt(e.rgn.rgnBBox),scanlines:e.rgn.scanlines?e.rgn.scanlines.map(n=>({y:n.y,xs:[...n.xs]})):void 0}})}function vs(e){const t=U.thePort;if(!t)return;const n=t.clipRgn.rgn;e.rgn.rgnSize=n.rgnSize,e.rgn.rgnBBox=tt(n.rgnBBox),e.rgn.scanlines=n.scanlines?n.scanlines.map(A=>({y:A.y,xs:[...A.xs]})):void 0}function ks(e){const t=U.thePort;t&&(t.clipRgn={rgn:{rgnSize:10,rgnBBox:tt(e),scanlines:void 0}})}function Is(){const e=U._screen?F(0,0,U._screen.height,U._screen.width):F(0,0,0,0),t=U._screen?U._screen.pixels:new Uint8Array(0),n=U._screen?U._screen.width:0;return{device:0,portBits:{baseAddr:t,rowBytes:n,bounds:tt(e)},portRect:tt(e),visRgn:Ke(tt(e)),clipRgn:Ke(F(-32767,-32767,32767,32767)),bkPat:new Uint8Array(8),fillPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnLoc:{v:0,h:0},pnSize:{v:1,h:1},pnMode:we,pnPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnVis:0,txFont:0,txFace:0,txMode:1,txSize:0,spExtra:0,fgColor:OA,bkColor:ZA,colrBit:0,patStretch:0,picSave:null,rgnSave:null,polySave:null,grafProcs:null}}U.arrow;function KA(e,t){const n=U.thePort;n&&(n.pnSize.h=e,n.pnSize.v=t)}function zs(e){const t=U.thePort;t&&(t.pnMode=e)}function Dt(e){const t=U.thePort;t&&(t.pnPat=new Uint8Array(e))}function At(){const e=U.thePort;e&&(e.pnSize={h:1,v:1},e.pnMode=8,e.pnPat=new Uint8Array(U.black))}function at(e,t){const n=U.thePort;n&&(n.pnLoc.h=e,n.pnLoc.v=t)}function Ms(e,t){const n=U.thePort;if(n){if(n.grafProcs&&n.grafProcs.lineProc){n.pnLoc.h,n.pnLoc.v,n.grafProcs.lineProc({h:e,v:t}),n.pnLoc.h=e,n.pnLoc.v=t;return}Cs(n,{h:e,v:t})}}function Ae(e,t){const n=U.thePort;n&&Ms(n.pnLoc.h+e,n.pnLoc.v+t)}function Cs(e,t){if(e.pnVis<0){e.pnLoc.h=t.h,e.pnLoc.v=t.v;return}const n=e.pnLoc.h,A=e.pnLoc.v,i=t.h,r=t.v,o=Math.max(1,e.pnSize.h),s=Math.max(1,e.pnSize.v);Ws(n,A,i,r,o,s,e),e.pnLoc.h=i,e.pnLoc.v=r}function Ws(e,t,n,A,i,r,o){const s=Math.abs(n-e),l=Math.abs(A-t),a=e<n?1:-1,c=t<A?1:-1;let d=s-l,u=e,f=t;const q=(p,m)=>{ht(p,m,p+i,m+r,o.pnPat,o.pnMode,o)};for(;q(u,f),!(u===n&&f===A);){const p=2*d;p>-l&&(d-=l,u+=a),p<s&&(d+=s,f+=c)}}function zn(e){const t=U.thePort;t&&(t.txFont=e)}function Mn(e){const t=U.thePort;t&&(t.txFace=e)}function Ft(e){Ss(e,0,e.length)}function Ss(e,t,n){const A=U.thePort;if(!A)return;let i;typeof e=="string"?i=e.slice(t,t+n):i=String.fromCharCode(...e.slice(t,t+n)),U._fontDraw&&U._fontDraw(i,A.pnLoc.h,A.pnLoc.v,A);const r=Os(i);A.pnLoc.h+=r}function Os(e,t){return U._fontMeasure?U._fontMeasure(e):e.length*6}const Zs=[0,1144,2289,3435,4583,5734,6888,8047,9210,10380,11556,12739,13930,15130,16340,17560,18792,20036,21294,22566,23853,25157,26478,27818,29179,30560,31964,33392,34846,36327,37837,39378,40951,42560,44205,45889,47615,49385,51202,53070,54991,56970,59009,61113,63287,0,2329,4743,7249,9855,12567,15394,18346,21433,24667,28059,31625,35381,39343,43534,47976,52694,57719,63086,3297,9470,16124,23321,31135,39655,48987,59258,5091,17750,31943,47976,706,21723,46178,9473,43993,20561,7560,9459,33709,28183,19701,5309,41687,18992,65535],Ls=[1,1,2,2,2,2,2,2,2,3,3,3,3,4,4,4,5,5,6,7,8,9,11,14,19,28,57,255];function pi(e){let t=e%180;t<0&&(t+=180),t>90&&(t=180-t);let n=128,A=0;t<45||(A=1,t>=64&&(A=Ls[t-64]));const r=Zs[t]&65535;let o=n<<24|A<<16|r;o=o|0;const s=(o&2147483648)!==0;return o&=2147483647,s&&(o=-o|0),o}const pe=32768;function qi(e,t,n,A){A.ovalTop=e.top,A.ovalBot=e.bottom,t<0&&(t=0),n<0&&(n=0);const i=e.right-e.left,r=e.bottom-e.top;t>i&&(t=i),n>r&&(n=r);const o=e.left+e.right>>1;let s=o<<16|0,l=o<<16|0;l=l+pe|0,A.leftEdge=s,A.rightEdge=l,A.oneHalf=pe,A.ovalY=1-n,A.rsqysq=2*n-1,A.squareHi=0,A.squareLo=0;const a=xr(n,t),{hiLong:c,loLong:d}=us(a,a);A.oddNumHi=c,A.oddNumLo=d;const u=d>>>0>=2147483648?1:0;A.oddBumpLo=d<<1|0,A.oddBumpHi=(c<<1)+u|0}function mi(e,t){if(t<e.ovalTop||t>=e.ovalBot)return;const n=e.ovalY;e.ovalY+=2;let A=e.rsqysq,i=e.squareHi,r=e.squareLo,o=e.oddNumHi,s=e.oddNumLo;const l=e.oddBumpHi,a=e.oddBumpLo;let c=e.leftEdge,d=e.rightEdge;for(;i<A;){d=d+pe|0,c=c-pe|0;const f=r+s|0,q=(r>>>0)+(s>>>0)>4294967295?1:0;r=f,i=i+o+q|0;const p=s+a|0,m=(s>>>0)+(a>>>0)>4294967295?1:0;s=p,o=o+l+m|0}for(;i>A;){d=d-pe|0,c=c+pe|0,s=s-a|0;const f=s>>>0<a>>>0?1:0;o=o-l-f|0,r=r-s|0;const q=r>>>0<s>>>0?1:0;i=i-o-q|0}const u=n+1;A=A-4*u|0,e.rsqysq=A,e.squareHi=i,e.squareLo=r,e.oddNumHi=o,e.oddNumLo=s,e.leftEdge=c,e.rightEdge=d}function Ct(e){return e>>16}function BA(e,t,n,A,i,r,o,s,l,a){const c=e,d={ovalTop:0,ovalBot:0,ovalY:0,rsqysq:0,squareHi:0,squareLo:0,oddNumHi:0,oddNumLo:0,oddBumpHi:0,oddBumpLo:0,leftEdge:0,rightEdge:0,oneHalf:pe};qi(e,t,n,d);let u=null;if(A){const K=Math.max(1,a.pnSize.h),D=Math.max(1,a.pnSize.v),H=e.top+D,N=e.bottom-D,X=e.left+K,L=e.right-K;X<L&&H<N&&(u={ovalTop:H,ovalBot:N,ovalY:0,rsqysq:0,squareHi:0,squareLo:0,oddNumHi:0,oddNumLo:0,oddBumpHi:0,oddBumpLo:0,leftEdge:0,rightEdge:0,oneHalf:pe},qi({top:H,left:X,bottom:N,right:L},Math.max(0,t-2*K),Math.max(0,n-2*D),u))}const f=e.right-e.left,q=e.bottom-e.top,p=e.top+e.bottom>>1,m=e.left+e.right>>1,g=d.ovalTop+(n>>1),w=e.bottom-e.top-n+g;let S=0,y=0,v=0,C=0,W=0,b=0,k=!1;const V=i<360;if(V){const K=xr(f,q);v=di(pi(r),K),C=di(pi(o),K);const D=m<<16|0,H=q>>1;S=D-v*H|0,y=D-C*H|0,W=r<180?r-90:-(270-r),b=o<180?o-90:-(270-o),i>180?k=!1:i<180?k=W>=0&&b>=0:k=r===90}let z=d.ovalTop;const E=d.ovalBot;for(;z<E;){if((z<g||z>=w)&&(mi(d,z),u&&mi(u,z)),V&&z===p){if(W=-W,b=-b,k=!1,!(i>180)){if(i<180){if(W>=0&&b>=0)break}else if(r===270)break}const L=S;S=y,y=L;const R=v;v=C,C=R}if(z<c.top||k){S=S+v|0,y=y+C|0,z++;continue}let D=Ct(d.leftEdge),H=Ct(d.rightEdge);const N=Ct(S),X=Ct(y);if(V&&(W<0&&N>D&&(D=N),b<0&&X<H&&(H=X)),V){if(u){let L=Ct(u.leftEdge),R=Ct(u.rightEdge);b<0&&X<L&&(L=X),W<0&&N>R&&(R=N),D<H?(Tt(D,L,z,s,l,a),Tt(R,H,z,s,l,a)):W<0&&b<0&&i>180&&(L===H&&Tt(Ct(u.leftEdge),L,z,s,l,a),Tt(Ct(d.leftEdge),L,z,s,l,a),Tt(R,Ct(d.rightEdge),z,s,l,a))}else if(D<H)Tt(D,H,z,s,l,a);else if(W<0&&b<0&&i>180){const L=Ct(d.leftEdge),R=Ct(d.rightEdge);Tt(L,H,z,s,l,a),Tt(D,R,z,s,l,a)}}else if(!u)D<H&&Tt(D,H,z,s,l,a);else{const L=Ct(u.leftEdge),R=Ct(u.rightEdge);D<L&&Tt(D,L,z,s,l,a),R<H&&Tt(R,H,z,s,l,a)}S=S+v|0,y=y+C|0,z++}}function Ds(e,t,n,A){const i=e.right-e.left,r=e.bottom-e.top;i<=0||r<=0||BA(e,i,r,!1,360,0,360,t,n,A)}function Ks(e,t){const n=e.right-e.left,A=e.bottom-e.top;n<=0||A<=0||BA(e,n,A,!0,360,0,360,t.pnPat,t.pnMode,t)}function HA(e,t,n,A,i,r,o){const s=e.right-e.left,l=e.bottom-e.top;if(s<=0||l<=0)return;let a=t%360;a<0&&(a+=360);let c=(a+n)%360;c<0&&(c+=360),BA(e,s,l,A,n,a,c,i,r,o)}function wr(e,t,n){switch(e){case ln:return{pat:t.pnPat,mode:t.pnMode};case LA:return{pat:t.bkPat,mode:we};case Nn:return{pat:U.black,mode:SA};case DA:return{pat:t.fillPat,mode:we};default:return{pat:t.pnPat,mode:t.pnMode}}}function vr(e,t,n,A,i){const r=U.thePort;if(r){if(r.grafProcs&&r.grafProcs.arcProc){r.grafProcs.arcProc(e,t,n,A);return}Bs(e,t,n,A)}}function Bs(e,t,n,A,i){const r=U.thePort;if(!r)return;const o=e===Re,{pat:s,mode:l}=wr(e,r);if(A===0)return;let a=n,c=A;if(c<0&&(a+=c,c=-c),c>=360){o?Ks(t,r):Ds(t,s,l,r);return}HA(t,a,c,o,s,l,r)}function Hs(e,t,n){vr(Re,e,t,n)}function Es(e,t,n){vr(ln,e,t,n)}function Ps(e,t,n,A){const i=Math.max(1,A.pnSize.h),r=Math.max(1,A.pnSize.v);Math.min(t/2,(e.right-e.left)/2),Math.min(n/2,(e.bottom-e.top)/2);const o=[{r:{top:e.top,left:e.left,bottom:e.top+n,right:e.left+t},start:180,arc:90},{r:{top:e.top,left:e.right-t,bottom:e.top+n,right:e.right},start:270,arc:90},{r:{top:e.bottom-n,left:e.right-t,bottom:e.bottom,right:e.right},start:0,arc:90},{r:{top:e.bottom-n,left:e.left,bottom:e.bottom,right:e.left+t},start:90,arc:90}];for(const a of o)HA(a.r,a.start,a.arc,!0,A.pnPat,A.pnMode,A);const s=Math.floor(t/2),l=Math.floor(n/2);ht(e.left+s,e.top,e.right-s,e.top+r,A.pnPat,A.pnMode,A),ht(e.left+s,e.bottom-r,e.right-s,e.bottom,A.pnPat,A.pnMode,A),ht(e.left,e.top+l,e.left+i,e.bottom-l,A.pnPat,A.pnMode,A),ht(e.right-i,e.top+l,e.right,e.bottom-l,A.pnPat,A.pnMode,A)}function Ts(e,t,n,A,i,r){const o=Math.floor(t/2),s=Math.floor(n/2),l=[{r:{top:e.top,left:e.left,bottom:e.top+n,right:e.left+t},start:180,arc:90},{r:{top:e.top,left:e.right-t,bottom:e.top+n,right:e.right},start:270,arc:90},{r:{top:e.bottom-n,left:e.right-t,bottom:e.bottom,right:e.right},start:0,arc:90},{r:{top:e.bottom-n,left:e.left,bottom:e.bottom,right:e.left+t},start:90,arc:90}];for(const a of l)HA(a.r,a.start,a.arc,!1,A,i,r);ht(e.left,e.top+s,e.right,e.bottom-s,A,i,r),ht(e.left+o,e.top,e.right-o,e.top+s,A,i,r),ht(e.left+o,e.bottom-s,e.right-o,e.bottom,A,i,r)}function EA(e,t,n,A,i){const r=U.thePort;if(r){if(r.grafProcs&&r.grafProcs.rRectProc){r.grafProcs.rRectProc(e,t,n,A);return}Rs(e,t,n,A)}}function Rs(e,t,n,A,i){const r=U.thePort;if(!r)return;if(e===Re){Ps(t,n,A,r);return}const{pat:o,mode:s}=wr(e,r);Ts(t,n,A,o,s,r)}function hi(e,t,n){EA(Re,e,t,n)}function Gs(e,t,n){EA(ln,e,t,n)}function gi(e,t,n){EA(Nn,e,t,n)}function Ys(e){if(!e.scanlines||e.scanlines.length===0)return;let t=32767,n=-32767,A=32767,i=-32767;for(const r of e.scanlines)r.xs.length!==0&&(r.y<t&&(t=r.y),r.y+1>n&&(n=r.y+1),r.xs[0]<A&&(A=r.xs[0]),r.xs[r.xs.length-1]>i&&(i=r.xs[r.xs.length-1]));e.rgnBBox={top:t,left:A,bottom:n,right:i}}function Je(){return{rgn:{rgnSize:10,rgnBBox:{top:0,left:0,bottom:0,right:0}}}}function oA(e,t){t.rgn={rgnSize:e.rgn.rgnSize,rgnBBox:tt(e.rgn.rgnBBox),scanlines:e.rgn.scanlines?e.rgn.scanlines.map(n=>({y:n.y,xs:[...n.xs]})):void 0}}function Ns(e,t,n,A,i){e.rgn.rgnSize=10,e.rgn.rgnBBox={top:n,left:t,bottom:i,right:A},e.rgn.scanlines=void 0}function kr(e,t){Ns(e,t.left,t.top,t.right,t.bottom)}function xi(e){const t=new Map;if(e.rgn.scanlines&&e.rgn.scanlines.length>0)for(const n of e.rgn.scanlines)t.set(n.y,[...n.xs]);else{const{top:n,left:A,bottom:i,right:r}=e.rgn.rgnBBox;for(let o=n;o<i;o++)t.set(o,[A,r])}return t}function Us(e){const t=[];e.forEach((r,o)=>{const s=[...r].sort((l,a)=>l-a);s.length>0&&s.length%2===0&&t.push({y:o,xs:s})}),t.sort((r,o)=>r.y-o.y);const n={rgn:{rgnSize:10,rgnBBox:{top:0,left:0,bottom:0,right:0}}};n.rgn.scanlines=t,Ys(n.rgn);const A=n.rgn.rgnBBox;let i=!0;for(const r of t)if(r.xs.length!==2||r.xs[0]!==A.left||r.xs[1]!==A.right){i=!1;break}return i&&t.length===A.bottom-A.top&&(n.rgn.scanlines=void 0),n}function Fs(e,t){function n(o){const s=[];for(let l=0;l+1<o.length;l+=2)s.push([o[l],o[l+1]]);return s}const A=n(e),i=n(t),r=[];for(const[o,s]of A)for(const[l,a]of i){const c=Math.max(o,l),d=Math.min(s,a);c<d&&(r.push(c),r.push(d))}return r.sort((o,s)=>o-s)}function Xs(e,t,n){const A=xi(e),i=xi(t),r=new Map;A.forEach((s,l)=>{const a=i.get(l);if(!a)return;const c=Fs(s,a);c.length>0&&r.set(l,c)});const o=Us(r);oA(o,n)}const Ir=new Map,zr=new Map;function js(e,t){const n=gt(e),A={id:t,name:e,lineHeight:n};Ir.set(t,A),zr.set(e,t)}async function Js(){await cs();for(const[e,t]of[["body",3],["menu",4],["mono",5]])js(e,t)}function Cn(e){return zr.get(e)??0}function yi(e){const t=Ir.get(e);return(t==null?void 0:t.name)??null}function Kt(e,t,n=0){return Q(e,t,n)}function Qs(e){e(A=>{const i=U.thePort,r=i?yi(i.txFont)??"body":"body";return Q(A,r)},(A,i,r,o)=>{var S,y;const s=yi(o.txFont)??"body",{baseAddr:l,rowBytes:a,bounds:c}=o.portBits,d=(S=o.clipRgn)==null?void 0:S.rgn.rgnBBox,u=(y=o.visRgn)==null?void 0:y.rgn.rgnBBox,f=o.portRect,q=Math.max((d==null?void 0:d.left)??c.left,(u==null?void 0:u.left)??c.left,f.left,c.left),p=Math.max((d==null?void 0:d.top)??c.top,(u==null?void 0:u.top)??c.top,f.top,c.top),m=Math.min((d==null?void 0:d.right)??c.right,(u==null?void 0:u.right)??c.right,f.right,c.right),g=Math.min((d==null?void 0:d.bottom)??c.bottom,(u==null?void 0:u.bottom)??c.bottom,f.bottom,c.bottom),w=IA(o.txColor??1);as(l,a,c.left,c.top,q,p,m,g,A,i,r,s,w)})}const ue={black:new Uint8Array([255,255,255,255,255,255,255,255]),white:new Uint8Array([0,0,0,0,0,0,0,0]),checkers:new Uint8Array([170,85,170,85,170,85,170,85]),darkCheckers:new Uint8Array([85,170,85,170,85,170,85,170]),stripes:new Uint8Array([255,0,255,0,255,0,255,0]),gray25:new Uint8Array([136,34,136,34,136,34,136,34]),gray50:new Uint8Array([170,85,170,85,170,85,170,85]),gray75:new Uint8Array([119,221,119,221,119,221,119,221])};function PA(e){return ue[e]}const _s=ue.black,$s=ue.white;function Ge(e){return e!==oe?_s:$s}function Ht(e,t){const n=Vr();jt(e);const A=t();return n&&jt(n),A}function cn(e){var r,o;const t=(r=e.visRgn)==null?void 0:r.rgn.rgnBBox,n=(o=e.clipRgn)==null?void 0:o.rgn.rgnBBox,A=e.portRect,i=e.portBits.bounds;return{left:Math.max((t==null?void 0:t.left)??i.left,(n==null?void 0:n.left)??i.left,A.left,i.left),top:Math.max((t==null?void 0:t.top)??i.top,(n==null?void 0:n.top)??i.top,A.top,i.top),right:Math.min((t==null?void 0:t.right)??i.right,(n==null?void 0:n.right)??i.right,A.right,i.right),bottom:Math.min((t==null?void 0:t.bottom)??i.bottom,(n==null?void 0:n.bottom)??i.bottom,A.bottom,i.bottom)}}function sA(e,t,n,A){const i=cn(e);if(t<i.left||t>=i.right||n<i.top||n>=i.bottom)return;const{baseAddr:r,rowBytes:o,bounds:s}=e.portBits;r[(n-s.top)*o+(t-s.left)]=Bt(A)}function TA(e,t,n,A,i,r){if(A<=0||i<=0)return;const o=cn(e),{baseAddr:s,rowBytes:l,bounds:a}=e.portBits,c=Bt(r),d=Math.max(t,o.left),u=Math.max(n,o.top),f=Math.min(t+A,o.right),q=Math.min(n+i,o.bottom);for(let p=u;p<q;p++){const m=(p-a.top)*l;s.fill(c,m+(d-a.left),m+(f-a.left))}}function Mr(e,t,n,A,i,r){if(A<=0||i<=0)return;const o=cn(e),{baseAddr:s,rowBytes:l,bounds:a}=e.portBits,c=Bt(r),d=Math.max(t,o.left),u=Math.max(n,o.top),f=Math.min(t+A,o.right),q=Math.min(n+i,o.bottom);for(let p=u;p<q;p++){const m=(p-a.top)*l;for(let g=d;g<f;g++)s[m+(g-a.left)]=mr(c,g,p)}}function lA(e,t,n,A,i){TA(e,t,n,A,1,i)}function aA(e,t,n,A,i){if(A<=0)return;const r=cn(e);if(t<r.left||t>=r.right)return;const{baseAddr:o,rowBytes:s,bounds:l}=e.portBits,a=Bt(i),c=Math.max(n,r.top),d=Math.min(n+A,r.bottom);for(let u=c;u<d;u++)o[(u-l.top)*s+(t-l.left)]=a}function tl(e,t,n,A,i,r){lA(e,t,n,A,r),lA(e,t,n+i-1,A,r),aA(e,t,n,i,r),aA(e,t+A-1,n,i,r)}function Cr(e,t,n,A,i,r){const o=Bt(i);for(let s=0;s<A;s+=2)r?sA(e,t,n+s,o):sA(e,t+s,n,o)}function cA(e,t,n,A,i,r,o,s,l){const a=Math.max(1,Math.min(Math.floor(r/2),Math.floor(A/2))),c=Math.max(1,Math.min(Math.floor(o/2),Math.floor(i/2)));for(let d=0;d<i;d++){let u=0;if(d<c){const p=(c-d-.5)/c;u=Math.max(0,Math.ceil(a-a*Math.sqrt(Math.max(0,1-p*p))))}else if(d>=i-c){const p=(d-(i-c)+.5)/c;u=Math.max(0,Math.ceil(a-a*Math.sqrt(Math.max(0,1-p*p))))}const f=t+u,q=A-u*2;q<=0||(l?Mr(e,f,n+d,q,1,s):TA(e,f,n+d,q,1,s))}}function el(e,t,n,A,i,r,o,s,l){cA(e,t,n,A,i,r,o,l,!1);const a=A-s*2,c=i-s*2;a<=0||c<=0||cA(e,t+s,n+s,a,c,Math.max(1,r-s*2),Math.max(1,o-s*2),oe,!1)}const Wn=[{start:270,arc:90},{start:0,arc:90},{start:90,arc:90},{start:180,arc:90}];function ot(e,t,n,A,i,r){const o=Bt(r);if(o>st){Jt()==="colors"?TA(e,t,n,A,i,o):Mr(e,t,n,A,i,o);return}Ht(e,()=>{const s=F(n,t,n+i,t+A);o!==oe?(At(),fe(s)):ys(s)})}function Xt(e,t,n,A,i,r=st){const o=Qt(r);if(Jt()==="colors"&&o>st){tl(e,t,n,A,i,o);return}Ht(e,()=>{At(),Dt(Ge(o)),xs(F(n,t,n+i,t+A)),At()})}function Wr(e,t,n,A,i){Ht(e,()=>{At(),Vs(F(n,t,n+i,t+A))})}function ie(e,t,n,A,i,r){Ht(e,()=>{const o=typeof r=="string"?PA(r):r;yr(F(n,t,n+i,t+A),o)})}function nl(e,t,n,A,i,r,o,s=st){const l=Bt(s);if(l>st){cA(e,t,n,A,i,r,o,l,Jt()!=="colors");return}Ht(e,()=>{At(),Dt(Ge(l));const a=Math.floor(r/2),c=Math.floor(o/2),d=[F(n,t,n+o,t+r),F(n,t+A-r,n+o,t+A),F(n+i-o,t+A-r,n+i,t+A),F(n+i-o,t,n+i,t+r)];for(let u=0;u<4;u++)Es(d[u],Wn[u].start,Wn[u].arc);fe(F(n+c,t,n+i-c,t+A)),fe(F(n,t+a,n+c,t+A-a)),fe(F(n+i-c,t+a,n+i,t+A-a)),At()})}function Vi(e,t,n,A,i,r,o,s=1,l=st){const a=Qt(l);if(Jt()==="colors"&&a>st){el(e,t,n,A,i,r,o,s,a);return}Ht(e,()=>{At(),KA(s,s),Dt(Ge(a));const c=Math.floor(r/2),d=Math.floor(o/2),u=Math.max(1,s),f=u,q=[F(n,t,n+o,t+r),F(n,t+A-r,n+o,t+A),F(n+i-o,t+A-r,n+i,t+A),F(n+i-o,t,n+i,t+r)];for(let p=0;p<4;p++)Hs(q[p],Wn[p].start,Wn[p].arc);fe(F(n,t+c,n+u,t+A-c)),fe(F(n+i-u,t+c,n+i,t+A-c)),fe(F(n+d,t,n+i-d,t+f)),fe(F(n+d,t+A-f,n+i-d,t+A)),At()})}function qt(e,t,n,A,i=st){const r=Qt(i);if(Jt()==="colors"&&r>st){lA(e,t,n,A,r);return}Ht(e,()=>{At(),Dt(Ge(r)),at(t,n),Ae(A-1,0),At()})}function ve(e,t,n,A,i=st){const r=Qt(i);if(Jt()==="colors"&&r>st){aA(e,t,n,A,r);return}Ht(e,()=>{At(),Dt(Ge(r)),at(t,n),Ae(0,A-1),At()})}function yt(e,t,n,A=st){const i=Qt(A);if(Jt()==="colors"&&i>st){sA(e,t,n,i);return}Ht(e,()=>{At(),Dt(Ge(i)),KA(1,1),at(t,n),Ae(0,0),At()})}function Sr(e,t,n,A,i=st){const r=Qt(i);if(Jt()==="colors"&&r>st){Cr(e,t,n,A,r,!1);return}const o=new Uint8Array([170,170,170,170,170,170,170,170]);Ht(e,()=>{At(),Dt(o),at(t,n),Ae(A-1,0),At()})}function Al(e,t,n,A,i=st){const r=Qt(i);if(Jt()==="colors"&&r>st){Cr(e,t,n,A,r,!0);return}const o=new Uint8Array([170,170,170,170,170,170,170,170]);Ht(e,()=>{At(),Dt(o),at(t,n),Ae(0,A-1),At()})}function Or(e,t,n,A,i,r="darkCheckers"){const o=typeof r=="string"?PA(r):r;Ht(e,()=>{At(),zs(SA),Dt(o),at(t,n),Ae(A-1,0),at(t,n+i-1),Ae(A-1,0),at(t,n+1),Ae(0,i-3),at(t+A-1,n+1),Ae(0,i-3),At()})}function il(e,t,n,A,i,r){const o=e.portBits.baseAddr,s=e.portBits.rowBytes,l=e.portBits.bounds,a=cn(e),c=Math.max(t,a.left),d=Math.max(n,a.top),u=Math.min(t+A,a.right),f=Math.min(n+i,a.bottom),q=PA(r);for(let p=d;p<f;p++){const m=(p-l.top)*s,g=q[p&7];for(let w=c;w<u;w++){const S=g>>7-(w&7)&1,y=m+(w-l.left);o[y]&=S}}}function Zr(e,t,n,A,i=st){const r=e,o=r.txColor??st;r.txColor=Qt(i),Ht(e,()=>{at(n,A),Ft(t)}),r.txColor=o}function Ie(e){var a,c;const t=(a=e.visRgn)==null?void 0:a.rgn.rgnBBox,n=(c=e.clipRgn)==null?void 0:c.rgn.rgnBBox,A=e.portRect,i=e.portBits.bounds,r=Math.max((t==null?void 0:t.left)??i.left,(n==null?void 0:n.left)??i.left,A.left,i.left),o=Math.max((t==null?void 0:t.top)??i.top,(n==null?void 0:n.top)??i.top,A.top,i.top),s=Math.min((t==null?void 0:t.right)??i.right,(n==null?void 0:n.right)??i.right,A.right,i.right),l=Math.min((t==null?void 0:t.bottom)??i.bottom,(n==null?void 0:n.bottom)??i.bottom,A.bottom,i.bottom);return{left:r,top:o,right:s,bottom:l}}function Vt(e,t,n,A){n=n|0,A=A|0;const{width:i,height:r,data:o,mask:s}=t,l=e.portBits.baseAddr,a=e.portBits.rowBytes,c=e.portBits.bounds,d=Ie(e);for(let u=0;u<r;u++){const f=A+u;if(f<d.top||f>=d.bottom)continue;const q=u*i,p=(f-c.top)*a;for(let m=0;m<i;m++){const g=n+m;if(g<d.left||g>=d.right)continue;const w=q+m;s&&!s[w]||(l[p+(g-c.left)]=Bt(o[w]))}}}function Lr(e,t,n,A){n=n|0,A=A|0;const{width:i,height:r,data:o,mask:s}=t,l=e.portBits.baseAddr,a=e.portBits.rowBytes,c=e.portBits.bounds,d=Ie(e);for(let u=0;u<r;u++){const f=A+u;if(f<d.top||f>=d.bottom)continue;const q=u*i,p=(f-c.top)*a;for(let m=0;m<i;m++){const g=n+m;if(g<d.left||g>=d.right)continue;const w=q+m;s&&!s[w]||(l[p+(g-c.left)]=o[w]^1)}}}function rl(e,t,n,A){n=n|0,A=A|0;const{width:i,height:r,mask:o}=t;if(!o)return Vt(e,t,n,A);const s=e.portBits.baseAddr,l=e.portBits.rowBytes,a=e.portBits.bounds,c=Ie(e);for(let d=0;d<r;d++){const u=A+d;if(u<c.top||u>=c.bottom)continue;const f=d*i,q=(u-a.top)*l;for(let p=0;p<i;p++){const m=n+p;if(m<c.left||m>=c.right)continue;const g=f+p;if(!o[g])continue;const w=m%4===0&&u%2===0||m%2===0&&m%4!==0&&u%2!==0?1:0;s[q+(m-a.left)]=w}}}function ol(e,t,n,A,i,r,o=1){if(i=i|0,r=r|0,!t.length||n<=0||A<=0)return;const s=e.portBits.baseAddr,l=e.portBits.rowBytes,a=e.portBits.bounds,c=Ie(e),d=Qt(o);for(let u=0;u<A;u++){const f=r+u;if(f<c.top||f>=c.bottom)continue;const q=u*n,p=(f-a.top)*l;for(let m=0;m<n;m++){const g=q+m;if(!t[g]||!(m===0||!t[g-1]||m===n-1||!t[g+1]||u===0||!t[(u-1)*n+m]||u===A-1||!t[(u+1)*n+m]))continue;const S=i+m;S<c.left||S>=c.right||(s[p+(S-a.left)]=d)}}}function sl(e,t,n,A){n=n|0,A=A|0;const{width:i,height:r,data:o}=t,s=e.portBits.baseAddr,l=e.portBits.rowBytes,a=e.portBits.bounds,c=Ie(e);for(let d=0;d<r;d++){const u=A+d;if(u<c.top||u>=c.bottom)continue;const f=(u-a.top)*l;for(let q=0;q<i;q++){const p=n+q;if(p<c.left||p>=c.right)continue;const m=(d*i+q)*4;if(o[m+3]<128)continue;const w=o[m],S=o[m+1],y=o[m+2];s[f+(p-a.left)]=Jt()==="colors"?Jo(w,S,y):qr(w,S,y,p,u)}}}function ll(e,t,n,A,i,r){const o=e.portBits.baseAddr,s=e.portBits.rowBytes,l=e.portBits.bounds,a=Ie(e),c=Math.max(0,a.left-i),d=Math.max(0,a.top-r),u=Math.min(n,a.right-i),f=Math.min(A,a.bottom-r);if(c>=u||d>=f)return;const q=u-c;for(let p=d;p<f;p++)o.set(t.subarray(p*n+c,p*n+c+q),(r+p-l.top)*s+(i+c-l.left))}function bi(e,t,n,A,i,r){n=n|0,A=A|0,i=i|0,r=r|0;const{width:o,height:s,data:l}=t,a=e.portBits.baseAddr,c=e.portBits.rowBytes,d=e.portBits.bounds,u=Ie(e),f=Math.max(n,u.left),q=Math.max(A,u.top),p=Math.min(n+i,u.right),m=Math.min(A+r,u.bottom);for(let g=q;g<m;g++){const w=(g-d.top)*c,S=((g-A)%s+s)%s;for(let y=f;y<p;y++){const v=((y-n)%o+o)%o;a[w+(y-d.left)]=Bt(l[S*o+v])}}}const al=530;function mt(e=""){return{value:e,cursorPos:e.length,selectionStart:0,selectionEnd:0,focused:!1,_lastEditTime:Date.now()}}function Ut(e){return e.selectionStart!==e.selectionEnd}function dA(e){return e.selectionStart<=e.selectionEnd?[e.selectionStart,e.selectionEnd]:[e.selectionEnd,e.selectionStart]}function St(e){e.selectionStart=e.cursorPos,e.selectionEnd=e.cursorPos}function pn(e){if(!Ut(e))return!1;const[t,n]=dA(e);return e.value=e.value.slice(0,t)+e.value.slice(n),e.cursorPos=t,St(e),!0}function cl(e){e.selectionStart=0,e.selectionEnd=e.value.length,e.cursorPos=e.value.length}function RA(e){e._lastEditTime=Date.now()}function GA(e,t,n="body"){if(t<=0)return 0;for(let A=1;A<=e.length;A++){const i=Q(e.substring(0,A),n),r=A>0?Q(e.substring(0,A-1),n):0,o=r+(i-r)/2;if(t<o)return A-1}return e.length}function dl(e,t){let n=t,A=t;for(;n>0&&e[n-1]!==" ";)n--;for(;A<e.length&&e[A]!==" ";)A++;return[n,A]}function Sn(e,t,n,A=!1,i=!1,r=!1){const o=i||r;if(RA(e),o&&(t==="a"||t==="A"))return cl(e),!0;if(o&&(t==="c"||t==="C"))return!1;if(o&&(t==="x"||t==="X"))return pn(e);if(t==="Backspace")return Ut(e)?pn(e):e.cursorPos>0?(e.value=e.value.slice(0,e.cursorPos-1)+e.value.slice(e.cursorPos),e.cursorPos--,St(e),!0):!1;if(t==="Delete")return Ut(e)?pn(e):e.cursorPos<e.value.length?(e.value=e.value.slice(0,e.cursorPos)+e.value.slice(e.cursorPos+1),St(e),!0):!1;if(t==="ArrowLeft"){if(o)return A?(e.selectionEnd=0,e.cursorPos=0):(e.cursorPos=0,St(e)),!0;if(A)return Ut(e)||(e.selectionStart=e.cursorPos,e.selectionEnd=e.cursorPos),e.cursorPos>0&&(e.cursorPos--,e.selectionEnd=e.cursorPos),!0;if(Ut(e)){const[s]=dA(e);return e.cursorPos=s,St(e),!0}return e.cursorPos>0?(e.cursorPos--,St(e),!0):!1}if(t==="ArrowRight"){if(o)return A?(e.selectionEnd=e.value.length,e.cursorPos=e.value.length):(e.cursorPos=e.value.length,St(e)),!0;if(A)return Ut(e)||(e.selectionStart=e.cursorPos,e.selectionEnd=e.cursorPos),e.cursorPos<e.value.length&&(e.cursorPos++,e.selectionEnd=e.cursorPos),!0;if(Ut(e)){const[,s]=dA(e);return e.cursorPos=s,St(e),!0}return e.cursorPos<e.value.length?(e.cursorPos++,St(e),!0):!1}return t==="Home"?A?(Ut(e)||(e.selectionStart=e.cursorPos,e.selectionEnd=e.cursorPos),e.cursorPos=0,e.selectionEnd=0,!0):(e.cursorPos=0,St(e),!0):t==="End"?A?(Ut(e)||(e.selectionStart=e.cursorPos,e.selectionEnd=e.cursorPos),e.cursorPos=e.value.length,e.selectionEnd=e.value.length,!0):(e.cursorPos=e.value.length,St(e),!0):t.length===1&&!o?(pn(e),e.value=e.value.slice(0,e.cursorPos)+t+e.value.slice(e.cursorPos),e.cursorPos++,St(e),!0):!1}function Dr(e,t,n=!1){RA(e);const A=t-3,i=GA(e.value,A);return n?(Ut(e)||(e.selectionStart=e.cursorPos),e.selectionEnd=i,e.cursorPos=i):(e.cursorPos=i,St(e)),!0}function Kr(e,t){RA(e);const n=t-3,A=GA(e.value,n),[i,r]=dl(e.value,A);return e.selectionStart=i,e.selectionEnd=r,e.cursorPos=r,!0}function Br(e,t){const n=t-3,A=GA(e.value,n);return A!==e.selectionEnd?(e.selectionEnd=A,e.cursorPos=A,!0):!1}const ul=al;function Hr(e,t,n="body",A=0,i=0,r){const o=kn(n,{lineHeight:r,lineSpacing:A}).lineHeight;return Yn(e,t,n,i).length*o}const qn="body";function fl(e,t,n,A,i,r=16){jt(e),e.txColor=h;const o=Je();vs(o),ks(F(A,n,A+r,n+i)),Xt(e,n,A,i,r,h),ot(e,n+1,A+1,i-2,r-2,B);const s=n+3,l=A+1,a=530,c=()=>(Date.now()-t._lastEditTime)%(a*2)<a,d=t.selectionStart!==t.selectionEnd,u=d?Math.min(t.selectionStart,t.selectionEnd):0,f=d?Math.max(t.selectionStart,t.selectionEnd):0;if(zn(Cn(qn)),Mn(0),t.focused&&d){const q=s+Kt(t.value.substring(0,u),qn),p=s+Kt(t.value.substring(0,f),qn);ot(e,q,A+2,p-q,r-4,h),u>0&&(at(s,l),Ft(t.value.substring(0,u))),e.txColor=B,at(q,l),Ft(t.value.substring(u,f)),e.txColor=h,f<t.value.length&&(at(p,l),Ft(t.value.substring(f)))}else{at(s,l),Ft(t.value);const q=t.cursorPos;if(t.focused&&c()){const p=t.value.substring(0,q),m=s+Kt(p,qn);ve(e,m,A+2,r-4,h)}}br(o)}function en(e,t,n,A,i){if(!t)return;const r=i.spacing??0,o=IA(i.color??h),s=kn(i.font,{lineHeight:i.lineHeight,lineSpacing:i.lineSpacing}),l=e,a=l.txColor??h;if(jt(e),zn(Cn(i.font)),Mn(0),l.txColor=o,r===0&&!t.includes(`
`)){at(n,A+s.glyphOffsetY),Ft(t),l.txColor=a;return}let c=n,d=A;for(let u=0;u<t.length;u++){const f=t[u];if(f===`
`){c=n,d+=s.lineHeight;continue}at(c,d+s.glyphOffsetY),Ft(f),c+=Kt(f,i.font,r)}l.txColor=a}function pl(e){const{baseAddr:t,rowBytes:n}=e.portBits,A=t.length/n|0,i=new zA(n,A);return i.pixels=t,i}const ql=15,ae=15,wi=12,Me=15;class nn{constructor(t,n,A,i,r,o=0,s=0,l,a,c,d,u=0,f=0,q=0,p,m,g){this.port=t,this._window=g??null,this.bc=pl(t),this.ox=n,this.oy=A,this.w=i,this.h=r,this.scrollOffsetY=o,this.scrollOffsetX=s,this._hitRegions=l,this._onStartResize=a,this._minSize=c,this._windowSize=d,this._contentTopInset=u,this._windowScrollY=f,this._windowScrollX=q,this._contentRectX=p??n,this._contentRectY=m??A}getWindow(){return this._window}get width(){return this.w}get height(){return this.h}get scrollY(){return this.scrollOffsetY}get scrollX(){return this.scrollOffsetX}release(){}tx(t){return this.ox+t-this.scrollOffsetX}ty(t){return this.oy+t-this.scrollOffsetY}screenX(t){return this._contentRectX+this.tx(t)}screenY(t){return this._contentRectY+this.ty(t)}setPixel(t,n,A=h){yt(this.port,this.tx(t),this.ty(n),A)}getPixel(t,n){const A=this.tx(t),i=this.ty(n),{baseAddr:r,rowBytes:o,bounds:s}=this.port.portBits,l=(i-s.top)*o+(A-s.left);return l<0||l>=r.length?0:r[l]}drawHLine(t,n,A,i=h){qt(this.port,this.tx(t),this.ty(n),A,i)}drawVLine(t,n,A,i=h){ve(this.port,this.tx(t),this.ty(n),A,i)}drawDottedHLine(t,n,A,i=h){Sr(this.port,this.tx(t),this.ty(n),A,i)}drawDottedVLine(t,n,A,i=h){Al(this.port,this.tx(t),this.ty(n),A,i)}drawRect(t,n,A,i,r=h){Xt(this.port,this.tx(t),this.ty(n),A,i,r)}fillRect(t,n,A,i,r=h){ot(this.port,this.tx(t),this.ty(n),A,i,r)}drawRoundRect(t,n,A,i,r,o=h){Vi(this.port,this.tx(t),this.ty(n),A,i,r,r,1,o)}fillRoundRect(t,n,A,i,r,o=h){nl(this.port,this.tx(t),this.ty(n),A,i,r,r,o)}frameRoundRect(t,n,A,i,r,o,s=1,l=h){Vi(this.port,this.tx(t),this.ty(n),A,i,r,o,s,l)}fillPattern(t,n,A,i,r){ie(this.port,this.tx(t),this.ty(n),A,i,r)}invertRect(t,n,A,i){Wr(this.port,this.tx(t),this.ty(n),A,i)}clear(t=B){ot(this.port,this.ox,this.oy,this.w,this.h,t)}blit(t,n,A){Vt(this.port,t,this.tx(n),this.ty(A))}blitInverted(t,n,A){Lr(this.port,t,this.tx(n),this.ty(A))}blitShadowOutline(t,n,A){rl(this.port,t,this.tx(n),this.ty(A))}blitImageData(t,n,A){sl(this.port,t,this.tx(n),this.ty(A))}blit1bitPixels(t,n,A,i,r){ll(this.port,t,n,A,this.tx(i),this.ty(r))}pushClip(t,n,A,i){this.bc.pushClip(this.screenX(t),this.screenY(n),A,i)}popClip(){this.bc.popClip()}drawText(t,n,A,i={}){const r=i.font??"body",o=kn(r,{lineHeight:i.lineHeight}),s=o.lineHeight,l=i.spacing??0,a=Kt(t,r,l),c=i.width??a,d=t?t.split(`
`).length:1;let u=n;i.align==="center"?u=n+Math.floor((c-a)/2):i.align==="right"&&(u=n+c-a),jt(this.port),i.bg!==null&&i.bg!==void 0&&c>0&&s>0&&this.fillRect(n,A,c,i.height??s*d,i.bg),en(this.port,t,this.tx(u),this.ty(A),{font:r,spacing:l,lineHeight:o.lineHeight,color:i.color??h})}drawButton(t){throw new Error("drawButton is removed. Use NewControl + DrawControls (see docs/control-manager-migration.md).")}drawTextInput(t,n,A,i,r,o){const s=r??16;if(fl(this.port,t,this.tx(n),this.ty(A),i,s),this._hitRegions&&(o!=null&&o.id)){const l=o.onChange;this.hitRegion(o.id,{x:n,y:A,w:i,h:s},{onMouseDown:a=>{Dr(t,a,!1),l==null||l()},onDoubleClick:a=>{Kr(t,a),l==null||l()},onDrag:a=>{const c=a-this.screenX(n);Br(t,c)&&(l==null||l())}})}}drawTextBlock(t){const n=t.font??"body",A=t.spacing??0,i=t.color??h,r=kn(n,{lineHeight:t.lineHeight,lineSpacing:t.lineSpacing}),o=r.lineHeight,s=Yn(t.text,t.maxWidth,n,A),l=s.length*o,a=this.scrollOffsetY,c=this.scrollOffsetY+this.h;for(let d=0;d<s.length;d++){const u=t.y+d*o;u+o<=a||u>=c||s[d]&&en(this.port,s[d],this.tx(t.x),this.ty(u),{font:n,spacing:A,lineHeight:r.lineHeight,color:i})}return l}measureTextBlock(t,n,A,i,r,o){return Hr(t,n,A,i,r,o)}scrollArea(t,n,A,i){var b,k;if(!this._hitRegions)return;const{contentHeight:r,scrollOffset:o,onScroll:s,resize:l}=A,a=!!l&&!!this._onStartResize,c=a?Me:0,d=Math.max(0,r-n.h),u=Math.min(o,d),f=ql,q=n.w-f,p=new nn(this.port,n.x,n.y,q,n.h,u,0,this._hitRegions,void 0,void 0,void 0,0,0,0,this._contentRectX+n.x,this._contentRectY+n.y);i(p),p.release();const m=n.x+q,g=n.y,w=n.h-c;ve(this.port,m,g,n.h,h);const S=g+ae,y=w-ae*2,v=m+7;ot(this.port,m+1,g,f-1,ae,B),qt(this.port,m,g+ae-1,f,h),yt(this.port,v,g+4,h),qt(this.port,v-1,g+5,3,h),qt(this.port,v-2,g+6,5,h),qt(this.port,v-3,g+7,7,h);const C=g+w-ae;ot(this.port,m+1,C,f-1,ae,B),qt(this.port,m,C,f,h),yt(this.port,v,C+10,h),qt(this.port,v-1,C+9,3,h),qt(this.port,v-2,C+8,5,h),qt(this.port,v-3,C+7,7,h);const W=r>n.h;if(W){ie(this.port,m+1,S,f-1,y,"gray50");const V=Math.max(12,Math.floor(n.h/r*y)),z=S+Math.floor(u/d*(y-V));ot(this.port,m+1,z,f-2,V,B),Xt(this.port,m+1,z,f-2,V,h)}else ot(this.port,m+1,S,f-1,y,B);if(a){const V=m,z=g+w;ot(this.port,V,z,Me,Me,B),qt(this.port,V,z,Me,h),Xt(this.port,V+2,z+6,7,7,h),ot(this.port,V+5,z+3,7,7,B),Xt(this.port,V+5,z+3,7,7,h)}if(this._hitRegions.add({id:`${t}-scroll-up`,x:this._contentRectX+m,y:this._contentRectY+g,w:f,h:ae,onMouseDown:()=>{s(Math.max(0,u-wi))}}),this._hitRegions.add({id:`${t}-scroll-down`,x:this._contentRectX+m,y:this._contentRectY+C,w:f,h:ae,onMouseDown:()=>{s(Math.min(d,u+wi))}}),W){const V=Math.max(12,Math.floor(n.h/r*y));this._hitRegions.add({id:`${t}-scroll-track`,x:this._contentRectX+m,y:this._contentRectY+S,w:f,h:y,onMouseDown:(z,E)=>{const K=E/Math.max(1,y-V);s(Math.max(0,Math.min(d,K*d)))}})}if(this._hitRegions.add({id:`${t}-scroll-wheel`,x:this._contentRectX+n.x,y:this._contentRectY+n.y,w:n.w,h:n.h,onScroll:V=>{s(Math.max(0,Math.min(d,u+V)))}}),a){const V=m,z=g+w,E=this._onStartResize,K=((b=this._windowSize)==null?void 0:b.width)??this.w+2,D=((k=this._windowSize)==null?void 0:k.height)??this.h+20;this._hitRegions.add({id:`${t}-grow-box`,x:this._contentRectX+V,y:this._contentRectY+z,w:Me,h:Me,onMouseDown:(H,N)=>{E(this._contentRectX+V+H,this._contentRectY+z+N,K,D)}})}}drawScrollableContent(t){if(this._contentTopInset<=0||!this._hitRegions)return;const n=this._contentTopInset,A=this.h-n;if(A<=0)return;const i=new nn(this.port,this.ox,this.oy+n,this.w,A,this._windowScrollY,this._windowScrollX,this._hitRegions,this._onStartResize,this._minSize,this._windowSize,0,this._windowScrollY,this._windowScrollX,this._contentRectX,this._contentRectY),r=F(n,0,n+A,this.w),o=this.port.clipRgn,s=Je();oA(o,s);const l=Je();kr(l,r);const a=Je();Xs(o,l,a),this.port.clipRgn=a,i.pushClip(0,0,this.w,A);try{t(i)}finally{i.popClip(),this.port.clipRgn=o,oA(s,o)}i.release()}hitRegion(t,n,A){this._hitRegions&&this._hitRegions.add({id:t,x:this._contentRectX+this.tx(n.x),y:this._contentRectY+this.ty(n.y),w:n.w,h:n.h,...A})}getBitCanvas(){return this.bc}}class _n{constructor(){this.hooks=[],this.hookIndex=0,this.effects=[],this.effectIndex=0,this._needsRender=!1,this._renderFn=null,this._rafId=null}resetForRender(){this.hookIndex=0,this.effectIndex=0}flushEffects(){for(let t=0;t<this.effects.length;t++){const n=this.effects[t];n&&n.__pendingRun&&(n.cleanup&&n.cleanup(),n.cleanup=n.fn()||void 0,n.__pendingRun=!1)}}destroy(){for(const t of this.effects)t!=null&&t.cleanup&&t.cleanup();this.effects=[],this.hooks=[],this._rafId!==null&&cancelAnimationFrame(this._rafId)}setRenderFunction(t){this._renderFn=t}scheduleRender(){this._needsRender||(this._needsRender=!0,this._rafId=requestAnimationFrame(()=>{var t;this._needsRender=!1,this._rafId=null,(t=this._renderFn)==null||t.call(this)}))}useState(t){const n=this.hookIndex++;this.hooks[n]===void 0&&(this.hooks[n]=t);const A=i=>{const r=this.hooks[n],o=typeof i=="function"?i(r):i;r!==o&&(this.hooks[n]=o,this.scheduleRender())};return[this.hooks[n],A]}useEffect(t,n){const A=this.effectIndex++,i=this.effects[A];i?(!n||!i.deps||!vi(i.deps,n))&&(this.effects[A]={...i,fn:t,deps:n,__pendingRun:!0}):this.effects[A]={fn:t,deps:n,__pendingRun:!0}}useMemo(t,n){const A=this.hookIndex++,i=this.hooks[A];if(!i||!vi(i.deps,n)){const r=t();return this.hooks[A]={value:r,deps:n},r}return i.value}useRef(t){const n=this.hookIndex++;return this.hooks[n]===void 0&&(this.hooks[n]={current:t}),this.hooks[n]}}function vi(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(!Object.is(e[n],t[n]))return!1;return!0}class ml{constructor(){this.apps=new Map,this.instances=new Map,this.multiApps=new Map,this.multiStates=new Map}register(t){this.apps.set(t.id,t)}get(t){return this.apps.get(t)}getAll(){return Array.from(this.apps.values())}createInstance(t,n,A={}){const i=this.apps.get(t);if(!i)return null;const r=new _n,o={appId:t,app:i,builder:r,props:A};return this.instances.set(n,o),i.onOpen&&i.onOpen(r,A),o}getInstance(t){return this.instances.get(t)}destroyInstance(t){const n=this.instances.get(t);n&&(n.app.onClose&&n.app.onClose(n.builder),n.builder.destroy(),this.instances.delete(t))}registerMultiWindow(t){this.multiApps.set(t.id,t)}startApp(t){const n=this.multiApps.get(t);if(!n)return null;if(this.multiStates.has(t))return this.multiStates.get(t).appBuilder;const A=new _n,i={app:n,appBuilder:A,windowBuilders:new Map};return this.multiStates.set(t,i),n.onStart&&n.onStart(A),A}stopApp(t){const n=this.multiStates.get(t);if(n){for(const[A,i]of n.windowBuilders)n.app.onWindowClose&&n.app.onWindowClose(n.appBuilder,i.builder,A),i.builder.destroy();n.windowBuilders.clear(),n.app.onStop&&n.app.onStop(n.appBuilder),n.appBuilder.destroy(),this.multiStates.delete(t)}}createWindowForApp(t,n,A={}){const i=this.multiStates.get(t);if(!i)return null;const r=i.windowBuilders.get(n);if(r)return{app:i.app,appBuilder:i.appBuilder,winBuilder:r.builder,props:r.props};const o=new _n;return i.windowBuilders.set(n,{builder:o,props:A}),i.app.onWindowOpen&&i.app.onWindowOpen(i.appBuilder,o,n,A),{app:i.app,appBuilder:i.appBuilder,winBuilder:o,props:A}}destroyWindowForApp(t,n){const A=this.multiStates.get(t);if(!A)return;const i=A.windowBuilders.get(n);i&&(A.app.onWindowClose&&A.app.onWindowClose(A.appBuilder,i.builder,n),i.builder.destroy(),A.windowBuilders.delete(n))}getMultiWindowInstance(t,n){const A=this.multiStates.get(t);if(!A)return null;const i=A.windowBuilders.get(n);return i?{app:A.app,appBuilder:A.appBuilder,winBuilder:i.builder,props:i.props}:null}getMultiWindowApp(t){return this.multiStates.get(t)}isMultiWindowApp(t){return this.multiApps.has(t)}}const be=class be{constructor(t){this.zoom=1,this.handlers=[],this.lastClickTime=0,this.lastClickX=0,this.lastClickY=0,this._moveRafPending=!1,this.canvasEl=t,this._bind()}setZoom(t){this.zoom=t}onEvent(t){this.handlers.push(t)}removeHandler(t){this.handlers=this.handlers.filter(n=>n!==t)}emit(t){for(const n of this.handlers)n(t)}toLocal(t){const n=this.canvasEl.getBoundingClientRect();return{x:Math.floor((t.clientX-n.left)/this.zoom),y:Math.floor((t.clientY-n.top)/this.zoom)}}_bind(){this.canvasEl.addEventListener("mousedown",t=>{const{x:n,y:A}=this.toLocal(t),i=Date.now(),r=Math.abs(n-this.lastClickX),o=Math.abs(A-this.lastClickY);i-this.lastClickTime<be.DOUBLE_CLICK_MS&&r<be.DOUBLE_CLICK_DIST&&o<be.DOUBLE_CLICK_DIST?(this.emit({type:"doubleClick",x:n,y:A,button:t.button}),this.lastClickTime=0):(this.emit({type:"mouseDown",x:n,y:A,button:t.button}),this.lastClickTime=i,this.lastClickX=n,this.lastClickY=A)}),this.canvasEl.addEventListener("mouseup",t=>{const{x:n,y:A}=this.toLocal(t);this.emit({type:"mouseUp",x:n,y:A,button:t.button})}),this.canvasEl.addEventListener("mousemove",t=>{this._moveRafPending||(this._moveRafPending=!0,requestAnimationFrame(()=>{this._moveRafPending=!1;const{x:n,y:A}=this.toLocal(t);this.emit({type:"mouseMove",x:n,y:A})}))}),this.canvasEl.addEventListener("wheel",t=>{t.preventDefault();const{x:n,y:A}=this.toLocal(t);this.emit({type:"scroll",x:n,y:A,deltaY:t.deltaY,deltaX:t.deltaX})},{passive:!1}),window.addEventListener("keydown",t=>{this.emit({type:"keyDown",key:t.key,code:t.code,shiftKey:t.shiftKey,metaKey:t.metaKey,ctrlKey:t.ctrlKey,altKey:t.altKey})}),window.addEventListener("keyup",t=>{this.emit({type:"keyUp",key:t.key,code:t.code,shiftKey:t.shiftKey,metaKey:t.metaKey,ctrlKey:t.ctrlKey,altKey:t.altKey})})}destroy(){}};be.DOUBLE_CLICK_MS=500,be.DOUBLE_CLICK_DIST=4;let uA=be;const pt=10,hl=11,On=20,Zn=21,Ln=22,Dn=23,Kn=129;function lt(e,t,n,A,i,r,o,s,l,a){const d={ref:{nextControl:null,contrlOwner:e,contrlRect:tt(t),contrlVis:A,contrlHilite:0,contrlValue:i,contrlMin:r,contrlMax:o,contrlDefProc:s,contrlData:null,contrlAction:null,contrlRfCon:l,contrlTitle:n}};return(a??e.controlList).push(d),d}const Oe=10,Ce=4,ki=3,Ii=16,ee=12,We=12,Bn=4,An=16;function Er(e,t,n){const A=t.ref,i=A.contrlRect,r=A.contrlData,o=(r==null?void 0:r.vertical)??i.bottom-i.top>=i.right-i.left,s=A.contrlValue,l=A.contrlMin,a=Math.max(A.contrlMax,l+1),c=An;if(o){const d=i.left,u=i.top,f=u+c,q=i.bottom-c,p=Math.max(0,q-f);if(n){const C=n("chrome/up");C&&Vt(e,C,d,u);const W=n("chrome/down");W&&Vt(e,W,d,q)}const m=(r==null?void 0:r.contentLength)??a-l,g=(r==null?void 0:r.pageSize)??p,w=m>0?Math.max(12,Math.floor(g/m*p)):p,S=Math.max(0,p-w),y=a-l,v=f+(y>0?Math.floor(s/y*S):0);if(p>0){if(n){const C=n("scrollbar-bg");C?bi(e,C,d,f,c,p):ie(e,d,f,c,p,"gray50")}else ie(e,d,f,c,p,"gray50");ve(e,d+c-1,f,p,h)}y>0&&w>0&&(ot(e,d+1,v,c-2,w,B),Xt(e,d+1,v,c-2,w,h)),ve(e,d,u,i.bottom-u,h)}else{const d=i.top,u=i.left,f=u+c,q=i.right-c,p=Math.max(0,q-f);if(n){const C=n("chrome/left");C&&Vt(e,C,u,d);const W=n("chrome/right");W&&Vt(e,W,q,d)}const m=(r==null?void 0:r.contentLength)??a-l,g=(r==null?void 0:r.pageSize)??p,w=m>0?Math.max(12,Math.floor(g/m*p)):p,S=Math.max(0,p-w),y=a-l,v=f+(y>0?Math.floor(s/y*S):0);if(p>0)if(n){const C=n("scrollbar-bg");C?bi(e,C,f,d+1,p,c-2):ie(e,f,d+1,p,c-2,"gray50")}else ie(e,f,d+1,p,c-2,"gray50");y>0&&w>0&&(ot(e,v,d+1,w,c-2,B),Xt(e,v,d+1,w,c-2,h)),qt(e,u,d,i.right-u,h)}}function gl(e,t,n){for(const A of e.scrollBarControls){const i=A.ref;i.contrlVis&&i.contrlDefProc===4&&Er(t,A,n)}}function fA(e,t){const n=Vr();jt(e);try{return t()}finally{n&&jt(n)}}function xl(e,t){const n=tt(t.boundsRect),{top:A,left:i,bottom:r,right:o}=n,s=t.default===!0,l=Oe,a=Oe;return fA(e,()=>{if(At(),s){const g=tt(n);ms(g,-Ce,-Ce),KA(ki,ki),Dt(ue.black),hi(g,Ii,Ii),At()}Dt(ue.black),hi(n,l,a);const c=1,d=gt("menu"),u=Q(t.label,"menu"),f=o-i-2,q=r-A-2,p=i+c+Math.floor((f-u)/2),m=A+c+Math.max(0,Math.floor((q-d)/2));if(t.active&&(Dt(ue.black),Gs(n,l,a)),t.active&&Dt(ue.white),at(p,m),Ft(t.label),At(),t.disabled){const g=F(A+c,i+c,r-c,o-c);yr(g,ue.gray50)}}),s?F(A-Ce,i-Ce,r+Ce,o+Ce):tt(n)}function yl(e,t){const{boundsRect:n,label:A,checked:i,disabled:r}=t,{top:o,left:s,bottom:l,right:a}=n,c=gt("body"),d=o+Math.max(0,Math.floor((c-ee)/2));if(Xt(e,s,d,ee,ee,h),ot(e,s+1,d+1,ee-2,ee-2,B),i)for(let f=2;f<ee-2;f++)yt(e,s+f,d+f,h),yt(e,s+ee-1-f,d+f,h);const u=s+ee+Bn;if(Zr(e,A,u,o,h),r){const f=ee+Bn+Q(A,"body");ie(e,s,o,f,c,"gray50")}return tt(n)}function Vl(e,t){const{boundsRect:n,label:A,selected:i,disabled:r}=t,{top:o,left:s}=n,l=gt("body"),a=o+Math.max(0,Math.floor((l-We)/2)),c=s+Math.floor(We/2),d=a+Math.floor(We/2),u=Math.floor(We/2);Cl(e,c,d,u),i&&Wl(e,c,d,u-3);const f=s+We+Bn;if(Zr(e,A,f,o,h),r){const q=We+Bn+Q(A,"body");ie(e,s,o,q,l,"gray50")}return tt(n)}function bl(e,t){const n=t.kind;return n==="checkbox"?yl(e,t):n==="radio"?Vl(e,t):xl(e,t)}function wl(e){const t=e.contrlDefProc,n=tt(e.contrlRect),A=e.contrlHilite===255;if(t===0){const i=e.contrlData;return{kind:"button",boundsRect:n,label:e.contrlTitle,disabled:A,active:e.contrlValue!==0,default:(i==null?void 0:i.default)===!0}}return t===1?{kind:"checkbox",boundsRect:n,label:e.contrlTitle,checked:e.contrlValue!==0,disabled:A}:t===2?{kind:"radio",boundsRect:n,label:e.contrlTitle,selected:e.contrlValue!==0,disabled:A}:{kind:"button",boundsRect:n,label:e.contrlTitle,disabled:A,active:!1}}function vl(e,t,n){const A=e.ref;if(!A.contrlVis)return;if(A.contrlDefProc===4){Er(t,e,n);return}const i=wl(A);bl(t,i)}function qe(e,t){for(const n of e.controlList)vl(n,t)}function Pr(e){return e===0?pt:e===1||e===2?hl:pt}function kl(e,t){const n=e,A=t.controlList;for(let i=A.length-1;i>=0;i--){const r=A[i],o=r.ref;if(!(!o.contrlVis||o.contrlHilite===255)&&In(n,o.contrlRect))return{theControl:r,partCode:Pr(o.contrlDefProc)}}return{theControl:null,partCode:0}}function Il(e,t){const{verticalRect:n,horizontalRect:A,scrollY:i,scrollX:r,contentHeight:o,contentWidth:s,scrollableBodyH:l,contentW:a,scheduleRender:c}=t;if(e.scrollBarControls.length=0,n){const d=Math.max(0,o-l),u=Math.max(0,n.bottom-n.top-2*An),f=lt(e,n,"",!0,i,0,d,4,0,e.scrollBarControls);f.ref.contrlData={vertical:!0,trackLengthPx:u,contentLength:o,pageSize:l},f.ref.contrlAction=(q,p)=>{p===On?(e.scrollY=Math.max(0,e.scrollY-12),c()):p===Zn?(e.scrollY=Math.min(d,e.scrollY+12),c()):p===Ln?(e.scrollY=Math.max(0,e.scrollY-l),c()):p===Dn&&(e.scrollY=Math.min(d,e.scrollY+l),c())}}if(A){const d=Math.max(0,s-a),u=Math.max(0,A.right-A.left-2*An),f=lt(e,A,"",!0,r,0,d,4,0,e.scrollBarControls);f.ref.contrlData={vertical:!1,trackLengthPx:u,contentLength:s,pageSize:a},f.ref.contrlAction=(q,p)=>{p===On?(e.scrollX=Math.max(0,e.scrollX-12),c()):p===Zn?(e.scrollX=Math.min(d,e.scrollX+12),c()):p===Ln?(e.scrollX=Math.max(0,e.scrollX-a),c()):p===Dn&&(e.scrollX=Math.min(d,e.scrollX+a),c())}}}function $n(e,t){const n=e.ref,A=n.contrlRect,i=n.contrlData,r=(i==null?void 0:i.vertical)??A.bottom-A.top>=A.right-A.left,o=An,s=n.contrlMin,l=Math.max(n.contrlMax,s+1),a=l-s;if(r){const c=A.top+o,d=A.bottom-o,u=Math.max(0,d-c),f=(i==null?void 0:i.contentLength)??a,q=(i==null?void 0:i.pageSize)??u,p=f>0?Math.max(12,Math.floor(q/f*u)):u,m=Math.max(0,u-p),g=t.v,w=m>0?(g-c)/m:0,S=s+w*a;return Math.max(s,Math.min(l,Math.round(S)))}else{const c=A.left+o,d=A.right-o,u=Math.max(0,d-c),f=(i==null?void 0:i.contentLength)??a,q=(i==null?void 0:i.pageSize)??u,p=f>0?Math.max(12,Math.floor(q/f*u)):u,m=Math.max(0,u-p),g=t.h,w=m>0?(g-c)/m:0,S=s+w*a;return Math.max(s,Math.min(l,Math.round(S)))}}function zl(e,t){const n=e.ref,A=n.contrlRect,i=n.contrlData,r=(i==null?void 0:i.vertical)??A.bottom-A.top>=A.right-A.left,o=An,s=n.contrlValue,l=n.contrlMin,c=Math.max(n.contrlMax,l+1)-l;if(r){const d=A.top;A.left;const u=d+o,f=A.bottom-o,q=Math.max(0,f-u),p=(i==null?void 0:i.contentLength)??c,m=(i==null?void 0:i.pageSize)??q,g=p>0?Math.max(12,Math.floor(m/p*q)):q,w=Math.max(0,q-g),S=u+(c>0?Math.floor(s/c*w):0),y=S+g,v=t.v;return v<u?On:v>=f?Zn:v<S?Ln:v<y?Kn:Dn}else{const d=A.left;A.top;const u=d+o,f=A.right-o,q=Math.max(0,f-u),p=(i==null?void 0:i.contentLength)??c,m=(i==null?void 0:i.pageSize)??q,g=p>0?Math.max(12,Math.floor(m/p*q)):q,w=Math.max(0,q-g),S=u+(c>0?Math.floor(s/c*w):0),y=S+g,v=t.h;return v<u?On:v>=f?Zn:v<S?Ln:v<y?Kn:Dn}}function Ml(e,t){var i;const n=e.scrollBarControls,A=t;for(let r=n.length-1;r>=0;r--){const o=n[r],s=o.ref;if(s.contrlVis&&In(A,s.contrlRect)){const l=s.contrlDefProc===4?zl(o,A):((i=s.contrlData)==null?void 0:i.partCode)??0;return{theControl:o,partCode:l}}}return{theControl:null,partCode:0}}function zi(e,t,n,A){var s;const i=e.ref,r=i.contrlRect,o=A??(i.contrlDefProc===4?((s=i.contrlData)==null?void 0:s.partCode)??0:Pr(i.contrlDefProc));return i.contrlDefProc===4&&A===Kn?(tA(e,$n(e,t)),{onTrackEnd(l){const a=$n(e,l);return tA(e,a),In(l,r)?Kn:0},onTrackMove(l){const a=$n(e,l);tA(e,a)}}):(i.contrlDefProc===0&&fA(n,()=>{At(),gi(r,Oe,Oe)}),l=>(i.contrlDefProc===0&&fA(n,()=>{At(),gi(r,Oe,Oe)}),In(l,r)?o:0))}function Mi(e){return e.ref.contrlValue}function tA(e,t){e.ref.contrlValue=t}function Cl(e,t,n,A){let i=A,r=0,o=1-A;for(Ci(e,t,n,i,r);i>r;)r++,o<=0?o+=2*r+1:(i--,o+=2*(r-i)+1),Ci(e,t,n,i,r)}function Ci(e,t,n,A,i){yt(e,t+A,n+i,h),yt(e,t-A,n+i,h),yt(e,t+A,n-i,h),yt(e,t-A,n-i,h),yt(e,t+i,n+A,h),yt(e,t-i,n+A,h),yt(e,t+i,n-A,h),yt(e,t-i,n-A,h)}function Wl(e,t,n,A){for(let i=-A;i<=A;i++){const r=Math.floor(Math.sqrt(A*A-i*i));for(let o=-r;o<=r;o++)yt(e,t+o,n+i,h)}}const Sl=0,Ol=1,Tr=3,Zl=4,Ll=5,Dl=6,Kl=7,Rr=9,Gr=10,Bl=11,xt=20,De=20,ut=16,ce=1,Gt=11,zt=11,Wt=16;class Ze{constructor(t){this.windows=[],this.dragging=null,this.resizing=null,this.zoomBoxPressed=null,this.closeBoxPressed=null,this._lastActiveId=null,this.config=t}static isChromeless(t){return t==="alert"||t==="desktop"||t==="presentation"}static isModal(t){return t==="alert"}openWindow(t){if(this.windows.find(o=>o.id===t.id)){this.bringToFront(t.id);return}const A=t.chromeless??Ze.isChromeless(t.windowKind),i=t.modal??Ze.isModal(t.windowKind),r={...t,scrollY:t.scrollY??0,scrollX:t.scrollX??0,active:!0,chromeless:A,modal:i,controlList:[],scrollBarControls:[],updateRect:null};r.userBounds={x:r.x,y:r.y,width:r.width,height:r.height},this._insertInLayerOrder(r),this._notifyActiveChange(()=>this._updateActive())}_insertInLayerOrder(t){if(t.windowKind==="desktop"){this.windows.unshift(t);return}if(t.windowKind==="alert"){this.windows.push(t);return}if(t.windowKind==="utility"){const A=this.windows.findIndex(i=>i.windowKind==="alert");A>=0?this.windows.splice(A,0,t):this.windows.push(t);return}const n=this.windows.findIndex(A=>A.windowKind==="utility"||A.windowKind==="alert");n>=0?this.windows.splice(n,0,t):this.windows.push(t)}closeWindow(t){const n=this.windows.find(A=>A.id===t);n&&(n.port=void 0,n.framePort=void 0),this.windows=this.windows.filter(A=>A.id!==t),this._notifyActiveChange(()=>this._updateActive())}bringToFront(t){if(this.hasModalWindow()){const o=this.windows.find(s=>s.id===t);if(o&&!o.modal)return}const n=this.windows.findIndex(o=>o.id===t);if(n<0)return;const A=this.windows[n];this.windows.splice(n,1);const i=this._tierOf(A.windowKind);let r=0;for(let o=0;o<this.windows.length;o++)this._tierOf(this.windows[o].windowKind)<=i&&(r=o+1);this.windows.splice(r,0,A),this._notifyActiveChange(()=>this._updateActive())}_tierOf(t){switch(t){case"desktop":return 0;case"document":case"dialog":case"presentation":return 1;case"utility":return 2;case"alert":return 3}}hasModalWindow(){return this.windows.some(t=>t.modal)}getActiveWindow(){for(let t=this.windows.length-1;t>=0;t--)if(this.windows[t].windowKind!=="desktop")return this.windows[t];return null}_updateActive(){const t=this.getActiveWindow();for(let n=0;n<this.windows.length;n++)this.windows[n].active=this.windows[n].windowKind!=="desktop"&&t!==null&&this.windows[n].id===t.id}_notifyActiveChange(t){const n=this._lastActiveId;t();const A=this.getActiveWindow(),i=(A==null?void 0:A.id)??null;i!==n&&(this._lastActiveId=i,this.config.onActivateChange&&this.config.onActivateChange(n,i))}_maxContentSize(){return{width:this.config.screenWidth-6,height:this.config.screenHeight-this.config.menubarHeight-6}}_defaultStandardBounds(){const t=this._maxContentSize();return{x:3,y:this.config.menubarHeight+3,width:t.width,height:t.height}}zoomWindow(t){const n=t.standardBounds??this._defaultStandardBounds();if(t.x===n.x&&t.y===n.y&&t.width===n.width&&t.height===n.height){const i=t.userBounds??{x:t.x,y:t.y,width:t.width,height:t.height};t.x=i.x,t.y=i.y,t.width=i.width,t.height=i.height}else t.userBounds={x:t.x,y:t.y,width:t.width,height:t.height},t.x=n.x,t.y=n.y,t.width=n.width,t.height=n.height}findWindow(t,n){if(n<this.config.menubarHeight)return{windowId:null,part:"inMenuBar"};for(let A=this.windows.length-1;A>=0;A--){const i=this.windows[A];if(i.windowKind==="desktop")continue;const r=this._hitTestWindow(i,t,n);if(r!==null)return{windowId:i.id,part:r}}return{windowId:null,part:"inDesktop"}}_partToCode(t){return{inMenuBar:Ol,inDesktop:Sl,inWindowBackground:Bl,inDrag:Zl,inGoAway:Dl,inZoom:Kl,inGrow:Ll,inVScroll:Rr,inHScroll:Gr,inContent:Tr}[t]}findWindowWithPartCode(t,n){const A=this.findWindow(t,n);return A.windowId===null?{theWindow:null,partCode:this._partToCode(A.part)}:{theWindow:this.windows.find(r=>r.id===A.windowId)??null,partCode:this._partToCode(A.part)}}_hitTestWindow(t,n,A){if(t.chromeless){const c=this.getContentRect(t);return n>=c.x&&n<c.x+c.w&&A>=c.y&&A<c.y+c.h?"inContent":null}const{x:i,y:r,width:o}=t,s=this._headerHeight(t),l=s+t.height;if(n<i||n>=i+o+ce||A<r||A>=r+l+ce)return null;if(t.active&&A>=r&&A<r+xt){const c=i+o-8-zt;if(n>=c&&n<c+zt)return"inZoom"}if(t.active&&A>=r&&A<r+xt){const c=i+8;if(n>=c&&n<c+Gt)return"inGoAway"}if(A>=r&&A<r+xt)return"inDrag";if(t.resizable){const c=i+o-Wt,d=r+s+t.height-Wt;if(n>=c&&n<c+Wt&&A>=d&&A<d+Wt)return"inGrow"}if(t.scrollable){const c=i+o-ut-1,d=t.contentTopInset??0,u=r+s+d-1,f=this._scrollableBodyHeight(t);if(n>=c&&n<c+ut&&A>=u&&A<u+f)return"inVScroll"}if(t.scrollable){const c=r+s+this._bodyHeight(t),d=ut;if(A>=c&&A<c+d)return"inHScroll"}const a=this.getContentRect(t);return n>=a.x&&n<a.x+a.w&&A>=a.y&&A<a.y+a.h?"inContent":"inWindowBackground"}_headerHeight(t){return t.windowKind==="presentation"?0:xt+(t.infoBar?De:0)}_bottomBarHeight(t){return t.windowKind==="presentation"?0:t.scrollable||t.resizable?ut:0}_bodyHeight(t){return t.height-this._bottomBarHeight(t)}_scrollableBodyHeight(t){const n=t.contentTopInset??0;return Math.max(0,this._bodyHeight(t)-n)}getContentRect(t){if(t.chromeless)return{x:t.x,y:t.y,w:t.width,h:t.height};const n=t.scrollable?ut:0,A=this._headerHeight(t),i=this._bodyHeight(t);return{x:t.x+1,y:t.y+A,w:t.width-2-n,h:i}}static makeRegion(t){return{rgn:{rgnSize:10,rgnBBox:tt(t)}}}_createOrUpdatePort(t,n,A){const i=n.portRect.right,r=n.portRect.bottom,o=n.portBits.baseAddr,s=n.portBits.rowBytes,l=F(0,0,t.h,t.w),a=F(-t.y,-t.x,r-t.y,i-t.x);return A?(A.portRect=tt(l),A.portBits.baseAddr=o,A.portBits.rowBytes=s,A.portBits.bounds=tt(a),A.visRgn.rgn.rgnBBox=tt(l),A.visRgn.rgn.scanlines=void 0,A.clipRgn.rgn.rgnBBox=tt(l),A.clipRgn.rgn.scanlines=void 0,A):{device:0,portBits:{baseAddr:o,rowBytes:s,bounds:tt(a)},portRect:tt(l),visRgn:Ze.makeRegion(l),clipRgn:Ze.makeRegion(l),bkPat:new Uint8Array(8),fillPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnLoc:{v:0,h:0},pnSize:{v:1,h:1},pnMode:we,pnPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnVis:0,txFont:0,txFace:0,txMode:1,txSize:0,spExtra:0,fgColor:OA,bkColor:ZA,colrBit:0,patStretch:0,picSave:null,rgnSave:null,polySave:null,grafProcs:n.grafProcs}}ensureWindowPort(t,n,A){if(A!=null&&A.useFrameRect){const r=this._headerHeight(t),o=this._bodyHeight(t),s={x:t.x,y:t.y,w:t.width,h:r+o};return t.framePort=this._createOrUpdatePort(s,n,t.framePort),t.framePort}const i=this.getContentRect(t);return t.port=this._createOrUpdatePort(i,n,t.port),t.port}InvalRect(t,n){if(t.updateRect===null){t.updateRect=tt(n);return}const A=F(0,0,0,0);hs(t.updateRect,n,A),t.updateRect=tt(A)}ValidRect(t,n){t.updateRect=null}BeginUpdate(t){if(t.updateRect===null||!t.port)return;jt(t.port);const n=t.updateRect,A=F(n.top,n.left,n.bottom,n.right),i=Je();kr(i,A),br(i)}EndUpdate(t){t.updateRect=null}createWindowContext(t,n,A){this.ensureWindowPort(t,A);const i=t.port,r=this.getContentRect(t),o=(c,d,u,f)=>{this.resizing={windowId:t.id,startX:c,startY:d,startWidth:u,startHeight:f,prospectiveWidth:u,prospectiveHeight:f}},s=t.contentTopInset??0,l=s>0?0:t.scrollY,a=s>0?0:t.scrollX;return new nn(i,0,0,r.w,r.h,l,a,n,o,{width:t.minWidth,height:t.minHeight},{width:t.width,height:t.height},s,t.scrollY,t.scrollX,r.x,r.y,t)}toContentLocal(t,n,A){const i=this.getContentRect(t),r=t.contentTopInset??0;return r>0?A<i.y+r?{x:n-i.x,y:A-i.y}:{x:n-i.x+t.scrollX,y:A-i.y-r+t.scrollY}:{x:n-i.x+t.scrollX,y:A-i.y+t.scrollY}}handleMouseMove(t,n){if(this.dragging){const A=t-this.dragging.offsetX,i=Math.max(this.config.menubarHeight,n-this.dragging.offsetY);return this.dragging.prospectiveX=A,this.dragging.prospectiveY=i,{consumed:!0}}if(this.resizing){const A=t-this.resizing.startX,i=n-this.resizing.startY,r=this.windows.find(a=>a.id===this.resizing.windowId),o=(r==null?void 0:r.minWidth)??100,s=(r==null?void 0:r.minHeight)??60,l=this._maxContentSize();return this.resizing.prospectiveWidth=Math.max(o,Math.min(l.width,this.resizing.startWidth+A)),this.resizing.prospectiveHeight=Math.max(s,Math.min(l.height,this.resizing.startHeight+i)),{consumed:!0}}return{consumed:!1}}handleMouseUp(){if(this.dragging){const t=this.windows.find(n=>n.id===this.dragging.windowId);return t&&(t.x=this.dragging.prospectiveX,t.y=this.dragging.prospectiveY,t.userBounds={x:t.x,y:t.y,width:t.width,height:t.height}),this.dragging=null,{consumed:!0}}if(this.resizing){const t=this.windows.find(n=>n.id===this.resizing.windowId);return t&&(t.width=this.resizing.prospectiveWidth,t.height=this.resizing.prospectiveHeight,t.userBounds={x:t.x,y:t.y,width:t.width,height:t.height}),this.resizing=null,{consumed:!0}}return{consumed:!1}}isDraggingOrResizing(){return!!(this.dragging||this.resizing)}getDragOutline(){if(this.dragging){const t=this.windows.find(A=>A.id===this.dragging.windowId);if(!t)return null;const n=this._headerHeight(t);return{x:this.dragging.prospectiveX,y:this.dragging.prospectiveY,width:t.width,height:n+t.height,kind:"drag",windowId:t.id}}if(this.resizing){const t=this.windows.find(A=>A.id===this.resizing.windowId);if(!t)return null;const n=this._headerHeight(t);return{x:t.x,y:t.y,width:this.resizing.prospectiveWidth,height:n+this.resizing.prospectiveHeight,kind:"resize",windowId:t.id}}return null}handleScroll(t,n){const A=this._scrollableBodyHeight(t),i=Math.max(0,t.contentHeight-A);t.scrollY=Math.max(0,Math.min(i,t.scrollY+n))}handleHScroll(t,n){const A=t.scrollable?ut:0,i=t.width-2-A,r=Math.max(0,t.contentWidth-i);t.scrollX=Math.max(0,Math.min(r,t.scrollX+n))}drawWindowChrome(t,n,A,i,r){const o=(b,k,V,z,E)=>ot(t,b,k,V,z,E),s=(b,k,V,z,E=h)=>Xt(t,b,k,V,z,E),l=(b,k,V,z=h)=>qt(t,b,k,V,z),a=(b,k,V,z)=>Wr(t,b,k,V,z),c=(b,k,V)=>Vt(t,b,k,V),d=(b,k,V,z)=>{jt(t),zn(Cn(z==null?void 0:z.font)),Mn(0),at(k,V),Ft(b)},f=this.hasModalWindow()&&!n.modal;if(n.chromeless){const b=this.getContentRect(n);f||(n.modal&&i.add({id:"modal-scrim",x:0,y:0,w:this.config.screenWidth,h:this.config.screenHeight,onMouseDown:()=>{},onMouseUp:()=>{}}),i.add({id:`win-content-${n.id}`,x:b.x,y:b.y,w:b.w,h:b.h,onMouseDown:(k,V)=>{r.onContentEvent(n.id,{type:"mouseDown",x:k+n.scrollX,y:V+n.scrollY})},onMouseUp:(k,V)=>{r.onContentEvent(n.id,{type:"mouseUp",x:k+n.scrollX,y:V+n.scrollY})},onDoubleClick:(k,V)=>{r.onContentEvent(n.id,{type:"doubleClick",x:k+n.scrollX,y:V+n.scrollY})}}));return}const{x:q,y:p,width:m,title:g,active:w}=n,y=this._headerHeight(n)+n.height;if(!f){i.add({id:`win-bg-${n.id}`,x:q,y:p,w:m+ce,h:y+ce,onMouseDown:()=>{r.onBringToFront(n.id)}});const b=this.getContentRect(n),k=n.contentTopInset??0,V=(K,D)=>k>0&&D<k?K:K+n.scrollX,z=K=>k>0&&K<k?K:k>0?K-k+n.scrollY:K+n.scrollY,E=K=>k>0?K<k?"fixed":"scrollable":void 0;i.add({id:`win-content-${n.id}`,x:b.x,y:b.y,w:b.w,h:b.h,onMouseDown:(K,D)=>{r.onBringToFront(n.id),r.onContentEvent(n.id,{type:"mouseDown",x:V(K,D),y:z(D),contentRegion:E(D)})},onMouseUp:(K,D)=>{r.onContentEvent(n.id,{type:"mouseUp",x:V(K,D),y:z(D),contentRegion:E(D)})},onDoubleClick:(K,D)=>{r.onContentEvent(n.id,{type:"doubleClick",x:V(K,D),y:z(D),contentRegion:E(D)})}}),i.add({id:`win-titlebar-${n.id}`,x:q,y:p,w:m,h:xt,onMouseDown:(K,D)=>{r.onBringToFront(n.id),this.dragging={windowId:n.id,offsetX:K,offsetY:D,prospectiveX:n.x,prospectiveY:n.y}}})}o(q+ce,p+y,m,ce,h),o(q+m,p+ce,ce,y,h),o(q,p,m,y,B),s(q,p,m,y,h),l(q,p+xt-1,m,h);const v=Kt(g,"menu"),C=q+Math.floor((m-v)/2),W=p+3;if(w){const b=p+4,k=11;o(q+1,b,m-2,k,B);for(let L=0;L<k;L+=2)l(q+1,b+L,m-2,h);const V=q+8,z=p+Math.floor((xt-Gt)/2),E=this.closeBoxPressed===n.id,K=A.get(E?"chrome/closing":"chrome/close");o(V-1,z-1,Gt+2,Gt+2,B),K?c(K,V,z):s(V,z,Gt,Gt,h),f||i.add({id:`win-close-${n.id}`,x:V,y:z,w:Gt,h:Gt,onMouseDown:()=>{this.closeBoxPressed=n.id,r.scheduleRender()},onMouseUp:(L,R)=>{const j=L>=0&&L<Gt&&R>=0&&R<Gt;this.closeBoxPressed=null,j?r.onClose(n.id):r.scheduleRender()}});const D=q+m-8-zt,H=p+Math.floor((xt-zt)/2),N=this.zoomBoxPressed===n.id,X=A.get("chrome/zoom");o(D-1,H-1,zt+2,zt+2,B),X?c(X,D,H):s(D,H,zt,zt,h),N&&a(D+1,H+1,zt-2,zt-2),f||i.add({id:`win-zoom-${n.id}`,x:D,y:H,w:zt,h:zt,onMouseDown:()=>{this.zoomBoxPressed=n.id,r.scheduleRender()},onMouseUp:(L,R)=>{const j=L>=0&&L<zt&&R>=0&&R<zt;this.zoomBoxPressed=null,j&&r.onZoom(n.id),r.scheduleRender()}}),o(C-4,p+1,v+8,xt-2,B)}if(d(g,C,W,{font:"menu"}),n.infoBar&&this._drawInfoBar(t,n),n.scrollable){const b=this._headerHeight(n),k=this._bodyHeight(n),V=this._scrollableBodyHeight(n),z=n.contentTopInset??0,E=n.resizable?Wt:0,K=ut,D=n.width-1-K;if(z>0){const L=n.x+n.width-ut;ot(t,L,n.y+b,ut,z,B)}const H=F(b+z-1,n.width-ut,b+z-1+V,n.width),N=F(b+k,0,b+k+ut,n.width-E);Il(n,{verticalRect:H,horizontalRect:N,scrollY:n.scrollY,scrollX:n.scrollX,contentHeight:n.contentHeight,contentWidth:n.contentWidth,scrollableBodyH:V,contentW:D,scheduleRender:r.scheduleRender});const X=this.ensureWindowPort(n,t,{useFrameRect:!0});gl(n,X,L=>A.get(L)??null)}n.resizable&&this._drawGrowBox(t,n,A,i,r)}drawDragOutline(t){const n=this.getDragOutline();n&&Or(t,n.x,n.y,n.width,n.height,"darkCheckers")}_drawInfoBar(t,n){const{x:A,y:i,width:r}=n,o=i+xt,s=n.infoBar;if(qt(t,A,o+De-1,r,h),s.length>0){jt(t),zn(Cn("body")),Mn(0);const l=Math.floor((r-2)/s.length);for(let a=0;a<s.length;a++){const c=Kt(s[a],"body"),d=A+1+a*l+Math.floor((l-c)/2);at(d,o+4),Ft(s[a]),a<s.length-1&&ve(t,A+1+(a+1)*l,o,De-1,h)}}}_drawGrowBox(t,n,A,i,r){const o=this._headerHeight(n),s=n.x+n.width-Wt,l=n.y+o+n.height-Wt,a=A.get("chrome/resize");a?Vt(t,a,s,l):(ot(t,s,l,Wt,Wt,B),qt(t,s,l,Wt,h),ve(t,s,l,Wt,h)),i.add({id:`win-growbox-${n.id}`,x:s,y:l,w:Wt,h:Wt,onMouseDown:(c,d)=>{this.resizing={windowId:n.id,startX:s+c,startY:l+d,startWidth:n.width,startHeight:n.height,prospectiveWidth:n.width,prospectiveHeight:n.height}}})}getScrollableBodyHeight(t){return this._bodyHeight(t)}}function G(e,t,n){const A=atob(n),i=e*t,r=new Uint8Array(i),o=new Uint8Array(i);for(let s=0;s<i;s++){const l=s>>2,a=6-(s&3)*2,c=A.charCodeAt(l)>>a&3;r[s]=c===2?h:B,o[s]=c===0?0:1}return{width:e,height:t,data:r,mask:o}}class Hl{constructor(){this.entries=new Map,this.nameIndex=new Map,this.cache=new Map,this.loading=new Map}_key(t,n){return`${t}:${n}`}_nameKey(t,n){return`${t}:${n}`}get(t){return this.cache.get(t)}has(t){return this.cache.has(t)}register(t,n){this.cache.set(t,n)}registerAll(t){for(const[n,A]of Object.entries(t))this.cache.set(n,A)}async load(t,n,A){const i=this.cache.get(t);if(i)return i;const r=this.loading.get(t);if(r)return r;const o=this._loadImage(t,n,A);this.loading.set(t,o);const s=await o;return this.loading.delete(t),this.cache.set(t,s),s}async preload(t){await Promise.all(t.map(n=>this.load(n)))}static fromBits(t,n,A,i=!1){const r=new Uint8Array(t*n),o=new Uint8Array(t*n);if(i){const s=A.length/2;for(let l=0;l<s;l++)r[l]=A[l]?h:B,o[l]=A[s+l]?1:0}else for(let s=0;s<A.length;s++)r[s]=A[s]?h:B,o[s]=1;return{width:t,height:n,data:r,mask:o}}async _loadImage(t,n,A){const r=await(await fetch(t)).blob(),o=await createImageBitmap(r),s=n??o.width,l=A??o.height,c=new OffscreenCanvas(s,l).getContext("2d");c.imageSmoothingEnabled=!1,c.drawImage(o,0,0,s,l),o.close();const u=c.getImageData(0,0,s,l).data,f=new Uint8Array(s*l),q=new Uint8Array(s*l);for(let p=0;p<s*l;p++){const m=p*4;if(u[m+3]<128)f[p]=B,q[p]=0;else{const w=(u[m]+u[m+1]+u[m+2])/3;f[p]=w<128?h:B,q[p]=1}}return{width:s,height:l,data:f,mask:q}}AddResource(t,n,A,i){const r={resType:t,resID:n,name:A,data:i};this.entries.set(this._key(t,n),r),A&&this.nameIndex.set(this._nameKey(t,A),r),this.cache.set(A,i)}AddSpriteResource(t,n,A,i,r,o){const s=G(i,r,o);this.AddResource(t,n,A,s)}GetResource(t,n){const A=this.entries.get(this._key(t,n));return(A==null?void 0:A.data)??null}GetNamedResource(t,n){const A=this.nameIndex.get(this._nameKey(t,n));return A?A.data:this.cache.get(n)??null}CountResources(t){let n=0;for(const A of this.entries.values())A.resType===t&&n++;return n}GetResourceIDs(t){const n=[];for(const A of this.entries.values())A.resType===t&&n.push(A.resID);return n}RemoveResource(t,n){const A=this._key(t,n),i=this.entries.get(A);i&&(this.entries.delete(A),i.name&&this.nameIndex.delete(this._nameKey(t,i.name)))}}const El=G(32,32,"AKqqqqqqqgAKVVVVVVVVoCVVVVVVVVVYJVVVaqlVVViVVVaVVpVVVpVVaWqpaVVWlVWWqqqWVVaVVmqqqqmVVpVZqqqqqmVWlWaqlaqqmVaVZqlVaqqZVpWapVWqqqZWlZqlWqqqplaWapVpqqqplpZqlaaqqqmWlmqVqqqqqZaWaqaqqqqplpZqqqqmqqmWlmqqqpaaqZaVmqqqqpamVpWaqqqqVqZWlWaqqqVamVaVZqqqqWqZVpVZqqqqqmVWlVZqqqqplVaVVZaqqpZVVpVVaWqpaVVWlVVWlVaVVVYlVVVqqVVVWCVVVVVVVVVYClVVVVVVVaAAqqqqqqqqAA=="),Pl=G(32,32,"AAAAqqoAAAAAACpmpqgAAAACpqmqqoAAAAppmpqaoAAAKqqpqqqoAACmmqqqamoAAqmpmqqqqoAKaqqqmqqqYAmpqqmqmpqgKpqZqqqqqqgpqqlqqapqqCqqqVaqqqqomampVWqqqqqqqqlVVqqqqppqqVVVaqqqqqaZVVVWqqqaqqlVVVWqqqqqqVVVWqqqqmqpVVWqqqqqqmlVWqqqqCaqqVWqqqqoKqqpWqqqqqgpqqmqqqqqqAqaqqqqqqqgCqqqqqqqqqACqqqqqqqqgACqqqqqqqoAACqqqqqqqAAACqqqqqqgAAACqqqqqoAAAAAqqqqoAAAAAACqqgAAAA=="),Tl=G(16,16,"CqqqoCqqqqiqqWqqqqlqqqqlWqqqpVqqqpWWqqqWlqqlVWVapVVlWqqqpaqpaqlqqWqpaqqqqqoqqqqoCqqqoA=="),Rl=G(32,32,"ACqqqqqqqAACqqqqqqqqgAqqqqqqqqqgKqqqqqqqqqgqqqqWlqqqqKqqqlaVqqqqqqqqlWaqqqqqqqqVZqqqqqqqqqWaqqqqqqqqpZqqqqqqqqqmWqqqqqqqqpZmqqqqqqqqmaaqqqqqqqpZpaqqqqqqqmaZqqqqqqqpZplqqqqqqqmapmqqqqqqpZqmWqqqqqVVVWmVWqqqmZmZqZZmqqqlVVVaZpqqqqqqqqplqqqqqmaqqpmqqqqpZqqqmWqqqqlaqqqlaqqqqlqqqqWqqqqqqqqqqqqqKqqqqqqqqqgqqqqqqqqqqAqqqqqqqqqgAqqqqqqqqoAAKqqqqqqoAA=="),Gl=G(32,32,"AKqqqqqqqgAKqqqqqqqqoCqqqqqqqqqoKqqqqqqqqqiqqqqWlqqqqqqqqlaVqqqqqqqqlWaqqqqqqqqVZqqqqqqqqqWaqqqqqqqqpZqqqqqqqqqmWqqqqqqqqpZmqqqqqqqqmaaqqqqqqqpZpaqqqqqqqmaZqqqqqqqpZplqqqqqqqmapmqqqqqqpZqmWqqqqqVVVWmVWqqqmZmZqZZmqqqlVVVaZpqqqqqqqqplqqqqqmaqqpmqqqqpZqqqmWqqqqlaqqqlaqqqqlqqqqWqqqqqqqqqqqqqqqqqqqqqqqoqqqqqqqqqqCqqqqqqqqqoCqqqqqqqqqAAqqqqqqqqAA=="),Yl=G(32,32,"ACqqqqqqqAACqqqqqqqqgAqlVVVVVVqgKlqqqqqqpagpqqqWlqqqaKmqqlaVqqpqpqqqlWaqqpqmqqqVZqqqmqaqqqWaqqqapqqqpZqqqpqmqqqmWqqqmqaqqpZmqqqapqqqmaaqqpqmqqpZpaqqmqaqqmaZqqqapqqpZplqqpqmqqmapmqqmqaqpZqmWqqapqVVVWmVWpqmmZmZqZZmmqalVVVaZpqapqqqqqplqpqmqmaqqpmqmqapZqqqmWqapqlaqqqlapqmqlqqqqWqmqmqqqqqqqpqKaqqqqqqqmgqWqqqqqqlqAqlVVVVVVqgAqqqqqqqqoAAKqqqqqqoAA=="),Nl=G(32,32,"ACqqqqqqqAAClVVVVVVWgAlmpqampqlgJqpqampqapgmpqampqammKpqampqampqpqampqampqaqaqqqaqqqaqapVlqpVVqmqqVVVVaqpqqpmqVVWpWpqqqVWlaaVmmqmpqllmpqaZqqmqmWmmlpqqmaaZValamqqpqZlVaqpqqampmVWVVamqqammVWZmaqqpqaZVVVVqqqmpplVVVWqqqaamVVVVaqqpqqZVVVVqqqmqpmqqqmqqqlVVVVVVqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqKqqqqqqqqqgqqqqqqqqqqAqqqqqqqqqgAqqqqqqqqoAAKqqqqqqoAA=="),Ul=G(32,32,"AAAAAAAAAAAAAAAAIAAAAAAAAgAgAgAAAAAAgCAIAAAAAAAgICAAAAAAAAgggAAAAAAAAgIAAAAAACgAAACgAAAAAoqqigAAAAAACWWAAAAAAAAJqYAAAAAAKompiqAAAKAACWWAAAACqgCqqqoqoAJWKJVVViVgKqqqqqqqqqglVVVVVVVVWCVaqqqqqqpYJVlVVapVVlglaVVaVaVWmCVpVWWqWVaYJWlVZlWZVpglaVWZVWZWmCVpaZlVZlaYJWlpmVVmVpglaaWZVWZWmCVpVWZVmVaYJWlVZapZVpglaVVaVaVWmCVpVVWqVVaYJVqqqqqqqlgqqqqqqqqqqA=="),Fl=G(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqgAAAAAAqAKqgAAAAACYCVVgKqgAqqqpVWqVVgCqqqqqqpVWAKmqqVVqpVoAqqqVVVaqqgCpqlaqlaqqAKqqWlWlqqoAqalpVWlqqgCqqWVVWWqqAKqpZVVZaqoAqqllVVlqqgCqqWVVWWqqAKqpaVVpaqoAqqpaVaWqqgCqqlaqlaqqAKqqlVVWqqoAqqqpVWqqqgCqqqqqqqqqAKqqqqqqqqoA=="),Xl=G(32,32,"qqqqqqqqqqqVVWqqqqqqqpVVaqqqqqqqlVVqqqqqqqqVVWqqqqqqqpVVaqqVVWqqlZVqqVVVVqqVlWqlVVVVqpWVapVVVVVqlVVqlVVVVWqVVWpVVVVVWpVValVVVVValVVqVVVVVVqVVWpVVVVVWpVValVVVVValVVqVVVVVVqVVWpVVVVVWpVValVVVVValVVqVVVVVVqVVWpVVVVVWpVqqlVVVVValVaqVVVVVVqVVqpVVVVVapVWqlVVVVVqlVaqVVVVVaqVVqlVVVVWqpWqlVVVVWqqlVaqqqqqqqqVVqqqqqqqqpVWqqqqqqqqlVaqqqqqqqqqqqqqqqqqqg=="),jl=G(32,32,"AAAAAAAAAAAAKqqqqqqoAACVVVVVVVYAAJVVVVVVVgAAlaqqqqpWAACWVVVVVZYAAJZmZmZVlgAAllVVVVWWAACWZmZVVZYAAJZVVVVVlgAAlmZVVVWWAACWVVVVVZYAAJZmVVVVlgAAllVVVVWWAACWZmVVVZYAAJZVVVVVlgAAllVVVVWWAACVqqqqqlYAAJVVVVVVVgAAlVVVVVVWAACVVVVVVVYAAJVVVVVVVgAAlVVVqqpWAACVVVVVVVYAAJVVVVVVVgAAlVVVVVVWAACVVVVVVVYAACqqqqqqqAAAJVVVVVVYAAAlVVVVVVgAACVVVVVVWAAAKqqqqqqoAA=="),Jl=G(32,32,"AqqqqqqgAAACVVVVVWgAAAJVVVVVZgAAAlVVVVVlgAACVVVVVWVgAAJVVVVVZVgAAlVVVVVqqgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVqampppWAAJVVVVVVVYAAlVVVVVVVgACVqapqmpWAAJVVVVVVVYAAlVVVVVVVgACVpqqmppWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACqqqqqqqqAA=="),Ql=G(32,32,"AqqqqqqgAAACVVVVVWgAAAJVVVVVZgAAAlVVVVVlgAACVVVVVWVgAAJVamqapVgAAlVVVVVqqgACVqamqlVWAAJVVVVVVVYAAlaqaqmqVgACVVVVVVVWAAJWpqamqVYAAlVVVVVVVgACVVVVVVVWAAJVapqmqlYAAlVVVVVVVgACVqmqappWAAJVVVVVVVYAAlaapqmqVgACVVVVVVVWAAJWqaqapVYAAlVVVVVVVgACVVVVVVVWAAJVapqaalYAAlVVVVVVVgACVqmpqapWAAJVVVVVVVYAAlamqmqaVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACqqqqqqqqAA=="),_l=G(32,32,"AAKqoAAAAAAAAmqgAAAAAAACaqAAAAAAqqqqqqqAAAClqqqqqoAAAKqqqqqqgAAAJVVWVpoAAAAlVVVmpgAAACVVVlaaAAAAJVVVZqYAAAAlVVZWmgAAACVVVWamAAAAJVVWVpoAAAAlVVVmpgAAACVVVlaaAAAAJVVVZqYAAAAlVVZWqqqqqCVVVWaVVVVWJVVWVpVVVVYlVVVmlVVVViVVVlaVVVVWJVVVZpVVVVYlVVZWlVVVViVVVWaVVVVWJVVWVqampqYlVVVmpmZmZiVVVlampqamJVVVZpVVVVYlVVZWqqqqqqqqqqqqgAAApaqqqqqAAACqqqqqqoAAAA=="),$l=G(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACqqgAAAAAAAlVVgAAAAAAJVVVgAAAAACqqqqqqqqqolVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaqqqqqqqqqqg=="),ta=G(32,32,"ACqqqqqqoAAAlVVVVVVYAAJVVVVVVVYAAlaqqqqqVgACWVVVVVWWAAJZVVVVVZYAAllVVVVVlgACWVZWVlWWAAJZVlZWVZYAAllVVlVVlgACWVVWVVWWAAJZVVpVVZYAAllVVVVVlgACWVWVZVWWAAJZVWqVVZYAAllVVVVVlgACWVVVVVWWAAJWqqqqqlYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACWlVVWqpWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAKqqqqqqqAAAlVVVVVVYAACVVVVVVVgAAJVVVVVVWAAAqqqqqqqoAA=="),ea=G(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKqqqqqqqqqiVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVlVVVVVVVVpVVVVVVVVVWlVVVVVVVVVYqqqqqqqqqqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="),na=G(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqqqqqqqqqqCqqqqqqqqqoKWlpaWlpaWgpaWlpaWlpaCqqqqqqqqqoKqqqqqqqqqgpVVVVVVVVaClVVVVVVVVoKVVVVVVVVWgpVVWlVVVVaClVVapVVVVoKVVVqqVVVWgpVVWqqlVVaClVVaqqpVVoKVVVqqqlVWgpVVWqqlVVaClVVaqlVVVoKVVVqlVVVWgpVVWlVVVVaClVVVVVVVVoKVVVVVVVVWgpVVVVVVVVaCqqqqqqqqqoKqqqqqqqqqgpaWlpaWlpaClpaWlpaWloKqqqqqqqqqgqqqqqqqqqqA=="),Aa=G(32,32,"ACqqqqqqqAAClVVVVVVWgAlmpqampqlgJqpqaqpqapgmpqaVVqammKpqaWqpampqpqaWqqqWpqaqamqqqqmqaqapqqqqqmamqqaqlaqqmqqppqlVaqqZqqqapVWqqqaqmpqlWqqqppqqapVpqqqpqqpqlaaqqqmqqmqVqqqqqaqaaqaqqqqpmqpqqqqmqqmqqmqqqpaaqaqqmqqqqpamqqqaqqqqVqaqqqaqqqVamqqqpqqqqWqaqqqpqqqqqmqqqqpqqqqpqqqqqpaqqpaqqqqqqWqpaqqqKqqqlVaqqqgqqqqqqqqqqAqqqqqqqqqgAqqqqqqqqoAAKqqqqqqoAA=="),ia=G(32,32,"AKqqqqqqqgAKVVVVVVVVoCWmpqampqZYJmpqaqpqapiapqaVVqampqpqaWqpampqpqaWqqqWpqaqamqqqqmqaqapqqqqqmamqqaqlaqqmqqppqlVaqqZqqqapVWqqqaqmpqlWqqqppqqapVpqqqpqqpqlaaqqqmqqmqVqqqqqaqaaqaqqqqpmqpqqqqmqqmqqmqqqpaaqaqqmqqqqpamqqqaqqqqVqaqqqaqqqVamqqqpqqqqWqaqqqpqqqqqmqqqqpqqqqpqqqqqpaqqpaqqqqqqWqpaqqqqqqqlVaqqqoqqqqqqqqqqCqqqqqqqqqoCqqqqqqqqqAAqqqqqqqqAA=="),ra=G(32,32,"ACqqqqqqoAAAlVVVVVVYAAJVVVVVVVYAAlaqqqqqVgACWVVVVVWWAAJZVVVVVZYAAllZlVmVlgACWVZVVlWWAAJZWZVZlZYAAllVVVVVlgACWVVllVWWAAJZVVpVVZYAAllVVVVVlgACWVWqpVWWAAJZVlVaVZYAAllVVVWVlgACWVVVVVWWAAJWqqqqqlYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACWlVVWqpWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAKqqqqqqqAAAlVVVVVVYAACVVVVVVVgAAJVVVVVVWAAAqqqqqqqoAA=="),oa=G(32,32,"AAAAqqoAAAAAACpVVagAAAAClVaVVoAAAApZVpVloAAAJVZWlZVYAACVVlaVlVYAAllVVVVVVYAKVlVVVVVloAlVlVVVVpVgJVVVVVVaVVgmVVVVVapVmCWlVVVaqVpYlVVVVWqlVVaVVVVWqpVVVpVVVVqqVVVWmqVVZqpVWqaapVWVqVVappVVVZVlVVVWlVVWVpVVVVaVVVlZVVVVViWlZaVVVVpYJlWaVVVVVZglVaVVVVVVWAlWlVVVVlVgCllVVVVVlaACVVVVVVVlgACVVlaVlVYAACVWVpWVWAAACllWlWWgAAAClVaVVoAAAAAqVVWoAAAAAACqqgAAAA=="),sa=G(32,32,"AAAAKqAAAAAAAACVWAAAAAAqqqqqqqAAAJVVVVVVWAAAlVVVVVVYAACqqqqqqqgAACVVVVVVYAAAJVVVVVVgAAAlWVlZWWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJVlZWVlgAAAlVVVVVWAAACVVVVVVYAAACqqqqqqAAA=="),la=G(32,32,"qqqqqqqqqqqVVVVVVVVVVpVVVVVVVVVWmqWqWqWqWqaZZZZZZZZZZplllllllllmmqWqWqWqWqaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVpVVVVVWlVVWqVVVVVaVVVaqlVVVVpVVVqqpVVVWlVVWqqqVVVaVVVaqqpVVVpVVVqqpVVVWlVVWqpVVVVaVVVapVVVVVpVVVpVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaapapapapapplllllllllmmWWWWWWWWWaapapapapappVVVVVVVVVWlVVVVVVVVVaqqqqqqqqqqg=="),aa={"icon/1bitcamera":El,"icon/MacFlim":Pl,"icon/appstore-16x16":Tl,"icon/appstore-32x32":Rl,"icon/appstore-smr-32x32":Gl,"icon/appstore2":Yl,"icon/camera-32":Nl,"icon/camera":Ul,"icon/camera3":Fl,"icon/chat":Xl,"icon/computer":jl,"icon/file":Jl,"icon/file0":Ql,"icon/film":_l,"icon/folder":$l,"icon/happy":ta,"icon/hd":ea,"icon/movie":na,"icon/photobooth-32x32":Aa,"icon/photobooth-smr-32":ia,"icon/sad":ra,"icon/safari":oa,"icon/trash":sa,"icon/video":la},ca=G(16,16,"AAKAAAKJagAJaWWACWlliAJZZaYCWWWWKJVVlpaVVVaVlVVYJVVVWAlVVVgJVVVgAlVVYACVVYAAJVWAACVVgA=="),da=G(16,16,"AAAAAAAAAAAAAAAAAAAAAACiigACWWWgAlVVmACVVVgClVVYCVVVWAlVVVgJVVVgAlVVYACVVYAAJVWAACVVgA=="),ua=G(16,16,"UAAAAGQAAABpAAAAakAAAGqQAABqpAAAaqkAAGqqQABqqpAAaqVUAGmkAABkaQAAUGkAAEAaQAAAGkAAAAVAAA=="),fa=G(32,32,"VQAAAAAAAABVAAAAAAAAAFpQAAAAAAAAWlAAAAAAAABapQAAAAAAAFqlAAAAAAAAWqpQAAAAAABaqlAAAAAAAFqqpQAAAAAAWqqlAAAAAABaqqpQAAAAAFqqqlAAAAAAWqqqpQAAAABaqqqlAAAAAFqqqqpQAAAAWqqqqlAAAABaqqqqpQAAAFqqqqqlAAAAWqqqVVVQAABaqqpVVVAAAFqlqlAAAAAAWqWqUAAAAABaUFqlAAAAAFpQWqUAAAAAVQBapQAAAABVAFqlAAAAAFAABapQAAAAUAAFqlAAAAAAAAWqUAAAAAAABapQAAAAAAAAVVAAAAAAAABVUAAAAA=="),pa=G(48,48,"VVAAAAAAAAAAAAAAVVAAAAAAAAAAAAAAVVAAAAAAAAAAAAAAVqVAAAAAAAAAAAAAVqVAAAAAAAAAAAAAVqVAAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqqVAAAAAAAAAAAVqqqVAAAAAAAAAAAVqqqVAAAAAAAAAAAVqqqqVAAAAAAAAAAVqqqqVAAAAAAAAAAVqqqqVAAAAAAAAAAVqqqqqVAAAAAAAAAVqqqqqVAAAAAAAAAVqqqqqVAAAAAAAAAVqqqqqqVAAAAAAAAVqqqqqqVAAAAAAAAVqqqqqqVAAAAAAAAVqqqqqqqVAAAAAAAVqqqqqqqVAAAAAAAVqqqqqqqVAAAAAAAVqqqqqqqqVAAAAAAVqqqqqqqqVAAAAAAVqqqqqqqqVAAAAAAVqqqqqVVVVVAAAAAVqqqqqVVVVVAAAAAVqqqqqVVVVVAAAAAVqqVqqVAAAAAAAAAVqqVqqVAAAAAAAAAVqqVqqVAAAAAAAAAVqVAVqqVAAAAAAAAVqVAVqqVAAAAAAAAVqVAVqqVAAAAAAAAVVAAVqqVAAAAAAAAVVAAVqqVAAAAAAAAVVAAVqqVAAAAAAAAVAAAAVqqVAAAAAAAVAAAAVqqVAAAAAAAVAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAAVVVAAAAAAAAAAAAAVVVAAAAAAAAAAAAAVVVAAAAAAA"),qa=G(64,64,"VVUAAAAAAAAAAAAAAAAAAFVVAAAAAAAAAAAAAAAAAABVVQAAAAAAAAAAAAAAAAAAVVUAAAAAAAAAAAAAAAAAAFWqVQAAAAAAAAAAAAAAAABVqlUAAAAAAAAAAAAAAAAAVapVAAAAAAAAAAAAAAAAAFWqVQAAAAAAAAAAAAAAAABVqqpVAAAAAAAAAAAAAAAAVaqqVQAAAAAAAAAAAAAAAFWqqlUAAAAAAAAAAAAAAABVqqpVAAAAAAAAAAAAAAAAVaqqqlUAAAAAAAAAAAAAAFWqqqpVAAAAAAAAAAAAAABVqqqqVQAAAAAAAAAAAAAAVaqqqlUAAAAAAAAAAAAAAFWqqqqqVQAAAAAAAAAAAABVqqqqqlUAAAAAAAAAAAAAVaqqqqpVAAAAAAAAAAAAAFWqqqqqVQAAAAAAAAAAAABVqqqqqqpVAAAAAAAAAAAAVaqqqqqqVQAAAAAAAAAAAFWqqqqqqlUAAAAAAAAAAABVqqqqqqpVAAAAAAAAAAAAVaqqqqqqqlUAAAAAAAAAAFWqqqqqqqpVAAAAAAAAAABVqqqqqqqqVQAAAAAAAAAAVaqqqqqqqlUAAAAAAAAAAFWqqqqqqqqqVQAAAAAAAABVqqqqqqqqqlUAAAAAAAAAVaqqqqqqqqpVAAAAAAAAAFWqqqqqqqqqVQAAAAAAAABVqqqqqqqqqqpVAAAAAAAAVaqqqqqqqqqqVQAAAAAAAFWqqqqqqqqqqlUAAAAAAABVqqqqqqqqqqpVAAAAAAAAVaqqqqqqVVVVVVUAAAAAAFWqqqqqqlVVVVVVAAAAAABVqqqqqqpVVVVVVQAAAAAAVaqqqqqqVVVVVVUAAAAAAFWqqlWqqlUAAAAAAAAAAABVqqpVqqpVAAAAAAAAAAAAVaqqVaqqVQAAAAAAAAAAAFWqqlWqqlUAAAAAAAAAAABVqlUAVaqqVQAAAAAAAAAAVapVAFWqqlUAAAAAAAAAAFWqVQBVqqpVAAAAAAAAAABVqlUAVaqqVQAAAAAAAAAAVVUAAFWqqlUAAAAAAAAAAFVVAABVqqpVAAAAAAAAAABVVQAAVaqqVQAAAAAAAAAAVVUAAFWqqlUAAAAAAAAAAFUAAAAAVaqqVQAAAAAAAABVAAAAAFWqqlUAAAAAAAAAVQAAAABVqqpVAAAAAAAAAFUAAAAAVaqqVQAAAAAAAAAAAAAAAFWqqlUAAAAAAAAAAAAAAABVqqpVAAAAAAAAAAAAAAAAVaqqVQAAAAAAAAAAAAAAAFWqqlUAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAFVVVQAAAAAAAAAAAAAAAABVVVUAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAA=="),ma=G(96,96,"VVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAA"),ha=G(144,144,"VVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAA"),ga=G(7,16,"oCgiACAAgAIACAAgAIACAAgAIACAAgAIAIgoCg=="),xa=G(14,32,"qgAKqqAAqgCgoAAKCgAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAAoKAACgoAqgAKqqAAqg=="),ya=G(21,48,"qqAAAqqqqAAAqqqqAAAqqAAqAqAAAAqAqAAAAqAqAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAqAqAAAAqAqAAAAqAqAAqqAAAqqqqAAAqqqqAAAqq"),Va=G(28,64,"qqoAAACqqqqqAAAAqqqqqgAAAKqqqqoAAACqqgAAqgCqAAAAAKoAqgAAAACqAKoAAAAAqgCqAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAKoAqgAAAACqAKoAAAAAqgCqAAAAAKoAqgAAqqoAAACqqqqqAAAAqqqqqgAAAKqqqqoAAACqqg=="),ba=G(42,96,"qqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqq"),wa=G(63,144,"qqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqq"),va=G(11,16,"CqoAKqgAqqACqoAlVYJVlYlWViVZWpalalVViVVWCVVgCqoAKqgAqqACqoA="),ka={"cursor/cursor-grab":ca,"cursor/cursor-grabbing":da,"cursor/default-1x":ua,"cursor/default-2x":fa,"cursor/default-3x":pa,"cursor/default-4x":qa,"cursor/default-6x":ma,"cursor/default-9x":ha,"cursor/text-1x":ga,"cursor/text-2x":xa,"cursor/text-3x":ya,"cursor/text-4x":Va,"cursor/text-6x":ba,"cursor/text-9x":wa,"cursor/watch":va},Ia=G(9,11,"ACgAKAAIAKioqqqqqgqqgqqqqqqKqoCigA=="),za=G(12,15,"KqqolVVWlVVWlVZWlVZWlVZWlVVWlVVWlVWolVVYlVlYlVaolVVYlVVYKqqg"),Ma=G(51,34,"mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZqqqqmZmZmZmZmZmZmVlVlpmZmZmZmZmZmaVlZlaZmZmZmZmZmZmVlVlZmZmZmZmZmZmaVaqVaZmZmZmZmZmZmVVVVZmZmZmZmZmZmaaqqqaZmZmZmZmZmZmZVVWZmZmZmZmZmZmaZWpWaZmZmZmZmZmZmZZWWZmZmZmZmZmZmaZVZWaZmZmZmZmZmZmZVlWZmZmZmZmZmZmaZVVWaZmZmZmZmZmZmZVlWZmZmZmZmZmZmaZVVWaZmZmZmZmZmZmqqqqpmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZA="),Ca=G(5,5,"qqoKAgCAAA=="),Wa=G(5,5,"qoKgKAIAgA=="),Sa=G(5,5,"gCAKAqCqgA=="),Oa=G(5,5,"AIAgKCqqgA=="),Za=G(4,2,"ZVY="),La={eaten_apple:Ia,user2:za,"microdesktop-disk":Ma,"corner-lt":Ca,"corner-rt":Wa,"corner-lb":Sa,"corner-rb":Oa,"scrollbar-bg":Za},Da=G(16,16,"qqqqqpVVVVaVVlVWlVmVVpVlZVaVlVlWllVWVplVVZaqlVqmlZVZVpWVWVaVlVlWlaqpVpVVVVaVVVVWqqqqqg=="),Ka=G(16,16,"qqqqqpVVVVaVVVVWlaqpVpWVWVaVlVlWlZVZVqqVWqaZVVWWllVWVpWVWVaVZWVWlVmVVpVWVVaVVVVWqqqqqg=="),Ba=G(16,16,"qqqqqpVWVVaVWlVWlWZVVpWWqlaWVVZWmVVWVqVVVlaZVVZWllVWVpWWqlaVZlVWlVpVVpVWVVaVVVVWqqqqqg=="),Ha=G(16,16,"qqqqqpVVlVaVVaVWlVWZVpWqllaVlVWWlZVVZpWVVVqVlVVmlZVVlpWqllaVVZlWlVWlVpVVlVaVVVVWqqqqqg=="),Ea=G(11,11,"qqqqVVVpVVWlVVaVVVpVVWlVVaVVVpVVWlVVaqqqgA=="),Pa=G(11,11,"qqqqVZVpllmlmZaVVVqpWqlVVaWZlpllmlWVaqqqgA=="),Ta=G(16,16,"qqqqqpVVVVaVVVVWlqqlVpZVZVaWVWqmllVlZpZVZWaWVWVmlqqlZpVlVWaVZVVmlWVVZpVqqqaVVVVWqqqqqg=="),Ra=G(11,11,"qqqqVWVpVZWlVlaVWVpVZWqqlaVVVpVVWlVVaqqqgA=="),Ga={"chrome/up":Da,"chrome/down":Ka,"chrome/left":Ba,"chrome/right":Ha,"chrome/close":Ea,"chrome/closing":Pa,"chrome/resize":Ta,"chrome/zoom":Ra};function Ya(e){e.registerAll(aa),e.registerAll(ka),e.registerAll(La),e.registerAll(Ga)}class Na{constructor(){this.regions=[],this.hoveredId=null,this.pressedId=null}clear(){this.regions.length=0}add(t){this.regions.push(t)}hitTest(t,n){for(let A=this.regions.length-1;A>=0;A--){const i=this.regions[A];if(t>=i.x&&t<i.x+i.w&&n>=i.y&&n<i.y+i.h)return i}return null}handleMouseMove(t,n){var r,o,s;const A=this.hitTest(t,n),i=(A==null?void 0:A.id)??null;if(i!==this.hoveredId){if(this.hoveredId!==null){const l=this.findById(this.hoveredId);(r=l==null?void 0:l.onMouseLeave)==null||r.call(l)}this.hoveredId=i,A&&((o=A.onMouseEnter)==null||o.call(A))}if(this.pressedId!==null){const l=this.findById(this.pressedId);return(s=l==null?void 0:l.onDrag)==null||s.call(l,t,n),!0}return A!==null}handleMouseDown(t,n){var i;const A=this.hitTest(t,n);return A?(this.pressedId=A.id,(i=A.onMouseDown)==null||i.call(A,t-A.x,n-A.y),!0):!1}handleMouseUp(t,n){const A=this.pressedId;this.pressedId=null;const i=this.hitTest(t,n);return i!=null&&i.onMouseUp&&i.onMouseUp(t-i.x,n-i.y),i&&A===i.id&&i.onClick?(i.onClick(t-i.x,n-i.y),!0):A!==null}handleDoubleClick(t,n){const A=this.hitTest(t,n);return A!=null&&A.onDoubleClick?(A.onDoubleClick(t-A.x,n-A.y),!0):!1}handleScroll(t,n,A){const i=this.hitTest(t,n);return i!=null&&i.onScroll?(i.onScroll(A),!0):!1}getHoveredId(){return this.hoveredId}clearHover(){var t;if(this.hoveredId!==null){const n=this.findById(this.hoveredId);(t=n==null?void 0:n.onMouseLeave)==null||t.call(n),this.hoveredId=null}}clearPressed(){this.pressedId=null}findById(t){for(let n=this.regions.length-1;n>=0;n--)if(this.regions[n].id===t)return this.regions[n]}}const YA=new Map;function Ua(){YA.clear()}function Fa(e,t){YA.set(e,t)}function Xa(e){return YA.get(e)??null}function ja(e){let t=null,n=null,A=null;return{openWindow:e.openWindow,closeWindow:e.closeWindow,showDialog:e.showDialog,fs:null,clipboard:{read(){const i=Xa("TEXT");return typeof i=="string"?i:""},write(i){Ua(),Fa("TEXT",i)}},camera:{async requestAccess(){try{return t=await navigator.mediaDevices.getUserMedia({video:!0,audio:!1}),e.videoElement&&(e.videoElement.srcObject=t,await e.videoElement.play()),!0}catch{return!1}},getFrame(){const i=e.videoElement;if(!i||!t)return null;const r=i.videoWidth,o=i.videoHeight;return!r||!o?null:((!n||n.width!==r||n.height!==o)&&(n=new OffscreenCanvas(r,o),A=n.getContext("2d")),A.drawImage(i,0,0),A.getImageData(0,0,r,o))},getVideoElement(){return!t||!e.videoElement?null:e.videoElement},release(){t&&(t.getTracks().forEach(i=>i.stop()),t=null),e.videoElement&&(e.videoElement.srcObject=null)}},audio:{play(i){new Audio(i).play().catch(()=>{})}},storage:{async read(i){try{return await(await(await(await navigator.storage.getDirectory()).getFileHandle(i)).getFile()).text()}catch{return null}},async write(i,r){try{const l=await(await(await navigator.storage.getDirectory()).getFileHandle(i,{create:!0})).createWritable();await l.write(r),await l.close()}catch(o){console.error("storage write error:",o)}},async list(){try{const i=await navigator.storage.getDirectory(),r=[];for await(const[o]of i.entries())r.push(o);return r}catch{return[]}}}}}function Ja(e,t){return e.x===t.x&&e.y===t.y&&e.width===t.width&&e.height===t.height}function Wi(e,t){const{baseAddr:n,rowBytes:A}=e.portBits,i=n.length/A|0,r=new zA(A,i);r.pixels=n,r.flush(t)}function Qa(e,t,n,A,i=4,r=30,o,s){return new Promise(l=>{const a=[];for(let q=0;q<=i;q++){const p=q/i,m={x:Math.round(n.x+(A.x-n.x)*p),y:Math.round(n.y+(A.y-n.y)*p),width:Math.round(n.width+(A.width-n.width)*p),height:Math.round(n.height+(A.height-n.height)*p)};m.width<2||m.height<2||a.length>0&&Ja(m,a[a.length-1])||a.push(m)}if(a.length===0){l();return}let c=0,d=null;function u(q){Or(e,q.x,q.y,q.width,q.height,"darkCheckers")}function f(){if(d&&(u(d),d=null),c>=a.length){Wi(e,t),s==null||s(),l();return}const q=a[c++];u(q),d=q,Wi(e,t),setTimeout(f,r)}f()})}const Ye="menu",Yr=1,_a=15,Nr=1,$a=15,Ur=0,tc=15,$=20,Fe=16,xn=4,eA=8,yn=24;function Fr(e){return Kt(e,Ye,Yr)}function Si(e){return Kt(e,Ye,Nr)}function Xr(e){return Kt(e,Ye,Ur)}function Oi(e,t,n,A,i){en(e,t,n,A,{font:Ye,spacing:Yr,lineHeight:_a,color:i})}function ec(e,t,n,A,i){en(e,t,n,A,{font:Ye,spacing:Nr,lineHeight:$a,color:i})}function nc(e,t,n,A,i){en(e,t,n,A,{font:Ye,spacing:Ur,lineHeight:tc,color:i})}function Ac(e){return{menus:e,openMenuIndex:null,highlightedItem:null}}function ic(e){return e===""}function rc(e){let t=0;for(const n of e.items)if(!("type"in n&&n.type==="separator"))if("type"in n&&n.type==="radiogroup")for(const A of n.items)t=Math.max(t,Si(A.label)+24);else{const A=n;let i=Si(A.label)+12;A.shortcut&&(i+=Xr(A.shortcut)+20),t=Math.max(t,i)}return Math.max(t+xn*2,100)}function oc(e){const t=[];for(const n of e.items)if("type"in n&&n.type==="separator")t.push({label:"",isSeparator:!0});else if("type"in n&&n.type==="radiogroup"){const A=n;for(const i of A.items)t.push({label:i.label,disabled:i.disabled,isRadio:!0,radioChecked:A.value===i.value,onClick:()=>A.onValueChange(i.value)})}else{const A=n;t.push({label:A.label,disabled:A.disabled,shortcut:A.shortcut,onClick:A.onClick})}return t}function sc(e,t,n,A,i,r){ot(e,0,0,A,$,B),qt(e,0,$-1,A,h),n&&Vt(e,n,10,4),i.add({id:"menubar-bg",x:0,y:0,w:A,h:$,onMouseDown:()=>{t.openMenuIndex!==null&&(t.openMenuIndex=null,t.highlightedItem=null,r())},onMouseEnter:()=>{t.openMenuIndex!==null&&t.highlightedItem!==null&&(t.highlightedItem=null,r())}});const o=t.menus.length>0&&ic(t.menus[0].label);let s=yn+8;for(let l=0;l<t.menus.length;l++){const a=l,c=t.menus[l],d=t.openMenuIndex===l;if(l===0&&o){d&&(ot(e,4,0,yn,$-1,h),n&&Lr(e,n,10,4)),i.add({id:`menubar-label-${l}`,x:4,y:0,w:yn,h:$,onMouseDown:()=>{t.openMenuIndex===a?(t.openMenuIndex=null,t.highlightedItem=null):(t.openMenuIndex=a,t.highlightedItem=null),r()},onMouseEnter:()=>{t.openMenuIndex!==null&&t.openMenuIndex!==a&&(t.openMenuIndex=a,t.highlightedItem=null,r())}});continue}const u=Fr(c.label),f=s-5,q=u+14;d?(ot(e,f,0,q,$-1,h),Oi(e,c.label,s,2,B)):Oi(e,c.label,s,2,h),i.add({id:`menubar-label-${l}`,x:f,y:0,w:q,h:$,onMouseDown:()=>{t.openMenuIndex===a?(t.openMenuIndex=null,t.highlightedItem=null):(t.openMenuIndex=a,t.highlightedItem=null),r()},onMouseEnter:()=>{t.openMenuIndex!==null&&t.openMenuIndex!==a&&(t.openMenuIndex=a,t.highlightedItem=null,r())}}),s+=u+14}if(t.openMenuIndex!==null){const l=t.menus[t.openMenuIndex],a=lc(t,t.openMenuIndex,o),c=rc(l),d=oc(l),u=d.reduce((q,p)=>q+(p.isSeparator?eA:Fe),0)+2;ot(e,a+1,$+u,c,1,h),ot(e,a+c,$+1,1,u,h),ot(e,a,$,c,u,B),Xt(e,a,$,c,u,h),qt(e,a,$,c,B),i.add({id:"menubar-dropdown-bg",x:a,y:$,w:c,h:u});let f=$+1;for(let q=0;q<d.length;q++){const p=d[q];if(p.isSeparator){Sr(e,a+1,f+eA/2,c-2,h),f+=eA;continue}const m=q,g=t.highlightedItem===q&&!p.disabled;g&&ot(e,a+1,f,c-2,Fe,h);const w=g?B:h,S=a+xn+(p.isRadio?16:0);if(ec(e,p.label,S,f,w),p.shortcut){const y=Xr(p.shortcut),v=a+c-xn-y-2;nc(e,p.shortcut,v,f,w)}if(p.isRadio&&p.radioChecked){const y=a+xn+4,v=f+6;yt(e,y,v,w),qt(e,y-1,v+1,3,w),yt(e,y,v+2,w)}p.disabled&&!g&&il(e,a+1,f,c-2,Fe,"gray50"),i.add({id:`menubar-item-${q}`,x:a,y:f,w:c,h:Fe,onMouseEnter:()=>{t.highlightedItem!==m&&(t.highlightedItem=m,r())},onMouseUp:()=>{!p.disabled&&p.onClick&&(t.openMenuIndex=null,t.highlightedItem=null,p.onClick(),r())}}),f+=Fe}}}function lc(e,t,n){let A=yn+8;for(let i=0;i<t;i++)i===0&&n||(A+=Fr(e.menus[i].label)+14);return t===0&&n?6:A}const ft="__root__",ac={text:"icon/file",image:"icon/camera",app:"icon/appstore-smr-32x32","app-shortcut":"icon/computer",binary:"icon/file"};function pA(e){return e.icon?e.icon:e.kind==="directory"?"icon/folder":ac[e.fileType]??"icon/file"}function Zi(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}const Li={text:"TEXT",image:"PICT",app:"APPL","app-shortcut":"ALIK",binary:"BINA"},Di={TEXT:"text",PICT:"image",APPL:"app",ALIK:"app-shortcut",BINA:"binary"};class cc{constructor(t,n){this.meta={version:1,nodes:{}},this.listeners=[],this.metaDirty=!1,this.flushTimer=null,this.version=0,this.backend=t,this.sprites=n}async init(){await this.backend.init();const t=await this.backend.readMeta();if(t)try{this.meta=JSON.parse(t)}catch{this.meta={version:1,nodes:{}}}this.meta.nodes[ft]||(this.meta.nodes[ft]={id:ft,name:"/",kind:"directory",parentId:null,createdAt:Date.now(),modifiedAt:Date.now()},this.schedulePersist())}getNode(t){return this.meta.nodes[t]}readDir(t){const n=[];for(const A of Object.values(this.meta.nodes))A.parentId===t&&n.push(A);return n.sort((A,i)=>A.kind!==i.kind?A.kind==="directory"?-1:1:A.name.localeCompare(i.name)),n}async readFile(t){const n=this.meta.nodes[t];return!n||n.kind!=="file"?null:this.backend.readFile(t)}resolvePath(t){const n=t.split("/").filter(Boolean);let A=ft;for(const i of n){const o=this.readDir(A).find(s=>s.name===i);if(!o)return null;A=o.id}return this.meta.nodes[A]??null}findByName(t,n){for(const A of Object.values(this.meta.nodes))if(A.parentId===t&&A.name===n)return A}async writeFile(t,n,A,i,r){const o=this.findByName(t,n),s=(o==null?void 0:o.id)??Zi(),l=Date.now(),a={id:s,name:n,kind:"file",parentId:t,createdAt:(o==null?void 0:o.createdAt)??l,modifiedAt:l,fileType:i,size:A.length,icon:r==null?void 0:r.icon,mimeType:r==null?void 0:r.mimeType};return this.meta.nodes[s]=a,await this.backend.writeFile(s,A),this.schedulePersist(),this.notify(),a}async writeImage(t,n,A,i){const r=JSON.stringify(A),o=await this.writeFile(t,n,r,"image",i),s=G(A.width,A.height,A.data);return this.sprites.register(`fs:${o.id}`,s),o}async loadSprite(t){const n=`fs:${t}`,A=this.sprites.get(n);if(A)return A;const i=await this.readFile(t);if(!i)return null;try{const r=JSON.parse(i),o=G(r.width,r.height,r.data);return this.sprites.register(n,o),o}catch{return null}}mkdir(t,n){const A=this.findByName(t,n);if(A&&A.kind==="directory")return A;const i=Zi(),r=Date.now(),o={id:i,name:n,kind:"directory",parentId:t,createdAt:r,modifiedAt:r};return this.meta.nodes[i]=o,this.schedulePersist(),this.notify(),o}rename(t,n){const A=this.meta.nodes[t];!A||t===ft||(A.name=n,A.modifiedAt=Date.now(),this.schedulePersist(),this.notify())}move(t,n){const A=this.meta.nodes[t];!A||t===ft||(A.parentId=n,A.position=void 0,A.modifiedAt=Date.now(),this.schedulePersist(),this.notify())}setPosition(t,n){const A=this.meta.nodes[t];!A||t===ft||(A.position=n,this.schedulePersist(),this.notify())}clearPositions(t){for(const n of Object.values(this.meta.nodes))n.parentId===t&&n.position&&(n.position=void 0);this.schedulePersist(),this.notify()}async remove(t){if(t===ft)return;const n=this.meta.nodes[t];if(n){if(n.kind==="directory"){const A=this.readDir(t);for(const i of A)await this.remove(i.id)}else await this.backend.deleteFile(t);delete this.meta.nodes[t],this.schedulePersist(),this.notify()}}onChange(t){return this.listeners.push(t),()=>{this.listeners=this.listeners.filter(n=>n!==t)}}notify(){this.version++;for(const t of this.listeners)try{t()}catch{}}schedulePersist(){this.metaDirty=!0,!this.flushTimer&&(this.flushTimer=setTimeout(()=>{this.flushTimer=null,this.metaDirty&&(this.metaDirty=!1,this.backend.writeMeta(JSON.stringify(this.meta)).catch(t=>console.error("FileManager persist error:",t)))},500))}async flush(){this.flushTimer&&(clearTimeout(this.flushTimer),this.flushTimer=null),this.metaDirty&&(this.metaDirty=!1,await this.backend.writeMeta(JSON.stringify(this.meta)))}FSMakeFSSpec(t){return{path:t}}async FSpCreate(t,n,A){const{parentPath:i,name:r}=this._splitPath(t.path),o=this._resolveDir(i);if(!o)throw new Error(`Directory not found: ${i}`);const s=Di[A]??"binary";await this.writeFile(o.id,r,"",s)}async FSpDelete(t){const n=this.resolvePath(t.path);if(!n)throw new Error(`Not found: ${t.path}`);await this.remove(n.id)}async FSRead(t){const n=this.resolvePath(t.path);return!n||n.kind!=="file"?null:this.readFile(n.id)}async FSWrite(t,n){const A=this.resolvePath(t.path);if(A&&A.kind==="file"){const i=A,{parentPath:r,name:o}=this._splitPath(t.path),s=this._resolveDir(r);s&&await this.writeFile(s.id,o,n,i.fileType)}else{const{parentPath:i,name:r}=this._splitPath(t.path),o=this._resolveDir(i);if(!o)throw new Error(`Directory not found: ${i}`);await this.writeFile(o.id,r,n,"text")}}async FSpGetFInfo(t){const n=this.resolvePath(t.path);if(!n||n.kind!=="file")throw new Error(`File not found: ${t.path}`);return{fdType:Li[n.fileType]??"BINA",fdCreator:"MOCK"}}async FSpSetFInfo(t,n){const A=this.resolvePath(t.path);if(!A||A.kind!=="file")throw new Error(`File not found: ${t.path}`);const i=A,r=Di[n.fdType];r&&(i.fileType=r)}async PBGetCatInfo(t){const n=this.resolvePath(t.path);if(!n)throw new Error(`Not found: ${t.path}`);if(n.kind==="file"){const A=n;return{name:n.name,kind:"file",size:A.size,createdAt:n.createdAt,modifiedAt:n.modifiedAt,fdType:Li[A.fileType]??"BINA",fdCreator:"MOCK"}}return{name:n.name,kind:"directory",size:0,createdAt:n.createdAt,modifiedAt:n.modifiedAt,fdType:"",fdCreator:""}}DirCreate(t){const{parentPath:n,name:A}=this._splitPath(t.path),i=this._resolveDir(n);if(!i)throw new Error(`Directory not found: ${n}`);this.mkdir(i.id,A)}_splitPath(t){const n=t.split("/").filter(Boolean),A=n.pop()??"";return{parentPath:"/"+n.join("/"),name:A}}_resolveDir(t){return t==="/"||t===""?this.getNode(ft)??null:this.resolvePath(t)}}const dc="mockintosh-fs",uc="files",nA="meta.json";class fc{constructor(){this.rootHandle=null,this.filesHandle=null}async init(){const t=await navigator.storage.getDirectory();this.rootHandle=await t.getDirectoryHandle(dc,{create:!0}),this.filesHandle=await this.rootHandle.getDirectoryHandle(uc,{create:!0})}async readMeta(){try{return await(await(await this.rootHandle.getFileHandle(nA)).getFile()).text()}catch{return null}}async writeMeta(t){const A=await(await this.rootHandle.getFileHandle(nA,{create:!0})).createWritable();await A.write(t),await A.close()}async readFile(t){try{return await(await(await this.filesHandle.getFileHandle(t)).getFile()).text()}catch{return null}}async writeFile(t,n){const i=await(await this.filesHandle.getFileHandle(t,{create:!0})).createWritable();await i.write(n),await i.close()}async deleteFile(t){try{await this.filesHandle.removeEntry(t)}catch{}}async hasMetaFile(){try{return await this.rootHandle.getFileHandle(nA),!0}catch{return!1}}}class pc{constructor(t,n){this.loaded=new Set,this.spriteRegistry=t,this.appRegistry=n}async load(t){if(this.loaded.has(t.id)){const i=this.appRegistry.get(t.id);if(i)return i}const n=await import(t.entry);n.sprites&&typeof n.sprites=="object"&&this.spriteRegistry.registerAll(n.sprites);const A=n.default;if(!A||typeof A!="object")throw new Error(`Invalid app bundle for "${t.id}": no default export`);if(!A.id||typeof A.id!="string")throw new Error(`Invalid app bundle for "${t.id}": missing or invalid "id"`);if(typeof A.render!="function")throw new Error(`Invalid app bundle for "${t.id}": missing "render" function`);if(!A.title||!A.icon||!A.defaultSize)throw new Error(`Invalid app bundle for "${t.id}": missing required fields (title, icon, defaultSize)`);return this.appRegistry.register(A),this.loaded.add(t.id),A}async loadAll(t){const n=await Promise.allSettled(t.map(A=>this.load(A)));for(let A=0;A<n.length;A++){const i=n[A];i.status==="rejected"&&console.error(`[AppLoader] Failed to load "${t[A].id}":`,i.reason)}}isLoaded(t){return this.loaded.has(t)}}const jr="mockintosh-system-preferences.json",qA={colorMode:Fo()};async function qc(){try{const A=await(await(await(await navigator.storage.getDirectory()).getFileHandle(jr)).getFile()).text(),i=JSON.parse(A);return{colorMode:i.colorMode==="colors"||i.colorMode==="monochrome"?i.colorMode:qA.colorMode}}catch{return{...qA}}}async function mc(e){try{const A=await(await(await navigator.storage.getDirectory()).getFileHandle(jr,{create:!0})).createWritable();await A.write(JSON.stringify(e)),await A.close()}catch(t){console.error("system preferences write error:",t)}}let Vn=null;function hc(e){Vn=e}const gc={id:"splashscreen",title:"Splashscreen",icon:"",defaultSize:{width:512,height:342},render(e,t){t.clear(B);const n=Vn==null?void 0:Vn.get("icon/happy");if(n){const A=Math.floor((t.width-n.width)/2),i=Math.floor((t.height-n.height)/2);t.blit(n,A,i)}}},Hn=32,Ki=32,xc=32,ke=8,wt=80,Be=56,kt=16,Mt=84,re=64,Bi=4,it="__desktop__";function Ne(e,t){return e.readDir(t).map(A=>({title:A.name,img:pA(A),nodeId:A.id,isDirectory:A.kind==="directory",position:A.position}))}function dn(e){const t=[],n=e.readDir(ft);for(const i of n)t.push({title:i.name,img:pA(i),nodeId:i.id,isDirectory:!0,isVolume:!0,position:i.position});for(const i of n){if(i.kind!=="directory")continue;const r=e.findByName(i.id,"Desktop Folder");if(!r)continue;const o=e.readDir(r.id);for(const s of o)t.push({title:s.name,img:pA(s),nodeId:s.id,isDirectory:s.kind==="directory",isVolume:!1,position:s.position})}const A=He(e);return A&&t.push({title:"Trash",img:"icon/trash",nodeId:A,isDirectory:!0,isVolume:!1}),t}function Jr(e){const t=e.findByName(ft,"Mockintosh HD");if(!t)return;const n=e.findByName(t.id,"Desktop Folder");return n==null?void 0:n.id}function He(e){const t=e.findByName(ft,"Mockintosh HD");if(!t)return;const n=e.findByName(t.id,"Trash");return n==null?void 0:n.id}function yc(e){const t=e.screenHeight-e.menubarHeight,n=Math.max(1,Math.floor((t-ke)/re)),A=e.screenWidth-Mt,i=(n-1)*re+ke;return{x:A,y:i}}function Qr(e,t,n,A){const i=A-n,r=Math.floor((i-ke)/re),o=Math.floor(e/Math.max(1,r)),s=e%Math.max(1,r);return{x:t-(o+1)*Mt,y:s*re+ke}}function Ee(e,t,n){return{x:e+Math.floor((n-Ki)/2),y:t,w:Ki,h:xc}}function _r(e,t){const n=e%t,A=Math.floor(e/t);return{x:kt+n*wt,y:kt+A*Be}}function rn(e,t,n){if(He(n.fs)===e.nodeId){const A=n.fs.getNode(e.nodeId);return(A==null?void 0:A.position)??yc(n)}return e.position?e.position:Qr(t,n.screenWidth,n.menubarHeight,n.screenHeight)}function Pe(e,t,n){return e.position?e.position:_r(t,n)}const mA=400,Hi=128;function Vc(e,t,n){const A=ke,i=n-Mt,r=Math.round((i-e)/Mt),o=Math.round((t-A)/re);return{col:Math.max(0,r),row:Math.max(0,o)}}function bc(e,t){const n=Math.round((e-kt)/wt),A=Math.round((t-kt)/Be);return{col:Math.max(0,n),row:Math.max(0,A)}}function Ei(e){const t=dn(e.fs),n=new Set;for(let l=0;l<t.length;l++){const a=rn(t[l],l,e),c=Vc(a.x,a.y,e.screenWidth);n.add(`${c.col},${c.row}`)}const A=e.screenHeight-e.menubarHeight,i=Math.max(1,Math.floor((A-ke)/re)),r=e.screenWidth-Mt,o=ke,s=Math.max(1,Math.floor(r/Mt));for(let l=0;l<i;l++)for(let a=0;a<s;a++)if(!n.has(`${a},${l}`))return{x:r-a*Mt,y:o+l*re};return{x:r-(s-1)*Mt,y:o+(i-1)*re}}function Pi(e,t,n){const A=Ne(e.fs,t),i=Math.max(1,Math.floor((n-kt)/wt)),r=new Set;for(let o=0;o<A.length;o++){const s=Pe(A[o],o,i),l=bc(s.x,s.y);r.add(`${l.col},${l.row}`)}for(let o=0;o<Hi;o++)for(let s=0;s<i;s++)if(!r.has(`${s},${o}`))return{x:kt+s*wt,y:kt+o*Be};return{x:kt+(i-1)*wt,y:kt+(Hi-1)*Be}}function wc(e,t,n){if(n){if(t){const A=dn(e.fs),i=He(e.fs);for(let r=0;r<A.length;r++){if(A[r].nodeId===i)continue;const o=Qr(r,e.screenWidth,e.menubarHeight,e.screenHeight);e.fs.setPosition(A[r].nodeId,o)}}else{const A=Ne(e.fs,n),i=mA-2-ut,r=Math.max(1,Math.floor((i-kt)/wt));for(let o=0;o<A.length;o++){const s=_r(o,r);e.fs.setPosition(A[o].nodeId,s)}}e.scheduleRender()}}const vc={id:"finder",title:"Finder",icon:"icon/folder",renderWindow(e,t,n,A,i){const r=i._finderServices;r&&(A===it?Cc(e,t,n,r):Sc(e,t,n,A,i,r))},onWindowEvent(e,t,n,A,i,r){const o=i._finderServices;o&&(A===it?Wc(e,t,n,o):Oc(e,t,n,A,i,o,r))},getContentHeight(e,t,n,A,i){if(n===it)return 0;const r=A._finderServices;if(!r)return 0;const o=A.directoryId,s=t.useMemo(()=>o?Ne(r.fs,o):[],[o,r.fs.version]),l=i.width-2-ut,a=Math.max(1,Math.floor((l-kt)/wt));let c=0;for(let d=0;d<s.length;d++){const f=Pe(s[d],d,a).y+Be;f>c&&(c=f)}return c+kt},getMenubar(e,t,n,A){const i=A._finderServices;if(!i)return[];const r=n===it,o=r?Jr(i.fs):A.directoryId;return[{label:"File",items:[{label:"New Folder",shortcut:"⌘N",disabled:!o,onClick:async()=>{if(!o)return;const l=await i.os.showDialog({message:"Name for new folder:",buttons:["Cancel","OK"],showInput:!0,inputDefault:"untitled folder"});if(l&&l!=="Cancel"){const a=i.fs.mkdir(o,l),c=r?Ei(i):Pi(i,o,mA-2-ut);i.fs.setPosition(a.id,c)}}},{label:"New Text File",disabled:!o,onClick:async()=>{if(!o)return;const l=await i.os.showDialog({message:"Name for new file:",buttons:["Cancel","OK"],showInput:!0,inputDefault:"untitled.txt"});if(l&&l!=="Cancel"){const a=await i.fs.writeFile(o,l,"","text"),c=r?Ei(i):Pi(i,o,mA-2-ut);i.fs.setPosition(a.id,c)}}},{type:"separator"},{label:"Open",shortcut:"⌘O",disabled:!0},{label:"Close",disabled:!0}]},{label:"Edit",items:[{label:"Undo",shortcut:"⌘Z",disabled:!0},{label:"Cut",shortcut:"⌘X",disabled:!0},{label:"Copy",shortcut:"⌘C",disabled:!0},{label:"Paste",shortcut:"⌘V",disabled:!0}]},{label:"View",items:[{label:"By Icon",disabled:!0},{label:"By Name",disabled:!0},{label:"By Date",disabled:!0}]},{label:"Special",items:[{label:r?"Clean Up Desktop":"Clean Up Window",disabled:!o,onClick:()=>{wc(i,r,o)}},{label:"Empty Trash",disabled:(()=>{const l=He(i.fs);return!l||i.fs.readDir(l).length===0})(),onClick:async()=>{const l=He(i.fs);if(!l)return;const a=i.fs.readDir(l);for(const c of a)await i.fs.remove(c.id);i.scheduleRender()}},{type:"separator"},{label:"Format Drive…",onClick:()=>void i.formatDrive()},{type:"separator"},{label:"Restart",disabled:!0},{label:"Shut Down",disabled:!0}]}]},getInfoBar(e,t,n,A){return null},getContentTopInset(e,t,n,A,i){return n===it?0:De}},kc={drag:null,dropTarget:null,pendingDrag:null};function se(){return kc}function Ic(e){const t=se();return t.drag!==null||t.pendingDrag!==null}function NA(e,t,n,A){const i=se();if(i.pendingDrag&&!i.drag){const r=Math.abs(t-i.pendingDrag.startScreenX),o=Math.abs(n-i.pendingDrag.startScreenY);(r>=Bi||o>=Bi)&&(i.drag={fsNodeId:i.pendingDrag.fsNodeId,sourceDirectoryId:i.pendingDrag.sourceDirectoryId,img:i.pendingDrag.img,title:i.pendingDrag.title,screenX:t,screenY:n,offsetX:i.pendingDrag.offsetX,offsetY:i.pendingDrag.offsetY},i.pendingDrag=null)}i.drag&&(i.drag.screenX=t,i.drag.screenY=n,i.dropTarget=Mc(t,n,A),A.scheduleRender())}function UA(e,t,n,A){const i=se();if(i.pendingDrag=null,!i.drag)return;const r=i.drag,o=i.dropTarget;if(i.drag=null,i.dropTarget=null,o&&He(A.fs)!==r.fsNodeId){A.fs.move(r.fsNodeId,o.nodeId),A.scheduleRender();return}const s=r.screenX-r.offsetX,l=r.screenY-r.offsetY,a=A.getOpenFolderWindows();for(let d=a.length-1;d>=0;d--){const u=a[d];if(t>=u.contentX&&t<u.contentX+u.contentW&&n>=u.contentY&&n<u.contentY+u.contentH){const f=u.contentTopInset??0,q=s-u.contentX+u.scrollX,p=l-u.contentY-f+u.scrollY;r.sourceDirectoryId!==u.directoryId&&A.fs.move(r.fsNodeId,u.directoryId),A.fs.setPosition(r.fsNodeId,{x:q,y:p}),A.scheduleRender();return}}const c=l-A.menubarHeight;if(r.sourceDirectoryId===it)A.fs.setPosition(r.fsNodeId,{x:s,y:c});else{const d=Jr(A.fs);d&&(A.fs.move(r.fsNodeId,d),A.fs.setPosition(r.fsNodeId,{x:s,y:c}))}A.scheduleRender()}function zc(e,t,n){const i=se().drag;if(!i)return;const r=n.sprites.get(i.img);if(!r)return;const o=i.screenX-i.offsetX,s=i.screenY-i.offsetY,l=i.sourceDirectoryId===it?Mt:wt,a=o+Math.floor((l-Hn)/2),d=Kt(i.title,"body")+4,u=12,f=o+Math.floor((l-d)/2),q=s+Hn,p=Math.min(a,f),m=Math.min(s,q),g=Math.max(a+r.width,f+d),w=Math.max(s+r.height,q+u),S=g-p,y=w-m;if(S<=0||y<=0)return;const v=new Uint8Array(S*y);if(r.mask){const C=a-p,W=s-m;for(let b=0;b<r.height;b++){const k=b*r.width,V=(W+b)*S+C;for(let z=0;z<r.width;z++)r.mask[k+z]&&(v[V+z]=1)}}if(d>0&&u>0){const C=f-p,W=q-m;for(let b=0;b<u;b++){const k=(W+b)*S+C;v.fill(1,k,k+d)}}ol(t,v,S,y,p,m,h)}function Mc(e,t,n){const i=se().drag;if(!i)return null;const r=n.getOpenFolderWindows();for(let l=r.length-1;l>=0;l--){const a=r[l];if(e>=a.contentX&&e<a.contentX+a.contentW&&t>=a.contentY&&t<a.contentY+a.contentH){const c=a.contentTopInset??0,d=e-a.contentX+a.scrollX,u=t-a.contentY-c+a.scrollY,f=Ne(n.fs,a.directoryId),q=Math.max(1,Math.floor((a.contentW-kt)/wt));for(let p=0;p<f.length;p++){const m=f[p];if(m.nodeId===i.fsNodeId||!m.isDirectory)continue;const g=Pe(m,p,q),w=Ee(g.x,g.y,wt);if(d>=w.x&&d<w.x+w.w&&u>=w.y&&u<w.y+w.h)return{nodeId:m.nodeId}}break}}const o=dn(n.fs),s=t-n.menubarHeight;for(let l=0;l<o.length;l++){const a=o[l];if(a.nodeId===i.fsNodeId||!a.isDirectory&&!a.isVolume)continue;const c=rn(a,l,n),d=Ee(c.x,c.y,Mt);if(e>=d.x&&e<d.x+d.w&&s>=d.y&&s<d.y+d.h)return{nodeId:a.nodeId}}return null}function Cc(e,t,n,A){n.fillPattern(0,0,n.width,n.height,"checkers");const i=t.useMemo(()=>dn(A.fs),[A.fs.version]),[r,o]=t.useState(null),s=t.useMemo(()=>new Set,[]),a=se().dropTarget;for(let c=0;c<i.length;c++){const d=i[c],u=rn(d,c,A),f=r===d.nodeId,q=s.has(d.title),p=(a==null?void 0:a.nodeId)===d.nodeId;$r(n,A.sprites,d,u.x,u.y,Mt,f,p,q)}}function Wc(e,t,n,A,i){const r=t.useMemo(()=>dn(A.fs),[A.fs.version]),[o,s]=t.useState(null),l=se();if(n.type==="mouseDown"){const a=n.x,c=n.y,d=c-A.menubarHeight;let u=null,f=null;for(let q=0;q<r.length;q++){const p=rn(r[q],q,A),m=Ee(p.x,p.y,Mt);if(a>=m.x&&a<m.x+m.w&&d>=m.y&&d<m.y+m.h){u=r[q],f=p;break}}u&&f?(s(u.nodeId),l.pendingDrag={fsNodeId:u.nodeId,sourceDirectoryId:it,img:u.img,title:u.title,startScreenX:a,startScreenY:c,offsetX:a-f.x,offsetY:d-f.y}):(s(null),l.pendingDrag=null)}if(n.type==="mouseMove"&&NA(e,n.x,n.y,A),n.type==="mouseUp"&&UA(e,n.x,n.y,A),n.type==="doubleClick"){const a=n.x,c=n.y-A.menubarHeight;if(l.drag)return;for(let d=0;d<r.length;d++){const u=rn(r[d],d,A),f=Ee(u.x,u.y,Mt);if(a>=f.x&&a<f.x+f.w&&c>=f.y&&c<f.y+f.h){A.openFSNode(r[d].nodeId,{x:u.x,y:u.y+A.menubarHeight,width:Mt,height:re});return}}}}function Sc(e,t,n,A,i,r){const o=i.directoryId,s=t.useMemo(()=>o?Ne(r.fs,o):[],[o,r.fs.version]),[l,a]=t.useState(null),d=se().dropTarget;n.clear(B);const u=[`${s.length} item${s.length!==1?"s":""}`,"2,427K in disk","7,648K available"];if(n.drawHLine(0,De-1,n.width,h),u.length>0){const q=Math.floor((n.width-2)/u.length);for(let p=0;p<u.length;p++){const m=Kt(u[p],"body"),g=1+p*q+Math.floor((q-m)/2);n.drawText(u[p],g,4,{font:"body",color:h}),p<u.length-1&&n.drawVLine(1+(p+1)*q,0,De-1,h)}}const f=Math.max(1,Math.floor((n.width-kt)/wt));n.drawScrollableContent(q=>{for(let p=0;p<s.length;p++){const m=s[p],g=Pe(m,p,f),w=l===m.nodeId,S=(d==null?void 0:d.nodeId)===m.nodeId;$r(q,r.sprites,m,g.x,g.y,wt,w,S,!1)}})}function Oc(e,t,n,A,i,r,o){const s=i.directoryId,l=t.useMemo(()=>s?Ne(r.fs,s):[],[s,r.fs.version]),[a,c]=t.useState(null),d=se(),u=o.width-2-ut,f=Math.max(1,Math.floor((u-kt)/wt)),q=o.contentOriginX??0,p=o.contentOriginY??0,m=o.contentTopInset??0,g=o.scrollY??0,w=y=>m>0?p+m+y-g:p+y,S=n.contentRegion!=="fixed"&&(n.contentRegion==="scrollable"||m===0);if(n.type==="mouseDown")if(!S)c(null),d.pendingDrag=null;else{const y=n.x,v=n.y;let C=null,W=null;for(let b=0;b<l.length;b++){const k=Pe(l[b],b,f),V=Ee(k.x,k.y,wt);if(y>=V.x&&y<V.x+V.w&&v>=V.y&&v<V.y+V.h){C=l[b],W=k;break}}if(C&&W){c(C.nodeId);const b=y+q,k=w(v);d.pendingDrag={fsNodeId:C.nodeId,sourceDirectoryId:s??"",img:C.img,title:C.title,startScreenX:b,startScreenY:k,offsetX:y-W.x,offsetY:v-W.y}}else c(null),d.pendingDrag=null}if(n.type==="mouseMove"&&S){const y=n.x+q,v=w(n.y);NA(e,y,v,r)}if(n.type==="mouseUp"&&S){const y=n.x+q,v=w(n.y);UA(e,y,v,r)}if(n.type==="doubleClick"&&S){const y=n.x,v=n.y;if(d.drag)return;for(let C=0;C<l.length;C++){const W=Pe(l[C],C,f),b=Ee(W.x,W.y,wt);if(y>=b.x&&y<b.x+b.w&&v>=b.y&&v<b.y+b.h){r.openFSNode(l[C].nodeId,{x:q+W.x,y:w(W.y),width:wt,height:Be});return}}}}function $r(e,t,n,A,i,r,o,s,l){const a=t.get(n.img);if(a){const f=A+Math.floor((r-Hn)/2);s?e.blitInverted(a,f,i):l?e.blitShadowOutline(a,f,i):o?e.blitInverted(a,f,i):e.blit(a,f,i)}const c=Kt(n.title,"body"),d=A+Math.floor((r-c)/2),u=i+Hn;o||s?e.drawText(n.title,d,u,{font:"body",color:B,bg:h,width:c+4,align:"center",lineHeight:12}):e.drawText(n.title,d,u,{font:"body",color:h,bg:B,width:c+4,align:"center",lineHeight:12})}const Zc={id:"file",title:"File",icon:"icon/file",defaultSize:{width:350,height:200},scrollable:!0,render(e,t,n){const A=n._fs,i=n.fileId,[r,o]=e.useState(n.content??"");e.useEffect(()=>{A&&i&&!n.content&&A.readFile(i).then(s=>{s!==null&&o(s)})},[i]),t.clear(B),t.drawTextBlock({text:r,x:8,y:8,maxWidth:t.width-16,font:"body"})},getContentHeight(e,t,n){const[A]=e.useState(t.content??"");return e.useMemo(()=>Hr(A,n.width-16,"body"),[A,n.width])+16}},Lc="0.4.0",Dc={version:Lc},Kc=Dc.version,Bc=[{username:"gustavlrsn",commits:74}],Hc={id:"about",title:"About This Mockintosh",icon:"icon/computer",defaultSize:{width:343,height:160},scrollable:!1,render(e,t,n){const A=n._sprites;t.clear(B);const i=A==null?void 0:A.get("icon/computer");i&&t.blit(i,16,8),t.drawText("Mockintosh Classic",56,8,{font:"body",color:h}),t.drawText(`System Version ${Kc}`,180,8,{font:"body",color:h}),t.drawText("Contributors",16,36,{font:"body",color:h}),t.drawHLine(0,50,t.width,h);let r=56;for(const o of Bc){const s=A==null?void 0:A.get("user2");s&&t.blit(s,16,r),t.drawText(`@${o.username}`,36,r,{font:"body",color:h});const l=`${o.commits} commits`,a=Q(l,"body");t.drawText(l,t.width-a-16,r,{font:"body",color:h}),r+=16}}},Se=64,Le=90,Qe=20;function Ti(e,t,n,A,i){e.drawRect(t,n,Le,Qe,h),i&&e.fillRect(t+1,n+1,Le-2,Qe-2,h),e.drawText(A,t+8,n+5,{font:"body",color:i?B:h})}const Ec={id:"control_panel",title:"Control Panel",icon:"icon/computer",defaultSize:{width:320,height:200},scrollable:!1,render(e,t,n){var y;const A=n._sprites,[i]=e.useState("General"),r=((y=n._systemPreferences)==null?void 0:y.colorMode)??"monochrome";t.clear(B),t.drawVLine(Se,0,t.height,h),t.drawVLine(Se+1,0,t.height,h);const o=A==null?void 0:A.get("icon/computer");if(o){const v=Math.floor((Se-32)/2);i==="General"?t.blitInverted(o,v,8):t.blit(o,v,8)}const s=i==="General"?B:h,l=i==="General"?h:null;t.drawText("General",4,44,{font:"body",color:s,bg:l,width:Se-8,align:"center"});const a=Se+8;t.drawText("Desktop pattern",a,8,{font:"body",color:h});const c=a,d=24,u=4,f=1,q=8*u+7*f;t.drawRect(c,d,q+2,q+2,h);for(let v=0;v<8;v++)for(let C=0;C<8;C++){const W=(C+v)%2===0,b=c+1+C*(u+f),k=d+1+v*(u+f);t.fillRect(b,k,u,u,W?h:B)}const p=d+q+18;t.drawText("Color mode",a,p,{font:"body",color:h});const m=p+16;Ti(t,a,m,"monochrome",r==="monochrome"),Ti(t,a+Le+8,m,"colors",r==="colors"),t.hitRegion("control-panel-mode-monochrome",{x:a,y:m,w:Le,h:Qe},{onClick:()=>{var v;return(v=n._setColorMode)==null?void 0:v.call(n,"monochrome")}}),t.hitRegion("control-panel-mode-colors",{x:a+Le+8,y:m,w:Le,h:Qe},{onClick:()=>{var v;return(v=n._setColorMode)==null?void 0:v.call(n,"colors")}});const g=m+Qe+14;t.drawText("Preview",a,g,{font:"body",color:h});const w=g+16,S=[2,3,4,7,8,9];for(let v=0;v<S.length;v++){const C=a+v*18;t.fillRect(C,w,14,14,S[v]),t.drawRect(C,w,14,14,h)}},onEvent(e,t,n){if(t.type==="mouseDown"){const[,A]=e.useState("General");t.x<Se&&A("General")}}},vt=288,Yt=288,Pc=3,Tc=66;function Rc(e,t,n){const A=e.current;if(A&&A.dst.canvas.width===t&&A.dst.canvas.height===n)return A;const i=new OffscreenCanvas(t,n),r=i.getContext("2d",{willReadFrequently:!0});return e.current={dst:{canvas:i,ctx:r},pixels:new Uint8Array(t*n),luminance:new Float32Array(t*n)},e.current}function Gc(e,t,n,A,i){const r=t*n;for(let o=0;o<r;o++){const s=o<<2;i[o]=e[s]*.299+e[s+1]*.587+e[s+2]*.114}for(let o=0;o<r;o++){const s=i[o],l=s<129?1:0;A[o]=l;const a=(s-(l?0:255))/8;i[o+1]+=a,i[o+2]+=a,i[o+t-1]+=a,i[o+t]+=a,i[o+t+1]+=a,i[o+(t<<1)]+=a}}const Yc=[[15,135,45,165],[195,75,225,105],[60,180,30,150],[240,120,210,90]];function Nc(e,t,n,A,i){const r=t*n;for(let o=0;o<r;o++){const s=o<<2,l=e[s]*.299+e[s+1]*.587+e[s+2]*.114,a=o%t,c=o/t|0,d=l+Yc[a&3][c&3]>>1;A[o]=d<i?1:0}}function Uc(e,t,n){const A=e.videoWidth,i=e.videoHeight,{dst:r,pixels:o,luminance:s}=t,l=r.canvas.width,a=r.canvas.height,c=Math.min(A,i),d=A-c>>1,u=i-c>>1,{ctx:f}=r;f.setTransform(-1,0,0,1,l,0),f.drawImage(e,d,u,c,c,0,0,l,a);const q=f.getImageData(0,0,l,a);n==="bayer"?Nc(q.data,l,a,o,128):(s.fill(0),Gc(q.data,l,a,o,s))}const Fc={id:"photobooth",title:"Photo Booth",icon:"icon/photobooth-smr-32",defaultSize:{width:vt,height:Yt+40},scrollable:!1,render(e,t,n){const A=n._os,[i,r]=e.useState(!0),[o,s]=e.useState(""),[l,a]=e.useState(null),[c,d]=e.useState(null),[u,f]=e.useState([]),[q,p]=e.useState(!1),[m,g]=e.useState("atkinson"),w=e.useRef(null),S=e.useRef(null),y=e.useRef(null),v=e.useRef("");if(t.clear(B),e.useEffect(()=>{let z=!1;return(async()=>{const E=await A.camera.requestAccess();z||(E||s("Camera access denied."),r(!1))})(),()=>{z=!0,A.camera.release()}},[]),e.useEffect(()=>{if(i||o)return;let z=!1,E=0;function K(){if(z)return;const D=performance.now();if(D-E>=Tc){const H=A.camera.getVideoElement();if(H&&H.videoWidth>0){const N=Rc(y,vt,Yt);Uc(H,N,m)}E=D,e.scheduleRender()}w.current=requestAnimationFrame(K)}return K(),()=>{z=!0,w.current!==null&&cancelAnimationFrame(w.current)}},[m,i,o]),q){t.fillRect(0,0,t.width,t.height,B);return}if(c!==null&&u.length>c){const z=u[c];z.imageData&&t.blitImageData(z.imageData,0,0)}else y.current&&t.blit1bitPixels(y.current.pixels,vt,Yt,0,0);if(i&&t.drawText("Initializing camera...",vt/2-60,Yt/2-6,{font:"menu",color:h,bg:B}),o&&t.drawText(o,8,Yt/2,{font:"menu",color:h,bg:B}),l!==null&&l>0){const z=String(l);t.fillRect(vt/2-14,Yt/2-12,28,24,B),t.drawText(z,vt/2-4,Yt/2-8,{font:"menu",color:h})}const C=Yt;t.fillRect(0,C,t.width,40,B),t.drawHLine(0,C,t.width,h);const W=C+8,b=24,k=t.getWindow();if(k!==null){const z=c===null?`list-${u.length}`:`view-${c}-${u.length}`;if(v.current!==z&&(k.controlList.length=0,v.current=z),k.controlList.length===0)if(c===null){const E=lt(k,F(W,vt/2-30,W+b,vt/2+30),"Snap",!0,0,0,1,0,0);if(E.ref.contrlAction=(K,D)=>{D===pt&&l===null&&!i&&!o&&Xc(a,S,()=>V())},u.length>0){const K=lt(k,F(W,vt-64,W+b,vt-8),`${u.length} pic${u.length>1?"s":""}`,!0,0,0,1,0,0);K.ref.contrlAction=(D,H)=>{H===pt&&d(u.length-1)}}}else{const E=lt(k,F(W,8,W+20,72),"Delete",!0,0,0,1,0,0);E.ref.contrlAction=(N,X)=>{if(X===pt){const L=u.filter((R,j)=>j!==c);f(L),d(L.length>0?Math.min(c,L.length-1):null)}};const K=lt(k,F(W,72,W+20,128),"Save",!0,0,0,1,0,0);K.ref.contrlAction=(N,X)=>{X===pt&&jc(A,u[c])};let D=128;if(c>0){const N=lt(k,F(W,D,W+20,D+32),"<",!0,0,0,1,0,0);N.ref.contrlAction=(X,L)=>{L===pt&&d(c-1)},D+=32}if(c<u.length-1){const N=lt(k,F(W,D,W+20,D+32),">",!0,0,0,1,0,0);N.ref.contrlAction=(X,L)=>{L===pt&&d(c+1)},D+=32}const H=lt(k,F(W,vt-52,W+20,vt),"Back",!0,0,0,1,0,0);H.ref.contrlAction=(N,X)=>{X===pt&&d(null)}}if(c===null&&k.controlList.length>0){const E=l!==null&&l>0;k.controlList[0].ref.contrlTitle=E?String(l):"Snap",k.controlList[0].ref.contrlHilite=E||i||o?255:0,u.length>0&&k.controlList[1]&&(k.controlList[1].ref.contrlTitle=`${u.length} pic${u.length>1?"s":""}`)}qe(k,t.port)}c!==null&&t.drawText(`${c+1}/${u.length}`,vt/2-12,C+12,{font:"body",color:h});function V(){if(!y.current)return;const z=y.current.pixels,E=new ImageData(vt,Yt),K=E.data;for(let D=0,H=vt*Yt;D<H;D++){const N=z[D]?0:255,X=D<<2;K[X]=N,K[X+1]=N,K[X+2]=N,K[X+3]=255}p(!0),setTimeout(()=>p(!1),120),f(D=>[...D,{imageData:E,timestamp:Date.now()}])}},onEvent(e,t,n,A){e.useState(!0),e.useState(""),e.useState(null),e.useState(null),e.useState([]),e.useState(!1),e.useState("atkinson"),e.useRef(null),e.useRef(null),e.useRef(null),e.useRef("")},getMenubar(e,t){e.useState(!0),e.useState("");const[n]=e.useState(null);e.useState(null),e.useState([]),e.useState(!1);const[A,i]=e.useState("atkinson");return e.useRef(null),e.useRef(null),e.useRef(null),e.useRef(""),[{label:"File",items:[{label:"Take Photo",shortcut:"T",disabled:n!==null,onSelect:()=>{}}]},{label:"Dithering",items:[{type:"radiogroup",value:A,onValueChange:r=>i(r),items:[{label:"Atkinson",value:"atkinson"},{label:"Bayer",value:"bayer"}]}]}]}};function Xc(e,t,n){let A=Pc;e(A);function i(){A--,A<=0?(e(null),n()):(e(A),t.current=setTimeout(i,1e3))}t.current=setTimeout(i,1e3)}async function jc(e,t){if(!e.fs||!t)return;const n=new Date(t.timestamp),A=`Photo ${n.toLocaleDateString()} ${n.toLocaleTimeString()}`,i=t.imageData.width,r=t.imageData.height,o=i*r,s=Math.ceil(o/4),l=new Uint8Array(s),a=t.imageData.data;for(let d=0;d<o;d++){const f=a[d*4]<128?2:1,q=Math.floor(d/4),p=6-d%4*2;l[q]|=f<<p}const c=btoa(String.fromCharCode(...l));try{const d=e.fs.resolvePath("/Mockintosh HD/Desktop Folder");d&&await e.fs.writeImage(d.id,A,{width:i,height:r,data:c})}catch(d){console.error("Failed to save photo:",d)}}const Jc=340,Qc={id:"video",title:"1984.mp4",icon:"icon/MacFlim",defaultSize:{width:Jc,height:260},scrollable:!1,render(e,t,n){const[A,i]=e.useState(!1),r=e.useRef(null);e.useRef(null);const o=e.useRef(!1);t.clear(B),r.current&&t.blitImageData(r.current,0,0);const s=t.height-18;t.fillRect(0,s,t.width,18,B);const l=t.getWindow();if(l!==null){if(!o.current){const u=F(s+1,4,s+17,20),f=lt(l,u,">",!0,0,0,1,0,0);f.ref.contrlAction=(q,p)=>{p===pt&&i(m=>!m)},o.current=!0}const d=l.controlList[0];d&&(d.ref.contrlTitle=A?"||":">"),qe(l,t.port)}const a=24,c=t.width-28;t.drawRect(a,s+1,c,16,h),t.fillRect(a+1,s+2,14,14,B),t.drawVLine(a+14,s+1,16,h),t.fillRect(a+c-15,s+2,14,14,B),t.drawVLine(a+c-15,s+1,16,h),t.fillPattern(a+15,s+2,c-30,14,"gray50")},onOpen(e,t){},onEvent(e,t,n,A){e.useState(!1),e.useRef(null),e.useRef(null),e.useRef(!1)}},to=8,eo=4,no=6,Ao=2,io=4,ro=2,bn=12,hA=6,oo=4,so=6;function Ri(e){const t=new Map,n=/<card\s+id="([^"]+)">([\s\S]*?)<\/card>/gi;let A,i=!1;for(;(A=n.exec(e))!==null;)i=!0,t.set(A[1],Gi(A[2]));return i||t.set("home",Gi(e)),t}function Gi(e){const t=[];let n=0;const A=e.trim();for(;n<A.length;){for(;n<A.length&&/\s/.test(A[n]);)n++;if(n>=A.length)break;if(A[n]!=="<"){const u=A.indexOf("<",n),f=(u===-1?A.slice(n):A.slice(n,u)).trim();f&&t.push({type:"paragraph",segments:[{kind:"text",text:f}],align:"left"}),n=u===-1?A.length:u;continue}const i=A.slice(n).match(/^<(\w+)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*\/?>/);if(!i){n++;continue}const r=i[1].toLowerCase(),o=_c(i[2]||""),s=n+i[0].length,l=o.align||"left";if(r==="hr"||r==="br"||r==="img"||r==="spacer"){r==="hr"?t.push({type:"hr"}):r==="br"?t.push({type:"br"}):r==="img"?t.push({type:"image",src:o.src||"",align:l}):r==="spacer"&&t.push({type:"spacer",height:parseInt(o.height||"8",10)}),n=s;continue}const a=`</${r}>`,c=A.toLowerCase().indexOf(a,s);if(c===-1){n=s;continue}const d=A.slice(s,c);if(n=c+a.length,r==="h1"||r==="h2")t.push({type:"heading",level:r==="h1"?1:2,text:gA(d).trim(),align:l});else if(r==="p")t.push({type:"paragraph",segments:Yi(d),align:l});else if(r==="ul"){const u=/<li>([\s\S]*?)<\/li>/gi;let f;for(;(f=u.exec(d))!==null;)t.push({type:"listItem",segments:Yi(f[1])})}}return t}function Yi(e){var i;const t=[],n=/<(b|a)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*>([\s\S]*?)<\/\1>|([^<]+)/g;let A;for(;(A=n.exec(e))!==null;)if(A[4]!==void 0)A[4]&&t.push({kind:"text",text:A[4]});else if(A[1]==="b")t.push({kind:"bold",text:A[3]});else if(A[1]==="a"){const r=((i=(A[2]||"").match(/href="([^"]*)"/))==null?void 0:i[1])||"";t.push({kind:"link",text:A[3],href:r})}return t}function _c(e){const t={},n=/([\w-]+)="([^"]*)"/g;let A;for(;(A=n.exec(e))!==null;)t[A[1]]=A[2];return t}function gA(e){return e.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()}function En(e,t){const n=[];for(const A of e){const i=A.kind==="bold"?"menu":t,r=A.kind==="link",o=A.kind==="link"?A.href:void 0,l=A.text.split(/(\s+)/);for(const a of l)a&&n.push({text:a,font:i,underline:r,href:o})}return n}function Pn(e,t){var r;const n=[];let A=[],i=0;for(const o of e){const s=Q(o.text,o.font);if(/^\s+$/.test(o.text)){A.length>0&&(A.push(o),i+=s);continue}if(i+s>t&&A.length>0){for(;A.length>0&&/^\s+$/.test(A[A.length-1].text);)i-=Q(A.pop().text,((r=A[0])==null?void 0:r.font)??"body");n.push(A),A=[],i=0}A.push(o),i+=s}if(A.length>0){for(;A.length>0&&/^\s+$/.test(A[A.length-1].text);)A.pop();A.length>0&&n.push(A)}return n}function $c(e){let t=0;for(const n of e)t+=Q(n.text,n.font);return t}function AA(e,t,n,A){switch(A){case"center":return n+Math.floor((t-e)/2);case"right":return n+t-e;default:return n}}function td(e,t,n){const A=n.margin??8,i=n.width-A*2,r=[];let o=n.startY;for(const s of t)switch(s.type){case"heading":{const l=s.level===1,a="menu",c=gt(a);o+=l?to:no;const d=Q(s.text,a),u=AA(d,i,A,s.align);e.drawText(s.text,u,o,{font:a,color:h}),o+=c+(l?eo:Ao);break}case"paragraph":{const l="body",a=gt(l),c=En(s.segments,l),d=Pn(c,i);for(const u of d){const f=$c(u);let q=AA(f,i,A,s.align);for(const p of u){const m=Q(p.text,p.font);e.drawText(p.text,q,o,{font:p.font,color:h}),p.underline&&e.drawHLine(q,o+a-2,m,h),p.href&&r.push({x:q,y:o,w:m,h:a,href:p.href}),q+=m}o+=a}o+=io;break}case"listItem":{const l="body",a=gt(l),c=Q("- ",l);e.drawText("-",A+bn-c,o,{font:l,color:h});const d=En(s.segments,l),u=Pn(d,i-bn);for(let f=0;f<u.length;f++){let q=A+bn;for(const p of u[f]){const m=Q(p.text,p.font);e.drawText(p.text,q,o,{font:p.font,color:h}),p.underline&&e.drawHLine(q,o+a-2,m,h),p.href&&r.push({x:q,y:o,w:m,h:a,href:p.href}),q+=m}o+=a}o+=ro;break}case"hr":{o+=hA,e.drawDottedHLine(A,o,i,h),o+=1+hA;break}case"image":{if(n.sprites){const l=n.sprites.get(s.src);if(l){const a=AA(l.width,i,A,s.align);e.blit(l,a,o),o+=l.height+oo}}break}case"spacer":{o+=s.height;break}case"br":{o+=so;break}}return{contentHeight:o-n.startY,links:r}}function ed(e,t,n=8,A){const i=t-n*2;let r=0;for(const o of e)switch(o.type){case"heading":{const s=o.level===1;r+=s?to:no,r+=gt("menu"),r+=s?eo:Ao;break}case"paragraph":{const s="body",l=gt(s),a=En(o.segments,s),c=Pn(a,i);r+=c.length*l+io;break}case"listItem":{const s="body",l=gt(s),a=En(o.segments,s),c=Pn(a,i-bn);r+=c.length*l+ro;break}case"hr":r+=hA*2+1;break;case"image":{if(A){const s=A.get(o.src);s&&(r+=s.height+oo)}break}case"spacer":r+=o.height;break;case"br":r+=so;break}return r}const Tn=[{name:"Mockintosh",url:"mockintosh.com",keywords:["mac","macintosh","retro","1-bit","operating system"],body:`
<card id="home">
<h1 align="center">Mockintosh</h1>
<img src="microdesktop-disk" align="center">
<spacer height="8">
<p align="center">A mock operating system in the style of an early Macintosh.</p>
<hr>
<h2>Features</h2>
<ul>
<li>1-bit black and white graphics at 512x342</li>
<li>Window management with dragging and layering</li>
<li>Built-in apps: Finder, Safari, Photo Booth, and more</li>
<li>Create your own apps with the App Builder</li>
</ul>
<p><a href="#about">About this project</a></p>
</card>

<card id="about">
<h1>About</h1>
<p>Mockintosh is an open source project. The design language and icons are inspired by the original Macintosh, designed by Susan Kare.</p>
<spacer height="8">
<p><a href="#home">Back to home</a></p>
</card>
`},{name:"Facebook",url:"www.facebook.com",keywords:["social","network","friends"],body:`
<h1 align="center">Facebook</h1>
<hr>
<p align="center">Under Construction</p>
<spacer height="12">
<p align="center">This site is not yet available on the Mockintosh web.</p>
<p align="center">Check back later!</p>
<spacer height="8">
<p align="center"><a href="google.com">Back to Google</a></p>
`},{name:"Twitter",url:"www.twitter.com",keywords:["social","tweets","microblog"],body:`
<h1 align="center">Twitter</h1>
<hr>
<p align="center">Under Construction</p>
<spacer height="12">
<p align="center">140 characters will have to wait.</p>
<spacer height="8">
<p align="center"><a href="google.com">Back to Google</a></p>
`},{name:"GitHub",url:"www.github.com",keywords:["code","git","repository","open source","developer"],body:`
<h1 align="center">GitHub</h1>
<hr>
<p align="center">Under Construction</p>
<spacer height="12">
<p align="center">Where the world builds software. Coming soon to Mockintosh.</p>
<spacer height="8">
<p align="center"><a href="google.com">Back to Google</a></p>
`},{name:"Wikipedia",url:"www.wikipedia.org",keywords:["encyclopedia","wiki","knowledge","articles"],body:`
<card id="home">
<h1 align="center">Wikipedia</h1>
<p align="center">The Free Encyclopedia</p>
<hr>
<h2>Featured Article</h2>
<p>The Macintosh, later renamed the Macintosh 128K, was the first commercially successful personal computer to feature a mouse and a graphical user interface rather than a command line.</p>
<p>It was introduced on January 24, 1984. It came bundled with MacWrite and MacPaint.</p>
<spacer height="4">
<p><a href="#mac">Read more about the Macintosh</a></p>
<spacer height="8">
<p><a href="google.com">Back to Google</a></p>
</card>

<card id="mac">
<h1>Macintosh</h1>
<p>The original Macintosh had a 9-inch monochrome display with a resolution of 512x342 pixels. It shipped with 128KB of RAM and used 3.5-inch floppy disks.</p>
<spacer height="4">
<p>The graphical user interface was designed by a team that included Susan Kare, who created the iconic icons, fonts, and interface elements.</p>
<spacer height="4">
<h2>Specifications</h2>
<ul>
<li>CPU: Motorola 68000 at 7.83 MHz</li>
<li>RAM: 128KB (later 512KB)</li>
<li>Display: 512x342 monochrome</li>
<li>Storage: 400KB 3.5-inch floppy</li>
</ul>
<spacer height="8">
<p><a href="#home">Back to Wikipedia home</a></p>
</card>
`}];function nd(e){if(!e.trim())return[];const t=e.toLowerCase();return Tn.filter(n=>`${n.name} ${n.url} ${(n.keywords||[]).join(" ")} ${gA(n.body)}`.toLowerCase().includes(t)).map(n=>({name:n.name,url:n.url,snippet:gA(n.body).slice(0,80)}))}const Ad=200,xA=16,lo=42;function yA(e,t,n){const A=Math.min(Ad,e-40);return n?{barX:8,barY:4,barW:e-16}:{barX:Math.floor((e-A)/2),barY:Math.floor(t/3)+24,barW:A}}function id(e,t,n,A,i,r,o){const s=[],l=r.length>0||i.value.trim()!=="",a=yA(n,A,l);if(!l){const c="Google",d=Q(c,"menu");e.drawText(c,Math.floor((n-d)/2),t+Math.floor(A/3),{font:"menu",color:h})}if(e.drawTextInput(i,a.barX,t+a.barY,a.barW,xA),l){let c=t+a.barY+xA+8;if(r.length===0)e.drawText("No results found.",8,c,{font:"body",color:h});else for(const d of r){const u=Q(d.name,"menu");e.drawText(d.name,8,c,{font:"menu",color:h}),e.drawHLine(8,c+gt("menu")-2,u,h),s.push({x:0,y:c,w:n,h:lo,href:d.url}),c+=gt("menu"),e.drawText(d.url,8,c,{font:"body",color:h}),c+=gt("body"),d.snippet&&(e.drawText(d.snippet,8,c,{font:"body",color:h}),c+=gt("body")),c+=6}}o.current=s}function Ni(e,t,n,A,i,r,o,s,l,a){const c=e==="google.com";if(!Tn.find(q=>q.url===e)&&!c)return;const u=t.slice(0,n+1);u.push(e),i(u),r(u.length-1),A(e),o("home"),s(mt("")),l([]);const f=mt(e);f.focused=!1,a(f)}const ye=28,mn=8,rd={id:"safari",title:"Safari",icon:"icon/safari",defaultSize:{width:384,height:220},minSize:{width:200,height:220},scrollable:!0,resizable:!0,render(e,t,n){const A=n._sprites,[i,r]=e.useState(mt("google.com")),[o,s]=e.useState("google.com"),[l,a]=e.useState(["google.com"]),[c,d]=e.useState(0),[u,f]=e.useState(mt(""));e.useState(null);const[q,p]=e.useState([]),[m,g]=e.useState("home"),w=e.useRef([]),S=e.useRef(!1);t.clear(B),t.fillRect(0,0,t.width,ye,B),t.drawHLine(0,ye-1,t.width,h);const y=t.getWindow();if(y!==null){if(!S.current){const W=lt(y,F(4,4,24,24),"<",!0,0,0,1,0,0);W.ref.contrlAction=(k,V)=>{if(V===pt&&c>0){const z=c-1;d(z),s(l[z]),g("home"),f(mt("")),p([]),r(mt(l[z]))}};const b=lt(y,F(4,24,24,44),">",!0,0,0,1,0,0);b.ref.contrlAction=(k,V)=>{if(V===pt&&c<l.length-1){const z=c+1;d(z),s(l[z]),g("home"),f(mt("")),p([]),r(mt(l[z]))}},S.current=!0}const v=y.controlList[0],C=y.controlList[1];v&&(v.ref.contrlHilite=c<=0?255:0),C&&(C.ref.contrlHilite=c>=l.length-1?255:0),qe(y,t.port)}t.drawTextInput(i,50,6,t.width-58,16,{id:"url-input",onChange:()=>{r(v=>({...v,focused:!0})),f(v=>({...v,focused:!1})),e.scheduleRender()}}),t.drawScrollableContent(v=>{const C=v.height;if(o==="google.com")id(v,0,v.width,C,u,q,w);else{const W=Tn.find(b=>b.url===o);if(W){const b=Ri(W.body),k=b.get(m)||b.values().next().value||[],V=td(v,k,{startY:mn,width:v.width,margin:mn,sprites:A});w.current=V.links}else v.drawText("Page not found",16,16,{font:"menu",color:h}),v.drawText(o,16,34,{font:"body",color:h}),w.current=[]}})},getContentTopInset(e,t,n){return ye},onEvent(e,t,n,A){const[i,r]=e.useState(mt("google.com")),[o,s]=e.useState("google.com"),[l,a]=e.useState(["google.com"]),[c,d]=e.useState(0),[u,f]=e.useState(mt("")),[q,p]=e.useState(null),[m,g]=e.useState([]),[,w]=e.useState("home"),S=e.useRef([]);if(e.useRef(!1),t.type==="keyDown"&&(t.key==="Enter"?i.focused?Ni(i.value,l,c,s,a,d,w,f,g,r):o==="google.com"&&g(nd(u.value)):i.focused?Sn(i,t.key,t.code,t.shiftKey,t.metaKey,t.ctrlKey)&&r({...i}):o==="google.com"&&(u.focused=!0,Sn(u,t.key,t.code,t.shiftKey,t.metaKey,t.ctrlKey)&&f({...u}))),t.type==="mouseDown"||t.type==="doubleClick"){let y=!1,v=null;const C=t.contentRegion==="fixed"||t.contentRegion===void 0&&t.y<ye,W=t.contentRegion==="scrollable"||t.contentRegion===void 0&&t.y>=ye;if(!C){if(W){const b=S.current;for(const k of b)if(t.x>=k.x&&t.x<k.x+k.w&&t.y>=k.y&&t.y<k.y+k.h){k.href.startsWith("#")?w(k.href.slice(1)):Ni(k.href,l,c,s,a,d,w,f,g,r);return}if(o==="google.com"){const k=A.height-ye,V=m.length>0||u.value.trim()!=="",z=yA(A.width,k,V),E=z.barX,K=z.barY;if(t.x>=E&&t.x<E+z.barW&&t.y>=K&&t.y<K+xA){y=!0;const D=t.x-E;t.type==="doubleClick"?Kr(u,D):(Dr(u,D,t.shiftKey),v="search"),f({...u,focused:!0})}}}}r({...i,focused:!1}),y||f({...u,focused:!1}),p(v)}if(t.type==="mouseMove"&&q&&q==="search"){const y=A.height-ye,v=m.length>0||u.value.trim()!=="",C=yA(A.width,y,v),W=t.x-C.barX;Br(u,W)&&f({...u})}t.type==="mouseUp"&&q&&p(null)},getContentHeight(e,t,n){const A=t._sprites;e.useState(mt("google.com"));const[i]=e.useState("google.com");e.useState(["google.com"]),e.useState(0),e.useState(mt("")),e.useState(null);const[r]=e.useState([]),[o]=e.useState("home");if(e.useRef([]),e.useRef(!1),i==="google.com"){const c=r.length>0?28+r.length*(lo+6)+16:200;return Math.max(c,200)}const s=Tn.find(c=>c.url===i);if(!s)return 200;const l=Ri(s.body),a=l.get(o)||l.values().next().value||[];return ed(a,n.width,mn,A)+mn*2}},od={id:"picture",title:"Picture",icon:"icon/MacFlim",defaultSize:{width:256,height:256},scrollable:!0,render(e,t,n){const A=n._sprites,i=n.src??"",r=e.useRef(!1);t.clear(B);const o=t.getWindow();if(o!==null){if(!r.current){const l=Q("Print","menu")+20,a=F(4,4,24,4+l),c=lt(o,a,"Print",!0,0,0,1,0,0);c.ref.contrlAction=(d,u)=>{},r.current=!0}qe(o,t.port)}const s=A==null?void 0:A.get(i);s&&t.blit(s,0,28)},getContentHeight(e,t){return(t.height??200)+32}},Xe=42,de=20,sd=28,ld="https://raw.githubusercontent.com/mockintosh/app-registry/main/registry.json";async function Ui(){try{const e=await fetch(ld);return e.ok?(await e.json()).apps??[]:[]}catch{return[]}}function iA(e){if(!e||e.type==="free")return"Free";const t=((e.amount_cents??0)/100).toFixed(2);if((e.currency??"usd").toUpperCase(),e.type==="subscription"){const n=e.interval==="year"?"/yr":"/mo";return`$${t}${n}`}return`$${t}`}const ad={id:"appstore",title:"App Store",icon:"icon/appstore-smr-32x32",defaultSize:{width:320,height:280},scrollable:!0,resizable:!0,minSize:{width:240,height:180},render(e,t,n){const[A,i]=e.useState("browse"),[r,o]=e.useState([]),[s,l]=e.useState(!0),[a,c]=e.useState(null),[d,u]=e.useState(null),[f,q]=e.useState(new Set),[p,m]=e.useState(null),g=e.useRef("");e.useEffect(()=>{Ui().then(V=>{o(V),l(!1)}).catch(()=>{c("Failed to load app catalog."),l(!1)})},[]),t.clear(B),t.drawText("App Store",t.width/2-26,4,{font:"menu",color:h}),t.drawHLine(0,16,t.width,h);const w=A==="browse",S=A==="installed",y=t.width/2;w?(t.fillRect(0,17,y,de-1,h),t.drawText("Browse",y/2-16,20,{font:"body",color:B})):t.drawText("Browse",y/2-16,20,{font:"body",color:h}),t.hitRegion("tab-browse",{x:0,y:17,w:y,h:de},{onMouseDown:()=>{i("browse"),u(null)}}),S?(t.fillRect(y,17,y,de-1,h),t.drawText("Installed",y+y/2-22,20,{font:"body",color:B})):t.drawText("Installed",y+y/2-22,20,{font:"body",color:h}),t.hitRegion("tab-installed",{x:y,y:17,w:y,h:de},{onMouseDown:()=>{i("installed"),u(null)}}),t.drawHLine(0,17+de,t.width,h),t.drawVLine(y,17,de,h);const v=17+de+1,C=A==="browse"?r:r.filter(V=>f.has(V.id));if(s){t.drawText("Loading app catalog...",16,v+20,{font:"body",color:h});return}if(a){t.drawText(a,16,v+20,{font:"body",color:h});return}if(C.length===0){const V=A==="browse"?"No apps available yet.":"No apps installed.";t.drawText(V,16,v+20,{font:"body",color:h}),A==="browse"&&t.drawText("Check back soon!",16,v+34,{font:"body",color:h});return}let W=v;for(let V=0;V<C.length;V++){const z=C[V],E=d===V,K=f.has(z.id);E&&t.fillRect(0,W,t.width,Xe,h);const D=E?B:h;t.drawText(z.title,8,W+4,{font:"menu",color:D});const H=iA(z.pricing),N=K?"Installed":H;t.drawText(N,t.width-70,W+4,{font:"body",color:D}),t.drawText(`by ${z.author} · v${z.version}`,8,W+16,{font:"body",color:D});const X=z.description||"No description";t.drawText(X.length>45?X.slice(0,42)+"...":X,8,W+28,{font:"body",color:D}),t.drawDottedHLine(0,W+Xe-1,t.width,E?B:h),t.hitRegion(`app-item-${V}`,{x:0,y:W,w:t.width,h:Xe},{onMouseDown:()=>u(V)}),W+=Xe}const b=W+4;t.drawHLine(0,b,t.width,h);const k=t.getWindow();if(k!==null&&d===null&&(k.controlList.length=0,g.current=""),d!==null&&d<C.length){const V=C[d],z=f.has(V.id),E=p===V.id;if(k!==null){const K=`${d}-${V.id}-${z}-${p??""}`;if(g.current!==K&&(k.controlList.length=0,g.current=K),k.controlList.length===0)if(z){const D=Q("Open","menu")+20,H=Q("Uninstall","menu")+20,N=lt(k,F(b+4,8,b+24,8+D),"Open",!0,0,0,1,0,0);N.ref.contrlAction=(L,R)=>{var j;R===pt&&((j=n._os)==null||j.openWindow(V.id))};const X=lt(k,F(b+4,60,b+24,60+H),"Uninstall",!0,0,0,1,0,0);X.ref.contrlAction=(L,R)=>{R===pt&&(q(j=>{const et=new Set(j);return et.delete(V.id),et}),u(null))}}else{const D=!V.pricing||V.pricing.type==="free",H=E?"Installing...":D?"Install":`Buy ${iA(V.pricing)}`,N=Q(H,"menu")+20,X=lt(k,F(b+4,8,b+24,8+N),H,!0,0,0,1,0,0);X.ref.contrlAction=(L,R)=>{if(!(R!==pt||E)&&D&&V.entry){m(V.id);const j=n._appLoader;if(j){const et={id:V.id,title:V.title,description:V.description??"",icon:V.id+"/icon",author:V.author,version:V.version,sdk:V.sdk,permissions:V.permissions,entry:V.entry};j.load(et).then(()=>{q(rt=>{const ct=new Set(rt);return ct.add(V.id),ct}),m(null)}).catch(rt=>{console.error("Install failed:",rt),m(null),c(`Failed to install ${V.title}`)})}}}}else if(!z&&k.controlList[0]){const D=!V.pricing||V.pricing.type==="free",H=E?"Installing...":D?"Install":`Buy ${iA(V.pricing)}`;k.controlList[0].ref.contrlTitle=H,k.controlList[0].ref.contrlHilite=E?255:0}qe(k,t.port)}}},onEvent(e,t,n){t.type},getContentHeight(e,t,n){const[A]=e.useState("browse"),[i]=e.useState([]),[r]=e.useState(new Set),o=A==="browse"?i:i.filter(l=>r.has(l.id));return 17+de+1+o.length*Xe+sd+8},getMenubar(e,t){const[,n]=e.useState(!0),[,A]=e.useState([]),[,i]=e.useState(null);return[{label:"Store",items:[{label:"Refresh Catalog",onClick:()=>{n(!0),i(null),Ui().then(r=>{A(r),n(!1)})}}]}]}};function cd(e,t,n,A,i){const r=t*n;for(let o=0;o<r;o++){const s=o<<2;i[o]=e[s]*.299+e[s+1]*.587+e[s+2]*.114}for(let o=0;o<r;o++){const s=i[o],l=s<129?1:0;A[o]=l;const a=(s-(l?0:255))/8;o+1<r&&(i[o+1]+=a),o+2<r&&(i[o+2]+=a),o+t-1<r&&(i[o+t-1]+=a),o+t<r&&(i[o+t]+=a),o+t+1<r&&(i[o+t+1]+=a),o+(t<<1)<r&&(i[o+(t<<1)]+=a)}}async function FA(e,t,n){try{const A=await createImageBitmap(e),r=new OffscreenCanvas(t,n).getContext("2d",{willReadFrequently:!0});r.drawImage(A,0,0,t,n),A.close();const o=r.getImageData(0,0,t,n),s=new Uint8Array(t*n),l=new Float32Array(t*n);return cd(o.data,t,n,s,l),s}catch{return null}}const _e="body",dd="menu",on=gt(_e),ao=18,co=4,Fi=ao+co*2+1,ud=200,fd=1,uo=4,pd="/api/chat",qd="/api/generate-image",md=["/imagine ","/img ","/image "];function hd(e){const t=e.toLowerCase();for(const n of md)if(t.startsWith(n))return e.slice(n.length).trim();return null}function Rn(e){const t=Math.min(e,ud),n=Math.round(t/fd);return{w:t,h:n}}async function gd(e,t,n){try{const A=await fetch(qd,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:e})});if(!A.ok)return null;const i=await A.json();if(!i.b64)return null;const r=atob(i.b64),o=new Uint8Array(r.length);for(let a=0;a<r.length;a++)o[a]=r.charCodeAt(a);const s=new Blob([o],{type:"image/png"}),l=await FA(s,t,n);return l?{blob:s,pixels:l,width:t,height:n}:null}catch{return null}}async function xd(e){try{const t=await fetch(pd,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:e[e.length-1].content,conversationHistory:e.slice(0,-1)})});if(!t.ok)return{message:"Sorry, I couldn't reach the server."};const n=await t.json();return{message:n.message??n.error??"No response.",b64:n.b64,imagePrompt:n.imagePrompt}}catch{return{message:"Network error. Please try again."}}}function XA(e,t){const n=e.split(" "),A=[];let i="";for(const r of n){const o=i?`${i} ${r}`:r;Q(o,_e)>t&&i?(A.push(i),i=r):i=o}return i&&A.push(i),A.length===0&&A.push(""),A}function yd(e,t){let n=0;if(e.image){const A=e.image.height||Rn(t).h;n+=A+uo}if(e.content){const A=e.role==="user"?"You: ":"Gippity: ";n+=XA(A+e.content,t).length*on}return n+=4,n}function Xi(e,t,n){let A=4;for(const i of e)A+=yd(i,n);return t&&(A+=XA("Gippity: ...",n).length*on+4),A}function ji(e,t,n,A,i,r,o,s,l){const a=t.value.trim();if(!a)return;const c=hd(a),d={role:"user",content:a},u=[...e,d];n(u),t.value="",t.cursorPos=0,t.selectionStart=0,t.selectionEnd=0,A(!0);const f=s+on+4;if(i(Math.max(0,f-o)),c!==null){const{w:q,h:p}=Rn(l);gd(c,q,p).then(m=>{const g={role:"assistant",content:m?`Here's "${c}":`:"Sorry, I couldn't generate that image.",image:m??void 0};n(w=>[...w,g]),A(!1),r()})}else xd(u).then(async q=>{if(q.b64&&q.imagePrompt){const{w:p,h:m}=Rn(l),g=atob(q.b64),w=new Uint8Array(g.length);for(let W=0;W<g.length;W++)w[W]=g.charCodeAt(W);const S=new Blob([w],{type:"image/png"}),y=await FA(S,p,m),v=y?{blob:S,pixels:y,width:p,height:m}:void 0,C={role:"assistant",content:q.message,image:v};n(W=>[...W,C])}else{const p={role:"assistant",content:q.message};n(m=>[...m,p])}A(!1),r()})}const Vd={id:"chatgippity",title:"ChatGippity",icon:"icon/computer",defaultSize:{width:280,height:300},scrollable:!1,resizable:!1,minSize:{width:200,height:160},render(e,t,n){const[A,i]=e.useState([]),[r]=e.useState(mt(""));r.focused||(r.focused=!0);const[o,s]=e.useState(!1),[l,a]=e.useState(0),c=e.useRef(!1);t.clear(B);const d=15,u=t.height-Fi,f=t.width-d-8,q=Xi(A,o,f);if(A.length===0&&!o){const y=u/2-20;t.drawText("Welcome to ChatGippity!",t.width/2-60,y,{font:dd,color:h}),t.drawText("Type a message below to start chatting.",20,y+18,{font:_e,color:h}),t.drawText("Tip: ask me to generate an image!",20,y+30,{font:_e,color:h})}t.scrollArea("chat-messages",{x:0,y:0,w:t.width,h:u},{contentHeight:q,scrollOffset:l,onScroll:a,resize:"both"},y=>{let v=4;const C=o?[...A,{role:"assistant",content:"..."}]:A;for(const W of C){if(W.image){const{w:b,h:k}=Rn(f);(W.image.width!==b||W.image.height!==k)&&FA(W.image.blob,b,k).then(H=>{H&&(W.image.pixels=H,W.image.width=b,W.image.height=k,e.scheduleRender())});const V=W.image.width,z=W.image.height,E=W.image.pixels,K=new Uint8ClampedArray(V*z*4);for(let H=0;H<V*z;H++){const N=E[H]?0:255;K[H*4]=N,K[H*4+1]=N,K[H*4+2]=N,K[H*4+3]=255}const D=new ImageData(K,V,z);y.blitImageData(D,4,v),v+=z+uo}if(W.content){const b=W.role==="user"?"You: ":"Gippity: ",k=XA(b+W.content,f);for(let V=0;V<k.length;V++)y.drawText(k[V],4,v+V*on,{font:_e,color:h});v+=k.length*on}v+=4}}),t.drawHLine(0,u,t.width,h);const p=u+co,m=40,g=t.width-m-12;t.drawTextInput(r,4,p,g,ao,{id:"chat-input",onChange:()=>e.scheduleRender()});const w=20,S=t.getWindow();if(S!==null){if(!c.current){const y=lt(S,F(p-1,t.width-m-4,p-1+w,t.width-4),"Send",!0,0,0,1,0,0);y.ref.contrlAction=(v,C)=>{C!==pt||o||ji(A,r,i,s,a,()=>e.scheduleRender(),u,q,f)},c.current=!0}S.controlList[0]&&(S.controlList[0].ref.contrlHilite=o?255:0),qe(S,t.port)}},onEvent(e,t,n,A){var d;const[i,r]=e.useState([]),[o]=e.useState(mt("")),[s,l]=e.useState(!1),[a,c]=e.useState(0);if(e.useRef(!1),t.type==="keyDown"){if(t.key==="Enter"){if(!s&&((d=o==null?void 0:o.value)!=null&&d.trim())){const f=A.width-15-8,q=A.height-Fi,p=Xi(i,s,f);ji(i,o,r,l,c,()=>e.scheduleRender(),q,p,f)}return}Sn(o,t.key,t.code,t.shiftKey,t.metaKey,t.ctrlKey)&&e.scheduleRender()}},getMenubar(e,t){const[,n]=e.useState([]);e.useState(mt("")),e.useState(!1);const[,A]=e.useState(0);return[{label:"File",items:[{label:"Clear Chat",onClick:()=>{n([]),A(0)}}]}]}};/*!
Copyright (c) 2023 Paul Miller (paulmillr.com)
The library @paulmillr/qr is dual-licensed under the Apache 2.0 OR MIT license.
You can select a license of your choice.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/const je={newline:10,reset:27};function bd(e){if(!Number.isSafeInteger(e))throw new Error(`integer expected: ${e}`)}function wd(e){if(!Number.isSafeInteger(e)||e<1||e>40)throw new Error(`Invalid version=${e}. Expected number [1..40]`)}function Ve(e,t){return e.toString(2).padStart(t,"0")}function Ji(e,t){const n=e%t;return n>=0?n:t+n}function Lt(e,t){return new Array(e).fill(t)}function Qi(...e){let t=0;for(const A of e)t=Math.max(t,A.length);const n=[];for(let A=0;A<t;A++)for(const i of e)A>=i.length||n.push(i[A]);return new Uint8Array(n)}function _i(e,t,n){if(n<0||n+t.length>e.length)return!1;for(let A=0;A<t.length;A++)if(t[A]!==e[n+A])return!1;return!0}function vd(){let e,t=1/0;return{add(n,A){n>=t||(e=A,t=n)},get:()=>e,score:()=>t}}function $i(e){return{has:t=>e.includes(t),decode:t=>{if(!Array.isArray(t)||t.length&&typeof t[0]!="string")throw new Error("alphabet.decode input should be array of strings");return t.map(n=>{if(typeof n!="string")throw new Error(`alphabet.decode: not string element=${n}`);const A=e.indexOf(n);if(A===-1)throw new Error(`Unknown letter: "${n}". Allowed: ${e}`);return A})},encode:t=>{if(!Array.isArray(t)||t.length&&typeof t[0]!="number")throw new Error("alphabet.encode input should be an array of numbers");return t.map(n=>{if(bd(n),n<0||n>=e.length)throw new Error(`Digit index outside alphabet: ${n} (alphabet: ${e.length})`);return e[n]})}}}class Ot{static size(t,n){if(typeof t=="number"&&(t={height:t,width:t}),!Number.isSafeInteger(t.height)&&t.height!==1/0)throw new Error(`Bitmap: invalid height=${t.height} (${typeof t.height})`);if(!Number.isSafeInteger(t.width)&&t.width!==1/0)throw new Error(`Bitmap: invalid width=${t.width} (${typeof t.width})`);return n!==void 0&&(t={width:Math.min(t.width,n.width),height:Math.min(t.height,n.height)}),t}static fromString(t){t=t.replace(/^\n+/g,"").replace(/\n+$/g,"");const n=t.split(String.fromCharCode(je.newline)),A=n.length,i=new Array(A);let r;for(const o of n){const s=o.split("").map(l=>{if(l==="X")return!0;if(l===" ")return!1;if(l!=="?")throw new Error(`Bitmap.fromString: unknown symbol=${l}`)});if(r&&s.length!==r)throw new Error(`Bitmap.fromString different row sizes: width=${r} cur=${s.length}`);r=s.length,i.push(s)}return r||(r=0),new Ot({height:A,width:r},i)}constructor(t,n){const{height:A,width:i}=Ot.size(t);this.data=n||Array.from({length:A},()=>Lt(i,void 0)),this.height=A,this.width=i}point(t){return this.data[t.y][t.x]}isInside(t){return 0<=t.x&&t.x<this.width&&0<=t.y&&t.y<this.height}size(t){if(!t)return{height:this.height,width:this.width};const{x:n,y:A}=this.xy(t);return{height:this.height-A,width:this.width-n}}xy(t){if(typeof t=="number"&&(t={x:t,y:t}),!Number.isSafeInteger(t.x))throw new Error(`Bitmap: invalid x=${t.x}`);if(!Number.isSafeInteger(t.y))throw new Error(`Bitmap: invalid y=${t.y}`);return t.x=Ji(t.x,this.width),t.y=Ji(t.y,this.height),t}rect(t,n,A){const{x:i,y:r}=this.xy(t),{height:o,width:s}=Ot.size(n,this.size({x:i,y:r}));for(let l=0;l<o;l++)for(let a=0;a<s;a++)this.data[r+l][i+a]=typeof A=="function"?A({x:a,y:l},this.data[r+l][i+a]):A;return this}rectRead(t,n,A){return this.rect(t,n,(i,r)=>(A(i,r),r))}hLine(t,n,A){return this.rect(t,{width:n,height:1},A)}vLine(t,n,A){return this.rect(t,{width:1,height:n},A)}border(t=2,n){const A=this.height+2*t,i=this.width+2*t,r=Lt(t,n),o=Array.from({length:t},()=>Lt(i,n));return new Ot({height:A,width:i},[...o,...this.data.map(s=>[...r,...s,...r]),...o])}embed(t,n){return this.rect(t,n.size(),({x:A,y:i})=>n.data[i][A])}rectSlice(t,n=this.size()){const A=new Ot(Ot.size(n,this.size(this.xy(t))));return this.rect(t,n,({x:i,y:r},o)=>A.data[r][i]=o),A}inverse(){const{height:t,width:n}=this;return new Ot({height:n,width:t}).rect({x:0,y:0},1/0,({x:i,y:r})=>this.data[i][r])}scale(t){if(!Number.isSafeInteger(t)||t>1024)throw new Error(`invalid scale factor: ${t}`);const{height:n,width:A}=this;return new Ot({height:t*n,width:t*A}).rect({x:0,y:0},1/0,({x:r,y:o})=>this.data[Math.floor(o/t)][Math.floor(r/t)])}clone(){return new Ot(this.size()).rect({x:0,y:0},this.size(),({x:n,y:A})=>this.data[A][n])}assertDrawn(){this.rectRead(0,1/0,(t,n)=>{if(typeof n!="boolean")throw new Error(`Invalid color type=${typeof n}`)})}toString(){return this.data.map(t=>t.map(n=>n===void 0?"?":n?"X":" ").join("")).join(String.fromCharCode(je.newline))}toASCII(){const{height:t,width:n,data:A}=this;let i="";for(let r=0;r<t;r+=2){for(let o=0;o<n;o++){const s=A[r][o],l=r+1>=t?!0:A[r+1][o];!s&&!l?i+="█":!s&&l?i+="▀":s&&!l?i+="▄":s&&l&&(i+=" ")}i+=String.fromCharCode(je.newline)}return i}toTerm(){const t=String.fromCharCode(je.reset),n=t+"[0m",A=t+"[1;47m  "+n,i=t+"[40m  "+n;return this.data.map(r=>r.map(o=>o?i:A).join("")).join(String.fromCharCode(je.newline))}toSVG(){let t=`<svg xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" version="1.1" xmlns="http://www.w3.org/2000/svg">`;return this.rectRead(0,1/0,({x:n,y:A},i)=>{i&&(t+=`<rect x="${n}" y="${A}" width="1" height="1" />`)}),t+="</svg>",t}toGIF(){const t=s=>[s&255,s>>>8&255],n=[...t(this.width),...t(this.height)],A=[];this.rectRead(0,1/0,(s,l)=>A.push(+(l===!0)));const i=126,r=[71,73,70,56,55,97,...n,246,0,0,255,255,255,...Lt(381,0),44,0,0,0,0,...n,0,7],o=Math.floor(A.length/i);for(let s=0;s<o;s++)r.push(i+1,128,...A.slice(i*s,i*(s+1)).map(l=>+l));return r.push(A.length%i+1,128,...A.slice(o*i).map(s=>+s)),r.push(1,129,0,59),new Uint8Array(r)}toImage(t=!1){const{height:n,width:A}=this.size(),i=new Uint8Array(n*A*(t?3:4));let r=0;for(let o=0;o<n;o++)for(let s=0;s<A;s++){const l=this.data[o][s]?0:255;i[r++]=l,i[r++]=l,i[r++]=l,t||(i[r++]=255)}return{height:n,width:A,data:i}}}const tr=["low","medium","quartile","high"],er=["numeric","alphanumeric","byte","kanji","eci"],kd=[26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706],Id={low:[7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],medium:[10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],quartile:[13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],high:[17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]},zd={low:[1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],medium:[1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],quartile:[1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],high:[1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]},bt={size:{encode:e=>21+4*(e-1),decode:e=>(e-17)/4},sizeType:e=>Math.floor((e+7)/17),alignmentPatterns(e){if(e===1)return[];const t=6,n=bt.size.encode(e)-t-1,A=n-t,i=Math.ceil(A/28);let r=Math.floor(A/i);r%2?r+=1:A%i*2>=i&&(r+=2);const o=[t];for(let s=1;s<i;s++)o.push(n-(i-s)*r);return o.push(n),o},ECCode:{low:1,medium:0,quartile:3,high:2},formatMask:21522,formatBits(e,t){const n=bt.ECCode[e]<<3|t;let A=n;for(let i=0;i<10;i++)A=A<<1^(A>>9)*1335;return(n<<10|A)^bt.formatMask},versionBits(e){let t=e;for(let n=0;n<12;n++)t=t<<1^(t>>11)*7973;return e<<12|t},alphabet:{numeric:$i("0123456789"),alphanumerc:$i("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:")},lengthBits(e,t){return{numeric:[10,12,14],alphanumeric:[9,11,13],byte:[8,16,16],kanji:[8,10,12],eci:[0,0,0]}[t][bt.sizeType(e)]},modeBits:{numeric:"0001",alphanumeric:"0010",byte:"0100",kanji:"1000",eci:"0111"},capacity(e,t){const n=kd[e-1],A=Id[t][e-1],i=zd[t][e-1],r=Math.floor(n/i)-A,o=i-n%i;return{words:A,numBlocks:i,shortBlocks:o,blockLen:r,capacity:(n-A*i)*8,total:(A+r)*i+i-o}}},jA=[(e,t)=>(e+t)%2==0,(e,t)=>t%2==0,(e,t)=>e%3==0,(e,t)=>(e+t)%3==0,(e,t)=>(Math.floor(t/2)+Math.floor(e/3))%2==0,(e,t)=>e*t%2+e*t%3==0,(e,t)=>(e*t%2+e*t%3)%2==0,(e,t)=>((e+t)%2+e*t%3)%2==0],P={tables:(e=>{const t=Lt(256,0),n=Lt(256,0);for(let A=0,i=1;A<256;A++)t[A]=i,n[i]=A,i<<=1,i&256&&(i^=e);return{exp:t,log:n}})(285),exp:e=>P.tables.exp[e],log(e){if(e===0)throw new Error(`GF.log: invalid arg=${e}`);return P.tables.log[e]%255},mul(e,t){return e===0||t===0?0:P.tables.exp[(P.tables.log[e]+P.tables.log[t])%255]},add:(e,t)=>e^t,pow:(e,t)=>P.tables.exp[P.tables.log[e]*t%255],inv(e){if(e===0)throw new Error(`GF.inverse: invalid arg=${e}`);return P.tables.exp[255-P.tables.log[e]]},polynomial(e){if(e.length==0)throw new Error("GF.polymomial: invalid length");if(e[0]!==0)return e;let t=0;for(;t<e.length-1&&e[t]==0;t++);return e.slice(t)},monomial(e,t){if(e<0)throw new Error(`GF.monomial: invalid degree=${e}`);if(t==0)return[0];let n=Lt(e+1,0);return n[0]=t,P.polynomial(n)},degree:e=>e.length-1,coefficient:(e,t)=>e[P.degree(e)-t],mulPoly(e,t){if(e[0]===0||t[0]===0)return[0];const n=Lt(e.length+t.length-1,0);for(let A=0;A<e.length;A++)for(let i=0;i<t.length;i++)n[A+i]=P.add(n[A+i],P.mul(e[A],t[i]));return P.polynomial(n)},mulPolyScalar(e,t){if(t==0)return[0];if(t==1)return e;const n=Lt(e.length,0);for(let A=0;A<e.length;A++)n[A]=P.mul(e[A],t);return P.polynomial(n)},mulPolyMonomial(e,t,n){if(t<0)throw new Error("GF.mulPolyMonomial: invalid degree");if(n==0)return[0];const A=Lt(e.length+t,0);for(let i=0;i<e.length;i++)A[i]=P.mul(e[i],n);return P.polynomial(A)},addPoly(e,t){if(e[0]===0)return t;if(t[0]===0)return e;let n=e,A=t;n.length>A.length&&([n,A]=[A,n]);let i=Lt(A.length,0),r=A.length-n.length,o=A.slice(0,r);for(let s=0;s<o.length;s++)i[s]=o[s];for(let s=r;s<A.length;s++)i[s]=P.add(n[s-r],A[s]);return P.polynomial(i)},remainderPoly(e,t){const n=Array.from(e);for(let A=0;A<e.length-t.length+1;A++){const i=n[A];if(i!==0)for(let r=1;r<t.length;r++)t[r]!==0&&(n[A+r]=P.add(n[A+r],P.mul(t[r],i)))}return n.slice(e.length-t.length+1,n.length)},divisorPoly(e){let t=[1];for(let n=0;n<e;n++)t=P.mulPoly(t,[1,P.pow(2,n)]);return t},evalPoly(e,t){if(t==0)return P.coefficient(e,0);let n=e[0];for(let A=1;A<e.length;A++)n=P.add(P.mul(t,n),e[A]);return n},euclidian(e,t,n){P.degree(e)<P.degree(t)&&([e,t]=[t,e]);let A=e,i=t,r=[0],o=[1];for(;2*P.degree(i)>=n;){let a=A,c=r;if(A=i,r=o,A[0]===0)throw new Error("rLast[0] === 0");i=a;let d=[0];const u=P.inv(A[0]);for(;P.degree(i)>=P.degree(A)&&i[0]!==0;){const f=P.degree(i)-P.degree(A),q=P.mul(i[0],u);d=P.addPoly(d,P.monomial(f,q)),i=P.addPoly(i,P.mulPolyMonomial(A,f,q))}if(d=P.mulPoly(d,r),o=P.addPoly(d,c),P.degree(i)>=P.degree(A))throw new Error(`Division failed r: ${i}, rLast: ${A}`)}const s=P.coefficient(o,0);if(s==0)throw new Error("sigmaTilde(0) was zero");const l=P.inv(s);return[P.mulPolyScalar(o,l),P.mulPolyScalar(i,l)]}};function Md(e){return{encode(t){const n=P.divisorPoly(e),A=Array.from(t);return A.push(...n.slice(0,-1).fill(0)),Uint8Array.from(P.remainderPoly(A,n))},decode(t){const n=t.slice(),A=P.polynomial(Array.from(t));let i=Lt(e,0),r=!1;for(let d=0;d<e;d++){const u=P.evalPoly(A,P.exp(d));i[i.length-1-d]=u,u!==0&&(r=!0)}if(!r)return n;i=P.polynomial(i);const o=P.monomial(e,1),[s,l]=P.euclidian(o,i,e),a=Lt(P.degree(s),0);let c=0;for(let d=1;d<256&&c<a.length;d++)P.evalPoly(s,d)===0&&(a[c++]=P.inv(d));if(c!==a.length)throw new Error("RS.decode: invalid errors number");for(let d=0;d<a.length;d++){const u=n.length-1-P.log(a[d]);if(u<0)throw new Error("RS.decode: invalid error location");const f=P.inv(a[d]);let q=1;for(let p=0;p<a.length;p++)d!==p&&(q=P.mul(q,P.add(1,P.mul(a[p],f))));n[u]=P.add(n[u],P.mul(P.evalPoly(l,f),P.inv(q)))}return n}}}function Cd(e,t){const{words:n,shortBlocks:A,numBlocks:i,blockLen:r,total:o}=bt.capacity(e,t),s=Md(n);return{encode(l){const a=[],c=[];for(let q=0;q<i;q++){const p=q<A,m=r+(p?0:1);a.push(l.subarray(0,m)),c.push(s.encode(l.subarray(0,m))),l=l.subarray(m)}const d=Qi(...a),u=Qi(...c),f=new Uint8Array(d.length+u.length);return f.set(d),f.set(u,d.length),f},decode(l){if(l.length!==o)throw new Error(`interleave.decode: len(data)=${l.length}, total=${o}`);const a=[];for(let u=0;u<i;u++){const f=u<A;a.push(new Uint8Array(n+r+(f?0:1)))}let c=0;for(let u=0;u<r;u++)for(let f=0;f<i;f++)a[f][u]=l[c++];for(let u=A;u<i;u++)a[u][r]=l[c++];for(let u=r;u<r+n;u++)for(let f=0;f<i;f++){const q=f<A;a[f][u+(q?0:1)]=l[c++]}const d=[];for(const u of a)d.push(...Array.from(s.decode(u)).slice(0,-n));return Uint8Array.from(d)}}}function Wd(e,t,n,A=!1){const i=bt.size.encode(e);let r=new Ot(i+2);const o=new Ot(3).rect(0,3,!0).border(1,!1).border(1,!0).border(1,!1);r=r.embed(0,o).embed({x:-o.width,y:0},o).embed({x:0,y:-o.height},o),r=r.rectSlice(1,i);const s=new Ot(1).rect(0,1,!0).border(1,!1).border(1,!0),l=bt.alignmentPatterns(e);for(const a of l)for(const c of l)r.data[a][c]===void 0&&r.embed({x:c-2,y:a-2},s);r=r.hLine({x:0,y:6},1/0,({x:a},c)=>c===void 0?a%2==0:c).vLine({x:6,y:0},1/0,({y:a},c)=>c===void 0?a%2==0:c);{const a=bt.formatBits(t,n),c=d=>!A&&(a>>d&1)==1;for(let d=0;d<6;d++)r.data[d][8]=c(d);for(let d=6;d<8;d++)r.data[d+1][8]=c(d);for(let d=8;d<15;d++)r.data[i-15+d][8]=c(d);for(let d=0;d<8;d++)r.data[8][i-d-1]=c(d);for(let d=8;d<9;d++)r.data[8][15-d-1+1]=c(d);for(let d=9;d<15;d++)r.data[8][15-d-1]=c(d);r.data[i-8][8]=!A}if(e>=7){const a=bt.versionBits(e);for(let c=0;c<18;c+=1){const d=!A&&(a>>c&1)==1,u=Math.floor(c/3),f=c%3+i-8-3;r.data[u][f]=d,r.data[f][u]=d}}return r}function Sd(e,t,n){const A=e.height,i=jA[t];let r=-1,o=A-1;for(let s=A-1;s>0;s-=2){for(s==6&&(s=5);;o+=r){for(let l=0;l<2;l+=1){const a=s-l;e.data[o][a]===void 0&&n(a,o,i(a,o))}if(o+r<0||o+r>=A)break}r=-r}}function Od(e){let t="numeric";for(let n of e)if(!bt.alphabet.numeric.has(n)&&(t="alphanumeric",!bt.alphabet.alphanumerc.has(n)))return"byte";return t}function Zd(e){if(typeof e!="string")throw new Error(`utf8ToBytes expected string, got ${typeof e}`);return new Uint8Array(new TextEncoder().encode(e))}function nr(e,t,n,A){let i="",r=n.length;if(A==="numeric"){const d=bt.alphabet.numeric.decode(n.split("")),u=d.length;for(let f=0;f<u-2;f+=3)i+=Ve(d[f]*100+d[f+1]*10+d[f+2],10);u%3===1?i+=Ve(d[u-1],4):u%3===2&&(i+=Ve(d[u-2]*10+d[u-1],7))}else if(A==="alphanumeric"){const d=bt.alphabet.alphanumerc.decode(n.split("")),u=d.length;for(let f=0;f<u-1;f+=2)i+=Ve(d[f]*45+d[f+1],11);u%2==1&&(i+=Ve(d[u-1],6))}else if(A==="byte"){const d=Zd(n);r=d.length,i=Array.from(d).map(u=>Ve(u,8)).join("")}else throw new Error("encode: unsupported type");const{capacity:o}=bt.capacity(e,t),s=Ve(r,bt.lengthBits(e,A));let l=bt.modeBits[A]+s+i;if(l.length>o)throw new Error("Capacity overflow");l+="0".repeat(Math.min(4,Math.max(0,o-l.length))),l.length%8&&(l+="0".repeat(8-l.length%8));const a="1110110000010001";for(let d=0;l.length!==o;d++)l+=a[d%a.length];const c=Uint8Array.from(l.match(/(.{8})/g).map(d=>+`0b${d}`));return Cd(e,t).encode(c)}function Ar(e,t,n,A,i=!1){const r=Wd(e,t,A,i);let o=0;const s=8*n.length;if(Sd(r,A,(l,a,c)=>{let d=!1;o<s&&(d=(n[o>>>3]>>(7-o&7)&1)!==0,o++),r.data[a][l]=d!==c}),o!==s)throw new Error("QR: bytes left after draw");return r}function Ld(e){const t=e.inverse(),n=f=>{let q=0;for(let p=0,m=1,g=void 0;p<f.length;p++)g===f[p]&&(m++,p!==f.length-1)||(m>=5&&(q+=3+(m-5)),g=f[p],m=1);return q};let A=0;e.data.forEach(f=>A+=n(f)),t.data.forEach(f=>A+=n(f));let i=0,r=e.data;const o=e.width-1,s=e.height-1;for(let f=0;f<o;f++)for(let q=0;q<s;q++){const p=f+1,m=q+1;r[f][q]===r[p][q]&&r[p][q]===r[f][m]&&r[p][q]===r[p][m]&&(i+=3)}const l=f=>{const q=[!0,!1,!0,!0,!0,!1,!0],p=[!1,!1,!1,!1],m=[...q,...p],g=[...p,...q];let w=0;for(let S=0;S<f.length;S++)_i(f,m,S)&&(w+=40),_i(f,g,S)&&(w+=40);return w};let a=0;for(const f of e.data)a+=l(f);for(const f of t.data)a+=l(f);let c=0;e.rectRead(0,1/0,(f,q)=>c+=q?1:0);const d=c/(e.height*e.width)*100,u=10*Math.floor(Math.abs(d-50)/5);return A+i+a+u}function Dd(e,t,n,A){if(A===void 0){const i=vd();for(let r=0;r<jA.length;r++)i.add(Ld(Ar(e,t,n,r,!0)),r);A=i.get()}if(A===void 0)throw new Error("Cannot find mask");return Ar(e,t,n,A)}function Kd(e){if(!tr.includes(e))throw new Error(`Invalid error correction mode=${e}. Expected: ${tr}`)}function Bd(e){if(!er.includes(e))throw new Error(`Encoding: invalid mode=${e}. Expected: ${er}`);if(e==="kanji"||e==="eci")throw new Error(`Encoding: ${e} is not supported (yet?).`)}function Hd(e){if(![0,1,2,3,4,5,6,7].includes(e)||!jA[e])throw new Error(`Invalid mask=${e}. Expected number [0..7]`)}function Ed(e,t="raw",n={}){const A=n.ecc!==void 0?n.ecc:"medium";Kd(A);const i=n.encoding!==void 0?n.encoding:Od(e);Bd(i),n.mask!==void 0&&Hd(n.mask);let r=n.version,o,s=new Error("Unknown error");if(r!==void 0)wd(r),o=nr(r,A,e,i);else for(let c=1;c<=40;c++)try{o=nr(c,A,e,i),r=c;break}catch(d){s=d}if(!r||!o)throw s;let l=Dd(r,A,o,n.mask);l.assertDrawn();const a=n.border===void 0?2:n.border;if(!Number.isSafeInteger(a))throw new Error(`invalid border type=${typeof a}`);if(l=l.border(a,!1),n.scale!==void 0&&(l=l.scale(n.scale)),t==="raw")return l.data;if(t==="ascii")return l.toASCII();if(t==="svg")return l.toSVG();if(t==="gif")return l.toGIF();if(t==="term")return l.toTerm();throw new Error(`Unknown output: ${t}`)}const JA="7026651075534864a4e08f451eb7a9ce",fo=`${typeof window<"u"?window.location.origin.replace("//localhost","//[::1]").replace("//127.0.0.1","//[::1]"):""}/callback.html`,Pd="streaming user-read-playback-state user-modify-playback-state user-read-email playlist-read-private",QA="mockintosh:spotify:tokens",_A="https://api.spotify.com/v1",Et=90,VA=30,Td=16,bA=4;function Rd(){const e=new Uint8Array(64);return crypto.getRandomValues(e),btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}async function Gd(e){const t=new TextEncoder().encode(e),n=await crypto.subtle.digest("SHA-256",t);return btoa(String.fromCharCode(...new Uint8Array(n))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function wn(e){try{localStorage.setItem(QA,JSON.stringify(e))}catch{}}function ir(){try{const e=localStorage.getItem(QA);return e?JSON.parse(e):null}catch{return null}}function Yd(){try{localStorage.removeItem(QA)}catch{}}async function Nd(e,t){const n=new URLSearchParams({grant_type:"authorization_code",code:e,redirect_uri:fo,client_id:JA,code_verifier:t}),A=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:n.toString()});if(!A.ok)throw new Error(`Token exchange failed: ${A.status}`);const i=await A.json();return{access_token:i.access_token,refresh_token:i.refresh_token,expires_at:Date.now()+i.expires_in*1e3}}async function Ud(e){const t=new URLSearchParams({grant_type:"refresh_token",refresh_token:e,client_id:JA}),n=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:t.toString()});if(!n.ok)throw new Error(`Token refresh failed: ${n.status}`);const A=await n.json();return{access_token:A.access_token,refresh_token:A.refresh_token??e,expires_at:Date.now()+A.expires_in*1e3}}async function Un(e,t){const n=e.current;if(!n)return null;if(Date.now()>n.expires_at-6e4)try{const A=await Ud(n.refresh_token);return e.current=A,wn(A),t(A),A.access_token}catch{return e.current=null,Yd(),null}return n.access_token}async function Fd(e,t,n){const A=await Un(t,n);if(!A)return null;const i=await fetch(`${_A}${e}`,{headers:{Authorization:`Bearer ${A}`}});return i.ok?i.json():null}async function $e(e,t,n,A){const i=await Un(n,A);if(!i)return!1;const r=await fetch(`${_A}${e}`,{method:"PUT",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:t!=null?JSON.stringify(t):void 0});return r.ok||r.status===204}async function rr(e,t,n){const A=await Un(t,n);if(!A)return!1;const i=await fetch(`${_A}${e}`,{method:"POST",headers:{Authorization:`Bearer ${A}`}});return i.ok||i.status===204}async function Xd(e,t){const n=await Fd("/me/playlists?limit=50",e,t);return n!=null&&n.items?n.items.map(A=>({id:A.id,name:A.name,uri:A.uri,images:A.images??[]})):[]}let or=!1,hn=null;function jd(){return or?Promise.resolve():hn||(hn=new Promise(e=>{window.onSpotifyWebPlaybackSDKReady=()=>{or=!0,e()};const t=document.createElement("script");t.src="https://sdk.scdn.co/spotify-player.js",document.head.appendChild(t)}),hn)}function Jd(e,t,n,A,i){const r=t*n;for(let o=0;o<r;o++){const s=o<<2;i[o]=e[s]*.299+e[s+1]*.587+e[s+2]*.114}for(let o=0;o<r;o++){const s=i[o],l=s<129?1:0;A[o]=l;const a=(s-(l?0:255))/8;i[o+1]+=a,i[o+2]+=a,i[o+t-1]+=a,i[o+t]+=a,i[o+t+1]+=a,i[o+(t<<1)]+=a}}function Qd(e,t,n){if(e.current&&e.current.canvas.width===t&&e.current.canvas.height===n)return e.current;const A=new OffscreenCanvas(t,n),i=A.getContext("2d",{willReadFrequently:!0});return e.current={canvas:A,ctx:i,pixels:new Uint8Array(t*n),luminance:new Float32Array(t*n)},e.current}async function _d(e,t,n,A){try{const r=await(await fetch(e)).blob(),o=await createImageBitmap(r),s=Qd(A,t,n);s.ctx.drawImage(o,0,0,t,n),o.close();const l=s.ctx.getImageData(0,0,t,n);return s.luminance.fill(0),Jd(l.data,t,n,s.pixels,s.luminance),s.pixels}catch{return null}}let Nt=null,Zt=null,wA=null,nt=null;function po(e,t,n){if(Q(e,n)<=t)return e;let A=e;for(;A.length>0&&Q(A+"...",n)>t;)A=A.slice(0,-1);return A+"..."}const $d={id:"spotify",title:"Spotify Player",icon:"icon/spotify",defaultSize:{width:380,height:280},scrollable:!1,render(e,t,n){const A=n._sprites,i=()=>e.scheduleRender(),[r,o]=e.useState(ir()),[s,l]=e.useState([]),[a,c]=e.useState(-1),[d,u]=e.useState(null),[f,q]=e.useState(null),[p,m]=e.useState(""),[g,w]=e.useState(50),[S,y]=e.useState(!1),[v,C]=e.useState(0),[W,b]=e.useState(""),[k,V]=e.useState(null),z=e.useRef(r),E=e.useRef(""),K=e.useRef(null),D=e.useRef(!1),H=e.useRef(""),N=e.useRef(null),X=e.useRef(k);z.current=r;const L=R=>{o(R),wn(R)};if(X.current=k,e.useEffect(()=>{!r||D.current||(D.current=!0,(async()=>{try{await jd(),y(!0);const R=window.Spotify;if(!(R!=null&&R.Player))return;Zt=new R.Player({name:"Mockintosh Player",getOAuthToken:j=>{var rt;const et=(rt=z.current)==null?void 0:rt.access_token;et?j(et):Un(z,L).then(ct=>{ct&&j(ct)})},volume:g/100}),Zt.addListener("ready",({device_id:j})=>{wA=j,$e("/me/player",{device_ids:[j],play:!1},z,L),i()}),Zt.addListener("player_state_changed",j=>{var ct,_t,$t,Pt;if(!j){u(null);return}const et=(ct=j.track_window)==null?void 0:ct.current_track;u({track:et?{name:et.name,artists:et.artists,album:et.album,duration_ms:et.duration_ms}:null,paused:j.paused,position_ms:j.position,duration_ms:j.duration});const rt=((Pt=($t=(_t=et==null?void 0:et.album)==null?void 0:_t.images)==null?void 0:$t[0])==null?void 0:Pt.url)??"";rt&&rt!==H.current&&(H.current=rt,m(rt))}),Zt.addListener("initialization_error",({message:j})=>{b(j)}),Zt.addListener("authentication_error",({message:j})=>{console.warn("Spotify auth error:",j),b("Spotify Premium required for playback")}),await Zt.connect()}catch(R){b(R.message??"SDK failed")}})(),Xd(z,L).then(R=>{R.length>0&&l(R)}))},[r]),e.useEffect(()=>{if(!p)return;const R=qo(t.width,t.height);_d(p,R,R,K).then(j=>{j&&q(new Uint8Array(j))})},[p]),e.useEffect(()=>(Nt&&window.removeEventListener("message",Nt),Nt=async R=>{var j;if(((j=R.data)==null?void 0:j.type)==="spotify-callback"){if(R.data.error){b(R.data.error);return}if(!(!R.data.code||!E.current))try{const et=await Nd(R.data.code,E.current);wn(et),o(et),b("")}catch(et){b(et.message??"Auth failed")}}},window.addEventListener("message",Nt),()=>{Nt&&(window.removeEventListener("message",Nt),Nt=null)}),[]),e.useEffect(()=>{if(!k||k.status!=="qr")return;nt!==null&&(clearInterval(nt),nt=null),N.current=null;const R=(k.interval??5)*1e3;return nt=setInterval(async()=>{N.current=nt;const j=X.current;if(!j||j.status!=="qr"){nt!==null&&(clearInterval(nt),nt=null);return}if(Date.now()>j.expiresAt){nt!==null&&(clearInterval(nt),nt=null),V({...j,status:"expired"}),i();return}try{const rt=await(await fetch(`/api/spotify/device-poll?poll_id=${encodeURIComponent(j.pollId)}`)).json();if(rt.status==="ready"){nt!==null&&(clearInterval(nt),nt=null),V(null);const ct={access_token:rt.access_token,refresh_token:rt.refresh_token,expires_at:Date.now()+rt.expires_in*1e3};wn(ct),o(ct)}else rt.status==="expired"?(nt!==null&&(clearInterval(nt),nt=null),V({...j,status:"expired"})):rt.status==="denied"&&(nt!==null&&(clearInterval(nt),nt=null),V({...j,status:"denied"}))}catch{}i()},R),N.current=nt,()=>{nt!==null&&(clearInterval(nt),nt=null),N.current=null}},[k==null?void 0:k.pollId,k==null?void 0:k.status]),t.clear(B),!r){eu(t,A,e,E,b,k,V,i),W&&t.drawText(W,8,t.height-16,{font:"body",color:h});return}Au(t,s,a,v,z,L,c,i),iu(t,d,f,A,z,L,g,w,i),W&&t.drawText(W,Et+4,t.height-4,{font:"body",color:h})},onEvent(e,t,n,A){e.useState(ir()),e.useState([]),e.useState(-1),e.useState(null),e.useState(null),e.useState(""),e.useState(50),e.useState(!1);const[i,r]=e.useState(0);if(e.useState(""),e.useState(null),e.useRef(null),e.useRef(""),e.useRef(null),e.useRef(!1),e.useRef(""),e.useRef(null),e.useRef(null),t.type==="scroll"&&t.x!==void 0&&t.x<Et){const o=t.deltaY??0;r(Math.max(0,i+o))}},onClose(e){Nt&&(window.removeEventListener("message",Nt),Nt=null),nt!==null&&(clearInterval(nt),nt=null),Zt&&(Zt.disconnect(),Zt=null,wA=null)}};function tu(e,t,n,A,i){const r=t.length;e.fillRect(n,A,r*i,r*i,B);for(let o=0;o<r;o++)for(let s=0;s<r;s++)t[o][s]&&e.fillRect(n+s*i,A+o*i,i,i,h)}function eu(e,t,n,A,i,r,o,s){if(e.fillRect(0,0,e.width,e.height,h),r){if(r.status==="loading"){const b="Connecting to Spotify...",k=Q(b,"body");e.drawText(b,Math.floor((e.width-k)/2),Math.floor(e.height/2),{font:"body",color:B});return}if(r.status==="expired"||r.status==="denied"){const b=r.status==="expired"?"QR code expired.":"Access denied.",k=Q(b,"body");e.drawText(b,Math.floor((e.width-k)/2),Math.floor(e.height/2)-20,{font:"body",color:B});const V=80,z=18,E=Math.floor((e.width-V)/2),K=Math.floor(e.height/2);e.fillRect(E,K,V,z,B),e.drawRect(E,K,V,z,h);const D="Try Again",H=Q(D,"body");e.drawText(D,E+Math.floor((V-H)/2),K+4,{font:"body",color:h}),e.hitRegion("spotify-qr-retry",{x:E,y:K,w:V,h:z},{onClick:()=>o(null)});return}if(r.qrMatrix){const b=r.qrMatrix.length,k=e.width-16,V=e.height-50,z=Math.max(1,Math.floor(Math.min(k,V)/b)),E=b*z,K=Math.floor((e.width-E)/2),D=Math.floor((e.height-E)/2)-8;tu(e,r.qrMatrix,K,D,z),e.drawRect(K-1,D-1,E+2,E+2,B);const H=r.userCode,N=Q(H,"menu");e.drawText(H,Math.floor((e.width-N)/2),D+E+4,{font:"menu",color:B});const X="Scan with your phone",L=Q(X,"body");e.drawText(X,Math.floor((e.width-L)/2),D-12,{font:"body",color:B})}const C="Cancel",W=Q(C,"body");e.drawText(C,Math.floor((e.width-W)/2),e.height-14,{font:"body",color:B}),e.hitRegion("spotify-qr-cancel",{x:Math.floor((e.width-W)/2)-2,y:e.height-16,w:W+4,h:12},{onClick:()=>o(null)});return}const l=Math.floor(e.width/2),a=Math.floor(e.height/2)-20,c="To continue, login to Spotify:",d=Q(c,"body");e.drawText(c,l-Math.floor(d/2),a-36,{font:"body",color:B});const u=t==null?void 0:t.get("icon/spotify");u&&e.blitInverted(u,l-Math.floor(u.width/2),a-16);const f=80,q=18,p=l-Math.floor(f/2),m=a+24;e.fillRect(p,m,f,q,B),e.drawRect(p,m,f,q,h);const g="Log in with QR",w=Q(g,"body");e.drawText(g,p+Math.floor((f-w)/2),m+4,{font:"body",color:h}),e.hitRegion("spotify-qr-login",{x:p,y:m,w:f,h:q},{onClick:()=>{o({status:"loading",pollId:"",verificationUri:"",userCode:"",interval:5,expiresAt:0,qrMatrix:null}),s(),fetch("/api/spotify/device-request",{method:"POST"}).then(C=>C.json()).then(C=>{if(C.error){i(C.error),o(null),s();return}const W=C.verification_uri_complete??C.verification_uri,b=nu(W);o({status:"qr",pollId:C.poll_id,verificationUri:W,userCode:C.user_code,interval:C.interval??5,expiresAt:Date.now()+(C.expires_in??300)*1e3,qrMatrix:b}),s()}).catch(C=>{i(C.message??"Failed to start login"),o(null),s()})}});const S="Log in via browser",y=Q(S,"body"),v=m+q+8;e.drawText(S,l-Math.floor(y/2),v,{font:"body",color:B}),e.hitRegion("spotify-browser-login",{x:l-Math.floor(y/2)-2,y:v-2,w:y+4,h:12},{onClick:()=>{const C=Rd();A.current=C,Gd(C).then(W=>{const b=new URLSearchParams({response_type:"code",client_id:JA,scope:Pd,redirect_uri:fo,code_challenge_method:"S256",code_challenge:W});window.open(`https://accounts.spotify.com/authorize?${b.toString()}`,"spotify-auth","width=500,height=700")})}})}function nu(e){try{const t=Ed(e,"raw"),n=Object.keys(t).length,A=[];for(let i=0;i<n;i++)A.push(Array.from(t[i]));return A}catch{return null}}function Au(e,t,n,A,i,r,o,s){e.fillRect(0,0,Et,e.height,B),e.drawVLine(Et-1,0,e.height,h);const l=gt("body"),a=2;e.drawText("PLAYLISTS",4,a,{font:"body",color:h}),e.drawHLine(0,a+l+1,Et-1,h);const c=a+l+2;e.pushClip(0,c,Et-1,e.height-c);for(let d=0;d<t.length;d++){const u=c+d*l-A;if(u+l<c||u>e.height)continue;const f=d===n;f&&e.fillRect(0,u,Et-1,l,h);const q=po(t[d].name,Et-8,"body");e.drawText(q,4,u,{font:"body",color:f?B:h});const p=d;e.hitRegion(`playlist-${d}`,{x:0,y:u,w:Et-1,h:l},{onClick:()=>{o(p),wA&&$e("/me/player/play",{context_uri:t[p].uri},i,r),s()}})}e.popClip()}function qo(e,t){const n=Math.min(e-Et-bA*2,t-VA-Td-bA*2);return Math.max(32,n)}function iu(e,t,n,A,i,r,o,s,l){var j,et,rt;const a=Et,c=e.width-Et,d=qo(e.width,e.height),u=a+Math.floor((c-d)/2),f=bA;n&&n.length===d*d?e.blit1bitPixels(n,d,d,u,f):e.fillPattern(u,f,d,d,"gray25"),e.drawRect(u,f,d,d,h);const q=f+d+2,p=((j=t==null?void 0:t.track)==null?void 0:j.name)??"No track playing",m=((rt=(et=t==null?void 0:t.track)==null?void 0:et.artists)==null?void 0:rt.map(ct=>ct.name).join(", "))??"",g=m?`${p} - ${m}`:p,w=po(g,c-8,"body");e.drawText(w,a+4,q,{font:"body",color:h});const S=e.height-VA;e.drawHLine(a,S,c,h);const y=16,v=6,C=y*3+v*2,W=a+Math.floor((c-C)/2)-30,b=S+Math.floor((VA-y)/2),k=A==null?void 0:A.get("spotify/prev");k&&e.blit(k,W,b+2),e.hitRegion("spotify-prev",{x:W,y:b,w:y,h:y},{onClick:()=>{rr("/me/player/previous",i,r)}});const V=W+y+v,z=(t==null?void 0:t.paused)??!0,E=A==null?void 0:A.get(z?"spotify/play":"spotify/pause");E&&e.blit(E,V,b),e.drawRect(V-1,b-1,y+2,y+2,h),e.hitRegion("spotify-playpause",{x:V,y:b,w:y,h:y},{onClick:()=>{$e(z?"/me/player/play":"/me/player/pause",null,i,r)}});const K=V+y+v,D=A==null?void 0:A.get("spotify/next");D&&e.blit(D,K,b+2),e.hitRegion("spotify-next",{x:K,y:b,w:y,h:y},{onClick:()=>{rr("/me/player/next",i,r)}});const H=A==null?void 0:A.get("spotify/volume"),N=K+y+v+12;H&&e.blit(H,N,b+2);const X=N+14,L=e.width-X-8,R=b+Math.floor(y/2);if(L>10){e.drawHLine(X,R,L,h),e.drawHLine(X,R+1,L,h);const ct=X+Math.floor(o/100*(L-4));e.fillRect(ct,R-3,4,8,B),e.drawRect(ct,R-3,4,8,h),e.hitRegion("spotify-volume",{x:X,y:R-6,w:L,h:12},{onMouseDown:_t=>{const $t=Math.max(0,Math.min(1,(_t-X)/L)),Pt=Math.round($t*100);s(Pt),Zt&&Zt.setVolume(Pt/100),$e(`/me/player/volume?volume_percent=${Pt}`,null,i,r),l()},onDrag:_t=>{const $t=Math.max(0,Math.min(1,(_t-X)/L)),Pt=Math.round($t*100);s(Pt),Zt&&Zt.setVolume(Pt/100),l()}})}}function Ue(e,t,n){const A=new Uint8Array(e*t),i=new Uint8Array(e*t);for(let r=0;r<t;r++){const o=n[r]||"";for(let s=0;s<e;s++){const l=o[s]||".";l==="#"?(A[r*e+s]=h,i[r*e+s]=1):l==="."?(A[r*e+s]=B,i[r*e+s]=0):(A[r*e+s]=B,i[r*e+s]=1)}}return{width:e,height:t,data:A,mask:i}}const ru=Ue(32,32,["........######..................",".....###########................","....#############...............","...####......#####..............","..###..........####.............",".###.....####...####............",".##....########..###............","###...##########..###...........","##...####....####..##...........","##..####......####.##...........","##..###........###.##...........","##..###........###.##...........","##..####......####.##...........","##...####....####..##...........","###...##########..###...........",".##....########..###............",".###.....####...####............","..###..........####.............","...####......#####..............","....#############...............",".....###########................","........######..................","................................","................................","................................","................................","................................","................................","................................","................................","................................","................................"]),ou=Ue(16,16,["................","..##............","..####..........","..######........","..########......","..##########....","..############..","..#############.","..#############.","..############..","..##########....","..########......","..######........","..####..........","..##............","................"]),su=Ue(16,16,["................","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","................"]),lu=Ue(12,12,["............",".#....#.....",".##...##....",".###..###...",".####.####..",".##########.",".##########.",".####.####..",".###..###...",".##...##....",".#....#.....","............"]),au=Ue(12,12,["............",".....#....#.","....##...##.","...###..###.","..####.####.",".##########.",".##########.","..####.####.","...###..###.","....##...##.",".....#....#.","............"]),cu=Ue(12,12,["............","......#.....",".....##.....","..#.###.....",".##.####.#..",".##.####.#.#",".##.####.#.#",".##.####.#..","..#.###.....",".....##.....","......#.....","............"]),du={"icon/spotify":ru,"spotify/play":ou,"spotify/pause":su,"spotify/prev":lu,"spotify/next":au,"spotify/volume":cu},ne=16,mo=16,vA=16,ho=24;function uu(e,t){const A=260-ne*2-8,r=Yn(e,A,"body").length*mo,o=t?vA+8:0;return{width:260,height:ne+r+o+8+ho+ne}}const fu={id:"__dialog__",title:"",icon:"icon/computer",defaultSize:{width:260,height:120},scrollable:!1,resizable:!1,render(e,t,n){const{message:A,buttons:i,showInput:r}=n,[o]=e.useState(mt(n.inputDefault??"")),s=e.useRef(!1),l=e.useRef(!1);s.current||(s.current=!0,o.focused=!0,o.selectionStart=0,o.selectionEnd=o.value.length,o.cursorPos=o.value.length);const a=t.width,c=t.height;t.clear(B),t.drawRect(-1,-1,a+2,c+2,h),t.drawRect(1,1,a-2,c-2,h),t.drawRect(2,2,a-4,c-4,h);const d=a-ne*2-8,u=Yn(A,d,"body");let f=ne;for(const p of u)t.drawText(p,ne,f,{font:"body",color:h}),f+=mo;if(r){f+=4;const p=ne,m=a-ne*2;t.drawTextInput(o,p,f,m,vA,{id:"dialog-input",onChange:()=>e.scheduleRender()}),f+=vA+4}f+=8;const q=t.getWindow();if(q===null)throw new Error("Dialog requires a window context");if(!l.current){let p=a-ne;for(let m=i.length-1;m>=0;m--){const g=i[m],w=Q(g,"menu")+24;p-=w+(m<i.length-1?12:0);const S=F(f,p,f+ho,p+w),y=lt(q,S,g,!0,0,0,1,0,m),v=n._resolve;y.ref.contrlAction=(C,W)=>{if(W===pt){const b=r?o.value:C.ref.contrlTitle;v(b)}}}l.current=!0}qe(q,t.port)},onEvent(e,t,n,A){const{buttons:i,showInput:r}=n,[o]=e.useState(mt(n.inputDefault??""));if(e.useRef(!1),t.type==="keyDown"){if(t.key==="Enter"){const s=n._resolve,l=i[i.length-1],a=r?o.value:l;s(a);return}if(t.key==="Escape"||t.metaKey&&t.key==="."){const s=n._resolve,l=i.find(a=>a==="Cancel");l&&s(l);return}r&&Sn(o,t.key,t.code??"",t.shiftKey??!1,t.metaKey??!1,t.ctrlKey??!1)}}},rA=16,sr=24,lr="Increment",pu={id:"testing",title:"Testing",icon:"icon/computer",defaultSize:{width:260,height:120},scrollable:!1,render(e,t,n){const[A,i]=e.useState(0),r=e.useRef(!1);t.clear(B);const o=t.width,s=t.height,l=`Current count: ${A}`;t.drawText(l,rA,rA,{font:"body",color:h});const a=t.getWindow();if(a===null)throw new Error("Testing app requires a window context");if(!r.current){a.controlList.length=0;const c=Q(lr,"menu")+24,d=Math.floor((o-c)/2),u=s-rA-sr,f=F(u,d,u+sr,d+c),q=lt(a,f,lr,!0,0,0,1,0);q.ref.contrlData={default:!0},q.ref.contrlAction=(p,m)=>{m===pt&&i(g=>g+1)},r.current=!0}qe(a,t.port)}};let gn=null;function qu(){return new Function(`${Rt}
const invoke_event_sync = (target, name, args) => {
  const root = lmenv();
  primitives(root, parent_deck(target));
  constants(root);
  const block = lmblk();
  blk_op(block, op.DROP);
  blk_cat(block, event_invoke(target, name, lml(args), null, 1));
  pushstate(root);
  issue(root, block);
  let quota = 10000;
  while (running() && quota-- > 0) runop();
  const result = running() ? NIL : arg();
  popstate();
  return result;
};
return { deck_read, deck_write, ifield, iwrite, dget, lmn, lms, ls, ln, lb, getpair, getrect, make_pair: (value) => lml(value), image_is, button_is, field_is, slider_is, grid_is, canvas_is, contraption_is, card_is, deck_is, widget_is, prototype_is, invoke_event_sync, fire_event_async, n_event, COLORS, pal_pat };`)()}function ar(e){if(!e||typeof e!="object")return null;const t=e;return Array.isArray(t.v)?t:null}function mu(){if(gn)return gn;const e=qu();return gn={readDeck(t){return e.deck_read(t)},writeDeck(t,n){return e.deck_write(t,n)},getField(t,n){return e.ifield(t,n)},setField(t,n,A){return e.iwrite(t,e.lms(n),A)},getString(t){return e.ls(t)},getNumber(t){return e.ln(t)},getBoolean(t){return e.lb(t)},makeNumber(t){return e.lmn(t)},makeString(t){return e.lms(t)},getPair(t){return e.getpair(t)},getRect(t){return e.getrect(t)},makePair(t,n){return e.make_pair([e.lmn(t),e.lmn(n)])},dictValues(t){const n=ar(t);return n?n.v:[]},dictKeys(t){var A;const n=ar(t);return n?((A=n.k)==null?void 0:A.map(i=>e.ls(i)))??[]:[]},cards(t){return this.dictValues(e.ifield(t,"cards"))},widgets(t){return this.dictValues(e.ifield(t,"widgets"))},isImage(t){return e.image_is(t)},isButton(t){return e.button_is(t)},isField(t){return e.field_is(t)},isSlider(t){return e.slider_is(t)},isGrid(t){return e.grid_is(t)},isCanvas(t){return e.canvas_is(t)},isContraption(t){return e.contraption_is(t)},isCard(t){return e.card_is(t)},isDeck(t){return e.deck_is(t)},isWidget(t){return e.widget_is(t)},isPrototype(t){return e.prototype_is(t)},fireEvent(t,n,A){e.fire_event_async(t,n,A??e.lms(""))},invokeEvent(t,n,A=[]){e.n_event(t,[e.lms(n),...A])},invokeEventSync(t,n,A=[]){return e.invoke_event_sync(t,n,A)},colors:e.COLORS,samplePattern(t,n,A,i){return e.pal_pat(t,n,A,i)}},gn}const T=mu(),hu=`{deck}
version:1
card:0
size:[512,342]

{card:home}
{widgets}
`;function gu(e){const t=e>>>0;return[t>>>16&255,t>>>8&255,t&255,t>>>24&255]}function xu(e,t,n,A,i){return n<=0?e.colors[0]:n===1?e.colors[15]:n>=32&&n<=47?e.colors[n-32]:n>=2&&n<=31&&t&&e.samplePattern(t,n,A,i)?e.colors[15]:e.colors[0]}function $A(e,t,n){const{x:A,y:i}=t.size,r=new ImageData(A,i);for(let o=0;o<i;o++)for(let s=0;s<A;s++){const l=t.pix[s+o*A],[a,c,d,u]=gu(xu(e,n,l,s,o)),f=(s+o*A)*4;r.data[f]=a,r.data[f+1]=c,r.data[f+2]=d,r.data[f+3]=u}return r}function ti(e){var n;const t=T.getField(e,"patterns");return((n=t==null?void 0:t.pal)==null?void 0:n.pix)??null}function Te(e,t,n=""){const A=T.getField(e,t);return T.getString(A)||n}function yu(e,t,n=0){const A=T.getField(e,t),i=T.getNumber(A);return Number.isFinite(i)?i:n}function sn(e,t,n=!1){const A=T.getField(e,t);return A==null?n:T.getBoolean(A)}function kA(e,t,n={x:0,y:0,w:0,h:0}){const A=T.getField(e,t);return A==null?n:T.getPair(A)}function go(e,t){const n=Te(e,"font",t);return ls(n)?n:t}function Vu(e,t=0,n=0){const A=kA(e,"pos"),i=kA(e,"size");return{x:t+A.x,y:n+A.y,w:i.x,h:i.y}}function bu(e,t,n){return t>=e.x&&n>=e.y&&t<e.x+e.w&&n<e.y+e.h}function wu(e,t,n,A){const i=Te(t,"style","round"),r=Te(t,"text"),o=sn(t,"value");if(i==="check")e.drawRect(n.x,n.y,12,12,h),o&&e.drawText("X",n.x+2,n.y+1,{font:"body",color:h}),e.drawText(r,n.x+16,n.y,{font:"body",color:h});else{e.fillRect(n.x,n.y,n.w,n.h,B),e.drawRect(n.x,n.y,n.w,n.h,h);const s=go(t,"menu"),l=Q(r,s),a=n.x+Math.max(2,Math.floor((n.w-l)/2)),c=n.y+Math.max(1,Math.floor((n.h-10)/2));e.drawText(r,a,c,{font:s,color:h})}A&&e.invertRect(n.x-1,n.y-1,n.w+2,n.h+2)}function vu(e,t,n,A){sn(t,"border",!0)&&e.drawRect(n.x,n.y,n.w,n.h,h);const i=T.getString(T.getField(t,"value")),r=go(t,Te(t,"style","rich")==="code"?"mono":"body");e.drawTextBlock({text:i,x:n.x+3,y:n.y+3,maxWidth:Math.max(1,n.w-6),font:r,color:h}),A&&e.invertRect(n.x-1,n.y-1,n.w+2,n.h+2)}function ku(e,t,n,A){const i=T.dictValues(T.getField(t,"interval")),r=i.length>0?T.getNumber(i[0]):0,o=i.length>1?T.getNumber(i[1]):100,s=yu(t,"value",r),l=o===r?0:Math.max(0,Math.min(1,(s-r)/(o-r))),a=n.x+Math.floor(l*Math.max(0,n.w-8)),c=n.y+Math.floor(n.h/2);e.drawRect(n.x,n.y,n.w,n.h,h),e.drawHLine(n.x+2,c,Math.max(0,n.w-4),h),e.fillRect(a,n.y+2,8,Math.max(4,n.h-4),h),A&&e.invertRect(n.x-1,n.y-1,n.w+2,n.h+2)}function Iu(e,t,n,A){const i=T.getField(t,"value"),r=T.dictKeys(i),o=T.dictValues(i),s=o.length>0?T.dictValues(o[0]).length:0,l=r.length>0?Math.floor(n.w/r.length):n.w;e.drawRect(n.x,n.y,n.w,n.h,h);for(let c=0;c<r.length;c++){const d=n.x+c*l;e.drawRect(d,n.y,l,14,h),e.drawText(r[c],d+2,n.y+2,{font:"menu",color:h})}const a=Math.max(0,Math.floor((n.h-16)/12));for(let c=0;c<Math.min(s,a);c++){const d=n.y+16+c*12;for(let u=0;u<r.length;u++){const f=n.x+u*l,q=T.dictValues(o[u]),p=c<q.length?T.getString(q[c]):"";e.drawText(p,f+2,d,{font:"body",color:h})}}A&&e.invertRect(n.x-1,n.y-1,n.w+2,n.h+2)}function zu(e,t,n,A,i){sn(n,"border",!0)&&e.drawRect(A.x,A.y,A.w,A.h,h);const r=T.getField(n,"image");T.isImage(r)&&e.blitImageData($A(T,r,ti(t)),A.x,A.y),i&&e.invertRect(A.x-1,A.y-1,A.w+2,A.h+2)}function xo(e,t,n,A,i,r=0,o=0){for(let s=0;s<n.length;s++){const l=n[s];if(Te(l,"show","solid")==="none")continue;const c=Vu(l,r,o),d=s===i;if(A.push({index:s,widget:l,rect:c}),T.isButton(l)){wu(e,l,c,d);continue}if(T.isField(l)){vu(e,l,c,d);continue}if(T.isSlider(l)){ku(e,l,c,d);continue}if(T.isGrid(l)){Iu(e,l,c,d);continue}if(T.isCanvas(l)){zu(e,t,l,c,d);continue}if(T.isContraption(l)){const u=T.getField(l,"image");T.isImage(u)&&e.blitImageData($A(T,u,ti(t)),c.x,c.y),xo(e,t,T.widgets(l),A,d?0:-1,c.x,c.y)}}}async function Mu(e,t,n){var u,f,q;if(!e.deck)return;const A=n._fs,i=n._os;if(!A||!i)return;let r=e.fileId,o=e.fileName;if(!r){const p=await i.showDialog({message:"Save the current Decker document to the internal filesystem.",buttons:["Cancel","Save"],showInput:!0,inputDefault:o||"Untitled.deck"});if(!p||p==="Cancel")return;o=p}const s=r?A.getNode(r):null,l=(s==null?void 0:s.parentId)??((f=A.findByName(((u=A.findByName("__root__","Mockintosh HD"))==null?void 0:u.id)??"__root__","Development"))==null?void 0:f.id)??((q=A.findByName("__root__","Mockintosh HD"))==null?void 0:q.id)??"__root__",a=o.toLowerCase().endsWith(".html")||e.sourceFormat==="html",c=T.writeDeck(e.deck,a),d=await A.writeFile(l,o,c,"text");t(p=>({...p,fileId:d.id,fileName:d.name,sourceFormat:a?"html":"deck",dirty:!1}))}const Cu={id:"decker",title:"Decker",icon:"icon/computer",defaultSize:{width:512,height:342},windowKind:"presentation",scrollable:!1,resizable:!1,render(e,t,n){const[A,i]=e.useState({deck:null,fileId:n.fileId??null,fileName:n.title??n.fileName??"Untitled.deck",sourceFormat:"deck",dirty:!1,error:null}),[r]=e.useState("interact"),[o]=e.useState(0),[s]=e.useState(-1),l=e.useRef([]);if(e.useRef(null),e.useEffect(()=>{let u=!1;return(async()=>{try{const q=n._fs;let p=n.initialSource??hu,m=n.title??n.fileName??"Untitled.deck";if(q&&n.fileId){const v=await q.readFile(n.fileId);v&&(p=v);const C=q.getNode(n.fileId);(C==null?void 0:C.kind)==="file"&&(m=C.name)}const g=T.readDeck(p),w=T.cards(g),S=T.getField(g,"card"),y=w.findIndex(v=>v===S);if(u)return;setSelectedCardIndex(y>=0?y:0),setSelectedWidgetIndex(-1),i({deck:g,fileId:n.fileId??null,fileName:m,sourceFormat:m.toLowerCase().endsWith(".html")||p.includes('language="decker"')?"html":"deck",dirty:!1,error:null})}catch(q){if(u)return;i(p=>({...p,error:q instanceof Error?q.message:"Failed to load Decker file."}))}})(),()=>{u=!0}},[n.fileId,n.initialSource]),t.clear(B),l.current=[],A.error){t.drawTextBlock({text:A.error,x:8,y:24,maxWidth:t.width-16,font:"body",color:h});return}if(!A.deck){t.drawText("Loading Decker...",8,24,{font:"body",color:h});return}const a=T.cards(A.deck),c=a[o]??a[0];if(!c){t.drawText("This deck has no cards.",8,24,{font:"body",color:h});return}const d=T.getField(c,"image");T.isImage(d)&&t.blitImageData($A(T,d,ti(A.deck)),0,0),xo(t,A.deck,T.widgets(c),l.current,r==="widgets"?s:-1),r==="draw"&&(t.fillRect(8,8,196,18,B),t.drawRect(8,8,196,18,h),t.drawText("Draw mode shell is native; tools follow next.",12,11,{font:"body",color:h}))},onEvent(e,t,n,A){const[i,r]=e.useState({deck:null,fileId:n.fileId??null,fileName:n.title??n.fileName??"Untitled.deck",sourceFormat:"deck",dirty:!1,error:null}),[o,s]=e.useState("interact"),[l,a]=e.useState(0),[c,d]=e.useState(-1),u=e.useRef([]),f=e.useRef(null);if(!i.deck)return;if(t.type==="mouseMove"&&o==="widgets"&&f.current){const g=(t.x??0)-f.current.startX,w=(t.y??0)-f.current.startY;T.setField(f.current.widget,"pos",T.makePair(f.current.origin.x+g,f.current.origin.y+w)),r(S=>({...S,dirty:!0}));return}if(t.type==="mouseUp"&&o==="widgets"){f.current=null;return}if(t.type==="keyDown"){if(t.key==="1"&&s("interact"),t.key==="2"&&s("widgets"),t.key==="3"&&s("draw"),t.key==="ArrowRight"){const g=T.cards(i.deck);a(w=>Math.min(g.length-1,w+1))}t.key==="ArrowLeft"&&a(g=>Math.max(0,g-1));return}if(t.type!=="mouseDown")return;const q=t.x??0,p=t.y??0,m=u.current;for(let g=m.length-1;g>=0;g--){const w=m[g];if(bu(w.rect,q,p)){if(o==="widgets"){d(w.index),f.current={widget:w.widget,startX:q,startY:p,origin:kA(w.widget,"pos")};return}if(o==="interact"){if(T.isButton(w.widget)&&Te(w.widget,"style")==="check"){const C=sn(w.widget,"value")?0:1;T.setField(w.widget,"value",T.makeNumber(C))}T.invokeEventSync(w.widget,"click");const S=T.cards(i.deck),y=T.getField(i.deck,"card"),v=S.findIndex(C=>C===y);v>=0&&a(v),r(C=>({...C,dirty:!0}));return}}}},getMenubar(e,t){const[n,A]=e.useState({deck:null,fileId:t.fileId??null,fileName:t.title??t.fileName??"Untitled.deck",sourceFormat:"deck",dirty:!1,error:null}),[i,r]=e.useState("interact"),[o,s]=e.useState(0),[l]=e.useState(-1);e.useRef([]),e.useRef(null);const a=n.deck?T.cards(n.deck):[],c=a[o]??a[0]??null,d=c&&l>=0?T.widgets(c)[l]??null:null,u=()=>A(p=>({...p,dirty:!0})),f=p=>{if(!d)return;const m=sn(d,p)?0:1;T.setField(d,p,T.makeNumber(m)),u()},q=p=>{d&&(T.setField(d,"show",T.makeString(p)),u())};return[{label:"File",items:[{label:"Save",shortcut:"S",disabled:!n.deck,onClick:()=>{Mu(n,A,t)}}]},{label:"View",items:[{type:"radiogroup",value:i,onValueChange:p=>r(p),items:[{label:"Interact",value:"interact"},{label:"Widgets",value:"widgets"},{label:"Draw",value:"draw"}]}]},{label:"Cards",items:[{label:"Previous Card",shortcut:"[",disabled:o<=0,onClick:()=>s(p=>Math.max(0,p-1))},{label:"Next Card",shortcut:"]",disabled:!n.deck||o>=Math.max(0,T.cards(n.deck).length-1),onClick:()=>s(p=>n.deck?Math.min(T.cards(n.deck).length-1,p+1):p)}]},{label:"Widget",items:[{label:"Toggle Locked",disabled:i!=="widgets"||!d,onClick:()=>f("locked")},{label:"Toggle Animated",disabled:i!=="widgets"||!d,onClick:()=>f("animated")},{label:"Toggle Volatile",disabled:i!=="widgets"||!d,onClick:()=>f("volatile")},{type:"separator"},{label:"Show Solid",disabled:i!=="widgets"||!d,onClick:()=>q("solid")},{label:"Show Transparent",disabled:i!=="widgets"||!d,onClick:()=>q("transparent")},{label:"Show Invert",disabled:i!=="widgets"||!d,onClick:()=>q("invert")},{label:"Show None",disabled:i!=="widgets"||!d,onClick:()=>q("none")}]}]}},Wu=`{deck}
version:1
card:0
size:[512,342]
name:"Dialogizer"
author:"John Earnest"

{sounds}
scrape:"%%SND0/QABAAD+/gECAgQGAAL/AP/+/wADBAAAAPwAAQP+AAAHAfz/AAX9AAcDAf4D/wABAv7/BgX8+f/9AAMDBwAAAggAAfv5/vkCBgD3A///BAAEAP70AwD6/v8I/fgA/v8A/AD4//f7APoFBQkAB/sGCfUDAADy//YA/AAF+gAADQ4PAwEHB/z9Bfbw9/779vv4BAkD/wj8+gYA8v75APMECg77AAkQCAL8+QEA+Af6A/n+APUFAQDw9fH+Dvb2B/DsCAT9+wPv/gkKC/8J9Aj9Cff9ERUGEfkIDQwNDPvy9QoHC/f/9w8A/AkHBPr3CesODwP4Ef0QBQQIC//84+/49/zn9RUSDwoYDQTsBgT8/Qr8HQz38+r37RD9BQMS/+nz9g8UCgwFHPsPCPADAPU="
click:"%%SND0AgD/AAD8AwD+AwD/AAD+AAIB/QP/AAABAP4AAP8CAP8AAAQB/gAAAPwBBP0BA/3+AAAAAAAAAAD8CPr7AAD9Av4CAfwBAAAABv0C//7uP9fjOOm3QQzk9B8I6fEm5+8W+PT+/QH49QMB9gIL+PkBB/kCBQAEAwMJAQMAD/0JBgQG+gAE9NHVR7wQUMq+RxOuHDfJDxjx6wz/9gD+8gD4+gH/+Pf8+QIB9/8DAPz4Ef33CAEIAP0O/fgU8/4LBPkN+P0FFvAAEf3+Cf/+AP/++v4DAvwQ9QEH+QMA/wH9/QP8AQAAAvgCDf78Af7/+/sDAfYLBvn/AP3/A/cAC/r3CQj3/wn7/QT8+wQB/fwO/PgKAP0DAPr+APsDB/8ABf4A+AAF/AECBQXzBgj6Av4BAAL+APz+B/wCAPsC/wQH/PoH9AQIAPwFCPr6BgP/AP8CBf0D/QD5"
clap:"%%SND0AAAAAAAAAQAAAAAAAAXwDhHt4hzyBS4I9dv7MP3f5PURGxQD+wD65w0F8PUCBAcKFAjt5ukKDQsIBfT8+fz/CQ7+9P4GAfv9/QQQA/r4/AAA/AACBQM34tAzEJ9hMrKI3hVQWCbjt80G6gbxFktX65DA+DUYIw7k7vQDAgD9+AsYA/L/BQsS9ev4+wwJ/gP++/4BDAP38v3/Bw4I/fH2AAoKAf77+/n/BgsH/fn89SQK4zZoF5GC+y0kSRXzJRjIqPIeW0jIruIERif90d8TAeoAHRv/7AsB8/T/AQD//gj/BhIF8/Xr9AsQDQYJ+ObtAAoSDwYC9ez0AAYPBQfO4k0uveTkM/oByAs3UBi6ueEiUvWoxS1PDOvsDRf37SvvvwAKDTfz3/gvAfoa8N73AD4Zzs0ACiwi480QEvvSCPYvIQUSwMHlDQthGwPsAO+82wcbLhYvA9XH0PooOx/3z/EA/xAd/entBBgT/Pbj5RoeG+7wB/nj+vwBDxUV59fr9x8fFQ321vf/CxgK/u7f7SEmHxzy1dvqBi8W/vX7DP7z6foRDh4P9eTq/gYcEvf98e36AxoT/e/r+AkRBfz6DwHn5QAUGgv49e3y+P4hIhDl5fADCwT8AwkE+gr99u4DBAoGDgH0AP748gAHDxUM9+v2+QL+DAkCAwv37/cJGQDp7QITEwH99PYABAQIB/v89fj7AAoMDggH++rs+wUUEwXt7PIHERMF/vv28vgDDg/+9vr+ABEVAefp/wUHCAcA+f8A/vwCAAL+/AAMB/zz/gQDBwT2+voFCAoA9fX4AA4TB/by+wAABAH/BAoF//L1AAwM/fP4AAcRCPfv+gQEBgAAAAD9/P4DBAD/AAEBA/v7AAYDAPv6AQUGBAD5/f8AAQQEA/35/f8DCQb/9vX8BwwFAPsAAP0CAv76AQECAv/+/gECAAD/AwMA/v39AgL7+gME"
talk1:"%%SND03t/f39/g4eDg3+Df9wQRHy47Q0lMTk9PUFBRUVJSUVFRUFFRUVFRUFFQPSsgEAH26+Pf3t3c29va2dnZ2dnZ2djY2NfY6PwGFCMvODxBQ0NERkhKSUlLS0xLSklJSUlISEhGOiIWBvns4tvX1dPS0tHT09TV1NLR0c/O0NDn9AIRIS43PkJERERGRkZHR0hIRkdHR0lKS0tLSjgjGAf47OPb19XS0tLU0tHS09PT0dHQ0NDPz9Di9gAPHy43P0JDRUNFRkdGRkhIR0hISUlISUtKSEcoHA7/7+Te2NXV09HS0tLS0dHR0NHR0M/Pzs3Nzu33BRYkMjg7QEBDQ0REQUNDQ0JDQkNDRURGR0ZEKBwP/e/i2tXQ0c7OzczNzs3My8zKycrJycfHycjk7/0MGScuNDc6Ozs9PT48Pz0+PD08Pj8+P0FBQCQWCPjr4dbQz83My8nJyMfHycjGx8XFw8bFxMbFx9/t+gkYIywyNTg5Ozs6Ozs7Ozs8PTw8PD4+PT8/PjIaDQDx5dvX0s/Ny8zMzc3Mz83Nzs3MzMzNzMzMysvM3/H8DRomMTc8PkBCQ0VFR0hISEhJSUpKSktMTEtLS0xLS0pISUlIQSQZCPvu49vW1NLS0dDQ0NDPzs/P0M7Nzc3Ozc3Ny8zKysvLy8vMzczMzM7Nzc3Nz8/Ozs7Ozc3Ozc3NzMvLy8zMzMzMzc3Oz8/Pz8/Pz9DQ0NDPz8/P0NDR0NHR0dHR0tHR0NDR0dHS0dHR0dHS0tLR0dHR0dHR0NDQz8/Pz8/Pz8/Pz9HQ0NHS0tHS0dLR0tLT09v3ARAfLjg+QkdISkpLTExOTk5NTU9PT05PT0wrIBAB9Ori3tva2tjW1dPU1dfW19fX19fj+gUVJTI7QUdKSUpNTU1OT09OTk5PT09QUFBPNSkbC/7x5+Hd29nY2NbX19bV1tbU1dbV7f0HGCg0P0dLTk9QUVJSU1NSUlNSUVFSUlBQUDAlFwf47OPe29rY19XW19bV1tfW1dXU09TT0/L6CRgnMDk+QUFERkZGRkZHSEdHR0dGRkZISEU/JBgJ++ze2dPQztDP0NDNzczLy8rMyMnIx8fHyM/q9QISHyowNjk6OTs8Ojw/PT4/Pj0/Pz5AP0E/PCQXCPnp3dTOycjFxcbExMXExMTFw8PDwsLAv7/Awt/q+AkWIiwwNDc4Nzk3Nzg5OTo7Oj08PTw8PDw6OiQUB/bo3dHNysjFxMTDwcLBwsHDwsDBwsPCwsPGxMXI4/D9DBwoMTc7Oz9BQEFDQ0FEQ0NCREVFQkNEQ0REREM/JBkJ++/g2tbTzs7Nzc3OzcrMzczMy8vNzc7Oz87Lzs7Oz9Ty/AsbKTU7QEJERkZJS0pLTExOTk1MTU5NTk5PTlBPTk5PTk5PT09PUE9NNygcDP/w6OHd2tfW1NLS0tLR0M/Pzs7MzMzMzc3MzM7Nzc7Ozs7Pz8/Qz8/Qz9DQ0NDQ0dLS09PT09PT09PT1NPT09PT09PT09PS0tLS0tLR0tHQ0dHR0dLS0dHS0tHS0tPT09TT09PT09PT09PT09PT09TU1NTU1dbV1dbW1tbX1tXW1tbW1tbW1tbV1tbW1tU="
talk2:"%%SND00tPT09PT09PT09TT09PT09PT09PT0tLS0tLS0dLR0NHR0dHS0tHR0tLR0tLT09PU09PT09PT09PT09PT09PU1NTU1NXW1dXW1tbW19bV1tbW1tbW1tbW1dbW1tbV1tXU1NXV1tfX2NnZ2dra2tra2trb3Nz7BBIiMTpESk5PUlNSVFRUU1VWWFdYV1VWVVRWVlRTPC0hEgL27Ojk4uDd3dzb2trZ2dnb2dra2tnb2+L+BxcnNj9GSkxOT09PUVFSUlJTUVFQUU9RUFJTUVBROioeDQD06OLe29jY1tXV1dXU1NbV1NTT09LT2fQADR4rNTs/Q0ZFRUZGSElKSEdHR0ZHRkZHSEdHRUMjGQr77OPa1dHOz83Ky8vKysjKycnKyMjIx8fHx8jm8P4NGyYuMjQ4ODk6PDs6Ozs8Ozs8PDw8PD0/PDo6LRgM/u7i2dLNy8jGxsXDw8TCwcTEwsPExcTBwcPCxMTi7fsLGSQtMjQ1ODo5Ojs6Ozs7PD09PT4+Pj8/QEA+MhsRAPPl3NXSzs3My8vJzMrIysvKycnLzcvMycvLzM7s+QUXIy42Oz0/QkJERERERUVFREdHRkdGRkhISEdHLB8SA/Xo4t3Y1tXT1NPU0tLT1NTT1dXV09TV0tTT1dTo+QUVIy43PUFERERGREZDRkRGRkdHR0dHSElISUlKSUgpHhIA8+ng3dnX1tXU1dTV1dXV0tTU0tXU0tHR0dHQ0M/T8fsJFyYvNzw9P0A/P0BBQUFBQ0NDRkZFRUZHR0dHR0dGRkZFR0lISEkwIRMD9ejg2tfV09PS0tHQ0c/Pz8/Nzc7Ozs7OzczNzM7Nzc/O0M/P0NDPz8/Q0M7Pz87Pz8/Pzs7Nzs7Ozs7Ozc3Mzc7NzczMzMzMzMzNzc3Ozs/Pz8/Pz8/P0NDPz8/Q0NDR0tLS0tLS09PU09TT09PT1NPS0tLS0tLS0tPT09TU1NTU1NTV1dXW1dXW1tfX1tbV1dbW2dk="
talk3:"%%SND01tbY2NnZ2dnY2tva29vd4P8HFSUyOkJGSExNTk5QUFBRUFFRUVFSU1NSUVFRNCkbCv3z7Ojk4eDf3dzc29va2tra2drb29zuAAoZKDY9QkZISUlJSklKSEhISEhHSUlKS01NTUQqIBAA9Ork3trX19fX1tXU09PT09HS0tXb9wAOHSkxNzs9P0BCQkFBQj9AQEE/PkFAP0BBPyQZDADx5uHc1tXU0dDR0M7My8zMzsvKy8rJyt/u+gkWIiswNDY3Nzk5OTo5Ojk5OTk5Ozk5OTs5HBMG+Org19LOzszLzcrLy8vLzc3Ozs3NysvKytjs9QUUISoxMzY4OTo8PDs8PTs8PDw8Ozs6Ojs9IBMI++3h2tXRz87MysrKycvMzc3NzMzLycrLy9ft+AcYJC80OTw9PkBAP0BAQUFDQ0NDQ0NERENDKBwPAvTr4t3b19bW1tfX19fX2NjW1tbW1NXU09Pb9gAOHiw2PUFCRUdHRkdJSEhKSkpKS01MTU5PT09HLCETA/ju6eTi4N7e29ra2tva2NjX2NjZ2NfV1dfW2e//ChgnMjtBRkhKS0tMTExMTUxNTU1OTk5OTk1NTU1MTExMTUxMSzcmGgv87uXd2dfW1NPS0tLR0dHR0dDQ0NDQ0dHQ0NDPzs7Ozs/Pz8/Q0M/R0dHR0NHR0dLS0dDQ0NDQ0NDP0NDQ0NHPz9DQzs/Pz87Ozs/Pz9DPz9DQ0dDR0dHS0tLS0tPT09PT09PT09PT09TV1dXW1tbW1dXV1dbW1dXV1dXV1dXW1tbX19bW2NjY2NjX19fX2NjY8/4JGSk1PUNHSEtLTU1NTk1NTExOTk9PTk1NSisiEwL16+Pg3dvZ2NnX1tfV1NbW1tXX1tX3/wsfKzc/QUVGSEZGSkhISElJSUpJSkxLS0pKLyMVB/nr5eLd2dfX1NTR0dPS0NHQ0dLQ1fH9ChsoMTc8P0JAQUFCQkREQ0RCQUJBQkJDRUIkGAn76+HZ1dDQz83MzMrIyMnKycnJycfIyMrT6vcFEyApLzQ3OTo7PD09PTw9PT09PT8+Pz8+Pj0fFQf47N7X1M/Ny8vJyMnHx8jIx8nKyMnIx8jIyMvq9AISICsyODs6Ozw/PT8/P0BAPz5AQD4+QEBBQUEkFwz97ODY0s7NzMzLzMvMzczKzMrMy8vLysvJy8rO7fgGFiIuNDo9PT4/Pj8/QEFCQEFCQkFCQkRFREVEQyUbDf7x5uA="

{card:Index}
image:"%%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"
script:"Index.0"
{widgets}
field1:{"type":"field","size":[132,17],"pos":[322,133],"locked":1,"font":"menu","show":"invert","border":0,"align":"center","value":"Dialogs for Decker"}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
field2:{"type":"field","size":[248,55],"pos":[14,142],"locked":1,"show":"transparent","border":0,"value":{"text":["Decker Dialogizer is  a module (\\"dd\\") which provides customizable, aesthetically pleasant modal dialog boxes for use in Visual Novels and similar interactive content.\\n\\n","Index:"],"font":["","menu"],"arg":["",""]}}
index:{"type":"field","size":[243,117],"pos":[16,197],"locked":1,"volatile":1,"script":"Index.2","scrollbar":1}
version:{"type":"field","size":[42,14],"pos":[16,318],"locked":1,"volatile":1,"border":0}

{script:Index.0}
on view do
 bullet:image["%%IMG0AAYADQAAAAB49Pz8/HgAAAA="]
 i:select c:key t:value..widgets.title.text where value..widgets.title from deck.cards
 index.value:raze each row in rows i
  rtext.make["" "" bullet],
  rtext.make["  "],
  rtext.make[("%s\\n" format row.t) "mono" row.c]
 end
 version.text:"v%0.1f" format deck.modules.dd.version
end
{end}

{script:Index.1}
on click do
 t.Prev:"SlideRight"
 t.Next:"SlideLeft"
 t.Index:"BoxOut"
 go[me.text t[me.text] 15]
end
{end}

{script:Index.2}
on link val do
 go[val "BoxIn" 15]
end
{end}

{card:say}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"dd.open[], dd.say[], dd.close[]"}
ex1:{"type":"field","size":[244,101],"pos":[10,56],"style":"code","value":"dd.open[deck]\\ndd.say[\\"Hello, World!\\"]\\ndd.close[]"}
field2:{"type":"field","size":[236,101],"pos":[266,56],"locked":1,"border":0,"value":"Before you can show text in a modal dialog, you must call dd.open[] with the deck as the first argument.\\n\\nYou can then use dd.say[] with a string to actually place text in the dialog.\\n\\nWhen you're finished using the dialog, call dd.close[]."}
button3:{"type":"button","size":[60,20],"pos":[266,137],"script":"say.0","text":"Try It!"}
field3:{"type":"field","size":[236,129],"pos":[266,169],"locked":1,"border":0,"value":"If you call dd.say[] several times, you'll get a series of dialog boxes to click through.\\n\\n\\n\\n\\n\\nAlways remember to call dd.close[] when you're finished with a sequence, and before moving to another card. If you halt a script manually, you can call dd.close[] from the Listener to clean up the dialog."}
ex2:{"type":"field","size":[244,57],"pos":[10,169],"style":"code","value":"dd.open[deck]\\ndd.say[\\"The first message.\\"]\\ndd.say[\\"The second message.\\"]\\ndd.close[]"}
button4:{"type":"button","size":[60,20],"pos":[266,206],"script":"say.1","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{script:say.0}
on click do
 eval[ex1.text () 1]
end
{end}

{script:say.1}
on click do
 eval[ex2.text () 1]
end
{end}

{card:ask}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"dd.ask[]"}
ex1:{"type":"field","size":[266,242],"pos":[10,56],"style":"code","value":"dd.open[deck]\\ndd.say[\\"Ready...\\"]\\nr:dd.ask[\\n \\"...aaand, Shoot:\\"\\n (\\"Rock\\",\\"Paper\\",\\"Scissors\\")\\n]\\nif r~0\\n dd.say[\\"I had rock, too. Tie!\\"]\\nelseif r~1\\n dd.say[\\"Paper beats my rock. You win.\\"]\\nelse\\n dd.say[\\"My rock beats scissors. I win!\\"]\\nend\\ndd.close[]"}
field2:{"type":"field","size":[217,72],"pos":[285,56],"locked":1,"border":0,"value":"The dd.ask[] function accepts a string as a prompt and a list of strings as options.\\n\\nThe user will be allowed to choose one of the options, and dd.ask[] will then return the index of the selected option, counting from 0."}
button3:{"type":"button","size":[60,20],"pos":[285,278],"script":"say.0","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{card:chat}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9ijWr1q1cu3r9Cjas2LFky5o9izat2rVs27p9Czeu3Ll069q9izev3r18+/r9Cziw4MGECxs+jDix4sWMGzt+DDmy5MmUK1u+jDmz5s2cO3v+DDq06NGkS5s+jTq16tWsW7t+DTu27Nm0a9u+jTu37t28e/v+DTy48OHEixs/jjy58uXMmzt/Dj269OnUq1u/jj279u3cu3sPHSC8+PHky5s/jz69+vK8Ayhxvxs+Evm56Ruxfxs/Ef218a8Pz8B//AmoAH+0+QfBgAkGuGACBs6G4AMKSsgghQ62V+CFGmZ4gHgbfughAhHqNiIAAH4oYocqrsihiSy6iGJ+LbpXYootwnjjizXKiOKOBtQ4oY0v/ohhjzkO6SOOQipJZHw5JkmffkEumeSBTx7ZJJNDsihflFj2N+N4SwpJ3pg6nrjlg7JVuWWWDUxZoZm2semmnDHWuQCdsfn3X4B95vmnnVZeEOKbCaJZgZp7YoAooIo2OoGisEmap5YdimkopV8OmsGDamoaZ30cGOjpqEVuQKOImKoIqqFOdtBooZd60OpqtTqKpaydngproLDyaqqFtAKLaoPDvnrsj7Le6iqYbe7qZpcgUMosZWhWW2m2lkJ76GkhYnskouDeiWtpYo47pp4UUKurZAKa52Kq8sZL77z28Vlvvvbq++6q4HmI7rOCEiqBv//CF3Cd6kZaMKSgXTutsb9G4PDDA1vwaMQUt5awib4GS+J7xO438hAdW5zEyZ+pzALLnfULc8wyV/xdzTbfjHPOOu/Mc88+/wx00EIPTXTRRh+NdNJKL810004/DXXUUk9NddVWX4111lpvzXXXXn8Ndthij0122WafjXbaaq/Ndttuvw133HLPTXfddt+Nd9567813335jUQA="
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"dd.chat[]"}
ex1:{"type":"field","size":[266,242],"pos":[10,56],"style":"code","value":"ct:\\"Chickens are fantastic animals.\\n\\nDid you know chickens can lay an egg roughly every 24 hours?\\n\\nThey stop laying when they moult.\\"\\nbt:\\"Honestly I don't know much about bugs.\\"\\n\\ndd.open[deck]\\nr:dd.chat[\\n \\"Ask me anything you like.\\"\\n raze insert q a with\\n  \\"Tell me about chickens.\\" ct\\n  \\"Tell me about bugs.\\"     bt\\n  \\"I have to go.\\" 0\\n end\\n]\\ndd.say[\\"goodbye, then.\\"]\\ndd.close[]"}
field2:{"type":"field","size":[217,154],"pos":[285,56],"locked":1,"border":0,"value":"The dd.chat[] function makes certain patterns of dialog trees built out of dd.ask[] and dd.say[] easier to write.\\n\\nThe dd.chat[] function accepts a string as a prompt and a dictionary mapping strings (options) to responses. It will display a dialog box (as with dd.ask[]), and then consult the response corresponding to the user's choice. If the response is a number, dd.chat[] will return it immediately. Otherwise, dd.say[] will be called with the response, the selected choice will be removed from the list of choices, and the user will be prompted again with dd.ask[] until no options remain."}
button3:{"type":"button","size":[60,20],"pos":[285,278],"script":"say.0","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{card:configuration}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"dd.open[] configuration"}
ex1:{"type":"field","size":[256,242],"pos":[10,56],"scrollbar":1,"style":"code","value":"o:()\\no.fcolor:colors.magenta\\no.bcolor:colors.yellow\\ndd.open[deck o]\\ndd.say[\\"Fancy Colors!\\"]\\ndd.close[]\\n\\no:()\\no.tfont:\\"menu\\"\\no.align:\\"center\\"\\ndd.open[deck o]\\ndd.say[\\"Bigger Text,\\\\nCentered!\\"]\\ndd.close[]\\n\\no:()\\no.next:image[\\n \\"%%IMG0AAgACf+BvaWtob+A/w==\\"\\n]\\ndd.open[deck o]\\ndd.say[\\"Custom Next Icon!\\"]\\ndd.close[]\\n\\no:()\\no.next:\\"%J\\" parse \\"[\\n%%IMG0AA8ACgAAP/gf8A/gB8ADgAEAAAAAAAAA,\\n%%IMG0AA8ACgAAQAQ8eD/4H/AP4AfAA4ABAAAA,\\n%%IMG0AA8ACgAAIAgwGDx4H/gf8A/gB8ADgAEA,\\n%%IMG0AA8ACgAAQAQ8eD/4H/AP4AfAA4ABAAAA,\\n]\\"\\no.nextd:5\\ndd.open[deck o]\\ndd.say[\\"Fancier custom Next Icon!\\"]\\ndd.close[]\\n"}
field2:{"type":"field","size":[226,242],"pos":[276,56],"locked":1,"border":0,"value":"The dd.open[] function can optionally be given a second argument: a dictionary with configuration options.\\n\\nYou can customize the appearance of a dialog box by setting appropriate keys in the dictionary:\\n\\n- fcolor: foreground color (number)\\n- bcolor: background color (number)\\n- tfont: main text font (string or font)\\n- bfont: button font for ask[] (string or font)\\n- align: alignment of text (\\"left\\", \\"right\\", \\"center\\")\\n- next: icon used to advance say[] (image or list of images)\\n- nextd: delay in frames between cycling \\"next\\" icons (number)\\n\\nIf you're using custom styling extensively, consider defining configuration dictionaries or wrapper functions for dd.say[] and dd.ask[] in a deck-level script!"}
button3:{"type":"button","size":[60,20],"pos":[276,278],"script":"say.0","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{card:style}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"dd.style[], dd.getstyle[]"}
ex1:{"type":"field","size":[244,242],"pos":[10,56],"style":"code","value":"a:()\\na.fcolor:colors.white\\na.bcolor:colors.black\\nb:()\\nb.fcolor:colors.black\\nb.bcolor:colors.red\\n\\ndd.open[deck a]\\ndd.say[\\"Style A\\"]\\n\\ndd.style[b]\\ndd.say[\\"Switch to:\\\\nStyle B\\"]\\n\\ndd.style[a]\\ndd.say[\\"Back to Style A!\\"]\\ndd.close[]\\n"}
field2:{"type":"field","size":[236,242],"pos":[266,56],"locked":1,"border":0,"value":"You can also change the configuration of a dialog sequence in mid-stream with dd.style[].\\n\\nThe dd.style[] function takes a single dictionary as an argument and accepts all the same options as dd.open[].\\n\\nThe dd.getstyle[] function can be called with no arguments to retrieve a dictionary of all the current style settings. This can be useful if you need to save the current style and restore it at a later time."}
button3:{"type":"button","size":[60,20],"pos":[266,278],"script":"say.0","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{card:show}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"dd.show[]"}
ex1:{"type":"field","size":[244,122],"pos":[10,56],"style":"code","value":"dd.open[deck]\\ndd.say[\\"First message.\\"]\\n\\ndd.show[0]\\nsleep[30]\\ndd.show[1]\\n\\ndd.say[\\"Second message.\\"]\\ndd.close[]\\n"}
field2:{"type":"field","size":[236,242],"pos":[266,56],"locked":1,"border":0,"value":"Sometimes you may want to temporarily hide a dialog box without actually removing it.\\n\\ndd.show[0] hides the dialog box,\\nand dd.show[1] reveals it."}
button3:{"type":"button","size":[60,20],"pos":[267,158],"script":"say.0","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{card:borders}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"custom borders"}
ex1:{"type":"field","size":[244,82],"pos":[10,56],"style":"code","scroll":10,"value":"o:()\\no.border.image:windoid.copy[]\\no.border.margin:14,16,8,6\\no.fcolor:colors.black\\no.bcolor:colors.white\\ndd.open[deck o]\\ndd.say[\\"Image Border.\\"]\\ndd.close[]"}
field2:{"type":"field","size":[236,238],"pos":[266,56],"locked":1,"border":0,"value":"The \\"border\\" property can be used to configure a custom border image for dialog boxes. The \\"border.image\\" property should be any image, and \\"border.margin\\" specifies numeric offsets from the left, top, right, and bottom edge, respectively.\\n\\n\\n\\n\\nAlternatively, you can use any contraption prototype in your deck. (They have the same fields.)\\n\\n\\n\\n\\n\\n\\n\\n\\nIn either case, the border image will be automatically divided into 9 regions based on the margins and regions will be tiled appropriately to suit the required size."}
button3:{"type":"button","size":[60,20],"pos":[267,209],"script":"say.1","text":"Try It!"}
field5:{"type":"field","size":[44,12],"pos":[18,239],"locked":1,"border":0,"style":"plain","align":"center","value":"windoid:"}
paper1:{"type":"contraption","size":[165,48],"pos":[89,253],"def":"paper","widgets":{}}
field3:{"type":"field","size":[34,14],"pos":[157,239],"locked":1,"border":0,"style":"plain","align":"center","value":"paper:"}
ex2:{"type":"field","size":[244,81],"pos":[10,148],"style":"code","value":"o:()\\no.border:deck.contraptions.paper\\no.fcolor:colors.black\\no.bcolor:colors.white\\ndd.open[deck o]\\ndd.say[\\"Prototype Border.\\"]\\ndd.close[]\\n"}
button4:{"type":"button","size":[60,20],"pos":[267,118],"script":"say.0","text":"Try It!"}
windoid:{"type":"canvas","size":[36,24],"pos":[22,253],"locked":1,"border":0,"image":"%%IMG3ACQAGAZAgHBILBqPSEBgyWw6n9CnMACqWq/YrNa6nIKo0K8YPC6Tu0oulrptcwNe8vVsrp/h6Spb7Xaj6XN2gndeemt9fnh3ToONf4iQWX9RlJVSeZGZj5maipydhZ+Im6J9pKVtp6haqqtrnq5bk5a0lFO1uJdJu7xFQQ==","scale":1}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{card:buttonborders}
image:"%%IMG3AgABVgZAgHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/wdiDx9PX29/j5+vv8/f7/AAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26tevXsGPLnk27tu3buHPr3s27t+/fwIMLH068uPHjyJMrX868ufPn0KNLn069uvXr2LNr3869u/fv4MOLH0++vPnz6NOrX8++vfv38OPLn0+/vv37+PPr38+/v///AAYo4IAEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPFI4wY9ABinkkEQWaeSRSCap5JJMNunkk1BG2eOUVFZp5ZVYZqnlllx26eWXYIYp5phklmnmmWimqeaabLbp5ptwxinnnHTWaeedeOap55589unnn4AGKuighBZq6KGIJqrooow26uijkEYq6aSUVmrppZhmqummnHbq6aeghirqqKSWykUQ"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"button borders, alignment"}
ex1:{"type":"field","size":[244,241],"pos":[10,56],"scrollbar":0,"style":"code","value":"o.bborder:deck.contraptions.rbutton\\no.fcolor:colors.black\\no.bcolor:colors.white\\ndd.open[deck o]\\ndd.ask[\\n \\"Which button do you like?\\"\\n (\\"First\\",\\"Second\\",\\"Third\\")\\n]\\n\\no.bborder:deck.contraptions.bracket\\no.balign:\\"left\\"\\ndd.style[o]\\ndd.ask[\\n \\"How about this?\\"\\n (\\"This one\\",\\"Nah, This one\\")\\n]\\ndd.close[]\\n"}
field2:{"type":"field","size":[236,172],"pos":[266,56],"locked":1,"border":0,"value":"The \\"bborder\\" property can be used to configure a custom border image for the buttons in dd.ask[] dialogs. This works just like the \\"border\\" property, and can be either a dictionary with an image and explicit margin, or a contraption.\\n\\nThe image used for the \\"bborder\\" property should be partially transparent, to allow the foreground fill color to show through when a button is clicked, highlighting the button.\\n\\nThe \\"balign\\" property works just like the \\"align\\" property but controls the alignment of text within dd.ask[] buttons, and can be set to \\"left\\", \\"right\\", or \\"center\\" (the default)."}
button3:{"type":"button","size":[60,20],"pos":[266,222],"script":"say.0","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}
rbutton1:{"type":"contraption","size":[64,25],"pos":[314,272],"def":"rbutton","widgets":{}}
field1:{"type":"field","size":[44,12],"pos":[324,259],"locked":1,"border":0,"style":"plain","align":"center","value":"rbutton:"}
arrow1:{"type":"contraption","size":[21,13],"pos":[417,278],"def":"bracket","widgets":{}}
field3:{"type":"field","size":[44,12],"pos":[404,259],"locked":1,"border":0,"style":"plain","align":"center","value":"bracket:"}

{card:windowsize}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"window size"}
ex1:{"type":"field","size":[244,238],"pos":[10,56],"scrollbar":1,"style":"code","value":"o:()\\no.size:200,0\\ndd.open[deck o]\\ndd.say[\\"Fixed width, with a somewhat longer line to ensure text wrapping is actually happening as intended.\\"]\\n\\no.size:0,100\\ndd.style[o]\\ndd.say[\\"Fixed height.\\"]\\n\\no.size:200,120\\ndd.style[o]\\ndd.say[\\"Fixed width and height, with a somewhat longer line to ensure text wrapping is actually happening as intended.\\"]\\n\\ndd.ask[\\"Question...\\" (\\"one\\",\\"two\\")]\\n\\no.size:0,0\\ndd.style[o]\\ndd.close[]"}
field2:{"type":"field","size":[236,238],"pos":[266,56],"locked":1,"border":0,"value":"The \\"size\\" property can be used to configure a fixed width and/or height for dialog boxes. This can be particularly useful for making custom borders look their best.\\n\\nThe size property is specifed as a (width,height) pair. If either is 0, it is treated as the default behavior: full screen width minus a small margin, and the height required to display the specified text. If either is nonzero, that axis will take on exactly the specified size.\\n\\nIf you fix the size of the dialog box, it's up to you to ensure that your text (including option buttons for dd.ask[]) will fit properly! "}
button4:{"type":"button","size":[60,20],"pos":[266,274],"script":"say.0","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{card:windowpos}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"window position"}
ex1:{"type":"field","size":[244,238],"pos":[10,56],"scrollbar":1,"style":"code","value":"o:()\\no.pos:\\"center\\"\\ndd.open[deck o]\\ndd.say[\\"A vertically and horizontally centered dialog box.\\\\nNeat, eh?\\"]\\n\\no.size:100,0\\no.pos:\\"place1\\"\\ndd.style[o]\\ndd.say[\\"Over Here...wih enough text to wrap multiple lines...\\"]\\n\\no.pos:\\"place2\\"\\ndd.style[o]\\ndd.say[\\"...Or over here!\\"]\\n\\no.pos:\\"place1\\"\\no.size:150,0\\ndd.style[o]\\ndd.ask[\\"A question up here, long enough for word wrapping?\\" (\\"Red\\",\\"Blue\\")]\\n\\no.size:0,0\\no.pos:0\\ndd.style[o]\\ndd.close[]"}
field2:{"type":"field","size":[236,238],"pos":[266,56],"locked":1,"border":0,"value":"The \\"pos\\" property can be used to configure a custom location for the dialog box on the card.\\n\\nIf the pos property is 0 (the default), the dialog box will be horizontally centered on the bottom edge of the card.\\n\\nIf the pos property is the string \\"center\\", the dialog box will be horizontally and vertically centered on the card.\\n\\nOtherwise, if the pos property is the name of a widget on the current card, the dialog box will be centered on that widget. This combines nicely with the \\"size\\" property."}
button4:{"type":"button","size":[60,20],"pos":[266,274],"script":"say.0","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}
place1:{"type":"button","size":[8,8],"pos":[92,96],"show":"none"}
place2:{"type":"button","size":[8,8],"pos":[416,155],"show":"none"}

{card:textspeed}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"text speed"}
ex1:{"type":"field","size":[244,164],"pos":[10,56],"style":"code","value":"\\ndd.open[deck o]\\n\\ndd.style[().speed:1]\\ndd.say[chickens.text]\\n\\ndd.style[().speed:3]\\ndd.say[chickens.text]\\n\\ndd.style[().speed:7]\\ndd.say[chickens.text]\\n\\ndd.close[]"}
field2:{"type":"field","size":[236,238],"pos":[266,56],"locked":1,"border":0,"value":"Normally, dd.say[] will display all the text in each dialog box instantly. If the\\"speed\\" property is set, dialogizer will animate the text appearing word-by-word.\\n\\nA non-zero \\"speed\\" indicates the number of frames (60ths of a second) which will elapse between each word appearing, breaking words on whitespace.\\n\\nIf a user clicks while text is animating, the animation will immediately finish."}
button4:{"type":"button","size":[60,20],"pos":[267,200],"script":"say.0","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}
chickens:{"type":"field","size":[244,59],"pos":[10,235],"locked":1,"value":"The chicken (Gallus gallus domesticus) is a large and round short-winged bird, domesticated from the red junglefowl of Southeast Asia around 8,000 years ago. Most chickens are raised for food, providing meat and eggs; others are kept as pets or for cockfighting."}
field3:{"type":"field","size":[92,14],"pos":[160,294],"locked":1,"border":0,"style":"plain","align":"right","value":"(source: wikipedia)"}

{card:soundeffects}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"sound effects"}
ex1:{"type":"field","size":[244,204],"pos":[10,56],"style":"code","value":"o.osound:\\"scrape\\"\\no.nsound:\\"click\\"\\no.asound:\\"clap\\"\\ndd.open[deck o]\\n\\ndd.say[\\"Line 1\\"]\\ndd.say[\\"Line 2\\"]\\ndd.ask[\\"Question\\" (\\"A\\",\\"B\\",\\"C\\")]\\ndd.say[\\"Line 3\\"]\\n\\no.tsound:(\\"talk1\\",\\"talk2\\",\\"talk3\\")\\no.speed:3\\ndd.style[o]\\ndd.say[textspeed.widgets.chickens.text]\\n\\ndd.close[]"}
field2:{"type":"field","size":[236,238],"pos":[266,56],"locked":1,"border":0,"value":"There are several properties available which indicate that dialogizer should play sounds at various times:\\n\\n- \\"osound\\": dd.open[] is called.\\n- \\"nsound\\": user advanced to the next dd.say[] dialog.\\n- \\"asound\\": user made a choice in a dd.ask[] dialog.\\n- \\"tsound\\": played each word while text animates.\\n\\nSounds may be specified by name (a string) or by value (a sound interface). If you set either property to a list, an element will be chosen randomly each time a sound needs to be played."}
button4:{"type":"button","size":[60,20],"pos":[267,240],"script":"say.0","text":"Try It!"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{card:richtext}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"rich text"}
ex1:{"type":"field","size":[244,101],"pos":[10,56],"style":"code","value":"dd.open[deck]\\ndd.say[source.value]\\ndd.close[]"}
field2:{"type":"field","size":[236,242],"pos":[266,56],"locked":1,"border":0,"value":{"text":["The dd.say[] and dd.ask[] functions can also operate on rich text, with multiple fonts and inline images.\\n\\nIn dd.say[], blank lines (\\"\\\\n\\\\n\\") will automatically split text up across multiple boxes.\\n\\n\\n\\n\\n\\n\\n\\n\\n\\nThe ","rtext"," interface can be used to create rich text programmatically, but it's even easier to store and edit rich text in a field widget, as in this example.\\n\\nUsing this approach, you can organize your text however you wish: across cards, interspersed with notes, or in invisible fields on the card where it will be used."],"font":["","",""],"arg":["","https://beyondloom.com/decker/decker.html#rtextinterface",""]}}
button3:{"type":"button","size":[60,20],"pos":[266,137],"script":"say.0","text":"Try It!"}
source:{"type":"field","size":[244,112],"pos":[10,186],"value":{"text":["","Pippi:"," Do you think we'll get treats for this cameo?\\n\\n","Galena:"," It is truly the least father could do for us.\\nI hope we shall receive bugs.\\n\\n","Pippi:"," Yesss. Bugs, or perhaps corn."],"font":["","menu","","menu","","menu",""],"arg":["","","","","","",""]}}
field5:{"type":"field","size":[100,12],"pos":[89,172],"locked":1,"border":0,"style":"plain","align":"center","value":"source:"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{card:interpolation}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"string interpolation"}
ex1:{"type":"field","size":[244,95],"pos":[10,56],"style":"code","value":"o.names.user:username.text\\no.names.exclaim:\\"bizarre\\"\\n\\ndd.open[deck o]\\ndd.say[source.value]\\ndd.close[]\\n"}
field2:{"type":"field","size":[236,156],"pos":[266,56],"locked":1,"border":0,"value":"If the configuration dictionary for dd.open[] contains a sub-dictionary called \\"names\\", they will be used to replace format patterns:\\n\\n\\n\\nin the text provided to dd.say[] and dd.ask[].\\n\\n\\n\\n\\n\\nNote that format patterns in rich text must be within a contiguous span of styling to be replaced properly!"}
button3:{"type":"button","size":[60,20],"pos":[267,141],"script":"say.0","text":"Try It!"}
source:{"type":"field","size":[244,91],"pos":[10,212],"scrollbar":0,"value":{"text":["","Galena:"," Your name is %[user]s?\\nHow %[exclaim]s!\\n\\n","Galena:"," I've never heard of a human named %[user]s.\\n\\n","Galena:"," Granted, I don't get out much..."],"font":["","menu","","menu","","menu",""],"arg":["","","","","","",""]}}
field5:{"type":"field","size":[100,12],"pos":[89,198],"locked":1,"border":0,"style":"plain","align":"center","value":"source:"}
field3:{"type":"field","size":[48,16],"pos":[283,95],"locked":1,"style":"code","value":"%[key]s"}
username:{"type":"field","size":[244,16],"pos":[10,177],"value":"Hamilton Butters"}
field4:{"type":"field","size":[100,12],"pos":[89,163],"locked":1,"border":0,"style":"plain","align":"center","value":"username:"}
field6:{"type":"field","size":[61,16],"pos":[344,95],"locked":1,"style":"code","value":"%[key]02i"}
field7:{"type":"field","size":[67,16],"pos":[418,95],"locked":1,"style":"code","value":"%[key]8.3f"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{card:commands}
script:"commands.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"commands"}
ex1:{"type":"field","size":[244,40],"pos":[10,56],"style":"code","value":"dd.open[deck]\\ndd.say[source.value]\\ndd.close[]"}
field2:{"type":"field","size":[236,242],"pos":[266,56],"locked":1,"border":0,"value":"A line in a rich text field which starts with a \\"!\\" is a command.\\n\\nCommands must be separated from text and other commands by a blank line.\\n\\nCommands send a \\"command\\" event to the current card, with all the text following the \\"!\\" in the same paragraph provided as an argument.\\n\\nIn this way, commands make it possible to add custom scripted behavior interspersed with dialog. For example, controlling styling or scene changes.\\n\\nTake a look at this card's script to see how this example changes styles and fires a primitive alert[] modal. In your own projects, you can give every card its own custom command handler, or write a single command handler in the deck script that works everywhere. (Or both!)"}
button3:{"type":"button","size":[60,20],"pos":[267,278],"script":"say.0","text":"Try It!"}
source:{"type":"field","size":[244,183],"pos":[10,115],"value":{"text":["!light\\n\\n","Pippi:"," Do you think we'll get treats for this cameo?\\n\\n!dark\\n\\n","Galena:"," It is truly the least father could do for us.\\nI hope we shall receive bugs.\\n\\n!light\\n\\n!alert[2+3]\\n\\n","Pippi:"," Yesss. Bugs, or perhaps corn."],"font":["","menu","","menu","","menu",""],"arg":["","","","","","",""]}}
field5:{"type":"field","size":[100,12],"pos":[89,101],"locked":1,"border":0,"style":"plain","align":"center","value":"source:"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{script:commands.0}
on command x do
 if x~"light"
  o.fcolor:colors.black
  o.bcolor:colors.white
  dd.style[o]
 elseif x~"dark"
  o.fcolor:colors.white
  o.bcolor:colors.black
  dd.style[o]
 else
  eval[x () 1]
 end
end
{end}

{card:eventpumping}
script:"eventpumping.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"event pumping"}
ex1:{"type":"field","size":[244,140],"pos":[10,56],"style":"code","value":"dd.open[deck]\\ndd.say[source.value]\\ndd.close[]\\n\\ntarget.clear[]"}
field2:{"type":"field","size":[236,204],"pos":[266,56],"locked":1,"border":0,"value":"The dd.ask[] and dd.say[] functions are synchronous; they take control of Decker and block any normal Decker events from firing while they're active. This is a useful property in many cases: it makes it easy to display modal dialogs in sequence, and under the control of if...else...end statements.\\n\\nWhile they're waiting, the dd functions will periodically send an \\"animate\\" event to the current card. This gives your scripts the opportunity to do work, like animating background elements.\\n\\n\\n\\n\\n\\n\\nHave a look at this card's script to see how it uses the event for this example!"}
button3:{"type":"button","size":[60,20],"pos":[266,176],"script":"say.0","text":"Try It!"}
source:{"type":"field","size":[115,74],"pos":[10,226],"value":{"text":["","Pippi:"," Check out that animated swirly thing! I think I'm getting dizzy..."],"font":["","menu",""],"arg":["","",""]}}
field5:{"type":"field","size":[100,14],"pos":[17,210],"locked":1,"border":0,"style":"plain","align":"center","value":"source:"}
target:{"type":"canvas","size":[112,74],"pos":[142,226],"locked":1,"volatile":1,"scale":1}
field3:{"type":"field","size":[100,14],"pos":[149,210],"locked":1,"border":0,"style":"plain","align":"center","value":"target:"}
button5:{"type":"button","size":[60,20],"pos":[78,312],"script":"Index.1","text":"Index","style":"rect"}

{script:eventpumping.0}
on animate do
 t:sys.frame
 target.clear[]
 c:target.size/2                  # center of canvas
 r:c[0]*.6+.4*sin 0.02*t          # radius of the pattern
 a:(0.005*t)+(pi/0.5*16)*range 16 # angle per wedge
 p:flip c+flip r*unit a           # points around a circle
 each x i in p
  if 2%i target.poly[c x p[(count p)%1+i]] end # draw every other wedge
 end
end
{end}

{card:conclusions}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9ijWr1q1cu3r9Cjas2LFky5o9izat2rVs27p9Czeu3Ll069q9izev3r18+/r9Cziw4MGECxs+jDix4sWMGzt+DDmy5MmUK1u+jDmz5s2cO3v+DDq06NGkS5s+jTq16tWswwQQ+lpYgNlAZ8cGZrs27WC5f/bGvdvn71/DeRbvdVxn8l3LcTbP9dxm9FvTaVavdV1m9lnbYXaP9d1l+FW5f483eR6V7fWx2TsPzos9bffvb/uSn75kflb0d+7n/x9JAaqynnHwyWZfTgO21sOCDOrg4IM5RCihDRRWWMOFGM6g4YYwdOjhCyCG2MKIJKpg4okppKiiCSy2WMKLMIog44wh1GijBzjm2MGOPG7g448YBCnkBUQWScGRSE6g5JIIJGhAk05GeSAAUk5Z3JVYwqfllrd16SWVCVY5pQvlndlfmSLih5+aMrCZpptrtiknDXTWaWeBeOIA5p5+/glooIIOSmihhh6KaKKKLspoo44+Cmmkkk5KaaWWXopppppuymmnnn4Kaqiijkpqqaaeimqqqq7KaquuvgprrLLOSmuttt6Ka6667sprr77+Cmywwg5LbLHGHotsssouy2yzzj4LbbTSTktttdZei2222m7LbbfefgtuuOKOS2655p6Lbrrq2lMA"
script:"eventpumping.0"
{widgets}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"Index.1","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,28],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"a complete cutscene"}
field2:{"type":"field","size":[492,49],"pos":[10,52],"locked":1,"border":0,"align":"center","value":"We've reviewed all the functionality of Dialogizer separately, with examples.\\nNow let's have a look at using these features together for a complex program!\\n\\nThe logic for this example is broken into three main pieces:"}
button3:{"type":"button","size":[64,20],"pos":[52,198],"script":"conclusions.0","text":"Try It!"}
field3:{"type":"field","size":[122,68],"pos":[23,116],"locked":1,"border":1,"align":"center","value":"The script of our button:\\n\\n(High-level flow, scene transitions.)"}
field4:{"type":"field","size":[122,68],"pos":[196,116],"locked":1,"border":1,"align":"center","value":"The \\"on command\\" event handler of the 'stage' card:\\n\\n(Commands for controlling animation and styling.)"}
field5:{"type":"field","size":[122,68],"pos":[364,116],"locked":1,"border":1,"align":"center","value":"The prose in the 'source' field on this card:\\n\\n(Dialog and the sequence of commands controlling the action.)"}
source:{"type":"field","size":[315,93],"pos":[102,234],"scrollbar":1,"value":{"text":["!enter galena\\n\\n!light\\n\\n","Galena:"," Sister!\\n\\n","Galena:"," I have observed an insect!\\n\\n!enter pippi\\n\\n!dark\\n\\n","Pippi:","  are you certain of this?\\n\\n!light\\n\\n!galena squint\\n\\n","Galena:"," I am most certain!\\n\\n","Galena:"," It was an arthropod of considerable volume and mass!\\n\\n!galena shock\\n\\n","Galena:"," THERE!\\n\\n","Galena:"," The winged magenta ovoid!\\n\\n!dark\\n\\n!pippi squint\\n\\n","Pippi:","  By my apprehension your quarry is merely an unusually colored egg.\\n\\n","Pippi:","  No doubt, you-\\n\\n!both up\\n\\n!eggbug\\n\\n!both shock\\n\\n!dark\\n\\n","Pippi:"," MAKE HASTE, SISTER!\\n\\n","Pippi:"," ONWARD TO BATTLE!"],"font":["","menu","","menu","","menu","","menu","","menu","","menu","","menu","","menu","","menu","","menu","","menu",""],"arg":["","","","","","","","","","","","","","","","","","","","","","",""]}}
field6:{"type":"field","size":[100,14],"pos":[203,218],"locked":1,"border":0,"style":"plain","align":"center","value":"source:"}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"Index.1","text":"Index","style":"rect"}

{script:conclusions.0}
on click do
 stage.event["command" "reset"]
 go[stage "BoxIn"]
 dd.open[deck o]
 dd.say[source.value]
 dd.close[]
 go["Back" "BoxOut"]
end
{end}

{card:stage}
image:"%%IMG3AgABVgKMHwCpyt2eg7RaKK/evPsPbllIlmY5nmpomOkKU681f7U7LTSX9VN7wAhjO6KRdDsqkcml8wlqQqEzqXQYjfBy2kpLd0kgxJLrlGg+q9JqlJJtc8uw7ewajNOkfbAUv7gw9heHBFh3iLj0lShSd9MEp4jG5fEQ+VQWpgcpFsgwspjHOEpF6nRpGnP1grrlxfU5xdpoZEUJOobnEJraq+fbxluou9KaaGwIOPjq6vhbSTcc6PoleKcKnN2VrH2GjN1xuVc8xx1NjF4erk7IshuOMP3cTT/63Ux/H+wO7McPTauZPhnLIggaNJBSKUyHEtpweK1emEek4HRCVBBcOzyxfpAJNU6iyJH4TDls5U9TwHPHbG1Lx0ylKGaWhgijkeumQpLHeKoyBvEEqioaFyqkWG/WpJfwPAkLOm+pT4A9qXrzlXGnUG0oVWaVxTRHzW05F9VImdSoGqgr2Vo1J8dgXJNh7ST5qvblWK1zsh4khneqYDtHQMGsGDUbG7biYAZmWVImrHP+rBz847auyMy9OG+UdFjaSn5D+UJOZVgWUQxAPu5E+nZtXtmhQUfcDFby6HWxm4paRVZ3THKhP1nbPTi5V8Qza/275fwUO8JSp/fhan3yrtbygkdurjx8b9vfaWsmKDjT3NpiE5c8K1zHRdMfc4EJ4pn8G/Gib+/Dms95w6nHW21urVbXfDZtV00QAvInXn7oXfUZgK9ZJaFSrBVoWn+auTQPL1Vcxp579A0HIYSpKVZiP+ZlhyKHFQKmDIwmcgTZXQbh52B8WzU0W5BAYledkC1Sh4kZK1K4A3wiKKhJWWHBFiBD/AG3XobSdeSjjA9+CZ53XdpIJl8avoLWfZc5ydQ3EvL0JpgY6dfhjLstCSaB7cFVXp1wcTkmDxkZ1xoZZabIZ6L7MUfkeuq4SWVudurEDYjpxHkfHZaUZRaich4JqoqewqgjkogCWmMyluZJS0rVVFIfd1Pe2NmoJrnJJIt2fkodmwguqGifeiUYDaqbcLpJYbSmtdZj0f3oqJ+NsuPsl3re2aNWOvkarLQ/DPuOQAxmK6ZymOLGCDIDlXqaXP91oQ+5z3lrKrA0XkiTF/bt6aGtPrGJApb0OiZdqrXGFxI1lEoK0F6BvmOsvvF0ci1y0aI7ZFUMC7vseE9e7HCYkR7KIbuhWvRerEAIEU+/vxbpb8y7anzdf41lSVxsJusr7aaE8itzcpiKGHTHmM0bZnMR67I0ZYriyauNDq/pZbuoGTnYyFc/2/DMF1sMr8f1dgnwrptOV0ahDpbNcccbu1h00jUvGhfbVWuKBYIVL0Y23lkAvGbL0MYdo5Xp5txtJGea6V+ahOGiiFKOa+s22tTwCyWxhXrC8sO6Fjyn1X10RXKwAp9XsTQ7j12c6KSK3aZ1e6nXQ+ZN5iRP6nKX7rV/WHfDmIW+EZna4qBTxTd0z9iidstP2U14xu8OHH2/wwTFiWQvo0497YgLSPXCoe6+0UkNvSl+nyFXPn7h4ALlZcSr846j+/EXaPyE+MrH43FRu06zuVXva3Cz36U8l7CIAGpJk7Pf+rbwQJglKHyGeo/X1iUqZbHuH6drnQHf1jZ8NNBA7EleOfJ3janpjiD94xz9JAIRdYHtf73bIOxIYzjPKS9cs/reh8J2N2Nxa0OwOpFY/iKvDpKPgG0JIEmaxr7+KLFbc8PTqoDorhtBr3vVMU4TA3cRn3VngHcbXK5mKKydnct6fpIh5WwDNfDJYX0mQwuhuOO8MbnxNmvUSH76CECnYQhpURzYCBHWw4fN74CJZNpiVFbBxKyQUZ4CZIUWWUPLhRCQuJoZCo/iwCDuCBJOoVrnyCg6z0yyMPHyHcaihcKXNW2LxaLeYaZmjjjCSm3dieDgdGlGDaLxhlSwZPu4FsI3rLIQIelgtZKZRbJwyTUT8+X+UFkUGJZxm5ls44wW9kmpBWSKyqPl9VR1tCahqHaG8p/FlqlDcfrQliAbJxbVxxv4sVGQH6QnFcujO33mS47UYgngtDORcUmpn0/MIQid0atC0jCVeWuihxpYmmHWj2AWZChHNWU7x0CynY8S5gspWTRj7vOksSOlpKyYLEQa7YRdQ2hHWPHA5/FScIc8JjbnokpjYtChv5NgPIkpMlBiCYzyOt70NBrNJR4sm0yEWU+HOkMo/rMICwTl68DFyOVcEz14jCRLS9dKaNqDqPBEo0Dds70WjQyXBaViQdSYG7oiFGEWYWpbJ/rTlSL1rESN4tIitcc4Pi+QY7QWcvBKyJiKc3O4I9ZRpRdKqNIznMg0GwlJ1scYFk+KduXnOhlKIKKsxqXTCF/eVnbGH50rTnu8bAGLCjSfqtWRHFMSaJX2Lb95pKwuLKdEOys004Yusuwj3VNf5E8Dyq9cmfJR6lL7kJK1FozCiaFJ6fbQYHTSlaNZ0XgTxdnBMvattJrm8nJZy1KWEraBVGk30brV+mLOg/UEbOzK+530RlesRrVsFQX4RojV9YjUrM9ub0tR20qVsYVMq2Olq9mo6WkZOqpWXN3XVdkNdEp+oeOFuBsL82WYm4Ql6H2/2zfkrlGrMtlbMoEpMD7cDMPkbdMd50vfW+Y3RSYc8eGiiiStHUxJtTUyhS+ruNx6tBge5tS+pkwXLNtwg1BJ4F61zCuQxIhSNF4xmMOpITsaDL7KNSLTNmo5a1S2vQXGIXis6V+frhBysY0SaUFc1fCe7IoizpE3ByRc+cguE2Xl0Zvl+Zup+HZa83Rq/Vi7rA9n+rEwbrNH08Q2jGL6jlYWc56l57giP/m4qk5fiATL4sKe+WuYZLO47ucdHacKaqRuXlPHumXkevK5sLZXoAG9Vi5vGSGqyuqEcQxU3rrZZyMN6YuHjG3oGgKYzNXtn0Qp4RERGNMj5rYtXzXHmDAbXwu8aVvO5Acpbc4p4dJ0lr+9auX2lGG1ljCBeybJ/05428h7Wj+vuuBgBve0/APylfN9TmFv1UnnLd89W3zq8VpbyGCWabt2jOgxf9y25q7uISlILrzYN572BnBCu/1yF98rvoYOuMs9RiV4s/rWLrGxsQ3JuNOkz9SODlzQS57sYJdZ4a4+9daKPWTsjQfhBl5z1d+LjmtFcBZn8auCkF5phevM6beGKKtaLvF5erHZNUQ6qrZHboHDWXtyP2K9W8Ugervzuv8De9vBAc8Q9/jB9oT51VdNzjxsWN2HjraTA+/mR/Ms5HLpX6zGyGgTPbPOa2DMX2mK3TotPdsI9nTHacrpO1sXbBg0L0gZ2XWvh3bsp3d93bZpztMf13TtYDbgNk7nugMbp98UPs0lP3z8PagmyLLP0MBr0GxP+smEjq5A912ixPOXh6nPmN/BmnWPR37tnyW1w0l6bG0/y7sDFjtllEz23TOc8zWdu/5uHn5C3JVe4v5FGNUEZAHobrHmRMpGVQDUb9W1XBg3E4sUZdHndMkzQmMBGxUoELMEUqV2ZVrHVoFSfY7yV5+ngL2kXvuUgOpnPbNTUv8VV4q1W/tXLpAVVpUnZxXkWv6mTWYWGbRlYRD3MQnWfp8XMhnFAmUjRDVne5RnL7NjViPoSBr4cLrngwZoZ8e3egOHdYMnNpCnhEI3hXHHgRyHg18mfTYHbASDRO7kVaRnhTZzhqSnfe9DhlGxOvljKdjHTShzZPPHVTtEXbY2hzghQgwmgM4XdIAHdJoVh27VIfAnKLDUd1L1gfwHLKXCQNnxfYqWVIWmSQS3J4vTPOcHfTVzUAyoclg4UNVXccSximkUdu0HaXVYcDXGZvGmUaXGOUQjd+wVeTImcyOXiJOYGSeoLGGIeH14ceilbwnHbvuVf0fXeRoGMV7nbKX3iokjcY/RZPQnhTEGdRlGgU4Wc7eXSXjmh/n3CEOoMtslPiJIeO/YhUkyeJhBfuaoYiHneu7FeECEh/sIgXDVUay1KqCGb0jmcwolX3vXjZ5GkHIjOdBYQvH3OF4WjOwijLAoI7SkRE3HjH7mhIl4L4bxdtFHUkyVaHyyZzVHgDwmf64Td8ZHTItYf/PyFRjVjTdlhMjWkanHfMdYkNsxX+xoaqKXX6rGPbxDhDRyE8QoiEqnH0lpeC6jhEtVJhv5ieF2jkE2lMWVkNUElBfmbYcYlYP0QXqDkenXZ7rHi9/oiXyIIyVnjq+2hB/JbgFFfC1kSuc4it72gWpmdZrYlOSxeRV1Ui1YadNVhboRjhkZmMoHZ5OUiTt0l1eYO2m4NgtHZtzYhhFXWgh4bToIXF/4KSHlF6wyc0eSMLpkQvrokvjlMtVkdNTFdzvoHKGnh2zYcEIRl9xHlrvJNba3RV1GmMs3iHKiaw34jLNIX6nGGr4Wivj0mWhZdo1El8i3FP2XfsQok3L1S5xohv/oWWzHmtRJmKulk+0Em8exndlXKTjogmDZXcFWgr0IiAfHiCv5YkPxTA2ZjGMzgI9YV+qYnkK5bqiJVMYDUzyWiZ+UEMBXnQtIisVpehh5nADqloJHd8lYoSfnjFDknAMKk4E4i/MooWD4QzMoTCA3TI5YL5PojXM3elc3OSBih392QjTKMmuzjoIDKha5hmSiT0pmnpiIiF5YlZPHevGJf0nWNlRpWiOJebQZgz8nVgUaoD6aNqL4F4p5okfWj1nIhbTYkkjKhqWYmGH2ZYqDFLFEax1KffxojVqwLT+KkH41U0FyiQLUhBqEPop3TWsZYW/Im/A4qBJKRDC3eJ3InprnoY/SaJkiKwF6eH/IYX/TQyn2n5I3Wpn6oKcZUQyYpNF5gH5qcHfCQwnKpckHVmcjluSZZh+KLLxpNy71gKKaT6j1f7+EnTokYGyqmXMqZfMZaH5ppN/5i425qKNEMdw1nMFXqxnKi1/algXYjKVqOHWUhy6XQKVZqMlZOJCpktuHrIApm/KGnq9iFqukc+CnqS9anbuZqFl3m555KEwZkT2qpJRJWIFRoeUJhN46rSsYko+WpRApr+eHROBpNbIIjPUpm7k1RPAymyh6mr5pabtjbfIDqOzqjrooovoXsGKZTuSXpnrhlXYqcIsZskiGrwa6V4iJerbqpPVKqODYiMnKnciXmZn1jNjqh8QKaYkGinrJQidreTHqj7sotBdXqW0Wrwh0WEFLDqQElwvpOzNqfY1XQmkWYEQaTS8JoEeYrjyTnrBZbu0xfa15oGvmo2wHkpcjp77qT4OZtDa0jTRWZhMYj8b6RuvSFTWod2rIsxT7kMQJnwYLsVXDkf56ScKqpxx0sw2bdqTqhE3brTmLerZJnquqlCSSlz0rcp4Ks83apX6ThJP6eqmqZWtKiwxbpkC6e0NotyLmsYy5tExLiSuIH31Bh0HpnC40nuyKazOnNUJYdSr4oLwWuuBGuoX3h+HZWyEmYG25sVJrtSyooJfqYz9jmV/3sJ46VjklXE/xVWRqsWbmS7ILkGTpn5L4UdA5ujx5C+qroZq0mBiqtFK2uNqCYhNjnSb2vgAbrD9KcXAqhj1JrtLWuKozhr37sf2qunfqBuCEut7jrtYJn/jbkeiGqmqCO2XbIDyKkr2rsgrcsFfFqZi7sCA7od86YGCrFmintrkXs+JasX37vDtpExGbUL4WuEkUXMF7owLrliuLvELspuD6WVRawCZ8uNDpeIqkwgJMuZfim/yJjOE6nWt3hP56tCinqWa5xFfpwvZnmocKtKAbwBF6r6zqtRJct+JInxaLo+VLpnyItaULwAAcmDAor+YKSZsbtRjcWGZcuMd5xJJ5UY01fZYRdTMpnFpEr8tLQ78yoww6ySVGp+jnQYyGnvS2XYz8eJEbs+KbuWTDutqRqV1ncR65svqrw61cpI4rxiNKyFhcd008yFqbxb0sMQ6mo+PSvBzRc1NpU12ImEKswcQbrDY5TlZKtHBLxYP7pkRMlEeBvJX7g30JvjAsp8KbRZZrcqEcwueaq/cEpWJIsdiMzjFnycaGoWHkiCN7f2HDnLzXogM8vLeok5V8tjd2u2giyU48vmjiGl3JSz+XhNn8zSOowVDSryWMv+m7w4c6woNljz9Zw94CwXJZs7Cr0FsXzQeJRQcZ0Rt9usN1eT/cI7aYw7qLvZc2juCca524b8CqVHRKzMMMNN7Lzmd4z9PqPfursMvcPtuasvm6xEzGqXyWO9OYiw2mj+KsXxJY0XhDsqFHwCjdjoYrmafroiyJxwasyPvzkmlLs2I6UaOnVzc3WhGJl3ImXzJtXA59qm5KxgR7yhudSPMxKBat1XRtIJYIHT79xptZRq7WKb1cq6aM13at1ur4z3/azmS1huhW2A4mlHaXcpr3xP96zBmKOferyn2dt/mbyC4mOVzrvLIG2hYFqSVbXnp7pHcsSFptYpg9x6OUdx9atFNtxmTd1M5427E8lH6Mzbistpd7ziJLygSFxIv8aRGMZv/W1xctapDb0E+t0/wIzAlNWYUdYxxmbnrl1D4d2CXttqQphzxNvgI8s//LscUi2TMN221VuMWRaqxKV4hV14bMv1iXU2Yb1c+ZxYt9WBYckqssJsfN3Q3Cu3r909wn0hFuR0hdifvIPIYq35Qc3ZVD0Tm6t6aawMkK3D9Uu0g6Tcv63bnoEVcNgVbE4GIaUP+62Jyrs9QZz+LZ3veX30R7vvj5rMFo3ceki1b94j0NgogNOSbJP/MmUxXu116l4PMLeqZrwAh84gJNxelN4co7sP35s6kqeKy5oSRdz3uTTtaV3Q2JgYVJpCnnbvQI1ctKzv4LsU2rmjls5nn9luvWxTlSO+pd4q81xIARjhlN5bDN06ItsG9tvopKyOrksax9rzw+zq0dZN0X1QVuzq7an2V+S22dm8xswkLUbiiNpok7LCCxeels2O2dztM8Kyj8l8pIl8b4SFiuWzMe6sSNE0XXcHiEziLJxDAtynWN256YwrM+5rmq206twAhKxpk3k8vI2OK4lQA7sZme6zBugf0s7s7iycd6d2fzyZ6+UdZ+Is0Ofnss21teXDfOwVM+6cwO7Dsy4f897Qzd4y21vPSs6cPpXDSd6SVsRKy95saY7NilYzv1yRDOuFnO4wyP8A9/SoMe2jPIyncH4K/DawUbrxovq+8eYKkOC3lqf+sq78/9xKmd463q5xrv5ctB7BDvcEqe69QOo5dtd7tG4duHyCs+bePp8JVhx/fO7Xku4WuM2OPmXg5eyq5y4CO+DtJ7u0uJ9D7/zfIMqenO24VKR2/HxRZdrpMX6ANo772UoIvl7WOO6B4v8PZM6OuubvQrpQhf2kGt4HgvMSc8bS/LkkGtYAHMfF508xA+b9Lu6tcd6Rkv+Khd7A0dhul4aE9Lqac02nxez2I+6fytoX5fwzbo3Gr8IW8Og36v95Lu8aU7v4h/eZTlxrz+ccsuomq/8XNu909N56f+8ylv5QadlR5e7XXfrgJtuaIPtHj7lWdceb031h6dOThZf1AK6U8O9o1G9QerlHXptRxc8gef10SX4Xe90xX7461l9qo85xbs/iQ4/lRayGUvTcho3v+X2zV99+W/YSp38QQAH+N02xioIFFyD+aIX5TTC0PKcqCKOa+tY1P1VFm3nGOUnC8NTaa0JdsAa7QSiFjRFXNJplJ3C0Y5xSXIBs1qr1qhVCjKQWFKnujobZR7xjYxXK1hPyN6HTt8W+LO2zmDjUYGDjCorgXN7SxKUOztZSWSbGpwy6+DrmtBMK9NkgNucyvxsDLJkYtQFbXU9dVszcpTkScGadaqEQnvg+KHlgTs9OspbgVUL1mUqvIRjXmStFl4Lja5NLrHyZoTh8sENo26u4tZ0WbVjBt9mApG/XnnM1Ebcim8furX1w7xJ9sTcZjy1RuWBwgbd65+gWslEF2mU/q8ralWpck1Swxv+SgoS9mxRWpsUSpkUc6OkvjSYaM0r2AxfKn6gGRZDh4fI//wQBu3cWbAcZ4QssJmD5dBOX7sPZJC8SRGNy87TpW28tikcyYSKiXliGCzdVPBwfToUtM0oT9TUnUGK+klerZe8PJgl9dCbhr2gqSFzFxFZRNZSoMq8WNaxPKA3lxqKGSoZ093Otva1bI+RIsZBSUczG9MsUTVjHQpde7asn06dyYbqW5dOxgUU765Ve41YWXYxTuneKhujvvIPMW8GdVDwC4ekobZWmPZ1MvHTH7F7qvGkoaBq+2WdXkjU/RG4GxbCyAw2qHyckrLlzMy3oFG7ymaBfPEjiuXfvOpkpx4CPtkDKwyG+83yQZDLarPXgOsid4kgo+h60QyjLlpDNyjQiYKlMw4t6Lhp728PmQsRIoiGwguFXMTJUSZ3kpwFOfCSArGs67KTSwNCazIuAsPE1Czn4J0DKyPrjMrogWbSywf13DC7rQ/+BEDrxKLfEeX/zasapX3mEzwycpCOq5BbU60asFNMkpIKwe5euwIGsHkIyweqwFDK/rKCU5DP/lTkDLIfhzsTvmIsyzLu2a7y07T+BLJSbbmJOetFw1sSi7gICszSq8kxNLF6lLssTAgwyPLTGLku3JGD+egVI8UlXupUg5RxTO7VnsFyB9/YDUyOqrUPAvBtRRiMJsvY0XMVBWbOy40Cq3jkEb0Lk2DP6bOa1OXI9051dBMnpSxx+0UNA3X/XJiMV2LSryyH/Xa6dQmWr27cZtD/asMtxg9WzGqPkVTVFJRk33RqwyZnMVKc1EqStBOljl1PHnGbQs6aYulNtNYQEPSG7pm6wUjmjoMNGNBF8YPmknJcznUJRsCdtA/6U35P0RtDjkjVL1181B17nMLwC71mg5Zh50OrdeiVSv0YqJRsyq9Xu7IGth/aS7tR3Slrk+4f5jVM+iFRzyY2KRBHlmTvwJEymPGns6UkXfxOrAVom6s7uqIyvRTJ8HYxFRVXTk2yBf17BoCZLQGdBFyU/IMryFfyxMNt5gGD5Xwbaz9NMfFNn9Q8zg1vdTswYP+bWlx+ts2v7w/7TJewwVf18fTHo17XkQvIpu351Lhu/Id9Zy4bfre61tOh52XSsxaO9yxE/hgy9jroLKiOtWWNAbq2Cs8pdMSjMvfxzXQ9ps6LDRNhG23+CFaPHweEy7XzPNn7/wO6/lcbwjCHULhbR2qq80yYBaZBlUOYMTK0dHgdhTM8cs8hysg5WbFqDo17DYXZI+jtva40xGsL9NCUcjIxrawCeV2blvW6rDlHrYlylHSgyHjEkclheTpPrZSlniuVT2owG6ILzvcDsG3MrN5SYXM0VqwcAYpaB3Ndxy0jf4M2KrdqC1Ke4JYwsjXLDPGMGbhQKPPvhZBHCUNazOLFfSeFbfuVY1nXrLUibLVvuzERRVNw08AH9eoFbXMdPkZEhjFJ5jLPOt6pnOKGp0lvuFJz1AKPCImKES4ALIrYBo0xCURMroe0tFImQvcxvp3IECljzwHrJXJLmii381PkHocjYBkIjOb5M5ohxjeA7vSte29bJg/1FuliqmfLeWthxNypg4VF8YyRuqDrZSYrQqoyPj48jDPaWB3tLmeQcgmZntr0jpXpqvkgA1paaPfEYWDMEkV7xLqQhGGhnYkhYXxiwPqoi59yclMcgU5T8wFHEtHqhmhEnCfRGTPmhlCpo0weOVpz/hAKUh+RYye0lyUrPDVSHlO85HhpB3NuuVJ5X0yJ3RTWJrQ9y9ZKC99MVwg63iqzc0gb0lXNMtPTZizdlVslid7FMMkKTSRAnGoUSVihoIop172rjali+kPJSZMgeLvmlixn3goFtAMwqkWNVNk6HzqM1muLa1piyRnPAkhavVNlbDqSZNGdbq6YtVztPPgQvjmOpRFz2kVDIZMuXeuZTXzc8j8Uyxp2cZforV/2OlaW83YQovdKzC4IqE7F+q8QuISThgKLDwxmMQZ5u6rRWwsSRw5uVK+Bp3dCgiMXtdEMR4zc+8EY1wuOb7W8aSr2TrZMpMLybFYb5zccyhVDYZC/RRimA4V05qyWRzLQRJUVf0VNfcVXjICEbMsfep5zgc9mrr1aturSj4hdD3h2pFof+jsKAvm0y/oNrZKImc49UIiEJnPnLAFlyvDxcAdWvWe39mgGwmcx5q+VJ+AbOV8hvJXH3SzeQ/zFVp3alyCptWvpBvIT3diLZ9As7aBfCXKKJY8EksRIqSMJD9jS1QoeXFD1wJyj0GIqeptF2q4AGdmE1kqjSbXdvuFch3jG8XXSlnIlv0ftmyjySq61Vt/Sc9331hUZL2rnLTsqhMTV1LQhdSfaAKqirPrvn7NqWCfDS5cyQng7GoQUPcdofCyOc9FqKmLmgR0oEul0FsR9rDPUzJy2kwlq/HJprUjbYWpCWk9n9hyEyYVXqG2SsOZeS6bukjsEv1dtc23om9Ui40mYz+L4QiHVXybf8ol3tvurYRSRGf+aqi7kUqyO612VR//19ACYXNcLpaoXHWs3ZTwVpYjRqYqz7bsQj+QGkbc87cnhL1NI/aOB/zyJPfFq81tTZhP7O860Vxq7yDYqVhecXynnMO7BniBvl4XZu/2YmtSlHrmrJ16vYigCYKOz51V6+yQTbmTUPDW9zhvZWGmJSxlLYezJtBVL+1gFPutZklGcYfnQeuOFrY/NyvZIOnbayavUHMNXDPBvpJac8kG5d5jJEzZF2MINjKeuaIkvyFI3Ol9GRinrVdkRyW3y6AyWVFG3N1+TXHgvk6tuy6ZpjEpw6rpt2OgXrKNyGXenvnXY71MbyBGZzJ38bC5uB0J+ObLHlyTcJ4mpCylCNiimT8XaK6KT4w5Fc1+S7vFxOPrn2XqXoV/RowTBS0F2cjxgG5Qe8nk+sQTG9ktg3ndtz08z4GOsylOWr7cUo7NjVzo77TQ4Cd35fPck6RdRN7ExYt2Q9Mo3pG2V6qd7qnuhwxl0VMUiQivPCDIVGrTXhjb2+nJmOkVddjD+JCfpr2MeKlSoOVM9Sh5BxKDzLOyotTJabzzXjsJLQs7e8MGu3E7Qml/0sQJn1yuuhxokaSlv+ovXcwK6CDntM4k2Likvuwq71gJv4jrmS6PWy4Miuxrt4gj8xzO/hzknaIvclqixIwIzEgvvYou4U5q7Hoq9Q6O1ooLugCQKQ7i9kLQ72gM8BrHcWLDXoBKqFgF4EZhtQQNVLhoA5mqj5DLuIqp8vpF0aDw2s5mp1YtBD3vuqLJ9dJhYyIkC5lF7KqtYagvrgBr1XaG+9SQAU3Q+6JOjlqLCGGM9ggsWniOXcBrCgPkjvjHWT4wDZmHs6zvivYw1E4pghrLoPaL0vDQpU4PnGjQDCuuunhv0oQF8DJR6t6QEwGIdfRLcY6MjMjKeEAw5N5tzvLuTCZJ/0rx6trtC5cO+LQOwqTrxrRH81QP7BQuz1wt1vKqAKPM+LRt8+YN5IRF17SmE5UE6U5N97AIzcJrDHWmxzguC1VnFpfqDj2FCqNQ8JyjBhENlh4RC5cw9uhuEIXrnCRBzeikC2NNl1Yu86CQxuylcTTqv36wEzer2kSN0/DtYCxw9wqrHAeFG4tO1sRKDHnKx9axCZOqxAhwI1gq9s4wsXQCGw3N3+wkt3pLR3jt6NrQpK7irtqHJy7RlvhPGffxIPsilgArG2mOywaStLRqYmJkBdWL94IKAu3m63SQvtaM/GzvF2Ho8xiSY7Iq4bAvtBTv0Nbx7byp+TixB6fuB1PGwOZnH1NDiGoMcUjuyWrE8YguJq+Q/sRtumqv6bZJznAqmI7SGoFL/tay20QRoOjSmLhjUshx0LZOyTwQLUkpuH6OJKVJzGSOirpvB5cR5wBHqgKmUOgQkQiJ6VhpYDaKqmQx+qrFGihS+aJnBVMQfTKyfDLSIwryET+y4ZjMJo/NOhAQ3WjDHv8SUvQRe2BvuWpzK8EjwsBrUexSZW5uCpEQdoCR3VCNmPxC0ObyKCEwNENHFwGxbVYuunrPhpzCCRtFr2JOVABQJPHLA78Bp2oz1DbxDQVozI7TB7cStBCm74ivySayiTyKJq3HK0tpALeLjpBsW4ZorMStEYMOyLpRLhWIEFSrArMsHZHrFg/qNwmFt8Bk2kYNCBmQa3QT5AwtS1hSNF9wajqwcCYHOw+Rs/pvJzPp4vDMTYYTSN6HMrttm36sopKHiVjvqf6PrtSNNidoi7Ax8lKUyi7wNq5yuf7ScWwoQ2uQQleSPTGppdjsRF/pK12HQRqRRjNzCQNn9RryXLzOqgoz0Az0mSLSK7tTPptPVV5U/xaR7OrlKd8tUXoU2NLTJEgkQBWvT5gUDiM0FIXS3YL0TI8OHEkUYKZHh/gzED8SNkGpKZSrFaNm3NKv64oSKgdz3Cr12p5OAv1KpbgP/tYrIQkPRPDzya7SSL+IkOqRJbFLMrUjl2RUnPrpkcgSLwdruC7rRn/Hg7C0F1cPwlovwe5zHpXrpkjMO4HHGW+GQTdMKdAuR41xQ5sVSc8TJenUJSn0BbWSKlOS84LJ2vKNBAWG1N7qmFCRU2stMyZM3o5PtnJTtlpzOyOnIA9RWLOOyPwtHs3UBiWS4CayqbITkDj0SK3tUguVXtdzW6FRjeDovFruEh2PXe1us9D1R0VwvZotOIBTRFGQqQhWzuRv9v4rDEet6eDRXynW19a1eZAKHd2QNmVz7qYOvjBtFf9uValyNaHJ5ZoSwQJWTDXQDRHxyLDpSuVyZDHvwL61Eim1Uy6O2XbU/Za1Zq1QEDeWgIY1Ty9W+3QzWMkTQ9dT+TT2nOQLYXezwUZUzPAnEtNOLK+ROYcjfODqbadLY43WgYxKOAWoCifPFwezjDrN7mzs5M5yKfXKz4okVXnR+ybrZhkzhTQTaRuXPcHTFofjWH62dYaQNbN1y4b2wQTOYBetsugvX8ZoxJqTcicUH0cVxzRxLAfu8BQwEi3MCn3ua12vtTJUW+Ewb3kFWE1VcoPQ+IaXKwujHN0maj8OfjBKFV3GAgUyBcnSxSwJMEczj8rsveLKLMfxIZVzEGvXQ4nIgDAMZnE2kW4heJfxCpkvM+clfXXt5z63764T4eg2+eRn6CLXpGZNdvcWVduMZDsIZXmwLA8QRic0cdG3dC1Rj2QNPRcPOlNUcjVmT2fzdle1Ux0Sx1CrbDF4sb50SwRXfzpWIQ2VNGfLfLYWgsOTXZP3nyKOegkK8qrQTd+1IqlnOVtWfN3VuioWpgQWeBq3fKvSg4n2h/W0foJXV4lR5140JmkOC6FxX1mudb3zZOeXeS8yfq/XkWxXq+qsZK/z7+CU8nLUqyoWo+oqIcMWT8tXWwlzgt0XGTm0rejnHoWNa96XSOunXVMtXBC0eouq7lYpZM+soOYt5VRX4Ew4Lr8YT/1WPcnVd41WTd+L+uQtw4rWjTH0hDj4O4VYiRPxiL/WQpG4iFkRWsUYYoNWULV3LBOVWXURvuAOhbV4BO1QMNO10gxubb0qt9wWeZx3dbE3SInZfXfXk2dzWYP4fVfTdTNKffW4DS9U5IRMk1tOM3GQWetSXo3RFKsUhysy6MaYug5VWaEoUvcv4n4yjN2MVjXxTTx3QPVRqTpycTm5hKp1gsP49fI5VSu4mbVzWkiXr153alumUWEN38aVMuESUHszMJFCZeuooD6xndPZ/44VhydQnJW0fSMUoIE3Wq3oHe8xePLYg2WPpEUanpG5iLXTKUF0rVJZu5CVfFITlkXNDKPUhaM4aUUYbrZv5m44gWHXCctZlj9zgJyu7App0KgVpZWXW6e5HiHSpNO33Cp0pUN6pS/4Zv0unTjN89AOwHwR+HapWZFwlsn31bhziTWUm38Tk715WFT2Y6EXUWnaXzVa2Eq5QnGWWxMXE+l5Q4V4sI+0pK8aoL0aqv23UW0L4sjrIJtm7nZ4i5taNQtZbJ/PSiV6CIV5C58RrodVjPeycwcWdVPbl5MYjlFLNl87j21sd+d4jhfXB2v7sLdaj3EXM4PssR0SpIa2NXer/YatWD97fDcTXZ3WFBVLQ+muQM2VV5G2+LztOzkzgPHVlu75QhN4j6nLi0erq//5jXm3u7dbZiuYsSfXTf1xP2kKPDt7IS1paVGokrrpsZxXnn85q8wq5CraisM7LPMKDMvuTOEtS3naNr26SDeYa4MN3tCbsKN1T8mTwq1SsdN7t1msV0Ex9AxSHW/5eh1UgNGWBFlXrvOXFGM3Ri00abFNeZ/6UEF2a23wYZW0kdOYSItUd6kZFRc8tlX1vBM7MYGQq5UZqjeco4oNS/G1iivxNbE5HFH5aOFVESUIzzSy9HYuiNbGrj9zynKt8FQUFElWtZGRiF+7KhHqgQu7rwF2B+P8pM3bxW1zo0R6t53S7RqQ3lTQ3kKc6VgZhjO3lYcuEPuXfvshkNuyFy31NInOkPaV0KM4Yvw5iSE88Pwasf/6tlE6yG078DD8wTVc0e28sONY4lBTPIn75tISfxkVoUHSuuDawGm9HZ8bobu138ptKX+UuZmpBQucbu4U00M6tZJUJY4YveXctDZ9mGODtjn41Md7wxt7FJ/Op1dxJAvX0FdKxt2ZggN1ikN1dQH3w9yPeU/UgGu6cN7x0AA2Qd9UcMtssPnZ0/95I09IJuP3vFvaih6cx2G2B3Mzz6NUw2pVrHFHbvs1Cq94QGm4J38bR8G5r2+6jl3yAB9Voee9yLBri/eknyv834NQV0n1JN9kk3ucLXl8NxH248i2g4cc1Wcxx3MYWRVZhjHQswF9iVudmGHJEXMa43BxjCNtupe7xSXbgg/MZltU1MXba0FWt/97wcNNd2/J2Lk7yTFcsaldx0kdlCd9Ad9PzdK20s65iws3c7tONQ86nieQedb+3c14XV8WonzdT5+zQB0LKe1TyEP+8yrG2gt8Jr4Pe69+6xc7MQme1Bncpbe1Suc1hoH5iRPZR7vMoguzw4OSoBce6LtQqbmUim7J/3S+ZW26rn/YfhNWxxeTqodNMSEfT059JUc98JF5zS/cwu3Y1F9awLlt2r7GEl8KgdYSwVM/HhdORZvcSG1VqKsFystdAI16tPbbHjvOllnwPCdZzfHc76M6PQ3Ml+9294W8/Bkf8fs539W706X50487X4Uwo1uwgU+85uCep2e86d/Zih/Z1AgA8cUZswJysMFV30p3x5Rx1TzipDkKpqGZlJ4quo1u1CFW7K5vvnq679ZLETse2RGY/C19zuDuFppQWB9qCccxWacilZekrY6EklqZdArNqLixCf22gqRyGR69bau5dLcXDQtZiZHhBxDZIEjPhd9MHeTPF5OkkKTSi2PMmlHRkGFoY6LSk+npDqQeBWtojVhXIIeszRfbK19foS4lIO4i7BTnUaEF4SxxGZ/xst4VW7LU3yFy1i3ppjVM8tDjIanqXOZlkydUKlGl+mcU+veSDTjqk93Zs6qwcGxbEm9u5JY9uPLpyuXInh8xu5hB64MPGLA7kxg64xJwGUCACGHg0eEGEbx6k3zxi2JuXRBpmNZR8xgvHTSUdUQlWiOvErl5oGyFMVaM1qtbWKYJ3DUwjB1BsYLBiYgEYUWSCS21WNT0KSOCXSJx/OdMTTybHMl1CvpVXzayOcqq7IcuGj2Ycrulk9lIpUS48Obm1FlLUJY41/4o+/WR4MuiRcxO4yfUKjXDgUAu1JpwVTgwxAg1tvy0KlrMeD3SGLoJZOGfZmCeHHZztKmcl94lndgXlcK2p9/VfaszdjOK0fwZTSM8aESDs+4gZ3hvkMJ/yZXSDH2cscOAUfsBcnm1oeFmPGvuvsJk9UQnMVHjPMcN/Tn0B9XH/90VTKe9IR/pt38ZLBwNPVQZc9aMRyAiVRj1i0V4CZhPHJs5ddV01h0U3WXJOeTaG6BFdk9H6sUkHyXuyDdKh+24k9WKwK0lW1zv0TUjcBKFxVVroPiHWwu2GCThQh0uaBxaDeKjoHYQHVWaeBoxMuCG4GFmZIQCjVVUL8NAJRJsRU62HDtIkcgVat+0Zdt8brHXRHuZndebfSGmZRtgOprH5jw/CYcmfkQ1aV5xQLmGDKDZrRKeYDMJKdahiT735aNe2RSagI8yeOChSLqnZTZQ5CVjevTNCN9sm+YJX5js7JhKHi+qKM2npdxW43uy7NPTdWckmV2iQhX5DHNGDkbgpAgOx0lYj91pmicdXQRsYT9C5iYPark6jm+yJtjiSJmdeSeZs554Wp6rDhoMo9r2d6J/QyJBEZIHZhXvhF9pBq+FlYqWH4uRKnnMsFCB2KgWOPKw1UbFQCbHthZNmyqs17y7nyYcioVniaeQiyq4cJqrY7EPeZvJm3bFlt9ZEkJHZIEZfqdprdoM5yN+yEmZxpRgNnkYU4hdyN1W+yT4V63M3MVwqQvvlWNvUcGoVEoxymTtt7h5vKrAaqaJ1XnmMO1XkkYjiNhMmM4x9mMeqtZgQTdfWB0rQyfr5LPeFGrj0Y5VE6xI8fWIrMyrVQxOkG2+m/R6ZmabMeKisvuxiUi/uhPJ6kJOpVYC95SpMipjmbMrNT0n9qRKp0l6bnVmvjBPDCstLFUuHyY3FkTTdyasK5UzdSkmvtWsXKXPJWq2lwdLWXCgNvv4jgY+6aViCgNVS3VsIyysKL0Y+meQfHveY+pB22OZw3LqHfvGKgIL4OwyKu4vqGxWK/Xvo8xqteNuQo6l/l6L3r/xNCVAXQ1MQYXySebMtjZfFXA8ELEUAqF0KUaBJjg/a5gm9vUvJqlPNcxSS8A+URv6oYRjZUoV/ORXF93czmRYG5p3VtYqvjCvXcnrTvSiow9vORBStQEPYArkoIFNRUOcSVuxpLeYh02GiOkRTck8Z5UWwWJNwVPH4MzgPztF0VM0jBHwtkij/dnrPqESmRb5Qkb0Oc9ZxIHZ6jb3RgGOBGmeSVm+UrPBDd5xWfO6ER+JVhA1PbFbXdQTinDCQhptjV91WpqLbgMbU93PXEeE2+j2oLzenap1erzOVHw2kLFMazDum08eA+VHIUUqhA7b3WeA1hxCbQlILdMb17bYl689ST9zMuHI2qRCbMHpaVi8mg3Pp0ng1a+Q3eClpzxknECy6jP0GlbB5EgUqWzPiG/bmdAoNYawBYZQPuGGpVynSBMC0Zf/I038jpm/wIgoiM+8J0swUakuXo4eFBxUzQ6oOd0h04va0E4Cz3UrXvHxdYGrGNkyuL6SPCuHdsMeuFolSPBBkDu4y9jSrNVM3D2Pg1jp28TK8TTJdawkwyRhPyEEIkuQaRsX2+EYNXaM/6BOnAGjo2dA2U50eaVzZrveyjKUtV+d00qsjBiHGmbI3diupDgyyfuqVx/KnOR9LtxdItlzujdV0obYvFcj4cm4lZT1ZEaVWOgCuSSZMqUzijCd7NqoQ/b5qZQSpZxSG8o6LYGVpqR0y+kOhkZmPnKF1SQNFPHkF901TrIFNSugAAqXlvSJkF/15/f0JR64ktJXEc2ZH3cIRL0uq4KnvOpRUZkXrhksiqKl7Qi59SrXjZWRL9FMpxjbWxTus6vutG0+P6tT9o0SttR5p2UnW7R6RMmTlQlQyFhZMJ7ulA4LVdRqJQPcyGKIUlKZ6FBj58xaOkp+PdvWxOzYTPtl1VTRlGfvdknWnH5Mch/6S5YIA0AyAshJiyrgYcNGxF+RxKIHtS4mhzrDinjHqfOiqSYF81F9LpFqUUXWXYiXLk5mFp0H65LHRszbjGbxsslUzH6ogzK/6bZdVSSnhI8ERaRYsKN5XDBGtLnZtyVlmRAcStHOViZ20TPJTrOq0Yrn2NZIVDdU5ucQVStl4vUSjP2crI+UFUsTO8+w0ZXudtGWVGJB6ZO44pkUfaw9Fp9Pu+HrE4Ubdbwxb0OqWkwaq7rmm/aZUYzqs+mhOSbcUbmXmJNj9Jc15q/xAVS+ilxcTJ0sLwjtrYdxyyUDK+QPvwJJfH27Vb9gvEyLwrBT8BR0l6+4po3ypqVnvM/y4iIbckVtky79Vlsj3WaPOmaVWs4tNJerITtTL5vWm64ePxfKCQ02nc392WwQRUt1DtK+ZebtD6NKGyirsT9Ry50XHVtCaJnR2yl+rH3j3V8A04x/ra2pq4MdSUPFa89hBl+96a3AgLPom5ncl7LWbJ0SH7tbjlwLa5y5GEFCHGhSNXHnKs40dYIMjPmGKBW3LC5h61StMA5mjAmabFrRGnRLQXDgFB4OK/FCerKl5ky7FLHUuXrmXYNo7g4Hw44Bszw0Bum+z7hLgrt10PgDNlh5qW9L5pjd/g4xp+w09SplEGVGFi1Gls2vtBURekP/ttpGU2BLL5ihvi6Za0OVUoW91cntSCN+4c4tqAJaZif8YlgnWTWS3x1v4fQeWwnK35IH+cjdA4tqAYzzPuJ4mhfhuU3DjNYHnpzQTxyTkmneYXjzaYnJjWH28jt2qPvWy+sGNP0MTXK0E/a4Dw7eipX72G3/e9Sr3vGRA5qbKQE3oxCv8rS799wmMkbEi+QPnVT1dzNLWsl9HrHWjRtiqkUeRexcND4JzyPt5tWwsw1/jcF2MyX9rzmlzGbNE7yrl0WbfKA+v5hZarHrQr/isksqF0Hac9WT3unXKoVJqTSZxWFae1QWvt2a+HncU9VbMGETIMEe1qwdNwVKy+HapMnQQI1PWlXei9hctNEN8e1dkbXQv2FcB11YXRHXpgyO9A2RpM1J0wSd5eTdxpleWM3eBeaNE3GWhzlgf+mT5jlQ3SmfEVFME4IJE6acmeSaqfUY9YmcjCUelyHaVpnS4HEbYD1fANrPTSCTEuVWCSnW4G1hAN1bRW0UYtFM/7lYrzEYpSlflkRUkH1JLf1eIZ0XCXbfWSXWrEEViIGdc6HbFT6aFo7I3mFdhs1PfVRVcokUFv2W74wUHcZU93kfHI7b9V0ZgQVcC2rQIzEV/0leJmEXpxhiZvFfhayZZSVgCVbLifGGHbqd3IjQlnUhn1haAuLdbKVFfZGh0RnhugkbuhiQ7ZVWvwyg7jlO7VxYHf1RbOFQWbRddUmH0FHIX72hz63LSwEOP2FQr/WiiwiTWv1fOUochakXXfwZ4ugfIW7V8OygJb2ShSwfTcSPMe1PhXnPBYEjAYndBWpOlmUXqz1I49XjQ3WG903TtSAdJApPgF3QFUbJfKnMu1FLthVh4ngYVlWfqiiW8WRcKZ4fYtkeMmYg3wUXs3BXCAlkzewYxRlbOOKREi4V1hkU7oXip4jU4ejKN6EK3kGg3kFgMAoOqaChWLVYUtJTsoXI4v1GdxwQw3nar2nWD9qYP5YTgy3htwlUNYJbGVlcH15dQrVbSvgPGn7hC7rK19BWW34Y670UQ8bdOJYkSX5E/oCWPa7hyr1QRXWYVjnhRpJYnMSixnGeNG0PwEkKXYEb5nidJ+7WtWQd4MTSepyMok3N990OGMpejIlk5aSUSrmERcZa0NkKmkWgVRIW7WGQSsacd3VlnCiOqqHdMD7P11XkJ8GOVsrQVgJeNa5IefhdxBHTYU5VCzESV07hCvKNzgUNSjKZufVcYPJiOm7dYiKm491k5exlpB1UY9SdnUkHnhUZwQzksRQaKr1i02CmDSJPNNFgV4BeXa6TewjOrQnloS3iJDldHV5iyNXga6AjbDLezS3JdEmTCmEnQPLP/HXaZHqa7z2cfMmLQlUDrDGWLYlY7fWZ3Kldl5mkSyWSe57d/JTZSj4TnMXZpcWbclZSZ4rigH4ZLahXbdqdOaYjQJbdrvSmcGKe4x1iDBoIH8LjSV3UZtoll3Uj1JBkPFFRELqMuhngSREfRnoWWThgfZmT/ynoggaakGKSsflnlQ6mPzFjzEXPK5ZizgUluomTyByLqhmOb8YnTtbpdW3OMybGiTEgF6Icn7HhVU0fdCEhX6rjFmLgeIofz/Sm+dybO+bXJvYnYg5pol7SkZ5LHJmiBZrheXYmjVkMgTaf1uVgZnKY9AmNJs6ZlyAPZ4BmX5oErHbjlwqgvMEmxY3InnHVj5obmeYmkFkT4sWnT6XR38hKuDUerh6q1+Bfou0nASLqjKrgrGIMC6GmiB7npU3jfJYIjj5io+qWLgGpjjoUdU6kZmVVumYaVpqGXNJkXDFd9uTe3lAFFb4aZUUkOk3cmz4nrrZU7XAgmlnZBhYOJB3qsOrmrp3rGGKfC3ln8wTWFPEZFcYXobJpfwqqqN2hqBXgyGao6ChnwR7lcgZaPSLgGJ6jFkbQtVmYrl6JAo7VO4IhiBWepn6YZDUbCp2ZxWbgnbYEaoXp6FWfd3Zbs/pbyLjf42VhKCnY3IwMU7pqvwIpJr7nOaWbzLbCMXokdUpirBlVAOpV4ehnym3emV3NGpZphzKXR6LRoioUEGomX7VSrnEbR3EmtJpWUv4h1OSSNG5sp/JQ8cyV5/XkGJ1lU4wo6bXlwSJZxvFnPQVXPCIocsFtuchnmlWq7YRb+hDrC9kSwFTbbXkSnhreUPrf3C0ZF60UsrUqav7jl4ItjBga5l6qex2s+d3uNJpFvjHumG5N4t4PKFZlG2roCIWldVKV1GVqgb4ahH7X1b7Oek4g0NKiI4JQJopRuV7U625pI6or3YINZQ0JWrWPmOJuHPolaZ5q1L0sTJWpnSqpPVnZlK6u613sv7gRqcHay1VJ7cmpV+0qBxWTfXarnn7gN05vopWRIr7rCsWNME1uK7Yoku0qM96jXUgStiKv8s6b1LrgIGns05nvd0qMqUkG+aquKkorifZWfRqm3Z5rjlwMh9kiX6rsaRKr/krkz97uAKucoiBQVQyxZ8VjDTsrMN3tmPEp4WYe3q5jsbqVDd7eFEHrZjCQRpUXrd7d6SVGo3Fr0zErEd+Thk4p0IpbMSqg15KjNfVsV8nRPv0svIGoD5sp50qjPhqZ8jhlrWmfxfoU/LUbpwGjOwWVE/8OM6mp8IbRI/LttO7XzkJnwJaTB4tI47ytyJ2VEzJIaWip4Qxqd/psNOror+JR+71fM2JrbkZYBRoQBdrIFGJqlLpugCKx71KVu44yLfnkDePmfV0c4qLfq2KguOLem9VxEyfu4kQslSom4WneAcLMNRMOwFKzVa5e2s4cWxTb5RWYI0fk1dpi8PZy/QAdko4vgUIzNfLa5kLvo+bg4j5u13ZyodXU6LjqDBvnt0ov1WmVVCLuhv4wfw3tVVKZf3mdkm7H8NAwJvNYHfmuJz4cOR5oiWFML/mnSTYvlKLlTtwsdcmjtxqlinowHMvTyEVZeXKiExUR0fHtAEooFFcROB/F84VPk47r4CIgUU4uytIoktKKL16Z4DUwW2EiS7mfgZGrJvcKz44y78axB6aoVyLl0EbSHp6s0T7rcfXsuiYORR3kOPOcKUeIGHvX7OCuUPNsFrFnMINgbaXZmE51k1nzAgqP3yySAaasXXcxJL3qrMVeVG+iJ8O0G1JqDMvggLVtMi1WyR7PwxSqL3pmF7+1RYvDOSbndEa0216KWFOX0lZrMs5ZijSfPEvln0UOlPmy71yvulpi2Vaz3blWJZ/vRTZuBIqpQ/1twa3gzOgwhvLyjr5S6HHyYgHdNZXtWs0lFwflFQen9QXRRWIHZ/91SD+OPIv1Lvdq8+ThH4cdDjZ1R2epMoonqN0Qho12HQuaUCPKAooD9dyURr2TX/orVotb4DrneZNOZSuqK+Q3iU7OZwodLX43iH7eVq/RlhIp+17w2U7zSQKgmuFpBStRtJx0fJc0k6K3R2GwK8Y1D9/g9u3fqRC1S2MVSZGQuKbeTVUuSwctS4hhsVmRZtp2xprfAqMpSAPxCI9fasfWaLVa7j2l5Kozuq5oZLAZ+53gp5W4UZf30DUmLhGjjHduTfYcHEP3P9faOg91fN2s4kmqMD7riMthEpNugwt5P8MpR0ey0al1d7s5jvO3hZfeDEZuPRctj8OoGrM41sY2ulre6Crdix8S5V5fZ5egxgFv/VZzynxudLKmPEwx6R6hnhn0gckso8bvO1OlLySppRaHrZE1cCfz0anRqg15VYKwHiPn/uW1qS6zDV8yzKpslN95b99wO5U6h4rhE0+3cg9hC3L2VPVj6IH1uHkrawR1fqu5PJ7oJkMazRoqJl+1JN4iMbMsziQLrau5JZf5xqDxZlP4S785bBWjNheqVwW5aA4bYZC1TpNfxjqicxzmjCEhs05s4Lm2vw5kszcwRY5kI/dzpP4h/EqNBXM0wZLKfhs3Tgl0PvpeaRJ0wiuqAlc4it+jvutm9IHrpLpslUfzSpeoiv5S0irwTyF1HbbxzjYlQ/Nx5m3YSJ+8CNk05pTNiw/7goK8gBmi8wISnk+4YmPbbTrV0qGkV9t7W4PtEVuOO4OiKTHuh6ibcduawl8wvnNdujE1YQusOM7voAH9t2+wjfbxapV1NuMkJ4E9r1a8U9pjXc5SK7PM4cqUlO3cwhdv0qLY2/+3EKEqWye5oIIjdHDsGG/nJdNd+pmrVUX5eX2w2rMn4Nlhu+OW0fe6DnPyopMxRTWWRMv5mtPm5Jsp2WZ04RU0wf636NPJqWU2dJv3LjJZu37mK2fuGAdvISbmz9swnwYyNMbrPFM8lXK5mDeVo9ON29bfHQ94cJMrej7wROt26MfQSKfhRvCgyQfxOj87yMHeLTNJ54/TcJlMm3dSFvKkf7P7P6J7kLLxowlvdVd51Zu07gOvMt8VNabmihJADDi71MDVEmpvxQkZvd3ZqguZRwq18hpB7xMtN3UzSmpF2lvbcb9/oEJjg5lIKJIMOYkcHcNYxRc86Uw9ZrOWLEkhXm+z27UNw+PZJmzEpFU+aFGa/qpgMuW1dtpx7MA9kECMwCmxIroktjmsv8IqlphDw6BKnpQ6oqUszTfPO8SXQ0nLPy6OFSS8RZ07lDlQwi+/SzKrvT5XPrdW0J7WwaxeISZU1KcPvbjQWd/mRzuim9/PMrZKzmDRXNE2McpSHOS4V85vucl0109H0mr03jVhJ0zWaaE8xeZvmmdFxDKjztRZ5+gVvmKypB3Mh0nOPmin1ETjsSXetCnzuuFBU1CNqkixGHHZBi7cDz8ZkAHM1o7ZSmrnTooL9QRWskT8asXCYYygIJXBgi4rJtRJI5c7/eFKJVCmoCjKLNIiQ3UeLpT8CuFc1TAKR5NaNo6COtMsFUaLdqFbOE5nzYsrKZJNmHSoORYpu1rpqYSlGbzsyon8520sN8B6y0La0gdpSjCr7hpRa1HXu6qm3n7l2LApScqmNI49Wzqv507O6p1qK3P055cwIYUk1tigmzOSZmGZrJLwm5gUd5EL7a7WZ5BpC1d8ygersysdxc4Q2njQPVjSps/2G+4xV9MzydmUrTkgTL/aYZNfdzM1sdUMufuqFvRje6Zv1WO9me89XU2yoeUa86jLzrJM7tFCD0LQQAq+2hSqCjLOchqIPZ7A806+8MQzg6aW1OGQrNhae+GY+jo6JofdiEIPpU1a9O0IyqgyrEPGuBKwKMvo+y0kG9eaMa4GtevMm6lIqcy6GhPbQDb35NopGUMoCatD8sZbzSu8husmIyrFinJCKEZarK61uuokvyUjMROoS9RzkC19asqhu4KW0YyvDH/SEEkaWYzTJjYNGhCMtHpUZjqcRswwtnSuxPK45c60cEh7rKmQHogUek7QIhFU57Z+NJxqNBLXG4YwY0zVqEe0ujQMjiUazMyWFTc5EqhPk9NlwI9UcdI1j4TNCpBRSZz02DJ9a42hbdqjazM4NwKzWvt4rTVMkoDTptQh4aoCOTkfBfIoh+ZyVrlu4WGnWDJ7knFKbx9BEFVG21gT1gubCui8PBXEd9lSOCxOPmft/Ce7kqhJUBzIbPux0YStqk3YGa/a81E4ZqXtnP+YYwm3++5s8csQjXtSSue0ZdNIKrzi9UYj2+ImYLe4NZfgQf+lObUydXtxYrgWjDY/ZV1jLBUG91k42m41veZOH9XC0MdbTxTGPZAUTHcYTVeFses+F2Q6WKdfnSvZL/H5CrbZYOYZo3EAhgfo/xj2+GiEgDMNVT2zTszJ0Obzh7OB+gsZEFp/Mbzm6PII0mh3nQbIlqRL4mU/rZBtrm4dPSm33V3n3pCZodDj+rzAto6pXB49/7HmeutB1F/FJGsHWIhHlRtgX/tuFj8TpXyyWcX9hVpSyREnKPCDElUy6cGMW7xr5k3fjmTUecoNWjj1rJ5G7yntrOOH9aHQI5zZMrms0kX6HWs/HdrqsqjnhN+p/nAjECOyee0lu7lFObbVHaDtSUtKeRdptGeJ4aWrUyjSHbU+t5c1ZC5lK5Mg1vRluyN1LHQUbBeYYGetjWGPQMb6EKC2xjKVbY5QRVENhgKIPBEWKHNV+5k9yvbASS1QfBQT2s7IN5jEuYly0hqDVWQFM8VIzHuZuA5oWJWvmNnKaPLoXYhaKBEXloZhcUtduH71PtI9xGGym1Lx5EYvBwLRLGiCiq64FSBb1aVq67JcFjn4rBYSTjI24pMfX4OZFIGlfLPDY9jWpz9eNEphBXrdvBBYxOfBD2mLDBwbGfWdSzZRgNnTXtAuYzXyVSRcwXFO/db0MUe6kjYr3KS7VLYQVe0QfwWUZA0dNKxZvbKIWWxSjPr4QUjRzClfIxoEAzVA4wlEVO4gZSnd9L1oVtBtQtTXdYRJEwxOTmesYUqVuAk91v3GbvRwi+OcB6stjSudfMEY+JpIwMgx0I5PmeH2xObJVdEunPAEpy7lCKIEPjNgyMGOGh+JRQNNqJfpm5lEJwG5YYJsbcDTmLky+EfMBclYeBLecwClI72oUJE8jAouOyodbKjyUHCUCxqVFZyDErMyvsufnWjok3JOrV9/GZE8elNO6oDmXn35YeumdbjuSfR+jfhQ6irq0HmNFE0PyuR7MOrPH6YxVkwaI0LSadKBXSunMZ3lHfuhqxyR6a1EqaWn6tQXAyKNhqKrau5OmsoBxs2jOaMag3TY0pMdCq0aTakRtwTW6Pl1f0q0hkALhU3SQDFJyyzaWr0Dny8GLYGbFaXJACMw0UAyqQlBasu0aDZQ2SybAoSgXiMYUvXhUHj0fCE7XQaviOWmrRb9pd4yGaeZWk+BSvvoxnx7M8+idpdge4jWgJokgqY2pHCt3VzBodLjDfO4l8McyiDJUPAYd2lO3GZrmyMq7HmrpUdL0PMUdyxDVfNxMFSRYGMY3ZNwVHebrOKpCntAn2bVvKXSFgPfG0aymYl33TxNafmUCwL6bq57kxchJVdX7BAyiS87UYinFkzJ0g1nY1ojZx3cTABfmJ8c5C0JL1xW3Hbwm0jinXABR6hBLZNrgpGFNO9jnof+ZXkdfmmoHgtAM0L5YrRlnzvDp0NFxatEbmPfOKlM0xibcnGRqq86Uaki1ZxQr84lcs44ppTJ5a1SDe7pIsnLZdny0cQQGXNx+Jmoa3nXvPSJSCiZVuDMiihVn/1vjD+8SjIb5dGHDMxEImqUA5oEWlRM6vmwJc/TUNWyVRonhTLdZWlGdtAnQ1tuWyVeD3tOikoMofv8FD324NSD/3T0hsZjzyLHgz8rq+qA62af+ezQnInWrrqWE+Xlsqt9SK2uBFMMjNPiebsiTds9vekrcCGzmMCcKGwTBrWhJRuFjO51BwoA"
script:"stage.0"
{widgets}
bug:{"type":"canvas","size":[94,91],"pos":[-94,29],"locked":1,"show":"none","border":0,"image":"%%IMG3AF4AWwZAgHBILBqPyKSyCGo6n8+ldEqtIqHYrNbK7Va14LDTSy4DxGi0eT1NgwLwuBwuZtuv2rl+L8/e/0JZfIOEWIBeUYFPfG5NeoaHRo1ni3ONgnGQkZeYAZximYmHn1ihpJ2eY6ONqaV0jqdQpk13AZSuhbKvs6e8dryEj7qOr7HErSC/xW+MlZjHxk6zyqnCl6G8vcvUzMtprdje2si2Zt3n17vqyLGmceaZ2aDr0NHocvB0fazF8eKf7uCQKUesHqtK1eyh6+blHTR5/NgZC+gJQLkqDs9BdLMRID2GGDN+HKcwIK13X/b5k8gxmCU04U7SsUKMCLh/uFwGC7MymcVUdqTtO6az6Etd1WZmWoPKk9Gng4SSs2luHtQADRrEycq1q9ZC4u7wfOq169ayXneKKmN1ENq3X7HCNdtsbRcwOue+PauX7lC7VPAS6quXL+E9fmjm2UO4seHCW4+qapNzTuPLj+HK4SqZlpTKmS/3lTs681+fSprCEc2a9Wq0fz8jDd26duvYS2bb3s2bs7fUCEn3Hu56Gh6ExJPf3nYEl/LnmH8zQQq9emnmRHRb3w7beHapwrmLj4tsOvjx6LN6vyU1fXpfis67H4+b/Wa/r+cPx61dvZ7D9+mHXyL98XFdgAKSR6B8/v03l1sJxgVFfN0IZ+CDFwp4GoUIZriXh/NtaN9jjGFYoobwBVeWZQfShl42HLooGosJnoYacpp9GKGJEg2BY3dykYbgjgOupSKQcZFHJJA9+shgWoMtuSJ8ThKlGYRS+kZljC6eJWOENppHVHhZAtgZahRaWWZ01tiV05psnokme2rCCVldk6VZoZ084jknnUPyqaU+iOVZZZ2CNgjMet8humN+UNoozYSSHPkoiW2qUSl4ZOp3X6ZuHFfhlzPOmAskYIg6aqDLdcokqHkmtimnJ7b6oU6pIsLpmFANelWhgHGxK62/Fjusoboa1FaxUeUUbLL2AFshKVtWpdBYOLX1LLQ3XjsttdgF5VmjPo3DEqWHShfJXdqOm9si6K4r1rd/qqqJvOIyCpys+OYbrmz39ssULNvaKzAg/CpW78HWIsvww0k4zHAQ","scale":1}
galena:{"type":"canvas","size":[243,239],"pos":[268,103],"locked":1,"show":"transparent","border":0,"image":"%%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","scale":1}
pippi:{"type":"canvas","size":[225,293],"pos":[0,49],"locked":1,"show":"transparent","border":0,"image":"%%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","scale":1}

{script:stage.0}
on lerp t a b do a+(b-a)*0|1&t end
on interval n f do each t in (range 1+n)/n f[t] sleep[] end end
on puppet target src do
 target.show:"transparent"
 s:puppets.widgets[src]
 target.size:s.size
 target.paste[s.copy[]]
 target.pos:target.pos[0],card.size[1]-target.size[1]
end

on command x do
 if x~"reset"
  bug.show:"none"
  galena.show:"none"
  pippi.show:"none"

 elseif x~"light"
  o.nsound:"clap"
  o.speed:2
  o.fcolor:colors.black
  o.bcolor:colors.white
  dd.style[o]
 
 elseif x~"dark"
  o.nsound:"click"
  o.speed:2
  o.fcolor:colors.white
  o.bcolor:colors.black
  dd.style[o]
 
 elseif x~"eggbug"
  dd.show[0]
  bug.show:"transparent"
  interval[120 on _ t do
   bug.pos:lerp[t card.size[0]+bug.size[0] (-bug.size[0])],(10+30*sin 15*t)
  end]
  sleep[30]
  bug.show:"none"
  dd.show[1]
  
 elseif x~"enter galena"
  puppet[galena "galena_neutral"]
  interval[30 on _ t do
   galena.pos:card.size-lerp[t 0 galena.size[0]],galena.size[1]
  end]
  
 elseif x~"enter pippi"
  dd.show[0]
  puppet[pippi "pippi_sphere"]
  interval[30 on _ t do
   pippi.pos:0,card.size[1]-lerp[t 0 pippi.size[1]]
  end]
  dd.show[1]
  
 elseif x~"galena shock"
  puppet[galena "galena_alert"]

 elseif x~"galena squint"
  puppet[galena "galena_squint"]
  
 elseif x~"pippi squint"
  puppet[pippi "pippi_squint"]
  puppet[galena "galena_up"]
  
 elseif x~"both up"
  puppet[pippi "pippi_up"]
  puppet[galena "galena_up"]
  
 elseif x~"both shock"
  puppet[galena "galena_up"]
  puppet[pippi  "pippi_alert"]
 end
end
{end}

{card:puppets}
script:"puppets.0"
{widgets}
pippi_sphere:{"type":"canvas","size":[248,162],"pos":[15,30],"locked":1,"border":1,"image":"%%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","scale":1}
pippi_squint:{"type":"canvas","size":[248,162],"pos":[41,76],"locked":1,"image":"%%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","scale":1}
pippi_alert:{"type":"canvas","size":[225,293],"pos":[35,97],"locked":1,"image":"%%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","scale":1}
pippi_up:{"type":"canvas","size":[248,162],"pos":[25,54],"locked":1,"image":"%%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","scale":1}
galena_alert:{"type":"canvas","size":[249,239],"pos":[279,109],"locked":1,"image":"%%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","scale":1}
galena_up:{"type":"canvas","size":[243,239],"pos":[271,133],"locked":1,"image":"%%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","scale":1}
galena_squint:{"type":"canvas","size":[244,239],"pos":[307,170],"locked":1,"image":"%%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","scale":1}
galena_neutral:{"type":"canvas","size":[244,239],"pos":[310,47],"locked":1,"border":1,"image":"%%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","scale":1}

{script:puppets.0}
on click do
 me.index:999
end
{end}

{card:card2}
image:"%%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"

{module:dd}
description:"Display sequential, styled modal dialogs for visual novels."
version:1.7
{script}
# state/constants:
local host:0
local canvas:0
local padding:10
local margin:20
local arrow:image["%%IMG0AAsABv/gf8A/gB8ADgAEAA=="]
local arrow_anim:arrow,image[arrow.size]

# config:
local tfont:"body"
local bfont:"body"
local align:"left"
local balign:"center"
local fcolor:32
local bcolor:1
local next:arrow_anim
local nextd:10
local speed:0
local names:() dict ()
local border:0
local bborder:0
local pad:()
local bpad:()
local osound:"" # open box
local nsound:"" # advance to next box
local asound:"" # make a choice
local tsound:"" # talk
local dsize:()
local dpos:0

on ifmt x do x format names end
on fmt x do update text:ifmt @ text from rtext.cat[x] end
on tween a b t do a+(b-a)*0|1&t end
on rin x pos size do min(x>pos),(x<pos+size) end
on tick do host.card.event["animate"] sleep[] end

on sfx x do
 play[if "list"~typeof x random[x] else x end]
end

on draw_border do
 canvas.clear[]
 if border.type~"image"
  canvas.segment[border 0,0,canvas.size (range pad)]
 else
  canvas.pattern:bcolor
  canvas.rect[0,0 canvas.size]
  canvas.pattern:fcolor
  canvas.box[0,0 canvas.size]
 end
end

on repos pos size do
 if dpos~"center"
  .5*host.card.size-size
 elseif dpos in host.card.widgets
  t:host.card.widgets[dpos]
  t.pos+.5*t.size-size
 else pos
 end
end

on resize height do
 cs0:canvas.size
 cs1:((host.card.size[0]-2*margin) unless dsize[0]),height
 cp0:canvas.pos
 cp1:repos[(.5*host.card.size[0]-cs1[0]),host.card.size[1]-cs1[1]+margin cs1]
 each t in .2*range 6
  canvas.size:tween[cs0 cs1 t]
  canvas.pos :tween[cp0 cp1 t]
  draw_border[]
  tick[]
 end
end

module.open:on open deck etc do
 if canvas & canvas.show~"transparent" close[] end
 host:deck
 canvas:host.card.widgets.dd_overlay
 if !canvas canvas:host.card.add["canvas" "dd_overlay"] end
 style[etc]
 canvas.size:((host.card.size[0]-2*margin) unless dsize[0]),0
 canvas.pos:repos[(.5*host.card.size[0]-canvas.size[0]),host.card.size[1]-margin canvas.size]
 canvas.show:"transparent"
 canvas.border:0
 sfx[osound]
end

module.style:on style etc do
 fcolor:if "fcolor" in etc etc.fcolor else 32         end
 bcolor:if "bcolor" in etc etc.bcolor else 1          end
 tfont :if "tfont"  in etc etc.tfont  else "body"     end
 bfont :if "bfont"  in etc etc.bfont  else "body"     end
 align :if "align"  in etc etc.align  else "left"     end
 balign:if "balign" in etc etc.balign else "center"   end
 names :if "names"  in etc etc.names  else ()dict()   end
 next  :if "next"   in etc etc.next   else arrow_anim end
 nextd :if "nextd"  in etc etc.nextd  else 10         end
 speed :if "speed"  in etc etc.speed  else 0          end
 osound:if "osound" in etc etc.osound else ""         end
 nsound:if "nsound" in etc etc.nsound else ""         end
 asound:if "asound" in etc etc.asound else ""         end
 tsound:if "tsound" in etc etc.tsound else ""         end
 dsize: if "size"   in etc etc.size   else ()         end
 dpos:  if "pos"    in etc etc.pos    else 0          end
 if !dsize[0] dsize[0]:nil end
 if !dsize[1] dsize[1]:nil end
 border:etc.border.image.copy[]
 pad:"ltrb" dict 4 take padding unless etc.border.margin
 bborder:etc.bborder.image.copy[]
 bpad:"ltrb" dict 4 take (2,10,2,10) unless etc.bborder.margin
 if balign~"left"  balign:"center_left"  end
 if balign~"right" balign:"center_right" end
 if "image"~typeof next next:next,image[next.size] end
 if (()~next)|(!"list"~typeof next) next:arrow_anim end
 if 1~count next next:next,image[next.size] end
 nextd:1|nextd
end

module.getstyle:on getstyle do
 raze insert k v with
  "fcolor"  fcolor
  "bcolor"  bcolor
  "tfont"   tfont
  "bfont"   bfont
  "align"   align
  "balign"  (("center_left","center_right","center") dict ("left","right","center"))[balign]
  "names"   names
  "next"    next
  "nextd"   nextd
  "speed"   speed
  "osound"  osound
  "nsound"  nsound
  "asound"  asound
  "tsound"  tsound
  "size"    dsize
  "pos"     dpos
  "border"  (("image","margin")dict((list  border),(list range  pad)))
  "bborder" (("image","margin")dict((list bborder),(list range bpad)))
 end
end

module.show:on show x do
 canvas.toggle["transparent" x]
end

module.close:on close do
 if canvas & canvas.show~"transparent" resize[0] end
 host.card.remove[canvas]
 host:canvas:0
end

module.say:on say text do
 text:fmt @ rtext.split["\\n\\n" text]
 canvas.font:tfont
 each seg i in text
  t:rtext.string[seg]
  if t[0]~"!"
   host.card.event["command" (1 drop t)]
  else
   dim:canvas.textsize[seg (canvas.size[0] unless dsize[0])-(pad.l+pad.r)]
   szh:dim[1]+(pad.t+pad.b)+next.size[1]
   if dsize[0] dim[0]:dsize[0]-pad.l+pad.r end
   resize[szh unless dsize[1]]
   canvas.pattern:fcolor
   if speed
    host.modules.pt.value.talk[1]
    splits: extract index,1+count t where value in (" ","\\n") from "" split t
    si:0 db:0 while si<count splits
     sfx[tsound]
     each in range speed
      if pointer.down si:-1+count splits db:1 end
      tick[]
     end
     draw_border[]
     canvas.pattern:fcolor
     canvas.text[rtext.span[seg 0,splits[si]] pad.l,pad.t,dim ("top_%s" format align)]
     si:si+1
    end
    host.modules.pt.value.talk[0]
    if db
     while pointer.held|pointer.down tick[] end
    end
   else
    canvas.text[seg pad.l,pad.t,dim ("top_%s" format align)]
   end
   ns:next..copy[].map[(0,1) dict bcolor,fcolor]
   on wait do
    a:ns[(count ns)%floor sys.frame/nextd]
    canvas.paste[a canvas.size-(pad.r,pad.b)+a.size]
    tick[]
   end
   while !pointer.held|pointer.down wait[] end
   sfx[nsound]
   while  pointer.held|pointer.up   wait[] end
  end
 end
end

module.ask:on ask text choices do
 seg:fmt[text]
 canvas.font:tfont
 dim:canvas.textsize[seg (canvas.size[0] unless dsize[0])-(pad.l+pad.r)]
 if 1>count choices choices:list "error: empty choice list for dd.ask!" end
 segs:fmt @ choices
 canvas.font:bfont
 dims:each choice in segs
  canvas.textsize[choice (canvas.size[0] unless dsize[0])-(bpad.t+bpad.b)+(pad.t+pad.b)][1]+(bpad.t+bpad.b)
 end
 szh:dim[1]+(pad.t+pad.b)+(sum dims)+(padding*count dims)
 if dsize[0] dim[0]:dsize[0]-pad.l+pad.r end
 resize[szh unless dsize[1]]
 local r:-1 while -1~r
  draw_border[]
  canvas.font:tfont
  canvas.pattern:fcolor
  canvas.text[seg (pad.l,pad.t),dim ("top_%s" format align)]
  c:dim[1]+pad.t+padding
  ow:canvas.size[0]-(pad.l+pad.r)
  each choice i in segs
   local rpos:pad.l,c
   local rsize:ow,dims[i]
   local tpos:rpos+bpad.l,bpad.t
   local tsize:rsize-((bpad.l+bpad.r),(bpad.t+bpad.b))
   # active background (invert label)
   canvas.pattern:fcolor
   if (pointer.held|pointer.down|pointer.up)&rin[pointer.pos-canvas.pos rpos rsize]
    if bborder.type~"image"
     canvas.rect[rpos rsize]
    else
     canvas.rect[rpos+2 rsize-4]
    end
    if pointer.up r:i sfx[asound] end
    canvas.pattern:bcolor
   end
   # label
   canvas.font:bfont
   canvas.text[choice tpos,tsize balign]
   # border
   if bborder.type~"image"
    canvas.segment[bborder rpos,rsize (range bpad)]
   else
    canvas.pattern:fcolor
    canvas.box[rpos rsize]
   end
   c:c+padding+dims[i]
  end
  tick[]
 end
 r
end

module.chat:on chat text choices do
 r:0
 st:getstyle[]
 while count choices
  k:keys choices
  style[st]
  v:ask[text k]
  vv:choices[k[v]]
  if "number"~typeof vv
   choices:()
   r:vv
  else
   choices:k[v] drop choices
   say[vv]
  end
 end
 r
end
{end}

{contraption:paper}
size:[266,42]
resizable:1
margin:[10,10,15,20]
description:"a resizable scrap of ragged paper."
image:"%%IMG3AQoAKgbAgHBILBqPyKRyyWw6n9CodEqtWpmAAGjL7Xq/4LB4TC6bz+i0es1uu9/jQBZOr9vv+Lx+35Zr+YCBgoOEhWlCc4aKi4yNjmVyiY+TlJWWdIiSl5ucnZyZf56io6SDmZqlqaqrbJGorLCxslugs7a3q5GhuLy9lrq+wcKMtcPGx3yuu8jMza3KztHSZ6fL09fYrq/Y3M7a1t3hxtrb4ua8pwDl5+yy6evt8apD6urg8vip9Pb5/bD79/wJ/ARsoEFRxQ4qvARtocNJ3x5KJBZxokVC++Bd3FinGsePewCCHIknIcmTbugFDCckW0tfBbm95FLE0UxBSFISociPzBExOzGu7GKEpq6bOIsaHZokTLUmTpfEQaqzJxioRHOCqNlxiE+AROrZ84qJK62wWZR8ceLlXT22Z99p3aoWaECVWYuIfYtELJSlSq+OvZeRL7nBPw8t2YvY8MzCe/synhz5CGW/SRxTyZrIyGXMkDFXltIWtOTPlOtOPYwW9ejQqVu7vgz7c23NetMulj27t+vbmV/z9k0bCnHft48rX858tue0zaMfzy29OZbq2LNr3/45CA=="

{contraption:rbutton}
size:[31,28]
resizable:1
margin:[7,7,8,8]
description:"a resizable rounded button."
image:"%%IMG3AB8AHAZAkFAYKBqPSORwSQwwn9Dm0wkCWK/YbJa4dGq/4CuIOq6Gz9ix04tuW8tsN1odl4fpZvvdmNd/8X57RX2BaXyFf4eIW4qLYo2OAICRb5COk5SYkZqXlotqZZl8dYigXIR2TWR8Ua2qZK9JsrNRs7ZHTEE="

{contraption:bracket}
size:[35,9]
resizable:1
margin:[10,3,3,3]
description:"a resizable bracket-shaped outline."
image:"%%IMG3ACMACQZAkHBILBqPyIBSiWw6h8wiYEqtWq9UaMCI7Xq1XK+4CpaOz2XiGS1cRp/wuBweBA=="

`,Su=`{deck}
version:1
card:0
size:[512,342]
script:"0"
name:"color.deck"

{script:0}
on reset_pal do
 deck.remove[patterns]
end
{end}

{card:Index}
image:"%%IMG3AgABVgZAhnBILBqPyKRyyWw6n02EdEqtWq/YrHbL7Xq/15B4TC6bz+i0es1uu92iuHxOr9vv+Lx+z+/7+VCBgoOEhYZCYImKi4yNXm+QkZKTlGx/l5iZmpuccYefoKGiS46lpqeoVJWrrK2uIZ2xsrO0eqO3uLmDqby9vlivwcLDZrXGx8iZusvMzUW/0NGmxNTVlcnY2dp0zt3et9Lh4o/W5eZq2+nqxt/t7obj8fJT5/X26/j5nO/8/U7zAMPZG2hNn8GDffwpXGgkoENfBCMKQ0ixYh2GGDE+3DhNosdrFkNazEhSIceTiz6qjCSyJcWSMPuhnNllpc01LnMejMnTHc2fwG4KLaOzaL6eSL0BXUpvqFOjUNUlneqMKVCnQqNq3Ua16zKrNLHa3EoWm9ezucCeFPuxrFtkaOOOUruRrcS3eGvJ3RuKbkC7A/MKnsW38CG/8wDXG8y4k+HHhBDHU2yusWVNkDMLkiyQMrXLoDFpHv2EczTPxEKr9kO6dRTTvVAHW00bkOvbSWDzku2qtu88uIMf0Y2KN6vfyO0IX/6MuCPjlJJL58a8OgPnjaBLms7dk3Xr2BVpf9O9/Pfv4b+Mh1O++3n06bmst9Te/Xv48YPOP1O//f3z+em3Hxn9+fcfgAGqMuAYBdZ34HsJNrVggw4+iGCCC8JCoYEWXhjfgBv21+F9Ae4XoogjkpjeeicWmOJ/K2rXoosvquicjDOiWKONsBmXY4M7Hkgcbz8CmVEASCap5JJMNunkk1BGKeWUVFZp5ZVYZqnlllx26eWXYIYpZpIuHTnmmWimqeaabLbp5ptwttmSmXHWaeedeOap5558TjknRn0GKuighBZq6J5/MrQkAIw26uijkEYq6aSUVmrppZhmqummnHbq6aeghirqqKSWKqqSiS60qKmsturqq7DGKuustNZaK6oi0Ymkrbz26uuvwAYr7LCZ4hqSrgEQq+yyzDbr7LPBGjsSoEpCa+212Gar7bXSVoTstuCGK+645H7a7UvUJlnuuuy26y63ZOaa7q7v1mvvvfi6ei5C3+br778ABwzpvjvNm6zACCescLkEG9TvwhBHLPGyDevz8MQYZ6wxrBXn00ADila78cgkl9xpx+qQQMLHLPuzqskwxywzoyhno/LNLOcMsjsvz+zzzxPXfMzNRK+ss87f9Az0q/Qu7TSwQs9S9NRHV70zM0orfPCwIj/tta1RczL12EZbXfUyWSOsLrFdf+02x/EmQ/bcZtd9tShpB5x3r2u/7XerYfsx9+Bl22023m0nvDffTf/t+Klxy0L45IZXfjchi5vaN82Ny8qksps/LvrJkW8y+emFW253IZmT+nLrpSYbOtSdj247poHTgfruqvd+eROwh/p5o8G7Xvuvs9+u/KS5i7D786n7XvkTxYM6PPHHw721sMkv772jYUMvvvTkA5+45513b27W6oOd/fffCy3+/OTX/zsR1UO+PQDtc+rko/2bVQDhd7uOze+A0bNf746QP+Gl733+exL4IEirARJwdARDoAYVyMG7NZB57KudBS0Vus1BSXiaGuEFHdctDbowgR2UHgM+OLD/TXB//KNgCiPVtyjxsEk1xCHNsHfCFS4PVy9MYgxjSMMb2pBzOFQh6bbmQwBK0IlBzKGUjKg8JSXxi0vsYBOJaMXtzU6KlfpcDx/IxidCMYtavCIXbefFL74wjBwcI/Hg+MYbaq6IWuRjIAV5RjbOkYB1tOMG8Wg/PYLQjIY0HiALCUkhdo2SZTwk/BKpyAMyspHnk6QfR6m//V3yeGsL5SBXSUZSarKLSerkIj8pPUfG8XqszOX6LNm05KXyfWuMYiRfCUskyRKBtCSfI6vYx1bq74dURCW92vdLYTYOjcT8GSeP+bxk1lKVxWJmLsGZQmlG05oHA2c1g1jJbBYzANyknzd7N8bzmVCEOryUPXvZtnv6cpolDKgQ3fm2bcbzdPOkJzlJaE5XNtOBgLwlLiV6TifKUaIEZWEsD9rNhFqung11pkN36UaKmvOiJk3cRDP6NINydHAe/ehCGWrNTNp0VOKEIgVRSsRUQnOgLAWaS19KtphWTo9TuulD9QXUTdkyqI8bKlGpZlS7LTOn/GMnVLcqLqlOlWhVtepM9RlRSuWTq2hl20a/CtOwmu2pkmpqWufa1bWytahutRpc6cpXf3n1rnnV61j7StiI/ZWtga3aXgvLWHYd9quJPdpiG0vZuhrzrnSLbM4mW9nOZuuxU9XsZgfr2dK6C7REFS3LOGva1lLMrpgtmmo/xlrX2jZasI0tzmZb29v6lleofelsG9Db3xoXfZfVrWx5S9rjOve1yVXublVb3OdaV5LwlC5YmYvN63r3VrlV7nCr+93yOjW8uh1vc83LXu1lV7sqU29320tfnKI3tvI9a333G7v7Yja/cuWvgLEL3+mKlrwD3m9wOQrgBDuYqdHVboMfTGECFxiGeUVwhcu74INOeMMgnuJ74fvhEJsYd/4FLHf1e2ITdzieJW6xjH96YQy7VcNxxbHeWDxjmo5YwisOMNPK6jcd/7FKz0pqu17MzRgLEMl/A+K4tsQsLDEsxYgNMnCvlGSe0s7IEOUS16gcLiYf08lD1hLoqKRWMJPUS18W87bMLEs0A65LY7YS91YKLzH5KkxzxjJktRwrQMeZy8jjM7TSxDgwaYvOnbQzdqu4xUaT2dLzxbSf3efozwo6tISGMJFTyuMwy3nLbj6vlJfKZvDmrdV9/rF0JV3KVf9U0aKGM6rXm2hb+7ik7g0gVpsFaUXS2npevnWmy1lWJbua13/2NYqBnWbSUrvKn05tqFl17UdCW8SZG3WwS61pcveUvNI2a7qhK2vxbru/uFb3ssO57jLW+86pnjZSuw3v5vI7z+1O77sn3d1567t6/z5yvn9tbnt/m9nrTXica3xscBu8gvdW9sUZ3vAnx5ve1c04Ox+O3IDjd+C13nihJe5wkkNc5dwW+cFhPnIeszzaEZ41ypH9cWz3PMc/t+/Cve1yi9K85TYPOs5N/t+dv/nouW54smM+dKDvVeY8RzjWl05xp3tq6wAn+c2zDvWUC/nlHZ/52cXdZqarmLpFN3raOb1vdCu93FSPexr/p2ZrFduOFUf73J8977F//e67hjnYD7/pRWdbuF6PYNXJiniNn53sg4/65dW+eYvjOdZdh/vGDY/bytc88/LWO75Vr1PWW77voL9w4DkPrsUTHfW37zzdaW57VesaW38HY+QFX2bTa9zjru83740veEQ/+vEMHj7Iy776i/fe99THvO45jvxLAx/6Hpa+2ov/1OsT3/GTNf/0Vzp1n7s9y6JHvfrxLvTkn97vzM999yHYfnaH/sCqN3+Jl3kCuHf5t3Lpd4CUt1D913b/p1lwVYCEN3ikh33Z93S4R1H7F2ANuGc5527xt31Wd4HKR4ESqH/4p4BIt4ELOHk0Jnvi14IkWH8u14Ha932LdYIoyHEZ2G8PGFkRqIMIWHchp4LjJn9CeHycJ4Il94OJFYRJWG2ZZoM3GGsBGIUruIRM6F5OGFhXh4XVN18VKHn2p3BxN4YWuHlsN3EwGIJ5V4ZvWHBoeH5WKHZUWIXrB4ci1oUZ5np3+EhSyGt/iIHPZ3zDpnlkaIT1x4c3lnxr+GuBaEGHiIiFmD/OVnLY9Ih0x4hhlYCaqIRhWFKwxoKVKHOXiImZeIq7xolVxVmqmHplyGi7tyuGFokoNYobyISviHEfKHBuqHn9N4h5+HmzeCZD2HjFuIW72IRtCIBlxybHSIzJOCZH+Hv0h4FgFnxKFIOeV4u2aGVLpybReGq9VnSTOISsaFRFSI25CGXlKI7jCI4eeIbCWErpGFMIhoyouIzT6I3xiIuHRoBgaIDvN2i/OIFZMo+KSIPsOICVtmaKp4cEeY8eZWTe5zRz6H4uOFL2oo13xI2hmJE9VkDgB2MgiYAjyVce6UKzl5IUtpKz5Iw96JLWBZPIdJI0yV826Uk4mZP1tZPydJA+2WJAOT49OZTsVZTQ05JIqWAl2WRH2ZTfpZQdJZRSuWFUyTtReZU1+ZRntpVc6VxZiTpMGZYc5pV1BpZm+VtjiVBquZa31ZaU85Zw6VpySThlWZfPdZdtZZV66ZS9eHJ++Zf0xZeZNZiEmZRoGWmqlQAbmZhzpCQncAIFFlkJcJmX+ZiQaUSSOZmeCYJGhZmimZkSuZlp1ZmemZqUCX/eNJquiZmaaZqIlCSqWZupCXmf9Jq6CZulKZtbhZq2GZyrmZZLtJvGyZsz6JssBZzC2ZzGpkDHGZ2iGZvKeUS02ZzYWZssKT3S2Z3T2ZvVmVHMmZ3kOZlBaTjemZ7fmZzhmU3jWZ7wOZxzaTXqWZ+jSZ3tiUHXGZ/8qZ2HyTL2GaD3CZ75SUzv2Z8IKp/x1QAC2qADyp4FekgHmqAUqjIOeqHIOZMRupz7SaEeqpoYiqH4uaFF1qEfeqIheqEjSqJuM6En2p8p6qAryqJe46IvGp8x2qAzSqMYaaI3mqA5KqA7yqNC5aM/CqNBap9DSqQ+Y6NHmp1JqqQEyqSbZKRPCp9RWp9LSqUx46RXKpxZqp5byqUm46Vfapthmp6HsqZs2qZu+qZueqYImqbeCad2eqd4mqd66iVyiqR0Gp17GqiCOqiE+qZ9yp9/2p2FuqiM2qiOuiaHiqiJOqmUGqMFcKmYmqmauqmc2qme+qmgGqqiOqoFgAKmeqqomqqquqqs2qqu+qqwGquy2qqRWqu2eqiVmqu6ap+k2qu++qvAGqyXOqvEWqzGeqzI6qq3uqzM+qK7+qzQupvCOq3UWq2/mqzYmq3auq0o0Kze+q1YGq3iGq3WWq7meq6Yyq3quq7suqrg+q7wCqLjOq+5iq72eq/B2q76uq/bGq/+Cq70GrCJiq8EW7Chyq8Im7DF+q8Mu6wC+7BZarASO7GZqrAWe7G02rAa26cQ27GWSrEga7AYO7Ik260be7JP6rEq66Ah27IEW7Iwa7EoO7POurI2q54um7P2GrM8i7A0+7NAerNCG506W7Tm2rNIq69Au7ThOrRO65pGG7XVmrRUu65Me7XN+bRai5lS27XCWrVg269YO7apubVa67Voe61hu7bJSrZua7ZOm7ZyS6psW7fH6rZjC7dCO7d8e7B2+7ezirdXq7c227eG66mAm7ixKrhLS7gqe7iQu6mKO7nKyrg067gdG7mam66U27mqarkzi7kPu7mk67mmi6qge7KiG7CkW7qn+7qpq7GrO6+t67qve7qxy7CzK661a7u3a7q566+7C62967u/67nBC6/Du6vFa7zH27nJC7DLW6nN67zPS7nR663TS6nVa73XO7nZy6zbO7Ddu7nfe7vhe6vjS6fl673nq7jpW6vrG6bt677vm7jxi6vzm6T1a7/3C7j5K6f7G6T967//+7cB/KUD/LEFrLkHjL4JfKQLHKINbMAPbLcR/KMTfKEVbMEXXLcZXLMbHKAd7MEfzLYh/KEjTMIlbL4nDLspHLQrnJ4tbMIvvLYxPKcz7J01bMM3HLY5LKk7TLQ97MI/jLtBXJ5DTMRF7MBHDMNJjJ1LbJxN7MNPDLZRLMVT/JpVbMVXXLVZDKZbPJpd7MVfTLVhjKZjzLVlbMRnDLxpXLZrnABtbMZvnLRx7JlzXMd2fMdIm8cnsMZ83Md+3LN5PMaDTMiFzLNxvMWJrMiLHLNpPMWPDMmRDLNhvMSVbMmXXLJZPMSbzMmdTLJRvMOhLMqjPLJJPMOnjMqpjLFBvMKt7MqvfLE5PMKzTMu1LLMpvMG5rMu7rLC9vMC/DMzBnLAhTMzF7MbHjLwRPMDLbMzN7LMJvL/RLM3TzK/VvL7XjM3ZvK8BzM3dzMzfDL3xO77j7M3lrLTpu73prM7r3K7tvLzvDM/xzK7hS8/1TM73jL3RO7z7bM/9bLXJu7sBLdADra4FvboHjdAJza3By9ANzc8PDb6xK7oT7dAVLbagi7kZrdEbra2p67gfDdIhna0drbclbdInja2Wq9IrTdEtDb+CC7cxzdIz3bZ4a7Y3jdM5jaw7fbY9LdM/jb9kK9RD7cRFjcRY+7RJ7dNLfbdNPbRPDdVRbaxTfbNVbdVXvbBMu7dbTdRdDcCNW7hhLdZjjcBAa9ZnrdRpDceX+7htjdZvjcFxnblzTdd1DcKhi9d57dZ77cyqC7F/zdWBTawoS9iFrdeHjcIbO7qLzdiNjcOyy7qRLdmTDcQNa9mXDdiZbc7/Sq+dbdifHbihPa6jTdqlLaunTa6pjdmrjcXxyruvDduxDcbKS7y1bdu3jcbvqtu77dm97c/f+qzBrdrDvbjFravHjdzJDavLTb3NzdvPjcfNWq/TTd3V/cfiy73Zrd3bbcgOO6nf7dzh/arj/aflbd7nXbnyq97rDd7tzcjvnabxzd7znbH6S7/3Ld/5Lcn7HaX9jd//zaoBTsAD7t8FjskCLOAJruAL7sln6uAPLtwRbtFXyr8VDuEXTsoZnqMbTuAd7q4py8AhHrkjDsEanKInLuIp/rkrjqEt7uIvnqoxzrIzzuE1rsoi3KA5TuM7jrooiuM/buFBTtMeSuRFjuJHDsUyzKtLruNNDssUKqBRDuRTfqpVDuVXbuRZbtR+SsNdLuVfbsth3p1jjuVlbqpnzsRpzuRrztTlGQQ="
script:"Index.0"
{widgets}
field1:{"type":"field","size":[115,15],"pos":[331,185],"locked":1,"border":0,"align":"right","value":"An interactive tutorial"}
forpedants:{"type":"canvas","size":[22,36],"pos":[337,95],"locked":1,"show":"none","border":0,"image":"%%IMG3ABYAJAKEj6nL7Q+jnCgEeqxtW+m7fJ44dhWZoKe5soaawYD8aik92y339Xro6z2CuJYQg0wql8DR8Jdz3UxHxrFqJYKevkmQgpVAmeQyswA=","scale":1}
button1:{"type":"button","size":[94,23],"pos":[401,306],"script":"Index.1","text":"Begin..."}
index:{"type":"field","size":[292,112],"pos":[9,223],"locked":1,"volatile":1,"script":"Index.2","scrollbar":1}
version:{"type":"field","size":[25,14],"pos":[7,22],"locked":1,"volatile":1,"border":0}

{script:Index.0}
on view do
 bullet:image["%%IMG0AAYADQAAAAB49Pz8/HgAAAA="]
 i:select c:key t:value..widgets.title.text where value..widgets.title from deck.cards
 index.value:raze each row in rows i
  rtext.make["" "" bullet],
  rtext.make["  "],
  rtext.make[("%s\\n" format row.t) "mono" row.c]
 end
 version.text:"v%0.1f" format deck.modules.col.version
 forpedants.toggle["solid" !random[5]]
end
{end}

{script:Index.1}
on click do
  go["Next" "SlideLeft" 15]
end
{end}

{script:Index.2}
on link val do
 go[val "BoxIn" 15]
end
{end}

{card:logicalcolor}
image:"%%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"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Logical Color"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"In Decker, you can make drawings which use a variety of 1-bit stippled patterns, like you see on the left.\\n\\nDecker considers these patterns \\"Logical Colors\\": every pixel of a crosshatched region knows that it is crosshatched, whether that pixel happens to appear to the user as black or white.\\n\\nRemembering this information about patterns allows the Flood tool to replace entire regions of a pattern, rather than only connected areas of black or white pixels."}

{script:logicalcolor.0}
on click do
 t.Prev:"SlideRight"
 t.Next:"SlideLeft"
 t.Index:"BoxOut"
 go[me.text t[me.text] 15]
end
{end}

{card:thepalette}
image:"%%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"
script:"thepalette.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"The Palette"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[223,238],"pos":[279,48],"locked":1,"border":0,"value":{"text":["Decker uses a palette of 48 patterns and colors, some of which have special properties which we will discuss in turn:\\n\\n- Pattern 0 is ","transparent.","\\n- Pattern 1 is solid black.\\n- Patterns 2-27 are repeating 1-bit textures.\\n- Patterns 28-31 are ","animated patterns",".\\n- Patterns 32-47 are ","solid colors",".\\n\\nThe appearance of most of these patterns can be manipulated with Lil scripts on the fly via the ","Patterns interface",".\\n\\nImage interfaces represent each pixel with a byte, which means it can technically be assigned a value between 0 and 255. Patterns above 47 cannot be drawn with manually and are reserved for future use."],"font":["","","","","","","","",""],"arg":["","transparency","","animatedpatterns","","solidcolors","","patternsinterface",""]}}

{script:thepalette.0}
on view do
 reset_pal[]
end
{end}

{card:flatteningpatterns}
image:"%%IMG3AgABVgQQyEmrvTjrzbv/YCiOZGmeaKqubOu+cCzPdG3feK7vfO//wKBwSCwaj8ikcslsOp/QqHRKrVqv2Kx2y+16v+CweEwum8/otHrNbrvf8Lh8Tq/b7/i8fs/v+/+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wADChxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt1eAv4ADCx5MuLDhw4gJm0jMuLHjx4DRBmhAubLly5gza97MufPlAIsBgB4tujTp06ZTo16tujXr15I9y55Nu3YD0CX+ut4Nuzfv371xm51su7jx2sJH+F4OvDlz2GeJH59OHXNyEbqfO9+u/fX1sdKri5/+HUR37ujPo44+vv3x8h+yp5+vHjh8sOHd6/d8v0P9//Q1x95+BHbWHwfyAahggLoNWOCD1oW24IQMxgbhhZUduEGCFVLYnYZc5YdhgSBm4GGHFTo44oMlYsDhiTC61mJWIq6o34wWxKijgMPZCCGOFbyI4o6rAWlVjT6OZ+QERA65nYpJurekBEI2CeOUUyEZJXVYWumkb1BuKV6XXlqJpVRaimlcl1+2qV2YapK3WJlumnZmVGnGiZyEddJ5J1R56jkbmX0WetqfTwUqKH98+lknnIvumZujOiLqlKKRbsYmpY/2mOl7cxoqaoOeflrcpqOKCqmpBobKqYeWNoUpq5ah+qqTq9KqGaG3ThgrU7Pqelujqe6Yq7CfuVqsm78uFayuti4b47HIZqhsrww2q9SztEaLLYDUVjvspNIya6G4nHlbLoXhVsvrukNqmxS3rKr77XztIvvuverJixS9ptoLL7ilorvrtQNne67BmQnM75MFM5wsuQ/3u7DEtRJbMXr5Crtvwv/5exTAnzoMMscRY0zZxxsvJ7JRJGdqcsu7dQwtwjQHd7HK45KQM74pq8zyyR/uLLTGRANdVsyRDv1zkUZjPHPSYAYtNc5UO/dyUUwvOvXTpdncLdZgHxq1xF9nzZrY9ZKtNm9bE9W1oGmDzXbAbpctWtxDza1n3W+TdnfJeQeuGt9C+R0n4D8PLnPhZSMelOJqMm64401DbvhokgNFuZiW04y515o/3flPn28Z+tvRQeb6667PCfvstBfW1+2456777rz37vvvwAcv/PDEF2/88cgnr/zyzDfv/PPQRy/99NRXb/312Gev/fbcd+/99+CHL/745Jdv/vnop6/++uy37/778Mcv//z012///fjnr//+/Pfv//8ADKAAB0jAAhrwgAhMoAIXyMAGOvCBEIygBCdIwQpa8IIYzKAGN8jBDnrwgyAMoQhHSMISmvCEKEyhClfIwha68IUwjKEMZ0jDGtrwhjjMoQ53yMMe+vCHQAyiEIdIxCIa8YhITKISl8jEJjrxiVCMohSnSMUqtiUC"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Flattening Patterns"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"Sometimes you might want to \\"flatten\\" a pattern into just plain black-and-white pixels (patterns 1 and 0, respectively), discarding the \\"Logical Color\\" of the individual pixels.\\n\\nIf you make a selection with the Select or Lasso tool, you can flatten any patterned pixels by using \\"Edit -> Invert\\" from the menu twice in succession.\\n\\nOne of the example swatches to the left has been \\"flattened\\". Try using the Flood tool on each swatch and observe the difference in behavior!\\n\\nWhen you're done, return to the \\"Interact\\" tool."}
field2:{"type":"field","size":[85,14],"pos":[37,113],"locked":1,"border":0,"align":"center","value":"Gray Pattern"}
field3:{"type":"field","size":[85,14],"pos":[132,113],"locked":1,"border":0,"align":"center","value":"\\"Flattened\\" Gray"}

{card:transparency}
image:"%%IMG3AgABVgZAgHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26XYDXsGPLnk27tu3buGlbyc27t+/fsDEHODS8SvFCxysnH7Q8SvNAzyNH/zO9SfU+1xtn37M9Sfc83xOHvzO+SPk65wunn7MeQPs47wPHf9N+vhv7fvGzqU9ceH/j/1mm3xr8GTLgXgemUSBy/hm4W4DKQShFgmhQiJeFZixYBwhOYGiXh2RoOAcIJFrXIIMA2kEih0yASJeLYogox4omXgZjGDLGQWOLJxKSIxw7LnFjXEN+8SMALBaR5BFLWhGkEkW+FWUXPz6JZIlMYnmFlUhM2ZaXW1Sp5ZVjErFik1NweQSYa7GZRY5nmqkmmWgaEWeWS9bpXo/MPWjnnXTiOacQZ5ZJqJZqupmWolfAeWehgho6RKF67jgno2dhmiIVz0FKZ52UIjHopCUOqmlZp07hKKWAksqimqMe2qoRqY5Vq3N+KsnqrGTK+qeecnraJZ+CrLormkFaGauskhJxa1jPPrFqoMqO+eSyzPJoo4S4/trrt64GGyyrkQpJLHS5iotkuOqyyyy5rvLq7LmAyAhrmdU2eay1pTa757YObupuu77qCuzAliZKL3XpFmywwZBimyyis0b7lcU1cuotnvEe28TEebaKcVcjmyuwww93nPDBDuerZclbwexdw+CmjPLAguJ86LwAo6ixzTYPOuq1/vIsILdQNDcnyElwGSrBM/fsI81LUwysy/lmHGHAP0PtrtD4Cqvzmgv7AacS+i6hrNodlo0dzV5gq6rbfBy5hdwT0s0d3F3Ii4XMWQFO9slgFM03ZILTerjZeuth99tS90k4upEXuzjkR3M9t+aUJW7e5XU3Dh7oe1dOeddTm14v6Y6LjsfjoavO8OSry8447bNn7vPmu3eOtLS/Ix681pLrnjrqxW/de7fLS+a50bwfr7z0eXM+2fNDwF668clX37x0w2v7vfDWJx2+dudDmf5iwLXvvvu7vS///La1Zv/9+Oev//789+///wAMoAAHSMACGvCACEygAhfIwAY68IEQjKAEJ0jBClrwghjMoAY3yMEOevCDIAyhCEdIwhKa8IQoTKEKV8jCFrrwhTCMoQxnSMMa2vCGOMyhDnfIwx768IdADKIQh0jEIhrxiEhMohKXyMQmOvGJUIyiFKdIxSpa8YpYzKIWt8jFLnrxi2AMoxjHSMYymvGMaEyjGtfIxja68Y1wjKMc50jHOtrxjnjMox73yMc++vGPgAykIAdJyEIa8pCITKQiF8nIRjrykZCMpCQnScnOBAE="
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Transparency"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"Decker usually displays cards with what appears to be a white background, but there are actually two  patterns which look this way:\\n\\nPattern 0 is \\"transparent\\".\\nPattern 32 is \\"opaque white\\".\\n\\nTry switching to any drawing tool from the \\"Tool\\" menu, and then enable \\"Transparency Mask\\" from the \\"View\\" menu. All the transparent pixels on the card background will be shown in a gray color, while opaque white remains white.\\n\\nWhen you're done, return to the \\"Interact\\" tool."}
field2:{"type":"field","size":[85,14],"pos":[37,113],"locked":1,"border":0,"align":"center","value":"Fully Transparent"}
field3:{"type":"field","size":[85,14],"pos":[132,113],"locked":1,"border":0,"align":"center","value":"Partially Opaque"}

{card:transparentcanvases}
image:"%%IMG3AgABVgQQyEmrvTjrzbv/YCiOZGmeaKqubOu+cCzPdG3feK7vfO//wKBwSCwaj8ikcslsOp/QqHRKrVqv2Kx2y+16v+CweEwum8/otHrNbrvf8Lh8Tq/b7/i8fs/v+/+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wADChxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2BjNhhLtqzZs2jTql3Ltq3bt27DJoFLt67du3jjyj2St6/fv4DJ7uUbuLDhw2gHG0HMuDFgxUUcS55MFzIRypgzJ7YsRLNnzZw7fx4tOXQQ0qgZmwaSunXh1T9cy/YL28fs23dr98DNG65uHr2Ds/29Q7jxzcRxHF8uOLly5sudP4duXPoN6set28BeXTsN7sK9fwffW/wM8uXNx0DPW/169rfdw4AfX74L+rPt38fvWn8L/v35twKArQk4IIGoGagCggkqiAKDpDn4IISfSXgChRVaWAKGnmm4IYeZeUgCiCGKKAKJmJl4IoqTqRgCiy26+AGMpcnoAY2O2XgjjqrpyAGPPfqoAZCICbkBkYcZOSSSrymJAZNNOmkBlIFJeQGVj1lZAZZ/abkll315SQGYYYopAZl5mXkmmrmpyWabZr5pl5oAyFkXnXZW5maeb+HJp15x/tmWn4KuRWihaR2K6FmKLlpWo46OBWmkkzpa6aKXIpppoZsK2umfn/IZap6j2lmqnKe+mSqbq6LZKpmvghkrl7NiWSuVt0KZK5O7Itkrkb8CGSyPw+JYLI3Hwpgsi8ui2CyJz4IYLYfTYlgthddCmC2D2yLYLYHfAhguf+PiR+e56Kar7rrstuvuu/DGK++89NZr77345qvvvvz26++/AAcs8MAEF2zwwQgnrPDCDDfs8MMQRyzxxBRXbPHFGGes8cYcd+zxxyCHLPLIJJds8skop6zyyiy37PLLMMcs88w012zzzTjnrPPOPPfs889ABy300EQXbfTRSCet9NJMN+3001BHLfXUVFdt9dVYZ6311lx37fXXYIct9thkl2322WinrfbaRkQA"
script:"transparentcanvases.0"
{widgets}
note:{"type":"field","size":[137,14],"pos":[61,83],"locked":1,"border":0,"align":"center","value":"Drag Lily (gently!)"}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Transparent Canvases"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"The distinction between transparency and opaque white is most important when manipulating canvases: a partially-transparent canvas can be positioned above a card background or other widgets.\\n\\nTry dragging Lily the Exposition Fairy around, and observe how her image contains both opaque white and transparent areas.\\n\\nYou can use \\"Transparency Mask\\" mode as shown on the previous card to help prepare semi-transparent graphics for canvases.\\n\\nAdding a black or white outline to semi-transparent images is often a useful technique for helping them remain clearly legible on a variety of 1-bit backgrounds."}
lily:{"type":"canvas","size":[91,106],"pos":[87,114],"locked":1,"script":"transparentcanvases.1","show":"transparent","border":0,"image":"%%IMG3AFsAagZAgHBILBqHINBxyWw6n9AoERQIKKXYrHZLrVqTya14PO56z2Gyes00n9FXtnxtdr/B8zzXCwa/q2l6gk51fX5/fYOKRYWGh39Wi5KNjn2QgZJ5lJWWiHGZbJucjnegcqKjhqWmaqipqnyfrFmur7CAs3uAtrZoubSxvK++v1G1wreyxUvHyJ2Ry03Nzkl80dLB1KnW10fT2nXdRt/g3OJC5OW45wDp1Xej5uLuXgz22cns6VX2/Qz4z5QVI1fPX79dpOQNBBgvgEF/DMN5E6hnn8ODBhEm/JLQ0CCLB6lA5LgRkkmKZEBCHGnFpEuXKMXQ4/fv4r2XOE9WjMgJEkucvdZp4tnzTMaTJYMplJZqCsOcNH/CUbUtFlM7nh5B9XmUZLyG8LxtHYvz4U2O8LwmXYWErFs4Rg/GujO10lS26Oqu1fhOL9AvCHeRvITEjSx34LBmS9tS8bo0hhlFhAmWL7xnfNAgfXclcluipOxqVlv50iXPeYWmBu2no1JhghHVg+lU9WrWru/yig036ul27ZYG3zysr+avgE/3fUi3L0WtlI0bv1ytKKDrj7q2Hg6tjeO6gZPPtYsZX9SbcZQ4h1J+MVrxlneLZlkypliac91n3bbbZs2WOmHRhVzDjFZZfxdtZd845/FVWnWWOPMWJsY0SFprj5Qn4XXEUVihfzUVGFhih0DHUSjnhQgbiRlitqCABZ3FIjLYbfRiYUHJ5eCMyUDoFVGSkXXWjjOaV6KJv3H3VnSJETnYLUApuSSAL+3F04+DKfhNh5xN5yQVonVkh3Xr4RiGc64QWVSXbFKl3Jn5dTemVbXgBiZ0sGRYZSHyBJQea2piKKJaHJLEnXrCgTkFQTsCmpNEh652WBd/2tleoH5ilaGknH4mJ3U89nJnVdBAKtGobaEZqnwX5mOqOQIhiumqorrap3C1qdkqrYIGpBBqjIzZE6/FmQipp7G+SZVou2ozVrKqeTkZoc2CZV2WuB5q7J6WgRoUqPrZlmuVSr2pF41aIkIIUI1ohC21RAGIpJcvChtni1CGCSF58PImrncBadsmn/3KJ6KiMllDCZPU7ksiHGVws/C5A8+Kbne6PJZZtZRmyiIxEQtFMKliFpnthxi3eyF1Fg+KccYpuwclXRy7fGMbIAc3sV/eUqNuK7BSClCzNTP7M9Aa80ZsaRvfjI3IcLb88Gb/agGspEt/h8exKeUs5ap7fsJ111Z5OqWW0L5Mds7fnR1MsJsOdRk60i6ZCINhCWJsexerLRmqmbSN19NVp+q3InV7TfjheVX3y95OR8oU46A4YvXVzLDDhaaaf+RJ554DDrrejY2OOJiUm54wYJGrzp7jriN+TRA=","draggable":1,"scale":1}
normal:{"type":"canvas","size":[91,106],"pos":[189,305],"locked":1,"show":"none","border":0,"image":"%%IMG3AFsAagZAgHBILBqHINBxyWw6n9AoERQIKKXYrHZLrVqTya14PO56z2Gyes00n9FXtnxtdr/B8zzXCwa/q2l6gk51fX5/fYOKRYWGh39Wi5KNjn2QgZJ5lJWWiHGZbJucjnegcqKjhqWmaqipqnyfrFmur7CAs3uAtrZoubSxvK++v1G1wreyxUvHyJ2Ry03Nzkl80dLB1KnW10fT2nXdRt/g3OJC5OW45wDp1Xej5uLuXgz22cns6VX2/Qz4z5QVI1fPX79dpOQNBBgvgEF/DMN5E6hnn8ODBhEm/JLQ0CCLB6lA5LgRkkmKZEBCHGnFpEuXKMXQ4/fv4r2XOE9WjMgJEkucvdZp4tnzTMaTJYMplJZqCsOcNH/CUbUtFlM7nh5B9XmUZLyG8LxtHYvz4U2O8LwmXYWErFs4Rg/GujO10lS26Oqu1fhOL9AvCHeRvITEjSx34LBmS9tS8bo0hhlFhAmWL7xnfNAgfXclcluipOxqVlv50iXPeYWmBu2no1JhghHVg+lU9WrWru/yig036ul27ZYG3zysr+avgE/3fUi3L0WtlI0bv1ytKKDrj7q2Hg6tjeO6gZPPtYsZX9SbcZQ4h1J+MVrxlneLZlkypliac91n3bbbZs2WOmHRhVzDjFZZfxdtZd845/FVWnWWOPMWJsY0SFprj5Qn4XXEUVihfzUVGFhih0DHUSjnhQgbiRlitqCABZ3FIjLYbfRiYUHJ5eCMyUDoFVGSkXXWjjOaV6KJv3H3VnSJETnYLUApuSSAL+3F04+DKfhNh5xN5yQVonVkh3Xr4RiGc64QWVSXbFKl3Jn5dTemVbXgBiZ0sGRYZSHyBJQea2piKKJaHJLEnXrCgTkFQTsCmpNEh652WBd/2tleoH5ilaGknH4mJ3U89nJnVdBAKtGobaEZqnwX5mOqOQIhiumqorrap3C1qdkqrYIGpBBqjIzZE6/FmQipp7G+SZVou2ozVrKqeTkZoc2CZV2WuB5q7J6WgRoUqPrZlmuVSr2pF41aIkIIUI1ohC21RAGIpJcvChtni1CGCSF58PImrncBadsmn/3KJ6KiMllDCZPU7ksiHGVws/C5A8+Kbne6PJZZtZRmyiIxEQtFMKliFpnthxi3eyF1Fg+KccYpuwclXRy7fGMbIAc3sV/eUqNuK7BSClCzNTP7M9Aa80ZsaRvfjI3IcLb88Gb/agGspEt/h8exKeUs5ap7fsJ111Z5OqWW0L5Mds7fnR1MsJsOdRk60i6ZCINhCWJsexerLRmqmbSN19NVp+q3InV7TfjheVX3y95OR8oU46A4YvXVzLDDhaaaf+RJ554DDrrejY2OOJiUm54wYJGrzp7jriN+TRA=","scale":1}
sick:{"type":"canvas","size":[91,106],"pos":[245,305],"locked":1,"show":"none","border":0,"image":"%%IMG3AFsAagZAgHBILBqHINBxyWw6n9AoERQIKKXYrHZLrVqTya14PO56z2Gyes00n9FXtnxtdr/B8zzXCwa/q2l6gk51fX5/fYOKRYWGh39Wi5KNjn2QgZJ5lJWWiHGZbJucjnegcqKjhqWmaqipqnyfrFmur7CAs3uAtrZoubSxvK++v1G1wreyxUvHyJ2Ry03Nzkl80dLB1KnW10fT2nXdRt/g3OJC5OW45wDp1Xej5uLuXgz22cns6VX2/Qz4z5QVI1fPX79dpOQNBBgvgEF/DMN5E6hnn8ODBhEm/JLQ0CCLB6lA5LgRkkmKZEBCHGnFpEuXKMXQ4/fv4r2XOE9WjMgJEkucvdZp4tnzTMaTJYMplJZqCsOcNH/CUbUtFlM7nh5B9XmUZLyG8LxtHYvz4U2vVKvqdEq2bSyjB99S1VhSKzQkUyshfYYPKFY0JC8hcSPLHbi/GuEBXpuGMKOIMJFxhDesGuJOVxzjJUoqKF3Pllt6IoZOoR1hgfl+7kXlnWiHMNne3ZwXdWRegAJ/KVgzrBKJj/cOq43WUmvC2XjH5bNbKCPXL/lano62uPRnXf38Xvo8J2bq08MbPz78aJzfwK9ePsS+y7vxSYtH7V0XGM23ySevPjyf+VopXcQl2X7Q4XYfVDGJZVNNasEhH3PDkYWJMf1Zt80tiYGFGFq6mGebV5SJ9x1WeNAxH4OHkfchhgnatyBnF9qm4iMtTmHgchbiFqF2MxIV3FhnEZhiX+1BF1lpbvk1pHWpqRbbhmNB+Vl0PcHiZGQwrmelkfu1pFd1zUG2izweuWbml86MqVuVlyRSiDmnWVVLliqG6J6ZVOI3W0DnwSikiEVN+Zqb1qSH1ydngraRZ9HByY2h79GWY6B2asgljUhCkx5wp6WojZc7ZtrnOuQdapinrU1qZjuOCiXQdn+iKtmirDpn6Di1wScra4uaRlp3ufK4K6+XLnVrrZUKm8ywUv5KG6IbFtWROkzmx52odr3WJl1ZfUhcYs7K1ihCwgVrIIIkEuKXUk0WiGGOomUb5rU/qhkmjXVNO6NxYOrpHCH5UMKtmvlWtuNsLsKqW5uAjikrHGU8am2XIKo6IMIuauqfgcuiGm7Cz94ZqL6efozFpuxSuqbHJgP4q8AVXxIroxhnjOig2b5rcYP/6nLXewBNuvOXgplIqp7MRnhHzz6fF8ap1NzGtBaayZb0lQghWyMUVWc687kMWz0HYTcn2VaJP27NNSLimn3bc5gORRk6XJqdCK5hCZKzkxfX7FSpmTRLb70Jpqo2Hc2q3TWulv2y9+FaA+y3KY5QvTgz7HCRbuZ6e8L5R6BC/rnLrY2uSGiim/7EnZOrXkbjrp9+TRA=","scale":1}
mad:{"type":"canvas","size":[91,106],"pos":[325,305],"locked":1,"show":"none","border":0,"image":"%%IMG3AFsAagZAgHBILBqHINBxyWw6n9AoERQIKKXYrHZLrVqTya14PO56z2Gyes00n9FXtnxtdr/B8zzXCwa/q2l6gk51fX5/fYOKRYWGh39Wi5KNjn2QgZJ5lJWWiHGZbJucjnegcqKjhqWmaqipqnyfrFmur7CAs3uAtrZoubSxvK++v1G1wreyxUvHyJ2Ry03Nzkl80dLB1KnW10fT2nXdRt/g3OJC5OW45wDp1Xej5uLuXgz22cns6VX2/Qz4z5QVI1fPX79dpOQNBBgvgEF/DMN5E6hnn8ODBhEm/JLQ0CCLB6lA5LgRkkmKZEBCHGnFpEuXKMXQ4/fv4r2XOE9WjMgJEkucvdZp4tnzTMaTJYMplJZqCsOcNH/CUbUtFlM7nh5B9XmUZLyG8LxtHYvz4U2v1F7Kwkp27LuoNTV2BMtxFZKplZA+wwc07y6Sl5C4WUsUnN9LSVuyXZdmMKOIMJHVxftFrd4uVxzfLUzVcF6sgxETQ6fQjjC0w6odroyoHkynQjfj9UyKSsO3sQrGhdOu3VLfl4tu/cw6q5mHd4pT1BoZN1Q/q1sqftsVOnBobRZTnuxcdW3tsI7GUfI2pmDn2RD+nY36O2CbcUuaH1cwd3rEkr1PZgkemE25SWGGGoC2FUjdbmr5N9Jp8HRG4C1uzUcffA96V95nllQlHX54aNGFeBrW9R2DzHEUClw1YdiZisPINdqJcD1lm1fttWhgQFgweBBRionIoI80VkgYWWcJmeGPK2r0XGZtLenZg4BBmKB2buWU2GxHHrJXX5wt5leJ7U0Hy1wNJiMROolcCFmNX2KmJXHGkWcfdqZZVUuXN5bpZh1qFSJPQONxZuSNdHWUzXVyxnbXJxcGNeCgz5kj0ZloCjVYWhxqWOIjTDL2p6R60saLmGB1Sic3Bi7qjqgzjorLmbB6gyirrKJlDaWUisUTm7RmGVBpL05hWk+9jrrlhsrkSlqcvgLaq1u6YtcOeG12YtiaSgYL23to9OliqC3qed9vywKlFIdY/mglaIRwqV6UWgX41bvwIALFsHNyKt9chGZoKxx2PbFRou+ZCWC6I5YqrX+RUNJcv3/VapVMqI4LZZDFkmsMMXzy+o6ZomrLcKDraTqmxIp6+Om7wmWLcsoMS+twkJcM6ijMOb44Y7bsgeuMva1IKuDBqV2rEx0Vr+fxszUvTLGlYayqTXM4x5wsnlPrhegpwQ77clbbSrjxxOU2SVaHj1WtcsBUmj0VIzgO1SCabUeIiWxka4KelEvjZl6rd38E7b0iO2XbLOgBTbjGvqn2y6aBt6v2tE4j7hEtmhHCDhfsbi4IaGJ7Dkyqogt+eOkftYr65xGv/rnjrisSuiBBAA==","scale":1}
shaken:{"type":"button","size":[60,20],"pos":[102,54],"show":"none","style":"check","value":0}

{script:transparentcanvases.0}
on view do
 shaken.value:0
 lily.paste[normal.copy[]]
 note.text:"Drag Lily (gently!)"
end
{end}

{script:transparentcanvases.1}
on drag pos do
 if 20<mag pointer.pos-pointer.prev
  lily.paste[sick.copy[]]
  shaken.value:1
  note.text:"Drag Lily (I said GENTLY!)"
 end
end

on release pos do
 lily.paste[(if shaken.value mad else normal end).copy[]]
end
{end}

{card:animatedpatterns}
image:"%%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"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Animated Patterns"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"Patterns 28, 29, 30, and 31 are \\"animated patterns\\" which cycle through up to 256 other pattern indices at 15 frames per second.\\n\\nThese patterns can be found at the bottom of the palette toolbar. (Enable the toolbars with \\"Decker -> Toolbars\\" from the menu.)\\n\\nThis animation will take place entirely automatically, with no scripting required. Used sparingly, animated patterns are a very effective way to draw attention to elements of a card and bring images to life; large regions can be somewhat visually overwhelming.\\n\\n\\"View -> Show Animation\\" in the menu can be used to temporarily pause animated patterns."}
field2:{"type":"field","size":[160,20],"pos":[49,134],"locked":1,"border":0,"style":"code","value":"13   9    5   1    5   9"}

{card:solidcolors}
image:"%%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"
script:"thepalette.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Solid Colors"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[216,238],"pos":[286,48],"locked":1,"border":0,"value":"Patterns 32 to 47 form a palette of 16 solid colors.\\n\\nYou can draw with these colors manually by choosing any drawing tool and then selecting \\"Style -> Color\\" from the menu. This will replace the usual 1-bit textures in the toolbar and Stroke/Fill dialog boxes with the palette you see on the left.\\n\\nNote that patterns 32 and 47 are the colors Decker itself uses for drawing \\"white\\" and \\"black\\" areas of its user interface. As we will see shortly, it is possible to customize Decker's palette on the fly, but at any given time only 16 distinct colors may be shown on the screen.\\n\\nOccasionally, such as in custom brushes and rich text, pattern 1will be used to represent a changeable foreground color, rather than black. In these instances, pattern 47 is a way to force pixels to remain \\"black.\\""}

{card:uicolors}
image:"%%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"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Colors in Decker's User Interface"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[216,238],"pos":[286,48],"locked":1,"border":0,"value":"Some colors and patterns are used by Decker itself to draw widgets, in dialog boxes, or in editing tools. Repurposing these palette entries is permitted, but might have surprising consequences while editing:\\n\\n- Patterns 12 and 9 are used for scrollbar backgrounds, neutral and when clicked.\\n\\n- Pattern 13 is used for \\"disabled\\" text in menu items and locked or inactive widgets.\\n\\n- Patterns 18 and 19 are used to draw dotted lines in some dialog boxes and menus.\\n\\n- Color 44 is used for drawing the grid overlay.\\n\\n- Color 45 is used as the background color when in transparency mask mode.\\n\\n- Color 46 is used as the background color in the prototype editor."}
slider1:{"type":"slider","size":[100,25],"pos":[34,94]}
button4:{"type":"button","size":[69,24],"pos":[178,95],"locked":1,"text":"Locked"}
field2:{"type":"field","size":[69,24],"pos":[49,65],"locked":1,"border":0,"align":"center","value":"scrollbar backgrounds"}
field3:{"type":"field","size":[82,24],"pos":[171,65],"locked":1,"border":0,"align":"center","value":"\\"disabled\\" text and outlines"}
field4:{"type":"field","size":[69,16],"pos":[54,196],"locked":1,"border":0,"align":"center","value":"dotted lines"}
field5:{"type":"field","size":[69,23],"pos":[166,192],"locked":1,"border":0,"align":"center","value":"background colors"}

{card:widcolors}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Colors in Widgets"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[216,238],"pos":[286,48],"locked":1,"border":0,"value":"All widgets have a .pattern attribute, just as they all have a .font attribute.\\n\\nCanvas widgets can store colored images and draw with any color or pattern by modifying their .pattern attribute.\\n\\nButtons and compact Sliders have a .pattern attribute which controls their background color.\\n\\nFields have a .pattern attribute which controls the main color used for text, or the background of an inverted field.\\n\\nRich text (both in fields and elsewhere) can contain colored spans, as well as colored inline images.\\n\\nGrids can customize the foreground and background color of individual rows by including columns named _fg or _bg, respectively, containing pattern indices."}
field2:{"type":"field","size":[85,36],"pos":[43,194],"pattern":39,"value":{"text":["A ","rich-text"," field containing ","colored"," spans."],"font":["","","","",""],"arg":["","","","",""],"pat":[1,34,1,40,1]}}
grid1:{"type":"grid","size":[100,105],"pos":[158,162],"value":{"name":["white","yellow","orange","red","magenta","purple","blue","cyan","green","darkgreen","brown","tan","lightgray","mediumgray","darkgray","black"],"_bg":[32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47]}}
button4:{"type":"button","size":[73,41],"pos":[49,87],"pattern":39,"text":"Colored Button"}
slider1:{"type":"slider","size":[100,25],"pos":[158,94],"pattern":44,"interval":[0,100],"value":4,"style":"compact"}

{card:patternsinterface}
image:"%%IMG3AgABVgUgII5kaZ5oqq5s675wLM90bd94ru987//AoHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnWpCg1UNVM9d3ZpV3NavV7t6A0tWLDeyZc1mQ5tWrTW2YN1eg/tV7lu6Ye1Ww2tV716+fqkBDjwNL2HBdA8Xhqt4MdvG0h5Dnky5suXLmDNr3sy5s+fPoEMjTSz6F1+spXed7psa12rWrW29hs0jb2xJs1HXtn0bUu7ddXs/yq0bh2ThjIjnMIx8kfIbp5vXabvieY3X0uMwrm5dRvfsapinIF78Bfny4NEMPnEePffz6cOvrwrfRXuu8c9ER9He/n3e+Y2xH3v9vfdfgPrNV8J/7onAIIAIhjEgfQwu+CBtEQpIGn8XdohfhmZsp4KHHYIoX1wskPigiW40yKGK97HoB4wxytgHjeTZCAiOv+k4I4+z+XgjkD0KiQeRORppB5JJKkkHk006CQeUUUrZBpX1WckGlllqqQWKFHJZpZdUbAiAmAeSWQWaUKopBZtYuvkEnHHKyQSdddqJBJ5i6nkEn1z6aQSgeQoaBKGBGnooolQquiijTDoKBKRtSuoDpZVaugOmkWoKHKc4etoDqKGK+impHpp6Kaptfafqcqxi6OBqrz4K6oji1Toppy0cp+sQlJoH5q9EdHlmicRuMeaxFSarbJFhFuhsFtASKO20WATZq7HYromdf652O8W34FYr7ri0CmvuuW9OuO267EbhroHkxkstdeXWa++U4e67xrXvuuhvu9yOh+/A6C77IloIlwkwriI27ESaAfsq8RI15svwxXdmXLHFHA/qcYoKhlzEyCTnarLIChtc8spCPEwvyDDH3DLEEddcbL8zH6yzzdp6R/PPQKdLQ3BEY6xv0mW8zHTTOT+dhs9SV2311VhnrfXWXHft9ddghy322GSXbfbZaKet9tpst+3223DHLffcdNdt991456333nz37fffgAcu+OCEF2744YgnrvjijDfu+OOQRy755JRXbvnlmGeu+eacd+7556CHLvropJdu+umop6766qy37vrrsMcu++y012777bjnrvvuvPfu++/ABy/88MQXb/zxyCev/PLMN+/889BHL/301Fdv/fXYZ6/99tx3733lIQA="
script:"patternsinterface.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"The Patterns Interface: Basics"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"The Patterns interface allows 1-bit textures, animated patterns, and solid colors to be inspected or modified by index.\\n\\nIt can be obtained as the global variable \\"patterns\\" or via \\"deck.patterns\\".\\n\\nPatterns 0 and 1 cannot be redefined; they're always fully transparent and solid \\"black\\" (palette color 47), respectively.\\n\\nPatterns 2-27 can be read or written as an 8x8 pixel Image interface. Try using the canvas on the left to modify pattern 26, and have a look inside the canvas scripts to see how this works!"}
editor:{"type":"canvas","size":[80,80],"pos":[29,124],"volatile":1,"script":"patternsinterface.1","scale":10}
button4:{"type":"button","size":[126,20],"pos":[69,240],"script":"patternsinterface.2","text":"Reset To Default"}
field2:{"type":"field","size":[85,23],"pos":[26,98],"locked":1,"border":0,"align":"center","value":"click and drag\\nto draw:"}

{script:patternsinterface.0}
on view do
 editor.paste[patterns[26]]
end
{end}

{script:patternsinterface.1}
on click pos do
 me.pattern:!me[pos]
 edit[]
end

on drag pos do
 send drag[pos]
 edit[]
end

on release pos do
 drag[pos]
 edit[]
end

on edit do
 patterns[26]:me.copy[]
end
{end}

{script:patternsinterface.2}
on click do
 patterns[26]:image["%%IMG0AAgACKoAiBQiQYgA"]
 view[]
end
{end}

{card:patternsanimation}
image:"%%IMG3AgABVgUgII5kaZ5oqq5s675wLM90bd94ru987//AoHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26tevXsGPLnk27tu3buHPr3s27t+/fwIMLH068uPHjyJMrX868ufPn0KNLn069uvXr2LNr3869u/fv4MOLH0++vPnz6NOrX8++vfv38OPLn0+/vv37+PPr38+/v///AAYo4IAEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcGhbAhyCGKOKIJIYIYAAdpKjiiiy26GKKAZz44ow0qhjjfyjWqGOLN/qX445AdtBjfz8GqeOQ/BVpJI1I7qfkki82qd+TUPIoY5VMXolllFpuaSWOXnIJZphf+khmmUSeyaKU+VEZJpv4ueklnPfJuSWd9tmJJZ716Vkln/T5CSWg8wm6JKHyGWokovEpGiSj8DkKJKTvSbojpe5ZemSXamLanqY1esoeqFniWOKpqJrY4aqsturqq7DGKuustNZq66245qrrrrz26uuvwAYr7LDEFmvsscgmq+yyzDbr7LPQRivttNRWa+212Gar7bbcduvtt+CuEQI="
script:"thepalette.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"The Patterns Interface: Animation"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"Patterns 28, 29, 30, and 31 can be read or written as a list of up to 256 indices of other patterns.\\n\\nIn the example to the left, we redefine an animated pattern several times sequentially to produce different animation sequences.\\n\\nThe default animation sequences are all based on 1-bit textures, but animated patterns can also use solid colors. You may find it useful to set up an \\"animated\\" pattern which is simply a single texture or solid color as a convenient way to non-destructively re-map colors within card backgrounds or other images."}
ex1:{"type":"field","size":[232,174],"pos":[10,48],"border":1,"style":"code","value":"orig:patterns[29]\\n\\npatterns[29]:34\\nsleep[60]\\n\\npatterns[29]:21,23\\nsleep[60]\\n\\npatterns[29]:21,21,21,23,23,23\\nsleep[120]\\n\\npatterns[29]:orig"}
button4:{"type":"button","size":[60,20],"pos":[255,202],"script":"patternsanimation.0","text":"Try It!"}
field2:{"type":"field","size":[59,23],"pos":[94,229],"locked":1,"border":0,"align":"center","value":"animated pattern 29:"}

{script:patternsanimation.0}
on click do
 eval[ex1.text () 1]
end
{end}

{card:patternscolors}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9ijWr1q1cu3r9Cjas2LFky5o9izat2rVs27p9Czeu3Ll069q9izev3r18+/r9Cziw4MGECxs+jDix4sWMGzt+DDmy5MmUK1u+jDmz5s2cO3v+DDq06NGkS5s+jTp13QANWLNm4Lq16h0Batu+7Ro3bgC6d8/28Vq2g+C/gRBfcFxB8uI8liNwfgA6cxzSeT+oPvv2cBXVu09HHl04Cu/bvycI/rp2dPUpyIs3b0C7devpefe+jz+/7ev84YdHv199Nbjnn4DECUgDgfChFx+A2HHXn39GKCihEBRWaFyEEu6XYXkbhvfDhdMdl1uD6zX4IAgiMpdeifG9WB+C7Wm44H/PBRggjPrtyCOH79UI43NCgpgihBhySCKAL85nQ5EYWvgkFE5GGeKRSE5J3ZFEJoElaQzStyR7wFkpZmxgMtmclmHOl5uYaVb4pZlmothjnXbqR2ac7LlJZZ9+/glooIIOSmihhh6KaKKKLspoo44+Cmmkkk5KaaWWXopppppuymmnnn4Kaqiijkpqqaaeimqqqq7KaquuvgprrLLOSmuttt6Ka6667sprr77+Cmywwg5LbLHGHotsssouy2yzzj4LbbTSTktttdZei2222m7LbbfefgtuuOKOS2655p6Lbrrqrstuu+6+C2+88s5Lb7323otvvvruy2+//v4LcMACD0ywWwUA"
script:"patternscolors.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"The Patterns Interface: Colors"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"Patterns 32 through 47 can be read and written as integers containing a \\"packed RGB\\" representation of a color.\\n\\nIn hexadecimal notation, we could view a packed rgb integer as two digits of a \\"red channel\\", two digits of a \\"blue channel\\", and two digits of a \\"green channel\\", where each channel indicates the intensity of an additive primary color, from 00-FF in hex or 0-255 in decimal.\\n\\n\\n\\n\\n\\n\\n\\n\\n\\nDecker provides a dictionary named \\"colors\\" with names for every color slot. Using these constants instead of pattern indices can help make your scripts more readable!"}
hex:{"type":"field","size":[100,15],"pos":[80,158],"locked":1,"volatile":1,"style":"code","align":"center"}
pat:{"type":"slider","size":[100,25],"pos":[35,94],"script":"patternscolors.1","interval":[32,47],"value":36,"style":"compact"}
sample:{"type":"canvas","size":[80,25],"pos":[144,94],"locked":1,"volatile":1,"scale":1}
field2:{"type":"field","size":[96,15],"pos":[82,69],"locked":1,"border":0,"align":"center","value":"color index:"}
field3:{"type":"field","size":[96,15],"pos":[82,132],"locked":1,"border":0,"align":"center","value":"hex notation:"}
field4:{"type":"field","size":[96,15],"pos":[80,241],"locked":1,"border":0,"align":"center","value":"name:"}
name:{"type":"field","size":[100,15],"pos":[80,263],"locked":1,"volatile":1,"style":"code","align":"center"}

{script:patternscolors.0}
on view do
 reset_pal[]
 p:pat.value
 sample.clear[]
 sample.paste[sample.copy[].map[0 dict p]]
 hex.text:"%06H" format patterns[p]
 icolors:(range colors) dict (keys colors)
 name.text:"colors.%s" format icolors[p]
end
{end}

{script:patternscolors.1}
on change do
 view[]
end
{end}

{card:palettetransitions}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Palette Transitions"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,246],"pos":[254,48],"locked":1,"border":0,"value":{"text":["It is possible for every card in a deck to use a custom palette, though this may make editing decks a bit fiddly. Smoothly transitioning between such cards requires some special consideration for palettes, since ordinary transition effects like \\"SlideLeft\\" display both the origin and destination cards simultaneously.\\n\\nIn this example, we use an intermediate card which is entirely black to hide the point where we swap palettes. This specific approach requires the \\"black\\" and \\"white\\"  colors to remain the same in both palettes for a completely seamless effect.\\n\\n\\n\\n\\nNote that using a single custom transition function to perform palette swaps can be somewhat brittle, as changes to transition timing or framerate may make it difficult for such a function to precisely identify the appropriate \\"changeover\\" point.\\n\\nThere are also user-created libraries for tackling this sort of problem. Check out ","PaletteFade"," for more ideas!"],"font":["","",""],"arg":["","https://itch.io/t/3984923/palettefade-module-a-decker-module-for-smoothly-fading-between-palettes",""]}}
ex1:{"type":"field","size":[232,151],"pos":[10,48],"border":1,"style":"code","value":"go[black \\"BoxOut\\" 15]\\n\\neach c i in beacon.widgets.pal.data\\n patterns[i+32]:c\\nend\\n\\ngo[beacon \\"BoxIn\\" 15]\\n"}
button4:{"type":"button","size":[60,20],"pos":[254,179],"script":"patternsanimation.0","text":"Try It!"}

{card:coloverview}
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"The Col Module: Overview"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"This deck includes a module \\"col\\" which includes a variety of utility routines for working with packed rgb colors.\\n\\nThere are a suite of pairs of conversion functions for working with separate RGB components, Hue-Saturation-Value (HSV) color components, hexadecimal strings, and CSS color names. The \\"col.to_\\" functions convert a packed rgb color into the given representation, while the \\"col.from_\\" functions take some representation and produce a packed rgb color:\\n\\n- col.to_comp[] / col.from_comp[]\\n- col.to_hsv[] / col.from_hsv[]\\n- col.to_hex[] / col.from_hex[]\\n- col.to_css[] / col.from_css[]\\n\\nThe module also provides some general utilities:\\n\\n- col.closest[rgb palette]\\n"}
ex1:{"type":"field","size":[172,191],"pos":[49,72],"border":1,"style":"code","value":"# packed integer\\n16767673\\n\\n# RGB components\\n(255,218,185)\\n\\n# HSV components\\n(0.078,0.27,1)\\n\\n# hex string\\n\\"FFDAB9\\"\\n\\n# CSS name\\n\\"peachpuff\\"\\n"}

{card:colcomponents}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9KiGAEqVI7zBF8rQpnahFAliVWocqEatasbrpKoSr1zlggXC9OhZO2R9n16Y147ZH27dv4u5oi5buGrs68PLV6+UvDr+A9xrxm7cw3KWK2Qju29hwkseRs1AeXDnN5RubM1PpXAO05yiiZ5Qe7eR0DNWol7B+8bo1VMayxcRucbv2Vtq6v+Re8bu3Wd7CuQRPcbw4j+QnmCvP4bxE9Oc2po+wTt008exWsIfwzh329vBTwH8wTx74+PRQ0Hdwz775+vhN4G+wT//6/Pz7g+DnD8J/GAgI4Hv9FbjbgQiG5dqCTBB4AYQOWiBhBRVOOMGFGWI4WYMcHqFhUh+C6OGICXZo4omzpThEiBG4yCICMD4wY4wA1NgAjizquACPJvqYAJAfCnkAkRgaeaON/pWopFxMNnnXk1BCJ+WUnFVpZWhYZqmdgly6gCSSDob5JZVelqnemWhKhxiJa8pAmJtvwhDnYXOuhteKd8J2Fop7gtmnnn+yMJeggwKXmJ2H4pZoVYsyaqSYC5L5KKFbVopppppuymmnnn4Kaqiijkpqqaaeimqqqq7KaquuvgprrLLOSmuttt6Ka6667sprr77+Cmywwg5LbLHGHotsssouy2yzzj4LbbTSTktttdZei2222m7LbbfefgtuuOKOS2655p6Lbrrqrstuu+6+C2+88s5Lb7323otvvvruy2+//v4LcMACD0xwwQYfjHDCCi/McMMOPwxxxBJPTHHFFl+MccYab8xxxx5/DHLIIo9Mcskmn4xyyiqvzHLLLr8Mc8wyz0xzzTbfjHPOOu/Mc88+b1IA"
script:"colcomponents.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"The Col Module: RGB Components"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"The col.to_comp[rgb] function converts a packed rgb integer into a list of red, green, and blue channel values ranging between 0 and 255.\\n\\nThe col.from_comp[(r,g,b)] function converts a list of red, green, and blue channel values into a packed rgb integer."}
rgb:{"type":"field","size":[100,20],"pos":[99,76],"script":"colcomponents.1","value":"16767673"}
comp:{"type":"field","size":[100,20],"pos":[99,192],"script":"colcomponents.2","value":"[255,218,185]"}
field3:{"type":"field","size":[64,15],"pos":[31,78],"locked":1,"border":0,"align":"right","value":"packed rgb"}
field2:{"type":"field","size":[64,35],"pos":[31,193],"locked":1,"border":0,"align":"right","value":"components (as JSON)"}
field4:{"type":"field","size":[75,15],"pos":[54,138],"locked":1,"border":0,"align":"center","value":"col.to_comp[]"}
field5:{"type":"field","size":[89,15],"pos":[156,138],"locked":1,"border":0,"align":"center","value":"col.from_comp[]"}
p1:{"type":"canvas","size":[22,20],"pos":[204,76],"locked":1,"volatile":1,"scale":1}
p2:{"type":"canvas","size":[22,20],"pos":[204,192],"locked":1,"volatile":1,"scale":1}

{script:colcomponents.0}
on view do
 patterns[42]:rgb.text
 patterns[43]:col.from_comp[comp.data]
 p1.clear[]
 p1.paste[p1.copy[].map[0 dict 42]]
 p2.clear[]
 p2.paste[p2.copy[].map[0 dict 43]]
end
{end}

{script:colcomponents.1}
on change val do
 comp.data:col.to_comp[me.text]
 view[]
end
{end}

{script:colcomponents.2}
on change val do
 rgb.text:col.from_comp[me.data]
 view[]
end
{end}

{card:colhsv}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9KiGAEqVI7zBF8rQpnahFAliVWocqEatasbrpKoSr1zlggXC9OhZO2R9n16Y147ZH27dv4u5oi5buGrs68PLV6+UvDr+A9xrxm7cw3KWK2Qju29hwkseRs1AeXDnN5RubM1PpXAO05yiiZ5Qe7eR0DNWol7B+8bo1VMayxcRucbv2Vtq6v+Re8bu3Wd7CuQRPcbw4j+QnmCvP4bxE9Oc2po+wTt008exWsIfwzh329vBTwH8wTx74+PRQ0Hdwz775+vhN4G+wT//6/Pz7g+DnD8J/GAgI4Hv9FbjbgQiG5dqCTBB4AYQOWiBhBRVOOMGFGWI4WYMcHqFhUh+C6OGICXZo4omzpThEiBG4yCICMD4wY4wA1NgAjizquACPJvqYAJAfCnkAkRgaeaON/pWopFxMNnnXk1BCJ+WUnFVpZWhYZqmdgly6gCSSDob5JZVelqnemWhKhxiJa8pAmJtvwhDnYXOuhteKd8J2Fop7gtmnnn+yMJeggwKXmJ2H4pZoVYsyaqSYC5L5KKFbVopppppuymmnnn4Kaqiijkpqqaaeimqqqq7KaquuvgprrLLOSmuttt6Ka6667sprr77+Cmywwg5LbLHGHotsssouy2yzzj4LbbTSTktttdZei2222m7LbbfefgtuuOKOS2655p6Lbrrqrstuu+6+C2+88s5Lb7323otvvvruy2+//v4LcMACD0xwwQYfjHDCCi/McMMOPwxxxBJPTHHFFl+MccYab8xxxx5/DHLIIo9Mcskmn4xyyiqvzHLLLr8Mc8wyz0xzzTbfjHPOOu/Mc88+b1IA"
script:"colhsv.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"The Col Module: HSV Components"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"The col.to_hsv[rgb] function converts a packed rgb integer into a list of Hue, Saturation, and Value components.\\n\\nThe col.from_hsv[(h,s,v)] function converts a list of Hue, Saturation, and Value components into a packed rgb integer.\\n\\nHue, Saturation, and Value are all represented as normalized floating-point values between 0.0 and 1.0.\\n\\nNote that- unlike other conversion functions in the col module- neither of these functions are \\"precise\\": RGB and HSV values may accumulate error when converted in either direction!"}
rgb:{"type":"field","size":[100,20],"pos":[99,76],"script":"colhsv.1","value":"16718243"}
hsv:{"type":"field","size":[100,29],"pos":[99,192],"script":"colhsv.2","value":"[0.9,0.9,1]"}
field3:{"type":"field","size":[64,15],"pos":[31,78],"locked":1,"border":0,"align":"right","value":"packed rgb"}
field2:{"type":"field","size":[64,35],"pos":[31,193],"locked":1,"border":0,"align":"right","value":"components (as JSON)"}
field4:{"type":"field","size":[75,15],"pos":[54,138],"locked":1,"border":0,"align":"center","value":"col.to_hsv[]"}
field5:{"type":"field","size":[89,15],"pos":[156,138],"locked":1,"border":0,"align":"center","value":"col.from_hsv[]"}
p1:{"type":"canvas","size":[22,20],"pos":[204,76],"locked":1,"volatile":1,"scale":1}
p2:{"type":"canvas","size":[22,20],"pos":[204,192],"locked":1,"volatile":1,"scale":1}

{script:colhsv.0}
on view do
 patterns[42]:rgb.text
 patterns[43]:col.from_hsv[hsv.data]
 p1.clear[]
 p1.paste[p1.copy[].map[0 dict 42]]
 p2.clear[]
 p2.paste[p2.copy[].map[0 dict 43]]
end
{end}

{script:colhsv.1}
on change val do
 hsv.data:col.to_hsv[me.text]
 view[]
end
{end}

{script:colhsv.2}
on change val do
 rgb.text:col.from_hsv[me.data]
 view[]
end
{end}

{card:colhex}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9KiGAEqVI7zBF8rQpnahFAliVWocqEatasbrpKoSr1zlggXC9OhZO2R9n16Y147ZH27dv4u5oi5buGrs68PLV6+UvDr+A9xrxm7cw3KWK2Qju29hwkseRs1AeXDnN5RubM1PpXAO05yiiZ5Qe7eR0DNWol7B+8bo1VMayxcRucbv2Vtq6v+Re8bu3Wd7CuQRPcbw4j+QnmCvP4bxE9Oc2po+wTt008exWsIfwzh329vBTwH8wTx74+PRQ0Hdwz775+vhN4G+wT//6/Pz7g+DnD8J/GAgI4Hv9FbjbgQiG5dqCTBB4AYQOWiBhBRVOOMGFGWI4WYMcHqFhUh+C6OGICXZo4omzpThEiBG4yCICMD4wY4wA1NgAjizquACPJvqYAJAfCnkAkRgaeaON/pWopFxMNnnXk1BCJ+WUnFVpZWhYZqmdgly6gCSSDob5JZVelqnemWhKhxiJa8pAmJtvwhDnYXOuhteKd8J2Fop7gtmnnn+yMJeggwKXmJ2H4pZoVYsyaqSYC5L5KKFbVopppppuymmnnn4Kaqiijkpqqaaeimqqqq7KaquuvgprrLLOSmuttt6Ka6667sprr77+Cmywwg5LbLHGHotsssouy2yzzj4LbbTSTktttdZei2222m7LbbfefgtuuOKOS2655p6Lbrrqrstuu+6+C2+88s5Lb7323otvvvruy2+//v4LcMACD0xwwQYfjHDCCi/McMMOPwxxxBJPTHHFFl+MccYab8xxxx5/DHLIIo9Mcskmn4xyyiqvzHLLLr8Mc8wyz0xzzTbfjHPOOu/Mc88+b1IA"
script:"colhex.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"The Col Module: Hex Strings"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"The col.to_hex[rgb] function converts a packed rgb integer into a hexadecimal string consisting of \\"RRGGBB\\" digits.\\n\\nThe col.from_hex[str] function converts an \\"RRGGBB\\" or \\"RGB\\" hexadecimal string into a packed rgb integer. In the case of \\"RGB\\" strings, each supplied character is treated as being doubled. For example, \\"FD2\\" is equivalent to \\"FFDD22\\". Lowercase letters \\"a\\" through \\"f\\" are also accepted."}
rgb:{"type":"field","size":[100,20],"pos":[99,76],"script":"colhex.1","value":"16755384"}
hex:{"type":"field","size":[100,20],"pos":[99,192],"script":"colhex.2","value":"FFAAB8"}
field3:{"type":"field","size":[64,15],"pos":[31,78],"locked":1,"border":0,"align":"right","value":"packed rgb"}
field2:{"type":"field","size":[64,35],"pos":[31,193],"locked":1,"border":0,"align":"right","value":"hex string"}
field4:{"type":"field","size":[75,15],"pos":[54,138],"locked":1,"border":0,"align":"center","value":"col.to_hex[]"}
field5:{"type":"field","size":[89,15],"pos":[156,138],"locked":1,"border":0,"align":"center","value":"col.from_hex[]"}
p1:{"type":"canvas","size":[22,20],"pos":[204,76],"locked":1,"volatile":1,"scale":1}
p2:{"type":"canvas","size":[22,20],"pos":[204,192],"locked":1,"volatile":1,"scale":1}

{script:colhex.0}
on view do
 patterns[42]:0+rgb.text
 patterns[43]:col.from_hex[hex.text]
 p1.clear[]
 p1.paste[p1.copy[].map[0 dict 42]]
 p2.clear[]
 p2.paste[p2.copy[].map[0 dict 43]]
end
{end}

{script:colhex.1}
on change val do
 hex.text:col.to_hex[me.text]
 view[]
end
{end}

{script:colhex.2}
on change val do
 rgb.text:col.from_hex[me.text]
 view[]
end
{end}

{card:colcss}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9KiGAEqVI7zBF8rQpnahFAliVWocqEatasbrpKoSr1zlggXC9OhZO2R9n16Y147ZH27dv4u5oi5buGrs68PLV6+UvDr+A9xrxm7cw3KWK2Qju29hwkseRs1AeXDnN5RubM1PpXAO05yiiZ5Qe7eR0DNWol7B+8bo1VMayxcRucbv2Vtq6v+Re8bu3Wd7CuQRPcbw4j+QnmCvP4bxE9Oc2po+wTt008exWsIfwzh329vBTwH8wTx74+PRQ0Hdwz775+vhN4G+wT//6/Pz7g+DnD8J/GAgI4Hv9FbjbgQiG5dqCTBB4AYQOWiBhBRVOOMGFGWI4WYMcHqFhUh+C6OGICXZo4omzpThEiBG4yCICMD4wY4wA1NgAjizquACPJvqYAJAfCnkAkRgaeaON/pWopFxMNnnXk1BCJ+WUnFVpZWhYZqmdgly6gCSSDob5JZVelqnemWhKhxiJa8pAmJtvwhDnYXOuhteKd8J2Fop7gtmnnn+yMJeggwKXmJ2H4pZoVYsyaqSYC5L5KKFbVopppppuymmnnn4Kaqiijkpqqaaeimqqqq7KaquuvgprrLLOSmuttt6Ka6667sprr77+Cmywwg5LbLHGHotsssouy2yzzj4LbbTSTktttdZei2222m7LbbfefgtuuOKOS2655p6Lbrrqrstuu+6+C2+88s5Lb7323otvvvruy2+//v4LcMACD0xwwQYfjHDCCi/McMMOPwxxxBJPTHHFFl+MccYab8xxxx5/DHLIIo9Mcskmn4xyyiqvzHLLLr8Mc8wyz0xzzTbfjHPOOu/Mc88+b1IA"
script:"colcss.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"The Col Module: CSS Names"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"The col.to_css[rgb] function converts a packed rgb integer into a valid CSS (Cascading Style Sheets) color string.\\n\\nThe col.from_css[(r,g,b)] function (which is frankly a bit more interesting) converts a CSS color string into a packed rgb integer. This function supports a useful subset of all possible CSS color names:\\n\\n- the 148 named CSS colors\\n- #RGB\\n- #RRGGBB\\n- rgb(r, g, b)\\n- rgba(r, g, b, a) (ignores alpha channel)\\n\\nin rgb() and rgba() formats, commas are optional and components may be specified as e.g. \\"50%\\" instead of \\"128\\".\\n\\nthe named css colors are also accessible as a dictionary from names to packed rgb integers \\"col.cssnames\\"."}
rgb:{"type":"field","size":[100,20],"pos":[99,76],"script":"colcss.1","value":"15792383"}
css:{"type":"field","size":[100,20],"pos":[99,192],"script":"colcss.2","value":"aliceblue"}
field3:{"type":"field","size":[64,15],"pos":[31,78],"locked":1,"border":0,"align":"right","value":"packed rgb"}
field2:{"type":"field","size":[64,35],"pos":[31,193],"locked":1,"border":0,"align":"right","value":"css color"}
field4:{"type":"field","size":[75,15],"pos":[54,138],"locked":1,"border":0,"align":"center","value":"col.to_css[]"}
field5:{"type":"field","size":[89,15],"pos":[156,138],"locked":1,"border":0,"align":"center","value":"col.from_css[]"}
p1:{"type":"canvas","size":[22,20],"pos":[204,76],"locked":1,"volatile":1,"scale":1}
p2:{"type":"canvas","size":[22,20],"pos":[204,192],"locked":1,"volatile":1,"scale":1}

{script:colcss.0}
on view do
 patterns[42]:rgb.text
 patterns[43]:col.from_css[css.text]
 p1.clear[]
 p1.paste[p1.copy[].map[0 dict 42]]
 p2.clear[]
 p2.paste[p2.copy[].map[0 dict 43]]
end
{end}

{script:colcss.1}
on change val do
 css.text:col.to_css[me.text]
 view[]
end
{end}

{script:colcss.2}
on change val do
 rgb.text:col.from_css[me.text]
 view[]
end
{end}

{card:colclosest}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9ijWr1q1cu3r9Cjas2LFky5o9izat2rVs27p9Czeu3Ll069q9izev3r18+/r9GzUA4EOCBxcqbHgQ4sSBFjP+4/hxn8iS91CunOcy5juaN9fp7HkO6NBxRpN+Y/p0m9Sq17BuneY17DOyZ5epbXsM7txhdvP+4vt3l+DCtxAvnuU48ivKl1dp7nwK9OhRplN/Yv16k+zal3DvXiSA+PHjwYMhX948cPTf1f9g3969D/Ty16evz4U+/uHi93u5758WAAaYHIHDGYhgggouyGCDDj4IYYQSTkhhhRZeiGGGGm7IYYcefghiiCKOSGKJJp6IYooqrshiiy6+CGOMMs5IY4023ohjjjruyGOPPv4IZJBCDklkkUYeiWSSSi7JZJNOPglllFJOSWWVVl6JZZZabslll15+CWaYYo5JZplmnolmmmquyWabbr4JZ5xyzklnnXbeiWeeeu7JZ59+/glooIIOSmihhh6KaKKKLspoo44+Cmmkkk5KaaWWXopppppuymmnnn4KaqiijkpqqaZyVQA="
script:"colclosest.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"The Col Module: col.closest[]"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"The col.closest[rgb pal] function finds the index in a palette \\"pal\\" which contains the color which is closest (based on a sum-of-squared-distance metric on RGB channels) to an input color \\"rgb\\".\\n\\nThe input color is given as a packed rgb integer, and the palette may be provided as either a list of packed rgb integers or a reference to a Patterns interface; in the latter case indices will be returned in the range 32-47.\\n\\nThis demonstration uses col.closest[] to perform reverse lookups against the named CSS colors: see the view[] function in the card script for details."}
hex:{"type":"field","size":[100,20],"pos":[99,116],"script":"patternscolors.1","value":"FF0031"}
css:{"type":"field","size":[100,20],"pos":[99,192],"locked":1,"volatile":1}
field3:{"type":"field","size":[64,15],"pos":[31,118],"locked":1,"border":0,"align":"right","value":"hex input"}
field2:{"type":"field","size":[64,35],"pos":[31,193],"locked":1,"border":0,"align":"right","value":"closest named css color"}
p1:{"type":"canvas","size":[22,20],"pos":[204,116],"locked":1,"volatile":1,"scale":1}
p2:{"type":"canvas","size":[22,20],"pos":[204,192],"locked":1,"volatile":1,"scale":1}

{script:colclosest.0}
on view do
 a:col.from_hex[hex.text]
 p:range col.cssnames
 k:keys col.cssnames
 css.text:k[col.closest[a p]]

 patterns[42]:col.from_hex[hex.text]
 patterns[43]:col.from_css[css.text]
 p1.clear[]
 p1.paste[p1.copy[].map[0 dict 42]]
 p2.clear[]
 p2.paste[p2.copy[].map[0 dict 43]]
end
{end}

{card:importoverview}
image:"%%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"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Image Import: Overview"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,238],"pos":[254,48],"locked":1,"border":0,"value":"By default, importing images into Decker will convert them to black and white (patterns 1 and 0) using an error-diffusion algorithm invented by Bill Atkinson to \\"dither\\" between these colors, producing the impression of a grayscale image. The J and K keys or \\"Edit -> Lighten Image / Darken Image\\" can be used to adjust the contrast of such an image while the selection remains active.\\n\\nIf Decker is in \\"color\\" mode (with any drawing tool active, \\"Style -> Color\\" from the menu) importing images will instead \\"posterize\\" them to 16 colors based on Decker's current palette.\\n\\nIt is possible to obtain higher-quality results by dithering images to 16 colors using external tools. There are many choices and tradeoffs necessary in this process depending upon your aesthetic needs and preferences.\\n\\nOn the next few cards we'll review several tools and considerations."}

{card:importpal}
image:"%%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"
{widgets}
field1:{"type":"field","size":[224,265],"pos":[278,48],"locked":1,"border":0,"value":{"text":["Before we consider importing color images, we may want to customize Decker's 16-color palette.\\n\\nIf you locate a 14- or 16-color palette you like on ","lospec.com"," and download a .hex file for that palette, you can drag and drop it onto the Decker window to apply it. A 14-color palette will leave black and white intact, while a 16-color palette will cause Decker to pick its best guess for a replacement \\"black\\" and \\"white\\".\\n\\nAlternatively, you could use a tool like the PalImport contraption to the left to give yourself more control; it consumes the same .hex format, but provides you with the opportunity to edit or reorder individual colors by hand. Try applying the example palette in the PalImport contraption for some nice warm earthtones! If you want even more control, consider building a custom contraption of your own using PalImport as a starting point.\\n\\nYou can also use the Font/DA Mover to import the patterns resource from other existing decks, or to delete your deck's patterns and reset them to the defaults."],"font":["","",""],"arg":["","https://lospec.com/palette-list",""]}}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Image Import: Palettes"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
button4:{"type":"button","size":[126,20],"pos":[84,269],"script":"importpal.0","text":"Reset To Default"}
palImport1:{"type":"contraption","size":[137,100],"pos":[78,143],"def":"palImport","widgets":{"button1":{},"button2":{},"p":{"value":"2e222f\\n45293f\\n7a3045\\n993d41\\ncd683d\\nfbb954\\nf2ec8b\\nb0a987\\n997f73\\n665964\\n443846\\n576069\\n788a87\\na9b2a2\\n"}}}
field:{"type":"field","size":[56,15],"pos":[70,126],"locked":1,"border":0,"align":"center","value":"palImport"}

{script:importpal.0}
on click do
 reset_pal[]
end
{end}

{card:importread}
image:"%%IMG3AgABVgZAgHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq06aEWUKNKnUq1qlUWWLNqtcq1q9evYMOKHUtWrFM8ZctqXcsirdu3cOPK9Xr2zlyvbLfe3cu3b9+6dvxSzZtVsOHDiLsCrpMYKuG2jSNL5ruYTuPHkCdr3ly28pzIjzmLHk3XcxzQhEmrXg3V9OnLWFu0Lcy6NmfXcMC6iKuXtu3fkXG/0c07tmPjwJOPdcE8rHA3UXcb9u1buXWru5lrl87VxfM2kpHLzjyaBQgQ18NuX99c6vbvbKByFzv/q3jxcOu3yD4VBHn/+KU3FXsEyscefGu4pR9e5MnGl3Ta7SfVeehFpZeAAxLIXnQHIpjGg1zd12Bc20k434UXYqjhigZ26OEZfS04XmYBKrhhiTOSl2JyK/bY3IovouGVjNiF2OCINrZnolQp7gjVeY6N5uOUQAZpRnhIysXiVE46yOVaolEppotWjpEfkYPpqOV+G6Z5X1dZ+XdXli2Oaed6ZZbxFn9hvUligfqhSGeOWPlXoVu91XnnoszlSQabC0Y6ZFU17unjl8ipSWleb6X2I6OLOjoGjlWhWWqgg5ZFpYX4aWphCysc1+VX0nGqKKhiiioGqRJCShWaC1aa1qc9HsfVCrEyGVWssyErrH2ZQlYirlTqGgavN0aX1rNkuQDglOMdm+yrUK2QWazmdlurn9TeaS0Y2K7nXoRjcUvfjJeGi2yUsI7L6r5eIpvucuuO2K6773rx47z0csidqcpq6YJWUyLnb7/+soBuvxjz6153DUOW2cF2JqxwwwXWSRpzsbFwqXEAayxwxjJvPPPAA2LX8KkkV2syF6TK67CSpa4JZ7iAGovxbjdbiO7N+zrb1sM7qwxyz1P+DDTK8Vb9MdHqMog0r/rOjPG+WkHddGztpezrrbdiTaDWWxQ7n9CJyYiVwIPGpjbUaf9989RxZ0evhkPLTSbdVkDodtxFr8krgP2Kt15WMzMNeLmCD54v120mrnijjGNhdZuI/zqXhphHPTWBfs9cc9Nndx7r5ww/XnjPpWPhtp2CsT47syuwzjmycv5de+eQpp6h879CHLFivTd+sF89Ds83gea2Jbv3toffvO7jk88kZujnVb317RaZJOx/u7zh3hjvHf79xT4/Jqbp98/C+lW41KqiJz2ezS9+8ttO7NC2vPtBLX+5WxT//EcYAFKhZwQsYK/Kpx37re11HbQfuRwoOA4SDWt/saAUMHg3r10tex4UGL4iBLNxPY2EaiOf4vaiwhVOC1TycZh6qLRAs2EuR8fDoe10N7rQpaWHURBa+1pEnxWhZ2JJHBxbGqjEHDoxXzprorygCIWgTVE7Fwsj7LCCRdtt5YZd7NzvwPVCMZKOjE0wnB7PCLY6KvCNMlRbYeIYvtTZ0YVuwaMTxNg83azIe/vRntq4eDPm4JCDaqQj3qCVqqooMo87dKIfO7g0SeLQBQJD5d9QCau9QE8zn2TC6Iq3ya6wbm1xRKUli5c5ZKGRbLJKDa36KJlYLoFRJtQPMcUCPmZRMmrQ9OV6Urm/1QVRNMZUwvNss8Dx2K52JpomrvBiS8dpcEj88VE2k5Ce1kntmWaTJi1/mT8IOvKQoVrnEa5jnhjij2O3myc9x0nAZOJzTPrcp3UCR0JVZs6g1NLfQduVUCPwM477SaUvBYrCa4puogir6BBYw1FUsoAEuaSmLhn5to+C1GciFcJEvVLSZp5SlS+t5e5yuriKgrQrNSXkLnmqR49ClKgxHcJPjzXNBsKTltIk6uFaKNWeJnSpVuGoTeG4ynmWlKfN81dV8ZRUAOyRpVldj3+6uFIJ2tFXU61qWc06U6aGMJd7jOpYiQWwsc4Vq1URqCkL2dSvVpVNMtypHedavKNOMa0se+oqI0SsvU5znooVI2Md2640Luuu9+uYQBvL2ZlalqxJvZ28dmjXZTlwaduR4WlnO7eyck+vB/Ms5yY22EA+MLaqpa1w7xjTFRkWiOJq42szh0bcguq4w2XUXyeq23L5M7R6VSl7mLtL7To3utK1LXWB2lvmXda4Kp2sQ78L3lyJ96DVhVV5lZdAS2qIl1EVnH3V216YFhewUuFbFxNn2EpCDbHy9GJ/3ZvUl4rrqeALV33P2t2NVvK86/3tgns03fEGdqsHjlnLfLTEryaYvxuubYMBHOD5OsuAvAQuii8b4xlXtr8dhu9VXJyuBnkVpxnW8G1r3LSvbnDBOcanbkG8ucJAsrlQDTJ374vfCt+ufEbNLE+TfMg0OvObTp4KkXW5RPtut8oKFiUbo8tlO1aXqwCbnmuHKuU0y6vKGd5pxNj83roG2EEHPhJtambmhkYIYHi2MHtxNBvwtvmtYpYNV2lUnbOR+ZLyhJVDrRzjLUWQto9G67LKhmjXGjGLhFSvpqNGR5daNtRNvMrxxMy8VJc5z9BtKo77fNCsiqxcqA6xrfmr6NJuGNaj+0qyIAmZYeu30zL27ZhyvVdkK27JtA4mrWt900vrd0rUZtFBrS03f0Vt27KClA1J2Eo4axR/PVr0bMmNtTcnK7F1cvc3fTts9Mr7tPTu2cUGfjZFSVaoJRQylP99J2P7V6Q5NbeymkbjgzvbgbFdGsOlGnCSxdlCycvo+IqcaovDW5X9IrPDJ9rx3Kaxn7vzpWPiefEDwzPjs2Olo3nd6y9RDm5gypjJa57fZqJcgCunVss7O8E4EY5VXgoY0RFuaqrV86VLf6zS0rT1oU/di1KjXdLxmXVc0SzAX0+7kM1VZC1vmef4zJLa565Repnts3xeMUgDRPe+/ziLQhRu2UGFJL/PvdDgY6Wrqw13Ro7I8H0npYXnvD+WN76JlYY83e3Oy1a6/caLvfzofm5qzV8cfvhevF9FL7cZod30qQZygeKJ97z/96AXUmKdD79xzZ27XO0d/J1If/ASPRC/CJ+ymG7o+c+/Xe9xJ8/JLeliVEuZzs/tWMB2Df1DSv/WIaRk/f6mgm8zapIB5v7t8UkV88eWyfx+ZvkFNv/eR5tjUQq3XFnf0dJfmD3w51vztWlkBm4nRjvNhmT8h0Ht5n4K9EzA5kD1B1z3RYDKU3vBt4Ak438Kd2jME2zkN2XfZWD3dnfec2wamFsZJUez1znX1W2yd2Z3l3pjh3UpWG8OuHCT9ILdpl00hmgfp3+r133UlYO7J0M8BoP3Z3OaNlwlJXzPZYThk4S6J4Nc1ITJRi16BYXnZ4RHyHaH94PK019beIMC54UuGHnbNWqWlmLawYWLwoIbIjhUiFfGV4L2B2pm6HFeSEl1yFYyqHxu6B176HI25nuw928BMIjiBId3IodiSHKbx4jTtgKOaCeQeGfCNndYSIlUYomF2FleiIj8NomeyGDrB1KZuB31JzuGd4oIFYqiaGeaSHNqCItZI4taeIic9oeAiIu5SIRFSIuXY4umCIwcpotmN4pfmHbI+HA+RVTMyGm3+IxVIozwNY0TA3nWGIypqIq8GInO2I3qpIxRSIxUFobkmIzYqGTaqINTt47l2I5d9o7weHryyI7fOIzoGG9El4/zuI/ZGI7+ZmsA6Y0QJ432OGR2eJDXKJAD2YHnSI15eIq5domPuJAkZlgq4JAU+JAJqZAE6ZGzdFwYiYkaSZJ8qCEnWYkjqZLXxpLmeI4SCZP1qGIQ6Y4vCV6L2F5f1ZLLl5LkWIOgApSfuJM2SXYz2YX9mJQ2SI/12JROaXlQ6WZIKU5TeTBGaYBXiX1ZiStbuZFd6YNfmU9VKUarKJZluXw4GZI8lZb+tpZBaVX6VFVwmY5yyZaolZNRKZXRlpefSJfrZJcLKYiACY1XJVV3GYiHaZZ8aZU7+X+NiYpuGXH2KJmTiZDRKJIjiZmZGZCVaZmdaZifKZNniZbTWJOlKZjZNFaLuV6rGYt6lzingzooGY6kGZttGY3Yw5WHSJa6qY8i1RgFqZrAGZzbRYhJNRmBiI7UJISrOVeaIY6CqG7HiZxvWFaccY/K1yLXaVyZKZ1hQlgQoppUNpkqIJ6bQZEqFR3v9oiZmZ7aKRqv5Z4WBp/hOZ/0+U3+11bYCZIVBVS/xxf8aZ+5+Z/ENZzi8nF7UaDAV3cICqAJJaCH4aCrVpG6mXViVxYOClXQOVD5eZrL2Ev1qW7PFZ1LSZOS6aERiph16ZozZp7cY1k9KXgpypQd6Jkt+h43GocxSoA7upuJSZi0+KH/GZa+qaNBqplDqpi/aaQZ2qM+KpH2B6VTiaRJ+p1LapqPqZP/hy6dhaIiipo5pHqBWZqMZaV8iH75ZqRqKjc1CnBlhRlox0W7OEnJAmVxKKYxRUH+U3piSXLe2Yl6+Zlz5aeICiZVl3A296Yh2qeJGqmhAU4AZUPnx6ciJamaij75h2/I0pGYGJuHuqmk+hjIR3lbupeZWqqsuhbnZqmpqqoV1aq0CklxBqaxyqNJVautWnC1k6vZuau8Wqr4xzkpB6zKCanDuqkxM2u55qhJOarLKqn4tlXImqyrOq2RmnpKuqTSqq2Iyq3duqNzVa7meq7omq7quq7s2q7u+q7wGq/yOq/0Wq/2eq/4mq/6uq/82q/++q8AG7ACO7AEW7AGe7AIm7AKu7AM27AO+7AQG7ESO7EUW7EWe7EYm7Eau7Ec27Ee+7EgG7IiO7IkW7Ime7Iom7Iqu7Is27Iu+7IwG7MyO7M0W7M2e7M4m7M6u7M827M++7NAG7RCO7SeEQQ="
script:"thepalette.0"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Image Import: read[]"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,157],"pos":[254,48],"locked":1,"border":0,"value":"The read[] built-in function can be used to import image files in a .PNG, .JPEG, .BMP, or .GIF format and produce an Image Interface.\\n\\nBy default, read[\\"image\\"] will read an image file in a 16-color format, converting each pixel in the image to the closest entry in Decker's current palette, producing a \\"posterized\\" effect, as seen on the left.\\n\\nIt's also possible to specify a second \\"hint\\" argument to read[] in order to ask it to decode the image into 256 shades of gray (which cannot be directly displayed on a card, but can be manipulated by scripts), to decode the frames of an animated .GIF, or both. See Decker's reference manual for more detail."}
target:{"type":"button","size":[186,201],"pos":[34,71],"show":"none"}
ex1:{"type":"field","size":[248,51],"pos":[254,214],"style":"code","value":"card.image.paste[\\n read[\\"image\\"]\\n target.pos,target.size\\n]"}
button4:{"type":"button","size":[60,20],"pos":[348,273],"script":"patternsanimation.0","text":"Try It!"}
field2:{"type":"field","size":[62,14],"pos":[34,54],"locked":1,"border":0,"value":"target"}

{card:importditherit}
image:"%%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"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[442,312],"script":"logicalcolor.0","text":"Next","style":"rect"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Image Import: DitherIt"}
button3:{"type":"button","size":[60,20],"pos":[78,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,217],"pos":[254,48],"locked":1,"border":0,"value":{"text":["There are a variety of algorithms for \\"dithering\\" color images down to a 16-color palette, and many external tools for the job.\\n\\n","DitherIt"," is a convenient online tool with many useful options. Make sure you configure it to work with Decker's palette and select an appropriate output size: resizing images AFTER dithering them reduces their quality considerably. Decker's default card size is 512x324 pixels.\\n\\n\\n\\n\\n\\n\\n\\n\\nObserve how much more detail can be preserved by importing a 16-color image of Pippi which has been dithered first!"],"font":["","",""],"arg":["","https://ditherit.com",""]}}
target:{"type":"button","size":[186,201],"pos":[34,71],"show":"none"}
button5:{"type":"button","size":[217,39],"pos":[272,170],"script":"importditherit.0","text":"Get Decker's Palette\\nin DitherIt JSON Format"}

{script:importditherit.0}
on click do
 p:"%j" format list range each c in colors
  r.hex:"#%06H" format patterns[c]
 end
 alert["copy and paste the below JSON:" "string" p]
end
{end}

{card:card1}
image:"%%IMG3AgABVgZAgHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq06SEQAaBKjUp1qtWqWK+CCCGVa1SvWrOKDUt2rNmyaM+qTct2LVaneNrKHQu27ty7bvHqzct3b1i4d6gGEEwY6mDDhQcn3ntYMeLHjgOcoDoZqgnKiRujoLoZauUAnUFzxgw19OfGmkdDRp259WrJgO347fu16+zbtHHrzu02dh3FwIMLHz54svCrIcQmf21ccmTWzaMrbv66+nPX15lP316cu/Pu4EUP3kw8gG86u9Harc07ffv37nGfn4OdtXX77/Gn9vy9/+TPANanmmilDYifaQLel+B10c0nR3xnjSCVhPBVCOGFFqrlYBzldUgcecEhp1xrIFLnnXTh8afgitkx6GJ4KPp3omIg1ijchnBgaNV6W+mYoY9A9oajGwEkp1+RLR45m5LOIRajdAGqmOSCTIaW4pQFancljEO6EeSEYP4o5pdjYvVZW1224eGaxBlJ1XJIQgUnnOMNF+NlwuEZgJ4mTrWZiUeC6OSMdRYqI4zesdlhmmx8ySNYZcoFQo+RVuoeo2sgeaSbiHHaYlpwTnUgYU96N1WfpGGpKpNbthZjiTR6VyOmapAJAoW32lrVpFVJiKulZUbZ5LCnYkZrGoome1yczM5JGHExKpprcCO4OmVzsBqKbayIhqdsssei4WiYlH456a+5orurVCfoGmS4Z7TmKWvzavqmWqEKWGq3vUI2AoVWqmultYie1t+g4YGorMLAwWuGrbiq+6XEEkclIa/uDivsxqkG6HAZ34Ys570jZ2knoclOVe1k1ZIQwMqR/RsWcDZ2KOXAIec82MdkTEwupECeO226Q/fra64YtzcpV0ADexXPYwTn5tSKUU1vZPmWzKyopL546MEvU9iYzJFNSzbZ0Hl9psXF8qtzeVCLAXHGYB7Ntt11E403fDxq3PHfUnIcdxhvS9ssyQRy+/Vh/7KpsmItvxxi2C7/W7nY336WXLWIFf7t4GD4zPbofiWNFglE31203qzzjeHaZYH+hdTDWW1vp1iPqDWdqYJHYbXEXXb278Q/9m/xYd8KM7/bNubsvm9nC5rsXsw9JoWwG51666wf7f1csFfMceCA+80f9V14vmZyzmrNGnAxQoV2efJLXu399kM+wuWV24/5wtdxk/rAhb4tiG5oFWPL9yLEve85sHurc1qlCrgF8djLdsCxne12h7g/mapsFHIZ/LZjNuJdLkyWS54K5wc96Y0wYR6qmaIoqAW6WWiBZMHhA3cIQbFk74epKhb5hmi+xE2GhlkYYIfYhzjeMYw4ZssfFPPHOSruj4pYxB/wktUcaClxTUjEwgEjpheuPHAsPEwjBHEoQbagQCpv1FAYrVCeLa6vanh0XhO7ZjPKqRCKxTse/1YYgP6dUIoWBI6UFCWd0IAgjo+EoySjAsk4LmeOVshaG2lzJh6icY2gVGP5wjK+s7yRK6eMJCp7lMo3ujKSKMBkFb64xD12jk1aRCS16ne/K+byl1mUXIdcmLPNONKSb0ImB+UkSyqMkVx98aRV1EhNUHLSh0E0JSy3+cpucrOZU3ibBiGXu2UqTjjDO+Qt5Ye8FEbunfkbpB0n50ElNnI0ydlMPpGkT9GEAJxSsGFahBXKaRaUjKQ7I0F7Vz6DQWahewFoFGhZHmcx8ZZT5CUWXTYVEvwumMAMqTBPpigZ6kyGKN2ZRJ/wTNKtBWNqRJ0oEUguaZoFom4ppXxW6oQL1i5ZW/RU+5hFnOGxs36H9KhGRcpULAqnizFU3BODI0PrhOaqUeGpE+YyVCDhrZps7KhYOFpI1UlOSkIk1ibnotUmULSo99rcs4azVJDadYt4JedggKnIyGB1qsrap4iuglWtXbWtTHAXQtHy1YNGMD6Q7BuQIEkbxC5hpMAJarI2eDj3LcaXVGkqPPO6V716iDE+HQxnNbkXOHXGskoQaF6oqdSIkTUsZK1iY7In20vBFgl5TG1iXLtHqjGxikOFk2hHSlqK9tOcb/3ib5Fwl8hqpZJaWSyPhAbW3q41Q9M9woDck1zEGXSFoF1uad9ar+i+NbxG8G52HbvYskIlt9jhGmQcqRZWUem/CoJvEYKLO9UGd5wGNvBxMRuzuzqVwe4VjgAjPEABE0Gx0DRodxP4XfnyxcJDoDAehzrPwXgUmP1rqojpd50Vfw7EAAhLec3JO63JOLSq219jLYbf+vn4rJ8CMG38yyIiXwfGAHCxgatYrQmXdrnNVbKU3wtjDDOwux1eTJZ3g2QIU/SizJpnXdVLrSmbNrPBNXPDqmzLzrp5xmYJ1RlvxdHGFa2K+l2VkPHTVbEwCblC5l2XlSxXjT7ZwblUs6JpiWQrP3bDXOWNbhfE2i2bpctO9rLOmow4/NHZroZEZJQXPZwSq7nR5m0znPucw3TVts6uxvGP88xkWQN50kWmtFgADd09mwfGUi40IsfsYFIbu3Cophu6IM3hq+DZ1mnpsapuLNtBl9pDpm6up8OM46ammMGmRjM6TavtY1eYzTRWdZufncPacu6KNLV1rWct73r/WNpGNrJyff0aa69YrnLtJZTjCdRrd2jU5n5bsrdMRmY/Tmu3hbaW28Luaae6LDXWM2T8LWJO75vYubzvR8VdZr5eO6/4G3fCZwhsfmv8yq/2VW23d2t719w6H8cKr7HSKhbh+uVH4jiFAS65gNv1xymvI7mxvfT1rjxkqM53YnZe6bw5fNe80SOEmARnqVtH6BH2eJzSi8X7UgW/5RbpwZmrS7q2+Om/BrHXgX5lOmMZ6bYmsa3HJnGc93dBP587a8DuXvwJW6T9Q6qol25yuKqcTXKFu2Kirm68p5ux9OVeNN1T8ZlhZ9UubwzhI8xE9n008TovK9rJuVyjJ/3Qr3f7pCU/6FzbvmyflGbF5r21yt/893z28+T+vPfQx93CZua08nH8bRWzHfaLdzrJwy15NlHenLwHvY2zovua4kbvZeF9xZn0cKyAn+5QGb17iS5+rOMdmK5/MMrtWv0Xy934/ur7J7lf/vJX3S28V37t92PLQnwEaHzqF13L5ybAhFFsN3BJV27QpyjUl3Copn1AhoGdxxdV12w3FBa8F3F+N1gZWHy3l4DsVXRElT+IoVkQiGgwmHbPV321h34t8nNkYTqppzUbSG8+WIIYZ2+/Mmlb5HMCUi8B1nJStnxXsXa19oLQF4HBJH3XgXDmdoGdloU/BmfsdjGTQm39klDe51I9GIbhZ4bCBxkC6H6/x3v4gYJfRhsVV2vx94J2SE71w3drUoFUdn+3N3fzxX8uBYa8FjEDyG2Wd3N2xnP4p2cIdnwCZmZgBnIxWIl3KIONB3dYeHmI+HsfBxb1BSoXt1hs1IFp8W6BaB3lx3fW4YbYAYe0xINIcomWWIuJNlJ15YAW2HJ/KGQZhi82d4jCGIw2F0VNaHxICGQJJlywOECySIvQWGwzOH/zV38Lx4nZV4xCI4bciEDLQYpiFW8keH7zBo4LsopTZ3NM0ozqMxX7xn6zaIvyqHYPyILKSIO8eI+9WB2gmIoj8I07N4fEmIjD+IPQVIDDd4QEdmDBxY6e84zSeItR2HTTeGZMF3KadoVshoE5d4g9JI69d2fd2IYDSZLnVTRzF3gliR9V5JA6I4vwGHv0+H4RSZFwhZH9Y435KHgJYo63knMh4CsBaFYFWXYU6WMUk2d9dCSatYxE55STp4QUtnz0OG606HRWuIes1231F5UglogdWZJZE4q2RJZ6I21FOZQG6VI8eYwEaYJA5pI5A49PeXIg9VFQmJGHlkEEp4uauJONiB+i6IOLiIp7k5ZwWYYH+S3NVWD20pSEYTtyuWlbyYeUSIm3KIFKN5F52JUq9ZUvV5SsFmckA44OhJiJyIq5t483WJLZ+GOT+TaGp4I3GUzKM48zaJVGyYdPV4P+xVkGSJpIOSHvhooWg5rANzkgyJXvw3ROVz+POJsGxjWxWTgSaZfRmJfT92CeuWag2ZYmCWRzYZg0JXPHKWuFSYZpiHsiyZrkl45vqTXVmTOzKYVo1oC46Xy6GXvd6ZXIF5lp9lPL6JiQwYXcV5xCeZ7xmZ54d5/Cpz6a2YJbSTWcxnfzSZn8iZ35CYP9SZ+faWHuCZ+/F2kHVZxCWGcoqqBT0lfgGZzI2ZJS6WL1aS9ThJHZSX8d+i3/BJiZ1iYMOaDlZH7y5itBqTcmuqDDOGWaWS/14oL2cqEeumQXuaEDl6M6c302GJwkmmN2d5teCm9nZWfwVl8t2ogvamtQGjILiEv/GDY3WpVWqiy+SaMe8oirpTv6uENHGp5JqmjN1aR4lHSeUi1pypiVOaVviqNxKqdsVqatyBs15j3upqBjOiEp+mnumKWBCZeq+XMwen/JF489KntUOoWLCnU8ulk/KlzYCKCMIzNiOoAMWnO82XGmxYB2WZf4U6jKQo0Fl6gZeqos952bmoiD2YnkGas8llCwpqKOqqmPeoDxCYnw5aei6qGJKqxaORxzOqqPh6tQqXVCeoAUqqJnWqtv5YC205i32mBuwqsFN4HYKo/aimyNWqwNtn1BOK3v1qwItHrPCa0LaWSumH/TCq+BpYLB+qv1uLD1SnJwk6qKYqcLaaCOCZlFGH16SWrsGq4lx5VJh7C4ZJMPu3IViKXgqZL6Oq4raLB6ppkZyxoiRBgx66rYobKhaXMiO7EKu7Elq2bhNmjeWlGrCq6+R4Ttupf1l22rCrOMh2PvGqNKppk/26Eoi6+qSYg3u55SV7OvAZy4qCo4q5qdqrNSG2waW7WeOWjoWh4gQrHkOFdOx6TOGaqPt6RNG1yQubMjm5VqS3v3GqK3B4YZV7aCOyVeO7CtkbgsuZJwybd3dJ1/q5N+qDh067EsYrFJG1ck+3jm5rRz27N16J+RaGySO7KTq2RXe7jvOY75hbWLG2QzqyA1y7gi+ppxebaERps+a5Gpa52++6Gly7q65roESqsGR7Od+y1+CbxYOaE9C52SA7mo27ue+7sRdo1uERpDxb1tNheCGWgCMruKQb6s0bEz6JiXe7uPq7suFpPxir1ROqwg2kGwy4mFizgB+7znG7yfS5E1i6vzRL3bar25Kb/Rpb0etq+MKK35SncBXIUAjLhTMqjqSBUETLRUiagIvGJIpkn/F8ID4r2t2muQuZ1UaLp1C7r5E7Wgumh+28GLpsAS9H/jyak4nGtG+xosHMEpi6bABra96CZTFX9GC7EyTFF2RMNBwpF595hHeY8YW7eOV71t28M1Z20Uayi2Y1LJe8VJLGJMbGltkXOtq4/JWbsUvL8VCaSYG0C/12UmMzAmsx+JU1iJI6XSOVJHHL9hbH3oRsZvhqcVWpEqib6U+VZYHLqEqoRbPMKJgcd363b8+8cJHMgLDIxGyK/FB6hX07+g3MZh+8Z0mLty51mcRcItIsnxuMePk8KWzGiYbGmjmamGNsrFd4sHmMhhN8GV3IyQ+cjrSpF9HMt9WL9Ud3FZFrdgGY8FisOeLMoSWsl/upBMGMfuu2K3OMzOa8yLApgh+sjY57gC3MmmNc1QDMu96jlYHLLZLKP+G8/erD6olsycfM9uIa4FC4R8qn+uyMLHW8k7LLrRq4IZXJun27bznDNzSrxfG6S8M6NGF7CFbMHlysMBqqbyLMpO684vbK3qvNELfaWB25r4fH5gqM+f57h4d3i57Mt8rLfnTMxPC5vvrM3Xer0jLV0tJ8xF+9PimnHtN9BSys0cLcHdXMWLPIMHvZleptA7bX/I7JpUbawMxNL8vM8uqrzUTNMC7dUxXcpy3LMxzM4tzLsoHNUk/ZVM0yNm1EBa+4glfC9SaKNha5+iXMyyucIw3Vxy7JOAzUF6Xc1svM5qfSNVtjRfyBWK3dg94tiM/dhunStv7YHLOa1AubXR2tec3dVffWg2DWIOV01cujfSW8i3fNgKV2Vt3dqT7dptLSFvPduU/dq2/VHO1somjUhGO8WVjMQaHdxHLbzVKo6B3Y3HjZIqyESqTc+JLdmRHd2LPd1tDdnTbd2OLYgnDbUPTLYv7cZcPYNGjbfyGtoWNtqZh2Vr6rBl1tyZ1WiwbdvxTduyXdv1Hds9Ut/AuM2Byt2h69minNYFDMYAvqvAZtxjiODIPYZiV5fuvdYgit3Qfd3yPdn3XeH4PYha2M8uezX7jLSfnNedLeKfet7pfeKkLWzMbcAPHhzwjeEw7tr1PeP5XeO07VLvSNAVrbFLXdZUm7xKzdmNfMrJXeQJjlBP2OLnhmRM3uRO/uRQHuVSPuVUXuVWfuVYnuVavuVc3uVe/uVgHuZiPuZkXuZmfuZonuZqvuZs3uZu/uZwHudyPud0Xud2fud4nud6vud83ud+/ueAHuiCPuiEXuiGfuiInuiKvuiM3uiO/uiQHumSPumUXumWfumYnumavumc3ume/umgHuqiPuqkXuqmfuqonuqq7htBAA=="
{widgets}
field3:{"type":"field","size":[182,37],"pos":[36,274],"locked":1,"border":0,"align":"center","value":"ordered dithers usually don't look as nice as an error-diffusion method. imagemagick can do both!"}
button2:{"type":"button","size":[60,20],"pos":[10,312],"script":"logicalcolor.0","text":"Prev","style":"rect"}
title:{"type":"field","size":[492,17],"pos":[10,22],"locked":1,"font":"menu","show":"invert","border":1,"align":"center","value":"Image Import: ImageMagick"}
button3:{"type":"button","size":[60,20],"pos":[441,312],"script":"logicalcolor.0","text":"Index","style":"rect"}
field1:{"type":"field","size":[248,174],"pos":[254,48],"locked":1,"border":0,"value":{"text":["If you're bulk-converting many images, you may wish to consider a command-line tool like ","ImageMagick"," for performing dithering.\\n\\nImageMagick also requires a reference palette; the easiest way to supply it is as an image with one pixel of each color in the palette:\\n\\n\\n\\n\\n\\n\\n\\nA command line sequence to perform a different \\"ordered dither\\" technique with ImageMagick might look something like the following:"],"font":["","",""],"arg":["","https://imagemagick.org/index.php",""]}}
target:{"type":"button","size":[186,201],"pos":[34,71],"show":"none"}
button5:{"type":"button","size":[217,39],"pos":[273,133],"script":"card1.0","text":"Save Decker's Palette as\\n\\"lut.gif\\" for ImageMagick"}
field2:{"type":"field","size":[248,44],"pos":[254,234],"style":"code","value":"$convert pippibust.jpg -resize 186x201 -brightness-contrast -10 -ordered-dither o4x4 -remap lut.gif ordered.gif"}

{script:card1.0}
on click do
 r:image[16,1]
 each c k i in colors r[i,0]:c end
 write[r "lut.gif"]
end
{end}

{card:beacon}
image:"%%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"
{widgets}
pal:{"type":"field","size":[206,34],"pos":[295,31],"locked":1,"show":"none","value":"[16777215,2375497,2238779,3429956,7044956,11579772,14796164,13145696,11362130,9516598,6893329,8999983,7958115,10583390,11837839,0]"}
button1:{"type":"button","size":[97,29],"pos":[403,301],"script":"beacon.0","text":"Back"}
field1:{"type":"field","size":[171,34],"pos":[8,299],"locked":1,"align":"center","value":{"text":["this is a background from ","ahmwma","'s \\"Beacon Puzzle\\" prototype,\\nused with permission."],"font":["","",""],"arg":["","https://ahmwma.itch.io",""]}}
button2:{"type":"button","size":[33,34],"pos":[109,48],"script":"beacon.1","show":"transparent","style":"invisible"}
button3:{"type":"button","size":[20,25],"pos":[317,76],"script":"beacon.2","show":"transparent","style":"invisible"}
button4:{"type":"button","size":[20,25],"pos":[292,75],"script":"beacon.3","show":"transparent","style":"invisible"}
button5:{"type":"button","size":[30,34],"pos":[302,105],"script":"beacon.4","show":"transparent","style":"invisible"}
button6:{"type":"button","size":[11,18],"pos":[344,127],"script":"beacon.5","show":"transparent","style":"invisible"}
button7:{"type":"button","size":[89,189],"pos":[361,40],"script":"beacon.6","show":"transparent","style":"invisible"}

{script:beacon.0}
on click do
 go["Back" "BoxOut" 15]
 reset_pal[]
 go["Back" "BoxIn" 15]
end
{end}

{script:beacon.1}
on click do
 alert["There are two tiny figures playing together inside this snow globe."]
 alert["One looks like an exposition fairy, and the other is some kind of lion/eagle chimera... or maybe a cat/chicken chimera?"]
 alert["You feel an urge to shake the snow globe,\\nbut... you probably shouldn't."]
end
{end}

{script:beacon.2}
on click do
 alert["What a nice bug.\\nYou don't see these around as often anymore..."]
end
{end}

{script:beacon.3}
on click do
 alert["Someone just scribbed two lines\\nand a dot here."]
end
{end}

{script:beacon.4}
on click do
 alert["It's some kind of memo\\nabout 'boyrap premium'.\\n I have no idea what that means."]
end
{end}

{script:beacon.5}
on click do
 alert["This light switch is glued in the 'ON' position."]
end
{end}

{script:beacon.6}
on click do
 alert["Brr. No way.\\nIt's too cold outside."]
end
{end}

{card:black}
image:"%%IMG3AgABVgKMj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9ijWr1q1cu3r9Cjas2LFky5o9izat2rVs27p9Czeu3Ll069q9izev3r18+/r9Cziw4MGECxs+jDix4sWMGzt+DDmy5MmUK1u+jDmz5s2cO3v+DDq06NGkS5s+jTq16tWsW7t+DTu27Nm0a9u+jTu37t28e/v+DTy48OHEixs/jjy58uXMmzt/Dj269OnUq1u/jj279u3cu3v/Dj68+PHky5s/jz69+vXs27t/Dz++/Pn069u/jz+//v38+/v/D2CAAg5IYIEGHohgggouyGCDDj4IYYQSTkhhhRZeiGGGGm7IYYcefghiiCKOSGKJJp6IYooqrshiiy6+CGOMMs5IY4023ohjjjruyGOPPv4IZJBCDklkkUYeiWSSSi7JZJNOPglllFJOyUoB"

{module:col}
description:"color manipulation utilities"
version:1.1
{data}
cssnames:{"black":0,"silver":12632256,"gray":8421504,"white":16777215,"maroon":8388608,"red":16711680,"purple":8388736,"fuchsia":16711935,"green":32768,"lime":65280,"olive":8421376,"yellow":16776960,"navy":128,"blue":255,"teal":32896,"aqua":65535,"orange":16753920,"aliceblue":15792383,"antiquewhite":16444375,"aquamarine":8388564,"azure":15794175,"beige":16119260,"bisque":16770244,"blanchedalmond":16772045,"blueviolet":9055202,"brown":10824234,"burlywood":14596231,"cadetblue":6266528,"chartreuse":8388352,"chocolate":13789470,"coral":16744272,"cornflowerblue":6591981,"cornsilk":16775388,"crimson":14423100,"cyan":65535,"darkblue":139,"darkcyan":35723,"darkgoldenrod":12092939,"darkgray":11119017,"darkgreen":25600,"darkgrey":11119017,"darkkhaki":12433259,"darkmagenta":9109643,"darkolivegreen":5597999,"darkorange":16747520,"darkorchid":10040012,"darkred":9109504,"darksalmon":15308410,"darkseagreen":9419919,"darkslateblue":4734347,"darkslategray":3100495,"darkslategrey":3100495,"darkturquoise":52945,"darkviolet":9699539,"deeppink":16716947,"deepskyblue":49151,"dimgray":6908265,"dimgrey":6908265,"dodgerblue":2003199,"firebrick":11674146,"floralwhite":16775920,"forestgreen":2263842,"gainsboro":14474460,"ghostwhite":16316671,"gold":16766720,"goldenrod":14329120,"greenyellow":11403055,"grey":8421504,"honeydew":15794160,"hotpink":16738740,"indianred":13458524,"indigo":4915330,"ivory":16777200,"khaki":15787660,"lavender":15132410,"lavenderblush":16773365,"lawngreen":8190976,"lemonchiffon":16775885,"lightblue":11393254,"lightcoral":15761536,"lightcyan":14745599,"lightgoldenrodyellow":16448210,"lightgray":13882323,"lightgreen":9498256,"lightgrey":13882323,"lightpink":16758465,"lightsalmon":16752762,"lightseagreen":2142890,"lightskyblue":8900346,"lightslategray":7833753,"lightslategrey":7833753,"lightsteelblue":11584734,"lightyellow":16777184,"limegreen":3329330,"linen":16445670,"magenta":16711935,"mediumaquamarine":6737322,"mediumblue":205,"mediumorchid":12211667,"mediumpurple":9662683,"mediumseagreen":3978097,"mediumslateblue":8087790,"mediumspringgreen":64154,"mediumturquoise":4772300,"mediumvioletred":13047173,"midnightblue":1644912,"mintcream":16121850,"mistyrose":16770273,"moccasin":16770229,"navajowhite":16768685,"oldlace":16643558,"olivedrab":7048739,"orangered":16729344,"orchid":14315734,"palegoldenrod":15657130,"palegreen":10025880,"paleturquoise":11529966,"palevioletred":14381203,"papayawhip":16773077,"peachpuff":16767673,"peru":13468991,"pink":16761035,"plum":14524637,"powderblue":11591910,"rosybrown":12357519,"royalblue":4286945,"saddlebrown":9127187,"salmon":16416882,"sandybrown":16032864,"seagreen":3050327,"seashell":16774638,"sienna":10506797,"skyblue":8900331,"slateblue":6970061,"slategray":7372944,"slategrey":7372944,"snow":16775930,"springgreen":65407,"steelblue":4620980,"tan":13808780,"thistle":14204888,"tomato":16737095,"turquoise":4251856,"violet":15631086,"wheat":16113331,"whitesmoke":16119285,"yellowgreen":10145074,"rebeccapurple":6697881}
{script}

# lookup tables:

local hsv_comps:"%j" parse "[[0,1,2],[3,0,2],[2,0,1],[2,3,0],[1,2,0],[0,2,3]]"
local rgb_comps:2^(16,8,0)
local hex_comps:0,0,1,1,2,2

# convert packed rgb into various formats:

module.to_comp:on to_comp x do
 256%floor x/rgb_comps
end
module.to_hsv:on to_hsv x do
 x:"rgb" dict to_comp[x]/255
 local maxc:max x
 local minc:min x
 if minc~maxc
  0,0,maxc
 else
  local s:(maxc-minc)/maxc
  local c:(maxc-x   )/maxc-minc
  local h:if x.r~maxc 0.0+c.b-c.g
  elseif     x.g~maxc 2.0+c.r-c.b
  else                4.0+c.g-c.r end
  (1%h/6),(s),(maxc)
 end
end
module.to_hex:on to_hex x do
 "%02H%02H%02H" format to_comp[x]
end
module.to_css:on to_css x do
 "#%02H%02H%02H" format to_comp[x]
end

# convert various formats into packed rgb:

module.from_comp:on from_comp x do
 sum rgb_comps*floor 255&0|x
end
module.from_hsv:on from_hsv x do
 x:"hsv" dict (1%first x),0|1&1 drop x
 local i:floor 6*x.h
 local f:(6*x.h)-i
 local c:x.v,x.v*1-(x.s*1-f),(x.s),(f*x.s)
 from_comp[255*c@hsv_comps[6%i]]
end
module.from_hex:on from_hex x do
 if 6>count x x:"" fuse x @ hex_comps end
 from_comp["%02H%02H%02H" parse x]
end
module.from_css:on from_css x do
 if "#"~first x
  from_hex[1 drop x]
 elseif "rgb"~3 take x # do not support alpha channel, hsl(), hwb(), lab(), lch(), color(), etc.
  on perc x do floor if "%"~last x 255*x/100 else 0+x end end
  c:"rgb%*oa(%.12r0123456789.%%*r %*o,%*r %.12r0123456789.%%*r %*o,%*r %.12r0123456789.%" parse x
  from_comp[perc @ c]
 else
  data.cssnames[x]
 end
end

# utilities

module.closest:on closest x pal do
 local n:to_comp[x]
 local h:to_comp@if "patterns"~typeof pal pal@32+range 16 else pal end
 local ri:0
 on color_dist x do sum (n-x)^2 end
 each v i in h
  if color_dist[v]<color_dist[h[ri]] ri:i end
 end
 if "patterns"~typeof pal 32+ri else ri end
end
module.cssnames:data.cssnames

{end}

{contraption:palImport}
size:[137,100]
margin:[0,0,0,0]
description:"a tool for importing color palettes in the .hex format as used by lospec.com."
image:"%%IMG3AIkAZAQQgECrvTjrzbv/YPhJU2OeaKqubOu+cCzPcVDSeK7vfN9QvqBwSHQBi8ikknZcOp/PJnRKDUqr2Kzsqu16UdyvOBsem6HlszqZXruF7bd8F5/bZ/W73hjY+3N5f4I/fYOGLYGHeomKdoyNco+QbpKTapWWZpiZYpucXp6fWqGiWKSlVKeoaIWri62ujrCxkbO0lLa3l7m6mry9nb/AoMLDo8XGpsjJqcvMrM++0WOq0zrV1jjY2XjO3EXb3zDh4nzlyudV5Okq6+xg3u908fKA9PVM9/hb+vvj/f7MBQQHcOAKd/UQylP4jiE7h+kgnpNYjqI4i98wctOYjaM1j9NARhP5jCQzk8lQGlM5jCUwl71g6pJ5iyYtm7FwutK5iicqn6WAihL6iSgno5mQWlI6yUZBgydsSBBBtarVq1izSogA"
{widgets}
button1:{"type":"button","size":[60,20],"pos":[6,74],"script":"palImport.0p","text":"Import"}
button2:{"type":"button","size":[60,20],"pos":[71,74],"script":"palImport.1p","text":"Apply"}
p:{"type":"field","size":[125,62],"pos":[6,7],"scrollbar":1,"style":"code"}

{script:palImport.0p}
on click do
 p.text:read[]
end
{end}

{script:palImport.1p}
on color_dist a b do
 aa:"%2h%2h%2h" parse "%06h" format a
 bb:"%2h%2h%2h" parse "%06h" format b
 sum(aa-bb)^2
end

on find_closest i n do
 g:patterns[i]
 r:first n
 each v in n
  if color_dist[r g]>color_dist[v g] r:v end
 end
 patterns[i]:r
 (list r) drop n
end

on click do
 n:16 limit (list "%h") parse "\\n" split p.text
 patterns[32]:16777215
 patterns[47]:0
 if (count n)>15
  n:find_closest[32 n]
  n:find_closest[47 n]
 end
 each c i in n patterns[33+i]:c end
end
{end}

`,cr=e=>{if(e.length){const t=e[e.length-1],n=t.x??90,A=t.y??5;return{x:n>25?n-25:n+25,y:A>25?A-5:A+5}}else return{x:90,y:5}},Ou=1337,Zu={FINDER:"finder",FILE:"file",PHOTO_BOOTH:"photobooth",ABOUT_THIS_MOCKINTOSH:"about",VIDEO:"video",SAFARI:"safari",CONTROL_PANEL:"control_panel",PICTURE:"picture",DECKER:"decker"};async function dr(e){try{const t=await fetch(`/content/${e}.txt`);return t.ok?await t.text():`Could not load ${e}`}catch{return`Could not load ${e}`}}function Lu(e,t){const n=e.toLowerCase();return n.endsWith(".deck")||n.endsWith(".html")&&t.includes('language="decker"')?!0:t.includes("{deck}")&&t.includes("{card:")}async function yo(e){const[t,n]=await Promise.all([dr("README.md"),dr("CONTRIBUTING.md")]),A=e.mkdir(ft,"Mockintosh HD");A.icon="icon/hd";const i=e.mkdir(A.id,"Development");await e.writeFile(i.id,"README.md",t,"text"),await e.writeFile(i.id,"CONTRIBUTING.md",n,"text");const r=e.mkdir(i.id,"Decker");await e.writeFile(r.id,"Dialog.deck",Wu,"text"),await e.writeFile(r.id,"Color.deck",Su,"text"),e.mkdir(A.id,"Applications"),e.mkdir(A.id,"Trash");const o=e.mkdir(A.id,"Desktop Folder");for(const s of ei)await e.writeFile(o.id,s.name,JSON.stringify({appId:s.appId}),"app-shortcut",{icon:s.icon});await e.flush()}async function Du(e){if(e.readDir(ft).length>0){Ku(e),await Hu(e);return}await yo(e)}function Ku(e){const t=e.findByName(ft,"Mockintosh HD");t&&(e.mkdir(t.id,"Desktop Folder"),e.mkdir(t.id,"Trash"))}const ei=[{name:"Photo Booth",appId:"photobooth",icon:"icon/photobooth-smr-32"},{name:"1984.mp4",appId:"video",icon:"icon/MacFlim"},{name:"Safari",appId:"safari",icon:"icon/safari"},{name:"Decker",appId:"decker",icon:"icon/computer"},{name:"App Store",appId:"appstore",icon:"icon/appstore-smr-32x32"},{name:"ChatGippity",appId:"chatgippity",icon:"icon/computer"},{name:"Spotify Player",appId:"spotify",icon:"icon/spotify"}],Bu=new Map(ei.map(e=>[e.appId,e]));async function Hu(e){const t=e.findByName(ft,"Mockintosh HD");if(!t)return;const n=e.findByName(t.id,"Desktop Folder");if(!n)return;const A=e.readDir(n.id);for(const i of A){if(i.kind!=="file")continue;const r=i;if(r.fileType!=="app-shortcut")continue;let o;try{const a=await e.readFile(r.id);a&&(o=JSON.parse(a).appId)}catch{}const s=o?Bu.get(o):void 0;(!s||s.name!==r.name)&&await e.remove(r.id)}for(const i of ei)e.findByName(n.id,i.name)||await e.writeFile(n.id,i.name,JSON.stringify({appId:i.appId}),"app-shortcut",{icon:i.icon})}async function Eu(e,t){const n=e.findByName(ft,"Mockintosh HD");if(!n)return;let A=e.findByName(n.id,"System");A||(A=e.mkdir(n.id,"System"));let i=e.findByName(A.id,"InstalledApps");if(!i){i=e.mkdir(A.id,"InstalledApps");return}const r=e.readDir(i.id),o=[];for(const s of r){if(s.kind!=="file")continue;const l=s;if(l.fileType!=="app")continue;const a=await e.readFile(l.id);if(a)try{const c=JSON.parse(a);c.id&&c.entry&&o.push(c)}catch{}}o.length>0&&await t.loadAll(o)}async function Pu(){const e=document.createElement("canvas");e.width=J.width,e.height=J.height,document.getElementById("root").appendChild(e);const t=document.createElement("video");t.playsInline=!0,t.muted=!0,document.body.appendChild(t);const n=e.getContext("2d",{alpha:!1}),A=new zA(J.width,J.height),i={...qA};fi({width:J.width,height:J.height,pixels:A.pixels});const r=Is();bs(r),fi({width:J.width,height:J.height,pixels:A.pixels});const o=new Hl,s=new ml,l=new Na,a=new Ze({screenWidth:J.width,screenHeight:J.height,menubarHeight:$,onActivateChange:(M,Z)=>{M&&K(M,{type:"deactivate"}),Z&&K(Z,{type:"activate"}),V(),L()}});[gc,Zc,Hc,Ec,Fc,Qc,rd,Cu,od,ad,Vd,$d,fu,pu].forEach(M=>s.register(M)),s.registerMultiWindow(vc);const c=new pc(o,s);hc(o);let d=Ac([]),u=!0,f=0,q=0,p=1,m=null,g,w,S;async function y(M){i.colorMode!==M&&(i.colorMode=M,si(M),L(),await mc(i))}function v(){const M=window.innerWidth,Z=window.innerHeight;p=Math.max(1,Math.min(Math.floor(M/J.width),Math.floor(Z/J.height))),e.style.width=`${J.width*p}px`,e.style.height=`${J.height*p}px`}v(),window.addEventListener("resize",v);const C=ja({openWindow:(M,Z)=>b(M,void 0,Z),closeWindow:M=>{a.closeWindow(M),s.isMultiWindowApp("finder")&&s.destroyWindowForApp("finder",M),s.destroyInstance(M),L()},showDialog:M=>new Promise(Z=>{const I="__dialog__",x=uu(M.message,M.showInput),O={message:M.message,buttons:M.buttons??["OK"],showInput:M.showInput,inputDefault:M.inputDefault,_resolve:_=>{a.closeWindow(I),s.destroyInstance(I),V(),L(),Z(_)}},Y=s.createInstance("__dialog__",I,{...O,_sprites:o,_os:C,_systemPreferences:i,_setColorMode:y});Y&&Y.builder.setRenderFunction(L),a.openWindow({id:I,title:"",x:Math.floor((J.width-x.width)/2),y:Math.floor((J.height-x.height)/2),width:x.width,height:x.height,contentHeight:x.height,contentWidth:x.width,appId:"__dialog__",props:O,scrollable:!1,resizable:!1,minWidth:x.width,minHeight:x.height,windowKind:"alert",modal:!0,chromeless:!0}),V(),L()}),videoElement:t});async function W(M,Z,I){const x=M;if(a.windows.find(ze=>ze.id===x)){a.bringToFront(x),L();return}const Y=cr(a.windows),_={directoryId:Z,_finderServices:S},It=s.createWindowForApp("finder",x,_);It&&It.winBuilder.setRenderFunction(L);const te=340,me=180,he=3,Fn=$+3,Xn=J.width-3,ge=J.height-3;let xe=Math.max(he,Math.min(Y.x??20,Xn-te)),un=Math.max(Fn,Math.min((Y.y??30)+$,ge-xt-me));if(I){const ze={x:xe,y:un,width:te,height:me+xt};await R(I,ze)}a.openWindow({id:x,title:M,x:xe,y:un,width:te,height:me,contentHeight:me,contentWidth:te,appId:"finder",props:_,scrollable:!0,resizable:!0,minWidth:160,minHeight:80,windowKind:"document",openedFromRect:I}),V(),L()}async function b(M,Z,I,x,O){var ii,ri,oi;const Y=s.get(M);if(!Y)return;const _=Z??Y.title;if(a.windows.find(le=>le.id===_)){a.bringToFront(_),L();return}const te=x??cr(a.windows),me=s.createInstance(M,_,{...I,_sprites:o,_os:C,_systemPreferences:i,_setColorMode:y,_fs:g,_appLoader:c,_openFSNode:le=>k(le),_openWindow:(le,zo,Mo,Co)=>{const Wo=Zu[le]??le;b(Wo,zo,Mo,Co)},_bitCanvas:A,_windowManager:a});me&&me.builder.setRenderFunction(L);const he=Y.windowKind??"document",Fn=J.width-6,Xn=J.height-$-6,ge=he==="presentation"?J.width:Math.min(Y.defaultSize.width,Fn),xe=he==="presentation"?J.height:Math.min(Y.defaultSize.height,Xn),un=Y.scrollable?ut:0,ze=ge-1-un,bo=((ii=Y.minSize)==null?void 0:ii.width)!=null&&ze<Y.minSize.width?Math.max(ze,Y.minSize.width):ge,wo=3,vo=$+3,ko=J.width-3,Io=J.height-3,ni=he==="presentation"?0:Math.max(wo,Math.min(te.x??20,ko-ge)),Ai=he==="presentation"?0:Math.max(vo,Math.min((te.y??30)+$,Io-xt-xe));if(O){const le={x:ni,y:Ai,width:ge,height:xe+xt};await R(O,le)}a.openWindow({id:_,title:Z??Y.title,x:ni,y:Ai,width:ge,height:xe,contentHeight:xe,contentWidth:bo,appId:M,props:I??{},scrollable:Y.scrollable??!1,resizable:Y.resizable??!1,minWidth:((ri=Y.minSize)==null?void 0:ri.width)??100,minHeight:((oi=Y.minSize)==null?void 0:oi.height)??60,windowKind:he,openedFromRect:O}),V(),L()}async function k(M,Z){const I=g.getNode(M);if(!I)return;if(I.kind==="directory"){W(I.name,I.id,Z);return}const x=I;if(x.fileType==="app-shortcut"){const O=await g.readFile(x.id);if(O)try{const{appId:Y}=JSON.parse(O);b(Y,void 0,void 0,void 0,Z)}catch{}return}if(x.fileType==="app"){const O=await g.readFile(x.id);if(O)try{const Y=JSON.parse(O);Y.id&&Y.entry&&(await c.load(Y),b(Y.id,void 0,void 0,void 0,Z))}catch{}return}if(x.fileType==="text"){const O=await g.readFile(x.id);if(O&&Lu(x.name,O)){b("decker",x.name,{fileId:x.id,title:x.name},void 0,Z);return}b("file",x.name,{fileId:x.id,_fs:g},void 0,Z);return}if(x.fileType==="image"){await g.loadSprite(x.id)&&b("picture",x.name,{src:`fs:${x.id}`,title:x.name},void 0,Z);return}}function V(){const M=E(),Z=a.getActiveWindow();let I;if(Z)if(Z.appId==="finder"){const x=s.getMultiWindowInstance("finder",Z.id);x!=null&&x.app.getMenubar&&(x.appBuilder.resetForRender(),x.winBuilder.resetForRender(),I=x.app.getMenubar(x.appBuilder,x.winBuilder,Z.id,x.props))}else{const x=s.getInstance(Z.id);x!=null&&x.app.getMenubar&&(x.builder.resetForRender(),I=x.app.getMenubar(x.builder,x.props))}if(!I){const x=s.getMultiWindowInstance("finder",it);x!=null&&x.app.getMenubar&&(x.appBuilder.resetForRender(),x.winBuilder.resetForRender(),I=x.app.getMenubar(x.appBuilder,x.winBuilder,it,x.props))}I||(I=z()),d.menus=[...M,...I]}function z(){return[{label:"File",items:[{label:"Open",shortcut:"⌘O",disabled:!0},{label:"Close",disabled:!0}]},{label:"Edit",items:[{label:"Undo",shortcut:"⌘Z",disabled:!0},{label:"Cut",shortcut:"⌘X",disabled:!0},{label:"Copy",shortcut:"⌘C",disabled:!0},{label:"Paste",shortcut:"⌘V",disabled:!0}]},{label:"View",items:[{label:"By Icon",disabled:!0},{label:"By Name",disabled:!0},{label:"By Date",disabled:!0}]},{label:"Special",items:[{label:"Clean Up Desktop",disabled:!0},{label:"Empty Trash",disabled:!0},{type:"separator"},{label:"Restart",disabled:!0},{label:"Shut Down",disabled:!0}]}]}function E(){return[{label:"",items:[{label:"About this Mockintosh...",onClick:()=>b("about")},{type:"separator"},{label:"Control Panel",onClick:()=>b("control_panel")},{label:"Testing",onClick:()=>b("testing")}]}]}function K(M,Z){const I=a.windows.find(O=>O.id===M);if(I&&s.isMultiWindowApp(I.appId)){const O=s.getMultiWindowInstance(I.appId,M);if(O!=null&&O.app.onWindowEvent){O.appBuilder.resetForRender(),O.winBuilder.resetForRender();const Y=a.getContentRect(I),_={width:I.width,height:I.height,contentOriginX:Y.x,contentOriginY:Y.y,contentTopInset:I.contentTopInset,scrollY:I.scrollY,scrollX:I.scrollX};O.app.onWindowEvent(O.appBuilder,O.winBuilder,Z,M,O.props,_)}return}const x=s.getInstance(M);if(x!=null&&x.app.onEvent){const O=a.windows.find(_=>_.id===M),Y=O?{width:O.width,height:O.height}:x.app.defaultSize;x.builder.resetForRender(),x.app.onEvent(x.builder,Z,x.props,Y)}}const D={onClose:M=>{const Z=a.windows.find(O=>O.id===M),I=Z?{x:Z.x,y:Z.y,width:Z.width,height:Z.height+xt}:null,x=Z!=null&&Z.openedFromRect?{...Z.openedFromRect}:null;a.closeWindow(M),s.isMultiWindowApp("finder")&&s.destroyWindowForApp("finder",M),s.destroyInstance(M),V(),L(),I&&x&&R(I,x)},onBringToFront:M=>{a.bringToFront(M),V(),L()},onContentEvent:(M,Z)=>{K(M,Z),L()},onZoom:M=>{const Z=a.windows.find(I=>I.id===M);Z&&(a.zoomWindow(Z),V(),L())},scheduleRender:()=>L()},H=new uA(e);H.setZoom(p),H.onEvent(M=>{if(H.setZoom(p),M.type==="mouseMove"&&(f=M.x??0,q=M.y??0),u){(M.type==="mouseDown"||M.type==="keyDown")&&(u=!1,L());return}if(a.isDraggingOrResizing()){if(M.type==="mouseMove"){a.handleMouseMove(M.x,M.y),L();return}if(M.type==="mouseUp"){a.handleMouseUp(),L();return}}if(w&&Ic()){if(M.type==="mouseMove"){w.resetForRender(),NA(w,M.x,M.y,S),L();return}if(M.type==="mouseUp"){w.resetForRender(),UA(w,M.x,M.y,S),l.clearPressed(),L();return}}if(M.type==="mouseMove"){if(m!=null&&m.onTrackMove){const I=a.windows.find(x=>x.id===m.windowId);if(I){const x=fn(M.x-I.x,M.y-I.y);if(m.onTrackMove(x),m.theControl.ref.contrlDefProc===4){const O=Mi(m.theControl),Y=m.theControl.ref.contrlData;Y!=null&&Y.vertical?I.scrollY=O:I.scrollX=O}L();return}}l.handleMouseMove(M.x,M.y);const Z=a.getActiveWindow();if(Z&&Z.id!==it){const I=a.getContentRect(Z),x=a.toContentLocal(Z,M.x,M.y);if(M.x>=I.x&&M.x<I.x+I.w&&M.y>=I.y&&M.y<I.y+I.h){const Y=Z.contentTopInset??0,_=Y>0?M.y<I.y+Y?"fixed":"scrollable":void 0;K(Z.id,{type:"mouseMove",x:x.x,y:x.y,..._!==void 0&&{contentRegion:_}})}else Z.appId==="finder"&&K(Z.id,{type:"mouseMove",x:x.x,y:x.y})}L();return}if(M.type==="mouseDown"){if(d.openMenuIndex!==null){const I=l.hitTest(M.x,M.y);if(!(I!==null&&(I.id.startsWith("menubar-")||I.id==="menubar-bg"))){d.openMenuIndex=null,d.highlightedItem=null,L();return}}const Z=a.findWindowWithPartCode(M.x,M.y);if(Z.partCode===Tr&&Z.theWindow&&Z.theWindow.controlList.length>0){const I=a.toContentLocal(Z.theWindow,M.x,M.y),x=fn(I.x,I.y),O=kl(x,Z.theWindow);if(O.theControl!==null){const Y=a.ensureWindowPort(Z.theWindow,r),_=zi(O.theControl,x,Y);m={onTrackEnd:typeof _=="function"?_:_.onTrackEnd,windowId:Z.theWindow.id,theControl:O.theControl,isScrollBar:!1},L();return}}if((Z.partCode===Rr||Z.partCode===Gr)&&Z.theWindow){const I=Z.theWindow,x=fn(M.x-I.x,M.y-I.y),O=Ml(I,x);if(O.theControl){const Y=a.ensureWindowPort(I,r,{useFrameRect:!0}),_=zi(O.theControl,x,Y,O.partCode),It=typeof _=="function"?_:_.onTrackEnd,te=typeof _=="function"?void 0:_.onTrackMove;m={onTrackEnd:It,onTrackMove:te,windowId:I.id,theControl:O.theControl,isScrollBar:!0},L();return}}l.handleMouseDown(M.x,M.y),L();return}if(M.type==="mouseUp"){if(m!==null){const Z=a.windows.find(x=>x.id===m.windowId);let I=0;if(Z!==void 0){const x=m.isScrollBar?{x:M.x-Z.x,y:M.y-Z.y}:a.toContentLocal(Z,M.x,M.y);if(I=m.onTrackEnd(fn(x.x,x.y)),m.theControl.ref.contrlDefProc===4){const O=Mi(m.theControl),Y=m.theControl.ref.contrlData;Y!=null&&Y.vertical?Z.scrollY=O:Z.scrollX=O}I!==0&&m.theControl.ref.contrlAction&&m.theControl.ref.contrlAction(m.theControl,I)}m=null,L();return}l.handleMouseUp(M.x,M.y),L();return}if(M.type==="doubleClick"){l.handleDoubleClick(M.x,M.y),L();return}if(M.type==="scroll"){const Z=a.windows.slice().reverse().find(I=>{if(I.id===it)return!1;const x=xt+(I.infoBar?20:0),O=I.width+1,Y=x+I.height+1;return M.x>=I.x&&M.x<I.x+O&&M.y>=I.y&&M.y<I.y+Y});if(Z){if(!l.handleScroll(M.x,M.y,M.deltaY??0))if(Z.scrollable){a.handleScroll(Z,M.deltaY??0);const x=M.deltaX??0;x!==0&&a.handleHScroll(Z,x)}else K(Z.id,M);L()}return}if(M.type==="keyDown"||M.type==="keyUp"){const Z=a.getActiveWindow();Z&&Z.id!==it&&K(Z.id,M),L()}});let N=!1,X=!1;function L(){N||X||(N=!0,requestAnimationFrame(et))}function R(M,Z){return X=!0,Qa(r,n,M,Z,4,30,void 0,()=>{X=!1,L()})}function j(){const M=o.get("corner-lt"),Z=o.get("corner-rt"),I=o.get("corner-lb"),x=o.get("corner-rb");M&&Vt(r,M,0,0),Z&&Vt(r,Z,J.width-Z.width,0),I&&Vt(r,I,0,J.height-I.height),x&&Vt(r,x,J.width-x.width,J.height-x.height)}function et(){var Z;if(N=!1,X)return;{const{baseAddr:I,rowBytes:x}=r.portBits;I.fill(B)}if(l.clear(),u){ie(r,0,0,J.width,J.height,"checkers");const I=o.get("icon/happy");I&&Vt(r,I,Math.floor((J.width-I.width)/2),Math.floor((J.height-I.height)/2));const x=o.get("cursor/default-1x");x&&Vt(r,x,f,q),j(),A.flush(n);return}for(const I of a.windows){if(I.appId==="finder"){const O=s.getMultiWindowInstance("finder",I.id);O&&(O.app.getContentHeight&&(O.appBuilder.resetForRender(),O.winBuilder.resetForRender(),I.contentHeight=O.app.getContentHeight(O.appBuilder,O.winBuilder,I.id,O.props,{width:I.width,height:I.height})),O.app.getInfoBar&&(O.appBuilder.resetForRender(),O.winBuilder.resetForRender(),I.infoBar=O.app.getInfoBar(O.appBuilder,O.winBuilder,I.id,O.props)??void 0),O.app.getContentTopInset&&(O.appBuilder.resetForRender(),O.winBuilder.resetForRender(),I.contentTopInset=O.app.getContentTopInset(O.appBuilder,O.winBuilder,I.id,O.props,{width:I.width,height:I.height})));continue}const x=s.getInstance(I.id);if(x!=null&&x.app.getContentHeight&&(x.builder.resetForRender(),I.contentHeight=x.app.getContentHeight(x.builder,x.props,{width:I.width,height:I.height})),x!=null&&x.app.getContentWidth)x.builder.resetForRender(),I.contentWidth=x.app.getContentWidth(x.builder,x.props,{width:I.width,height:I.height});else if(I.scrollable&&((Z=x==null?void 0:x.app.minSize)==null?void 0:Z.width)!=null){const O=ut,Y=I.width-1-O;I.contentWidth=Y>=x.app.minSize.width?Y:Math.max(Y,x.app.minSize.width)}x!=null&&x.app.getInfoBar&&(x.builder.resetForRender(),I.infoBar=x.app.getInfoBar(x.builder,x.props)??void 0),x!=null&&x.app.getContentTopInset&&(x.builder.resetForRender(),I.contentTopInset=x.app.getContentTopInset(x.builder,x.props,{width:I.width,height:I.height}))}for(const I of a.windows){if(I.id===it){const O=s.getMultiWindowInstance("finder",I.id);if(O){const Y=new nn(r,0,$,J.width,J.height-$,0,0,l,void 0,void 0,void 0,0,0,0,0,0);O.appBuilder.resetForRender(),O.winBuilder.resetForRender(),O.app.renderWindow(O.appBuilder,O.winBuilder,Y,it,O.props),O.winBuilder.flushEffects(),l.add({id:"desktop-bg",x:0,y:$,w:J.width,h:J.height-$,onMouseDown:(_,It)=>{K(it,{type:"mouseDown",x:_,y:It+$})},onMouseUp:(_,It)=>{K(it,{type:"mouseUp",x:_,y:It+$})},onDoubleClick:(_,It)=>{K(it,{type:"doubleClick",x:_,y:It+$})},onDrag:(_,It)=>{K(it,{type:"mouseMove",x:_,y:It})}}),Y.release()}continue}a.drawWindowChrome(r,I,o,l,D);const x=a.createWindowContext(I,l,r);if(I.appId==="finder"){const O=s.getMultiWindowInstance("finder",I.id);O&&(O.appBuilder.resetForRender(),O.winBuilder.resetForRender(),O.app.renderWindow(O.appBuilder,O.winBuilder,x,I.id,O.props),O.winBuilder.flushEffects())}else{const O=s.getInstance(I.id);O&&(O.builder.resetForRender(),O.app.render(O.builder,x,O.props),O.builder.flushEffects())}x.release()}w&&(w.resetForRender(),zc(w,r,S)),a.drawDragOutline(r),sc(r,d,o.get("eaten_apple"),J.width,l,L);const M=o.get("cursor/default-1x");M&&Vt(r,M,f,q),j(),A.flush(n)}Ya(o),o.registerAll(du),L();const rt=Date.now();await Js(),Qs(ds);const ct=new fc;g=new cc(ct,o),await g.init(),await Du(g),Object.assign(i,await qc()),si(i.colorMode),C.fs=g,w=s.startApp("finder"),w.setRenderFunction(L),S={sprites:o,fs:g,os:C,openFSNode:(M,Z)=>k(M,Z),scheduleRender:L,screenWidth:J.width,screenHeight:J.height,menubarHeight:$,getOpenFolderWindows:()=>{const M=[];for(const Z of a.windows){if(Z.id===it||Z.appId!=="finder")continue;const I=s.getMultiWindowInstance("finder",Z.id);if(!I)continue;const x=I.props.directoryId;if(!x)continue;const O=a.getContentRect(Z);M.push({windowId:Z.id,directoryId:x,contentX:O.x,contentY:O.y,contentW:O.w,contentH:O.h,scrollY:Z.scrollY,scrollX:Z.scrollX,contentTopInset:Z.contentTopInset})}return M},formatDrive:async()=>{if(await C.showDialog({message:"Erase Mockintosh HD and restore to factory state? This cannot be undone.",buttons:["Erase","Cancel"]})!=="Erase")return;const Z=a.windows.filter(x=>x.appId==="finder"&&x.id!==it).map(x=>x.id);for(const x of Z)a.closeWindow(x),s.isMultiWindowApp("finder")&&s.destroyWindowForApp("finder",x),s.destroyInstance(x);const I=g.readDir(ft);for(const x of I)await g.remove(x.id);await yo(g),L()}};const _t={_finderServices:S},$t=s.createWindowForApp("finder",it,_t);$t&&$t.winBuilder.setRenderFunction(L),a.openWindow({id:it,title:"",x:0,y:$,width:J.width,height:J.height-$,contentHeight:J.height-$,contentWidth:J.width,appId:"finder",props:_t,scrollable:!1,resizable:!1,minWidth:J.width,minHeight:J.height-$,windowKind:"desktop",chromeless:!0}),g.onChange(()=>L()),V(),await Eu(g,c);const Pt=Date.now()-rt,Vo=Math.max(0,Ou-Pt);await new Promise(M=>setTimeout(M,Vo)),u=!1,setInterval(L,ul),L()}Pu();
