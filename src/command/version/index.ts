import { COMMAND, EXEC_NAME } from 'src/constant'
import { clc } from 'src/utils'
import { CommandAbs } from 'src/command/Command'

/** 版本 */
export default class VersionCommand extends CommandAbs{
  
  public description = '查看版本'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.VERSION}`
  public commandName: COMMAND = COMMAND.VERSION
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public exec(){
    console.log()
    console.log(`当前 ${EXEC_NAME} 的版本是`, clc.green(require('../../../package.json').version))
    console.log()
  }

}