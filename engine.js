(function(root){
function shuffle(a,rng=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function generate(id,rng=Math.random){
 const n=(lo,hi)=>lo+Math.floor(rng()*(hi-lo+1)),a=n(2,9),b=n(1,12),x=n(1,12),c=n(2,8);
 let text,answer,hint,solution,eq=null;
 const Q=(t,v,h,s)=>{text=t;answer=v;hint=h;solution=s;};
 switch(id){
 case 'variable':Q(`При x = ${x} найди x + ${b}.`,x+b,'Подставь число вместо буквы.',`${x} + ${b} = ${x+b}.`);break;
 case 'expression':Q(`В ${a} коробках по ${x} карандашей. Ещё ${b} лежат отдельно. Сколько всего?`,a*x+b,'Сначала запиши число карандашей в коробках.',`${a} · ${x} + ${b} = ${a*x+b}.`);break;
 case 'order':Q(`Вычисли ${b} + ${a} · ${c}.`,b+a*c,'Умножение выполняется до сложения.',`${b} + ${a*c} = ${b+a*c}.`);break;
 case 'equality':Q(`Впиши число вместо □: ${a} + ${b} = □ + ${c}.`,a+b-c,'Сначала посчитай левую сторону. Обе стороны должны совпасть.',`□ = ${a+b} − ${c} = ${a+b-c}.`);break;
 case 'equation':case 'balance':Q(`Реши x + ${b} = ${x+b}.`,x,'Вычти одинаковое число из обеих частей.',`Вычтем ${b}: x = ${x+b} − ${b} = ${x}. Проверка: ${x} + ${b} = ${x+b}.`);eq={a:1,b,right:x+b};break;
 case 'inverse':Q(`Реши x ÷ ${a} = ${x}.`,a*x,'Как отменить деление на ненулевое число?',`Умножим обе части на ${a}: x = ${a*x}.`);eq={a:1/a,b:0,right:x};break;
 case 'outer':Q(`Реши ${a}(x + ${b}) = ${a*(x+b)}.`,x,'Сначала отмени умножение всего блока, затем сложение.',`Делим обе части на ${a}: x + ${b} = ${x+b}. Вычитаем ${b}: x = ${x}.`);eq={a,b:a*b,right:a*(x+b)};break;
 case 'integers':Q(`Вычисли ${b} − ${b+x}.`,-x,'На числовой прямой двигайся влево.',`От ${b} до 0 — ${b} шагов; ещё ${x} шагов влево: −${x}.`);break;
 case 'fractions':Q(`Реши ${a}x = ${b}. Ответ можно записать дробью.`,b/a,'Раздели обе части на коэффициент при x.',`x = ${b}/${a}. Не округляй: дробь — точный ответ.`);eq={a,b:0,right:b};break;
 case 'reals':Q(`Запиши дробь ${b}/10 десятичным числом.`,b/10,'Деление на 10 сдвигает запятую на один разряд влево.',`${b}/10 = ${String(b/10).replace('.',',')}.`);break;
 case 'distribute':Q(`После раскрытия скобок ${a}(x + ${b}) = ${a}x + □. Найди □.`,a*b,'Множитель относится к каждому слагаемому.',`${a}(x + ${b}) = ${a}x + ${a*b}.`);break;
 case 'collect':Q(`Собери подобные: ${a}x + ${c}x = □x. Найди коэффициент □.`,a+c,'Складываются коэффициенты, буквенная часть остаётся.',`(${a} + ${c})x = ${a+c}x.`);break;
 case 'both':Q(`Реши ${a+c}x + ${b} = ${c}x + ${a*x+b}.`,x,`Вычти ${c}x из обеих частей.`,`${a}x + ${b} = ${a*x+b} → ${a}x = ${a*x} → x = ${x}.`);eq={a:a+c,b,rightA:c,right:a*x+b};break;
 case 'special':Q(`Сколько корней у ${a}x + ${b} = ${a}x + ${b+c}? Введи число.`,0,'Вычти одинаковые члены с x из обеих частей.',`Получается ${b} = ${b+c}, это неверно при любом x. Корней 0.`);break;
 case 'domain':Q(`Какое значение x запрещено в выражении ${a}/(x − ${b})?`,b,'Знаменатель не должен равняться нулю.',`x − ${b} = 0 при x = ${b}. Это значение исключаем.`);break;
 case 'function':Q(`Машина f(x) = ${a}x + ${b} выдала ${a*x+b}. Какое число было на входе?`,x,'Пройди цепочку действий в обратном порядке.',`x = (${a*x+b} − ${b})/${a} = ${x}.`);eq={a,b,right:a*x+b};break;
 case 'formula':Q(`Периметр прямоугольника ${2*(x+b)} см, сторона b = ${b} см. Найди сторону a в см.`,x,'P = 2(a + b). Сначала раздели весь периметр на 2.',`a = P/2 − b = ${x+b} − ${b} = ${x} см.`);break;
 case 'story':Q(`${a} одинаковых тетрадей и обложка за ${b} рублей стоят ${a*x+b} рублей. Сколько рублей стоит одна тетрадь?`,x,'Назови цену тетради x и запиши общую стоимость.',`${a}x + ${b} = ${a*x+b} → ${a}x = ${a*x} → x = ${x} рублей.`);eq={a,b,right:a*x+b};break;
 case 'logic':Q(`Предложи целое число между ${2*a} и ${2*a+2}, которое опровергает фразу «между соседними чётными нет целого числа».`,2*a+1,'Нужен всего один подходящий пример.',`${2*a} < ${2*a+1} < ${2*a+2}. Значит, утверждение неверно.`);break;
 case 'measurement':Q(`Сколько секунд в ${a} мин ${b} с?`,a*60+b,'Одна минута — 60 секунд.',`${a} · 60 + ${b} = ${a*60+b} с.`);break;
 case 'speed':Q(`За ${a} с при равномерном движении пройдено ${a*x} м. Найди скорость в м/с.`,x,'v = s/t. Единицы уже согласованы.',`v = ${a*x}/${a} = ${x} м/с.`);break;
 case 'density':Q(`Масса тела ${a*x} г, объём ${a} см³. Найди плотность в г/см³.`,x,'Плотность — масса единицы объёма: ρ = m/V.',`ρ = ${a*x}/${a} = ${x} г/см³.`);break;
 case 'final':Q(`Реши ${a}(x + ${b}) + ${c} = ${a*(x+b)+c}.`,x,'Отмени внешнее сложение, затем умножение блока, затем сложение внутри.',`−${c}: ${a}(x + ${b}) = ${a*(x+b)}. ÷${a}: x + ${b} = ${x+b}. −${b}: x = ${x}.`);eq={a,b:a*b+c,right:a*(x+b)+c};break;
 default:throw Error('Unknown lesson: '+id);
 }
 return {text,answer,hint,solution,eq,key:id+':'+text};
}
function parseNumber(raw){
 const s=String(raw).trim().replaceAll('−','-').replaceAll(',','.');
 if(!s)return null;
 const atom='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
 if(new RegExp('^'+atom+'$').test(s)){const v=Number(s);return Number.isFinite(v)?v:null;}
 if(new RegExp('^'+atom+'\\s*/\\s*'+atom+'$').test(s)){
  const [a,b]=s.split('/').map(Number);return b!==0&&Number.isFinite(a/b)?a/b:null;
 }return null;
}
function check(raw,answer){const v=parseNumber(raw);return v!==null&&Math.abs(v-answer)<=1e-9*Math.max(1,Math.abs(answer));}
function transform(eq,op,value){
 if(!Number.isFinite(value)||!['add','subtract','multiply','divide'].includes(op))throw Error('Выбери действие и число.');
 if((op==='divide'||op==='multiply')&&value===0)throw Error(op==='divide'?'На ноль делить нельзя.':'Умножение на ноль стирает неизвестное. Выбери обратимое действие.');
 const r={...eq};
 if(op==='add'||op==='subtract'){r.b+=(op==='add'?value:-value);r.right+=(op==='add'?value:-value);}
 else{const k=op==='multiply'?value:1/value;r.a*=k;r.b*=k;r.right*=k;}
 if(![r.a,r.b,r.right].every(Number.isFinite))throw Error('Слишком большое число.');
 return r;
}
const api={generate,shuffle,parseNumber,check,transform};if(typeof module!=='undefined')module.exports=api;else root.BalanceEngine=api;
})(typeof window==='undefined'?globalThis:window);
