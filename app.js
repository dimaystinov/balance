(function(){
'use strict';
const {lessons,sources,jokes}=BalanceCourse,R=BalanceRecall,E=BalanceEngine,$=id=>document.getElementById(id),KEY='balance-progress-v1';
let state={},storageOK=true,current=null;
try{state=JSON.parse(localStorage.getItem(KEY)||'{}');if(!validState(state))state={};}catch(e){state={};storageOK=false;}
function validState(s){return s&&typeof s==='object'&&!Array.isArray(s)&&Object.entries(s).every(([id,r])=>(lessons.some(l=>l.id===id)||BalancePathway.steps.some(l=>'path-'+l.id===id))&&r&&typeof r==='object'&&typeof r.concept==='boolean'&&Array.isArray(r.solved)&&r.solved.length<=100&&r.solved.every(x=>typeof x==='string'&&x.length<500)&&R.valid(r.recall));}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;$('storage-message').textContent='Браузер не сохраняет данные. Скачайте копию прогресса перед закрытием.';}}
function record(id){return state[id]||(state[id]={concept:false,solved:[]});}
function done(id){const r=state[id];return !!r?.concept&&r.solved.length>=3&&r.recall?.stage>0;}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
const studyTerms=["Число", "Цифра", "Термин", "Понятие", "Определение", "Величина", "Множество", "элементами", "принадлежит", "Мера", "Измерить величину", "Числовое значение величины", "Числовое значение", "единица измерения", "Счёт", "Единица", "Натуральное число", "Натуральный ряд", "Число и цифра", "Ноль", "Переменная", "значение", "Выражение", "Скобки", "слева направо", "Равенство", "Корень", "Решить уравнение", "Уравнение", "ненулевое число", "обратном порядке", "Внешнее действие", "Целые числа", "Натуральные числа", "Рациональное число", "Рациональные числа", "Иррациональные числа", "Действительные числа", "числитель", "знаменатель", "коэффициенты", "Подобные слагаемые", "допустимые значения", "аргумент", "Функция", "формула", "контрпример", "Доказательство", "Измерить", "Скорость", "Плотность", "масса", "объём", "единицы измерения", "проверка", "делить нельзя"];
const studyFormulas={"numbers": ["Запись числа", "303 = 3 · 100 + 0 · 10 + 3"], "variable": ["Подстановка", "x = 4  ⇒  x + 3 = 4 + 3 = 7"], "expression": ["Буквенная запись", "3x означает 3 · x"], "order": ["Порядок действий", "Скобки → умножение и деление → сложение и вычитание"], "equality": ["Равные значения", "3 + 4 = 10 − 3 = 7"], "equation": ["Проверка корня", "x + 4 = 9;  x = 5:  5 + 4 = 9"], "balance": ["Правило", "Одинаковое обратимое действие — с обеими частями равенства."], "inverse": ["Обратные действия", "+ a ↔ − a;    × a ↔ ÷ a  при a ≠ 0"], "outer": ["Обратный порядок", "3(x + 2) = 21 → x + 2 = 7 → x = 5"], "integers": ["Целые числа", "…, −3, −2, −1, 0, 1, 2, 3, …"], "fractions": ["Рациональное число", "a/b;  a и b — целые, b ≠ 0"], "reals": ["Точная запись и приближение", "1/4 = 0,25;    √2 ≈ 1,414"], "distribute": ["Распределительное свойство", "a(b + c) = ab + ac"], "collect": ["Подобные слагаемые", "ax + bx = (a + b)x"], "both": ["Преобразование", "5x + 2 = 2x + 14 → 3x = 12 → x = 4"], "special": ["Число решений", "0x = 0 — любое допустимое x;  0x = 5 — корней нет."], "domain": ["Ограничение", "1/(x − 2) определено при x ≠ 2"], "function": ["Функциональная зависимость", "x → f(x): каждому допустимому x — ровно одно значение."], "formula": ["Выражение неизвестной величины", "s = vt → t = s/v  при v ≠ 0"], "story": ["Порядок решения", "Величины → уравнение → преобразования → проверка"], "logic": ["Контрпример", "(1/2)² = 1/4 < 1/2"], "measurement": ["Единицы", "1 мин = 60 с;    1 м = 100 см"], "speed": ["Равномерное движение", "v = s/t;    s = vt;    t > 0"], "density": ["Однородное вещество", "ρ = m/V;    m = ρV;    V > 0"], "final": ["Проверка", "Подстановка → единицы → соответствие условию"]};

function studyText(text){
 const paragraph=el('p'),pattern=new RegExp('(?<![\\p{L}])('+studyTerms.join('|')+')(?![\\p{L}])','giu');let from=0;
 for(const match of text.matchAll(pattern)){paragraph.append(document.createTextNode(text.slice(from,match.index)),el('strong',match[0]));from=match.index+match[0].length;}
 paragraph.append(document.createTextNode(text.slice(from)));return paragraph;
}
const nextCourseURL='materials/python-physics-program.pdf';
function nextCourse(main,full=false){
 const box=el('section',undefined,'course-continuation');box.append(el(full?'h2':'h3','Следующий курс — программирование физических процессов на Python'));
 box.append(el('p','Здесь вы изучаете числа, выражения, уравнения и формулы. Дальше будете записывать физические законы на Python, строить графики движения и проверять модели по экспериментальным данным.'));
 if(full){const list=el('ul');[
 'Переменные и выражения → расчёт физических величин в программе.',
 'Преобразование уравнений → выражение неизвестной величины из закона.',
 'Функции → таблицы и графики x(t), v(t), a(t).',
 'Единицы и проверка ответа → проверка результатов моделирования.'
 ].forEach(text=>list.append(el('li',text)));box.append(list,el('p','Следующая программа рассчитана на 102 часа. Для неё также понадобятся основы Python, векторы, тригонометрия и начальные представления о скорости изменения. Этот курс даёт арифметическую и алгебраическую основу; оставшиеся темы нужно разобрать перед соответствующими разделами.','help'));}
 const link=el('a','Программа следующего курса (PDF)');link.href=nextCourseURL;link.target='_blank';link.rel='noopener noreferrer';box.append(link);main.append(box);
}

function sessionDone(s){return s.topics.every(done);}
function navigation(){
 const nav=$('navigation');nav.replaceChildren();const legacy=location.hash.startsWith('#session-');
 const items=legacy?BalanceSessions:BalancePathway.steps;
 items.forEach((item,i)=>{const a=el('a',`${i+1}. ${item.title}`);a.href=legacy?'#'+item.id:'#step-'+(i+1);if(location.hash===a.getAttribute('href')){a.classList.add('current');a.setAttribute('aria-current','page');}if(legacy?sessionDone(item):pathDone(item))a.classList.add('complete');nav.append(a);});
 const selected=nav.querySelector('[aria-current="page"]');if(selected)nav.scrollTop=Math.max(0,selected.offsetTop-nav.offsetTop-nav.clientHeight/2);
 $('overall').textContent=legacy?`Пройдено ${BalanceSessions.filter(sessionDone).length} из 10 прежних занятий`:`Шагов с выполненной практикой: ${BalancePathway.steps.filter(pathDone).length} из ${BalancePathway.steps.length}`;
}
function termDiagram(v,title){
 const figure=el('figure',undefined,'term-diagram');figure.setAttribute('aria-label','Схема: '+title);
 if(v.kind==='pizza-pair'){
  figure.classList.add('pizza-pair');v.items.forEach(value=>figure.append(termDiagram({kind:'pizza',items:value.split('/')},value+' пиццы')));return figure;
 }
 if(v.kind==='flow'||v.kind==='tiles'){
  const row=el('div',undefined,'term-flow');v.items.forEach((text,i)=>{if(i&&v.kind==='flow'){const arrow=el('span','→','term-arrow');arrow.setAttribute('aria-hidden','true');row.append(arrow);}row.append(el('span',text,'term-node'));});figure.append(row);
 }else{
  const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox',v.kind==='pizza'?'0 0 420 240':'0 0 420 135');svg.setAttribute('role','img');svg.setAttribute('aria-label',title+': '+v.items.join(', '));
  function shape(tag,attrs,text){const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,val])=>n.setAttribute(k,val));if(text)n.textContent=text;svg.append(n);return n;}
  const line=(x1,y1,x2,y2)=>shape('line',{x1,y1,x2,y2,stroke:'#326c9c','stroke-width':2});
  const text=(x,y,t)=>shape('text',{x,y,fill:'#19334b','font-size':17,'text-anchor':'middle'},t);
  if(v.kind==='pizza'){
   const [a,b]=v.items.map(Number),cx=210,cy=100,r=78;
   shape('circle',{cx,cy,r:r+5,fill:'#d99c58'});
   for(let i=0;i<b;i++){
    const start=-Math.PI/2+i*2*Math.PI/b,end=start+2*Math.PI/b;
    const x1=cx+r*Math.cos(start),y1=cy+r*Math.sin(start),x2=cx+r*Math.cos(end),y2=cy+r*Math.sin(end);
    shape('path',{d:`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${end-start>Math.PI?1:0} 1 ${x2} ${y2} Z`,fill:i<a?'#f4ce71':'#f2eee7',stroke:'#a66a32','stroke-width':2});
    if(i<a){const mid=(start+end)/2;shape('circle',{cx:cx+46*Math.cos(mid),cy:cy+46*Math.sin(mid),r:8,fill:'#c76b4f'});}
   }
   text(210,207,`${a}/${b} пиццы`);text(210,231,`Выделено ${a} из ${b} равных кусков`);
  }
  if(v.kind==='count'){for(let i=0;i<3;i++){shape('circle',{cx:100+i*70,cy:30,r:13,fill:'#326c9c'});shape('rect',{x:87+i*70,y:66,width:26,height:26,fill:'#77a8c4'});}text(210,126,'3 кружка и 3 квадрата');}
  if(v.kind==='fraction'){const [a,b]=v.items.map(Number),w=320/b;for(let i=0;i<b;i++)shape('rect',{x:50+i*w,y:28,width:w,height:48,fill:i<a?'#77a8c4':'#fff',stroke:'#326c9c','stroke-width':2});text(210,112,`${a} из ${b} равных частей: ${a}/${b}`);}
  if(v.kind==='line'||v.kind==='ruler'){line(40,60,380,60);v.items.forEach((t,i)=>{const x=40+i*340/(v.items.length-1);line(x,50,x,70);text(x,96,t);});if(v.kind==='ruler'){line(40,25,380,25);text(210,124,'Длина отрезка: 3 см');}else shape('path',{d:'M370 53 L382 60 L370 67',fill:'none',stroke:'#326c9c','stroke-width':2});}
  if(v.kind==='balance'){line(60,55,360,55);shape('path',{d:'M210 57 L190 112 L230 112 Z',fill:'#77a8c4'});[110,310].forEach(x=>{line(x,55,x,85);line(x-50,85,x+50,85);});text(110,39,v.items[0]);text(310,39,v.items[1]);text(210,132,'Одинаковые значения');}
  if(v.kind==='graph'){line(75,110,340,110);line(75,110,75,10);text(350,115,'x');text(60,17,'y');for(let i=0;i<=2;i++)text(75+i*100,130,String(i));for(let i=1;i<=4;i++)text(55,114-i*22,String(i));line(75,66,275,22);[[75,66],[175,44]].forEach(([x,y])=>shape('circle',{cx:x,cy:y,r:5,fill:'#326c9c'}));text(290,65,'y = x + 2');}
  if(v.kind==='triangle'){line(110,100,290,100);line(110,100,110,10);line(110,10,290,100);line(110,87,123,87);line(123,87,123,100);text(95,60,'3');text(200,125,'4');text(220,45,'5');}
  if(v.kind==='vector'){line(80,100,330,100);line(80,100,80,10);line(80,100,260,30);shape('path',{d:'M245 30 L260 30 L251 43',fill:'none',stroke:'#326c9c','stroke-width':3});shape('path',{d:'M80 30 L260 30 L260 100',fill:'none',stroke:'#77a8c4','stroke-dasharray':'5 5'});text(170,124,'x = 3');text(45,60,'y = 4');text(250,20,'(3, 4)');}
  if(v.kind==='split-grid'){for(let y=0;y<3;y++)for(let x=0;x<5;x++)shape('rect',{x:135+x*30,y:5+y*30,width:30,height:30,fill:x<2?'#9ecae4':'#f4ce71',stroke:'#fff','stroke-width':2});text(165,121,'3 · 2 = 6');text(245,121,'3 · 3 = 9');}
  if(v.kind==='grid'){const [w,h]=v.items.map(Number),size=25,x0=210-w*size/2;for(let y=0;y<h;y++)for(let x=0;x<w;x++)shape('rect',{x:x0+x*size,y:10+y*size,width:size,height:size,fill:'#dcebf5',stroke:'#326c9c'});text(210,122,`${w} × ${h} = ${w*h} клеток`);}
  figure.append(svg);
 }
 return figure;
}
const shownTerms=new Set();
function termCards(host,ids){
 ids=ids.filter(id=>!shownTerms.has(id));if(!ids.length)return;ids.forEach(id=>shownTerms.add(id));
 const group=el('div',undefined,'term-cards');ids.forEach(id=>{const t=BalanceTerms.cards[id],card=el('section',undefined,'term-card');card.dataset.term=id;card.append(el('h3',t.title),el('p',t.definition,'term-definition'),termDiagram(t.visual,t.title));const list=el('ul',undefined,'term-examples');t.examples.forEach(text=>list.append(el('li',text)));card.append(list);if(id==='fraction'){card.append(el('p','Куски должны быть равными, а пиццы для сравнения — одинакового размера. Половина большой пиццы и половина маленькой — разное количество еды.'));}group.append(card);});host.append(group);
}

function explainConcepts(main, practice=false){
 const section=el('section',undefined,'textbook-section');section.append(el('h2','Термины и понятия'));
 termCards(section,BalanceTerms.intro);
 const check=el('details');check.append(el('summary','Как проверить понимание'),el('p','Закрой определение. Объясни термин своими словами, приведи свой пример и случай, который под определение не подходит. Обоснуй одно действие с этим понятием. Если не получается, вернись к определению.'));section.append(check);
 if(practice){section.append(el('h3','Рассуждение по условию'),el('p','По условию все стержни в наборе имеют длину 5 см. Стержень A принадлежит этому набору. Какова его длина?'));
 const choices=el('div',undefined,'choices'),feedback=el('p',undefined,'feedback');feedback.setAttribute('role','status');
 E.shuffle([{text:'5 см — следует из условия',ok:true,why:'Верно. Общее условие относится и к стержню A. Для вывода не нужно видеть набор. Соответствует ли условие настоящему набору — отдельный вопрос, который проверяют измерением.'},{text:'Нельзя ответить, пока не увижу стержень',ok:false,why:'В задаче длина всех стержней уже задана. Примени это условие к A. Измерение потребуется, чтобы проверить реальный набор.'},{text:'5 см у любого стержня вообще',ok:false,why:'Условие относится только к этому набору. Для других стержней такой длины не задано.'}]).forEach(o=>{const b=el('button',o.text);b.onclick=()=>{feedback.textContent=o.why;feedback.className='feedback '+(o.ok?'good':'bad');};choices.append(b);});section.append(choices,feedback);}
 main.append(section);
}
function showSession(s){current=null;navigation();const main=$('lesson'),number=BalanceSessions.indexOf(s)+1;
 main.replaceChildren(el('span',`Занятие ${number} из 10`,'badge'),el('h1',s.title));
 if(number===1){const lead=el('p','Арифметическая и алгебраическая основа для курса ', 'course-lead'),link=el('a','«Программирование физических процессов на Python»');link.href=nextCourseURL;link.target='_blank';link.rel='noopener noreferrer';lead.append(link,document.createTextNode('.'));main.append(lead);}
 if(number===1)explainConcepts(main);
 const route=BalanceSessions.flatMap(session=>session.topics);
 s.topics.forEach(id=>{
  const l=lessons.find(topic=>topic.id===id),section=el('section',undefined,'textbook-section');
  section.append(el('h2','§ '+(route.indexOf(id)+1)+'. '+l.title));
  termCards(section,BalanceTerms.sections[id]);
  if(id==='distribute'){
   section.append(el('h3','Почему умножаем каждое слагаемое'),el('p','В каждом из трёх рядов — 2 синие и 3 жёлтые клетки. Посчитаем все клетки двумя способами.'),termDiagram({kind:'split-grid',items:['3 ряда','2 синие и 3 жёлтые клетки в каждом ряду']},'3 · (2 + 3) = 3 · 2 + 3 · 3'));
   section.append(el('p','По рядам: 3 · (2 + 3) = 15. По цветам: 3 · 2 + 3 · 3 = 6 + 9 = 15. Клетки те же — меняется только способ подсчёта.'));
   const proof=el('div',undefined,'formula-box');proof.append(el('span','Вывод для трёх одинаковых сумм','study-label'));['3(b + c) = (b + c) + (b + c) + (b + c)','= (b + b + b) + (c + c + c)','= 3b + 3c'].forEach(t=>proof.append(el('p',t,'formula-text')));section.append(proof,el('p','Перестановка и группировка слагаемых не меняют сумму. В каждой скобке есть и b, и c, поэтому каждое повторяется три раза. Так же рассуждаем при любом натуральном множителе: сколько скобок, столько раз берём каждое слагаемое.'),el('p','Например: 3(x + 2) = x + 2 + x + 2 + x + 2 = 3x + 6. Запись 3x + 2 неверна: в ней учтена только одна двойка вместо трёх.'));
  }
  l.theory.forEach((text,index)=>{const paragraph=studyText(text);if(index===0){const definition=el('div',undefined,'definition');definition.append(el('span','Основное','study-label'),paragraph);section.append(definition);}else section.append(paragraph);});
  const formula=studyFormulas[id];if(formula){const box=el('div',undefined,'formula-box');box.append(el('span',formula[0],'study-label'),el('p',formula[1],'formula-text'));section.append(box);}
  if(l.referenceTheory){const reference=el('details');reference.append(el('summary','Дополнение: виды чисел'));l.referenceTheory.forEach(text=>reference.append(studyText(text)));section.append(reference);}
  if(l.measurement){section.append(el('h3','Счёт и измерение'));termCards(section,BalanceTerms.measurement);l.measurement.forEach(text=>section.append(studyText(text)));const box=el('div',undefined,'formula-box');box.append(el('span','Одна длина — разные единицы','study-label'),el('p','2 м = 200 см','formula-text'),studyText(l.measurementExample));section.append(box);}
  section.append(el('h3','Примеры'));const examples=el('ol',undefined,'examples');l.examples.forEach((text,index)=>{const item=el('li');text.split(/ → |(?<=[.!?])\s+(?=[А-ЯЁ])/u).forEach(step=>item.append(studyText(step)));item.append(el('span','Почему так','study-label'),studyText(BalanceReasoning.examples[id][index]));examples.append(item);});section.append(examples);
  if(id==='balance')makeBalance(section);addPractice(section,l);main.append(section);
 });
 main.append(el('h2','Упражнение к занятию'),el('p',s.question));
 const form=el('form',undefined,'answer-form'),label=el('label','Ответ'),input=el('input');input.autocomplete='off';label.append(input);const check=el('button','Проверить','primary');check.type='submit';form.append(label,check);const feedback=el('p',undefined,'feedback');feedback.setAttribute('role','status');main.append(form,feedback);
 let hintIndex=0;const hint=el('button','Подсказка');hint.type='button';hint.onclick=()=>{feedback.textContent=s.hints[Math.min(hintIndex++,s.hints.length-1)];feedback.className='feedback';};main.append(hint);
 const solution=el('details');solution.append(el('summary','Разбор по шагам'));const steps=el('ol',undefined,'examples');BalanceReasoning.sessions[s.id].steps.forEach(step=>{const item=el('li');item.append(el('p',step.statement,'formula-text'),studyText(step.reason));steps.append(item);});solution.append(steps);main.append(solution);addSessionReasoning(main,s);
 form.onsubmit=e=>{e.preventDefault();if(E.parseNumber(input.value)===null){feedback.textContent='Введи число или дробь, например 20/3.';return;}const ok=E.check(input.value,s.answer);feedback.className='feedback '+(ok?'good':'bad');feedback.textContent=ok?'Числовой ответ верен. Теперь объясни ход решения и проверь обоснование ниже.':'Ответ не сходится. Проверь вычисления или открой подсказку.';};
 main.append(el('h2','Вопросы для повторения'),el('p',s.wonder));
 if(number===10)nextCourse(main,true);
 const next=el('a',number<10?'Следующее занятие →':'Повторить маршрут →');next.href='#'+BalanceSessions[number%10].id;main.append(next);$('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');window.scrollTo(0,0);
}
function addSessionReasoning(main,s){
 const data=BalanceReasoning.sessions[s.id],section=el('section',undefined,'practice');section.dataset.reasoning=s.id;
 section.append(el('h3','Объясни решение'),el('p','Что означают величины и обозначения? Почему выбраны эти действия? Как проверить ответ? Запиши объяснение или произнеси его вслух перед разбором.'));
 const label=el('label','Моё объяснение'),input=el('textarea');input.rows=3;input.setAttribute('aria-label','Объяснение: '+s.title);label.append(input);section.append(label);
 section.append(el('h3','Проверь обоснование'),el('p',data.check.question));
 const choices=el('div',undefined,'choices'),feedback=el('p',undefined,'feedback');feedback.setAttribute('role','status');
 E.shuffle(data.check.options.map((text,index)=>({text,index}))).forEach(o=>{const button=el('button',o.text);button.onclick=()=>{const ok=o.index===data.check.correct;feedback.textContent=(ok?'Верно. ':'Нет. ')+data.check.why;feedback.className='feedback '+(ok?'good':'bad');};choices.append(button);});section.append(choices,feedback);
 section.append(el('h3','Если изменить условие'),el('p',data.transfer.question));const compare=el('details');compare.append(el('summary','Сравнить с объяснением'),el('p',data.transfer.answer));section.append(compare,el('p','Выбор ответа проверяется автоматически. Свой ход рассуждений сравни с разбором или обсуди с преподавателем.','help'));main.append(section);
}
function pathRecord(id){return record('path-'+id);}
function pathDone(s){return (state['path-'+s.id]?.solved.length||0)>=3;}
function showStep(index){
 const s=BalancePathway.steps[index];current=null;navigation();const main=$('lesson');
 main.replaceChildren(el('span',`Шаг ${index+1} из ${BalancePathway.steps.length}`,'badge'),el('h1',s.title));
 const theory=el('section',undefined,'step-theory');theory.append(el('h2','Определение и свойство'));s.theory.forEach(t=>theory.append(studyText(t)));main.append(theory);
 const visuals={angles:{kind:'triangle',items:['катеты 3 и 4','гипотенуза 5']},trig:{kind:'triangle',items:['катеты 3 и 4','гипотенуза 5']},vectors:{kind:'vector',items:['3 вправо','4 вверх']},coordinates:{kind:'vector',items:['точка (3, 4)','начало (0, 0)']},count:{kind:'count',items:['3 кружка','3 квадрата']},digits:{kind:'flow',items:['204','2 сотни + 0 десятков + 4 единицы','200 + 4']},sum:{kind:'flow',items:['4 + 3 = 7','7 − 3 = 4']},product:{kind:'grid',items:['4','3']},laws:{kind:'split-grid',items:['3 ряда','2 синие + 3 жёлтые']},measure:{kind:'ruler',items:['0','1','2','3']},pizza:{kind:'pizza-pair',items:['1/2','3/4']},'equal-fractions':{kind:'pizza-pair',items:['1/2','2/4']},'fraction-sum':{kind:'pizza-pair',items:['1/4','3/4']},negative:{kind:'line',items:['−3','−2','−1','0','1','2','3']},equations:{kind:'balance',items:['x + 3','8']},expand:{kind:'split-grid',items:['3 ряда','2 + 3']},geometry:{kind:'grid',items:['4','3']},functions:{kind:'graph',items:['x','y = x + 2']},graphs:{kind:'graph',items:['x','y = x + 2']},velocity:{kind:'flow',items:['1 с → 2 м','2 с → 4 м','3 с → 6 м']},euler:{kind:'flow',items:['Старые x, v, a','Прибавить изменения за Δt','Новые x, v']}};
 if(visuals[s.id]){if(s.id==='functions'||s.id==='graphs')main.append(el('p','Ещё один пример: график y = x + 2.'));main.append(termDiagram(visuals[s.id],s.title));}
 main.append(el('h2','Примеры'));const examples=el('ol',undefined,'examples');s.examples.forEach(t=>{const li=el('li');li.append(studyText(t));examples.append(li);});main.append(examples);
 if(s.enrichment){
  const e=s.enrichment,box=el('section',undefined,'savvateev-note');box.append(el('h2',e.title));
  e.paragraphs.forEach(t=>box.append(el('p',t)));box.append(el('pre',e.visual));
  box.append(el('h3','Разберись на примере'),el('p',e.question));const answer=el('details');answer.append(el('summary','Сравнить с объяснением'),el('p',e.answer));box.append(answer);
  const credit=el('p',undefined,'help'),link=el('a','Алексей Савватеев · 100 уроков математики');link.href=e.source;credit.append('Самостоятельный разбор темы курса: ',link);box.append(credit);main.append(box);
 }
 addPathPractice(main,s);
 if(s.id==='equations')makeBalance(main);
 if(s.id==='ready'){
  main.append(el('h2','Проверка основных тем'),el('p','Реши по одной задаче из каждой темы. Числовые ответы проверяются автоматически. Ход решения объясни своими словами и сравни с разбором.'));
  ['fraction-sum','letters','undo','formulas','graphs','trig','vectors','acceleration','euler','data','python'].forEach(id=>{const topic=BalancePathway.steps.find(t=>t.id===id);const box=el('details');box.append(el('summary',topic.title));addPathPractice(box,topic);main.append(box);});
  nextCourse(main,true);
 }
 const links=el('div',undefined,'step-links');if(index>0){const prev=el('a','← Предыдущий шаг');prev.href='#step-'+index;links.append(prev);}if(index+1<BalancePathway.steps.length){const next=el('a','Следующий шаг →');next.href='#step-'+(index+2);links.append(next);}main.append(links);
 $('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');window.scrollTo(0,0);
}
function addPathPractice(host,s){
 const box=el('section',undefined,'practice');box.dataset.path=s.id;box.append(el('h2',host.id==='lesson'?'Попробуй сам':s.title));
 const status=el('p',undefined,'help'),question=el('p'),form=el('form',undefined,'answer-form'),label=el('label','Ответ'),input=el('input'),button=el('button','Проверить','primary'),feedback=el('p',undefined,'feedback');
 input.autocomplete='off';input.setAttribute('aria-label','Ответ: '+s.title);button.type='submit';label.append(input);form.append(label,button);feedback.setAttribute('role','status');
 const explain=el('details');explain.append(el('summary','Разбор'));const solution=el('p');explain.append(solution);
 const next=el('button','Другая задача');let task,variant=0,helped=false,answered=false;
 function progress(){status.textContent=`Самостоятельно решено: ${Math.min(3,pathRecord(s.id).solved.length)} из 3 разных вариантов`;navigation();}
 function renew(){const choices=Array.from({length:8},(_,i)=>i+2).filter(n=>n!==variant&&!pathRecord(s.id).solved.includes(s.id+':'+n));variant=choices.length?choices[Math.floor(Math.random()*choices.length)]:(variant===9?2:variant+1||2);task=BalancePathway.generate(s.id,variant);helped=false;answered=false;explain.open=false;question.textContent=task.text;input.value='';feedback.textContent='';solution.textContent=task.solution;progress();}
 explain.addEventListener('toggle',()=>{if(explain.open)helped=true;});next.onclick=renew;
 form.onsubmit=e=>{e.preventDefault();if(E.parseNumber(input.value)===null){feedback.textContent='Введи число или дробь, например 3/4.';return;}const ok=E.check(input.value,task.answer);feedback.className='feedback '+(ok?'good':'bad');if(ok){if(!helped&&!answered&&!pathRecord(s.id).solved.includes(task.key)){pathRecord(s.id).solved.push(task.key);pathRecord(s.id).concept=true;save();}answered=true;feedback.textContent=(helped?'Верно. Для самостоятельной проверки возьми другую задачу. ':'Верно. ')+task.solution;}else feedback.textContent='Ответ не совпал. Проверь выбранное действие и вычисления. Можно открыть разбор.';progress();};
 box.append(status,question,form,feedback,explain,next);host.append(box);renew();
}

function render(){
 shownTerms.clear();
 if(!location.hash){location.replace('spacemath/index.html');return;}
 const id=location.hash.slice(1)||'method';
 if(/^step-\d+$/.test(id)){const i=Number(id.slice(5))-1;if(BalancePathway.steps[i]){showStep(i);return;}}
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
 function progress(){const r=record(l.id);mastery.textContent=`Вопрос по теме: ${r.concept?'верно':'не проверено'} · Задачи: ${Math.min(3,r.solved.length)} из 3 · Термины: ${r.recall?.stage>0?'проверены самостоятельно':'не проверены'}`;navigation();}
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
 main.replaceChildren(el('span','Введение','badge'),el('h1','Как учиться'),el('p','51 шаг: от числа и четырёх действий — к формулам, графикам и расчёту движения. Бумага и карандаш нужны для схем и вычислений.'));
 const approach=el('div',undefined,'definition');approach.append(el('span','Математика и обучение','study-label'),el('p','Математика не сводится к готовым алгоритмам. Это поиск связей, способов решения и доказательств.'));
 const startTop=el('a','Полный текст Spacemath и тесты →','start-step');startTop.href='spacemath/index.html';main.append(startTop);
 main.append(approach,el('p','Понимание заменяет зубрёжку. Решения задач курса выводятся из нескольких простых правил.'),el('p','Перед решением: что известно? Что требуется найти? Как связаны величины?'));
 main.append(el('h2','Для чего нужна математика'));
 const uses=el('ul');[
 'Составлять расчёт: от условия — к уравнению.',
 'Обосновывать решение: от определения — к выводу.',
 'Проверять результат: по условию, единицам и измерениям.'
 ].forEach(text=>uses.append(el('li',text)));main.append(uses);
 const purpose=el('div',undefined,'formula-box');purpose.append(el('span','Пример: одинаковые группы','study-label'),el('p','Разложи 12 карандашей в три группы по четыре. Всего: 4 + 4 + 4 = 12.'),el('p','Три одинаковых слагаемых можно записать короче: 4 · 3 = 12. Умножение здесь заменяет сложение.'),el('p','Проверка: пересчитай карандаши по одному. Получится то же число.'));main.append(purpose);
 nextCourse(main);
 explainConcepts(main,true);
 BalanceReading.method.forEach(([title,text],i)=>main.append(el('h2',(i+1)+'. '+title),el('p',text)));
 main.append(el('h2','Письмо и запоминание'),el('p','Записывай по памяти короткое определение, собственный пример и объяснение шага. Рисуй схемы и подписывай величины. Затем сверяй и исправляй. Переписывание готового текста само по себе не показывает понимания; если писать рукой неудобно, используй клавиатуру или объясни вслух.'),el('p','Каждая тема требует верного объяснения, трёх разных самостоятельных решений и самопроверки терминов. Неясный термин разбери до перехода к задаче, где он нужен. Повторяй объяснение и решай новые задачи через несколько дней.'));
 main.append(el('h2','Проверь понимание'),el('p','К трём группам по 4 карандаша добавили ещё одну такую же группу. Сколько карандашей стало?'));
 const choices=el('div',undefined,'choices'),feedback=el('p',undefined,'feedback');feedback.setAttribute('role','status');
 E.shuffle([{text:'16 карандашей',ok:true,why:'Добавили 4 карандаша: 12 + 4 = 16. Теперь четыре группы по четыре: 4 · 4 = 16.'},{text:'13 карандашей',ok:false,why:'Добавили одну группу, а в ней четыре карандаша. К 12 прибавляется 4, а не 1.'},{text:'12 карандашей',ok:false,why:'12 карандашей было в трёх группах. К ним добавили ещё четыре.'}]).forEach(o=>{const button=el('button',o.text);button.onclick=()=>{feedback.textContent=o.why;feedback.className='feedback '+(o.ok?'good':'bad');};choices.append(button);});main.append(choices,feedback);
 main.append(el('p','В трёх группах 4, 4 и 2 карандаша. Можно ли посчитать их как 4 · 3?'));
 const compareGroups=el('details');compareGroups.append(el('summary','Объяснение'),el('p','Нет. Запись 4 · 3 означает три группы по четыре. Здесь в одной группе только два карандаша: 4 + 4 + 2 = 10.'));main.append(compareGroups);
 const sources=el('details');sources.append(el('summary','О методе и источниках'),el('p','В описании технологии обучения Л. Рона Хаббарда выделены три препятствия: отсутствие предмета или его модели («массы»), пропущенные ступени обучения и непонятые слова. Здесь эти идеи адаптированы к математике. «Масса» в этом смысле — не объём знаний.'),el('p','Утверждения об универсальности системы и физиологических причинах трудностей не принимаются за установленные факты. Самостоятельная практика, повторение с интервалами и сочетание примеров с задачами отдельно описаны в исследовательском руководстве IES.'));
 [['Описание технологии обучения Хаббарда','https://www.lronhubbard.ru/ron-series/profile/humanitarian/education/study-technology.html'],['IES: организация обучения и самостоятельной работы','https://ies.ed.gov/ncee/wwc/PracticeGuide/1'],['Дмитрий Михайлов: понимание перед действиями (0:53–4:49)','https://www.youtube.com/watch?v=UM4SRQsIqok&t=53s'],['Борис Трушин: для чего нужна математика (0:37–13:10)','https://www.youtube.com/watch?v=uNEIpsPKA6k&t=37s'],['Понятия и рассуждение по условию (0:00–2:22; 27:29–29:58)','https://www.youtube.com/watch?v=mUT-BSx_gHA']].forEach(([title,url])=>{const a=el('a',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';const line=el('p');line.append(a);sources.append(line);});main.append(sources);
 const research=el('details');research.append(el('summary','Исследования письма и памяти'),el('p','Письмо и рисунок могут помогать организовать материал. Но различия ЭЭГ не доказывают улучшение памяти в пять раз. Безошибочный ответ сегодня не гарантирует сохранения через год. Поэтому здесь есть самостоятельное воспроизведение и повторение через время.'));
 [['Письмо и связность ЭЭГ (2024)','https://doi.org/10.3389/fpsyg.2023.1219945'],['Ограничения исследования письма (2025)','https://doi.org/10.3389/fpsyg.2024.1517235'],['Повторное воспроизведение (2008)','https://doi.org/10.1126/science.1152408'],['Распределённая практика математических задач (2006)','https://doi.org/10.1002/acp.1266'],['Рисунки и запоминание (2016)','https://uwspace.uwaterloo.ca/items/a8b52734-18f3-4527-8be2-008a105c85f2']].forEach(([title,url])=>{const a=el('a',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';const line=el('p');line.append(a);research.append(line);});main.append(research);
 const start=el('a','Шаг 1. Число и единица →');start.href='#step-1';main.append(start);
 $('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');window.scrollTo(0,0);
}
function showSources(){current=null;navigation();const main=$('lesson');main.replaceChildren(el('h1','Маршрут Balance'),el('p','51 последовательный шаг для подготовки к началу курса «Программирование физических процессов на Python». Число шагов определено темами: арифметика, алгебра, функции, геометрия, векторы и основы численного расчёта. Это не замена полного школьного курса физики или обучения Python.'));
 main.append(el('h2','Что будет получаться'),el('p','Называть переменную, выражение, равенство, уравнение и корень; различать семейства чисел; объяснять обратимые преобразования; решать изученные линейные уравнения; выражать буквы из формул; составлять простые модели и проверять единицы.'));
 main.append(el('h2','Как учиться'),el('p','Прочитай правило, объясни три примера своими словами, потренируйся. После нескольких занятий вернись к старой теме без подсказок. Отметка прохождения означает выполнение тренировки, а не гарантию владения всей темой.'));
 const structure=el('p','Постепенная подача — по образцу '),space=el('a','Spacemath');space.href='https://spacemath.xyz/';structure.append(space,document.createTextNode('. Определения и свойства — с опорой на арифметику и алгебру Киселёва. Текст, примеры и упражнения написаны для Balance.'));main.append(structure);
 const archive=el('details');archive.append(el('summary','Прежний курс: 10 занятий'));BalanceSessions.forEach((x,i)=>{const p=el('p'),a=el('a',`${i+1}. ${x.title}`);a.href='#'+x.id;p.append(a);archive.append(p);});main.append(archive);
 addReading(main);
 main.append(el('h2','Материалы для любопытных'));const ul=el('ul',undefined,'sources');sources.forEach(s=>{const li=el('li'),a=el('a',s.title);a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,el('p',s.text));ul.append(li);});main.append(ul,el('p','Уроки, примеры и упражнения Balance написаны отдельно. Видеоуроки не скопированы. Курс Савватеева — дополнительное углубление, а не последовательность обязательных заданий для начинающего.'));
 main.append(el('h2','Память и понимание'),el('p','В каждой теме есть определение, вопрос на применение и смысловая опора для запоминания. Сначала ответь по памяти, затем сравни и повтори через время.'));
 nextCourse(main,true);window.scrollTo(0,0);
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
