import { clearLine, Key, moveCursor } from 'readline'
import { clc } from 'src/utils'
import { SingleChoiceQuestion } from '..'
import { Question } from '../utils'

export class SingleChoice extends Question {

  /** 标识当前是单选 */
  SingleChoice = true
  /** 当前选中项 */
  selected: Record<string, string> = {}
  /** 当前选项的高度，clean中使用 */
  height: number = 0
  /** 保存列表 */
  list!: SingleChoiceQuestion['list']
  /** 当前光标所在位置 */
  cursorIndex: number = 0

  run(cb: (result: any) => void): Promise<string> {

    return new Promise(resolve => {
      this.cb = cb
      this.resolve = resolve

      this.list = (this.question as SingleChoiceQuestion).list
      let _default = this.question.default

      // 处理默认选中值
      if (_default) {
        if (!Array.isArray(_default)) _default = [ _default ]
        this.list.forEach((item, index) => {
          if ((_default as any[]).includes(item.id)) {
            this.selected[item.id] = item.label
            // 如果是单选，那么默认选中那一项就是默认光标选中位置
            this.SingleChoice && (this.cursorIndex = index)
          }
        })
      }

      // 保存clean时要清理多少行
      this.height = this.list.length + 1

      this.openWrite()
      this.hideCursor()
      this.render()
      this.firstRender = false

    })

  }

  clean = () => {

    let len = this.height

    while (len--) {
      // 清理这行
      moveCursor(this.output, -process.stdout.getWindowSize()[0], 0)
      clearLine(this.output, 0)
      // 移动到上一行
      if (len) moveCursor(this.output, 0, -1)
    }
  }

  render = (submit = false): void => {
    const beforeStr = `[${clc.red(' ? ')}] `
    const requiredTip = this.tip ? '（' + clc.red(this.tip) + '）' : ''
    const answer = submit ? clc.green(
      (
        this.SingleChoice ? this.list[this.cursorIndex].label : Object.values(this.selected).join('，')
      ) + '\n'
    ) : (
      this.firstRender ? (
        this.SingleChoice ? clc.blue('（上下键切换，回车选中）') : clc.blue('（上下键切换，space选中，回车确定）')
      ) : ''
    )

    // 打印标题
    this.print(
      `${beforeStr}${this.question.title}${requiredTip}: ${answer}`
    )

    // 打印选项，提交后就不要打印了
    if (!submit) {
      this.list.forEach((item, index) => {

        const selected = !!this.selected[item.id]

        this.print('\n')
        this.print(this.cursorIndex === index ? clc.cyan('>') : ' ')
        // 判断现在是否是单选
        if (!this.SingleChoice) {
          this.print(` [${selected ? 'X' : ' '}]`)
        }

        this.print(' ' + (index === this.cursorIndex ? clc.cyan(item.label) : item.label))

      })
    }

    this.closeWrite()

  }

  onKeypress = (s: string, key: Key): void => {
    const name = key.name

    if (!name && name !== 'up' && name !== 'down' && name !== 'space') return

    this.openWrite()

    // 上
    if (name === 'up') {
      this.up()
    }
    // 下
    else if (name === 'down') {
      this.down()
    }
    // space选中
    else {
      !this.SingleChoice && this.space()
    }

    this.clean()
    this.render()
  }

  /** 键盘按上 */
  up = () => {
    if (this.cursorIndex > 0) {
      this.cursorIndex--
    } else {
      this.cursorIndex = this.list.length - 1
    }
  }

  /** 键盘按下 */
  down = () => {
    if (this.cursorIndex !== this.list.length - 1) {
      this.cursorIndex++
    } else {
      this.cursorIndex = 0
    }
  }

  /** 键盘按空格选中 */
  space = () => {
    const selectedItem = this.list[this.cursorIndex]
    // 如果当前是选中项，那么取消选中
    if (!!this.selected[selectedItem.id]) {
      delete this.selected[selectedItem.id]
    } else {
      this.selected[selectedItem.id] = selectedItem.label
    }
  }

  onSubmit = (): void => {
    this.openWrite()
    this.clean()

    // 单选，那么 cursorIndex 就是选中项
    if (this.SingleChoice) {
      const selected = this.list[this.cursorIndex]
      this.cb(selected.id)
      this.resolve()
    }
    // 多选
    else {
      // 获取选中的key
      const selectedKey = Object.keys(this.selected)
      if (!this.required || selectedKey.length) {
        this.cb(selectedKey)
        this.resolve()
      }
      // 没有选中，需要重新选择
      else {
        this.tip = '至少需要选一个'
        this.rl.once('line', this.onSubmit)
        this.render()
        this.firstRender = false
        return
      }
    }

    this.tip = ''
    this.render(true)
    this.list = []
    this.destroy()

  }

}