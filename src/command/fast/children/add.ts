import { CommandAbs } from 'src/command/Command'
import { message } from 'src/utils'
import type { IFastList } from 'src/constant'
import { COMMAND, EXEC_NAME, DEFAULT_FAST_LIST } from 'src/constant'
import os from 'os'
import path from 'path'
import { promises as fs } from 'fs'

/** 添加快速打开地址 */
export default class AddCommand extends CommandAbs {

  /** rc地址 */
  public static WRITE_FILE_PATH = path.join(os.homedir(), '.fastOpenRc')

  /** 验证 WRITE_FILE_PATH 是否存在，不存在创建它 */
  public static async existFile() {
    try {
      await fs.stat(AddCommand.WRITE_FILE_PATH)
    } catch (e) {
      await fs.writeFile(
        AddCommand.WRITE_FILE_PATH,
        AddCommand.getFastRcStr(DEFAULT_FAST_LIST)
      )
    }
  }

  /**
   * 获取新的用于写入 fastOpenRc 文件的 string
   * @param fastList
   */
  public static getFastRcStr(fastList: IFastList[]): string {
    return fastList.reduce(function (o, item) {
      return `${o}[${item.index}]=[${item.path}]=[${item.remark}]\n`
    }, '')
  }

  /** 获取fast list */
  static async getFastList(): Promise<IFastList[]> {
    // 验证文件是否存在
    await AddCommand.existFile()
    // 取值
    const value = await fs.readFile(AddCommand.WRITE_FILE_PATH, { encoding: 'utf-8' })
    const reg = /\[(.+)\]=\[(.+)\]=\[(.+)\]\n?/g

    // 保存每次返回的item
    let item: RegExpExecArray | null
    const arr: IFastList[] = []

    while (item = reg.exec(value)) {
      arr.push({
        index:  item[1],
        path:   item[2],
        remark: item[3]
      })
    }

    return arr

  }

  public description: string = '持久化一个快速打开一个项目'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.FAST} ${COMMAND.FAST_ADD} <索引名> <磁盘地址> [<备注>]`
  public commandName: COMMAND = COMMAND.FAST_ADD
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public exec(command: string[]) {
    this.writeFile(command[0], command[1], command[2] || ' ' )
  }

  /**
   * 写入文件
   * @param name 
   * @param url 
   */
  private async writeFile(name: string, url: string, remark: string) {
    const list = await AddCommand.getFastList()
    try {
      // 判断是否已经存在了
      if (list.some(t => name === t.index)) {
        message.error('请使用别的名字', `${name}已经添加过了`)
      }
      // 还没存在
      else {
        await fs.writeFile(
          AddCommand.WRITE_FILE_PATH,
          `[${name}]=[${url}]=[${remark}]\n`,
          { flag: 'a' }
        )
        message.success('写入成功')
      }
    } catch (e: unknown) {
      message.error('错误', e)
    }
  }

  public verifyCommandArr(commandArr: string[]): boolean {
    if (commandArr.length < 2) {
      return this.formatError()
    }
    return true
  }

}