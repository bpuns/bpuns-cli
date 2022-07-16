import Stream from 'stream'
import process from 'process'
import readline, { Key } from 'readline'
import type { Writable } from 'stream'
import type { AllQuestion, CreateInterfaceReturn, SpliceStr, InsertStr } from './type'

/** 代理process.stdout */
export class MuteStream extends Stream {

  /** 如果 #muted 设置为true，控制台不能输入 */
  #muted: boolean = false
  /** 指定当前是终端 */
  isTTY: boolean = true

  constructor() {
    super()
    // 添加管道，当前自定义管道流给 process.stdout
    this.pipe(process.stdout)
  }

  // 输入的时候，会先触发这个方法
  // 调用 this.emit('data') 才会流向 process.stdout
  write(e: Writable) {
    if (this.#muted) return
    this.emit('data', e)
  }

  /** 开启写入 */
  public openWrite() {
    this.#muted = false
  }

  /** 关闭写入 */
  public closeWrite() {
    this.#muted = true
  }

}

/** 创建监听可读可写流 */
export function createInterface(): CreateInterfaceReturn {
  // @ts-ignore
  return readline.createInterface({
    input:  process.stdin,
    output: new MuteStream()
  })
}

/** 从中间切割字符串
 * @param str 
 * @param start 
 * @param count 
 * @returns { 切割位置前的字符串，被删除的字符串，切割位置后的字符串，新的字符串 }
 */
export function spliceStr(str: string, start: number, count: number = 1): SpliceStr {

  let beforeStr = ''
  let afterStr = ''
  let deleteStr: string | undefined
  let i: number

  const end = start + count

  // @ts-ignore
  for (i in str) {
    if (i < start) {
      beforeStr += str[i]
    } else if (i >= start && i < end) {
      if (typeof deleteStr === 'undefined') {
        deleteStr = ''
      }
      deleteStr += str[i]
    } else if (i >= end) {
      afterStr += str[i]
    }
  }

  return {
    beforeStr,
    deleteStr,
    afterStr,
    newStr: beforeStr + afterStr
  }
}

/** 从中间插入字符串
 * @param str 
 * @param start 
 * @param count 
 * @returns 
 */
export function insertStr(str: string, start: number, insertStr: string): InsertStr {

  let beforeStr = ''
  let afterStr = ''
  const insertSize = insertStr.length
  let max = str.length + insertSize
  let insertLastIndex = start + insertSize

  for (let i = 0; i < max; i++) {
    if (i < start) {
      beforeStr += str[i]
    } else if (i >= insertLastIndex) {
      afterStr += str[i - insertSize]
    }
  }

  return {
    beforeStr,
    afterStr,
    newStr: beforeStr + insertStr + afterStr,
    insertStr
  }

}

/** 所有问题的父类 */
export abstract class Question {

  /** 答案 */
  answer!: any
  /** 代理输入输出对象 */
  rl!: CreateInterfaceReturn
  /** 把output取出来，避免每次都要从rl获取 */
  output: CreateInterfaceReturn['output']
  /** 当前的问题 */
  question!: AllQuestion
  /** 标记当前是否是初始化渲染 */
  firstRender: boolean = true
  /** 回调函数 */
  cb!: (result: any) => void
  /** 保存成功回调用 */
  resolve!: (value?: any) => void
  /** 提示 */
  tip!: string
  /** 当前问题是否是必填项 */
  required!: boolean

  /** 
   * @param rl        代理对象
   * @param question  问题
   */
  constructor(rl: CreateInterfaceReturn, question: AllQuestion) {
    this.rl = rl
    this.question = question
    this.required = !!this.question.required
    this.output = rl.output
    // 避免初始化的时候，父类无法获取到子类上的 onKeypress 和 onSubmit 方法
    process.nextTick(() => {
      // 监听键盘输入事件
      this.rl.on('keypress', this.onKeypress)
      // 其实就是监听回车
      this.rl.once('line', this.onSubmit)
    })
  }

  /** 打印
   * @param value 
   */
  print(value: string) {
    this.output.write(value)
  }

  /** 显示光标 */
  showCursor() {
    this.print(showCursor())
  }

  /** 隐藏光标 */
  hideCursor() {
    this.print(hideCursor())
  }

  /** 开启写入 */
  openWrite() {
    this.output.openWrite()
  }

  /** 关闭写入 */
  closeWrite() {
    this.output.closeWrite()
  }

  /** 初始化支持 */
  abstract run(cb: (result: any) => void): Promise<string>

  /**
   * 渲染问题
   * @param submit 判断是否已经提交
   */
  abstract render(submit?: boolean): void

  /** 监听输入触发的方法 */
  abstract onKeypress(s: string, key: Key): void

  /** 回车触发的按钮 */
  abstract onSubmit(): void

  /** 清空界面 */
  abstract clean(): void

  /** 关闭监听 */
  destroy = () => {
    this.rl.off('keypress', this.onKeypress)
  }

}

function showCursor() {
  return `${'\033'}[?25h`
}

function hideCursor() {
  return `${'\033'}[?25l`
}