(function(){
'use strict';
const {lessons,sources,jokes}=BalanceCourse,E=BalanceEngine,$=id=>document.getElementById(id),KEY='balance-progress-v1';
let state={},storageOK=true,current=null,task=null,attempted=false,answered=false,helped=false;
try{state=JSON.parse(localStorage.getItem(KEY)||'{}');if(!validState(state))state={};}catch(e){state={};storageOK=false;}
function validState(s){return s&&typeof s==='object'&&!Array.isArray(s)&&Object.entries(s).every(([id,r])=>lessons.some(l=>l.id===id)&&r&&typeof r==='object'&&typeof r.concept==='boolean'&&Array.isArray(r.solved)&&r.solved.length<=100&&r.solved.every(x=>typeof x==='string'&&x.length<500));}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;$('storage-message').textContent='Браузер не сохраняет данные. Скачайте копию прогресса перед закрытием.';}}
function record(id){return state[id]||(state[id]={concept:false,solved:[]});}
function done(id){const r=state[id];return !!r?.concept&&r.solved.length>=3;}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function sessionDone(s){return s.topics.every(done);}
function navigation(){const nav=$('navigation');nav.replaceChildren();BalanceSessions.forEach((s,i)=>{const a=el('a',`${i+1}. ${s.title}`);a.href='#'+s.id;if(s.topics.includes(current?.id)||location.hash==='#'+s.id){a.classList.add('current');a.setAttribute('aria-current','page');}if(sessionDone(s))a.classList.add('complete');nav.append(a);});$('overall').textContent=`Пройдено ${BalanceSessions.filter(sessionDone).length} из 10 занятий`;}
function showSession(s){current=null;navigation();const main=$('lesson'),number=BalanceSessions.indexOf(s)+1;
 main.replaceChildren(el('span',`Занятие ${number} из 10`,'badge'),el('h1',s.title),el('p',s.goal,'goal'));
 if(number===1){main.append(el('p','Цель: составлять уравнения по условию, решать их и проверять ответ. Применение: покупки, поездки, расчёты для своих проектов. В физике проверяем расчёт измерением. Нужны четыре арифметических действия.'));}
 main.append(el('h2',s.hook),el('p',s.question),el('p','Реши сам или открой подсказку.','help'));
 const form=el('form',undefined,'answer-form'),label=el('label','Ответ'),input=el('input');input.autocomplete='off';label.append(input);const check=el('button','Проверить','primary');check.type='submit';form.append(label,check);const feedback=el('p',undefined,'feedback');feedback.setAttribute('role','status');main.append(form,feedback);
 let hintIndex=0;const hint=el('button','Подсказка');hint.type='button';hint.onclick=()=>{feedback.textContent=s.hints[Math.min(hintIndex++,s.hints.length-1)];feedback.className='feedback';};main.append(hint);
 const solution=el('details');solution.append(el('summary','Решение'),el('p',s.solution));main.append(solution);
 form.onsubmit=e=>{e.preventDefault();if(E.parseNumber(input.value)===null){feedback.textContent='Введи число или дробь, например 20/3.';return;}const ok=E.check(input.value,s.answer);feedback.className='feedback '+(ok?'good':'bad');feedback.textContent=ok?'Верно. '+s.solution+'':'Ответ не сходится. Проверь вычисления или открой подсказку.';};
 main.append(el('h2','А что, если…'),el('p',s.wonder),el('h2','Правила и практика'));
 const list=el('ol');s.topics.forEach(id=>{const l=lessons.find(x=>x.id===id),li=el('li'),link=el('a',l.title+(done(id)?' ✓':''));link.href='#'+id;li.append(link);list.append(li);});main.append(list,el('p',`Освоено шагов: ${s.topics.filter(done).length} из ${s.topics.length}. `));
 main.append(el('h2','Проверка понимания'),el('p','Объясни действия. Измени одно число и реши заново.'));
 const next=el('a',number<10?'Следующее занятие →':'Повторить маршрут →');next.href='#'+BalanceSessions[number%10].id;main.append(next);$('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');window.scrollTo(0,0);
}
function render(){
 const id=location.hash.slice(1)||'method';
 const session=BalanceSessions.find(s=>s.id===id);if(session){showSession(session);return;}
 if(id==='sources'){showSources();return;}
 if(id==='method'){showMethod();return;}
 current=lessons.find(l=>l.id===id)||lessons[0];const l=current,i=lessons.indexOf(l),main=$('lesson');main.replaceChildren();navigation();
 const parent=BalanceSessions.find(s=>s.topics.includes(l.id));const back=el('a','← К занятию');back.href='#'+parent.id;main.append(back,el('p',`Занятие ${BalanceSessions.indexOf(parent)+1} из 10 · Шаг ${parent.topics.indexOf(l.id)+1} из ${parent.topics.length}`,'badge'),el('h1',l.title),el('p',l.goal,'goal'));
 if(!storageOK)main.append(el('p','Прогресс не сохраняется автоматически. Используйте копию в настройках.'));
 l.theory.forEach(t=>main.append(el('p',t)));
 if(l.referenceTheory){const d=el('details');d.append(el('summary','Виды чисел — справочник'));l.referenceTheory.forEach(t=>d.append(el('p',t)));main.append(d);}
 if(l.source){const a=el('a',l.source.title);a.href=l.source.url;a.target='_blank';a.rel='noopener noreferrer';main.append(a);}
 main.append(el('h2','Разберём на примерах'));
 const examples=el('ol',undefined,'examples');l.examples.forEach(t=>examples.append(el('li',t)));main.append(examples,el('p',l.memory,'memory'));
 if(l.id==='balance'||l.id==='outer'||l.id==='both')makeBalance(main);
 const practice=el('section',undefined,'practice');practice.append(el('h2','Теперь твоя очередь'));
 practice.append(el('p','Сначала объясни правило, затем реши три разных задания с первой попытки без подсказки. Можно тренироваться дальше.','help'));
 const mastery=el('p');mastery.id='mastery';practice.append(mastery);
 practice.append(el('h3','1. Выбери объяснение'),el('p',l.question));const choices=el('div',undefined,'choices'),conceptFeedback=el('p',undefined,'feedback');conceptFeedback.setAttribute('role','status');
 E.shuffle(l.options.map((text,index)=>({text,index}))).forEach(o=>{const b=el('button',o.text);b.onclick=()=>{const ok=o.index===l.correct;conceptFeedback.textContent=(ok?'Верно. ':'Попробуй ещё. ')+l.why;conceptFeedback.className='feedback '+(ok?'good':'bad');if(ok){record(l.id).concept=true;save();updateMastery();navigation();}};choices.append(b);});practice.append(choices,conceptFeedback,el('h3','2. Реши задачу'));
 const question=el('p');question.id='question';practice.append(question);
 const form=el('form',undefined,'answer-form'),label=el('label','Твой ответ'),input=el('input');input.id='answer';input.type='text';input.autocomplete='off';input.spellcheck=false;input.setAttribute('aria-describedby','answer-help');label.append(input);const check=el('button','Проверить','primary');check.type='submit';form.append(label,check);practice.append(form);
 const help=el('p','Введите число, десятичную дробь или дробь вида 1/3. Единицы указаны в условии.','help');help.id='answer-help';practice.append(help);
 const feedback=el('p',undefined,'feedback');feedback.id='answer-feedback';feedback.setAttribute('role','status');practice.append(feedback);
 const actions=el('div',undefined,'actions'),hint=el('button','Подсказка'),solution=el('button','Разбор решения'),next=el('button','Другое задание');actions.append(hint,solution,next);practice.append(actions);
 hint.onclick=()=>{helped=true;feedback.textContent=task.hint;feedback.className='feedback';};solution.onclick=()=>{helped=true;feedback.textContent=task.solution;feedback.className='feedback';};next.onclick=()=>newTask();
 form.onsubmit=e=>{e.preventDefault();if(answered)return;if(E.parseNumber(input.value)===null){feedback.textContent='Нужно число или дробь, например 7, −2, 0,5 или 1/3. Делить на ноль нельзя.';feedback.className='feedback bad';return;}
 const ok=E.check(input.value,task.answer);feedback.className='feedback '+(ok?'good':'bad');
 if(ok){answered=true;const r=record(l.id);const independent=!attempted&&!helped;if(independent&&!r.solved.includes(task.key)){r.solved.push(task.key);r.solved=r.solved.slice(-100);save();}
 feedback.textContent='Верно. '+task.solution+(independent?'':' Теперь попробуй другое задание без подсказки.');updateMastery();navigation();}
 else{attempted=true;feedback.textContent='Пока не сходится. '+task.hint+' Проверь вычисление и попробуй снова.';}};
 main.append(practice);
 addReading(main,l.id);
 const joke=el('details'),sum=el('summary','Минутка улыбки');joke.append(sum,el('p',jokes[i%jokes.length]));main.append(joke);
 if(['fractions','reals','measurement'].includes(l.id)){const link=el('a','Дополнительное видео и материалы');link.href='#sources';main.append(link);}
 const nextNav=el('div',undefined,'next'),route=BalanceSessions.flatMap(s=>s.topics),position=route.indexOf(l.id);if(position){const a=el('a','← Предыдущий шаг');a.href='#'+route[position-1];nextNav.append(a);}if(position<route.length-1){const nextId=route[position+1],nextParent=BalanceSessions.find(s=>s.topics.includes(nextId)),same=nextParent.id===parent.id,a=el('a',same?'Следующий шаг →':'Следующее занятие →');a.href='#'+(same?nextId:nextParent.id);nextNav.append(a);}else{const a=el('a','К итоговому заданию →');a.href='#session-10';nextNav.append(a);}main.append(nextNav);
 updateMastery();newTask();$('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');window.scrollTo(0,0);
}
function updateMastery(){const r=record(current.id);$('mastery').textContent=done(current.id)?'✓ Шаг пройден. Можно повторять задания.':`Объяснение: ${r.concept?'верно':'пока не выбрано'} · Самостоятельно решено ${Math.min(3,r.solved.length)} из 3`;}
function newTask(){const old=task?.key;for(let i=0;i<20;i++){task=E.generate(current.id);if(task.key!==old)break;}attempted=false;answered=false;helped=false;$('question').textContent=task.text;$('answer').value='';$('answer-feedback').textContent='';}
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
function showMethod(){
 current=null;navigation();const main=$('lesson');
 main.replaceChildren(el('span','Введение','badge'),el('h1','Как учиться'),el('p','Задача курса — научиться составлять формулы по условию, преобразовывать их и применять к расчёту физических процессов. Для занятий нужны бумага, карандаш и четыре арифметических действия.'));
 BalanceReading.method.forEach(([title,text],i)=>main.append(el('h2',(i+1)+'. '+title),el('p',text)));
 main.append(el('h2','Пример: от наблюдения к формуле'),el('p','Игрушечная машинка проходит 2 метра за каждую секунду. Нарисуй её положения через 1, 2 и 3 секунды: 2, 4 и 6 метров от старта. Здесь считаем, что скорость постоянна и машинка движется прямо в одном направлении.'),el('p','Путь s — пройденное расстояние; время t — длительность движения; скорость v — путь за единицу времени при равномерном движении. Поэтому s = v · t. При v = 2 м/с и t = 3 с получаем s = 6 м.'));
 main.append(el('h2','Проверь понимание'),el('p','При той же скорости машинка двигалась 5 секунд. Какой путь она прошла?'));
 const choices=el('div',undefined,'choices'),feedback=el('p',undefined,'feedback');feedback.setAttribute('role','status');
 E.shuffle([{text:'10 метров',ok:true,why:'За каждую из пяти секунд — 2 метра: 2 · 5 = 10 м.'},{text:'7 метров',ok:false,why:'Скорость и время нельзя складывать. Посчитай пять отрезков по 2 метра.'},{text:'2,5 метра',ok:false,why:'Деление здесь не даёт путь. За каждую секунду добавляется ещё 2 метра.'}]).forEach(o=>{const button=el('button',o.text);button.onclick=()=>{feedback.textContent=o.why;feedback.className='feedback '+(o.ok?'good':'bad');};choices.append(button);});main.append(choices,feedback);
 main.append(el('p','Затем объясни, почему эта формула не подходит без изменений, если машинка разгоняется. Непонятное слово или действие — повод вернуться к определению и примеру.'));
 const sources=el('details');sources.append(el('summary','О методе и источниках'),el('p','В описании технологии обучения Л. Рона Хаббарда выделены три препятствия: отсутствие предмета или его модели («массы»), пропущенные ступени обучения и непонятые слова. Здесь эти идеи адаптированы к математике. «Масса» в этом смысле — не объём знаний.'),el('p','Утверждения об универсальности системы и физиологических причинах трудностей не принимаются за установленные факты. Самостоятельная практика, повторение с интервалами и сочетание примеров с задачами отдельно описаны в исследовательском руководстве IES.'));
 [['Описание технологии обучения Хаббарда','https://www.lronhubbard.ru/ron-series/profile/humanitarian/education/study-technology.html'],['IES: организация обучения и самостоятельной работы','https://ies.ed.gov/ncee/wwc/PracticeGuide/1'],['Дмитрий Михайлов: «Как правильно изучать математику»','https://www.youtube.com/watch?v=UM4SRQsIqok']].forEach(([title,url])=>{const a=el('a',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';const line=el('p');line.append(a);sources.append(line);});main.append(sources);
 const start=el('a','Занятие 1: числа и выражения →');start.href='#session-1';main.append(start);
 $('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');window.scrollTo(0,0);
}
function showSources(){current=null;navigation();const main=$('lesson');main.replaceChildren(el('h1','Маршрут Balance'),el('p','10 занятий для ученика, который умеет складывать, вычитать, умножать и делить. Начинать можно примерно с 4-го класса, со взрослым и в собственном темпе. Занятие удобно делить на два подхода по 15–20 минут.'));
 main.append(el('h2','Что будет получаться'),el('p','Называть переменную, выражение, равенство, уравнение и корень; различать семейства чисел; объяснять обратимые преобразования; решать изученные линейные уравнения; выражать буквы из формул; составлять простые модели и проверять единицы.'));
 main.append(el('h2','Как учиться'),el('p','Прочитай правило, объясни три примера своими словами, потренируйся. После нескольких занятий вернись к старой теме без подсказок. Отметка прохождения означает выполнение тренировки, а не гарантию владения всей темой.'));
 addReading(main);
 main.append(el('h2','Материалы для любопытных'));const ul=el('ul',undefined,'sources');sources.forEach(s=>{const li=el('li'),a=el('a',s.title);a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,el('p',s.text));ul.append(li);});main.append(ul,el('p','Уроки, примеры и упражнения Balance написаны отдельно. Видеоуроки не скопированы. Курс Савватеева — дополнительное углубление, а не последовательность обязательных заданий для начинающего.'));
 main.append(el('h2','Шутки и память'),el('p','Миниатюры в уроках — авторские стилизации под школьный анекдот, а не документально установленные советские цитаты. Мнемоники помогают вспомнить правило, но не заменяют объяснение.'));
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
