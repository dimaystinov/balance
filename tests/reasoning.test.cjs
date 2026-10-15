const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const R=require('../reasoning'),{lessons}=require('../course'),sessions=require('../sessions');
test('every example and every session has a matching explanation and transfer question',()=>{
 assert.deepEqual(Object.keys(R.examples).sort(),lessons.map(l=>l.id).sort());
 for(const l of lessons){assert.equal(R.examples[l.id].length,l.examples.length);R.examples[l.id].forEach(text=>assert.ok(text.trim().length>30,l.id));}
 assert.deepEqual(Object.keys(R.sessions).sort(),sessions.map(s=>s.id).sort());
 for(const s of sessions){const r=R.sessions[s.id];assert.equal(r.steps.length,4);r.steps.forEach(step=>assert.ok(step.statement&&step.reason));assert.equal(new Set(r.check.options).size,3);assert.ok(r.check.options[r.check.correct]);assert.ok(r.check.why&&r.transfer.question&&r.transfer.answer);}
});
test('all browser scripts exist, are cached with the same version, and included in Pages output',()=>{
 const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),workflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
 for(const [,src] of html.matchAll(/<script defer src="([^"]+)"/g)){assert.ok(fs.existsSync(src.split('?')[0]),src);assert.ok(sw.includes("'./"+src+"'"),src+' offline');assert.ok(workflow.includes(src.split('?')[0]),src+' deploy');}
 assert.ok(html.indexOf('reasoning.js')<html.indexOf('app.js'));
});
