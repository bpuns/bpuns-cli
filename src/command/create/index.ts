import { promises as fs } from 'fs'
import { COMMAND, EXEC_NAME } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { quiz, QUIZ_TYPE } from 'src/quiz'
import path from 'path'
import { exec, message } from 'src/utils'
import {
  USE_CSS_PREPROCESSOR,
  USE_ESLINT,
  USE_FRAME,
  USE_TS,
  USE_YARN
} from './utils/type'
import {
  createEslint,
  createHtml,
  createPackage,
  createSrc,
  createTsConfig,
  createViteConfig
} from './utils/createFiles'
import type { CreateQuestion, CreateAnswer } from './utils/type'

/** 启动 */
export default class CreateCommand extends CommandAbs {

  public description = '创建前端项目'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.CREATE} 项目名`
  public commandName: COMMAND = COMMAND.CREATE
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  /** 项目名 */
  projectName!: string
  /** 项目路径 */
  projectPath!: string

  public async exec([ projectName ]) {

    this.projectName = projectName
    this.projectPath = path.join(process.cwd(), projectName)

    // 判断当前目录下是否存在此文件夹
    if (await this.isExistFolder(this.projectPath)) {
      return message.error('创建失败', `当前目录下已存在 ${projectName} 这个文件夹`)
    }

    // 获取问题
    const answer = await this.question()

    if (answer[0] === USE_FRAME.VUE2 && answer[1] === USE_TS.YES) {
      answer[1] = USE_TS.NO
      message.warn('vue2永远不会集成typescript')
    }

    if ((answer[0] === USE_FRAME.VUE2 || answer[0] === USE_FRAME.VUE3) && answer[2] === USE_ESLINT.YES) {
      answer[2] = USE_ESLINT.NO
      message.warn('vue暂时不会集成eslint')
    }

    let isSuccess = false

    try {
      await this.createProject(answer)
      message.success('创建成功')
      isSuccess = true
    } catch (e) {
      // 删除创建的目录
      this.allCommand.get(COMMAND.SMASH)?.exec([ projectName ])
      message.error('创建失败', e)
    }

    if (isSuccess) {
      try {
        // 打开vscode
        exec('code', [ './' ], { cwd: this.projectPath })
      } catch (e) { }
    }

  }

  /** 提出问题 */
  question = (): Promise<CreateAnswer> => {
    return quiz<CreateQuestion>([
      {
        type:    QUIZ_TYPE.SINGLE_CHOICE,
        title:   '请选择要使用框架？',
        default: USE_FRAME.REACT17,
        list:    [
          { id: USE_FRAME.VUE2, label: 'vue2' },
          { id: USE_FRAME.VUE3, label: 'vue3' },
          { id: USE_FRAME.REACT17, label: 'react17' },
          { id: USE_FRAME.REACT18, label: 'react18' }
        ]
      },
      {
        type:    QUIZ_TYPE.SINGLE_CHOICE,
        title:   '是否集成Typescript？',
        default: USE_TS.NO,
        list:    [
          { id: USE_TS.YES, label: '是' },
          { id: USE_TS.NO, label: '否' }
        ]
      },
      {
        type:    QUIZ_TYPE.SINGLE_CHOICE,
        title:   '是否集成Eslint？',
        default: USE_ESLINT.NO,
        list:    [
          { id: USE_ESLINT.YES, label: '是' },
          { id: USE_ESLINT.NO, label: '否' }
        ]
      },
      {
        type:    QUIZ_TYPE.SINGLE_CHOICE,
        title:   '选择使用css预处理器？',
        default: USE_CSS_PREPROCESSOR.NO,
        list:    [
          { id: USE_CSS_PREPROCESSOR.NO, label: '不使用css预处理器' },
          { id: USE_CSS_PREPROCESSOR.LESS, label: '使用Less' },
          { id: USE_CSS_PREPROCESSOR.SCSS, label: '使用Scss' }
        ]
      },
      {
        type:    QUIZ_TYPE.SINGLE_CHOICE,
        title:   '使用yarn安装',
        default: USE_YARN.YES,
        list:    [
          { id: USE_YARN.YES, label: '使用yarn' },
          { id: USE_YARN.NO, label: '使用npm安装' }
        ]
      }
    ])
  }

  /** 创建项目
   * @param answer 
   */
  createProject = async (answer: CreateAnswer) => {
    // 创建文件夹
    await fs.mkdir(this.projectPath)
    // 创建文件
    await Promise.all([
      createPackage.call(this, answer),
      createHtml.call(this, answer),
      createTsConfig.call(this, answer),
      createSrc.call(this, answer),
      createViteConfig.call(this, answer),
      createEslint.call(this, answer)
    ])
    // 安装依赖
    if (answer[4] === USE_YARN.YES) {
      await exec('yarn', undefined, { cwd: this.projectPath, stdio: 'inherit' })
    } else {
      await exec('npm', [ 'i' ], { cwd: this.projectPath, stdio: 'inherit' })
    }
  }

  /** 查询当前目录下是否有同名文件夹
 * @param fileName 
 * @returns 
 */
  async isExistFolder(projectPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(projectPath)
      return stat.isDirectory()
    } catch (e) {
      return false
    }
  }

  public verifyCommandArr(commandArr: string[]): boolean {
    return commandArr.length === 1 || this.formatError()
  }

}

export type CreateCommandClass = CreateCommand