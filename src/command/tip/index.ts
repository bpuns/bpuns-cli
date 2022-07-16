import { COMMAND, EXEC_NAME } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { clc, getChineseSize, getPrintSize } from 'src/utils'
import type { RootCommandType } from 'src/command'

/** 提示 */
export default class TipCommand extends CommandAbs<RootCommandType> {

  public description = '提示'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.TIP}`
  public commandName: COMMAND = COMMAND.TIP
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  /** 存储父节点现在挂载了多少个命令 */
  private commands!: RootCommandType['commands']

  /** 存储所有命令 */
  private allCommands: [string, string, number][] = []

  public exec(root: RootCommandType) {
    this.commands = root.commands
    this.deepFind()
  }

  /** 递归查找
   * @param deep             当前命令的层级
   * @param childrenCommand 
   */
  private deepFind(deep: number = 0, childrenCommand?: Partial<Record<COMMAND, CommandAbs>>) {
    if (deep) {
      for (let key in childrenCommand) {
        this.previousPrint(childrenCommand[key], deep)
      }
    } else {
      for (let value of this.commands.values()) {
        this.previousPrint(value, deep)
        if (value.childrenCommand) {
          this.deepFind(deep + 1, value.childrenCommand)
        }
      }
    }

    if (!deep) {
      this.print()
    }
  }

  /** 打印之前整理数据
   * @param command 
   * @param deep 
   */
  private previousPrint(command: CommandAbs, deep: number) {
    this.allCommands.push([
      command.execFormat.padStart(deep * 3 + command.execFormat.length, ' '),
      command.description,
      deep
    ])
  }

  /** 打印 */
  private print() {

    // 寻找需要最长显示的字符串
    let maxTipLength = 0
    this.allCommands.forEach(([ command ]) => {
      if (command.length > maxTipLength) {
        const printLength = getPrintSize(command)
        if (maxTipLength < printLength) {
          maxTipLength = printLength
        }
      }
    })

    // 加上4位空格
    maxTipLength += 2

    console.log(`${clc.greenBG('用法')}: ${EXEC_NAME} [command1] [command2] ...`)
    console.log()
    console.log('其中选项包括:')
    console.log(clc.blue('--------------------------------------------------------'))

    this.allCommands.forEach((item) => {
      item[0] = item[0].padEnd(
        maxTipLength - getChineseSize(item[0]),
        ' '
      )

      if (item[2] === 0) console.log()
      console.log(clc.yellow(item[0]), clc.green(item[1]))

    })

    console.log()
  }

}