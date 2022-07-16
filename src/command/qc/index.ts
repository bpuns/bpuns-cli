import { COMMAND, EXEC_NAME } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import traversalFile from 'src/utils/traversalFile'
import path from 'path'
import fs from 'fs'

export default class QcCommand extends CommandAbs {

  public description = '文件处理'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.QC} [1(去除随机编码)|2(移动文件)]`
  public commandName: COMMAND = COMMAND.QC
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  /** 把深层次的文件全部移动到第一层 */
  public exec([ code ]) {

    code = code ?? '1'

    switch (code) {
      case '1':
        traversalFile(process.cwd(), { printRoot: false }, (file, filePath) => {
          const name = filePath.split(process.cwd() + '\\')[1]
          if (name.includes('-')) {
            const newPath = path.join(process.cwd(), name.split('-')[0] + '.' + name.split('.')[1])
            fs.rename(filePath, newPath, (err) => {
              console.log('移动成功')
            })
          }
        })
        break
      case '2':
        const last = process.cwd()
        traversalFile(process.cwd(), { printRoot: false }, (file, filePath) => {
          if (file.isFile()) {
            const name = path.basename(filePath)
            fs.rename(filePath, path.join(last, name), (err) => {
              console.log('修改成功')
            })
          }
        })
        break
    }

  }

}