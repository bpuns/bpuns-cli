import { promises as fs } from 'fs'
import TipCommand from 'src/command/tip'
import NpmCommand from 'src/command/npm'
import SmashCommand from 'src/command/smash'
import StartCommand from 'src/command/start'
import UtimeCommand from 'src/command/utime'
import KillCommand from 'src/command/kill'
import CreateCommand from 'src/command/create'
import VersionCommand from 'src/command/version'
import FastCommand from 'src/command/fast'
import QcCommand from 'src/command/qc'
import DevCommand from 'src/command/dev'
import TestCommand from 'src/command/test'
import { COMMAND, EXEC_NAME } from 'src/constant'
import { clc, exec } from 'src/utils'
import { CommandAbs } from './Command'
import path from 'path'

class RootCommand {

  /** 保存所有装载的命令 */
  public commands: AllCommand = new Map()

  constructor() {
    const register = [
      [ COMMAND.START, StartCommand ],
      [ COMMAND.UTIME, UtimeCommand ],
      [ COMMAND.KILL, KillCommand ],
      [ COMMAND.TIP, TipCommand ],
      [ COMMAND.NPM, NpmCommand ],
      [ COMMAND.SMASH, SmashCommand ],
      [ COMMAND.TEST, TestCommand ],
      [ COMMAND.CREATE, CreateCommand ],
      [ COMMAND.VERSION, VersionCommand ],
      [ COMMAND.QC, QcCommand ],
      [ COMMAND.FAST, FastCommand ],
      [ COMMAND.DEV, DevCommand ]
    ]
    register.forEach(item => {
      // @ts-ignore 手动录入命令，不会报错
      this.commands.set(item[0], new (item[1])(this.commands))
    })
  }

  /**
   * 简单的查找命令，判断命令是否存在
   * @param commandArr  process传进来的args
   */
  public async find(commandArr: COMMAND[]) {

    // 判断命令长度
    if (commandArr.length && this.commands.has(commandArr[0])) {
      return this.deepFind(commandArr)
    }

    // 如果上面找不到的话，就要判断当前运行目录下，是否存在package.json
    if (commandArr.length) {
      // @ts-ignore 简写打包命令
      commandArr[0] === 'b' && (commandArr[0] = 'build')
      // 判断包中是否存在对应的
      if (await this.findPackage(commandArr[0])){
        return exec('npm', [ 'run', commandArr[0], ...commandArr.slice(1) ], { stdio: 'inherit' })
      }
    }

    // 啥都没找到，报错
    this.noCommand(commandArr)
  }

  /** 查找package.json文件，并查找script中的值
   * @param script 
   */
  private async findPackage(script: string) {
    try {
      const filePath = path.join(process.cwd(), 'package.json')
      const stat = await fs.stat(filePath)
      if (stat.isFile()) {
        const value = JSON.parse(await fs.readFile(filePath, 'utf8'))
        if (!!value['scripts'][script]) {
          // 找到了
          return true
        }
      } else {
        throw new Error('不是合法的package.json')
      }
    }
    catch (e) {
      // console.log(e)
    }

    // 没有找到
    return false
  }

  /** 没有找到命令，显示提示信息 */
  private noCommand(commandArr: COMMAND[]) {

    // 没有有效命令
    console.log()
    if (commandArr.length) {
      console.log(clc.redBG(`没有${EXEC_NAME} ${commandArr.join(' ')}这个命令`))
    } else {
      console.log(clc.redBG('命令不完整'))
    }
    console.log();

    (this.commands.get(COMMAND.TIP) as CommandAbs<RootCommandType>).exec(this)
  }

  /**
   * 深度查找要运行的命令的那个类
   * @param commandArr  process传进来的args
   */
  private deepFind(commandArr: COMMAND[]) {

    // 直接取出第一项
    let commandClass: CommandAbs = this.commands.get(commandArr[0])!

    // 把命令中的第一项删除，因为已经没有什么使用意义
    commandArr.shift()

    // 用来记录命令和参数分割的index
    let argsIndex: number = 0

    // 查找命名执行函数
    for (; argsIndex < commandArr.length; argsIndex++) {
      const child = commandClass.childrenCommand && commandClass.childrenCommand[commandArr[argsIndex]]
      if (child) {
        commandClass = child
      } else {
        break
      }
    }

    // 执行对应指令
    this.exec(commandClass, commandArr.slice(argsIndex) as string[])
  }

  /**
   * 执行对应指令
   * @param commandClass 
   * @param args 
   */
  private exec(commandClass: CommandAbs, args: string[]) {
    // 验证是否合法 才执行
    if (commandClass.verifyCommandArr(args)) {

      // 提示需要单独执行
      if (commandClass.commandName === COMMAND.TIP) {
        (commandClass as unknown as CommandAbs<RootCommandType>).exec(this)
      } else {
        commandClass.exec(args)
      }
    }
  }

}

export type AllCommand = Map<COMMAND | string, CommandAbs<String[] | RootCommandType>>
export type RootCommandType = InstanceType<typeof RootCommand>

export default new RootCommand()