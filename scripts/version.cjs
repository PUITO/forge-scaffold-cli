#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

// 获取命令行参数
const bumpType = process.argv[2]; // 'patch', 'minor', 'major'

if (!bumpType || !["patch", "minor", "major"].includes(bumpType)) {
  console.error("用法: npm run version:<type>");
  console.error("  <type>: patch | minor | major");
  console.error("");
  console.error("示例:");
  console.error("  npm run version:patch   # 1.0.0 -> 1.0.1");
  console.error("  npm run version:minor   # 1.0.0 -> 1.1.0");
  console.error("  npm run version:major   # 1.0.0 -> 2.0.0");
  process.exit(1);
}

// 读取 package.json
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const currentVersion = packageJson.version;

if (!currentVersion) {
  console.error("错误: package.json 中未找到版本号");
  process.exit(1);
}

// 解析版本号
const versionParts = currentVersion.split(".").map(Number);
if (versionParts.length !== 3) {
  console.error(`错误: 无效的版本号格式: ${currentVersion}`);
  process.exit(1);
}

let [major, minor, patch] = versionParts;

// 根据类型更新版本号
switch (bumpType) {
  case "major":
    major += 1;
    minor = 0;
    patch = 0;
    break;
  case "minor":
    minor += 1;
    patch = 0;
    break;
  case "patch":
    patch += 1;
    break;
}

const newVersion = `${major}.${minor}.${patch}`;

console.log(`当前版本: ${currentVersion}`);
console.log(`新版本: ${newVersion}`);
console.log(`更新类型: ${bumpType}`);
console.log("");

// 确认更新
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question(`是否继续更新版本? (Y/n): `, (answer) => {
  readline.close();

  if (answer.toLowerCase() === "n") {
    console.log("已取消版本更新");
    process.exit(0);
  }

  try {
    // 检查是否有未提交的更改
    const status = execSync("git status --porcelain", {
      encoding: "utf-8",
    }).trim();

    if (status) {
      console.warn("警告: 检测到未提交的更改");
      console.warn("建议先提交或暂存所有更改");
      console.warn("");

      const rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("是否继续? (y/N): ", (ans) => {
        rl.close();
        if (ans.toLowerCase() !== "y") {
          console.log("已取消版本更新");
          process.exit(0);
        }
        proceedWithUpdate();
      });
    } else {
      proceedWithUpdate();
    }
  } catch (error) {
    console.error("执行 git 命令失败:", error.message);
    process.exit(1);
  }
});

function proceedWithUpdate() {
  try {
    // 更新 package.json
    packageJson.version = newVersion;
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 4) + "\n",
      "utf-8"
    );

    console.log("");
    console.log(`✓ package.json 已更新为 v${newVersion}`);

    // 提交更改
    console.log("提交版本更新...");
    execSync(`git add package.json`, { stdio: "inherit" });
    execSync(`git commit -m "chore: bump version to v${newVersion}"`, {
      stdio: "inherit",
    });

    console.log("");
    console.log(`✓ 版本已成功更新到 v${newVersion}`);
    console.log("");
    console.log("下一步:");
    console.log(`  npm run release  # 创建并推送标签 v${newVersion}`);
    console.log("");
    console.log("或者手动操作:");
    console.log(`  git tag v${newVersion}`);
    console.log(`  git push origin v${newVersion}`);
  } catch (error) {
    console.error("版本更新失败:", error.message);
    process.exit(1);
  }
}
