# Forge - 项目脚手架工具

[![CI](https://github.com/PUITO/forge-scaffold-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/PUITO/forge-scaffold-cli/actions/workflows/ci.yml)
[![GitHub Release](https://img.shields.io/github/v/release/PUITO/forge-scaffold-cli)](https://github.com/PUITO/forge-scaffold-cli/releases)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Forge 是一个强大的通用项目脚手架工具，用于快速生成各种项目模板。支持配置驱动的模板系统、动态变量替换和多仓库管理。

> **安全提示**：为避免 NPM 包投毒风险，Forge 不发布到 NPM 公共仓库。请通过以下方式获取：
> - **开发者**：使用 `npm link` 本地安装（适合开发和测试）
> - **用户**：从 [Releases](https://github.com/PUITO/forge-scaffold-cli/releases) 下载预构建的 zip 包（适合生产使用）

## ✨ 特性

- **单 Git 仓库管理**：所有模板统一放在一个 Git 仓库中，易于维护
- **子模板独立管理**：每个子模板支持独立开发、提交和历史查看
- **配置驱动**：通过 `forge.json` 配置文件控制变量、提示和后续操作
- **动态生成**：支持 EJS 模板引擎进行变量替换和条件渲染
- **多仓库支持**：可配置自定义模板仓库地址，支持团队私有模板
- **缓存机制**：智能缓存模板，提升二次使用速度
- **多语言支持**：微信小程序、安卓（Compose）、Vue3、React TS、Python 等
- **跨平台**：支持 Windows、macOS、Linux

## 📦 安装

Forge 提供两种使用方式，根据你的需求选择：

### 方式一：开发者模式 - 使用 npm link（推荐用于开发）

适合想要参与开发、测试最新功能或自定义修改的用户。

```bash
# 克隆仓库
git clone https://github.com/PUITO/forge-scaffold-cli.git
cd forge-scaffold-cli

# 安装依赖并构建
npm install
npm run build

# 创建全局链接
npm link
```

**更新到最新版本：**

```bash
cd forge-scaffold-cli
git pull
npm install
npm run build
```

**取消链接：**

```bash
npm unlink -g @puito/forge
```

### 方式二：用户模式 - 下载 Release 包（推荐用于生产）

适合只想使用工具，不想配置开发环境的用户。

1. 访问 [Releases 页面](https://github.com/PUITO/forge-scaffold-cli/releases)
2. 下载最新版本的 zip 包（如 `forge-v1.0.0.zip`）
3. 解压到任意目录
4. 运行 CLI：

```bash
# Linux/macOS
chmod +x bin/forge.js
./bin/forge.js --version

# Windows
node bin/forge.js --version
```

**提示：** 可以将 `bin` 目录添加到系统 PATH 环境变量中，这样就可以在任何地方直接使用 `forge` 命令。

### 验证安装

```bash
forge --version
```

## ⚙️ 环境变量配置（生产模式）

如果你从 Release 下载了 zip 包并解压使用，需要确保在包含 `node_modules` 的目录下运行。

### 方式一：在解压目录中运行（推荐）

```powershell
# Windows
cd D:\tools\my_tools\forge
node bin/forge.js --version
```

```bash
# Linux/macOS
cd /path/to/forge
node bin/forge.js --version
```

### 方式二：配置 PATH 环境变量

如果你想在任何地方直接使用 `forge` 命令，可以创建一个包装脚本：

**Windows (forge.cmd):**

```cmd
@echo off
node "D:\tools\my_tools\forge\bin\forge.js" %*
```

将 `forge.cmd` 所在的目录添加到系统 PATH。

**Linux/macOS (forge.sh):**

```bash
#!/bin/bash
node "/path/to/forge/bin/forge.js" "$@"
```

```bash
chmod +x forge.sh
sudo ln -s /path/to/forge.sh /usr/local/bin/forge
```

### 方式三：使用 npm link（开发模式）

参见上方的“开发者模式”安装说明。

## 🚀 快速开始

### 1. 创建新项目

```bash
forge create <template-name> --name my-project
```

**支持两种方式：**

- **远程模板**：使用模板名称（从配置的仓库下载）
- **本地模板**：使用本地路径（适合开发测试）

例如：

```bash
# 使用远程模板
forge create vue3-vite --name my-dashboard
forge create react-ts-vite --name my-app
forge create android-compose --name MyAwesomeApp

# 使用本地模板（开发测试推荐）
forge create ./my-local-template --name my-app
forge create ../templates/vue3-template --name my-project
forge create D:\templates\my-template --name my-app
```

### 2. 列出可用模板

```bash
forge list
```

### 3. 配置模板仓库

```bash
# 查看当前仓库
forge config

# 设置自定义仓库
forge config --set "templateRepo=https://github.com/yourname/your-templates.git"
```

## 📖 文档

- [使用指南](./USAGE.md) - 详细的使用说明和示例
- [模板开发指南](./TEMPLATE_GUIDE.md) - 如何创建自己的模板

## 🔧 命令参考

### create - 创建新项目

```bash
forge create <template> [options]

选项：
  -n, --name <name>    项目名称
  -p, --path <path>    生成路径（默认：当前目录）
```

**示例：**

```bash
# 基本用法
forge create vue3-vite --name my-app

# 指定生成路径
forge create react-ts-vite --name my-app --path ./projects

# 交互式输入项目名称
forge create android-compose
```

### list - 列出可用模板

```bash
forge list
```

显示当前配置的模板仓库中所有可用的模板列表。

### update - 更新模板缓存

```bash
forge update [template]

# 清除所有模板缓存
forge update

# 清除指定模板缓存
forge update vue3-vite
```

### config - 管理配置

```bash
forge config [options]

选项：
  -s, --set <key=value>   设置配置项
  -g, --get <key>         获取配置项
  -l, --list              列出所有配置
  -r, --reset             重置为默认配置
```

**示例：**

```bash
# 查看当前配置
forge config
forge config --list

# 设置模板仓库
forge config --set "templateRepo=https://github.com/custom/repo.git"

# 获取配置项
forge config --get templateRepo

# 重置配置
forge config --reset
```

## ⚙️ 配置说明

### 用户配置

Forge 的用户配置保存在 `~/.forge/config.json`（Windows: `%USERPROFILE%\.forge\config.json`）

**配置项：**

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| templateRepo | string | https://github.com/PUITO/forge-templates.git | 模板仓库地址 |
| cacheEnabled | boolean | true | 是否启用缓存 |

### 模板配置 (forge.json)

每个模板需要在根目录包含 `forge.json` 配置文件：

```json
{
  "name": "vue3-vite",
  "description": "Vue 3 + Vite + TypeScript 项目模板",
  "root": "templates/vue3-vite",
  "variables": {
    "projectName": {
      "type": "string",
      "required": true,
      "default": "my-app"
    },
    "usePinia": {
      "type": "boolean",
      "default": true
    },
    "useRouter": {
      "type": "boolean",
      "default": true
    }
  },
  "prompts": [
    {
      "type": "input",
      "name": "projectName",
      "message": "请输入项目名称",
      "default": "my-app"
    },
    {
      "type": "confirm",
      "name": "usePinia",
      "message": "是否使用 Pinia 状态管理？",
      "default": true
    }
  ],
  "postActions": [
    "cd {{targetDir}} && npm install",
    "git init"
  ],
  "ignore": ["**/.git", "**/node_modules", "forge.json"]
}
```

**配置字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 模板名称 |
| description | string | 是 | 模板描述 |
| root | string | 是 | 模板在仓库中的根路径 |
| repo | string | 否 | 模板仓库地址（覆盖全局配置） |
| branch | string | 否 | Git 分支（默认：main） |
| variables | object | 否 | 变量定义 |
| prompts | array | 否 | 交互式提示配置 |
| postActions | array | 否 | 生成后执行的操作 |
| ignore | array | 否 | 忽略的文件模式 |

## 🛠️ 开发

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/PUITO/forge-scaffold-cli.git
cd forge-scaffold-cli

# 安装依赖
npm install

# 构建
npm run build

# 本地测试
npm link

# 运行 CLI
forge --help
```

### 快速开发模板（使用本地路径）

在开发模板时，可以使用本地路径来避免每次都从远程仓库下载，大幅提升开发效率：

```bash
# 1. 准备模板目录
mkdir my-template
cd my-template

# 2. 创建 forge.json
echo '{
  "name": "my-template",
  "description": "我的测试模板",
  "root": "."
}' > forge.json

# 3. 添加模板文件
echo "Hello <%= projectName %>" > README.md.ejs

# 4. 使用本地路径测试
forge create ./my-template --name test-project
```

**优势：**
- 无需推送到 Git 仓库
- 修改后立即生效
- 适合快速迭代和调试

### 项目结构

```
forge-scaffold-cli/
├── .github/workflows/
│   └── ci.yml              # GitHub Actions CI/CD
├── bin/
│   └── forge.js            # CLI 入口文件
├── scripts/
│   ├── version.cjs         # 版本管理脚本
│   └── release.cjs         # 发布脚本
├── src/
│   ├── cli.ts              # CLI 命令定义
│   ├── config.ts           # 配置管理
│   ├── generator.ts        # 项目生成核心
│   └── template-loader.ts  # 模板加载器
├── dist/                   # 编译输出
├── package.json
├── tsconfig.json
├── .npmignore
├── README.md               # 项目主文档
├── USAGE.md                # 使用指南
├── TEMPLATE_GUIDE.md       # 模板开发指南
├── RELEASE_GUIDE.md        # 版本发布指南
└── PUBLISH.md              # 发布流程快速参考
```

### 版本发布

使用自动化脚本简化发布流程：

```bash
# 1. 更新版本号（选择适当的类型）
npm run version:patch   # 补丁版本: 1.0.0 -> 1.0.1
npm run version:minor   # 次版本: 1.0.0 -> 1.1.0
npm run version:major   # 主版本: 1.0.0 -> 2.0.0

# 2. 发布（创建标签并推送到 GitHub）
npm run release
```

GitHub Actions 会自动构建并发布到 Releases。

详细发布流程请参考 [PUBLISH.md](./PUBLISH.md) 和 [RELEASE_GUIDE.md](./RELEASE_GUIDE.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🔗 相关链接

- [GitHub 仓库](https://github.com/PUITO/forge-scaffold-cli)
- [Releases 发布页](https://github.com/PUITO/forge-scaffold-cli/releases)
- [使用指南](./USAGE.md)
- [模板开发指南](./TEMPLATE_GUIDE.md)
- [版本发布指南](./RELEASE_GUIDE.md)
- [模板仓库](https://github.com/PUITO/forge-templates)
- [问题反馈](https://github.com/PUITO/forge-scaffold-cli/issues)
