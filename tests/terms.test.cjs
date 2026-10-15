const {test}=require('node:test'),assert=require('node:assert/strict');
const T=require('../terms'),{lessons}=require('../course');
test('each core term has a definition, two distinct examples and a supported visual',()=>{
 const kinds=new Set(['flow','tiles','count','line','ruler','balance','fraction','grid','graph','pizza','pizza-pair']);
 for(const [id,t] of Object.entries(T.cards)){
  assert.ok(t.title&&t.definition,id);assert.equal(t.examples.length,2,id);assert.equal(new Set(t.examples).size,2,id);
  assert.ok(kinds.has(t.visual.kind),id);assert.ok(t.visual.items.length>=2,id);
  if(['grid','fraction','pizza'].includes(t.visual.kind)){const [a,b]=t.visual.items.map(Number);assert.ok(Number.isInteger(a)&&Number.isInteger(b)&&a>0&&b>0,id);if(t.visual.kind==='fraction')assert.ok(a<=b,id);}
 }
});
test('all terms are attached to introduction or lesson and every topic is covered',()=>{
 assert.deepEqual(Object.keys(T.sections).sort(),lessons.map(l=>l.id).sort());
 const used=[...T.intro,...T.measurement,...Object.values(T.sections).flat()];
 assert.deepEqual([...new Set(used)].sort(),Object.keys(T.cards).sort());
 for(const id of used)assert.ok(T.cards[id],id);
});
