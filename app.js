
let state={questions:[],i:0,score:0,wrong:[],mode:'normal'};
const $=id=>document.getElementById(id);
function panels(id){document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');scrollTo(0,0)}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function namesExcept(name, hard=false){let pool=OGHAMS.map(x=>x.name).filter(x=>x!==name);if(hard&&CLOSE[name]) pool=[...CLOSE[name],...pool.filter(x=>!CLOSE[name].includes(x))];return pool}
function choices(correct, field, hard){
 let r=OGHAMS.find(x=>x.name===correct), vals=[r[field]];
 let preferred=hard&&CLOSE[correct]?CLOSE[correct].map(n=>OGHAMS.find(x=>x.name===n)?.[field]).filter(Boolean):[];
 for(let v of [...preferred,...shuffle(OGHAMS.map(x=>x[field]))]) if(v&& !vals.includes(v)) vals.push(v); 
 return shuffle(vals.slice(0,4));
}
function makeQuestion(o,type,hard){
 if(type==='tree') return {type:'Plante associée',q:`Quel Ogham est associé à « ${o.tree} » ?`,a:o.name,opts:shuffle([o.name,...namesExcept(o.name,hard).slice(0,3)]),o};
 if(type==='theme') return {type:'Thème central',q:`Quel Ogham a pour thème central « ${o.theme} » ?`,a:o.name,opts:shuffle([o.name,...namesExcept(o.name,hard).slice(0,3)]),o};
 if(type==='sound') return {type:'Valeur phonétique',q:`Quelle valeur phonétique correspond à ${o.name} ?`,a:o.sound,opts:choices(o.name,'sound',hard),o};
 if(type==='symbol') return {type:'Symbole',q:`<img class="question-symbol" src="${o.image}" alt="Symbole oghamique à identifier"><span>Quel nom correspond à ce symbole ?</span>`,html:true,a:o.name,opts:shuffle([o.name,...namesExcept(o.name,hard).slice(0,3)]),o};
 return {type:'Mots-clés',q:`À quel Ogham associes-tu : ${o.keywords || o.theme} ?`,a:o.name,opts:shuffle([o.name,...namesExcept(o.name,hard).slice(0,3)]),o};
}
function build(mode, subset){
 let pool=subset?.length?OGHAMS.filter(o=>subset.includes(o.name)):OGHAMS;
 let count=mode==='errors'?Math.min(15,pool.length*2):15, types=['tree','theme','sound','symbol','keywords'], qs=[];
 for(let i=0;i<count;i++){let o=pool[i%pool.length]; if(i%pool.length===0) pool=shuffle(pool); qs.push(makeQuestion(o,types[i%types.length],mode==='hard'))}
 return shuffle(qs);
}
function startQuiz(mode){state={questions:build(mode),i:0,score:0,wrong:[],mode};panels('quiz');renderQ()}
function startErrors(){let e=JSON.parse(localStorage.getItem('oghamErrors')||'[]');if(!e.length){alert("Aucune erreur enregistrée pour le moment.");return}state={questions:build('errors',e),i:0,score:0,wrong:[],mode:'errors'};panels('quiz');renderQ()}
function renderQ(){
 let q=state.questions[state.i];$('progress').textContent=`${state.i+1} / ${state.questions.length}`;$('bar').style.width=`${state.i/state.questions.length*100}%`;
 $('qtype').textContent=q.type;if(q.html){$('question').innerHTML=q.q}else{$('question').textContent=q.q};$('feedback').className='feedback';$('feedback').innerHTML='';$('next').className='next';
 $('answers').innerHTML='';q.opts.forEach(v=>{let b=document.createElement('button');b.textContent=v;b.onclick=()=>answer(v,b);$('answers').appendChild(b)})
}
function answer(v,b){
 let q=state.questions[state.i],ok=v===q.a;document.querySelectorAll('#answers button').forEach(x=>{x.disabled=true;if(x.textContent===q.a)x.classList.add('correct')});if(!ok){b.classList.add('wrong');state.wrong.push(q.o.name)}else state.score++;
 $('feedback').innerHTML=`<b>${ok?'Bonne réponse.':'Réponse : '+q.a}</b><br><img class="feedback-symbol" src="${q.o.image}" alt="${q.o.name}"> <b>${q.o.name}</b> — ${q.o.tree}. Thème : <b>${q.o.theme}</b>.<br><span>${q.o.synthesis||q.o.interpretation.slice(0,260)}</span>`;
 $('feedback').classList.add('show');$('next').classList.add('show')
}
function nextQuestion(){state.i++;if(state.i>=state.questions.length)return finish();renderQ()}
function finish(){
 let pct=Math.round(state.score/state.questions.length*100), old=JSON.parse(localStorage.getItem('oghamErrors')||'[]'), merged=[...new Set([...old,...state.wrong])];
 if(state.wrong.length===0 && state.mode==='errors') localStorage.removeItem('oghamErrors'); else localStorage.setItem('oghamErrors',JSON.stringify(merged));
 localStorage.setItem('oghamLast',JSON.stringify({score:state.score,total:state.questions.length,pct}));
 $('score').textContent=`${pct}%`;$('resultText').innerHTML=`${state.score} bonnes réponses sur ${state.questions.length}.`+(state.wrong.length?`<br><br>À revoir : <b>${[...new Set(state.wrong)].join(', ')}</b>.`:`<br><br><b>Parcours sans faute.</b>`);panels('result');updateStats()
}
function goHome(){panels('home');updateStats()}
function showCards(){panels('cards');renderCards('')}
function renderCards(q){
 q=(q||'').toLowerCase();let list=OGHAMS.filter(o=>JSON.stringify(o).toLowerCase().includes(q));
 $('cardgrid').innerHTML=list.map(o=>`<article class="card"><div class="sym"><img src="${o.image}" alt="Symbole ${o.name}"></div><h3>${o.name}</h3><div class="meta">n° ${o.order} · ${o.tree} · ${o.sound}</div><span class="pill">${o.theme}</span><div class="quote">${o.synthesis||o.keywords}</div></article>`).join('')
}
function updateStats(){let last=JSON.parse(localStorage.getItem('oghamLast')||'null'),errs=JSON.parse(localStorage.getItem('oghamErrors')||'[]');$('stats').textContent=(last?`Dernier score : ${last.pct}% · `:'')+`${errs.length} ogham${errs.length>1?'s':''} à revoir`;$('errorsBtn').style.opacity=errs.length?1:.55}
updateStats();
