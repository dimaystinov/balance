const test=require('node:test'),assert=require('node:assert/strict');
const sessions=require('../sessions.js'),{lessons}=require('../course.js'),E=require('../engine.js');
test('10 sessions cover every existing topic exactly once and preserve progress IDs',()=>{
 assert.equal(sessions.length,10);const ids=sessions.flatMap(s=>s.topics);assert.equal(new Set(ids).size,lessons.length);assert.deepEqual([...ids].sort(),lessons.map(l=>l.id).sort());
 sessions.forEach((s,i)=>{assert.equal(s.id,`session-${i+1}`);assert.ok(s.goal&&s.wonder&&s.solution);assert.equal(s.hints.length,2);assert.ok(Number.isFinite(s.answer));});
});
test('mission answers match independent calculations, including exact fraction',()=>{
 const answers=[3*12+8,19-7,27/3-4,1.5-3/4,20/(8-5),(1/2)**2,(31-3)/4,(102-6)/4,900/75,36/3];
 sessions.forEach((s,i)=>{assert.equal(s.answer,answers[i]);assert.ok(!E.check(String(s.answer+1),s.answer));});assert.ok(E.check('20/3',sessions[4].answer));
});
