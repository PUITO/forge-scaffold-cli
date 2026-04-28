#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const readline = require("readline");

// 获取 package.json 中的版本号
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const version = packageJson.version;

if (!version) {
  console.error("错误: package.json 中未找到版本号");
  process.exit(1);
}

const tagName = `v${version}`;

console.log("=".repeat(60));
console.log("Forge 发布助手");
console.log("=".repeat(60));
console.log(`当前版本: ${version}`);
console.log(`将创建标签: ${tagName}`);
console.log("=".repeat(60));
console.log("");

// 检查前置条件
async function checkPrerequisites() {
  try {
    // 检查是否在 master 分支
    const currentBranch = execSync("git branch --show-current", {
      encoding: "utf-8",
    }).trim();

    if (currentBranch !== "master") {
      console.warn(`⚠ 警告: 当前不在 master 分支 (当前分支: ${currentBranch})`);
      console.warn("  建议在 master 分支上发布正式版本");
      console.warn("");

      const answer = await askQuestion("是否继续在非 master 分支发布? (y/N): ");
      if (answer.toLowerCase() !== "y") {
        console.log("已取消发布");
        process.exit(0);
      }
    }

    // 检查是否有未提交的更改
    const status = execSync("git status --porcelain", {
      encoding: "utf-8",
    }).trim();

    if (status) {
      console.warn("⚠ 警告: 检测到未提交的更改:");
      console.log(status);
      console.log("");
      console.warn("建议先提交所有更改后再发布");
      console.log("");

      const answer = await askQuestion("是否继续? (y/N): ");
      if (answer.toLowerCase() !== "y") {
        console.log("已取消发布");
        process.exit(0);
      }
    }

    // 检查 dist 目录是否存在
    const distPath = path.join(__dirname, "..", "dist");
    if (!fs.existsSync(distPath)) {
      console.log("⚠ 检测到 dist 目录不存在，需要先构建");
      console.log("");

      const answer = await askQuestion("是否现在构建? (Y/n): ");
      if (answer.toLowerCase() !== "n") {
        console.log("正在构建...");
        execSync("npm run build", { stdio: "inherit" });
        console.log("✓ 构建完成");
        console.log("");
      }
    }
  } catch (error) {
    console.error("检查前置条件失败:", error.message);
    process.exit(1);
  }
}

// 检查标签是否已存在
function checkTagExists() {
  try {
    const existingTags = execSync("git tag", { encoding: "utf-8" })
      .trim()
      .split("\n");

    if (existingTags.includes(tagName)) {
      console.error(`✗ 错误: 标签 ${tagName} 已存在`);
      console.log("");
      console.log("如需重新发布，请先删除该标签:");
      console.log(`  git tag -d ${tagName}`);
      console.log(`  git push origin --delete ${tagName}`);
      console.log("");
      console.log("或者更新版本号后再次运行:");
      console.log("  npm run version:patch   # 小版本更新");
      console.log("  npm run version:minor   # 中版本更新");
      console.log("  npm run version:major   # 大版本更新");
      process.exit(1);
    }
  } catch (error) {
    console.error("检查标签失败:", error.message);
    process.exit(1);
  }
}

// 询问用户
function askQuestion(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// 执行发布
async function performRelease() {
  try {
    console.log("步骤 1/3: 创建 Git 标签...");
    execSync(`git tag ${tagName}`, { stdio: "inherit" });
    console.log(`✓ 标签 ${tagName} 已创建`);
    console.log("");

    console.log("步骤 2/3: 推送标签到远程仓库...");
    execSync(`git push origin ${tagName}`, { stdio: "inherit" });
    console.log(`✓ 标签已推送到 GitHub`);
    console.log("");

    console.log("步骤 3/3: 触发 GitHub Actions...");
    console.log("GitHub Actions 将自动:");
    console.log("  • 在多平台和多 Node.js 版本上构建");
    console.log("  • 创建 GitHub Release");
    console.log("  • 上传构建产物作为 Release 附件");
    console.log("");
    console.log(
      `查看进度: https://github.com/PUITO/forge-scaffold-cli/actions`
    );
    console.log("");

    // 等待几秒让用户看到信息
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("=".repeat(60));
    console.log("✓ 发布成功!");
    console.log("=".repeat(60));
    console.log("");
    console.log(`标签 ${tagName} 已创建并推送到 GitHub`);
    console.log("");
    console.log("下一步:");
    console.log("  1. 访问 GitHub Releases 页面完善发布说明");
    console.log(
      `     https://github.com/PUITO/forge-scaffold-cli/releases/tag/${tagName}`
    );
    console.log("  2. 添加 Changelog 和功能说明");
    console.log("  3. 通知用户新版本发布");
    console.log("");
    console.log("用户可以通过以下方式安装新版本:");
    console.log(
      `  npm install -g git+https://github.com/PUITO/forge-scaffold-cli.git#${tagName}`
    );
    console.log("");
  } catch (error) {
    console.error("✗ 发布失败:", error.message);
    console.log("");
    console.log("如果标签已创建但推送失败，可以手动推送:");
    console.log(`  git push origin ${tagName}`);
    console.log("");
    console.log("如果需要回滚，可以删除标签:");
    console.log(`  git tag -d ${tagName}`);
    console.log(`  git push origin --delete ${tagName}`);
    process.exit(1);
  }
}

// 主流程
async function main() {
  await checkPrerequisites();
  checkTagExists();

  console.log("即将开始发布流程...");
  console.log("");

  const answer = await askQuestion(`确认发布 v${version}? (Y/n): `);
  if (answer.toLowerCase() === "n") {
    console.log("已取消发布");
    process.exit(0);
  }

  console.log("");
  await performRelease();
}

main().catch((error) => {
  console.error("意外错误:", error);
  process.exit(1);
});
