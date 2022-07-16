import { COMMAND } from 'src/constant'
import { message } from 'src/utils'
import type { RootCommandType, AllCommand } from '.'

/** 所有命令的父抽象类 */
export abstract class CommandAbs<T = string[]> {

  public allCommand:  Map<COMMAND | string, CommandAbs<String[] | RootCommandType>>

  /** 该命令的描述 */
  public abstract description: string

  /** 执行格式 */
  public abstract execFormat: string

  /** 该命令的启动命令 */
  public abstract commandName: COMMAND

  /** 该命令的子命令 */
  public abstract childrenCommand?: Partial<Record<COMMAND, CommandAbs>>

  constructor(allCommand: AllCommand){
    this.allCommand = allCommand
  }

  /**
   * 执行命令
   * @param commandArr 命令参数
   */
  public abstract exec(commandArr: T): void

  /**
   * 验证命令参数是否有效
   * @param commandArr 命令参数
   */
  public verifyCommandArr(commandArr: string[]): boolean {
    return true
  }

  /** 传入的格式不对
   * @returns boolean
   */
  formatError(tip?: string) {
    message.error(
      '格式错误，需要按下面的格式传入参数',
      tip ?? this.execFormat
    )
    return false
  }

}