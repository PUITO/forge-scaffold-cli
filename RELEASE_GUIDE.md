# Forge 版本发布指南

本指南说明如何安全地发布 Forge 的新版本，避免 NPM 投毒风险。

## 目录

- [为什么不在 NPM 发布](#为什么不在-npm-发布)
- [发布方式概览](#发布方式概览)
- [方式一：Git Tag + GitHub Releases（推荐）](#方式一git-tag--github-releases推荐)
- [方式二：手动构建发布包](#方式二手动构建发布包)
- [用户安装方式](#用户安装方式)
- [版本管理策略](#版本管理策略)

---

## 为什么不在 NPM 发布

### 安全风险

近年来 NPM 生态系统中出现了多起恶意包投毒事件：

- **依赖混淆攻击**：上传与内部包同名的公共包
- **供应链攻击**：劫持流行包的维护者账号
- ** typosquatting **：上传与流行包名称相似的恶意包

### 我们的策略

为避免这些风险，Forge 采用以下策略：

1. **不发布到 NPM 公共仓库**
2. **通过 GitHub Releases 分发**
3. **用户直接从 Git 仓库安装**
4. **提供预构建的发布包下载**

这样确保：
- 代码来源可追溯（GitHub）
- 用户可以审查源码
- 避免第三方仓库污染
- 完整的版本历史和控制

---

## 发布方式概览

| 方式 | 适用场景 | 难度 | 自动化程度 |
|------|----------|------|------------|
| Git Tag + Releases | 正式发布 | 简单 | 完全自动 |
| 手动构建 | 测试/内部发布 | 中等 | 手动 |

---

## 方式一：Git Tag + GitHub Releases（推荐）

这是最推荐的发布方式，完全自动化且安全可靠。

### 步骤 1：准备发布

```bash
# 切换到主分支
git checkout main

# 拉取最新代码
git pull origin main

# 确保工作区干净
git status
```

### 步骤 2：更新版本号

编辑 `package.json`，更新 `version` 字段：

```json
{
  "name": "@puito/forge",
  "version": "1.1.0",  // 修改这里
  ...
}
```

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **MAJOR** (主版本号)：不兼容的 API 修改
- **MINOR** (次版本号)：向下兼容的功能性新增
- **PATCH** (修订号)：向下兼容的问题修正

### 步骤 3：提交更改

```bash
# 添加更改
git add package.json

# 提交
git commit -m "chore: release v1.1.0"
```

### 步骤 4：创建并推送 Tag

```bash
# 创建 tag
git tag -a v1.1.0 -m "Release version 1.1.0"

# 推送代码和 tag
git push origin main
git push origin v1.1.0
```

### 步骤 5：等待 CI 完成

GitHub Actions 会自动：

1. 在多平台和多 Node.js 版本上构建
2. 验证 CLI 功能
3. 创建 GitHub Release
4. 上传构建产物作为 Release 附件

访问 [Actions 页面](https://github.com/PUITO/forge-scaffold-cli/actions) 查看进度。

### 步骤 6：完善 Release 说明

1. 访问 [Releases 页面](https://github.com/PUITO/forge-scaffold-cli/releases)
2. 点击刚创建的 Release
3. 点击 "Edit" 编辑说明
4. 添加版本更新内容（Changelog）

**Release 说明模板：**

```markdown
## What's Changed

### Features
- 新增 XXX 功能
- 支持 XXX

### Bug Fixes
- 修复 XXX 问题
- 解决 XXX 错误

### Improvements
- 优化 XXX 性能
- 改进 XXX 体验

### Breaking Changes
- （如果有）XXX API 变更说明

## Installation

```bash
npm install -g git+https://github.com/PUITO/forge-scaffold-cli.git#v1.1.0
```

或者下载下方的预构建包使用。

**Full Changelog**: https://github.com/PUITO/forge-scaffold-cli/compare/v1.0.0...v1.1.0
```

---

## 方式二：手动构建发布包

适用于测试或特殊情况。

### 步骤 1：构建项目

```bash
# 清理并重新构建
npm run clean
npm install
npm run build
```

### 步骤 2：验证构建

```bash
# 测试 CLI
node bin/forge.js --version
node bin/forge.js --help
```

### 步骤 3：打包

```bash
# 创建发布目录
mkdir -p forge-v1.1.0

# 复制必要文件
cp -r bin dist package.json README.md LICENSE forge-v1.1.0/

# 压缩
zip -r forge-v1.1.0.zip forge-v1.1.0/
```

### 步骤 4：上传到 GitHub

1. 访问 [Releases 页面](https://github.com/PUITO/forge-scaffold-cli/releases)
2. 创建新的 Release（或编辑已有）
3. 在 "Attach binaries" 区域上传 zip 文件

---

## 用户安装方式

发布后，用户可以通过以下方式安装：

### 从 Git 安装指定版本

```bash
# 安装最新版本
npm install -g git+https://github.com/PUITO/forge-scaffold-cli.git

# 安装指定版本
npm install -g git+https://github.com/PUITO/forge-scaffold-cli.git#v1.1.0

# 安装特定分支
npm install -g git+https://github.com/PUITO/forge-scaffold-cli.git#main
```

### 下载预构建包

1. 访问 [Releases 页面](https://github.com/PUITO/forge-scaffold-cli/releases)
2. 下载对应版本的 zip 包
3. 解压到任意目录
4. 运行：

```bash
# Linux/macOS
cd forge-v1.1.0
chmod +x bin/forge.js
./bin/forge.js --version

# Windows
cd forge-v1.1.0
node bin/forge.js --version
```

或者添加到 PATH：

```bash
# Linux/macOS - 添加到 ~/.bashrc 或 ~/.zshrc
export PATH="/path/to/forge-v1.1.0/bin:$PATH"

# Windows - 通过系统设置添加环境变量
```

### 本地开发安装

```bash
git clone https://github.com/PUITO/forge-scaffold-cli.git
cd forge-scaffold-cli
npm install
npm run build
npm link  # 创建全局链接
```

---

## 版本管理策略

### 分支策略

```
main        - 稳定分支，每个 tag 都基于此
dev         - 开发分支，新功能在此合并
feature/*   - 功能分支，开发新功能
hotfix/*    - 热修复分支，紧急修复
```

### 版本号规则

遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)

**示例：**

| 版本 | 说明 |
|------|------|
| 1.0.0 | 首个稳定版本 |
| 1.0.1 | Bug 修复 |
| 1.1.0 | 新增功能 |
| 2.0.0 | 重大变更（不兼容） |

### 变更日志（Changelog）

建议在项目根目录维护 `CHANGELOG.md`：

```markdown
# Changelog

## [1.1.0] - 2024-01-15

### Added
- 新增模板仓库配置命令
- 支持多仓库切换

### Fixed
- 修复 Windows 下路径问题
- 修复 EJS 渲染错误

### Changed
- 优化模板下载速度
- 改进错误提示信息

## [1.0.1] - 2024-01-10

### Fixed
- 修复配置文件读取问题

## [1.0.0] - 2024-01-01

### Added
- 初始版本发布
- 支持 create、list、update、config 命令
```

---

## 安全检查清单

发布前请确认：

- [ ] 所有测试通过
- [ ] 代码已审查
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号正确
- [ ] 构建成功
- [ ] CLI 功能正常
- [ ] Git tag 已推送
- [ ] Release 说明已编写

---

## 常见问题

### Q: 如何处理紧急 Bug 修复？

A: 使用 hotfix 分支：

```bash
git checkout -b hotfix/fix-issue main
# 修复 bug
git commit -m "fix: xxx"
git tag -a v1.0.1 -m "Hotfix for xxx"
git push origin main v1.0.1
```

### Q: 可以回滚版本吗？

A: 可以。删除错误的 tag 并创建新的：

```bash
git tag -d v1.1.0
git push --delete origin v1.1.0
# 修复后重新发布
git tag -a v1.1.1 -m "Release v1.1.1 (replaces broken v1.1.0)"
git push origin v1.1.1
```

### Q: 如何通知用户新版本？

A: 
1. 在 Release 中详细说明变更
2. 在项目 README 中更新
3. 通过社区渠道（如有）

### Q: 旧版本还会维护吗？

A: 通常只维护最新的 minor 版本。严重安全问题会回溯修复。

---

## 附录：Git 命令速查

```bash
# 查看当前 tag
git tag

# 查看 tag 详情
git show v1.0.0

# 创建轻量 tag
git tag v1.0.0

# 创建附注 tag（推荐）
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送 tag
git push origin v1.0.0

# 推送所有 tag
git push origin --tags

# 删除本地 tag
git tag -d v1.0.0

# 删除远程 tag
git push --delete origin v1.0.0
```

---

## 下一步

- 阅读 [使用指南](./USAGE.md) 了解如何使用 Forge
- 查看 [模板开发指南](./TEMPLATE_GUIDE.md) 创建自己的模板
- 访问 [Releases 页面](https://github.com/PUITO/forge-scaffold-cli/releases) 获取最新版本
