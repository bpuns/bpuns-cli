import { clearLine, moveCursor } from 'readline'
import { clc, getPrintSize, isChinese } from 'src/utils'
import { insertStr, spliceStr, Question } from '../utils'
import type { Key } from 'readline'

export class Text extends Question {

  /** 当前游标的位置 */
  cursorIndex: number = 0
  /** js中 中文只占一位 */
  jsCursorIndex: number = 0
  /** 答案 */
  answer: string = this.question.default as string ?? ''
  /** 
   * 判断现在是脏渲染, 合并多次输入
   * 因为 process.nextTick 为宏任务，多次触发keypress后才会触发 
  */
  isDirty = false
  /** 保存 insertChat 移动光标方法，避免多次触发引发bug */
  insertFunc!: () => void

  run(callback: (result: string) => void): Promise<string> {

    return new Promise(resolve => {
      
      // 保存回调
      this.resolve = resolve

      // 设置索引位置
      this.jsCursorIndex = this.answer.length
      this.cursorIndex = getPrintSize(this.answer)

      // 保存回调函数
      this.cb = callback
      this.openWrite()
      // 执行 render
      this.render()
    })
  }

  /** 回车的时候触发 */
  onSubmit = () => {

    this.openWrite()
    this.clean()

    // 必填还没填
    if (this.required && !this.answer.length) {
      this.firstRender = true
      this.rl.once('line', this.onSubmit)
      this.tip = '此项是一个必填项'
      this.render()
    } else {
      this.firstRender = false
      this.tip = ''
      this.render(true)
      this.cb(this.answer)
      this.resolve()
      this.destroy()
    }

  }

  reDraw = () => this.answer

  /** 渲染 */
  render = (submit = false) => {
    const beforeStr = `[${clc.red(' ? ')}] `
    const requiredTip = this.tip ? '（' + clc.red(this.tip) + '）' : ''
    const answer = submit ? clc.green(this.reDraw() + '\n') : this.reDraw()

    this.print(
      `${beforeStr}${this.question.title}${requiredTip}: ${answer}`
    )
    this.showCursor()
    this.closeWrite()
  }

  /** 清除当前输出行
   * @returns 
   */
  clean = () => {
    this.hideCursor()
    moveCursor(this.rl.output, -process.stdout.getWindowSize()[0], 0)
    clearLine(this.rl.output, 0)
    return this
  }

  /** 键盘键入监听器
   * @param s 
   * @param key 
   * @returns 
   */
  onKeypress = (s: string, key: Key) => {

    let name = key.name

    // 判断输入的 name 是否为空
    if (name === undefined) {
      if (key.sequence !== undefined) {
        if (
          !/^[~`@!#$%^&*() _+\-=\[\]{}:；“”，,。.、？?"<>；;'/！!￥……（）：《》]$/.test(key.sequence) &&
          !/^[A-Za-z0-9]$/.test(key.sequence)
        ) {
          // sequence 存在，写入到name上
          name = key.sequence
        }
      } else {
        // 都不存在，直接return
        return
      }
    }

    // 不处理上下翻页
    if (name === 'pageup' || name === 'pagedown') return
    // 不处理上下按键
    if (name === 'up' || name === 'down') return

    this.openWrite()

    // 处理左右按键
    if (
      name === 'left' ||
      name === 'right' ||
      name === 'home' ||
      name === 'end'
    ) {
      return this.moveMyCursor(name)
    }

    let render = true

    // 处理移除字符串
    if (name === 'delete' || name === 'backspace') {
      render = this.removeChar(name)
    }
    // 其它的直接填入
    else {
      this.insertChar(s)
    }

    // 渲染
    render && this.clean().render()

    // 关闭写入
    this.closeWrite()

  }

  /** 删除某个字符
   * @param key delete' | 'backspace'
   * @returns 如果返回true，表示需要render，否则不用
   */
  removeChar(key: 'delete' | 'backspace'): boolean {

    const isDelete = key === 'delete'

    // 标识是否重新render之后，需要移动光标
    let needRender = false

    // 先处理第一种情况，delete
    // 光标选中的那个元素删除，比如 "你好123"
    // 现在，光标选中1，按delete，会变成 "你好23", 光标跳到会到最后面，因为之前的被删除了，重新渲染
    // 然后，需要手动的，把光标移动到2的位置
    if (isDelete) {
      // 1. 切割字符串 现在 this.jsCursorIndex 就是切割位置
      const { afterStr, newStr, deleteStr } = spliceStr(this.answer, this.jsCursorIndex)

      // 2. 没有删除字符串，说明是在光标最后一位点击的delete，操作无效
      if (!deleteStr) return needRender

      // 3. 直接把 newStr 赋值给 answer
      this.answer = newStr

      // 4. 接着计算要往前移动几位，几位其实就是 afterStr 的长度
      const moveCursorStep = getPrintSize(afterStr)

      // 5. 如果moveCursorStep等于0，说明删除的是最后一位，那么久不需要删除了
      if (moveCursorStep) {
        process.nextTick(() => {
          this.openWrite()
          moveCursor(this.rl.output, -moveCursorStep, 0)
          this.closeWrite()
        })
      }

      needRender = true

    }
    // 第二种情况 backSpace
    // 光标选中的那个元素的 前一个元素 删除，比如 "你好123"
    // 现在，光标选中1，按backSpace，会变成 "你123", 光标跳到会到最后面，因为之前的被删除了，重新渲染
    // 然后，需要手动的，把光标移动到1的位置
    else {

      // 1. 如果 this.jsCursorIndex 为 0，说明已经删光
      // 或者光标在第一位，没什么好删的了，直接返回
      if (!this.jsCursorIndex) return needRender

      // 2. 直接删除当前光标所在的前一个位置的元素
      const { newStr, afterStr, deleteStr } = spliceStr(this.answer, this.jsCursorIndex - 1)

      // 3. 直接把 newStr 赋值给 answer
      this.answer = newStr

      // 4. 接着计算要往前移动几位，几位其实就是 afterStr 的长度
      const moveCursorStep = getPrintSize(afterStr)

      // 5. 更新 cursorIndex 和 jsCursorIndex
      this.cursorIndex -= getPrintSize(deleteStr!)
      this.jsCursorIndex -= 1

      // 6. 移动真实光标的位置
      process.nextTick(() => {
        this.openWrite()
        moveCursor(this.rl.output, -moveCursorStep, 0)
        this.closeWrite()
      })

      needRender = true

    }

    return needRender
  }

  /** 移动自己模拟的光标，记得closeWrite，不然我们自己的模拟的和output的效果会叠加触发两次
   * @param key 'left' | 'right'
   */
  moveMyCursor(key: 'left' | 'right' | 'home' | 'end') {

    if (key === 'home' || key === 'end') {

      const isHome = key === 'home'

      // 当前光标在第一位，没办法向左了
      if (isHome && this.cursorIndex === 0) {
        return this.closeWrite()
      }
      // 当前光标在最后一位，没办法向右了
      if (!isHome && this.cursorIndex >= getPrintSize(this.answer)) {
        return this.closeWrite()
      }

      // 切割答案
      const { beforeStr, deleteStr, afterStr } = spliceStr(this.answer, this.jsCursorIndex)

      // 向前移动
      if (isHome) {
        this.cursorIndex = this.jsCursorIndex = 0
        moveCursor(this.rl.output, -getPrintSize(beforeStr), 0)
      }
      // 向后运动 
      else {
        this.cursorIndex = getPrintSize(this.answer)
        this.jsCursorIndex = this.answer.length
        moveCursor(this.rl.output, getPrintSize(deleteStr ?? '') + getPrintSize(afterStr), 0)
      }

    } else {

      // 默认只移动一位
      let step = 1
      const isLeft = key === 'left'

      // 当前光标在第一位，没办法向左了
      if (isLeft && this.cursorIndex === 0) {
        return this.closeWrite()
      }
      // 当前光标在最后一位，没办法向右了
      if (!isLeft && this.cursorIndex >= getPrintSize(this.answer)) {
        return this.closeWrite()
      }

      if (isLeft) {
        // 如果是中文的话，需要移动两位
        if (isChinese(this.answer[this.jsCursorIndex - 1])) {
          step = 2
        }
        this.cursorIndex -= step
        this.jsCursorIndex--
      } else {
        // 如果是中文的话，需要移动两位
        if (isChinese(this.answer[this.jsCursorIndex])) {
          step = 2
        }
        this.cursorIndex += step
        this.jsCursorIndex++
      }

      // 移动光标
      moveCursor(this.rl.output, isLeft ? -1 * step : step, 0)

    }

    // 关闭写入
    this.closeWrite()
  }

  /** 插入字符
   * @param char 
   */
  insertChar = (char: string) => {
    // 比如现在的字符串是 "你好123"，把光标放在 1 的位置上
    // 插入一个字符，"嘿"，变成 "你好嘿123"，因为重新渲染，所以光标被移动到最后面
    // 需要手动把光标移动到 1 的位置上

    // 说明是最后一位插入
    if (this.answer.length === this.jsCursorIndex) {
      // 中文占两个
      this.cursorIndex += isChinese(char) ? 2 : 1
      this.jsCursorIndex++
      this.answer += char
    }
    // 中间位置插入
    else {
      // 从 this.jsCursorIndex 位置插入
      const { newStr, afterStr } = insertStr(this.answer, this.jsCursorIndex, char)
      // 移动内存中的光标
      this.cursorIndex += isChinese(char) ? 2 : 1
      this.jsCursorIndex++
      // 直接赋值
      this.answer = newStr

      // 移动真实光标的位置的方法 先保存起来，避免一次插入多个元素多次触发
      this.insertFunc = () => {
        this.openWrite()
        moveCursor(this.rl.output, -getPrintSize(afterStr), 0)
        this.closeWrite()
      }
      // 修改当前为脏
      this.isDirty = true
      process.nextTick(() => this.isDirty && (this.isDirty = false, this.insertFunc()))
    }

  }

}

// 字母
// q { name: 'q' }

// 数字
// 1 { name: '1' }

// 中文
// 你 { name: '你' }

// 普通字符
// undefined { sequence: ~, name: undefined }
// /[~`@!#$%^&*() _+\-=\[\]{}:；“”，,。.、？?"<>；;'/！!￥……（）———：《》]/

// 方向键
// undefined { name: 'left' }
// undefined { name: 'down' }
// undefined { name: 'up' }
// undefined { name: 'right' }

// 删除
// undefined { name: 'delete' }
// undefined { name: 'backspace' }