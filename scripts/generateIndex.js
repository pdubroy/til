import fs from "fs";
import path from "path";

const byDate = [];
const byTopic = {};

const topicTitleByDir = {
  js: "JavaScript",
  wasm: "WebAssembly",
  webdev: "Web dev",
};

const topicTitle = (dir) =>
  topicTitleByDir[dir] ?? dir.charAt(0).toUpperCase() + dir.slice(1);

function checkNotNull(x, msg = "Unexpected null value") {
  if (x == null) throw new Error(msg);
  return x;
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      if (file[0] !== ".") traverseDir(filePath);
    } else if (
      [".md", ".ipynb"].includes(path.extname(file)) &&
      file !== "README.md"
    ) {
      const cat = path.basename(dir);
      const matchArr = checkNotNull(file.match(/(\d{4}-\d{2}-\d{2})/), `Match failed: ${file}`);
      const date = matchArr[0];
      let title = file
        .slice(date.length + 1)
        .replace("-", " ")
        .replace(".ipynb", "");
      if (path.extname(file) === ".md") {
        title = fs
          .readFileSync(filePath, "utf-8")
          .split("\n")[0]
          .replace("# ", "");
      }

      byDate.push({ date, entry: `- [${title}](./${filePath}) - ${date}` });

      if (!byTopic.hasOwnProperty(cat)) {
        byTopic[cat] = [];
      }
      byTopic[cat].push({ date, entry: `- [${title}](./${filePath})` });
    }
  });
}

traverseDir(".");
byDate.sort((a, b) => (a.date < b.date ? 1 : -1));

const topicKeys = Object.keys(byTopic).sort((a, b) => (a < b ? -1 : 1));
Object.values(byTopic).forEach((entries) =>
  entries.sort((a, b) => (a.date < b.date ? 1 : -1)),
);

const readmeContent = `# til

Short notes on useful things I've learned. Inspired by [@simonw](https://github.com/simonw/til) and [@jbranchaud](https://github.com/jbranchaud/til).

---

## By date

${byDate.map(({ entry }) => entry).join("\n")}

## By topic

${topicKeys.map((topic) => `### ${topicTitle(topic)}\n\n${byTopic[topic].map(({ entry }) => entry).join("\n")}`).join("\n\n")}
`;

fs.writeFileSync("README.md", readmeContent);
