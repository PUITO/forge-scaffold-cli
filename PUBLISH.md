# Forge 发布流程指南

本文档说明如何使用自动化脚本发布新版本。

## 快速开始

### 1. 更新版本号

选择合适的版本更新类型：

```bash
# 补丁版本 (1.0.0 -> 1.0.1) - Bug 修复
npm run version:patch

# 次版本 (1.0.0 -> 1.1.0) - 新功能
npm run version:minor

# 主版本 (1.0.0 -> 2.0.0) - 重大变更
npm run version:major
```

脚本会自动：
- 更新 `package.json` 中的版本号
- 提交更改到 Git
- 提示下一步操作

### 2. 发布版本

```bash
npm run release
```

发布助手会自动：
- 检查是否在 master 分支
- 检查未提交的更改
- 确认 dist 目录存在（如不存在会提示构建）
- 创建 Git 标签 (如 v1.0.0)
- 推送标签到 GitHub
- 触发 GitHub Actions 自动构建和发布

### 3. 完善发布说明

GitHub Actions 完成后：
1. 访问 [Releases 页面](https://github.com/PUITO/forge-scaffold-cli/releases)
2. 编辑刚创建的 Release
3. 添加 Changelog 和功能说明

## 完整流程示例

```bash
# 1. 确保在 master 分支
git checkout master
git pull origin master

# 2. 更新版本（选择适当的类型）
npm run version:minor

# 3. 发布
npm run release

# 4. 等待 GitHub Actions 完成
# 查看: https://github.com/PUITO/forge-scaffold-cli/actions
```

## 版本管理策略

遵循 [语义化版本](https://semver.org/lang/zh-CN/)

| 版本类型 | 命令 | 示例 | 适用场景 |
|---------|------|------|----------|
| 补丁 (Patch) | `npm run version:patch` | 1.0.0 → 1.0.1 | Bug 修复、小优化 |
| 次版本 (Minor) | `npm run version:minor` | 1.0.0 → 1.1.0 | 新功能、向下兼容 |
| 主版本 (Major) | `npm run version:major` | 1.0.0 → 2.0.0 | 重大变更、不兼容 |

## 故障排除

### 标签已存在

```bash
# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0

# 重新发布
npm run release
```

### 推送失败

```bash
# 手动推送标签
git push origin v1.0.0
```

### 需要回滚

```bash
# 删除标签
git tag -d v1.0.0
git push origin --delete v1.0.0

# 回退提交
git reset --hard HEAD~1
git push origin master --force
```

## 用户安装方式

发布后，用户可以通过以下方式安装：

```bash
# 安装最新版本
npm install -g git+https://github.com/PUITO/forge-scaffold-cli.git

# 安装指定版本
npm install -g git+https://github.com/PUITO/forge-scaffold-cli.git#v1.0.0
```
