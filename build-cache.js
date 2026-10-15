// Genera tests/net-cache.bin.gz (fixture compacto de la red). Uso: node build-cache.js ruta/al/noryx.html
// Si no hay caché local, entrena la red una vez (~5 min).
const fs=require('fs'),zlib=require('zlib'),os=require('os'),path=require('path');
const {load,trainHash}=require('./harness');
(async()=>{
  const file=process.argv[2];if(!file){console.error('uso: node build-cache.js noryx.html');process.exit(1)}
  const tmp=path.join(os.tmpdir(),'noryx-build-cache-'+Date.now()+'.json');process.env.NX_CACHE=tmp;
  const H=await load(file);await H.ready();await new Promise(r=>setTimeout(r,5000));
  const raw=JSON.parse(fs.readFileSync(tmp,'utf8')).w;const f=k=>{const b=Buffer.from(raw[k].__f32,'base64');return new Float32Array(b.buffer,b.byteOffset,b.length/4)};
  const E1=f('E1'),Wa=f('Wa'),ba=f('ba'),Wb=f('Wb'),bb=f('bb');
  const NB=65536,D=256,Hh=448,C=bb.length;let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647-.5;
  const rows=[],parts=[];for(let r=0;r<NB;r++){let diff=false;const row=new Float32Array(D);for(let d=0;d<D;d++){const iv=Math.fround(rnd()*2);row[d]=E1[r*D+d];if(row[d]!==iv)diff=true}if(diff){rows.push(r);parts.push(Buffer.from(row.buffer))}}
  const hd=Buffer.from(JSON.stringify({hash:trainHash(fs.readFileSync(file,'utf8')),NB,D,H:Hh,C,rows}));const len=Buffer.alloc(4);len.writeUInt32LE(hd.length);
  const out=zlib.gzipSync(Buffer.concat([len,hd,...parts,...[Wa,ba,Wb,bb].map(a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength))]),{level:9});
  const dest=path.join(__dirname,'net-cache.bin.gz');fs.writeFileSync(dest,out);fs.unlinkSync(tmp);
  console.log('fixture escrito:',dest,(out.length/1e6).toFixed(1)+' MB;',rows.length,'filas');process.exit(0)})();
