import degit from 'degit';
import fs from 'fs-extra';
import path from 'path';
import { getTemplateRepo, CACHE_DIR, REGISTRY_FILE } from './config';

/**
 * 模板配置接口
 */
export interface TemplateConfig {
  name: string;
  description: string;
  root: string;
  repo?: string;
  branch?: string;
  variables?: Record<string, VariableDefinition>;
  prompts?: Array<{
    type: string;
    name: string;
    message: string;
    default?: any;
    choices?: any[];
  }>;
  postActions?: string[];
  ignore?: string[];
  cacheDir?: string;
}

/**
 * 变量定义接口
 */
export interface VariableDefinition {
  type: string;
  required?: boolean;
  default?: any;
}

/**
 * 注册表接口
 */
interface TemplateRegistry {
  templates: Record<string, {
    repo: string;
    root: string;
    branch?: string;
    description?: string;
  }>;
}

/**
 * 获取模板注册表
 */
async function fetchRegistry(): Promise<TemplateRegistry> {
  const templateRepo = await getTemplateRepo();
  const registryUrl = `${templateRepo.replace('.git', '')}/raw/main/${REGISTRY_FILE}`;

  try {
    // 尝试从远程获取注册表
    const response = await fetch(registryUrl);
    if (response.ok) {
      return (await response.json()) as TemplateRegistry;
    }
  } catch (error) {
    // 如果远程获取失败，使用默认注册表
    console.warn('无法从远程获取注册表，使用默认配置');
  }

  // 返回默认注册表（可以从本地缓存读取）
  return {
    templates: {}
  };
}

/**
 * 加载模板
 * @param templateName 模板名称或本地路径
 * @returns 模板配置
 */
export async function loadTemplate(templateName: string): Promise<TemplateConfig> {
  // 检查是否为本地路径（以 ./ 或 / 开头，或包含 :\ 的 Windows 路径）
  const isLocalPath = templateName.startsWith('./') || 
                      templateName.startsWith('/') || 
                      templateName.startsWith('../') ||
                      /^[a-zA-Z]:\\/.test(templateName);

  if (isLocalPath) {
    return await loadLocalTemplate(templateName);
  }

  // 从远程仓库加载
  return await loadRemoteTemplate(templateName);
}

/**
 * 从本地路径加载模板
 * @param localPath 本地模板路径
 * @returns 模板配置
 */
async function loadLocalTemplate(localPath: string): Promise<TemplateConfig> {
  const absolutePath = path.resolve(process.cwd(), localPath);

  // 检查路径是否存在
  if (!await fs.pathExists(absolutePath)) {
    throw new Error(`本地模板路径不存在: ${absolutePath}`);
  }

  // 读取 forge.json
  const forgeJsonPath = path.join(absolutePath, 'forge.json');
  if (!await fs.pathExists(forgeJsonPath)) {
    throw new Error(`模板缺少 forge.json 配置文件: ${forgeJsonPath}`);
  }

  const forgeJson = await fs.readJson(forgeJsonPath);

  console.log(`使用本地模板: ${absolutePath}`);

  return {
    ...forgeJson,
    cacheDir: absolutePath
  };
}

/**
 * 从远程仓库加载模板
 * @param templateName 模板名称
 * @returns 模板配置
 */
async function loadRemoteTemplate(templateName: string): Promise<TemplateConfig> {
  const registry = await fetchRegistry();
  const templateRepo = await getTemplateRepo();

  // 检查模板是否存在
  const tpl = registry.templates[templateName];

  // 如果没有在注册表中找到，使用默认仓库和路径
  const repo = tpl?.repo || templateRepo;
  const root = tpl?.root || `templates/${templateName}`;
  const branch = tpl?.branch || 'main';

  const cacheDir = path.join(CACHE_DIR, templateName);
  await fs.ensureDir(cacheDir);

  // 使用 degit 下载指定子目录
  const src = `${repo}#${branch}:${root}`;

  console.log(`正在下载模板: ${src}`);

  const degitRepo = degit(src, { mode: 'tar', cache: true, force: true });

  try {
    await degitRepo.clone(cacheDir);
  } catch (error: any) {
    throw new Error(`下载模板失败: ${error.message}`);
  }

  // 读取 forge.json
  const forgeJsonPath = path.join(cacheDir, 'forge.json');
  if (!await fs.pathExists(forgeJsonPath)) {
    throw new Error(`模板 ${templateName} 缺少 forge.json 配置文件`);
  }

  const forgeJson = await fs.readJson(forgeJsonPath);

  return {
    ...forgeJson,
    cacheDir
  };
}

/**
 * 列出可用模板
 */
export async function listTemplates(): Promise<Record<string, any>> {
  const registry = await fetchRegistry();
  return registry.templates;
}
