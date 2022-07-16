import { QUIZ_TYPE } from './type'
import { createInterface } from './utils'
import { Text } from './children/Text'
import { Password } from './children/Password'
import { SingleChoice } from './children/SingleChoice'
import { MultipleChoice } from './children/MultipleChoice'
import type { AllQuestion, Answer } from './type'
import type { Key } from 'readline'

/** 提出问题
 * @param questions 
 * @returns 
 */
export async function quiz<T extends AllQuestion[]>(questions: T): Promise<Answer<T>> {

  // 保存答案
  const answer: Answer<T> = [] as Answer<T>

  // 创建输入输出代理
  const rl = createInterface()

  // 不写这一行，会造成光标无法隐藏
  rl.resume()

  // 每次执行回调就会触发这个方法
  const callback = Array.prototype.push.bind(answer) as (result: any) => void

  /** 键盘输入就会触发这个方法
   * @param {*} s    输入的值，比如 a，b，c
   * @param {*} key  { sequence: 'a', name: 'a', ctrl: false, meta: false, shift: false }
   */
  function onKeypress(s: string, key: Key) {
    if (key && (key.name === 'enter' || key.name === 'return')) return
    if (rl) {
      // 如果这边不 emit，外面用 rl 绑定 keypress 事件就不会被触发
      rl.emit('keypress', s, key)
    }
  }
  process.stdin.on('keypress', onKeypress)

  // 循环所有问题
  for (let question of questions) {
    switch (question.type) {
      case QUIZ_TYPE.TEXT:
        await (new Text(rl, question).run(callback))
        break
      case QUIZ_TYPE.PASSWORD:
        await (new Password(rl, question).run(callback))
        break
      case QUIZ_TYPE.SINGLE_CHOICE:
        await (new SingleChoice(rl, question).run(callback))
        break
      case QUIZ_TYPE.MULTIPLE_CHOICE:
        await (new MultipleChoice(rl, question).run(callback))
        break
    }
  }

  // 关闭输入输出流
  rl.close()

  // 返回答案
  return answer

}

export * from './type'