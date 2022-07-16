import { COMMAND, EXEC_NAME } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import AddCommand from './children/add'
import RemoveCommand from './children/remove'
import LsCommand from './children/ls'
import { message, exec, clc } from 'src/utils'
import { promises as fs } from 'fs'

/** 快速打开项目 */
export default class FastCommand extends CommandAbs {

  public description = '快速打开一个项目'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.FAST} <索引名>`
  public commandName: COMMAND = COMMAND.FAST
  public childrenCommand: Partial<Record<COMMAND, CommandAbs>> = {
    [COMMAND.FAST_ADD]:    new AddCommand(this.allCommand),
    [COMMAND.FAST_REMOVE]: new RemoveCommand(this.allCommand),
    [COMMAND.FAST_LS]:     new LsCommand(this.allCommand)
  }

  public async exec(command: string[]) {

    const index = command[0]

    const find = (await AddCommand.getFastList()).find(item => item.index === index)
    if (find) {
      const isFolder = await this.#isFolder(find.path)
      if (isFolder) {
        message.success(`找到${index}，正在打开 ${find.path} ，请稍等...`)
        try {
          await exec('code', [ './' ], { cwd: find.path, stdio: 'inherit' })
        } catch (e) {
          console.log('----')
          message.error('打开失败', '可能是电脑上没有安装 vscode，或者没有把 code 命令添加到环境变量中')
        }
      } else {
        message.error('打开失败', `未找到 ${clc.blue(find.path)} 这个路径`)
      }
    } else {
      message.error('没有找到如下的索引', index)
    }
  }

  /** 验证是否是文件夹
   * @param path 
   * @returns 
   */
  async #isFolder(path: string) {
    try {
      const stat = await fs.stat(path)
      return stat.isDirectory()
    } catch (e) {
      return false
    }
  }

  public verifyCommandArr(commandArr: string[]): boolean {
    return commandArr.length === 1 || this.formatError()
  }

}