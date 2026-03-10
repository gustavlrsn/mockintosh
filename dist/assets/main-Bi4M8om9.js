import{r as tA}from"./config-C2QjskFB.js";const Ke=256,Bt=0,qA=1,Ks=2,Ls=3,Es=4,Zs=5,Gs=6,Ts=7,Qs=8,Ys=9,Ns=10,Fs=11,Rs=12,Us=13,js=14,Xs=15,go="monochrome",Js=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]],mo=new Uint32Array(Ke);let on=new Uint32Array(Ke),In=go;function yA(A,t,e,n){mo[A]=(t&255)<<16|(e&255)<<8|n&255}function _s(){yA(Bt,255,255,255),yA(qA,0,0,0),yA(Ks,221,0,0),yA(Ls,0,168,0),yA(Es,0,0,202),yA(Zs,0,151,255),yA(Gs,255,0,151),yA(Ts,255,255,0),yA(Qs,255,101,0),yA(Ys,54,0,151),yA(Ns,101,54,0),yA(Fs,151,101,54),yA(Rs,185,185,185),yA(Us,134,134,134),yA(js,69,69,69),yA(Xs,255,170,204);const A=[0,95,135,175,215,255];let t=16;for(let e=0;e<A.length;e++)for(let n=0;n<A.length;n++)for(let i=0;i<A.length;i++)yA(t++,A[e],A[n],A[i]);for(let e=0;t<Ke;e++,t++){const n=8+e*10;yA(t,n,n,n)}on=new Uint32Array(mo)}_s();function $s(){return go}function yt(){return In}function ji(A){In=A}function _A(A){if(!Number.isFinite(A))return qA;const t=A|0;return t<0?Bt:t>=Ke?Ke-1:t}function Al(A){return on[_A(A)]&16777215}function qo(A){const t=Al(A);return{r:t>>16&255,g:t>>8&255,b:t&255}}function tl(A,t,e){return A*.299+t*.587+e*.114}function el(A,t,e){let n=Bt,i=Number.POSITIVE_INFINITY;for(let r=0;r<on.length;r++){const o=on[r],s=o>>16&255,a=o>>8&255,l=o&255,d=s-A,c=a-t,p=l-e,u=d*d+c*c+p*p;if(u<i&&(i=u,n=r,u===0))break}return n}function ho(A,t,e,n,i){const r=tl(A,t,e),o=(Js[i&3][n&3]+.5)/16*255;return r<o?1:0}function xo(A,t,e){const n=_A(A);if(n===Bt)return 0;if(n===qA)return 1;const{r:i,g:r,b:o}=qo(n);return ho(i,r,o,t,e)}function bt(A){const t=_A(A);return In==="colors"?t:t===Bt?Bt:qA}function mi(A){return bt(A)}function Xi(A,t,e){const n=_A(A);return In==="colors"?qo(n):xo(n,t,e)===0?{r:255,g:255,b:255}:{r:0,g:0,b:0}}const z=1,Y=0;class qi{constructor(t,e){this.clipStack=[],this.imageData=null,this.width=t,this.height=e,this.pixels=new Uint8Array(t*e),this.clip={x:0,y:0,w:t,h:e}}pushClip(t,e,n,i){this.clipStack.push({...this.clip});const r=Math.max(this.clip.x,t),o=Math.max(this.clip.y,e),s=Math.min(this.clip.x+this.clip.w,t+n),a=Math.min(this.clip.y+this.clip.h,e+i);this.clip={x:r,y:o,w:Math.max(0,s-r),h:Math.max(0,a-o)}}popClip(){const t=this.clipStack.pop();t&&(this.clip=t)}getClip(){return{...this.clip}}flush(t){(!this.imageData||this.imageData.width!==this.width||this.imageData.height!==this.height)&&(this.imageData=t.createImageData(this.width,this.height));const e=this.imageData.data,n=this.width*this.height;for(let i=0;i<n;i++){const r=i%this.width,o=i/this.width|0,s=Xi(this.pixels[i],r,o),a=i*4;e[a]=s.r,e[a+1]=s.g,e[a+2]=s.b,e[a+3]=255}t.putImageData(this.imageData,0,0)}captureRegion(t,e,n,i){if(t=Math.max(0,t|0),e=Math.max(0,e|0),n=Math.min(n|0,this.width-t),i=Math.min(i|0,this.height-e),n<=0||i<=0)return"";const r=document.createElement("canvas");r.width=n,r.height=i;const o=r.getContext("2d"),s=o.createImageData(n,i),a=s.data;for(let l=0;l<i;l++)for(let d=0;d<n;d++){const c=(e+l)*this.width+(t+d),p=Xi(this.pixels[c],t+d,e+l),u=(l*n+d)*4;a[u]=p.r,a[u+1]=p.g,a[u+2]=p.b,a[u+3]=255}return o.putImageData(s,0,0),r.toDataURL("image/png")}drawHLine(t,e,n,i=z){if(t=t|0,e=e|0,n=n|0,e<this.clip.y||e>=this.clip.y+this.clip.h)return;const r=Math.max(t,this.clip.x,0),o=Math.min(t+n,this.clip.x+this.clip.w,this.width),s=e*this.width;for(let a=r;a<o;a++)this.pixels[s+a]=i}drawVLine(t,e,n,i=z){if(t=t|0,e=e|0,n=n|0,t<this.clip.x||t>=this.clip.x+this.clip.w)return;const r=Math.max(e,this.clip.y,0),o=Math.min(e+n,this.clip.y+this.clip.h,this.height);for(let s=r;s<o;s++)this.pixels[s*this.width+t]=i}drawRect(t,e,n,i,r=z){this.drawHLine(t,e,n,r),this.drawHLine(t,e+i-1,n,r),this.drawVLine(t,e,i,r),this.drawVLine(t+n-1,e,i,r)}fillRect(t,e,n,i,r=z){t=t|0,e=e|0,n=n|0,i=i|0;const o=Math.max(t,this.clip.x,0),s=Math.max(e,this.clip.y,0),a=Math.min(t+n,this.clip.x+this.clip.w,this.width),l=Math.min(e+i,this.clip.y+this.clip.h,this.height);for(let d=s;d<l;d++){const c=d*this.width;for(let p=o;p<a;p++)this.pixels[c+p]=r}}}const Ji="…ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĒēĘęĪīıŁłŃńŌōŐőŒœŚśŠšŪūŰűŸŹźŻżŽžȘșȚțẞ¡¿«»€°",wo=new Map;for(let A=0;A<Ji.length;A++){const t=Ji.charCodeAt(A);wo.set(t,127+A)}function nl(A){return A===10||A>=32&&A<=126?A:wo.get(A)??255}const Re=63;function yo(A,t){if(!t)return-1;const e=nl(t.charCodeAt(0));return e===255||!il(A,e)?A.glyphWidths[Re]>0?Re:-1:e}function hi(A,t){return t<0||t>255?0:A.glyphWidths[t]??0}function il(A,t){return hi(A,t)>0}function rl(A,t){return t*A.glyphStride}function ol(A,t,e,n){const i=hi(A,t);if(i<1||e<0||e>=i||n<0||n>=A.glyphHeight)return!1;const r=Math.ceil(A.maxWidth/8),o=rl(A,t)+n*r+Math.floor(e/8),s=A.glyphData[o],a=1<<7-e%8;return(s&a)!==0}function sl(A,t){let e=0,n=0,i=A.glyphHeight;for(let r=0;r<t.length;r++){const o=t[r];if(o===`
`){n=Math.max(n,e),e=0,i+=A.glyphHeight;continue}const s=yo(A,o);e+=hi(A,s)+A.spacing,n=Math.max(n,e)}return{width:n,height:i}}const ll="%%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",al="%%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",cl="%%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",dl={body:ll,menu:al,mono:cl};function ul(A){if(typeof atob=="function")return new Uint8Array(Array.from(atob(A),e=>e.charCodeAt(0)));const t=Buffer.from(A,"base64");return new Uint8Array(t.buffer,t.byteOffset,t.byteLength)}function pl(A,t){if(!t.startsWith(`%%${A}`))throw new Error(`Invalid ${A} data block`);return ul(t.slice(6))}function bo(A,t="unnamed"){if(!A.startsWith("%%FNT0")&&!A.startsWith("%%FNT1"))throw new Error("Expected a %%FNT0 or %%FNT1 Decker font record");const e=A.slice(2,6),n=pl("FNT",A);if(n.length<3)throw new Error("Decker font payload is too short");const i=Math.max(1,n[0]),r=Math.max(1,n[1]),o=n[2],s=Math.ceil(i/8)*r,a=new Uint8Array(256),l=new Uint8Array(256*s);if(e==="FNT0"){let d=3;for(let c=32;c<128&&!(d>=n.length);c++){const p=n[d++];if(d+s>n.length)break;a[c]=p,l.set(n.subarray(d,d+s),c*s),d+=s}}else{let d=3;for(;d+1<n.length;){const c=n[d++],p=n[d++];if(d+s>n.length)break;a[c]=p,l.set(n.subarray(d,d+s),c*s),d+=s}}return{name:t,maxWidth:i,glyphHeight:r,spacing:o,glyphStride:s,glyphWidths:a,glyphData:l,sourceFormat:e}}const vn=new Map;let _i=!1;function Hn(A){vn.set(A,bo(dl[A],A))}function zn(){_i||(Hn("body"),Hn("menu"),Hn("mono"),_i=!0)}function fl(A,t){zn();const e=typeof t=="string"?bo(t,A):{...t,name:A};return vn.set(A,e),e}function gl(A="body"){return zn(),vn.get(String(A))??null}function xi(A="body"){const t=gl(A);if(!t)throw new Error(`Unknown font: ${String(A)}`);return t}function Vo(A){return zn(),vn.has(A)}function KA(A){return xi(A).glyphHeight}function sn(A,t={}){const e=KA(A),n=t.lineHeight??e+(t.lineSpacing??0),i=Math.max(1,Math.floor(n));return{glyphHeight:e,lineHeight:i,glyphOffsetY:Math.max(0,i-e)}}function eA(A,t="body",e=0){const n=sl(xi(t),A).width;if(!A||e===0)return n;let i=0;for(let r=0;r<A.length;r++)A[r]!==`
`&&(i+=1);return n+i*e}function ml(A,t,e,n,i,r,o,s,a,l,d,c,p){if(!a)return;const u=xi(c),g=mi(p),f=0;let m=l;for(let h=0;h<a.length;h++){const D=a[h];if(D===`
`){m=l,d+=u.glyphHeight;continue}const M=yo(u,D),k=eA(D,c,f)-u.spacing,C=u.glyphHeight;if(M>=0&&k>0){const w=m|0,v=d|0,y=Math.max(0,i-w),I=Math.max(0,r-v),V=Math.min(k,o-w),x=Math.min(C,s-v);for(let O=I;O<x;O++){const H=v+O;if(H<0)continue;const B=(H-n)*t;for(let S=y;S<V;S++)if(ol(u,M,S,O)){const Q=w+S;Q>=0&&(A[B+(Q-e)]=g)}}}m+=eA(D,c,f)}}function ql(){return zn(),Promise.resolve()}function Mn(A,t,e="body",n=0){if(!A)return[""];const i=[],r=A.split(`
`);for(const o of r){if(!o.trim()){i.push("");continue}const s=o.split(" ");let a="";for(const l of s){const d=a?`${a} ${l}`:l;eA(d,e,n)>t&&a?(i.push(a),a=l):a=d}a&&i.push(a)}return i}function Ue(A,t){return{v:t,h:A}}function _(A,t,e,n){return{top:A,left:t,bottom:e,right:n}}function cA(A){return{top:A.top,left:A.left,bottom:A.bottom,right:A.right}}const Xt=8,wi=10,yi=33,bi=30,we=0,Qe=1,Vi=2,Dn=3,ki=4,J={thePort:null,white:new Uint8Array([0,0,0,0,0,0,0,0]),black:new Uint8Array([255,255,255,255,255,255,255,255]),gray:new Uint8Array([170,85,170,85,170,85,170,85]),ltGray:new Uint8Array([136,34,136,34,136,34,136,34]),dkGray:new Uint8Array([119,221,119,221,119,221,119,221]),arrow:{data:new Uint16Array([0,16384,24576,28672,30720,31744,32256,32512,32640,31744,27648,17920,1536,768,768,0]),mask:new Uint16Array([49152,57344,61440,63488,64512,65024,65280,65408,65472,65504,65024,61184,52992,34688,1920,896]),hotSpot:{v:1,h:1}},screenBits:{baseAddr:new Uint8Array(0),rowBytes:0,bounds:_(0,0,0,0)},randSeed:1,wideOpen:{rgn:{rgnSize:10,rgnBBox:_(-32767,-32767,32767,32767)}},rgnBuf:null,rgnIndex:0,rgnMax:0,thePoly:null,polyMax:0,_fontMeasure:null,_fontDraw:null,_screen:null};function hl(A,t){J._fontMeasure=A,J._fontDraw=t}function xl(A,t){const e=BigInt(A)*BigInt(t),n=0xffffffffn;return{hiLong:Number(e>>32n&n)|0,loLong:Number(e&n)|0}}function $i(A,t){const e=BigInt(A|0)*BigInt(t|0)>>16n;return Number(e)|0}function ko(A,t){return t===0?A>=0?2147483647:-2147483648:(A<<16)/t|0}function wl(A,t,e){const n=A[e&7],i=7-(t&7);return n>>i&1}function yl(A,t,e){switch(A){case 0:return t;case 1:return t|e;case 2:return t^e;case 3:return t&~e;case 4:return 1-t;case 5:return 1-t|e;case 6:return 1-t^e;case 7:return 1-t&~e;case 8:return t;case 9:return t|e;case 10:return t^e;case 11:return t&~e;case 12:return 1-t;case 13:return 1-t|e;case 14:return 1-t^e;case 15:return 1-t&~e;default:return t}}function bl(A,t,e,n,i){const r=i.visRgn.rgn.rgnBBox;A=Math.max(A,r.left),t=Math.max(t,r.top),e=Math.min(e,r.right),n=Math.min(n,r.bottom);const o=i.clipRgn.rgn.rgnBBox;A=Math.max(A,o.left),t=Math.max(t,o.top),e=Math.min(e,o.right),n=Math.min(n,o.bottom),A=Math.max(A,i.portRect.left),t=Math.max(t,i.portRect.top),e=Math.min(e,i.portRect.right),n=Math.min(n,i.portRect.bottom);const s=i.portBits.bounds;return A=Math.max(A,s.left),t=Math.max(t,s.top),e=Math.min(e,s.right),n=Math.min(n,s.bottom),A>=e||t>=n?null:{left:A,top:t,right:e,bottom:n}}function Ar(A,t,e){const n=A.rgn;if(e<n.rgnBBox.top||e>=n.rgnBBox.bottom||t<n.rgnBBox.left||t>=n.rgnBBox.right)return!1;if(!n.scanlines||n.scanlines.length===0)return!0;for(const i of n.scanlines)if(i.y===e){let r=!1;for(const o of i.xs){if(o>t)break;r=!r}return r}return!1}function MA(A,t,e,n,i,r,o){const s=bl(A,t,e,n,o);if(!s)return;const a=o.portBits.baseAddr,l=o.portBits.rowBytes,d=o.portBits.bounds,c=o.visRgn.rgn.scanlines&&o.visRgn.rgn.scanlines.length>0||o.clipRgn.rgn.scanlines&&o.clipRgn.rgn.scanlines.length>0;for(let p=s.top;p<s.bottom;p++){const u=(p-d.top)*l;for(let g=s.left;g<s.right;g++){if(c&&(!Ar(o.visRgn,g,p)||!Ar(o.clipRgn,g,p)))continue;const f=wl(i,g,p),m=u+(g-d.left);a[m]=yl(r,f,a[m])&1}}}function ot(A,t,e,n,i,r){MA(A,e,t,e+1,n,i,r)}function ln(A,t){return A.v>=t.top&&A.v<t.bottom&&A.h>=t.left&&A.h<t.right}function Vl(A,t,e){A.top+=e,A.left+=t,A.bottom-=e,A.right-=t}function kl(A,t,e){e.top=Math.min(A.top,t.top),e.left=Math.min(A.left,t.left),e.bottom=Math.max(A.bottom,t.bottom),e.right=Math.max(A.right,t.right)}function Ye(A,t,e){const n=J.thePort;if(n){if(n.grafProcs&&n.grafProcs.rectProc){e&&(n.fillPat=new Uint8Array(e)),n.grafProcs.rectProc(A,t);return}Il(A,t,e)}}function Il(A,t,e){const n=J.thePort;if(n&&!(t.top>=t.bottom||t.left>=t.right))switch(A){case we:{const i=Math.max(1,n.pnSize.h),r=Math.max(1,n.pnSize.v);MA(t.left,t.top,t.right,t.top+r,n.pnPat,n.pnMode,n),MA(t.left,t.bottom-r,t.right,t.bottom,n.pnPat,n.pnMode,n),MA(t.left,t.top+r,t.left+i,t.bottom-r,n.pnPat,n.pnMode,n),MA(t.right-i,t.top+r,t.right,t.bottom-r,n.pnPat,n.pnMode,n);break}case Qe:MA(t.left,t.top,t.right,t.bottom,n.pnPat,n.pnMode,n);break;case Vi:MA(t.left,t.top,t.right,t.bottom,n.bkPat,Xt,n);break;case Dn:MA(t.left,t.top,t.right,t.bottom,J.black,wi,n);break;case ki:{const i=e??n.fillPat;MA(t.left,t.top,t.right,t.bottom,i,Xt,n);break}}}function vl(A){Ye(we,A)}function Qt(A){Ye(Qe,A)}function zl(A){Ye(Vi,A)}function Ml(A){Ye(Dn,A)}function Io(A,t){Ye(ki,A,t)}function ge(A){return{rgn:{rgnSize:10,rgnBBox:cA(A)}}}function Sn(A){return new Uint8Array(A)}function tr(A){J._screen=A,J.screenBits={baseAddr:A.pixels,rowBytes:A.width,bounds:_(0,0,A.height,A.width)},J.randSeed=1,J.thePort=null}function Dl(A){const t=cA(J.screenBits.bounds);A.visRgn=ge(t),A.clipRgn=ge(_(-32767,-32767,32767,32767)),Cl(A)}function Cl(A){J.thePort=A,A.device=0,A.portBits={baseAddr:J.screenBits.baseAddr,rowBytes:J.screenBits.rowBytes,bounds:cA(J.screenBits.bounds)},A.portRect=cA(J.screenBits.bounds),A.visRgn?(A.visRgn.rgn.rgnBBox=cA(A.portRect),A.visRgn.rgn.scanlines=void 0):A.visRgn=ge(A.portRect),A.clipRgn?(A.clipRgn.rgn.rgnBBox=cA(J.wideOpen.rgn.rgnBBox),A.clipRgn.rgn.scanlines=void 0):A.clipRgn=ge(cA(J.wideOpen.rgn.rgnBBox)),A.bkPat=Sn(J.white),A.fillPat=Sn(J.black),A.pnLoc={v:0,h:0},A.pnSize={v:1,h:1},A.pnMode=Xt,A.pnPat=Sn(J.black),A.pnVis=0,A.txFont=0,A.txFace=0,A.txMode=1,A.txSize=0,A.spExtra=0,A.fgColor=yi,A.bkColor=bi,A.colrBit=0,A.patStretch=0,A.picSave=null,A.rgnSave=null,A.polySave=null,A.grafProcs=null}function ht(A){J.thePort=A}function vo(){return J.thePort}function zo(A){const t=J.thePort;t&&(t.clipRgn={rgn:{rgnSize:A.rgn.rgnSize,rgnBBox:cA(A.rgn.rgnBBox),scanlines:A.rgn.scanlines?A.rgn.scanlines.map(e=>({y:e.y,xs:[...e.xs]})):void 0}})}function Pl(A){const t=J.thePort;if(!t)return;const e=t.clipRgn.rgn;A.rgn.rgnSize=e.rgnSize,A.rgn.rgnBBox=cA(e.rgnBBox),A.rgn.scanlines=e.scanlines?e.scanlines.map(n=>({y:n.y,xs:[...n.xs]})):void 0}function Bl(A){const t=J.thePort;t&&(t.clipRgn={rgn:{rgnSize:10,rgnBBox:cA(A),scanlines:void 0}})}function Ol(){const A=J._screen?_(0,0,J._screen.height,J._screen.width):_(0,0,0,0),t=J._screen?J._screen.pixels:new Uint8Array(0),e=J._screen?J._screen.width:0;return{device:0,portBits:{baseAddr:t,rowBytes:e,bounds:cA(A)},portRect:cA(A),visRgn:ge(cA(A)),clipRgn:ge(_(-32767,-32767,32767,32767)),bkPat:new Uint8Array(8),fillPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnLoc:{v:0,h:0},pnSize:{v:1,h:1},pnMode:Xt,pnPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnVis:0,txFont:0,txFace:0,txMode:1,txSize:0,spExtra:0,fgColor:yi,bkColor:bi,colrBit:0,patStretch:0,picSave:null,rgnSave:null,polySave:null,grafProcs:null}}J.arrow;function Ii(A,t){const e=J.thePort;e&&(e.pnSize.h=A,e.pnSize.v=t)}function Hl(A){const t=J.thePort;t&&(t.pnMode=A)}function XA(A){const t=J.thePort;t&&(t.pnPat=new Uint8Array(A))}function fA(){const A=J.thePort;A&&(A.pnSize={h:1,v:1},A.pnMode=8,A.pnPat=new Uint8Array(J.black))}function wA(A,t){const e=J.thePort;e&&(e.pnLoc.h=A,e.pnLoc.v=t)}function Sl(A,t){const e=J.thePort;if(e){if(e.grafProcs&&e.grafProcs.lineProc){e.pnLoc.h,e.pnLoc.v,e.grafProcs.lineProc({h:A,v:t}),e.pnLoc.h=A,e.pnLoc.v=t;return}Wl(e,{h:A,v:t})}}function Dt(A,t){const e=J.thePort;e&&Sl(e.pnLoc.h+A,e.pnLoc.v+t)}function Wl(A,t){if(A.pnVis<0){A.pnLoc.h=t.h,A.pnLoc.v=t.v;return}const e=A.pnLoc.h,n=A.pnLoc.v,i=t.h,r=t.v,o=Math.max(1,A.pnSize.h),s=Math.max(1,A.pnSize.v);Kl(e,n,i,r,o,s,A),A.pnLoc.h=i,A.pnLoc.v=r}function Kl(A,t,e,n,i,r,o){const s=Math.abs(e-A),a=Math.abs(n-t),l=A<e?1:-1,d=t<n?1:-1;let c=s-a,p=A,u=t;const g=(f,m)=>{MA(f,m,f+i,m+r,o.pnPat,o.pnMode,o)};for(;g(p,u),!(p===e&&u===n);){const f=2*c;f>-a&&(c-=a,p+=l),f<s&&(c+=s,u+=d)}}function an(A){const t=J.thePort;t&&(t.txFont=A)}function cn(A){const t=J.thePort;t&&(t.txFace=A)}function mt(A){Ll(A,0,A.length)}function Ll(A,t,e){const n=J.thePort;if(!n)return;let i;typeof A=="string"?i=A.slice(t,t+e):i=String.fromCharCode(...A.slice(t,t+e)),J._fontDraw&&J._fontDraw(i,n.pnLoc.h,n.pnLoc.v,n);const r=El(i);n.pnLoc.h+=r}function El(A,t){return J._fontMeasure?J._fontMeasure(A):A.length*6}const Zl=[0,1144,2289,3435,4583,5734,6888,8047,9210,10380,11556,12739,13930,15130,16340,17560,18792,20036,21294,22566,23853,25157,26478,27818,29179,30560,31964,33392,34846,36327,37837,39378,40951,42560,44205,45889,47615,49385,51202,53070,54991,56970,59009,61113,63287,0,2329,4743,7249,9855,12567,15394,18346,21433,24667,28059,31625,35381,39343,43534,47976,52694,57719,63086,3297,9470,16124,23321,31135,39655,48987,59258,5091,17750,31943,47976,706,21723,46178,9473,43993,20561,7560,9459,33709,28183,19701,5309,41687,18992,65535],Gl=[1,1,2,2,2,2,2,2,2,3,3,3,3,4,4,4,5,5,6,7,8,9,11,14,19,28,57,255];function er(A){let t=A%180;t<0&&(t+=180),t>90&&(t=180-t);let e=128,n=0;t<45||(n=1,t>=64&&(n=Gl[t-64]));const r=Zl[t]&65535;let o=e<<24|n<<16|r;o=o|0;const s=(o&2147483648)!==0;return o&=2147483647,s&&(o=-o|0),o}const Yt=32768;function nr(A,t,e,n){n.ovalTop=A.top,n.ovalBot=A.bottom,t<0&&(t=0),e<0&&(e=0);const i=A.right-A.left,r=A.bottom-A.top;t>i&&(t=i),e>r&&(e=r);const o=A.left+A.right>>1;let s=o<<16|0,a=o<<16|0;a=a+Yt|0,n.leftEdge=s,n.rightEdge=a,n.oneHalf=Yt,n.ovalY=1-e,n.rsqysq=2*e-1,n.squareHi=0,n.squareLo=0;const l=ko(e,t),{hiLong:d,loLong:c}=xl(l,l);n.oddNumHi=d,n.oddNumLo=c;const p=c>>>0>=2147483648?1:0;n.oddBumpLo=c<<1|0,n.oddBumpHi=(d<<1)+p|0}function ir(A,t){if(t<A.ovalTop||t>=A.ovalBot)return;const e=A.ovalY;A.ovalY+=2;let n=A.rsqysq,i=A.squareHi,r=A.squareLo,o=A.oddNumHi,s=A.oddNumLo;const a=A.oddBumpHi,l=A.oddBumpLo;let d=A.leftEdge,c=A.rightEdge;for(;i<n;){c=c+Yt|0,d=d-Yt|0;const u=r+s|0,g=(r>>>0)+(s>>>0)>4294967295?1:0;r=u,i=i+o+g|0;const f=s+l|0,m=(s>>>0)+(l>>>0)>4294967295?1:0;s=f,o=o+a+m|0}for(;i>n;){c=c-Yt|0,d=d+Yt|0,s=s-l|0;const u=s>>>0<l>>>0?1:0;o=o-a-u|0,r=r-s|0;const g=r>>>0<s>>>0?1:0;i=i-o-g|0}const p=e+1;n=n-4*p|0,A.rsqysq=n,A.squareHi=i,A.squareLo=r,A.oddNumHi=o,A.oddNumLo=s,A.leftEdge=d,A.rightEdge=c}function NA(A){return A>>16}function vi(A,t,e,n,i,r,o,s,a,l){const d=A,c={ovalTop:0,ovalBot:0,ovalY:0,rsqysq:0,squareHi:0,squareLo:0,oddNumHi:0,oddNumLo:0,oddBumpHi:0,oddBumpLo:0,leftEdge:0,rightEdge:0,oneHalf:Yt};nr(A,t,e,c);let p=null;if(n){const H=Math.max(1,l.pnSize.h),B=Math.max(1,l.pnSize.v),S=A.top+B,Q=A.bottom-B,N=A.left+H,E=A.right-H;N<E&&S<Q&&(p={ovalTop:S,ovalBot:Q,ovalY:0,rsqysq:0,squareHi:0,squareLo:0,oddNumHi:0,oddNumLo:0,oddBumpHi:0,oddBumpLo:0,leftEdge:0,rightEdge:0,oneHalf:Yt},nr({top:S,left:N,bottom:Q,right:E},Math.max(0,t-2*H),Math.max(0,e-2*B),p))}const u=A.right-A.left,g=A.bottom-A.top,f=A.top+A.bottom>>1,m=A.left+A.right>>1,h=c.ovalTop+(e>>1),D=A.bottom-A.top-e+h;let M=0,k=0,C=0,w=0,v=0,y=0,I=!1;const V=i<360;if(V){const H=ko(u,g);C=$i(er(r),H),w=$i(er(o),H);const B=m<<16|0,S=g>>1;M=B-C*S|0,k=B-w*S|0,v=r<180?r-90:-(270-r),y=o<180?o-90:-(270-o),i>180?I=!1:i<180?I=v>=0&&y>=0:I=r===90}let x=c.ovalTop;const O=c.ovalBot;for(;x<O;){if((x<h||x>=D)&&(ir(c,x),p&&ir(p,x)),V&&x===f){if(v=-v,y=-y,I=!1,!(i>180)){if(i<180){if(v>=0&&y>=0)break}else if(r===270)break}const E=M;M=k,k=E;const R=C;C=w,w=R}if(x<d.top||I){M=M+C|0,k=k+w|0,x++;continue}let B=NA(c.leftEdge),S=NA(c.rightEdge);const Q=NA(M),N=NA(k);if(V&&(v<0&&Q>B&&(B=Q),y<0&&N<S&&(S=N)),V){if(p){let E=NA(p.leftEdge),R=NA(p.rightEdge);y<0&&N<E&&(E=N),v<0&&Q>R&&(R=Q),B<S?(ot(B,E,x,s,a,l),ot(R,S,x,s,a,l)):v<0&&y<0&&i>180&&(E===S&&ot(NA(p.leftEdge),E,x,s,a,l),ot(NA(c.leftEdge),E,x,s,a,l),ot(R,NA(c.rightEdge),x,s,a,l))}else if(B<S)ot(B,S,x,s,a,l);else if(v<0&&y<0&&i>180){const E=NA(c.leftEdge),R=NA(c.rightEdge);ot(E,S,x,s,a,l),ot(B,R,x,s,a,l)}}else if(!p)B<S&&ot(B,S,x,s,a,l);else{const E=NA(p.leftEdge),R=NA(p.rightEdge);B<E&&ot(B,E,x,s,a,l),R<S&&ot(R,S,x,s,a,l)}M=M+C|0,k=k+w|0,x++}}function Tl(A,t,e,n){const i=A.right-A.left,r=A.bottom-A.top;i<=0||r<=0||vi(A,i,r,!1,360,0,360,t,e,n)}function Ql(A,t){const e=A.right-A.left,n=A.bottom-A.top;e<=0||n<=0||vi(A,e,n,!0,360,0,360,t.pnPat,t.pnMode,t)}function zi(A,t,e,n,i,r,o){const s=A.right-A.left,a=A.bottom-A.top;if(s<=0||a<=0)return;let l=t%360;l<0&&(l+=360);let d=(l+e)%360;d<0&&(d+=360),vi(A,s,a,n,e,l,d,i,r,o)}function Mo(A,t,e){switch(A){case Qe:return{pat:t.pnPat,mode:t.pnMode};case Vi:return{pat:t.bkPat,mode:Xt};case Dn:return{pat:J.black,mode:wi};case ki:return{pat:t.fillPat,mode:Xt};default:return{pat:t.pnPat,mode:t.pnMode}}}function Do(A,t,e,n,i){const r=J.thePort;if(r){if(r.grafProcs&&r.grafProcs.arcProc){r.grafProcs.arcProc(A,t,e,n);return}Yl(A,t,e,n)}}function Yl(A,t,e,n,i){const r=J.thePort;if(!r)return;const o=A===we,{pat:s,mode:a}=Mo(A,r);if(n===0)return;let l=e,d=n;if(d<0&&(l+=d,d=-d),d>=360){o?Ql(t,r):Tl(t,s,a,r);return}zi(t,l,d,o,s,a,r)}function Nl(A,t,e){Do(we,A,t,e)}function Fl(A,t,e){Do(Qe,A,t,e)}function Rl(A,t,e,n){const i=Math.max(1,n.pnSize.h),r=Math.max(1,n.pnSize.v);Math.min(t/2,(A.right-A.left)/2),Math.min(e/2,(A.bottom-A.top)/2);const o=[{r:{top:A.top,left:A.left,bottom:A.top+e,right:A.left+t},start:180,arc:90},{r:{top:A.top,left:A.right-t,bottom:A.top+e,right:A.right},start:270,arc:90},{r:{top:A.bottom-e,left:A.right-t,bottom:A.bottom,right:A.right},start:0,arc:90},{r:{top:A.bottom-e,left:A.left,bottom:A.bottom,right:A.left+t},start:90,arc:90}];for(const l of o)zi(l.r,l.start,l.arc,!0,n.pnPat,n.pnMode,n);const s=Math.floor(t/2),a=Math.floor(e/2);MA(A.left+s,A.top,A.right-s,A.top+r,n.pnPat,n.pnMode,n),MA(A.left+s,A.bottom-r,A.right-s,A.bottom,n.pnPat,n.pnMode,n),MA(A.left,A.top+a,A.left+i,A.bottom-a,n.pnPat,n.pnMode,n),MA(A.right-i,A.top+a,A.right,A.bottom-a,n.pnPat,n.pnMode,n)}function Ul(A,t,e,n,i,r){const o=Math.floor(t/2),s=Math.floor(e/2),a=[{r:{top:A.top,left:A.left,bottom:A.top+e,right:A.left+t},start:180,arc:90},{r:{top:A.top,left:A.right-t,bottom:A.top+e,right:A.right},start:270,arc:90},{r:{top:A.bottom-e,left:A.right-t,bottom:A.bottom,right:A.right},start:0,arc:90},{r:{top:A.bottom-e,left:A.left,bottom:A.bottom,right:A.left+t},start:90,arc:90}];for(const l of a)zi(l.r,l.start,l.arc,!1,n,i,r);MA(A.left,A.top+s,A.right,A.bottom-s,n,i,r),MA(A.left+o,A.top,A.right-o,A.top+s,n,i,r),MA(A.left+o,A.bottom-s,A.right-o,A.bottom,n,i,r)}function Mi(A,t,e,n,i){const r=J.thePort;if(r){if(r.grafProcs&&r.grafProcs.rRectProc){r.grafProcs.rRectProc(A,t,e,n);return}jl(A,t,e,n)}}function jl(A,t,e,n,i){const r=J.thePort;if(!r)return;if(A===we){Rl(t,e,n,r);return}const{pat:o,mode:s}=Mo(A,r);Ul(t,e,n,o,s,r)}function rr(A,t,e){Mi(we,A,t,e)}function Xl(A,t,e){Mi(Qe,A,t,e)}function or(A,t,e){Mi(Dn,A,t,e)}function Jl(A){if(!A.scanlines||A.scanlines.length===0)return;let t=32767,e=-32767,n=32767,i=-32767;for(const r of A.scanlines)r.xs.length!==0&&(r.y<t&&(t=r.y),r.y+1>e&&(e=r.y+1),r.xs[0]<n&&(n=r.xs[0]),r.xs[r.xs.length-1]>i&&(i=r.xs[r.xs.length-1]));A.rgnBBox={top:t,left:n,bottom:e,right:i}}function Pe(){return{rgn:{rgnSize:10,rgnBBox:{top:0,left:0,bottom:0,right:0}}}}function Un(A,t){t.rgn={rgnSize:A.rgn.rgnSize,rgnBBox:cA(A.rgn.rgnBBox),scanlines:A.rgn.scanlines?A.rgn.scanlines.map(e=>({y:e.y,xs:[...e.xs]})):void 0}}function _l(A,t,e,n,i){A.rgn.rgnSize=10,A.rgn.rgnBBox={top:e,left:t,bottom:i,right:n},A.rgn.scanlines=void 0}function Co(A,t){_l(A,t.left,t.top,t.right,t.bottom)}function sr(A){const t=new Map;if(A.rgn.scanlines&&A.rgn.scanlines.length>0)for(const e of A.rgn.scanlines)t.set(e.y,[...e.xs]);else{const{top:e,left:n,bottom:i,right:r}=A.rgn.rgnBBox;for(let o=e;o<i;o++)t.set(o,[n,r])}return t}function $l(A){const t=[];A.forEach((r,o)=>{const s=[...r].sort((a,l)=>a-l);s.length>0&&s.length%2===0&&t.push({y:o,xs:s})}),t.sort((r,o)=>r.y-o.y);const e={rgn:{rgnSize:10,rgnBBox:{top:0,left:0,bottom:0,right:0}}};e.rgn.scanlines=t,Jl(e.rgn);const n=e.rgn.rgnBBox;let i=!0;for(const r of t)if(r.xs.length!==2||r.xs[0]!==n.left||r.xs[1]!==n.right){i=!1;break}return i&&t.length===n.bottom-n.top&&(e.rgn.scanlines=void 0),e}function Aa(A,t){function e(o){const s=[];for(let a=0;a+1<o.length;a+=2)s.push([o[a],o[a+1]]);return s}const n=e(A),i=e(t),r=[];for(const[o,s]of n)for(const[a,l]of i){const d=Math.max(o,a),c=Math.min(s,l);d<c&&(r.push(d),r.push(c))}return r.sort((o,s)=>o-s)}function ta(A,t,e){const n=sr(A),i=sr(t),r=new Map;n.forEach((s,a)=>{const l=i.get(a);if(!l)return;const d=Aa(s,l);d.length>0&&r.set(a,d)});const o=$l(r);Un(o,e)}const Po=new Map,Bo=new Map;function ea(A,t){const e=KA(A),n={id:t,name:A,lineHeight:e};Po.set(t,n),Bo.set(A,t)}async function na(){await ql();for(const[A,t]of[["body",3],["menu",4],["mono",5]])ea(A,t)}function dn(A){return Bo.get(A)??0}function lr(A){const t=Po.get(A);return(t==null?void 0:t.name)??null}function JA(A,t,e=0){return eA(A,t,e)}function ia(A){A(n=>{const i=J.thePort,r=i?lr(i.txFont)??"body":"body";return eA(n,r)},(n,i,r,o)=>{var M,k;const s=lr(o.txFont)??"body",{baseAddr:a,rowBytes:l,bounds:d}=o.portBits,c=(M=o.clipRgn)==null?void 0:M.rgn.rgnBBox,p=(k=o.visRgn)==null?void 0:k.rgn.rgnBBox,u=o.portRect,g=Math.max((c==null?void 0:c.left)??d.left,(p==null?void 0:p.left)??d.left,u.left,d.left),f=Math.max((c==null?void 0:c.top)??d.top,(p==null?void 0:p.top)??d.top,u.top,d.top),m=Math.min((c==null?void 0:c.right)??d.right,(p==null?void 0:p.right)??d.right,u.right,d.right),h=Math.min((c==null?void 0:c.bottom)??d.bottom,(p==null?void 0:p.bottom)??d.bottom,u.bottom,d.bottom),D=mi(o.txColor??1);ml(a,l,d.left,d.top,g,f,m,h,n,i,r,s,D)})}const Tt={black:new Uint8Array([255,255,255,255,255,255,255,255]),white:new Uint8Array([0,0,0,0,0,0,0,0]),checkers:new Uint8Array([170,85,170,85,170,85,170,85]),darkCheckers:new Uint8Array([85,170,85,170,85,170,85,170]),stripes:new Uint8Array([255,0,255,0,255,0,255,0]),gray25:new Uint8Array([136,34,136,34,136,34,136,34]),gray50:new Uint8Array([170,85,170,85,170,85,170,85]),gray75:new Uint8Array([119,221,119,221,119,221,119,221])};function Di(A){return Tt[A]}const ra=Tt.black,oa=Tt.white;function ye(A){return A!==Bt?ra:oa}function $A(A,t){const e=vo();ht(A);const n=t();return e&&ht(e),n}function Ne(A){var r,o;const t=(r=A.visRgn)==null?void 0:r.rgn.rgnBBox,e=(o=A.clipRgn)==null?void 0:o.rgn.rgnBBox,n=A.portRect,i=A.portBits.bounds;return{left:Math.max((t==null?void 0:t.left)??i.left,(e==null?void 0:e.left)??i.left,n.left,i.left),top:Math.max((t==null?void 0:t.top)??i.top,(e==null?void 0:e.top)??i.top,n.top,i.top),right:Math.min((t==null?void 0:t.right)??i.right,(e==null?void 0:e.right)??i.right,n.right,i.right),bottom:Math.min((t==null?void 0:t.bottom)??i.bottom,(e==null?void 0:e.bottom)??i.bottom,n.bottom,i.bottom)}}function jn(A,t,e,n){const i=Ne(A);if(t<i.left||t>=i.right||e<i.top||e>=i.bottom)return;const{baseAddr:r,rowBytes:o,bounds:s}=A.portBits;r[(e-s.top)*o+(t-s.left)]=_A(n)}function Ci(A,t,e,n,i,r){if(n<=0||i<=0)return;const o=Ne(A),{baseAddr:s,rowBytes:a,bounds:l}=A.portBits,d=_A(r),c=Math.max(t,o.left),p=Math.max(e,o.top),u=Math.min(t+n,o.right),g=Math.min(e+i,o.bottom);for(let f=p;f<g;f++){const m=(f-l.top)*a;s.fill(d,m+(c-l.left),m+(u-l.left))}}function Oo(A,t,e,n,i,r){if(n<=0||i<=0)return;const o=Ne(A),{baseAddr:s,rowBytes:a,bounds:l}=A.portBits,d=_A(r),c=Math.max(t,o.left),p=Math.max(e,o.top),u=Math.min(t+n,o.right),g=Math.min(e+i,o.bottom);for(let f=p;f<g;f++){const m=(f-l.top)*a;for(let h=c;h<u;h++)s[m+(h-l.left)]=xo(d,h,f)}}function Xn(A,t,e,n,i){Ci(A,t,e,n,1,i)}function Jn(A,t,e,n,i){if(n<=0)return;const r=Ne(A);if(t<r.left||t>=r.right)return;const{baseAddr:o,rowBytes:s,bounds:a}=A.portBits,l=_A(i),d=Math.max(e,r.top),c=Math.min(e+n,r.bottom);for(let p=d;p<c;p++)o[(p-a.top)*s+(t-a.left)]=l}function sa(A,t,e,n,i,r){Xn(A,t,e,n,r),Xn(A,t,e+i-1,n,r),Jn(A,t,e,i,r),Jn(A,t+n-1,e,i,r)}function Ho(A,t,e,n,i,r){const o=_A(i);for(let s=0;s<n;s+=2)r?jn(A,t,e+s,o):jn(A,t+s,e,o)}function _n(A,t,e,n,i,r,o,s,a){const l=Math.max(1,Math.min(Math.floor(r/2),Math.floor(n/2))),d=Math.max(1,Math.min(Math.floor(o/2),Math.floor(i/2)));for(let c=0;c<i;c++){let p=0;if(c<d){const f=(d-c-.5)/d;p=Math.max(0,Math.ceil(l-l*Math.sqrt(Math.max(0,1-f*f))))}else if(c>=i-d){const f=(c-(i-d)+.5)/d;p=Math.max(0,Math.ceil(l-l*Math.sqrt(Math.max(0,1-f*f))))}const u=t+p,g=n-p*2;g<=0||(a?Oo(A,u,e+c,g,1,s):Ci(A,u,e+c,g,1,s))}}function la(A,t,e,n,i,r,o,s,a){_n(A,t,e,n,i,r,o,a,!1);const l=n-s*2,d=i-s*2;l<=0||d<=0||_n(A,t+s,e+s,l,d,Math.max(1,r-s*2),Math.max(1,o-s*2),Bt,!1)}const un=[{start:270,arc:90},{start:0,arc:90},{start:90,arc:90},{start:180,arc:90}];function mA(A,t,e,n,i,r){const o=_A(r);if(o>qA){yt()==="colors"?Ci(A,t,e,n,i,o):Oo(A,t,e,n,i,o);return}$A(A,()=>{const s=_(e,t,e+i,t+n);o!==Bt?(fA(),Qt(s)):zl(s)})}function qt(A,t,e,n,i,r=qA){const o=bt(r);if(yt()==="colors"&&o>qA){sa(A,t,e,n,i,o);return}$A(A,()=>{fA(),XA(ye(o)),vl(_(e,t,e+i,t+n)),fA()})}function So(A,t,e,n,i){$A(A,()=>{fA(),Ml(_(e,t,e+i,t+n))})}function Ct(A,t,e,n,i,r){$A(A,()=>{const o=typeof r=="string"?Di(r):r;Io(_(e,t,e+i,t+n),o)})}function aa(A,t,e,n,i,r,o,s=qA){const a=_A(s);if(a>qA){_n(A,t,e,n,i,r,o,a,yt()!=="colors");return}$A(A,()=>{fA(),XA(ye(a));const l=Math.floor(r/2),d=Math.floor(o/2),c=[_(e,t,e+o,t+r),_(e,t+n-r,e+o,t+n),_(e+i-o,t+n-r,e+i,t+n),_(e+i-o,t,e+i,t+r)];for(let p=0;p<4;p++)Fl(c[p],un[p].start,un[p].arc);Qt(_(e+d,t,e+i-d,t+n)),Qt(_(e,t+l,e+d,t+n-l)),Qt(_(e+i-d,t+l,e+i,t+n-l)),fA()})}function ar(A,t,e,n,i,r,o,s=1,a=qA){const l=bt(a);if(yt()==="colors"&&l>qA){la(A,t,e,n,i,r,o,s,l);return}$A(A,()=>{fA(),Ii(s,s),XA(ye(l));const d=Math.floor(r/2),c=Math.floor(o/2),p=Math.max(1,s),u=p,g=[_(e,t,e+o,t+r),_(e,t+n-r,e+o,t+n),_(e+i-o,t+n-r,e+i,t+n),_(e+i-o,t,e+i,t+r)];for(let f=0;f<4;f++)Nl(g[f],un[f].start,un[f].arc);Qt(_(e,t+d,e+p,t+n-d)),Qt(_(e+i-p,t+d,e+i,t+n-d)),Qt(_(e+c,t,e+i-c,t+u)),Qt(_(e+c,t+n-u,e+i-c,t+n)),fA()})}function zA(A,t,e,n,i=qA){const r=bt(i);if(yt()==="colors"&&r>qA){Xn(A,t,e,n,r);return}$A(A,()=>{fA(),XA(ye(r)),wA(t,e),Dt(n-1,0),fA()})}function Jt(A,t,e,n,i=qA){const r=bt(i);if(yt()==="colors"&&r>qA){Jn(A,t,e,n,r);return}$A(A,()=>{fA(),XA(ye(r)),wA(t,e),Dt(0,n-1),fA()})}function CA(A,t,e,n=qA){const i=bt(n);if(yt()==="colors"&&i>qA){jn(A,t,e,i);return}$A(A,()=>{fA(),XA(ye(i)),Ii(1,1),wA(t,e),Dt(0,0),fA()})}function Wo(A,t,e,n,i=qA){const r=bt(i);if(yt()==="colors"&&r>qA){Ho(A,t,e,n,r,!1);return}const o=new Uint8Array([170,170,170,170,170,170,170,170]);$A(A,()=>{fA(),XA(o),wA(t,e),Dt(n-1,0),fA()})}function ca(A,t,e,n,i=qA){const r=bt(i);if(yt()==="colors"&&r>qA){Ho(A,t,e,n,r,!0);return}const o=new Uint8Array([170,170,170,170,170,170,170,170]);$A(A,()=>{fA(),XA(o),wA(t,e),Dt(0,n-1),fA()})}function Ko(A,t,e,n,i,r="darkCheckers"){const o=typeof r=="string"?Di(r):r;$A(A,()=>{fA(),Hl(wi),XA(o),wA(t,e),Dt(n-1,0),wA(t,e+i-1),Dt(n-1,0),wA(t,e+1),Dt(0,i-3),wA(t+n-1,e+1),Dt(0,i-3),fA()})}function da(A,t,e,n,i,r){const o=A.portBits.baseAddr,s=A.portBits.rowBytes,a=A.portBits.bounds,l=Ne(A),d=Math.max(t,l.left),c=Math.max(e,l.top),p=Math.min(t+n,l.right),u=Math.min(e+i,l.bottom),g=Di(r);for(let f=c;f<u;f++){const m=(f-a.top)*s,h=g[f&7];for(let D=d;D<p;D++){const M=h>>7-(D&7)&1,k=m+(D-a.left);o[k]&=M}}}function Lo(A,t,e,n,i=qA){const r=A,o=r.txColor??qA;r.txColor=bt(i),$A(A,()=>{wA(e,n),mt(t)}),r.txColor=o}function $t(A){var l,d;const t=(l=A.visRgn)==null?void 0:l.rgn.rgnBBox,e=(d=A.clipRgn)==null?void 0:d.rgn.rgnBBox,n=A.portRect,i=A.portBits.bounds,r=Math.max((t==null?void 0:t.left)??i.left,(e==null?void 0:e.left)??i.left,n.left,i.left),o=Math.max((t==null?void 0:t.top)??i.top,(e==null?void 0:e.top)??i.top,n.top,i.top),s=Math.min((t==null?void 0:t.right)??i.right,(e==null?void 0:e.right)??i.right,n.right,i.right),a=Math.min((t==null?void 0:t.bottom)??i.bottom,(e==null?void 0:e.bottom)??i.bottom,n.bottom,i.bottom);return{left:r,top:o,right:s,bottom:a}}function PA(A,t,e,n){e=e|0,n=n|0;const{width:i,height:r,data:o,mask:s}=t,a=A.portBits.baseAddr,l=A.portBits.rowBytes,d=A.portBits.bounds,c=$t(A);for(let p=0;p<r;p++){const u=n+p;if(u<c.top||u>=c.bottom)continue;const g=p*i,f=(u-d.top)*l;for(let m=0;m<i;m++){const h=e+m;if(h<c.left||h>=c.right)continue;const D=g+m;s&&!s[D]||(a[f+(h-d.left)]=_A(o[D]))}}}function Eo(A,t,e,n){e=e|0,n=n|0;const{width:i,height:r,data:o,mask:s}=t,a=A.portBits.baseAddr,l=A.portBits.rowBytes,d=A.portBits.bounds,c=$t(A);for(let p=0;p<r;p++){const u=n+p;if(u<c.top||u>=c.bottom)continue;const g=p*i,f=(u-d.top)*l;for(let m=0;m<i;m++){const h=e+m;if(h<c.left||h>=c.right)continue;const D=g+m;s&&!s[D]||(a[f+(h-d.left)]=o[D]^1)}}}function ua(A,t,e,n){e=e|0,n=n|0;const{width:i,height:r,mask:o}=t;if(!o)return PA(A,t,e,n);const s=A.portBits.baseAddr,a=A.portBits.rowBytes,l=A.portBits.bounds,d=$t(A);for(let c=0;c<r;c++){const p=n+c;if(p<d.top||p>=d.bottom)continue;const u=c*i,g=(p-l.top)*a;for(let f=0;f<i;f++){const m=e+f;if(m<d.left||m>=d.right)continue;const h=u+f;if(!o[h])continue;const D=m%4===0&&p%2===0||m%2===0&&m%4!==0&&p%2!==0?1:0;s[g+(m-l.left)]=D}}}function pa(A,t,e,n,i,r,o=1){if(i=i|0,r=r|0,!t.length||e<=0||n<=0)return;const s=A.portBits.baseAddr,a=A.portBits.rowBytes,l=A.portBits.bounds,d=$t(A),c=bt(o);for(let p=0;p<n;p++){const u=r+p;if(u<d.top||u>=d.bottom)continue;const g=p*e,f=(u-l.top)*a;for(let m=0;m<e;m++){const h=g+m;if(!t[h]||!(m===0||!t[h-1]||m===e-1||!t[h+1]||p===0||!t[(p-1)*e+m]||p===n-1||!t[(p+1)*e+m]))continue;const M=i+m;M<d.left||M>=d.right||(s[f+(M-l.left)]=c)}}}function fa(A,t,e,n){e=e|0,n=n|0;const{width:i,height:r,data:o}=t,s=A.portBits.baseAddr,a=A.portBits.rowBytes,l=A.portBits.bounds,d=$t(A);for(let c=0;c<r;c++){const p=n+c;if(p<d.top||p>=d.bottom)continue;const u=(p-l.top)*a;for(let g=0;g<i;g++){const f=e+g;if(f<d.left||f>=d.right)continue;const m=(c*i+g)*4;if(o[m+3]<128)continue;const D=o[m],M=o[m+1],k=o[m+2];s[u+(f-l.left)]=yt()==="colors"?el(D,M,k):ho(D,M,k,f,p)}}}function ga(A,t,e,n,i,r){const o=A.portBits.baseAddr,s=A.portBits.rowBytes,a=A.portBits.bounds,l=$t(A),d=Math.max(0,l.left-i),c=Math.max(0,l.top-r),p=Math.min(e,l.right-i),u=Math.min(n,l.bottom-r);if(d>=p||c>=u)return;const g=p-d;for(let f=c;f<u;f++)o.set(t.subarray(f*e+d,f*e+d+g),(r+f-a.top)*s+(i+d-a.left))}function cr(A,t,e,n,i,r){e=e|0,n=n|0,i=i|0,r=r|0;const{width:o,height:s,data:a}=t,l=A.portBits.baseAddr,d=A.portBits.rowBytes,c=A.portBits.bounds,p=$t(A),u=Math.max(e,p.left),g=Math.max(n,p.top),f=Math.min(e+i,p.right),m=Math.min(n+r,p.bottom);for(let h=g;h<m;h++){const D=(h-c.top)*d,M=((h-n)%s+s)%s;for(let k=u;k<f;k++){const C=((k-e)%o+o)%o;l[D+(k-c.left)]=_A(a[M*o+C])}}}const ma=530;function ft(A=""){return{value:A,cursorPos:A.length,selectionStart:0,selectionEnd:0,focused:!1,_lastEditTime:Date.now()}}function pt(A){return A.selectionStart!==A.selectionEnd}function $n(A){return A.selectionStart<=A.selectionEnd?[A.selectionStart,A.selectionEnd]:[A.selectionEnd,A.selectionStart]}function TA(A){A.selectionStart=A.cursorPos,A.selectionEnd=A.cursorPos}function De(A){if(!pt(A))return!1;const[t,e]=$n(A);return A.value=A.value.slice(0,t)+A.value.slice(e),A.cursorPos=t,TA(A),!0}function qa(A){A.selectionStart=0,A.selectionEnd=A.value.length,A.cursorPos=A.value.length}function Cn(A){A._lastEditTime=Date.now()}function Pi(A,t,e="body"){if(t<=0)return 0;for(let n=1;n<=A.length;n++){const i=eA(A.substring(0,n),e),r=n>0?eA(A.substring(0,n-1),e):0,o=r+(i-r)/2;if(t<o)return n-1}return A.length}function ha(A,t){let e=t,n=t;for(;e>0&&A[e-1]!==" ";)e--;for(;n<A.length&&A[n]!==" ";)n++;return[e,n]}function Bi(A,t){return t?(Cn(A),De(A),A.value=A.value.slice(0,A.cursorPos)+t+A.value.slice(A.cursorPos),A.cursorPos+=t.length,TA(A),!0):!1}function Oi(A,t,e,n=!1,i=!1,r=!1){const o=i||r;if(Cn(A),o&&(t==="a"||t==="A"))return qa(A),!0;if(o&&(t==="c"||t==="C"))return!1;if(o&&(t==="x"||t==="X"))return De(A);if(t==="Backspace")return pt(A)?De(A):A.cursorPos>0?(A.value=A.value.slice(0,A.cursorPos-1)+A.value.slice(A.cursorPos),A.cursorPos--,TA(A),!0):!1;if(t==="Delete")return pt(A)?De(A):A.cursorPos<A.value.length?(A.value=A.value.slice(0,A.cursorPos)+A.value.slice(A.cursorPos+1),TA(A),!0):!1;if(t==="ArrowLeft"){if(o)return n?(A.selectionEnd=0,A.cursorPos=0):(A.cursorPos=0,TA(A)),!0;if(n)return pt(A)||(A.selectionStart=A.cursorPos,A.selectionEnd=A.cursorPos),A.cursorPos>0&&(A.cursorPos--,A.selectionEnd=A.cursorPos),!0;if(pt(A)){const[s]=$n(A);return A.cursorPos=s,TA(A),!0}return A.cursorPos>0?(A.cursorPos--,TA(A),!0):!1}if(t==="ArrowRight"){if(o)return n?(A.selectionEnd=A.value.length,A.cursorPos=A.value.length):(A.cursorPos=A.value.length,TA(A)),!0;if(n)return pt(A)||(A.selectionStart=A.cursorPos,A.selectionEnd=A.cursorPos),A.cursorPos<A.value.length&&(A.cursorPos++,A.selectionEnd=A.cursorPos),!0;if(pt(A)){const[,s]=$n(A);return A.cursorPos=s,TA(A),!0}return A.cursorPos<A.value.length?(A.cursorPos++,TA(A),!0):!1}return t==="Home"?n?(pt(A)||(A.selectionStart=A.cursorPos,A.selectionEnd=A.cursorPos),A.cursorPos=0,A.selectionEnd=0,!0):(A.cursorPos=0,TA(A),!0):t==="End"?n?(pt(A)||(A.selectionStart=A.cursorPos,A.selectionEnd=A.cursorPos),A.cursorPos=A.value.length,A.selectionEnd=A.value.length,!0):(A.cursorPos=A.value.length,TA(A),!0):t.length===1&&!o?(De(A),A.value=A.value.slice(0,A.cursorPos)+t+A.value.slice(A.cursorPos),A.cursorPos++,TA(A),!0):!1}function xa(A,t,e=!1){Cn(A);const n=t-3,i=Pi(A.value,n);return e?(pt(A)||(A.selectionStart=A.cursorPos),A.selectionEnd=i,A.cursorPos=i):(A.cursorPos=i,TA(A)),!0}function wa(A,t){Cn(A);const e=t-3,n=Pi(A.value,e),[i,r]=ha(A.value,n);return A.selectionStart=i,A.selectionEnd=r,A.cursorPos=r,!0}function ya(A,t){const e=t-3,n=Pi(A.value,e);return n!==A.selectionEnd?(A.selectionEnd=n,A.cursorPos=n,!0):!1}const ba=ma;function Zo(A,t,e="body",n=0,i=0,r){const o=sn(e,{lineHeight:r,lineSpacing:n}).lineHeight;return Mn(A,t,e,i).length*o}const je="body";function Va(A,t,e,n,i,r=16){ht(A),A.txColor=z;const o=Pe();Pl(o),Bl(_(n,e,n+r,e+i)),qt(A,e,n,i,r,z),mA(A,e+1,n+1,i-2,r-2,Y);const s=e+3,a=n+1,l=530,d=()=>(Date.now()-t._lastEditTime)%(l*2)<l,c=t.selectionStart!==t.selectionEnd,p=c?Math.min(t.selectionStart,t.selectionEnd):0,u=c?Math.max(t.selectionStart,t.selectionEnd):0;if(an(dn(je)),cn(0),t.focused&&c){const g=s+JA(t.value.substring(0,p),je),f=s+JA(t.value.substring(0,u),je);mA(A,g,n+2,f-g,r-4,z),p>0&&(wA(s,a),mt(t.value.substring(0,p))),A.txColor=Y,wA(g,a),mt(t.value.substring(p,u)),A.txColor=z,u<t.value.length&&(wA(f,a),mt(t.value.substring(u)))}else{wA(s,a),mt(t.value);const g=t.cursorPos;if(t.focused&&d()){const f=t.value.substring(0,g),m=s+JA(f,je);Jt(A,m,n+2,r-4,z)}}zo(o)}function Le(A,t,e,n,i){if(!t)return;const r=i.spacing??0,o=mi(i.color??z),s=sn(i.font,{lineHeight:i.lineHeight,lineSpacing:i.lineSpacing}),a=A,l=a.txColor??z;if(ht(A),an(dn(i.font)),cn(0),a.txColor=o,r===0&&!t.includes(`
`)){wA(e,n+s.glyphOffsetY),mt(t),a.txColor=l;return}let d=e,c=n;for(let p=0;p<t.length;p++){const u=t[p];if(u===`
`){d=e,c+=s.lineHeight;continue}wA(d,c+s.glyphOffsetY),mt(u),d+=JA(u,i.font,r)}a.txColor=l}function ka(A){const{baseAddr:t,rowBytes:e}=A.portBits,n=t.length/e|0,i=new qi(e,n);return i.pixels=t,i}const Ia=15,Kt=15,dr=12,ne=15;class Ee{constructor(t,e,n,i,r,o=0,s=0,a,l,d,c,p=0,u=0,g=0,f,m,h){this.port=t,this._window=h??null,this.bc=ka(t),this.ox=e,this.oy=n,this.w=i,this.h=r,this.scrollOffsetY=o,this.scrollOffsetX=s,this._hitRegions=a,this._onStartResize=l,this._minSize=d,this._windowSize=c,this._contentTopInset=p,this._windowScrollY=u,this._windowScrollX=g,this._contentRectX=f??e,this._contentRectY=m??n}getWindow(){return this._window}get width(){return this.w}get height(){return this.h}get scrollY(){return this.scrollOffsetY}get scrollX(){return this.scrollOffsetX}release(){}tx(t){return this.ox+t-this.scrollOffsetX}ty(t){return this.oy+t-this.scrollOffsetY}screenX(t){return this._contentRectX+this.tx(t)}screenY(t){return this._contentRectY+this.ty(t)}setPixel(t,e,n=z){CA(this.port,this.tx(t),this.ty(e),n)}getPixel(t,e){const n=this.tx(t),i=this.ty(e),{baseAddr:r,rowBytes:o,bounds:s}=this.port.portBits,a=(i-s.top)*o+(n-s.left);return a<0||a>=r.length?0:r[a]}drawHLine(t,e,n,i=z){zA(this.port,this.tx(t),this.ty(e),n,i)}drawVLine(t,e,n,i=z){Jt(this.port,this.tx(t),this.ty(e),n,i)}drawDottedHLine(t,e,n,i=z){Wo(this.port,this.tx(t),this.ty(e),n,i)}drawDottedVLine(t,e,n,i=z){ca(this.port,this.tx(t),this.ty(e),n,i)}drawRect(t,e,n,i,r=z){qt(this.port,this.tx(t),this.ty(e),n,i,r)}fillRect(t,e,n,i,r=z){mA(this.port,this.tx(t),this.ty(e),n,i,r)}drawRoundRect(t,e,n,i,r,o=z){ar(this.port,this.tx(t),this.ty(e),n,i,r,r,1,o)}fillRoundRect(t,e,n,i,r,o=z){aa(this.port,this.tx(t),this.ty(e),n,i,r,r,o)}frameRoundRect(t,e,n,i,r,o,s=1,a=z){ar(this.port,this.tx(t),this.ty(e),n,i,r,o,s,a)}fillPattern(t,e,n,i,r){Ct(this.port,this.tx(t),this.ty(e),n,i,r)}invertRect(t,e,n,i){So(this.port,this.tx(t),this.ty(e),n,i)}clear(t=Y){mA(this.port,this.ox,this.oy,this.w,this.h,t)}blit(t,e,n){PA(this.port,t,this.tx(e),this.ty(n))}blitInverted(t,e,n){Eo(this.port,t,this.tx(e),this.ty(n))}blitShadowOutline(t,e,n){ua(this.port,t,this.tx(e),this.ty(n))}blitImageData(t,e,n){fa(this.port,t,this.tx(e),this.ty(n))}blit1bitPixels(t,e,n,i,r){ga(this.port,t,e,n,this.tx(i),this.ty(r))}pushClip(t,e,n,i){this.bc.pushClip(this.screenX(t),this.screenY(e),n,i)}popClip(){this.bc.popClip()}drawText(t,e,n,i={}){const r=i.font??"body",o=sn(r,{lineHeight:i.lineHeight}),s=o.lineHeight,a=i.spacing??0,l=JA(t,r,a),d=i.width??l,c=t?t.split(`
`).length:1;let p=e;i.align==="center"?p=e+Math.floor((d-l)/2):i.align==="right"&&(p=e+d-l),ht(this.port),i.bg!==null&&i.bg!==void 0&&d>0&&s>0&&this.fillRect(e,n,d,i.height??s*c,i.bg),Le(this.port,t,this.tx(p),this.ty(n),{font:r,spacing:a,lineHeight:o.lineHeight,color:i.color??z})}drawButton(t){throw new Error("drawButton is removed. Use NewControl + DrawControls (see docs/control-manager-migration.md).")}drawTextInput(t,e,n,i,r,o){const s=r??16;if(Va(this.port,t,this.tx(e),this.ty(n),i,s),this._hitRegions&&(o!=null&&o.id)){const a=o.onChange;this.hitRegion(o.id,{x:e,y:n,w:i,h:s},{onMouseDown:l=>{xa(t,l,!1),a==null||a()},onDoubleClick:l=>{wa(t,l),a==null||a()},onDrag:l=>{const d=l-this.screenX(e);ya(t,d)&&(a==null||a())}})}}drawTextBlock(t){const e=t.font??"body",n=t.spacing??0,i=t.color??z,r=sn(e,{lineHeight:t.lineHeight,lineSpacing:t.lineSpacing}),o=r.lineHeight,s=Mn(t.text,t.maxWidth,e,n),a=s.length*o,l=this.scrollOffsetY,d=this.scrollOffsetY+this.h;for(let c=0;c<s.length;c++){const p=t.y+c*o;p+o<=l||p>=d||s[c]&&Le(this.port,s[c],this.tx(t.x),this.ty(p),{font:e,spacing:n,lineHeight:r.lineHeight,color:i})}return a}measureTextBlock(t,e,n,i,r,o){return Zo(t,e,n,i,r,o)}scrollArea(t,e,n,i){var y,I;if(!this._hitRegions)return;const{contentHeight:r,scrollOffset:o,onScroll:s,resize:a}=n,l=!!a&&!!this._onStartResize,d=l?ne:0,c=Math.max(0,r-e.h),p=Math.min(o,c),u=Ia,g=e.w-u,f=new Ee(this.port,e.x,e.y,g,e.h,p,0,this._hitRegions,void 0,void 0,void 0,0,0,0,this._contentRectX+e.x,this._contentRectY+e.y);i(f),f.release();const m=e.x+g,h=e.y,D=e.h-d;Jt(this.port,m,h,e.h,z);const M=h+Kt,k=D-Kt*2,C=m+7;mA(this.port,m+1,h,u-1,Kt,Y),zA(this.port,m,h+Kt-1,u,z),CA(this.port,C,h+4,z),zA(this.port,C-1,h+5,3,z),zA(this.port,C-2,h+6,5,z),zA(this.port,C-3,h+7,7,z);const w=h+D-Kt;mA(this.port,m+1,w,u-1,Kt,Y),zA(this.port,m,w,u,z),CA(this.port,C,w+10,z),zA(this.port,C-1,w+9,3,z),zA(this.port,C-2,w+8,5,z),zA(this.port,C-3,w+7,7,z);const v=r>e.h;if(v){Ct(this.port,m+1,M,u-1,k,"gray50");const V=Math.max(12,Math.floor(e.h/r*k)),x=M+Math.floor(p/c*(k-V));mA(this.port,m+1,x,u-2,V,Y),qt(this.port,m+1,x,u-2,V,z)}else mA(this.port,m+1,M,u-1,k,Y);if(l){const V=m,x=h+D;mA(this.port,V,x,ne,ne,Y),zA(this.port,V,x,ne,z),qt(this.port,V+2,x+6,7,7,z),mA(this.port,V+5,x+3,7,7,Y),qt(this.port,V+5,x+3,7,7,z)}if(this._hitRegions.add({id:`${t}-scroll-up`,x:this._contentRectX+m,y:this._contentRectY+h,w:u,h:Kt,onMouseDown:()=>{s(Math.max(0,p-dr))}}),this._hitRegions.add({id:`${t}-scroll-down`,x:this._contentRectX+m,y:this._contentRectY+w,w:u,h:Kt,onMouseDown:()=>{s(Math.min(c,p+dr))}}),v){const V=Math.max(12,Math.floor(e.h/r*k));this._hitRegions.add({id:`${t}-scroll-track`,x:this._contentRectX+m,y:this._contentRectY+M,w:u,h:k,onMouseDown:(x,O)=>{const H=O/Math.max(1,k-V);s(Math.max(0,Math.min(c,H*c)))}})}if(this._hitRegions.add({id:`${t}-scroll-wheel`,x:this._contentRectX+e.x,y:this._contentRectY+e.y,w:e.w,h:e.h,onScroll:V=>{s(Math.max(0,Math.min(c,p+V)))}}),l){const V=m,x=h+D,O=this._onStartResize,H=((y=this._windowSize)==null?void 0:y.width)??this.w+2,B=((I=this._windowSize)==null?void 0:I.height)??this.h+20;this._hitRegions.add({id:`${t}-grow-box`,x:this._contentRectX+V,y:this._contentRectY+x,w:ne,h:ne,onMouseDown:(S,Q)=>{O(this._contentRectX+V+S,this._contentRectY+x+Q,H,B)}})}}drawScrollableContent(t){if(this._contentTopInset<=0||!this._hitRegions)return;const e=this._contentTopInset,n=this.h-e;if(n<=0)return;const i=new Ee(this.port,this.ox,this.oy+e,this.w,n,this._windowScrollY,this._windowScrollX,this._hitRegions,this._onStartResize,this._minSize,this._windowSize,0,this._windowScrollY,this._windowScrollX,this._contentRectX,this._contentRectY),r=_(e,0,e+n,this.w),o=this.port.clipRgn,s=Pe();Un(o,s);const a=Pe();Co(a,r);const l=Pe();ta(o,a,l),this.port.clipRgn=l,i.pushClip(0,0,this.w,n);try{t(i)}finally{i.popClip(),this.port.clipRgn=o,Un(s,o)}i.release()}hitRegion(t,e,n){this._hitRegions&&this._hitRegions.add({id:t,x:this._contentRectX+this.tx(e.x),y:this._contentRectY+this.ty(e.y),w:e.w,h:e.h,...n})}getBitCanvas(){return this.bc}}class Wn{constructor(){this.hooks=[],this.hookIndex=0,this.effects=[],this.effectIndex=0,this._needsRender=!1,this._renderFn=null,this._rafId=null}resetForRender(){this.hookIndex=0,this.effectIndex=0}flushEffects(){for(let t=0;t<this.effects.length;t++){const e=this.effects[t];e&&e.__pendingRun&&(e.cleanup&&e.cleanup(),e.cleanup=e.fn()||void 0,e.__pendingRun=!1)}}destroy(){for(const t of this.effects)t!=null&&t.cleanup&&t.cleanup();this.effects=[],this.hooks=[],this._rafId!==null&&cancelAnimationFrame(this._rafId)}setRenderFunction(t){this._renderFn=t}scheduleRender(){this._needsRender||(this._needsRender=!0,this._rafId=requestAnimationFrame(()=>{var t;this._needsRender=!1,this._rafId=null,(t=this._renderFn)==null||t.call(this)}))}useState(t){const e=this.hookIndex++;this.hooks[e]===void 0&&(this.hooks[e]=t);const n=i=>{const r=this.hooks[e],o=typeof i=="function"?i(r):i;r!==o&&(this.hooks[e]=o,this.scheduleRender())};return[this.hooks[e],n]}useEffect(t,e){const n=this.effectIndex++,i=this.effects[n];i?(!e||!i.deps||!ur(i.deps,e))&&(this.effects[n]={...i,fn:t,deps:e,__pendingRun:!0}):this.effects[n]={fn:t,deps:e,__pendingRun:!0}}useMemo(t,e){const n=this.hookIndex++,i=this.hooks[n];if(!i||!ur(i.deps,e)){const r=t();return this.hooks[n]={value:r,deps:e},r}return i.value}useRef(t){const e=this.hookIndex++;return this.hooks[e]===void 0&&(this.hooks[e]={current:t}),this.hooks[e]}}function ur(A,t){if(A.length!==t.length)return!1;for(let e=0;e<A.length;e++)if(!Object.is(A[e],t[e]))return!1;return!0}class va{constructor(){this.apps=new Map,this.instances=new Map,this.multiApps=new Map,this.multiStates=new Map}register(t){this.apps.set(t.id,t)}get(t){return this.apps.get(t)}getAll(){return Array.from(this.apps.values())}createInstance(t,e,n={}){const i=this.apps.get(t);if(!i)return null;const r=new Wn,o={appId:t,app:i,builder:r,props:n};return this.instances.set(e,o),i.onOpen&&i.onOpen(r,n),o}getInstance(t){return this.instances.get(t)}destroyInstance(t){const e=this.instances.get(t);e&&(e.app.onClose&&e.app.onClose(e.builder),e.builder.destroy(),this.instances.delete(t))}registerMultiWindow(t){this.multiApps.set(t.id,t)}startApp(t){const e=this.multiApps.get(t);if(!e)return null;if(this.multiStates.has(t))return this.multiStates.get(t).appBuilder;const n=new Wn,i={app:e,appBuilder:n,windowBuilders:new Map};return this.multiStates.set(t,i),e.onStart&&e.onStart(n),n}stopApp(t){const e=this.multiStates.get(t);if(e){for(const[n,i]of e.windowBuilders)e.app.onWindowClose&&e.app.onWindowClose(e.appBuilder,i.builder,n),i.builder.destroy();e.windowBuilders.clear(),e.app.onStop&&e.app.onStop(e.appBuilder),e.appBuilder.destroy(),this.multiStates.delete(t)}}createWindowForApp(t,e,n={}){const i=this.multiStates.get(t);if(!i)return null;const r=i.windowBuilders.get(e);if(r)return{app:i.app,appBuilder:i.appBuilder,winBuilder:r.builder,props:r.props};const o=new Wn;return i.windowBuilders.set(e,{builder:o,props:n}),i.app.onWindowOpen&&i.app.onWindowOpen(i.appBuilder,o,e,n),{app:i.app,appBuilder:i.appBuilder,winBuilder:o,props:n}}destroyWindowForApp(t,e){const n=this.multiStates.get(t);if(!n)return;const i=n.windowBuilders.get(e);i&&(n.app.onWindowClose&&n.app.onWindowClose(n.appBuilder,i.builder,e),i.builder.destroy(),n.windowBuilders.delete(e))}getMultiWindowInstance(t,e){const n=this.multiStates.get(t);if(!n)return null;const i=n.windowBuilders.get(e);return i?{app:n.app,appBuilder:n.appBuilder,winBuilder:i.builder,props:i.props}:null}getMultiWindowApp(t){return this.multiStates.get(t)}isMultiWindowApp(t){return this.multiApps.has(t)}}const jt=class jt{constructor(t){this.zoom=1,this.handlers=[],this.lastClickTime=0,this.lastClickX=0,this.lastClickY=0,this._moveRafPending=!1,this.canvasEl=t,this._bind()}setZoom(t){this.zoom=t}onEvent(t){this.handlers.push(t)}removeHandler(t){this.handlers=this.handlers.filter(e=>e!==t)}emit(t){for(const e of this.handlers)e(t)}toLocal(t){const e=this.canvasEl.getBoundingClientRect();return{x:Math.floor((t.clientX-e.left)/this.zoom),y:Math.floor((t.clientY-e.top)/this.zoom)}}_bind(){this.canvasEl.tabIndex=0,this.canvasEl.style.outline="none",this.canvasEl.addEventListener("mousedown",t=>{this.canvasEl.focus({preventScroll:!0});const{x:e,y:n}=this.toLocal(t),i=Date.now(),r=Math.abs(e-this.lastClickX),o=Math.abs(n-this.lastClickY);i-this.lastClickTime<jt.DOUBLE_CLICK_MS&&r<jt.DOUBLE_CLICK_DIST&&o<jt.DOUBLE_CLICK_DIST?(this.emit({type:"doubleClick",x:e,y:n,button:t.button}),this.lastClickTime=0):(this.emit({type:"mouseDown",x:e,y:n,button:t.button}),this.lastClickTime=i,this.lastClickX=e,this.lastClickY=n)}),this.canvasEl.addEventListener("mouseup",t=>{const{x:e,y:n}=this.toLocal(t);this.emit({type:"mouseUp",x:e,y:n,button:t.button})}),this.canvasEl.addEventListener("mousemove",t=>{this._moveRafPending||(this._moveRafPending=!0,requestAnimationFrame(()=>{this._moveRafPending=!1;const{x:e,y:n}=this.toLocal(t);this.emit({type:"mouseMove",x:e,y:n})}))}),this.canvasEl.addEventListener("wheel",t=>{t.preventDefault();const{x:e,y:n}=this.toLocal(t);this.emit({type:"scroll",x:e,y:n,deltaY:t.deltaY,deltaX:t.deltaX})},{passive:!1}),window.addEventListener("keydown",t=>{var n;if((t.metaKey||t.ctrlKey)&&t.key==="v"){(n=navigator.clipboard)==null||n.readText().then(i=>{i&&this.emit({type:"paste",pasteText:i})}).catch(()=>{});return}this.emit({type:"keyDown",key:t.key,code:t.code,shiftKey:t.shiftKey,metaKey:t.metaKey,ctrlKey:t.ctrlKey,altKey:t.altKey})}),window.addEventListener("keyup",t=>{this.emit({type:"keyUp",key:t.key,code:t.code,shiftKey:t.shiftKey,metaKey:t.metaKey,ctrlKey:t.ctrlKey,altKey:t.altKey})})}destroy(){}};jt.DOUBLE_CLICK_MS=500,jt.DOUBLE_CLICK_DIST=4;let Ai=jt;const kA=10,za=11,pn=20,fn=21,gn=22,mn=23,qn=129;function xA(A,t,e,n,i,r,o,s,a,l){const c={ref:{nextControl:null,contrlOwner:A,contrlRect:cA(t),contrlVis:n,contrlHilite:0,contrlValue:i,contrlMin:r,contrlMax:o,contrlDefProc:s,contrlData:null,contrlAction:null,contrlRfCon:a,contrlTitle:e}};return(l??A.controlList).push(c),c}const le=10,ie=4,pr=3,fr=16,vt=12,re=12,hn=4,Ze=16;function Go(A,t,e){const n=t.ref,i=n.contrlRect,r=n.contrlData,o=(r==null?void 0:r.vertical)??i.bottom-i.top>=i.right-i.left,s=n.contrlValue,a=n.contrlMin,l=Math.max(n.contrlMax,a+1),d=Ze;if(o){const c=i.left,p=i.top,u=p+d,g=i.bottom-d,f=Math.max(0,g-u);if(e){const w=e("chrome/up");w&&PA(A,w,c,p);const v=e("chrome/down");v&&PA(A,v,c,g)}const m=(r==null?void 0:r.contentLength)??l-a,h=(r==null?void 0:r.pageSize)??f,D=m>0?Math.max(12,Math.floor(h/m*f)):f,M=Math.max(0,f-D),k=l-a,C=u+(k>0?Math.floor(s/k*M):0);if(f>0){if(e){const w=e("scrollbar-bg");w?cr(A,w,c,u,d,f):Ct(A,c,u,d,f,"gray50")}else Ct(A,c,u,d,f,"gray50");Jt(A,c+d-1,u,f,z)}k>0&&D>0&&(mA(A,c+1,C,d-2,D,Y),qt(A,c+1,C,d-2,D,z)),Jt(A,c,p,i.bottom-p,z)}else{const c=i.top,p=i.left,u=p+d,g=i.right-d,f=Math.max(0,g-u);if(e){const w=e("chrome/left");w&&PA(A,w,p,c);const v=e("chrome/right");v&&PA(A,v,g,c)}const m=(r==null?void 0:r.contentLength)??l-a,h=(r==null?void 0:r.pageSize)??f,D=m>0?Math.max(12,Math.floor(h/m*f)):f,M=Math.max(0,f-D),k=l-a,C=u+(k>0?Math.floor(s/k*M):0);if(f>0)if(e){const w=e("scrollbar-bg");w?cr(A,w,u,c+1,f,d-2):Ct(A,u,c+1,f,d-2,"gray50")}else Ct(A,u,c+1,f,d-2,"gray50");k>0&&D>0&&(mA(A,C,c+1,D,d-2,Y),qt(A,C,c+1,D,d-2,z)),zA(A,p,c,i.right-p,z)}}function Ma(A,t,e){for(const n of A.scrollBarControls){const i=n.ref;i.contrlVis&&i.contrlDefProc===4&&Go(t,n,e)}}function ti(A,t){const e=vo();ht(A);try{return t()}finally{e&&ht(e)}}function Da(A,t){const e=cA(t.boundsRect),{top:n,left:i,bottom:r,right:o}=e,s=t.default===!0,a=le,l=le;return ti(A,()=>{if(fA(),s){const h=cA(e);Vl(h,-ie,-ie),Ii(pr,pr),XA(Tt.black),rr(h,fr,fr),fA()}XA(Tt.black),rr(e,a,l);const d=1,c=KA("menu"),p=eA(t.label,"menu"),u=o-i-2,g=r-n-2,f=i+d+Math.floor((u-p)/2),m=n+d+Math.max(0,Math.floor((g-c)/2));if(t.active&&(XA(Tt.black),Xl(e,a,l)),t.active&&XA(Tt.white),wA(f,m),mt(t.label),fA(),t.disabled){const h=_(n+d,i+d,r-d,o-d);Io(h,Tt.gray50)}}),s?_(n-ie,i-ie,r+ie,o+ie):cA(e)}function Ca(A,t){const{boundsRect:e,label:n,checked:i,disabled:r}=t,{top:o,left:s,bottom:a,right:l}=e,d=KA("body"),c=o+Math.max(0,Math.floor((d-vt)/2));if(qt(A,s,c,vt,vt,z),mA(A,s+1,c+1,vt-2,vt-2,Y),i)for(let u=2;u<vt-2;u++)CA(A,s+u,c+u,z),CA(A,s+vt-1-u,c+u,z);const p=s+vt+hn;if(Lo(A,n,p,o,z),r){const u=vt+hn+eA(n,"body");Ct(A,s,o,u,d,"gray50")}return cA(e)}function Pa(A,t){const{boundsRect:e,label:n,selected:i,disabled:r}=t,{top:o,left:s}=e,a=KA("body"),l=o+Math.max(0,Math.floor((a-re)/2)),d=s+Math.floor(re/2),c=l+Math.floor(re/2),p=Math.floor(re/2);Ea(A,d,c,p),i&&Za(A,d,c,p-3);const u=s+re+hn;if(Lo(A,n,u,o,z),r){const g=re+hn+eA(n,"body");Ct(A,s,o,g,a,"gray50")}return cA(e)}function Ba(A,t){const e=t.kind;return e==="checkbox"?Ca(A,t):e==="radio"?Pa(A,t):Da(A,t)}function Oa(A){const t=A.contrlDefProc,e=cA(A.contrlRect),n=A.contrlHilite===255;if(t===0){const i=A.contrlData;return{kind:"button",boundsRect:e,label:A.contrlTitle,disabled:n,active:A.contrlValue!==0,default:(i==null?void 0:i.default)===!0}}return t===1?{kind:"checkbox",boundsRect:e,label:A.contrlTitle,checked:A.contrlValue!==0,disabled:n}:t===2?{kind:"radio",boundsRect:e,label:A.contrlTitle,selected:A.contrlValue!==0,disabled:n}:{kind:"button",boundsRect:e,label:A.contrlTitle,disabled:n,active:!1}}function Ha(A,t,e){const n=A.ref;if(!n.contrlVis)return;if(n.contrlDefProc===4){Go(t,A,e);return}const i=Oa(n);Ba(t,i)}function Nt(A,t){for(const e of A.controlList)Ha(e,t)}function To(A){return A===0?kA:A===1||A===2?za:kA}function Sa(A,t){const e=A,n=t.controlList;for(let i=n.length-1;i>=0;i--){const r=n[i],o=r.ref;if(!(!o.contrlVis||o.contrlHilite===255)&&ln(e,o.contrlRect))return{theControl:r,partCode:To(o.contrlDefProc)}}return{theControl:null,partCode:0}}function Wa(A,t){const{verticalRect:e,horizontalRect:n,scrollY:i,scrollX:r,contentHeight:o,contentWidth:s,scrollableBodyH:a,contentW:l,scheduleRender:d}=t;if(A.scrollBarControls.length=0,e){const c=Math.max(0,o-a),p=Math.max(0,e.bottom-e.top-2*Ze),u=xA(A,e,"",!0,i,0,c,4,0,A.scrollBarControls);u.ref.contrlData={vertical:!0,trackLengthPx:p,contentLength:o,pageSize:a},u.ref.contrlAction=(g,f)=>{f===pn?(A.scrollY=Math.max(0,A.scrollY-12),d()):f===fn?(A.scrollY=Math.min(c,A.scrollY+12),d()):f===gn?(A.scrollY=Math.max(0,A.scrollY-a),d()):f===mn&&(A.scrollY=Math.min(c,A.scrollY+a),d())}}if(n){const c=Math.max(0,s-l),p=Math.max(0,n.right-n.left-2*Ze),u=xA(A,n,"",!0,r,0,c,4,0,A.scrollBarControls);u.ref.contrlData={vertical:!1,trackLengthPx:p,contentLength:s,pageSize:l},u.ref.contrlAction=(g,f)=>{f===pn?(A.scrollX=Math.max(0,A.scrollX-12),d()):f===fn?(A.scrollX=Math.min(c,A.scrollX+12),d()):f===gn?(A.scrollX=Math.max(0,A.scrollX-l),d()):f===mn&&(A.scrollX=Math.min(c,A.scrollX+l),d())}}}function Kn(A,t){const e=A.ref,n=e.contrlRect,i=e.contrlData,r=(i==null?void 0:i.vertical)??n.bottom-n.top>=n.right-n.left,o=Ze,s=e.contrlMin,a=Math.max(e.contrlMax,s+1),l=a-s;if(r){const d=n.top+o,c=n.bottom-o,p=Math.max(0,c-d),u=(i==null?void 0:i.contentLength)??l,g=(i==null?void 0:i.pageSize)??p,f=u>0?Math.max(12,Math.floor(g/u*p)):p,m=Math.max(0,p-f),h=t.v,D=m>0?(h-d)/m:0,M=s+D*l;return Math.max(s,Math.min(a,Math.round(M)))}else{const d=n.left+o,c=n.right-o,p=Math.max(0,c-d),u=(i==null?void 0:i.contentLength)??l,g=(i==null?void 0:i.pageSize)??p,f=u>0?Math.max(12,Math.floor(g/u*p)):p,m=Math.max(0,p-f),h=t.h,D=m>0?(h-d)/m:0,M=s+D*l;return Math.max(s,Math.min(a,Math.round(M)))}}function Ka(A,t){const e=A.ref,n=e.contrlRect,i=e.contrlData,r=(i==null?void 0:i.vertical)??n.bottom-n.top>=n.right-n.left,o=Ze,s=e.contrlValue,a=e.contrlMin,d=Math.max(e.contrlMax,a+1)-a;if(r){const c=n.top;n.left;const p=c+o,u=n.bottom-o,g=Math.max(0,u-p),f=(i==null?void 0:i.contentLength)??d,m=(i==null?void 0:i.pageSize)??g,h=f>0?Math.max(12,Math.floor(m/f*g)):g,D=Math.max(0,g-h),M=p+(d>0?Math.floor(s/d*D):0),k=M+h,C=t.v;return C<p?pn:C>=u?fn:C<M?gn:C<k?qn:mn}else{const c=n.left;n.top;const p=c+o,u=n.right-o,g=Math.max(0,u-p),f=(i==null?void 0:i.contentLength)??d,m=(i==null?void 0:i.pageSize)??g,h=f>0?Math.max(12,Math.floor(m/f*g)):g,D=Math.max(0,g-h),M=p+(d>0?Math.floor(s/d*D):0),k=M+h,C=t.h;return C<p?pn:C>=u?fn:C<M?gn:C<k?qn:mn}}function La(A,t){var i;const e=A.scrollBarControls,n=t;for(let r=e.length-1;r>=0;r--){const o=e[r],s=o.ref;if(s.contrlVis&&ln(n,s.contrlRect)){const a=s.contrlDefProc===4?Ka(o,n):((i=s.contrlData)==null?void 0:i.partCode)??0;return{theControl:o,partCode:a}}}return{theControl:null,partCode:0}}function gr(A,t,e,n){var s;const i=A.ref,r=i.contrlRect,o=n??(i.contrlDefProc===4?((s=i.contrlData)==null?void 0:s.partCode)??0:To(i.contrlDefProc));return i.contrlDefProc===4&&n===qn?(Ln(A,Kn(A,t)),{onTrackEnd(a){const l=Kn(A,a);return Ln(A,l),ln(a,r)?qn:0},onTrackMove(a){const l=Kn(A,a);Ln(A,l)}}):(i.contrlDefProc===0&&ti(e,()=>{fA(),or(r,le,le)}),a=>(i.contrlDefProc===0&&ti(e,()=>{fA(),or(r,le,le)}),ln(a,r)?o:0))}function mr(A){return A.ref.contrlValue}function Ln(A,t){A.ref.contrlValue=t}function Ea(A,t,e,n){let i=n,r=0,o=1-n;for(qr(A,t,e,i,r);i>r;)r++,o<=0?o+=2*r+1:(i--,o+=2*(r-i)+1),qr(A,t,e,i,r)}function qr(A,t,e,n,i){CA(A,t+n,e+i,z),CA(A,t-n,e+i,z),CA(A,t+n,e-i,z),CA(A,t-n,e-i,z),CA(A,t+i,e+n,z),CA(A,t-i,e+n,z),CA(A,t+i,e-n,z),CA(A,t-i,e-n,z)}function Za(A,t,e,n){for(let i=-n;i<=n;i++){const r=Math.floor(Math.sqrt(n*n-i*i));for(let o=-r;o<=r;o++)CA(A,t+o,e+i,z)}}const Ga=0,Ta=1,Qo=3,Qa=4,Ya=5,Na=6,Fa=7,Yo=9,No=10,Ra=11,DA=20,ue=20,bA=16,Lt=1,ct=11,ZA=11,FA=16;class ae{constructor(t){this.windows=[],this.dragging=null,this.resizing=null,this.zoomBoxPressed=null,this.closeBoxPressed=null,this._lastActiveId=null,this.config=t}static isChromeless(t){return t==="alert"||t==="desktop"||t==="presentation"}static isModal(t){return t==="alert"}openWindow(t){if(this.windows.find(o=>o.id===t.id)){this.bringToFront(t.id);return}const n=t.chromeless??ae.isChromeless(t.windowKind),i=t.modal??ae.isModal(t.windowKind),r={...t,scrollY:t.scrollY??0,scrollX:t.scrollX??0,active:!0,chromeless:n,modal:i,controlList:[],scrollBarControls:[],updateRect:null};r.userBounds={x:r.x,y:r.y,width:r.width,height:r.height},this._insertInLayerOrder(r),this._notifyActiveChange(()=>this._updateActive())}_insertInLayerOrder(t){if(t.windowKind==="desktop"){this.windows.unshift(t);return}if(t.windowKind==="alert"){this.windows.push(t);return}if(t.windowKind==="utility"){const n=this.windows.findIndex(i=>i.windowKind==="alert");n>=0?this.windows.splice(n,0,t):this.windows.push(t);return}const e=this.windows.findIndex(n=>n.windowKind==="utility"||n.windowKind==="alert");e>=0?this.windows.splice(e,0,t):this.windows.push(t)}closeWindow(t){const e=this.windows.find(n=>n.id===t);e&&(e.port=void 0,e.framePort=void 0),this.windows=this.windows.filter(n=>n.id!==t),this._notifyActiveChange(()=>this._updateActive())}bringToFront(t){if(this.hasModalWindow()){const o=this.windows.find(s=>s.id===t);if(o&&!o.modal)return}const e=this.windows.findIndex(o=>o.id===t);if(e<0)return;const n=this.windows[e];this.windows.splice(e,1);const i=this._tierOf(n.windowKind);let r=0;for(let o=0;o<this.windows.length;o++)this._tierOf(this.windows[o].windowKind)<=i&&(r=o+1);this.windows.splice(r,0,n),this._notifyActiveChange(()=>this._updateActive())}_tierOf(t){switch(t){case"desktop":return 0;case"document":case"dialog":case"presentation":return 1;case"utility":return 2;case"alert":return 3}}hasModalWindow(){return this.windows.some(t=>t.modal)}getActiveWindow(){for(let t=this.windows.length-1;t>=0;t--)if(this.windows[t].windowKind!=="desktop")return this.windows[t];return null}_updateActive(){const t=this.getActiveWindow();for(let e=0;e<this.windows.length;e++)this.windows[e].active=this.windows[e].windowKind!=="desktop"&&t!==null&&this.windows[e].id===t.id}_notifyActiveChange(t){const e=this._lastActiveId;t();const n=this.getActiveWindow(),i=(n==null?void 0:n.id)??null;i!==e&&(this._lastActiveId=i,this.config.onActivateChange&&this.config.onActivateChange(e,i))}_maxContentSize(){return{width:this.config.screenWidth-6,height:this.config.screenHeight-this.config.menubarHeight-6}}_defaultStandardBounds(){const t=this._maxContentSize();return{x:3,y:this.config.menubarHeight+3,width:t.width,height:t.height}}zoomWindow(t){const e=t.standardBounds??this._defaultStandardBounds();if(t.x===e.x&&t.y===e.y&&t.width===e.width&&t.height===e.height){const i=t.userBounds??{x:t.x,y:t.y,width:t.width,height:t.height};t.x=i.x,t.y=i.y,t.width=i.width,t.height=i.height}else t.userBounds={x:t.x,y:t.y,width:t.width,height:t.height},t.x=e.x,t.y=e.y,t.width=e.width,t.height=e.height}findWindow(t,e){if(e<this.config.menubarHeight)return{windowId:null,part:"inMenuBar"};for(let n=this.windows.length-1;n>=0;n--){const i=this.windows[n];if(i.windowKind==="desktop")continue;const r=this._hitTestWindow(i,t,e);if(r!==null)return{windowId:i.id,part:r}}return{windowId:null,part:"inDesktop"}}_partToCode(t){return{inMenuBar:Ta,inDesktop:Ga,inWindowBackground:Ra,inDrag:Qa,inGoAway:Na,inZoom:Fa,inGrow:Ya,inVScroll:Yo,inHScroll:No,inContent:Qo}[t]}findWindowWithPartCode(t,e){const n=this.findWindow(t,e);return n.windowId===null?{theWindow:null,partCode:this._partToCode(n.part)}:{theWindow:this.windows.find(r=>r.id===n.windowId)??null,partCode:this._partToCode(n.part)}}_hitTestWindow(t,e,n){if(t.chromeless){const d=this.getContentRect(t);return e>=d.x&&e<d.x+d.w&&n>=d.y&&n<d.y+d.h?"inContent":null}const{x:i,y:r,width:o}=t,s=this._headerHeight(t),a=s+t.height;if(e<i||e>=i+o+Lt||n<r||n>=r+a+Lt)return null;if(t.active&&n>=r&&n<r+DA){const d=i+o-8-ZA;if(e>=d&&e<d+ZA)return"inZoom"}if(t.active&&n>=r&&n<r+DA){const d=i+8;if(e>=d&&e<d+ct)return"inGoAway"}if(n>=r&&n<r+DA)return"inDrag";if(t.resizable){const d=i+o-FA,c=r+s+t.height-FA;if(e>=d&&e<d+FA&&n>=c&&n<c+FA)return"inGrow"}if(t.scrollable){const d=i+o-bA-1,c=t.contentTopInset??0,p=r+s+c-1,u=this._scrollableBodyHeight(t);if(e>=d&&e<d+bA&&n>=p&&n<p+u)return"inVScroll"}if(t.scrollable){const d=r+s+this._bodyHeight(t),c=bA;if(n>=d&&n<d+c)return"inHScroll"}const l=this.getContentRect(t);return e>=l.x&&e<l.x+l.w&&n>=l.y&&n<l.y+l.h?"inContent":"inWindowBackground"}_headerHeight(t){return t.windowKind==="presentation"?0:DA+(t.infoBar?ue:0)}_bottomBarHeight(t){return t.windowKind==="presentation"?0:t.scrollable||t.resizable?bA:0}_bodyHeight(t){return t.height-this._bottomBarHeight(t)}_scrollableBodyHeight(t){const e=t.contentTopInset??0;return Math.max(0,this._bodyHeight(t)-e)}getContentRect(t){if(t.chromeless)return{x:t.x,y:t.y,w:t.width,h:t.height};const e=t.scrollable?bA:0,n=this._headerHeight(t),i=this._bodyHeight(t);return{x:t.x+1,y:t.y+n,w:t.width-2-e,h:i}}static makeRegion(t){return{rgn:{rgnSize:10,rgnBBox:cA(t)}}}_createOrUpdatePort(t,e,n){const i=e.portRect.right,r=e.portRect.bottom,o=e.portBits.baseAddr,s=e.portBits.rowBytes,a=_(0,0,t.h,t.w),l=_(-t.y,-t.x,r-t.y,i-t.x);return n?(n.portRect=cA(a),n.portBits.baseAddr=o,n.portBits.rowBytes=s,n.portBits.bounds=cA(l),n.visRgn.rgn.rgnBBox=cA(a),n.visRgn.rgn.scanlines=void 0,n.clipRgn.rgn.rgnBBox=cA(a),n.clipRgn.rgn.scanlines=void 0,n):{device:0,portBits:{baseAddr:o,rowBytes:s,bounds:cA(l)},portRect:cA(a),visRgn:ae.makeRegion(a),clipRgn:ae.makeRegion(a),bkPat:new Uint8Array(8),fillPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnLoc:{v:0,h:0},pnSize:{v:1,h:1},pnMode:Xt,pnPat:new Uint8Array([255,255,255,255,255,255,255,255]),pnVis:0,txFont:0,txFace:0,txMode:1,txSize:0,spExtra:0,fgColor:yi,bkColor:bi,colrBit:0,patStretch:0,picSave:null,rgnSave:null,polySave:null,grafProcs:e.grafProcs}}ensureWindowPort(t,e,n){if(n!=null&&n.useFrameRect){const r=this._headerHeight(t),o=this._bodyHeight(t),s={x:t.x,y:t.y,w:t.width,h:r+o};return t.framePort=this._createOrUpdatePort(s,e,t.framePort),t.framePort}const i=this.getContentRect(t);return t.port=this._createOrUpdatePort(i,e,t.port),t.port}InvalRect(t,e){if(t.updateRect===null){t.updateRect=cA(e);return}const n=_(0,0,0,0);kl(t.updateRect,e,n),t.updateRect=cA(n)}ValidRect(t,e){t.updateRect=null}BeginUpdate(t){if(t.updateRect===null||!t.port)return;ht(t.port);const e=t.updateRect,n=_(e.top,e.left,e.bottom,e.right),i=Pe();Co(i,n),zo(i)}EndUpdate(t){t.updateRect=null}createWindowContext(t,e,n){this.ensureWindowPort(t,n);const i=t.port,r=this.getContentRect(t),o=(d,c,p,u)=>{this.resizing={windowId:t.id,startX:d,startY:c,startWidth:p,startHeight:u,prospectiveWidth:p,prospectiveHeight:u}},s=t.contentTopInset??0,a=s>0?0:t.scrollY,l=s>0?0:t.scrollX;return new Ee(i,0,0,r.w,r.h,a,l,e,o,{width:t.minWidth,height:t.minHeight},{width:t.width,height:t.height},s,t.scrollY,t.scrollX,r.x,r.y,t)}toContentLocal(t,e,n){const i=this.getContentRect(t),r=t.contentTopInset??0;return r>0?n<i.y+r?{x:e-i.x,y:n-i.y}:{x:e-i.x+t.scrollX,y:n-i.y-r+t.scrollY}:{x:e-i.x+t.scrollX,y:n-i.y+t.scrollY}}handleMouseMove(t,e){if(this.dragging){const n=t-this.dragging.offsetX,i=Math.max(this.config.menubarHeight,e-this.dragging.offsetY);return this.dragging.prospectiveX=n,this.dragging.prospectiveY=i,{consumed:!0}}if(this.resizing){const n=t-this.resizing.startX,i=e-this.resizing.startY,r=this.windows.find(l=>l.id===this.resizing.windowId),o=(r==null?void 0:r.minWidth)??100,s=(r==null?void 0:r.minHeight)??60,a=this._maxContentSize();return this.resizing.prospectiveWidth=Math.max(o,Math.min(a.width,this.resizing.startWidth+n)),this.resizing.prospectiveHeight=Math.max(s,Math.min(a.height,this.resizing.startHeight+i)),{consumed:!0}}return{consumed:!1}}handleMouseUp(){if(this.dragging){const t=this.windows.find(e=>e.id===this.dragging.windowId);return t&&(t.x=this.dragging.prospectiveX,t.y=this.dragging.prospectiveY,t.userBounds={x:t.x,y:t.y,width:t.width,height:t.height}),this.dragging=null,{consumed:!0}}if(this.resizing){const t=this.windows.find(e=>e.id===this.resizing.windowId);return t&&(t.width=this.resizing.prospectiveWidth,t.height=this.resizing.prospectiveHeight,t.userBounds={x:t.x,y:t.y,width:t.width,height:t.height}),this.resizing=null,{consumed:!0}}return{consumed:!1}}isDraggingOrResizing(){return!!(this.dragging||this.resizing)}getDragOutline(){if(this.dragging){const t=this.windows.find(n=>n.id===this.dragging.windowId);if(!t)return null;const e=this._headerHeight(t);return{x:this.dragging.prospectiveX,y:this.dragging.prospectiveY,width:t.width,height:e+t.height,kind:"drag",windowId:t.id}}if(this.resizing){const t=this.windows.find(n=>n.id===this.resizing.windowId);if(!t)return null;const e=this._headerHeight(t);return{x:t.x,y:t.y,width:this.resizing.prospectiveWidth,height:e+this.resizing.prospectiveHeight,kind:"resize",windowId:t.id}}return null}handleScroll(t,e){const n=this._scrollableBodyHeight(t),i=Math.max(0,t.contentHeight-n);t.scrollY=Math.max(0,Math.min(i,t.scrollY+e))}handleHScroll(t,e){const n=t.scrollable?bA:0,i=t.width-2-n,r=Math.max(0,t.contentWidth-i);t.scrollX=Math.max(0,Math.min(r,t.scrollX+e))}drawWindowChrome(t,e,n,i,r){const o=(y,I,V,x,O)=>mA(t,y,I,V,x,O),s=(y,I,V,x,O=z)=>qt(t,y,I,V,x,O),a=(y,I,V,x=z)=>zA(t,y,I,V,x),l=(y,I,V,x)=>So(t,y,I,V,x),d=(y,I,V)=>PA(t,y,I,V),c=(y,I,V,x)=>{ht(t),an(dn(x==null?void 0:x.font)),cn(0),wA(I,V),mt(y)},u=this.hasModalWindow()&&!e.modal;if(e.chromeless){const y=this.getContentRect(e);u||(e.modal&&i.add({id:"modal-scrim",x:0,y:0,w:this.config.screenWidth,h:this.config.screenHeight,onMouseDown:()=>{},onMouseUp:()=>{}}),i.add({id:`win-content-${e.id}`,x:y.x,y:y.y,w:y.w,h:y.h,onMouseDown:(I,V)=>{r.onBringToFront(e.id),r.onContentEvent(e.id,{type:"mouseDown",x:I+e.scrollX,y:V+e.scrollY})},onMouseUp:(I,V)=>{r.onContentEvent(e.id,{type:"mouseUp",x:I+e.scrollX,y:V+e.scrollY})},onDoubleClick:(I,V)=>{r.onContentEvent(e.id,{type:"doubleClick",x:I+e.scrollX,y:V+e.scrollY})}}));return}const{x:g,y:f,width:m,title:h,active:D}=e,k=this._headerHeight(e)+e.height;if(!u){i.add({id:`win-bg-${e.id}`,x:g,y:f,w:m+Lt,h:k+Lt,onMouseDown:()=>{r.onBringToFront(e.id)}});const y=this.getContentRect(e),I=e.contentTopInset??0,V=(H,B)=>I>0&&B<I?H:H+e.scrollX,x=H=>I>0&&H<I?H:I>0?H-I+e.scrollY:H+e.scrollY,O=H=>I>0?H<I?"fixed":"scrollable":void 0;i.add({id:`win-content-${e.id}`,x:y.x,y:y.y,w:y.w,h:y.h,onMouseDown:(H,B)=>{r.onBringToFront(e.id),r.onContentEvent(e.id,{type:"mouseDown",x:V(H,B),y:x(B),contentRegion:O(B)})},onMouseUp:(H,B)=>{r.onContentEvent(e.id,{type:"mouseUp",x:V(H,B),y:x(B),contentRegion:O(B)})},onDoubleClick:(H,B)=>{r.onContentEvent(e.id,{type:"doubleClick",x:V(H,B),y:x(B),contentRegion:O(B)})}}),i.add({id:`win-titlebar-${e.id}`,x:g,y:f,w:m,h:DA,onMouseDown:(H,B)=>{r.onBringToFront(e.id),this.dragging={windowId:e.id,offsetX:H,offsetY:B,prospectiveX:e.x,prospectiveY:e.y}}})}o(g+Lt,f+k,m,Lt,z),o(g+m,f+Lt,Lt,k,z),o(g,f,m,k,Y),s(g,f,m,k,z),a(g,f+DA-1,m,z);const C=JA(h,"menu"),w=g+Math.floor((m-C)/2),v=f+3;if(D){const y=f+4,I=11;o(g+1,y,m-2,I,Y);for(let E=0;E<I;E+=2)a(g+1,y+E,m-2,z);const V=g+8,x=f+Math.floor((DA-ct)/2),O=this.closeBoxPressed===e.id,H=n.get(O?"chrome/closing":"chrome/close");o(V-1,x-1,ct+2,ct+2,Y),H?d(H,V,x):s(V,x,ct,ct,z),u||i.add({id:`win-close-${e.id}`,x:V,y:x,w:ct,h:ct,onMouseDown:()=>{this.closeBoxPressed=e.id,r.scheduleRender()},onMouseUp:(E,R)=>{const q=E>=0&&E<ct&&R>=0&&R<ct;this.closeBoxPressed=null,q?r.onClose(e.id):r.scheduleRender()}});const B=g+m-8-ZA,S=f+Math.floor((DA-ZA)/2),Q=this.zoomBoxPressed===e.id,N=n.get("chrome/zoom");o(B-1,S-1,ZA+2,ZA+2,Y),N?d(N,B,S):s(B,S,ZA,ZA,z),Q&&l(B+1,S+1,ZA-2,ZA-2),u||i.add({id:`win-zoom-${e.id}`,x:B,y:S,w:ZA,h:ZA,onMouseDown:()=>{this.zoomBoxPressed=e.id,r.scheduleRender()},onMouseUp:(E,R)=>{const q=E>=0&&E<ZA&&R>=0&&R<ZA;this.zoomBoxPressed=null,q&&r.onZoom(e.id),r.scheduleRender()}}),o(w-4,f+1,C+8,DA-2,Y)}if(c(h,w,v,{font:"menu"}),e.infoBar&&this._drawInfoBar(t,e),e.scrollable){const y=this._headerHeight(e),I=this._bodyHeight(e),V=this._scrollableBodyHeight(e),x=e.contentTopInset??0,O=e.resizable?FA:0,H=bA,B=e.width-1-H;if(x>0){const E=e.x+e.width-bA;mA(t,E,e.y+y,bA,x,Y)}const S=_(y+x-1,e.width-bA,y+x-1+V,e.width),Q=_(y+I,0,y+I+bA,e.width-O);Wa(e,{verticalRect:S,horizontalRect:Q,scrollY:e.scrollY,scrollX:e.scrollX,contentHeight:e.contentHeight,contentWidth:e.contentWidth,scrollableBodyH:V,contentW:B,scheduleRender:r.scheduleRender});const N=this.ensureWindowPort(e,t,{useFrameRect:!0});Ma(e,N,E=>n.get(E)??null)}e.resizable&&this._drawGrowBox(t,e,n,i,r)}drawDragOutline(t){const e=this.getDragOutline();e&&Ko(t,e.x,e.y,e.width,e.height,"darkCheckers")}_drawInfoBar(t,e){const{x:n,y:i,width:r}=e,o=i+DA,s=e.infoBar;if(zA(t,n,o+ue-1,r,z),s.length>0){ht(t),an(dn("body")),cn(0);const a=Math.floor((r-2)/s.length);for(let l=0;l<s.length;l++){const d=JA(s[l],"body"),c=n+1+l*a+Math.floor((a-d)/2);wA(c,o+4),mt(s[l]),l<s.length-1&&Jt(t,n+1+(l+1)*a,o,ue-1,z)}}}_drawGrowBox(t,e,n,i,r){const o=this._headerHeight(e),s=e.x+e.width-FA,a=e.y+o+e.height-FA,l=n.get("chrome/resize");l?PA(t,l,s,a):(mA(t,s,a,FA,FA,Y),zA(t,s,a,FA,z),Jt(t,s,a,FA,z)),i.add({id:`win-growbox-${e.id}`,x:s,y:a,w:FA,h:FA,onMouseDown:(d,c)=>{this.resizing={windowId:e.id,startX:s+d,startY:a+c,startWidth:e.width,startHeight:e.height,prospectiveWidth:e.width,prospectiveHeight:e.height}}})}getScrollableBodyHeight(t){return this._bodyHeight(t)}}function X(A,t,e){const n=atob(e),i=A*t,r=new Uint8Array(i),o=new Uint8Array(i);for(let s=0;s<i;s++){const a=s>>2,l=6-(s&3)*2,d=n.charCodeAt(a)>>l&3;r[s]=d===2?z:Y,o[s]=d===0?0:1}return{width:A,height:t,data:r,mask:o}}class Ua{constructor(){this.entries=new Map,this.nameIndex=new Map,this.cache=new Map,this.loading=new Map}_key(t,e){return`${t}:${e}`}_nameKey(t,e){return`${t}:${e}`}get(t){return this.cache.get(t)}has(t){return this.cache.has(t)}register(t,e){this.cache.set(t,e)}registerAll(t){for(const[e,n]of Object.entries(t))this.cache.set(e,n)}async load(t,e,n){const i=this.cache.get(t);if(i)return i;const r=this.loading.get(t);if(r)return r;const o=this._loadImage(t,e,n);this.loading.set(t,o);const s=await o;return this.loading.delete(t),this.cache.set(t,s),s}async preload(t){await Promise.all(t.map(e=>this.load(e)))}static fromBits(t,e,n,i=!1){const r=new Uint8Array(t*e),o=new Uint8Array(t*e);if(i){const s=n.length/2;for(let a=0;a<s;a++)r[a]=n[a]?z:Y,o[a]=n[s+a]?1:0}else for(let s=0;s<n.length;s++)r[s]=n[s]?z:Y,o[s]=1;return{width:t,height:e,data:r,mask:o}}async _loadImage(t,e,n){const r=await(await fetch(t)).blob(),o=await createImageBitmap(r),s=e??o.width,a=n??o.height,d=new OffscreenCanvas(s,a).getContext("2d");d.imageSmoothingEnabled=!1,d.drawImage(o,0,0,s,a),o.close();const p=d.getImageData(0,0,s,a).data,u=new Uint8Array(s*a),g=new Uint8Array(s*a);for(let f=0;f<s*a;f++){const m=f*4;if(p[m+3]<128)u[f]=Y,g[f]=0;else{const D=(p[m]+p[m+1]+p[m+2])/3;u[f]=D<128?z:Y,g[f]=1}}return{width:s,height:a,data:u,mask:g}}AddResource(t,e,n,i){const r={resType:t,resID:e,name:n,data:i};this.entries.set(this._key(t,e),r),n&&this.nameIndex.set(this._nameKey(t,n),r),this.cache.set(n,i)}AddSpriteResource(t,e,n,i,r,o){const s=X(i,r,o);this.AddResource(t,e,n,s)}GetResource(t,e){const n=this.entries.get(this._key(t,e));return(n==null?void 0:n.data)??null}GetNamedResource(t,e){const n=this.nameIndex.get(this._nameKey(t,e));return n?n.data:this.cache.get(e)??null}CountResources(t){let e=0;for(const n of this.entries.values())n.resType===t&&e++;return e}GetResourceIDs(t){const e=[];for(const n of this.entries.values())n.resType===t&&e.push(n.resID);return e}RemoveResource(t,e){const n=this._key(t,e),i=this.entries.get(n);i&&(this.entries.delete(n),i.name&&this.nameIndex.delete(this._nameKey(t,i.name)))}}const ja=X(32,32,"AKqqqqqqqgAKVVVVVVVVoCVVVVVVVVVYJVVVaqlVVViVVVaVVpVVVpVVaWqpaVVWlVWWqqqWVVaVVmqqqqmVVpVZqqqqqmVWlWaqlaqqmVaVZqlVaqqZVpWapVWqqqZWlZqlWqqqplaWapVpqqqplpZqlaaqqqmWlmqVqqqqqZaWaqaqqqqplpZqqqqmqqmWlmqqqpaaqZaVmqqqqpamVpWaqqqqVqZWlWaqqqVamVaVZqqqqWqZVpVZqqqqqmVWlVZqqqqplVaVVZaqqpZVVpVVaWqpaVVWlVVWlVaVVVYlVVVqqVVVWCVVVVVVVVVYClVVVVVVVaAAqqqqqqqqAA=="),Xa=X(32,32,"AAAAqqoAAAAAACpmpqgAAAACpqmqqoAAAAppmpqaoAAAKqqpqqqoAACmmqqqamoAAqmpmqqqqoAKaqqqmqqqYAmpqqmqmpqgKpqZqqqqqqgpqqlqqapqqCqqqVaqqqqomampVWqqqqqqqqlVVqqqqppqqVVVaqqqqqaZVVVWqqqaqqlVVVWqqqqqqVVVWqqqqmqpVVWqqqqqqmlVWqqqqCaqqVWqqqqoKqqpWqqqqqgpqqmqqqqqqAqaqqqqqqqgCqqqqqqqqqACqqqqqqqqgACqqqqqqqoAACqqqqqqqAAACqqqqqqgAAACqqqqqoAAAAAqqqqoAAAAAACqqgAAAA=="),Ja=X(16,16,"CqqqoCqqqqiqqWqqqqlqqqqlWqqqpVqqqpWWqqqWlqqlVWVapVVlWqqqpaqpaqlqqWqpaqqqqqoqqqqoCqqqoA=="),_a=X(32,32,"ACqqqqqqqAACqqqqqqqqgAqqqqqqqqqgKqqqqqqqqqgqqqqWlqqqqKqqqlaVqqqqqqqqlWaqqqqqqqqVZqqqqqqqqqWaqqqqqqqqpZqqqqqqqqqmWqqqqqqqqpZmqqqqqqqqmaaqqqqqqqpZpaqqqqqqqmaZqqqqqqqpZplqqqqqqqmapmqqqqqqpZqmWqqqqqVVVWmVWqqqmZmZqZZmqqqlVVVaZpqqqqqqqqplqqqqqmaqqpmqqqqpZqqqmWqqqqlaqqqlaqqqqlqqqqWqqqqqqqqqqqqqKqqqqqqqqqgqqqqqqqqqqAqqqqqqqqqgAqqqqqqqqoAAKqqqqqqoAA=="),$a=X(32,32,"AKqqqqqqqgAKqqqqqqqqoCqqqqqqqqqoKqqqqqqqqqiqqqqWlqqqqqqqqlaVqqqqqqqqlWaqqqqqqqqVZqqqqqqqqqWaqqqqqqqqpZqqqqqqqqqmWqqqqqqqqpZmqqqqqqqqmaaqqqqqqqpZpaqqqqqqqmaZqqqqqqqpZplqqqqqqqmapmqqqqqqpZqmWqqqqqVVVWmVWqqqmZmZqZZmqqqlVVVaZpqqqqqqqqplqqqqqmaqqpmqqqqpZqqqmWqqqqlaqqqlaqqqqlqqqqWqqqqqqqqqqqqqqqqqqqqqqqoqqqqqqqqqqCqqqqqqqqqoCqqqqqqqqqAAqqqqqqqqAA=="),Ac=X(32,32,"ACqqqqqqqAACqqqqqqqqgAqlVVVVVVqgKlqqqqqqpagpqqqWlqqqaKmqqlaVqqpqpqqqlWaqqpqmqqqVZqqqmqaqqqWaqqqapqqqpZqqqpqmqqqmWqqqmqaqqpZmqqqapqqqmaaqqpqmqqpZpaqqmqaqqmaZqqqapqqpZplqqpqmqqmapmqqmqaqpZqmWqqapqVVVWmVWpqmmZmZqZZmmqalVVVaZpqapqqqqqplqpqmqmaqqpmqmqapZqqqmWqapqlaqqqlapqmqlqqqqWqmqmqqqqqqqpqKaqqqqqqqmgqWqqqqqqlqAqlVVVVVVqgAqqqqqqqqoAAKqqqqqqoAA=="),tc=X(32,32,"ACqqqqqqqAAClVVVVVVWgAlmpqampqlgJqpqampqapgmpqampqammKpqampqampqpqampqampqaqaqqqaqqqaqapVlqpVVqmqqVVVVaqpqqpmqVVWpWpqqqVWlaaVmmqmpqllmpqaZqqmqmWmmlpqqmaaZValamqqpqZlVaqpqqampmVWVVamqqammVWZmaqqpqaZVVVVqqqmpplVVVWqqqaamVVVVaqqpqqZVVVVqqqmqpmqqqmqqqlVVVVVVqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqKqqqqqqqqqgqqqqqqqqqqAqqqqqqqqqgAqqqqqqqqoAAKqqqqqqoAA=="),ec=X(32,32,"AAAAAAAAAAAAAAAAIAAAAAAAAgAgAgAAAAAAgCAIAAAAAAAgICAAAAAAAAgggAAAAAAAAgIAAAAAACgAAACgAAAAAoqqigAAAAAACWWAAAAAAAAJqYAAAAAAKompiqAAAKAACWWAAAACqgCqqqoqoAJWKJVVViVgKqqqqqqqqqglVVVVVVVVWCVaqqqqqqpYJVlVVapVVlglaVVaVaVWmCVpVWWqWVaYJWlVZlWZVpglaVWZVWZWmCVpaZlVZlaYJWlpmVVmVpglaaWZVWZWmCVpVWZVmVaYJWlVZapZVpglaVVaVaVWmCVpVVWqVVaYJVqqqqqqqlgqqqqqqqqqqA=="),nc=X(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqgAAAAAAqAKqgAAAAACYCVVgKqgAqqqpVWqVVgCqqqqqqpVWAKmqqVVqpVoAqqqVVVaqqgCpqlaqlaqqAKqqWlWlqqoAqalpVWlqqgCqqWVVWWqqAKqpZVVZaqoAqqllVVlqqgCqqWVVWWqqAKqpaVVpaqoAqqpaVaWqqgCqqlaqlaqqAKqqlVVWqqoAqqqpVWqqqgCqqqqqqqqqAKqqqqqqqqoA=="),ic=X(32,32,"qqqqqqqqqqqVVWqqqqqqqpVVaqqqqqqqlVVqqqqqqqqVVWqqqqqqqpVVaqqVVWqqlZVqqVVVVqqVlWqlVVVVqpWVapVVVVVqlVVqlVVVVWqVVWpVVVVVWpVValVVVVValVVqVVVVVVqVVWpVVVVVWpVValVVVVValVVqVVVVVVqVVWpVVVVVWpVValVVVVValVVqVVVVVVqVVWpVVVVVWpVqqlVVVVValVaqVVVVVVqVVqpVVVVVapVWqlVVVVVqlVaqVVVVVaqVVqlVVVVWqpWqlVVVVWqqlVaqqqqqqqqVVqqqqqqqqpVWqqqqqqqqlVaqqqqqqqqqqqqqqqqqqg=="),rc=X(32,32,"AAAAAAAAAAAAKqqqqqqoAACVVVVVVVYAAJVVVVVVVgAAlaqqqqpWAACWVVVVVZYAAJZmZmZVlgAAllVVVVWWAACWZmZVVZYAAJZVVVVVlgAAlmZVVVWWAACWVVVVVZYAAJZmVVVVlgAAllVVVVWWAACWZmVVVZYAAJZVVVVVlgAAllVVVVWWAACVqqqqqlYAAJVVVVVVVgAAlVVVVVVWAACVVVVVVVYAAJVVVVVVVgAAlVVVqqpWAACVVVVVVVYAAJVVVVVVVgAAlVVVVVVWAACVVVVVVVYAACqqqqqqqAAAJVVVVVVYAAAlVVVVVVgAACVVVVVVWAAAKqqqqqqoAA=="),oc=X(32,32,"AqqqqqqgAAACVVVVVWgAAAJVVVVVZgAAAlVVVVVlgAACVVVVVWVgAAJVVVVVZVgAAlVVVVVqqgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVqampppWAAJVVVVVVVYAAlVVVVVVVgACVqapqmpWAAJVVVVVVVYAAlVVVVVVVgACVpqqmppWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACqqqqqqqqAA=="),sc=X(32,32,"AqqqqqqgAAACVVVVVWgAAAJVVVVVZgAAAlVVVVVlgAACVVVVVWVgAAJVamqapVgAAlVVVVVqqgACVqamqlVWAAJVVVVVVVYAAlaqaqmqVgACVVVVVVVWAAJWpqamqVYAAlVVVVVVVgACVVVVVVVWAAJVapqmqlYAAlVVVVVVVgACVqmqappWAAJVVVVVVVYAAlaapqmqVgACVVVVVVVWAAJWqaqapVYAAlVVVVVVVgACVVVVVVVWAAJVapqaalYAAlVVVVVVVgACVqmpqapWAAJVVVVVVVYAAlamqmqaVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACqqqqqqqqAA=="),lc=X(32,32,"AAKqoAAAAAAAAmqgAAAAAAACaqAAAAAAqqqqqqqAAAClqqqqqoAAAKqqqqqqgAAAJVVWVpoAAAAlVVVmpgAAACVVVlaaAAAAJVVVZqYAAAAlVVZWmgAAACVVVWamAAAAJVVWVpoAAAAlVVVmpgAAACVVVlaaAAAAJVVVZqYAAAAlVVZWqqqqqCVVVWaVVVVWJVVWVpVVVVYlVVVmlVVVViVVVlaVVVVWJVVVZpVVVVYlVVZWlVVVViVVVWaVVVVWJVVWVqampqYlVVVmpmZmZiVVVlampqamJVVVZpVVVVYlVVZWqqqqqqqqqqqqgAAApaqqqqqAAACqqqqqqoAAAA=="),ac=X(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACqqgAAAAAAAlVVgAAAAAAJVVVgAAAAACqqqqqqqqqolVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaqqqqqqqqqqg=="),cc=X(32,32,"ACqqqqqqoAAAlVVVVVVYAAJVVVVVVVYAAlaqqqqqVgACWVVVVVWWAAJZVVVVVZYAAllVVVVVlgACWVZWVlWWAAJZVlZWVZYAAllVVlVVlgACWVVWVVWWAAJZVVpVVZYAAllVVVVVlgACWVWVZVWWAAJZVWqVVZYAAllVVVVVlgACWVVVVVWWAAJWqqqqqlYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACWlVVWqpWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAKqqqqqqqAAAlVVVVVVYAACVVVVVVVgAAJVVVVVVWAAAqqqqqqqoAA=="),dc=X(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKqqqqqqqqqiVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVlVVVVVVVVpVVVVVVVVVWlVVVVVVVVVYqqqqqqqqqqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="),uc=X(32,32,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqqqqqqqqqqCqqqqqqqqqoKWlpaWlpaWgpaWlpaWlpaCqqqqqqqqqoKqqqqqqqqqgpVVVVVVVVaClVVVVVVVVoKVVVVVVVVWgpVVWlVVVVaClVVapVVVVoKVVVqqVVVWgpVVWqqlVVaClVVaqqpVVoKVVVqqqlVWgpVVWqqlVVaClVVaqlVVVoKVVVqlVVVWgpVVWlVVVVaClVVVVVVVVoKVVVVVVVVWgpVVVVVVVVaCqqqqqqqqqoKqqqqqqqqqgpaWlpaWlpaClpaWlpaWloKqqqqqqqqqgqqqqqqqqqqA=="),pc=X(32,32,"ACqqqqqqqAAClVVVVVVWgAlmpqampqlgJqpqaqpqapgmpqaVVqammKpqaWqpampqpqaWqqqWpqaqamqqqqmqaqapqqqqqmamqqaqlaqqmqqppqlVaqqZqqqapVWqqqaqmpqlWqqqppqqapVpqqqpqqpqlaaqqqmqqmqVqqqqqaqaaqaqqqqpmqpqqqqmqqmqqmqqqpaaqaqqmqqqqpamqqqaqqqqVqaqqqaqqqVamqqqpqqqqWqaqqqpqqqqqmqqqqpqqqqpqqqqqpaqqpaqqqqqqWqpaqqqKqqqlVaqqqgqqqqqqqqqqAqqqqqqqqqgAqqqqqqqqoAAKqqqqqqoAA=="),fc=X(32,32,"AKqqqqqqqgAKVVVVVVVVoCWmpqampqZYJmpqaqpqapiapqaVVqampqpqaWqpampqpqaWqqqWpqaqamqqqqmqaqapqqqqqmamqqaqlaqqmqqppqlVaqqZqqqapVWqqqaqmpqlWqqqppqqapVpqqqpqqpqlaaqqqmqqmqVqqqqqaqaaqaqqqqpmqpqqqqmqqmqqmqqqpaaqaqqmqqqqpamqqqaqqqqVqaqqqaqqqVamqqqpqqqqWqaqqqpqqqqqmqqqqpqqqqpqqqqqpaqqpaqqqqqqWqpaqqqqqqqlVaqqqoqqqqqqqqqqCqqqqqqqqqoCqqqqqqqqqAAqqqqqqqqAA=="),gc=X(32,32,"ACqqqqqqoAAAlVVVVVVYAAJVVVVVVVYAAlaqqqqqVgACWVVVVVWWAAJZVVVVVZYAAllZlVmVlgACWVZVVlWWAAJZWZVZlZYAAllVVVVVlgACWVVllVWWAAJZVVpVVZYAAllVVVVVlgACWVWqpVWWAAJZVlVaVZYAAllVVVWVlgACWVVVVVWWAAJWqqqqqlYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAlVVVVVVVgACWlVVWqpWAAJVVVVVVVYAAlVVVVVVVgACVVVVVVVWAAJVVVVVVVYAAKqqqqqqqAAAlVVVVVVYAACVVVVVVVgAAJVVVVVVWAAAqqqqqqqoAA=="),mc=X(32,32,"AAAAqqoAAAAAACpVVagAAAAClVaVVoAAAApZVpVloAAAJVZWlZVYAACVVlaVlVYAAllVVVVVVYAKVlVVVVVloAlVlVVVVpVgJVVVVVVaVVgmVVVVVapVmCWlVVVaqVpYlVVVVWqlVVaVVVVWqpVVVpVVVVqqVVVWmqVVZqpVWqaapVWVqVVappVVVZVlVVVWlVVWVpVVVVaVVVlZVVVVViWlZaVVVVpYJlWaVVVVVZglVaVVVVVVWAlWlVVVVlVgCllVVVVVlaACVVVVVVVlgACVVlaVlVYAACVWVpWVWAAACllWlWWgAAAClVaVVoAAAAAqVVWoAAAAAACqqgAAAA=="),qc=X(32,32,"AAAAKqAAAAAAAACVWAAAAAAqqqqqqqAAAJVVVVVVWAAAlVVVVVVYAACqqqqqqqgAACVVVVVVYAAAJVVVVVVgAAAlWVlZWWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJWVlZWVgAAAlZWVlZWAAACVlZWVlYAAAJVlZWVlgAAAlVVVVVWAAACVVVVVVYAAACqqqqqqAAA=="),hc=X(32,32,"qqqqqqqqqqqVVVVVVVVVVpVVVVVVVVVWmqWqWqWqWqaZZZZZZZZZZplllllllllmmqWqWqWqWqaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVpVVVVVWlVVWqVVVVVaVVVaqlVVVVpVVVqqpVVVWlVVWqqqVVVaVVVaqqpVVVpVVVqqpVVVWlVVWqpVVVVaVVVapVVVVVpVVVpVVVVVWlVVVVVVVVVaVVVVVVVVVVpVVVVVVVVVWlVVVVVVVVVaapapapapapplllllllllmmWWWWWWWWWaapapapapappVVVVVVVVVWlVVVVVVVVVaqqqqqqqqqqg=="),xc={"icon/1bitcamera":ja,"icon/MacFlim":Xa,"icon/appstore-16x16":Ja,"icon/appstore-32x32":_a,"icon/appstore-smr-32x32":$a,"icon/appstore2":Ac,"icon/camera-32":tc,"icon/camera":ec,"icon/camera3":nc,"icon/chat":ic,"icon/computer":rc,"icon/file":oc,"icon/file0":sc,"icon/film":lc,"icon/folder":ac,"icon/happy":cc,"icon/hd":dc,"icon/movie":uc,"icon/photobooth-32x32":pc,"icon/photobooth-smr-32":fc,"icon/sad":gc,"icon/safari":mc,"icon/trash":qc,"icon/video":hc},wc=X(16,16,"AAKAAAKJagAJaWWACWlliAJZZaYCWWWWKJVVlpaVVVaVlVVYJVVVWAlVVVgJVVVgAlVVYACVVYAAJVWAACVVgA=="),yc=X(16,16,"AAAAAAAAAAAAAAAAAAAAAACiigACWWWgAlVVmACVVVgClVVYCVVVWAlVVVgJVVVgAlVVYACVVYAAJVWAACVVgA=="),bc=X(16,16,"UAAAAGQAAABpAAAAakAAAGqQAABqpAAAaqkAAGqqQABqqpAAaqVUAGmkAABkaQAAUGkAAEAaQAAAGkAAAAVAAA=="),Vc=X(32,32,"VQAAAAAAAABVAAAAAAAAAFpQAAAAAAAAWlAAAAAAAABapQAAAAAAAFqlAAAAAAAAWqpQAAAAAABaqlAAAAAAAFqqpQAAAAAAWqqlAAAAAABaqqpQAAAAAFqqqlAAAAAAWqqqpQAAAABaqqqlAAAAAFqqqqpQAAAAWqqqqlAAAABaqqqqpQAAAFqqqqqlAAAAWqqqVVVQAABaqqpVVVAAAFqlqlAAAAAAWqWqUAAAAABaUFqlAAAAAFpQWqUAAAAAVQBapQAAAABVAFqlAAAAAFAABapQAAAAUAAFqlAAAAAAAAWqUAAAAAAABapQAAAAAAAAVVAAAAAAAABVUAAAAA=="),kc=X(48,48,"VVAAAAAAAAAAAAAAVVAAAAAAAAAAAAAAVVAAAAAAAAAAAAAAVqVAAAAAAAAAAAAAVqVAAAAAAAAAAAAAVqVAAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqqVAAAAAAAAAAAVqqqVAAAAAAAAAAAVqqqVAAAAAAAAAAAVqqqqVAAAAAAAAAAVqqqqVAAAAAAAAAAVqqqqVAAAAAAAAAAVqqqqqVAAAAAAAAAVqqqqqVAAAAAAAAAVqqqqqVAAAAAAAAAVqqqqqqVAAAAAAAAVqqqqqqVAAAAAAAAVqqqqqqVAAAAAAAAVqqqqqqqVAAAAAAAVqqqqqqqVAAAAAAAVqqqqqqqVAAAAAAAVqqqqqqqqVAAAAAAVqqqqqqqqVAAAAAAVqqqqqqqqVAAAAAAVqqqqqVVVVVAAAAAVqqqqqVVVVVAAAAAVqqqqqVVVVVAAAAAVqqVqqVAAAAAAAAAVqqVqqVAAAAAAAAAVqqVqqVAAAAAAAAAVqVAVqqVAAAAAAAAVqVAVqqVAAAAAAAAVqVAVqqVAAAAAAAAVVAAVqqVAAAAAAAAVVAAVqqVAAAAAAAAVVAAVqqVAAAAAAAAVAAAAVqqVAAAAAAAVAAAAVqqVAAAAAAAVAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAVqqVAAAAAAAAAAAAAVVVAAAAAAAAAAAAAVVVAAAAAAAAAAAAAVVVAAAAAAA"),Ic=X(64,64,"VVUAAAAAAAAAAAAAAAAAAFVVAAAAAAAAAAAAAAAAAABVVQAAAAAAAAAAAAAAAAAAVVUAAAAAAAAAAAAAAAAAAFWqVQAAAAAAAAAAAAAAAABVqlUAAAAAAAAAAAAAAAAAVapVAAAAAAAAAAAAAAAAAFWqVQAAAAAAAAAAAAAAAABVqqpVAAAAAAAAAAAAAAAAVaqqVQAAAAAAAAAAAAAAAFWqqlUAAAAAAAAAAAAAAABVqqpVAAAAAAAAAAAAAAAAVaqqqlUAAAAAAAAAAAAAAFWqqqpVAAAAAAAAAAAAAABVqqqqVQAAAAAAAAAAAAAAVaqqqlUAAAAAAAAAAAAAAFWqqqqqVQAAAAAAAAAAAABVqqqqqlUAAAAAAAAAAAAAVaqqqqpVAAAAAAAAAAAAAFWqqqqqVQAAAAAAAAAAAABVqqqqqqpVAAAAAAAAAAAAVaqqqqqqVQAAAAAAAAAAAFWqqqqqqlUAAAAAAAAAAABVqqqqqqpVAAAAAAAAAAAAVaqqqqqqqlUAAAAAAAAAAFWqqqqqqqpVAAAAAAAAAABVqqqqqqqqVQAAAAAAAAAAVaqqqqqqqlUAAAAAAAAAAFWqqqqqqqqqVQAAAAAAAABVqqqqqqqqqlUAAAAAAAAAVaqqqqqqqqpVAAAAAAAAAFWqqqqqqqqqVQAAAAAAAABVqqqqqqqqqqpVAAAAAAAAVaqqqqqqqqqqVQAAAAAAAFWqqqqqqqqqqlUAAAAAAABVqqqqqqqqqqpVAAAAAAAAVaqqqqqqVVVVVVUAAAAAAFWqqqqqqlVVVVVVAAAAAABVqqqqqqpVVVVVVQAAAAAAVaqqqqqqVVVVVVUAAAAAAFWqqlWqqlUAAAAAAAAAAABVqqpVqqpVAAAAAAAAAAAAVaqqVaqqVQAAAAAAAAAAAFWqqlWqqlUAAAAAAAAAAABVqlUAVaqqVQAAAAAAAAAAVapVAFWqqlUAAAAAAAAAAFWqVQBVqqpVAAAAAAAAAABVqlUAVaqqVQAAAAAAAAAAVVUAAFWqqlUAAAAAAAAAAFVVAABVqqpVAAAAAAAAAABVVQAAVaqqVQAAAAAAAAAAVVUAAFWqqlUAAAAAAAAAAFUAAAAAVaqqVQAAAAAAAABVAAAAAFWqqlUAAAAAAAAAVQAAAABVqqpVAAAAAAAAAFUAAAAAVaqqVQAAAAAAAAAAAAAAAFWqqlUAAAAAAAAAAAAAAABVqqpVAAAAAAAAAAAAAAAAVaqqVQAAAAAAAAAAAAAAAFWqqlUAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAFVVVQAAAAAAAAAAAAAAAABVVVUAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAA=="),vc=X(96,96,"VVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqVVAAAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqVVAAAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqVVAAAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqVVAAAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqqqqqqqVVAAAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqqqqqqqVVVVVVVVVVAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqqqVVqqqqVVAAAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVqqVVAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVVVAAAAVVqqqqVVAAAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAVVAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAVVqqqqVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAA"),zc=X(144,144,"VVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqqqqqqqqqqVVVAAAAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqqqqqqqqqqVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqVVVAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAVVVAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVqqqqqqVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVAAAAAAAAAAAAAAAAAAAAA"),Mc=X(7,16,"oCgiACAAgAIACAAgAIACAAgAIACAAgAIAIgoCg=="),Dc=X(14,32,"qgAKqqAAqgCgoAAKCgAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAACgAAAKAAAAoAAAoKAACgoAqgAKqqAAqg=="),Cc=X(21,48,"qqAAAqqqqAAAqqqqAAAqqAAqAqAAAAqAqAAAAqAqAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAAqAAAAAqAqAAAAqAqAAAAqAqAAqqAAAqqqqAAAqqqqAAAqq"),Pc=X(28,64,"qqoAAACqqqqqAAAAqqqqqgAAAKqqqqoAAACqqgAAqgCqAAAAAKoAqgAAAACqAKoAAAAAqgCqAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAACqAAAAAAAAqgAAAAAAAKoAAAAAAKoAqgAAAACqAKoAAAAAqgCqAAAAAKoAqgAAqqoAAACqqqqqAAAAqqqqqgAAAKqqqqoAAACqqg=="),Bc=X(42,96,"qqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAAAqqAAAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAAAAAqqAAqqAAAAqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqqqqqqAAAAAAqqqq"),Oc=X(63,144,"qqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAAAAqqqAAAAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAAAAAAAqqqAAAqqqAAAAAAqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqqqqqqqqAAAAAAAAAqqqqqq"),Hc=X(11,16,"CqoAKqgAqqACqoAlVYJVlYlWViVZWpalalVViVVWCVVgCqoAKqgAqqACqoA="),Sc={"cursor/cursor-grab":wc,"cursor/cursor-grabbing":yc,"cursor/default-1x":bc,"cursor/default-2x":Vc,"cursor/default-3x":kc,"cursor/default-4x":Ic,"cursor/default-6x":vc,"cursor/default-9x":zc,"cursor/text-1x":Mc,"cursor/text-2x":Dc,"cursor/text-3x":Cc,"cursor/text-4x":Pc,"cursor/text-6x":Bc,"cursor/text-9x":Oc,"cursor/watch":Hc},Wc=X(9,11,"ACgAKAAIAKioqqqqqgqqgqqqqqqKqoCigA=="),Kc=X(12,15,"KqqolVVWlVVWlVZWlVZWlVZWlVVWlVVWlVWolVVYlVlYlVaolVVYlVVYKqqg"),Lc=X(51,34,"mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZqqqqmZmZmZmZmZmZmVlVlpmZmZmZmZmZmaVlZlaZmZmZmZmZmZmVlVlZmZmZmZmZmZmaVaqVaZmZmZmZmZmZmVVVVZmZmZmZmZmZmaaqqqaZmZmZmZmZmZmZVVWZmZmZmZmZmZmaZWpWaZmZmZmZmZmZmZZWWZmZmZmZmZmZmaZVZWaZmZmZmZmZmZmZVlWZmZmZmZmZmZmaZVVWaZmZmZmZmZmZmZVlWZmZmZmZmZmZmaZVVWaZmZmZmZmZmZmqqqqpmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZA="),Ec=X(5,5,"qqoKAgCAAA=="),Zc=X(5,5,"qoKgKAIAgA=="),Gc=X(5,5,"gCAKAqCqgA=="),Tc=X(5,5,"AIAgKCqqgA=="),Qc=X(4,2,"ZVY="),Yc={eaten_apple:Wc,user2:Kc,"microdesktop-disk":Lc,"corner-lt":Ec,"corner-rt":Zc,"corner-lb":Gc,"corner-rb":Tc,"scrollbar-bg":Qc},Nc=X(16,16,"qqqqqpVVVVaVVlVWlVmVVpVlZVaVlVlWllVWVplVVZaqlVqmlZVZVpWVWVaVlVlWlaqpVpVVVVaVVVVWqqqqqg=="),Fc=X(16,16,"qqqqqpVVVVaVVVVWlaqpVpWVWVaVlVlWlZVZVqqVWqaZVVWWllVWVpWVWVaVZWVWlVmVVpVWVVaVVVVWqqqqqg=="),Rc=X(16,16,"qqqqqpVWVVaVWlVWlWZVVpWWqlaWVVZWmVVWVqVVVlaZVVZWllVWVpWWqlaVZlVWlVpVVpVWVVaVVVVWqqqqqg=="),Uc=X(16,16,"qqqqqpVVlVaVVaVWlVWZVpWqllaVlVWWlZVVZpWVVVqVlVVmlZVVlpWqllaVVZlWlVWlVpVVlVaVVVVWqqqqqg=="),jc=X(11,11,"qqqqVVVpVVWlVVaVVVpVVWlVVaVVVpVVWlVVaqqqgA=="),Xc=X(11,11,"qqqqVZVpllmlmZaVVVqpWqlVVaWZlpllmlWVaqqqgA=="),Jc=X(16,16,"qqqqqpVVVVaVVVVWlqqlVpZVZVaWVWqmllVlZpZVZWaWVWVmlqqlZpVlVWaVZVVmlWVVZpVqqqaVVVVWqqqqqg=="),_c=X(11,11,"qqqqVWVpVZWlVlaVWVpVZWqqlaVVVpVVWlVVaqqqgA=="),$c={"chrome/up":Nc,"chrome/down":Fc,"chrome/left":Rc,"chrome/right":Uc,"chrome/close":jc,"chrome/closing":Xc,"chrome/resize":Jc,"chrome/zoom":_c};function Ad(A){A.registerAll(xc),A.registerAll(Sc),A.registerAll(Yc),A.registerAll($c)}class td{constructor(){this.regions=[],this.hoveredId=null,this.pressedId=null}clear(){this.regions.length=0}add(t){this.regions.push(t)}hitTest(t,e){for(let n=this.regions.length-1;n>=0;n--){const i=this.regions[n];if(t>=i.x&&t<i.x+i.w&&e>=i.y&&e<i.y+i.h)return i}return null}handleMouseMove(t,e){var r,o,s;const n=this.hitTest(t,e),i=(n==null?void 0:n.id)??null;if(i!==this.hoveredId){if(this.hoveredId!==null){const a=this.findById(this.hoveredId);(r=a==null?void 0:a.onMouseLeave)==null||r.call(a)}this.hoveredId=i,n&&((o=n.onMouseEnter)==null||o.call(n))}if(this.pressedId!==null){const a=this.findById(this.pressedId);return(s=a==null?void 0:a.onDrag)==null||s.call(a,t,e),!0}return n!==null}handleMouseDown(t,e){var i;const n=this.hitTest(t,e);return n?(this.pressedId=n.id,(i=n.onMouseDown)==null||i.call(n,t-n.x,e-n.y),!0):!1}handleMouseUp(t,e){const n=this.pressedId;this.pressedId=null;const i=this.hitTest(t,e);return i!=null&&i.onMouseUp&&i.onMouseUp(t-i.x,e-i.y),i&&n===i.id&&i.onClick?(i.onClick(t-i.x,e-i.y),!0):n!==null}handleDoubleClick(t,e){const n=this.hitTest(t,e);return n!=null&&n.onDoubleClick?(n.onDoubleClick(t-n.x,e-n.y),!0):!1}handleScroll(t,e,n){const i=this.hitTest(t,e);return i!=null&&i.onScroll?(i.onScroll(n),!0):!1}getHoveredId(){return this.hoveredId}clearHover(){var t;if(this.hoveredId!==null){const e=this.findById(this.hoveredId);(t=e==null?void 0:e.onMouseLeave)==null||t.call(e),this.hoveredId=null}}clearPressed(){this.pressedId=null}findById(t){for(let e=this.regions.length-1;e>=0;e--)if(this.regions[e].id===t)return this.regions[e]}}const Hi=new Map;function ed(){Hi.clear()}function nd(A,t){Hi.set(A,t)}function id(A){return Hi.get(A)??null}function rd(A){let t=null,e=null,n=null;return{openWindow:A.openWindow,closeWindow:A.closeWindow,showDialog:A.showDialog,fs:null,clipboard:{read(){const i=id("TEXT");return typeof i=="string"?i:""},write(i){ed(),nd("TEXT",i)}},camera:{async requestAccess(){try{return t=await navigator.mediaDevices.getUserMedia({video:!0,audio:!1}),A.videoElement&&(A.videoElement.srcObject=t,await A.videoElement.play()),!0}catch{return!1}},getFrame(){const i=A.videoElement;if(!i||!t)return null;const r=i.videoWidth,o=i.videoHeight;return!r||!o?null:((!e||e.width!==r||e.height!==o)&&(e=new OffscreenCanvas(r,o),n=e.getContext("2d")),n.drawImage(i,0,0),n.getImageData(0,0,r,o))},getVideoElement(){return!t||!A.videoElement?null:A.videoElement},release(){t&&(t.getTracks().forEach(i=>i.stop()),t=null),A.videoElement&&(A.videoElement.srcObject=null)}},audio:{play(i){new Audio(i).play().catch(()=>{})}},storage:{async read(i){try{return await(await(await(await navigator.storage.getDirectory()).getFileHandle(i)).getFile()).text()}catch{return null}},async write(i,r){try{const a=await(await(await navigator.storage.getDirectory()).getFileHandle(i,{create:!0})).createWritable();await a.write(r),await a.close()}catch(o){console.error("storage write error:",o)}},async list(){try{const i=await navigator.storage.getDirectory(),r=[];for await(const[o]of i.entries())r.push(o);return r}catch{return[]}}}}}function od(A,t){return A.x===t.x&&A.y===t.y&&A.width===t.width&&A.height===t.height}function hr(A,t){const{baseAddr:e,rowBytes:n}=A.portBits,i=e.length/n|0,r=new qi(n,i);r.pixels=e,r.flush(t)}function sd(A,t,e,n,i=4,r=30,o,s){return new Promise(a=>{const l=[];for(let g=0;g<=i;g++){const f=g/i,m={x:Math.round(e.x+(n.x-e.x)*f),y:Math.round(e.y+(n.y-e.y)*f),width:Math.round(e.width+(n.width-e.width)*f),height:Math.round(e.height+(n.height-e.height)*f)};m.width<2||m.height<2||l.length>0&&od(m,l[l.length-1])||l.push(m)}if(l.length===0){a();return}let d=0,c=null;function p(g){Ko(A,g.x,g.y,g.width,g.height,"darkCheckers")}function u(){if(c&&(p(c),c=null),d>=l.length){hr(A,t),s==null||s(),a();return}const g=l[d++];p(g),c=g,hr(A,t),setTimeout(u,r)}u()})}const be="menu",Fo=1,ld=15,Ro=1,ad=15,Uo=0,cd=15,sA=20,Ie=16,$e=4,En=8,An=24;function jo(A){return JA(A,be,Fo)}function xr(A){return JA(A,be,Ro)}function Xo(A){return JA(A,be,Uo)}function wr(A,t,e,n,i){Le(A,t,e,n,{font:be,spacing:Fo,lineHeight:ld,color:i})}function dd(A,t,e,n,i){Le(A,t,e,n,{font:be,spacing:Ro,lineHeight:ad,color:i})}function ud(A,t,e,n,i){Le(A,t,e,n,{font:be,spacing:Uo,lineHeight:cd,color:i})}function pd(A){return{menus:A,openMenuIndex:null,highlightedItem:null}}function fd(A){return A===""}function gd(A){let t=0;for(const e of A.items)if(!("type"in e&&e.type==="separator"))if("type"in e&&e.type==="radiogroup")for(const n of e.items)t=Math.max(t,xr(n.label)+24);else{const n=e;let i=xr(n.label)+12;n.shortcut&&(i+=Xo(n.shortcut)+20),t=Math.max(t,i)}return Math.max(t+$e*2,100)}function md(A){const t=[];for(const e of A.items)if("type"in e&&e.type==="separator")t.push({label:"",isSeparator:!0});else if("type"in e&&e.type==="radiogroup"){const n=e;for(const i of n.items)t.push({label:i.label,disabled:i.disabled,isRadio:!0,radioChecked:n.value===i.value,onClick:()=>n.onValueChange(i.value)})}else{const n=e;t.push({label:n.label,disabled:n.disabled,shortcut:n.shortcut,onClick:n.onClick})}return t}function qd(A,t,e,n,i,r){mA(A,0,0,n,sA,Y),zA(A,0,sA-1,n,z),e&&PA(A,e,10,4),i.add({id:"menubar-bg",x:0,y:0,w:n,h:sA,onMouseDown:()=>{t.openMenuIndex!==null&&(t.openMenuIndex=null,t.highlightedItem=null,r())},onMouseEnter:()=>{t.openMenuIndex!==null&&t.highlightedItem!==null&&(t.highlightedItem=null,r())}});const o=t.menus.length>0&&fd(t.menus[0].label);let s=An+8;for(let a=0;a<t.menus.length;a++){const l=a,d=t.menus[a],c=t.openMenuIndex===a;if(a===0&&o){c&&(mA(A,4,0,An,sA-1,z),e&&Eo(A,e,10,4)),i.add({id:`menubar-label-${a}`,x:4,y:0,w:An,h:sA,onMouseDown:()=>{t.openMenuIndex===l?(t.openMenuIndex=null,t.highlightedItem=null):(t.openMenuIndex=l,t.highlightedItem=null),r()},onMouseEnter:()=>{t.openMenuIndex!==null&&t.openMenuIndex!==l&&(t.openMenuIndex=l,t.highlightedItem=null,r())}});continue}const p=jo(d.label),u=s-5,g=p+14;c?(mA(A,u,0,g,sA-1,z),wr(A,d.label,s,2,Y)):wr(A,d.label,s,2,z),i.add({id:`menubar-label-${a}`,x:u,y:0,w:g,h:sA,onMouseDown:()=>{t.openMenuIndex===l?(t.openMenuIndex=null,t.highlightedItem=null):(t.openMenuIndex=l,t.highlightedItem=null),r()},onMouseEnter:()=>{t.openMenuIndex!==null&&t.openMenuIndex!==l&&(t.openMenuIndex=l,t.highlightedItem=null,r())}}),s+=p+14}if(t.openMenuIndex!==null){const a=t.menus[t.openMenuIndex],l=hd(t,t.openMenuIndex,o),d=gd(a),c=md(a),p=c.reduce((g,f)=>g+(f.isSeparator?En:Ie),0)+2;mA(A,l+1,sA+p,d,1,z),mA(A,l+d,sA+1,1,p,z),mA(A,l,sA,d,p,Y),qt(A,l,sA,d,p,z),zA(A,l,sA,d,Y),i.add({id:"menubar-dropdown-bg",x:l,y:sA,w:d,h:p});let u=sA+1;for(let g=0;g<c.length;g++){const f=c[g];if(f.isSeparator){Wo(A,l+1,u+En/2,d-2,z),u+=En;continue}const m=g,h=t.highlightedItem===g&&!f.disabled;h&&mA(A,l+1,u,d-2,Ie,z);const D=h?Y:z,M=l+$e+(f.isRadio?16:0);if(dd(A,f.label,M,u,D),f.shortcut){const k=Xo(f.shortcut),C=l+d-$e-k-2;ud(A,f.shortcut,C,u,D)}if(f.isRadio&&f.radioChecked){const k=l+$e+4,C=u+6;CA(A,k,C,D),zA(A,k-1,C+1,3,D),CA(A,k,C+2,D)}f.disabled&&!h&&da(A,l+1,u,d-2,Ie,"gray50"),i.add({id:`menubar-item-${g}`,x:l,y:u,w:d,h:Ie,onMouseEnter:()=>{t.highlightedItem!==m&&(t.highlightedItem=m,r())},onMouseUp:()=>{!f.disabled&&f.onClick&&(t.openMenuIndex=null,t.highlightedItem=null,f.onClick(),r())}}),u+=Ie}}}function hd(A,t,e){let n=An+8;for(let i=0;i<t;i++)i===0&&e||(n+=jo(A.menus[i].label)+14);return t===0&&e?6:n}const VA="__root__",xd={text:"icon/file",image:"icon/camera",app:"icon/appstore-smr-32x32","app-shortcut":"icon/computer",binary:"icon/file"};function ei(A){return A.icon?A.icon:A.kind==="directory"?"icon/folder":xd[A.fileType]??"icon/file"}function yr(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}const br={text:"TEXT",image:"PICT",app:"APPL","app-shortcut":"ALIK",binary:"BINA"},Vr={TEXT:"text",PICT:"image",APPL:"app",ALIK:"app-shortcut",BINA:"binary"};class wd{constructor(t,e){this.meta={version:1,nodes:{}},this.listeners=[],this.metaDirty=!1,this.flushTimer=null,this.version=0,this.backend=t,this.sprites=e}async init(){await this.backend.init();const t=await this.backend.readMeta();if(t)try{this.meta=JSON.parse(t)}catch{this.meta={version:1,nodes:{}}}this.meta.nodes[VA]||(this.meta.nodes[VA]={id:VA,name:"/",kind:"directory",parentId:null,createdAt:Date.now(),modifiedAt:Date.now()},this.schedulePersist())}getNode(t){return this.meta.nodes[t]}readDir(t){const e=[];for(const n of Object.values(this.meta.nodes))n.parentId===t&&e.push(n);return e.sort((n,i)=>n.kind!==i.kind?n.kind==="directory"?-1:1:n.name.localeCompare(i.name)),e}async readFile(t){const e=this.meta.nodes[t];return!e||e.kind!=="file"?null:this.backend.readFile(t)}resolvePath(t){const e=t.split("/").filter(Boolean);let n=VA;for(const i of e){const o=this.readDir(n).find(s=>s.name===i);if(!o)return null;n=o.id}return this.meta.nodes[n]??null}findByName(t,e){for(const n of Object.values(this.meta.nodes))if(n.parentId===t&&n.name===e)return n}async writeFile(t,e,n,i,r){const o=this.findByName(t,e),s=(o==null?void 0:o.id)??yr(),a=Date.now(),l={id:s,name:e,kind:"file",parentId:t,createdAt:(o==null?void 0:o.createdAt)??a,modifiedAt:a,fileType:i,size:n.length,icon:r==null?void 0:r.icon,mimeType:r==null?void 0:r.mimeType};return this.meta.nodes[s]=l,await this.backend.writeFile(s,n),this.schedulePersist(),this.notify(),l}async writeImage(t,e,n,i){const r=JSON.stringify(n),o=await this.writeFile(t,e,r,"image",i),s=X(n.width,n.height,n.data);return this.sprites.register(`fs:${o.id}`,s),o}async loadSprite(t){const e=`fs:${t}`,n=this.sprites.get(e);if(n)return n;const i=await this.readFile(t);if(!i)return null;try{const r=JSON.parse(i),o=X(r.width,r.height,r.data);return this.sprites.register(e,o),o}catch{return null}}mkdir(t,e){const n=this.findByName(t,e);if(n&&n.kind==="directory")return n;const i=yr(),r=Date.now(),o={id:i,name:e,kind:"directory",parentId:t,createdAt:r,modifiedAt:r};return this.meta.nodes[i]=o,this.schedulePersist(),this.notify(),o}rename(t,e){const n=this.meta.nodes[t];!n||t===VA||(n.name=e,n.modifiedAt=Date.now(),this.schedulePersist(),this.notify())}move(t,e){const n=this.meta.nodes[t];!n||t===VA||(n.parentId=e,n.position=void 0,n.modifiedAt=Date.now(),this.schedulePersist(),this.notify())}setPosition(t,e){const n=this.meta.nodes[t];!n||t===VA||(n.position=e,this.schedulePersist(),this.notify())}clearPositions(t){for(const e of Object.values(this.meta.nodes))e.parentId===t&&e.position&&(e.position=void 0);this.schedulePersist(),this.notify()}async remove(t){if(t===VA)return;const e=this.meta.nodes[t];if(e){if(e.kind==="directory"){const n=this.readDir(t);for(const i of n)await this.remove(i.id)}else await this.backend.deleteFile(t);delete this.meta.nodes[t],this.schedulePersist(),this.notify()}}onChange(t){return this.listeners.push(t),()=>{this.listeners=this.listeners.filter(e=>e!==t)}}notify(){this.version++;for(const t of this.listeners)try{t()}catch{}}schedulePersist(){this.metaDirty=!0,!this.flushTimer&&(this.flushTimer=setTimeout(()=>{this.flushTimer=null,this.metaDirty&&(this.metaDirty=!1,this.backend.writeMeta(JSON.stringify(this.meta)).catch(t=>console.error("FileManager persist error:",t)))},500))}async flush(){this.flushTimer&&(clearTimeout(this.flushTimer),this.flushTimer=null),this.metaDirty&&(this.metaDirty=!1,await this.backend.writeMeta(JSON.stringify(this.meta)))}FSMakeFSSpec(t){return{path:t}}async FSpCreate(t,e,n){const{parentPath:i,name:r}=this._splitPath(t.path),o=this._resolveDir(i);if(!o)throw new Error(`Directory not found: ${i}`);const s=Vr[n]??"binary";await this.writeFile(o.id,r,"",s)}async FSpDelete(t){const e=this.resolvePath(t.path);if(!e)throw new Error(`Not found: ${t.path}`);await this.remove(e.id)}async FSRead(t){const e=this.resolvePath(t.path);return!e||e.kind!=="file"?null:this.readFile(e.id)}async FSWrite(t,e){const n=this.resolvePath(t.path);if(n&&n.kind==="file"){const i=n,{parentPath:r,name:o}=this._splitPath(t.path),s=this._resolveDir(r);s&&await this.writeFile(s.id,o,e,i.fileType)}else{const{parentPath:i,name:r}=this._splitPath(t.path),o=this._resolveDir(i);if(!o)throw new Error(`Directory not found: ${i}`);await this.writeFile(o.id,r,e,"text")}}async FSpGetFInfo(t){const e=this.resolvePath(t.path);if(!e||e.kind!=="file")throw new Error(`File not found: ${t.path}`);return{fdType:br[e.fileType]??"BINA",fdCreator:"MOCK"}}async FSpSetFInfo(t,e){const n=this.resolvePath(t.path);if(!n||n.kind!=="file")throw new Error(`File not found: ${t.path}`);const i=n,r=Vr[e.fdType];r&&(i.fileType=r)}async PBGetCatInfo(t){const e=this.resolvePath(t.path);if(!e)throw new Error(`Not found: ${t.path}`);if(e.kind==="file"){const n=e;return{name:e.name,kind:"file",size:n.size,createdAt:e.createdAt,modifiedAt:e.modifiedAt,fdType:br[n.fileType]??"BINA",fdCreator:"MOCK"}}return{name:e.name,kind:"directory",size:0,createdAt:e.createdAt,modifiedAt:e.modifiedAt,fdType:"",fdCreator:""}}DirCreate(t){const{parentPath:e,name:n}=this._splitPath(t.path),i=this._resolveDir(e);if(!i)throw new Error(`Directory not found: ${e}`);this.mkdir(i.id,n)}_splitPath(t){const e=t.split("/").filter(Boolean),n=e.pop()??"";return{parentPath:"/"+e.join("/"),name:n}}_resolveDir(t){return t==="/"||t===""?this.getNode(VA)??null:this.resolvePath(t)}}const yd="mockintosh-fs",bd="files",Zn="meta.json";class Vd{constructor(){this.rootHandle=null,this.filesHandle=null}async init(){const t=await navigator.storage.getDirectory();this.rootHandle=await t.getDirectoryHandle(yd,{create:!0}),this.filesHandle=await this.rootHandle.getDirectoryHandle(bd,{create:!0})}async readMeta(){try{return await(await(await this.rootHandle.getFileHandle(Zn)).getFile()).text()}catch{return null}}async writeMeta(t){const n=await(await this.rootHandle.getFileHandle(Zn,{create:!0})).createWritable();await n.write(t),await n.close()}async readFile(t){try{return await(await(await this.filesHandle.getFileHandle(t)).getFile()).text()}catch{return null}}async writeFile(t,e){const i=await(await this.filesHandle.getFileHandle(t,{create:!0})).createWritable();await i.write(e),await i.close()}async deleteFile(t){try{await this.filesHandle.removeEntry(t)}catch{}}async hasMetaFile(){try{return await this.rootHandle.getFileHandle(Zn),!0}catch{return!1}}}class kd{constructor(t,e){this.loaded=new Set,this.spriteRegistry=t,this.appRegistry=e}async load(t){if(this.loaded.has(t.id)){const i=this.appRegistry.get(t.id);if(i)return i}const e=await import(t.entry);e.sprites&&typeof e.sprites=="object"&&this.spriteRegistry.registerAll(e.sprites);const n=e.default;if(!n||typeof n!="object")throw new Error(`Invalid app bundle for "${t.id}": no default export`);if(!n.id||typeof n.id!="string")throw new Error(`Invalid app bundle for "${t.id}": missing or invalid "id"`);if(typeof n.render!="function")throw new Error(`Invalid app bundle for "${t.id}": missing "render" function`);if(!n.title||!n.icon||!n.defaultSize)throw new Error(`Invalid app bundle for "${t.id}": missing required fields (title, icon, defaultSize)`);return this.appRegistry.register(n),this.loaded.add(t.id),n}async loadAll(t){const e=await Promise.allSettled(t.map(n=>this.load(n)));for(let n=0;n<e.length;n++){const i=e[n];i.status==="rejected"&&console.error(`[AppLoader] Failed to load "${t[n].id}":`,i.reason)}}isLoaded(t){return this.loaded.has(t)}}const Jo="mockintosh-system-preferences.json",ni={colorMode:$s()};async function Id(){try{const n=await(await(await(await navigator.storage.getDirectory()).getFileHandle(Jo)).getFile()).text(),i=JSON.parse(n);return{colorMode:i.colorMode==="colors"||i.colorMode==="monochrome"?i.colorMode:ni.colorMode}}catch{return{...ni}}}async function vd(A){try{const n=await(await(await navigator.storage.getDirectory()).getFileHandle(Jo,{create:!0})).createWritable();await n.write(JSON.stringify(A)),await n.close()}catch(t){console.error("system preferences write error:",t)}}let tn=null;function zd(A){tn=A}const Md={id:"splashscreen",title:"Splashscreen",icon:"",defaultSize:{width:512,height:342},render(A,t){t.clear(Y);const e=tn==null?void 0:tn.get("icon/happy");if(e){const n=Math.floor((t.width-e.width)/2),i=Math.floor((t.height-e.height)/2);t.blit(e,n,i)}}},xn=32,kr=32,Dd=32,_t=8,OA=80,me=56,WA=16,QA=84,Pt=64,Ir=4,gA="__desktop__";function Ve(A,t){return A.readDir(t).map(n=>({title:n.name,img:ei(n),nodeId:n.id,isDirectory:n.kind==="directory",position:n.position}))}function Fe(A){const t=[],e=A.readDir(VA);for(const i of e)t.push({title:i.name,img:ei(i),nodeId:i.id,isDirectory:!0,isVolume:!0,position:i.position});for(const i of e){if(i.kind!=="directory")continue;const r=A.findByName(i.id,"Desktop Folder");if(!r)continue;const o=A.readDir(r.id);for(const s of o)t.push({title:s.name,img:ei(s),nodeId:s.id,isDirectory:s.kind==="directory",isVolume:!1,position:s.position})}const n=qe(A);return n&&t.push({title:"Trash",img:"icon/trash",nodeId:n,isDirectory:!0,isVolume:!1}),t}function _o(A){const t=A.findByName(VA,"Mockintosh HD");if(!t)return;const e=A.findByName(t.id,"Desktop Folder");return e==null?void 0:e.id}function qe(A){const t=A.findByName(VA,"Mockintosh HD");if(!t)return;const e=A.findByName(t.id,"Trash");return e==null?void 0:e.id}function Cd(A){const t=A.screenHeight-A.menubarHeight,e=Math.max(1,Math.floor((t-_t)/Pt)),n=A.screenWidth-QA,i=(e-1)*Pt+_t;return{x:n,y:i}}function $o(A,t,e,n){const i=n-e,r=Math.floor((i-_t)/Pt),o=Math.floor(A/Math.max(1,r)),s=A%Math.max(1,r);return{x:t-(o+1)*QA,y:s*Pt+_t}}function he(A,t,e){return{x:A+Math.floor((e-kr)/2),y:t,w:kr,h:Dd}}function As(A,t){const e=A%t,n=Math.floor(A/t);return{x:WA+e*OA,y:WA+n*me}}function Ge(A,t,e){if(qe(e.fs)===A.nodeId){const n=e.fs.getNode(A.nodeId);return(n==null?void 0:n.position)??Cd(e)}return A.position?A.position:$o(t,e.screenWidth,e.menubarHeight,e.screenHeight)}function xe(A,t,e){return A.position?A.position:As(t,e)}const ii=400,vr=128;function Pd(A,t,e){const n=_t,i=e-QA,r=Math.round((i-A)/QA),o=Math.round((t-n)/Pt);return{col:Math.max(0,r),row:Math.max(0,o)}}function Bd(A,t){const e=Math.round((A-WA)/OA),n=Math.round((t-WA)/me);return{col:Math.max(0,e),row:Math.max(0,n)}}function zr(A){const t=Fe(A.fs),e=new Set;for(let a=0;a<t.length;a++){const l=Ge(t[a],a,A),d=Pd(l.x,l.y,A.screenWidth);e.add(`${d.col},${d.row}`)}const n=A.screenHeight-A.menubarHeight,i=Math.max(1,Math.floor((n-_t)/Pt)),r=A.screenWidth-QA,o=_t,s=Math.max(1,Math.floor(r/QA));for(let a=0;a<i;a++)for(let l=0;l<s;l++)if(!e.has(`${l},${a}`))return{x:r-l*QA,y:o+a*Pt};return{x:r-(s-1)*QA,y:o+(i-1)*Pt}}function Mr(A,t,e){const n=Ve(A.fs,t),i=Math.max(1,Math.floor((e-WA)/OA)),r=new Set;for(let o=0;o<n.length;o++){const s=xe(n[o],o,i),a=Bd(s.x,s.y);r.add(`${a.col},${a.row}`)}for(let o=0;o<vr;o++)for(let s=0;s<i;s++)if(!r.has(`${s},${o}`))return{x:WA+s*OA,y:WA+o*me};return{x:WA+(i-1)*OA,y:WA+(vr-1)*me}}function Od(A,t,e){if(e){if(t){const n=Fe(A.fs),i=qe(A.fs);for(let r=0;r<n.length;r++){if(n[r].nodeId===i)continue;const o=$o(r,A.screenWidth,A.menubarHeight,A.screenHeight);A.fs.setPosition(n[r].nodeId,o)}}else{const n=Ve(A.fs,e),i=ii-2-bA,r=Math.max(1,Math.floor((i-WA)/OA));for(let o=0;o<n.length;o++){const s=As(o,r);A.fs.setPosition(n[o].nodeId,s)}}A.scheduleRender()}}const Hd={id:"finder",title:"Finder",icon:"icon/folder",renderWindow(A,t,e,n,i){const r=i._finderServices;r&&(n===gA?Ed(A,t,e,r):Gd(A,t,e,n,i,r))},onWindowEvent(A,t,e,n,i,r){const o=i._finderServices;o&&(n===gA?Zd(A,t,e,o):Td(A,t,e,n,i,o,r))},getContentHeight(A,t,e,n,i){if(e===gA)return 0;const r=n._finderServices;if(!r)return 0;const o=n.directoryId,s=t.useMemo(()=>o?Ve(r.fs,o):[],[o,r.fs.version]),a=i.width-2-bA,l=Math.max(1,Math.floor((a-WA)/OA));let d=0;for(let c=0;c<s.length;c++){const u=xe(s[c],c,l).y+me;u>d&&(d=u)}return d+WA},getMenubar(A,t,e,n){const i=n._finderServices;if(!i)return[];const r=e===gA,o=r?_o(i.fs):n.directoryId;return[{label:"File",items:[{label:"New Folder",shortcut:"⌘N",disabled:!o,onClick:async()=>{if(!o)return;const a=await i.os.showDialog({message:"Name for new folder:",buttons:["Cancel","OK"],showInput:!0,inputDefault:"untitled folder"});if(a&&a!=="Cancel"){const l=i.fs.mkdir(o,a),d=r?zr(i):Mr(i,o,ii-2-bA);i.fs.setPosition(l.id,d)}}},{label:"New Text File",disabled:!o,onClick:async()=>{if(!o)return;const a=await i.os.showDialog({message:"Name for new file:",buttons:["Cancel","OK"],showInput:!0,inputDefault:"untitled.txt"});if(a&&a!=="Cancel"){const l=await i.fs.writeFile(o,a,"","text"),d=r?zr(i):Mr(i,o,ii-2-bA);i.fs.setPosition(l.id,d)}}},{type:"separator"},{label:"Open",shortcut:"⌘O",disabled:!0},{label:"Close",disabled:!0}]},{label:"Edit",items:[{label:"Undo",shortcut:"⌘Z",disabled:!0},{label:"Cut",shortcut:"⌘X",disabled:!0},{label:"Copy",shortcut:"⌘C",disabled:!0},{label:"Paste",shortcut:"⌘V",disabled:!0}]},{label:"View",items:[{label:"By Icon",disabled:!0},{label:"By Name",disabled:!0},{label:"By Date",disabled:!0}]},{label:"Special",items:[{label:r?"Clean Up Desktop":"Clean Up Window",disabled:!o,onClick:()=>{Od(i,r,o)}},{label:"Empty Trash",disabled:(()=>{const a=qe(i.fs);return!a||i.fs.readDir(a).length===0})(),onClick:async()=>{const a=qe(i.fs);if(!a)return;const l=i.fs.readDir(a);for(const d of l)await i.fs.remove(d.id);i.scheduleRender()}},{type:"separator"},{label:"Format Drive…",onClick:()=>void i.formatDrive()},{type:"separator"},{label:"Restart",disabled:!0},{label:"Shut Down",disabled:!0}]}]},getInfoBar(A,t,e,n){return null},getContentTopInset(A,t,e,n,i){return e===gA?0:ue}},Sd={drag:null,dropTarget:null,pendingDrag:null};function Ot(){return Sd}function Wd(A){const t=Ot();return t.drag!==null||t.pendingDrag!==null}function Si(A,t,e,n){const i=Ot();if(i.pendingDrag&&!i.drag){const r=Math.abs(t-i.pendingDrag.startScreenX),o=Math.abs(e-i.pendingDrag.startScreenY);(r>=Ir||o>=Ir)&&(i.drag={fsNodeId:i.pendingDrag.fsNodeId,sourceDirectoryId:i.pendingDrag.sourceDirectoryId,img:i.pendingDrag.img,title:i.pendingDrag.title,screenX:t,screenY:e,offsetX:i.pendingDrag.offsetX,offsetY:i.pendingDrag.offsetY},i.pendingDrag=null)}i.drag&&(i.drag.screenX=t,i.drag.screenY=e,i.dropTarget=Ld(t,e,n),n.scheduleRender())}function Wi(A,t,e,n){const i=Ot();if(i.pendingDrag=null,!i.drag)return;const r=i.drag,o=i.dropTarget;if(i.drag=null,i.dropTarget=null,o&&qe(n.fs)!==r.fsNodeId){n.fs.move(r.fsNodeId,o.nodeId),n.scheduleRender();return}const s=r.screenX-r.offsetX,a=r.screenY-r.offsetY,l=n.getOpenFolderWindows();for(let c=l.length-1;c>=0;c--){const p=l[c];if(t>=p.contentX&&t<p.contentX+p.contentW&&e>=p.contentY&&e<p.contentY+p.contentH){const u=p.contentTopInset??0,g=s-p.contentX+p.scrollX,f=a-p.contentY-u+p.scrollY;r.sourceDirectoryId!==p.directoryId&&n.fs.move(r.fsNodeId,p.directoryId),n.fs.setPosition(r.fsNodeId,{x:g,y:f}),n.scheduleRender();return}}const d=a-n.menubarHeight;if(r.sourceDirectoryId===gA)n.fs.setPosition(r.fsNodeId,{x:s,y:d});else{const c=_o(n.fs);c&&(n.fs.move(r.fsNodeId,c),n.fs.setPosition(r.fsNodeId,{x:s,y:d}))}n.scheduleRender()}function Kd(A,t,e){const i=Ot().drag;if(!i)return;const r=e.sprites.get(i.img);if(!r)return;const o=i.screenX-i.offsetX,s=i.screenY-i.offsetY,a=i.sourceDirectoryId===gA?QA:OA,l=o+Math.floor((a-xn)/2),c=JA(i.title,"body")+4,p=12,u=o+Math.floor((a-c)/2),g=s+xn,f=Math.min(l,u),m=Math.min(s,g),h=Math.max(l+r.width,u+c),D=Math.max(s+r.height,g+p),M=h-f,k=D-m;if(M<=0||k<=0)return;const C=new Uint8Array(M*k);if(r.mask){const w=l-f,v=s-m;for(let y=0;y<r.height;y++){const I=y*r.width,V=(v+y)*M+w;for(let x=0;x<r.width;x++)r.mask[I+x]&&(C[V+x]=1)}}if(c>0&&p>0){const w=u-f,v=g-m;for(let y=0;y<p;y++){const I=(v+y)*M+w;C.fill(1,I,I+c)}}pa(t,C,M,k,f,m,z)}function Ld(A,t,e){const i=Ot().drag;if(!i)return null;const r=e.getOpenFolderWindows();for(let a=r.length-1;a>=0;a--){const l=r[a];if(A>=l.contentX&&A<l.contentX+l.contentW&&t>=l.contentY&&t<l.contentY+l.contentH){const d=l.contentTopInset??0,c=A-l.contentX+l.scrollX,p=t-l.contentY-d+l.scrollY,u=Ve(e.fs,l.directoryId),g=Math.max(1,Math.floor((l.contentW-WA)/OA));for(let f=0;f<u.length;f++){const m=u[f];if(m.nodeId===i.fsNodeId||!m.isDirectory)continue;const h=xe(m,f,g),D=he(h.x,h.y,OA);if(c>=D.x&&c<D.x+D.w&&p>=D.y&&p<D.y+D.h)return{nodeId:m.nodeId}}break}}const o=Fe(e.fs),s=t-e.menubarHeight;for(let a=0;a<o.length;a++){const l=o[a];if(l.nodeId===i.fsNodeId||!l.isDirectory&&!l.isVolume)continue;const d=Ge(l,a,e),c=he(d.x,d.y,QA);if(A>=c.x&&A<c.x+c.w&&s>=c.y&&s<c.y+c.h)return{nodeId:l.nodeId}}return null}function Ed(A,t,e,n){e.fillPattern(0,0,e.width,e.height,"checkers");const i=t.useMemo(()=>Fe(n.fs),[n.fs.version]),[r,o]=t.useState(null),s=t.useMemo(()=>new Set,[]),l=Ot().dropTarget;for(let d=0;d<i.length;d++){const c=i[d],p=Ge(c,d,n),u=r===c.nodeId,g=s.has(c.title),f=(l==null?void 0:l.nodeId)===c.nodeId;ts(e,n.sprites,c,p.x,p.y,QA,u,f,g)}}function Zd(A,t,e,n,i){const r=t.useMemo(()=>Fe(n.fs),[n.fs.version]),[o,s]=t.useState(null),a=Ot();if(e.type==="mouseDown"){const l=e.x,d=e.y,c=d-n.menubarHeight;let p=null,u=null;for(let g=0;g<r.length;g++){const f=Ge(r[g],g,n),m=he(f.x,f.y,QA);if(l>=m.x&&l<m.x+m.w&&c>=m.y&&c<m.y+m.h){p=r[g],u=f;break}}p&&u?(s(p.nodeId),a.pendingDrag={fsNodeId:p.nodeId,sourceDirectoryId:gA,img:p.img,title:p.title,startScreenX:l,startScreenY:d,offsetX:l-u.x,offsetY:c-u.y}):(s(null),a.pendingDrag=null)}if(e.type==="mouseMove"&&Si(A,e.x,e.y,n),e.type==="mouseUp"&&Wi(A,e.x,e.y,n),e.type==="doubleClick"){const l=e.x,d=e.y-n.menubarHeight;if(a.drag)return;for(let c=0;c<r.length;c++){const p=Ge(r[c],c,n),u=he(p.x,p.y,QA);if(l>=u.x&&l<u.x+u.w&&d>=u.y&&d<u.y+u.h){n.openFSNode(r[c].nodeId,{x:p.x,y:p.y+n.menubarHeight,width:QA,height:Pt});return}}}}function Gd(A,t,e,n,i,r){const o=i.directoryId,s=t.useMemo(()=>o?Ve(r.fs,o):[],[o,r.fs.version]),[a,l]=t.useState(null),c=Ot().dropTarget;e.clear(Y);const p=[`${s.length} item${s.length!==1?"s":""}`,"2,427K in disk","7,648K available"];if(e.drawHLine(0,ue-1,e.width,z),p.length>0){const g=Math.floor((e.width-2)/p.length);for(let f=0;f<p.length;f++){const m=JA(p[f],"body"),h=1+f*g+Math.floor((g-m)/2);e.drawText(p[f],h,4,{font:"body",color:z}),f<p.length-1&&e.drawVLine(1+(f+1)*g,0,ue-1,z)}}const u=Math.max(1,Math.floor((e.width-WA)/OA));e.drawScrollableContent(g=>{for(let f=0;f<s.length;f++){const m=s[f],h=xe(m,f,u),D=a===m.nodeId,M=(c==null?void 0:c.nodeId)===m.nodeId;ts(g,r.sprites,m,h.x,h.y,OA,D,M,!1)}})}function Td(A,t,e,n,i,r,o){const s=i.directoryId,a=t.useMemo(()=>s?Ve(r.fs,s):[],[s,r.fs.version]),[l,d]=t.useState(null),c=Ot(),p=o.width-2-bA,u=Math.max(1,Math.floor((p-WA)/OA)),g=o.contentOriginX??0,f=o.contentOriginY??0,m=o.contentTopInset??0,h=o.scrollY??0,D=k=>m>0?f+m+k-h:f+k,M=e.contentRegion!=="fixed"&&(e.contentRegion==="scrollable"||m===0);if(e.type==="mouseDown")if(!M)d(null),c.pendingDrag=null;else{const k=e.x,C=e.y;let w=null,v=null;for(let y=0;y<a.length;y++){const I=xe(a[y],y,u),V=he(I.x,I.y,OA);if(k>=V.x&&k<V.x+V.w&&C>=V.y&&C<V.y+V.h){w=a[y],v=I;break}}if(w&&v){d(w.nodeId);const y=k+g,I=D(C);c.pendingDrag={fsNodeId:w.nodeId,sourceDirectoryId:s??"",img:w.img,title:w.title,startScreenX:y,startScreenY:I,offsetX:k-v.x,offsetY:C-v.y}}else d(null),c.pendingDrag=null}if(e.type==="mouseMove"&&M){const k=e.x+g,C=D(e.y);Si(A,k,C,r)}if(e.type==="mouseUp"&&M){const k=e.x+g,C=D(e.y);Wi(A,k,C,r)}if(e.type==="doubleClick"&&M){const k=e.x,C=e.y;if(c.drag)return;for(let w=0;w<a.length;w++){const v=xe(a[w],w,u),y=he(v.x,v.y,OA);if(k>=y.x&&k<y.x+y.w&&C>=y.y&&C<y.y+y.h){r.openFSNode(a[w].nodeId,{x:g+v.x,y:D(v.y),width:OA,height:me});return}}}}function ts(A,t,e,n,i,r,o,s,a){const l=t.get(e.img);if(l){const u=n+Math.floor((r-xn)/2);s?A.blitInverted(l,u,i):a?A.blitShadowOutline(l,u,i):o?A.blitInverted(l,u,i):A.blit(l,u,i)}const d=JA(e.title,"body"),c=n+Math.floor((r-d)/2),p=i+xn;o||s?A.drawText(e.title,c,p,{font:"body",color:Y,bg:z,width:d+4,align:"center",lineHeight:12}):A.drawText(e.title,c,p,{font:"body",color:z,bg:Y,width:d+4,align:"center",lineHeight:12})}const Qd={id:"file",title:"File",icon:"icon/file",defaultSize:{width:350,height:200},scrollable:!0,render(A,t,e){const n=e._fs,i=e.fileId,[r,o]=A.useState(e.content??"");A.useEffect(()=>{n&&i&&!e.content&&n.readFile(i).then(s=>{s!==null&&o(s)})},[i]),t.clear(Y),t.drawTextBlock({text:r,x:8,y:8,maxWidth:t.width-16,font:"body"})},getContentHeight(A,t,e){const[n]=A.useState(t.content??"");return A.useMemo(()=>Zo(n,e.width-16,"body"),[n,e.width])+16}},Yd="0.4.0",Nd={version:Yd},Fd=Nd.version,Rd=[{username:"gustavlrsn",commits:74}],Ud={id:"about",title:"About This Mockintosh",icon:"icon/computer",defaultSize:{width:343,height:160},scrollable:!1,render(A,t,e){const n=e._sprites;t.clear(Y);const i=n==null?void 0:n.get("icon/computer");i&&t.blit(i,16,8),t.drawText("Mockintosh Classic",56,8,{font:"body",color:z}),t.drawText(`System Version ${Fd}`,180,8,{font:"body",color:z}),t.drawText("Contributors",16,36,{font:"body",color:z}),t.drawHLine(0,50,t.width,z);let r=56;for(const o of Rd){const s=n==null?void 0:n.get("user2");s&&t.blit(s,16,r),t.drawText(`@${o.username}`,36,r,{font:"body",color:z});const a=`${o.commits} commits`,l=eA(a,"body");t.drawText(a,t.width-l-16,r,{font:"body",color:z}),r+=16}}},oe=64,ce=90,Be=20;function Dr(A,t,e,n,i){A.drawRect(t,e,ce,Be,z),i&&A.fillRect(t+1,e+1,ce-2,Be-2,z),A.drawText(n,t+8,e+5,{font:"body",color:i?Y:z})}const jd={id:"control_panel",title:"Control Panel",icon:"icon/computer",defaultSize:{width:320,height:200},scrollable:!1,render(A,t,e){var k;const n=e._sprites,[i]=A.useState("General"),r=((k=e._systemPreferences)==null?void 0:k.colorMode)??"monochrome";t.clear(Y),t.drawVLine(oe,0,t.height,z),t.drawVLine(oe+1,0,t.height,z);const o=n==null?void 0:n.get("icon/computer");if(o){const C=Math.floor((oe-32)/2);i==="General"?t.blitInverted(o,C,8):t.blit(o,C,8)}const s=i==="General"?Y:z,a=i==="General"?z:null;t.drawText("General",4,44,{font:"body",color:s,bg:a,width:oe-8,align:"center"});const l=oe+8;t.drawText("Desktop pattern",l,8,{font:"body",color:z});const d=l,c=24,p=4,u=1,g=8*p+7*u;t.drawRect(d,c,g+2,g+2,z);for(let C=0;C<8;C++)for(let w=0;w<8;w++){const v=(w+C)%2===0,y=d+1+w*(p+u),I=c+1+C*(p+u);t.fillRect(y,I,p,p,v?z:Y)}const f=c+g+18;t.drawText("Color mode",l,f,{font:"body",color:z});const m=f+16;Dr(t,l,m,"monochrome",r==="monochrome"),Dr(t,l+ce+8,m,"colors",r==="colors"),t.hitRegion("control-panel-mode-monochrome",{x:l,y:m,w:ce,h:Be},{onClick:()=>{var C;return(C=e._setColorMode)==null?void 0:C.call(e,"monochrome")}}),t.hitRegion("control-panel-mode-colors",{x:l+ce+8,y:m,w:ce,h:Be},{onClick:()=>{var C;return(C=e._setColorMode)==null?void 0:C.call(e,"colors")}});const h=m+Be+14;t.drawText("Preview",l,h,{font:"body",color:z});const D=h+16,M=[2,3,4,7,8,9];for(let C=0;C<M.length;C++){const w=l+C*18;t.fillRect(w,D,14,14,M[C]),t.drawRect(w,D,14,14,z)}},onEvent(A,t,e){if(t.type==="mouseDown"){const[,n]=A.useState("General");t.x<oe&&n("General")}}},SA=288,dt=288,Xd=3,Jd=66;function _d(A,t,e){const n=A.current;if(n&&n.dst.canvas.width===t&&n.dst.canvas.height===e)return n;const i=new OffscreenCanvas(t,e),r=i.getContext("2d",{willReadFrequently:!0});return A.current={dst:{canvas:i,ctx:r},pixels:new Uint8Array(t*e),luminance:new Float32Array(t*e)},A.current}function $d(A,t,e,n,i){const r=t*e;for(let o=0;o<r;o++){const s=o<<2;i[o]=A[s]*.299+A[s+1]*.587+A[s+2]*.114}for(let o=0;o<r;o++){const s=i[o],a=s<129?1:0;n[o]=a;const l=(s-(a?0:255))/8;i[o+1]+=l,i[o+2]+=l,i[o+t-1]+=l,i[o+t]+=l,i[o+t+1]+=l,i[o+(t<<1)]+=l}}const Au=[[15,135,45,165],[195,75,225,105],[60,180,30,150],[240,120,210,90]];function tu(A,t,e,n,i){const r=t*e;for(let o=0;o<r;o++){const s=o<<2,a=A[s]*.299+A[s+1]*.587+A[s+2]*.114,l=o%t,d=o/t|0,c=a+Au[l&3][d&3]>>1;n[o]=c<i?1:0}}function eu(A,t,e){const n=A.videoWidth,i=A.videoHeight,{dst:r,pixels:o,luminance:s}=t,a=r.canvas.width,l=r.canvas.height,d=Math.min(n,i),c=n-d>>1,p=i-d>>1,{ctx:u}=r;u.setTransform(-1,0,0,1,a,0),u.drawImage(A,c,p,d,d,0,0,a,l);const g=u.getImageData(0,0,a,l);e==="bayer"?tu(g.data,a,l,o,128):(s.fill(0),$d(g.data,a,l,o,s))}const nu={id:"photobooth",title:"Photo Booth",icon:"icon/photobooth-smr-32",defaultSize:{width:SA,height:dt+40},scrollable:!1,render(A,t,e){const n=e._os,[i,r]=A.useState(!0),[o,s]=A.useState(""),[a,l]=A.useState(null),[d,c]=A.useState(null),[p,u]=A.useState([]),[g,f]=A.useState(!1),[m,h]=A.useState("atkinson"),D=A.useRef(null),M=A.useRef(null),k=A.useRef(null),C=A.useRef("");if(t.clear(Y),A.useEffect(()=>{let x=!1;return(async()=>{const O=await n.camera.requestAccess();x||(O||s("Camera access denied."),r(!1))})(),()=>{x=!0,n.camera.release()}},[]),A.useEffect(()=>{if(i||o)return;let x=!1,O=0;function H(){if(x)return;const B=performance.now();if(B-O>=Jd){const S=n.camera.getVideoElement();if(S&&S.videoWidth>0){const Q=_d(k,SA,dt);eu(S,Q,m)}O=B,A.scheduleRender()}D.current=requestAnimationFrame(H)}return H(),()=>{x=!0,D.current!==null&&cancelAnimationFrame(D.current)}},[m,i,o]),g){t.fillRect(0,0,t.width,t.height,Y);return}if(d!==null&&p.length>d){const x=p[d];x.imageData&&t.blitImageData(x.imageData,0,0)}else k.current&&t.blit1bitPixels(k.current.pixels,SA,dt,0,0);if(i&&t.drawText("Initializing camera...",SA/2-60,dt/2-6,{font:"menu",color:z,bg:Y}),o&&t.drawText(o,8,dt/2,{font:"menu",color:z,bg:Y}),a!==null&&a>0){const x=String(a);t.fillRect(SA/2-14,dt/2-12,28,24,Y),t.drawText(x,SA/2-4,dt/2-8,{font:"menu",color:z})}const w=dt;t.fillRect(0,w,t.width,40,Y),t.drawHLine(0,w,t.width,z);const v=w+8,y=24,I=t.getWindow();if(I!==null){const x=d===null?`list-${p.length}`:`view-${d}-${p.length}`;if(C.current!==x&&(I.controlList.length=0,C.current=x),I.controlList.length===0)if(d===null){const O=xA(I,_(v,SA/2-30,v+y,SA/2+30),"Snap",!0,0,0,1,0,0);if(O.ref.contrlAction=(H,B)=>{B===kA&&a===null&&!i&&!o&&iu(l,M,()=>V())},p.length>0){const H=xA(I,_(v,SA-64,v+y,SA-8),`${p.length} pic${p.length>1?"s":""}`,!0,0,0,1,0,0);H.ref.contrlAction=(B,S)=>{S===kA&&c(p.length-1)}}}else{const O=xA(I,_(v,8,v+20,72),"Delete",!0,0,0,1,0,0);O.ref.contrlAction=(Q,N)=>{if(N===kA){const E=p.filter((R,q)=>q!==d);u(E),c(E.length>0?Math.min(d,E.length-1):null)}};const H=xA(I,_(v,72,v+20,128),"Save",!0,0,0,1,0,0);H.ref.contrlAction=(Q,N)=>{N===kA&&ru(n,p[d])};let B=128;if(d>0){const Q=xA(I,_(v,B,v+20,B+32),"<",!0,0,0,1,0,0);Q.ref.contrlAction=(N,E)=>{E===kA&&c(d-1)},B+=32}if(d<p.length-1){const Q=xA(I,_(v,B,v+20,B+32),">",!0,0,0,1,0,0);Q.ref.contrlAction=(N,E)=>{E===kA&&c(d+1)},B+=32}const S=xA(I,_(v,SA-52,v+20,SA),"Back",!0,0,0,1,0,0);S.ref.contrlAction=(Q,N)=>{N===kA&&c(null)}}if(d===null&&I.controlList.length>0){const O=a!==null&&a>0;I.controlList[0].ref.contrlTitle=O?String(a):"Snap",I.controlList[0].ref.contrlHilite=O||i||o?255:0,p.length>0&&I.controlList[1]&&(I.controlList[1].ref.contrlTitle=`${p.length} pic${p.length>1?"s":""}`)}Nt(I,t.port)}d!==null&&t.drawText(`${d+1}/${p.length}`,SA/2-12,w+12,{font:"body",color:z});function V(){if(!k.current)return;const x=k.current.pixels,O=new ImageData(SA,dt),H=O.data;for(let B=0,S=SA*dt;B<S;B++){const Q=x[B]?0:255,N=B<<2;H[N]=Q,H[N+1]=Q,H[N+2]=Q,H[N+3]=255}f(!0),setTimeout(()=>f(!1),120),u(B=>[...B,{imageData:O,timestamp:Date.now()}])}},onEvent(A,t,e,n){A.useState(!0),A.useState(""),A.useState(null),A.useState(null),A.useState([]),A.useState(!1),A.useState("atkinson"),A.useRef(null),A.useRef(null),A.useRef(null),A.useRef("")},getMenubar(A,t){A.useState(!0),A.useState("");const[e]=A.useState(null);A.useState(null),A.useState([]),A.useState(!1);const[n,i]=A.useState("atkinson");return A.useRef(null),A.useRef(null),A.useRef(null),A.useRef(""),[{label:"File",items:[{label:"Take Photo",shortcut:"T",disabled:e!==null,onSelect:()=>{}}]},{label:"Dithering",items:[{type:"radiogroup",value:n,onValueChange:r=>i(r),items:[{label:"Atkinson",value:"atkinson"},{label:"Bayer",value:"bayer"}]}]}]}};function iu(A,t,e){let n=Xd;A(n);function i(){n--,n<=0?(A(null),e()):(A(n),t.current=setTimeout(i,1e3))}t.current=setTimeout(i,1e3)}async function ru(A,t){if(!A.fs||!t)return;const e=new Date(t.timestamp),n=`Photo ${e.toLocaleDateString()} ${e.toLocaleTimeString()}`,i=t.imageData.width,r=t.imageData.height,o=i*r,s=Math.ceil(o/4),a=new Uint8Array(s),l=t.imageData.data;for(let c=0;c<o;c++){const u=l[c*4]<128?2:1,g=Math.floor(c/4),f=6-c%4*2;a[g]|=u<<f}const d=btoa(String.fromCharCode(...a));try{const c=A.fs.resolvePath("/Mockintosh HD/Desktop Folder");c&&await A.fs.writeImage(c.id,n,{width:i,height:r,data:d})}catch(c){console.error("Failed to save photo:",c)}}const ou=340,su={id:"video",title:"1984.mp4",icon:"icon/MacFlim",defaultSize:{width:ou,height:260},scrollable:!1,render(A,t,e){const[n,i]=A.useState(!1),r=A.useRef(null);A.useRef(null);const o=A.useRef(!1);t.clear(Y),r.current&&t.blitImageData(r.current,0,0);const s=t.height-18;t.fillRect(0,s,t.width,18,Y);const a=t.getWindow();if(a!==null){if(!o.current){const p=_(s+1,4,s+17,20),u=xA(a,p,">",!0,0,0,1,0,0);u.ref.contrlAction=(g,f)=>{f===kA&&i(m=>!m)},o.current=!0}const c=a.controlList[0];c&&(c.ref.contrlTitle=n?"||":">"),Nt(a,t.port)}const l=24,d=t.width-28;t.drawRect(l,s+1,d,16,z),t.fillRect(l+1,s+2,14,14,Y),t.drawVLine(l+14,s+1,16,z),t.fillRect(l+d-15,s+2,14,14,Y),t.drawVLine(l+d-15,s+1,16,z),t.fillPattern(l+15,s+2,d-30,14,"gray50")},onOpen(A,t){},onEvent(A,t,e,n){A.useState(!1),A.useRef(null),A.useRef(null),A.useRef(!1)}},lu={};function au(A,t){const e=lu,n=typeof e.includeImageAlt=="boolean"?e.includeImageAlt:!0,i=typeof e.includeHtml=="boolean"?e.includeHtml:!0;return es(A,n,i)}function es(A,t,e){if(cu(A)){if("value"in A)return A.type==="html"&&!e?"":A.value;if(t&&"alt"in A&&A.alt)return A.alt;if("children"in A)return Cr(A.children,t,e)}return Array.isArray(A)?Cr(A,t,e):""}function Cr(A,t,e){const n=[];let i=-1;for(;++i<A.length;)n[i]=es(A[i],t,e);return n.join("")}function cu(A){return!!(A&&typeof A=="object")}const Pr=document.createElement("i");function Ki(A){const t="&"+A+";";Pr.innerHTML=t;const e=Pr.textContent;return e.charCodeAt(e.length-1)===59&&A!=="semi"||e===t?!1:e}function wt(A,t,e,n){const i=A.length;let r=0,o;if(t<0?t=-t>i?0:i+t:t=t>i?i:t,e=e>0?e:0,n.length<1e4)o=Array.from(n),o.unshift(t,e),A.splice(...o);else for(e&&A.splice(t,e);r<n.length;)o=n.slice(r,r+1e4),o.unshift(t,0),A.splice(...o),r+=1e4,t+=1e4}function nt(A,t){return A.length>0?(wt(A,A.length,0,t),A):t}const Br={}.hasOwnProperty;function du(A){const t={};let e=-1;for(;++e<A.length;)uu(t,A[e]);return t}function uu(A,t){let e;for(e in t){const i=(Br.call(A,e)?A[e]:void 0)||(A[e]={}),r=t[e];let o;if(r)for(o in r){Br.call(i,o)||(i[o]=[]);const s=r[o];pu(i[o],Array.isArray(s)?s:s?[s]:[])}}}function pu(A,t){let e=-1;const n=[];for(;++e<t.length;)(t[e].add==="after"?A:n).push(t[e]);wt(A,0,0,n)}function ns(A,t){const e=Number.parseInt(A,t);return e<9||e===11||e>13&&e<32||e>126&&e<160||e>55295&&e<57344||e>64975&&e<65008||(e&65535)===65535||(e&65535)===65534||e>1114111?"�":String.fromCodePoint(e)}function pe(A){return A.replace(/[\t\n\r ]+/g," ").replace(/^ | $/g,"").toLowerCase().toUpperCase()}const gt=Ft(/[A-Za-z]/),st=Ft(/[\dA-Za-z]/),fu=Ft(/[#-'*+\--9=?A-Z^-~]/);function ri(A){return A!==null&&(A<32||A===127)}const oi=Ft(/\d/),gu=Ft(/[\dA-Fa-f]/),mu=Ft(/[!-/:-@[-`{-~]/);function $(A){return A!==null&&A<-2}function YA(A){return A!==null&&(A<0||A===32)}function lA(A){return A===-2||A===-1||A===32}const qu=Ft(new RegExp("\\p{P}|\\p{S}","u")),hu=Ft(/\s/);function Ft(A){return t;function t(e){return e!==null&&e>-1&&A.test(String.fromCharCode(e))}}function pA(A,t,e,n){const i=n?n-1:Number.POSITIVE_INFINITY;let r=0;return o;function o(a){return lA(a)?(A.enter(e),s(a)):t(a)}function s(a){return lA(a)&&r++<i?(A.consume(a),s):(A.exit(e),t(a))}}const xu={tokenize:wu};function wu(A){const t=A.attempt(this.parser.constructs.contentInitial,n,i);let e;return t;function n(s){if(s===null){A.consume(s);return}return A.enter("lineEnding"),A.consume(s),A.exit("lineEnding"),pA(A,t,"linePrefix")}function i(s){return A.enter("paragraph"),r(s)}function r(s){const a=A.enter("chunkText",{contentType:"text",previous:e});return e&&(e.next=a),e=a,o(s)}function o(s){if(s===null){A.exit("chunkText"),A.exit("paragraph"),A.consume(s);return}return $(s)?(A.consume(s),A.exit("chunkText"),r):(A.consume(s),o)}}const yu={tokenize:bu},Or={tokenize:Vu};function bu(A){const t=this,e=[];let n=0,i,r,o;return s;function s(M){if(n<e.length){const k=e[n];return t.containerState=k[1],A.attempt(k[0].continuation,a,l)(M)}return l(M)}function a(M){if(n++,t.containerState._closeFlow){t.containerState._closeFlow=void 0,i&&D();const k=t.events.length;let C=k,w;for(;C--;)if(t.events[C][0]==="exit"&&t.events[C][1].type==="chunkFlow"){w=t.events[C][1].end;break}h(n);let v=k;for(;v<t.events.length;)t.events[v][1].end={...w},v++;return wt(t.events,C+1,0,t.events.slice(k)),t.events.length=v,l(M)}return s(M)}function l(M){if(n===e.length){if(!i)return p(M);if(i.currentConstruct&&i.currentConstruct.concrete)return g(M);t.interrupt=!!(i.currentConstruct&&!i._gfmTableDynamicInterruptHack)}return t.containerState={},A.check(Or,d,c)(M)}function d(M){return i&&D(),h(n),p(M)}function c(M){return t.parser.lazy[t.now().line]=n!==e.length,o=t.now().offset,g(M)}function p(M){return t.containerState={},A.attempt(Or,u,g)(M)}function u(M){return n++,e.push([t.currentConstruct,t.containerState]),p(M)}function g(M){if(M===null){i&&D(),h(0),A.consume(M);return}return i=i||t.parser.flow(t.now()),A.enter("chunkFlow",{_tokenizer:i,contentType:"flow",previous:r}),f(M)}function f(M){if(M===null){m(A.exit("chunkFlow"),!0),h(0),A.consume(M);return}return $(M)?(A.consume(M),m(A.exit("chunkFlow")),n=0,t.interrupt=void 0,s):(A.consume(M),f)}function m(M,k){const C=t.sliceStream(M);if(k&&C.push(null),M.previous=r,r&&(r.next=M),r=M,i.defineSkip(M.start),i.write(C),t.parser.lazy[M.start.line]){let w=i.events.length;for(;w--;)if(i.events[w][1].start.offset<o&&(!i.events[w][1].end||i.events[w][1].end.offset>o))return;const v=t.events.length;let y=v,I,V;for(;y--;)if(t.events[y][0]==="exit"&&t.events[y][1].type==="chunkFlow"){if(I){V=t.events[y][1].end;break}I=!0}for(h(n),w=v;w<t.events.length;)t.events[w][1].end={...V},w++;wt(t.events,y+1,0,t.events.slice(v)),t.events.length=w}}function h(M){let k=e.length;for(;k-- >M;){const C=e[k];t.containerState=C[1],C[0].exit.call(t,A)}e.length=M}function D(){i.write([null]),r=void 0,i=void 0,t.containerState._closeFlow=void 0}}function Vu(A,t,e){return pA(A,A.attempt(this.parser.constructs.document,t,e),"linePrefix",this.parser.constructs.disable.null.includes("codeIndented")?void 0:4)}function Hr(A){if(A===null||YA(A)||hu(A))return 1;if(qu(A))return 2}function Li(A,t,e){const n=[];let i=-1;for(;++i<A.length;){const r=A[i].resolveAll;r&&!n.includes(r)&&(t=r(t,e),n.push(r))}return t}const si={name:"attention",resolveAll:ku,tokenize:Iu};function ku(A,t){let e=-1,n,i,r,o,s,a,l,d;for(;++e<A.length;)if(A[e][0]==="enter"&&A[e][1].type==="attentionSequence"&&A[e][1]._close){for(n=e;n--;)if(A[n][0]==="exit"&&A[n][1].type==="attentionSequence"&&A[n][1]._open&&t.sliceSerialize(A[n][1]).charCodeAt(0)===t.sliceSerialize(A[e][1]).charCodeAt(0)){if((A[n][1]._close||A[e][1]._open)&&(A[e][1].end.offset-A[e][1].start.offset)%3&&!((A[n][1].end.offset-A[n][1].start.offset+A[e][1].end.offset-A[e][1].start.offset)%3))continue;a=A[n][1].end.offset-A[n][1].start.offset>1&&A[e][1].end.offset-A[e][1].start.offset>1?2:1;const c={...A[n][1].end},p={...A[e][1].start};Sr(c,-a),Sr(p,a),o={type:a>1?"strongSequence":"emphasisSequence",start:c,end:{...A[n][1].end}},s={type:a>1?"strongSequence":"emphasisSequence",start:{...A[e][1].start},end:p},r={type:a>1?"strongText":"emphasisText",start:{...A[n][1].end},end:{...A[e][1].start}},i={type:a>1?"strong":"emphasis",start:{...o.start},end:{...s.end}},A[n][1].end={...o.start},A[e][1].start={...s.end},l=[],A[n][1].end.offset-A[n][1].start.offset&&(l=nt(l,[["enter",A[n][1],t],["exit",A[n][1],t]])),l=nt(l,[["enter",i,t],["enter",o,t],["exit",o,t],["enter",r,t]]),l=nt(l,Li(t.parser.constructs.insideSpan.null,A.slice(n+1,e),t)),l=nt(l,[["exit",r,t],["enter",s,t],["exit",s,t],["exit",i,t]]),A[e][1].end.offset-A[e][1].start.offset?(d=2,l=nt(l,[["enter",A[e][1],t],["exit",A[e][1],t]])):d=0,wt(A,n-1,e-n+3,l),e=n+l.length-d-2;break}}for(e=-1;++e<A.length;)A[e][1].type==="attentionSequence"&&(A[e][1].type="data");return A}function Iu(A,t){const e=this.parser.constructs.attentionMarkers.null,n=this.previous,i=Hr(n);let r;return o;function o(a){return r=a,A.enter("attentionSequence"),s(a)}function s(a){if(a===r)return A.consume(a),s;const l=A.exit("attentionSequence"),d=Hr(a),c=!d||d===2&&i||e.includes(a),p=!i||i===2&&d||e.includes(n);return l._open=!!(r===42?c:c&&(i||!p)),l._close=!!(r===42?p:p&&(d||!c)),t(a)}}function Sr(A,t){A.column+=t,A.offset+=t,A._bufferIndex+=t}const vu={name:"autolink",tokenize:zu};function zu(A,t,e){let n=0;return i;function i(u){return A.enter("autolink"),A.enter("autolinkMarker"),A.consume(u),A.exit("autolinkMarker"),A.enter("autolinkProtocol"),r}function r(u){return gt(u)?(A.consume(u),o):u===64?e(u):l(u)}function o(u){return u===43||u===45||u===46||st(u)?(n=1,s(u)):l(u)}function s(u){return u===58?(A.consume(u),n=0,a):(u===43||u===45||u===46||st(u))&&n++<32?(A.consume(u),s):(n=0,l(u))}function a(u){return u===62?(A.exit("autolinkProtocol"),A.enter("autolinkMarker"),A.consume(u),A.exit("autolinkMarker"),A.exit("autolink"),t):u===null||u===32||u===60||ri(u)?e(u):(A.consume(u),a)}function l(u){return u===64?(A.consume(u),d):fu(u)?(A.consume(u),l):e(u)}function d(u){return st(u)?c(u):e(u)}function c(u){return u===46?(A.consume(u),n=0,d):u===62?(A.exit("autolinkProtocol").type="autolinkEmail",A.enter("autolinkMarker"),A.consume(u),A.exit("autolinkMarker"),A.exit("autolink"),t):p(u)}function p(u){if((u===45||st(u))&&n++<63){const g=u===45?p:c;return A.consume(u),g}return e(u)}}const Pn={partial:!0,tokenize:Mu};function Mu(A,t,e){return n;function n(r){return lA(r)?pA(A,i,"linePrefix")(r):i(r)}function i(r){return r===null||$(r)?t(r):e(r)}}const is={continuation:{tokenize:Cu},exit:Pu,name:"blockQuote",tokenize:Du};function Du(A,t,e){const n=this;return i;function i(o){if(o===62){const s=n.containerState;return s.open||(A.enter("blockQuote",{_container:!0}),s.open=!0),A.enter("blockQuotePrefix"),A.enter("blockQuoteMarker"),A.consume(o),A.exit("blockQuoteMarker"),r}return e(o)}function r(o){return lA(o)?(A.enter("blockQuotePrefixWhitespace"),A.consume(o),A.exit("blockQuotePrefixWhitespace"),A.exit("blockQuotePrefix"),t):(A.exit("blockQuotePrefix"),t(o))}}function Cu(A,t,e){const n=this;return i;function i(o){return lA(o)?pA(A,r,"linePrefix",n.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(o):r(o)}function r(o){return A.attempt(is,t,e)(o)}}function Pu(A){A.exit("blockQuote")}const rs={name:"characterEscape",tokenize:Bu};function Bu(A,t,e){return n;function n(r){return A.enter("characterEscape"),A.enter("escapeMarker"),A.consume(r),A.exit("escapeMarker"),i}function i(r){return mu(r)?(A.enter("characterEscapeValue"),A.consume(r),A.exit("characterEscapeValue"),A.exit("characterEscape"),t):e(r)}}const os={name:"characterReference",tokenize:Ou};function Ou(A,t,e){const n=this;let i=0,r,o;return s;function s(c){return A.enter("characterReference"),A.enter("characterReferenceMarker"),A.consume(c),A.exit("characterReferenceMarker"),a}function a(c){return c===35?(A.enter("characterReferenceMarkerNumeric"),A.consume(c),A.exit("characterReferenceMarkerNumeric"),l):(A.enter("characterReferenceValue"),r=31,o=st,d(c))}function l(c){return c===88||c===120?(A.enter("characterReferenceMarkerHexadecimal"),A.consume(c),A.exit("characterReferenceMarkerHexadecimal"),A.enter("characterReferenceValue"),r=6,o=gu,d):(A.enter("characterReferenceValue"),r=7,o=oi,d(c))}function d(c){if(c===59&&i){const p=A.exit("characterReferenceValue");return o===st&&!Ki(n.sliceSerialize(p))?e(c):(A.enter("characterReferenceMarker"),A.consume(c),A.exit("characterReferenceMarker"),A.exit("characterReference"),t)}return o(c)&&i++<r?(A.consume(c),d):e(c)}}const Wr={partial:!0,tokenize:Su},Kr={concrete:!0,name:"codeFenced",tokenize:Hu};function Hu(A,t,e){const n=this,i={partial:!0,tokenize:C};let r=0,o=0,s;return a;function a(w){return l(w)}function l(w){const v=n.events[n.events.length-1];return r=v&&v[1].type==="linePrefix"?v[2].sliceSerialize(v[1],!0).length:0,s=w,A.enter("codeFenced"),A.enter("codeFencedFence"),A.enter("codeFencedFenceSequence"),d(w)}function d(w){return w===s?(o++,A.consume(w),d):o<3?e(w):(A.exit("codeFencedFenceSequence"),lA(w)?pA(A,c,"whitespace")(w):c(w))}function c(w){return w===null||$(w)?(A.exit("codeFencedFence"),n.interrupt?t(w):A.check(Wr,f,k)(w)):(A.enter("codeFencedFenceInfo"),A.enter("chunkString",{contentType:"string"}),p(w))}function p(w){return w===null||$(w)?(A.exit("chunkString"),A.exit("codeFencedFenceInfo"),c(w)):lA(w)?(A.exit("chunkString"),A.exit("codeFencedFenceInfo"),pA(A,u,"whitespace")(w)):w===96&&w===s?e(w):(A.consume(w),p)}function u(w){return w===null||$(w)?c(w):(A.enter("codeFencedFenceMeta"),A.enter("chunkString",{contentType:"string"}),g(w))}function g(w){return w===null||$(w)?(A.exit("chunkString"),A.exit("codeFencedFenceMeta"),c(w)):w===96&&w===s?e(w):(A.consume(w),g)}function f(w){return A.attempt(i,k,m)(w)}function m(w){return A.enter("lineEnding"),A.consume(w),A.exit("lineEnding"),h}function h(w){return r>0&&lA(w)?pA(A,D,"linePrefix",r+1)(w):D(w)}function D(w){return w===null||$(w)?A.check(Wr,f,k)(w):(A.enter("codeFlowValue"),M(w))}function M(w){return w===null||$(w)?(A.exit("codeFlowValue"),D(w)):(A.consume(w),M)}function k(w){return A.exit("codeFenced"),t(w)}function C(w,v,y){let I=0;return V;function V(S){return w.enter("lineEnding"),w.consume(S),w.exit("lineEnding"),x}function x(S){return w.enter("codeFencedFence"),lA(S)?pA(w,O,"linePrefix",n.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(S):O(S)}function O(S){return S===s?(w.enter("codeFencedFenceSequence"),H(S)):y(S)}function H(S){return S===s?(I++,w.consume(S),H):I>=o?(w.exit("codeFencedFenceSequence"),lA(S)?pA(w,B,"whitespace")(S):B(S)):y(S)}function B(S){return S===null||$(S)?(w.exit("codeFencedFence"),v(S)):y(S)}}}function Su(A,t,e){const n=this;return i;function i(o){return o===null?e(o):(A.enter("lineEnding"),A.consume(o),A.exit("lineEnding"),r)}function r(o){return n.parser.lazy[n.now().line]?e(o):t(o)}}const Gn={name:"codeIndented",tokenize:Ku},Wu={partial:!0,tokenize:Lu};function Ku(A,t,e){const n=this;return i;function i(l){return A.enter("codeIndented"),pA(A,r,"linePrefix",5)(l)}function r(l){const d=n.events[n.events.length-1];return d&&d[1].type==="linePrefix"&&d[2].sliceSerialize(d[1],!0).length>=4?o(l):e(l)}function o(l){return l===null?a(l):$(l)?A.attempt(Wu,o,a)(l):(A.enter("codeFlowValue"),s(l))}function s(l){return l===null||$(l)?(A.exit("codeFlowValue"),o(l)):(A.consume(l),s)}function a(l){return A.exit("codeIndented"),t(l)}}function Lu(A,t,e){const n=this;return i;function i(o){return n.parser.lazy[n.now().line]?e(o):$(o)?(A.enter("lineEnding"),A.consume(o),A.exit("lineEnding"),i):pA(A,r,"linePrefix",5)(o)}function r(o){const s=n.events[n.events.length-1];return s&&s[1].type==="linePrefix"&&s[2].sliceSerialize(s[1],!0).length>=4?t(o):$(o)?i(o):e(o)}}const Eu={name:"codeText",previous:Gu,resolve:Zu,tokenize:Tu};function Zu(A){let t=A.length-4,e=3,n,i;if((A[e][1].type==="lineEnding"||A[e][1].type==="space")&&(A[t][1].type==="lineEnding"||A[t][1].type==="space")){for(n=e;++n<t;)if(A[n][1].type==="codeTextData"){A[e][1].type="codeTextPadding",A[t][1].type="codeTextPadding",e+=2,t-=2;break}}for(n=e-1,t++;++n<=t;)i===void 0?n!==t&&A[n][1].type!=="lineEnding"&&(i=n):(n===t||A[n][1].type==="lineEnding")&&(A[i][1].type="codeTextData",n!==i+2&&(A[i][1].end=A[n-1][1].end,A.splice(i+2,n-i-2),t-=n-i-2,n=i+2),i=void 0);return A}function Gu(A){return A!==96||this.events[this.events.length-1][1].type==="characterEscape"}function Tu(A,t,e){let n=0,i,r;return o;function o(c){return A.enter("codeText"),A.enter("codeTextSequence"),s(c)}function s(c){return c===96?(A.consume(c),n++,s):(A.exit("codeTextSequence"),a(c))}function a(c){return c===null?e(c):c===32?(A.enter("space"),A.consume(c),A.exit("space"),a):c===96?(r=A.enter("codeTextSequence"),i=0,d(c)):$(c)?(A.enter("lineEnding"),A.consume(c),A.exit("lineEnding"),a):(A.enter("codeTextData"),l(c))}function l(c){return c===null||c===32||c===96||$(c)?(A.exit("codeTextData"),a(c)):(A.consume(c),l)}function d(c){return c===96?(A.consume(c),i++,d):i===n?(A.exit("codeTextSequence"),A.exit("codeText"),t(c)):(r.type="codeTextData",l(c))}}class Qu{constructor(t){this.left=t?[...t]:[],this.right=[]}get(t){if(t<0||t>=this.left.length+this.right.length)throw new RangeError("Cannot access index `"+t+"` in a splice buffer of size `"+(this.left.length+this.right.length)+"`");return t<this.left.length?this.left[t]:this.right[this.right.length-t+this.left.length-1]}get length(){return this.left.length+this.right.length}shift(){return this.setCursor(0),this.right.pop()}slice(t,e){const n=e??Number.POSITIVE_INFINITY;return n<this.left.length?this.left.slice(t,n):t>this.left.length?this.right.slice(this.right.length-n+this.left.length,this.right.length-t+this.left.length).reverse():this.left.slice(t).concat(this.right.slice(this.right.length-n+this.left.length).reverse())}splice(t,e,n){const i=e||0;this.setCursor(Math.trunc(t));const r=this.right.splice(this.right.length-i,Number.POSITIVE_INFINITY);return n&&ve(this.left,n),r.reverse()}pop(){return this.setCursor(Number.POSITIVE_INFINITY),this.left.pop()}push(t){this.setCursor(Number.POSITIVE_INFINITY),this.left.push(t)}pushMany(t){this.setCursor(Number.POSITIVE_INFINITY),ve(this.left,t)}unshift(t){this.setCursor(0),this.right.push(t)}unshiftMany(t){this.setCursor(0),ve(this.right,t.reverse())}setCursor(t){if(!(t===this.left.length||t>this.left.length&&this.right.length===0||t<0&&this.left.length===0))if(t<this.left.length){const e=this.left.splice(t,Number.POSITIVE_INFINITY);ve(this.right,e.reverse())}else{const e=this.right.splice(this.left.length+this.right.length-t,Number.POSITIVE_INFINITY);ve(this.left,e.reverse())}}}function ve(A,t){let e=0;if(t.length<1e4)A.push(...t);else for(;e<t.length;)A.push(...t.slice(e,e+1e4)),e+=1e4}function ss(A){const t={};let e=-1,n,i,r,o,s,a,l;const d=new Qu(A);for(;++e<d.length;){for(;e in t;)e=t[e];if(n=d.get(e),e&&n[1].type==="chunkFlow"&&d.get(e-1)[1].type==="listItemPrefix"&&(a=n[1]._tokenizer.events,r=0,r<a.length&&a[r][1].type==="lineEndingBlank"&&(r+=2),r<a.length&&a[r][1].type==="content"))for(;++r<a.length&&a[r][1].type!=="content";)a[r][1].type==="chunkText"&&(a[r][1]._isInFirstContentOfListItem=!0,r++);if(n[0]==="enter")n[1].contentType&&(Object.assign(t,Yu(d,e)),e=t[e],l=!0);else if(n[1]._container){for(r=e,i=void 0;r--;)if(o=d.get(r),o[1].type==="lineEnding"||o[1].type==="lineEndingBlank")o[0]==="enter"&&(i&&(d.get(i)[1].type="lineEndingBlank"),o[1].type="lineEnding",i=r);else if(!(o[1].type==="linePrefix"||o[1].type==="listItemIndent"))break;i&&(n[1].end={...d.get(i)[1].start},s=d.slice(i,e),s.unshift(n),d.splice(i,e-i+1,s))}}return wt(A,0,Number.POSITIVE_INFINITY,d.slice(0)),!l}function Yu(A,t){const e=A.get(t)[1],n=A.get(t)[2];let i=t-1;const r=[];let o=e._tokenizer;o||(o=n.parser[e.contentType](e.start),e._contentTypeTextTrailing&&(o._contentTypeTextTrailing=!0));const s=o.events,a=[],l={};let d,c,p=-1,u=e,g=0,f=0;const m=[f];for(;u;){for(;A.get(++i)[1]!==u;);r.push(i),u._tokenizer||(d=n.sliceStream(u),u.next||d.push(null),c&&o.defineSkip(u.start),u._isInFirstContentOfListItem&&(o._gfmTasklistFirstContentOfListItem=!0),o.write(d),u._isInFirstContentOfListItem&&(o._gfmTasklistFirstContentOfListItem=void 0)),c=u,u=u.next}for(u=e;++p<s.length;)s[p][0]==="exit"&&s[p-1][0]==="enter"&&s[p][1].type===s[p-1][1].type&&s[p][1].start.line!==s[p][1].end.line&&(f=p+1,m.push(f),u._tokenizer=void 0,u.previous=void 0,u=u.next);for(o.events=[],u?(u._tokenizer=void 0,u.previous=void 0):m.pop(),p=m.length;p--;){const h=s.slice(m[p],m[p+1]),D=r.pop();a.push([D,D+h.length-1]),A.splice(D,2,h)}for(a.reverse(),p=-1;++p<a.length;)l[g+a[p][0]]=g+a[p][1],g+=a[p][1]-a[p][0]-1;return l}const Nu={resolve:Ru,tokenize:Uu},Fu={partial:!0,tokenize:ju};function Ru(A){return ss(A),A}function Uu(A,t){let e;return n;function n(s){return A.enter("content"),e=A.enter("chunkContent",{contentType:"content"}),i(s)}function i(s){return s===null?r(s):$(s)?A.check(Fu,o,r)(s):(A.consume(s),i)}function r(s){return A.exit("chunkContent"),A.exit("content"),t(s)}function o(s){return A.consume(s),A.exit("chunkContent"),e.next=A.enter("chunkContent",{contentType:"content",previous:e}),e=e.next,i}}function ju(A,t,e){const n=this;return i;function i(o){return A.exit("chunkContent"),A.enter("lineEnding"),A.consume(o),A.exit("lineEnding"),pA(A,r,"linePrefix")}function r(o){if(o===null||$(o))return e(o);const s=n.events[n.events.length-1];return!n.parser.constructs.disable.null.includes("codeIndented")&&s&&s[1].type==="linePrefix"&&s[2].sliceSerialize(s[1],!0).length>=4?t(o):A.interrupt(n.parser.constructs.flow,e,t)(o)}}function ls(A,t,e,n,i,r,o,s,a){const l=a||Number.POSITIVE_INFINITY;let d=0;return c;function c(h){return h===60?(A.enter(n),A.enter(i),A.enter(r),A.consume(h),A.exit(r),p):h===null||h===32||h===41||ri(h)?e(h):(A.enter(n),A.enter(o),A.enter(s),A.enter("chunkString",{contentType:"string"}),f(h))}function p(h){return h===62?(A.enter(r),A.consume(h),A.exit(r),A.exit(i),A.exit(n),t):(A.enter(s),A.enter("chunkString",{contentType:"string"}),u(h))}function u(h){return h===62?(A.exit("chunkString"),A.exit(s),p(h)):h===null||h===60||$(h)?e(h):(A.consume(h),h===92?g:u)}function g(h){return h===60||h===62||h===92?(A.consume(h),u):u(h)}function f(h){return!d&&(h===null||h===41||YA(h))?(A.exit("chunkString"),A.exit(s),A.exit(o),A.exit(n),t(h)):d<l&&h===40?(A.consume(h),d++,f):h===41?(A.consume(h),d--,f):h===null||h===32||h===40||ri(h)?e(h):(A.consume(h),h===92?m:f)}function m(h){return h===40||h===41||h===92?(A.consume(h),f):f(h)}}function as(A,t,e,n,i,r){const o=this;let s=0,a;return l;function l(u){return A.enter(n),A.enter(i),A.consume(u),A.exit(i),A.enter(r),d}function d(u){return s>999||u===null||u===91||u===93&&!a||u===94&&!s&&"_hiddenFootnoteSupport"in o.parser.constructs?e(u):u===93?(A.exit(r),A.enter(i),A.consume(u),A.exit(i),A.exit(n),t):$(u)?(A.enter("lineEnding"),A.consume(u),A.exit("lineEnding"),d):(A.enter("chunkString",{contentType:"string"}),c(u))}function c(u){return u===null||u===91||u===93||$(u)||s++>999?(A.exit("chunkString"),d(u)):(A.consume(u),a||(a=!lA(u)),u===92?p:c)}function p(u){return u===91||u===92||u===93?(A.consume(u),s++,c):c(u)}}function cs(A,t,e,n,i,r){let o;return s;function s(p){return p===34||p===39||p===40?(A.enter(n),A.enter(i),A.consume(p),A.exit(i),o=p===40?41:p,a):e(p)}function a(p){return p===o?(A.enter(i),A.consume(p),A.exit(i),A.exit(n),t):(A.enter(r),l(p))}function l(p){return p===o?(A.exit(r),a(o)):p===null?e(p):$(p)?(A.enter("lineEnding"),A.consume(p),A.exit("lineEnding"),pA(A,l,"linePrefix")):(A.enter("chunkString",{contentType:"string"}),d(p))}function d(p){return p===o||p===null||$(p)?(A.exit("chunkString"),l(p)):(A.consume(p),p===92?c:d)}function c(p){return p===o||p===92?(A.consume(p),d):d(p)}}function Oe(A,t){let e;return n;function n(i){return $(i)?(A.enter("lineEnding"),A.consume(i),A.exit("lineEnding"),e=!0,n):lA(i)?pA(A,n,e?"linePrefix":"lineSuffix")(i):t(i)}}const Xu={name:"definition",tokenize:_u},Ju={partial:!0,tokenize:$u};function _u(A,t,e){const n=this;let i;return r;function r(u){return A.enter("definition"),o(u)}function o(u){return as.call(n,A,s,e,"definitionLabel","definitionLabelMarker","definitionLabelString")(u)}function s(u){return i=pe(n.sliceSerialize(n.events[n.events.length-1][1]).slice(1,-1)),u===58?(A.enter("definitionMarker"),A.consume(u),A.exit("definitionMarker"),a):e(u)}function a(u){return YA(u)?Oe(A,l)(u):l(u)}function l(u){return ls(A,d,e,"definitionDestination","definitionDestinationLiteral","definitionDestinationLiteralMarker","definitionDestinationRaw","definitionDestinationString")(u)}function d(u){return A.attempt(Ju,c,c)(u)}function c(u){return lA(u)?pA(A,p,"whitespace")(u):p(u)}function p(u){return u===null||$(u)?(A.exit("definition"),n.parser.defined.push(i),t(u)):e(u)}}function $u(A,t,e){return n;function n(s){return YA(s)?Oe(A,i)(s):e(s)}function i(s){return cs(A,r,e,"definitionTitle","definitionTitleMarker","definitionTitleString")(s)}function r(s){return lA(s)?pA(A,o,"whitespace")(s):o(s)}function o(s){return s===null||$(s)?t(s):e(s)}}const Ap={name:"hardBreakEscape",tokenize:tp};function tp(A,t,e){return n;function n(r){return A.enter("hardBreakEscape"),A.consume(r),i}function i(r){return $(r)?(A.exit("hardBreakEscape"),t(r)):e(r)}}const ep={name:"headingAtx",resolve:np,tokenize:ip};function np(A,t){let e=A.length-2,n=3,i,r;return A[n][1].type==="whitespace"&&(n+=2),e-2>n&&A[e][1].type==="whitespace"&&(e-=2),A[e][1].type==="atxHeadingSequence"&&(n===e-1||e-4>n&&A[e-2][1].type==="whitespace")&&(e-=n+1===e?2:4),e>n&&(i={type:"atxHeadingText",start:A[n][1].start,end:A[e][1].end},r={type:"chunkText",start:A[n][1].start,end:A[e][1].end,contentType:"text"},wt(A,n,e-n+1,[["enter",i,t],["enter",r,t],["exit",r,t],["exit",i,t]])),A}function ip(A,t,e){let n=0;return i;function i(d){return A.enter("atxHeading"),r(d)}function r(d){return A.enter("atxHeadingSequence"),o(d)}function o(d){return d===35&&n++<6?(A.consume(d),o):d===null||YA(d)?(A.exit("atxHeadingSequence"),s(d)):e(d)}function s(d){return d===35?(A.enter("atxHeadingSequence"),a(d)):d===null||$(d)?(A.exit("atxHeading"),t(d)):lA(d)?pA(A,s,"whitespace")(d):(A.enter("atxHeadingText"),l(d))}function a(d){return d===35?(A.consume(d),a):(A.exit("atxHeadingSequence"),s(d))}function l(d){return d===null||d===35||YA(d)?(A.exit("atxHeadingText"),s(d)):(A.consume(d),l)}}const rp=["address","article","aside","base","basefont","blockquote","body","caption","center","col","colgroup","dd","details","dialog","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hr","html","iframe","legend","li","link","main","menu","menuitem","nav","noframes","ol","optgroup","option","p","param","search","section","summary","table","tbody","td","tfoot","th","thead","title","tr","track","ul"],Lr=["pre","script","style","textarea"],op={concrete:!0,name:"htmlFlow",resolveTo:ap,tokenize:cp},sp={partial:!0,tokenize:up},lp={partial:!0,tokenize:dp};function ap(A){let t=A.length;for(;t--&&!(A[t][0]==="enter"&&A[t][1].type==="htmlFlow"););return t>1&&A[t-2][1].type==="linePrefix"&&(A[t][1].start=A[t-2][1].start,A[t+1][1].start=A[t-2][1].start,A.splice(t-2,2)),A}function cp(A,t,e){const n=this;let i,r,o,s,a;return l;function l(b){return d(b)}function d(b){return A.enter("htmlFlow"),A.enter("htmlFlowData"),A.consume(b),c}function c(b){return b===33?(A.consume(b),p):b===47?(A.consume(b),r=!0,f):b===63?(A.consume(b),i=3,n.interrupt?t:q):gt(b)?(A.consume(b),o=String.fromCharCode(b),m):e(b)}function p(b){return b===45?(A.consume(b),i=2,u):b===91?(A.consume(b),i=5,s=0,g):gt(b)?(A.consume(b),i=4,n.interrupt?t:q):e(b)}function u(b){return b===45?(A.consume(b),n.interrupt?t:q):e(b)}function g(b){const hA="CDATA[";return b===hA.charCodeAt(s++)?(A.consume(b),s===hA.length?n.interrupt?t:O:g):e(b)}function f(b){return gt(b)?(A.consume(b),o=String.fromCharCode(b),m):e(b)}function m(b){if(b===null||b===47||b===62||YA(b)){const hA=b===47,IA=o.toLowerCase();return!hA&&!r&&Lr.includes(IA)?(i=1,n.interrupt?t(b):O(b)):rp.includes(o.toLowerCase())?(i=6,hA?(A.consume(b),h):n.interrupt?t(b):O(b)):(i=7,n.interrupt&&!n.parser.lazy[n.now().line]?e(b):r?D(b):M(b))}return b===45||st(b)?(A.consume(b),o+=String.fromCharCode(b),m):e(b)}function h(b){return b===62?(A.consume(b),n.interrupt?t:O):e(b)}function D(b){return lA(b)?(A.consume(b),D):V(b)}function M(b){return b===47?(A.consume(b),V):b===58||b===95||gt(b)?(A.consume(b),k):lA(b)?(A.consume(b),M):V(b)}function k(b){return b===45||b===46||b===58||b===95||st(b)?(A.consume(b),k):C(b)}function C(b){return b===61?(A.consume(b),w):lA(b)?(A.consume(b),C):M(b)}function w(b){return b===null||b===60||b===61||b===62||b===96?e(b):b===34||b===39?(A.consume(b),a=b,v):lA(b)?(A.consume(b),w):y(b)}function v(b){return b===a?(A.consume(b),a=null,I):b===null||$(b)?e(b):(A.consume(b),v)}function y(b){return b===null||b===34||b===39||b===47||b===60||b===61||b===62||b===96||YA(b)?C(b):(A.consume(b),y)}function I(b){return b===47||b===62||lA(b)?M(b):e(b)}function V(b){return b===62?(A.consume(b),x):e(b)}function x(b){return b===null||$(b)?O(b):lA(b)?(A.consume(b),x):e(b)}function O(b){return b===45&&i===2?(A.consume(b),Q):b===60&&i===1?(A.consume(b),N):b===62&&i===4?(A.consume(b),nA):b===63&&i===3?(A.consume(b),q):b===93&&i===5?(A.consume(b),R):$(b)&&(i===6||i===7)?(A.exit("htmlFlowData"),A.check(sp,oA,H)(b)):b===null||$(b)?(A.exit("htmlFlowData"),H(b)):(A.consume(b),O)}function H(b){return A.check(lp,B,oA)(b)}function B(b){return A.enter("lineEnding"),A.consume(b),A.exit("lineEnding"),S}function S(b){return b===null||$(b)?H(b):(A.enter("htmlFlowData"),O(b))}function Q(b){return b===45?(A.consume(b),q):O(b)}function N(b){return b===47?(A.consume(b),o="",E):O(b)}function E(b){if(b===62){const hA=o.toLowerCase();return Lr.includes(hA)?(A.consume(b),nA):O(b)}return gt(b)&&o.length<8?(A.consume(b),o+=String.fromCharCode(b),E):O(b)}function R(b){return b===93?(A.consume(b),q):O(b)}function q(b){return b===62?(A.consume(b),nA):b===45&&i===2?(A.consume(b),q):O(b)}function nA(b){return b===null||$(b)?(A.exit("htmlFlowData"),oA(b)):(A.consume(b),nA)}function oA(b){return A.exit("htmlFlow"),t(b)}}function dp(A,t,e){const n=this;return i;function i(o){return $(o)?(A.enter("lineEnding"),A.consume(o),A.exit("lineEnding"),r):e(o)}function r(o){return n.parser.lazy[n.now().line]?e(o):t(o)}}function up(A,t,e){return n;function n(i){return A.enter("lineEnding"),A.consume(i),A.exit("lineEnding"),A.attempt(Pn,t,e)}}const pp={name:"htmlText",tokenize:fp};function fp(A,t,e){const n=this;let i,r,o;return s;function s(q){return A.enter("htmlText"),A.enter("htmlTextData"),A.consume(q),a}function a(q){return q===33?(A.consume(q),l):q===47?(A.consume(q),C):q===63?(A.consume(q),M):gt(q)?(A.consume(q),y):e(q)}function l(q){return q===45?(A.consume(q),d):q===91?(A.consume(q),r=0,g):gt(q)?(A.consume(q),D):e(q)}function d(q){return q===45?(A.consume(q),u):e(q)}function c(q){return q===null?e(q):q===45?(A.consume(q),p):$(q)?(o=c,N(q)):(A.consume(q),c)}function p(q){return q===45?(A.consume(q),u):c(q)}function u(q){return q===62?Q(q):q===45?p(q):c(q)}function g(q){const nA="CDATA[";return q===nA.charCodeAt(r++)?(A.consume(q),r===nA.length?f:g):e(q)}function f(q){return q===null?e(q):q===93?(A.consume(q),m):$(q)?(o=f,N(q)):(A.consume(q),f)}function m(q){return q===93?(A.consume(q),h):f(q)}function h(q){return q===62?Q(q):q===93?(A.consume(q),h):f(q)}function D(q){return q===null||q===62?Q(q):$(q)?(o=D,N(q)):(A.consume(q),D)}function M(q){return q===null?e(q):q===63?(A.consume(q),k):$(q)?(o=M,N(q)):(A.consume(q),M)}function k(q){return q===62?Q(q):M(q)}function C(q){return gt(q)?(A.consume(q),w):e(q)}function w(q){return q===45||st(q)?(A.consume(q),w):v(q)}function v(q){return $(q)?(o=v,N(q)):lA(q)?(A.consume(q),v):Q(q)}function y(q){return q===45||st(q)?(A.consume(q),y):q===47||q===62||YA(q)?I(q):e(q)}function I(q){return q===47?(A.consume(q),Q):q===58||q===95||gt(q)?(A.consume(q),V):$(q)?(o=I,N(q)):lA(q)?(A.consume(q),I):Q(q)}function V(q){return q===45||q===46||q===58||q===95||st(q)?(A.consume(q),V):x(q)}function x(q){return q===61?(A.consume(q),O):$(q)?(o=x,N(q)):lA(q)?(A.consume(q),x):I(q)}function O(q){return q===null||q===60||q===61||q===62||q===96?e(q):q===34||q===39?(A.consume(q),i=q,H):$(q)?(o=O,N(q)):lA(q)?(A.consume(q),O):(A.consume(q),B)}function H(q){return q===i?(A.consume(q),i=void 0,S):q===null?e(q):$(q)?(o=H,N(q)):(A.consume(q),H)}function B(q){return q===null||q===34||q===39||q===60||q===61||q===96?e(q):q===47||q===62||YA(q)?I(q):(A.consume(q),B)}function S(q){return q===47||q===62||YA(q)?I(q):e(q)}function Q(q){return q===62?(A.consume(q),A.exit("htmlTextData"),A.exit("htmlText"),t):e(q)}function N(q){return A.exit("htmlTextData"),A.enter("lineEnding"),A.consume(q),A.exit("lineEnding"),E}function E(q){return lA(q)?pA(A,R,"linePrefix",n.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(q):R(q)}function R(q){return A.enter("htmlTextData"),o(q)}}const Ei={name:"labelEnd",resolveAll:hp,resolveTo:xp,tokenize:wp},gp={tokenize:yp},mp={tokenize:bp},qp={tokenize:Vp};function hp(A){let t=-1;const e=[];for(;++t<A.length;){const n=A[t][1];if(e.push(A[t]),n.type==="labelImage"||n.type==="labelLink"||n.type==="labelEnd"){const i=n.type==="labelImage"?4:2;n.type="data",t+=i}}return A.length!==e.length&&wt(A,0,A.length,e),A}function xp(A,t){let e=A.length,n=0,i,r,o,s;for(;e--;)if(i=A[e][1],r){if(i.type==="link"||i.type==="labelLink"&&i._inactive)break;A[e][0]==="enter"&&i.type==="labelLink"&&(i._inactive=!0)}else if(o){if(A[e][0]==="enter"&&(i.type==="labelImage"||i.type==="labelLink")&&!i._balanced&&(r=e,i.type!=="labelLink")){n=2;break}}else i.type==="labelEnd"&&(o=e);const a={type:A[r][1].type==="labelLink"?"link":"image",start:{...A[r][1].start},end:{...A[A.length-1][1].end}},l={type:"label",start:{...A[r][1].start},end:{...A[o][1].end}},d={type:"labelText",start:{...A[r+n+2][1].end},end:{...A[o-2][1].start}};return s=[["enter",a,t],["enter",l,t]],s=nt(s,A.slice(r+1,r+n+3)),s=nt(s,[["enter",d,t]]),s=nt(s,Li(t.parser.constructs.insideSpan.null,A.slice(r+n+4,o-3),t)),s=nt(s,[["exit",d,t],A[o-2],A[o-1],["exit",l,t]]),s=nt(s,A.slice(o+1)),s=nt(s,[["exit",a,t]]),wt(A,r,A.length,s),A}function wp(A,t,e){const n=this;let i=n.events.length,r,o;for(;i--;)if((n.events[i][1].type==="labelImage"||n.events[i][1].type==="labelLink")&&!n.events[i][1]._balanced){r=n.events[i][1];break}return s;function s(p){return r?r._inactive?c(p):(o=n.parser.defined.includes(pe(n.sliceSerialize({start:r.end,end:n.now()}))),A.enter("labelEnd"),A.enter("labelMarker"),A.consume(p),A.exit("labelMarker"),A.exit("labelEnd"),a):e(p)}function a(p){return p===40?A.attempt(gp,d,o?d:c)(p):p===91?A.attempt(mp,d,o?l:c)(p):o?d(p):c(p)}function l(p){return A.attempt(qp,d,c)(p)}function d(p){return t(p)}function c(p){return r._balanced=!0,e(p)}}function yp(A,t,e){return n;function n(c){return A.enter("resource"),A.enter("resourceMarker"),A.consume(c),A.exit("resourceMarker"),i}function i(c){return YA(c)?Oe(A,r)(c):r(c)}function r(c){return c===41?d(c):ls(A,o,s,"resourceDestination","resourceDestinationLiteral","resourceDestinationLiteralMarker","resourceDestinationRaw","resourceDestinationString",32)(c)}function o(c){return YA(c)?Oe(A,a)(c):d(c)}function s(c){return e(c)}function a(c){return c===34||c===39||c===40?cs(A,l,e,"resourceTitle","resourceTitleMarker","resourceTitleString")(c):d(c)}function l(c){return YA(c)?Oe(A,d)(c):d(c)}function d(c){return c===41?(A.enter("resourceMarker"),A.consume(c),A.exit("resourceMarker"),A.exit("resource"),t):e(c)}}function bp(A,t,e){const n=this;return i;function i(s){return as.call(n,A,r,o,"reference","referenceMarker","referenceString")(s)}function r(s){return n.parser.defined.includes(pe(n.sliceSerialize(n.events[n.events.length-1][1]).slice(1,-1)))?t(s):e(s)}function o(s){return e(s)}}function Vp(A,t,e){return n;function n(r){return A.enter("reference"),A.enter("referenceMarker"),A.consume(r),A.exit("referenceMarker"),i}function i(r){return r===93?(A.enter("referenceMarker"),A.consume(r),A.exit("referenceMarker"),A.exit("reference"),t):e(r)}}const kp={name:"labelStartImage",resolveAll:Ei.resolveAll,tokenize:Ip};function Ip(A,t,e){const n=this;return i;function i(s){return A.enter("labelImage"),A.enter("labelImageMarker"),A.consume(s),A.exit("labelImageMarker"),r}function r(s){return s===91?(A.enter("labelMarker"),A.consume(s),A.exit("labelMarker"),A.exit("labelImage"),o):e(s)}function o(s){return s===94&&"_hiddenFootnoteSupport"in n.parser.constructs?e(s):t(s)}}const vp={name:"labelStartLink",resolveAll:Ei.resolveAll,tokenize:zp};function zp(A,t,e){const n=this;return i;function i(o){return A.enter("labelLink"),A.enter("labelMarker"),A.consume(o),A.exit("labelMarker"),A.exit("labelLink"),r}function r(o){return o===94&&"_hiddenFootnoteSupport"in n.parser.constructs?e(o):t(o)}}const Tn={name:"lineEnding",tokenize:Mp};function Mp(A,t){return e;function e(n){return A.enter("lineEnding"),A.consume(n),A.exit("lineEnding"),pA(A,t,"linePrefix")}}const en={name:"thematicBreak",tokenize:Dp};function Dp(A,t,e){let n=0,i;return r;function r(l){return A.enter("thematicBreak"),o(l)}function o(l){return i=l,s(l)}function s(l){return l===i?(A.enter("thematicBreakSequence"),a(l)):n>=3&&(l===null||$(l))?(A.exit("thematicBreak"),t(l)):e(l)}function a(l){return l===i?(A.consume(l),n++,a):(A.exit("thematicBreakSequence"),lA(l)?pA(A,s,"whitespace")(l):s(l))}}const GA={continuation:{tokenize:Op},exit:Sp,name:"list",tokenize:Bp},Cp={partial:!0,tokenize:Wp},Pp={partial:!0,tokenize:Hp};function Bp(A,t,e){const n=this,i=n.events[n.events.length-1];let r=i&&i[1].type==="linePrefix"?i[2].sliceSerialize(i[1],!0).length:0,o=0;return s;function s(u){const g=n.containerState.type||(u===42||u===43||u===45?"listUnordered":"listOrdered");if(g==="listUnordered"?!n.containerState.marker||u===n.containerState.marker:oi(u)){if(n.containerState.type||(n.containerState.type=g,A.enter(g,{_container:!0})),g==="listUnordered")return A.enter("listItemPrefix"),u===42||u===45?A.check(en,e,l)(u):l(u);if(!n.interrupt||u===49)return A.enter("listItemPrefix"),A.enter("listItemValue"),a(u)}return e(u)}function a(u){return oi(u)&&++o<10?(A.consume(u),a):(!n.interrupt||o<2)&&(n.containerState.marker?u===n.containerState.marker:u===41||u===46)?(A.exit("listItemValue"),l(u)):e(u)}function l(u){return A.enter("listItemMarker"),A.consume(u),A.exit("listItemMarker"),n.containerState.marker=n.containerState.marker||u,A.check(Pn,n.interrupt?e:d,A.attempt(Cp,p,c))}function d(u){return n.containerState.initialBlankLine=!0,r++,p(u)}function c(u){return lA(u)?(A.enter("listItemPrefixWhitespace"),A.consume(u),A.exit("listItemPrefixWhitespace"),p):e(u)}function p(u){return n.containerState.size=r+n.sliceSerialize(A.exit("listItemPrefix"),!0).length,t(u)}}function Op(A,t,e){const n=this;return n.containerState._closeFlow=void 0,A.check(Pn,i,r);function i(s){return n.containerState.furtherBlankLines=n.containerState.furtherBlankLines||n.containerState.initialBlankLine,pA(A,t,"listItemIndent",n.containerState.size+1)(s)}function r(s){return n.containerState.furtherBlankLines||!lA(s)?(n.containerState.furtherBlankLines=void 0,n.containerState.initialBlankLine=void 0,o(s)):(n.containerState.furtherBlankLines=void 0,n.containerState.initialBlankLine=void 0,A.attempt(Pp,t,o)(s))}function o(s){return n.containerState._closeFlow=!0,n.interrupt=void 0,pA(A,A.attempt(GA,t,e),"linePrefix",n.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(s)}}function Hp(A,t,e){const n=this;return pA(A,i,"listItemIndent",n.containerState.size+1);function i(r){const o=n.events[n.events.length-1];return o&&o[1].type==="listItemIndent"&&o[2].sliceSerialize(o[1],!0).length===n.containerState.size?t(r):e(r)}}function Sp(A){A.exit(this.containerState.type)}function Wp(A,t,e){const n=this;return pA(A,i,"listItemPrefixWhitespace",n.parser.constructs.disable.null.includes("codeIndented")?void 0:5);function i(r){const o=n.events[n.events.length-1];return!lA(r)&&o&&o[1].type==="listItemPrefixWhitespace"?t(r):e(r)}}const Er={name:"setextUnderline",resolveTo:Kp,tokenize:Lp};function Kp(A,t){let e=A.length,n,i,r;for(;e--;)if(A[e][0]==="enter"){if(A[e][1].type==="content"){n=e;break}A[e][1].type==="paragraph"&&(i=e)}else A[e][1].type==="content"&&A.splice(e,1),!r&&A[e][1].type==="definition"&&(r=e);const o={type:"setextHeading",start:{...A[n][1].start},end:{...A[A.length-1][1].end}};return A[i][1].type="setextHeadingText",r?(A.splice(i,0,["enter",o,t]),A.splice(r+1,0,["exit",A[n][1],t]),A[n][1].end={...A[r][1].end}):A[n][1]=o,A.push(["exit",o,t]),A}function Lp(A,t,e){const n=this;let i;return r;function r(l){let d=n.events.length,c;for(;d--;)if(n.events[d][1].type!=="lineEnding"&&n.events[d][1].type!=="linePrefix"&&n.events[d][1].type!=="content"){c=n.events[d][1].type==="paragraph";break}return!n.parser.lazy[n.now().line]&&(n.interrupt||c)?(A.enter("setextHeadingLine"),i=l,o(l)):e(l)}function o(l){return A.enter("setextHeadingLineSequence"),s(l)}function s(l){return l===i?(A.consume(l),s):(A.exit("setextHeadingLineSequence"),lA(l)?pA(A,a,"lineSuffix")(l):a(l))}function a(l){return l===null||$(l)?(A.exit("setextHeadingLine"),t(l)):e(l)}}const Ep={tokenize:Zp};function Zp(A){const t=this,e=A.attempt(Pn,n,A.attempt(this.parser.constructs.flowInitial,i,pA(A,A.attempt(this.parser.constructs.flow,i,A.attempt(Nu,i)),"linePrefix")));return e;function n(r){if(r===null){A.consume(r);return}return A.enter("lineEndingBlank"),A.consume(r),A.exit("lineEndingBlank"),t.currentConstruct=void 0,e}function i(r){if(r===null){A.consume(r);return}return A.enter("lineEnding"),A.consume(r),A.exit("lineEnding"),t.currentConstruct=void 0,e}}const Gp={resolveAll:us()},Tp=ds("string"),Qp=ds("text");function ds(A){return{resolveAll:us(A==="text"?Yp:void 0),tokenize:t};function t(e){const n=this,i=this.parser.constructs[A],r=e.attempt(i,o,s);return o;function o(d){return l(d)?r(d):s(d)}function s(d){if(d===null){e.consume(d);return}return e.enter("data"),e.consume(d),a}function a(d){return l(d)?(e.exit("data"),r(d)):(e.consume(d),a)}function l(d){if(d===null)return!0;const c=i[d];let p=-1;if(c)for(;++p<c.length;){const u=c[p];if(!u.previous||u.previous.call(n,n.previous))return!0}return!1}}}function us(A){return t;function t(e,n){let i=-1,r;for(;++i<=e.length;)r===void 0?e[i]&&e[i][1].type==="data"&&(r=i,i++):(!e[i]||e[i][1].type!=="data")&&(i!==r+2&&(e[r][1].end=e[i-1][1].end,e.splice(r+2,i-r-2),i=r+2),r=void 0);return A?A(e,n):e}}function Yp(A,t){let e=0;for(;++e<=A.length;)if((e===A.length||A[e][1].type==="lineEnding")&&A[e-1][1].type==="data"){const n=A[e-1][1],i=t.sliceStream(n);let r=i.length,o=-1,s=0,a;for(;r--;){const l=i[r];if(typeof l=="string"){for(o=l.length;l.charCodeAt(o-1)===32;)s++,o--;if(o)break;o=-1}else if(l===-2)a=!0,s++;else if(l!==-1){r++;break}}if(t._contentTypeTextTrailing&&e===A.length&&(s=0),s){const l={type:e===A.length||a||s<2?"lineSuffix":"hardBreakTrailing",start:{_bufferIndex:r?o:n.start._bufferIndex+o,_index:n.start._index+r,line:n.end.line,column:n.end.column-s,offset:n.end.offset-s},end:{...n.end}};n.end={...l.start},n.start.offset===n.end.offset?Object.assign(n,l):(A.splice(e,0,["enter",l,t],["exit",l,t]),e+=2)}e++}return A}const Np={42:GA,43:GA,45:GA,48:GA,49:GA,50:GA,51:GA,52:GA,53:GA,54:GA,55:GA,56:GA,57:GA,62:is},Fp={91:Xu},Rp={[-2]:Gn,[-1]:Gn,32:Gn},Up={35:ep,42:en,45:[Er,en],60:op,61:Er,95:en,96:Kr,126:Kr},jp={38:os,92:rs},Xp={[-5]:Tn,[-4]:Tn,[-3]:Tn,33:kp,38:os,42:si,60:[vu,pp],91:vp,92:[Ap,rs],93:Ei,95:si,96:Eu},Jp={null:[si,Gp]},_p={null:[42,95]},$p={null:[]},Af=Object.freeze(Object.defineProperty({__proto__:null,attentionMarkers:_p,contentInitial:Fp,disable:$p,document:Np,flow:Up,flowInitial:Rp,insideSpan:Jp,string:jp,text:Xp},Symbol.toStringTag,{value:"Module"}));function tf(A,t,e){let n={_bufferIndex:-1,_index:0,line:e&&e.line||1,column:e&&e.column||1,offset:e&&e.offset||0};const i={},r=[];let o=[],s=[];const a={attempt:v(C),check:v(w),consume:D,enter:M,exit:k,interrupt:v(w,{interrupt:!0})},l={code:null,containerState:{},defineSkip:f,events:[],now:g,parser:A,previous:null,sliceSerialize:p,sliceStream:u,write:c};let d=t.tokenize.call(l,a);return t.resolveAll&&r.push(t),l;function c(x){return o=nt(o,x),m(),o[o.length-1]!==null?[]:(y(t,0),l.events=Li(r,l.events,l),l.events)}function p(x,O){return nf(u(x),O)}function u(x){return ef(o,x)}function g(){const{_bufferIndex:x,_index:O,line:H,column:B,offset:S}=n;return{_bufferIndex:x,_index:O,line:H,column:B,offset:S}}function f(x){i[x.line]=x.column,V()}function m(){let x;for(;n._index<o.length;){const O=o[n._index];if(typeof O=="string")for(x=n._index,n._bufferIndex<0&&(n._bufferIndex=0);n._index===x&&n._bufferIndex<O.length;)h(O.charCodeAt(n._bufferIndex));else h(O)}}function h(x){d=d(x)}function D(x){$(x)?(n.line++,n.column=1,n.offset+=x===-3?2:1,V()):x!==-1&&(n.column++,n.offset++),n._bufferIndex<0?n._index++:(n._bufferIndex++,n._bufferIndex===o[n._index].length&&(n._bufferIndex=-1,n._index++)),l.previous=x}function M(x,O){const H=O||{};return H.type=x,H.start=g(),l.events.push(["enter",H,l]),s.push(H),H}function k(x){const O=s.pop();return O.end=g(),l.events.push(["exit",O,l]),O}function C(x,O){y(x,O.from)}function w(x,O){O.restore()}function v(x,O){return H;function H(B,S,Q){let N,E,R,q;return Array.isArray(B)?oA(B):"tokenize"in B?oA([B]):nA(B);function nA(dA){return Rt;function Rt(W){const G=W!==null&&dA[W],K=W!==null&&dA.null,P=[...Array.isArray(G)?G:G?[G]:[],...Array.isArray(K)?K:K?[K]:[]];return oA(P)(W)}}function oA(dA){return N=dA,E=0,dA.length===0?Q:b(dA[E])}function b(dA){return Rt;function Rt(W){return q=I(),R=dA,dA.partial||(l.currentConstruct=dA),dA.name&&l.parser.constructs.disable.null.includes(dA.name)?IA():dA.tokenize.call(O?Object.assign(Object.create(l),O):l,a,hA,IA)(W)}}function hA(dA){return x(R,q),S}function IA(dA){return q.restore(),++E<N.length?b(N[E]):Q}}}function y(x,O){x.resolveAll&&!r.includes(x)&&r.push(x),x.resolve&&wt(l.events,O,l.events.length-O,x.resolve(l.events.slice(O),l)),x.resolveTo&&(l.events=x.resolveTo(l.events,l))}function I(){const x=g(),O=l.previous,H=l.currentConstruct,B=l.events.length,S=Array.from(s);return{from:B,restore:Q};function Q(){n=x,l.previous=O,l.currentConstruct=H,l.events.length=B,s=S,V()}}function V(){n.line in i&&n.column<2&&(n.column=i[n.line],n.offset+=i[n.line]-1)}}function ef(A,t){const e=t.start._index,n=t.start._bufferIndex,i=t.end._index,r=t.end._bufferIndex;let o;if(e===i)o=[A[e].slice(n,r)];else{if(o=A.slice(e,i),n>-1){const s=o[0];typeof s=="string"?o[0]=s.slice(n):o.shift()}r>0&&o.push(A[i].slice(0,r))}return o}function nf(A,t){let e=-1;const n=[];let i;for(;++e<A.length;){const r=A[e];let o;if(typeof r=="string")o=r;else switch(r){case-5:{o="\r";break}case-4:{o=`
`;break}case-3:{o=`\r
`;break}case-2:{o=t?" ":"	";break}case-1:{if(!t&&i)continue;o=" ";break}default:o=String.fromCharCode(r)}i=r===-2,n.push(o)}return n.join("")}function rf(A){const n={constructs:du([Af,...{}.extensions||[]]),content:i(xu),defined:[],document:i(yu),flow:i(Ep),lazy:{},string:i(Tp),text:i(Qp)};return n;function i(r){return o;function o(s){return tf(n,r,s)}}}function of(A){for(;!ss(A););return A}const Zr=/[\0\t\n\r]/g;function sf(){let A=1,t="",e=!0,n;return i;function i(r,o,s){const a=[];let l,d,c,p,u;for(r=t+(typeof r=="string"?r.toString():new TextDecoder(o||void 0).decode(r)),c=0,t="",e&&(r.charCodeAt(0)===65279&&c++,e=void 0);c<r.length;){if(Zr.lastIndex=c,l=Zr.exec(r),p=l&&l.index!==void 0?l.index:r.length,u=r.charCodeAt(p),!l){t=r.slice(c);break}if(u===10&&c===p&&n)a.push(-3),n=void 0;else switch(n&&(a.push(-5),n=void 0),c<p&&(a.push(r.slice(c,p)),A+=p-c),u){case 0:{a.push(65533),A++;break}case 9:{for(d=Math.ceil(A/4)*4,a.push(-2);A++<d;)a.push(-1);break}case 10:{a.push(-4),A=1;break}default:n=!0,A=1}c=p+1}return s&&(n&&a.push(-5),t&&a.push(t),a.push(null)),a}}const lf=/\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;function af(A){return A.replace(lf,cf)}function cf(A,t,e){if(t)return t;if(e.charCodeAt(0)===35){const i=e.charCodeAt(1),r=i===120||i===88;return ns(e.slice(r?2:1),r?16:10)}return Ki(e)||A}function nn(A){return!A||typeof A!="object"?"":"position"in A||"type"in A?Gr(A.position):"start"in A||"end"in A?Gr(A):"line"in A||"column"in A?li(A):""}function li(A){return Tr(A&&A.line)+":"+Tr(A&&A.column)}function Gr(A){return li(A&&A.start)+"-"+li(A&&A.end)}function Tr(A){return A&&typeof A=="number"?A:1}const ps={}.hasOwnProperty;function df(A,t,e){return uf()(of(rf().document().write(sf()(A,t,!0))))}function uf(A){const t={transforms:[],canContainEols:["emphasis","fragment","heading","paragraph","strong"],enter:{autolink:r(Ae),autolinkProtocol:I,autolinkEmail:I,atxHeading:r(vA),blockQuote:r(K),characterEscape:I,characterReference:I,codeFenced:r(P),codeFencedFenceInfo:o,codeFencedFenceMeta:o,codeIndented:r(P,o),codeText:r(T,o),codeTextData:I,data:I,codeFlowValue:I,definition:r(j),definitionDestinationString:o,definitionLabelString:o,definitionTitleString:o,emphasis:r(rA),hardBreakEscape:r(At),hardBreakTrailing:r(At),htmlFlow:r(lt,o),htmlFlowData:I,htmlText:r(lt,o),htmlTextData:I,image:r(Vt),label:o,link:r(Ae),listItem:r(kt),listItemValue:p,listOrdered:r(te,c),listUnordered:r(te),paragraph:r(It),reference:b,referenceString:o,resourceDestinationString:o,resourceTitleString:o,setextHeading:r(vA),strong:r(ee),thematicBreak:r(On)},exit:{atxHeading:a(),atxHeadingSequence:C,autolink:a(),autolinkEmail:G,autolinkProtocol:W,blockQuote:a(),characterEscapeValue:V,characterReferenceMarkerHexadecimal:IA,characterReferenceMarkerNumeric:IA,characterReferenceValue:dA,characterReference:Rt,codeFenced:a(m),codeFencedFence:f,codeFencedFenceInfo:u,codeFencedFenceMeta:g,codeFlowValue:V,codeIndented:a(h),codeText:a(S),codeTextData:V,data:V,definition:a(),definitionDestinationString:k,definitionLabelString:D,definitionTitleString:M,emphasis:a(),hardBreakEscape:a(O),hardBreakTrailing:a(O),htmlFlow:a(H),htmlFlowData:V,htmlText:a(B),htmlTextData:V,image:a(N),label:R,labelText:E,lineEnding:x,link:a(Q),listItem:a(),listOrdered:a(),listUnordered:a(),paragraph:a(),referenceString:hA,resourceDestinationString:q,resourceTitleString:nA,resource:oA,setextHeading:a(y),setextHeadingLineSequence:v,setextHeadingText:w,strong:a(),thematicBreak:a()}};fs(t,{}.mdastExtensions||[]);const e={};return n;function n(Z){let F={type:"root",children:[]};const AA={stack:[F],tokenStack:[],config:t,enter:s,exit:l,buffer:o,resume:d,data:e},iA=[];let aA=-1;for(;++aA<Z.length;)if(Z[aA][1].type==="listOrdered"||Z[aA][1].type==="listUnordered")if(Z[aA][0]==="enter")iA.push(aA);else{const LA=iA.pop();aA=i(Z,LA,aA)}for(aA=-1;++aA<Z.length;){const LA=t[Z[aA][0]];ps.call(LA,Z[aA][1].type)&&LA[Z[aA][1].type].call(Object.assign({sliceSerialize:Z[aA][2].sliceSerialize},AA),Z[aA][1])}if(AA.tokenStack.length>0){const LA=AA.tokenStack[AA.tokenStack.length-1];(LA[1]||Qr).call(AA,void 0,LA[0])}for(F.position={start:Et(Z.length>0?Z[0][1].start:{line:1,column:1,offset:0}),end:Et(Z.length>0?Z[Z.length-2][1].end:{line:1,column:1,offset:0})},aA=-1;++aA<t.transforms.length;)F=t.transforms[aA](F)||F;return F}function i(Z,F,AA){let iA=F-1,aA=-1,LA=!1,at,tt,St,EA;for(;++iA<=AA;){const HA=Z[iA];switch(HA[1].type){case"listUnordered":case"listOrdered":case"blockQuote":{HA[0]==="enter"?aA++:aA--,EA=void 0;break}case"lineEndingBlank":{HA[0]==="enter"&&(at&&!EA&&!aA&&!St&&(St=iA),EA=void 0);break}case"linePrefix":case"listItemValue":case"listItemMarker":case"listItemPrefix":case"listItemPrefixWhitespace":break;default:EA=void 0}if(!aA&&HA[0]==="enter"&&HA[1].type==="listItemPrefix"||aA===-1&&HA[0]==="exit"&&(HA[1].type==="listUnordered"||HA[1].type==="listOrdered")){if(at){let Wt=iA;for(tt=void 0;Wt--;){const rt=Z[Wt];if(rt[1].type==="lineEnding"||rt[1].type==="lineEndingBlank"){if(rt[0]==="exit")continue;tt&&(Z[tt][1].type="lineEndingBlank",LA=!0),rt[1].type="lineEnding",tt=Wt}else if(!(rt[1].type==="linePrefix"||rt[1].type==="blockQuotePrefix"||rt[1].type==="blockQuotePrefixWhitespace"||rt[1].type==="blockQuoteMarker"||rt[1].type==="listItemIndent"))break}St&&(!tt||St<tt)&&(at._spread=!0),at.end=Object.assign({},tt?Z[tt][1].start:HA[1].end),Z.splice(tt||iA,0,["exit",at,HA[2]]),iA++,AA++}if(HA[1].type==="listItemPrefix"){const Wt={type:"listItem",_spread:!1,start:Object.assign({},HA[1].start),end:void 0};at=Wt,Z.splice(iA,0,["enter",Wt,HA[2]]),iA++,AA++,St=void 0,EA=!0}}}return Z[F][1]._spread=LA,AA}function r(Z,F){return AA;function AA(iA){s.call(this,Z(iA),iA),F&&F.call(this,iA)}}function o(){this.stack.push({type:"fragment",children:[]})}function s(Z,F,AA){this.stack[this.stack.length-1].children.push(Z),this.stack.push(Z),this.tokenStack.push([F,AA||void 0]),Z.position={start:Et(F.start),end:void 0}}function a(Z){return F;function F(AA){Z&&Z.call(this,AA),l.call(this,AA)}}function l(Z,F){const AA=this.stack.pop(),iA=this.tokenStack.pop();if(iA)iA[0].type!==Z.type&&(F?F.call(this,Z,iA[0]):(iA[1]||Qr).call(this,Z,iA[0]));else throw new Error("Cannot close `"+Z.type+"` ("+nn({start:Z.start,end:Z.end})+"): it’s not open");AA.position.end=Et(Z.end)}function d(){return au(this.stack.pop())}function c(){this.data.expectingFirstListItemValue=!0}function p(Z){if(this.data.expectingFirstListItemValue){const F=this.stack[this.stack.length-2];F.start=Number.parseInt(this.sliceSerialize(Z),10),this.data.expectingFirstListItemValue=void 0}}function u(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.lang=Z}function g(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.meta=Z}function f(){this.data.flowCodeInside||(this.buffer(),this.data.flowCodeInside=!0)}function m(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.value=Z.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g,""),this.data.flowCodeInside=void 0}function h(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.value=Z.replace(/(\r?\n|\r)$/g,"")}function D(Z){const F=this.resume(),AA=this.stack[this.stack.length-1];AA.label=F,AA.identifier=pe(this.sliceSerialize(Z)).toLowerCase()}function M(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.title=Z}function k(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.url=Z}function C(Z){const F=this.stack[this.stack.length-1];if(!F.depth){const AA=this.sliceSerialize(Z).length;F.depth=AA}}function w(){this.data.setextHeadingSlurpLineEnding=!0}function v(Z){const F=this.stack[this.stack.length-1];F.depth=this.sliceSerialize(Z).codePointAt(0)===61?1:2}function y(){this.data.setextHeadingSlurpLineEnding=void 0}function I(Z){const AA=this.stack[this.stack.length-1].children;let iA=AA[AA.length-1];(!iA||iA.type!=="text")&&(iA=Ht(),iA.position={start:Et(Z.start),end:void 0},AA.push(iA)),this.stack.push(iA)}function V(Z){const F=this.stack.pop();F.value+=this.sliceSerialize(Z),F.position.end=Et(Z.end)}function x(Z){const F=this.stack[this.stack.length-1];if(this.data.atHardBreak){const AA=F.children[F.children.length-1];AA.position.end=Et(Z.end),this.data.atHardBreak=void 0;return}!this.data.setextHeadingSlurpLineEnding&&t.canContainEols.includes(F.type)&&(I.call(this,Z),V.call(this,Z))}function O(){this.data.atHardBreak=!0}function H(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.value=Z}function B(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.value=Z}function S(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.value=Z}function Q(){const Z=this.stack[this.stack.length-1];if(this.data.inReference){const F=this.data.referenceType||"shortcut";Z.type+="Reference",Z.referenceType=F,delete Z.url,delete Z.title}else delete Z.identifier,delete Z.label;this.data.referenceType=void 0}function N(){const Z=this.stack[this.stack.length-1];if(this.data.inReference){const F=this.data.referenceType||"shortcut";Z.type+="Reference",Z.referenceType=F,delete Z.url,delete Z.title}else delete Z.identifier,delete Z.label;this.data.referenceType=void 0}function E(Z){const F=this.sliceSerialize(Z),AA=this.stack[this.stack.length-2];AA.label=af(F),AA.identifier=pe(F).toLowerCase()}function R(){const Z=this.stack[this.stack.length-1],F=this.resume(),AA=this.stack[this.stack.length-1];if(this.data.inReference=!0,AA.type==="link"){const iA=Z.children;AA.children=iA}else AA.alt=F}function q(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.url=Z}function nA(){const Z=this.resume(),F=this.stack[this.stack.length-1];F.title=Z}function oA(){this.data.inReference=void 0}function b(){this.data.referenceType="collapsed"}function hA(Z){const F=this.resume(),AA=this.stack[this.stack.length-1];AA.label=F,AA.identifier=pe(this.sliceSerialize(Z)).toLowerCase(),this.data.referenceType="full"}function IA(Z){this.data.characterReferenceType=Z.type}function dA(Z){const F=this.sliceSerialize(Z),AA=this.data.characterReferenceType;let iA;AA?(iA=ns(F,AA==="characterReferenceMarkerNumeric"?10:16),this.data.characterReferenceType=void 0):iA=Ki(F);const aA=this.stack[this.stack.length-1];aA.value+=iA}function Rt(Z){const F=this.stack.pop();F.position.end=Et(Z.end)}function W(Z){V.call(this,Z);const F=this.stack[this.stack.length-1];F.url=this.sliceSerialize(Z)}function G(Z){V.call(this,Z);const F=this.stack[this.stack.length-1];F.url="mailto:"+this.sliceSerialize(Z)}function K(){return{type:"blockquote",children:[]}}function P(){return{type:"code",lang:null,meta:null,value:""}}function T(){return{type:"inlineCode",value:""}}function j(){return{type:"definition",identifier:"",label:null,title:null,url:""}}function rA(){return{type:"emphasis",children:[]}}function vA(){return{type:"heading",depth:0,children:[]}}function At(){return{type:"break"}}function lt(){return{type:"html",value:""}}function Vt(){return{type:"image",title:null,url:"",alt:null}}function Ae(){return{type:"link",title:null,url:"",children:[]}}function te(Z){return{type:"list",ordered:Z.type==="listOrdered",start:null,spread:Z._spread,children:[]}}function kt(Z){return{type:"listItem",spread:Z._spread,checked:null,children:[]}}function It(){return{type:"paragraph",children:[]}}function ee(){return{type:"strong",children:[]}}function Ht(){return{type:"text",value:""}}function On(){return{type:"thematicBreak"}}}function Et(A){return{line:A.line,column:A.column,offset:A.offset}}function fs(A,t){let e=-1;for(;++e<t.length;){const n=t[e];Array.isArray(n)?fs(A,n):pf(A,n)}}function pf(A,t){let e;for(e in t)if(ps.call(t,e))switch(e){case"canContainEols":{const n=t[e];n&&A[e].push(...n);break}case"transforms":{const n=t[e];n&&A[e].push(...n);break}case"enter":case"exit":{const n=t[e];n&&Object.assign(A[e],n);break}}}function Qr(A,t){throw A?new Error("Cannot close `"+A.type+"` ("+nn({start:A.start,end:A.end})+"): a different token (`"+t.type+"`, "+nn({start:t.start,end:t.end})+") is open"):new Error("Cannot close document, a token (`"+t.type+"`, "+nn({start:t.start,end:t.end})+") is still open")}function Zi(A){const t=[];for(const e of A)switch(e.type){case"text":e.value&&t.push({kind:"text",text:e.value});break;case"inlineCode":e.value&&t.push({kind:"code",text:e.value});break;case"strong":{const n=He(e.children??[]);n&&t.push({kind:"bold",text:n});break}case"emphasis":{const n=He(e.children??[]);n&&t.push({kind:"italic",text:n});break}case"link":{const n=He(e.children??[])||(e.url??"");e.url&&t.push({kind:"link",text:n,href:e.url});break}case"image":e.alt&&t.push({kind:"text",text:e.alt});break;case"break":t.push({kind:"text",text:" "});break;case"html":break;default:e.children?t.push(...Zi(e.children)):e.value&&t.push({kind:"text",text:e.value})}return t.filter(e=>e.text.length>0)}function He(A){return A.map(t=>t.value!==void 0?t.value:t.children?He(t.children):"").join("")}function Gi(A,t,e){switch(A.type){case"heading":{const n=A,i=n.depth<=1?1:2,r=He(n.children);r&&e.push({type:"heading",level:i,text:r,align:"left"});break}case"paragraph":{const n=A;if(n.children.length===1&&n.children[0].type==="image"){const r=n.children[0];e.push({type:"image",src:r.url??"",alt:r.alt??"",align:"center"});break}const i=Zi(n.children);i.length>0&&e.push({type:"paragraph",segments:i,align:"left"});break}case"list":{gs(A.children,t,e);break}case"thematicBreak":e.push({type:"hr"});break;case"blockquote":{const n=A;for(const i of n.children)Gi(i,t,e);break}case"code":break;case"table":e.push({type:"hr"});break}}function gs(A,t,e){for(const n of A){const i=[],r=[];for(const o of n.children)if(o.type==="paragraph"){const s=o;i.push(...Zi(s.children))}else o.type==="list"?r.push(o):Gi(o,t,e);i.length>0&&e.push({type:"listItem",segments:i,indent:t});for(const o of r)gs(o.children,t+1,e)}}function ff(A){const t=df(A),e=[];for(const n of t.children)Gi(n,0,e);return e}function gf(A){const t=[];for(const e of A)e.type==="image"&&e.src&&t.push(e.src);return t}const ms=8,qs=4,hs=6,xs=2,ws=4,ys=2,de=12,ai=6,bs=4,Vs=6;function wn(A,t){const e=[];for(const n of A){let i=t;n.kind==="bold"&&(i="menu");const r=n.kind==="link",o=n.kind==="link"?n.href:void 0;for(const s of n.text.split(/(\s+)/))s&&e.push({text:s,font:i,underline:r,href:o})}return e}function fe(A,t){var r;const e=[];let n=[],i=0;for(const o of A){const s=eA(o.text,o.font);if(/^\s+$/.test(o.text)){n.length>0&&(n.push(o),i+=s);continue}if(i+s>t&&n.length>0){for(;n.length>0&&/^\s+$/.test(n[n.length-1].text);)i-=eA(n.pop().text,((r=n[0])==null?void 0:r.font)??"body");e.push(n),n=[],i=0}n.push(o),i+=s}if(n.length>0){for(;n.length>0&&/^\s+$/.test(n[n.length-1].text);)n.pop();n.length>0&&e.push(n)}return e}function Yr(A){let t=0;for(const e of A)t+=eA(e.text,e.font);return t}function Qn(A,t,e,n){switch(n){case"center":return e+Math.floor((t-A)/2);case"right":return e+t-A;default:return e}}function ks(A,t){return A.split(/(\s+)/).filter(Boolean).map(e=>({text:e,font:t,underline:!1,href:void 0}))}function mf(A,t,e,n){const i=A.width-e*2,r=[];let o=e;for(const s of t)switch(s.type){case"heading":{const a=s.level===1,l="menu",d=KA(l);o+=a?ms:hs;const c=fe(ks(s.text,l),i);for(const p of c){const u=Yr(p);let g=Qn(u,i,e,s.align);for(const f of p)A.drawText(f.text,g,o,{font:l,color:z}),g+=eA(f.text,l);o+=d}o+=a?qs:xs;break}case"paragraph":{const a="body",l=KA(a),d=fe(wn(s.segments,a),i);for(const c of d){const p=Yr(c);let u=Qn(p,i,e,s.align);for(const g of c){const f=eA(g.text,g.font);A.drawText(g.text,u,o,{font:g.font,color:z}),g.underline&&A.drawHLine(u,o+l-2,f,z),g.href&&r.push({x:u,y:o,w:f,h:l,href:g.href}),u+=f}o+=l}o+=ws;break}case"listItem":{const a="body",l=KA(a),d=s.indent*de,c=eA("- ",a);A.drawText("-",e+de+d-c,o,{font:a,color:z});const p=fe(wn(s.segments,a),i-de-d);for(const u of p){let g=e+de+d;for(const f of u){const m=eA(f.text,f.font);A.drawText(f.text,g,o,{font:f.font,color:z}),f.underline&&A.drawHLine(g,o+l-2,m,z),f.href&&r.push({x:g,y:o,w:m,h:l,href:f.href}),g+=m}o+=l}o+=ys;break}case"hr":o+=ai,A.drawDottedHLine(e,o,i,z),o+=1+ai;break;case"image":{const a=n.get(s.src);if(a){const l=Qn(a.width,i,e,s.align);A.blit(a,l,o),o+=a.height+bs}break}case"spacer":o+=s.height;break;case"br":o+=Vs;break}return r}function qf(A,t,e,n){const i=t-e*2;let r=0;for(const o of A)switch(o.type){case"heading":{const s=o.level===1;r+=s?ms:hs;const a=fe(ks(o.text,"menu"),i);r+=a.length*KA("menu"),r+=s?qs:xs;break}case"paragraph":{const s="body",a=fe(wn(o.segments,s),i);r+=a.length*KA(s)+ws;break}case"listItem":{const s="body",a=o.indent*de,l=fe(wn(o.segments,s),i-de-a);r+=l.length*KA(s)+ys;break}case"hr":r+=ai*2+1;break;case"image":{const s=n==null?void 0:n.get(o.src);s&&(r+=s.height+bs);break}case"spacer":r+=o.height;break;case"br":r+=Vs;break}return r}function hf(A,t,e,n,i,r){const{margin:o}=r;if(e==="loading"){const s="Loading…",a=eA(s,"body");return A.drawText(s,Math.floor((A.width-a)/2),Math.floor(A.height/2),{font:"body",color:z}),[]}return e==="error"?(A.drawText("Could not load page.",o,o,{font:"menu",color:z}),n&&A.drawText(n,o,o+KA("menu")+4,{font:"body",color:z}),[]):t.length===0?[]:mf(A,t,o,i)}function xf(A,t,e,n){return qf(A,t,e,n)}function wf(A,t,e){for(const n of A)if(t>=n.x&&t<n.x+n.w&&e>=n.y&&e<n.y+n.h)return n;return null}function yf(A,t,e){for(const n of gf(A))t.load(n,e,e).catch(()=>{})}const bf=!1;async function Nr(A,t,e,n,i){try{let r,o="";if(!bf){const a=await fetch("/api/browse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:A})});if(!a.ok){const d=await a.json().catch(()=>({error:a.statusText}));i(d.error||`HTTP ${a.status}`);return}const l=await a.json();r=l.markdown,o=l.title}const s=ff(r);yf(s,t,e),n(s,o)}catch(r){const o=r instanceof Error?r.message:String(r);i(`Network error: ${o}`)}}function Is(A){const t=A.trim();return t?/^https?:\/\//i.test(t)?t:/^[^\s]+\.[^\s]+$/.test(t)&&!t.includes(" ")?`https://${t}`:null:null}function Vf(A,t){if(t)try{return new URL(A,t).toString()}catch{}return Is(A)}const Xe=28,se=8,zt="",kf={id:"safari",title:"Safari",icon:"icon/safari",defaultSize:{width:384,height:220},minSize:{width:200,height:220},scrollable:!0,resizable:!0,render(A,t,e){const n=e._sprites,[i,r]=A.useState(ft(zt)),[o,s]=A.useState(zt),[a,l]=A.useState([zt]),[d,c]=A.useState(0),p=A.useRef([]),u=A.useRef(!1),[g,f]=A.useState([]),[m,h]=A.useState("idle"),[D,M]=A.useState(null);t.clear(Y),t.fillRect(0,0,t.width,Xe,Y),t.drawHLine(0,Xe-1,t.width,z);const k=t.getWindow();if(k!==null){u.current||(xA(k,_(4,4,24,24),"<",!0,0,0,1,0,0),xA(k,_(4,24,24,44),">",!0,0,0,1,0,0),u.current=!0);const C=t.width-se*2,w=I=>{s(I),r(ft(I)),h("loading"),f([]),M(null),A.scheduleRender(),Nr(I,n,C,V=>{f(V),h("idle"),A.scheduleRender()},V=>{h("error"),M(V),A.scheduleRender()})},v=k.controlList[0],y=k.controlList[1];v&&(v.ref.contrlAction=(I,V)=>{if(V===kA&&d>0){const x=d-1;c(x),w(a[x])}},v.ref.contrlHilite=d<=0?255:0),y&&(y.ref.contrlAction=(I,V)=>{if(V===kA&&d<a.length-1){const x=d+1;c(x),w(a[x])}},y.ref.contrlHilite=d>=a.length-1?255:0),Nt(k,t.port)}t.drawTextInput(i,50,6,t.width-58,16,{id:"url-input",onChange:()=>{r(C=>({...C,focused:!0})),A.scheduleRender()}}),t.drawScrollableContent(C=>{if(!o){const w="Enter a URL above to browse the web.",v=eA(w,"body");C.drawText(w,Math.max(se,Math.floor((C.width-v)/2)),Math.floor(C.height/2)-KA("body"),{font:"body",color:z}),p.current=[];return}p.current=hf(C,g,m,D,n,{width:C.width,margin:se})})},getContentTopInset(A,t,e){return Xe},onEvent(A,t,e,n){const i=e._sprites,[r,o]=A.useState(ft(zt)),[s,a]=A.useState(zt),[l,d]=A.useState([zt]),[c,p]=A.useState(0),u=A.useRef([]);A.useRef(!1);const[,g]=A.useState([]),[,f]=A.useState("idle"),[,m]=A.useState(null),h=D=>{const M=Is(D);if(!M)return;const k=l.slice(0,c+1);k.push(D),d(k),p(k.length-1),a(D);const C=ft(D);C.focused=!1,o(C),f("loading"),g([]),m(null),A.scheduleRender();const w=n.width-se*2;Nr(M,i,w,(v,y)=>{g(v),f("idle"),A.scheduleRender()},v=>{f("error"),m(v),A.scheduleRender()})};if(t.type==="paste"&&t.pasteText){r.focused&&Bi(r,t.pasteText)&&o({...r});return}if(t.type==="keyDown"){if(t.key==="Enter"&&r.focused){h(r.value.trim());return}r.focused&&Oi(r,t.key,t.code,t.shiftKey,t.metaKey,t.ctrlKey)&&o({...r})}if(t.type==="mouseDown"||t.type==="doubleClick"){if(t.contentRegion==="scrollable"||t.contentRegion===void 0&&t.y>=Xe){const M=wf(u.current,t.x,t.y);if(M){const k=Vf(M.href,s);k&&h(k);return}}o({...r,focused:!1})}t.type},getContentHeight(A,t,e){const n=t._sprites;A.useState(ft(zt)),A.useState(zt),A.useState([zt]),A.useState(0),A.useRef([]),A.useRef(!1);const[i]=A.useState([]),[r]=A.useState("idle");return A.useState(null),r!=="idle"||i.length===0?200:xf(i,e.width,se,n)+se*2}},If={id:"picture",title:"Picture",icon:"icon/MacFlim",defaultSize:{width:256,height:256},scrollable:!0,render(A,t,e){const n=e._sprites,i=e.src??"",r=A.useRef(!1);t.clear(Y);const o=t.getWindow();if(o!==null){if(!r.current){const a=eA("Print","menu")+20,l=_(4,4,24,4+a),d=xA(o,l,"Print",!0,0,0,1,0,0);d.ref.contrlAction=(c,p)=>{},r.current=!0}Nt(o,t.port)}const s=n==null?void 0:n.get(i);s&&t.blit(s,0,28)},getContentHeight(A,t){return(t.height??200)+32}},ze=42,Zt=20,vf=28,zf="https://raw.githubusercontent.com/mockintosh/app-registry/main/registry.json";async function Fr(){try{const A=await fetch(zf);return A.ok?(await A.json()).apps??[]:[]}catch{return[]}}function Yn(A){if(!A||A.type==="free")return"Free";const t=((A.amount_cents??0)/100).toFixed(2);if((A.currency??"usd").toUpperCase(),A.type==="subscription"){const e=A.interval==="year"?"/yr":"/mo";return`$${t}${e}`}return`$${t}`}const Mf={id:"appstore",title:"App Store",icon:"icon/appstore-smr-32x32",defaultSize:{width:320,height:280},scrollable:!0,resizable:!0,minSize:{width:240,height:180},render(A,t,e){const[n,i]=A.useState("browse"),[r,o]=A.useState([]),[s,a]=A.useState(!0),[l,d]=A.useState(null),[c,p]=A.useState(null),[u,g]=A.useState(new Set),[f,m]=A.useState(null),h=A.useRef("");A.useEffect(()=>{Fr().then(V=>{o(V),a(!1)}).catch(()=>{d("Failed to load app catalog."),a(!1)})},[]),t.clear(Y),t.drawText("App Store",t.width/2-26,4,{font:"menu",color:z}),t.drawHLine(0,16,t.width,z);const D=n==="browse",M=n==="installed",k=t.width/2;D?(t.fillRect(0,17,k,Zt-1,z),t.drawText("Browse",k/2-16,20,{font:"body",color:Y})):t.drawText("Browse",k/2-16,20,{font:"body",color:z}),t.hitRegion("tab-browse",{x:0,y:17,w:k,h:Zt},{onMouseDown:()=>{i("browse"),p(null)}}),M?(t.fillRect(k,17,k,Zt-1,z),t.drawText("Installed",k+k/2-22,20,{font:"body",color:Y})):t.drawText("Installed",k+k/2-22,20,{font:"body",color:z}),t.hitRegion("tab-installed",{x:k,y:17,w:k,h:Zt},{onMouseDown:()=>{i("installed"),p(null)}}),t.drawHLine(0,17+Zt,t.width,z),t.drawVLine(k,17,Zt,z);const C=17+Zt+1,w=n==="browse"?r:r.filter(V=>u.has(V.id));if(s){t.drawText("Loading app catalog...",16,C+20,{font:"body",color:z});return}if(l){t.drawText(l,16,C+20,{font:"body",color:z});return}if(w.length===0){const V=n==="browse"?"No apps available yet.":"No apps installed.";t.drawText(V,16,C+20,{font:"body",color:z}),n==="browse"&&t.drawText("Check back soon!",16,C+34,{font:"body",color:z});return}let v=C;for(let V=0;V<w.length;V++){const x=w[V],O=c===V,H=u.has(x.id);O&&t.fillRect(0,v,t.width,ze,z);const B=O?Y:z;t.drawText(x.title,8,v+4,{font:"menu",color:B});const S=Yn(x.pricing),Q=H?"Installed":S;t.drawText(Q,t.width-70,v+4,{font:"body",color:B}),t.drawText(`by ${x.author} · v${x.version}`,8,v+16,{font:"body",color:B});const N=x.description||"No description";t.drawText(N.length>45?N.slice(0,42)+"...":N,8,v+28,{font:"body",color:B}),t.drawDottedHLine(0,v+ze-1,t.width,O?Y:z),t.hitRegion(`app-item-${V}`,{x:0,y:v,w:t.width,h:ze},{onMouseDown:()=>p(V)}),v+=ze}const y=v+4;t.drawHLine(0,y,t.width,z);const I=t.getWindow();if(I!==null&&c===null&&(I.controlList.length=0,h.current=""),c!==null&&c<w.length){const V=w[c],x=u.has(V.id),O=f===V.id;if(I!==null){const H=`${c}-${V.id}-${x}-${f??""}`;if(h.current!==H&&(I.controlList.length=0,h.current=H),I.controlList.length===0)if(x){const B=eA("Open","menu")+20,S=eA("Uninstall","menu")+20,Q=xA(I,_(y+4,8,y+24,8+B),"Open",!0,0,0,1,0,0);Q.ref.contrlAction=(E,R)=>{var q;R===kA&&((q=e._os)==null||q.openWindow(V.id))};const N=xA(I,_(y+4,60,y+24,60+S),"Uninstall",!0,0,0,1,0,0);N.ref.contrlAction=(E,R)=>{R===kA&&(g(q=>{const nA=new Set(q);return nA.delete(V.id),nA}),p(null))}}else{const B=!V.pricing||V.pricing.type==="free",S=O?"Installing...":B?"Install":`Buy ${Yn(V.pricing)}`,Q=eA(S,"menu")+20,N=xA(I,_(y+4,8,y+24,8+Q),S,!0,0,0,1,0,0);N.ref.contrlAction=(E,R)=>{if(!(R!==kA||O)&&B&&V.entry){m(V.id);const q=e._appLoader;if(q){const nA={id:V.id,title:V.title,description:V.description??"",icon:V.id+"/icon",author:V.author,version:V.version,sdk:V.sdk,permissions:V.permissions,entry:V.entry};q.load(nA).then(()=>{g(oA=>{const b=new Set(oA);return b.add(V.id),b}),m(null)}).catch(oA=>{console.error("Install failed:",oA),m(null),d(`Failed to install ${V.title}`)})}}}}else if(!x&&I.controlList[0]){const B=!V.pricing||V.pricing.type==="free",S=O?"Installing...":B?"Install":`Buy ${Yn(V.pricing)}`;I.controlList[0].ref.contrlTitle=S,I.controlList[0].ref.contrlHilite=O?255:0}Nt(I,t.port)}}},onEvent(A,t,e){t.type},getContentHeight(A,t,e){const[n]=A.useState("browse"),[i]=A.useState([]),[r]=A.useState(new Set),o=n==="browse"?i:i.filter(a=>r.has(a.id));return 17+Zt+1+o.length*ze+vf+8},getMenubar(A,t){const[,e]=A.useState(!0),[,n]=A.useState([]),[,i]=A.useState(null);return[{label:"Store",items:[{label:"Refresh Catalog",onClick:()=>{e(!0),i(null),Fr().then(r=>{n(r),e(!1)})}}]}]}};function Df(A,t,e,n,i){const r=t*e;for(let o=0;o<r;o++){const s=o<<2;i[o]=A[s]*.299+A[s+1]*.587+A[s+2]*.114}for(let o=0;o<r;o++){const s=i[o],a=s<129?1:0;n[o]=a;const l=(s-(a?0:255))/8;o+1<r&&(i[o+1]+=l),o+2<r&&(i[o+2]+=l),o+t-1<r&&(i[o+t-1]+=l),o+t<r&&(i[o+t]+=l),o+t+1<r&&(i[o+t+1]+=l),o+(t<<1)<r&&(i[o+(t<<1)]+=l)}}async function Ti(A,t,e){try{const n=await createImageBitmap(A),r=new OffscreenCanvas(t,e).getContext("2d",{willReadFrequently:!0});r.drawImage(n,0,0,t,e),n.close();const o=r.getImageData(0,0,t,e),s=new Uint8Array(t*e),a=new Float32Array(t*e);return Df(o.data,t,e,s,a),s}catch{return null}}const Se="body",Cf="menu",Te=KA(Se),vs=18,zs=4,Rr=vs+zs*2+1,Pf=200,Bf=1,Ms=4,Of="/api/chat",Hf="/api/generate-image",Sf=["/imagine ","/img ","/image "];function Wf(A){const t=A.toLowerCase();for(const e of Sf)if(t.startsWith(e))return A.slice(e.length).trim();return null}function yn(A){const t=Math.min(A,Pf),e=Math.round(t/Bf);return{w:t,h:e}}async function Kf(A,t,e){try{const n=await fetch(Hf,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:A})});if(!n.ok)return null;const i=await n.json();if(!i.b64)return null;const r=atob(i.b64),o=new Uint8Array(r.length);for(let l=0;l<r.length;l++)o[l]=r.charCodeAt(l);const s=new Blob([o],{type:"image/png"}),a=await Ti(s,t,e);return a?{blob:s,pixels:a,width:t,height:e}:null}catch{return null}}async function Lf(A){try{const t=await fetch(Of,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:A[A.length-1].content,conversationHistory:A.slice(0,-1)})});if(!t.ok)return{message:"Sorry, I couldn't reach the server."};const e=await t.json();return{message:e.message??e.error??"No response.",b64:e.b64,imagePrompt:e.imagePrompt}}catch{return{message:"Network error. Please try again."}}}function Qi(A,t){const e=A.split(" "),n=[];let i="";for(const r of e){const o=i?`${i} ${r}`:r;eA(o,Se)>t&&i?(n.push(i),i=r):i=o}return i&&n.push(i),n.length===0&&n.push(""),n}function Ef(A,t){let e=0;if(A.image){const n=A.image.height||yn(t).h;e+=n+Ms}if(A.content){const n=A.role==="user"?"You: ":"Gippity: ";e+=Qi(n+A.content,t).length*Te}return e+=4,e}function Ur(A,t,e){let n=4;for(const i of A)n+=Ef(i,e);return t&&(n+=Qi("Gippity: ...",e).length*Te+4),n}function jr(A,t,e,n,i,r,o,s,a){const l=t.value.trim();if(!l)return;const d=Wf(l),c={role:"user",content:l},p=[...A,c];e(p),t.value="",t.cursorPos=0,t.selectionStart=0,t.selectionEnd=0,n(!0);const u=s+Te+4;if(i(Math.max(0,u-o)),d!==null){const{w:g,h:f}=yn(a);Kf(d,g,f).then(m=>{const h={role:"assistant",content:m?`Here's "${d}":`:"Sorry, I couldn't generate that image.",image:m??void 0};e(D=>[...D,h]),n(!1),r()})}else Lf(p).then(async g=>{if(g.b64&&g.imagePrompt){const{w:f,h:m}=yn(a),h=atob(g.b64),D=new Uint8Array(h.length);for(let v=0;v<h.length;v++)D[v]=h.charCodeAt(v);const M=new Blob([D],{type:"image/png"}),k=await Ti(M,f,m),C=k?{blob:M,pixels:k,width:f,height:m}:void 0,w={role:"assistant",content:g.message,image:C};e(v=>[...v,w])}else{const f={role:"assistant",content:g.message};e(m=>[...m,f])}n(!1),r()})}const Zf={id:"chatgippity",title:"ChatGippity",icon:"icon/computer",defaultSize:{width:280,height:300},scrollable:!1,resizable:!1,minSize:{width:200,height:160},render(A,t,e){const[n,i]=A.useState([]),[r]=A.useState(ft(""));r.focused||(r.focused=!0);const[o,s]=A.useState(!1),[a,l]=A.useState(0),d=A.useRef(!1);t.clear(Y);const c=15,p=t.height-Rr,u=t.width-c-8,g=Ur(n,o,u);if(n.length===0&&!o){const k=p/2-20;t.drawText("Welcome to ChatGippity!",t.width/2-60,k,{font:Cf,color:z}),t.drawText("Type a message below to start chatting.",20,k+18,{font:Se,color:z}),t.drawText("Tip: ask me to generate an image!",20,k+30,{font:Se,color:z})}t.scrollArea("chat-messages",{x:0,y:0,w:t.width,h:p},{contentHeight:g,scrollOffset:a,onScroll:l,resize:"both"},k=>{let C=4;const w=o?[...n,{role:"assistant",content:"..."}]:n;for(const v of w){if(v.image){const{w:y,h:I}=yn(u);(v.image.width!==y||v.image.height!==I)&&Ti(v.image.blob,y,I).then(S=>{S&&(v.image.pixels=S,v.image.width=y,v.image.height=I,A.scheduleRender())});const V=v.image.width,x=v.image.height,O=v.image.pixels,H=new Uint8ClampedArray(V*x*4);for(let S=0;S<V*x;S++){const Q=O[S]?0:255;H[S*4]=Q,H[S*4+1]=Q,H[S*4+2]=Q,H[S*4+3]=255}const B=new ImageData(H,V,x);k.blitImageData(B,4,C),C+=x+Ms}if(v.content){const y=v.role==="user"?"You: ":"Gippity: ",I=Qi(y+v.content,u);for(let V=0;V<I.length;V++)k.drawText(I[V],4,C+V*Te,{font:Se,color:z});C+=I.length*Te}C+=4}}),t.drawHLine(0,p,t.width,z);const f=p+zs,m=40,h=t.width-m-12;t.drawTextInput(r,4,f,h,vs,{id:"chat-input",onChange:()=>A.scheduleRender()});const D=20,M=t.getWindow();if(M!==null){if(!d.current){const k=xA(M,_(f-1,t.width-m-4,f-1+D,t.width-4),"Send",!0,0,0,1,0,0);k.ref.contrlAction=(C,w)=>{w!==kA||o||jr(n,r,i,s,l,()=>A.scheduleRender(),p,g,u)},d.current=!0}M.controlList[0]&&(M.controlList[0].ref.contrlHilite=o?255:0),Nt(M,t.port)}},onEvent(A,t,e,n){var c;const[i,r]=A.useState([]),[o]=A.useState(ft("")),[s,a]=A.useState(!1),[l,d]=A.useState(0);if(A.useRef(!1),t.type==="keyDown"){if(t.key==="Enter"){if(!s&&((c=o==null?void 0:o.value)!=null&&c.trim())){const u=n.width-15-8,g=n.height-Rr,f=Ur(i,s,u);jr(i,o,r,a,d,()=>A.scheduleRender(),g,f,u)}return}Oi(o,t.key,t.code,t.shiftKey,t.metaKey,t.ctrlKey)&&A.scheduleRender()}t.type==="paste"&&t.pasteText&&Bi(o,t.pasteText)&&A.scheduleRender()},getMenubar(A,t){const[,e]=A.useState([]);A.useState(ft("")),A.useState(!1);const[,n]=A.useState(0);return[{label:"File",items:[{label:"Clear Chat",onClick:()=>{e([]),n(0)}}]}]}};/*!
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
*/const Me={newline:10,reset:27};function Gf(A){if(!Number.isSafeInteger(A))throw new Error(`integer expected: ${A}`)}function Tf(A){if(!Number.isSafeInteger(A)||A<1||A>40)throw new Error(`Invalid version=${A}. Expected number [1..40]`)}function Ut(A,t){return A.toString(2).padStart(t,"0")}function Xr(A,t){const e=A%t;return e>=0?e:t+e}function jA(A,t){return new Array(A).fill(t)}function Jr(...A){let t=0;for(const n of A)t=Math.max(t,n.length);const e=[];for(let n=0;n<t;n++)for(const i of A)n>=i.length||e.push(i[n]);return new Uint8Array(e)}function _r(A,t,e){if(e<0||e+t.length>A.length)return!1;for(let n=0;n<t.length;n++)if(t[n]!==A[e+n])return!1;return!0}function Qf(){let A,t=1/0;return{add(e,n){e>=t||(A=n,t=e)},get:()=>A,score:()=>t}}function $r(A){return{has:t=>A.includes(t),decode:t=>{if(!Array.isArray(t)||t.length&&typeof t[0]!="string")throw new Error("alphabet.decode input should be array of strings");return t.map(e=>{if(typeof e!="string")throw new Error(`alphabet.decode: not string element=${e}`);const n=A.indexOf(e);if(n===-1)throw new Error(`Unknown letter: "${e}". Allowed: ${A}`);return n})},encode:t=>{if(!Array.isArray(t)||t.length&&typeof t[0]!="number")throw new Error("alphabet.encode input should be an array of numbers");return t.map(e=>{if(Gf(e),e<0||e>=A.length)throw new Error(`Digit index outside alphabet: ${e} (alphabet: ${A.length})`);return A[e]})}}}class RA{static size(t,e){if(typeof t=="number"&&(t={height:t,width:t}),!Number.isSafeInteger(t.height)&&t.height!==1/0)throw new Error(`Bitmap: invalid height=${t.height} (${typeof t.height})`);if(!Number.isSafeInteger(t.width)&&t.width!==1/0)throw new Error(`Bitmap: invalid width=${t.width} (${typeof t.width})`);return e!==void 0&&(t={width:Math.min(t.width,e.width),height:Math.min(t.height,e.height)}),t}static fromString(t){t=t.replace(/^\n+/g,"").replace(/\n+$/g,"");const e=t.split(String.fromCharCode(Me.newline)),n=e.length,i=new Array(n);let r;for(const o of e){const s=o.split("").map(a=>{if(a==="X")return!0;if(a===" ")return!1;if(a!=="?")throw new Error(`Bitmap.fromString: unknown symbol=${a}`)});if(r&&s.length!==r)throw new Error(`Bitmap.fromString different row sizes: width=${r} cur=${s.length}`);r=s.length,i.push(s)}return r||(r=0),new RA({height:n,width:r},i)}constructor(t,e){const{height:n,width:i}=RA.size(t);this.data=e||Array.from({length:n},()=>jA(i,void 0)),this.height=n,this.width=i}point(t){return this.data[t.y][t.x]}isInside(t){return 0<=t.x&&t.x<this.width&&0<=t.y&&t.y<this.height}size(t){if(!t)return{height:this.height,width:this.width};const{x:e,y:n}=this.xy(t);return{height:this.height-n,width:this.width-e}}xy(t){if(typeof t=="number"&&(t={x:t,y:t}),!Number.isSafeInteger(t.x))throw new Error(`Bitmap: invalid x=${t.x}`);if(!Number.isSafeInteger(t.y))throw new Error(`Bitmap: invalid y=${t.y}`);return t.x=Xr(t.x,this.width),t.y=Xr(t.y,this.height),t}rect(t,e,n){const{x:i,y:r}=this.xy(t),{height:o,width:s}=RA.size(e,this.size({x:i,y:r}));for(let a=0;a<o;a++)for(let l=0;l<s;l++)this.data[r+a][i+l]=typeof n=="function"?n({x:l,y:a},this.data[r+a][i+l]):n;return this}rectRead(t,e,n){return this.rect(t,e,(i,r)=>(n(i,r),r))}hLine(t,e,n){return this.rect(t,{width:e,height:1},n)}vLine(t,e,n){return this.rect(t,{width:1,height:e},n)}border(t=2,e){const n=this.height+2*t,i=this.width+2*t,r=jA(t,e),o=Array.from({length:t},()=>jA(i,e));return new RA({height:n,width:i},[...o,...this.data.map(s=>[...r,...s,...r]),...o])}embed(t,e){return this.rect(t,e.size(),({x:n,y:i})=>e.data[i][n])}rectSlice(t,e=this.size()){const n=new RA(RA.size(e,this.size(this.xy(t))));return this.rect(t,e,({x:i,y:r},o)=>n.data[r][i]=o),n}inverse(){const{height:t,width:e}=this;return new RA({height:e,width:t}).rect({x:0,y:0},1/0,({x:i,y:r})=>this.data[i][r])}scale(t){if(!Number.isSafeInteger(t)||t>1024)throw new Error(`invalid scale factor: ${t}`);const{height:e,width:n}=this;return new RA({height:t*e,width:t*n}).rect({x:0,y:0},1/0,({x:r,y:o})=>this.data[Math.floor(o/t)][Math.floor(r/t)])}clone(){return new RA(this.size()).rect({x:0,y:0},this.size(),({x:e,y:n})=>this.data[n][e])}assertDrawn(){this.rectRead(0,1/0,(t,e)=>{if(typeof e!="boolean")throw new Error(`Invalid color type=${typeof e}`)})}toString(){return this.data.map(t=>t.map(e=>e===void 0?"?":e?"X":" ").join("")).join(String.fromCharCode(Me.newline))}toASCII(){const{height:t,width:e,data:n}=this;let i="";for(let r=0;r<t;r+=2){for(let o=0;o<e;o++){const s=n[r][o],a=r+1>=t?!0:n[r+1][o];!s&&!a?i+="█":!s&&a?i+="▀":s&&!a?i+="▄":s&&a&&(i+=" ")}i+=String.fromCharCode(Me.newline)}return i}toTerm(){const t=String.fromCharCode(Me.reset),e=t+"[0m",n=t+"[1;47m  "+e,i=t+"[40m  "+e;return this.data.map(r=>r.map(o=>o?i:n).join("")).join(String.fromCharCode(Me.newline))}toSVG(){let t=`<svg xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" version="1.1" xmlns="http://www.w3.org/2000/svg">`;return this.rectRead(0,1/0,({x:e,y:n},i)=>{i&&(t+=`<rect x="${e}" y="${n}" width="1" height="1" />`)}),t+="</svg>",t}toGIF(){const t=s=>[s&255,s>>>8&255],e=[...t(this.width),...t(this.height)],n=[];this.rectRead(0,1/0,(s,a)=>n.push(+(a===!0)));const i=126,r=[71,73,70,56,55,97,...e,246,0,0,255,255,255,...jA(381,0),44,0,0,0,0,...e,0,7],o=Math.floor(n.length/i);for(let s=0;s<o;s++)r.push(i+1,128,...n.slice(i*s,i*(s+1)).map(a=>+a));return r.push(n.length%i+1,128,...n.slice(o*i).map(s=>+s)),r.push(1,129,0,59),new Uint8Array(r)}toImage(t=!1){const{height:e,width:n}=this.size(),i=new Uint8Array(e*n*(t?3:4));let r=0;for(let o=0;o<e;o++)for(let s=0;s<n;s++){const a=this.data[o][s]?0:255;i[r++]=a,i[r++]=a,i[r++]=a,t||(i[r++]=255)}return{height:e,width:n,data:i}}}const Ao=["low","medium","quartile","high"],to=["numeric","alphanumeric","byte","kanji","eci"],Yf=[26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706],Nf={low:[7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],medium:[10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],quartile:[13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],high:[17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]},Ff={low:[1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],medium:[1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],quartile:[1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],high:[1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]},BA={size:{encode:A=>21+4*(A-1),decode:A=>(A-17)/4},sizeType:A=>Math.floor((A+7)/17),alignmentPatterns(A){if(A===1)return[];const t=6,e=BA.size.encode(A)-t-1,n=e-t,i=Math.ceil(n/28);let r=Math.floor(n/i);r%2?r+=1:n%i*2>=i&&(r+=2);const o=[t];for(let s=1;s<i;s++)o.push(e-(i-s)*r);return o.push(e),o},ECCode:{low:1,medium:0,quartile:3,high:2},formatMask:21522,formatBits(A,t){const e=BA.ECCode[A]<<3|t;let n=e;for(let i=0;i<10;i++)n=n<<1^(n>>9)*1335;return(e<<10|n)^BA.formatMask},versionBits(A){let t=A;for(let e=0;e<12;e++)t=t<<1^(t>>11)*7973;return A<<12|t},alphabet:{numeric:$r("0123456789"),alphanumerc:$r("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:")},lengthBits(A,t){return{numeric:[10,12,14],alphanumeric:[9,11,13],byte:[8,16,16],kanji:[8,10,12],eci:[0,0,0]}[t][BA.sizeType(A)]},modeBits:{numeric:"0001",alphanumeric:"0010",byte:"0100",kanji:"1000",eci:"0111"},capacity(A,t){const e=Yf[A-1],n=Nf[t][A-1],i=Ff[t][A-1],r=Math.floor(e/i)-n,o=i-e%i;return{words:n,numBlocks:i,shortBlocks:o,blockLen:r,capacity:(e-n*i)*8,total:(n+r)*i+i-o}}},Yi=[(A,t)=>(A+t)%2==0,(A,t)=>t%2==0,(A,t)=>A%3==0,(A,t)=>(A+t)%3==0,(A,t)=>(Math.floor(t/2)+Math.floor(A/3))%2==0,(A,t)=>A*t%2+A*t%3==0,(A,t)=>(A*t%2+A*t%3)%2==0,(A,t)=>((A+t)%2+A*t%3)%2==0],U={tables:(A=>{const t=jA(256,0),e=jA(256,0);for(let n=0,i=1;n<256;n++)t[n]=i,e[i]=n,i<<=1,i&256&&(i^=A);return{exp:t,log:e}})(285),exp:A=>U.tables.exp[A],log(A){if(A===0)throw new Error(`GF.log: invalid arg=${A}`);return U.tables.log[A]%255},mul(A,t){return A===0||t===0?0:U.tables.exp[(U.tables.log[A]+U.tables.log[t])%255]},add:(A,t)=>A^t,pow:(A,t)=>U.tables.exp[U.tables.log[A]*t%255],inv(A){if(A===0)throw new Error(`GF.inverse: invalid arg=${A}`);return U.tables.exp[255-U.tables.log[A]]},polynomial(A){if(A.length==0)throw new Error("GF.polymomial: invalid length");if(A[0]!==0)return A;let t=0;for(;t<A.length-1&&A[t]==0;t++);return A.slice(t)},monomial(A,t){if(A<0)throw new Error(`GF.monomial: invalid degree=${A}`);if(t==0)return[0];let e=jA(A+1,0);return e[0]=t,U.polynomial(e)},degree:A=>A.length-1,coefficient:(A,t)=>A[U.degree(A)-t],mulPoly(A,t){if(A[0]===0||t[0]===0)return[0];const e=jA(A.length+t.length-1,0);for(let n=0;n<A.length;n++)for(let i=0;i<t.length;i++)e[n+i]=U.add(e[n+i],U.mul(A[n],t[i]));return U.polynomial(e)},mulPolyScalar(A,t){if(t==0)return[0];if(t==1)return A;const e=jA(A.length,0);for(let n=0;n<A.length;n++)e[n]=U.mul(A[n],t);return U.polynomial(e)},mulPolyMonomial(A,t,e){if(t<0)throw new Error("GF.mulPolyMonomial: invalid degree");if(e==0)return[0];const n=jA(A.length+t,0);for(let i=0;i<A.length;i++)n[i]=U.mul(A[i],e);return U.polynomial(n)},addPoly(A,t){if(A[0]===0)return t;if(t[0]===0)return A;let e=A,n=t;e.length>n.length&&([e,n]=[n,e]);let i=jA(n.length,0),r=n.length-e.length,o=n.slice(0,r);for(let s=0;s<o.length;s++)i[s]=o[s];for(let s=r;s<n.length;s++)i[s]=U.add(e[s-r],n[s]);return U.polynomial(i)},remainderPoly(A,t){const e=Array.from(A);for(let n=0;n<A.length-t.length+1;n++){const i=e[n];if(i!==0)for(let r=1;r<t.length;r++)t[r]!==0&&(e[n+r]=U.add(e[n+r],U.mul(t[r],i)))}return e.slice(A.length-t.length+1,e.length)},divisorPoly(A){let t=[1];for(let e=0;e<A;e++)t=U.mulPoly(t,[1,U.pow(2,e)]);return t},evalPoly(A,t){if(t==0)return U.coefficient(A,0);let e=A[0];for(let n=1;n<A.length;n++)e=U.add(U.mul(t,e),A[n]);return e},euclidian(A,t,e){U.degree(A)<U.degree(t)&&([A,t]=[t,A]);let n=A,i=t,r=[0],o=[1];for(;2*U.degree(i)>=e;){let l=n,d=r;if(n=i,r=o,n[0]===0)throw new Error("rLast[0] === 0");i=l;let c=[0];const p=U.inv(n[0]);for(;U.degree(i)>=U.degree(n)&&i[0]!==0;){const u=U.degree(i)-U.degree(n),g=U.mul(i[0],p);c=U.addPoly(c,U.monomial(u,g)),i=U.addPoly(i,U.mulPolyMonomial(n,u,g))}if(c=U.mulPoly(c,r),o=U.addPoly(c,d),U.degree(i)>=U.degree(n))throw new Error(`Division failed r: ${i}, rLast: ${n}`)}const s=U.coefficient(o,0);if(s==0)throw new Error("sigmaTilde(0) was zero");const a=U.inv(s);return[U.mulPolyScalar(o,a),U.mulPolyScalar(i,a)]}};function Rf(A){return{encode(t){const e=U.divisorPoly(A),n=Array.from(t);return n.push(...e.slice(0,-1).fill(0)),Uint8Array.from(U.remainderPoly(n,e))},decode(t){const e=t.slice(),n=U.polynomial(Array.from(t));let i=jA(A,0),r=!1;for(let c=0;c<A;c++){const p=U.evalPoly(n,U.exp(c));i[i.length-1-c]=p,p!==0&&(r=!0)}if(!r)return e;i=U.polynomial(i);const o=U.monomial(A,1),[s,a]=U.euclidian(o,i,A),l=jA(U.degree(s),0);let d=0;for(let c=1;c<256&&d<l.length;c++)U.evalPoly(s,c)===0&&(l[d++]=U.inv(c));if(d!==l.length)throw new Error("RS.decode: invalid errors number");for(let c=0;c<l.length;c++){const p=e.length-1-U.log(l[c]);if(p<0)throw new Error("RS.decode: invalid error location");const u=U.inv(l[c]);let g=1;for(let f=0;f<l.length;f++)c!==f&&(g=U.mul(g,U.add(1,U.mul(l[f],u))));e[p]=U.add(e[p],U.mul(U.evalPoly(a,u),U.inv(g)))}return e}}}function Uf(A,t){const{words:e,shortBlocks:n,numBlocks:i,blockLen:r,total:o}=BA.capacity(A,t),s=Rf(e);return{encode(a){const l=[],d=[];for(let g=0;g<i;g++){const f=g<n,m=r+(f?0:1);l.push(a.subarray(0,m)),d.push(s.encode(a.subarray(0,m))),a=a.subarray(m)}const c=Jr(...l),p=Jr(...d),u=new Uint8Array(c.length+p.length);return u.set(c),u.set(p,c.length),u},decode(a){if(a.length!==o)throw new Error(`interleave.decode: len(data)=${a.length}, total=${o}`);const l=[];for(let p=0;p<i;p++){const u=p<n;l.push(new Uint8Array(e+r+(u?0:1)))}let d=0;for(let p=0;p<r;p++)for(let u=0;u<i;u++)l[u][p]=a[d++];for(let p=n;p<i;p++)l[p][r]=a[d++];for(let p=r;p<r+e;p++)for(let u=0;u<i;u++){const g=u<n;l[u][p+(g?0:1)]=a[d++]}const c=[];for(const p of l)c.push(...Array.from(s.decode(p)).slice(0,-e));return Uint8Array.from(c)}}}function jf(A,t,e,n=!1){const i=BA.size.encode(A);let r=new RA(i+2);const o=new RA(3).rect(0,3,!0).border(1,!1).border(1,!0).border(1,!1);r=r.embed(0,o).embed({x:-o.width,y:0},o).embed({x:0,y:-o.height},o),r=r.rectSlice(1,i);const s=new RA(1).rect(0,1,!0).border(1,!1).border(1,!0),a=BA.alignmentPatterns(A);for(const l of a)for(const d of a)r.data[l][d]===void 0&&r.embed({x:d-2,y:l-2},s);r=r.hLine({x:0,y:6},1/0,({x:l},d)=>d===void 0?l%2==0:d).vLine({x:6,y:0},1/0,({y:l},d)=>d===void 0?l%2==0:d);{const l=BA.formatBits(t,e),d=c=>!n&&(l>>c&1)==1;for(let c=0;c<6;c++)r.data[c][8]=d(c);for(let c=6;c<8;c++)r.data[c+1][8]=d(c);for(let c=8;c<15;c++)r.data[i-15+c][8]=d(c);for(let c=0;c<8;c++)r.data[8][i-c-1]=d(c);for(let c=8;c<9;c++)r.data[8][15-c-1+1]=d(c);for(let c=9;c<15;c++)r.data[8][15-c-1]=d(c);r.data[i-8][8]=!n}if(A>=7){const l=BA.versionBits(A);for(let d=0;d<18;d+=1){const c=!n&&(l>>d&1)==1,p=Math.floor(d/3),u=d%3+i-8-3;r.data[p][u]=c,r.data[u][p]=c}}return r}function Xf(A,t,e){const n=A.height,i=Yi[t];let r=-1,o=n-1;for(let s=n-1;s>0;s-=2){for(s==6&&(s=5);;o+=r){for(let a=0;a<2;a+=1){const l=s-a;A.data[o][l]===void 0&&e(l,o,i(l,o))}if(o+r<0||o+r>=n)break}r=-r}}function Jf(A){let t="numeric";for(let e of A)if(!BA.alphabet.numeric.has(e)&&(t="alphanumeric",!BA.alphabet.alphanumerc.has(e)))return"byte";return t}function _f(A){if(typeof A!="string")throw new Error(`utf8ToBytes expected string, got ${typeof A}`);return new Uint8Array(new TextEncoder().encode(A))}function eo(A,t,e,n){let i="",r=e.length;if(n==="numeric"){const c=BA.alphabet.numeric.decode(e.split("")),p=c.length;for(let u=0;u<p-2;u+=3)i+=Ut(c[u]*100+c[u+1]*10+c[u+2],10);p%3===1?i+=Ut(c[p-1],4):p%3===2&&(i+=Ut(c[p-2]*10+c[p-1],7))}else if(n==="alphanumeric"){const c=BA.alphabet.alphanumerc.decode(e.split("")),p=c.length;for(let u=0;u<p-1;u+=2)i+=Ut(c[u]*45+c[u+1],11);p%2==1&&(i+=Ut(c[p-1],6))}else if(n==="byte"){const c=_f(e);r=c.length,i=Array.from(c).map(p=>Ut(p,8)).join("")}else throw new Error("encode: unsupported type");const{capacity:o}=BA.capacity(A,t),s=Ut(r,BA.lengthBits(A,n));let a=BA.modeBits[n]+s+i;if(a.length>o)throw new Error("Capacity overflow");a+="0".repeat(Math.min(4,Math.max(0,o-a.length))),a.length%8&&(a+="0".repeat(8-a.length%8));const l="1110110000010001";for(let c=0;a.length!==o;c++)a+=l[c%l.length];const d=Uint8Array.from(a.match(/(.{8})/g).map(c=>+`0b${c}`));return Uf(A,t).encode(d)}function no(A,t,e,n,i=!1){const r=jf(A,t,n,i);let o=0;const s=8*e.length;if(Xf(r,n,(a,l,d)=>{let c=!1;o<s&&(c=(e[o>>>3]>>(7-o&7)&1)!==0,o++),r.data[l][a]=c!==d}),o!==s)throw new Error("QR: bytes left after draw");return r}function $f(A){const t=A.inverse(),e=u=>{let g=0;for(let f=0,m=1,h=void 0;f<u.length;f++)h===u[f]&&(m++,f!==u.length-1)||(m>=5&&(g+=3+(m-5)),h=u[f],m=1);return g};let n=0;A.data.forEach(u=>n+=e(u)),t.data.forEach(u=>n+=e(u));let i=0,r=A.data;const o=A.width-1,s=A.height-1;for(let u=0;u<o;u++)for(let g=0;g<s;g++){const f=u+1,m=g+1;r[u][g]===r[f][g]&&r[f][g]===r[u][m]&&r[f][g]===r[f][m]&&(i+=3)}const a=u=>{const g=[!0,!1,!0,!0,!0,!1,!0],f=[!1,!1,!1,!1],m=[...g,...f],h=[...f,...g];let D=0;for(let M=0;M<u.length;M++)_r(u,m,M)&&(D+=40),_r(u,h,M)&&(D+=40);return D};let l=0;for(const u of A.data)l+=a(u);for(const u of t.data)l+=a(u);let d=0;A.rectRead(0,1/0,(u,g)=>d+=g?1:0);const c=d/(A.height*A.width)*100,p=10*Math.floor(Math.abs(c-50)/5);return n+i+l+p}function Ag(A,t,e,n){if(n===void 0){const i=Qf();for(let r=0;r<Yi.length;r++)i.add($f(no(A,t,e,r,!0)),r);n=i.get()}if(n===void 0)throw new Error("Cannot find mask");return no(A,t,e,n)}function tg(A){if(!Ao.includes(A))throw new Error(`Invalid error correction mode=${A}. Expected: ${Ao}`)}function eg(A){if(!to.includes(A))throw new Error(`Encoding: invalid mode=${A}. Expected: ${to}`);if(A==="kanji"||A==="eci")throw new Error(`Encoding: ${A} is not supported (yet?).`)}function ng(A){if(![0,1,2,3,4,5,6,7].includes(A)||!Yi[A])throw new Error(`Invalid mask=${A}. Expected number [0..7]`)}function ig(A,t="raw",e={}){const n=e.ecc!==void 0?e.ecc:"medium";tg(n);const i=e.encoding!==void 0?e.encoding:Jf(A);eg(i),e.mask!==void 0&&ng(e.mask);let r=e.version,o,s=new Error("Unknown error");if(r!==void 0)Tf(r),o=eo(r,n,A,i);else for(let d=1;d<=40;d++)try{o=eo(d,n,A,i),r=d;break}catch(c){s=c}if(!r||!o)throw s;let a=Ag(r,n,o,e.mask);a.assertDrawn();const l=e.border===void 0?2:e.border;if(!Number.isSafeInteger(l))throw new Error(`invalid border type=${typeof l}`);if(a=a.border(l,!1),e.scale!==void 0&&(a=a.scale(e.scale)),t==="raw")return a.data;if(t==="ascii")return a.toASCII();if(t==="svg")return a.toSVG();if(t==="gif")return a.toGIF();if(t==="term")return a.toTerm();throw new Error(`Unknown output: ${t}`)}const Ni="7026651075534864a4e08f451eb7a9ce",Ds=`${typeof window<"u"?window.location.origin.replace("//localhost","//[::1]").replace("//127.0.0.1","//[::1]"):""}/callback.html`,rg="streaming user-read-playback-state user-modify-playback-state user-read-email playlist-read-private",Fi="mockintosh:spotify:tokens",Ri="https://api.spotify.com/v1",et=90,ci=30,og=16,di=4;function sg(){const A=new Uint8Array(64);return crypto.getRandomValues(A),btoa(String.fromCharCode(...A)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}async function lg(A){const t=new TextEncoder().encode(A),e=await crypto.subtle.digest("SHA-256",t);return btoa(String.fromCharCode(...new Uint8Array(e))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function rn(A){try{localStorage.setItem(Fi,JSON.stringify(A))}catch{}}function io(){try{const A=localStorage.getItem(Fi);return A?JSON.parse(A):null}catch{return null}}function ag(){try{localStorage.removeItem(Fi)}catch{}}async function cg(A,t){const e=new URLSearchParams({grant_type:"authorization_code",code:A,redirect_uri:Ds,client_id:Ni,code_verifier:t}),n=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:e.toString()});if(!n.ok)throw new Error(`Token exchange failed: ${n.status}`);const i=await n.json();return{access_token:i.access_token,refresh_token:i.refresh_token,expires_at:Date.now()+i.expires_in*1e3}}async function dg(A){const t=new URLSearchParams({grant_type:"refresh_token",refresh_token:A,client_id:Ni}),e=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:t.toString()});if(!e.ok)throw new Error(`Token refresh failed: ${e.status}`);const n=await e.json();return{access_token:n.access_token,refresh_token:n.refresh_token??A,expires_at:Date.now()+n.expires_in*1e3}}async function Bn(A,t){const e=A.current;if(!e)return null;if(Date.now()>e.expires_at-6e4)try{const n=await dg(e.refresh_token);return A.current=n,rn(n),t(n),n.access_token}catch{return A.current=null,ag(),null}return e.access_token}async function ug(A,t,e){const n=await Bn(t,e);if(!n)return null;const i=await fetch(`${Ri}${A}`,{headers:{Authorization:`Bearer ${n}`}});return i.ok?i.json():null}async function We(A,t,e,n){const i=await Bn(e,n);if(!i)return!1;const r=await fetch(`${Ri}${A}`,{method:"PUT",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:t!=null?JSON.stringify(t):void 0});return r.ok||r.status===204}async function ro(A,t,e){const n=await Bn(t,e);if(!n)return!1;const i=await fetch(`${Ri}${A}`,{method:"POST",headers:{Authorization:`Bearer ${n}`}});return i.ok||i.status===204}async function pg(A,t){const e=await ug("/me/playlists?limit=50",A,t);return e!=null&&e.items?e.items.map(n=>({id:n.id,name:n.name,uri:n.uri,images:n.images??[]})):[]}let oo=!1,Je=null;function fg(){return oo?Promise.resolve():Je||(Je=new Promise(A=>{window.onSpotifyWebPlaybackSDKReady=()=>{oo=!0,A()};const t=document.createElement("script");t.src="https://sdk.scdn.co/spotify-player.js",document.head.appendChild(t)}),Je)}function gg(A,t,e,n,i){const r=t*e;for(let o=0;o<r;o++){const s=o<<2;i[o]=A[s]*.299+A[s+1]*.587+A[s+2]*.114}for(let o=0;o<r;o++){const s=i[o],a=s<129?1:0;n[o]=a;const l=(s-(a?0:255))/8;i[o+1]+=l,i[o+2]+=l,i[o+t-1]+=l,i[o+t]+=l,i[o+t+1]+=l,i[o+(t<<1)]+=l}}function mg(A,t,e){if(A.current&&A.current.canvas.width===t&&A.current.canvas.height===e)return A.current;const n=new OffscreenCanvas(t,e),i=n.getContext("2d",{willReadFrequently:!0});return A.current={canvas:n,ctx:i,pixels:new Uint8Array(t*e),luminance:new Float32Array(t*e)},A.current}async function qg(A,t,e,n){try{const r=await(await fetch(A)).blob(),o=await createImageBitmap(r),s=mg(n,t,e);s.ctx.drawImage(o,0,0,t,e),o.close();const a=s.ctx.getImageData(0,0,t,e);return s.luminance.fill(0),gg(a.data,t,e,s.pixels,s.luminance),s.pixels}catch{return null}}let ut=null,UA=null,ui=null,uA=null;function Cs(A,t,e){if(eA(A,e)<=t)return A;let n=A;for(;n.length>0&&eA(n+"...",e)>t;)n=n.slice(0,-1);return n+"..."}const hg={id:"spotify",title:"Spotify Player",icon:"icon/spotify",defaultSize:{width:380,height:280},scrollable:!1,render(A,t,e){const n=e._sprites,i=()=>A.scheduleRender(),[r,o]=A.useState(io()),[s,a]=A.useState([]),[l,d]=A.useState(-1),[c,p]=A.useState(null),[u,g]=A.useState(null),[f,m]=A.useState(""),[h,D]=A.useState(50),[M,k]=A.useState(!1),[C,w]=A.useState(0),[v,y]=A.useState(""),[I,V]=A.useState(null),x=A.useRef(r),O=A.useRef(""),H=A.useRef(null),B=A.useRef(!1),S=A.useRef(""),Q=A.useRef(null),N=A.useRef(I);x.current=r;const E=R=>{o(R),rn(R)};if(N.current=I,A.useEffect(()=>{!r||B.current||(B.current=!0,(async()=>{try{await fg(),k(!0);const R=window.Spotify;if(!(R!=null&&R.Player))return;UA=new R.Player({name:"Mockintosh Player",getOAuthToken:q=>{var oA;const nA=(oA=x.current)==null?void 0:oA.access_token;nA?q(nA):Bn(x,E).then(b=>{b&&q(b)})},volume:h/100}),UA.addListener("ready",({device_id:q})=>{ui=q,We("/me/player",{device_ids:[q],play:!1},x,E),i()}),UA.addListener("player_state_changed",q=>{var b,hA,IA,dA;if(!q){p(null);return}const nA=(b=q.track_window)==null?void 0:b.current_track;p({track:nA?{name:nA.name,artists:nA.artists,album:nA.album,duration_ms:nA.duration_ms}:null,paused:q.paused,position_ms:q.position,duration_ms:q.duration});const oA=((dA=(IA=(hA=nA==null?void 0:nA.album)==null?void 0:hA.images)==null?void 0:IA[0])==null?void 0:dA.url)??"";oA&&oA!==S.current&&(S.current=oA,m(oA))}),UA.addListener("initialization_error",({message:q})=>{y(q)}),UA.addListener("authentication_error",({message:q})=>{console.warn("Spotify auth error:",q),y("Spotify Premium required for playback")}),await UA.connect()}catch(R){y(R.message??"SDK failed")}})(),pg(x,E).then(R=>{R.length>0&&a(R)}))},[r]),A.useEffect(()=>{if(!f)return;const R=Ps(t.width,t.height);qg(f,R,R,H).then(q=>{q&&g(new Uint8Array(q))})},[f]),A.useEffect(()=>(ut&&window.removeEventListener("message",ut),ut=async R=>{var q;if(((q=R.data)==null?void 0:q.type)==="spotify-callback"){if(R.data.error){y(R.data.error);return}if(!(!R.data.code||!O.current))try{const nA=await cg(R.data.code,O.current);rn(nA),o(nA),y("")}catch(nA){y(nA.message??"Auth failed")}}},window.addEventListener("message",ut),()=>{ut&&(window.removeEventListener("message",ut),ut=null)}),[]),A.useEffect(()=>{if(!I||I.status!=="qr")return;uA!==null&&(clearInterval(uA),uA=null),Q.current=null;const R=(I.interval??5)*1e3;return uA=setInterval(async()=>{Q.current=uA;const q=N.current;if(!q||q.status!=="qr"){uA!==null&&(clearInterval(uA),uA=null);return}if(Date.now()>q.expiresAt){uA!==null&&(clearInterval(uA),uA=null),V({...q,status:"expired"}),i();return}try{const oA=await(await fetch(`/api/spotify/device-poll?poll_id=${encodeURIComponent(q.pollId)}`)).json();if(oA.status==="ready"){uA!==null&&(clearInterval(uA),uA=null),V(null);const b={access_token:oA.access_token,refresh_token:oA.refresh_token,expires_at:Date.now()+oA.expires_in*1e3};rn(b),o(b)}else oA.status==="expired"?(uA!==null&&(clearInterval(uA),uA=null),V({...q,status:"expired"})):oA.status==="denied"&&(uA!==null&&(clearInterval(uA),uA=null),V({...q,status:"denied"}))}catch{}i()},R),Q.current=uA,()=>{uA!==null&&(clearInterval(uA),uA=null),Q.current=null}},[I==null?void 0:I.pollId,I==null?void 0:I.status]),t.clear(Y),!r){wg(t,n,A,O,y,I,V,i),v&&t.drawText(v,8,t.height-16,{font:"body",color:z});return}bg(t,s,l,C,x,E,d,i),Vg(t,c,u,n,x,E,h,D,i),v&&t.drawText(v,et+4,t.height-4,{font:"body",color:z})},onEvent(A,t,e,n){A.useState(io()),A.useState([]),A.useState(-1),A.useState(null),A.useState(null),A.useState(""),A.useState(50),A.useState(!1);const[i,r]=A.useState(0);if(A.useState(""),A.useState(null),A.useRef(null),A.useRef(""),A.useRef(null),A.useRef(!1),A.useRef(""),A.useRef(null),A.useRef(null),t.type==="scroll"&&t.x!==void 0&&t.x<et){const o=t.deltaY??0;r(Math.max(0,i+o))}},onClose(A){ut&&(window.removeEventListener("message",ut),ut=null),uA!==null&&(clearInterval(uA),uA=null),UA&&(UA.disconnect(),UA=null,ui=null)}};function xg(A,t,e,n,i){const r=t.length;A.fillRect(e,n,r*i,r*i,Y);for(let o=0;o<r;o++)for(let s=0;s<r;s++)t[o][s]&&A.fillRect(e+s*i,n+o*i,i,i,z)}function wg(A,t,e,n,i,r,o,s){if(A.fillRect(0,0,A.width,A.height,z),r){if(r.status==="loading"){const y="Connecting to Spotify...",I=eA(y,"body");A.drawText(y,Math.floor((A.width-I)/2),Math.floor(A.height/2),{font:"body",color:Y});return}if(r.status==="expired"||r.status==="denied"){const y=r.status==="expired"?"QR code expired.":"Access denied.",I=eA(y,"body");A.drawText(y,Math.floor((A.width-I)/2),Math.floor(A.height/2)-20,{font:"body",color:Y});const V=80,x=18,O=Math.floor((A.width-V)/2),H=Math.floor(A.height/2);A.fillRect(O,H,V,x,Y),A.drawRect(O,H,V,x,z);const B="Try Again",S=eA(B,"body");A.drawText(B,O+Math.floor((V-S)/2),H+4,{font:"body",color:z}),A.hitRegion("spotify-qr-retry",{x:O,y:H,w:V,h:x},{onClick:()=>o(null)});return}if(r.qrMatrix){const y=r.qrMatrix.length,I=A.width-16,V=A.height-50,x=Math.max(1,Math.floor(Math.min(I,V)/y)),O=y*x,H=Math.floor((A.width-O)/2),B=Math.floor((A.height-O)/2)-8;xg(A,r.qrMatrix,H,B,x),A.drawRect(H-1,B-1,O+2,O+2,Y);const S=r.userCode,Q=eA(S,"menu");A.drawText(S,Math.floor((A.width-Q)/2),B+O+4,{font:"menu",color:Y});const N="Scan with your phone",E=eA(N,"body");A.drawText(N,Math.floor((A.width-E)/2),B-12,{font:"body",color:Y})}const w="Cancel",v=eA(w,"body");A.drawText(w,Math.floor((A.width-v)/2),A.height-14,{font:"body",color:Y}),A.hitRegion("spotify-qr-cancel",{x:Math.floor((A.width-v)/2)-2,y:A.height-16,w:v+4,h:12},{onClick:()=>o(null)});return}const a=Math.floor(A.width/2),l=Math.floor(A.height/2)-20,d="To continue, login to Spotify:",c=eA(d,"body");A.drawText(d,a-Math.floor(c/2),l-36,{font:"body",color:Y});const p=t==null?void 0:t.get("icon/spotify");p&&A.blitInverted(p,a-Math.floor(p.width/2),l-16);const u=80,g=18,f=a-Math.floor(u/2),m=l+24;A.fillRect(f,m,u,g,Y),A.drawRect(f,m,u,g,z);const h="Log in with QR",D=eA(h,"body");A.drawText(h,f+Math.floor((u-D)/2),m+4,{font:"body",color:z}),A.hitRegion("spotify-qr-login",{x:f,y:m,w:u,h:g},{onClick:()=>{o({status:"loading",pollId:"",verificationUri:"",userCode:"",interval:5,expiresAt:0,qrMatrix:null}),s(),fetch("/api/spotify/device-request",{method:"POST"}).then(w=>w.json()).then(w=>{if(w.error){i(w.error),o(null),s();return}const v=w.verification_uri_complete??w.verification_uri,y=yg(v);o({status:"qr",pollId:w.poll_id,verificationUri:v,userCode:w.user_code,interval:w.interval??5,expiresAt:Date.now()+(w.expires_in??300)*1e3,qrMatrix:y}),s()}).catch(w=>{i(w.message??"Failed to start login"),o(null),s()})}});const M="Log in via browser",k=eA(M,"body"),C=m+g+8;A.drawText(M,a-Math.floor(k/2),C,{font:"body",color:Y}),A.hitRegion("spotify-browser-login",{x:a-Math.floor(k/2)-2,y:C-2,w:k+4,h:12},{onClick:()=>{const w=sg();n.current=w,lg(w).then(v=>{const y=new URLSearchParams({response_type:"code",client_id:Ni,scope:rg,redirect_uri:Ds,code_challenge_method:"S256",code_challenge:v});window.open(`https://accounts.spotify.com/authorize?${y.toString()}`,"spotify-auth","width=500,height=700")})}})}function yg(A){try{const t=ig(A,"raw"),e=Object.keys(t).length,n=[];for(let i=0;i<e;i++)n.push(Array.from(t[i]));return n}catch{return null}}function bg(A,t,e,n,i,r,o,s){A.fillRect(0,0,et,A.height,Y),A.drawVLine(et-1,0,A.height,z);const a=KA("body"),l=2;A.drawText("PLAYLISTS",4,l,{font:"body",color:z}),A.drawHLine(0,l+a+1,et-1,z);const d=l+a+2;A.pushClip(0,d,et-1,A.height-d);for(let c=0;c<t.length;c++){const p=d+c*a-n;if(p+a<d||p>A.height)continue;const u=c===e;u&&A.fillRect(0,p,et-1,a,z);const g=Cs(t[c].name,et-8,"body");A.drawText(g,4,p,{font:"body",color:u?Y:z});const f=c;A.hitRegion(`playlist-${c}`,{x:0,y:p,w:et-1,h:a},{onClick:()=>{o(f),ui&&We("/me/player/play",{context_uri:t[f].uri},i,r),s()}})}A.popClip()}function Ps(A,t){const e=Math.min(A-et-di*2,t-ci-og-di*2);return Math.max(32,e)}function Vg(A,t,e,n,i,r,o,s,a){var q,nA,oA;const l=et,d=A.width-et,c=Ps(A.width,A.height),p=l+Math.floor((d-c)/2),u=di;e&&e.length===c*c?A.blit1bitPixels(e,c,c,p,u):A.fillPattern(p,u,c,c,"gray25"),A.drawRect(p,u,c,c,z);const g=u+c+2,f=((q=t==null?void 0:t.track)==null?void 0:q.name)??"No track playing",m=((oA=(nA=t==null?void 0:t.track)==null?void 0:nA.artists)==null?void 0:oA.map(b=>b.name).join(", "))??"",h=m?`${f} - ${m}`:f,D=Cs(h,d-8,"body");A.drawText(D,l+4,g,{font:"body",color:z});const M=A.height-ci;A.drawHLine(l,M,d,z);const k=16,C=6,w=k*3+C*2,v=l+Math.floor((d-w)/2)-30,y=M+Math.floor((ci-k)/2),I=n==null?void 0:n.get("spotify/prev");I&&A.blit(I,v,y+2),A.hitRegion("spotify-prev",{x:v,y,w:k,h:k},{onClick:()=>{ro("/me/player/previous",i,r)}});const V=v+k+C,x=(t==null?void 0:t.paused)??!0,O=n==null?void 0:n.get(x?"spotify/play":"spotify/pause");O&&A.blit(O,V,y),A.drawRect(V-1,y-1,k+2,k+2,z),A.hitRegion("spotify-playpause",{x:V,y,w:k,h:k},{onClick:()=>{We(x?"/me/player/play":"/me/player/pause",null,i,r)}});const H=V+k+C,B=n==null?void 0:n.get("spotify/next");B&&A.blit(B,H,y+2),A.hitRegion("spotify-next",{x:H,y,w:k,h:k},{onClick:()=>{ro("/me/player/next",i,r)}});const S=n==null?void 0:n.get("spotify/volume"),Q=H+k+C+12;S&&A.blit(S,Q,y+2);const N=Q+14,E=A.width-N-8,R=y+Math.floor(k/2);if(E>10){A.drawHLine(N,R,E,z),A.drawHLine(N,R+1,E,z);const b=N+Math.floor(o/100*(E-4));A.fillRect(b,R-3,4,8,Y),A.drawRect(b,R-3,4,8,z),A.hitRegion("spotify-volume",{x:N,y:R-6,w:E,h:12},{onMouseDown:hA=>{const IA=Math.max(0,Math.min(1,(hA-N)/E)),dA=Math.round(IA*100);s(dA),UA&&UA.setVolume(dA/100),We(`/me/player/volume?volume_percent=${dA}`,null,i,r),a()},onDrag:hA=>{const IA=Math.max(0,Math.min(1,(hA-N)/E)),dA=Math.round(IA*100);s(dA),UA&&UA.setVolume(dA/100),a()}})}}function ke(A,t,e){const n=new Uint8Array(A*t),i=new Uint8Array(A*t);for(let r=0;r<t;r++){const o=e[r]||"";for(let s=0;s<A;s++){const a=o[s]||".";a==="#"?(n[r*A+s]=z,i[r*A+s]=1):a==="."?(n[r*A+s]=Y,i[r*A+s]=0):(n[r*A+s]=Y,i[r*A+s]=1)}}return{width:A,height:t,data:n,mask:i}}const kg=ke(32,32,["........######..................",".....###########................","....#############...............","...####......#####..............","..###..........####.............",".###.....####...####............",".##....########..###............","###...##########..###...........","##...####....####..##...........","##..####......####.##...........","##..###........###.##...........","##..###........###.##...........","##..####......####.##...........","##...####....####..##...........","###...##########..###...........",".##....########..###............",".###.....####...####............","..###..........####.............","...####......#####..............","....#############...............",".....###########................","........######..................","................................","................................","................................","................................","................................","................................","................................","................................","................................","................................"]),Ig=ke(16,16,["................","..##............","..####..........","..######........","..########......","..##########....","..############..","..#############.","..#############.","..############..","..##########....","..########......","..######........","..####..........","..##............","................"]),vg=ke(16,16,["................","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","..####..####....","................"]),zg=ke(12,12,["............",".#....#.....",".##...##....",".###..###...",".####.####..",".##########.",".##########.",".####.####..",".###..###...",".##...##....",".#....#.....","............"]),Mg=ke(12,12,["............",".....#....#.","....##...##.","...###..###.","..####.####.",".##########.",".##########.","..####.####.","...###..###.","....##...##.",".....#....#.","............"]),Dg=ke(12,12,["............","......#.....",".....##.....","..#.###.....",".##.####.#..",".##.####.#.#",".##.####.#.#",".##.####.#..","..#.###.....",".....##.....","......#.....","............"]),Cg={"icon/spotify":kg,"spotify/play":Ig,"spotify/pause":vg,"spotify/prev":zg,"spotify/next":Mg,"spotify/volume":Dg},Mt=16,Bs=16,pi=16,Os=24;function Pg(A,t){const n=260-Mt*2-8,r=Mn(A,n,"body").length*Bs,o=t?pi+8:0;return{width:260,height:Mt+r+o+8+Os+Mt}}const Bg={id:"__dialog__",title:"",icon:"icon/computer",defaultSize:{width:260,height:120},scrollable:!1,resizable:!1,render(A,t,e){const{message:n,buttons:i,showInput:r}=e,[o]=A.useState(ft(e.inputDefault??"")),s=A.useRef(!1),a=A.useRef(!1);s.current||(s.current=!0,o.focused=!0,o.selectionStart=0,o.selectionEnd=o.value.length,o.cursorPos=o.value.length);const l=t.width,d=t.height;t.clear(Y),t.drawRect(-1,-1,l+2,d+2,z),t.drawRect(1,1,l-2,d-2,z),t.drawRect(2,2,l-4,d-4,z);const c=l-Mt*2-8,p=Mn(n,c,"body");let u=Mt;for(const f of p)t.drawText(f,Mt,u,{font:"body",color:z}),u+=Bs;if(r){u+=4;const f=Mt,m=l-Mt*2;t.drawTextInput(o,f,u,m,pi,{id:"dialog-input",onChange:()=>A.scheduleRender()}),u+=pi+4}u+=8;const g=t.getWindow();if(g===null)throw new Error("Dialog requires a window context");if(!a.current){let f=l-Mt;for(let m=i.length-1;m>=0;m--){const h=i[m],D=eA(h,"menu")+24;f-=D+(m<i.length-1?12:0);const M=_(u,f,u+Os,f+D),k=xA(g,M,h,!0,0,0,1,0,m),C=e._resolve;k.ref.contrlAction=(w,v)=>{if(v===kA){const y=r?o.value:w.ref.contrlTitle;C(y)}}}a.current=!0}Nt(g,t.port)},onEvent(A,t,e,n){const{buttons:i,showInput:r}=e,[o]=A.useState(ft(e.inputDefault??""));if(A.useRef(!1),t.type==="keyDown"){if(t.key==="Enter"){const s=e._resolve,a=i[i.length-1],l=r?o.value:a;s(l);return}if(t.key==="Escape"||t.metaKey&&t.key==="."){const s=e._resolve,a=i.find(l=>l==="Cancel");a&&s(a);return}r&&Oi(o,t.key,t.code??"",t.shiftKey??!1,t.metaKey??!1,t.ctrlKey??!1)}t.type==="paste"&&t.pasteText&&r&&Bi(o,t.pasteText)&&A.scheduleRender()}},Nn=16,so=24,lo="Increment",Og={id:"testing",title:"Testing",icon:"icon/computer",defaultSize:{width:260,height:120},scrollable:!1,render(A,t,e){const[n,i]=A.useState(0),r=A.useRef(!1);t.clear(Y);const o=t.width,s=t.height,a=`Current count: ${n}`;t.drawText(a,Nn,Nn,{font:"body",color:z});const l=t.getWindow();if(l===null)throw new Error("Testing app requires a window context");if(!r.current){l.controlList.length=0;const d=eA(lo,"menu")+24,c=Math.floor((o-d)/2),p=s-Nn-so,u=_(p,c,p+so,c+d),g=xA(l,u,lo,!0,0,0,1,0);g.ref.contrlData={default:!0},g.ref.contrlAction=(f,m)=>{m===kA&&i(h=>h+1)},r.current=!0}Nt(l,t.port)}},Hg=`// lil: Learning in Layers

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
`;let _e=null;const Gt={goNotify:()=>{},alert:()=>{},open:()=>{},save:()=>{},show:A=>{A&&A.length&&console.log("[decker show]",A[0])},print:A=>{A&&A.length&&console.log("[decker print]",A[0])},play:()=>{}};function Sg(){const A=`
const go_notify = (deck, dest, t, url, delay) => { hostCallbacks.goNotify(deck, dest, t, url, delay); };
const n_show = (a) => {
  if (!a || !a.length) return undefined;
  // Show listener output — forward to host callback so the app can surface it.
  hostCallbacks.show(a);
  a[0] = a[0] ?? null;
  return a[0];
};
const n_print = (a) => {
  if (!a || !a.length) return undefined;
  hostCallbacks.print(a);
  return a[0];
};
const n_panic = (a) => { if (!a || !a.length) return undefined; return a[0]; };
const n_play = (a) => { if (!a || !a.length) return undefined; hostCallbacks.play(a); return a[0]; };
const n_alert = (a) => { hostCallbacks.alert(a); return a && a.length ? a[0] : NIL; };
const n_open = (a) => { const r = hostCallbacks.open(a); return r !== undefined ? r : NIL; };
const n_save = (a) => { const r = hostCallbacks.save(a); return r !== undefined ? r : NIL; };
const field_notify = (field) => {};
`;return new Function("hostCallbacks",`${A}
${Hg}
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
const tick = (quota) => {
  if (typeof quota !== 'number' || quota <= 0) quota = 5000;
  if (sleep_frames > 0) { sleep_frames--; return true; }
  if (!running() && pending_popstate) { popstate(); pending_popstate = 0; }
  while (running() && quota > 0) {
    runop();
    quota--;
    if (sleep_frames > 0) return true;
  }
  // fire_async(..., nest=1) sets pending_popstate; pop after script finishes (matches decker.js interpret loop).
  if (!running() && pending_popstate) { popstate(); pending_popstate = 0; }
  return running() || sleep_frames > 0;
};
return { deck_read, deck_write, ifield, iwrite, dget, lmn, lms, ls, ln, lb, getpair, getrect, make_pair: (value) => lml(value), image_is, button_is, field_is, slider_is, grid_is, canvas_is, contraption_is, card_is, deck_is, widget_is, prototype_is, font_is, font_write, invoke_event_sync, fire_event_async, n_event, tick, NIL, COLORS, pal_pat };`)(Gt)}function Fn(A){if(!A||typeof A!="object")return null;const t=A;return Array.isArray(t.v)?t:null}function Wg(){if(_e)return _e;const A=Sg();return _e={readDeck(t){return A.deck_read(t)},writeDeck(t,e){return A.deck_write(t,e)},getField(t,e){return A.ifield(t,e)},setField(t,e,n){return A.iwrite(t,A.lms(e),n)},getString(t){return A.ls(t)},getNumber(t){return A.ln(t)},getBoolean(t){return A.lb(t)},makeNumber(t){return A.lmn(t)},makeString(t){return A.lms(t)},getPair(t){return A.getpair(t)},getRect(t){return A.getrect(t)},makePair(t,e){return A.make_pair([A.lmn(t),A.lmn(e)])},dictValues(t){const e=Fn(t);return e?e.v:[]},dictKeys(t){var n;const e=Fn(t);return e?((n=e.k)==null?void 0:n.map(i=>A.ls(i)))??[]:[]},cards(t){return this.dictValues(A.ifield(t,"cards"))},widgets(t){return this.dictValues(A.ifield(t,"widgets"))},isImage(t){return A.image_is(t)},isButton(t){return A.button_is(t)},isField(t){return A.field_is(t)},isSlider(t){return A.slider_is(t)},isGrid(t){return A.grid_is(t)},isCanvas(t){return A.canvas_is(t)},isContraption(t){return A.contraption_is(t)},isCard(t){return A.card_is(t)},isDeck(t){return A.deck_is(t)},isWidget(t){return A.widget_is(t)},isPrototype(t){return A.prototype_is(t)},isFont(t){return A.font_is(t)},writeFontEncoded(t){return A.font_write(t)},fireEvent(t,e,n){A.fire_event_async(t,e,n??A.lms(""))},invokeEvent(t,e,n=[]){A.n_event(t,[A.lms(e),...n])},invokeEventSync(t,e,n=[]){return A.invoke_event_sync(t,e,n)},tick(t){return A.tick(t)},fireEventAsync(t,e,n){const i=A;A.fire_event_async(t,e,n??i.NIL)},getCardIndex(t){const n=t.card;if(n!=null){if(typeof n=="number"&&Number.isFinite(n))return Math.max(0,Math.floor(n));if(typeof n=="object"&&n.t==="num"){const s=this.getNumber(n);return Number.isFinite(s)?Math.max(0,Math.floor(s)):0}}const i=this.getField(t,"card"),o=this.cards(t).findIndex(s=>s===i);return o>=0?o:0},colors:A.COLORS,samplePattern(t,e,n,i){return A.pal_pat(t,e,n,i)},setGoNotify(t){Gt.goNotify=t},setGridCell(t,e,n,i){const r=A.ifield(t,"value"),o=Fn(r);if(!(o!=null&&o.v)||e<0||e>=o.v.length)return;const s=o.v[e];!s||typeof s!="object"||A.iwrite(s,A.lmn(n),A.lms(String(i)))},setHostPrimitives(t){t.alert&&(Gt.alert=t.alert),t.open&&(Gt.open=t.open),t.save&&(Gt.save=t.save),t.show&&(Gt.show=t.show),t.print&&(Gt.print=t.print),t.play&&(Gt.play=t.play)}},_e}const Ce=[4294967295,4294967040,4294927616,4292608e3,4294901911,4281729175,4278190282,4278228991,4278233088,4278215936,4284823040,4288111926,4290361785,4287006342,4282729797,4278190080];function Kg(A,t,e,n){return A[e%8+8*(n%8)+64*t]}function Lg(A,t,e,n){return t<2?t?1:0:t>31?t===32?0:1:Kg(A,t,e,n)&1}function Eg(A,t,e){if(t<28||t>31)return t;const n=t-28,i=A[n];return!i||i.length===0?0:i[Math.floor(e/4)%i.length]}function Zg(A,t){const e=1792+3*t;return e+2>=A.length?Ce[t]??4278190080:(4278190080|(A[e]<<16|A[e+1]<<8|A[e+2]))>>>0}function Gg(A,t,e,n){return t>47?0:t>31?t-32:Lg(A,t,e,n)?15:0}function Tg(A,t,e,n,i,r){let o=t;if(o>=28&&o<=31&&i!=null&&r!=null&&(o=Eg(i,o,r)),!A)return o<=0?Ce[0]:o===1?Ce[15]:o>31&&o<=47?Ce[o-32]:Ce[o>47,0];const s=Gg(A,o,e,n);return Zg(A,s)}function Qg(A){const t=A>>>0;return[t>>>16&255,t>>>8&255,t&255,t>>>24&255]}function Rn(A){return A==="widgets"||A==="draw"?A:"interact"}const L=Wg(),Yg=`{deck}
version:1
card:0
size:[512,342]

{card:home}
{widgets}
`,ao=[[13,9,5,1,5,9],[4,4,8,14,14,8],[18,18,20,19,19,20],[0,0,0,0,1,1,1,1]];function Ng(A){const t=L.getField(A,"patterns");if(!(t!=null&&t.anim)||typeof t.anim!="object")return null;try{return L.dictValues(t.anim).map(n=>L.dictValues(n).map(r=>Math.max(0,Math.min(47,Math.floor(L.getNumber(r))||0))))}catch{return null}}const co=new WeakMap;function Fg(A,t,e,n){return`${Ug(A)}:${t}:${e}:${n}`}const uo=new WeakMap;let Rg=1;function Ug(A){if(!A)return 0;let t=uo.get(A);return t===void 0&&(t=Rg++,uo.set(A,t)),t}function bn(A,t,e,n,i=0,r=0){const o=e?Ng(e)??ao:ao,s=Math.floor(n/4),a=Fg(t,s,i,r);let l=co.get(A);l||(l=new Map,co.set(A,l));const d=l.get(a);if(d)return d;const{x:c,y:p}=A.size,u=new ImageData(c,p);for(let g=0;g<p;g++)for(let f=0;f<c;f++){const m=A.pix[f+g*c],[h,D,M,k]=Qg(Tg(t,m,i+f,r+g,o,n)),C=(f+g*c)*4;u.data[C]=h,u.data[C+1]=D,u.data[C+2]=M,u.data[C+3]=k}return l.set(a,u),u}function Vn(A){var e;const t=L.getField(A,"patterns");return((e=t==null?void 0:t.pal)==null?void 0:e.pix)??null}const jg=new Set(["body","menu","mono"]);function Xg(A){const t=L.getField(A,"fonts"),e=L.dictKeys(t),n=L.dictValues(t);for(let i=0;i<e.length;i++){const r=e[i];if(jg.has(r)||Vo(r))continue;const o=n[i];if(!(!o||!L.isFont(o)))try{const s=L.writeFontEncoded(o);s&&fl(r,s)}catch{}}}function xt(A,t,e=""){const n=L.getField(A,t);return L.getString(n)||e}function Jg(A,t,e=0){const n=L.getField(A,t),i=L.getNumber(n);return Number.isFinite(i)?i:e}function it(A,t,e=!1){const n=L.getField(A,t);return n==null?e:L.getBoolean(n)}function kn(A,t,e={x:0,y:0,w:0,h:0}){const n=L.getField(A,t);return n==null?e:L.getPair(n)}function Hs(A,t){const e=xt(A,"font",t);return Vo(e)?e:t}function fi(A,t=0,e=0){const n=kn(A,"pos"),i=kn(A,"size");return{x:t+n.x,y:e+n.y,w:i.x,h:i.y}}function _g(A,t,e){return t>=A.x&&e>=A.y&&t<A.x+A.w&&e<A.y+A.h}function $g(A,t,e,n){const i=xt(t,"show","solid"),r=xt(t,"style","round"),o=xt(t,"text"),s=it(t,"value"),a=Hs(t,"menu"),l=i==="transparent"||i==="none",d=i==="invert",c=z,p=Y;if(r==="invisible"){if(o){const m=e.x+Math.max(2,Math.floor((e.w-eA(o,a))/2)),h=e.y+Math.max(1,Math.floor((e.h-10)/2));A.drawText(o,m,h,{font:a,color:c})}n&&A.invertRect(e.x,e.y,e.w,e.h);return}if(r==="check"||r==="radio"){l||A.fillRect(e.x,e.y,e.w,e.h,p);const m=11,h=e.y+Math.floor((e.h-m)/2);A.drawRect(e.x,h,m,m,c),s&&(r==="check"?A.drawText("✓",e.x+1,h,{font:"body",color:c}):A.fillRect(e.x+3,h+3,5,5,c)),A.drawText(o,e.x+m+4,e.y+Math.floor((e.h-10)/2),{font:a,color:c}),n&&A.invertRect(e.x,e.y,e.w,e.h);return}if(r==="rect"){const m=e.x,h=e.y,D=e.w-1,M=e.h-1;l||A.fillRect(m,h,D,M,d?c:p),A.drawRect(m,h,D,M,d?p:c),A.drawHLine(m+2,h+M,D-1,c),A.drawVLine(m+D,h+2,M-1,c);const k=eA(o,a);A.drawText(o,m+Math.max(3,Math.floor((D-k)/2)),h+Math.max(1,Math.floor((M-10)/2)),{font:a,color:d?p:c}),n&&A.invertRect(m,h,D,M);return}l||A.fillRect(e.x,e.y,e.w,e.h,d?c:p),A.drawRect(e.x,e.y,e.w,e.h,d?p:c);const u=eA(o,a),g=e.x+Math.max(3,Math.floor((e.w-u)/2)),f=e.y+Math.max(1,Math.floor((e.h-10)/2));A.drawText(o,g,f,{font:a,color:d?p:c}),n&&A.invertRect(e.x,e.y,e.w,e.h)}function Am(A,t,e,n,i,r){const o=xt(t,"show","solid"),s=o==="invert";o!=="transparent"&&o!=="none"&&A.fillRect(e.x,e.y,e.w,e.h,s?z:Y),it(t,"border",!0)&&A.drawRect(e.x,e.y,e.w,e.h,s?Y:z);const a=L.getString(L.getField(t,"value")),l=Hs(t,xt(t,"style","rich")==="code"?"mono":"body");if(A.drawTextBlock({text:a,x:e.x+3,y:e.y+3,maxWidth:Math.max(1,e.w-6),font:l,color:s?Y:z}),i&&!it(t,"locked")){const d=a.slice(0,r),c=e.x+3+eA(d,l);A.drawVLine(c,e.y+3,12,s?Y:z)}n&&A.invertRect(e.x,e.y,e.w,e.h)}function tm(A,t,e,n){const i=L.dictValues(L.getField(t,"interval")),r=i.length>0?L.getNumber(i[0]):0,o=i.length>1?L.getNumber(i[1]):100,s=Jg(t,"value",r),a=o===r?0:Math.max(0,Math.min(1,(s-r)/(o-r))),l=e.x+Math.floor(a*Math.max(0,e.w-8)),d=e.y+Math.floor(e.h/2);A.drawRect(e.x,e.y,e.w,e.h,z),A.drawHLine(e.x+2,d,Math.max(0,e.w-4),z),A.fillRect(l,e.y+2,8,Math.max(4,e.h-4),z),n&&A.invertRect(e.x-1,e.y-1,e.w+2,e.h+2)}function em(A,t,e,n){const i=xt(t,"show","solid"),r=i==="invert",o=r?Y:z,s=r?z:Y;i!=="transparent"&&A.fillRect(e.x,e.y,e.w,e.h,s);const a=L.getField(t,"value"),l=L.dictKeys(a),d=L.dictValues(a),c=d.length>0?L.dictValues(d[0]).length:0,p=it(t,"lines"),u=it(t,"headers",!0),g=L.dictValues(L.getField(t,"widths")??{}).map(y=>L.getNumber(y)),f=16,m=p?16:14,h=u?f:0,D=l.length,M=[];let k=0,C=0;for(let y=0;y<D;y++){const I=y<g.length?g[y]:-1;I>=0?(M[y]=I,k+=I):(M[y]=-1,C++)}const w=C>0?Math.floor((e.w-k)/C):0;for(let y=0;y<D;y++)M[y]<0&&(M[y]=w);if(A.drawRect(e.x,e.y,e.w,e.h,o),u&&l.length>0){A.fillRect(e.x,e.y,e.w,h,o);let y=e.x;for(let I=0;I<l.length;I++)A.drawText(l[I],y+3,e.y+2,{font:"body",color:s}),y+=M[I],I<l.length-1&&A.drawVLine(y,e.y,h,s);A.drawHLine(e.x,e.y+h,e.w,o)}const v=Math.max(0,Math.floor((e.h-h)/m));for(let y=0;y<Math.min(c,v);y++){const I=e.y+h+y*m;let V=e.x;for(let x=0;x<l.length;x++){const O=L.dictValues(d[x]),H=y<O.length?L.getString(O[y]):"";A.drawText(H,V+2,I+2,{font:"mono",color:o}),V+=M[x],p&&x<l.length-1&&A.drawVLine(V,I,m,o)}p&&A.drawHLine(e.x,I+m,e.w,o)}n&&A.invertRect(e.x,e.y,e.w,e.h)}function nm(A,t,e,n,i,r){it(e,"border",!0)&&A.drawRect(n.x,n.y,n.w,n.h,z);const o=L.getField(e,"image");L.isImage(o)&&A.blitImageData(bn(o,Vn(t),t,r,n.x,n.y),n.x,n.y),i&&A.invertRect(n.x-1,n.y-1,n.w+2,n.h+2)}function gi(A,t,e,n,i,r,o,s=0,a=0){for(let l=0;l<e.length;l++){const d=e[l];if(xt(d,"show","solid")==="none")continue;const p=fi(d,s,a),u=l===i;if(n.push({index:l,widget:d,rect:p}),L.isButton(d)){$g(A,d,p,u);continue}if(L.isField(d)){const g=(o==null?void 0:o.widgetIndex)===l;Am(A,d,p,u,g,g?o.caretOffset:0);continue}if(L.isSlider(d)){tm(A,d,p,u);continue}if(L.isGrid(d)){em(A,d,p,u);continue}if(L.isCanvas(d)){nm(A,t,d,p,u,r);continue}if(L.isContraption(d)){const g=L.getField(d,"image");L.isImage(g)&&A.blitImageData(bn(g,Vn(t),t,r,p.x,p.y),p.x,p.y),gi(A,t,L.widgets(d),n,u?0:-1,r,null,p.x,p.y)}}}async function im(A,t,e){var p,u,g;if(!A.deck)return;const n=e._fs,i=e._os;if(!n||!i)return;let r=A.fileId,o=A.fileName;if(!r){const f=await i.showDialog({message:"Save the current Decker document to the internal filesystem.",buttons:["Cancel","Save"],showInput:!0,inputDefault:o||"Untitled.deck"});if(!f||f==="Cancel")return;o=f}const s=r?n.getNode(r):null,a=(s==null?void 0:s.parentId)??((u=n.findByName(((p=n.findByName("__root__","Mockintosh HD"))==null?void 0:p.id)??"__root__","Development"))==null?void 0:u.id)??((g=n.findByName("__root__","Mockintosh HD"))==null?void 0:g.id)??"__root__",l=o.toLowerCase().endsWith(".html")||A.sourceFormat==="html",d=L.writeDeck(A.deck,l),c=await n.writeFile(a,o,d,"text");t(f=>({...f,fileId:c.id,fileName:c.name,sourceFormat:l?"html":"deck",dirty:!1}))}const rm={id:"decker",title:"Decker",icon:"icon/computer",defaultSize:{width:512,height:342},windowKind:"presentation",scrollable:!1,resizable:!1,render(A,t,e){const[n,i]=A.useState({deck:null,fileId:e.fileId??null,fileName:e.title??e.fileName??"Untitled.deck",sourceFormat:"deck",dirty:!1,error:null,transition:null,focusedField:null,gridEdit:null}),[r]=A.useState("interact"),o=Rn(r),[s,a]=A.useState(-1),l=A.useRef([]);A.useRef(null);const d=A.useRef(0),c=A.useRef(i);c.current=i,A.useEffect(()=>{var y,I;if(!n.deck)return;(y=L.setGoNotify)==null||y.call(L,(V,x,O,H,B)=>{var E;if(typeof x!="number"||x<0)return;const S=L.getCardIndex(V),Q=B!=null?Math.max(1,Math.floor(L.getNumber(B))):30,N=typeof O=="string"?O:O!=null?L.getString(O):"";(E=c.current)==null||E.call(c,R=>({...R,transition:{fromIndex:S,toIndex:x,delayFrames:Q,name:N||"WipeRight",startFrame:d.current+1}}))});const v=e._os;(I=L.setHostPrimitives)==null||I.call(L,{alert:V=>{if(v){const x=V.length?L.getString(V[0]):"";v.showDialog({message:String(x),buttons:["OK"]})}},open:()=>L.makeString(""),save:()=>{}})},[n.deck]),A.useEffect(()=>{let v=!1;return(async()=>{try{const I=e._fs;let V=e.initialSource??Yg,x=e.title??e.fileName??"Untitled.deck";if(I&&e.fileId){const H=await I.readFile(e.fileId);H&&(V=H);const B=I.getNode(e.fileId);(B==null?void 0:B.kind)==="file"&&(x=B.name)}const O=L.readDeck(V);if(v)return;Xg(O),a(-1),i({deck:O,fileId:e.fileId??null,fileName:x,sourceFormat:x.toLowerCase().endsWith(".html")||V.includes('language="decker"')?"html":"deck",dirty:!1,error:null,transition:null,focusedField:null,gridEdit:null})}catch(I){if(v)return;i(V=>({...V,error:I instanceof Error?I.message:"Failed to load Decker file."}))}})(),()=>{v=!0}},[e.fileId,e.initialSource]);const p=n.deck?L.cards(n.deck):[],u=n.deck?Math.max(0,Math.min(L.getCardIndex(n.deck),p.length-1)):0,g=p[u]??p[0]??null;A.useEffect(()=>{if(!n.deck)return;let v;const y=()=>{L.tick(),A.scheduleRender(),v=requestAnimationFrame(y)};return v=requestAnimationFrame(y),()=>cancelAnimationFrame(v)},[n.deck]);const f=A.useRef(-1);if(A.useEffect(()=>{!n.deck||!g||f.current!==u&&(f.current=u,L.fireEventAsync(g,"view",void 0),L.tick())},[n.deck,g,u]),t.clear(Y),l.current=[],n.error){t.drawTextBlock({text:n.error,x:8,y:24,maxWidth:t.width-16,font:"body",color:z});return}if(!n.deck){t.drawText("Loading Decker...",8,24,{font:"body",color:z});return}if(!g){t.drawText("This deck has no cards.",8,24,{font:"body",color:z});return}d.current+=1;const m=d.current,h=n.transition,D=kn(n.deck,"size"),M=D.x,k=D.y;if(h){const v=m-h.startFrame;if(v>=h.delayFrames)i(y=>({...y,transition:null}));else{const y=v/h.delayFrames;t.clear(Y);const I=(h.name||"WipeRight").toLowerCase();let V=0,x=0,O=M,H=k;if(I==="wiperight"||I==="slideleft"?O=Math.ceil(M*y):I==="wipeleft"||I==="slideright"?(V=Math.floor(M*(1-y)),O=M-V):I==="wipedown"||I==="slideup"?H=Math.ceil(k*y):I==="wipeup"||I==="slidedown"?(x=Math.floor(k*(1-y)),H=k-x):O=Math.ceil(M*y),O>0&&H>0){t.pushClip(V,x,O,H);const B=L.getField(g,"image");L.isImage(B)&&t.blitImageData(bn(B,Vn(n.deck),n.deck,m),0,0),gi(t,n.deck,L.widgets(g),l.current,o==="widgets"?s:-1,m,n.focusedField),t.popClip()}o==="draw"&&(t.fillRect(8,8,196,18,Y),t.drawRect(8,8,196,18,z),t.drawText("Draw mode shell is native; tools follow next.",12,11,{font:"body",color:z}));return}}const C=L.getField(g,"image");L.isImage(C)&&t.blitImageData(bn(C,Vn(n.deck),n.deck,m),0,0),gi(t,n.deck,L.widgets(g),l.current,o==="widgets"?s:-1,m,n.focusedField);const w=n.gridEdit;if(w&&w.widgetIndex<L.widgets(g).length){const v=L.widgets(g)[w.widgetIndex];if(L.isGrid(v)){const y=fi(v),I=L.getField(v,"value"),x=L.dictKeys(I).length,O=x>0?Math.floor(y.w/x):y.w,H=y.x+w.col*O,B=y.y+16+w.row*12,S=O,Q=12;t.fillRect(H,B,S,Q,Y),t.drawRect(H,B,S,Q,z),t.pushClip(H+2,B,Math.max(0,S-4),Q),t.drawText(w.text,H+2,B+1,{font:"body",color:z});const N=w.text.slice(0,w.caretOffset),E=H+2+eA(N,"body");t.drawVLine(E,B+1,10,z),t.popClip()}}o==="draw"&&(t.fillRect(8,8,196,18,Y),t.drawRect(8,8,196,18,z),t.drawText("Draw mode shell is native; tools follow next.",12,11,{font:"body",color:z}))},onEvent(A,t,e,n){var w;const[i,r]=A.useState({deck:null,fileId:e.fileId??null,fileName:e.title??e.fileName??"Untitled.deck",sourceFormat:"deck",dirty:!1,error:null,transition:null,focusedField:null,gridEdit:null}),[o,s]=A.useState("interact"),a=Rn(o),[l,d]=A.useState(-1);A.useRef([]);const c=A.useRef(null);if(!i.deck)return;if(t.type==="mouseMove"&&a==="widgets"&&c.current){const v=(t.x??0)-c.current.startX,y=(t.y??0)-c.current.startY;L.setField(c.current.widget,"pos",L.makePair(c.current.origin.x+v,c.current.origin.y+y)),r(I=>({...I,dirty:!0}));return}if(t.type==="mouseUp"&&a==="widgets"){c.current=null;return}if(t.type==="keyDown"){t.key==="1"&&s("interact"),t.key==="2"&&s("widgets"),t.key==="3"&&s("draw");const v=L.cards(i.deck),y=Math.max(0,Math.min(L.getCardIndex(i.deck),v.length-1)),I=v[y],V=I?L.widgets(I):[],x=i.gridEdit;if(x&&x.widgetIndex<V.length){const H=V[x.widgetIndex];if(L.isGrid(H)){if(t.key==="Escape"){r(Q=>({...Q,gridEdit:null}));return}if(t.key==="Enter"){(w=L.setGridCell)==null||w.call(L,H,x.col,x.row,x.text),r(Q=>({...Q,gridEdit:null,dirty:!0}));return}let B=x.text,S=x.caretOffset;if(t.key==="Backspace")S>0&&(B=x.text.slice(0,S-1)+x.text.slice(S),S--);else if(t.key==="Delete")S<x.text.length&&(B=x.text.slice(0,S)+x.text.slice(S+1));else if(t.key==="ArrowLeft"){S=Math.max(0,x.caretOffset-1),r(Q=>({...Q,gridEdit:{...x,caretOffset:S}}));return}else if(t.key==="ArrowRight"){S=Math.min(x.text.length,x.caretOffset+1),r(Q=>({...Q,gridEdit:{...x,caretOffset:S}}));return}else if(t.key.length===1&&!t.ctrlKey&&!t.metaKey&&!t.altKey)B=x.text.slice(0,x.caretOffset)+t.key+x.text.slice(x.caretOffset),S=x.caretOffset+1;else return;r(Q=>({...Q,gridEdit:{...x,text:B,caretOffset:S},dirty:!0}));return}}const O=i.focusedField;if(O&&O.widgetIndex<V.length){const H=V[O.widgetIndex];if(L.isField(H)&&!it(H,"locked")){const B=L.getString(L.getField(H,"value"));let S=B,Q=O.caretOffset;if(t.key==="Tab"){const N=t.shiftKey?-1:1;let E=(O.widgetIndex+N+V.length)%V.length;for(let R=0;R<V.length;R++){const q=V[E];if(L.isField(q)||L.isGrid(q)||L.isButton(q)){const nA=L.isField(q)&&!it(q,"locked")?L.getString(L.getField(q,"value")).length:0;r(oA=>({...oA,focusedField:{widgetIndex:E,caretOffset:nA}}));return}E=(E+N+V.length)%V.length}r(R=>({...R,focusedField:null}));return}if(t.key==="Backspace")Q>0&&(S=B.slice(0,Q-1)+B.slice(Q),Q--);else if(t.key==="Delete")Q<B.length&&(S=B.slice(0,Q)+B.slice(Q+1));else if(t.key==="ArrowLeft"){Q=Math.max(0,Q-1),r(N=>({...N,focusedField:{widgetIndex:O.widgetIndex,caretOffset:Q},dirty:!0}));return}else if(t.key==="ArrowRight"){Q=Math.min(B.length,Q+1),r(N=>({...N,focusedField:{widgetIndex:O.widgetIndex,caretOffset:Q},dirty:!0}));return}else if(t.key.length===1&&!t.ctrlKey&&!t.metaKey&&!t.altKey)S=B.slice(0,Q)+t.key+B.slice(Q),Q++;else return;L.setField(H,"value",L.makeString(S)),r(N=>({...N,focusedField:{widgetIndex:O.widgetIndex,caretOffset:Q},dirty:!0}));return}}if(t.key==="ArrowRight"){const H=Math.min(v.length-1,y+1);L.setField(i.deck,"card",L.makeNumber(H)),r(B=>({...B,focusedField:null}))}if(t.key==="ArrowLeft"){const H=Math.max(0,y-1);L.setField(i.deck,"card",L.makeNumber(H)),r(B=>({...B,focusedField:null}))}return}if(t.type!=="mouseDown")return;const p=t.x??0,u=t.y??0,g=L.cards(i.deck),f=Math.max(0,Math.min(L.getCardIndex(i.deck),g.length-1)),m=g[f],h=m?L.widgets(m):[],D=[];for(let v=0;v<h.length;v++){const y=h[v];if(xt(y,"show","solid")==="none")continue;const I=fi(y);D.push({index:v,widget:y,rect:I})}const M=D.filter(v=>_g(v.rect,p,u));if(M.length===0){a!=="widgets"&&a!=="draw"&&r(v=>({...v,focusedField:null,gridEdit:null}));return}if(a==="widgets"){M.sort((y,I)=>I.index-y.index);const v=M[0];d(v.index),c.current={widget:v.widget,startX:p,startY:u,origin:kn(v.widget,"pos")};return}if(a==="draw")return;M.sort((v,y)=>{const I=x=>L.isButton(x)?0:L.isCanvas(x)?1:L.isSlider(x)?2:L.isGrid(x)?3:L.isField(x)?4:5,V=I(v.widget)-I(y.widget);return V!==0?V:y.index-v.index});const k=M[0];if(L.isField(k.widget)&&!it(k.widget,"locked")){const v=L.getString(L.getField(k.widget,"value"));r(y=>({...y,focusedField:{widgetIndex:k.index,caretOffset:v.length},gridEdit:null,dirty:!0}));return}if(L.isGrid(k.widget)&&!it(k.widget,"locked")){const v=L.getField(k.widget,"value"),y=L.dictKeys(v),I=L.dictValues(v),V=y.length,x=V>0?Math.floor(k.rect.w/V):k.rect.w,O=p-k.rect.x,H=u-k.rect.y,B=Math.max(0,Math.floor((H-16)/12)),S=Math.max(0,Math.min(V-1,Math.floor(O/x)));let Q="";if(I[S]){const E=L.dictValues(I[S])[B];Q=E!=null?L.getString(E):""}r(N=>({...N,focusedField:null,gridEdit:{widgetIndex:k.index,row:B,col:S,text:Q,caretOffset:Q.length},dirty:!0}));return}if(r(v=>({...v,focusedField:null,gridEdit:null})),L.isButton(k.widget)&&xt(k.widget,"style")==="check"){const v=it(k.widget,"value")?0:1;L.setField(k.widget,"value",L.makeNumber(v))}let C;if(L.isCanvas(k.widget))C=L.makePair(p-k.rect.x,u-k.rect.y);else if(L.isGrid(k.widget)){const v=Math.max(0,Math.floor((u-k.rect.y-16)/12));C=L.makeNumber(v)}L.fireEventAsync(k.widget,"click",C),L.tick(),r(v=>({...v,dirty:!0}))},getMenubar(A,t){const[e,n]=A.useState({deck:null,fileId:t.fileId??null,fileName:t.title??t.fileName??"Untitled.deck",sourceFormat:"deck",dirty:!1,error:null,transition:null,focusedField:null,gridEdit:null}),[i,r]=A.useState("interact"),o=Rn(i),[s]=A.useState(-1);A.useRef([]),A.useRef(null);const a=e.deck?L.cards(e.deck):[],l=e.deck?Math.max(0,Math.min(L.getCardIndex(e.deck),a.length-1)):0,d=a[l]??a[0]??null,c=d&&s>=0?L.widgets(d)[s]??null:null,p=()=>n(f=>({...f,dirty:!0})),u=f=>{if(!c)return;const m=it(c,f)?0:1;L.setField(c,f,L.makeNumber(m)),p()},g=f=>{c&&(L.setField(c,"show",L.makeString(f)),p())};return[{label:"File",items:[{label:"Save",shortcut:"S",disabled:!e.deck,onClick:()=>{im(e,n,t)}}]},{label:"View",items:[{type:"radiogroup",value:o,onValueChange:f=>r(f),items:[{label:"Interact",value:"interact"},{label:"Widgets",value:"widgets"},{label:"Draw",value:"draw"}]}]},{label:"Cards",items:[{label:"Previous Card",shortcut:"[",disabled:l<=0,onClick:()=>{if(!e.deck)return;const f=Math.max(0,l-1);L.setField(e.deck,"card",L.makeNumber(f)),p()}},{label:"Next Card",shortcut:"]",disabled:!e.deck||l>=Math.max(0,a.length-1),onClick:()=>{if(!e.deck)return;const f=Math.min(a.length-1,l+1);L.setField(e.deck,"card",L.makeNumber(f)),p()}}]},{label:"Widget",items:[{label:"Toggle Locked",disabled:o!=="widgets"||!c,onClick:()=>u("locked")},{label:"Toggle Animated",disabled:o!=="widgets"||!c,onClick:()=>u("animated")},{label:"Toggle Volatile",disabled:o!=="widgets"||!c,onClick:()=>u("volatile")},{type:"separator"},{label:"Show Solid",disabled:o!=="widgets"||!c,onClick:()=>g("solid")},{label:"Show Transparent",disabled:o!=="widgets"||!c,onClick:()=>g("transparent")},{label:"Show Invert",disabled:o!=="widgets"||!c,onClick:()=>g("invert")},{label:"Show None",disabled:o!=="widgets"||!c,onClick:()=>g("none")}]}]}},om=`{deck}
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
image:"%%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"
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
galena_up:{"type":"canvas","size":[243,239],"pos":[271,133],"locked":1,"image":"%%IMG3APMA7wZAgHBILBqPyKRyCQg4ncyodEqtWq/YrHbLfXqf3LB4TC6bz8qvGoxuu9/wOHZNl9vv+PyY7gSBvHqBgoNlfGlqfol/bISNjo9IfIBHiIqJk5CZmoGSakaVln6Ym6SlbZ1rRKChi1Cmr7BhdKGeTV+siqOxu7xMq7SduJe6vcXGtl7Cw2vKy4bH0Ka3zaK/wqgB0dqZ09TO3tWo2+OEyeDnrNiu5Ox35ujwzgGWX+32ce/x+rj19/5o+fYJzMXon0ExAQcOJHaw4ZWECvcxdEhRCsSI8WpV3BjlIsZW6lJxHEnpyUd5ITuRXCnEI7yUMCey/OeSGioCOHPq3LlT0syK3c514km0KM9nPw/WBKbGqNOnOZEmHcdHaFOoWLGKnKpNErg1WcNC3cr1WFWbYMWqdaqxbLFZaL+snfu0n1teQeMGoMt3rMy7mpYSdNK3sNG2gEsJDme4cVHEiQOb9ObFseWediNL7kOZsFZslzEX1PxIcGWiMZ+EjpqZdCPTnkWnjh0asmtOk5Wplj1792rbt/HkpUcbJ6praVcT+BtcjkvfrIfrvvqbefM30hnrtNb5tPLW1+1kh278Ym5+3pdfth4eIETy0pkhj02+L/j2+M5r364/HHf/0a3HHn5dyDfYUfphk85p9RV2H4GyeDXYXrJNCNeCu6XX2IAQUhEMcRTyd96H6PnWoH0cdtjRWSAiOKKEJdJXnGEPqvhQdgDyZuF//oV4Ioqj2ThHfyCGKCJnPfIIko8zbhikkFY8d2JAx4lSJJNGuijJYylC+Yl5P1IZ0pUBHrVcSKh16WVL8f14ZoIKkllelm/ClOY6a05hjYZRzQknjPKIeKedvOXpoTpcUvgLoEkK6qJedNZpqJ6I3hkdkZDK2CSmch6ZzaS+oOmip/Ogk9ybhyE5XX1qQklHArDCymd6Sl4JH1uqrkpnqzaqEeuvsm4KnYHzySUWp536+SmoJXkBLLBT0nahrXz6VWp3uz7JrK/PQtukerylNheyRWq5LLNsPtFtt24OKq5a5E44KLpDcLuut5Gm2lu++lolLJ6g2nvvr+0eWScfjoYVrzPzovvFwPdWO+rEj621cI6FBuwsxAMX3GDB8Oaqa6LnrvkwxxB7nKiAIhdLcslCnoxyyt9ay7KpYWoLocwz08wXv+NejLGWJvPcc8Q1K0fySzkD3KHAR69rrNLWXusvv7zeZXTU7M4jMdWX6vN1jc1tzXWsASQw2ddg15mRm1lztfHZaJ/FNtWLBaovzOGZzfGYQ7cd9tVAH/y0ukfHJK/gR2J7t6Q7I/53b4szfnCx1OHq9HVzI81H1wmB7Bh3W362edmSS/256qE/PvpsCut8W+f4Qg06kacqnVLQspNGe91+395ykqLzjjCQfAf3+6s0T4th7pYdj3zkTtSeOuss6jq15Q7GzRLPqz+rDtOuc1819WkHu6/zmRZu/vkEbrx+yXkT//708atbS0jNWt3+/chLnmt8ogoCfkloIAGgk043wDoUaHguU2D3GOg7smihftuToPHyR7YqYLB4GiQZ+gR4IwgyJWkhrBoJK7jCKAmtfCncG71caMJyxfBnvZvhAWvIsBvSxXuTqlUGfRg7Cuqwf+8ZIhGzAsQgvmuJIcvhEYsQEyj+UIpT3OFQrGgxLGZRi3TgYheN+EUPglCMhitjhFCIRqKp8YHua+OR3ghHORaxhXRcAgzl2EQ17rGNffyiEu3YsDyWMI6EhJwhaYhIQgYyi38EpBcXWUA2JlKRlLRIJNH4yCNukpOTzOQnxdjJGQ7ykrLJJKUsicpS0muUpAzlImHJRVdui5ZWtKXGWNlKWdLxlKhMpSr1eMZE6tJQuKylL9+YzFwus4zADOYch5mEZjqTjKIspjGfCUlrQvGYXvLmN7k5RXEuEZwxMycR0dkrbV6SnYdz5zaxmUd1npOcppTnPPH4S3uuE58O0+c+qVlJXkrzUgRNl0EP6qeEIqORDFVWQqMZUWES1J/jpKcgMXpPjZaTox3lZzcXWlFMZpOkFYUn6gQaTJUqj6W9BGg4QRpSatK0pqqkaEndSMnM7dR0Is0nTFsq03SidKcu1YxOf2rRei6VqZcK6i6P+tOkau2msfSoE6nKVKuW5alQzRg0sSpJrboKrGEV60eHWtWivpStbXVrA7maVol6kqwD1SFa6/oyvcI1rR1s518B61WH7JWvdZHrVwfL18Di57CI1Vxh7wHZyEpWsSuprGUvK9XI4LWrjmUhXTeb2NAC5rOENa1bUJvayRpDs6S9o2vxwtjYvsysma2tbd2FW47AdrdRxCw7WGtb1Y6EuMWd7SZ+C9wrCjcayAUucL6n2+YCtbf+iG5zp3vc6lr3up2lrHa/y13Deve7sg0vVcaL3oOptyvnbW96ScJe+dp1I/W1bxopwlz9Rk+5cMivf01qEAH7t7zrHe2Aa2PcXvR3wa9LCXTjC+Fj7Yu2Cq4wy+YnDQprOL0XXq6HP/xfdWwGoiS+plTKMeIUt82Br2mxi1+M4PxkeMY+tGAeDIxjGjWYDDzu8QQLG2QhBxC7F5SxkRmnY+woecmCa/IpngzlKP94SDeuckiRfKgsa/mf7Czyl3383HqJecz4c7KX0XzDK3cZxWx2ZJkVGufWvleTVK6z7mAM5DzruToGXCOc/wzKQG/hwYROoTgQ4udE463GK1qzo8HMZYUOetJy9h6iMb3lOz+U04iFdCTODGockpPUpXYukjed6jZnjdWtjmHcUB3r4L4X1rXW4JVxnWsJqiEI","scale":1}
galena_squint:{"type":"canvas","size":[244,239],"pos":[307,170],"locked":1,"image":"%%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","scale":1}
galena_neutral:{"type":"canvas","size":[244,239],"pos":[310,47],"locked":1,"border":1,"image":"%%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","scale":1}

{script:puppets.0}
on click do
 me.index:999
end
{end}

{card:card2}
image:"%%IMG3AgABVgZAgHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4MKUAiBEbjpe4ceLF7BxLfgwZ3eTLlc9dRgwCROPM0jYrmdy5tGfKoJlt/nxEsmnTrFMnWy3ZiOvXpWPLNkZ7MpHbuDvr3j3sMu7aAIAHP62YODHlx2kvzz3cuS/owTdPh03b+i7H27mDDy+8t3dc48lT56yeeffztRq3n7+8N2r4seTT3y+e/frm+MGiH38ETudYgPklVuCC9d2HICsDMiihew++EuGEC1ZXISoXYkggchum0qGH5dknWoimjMigiSwCiGIoKvLX4owavphJjOr1RsCOPPboo4+r2ehJevPR9uORSP54opCa4JjdZElGKSWPSzIZiXbtQTnlllv6ZiUkq2XZGJdkcunll41gSd6YZbbZ5YFoMmLcmo65aeeUcMaJCJF0Xnbnn0rWqCcgTr425maAAgrioIMU+h+VOiZa5qKMEqpgjokB2aKkeOZZ6R+OMockjQFwmqSnn/LhKJunklqqqTtSmmoeqyImpauZwkqArLPaUWiurSIaqa689joHn4baeiurwTJLrIPG1oEjsLG+Wi21b+qqKbTRyoHsej3WuSu22t6JardxfCtquKuVy6mg6LbxLbZGupvoufG+0SG549Zrr5345ovGnOKNyuK/bQYssBjS9Xckrgi/6eLCZDRc8MO4IhpxvxNTHEaY0Vm7bcZaIqywx1xg5zDGJJdsMrwoZ+Gks+y27GfEMMd8xbT8XktjecnSbLC/IwegMxjqCg3pz7kFrXSsHA9bc8dHy3yp08sybaBkQ8/IstFVd7Fvz1PP2KeyX29adNgpSx0lrmcHe7bIS4PNttVEv53x1mRfvZ24Zd+988ESa/0k2f1iSm7OgiexWQKQQ/500Sz+jXjiitPNceNT9BZ5ApeXbV94k2M+99qcQ2Ff5KHXPbrll/tN+uLcpt6aiZ+37nNzpMGOttxi/r677Y63+Dnowmcdan+aBxpAkfwyzvaMx7OevN4qN9i67L5/TXwRxldvffPYq+n09v7F7bzd31+We2LiH1+66xmbmf7s158c9mTiIxZ/9fPr1+7UJjHoXW9zxHPM/xYYv9Ixi0ZkWp7S9BczBTLwgvLrW89MNKn74Y98CGycBTFIQskdsFrBSmHh6PM06S1shCW8IOA6eEIBKm8/LaydzmAYQwZyLWE1tGGzZKRBqh2Nhz1sIGcCCKQu3ZCIJ6TgC+GXxPEBkD1MLNfyHtUsEVKxh/x73/NKBMKXefCDZXQhupDoQ/eJcWUbmxoLHajGaDWmhLS5YvqyaKpa/bB8DKmdDrdxRxmupn9E4qOk1OWePwJSIeeSojUK+b88irF3F4ujytpVOEhSqljsqwYlL2mzMTIvjlEjYKeMKBAFOehMQ8BMaL5YSoIxL4jvIhwQB/kPV7roUtB6jzPuWMvPxEhj7nKbm+qID2ACyJmhTI4wVVPMV3LvfDN8lsvMxUt/QDOW/rHmNJcxTir40ZGoVBQz7XE1yrRzYu8sFm/kac5r+g6X6ezkQeIpBH7+5oySBMY6mbDFRuIzn480iN8e409wmvJ88CjoNhG6y2i2co+KWegvz0hGi1rGntpTJEVRVxDZKec+IA3oNxh5uDKONILd3IdJE7nRh4bMo+aQqO5emlCCcI+m7ANpI9uxxWzydJkx1cc1gepQNEZGqDc96r2SOsxq8sqeEUINVIOUU6ieUqp/Uuk8rWofh9p0PUHrJ0dvKVZqSHCnYO3aNMjaMr6JR61nbSkswfHWg8ZVrs+gayntuh68Zk6W4WApHP+KVFY+x0QNiKxkJ0vZylq2sq8LWVq92siOkiN7/3EpY7uoDPtc9rSntZmBQibNvB6uP5/F5C1Hy03H/oI2qM3tZWs5x4LCNrYQpG1jbcuLzej2uJQ1LnIjy1nmZYiq1wiucIdbDOUuF7mXwa5sg+faw37UPtMFGHRnkd3rXlcy57WlAVc03myAN7wVFUZ5zavdxqR3uyyU0EBXClf4Rk2g6KXvcu1L3+aSyHfzECl89yuiAAu4vgEQsIEPzDfidtWv/vVZLybz4AEn5sETpnBI5aHg8DI4RY7psIcRA+IQi/imOP2uaDM8te+kWMXHJbCEM/vie0a0v/49MSlujOPc6njHgxVxW7lhVBqTFj1HLvJuP6xiuh6YnuIosYnbewoiS3nKLC5ylCcLNwxhma9ADjKXURzmL4O5zTiGc4vx+6Ezd0PL0xUyjKjsZsyOuc9xBq0Bl+zWNC94zaXgM6DJrOhFu1nQhyV0YPEsXD2DotGL9rKj+6zYSO/VvYY+tIUhFOFNM/fPpv5yp+eGWFBj2MmW/oScAa3pVGd61RWu0iQpXWlED7nUm0a1rTmNazTG+rahFnWMLZTqWg/b0cX2rqtn7OQa46LZwn42tNda51FT89Ww9vUoTO1sbZPbxbnGRpOr/WRbBDvb5t42t3F4bBuDO9zeVsW7Zx3vYfu2wrtOtrJzIW9+99vf8x50wKnN7roR/NYGPzjCEz43UQp84NemNbwlfm6K33PZs7n4lvOdCogDm+MH/3doxa2LdTccsLcwOcoLbN0VP1fXIb93tevNCZnPXLK1tHmBynkMXmM85sTGdLwFe/LUelyvn36syEcO8lZIuebPZjqHjfx0qNvZ3gx/uYYzXuX5aruuXt84umEs6QTpfOcsD0Wgt35210Q719lee9rj3uCpU/3hcy53x7s+6I5GvAF6Z/vXZWF0NZMcFR12sLnvPuhw3thi+jXPhht/dHcHvulZDzGkDbpyHrNX8y33e+drEXml27qvvalw6WNvZj632hacXz0tPt/v5pbZabMH2YSOfHvy5v7vZDfvxiHuacMJB8bYxGhI49n04rs97GJ3ePLvC/rXezzJNx8Pn8L0Z5y3wuXZbzfrkdz9jq/X8GYbOmYwCVmnm5/Nb385zzfB/vbv+/0G5Xy95Ru3QX2Ch3hlxSGq53iPdwrst3QGZoCucnOG11pkpHj+1yKJdny6t3s0d3jMB4Dgl3kXIlSS52cJKAoc2IGz8IEgqHHd1VLwJ4DDJ3z3BGGLNwnol37qt37c13u4Bk2/p2R0Nn3KF3WYsIM8CHNI94NA6EczWDk9Znj05npct3+gsoA0hoWa4IIcB2kS2CJTeGXLx2htZwgryIC64IUoB1oDMoFjSIZW+GZ8ZylamGFcmAls2IaM9IbxF4dy+IIoWId+kIbKVnVWd4SCOHHcph9iCIgvVoZmmId0oIRL6D1rqIj+V3eKBYeQ2GNzaH+ESCt3iIej6Al7mHJFGH2Y94mRuIjJlYOCYImXuD67kIqht4rTp16J54ra83kN2AfoVIv6BHgrtokwSHndRnjcZYPyh4yohYRoaIhqmIlOyIi9yIq6uIwkEzxld4a+UopbeIqdgIuDR4S05yFa51qSSIfBGI7iaIrvaArmKG9T2Io1OHoBaCLiIWayeAfDSIyFg4isUI/J6IugqIwYiFtXB476Qo3jOI+kYJBJF4MIuSK1hyuP5pBsQIsCiYnbl2PtyH4XWZK7SDLJSJDSEo9wJ5HjponQ+I3MaJLPaFWMVnAq6S0QiW8uKXcf6H0zSZNVWEpfSIlis5MtmZOQ93OiKJSguI8ayYfk+AUB+ZE01JOfwJRN6ZQUto29oZUcOQYeaZU9KAta+WZc2ZWhshpniYBTuQVjSZZdo5Sl0JaDmJb5qI8dZZeTSJdngJT6Z5STwJeTiJenp165RphAJ5idA5iBiZXlqJhuGZR4CRxrGYo/F5Zw6ZiPCZn8J5kKaZgAxVkHyJSMqToseYmaqYeSOZkWGYiUyV2H1ZqrOTipqZqn2QiteWqxOYAqV3hotJu5uQRxKZf245mYsJuuCYjO+IqvOZJPiJxVwJlLWJuVoJyTGYfE15vB80HKaZ1RUJzGOZDSOZjf+Zt9goKfaIKYaZrDCT7UiZvgCQnYuZzoaFnZCIA3VZ/zSVDxWYv/GJnYqZfeiJ/c2VshVZ+TKS+3aZwB+pn8GZohA2a+iFXtCZbv2Vr5N55X+ZaKoKC8mZ/MQaEVanknKJzv+Z9kKY0+CaLbqDj2V6Jf6aLDqaIr+qDXCaKLiZ4jSqLrOaM62p/w2aAcSj/liQg62pdBmXcH2ox0l6SnaaPjyaI9l6Q7ipgVFo1N2nwXqphCalZF+lJU2oVWqqRY+h+i+JrqaHZl6poVI6VFiqOP0KZmuorCpovc+aR0GqJvuqFhmkseGgh7WqfHZIW8SKBGOKixeKT/5Kd/ukgZegeKaqCbxKQ0WHmTOoliCaeP+l+gkKlpej4i+Ye+CYsK2p+c2qmplJWgSqlAeoVSWKoxaaV5mKqqKqdI2qquinWwyo9OaqpByoW2eqtfmge66o6luavo5ZW8CqrCSqSqukqBaqzHqqxdCpNj06zOun/iGa3/gquDUK1niSUMKa5XSpXQ6q3kyZrmmpmk0q6aepTpqq7SyqiSCq/u2iL4eq7yin30qknFKgf7Oq7lOrCrOaz/Gjg5OrAYmqzmWm8Im7Cus7AMW7Hn6ZndKrE4E6loYLEei6IYO68ae5x+CQgfe7KEeWwRO7IDJAko+7IEG7KOyrJaFLBrALM4O3OxlrE0+60zUgg5G7SqCJkr27Op9LN+ILRKy4klaxsia7T1mjF6sLRUi21E+7RQqzwtgwdV27Umt5kzm7UUpYF14LVm25B1WLRiO1zW1wZn+7atJ7P+urbyaLNMALd4q4ltE7Z0y1hjagZ5G7ij2rROy7d967fgigWCu7iiuLdze7g8aa9NwLiUu6iEO6SPC7kRybGV27maqbaaC6l2SwSdW7kQi7WhuzF/2wWly7gHi7qpu7Gj27qLS3SoabixS1uJ+wS0G7gp2Ji4m7ujtbuT27t4+7tSALrCC6jTKgTGm7fIe7uZu7xJebnF+7ymi2g8S72bWwbY67m+przcO1XT+r3ZO4/iO77qJLkAYL6Uy2Dpq761Jbnu67rhG7/yy7Y8V7+1K274m78durrXy7/HC7+wC8DJZLtSQMCCa8AHjMDagnpWwMC+678PDME+C44UDL0WHLwYrLsntsEFLJHb+8Gb+44iDLcnVsImXLfBmMJvK2T/28Lz24AwfLYyPMM0zLZTcMNmq2c6vMMVpZQ+7LVAHMRCDFPjVcRde8QXnMQJTHJMXLWWhsRQPJBQMMVLy5EsfMW9RlVarLQ7a8VerLVVFwQ="

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

`,sm=`{deck}
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
image:"%%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"
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
image:"%%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"
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
image:"%%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"
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

`,lm=`{deck}
version:1
card:0
size:[512,342]
name:"The Decker Tour"

{fonts}
deckbuilder:"%%FNT1GCABIAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhBAAAAAAAAAAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAOAAAOAAAAAAAOAAAOAAAOAAAOAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAACIFAAAAAAAA2AAA2AAA2AAA2AAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIwoAAAAAAAAAAAAZgAAZgAAZgAAZgAAzAAAzAAD/wAD/wAD/wAAzAAAzAAAzAAD/wAD/wAD/wABmAABmAABmAABmAADMAADMAADMAADMAAAAAAAAAAAAAAAAAAAAAAAAAAAkCwQAAAQAAAQAAD+AAH/AAP/gAP/gAPXgAPXgAPXgAP3gAPwAAH4AAD8AAB+AAA/AAAfAAPfgAPXgAPXgAPXgAPXgAPXgAP/gAH/AAD+AAAQAAAQAAAAAAAAAAAAAAAAAACUOAAAAAAAAAAAAeDAA/HAA7GAA7GAA7MAA7MAA7MAA7YAA/YAAeYAAAwAAAwAABgAABngADPwADOwADOwAGOwAGOwAGOwAMOwAMPwAMHgAAAAAAAAAAAAAAAAAAAAAAAAAJg0AAAAAAAAAAAAfAAA/gAB/gAB7gAB7gAB7gAB/gAA/gAA/AAAeOAA+OAB+OAB/eAD/eAD38ADj8ADj4ADx8ADz8AD/+AB/+AA/OAAeOAAAAAAAAAAAAAAAAAAAAAAAAAAnAwAAAAAAAAAAAOAAAOAAAOAAAOAAAOAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgGDAAAHAAAOAAAOAAAcAAAcAAAcAAA8AAA8AAA8AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA8AAA8AAAcAAAcAAAcAAAOAAAOAAAOAAAHAAADAAAAAAAAAAAAAAAKQbAAADgAABwAABwAAA4AAA4AAA4AAA8AAA8AAA8AAAcAAAcAAAcAAAcAAAcAAAcAAAcAAAcAAAcAAA8AAA8AAA4AAA4AAA4AABwAABwAABwAADgAADAAAAAAAAAAAAAAAAqBgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAALQAAHgAAHgAAHgAALQAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACsJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAHAAAHAAA/4AA/4AA/4AAHAAAHAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAADgAADgAADgAABgAABgAABAAAAAAAAAAAAtBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAAPgAAPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC4EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAA8AAA8AAAAAAAAAAAAAAAAAAAAAAAAAAALwYMAAAMAAAMAAAcAAAcAAAYAAAYAAAYAAAYAAA4AAA4AAA4AAAwAAAwAAAwAABwAABwAABwAABgAABgAABgAABgAADgAADgAADAAADAAADAAADAAAAAAAAAAAAAAAAAAAAwCgAAAAAAAAAAAD8AAH+AAP/AAP/AAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAH+AAD8AAAAAAAAAAAAAAAAAAAAAAAAAADEGAAAAAAAAAAAAHAAAPAAA/AAA/AAA/AAA/AAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAMgoAAAAAAAAAAAA/AAB/gAD/wADzwADzwADzwADzwAADwAAHwAAHgAAPgAAfAAA+AAA8AAB4AAB7wADzwADzwADzwAD/wAD/wAD/wAD/wAAAAAAAAAAAAAAAAAAAAAAAAAAzCgAAAAAAAAAAAD8AAH+AAP/AAPPAAPPAAPPAAPPAAAPAAAPAAA+AAA/AAA/AAAPAAAPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAH+AAD8AAAAAAAAAAAAAAAAAAAAAAAAAADQLAAAAAAAAAAAAB4AAB4AAD4AAD4AAD4AAH4AAH4AAH4AAP4AAP4AAO4AAe4AAc4AAc4AA/+AA/+AA/+AA/+AAB4AAB4AAB4AAB4AAB4AAAAAAAAAAAAAAAAAAAAAAAAAANQoAAAAAAAAAAAD/wAD/wAD/wAD/wADwAADwAAD3AAD/gAD/wAD/wADzwADjwAADwAADwADzwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAAA2CgAAAAAAAAAAAD8AAH+AAP/AAPvAAPPAAPPAAPPAAPAAAPeAAP/AAP/AAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAH+AAD8AAAAAAAAAAAAAAAAAAAAAAAAAADcKAAAAAAAAAAAA/8AA/8AA/8AA88AA88AA84AA84AAB4AAB4AABwAABwAADwAADwAADwAADwAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAOAoAAAAAAAAAAAA/AAB/gAD/wADzwADzwADzwADzwADzwADzwAB/gAB/gAB/gAD/wADzwADzwADzwADzwADzwADzwADzwAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAAA5CgAAAAAAAAAAAH8AAP+AAP/AAPPAAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAP/AAHvAAAPAAAPAAPPAAPPAAPPAAPPAAP/AAH+AAD8AAAAAAAAAAAAAAAAAAAAAAAAAADoDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAA4AAA4AAA4AAAAAAAAAAAAAAAAAAAAAAA4AAA4AAA4AAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAOwMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAADgAADgAADgAAAAAAAAAAAAAAAAAAAAAADgAADgAADgAADgAABgAABgAABAAAAAAAAAAAAAAAA8CQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAeAAB+AAH4AAPgAAH4AAB+AAAeAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD0JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AA/4AA/4AAAAAA/4AA/4AA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAADwAAD8AAA/AAAPgAA/AAD8AADwAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/CQAAAAAAAAAAAH8AAP+AAP+AAOeAAOeAAOeAAOeAAOeAAAeAAA8AAA8AAB8AAB4AAB4AAB4AAB4AAB4AAB4AAAAAAB4AAB4AAB4AAB4AAAAAAAAAAAAAAAAAAAAAAAAAAEARAAAAA/AAD/wAH/4APA8AOAcAcAOAc7uAd/mA5/mA5zmA5zmA5zmA5zmA5zmA5zmA5zmA5zmA5zuA53sA5/8Ad94Ac4wAcAAAOAYAPh4AH/wAB/AAAAAAAAAAAAAAAAAAQQoAAAAAAAAeAAAeAAAeAAAfAAA/AAA/AAA/AAA/AAA3AAA3AAB3gAB3gABzgABzgABzgABzgAD/wAD/wAD/wAD/wADzwADzwADzwADzwAAAAAAAAAAAAAAAAAAAAAAAAABCCgAAAAAAAP8AAP+AAP/AAP/AAPPAAPPAAPPAAPPAAPPAAPOAAP8AAP+AAP/AAP/AAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAP+AAP8AAAAAAAAAAAAAAAAAAAAAAAAAAEMKAAAAAAAAPwAAf4AA/8AA/8AA88AA88AA88AA88AA88AA8AAA8AAA8AAA8AAA88AA88AA88AA88AA88AA88AA88AA/8AA/8AAf4AAPwAAAAAAAAAAAAAAAAAAAAAAAAAARAoAAAAAAAD/AAD/gAD/wAD/wAD3wADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwAD/wAD/wAD/gAD/AAAAAAAAAAAAAAAAAAAAAAAAAABFCQAAAAAAAP+AAP+AAP+AAP+AAPAAAPAAAPAAAPAAAPAAAPAAAP4AAP4AAP4AAP4AAPAAAPAAAPAAAPAAAPAAAPAAAP+AAP+AAP+AAP+AAAAAAAAAAAAAAAAAAAAAAAAAAEYJAAAAAAAA/4AA/4AA/4AA/4AA8AAA8AAA8AAA8AAA8AAA8AAA/wAA/wAA/wAA/wAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAAAAAAAAAAAAAAAAAAAAAAAAAARwoAAAAAAAA/AAB/gAD/wAD/wADzwADzwADzwADzwADwAADwAAD3wAD3wAD3wAD3wADzwADzwADzwADzwADzwADzwAD/wAD/wAB+wAA8wAAAAAAAAAAAAAAAAAAAAAAAAABICgAAAAAAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAP/AAP/AAP/AAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAAAAAAAAAAAAAAAAAAAAAAAAAEkEAAAAAAAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAAAAAAAAAAAAAAAAAAAAAAAAAASgoAAAAAAAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwADzwADzwADzwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAABLCwAAAAAAAPHgAPHgAPPAAPPAAPOAAPeAAPeAAPcAAP8AAP8AAP4AAP4AAP4AAP8AAP8AAP8AAPeAAPeAAPeAAPPAAPPAAPPAAPHgAPHgAAAAAAAAAAAAAAAAAAAAAAAAAEwJAAAAAAAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA/4AA/4AA/4AA/4AAAAAAAAAAAAAAAAAAAAAAAAAATQ4AAAAAAAD4fAD4fAD4fAD4fAD8fAD8fAD8/AD8/AD+/AD+/AD+/AD+/AD//AD//AD3vAD3vAD3vAD3vAD3vAD3vADzPADzPADzPADzPAAAAAAAAAAAAAAAAAAAAAAAAABOCwAAAAAAAPHgAPHgAPHgAPngAPngAPngAP3gAP3gAP3gAP/gAP/gAP/gAP/gAP/gAPfgAPfgAPfgAPPgAPPgAPPgAPHgAPHgAPHgAPHgAAAAAAAAAAAAAAAAAAAAAAAAAE8KAAAAAAAAPwAAf4AA/8AA/8AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA/8AA/8AAf4AAPwAAAAAAAAAAAAAAAAAAAAAAAAAAUAoAAAAAAAD/AAD/gAD/wAD/wADzwADzwADzwADzwADzwADzwAD/wAD/wAD/gAD/AADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAAAAAAAAAAAAAAAAAAAAAAAAAABRCwAAAAAAAD8AAH+AAP/AAP/AAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAH/AAD+AAA4AAA8AAA8AAA+AAAAAAAAAAFIKAAAAAAAA/wAA/4AA/8AA/8AA88AA88AA88AA88AA88AA94AA/wAA/4AA/8AA/8AA88AA88AA88AA88AA88AA88AA88AA88AA88AA8+AAAAAAAAAAAAAAAAAAAAAAAAAAUwoAAAAAAAA/AAB/gAD/wAD/wADzwADzwADzwADzwAD4AAD8AAB+AAA/AAAfgAAPgAAHwADzwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAABUCgAAAAAAAP/AAP/AAP/AAP/AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAAAAAAAAAAAAAAAAAAAAAAAAAFUKAAAAAAAA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA/8AA/8AAf4AAPwAAAAAAAAAAAAAAAAAAAAAAAAAAVgsAAAAAAAD54AD54AD54AD54AD54AB54AB54AB5wAB7wAB7wAB7wAB7wAB7wAA/wAA/gAA/gAA/gAAfAAAfAAAfAAAfAAAeAAAeAAAeAAAAAAAAAAAAAAAAAAAAAAAAAABXEQAAAAAAAPHngPHngPHngPHngPHngHHnAHHnAHHnAHv3AHv3AHv3AHv3AHv3AD9+AD9+AD9+AD9+AD9+AD9+AD9+AB48AB48AB48AB48AAAAAAAAAAAAAAAAAAAAAAAAAFgKAAAAAAAA88AA88AA88AA84AA94AAd4AAfwAAfwAAfwAAPgAAPgAAPgAAPgAAfwAAfwAAfwAAfwAAdwAA94AA94AA94AA44AA44AA44AAAAAAAAAAAAAAAAAAAAAAAAAAWQoAAAAAAADjwADjwADjwADzgADzgAB3gAB3gAB3AAB/AAA/AAA/AAA+AAA+AAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAAAAAAAAAAAAAAAAAAAAAAAABaCQAAAAAAAP+AAP+AAP+AAP+AAAeAAAeAAA8AAA8AAA8AAB4AAB4AAB4AADwAADwAADwAAHgAAHgAAHgAAPAAAPAAAP+AAP+AAP+AAP+AAAAAAAAAAAAAAAAAAAAAAAAAAFsF+AAA+AAA+AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA+AAA+AAA+AAAAAAAAAAAAAAAAAAAXAbAAADAAADAAADgAADgAABgAABgAABgAABgAABwAABwAABwAAAwAAAwAAAwAAA4AAA4AAA4AAAYAAAYAAAYAAAYAAAcAAAcAAAMAAAMAAAMAAAMAAAAAAAAAAAAAAAAAABdBfgAAPgAAPgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAAPgAAPgAAPgAAAAAAAAAAAAAAAAAAF4GAAAAAAAAMAAAeAAAeAAAeAAAeAAA/AAAzAAAzAAAzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXwoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAD/wAD/wAAAAAAAAABgBQAAAAAAAOAAAPAAAHAAAHgAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGEJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfgAA/wAA/wAA5wAA5wAABwAAHwAAfwAA/wAA9wAA5wAA5wAA5wAA54AA/4AA/4AAd4AAAAAAAAAAAAAAAAAAAAAAAAAAYggAAAAAAAAAAADgAADgAADgAADgAADgAADgAADuAAD/AAD/AAD/AADnAADnAADnAADnAADnAADnAADnAADnAADnAAD/AAD/AAD/AADeAAAAAAAAAAAAAAAAAAAAAAAAAABjCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAP4AAP8AAP8AAOcAAOcAAOcAAOAAAOAAAOAAAOcAAOcAAOcAAOcAAP8AAP8AAH4AAAAAAAAAAAAAAAAAAAAAAAAAAGQIAAAAAAAAAAAABwAABwAABwAABwAABwAABwAAdwAA/wAA/wAA/wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA/wAA/wAA/wAAewAAAAAAAAAAAAAAAAAAAAAAAAAAZQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAB+AAD/AADnAADnAADnAAD/AAD/AAD/AADgAADgAADnAADnAADnAAD/AAD+AAB8AAAAAAAAAAAAAAAAAAAAAAAAAABmBwAAAAAAAAAAAB4AAD4AAD4AADgAADgAADgAAP4AAP4AAP4AAP4AADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAADgAAAAAAAAAAAAAAAAAAAAAAAAAAGcIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAewAA/wAA/wAA/wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA7wAA/wAA/wAAdwAABwAA5wAA5wAA/wAA/gAAfAAAaAgAAAAAAAAAAADgAADgAADgAADgAADgAADgAADuAAD/AAD/AAD/AAD3AADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAAAAAAAAAAAAAAAAAAAAAAAAAABpAwAAAAAAAAAAAAAAAAAAAOAAAOAAAOAAAAAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAGoFAAAAAAAAAAAAAAAAAAAAOAAAOAAAOAAAAAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAA+AAA+AAA8AAAawkAAAAAAAAAAADgAADgAADgAADgAADgAADgAADjgADngADnAADvAADuAAD+AAD8AAD8AAD8AAD+AAD+AADuAADvAADnAADngADjgADjgAAAAAAAAAAAAAAAAAAAAAAAAABsAwAAAAAAAAAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAG0NAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA73AA//gA//gA//gA5zgA5zgA5zgA5zgA5zgA5zgA5zgA5zgA5zgA5zgA5zgA5zgA5zgAAAAAAAAAAAAAAAAAAAAAAAAAbggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADuAAD/AAD/AADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAAAAAAAAAAAAAAAAAAAAAAAAAABvCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAP8AAP8AAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAP8AAP8AAH4AAAAAAAAAAAAAAAAAAAAAAAAAAHAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7gAA/wAA/wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA/wAA/wAA7gAA4AAA4AAA4AAA4AAA4AAA4AAAcQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB3AAD/AAD/AADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAAD/AAD/AAB3AAAHAAAHAAAHAAAHAAAHAAAHAAByCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAO4AAP8AAP8AAOcAAOcAAOcAAOcAAOcAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAHMIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfgAA/wAA/wAA5wAA5wAA8AAA+AAAfAAAPgAAHwAADwAA5wAA5wAA5wAA/wAA/wAAfgAAAAAAAAAAAAAAAAAAAAAAAAAAdAcAAAAAAAAAAAAAAAA4AAA4AAA4AAA4AAA4AAD+AAD+AAD+AAD+AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA+AAA+AAA+AAAeAAAAAAAAAAAAAAAAAAAAAAAAAAB1CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAP8AAP8AAP8AAHsAAAAAAAAAAAAAAAAAAAAAAAAAAHYJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA84AA84AA84AA84AA84AAd4AAd4AAdwAAdwAAfwAAPwAAPwAAPgAAPgAAHgAAHgAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAdw8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADzzgDzzgDzzgDzzgDzzgB33gB33AB33AB//AB//AA+/AA+/AA++AA++AAeeAAeeAAeeAAAAAAAAAAAAAAAAAAAAAAAAAB4CQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOOAAOOAAPeAAHcAAH8AAH8AAD4AAD4AAD4AAD4AAD4AAH8AAH8AAHcAAPeAAOOAAOOAAAAAAAAAAAAAAAAAAAAAAAAAAHkJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA44AA44AA44AA44AA9wAAdwAAdwAAfwAAfwAAfwAAPgAAPgAAPgAAPgAAPgAAPgAAHAAAHAAAHAAAPAAA/AAA+AAA8AAAeggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAD/AAD/AAAHAAAOAAAOAAAcAAAcAAA4AAA4AABwAABwAADwAADgAAD/AAD/AAD/AAAAAAAAAAAAAAAAAAAAAAAAAAB7BjwAAHwAAHwAAHAAAHAAAHAAAHAAAHAAAHgAADgAADgAADgAADgAAPgAAPAAAPgAADgAADgAADgAADgAAHgAAHgAAHAAAHAAAHAAAHAAAHwAAHwAADwAAAAAAAAAAAAAAHwD4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAAAAAAAAAAAAAAfQbwAAD4AAD4AAA4AAA4AAA4AAA4AAA4AAB4AABwAABwAABwAABwAAB8AAA8AAB8AABwAABwAABwAABwAAB4AAB4AAA4AAA4AAA4AAA4AAD4AAD4AADwAAAAAAAAAAAAAAB+CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHMAAPsAAP8AAP8AAN8AAM4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH8IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2wAA2wAA2wAA2wAAAAAAAAAAAAAAAAAAAAAAAAAAgAo4AAAcAAAMAAAAAAAeAAAeAAA/AAA/AAA/AAA/AAA3AAA3AAB3gAB3gABzgABzgABzgABzgAD/wAD/wAD/wAD/wADzwADzwADzwADzwAAAAAAAAAAAAAAAAAAAAAAAAACBCg4AABwAABgAAAAAAB4AAB4AAD8AAD8AAD8AAD8AADcAADcAAHeAAHeAAHOAAHOAAHOAAHOAAP/AAP/AAP/AAP/AAPPAAPPAAPPAAPPAAAAAAAAAAAAAAAAAAAAAAAAAAIIKHgAAPwAAMwAAAAAAHgAAHgAAPwAAPwAAPwAAPwAANwAANwAAd4AAd4AAc4AAc4AAc4AAc4AA/8AA/8AA/8AA/8AA88AA88AA88AA88AAAAAAAAAAAAAAAAAAAAAAAAAAgwo5gAB/gABnAAAAAAAeAAAeAAA/AAA/AAA/AAA/AAA3AAA3AAB3gAB3gABzgABzgABzgABzgAD/wAD/wAD/wAD/wADzwADzwADzwADzwAAAAAAAAAAAAAAAAAAAAAAAAACECgAAADMAADMAAAAAAB4AAB4AAD8AAD8AAD8AAD8AADcAADcAAHeAAHeAAHOAAHOAAHOAAHOAAP/AAP/AAP/AAP/AAPPAAPPAAPPAAPPAAAAAAAAAAAAAAAAAAAAAAAAAAIUKHgAAPwAAMwAAPwAAHgAAHgAAPwAAPwAAPwAAPwAANwAANwAAd4AAd4AAc4AAc4AAc4AAc4AA/8AA/8AA/8AA/8AA88AA88AA88AA88AAAAAAAAAAAAAAAAAAAAAAAAAAhgwAAAAAAAAf8AAf8AAf8AAfAAA/AAA/AAA/AAA/AAA3AAA3AAB34AB34AB34AB34AB3gAB3gAD/gAD/gAD/gAD/gADj8ADj8ADj8ADj8AAAAAAAAAAAAAAAAAAAAAAAAACHCgAAAAAAAD8AAH+AAP/AAP/AAPPAAPPAAPPAAPPAAPPAAPAAAPAAAPAAAPAAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAH+AAD8AAAwAADwAADgAAAAAAAAAAAAAAIgJOAAAHAAADAAAAAAA/4AA/4AA/4AA8AAA8AAA8AAA8AAA8AAA/gAA/gAA/gAA/gAA8AAA8AAA8AAA8AAA8AAA8AAA/4AA/4AA/4AA/4AAAAAAAAAAAAAAAAAAAAAAAAAAiQkOAAAcAAAYAAAAAAD/gAD/gAD/gADwAADwAADwAADwAADwAAD+AAD+AAD+AAD+AADwAADwAADwAADwAADwAADwAAD/gAD/gAD/gAD/gAAAAAAAAAAAAAAAAAAAAAAAAACKCT4AAH8AAGMAAAAAAP+AAP+AAP+AAPAAAPAAAPAAAPAAAPAAAP4AAP4AAP4AAP4AAPAAAPAAAPAAAPAAAPAAAPAAAP+AAP+AAP+AAP+AAAAAAAAAAAAAAAAAAAAAAAAAAIsJAAAAZgAAZgAAAAAA/4AA/4AA/4AA8AAA8AAA8AAA8AAA8AAA/gAA/gAA/gAA/gAA8AAA8AAA8AAA8AAA8AAA8AAA/4AA/4AA/4AA/4AAAAAAAAAAAAAAAAAAAAAAAAAAjATgAABwAAAwAAAAAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAADwAAAAAAAAAAAAAAAAAAAAAAAAAACNBHAAAOAAAMAAAAAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAI4GeAAA/AAAzAAAAAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAjwYAAADMAADMAAAAAAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAAAAAAAAAAAAAAAAAAAAAAAAACQCwAAAAAAAH+AAH/AAH/gAH/gAHvgAHngAHngAHngAHngAHngAP3gAP3gAP3gAHngAHngAHngAHngAHngAHngAHngAH/gAH/gAH/AAH+AAAAAAAAAAAAAAAAAAAAAAAAAAJELHMAAP8AAM4AAAAAA8eAA8eAA+eAA+eAA+eAA/eAA/eAA/+AA/+AA/+AA/+AA/+AA9+AA9+AA9+AA8+AA8+AA8+AA8eAA8eAA8eAA8eAAAAAAAAAAAAAAAAAAAAAAAAAAkgo4AAAcAAAMAAAAAAA/AAB/gAD/wAD/wADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAACTCgcAAA4AAAwAAAAAAD8AAH+AAP/AAP/AAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAH+AAD8AAAAAAAAAAAAAAAAAAAAAAAAAAJQKHgAAPwAAMwAAAAAAPwAAf4AA/8AA/8AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA/8AA/8AAf4AAPwAAAAAAAAAAAAAAAAAAAAAAAAAAlQo5gAB/gABnAAAAAAA/AAB/gAD/wAD/wADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAACWCgAAADMAADMAAAAAAD8AAH+AAP/AAP/AAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAH+AAD8AAAAAAAAAAAAAAAAAAAAAAAAAAJcMAAAAAAAAH4AAP8AAf/AAf/AAefAAcPAAceAAceAAc+AAc+AAd+AAd+AAfuAAfuAAfOAAfOAAeOAAeOAA8OAA+eAA/+AA/+AAP8AAH4AAAAAAAAAAAAAAAAAAAAAAAAAAmAo4AAAcAAAMAAAAAADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAACZCgcAAA4AAAwAAAAAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAH+AAD8AAAAAAAAAAAAAAAAAAAAAAAAAAJoKHgAAPwAAMwAAAAAA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA/8AA/8AAf4AAPwAAAAAAAAAAAAAAAAAAAAAAAAAAmwoAAAAzAAAzAAAAAADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAACcCgcAAA4AAAwAAAAAAOPAAOPAAPOAAHeAAHeAAHcAAH8AAD8AAD8AAD4AAD4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAB4AAAAAAAAAAAAAAAAAAAAAAAAAAJ0MAAAAAAAAAAAA8AAA8AAA8AAA8AAA/4AA/8AA/+AA//AA8fAA8PAA8PAA8PAA8PAA8fAA//AA/+AA/8AA/4AA8AAA8AAA8AAA8AAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAngwAAAAAAAA/wAB/4AD/8AD58ADw8ADw8ADw8ADw8ADz4ADzwADz4ADw8ADw8ADw8ADw8ADw8ADw8ADw8ADw8ADw8ADw8ADw8ADx4ADzwAAAAAAAAAAAAAAAAAAAAAAAAACfCQAAAAAAAAAAAAAAAAAAADgAABwAAAwAAAAAAH4AAP8AAP8AAOcAAOcAAAcAAB8AAH8AAP8AAPcAAOcAAOcAAOcAAOeAAP+AAP+AAHeAAAAAAAAAAAAAAAAAAAAAAAAAAKAJAAAAAAAAAAAAAAAAAAAADgAAHAAAGAAAAAAAfgAA/wAA/wAA5wAA5wAABwAAHwAAfwAA/wAA9wAA5wAA5wAA5wAA54AA/4AA/4AAd4AAAAAAAAAAAAAAAAAAAAAAAAAAoQkAAAAAAAAAAAAAAAAAAAA8AAB+AABmAAAAAAB+AAD/AAD/AADnAADnAAAHAAAfAAB/AAD/AAD3AADnAADnAADnAADngAD/gAD/gAB3gAAAAAAAAAAAAAAAAAAAAAAAAACiCQAAAAAAAAAAAAAAAAAAAHMAAP8AAM4AAAAAAH4AAP8AAP8AAOcAAOcAAAcAAB8AAH8AAP8AAPcAAOcAAOcAAOcAAOeAAP+AAP+AAHeAAAAAAAAAAAAAAAAAAAAAAAAAAKMJAAAAAAAAAAAAAAAAAAAAAAAAZgAAZgAAAAAAfgAA/wAA/wAA5wAA5wAABwAAHwAAfwAA/wAA9wAA5wAA5wAA5wAA54AA/4AA/4AAd4AAAAAAAAAAAAAAAAAAAAAAAAAApAkAAAAAAAAAAAAAAAA8AAB+AABmAAB+AAA8AAB+AAD/AAD/AADnAADnAAAHAAAfAAB/AAD/AAD3AADnAADnAADnAADngAD/gAD/gAB3gAAAAAAAAAAAAAAAAAAAAAAAAAClDQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/gAP/wAP/4AOc4AOc4AAc4AB/4AH/4AP/4APcAAOcAAOcAAOcYAOf4AP/4AP/wAHfgAAAAAAAAAAAAAAAAAAAAAAAAAKYIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAA/gAA/wAA/wAA5wAA5wAA5wAA4AAA4AAA4AAA5wAA5wAA5wAA5wAA/wAA/wAAfgAAGAAAeAAAcAAAAAAAAAAAAAAApwgAAAAAAAAAAAAAAAAAAABwAAA4AAAYAAAAAAA8AAB+AAD/AADnAADnAADnAAD/AAD/AAD/AADgAADgAADnAADnAADnAAD/AAD+AAB8AAAAAAAAAAAAAAAAAAAAAAAAAACoCAAAAAAAAAAAAAAAAAAAAA4AABwAABgAAAAAADwAAH4AAP8AAOcAAOcAAOcAAP8AAP8AAP8AAOAAAOAAAOcAAOcAAOcAAP8AAP4AAHwAAAAAAAAAAAAAAAAAAAAAAAAAAKkIAAAAAAAAAAAAAAAAAAAAPAAAfgAAZgAAAAAAPAAAfgAA/wAA5wAA5wAA5wAA/wAA/wAA/wAA4AAA4AAA5wAA5wAA5wAA/wAA/gAAfAAAAAAAAAAAAAAAAAAAAAAAAAAAqggAAAAAAAAAAAAAAAAAAAAAAABmAABmAAAAAAA8AAB+AAD/AADnAADnAADnAAD/AAD/AAD/AADgAADgAADnAADnAADnAAD/AAD+AAB8AAAAAAAAAAAAAAAAAAAAAAAAAACrBAAAAAAAAAAAAAAAAAAAAOAAAHAAADAAAAAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAKwEAAAAAAAAAAAAAAAAAAAAcAAA4AAAwAAAAAAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAAAAAAAAAAAAAAAAAAAAAAAAAArQUAAAAAAAAAAAAAAAAAAABwAAD4AADYAAAAAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAAAAAAAAAAAAAAAAAAAAAAAAAACuBQAAAAAAAAAAAAAAAAAAAAAAANgAANgAAAAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAK8LAAAAAAAAAAAAP2AAP+AAP+AAA8AAB8AAB+AAAeAAAeAAP+AAf+AA/+AA8eAA8eAA8eAA8eAA8eAA8eAA8eAA8eAA/+AA/+AAf8AAP4AAAAAAAAAAAAAAAAAAAAAAAAAAsAgAAAAAAAAAAAAAAAAAAABzAAD/AADOAAAAAADuAAD/AAD/AADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAAAAAAAAAAAAAAAAAAAAAAAAAACxCAAAAAAAAAAAAAAAAAAAAHAAADgAABgAAAAAAH4AAP8AAP8AAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAP8AAP8AAH4AAAAAAAAAAAAAAAAAAAAAAAAAALIIAAAAAAAAAAAAAAAAAAAAHAAAOAAAMAAAAAAAfgAA/wAA/wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA/wAA/wAAfgAAAAAAAAAAAAAAAAAAAAAAAAAAswgAAAAAAAAAAAAAAAAAAAA8AAB+AABmAAAAAAB+AAD/AAD/AADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAAD/AAD/AAB+AAAAAAAAAAAAAAAAAAAAAAAAAAC0CAAAAAAAAAAAAAAAAAAAAHMAAP8AAM4AAAAAAH4AAP8AAP8AAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAP8AAP8AAH4AAAAAAAAAAAAAAAAAAAAAAAAAALUIAAAAAAAAAAAAAAAAAAAAAAAAZgAAZgAAAAAAfgAA/wAA/wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA/wAA/wAAfgAAAAAAAAAAAAAAAAAAAAAAAAAAtgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAB/gAB/gABzwABzwABzwAB3gAB/gAB/gAB/gAB7gADzgADzgADzgAB/gAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAAC3CAAAAAAAAAAAAAAAAAAAAHAAADgAABgAAAAAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAP8AAP8AAP8AAHsAAAAAAAAAAAAAAAAAAAAAAAAAALgIAAAAAAAAAAAAAAAAAAAADgAAHAAAGAAAAAAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA/wAA/wAA/wAAewAAAAAAAAAAAAAAAAAAAAAAAAAAuQgAAAAAAAAAAAAAAAAAAAA8AAB+AABmAAAAAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAAD/AAD/AAD/AAB7AAAAAAAAAAAAAAAAAAAAAAAAAAC6CAAAAAAAAAAAAAAAAAAAAAAAAGYAAGYAAAAAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAP8AAP8AAP8AAHsAAAAAAAAAAAAAAAAAAAAAAAAAALsJAAAAAAAAAAAAAAAAAAAADgAAHAAAGAAAAAAA44AA44AA44AA44AA9wAAdwAAdwAAfwAAfwAAfwAAPgAAPgAAPgAAPgAAPgAAPgAAHAAAHAAAHAAAPAAA/AAA+AAA8AAAvAkAAAAAAAAAAAAAAAAAAADgAADgAADgAADgAADgAADuAAD/AAD/gADzgADjgADjgADjgADjgADzgAD/gAD/AADuAADgAADgAADgAADgAADgAADgAAAAAAAAAAAAAAAAAAC9CQAAAAAAAAAAAAAAAAAAAAAAAGMAAGMAAAAAAOOAAOOAAOOAAOOAAPcAAHcAAHcAAH8AAH8AAH8AAD4AAD4AAD4AAD4AAD4AAD4AABwAABwAABwAADwAAPwAAPgAAPAAAL4KAAAAPwAAPwAAAAAAHgAAHgAAPwAAPwAAPwAAPwAANwAANwAAd4AAd4AAc4AAc4AAc4AAc4AA/8AA/8AA/8AA/8AA88AA88AA88AA88AAAAAAAAAAAAAAAAAAAAAAAAAAvwkAAAAAAAAAAAAAAAAAAAAAAAB+AAB+AAAAAAB+AAD/AAD/AADnAADnAAAHAAAfAAB/AAD/AAD3AADnAADnAADnAADngAD/gAD/gAB3gAAAAAAAAAAAAAAAAAAAAAAAAADACjMAAD8AAB4AAAAAAB4AAB4AAD8AAD8AAD8AAD8AADcAADcAAHeAAHeAAHOAAHOAAHOAAHOAAP/AAP/AAP/AAP/AAPPAAPPAAPPAAPPAAAAAAAAAAAAAAAAAAAAAAAAAAMEJAAAAAAAAAAAAAAAAAAAAZgAAfgAAPAAAAAAAfgAA/wAA/wAA5wAA5wAABwAAHwAAfwAA/wAA9wAA5wAA5wAA5wAA54AA/4AA/4AAd4AAAAAAAAAAAAAAAAAAAAAAAAAAwgoAAAAAAAAeAAAeAAAeAAAfAAA/AAA/AAA/AAA/AAA3AAA3AAB3gAB3gABzgABzgABzgABzgAD/wAD/wAD/wAD/wADzwADzwADzwADzwAADAAADwAABwAAAAAAAAAAAAADDCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAP8AAP8AAOcAAOcAAAcAAB8AAH8AAP8AAPcAAOcAAOcAAOcAAOeAAP+AAP+AAHeAAAYAAAeAAAOAAAAAAAAAAAAAAMQKBwAADgAADAAAAAAAPwAAf4AA/8AA/8AA88AA88AA88AA88AA8AAA8AAA8AAA8AAA88AA88AA88AA88AA88AA88AA/8AA/8AAf4AAPwAAAAAAAAAAAAAAAAAAAAAAAAAAxQgAAAAAAAAAAAAAAAAAAAAcAAA4AAAwAAAAAAB8AAD+AAD/AAD/AADnAADnAADnAADgAADgAADgAADnAADnAADnAADnAAD/AAD/AAB+AAAAAAAAAAAAAAAAAAAAAAAAAADGCQAAAH8AAH8AAAAAAP+AAP+AAP+AAP+AAPAAAPAAAPAAAPAAAP4AAP4AAP4AAP4AAPAAAPAAAPAAAPAAAPAAAPAAAP+AAP+AAP+AAP+AAAAAAAAAAAAAAAAAAAAAAAAAAMcIAAAAAAAAAAAAAAAAAAAAAAAAfgAAfgAAAAAAPAAAfgAA/wAA5wAA5wAA5wAA/wAA/wAA/wAA4AAA4AAA5wAA5wAA5wAA/wAA/gAAfAAAAAAAAAAAAAAAAAAAAAAAAAAAyAkAAAAAAAD/gAD/gAD/gAD/gADwAADwAADwAADwAADwAADwAAD+AAD+AAD+AAD+AADwAADwAADwAADwAADwAADwAAD/gAD/gAD/gAD/gAAGAAAHgAADgAAAAAAAAAAAAADJCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAH4AAP8AAOcAAOcAAOcAAP8AAP8AAP8AAOAAAOAAAOcAAOcAAOcAAP8AAP4AAH4AAAwAAA8AAAcAAAAAAAAAAAAAAMoGAAAA/AAA/AAAAAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAywUAAAAAAAAAAAAAAAAAAAAAAAD4AAD4AAAAAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAABwAAAAAAAAAAAAAAAAAAAAAAAAAADMAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAM0LAAAAAAAAPAAAPAAAPAAAPAAAPAAAPYAAP4AAPwAAPgAAfAAA/AAA/AAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAPAAAP+AAP+AAP+AAP+AAAAAAAAAAAAAAAAAAAAAAAAAAzgcAAAAAAAAAAAA4AAA4AAA4AAA4AAA4AAA+AAA+AAA8AAB4AAD4AAD4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAAAAAAAAAAAAAAAAAAAAAAAAADPCwcAAA4AAAwAAAAAAPHgAPHgAPngAPngAPngAP3gAP3gAP/gAP/gAP/gAP/gAP/gAPfgAPfgAPfgAPPgAPPgAPPgAPHgAPHgAPHgAPHgAAAAAAAAAAAAAAAAAAAAAAAAANAIAAAAAAAAAAAAAAAAAAAADgAAHAAAGAAAAAAA7gAA/wAA/wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAAAAAAAAAAAAAAAAAAAAAAAAAA0QoAAAA/AAA/AAAAAAA/AAB/gAD/wAD/wADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAADSCAAAAAAAAAAAAAAAAAAAAAAAAH4AAH4AAAAAAH4AAP8AAP8AAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAP8AAP8AAH4AAAAAAAAAAAAAAAAAAAAAAAAAANMKO4AAdwAAAAAAPwAAf4AA/8AA/8AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA88AA/8AA/8AAf4AAPwAAAAAAAAAAAAAAAAAAAAAAAAAA1AgAAAAAAAAAAAAAAAAAAAAAAAB3AADuAAAAAAB+AAD/AAD/AADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAADnAAD/AAD/AAB+AAAAAAAAAAAAAAAAAAAAAAAAAADVDQAAAAAAAD/4AH/4AP/4AP/4APOAAPOAAPOAAPOAAPOAAPOAAPPwAPPwAPPwAPPwAPOAAPOAAPOAAPOAAPOAAPOAAP/4AP/4AH/4AD/4AAAAAAAAAAAAAAAAAAAAAAAAANYMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAf+AA//AA//AA5jAA5jAA5jAA5/AA5/AA5gAA5gAA5nAA5nAA5nAA//AAf+AAP8AAAAAAAAAAAAAAAAAAAAAAAAAA1woHAAAOAAAMAAAAAAA/AAB/gAD/wAD/wADzwADzwADzwAD4AAD8AAB+AAA/AAAfgAAPwAAHwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAADYCAAAAAAAAAAAAAAAAAAAAA4AABwAABgAAAAAAH4AAP8AAP8AAOcAAOcAAPAAAPgAAHwAAD4AAB8AAA8AAOcAAOcAAOcAAP8AAP8AAH4AAAAAAAAAAAAAAAAAAAAAAAAAANkKMwAAPwAAHgAAAAAAPwAAf4AA/8AA/8AA88AA88AA88AA+AAA/AAAfgAAPwAAH4AAD8AAB8AA88AA88AA88AA88AA/8AA/8AAf4AAPwAAAAAAAAAAAAAAAAAAAAAAAAAA2ggAAAAAAAAAAAAAAAAAAABmAAB+AAA8AAAAAAB+AAD/AAD/AADnAADnAADwAAD4AAB8AAA+AAAfAAAPAADnAADnAADnAAD/AAD/AAB+AAAAAAAAAAAAAAAAAAAAAAAAAADbCgAAAD8AAD8AAAAAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAPPAAP/AAP/AAH+AAD8AAAAAAAAAAAAAAAAAAAAAAAAAANwIAAAAAAAAAAAAAAAAAAAAAAAAfgAAfgAAAAAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA5wAA/wAA/wAA/wAAewAAAAAAAAAAAAAAAAAAAAAAAAAA3Qo5wABzgAAAAADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAAAAAAAAAAAAAAAAAAAADeCAAAAAAAAAAAAAAAAAAAAAAAAHcAAO4AAAAAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAOcAAP8AAP8AAP8AAHsAAAAAAAAAAAAAAAAAAAAAAAAAAN8KYwAAYwAAAAAA48AA48AA84AA84AAd4AAd4AAdwAAfwAAPwAAPwAAPgAAPgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAAAAAAAAAAAAAAAAAAAAAAAAA4AkOAAAcAAAYAAAAAAD/gAD/gAD/gAD/gAAHAAAPAAAPAAAeAAAeAAAeAAA8AAA8AAA8AAB4AAB4AAB4AADwAADwAAD/gAD/gAD/gAD/gAAAAAAAAAAAAAAAAAAAAAAAAADhCAAAAAAAAAAAAAAAAAAAAA4AABwAABgAAAAAAP8AAP8AAP8AAAcAAA4AAA4AABwAABwAADgAADgAAHAAAHAAAPAAAOAAAP8AAP8AAP8AAAAAAAAAAAAAAAAAAAAAAAAAAOIJAAAAHAAAHAAAAAAA/4AA/4AA/4AA/4AABwAABwAADwAADgAAHgAAHgAAPAAAPAAAPAAAeAAAeAAAeAAA8AAA8AAA/4AA/4AA/4AA/4AAAAAAAAAAAAAAAAAAAAAAAAAA4wgAAAAAAAAAAAAAAAAAAAAAAAAcAAAcAAAAAAD/AAD/AAD/AAAHAAAOAAAOAAAcAAAcAAA4AAA4AABwAABwAADwAADgAAD/AAD/AAD/AAAAAAAAAAAAAAAAAAAAAAAAAADkCTMAAD8AAB4AAAAAAP+AAP+AAP+AAP+AAAcAAAcAAA8AAA4AAB4AAB4AADwAADwAADwAAHgAAHgAAHgAAPAAAPAAAP+AAP+AAP+AAP+AAAAAAAAAAAAAAAAAAAAAAAAAAOUIAAAAAAAAAAAAAAAAAAAAZgAAfgAAPAAAAAAA/wAA/wAA/wAABwAADgAADgAAHAAAHAAAOAAAOAAAcAAAcAAA8AAA4AAA/wAA/wAA/wAAAAAAAAAAAAAAAAAAAAAAAAAA5goAAAAAAAA/AAB/gAD/wAD/wADzwADzwADzwADzwAD4AAD8AAB+AAA/AAAfgAAPgAAHwADzwADzwADzwADzwADzwAD/wAD/wAB/gAA/AAAAAAAMAAAMAAAMAAAIAAAAAADnCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAP8AAP8AAOcAAOcAAPAAAPgAAHwAAD4AAB8AAA8AAOcAAOcAAOcAAP8AAP8AAH4AAAAAABgAABgAABgAABAAAAAAAOgKAAAAAAAA/8AA/8AA/8AA/8AAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAHgAAAAAADAAADAAADAAACAAAAAAA6QcAAAAAAAAAAAAAAAA4AAA4AAA4AAA4AAA4AAD+AAD+AAD+AAD+AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA4AAA+AAA+AAA+AAAeAAAAAAAYAAAYAAAYAAAQAAAAAADqDAAAAAAAAP/gAP/wAP/wAP/wAPDwAPHwAPPgAPfAAPeAAPcAAPcAAPeAAPfAAPPgAPHgAPHgAPHgAPHgAPHgAPHgAPPgAPPAAPeAAPcAAAAAAAAAAAAAAAAAAAAAAAAAAOsEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAA4AAA4AAA4AAAAAAA4AAA4AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAA8AAAAAAA7AkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAA8AAA8AAA8AAAAAAA8AAA8AAA8AAA8AAA8AAB8AAB8AAB4AAD4AADwAADzgADzgADzgADzgAD/gAD/gAD/gAB/AAAAAADtCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzAAB3AADuAAHcAAO4AAO4AAHcAADuAAB3AAAzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAO4KAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzAAA7gAAdwAAO4AAHcAAHcAAO4AAdwAA7gAAzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7wsAAAAAAAAfgAA/wAB/4AB/4AB54AB54AB4AAB4AAB4AAD/AAD/AAB4AAB4AAD/AAD/AAB4AAB4AAB54AB54AB54AB/4AB/4AA/wAAfgAAAAAAAAAAAAAAAAAAAAAAAAADwCAAAAAAAAAAAAHwAAP4AAMYAAMYAAMYAAP4AAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8MAAAAAAAAAAAAf+AA//AA//AA4HAA4HAA4HAA4HAA5nAA6XAA6XAA4XAA4nAA5HAA5HAA5HAA4HAA5HAA4HAA4HAA4HAA4HAA4HAA//AA//AAf+AAAAAAAAAAAAAAAAAA"

{sounds}
sosumi:"%%SND0DAwMDAwMDA0PERUTCQYEAgQJDxYaIBEBBQgLDxIWGBoZAgAABQsSGB0eHxcAAAAABQ4WHB4fEgAABAwWHyUfGhkEAAAHFxgNFBkgJBEAAQAAAA4cJi4oEQAAAAcSGCEoKhEAAAACFic1PjIPAAAAAAYWJCQRFhkOBQoPEQkABBgeFgoDDA8CDBAYIychDwAAAAAIJDtBQSUAAAAABx8uKiILAAAADxkZISENBgcAAAADFyQdGh8VDgYBBgkAAAAGIDM3KxcAAAAAECo8Oh0AAAAAEigwLioSAAAAAAADGy0tIBcHAAAFFiAWAgAAAQkSIiodBAAHDhcZEgAAAAAIKT9BORgAAAAAABAeLjkyFgAAAAADGiorHAYAAAAHGiksGwUAAAQLFBcKAAAAEygvJxMAAAAADxweFg4CAAAADhsnMTMhAgAAAAAHLEBBOhcAAAAABxsgFAYFCxMcHxcHAAAAChccFAkEAQAGEhwfHRcNAAAAAAAPJDIxHwIAAAAIJjs6IQAAAAADITY6KxYGAAAAAAAABxAbJislFggAAAAAAAYQHCUnHw8AAAADGSkqGQAAAAAOLT8+KAUAAAAAESInIhYJAgABBAgPFxsZEwsAAAACDhQWFRMWGx4YCgAAAAAJKz9BMhAAAAAADyInHgwAAAALGiIiHRMGAAAAAAIWKTEsHAgAAAAFEBQQCQYKFB0gGAcAAAALIzEvGgAAAAAEHzM4LxwHAAAAAAESISkmGgoAAAAOGx8XBgAAAAccKywgDgAAAgkNCgEAAAUZLDQtGQEAAAAADyApKSESAgAAAAQYKTAnEgAAAAAMJTMvHQgAAAAMFBMKAQAEEBwiHhMHAAAGDhIRCwUBAwgQGR8iIBkLAAAAAAAcNkE6IAAAAAADHCooGAYAAAQRGRsVDQgICg0MCAMCBg0VGxwYEgwHAwAAAAYRHCMhFQQAAAASJCsjDQAAAAASKjUxIQwAAAAAAgoQFhodGxYNBQEBBgsODw0MDRASEQ0IBQgPFxsYDQAAAAASIysmFwUAAAAIFBsaFA0HBAUIDBEVGBcSCwMAAAILFRsbFxEMCgoKCAQBAQcRHCIfFQgAAAAJFBoZEgkDAgYNFBgYFA8JBAEBBAsTGRsYEAgCAgYNEhQSDQgHCQ4REQ4LCQsPExUSCwMAAAYQGR4cFg0FAAACBw0TFhcUDwoGBQkOExQRCwUCBAsSGBkVDgkGBwoMDQwKCg0QFBUSDggFBQgMERMTEQ4KCAcICw8UFxYSCgMAAAYPFxsZEwsFBAcLDxAODAoKDRAREQ8NCwoLDA0MCwoLDA4QEREQDw0KCAUFBwwSFxkVDwcBAQYNFBcVEAkFBQgNERMSEA0LCwoKCgsLDQ4QEBAPDQwMCwsKCgsMDxERDwwKCQsPEhMQCwYDBAkQFxkXEQoFAwUIDRASEhEPDQwLCgsMDg8ODQwLCwwODg4NDAwNDxAQDQkGBgkOExUUEAsHBggMEBIRDgsJCAoMDxESEhANCQcGBwoPEhQTEA0KCQoLDAwMCwwOEBISDwwIBwkMEBIRDwsJCAoNEBISEA4LCQgJCg0PERIQDQoICQsOERIQDAkICQsPEREQDgwMDQ0NCwoJCQwPEhMSDwwJBwgJDA4QEREPDQsJCgsOEBEPDAkHCAsPEhMRDgsJCQsNDg4NDAwNDg4ODQwLDAwNDg4NDAsLCwwNDg8QERAOCgcGBwoPExQTDwsIBwkMDxAPDQwLDA0ODw8ODQwMDAwMDAwNDg4PDg4NDAwMCwsLDA0ODxAODQsJCgsNDxAPDQsKCgsNDg4ODQwMDAwMDAwMDAwMDAwM"

{card:home}
image:"%%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"
script:"home.0"
{widgets}
logo:{"type":"button","size":[370,78],"pos":[76,139],"show":"none"}
that's the tagline:{"type":"field","size":[163,14],"pos":[282,200],"locked":1,"volatile":1,"show":"transparent","border":0,"style":"plain","align":"center"}
button1:{"type":"button","size":[86,26],"pos":[11,303],"script":"home.1","text":"Credits","style":"rect"}
button2:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Guided Tour","style":"rect"}
ee:{"type":"button","size":[57,50],"pos":[162,157],"script":"home.3","show":"transparent","style":"invisible"}

{script:home.0}
on view do
 card.widgets["that's the tagline"].text:random[
  "a multimedia sketchpad",
  "a multimedia sketchbook",
  "an interactive sketchbook",
  "the everything machine",
  "a program for your computer",
  "found the secret chicken card yet?"
 ]
end
{end}

{script:home.1}
on click do
  go["credits" "SlideUp"]
end
{end}

{script:home.2}
on click do
  go["Next" "SlideLeft"]
end
{end}

{script:home.3}
on click do
 bi:card.image
 bg:bi.copy[]
 tc:card.add.canvas
 tc.size:logo.size
 tc.pattern:2
 letters:each p in 100,170,230,300,350,400
  tc.paste[bg.copy[logo.pos logo.size]]
  tc.fill[(p,180)-logo.pos]
  tc.copy[].map[2 dict 1 0]
 end
 card.remove[tc]

 sleep[15]
 ei:image[ee.size+30].paste[bg.copy[ee.pos ee.size] 15,15]
 on er i s p do i.paste[s.copy[].map[1 dict 32] p 1] end
 eb:bg.copy[] er[eb ei ee.pos-15]
 each i in range 30
  bi.paste[eb].paste[ei.copy[].rotate[(2*pi)*i/29] ee.pos-15 1]
  sleep[]
 end

 eb:bg.copy[]
 er[eb letters[4] logo.pos]
 er[eb letters[5] logo.pos]
 c1:1.70158 c2:c1*1.525
 on iob x a b do
  a+(b-a)*.5*if x<.5 ((2*x)^2)*((c2+1)*(2*x))-c2
       else 2+(((2*x)-2)^2)*((c2+1)*(-2+2*x))+c2 end
 end
 on f a b do
  each i in range 30
   o:iob[i/29 a b]
   bi.paste[eb].paste[letters[4].copy[].map[1 dict 9] o 1]
               .paste[letters[5].copy[].map[1 dict 9] o 1]
   sleep[1]
  end
 end
 f[logo.pos logo.pos+30,0]
 f[logo.pos+30,0 logo.pos]

 ci:1,1,1,1,9,9,33,34,35,36,37,38,39,40,41,1,1,1,1,9,9
 co:0,0,0,0,0,0,-2, 0, 2, 4, 6  4, 2, 0,-2,0,0,0,0,0,0
 cb:bg.copy[].paste[image[logo.size] logo.pos]
 each i in range 15
  bi.paste[cb]
  each letter l in letters
   bi.paste[letter.copy[].map[1 dict ci[i+l]] logo.pos-0,co[i+l] 1]
  end
  sleep[3]
 end

 bi.paste[bg]
end

{end}

{card:What's a Card?}
image:"%%IMG3AgABVgUgII5kaZ5oqq5s675wLM90bd94ru987//AoHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqPRugrdu3cOPKnUu3rt27ePPq3cu3r1+5WwOME6yVcDjDWBF/a1t4sOKqj7sxzhqZ2+TEjhuLu3y18jbOVj1rAw05M2XTmDeLhroaG2mqra+9nhrb2myptavdjpqb2m7WqDsHDz28tGrNh3srVS7t91Pm0Zw7hQ5NelPqz6wzDTChu/fv4MOLH0++vPnz6NOrX8++vfvvALQvxe5M/vLisPHT1o+bP2//wB13moCpJYccOPYlRV8zCSLF3XsQRijhhBRWaCF48S04lIbLNHgUh8p4aBSIyYhYFInImEgUiseouCGAz8E4nYzX0bidjfPhuNyFPPbo449AmpfhgYux2JORxbgoFJLEKBkUk8M4CRSUwkj5E5XBWOkTlsBoeaSOCoLpoJgfkjlikGimqeaa6Q05oIFvIsilTXP64iVPdfZy50558rKnTn3u8mdOgeoyKE6F5nLoTYnisiidZp4Y6YpsVmrppT+6WaCcRHrzaE2N3vIpTaHaMupMpdZyqkyp0rJqTK3O8ipMscoy60u1xnKrS7nCsmtLvb7yK0sPYmrssci2OexKwbqyrErNtvJsStGyMi1K1a5y7UnZqrKtSd2m8m1J4aIyLknlnnLuSOmasq5I7ZbybkjxkjIvSMUmq+++yWoqHIH/wrlpkZ1KVq9GB4ty70cJh7KwRw2D8nBHEX8yMUcVe3LxRhl3sjHCk27I78gkW+ovcQCjLHDAnMZJsMuedjyRzJt8nBHNmtiMEc6Z6HwRz5j4bBHQlwhdEdGWGE1RviU37bSFIig9c8hLUv2k1VNifeVfXHft9ddghy02XV2NbfbZaKet9l1rte3223DHLffcdNdt991456333nz37fffgAcu+OCEF2744YgnrvjijDfu+OOQRy755JRXbvnlmGeu+eacd+7556CHLvropJdu+umop6766qy37vrrsMcu++y012777bjnrvvuvPfu++/ABy/88MQXb/zxyCev/PLMN+/889BHL/301Fdv/fXYZ6/99tx37/334Icv/vjkl2/++einr/767Lfv/vvwx79KCA=="
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
field1:{"type":"field","size":[276,34],"pos":[122,300],"locked":1,"border":0,"style":"plain","align":"center","value":"Decker organizes information on Cards.\\nThink of them like a paper index card you can draw on."}
field2:{"type":"field","size":[272,34],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Cards"}
canvas1:{"type":"canvas","size":[193,126],"pos":[160,109],"show":"transparent","border":0,"scale":1}

{script:What's a Card?.0}
on click do
  go["Prev" "SlideRight"]
end
{end}

{card:What's a Deck?}
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
field1:{"type":"field","size":[276,34],"pos":[122,300],"locked":1,"border":0,"style":"plain","align":"center","value":"A collection of cards is called a Deck.\\nYou see the topmost card in the deck, and you can flip to a different card at any time."}
field2:{"type":"field","size":[272,34],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Decks"}
canvas3:{"type":"canvas","size":[198,131],"pos":[178,115],"script":"What's a Deck?.0","border":0,"image":"%%IMG3AMYAgwVgII5kaZ5oqq5s675wLM8nEAB4ru987//AoHBILBqPyOTudlM6n9CodErljarYrHbLFV674LB4TPySz+i01qxuu99lEXxOr9vk9rx+zN77/1N9gIOERoKFiIlWeIqNjndNj5KFh5OWdpWXmm+Zm55onZ+iYaGjpmuMp6pgpauuT62vskexs7Zeqbe6SLW7vjm9v77BwrrExbYjE8vMzc7P0NHS09TV1tfY2drb3M2QyOA+x+Gu4+Sq5uem6eqi7O2e7/Ca8vOW9faS+PmO+/yKyroJHEiwoMGDCJ19+zcsF8NZ/h4SiigREMWKfi5i1KNxIyaHHteBDOluJMl4Jk/SE5GwpcuXMGNSW6hSZKSaJW/iRKlz58qePu+lDNqoI1EyRo+KSaqU1dCmE59CtchSptWrWLNaozm1n9Sue5iCxSJ2LJWyZqWgTQtlLVsnbt8miSuX1te6bujijRNAq9+/gGFy3cvxLmFQhg8jTax4KePGToFCzvt48ha9lpdUzkx2M+eznj+rrRq4tOnT1waLRix5tePWriPHVoNZdO3Ptznnzrzbcu/JvyEHRE28OHHVs0mFTs5rOXNDzp/zlc4nOvUgwRtnV7z9cHfC3/cON06+fFbk1zvDTj96Pfu21t8vci9fSXi89+vml7v/bX+2/6U1nnkEFogQDgGaleBYC4LVYFc0RCjhhBRWaOGFLCCI4YYcdujhhyyEAA==","scale":1}
canvas2:{"type":"canvas","size":[198,131],"pos":[168,104],"script":"What's a Deck?.0","border":0,"image":"%%IMG3AMYAgwVgII5kaZ5oqq5s675wLM8nEAB4ru987//AoHBILBqPyOTudlM6n9CodErljarYrHbLFV674LB4TPySz+i01qxuu99lEXxOr9vk9rx+zN77/1N9gIOERoKFiIlWeIqNjndNj5KFh5OWdpWXmm+Zm55onZ+iYaGjpmuMp6pgpauuT62vskexs7Zeqbe6SLW7vjm9v77BwrrExbYjE8vMzc7P0NHS09TV1tfY2drb3M2QyOA+x+Gu4+Sq5uem6eqi7O2e7/Ca8vOW9faS+PmO+/yKyroJHEiwoMGDCJ19+zcsF8NZ/h4SiigREMWKfi5i1KNxIyaHHteBDOluJMl4Jk/SE5GwpcuXMGNSW6hSZKSaJW/iRKlz58qePu+lDNqoI1EyRo+KSaqU1dCmE59CtchSptWrWLNaozm1n9Sue5iCxSJ2LJWyZqWgTQtlLVsnbt8miSuX1te6bujijRNAq9+/gGFy3cvxLmFQhg8jTax4KePGToFCzvt48ha9lpdUzkx2M+eznj+rrRq4tOnT1waLRix5tePWriPHVoNZdO3Ptznnzrzbcu/JvyEHRE28OHHVs0mFTs5rOXNDzp/zlc4nOvUgwRtnV7z9cHfC3/cON06+fFbk1zvDTj96Pfu21t8vci9fSXi89+vml7v/bX+2/6U1nnkEFogQDgGaleBYC4LVYFc0RCjhhBRWaOGFLCCI4YYcdujhhyyEAA==","scale":1}
canvas1:{"type":"canvas","size":[198,131],"pos":[157,94],"script":"What's a Deck?.0","border":0,"image":"%%IMG3AMYAgwVgII5kaZ5oqq5s675wLM8nEAB4ru987//AoHBILBqPyOTudlM6n9CodErljarYrHbLFV674LB4TPySz+i01qxuu99lEXxOr9vk9rx+zN77/1N9gIOERoKFiIlWeIqNjndNj5KFh5OWdpWXmm+Zm55onZ+iYaGjpmuMp6pgpauuT62vskexs7Zeqbe6SLW7vjm9v77BwrrExbYjE8vMzc7P0NHS09TV1tfY2drb3M2QyOA+x+Gu4+Sq5uem6eqi7O2e7/Ca8vOW9faS+PmO+/yKyroJHEiwoMGDCJ19+zcsF8NZ/h4SiigREMWKfi5i1KNxIyaHHteBDOluJMl4Jk/SE5GwpcuXMGNSW6hSZKSaJW/iRKlz58qePu+lDNqoI1EyRo+KSaqU1dCmE59CtchSptWrWLNaozm1n9Sue5iCxSJ2LJWyZqWgTQtlLVsnbt8miSuX1te6bujijRNAq9+/gGFy3cvxLmFQhg8jTax4KePGToFCzvt48ha9lpdUzkx2M+eznj+rrRq4tOnT1waLRix5tePWriPHVoNZdO3Ptznnzrzbcu/JvyEHRE28OHHVs0mFTs5rOXNDzp/zlc4nOvUgwRtnV7z9cHfC3/cON06+fFbk1zvDTj96Pfu21t8vci9fSXi89+vml7v/bX+2/6U1nnkEFogQDgGaleBYC4LVYFc0RCjhhBRWaOGFLCCI4YYcdujhhyyEAA==","scale":1}

{script:What's a Deck?.0}
on click pos do
 me.index:999
end

on drag pos do
 
end

on release pos do
 
end
{end}

{card:Drawing Practice}
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
field1:{"type":"field","size":[296,57],"pos":[108,279],"locked":1,"border":0,"style":"plain","align":"center","value":"Decker has a number of tools for drawing.\\nTry out the Pencil from the Tool menu above and have a scribble!\\nYou can choose drawing patterns and brushes from the Style menu.\\n   When you're finished, choose \\"Interact\\" from the Tool menu to continue."}
field2:{"type":"field","size":[276,43],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Drawing"}

{card:Widgets}
image:"%%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"
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
field1:{"type":"field","size":[276,34],"pos":[122,300],"locked":1,"border":0,"style":"plain","align":"center","value":"Cards can have Widgets,\\nlike a Button that takes you to another card when you click it,\\nor a Field containing text."}
field2:{"type":"field","size":[273,44],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Widgets"}
button1:{"type":"button","size":[67,23],"pos":[148,164],"script":"Widgets.0","text":"MORE!"}
field3:{"type":"field","size":[165,78],"pos":[294,143],"value":"Galena is a Sapphire Gem hen.\\n\\n- She weighs 4.6 pounds.\\n- She is almost 2 years old.\\n- She has laid over 350 eggs so far!"}

{script:Widgets.0}
on click do
 alert["This button is for illustrative purposes only. Sorry!"]
end
{end}

{card:Widget Overview}
image:"%%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"
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
field1:{"type":"field","size":[276,34],"pos":[122,300],"locked":1,"border":0,"style":"plain","align":"center","value":"There are six types of widget:\\nButtons, Fields, Sliders, Grids, Canvases, and Contraptions.\\nClick on each type for more information."}
field2:{"type":"field","size":[272,42],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Widget Types"}
field3:{"type":"field","size":[65,22],"pos":[72,103],"locked":1,"font":"menu","show":"transparent","border":0,"style":"plain","align":"center","value":"Button"}
field4:{"type":"field","size":[65,22],"pos":[216,108],"locked":1,"font":"menu","show":"transparent","border":0,"style":"plain","align":"center","value":"Field"}
field5:{"type":"field","size":[65,22],"pos":[379,128],"locked":1,"font":"menu","show":"transparent","border":0,"style":"plain","align":"center","value":"Slider"}
field6:{"type":"field","size":[65,22],"pos":[53,254],"locked":1,"font":"menu","show":"transparent","border":0,"style":"plain","align":"center","value":"Grid"}
field7:{"type":"field","size":[65,22],"pos":[222,249],"locked":1,"font":"menu","show":"transparent","border":0,"style":"plain","align":"center","value":"Canvas"}
button1:{"type":"button","size":[115,74],"pos":[45,79],"script":"Widget Overview.0","style":"invisible"}
button2:{"type":"button","size":[115,74],"pos":[191,81],"script":"Widget Overview.1","style":"invisible"}
button3:{"type":"button","size":[147,76],"pos":[340,80],"script":"Widget Overview.2","style":"invisible"}
button4:{"type":"button","size":[132,108],"pos":[18,176],"script":"Widget Overview.3","style":"invisible"}
button5:{"type":"button","size":[145,115],"pos":[181,166],"script":"Widget Overview.4","style":"invisible"}
field8:{"type":"field","size":[77,22],"pos":[376,251],"locked":1,"font":"menu","show":"transparent","border":0,"style":"plain","align":"center","value":"Contraption"}
button6:{"type":"button","size":[145,115],"pos":[342,164],"script":"Widget Overview.5","style":"invisible"}

{script:Widget Overview.0}
on click do
  go["Buttons" "BoxIn"]
end
{end}

{script:Widget Overview.1}
on click do
  go["Fields" "BoxIn"]
end
{end}

{script:Widget Overview.2}
on click do
  go["Sliders" "BoxIn"]
end
{end}

{script:Widget Overview.3}
on click do
  go["Grids" "BoxIn"]
end
{end}

{script:Widget Overview.4}
on click do
  go["Canvases" "BoxIn"]
end
{end}

{script:Widget Overview.5}
on click do
  go["Contraptions" "BoxIn"]
end
{end}

{card:Actions}
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
field2:{"type":"field","size":[273,44],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Actions"}
field3:{"type":"field","size":[276,29],"pos":[116,75],"locked":1,"border":0,"style":"plain","align":"center","value":"The \\"Actions\\" dialogue in the properties panel of a button lets you make several things happen when you click on the button:"}
field4:{"type":"field","size":[155,37],"pos":[180,109],"locked":1,"border":0,"style":"plain","value":"- Playing a sound\\n- Navigating to a different card\\n- Producing a transition animation"}
button1:{"type":"button","size":[165,52],"pos":[176,176],"text":"Give Me Some Action!"}
field1:{"type":"field","size":[276,51],"pos":[122,290],"locked":1,"border":0,"style":"plain","align":"center","value":"Switch to the Widgets tool,\\ndouble-click the button above to edit its properties,\\nand try giving it an action.\\nWhen you're finished, switch back to the Interact tool."}

{card:Action Scripts}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0az4KgDNnTpvBdPr8qZPnLaBEi+4U+sqo0QY4kbpSetTprqVSfxGt2vMqVl9Ft1oF6vWrz7Bio5Kd+vNsL7BqeaVti9YsXFxj58ZtaldX0Ly59vKlK/cvLb+CawUuLOswYliKFz/F63hW48irJlNWZfnyqcyaS3HuLIowaMyfR38SbXpz6dScULPuFECB69ebzM6mrck2ZNynIa/mPWnnbeCZhO8GcJy4pbfI6yq/lJbtc+hKp+fWav268+zak9/kztR7IajgI0HdXh7ReenpA60f3h7Q+/iM1tNXT/5+/er6FZ3v/0dsD7AHoHziNYdegQF6x5yChMhFoIPuHdeghIIEFaGFF3al4SFUdThehSCGyN+IG5Zo4oTYpchiiy6+CGOMMs5IY4023ohjjjruWImAPOaRIHw/jjHfkGvYZyQbHybZxopMNsnhk0o2haKUZBz1n5ViQFilllxMFqWXWnzmpJhV+ChBmGaeUeaaZWTo5pUJxinnnDGieUebLf52pJ4j8gklnBbaCaSgBYroh6H3+dkHootSKSQfjqZnXKSNAgqcgJUuciB9leJJJxhYdhpqFrqBWuoWEKYaBqasSuHqq1DEKmsTtNbKxK24KqHrrkj06qsRwAZLxLDECmHssT8kq6wPzDbLw7PQ6iDttDhUa60N2GZLw7bcyuDttzCEK+4LqJaLbrrqrstuu+6+C2+88s5Lb7323otvvvruy2+//v4LcMACD0xwwQYfjHDCCi/McMMOPwxxxBJPTHHFFl+MccYab8xxxx5/DHLIIo9Mcskmn4xyyiqvzHLLLr8Mc8wyz0xzzTbfjHPOOu/Mc88+/wx00EIPTXTRRh+NdNJKL810004/DXXUUk9NddVWX4111lpvzXXXXn8Ndthij41VAQ=="
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
field2:{"type":"field","size":[273,44],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Inside Actions"}
field1:{"type":"field","size":[276,34],"pos":[122,300],"locked":1,"border":0,"style":"plain","align":"center","value":"The Action dialogue writes a script for you.\\nIt might look something like the above."}
field3:{"type":"field","size":[122,48],"pos":[95,143],"locked":1,"style":"code","value":"on click do\\n play[\\"sosumi\\"]\\n go[\\"Next\\" \\"BoxIn\\"]\\nend"}
field4:{"type":"field","size":[85,33],"pos":[226,78],"locked":1,"border":0,"style":"plain","align":"center","value":"The behavior happens when the button is clicked."}
field5:{"type":"field","size":[92,25],"pos":[289,129],"locked":1,"border":0,"style":"plain","align":"center","value":"Play a sound with the name \\"sosumi\\"."}
field6:{"type":"field","size":[192,48],"pos":[63,225],"locked":1,"border":0,"style":"plain","align":"center","value":"The names \\"Next\\", \\"Prev\\", \\"First\\", \\"Last\\", and \\"Back\\" have special meanings.\\nAny other string in double-quotes would refer to a card by name."}
field7:{"type":"field","size":[127,55],"pos":[279,175],"locked":1,"border":0,"style":"plain","align":"center","value":"\\"BoxIn\\" is the name of a transition animation.\\nYou can define your own reusable transition animations with scripts!"}

{card:The Listener}
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
  :{"type":"field","size":[273,44],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"The Listener"}
 :{"type":"field","size":[301,44],"pos":[103,73],"locked":1,"border":0,"style":"plain","align":"center","value":"The listener lets you try out scripts interactively.\\nPress \\"shift + L\\" on your keyboard to open the listener.\\nType one of the expressions below and press shift + enter to get a result. When you're done, press escape."}
   :{"type":"field","size":[122,60],"pos":[190,127],"locked":1,"border":1,"style":"code","value":"  2+3\\n\\n  alert[\\"Hello!\\"]\\n\\n  range 10"}
postscript:{"type":"field","size":[253,49],"pos":[128,303],"locked":1,"border":0,"style":"plain","align":"center","value":"Anything you can do in a script, you can try interactively with the listener, and vice versa!"}

{card:Lil}
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
title:{"type":"field","size":[273,44],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Lil"}
exposition:{"type":"field","size":[301,44],"pos":[104,301],"locked":1,"border":0,"style":"plain","align":"center","value":"Scripts are written in a special programming language called Lil.\\nDecker comes with a complete manual for Lil, but you can get the gist of the language with a few simple examples."}
field1:{"type":"field","size":[295,105],"pos":[103,117],"locked":1,"border":1,"style":"code","value":"on mode a do   # line comment\\n r:()\\n each x in a\\n  r[x]:1+r[x]\\n end\\n first extract key orderby value desc from r\\nend\\n\\nmode[1,2,2,3,4,2,1]"}

{card:Scripting 1}
image:"%%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"
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
title:{"type":"field","size":[273,44],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Example 1"}
exposition:{"type":"field","size":[301,44],"pos":[104,301],"locked":1,"border":0,"style":"plain","align":"center","value":"We have a field named \\"display\\", and a button.\\nWhen the button is clicked, the script reads the contents of the field, multiplies it by three, and writes it back to the field."}
field1:{"type":"field","size":[202,40],"pos":[240,181],"locked":1,"border":1,"style":"code","value":"on click do\\n display.text:3*display.text\\nend"}
display:{"type":"field","size":[87,32],"pos":[95,132],"font":"deckbuilder","value":"5"}
button1:{"type":"button","size":[87,33],"pos":[96,183],"script":"Scripting 1.0","text":"Triple It"}
field2:{"type":"field","size":[99,25],"pos":[231,114],"locked":1,"border":0,"style":"plain","align":"center","value":"The colon (:) is Lil's assignment operator."}
field3:{"type":"field","size":[90,54],"pos":[348,90],"locked":1,"border":0,"style":"plain","align":"center","value":"\\"display\\" is a widget on this card.\\nThe .text property is its contents as plain text."}

{script:Scripting 1.0}
on click do
 display.text:3*display.text
end
{end}

{card:Scripting 2}
image:"%%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"
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
title:{"type":"field","size":[273,44],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Example 2"}
exposition:{"type":"field","size":[301,44],"pos":[104,301],"locked":1,"border":0,"style":"plain","align":"center","value":"We have a field named \\"display\\", and a slider.\\nWhen the slider is changed, it updates the display with a string indicating whether the value is above a threshold."}
display:{"type":"field","size":[98,32],"pos":[87,128],"value":"Too Low."}
input:{"type":"slider","size":[100,25],"pos":[87,185],"script":"Scripting 2.0","interval":[0,100]}
field1:{"type":"field","size":[163,81],"pos":[252,187],"locked":1,"border":1,"style":"code","value":"on change val do\\n display.text: if val > 70\\n  \\"I'm Satisfied.\\"\\n else\\n  \\"Too Low.\\"\\n end\\nend"}
field2:{"type":"field","size":[104,44],"pos":[224,93],"locked":1,"border":0,"style":"plain","align":"center","value":"When a slider changes, you get its value as an argument to the \\"change\\" function."}
field3:{"type":"field","size":[95,62],"pos":[351,80],"locked":1,"border":0,"style":"plain","align":"center","value":"\\"if ... else ... end\\" is an expression,\\nand returns either the true or false\\nbranch based on a condition."}

{script:Scripting 2.0}
on change val do
 display.text: if val > 70
  "I'm Satisfied."
 else
  "Too Low."
 end
end
{end}

{card:Scripting 3}
image:"%%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"
{widgets}
next:{"type":"button","size":[86,26],"pos":[415,305],"script":"home.2","text":"Next","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
title:{"type":"field","size":[273,44],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Example 3"}
exposition:{"type":"field","size":[301,44],"pos":[104,297],"locked":1,"border":0,"style":"plain","align":"center","value":"We have a table of normal monthly expenses named \\"expenses\\",\\nand a field below named \\"total\\".\\nIf you modify the contents of the grid, the total below will be recalculated."}
total:{"type":"field","size":[92,21],"pos":[74,230],"value":"$4900.00"}
field1:{"type":"field","size":[305,49],"pos":[193,141],"locked":1,"border":1,"style":"code","value":"on change do\\n costs: extract sum cost from expenses.value\\n total.text: \\"%c\\" format costs\\nend"}
expenses:{"type":"grid","size":[143,103],"pos":[23,118],"script":"Scripting 3.0","format":"sc","value":{"name":["data","utility","food","candles","rent"],"cost":[150,150,200,3600,800]}}
field2:{"type":"field","size":[75,36],"pos":[250,226],"locked":1,"border":0,"style":"plain","align":"center","value":"\\"%c\\" means format as currency."}
field3:{"type":"field","size":[78,33],"pos":[311,75],"locked":1,"border":0,"style":"plain","align":"center","value":"sum all the elements of the cost column"}
field4:{"type":"field","size":[110,35],"pos":[191,75],"locked":1,"border":0,"style":"plain","align":"center","value":"\\"extract\\" queries a table and produces a single value as a result."}
field5:{"type":"field","size":[79,34],"pos":[400,76],"locked":1,"border":0,"style":"plain","align":"center","value":"query the table stored in the expenses grid."}

{script:Scripting 3.0}
on change do
 costs: extract sum cost from expenses.value
 total.text: "%c" format costs
end
{end}

{card:And More}
image:"%%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"
{widgets}
home:{"type":"button","size":[86,26],"pos":[415,305],"script":"And More.0","text":"Home","style":"rect"}
prev:{"type":"button","size":[86,26],"pos":[12,304],"script":"What's a Card?.0","text":"Previous","style":"rect"}
field1:{"type":"field","size":[285,106],"pos":[115,231],"locked":1,"border":0,"align":"center","value":{"text":["This tour has only scratched the surface of what Decker can do.\\nFor more detail, consult ","the Decker reference manual",", ","the Decker community forum",", and supplementary interactive docs:\\n\\n","Sound","  ","Color","  ","Brushes","  ","Draggable","  ","Fonts","\\n","Plot","  ","PDF","  ","Twee","  ","Zazz","  ","Ease","  ","Dialogizer","  ","Puppeteer"," \\n","Path","  ","WigglyKit","  ","The Forbidden Library","\\n\\nOffline copies of these materials\\ncan be found in Decker's \\"examples\\" directory!"],"font":["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],"arg":["","http://beyondloom.com/decker/decker.html","","https://internet-janitor.itch.io/decker/community","","http://beyondloom.com/decker/sound.html","","http://beyondloom.com/decker/color.html","","http://beyondloom.com/decker/brushes.html","","http://beyondloom.com/decker/draggable.html","","http://beyondloom.com/decker/fonts.html","","http://beyondloom.com/decker/plot.html","","http://beyondloom.com/decker/pdf.html","","http://beyondloom.com/decker/twee.html","","http://beyondloom.com/decker/zazz.html","","http://beyondloom.com/decker/ease.html","","http://beyondloom.com/decker/dialog.html","","http://beyondloom.com/decker/puppeteer.html","","http://beyondloom.com/decker/path.html","","http://beyondloom.com/decker/wigglykit.html","","http://beyondloom.com/decker/forbidden.html",""]}}
field2:{"type":"field","size":[272,34],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"...And Much More!"}

{script:And More.0}
on click do
  go["First" "BoxIn"]
end
{end}

{card:Buttons}
image:"%%IMG3AgABVgUgII5kaZ5oqq5s675wLM90bd94ru987//AoHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26tevXsGPLnk27tu3buHPr3s27d1sKwIMLD+47jvAWwIuvIS4jufIyzm1Ef/6FAg/r1L1gv56dy/Ye07sXCY/i+w/y4n04Z37CfBD36XfARw8fSP340lVMv28fP/cVxymB3gjDFcgfdQdKMV+Cw8WXoILYsQdDg889OMWAMwTIm4VzYDgbh3SAuJqIcpCImokl5oZiiretyCJtLnZYW4wvxkZjjbDdaNyHi+iYmY9wAHmZkG0QWZmRbCA5mZJqMAmZk2hA+ZiUZlDZmJXQ2egIlohxmWWOW4IZ5mtefulamWOgSZiaYrApmIeDuDkYnIDIuSadfNhpmISB6HkYnnf42SUhgv4Z54aCFDponb4pmoSji/YBqaF+TLrnH5YWlikRm65ZqXKdvgeqpBWSWqoeoWqaB6C2MWmghkewipuRcMIqKn5A8smCrDHwqhuNuk4YbHPDpodisTRQ+AKyuBI73quv+oechb5KS0WBJNhqbZTMbuvtt+CGK+645JZr7rnopqvuuuy26+678MYr77z01mvvvfjmq+++/Pbr778AByzwwAQXbPDBCCes8MIMN+zwwxBHLPHEFFds8cUYZ6zxxhx37PHHIIcs8sgkl2zyySinrPLKLLfs8sswxyzzzDTXbPPNOOes88489+zzz0AHLfTQRBdt9NFIJ6300kw/FQI="
{widgets}
back:{"type":"button","size":[86,26],"pos":[12,304],"script":"Buttons.0","text":"Back","style":"rect"}
field1:{"type":"field","size":[292,33],"pos":[117,299],"locked":1,"border":0,"style":"plain","align":"center","value":"Buttons can make something happen when you click on them!"}
field2:{"type":"field","size":[272,42],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Buttons"}
button1:{"type":"button","size":[102,42],"pos":[118,113],"script":"Buttons.1","text":"Rounded"}
button2:{"type":"button","size":[102,42],"pos":[117,184],"script":"Buttons.2","text":"Rectangle","style":"rect"}
check:{"type":"button","size":[97,24],"pos":[296,120],"text":"Checkbox","style":"check","value":0}
button4:{"type":"button","size":[102,42],"pos":[295,182],"script":"Buttons.3","text":"\\"Invisible\\"","style":"invisible"}

{script:Buttons.0}
on click do
  go["Back" "BoxOut"]
end
{end}

{script:Buttons.1}
on click do
  play["sosumi"]
end
{end}

{script:Buttons.2}
on click do
 alert["you clicked me!"]
end
{end}

{script:Buttons.3}
on click do
 alert["The checkbox value is %b." format check.value]
end
{end}

{card:Fields}
{widgets}
back:{"type":"button","size":[86,26],"pos":[12,304],"script":"Buttons.0","text":"Back","style":"rect"}
field1:{"type":"field","size":[292,44],"pos":[117,288],"locked":1,"border":0,"style":"plain","align":"center","value":"Fields contain text.\\nThey are useful both as labels (like this one)\\nand as a place for users to enter text."}
field2:{"type":"field","size":[272,42],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Fields"}
field3:{"type":"field","size":[143,25],"pos":[194,98],"font":"menu","value":"A simple editable field."}
field4:{"type":"field","size":[197,95],"pos":[281,156],"scrollbar":1,"style":"code","value":"# A \\"code\\" field is handy\\n# for writing scripts!\\n\\non square x do\\n x * x\\nend\\n\\n"}
field5:{"type":"field","size":[162,93],"pos":[62,158],"locked":1,"scrollbar":1,"align":"center","value":{"text":["Rich text fields can contain multiple fonts and inline images:\\n","i","\\nThey can also contain ","links"," to other cards or to external URLs. Note that for links to be clickable, the field has to be \\"locked\\"."],"font":["","","","",""],"arg":["","%%IMG3ADIAKQQQyEmrvTjrzbv/YNgFYrkFqKlWaLu+bfqabePOYn3jX93YMk6MpPIBiZphrGT87S7KYQ71qz5ZrYRWu+xRq9YgJbstJ67JL/hoIZvLaKh6zR6j3uZ4e75+uvFbehNNdHUAf4BnYnIBhWA7iICCh3yON5F4k4RRnHeJXIt2jY+dnZ+afKWmiYKER6pDrKGidLCrgai2uqVCu75SI7+dEsArwkg8xMLJor7Mg8vPlL/S087Sx9XZ2NHcu9Xg4eLjExE=","","http://beyondloom.com",""]}}

{card:The Secret Chicken Card}
image:"%%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"
{widgets}
field1:{"type":"field","size":[105,35],"pos":[293,49],"border":0,"scrollbar":0,"style":"plain","align":"center","value":"Greetings, traveler.\\nYou have found the secret chicken card."}
field2:{"type":"field","size":[100,33],"pos":[339,157],"border":0,"scrollbar":0,"style":"plain","align":"center","value":"May your day be blessed by many bugs and pieces of corn."}

{card:Sliders}
{widgets}
back:{"type":"button","size":[86,26],"pos":[12,304],"script":"Buttons.0","text":"Back","style":"rect"}
field1:{"type":"field","size":[292,33],"pos":[117,299],"locked":1,"border":0,"style":"plain","align":"center","value":"Sliders represent a number, within a configurable range.\\nThey can also act like progress bars."}
field2:{"type":"field","size":[272,42],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Sliders"}
slider1:{"type":"slider","size":[190,25],"pos":[146,221],"value":55}
slider2:{"type":"slider","size":[24,108],"pos":[374,119],"interval":[0,100],"value":32,"style":"vert"}
slider3:{"type":"slider","size":[185,28],"pos":[143,108],"interval":[0,100],"value":50,"format":"%f%% complete","style":"bar"}
slider4:{"type":"slider","size":[185,28],"pos":[145,163],"interval":[0,100],"value":30,"step":5,"format":"the number is %i ","style":"compact"}

{card:Grids}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9ijWr1q1cu3r9Cjas2LFky5o9izat2rVs27p9CzeulAByKQW4W3cS3bx8+/r9Cziw4MGECxs+jDix4sWMGzt+DDmy5MmUK1u+jDmz5s2cO3v+DDq06NGkS5s+jTq16tWsW7t+DTu27Nm0a9u+jTu37t28e/v+DTy48OHEixs/jjy58uXMmzt/Dj269OnUq1u/jj279u3cu3v/Dt4h3vAq7o4nb8L8XvTpz7MnYf59+/XyR8SvH0I9ffwd9IPQf993AA5IYIEGBsjdgQouOGB4DD7oH38R8vffhBR6YOGF/amn4QcZdqiBeyCOSGKJJp6IYooqrshiiy6+CGOMMs5IY4023ohjjjruyGOPPv4IZJBCDklkkUYeiWSSSi7JZJNOPglllFJOSWWVVl6JZZZabslll15+CWaYYo5JZplmnolmmmquyWabbr4JZ5xyzklnnXbeiWeeeu7JZ59+/glooIIOSmihhh6K6JYFAA=="
{widgets}
back:{"type":"button","size":[86,26],"pos":[12,304],"script":"Buttons.0","text":"Back","style":"rect"}
field1:{"type":"field","size":[280,45],"pos":[123,290],"locked":1,"border":0,"style":"plain","align":"center","value":"Grids store tabular data, like a little spreadsheet.\\nYou can double-click cells to edit them,\\nInsert and remove rows, query the table,\\nand control how each column is formatted."}
field2:{"type":"field","size":[272,42],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Grids"}
checklist:{"type":"grid","size":[127,91],"pos":[301,80],"headers":0,"lines":1,"widths":[20],"format":"BL","value":{"chosen":[0,1,1,1,1],"name":["First","Second","Third","Fourth","Fifth"]}}
two:{"type":"grid","size":[195,93],"pos":[70,78],"scrollbar":1,"headers":1,"widths":[95,38],"format":"scf","value":{"fruit":["apple","cherry","banana","durian","elderberry"],"price":[1,0.35,0.75,2.99,0.92],"amount":[1,15,2,5,1]}}
grid1:{"type":"grid","size":[68,83],"pos":[177,183],"scrollbar":0,"lines":0,"value":{"measure":["Gallon","Quart","Cup","Tablespoon","Teaspoon"]},"row":2}
field3:{"type":"field","size":[74,44],"pos":[298,204],"locked":1,"border":0,"value":"a single-column grid makes a good selection box for input!"}

{card:Canvases}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTNnlQA6mQX4ybNnMqBBhR4jarQV0aVMmzr9mTTV06lUkUY9VTVr06vDgHLt6vUrMKtif4UtOxat2rVs27p9Czeu3Ll069q9izev3r3wivJddfavVKiCVQUubOowYlKKF4tq7BgU5MieJlPmZPmypsyaMXHuXOkzaD+ELYgevYcshdOo5zy9wLp1HKcYYsuezdS06tukaT/YyjsQ1QWvgwsvrXW3cUCBsy4/1Bj4c+i2pxOqbn2Q3+zcu3v/Dj68+PHky5s/jz69+vXs27t/Dz++/Pn069u/jz+//v38+/v/D2CAAg5IYIEGHohgggouyGCDDj4IYYQSTkhhhRZeiGGGGm7IYYcefghiiCKOSGKJJp6IYooqrshiiy6+CGOMMs5IY4023ohjjjruyGOPPv4IZJBCDklkkUYeiWSS8m2nZAjYNQnBk1A6IOWUDFRpJXGlZdkBlgBsCSWWuU0ppnRIevnlVEeiaUBxRaKp5prKRelckmY2kFyYVSHgZppMKpncZGziWOeVYHKpwJwJDGqloojq9mikkk5KaaWWXopppppuymmnnn4Kaqiijkpqqaaeimqqqq7KaquuvgprrLLOSmuttt6Ka6667sprr77+Cmywwg5LbLHGHotsssouy2yzzj4LbbTSTktttdZei2222m7LbbfefgtuuOKOS265ohQA"
script:"Canvases.0"
{widgets}
back:{"type":"button","size":[86,26],"pos":[12,304],"script":"Buttons.0","text":"Back","style":"rect"}
field1:{"type":"field","size":[286,45],"pos":[123,290],"locked":1,"border":0,"style":"plain","align":"center","value":"Canvases each contain an image.\\nBy default, you can scribble on them,\\nand with scripting you can use them for input\\nor display animations."}
field2:{"type":"field","size":[272,42],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Canvases"}
four:{"type":"canvas","size":[105,74],"pos":[70,83],"pattern":35,"border":1,"brush":16}
board:{"type":"canvas","size":[96,93],"pos":[143,176],"script":"Canvases.1","show":"invert","image":"%%IMG0AAwADAAAf+BJIEkgTyBJIEkgTyBBIEEgf+AAAA==","scale":8}
field3:{"type":"field","size":[63,26],"pos":[182,92],"locked":1,"border":0,"style":"plain","value":"a canvas you can draw on"}
field4:{"type":"field","size":[62,44],"pos":[71,187],"locked":1,"border":0,"style":"plain","value":"a scaled canvas that acts like a pixel editor"}
target:{"type":"canvas","size":[141,128],"pos":[297,130],"volatile":1,"scale":1}
field5:{"type":"field","size":[102,24],"pos":[314,258],"locked":1,"border":0,"style":"plain","align":"center","value":"a canvas being drawn on by a card script"}
field6:{"type":"field","size":[58,34],"pos":[274,75],"locked":1,"border":0,"style":"plain","value":"a canvas you can drag around"}
canvas1:{"type":"canvas","size":[30,28],"pos":[369,84],"image":"%%IMG3AB4AHAKEj6nL7Q/jC7RSiazWePsabYwFgeXVmCG6qACpuBn7xewcGN/98voF+91kwl7uwEH6jEUjj6iK+qA0YoJ6FGZx2Osuads6d6mlRxLElK1qJbntPsO16bn9zigA","draggable":1,"scale":1}

{script:Canvases.0}
on pinwheel t do
 target.clear[]
 c:target.size/2                  # center of canvas
 r:c[0]*.6+.4*sin 0.02*t          # radius of the pattern
 a:(0.005*t)+(pi/0.5*16)*range 16 # angle per wedge
 p:flip c+flip r*unit a           # points around a circle
 each x i in p
  if 2%i target.poly[c x p[(count p)%1+i]] end # draw every other wedge
 end
end

on view do
 pinwheel[sys.frame]
 go[card]
end
{end}

{script:Canvases.1}
on click pos do
 me.pattern:!me[pos] 
end

on release pos do
 drag[pos]
end
{end}

{card:Contraptions}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9ijSp0qVMmzp9ClVQgKi1AljVOFWd1awWt17d8bXVVoxevd4w62psxbJsZ5StxDYshbcUx8ZVu4Iupbt8+8atKxfA3xRtL/k9zLdrYMF4T+j9hLht44mPWVSWNZlyYRWXZ2WWeJdwZ8+LQV/dLAL1rc+muarm8BoXV7IKQmOwTTVS3wi7c8ONHNn3JuCxhQ8/bDy58uXMmzt/Dj269OnUq1u/jj279u3cu3v/Dj68+PHky5s/jz69+vXs27t/Dz++/Pn069u/jz+//v38+/v/r81sAM6B1oByFGggHAgm+AZrDK7h4INoRCjhGRRWWMaFGI6h4YZhdOjhFyCGyMWIJG5h4olZpKjiFSy2WMWLME4h44xR1GijEzjm2MSOPC7h449JBCnkEUQWWcSRSA6h5JJBNOnkD1BG2cOUVIJV2pU0ZqnljVx2+YSVYNog5pg0lGmmDGimCcOabOY12ptP9ianEX7VOWSceBJR3J5J6umnEIAGOueXhApq6KFSJqpolYw2iqWAkCIq6aRAuGnpB5hm2sGmNFUaiqcyidoHqTCZugeqLqmaB6ssuWoHrCrJWgetJ9lKB64l6XrgozaBCgGvvQKrE4vCxnHsQYMukKyCvr7UpwPNOkvsqNE2MC21O9EpQbYNPrsScgzgpoq3/thF3LWjmNtPZum+wm67pSVGS7zyVpuLvfws6Iu+++IrG7icqinwwG0WbLAL/ja6sKINH8pvwjpELHEO6lZ8MMUYu/Xwxh5/DHLIIo9Mcskmn4xyyiqvzHLLLr8Mc8wyz0xzzTbfjHPOOu/Mc88+/wx00EIPTXTRRh+NdNJKL810004/DXXUUk9NddVWX401TwAn3TGhW2cNdthij0122WafjXbaaq/Ndttuvw133HLPTXfddt+Nd9567813335/UwA="
{widgets}
dieRoller3:{"type":"contraption","size":[137,23],"pos":[118,101],"def":"dieRoller","widgets":{"result":{"value":"1+4 = 5"},"button":{},"formula":{}}}
clock1:{"type":"contraption","size":[100,25],"pos":[302,82],"font":"menu","def":"clock","widgets":{"canvas1":{"size":[100,25]},"mil":{"size":[31,0],"pos":[54,18]}}}
datePicker1:{"type":"contraption","size":[109,118],"pos":[299,144],"script":"Contraptions.0","def":"datePicker","widgets":{"canv":{},"val":{},"next":{},"prev":{}}}
fancyBorder1:{"type":"contraption","size":[31,45],"pos":[125,166],"show":"transparent","def":"fancyBorder","widgets":{}}
fancyBorder2:{"type":"contraption","size":[87,47],"pos":[163,166],"show":"transparent","def":"fancyBorder","widgets":{}}
fancyBorder3:{"type":"contraption","size":[124,29],"pos":[125,219],"show":"transparent","def":"fancyBorder","widgets":{}}
back:{"type":"button","size":[86,26],"pos":[12,304],"script":"Buttons.0","text":"Back","style":"rect"}
field1:{"type":"field","size":[286,45],"pos":[123,290],"locked":1,"border":0,"style":"plain","align":"center","value":"Contraptions are \\"custom widgets\\" made out of simpler widgets.\\nFrom the inside they act like cards, and from the outside they seem like widgets. They can be reused many times within a deck, and can optionally be resizable."}
field2:{"type":"field","size":[272,42],"pos":[114,24],"locked":1,"font":"deckbuilder","border":0,"align":"center","value":"Contraptions"}
field6:{"type":"field","size":[52,24],"pos":[434,84],"locked":1,"border":0,"style":"plain","value":"a realtime clock"}
field3:{"type":"field","size":[37,24],"pos":[437,193],"locked":1,"border":0,"style":"plain","value":"a date picker"}
field4:{"type":"field","size":[56,34],"pos":[29,185],"locked":1,"border":0,"style":"plain","value":"resizable decorative borders"}
field5:{"type":"field","size":[58,34],"pos":[26,98],"locked":1,"border":0,"style":"plain","value":"a die roller for board games"}

{script:Contraptions.0}
on change x do
 
end
{end}

{card:credits}
image:"%%IMG3AgABVgKEj6nL7Q+jnLTai7PevPsPhuJIluaJpurKtu4Lx/JM1/aN5/rO9/4PDAqHxKLxiEwql8ym8wmNSqfUqvWKzWq33K73Cw6Lx+Sy+YxOq9fstvsNj8vn9Lr9js/r9/y+/w8YKDhIWGh4iJiouMjY6PgIGSk5SVlpeYmZqbnJ2en5CRoqOkpaanqKmqq6ytrq+gobKztLW2t7i5uru8vb6/sLHCw8TFxsfIycrLzM3Oz8DB0tPU1dbX2Nna29zd3t/Q0eLj5OXm5+jp6uvs7e7v4OHy8/T19vf4+fr7/P3+//DzCgwIEECxo8iDChwoUMGzp8CDGixIkUK1q8iDGjxo0cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9ijWr1q1cu3r9Cjas2LFky5o9izat2rVs27p9Czeu3Ll069q9izev3r18+/r9Cziw4MGECxs+jDix4sWMGzt+DDmy5MmUK1u+jDmz5s2cO3v+DDq06NGkS5s+jTq16tWsW7t+DTu27Nm0a9u+TTqA7t28e/v+DTy48OHEixs/jjy58uXMmzt/Dj269OnUq1tXHiIA7hjaQXTf7uK7B/HgV5DncL48ivQa2Ksv4R5D/Pci5luwT/8Dfgr786PP7l8K/UkwYIDyAWigCQVCsGCC/CHo4AgNOjBhhAxCaKF3GGY43oYc/qfhh/p5KGIGFTJwYokIpKgAiyoC4OKKL4I44oztkWjjBDEesKOIPcKYo4k4BnlhiERW8OOPHCZ55H1DNonik1C2KOWUMhpp5QNMZllkjVxSWCWXW37ZwJhkLmDmmQmkqSaPYWbJZptAYimnAXG2eaeaeZ65J5l9fvmnmG9aGSicg05ZKKGHQpkooos22Sijjx4ZKaSTElkppZcGmSmmm+bYKaef2hgqqKPOWCqpp76YKqqrqtgqq6+WGCuss/p464e10prrkr1muCuudNYZrK6/Wlisr8PKmSywx0bYLLLPOhgttNMmWC211xqYLbbbBtgtt9/6Fy644+ZXLrnn0pcuuuu+1y6776oXL7zzllcvvfeCly+++27XL7//4hYwwAPfVjDBB9uWMMIL19Ywww/TFjHEE89WMcUXy5YxxhvH1jHHH8MWMsgjv1YyySe7ljLKK7fWMsvZXUdzzTbfjHPOOu/Mc88+/6xknUIPTXTRRh+NdNJKL810004/DfV7BQA="
{widgets}
field1:{"type":"field","size":[469,69],"pos":[24,30],"locked":1,"font":"deckbuilder","show":"transparent","border":0,"align":"center","value":{"text":["Decker\\n","was designed and implemented\\nby John Earnest."],"font":["","menu"],"arg":["",""]}}
field2:{"type":"field","size":[328,48],"pos":[100,110],"locked":1,"font":"mono","border":0,"align":"center","value":"Decker draws significant inspiration from Bill Atkinson's HyperCard, the graphic design work of Susan Kare, and countless others at Apple."}
field3:{"type":"field","size":[315,25],"pos":[102,178],"locked":1,"border":1,"align":"center","value":"Decker would not exist today without constant support, feedback and bug reports from my many collaborators and testers:"}
button1:{"type":"button","size":[60,20],"pos":[21,300],"script":"credits.0","text":"Back"}
countless one on one workshops:{"type":"field","size":[104,19],"pos":[67,216],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"tangentstorm"}
putting up with endless ramblings:{"type":"field","size":[104,19],"pos":[189,246],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"faff"}
empress of dithering:{"type":"field","size":[104,19],"pos":[375,220],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"noyemi"}
helpful early feedback on lil:{"type":"field","size":[104,19],"pos":[183,289],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"chrispsn"}
best possible hens:{"type":"field","size":[104,19],"pos":[49,266],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"pippi & galena"}
usability feedback:{"type":"field","size":[104,19],"pos":[371,274],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"tomr"}
improvements to draw tools:{"type":"field","size":[104,19],"pos":[348,299],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"darzington"}
lilt qa and design feedback:{"type":"field","size":[104,19],"pos":[230,214],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"razetime"}
forever in our hearts:{"type":"field","size":[104,19],"pos":[91,299],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"eggbug"}
zine queen:{"type":"field","size":[104,19],"pos":[88,241],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"millie"}
painterly pixel-pusher:{"type":"field","size":[104,19],"pos":[299,257],"locked":1,"show":"transparent","border":0,"style":"plain","align":"center","value":"ahmwma"}

{script:credits.0}
on click do
  go["home" "SlideDown"]
end
{end}

{contraption:dieRoller}
size:[137,23]
resizable:1
margin:[90,8,8,9]
description:"roll dice using \\"1d6+5\\" notation."
script:"dieRoller.0p"
attributes:{"name":["formula"],"label":["Formula"],"type":["string"]}
{widgets}
result:{"type":"field","size":[51,19],"pos":[84,2],"style":"plain"}
button:{"type":"button","size":[79,19],"pos":[2,2],"script":"dieRoller.1p","text":"2d6","style":"rect"}
formula:{"type":"field","size":[33,20],"pos":[-8,-29],"locked":1,"show":"none","style":"plain","value":"2d6"}

{script:dieRoller.0p}
on roll x do
 r:() i:0
 x:"" fuse " " split x
 while i<count x
  if x[i]="+"
   i:i+1
  else
   p:"%[n]id%[die]i%[match]m%[i]n" parse i drop x
   r:r,if p.match 1+random[p.die p.n] else p.n end
   i:i+p.i
  end
 end
 r
end

on view do button.text:formula.text end
on set_formula x do formula.text:x view[] end
on get_formula   do formula.text          end
{end}

{script:dieRoller.1p}
on click do
 v:roll[me.text]
 result.text:if 1=count v
  v
 else
  v:"%s = %s" format ("+" fuse v),(sum v)
 end
end
{end}

{contraption:clock}
size:[100,100]
resizable:1
margin:[8,8,10,10]
description:"a realtime clock."
version:1
script:"clock.0p"
attributes:{"name":["24hour"],"label":["24 hour format"],"type":["bool"]}
{widgets}
canvas1:{"type":"canvas","size":[100,100],"pos":[0,0],"locked":1,"animated":1,"volatile":1,"script":"clock.1p","scale":1}
mil:{"type":"button","size":[31,19],"pos":[54,73],"show":"none","style":"check","value":0}

{script:clock.0p}
on set_24hour x do mil.value:x end
on get_24hour   do mil.value   end
{end}

{script:clock.1p}
on view do
 t:"%i:%i:%i" parse last "T" split "%e" format sys.now
 t[1]:60%t[1]+60*1%sys.z
 t[0]:24%t[0]+floor sys.z
 if !mil.value t[0]:12%t[0] if t[0]~0 t[0]:12 end end
 t:"%02i:%02i:%02i" format t[0],t[1],t[2]
 me.font:card.font
 me.clear[]
 me.text[t me.size/2 "center"]
end
{end}

{contraption:datePicker}
size:[109,118]
margin:[0,0,0,0]
description:"a date picker showing a monthly calendar."
image:"%%IMG2AG0Adg3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8N/w3/Df8NcA=="
script:"datePicker.0p"
template:"on change x do\\n \\nend"
attributes:{"name":["text"],"label":["Text"],"type":["string"]}
{widgets}
canv:{"type":"canvas","size":[103,95],"pos":[3,3],"locked":1,"script":"datePicker.1p","image":"%%IMG3AGcAXwKEj6nL7Q+jnLTai7PevPsPhuJIluZJBWoUTC1KvoDc0I8Nf/g68+rrWwVlvl7u8jMAZ8omk7mENpe8Y6b1wzqByagW2rUiD9+tmWymInBiVnW4Vnqn72jbw77rGfm9/w8YKDhIWGh4iJiouMi4l8SXkJclGcmX9RT5WFMFQWRJ1oe5YBPqqRCK5tRZian1xalqJ0W0A0oaB7uD+mg3J9uqOnuW+kTDK5nLUkw8FQwsKiWXPCyKWgwb1/yM9mt6a3qaapwdrl1aB75Va1tpvL7M3Kep2Vhvfy8yqb/PT4/PekPZv1EEybFjNhChEYPbrNVjcwuSs4TQnFFSmBAiQIYOG2lkWLEjo48IJ2Ec6DDlmn4sW7p8CTMmTJAFA666aTOng3Er50m0eGniQqA+M/HsafCiUE4RN06UV5JY03Qkn1YzenTpT2jgpsY7xZRVVoCk6CkNGRbr159li9b0qpWj1Bpr5wq9Si5dw5oW7ZYLpmts3YNP0zoNDHLaXadb6eLcKVCnzMmUK1vuR/Mv5MeOdXbeHAvpttCAi8S6pBdeK9QlZXGZ+xqUuK7XysWWXbvvULykgemlHe6332hdeQ3nTVt4b3HxTD/rRbC4873auB4H3k4qa63Yy1CPZn350eQKoYfujly08obbqzlfR/W9+syM+X6+3zg/38v8+/vHfFJ9muE3ykycbSWdEM2ZJ406tHDxIBbHPOigNArOFp0csGl4nm/cSCihhR42QxVg5fXmCXrffIiaEP6smFdd8C0oXhjM0dFFjoZRQ2F6MaI4Gjd+gUgkkVEtJ+R1QyYZEo8s9tDidHiN5+OSB8XHIhy7QQllkV26EpRxAdJH5pi2uBQZaF/+x2abMpW5GJwV2affgAg2mA2EFr7ClBdDXDiPaYFSEeZ0ZdBSnXfguRakK0w6muiUTIb3SjtiThoeNYtal+KSWc3B26QQMppnXoaeeQ10VO4ZZKQd6vbdoRniImpcpBIX4y/P5WrriOCBYRaOWnrJJbBvZKmnsbclW6xgdD5rJ7QCTpuUm9Ze2xJF2m7LbbfefgtuuOKOS2655p6LrgQFAA==","scale":1}
val:{"type":"field","size":[103,13],"pos":[3,101],"script":"datePicker.2p","style":"plain","value":"2023-09-21"}
next:{"type":"button","size":[19,13],"pos":[84,6],"script":"datePicker.3p","text":">","style":"rect"}
prev:{"type":"button","size":[19,13],"pos":[6,6],"script":"datePicker.4p","text":"<","style":"rect"}

{script:datePicker.0p}
dateform: "%[year]04i-%[month]02i-%[day]02i"

on do_change do
 card.event["change" get_value[]]
end

on get_text    do val.text end
on set_text  x do val.text:x view[] end
on get_value   do dateform parse val.text end
on set_value x do val.text:dateform format x view[] end

cellsize:15,11
day_names:"Su","Mo","Tu","We","Th","Fr","Sa"
month_names:"January","February","March","April","May","June","July","August","September","October","November","December"

# in each of these routines,
# - m is a month index [0-11]
# - y is a year (e.g. 2023)

on is_leap_year y do (!4%y)&(!400%y)|(100%y) end
on days_in_month y m do
 r:(31,28,31,30,31,30,31,31,30,31,30,31)[m]
 r+is_leap_year[y]&m=1
end
on first_day_of_month y m do
 mont:0,3,3,6,1,4,6,2,5,0,3,5
 if is_leap_year[y] mont[0]:6 mont[1]:6 end
 r1:(4,2,0,6,4)[floor(y-1700)/100]
 r2:floor 100%y
 r3:floor r2/4
 r4:mont[m]
 7%r1+r2+r3+r4+1
end

on days p do
 f:first_day_of_month[p.year p.month-1]
 c:days_in_month[p.year p.month-1]
 c take f drop flip (2,32)+(cellsize-1)*flip 7 cross 6
end

on view do
 p:get_value[]
 canv.font:"Mono"
 canv.clear[]
 canv.text[month_names[p.month-1] (0,5)+canv.size*.5,0 "top_center"]
 each day in range 7
  canv.text[day_names[day] (9+day*cellsize[0]-1),22 "top_center"]
 end
 each cell index in days[p]
  canv.box[cell cellsize]
  canv.text[("%2i" format 1+index) 1+cell+cellsize/2 "center"]
  if index=p.day-1 canv.invert[cell+1 cellsize-2] end
 end
end
{end}

{script:datePicker.1p}
on inside p r do
 min(p>r)&(p<r+cellsize)
end

on click pos do
 v:get_value[]
 each day index in days[v]
  if inside[pos day]
   v.day:index+1
   set_value[v]
   do_change[]
  end
 end
end

{end}

{script:datePicker.2p}
on change val do
 set_text[val]
 do_change[]
end
{end}

{script:datePicker.3p}
on click do
 v:get_value[]
 if v.month=12
  v.year:v.year+1
  v.month:1
 else
  v.month:v.month+1
 end
 set_value[v]
 do_change[]
end
{end}

{script:datePicker.4p}
on click do
 v:get_value[]
 if v.month=1
  v.year:v.year-1
  v.month:12
 else
  v.month:v.month-1
 end
 set_value[v]
 do_change[]
end
{end}

{contraption:fancyBorder}
size:[22,24]
resizable:1
margin:[10,11,10,11]
description:"a decorative border"
image:"%%IMG3ABYAGAZAQGA4BBiPRyJRCGo2l0imEzSkVgPUKJNopXqxAS34C74qz8ru0zttT9FWtDycHrftxSQZroyO+XFhSH+DX1pGhHpgh1tZio5iho+CSVxldZCIa3abmUJzfEtYbqScZqCWZl+BmH+Xno2pd2JVb599fnKIuIdnRkE="

`,po=A=>{if(A.length){const t=A[A.length-1],e=t.x??90,n=t.y??5;return{x:e>25?e-25:e+25,y:n>25?n-5:n+5}}else return{x:90,y:5}},am=1337,cm={FINDER:"finder",FILE:"file",PHOTO_BOOTH:"photobooth",ABOUT_THIS_MOCKINTOSH:"about",VIDEO:"video",SAFARI:"safari",CONTROL_PANEL:"control_panel",PICTURE:"picture",DECKER:"decker"};async function fo(A){try{const t=await fetch(`/content/${A}.txt`);return t.ok?await t.text():`Could not load ${A}`}catch{return`Could not load ${A}`}}function dm(A,t){const e=A.toLowerCase();return e.endsWith(".deck")||e.endsWith(".html")&&t.includes('language="decker"')?!0:t.includes("{deck}")&&t.includes("{card:")}async function Ss(A){const[t,e]=await Promise.all([fo("README.md"),fo("CONTRIBUTING.md")]),n=A.mkdir(VA,"Mockintosh HD");n.icon="icon/hd";const i=A.mkdir(n.id,"Development");await A.writeFile(i.id,"README.md",t,"text"),await A.writeFile(i.id,"CONTRIBUTING.md",e,"text");const r=A.mkdir(i.id,"Decker");await A.writeFile(r.id,"Dialog.deck",om,"text"),await A.writeFile(r.id,"Color.deck",sm,"text"),A.mkdir(n.id,"Applications"),A.mkdir(n.id,"Trash");const o=A.mkdir(n.id,"Desktop Folder");for(const s of Ui)await A.writeFile(o.id,s.name,JSON.stringify({appId:s.appId}),"app-shortcut",{icon:s.icon});await A.flush()}async function um(A){if(A.readDir(VA).length>0){pm(A),await gm(A);return}await Ss(A)}function pm(A){const t=A.findByName(VA,"Mockintosh HD");t&&(A.mkdir(t.id,"Desktop Folder"),A.mkdir(t.id,"Trash"))}const Ui=[{name:"Photo Booth",appId:"photobooth",icon:"icon/photobooth-smr-32"},{name:"1984.mp4",appId:"video",icon:"icon/MacFlim"},{name:"Safari",appId:"safari",icon:"icon/safari"},{name:"Decker",appId:"decker",icon:"icon/computer"},{name:"App Store",appId:"appstore",icon:"icon/appstore-smr-32x32"},{name:"ChatGippity",appId:"chatgippity",icon:"icon/computer"},{name:"Spotify Player",appId:"spotify",icon:"icon/spotify"}],fm=new Map(Ui.map(A=>[A.appId,A]));async function gm(A){const t=A.findByName(VA,"Mockintosh HD");if(!t)return;const e=A.findByName(t.id,"Desktop Folder");if(!e)return;const n=A.readDir(e.id);for(const i of n){if(i.kind!=="file")continue;const r=i;if(r.fileType!=="app-shortcut")continue;let o;try{const l=await A.readFile(r.id);l&&(o=JSON.parse(l).appId)}catch{}const s=o?fm.get(o):void 0;(!s||s.name!==r.name)&&await A.remove(r.id)}for(const i of Ui)A.findByName(e.id,i.name)||await A.writeFile(e.id,i.name,JSON.stringify({appId:i.appId}),"app-shortcut",{icon:i.icon})}async function mm(A,t){const e=A.findByName(VA,"Mockintosh HD");if(!e)return;let n=A.findByName(e.id,"System");n||(n=A.mkdir(e.id,"System"));let i=A.findByName(n.id,"InstalledApps");if(!i){i=A.mkdir(n.id,"InstalledApps");return}const r=A.readDir(i.id),o=[];for(const s of r){if(s.kind!=="file")continue;const a=s;if(a.fileType!=="app")continue;const l=await A.readFile(a.id);if(l)try{const d=JSON.parse(l);d.id&&d.entry&&o.push(d)}catch{}}o.length>0&&await t.loadAll(o)}async function qm(){const A=document.createElement("canvas");A.width=tA.width,A.height=tA.height,document.getElementById("root").appendChild(A);const t=document.createElement("video");t.playsInline=!0,t.muted=!0,document.body.appendChild(t);const e=A.getContext("2d",{alpha:!1}),n=new qi(tA.width,tA.height),i={...ni};tr({width:tA.width,height:tA.height,pixels:n.pixels});const r=Ol();Dl(r),tr({width:tA.width,height:tA.height,pixels:n.pixels});const o=new Ua,s=new va,a=new td,l=new ae({screenWidth:tA.width,screenHeight:tA.height,menubarHeight:sA,onActivateChange:(W,G)=>{W&&H(W,{type:"deactivate"}),G&&H(G,{type:"activate"}),V(),E()}});[Md,Qd,Ud,jd,nu,su,kf,rm,If,Mf,Zf,hg,Bg,Og].forEach(W=>s.register(W)),s.registerMultiWindow(Hd);const d=new kd(o,s);zd(o);let c=pd([]),p=!0,u=0,g=0,f=1,m=null,h,D,M;async function k(W){i.colorMode!==W&&(i.colorMode=W,ji(W),E(),await vd(i))}function C(){const W=window.innerWidth,G=window.innerHeight;f=Math.max(1,Math.min(Math.floor(W/tA.width),Math.floor(G/tA.height))),A.style.width=`${tA.width*f}px`,A.style.height=`${tA.height*f}px`}C(),window.addEventListener("resize",C);const w=rd({openWindow:(W,G)=>y(W,void 0,G),closeWindow:W=>{l.closeWindow(W),s.isMultiWindowApp("finder")&&s.destroyWindowForApp("finder",W),s.destroyInstance(W),E()},showDialog:W=>new Promise(G=>{const K="__dialog__",P=Pg(W.message,W.showInput),T={message:W.message,buttons:W.buttons??["OK"],showInput:W.showInput,inputDefault:W.inputDefault,_resolve:rA=>{l.closeWindow(K),s.destroyInstance(K),V(),E(),G(rA)}},j=s.createInstance("__dialog__",K,{...T,_sprites:o,_os:w,_systemPreferences:i,_setColorMode:k});j&&j.builder.setRenderFunction(E),l.openWindow({id:K,title:"",x:Math.floor((tA.width-P.width)/2),y:Math.floor((tA.height-P.height)/2),width:P.width,height:P.height,contentHeight:P.height,contentWidth:P.width,appId:"__dialog__",props:T,scrollable:!1,resizable:!1,minWidth:P.width,minHeight:P.height,windowKind:"alert",modal:!0,chromeless:!0}),V(),E()}),videoElement:t});async function v(W,G,K){const P=W;if(l.windows.find(Ht=>Ht.id===P)){l.bringToFront(P),E();return}const j=po(l.windows),rA={directoryId:G,_finderServices:M},vA=s.createWindowForApp("finder",P,rA);vA&&vA.winBuilder.setRenderFunction(E);const At=340,lt=180,Vt=3,Ae=sA+3,te=tA.width-3,kt=tA.height-3;let It=Math.max(Vt,Math.min(j.x??20,te-At)),ee=Math.max(Ae,Math.min((j.y??30)+sA,kt-DA-lt));if(K){const Ht={x:It,y:ee,width:At,height:lt+DA};await R(K,Ht)}l.openWindow({id:P,title:W,x:It,y:ee,width:At,height:lt,contentHeight:lt,contentWidth:At,appId:"finder",props:rA,scrollable:!0,resizable:!0,minWidth:160,minHeight:80,windowKind:"document",openedFromRect:K}),V(),E()}async function y(W,G,K,P,T){var at,tt,St;const j=s.get(W);if(!j)return;const rA=G??j.title;if(l.windows.find(EA=>EA.id===rA)){l.bringToFront(rA),E();return}const At=P??po(l.windows),lt=s.createInstance(W,rA,{...K,_sprites:o,_os:w,_systemPreferences:i,_setColorMode:k,_fs:h,_appLoader:d,_openFSNode:EA=>I(EA),_openWindow:(EA,HA,Wt,rt)=>{const Ws=cm[EA]??EA;y(Ws,HA,Wt,rt)},_bitCanvas:n,_windowManager:l});lt&&lt.builder.setRenderFunction(E);const Vt=j.windowKind??"document",Ae=tA.width-6,te=tA.height-sA-6,kt=Vt==="presentation"?tA.width:Math.min(j.defaultSize.width,Ae),It=Vt==="presentation"?tA.height:Math.min(j.defaultSize.height,te),ee=j.scrollable?bA:0,Ht=kt-1-ee,On=((at=j.minSize)==null?void 0:at.width)!=null&&Ht<j.minSize.width?Math.max(Ht,j.minSize.width):kt,Z=3,F=sA+3,AA=tA.width-3,iA=tA.height-3,aA=Vt==="presentation"?0:Math.max(Z,Math.min(At.x??20,AA-kt)),LA=Vt==="presentation"?0:Math.max(F,Math.min((At.y??30)+sA,iA-DA-It));if(T){const EA={x:aA,y:LA,width:kt,height:It+DA};await R(T,EA)}l.openWindow({id:rA,title:G??j.title,x:aA,y:LA,width:kt,height:It,contentHeight:It,contentWidth:On,appId:W,props:K??{},scrollable:j.scrollable??!1,resizable:j.resizable??!1,minWidth:((tt=j.minSize)==null?void 0:tt.width)??100,minHeight:((St=j.minSize)==null?void 0:St.height)??60,windowKind:Vt,openedFromRect:T}),V(),E()}async function I(W,G){const K=h.getNode(W);if(!K)return;if(K.kind==="directory"){v(K.name,K.id,G);return}const P=K;if(P.fileType==="app-shortcut"){const T=await h.readFile(P.id);if(T)try{const{appId:j}=JSON.parse(T);j==="decker"?y("decker","The Decker Tour",{initialSource:lm},void 0,G):y(j,void 0,void 0,void 0,G)}catch{}return}if(P.fileType==="app"){const T=await h.readFile(P.id);if(T)try{const j=JSON.parse(T);j.id&&j.entry&&(await d.load(j),y(j.id,void 0,void 0,void 0,G))}catch{}return}if(P.fileType==="text"){const T=await h.readFile(P.id);if(T&&dm(P.name,T)){y("decker",P.name,{fileId:P.id,title:P.name},void 0,G);return}y("file",P.name,{fileId:P.id,_fs:h},void 0,G);return}if(P.fileType==="image"){await h.loadSprite(P.id)&&y("picture",P.name,{src:`fs:${P.id}`,title:P.name},void 0,G);return}}function V(){const W=O(),G=l.getActiveWindow();let K;if(G)if(G.appId==="finder"){const P=s.getMultiWindowInstance("finder",G.id);P!=null&&P.app.getMenubar&&(P.appBuilder.resetForRender(),P.winBuilder.resetForRender(),K=P.app.getMenubar(P.appBuilder,P.winBuilder,G.id,P.props))}else{const P=s.getInstance(G.id);P!=null&&P.app.getMenubar&&(P.builder.resetForRender(),K=P.app.getMenubar(P.builder,P.props))}if(!K){const P=s.getMultiWindowInstance("finder",gA);P!=null&&P.app.getMenubar&&(P.appBuilder.resetForRender(),P.winBuilder.resetForRender(),K=P.app.getMenubar(P.appBuilder,P.winBuilder,gA,P.props))}K||(K=x()),c.menus=[...W,...K]}function x(){return[{label:"File",items:[{label:"Open",shortcut:"⌘O",disabled:!0},{label:"Close",disabled:!0}]},{label:"Edit",items:[{label:"Undo",shortcut:"⌘Z",disabled:!0},{label:"Cut",shortcut:"⌘X",disabled:!0},{label:"Copy",shortcut:"⌘C",disabled:!0},{label:"Paste",shortcut:"⌘V",disabled:!0}]},{label:"View",items:[{label:"By Icon",disabled:!0},{label:"By Name",disabled:!0},{label:"By Date",disabled:!0}]},{label:"Special",items:[{label:"Clean Up Desktop",disabled:!0},{label:"Empty Trash",disabled:!0},{type:"separator"},{label:"Restart",disabled:!0},{label:"Shut Down",disabled:!0}]}]}function O(){return[{label:"",items:[{label:"About this Mockintosh...",onClick:()=>y("about")},{type:"separator"},{label:"Control Panel",onClick:()=>y("control_panel")},{label:"Testing",onClick:()=>y("testing")}]}]}function H(W,G){const K=l.windows.find(T=>T.id===W);if(K&&s.isMultiWindowApp(K.appId)){const T=s.getMultiWindowInstance(K.appId,W);if(T!=null&&T.app.onWindowEvent){T.appBuilder.resetForRender(),T.winBuilder.resetForRender();const j=l.getContentRect(K),rA={width:K.width,height:K.height,contentOriginX:j.x,contentOriginY:j.y,contentTopInset:K.contentTopInset,scrollY:K.scrollY,scrollX:K.scrollX};T.app.onWindowEvent(T.appBuilder,T.winBuilder,G,W,T.props,rA)}return}const P=s.getInstance(W);if(P!=null&&P.app.onEvent){const T=l.windows.find(rA=>rA.id===W),j=T?{width:T.width,height:T.height}:P.app.defaultSize;P.builder.resetForRender(),P.app.onEvent(P.builder,G,P.props,j)}}const B={onClose:W=>{const G=l.windows.find(T=>T.id===W),K=G?{x:G.x,y:G.y,width:G.width,height:G.height+DA}:null,P=G!=null&&G.openedFromRect?{...G.openedFromRect}:null;l.closeWindow(W),s.isMultiWindowApp("finder")&&s.destroyWindowForApp("finder",W),s.destroyInstance(W),V(),E(),K&&P&&R(K,P)},onBringToFront:W=>{l.bringToFront(W),V(),E()},onContentEvent:(W,G)=>{H(W,G),E()},onZoom:W=>{const G=l.windows.find(K=>K.id===W);G&&(l.zoomWindow(G),V(),E())},scheduleRender:()=>E()},S=new Ai(A);S.setZoom(f),S.onEvent(W=>{if(S.setZoom(f),W.type==="mouseMove"&&(u=W.x??0,g=W.y??0),p){(W.type==="mouseDown"||W.type==="keyDown")&&(p=!1,E());return}if(l.isDraggingOrResizing()){if(W.type==="mouseMove"){l.handleMouseMove(W.x,W.y),E();return}if(W.type==="mouseUp"){l.handleMouseUp(),E();return}}if(D&&Wd()){if(W.type==="mouseMove"){D.resetForRender(),Si(D,W.x,W.y,M),E();return}if(W.type==="mouseUp"){D.resetForRender(),Wi(D,W.x,W.y,M),a.clearPressed(),E();return}}if(W.type==="mouseMove"){if(m!=null&&m.onTrackMove){const K=l.windows.find(P=>P.id===m.windowId);if(K){const P=Ue(W.x-K.x,W.y-K.y);if(m.onTrackMove(P),m.theControl.ref.contrlDefProc===4){const T=mr(m.theControl),j=m.theControl.ref.contrlData;j!=null&&j.vertical?K.scrollY=T:K.scrollX=T}E();return}}a.handleMouseMove(W.x,W.y);const G=l.getActiveWindow();if(G&&G.id!==gA){const K=l.getContentRect(G),P=l.toContentLocal(G,W.x,W.y);if(W.x>=K.x&&W.x<K.x+K.w&&W.y>=K.y&&W.y<K.y+K.h){const j=G.contentTopInset??0,rA=j>0?W.y<K.y+j?"fixed":"scrollable":void 0;H(G.id,{type:"mouseMove",x:P.x,y:P.y,...rA!==void 0&&{contentRegion:rA}})}else G.appId==="finder"&&H(G.id,{type:"mouseMove",x:P.x,y:P.y})}E();return}if(W.type==="mouseDown"){if(c.openMenuIndex!==null){const K=a.hitTest(W.x,W.y);if(!(K!==null&&(K.id.startsWith("menubar-")||K.id==="menubar-bg"))){c.openMenuIndex=null,c.highlightedItem=null,E();return}}const G=l.findWindowWithPartCode(W.x,W.y);if(G.partCode===Qo&&G.theWindow&&G.theWindow.controlList.length>0){const K=l.toContentLocal(G.theWindow,W.x,W.y),P=Ue(K.x,K.y),T=Sa(P,G.theWindow);if(T.theControl!==null){const j=l.ensureWindowPort(G.theWindow,r),rA=gr(T.theControl,P,j);m={onTrackEnd:typeof rA=="function"?rA:rA.onTrackEnd,windowId:G.theWindow.id,theControl:T.theControl,isScrollBar:!1},E();return}}if((G.partCode===Yo||G.partCode===No)&&G.theWindow){const K=G.theWindow,P=Ue(W.x-K.x,W.y-K.y),T=La(K,P);if(T.theControl){const j=l.ensureWindowPort(K,r,{useFrameRect:!0}),rA=gr(T.theControl,P,j,T.partCode),vA=typeof rA=="function"?rA:rA.onTrackEnd,At=typeof rA=="function"?void 0:rA.onTrackMove;m={onTrackEnd:vA,onTrackMove:At,windowId:K.id,theControl:T.theControl,isScrollBar:!0},E();return}}a.handleMouseDown(W.x,W.y),E();return}if(W.type==="mouseUp"){if(m!==null){const G=l.windows.find(P=>P.id===m.windowId);let K=0;if(G!==void 0){const P=m.isScrollBar?{x:W.x-G.x,y:W.y-G.y}:l.toContentLocal(G,W.x,W.y);if(K=m.onTrackEnd(Ue(P.x,P.y)),m.theControl.ref.contrlDefProc===4){const T=mr(m.theControl),j=m.theControl.ref.contrlData;j!=null&&j.vertical?G.scrollY=T:G.scrollX=T}K!==0&&m.theControl.ref.contrlAction&&m.theControl.ref.contrlAction(m.theControl,K)}m=null,E();return}a.handleMouseUp(W.x,W.y),E();return}if(W.type==="doubleClick"){a.handleDoubleClick(W.x,W.y),E();return}if(W.type==="scroll"){const G=l.windows.slice().reverse().find(K=>{if(K.id===gA)return!1;const P=DA+(K.infoBar?20:0),T=K.width+1,j=P+K.height+1;return W.x>=K.x&&W.x<K.x+T&&W.y>=K.y&&W.y<K.y+j});if(G){if(!a.handleScroll(W.x,W.y,W.deltaY??0))if(G.scrollable){l.handleScroll(G,W.deltaY??0);const P=W.deltaX??0;P!==0&&l.handleHScroll(G,P)}else H(G.id,W);E()}return}if(W.type==="keyDown"||W.type==="keyUp"||W.type==="paste"){const G=l.getActiveWindow();G&&G.id!==gA&&H(G.id,W),E()}});let Q=!1,N=!1;function E(){Q||N||(Q=!0,requestAnimationFrame(nA))}function R(W,G){return N=!0,sd(r,e,W,G,4,30,void 0,()=>{N=!1,E()})}function q(){const W=o.get("corner-lt"),G=o.get("corner-rt"),K=o.get("corner-lb"),P=o.get("corner-rb");W&&PA(r,W,0,0),G&&PA(r,G,tA.width-G.width,0),K&&PA(r,K,0,tA.height-K.height),P&&PA(r,P,tA.width-P.width,tA.height-P.height)}function nA(){var G;if(Q=!1,N)return;{const{baseAddr:K,rowBytes:P}=r.portBits;K.fill(Y)}if(a.clear(),p){Ct(r,0,0,tA.width,tA.height,"checkers");const K=o.get("icon/happy");K&&PA(r,K,Math.floor((tA.width-K.width)/2),Math.floor((tA.height-K.height)/2));const P=o.get("cursor/default-1x");P&&PA(r,P,u,g),q(),n.flush(e);return}for(const K of l.windows){if(K.appId==="finder"){const T=s.getMultiWindowInstance("finder",K.id);T&&(T.app.getContentHeight&&(T.appBuilder.resetForRender(),T.winBuilder.resetForRender(),K.contentHeight=T.app.getContentHeight(T.appBuilder,T.winBuilder,K.id,T.props,{width:K.width,height:K.height})),T.app.getInfoBar&&(T.appBuilder.resetForRender(),T.winBuilder.resetForRender(),K.infoBar=T.app.getInfoBar(T.appBuilder,T.winBuilder,K.id,T.props)??void 0),T.app.getContentTopInset&&(T.appBuilder.resetForRender(),T.winBuilder.resetForRender(),K.contentTopInset=T.app.getContentTopInset(T.appBuilder,T.winBuilder,K.id,T.props,{width:K.width,height:K.height})));continue}const P=s.getInstance(K.id);if(P!=null&&P.app.getContentHeight&&(P.builder.resetForRender(),K.contentHeight=P.app.getContentHeight(P.builder,P.props,{width:K.width,height:K.height})),P!=null&&P.app.getContentWidth)P.builder.resetForRender(),K.contentWidth=P.app.getContentWidth(P.builder,P.props,{width:K.width,height:K.height});else if(K.scrollable&&((G=P==null?void 0:P.app.minSize)==null?void 0:G.width)!=null){const T=bA,j=K.width-1-T;K.contentWidth=j>=P.app.minSize.width?j:Math.max(j,P.app.minSize.width)}P!=null&&P.app.getInfoBar&&(P.builder.resetForRender(),K.infoBar=P.app.getInfoBar(P.builder,P.props)??void 0),P!=null&&P.app.getContentTopInset&&(P.builder.resetForRender(),K.contentTopInset=P.app.getContentTopInset(P.builder,P.props,{width:K.width,height:K.height}))}for(const K of l.windows){if(K.id===gA){const T=s.getMultiWindowInstance("finder",K.id);if(T){const j=new Ee(r,0,sA,tA.width,tA.height-sA,0,0,a,void 0,void 0,void 0,0,0,0,0,0);T.appBuilder.resetForRender(),T.winBuilder.resetForRender(),T.app.renderWindow(T.appBuilder,T.winBuilder,j,gA,T.props),T.winBuilder.flushEffects(),a.add({id:"desktop-bg",x:0,y:sA,w:tA.width,h:tA.height-sA,onMouseDown:(rA,vA)=>{H(gA,{type:"mouseDown",x:rA,y:vA+sA})},onMouseUp:(rA,vA)=>{H(gA,{type:"mouseUp",x:rA,y:vA+sA})},onDoubleClick:(rA,vA)=>{H(gA,{type:"doubleClick",x:rA,y:vA+sA})},onDrag:(rA,vA)=>{H(gA,{type:"mouseMove",x:rA,y:vA})}}),j.release()}continue}l.drawWindowChrome(r,K,o,a,B);const P=l.createWindowContext(K,a,r);if(K.appId==="finder"){const T=s.getMultiWindowInstance("finder",K.id);T&&(T.appBuilder.resetForRender(),T.winBuilder.resetForRender(),T.app.renderWindow(T.appBuilder,T.winBuilder,P,K.id,T.props),T.winBuilder.flushEffects())}else{const T=s.getInstance(K.id);T&&(T.builder.resetForRender(),T.app.render(T.builder,P,T.props),T.builder.flushEffects())}P.release()}D&&(D.resetForRender(),Kd(D,r,M)),l.drawDragOutline(r),qd(r,c,o.get("eaten_apple"),tA.width,a,E);const W=o.get("cursor/default-1x");W&&PA(r,W,u,g),q(),n.flush(e)}Ad(o),o.registerAll(Cg),E();const oA=Date.now();await na(),ia(hl);const b=new Vd;h=new wd(b,o),await h.init(),await um(h),Object.assign(i,await Id()),ji(i.colorMode),w.fs=h,D=s.startApp("finder"),D.setRenderFunction(E),M={sprites:o,fs:h,os:w,openFSNode:(W,G)=>I(W,G),scheduleRender:E,screenWidth:tA.width,screenHeight:tA.height,menubarHeight:sA,getOpenFolderWindows:()=>{const W=[];for(const G of l.windows){if(G.id===gA||G.appId!=="finder")continue;const K=s.getMultiWindowInstance("finder",G.id);if(!K)continue;const P=K.props.directoryId;if(!P)continue;const T=l.getContentRect(G);W.push({windowId:G.id,directoryId:P,contentX:T.x,contentY:T.y,contentW:T.w,contentH:T.h,scrollY:G.scrollY,scrollX:G.scrollX,contentTopInset:G.contentTopInset})}return W},formatDrive:async()=>{if(await w.showDialog({message:"Erase Mockintosh HD and restore to factory state? This cannot be undone.",buttons:["Erase","Cancel"]})!=="Erase")return;const G=l.windows.filter(P=>P.appId==="finder"&&P.id!==gA).map(P=>P.id);for(const P of G)l.closeWindow(P),s.isMultiWindowApp("finder")&&s.destroyWindowForApp("finder",P),s.destroyInstance(P);const K=h.readDir(VA);for(const P of K)await h.remove(P.id);await Ss(h),E()}};const hA={_finderServices:M},IA=s.createWindowForApp("finder",gA,hA);IA&&IA.winBuilder.setRenderFunction(E),l.openWindow({id:gA,title:"",x:0,y:sA,width:tA.width,height:tA.height-sA,contentHeight:tA.height-sA,contentWidth:tA.width,appId:"finder",props:hA,scrollable:!1,resizable:!1,minWidth:tA.width,minHeight:tA.height-sA,windowKind:"desktop",chromeless:!0}),h.onChange(()=>E()),V(),await mm(h,d);const dA=Date.now()-oA,Rt=Math.max(0,am-dA);await new Promise(W=>setTimeout(W,Rt)),p=!1,setInterval(E,ba),E()}qm();
