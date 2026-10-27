import { readdir, readFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";
async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (path.endsWith(".md")) files.push(path);
  }
  return files;
}
const docs = await walk("docs");
const indexes=docs.filter(file=>file.endsWith('/index.md'));
const logs=docs.filter(file=>file.endsWith('/log.md'));
for (const file of [
  ...docs,
  "README.md",
  "CONTRIBUTING.md",
  "NOTICE.md",
]) {
  const text = await readFile(file, "utf8");
  if (indexes.includes(file)) {
    if(file==='docs/index.md') assert(/^---\nokf_version: "0\.2"\n---\n/.test(text), 'Bundle root index declares only okf_version.');
    else assert(!text.startsWith('---'), `${file}: reserved subdirectory indexes have no frontmatter.`);
    const body=text.replace(/^---\n[\s\S]*?\n---\n/,'');
    for(const entry of await readdir(dirname(file),{withFileTypes:true})){
      if(entry.name==='index.md'||entry.name==='log.md') continue;
      if(entry.isDirectory()||entry.name.endsWith('.md'))
        assert(body.includes(`](${entry.name}${entry.isDirectory()?'/':''})`),`${file}: missing directory entry ${entry.name}`);
    }
  } else if (logs.includes(file)) {
    assert(!text.startsWith('---'), `${file}: reserved logs have no concept frontmatter.`);
    const dates=[...text.matchAll(/^## (\d{4}-\d{2}-\d{2})\s*$/gm)].map(match=>match[1]);
    assert(dates.length>0, `${file}: group updates under ISO date headings.`);
    assert.deepEqual(dates,[...dates].sort().reverse(),`${file}: newest dates first.`);
  } else if (docs.includes(file)) {
    const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
    assert(frontmatter, `Frontmatter must start ${file}`);
    for (const field of [
      "type",
      "title",
      "description",
      "tags",
      "status",
      "updated",
    ])
      assert(
        new RegExp(`^${field}:\\s*\\S`, "m").test(frontmatter[1]) ||
          (field === "tags" && /^tags:\n\s+- /m.test(frontmatter[1])),
        `${file}: missing ${field}`,
      );
  }
  for (const match of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(https?:|mailto:|\/)/.test(target)) continue;
    await access(resolve(dirname(file), target)).catch(() => {
      throw Error(`${file}: broken link ${target}`);
    });
  }
}
for(const file of docs) assert(indexes.includes(`${dirname(file)}/index.md`), `${file}: add a directory index for progressive discovery.`);
console.log(
  `OKF project conventions, ${indexes.length} indexes and local links: ${docs.length-indexes.length-logs.length} concepts passed.`,
);
