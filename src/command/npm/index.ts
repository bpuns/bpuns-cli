import { COMMAND, EXEC_NAME } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import AddCommand from './children/add'
import RemoveCommand from './children/remove'
import UseCommand from './children/use'
import LsCommand from './children/ls'
import { message } from 'src/utils'

/** npm */
export default class NpmCommand extends CommandAbs {

  public description = 'npm'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.NPM}`
  public commandName: COMMAND = COMMAND.NPM
  public childrenCommand: Partial<Record<COMMAND, CommandAbs>> = {
    [COMMAND.NPM_ADD]:    new AddCommand(this.allCommand),
    [COMMAND.NPM_REMOVE]: new RemoveCommand(this.allCommand),
    [COMMAND.NPM_USE]:    new UseCommand(this.allCommand),
    [COMMAND.NPM_LIST]:   new LsCommand(this.allCommand)
  }

  public exec() {
    message.error(`${EXEC_NAME} npm 这个命令本身没有意义,可用命令如下`, '')
    // npm 没有执行方法
    Object.values(this.childrenCommand).forEach(item => {
      message.info(`${item!.execFormat}`)
    })
    message.info('')
  }

}