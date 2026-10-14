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
function navigation(){const nav=$('navigation');nav.replaceChildren();let prev='';lessons.forEach((l,i)=>{if(l.group!==prev){nav.append(el('h3',l.group));prev=l.group;}const a=el('a',`${i+1}. ${l.title}`);a.href='#'+l.id;if(l.id===current?.id){a.classList.add('current');a.setAttribute('aria-current','page');}if(done(l.id))a.classList.add('complete');nav.append(a);});$('overall').textContent=`Пройдено ${lessons.filter(l=>done(l.id)).length} из ${lessons.length} занятий`;}
function render(){
 const id=location.hash.slice(1)||lessons[0].id;
 if(id==='sources'){showSources();return;}
 current=lessons.find(l=>l.id===id)||lessons[0];const l=current,i=lessons.indexOf(l),main=$('lesson');main.replaceChildren();navigation();
 main.append(el('span',`Занятие ${i+1} / ${lessons.length} · ${l.group}`,'badge'),el('h1',l.title),el('p',l.goal,'goal'));
 if(!storageOK)main.append(el('p','Прогресс не сохраняется автоматически. Используйте копию в настройках.'));
 l.theory.forEach(t=>main.append(el('p',t)));main.append(el('h2','Разберём на примерах'));
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
 const joke=el('details'),sum=el('summary','Минутка улыбки');joke.append(sum,el('p',jokes[i%jokes.length]));main.append(joke);
 if(['fractions','reals','measurement'].includes(l.id)){const link=el('a','Дополнительное видео и материалы');link.href='#sources';main.append(link);}
 const nextNav=el('div',undefined,'next');if(i){const a=el('a','← Предыдущее занятие');a.href='#'+lessons[i-1].id;nextNav.append(a);}if(i<lessons.length-1){const a=el('a','Следующее занятие →');a.href='#'+lessons[i+1].id;nextNav.append(a);}else{const a=el('a','Что изучать дальше →');a.href='#sources';nextNav.append(a);}main.append(nextNav);
 updateMastery();newTask();$('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');window.scrollTo(0,0);
}
function updateMastery(){const r=record(current.id);$('mastery').textContent=done(current.id)?'✓ Занятие пройдено. Можно повторять задания.':`Объяснение: ${r.concept?'верно':'пока не выбрано'} · Самостоятельно решено ${Math.min(3,r.solved.length)} из 3`;}
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
function showSources(){current=null;navigation();const main=$('lesson');main.replaceChildren(el('h1','Маршрут Balance'),el('p','24 занятия для ученика, который умеет складывать, вычитать, умножать и делить. Начинать можно примерно с 4-го класса, со взрослым и в собственном темпе. Занятие удобно делить на два подхода по 15–20 минут.'));
 main.append(el('h2','Что будет получаться'),el('p','Называть переменную, выражение, равенство, уравнение и корень; различать семейства чисел; объяснять обратимые преобразования; решать изученные линейные уравнения; выражать буквы из формул; составлять простые модели и проверять единицы.'));
 main.append(el('h2','Как учиться'),el('p','Прочитай правило, объясни три примера своими словами, потренируйся. После нескольких занятий вернись к старой теме без подсказок. Отметка прохождения означает выполнение тренировки, а не гарантию владения всей темой.'));
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
