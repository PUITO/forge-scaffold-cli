# 模板开发指南

本指南将教你如何创建自己的 Forge 模板，从基础结构到高级功能。

## 目录

- [模板结构](#模板结构)
- [配置文件 forge.json](#配置文件-forgejson)
- [EJS 模板语法](#ejs-模板语法)
- [变量定义](#变量定义)
- [交互式提示](#交互式提示)
- [Post Actions](#post-actions)
- [文件忽略规则](#文件忽略规则)
- [示例：创建 Vue 3 模板](#示例创建-vue-3-模板)
- [测试模板](#测试模板)
- [发布模板](#发布模板)

---

## 模板结构

### 基本目录结构

```
forge-templates/
├── templates/
│   ├── my-template/          # 你的模板目录
│   │   ├── forge.json        # 模板配置（必需）
│   │   ├── src/              # 项目源文件
│   │   ├── package.json.ejs  # EJS 模板文件
│   │   └── README.md
│   └── another-template/
├── shared/                   # 共享资源（可选）
└── templates-registry.json   # 模板注册表
```

### 关键文件说明

| 文件/目录 | 说明 | 是否必需 |
|-----------|------|----------|
| forge.json | 模板配置文件 | 是 |
| *.ejs | EJS 模板文件 | 可选 |
| 其他文件 | 普通项目文件 | 可选 |

---

## 配置文件 forge.json

`forge.json` 是模板的核心配置文件，定义了模板的元数据、变量、提示等。

### 完整配置示例

```json
{
  "name": "vue3-vite",
  "description": "Vue 3 + Vite + TypeScript 项目模板",
  "root": "templates/vue3-vite",
  "repo": "https://github.com/PUITO/forge-templates.git",
  "branch": "main",
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
    },
    "cssFramework": {
      "type": "select",
      "options": ["none", "tailwind", "unocss"],
      "default": "none"
    }
  },
  "prompts": [
    {
      "type": "input",
      "name": "projectName",
      "message": "请输入项目名称",
      "default": "my-app",
      "validate": "required"
    },
    {
      "type": "confirm",
      "name": "usePinia",
      "message": "是否使用 Pinia 状态管理？",
      "default": true
    },
    {
      "type": "confirm",
      "name": "useRouter",
      "message": "是否使用 Vue Router？",
      "default": true
    },
    {
      "type": "list",
      "name": "cssFramework",
      "message": "选择 CSS 框架",
      "choices": [
        { "name": "无", "value": "none" },
        { "name": "Tailwind CSS", "value": "tailwind" },
        { "name": "UnoCSS", "value": "unocss" }
      ]
    }
  ],
  "postActions": [
    "cd {{targetDir}} && npm install",
    "git init",
    "git add .",
    "git commit -m 'Initial commit from Forge'"
  ],
  "ignore": [
    "**/.git",
    "**/node_modules",
    "forge.json"
  ]
}
```

### 配置字段详解

#### 基础字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 模板唯一标识符 |
| description | string | 是 | 模板描述信息 |
| root | string | 是 | 模板在仓库中的路径 |
| repo | string | 否 | 模板仓库地址（覆盖全局） |
| branch | string | 否 | Git 分支名（默认：main） |

#### variables 字段

定义模板可用的变量及其属性：

```json
"variables": {
  "变量名": {
    "type": "string|boolean|number|select",
    "required": true|false,
    "default": "默认值",
    "options": ["选项1", "选项2"]  // 仅 select 类型需要
  }
}
```

**支持的类型：**

- `string`: 字符串
- `boolean`: 布尔值
- `number`: 数字
- `select`: 选择项（需提供 options 数组）

#### prompts 字段

定义用户交互提示，使用 [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) 格式：

**支持的提示类型：**

- `input`: 文本输入
- `confirm`: 是/否确认
- `list`: 单选列表
- `rawlist`: 原始列表
- `checkbox`: 多选框
- `password`: 密码输入

**通用属性：**

```json
{
  "type": "input",
  "name": "变量名",
  "message": "提示信息",
  "default": "默认值",
  "validate": "验证规则",
  "when": "显示条件"
}
```

#### postActions 字段

定义项目生成后执行的命令：

```json
"postActions": [
  "cd {{targetDir}} && npm install",
  "cd {{targetDir}} && npm run build"
]
```

**可用变量：**

- `{{targetDir}}`: 项目生成的目标目录

#### ignore 字段

定义生成时忽略的文件模式：

```json
"ignore": [
  "**/.git",
  "**/node_modules",
  "**/*.log",
  "forge.json"
]
```

支持 glob 模式匹配。

---

## EJS 模板语法

Forge 使用 EJS (Embedded JavaScript) 作为模板引擎。

### 基本语法

#### 输出变量

```ejs
<!-- 简单输出 -->
<h1><%= projectName %></h1>

<!-- 转义输出（HTML 实体编码） -->
<p><%- description %></p>
```

#### 条件语句

```ejs
<% if (usePinia) { %>
import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)
<% } %>
```

#### 循环语句

```ejs
<% dependencies.forEach(function(dep) { %>
"<%= dep.name %>": "<%= dep.version %>",
<% }); %>
```

或者使用 for...of：

```ejs
<% for (const dep of dependencies) { %>
"<%= dep.name %>": "<%= dep.version %>",
<% } %>
```

#### 包含子模板

```ejs
<%- include('partials/header', { title: projectName }) %>
```

### 实用示例

#### package.json 模板

```json
{
  "name": "<%= projectName %>",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0"
    <% if (usePinia) { %>,
    "pinia": "^2.1.0"
    <% } %>
    <% if (useRouter) { %>,
    "vue-router": "^4.2.0"
    <% } %>
  }
}
```

#### TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### 条件导入

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

<% if (usePinia) { %>
import { createPinia } from 'pinia'
<% } %>

<% if (useRouter) { %>
import router from './router'
<% } %>

const app = createApp(App)

<% if (usePinia) { %>
app.use(createPinia())
<% } %>

<% if (useRouter) { %>
app.use(router)
<% } %>

app.mount('#app')
```

---

## 变量定义

### 变量命名规范

- 使用 camelCase：`projectName`, `usePinia`
- 避免特殊字符和空格
- 保持语义清晰

### 常用变量

| 变量名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| projectName | string | 项目名称 | my-app |
| packageName | string | 包名 | com.example.app |
| version | string | 版本号 | 1.0.0 |
| author | string | 作者名 | Your Name |
| description | string | 项目描述 | A Vue 3 project |
| useTypeScript | boolean | 是否使用 TS | true |
| useLinting | boolean | 是否使用代码检查 | true |

### 变量传递

变量通过以下方式传递到模板：

1. **命令行参数**：`--name my-app` → `projectName`
2. **交互式 prompts**：用户输入
3. **默认值**：forge.json 中定义的 default

---

## 交互式提示

### 输入框 (input)

```json
{
  "type": "input",
  "name": "projectName",
  "message": "项目名称",
  "default": "my-app",
  "validate": {
    "validator": "^[a-z][a-z0-9-]*$",
    "message": "项目名称只能包含小写字母、数字和连字符"
  }
}
```

### 确认框 (confirm)

```json
{
  "type": "confirm",
  "name": "useTypeScript",
  "message": "是否使用 TypeScript？",
  "default": true
}
```

### 列表选择 (list)

```json
{
  "type": "list",
  "name": "cssFramework",
  "message": "选择 CSS 框架",
  "choices": [
    { "name": "无", "value": "none" },
    { "name": "Tailwind CSS", "value": "tailwind" },
    { "name": "Bootstrap", "value": "bootstrap" }
  ],
  "default": "none"
}
```

### 多选框 (checkbox)

```json
{
  "type": "checkbox",
  "name": "features",
  "message": "选择需要的功能",
  "choices": [
    { "name": "Vue Router", "value": "router", "checked": true },
    { "name": "Pinia", "value": "pinia", "checked": true },
    { "name": "ESLint", "value": "eslint" },
    { "name": "Prettier", "value": "prettier" }
  ]
}
```

### 条件显示

使用 `when` 字段控制提示是否显示：

```json
[
  {
    "type": "confirm",
    "name": "useDatabase",
    "message": "是否使用数据库？",
    "default": false
  },
  {
    "type": "list",
    "name": "databaseType",
    "message": "选择数据库类型",
    "choices": ["MySQL", "PostgreSQL", "MongoDB"],
    "when": "useDatabase"
  }
]
```

---

## Post Actions

### 基本用法

```json
"postActions": [
  "cd {{targetDir}} && npm install",
  "cd {{targetDir}} && git init",
  "cd {{targetDir}} && git add .",
  "cd {{targetDir}} && git commit -m 'Initial commit'"
]
```

### 常用操作

#### 安装依赖

```json
"postActions": [
  "cd {{targetDir}} && npm install"
]
```

#### 初始化 Git

```json
"postActions": [
  "cd {{targetDir}} && git init",
  "cd {{targetDir}} && git add .",
  "cd {{targetDir}} && git commit -m 'Initial commit from Forge'"
]
```

#### 运行构建

```json
"postActions": [
  "cd {{targetDir}} && npm install",
  "cd {{targetDir}} && npm run build"
]
```

#### Android 项目

```json
"postActions": [
  "cd {{targetDir}} && ./gradlew wrapper",
  "cd {{targetDir}} && chmod +x gradlew"
]
```

### 注意事项

- 命令在当前系统 shell 中执行
- 如果命令失败，会显示警告但不会中断流程
- Windows 和 Unix 系统的命令可能不同

---

## 文件忽略规则

### Glob 模式

```json
"ignore": [
  "**/.git",           // 所有 .git 目录
  "**/node_modules",   // 所有 node_modules 目录
  "**/*.log",          // 所有 .log 文件
  "forge.json",        // 根目录的 forge.json
  "**/.DS_Store"       // macOS 系统文件
]
```

### 常见忽略项

```json
"ignore": [
  "**/.git",
  "**/.svn",
  "**/.hg",
  "**/node_modules",
  "**/bower_components",
  "**/.DS_Store",
  "**/Thumbs.db",
  "**/*.log",
  "**/.env",
  "forge.json"
]
```

---

## 示例：创建 Vue 3 模板

### 1. 创建目录结构

```
templates/vue3-vite/
├── forge.json
├── index.html.ejs
├── package.json.ejs
├── tsconfig.json
├── vite.config.ts.ejs
├── src/
│   ├── main.ts.ejs
│   ├── App.vue
│   ├── components/
│   │   └── HelloWorld.vue
│   └── assets/
│       └── logo.png
```

### 2. 编写 forge.json

```json
{
  "name": "vue3-vite",
  "description": "Vue 3 + Vite + TypeScript 项目模板",
  "root": "templates/vue3-vite",
  "variables": {
    "projectName": {
      "type": "string",
      "required": true,
      "default": "vue-app"
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
      "message": "项目名称",
      "default": "vue-app"
    },
    {
      "type": "confirm",
      "name": "usePinia",
      "message": "是否使用 Pinia？",
      "default": true
    },
    {
      "type": "confirm",
      "name": "useRouter",
      "message": "是否使用 Vue Router？",
      "default": true
    }
  ],
  "postActions": [
    "cd {{targetDir}} && npm install"
  ],
  "ignore": [
    "**/.git",
    "**/node_modules",
    "forge.json"
  ]
}
```

### 3. 编写 package.json.ejs

```json
{
  "name": "<%= projectName %>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0"<% if (usePinia) { %>,
    "pinia": "^2.1.0"<% } %><% if (useRouter) { %>,
    "vue-router": "^4.2.0"<% } %>
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0"
  }
}
```

### 4. 编写 main.ts.ejs

```typescript
import { createApp } from 'vue'
import App from './App.vue'

<% if (usePinia) { %>
import { createPinia } from 'pinia'
<% } %>

<% if (useRouter) { %>
import router from './router'
<% } %>

const app = createApp(App)

<% if (usePinia) { %>
app.use(createPinia())
<% } %>

<% if (useRouter) { %>
app.use(router)
<% } %>

app.mount('#app')
```

### 5. 编写 index.html.ejs

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= projectName %></title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

---

## 测试模板

### 本地测试

1. **准备模板仓库**

```bash
git clone https://github.com/yourname/forge-templates.git
cd forge-templates
```

2. **添加模板**

将你的模板添加到 `templates/` 目录。

3. **提交并推送**

```bash
git add .
git commit -m "Add new template: my-template"
git push
```

4. **配置 Forge 使用你的仓库**

```bash
forge config --set "templateRepo=https://github.com/yourname/forge-templates.git"
```

5. **测试生成**

```bash
forge create my-template --name test-project
```

### 调试技巧

1. **查看详细日志**

```bash
export DEBUG=forge:*
forge create my-template --name test-project
```

2. **检查生成的文件**

```bash
cd test-project
ls -la
cat package.json
```

3. **验证变量替换**

检查 `.ejs` 文件是否正确渲染为普通文件。

---

## 发布模板

### 步骤一：准备模板仓库

1. 创建 GitHub 仓库
2. 按照上述结构组织模板
3. 确保每个模板都有 `forge.json`

### 步骤二：更新注册表

编辑 `templates-registry.json`：

```json
{
  "templates": {
    "vue3-vite": {
      "repo": "https://github.com/PUITO/forge-templates.git",
      "root": "templates/vue3-vite",
      "branch": "main",
      "description": "Vue 3 + Vite + TypeScript 项目模板"
    },
    "my-template": {
      "repo": "https://github.com/PUITO/forge-templates.git",
      "root": "templates/my-template",
      "branch": "main",
      "description": "我的自定义模板"
    }
  }
}
```

### 步骤三：提交并推送

```bash
git add .
git commit -m "Add my-template to registry"
git push
```

### 步骤四：通知用户

用户可以通过以下方式获取新模板：

```bash
# 清除缓存
forge update

# 查看新模板
forge list

# 使用新模板
forge create my-template --name my-project
```

---

## 最佳实践

### 1. 保持模板简洁

- 只包含必要的文件和配置
- 避免过多的可选功能
- 使用条件渲染处理变体

### 2. 提供合理的默认值

```json
{
  "variables": {
    "useTypeScript": {
      "type": "boolean",
      "default": true
    }
  }
}
```

### 3. 清晰的提示信息

```json
{
  "prompts": [
    {
      "type": "input",
      "name": "projectName",
      "message": "请输入项目名称（小写字母和连字符）",
      "default": "my-app"
    }
  ]
}
```

### 4. 完善的文档

在每个模板中添加 README.md：

```markdown
# <%= projectName %>

基于 Forge vue3-vite 模板生成的项目。

## 快速开始

```bash
npm install
npm run dev
```

## 功能特性

- Vue 3
- Vite
- TypeScript
<% if (usePinia) { %>- Pinia 状态管理<% } %>
<% if (useRouter) { %>- Vue Router<% } %>
```

### 5. 版本控制

- 为模板添加版本号
- 记录变更日志
- 保持向后兼容

---

## 常见问题

### Q: 如何处理平台特定的命令？

A: 使用条件判断或提供跨平台兼容的命令。

### Q: 可以嵌套使用模板吗？

A: 目前不支持，建议将常用片段放在 `shared/` 目录。

### Q: 如何调试 EJS 模板？

A: 检查生成的文件内容，确认变量是否正确替换。

---

## 下一步

- 查看 [使用指南](./USAGE.md) 了解如何使用 Forge
- 访问 [GitHub 仓库](https://github.com/PUITO/forge-scaffold-cli) 获取更多资源
- 遇到问题？[提交 Issue](https://github.com/PUITO/forge-scaffold-cli/issues)
