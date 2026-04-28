# Forge - 项目脚手架工具

[![CI](https://github.com/PUITO/forge-scaffold-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/PUITO/forge-scaffold-cli/actions/workflows/ci.yml)
[![GitHub Release](https://img.shields.io/github/v/release/PUITO/forge-scaffold-cli)](https://github.com/PUITO/forge-scaffold-cli/releases)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Forge 是一个强大的通用项目脚手架工具，用于快速生成各种项目模板。支持配置驱动的模板系统、动态变量替换和多仓库管理。

> **安全提示**：为避免 NPM 包投毒风险，Forge 不发布到 NPM 公共仓库。请通过 Git 仓库直接安装或下载发布版本使用。

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

### 方式一：从 Git 仓库安装（推荐）

```bash
npm install -g git+https://github.com/PUITO/forge-scaffold-cli.git
```

或者指定分支：

```bash
npm install -g git+https://github.com/PUITO/forge-scaffold-cli.git#main
```

### 方式二：下载发布版本

1. 访问 [Releases 页面](https://github.com/PUITO/forge-scaffold-cli/releases)
2. 下载最新版本的 zip 包
3. 解压到任意目录
4. 添加 `bin` 目录到系统 PATH，或使用以下方式运行：

```bash
# Linux/macOS
chmod +x bin/forge.js
./bin/forge.js --version

# Windows
node bin/forge.js --version
```

### 方式三：克隆仓库本地安装

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

### 验证安装

```bash
forge --version
```

## 🚀 快速开始

### 1. 创建新项目

```bash
forge create <template-name> --name my-project
```

例如：

```bash
forge create vue3-vite --name my-dashboard
forge create react-ts-vite --name my-app
forge create android-compose --name MyAwesomeApp
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
