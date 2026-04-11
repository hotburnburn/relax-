import { homedir } from "node:os";
import { join } from "node:path";

// 1. 确定 fish history 文件的路径
const historyPath = join(homedir(), ".local/share/fish/fish_history");
const file = Bun.file(historyPath);

// 确保文件存在
if (!(await file.exists())) {
  console.error("❌ 找不到 fish history 文件！请确认路径是否正确。");
  process.exit(1);
}

console.log("⏳ 正在读取并分析 Fish 历史记录...\n");

// 2. 读取全文并按行分割
const text = await file.text();
const lines = text.split("\n");

// 3. 用一个 Map 来存储命令和出现的次数
const commandCounts = new Map < string, number> ();

for (const line of lines) {
  // 只关注包含命令的行
  if (line.startsWith("- cmd: ")) {
    // 提取 "- cmd: " 后面的完整命令
    const fullCmd = line.substring(7).trim();
    if (!fullCmd) continue;

    // 提取第一个空格之前的词作为主命令
    const baseCmd = fullCmd.split(" ")[0];

    // 更新统计次数
    const currentCount = commandCounts.get(baseCmd) || 0;
    commandCounts.set(baseCmd, currentCount + 1);
  }
}

// 4. 将 Map 转换为数组，按使用次数降序排序，并截取前 20 名
const topCommands = Array.from(commandCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

// 5. 打印漂亮的输出结果 ✨
console.log("🎣 你的 Fish Shell 最爱命令 Top 20：\n");
console.log("排名\t次数\t命令");
console.log("------------------------");

topCommands.forEach(([cmd, count], index) => {
  const rank = String(index + 1).padStart(2, "0");
  console.log(`${rank}\t${count}\t${cmd}`);
});
