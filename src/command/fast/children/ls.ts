import { COMMAND } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { clc, message } from 'src/utils'
import { EXEC_NAME } from 'src/constant'
import AddCommand from './add'

// os.homedir()

/** 查看现在存在的快速打开一个项目列表 */
export default class LsCommand extends CommandAbs {

  public description: string = '查看现在存在的快速打开一个项目列表'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.FAST} ${COMMAND.FAST_LS} `
  public commandName: COMMAND = COMMAND.FAST_LS  
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public async exec(){
    // 获取fastList列表
    const list = await AddCommand.getFastList()

    message.info('\n当前可选快读打开的索引如下\n')
    for (let index in list){ 
      message.info(` ⚪ ${list[index].index}  [${clc.blue(list[index].path)}]  ${clc.green(list[index].remark)}`)
    }
    console.log('\n')

  }

}