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
for (const file of [
  ...docs,
  "README.md",
  "CONTRIBUTING.md",
  "NOTICE.md",
]) {
  const text = await readFile(file, "utf8");
  if (docs.includes(file)) {
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
console.log(
  `OKF project conventions and local links: ${docs.length} knowledge documents passed.`,
);
