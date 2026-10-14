(function(){
'use strict';
const {lessons,sources,jokes}=BalanceCourse,R=BalanceRecall,E=BalanceEngine,$=id=>document.getElementById(id),KEY='balance-progress-v1';
let state={},storageOK=true,current=null;
try{state=JSON.parse(localStorage.getItem(KEY)||'{}');if(!validState(state))state={};}catch(e){state={};storageOK=false;}
function validState(s){return s&&typeof s==='object'&&!Array.isArray(s)&&Object.entries(s).every(([id,r])=>lessons.some(l=>l.id===id)&&r&&typeof r==='object'&&typeof r.concept==='boolean'&&Array.isArray(r.solved)&&r.solved.length<=100&&r.solved.every(x=>typeof x==='string'&&x.length<500)&&R.valid(r.recall));}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;$('storage-message').textContent='Браузер не сохраняет данные. Скачайте копию прогресса перед закрытием.';}}
function record(id){return state[id]||(state[id]={concept:false,solved:[]});}
function done(id){const r=state[id];return !!r?.concept&&r.solved.length>=3&&r.recall?.stage>0;}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function sessionDone(s){return s.topics.every(done);}
function navigation(){const nav=$('navigation');nav.replaceChildren();BalanceSessions.forEach((s,i)=>{const a=el('a',`${i+1}. ${s.title}`);a.href='#'+s.id;if(s.topics.includes(current?.id)||location.hash==='#'+s.id){a.classList.add('current');a.setAttribute('aria-current','page');}if(sessionDone(s))a.classList.add('complete');nav.append(a);});$('overall').textContent=`Пройдено ${BalanceSessions.filter(sessionDone).length} из 10 занятий`;}
function showSession(s){current=null;navigation();const main=$('lesson'),number=BalanceSessions.indexOf(s)+1;
 main.replaceChildren(el('span',`Занятие ${number} из 10`,'badge'),el('h1',s.title));
 const route=BalanceSessions.flatMap(session=>session.topics);
 s.topics.forEach(id=>{
  const l=lessons.find(topic=>topic.id===id),section=el('section',undefined,'textbook-section');
  section.append(el('h2','§ '+(route.indexOf(id)+1)+'. '+l.title));
  l.theory.forEach((text,index)=>{const paragraph=el('p',undefined,index===0?'definition':undefined);paragraph.append(document.createTextNode(text));section.append(paragraph);});
  if(l.referenceTheory){const reference=el('details');reference.append(el('summary','Дополнение: виды чисел'));l.referenceTheory.forEach(text=>reference.append(el('p',text)));section.append(reference);}
  section.append(el('h3','Примеры'));const examples=el('ol',undefined,'examples');l.examples.forEach(text=>examples.append(el('li',text)));section.append(examples);
  if(id==='balance')makeBalance(section);addPractice(section,l);main.append(section);
 });
 main.append(el('h2','Упражнение к занятию'),el('p',s.question));
 const form=el('form',undefined,'answer-form'),label=el('label','Ответ'),input=el('input');input.autocomplete='off';label.append(input);const check=el('button','Проверить','primary');check.type='submit';form.append(label,check);const feedback=el('p',undefined,'feedback');feedback.setAttribute('role','status');main.append(form,feedback);
 let hintIndex=0;const hint=el('button','Подсказка');hint.type='button';hint.onclick=()=>{feedback.textContent=s.hints[Math.min(hintIndex++,s.hints.length-1)];feedback.className='feedback';};main.append(hint);
 const solution=el('details');solution.append(el('summary','Решение'),el('p',s.solution));main.append(solution);
 form.onsubmit=e=>{e.preventDefault();if(E.parseNumber(input.value)===null){feedback.textContent='Введи число или дробь, например 20/3.';return;}const ok=E.check(input.value,s.answer);feedback.className='feedback '+(ok?'good':'bad');feedback.textContent=ok?'Верно. '+s.solution+'':'Ответ не сходится. Проверь вычисления или открой подсказку.';};
 main.append(el('h2','Вопросы для повторения'),el('p',s.wonder));
 const next=el('a',number<10?'Следующее занятие →':'Повторить маршрут →');next.href='#'+BalanceSessions[number%10].id;main.append(next);$('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');window.scrollTo(0,0);
}
function render(){
 const id=location.hash.slice(1)||'method';
 const session=BalanceSessions.find(s=>s.id===id);if(session){showSession(session);return;}
 if(id==='review'){showReview();return;}
 if(id.startsWith('recall-')&&R.cards[id.slice(7)]){showRecall(id.slice(7));return;}
 if(id==='sources'){showSources();return;}
 if(id==='method'){showMethod();return;}
 const parent=BalanceSessions.find(s=>s.topics.includes(id));
 if(parent){history.replaceState(null,'','#'+parent.id);showSession(parent);return;}
 showMethod();
}
function addPractice(main,l){
 const practice=el('section',undefined,'practice');practice.dataset.topic=l.id;practice.append(el('h3','Упражнения'));
 const mastery=el('p',undefined,'help');practice.append(mastery);
 function progress(){const r=record(l.id);mastery.textContent=`Объяснение: ${r.concept?'верно':'не проверено'} · Задачи: ${Math.min(3,r.solved.length)} из 3 · Термины: ${r.recall?.stage>0?'проверены самостоятельно':'не проверены'}`;navigation();}
 practice.append(el('p',l.question));const choices=el('div',undefined,'choices'),concept=el('p',undefined,'feedback');concept.setAttribute('role','status');
 E.shuffle(l.options.map((text,index)=>({text,index}))).forEach(o=>{const button=el('button',o.text);button.onclick=()=>{const ok=o.index===l.correct;concept.textContent=(ok?'Верно. ':'Неверно. ')+l.why;concept.className='feedback '+(ok?'good':'bad');record(l.id).concept=ok;save();progress();};choices.append(button);});practice.append(choices,concept);
 const question=el('p'),form=el('form',undefined,'answer-form'),label=el('label','Ответ'),input=el('input'),check=el('button','Проверить','primary');input.autocomplete='off';input.setAttribute('aria-label','Ответ: '+l.title);label.append(input);check.type='submit';form.append(label,check);
 const feedback=el('p',undefined,'feedback');feedback.setAttribute('role','status');practice.append(question,form,feedback);
 let task,attempted=false,helped=false,answered=false;
 function newTask(){const old=task?.key;for(let i=0;i<20;i++){task=E.generate(l.id);if(task.key!==old)break;}attempted=helped=answered=false;question.textContent=task.text;input.value='';feedback.textContent='';}
 const actions=el('div',undefined,'actions'),hint=el('button','Подсказка'),solution=el('button','Решение'),next=el('button','Другое задание');actions.append(hint,solution,next);practice.append(actions);
 hint.onclick=()=>{helped=true;feedback.className='feedback';feedback.textContent=task.hint;};solution.onclick=()=>{helped=true;feedback.className='feedback';feedback.textContent=task.solution;};next.onclick=newTask;
 form.onsubmit=e=>{e.preventDefault();if(answered)return;if(E.parseNumber(input.value)===null){feedback.textContent='Введите число или дробь, например 1/3.';return;}const ok=E.check(input.value,task.answer);feedback.className='feedback '+(ok?'good':'bad');if(ok){answered=true;const r=record(l.id),independent=!attempted&&!helped;if(independent&&!r.solved.includes(task.key)){r.solved.push(task.key);r.solved=r.solved.slice(-100);save();}feedback.textContent='Верно. '+task.solution+(independent?'':' Решите ещё одно задание самостоятельно.');progress();}else{attempted=true;feedback.textContent='Неверно. '+task.hint;}};
 const recall=el('details'),body=el('div');recall.append(el('summary','Проверка терминов'),body);let loaded=false;recall.ontoggle=()=>{if(recall.open&&!loaded){loaded=true;showRecall(l.id,body,progress);}};practice.append(recall);main.append(practice);newTask();progress();
}
function makeBalance(main){
 const section=el('section',undefined,'balance-board');section.append(el('h2','Лаборатория равновесия'),el('p','Модель уравнения: выполни одно действие над обеими сторонами. Цель — оставить x слева.'));
 let start={a:3,b:6,right:21},eq={...start};
 const pans=el('div',undefined,'pans'),left=el('div',undefined,'pan'),right=el('div',undefined,'pan');pans.append(left,el('span','='),right);section.append(pans,el('div',undefined,'fulcrum'));
 const form=el('form'),select=el('select');select.setAttribute('aria-label','Действие с обеими частями');[['subtract','Вычесть'],['add','Прибавить'],['divide','Разделить на'],['multiply','Умножить на']].forEach(([v,t])=>{const o=el('option',t);o.value=v;select.append(o);});const input=el('input');input.value='6';input.setAttribute('aria-label','Число для обеих частей');const button=el('button','Обе чаши','primary');form.append(select,input,button);section.append(form);
 const status=el('p');status.setAttribute('role','status');const log=el('ol',undefined,'balance-log');section.append(status,log);const reset=el('button','Вернуть исходное уравнение');reset.onclick=()=>{eq={...start};log.replaceChildren();status.textContent='';draw();};section.append(reset);
 const fmt=n=>Number(n.toFixed(6)).toLocaleString('ru-RU');function draw(){left.textContent=(Math.abs(eq.a-1)<1e-9?'x':fmt(eq.a)+'x')+(Math.abs(eq.b)<1e-9?'':(eq.b>0?' + ':' − ')+fmt(Math.abs(eq.b)));right.textContent=fmt(eq.right);}
 form.onsubmit=e=>{e.preventDefault();const value=E.parseNumber(input.value);if(value===null){status.textContent='Введите число, например 3 или 1/2.';return;}try{eq=E.transform(eq,select.value,value);draw();log.append(el('li',select.options[select.selectedIndex].text+' '+input.value+' — слева и справа.'));status.textContent=Math.abs(eq.a-1)<1e-9&&Math.abs(eq.b)<1e-9?'Получилось x = '+fmt(eq.right)+'. Проверь: 3 · 5 + 6 = 21.':'Равновесие сохранено.';}catch(error){status.textContent=error.message;}};
 draw();main.append(section);
}
function addReading(main,id){
 const books=BalanceReading.books.filter(b=>!id||b.lessons.includes(id));
 if(!books.length)return;
 main.append(el('h2',id?'Исследуй ещё':'Книги курса'));
 books.forEach(b=>{const card=el('details'),title=el('summary',b.title);card.append(title,el('p',b.idea));
 card.append(el('p','Попробуй: '+b.exercise));const solution=el('details');solution.append(el('summary','Объяснение'),el('p',b.answer));card.append(solution);
 const link=el('a','Открыть книгу');link.href=b.url;link.target='_blank';link.rel='noopener noreferrer';card.append(el('p',b.note),el('p',b.section+' · '+b.format,'help'),link,el('p','Упражнение Balance составлено отдельно; это не цитата из книги.','help'));main.append(card);});
}
function showReview(){
 current=null;navigation();const main=$('lesson');main.replaceChildren(el('h1','Повторение терминов'),el('p','Вспомни определение без образца, приведи свой пример и объясни применение. Самопроверка не заменяет обсуждения с преподавателем.'));
 const due=lessons.filter(l=>state[l.id]?.recall&&state[l.id].recall.due<=Date.now()),other=lessons.filter(l=>!due.includes(l));
 [["Пора повторить",due],["Все темы",other]].forEach(([title,items])=>{main.append(el('h2',title));if(!items.length)main.append(el('p','Пока нет.'));const list=el('ul');items.forEach(l=>{const li=el('li'),a=el('a',R.cards[l.id].term);a.href='#recall-'+l.id;li.append(a);const r=state[l.id]?.recall;li.append(el('span',r?.stage>0?' · повторить '+new Date(r.due).toLocaleDateString('ru-RU'):' · ещё не закреплено'));list.append(li);});main.append(list);});window.scrollTo(0,0);
}
function showRecall(id,host=null,onchange=()=>{}){
 if(!host){current=null;navigation();}const c=R.cards[id],main=host||$('lesson');main.replaceChildren(el('span','Воспроизведение по памяти','badge'),el(host?'h4':'h1',c.term),el('p','Не открывая учебник: запиши определение своими словами, приведи собственный пример и ответь на вопрос. Можно писать на бумаге или в полях ниже.'),el('p',c.question));
 const inputs=[];['Определение своими словами','Свой пример и почему он подходит','Ответ на вопрос'].forEach(title=>{const label=el('label',title),input=el('textarea');input.rows=3;input.maxLength=3000;label.append(input);main.append(label);inputs.push(input);});
 const paperLabel=el('label','Я записал все три ответа на бумаге '),paper=el('input');paper.type='checkbox';paperLabel.append(paper);main.append(paperLabel);
 const compare=el('button','Сравнить с объяснением','primary'),feedback=el('p');feedback.setAttribute('role','status');main.append(compare,feedback);
 compare.onclick=()=>{if(!paper.checked&&inputs.some(i=>!i.value.trim())){feedback.textContent='Сначала попробуй ответить на все три пункта. Если не помнишь — открой объяснение ниже.';return;}reveal();};
 const forgotten=el('button','Не помню — разобрать');main.append(forgotten);let exposed=false;
 forgotten.onclick=()=>{record(id).recall=R.assess(record(id).recall,false);save();navigation();onchange();reveal(true);};
 function reveal(failed=false){if(exposed)return;exposed=true;compare.disabled=true;forgotten.disabled=true;inputs.forEach(i=>i.disabled=true);paper.disabled=true;feedback.textContent='Сравни смысл, а не дословное совпадение. Проверка твоего объяснения здесь самостоятельная.';
 main.append(el('h2','Определение'),el('p',c.definition),el('h2','Ответ на вопрос'),el('p',c.answer),el('h2','Как запомнить'),el('p',c.mnemonic));
 const checklist=el('div'),boxes=[];['В определении сохранены все существенные признаки и ограничения','Мой пример подходит под определение; я могу объяснить почему','Ответ на вопрос верен и объяснён'].forEach(text=>{const label=el('label',text+' '),box=el('input');box.type='checkbox';label.append(box);checklist.append(label);boxes.push(box);});main.append(checklist);
 const good=el('button','Все три ответа верны'),again=el('button','Есть пробел — повторить тему'),status=el('p');status.setAttribute('role','status');good.disabled=failed;main.append(good,again,status);
 good.onclick=()=>{if(boxes.some(b=>!b.checked)){status.textContent='Проверь каждый пункт. Если есть неточность, вернись к теме.';return;}record(id).recall=R.assess(record(id).recall,true);save();navigation();onchange();good.disabled=true;again.disabled=true;status.textContent='Самопроверка сохранена. Следующее повторение: '+new Date(record(id).recall.due).toLocaleDateString('ru-RU')+'.';};
 again.onclick=()=>{record(id).recall=R.assess(record(id).recall,false);save();onchange();if(host){showRecall(id,host,onchange);}else{location.hash=id;}};
 if(failed)status.textContent='Прочитай объяснение, вернись к теме и позже воспроизведи без образца.';
 }
 if(!host){const back=el('a','Вернуться к занятию');back.href='#'+BalanceSessions.find(s=>s.topics.includes(id)).id;main.append(back);$('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');window.scrollTo(0,0);}
}
function showMethod(){
 current=null;navigation();const main=$('lesson');
 main.replaceChildren(el('span','Введение','badge'),el('h1','Как учиться'),el('p','Задача курса — научиться составлять формулы по условию, преобразовывать их и применять к расчёту физических процессов. Для занятий нужны бумага, карандаш и четыре арифметических действия.'));
 BalanceReading.method.forEach(([title,text],i)=>main.append(el('h2',(i+1)+'. '+title),el('p',text)));
 main.append(el('h2','Письмо и запоминание'),el('p','Записывай по памяти короткое определение, собственный пример и объяснение шага. Рисуй схемы и подписывай величины. Затем сверяй и исправляй. Переписывание готового текста само по себе не показывает понимания; если писать рукой неудобно, используй клавиатуру или объясни вслух.'),el('p','Каждая тема требует верного объяснения, трёх разных самостоятельных решений и самопроверки терминов. Неясный термин разбери до перехода к задаче, где он нужен. Возвращайся к нему через время: отметка за сегодня не означает, что материал уже нельзя забыть.'));
 main.append(el('h2','Пример: от наблюдения к формуле'),el('p','Игрушечная машинка проходит 2 метра за каждую секунду. Нарисуй её положения через 1, 2 и 3 секунды: 2, 4 и 6 метров от старта. Здесь считаем, что скорость постоянна и машинка движется прямо в одном направлении.'),el('p','Путь s — пройденное расстояние; время t — длительность движения; скорость v — путь за единицу времени при равномерном движении. Поэтому s = v · t. При v = 2 м/с и t = 3 с получаем s = 6 м.'));
 main.append(el('h2','Проверь понимание'),el('p','При той же скорости машинка двигалась 5 секунд. Какой путь она прошла?'));
 const choices=el('div',undefined,'choices'),feedback=el('p',undefined,'feedback');feedback.setAttribute('role','status');
 E.shuffle([{text:'10 метров',ok:true,why:'За каждую из пяти секунд — 2 метра: 2 · 5 = 10 м.'},{text:'7 метров',ok:false,why:'Скорость и время нельзя складывать. Посчитай пять отрезков по 2 метра.'},{text:'2,5 метра',ok:false,why:'Деление здесь не даёт путь. За каждую секунду добавляется ещё 2 метра.'}]).forEach(o=>{const button=el('button',o.text);button.onclick=()=>{feedback.textContent=o.why;feedback.className='feedback '+(o.ok?'good':'bad');};choices.append(button);});main.append(choices,feedback);
 main.append(el('p','Затем объясни, почему эта формула не подходит без изменений, если машинка разгоняется. Непонятное слово или действие — повод вернуться к определению и примеру.'));
 const sources=el('details');sources.append(el('summary','О методе и источниках'),el('p','В описании технологии обучения Л. Рона Хаббарда выделены три препятствия: отсутствие предмета или его модели («массы»), пропущенные ступени обучения и непонятые слова. Здесь эти идеи адаптированы к математике. «Масса» в этом смысле — не объём знаний.'),el('p','Утверждения об универсальности системы и физиологических причинах трудностей не принимаются за установленные факты. Самостоятельная практика, повторение с интервалами и сочетание примеров с задачами отдельно описаны в исследовательском руководстве IES.'));
 [['Описание технологии обучения Хаббарда','https://www.lronhubbard.ru/ron-series/profile/humanitarian/education/study-technology.html'],['IES: организация обучения и самостоятельной работы','https://ies.ed.gov/ncee/wwc/PracticeGuide/1'],['Дмитрий Михайлов: «Как правильно изучать математику»','https://www.youtube.com/watch?v=UM4SRQsIqok']].forEach(([title,url])=>{const a=el('a',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';const line=el('p');line.append(a);sources.append(line);});main.append(sources);
 const research=el('details');research.append(el('summary','Исследования письма и памяти'),el('p','Письмо и рисунок могут помогать организовать материал. Но различия ЭЭГ не доказывают улучшение памяти в пять раз. Безошибочный ответ сегодня не гарантирует сохранения через год. Поэтому здесь есть самостоятельное воспроизведение и повторение через время.'));
 [['Письмо и связность ЭЭГ (2024)','https://doi.org/10.3389/fpsyg.2023.1219945'],['Ограничения исследования письма (2025)','https://doi.org/10.3389/fpsyg.2024.1517235'],['Повторное воспроизведение (2008)','https://doi.org/10.1126/science.1152408'],['Распределённая практика математических задач (2006)','https://doi.org/10.1002/acp.1266'],['Рисунки и запоминание (2016)','https://uwspace.uwaterloo.ca/items/a8b52734-18f3-4527-8be2-008a105c85f2']].forEach(([title,url])=>{const a=el('a',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';const line=el('p');line.append(a);research.append(line);});main.append(research);
 const start=el('a','Занятие 1: числа и выражения →');start.href='#session-1';main.append(start);
 $('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');window.scrollTo(0,0);
}
function showSources(){current=null;navigation();const main=$('lesson');main.replaceChildren(el('h1','Маршрут Balance'),el('p','10 занятий для ученика, который умеет складывать, вычитать, умножать и делить. Начинать можно примерно с 4-го класса, со взрослым и в собственном темпе. Занятие удобно делить на два подхода по 15–20 минут.'));
 main.append(el('h2','Что будет получаться'),el('p','Называть переменную, выражение, равенство, уравнение и корень; различать семейства чисел; объяснять обратимые преобразования; решать изученные линейные уравнения; выражать буквы из формул; составлять простые модели и проверять единицы.'));
 main.append(el('h2','Как учиться'),el('p','Прочитай правило, объясни три примера своими словами, потренируйся. После нескольких занятий вернись к старой теме без подсказок. Отметка прохождения означает выполнение тренировки, а не гарантию владения всей темой.'));
 addReading(main);
 main.append(el('h2','Материалы для любопытных'));const ul=el('ul',undefined,'sources');sources.forEach(s=>{const li=el('li'),a=el('a',s.title);a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,el('p',s.text));ul.append(li);});main.append(ul,el('p','Уроки, примеры и упражнения Balance написаны отдельно. Видеоуроки не скопированы. Курс Савватеева — дополнительное углубление, а не последовательность обязательных заданий для начинающего.'));
 main.append(el('h2','Память и понимание'),el('p','В каждой теме есть определение, вопрос на применение и смысловая опора для запоминания. Сначала ответь по памяти, затем сравни и повтори через время.'));
 main.append(el('h2','Следующая ступень'),el('p','Неравенства, системы, степени и квадратные уравнения. «Любые уравнения» не решаются одним универсальным школьным алгоритмом. Главный результат первого курса — понимание смысла и ограничений каждого шага.'));window.scrollTo(0,0);
}
document.querySelector('.skip').onclick=e=>{e.preventDefault();$('lesson').focus();};
$('menu').onclick=()=>{const open=$('sidebar').classList.toggle('open');$('menu').setAttribute('aria-expanded',String(open));};
$('settings-button').onclick=()=> $('settings').showModal();
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,progress:state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='balance-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>1000000)throw Error('Файл слишком большой.');const data=JSON.parse(await f.text());if(data.version!==1||!validState(data.progress))throw Error('Это не копия прогресса Balance.');state=data.progress;save();render();$('storage-message').textContent='Прогресс восстановлен.';}catch(err){$('storage-message').textContent=err.message;}e.target.value='';};
$('reset').onclick=()=>{state={};save();render();$('storage-message').textContent='Прогресс очищен.';};
window.addEventListener('hashchange',render);render();
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{$('offline-status').textContent='Материалы готовы для работы без интернета. Внешние видео требуют подключения.';}).catch(()=>{$('offline-status').textContent='Не удалось сохранить курс для работы без интернета. Откройте его ещё раз с подключением к сети.';});
})();
