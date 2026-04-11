import { homedir } from "node:os";
import { join } from "node:path";

const historyPath = join(homedir(), ".local/share/fish/fish_history");
const file = Bun.file(historyPath);

if (!(await file.exists())) {
  console.error("❌ 找不到历史记录文件");
  process.exit(1);
}

const text = await file.text();
const lines = text.split("\n");

const pathCounts = new Map<string, number>();
let currentCmd = "";

for (const line of lines) {
  // 识别路径行，通常以 "    - " 开头并跟着一个路径
  const pathMatch = line.match(/^\s+-\s+(\/.*|~.*)/);

  if (pathMatch) {
    let folder = pathMatch[1].trim();
    // 统一处理家目录符号
    if (folder.startsWith("~")) {
      folder = folder.replace("~", homedir());
    }

    pathCounts.set(folder, (pathCounts.get(folder) || 0) + 1);
  }
}

const topPaths = Array.from(pathCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

console.log("📂 你的高频足迹 Top 10：\n");
topPaths.forEach(([path, count], i) => {
  console.log(`${String(i + 1).padStart(2, '0')}. [${count}次] ${path}`);
});
