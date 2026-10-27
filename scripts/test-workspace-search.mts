import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
// The app uses bundler-resolved extensionless TypeScript content imports. Resolve
// those same files for this Node-only integration check without a test dependency.
const hooks = registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
    try { return nextResolve(`${specifier}.ts`, context); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ERR_MODULE_NOT_FOUND') throw error;
    }
  }
  return nextResolve(specifier, context);
} });
const { searchWorkspace, terminalActions } = await import('../content/workspace-search.ts');
hooks.deregister();
assert.equal(searchWorkspace('brew')[0].id, 'command:brew');
assert.equal(searchWorkspace('about')[0].target.kind, 'panel');
assert.equal(searchWorkspace('pause')[0].id, 'command:pause');
assert.equal(searchWorkspace('cinnamon')[0].id, 'flavour:cinnamon');
assert.equal(searchWorkspace('cinnmon')[0].id, 'flavour:cinnamon');
assert(searchWorkspace('RocksDB Raft').some(item => item.target.kind === 'panel' && ['vector','incident'].includes(item.target.panel)));
assert(searchWorkspace('show me monsoon malabar')[0].id.startsWith('origin:'));
assert.equal(searchWorkspace('Iceland')[0].id, 'country:ISL');
assert.equal(searchWorkspace('United States')[0].id, 'country:USA');
assert.equal(searchWorkspace('afternoon pause')[0].id, 'moment:afternoon');
assert(searchWorkspace('caffeine').some(item => item.id.startsWith('fact:')));
assert.equal(searchWorkspace('dark roast')[0].id, 'roast:dark');
assert.equal(searchWorkspace('MuleSoft impossibleUnmatchedWord').length, 0);
assert.equal(searchWorkspace('[.*](a+)+$').length, 0);
assert.equal(searchWorkspace('the and in').length, 0);
assert.equal(searchWorkspace('x'.repeat(10000)).length, 0);
for (const query of ['rust', 'coffee', 'evaluation']) {
  const results=searchWorkspace(query);
  assert.equal(new Set(results.map(item => item.group || item.id)).size, results.length);
  assert(results.every(item=>item.excerpt.length<180));
}
assert(terminalActions.some(item => item.aliases?.includes('customize')));
const start=performance.now();
for(let i=0;i<1000;i++) searchWorkspace(['coffee','Rust agent','Iceland','promptfoo','dark roast'][i%5]);
console.log(`PASS: canonical search ranking, typos, multiword matches, commands, deep links, deduplication and literal input; 1000 queries ${(performance.now()-start).toFixed(1)}ms.`);
