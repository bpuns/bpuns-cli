import { COMMAND, EXEC_NAME } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { message } from 'src/utils'
import { exec, exec_pipe } from 'src/utils'

/** 启动 */
export default class KillCommand extends CommandAbs {

  _baseFormat: string = `${EXEC_NAME} ${COMMAND.KILL} port`
  _port!: string
  _isLinux: boolean = false

  public description = '解除windows|linux端口占用'
  public execFormat: string = this._baseFormat
  public commandName: COMMAND = COMMAND.KILL
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public async exec() {

    try {
      // 取pid
      let pid　= this.findListeningPid(await this.getPortList())
      // 如果pid存在，接触端口占用
      if (pid) {
        this._isLinux ? await exec('kill', [ '-s', '9', pid ]) :　await exec('taskkill', [ '/f', '/pid', pid ])
        message.info(`已解除${this._port}端口占用`)
      } else {
        message.info(`没有${this._port}的端口占用`)
      }
    } catch (e) {
      message.error(
        'pipe error',
        e instanceof Error ? e.message : e as string
      )
    }

  }

  /**
   * 寻找windows占用端口的pid
   * @param list 
   */
  findListeningPid(list: string[]) {

    let pid: undefined | string

    // linux和windows取不同的正则
    const reg = this._isLinux ? /(?<pid>\d+)/ : /\s+[\w\.:]+\s+[\w\.:]+\s+[\w\.:]+\s+LISTENING\s+(?<pid>\d+)/

    // 遍历数组, 取pid
    for (let item of list) {
      if (!item.length) continue
      const result = reg.exec(item)
      // 如果pid取到了，直接退出
      if (pid = result?.groups?.pid) {
        break
      }
    }

    return pid

  }

  /**
   * 获取对应端口占用列表
   * @returns 
   */
  async getPortList() {

    let buffer: Buffer

    if (this._isLinux){
      buffer =　await exec('fuser', [ '-v', '-n', 'tcp', this._port ])
    } else {
      buffer = await exec_pipe(
        [ 'netstat', [ '-ano' ] ],
        [ 'findstr', [ this._port ] ]
      )
    }

    return buffer.toString().split('\r\n')

  }

  public verifyCommandArr(commandArr: string[]): boolean {

    if (!/(win32|linux)/.test(process.platform)){
      return this.formatError('目前只支持windows与linux系统')
    }

    if (process.platform === 'linux'){
      this._isLinux = true
    }

    if (commandArr.length > 0) {
      const port = Number(commandArr[0])
      if (Number.isNaN(port)) {
        return this.formatError(`${this._baseFormat}<port必须是合法的number类型>`)
      } else {
        this._port = commandArr[0]
        return true
      }
    } else {
      return this.formatError()
    }
  }

}