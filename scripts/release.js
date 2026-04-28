#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// 获取 package.json 中的版本号
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

if (!version) {
  console.error('错误: package.json 中未找到版本号');
  process.exit(1);
}

const tagName = `v${version}`;

console.log(`当前版本: ${version}`);
console.log(`将创建标签: ${tagName}`);

try {
  // 检查标签是否已存在
  const existingTags = execSync('git tag', { encoding: 'utf-8' }).trim().split('\n');
  
  if (existingTags.includes(tagName)) {
    console.error(`错误: 标签 ${tagName} 已存在`);
    console.log('如需重新发布，请先删除该标签:');
    console.log(`  git tag -d ${tagName}`);
    console.log(`  git push origin --delete ${tagName}`);
    process.exit(1);
  }

  // 检查是否有未提交的更改
  const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
  if (status) {
    console.warn('警告: 检测到未提交的更改');
    console.warn('建议先提交所有更改后再发布');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('是否继续? (y/N): ', resolve);
    });
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('已取消发布');
      process.exit(0);
    }
  }

  // 创建标签
  console.log('\n创建标签...');
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });
  
  // 推送标签
  console.log('推送标签到远程仓库...');
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
  
  console.log(`\n成功! 标签 ${tagName} 已创建并推送`);
  console.log('GitHub Actions 将自动构建并发布 Release');
  console.log(`查看进度: https://github.com/PUITO/forge-scaffold-cli/actions`);
  
} catch (error) {
  console.error('发布失败:', error.message);
  process.exit(1);
}
