import { COMMAND } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { message, traversalFile, xdate } from 'src/utils'
import { EXEC_NAME } from 'src/constant'
import { dateFormat, IXDate, timeFormat } from 'src/utils/xdate'
import fs from 'fs'

/** 重置文件操作时间 */
export default class UtimeCommand extends CommandAbs{

  public description = '重置某文件夹下的所有文件的时间'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.UTIME} [${`${dateFormat} ${timeFormat}`} (不传就是系统时间)]`
  public commandName: COMMAND = COMMAND.UTIME
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined
  // 需要给文件设置的时间
  #setDate!: IXDate

  public exec(){
    traversalFile(process.cwd(), { printRoot: false }, (_, filePath)=>{
      fs.utimes(filePath, this.#setDate.date, this.#setDate.date, (err)=>{
        if (err){
          message.error('error', err.message)
        } else {
          message.success(`${filePath} 修改成功`)
        }
      })
    })
  }

  public verifyCommandArr(commandArr: string[]): boolean {
    if (commandArr.length > 0){
      try {
        this.#setDate = xdate(`${commandArr[0]} ${commandArr[1] ?? ''}`)
      } catch (e){
        return this.formatError()
      }
    } else {
      this.#setDate = xdate()
    }
    return true
  }

}