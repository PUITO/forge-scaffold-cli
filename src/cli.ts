import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { loadTemplate, listTemplates } from './template-loader';
import { generateProject, executePostActions } from './generator';
import { ensureConfigDir, readConfig, setTemplateRepo, resetConfig, getTemplateRepo, DEFAULT_TEMPLATE_REPO } from './config';

program
  .name('forge')
  .description('Forge - 一键锻造你的项目模板')
  .version('1.0.0');

program
  .command('create <template>')
  .description('创建新项目（支持模板名称或本地路径）')
  .option('-n, --name <name>', '项目名称')
  .option('-p, --path <path>', '生成路径', process.cwd())
  .action(async (templateName: string, opts: any) => {
    const spinner = ora('加载模板...').start();

    try {
      // 确保配置目录存在
      await ensureConfigDir();

      // 加载模板
      const templateConfig = await loadTemplate(templateName);
      spinner.text = '解析配置...';

      // 如果没有提供项目名称，提示用户输入
      let projectName = opts.name;
      if (!projectName) {
        spinner.stop();
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: '请输入项目名称:',
            default: 'my-app'
          }
        ]);
        projectName = answers.projectName;
        spinner.start('继续生成项目...');
      }

      // 如果有 prompts，询问用户
      const prompts = templateConfig.prompts || [];
      let additionalAnswers = {};
      if (prompts.length > 0) {
        spinner.stop();
        additionalAnswers = await inquirer.prompt(prompts);
        spinner.start('继续生成项目...');
      }

      // 合并数据
      const projectData = {
        projectName,
        targetDir: opts.path ? `${opts.path}/${projectName}` : undefined,
        ...additionalAnswers
      };

      // 生成项目
      spinner.text = '生成项目文件...';
      const targetDir = await generateProject(templateConfig, projectData);

      // 执行 postActions
      if (templateConfig.postActions && templateConfig.postActions.length > 0) {
        spinner.text = '执行后续操作...';
        await executePostActions(templateConfig.postActions, targetDir);
      }

      spinner.succeed(chalk.green(`✅ 项目 ${projectName} 创建成功！`));
      console.log(chalk.cyan(`   cd ${targetDir}`));
      console.log(chalk.cyan(`   查看 README.md 了解如何运行项目`));
    } catch (err: any) {
      spinner.fail(chalk.red('生成失败：' + err.message));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('列出可用模板')
  .action(async () => {
    const spinner = ora('获取模板列表...').start();

    try {
      await ensureConfigDir();
      const templates = await listTemplates();
      spinner.stop();

      if (Object.keys(templates).length === 0) {
        console.log(chalk.yellow('暂无可用模板'));
        console.log(chalk.gray('请确保模板仓库已正确配置'));
        return;
      }

      console.log(chalk.bold('\n可用模板:\n'));
      for (const [name, info] of Object.entries(templates)) {
        console.log(chalk.cyan(`  ${name}`));
        console.log(chalk.gray(`    ${(info as any).description || '无描述'}`));
        console.log();
      }
    } catch (err: any) {
      spinner.fail(chalk.red('获取模板列表失败：' + err.message));
      process.exit(1);
    }
  });

program
  .command('update [template]')
  .description('更新模板缓存')
  .action(async (templateName?: string) => {
    const spinner = ora('更新模板缓存...').start();

    try {
      await ensureConfigDir();

      const fs = await import('fs-extra');
      const { CACHE_DIR } = await import('./config');

      if (templateName) {
        // 更新指定模板
        const templateCacheDir = `${CACHE_DIR}/${templateName}`;
        if (await fs.pathExists(templateCacheDir)) {
          await fs.remove(templateCacheDir);
          spinner.succeed(chalk.green(`模板 ${templateName} 缓存已清除`));
          console.log(chalk.gray('下次使用时将自动重新下载'));
        } else {
          spinner.warn(chalk.yellow(`模板 ${templateName} 缓存不存在`));
        }
      } else {
        // 清除所有缓存
        if (await fs.pathExists(CACHE_DIR)) {
          await fs.emptyDir(CACHE_DIR);
          spinner.succeed(chalk.green('所有模板缓存已清除'));
          console.log(chalk.gray('下次使用时将自动重新下载'));
        } else {
          spinner.warn(chalk.yellow('缓存目录不存在'));
        }
      }
    } catch (err: any) {
      spinner.fail(chalk.red('更新失败：' + err.message));
      process.exit(1);
    }
  });

program
  .command('config')
  .description('管理配置')
  .option('-s, --set <key=value>', '设置配置项')
  .option('-g, --get <key>', '获取配置项')
  .option('-l, --list', '列出所有配置')
  .option('-r, --reset', '重置为默认配置')
  .action(async (opts: any) => {
    try {
      await ensureConfigDir();

      // 列出配置
      if (opts.list) {
        const config = await readConfig();
        console.log(chalk.bold('\n当前配置:\n'));
        console.log(chalk.cyan(`  模板仓库: ${config.templateRepo}`));
        console.log(chalk.cyan(`  缓存启用: ${config.cacheEnabled ? '是' : '否'}`));
        console.log();
        return;
      }

      // 获取配置
      if (opts.get) {
        const config = await readConfig();
        const value = config[opts.get];
        if (value !== undefined) {
          console.log(value);
        } else {
          console.log(chalk.yellow(`配置项 '${opts.get}' 不存在`));
        }
        return;
      }

      // 设置配置
      if (opts.set) {
        const [key, value] = opts.set.split('=');
        if (!key || !value) {
          console.log(chalk.red('错误: 请使用格式 --set key=value'));
          process.exit(1);
        }

        if (key === 'templateRepo') {
          await setTemplateRepo(value);
          console.log(chalk.green(`✅ 模板仓库地址已设置为: ${value}`));
        } else {
          console.log(chalk.yellow(`不支持的配置项: ${key}`));
          console.log(chalk.gray('支持的配置项: templateRepo'));
        }
        return;
      }

      // 重置配置
      if (opts.reset) {
        await resetConfig();
        console.log(chalk.green('✅ 配置已重置为默认值'));
        console.log(chalk.gray(`默认模板仓库: ${DEFAULT_TEMPLATE_REPO}`));
        return;
      }

      // 如果没有提供任何选项，显示当前模板仓库
      const repo = await getTemplateRepo();
      console.log(chalk.bold('\n当前模板仓库:'));
      console.log(chalk.cyan(`  ${repo}`));
      console.log();
      console.log(chalk.gray('使用 forge config --help 查看更多选项'));
    } catch (err: any) {
      console.log(chalk.red('配置操作失败：' + err.message));
      process.exit(1);
    }
  });

program.parse();
