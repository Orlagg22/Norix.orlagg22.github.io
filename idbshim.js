// IndexedDB mínimo para jsdom. Cachea los pesos de la red de NORYX en disco (JSON) y, si existe, usa
// el fixture compacto net-cache.bin.gz (solo filas del embedding que el entrenamiento modifica) cuando su hash coincide.
const fs=require('fs'),zlib=require('zlib');
function readCompact(file,hash,w){
  if(!file||!fs.existsSync(file))return null;
  const buf=zlib.gunzipSync(fs.readFileSync(file)),hl=buf.readUInt32LE(0),hd=JSON.parse(buf.subarray(4,4+hl).toString());
  if(hd.hash!==hash)return null;
  let off=4+hl;const f32=n=>{const ab=new w.ArrayBuffer(n*4);new Uint8Array(ab).set(buf.subarray(off,off+n*4));off+=n*4;return new w.Float32Array(ab)};
  const E1=new w.Float32Array(hd.NB*hd.D);let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647-.5;
  for(let i=0;i<E1.length;i++)E1[i]=rnd()*2;                 // misma inicialización pseudoaleatoria que la página
  for(const r of hd.rows)E1.set(f32(hd.D),r*hd.D);
  return{E1,Wa:f32(hd.D*hd.H),ba:f32(hd.H),Wb:f32(hd.H*hd.C),bb:f32(hd.C)};
}
function install(w,cacheFile,opts={}){
  const store={};
  const ser=o=>JSON.stringify(o,(k,v)=>ArrayBuffer.isView(v)?{__f32:Buffer.from(v.buffer,v.byteOffset,v.byteLength).toString('base64')}:v);
  const de=s=>JSON.parse(s,(k,v)=>{if(v&&v.__f32){const b=Buffer.from(v.__f32,'base64');const ab=new w.ArrayBuffer(b.length);new Uint8Array(ab).set(b);return new w.Float32Array(ab)}return v});
  if(fs.existsSync(cacheFile)){try{Object.assign(store,de(fs.readFileSync(cacheFile,'utf8')))}catch(e){}}
  w.indexedDB={open(){const rq={};setTimeout(()=>{
    rq.result={createObjectStore(){},transaction(){return{objectStore(){return{
      get(k){const x={};setTimeout(()=>{
        if(k==='w'&&!store.w&&opts.compact){try{const o=readCompact(opts.compact,opts.hash,w);if(o){o.sig=w.eval('SIG');store.w=o}}catch(e){}}
        x.result=store[k];x.onsuccess&&x.onsuccess()},0);return x},
      put(v,k){const x={};store[k]=v;try{fs.mkdirSync(require('path').dirname(cacheFile),{recursive:true});fs.writeFileSync(cacheFile,ser(store))}catch(e){}setTimeout(()=>{x.result=k;x.onsuccess&&x.onsuccess()},0);return x}}}}}};
    rq.onupgradeneeded&&rq.onupgradeneeded();rq.onsuccess&&rq.onsuccess()},0);return rq}};
}
module.exports={install};
