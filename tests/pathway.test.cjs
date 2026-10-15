const {test}=require('node:test'),assert=require('node:assert/strict');
const P=require('../pathway'),E=require('../engine');
test('preparation has a single ordered route with authored theory and two examples per step',()=>{
 assert.equal(P.steps.length,51);assert.equal(new Set(P.steps.map(s=>s.id)).size,51);
 for(const s of P.steps){assert.equal(s.theory.length,2,s.id);assert.equal(s.examples.length,2,s.id);assert.ok(s.theory.every(t=>t.length>50));assert.ok(s.examples.every(t=>t.trim().length>0));}
 const ids=P.steps.map(s=>s.id);for(const [before,after] of [['count','digits'],['measure','pizza'],['pizza','fraction-sum'],['sets','variable'],['variable','letters'],['letters','equations'],['coordinates','graphs'],['roots','angles'],['angles','trig'],['trig','vectors'],['velocity','acceleration'],['acceleration','euler']])assert.ok(ids.indexOf(before)<ids.indexOf(after));
});
test('all 408 exercise variants can be answered and reject wrong answers',()=>{
 for(const s of P.steps){const keys=new Set();for(let n=2;n<=9;n++){const t=P.generate(s.id,n);keys.add(t.key);assert.ok(t.text&&t.solution&&Number.isFinite(t.answer),s.id);assert.ok(E.check(String(t.answer),t.answer),s.id);assert.ok(!E.check(String(t.answer+1),t.answer),s.id);}assert.equal(keys.size,8);}
 assert.throws(()=>P.generate('missing',2));assert.throws(()=>P.generate('count',0));
});
test('equations, geometry and dynamics satisfy their defining relations',()=>{
 for(let n=2;n<=9;n++){
  const answer=id=>P.generate(id,n).answer;
  assert.equal(2*(answer('undo')+3),2*(n+3));assert.equal(3*answer('both-sides')+2,answer('both-sides')+2*n+2);
  assert.equal(answer('angles')**2,(3*n)**2+(4*n)**2);
  assert.equal(answer('acceleration')*2,2+2*n-2);
  assert.equal(3*answer('force'),3*n);
  assert.equal(answer('euler')-1,n*0.5);
  assert.equal(answer('ready')/3,2*n/2);
 }
 assert.ok(E.check('3/7',P.generate('fraction-sum',4).answer));
 assert.ok(E.check('0,52',P.generate('decimals',5).answer));
});
