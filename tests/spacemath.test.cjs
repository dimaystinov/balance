const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Q=require('../spacemath/quiz-bank'),E=require('../engine');
test('all 75 lesson tests have eight valid variants and independent arithmetic checks',()=>{
 assert.equal(Q.count,75);
 for(let lesson=1;lesson<=75;lesson++)for(let n=2;n<=9;n++){const t=Q.generate(lesson,n);assert.ok(t.text&&t.solution);assert.ok(Number.isFinite(t.answer));assert.ok(E.check(String(t.answer),t.answer));assert.ok(!E.check(String(t.answer+1),t.answer));}
 for(let n=2;n<=9;n++){const answer=i=>Q.generate(i,n).answer;assert.equal(2*answer(48)+3,2*n+3);assert.equal(answer(66)**2,n*n);assert.equal((answer(75)-1)**2,n*n);assert.equal(Math.abs(answer(72))+Math.abs(answer(72)-2),2*n);assert.ok(Math.abs(answer(74))+Math.abs(answer(74)-2)<=2*n);assert.ok(Math.abs(answer(74)+1)+Math.abs(answer(74)-1)>2*n);}
});
test('all static lessons, illustrations and PWA dependencies are local and present',()=>{
 const root=path.resolve('spacemath');
 for(let i=1;i<=75;i++){
  const name=`lesson-${String(i).padStart(2,'0')}.html`,html=fs.readFileSync(path.join(root,name),'utf8');
  assert.ok(html.includes(`data-lesson="${i}"`));assert.ok(html.includes('id="quiz"'));
  for(const [,src] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
   if(src.startsWith('#')||/^https?:/.test(src))continue;
   assert.ok(fs.existsSync(path.join(root,src.split('#')[0])),`${name}: ${src}`);
  }
  assert.ok(!/<(?:iframe|object|embed)\b/i.test(html));assert.ok(!/\son\w+=/i.test(html));
  assert.ok(!/<(?:img|script)[^>]*src="https?:/i.test(html));
 }
 const files=JSON.parse(fs.readFileSync(path.join(root,'offline-files.json')));
 for(const file of files)assert.ok(fs.existsSync(path.join(root,file)),file);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest')));for(const icon of manifest.icons)assert.ok(fs.existsSync(path.join(root,icon.src)));
});
