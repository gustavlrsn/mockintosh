import{r as K}from"./config-C2QjskFB.js";const jA=256,rA=0,st=1,xs=2,Vs=3,ws=4,ys=5,bs=6,_s=7,ks=8,vs=9,Is=10,Ms=11,zs=12,Cs=13,Bs=14,Ds=15,er="monochrome",Es=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]],nr=new Uint32Array(jA);let xe=new Uint32Array(jA),Pe=er;function ct(A,t,e,n){nr[A]=(t&255)<<16|(e&255)<<8|n&255}function Rs(){ct(rA,255,255,255),ct(st,0,0,0),ct(xs,221,0,0),ct(Vs,0,168,0),ct(ws,0,0,202),ct(ys,0,151,255),ct(bs,255,0,151),ct(_s,255,255,0),ct(ks,255,101,0),ct(vs,54,0,151),ct(Is,101,54,0),ct(Ms,151,101,54),ct(zs,185,185,185),ct(Cs,134,134,134),ct(Bs,69,69,69),ct(Ds,255,170,204);const A=[0,95,135,175,215,255];let t=16;for(let e=0;e<A.length;e++)for(let n=0;n<A.length;n++)for(let i=0;i<A.length;i++)ct(t++,A[e],A[n],A[i]);for(let e=0;t<jA;e++,t++){const n=8+e*10;ct(t,n,n,n)}xe=new Uint32Array(nr)}Rs();function Ss(){return er}function Kt(){return Pe}function jn(A){Pe=A}function Wt(A){if(!Number.isFinite(A))return st;const t=A|0;return t<0?rA:t>=jA?jA-1:t}function Ws(A){return xe[Wt(A)]&16777215}function ir(A){const t=Ws(A);return{r:t>>16&255,g:t>>8&255,b:t&255}}function Ts(A,t,e){return A*.299+t*.587+e*.114}function Ps(A,t,e){let n=rA,i=Number.POSITIVE_INFINITY;for(let r=0;r<xe.length;r++){const s=xe[r],o=s>>16&255,l=s>>8&255,a=s&255,c=o-A,d=l-t,f=a-e,q=c*c+d*d+f*f;if(q<i&&(i=q,n=r,q===0))break}return n}function rr(A,t,e,n,i){const r=Ts(A,t,e),s=(Es[i&3][n&3]+.5)/16*255;return r<s?1:0}function sr(A,t,e){const n=Wt(A);if(n===rA)return 0;if(n===st)return 1;const{r:i,g:r,b:s}=ir(n);return rr(i,r,s,t,e)}function Xt(A){const t=Wt(A);return Pe==="colors"?t:t===rA?rA:st}function wn(A){return Xt(A)}function Jn(A,t,e){const n=Wt(A);return Pe==="colors"?ir(n):sr(n,t,e)===0?{r:255,g:255,b:255}:{r:0,g:0,b:0}}const p=1,P=0;class yn{constructor(t,e){this.clipStack=[],this.imageData=null,this.width=t,this.height=e,this.pixels=new Uint8Array(t*e),this.clip={x:0,y:0,w:t,h:e}}pushClip(t,e,n,i){this.clipStack.push({...this.clip});const r=Math.max(this.clip.x,t),s=Math.max(this.clip.y,e),o=Math.min(this.clip.x+this.clip.w,t+n),l=Math.min(this.clip.y+this.clip.h,e+i);this.clip={x:r,y:s,w:Math.max(0,o-r),h:Math.max(0,l-s)}}popClip(){const t=this.clipStack.pop();t&&(this.clip=t)}getClip(){return{...this.clip}}flush(t){(!this.imageData||this.imageData.width!==this.width||this.imageData.height!==this.height)&&(this.imageData=t.createImageData(this.width,this.height));const e=this.imageData.data,n=this.width*this.height;for(let i=0;i<n;i++){const r=i%this.width,s=i/this.width|0,o=Jn(this.pixels[i],r,s),l=i*4;e[l]=o.r,e[l+1]=o.g,e[l+2]=o.b,e[l+3]=255}t.putImageData(this.imageData,0,0)}captureRegion(t,e,n,i){if(t=Math.max(0,t|0),e=Math.max(0,e|0),n=Math.min(n|0,this.width-t),i=Math.min(i|0,this.height-e),n<=0||i<=0)return"";const r=document.createElement("canvas");r.width=n,r.height=i;const s=r.getContext("2d"),o=s.createImageData(n,i),l=o.data;for(let a=0;a<i;a++)for(let c=0;c<n;c++){const d=(e+a)*this.width+(t+c),f=Jn(this.pixels[d],t+c,e+a),q=(a*n+c)*4;l[q]=f.r,l[q+1]=f.g,l[q+2]=f.b,l[q+3]=255}return s.putImageData(o,0,0),r.toDataURL("image/png")}drawHLine(t,e,n,i=p){if(t=t|0,e=e|0,n=n|0,e<this.clip.y||e>=this.clip.y+this.clip.h)return;const r=Math.max(t,this.clip.x,0),s=Math.min(t+n,this.clip.x+this.clip.w,this.width),o=e*this.width;for(let l=r;l<s;l++)this.pixels[o+l]=i}drawVLine(t,e,n,i=p){if(t=t|0,e=e|0,n=n|0,t<this.clip.x||t>=this.clip.x+this.clip.w)return;const r=Math.max(e,this.clip.y,0),s=Math.min(e+n,this.clip.y+this.clip.h,this.height);for(let o=r;o<s;o++)this.pixels[o*this.width+t]=i}drawRect(t,e,n,i,r=p){this.drawHLine(t,e,n,r),this.drawHLine(t,e+i-1,n,r),this.drawVLine(t,e,i,r),this.drawVLine(t+n-1,e,i,r)}fillRect(t,e,n,i,r=p){t=t|0,e=e|0,n=n|0,i=i|0;const s=Math.max(t,this.clip.x,0),o=Math.max(e,this.clip.y,0),l=Math.min(t+n,this.clip.x+this.clip.w,this.width),a=Math.min(e+i,this.clip.y+this.clip.h,this.height);for(let c=o;c<a;c++){const d=c*this.width;for(let f=s;f<l;f++)this.pixels[d+f]=r}}}const Fs="…",Ls=127,ti=63;function or(A,t){if(!t)return-1;if(t===Fs)return Ls;const e=t.codePointAt(0);return e===void 0?-1:e>=0&&e<=255?e:A.glyphWidths[ti]>0?ti:-1}function lr(A,t){return t<0||t>255?0:A.glyphWidths[t]??0}function Os(A,t){return t*A.glyphStride}function Qs(A,t,e,n){const i=lr(A,t);if(i<1||e<0||e>=i||n<0||n>=A.glyphHeight)return!1;const r=Math.ceil(A.maxWidth/8),s=Os(A,t)+n*r+Math.floor(e/8),o=A.glyphData[s],l=1<<7-e%8;return(o&l)!==0}function Hs(A,t){let e=0,n=0,i=A.glyphHeight;for(let r=0;r<t.length;r++){const s=t[r];if(s===`
`){n=Math.max(n,e),e=0,i+=A.glyphHeight;continue}const o=or(A,s);e+=lr(A,o)+A.spacing,n=Math.max(n,e)}return{width:n,height:i}}const Ot=`// lil: Learning in Layers

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
	menu:"%%FNT1EA0BIAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACECAADAAMAAwADAAMAAwAAAAMAAwAAAAAAAAAAiAwAAoAC"+
	"gAKAAAAAAAAAAAAAAAAAAAAAAAAAAIwgSABIAfwAkACQA/gBIAEgAAAAAAAAAAAAAACQFIABwAKgA4ADgAHAAOAA4AKgA"+
	"cAAgAAAAAAAlCW4AkgCUAGQACAAIABMAFIAkgCMAAAAAAAAAJggAAHgAzADNAGEAzgDMAMwAzAB4AAAAAAAAACcBAACAA"+
	"IAAgAAAAAAAAAAAAAAAAAAAAAAAAAAoAyAAQADAAMAAwADAAMAAwADAAEAAIAAAAAAAKQOAAEAAYABgAGAAYABgAGAAYA"+
	"BAAIAAAAAAACoFAAAgAKgAcACoACAAAAAAAAAAAAAAAAAAAAArBQAAAAAAACAAIAD4ACAAIAAAAAAAAAAAAAAALAIAAAA"+
	"AAAAAAAAAAAAAAAAAwADAAEAAgAAAAC0FAAAAAAAAAAAAAPgAAAAAAAAAAAAAAAAAAAAuAgAAAAAAAAAAAAAAAAAAAADA"+
	"AMAAAAAAAAAALwUIAAgAEAAQACAAIABAAEAAgACAAAAAAAAAADAGAAB4AMwAzADMAMwAzADMAMwAeAAAAAAAAAAxBAAAM"+
	"ABwADAAMAAwADAAMAAwADAAAAAAAAAAMgYAAHgAjAAMAAwAGAAwAGAAwAD8AAAAAAAAADMGAAD8ABgAMAB4AAwADAAMAI"+
	"wAeAAAAAAAAAA0BwAADAAcACwATACMAP4ADAAMAAwAAAAAAAAANQYAAPwAwADAAPgADAAMAAwAjAB4AAAAAAAAADYGAAA"+
	"4AGAAwAD4AMwAzADMAMwAeAAAAAAAAAA3BgAA/AAMAAwADAAYADAAMAAwADAAAAAAAAAAOAYAAHgAzADMAMwAeADMAMwA"+
	"zAB4AAAAAAAAADkGAAB4AMwAzADMAMwAfAAMABgAcAAAAAAAAAA6AgAAAAAAAMAAwAAAAAAAAADAAMAAAAAAAAAAOwIAA"+
	"AAAAADAAMAAAAAAAAAAwADAAEAAgAAAADwFAAAAABgAMABgAMAAYAAwABgAAAAAAAAAAAA9BgAAAAAAAAAA/AAAAPwAAA"+
	"AAAAAAAAAAAAAAPgUAAAAAwABgADAAGAAwAGAAwAAAAAAAAAAAAD8GAAB4AIwADAAYADAAMAAAADAAMAAAAAAAAABACQA"+
	"AAAA+AEEAnICkgKSAmwBAAD4AAAAAAAAAQQYAAHgAzADMAMwA/ADMAMwAzADMAAAAAAAAAEIGAAD4AMwAzADMAPgAzADM"+
	"AMwA+AAAAAAAAABDBgAAeADEAMAAwADAAMAAwADEAHgAAAAAAAAARAYAAPgAzADMAMwAzADMAMwAzAD4AAAAAAAAAEUFA"+
	"AD4AMAAwADAAPAAwADAAMAA+AAAAAAAAABGBQAA+ADAAMAAwADwAMAAwADAAMAAAAAAAAAARwYAAHgAxADAAMAA3ADMAM"+
	"wAzAB4AAAAAAAAAEgGAADMAMwAzADMAPwAzADMAMwAzAAAAAAAAABJAgAAwADAAMAAwADAAMAAwADAAMAAAAAAAAAASgY"+
	"AAAwADAAMAAwADADMAMwAzAB4AAAAAAAAAEsHAADGAMwA2ADwAOAA8ADYAMwAxgAAAAAAAABMBQAAwADAAMAAwADAAMAA"+
	"wADAAPgAAAAAAAAATQoAAIBAwMDhwPPAvsCcwIjAgMCAwAAAAAAAAE4HAACCAMIA4gDyALoAngCOAIYAggAAAAAAAABPB"+
	"gAAeADMAMwAzADMAMwAzADMAHgAAAAAAAAAUAYAAPgAzADMAMwA+ADAAMAAwADAAAAAAAAAAFEGAAB4AMwAzADMAMwAzA"+
	"DMAMwAeAAMAAAAAABSBgAA+ADMAMwAzAD4AMwAzADMAMwAAAAAAAAAUwUAAHAAyADAAOAAcAA4ABgAmABwAAAAAAAAAFQ"+
	"GAAD8ADAAMAAwADAAMAAwADAAMAAAAAAAAABVBgAAzADMAMwAzADMAMwAzADMAHgAAAAAAAAAVgYAAMwAzADMAMwAzADM"+
	"AMwAyADwAAAAAAAAAFcKAADMwMzAzMDMwMzAzMDMwMyA/wAAAAAAAABYBgAAzADMAMwAzAB4AMwAzADMAMwAAAAAAAAAW"+
	"QYAAMwAzADMAMwAeAAwADAAMAAwAAAAAAAAAFoGAAD8AAwADAAYADAAYADAAMAA/AAAAAAAAABbA+AAwADAAMAAwADAAM"+
	"AAwADAAMAA4AAAAAAAXAWAAIAAQABAACAAIAAQABAACAAIAAAAAAAAAF0D4ABgAGAAYABgAGAAYABgAGAAYADgAAAAAAB"+
	"eBQAAIABQAIgAAAAAAAAAAAAAAAAAAAAAAAAAXwgAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAAGADgABAACAAAAAAAAAA"+
	"AAAAAAAAAAAAAAAAAABhBgAAAAAAAHgAjAB8AMwAzADMAHwAAAAAAAAAYgYAAMAAwAD4AMwAzADMAMwAzAD4AAAAAAAAA"+
	"GMFAAAAAAAAcADIAMAAwADAAMgAcAAAAAAAAABkBgAADAAMAHwAzADMAMwAzADMAHwAAAAAAAAAZQYAAAAAAAB4AMwAzA"+
	"D8AMAAxAB4AAAAAAAAAGYFAAA4AGAA8ABgAGAAYABgAGAAYAAAAAAAAABnBgAAAAAAAHwAzADMAMwAzADMAHwADACMAHg"+
	"AaAYAAMAAwAD4AMwAzADMAMwAzADMAAAAAAAAAGkCAADAAAAAwADAAMAAwADAAMAAwAAAAAAAAABqBQAAGAAAABgAGAAY"+
	"ABgAGAAYABgAGACYAHAAawYAAMAAwADMANgA8ADgAPAA2ADMAAAAAAAAAGwCAADAAMAAwADAAMAAwADAAMAAwAAAAAAAA"+
	"ABtCgAAAAAAAP+AzMDMwMzAzMDMwMzAAAAAAAAAbgYAAAAAAAD4AMwAzADMAMwAzADMAAAAAAAAAG8GAAAAAAAAeADMAM"+
	"wAzADMAMwAeAAAAAAAAABwBgAAAAAAAPgAzADMAMwAzADMAPgAwADAAAAAcQYAAAAAAAB8AMwAzADMAMwAzAB8AAwADAA"+
	"AAHIFAAAAAAAA2ADgAMAAwADAAMAAwAAAAAAAAABzBQAAAAAAAHAAyADgAHAAOACYAHAAAAAAAAAAdAQAAGAAYADwAGAA"+
	"YABgAGAAYAAwAAAAAAAAAHUGAAAAAAAAzADMAMwAzADMAMwAfAAAAAAAAAB2BgAAAAAAAMwAzADMAMwAzADIAPAAAAAAA"+
	"AAAdwoAAAAAAADMwMzAzMDMwMzAzID/AAAAAAAAAHgGAAAAAAAAzADMAMwAeADMAMwAzAAAAAAAAAB5BgAAAAAAAMwAzA"+
	"DMAMwAzADMAHwADACMAHgAegYAAAAAAAD8AAwAGAAwAGAAwAD8AAAAAAAAAHsDIABAAEAAQABAAIAAQABAAEAAQAAgAAA"+
	"AAAB8AYAAgACAAIAAgACAAIAAgACAAIAAgAAAAAAAfQOAAEAAQABAAEAAIABAAEAAQABAAIAAAAAAAH4GAAAAAAAAZACY"+
	"AAAAAAAAAAAAAAAAAAAAAAB/CAAAAAAAAAAAAAAAAAAAAADbANsAAAAAAAAAgAYgABAAeADMAMwA/ADMAMwAzADMAAAAA"+
	"AAAAIEGEAAgAHgAzADMAPwAzADMAMwAzAAAAAAAAACCBjAASAAAAHgAzADMAPwAzADMAMwAAAAAAAAAgwY0AFgAAAB4AM"+
	"wAzAD8AMwAzADMAAAAAAAAAIQGSAAAAHgAzADMAPwAzADMAMwAzAAAAAAAAACFBjAASAAwAHgAzADMAPwAzADMAMwAAAA"+
	"AAAAAhgkAAH+AzADMAMwA/gDMAMwAzADPgAAAAAAAAIcGAAB4AMQAwADAAMAAwADAAMQAeAAQADAAAACIBSAAEAD4AMAA"+
	"wADwAMAAwADAAPgAAAAAAAAAiQUQACAA+ADAAMAA8ADAAMAAwAD4AAAAAAAAAIoFMABIAAAA+ADAAMAA8ADAAMAA+AAAA"+
	"AAAAACLBUgAAAD4AMAAwADwAMAAwADAAPgAAAAAAAAAjAKAAEAAwADAAMAAwADAAMAAwADAAAAAAAAAAI0CQACAAMAAwA"+
	"DAAMAAwADAAMAAwAAAAAAAAACOBGAAkAAAAGAAYABgAGAAYABgAGAAAAAAAAAAjwSQAAAAYABgAGAAYABgAGAAYABgAAA"+
	"AAAAAAJAGAAD4AMwAzADsAMwAzADMAMwA+AAAAAAAAACRBzQAWADCAOIA8gC6AJ4AjgCGAIIAAAAAAAAAkgYgABAAeADM"+
	"AMwAzADMAMwAzAB4AAAAAAAAAJMGEAAgAHgAzADMAMwAzADMAMwAeAAAAAAAAACUBjAASAAAAHgAzADMAMwAzADMAHgAA"+
	"AAAAAAAlQY0AFgAAAB4AMwAzADMAMwAzAB4AAAAAAAAAJYGSAAAAHgAzADMAMwAzADMAMwAeAAAAAAAAACXBgAAAAB0AM"+
	"gAzADcAOwAzABMALgAAAAAAAAAmAYgABAAzADMAMwAzADMAMwAzAB4AAAAAAAAAJkGEAAgAMwAzADMAMwAzADMAMwAeAA"+
	"AAAAAAACaBjAASAAAAMwAzADMAMwAzADMAHgAAAAAAAAAmwZIAAAAzADMAMwAzADMAMwAzAB4AAAAAAAAAJwGEAAgAMwA"+
	"zADMAMwAeAAwADAAMAAAAAAAAACdBgAAwADAAPgAzADMAMwA+ADAAMAAAAAAAAAAngYAAPgAzADMANgAzADMAMwAzADYA"+
	"AAAAAAAAJ8GIAAQAAAAeACMAHwAzADMAMwAfAAAAAAAAACgBhAAIAAAAHgAjAB8AMwAzADMAHwAAAAAAAAAoQYwAEgAAA"+
	"B4AIwAfADMAMwAzAB8AAAAAAAAAKIGNABYAAAAeACMAHwAzADMAMwAfAAAAAAAAACjBgAASAAAAHgAjAB8AMwAzADMAHw"+
	"AAAAAAAAApAYwAEgAMAB4AIwAfADMAMwAzAB8AAAAAAAAAKUKAAAAAAAAf4CMwHzAz8DMAMxAf4AAAAAAAACmBQAAAAAA"+
	"AHAAyADAAMAAwADIAHAAEAAwAAAApwYgABAAAAB4AMwAzAD8AMAAxAB4AAAAAAAAAKgGEAAgAAAAeADMAMwA/ADAAMQAe"+
	"AAAAAAAAACpBjAASAAAAHgAzADMAPwAwADEAHgAAAAAAAAAqgYAAEgAAAB4AMwAzAD8AMAAxAB4AAAAAAAAAKsCAACAAE"+
	"AAAADAAMAAwADAAMAAwAAAAAAAAACsAgAAQACAAAAAwADAAMAAwADAAMAAAAAAAAAArQQAAGAAkAAAAGAAYABgAGAAYAB"+
	"gAAAAAAAAAK4EAACQAAAAYABgAGAAYABgAGAAYAAAAAAAAACvBgAAdAAYACwADAB8AMwAzADMAHgAAAAAAAAAsAY0AFgA"+
	"AAD4AMwAzADMAMwAzADMAAAAAAAAALEGAAAgABAAAAB4AMwAzADMAMwAeAAAAAAAAACyBgAAEAAgAAAAeADMAMwAzADMA"+
	"HgAAAAAAAAAswYAADAASAAAAHgAzADMAMwAzAB4AAAAAAAAALQGAAA0AFgAAAB4AMwAzADMAMwAeAAAAAAAAAC1BgAAAA"+
	"BIAAAAeADMAMwAzADMAHgAAAAAAAAAtgYAAAAAAAB0AMgA3AD8AOwATAC4AAAAAAAAALcGIAAQAAAAzADMAMwAzADMAMw"+
	"AfAAAAAAAAAC4BhAAIAAAAMwAzADMAMwAzADMAHwAAAAAAAAAuQYwAEgAAADMAMwAzADMAMwAzAB8AAAAAAAAALoGAABI"+
	"AAAAzADMAMwAzADMAMwAfAAAAAAAAAC7BhAAIAAAAMwAzADMAMwAzADMAHwADACMAHgAvAcAAAAAwADAANwA5gDGAMYA5"+
	"gDcAMAAwAAAAL0GAABIAAAAzADMAMwAzADMAMwAfAAMAIwAeAC+BngAAAB4AMwAzAD8AMwAzADMAMwAAAAAAAAAvwYAAH"+
	"gAAAB4AIwAfADMAMwAzAB8AAAAAAAAAMAGSAAwAAAAeADMAMwA/ADMAMwAzAAAAAAAAADBBkgAMAAAAHgAjAB8AMwAzAD"+
	"MAHwAAAAAAAAAwgYAAHgAzADMAMwA/ADMAMwAzADMABgADAAAAMMGAAAAAAAAeACMAHwAzADMAMwAfAAYAAwAAADEBggA"+
	"EAB4AMQAwADAAMAAwADEAHgAAAAAAAAAxQUQACAAAABwAMgAwADAAMAAyABwAAAAAAAAAMYFeAAAAPgAwADAAPAAwADAA"+
	"MAA+AAAAAAAAADHBgAAeAAAAHgAzADMAPwAwADEAHgAAAAAAAAAyAUAAPgAwADAAMAA8ADAAMAAwAD4ADAAGAAAAMkGAA"+
	"AAAAAAeADMAMwA/ADAAMQAeAAYAAwAAADKBPAAAABgAGAAYABgAGAAYABgAGAAAAAAAAAAywQAAAAA8AAAAGAAYABgAGA"+
	"AYABgAAAAAAAAAMwCAAAAAAAAAADAAMAAwADAAMAAwAAAAAAAAADNBgAAYABgAGAAaABwAGAA4ABgAHwAAAAAAAAAzgUA"+
	"AGAAYABoAHAAYADgAGAAYABgAAAAAAAAAM8HCACSAMIA4gDyALoAngCOAIYAggAAAAAAAADQBhAAIAAAAPgAzADMAMwAz"+
	"ADMAMwAAAAAAAAA0QZ4AAAAeADMAMwAzADMAMwAzAB4AAAAAAAAANIGAAAAAHgAAAB4AMwAzADMAMwAeAAAAAAAAADTBk"+
	"QAiAAAAHgAzADMAMwAzADMAHgAAAAAAAAA1AYAAEQAiAAAAHgAzADMAMwAzAB4AAAAAAAAANUJAAB/gMwAzADPAMwAzAD"+
	"MAMwAf4AAAAAAAADWCQAAAAAAAH8AyYDJgM+AyADIgH8AAAAAAAAA1wUQACAAcADIAMAA8AB4ABgAmABwAAAAAAAAANgF"+
	"EAAgAAAAcADIAOAAcAA4AJgAcAAAAAAAAADZBVAAIABwAMgAwADwAHgAGACYAHAAAAAAAAAA2gVQACAAAABwAMgA4ABwA"+
	"DgAmABwAAAAAAAAANsGeAAAAMwAzADMAMwAzADMAMwAeAAAAAAAAADcBgAAAAB4AAAAzADMAMwAzADMAHwAAAAAAAAA3Q"+
	"ZEAIgAAADMAMwAzADMAMwAzAB4AAAAAAAAAN4GAABEAIgAAADMAMwAzADMAMwAfAAAAAAAAADfBkgAAADMAMwAzADMAHg"+
	"AMAAwADAAAAAAAAAA4AYQACAA/AAMABgAMABgAMAAwAD8AAAAAAAAAOEGEAAgAAAA/AAMABgAMABgAMAA/AAAAAAAAADi"+
	"BhAAAAD8AAwAGAAwAGAAwADAAPwAAAAAAAAA4wYAABAAAAD8AAwAGAAwAGAAwAD8AAAAAAAAAOQGKAAQAPwADAAYADAAY"+
	"ADAAMAA/AAAAAAAAADlBigAEAAAAPwADAAYADAAYADAAPwAAAAAAAAA5gUAAHAAyADAAOAAcAA4ABgAmABwAAAAIABAAO"+
	"cFAAAAAAAAcADIAOAAcAA4AJgAcAAAACAAQADoBgAA/AAwADAAMAAwADAAMAAwADAAAAAgAEAA6QQAAGAAYADwAGAAYAB"+
	"gAGAAYAAwAAAAIABAAOoGAAAAAHwA7ADMAMgA3ADMAMwA2AAAAAAAAADrAgAAAAAAAMAAwAAAAMAAwADAAMAAwADAAAAA"+
	"7AYAAAAAAAAwADAAAAAwADAAYADAAMQAeAAAAO0IAAAAAAAAMwBmAMwAZgAzAAAAAAAAAAAAAADuCAAAAAAAAMwAZgAzA"+
	"GYAzAAAAAAAAAAAAAAA7wcAADwAYgBgAPgAYAD4AGAAYgA8AAAAAAAAAPAFAAAwAEgASAAwAAAAAAAAAAAAAAAAAAAAAA"+
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
`;function Us(A,t){let e=t;if(A[e]!=='"')throw new Error(`Expected string literal at ${t}`);e+=1;let n="";for(;e<A.length;){const i=A[e];if(i==="\\"){n+=A[e+1]??"",e+=2;continue}if(i==='"')return[n,e+1];n+=i,e+=1}throw new Error("Unterminated string literal while reading Decker built-ins")}function Ue(A){const t=`${A}:`,e=Ot.indexOf(t);if(e<0)throw new Error(`Could not find built-in Decker font "${A}"`);let n=e+t.length;for(;n<Ot.length&&/\s/.test(Ot[n]);)n+=1;let i="";for(;n<Ot.length;){const[r,s]=Us(Ot,n);for(i+=r,n=s;n<Ot.length&&/\s/.test(Ot[n]);)n+=1;if(Ot[n]!=="+")break;for(n+=1;n<Ot.length&&/\s/.test(Ot[n]);)n+=1}return i}const Zs={body:Ue("body"),menu:Ue("menu"),mono:Ue("mono")};function Ns(A){if(typeof atob=="function")return new Uint8Array(Array.from(atob(A),e=>e.charCodeAt(0)));const t=Buffer.from(A,"base64");return new Uint8Array(t.buffer,t.byteOffset,t.byteLength)}function Ys(A,t){if(!t.startsWith(`%%${A}`))throw new Error(`Invalid ${A} data block`);return Ns(t.slice(6))}function Gs(A,t="unnamed"){if(!A.startsWith("%%FNT0")&&!A.startsWith("%%FNT1"))throw new Error("Expected a %%FNT0 or %%FNT1 Decker font record");const e=A.slice(2,6),n=Ys("FNT",A);if(n.length<3)throw new Error("Decker font payload is too short");const i=Math.max(1,n[0]),r=Math.max(1,n[1]),s=n[2],o=Math.ceil(i/8)*r,l=new Uint8Array(256),a=new Uint8Array(256*o);if(e==="FNT0"){let c=3;for(let d=32;d<128&&!(c>=n.length);d++){const f=n[c++];if(c+o>n.length)break;l[d]=f,a.set(n.subarray(c,c+o),d*o),c+=o}}else{let c=3;for(;c+1<n.length;){const d=n[c++],f=n[c++];if(c+o>n.length)break;l[d]=f,a.set(n.subarray(c,c+o),d*o),c+=o}}return{name:t,maxWidth:i,glyphHeight:r,spacing:s,glyphStride:o,glyphWidths:l,glyphData:a,sourceFormat:e}}const ar=new Map;let Ai=!1;function Ze(A){ar.set(A,Gs(Zs[A],A))}function cr(){Ai||(Ze("body"),Ze("menu"),Ze("mono"),Ai=!0)}function Ks(A="body"){return cr(),ar.get(String(A))??null}function bn(A="body"){const t=Ks(A);if(!t)throw new Error(`Unknown font: ${String(A)}`);return t}function pt(A){return bn(A).glyphHeight}function Ve(A,t={}){const e=pt(A),n=t.lineHeight??e+(t.lineSpacing??0),i=Math.max(1,Math.floor(n));return{glyphHeight:e,lineHeight:i,glyphOffsetY:Math.max(0,i-e)}}function X(A,t="body",e=0){const n=Hs(bn(t),A).width;if(!A||e===0)return n;let i=0;for(let r=0;r<A.length;r++)A[r]!==`
`&&(i+=1);return n+i*e}function Xs(A,t,e,n,i,r,s,o,l,a,c,d,f){if(!l)return;const q=bn(d),h=wn(f),u=0;let m=a;for(let w=0;w<l.length;w++){const M=l[w];if(M===`
`){m=a,c+=q.glyphHeight;continue}const E=or(q,M),x=X(M,d,u)-q.spacing,k=q.glyphHeight;if(E>=0&&x>0){const C=m|0,z=c|0,y=Math.max(0,i-C),b=Math.max(0,r-z),V=Math.min(x,s-C),v=Math.min(k,o-z);for(let F=b;F<v;F++){const W=z+F;if(W<0)continue;const S=(W-n)*t;for(let T=y;T<V;T++)if(Qs(q,E,T,F)){const U=C+T;U>=0&&(A[S+(U-e)]=h)}}}m+=X(M,d,u)}}function $s(){return cr(),Promise.resolve()}function Fe(A,t,e="body",n=0){if(!A)return[""];const i=[],r=A.split(`
`);for(const s of r){if(!s.trim()){i.push("");continue}const o=s.split(" ");let l="";for(const a of o){const c=l?`${l} ${a}`:a;X(c,e,n)>t&&l?(i.push(l),l=a):l=c}l&&i.push(l)}return i}function ae(A,t){return{v:t,h:A}}function N(A,t,e,n){return{top:A,left:t,bottom:e,right:n}}function J(A){return{top:A.top,left:A.left,bottom:A.bottom,right:A.right}}const VA=8,_n=10,kn=33,vn=30,PA=0,ie=1,In=2,Le=3,Mn=4,Z={thePort:null,white:new Uint8Array([0,0,0,0,0,0,0,0]),black:new Uint8Array([255,255,255,255,255,255,255,255]),gray:new Uint8Array([170,85,170,85,170,85,170,85]),ltGray:new Uint8Array([136,34,136,34,136,34,136,34]),dkGray:new Uint8Array([119,221,119,221,119,221,119,221]),arrow:{data:new Uint16Array([0,16384,24576,28672,30720,31744,32256,32512,32640,31744,27648,17920,1536,768,768,0]),mask:new Uint16Array([49152,57344,61440,63488,64512,65024,65280,65408,65472,65504,65024,61184,52992,34688,1920,896]),hotSpot:{v:1,h:1}},screenBits:{baseAddr:new Uint8Array(0),rowBytes:0,bounds:N(0,0,0,0)},randSeed:1,wideOpen:{rgn:{rgnSize:10,rgnBBox:N(-32767,-32767,32767,32767)}},rgnBuf:null,rgnIndex:0,rgnMax:0,thePoly:null,polyMax:0,_fontMeasure:null,_fontDraw:null,_screen:null};function js(A,t){Z._fontMeasure=A,Z._fontDraw=t}function Js(A,t){const e=BigInt(A)*BigInt(t),n=0xffffffffn;return{hiLong:Number(e>>32n&n)|0,loLong:Number(e&n)|0}}function ei(A,t){const e=BigInt(A|0)*BigInt(t|0)>>16n;return Number(e)|0}function dr(A,t){return t===0?A>=0?2147483647:-2147483648:(A<<16)/t|0}function to(A,t,e){const n=A[e&7],i=7-(t&7);return n>>i&1}function Ao(A,t,e){switch(A){case 0:return t;case 1:return t|e;case 2:return t^e;case 3:return t&~e;case 4:return 1-t;case 5:return 1-t|e;case 6:return 1-t^e;case 7:return 1-t&~e;case 8:return t;case 9:return t|e;case 10:return t^e;case 11:return t&~e;case 12:return 1-t;case 13:return 1-t|e;case 14:return 1-t^e;case 15:return 1-t&~e;default:return t}}function eo(A,t,e,n,i){const r=i.visRgn.rgn.rgnBBox;A=Math.max(A,r.left),t=Math.max(t,r.top),e=Math.min(e,r.right),n=Math.min(n,r.bottom);const s=i.clipRgn.rgn.rgnBBox;A=Math.max(A,s.left),t=Math.max(t,s.top),e=Math.min(e,s.right),n=Math.min(n,s.bottom),A=Math.max(A,i.portRect.left),t=Math.max(t,i.portRect.top),e=Math.min(e,i.portRect.right),n=Math.min(n,i.portRect.bottom);const o=i.portBits.bounds;return A=Math.max(A,o.left),t=Math.max(t,o.top),e=Math.min(e,o.right),n=Math.min(n,o.bottom),A>=e||t>=n?null:{left:A,top:t,right:e,bottom:n}}function ni(A,t,e){const n=A.rgn;if(e<n.rgnBBox.top||e>=n.rgnBBox.bottom||t<n.rgnBBox.left||t>=n.rgnBBox.right)return!1;if(!n.scanlines||n.scanlines.length===0)return!0;for(const i of n.scanlines)if(i.y===e){let r=!1;for(const s of i.xs){if(s>t)break;r=!r}return r}return!1}function mt(A,t,e,n,i,r,s){const o=eo(A,t,e,n,s);if(!o)return;const l=s.portBits.baseAddr,a=s.portBits.rowBytes,c=s.portBits.bounds,d=s.visRgn.rgn.scanlines&&s.visRgn.rgn.scanlines.length>0||s.clipRgn.rgn.scanlines&&s.clipRgn.rgn.scanlines.length>0;for(let f=o.top;f<o.bottom;f++){const q=(f-c.top)*a;for(let h=o.left;h<o.right;h++){if(d&&(!ni(s.visRgn,h,f)||!ni(s.clipRgn,h,f)))continue;const u=to(i,h,f),m=q+(h-c.left);l[m]=Ao(r,u,l[m])&1}}}function Lt(A,t,e,n,i,r){mt(A,e,t,e+1,n,i,r)}function we(A,t){return A.v>=t.top&&A.v<t.bottom&&A.h>=t.left&&A.h<t.right}function no(A,t,e){A.top+=e,A.left+=t,A.bottom-=e,A.right-=t}function io(A,t,e){e.top=Math.min(A.top,t.top),e.left=Math.min(A.left,t.left),e.bottom=Math.max(A.bottom,t.bottom),e.right=Math.max(A.right,t.right)}function re(A,t,e){const n=Z.thePort;if(n){if(n.grafProcs&&n.grafProcs.rectProc){e&&(n.fillPat=new Uint8Array(e)),n.grafProcs.rectProc(A,t);return}ro(A,t,e)}}function ro(A,t,e){const n=Z.thePort;if(n&&!(t.top>=t.bottom||t.left>=t.right))switch(A){case PA:{const i=Math.max(1,n.pnSize.h),r=Math.max(1,n.pnSize.v);mt(t.left,t.top,t.right,t.top+r,n.pnPat,n.pnMode,n),mt(t.left,t.bottom-r,t.right,t.bottom,n.pnPat,n.pnMode,n),mt(t.left,t.top+r,t.left+i,t.bottom-r,n.pnPat,n.pnMode,n),mt(t.right-i,t.top+r,t.right,t.bottom-r,n.pnPat,n.pnMode,n);break}case ie:mt(t.left,t.top,t.right,t.bottom,n.pnPat,n.pnMode,n);break;case In:mt(t.left,t.top,t.right,t.bottom,n.bkPat,VA,n);break;case Le:mt(t.left,t.top,t.right,t.bottom,Z.black,_n,n);break;case Mn:{const i=e??n.fillPat;mt(t.left,t.top,t.right,t.bottom,i,VA,n);break}}}function so(A){re(PA,A)}function fA(A){re(ie,A)}function oo(A){re(In,A)}function lo(A){re(Le,A)}function fr(A,t){re(Mn,A,t)}function EA(A){return{rgn:{rgnSize:10,rgnBBox:J(A)}}}function Ne(A){return new Uint8Array(A)}function ii(A){Z._screen=A,Z.screenBits={baseAddr:A.pixels,rowBytes:A.width,bounds:N(0,0,A.height,A.width)},Z.randSeed=1,Z.thePort=null}function ao(A){const t=J(Z.screenBits.bounds);A.visRgn=EA(t),A.clipRgn=EA(N(-32767,-32767,32767,32767)),co(A)}function co(A){Z.thePort=A,A.device=0,A.portBits={baseAddr:Z.screenBits.baseAddr,rowBytes:Z.screenBits.rowBytes,bounds:J(Z.screenBits.bounds)},A.portRect=J(Z.screenBits.bounds),A.visRgn?(A.visRgn.rgn.rgnBBox=J(A.portRect),A.visRgn.rgn.scanlines=void 0):A.visRgn=EA(A.portRect),A.clipRgn?(A.clipRgn.rgn.rgnBBox=J(Z.wideOpen.rgn.rgnBBox),A.clipRgn.rgn.scanlines=void 0):A.clipRgn=EA(J(Z.wideOpen.rgn.rgnBBox)),A.bkPat=Ne(Z.white),A.fillPat=Ne(Z.black),A.pnLoc={v:0,h:0},A.pnSize={v:1,h:1},A.pnMode=VA,A.pnPat=Ne(Z.black),A.pnVis=0,A.txFont=0,A.txFace=0,A.txMode=1,A.txSize=0,A.spExtra=0,A.fgColor=kn,A.bkColor=vn,A.colrBit=0,A.patStretch=0,A.picSave=null,A.rgnSave=null,A.polySave=null,A.grafProcs=null}function Gt(A){Z.thePort=A}function qr(){return Z.thePort}function ur(A){const t=Z.thePort;t&&(t.clipRgn={rgn:{rgnSize:A.rgn.rgnSize,rgnBBox:J(A.rgn.rgnBBox),scanlines:A.rgn.scanlines?A.rgn.scanlines.map(e=>({y:e.y,xs:[...e.xs]})):void 0}})}function fo(A){const t=Z.thePort;if(!t)return;const e=t.clipRgn.rgn;A.rgn.rgnSize=e.rgnSize,A.rgn.rgnBBox=J(e.rgnBBox),A.rgn.scanlines=e.scanlines?e.scanlines.map(n=>({y:n.y,xs:[...n.xs]})):void 0}function qo(A){const t=Z.thePort;t&&(t.clipRgn={rgn:{rgnSize:10,rgnBBox:J(A),scanlines:void 0}})}function uo(){const A=Z._screen?N(0,0,Z._screen.height,Z._screen.width):N(0,0,0,0),t=Z._screen?Z._screen.pixels:new Uint8Array(0),e=Z._screen?Z._screen.width:0;return{device:0,portBits:{baseAddr:t,rowBytes:e,bounds:J(A)},portRect:J(A),visRgn:EA(J(A)),clipRgn:EA(N(-32767,-32767,32767,32767)),bkPat:new Uint8Array(8),fillPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnLoc:{v:0,h:0},pnSize:{v:1,h:1},pnMode:VA,pnPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnVis:0,txFont:0,txFace:0,txMode:1,txSize:0,spExtra:0,fgColor:kn,bkColor:vn,colrBit:0,patStretch:0,picSave:null,rgnSave:null,polySave:null,grafProcs:null}}Z.arrow;function zn(A,t){const e=Z.thePort;e&&(e.pnSize.h=A,e.pnSize.v=t)}function ho(A){const t=Z.thePort;t&&(t.pnMode=A)}function Rt(A){const t=Z.thePort;t&&(t.pnPat=new Uint8Array(A))}function et(){const A=Z.thePort;A&&(A.pnSize={h:1,v:1},A.pnMode=8,A.pnPat=new Uint8Array(Z.black))}function lt(A,t){const e=Z.thePort;e&&(e.pnLoc.h=A,e.pnLoc.v=t)}function mo(A,t){const e=Z.thePort;if(e){if(e.grafProcs&&e.grafProcs.lineProc){e.pnLoc.h,e.pnLoc.v,e.grafProcs.lineProc({h:A,v:t}),e.pnLoc.h=A,e.pnLoc.v=t;return}po(e,{h:A,v:t})}}function eA(A,t){const e=Z.thePort;e&&mo(e.pnLoc.h+A,e.pnLoc.v+t)}function po(A,t){if(A.pnVis<0){A.pnLoc.h=t.h,A.pnLoc.v=t.v;return}const e=A.pnLoc.h,n=A.pnLoc.v,i=t.h,r=t.v,s=Math.max(1,A.pnSize.h),o=Math.max(1,A.pnSize.v);go(e,n,i,r,s,o,A),A.pnLoc.h=i,A.pnLoc.v=r}function go(A,t,e,n,i,r,s){const o=Math.abs(e-A),l=Math.abs(n-t),a=A<e?1:-1,c=t<n?1:-1;let d=o-l,f=A,q=t;const h=(u,m)=>{mt(u,m,u+i,m+r,s.pnPat,s.pnMode,s)};for(;h(f,q),!(f===e&&q===n);){const u=2*d;u>-l&&(d-=l,f+=a),u<o&&(d+=o,q+=c)}}function ye(A){const t=Z.thePort;t&&(t.txFont=A)}function be(A){const t=Z.thePort;t&&(t.txFace=A)}function Nt(A){xo(A,0,A.length)}function xo(A,t,e){const n=Z.thePort;if(!n)return;let i;typeof A=="string"?i=A.slice(t,t+e):i=String.fromCharCode(...A.slice(t,t+e)),Z._fontDraw&&Z._fontDraw(i,n.pnLoc.h,n.pnLoc.v,n);const r=Vo(i);n.pnLoc.h+=r}function Vo(A,t){return Z._fontMeasure?Z._fontMeasure(A):A.length*6}const wo=[0,1144,2289,3435,4583,5734,6888,8047,9210,10380,11556,12739,13930,15130,16340,17560,18792,20036,21294,22566,23853,25157,26478,27818,29179,30560,31964,33392,34846,36327,37837,39378,40951,42560,44205,45889,47615,49385,51202,53070,54991,56970,59009,61113,63287,0,2329,4743,7249,9855,12567,15394,18346,21433,24667,28059,31625,35381,39343,43534,47976,52694,57719,63086,3297,9470,16124,23321,31135,39655,48987,59258,5091,17750,31943,47976,706,21723,46178,9473,43993,20561,7560,9459,33709,28183,19701,5309,41687,18992,65535],yo=[1,1,2,2,2,2,2,2,2,3,3,3,3,4,4,4,5,5,6,7,8,9,11,14,19,28,57,255];function ri(A){let t=A%180;t<0&&(t+=180),t>90&&(t=180-t);let e=128,n=0;t<45||(n=1,t>=64&&(n=yo[t-64]));const r=wo[t]&65535;let s=e<<24|n<<16|r;s=s|0;const o=(s&2147483648)!==0;return s&=2147483647,o&&(s=-s|0),s}const qA=32768;function si(A,t,e,n){n.ovalTop=A.top,n.ovalBot=A.bottom,t<0&&(t=0),e<0&&(e=0);const i=A.right-A.left,r=A.bottom-A.top;t>i&&(t=i),e>r&&(e=r);const s=A.left+A.right>>1;let o=s<<16|0,l=s<<16|0;l=l+qA|0,n.leftEdge=o,n.rightEdge=l,n.oneHalf=qA,n.ovalY=1-e,n.rsqysq=2*e-1,n.squareHi=0,n.squareLo=0;const a=dr(e,t),{hiLong:c,loLong:d}=Js(a,a);n.oddNumHi=c,n.oddNumLo=d;const f=d>>>0>=2147483648?1:0;n.oddBumpLo=d<<1|0,n.oddBumpHi=(c<<1)+f|0}function oi(A,t){if(t<A.ovalTop||t>=A.ovalBot)return;const e=A.ovalY;A.ovalY+=2;let n=A.rsqysq,i=A.squareHi,r=A.squareLo,s=A.oddNumHi,o=A.oddNumLo;const l=A.oddBumpHi,a=A.oddBumpLo;let c=A.leftEdge,d=A.rightEdge;for(;i<n;){d=d+qA|0,c=c-qA|0;const q=r+o|0,h=(r>>>0)+(o>>>0)>4294967295?1:0;r=q,i=i+s+h|0;const u=o+a|0,m=(o>>>0)+(a>>>0)>4294967295?1:0;o=u,s=s+l+m|0}for(;i>n;){d=d-qA|0,c=c+qA|0,o=o-a|0;const q=o>>>0<a>>>0?1:0;s=s-l-q|0,r=r-o|0;const h=r>>>0<o>>>0?1:0;i=i-s-h|0}const f=e+1;n=n-4*f|0,A.rsqysq=n,A.squareHi=i,A.squareLo=r,A.oddNumHi=s,A.oddNumLo=o,A.leftEdge=c,A.rightEdge=d}function Mt(A){return A>>16}function Cn(A,t,e,n,i,r,s,o,l,a){const c=A,d={ovalTop:0,ovalBot:0,ovalY:0,rsqysq:0,squareHi:0,squareLo:0,oddNumHi:0,oddNumLo:0,oddBumpHi:0,oddBumpLo:0,leftEdge:0,rightEdge:0,oneHalf:qA};si(A,t,e,d);let f=null;if(n){const W=Math.max(1,a.pnSize.h),S=Math.max(1,a.pnSize.v),T=A.top+S,U=A.bottom-S,Y=A.left+W,R=A.right-W;Y<R&&T<U&&(f={ovalTop:T,ovalBot:U,ovalY:0,rsqysq:0,squareHi:0,squareLo:0,oddNumHi:0,oddNumLo:0,oddBumpHi:0,oddBumpLo:0,leftEdge:0,rightEdge:0,oneHalf:qA},si({top:T,left:Y,bottom:U,right:R},Math.max(0,t-2*W),Math.max(0,e-2*S),f))}const q=A.right-A.left,h=A.bottom-A.top,u=A.top+A.bottom>>1,m=A.left+A.right>>1,w=d.ovalTop+(e>>1),M=A.bottom-A.top-e+w;let E=0,x=0,k=0,C=0,z=0,y=0,b=!1;const V=i<360;if(V){const W=dr(q,h);k=ei(ri(r),W),C=ei(ri(s),W);const S=m<<16|0,T=h>>1;E=S-k*T|0,x=S-C*T|0,z=r<180?r-90:-(270-r),y=s<180?s-90:-(270-s),i>180?b=!1:i<180?b=z>=0&&y>=0:b=r===90}let v=d.ovalTop;const F=d.ovalBot;for(;v<F;){if((v<w||v>=M)&&(oi(d,v),f&&oi(f,v)),V&&v===u){if(z=-z,y=-y,b=!1,!(i>180)){if(i<180){if(z>=0&&y>=0)break}else if(r===270)break}const R=E;E=x,x=R;const O=k;k=C,C=O}if(v<c.top||b){E=E+k|0,x=x+C|0,v++;continue}let S=Mt(d.leftEdge),T=Mt(d.rightEdge);const U=Mt(E),Y=Mt(x);if(V&&(z<0&&U>S&&(S=U),y<0&&Y<T&&(T=Y)),V){if(f){let R=Mt(f.leftEdge),O=Mt(f.rightEdge);y<0&&Y<R&&(R=Y),z<0&&U>O&&(O=U),S<T?(Lt(S,R,v,o,l,a),Lt(O,T,v,o,l,a)):z<0&&y<0&&i>180&&(R===T&&Lt(Mt(f.leftEdge),R,v,o,l,a),Lt(Mt(d.leftEdge),R,v,o,l,a),Lt(O,Mt(d.rightEdge),v,o,l,a))}else if(S<T)Lt(S,T,v,o,l,a);else if(z<0&&y<0&&i>180){const R=Mt(d.leftEdge),O=Mt(d.rightEdge);Lt(R,T,v,o,l,a),Lt(S,O,v,o,l,a)}}else if(!f)S<T&&Lt(S,T,v,o,l,a);else{const R=Mt(f.leftEdge),O=Mt(f.rightEdge);S<R&&Lt(S,R,v,o,l,a),O<T&&Lt(O,T,v,o,l,a)}E=E+k|0,x=x+C|0,v++}}function bo(A,t,e,n){const i=A.right-A.left,r=A.bottom-A.top;i<=0||r<=0||Cn(A,i,r,!1,360,0,360,t,e,n)}function _o(A,t){const e=A.right-A.left,n=A.bottom-A.top;e<=0||n<=0||Cn(A,e,n,!0,360,0,360,t.pnPat,t.pnMode,t)}function Bn(A,t,e,n,i,r,s){const o=A.right-A.left,l=A.bottom-A.top;if(o<=0||l<=0)return;let a=t%360;a<0&&(a+=360);let c=(a+e)%360;c<0&&(c+=360),Cn(A,o,l,n,e,a,c,i,r,s)}function hr(A,t,e){switch(A){case ie:return{pat:t.pnPat,mode:t.pnMode};case In:return{pat:t.bkPat,mode:VA};case Le:return{pat:Z.black,mode:_n};case Mn:return{pat:t.fillPat,mode:VA};default:return{pat:t.pnPat,mode:t.pnMode}}}function mr(A,t,e,n,i){const r=Z.thePort;if(r){if(r.grafProcs&&r.grafProcs.arcProc){r.grafProcs.arcProc(A,t,e,n);return}ko(A,t,e,n)}}function ko(A,t,e,n,i){const r=Z.thePort;if(!r)return;const s=A===PA,{pat:o,mode:l}=hr(A,r);if(n===0)return;let a=e,c=n;if(c<0&&(a+=c,c=-c),c>=360){s?_o(t,r):bo(t,o,l,r);return}Bn(t,a,c,s,o,l,r)}function vo(A,t,e){mr(PA,A,t,e)}function Io(A,t,e){mr(ie,A,t,e)}function Mo(A,t,e,n){const i=Math.max(1,n.pnSize.h),r=Math.max(1,n.pnSize.v);Math.min(t/2,(A.right-A.left)/2),Math.min(e/2,(A.bottom-A.top)/2);const s=[{r:{top:A.top,left:A.left,bottom:A.top+e,right:A.left+t},start:180,arc:90},{r:{top:A.top,left:A.right-t,bottom:A.top+e,right:A.right},start:270,arc:90},{r:{top:A.bottom-e,left:A.right-t,bottom:A.bottom,right:A.right},start:0,arc:90},{r:{top:A.bottom-e,left:A.left,bottom:A.bottom,right:A.left+t},start:90,arc:90}];for(const a of s)Bn(a.r,a.start,a.arc,!0,n.pnPat,n.pnMode,n);const o=Math.floor(t/2),l=Math.floor(e/2);mt(A.left+o,A.top,A.right-o,A.top+r,n.pnPat,n.pnMode,n),mt(A.left+o,A.bottom-r,A.right-o,A.bottom,n.pnPat,n.pnMode,n),mt(A.left,A.top+l,A.left+i,A.bottom-l,n.pnPat,n.pnMode,n),mt(A.right-i,A.top+l,A.right,A.bottom-l,n.pnPat,n.pnMode,n)}function zo(A,t,e,n,i,r){const s=Math.floor(t/2),o=Math.floor(e/2),l=[{r:{top:A.top,left:A.left,bottom:A.top+e,right:A.left+t},start:180,arc:90},{r:{top:A.top,left:A.right-t,bottom:A.top+e,right:A.right},start:270,arc:90},{r:{top:A.bottom-e,left:A.right-t,bottom:A.bottom,right:A.right},start:0,arc:90},{r:{top:A.bottom-e,left:A.left,bottom:A.bottom,right:A.left+t},start:90,arc:90}];for(const a of l)Bn(a.r,a.start,a.arc,!1,n,i,r);mt(A.left,A.top+o,A.right,A.bottom-o,n,i,r),mt(A.left+s,A.top,A.right-s,A.top+o,n,i,r),mt(A.left+s,A.bottom-o,A.right-s,A.bottom,n,i,r)}function Dn(A,t,e,n,i){const r=Z.thePort;if(r){if(r.grafProcs&&r.grafProcs.rRectProc){r.grafProcs.rRectProc(A,t,e,n);return}Co(A,t,e,n)}}function Co(A,t,e,n,i){const r=Z.thePort;if(!r)return;if(A===PA){Mo(t,e,n,r);return}const{pat:s,mode:o}=hr(A,r);zo(t,e,n,s,o,r)}function li(A,t,e){Dn(PA,A,t,e)}function Bo(A,t,e){Dn(ie,A,t,e)}function ai(A,t,e){Dn(Le,A,t,e)}function Do(A){if(!A.scanlines||A.scanlines.length===0)return;let t=32767,e=-32767,n=32767,i=-32767;for(const r of A.scanlines)r.xs.length!==0&&(r.y<t&&(t=r.y),r.y+1>e&&(e=r.y+1),r.xs[0]<n&&(n=r.xs[0]),r.xs[r.xs.length-1]>i&&(i=r.xs[r.xs.length-1]));A.rgnBBox={top:t,left:n,bottom:e,right:i}}function GA(){return{rgn:{rgnSize:10,rgnBBox:{top:0,left:0,bottom:0,right:0}}}}function An(A,t){t.rgn={rgnSize:A.rgn.rgnSize,rgnBBox:J(A.rgn.rgnBBox),scanlines:A.rgn.scanlines?A.rgn.scanlines.map(e=>({y:e.y,xs:[...e.xs]})):void 0}}function Eo(A,t,e,n,i){A.rgn.rgnSize=10,A.rgn.rgnBBox={top:e,left:t,bottom:i,right:n},A.rgn.scanlines=void 0}function pr(A,t){Eo(A,t.left,t.top,t.right,t.bottom)}function ci(A){const t=new Map;if(A.rgn.scanlines&&A.rgn.scanlines.length>0)for(const e of A.rgn.scanlines)t.set(e.y,[...e.xs]);else{const{top:e,left:n,bottom:i,right:r}=A.rgn.rgnBBox;for(let s=e;s<i;s++)t.set(s,[n,r])}return t}function Ro(A){const t=[];A.forEach((r,s)=>{const o=[...r].sort((l,a)=>l-a);o.length>0&&o.length%2===0&&t.push({y:s,xs:o})}),t.sort((r,s)=>r.y-s.y);const e={rgn:{rgnSize:10,rgnBBox:{top:0,left:0,bottom:0,right:0}}};e.rgn.scanlines=t,Do(e.rgn);const n=e.rgn.rgnBBox;let i=!0;for(const r of t)if(r.xs.length!==2||r.xs[0]!==n.left||r.xs[1]!==n.right){i=!1;break}return i&&t.length===n.bottom-n.top&&(e.rgn.scanlines=void 0),e}function So(A,t){function e(s){const o=[];for(let l=0;l+1<s.length;l+=2)o.push([s[l],s[l+1]]);return o}const n=e(A),i=e(t),r=[];for(const[s,o]of n)for(const[l,a]of i){const c=Math.max(s,l),d=Math.min(o,a);c<d&&(r.push(c),r.push(d))}return r.sort((s,o)=>s-o)}function Wo(A,t,e){const n=ci(A),i=ci(t),r=new Map;n.forEach((o,l)=>{const a=i.get(l);if(!a)return;const c=So(o,a);c.length>0&&r.set(l,c)});const s=Ro(r);An(s,e)}const gr=new Map,xr=new Map;function To(A,t){const e=pt(A),n={id:t,name:A,lineHeight:e};gr.set(t,n),xr.set(A,t)}async function Po(){await $s();for(const[A,t]of[["body",3],["menu",4],["mono",5]])To(A,t)}function _e(A){return xr.get(A)??0}function di(A){const t=gr.get(A);return(t==null?void 0:t.name)??null}function St(A,t,e=0){return X(A,t,e)}function Fo(A){A(n=>{const i=Z.thePort,r=i?di(i.txFont)??"body":"body";return X(n,r)},(n,i,r,s)=>{var E,x;const o=di(s.txFont)??"body",{baseAddr:l,rowBytes:a,bounds:c}=s.portBits,d=(E=s.clipRgn)==null?void 0:E.rgn.rgnBBox,f=(x=s.visRgn)==null?void 0:x.rgn.rgnBBox,q=s.portRect,h=Math.max((d==null?void 0:d.left)??c.left,(f==null?void 0:f.left)??c.left,q.left,c.left),u=Math.max((d==null?void 0:d.top)??c.top,(f==null?void 0:f.top)??c.top,q.top,c.top),m=Math.min((d==null?void 0:d.right)??c.right,(f==null?void 0:f.right)??c.right,q.right,c.right),w=Math.min((d==null?void 0:d.bottom)??c.bottom,(f==null?void 0:f.bottom)??c.bottom,q.bottom,c.bottom),M=wn(s.txColor??1);Xs(l,a,c.left,c.top,h,u,m,w,n,i,r,o,M)})}const dA={black:new Uint8Array([255,255,255,255,255,255,255,255]),white:new Uint8Array([0,0,0,0,0,0,0,0]),checkers:new Uint8Array([170,85,170,85,170,85,170,85]),darkCheckers:new Uint8Array([85,170,85,170,85,170,85,170]),stripes:new Uint8Array([255,0,255,0,255,0,255,0]),gray25:new Uint8Array([136,34,136,34,136,34,136,34]),gray50:new Uint8Array([170,85,170,85,170,85,170,85]),gray75:new Uint8Array([119,221,119,221,119,221,119,221])};function En(A){return dA[A]}const Lo=dA.black,Oo=dA.white;function FA(A){return A!==rA?Lo:Oo}function Tt(A,t){const e=qr();Gt(A);const n=t();return e&&Gt(e),n}function se(A){var r,s;const t=(r=A.visRgn)==null?void 0:r.rgn.rgnBBox,e=(s=A.clipRgn)==null?void 0:s.rgn.rgnBBox,n=A.portRect,i=A.portBits.bounds;return{left:Math.max((t==null?void 0:t.left)??i.left,(e==null?void 0:e.left)??i.left,n.left,i.left),top:Math.max((t==null?void 0:t.top)??i.top,(e==null?void 0:e.top)??i.top,n.top,i.top),right:Math.min((t==null?void 0:t.right)??i.right,(e==null?void 0:e.right)??i.right,n.right,i.right),bottom:Math.min((t==null?void 0:t.bottom)??i.bottom,(e==null?void 0:e.bottom)??i.bottom,n.bottom,i.bottom)}}function en(A,t,e,n){const i=se(A);if(t<i.left||t>=i.right||e<i.top||e>=i.bottom)return;const{baseAddr:r,rowBytes:s,bounds:o}=A.portBits;r[(e-o.top)*s+(t-o.left)]=Wt(n)}function Rn(A,t,e,n,i,r){if(n<=0||i<=0)return;const s=se(A),{baseAddr:o,rowBytes:l,bounds:a}=A.portBits,c=Wt(r),d=Math.max(t,s.left),f=Math.max(e,s.top),q=Math.min(t+n,s.right),h=Math.min(e+i,s.bottom);for(let u=f;u<h;u++){const m=(u-a.top)*l;o.fill(c,m+(d-a.left),m+(q-a.left))}}function Vr(A,t,e,n,i,r){if(n<=0||i<=0)return;const s=se(A),{baseAddr:o,rowBytes:l,bounds:a}=A.portBits,c=Wt(r),d=Math.max(t,s.left),f=Math.max(e,s.top),q=Math.min(t+n,s.right),h=Math.min(e+i,s.bottom);for(let u=f;u<h;u++){const m=(u-a.top)*l;for(let w=d;w<q;w++)o[m+(w-a.left)]=sr(c,w,u)}}function nn(A,t,e,n,i){Rn(A,t,e,n,1,i)}function rn(A,t,e,n,i){if(n<=0)return;const r=se(A);if(t<r.left||t>=r.right)return;const{baseAddr:s,rowBytes:o,bounds:l}=A.portBits,a=Wt(i),c=Math.max(e,r.top),d=Math.min(e+n,r.bottom);for(let f=c;f<d;f++)s[(f-l.top)*o+(t-l.left)]=a}function Qo(A,t,e,n,i,r){nn(A,t,e,n,r),nn(A,t,e+i-1,n,r),rn(A,t,e,i,r),rn(A,t+n-1,e,i,r)}function wr(A,t,e,n,i,r){const s=Wt(i);for(let o=0;o<n;o+=2)r?en(A,t,e+o,s):en(A,t+o,e,s)}function sn(A,t,e,n,i,r,s,o,l){const a=Math.max(1,Math.min(Math.floor(r/2),Math.floor(n/2))),c=Math.max(1,Math.min(Math.floor(s/2),Math.floor(i/2)));for(let d=0;d<i;d++){let f=0;if(d<c){const u=(c-d-.5)/c;f=Math.max(0,Math.ceil(a-a*Math.sqrt(Math.max(0,1-u*u))))}else if(d>=i-c){const u=(d-(i-c)+.5)/c;f=Math.max(0,Math.ceil(a-a*Math.sqrt(Math.max(0,1-u*u))))}const q=t+f,h=n-f*2;h<=0||(l?Vr(A,q,e+d,h,1,o):Rn(A,q,e+d,h,1,o))}}function Ho(A,t,e,n,i,r,s,o,l){sn(A,t,e,n,i,r,s,l,!1);const a=n-o*2,c=i-o*2;a<=0||c<=0||sn(A,t+o,e+o,a,c,Math.max(1,r-o*2),Math.max(1,s-o*2),rA,!1)}const ke=[{start:270,arc:90},{start:0,arc:90},{start:90,arc:90},{start:180,arc:90}];function rt(A,t,e,n,i,r){const s=Wt(r);if(s>st){Kt()==="colors"?Rn(A,t,e,n,i,s):Vr(A,t,e,n,i,s);return}Tt(A,()=>{const o=N(e,t,e+i,t+n);s!==rA?(et(),fA(o)):oo(o)})}function Yt(A,t,e,n,i,r=st){const s=Xt(r);if(Kt()==="colors"&&s>st){Qo(A,t,e,n,i,s);return}Tt(A,()=>{et(),Rt(FA(s)),so(N(e,t,e+i,t+n)),et()})}function yr(A,t,e,n,i){Tt(A,()=>{et(),lo(N(e,t,e+i,t+n))})}function nA(A,t,e,n,i,r){Tt(A,()=>{const s=typeof r=="string"?En(r):r;fr(N(e,t,e+i,t+n),s)})}function Uo(A,t,e,n,i,r,s,o=st){const l=Wt(o);if(l>st){sn(A,t,e,n,i,r,s,l,Kt()!=="colors");return}Tt(A,()=>{et(),Rt(FA(l));const a=Math.floor(r/2),c=Math.floor(s/2),d=[N(e,t,e+s,t+r),N(e,t+n-r,e+s,t+n),N(e+i-s,t+n-r,e+i,t+n),N(e+i-s,t,e+i,t+r)];for(let f=0;f<4;f++)Io(d[f],ke[f].start,ke[f].arc);fA(N(e+c,t,e+i-c,t+n)),fA(N(e,t+a,e+c,t+n-a)),fA(N(e+i-c,t+a,e+i,t+n-a)),et()})}function fi(A,t,e,n,i,r,s,o=1,l=st){const a=Xt(l);if(Kt()==="colors"&&a>st){Ho(A,t,e,n,i,r,s,o,a);return}Tt(A,()=>{et(),zn(o,o),Rt(FA(a));const c=Math.floor(r/2),d=Math.floor(s/2),f=Math.max(1,o),q=f,h=[N(e,t,e+s,t+r),N(e,t+n-r,e+s,t+n),N(e+i-s,t+n-r,e+i,t+n),N(e+i-s,t,e+i,t+r)];for(let u=0;u<4;u++)vo(h[u],ke[u].start,ke[u].arc);fA(N(e,t+c,e+f,t+n-c)),fA(N(e+i-f,t+c,e+i,t+n-c)),fA(N(e+d,t,e+i-d,t+q)),fA(N(e+d,t+n-q,e+i-d,t+n)),et()})}function ut(A,t,e,n,i=st){const r=Xt(i);if(Kt()==="colors"&&r>st){nn(A,t,e,n,r);return}Tt(A,()=>{et(),Rt(FA(r)),lt(t,e),eA(n-1,0),et()})}function wA(A,t,e,n,i=st){const r=Xt(i);if(Kt()==="colors"&&r>st){rn(A,t,e,n,r);return}Tt(A,()=>{et(),Rt(FA(r)),lt(t,e),eA(0,n-1),et()})}function xt(A,t,e,n=st){const i=Xt(n);if(Kt()==="colors"&&i>st){en(A,t,e,i);return}Tt(A,()=>{et(),Rt(FA(i)),zn(1,1),lt(t,e),eA(0,0),et()})}function br(A,t,e,n,i=st){const r=Xt(i);if(Kt()==="colors"&&r>st){wr(A,t,e,n,r,!1);return}const s=new Uint8Array([170,170,170,170,170,170,170,170]);Tt(A,()=>{et(),Rt(s),lt(t,e),eA(n-1,0),et()})}function Zo(A,t,e,n,i=st){const r=Xt(i);if(Kt()==="colors"&&r>st){wr(A,t,e,n,r,!0);return}const s=new Uint8Array([170,170,170,170,170,170,170,170]);Tt(A,()=>{et(),Rt(s),lt(t,e),eA(0,n-1),et()})}function _r(A,t,e,n,i,r="darkCheckers"){const s=typeof r=="string"?En(r):r;Tt(A,()=>{et(),ho(_n),Rt(s),lt(t,e),eA(n-1,0),lt(t,e+i-1),eA(n-1,0),lt(t,e+1),eA(0,i-3),lt(t+n-1,e+1),eA(0,i-3),et()})}function No(A,t,e,n,i,r){const s=A.portBits.baseAddr,o=A.portBits.rowBytes,l=A.portBits.bounds,a=se(A),c=Math.max(t,a.left),d=Math.max(e,a.top),f=Math.min(t+n,a.right),q=Math.min(e+i,a.bottom),h=En(r);for(let u=d;u<q;u++){const m=(u-l.top)*o,w=h[u&7];for(let M=c;M<f;M++){const E=w>>7-(M&7)&1,x=m+(M-l.left);s[x]&=E}}}function kr(A,t,e,n,i=st){const r=A,s=r.txColor??st;r.txColor=Xt(i),Tt(A,()=>{lt(e,n),Nt(t)}),r.txColor=s}function bA(A){var a,c;const t=(a=A.visRgn)==null?void 0:a.rgn.rgnBBox,e=(c=A.clipRgn)==null?void 0:c.rgn.rgnBBox,n=A.portRect,i=A.portBits.bounds,r=Math.max((t==null?void 0:t.left)??i.left,(e==null?void 0:e.left)??i.left,n.left,i.left),s=Math.max((t==null?void 0:t.top)??i.top,(e==null?void 0:e.top)??i.top,n.top,i.top),o=Math.min((t==null?void 0:t.right)??i.right,(e==null?void 0:e.right)??i.right,n.right,i.right),l=Math.min((t==null?void 0:t.bottom)??i.bottom,(e==null?void 0:e.bottom)??i.bottom,n.bottom,i.bottom);return{left:r,top:s,right:o,bottom:l}}function Vt(A,t,e,n){e=e|0,n=n|0;const{width:i,height:r,data:s,mask:o}=t,l=A.portBits.baseAddr,a=A.portBits.rowBytes,c=A.portBits.bounds,d=bA(A);for(let f=0;f<r;f++){const q=n+f;if(q<d.top||q>=d.bottom)continue;const h=f*i,u=(q-c.top)*a;for(let m=0;m<i;m++){const w=e+m;if(w<d.left||w>=d.right)continue;const M=h+m;o&&!o[M]||(l[u+(w-c.left)]=Wt(s[M]))}}}function vr(A,t,e,n){e=e|0,n=n|0;const{width:i,height:r,data:s,mask:o}=t,l=A.portBits.baseAddr,a=A.portBits.rowBytes,c=A.portBits.bounds,d=bA(A);for(let f=0;f<r;f++){const q=n+f;if(q<d.top||q>=d.bottom)continue;const h=f*i,u=(q-c.top)*a;for(let m=0;m<i;m++){const w=e+m;if(w<d.left||w>=d.right)continue;const M=h+m;o&&!o[M]||(l[u+(w-c.left)]=s[M]^1)}}}function Yo(A,t,e,n){e=e|0,n=n|0;const{width:i,height:r,mask:s}=t;if(!s)return Vt(A,t,e,n);const o=A.portBits.baseAddr,l=A.portBits.rowBytes,a=A.portBits.bounds,c=bA(A);for(let d=0;d<r;d++){const f=n+d;if(f<c.top||f>=c.bottom)continue;const q=d*i,h=(f-a.top)*l;for(let u=0;u<i;u++){const m=e+u;if(m<c.left||m>=c.right)continue;const w=q+u;if(!s[w])continue;const M=m%4===0&&f%2===0||m%2===0&&m%4!==0&&f%2!==0?1:0;o[h+(m-a.left)]=M}}}function Go(A,t,e,n,i,r,s=1){if(i=i|0,r=r|0,!t.length||e<=0||n<=0)return;const o=A.portBits.baseAddr,l=A.portBits.rowBytes,a=A.portBits.bounds,c=bA(A),d=Xt(s);for(let f=0;f<n;f++){const q=r+f;if(q<c.top||q>=c.bottom)continue;const h=f*e,u=(q-a.top)*l;for(let m=0;m<e;m++){const w=h+m;if(!t[w]||!(m===0||!t[w-1]||m===e-1||!t[w+1]||f===0||!t[(f-1)*e+m]||f===n-1||!t[(f+1)*e+m]))continue;const E=i+m;E<c.left||E>=c.right||(o[u+(E-a.left)]=d)}}}function Ko(A,t,e,n){e=e|0,n=n|0;const{width:i,height:r,data:s}=t,o=A.portBits.baseAddr,l=A.portBits.rowBytes,a=A.portBits.bounds,c=bA(A);for(let d=0;d<r;d++){const f=n+d;if(f<c.top||f>=c.bottom)continue;const q=(f-a.top)*l;for(let h=0;h<i;h++){const u=e+h;if(u<c.left||u>=c.right)continue;const m=(d*i+h)*4;if(s[m+3]<128)continue;const M=s[m],E=s[m+1],x=s[m+2];o[q+(u-a.left)]=Kt()==="colors"?Ps(M,E,x):rr(M,E,x,u,f)}}}function Xo(A,t,e,n,i,r){const s=A.portBits.baseAddr,o=A.portBits.rowBytes,l=A.portBits.bounds,a=bA(A),c=Math.max(0,a.left-i),d=Math.max(0,a.top-r),f=Math.min(e,a.right-i),q=Math.min(n,a.bottom-r);if(c>=f||d>=q)return;const h=f-c;for(let u=d;u<q;u++)s.set(t.subarray(u*e+c,u*e+c+h),(r+u-l.top)*o+(i+c-l.left))}function qi(A,t,e,n,i,r){e=e|0,n=n|0,i=i|0,r=r|0;const{width:s,height:o,data:l}=t,a=A.portBits.baseAddr,c=A.portBits.rowBytes,d=A.portBits.bounds,f=bA(A),q=Math.max(e,f.left),h=Math.max(n,f.top),u=Math.min(e+i,f.right),m=Math.min(n+r,f.bottom);for(let w=h;w<m;w++){const M=(w-d.top)*c,E=((w-n)%o+o)%o;for(let x=q;x<u;x++){const k=((x-e)%s+s)%s;a[M+(x-d.left)]=Wt(l[E*s+k])}}}const $o=530;function ht(A=""){return{value:A,cursorPos:A.length,selectionStart:0,selectionEnd:0,focused:!1,_lastEditTime:Date.now()}}function Zt(A){return A.selectionStart!==A.selectionEnd}function on(A){return A.selectionStart<=A.selectionEnd?[A.selectionStart,A.selectionEnd]:[A.selectionEnd,A.selectionStart]}function Ct(A){A.selectionStart=A.cursorPos,A.selectionEnd=A.cursorPos}function ce(A){if(!Zt(A))return!1;const[t,e]=on(A);return A.value=A.value.slice(0,t)+A.value.slice(e),A.cursorPos=t,Ct(A),!0}function jo(A){A.selectionStart=0,A.selectionEnd=A.value.length,A.cursorPos=A.value.length}function Sn(A){A._lastEditTime=Date.now()}function Wn(A,t,e="body"){if(t<=0)return 0;for(let n=1;n<=A.length;n++){const i=X(A.substring(0,n),e),r=n>0?X(A.substring(0,n-1),e):0,s=r+(i-r)/2;if(t<s)return n-1}return A.length}function Jo(A,t){let e=t,n=t;for(;e>0&&A[e-1]!==" ";)e--;for(;n<A.length&&A[n]!==" ";)n++;return[e,n]}function ve(A,t,e,n=!1,i=!1,r=!1){const s=i||r;if(Sn(A),s&&(t==="a"||t==="A"))return jo(A),!0;if(s&&(t==="c"||t==="C"))return!1;if(s&&(t==="x"||t==="X"))return ce(A);if(t==="Backspace")return Zt(A)?ce(A):A.cursorPos>0?(A.value=A.value.slice(0,A.cursorPos-1)+A.value.slice(A.cursorPos),A.cursorPos--,Ct(A),!0):!1;if(t==="Delete")return Zt(A)?ce(A):A.cursorPos<A.value.length?(A.value=A.value.slice(0,A.cursorPos)+A.value.slice(A.cursorPos+1),Ct(A),!0):!1;if(t==="ArrowLeft"){if(s)return n?(A.selectionEnd=0,A.cursorPos=0):(A.cursorPos=0,Ct(A)),!0;if(n)return Zt(A)||(A.selectionStart=A.cursorPos,A.selectionEnd=A.cursorPos),A.cursorPos>0&&(A.cursorPos--,A.selectionEnd=A.cursorPos),!0;if(Zt(A)){const[o]=on(A);return A.cursorPos=o,Ct(A),!0}return A.cursorPos>0?(A.cursorPos--,Ct(A),!0):!1}if(t==="ArrowRight"){if(s)return n?(A.selectionEnd=A.value.length,A.cursorPos=A.value.length):(A.cursorPos=A.value.length,Ct(A)),!0;if(n)return Zt(A)||(A.selectionStart=A.cursorPos,A.selectionEnd=A.cursorPos),A.cursorPos<A.value.length&&(A.cursorPos++,A.selectionEnd=A.cursorPos),!0;if(Zt(A)){const[,o]=on(A);return A.cursorPos=o,Ct(A),!0}return A.cursorPos<A.value.length?(A.cursorPos++,Ct(A),!0):!1}return t==="Home"?n?(Zt(A)||(A.selectionStart=A.cursorPos,A.selectionEnd=A.cursorPos),A.cursorPos=0,A.selectionEnd=0,!0):(A.cursorPos=0,Ct(A),!0):t==="End"?n?(Zt(A)||(A.selectionStart=A.cursorPos,A.selectionEnd=A.cursorPos),A.cursorPos=A.value.length,A.selectionEnd=A.value.length,!0):(A.cursorPos=A.value.length,Ct(A),!0):t.length===1&&!s?(ce(A),A.value=A.value.slice(0,A.cursorPos)+t+A.value.slice(A.cursorPos),A.cursorPos++,Ct(A),!0):!1}function Ir(A,t,e=!1){Sn(A);const n=t-3,i=Wn(A.value,n);return e?(Zt(A)||(A.selectionStart=A.cursorPos),A.selectionEnd=i,A.cursorPos=i):(A.cursorPos=i,Ct(A)),!0}function Mr(A,t){Sn(A);const e=t-3,n=Wn(A.value,e),[i,r]=Jo(A.value,n);return A.selectionStart=i,A.selectionEnd=r,A.cursorPos=r,!0}function zr(A,t){const e=t-3,n=Wn(A.value,e);return n!==A.selectionEnd?(A.selectionEnd=n,A.cursorPos=n,!0):!1}const tl=$o;function Cr(A,t,e="body",n=0,i=0,r){const s=Ve(e,{lineHeight:r,lineSpacing:n}).lineHeight;return Fe(A,t,e,i).length*s}const de="body";function Al(A,t,e,n,i,r=16){Gt(A),A.txColor=p;const s=GA();fo(s),qo(N(n,e,n+r,e+i)),Yt(A,e,n,i,r,p),rt(A,e+1,n+1,i-2,r-2,P);const o=e+3,l=n+1,a=530,c=()=>(Date.now()-t._lastEditTime)%(a*2)<a,d=t.selectionStart!==t.selectionEnd,f=d?Math.min(t.selectionStart,t.selectionEnd):0,q=d?Math.max(t.selectionStart,t.selectionEnd):0;if(ye(_e(de)),be(0),t.focused&&d){const h=o+St(t.value.substring(0,f),de),u=o+St(t.value.substring(0,q),de);rt(A,h,n+2,u-h,r-4,p),f>0&&(lt(o,l),Nt(t.value.substring(0,f))),A.txColor=P,lt(h,l),Nt(t.value.substring(f,q)),A.txColor=p,q<t.value.length&&(lt(u,l),Nt(t.value.substring(q)))}else{lt(o,l),Nt(t.value);const h=t.cursorPos;if(t.focused&&c()){const u=t.value.substring(0,h),m=o+St(u,de);wA(A,m,n+2,r-4,p)}}ur(s)}function JA(A,t,e,n,i){if(!t)return;const r=i.spacing??0,s=wn(i.color??p),o=Ve(i.font,{lineHeight:i.lineHeight,lineSpacing:i.lineSpacing}),l=A,a=l.txColor??p;if(Gt(A),ye(_e(i.font)),be(0),l.txColor=s,r===0&&!t.includes(`
`)){lt(e,n+o.glyphOffsetY),Nt(t),l.txColor=a;return}let c=e,d=n;for(let f=0;f<t.length;f++){const q=t[f];if(q===`
`){c=e,d+=o.lineHeight;continue}lt(c,d+o.glyphOffsetY),Nt(q),c+=St(q,i.font,r)}l.txColor=a}function el(A){const{baseAddr:t,rowBytes:e}=A.portBits,n=t.length/e|0,i=new yn(e,n);return i.pixels=t,i}const nl=15,lA=15,ui=12,kA=15;class te{constructor(t,e,n,i,r,s=0,o=0,l,a,c,d,f=0,q=0,h=0,u,m,w){this.port=t,this._window=w??null,this.bc=el(t),this.ox=e,this.oy=n,this.w=i,this.h=r,this.scrollOffsetY=s,this.scrollOffsetX=o,this._hitRegions=l,this._onStartResize=a,this._minSize=c,this._windowSize=d,this._contentTopInset=f,this._windowScrollY=q,this._windowScrollX=h,this._contentRectX=u??e,this._contentRectY=m??n}getWindow(){return this._window}get width(){return this.w}get height(){return this.h}get scrollY(){return this.scrollOffsetY}get scrollX(){return this.scrollOffsetX}release(){}tx(t){return this.ox+t-this.scrollOffsetX}ty(t){return this.oy+t-this.scrollOffsetY}screenX(t){return this._contentRectX+this.tx(t)}screenY(t){return this._contentRectY+this.ty(t)}setPixel(t,e,n=p){xt(this.port,this.tx(t),this.ty(e),n)}getPixel(t,e){const n=this.tx(t),i=this.ty(e),{baseAddr:r,rowBytes:s,bounds:o}=this.port.portBits,l=(i-o.top)*s+(n-o.left);return l<0||l>=r.length?0:r[l]}drawHLine(t,e,n,i=p){ut(this.port,this.tx(t),this.ty(e),n,i)}drawVLine(t,e,n,i=p){wA(this.port,this.tx(t),this.ty(e),n,i)}drawDottedHLine(t,e,n,i=p){br(this.port,this.tx(t),this.ty(e),n,i)}drawDottedVLine(t,e,n,i=p){Zo(this.port,this.tx(t),this.ty(e),n,i)}drawRect(t,e,n,i,r=p){Yt(this.port,this.tx(t),this.ty(e),n,i,r)}fillRect(t,e,n,i,r=p){rt(this.port,this.tx(t),this.ty(e),n,i,r)}drawRoundRect(t,e,n,i,r,s=p){fi(this.port,this.tx(t),this.ty(e),n,i,r,r,1,s)}fillRoundRect(t,e,n,i,r,s=p){Uo(this.port,this.tx(t),this.ty(e),n,i,r,r,s)}frameRoundRect(t,e,n,i,r,s,o=1,l=p){fi(this.port,this.tx(t),this.ty(e),n,i,r,s,o,l)}fillPattern(t,e,n,i,r){nA(this.port,this.tx(t),this.ty(e),n,i,r)}invertRect(t,e,n,i){yr(this.port,this.tx(t),this.ty(e),n,i)}clear(t=P){rt(this.port,this.ox,this.oy,this.w,this.h,t)}blit(t,e,n){Vt(this.port,t,this.tx(e),this.ty(n))}blitInverted(t,e,n){vr(this.port,t,this.tx(e),this.ty(n))}blitShadowOutline(t,e,n){Yo(this.port,t,this.tx(e),this.ty(n))}blitImageData(t,e,n){Ko(this.port,t,this.tx(e),this.ty(n))}blit1bitPixels(t,e,n,i,r){Xo(this.port,t,e,n,this.tx(i),this.ty(r))}pushClip(t,e,n,i){this.bc.pushClip(this.screenX(t),this.screenY(e),n,i)}popClip(){this.bc.popClip()}drawText(t,e,n,i={}){const r=i.font??"body",s=Ve(r,{lineHeight:i.lineHeight}),o=s.lineHeight,l=i.spacing??0,a=St(t,r,l),c=i.width??a,d=t?t.split(`
`).length:1;let f=e;i.align==="center"?f=e+Math.floor((c-a)/2):i.align==="right"&&(f=e+c-a),Gt(this.port),i.bg!==null&&i.bg!==void 0&&c>0&&o>0&&this.fillRect(e,n,c,i.height??o*d,i.bg),JA(this.port,t,this.tx(f),this.ty(n),{font:r,spacing:l,lineHeight:s.lineHeight,color:i.color??p})}drawButton(t){throw new Error("drawButton is removed. Use NewControl + DrawControls (see docs/control-manager-migration.md).")}drawTextInput(t,e,n,i,r,s){const o=r??16;if(Al(this.port,t,this.tx(e),this.ty(n),i,o),this._hitRegions&&(s!=null&&s.id)){const l=s.onChange;this.hitRegion(s.id,{x:e,y:n,w:i,h:o},{onMouseDown:a=>{Ir(t,a,!1),l==null||l()},onDoubleClick:a=>{Mr(t,a),l==null||l()},onDrag:a=>{const c=a-this.screenX(e);zr(t,c)&&(l==null||l())}})}}drawTextBlock(t){const e=t.font??"body",n=t.spacing??0,i=t.color??p,r=Ve(e,{lineHeight:t.lineHeight,lineSpacing:t.lineSpacing}),s=r.lineHeight,o=Fe(t.text,t.maxWidth,e,n),l=o.length*s,a=this.scrollOffsetY,c=this.scrollOffsetY+this.h;for(let d=0;d<o.length;d++){const f=t.y+d*s;f+s<=a||f>=c||o[d]&&JA(this.port,o[d],this.tx(t.x),this.ty(f),{font:e,spacing:n,lineHeight:r.lineHeight,color:i})}return l}measureTextBlock(t,e,n,i,r,s){return Cr(t,e,n,i,r,s)}scrollArea(t,e,n,i){var y,b;if(!this._hitRegions)return;const{contentHeight:r,scrollOffset:s,onScroll:o,resize:l}=n,a=!!l&&!!this._onStartResize,c=a?kA:0,d=Math.max(0,r-e.h),f=Math.min(s,d),q=nl,h=e.w-q,u=new te(this.port,e.x,e.y,h,e.h,f,0,this._hitRegions,void 0,void 0,void 0,0,0,0,this._contentRectX+e.x,this._contentRectY+e.y);i(u),u.release();const m=e.x+h,w=e.y,M=e.h-c;wA(this.port,m,w,e.h,p);const E=w+lA,x=M-lA*2,k=m+7;rt(this.port,m+1,w,q-1,lA,P),ut(this.port,m,w+lA-1,q,p),xt(this.port,k,w+4,p),ut(this.port,k-1,w+5,3,p),ut(this.port,k-2,w+6,5,p),ut(this.port,k-3,w+7,7,p);const C=w+M-lA;rt(this.port,m+1,C,q-1,lA,P),ut(this.port,m,C,q,p),xt(this.port,k,C+10,p),ut(this.port,k-1,C+9,3,p),ut(this.port,k-2,C+8,5,p),ut(this.port,k-3,C+7,7,p);const z=r>e.h;if(z){nA(this.port,m+1,E,q-1,x,"gray50");const V=Math.max(12,Math.floor(e.h/r*x)),v=E+Math.floor(f/d*(x-V));rt(this.port,m+1,v,q-2,V,P),Yt(this.port,m+1,v,q-2,V,p)}else rt(this.port,m+1,E,q-1,x,P);if(a){const V=m,v=w+M;rt(this.port,V,v,kA,kA,P),ut(this.port,V,v,kA,p),Yt(this.port,V+2,v+6,7,7,p),rt(this.port,V+5,v+3,7,7,P),Yt(this.port,V+5,v+3,7,7,p)}if(this._hitRegions.add({id:`${t}-scroll-up`,x:this._contentRectX+m,y:this._contentRectY+w,w:q,h:lA,onMouseDown:()=>{o(Math.max(0,f-ui))}}),this._hitRegions.add({id:`${t}-scroll-down`,x:this._contentRectX+m,y:this._contentRectY+C,w:q,h:lA,onMouseDown:()=>{o(Math.min(d,f+ui))}}),z){const V=Math.max(12,Math.floor(e.h/r*x));this._hitRegions.add({id:`${t}-scroll-track`,x:this._contentRectX+m,y:this._contentRectY+E,w:q,h:x,onMouseDown:(v,F)=>{const W=F/Math.max(1,x-V);o(Math.max(0,Math.min(d,W*d)))}})}if(this._hitRegions.add({id:`${t}-scroll-wheel`,x:this._contentRectX+e.x,y:this._contentRectY+e.y,w:e.w,h:e.h,onScroll:V=>{o(Math.max(0,Math.min(d,f+V)))}}),a){const V=m,v=w+M,F=this._onStartResize,W=((y=this._windowSize)==null?void 0:y.width)??this.w+2,S=((b=this._windowSize)==null?void 0:b.height)??this.h+20;this._hitRegions.add({id:`${t}-grow-box`,x:this._contentRectX+V,y:this._contentRectY+v,w:kA,h:kA,onMouseDown:(T,U)=>{F(this._contentRectX+V+T,this._contentRectY+v+U,W,S)}})}}drawScrollableContent(t){if(this._contentTopInset<=0||!this._hitRegions)return;const e=this._contentTopInset,n=this.h-e;if(n<=0)return;const i=new te(this.port,this.ox,this.oy+e,this.w,n,this._windowScrollY,this._windowScrollX,this._hitRegions,this._onStartResize,this._minSize,this._windowSize,0,this._windowScrollY,this._windowScrollX,this._contentRectX,this._contentRectY),r=N(e,0,e+n,this.w),s=this.port.clipRgn,o=GA();An(s,o);const l=GA();pr(l,r);const a=GA();Wo(s,l,a),this.port.clipRgn=a,i.pushClip(0,0,this.w,n);try{t(i)}finally{i.popClip(),this.port.clipRgn=s,An(o,s)}i.release()}hitRegion(t,e,n){this._hitRegions&&this._hitRegions.add({id:t,x:this._contentRectX+this.tx(e.x),y:this._contentRectY+this.ty(e.y),w:e.w,h:e.h,...n})}getBitCanvas(){return this.bc}}class Ye{constructor(){this.hooks=[],this.hookIndex=0,this.effects=[],this.effectIndex=0,this._needsRender=!1,this._renderFn=null,this._rafId=null}resetForRender(){this.hookIndex=0,this.effectIndex=0}flushEffects(){for(let t=0;t<this.effects.length;t++){const e=this.effects[t];e&&e.__pendingRun&&(e.cleanup&&e.cleanup(),e.cleanup=e.fn()||void 0,e.__pendingRun=!1)}}destroy(){for(const t of this.effects)t!=null&&t.cleanup&&t.cleanup();this.effects=[],this.hooks=[],this._rafId!==null&&cancelAnimationFrame(this._rafId)}setRenderFunction(t){this._renderFn=t}scheduleRender(){this._needsRender||(this._needsRender=!0,this._rafId=requestAnimationFrame(()=>{var t;this._needsRender=!1,this._rafId=null,(t=this._renderFn)==null||t.call(this)}))}useState(t){const e=this.hookIndex++;this.hooks[e]===void 0&&(this.hooks[e]=t);const n=i=>{const r=this.hooks[e],s=typeof i=="function"?i(r):i;r!==s&&(this.hooks[e]=s,this.scheduleRender())};return[this.hooks[e],n]}useEffect(t,e){const n=this.effectIndex++,i=this.effects[n];i?(!e||!i.deps||!hi(i.deps,e))&&(this.effects[n]={...i,fn:t,deps:e,__pendingRun:!0}):this.effects[n]={fn:t,deps:e,__pendingRun:!0}}useMemo(t,e){const n=this.hookIndex++,i=this.hooks[n];if(!i||!hi(i.deps,e)){const r=t();return this.hooks[n]={value:r,deps:e},r}return i.value}useRef(t){const e=this.hookIndex++;return this.hooks[e]===void 0&&(this.hooks[e]={current:t}),this.hooks[e]}}function hi(A,t){if(A.length!==t.length)return!1;for(let e=0;e<A.length;e++)if(!Object.is(A[e],t[e]))return!1;return!0}class il{constructor(){this.apps=new Map,this.instances=new Map,this.multiApps=new Map,this.multiStates=new Map}register(t){this.apps.set(t.id,t)}get(t){return this.apps.get(t)}getAll(){return Array.from(this.apps.values())}createInstance(t,e,n={}){const i=this.apps.get(t);if(!i)return null;const r=new Ye,s={appId:t,app:i,builder:r,props:n};return this.instances.set(e,s),i.onOpen&&i.onOpen(r,n),s}getInstance(t){return this.instances.get(t)}destroyInstance(t){const e=this.instances.get(t);e&&(e.app.onClose&&e.app.onClose(e.builder),e.builder.destroy(),this.instances.delete(t))}registerMultiWindow(t){this.multiApps.set(t.id,t)}startApp(t){const e=this.multiApps.get(t);if(!e)return null;if(this.multiStates.has(t))return this.multiStates.get(t).appBuilder;const n=new Ye,i={app:e,appBuilder:n,windowBuilders:new Map};return this.multiStates.set(t,i),e.onStart&&e.onStart(n),n}stopApp(t){const e=this.multiStates.get(t);if(e){for(const[n,i]of e.windowBuilders)e.app.onWindowClose&&e.app.onWindowClose(e.appBuilder,i.builder,n),i.builder.destroy();e.windowBuilders.clear(),e.app.onStop&&e.app.onStop(e.appBuilder),e.appBuilder.destroy(),this.multiStates.delete(t)}}createWindowForApp(t,e,n={}){const i=this.multiStates.get(t);if(!i)return null;const r=i.windowBuilders.get(e);if(r)return{app:i.app,appBuilder:i.appBuilder,winBuilder:r.builder,props:r.props};const s=new Ye;return i.windowBuilders.set(e,{builder:s,props:n}),i.app.onWindowOpen&&i.app.onWindowOpen(i.appBuilder,s,e,n),{app:i.app,appBuilder:i.appBuilder,winBuilder:s,props:n}}destroyWindowForApp(t,e){const n=this.multiStates.get(t);if(!n)return;const i=n.windowBuilders.get(e);i&&(n.app.onWindowClose&&n.app.onWindowClose(n.appBuilder,i.builder,e),i.builder.destroy(),n.windowBuilders.delete(e))}getMultiWindowInstance(t,e){const n=this.multiStates.get(t);if(!n)return null;const i=n.windowBuilders.get(e);return i?{app:n.app,appBuilder:n.appBuilder,winBuilder:i.builder,props:i.props}:null}getMultiWindowApp(t){return this.multiStates.get(t)}isMultiWindowApp(t){return this.multiApps.has(t)}}const xA=class xA{constructor(t){this.zoom=1,this.handlers=[],this.lastClickTime=0,this.lastClickX=0,this.lastClickY=0,this._moveRafPending=!1,this.canvasEl=t,this._bind()}setZoom(t){this.zoom=t}onEvent(t){this.handlers.push(t)}removeHandler(t){this.handlers=this.handlers.filter(e=>e!==t)}emit(t){for(const e of this.handlers)e(t)}toLocal(t){const e=this.canvasEl.getBoundingClientRect();return{x:Math.floor((t.clientX-e.left)/this.zoom),y:Math.floor((t.clientY-e.top)/this.zoom)}}_bind(){this.canvasEl.addEventListener("mousedown",t=>{const{x:e,y:n}=this.toLocal(t),i=Date.now(),r=Math.abs(e-this.lastClickX),s=Math.abs(n-this.lastClickY);i-this.lastClickTime<xA.DOUBLE_CLICK_MS&&r<xA.DOUBLE_CLICK_DIST&&s<xA.DOUBLE_CLICK_DIST?(this.emit({type:"doubleClick",x:e,y:n,button:t.button}),this.lastClickTime=0):(this.emit({type:"mouseDown",x:e,y:n,button:t.button}),this.lastClickTime=i,this.lastClickX=e,this.lastClickY=n)}),this.canvasEl.addEventListener("mouseup",t=>{const{x:e,y:n}=this.toLocal(t);this.emit({type:"mouseUp",x:e,y:n,button:t.button})}),this.canvasEl.addEventListener("mousemove",t=>{this._moveRafPending||(this._moveRafPending=!0,requestAnimationFrame(()=>{this._moveRafPending=!1;const{x:e,y:n}=this.toLocal(t);this.emit({type:"mouseMove",x:e,y:n})}))}),this.canvasEl.addEventListener("wheel",t=>{t.preventDefault();const{x:e,y:n}=this.toLocal(t);this.emit({type:"scroll",x:e,y:n,deltaY:t.deltaY,deltaX:t.deltaX})},{passive:!1}),window.addEventListener("keydown",t=>{this.emit({type:"keyDown",key:t.key,code:t.code,shiftKey:t.shiftKey,metaKey:t.metaKey,ctrlKey:t.ctrlKey,altKey:t.altKey})}),window.addEventListener("keyup",t=>{this.emit({type:"keyUp",key:t.key,code:t.code,shiftKey:t.shiftKey,metaKey:t.metaKey,ctrlKey:t.ctrlKey,altKey:t.altKey})})}destroy(){}};xA.DOUBLE_CLICK_MS=500,xA.DOUBLE_CLICK_DIST=4;let ln=xA;const qt=10,rl=11,Ie=20,Me=21,ze=22,Ce=23,Be=129;function ot(A,t,e,n,i,r,s,o,l,a){const d={ref:{nextControl:null,contrlOwner:A,contrlRect:J(t),contrlVis:n,contrlHilite:0,contrlValue:i,contrlMin:r,contrlMax:s,contrlDefProc:o,contrlData:null,contrlAction:null,contrlRfCon:l,contrlTitle:e}};return(a??A.controlList).push(d),d}const zA=10,vA=4,mi=3,pi=16,tA=12,IA=12,De=4,Ae=16;function Br(A,t,e){const n=t.ref,i=n.contrlRect,r=n.contrlData,s=(r==null?void 0:r.vertical)??i.bottom-i.top>=i.right-i.left,o=n.contrlValue,l=n.contrlMin,a=Math.max(n.contrlMax,l+1),c=Ae;if(s){const d=i.left,f=i.top,q=f+c,h=i.bottom-c,u=Math.max(0,h-q);if(e){const C=e("chrome/up");C&&Vt(A,C,d,f);const z=e("chrome/down");z&&Vt(A,z,d,h)}const m=(r==null?void 0:r.contentLength)??a-l,w=(r==null?void 0:r.pageSize)??u,M=m>0?Math.max(12,Math.floor(w/m*u)):u,E=Math.max(0,u-M),x=a-l,k=q+(x>0?Math.floor(o/x*E):0);if(u>0){if(e){const C=e("scrollbar-bg");C?qi(A,C,d,q,c,u):nA(A,d,q,c,u,"gray50")}else nA(A,d,q,c,u,"gray50");wA(A,d+c-1,q,u,p)}x>0&&M>0&&(rt(A,d+1,k,c-2,M,P),Yt(A,d+1,k,c-2,M,p)),wA(A,d,f,i.bottom-f,p)}else{const d=i.top,f=i.left,q=f+c,h=i.right-c,u=Math.max(0,h-q);if(e){const C=e("chrome/left");C&&Vt(A,C,f,d);const z=e("chrome/right");z&&Vt(A,z,h,d)}const m=(r==null?void 0:r.contentLength)??a-l,w=(r==null?void 0:r.pageSize)??u,M=m>0?Math.max(12,Math.floor(w/m*u)):u,E=Math.max(0,u-M),x=a-l,k=q+(x>0?Math.floor(o/x*E):0);if(u>0)if(e){const C=e("scrollbar-bg");C?qi(A,C,q,d+1,u,c-2):nA(A,q,d+1,u,c-2,"gray50")}else nA(A,q,d+1,u,c-2,"gray50");x>0&&M>0&&(rt(A,k,d+1,M,c-2,P),Yt(A,k,d+1,M,c-2,p)),ut(A,f,d,i.right-f,p)}}function sl(A,t,e){for(const n of A.scrollBarControls){const i=n.ref;i.contrlVis&&i.contrlDefProc===4&&Br(t,n,e)}}function an(A,t){const e=qr();Gt(A);try{return t()}finally{e&&Gt(e)}}function ol(A,t){const e=J(t.boundsRect),{top:n,left:i,bottom:r,right:s}=e,o=t.default===!0,l=zA,a=zA;return an(A,()=>{if(et(),o){const w=J(e);no(w,-vA,-vA),zn(mi,mi),Rt(dA.black),li(w,pi,pi),et()}Rt(dA.black),li(e,l,a);const c=1,d=pt("menu"),f=X(t.label,"menu"),q=s-i-2,h=r-n-2,u=i+c+Math.floor((q-f)/2),m=n+c+Math.max(0,Math.floor((h-d)/2));if(t.active&&(Rt(dA.black),Bo(e,l,a)),t.active&&Rt(dA.white),lt(u,m),Nt(t.label),et(),t.disabled){const w=N(n+c,i+c,r-c,s-c);fr(w,dA.gray50)}}),o?N(n-vA,i-vA,r+vA,s+vA):J(e)}function ll(A,t){const{boundsRect:e,label:n,checked:i,disabled:r}=t,{top:s,left:o,bottom:l,right:a}=e,c=pt("body"),d=s+Math.max(0,Math.floor((c-tA)/2));if(Yt(A,o,d,tA,tA,p),rt(A,o+1,d+1,tA-2,tA-2,P),i)for(let q=2;q<tA-2;q++)xt(A,o+q,d+q,p),xt(A,o+tA-1-q,d+q,p);const f=o+tA+De;if(kr(A,n,f,s,p),r){const q=tA+De+X(n,"body");nA(A,o,s,q,c,"gray50")}return J(e)}function al(A,t){const{boundsRect:e,label:n,selected:i,disabled:r}=t,{top:s,left:o}=e,l=pt("body"),a=s+Math.max(0,Math.floor((l-IA)/2)),c=o+Math.floor(IA/2),d=a+Math.floor(IA/2),f=Math.floor(IA/2);pl(A,c,d,f),i&&gl(A,c,d,f-3);const q=o+IA+De;if(kr(A,n,q,s,p),r){const h=IA+De+X(n,"body");nA(A,o,s,h,l,"gray50")}return J(e)}function cl(A,t){const e=t.kind;return e==="checkbox"?ll(A,t):e==="radio"?al(A,t):ol(A,t)}function dl(A){const t=A.contrlDefProc,e=J(A.contrlRect),n=A.contrlHilite===255;if(t===0){const i=A.contrlData;return{kind:"button",boundsRect:e,label:A.contrlTitle,disabled:n,active:A.contrlValue!==0,default:(i==null?void 0:i.default)===!0}}return t===1?{kind:"checkbox",boundsRect:e,label:A.contrlTitle,checked:A.contrlValue!==0,disabled:n}:t===2?{kind:"radio",boundsRect:e,label:A.contrlTitle,selected:A.contrlValue!==0,disabled:n}:{kind:"button",boundsRect:e,label:A.contrlTitle,disabled:n,active:!1}}function fl(A,t,e){const n=A.ref;if(!n.contrlVis)return;if(n.contrlDefProc===4){Br(t,A,e);return}const i=dl(n);cl(t,i)}function uA(A,t){for(const e of A.controlList)fl(e,t)}function Dr(A){return A===0?qt:A===1||A===2?rl:qt}function ql(A,t){const e=A,n=t.controlList;for(let i=n.length-1;i>=0;i--){const r=n[i],s=r.ref;if(!(!s.contrlVis||s.contrlHilite===255)&&we(e,s.contrlRect))return{theControl:r,partCode:Dr(s.contrlDefProc)}}return{theControl:null,partCode:0}}function ul(A,t){const{verticalRect:e,horizontalRect:n,scrollY:i,scrollX:r,contentHeight:s,contentWidth:o,scrollableBodyH:l,contentW:a,scheduleRender:c}=t;if(A.scrollBarControls.length=0,e){const d=Math.max(0,s-l),f=Math.max(0,e.bottom-e.top-2*Ae),q=ot(A,e,"",!0,i,0,d,4,0,A.scrollBarControls);q.ref.contrlData={vertical:!0,trackLengthPx:f,contentLength:s,pageSize:l},q.ref.contrlAction=(h,u)=>{u===Ie?(A.scrollY=Math.max(0,A.scrollY-12),c()):u===Me?(A.scrollY=Math.min(d,A.scrollY+12),c()):u===ze?(A.scrollY=Math.max(0,A.scrollY-l),c()):u===Ce&&(A.scrollY=Math.min(d,A.scrollY+l),c())}}if(n){const d=Math.max(0,o-a),f=Math.max(0,n.right-n.left-2*Ae),q=ot(A,n,"",!0,r,0,d,4,0,A.scrollBarControls);q.ref.contrlData={vertical:!1,trackLengthPx:f,contentLength:o,pageSize:a},q.ref.contrlAction=(h,u)=>{u===Ie?(A.scrollX=Math.max(0,A.scrollX-12),c()):u===Me?(A.scrollX=Math.min(d,A.scrollX+12),c()):u===ze?(A.scrollX=Math.max(0,A.scrollX-a),c()):u===Ce&&(A.scrollX=Math.min(d,A.scrollX+a),c())}}}function Ge(A,t){const e=A.ref,n=e.contrlRect,i=e.contrlData,r=(i==null?void 0:i.vertical)??n.bottom-n.top>=n.right-n.left,s=Ae,o=e.contrlMin,l=Math.max(e.contrlMax,o+1),a=l-o;if(r){const c=n.top+s,d=n.bottom-s,f=Math.max(0,d-c),q=(i==null?void 0:i.contentLength)??a,h=(i==null?void 0:i.pageSize)??f,u=q>0?Math.max(12,Math.floor(h/q*f)):f,m=Math.max(0,f-u),w=t.v,M=m>0?(w-c)/m:0,E=o+M*a;return Math.max(o,Math.min(l,Math.round(E)))}else{const c=n.left+s,d=n.right-s,f=Math.max(0,d-c),q=(i==null?void 0:i.contentLength)??a,h=(i==null?void 0:i.pageSize)??f,u=q>0?Math.max(12,Math.floor(h/q*f)):f,m=Math.max(0,f-u),w=t.h,M=m>0?(w-c)/m:0,E=o+M*a;return Math.max(o,Math.min(l,Math.round(E)))}}function hl(A,t){const e=A.ref,n=e.contrlRect,i=e.contrlData,r=(i==null?void 0:i.vertical)??n.bottom-n.top>=n.right-n.left,s=Ae,o=e.contrlValue,l=e.contrlMin,c=Math.max(e.contrlMax,l+1)-l;if(r){const d=n.top;n.left;const f=d+s,q=n.bottom-s,h=Math.max(0,q-f),u=(i==null?void 0:i.contentLength)??c,m=(i==null?void 0:i.pageSize)??h,w=u>0?Math.max(12,Math.floor(m/u*h)):h,M=Math.max(0,h-w),E=f+(c>0?Math.floor(o/c*M):0),x=E+w,k=t.v;return k<f?Ie:k>=q?Me:k<E?ze:k<x?Be:Ce}else{const d=n.left;n.top;const f=d+s,q=n.right-s,h=Math.max(0,q-f),u=(i==null?void 0:i.contentLength)??c,m=(i==null?void 0:i.pageSize)??h,w=u>0?Math.max(12,Math.floor(m/u*h)):h,M=Math.max(0,h-w),E=f+(c>0?Math.floor(o/c*M):0),x=E+w,k=t.h;return k<f?Ie:k>=q?Me:k<E?ze:k<x?Be:Ce}}function ml(A,t){var i;const e=A.scrollBarControls,n=t;for(let r=e.length-1;r>=0;r--){const s=e[r],o=s.ref;if(o.contrlVis&&we(n,o.contrlRect)){const l=o.contrlDefProc===4?hl(s,n):((i=o.contrlData)==null?void 0:i.partCode)??0;return{theControl:s,partCode:l}}}return{theControl:null,partCode:0}}function gi(A,t,e,n){var o;const i=A.ref,r=i.contrlRect,s=n??(i.contrlDefProc===4?((o=i.contrlData)==null?void 0:o.partCode)??0:Dr(i.contrlDefProc));return i.contrlDefProc===4&&n===Be?(Ke(A,Ge(A,t)),{onTrackEnd(l){const a=Ge(A,l);return Ke(A,a),we(l,r)?Be:0},onTrackMove(l){const a=Ge(A,l);Ke(A,a)}}):(i.contrlDefProc===0&&an(e,()=>{et(),ai(r,zA,zA)}),l=>(i.contrlDefProc===0&&an(e,()=>{et(),ai(r,zA,zA)}),we(l,r)?s:0))}function xi(A){return A.ref.contrlValue}function Ke(A,t){A.ref.contrlValue=t}function pl(A,t,e,n){let i=n,r=0,s=1-n;for(Vi(A,t,e,i,r);i>r;)r++,s<=0?s+=2*r+1:(i--,s+=2*(r-i)+1),Vi(A,t,e,i,r)}function Vi(A,t,e,n,i){xt(A,t+n,e+i,p),xt(A,t-n,e+i,p),xt(A,t+n,e-i,p),xt(A,t-n,e-i,p),xt(A,t+i,e+n,p),xt(A,t-i,e+n,p),xt(A,t+i,e-n,p),xt(A,t-i,e-n,p)}function gl(A,t,e,n){for(let i=-n;i<=n;i++){const r=Math.floor(Math.sqrt(n*n-i*i));for(let s=-r;s<=r;s++)xt(A,t+s,e+i,p)}}const xl=0,Vl=1,Er=3,wl=4,yl=5,bl=6,_l=7,Rr=9,Sr=10,kl=11,gt=20,DA=20,dt=16,aA=1,Qt=11,vt=11,zt=16;class CA{constructor(t){this.windows=[],this.dragging=null,this.resizing=null,this.zoomBoxPressed=null,this.closeBoxPressed=null,this._lastActiveId=null,this.config=t}static isChromeless(t){return t==="alert"||t==="desktop"}static isModal(t){return t==="alert"}openWindow(t){if(this.windows.find(s=>s.id===t.id)){this.bringToFront(t.id);return}const n=t.chromeless??CA.isChromeless(t.windowKind),i=t.modal??CA.isModal(t.windowKind),r={...t,scrollY:t.scrollY??0,scrollX:t.scrollX??0,active:!0,chromeless:n,modal:i,controlList:[],scrollBarControls:[],updateRect:null};r.userBounds={x:r.x,y:r.y,width:r.width,height:r.height},this._insertInLayerOrder(r),this._notifyActiveChange(()=>this._updateActive())}_insertInLayerOrder(t){if(t.windowKind==="desktop"){this.windows.unshift(t);return}if(t.windowKind==="alert"){this.windows.push(t);return}if(t.windowKind==="utility"){const n=this.windows.findIndex(i=>i.windowKind==="alert");n>=0?this.windows.splice(n,0,t):this.windows.push(t);return}const e=this.windows.findIndex(n=>n.windowKind==="utility"||n.windowKind==="alert");e>=0?this.windows.splice(e,0,t):this.windows.push(t)}closeWindow(t){const e=this.windows.find(n=>n.id===t);e&&(e.port=void 0,e.framePort=void 0),this.windows=this.windows.filter(n=>n.id!==t),this._notifyActiveChange(()=>this._updateActive())}bringToFront(t){if(this.hasModalWindow()){const s=this.windows.find(o=>o.id===t);if(s&&!s.modal)return}const e=this.windows.findIndex(s=>s.id===t);if(e<0)return;const n=this.windows[e];this.windows.splice(e,1);const i=this._tierOf(n.windowKind);let r=0;for(let s=0;s<this.windows.length;s++)this._tierOf(this.windows[s].windowKind)<=i&&(r=s+1);this.windows.splice(r,0,n),this._notifyActiveChange(()=>this._updateActive())}_tierOf(t){switch(t){case"desktop":return 0;case"document":case"dialog":return 1;case"utility":return 2;case"alert":return 3}}hasModalWindow(){return this.windows.some(t=>t.modal)}getActiveWindow(){for(let t=this.windows.length-1;t>=0;t--)if(this.windows[t].windowKind!=="desktop")return this.windows[t];return null}_updateActive(){const t=this.getActiveWindow();for(let e=0;e<this.windows.length;e++)this.windows[e].active=this.windows[e].windowKind!=="desktop"&&t!==null&&this.windows[e].id===t.id}_notifyActiveChange(t){const e=this._lastActiveId;t();const n=this.getActiveWindow(),i=(n==null?void 0:n.id)??null;i!==e&&(this._lastActiveId=i,this.config.onActivateChange&&this.config.onActivateChange(e,i))}_maxContentSize(){return{width:this.config.screenWidth-6,height:this.config.screenHeight-this.config.menubarHeight-6}}_defaultStandardBounds(){const t=this._maxContentSize();return{x:3,y:this.config.menubarHeight+3,width:t.width,height:t.height}}zoomWindow(t){const e=t.standardBounds??this._defaultStandardBounds();if(t.x===e.x&&t.y===e.y&&t.width===e.width&&t.height===e.height){const i=t.userBounds??{x:t.x,y:t.y,width:t.width,height:t.height};t.x=i.x,t.y=i.y,t.width=i.width,t.height=i.height}else t.userBounds={x:t.x,y:t.y,width:t.width,height:t.height},t.x=e.x,t.y=e.y,t.width=e.width,t.height=e.height}findWindow(t,e){if(e<this.config.menubarHeight)return{windowId:null,part:"inMenuBar"};for(let n=this.windows.length-1;n>=0;n--){const i=this.windows[n];if(i.windowKind==="desktop")continue;const r=this._hitTestWindow(i,t,e);if(r!==null)return{windowId:i.id,part:r}}return{windowId:null,part:"inDesktop"}}_partToCode(t){return{inMenuBar:Vl,inDesktop:xl,inWindowBackground:kl,inDrag:wl,inGoAway:bl,inZoom:_l,inGrow:yl,inVScroll:Rr,inHScroll:Sr,inContent:Er}[t]}findWindowWithPartCode(t,e){const n=this.findWindow(t,e);return n.windowId===null?{theWindow:null,partCode:this._partToCode(n.part)}:{theWindow:this.windows.find(r=>r.id===n.windowId)??null,partCode:this._partToCode(n.part)}}_hitTestWindow(t,e,n){if(t.chromeless){const c=this.getContentRect(t);return e>=c.x&&e<c.x+c.w&&n>=c.y&&n<c.y+c.h?"inContent":null}const{x:i,y:r,width:s}=t,o=this._headerHeight(t),l=o+t.height;if(e<i||e>=i+s+aA||n<r||n>=r+l+aA)return null;if(t.active&&n>=r&&n<r+gt){const c=i+s-8-vt;if(e>=c&&e<c+vt)return"inZoom"}if(t.active&&n>=r&&n<r+gt){const c=i+8;if(e>=c&&e<c+Qt)return"inGoAway"}if(n>=r&&n<r+gt)return"inDrag";if(t.resizable){const c=i+s-zt,d=r+o+t.height-zt;if(e>=c&&e<c+zt&&n>=d&&n<d+zt)return"inGrow"}if(t.scrollable){const c=i+s-dt-1,d=t.contentTopInset??0,f=r+o+d-1,q=this._scrollableBodyHeight(t);if(e>=c&&e<c+dt&&n>=f&&n<f+q)return"inVScroll"}if(t.scrollable){const c=r+o+this._bodyHeight(t),d=dt;if(n>=c&&n<c+d)return"inHScroll"}const a=this.getContentRect(t);return e>=a.x&&e<a.x+a.w&&n>=a.y&&n<a.y+a.h?"inContent":"inWindowBackground"}_headerHeight(t){return gt+(t.infoBar?DA:0)}_bottomBarHeight(t){return t.scrollable||t.resizable?dt:0}_bodyHeight(t){return t.height-this._bottomBarHeight(t)}_scrollableBodyHeight(t){const e=t.contentTopInset??0;return Math.max(0,this._bodyHeight(t)-e)}getContentRect(t){if(t.chromeless)return{x:t.x,y:t.y,w:t.width,h:t.height};const e=t.scrollable?dt:0,n=this._headerHeight(t),i=this._bodyHeight(t);return{x:t.x+1,y:t.y+n,w:t.width-2-e,h:i}}static makeRegion(t){return{rgn:{rgnSize:10,rgnBBox:J(t)}}}_createOrUpdatePort(t,e,n){const i=e.portRect.right,r=e.portRect.bottom,s=e.portBits.baseAddr,o=e.portBits.rowBytes,l=N(0,0,t.h,t.w),a=N(-t.y,-t.x,r-t.y,i-t.x);return n?(n.portRect=J(l),n.portBits.baseAddr=s,n.portBits.rowBytes=o,n.portBits.bounds=J(a),n.visRgn.rgn.rgnBBox=J(l),n.visRgn.rgn.scanlines=void 0,n.clipRgn.rgn.rgnBBox=J(l),n.clipRgn.rgn.scanlines=void 0,n):{device:0,portBits:{baseAddr:s,rowBytes:o,bounds:J(a)},portRect:J(l),visRgn:CA.makeRegion(l),clipRgn:CA.makeRegion(l),bkPat:new Uint8Array(8),fillPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnLoc:{v:0,h:0},pnSize:{v:1,h:1},pnMode:VA,pnPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnVis:0,txFont:0,txFace:0,txMode:1,txSize:0,spExtra:0,fgColor:kn,bkColor:vn,colrBit:0,patStretch:0,picSave:null,rgnSave:null,polySave:null,grafProcs:e.grafProcs}}ensureWindowPort(t,e,n){if(n!=null&&n.useFrameRect){const r=this._headerHeight(t),s=this._bodyHeight(t),o={x:t.x,y:t.y,w:t.width,h:r+s};return t.framePort=this._createOrUpdatePort(o,e,t.framePort),t.framePort}const i=this.getContentRect(t);return t.port=this._createOrUpdatePort(i,e,t.port),t.port}InvalRect(t,e){if(t.updateRect===null){t.updateRect=J(e);return}const n=N(0,0,0,0);io(t.updateRect,e,n),t.updateRect=J(n)}ValidRect(t,e){t.updateRect=null}BeginUpdate(t){if(t.updateRect===null||!t.port)return;Gt(t.port);const e=t.updateRect,n=N(e.top,e.left,e.bottom,e.right),i=GA();pr(i,n),ur(i)}EndUpdate(t){t.updateRect=null}createWindowContext(t,e,n){this.ensureWindowPort(t,n);const i=t.port,r=this.getContentRect(t),s=(c,d,f,q)=>{this.resizing={windowId:t.id,startX:c,startY:d,startWidth:f,startHeight:q,prospectiveWidth:f,prospectiveHeight:q}},o=t.contentTopInset??0,l=o>0?0:t.scrollY,a=o>0?0:t.scrollX;return new te(i,0,0,r.w,r.h,l,a,e,s,{width:t.minWidth,height:t.minHeight},{width:t.width,height:t.height},o,t.scrollY,t.scrollX,r.x,r.y,t)}toContentLocal(t,e,n){const i=this.getContentRect(t),r=t.contentTopInset??0;return r>0?n<i.y+r?{x:e-i.x,y:n-i.y}:{x:e-i.x+t.scrollX,y:n-i.y-r+t.scrollY}:{x:e-i.x+t.scrollX,y:n-i.y+t.scrollY}}handleMouseMove(t,e){if(this.dragging){const n=t-this.dragging.offsetX,i=Math.max(this.config.menubarHeight,e-this.dragging.offsetY);return this.dragging.prospectiveX=n,this.dragging.prospectiveY=i,{consumed:!0}}if(this.resizing){const n=t-this.resizing.startX,i=e-this.resizing.startY,r=this.windows.find(a=>a.id===this.resizing.windowId),s=(r==null?void 0:r.minWidth)??100,o=(r==null?void 0:r.minHeight)??60,l=this._maxContentSize();return this.resizing.prospectiveWidth=Math.max(s,Math.min(l.width,this.resizing.startWidth+n)),this.resizing.prospectiveHeight=Math.max(o,Math.min(l.height,this.resizing.startHeight+i)),{consumed:!0}}return{consumed:!1}}handleMouseUp(){if(this.dragging){const t=this.windows.find(e=>e.id===this.dragging.windowId);return t&&(t.x=this.dragging.prospectiveX,t.y=this.dragging.prospectiveY,t.userBounds={x:t.x,y:t.y,width:t.width,height:t.height}),this.dragging=null,{consumed:!0}}if(this.resizing){const t=this.windows.find(e=>e.id===this.resizing.windowId);return t&&(t.width=this.resizing.prospectiveWidth,t.height=this.resizing.prospectiveHeight,t.userBounds={x:t.x,y:t.y,width:t.width,height:t.height}),this.resizing=null,{consumed:!0}}return{consumed:!1}}isDraggingOrResizing(){return!!(this.dragging||this.resizing)}getDragOutline(){if(this.dragging){const t=this.windows.find(n=>n.id===this.dragging.windowId);if(!t)return null;const e=this._headerHeight(t);return{x:this.dragging.prospectiveX,y:this.dragging.prospectiveY,width:t.width,height:e+t.height,kind:"drag",windowId:t.id}}if(this.resizing){const t=this.windows.find(n=>n.id===this.resizing.windowId);if(!t)return null;const e=this._headerHeight(t);return{x:t.x,y:t.y,width:this.resizing.prospectiveWidth,height:e+this.resizing.prospectiveHeight,kind:"resize",windowId:t.id}}return null}handleScroll(t,e){const n=this._scrollableBodyHeight(t),i=Math.max(0,t.contentHeight-n);t.scrollY=Math.max(0,Math.min(i,t.scrollY+e))}handleHScroll(t,e){const n=t.scrollable?dt:0,i=t.width-2-n,r=Math.max(0,t.contentWidth-i);t.scrollX=Math.max(0,Math.min(r,t.scrollX+e))}drawWindowChrome(t,e,n,i,r){const s=(y,b,V,v,F)=>rt(t,y,b,V,v,F),o=(y,b,V,v,F=p)=>Yt(t,y,b,V,v,F),l=(y,b,V,v=p)=>ut(t,y,b,V,v),a=(y,b,V,v)=>yr(t,y,b,V,v),c=(y,b,V)=>Vt(t,y,b,V),d=(y,b,V,v)=>{Gt(t),ye(_e(v==null?void 0:v.font)),be(0),lt(b,V),Nt(y)},q=this.hasModalWindow()&&!e.modal;if(e.chromeless){const y=this.getContentRect(e);q||(e.modal&&i.add({id:"modal-scrim",x:0,y:0,w:this.config.screenWidth,h:this.config.screenHeight,onMouseDown:()=>{},onMouseUp:()=>{}}),i.add({id:`win-content-${e.id}`,x:y.x,y:y.y,w:y.w,h:y.h,onMouseDown:(b,V)=>{r.onContentEvent(e.id,{type:"mouseDown",x:b+e.scrollX,y:V+e.scrollY})},onMouseUp:(b,V)=>{r.onContentEvent(e.id,{type:"mouseUp",x:b+e.scrollX,y:V+e.scrollY})},onDoubleClick:(b,V)=>{r.onContentEvent(e.id,{type:"doubleClick",x:b+e.scrollX,y:V+e.scrollY})}}));return}const{x:h,y:u,width:m,title:w,active:M}=e,x=this._headerHeight(e)+e.height;if(!q){i.add({id:`win-bg-${e.id}`,x:h,y:u,w:m+aA,h:x+aA,onMouseDown:()=>{r.onBringToFront(e.id)}});const y=this.getContentRect(e),b=e.contentTopInset??0,V=(W,S)=>b>0&&S<b?W:W+e.scrollX,v=W=>b>0&&W<b?W:b>0?W-b+e.scrollY:W+e.scrollY,F=W=>b>0?W<b?"fixed":"scrollable":void 0;i.add({id:`win-content-${e.id}`,x:y.x,y:y.y,w:y.w,h:y.h,onMouseDown:(W,S)=>{r.onBringToFront(e.id),r.onContentEvent(e.id,{type:"mouseDown",x:V(W,S),y:v(S),contentRegion:F(S)})},onMouseUp:(W,S)=>{r.onContentEvent(e.id,{type:"mouseUp",x:V(W,S),y:v(S),contentRegion:F(S)})},onDoubleClick:(W,S)=>{r.onContentEvent(e.id,{type:"doubleClick",x:V(W,S),y:v(S),contentRegion:F(S)})}}),i.add({id:`win-titlebar-${e.id}`,x:h,y:u,w:m,h:gt,onMouseDown:(W,S)=>{r.onBringToFront(e.id),this.dragging={windowId:e.id,offsetX:W,offsetY:S,prospectiveX:e.x,prospectiveY:e.y}}})}s(h+aA,u+x,m,aA,p),s(h+m,u+aA,aA,x,p),s(h,u,m,x,P),o(h,u,m,x,p),l(h,u+gt-1,m,p);const k=St(w,"menu"),C=h+Math.floor((m-k)/2),z=u+3;if(M){const y=u+4,b=11;s(h+1,y,m-2,b,P);for(let R=0;R<b;R+=2)l(h+1,y+R,m-2,p);const V=h+8,v=u+Math.floor((gt-Qt)/2),F=this.closeBoxPressed===e.id,W=n.get(F?"chrome/closing":"chrome/close");s(V-1,v-1,Qt+2,Qt+2,P),W?c(W,V,v):o(V,v,Qt,Qt,p),q||i.add({id:`win-close-${e.id}`,x:V,y:v,w:Qt,h:Qt,onMouseDown:()=>{this.closeBoxPressed=e.id,r.scheduleRender()},onMouseUp:(R,O)=>{const G=R>=0&&R<Qt&&O>=0&&O<Qt;this.closeBoxPressed=null,G?r.onClose(e.id):r.scheduleRender()}});const S=h+m-8-vt,T=u+Math.floor((gt-vt)/2),U=this.zoomBoxPressed===e.id,Y=n.get("chrome/zoom");s(S-1,T-1,vt+2,vt+2,P),Y?c(Y,S,T):o(S,T,vt,vt,p),U&&a(S+1,T+1,vt-2,vt-2),q||i.add({id:`win-zoom-${e.id}`,x:S,y:T,w:vt,h:vt,onMouseDown:()=>{this.zoomBoxPressed=e.id,r.scheduleRender()},onMouseUp:(R,O)=>{const G=R>=0&&R<vt&&O>=0&&O<vt;this.zoomBoxPressed=null,G&&r.onZoom(e.id),r.scheduleRender()}}),s(C-4,u+1,k+8,gt-2,P)}if(d(w,C,z,{font:"menu"}),e.infoBar&&this._drawInfoBar(t,e),e.scrollable){const y=this._headerHeight(e),b=this._bodyHeight(e),V=this._scrollableBodyHeight(e),v=e.contentTopInset??0,F=e.resizable?zt:0,W=dt,S=e.width-1-W;if(v>0){const R=e.x+e.width-dt;rt(t,R,e.y+y,dt,v,P)}const T=N(y+v-1,e.width-dt,y+v-1+V,e.width),U=N(y+b,0,y+b+dt,e.width-F);ul(e,{verticalRect:T,horizontalRect:U,scrollY:e.scrollY,scrollX:e.scrollX,contentHeight:e.contentHeight,contentWidth:e.contentWidth,scrollableBodyH:V,contentW:S,scheduleRender:r.scheduleRender});const Y=this.ensureWindowPort(e,t,{useFrameRect:!0});sl(e,Y,R=>n.get(R)??null)}e.resizable&&this._drawGrowBox(t,e,n,i,r)}drawDragOutline(t){const e=this.getDragOutline();e&&_r(t,e.x,e.y,e.width,e.height,"darkCheckers")}_drawInfoBar(t,e){const{x:n,y:i,width:r}=e,s=i+gt,o=e.infoBar;if(ut(t,n,s+DA-1,r,p),o.length>0){Gt(t),ye(_e("body")),be(0);const l=Math.floor((r-2)/o.length);for(let a=0;a<o.length;a++){const c=St(o[a],"body"),d=n+1+a*l+Math.floor((l-c)/2);lt(d,s+4),Nt(o[a]),a<o.length-1&&wA(t,n+1+(a+1)*l,s,DA-1,p)}}}_drawGrowBox(t,e,n,i,r){const s=this._headerHeight(e),o=e.x+e.width-zt,l=e.y+s+e.height-zt,a=n.get("chrome/resize");a?Vt(t,a,o,l):(rt(t,o,l,zt,zt,P),ut(t,o,l,zt,p),wA(t,o,l,zt,p)),i.add({id:`win-growbox-${e.id}`,x:o,y:l,w:zt,h:zt,onMouseDown:(c,d)=>{this.resizing={windowId:e.id,startX:o+c,startY:l+d,startWidth:e.width,startHeight:e.height,prospectiveWidth:e.width,prospectiveHeight:e.height}}})}getScrollableBodyHeight(t){return this._bodyHeight(t)}}function Q(A,t,e){const n=atob(e),i=A*t,r=new Uint8Array(i),s=new Uint8Array(i);for(let o=0;o<i;o++){const l=o>>2,a=6-(o&3)*2,c=n.charCodeAt(l)>>a&3;r[o]=c===2?p:P,s[o]=c===0?0:1}return{width:A,height:t,data:r,mask:s}}class vl{constructor(){this.entries=new Map,this.nameIndex=new Map,this.cache=new Map,this.loading=new Map}_key(t,e){return`${t}:${e}`}_nameKey(t,e){return`${t}:${e}`}get(t){return this.cache.get(t)}has(t){return this.cache.has(t)}register(t,e){this.cache.set(t,e)}registerAll(t){for(const[e,n]of Object.entries(t))this.cache.set(e,n)}async load(t,e,n){const i=this.cache.get(t);if(i)return i;const r=this.loading.get(t);if(r)return r;const s=this._loadImage(t,e,n);this.loading.set(t,s);const o=await s;return this.loading.delete(t),this.cache.set(t,o),o}async preload(t){await Promise.all(t.map(e=>this.load(e)))}static fromBits(t,e,n,i=!1){const r=new Uint8Array(t*e),s=new Uint8Array(t*e);if(i){const o=n.length/2;for(let l=0;l<o;l++)r[l]=n[l]?p:P,s[l]=n[o+l]?1:0}else for(let o=0;o<n.length;o++)r[o]=n[o]?p:P,s[o]=1;return{width:t,height:e,data:r,mask:s}}async _loadImage(t,e,n){const r=await(await fetch(t)).blob(),s=await createImageBitmap(r),o=e??s.width,l=n??s.height,c=new OffscreenCanvas(o,l).getContext("2d");c.imageSmoothingEnabled=!1,c.drawImage(s,0,0,o,l),s.close();const f=c.getImageData(0,0,o,l).data,q=new Uint8Array(o*l),h=new Uint8Array(o*l);for(let u=0;u<o*l;u++){const m=u*4;if(f[m+3]<128)q[u]=P,h[u]=0;else{const M=(f[m]+f[m+1]+f[m+2])/3;q[u]=M<128?p:P,h[u]=1}}return{width:o,height:l,data:q,mask:h}}AddResource(t,e,n,i){const r={resType:t,resID:e,name:n,data:i};this.entries.set(this._key(t,e),r),n&&this.nameIndex.set(this._nameKey(t,n),r),this.cache.set(n,i)}AddSpriteResource(t,e,n,i,r,s){const o=Q(i,r,s);this.AddResource(t,e,n,o)}GetResource(t,e){const n=this.entries.get(this._key(t,e));return(n==null?void 0:n.data)??null}GetNamedResource(t,e){const n=this.nameIndex.get(this._nameKey(t,e));return n?n.data:this.cache.get(e)??null}CountResources(t){let e=0;for(const n of this.entries.values())n.resType===t&&e++;return e}GetResourceIDs(t){const e=[];for(const n of this.entries.values())n.resType===t&&e.push(n.resID);return e}RemoveResource(t,e){const n=this._key(t,e),i=this.entries.get(n);i&&(this.entries.delete(n),i.name&&this.nameIndex.delete(this._nameKey(t,i.name)))}}const Il=Q(32,32,"AKqqqqqqqgAKVVVVVVVVoCVVVVVVVVVYJVVVaqlVVViVVVaVVpVVVpVVaWqpaVVWlVWWqqqWVVaVVmqqqqmVVpVZqqqqqmVWlWaqlaqqmVaVZqlVaqqZVpWapVWqqqZWlZqlWqqqplaWapVpqqqplpZqlaaqqqmWlmqVqqqqqZaWaqaqqqqplpZqqqqmqqmWlmqqqpaaqZaVmqqqqpamVpWaqqqqVqZWlWaqqqVamVaVZqqqqWqZVpVZqqqqqmVWlVZqqqqplVaVVZaqqpZVVpVVaWqpaVVWlVVWlVaVVVYlVVVqqVVVWCVVVVVVVVVYClVVVVVVVaAAqqqqqqqqAA=="),Ml=Q(32,32,"AAAAqqoAAAAAACpmpqgAAAACpqmqqoAAAAppmpqaoAAAKqqpqqqoAACmmqqqamoAAqmpmqqqqoAKaqqqmqqqYAmpqqmqmpqgKpqZqqqqqqgpqqlqqapqqCqqqVaqqqqomampVWqqqqqqqqlVVqqqqppqqVVVaqqqqqaZVVVWqqqaqqlVVVWqqqqqqVVVWqqqqmqpVVWqqqqqqmlVWqqqqCaqqVWqqqqoKqqpWqqqqqgpqqmqqqqqqAqaqqqqqqqgCqqqqqqqqqACqqqqqqqqgACqqqqqqqoAACqqqqqqqAAACqqqqqqgAAACqqqqqoAAAAAqqqqoAAAAAACqqgAAAA=="),zl=Q(16,16,"CqqqoCqqqqiqqWqqqqlqqqqlWqqqpVqqqpWWqqqWlqqlVWVapVVlWqqqpaqpaqlqqWqpaqqqqqoqqqqoCqqqoA=="),Cl=Q(32,32,"ACqqqqqqqAACqqqqqqqqgAqqqqqqqqqgKqqqqqqqqqgqqqqWlqqqqKqqqlaVqqqqqqqqlWaqqqqqqqqVZqqqqqqqqqWaqqqqqqqqpZqqqqqqqqqmWqqqqqqqqpZmqqqqqqqqmaaqqqqqqqpZpaqqqqqqqmaZqqqqqqqpZplqqqqqqqmapmqqqqqqpZqmWqqqqqVVVWmVWqqqmZmZqZZmqqqlVVVaZpqqqqqqqqplqqqqqmaqqpmqqqqpZqqqmWqqqqlaqqqlaqqqqlqqqqWqqqqqqqqqqqqqKqqqqqqqqqgqqqqqqqqqqAqqqqqqqqqgAqqqqqqqqoAAKqqqqqqoAA=="),Bl=Q(32,32,"AKqqqqqqqgAKqqqqqqqqoCqqqqqqqqqoKqqqqqqqqqiqqqqWlqqqqqqqqlaVqqqqqqqqlWaqqqqqqqqVZqqqqqqqqqWaqqqqqqqqpZqqqqqqqqqmWqqqqqqqqpZmqqqqqqqqmaaqqqqqqqpZpaqqqqqqqmaZqqqqqqqpZplqqqqqqqmapmqqqqqqpZqmWqqqqqVVVWmVWqqqmZmZqZZmqqqlVVVaZpqqqqqqqqplqqqqqmaqqpmqqqqpZqqqmWqqqqlaqqqlaqqqqlqqqqWqqqqqqqqqqqqqqqqqqqqqqqoqqqqqqqqqqCqqqqqqqqqoCqqqqqqqqqAAqqqqqqqqAA=="),Dl=Q(32,32,"ACqqqqqqqAACqqqqqqqqgAqlVVVVVVqgKlqqqqqqpagpqqqWlqqqaKmqqlaVqqpqpqqqlWaqqpqmqqqVZqqqmqaqqqWaqqqapqqqpZqqqpqmqqqmWqqqmqaqqpZmqqqapqqqmaaqqpqmqqpZpaqqmqaqqmaZqqqapqqpZplqqpqmqqmapmqqmqaqpZqmWqqapqVVVWmVWpqmmZmZqZZmmqalVVVaZpqapqqqqqplqpqmqmaqqpmqmqapZqqqmWqapqlaqqqlapqmqlqqqqWqmqmqqqqqqqpqKaqqqqqqqmgqWqqqqqqlqAqlVVVVVVqgAqqqqqqqqoAAKqqqqqqoAA=="),El=Q(32,32,"ACqqqqqqqAAClVVVVVVWgAlmpqampqlgJqpqampqapgmpqampqammKpqampqampqpqampqampqaqaqqqaqqqaqapVlqpVVqmqqVVVVaqpqqpmqVVWpWpqqqVWlaaVmmqmpqllmpqaZqqmqmWmmlpqqmaaZValamqqpqZlVaqpqqampmVWVVamqqammVWZmaqqpqaZVVVVqqqmpplVVVWqqqaamVVVVaqqpqqZVVVVqqqmqpmqqqmqqqlVVVVVVqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqKqqqqqqqqqgqqqqqqqqqqAqqqqqqqqqgAqqqqqqqqoAAKqqqqqqoAA=="),Rl=Q(32,32,"AAAAAAAAAAAAAAAAIAAAAAAAAgAgAgAAAAAAgCAIAAAAAAAgICAAAAAAAAgggAAAAAAAAgIAAAAAACgAAACgAAAAAoqqigAAAAAACWWAAAAAAAAJqYAAAAAAKompiqAAAKAACWWAAAACqgCqqqoqoAJWKJVVViVgKqqqqqqqqqglVVVVVVVVWCVaqqqqqqpYJVlVVapVVlglaVVaVaVWmCVpVWWqWVaYJWlVZlWZVpglaVWZVWZWmCVpaZlVZlaYJWlpmVVmVpglaaWZVWZWmCVpVWZVmVaYJWlVZapZVpglaVVaVaVWmCVpVVWqVVaYJVqqqqqqqlgqqqqqqqqqqA=="),Sl=Q(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqgAAAAAAqAKqgAAAAACYCVVgKqgAqqqpVWqVVgCqqqqqqpVWAKmqqVVqpVoAqqqVVVaqqgCpqlaqlaqqAKqqWlWlqqoAqalpVWlqqgCqqWVVWWqqAKqpZVVZaqoAqqllVVlqqgCqqWVVWWqqAKqpaVVpaqoAqqpaVaWqqgCqqlaqlaqqAKqqlVVWqqoAqqqpVWqqqgCqqqqqqqqqAKqqqqqqqqoA=="),Wl=Q(32,32,"qqqqqqqqqqqVVWqqqqqqqpVVaqqqqqqqlVVqqqqqqqqVVWqqqqqqqpVVaqqVVWqqlZVqqVVVVqqVlWqlVVVVqpWVapVVVVVqlVVqlVVVVWqVVWpVVVVVWpVValVVVVValVVqVVVVVVqVVWpVVVVVWpVValVVVVValVVqVVVVVVqVVWpVVVVVWpVValVVVVValVVqVVVVVVqVVWpVVVVVWpVqqlVVVVValVaqVVVVVVqVVqpVVVVVapVWqlVVVVVqlVaqVVVVVaqVVqlVVVVWqpWqlVVVVWqqlVaqqqqqqqqVVqqqqqqqqpVWqqqqqqqqlVaqqqqqqqqqqqqqqqqqqg=="),Tl=Q(32,32,"AAAAAAAAAAAAKqqqqqqoAACVVVVVVVYAAJVVVVVVVgAAlaqqqqpWAACWVVVVVZYAAJZmZmZVlgAAllVVVVWWAACWZmZVVZYAAJZVVVVVlgAAlmZVVVWWAACWVVVVVZYAAJZmVVVVlgAAllVVVVWWAACWZmVVVZYAAJZVVVVVlgAAllVVVVWWAACVqqqqqlYAAJVVVVVVVgAAlVVVVVVWAACVVVVVVVYAAJVVVVVVVgAAlVVVqqpWAACVVVVVVVYAAJVVVVVVVgAAlVVVVVVWAACVVVVVVVYAACqqqqqqqAAAJVVVVVVYAAAlVVVVVVgAACVVVVVVWAAAKqqqqqqoAA=="),Pl=Q(32,32,"AqqqqqqgAAACVVVVVWgAAAJVVVVVZgAAAlVVVVVlgAACVVVVVWVgAAJVVVVVZVgAAlVVVVVqqgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVqampppWAAJVVVVVVVYAAlVVVVVVVgACVqapqmpWAAJVVVVVVVYAAlVVVVVVVgACVpqqmppWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACqqqqqqqqAA=="),Fl=Q(32,32,"AqqqqqqgAAACVVVVVWgAAAJVVVVVZgAAAlVVVVVlgAACVVVVVWVgAAJVamqapVgAAlVVVVVqqgACVqamqlVWAAJVVVVVVVYAAlaqaqmqVgACVVVVVVVWAAJWpqamqVYAAlVVVVVVVgACVVVVVVVWAAJVapqmqlYAAlVVVVVVVgACVqmqappWAAJVVVVVVVYAAlaapqmqVgACVVVVVVVWAAJWqaqapVYAAlVVVVVVVgACVVVVVVVWAAJVapqaalYAAlVVVVVVVgACVqmpqapWAAJVVVVVVVYAAlamqmqaVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACqqqqqqqqAA=="),Ll=Q(32,32,"AAKqoAAAAAAAAmqgAAAAAAACaqAAAAAAqqqqqqqAAAClqqqqqoAAAKqqqqqqgAAAJVVWVpoAAAAlVVVmpgAAACVVVlaaAAAAJVVVZqYAAAAlVVZWmgAAACVVVWamAAAAJVVWVpoAAAAlVVVmpgAAACVVVlaaAAAAJVVVZqYAAAAlVVZWqqqqqCVVVWaVVVVWJVVWVpVVVVYlVVVmlVVVViVVVlaVVVVWJVVVZpVVVVYlVVZWlVVVViVVVWaVVVVWJVVWVqampqYlVVVmpmZmZiVVVlampqamJVVVZpVVVVYlVVZWqqqqqqqqqqqqgAAApaqqqqqAAACqqqqqqoAAAA=="),Ol=Q(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACqqgAAAAAAAlVVgAAAAAAJVVVgAAAAACqqqqqqqqqolVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaqqqqqqqqqqg=="),Ql=Q(32,32,"ACqqqqqqoAAAlVVVVVVYAAJVVVVVVVYAAlaqqqqqVgACWVVVVVWWAAJZVVVVVZYAAllVVVVVlgACWVZWVlWWAAJZVlZWVZYAAllVVlVVlgACWVVWVVWWAAJZVVpVVZYAAllVVVVVlgACWVWVZVWWAAJZVWqVVZYAAllVVVVVlgACWVVVVVWWAAJWqqqqqlYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACWlVVWqpWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAKqqqqqqqAAAlVVVVVVYAACVVVVVVVgAAJVVVVVVWAAAqqqqqqqoAA=="),Hl=Q(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKqqqqqqqqqiVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVlVVVVVVVVpVVVVVVVVVWlVVVVVVVVVYqqqqqqqqqqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="),Ul=Q(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqqqqqqqqqqCqqqqqqqqqoKWlpaWlpaWgpaWlpaWlpaCqqqqqqqqqoKqqqqqqqqqgpVVVVVVVVaClVVVVVVVVoKVVVVVVVVWgpVVWlVVVVaClVVapVVVVoKVVVqqVVVWgpVVWqqlVVaClVVaqqpVVoKVVVqqqlVWgpVVWqqlVVaClVVaqlVVVoKVVVqlVVVWgpVVWlVVVVaClVVVVVVVVoKVVVVVVVVWgpVVVVVVVVaCqqqqqqqqqoKqqqqqqqqqgpaWlpaWlpaClpaWlpaWloKqqqqqqqqqgqqqqqqqqqqA=="),Zl=Q(32,32,"ACqqqqqqqAAClVVVVVVWgAlmpqampqlgJqpqaqpqapgmpqaVVqammKpqaWqpampqpqaWqqqWpqaqamqqqqmqaqapqqqqqmamqqaqlaqqmqqppqlVaqqZqqqapVWqqqaqmpqlWqqqppqqapVpqqqpqqpqlaaqqqmqqmqVqqqqqaqaaqaqqqqpmqpqqqqmqqmqqmqqqpaaqaqqmqqqqpamqqqaqqqqVqaqqqaqqqVamqqqpqqqqWqaqqqpqqqqqmqqqqpqqqqpqqqqqpaqqpaqqqqqqWqpaqqqKqqqlVaqqqgqqqqqqqqqqAqqqqqqqqqgAqqqqqqqqoAAKqqqqqqoAA=="),Nl=Q(32,32,"AKqqqqqqqgAKVVVVVVVVoCWmpqampqZYJmpqaqpqapiapqaVVqampqpqaWqpampqpqaWqqqWpqaqamqqqqmqaqapqqqqqmamqqaqlaqqmqqppqlVaqqZqqqapVWqqqaqmpqlWqqqppqqapVpqqqpqqpqlaaqqqmqqmqVqqqqqaqaaqaqqqqpmqpqqqqmqqmqqmqqqpaaqaqqmqqqqpamqqqaqqqqVqaqqqaqqqVamqqqpqqqqWqaqqqpqqqqqmqqqqpqqqqpqqqqqpaqqpaqqqqqqWqpaqqqqqqqlVaqqqoqqqqqqqqqqCqqqqqqqqqoCqqqqqqqqqAAqqqqqqqqAA=="),Yl=Q(32,32,"ACqqqqqqoAAAlVVVVVVYAAJVVVVVVVYAAlaqqqqqVgACWVVVVVWWAAJZVVVVVZYAAllZlVmVlgACWVZVVlWWAAJZWZVZlZYAAllVVVVVlgACWVVllVWWAAJZVVpVVZYAAllVVVVVlgACWVWqpVWWAAJZVlVaVZYAAllVVVWVlgACWVVVVVWWAAJWqqqqqlYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACWlVVWqpWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAKqqqqqqqAAAlVVVVVVYAACVVVVVVVgAAJVVVVVVWAAAqqqqqqqoAA=="),Gl=Q(32,32,"AAAAqqoAAAAAACpVVagAAAAClVaVVoAAAApZVpVloAAAJVZWlZVYAACVVlaVlVYAAllVVVVVVYAKVlVVVVVloAlVlVVVVpVgJVVVVVVaVVgmVVVVVapVmCWlVVVaqVpYlVVVVWqlVVaVVVVWqpVVVpVVVVqqVVVWmqVVZqpVWqaapVWVqVVappVVVZVlVVVWlVVWVpVVVVaVVVlZVVVVViWlZaVVVVpYJlWaVVVVVZglVaVVVVVVWAlWlVVVVlVgCllVVVVVlaACVVVVVVVlgACVVlaVlVYAACVWVpWVWAAACllWlWWgAAAClVaVVoAAAAAqVVWoAAAAAACqqgAAAA=="),Kl=Q(32,32,"AAAAKqAAAAAAAACVWAAAAAAqqqqqqqAAAJVVVVVVWAAAlVVVVVVYAACqqqqqqqgAACVVVVVVYAAAJVVVVVVgAAAlWVlZWWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJVlZWVlgAAAlVVVVVWAAACVVVVVVYAAACqqqqqqAAA=="),Xl=Q(32,32,"qqqqqqqqqqqVVVVVVVVVVpVVVVVVVVVWmqWqWqWqWqaZZZZZZZZZZplllllllllmmqWqWqWqWqaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVpVVVVVWlVVWqVVVVVaVVVaqlVVVVpVVVqqpVVVWlVVWqqqVVVaVVVaqqpVVVpVVVqqpVVVWlVVWqpVVVVaVVVapVVVVVpVVVpVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaapapapapapplllllllllmmWWWWWWWWWaapapapapappVVVVVVVVVWlVVVVVVVVVaqqqqqqqqqqg=="),$l={"icon/1bitcamera":Il,"icon/MacFlim":Ml,"icon/appstore-16x16":zl,"icon/appstore-32x32":Cl,"icon/appstore-smr-32x32":Bl,"icon/appstore2":Dl,"icon/camera-32":El,"icon/camera":Rl,"icon/camera3":Sl,"icon/chat":Wl,"icon/computer":Tl,"icon/file":Pl,"icon/file0":Fl,"icon/film":Ll,"icon/folder":Ol,"icon/happy":Ql,"icon/hd":Hl,"icon/movie":Ul,"icon/photobooth-32x32":Zl,"icon/photobooth-smr-32":Nl,"icon/sad":Yl,"icon/safari":Gl,"icon/trash":Kl,"icon/video":Xl},jl=Q(16,16,"AAKAAAKJagAJaWWACWlliAJZZaYCWWWWKJVVlpaVVVaVlVVYJVVVWAlVVVgJVVVgAlVVYACVVYAAJVWAACVVgA=="),Jl=Q(16,16,"AAAAAAAAAAAAAAAAAAAAAACiigACWWWgAlVVmACVVVgClVVYCVVVWAlVVVgJVVVgAlVVYACVVYAAJVWAACVVgA=="),ta=Q(16,16,"UAAAAGQAAABpAAAAakAAAGqQAABqpAAAaqkAAGqqQABqqpAAaqVUAGmkAABkaQAAUGkAAEAaQAAAGkAAAAVAAA=="),Aa=Q(32,32,"VQAAAAAAAABVAAAAAAAAAFpQAAAAAAAAWlAAAAAAAABapQAAAAAAAFqlAAAAAAAAWqpQAAAAAABaqlAAAAAAAFqqpQAAAAAAWqqlAAAAAABaqqpQAAAAAFqqqlAAAAAAWqqqpQAAAABaqqqlAAAAAFqqqqpQAAAAWqqqqlAAAABaqqqqpQAAAFqqqqqlAAAAWqqqVVVQAABaqqpVVVAAAFqlqlAAAAAAWqWqUAAAAABaUFqlAAAAAFpQWqUAAAAAVQBapQAAAABVAFqlAAAAAFAABapQAAAAUAAFqlAAAAAAAAWqUAAAAAAABapQAAAAAAAAVVAAAAAAAABVUAAAAA=="),ea=Q(48,48,"VVAAAAAAAAAAAAAAVVAAAAAAAAAAAAAAVVAAAAAAAAAAAAAAVqVAAAAAAAAAAAAAVqVAAAAAAAAAAAAAVqVAAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqqVAAAAAAAAAAAVqqqVAAAAAAAAAAAVqqqVAAAAAAAAAAAVqqqqVAAAAAAAAAAVqqqqVAAAAAAAAAAVqqqqVAAAAAAAAAAVqqqqqVAAAAAAAAAVqqqqqVAAAAAAAAAVqqqqqVAAAAAAAAAVqqqqqqVAAAAAAAAVqqqqqqVAAAAAAAAVqqqqqqVAAAAAAAAVqqqqqqqVAAAAAAAVqqqqqqqVAAAAAAAVqqqqqqqVAAAAAAAVqqqqqqqqVAAAAAAVqqqqqqqqVAAAAAAVqqqqqqqqVAAAAAAVqqqqqVVVVVAAAAAVqqqqqVVVVVAAAAAVqqqqqVVVVVAAAAAVqqVqqVAAAAAAAAAVqqVqqVAAAAAAAAAVqqVqqVAAAAAAAAAVqVAVqqVAAAAAAAAVqVAVqqVAAAAAAAAVqVAVqqVAAAAAAAAVVAAVqqVAAAAAAAAVVAAVqqVAAAAAAAAVVAAVqqVAAAAAAAAVAAAAVqqVAAAAAAAVAAAAVqqVAAAAAAAVAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAAVVVAAAAAAAAAAAAAVVVAAAAAAAAAAAAAVVVAAAAAAA"),na=Q(64,64,"VVUAAAAAAAAAAAAAAAAAAFVVAAAAAAAAAAAAAAAAAABVVQAAAAAAAAAAAAAAAAAAVVUAAAAAAAAAAAAAAAAAAFWqVQAAAAAAAAAAAAAAAABVqlUAAAAAAAAAAAAAAAAAVapVAAAAAAAAAAAAAAAAAFWqVQAAAAAAAAAAAAAAAABVqqpVAAAAAAAAAAAAAAAAVaqqVQAAAAAAAAAAAAAAAFWqqlUAAAAAAAAAAAAAAABVqqpVAAAAAAAAAAAAAAAAVaqqqlUAAAAAAAAAAAAAAFWqqqpVAAAAAAAAAAAAAABVqqqqVQAAAAAAAAAAAAAAVaqqqlUAAAAAAAAAAAAAAFWqqqqqVQAAAAAAAAAAAABVqqqqqlUAAAAAAAAAAAAAVaqqqqpVAAAAAAAAAAAAAFWqqqqqVQAAAAAAAAAAAABVqqqqqqpVAAAAAAAAAAAAVaqqqqqqVQAAAAAAAAAAAFWqqqqqqlUAAAAAAAAAAABVqqqqqqpVAAAAAAAAAAAAVaqqqqqqqlUAAAAAAAAAAFWqqqqqqqpVAAAAAAAAAABVqqqqqqqqVQAAAAAAAAAAVaqqqqqqqlUAAAAAAAAAAFWqqqqqqqqqVQAAAAAAAABVqqqqqqqqqlUAAAAAAAAAVaqqqqqqqqpVAAAAAAAAAFWqqqqqqqqqVQAAAAAAAABVqqqqqqqqqqpVAAAAAAAAVaqqqqqqqqqqVQAAAAAAAFWqqqqqqqqqqlUAAAAAAABVqqqqqqqqqqpVAAAAAAAAVaqqqqqqVVVVVVUAAAAAAFWqqqqqqlVVVVVVAAAAAABVqqqqqqpVVVVVVQAAAAAAVaqqqqqqVVVVVVUAAAAAAFWqqlWqqlUAAAAAAAAAAABVqqpVqqpVAAAAAAAAAAAAVaqqVaqqVQAAAAAAAAAAAFWqqlWqqlUAAAAAAAAAAABVqlUAVaqqVQAAAAAAAAAAVapVAFWqqlUAAAAAAAAAAFWqVQBVqqpVAAAAAAAAAABVqlUAVaqqVQAAAAAAAAAAVVUAAFWqqlUAAAAAAAAAAFVVAABVqqpVAAAAAAAAAABVVQAAVaqqVQAAAAAAAAAAVVUAAFWqqlUAAAAAAAAAAFUAAAAAVaqqVQAAAAAAAABVAAAAAFWqqlUAAAAAAAAAVQAAAABVqqpVAAAAAAAAAFUAAAAAVaqqVQAAAAAAAAAAAAAAAFWqqlUAAAAAAAAAAAAAAABVqqpVAAAAAAAAAAAAAAAAVaqqVQAAAAAAAAAAAAAAAFWqqlUAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAFVVVQAAAAAAAAAAAAAAAABVVVUAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAA=="),ia=Q(96,96,"VVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAA"),ra=Q(144,144,"VVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAA"),sa=Q(7,16,"oCgiACAAgAIACAAgAIACAAgAIACAAgAIAIgoCg=="),oa=Q(14,32,"qgAKqqAAqgCgoAAKCgAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAAoKAACgoAqgAKqqAAqg=="),la=Q(21,48,"qqAAAqqqqAAAqqqqAAAqqAAqAqAAAAqAqAAAAqAqAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAqAqAAAAqAqAAAAqAqAAqqAAAqqqqAAAqqqqAAAqq"),aa=Q(28,64,"qqoAAACqqqqqAAAAqqqqqgAAAKqqqqoAAACqqgAAqgCqAAAAAKoAqgAAAACqAKoAAAAAqgCqAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAKoAqgAAAACqAKoAAAAAqgCqAAAAAKoAqgAAqqoAAACqqqqqAAAAqqqqqgAAAKqqqqoAAACqqg=="),ca=Q(42,96,"qqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqq"),da=Q(63,144,"qqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqq"),fa=Q(11,16,"CqoAKqgAqqACqoAlVYJVlYlWViVZWpalalVViVVWCVVgCqoAKqgAqqACqoA="),qa={"cursor/cursor-grab":jl,"cursor/cursor-grabbing":Jl,"cursor/default-1x":ta,"cursor/default-2x":Aa,"cursor/default-3x":ea,"cursor/default-4x":na,"cursor/default-6x":ia,"cursor/default-9x":ra,"cursor/text-1x":sa,"cursor/text-2x":oa,"cursor/text-3x":la,"cursor/text-4x":aa,"cursor/text-6x":ca,"cursor/text-9x":da,"cursor/watch":fa},ua=Q(9,11,"ACgAKAAIAKioqqqqqgqqgqqqqqqKqoCigA=="),ha=Q(12,15,"KqqolVVWlVVWlVZWlVZWlVZWlVVWlVVWlVWolVVYlVlYlVaolVVYlVVYKqqg"),ma=Q(51,34,"mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZqqqqmZmZmZmZmZmZmVlVlpmZmZmZmZmZmaVlZlaZmZmZmZmZmZmVlVlZmZmZmZmZmZmaVaqVaZmZmZmZmZmZmVVVVZmZmZmZmZmZmaaqqqaZmZmZmZmZmZmZVVWZmZmZmZmZmZmaZWpWaZmZmZmZmZmZmZZWWZmZmZmZmZmZmaZVZWaZmZmZmZmZmZmZVlWZmZmZmZmZmZmaZVVWaZmZmZmZmZmZmZVlWZmZmZmZmZmZmaZVVWaZmZmZmZmZmZmqqqqpmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZA="),pa=Q(5,5,"qqoKAgCAAA=="),ga=Q(5,5,"qoKgKAIAgA=="),xa=Q(5,5,"gCAKAqCqgA=="),Va=Q(5,5,"AIAgKCqqgA=="),wa=Q(4,2,"ZVY="),ya={eaten_apple:ua,user2:ha,"microdesktop-disk":ma,"corner-lt":pa,"corner-rt":ga,"corner-lb":xa,"corner-rb":Va,"scrollbar-bg":wa},ba=Q(16,16,"qqqqqpVVVVaVVlVWlVmVVpVlZVaVlVlWllVWVplVVZaqlVqmlZVZVpWVWVaVlVlWlaqpVpVVVVaVVVVWqqqqqg=="),_a=Q(16,16,"qqqqqpVVVVaVVVVWlaqpVpWVWVaVlVlWlZVZVqqVWqaZVVWWllVWVpWVWVaVZWVWlVmVVpVWVVaVVVVWqqqqqg=="),ka=Q(16,16,"qqqqqpVWVVaVWlVWlWZVVpWWqlaWVVZWmVVWVqVVVlaZVVZWllVWVpWWqlaVZlVWlVpVVpVWVVaVVVVWqqqqqg=="),va=Q(16,16,"qqqqqpVVlVaVVaVWlVWZVpWqllaVlVWWlZVVZpWVVVqVlVVmlZVVlpWqllaVVZlWlVWlVpVVlVaVVVVWqqqqqg=="),Ia=Q(11,11,"qqqqVVVpVVWlVVaVVVpVVWlVVaVVVpVVWlVVaqqqgA=="),Ma=Q(11,11,"qqqqVZVpllmlmZaVVVqpWqlVVaWZlpllmlWVaqqqgA=="),za=Q(16,16,"qqqqqpVVVVaVVVVWlqqlVpZVZVaWVWqmllVlZpZVZWaWVWVmlqqlZpVlVWaVZVVmlWVVZpVqqqaVVVVWqqqqqg=="),Ca=Q(11,11,"qqqqVWVpVZWlVlaVWVpVZWqqlaVVVpVVWlVVaqqqgA=="),Ba={"chrome/up":ba,"chrome/down":_a,"chrome/left":ka,"chrome/right":va,"chrome/close":Ia,"chrome/closing":Ma,"chrome/resize":za,"chrome/zoom":Ca};function Da(A){A.registerAll($l),A.registerAll(qa),A.registerAll(ya),A.registerAll(Ba)}class Ea{constructor(){this.regions=[],this.hoveredId=null,this.pressedId=null}clear(){this.regions.length=0}add(t){this.regions.push(t)}hitTest(t,e){for(let n=this.regions.length-1;n>=0;n--){const i=this.regions[n];if(t>=i.x&&t<i.x+i.w&&e>=i.y&&e<i.y+i.h)return i}return null}handleMouseMove(t,e){var r,s,o;const n=this.hitTest(t,e),i=(n==null?void 0:n.id)??null;if(i!==this.hoveredId){if(this.hoveredId!==null){const l=this.findById(this.hoveredId);(r=l==null?void 0:l.onMouseLeave)==null||r.call(l)}this.hoveredId=i,n&&((s=n.onMouseEnter)==null||s.call(n))}if(this.pressedId!==null){const l=this.findById(this.pressedId);return(o=l==null?void 0:l.onDrag)==null||o.call(l,t,e),!0}return n!==null}handleMouseDown(t,e){var i;const n=this.hitTest(t,e);return n?(this.pressedId=n.id,(i=n.onMouseDown)==null||i.call(n,t-n.x,e-n.y),!0):!1}handleMouseUp(t,e){const n=this.pressedId;this.pressedId=null;const i=this.hitTest(t,e);return i!=null&&i.onMouseUp&&i.onMouseUp(t-i.x,e-i.y),i&&n===i.id&&i.onClick?(i.onClick(t-i.x,e-i.y),!0):n!==null}handleDoubleClick(t,e){const n=this.hitTest(t,e);return n!=null&&n.onDoubleClick?(n.onDoubleClick(t-n.x,e-n.y),!0):!1}handleScroll(t,e,n){const i=this.hitTest(t,e);return i!=null&&i.onScroll?(i.onScroll(n),!0):!1}getHoveredId(){return this.hoveredId}clearHover(){var t;if(this.hoveredId!==null){const e=this.findById(this.hoveredId);(t=e==null?void 0:e.onMouseLeave)==null||t.call(e),this.hoveredId=null}}clearPressed(){this.pressedId=null}findById(t){for(let e=this.regions.length-1;e>=0;e--)if(this.regions[e].id===t)return this.regions[e]}}const Tn=new Map;function Ra(){Tn.clear()}function Sa(A,t){Tn.set(A,t)}function Wa(A){return Tn.get(A)??null}function Ta(A){let t=null,e=null,n=null;return{openWindow:A.openWindow,closeWindow:A.closeWindow,showDialog:A.showDialog,fs:null,clipboard:{read(){const i=Wa("TEXT");return typeof i=="string"?i:""},write(i){Ra(),Sa("TEXT",i)}},camera:{async requestAccess(){try{return t=await navigator.mediaDevices.getUserMedia({video:!0,audio:!1}),A.videoElement&&(A.videoElement.srcObject=t,await A.videoElement.play()),!0}catch{return!1}},getFrame(){const i=A.videoElement;if(!i||!t)return null;const r=i.videoWidth,s=i.videoHeight;return!r||!s?null:((!e||e.width!==r||e.height!==s)&&(e=new OffscreenCanvas(r,s),n=e.getContext("2d")),n.drawImage(i,0,0),n.getImageData(0,0,r,s))},getVideoElement(){return!t||!A.videoElement?null:A.videoElement},release(){t&&(t.getTracks().forEach(i=>i.stop()),t=null),A.videoElement&&(A.videoElement.srcObject=null)}},audio:{play(i){new Audio(i).play().catch(()=>{})}},storage:{async read(i){try{return await(await(await(await navigator.storage.getDirectory()).getFileHandle(i)).getFile()).text()}catch{return null}},async write(i,r){try{const l=await(await(await navigator.storage.getDirectory()).getFileHandle(i,{create:!0})).createWritable();await l.write(r),await l.close()}catch(s){console.error("storage write error:",s)}},async list(){try{const i=await navigator.storage.getDirectory(),r=[];for await(const[s]of i.entries())r.push(s);return r}catch{return[]}}}}}function Pa(A,t){return A.x===t.x&&A.y===t.y&&A.width===t.width&&A.height===t.height}function wi(A,t){const{baseAddr:e,rowBytes:n}=A.portBits,i=e.length/n|0,r=new yn(n,i);r.pixels=e,r.flush(t)}function Fa(A,t,e,n,i=4,r=30,s,o){return new Promise(l=>{const a=[];for(let h=0;h<=i;h++){const u=h/i,m={x:Math.round(e.x+(n.x-e.x)*u),y:Math.round(e.y+(n.y-e.y)*u),width:Math.round(e.width+(n.width-e.width)*u),height:Math.round(e.height+(n.height-e.height)*u)};m.width<2||m.height<2||a.length>0&&Pa(m,a[a.length-1])||a.push(m)}if(a.length===0){l();return}let c=0,d=null;function f(h){_r(A,h.x,h.y,h.width,h.height,"darkCheckers")}function q(){if(d&&(f(d),d=null),c>=a.length){wi(A,t),o==null||o(),l();return}const h=a[c++];f(h),d=h,wi(A,t),setTimeout(q,r)}q()})}const LA="menu",Wr=1,La=15,Tr=1,Oa=15,Pr=0,Qa=15,j=20,ZA=16,ue=4,Xe=8,he=24;function Fr(A){return St(A,LA,Wr)}function yi(A){return St(A,LA,Tr)}function Lr(A){return St(A,LA,Pr)}function bi(A,t,e,n,i){JA(A,t,e,n,{font:LA,spacing:Wr,lineHeight:La,color:i})}function Ha(A,t,e,n,i){JA(A,t,e,n,{font:LA,spacing:Tr,lineHeight:Oa,color:i})}function Ua(A,t,e,n,i){JA(A,t,e,n,{font:LA,spacing:Pr,lineHeight:Qa,color:i})}function Za(A){return{menus:A,openMenuIndex:null,highlightedItem:null}}function Na(A){return A===""}function Ya(A){let t=0;for(const e of A.items)if(!("type"in e&&e.type==="separator"))if("type"in e&&e.type==="radiogroup")for(const n of e.items)t=Math.max(t,yi(n.label)+24);else{const n=e;let i=yi(n.label)+12;n.shortcut&&(i+=Lr(n.shortcut)+20),t=Math.max(t,i)}return Math.max(t+ue*2,100)}function Ga(A){const t=[];for(const e of A.items)if("type"in e&&e.type==="separator")t.push({label:"",isSeparator:!0});else if("type"in e&&e.type==="radiogroup"){const n=e;for(const i of n.items)t.push({label:i.label,disabled:i.disabled,isRadio:!0,radioChecked:n.value===i.value,onClick:()=>n.onValueChange(i.value)})}else{const n=e;t.push({label:n.label,disabled:n.disabled,shortcut:n.shortcut,onClick:n.onClick})}return t}function Ka(A,t,e,n,i,r){rt(A,0,0,n,j,P),ut(A,0,j-1,n,p),e&&Vt(A,e,10,4),i.add({id:"menubar-bg",x:0,y:0,w:n,h:j,onMouseDown:()=>{t.openMenuIndex!==null&&(t.openMenuIndex=null,t.highlightedItem=null,r())},onMouseEnter:()=>{t.openMenuIndex!==null&&t.highlightedItem!==null&&(t.highlightedItem=null,r())}});const s=t.menus.length>0&&Na(t.menus[0].label);let o=he+8;for(let l=0;l<t.menus.length;l++){const a=l,c=t.menus[l],d=t.openMenuIndex===l;if(l===0&&s){d&&(rt(A,4,0,he,j-1,p),e&&vr(A,e,10,4)),i.add({id:`menubar-label-${l}`,x:4,y:0,w:he,h:j,onMouseDown:()=>{t.openMenuIndex===a?(t.openMenuIndex=null,t.highlightedItem=null):(t.openMenuIndex=a,t.highlightedItem=null),r()},onMouseEnter:()=>{t.openMenuIndex!==null&&t.openMenuIndex!==a&&(t.openMenuIndex=a,t.highlightedItem=null,r())}});continue}const f=Fr(c.label),q=o-5,h=f+14;d?(rt(A,q,0,h,j-1,p),bi(A,c.label,o,2,P)):bi(A,c.label,o,2,p),i.add({id:`menubar-label-${l}`,x:q,y:0,w:h,h:j,onMouseDown:()=>{t.openMenuIndex===a?(t.openMenuIndex=null,t.highlightedItem=null):(t.openMenuIndex=a,t.highlightedItem=null),r()},onMouseEnter:()=>{t.openMenuIndex!==null&&t.openMenuIndex!==a&&(t.openMenuIndex=a,t.highlightedItem=null,r())}}),o+=f+14}if(t.openMenuIndex!==null){const l=t.menus[t.openMenuIndex],a=Xa(t,t.openMenuIndex,s),c=Ya(l),d=Ga(l),f=d.reduce((h,u)=>h+(u.isSeparator?Xe:ZA),0)+2;rt(A,a+1,j+f,c,1,p),rt(A,a+c,j+1,1,f,p),rt(A,a,j,c,f,P),Yt(A,a,j,c,f,p),ut(A,a,j,c,P),i.add({id:"menubar-dropdown-bg",x:a,y:j,w:c,h:f});let q=j+1;for(let h=0;h<d.length;h++){const u=d[h];if(u.isSeparator){br(A,a+1,q+Xe/2,c-2,p),q+=Xe;continue}const m=h,w=t.highlightedItem===h&&!u.disabled;w&&rt(A,a+1,q,c-2,ZA,p);const M=w?P:p,E=a+ue+(u.isRadio?16:0);if(Ha(A,u.label,E,q,M),u.shortcut){const x=Lr(u.shortcut),k=a+c-ue-x-2;Ua(A,u.shortcut,k,q,M)}if(u.isRadio&&u.radioChecked){const x=a+ue+4,k=q+6;xt(A,x,k,M),ut(A,x-1,k+1,3,M),xt(A,x,k+2,M)}u.disabled&&!w&&No(A,a+1,q,c-2,ZA,"gray50"),i.add({id:`menubar-item-${h}`,x:a,y:q,w:c,h:ZA,onMouseEnter:()=>{t.highlightedItem!==m&&(t.highlightedItem=m,r())},onMouseUp:()=>{!u.disabled&&u.onClick&&(t.openMenuIndex=null,t.highlightedItem=null,u.onClick(),r())}}),q+=ZA}}}function Xa(A,t,e){let n=he+8;for(let i=0;i<t;i++)i===0&&e||(n+=Fr(A.menus[i].label)+14);return t===0&&e?6:n}const ft="__root__",$a={text:"icon/file",image:"icon/camera",app:"icon/appstore-smr-32x32","app-shortcut":"icon/computer",binary:"icon/file"};function cn(A){return A.icon?A.icon:A.kind==="directory"?"icon/folder":$a[A.fileType]??"icon/file"}function _i(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}const ki={text:"TEXT",image:"PICT",app:"APPL","app-shortcut":"ALIK",binary:"BINA"},vi={TEXT:"text",PICT:"image",APPL:"app",ALIK:"app-shortcut",BINA:"binary"};class ja{constructor(t,e){this.meta={version:1,nodes:{}},this.listeners=[],this.metaDirty=!1,this.flushTimer=null,this.version=0,this.backend=t,this.sprites=e}async init(){await this.backend.init();const t=await this.backend.readMeta();if(t)try{this.meta=JSON.parse(t)}catch{this.meta={version:1,nodes:{}}}this.meta.nodes[ft]||(this.meta.nodes[ft]={id:ft,name:"/",kind:"directory",parentId:null,createdAt:Date.now(),modifiedAt:Date.now()},this.schedulePersist())}getNode(t){return this.meta.nodes[t]}readDir(t){const e=[];for(const n of Object.values(this.meta.nodes))n.parentId===t&&e.push(n);return e.sort((n,i)=>n.kind!==i.kind?n.kind==="directory"?-1:1:n.name.localeCompare(i.name)),e}async readFile(t){const e=this.meta.nodes[t];return!e||e.kind!=="file"?null:this.backend.readFile(t)}resolvePath(t){const e=t.split("/").filter(Boolean);let n=ft;for(const i of e){const s=this.readDir(n).find(o=>o.name===i);if(!s)return null;n=s.id}return this.meta.nodes[n]??null}findByName(t,e){for(const n of Object.values(this.meta.nodes))if(n.parentId===t&&n.name===e)return n}async writeFile(t,e,n,i,r){const s=this.findByName(t,e),o=(s==null?void 0:s.id)??_i(),l=Date.now(),a={id:o,name:e,kind:"file",parentId:t,createdAt:(s==null?void 0:s.createdAt)??l,modifiedAt:l,fileType:i,size:n.length,icon:r==null?void 0:r.icon,mimeType:r==null?void 0:r.mimeType};return this.meta.nodes[o]=a,await this.backend.writeFile(o,n),this.schedulePersist(),this.notify(),a}async writeImage(t,e,n,i){const r=JSON.stringify(n),s=await this.writeFile(t,e,r,"image",i),o=Q(n.width,n.height,n.data);return this.sprites.register(`fs:${s.id}`,o),s}async loadSprite(t){const e=`fs:${t}`,n=this.sprites.get(e);if(n)return n;const i=await this.readFile(t);if(!i)return null;try{const r=JSON.parse(i),s=Q(r.width,r.height,r.data);return this.sprites.register(e,s),s}catch{return null}}mkdir(t,e){const n=this.findByName(t,e);if(n&&n.kind==="directory")return n;const i=_i(),r=Date.now(),s={id:i,name:e,kind:"directory",parentId:t,createdAt:r,modifiedAt:r};return this.meta.nodes[i]=s,this.schedulePersist(),this.notify(),s}rename(t,e){const n=this.meta.nodes[t];!n||t===ft||(n.name=e,n.modifiedAt=Date.now(),this.schedulePersist(),this.notify())}move(t,e){const n=this.meta.nodes[t];!n||t===ft||(n.parentId=e,n.position=void 0,n.modifiedAt=Date.now(),this.schedulePersist(),this.notify())}setPosition(t,e){const n=this.meta.nodes[t];!n||t===ft||(n.position=e,this.schedulePersist(),this.notify())}clearPositions(t){for(const e of Object.values(this.meta.nodes))e.parentId===t&&e.position&&(e.position=void 0);this.schedulePersist(),this.notify()}async remove(t){if(t===ft)return;const e=this.meta.nodes[t];if(e){if(e.kind==="directory"){const n=this.readDir(t);for(const i of n)await this.remove(i.id)}else await this.backend.deleteFile(t);delete this.meta.nodes[t],this.schedulePersist(),this.notify()}}onChange(t){return this.listeners.push(t),()=>{this.listeners=this.listeners.filter(e=>e!==t)}}notify(){this.version++;for(const t of this.listeners)try{t()}catch{}}schedulePersist(){this.metaDirty=!0,!this.flushTimer&&(this.flushTimer=setTimeout(()=>{this.flushTimer=null,this.metaDirty&&(this.metaDirty=!1,this.backend.writeMeta(JSON.stringify(this.meta)).catch(t=>console.error("FileManager persist error:",t)))},500))}async flush(){this.flushTimer&&(clearTimeout(this.flushTimer),this.flushTimer=null),this.metaDirty&&(this.metaDirty=!1,await this.backend.writeMeta(JSON.stringify(this.meta)))}FSMakeFSSpec(t){return{path:t}}async FSpCreate(t,e,n){const{parentPath:i,name:r}=this._splitPath(t.path),s=this._resolveDir(i);if(!s)throw new Error(`Directory not found: ${i}`);const o=vi[n]??"binary";await this.writeFile(s.id,r,"",o)}async FSpDelete(t){const e=this.resolvePath(t.path);if(!e)throw new Error(`Not found: ${t.path}`);await this.remove(e.id)}async FSRead(t){const e=this.resolvePath(t.path);return!e||e.kind!=="file"?null:this.readFile(e.id)}async FSWrite(t,e){const n=this.resolvePath(t.path);if(n&&n.kind==="file"){const i=n,{parentPath:r,name:s}=this._splitPath(t.path),o=this._resolveDir(r);o&&await this.writeFile(o.id,s,e,i.fileType)}else{const{parentPath:i,name:r}=this._splitPath(t.path),s=this._resolveDir(i);if(!s)throw new Error(`Directory not found: ${i}`);await this.writeFile(s.id,r,e,"text")}}async FSpGetFInfo(t){const e=this.resolvePath(t.path);if(!e||e.kind!=="file")throw new Error(`File not found: ${t.path}`);return{fdType:ki[e.fileType]??"BINA",fdCreator:"MOCK"}}async FSpSetFInfo(t,e){const n=this.resolvePath(t.path);if(!n||n.kind!=="file")throw new Error(`File not found: ${t.path}`);const i=n,r=vi[e.fdType];r&&(i.fileType=r)}async PBGetCatInfo(t){const e=this.resolvePath(t.path);if(!e)throw new Error(`Not found: ${t.path}`);if(e.kind==="file"){const n=e;return{name:e.name,kind:"file",size:n.size,createdAt:e.createdAt,modifiedAt:e.modifiedAt,fdType:ki[n.fileType]??"BINA",fdCreator:"MOCK"}}return{name:e.name,kind:"directory",size:0,createdAt:e.createdAt,modifiedAt:e.modifiedAt,fdType:"",fdCreator:""}}DirCreate(t){const{parentPath:e,name:n}=this._splitPath(t.path),i=this._resolveDir(e);if(!i)throw new Error(`Directory not found: ${e}`);this.mkdir(i.id,n)}_splitPath(t){const e=t.split("/").filter(Boolean),n=e.pop()??"";return{parentPath:"/"+e.join("/"),name:n}}_resolveDir(t){return t==="/"||t===""?this.getNode(ft)??null:this.resolvePath(t)}}const Ja="mockintosh-fs",tc="files",$e="meta.json";class Ac{constructor(){this.rootHandle=null,this.filesHandle=null}async init(){const t=await navigator.storage.getDirectory();this.rootHandle=await t.getDirectoryHandle(Ja,{create:!0}),this.filesHandle=await this.rootHandle.getDirectoryHandle(tc,{create:!0})}async readMeta(){try{return await(await(await this.rootHandle.getFileHandle($e)).getFile()).text()}catch{return null}}async writeMeta(t){const n=await(await this.rootHandle.getFileHandle($e,{create:!0})).createWritable();await n.write(t),await n.close()}async readFile(t){try{return await(await(await this.filesHandle.getFileHandle(t)).getFile()).text()}catch{return null}}async writeFile(t,e){const i=await(await this.filesHandle.getFileHandle(t,{create:!0})).createWritable();await i.write(e),await i.close()}async deleteFile(t){try{await this.filesHandle.removeEntry(t)}catch{}}async hasMetaFile(){try{return await this.rootHandle.getFileHandle($e),!0}catch{return!1}}}class ec{constructor(t,e){this.loaded=new Set,this.spriteRegistry=t,this.appRegistry=e}async load(t){if(this.loaded.has(t.id)){const i=this.appRegistry.get(t.id);if(i)return i}const e=await import(t.entry);e.sprites&&typeof e.sprites=="object"&&this.spriteRegistry.registerAll(e.sprites);const n=e.default;if(!n||typeof n!="object")throw new Error(`Invalid app bundle for "${t.id}": no default export`);if(!n.id||typeof n.id!="string")throw new Error(`Invalid app bundle for "${t.id}": missing or invalid "id"`);if(typeof n.render!="function")throw new Error(`Invalid app bundle for "${t.id}": missing "render" function`);if(!n.title||!n.icon||!n.defaultSize)throw new Error(`Invalid app bundle for "${t.id}": missing required fields (title, icon, defaultSize)`);return this.appRegistry.register(n),this.loaded.add(t.id),n}async loadAll(t){const e=await Promise.allSettled(t.map(n=>this.load(n)));for(let n=0;n<e.length;n++){const i=e[n];i.status==="rejected"&&console.error(`[AppLoader] Failed to load "${t[n].id}":`,i.reason)}}isLoaded(t){return this.loaded.has(t)}}const Or="mockintosh-system-preferences.json",dn={colorMode:Ss()};async function nc(){try{const n=await(await(await(await navigator.storage.getDirectory()).getFileHandle(Or)).getFile()).text(),i=JSON.parse(n);return{colorMode:i.colorMode==="colors"||i.colorMode==="monochrome"?i.colorMode:dn.colorMode}}catch{return{...dn}}}async function ic(A){try{const n=await(await(await navigator.storage.getDirectory()).getFileHandle(Or,{create:!0})).createWritable();await n.write(JSON.stringify(A)),await n.close()}catch(t){console.error("system preferences write error:",t)}}let me=null;function rc(A){me=A}const sc={id:"splashscreen",title:"Splashscreen",icon:"",defaultSize:{width:512,height:342},render(A,t){t.clear(P);const e=me==null?void 0:me.get("icon/happy");if(e){const n=Math.floor((t.width-e.width)/2),i=Math.floor((t.height-e.height)/2);t.blit(e,n,i)}}},Ee=32,Ii=32,oc=32,yA=8,yt=80,RA=56,_t=16,It=84,iA=64,Mi=4,nt="__desktop__";function OA(A,t){return A.readDir(t).map(n=>({title:n.name,img:cn(n),nodeId:n.id,isDirectory:n.kind==="directory",position:n.position}))}function oe(A){const t=[],e=A.readDir(ft);for(const i of e)t.push({title:i.name,img:cn(i),nodeId:i.id,isDirectory:!0,isVolume:!0,position:i.position});for(const i of e){if(i.kind!=="directory")continue;const r=A.findByName(i.id,"Desktop Folder");if(!r)continue;const s=A.readDir(r.id);for(const o of s)t.push({title:o.name,img:cn(o),nodeId:o.id,isDirectory:o.kind==="directory",isVolume:!1,position:o.position})}const n=SA(A);return n&&t.push({title:"Trash",img:"icon/trash",nodeId:n,isDirectory:!0,isVolume:!1}),t}function Qr(A){const t=A.findByName(ft,"Mockintosh HD");if(!t)return;const e=A.findByName(t.id,"Desktop Folder");return e==null?void 0:e.id}function SA(A){const t=A.findByName(ft,"Mockintosh HD");if(!t)return;const e=A.findByName(t.id,"Trash");return e==null?void 0:e.id}function lc(A){const t=A.screenHeight-A.menubarHeight,e=Math.max(1,Math.floor((t-yA)/iA)),n=A.screenWidth-It,i=(e-1)*iA+yA;return{x:n,y:i}}function Hr(A,t,e,n){const i=n-e,r=Math.floor((i-yA)/iA),s=Math.floor(A/Math.max(1,r)),o=A%Math.max(1,r);return{x:t-(s+1)*It,y:o*iA+yA}}function WA(A,t,e){return{x:A+Math.floor((e-Ii)/2),y:t,w:Ii,h:oc}}function Ur(A,t){const e=A%t,n=Math.floor(A/t);return{x:_t+e*yt,y:_t+n*RA}}function ee(A,t,e){if(SA(e.fs)===A.nodeId){const n=e.fs.getNode(A.nodeId);return(n==null?void 0:n.position)??lc(e)}return A.position?A.position:Hr(t,e.screenWidth,e.menubarHeight,e.screenHeight)}function TA(A,t,e){return A.position?A.position:Ur(t,e)}const fn=400,zi=128;function ac(A,t,e){const n=yA,i=e-It,r=Math.round((i-A)/It),s=Math.round((t-n)/iA);return{col:Math.max(0,r),row:Math.max(0,s)}}function cc(A,t){const e=Math.round((A-_t)/yt),n=Math.round((t-_t)/RA);return{col:Math.max(0,e),row:Math.max(0,n)}}function Ci(A){const t=oe(A.fs),e=new Set;for(let l=0;l<t.length;l++){const a=ee(t[l],l,A),c=ac(a.x,a.y,A.screenWidth);e.add(`${c.col},${c.row}`)}const n=A.screenHeight-A.menubarHeight,i=Math.max(1,Math.floor((n-yA)/iA)),r=A.screenWidth-It,s=yA,o=Math.max(1,Math.floor(r/It));for(let l=0;l<i;l++)for(let a=0;a<o;a++)if(!e.has(`${a},${l}`))return{x:r-a*It,y:s+l*iA};return{x:r-(o-1)*It,y:s+(i-1)*iA}}function Bi(A,t,e){const n=OA(A.fs,t),i=Math.max(1,Math.floor((e-_t)/yt)),r=new Set;for(let s=0;s<n.length;s++){const o=TA(n[s],s,i),l=cc(o.x,o.y);r.add(`${l.col},${l.row}`)}for(let s=0;s<zi;s++)for(let o=0;o<i;o++)if(!r.has(`${o},${s}`))return{x:_t+o*yt,y:_t+s*RA};return{x:_t+(i-1)*yt,y:_t+(zi-1)*RA}}function dc(A,t,e){if(e){if(t){const n=oe(A.fs),i=SA(A.fs);for(let r=0;r<n.length;r++){if(n[r].nodeId===i)continue;const s=Hr(r,A.screenWidth,A.menubarHeight,A.screenHeight);A.fs.setPosition(n[r].nodeId,s)}}else{const n=OA(A.fs,e),i=fn-2-dt,r=Math.max(1,Math.floor((i-_t)/yt));for(let s=0;s<n.length;s++){const o=Ur(s,r);A.fs.setPosition(n[s].nodeId,o)}}A.scheduleRender()}}const fc={id:"finder",title:"Finder",icon:"icon/folder",renderWindow(A,t,e,n,i){const r=i._finderServices;r&&(n===nt?pc(A,t,e,r):xc(A,t,e,n,i,r))},onWindowEvent(A,t,e,n,i,r){const s=i._finderServices;s&&(n===nt?gc(A,t,e,s):Vc(A,t,e,n,i,s,r))},getContentHeight(A,t,e,n,i){if(e===nt)return 0;const r=n._finderServices;if(!r)return 0;const s=n.directoryId,o=t.useMemo(()=>s?OA(r.fs,s):[],[s,r.fs.version]),l=i.width-2-dt,a=Math.max(1,Math.floor((l-_t)/yt));let c=0;for(let d=0;d<o.length;d++){const q=TA(o[d],d,a).y+RA;q>c&&(c=q)}return c+_t},getMenubar(A,t,e,n){const i=n._finderServices;if(!i)return[];const r=e===nt,s=r?Qr(i.fs):n.directoryId;return[{label:"File",items:[{label:"New Folder",shortcut:"⌘N",disabled:!s,onClick:async()=>{if(!s)return;const l=await i.os.showDialog({message:"Name for new folder:",buttons:["Cancel","OK"],showInput:!0,inputDefault:"untitled folder"});if(l&&l!=="Cancel"){const a=i.fs.mkdir(s,l),c=r?Ci(i):Bi(i,s,fn-2-dt);i.fs.setPosition(a.id,c)}}},{label:"New Text File",disabled:!s,onClick:async()=>{if(!s)return;const l=await i.os.showDialog({message:"Name for new file:",buttons:["Cancel","OK"],showInput:!0,inputDefault:"untitled.txt"});if(l&&l!=="Cancel"){const a=await i.fs.writeFile(s,l,"","text"),c=r?Ci(i):Bi(i,s,fn-2-dt);i.fs.setPosition(a.id,c)}}},{type:"separator"},{label:"Open",shortcut:"⌘O",disabled:!0},{label:"Close",disabled:!0}]},{label:"Edit",items:[{label:"Undo",shortcut:"⌘Z",disabled:!0},{label:"Cut",shortcut:"⌘X",disabled:!0},{label:"Copy",shortcut:"⌘C",disabled:!0},{label:"Paste",shortcut:"⌘V",disabled:!0}]},{label:"View",items:[{label:"By Icon",disabled:!0},{label:"By Name",disabled:!0},{label:"By Date",disabled:!0}]},{label:"Special",items:[{label:r?"Clean Up Desktop":"Clean Up Window",disabled:!s,onClick:()=>{dc(i,r,s)}},{label:"Empty Trash",disabled:(()=>{const l=SA(i.fs);return!l||i.fs.readDir(l).length===0})(),onClick:async()=>{const l=SA(i.fs);if(!l)return;const a=i.fs.readDir(l);for(const c of a)await i.fs.remove(c.id);i.scheduleRender()}},{type:"separator"},{label:"Format Drive…",onClick:()=>void i.formatDrive()},{type:"separator"},{label:"Restart",disabled:!0},{label:"Shut Down",disabled:!0}]}]},getInfoBar(A,t,e,n){return null},getContentTopInset(A,t,e,n,i){return e===nt?0:DA}},qc={drag:null,dropTarget:null,pendingDrag:null};function sA(){return qc}function uc(A){const t=sA();return t.drag!==null||t.pendingDrag!==null}function Pn(A,t,e,n){const i=sA();if(i.pendingDrag&&!i.drag){const r=Math.abs(t-i.pendingDrag.startScreenX),s=Math.abs(e-i.pendingDrag.startScreenY);(r>=Mi||s>=Mi)&&(i.drag={fsNodeId:i.pendingDrag.fsNodeId,sourceDirectoryId:i.pendingDrag.sourceDirectoryId,img:i.pendingDrag.img,title:i.pendingDrag.title,screenX:t,screenY:e,offsetX:i.pendingDrag.offsetX,offsetY:i.pendingDrag.offsetY},i.pendingDrag=null)}i.drag&&(i.drag.screenX=t,i.drag.screenY=e,i.dropTarget=mc(t,e,n),n.scheduleRender())}function Fn(A,t,e,n){const i=sA();if(i.pendingDrag=null,!i.drag)return;const r=i.drag,s=i.dropTarget;if(i.drag=null,i.dropTarget=null,s&&SA(n.fs)!==r.fsNodeId){n.fs.move(r.fsNodeId,s.nodeId),n.scheduleRender();return}const o=r.screenX-r.offsetX,l=r.screenY-r.offsetY,a=n.getOpenFolderWindows();for(let d=a.length-1;d>=0;d--){const f=a[d];if(t>=f.contentX&&t<f.contentX+f.contentW&&e>=f.contentY&&e<f.contentY+f.contentH){const q=f.contentTopInset??0,h=o-f.contentX+f.scrollX,u=l-f.contentY-q+f.scrollY;r.sourceDirectoryId!==f.directoryId&&n.fs.move(r.fsNodeId,f.directoryId),n.fs.setPosition(r.fsNodeId,{x:h,y:u}),n.scheduleRender();return}}const c=l-n.menubarHeight;if(r.sourceDirectoryId===nt)n.fs.setPosition(r.fsNodeId,{x:o,y:c});else{const d=Qr(n.fs);d&&(n.fs.move(r.fsNodeId,d),n.fs.setPosition(r.fsNodeId,{x:o,y:c}))}n.scheduleRender()}function hc(A,t,e){const i=sA().drag;if(!i)return;const r=e.sprites.get(i.img);if(!r)return;const s=i.screenX-i.offsetX,o=i.screenY-i.offsetY,l=i.sourceDirectoryId===nt?It:yt,a=s+Math.floor((l-Ee)/2),d=St(i.title,"body")+4,f=12,q=s+Math.floor((l-d)/2),h=o+Ee,u=Math.min(a,q),m=Math.min(o,h),w=Math.max(a+r.width,q+d),M=Math.max(o+r.height,h+f),E=w-u,x=M-m;if(E<=0||x<=0)return;const k=new Uint8Array(E*x);if(r.mask){const C=a-u,z=o-m;for(let y=0;y<r.height;y++){const b=y*r.width,V=(z+y)*E+C;for(let v=0;v<r.width;v++)r.mask[b+v]&&(k[V+v]=1)}}if(d>0&&f>0){const C=q-u,z=h-m;for(let y=0;y<f;y++){const b=(z+y)*E+C;k.fill(1,b,b+d)}}Go(t,k,E,x,u,m,p)}function mc(A,t,e){const i=sA().drag;if(!i)return null;const r=e.getOpenFolderWindows();for(let l=r.length-1;l>=0;l--){const a=r[l];if(A>=a.contentX&&A<a.contentX+a.contentW&&t>=a.contentY&&t<a.contentY+a.contentH){const c=a.contentTopInset??0,d=A-a.contentX+a.scrollX,f=t-a.contentY-c+a.scrollY,q=OA(e.fs,a.directoryId),h=Math.max(1,Math.floor((a.contentW-_t)/yt));for(let u=0;u<q.length;u++){const m=q[u];if(m.nodeId===i.fsNodeId||!m.isDirectory)continue;const w=TA(m,u,h),M=WA(w.x,w.y,yt);if(d>=M.x&&d<M.x+M.w&&f>=M.y&&f<M.y+M.h)return{nodeId:m.nodeId}}break}}const s=oe(e.fs),o=t-e.menubarHeight;for(let l=0;l<s.length;l++){const a=s[l];if(a.nodeId===i.fsNodeId||!a.isDirectory&&!a.isVolume)continue;const c=ee(a,l,e),d=WA(c.x,c.y,It);if(A>=d.x&&A<d.x+d.w&&o>=d.y&&o<d.y+d.h)return{nodeId:a.nodeId}}return null}function pc(A,t,e,n){e.fillPattern(0,0,e.width,e.height,"checkers");const i=t.useMemo(()=>oe(n.fs),[n.fs.version]),[r,s]=t.useState(null),o=t.useMemo(()=>new Set,[]),a=sA().dropTarget;for(let c=0;c<i.length;c++){const d=i[c],f=ee(d,c,n),q=r===d.nodeId,h=o.has(d.title),u=(a==null?void 0:a.nodeId)===d.nodeId;Zr(e,n.sprites,d,f.x,f.y,It,q,u,h)}}function gc(A,t,e,n,i){const r=t.useMemo(()=>oe(n.fs),[n.fs.version]),[s,o]=t.useState(null),l=sA();if(e.type==="mouseDown"){const a=e.x,c=e.y,d=c-n.menubarHeight;let f=null,q=null;for(let h=0;h<r.length;h++){const u=ee(r[h],h,n),m=WA(u.x,u.y,It);if(a>=m.x&&a<m.x+m.w&&d>=m.y&&d<m.y+m.h){f=r[h],q=u;break}}f&&q?(o(f.nodeId),l.pendingDrag={fsNodeId:f.nodeId,sourceDirectoryId:nt,img:f.img,title:f.title,startScreenX:a,startScreenY:c,offsetX:a-q.x,offsetY:d-q.y}):(o(null),l.pendingDrag=null)}if(e.type==="mouseMove"&&Pn(A,e.x,e.y,n),e.type==="mouseUp"&&Fn(A,e.x,e.y,n),e.type==="doubleClick"){const a=e.x,c=e.y-n.menubarHeight;if(l.drag)return;for(let d=0;d<r.length;d++){const f=ee(r[d],d,n),q=WA(f.x,f.y,It);if(a>=q.x&&a<q.x+q.w&&c>=q.y&&c<q.y+q.h){n.openFSNode(r[d].nodeId,{x:f.x,y:f.y+n.menubarHeight,width:It,height:iA});return}}}}function xc(A,t,e,n,i,r){const s=i.directoryId,o=t.useMemo(()=>s?OA(r.fs,s):[],[s,r.fs.version]),[l,a]=t.useState(null),d=sA().dropTarget;e.clear(P);const f=[`${o.length} item${o.length!==1?"s":""}`,"2,427K in disk","7,648K available"];if(e.drawHLine(0,DA-1,e.width,p),f.length>0){const h=Math.floor((e.width-2)/f.length);for(let u=0;u<f.length;u++){const m=St(f[u],"body"),w=1+u*h+Math.floor((h-m)/2);e.drawText(f[u],w,4,{font:"body",color:p}),u<f.length-1&&e.drawVLine(1+(u+1)*h,0,DA-1,p)}}const q=Math.max(1,Math.floor((e.width-_t)/yt));e.drawScrollableContent(h=>{for(let u=0;u<o.length;u++){const m=o[u],w=TA(m,u,q),M=l===m.nodeId,E=(d==null?void 0:d.nodeId)===m.nodeId;Zr(h,r.sprites,m,w.x,w.y,yt,M,E,!1)}})}function Vc(A,t,e,n,i,r,s){const o=i.directoryId,l=t.useMemo(()=>o?OA(r.fs,o):[],[o,r.fs.version]),[a,c]=t.useState(null),d=sA(),f=s.width-2-dt,q=Math.max(1,Math.floor((f-_t)/yt)),h=s.contentOriginX??0,u=s.contentOriginY??0,m=s.contentTopInset??0,w=s.scrollY??0,M=x=>m>0?u+m+x-w:u+x,E=e.contentRegion!=="fixed"&&(e.contentRegion==="scrollable"||m===0);if(e.type==="mouseDown")if(!E)c(null),d.pendingDrag=null;else{const x=e.x,k=e.y;let C=null,z=null;for(let y=0;y<l.length;y++){const b=TA(l[y],y,q),V=WA(b.x,b.y,yt);if(x>=V.x&&x<V.x+V.w&&k>=V.y&&k<V.y+V.h){C=l[y],z=b;break}}if(C&&z){c(C.nodeId);const y=x+h,b=M(k);d.pendingDrag={fsNodeId:C.nodeId,sourceDirectoryId:o??"",img:C.img,title:C.title,startScreenX:y,startScreenY:b,offsetX:x-z.x,offsetY:k-z.y}}else c(null),d.pendingDrag=null}if(e.type==="mouseMove"&&E){const x=e.x+h,k=M(e.y);Pn(A,x,k,r)}if(e.type==="mouseUp"&&E){const x=e.x+h,k=M(e.y);Fn(A,x,k,r)}if(e.type==="doubleClick"&&E){const x=e.x,k=e.y;if(d.drag)return;for(let C=0;C<l.length;C++){const z=TA(l[C],C,q),y=WA(z.x,z.y,yt);if(x>=y.x&&x<y.x+y.w&&k>=y.y&&k<y.y+y.h){r.openFSNode(l[C].nodeId,{x:h+z.x,y:M(z.y),width:yt,height:RA});return}}}}function Zr(A,t,e,n,i,r,s,o,l){const a=t.get(e.img);if(a){const q=n+Math.floor((r-Ee)/2);o?A.blitInverted(a,q,i):l?A.blitShadowOutline(a,q,i):s?A.blitInverted(a,q,i):A.blit(a,q,i)}const c=St(e.title,"body"),d=n+Math.floor((r-c)/2),f=i+Ee;s||o?A.drawText(e.title,d,f,{font:"body",color:P,bg:p,width:c+4,align:"center",lineHeight:12}):A.drawText(e.title,d,f,{font:"body",color:p,bg:P,width:c+4,align:"center",lineHeight:12})}const wc={id:"file",title:"File",icon:"icon/file",defaultSize:{width:350,height:200},scrollable:!0,render(A,t,e){const n=e._fs,i=e.fileId,[r,s]=A.useState(e.content??"");A.useEffect(()=>{n&&i&&!e.content&&n.readFile(i).then(o=>{o!==null&&s(o)})},[i]),t.clear(P),t.drawTextBlock({text:r,x:8,y:8,maxWidth:t.width-16,font:"body"})},getContentHeight(A,t,e){const[n]=A.useState(t.content??"");return A.useMemo(()=>Cr(n,e.width-16,"body"),[n,e.width])+16}},yc="0.4.0",bc={version:yc},_c=bc.version,kc=[{username:"gustavlrsn",commits:74}],vc={id:"about",title:"About This Mockintosh",icon:"icon/computer",defaultSize:{width:343,height:160},scrollable:!1,render(A,t,e){const n=e._sprites;t.clear(P);const i=n==null?void 0:n.get("icon/computer");i&&t.blit(i,16,8),t.drawText("Mockintosh Classic",56,8,{font:"body",color:p}),t.drawText(`System Version ${_c}`,180,8,{font:"body",color:p}),t.drawText("Contributors",16,36,{font:"body",color:p}),t.drawHLine(0,50,t.width,p);let r=56;for(const s of kc){const o=n==null?void 0:n.get("user2");o&&t.blit(o,16,r),t.drawText(`@${s.username}`,36,r,{font:"body",color:p});const l=`${s.commits} commits`,a=X(l,"body");t.drawText(l,t.width-a-16,r,{font:"body",color:p}),r+=16}}},MA=64,BA=90,KA=20;function Di(A,t,e,n,i){A.drawRect(t,e,BA,KA,p),i&&A.fillRect(t+1,e+1,BA-2,KA-2,p),A.drawText(n,t+8,e+5,{font:"body",color:i?P:p})}const Ic={id:"control_panel",title:"Control Panel",icon:"icon/computer",defaultSize:{width:320,height:200},scrollable:!1,render(A,t,e){var x;const n=e._sprites,[i]=A.useState("General"),r=((x=e._systemPreferences)==null?void 0:x.colorMode)??"monochrome";t.clear(P),t.drawVLine(MA,0,t.height,p),t.drawVLine(MA+1,0,t.height,p);const s=n==null?void 0:n.get("icon/computer");if(s){const k=Math.floor((MA-32)/2);i==="General"?t.blitInverted(s,k,8):t.blit(s,k,8)}const o=i==="General"?P:p,l=i==="General"?p:null;t.drawText("General",4,44,{font:"body",color:o,bg:l,width:MA-8,align:"center"});const a=MA+8;t.drawText("Desktop pattern",a,8,{font:"body",color:p});const c=a,d=24,f=4,q=1,h=8*f+7*q;t.drawRect(c,d,h+2,h+2,p);for(let k=0;k<8;k++)for(let C=0;C<8;C++){const z=(C+k)%2===0,y=c+1+C*(f+q),b=d+1+k*(f+q);t.fillRect(y,b,f,f,z?p:P)}const u=d+h+18;t.drawText("Color mode",a,u,{font:"body",color:p});const m=u+16;Di(t,a,m,"monochrome",r==="monochrome"),Di(t,a+BA+8,m,"colors",r==="colors"),t.hitRegion("control-panel-mode-monochrome",{x:a,y:m,w:BA,h:KA},{onClick:()=>{var k;return(k=e._setColorMode)==null?void 0:k.call(e,"monochrome")}}),t.hitRegion("control-panel-mode-colors",{x:a+BA+8,y:m,w:BA,h:KA},{onClick:()=>{var k;return(k=e._setColorMode)==null?void 0:k.call(e,"colors")}});const w=m+KA+14;t.drawText("Preview",a,w,{font:"body",color:p});const M=w+16,E=[2,3,4,7,8,9];for(let k=0;k<E.length;k++){const C=a+k*18;t.fillRect(C,M,14,14,E[k]),t.drawRect(C,M,14,14,p)}},onEvent(A,t,e){if(t.type==="mouseDown"){const[,n]=A.useState("General");t.x<MA&&n("General")}}},bt=288,Ht=288,Mc=3,zc=66;function Cc(A,t,e){const n=A.current;if(n&&n.dst.canvas.width===t&&n.dst.canvas.height===e)return n;const i=new OffscreenCanvas(t,e),r=i.getContext("2d",{willReadFrequently:!0});return A.current={dst:{canvas:i,ctx:r},pixels:new Uint8Array(t*e),luminance:new Float32Array(t*e)},A.current}function Bc(A,t,e,n,i){const r=t*e;for(let s=0;s<r;s++){const o=s<<2;i[s]=A[o]*.299+A[o+1]*.587+A[o+2]*.114}for(let s=0;s<r;s++){const o=i[s],l=o<129?1:0;n[s]=l;const a=(o-(l?0:255))/8;i[s+1]+=a,i[s+2]+=a,i[s+t-1]+=a,i[s+t]+=a,i[s+t+1]+=a,i[s+(t<<1)]+=a}}const Dc=[[15,135,45,165],[195,75,225,105],[60,180,30,150],[240,120,210,90]];function Ec(A,t,e,n,i){const r=t*e;for(let s=0;s<r;s++){const o=s<<2,l=A[o]*.299+A[o+1]*.587+A[o+2]*.114,a=s%t,c=s/t|0,d=l+Dc[a&3][c&3]>>1;n[s]=d<i?1:0}}function Rc(A,t,e){const n=A.videoWidth,i=A.videoHeight,{dst:r,pixels:s,luminance:o}=t,l=r.canvas.width,a=r.canvas.height,c=Math.min(n,i),d=n-c>>1,f=i-c>>1,{ctx:q}=r;q.setTransform(-1,0,0,1,l,0),q.drawImage(A,d,f,c,c,0,0,l,a);const h=q.getImageData(0,0,l,a);e==="bayer"?Ec(h.data,l,a,s,128):(o.fill(0),Bc(h.data,l,a,s,o))}const Sc={id:"photobooth",title:"Photo Booth",icon:"icon/photobooth-smr-32",defaultSize:{width:bt,height:Ht+40},scrollable:!1,render(A,t,e){const n=e._os,[i,r]=A.useState(!0),[s,o]=A.useState(""),[l,a]=A.useState(null),[c,d]=A.useState(null),[f,q]=A.useState([]),[h,u]=A.useState(!1),[m,w]=A.useState("atkinson"),M=A.useRef(null),E=A.useRef(null),x=A.useRef(null),k=A.useRef("");if(t.clear(P),A.useEffect(()=>{let v=!1;return(async()=>{const F=await n.camera.requestAccess();v||(F||o("Camera access denied."),r(!1))})(),()=>{v=!0,n.camera.release()}},[]),A.useEffect(()=>{if(i||s)return;let v=!1,F=0;function W(){if(v)return;const S=performance.now();if(S-F>=zc){const T=n.camera.getVideoElement();if(T&&T.videoWidth>0){const U=Cc(x,bt,Ht);Rc(T,U,m)}F=S,A.scheduleRender()}M.current=requestAnimationFrame(W)}return W(),()=>{v=!0,M.current!==null&&cancelAnimationFrame(M.current)}},[m,i,s]),h){t.fillRect(0,0,t.width,t.height,P);return}if(c!==null&&f.length>c){const v=f[c];v.imageData&&t.blitImageData(v.imageData,0,0)}else x.current&&t.blit1bitPixels(x.current.pixels,bt,Ht,0,0);if(i&&t.drawText("Initializing camera...",bt/2-60,Ht/2-6,{font:"menu",color:p,bg:P}),s&&t.drawText(s,8,Ht/2,{font:"menu",color:p,bg:P}),l!==null&&l>0){const v=String(l);t.fillRect(bt/2-14,Ht/2-12,28,24,P),t.drawText(v,bt/2-4,Ht/2-8,{font:"menu",color:p})}const C=Ht;t.fillRect(0,C,t.width,40,P),t.drawHLine(0,C,t.width,p);const z=C+8,y=24,b=t.getWindow();if(b!==null){const v=c===null?`list-${f.length}`:`view-${c}-${f.length}`;if(k.current!==v&&(b.controlList.length=0,k.current=v),b.controlList.length===0)if(c===null){const F=ot(b,N(z,bt/2-30,z+y,bt/2+30),"Snap",!0,0,0,1,0,0);if(F.ref.contrlAction=(W,S)=>{S===qt&&l===null&&!i&&!s&&Wc(a,E,()=>V())},f.length>0){const W=ot(b,N(z,bt-64,z+y,bt-8),`${f.length} pic${f.length>1?"s":""}`,!0,0,0,1,0,0);W.ref.contrlAction=(S,T)=>{T===qt&&d(f.length-1)}}}else{const F=ot(b,N(z,8,z+20,72),"Delete",!0,0,0,1,0,0);F.ref.contrlAction=(U,Y)=>{if(Y===qt){const R=f.filter((O,G)=>G!==c);q(R),d(R.length>0?Math.min(c,R.length-1):null)}};const W=ot(b,N(z,72,z+20,128),"Save",!0,0,0,1,0,0);W.ref.contrlAction=(U,Y)=>{Y===qt&&Tc(n,f[c])};let S=128;if(c>0){const U=ot(b,N(z,S,z+20,S+32),"<",!0,0,0,1,0,0);U.ref.contrlAction=(Y,R)=>{R===qt&&d(c-1)},S+=32}if(c<f.length-1){const U=ot(b,N(z,S,z+20,S+32),">",!0,0,0,1,0,0);U.ref.contrlAction=(Y,R)=>{R===qt&&d(c+1)},S+=32}const T=ot(b,N(z,bt-52,z+20,bt),"Back",!0,0,0,1,0,0);T.ref.contrlAction=(U,Y)=>{Y===qt&&d(null)}}if(c===null&&b.controlList.length>0){const F=l!==null&&l>0;b.controlList[0].ref.contrlTitle=F?String(l):"Snap",b.controlList[0].ref.contrlHilite=F||i||s?255:0,f.length>0&&b.controlList[1]&&(b.controlList[1].ref.contrlTitle=`${f.length} pic${f.length>1?"s":""}`)}uA(b,t.port)}c!==null&&t.drawText(`${c+1}/${f.length}`,bt/2-12,C+12,{font:"body",color:p});function V(){if(!x.current)return;const v=x.current.pixels,F=new ImageData(bt,Ht),W=F.data;for(let S=0,T=bt*Ht;S<T;S++){const U=v[S]?0:255,Y=S<<2;W[Y]=U,W[Y+1]=U,W[Y+2]=U,W[Y+3]=255}u(!0),setTimeout(()=>u(!1),120),q(S=>[...S,{imageData:F,timestamp:Date.now()}])}},onEvent(A,t,e,n){A.useState(!0),A.useState(""),A.useState(null),A.useState(null),A.useState([]),A.useState(!1),A.useState("atkinson"),A.useRef(null),A.useRef(null),A.useRef(null),A.useRef("")},getMenubar(A,t){A.useState(!0),A.useState("");const[e]=A.useState(null);A.useState(null),A.useState([]),A.useState(!1);const[n,i]=A.useState("atkinson");return A.useRef(null),A.useRef(null),A.useRef(null),A.useRef(""),[{label:"File",items:[{label:"Take Photo",shortcut:"T",disabled:e!==null,onSelect:()=>{}}]},{label:"Dithering",items:[{type:"radiogroup",value:n,onValueChange:r=>i(r),items:[{label:"Atkinson",value:"atkinson"},{label:"Bayer",value:"bayer"}]}]}]}};function Wc(A,t,e){let n=Mc;A(n);function i(){n--,n<=0?(A(null),e()):(A(n),t.current=setTimeout(i,1e3))}t.current=setTimeout(i,1e3)}async function Tc(A,t){if(!A.fs||!t)return;const e=new Date(t.timestamp),n=`Photo ${e.toLocaleDateString()} ${e.toLocaleTimeString()}`,i=t.imageData.width,r=t.imageData.height,s=i*r,o=Math.ceil(s/4),l=new Uint8Array(o),a=t.imageData.data;for(let d=0;d<s;d++){const q=a[d*4]<128?2:1,h=Math.floor(d/4),u=6-d%4*2;l[h]|=q<<u}const c=btoa(String.fromCharCode(...l));try{const d=A.fs.resolvePath("/Mockintosh HD/Desktop Folder");d&&await A.fs.writeImage(d.id,n,{width:i,height:r,data:c})}catch(d){console.error("Failed to save photo:",d)}}const Pc=340,Fc={id:"video",title:"1984.mp4",icon:"icon/MacFlim",defaultSize:{width:Pc,height:260},scrollable:!1,render(A,t,e){const[n,i]=A.useState(!1),r=A.useRef(null);A.useRef(null);const s=A.useRef(!1);t.clear(P),r.current&&t.blitImageData(r.current,0,0);const o=t.height-18;t.fillRect(0,o,t.width,18,P);const l=t.getWindow();if(l!==null){if(!s.current){const f=N(o+1,4,o+17,20),q=ot(l,f,">",!0,0,0,1,0,0);q.ref.contrlAction=(h,u)=>{u===qt&&i(m=>!m)},s.current=!0}const d=l.controlList[0];d&&(d.ref.contrlTitle=n?"||":">"),uA(l,t.port)}const a=24,c=t.width-28;t.drawRect(a,o+1,c,16,p),t.fillRect(a+1,o+2,14,14,P),t.drawVLine(a+14,o+1,16,p),t.fillRect(a+c-15,o+2,14,14,P),t.drawVLine(a+c-15,o+1,16,p),t.fillPattern(a+15,o+2,c-30,14,"gray50")},onOpen(A,t){},onEvent(A,t,e,n){A.useState(!1),A.useRef(null),A.useRef(null),A.useRef(!1)}},Nr=8,Yr=4,Gr=6,Kr=2,Xr=4,$r=2,pe=12,qn=6,jr=4,Jr=6;function Ei(A){const t=new Map,e=/<card\s+id="([^"]+)">([\s\S]*?)<\/card>/gi;let n,i=!1;for(;(n=e.exec(A))!==null;)i=!0,t.set(n[1],Ri(n[2]));return i||t.set("home",Ri(A)),t}function Ri(A){const t=[];let e=0;const n=A.trim();for(;e<n.length;){for(;e<n.length&&/\s/.test(n[e]);)e++;if(e>=n.length)break;if(n[e]!=="<"){const f=n.indexOf("<",e),q=(f===-1?n.slice(e):n.slice(e,f)).trim();q&&t.push({type:"paragraph",segments:[{kind:"text",text:q}],align:"left"}),e=f===-1?n.length:f;continue}const i=n.slice(e).match(/^<(\w+)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*\/?>/);if(!i){e++;continue}const r=i[1].toLowerCase(),s=Lc(i[2]||""),o=e+i[0].length,l=s.align||"left";if(r==="hr"||r==="br"||r==="img"||r==="spacer"){r==="hr"?t.push({type:"hr"}):r==="br"?t.push({type:"br"}):r==="img"?t.push({type:"image",src:s.src||"",align:l}):r==="spacer"&&t.push({type:"spacer",height:parseInt(s.height||"8",10)}),e=o;continue}const a=`</${r}>`,c=n.toLowerCase().indexOf(a,o);if(c===-1){e=o;continue}const d=n.slice(o,c);if(e=c+a.length,r==="h1"||r==="h2")t.push({type:"heading",level:r==="h1"?1:2,text:un(d).trim(),align:l});else if(r==="p")t.push({type:"paragraph",segments:Si(d),align:l});else if(r==="ul"){const f=/<li>([\s\S]*?)<\/li>/gi;let q;for(;(q=f.exec(d))!==null;)t.push({type:"listItem",segments:Si(q[1])})}}return t}function Si(A){var i;const t=[],e=/<(b|a)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*>([\s\S]*?)<\/\1>|([^<]+)/g;let n;for(;(n=e.exec(A))!==null;)if(n[4]!==void 0)n[4]&&t.push({kind:"text",text:n[4]});else if(n[1]==="b")t.push({kind:"bold",text:n[3]});else if(n[1]==="a"){const r=((i=(n[2]||"").match(/href="([^"]*)"/))==null?void 0:i[1])||"";t.push({kind:"link",text:n[3],href:r})}return t}function Lc(A){const t={},e=/([\w-]+)="([^"]*)"/g;let n;for(;(n=e.exec(A))!==null;)t[n[1]]=n[2];return t}function un(A){return A.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()}function Re(A,t){const e=[];for(const n of A){const i=n.kind==="bold"?"menu":t,r=n.kind==="link",s=n.kind==="link"?n.href:void 0,l=n.text.split(/(\s+)/);for(const a of l)a&&e.push({text:a,font:i,underline:r,href:s})}return e}function Se(A,t){var r;const e=[];let n=[],i=0;for(const s of A){const o=X(s.text,s.font);if(/^\s+$/.test(s.text)){n.length>0&&(n.push(s),i+=o);continue}if(i+o>t&&n.length>0){for(;n.length>0&&/^\s+$/.test(n[n.length-1].text);)i-=X(n.pop().text,((r=n[0])==null?void 0:r.font)??"body");e.push(n),n=[],i=0}n.push(s),i+=o}if(n.length>0){for(;n.length>0&&/^\s+$/.test(n[n.length-1].text);)n.pop();n.length>0&&e.push(n)}return e}function Oc(A){let t=0;for(const e of A)t+=X(e.text,e.font);return t}function je(A,t,e,n){switch(n){case"center":return e+Math.floor((t-A)/2);case"right":return e+t-A;default:return e}}function Qc(A,t,e){const n=e.margin??8,i=e.width-n*2,r=[];let s=e.startY;for(const o of t)switch(o.type){case"heading":{const l=o.level===1,a="menu",c=pt(a);s+=l?Nr:Gr;const d=X(o.text,a),f=je(d,i,n,o.align);A.drawText(o.text,f,s,{font:a,color:p}),s+=c+(l?Yr:Kr);break}case"paragraph":{const l="body",a=pt(l),c=Re(o.segments,l),d=Se(c,i);for(const f of d){const q=Oc(f);let h=je(q,i,n,o.align);for(const u of f){const m=X(u.text,u.font);A.drawText(u.text,h,s,{font:u.font,color:p}),u.underline&&A.drawHLine(h,s+a-2,m,p),u.href&&r.push({x:h,y:s,w:m,h:a,href:u.href}),h+=m}s+=a}s+=Xr;break}case"listItem":{const l="body",a=pt(l),c=X("- ",l);A.drawText("-",n+pe-c,s,{font:l,color:p});const d=Re(o.segments,l),f=Se(d,i-pe);for(let q=0;q<f.length;q++){let h=n+pe;for(const u of f[q]){const m=X(u.text,u.font);A.drawText(u.text,h,s,{font:u.font,color:p}),u.underline&&A.drawHLine(h,s+a-2,m,p),u.href&&r.push({x:h,y:s,w:m,h:a,href:u.href}),h+=m}s+=a}s+=$r;break}case"hr":{s+=qn,A.drawDottedHLine(n,s,i,p),s+=1+qn;break}case"image":{if(e.sprites){const l=e.sprites.get(o.src);if(l){const a=je(l.width,i,n,o.align);A.blit(l,a,s),s+=l.height+jr}}break}case"spacer":{s+=o.height;break}case"br":{s+=Jr;break}}return{contentHeight:s-e.startY,links:r}}function Hc(A,t,e=8,n){const i=t-e*2;let r=0;for(const s of A)switch(s.type){case"heading":{const o=s.level===1;r+=o?Nr:Gr,r+=pt("menu"),r+=o?Yr:Kr;break}case"paragraph":{const o="body",l=pt(o),a=Re(s.segments,o),c=Se(a,i);r+=c.length*l+Xr;break}case"listItem":{const o="body",l=pt(o),a=Re(s.segments,o),c=Se(a,i-pe);r+=c.length*l+$r;break}case"hr":r+=qn*2+1;break;case"image":{if(n){const o=n.get(s.src);o&&(r+=o.height+jr)}break}case"spacer":r+=s.height;break;case"br":r+=Jr;break}return r}const We=[{name:"Mockintosh",url:"mockintosh.com",keywords:["mac","macintosh","retro","1-bit","operating system"],body:`
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
`}];function Uc(A){if(!A.trim())return[];const t=A.toLowerCase();return We.filter(e=>`${e.name} ${e.url} ${(e.keywords||[]).join(" ")} ${un(e.body)}`.toLowerCase().includes(t)).map(e=>({name:e.name,url:e.url,snippet:un(e.body).slice(0,80)}))}const Zc=200,hn=16,ts=42;function mn(A,t,e){const n=Math.min(Zc,A-40);return e?{barX:8,barY:4,barW:A-16}:{barX:Math.floor((A-n)/2),barY:Math.floor(t/3)+24,barW:n}}function Nc(A,t,e,n,i,r,s){const o=[],l=r.length>0||i.value.trim()!=="",a=mn(e,n,l);if(!l){const c="Google",d=X(c,"menu");A.drawText(c,Math.floor((e-d)/2),t+Math.floor(n/3),{font:"menu",color:p})}if(A.drawTextInput(i,a.barX,t+a.barY,a.barW,hn),l){let c=t+a.barY+hn+8;if(r.length===0)A.drawText("No results found.",8,c,{font:"body",color:p});else for(const d of r){const f=X(d.name,"menu");A.drawText(d.name,8,c,{font:"menu",color:p}),A.drawHLine(8,c+pt("menu")-2,f,p),o.push({x:0,y:c,w:e,h:ts,href:d.url}),c+=pt("menu"),A.drawText(d.url,8,c,{font:"body",color:p}),c+=pt("body"),d.snippet&&(A.drawText(d.snippet,8,c,{font:"body",color:p}),c+=pt("body")),c+=6}}s.current=o}function Wi(A,t,e,n,i,r,s,o,l,a){const c=A==="google.com";if(!We.find(h=>h.url===A)&&!c)return;const f=t.slice(0,e+1);f.push(A),i(f),r(f.length-1),n(A),s("home"),o(ht("")),l([]);const q=ht(A);q.focused=!1,a(q)}const pA=28,fe=8,Yc={id:"safari",title:"Safari",icon:"icon/safari",defaultSize:{width:384,height:220},minSize:{width:200,height:220},scrollable:!0,resizable:!0,render(A,t,e){const n=e._sprites,[i,r]=A.useState(ht("google.com")),[s,o]=A.useState("google.com"),[l,a]=A.useState(["google.com"]),[c,d]=A.useState(0),[f,q]=A.useState(ht(""));A.useState(null);const[h,u]=A.useState([]),[m,w]=A.useState("home"),M=A.useRef([]),E=A.useRef(!1);t.clear(P),t.fillRect(0,0,t.width,pA,P),t.drawHLine(0,pA-1,t.width,p);const x=t.getWindow();if(x!==null){if(!E.current){const z=ot(x,N(4,4,24,24),"<",!0,0,0,1,0,0);z.ref.contrlAction=(b,V)=>{if(V===qt&&c>0){const v=c-1;d(v),o(l[v]),w("home"),q(ht("")),u([]),r(ht(l[v]))}};const y=ot(x,N(4,24,24,44),">",!0,0,0,1,0,0);y.ref.contrlAction=(b,V)=>{if(V===qt&&c<l.length-1){const v=c+1;d(v),o(l[v]),w("home"),q(ht("")),u([]),r(ht(l[v]))}},E.current=!0}const k=x.controlList[0],C=x.controlList[1];k&&(k.ref.contrlHilite=c<=0?255:0),C&&(C.ref.contrlHilite=c>=l.length-1?255:0),uA(x,t.port)}t.drawTextInput(i,50,6,t.width-58,16,{id:"url-input",onChange:()=>{r(k=>({...k,focused:!0})),q(k=>({...k,focused:!1})),A.scheduleRender()}}),t.drawScrollableContent(k=>{const C=k.height;if(s==="google.com")Nc(k,0,k.width,C,f,h,M);else{const z=We.find(y=>y.url===s);if(z){const y=Ei(z.body),b=y.get(m)||y.values().next().value||[],V=Qc(k,b,{startY:fe,width:k.width,margin:fe,sprites:n});M.current=V.links}else k.drawText("Page not found",16,16,{font:"menu",color:p}),k.drawText(s,16,34,{font:"body",color:p}),M.current=[]}})},getContentTopInset(A,t,e){return pA},onEvent(A,t,e,n){const[i,r]=A.useState(ht("google.com")),[s,o]=A.useState("google.com"),[l,a]=A.useState(["google.com"]),[c,d]=A.useState(0),[f,q]=A.useState(ht("")),[h,u]=A.useState(null),[m,w]=A.useState([]),[,M]=A.useState("home"),E=A.useRef([]);if(A.useRef(!1),t.type==="keyDown"&&(t.key==="Enter"?i.focused?Wi(i.value,l,c,o,a,d,M,q,w,r):s==="google.com"&&w(Uc(f.value)):i.focused?ve(i,t.key,t.code,t.shiftKey,t.metaKey,t.ctrlKey)&&r({...i}):s==="google.com"&&(f.focused=!0,ve(f,t.key,t.code,t.shiftKey,t.metaKey,t.ctrlKey)&&q({...f}))),t.type==="mouseDown"||t.type==="doubleClick"){let x=!1,k=null;const C=t.contentRegion==="fixed"||t.contentRegion===void 0&&t.y<pA,z=t.contentRegion==="scrollable"||t.contentRegion===void 0&&t.y>=pA;if(!C){if(z){const y=E.current;for(const b of y)if(t.x>=b.x&&t.x<b.x+b.w&&t.y>=b.y&&t.y<b.y+b.h){b.href.startsWith("#")?M(b.href.slice(1)):Wi(b.href,l,c,o,a,d,M,q,w,r);return}if(s==="google.com"){const b=n.height-pA,V=m.length>0||f.value.trim()!=="",v=mn(n.width,b,V),F=v.barX,W=v.barY;if(t.x>=F&&t.x<F+v.barW&&t.y>=W&&t.y<W+hn){x=!0;const S=t.x-F;t.type==="doubleClick"?Mr(f,S):(Ir(f,S,t.shiftKey),k="search"),q({...f,focused:!0})}}}}r({...i,focused:!1}),x||q({...f,focused:!1}),u(k)}if(t.type==="mouseMove"&&h&&h==="search"){const x=n.height-pA,k=m.length>0||f.value.trim()!=="",C=mn(n.width,x,k),z=t.x-C.barX;zr(f,z)&&q({...f})}t.type==="mouseUp"&&h&&u(null)},getContentHeight(A,t,e){const n=t._sprites;A.useState(ht("google.com"));const[i]=A.useState("google.com");A.useState(["google.com"]),A.useState(0),A.useState(ht("")),A.useState(null);const[r]=A.useState([]),[s]=A.useState("home");if(A.useRef([]),A.useRef(!1),i==="google.com"){const c=r.length>0?28+r.length*(ts+6)+16:200;return Math.max(c,200)}const o=We.find(c=>c.url===i);if(!o)return 200;const l=Ei(o.body),a=l.get(s)||l.values().next().value||[];return Hc(a,e.width,fe,n)+fe*2}},Gc={id:"picture",title:"Picture",icon:"icon/MacFlim",defaultSize:{width:256,height:256},scrollable:!0,render(A,t,e){const n=e._sprites,i=e.src??"",r=A.useRef(!1);t.clear(P);const s=t.getWindow();if(s!==null){if(!r.current){const l=X("Print","menu")+20,a=N(4,4,24,4+l),c=ot(s,a,"Print",!0,0,0,1,0,0);c.ref.contrlAction=(d,f)=>{},r.current=!0}uA(s,t.port)}const o=n==null?void 0:n.get(i);o&&t.blit(o,0,28)},getContentHeight(A,t){return(t.height??200)+32}},NA=42,cA=20,Kc=28,Xc="https://raw.githubusercontent.com/mockintosh/app-registry/main/registry.json";async function Ti(){try{const A=await fetch(Xc);return A.ok?(await A.json()).apps??[]:[]}catch{return[]}}function Je(A){if(!A||A.type==="free")return"Free";const t=((A.amount_cents??0)/100).toFixed(2);if((A.currency??"usd").toUpperCase(),A.type==="subscription"){const e=A.interval==="year"?"/yr":"/mo";return`$${t}${e}`}return`$${t}`}const $c={id:"appstore",title:"App Store",icon:"icon/appstore-smr-32x32",defaultSize:{width:320,height:280},scrollable:!0,resizable:!0,minSize:{width:240,height:180},render(A,t,e){const[n,i]=A.useState("browse"),[r,s]=A.useState([]),[o,l]=A.useState(!0),[a,c]=A.useState(null),[d,f]=A.useState(null),[q,h]=A.useState(new Set),[u,m]=A.useState(null),w=A.useRef("");A.useEffect(()=>{Ti().then(V=>{s(V),l(!1)}).catch(()=>{c("Failed to load app catalog."),l(!1)})},[]),t.clear(P),t.drawText("App Store",t.width/2-26,4,{font:"menu",color:p}),t.drawHLine(0,16,t.width,p);const M=n==="browse",E=n==="installed",x=t.width/2;M?(t.fillRect(0,17,x,cA-1,p),t.drawText("Browse",x/2-16,20,{font:"body",color:P})):t.drawText("Browse",x/2-16,20,{font:"body",color:p}),t.hitRegion("tab-browse",{x:0,y:17,w:x,h:cA},{onMouseDown:()=>{i("browse"),f(null)}}),E?(t.fillRect(x,17,x,cA-1,p),t.drawText("Installed",x+x/2-22,20,{font:"body",color:P})):t.drawText("Installed",x+x/2-22,20,{font:"body",color:p}),t.hitRegion("tab-installed",{x,y:17,w:x,h:cA},{onMouseDown:()=>{i("installed"),f(null)}}),t.drawHLine(0,17+cA,t.width,p),t.drawVLine(x,17,cA,p);const k=17+cA+1,C=n==="browse"?r:r.filter(V=>q.has(V.id));if(o){t.drawText("Loading app catalog...",16,k+20,{font:"body",color:p});return}if(a){t.drawText(a,16,k+20,{font:"body",color:p});return}if(C.length===0){const V=n==="browse"?"No apps available yet.":"No apps installed.";t.drawText(V,16,k+20,{font:"body",color:p}),n==="browse"&&t.drawText("Check back soon!",16,k+34,{font:"body",color:p});return}let z=k;for(let V=0;V<C.length;V++){const v=C[V],F=d===V,W=q.has(v.id);F&&t.fillRect(0,z,t.width,NA,p);const S=F?P:p;t.drawText(v.title,8,z+4,{font:"menu",color:S});const T=Je(v.pricing),U=W?"Installed":T;t.drawText(U,t.width-70,z+4,{font:"body",color:S}),t.drawText(`by ${v.author} · v${v.version}`,8,z+16,{font:"body",color:S});const Y=v.description||"No description";t.drawText(Y.length>45?Y.slice(0,42)+"...":Y,8,z+28,{font:"body",color:S}),t.drawDottedHLine(0,z+NA-1,t.width,F?P:p),t.hitRegion(`app-item-${V}`,{x:0,y:z,w:t.width,h:NA},{onMouseDown:()=>f(V)}),z+=NA}const y=z+4;t.drawHLine(0,y,t.width,p);const b=t.getWindow();if(b!==null&&d===null&&(b.controlList.length=0,w.current=""),d!==null&&d<C.length){const V=C[d],v=q.has(V.id),F=u===V.id;if(b!==null){const W=`${d}-${V.id}-${v}-${u??""}`;if(w.current!==W&&(b.controlList.length=0,w.current=W),b.controlList.length===0)if(v){const S=X("Open","menu")+20,T=X("Uninstall","menu")+20,U=ot(b,N(y+4,8,y+24,8+S),"Open",!0,0,0,1,0,0);U.ref.contrlAction=(R,O)=>{var G;O===qt&&((G=e._os)==null||G.openWindow(V.id))};const Y=ot(b,N(y+4,60,y+24,60+T),"Uninstall",!0,0,0,1,0,0);Y.ref.contrlAction=(R,O)=>{O===qt&&(h(G=>{const tt=new Set(G);return tt.delete(V.id),tt}),f(null))}}else{const S=!V.pricing||V.pricing.type==="free",T=F?"Installing...":S?"Install":`Buy ${Je(V.pricing)}`,U=X(T,"menu")+20,Y=ot(b,N(y+4,8,y+24,8+U),T,!0,0,0,1,0,0);Y.ref.contrlAction=(R,O)=>{if(!(O!==qt||F)&&S&&V.entry){m(V.id);const G=e._appLoader;if(G){const tt={id:V.id,title:V.title,description:V.description??"",icon:V.id+"/icon",author:V.author,version:V.version,sdk:V.sdk,permissions:V.permissions,entry:V.entry};G.load(tt).then(()=>{h(it=>{const at=new Set(it);return at.add(V.id),at}),m(null)}).catch(it=>{console.error("Install failed:",it),m(null),c(`Failed to install ${V.title}`)})}}}}else if(!v&&b.controlList[0]){const S=!V.pricing||V.pricing.type==="free",T=F?"Installing...":S?"Install":`Buy ${Je(V.pricing)}`;b.controlList[0].ref.contrlTitle=T,b.controlList[0].ref.contrlHilite=F?255:0}uA(b,t.port)}}},onEvent(A,t,e){t.type},getContentHeight(A,t,e){const[n]=A.useState("browse"),[i]=A.useState([]),[r]=A.useState(new Set),s=n==="browse"?i:i.filter(l=>r.has(l.id));return 17+cA+1+s.length*NA+Kc+8},getMenubar(A,t){const[,e]=A.useState(!0),[,n]=A.useState([]),[,i]=A.useState(null);return[{label:"Store",items:[{label:"Refresh Catalog",onClick:()=>{e(!0),i(null),Ti().then(r=>{n(r),e(!1)})}}]}]}};function jc(A,t,e,n,i){const r=t*e;for(let s=0;s<r;s++){const o=s<<2;i[s]=A[o]*.299+A[o+1]*.587+A[o+2]*.114}for(let s=0;s<r;s++){const o=i[s],l=o<129?1:0;n[s]=l;const a=(o-(l?0:255))/8;s+1<r&&(i[s+1]+=a),s+2<r&&(i[s+2]+=a),s+t-1<r&&(i[s+t-1]+=a),s+t<r&&(i[s+t]+=a),s+t+1<r&&(i[s+t+1]+=a),s+(t<<1)<r&&(i[s+(t<<1)]+=a)}}async function Ln(A,t,e){try{const n=await createImageBitmap(A),r=new OffscreenCanvas(t,e).getContext("2d",{willReadFrequently:!0});r.drawImage(n,0,0,t,e),n.close();const s=r.getImageData(0,0,t,e),o=new Uint8Array(t*e),l=new Float32Array(t*e);return jc(s.data,t,e,o,l),o}catch{return null}}const XA="body",Jc="menu",ne=pt(XA),As=18,es=4,Pi=As+es*2+1,td=200,Ad=1,ns=4,ed="/api/chat",nd="/api/generate-image",id=["/imagine ","/img ","/image "];function rd(A){const t=A.toLowerCase();for(const e of id)if(t.startsWith(e))return A.slice(e.length).trim();return null}function Te(A){const t=Math.min(A,td),e=Math.round(t/Ad);return{w:t,h:e}}async function sd(A,t,e){try{const n=await fetch(nd,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:A})});if(!n.ok)return null;const i=await n.json();if(!i.b64)return null;const r=atob(i.b64),s=new Uint8Array(r.length);for(let a=0;a<r.length;a++)s[a]=r.charCodeAt(a);const o=new Blob([s],{type:"image/png"}),l=await Ln(o,t,e);return l?{blob:o,pixels:l,width:t,height:e}:null}catch{return null}}async function od(A){try{const t=await fetch(ed,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:A[A.length-1].content,conversationHistory:A.slice(0,-1)})});if(!t.ok)return{message:"Sorry, I couldn't reach the server."};const e=await t.json();return{message:e.message??e.error??"No response.",b64:e.b64,imagePrompt:e.imagePrompt}}catch{return{message:"Network error. Please try again."}}}function On(A,t){const e=A.split(" "),n=[];let i="";for(const r of e){const s=i?`${i} ${r}`:r;X(s,XA)>t&&i?(n.push(i),i=r):i=s}return i&&n.push(i),n.length===0&&n.push(""),n}function ld(A,t){let e=0;if(A.image){const n=A.image.height||Te(t).h;e+=n+ns}if(A.content){const n=A.role==="user"?"You: ":"Gippity: ";e+=On(n+A.content,t).length*ne}return e+=4,e}function Fi(A,t,e){let n=4;for(const i of A)n+=ld(i,e);return t&&(n+=On("Gippity: ...",e).length*ne+4),n}function Li(A,t,e,n,i,r,s,o,l){const a=t.value.trim();if(!a)return;const c=rd(a),d={role:"user",content:a},f=[...A,d];e(f),t.value="",t.cursorPos=0,t.selectionStart=0,t.selectionEnd=0,n(!0);const q=o+ne+4;if(i(Math.max(0,q-s)),c!==null){const{w:h,h:u}=Te(l);sd(c,h,u).then(m=>{const w={role:"assistant",content:m?`Here's "${c}":`:"Sorry, I couldn't generate that image.",image:m??void 0};e(M=>[...M,w]),n(!1),r()})}else od(f).then(async h=>{if(h.b64&&h.imagePrompt){const{w:u,h:m}=Te(l),w=atob(h.b64),M=new Uint8Array(w.length);for(let z=0;z<w.length;z++)M[z]=w.charCodeAt(z);const E=new Blob([M],{type:"image/png"}),x=await Ln(E,u,m),k=x?{blob:E,pixels:x,width:u,height:m}:void 0,C={role:"assistant",content:h.message,image:k};e(z=>[...z,C])}else{const u={role:"assistant",content:h.message};e(m=>[...m,u])}n(!1),r()})}const ad={id:"chatgippity",title:"ChatGippity",icon:"icon/computer",defaultSize:{width:280,height:300},scrollable:!1,resizable:!1,minSize:{width:200,height:160},render(A,t,e){const[n,i]=A.useState([]),[r]=A.useState(ht(""));r.focused||(r.focused=!0);const[s,o]=A.useState(!1),[l,a]=A.useState(0),c=A.useRef(!1);t.clear(P);const d=15,f=t.height-Pi,q=t.width-d-8,h=Fi(n,s,q);if(n.length===0&&!s){const x=f/2-20;t.drawText("Welcome to ChatGippity!",t.width/2-60,x,{font:Jc,color:p}),t.drawText("Type a message below to start chatting.",20,x+18,{font:XA,color:p}),t.drawText("Tip: ask me to generate an image!",20,x+30,{font:XA,color:p})}t.scrollArea("chat-messages",{x:0,y:0,w:t.width,h:f},{contentHeight:h,scrollOffset:l,onScroll:a,resize:"both"},x=>{let k=4;const C=s?[...n,{role:"assistant",content:"..."}]:n;for(const z of C){if(z.image){const{w:y,h:b}=Te(q);(z.image.width!==y||z.image.height!==b)&&Ln(z.image.blob,y,b).then(T=>{T&&(z.image.pixels=T,z.image.width=y,z.image.height=b,A.scheduleRender())});const V=z.image.width,v=z.image.height,F=z.image.pixels,W=new Uint8ClampedArray(V*v*4);for(let T=0;T<V*v;T++){const U=F[T]?0:255;W[T*4]=U,W[T*4+1]=U,W[T*4+2]=U,W[T*4+3]=255}const S=new ImageData(W,V,v);x.blitImageData(S,4,k),k+=v+ns}if(z.content){const y=z.role==="user"?"You: ":"Gippity: ",b=On(y+z.content,q);for(let V=0;V<b.length;V++)x.drawText(b[V],4,k+V*ne,{font:XA,color:p});k+=b.length*ne}k+=4}}),t.drawHLine(0,f,t.width,p);const u=f+es,m=40,w=t.width-m-12;t.drawTextInput(r,4,u,w,As,{id:"chat-input",onChange:()=>A.scheduleRender()});const M=20,E=t.getWindow();if(E!==null){if(!c.current){const x=ot(E,N(u-1,t.width-m-4,u-1+M,t.width-4),"Send",!0,0,0,1,0,0);x.ref.contrlAction=(k,C)=>{C!==qt||s||Li(n,r,i,o,a,()=>A.scheduleRender(),f,h,q)},c.current=!0}E.controlList[0]&&(E.controlList[0].ref.contrlHilite=s?255:0),uA(E,t.port)}},onEvent(A,t,e,n){var d;const[i,r]=A.useState([]),[s]=A.useState(ht("")),[o,l]=A.useState(!1),[a,c]=A.useState(0);if(A.useRef(!1),t.type==="keyDown"){if(t.key==="Enter"){if(!o&&((d=s==null?void 0:s.value)!=null&&d.trim())){const q=n.width-15-8,h=n.height-Pi,u=Fi(i,o,q);Li(i,s,r,l,c,()=>A.scheduleRender(),h,u,q)}return}ve(s,t.key,t.code,t.shiftKey,t.metaKey,t.ctrlKey)&&A.scheduleRender()}},getMenubar(A,t){const[,e]=A.useState([]);A.useState(ht("")),A.useState(!1);const[,n]=A.useState(0);return[{label:"File",items:[{label:"Clear Chat",onClick:()=>{e([]),n(0)}}]}]}};/*!
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
*/const YA={newline:10,reset:27};function cd(A){if(!Number.isSafeInteger(A))throw new Error(`integer expected: ${A}`)}function dd(A){if(!Number.isSafeInteger(A)||A<1||A>40)throw new Error(`Invalid version=${A}. Expected number [1..40]`)}function gA(A,t){return A.toString(2).padStart(t,"0")}function Oi(A,t){const e=A%t;return e>=0?e:t+e}function Et(A,t){return new Array(A).fill(t)}function Qi(...A){let t=0;for(const n of A)t=Math.max(t,n.length);const e=[];for(let n=0;n<t;n++)for(const i of A)n>=i.length||e.push(i[n]);return new Uint8Array(e)}function Hi(A,t,e){if(e<0||e+t.length>A.length)return!1;for(let n=0;n<t.length;n++)if(t[n]!==A[e+n])return!1;return!0}function fd(){let A,t=1/0;return{add(e,n){e>=t||(A=n,t=e)},get:()=>A,score:()=>t}}function Ui(A){return{has:t=>A.includes(t),decode:t=>{if(!Array.isArray(t)||t.length&&typeof t[0]!="string")throw new Error("alphabet.decode input should be array of strings");return t.map(e=>{if(typeof e!="string")throw new Error(`alphabet.decode: not string element=${e}`);const n=A.indexOf(e);if(n===-1)throw new Error(`Unknown letter: "${e}". Allowed: ${A}`);return n})},encode:t=>{if(!Array.isArray(t)||t.length&&typeof t[0]!="number")throw new Error("alphabet.encode input should be an array of numbers");return t.map(e=>{if(cd(e),e<0||e>=A.length)throw new Error(`Digit index outside alphabet: ${e} (alphabet: ${A.length})`);return A[e]})}}}class Bt{static size(t,e){if(typeof t=="number"&&(t={height:t,width:t}),!Number.isSafeInteger(t.height)&&t.height!==1/0)throw new Error(`Bitmap: invalid height=${t.height} (${typeof t.height})`);if(!Number.isSafeInteger(t.width)&&t.width!==1/0)throw new Error(`Bitmap: invalid width=${t.width} (${typeof t.width})`);return e!==void 0&&(t={width:Math.min(t.width,e.width),height:Math.min(t.height,e.height)}),t}static fromString(t){t=t.replace(/^\n+/g,"").replace(/\n+$/g,"");const e=t.split(String.fromCharCode(YA.newline)),n=e.length,i=new Array(n);let r;for(const s of e){const o=s.split("").map(l=>{if(l==="X")return!0;if(l===" ")return!1;if(l!=="?")throw new Error(`Bitmap.fromString: unknown symbol=${l}`)});if(r&&o.length!==r)throw new Error(`Bitmap.fromString different row sizes: width=${r} cur=${o.length}`);r=o.length,i.push(o)}return r||(r=0),new Bt({height:n,width:r},i)}constructor(t,e){const{height:n,width:i}=Bt.size(t);this.data=e||Array.from({length:n},()=>Et(i,void 0)),this.height=n,this.width=i}point(t){return this.data[t.y][t.x]}isInside(t){return 0<=t.x&&t.x<this.width&&0<=t.y&&t.y<this.height}size(t){if(!t)return{height:this.height,width:this.width};const{x:e,y:n}=this.xy(t);return{height:this.height-n,width:this.width-e}}xy(t){if(typeof t=="number"&&(t={x:t,y:t}),!Number.isSafeInteger(t.x))throw new Error(`Bitmap: invalid x=${t.x}`);if(!Number.isSafeInteger(t.y))throw new Error(`Bitmap: invalid y=${t.y}`);return t.x=Oi(t.x,this.width),t.y=Oi(t.y,this.height),t}rect(t,e,n){const{x:i,y:r}=this.xy(t),{height:s,width:o}=Bt.size(e,this.size({x:i,y:r}));for(let l=0;l<s;l++)for(let a=0;a<o;a++)this.data[r+l][i+a]=typeof n=="function"?n({x:a,y:l},this.data[r+l][i+a]):n;return this}rectRead(t,e,n){return this.rect(t,e,(i,r)=>(n(i,r),r))}hLine(t,e,n){return this.rect(t,{width:e,height:1},n)}vLine(t,e,n){return this.rect(t,{width:1,height:e},n)}border(t=2,e){const n=this.height+2*t,i=this.width+2*t,r=Et(t,e),s=Array.from({length:t},()=>Et(i,e));return new Bt({height:n,width:i},[...s,...this.data.map(o=>[...r,...o,...r]),...s])}embed(t,e){return this.rect(t,e.size(),({x:n,y:i})=>e.data[i][n])}rectSlice(t,e=this.size()){const n=new Bt(Bt.size(e,this.size(this.xy(t))));return this.rect(t,e,({x:i,y:r},s)=>n.data[r][i]=s),n}inverse(){const{height:t,width:e}=this;return new Bt({height:e,width:t}).rect({x:0,y:0},1/0,({x:i,y:r})=>this.data[i][r])}scale(t){if(!Number.isSafeInteger(t)||t>1024)throw new Error(`invalid scale factor: ${t}`);const{height:e,width:n}=this;return new Bt({height:t*e,width:t*n}).rect({x:0,y:0},1/0,({x:r,y:s})=>this.data[Math.floor(s/t)][Math.floor(r/t)])}clone(){return new Bt(this.size()).rect({x:0,y:0},this.size(),({x:e,y:n})=>this.data[n][e])}assertDrawn(){this.rectRead(0,1/0,(t,e)=>{if(typeof e!="boolean")throw new Error(`Invalid color type=${typeof e}`)})}toString(){return this.data.map(t=>t.map(e=>e===void 0?"?":e?"X":" ").join("")).join(String.fromCharCode(YA.newline))}toASCII(){const{height:t,width:e,data:n}=this;let i="";for(let r=0;r<t;r+=2){for(let s=0;s<e;s++){const o=n[r][s],l=r+1>=t?!0:n[r+1][s];!o&&!l?i+="█":!o&&l?i+="▀":o&&!l?i+="▄":o&&l&&(i+=" ")}i+=String.fromCharCode(YA.newline)}return i}toTerm(){const t=String.fromCharCode(YA.reset),e=t+"[0m",n=t+"[1;47m  "+e,i=t+"[40m  "+e;return this.data.map(r=>r.map(s=>s?i:n).join("")).join(String.fromCharCode(YA.newline))}toSVG(){let t=`<svg xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" version="1.1" xmlns="http://www.w3.org/2000/svg">`;return this.rectRead(0,1/0,({x:e,y:n},i)=>{i&&(t+=`<rect x="${e}" y="${n}" width="1" height="1" />`)}),t+="</svg>",t}toGIF(){const t=o=>[o&255,o>>>8&255],e=[...t(this.width),...t(this.height)],n=[];this.rectRead(0,1/0,(o,l)=>n.push(+(l===!0)));const i=126,r=[71,73,70,56,55,97,...e,246,0,0,255,255,255,...Et(381,0),44,0,0,0,0,...e,0,7],s=Math.floor(n.length/i);for(let o=0;o<s;o++)r.push(i+1,128,...n.slice(i*o,i*(o+1)).map(l=>+l));return r.push(n.length%i+1,128,...n.slice(s*i).map(o=>+o)),r.push(1,129,0,59),new Uint8Array(r)}toImage(t=!1){const{height:e,width:n}=this.size(),i=new Uint8Array(e*n*(t?3:4));let r=0;for(let s=0;s<e;s++)for(let o=0;o<n;o++){const l=this.data[s][o]?0:255;i[r++]=l,i[r++]=l,i[r++]=l,t||(i[r++]=255)}return{height:e,width:n,data:i}}}const Zi=["low","medium","quartile","high"],Ni=["numeric","alphanumeric","byte","kanji","eci"],qd=[26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706],ud={low:[7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],medium:[10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],quartile:[13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],high:[17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]},hd={low:[1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],medium:[1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],quartile:[1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],high:[1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]},wt={size:{encode:A=>21+4*(A-1),decode:A=>(A-17)/4},sizeType:A=>Math.floor((A+7)/17),alignmentPatterns(A){if(A===1)return[];const t=6,e=wt.size.encode(A)-t-1,n=e-t,i=Math.ceil(n/28);let r=Math.floor(n/i);r%2?r+=1:n%i*2>=i&&(r+=2);const s=[t];for(let o=1;o<i;o++)s.push(e-(i-o)*r);return s.push(e),s},ECCode:{low:1,medium:0,quartile:3,high:2},formatMask:21522,formatBits(A,t){const e=wt.ECCode[A]<<3|t;let n=e;for(let i=0;i<10;i++)n=n<<1^(n>>9)*1335;return(e<<10|n)^wt.formatMask},versionBits(A){let t=A;for(let e=0;e<12;e++)t=t<<1^(t>>11)*7973;return A<<12|t},alphabet:{numeric:Ui("0123456789"),alphanumerc:Ui("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:")},lengthBits(A,t){return{numeric:[10,12,14],alphanumeric:[9,11,13],byte:[8,16,16],kanji:[8,10,12],eci:[0,0,0]}[t][wt.sizeType(A)]},modeBits:{numeric:"0001",alphanumeric:"0010",byte:"0100",kanji:"1000",eci:"0111"},capacity(A,t){const e=qd[A-1],n=ud[t][A-1],i=hd[t][A-1],r=Math.floor(e/i)-n,s=i-e%i;return{words:n,numBlocks:i,shortBlocks:s,blockLen:r,capacity:(e-n*i)*8,total:(n+r)*i+i-s}}},Qn=[(A,t)=>(A+t)%2==0,(A,t)=>t%2==0,(A,t)=>A%3==0,(A,t)=>(A+t)%3==0,(A,t)=>(Math.floor(t/2)+Math.floor(A/3))%2==0,(A,t)=>A*t%2+A*t%3==0,(A,t)=>(A*t%2+A*t%3)%2==0,(A,t)=>((A+t)%2+A*t%3)%2==0],L={tables:(A=>{const t=Et(256,0),e=Et(256,0);for(let n=0,i=1;n<256;n++)t[n]=i,e[i]=n,i<<=1,i&256&&(i^=A);return{exp:t,log:e}})(285),exp:A=>L.tables.exp[A],log(A){if(A===0)throw new Error(`GF.log: invalid arg=${A}`);return L.tables.log[A]%255},mul(A,t){return A===0||t===0?0:L.tables.exp[(L.tables.log[A]+L.tables.log[t])%255]},add:(A,t)=>A^t,pow:(A,t)=>L.tables.exp[L.tables.log[A]*t%255],inv(A){if(A===0)throw new Error(`GF.inverse: invalid arg=${A}`);return L.tables.exp[255-L.tables.log[A]]},polynomial(A){if(A.length==0)throw new Error("GF.polymomial: invalid length");if(A[0]!==0)return A;let t=0;for(;t<A.length-1&&A[t]==0;t++);return A.slice(t)},monomial(A,t){if(A<0)throw new Error(`GF.monomial: invalid degree=${A}`);if(t==0)return[0];let e=Et(A+1,0);return e[0]=t,L.polynomial(e)},degree:A=>A.length-1,coefficient:(A,t)=>A[L.degree(A)-t],mulPoly(A,t){if(A[0]===0||t[0]===0)return[0];const e=Et(A.length+t.length-1,0);for(let n=0;n<A.length;n++)for(let i=0;i<t.length;i++)e[n+i]=L.add(e[n+i],L.mul(A[n],t[i]));return L.polynomial(e)},mulPolyScalar(A,t){if(t==0)return[0];if(t==1)return A;const e=Et(A.length,0);for(let n=0;n<A.length;n++)e[n]=L.mul(A[n],t);return L.polynomial(e)},mulPolyMonomial(A,t,e){if(t<0)throw new Error("GF.mulPolyMonomial: invalid degree");if(e==0)return[0];const n=Et(A.length+t,0);for(let i=0;i<A.length;i++)n[i]=L.mul(A[i],e);return L.polynomial(n)},addPoly(A,t){if(A[0]===0)return t;if(t[0]===0)return A;let e=A,n=t;e.length>n.length&&([e,n]=[n,e]);let i=Et(n.length,0),r=n.length-e.length,s=n.slice(0,r);for(let o=0;o<s.length;o++)i[o]=s[o];for(let o=r;o<n.length;o++)i[o]=L.add(e[o-r],n[o]);return L.polynomial(i)},remainderPoly(A,t){const e=Array.from(A);for(let n=0;n<A.length-t.length+1;n++){const i=e[n];if(i!==0)for(let r=1;r<t.length;r++)t[r]!==0&&(e[n+r]=L.add(e[n+r],L.mul(t[r],i)))}return e.slice(A.length-t.length+1,e.length)},divisorPoly(A){let t=[1];for(let e=0;e<A;e++)t=L.mulPoly(t,[1,L.pow(2,e)]);return t},evalPoly(A,t){if(t==0)return L.coefficient(A,0);let e=A[0];for(let n=1;n<A.length;n++)e=L.add(L.mul(t,e),A[n]);return e},euclidian(A,t,e){L.degree(A)<L.degree(t)&&([A,t]=[t,A]);let n=A,i=t,r=[0],s=[1];for(;2*L.degree(i)>=e;){let a=n,c=r;if(n=i,r=s,n[0]===0)throw new Error("rLast[0] === 0");i=a;let d=[0];const f=L.inv(n[0]);for(;L.degree(i)>=L.degree(n)&&i[0]!==0;){const q=L.degree(i)-L.degree(n),h=L.mul(i[0],f);d=L.addPoly(d,L.monomial(q,h)),i=L.addPoly(i,L.mulPolyMonomial(n,q,h))}if(d=L.mulPoly(d,r),s=L.addPoly(d,c),L.degree(i)>=L.degree(n))throw new Error(`Division failed r: ${i}, rLast: ${n}`)}const o=L.coefficient(s,0);if(o==0)throw new Error("sigmaTilde(0) was zero");const l=L.inv(o);return[L.mulPolyScalar(s,l),L.mulPolyScalar(i,l)]}};function md(A){return{encode(t){const e=L.divisorPoly(A),n=Array.from(t);return n.push(...e.slice(0,-1).fill(0)),Uint8Array.from(L.remainderPoly(n,e))},decode(t){const e=t.slice(),n=L.polynomial(Array.from(t));let i=Et(A,0),r=!1;for(let d=0;d<A;d++){const f=L.evalPoly(n,L.exp(d));i[i.length-1-d]=f,f!==0&&(r=!0)}if(!r)return e;i=L.polynomial(i);const s=L.monomial(A,1),[o,l]=L.euclidian(s,i,A),a=Et(L.degree(o),0);let c=0;for(let d=1;d<256&&c<a.length;d++)L.evalPoly(o,d)===0&&(a[c++]=L.inv(d));if(c!==a.length)throw new Error("RS.decode: invalid errors number");for(let d=0;d<a.length;d++){const f=e.length-1-L.log(a[d]);if(f<0)throw new Error("RS.decode: invalid error location");const q=L.inv(a[d]);let h=1;for(let u=0;u<a.length;u++)d!==u&&(h=L.mul(h,L.add(1,L.mul(a[u],q))));e[f]=L.add(e[f],L.mul(L.evalPoly(l,q),L.inv(h)))}return e}}}function pd(A,t){const{words:e,shortBlocks:n,numBlocks:i,blockLen:r,total:s}=wt.capacity(A,t),o=md(e);return{encode(l){const a=[],c=[];for(let h=0;h<i;h++){const u=h<n,m=r+(u?0:1);a.push(l.subarray(0,m)),c.push(o.encode(l.subarray(0,m))),l=l.subarray(m)}const d=Qi(...a),f=Qi(...c),q=new Uint8Array(d.length+f.length);return q.set(d),q.set(f,d.length),q},decode(l){if(l.length!==s)throw new Error(`interleave.decode: len(data)=${l.length}, total=${s}`);const a=[];for(let f=0;f<i;f++){const q=f<n;a.push(new Uint8Array(e+r+(q?0:1)))}let c=0;for(let f=0;f<r;f++)for(let q=0;q<i;q++)a[q][f]=l[c++];for(let f=n;f<i;f++)a[f][r]=l[c++];for(let f=r;f<r+e;f++)for(let q=0;q<i;q++){const h=q<n;a[q][f+(h?0:1)]=l[c++]}const d=[];for(const f of a)d.push(...Array.from(o.decode(f)).slice(0,-e));return Uint8Array.from(d)}}}function gd(A,t,e,n=!1){const i=wt.size.encode(A);let r=new Bt(i+2);const s=new Bt(3).rect(0,3,!0).border(1,!1).border(1,!0).border(1,!1);r=r.embed(0,s).embed({x:-s.width,y:0},s).embed({x:0,y:-s.height},s),r=r.rectSlice(1,i);const o=new Bt(1).rect(0,1,!0).border(1,!1).border(1,!0),l=wt.alignmentPatterns(A);for(const a of l)for(const c of l)r.data[a][c]===void 0&&r.embed({x:c-2,y:a-2},o);r=r.hLine({x:0,y:6},1/0,({x:a},c)=>c===void 0?a%2==0:c).vLine({x:6,y:0},1/0,({y:a},c)=>c===void 0?a%2==0:c);{const a=wt.formatBits(t,e),c=d=>!n&&(a>>d&1)==1;for(let d=0;d<6;d++)r.data[d][8]=c(d);for(let d=6;d<8;d++)r.data[d+1][8]=c(d);for(let d=8;d<15;d++)r.data[i-15+d][8]=c(d);for(let d=0;d<8;d++)r.data[8][i-d-1]=c(d);for(let d=8;d<9;d++)r.data[8][15-d-1+1]=c(d);for(let d=9;d<15;d++)r.data[8][15-d-1]=c(d);r.data[i-8][8]=!n}if(A>=7){const a=wt.versionBits(A);for(let c=0;c<18;c+=1){const d=!n&&(a>>c&1)==1,f=Math.floor(c/3),q=c%3+i-8-3;r.data[f][q]=d,r.data[q][f]=d}}return r}function xd(A,t,e){const n=A.height,i=Qn[t];let r=-1,s=n-1;for(let o=n-1;o>0;o-=2){for(o==6&&(o=5);;s+=r){for(let l=0;l<2;l+=1){const a=o-l;A.data[s][a]===void 0&&e(a,s,i(a,s))}if(s+r<0||s+r>=n)break}r=-r}}function Vd(A){let t="numeric";for(let e of A)if(!wt.alphabet.numeric.has(e)&&(t="alphanumeric",!wt.alphabet.alphanumerc.has(e)))return"byte";return t}function wd(A){if(typeof A!="string")throw new Error(`utf8ToBytes expected string, got ${typeof A}`);return new Uint8Array(new TextEncoder().encode(A))}function Yi(A,t,e,n){let i="",r=e.length;if(n==="numeric"){const d=wt.alphabet.numeric.decode(e.split("")),f=d.length;for(let q=0;q<f-2;q+=3)i+=gA(d[q]*100+d[q+1]*10+d[q+2],10);f%3===1?i+=gA(d[f-1],4):f%3===2&&(i+=gA(d[f-2]*10+d[f-1],7))}else if(n==="alphanumeric"){const d=wt.alphabet.alphanumerc.decode(e.split("")),f=d.length;for(let q=0;q<f-1;q+=2)i+=gA(d[q]*45+d[q+1],11);f%2==1&&(i+=gA(d[f-1],6))}else if(n==="byte"){const d=wd(e);r=d.length,i=Array.from(d).map(f=>gA(f,8)).join("")}else throw new Error("encode: unsupported type");const{capacity:s}=wt.capacity(A,t),o=gA(r,wt.lengthBits(A,n));let l=wt.modeBits[n]+o+i;if(l.length>s)throw new Error("Capacity overflow");l+="0".repeat(Math.min(4,Math.max(0,s-l.length))),l.length%8&&(l+="0".repeat(8-l.length%8));const a="1110110000010001";for(let d=0;l.length!==s;d++)l+=a[d%a.length];const c=Uint8Array.from(l.match(/(.{8})/g).map(d=>+`0b${d}`));return pd(A,t).encode(c)}function Gi(A,t,e,n,i=!1){const r=gd(A,t,n,i);let s=0;const o=8*e.length;if(xd(r,n,(l,a,c)=>{let d=!1;s<o&&(d=(e[s>>>3]>>(7-s&7)&1)!==0,s++),r.data[a][l]=d!==c}),s!==o)throw new Error("QR: bytes left after draw");return r}function yd(A){const t=A.inverse(),e=q=>{let h=0;for(let u=0,m=1,w=void 0;u<q.length;u++)w===q[u]&&(m++,u!==q.length-1)||(m>=5&&(h+=3+(m-5)),w=q[u],m=1);return h};let n=0;A.data.forEach(q=>n+=e(q)),t.data.forEach(q=>n+=e(q));let i=0,r=A.data;const s=A.width-1,o=A.height-1;for(let q=0;q<s;q++)for(let h=0;h<o;h++){const u=q+1,m=h+1;r[q][h]===r[u][h]&&r[u][h]===r[q][m]&&r[u][h]===r[u][m]&&(i+=3)}const l=q=>{const h=[!0,!1,!0,!0,!0,!1,!0],u=[!1,!1,!1,!1],m=[...h,...u],w=[...u,...h];let M=0;for(let E=0;E<q.length;E++)Hi(q,m,E)&&(M+=40),Hi(q,w,E)&&(M+=40);return M};let a=0;for(const q of A.data)a+=l(q);for(const q of t.data)a+=l(q);let c=0;A.rectRead(0,1/0,(q,h)=>c+=h?1:0);const d=c/(A.height*A.width)*100,f=10*Math.floor(Math.abs(d-50)/5);return n+i+a+f}function bd(A,t,e,n){if(n===void 0){const i=fd();for(let r=0;r<Qn.length;r++)i.add(yd(Gi(A,t,e,r,!0)),r);n=i.get()}if(n===void 0)throw new Error("Cannot find mask");return Gi(A,t,e,n)}function _d(A){if(!Zi.includes(A))throw new Error(`Invalid error correction mode=${A}. Expected: ${Zi}`)}function kd(A){if(!Ni.includes(A))throw new Error(`Encoding: invalid mode=${A}. Expected: ${Ni}`);if(A==="kanji"||A==="eci")throw new Error(`Encoding: ${A} is not supported (yet?).`)}function vd(A){if(![0,1,2,3,4,5,6,7].includes(A)||!Qn[A])throw new Error(`Invalid mask=${A}. Expected number [0..7]`)}function Id(A,t="raw",e={}){const n=e.ecc!==void 0?e.ecc:"medium";_d(n);const i=e.encoding!==void 0?e.encoding:Vd(A);kd(i),e.mask!==void 0&&vd(e.mask);let r=e.version,s,o=new Error("Unknown error");if(r!==void 0)dd(r),s=Yi(r,n,A,i);else for(let c=1;c<=40;c++)try{s=Yi(c,n,A,i),r=c;break}catch(d){o=d}if(!r||!s)throw o;let l=bd(r,n,s,e.mask);l.assertDrawn();const a=e.border===void 0?2:e.border;if(!Number.isSafeInteger(a))throw new Error(`invalid border type=${typeof a}`);if(l=l.border(a,!1),e.scale!==void 0&&(l=l.scale(e.scale)),t==="raw")return l.data;if(t==="ascii")return l.toASCII();if(t==="svg")return l.toSVG();if(t==="gif")return l.toGIF();if(t==="term")return l.toTerm();throw new Error(`Unknown output: ${t}`)}const Hn="7026651075534864a4e08f451eb7a9ce",is=`${typeof window<"u"?window.location.origin.replace("//localhost","//[::1]").replace("//127.0.0.1","//[::1]"):""}/callback.html`,Md="streaming user-read-playback-state user-modify-playback-state user-read-email playlist-read-private",Un="mockintosh:spotify:tokens",Zn="https://api.spotify.com/v1",Pt=90,pn=30,zd=16,gn=4;function Cd(){const A=new Uint8Array(64);return crypto.getRandomValues(A),btoa(String.fromCharCode(...A)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}async function Bd(A){const t=new TextEncoder().encode(A),e=await crypto.subtle.digest("SHA-256",t);return btoa(String.fromCharCode(...new Uint8Array(e))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function ge(A){try{localStorage.setItem(Un,JSON.stringify(A))}catch{}}function Ki(){try{const A=localStorage.getItem(Un);return A?JSON.parse(A):null}catch{return null}}function Dd(){try{localStorage.removeItem(Un)}catch{}}async function Ed(A,t){const e=new URLSearchParams({grant_type:"authorization_code",code:A,redirect_uri:is,client_id:Hn,code_verifier:t}),n=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:e.toString()});if(!n.ok)throw new Error(`Token exchange failed: ${n.status}`);const i=await n.json();return{access_token:i.access_token,refresh_token:i.refresh_token,expires_at:Date.now()+i.expires_in*1e3}}async function Rd(A){const t=new URLSearchParams({grant_type:"refresh_token",refresh_token:A,client_id:Hn}),e=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:t.toString()});if(!e.ok)throw new Error(`Token refresh failed: ${e.status}`);const n=await e.json();return{access_token:n.access_token,refresh_token:n.refresh_token??A,expires_at:Date.now()+n.expires_in*1e3}}async function Oe(A,t){const e=A.current;if(!e)return null;if(Date.now()>e.expires_at-6e4)try{const n=await Rd(e.refresh_token);return A.current=n,ge(n),t(n),n.access_token}catch{return A.current=null,Dd(),null}return e.access_token}async function Sd(A,t,e){const n=await Oe(t,e);if(!n)return null;const i=await fetch(`${Zn}${A}`,{headers:{Authorization:`Bearer ${n}`}});return i.ok?i.json():null}async function $A(A,t,e,n){const i=await Oe(e,n);if(!i)return!1;const r=await fetch(`${Zn}${A}`,{method:"PUT",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:t!=null?JSON.stringify(t):void 0});return r.ok||r.status===204}async function Xi(A,t,e){const n=await Oe(t,e);if(!n)return!1;const i=await fetch(`${Zn}${A}`,{method:"POST",headers:{Authorization:`Bearer ${n}`}});return i.ok||i.status===204}async function Wd(A,t){const e=await Sd("/me/playlists?limit=50",A,t);return e!=null&&e.items?e.items.map(n=>({id:n.id,name:n.name,uri:n.uri,images:n.images??[]})):[]}let $i=!1,qe=null;function Td(){return $i?Promise.resolve():qe||(qe=new Promise(A=>{window.onSpotifyWebPlaybackSDKReady=()=>{$i=!0,A()};const t=document.createElement("script");t.src="https://sdk.scdn.co/spotify-player.js",document.head.appendChild(t)}),qe)}function Pd(A,t,e,n,i){const r=t*e;for(let s=0;s<r;s++){const o=s<<2;i[s]=A[o]*.299+A[o+1]*.587+A[o+2]*.114}for(let s=0;s<r;s++){const o=i[s],l=o<129?1:0;n[s]=l;const a=(o-(l?0:255))/8;i[s+1]+=a,i[s+2]+=a,i[s+t-1]+=a,i[s+t]+=a,i[s+t+1]+=a,i[s+(t<<1)]+=a}}function Fd(A,t,e){if(A.current&&A.current.canvas.width===t&&A.current.canvas.height===e)return A.current;const n=new OffscreenCanvas(t,e),i=n.getContext("2d",{willReadFrequently:!0});return A.current={canvas:n,ctx:i,pixels:new Uint8Array(t*e),luminance:new Float32Array(t*e)},A.current}async function Ld(A,t,e,n){try{const r=await(await fetch(A)).blob(),s=await createImageBitmap(r),o=Fd(n,t,e);o.ctx.drawImage(s,0,0,t,e),s.close();const l=o.ctx.getImageData(0,0,t,e);return o.luminance.fill(0),Pd(l.data,t,e,o.pixels,o.luminance),o.pixels}catch{return null}}let Ut=null,Dt=null,xn=null,At=null;function rs(A,t,e){if(X(A,e)<=t)return A;let n=A;for(;n.length>0&&X(n+"...",e)>t;)n=n.slice(0,-1);return n+"..."}const Od={id:"spotify",title:"Spotify Player",icon:"icon/spotify",defaultSize:{width:380,height:280},scrollable:!1,render(A,t,e){const n=e._sprites,i=()=>A.scheduleRender(),[r,s]=A.useState(Ki()),[o,l]=A.useState([]),[a,c]=A.useState(-1),[d,f]=A.useState(null),[q,h]=A.useState(null),[u,m]=A.useState(""),[w,M]=A.useState(50),[E,x]=A.useState(!1),[k,C]=A.useState(0),[z,y]=A.useState(""),[b,V]=A.useState(null),v=A.useRef(r),F=A.useRef(""),W=A.useRef(null),S=A.useRef(!1),T=A.useRef(""),U=A.useRef(null),Y=A.useRef(b);v.current=r;const R=O=>{s(O),ge(O)};if(Y.current=b,A.useEffect(()=>{!r||S.current||(S.current=!0,(async()=>{try{await Td(),x(!0);const O=window.Spotify;if(!(O!=null&&O.Player))return;Dt=new O.Player({name:"Mockintosh Player",getOAuthToken:G=>{var it;const tt=(it=v.current)==null?void 0:it.access_token;tt?G(tt):Oe(v,R).then(at=>{at&&G(at)})},volume:w/100}),Dt.addListener("ready",({device_id:G})=>{xn=G,$A("/me/player",{device_ids:[G],play:!1},v,R),i()}),Dt.addListener("player_state_changed",G=>{var at,$t,jt,Ft;if(!G){f(null);return}const tt=(at=G.track_window)==null?void 0:at.current_track;f({track:tt?{name:tt.name,artists:tt.artists,album:tt.album,duration_ms:tt.duration_ms}:null,paused:G.paused,position_ms:G.position,duration_ms:G.duration});const it=((Ft=(jt=($t=tt==null?void 0:tt.album)==null?void 0:$t.images)==null?void 0:jt[0])==null?void 0:Ft.url)??"";it&&it!==T.current&&(T.current=it,m(it))}),Dt.addListener("initialization_error",({message:G})=>{y(G)}),Dt.addListener("authentication_error",({message:G})=>{console.warn("Spotify auth error:",G),y("Spotify Premium required for playback")}),await Dt.connect()}catch(O){y(O.message??"SDK failed")}})(),Wd(v,R).then(O=>{O.length>0&&l(O)}))},[r]),A.useEffect(()=>{if(!u)return;const O=ss(t.width,t.height);Ld(u,O,O,W).then(G=>{G&&h(new Uint8Array(G))})},[u]),A.useEffect(()=>(Ut&&window.removeEventListener("message",Ut),Ut=async O=>{var G;if(((G=O.data)==null?void 0:G.type)==="spotify-callback"){if(O.data.error){y(O.data.error);return}if(!(!O.data.code||!F.current))try{const tt=await Ed(O.data.code,F.current);ge(tt),s(tt),y("")}catch(tt){y(tt.message??"Auth failed")}}},window.addEventListener("message",Ut),()=>{Ut&&(window.removeEventListener("message",Ut),Ut=null)}),[]),A.useEffect(()=>{if(!b||b.status!=="qr")return;At!==null&&(clearInterval(At),At=null),U.current=null;const O=(b.interval??5)*1e3;return At=setInterval(async()=>{U.current=At;const G=Y.current;if(!G||G.status!=="qr"){At!==null&&(clearInterval(At),At=null);return}if(Date.now()>G.expiresAt){At!==null&&(clearInterval(At),At=null),V({...G,status:"expired"}),i();return}try{const it=await(await fetch(`/api/spotify/device-poll?poll_id=${encodeURIComponent(G.pollId)}`)).json();if(it.status==="ready"){At!==null&&(clearInterval(At),At=null),V(null);const at={access_token:it.access_token,refresh_token:it.refresh_token,expires_at:Date.now()+it.expires_in*1e3};ge(at),s(at)}else it.status==="expired"?(At!==null&&(clearInterval(At),At=null),V({...G,status:"expired"})):it.status==="denied"&&(At!==null&&(clearInterval(At),At=null),V({...G,status:"denied"}))}catch{}i()},O),U.current=At,()=>{At!==null&&(clearInterval(At),At=null),U.current=null}},[b==null?void 0:b.pollId,b==null?void 0:b.status]),t.clear(P),!r){Hd(t,n,A,F,y,b,V,i),z&&t.drawText(z,8,t.height-16,{font:"body",color:p});return}Zd(t,o,a,k,v,R,c,i),Nd(t,d,q,n,v,R,w,M,i),z&&t.drawText(z,Pt+4,t.height-4,{font:"body",color:p})},onEvent(A,t,e,n){A.useState(Ki()),A.useState([]),A.useState(-1),A.useState(null),A.useState(null),A.useState(""),A.useState(50),A.useState(!1);const[i,r]=A.useState(0);if(A.useState(""),A.useState(null),A.useRef(null),A.useRef(""),A.useRef(null),A.useRef(!1),A.useRef(""),A.useRef(null),A.useRef(null),t.type==="scroll"&&t.x!==void 0&&t.x<Pt){const s=t.deltaY??0;r(Math.max(0,i+s))}},onClose(A){Ut&&(window.removeEventListener("message",Ut),Ut=null),At!==null&&(clearInterval(At),At=null),Dt&&(Dt.disconnect(),Dt=null,xn=null)}};function Qd(A,t,e,n,i){const r=t.length;A.fillRect(e,n,r*i,r*i,P);for(let s=0;s<r;s++)for(let o=0;o<r;o++)t[s][o]&&A.fillRect(e+o*i,n+s*i,i,i,p)}function Hd(A,t,e,n,i,r,s,o){if(A.fillRect(0,0,A.width,A.height,p),r){if(r.status==="loading"){const y="Connecting to Spotify...",b=X(y,"body");A.drawText(y,Math.floor((A.width-b)/2),Math.floor(A.height/2),{font:"body",color:P});return}if(r.status==="expired"||r.status==="denied"){const y=r.status==="expired"?"QR code expired.":"Access denied.",b=X(y,"body");A.drawText(y,Math.floor((A.width-b)/2),Math.floor(A.height/2)-20,{font:"body",color:P});const V=80,v=18,F=Math.floor((A.width-V)/2),W=Math.floor(A.height/2);A.fillRect(F,W,V,v,P),A.drawRect(F,W,V,v,p);const S="Try Again",T=X(S,"body");A.drawText(S,F+Math.floor((V-T)/2),W+4,{font:"body",color:p}),A.hitRegion("spotify-qr-retry",{x:F,y:W,w:V,h:v},{onClick:()=>s(null)});return}if(r.qrMatrix){const y=r.qrMatrix.length,b=A.width-16,V=A.height-50,v=Math.max(1,Math.floor(Math.min(b,V)/y)),F=y*v,W=Math.floor((A.width-F)/2),S=Math.floor((A.height-F)/2)-8;Qd(A,r.qrMatrix,W,S,v),A.drawRect(W-1,S-1,F+2,F+2,P);const T=r.userCode,U=X(T,"menu");A.drawText(T,Math.floor((A.width-U)/2),S+F+4,{font:"menu",color:P});const Y="Scan with your phone",R=X(Y,"body");A.drawText(Y,Math.floor((A.width-R)/2),S-12,{font:"body",color:P})}const C="Cancel",z=X(C,"body");A.drawText(C,Math.floor((A.width-z)/2),A.height-14,{font:"body",color:P}),A.hitRegion("spotify-qr-cancel",{x:Math.floor((A.width-z)/2)-2,y:A.height-16,w:z+4,h:12},{onClick:()=>s(null)});return}const l=Math.floor(A.width/2),a=Math.floor(A.height/2)-20,c="To continue, login to Spotify:",d=X(c,"body");A.drawText(c,l-Math.floor(d/2),a-36,{font:"body",color:P});const f=t==null?void 0:t.get("icon/spotify");f&&A.blitInverted(f,l-Math.floor(f.width/2),a-16);const q=80,h=18,u=l-Math.floor(q/2),m=a+24;A.fillRect(u,m,q,h,P),A.drawRect(u,m,q,h,p);const w="Log in with QR",M=X(w,"body");A.drawText(w,u+Math.floor((q-M)/2),m+4,{font:"body",color:p}),A.hitRegion("spotify-qr-login",{x:u,y:m,w:q,h},{onClick:()=>{s({status:"loading",pollId:"",verificationUri:"",userCode:"",interval:5,expiresAt:0,qrMatrix:null}),o(),fetch("/api/spotify/device-request",{method:"POST"}).then(C=>C.json()).then(C=>{if(C.error){i(C.error),s(null),o();return}const z=C.verification_uri_complete??C.verification_uri,y=Ud(z);s({status:"qr",pollId:C.poll_id,verificationUri:z,userCode:C.user_code,interval:C.interval??5,expiresAt:Date.now()+(C.expires_in??300)*1e3,qrMatrix:y}),o()}).catch(C=>{i(C.message??"Failed to start login"),s(null),o()})}});const E="Log in via browser",x=X(E,"body"),k=m+h+8;A.drawText(E,l-Math.floor(x/2),k,{font:"body",color:P}),A.hitRegion("spotify-browser-login",{x:l-Math.floor(x/2)-2,y:k-2,w:x+4,h:12},{onClick:()=>{const C=Cd();n.current=C,Bd(C).then(z=>{const y=new URLSearchParams({response_type:"code",client_id:Hn,scope:Md,redirect_uri:is,code_challenge_method:"S256",code_challenge:z});window.open(`https://accounts.spotify.com/authorize?${y.toString()}`,"spotify-auth","width=500,height=700")})}})}function Ud(A){try{const t=Id(A,"raw"),e=Object.keys(t).length,n=[];for(let i=0;i<e;i++)n.push(Array.from(t[i]));return n}catch{return null}}function Zd(A,t,e,n,i,r,s,o){A.fillRect(0,0,Pt,A.height,P),A.drawVLine(Pt-1,0,A.height,p);const l=pt("body"),a=2;A.drawText("PLAYLISTS",4,a,{font:"body",color:p}),A.drawHLine(0,a+l+1,Pt-1,p);const c=a+l+2;A.pushClip(0,c,Pt-1,A.height-c);for(let d=0;d<t.length;d++){const f=c+d*l-n;if(f+l<c||f>A.height)continue;const q=d===e;q&&A.fillRect(0,f,Pt-1,l,p);const h=rs(t[d].name,Pt-8,"body");A.drawText(h,4,f,{font:"body",color:q?P:p});const u=d;A.hitRegion(`playlist-${d}`,{x:0,y:f,w:Pt-1,h:l},{onClick:()=>{s(u),xn&&$A("/me/player/play",{context_uri:t[u].uri},i,r),o()}})}A.popClip()}function ss(A,t){const e=Math.min(A-Pt-gn*2,t-pn-zd-gn*2);return Math.max(32,e)}function Nd(A,t,e,n,i,r,s,o,l){var G,tt,it;const a=Pt,c=A.width-Pt,d=ss(A.width,A.height),f=a+Math.floor((c-d)/2),q=gn;e&&e.length===d*d?A.blit1bitPixels(e,d,d,f,q):A.fillPattern(f,q,d,d,"gray25"),A.drawRect(f,q,d,d,p);const h=q+d+2,u=((G=t==null?void 0:t.track)==null?void 0:G.name)??"No track playing",m=((it=(tt=t==null?void 0:t.track)==null?void 0:tt.artists)==null?void 0:it.map(at=>at.name).join(", "))??"",w=m?`${u} - ${m}`:u,M=rs(w,c-8,"body");A.drawText(M,a+4,h,{font:"body",color:p});const E=A.height-pn;A.drawHLine(a,E,c,p);const x=16,k=6,C=x*3+k*2,z=a+Math.floor((c-C)/2)-30,y=E+Math.floor((pn-x)/2),b=n==null?void 0:n.get("spotify/prev");b&&A.blit(b,z,y+2),A.hitRegion("spotify-prev",{x:z,y,w:x,h:x},{onClick:()=>{Xi("/me/player/previous",i,r)}});const V=z+x+k,v=(t==null?void 0:t.paused)??!0,F=n==null?void 0:n.get(v?"spotify/play":"spotify/pause");F&&A.blit(F,V,y),A.drawRect(V-1,y-1,x+2,x+2,p),A.hitRegion("spotify-playpause",{x:V,y,w:x,h:x},{onClick:()=>{$A(v?"/me/player/play":"/me/player/pause",null,i,r)}});const W=V+x+k,S=n==null?void 0:n.get("spotify/next");S&&A.blit(S,W,y+2),A.hitRegion("spotify-next",{x:W,y,w:x,h:x},{onClick:()=>{Xi("/me/player/next",i,r)}});const T=n==null?void 0:n.get("spotify/volume"),U=W+x+k+12;T&&A.blit(T,U,y+2);const Y=U+14,R=A.width-Y-8,O=y+Math.floor(x/2);if(R>10){A.drawHLine(Y,O,R,p),A.drawHLine(Y,O+1,R,p);const at=Y+Math.floor(s/100*(R-4));A.fillRect(at,O-3,4,8,P),A.drawRect(at,O-3,4,8,p),A.hitRegion("spotify-volume",{x:Y,y:O-6,w:R,h:12},{onMouseDown:$t=>{const jt=Math.max(0,Math.min(1,($t-Y)/R)),Ft=Math.round(jt*100);o(Ft),Dt&&Dt.setVolume(Ft/100),$A(`/me/player/volume?volume_percent=${Ft}`,null,i,r),l()},onDrag:$t=>{const jt=Math.max(0,Math.min(1,($t-Y)/R)),Ft=Math.round(jt*100);o(Ft),Dt&&Dt.setVolume(Ft/100),l()}})}}function QA(A,t,e){const n=new Uint8Array(A*t),i=new Uint8Array(A*t);for(let r=0;r<t;r++){const s=e[r]||"";for(let o=0;o<A;o++){const l=s[o]||".";l==="#"?(n[r*A+o]=p,i[r*A+o]=1):l==="."?(n[r*A+o]=P,i[r*A+o]=0):(n[r*A+o]=P,i[r*A+o]=1)}}return{width:A,height:t,data:n,mask:i}}const Yd=QA(32,32,["........######..................",".....###########................","....#############...............","...####......#####..............","..###..........####.............",".###.....####...####............",".##....########..###............","###...##########..###...........","##...####....####..##...........","##..####......####.##...........","##..###........###.##...........","##..###........###.##...........","##..####......####.##...........","##...####....####..##...........","###...##########..###...........",".##....########..###............",".###.....####...####............","..###..........####.............","...####......#####..............","....#############...............",".....###########................","........######..................","................................","................................","................................","................................","................................","................................","................................","................................","................................","................................"]),Gd=QA(16,16,["................","..##............","..####..........","..######........","..########......","..##########....","..############..","..#############.","..#############.","..############..","..##########....","..########......","..######........","..####..........","..##............","................"]),Kd=QA(16,16,["................","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","................"]),Xd=QA(12,12,["............",".#....#.....",".##...##....",".###..###...",".####.####..",".##########.",".##########.",".####.####..",".###..###...",".##...##....",".#....#.....","............"]),$d=QA(12,12,["............",".....#....#.","....##...##.","...###..###.","..####.####.",".##########.",".##########.","..####.####.","...###..###.","....##...##.",".....#....#.","............"]),jd=QA(12,12,["............","......#.....",".....##.....","..#.###.....",".##.####.#..",".##.####.#.#",".##.####.#.#",".##.####.#..","..#.###.....",".....##.....","......#.....","............"]),Jd={"icon/spotify":Yd,"spotify/play":Gd,"spotify/pause":Kd,"spotify/prev":Xd,"spotify/next":$d,"spotify/volume":jd},AA=16,os=16,Vn=16,ls=24;function tf(A,t){const n=260-AA*2-8,r=Fe(A,n,"body").length*os,s=t?Vn+8:0;return{width:260,height:AA+r+s+8+ls+AA}}const Af={id:"__dialog__",title:"",icon:"icon/computer",defaultSize:{width:260,height:120},scrollable:!1,resizable:!1,render(A,t,e){const{message:n,buttons:i,showInput:r}=e,[s]=A.useState(ht(e.inputDefault??"")),o=A.useRef(!1),l=A.useRef(!1);o.current||(o.current=!0,s.focused=!0,s.selectionStart=0,s.selectionEnd=s.value.length,s.cursorPos=s.value.length);const a=t.width,c=t.height;t.clear(P),t.drawRect(-1,-1,a+2,c+2,p),t.drawRect(1,1,a-2,c-2,p),t.drawRect(2,2,a-4,c-4,p);const d=a-AA*2-8,f=Fe(n,d,"body");let q=AA;for(const u of f)t.drawText(u,AA,q,{font:"body",color:p}),q+=os;if(r){q+=4;const u=AA,m=a-AA*2;t.drawTextInput(s,u,q,m,Vn,{id:"dialog-input",onChange:()=>A.scheduleRender()}),q+=Vn+4}q+=8;const h=t.getWindow();if(h===null)throw new Error("Dialog requires a window context");if(!l.current){let u=a-AA;for(let m=i.length-1;m>=0;m--){const w=i[m],M=X(w,"menu")+24;u-=M+(m<i.length-1?12:0);const E=N(q,u,q+ls,u+M),x=ot(h,E,w,!0,0,0,1,0,m),k=e._resolve;x.ref.contrlAction=(C,z)=>{if(z===qt){const y=r?s.value:C.ref.contrlTitle;k(y)}}}l.current=!0}uA(h,t.port)},onEvent(A,t,e,n){const{buttons:i,showInput:r}=e,[s]=A.useState(ht(e.inputDefault??""));if(A.useRef(!1),t.type==="keyDown"){if(t.key==="Enter"){const o=e._resolve,l=i[i.length-1],a=r?s.value:l;o(a);return}if(t.key==="Escape"||t.metaKey&&t.key==="."){const o=e._resolve,l=i.find(a=>a==="Cancel");l&&o(l);return}r&&ve(s,t.key,t.code??"",t.shiftKey??!1,t.metaKey??!1,t.ctrlKey??!1)}}},tn=16,ji=24,Ji="Increment",ef={id:"testing",title:"Testing",icon:"icon/computer",defaultSize:{width:260,height:120},scrollable:!1,render(A,t,e){const[n,i]=A.useState(0),r=A.useRef(!1);t.clear(P);const s=t.width,o=t.height,l=`Current count: ${n}`;t.drawText(l,tn,tn,{font:"body",color:p});const a=t.getWindow();if(a===null)throw new Error("Testing app requires a window context");if(!r.current){a.controlList.length=0;const c=X(Ji,"menu")+24,d=Math.floor((s-c)/2),f=o-tn-ji,q=N(f,d,f+ji,d+c),h=ot(a,q,Ji,!0,0,0,1,0);h.ref.contrlData={default:!0},h.ref.contrlAction=(u,m)=>{m===qt&&i(w=>w+1)},r.current=!0}uA(a,t.port)}},tr=A=>{if(A.length){const t=A[A.length-1],e=t.x??90,n=t.y??5;return{x:e>25?e-25:e+25,y:n>25?n-5:n+5}}else return{x:90,y:5}},nf=1337,rf={FINDER:"finder",FILE:"file",PHOTO_BOOTH:"photobooth",ABOUT_THIS_MOCKINTOSH:"about",VIDEO:"video",SAFARI:"safari",CONTROL_PANEL:"control_panel",PICTURE:"picture"};async function Ar(A){try{const t=await fetch(`/content/${A}.txt`);return t.ok?await t.text():`Could not load ${A}`}catch{return`Could not load ${A}`}}async function as(A){const[t,e]=await Promise.all([Ar("README.md"),Ar("CONTRIBUTING.md")]),n=A.mkdir(ft,"Mockintosh HD");n.icon="icon/hd";const i=A.mkdir(n.id,"Development");await A.writeFile(i.id,"README.md",t,"text"),await A.writeFile(i.id,"CONTRIBUTING.md",e,"text"),A.mkdir(n.id,"Applications"),A.mkdir(n.id,"Trash");const r=A.mkdir(n.id,"Desktop Folder");for(const s of Nn)await A.writeFile(r.id,s.name,JSON.stringify({appId:s.appId}),"app-shortcut",{icon:s.icon});await A.flush()}async function sf(A){if(A.readDir(ft).length>0){of(A),await af(A);return}await as(A)}function of(A){const t=A.findByName(ft,"Mockintosh HD");t&&(A.mkdir(t.id,"Desktop Folder"),A.mkdir(t.id,"Trash"))}const Nn=[{name:"Photo Booth",appId:"photobooth",icon:"icon/photobooth-smr-32"},{name:"1984.mp4",appId:"video",icon:"icon/MacFlim"},{name:"Safari",appId:"safari",icon:"icon/safari"},{name:"App Store",appId:"appstore",icon:"icon/appstore-smr-32x32"},{name:"ChatGippity",appId:"chatgippity",icon:"icon/computer"},{name:"Spotify Player",appId:"spotify",icon:"icon/spotify"}],lf=new Map(Nn.map(A=>[A.appId,A]));async function af(A){const t=A.findByName(ft,"Mockintosh HD");if(!t)return;const e=A.findByName(t.id,"Desktop Folder");if(!e)return;const n=A.readDir(e.id);for(const i of n){if(i.kind!=="file")continue;const r=i;if(r.fileType!=="app-shortcut")continue;let s;try{const a=await A.readFile(r.id);a&&(s=JSON.parse(a).appId)}catch{}const o=s?lf.get(s):void 0;(!o||o.name!==r.name)&&await A.remove(r.id)}for(const i of Nn)A.findByName(e.id,i.name)||await A.writeFile(e.id,i.name,JSON.stringify({appId:i.appId}),"app-shortcut",{icon:i.icon})}async function cf(A,t){const e=A.findByName(ft,"Mockintosh HD");if(!e)return;let n=A.findByName(e.id,"System");n||(n=A.mkdir(e.id,"System"));let i=A.findByName(n.id,"InstalledApps");if(!i){i=A.mkdir(n.id,"InstalledApps");return}const r=A.readDir(i.id),s=[];for(const o of r){if(o.kind!=="file")continue;const l=o;if(l.fileType!=="app")continue;const a=await A.readFile(l.id);if(a)try{const c=JSON.parse(a);c.id&&c.entry&&s.push(c)}catch{}}s.length>0&&await t.loadAll(s)}async function df(){const A=document.createElement("canvas");A.width=K.width,A.height=K.height,document.getElementById("root").appendChild(A);const t=document.createElement("video");t.playsInline=!0,t.muted=!0,document.body.appendChild(t);const e=A.getContext("2d",{alpha:!1}),n=new yn(K.width,K.height),i={...dn};ii({width:K.width,height:K.height,pixels:n.pixels});const r=uo();ao(r),ii({width:K.width,height:K.height,pixels:n.pixels});const s=new vl,o=new il,l=new Ea,a=new CA({screenWidth:K.width,screenHeight:K.height,menubarHeight:j,onActivateChange:(I,D)=>{I&&W(I,{type:"deactivate"}),D&&W(D,{type:"activate"}),V(),R()}});[sc,wc,vc,Ic,Sc,Fc,Yc,Gc,$c,ad,Od,Af,ef].forEach(I=>o.register(I)),o.registerMultiWindow(fc);const c=new ec(s,o);rc(s);let d=Za([]),f=!0,q=0,h=0,u=1,m=null,w,M,E;async function x(I){i.colorMode!==I&&(i.colorMode=I,jn(I),R(),await ic(i))}function k(){const I=window.innerWidth,D=window.innerHeight;u=Math.max(1,Math.min(Math.floor(I/K.width),Math.floor(D/K.height))),A.style.width=`${K.width*u}px`,A.style.height=`${K.height*u}px`}k(),window.addEventListener("resize",k);const C=Ta({openWindow:(I,D)=>y(I,void 0,D),closeWindow:I=>{a.closeWindow(I),o.isMultiWindowApp("finder")&&o.destroyWindowForApp("finder",I),o.destroyInstance(I),R()},showDialog:I=>new Promise(D=>{const _="__dialog__",g=tf(I.message,I.showInput),B={message:I.message,buttons:I.buttons??["OK"],showInput:I.showInput,inputDefault:I.inputDefault,_resolve:$=>{a.closeWindow(_),o.destroyInstance(_),V(),R(),D($)}},H=o.createInstance("__dialog__",_,{...B,_sprites:s,_os:C,_systemPreferences:i,_setColorMode:x});H&&H.builder.setRenderFunction(R),a.openWindow({id:_,title:"",x:Math.floor((K.width-g.width)/2),y:Math.floor((K.height-g.height)/2),width:g.width,height:g.height,contentHeight:g.height,contentWidth:g.width,appId:"__dialog__",props:B,scrollable:!1,resizable:!1,minWidth:g.width,minHeight:g.height,windowKind:"alert",modal:!0,chromeless:!0}),V(),R()}),videoElement:t});async function z(I,D,_){const g=I;if(a.windows.find(UA=>UA.id===g)){a.bringToFront(g),R();return}const H=tr(a.windows),$={directoryId:D,_finderServices:E},kt=o.createWindowForApp("finder",g,$);kt&&kt.winBuilder.setRenderFunction(R);const Jt=340,hA=180,Qe=3,He=j+3,mA=K.width-3,_A=K.height-3;let le=Math.max(Qe,Math.min(H.x??20,mA-Jt)),HA=Math.max(He,Math.min((H.y??30)+j,_A-gt-hA));if(_){const UA={x:le,y:HA,width:Jt,height:hA+gt};await O(_,UA)}a.openWindow({id:g,title:I,x:le,y:HA,width:Jt,height:hA,contentHeight:hA,contentWidth:Jt,appId:"finder",props:$,scrollable:!0,resizable:!0,minWidth:160,minHeight:80,windowKind:"document",openedFromRect:_}),V(),R()}async function y(I,D,_,g,B){var Kn,Xn,$n;const H=o.get(I);if(!H)return;const $=D??H.title;if(a.windows.find(oA=>oA.id===$)){a.bringToFront($),R();return}const Jt=g??tr(a.windows),hA=o.createInstance(I,$,{..._,_sprites:s,_os:C,_systemPreferences:i,_setColorMode:x,_fs:w,_appLoader:c,_openFSNode:oA=>b(oA),_openWindow:(oA,hs,ms,ps)=>{const gs=rf[oA]??oA;y(gs,hs,ms,ps)},_bitCanvas:n,_windowManager:a});hA&&hA.builder.setRenderFunction(R);const Qe=K.width-6,He=K.height-j-6,mA=Math.min(H.defaultSize.width,Qe),_A=Math.min(H.defaultSize.height,He),le=H.scrollable?dt:0,HA=mA-1-le,UA=((Kn=H.minSize)==null?void 0:Kn.width)!=null&&HA<H.minSize.width?Math.max(HA,H.minSize.width):mA,ds=3,fs=j+3,qs=K.width-3,us=K.height-3,Yn=Math.max(ds,Math.min(Jt.x??20,qs-mA)),Gn=Math.max(fs,Math.min((Jt.y??30)+j,us-gt-_A));if(B){const oA={x:Yn,y:Gn,width:mA,height:_A+gt};await O(B,oA)}a.openWindow({id:$,title:D??H.title,x:Yn,y:Gn,width:mA,height:_A,contentHeight:_A,contentWidth:UA,appId:I,props:_??{},scrollable:H.scrollable??!1,resizable:H.resizable??!1,minWidth:((Xn=H.minSize)==null?void 0:Xn.width)??100,minHeight:(($n=H.minSize)==null?void 0:$n.height)??60,windowKind:"document",openedFromRect:B}),V(),R()}async function b(I,D){const _=w.getNode(I);if(!_)return;if(_.kind==="directory"){z(_.name,_.id,D);return}const g=_;if(g.fileType==="app-shortcut"){const B=await w.readFile(g.id);if(B)try{const{appId:H}=JSON.parse(B);y(H,void 0,void 0,void 0,D)}catch{}return}if(g.fileType==="app"){const B=await w.readFile(g.id);if(B)try{const H=JSON.parse(B);H.id&&H.entry&&(await c.load(H),y(H.id,void 0,void 0,void 0,D))}catch{}return}if(g.fileType==="text"){y("file",g.name,{fileId:g.id,_fs:w},void 0,D);return}if(g.fileType==="image"){await w.loadSprite(g.id)&&y("picture",g.name,{src:`fs:${g.id}`,title:g.name},void 0,D);return}}function V(){const I=F(),D=a.getActiveWindow();let _;if(D)if(D.appId==="finder"){const g=o.getMultiWindowInstance("finder",D.id);g!=null&&g.app.getMenubar&&(g.appBuilder.resetForRender(),g.winBuilder.resetForRender(),_=g.app.getMenubar(g.appBuilder,g.winBuilder,D.id,g.props))}else{const g=o.getInstance(D.id);g!=null&&g.app.getMenubar&&(g.builder.resetForRender(),_=g.app.getMenubar(g.builder,g.props))}if(!_){const g=o.getMultiWindowInstance("finder",nt);g!=null&&g.app.getMenubar&&(g.appBuilder.resetForRender(),g.winBuilder.resetForRender(),_=g.app.getMenubar(g.appBuilder,g.winBuilder,nt,g.props))}_||(_=v()),d.menus=[...I,..._]}function v(){return[{label:"File",items:[{label:"Open",shortcut:"⌘O",disabled:!0},{label:"Close",disabled:!0}]},{label:"Edit",items:[{label:"Undo",shortcut:"⌘Z",disabled:!0},{label:"Cut",shortcut:"⌘X",disabled:!0},{label:"Copy",shortcut:"⌘C",disabled:!0},{label:"Paste",shortcut:"⌘V",disabled:!0}]},{label:"View",items:[{label:"By Icon",disabled:!0},{label:"By Name",disabled:!0},{label:"By Date",disabled:!0}]},{label:"Special",items:[{label:"Clean Up Desktop",disabled:!0},{label:"Empty Trash",disabled:!0},{type:"separator"},{label:"Restart",disabled:!0},{label:"Shut Down",disabled:!0}]}]}function F(){return[{label:"",items:[{label:"About this Mockintosh...",onClick:()=>y("about")},{type:"separator"},{label:"Control Panel",onClick:()=>y("control_panel")},{label:"Testing",onClick:()=>y("testing")}]}]}function W(I,D){const _=a.windows.find(B=>B.id===I);if(_&&o.isMultiWindowApp(_.appId)){const B=o.getMultiWindowInstance(_.appId,I);if(B!=null&&B.app.onWindowEvent){B.appBuilder.resetForRender(),B.winBuilder.resetForRender();const H=a.getContentRect(_),$={width:_.width,height:_.height,contentOriginX:H.x,contentOriginY:H.y,contentTopInset:_.contentTopInset,scrollY:_.scrollY,scrollX:_.scrollX};B.app.onWindowEvent(B.appBuilder,B.winBuilder,D,I,B.props,$)}return}const g=o.getInstance(I);if(g!=null&&g.app.onEvent){const B=a.windows.find($=>$.id===I),H=B?{width:B.width,height:B.height}:g.app.defaultSize;g.builder.resetForRender(),g.app.onEvent(g.builder,D,g.props,H)}}const S={onClose:I=>{const D=a.windows.find(B=>B.id===I),_=D?{x:D.x,y:D.y,width:D.width,height:D.height+gt}:null,g=D!=null&&D.openedFromRect?{...D.openedFromRect}:null;a.closeWindow(I),o.isMultiWindowApp("finder")&&o.destroyWindowForApp("finder",I),o.destroyInstance(I),V(),R(),_&&g&&O(_,g)},onBringToFront:I=>{a.bringToFront(I),V(),R()},onContentEvent:(I,D)=>{W(I,D),R()},onZoom:I=>{const D=a.windows.find(_=>_.id===I);D&&(a.zoomWindow(D),V(),R())},scheduleRender:()=>R()},T=new ln(A);T.setZoom(u),T.onEvent(I=>{if(T.setZoom(u),I.type==="mouseMove"&&(q=I.x??0,h=I.y??0),f){(I.type==="mouseDown"||I.type==="keyDown")&&(f=!1,R());return}if(a.isDraggingOrResizing()){if(I.type==="mouseMove"){a.handleMouseMove(I.x,I.y),R();return}if(I.type==="mouseUp"){a.handleMouseUp(),R();return}}if(M&&uc()){if(I.type==="mouseMove"){M.resetForRender(),Pn(M,I.x,I.y,E),R();return}if(I.type==="mouseUp"){M.resetForRender(),Fn(M,I.x,I.y,E),l.clearPressed(),R();return}}if(I.type==="mouseMove"){if(m!=null&&m.onTrackMove){const _=a.windows.find(g=>g.id===m.windowId);if(_){const g=ae(I.x-_.x,I.y-_.y);if(m.onTrackMove(g),m.theControl.ref.contrlDefProc===4){const B=xi(m.theControl),H=m.theControl.ref.contrlData;H!=null&&H.vertical?_.scrollY=B:_.scrollX=B}R();return}}l.handleMouseMove(I.x,I.y);const D=a.getActiveWindow();if(D&&D.id!==nt){const _=a.getContentRect(D),g=a.toContentLocal(D,I.x,I.y);if(I.x>=_.x&&I.x<_.x+_.w&&I.y>=_.y&&I.y<_.y+_.h){const H=D.contentTopInset??0,$=H>0?I.y<_.y+H?"fixed":"scrollable":void 0;W(D.id,{type:"mouseMove",x:g.x,y:g.y,...$!==void 0&&{contentRegion:$}})}else D.appId==="finder"&&W(D.id,{type:"mouseMove",x:g.x,y:g.y})}R();return}if(I.type==="mouseDown"){if(d.openMenuIndex!==null){const _=l.hitTest(I.x,I.y);if(!(_!==null&&(_.id.startsWith("menubar-")||_.id==="menubar-bg"))){d.openMenuIndex=null,d.highlightedItem=null,R();return}}const D=a.findWindowWithPartCode(I.x,I.y);if(D.partCode===Er&&D.theWindow&&D.theWindow.controlList.length>0){const _=a.toContentLocal(D.theWindow,I.x,I.y),g=ae(_.x,_.y),B=ql(g,D.theWindow);if(B.theControl!==null){const H=a.ensureWindowPort(D.theWindow,r),$=gi(B.theControl,g,H);m={onTrackEnd:typeof $=="function"?$:$.onTrackEnd,windowId:D.theWindow.id,theControl:B.theControl,isScrollBar:!1},R();return}}if((D.partCode===Rr||D.partCode===Sr)&&D.theWindow){const _=D.theWindow,g=ae(I.x-_.x,I.y-_.y),B=ml(_,g);if(B.theControl){const H=a.ensureWindowPort(_,r,{useFrameRect:!0}),$=gi(B.theControl,g,H,B.partCode),kt=typeof $=="function"?$:$.onTrackEnd,Jt=typeof $=="function"?void 0:$.onTrackMove;m={onTrackEnd:kt,onTrackMove:Jt,windowId:_.id,theControl:B.theControl,isScrollBar:!0},R();return}}l.handleMouseDown(I.x,I.y),R();return}if(I.type==="mouseUp"){if(m!==null){const D=a.windows.find(g=>g.id===m.windowId);let _=0;if(D!==void 0){const g=m.isScrollBar?{x:I.x-D.x,y:I.y-D.y}:a.toContentLocal(D,I.x,I.y);if(_=m.onTrackEnd(ae(g.x,g.y)),m.theControl.ref.contrlDefProc===4){const B=xi(m.theControl),H=m.theControl.ref.contrlData;H!=null&&H.vertical?D.scrollY=B:D.scrollX=B}_!==0&&m.theControl.ref.contrlAction&&m.theControl.ref.contrlAction(m.theControl,_)}m=null,R();return}l.handleMouseUp(I.x,I.y),R();return}if(I.type==="doubleClick"){l.handleDoubleClick(I.x,I.y),R();return}if(I.type==="scroll"){const D=a.windows.slice().reverse().find(_=>{if(_.id===nt)return!1;const g=gt+(_.infoBar?20:0),B=_.width+1,H=g+_.height+1;return I.x>=_.x&&I.x<_.x+B&&I.y>=_.y&&I.y<_.y+H});if(D){if(!l.handleScroll(I.x,I.y,I.deltaY??0))if(D.scrollable){a.handleScroll(D,I.deltaY??0);const g=I.deltaX??0;g!==0&&a.handleHScroll(D,g)}else W(D.id,I);R()}return}if(I.type==="keyDown"||I.type==="keyUp"){const D=a.getActiveWindow();D&&D.id!==nt&&W(D.id,I),R()}});let U=!1,Y=!1;function R(){U||Y||(U=!0,requestAnimationFrame(tt))}function O(I,D){return Y=!0,Fa(r,e,I,D,4,30,void 0,()=>{Y=!1,R()})}function G(){const I=s.get("corner-lt"),D=s.get("corner-rt"),_=s.get("corner-lb"),g=s.get("corner-rb");I&&Vt(r,I,0,0),D&&Vt(r,D,K.width-D.width,0),_&&Vt(r,_,0,K.height-_.height),g&&Vt(r,g,K.width-g.width,K.height-g.height)}function tt(){var D;if(U=!1,Y)return;{const{baseAddr:_,rowBytes:g}=r.portBits;_.fill(P)}if(l.clear(),f){nA(r,0,0,K.width,K.height,"checkers");const _=s.get("icon/happy");_&&Vt(r,_,Math.floor((K.width-_.width)/2),Math.floor((K.height-_.height)/2));const g=s.get("cursor/default-1x");g&&Vt(r,g,q,h),G(),n.flush(e);return}for(const _ of a.windows){if(_.appId==="finder"){const B=o.getMultiWindowInstance("finder",_.id);B&&(B.app.getContentHeight&&(B.appBuilder.resetForRender(),B.winBuilder.resetForRender(),_.contentHeight=B.app.getContentHeight(B.appBuilder,B.winBuilder,_.id,B.props,{width:_.width,height:_.height})),B.app.getInfoBar&&(B.appBuilder.resetForRender(),B.winBuilder.resetForRender(),_.infoBar=B.app.getInfoBar(B.appBuilder,B.winBuilder,_.id,B.props)??void 0),B.app.getContentTopInset&&(B.appBuilder.resetForRender(),B.winBuilder.resetForRender(),_.contentTopInset=B.app.getContentTopInset(B.appBuilder,B.winBuilder,_.id,B.props,{width:_.width,height:_.height})));continue}const g=o.getInstance(_.id);if(g!=null&&g.app.getContentHeight&&(g.builder.resetForRender(),_.contentHeight=g.app.getContentHeight(g.builder,g.props,{width:_.width,height:_.height})),g!=null&&g.app.getContentWidth)g.builder.resetForRender(),_.contentWidth=g.app.getContentWidth(g.builder,g.props,{width:_.width,height:_.height});else if(_.scrollable&&((D=g==null?void 0:g.app.minSize)==null?void 0:D.width)!=null){const B=dt,H=_.width-1-B;_.contentWidth=H>=g.app.minSize.width?H:Math.max(H,g.app.minSize.width)}g!=null&&g.app.getInfoBar&&(g.builder.resetForRender(),_.infoBar=g.app.getInfoBar(g.builder,g.props)??void 0),g!=null&&g.app.getContentTopInset&&(g.builder.resetForRender(),_.contentTopInset=g.app.getContentTopInset(g.builder,g.props,{width:_.width,height:_.height}))}for(const _ of a.windows){if(_.id===nt){const B=o.getMultiWindowInstance("finder",_.id);if(B){const H=new te(r,0,j,K.width,K.height-j,0,0,l,void 0,void 0,void 0,0,0,0,0,0);B.appBuilder.resetForRender(),B.winBuilder.resetForRender(),B.app.renderWindow(B.appBuilder,B.winBuilder,H,nt,B.props),B.winBuilder.flushEffects(),l.add({id:"desktop-bg",x:0,y:j,w:K.width,h:K.height-j,onMouseDown:($,kt)=>{W(nt,{type:"mouseDown",x:$,y:kt+j})},onMouseUp:($,kt)=>{W(nt,{type:"mouseUp",x:$,y:kt+j})},onDoubleClick:($,kt)=>{W(nt,{type:"doubleClick",x:$,y:kt+j})},onDrag:($,kt)=>{W(nt,{type:"mouseMove",x:$,y:kt})}}),H.release()}continue}a.drawWindowChrome(r,_,s,l,S);const g=a.createWindowContext(_,l,r);if(_.appId==="finder"){const B=o.getMultiWindowInstance("finder",_.id);B&&(B.appBuilder.resetForRender(),B.winBuilder.resetForRender(),B.app.renderWindow(B.appBuilder,B.winBuilder,g,_.id,B.props),B.winBuilder.flushEffects())}else{const B=o.getInstance(_.id);B&&(B.builder.resetForRender(),B.app.render(B.builder,g,B.props),B.builder.flushEffects())}g.release()}M&&(M.resetForRender(),hc(M,r,E)),a.drawDragOutline(r),Ka(r,d,s.get("eaten_apple"),K.width,l,R);const I=s.get("cursor/default-1x");I&&Vt(r,I,q,h),G(),n.flush(e)}Da(s),s.registerAll(Jd),R();const it=Date.now();await Po(),Fo(js);const at=new Ac;w=new ja(at,s),await w.init(),await sf(w),Object.assign(i,await nc()),jn(i.colorMode),C.fs=w,M=o.startApp("finder"),M.setRenderFunction(R),E={sprites:s,fs:w,os:C,openFSNode:(I,D)=>b(I,D),scheduleRender:R,screenWidth:K.width,screenHeight:K.height,menubarHeight:j,getOpenFolderWindows:()=>{const I=[];for(const D of a.windows){if(D.id===nt||D.appId!=="finder")continue;const _=o.getMultiWindowInstance("finder",D.id);if(!_)continue;const g=_.props.directoryId;if(!g)continue;const B=a.getContentRect(D);I.push({windowId:D.id,directoryId:g,contentX:B.x,contentY:B.y,contentW:B.w,contentH:B.h,scrollY:D.scrollY,scrollX:D.scrollX,contentTopInset:D.contentTopInset})}return I},formatDrive:async()=>{if(await C.showDialog({message:"Erase Mockintosh HD and restore to factory state? This cannot be undone.",buttons:["Erase","Cancel"]})!=="Erase")return;const D=a.windows.filter(g=>g.appId==="finder"&&g.id!==nt).map(g=>g.id);for(const g of D)a.closeWindow(g),o.isMultiWindowApp("finder")&&o.destroyWindowForApp("finder",g),o.destroyInstance(g);const _=w.readDir(ft);for(const g of _)await w.remove(g.id);await as(w),R()}};const $t={_finderServices:E},jt=o.createWindowForApp("finder",nt,$t);jt&&jt.winBuilder.setRenderFunction(R),a.openWindow({id:nt,title:"",x:0,y:j,width:K.width,height:K.height-j,contentHeight:K.height-j,contentWidth:K.width,appId:"finder",props:$t,scrollable:!1,resizable:!1,minWidth:K.width,minHeight:K.height-j,windowKind:"desktop",chromeless:!0}),w.onChange(()=>R()),V(),await cf(w,c);const Ft=Date.now()-it,cs=Math.max(0,nf-Ft);await new Promise(I=>setTimeout(I,cs)),f=!1,setInterval(R,tl),R()}df();
