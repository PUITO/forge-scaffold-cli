# Forge - 项目脚手架

Forge 是一个通用的项目脚手架工具，用于快速生成各种项目模板。

## 特性

- **单 Git 仓库管理**：所有模板统一放在一个 Git 仓库中
- **子模板独立管理**：每个子模板支持独立开发、提交和历史查看
- **配置驱动**：通过 `forge.json` 配置文件控制变量、提示和后续操作
- **动态生成**：支持 EJS 模板引擎进行变量替换
- **多语言支持**：微信小程序、安卓（Compose）、Vue3、React TS、Python 等

## 安装

```bash
npm install -g forge
```

## 使用

### 创建新项目

```bash
forge create <template-name> --name my-project
```

例如：

```bash
forge create android-compose --name MyAwesomeApp
forge create vue3-vite --name my-dashboard
forge create react-ts-vite --name my-app
```

### 列出可用模板

```bash
forge list
```

### 更新模板缓存

```bash
# 更新所有模板缓存
forge update

# 更新指定模板缓存
forge update android-compose
```

## 模板配置

每个模板需要在根目录包含 `forge.json` 配置文件：

```json
{
  "name": "template-name",
  "description": "模板描述",
  "root": "templates/template-name",
  "variables": {
    "projectName": { "type": "string", "required": true, "default": "MyApp" },
    "packageName": { "type": "string", "default": "com.example.app" }
  },
  "prompts": [
    { "type": "input", "name": "projectName", "message": "项目名称" }
  ],
  "postActions": [
    "cd {{targetDir}} && npm install",
    "git init"
  ],
  "ignore": ["**/.git", "**/node_modules"]
}
```

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 本地测试
npm link
```

## License

MIT
