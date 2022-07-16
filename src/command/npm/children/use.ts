import { COMMAND } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { message } from 'src/utils'
import { EXEC_NAME } from 'src/constant'
import { promises as fs } from 'fs'
import LsCommand from './ls'
import AddCommand from './add'

/** 切换npm源 */
export default class UseCommand extends CommandAbs {

  public description = '切换npm源'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.NPM} ${COMMAND.NPM_USE} <名称>`
  public commandName: COMMAND = COMMAND.NPM_USE
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public exec(command: string[]) {
    this.changeNpmRegister(command[0])
  }

  /**
   * 修改npmrc的文件
   * @param registerName 
   */
  private async changeNpmRegister(registerName: string) {
    // 获取当前保存在磁盘上的list
    const list = await AddCommand.getNpmList()
    // 判断当前的registerName是否存在
    const findIndex = LsCommand.optionalRegisterName(list).indexOf(registerName)
    if (findIndex !== -1) {
      // 获取要修改的url地址
      const registryUrl = list[findIndex].registryUrl
      // 读取文件
      const fileContent = await fs.readFile(LsCommand.NPM_RC_PATH, { encoding: 'utf-8' })
      // 替换文本
      const replaceContent = fileContent.replace(
        /registry=(.+)\n?/,
        `registry=${registryUrl}\n`
      )
      try {
        this.changeYarnRegister(registryUrl)
        // 写入数据
        await fs.writeFile(LsCommand.NPM_RC_PATH, replaceContent)
        message.success('npmrc 修改成功')
      } catch (e) {
        message.error('', (e as Error).message)
      }
    } else {
      message.error(
        '未找到对应的源名，可执行命令如下',
        `${EXEC_NAME} npm use <${LsCommand.optionalRegisterName(list).join('|')}>`
      )
    }
  }

  /**
   * 修改yarnrc的文件
   * @param registerName 
   */
  private async changeYarnRegister(registryUrl: string) {
    try {
      const fileContent = await fs.readFile(LsCommand.YARN_RC_PATH, { encoding: 'utf-8' })
      const replaceContent = fileContent.replace(
        /registry "(.+)"\n?/,
        `registry "${registryUrl}"`
      )
      await fs.writeFile(LsCommand.YARN_RC_PATH, replaceContent)
      message.success('yarnrc 修改成功')
    } catch (e) { }
  }

  public verifyCommandArr(commandArr: string[]): boolean {
    return commandArr.length === 1 || this.formatError()
  }

}