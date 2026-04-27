# Forge 使用指南

本指南将帮助你快速上手 Forge 脚手架工具，从基础用法到高级功能。

## 目录

- [安装](#安装)
- [基本用法](#基本用法)
- [配置管理](#配置管理)
- [模板使用](#模板使用)
- [高级功能](#高级功能)
- [常见问题](#常见问题)

---

## 安装

### 系统要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装步骤

#### 方式一：从 NPM 安装（推荐）

```bash
npm install -g @puito/forge
```

#### 方式二：从 Git 仓库安装

```bash
npm install -g git+https://github.com/PUITO/forge-scaffold-cli.git
```

#### 验证安装

```bash
forge --version
# 输出: 1.0.0
```

---

## 基本用法

### 查看帮助

```bash
# 查看所有命令
forge --help

# 查看特定命令帮助
forge create --help
forge config --help
```

### 创建新项目

这是最常用的命令，用于从模板生成新项目。

#### 基本用法

```bash
forge create <template-name> --name <project-name>
```

**示例：**

```bash
# 创建一个 Vue 3 项目
forge create vue3-vite --name my-vue-app

# 创建一个 React 项目
forge create react-ts-vite --name my-react-app

# 创建一个微信小程序项目
forge create wechat-mini-program --name my-wechat-app
```

#### 指定生成路径

```bash
# 在当前目录下生成
forge create vue3-vite --name my-app

# 在指定路径下生成
forge create vue3-vite --name my-app --path ./projects

# 使用绝对路径
forge create vue3-vite --name my-app --path /Users/username/projects
```

#### 交互式创建

如果不提供 `--name` 参数，Forge 会提示你输入项目名称：

```bash
forge create vue3-vite

# 输出：
# ? 请输入项目名称: my-app
```

如果模板定义了额外的 prompts，也会依次询问：

```bash
forge create android-compose

# 输出：
# ? 请输入项目名称: MyApp
# ? 包名 (com.example.app): com.mycompany.myapp
# ? 是否使用 Hilt? (Y/n): Y
```

### 列出可用模板

查看当前配置的模板仓库中有哪些可用的模板：

```bash
forge list
```

**输出示例：**

```
可用模板:

  vue3-vite
    Vue 3 + Vite + TypeScript 项目模板

  react-ts-vite
    React + TypeScript + Vite 项目模板

  android-compose
    Android Jetpack Compose 项目模板

  wechat-mini-program
    微信小程序项目模板
```

### 更新模板缓存

Forge 会缓存下载的模板以提高速度。你可以手动管理缓存：

```bash
# 清除所有模板缓存
forge update

# 清除指定模板的缓存
forge update vue3-vite
```

清除缓存后，下次使用时会自动重新下载最新版本的模板。

---

## 配置管理

Forge 支持配置自定义模板仓库地址，方便团队使用私有模板。

### 查看当前配置

```bash
# 简洁模式：只显示模板仓库
forge config

# 详细模式：显示所有配置
forge config --list
```

**输出示例：**

```
当前配置:

  模板仓库: https://github.com/PUITO/forge-templates.git
  缓存启用: 是
```

### 设置模板仓库

如果你有自己的模板仓库，可以配置为使用它：

```bash
forge config --set "templateRepo=https://github.com/yourname/your-templates.git"
```

**使用场景：**

- **团队私有模板**：公司内部的项目模板
- **自定义模板集合**：个人常用的模板组合
- **测试新模板**：在正式发布前测试新模板

### 获取配置项

```bash
# 获取模板仓库地址
forge config --get templateRepo

# 获取缓存设置
forge config --get cacheEnabled
```

### 重置配置

恢复到默认配置：

```bash
forge config --reset
```

这会将模板仓库重置为默认的 `https://github.com/PUITO/forge-templates.git`。

### 配置文件位置

Forge 的配置保存在用户主目录：

- **Linux/macOS**: `~/.forge/config.json`
- **Windows**: `%USERPROFILE%\.forge\config.json`

你可以直接编辑这个文件来修改配置：

```json
{
  "templateRepo": "https://github.com/PUITO/forge-templates.git",
  "cacheEnabled": true
}
```

---

## 模板使用

### 理解模板结构

每个模板在仓库中的结构如下：

```
templates/
└── vue3-vite/              # 模板名称
    ├── forge.json          # 模板配置
    ├── src/                # 项目源文件
    │   ├── App.vue.ejs     # EJS 模板文件
    │   └── main.ts.ejs
    ├── package.json.ejs
    ├── tsconfig.json
    └── README.md
```

### 模板变量替换

Forge 使用 EJS 模板引擎进行变量替换。在模板文件中，你可以使用以下语法：

```ejs
<!-- 简单变量 -->
<h1><%= projectName %></h1>

<!-- 条件渲染 -->
<% if (usePinia) { %>
import { createPinia } from 'pinia'
<% } %>

<!-- 循环 -->
<% dependencies.forEach(function(dep) { %>
"<%= dep.name %>": "<%= dep.version %>",
<% }); %>
```

### 常见模板变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| projectName | 项目名称 | my-app |
| targetDir | 目标目录路径 | /path/to/my-app |
| templateName | 模板名称 | vue3-vite |

### Post Actions

模板可以定义生成后执行的操作，例如安装依赖、初始化 Git 等：

```json
{
  "postActions": [
    "cd {{targetDir}} && npm install",
    "cd {{targetDir}} && git init",
    "cd {{targetDir}} && git add .",
    "cd {{targetDir}} && git commit -m 'Initial commit'"
  ]
}
```

**注意：** `{{targetDir}}` 会被自动替换为实际的项目路径。

---

## 高级功能

### 使用私有模板仓库

#### GitHub 私有仓库

```bash
# 使用 Personal Access Token
forge config --set "templateRepo=https://USERNAME:TOKEN@github.com/org/private-templates.git"
```

#### GitLab 私有仓库

```bash
forge config --set "templateRepo=https://oauth2:TOKEN@gitlab.com/group/templates.git"
```

#### 企业内网仓库

```bash
forge config --set "templateRepo=http://git.company.com/templates.git"
```

### 多仓库切换

你可以在不同项目中使用不同的模板仓库：

```bash
# 为公司项目配置
forge config --set "templateRepo=https://git.company.com/templates.git"
forge create internal-template --name company-project

# 为个人项目切换回公共仓库
forge config --set "templateRepo=https://github.com/PUITO/forge-templates.git"
forge create vue3-vite --name personal-project
```

### 离线使用

Forge 会缓存已下载的模板，所以第二次使用同一模板时可以离线工作：

```bash
# 第一次：需要网络连接
forge create vue3-vite --name app1

# 第二次：使用缓存，无需网络
forge create vue3-vite --name app2
```

如果需要强制重新下载：

```bash
forge update vue3-vite
forge create vue3-vite --name app3
```

### 调试模式

如果遇到错误，可以查看详细日志：

```bash
# 设置环境变量
export DEBUG=forge:*  # Linux/macOS
set DEBUG=forge:*     # Windows

# 运行命令
forge create vue3-vite --name my-app
```

---

## 常见问题

### Q1: 如何查看已安装的 Forge 版本？

```bash
forge --version
```

### Q2: 如何升级 Forge？

```bash
npm update -g @puito/forge
```

### Q3: 模板下载失败怎么办？

1. 检查网络连接
2. 确认模板仓库地址正确
3. 清除缓存重试：

```bash
forge update <template-name>
forge create <template-name> --name my-app
```

### Q4: 如何在 CI/CD 中使用 Forge？

```yaml
# GitHub Actions 示例
- name: Install Forge
  run: npm install -g @puito/forge

- name: Create Project
  run: forge create vue3-vite --name my-app --path ./output
```

### Q5: 配置文件在哪里？

- **Linux/macOS**: `~/.forge/config.json`
- **Windows**: `%USERPROFILE%\.forge\config.json`

### Q6: 如何备份配置？

```bash
# 复制配置文件
cp ~/.forge/config.json ~/config-backup.json

# 恢复配置
cp ~/config-backup.json ~/.forge/config.json
```

### Q7: 支持哪些模板类型？

理论上支持任何类型的项目模板，常见的有：

- Web 前端：Vue、React、Angular、Svelte
- 移动端：Android、iOS、React Native、Flutter
- 后端：Node.js、Python、Java、Go
- 小程序：微信、支付宝、字节跳动
- 桌面应用：Electron、Tauri

### Q8: 如何贡献模板？

1. Fork 模板仓库
2. 添加你的模板到 `templates/` 目录
3. 创建 `forge.json` 配置文件
4. 提交 Pull Request

详见 [模板开发指南](./TEMPLATE_GUIDE.md)。

---

## 下一步

- 阅读 [模板开发指南](./TEMPLATE_GUIDE.md) 学习如何创建自己的模板
- 访问 [GitHub 仓库](https://github.com/PUITO/forge-scaffold-cli) 了解更多信息
- 遇到问题？[提交 Issue](https://github.com/PUITO/forge-scaffold-cli/issues)
