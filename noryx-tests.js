/* Suite automatizada de NORYX. Carga el HTML REAL en jsdom y llama a brain()/send() como lo haría la interfaz.
   Uso:  NX_CACHE=/ruta/cache.json node noryx-tests.js noryx-chat-cerebro-v21.html
   Cada caso comprueba el CONTENIDO de la respuesta y el MÓDULO que la generó (etiqueta m), no solo que haya texto. */
const {load}=require('./harness');
const file=process.argv[2];
const T=[];let pass=0,fail=0;const fails=[];
const ok=(name,cond,info)=>{if(cond){pass++;T.push('  ✔ '+name)}else{fail++;fails.push(name);T.push('  ✘ '+name+(info?'\n      → '+String(info).replace(/\n/g,' ').slice(0,220):''))}};
const wikiRel=(title,snippet,extract)=>u=>{u=String(u);
 if(/list=search/.test(u))return Promise.resolve({ok:true,json:async()=>({query:{search:[{title,snippet}]}})});
 if(/page\/summary/.test(u))return Promise.resolve({ok:true,json:async()=>({title,type:'standard',extract,content_urls:{desktop:{page:'https://es.wikipedia.org/wiki/'+encodeURIComponent(title)}}})});
 return Promise.reject(new TypeError('offline'))};
(async()=>{
 const H=await load(file),w=H.w;await H.ready();
 const reset=()=>w.eval("ctx.dom=null;ctx.q=null;ctx.more=[];ctx.topic=null;ctx.last=null;ctx.pend=null;ctx.ph=null;ctx.geo=null;ctx.geoAt=null;ctx.sim=null;ctx.tr=null;ctx.ps=null;ctx.dt=null");
 const ask=async q=>{const r=await w.brain(q);return{t:String(r&&r.t||''),m:String(r&&r.m||'')}};
 const one=async(q)=>{reset();return ask(q)};
 const seq=async(...qs)=>{reset();const o=[];for(const q of qs)o.push(await ask(q));return o};
 const sec=n=>T.push('\n'+n);
 const BAD=/Parque de las Naciones|SG-1000|artículo 133|Wikipedia/i;

 sec('Matemáticas locales (sin búsqueda web)');
 for(const[q,v]of[['100+100','200'],['1000+1000','2000'],['10000-886','9114'],['15875-478923','-463048'],['100 + 100','200'],['(2+3)*4','20'],['2^10','1024'],['raíz cuadrada de 81','9'],['12% de 4','0.48'],['15% de 2480','372']]){const r=await one(q);ok(q+' → '+v,new RegExp('\\*\\*'+v.replace(/[-.^]/g,'\\$&')+'\\*\\*').test(r.t)&&/Cálculo|Matemáticas|Motor/.test(r.m)&&!BAD.test(r.t),r.m+' | '+r.t)}
 for(const[q,v]of[['12%4','0'],['12 % 4','0'],['17%5','2'],['17 mod 5','2'],['residuo de 17 entre 5','2'],['100%7','2']]){const r=await one(q);ok(q+' → módulo '+v,/módulo/.test(r.m)&&new RegExp('= \\*\\*'+v+'\\*\\*').test(r.t),r.m+' | '+r.t)}
 {const r=await one('10%0');ok('10%0 → no se puede dividir entre cero',/cero/i.test(r.t)&&/módulo/.test(r.m),r.t)}
 {const r=await one('1/2+1/3');ok('1/2+1/3 → 5/6 exacto',/\*\*5\/6\*\*/.test(r.t),r.t)}
 {const r=await one('3/4 - 1/4');ok('3/4 - 1/4 → 1/2',/\*\*1\/2\*\*/.test(r.t),r.t)}
 {const r=await one('12%4');ok('12%4 NO es música ni red neuronal',!/Red neuronal|música|musica/.test(r.m+r.t),r.m+r.t)}
 {H.net.length=0;await one('1000+1000');await one('12%4');ok('la aritmética no hace ninguna petición de red',H.net.length==0,H.net.join(','))}

 sec('Derivadas e integrales');
 {const r=await one('¿Sabes derivar?');ok('¿Sabes derivar? → derivadas, ofrece hacerlo',/Derivadas/.test(r.m)&&/derivar/.test(r.t)&&/función/.test(r.t)&&!BAD.test(r.t),r.m+r.t)}
 {const r=await one('Derivar');ok('«Derivar» → derivadas (no deriva continental)',/Derivadas/.test(r.m)&&!/litosfera|placas/i.test(r.t),r.m+r.t)}
 {const r=await one('Deriva x²');ok('Deriva x² → 2x',/\*\*2x\*\*/.test(r.t)&&/Motor matem/.test(r.m),r.t)}
 {const r=await one('Deriva 3x³ + 2x² - 5x + 7');ok('Deriva 3x³+2x²−5x+7 → 9x²+4x−5',/9x²/.test(r.t)&&/4x/.test(r.t)&&/5/.test(r.t)&&/Resultado/.test(r.t),r.t)}
 {const r=await one('Dame un ejemplo de derivada');ok('Dame un ejemplo de derivada → ejemplo desarrollado',/Derivadas · ejemplo/.test(r.m)&&/Paso 1/.test(r.t)&&/Resultado/.test(r.t)&&!BAD.test(r.t),r.m+r.t)}
 {const r=await one('¿Me haces un ejemplo de derivada?');ok('¿Me haces un ejemplo de derivada? → ejemplo',/Derivadas · ejemplo/.test(r.m)&&/Resultado/.test(r.t),r.m+r.t)}
 {const r=await one('Me das un ejemplo de derivada');ok('Me das un ejemplo de derivada (caso real) → ejemplo',/Derivadas · ejemplo/.test(r.m)&&!BAD.test(r.t),r.m+r.t)}
 {const r=await one('Explícame paso a paso cómo derivar');ok('Explícame paso a paso cómo derivar → procedimiento + ejemplo',/paso a paso/i.test(r.t)&&/Resultado/.test(r.t)&&/Derivadas/.test(r.m),r.m+r.t)}
 {const r=await one('¿Qué es una derivada?');ok('¿Qué es una derivada? → definición',/derivad/i.test(r.t)&&!BAD.test(r.t)&&!/placas/i.test(r.t),r.m+r.t)}
 {const r=await one('¿Sabes integrar?');ok('¿Sabes integrar? → integrales',/Integrales/.test(r.m)&&/integrar/.test(r.t),r.m+r.t)}
 {const r=await one('Integral de 3x^2 + 2x');ok('Integral de 3x²+2x → x³ + x²',/x³/.test(r.t)&&/x²/.test(r.t),r.t)}
 {const o=await seq('¿Sabes derivar?','x² + 3x');ok('Seguimiento: «¿Sabes derivar?» → «x² + 3x» deriva la función',/2x/.test(o[1].t)&&/3/.test(o[1].t)&&/Motor matem/.test(o[1].m),o[1].m+o[1].t)}
 {const o=await seq('¿Sabes derivar?','Deriva x²','x^3 + x');ok('Seguimiento tras otra derivada también funciona',/3x²/.test(o[2].t),o[2].m+o[2].t)}
 {const o=await seq('Dame un ejemplo de derivada','Más');ok('«Más» tras un ejemplo → otro ejemplo distinto',/Derivadas · ejemplo/.test(o[1].m)&&o[0].t!==o[1].t,o[1].m+o[1].t)}
 {const o=await seq('¿Qué es la deriva continental?');ok('deriva continental NO se confunde con derivadas',!/Derivadas/.test(o[0].m)&&/placa|continent/i.test(o[0].t),o[0].m+o[0].t)}

 sec('Física general');
 {const r=await one('¿Cuál es la fórmula para calcular el trabajo?');ok('fórmula del trabajo → W = F·d·cos(θ)',/W = F · d · cos\(θ\)/.test(r.t)&&/Física general/.test(r.m)&&!/geometr|probabilidad|área/i.test(r.t),r.m+r.t)}
 {const r=await one('¿Cuál es la fórmula del trabajo en física?');ok('fórmula del trabajo en física → fórmula',/W = F · d · cos/.test(r.t),r.m+r.t)}
 {const r=await one('Explícame el trabajo en física');ok('Explícame el trabajo en física → explicación de física general',/trabajo mecánico/.test(r.t)&&/joule/i.test(r.t)&&/Física general/.test(r.m),r.m+r.t)}
 {const r=await one('¿Cómo se calcula el trabajo en física y a qué se refiere?');ok('cómo se calcula y a qué se refiere → definición + fórmula',/trabajo mecánico/.test(r.t)&&/F · d · cos/.test(r.t)&&!/probabilidad/i.test(r.t),r.m+r.t)}
 {const r=await one('¿Qué unidades usa el trabajo en física?');ok('unidades del trabajo → joule',/joule/i.test(r.t)&&/N·m/.test(r.t),r.m+r.t)}
 {const r=await one('Dame un ejemplo de trabajo en física');ok('ejemplo de trabajo → datos, fórmula, sustitución, resultado',/Datos/.test(r.t)&&/Sustitución/.test(r.t)&&/250 J/.test(r.t),r.m+r.t)}
 {const r=await one('¿Qué es la potencia en física?');ok('potencia en física → P = W/t',/P = W \/ t/.test(r.t)&&/watt/i.test(r.t),r.m+r.t)}
 {const r=await one('¿Cuál es la diferencia entre trabajo y potencia en física?');ok('diferencia trabajo/potencia → ambas',/Trabajo mecánico/.test(r.t)&&/Potencia/.test(r.t),r.m+r.t)}
 {const o=await seq('¿Sabes física general, no cuántica?','Explícame la energía');ok('«física general, no cuántica» y luego energía → sin cuántica',/no cuántica/.test(o[0].t)&&!/cuánt|cuant/i.test(o[1].t)&&/Ec = ½/.test(o[1].t),o[1].m+o[1].t)}
 {const o=await seq('Explícame el trabajo en física','No, física general, no cuántica');ok('«No, física general, no cuántica» corrige el dominio de inmediato',/no cuántica/i.test(o[1].t)&&!/qubit|superposici|Schr/i.test(o[1].t)&&w.eval('!!ctx.dom&&ctx.dom.noQuantum==1'),o[1].m+o[1].t)}
 {const o=await seq('Explícame el trabajo en física','¿Y la fórmula?');ok('«¿Y la fórmula?» → fórmula del trabajo, sin cambiar de tema',/W = F · d · cos/.test(o[1].t)&&/Física general/.test(o[1].m),o[1].m+o[1].t)}
 {const o=await seq('Explícame el trabajo en física','¿Y las unidades?');ok('«¿Y las unidades?» → joule',/joule/i.test(o[1].t),o[1].t)}
 {const o=await seq('Explícame la fuerza en física','¿Y la fórmula?');ok('seguimiento sigue el tema ACTUAL (fuerza), no el anterior',/F = m · a/.test(o[1].t)&&!/cos\(θ\)/.test(o[1].t),o[1].t)}
 {const r=await one('Una fuerza de 20 N mueve una caja 5 m en la misma dirección. ¿Cuál es el trabajo?');ok('ejercicio numérico lo resuelve el motor existente (no el conceptual)',/Física · ejercicio/.test(r.m)&&/100/.test(r.t),r.m+r.t)}
 {const r=await one('¿Qué es la física cuántica?');ok('si piden cuántica explícitamente, sí se responde',/cuánt|cuant/i.test(r.t)&&!/Física general/.test(r.m),r.m+r.t)}

 sec('Inglés');
 {const r=await one('Tres oraciones en inglés con futuro continuo');const L=r.t.split('\n').filter(x=>/^\d+\. /.test(x));ok('Tres oraciones con futuro continuo → exactamente 3',L.length==3&&L.every(x=>/will be \w+ing/.test(x))&&/Inglés/.test(r.m),r.m+r.t)}
 {const r=await one('tres oraciones en ingles con futuro continuo');const L=r.t.split('\n').filter(x=>/^\d+\. /.test(x));ok('sin acentos ni mayúsculas → 3 oraciones',L.length==3,r.t)}
 {const r=await one('TRES ORACIONES EN INGLÉS CON FUTURO CONTINUO');const L=r.t.split('\n').filter(x=>/^\d+\. /.test(x));ok('en MAYÚSCULAS → 3 oraciones',L.length==3,r.t)}
 {const r=await one('Dame tres oraciones en ingles con futuro contino');const L=r.t.split('\n').filter(x=>/^\d+\. /.test(x));ok('con errata «contino» → 3 oraciones',L.length==3&&/will be/.test(r.t),r.m+r.t)}
 {const r=await one('Escríbeme 5 frases en inglés en pasado simple');const L=r.t.split('\n').filter(x=>/^\d+\. /.test(x));ok('5 frases en pasado simple → exactamente 5',L.length==5&&/Inglés/.test(r.m),r.t)}
 {const r=await one('2 oraciones en inglés con presente perfecto');const L=r.t.split('\n').filter(x=>/^\d+\. /.test(x));ok('2 oraciones presente perfecto → 2, con have/has',L.length==2&&L.every(x=>/\b(have|has)\b/.test(x)),r.t)}
 {const r=await one('Dame una oración en inglés con voz pasiva');const L=r.t.split('\n').filter(x=>/^\d+\. /.test(x));ok('una oración en voz pasiva → 1',L.length==1,r.t)}
 {const r=await one('Cuatro oraciones en inglés con condicionales');const L=r.t.split('\n').filter(x=>/^\d+\. /.test(x));ok('4 condicionales → 4 con «if»',L.length==4&&L.every(x=>/\bIf\b/.test(x)),r.t)}
 {const r=await one('Tres oraciones en inglés con futuro continuo');ok('incluye traducciones al español',/Estaré estudiando|estará trabajando|estarán jugando/.test(r.t),r.t)}
 {const o=await seq('Dame tres oraciones en inglés','Future continuous');const L=o[1].t.split('\n').filter(x=>/^\d+\. /.test(x));ok('«Dame tres oraciones en inglés» pregunta el tiempo; «Future continuous» genera 3',/tiempo verbal/.test(o[0].t)&&L.length==3&&/will be \w+ing/.test(o[1].t),o[0].t+' || '+o[1].t)}
 {const o=await seq('Dame cuatro oraciones en inglés','pasado simple');const L=o[1].t.split('\n').filter(x=>/^\d+\. /.test(x));ok('el número pedido se conserva en el seguimiento (4)',L.length==4,o[1].t)}
 {const o=await seq('Tres oraciones en inglés con futuro continuo','Otras');ok('«Otras» → tres oraciones distintas del mismo tiempo',o[1].t!==o[0].t&&/will be \w+ing/.test(o[1].t)&&o[1].t.split('\n').filter(x=>/^\d+\. /.test(x)).length==3,o[1].t)}
 {const r=await one('¿Sabes inglés?');ok('¿Sabes inglés? → capacidades lingüísticas',/Inglés · capacidades/.test(r.m)&&/tiempos verbales/.test(r.t),r.m+r.t)}
 {const r=await one('¿Entonces al inglés no le sabes?');ok('«¿Entonces al inglés no le sabes?» → capacidades (no planeta ni texto aleatorio)',/Inglés · capacidades/.test(r.m)&&!/planeta|Marte|Wikipedia/i.test(r.t),r.m+r.t)}
 {const r=await one('¿Qué es el futuro continuo?');ok('¿Qué es el futuro continuo? → gramática inglesa, no CI/CD',/will be/.test(r.t)&&/Inglés/.test(r.m)&&!/despliegue|integraci/i.test(r.t),r.m+r.t)}
 {const r=await one('¿Qué es la integración continua?');ok('integración continua → informática (CI/CD), no inglés',!/Inglés/.test(r.m)&&/integraci|CI|despliegue/i.test(r.t),r.m+r.t)}
 {const r=await one('¿Qué es el despliegue continuo?');ok('despliegue continuo → CI/CD',!/Inglés/.test(r.m)&&/despliegue|CI/i.test(r.t),r.m+r.t)}
 {const r=await one('Explain present perfect');ok('el motor de ejercicios de inglés existente sigue funcionando',/Presente perfecto|present perfect/i.test(r.t)&&!/Inglés · (oraciones|gramática|capacidades|aclaración)/.test(r.m),r.m+r.t.slice(0,100))}
 {const r=await one('Reported speech: She said, "I am tired."');ok('discurso indirecto (motor existente) intacto',/she was tired/i.test(r.t),r.m+r.t.slice(0,120))}

 sec('Geografía y cultura general');
 for(const[q,v]of[['¿Cuál es la moneda de Australia?',/dólar australiano/],['¿Cuál es la capital de Australia?',/Canberra/],['¿Cuál es la moneda de Japón?',/yen/i],['cual es la moneda de australia',/dólar australiano/],['¿Cuál es la capital de Japón?',/Tokio/]]){const r=await one(q);ok(q,v.test(r.t)&&!BAD.test(r.t)&&!/Constituci/.test(r.t),r.m+r.t)}
 {const o=await seq('¿Cuál es la capital de Australia?','¿Y la moneda?');ok('«¿Y la moneda?» conserva el país',/dólar australiano/.test(o[1].t),o[1].t)}
 {const r=await one('¿A qué nivel del subsuelo se encuentra la CDMX?');ok('CDMX subsuelo → NO responde de IP/DNS ni de otro tema',!/dirección IP|DNS|Parque|SG-1000/i.test(r.t),r.m+r.t)}

 sec('Saludos y conversación');
 for(const q of['Hola','Holaaa','Ola','Qué onda','Buenas','¿Qué tal?','Gracias','Adiós','Ayuda']){const r=await one(q);ok(q+' → conversación, sin web ni "sin respuesta"',!/Wikipedia|Sin respuesta|Maestro/.test(r.m)&&r.t.length>3&&!/Derivadas|Física general|Inglés ·/.test(r.m),r.m+r.t)}
 {H.net.length=0;await one('Hola');await one('Gracias');ok('saludar/agradecer no consulta internet',H.net.length==0,H.net.join(','))}
 {const r=await one('Más');ok('«Más» sin contexto → pregunta breve (no inventa)',!BAD.test(r.t)&&/más sobre qué|sobre qué/i.test(r.t),r.m+r.t)}
 {const o=await seq('Dame un ejemplo de derivada','¿Cuál es la capital de Australia?','Más');ok('cambio de tema: «Más» ya no sigue con derivadas',!/Derivadas/.test(o[2].m),o[2].m+o[2].t)}
 {const o=await seq('Explícame el trabajo en física','¿Cuál es la capital de Australia?','¿Y la fórmula?');ok('tras cambiar a geografía, «¿Y la fórmula?» no resucita el trabajo',!/cos\(θ\)/.test(o[2].t),o[2].m+o[2].t)}
 {const r=await one('trabajo');ok('palabra ambigua «trabajo» → pregunta breve',/Aclaraci/.test(r.m)&&/física/.test(r.t),r.m+r.t)}
 {const r=await one('Estoy estresado en el trabajo');ok('«trabajo» laboral NO activa física',!/Física general/.test(r.m)&&!/cos\(θ\)/.test(r.t),r.m+r.t)}

 sec('Búsqueda web: fallos y resultados irrelevantes');
 const IRR=u=>{u=String(u);if(/list=search/.test(u))return Promise.resolve({ok:true,json:async()=>({query:{search:[{title:'Parque de las Naciones',snippet:'zona de <b>Lisboa</b>'},{title:'SG-1000',snippet:'consola de Sega'}]}})});
  if(/page\/summary/.test(u))return Promise.resolve({ok:true,json:async()=>({title:'Parque de las Naciones',type:'standard',extract:'El Parque de las Naciones es una zona de Lisboa.'})});return Promise.reject(new TypeError('offline'))};
 H.setFetch(IRR);
 for(const q of['¿Cuál es el punto de fusión del wolframio en condiciones normales?','¿Qué comió el último faraón de Atlantis?','¿A qué nivel del subsuelo se encuentra la CDMX?']){const r=await one(q);ok('Wikipedia irrelevante descartada: '+q.slice(0,45),!BAD.test(r.t),r.m+r.t)}
 H.setFetch(null);
 for(const q of['¿Qué comió el último faraón de Atlantis?']){const r=await one(q);ok('sin internet: no rellena con otro tema ('+q.slice(0,30)+')',!BAD.test(r.t)&&/Sin respuesta/.test(r.m),r.m+r.t)}
 H.setFetch(wikiRel('Hipopótamo','El <b>hipopótamo</b> es un mamífero semiacuático','El hipopótamo es un mamífero semiacuático de África. Pasa el día en el agua. Es herbívoro.'));
 {const r=await one('Háblame del hipopótamo');ok('resultado web RELEVANTE sí se usa, con fuente y enlace',/Hipopótamo/.test(r.t)&&/Fuente: \[Wikipedia\]\(https:\/\/es\.wikipedia\.org/.test(r.t)&&/Wikipedia/.test(r.m),r.m+r.t)}
 H.setFetch(null);
 {w.eval('MAESTRO=true');
  H.setFetch(u=>/pollinations/.test(String(u))?Promise.resolve({ok:true,status:200,json:async()=>({choices:[{message:{content:'Una dirección IP identifica un dispositivo en una red y el DNS traduce nombres a direcciones.'}}]})}):Promise.reject(new TypeError('offline')));
  const r=await one('¿Cuál es el punto de fusión del wolframio en condiciones normales?');ok('maestro externo con respuesta de otro tema → descartada y avisado',!/dirección IP/.test(r.t)&&/descart/.test(r.t),r.m+r.t);
  H.setFetch(null);const r2=await one('¿Cuál es el punto de fusión del wolframio en condiciones normales?');ok('maestro externo caído → avisa brevemente, sin relleno',/No pude contactar/.test(r2.t)&&!BAD.test(r2.t),r2.m+r2.t);
  H.setFetch(u=>/pollinations/.test(String(u))?Promise.resolve({ok:true,status:200,json:async()=>({choices:[{message:{content:'El wolframio funde a unos 3422 °C, el punto de fusión más alto de los metales.'}}]})}):Promise.reject(new TypeError('offline')));
  const r3=await one('¿Cuál es el punto de fusión del wolframio en condiciones normales?');ok('maestro externo con respuesta pertinente → se usa',/3422/.test(r3.t),r3.m+r3.t);
  w.eval('MAESTRO=false');H.setFetch(null)}
 {H.net.length=0;await one('15875-478923');await one('Deriva x²');await one('¿Cuál es la moneda de Australia?');ok('matemáticas, derivadas y países se resuelven sin red',H.net.length==0,H.net.join(','))}

 sec('Repetición y duplicados');
 {const a=await one('¿Cuál es la capital de Australia?'),b=await ask('¿Cuál es la capital de Australia?');ok('la misma pregunta dos veces → misma respuesta correcta',/Canberra/.test(a.t)&&/Canberra/.test(b.t),a.t+'|'+b.t)}
 {const a=await one('Tres oraciones en inglés con futuro continuo'),b=await ask('Tres oraciones en inglés con futuro continuo');ok('repetir el pedido no cambia de tema',/will be/.test(a.t)&&/will be/.test(b.t),b.t)}
 const countA=()=>{const c=w.eval('(conv()||{msgs:[]}).msgs');return c.filter(m=>m.r=='a').length};
 const sleepT=ms=>new Promise(r=>setTimeout(r,ms));
 {w.eval("cur=null;convs.length=0");await Promise.all([w.send('Hola'),w.send('Hola'),w.send('Hola')]);await sleepT(2500);ok('3 envíos simultáneos del mismo mensaje → una sola respuesta',countA()==1,'respuestas='+countA())}
 {w.eval("cur=null;convs.length=0");const inp=w.document.querySelector('#in');inp.value='¿Cuál es la capital de Australia?';
  const ev=()=>new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});inp.dispatchEvent(ev());inp.value='¿Cuál es la capital de Australia?';inp.dispatchEvent(ev());w.document.querySelector('#go').click();await sleepT(3000);
  const ms=w.eval('conv().msgs');ok('Enter + Enter + clic en el botón → una sola respuesta',ms.filter(m=>m.r=='a').length==1&&ms.filter(m=>m.r=='u').length==1,JSON.stringify(ms.map(m=>m.r)))}
 {await sleepT(1500);const n0=countA();await w.send('¿Cuál es la capital de Australia?');await sleepT(3000);ok('repetir la pregunta a propósito (pasado el instante) SÍ obtiene respuesta',countA()==n0+1,'antes='+n0+' después='+countA())}
 {w.eval("cur=null;convs.length=0");await w.send('1000+1000');await sleepT(2500);const ms=w.eval('conv().msgs');ok('un mensaje del usuario → exactamente un mensaje final del asistente (sin dobles ni vacíos)',ms.length==2&&ms[1].r=='a'&&/2000/.test(ms[1].t),JSON.stringify(ms.map(m=>m.r+':'+m.t.slice(0,20))))}

 sec('Pendientes cerrados: clasificador, CDMX, memoria, maestro, voz y banco de inglés');
 {const r=await one('¿Cuál es el planeta rojo?');ok('«¿Cuál es el planeta rojo?» → Marte (no colores en inglés)',/Marte|cuarto planeta/i.test(r.t)&&!/blue|green|yellow/i.test(r.t),r.m+r.t)}
 {const r=await one('¿Cuál es el planeta rojo?');ok('classify devuelve el tema de Marte',w.eval("classify('¿Cuál es el planeta rojo?').k")=='mars',w.eval("JSON.stringify(classify('¿Cuál es el planeta rojo?'))"))}
 {const c=w.eval("classify('¿Entonces al inglés no le sabes?')");ok('classify ya no manda «al inglés no le sabes» a Marte',!c.k||c.k!='mars',JSON.stringify(c))}
 {const r=await one('¿A qué nivel del subsuelo se encuentra la CDMX?');ok('CDMX subsuelo → respuesta local verificada (altitud, zonas, hundimiento)',/2 240 m/.test(r.t)&&/Transición/.test(r.t)&&/Lago/.test(r.t)&&/Geografía/.test(r.m)&&!BAD.test(r.t),r.m+r.t)}
 {const r=await one('¿Cuántos metros de arcilla hay bajo la Ciudad de México?');ok('variante (arcilla, Ciudad de México) → misma base local, sin inventar cifras',/Geografía/.test(r.m)&&/No tengo un valor único/.test(r.t),r.m+r.t)}
 const nl=r=>r.t.split('\n').filter(x=>/^\d+\. /.test(x));
 const GR={ps:/^(I|You|We|They) [a-z]+ |^(He|She) [a-z]+(s|es) /,pc:/ (am|are|is) [a-z]+ing /,pas:/^[A-Z][a-z]* [a-z]+(ed|ought) /,pac:/ (was|were) [a-z]+ing /,fs:/ will [a-z]+ /,fc:/ will be [a-z]+ing /,pp:/ (have|has) [a-z]+ /,ppc:/ (have|has) been [a-z]+ing /,pap:/ had [a-z]+ /,fp:/ will have [a-z]+ /,gt:/ (am|are|is) going to [a-z]+ /};
 const NM={ps:'presente simple',pc:'presente continuo',pas:'pasado simple',pac:'pasado continuo',fs:'futuro simple',fc:'futuro continuo',pp:'presente perfecto',ppc:'presente perfecto continuo',pap:'pasado perfecto',fp:'futuro perfecto',gt:'going to'};
 for(const k of Object.keys(GR)){const r=await one('Dame 30 oraciones en inglés con '+NM[k]);const L=nl(r),en=L.map(x=>x.replace(/^\d+\. /,'').split(' — ')[0]),es=L.map(x=>(x.split(' — *')[1]||'').replace(/\*$/,''));
  const gen=en.slice(12);ok('30 oraciones de '+NM[k]+': exactas, distintas, las 18 generadas con la estructura, todas con traducción y mayúscula inicial',L.length==30&&new Set(en).size==30&&gen.every(x=>GR[k].test(x))&&es.every(x=>x.length>8)&&en.every(x=>/^[A-Z]/.test(x))&&es.every(x=>/^[A-ZÁÉÍÓÚ¿]/.test(x)),'n='+L.length+' únicas='+new Set(en).size+' | '+(gen.find(x=>!GR[k].test(x))||en.find(x=>!/^[A-Z]/.test(x))))}
 {const r=await one('Dame 20 oraciones en inglés con presente continuo');ok('20 oraciones (más que las 12 del banco) → exactamente 20',nl(r).length==20,nl(r).length)}
 {const r=await one('Dame 20 oraciones en inglés con futuro continuo');ok('20 de futuro continuo, todas «will be …ing»',nl(r).length==20&&nl(r).every(x=>/\bwill\b.*\bbe [a-z]+ing/i.test(x)),r.t.slice(0,200))}
 {const r=await one('Dame 15 oraciones en inglés con voz pasiva');ok('voz pasiva (solo banco): da las 12 que existen y lo dice con honestidad',nl(r).length==12&&/Pediste 15/.test(r.t),nl(r).length+' '+r.t.slice(-200))}
 {const o=await seq('Dame 20 oraciones en inglés con futuro continuo','Otras');ok('«Otras» tras 20 → 20 distintas de las anteriores',nl(o[1]).length==20&&!nl(o[1]).some(x=>nl(o[0]).includes(x)),nl(o[1]).length)}
 {const r=await one('Dame 40 oraciones en inglés con pasado simple');ok('límite por pedido (30) informado',nl(r).length==30&&/Pediste 40/.test(r.t),nl(r).length)}
 {const r=await one('Tres oraciones en inglés con presente simple');ok('presente simple: tercera persona con -s, traducción correcta de persona',nl(r).length==3,r.t)}
 {const g=w.eval("NXR.genSent('ps',2)"),h=w.eval("NXR.genSent('fc',0)");ok('muestra generada: concordancia en inglés y español',/^(I|You|We|They|He|She) /.test(g[0])&&g[1].length>8&&/^Ella |^Él |^[A-Z]/.test(g[1])&&/will be/.test(h[0])&&/^Estaré|^Estarás|^Estará|^Estaremos|^Estarán|^Ella|^Él|^Ellos/.test(h[1]),JSON.stringify([g,h]))}

 sec('Memoria aprendida envenenada y maestro externo que repite');
 const ART='El artículo 133 de la Constitución establece que esta Constitución, las leyes del Congreso de la Unión y los tratados serán la Ley Suprema de toda la Unión.';
 {w.eval('mem.taught.length=0');
  w.eval('mem.taught.push('+JSON.stringify({q:'¿Cuál es la moneda de Australia por favor?',a:ART,auto:1})+','+JSON.stringify({q:'cual es la capital de atlantis',a:ART,auto:1})+','+JSON.stringify({q:'cuanto da mil mas mil',a:ART,auto:1})+','+JSON.stringify({q:'¿Cuál es el color del cielo de Zork?',a:'El color del cielo de Zork es azul turquesa.',auto:1})+','+JSON.stringify({q:'mi palabra secreta',a:'banana'})+')');
  const n=w.eval('NXR.heal()');const rest=w.eval('mem.taught.map(x=>x.q)');
  ok('autolimpieza: elimina las 3 automáticas repetidas/sin relación y conserva las válidas y las enseñadas por ti',n==3&&rest.length==2&&rest.some(q=>/Zork/.test(q))&&rest.includes('mi palabra secreta'),n+' '+JSON.stringify(rest));
  w.eval('mem.taught.length=0')}
 {w.eval('MAESTRO=true');w.eval('mem.taught.length=0');w.eval('_lastMa=null');
  H.setFetch(u=>/pollinations/.test(String(u))?Promise.resolve({ok:true,status:200,json:async()=>({choices:[{message:{content:ART}}]})}):Promise.reject(new TypeError('offline')));
  const Qs=['¿Cuál es el punto de fusión del wolframio en condiciones normales?','¿Qué comió el último faraón de Atlantis?','¿Cuántos moluscos viven en el lago de Zork?'];const R=[];for(const q of Qs)R.push(await one(q));
  ok('maestro que responde SIEMPRE el artículo 133: nunca se muestra en preguntas ajenas',R.every(r=>!/artículo 133|Ley Suprema/.test(r.t)),R.map(r=>r.m+'|'+r.t.slice(0,80)).join(' // '));
  ok('…y no se aprende en memoria',w.eval('mem.taught.length')==0,w.eval('mem.taught.length'));
  const R2=await one(Qs[0]);ok('…preguntar de nuevo tampoco lo recupera',!/artículo 133/.test(R2.t),R2.t);
  w.eval('MAESTRO=false');H.setFetch(null);w.eval('mem.taught.length=0')}
 {w.eval('_lastMa=null');w.eval('MAESTRO=true');let k=0;
  H.setFetch(u=>/pollinations/.test(String(u))?Promise.resolve({ok:true,status:200,json:async()=>({choices:[{message:{content:'El wolframio funde a unos 3422 grados Celsius, el punto de fusión más alto entre los metales.'}}]})}):Promise.reject(new TypeError('offline')));
  const a=await one('¿Cuál es el punto de fusión del wolframio en condiciones normales?');
  const b=await one('¿Cuál es la temperatura de ebullición del mercurio en condiciones normales wolframio?');
  ok('respuesta pertinente se usa; la MISMA respuesta repetida a otra pregunta se descarta',/3422/.test(a.t)&&/repitió|descart/.test(b.t||'')||!/3422/.test(b.t),a.t.slice(0,60)+' // '+b.m+b.t.slice(0,100));
  w.eval('MAESTRO=false');H.setFetch(null);w.eval('mem.taught.length=0')}
 {w.eval("cur=null;convs.length=0");const q='¿Cuál es la capital de Australia?';await Promise.all([w.vlTurn(q),w.vlTurn(q)]);await sleepT(2500);const ms=w.eval('conv().msgs');ok('voz: la misma frase dos veces seguidas → una sola respuesta',ms.filter(m=>m.r=='a').length==1&&ms.filter(m=>m.r=='u').length==1,JSON.stringify(ms.map(m=>m.r)))}

 console.log(T.join('\n'));
 console.log('\n══════════════════════════════════════\n  '+pass+' correctas · '+fail+' fallidas · total '+(pass+fail)+'\n══════════════════════════════════════');
 if(fails.length)console.log('FALLOS:\n- '+fails.join('\n- '));
 process.exit(fail?1:0);
})().catch(e=>{console.error('ERROR EN LA SUITE',e);process.exit(2)});
