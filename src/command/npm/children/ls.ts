import { COMMAND, INpmList } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { message } from 'src/utils'
import { EXEC_NAME } from 'src/constant'
import AddCommand from './add'
import os from 'os'
import path from 'path'
import { promises as fs } from 'fs'

// os.homedir()

/** 查看npm源 */
export default class LsCommand extends CommandAbs {

  /** npmrc路径 */
  public static NPM_RC_PATH = path.join(os.homedir(), '.npmrc')
  /** yarnrc路径 */
  public static YARN_RC_PATH = path.join(os.homedir(), '.yarnrc')

  /** 读取npmrc的配置 */
  public static async readNpmConfig(): Promise<string>{

    let registryUrl = ''

    try {
      // 读取文件
      const fileContent = await fs.readFile(LsCommand.NPM_RC_PATH, { encoding: 'utf-8' })
      // 正则匹配
      const matchResult = fileContent.match(/registry=(.*)\n?/)
      // 获取结果
      matchResult && (registryUrl = matchResult[1])  
    } catch (e){
      message.error('', `${LsCommand.NPM_RC_PATH}文件不存在`)
    }

    return registryUrl
  }

  /**
   * 获取可选的RegisterName
   */
  public static optionalRegisterName(list: INpmList[]):string[]{
    return list.map(item=>item.registryName)
  }

  public description: string = '查看所有npm源'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.NPM} ${COMMAND.NPM_LIST} `
  public commandName: COMMAND = COMMAND.NPM_LIST  
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public async exec(){
    // 获取npm列表
    const list = await AddCommand.getNpmList()
    // 获取当前选中的url
    const registryUrl = await LsCommand.readNpmConfig()
    // 寻找选中的那一项
    const findIndex = list.findIndex(function(value){
      if (registryUrl.includes(value.registryUrl)) return true
    })

    message.info('当前可选仓库如下')
    for (let index in list){ 
      message.info(` ${Number(index) === findIndex ? '*' : ' '} ${list[index].registryName} ${list[index].registryUrl}`)
    }   
  }

}