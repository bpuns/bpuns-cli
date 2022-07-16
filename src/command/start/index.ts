import path from 'path'
import { promises as fs } from 'fs'
import { COMMAND, EXEC_NAME } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { message } from 'src/utils'
import { exec } from 'src/utils'

type Start = ('start' | 'dev' | 'serve')
type IJsonCheck = {
  scripts: Record<Start, string>
  status: boolean
  msg: string
}

/** 启动 */
export default class StartCommand extends CommandAbs {

  public description = '启动前端项目'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.START}`
  public commandName: COMMAND = COMMAND.START
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined
  #args!:string[]

  // 启动命令
  static START_COMMAND: Start[] = [
    'start',   // create-react-app
    'dev',     // vite
    'serve'    // vue-cli
  ]

  public exec(args: string[]) {
    this.#args = args
    this.checkEnvironment()
  }

  /** 检查当前目录下是否存在npm运行 */
  async checkEnvironment() {
    const _path = path.join(process.cwd(), 'package.json')

    try {

      const unknown = await fs.readFile(_path)
      const s = this.disposeJson(unknown.toString())

      if (s.status) {
        const command = this.findStartCommand(s.scripts)

        // 启动
        command && this.run(command)
      } else {
        message.error('错误', s.msg)
      }

    } catch (e) {
      message.error('错误', '当前目录下不存在package.json')
    }

  }

  /**
   * run start
   * @param script 
   */
  run(script: string) {
    const splitArr = script.split(' ')
    splitArr[0] === 'npx' || splitArr.unshift('npx')
    exec(splitArr[0], splitArr.slice(1).concat(...this.#args), { stdio: 'inherit' })
  }

  /**
   * 查找启动命令
   * @param script 
   * @returns 
   */
  findStartCommand(script: IJsonCheck['scripts']): string | undefined {
    for (let c of StartCommand.START_COMMAND) {
      if (script[c]) {
        return script[c]
      }
    }
    message.error('未找到相关启动命令', '目前只支持 create-react-app, vite, vue-cli')
  }

  /**
   * 检查package.json是否合法
   * @param unknown 
   * @returns 
   */
  disposeJson(unknown: string): IJsonCheck {

    const check: IJsonCheck = {
      scripts: null!,
      msg:     '当前目录下的package.json不是一个合法的配置',
      status:  false
    }

    if (unknown.length && Object.is(Number(unknown), NaN)) {
      try {
        check.scripts = JSON.parse(unknown).scripts

        // 判断是否存在scripts
        if (check.scripts) {
          check.status = true
          check.msg = ''
        }
      } catch (e) { }
    }

    return check
  }

}