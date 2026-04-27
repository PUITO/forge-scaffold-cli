import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import { TemplateConfig } from './template-loader';

/**
 * 项目数据接口
 */
export interface ProjectData {
  projectName: string;
  targetDir?: string;
  [key: string]: any;
}

/**
 * 渲染文件内容
 * @param content 文件内容
 * @param data 数据对象
 * @returns 渲染后的内容
 */
function renderContent(content: string, data: Record<string, any>): string {
  return ejs.render(content, data);
}

/**
 * 递归处理目录
 * @param srcDir 源目录
 * @param destDir 目标目录
 * @param data 数据对象
 * @param ignorePatterns 忽略模式
 */
async function processDirectory(
  srcDir: string,
  destDir: string,
  data: Record<string, any>,
  ignorePatterns: string[] = []
): Promise<void> {
  await fs.ensureDir(destDir);

  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    // 检查是否应该忽略
    if (shouldIgnore(entry.name, ignorePatterns)) {
      continue;
    }

    if (entry.isDirectory()) {
      // 递归处理子目录
      await processDirectory(srcPath, destPath, data, ignorePatterns);
    } else if (entry.isFile()) {
      // 处理文件
      await processFile(srcPath, destPath, data);
    }
  }
}

/**
 * 检查文件是否应该被忽略
 * @param filename 文件名
 * @param patterns 忽略模式
 * @returns 是否应该忽略
 */
function shouldIgnore(filename: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    // 简单的 glob 匹配
    if (pattern.startsWith('**/')) {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\./g, '\\.'));
      if (regex.test(filename)) {
        return true;
      }
    } else if (filename === pattern || filename.includes(pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * 处理单个文件
 * @param srcPath 源文件路径
 * @param destPath 目标文件路径
 * @param data 数据对象
 */
async function processFile(
  srcPath: string,
  destPath: string,
  data: Record<string, any>
): Promise<void> {
  const content = await fs.readFile(srcPath, 'utf-8');

  // 检查是否是 EJS 模板文件
  if (srcPath.endsWith('.ejs')) {
    // 渲染 EJS 模板
    const rendered = renderContent(content, data);

    // 移除 .ejs 后缀
    const finalDestPath = destPath.replace(/\.ejs$/, '');

    await fs.writeFile(finalDestPath, rendered, 'utf-8');
  } else {
    // 直接复制非模板文件
    await fs.copyFile(srcPath, destPath);
  }
}

/**
 * 生成项目
 * @param templateConfig 模板配置
 * @param projectData 项目数据
 * @returns 目标目录路径
 */
export async function generateProject(
  templateConfig: TemplateConfig,
  projectData: ProjectData
): Promise<string> {
  const { cacheDir, name } = templateConfig;

  if (!cacheDir) {
    throw new Error('模板缓存目录未设置');
  }

  // 确定目标目录
  const targetDir = projectData.targetDir || path.join(process.cwd(), projectData.projectName);

  // 确保目标目录存在
  await fs.ensureDir(targetDir);

  console.log(`正在生成项目到: ${targetDir}`);

  // 处理模板目录
  await processDirectory(
    cacheDir,
    targetDir,
    { ...projectData, targetDir },
    templateConfig.ignore || ['**/.git', '**/node_modules', 'forge.json']
  );

  return targetDir;
}

/**
 * 执行 post actions
 * @param actions 动作列表
 * @param targetDir 目标目录
 */
export async function executePostActions(
  actions: string[],
  targetDir: string
): Promise<void> {
  const { execSync } = await import('child_process');

  for (const action of actions) {
    // 替换变量
    const command = action.replace(/\{\{targetDir\}\}/g, targetDir);

    try {
      console.log(`执行: ${command}`);
      execSync(command, {
        stdio: 'inherit',
        cwd: targetDir
      });
    } catch (error: any) {
      console.warn(`命令执行失败: ${command}`, error.message);
    }
  }
}
