import fs from "fs";
import path from "path";

const byDate = [];
const byTopic = {};

const topicTitleByDir = {
  js: "JavaScript",
  webdev: "Web dev",
};

const topicTitle = (dir) =>
  topicTitleByDir[dir] ?? dir.charAt(0).toUpperCase() + dir.slice(1);

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      traverseDir(filePath);
    } else if (path.extname(file) === ".md" && file !== "README.md") {
      const cat = path.basename(dir);
      const date = file.match(/(\d{4}-\d{2}-\d{2})/)[0];
      const title = path
        .basename(file, ".md")
        .replace(date + "-", "")
        .replace(/-/g, " ");

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
