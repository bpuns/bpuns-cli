import { COMMAND } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { message } from 'src/utils'
import { EXEC_NAME } from 'src/constant'
import path, { resolve } from 'path'
import { promises as fs } from 'fs'
import type { IFileType } from '../tools/testFile'
import { files } from '../tools/testFile'

/** 为smash创建测试文件 */
export default class SmashTestCommand extends CommandAbs {

  public description: string = '为smash创建测试文件'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.SMASH_T} [模板]`
  public commandName: COMMAND = COMMAND.SMASH_T
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  /** 当前一层要创建的文件 */
  #queue: IFileType[] = []

  public exec(command: string[]) {

    this.#queue = command[0] ? (
      files[command[0]] || files[0]
    ) : files[0]

    // 完善 struct 中的所有路径
    this.#deepCompletePath(this.#queue)

    // 递归创建资源
    this.#createAssets()
  }

  /** 完善 struct 中的所有路径
 * @param struct      资源
 * @param fatherPath  父节点路径
 */
  #deepCompletePath(struct: IFileType[], fatherPath: string = process.cwd()) {
    struct.forEach(struct => {
      struct.name = path.join(fatherPath, struct.name)
      if (struct.children) {
        this.#deepCompletePath(struct.children, struct.name)
      }
    })
  }

  /** 递归创建资源 */
  async #createAssets() {

    try {

      // 循环创建
      while (this.#queue.length) {
        await Promise.all(this.#createTasks())
      }
    } catch (e: unknown) {
      return message.error('文件创建失败', (e as Error).message)
    }

    message.success('创建成功')

  }

  /** 创建异步任务 */
  #createTasks() {

    // 避免子节点添加影响父节点创建
    const newQueue = [ ...this.#queue ]
    this.#queue = []

    return newQueue.map(
      struct => struct.children ? (
        this.#createFolder(struct)
      ) : (
        this.#createFile(struct)
      )
    )
  }

  /** 创建文件夹
   * @param struct 
   */
  async #createFolder(struct: IFileType) {
    this.#queue.push(...struct.children!)
    await fs.mkdir(struct.name)
  }

  /** 创建文件
   * @param struct 
   */
  async #createFile(struct: IFileType) {
    await fs.writeFile(struct.name, '')
  }

}