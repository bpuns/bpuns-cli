import { COMMAND } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { message } from 'src/utils'
import { EXEC_NAME } from 'src/constant'
import AddCommand from './add'
import { promises as fs } from 'fs'

/** 移除一个快速打开一个项目 */
export default class RemoveCommand extends CommandAbs {

  public description = '移除一个快速打开一个项目'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.FAST} ${COMMAND.FAST_REMOVE} <索引名>`
  public commandName: COMMAND = COMMAND.FAST_REMOVE
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public exec(command: string[]) {
    this.removeCommand(command[0])
  }

  /**
   * 移除命令
   * @param index 
   */
  private async removeCommand(index: string) {
    const list = await AddCommand.getFastList()
    // 寻找选中的那一项
    const findIndex = list.findIndex(function (value) {
      if (index === value.index) return true
    })
    if (findIndex !== -1) {
      list.splice(findIndex, 1)
      try {
        await fs.writeFile(
          AddCommand.WRITE_FILE_PATH,
          AddCommand.getFastRcStr(list)
        )
        message.success('删除成功')
      } catch (e) {
        message.error('错误信息如下', e)
      }

    } else {
      message.error(
        '未找到对应的索引，可执行命令如下',
        `请确认是否存在 ${index} 这个索引`
      )
    }
  }

  public verifyCommandArr(commandArr: string[]): boolean {
    return commandArr.length === 1 || this.formatError()
  }

}