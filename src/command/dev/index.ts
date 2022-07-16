import { COMMAND, EXEC_NAME, PROJECT_PATH } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { exec } from 'src/utils'

/** 开发bp */
export default class DevCommand extends CommandAbs {

  public description = '调试bp源码'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.DEV}`
  public commandName: COMMAND = COMMAND.DEV
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public exec() {
    exec('npx', [ 'tsc-alias', '-w' ], { cwd: PROJECT_PATH, stdio: 'inherit' })
    exec('npx', [ 'tsc', '--project', 'tsconfig.json', '-w' ], { cwd: PROJECT_PATH, stdio: 'inherit' })
  }

}