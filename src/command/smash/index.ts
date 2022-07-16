import { COMMAND } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { message } from 'src/utils'
import { EXEC_NAME } from 'src/constant'
import { promises as fs } from 'fs'
import SmashTestCommand from './children/-t'
import path from 'path'
import rimraf from './tools/delete'

/** 删除文件 */
export default class SmashCommand extends CommandAbs {

  /**
   * 此函数会排除重复的路径, 并且返回存在的文件的完整路径
   * @param filePath 
   */
  static async getExistFilePath(filePath: string[]): Promise<string[]> {

    // 删除当前目录下的所有文件
    // TODO: 以后要加一个提示，是否删除全部
    if (filePath.includes('*')) {
      filePath = await fs.readdir(process.cwd())
    }

    // 用于保存所有完整路径
    const fullPath: string[] = []
    filePath.forEach(item => {
      if (path.isAbsolute(item)) {
        fullPath.push(item)
      } else {
        fullPath.push(path.join(process.cwd(), item))
      }
    })

    // 存储一个散列表，用来排除文件是否存在
    const fileMap = new Map<number, string>()

    // 遍历
    for (let item of fullPath) {
      try {
        const result = await fs.stat(item)
        // 如果文件不存在散列表中，那么就保存起来
        if (!fileMap.has(result.ino)) {
          fileMap.set(result.ino, item)
        }
      } catch (e) { }
    }

    // 生成数组
    return Array.from(fileMap, ([ _, path ]) => path)

  }

  public description = '删除文件'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.SMASH} <文件|文件夹> <文件|文件夹> ...`
  public commandName: COMMAND = COMMAND.SMASH
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined = {
    [COMMAND.SMASH_T]: new SmashTestCommand(this.allCommand)
  }

  // 删除开始时间
  private smashStartTime: number = 0

  public async exec(command: string[]) {

    this.smashStartTime = Date.now()

    // 获取合法的删除文件
    const deleteList = await SmashCommand.getExistFilePath(command)

    // 分类node_modules
    const reg = /node_modules\\{0,2}$/

    const normalList: string[] = []
    const nodeModuleList: string[] = []

    deleteList.forEach(item => {
      (reg.test(item) ? nodeModuleList : normalList).push(item)
    })

    this.deleteFiles(normalList, false)
    this.deleteFiles(nodeModuleList, true)

  }

  /**
   * 删除普通的文件, 直接删除
   * @param files 
   */
  private deleteFiles(files: string[], isNodeModule: boolean) {
    if (files.length !== 0) {
      rimraf(
        files,
        err => {
          if (err) {
            message.error('', err.message)
          } else {
            message.success(`删除成功，用时${(Date.now() - this.smashStartTime) / 1000}s`)
          }
        },
        { isNodeModule }
      )
    }
  }

  public verifyCommandArr(commandArr: string[]): boolean {
    if (commandArr.length < 1) {
      return this.formatError()
    }
    return true
  }

}