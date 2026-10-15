// Arnés headless: carga el HTML real de NORYX en jsdom y expone brain()/send().
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto');
/* Hash del DATOS + código de entrenamiento (no cambia si solo tocas la lógica de respuestas). */
function trainHash(html){const a=html.indexOf('const DATA={'),b=html.indexOf('const PRE='),c=html.indexOf('const ints=Object.keys(DATA)'),d=html.indexOf('const ready=(async()');
  return crypto.createHash('sha1').update(html.slice(a,b)+'\n'+html.slice(c,d)).digest('hex')}
async function load(file,opts={}){
  const html=fs.readFileSync(file,'utf8'),hash=trainHash(html);
  const cacheFile=process.env.NX_CACHE||path.join(os.homedir(),'.cache','noryx-tests','net-'+hash.slice(0,12)+'.json');
  const vc=new VirtualConsole();const errs=[];vc.on('jsdomError',e=>errs.push(String(e.message||e).slice(0,200)));
  const net=[];let impl=opts.fetch||null;
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://noryx.test/',virtualConsole:vc,
    beforeParse(w){
      w.matchMedia=w.matchMedia||(()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){}}));
      w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({}, {get:(t,k)=>k==='canvas'?{}:(k==='measureText'?()=>({width:0}):()=>({data:new Uint8ClampedArray(4)})),set:()=>true});
      w.fetch=(u,o)=>{net.push(String(u));return impl?impl(u,o):Promise.reject(new TypeError('offline'))};
      w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};w.scrollTo=()=>{};
      {const st=w.setTimeout.bind(w);w.setTimeout=(f,ms,...a)=>(ms===undefined||ms<=16)?(setImmediate(()=>{try{typeof f=='function'&&f(...a)}catch(e){}}),0):st(f,ms,...a)}
      w.Element.prototype.scrollIntoView=()=>{};
      require('./idbshim').install(w,cacheFile,{compact:path.join(__dirname,'net-cache.bin.gz'),hash});
    }});
  const w=dom.window;
  /* ready(): espera a la red neuronal e informa del progreso (la primera vez sin caché tarda ~5 min) */
  const ready=async()=>{const el=()=>w.document.querySelector('#cs');let last='';
    const iv=setInterval(()=>{const t=el()&&el().textContent;if(t&&t!==last){last=t;process.stderr.write('  [noryx] '+t+'\n')}},15000);
    try{await w.eval('ready')}finally{clearInterval(iv)}
    await new Promise(r=>setTimeout(r,50))};
  return {dom,w,errs,net,hash,cacheFile,ready,setFetch:f=>{impl=f}};
}
module.exports={load,trainHash};
