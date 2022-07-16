import { COMMAND } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { message } from 'src/utils'
import { EXEC_NAME } from 'src/constant'
import AddCommand from './add'
import { promises as fs } from 'fs'
import LsCommand from './ls'

/** 移除npm源 */
export default class RemoveCommand extends CommandAbs {

  public description = '移除npm源'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.NPM} ${COMMAND.NPM_REMOVE} <名称>`
  public commandName: COMMAND = COMMAND.NPM_REMOVE
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public exec(command: string[]) {
    this.removeCommand(command[0])
  }

  /**
   * 移除命令
   * @param registryName 
   */
  private async removeCommand(registryName: string) {
    const list = await AddCommand.getNpmList()
    // 寻找选中的那一项
    const findIndex = list.findIndex(function (value) {
      if (registryName === value.registryName) return true
    })
    if (findIndex !== -1) {
      list.splice(findIndex, 1)
      try {
        await fs.writeFile(
          AddCommand.WRITE_FILE_PATH,
          AddCommand.getBpRcStr(list)
        )
        message.success('删除成功')
      } catch (e) {
        message.error('错误信息如下', e.message)
      }

    } else {
      message.error(
        '未找到对应的源，可执行命令如下',
        `${EXEC_NAME} npm remove <${LsCommand.optionalRegisterName(list).join('|')}>`
      )
    }
  }

  public verifyCommandArr(commandArr: string[]): boolean {
    return commandArr.length === 1 || this.formatError()
  }

}