import os from 'os';
import path from 'path';
import fs from 'fs-extra';

// 默认模板仓库地址
export const DEFAULT_TEMPLATE_REPO = 'https://github.com/PUITO/forge-templates.git';

// 缓存目录
export const CACHE_DIR = path.join(os.homedir(), '.forge', 'cache');

// 配置文件路径
export const CONFIG_DIR = path.join(os.homedir(), '.forge');

// 配置文件
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// 注册表文件名
export const REGISTRY_FILE = 'templates-registry.json';

/**
 * 配置接口
 */
export interface ForgeConfig {
  templateRepo: string;
  cacheEnabled: boolean;
  [key: string]: any;
}

/**
 * 默认配置
 */
const defaultConfig: ForgeConfig = {
  templateRepo: DEFAULT_TEMPLATE_REPO,
  cacheEnabled: true
};

/**
 * 获取缓存目录
 */
export function getCacheDir(templateName: string): string {
  return path.join(CACHE_DIR, templateName);
}

/**
 * 确保配置目录存在
 */
export async function ensureConfigDir(): Promise<void> {
  await fs.ensureDir(CONFIG_DIR);
  await fs.ensureDir(CACHE_DIR);
}

/**
 * 读取配置
 */
export async function readConfig(): Promise<ForgeConfig> {
  await ensureConfigDir();

  try {
    if (await fs.pathExists(CONFIG_FILE)) {
      const userConfig = await fs.readJson(CONFIG_FILE);
      return { ...defaultConfig, ...userConfig };
    }
  } catch (error) {
    console.warn('读取配置文件失败，使用默认配置');
  }

  return defaultConfig;
}

/**
 * 保存配置
 */
export async function saveConfig(config: Partial<ForgeConfig>): Promise<void> {
  await ensureConfigDir();

  const currentConfig = await readConfig();
  const newConfig = { ...currentConfig, ...config };

  await fs.writeJson(CONFIG_FILE, newConfig, { spaces: 2 });
}

/**
 * 获取模板仓库地址
 */
export async function getTemplateRepo(): Promise<string> {
  const config = await readConfig();
  return config.templateRepo;
}

/**
 * 设置模板仓库地址
 */
export async function setTemplateRepo(repo: string): Promise<void> {
  await saveConfig({ templateRepo: repo });
}

/**
 * 重置配置到默认值
 */
export async function resetConfig(): Promise<void> {
  await ensureConfigDir();
  await fs.writeJson(CONFIG_FILE, defaultConfig, { spaces: 2 });
}
