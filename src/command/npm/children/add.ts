import { COMMAND } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { message } from 'src/utils'
import { EXEC_NAME, DEFAULT_NPM_LIST, INpmList } from 'src/constant'
import os from 'os'
import path from 'path'
import { promises as fs } from 'fs'

/** 添加npm源 */
export default class AddCommand extends CommandAbs {

  /** rc地址 */
  public static WRITE_FILE_PATH = path.join(os.homedir(), `.${EXEC_NAME}rc`)
  
  /**
   * 验证 WRITE_FILE_PATH 是否存在，不存在创建它
   */
  public static async existFile(){
    try {
      await fs.stat(AddCommand.WRITE_FILE_PATH)
    } catch (e){
      await fs.writeFile(
        AddCommand.WRITE_FILE_PATH, 
        AddCommand.getBpRcStr(DEFAULT_NPM_LIST)
      )
    }
  }
  
  /**
   * 获取新的用于写入 bprc 文件的 string
   * @param npmList 
   */
  public static getBpRcStr(npmList: INpmList[]): string{
    return npmList.reduce(function(o, item){
      return `${o}[${item.registryName}]=[${item.registryUrl}]\n`
    }, '')
  }

  /**
   * 获取npm list
   */
  static async getNpmList():Promise<INpmList[]> {
    // 验证文件是否存在
    await AddCommand.existFile()
    // 取值
    const value = await fs.readFile(AddCommand.WRITE_FILE_PATH, { encoding: 'utf-8' })
    const reg = /\[(.+)\]=\[(.+)\]\n?/g

    // 保存每次返回的item
    let item:RegExpExecArray | null
    const arr: INpmList[] = []

    while (item = reg.exec(value)) {
      arr.push({
        registryName: item[1],
        registryUrl:  item[2]
      })
    }
    
    return arr

  }

  public description: string = '添加npm源'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.NPM} ${COMMAND.NPM_ADD} <名称> <源地址>`
  public commandName: COMMAND = COMMAND.NPM_ADD  
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public exec(command: string[]){
    this.writeFile(command[0], command[1])
  }

  /**
   * 写入文件
   * @param name 
   * @param url 
   */
  private async writeFile(name:string, url:string){
    const list = await AddCommand.getNpmList()
    try {
      // 判断是否已经存在了
      if (list.some(t=>name === t.registryName)){
        message.error('请使用别的名字', `${name}已经添加过了`)
      } 
      // 还没存在
      else {
        await fs.writeFile(
          AddCommand.WRITE_FILE_PATH,
          `[${name}]=[${url}]\n`,
          { flag: 'a' }
        )
        message.success('写入成功')
      }
    } catch (e){
      message.error('错误', e.message)
    }
  }

  public verifyCommandArr(commandArr: string[]): boolean {
    if (commandArr.length != 2){
      return this.formatError()
    }
    return true
  }

}