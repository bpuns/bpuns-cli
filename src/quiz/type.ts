import type { Interface } from 'readline'
import type { MuteStream } from './utils'

/** 当前cli工具支持哪几种类型 */
export enum QUIZ_TYPE {
  // 输入文本
  TEXT,
  // 密码框
  PASSWORD,
  // 单选
  SINGLE_CHOICE,
  // 多选
  MULTIPLE_CHOICE
}

/** 文本问题 */
export type TextQuestion = {
  // 类型
  type: QUIZ_TYPE.TEXT,
  // 标题
  title: string,
  // 默认
  default?: string,
  // 是否必填
  required?: boolean
}

/** 密码问题 */
export type PasswordQuestion = Omit<TextQuestion, 'type'> & { type: QUIZ_TYPE.PASSWORD }

/** 单选问题 */
export type SingleChoiceQuestion<T = any> = {
  // 类型
  type: QUIZ_TYPE.SINGLE_CHOICE,
  // 标题
  title: string,
  // 默认，如果是当选的话，只取第一个
  default?: T,
  // 是否必填
  required?: boolean,
  // 问题列表
  list: {
    // 选中的id
    id: T,
    // 显示的值
    label: string
  }[]
}

/** 多选问题 */
export type MultipleChoiceQuestion<T = any> = Omit<SingleChoiceQuestion<T>, 'type' | 'default'> & {
  type: QUIZ_TYPE.MULTIPLE_CHOICE
  default?: T[]
}

/** 问题总类型 */
export type AllQuestion = TextQuestion | PasswordQuestion | SingleChoiceQuestion | MultipleChoiceQuestion

/** 文本答案 */
type TextAnswer = string
/** 密码答案 */
type PasswordAnswer = TextAnswer
/** 单选答案 */
type SingleChoiceAnswer<T = any> = T
/** 多选答案 */
type MultipleChoiceAnswer<T = any> = T[]

/** 取出当选与多选的泛型的类型 */
type GetChoiceQuestionResult<T> = T extends SingleChoiceQuestion<infer Type> ? SingleChoiceAnswer<Type> : (
  T extends MultipleChoiceQuestion<infer Type> ? MultipleChoiceAnswer<Type> : never
)

/** 根据泛型，自动推断返回的答案类型 */
export type Answer<T> = T extends [infer SingleQuestion] ? (
  SingleQuestion extends AllQuestion ? (
    SingleQuestion extends TextQuestion | PasswordQuestion ? [TextAnswer] : (
      SingleQuestion extends SingleChoiceQuestion | MultipleChoiceQuestion ? (
        [GetChoiceQuestionResult<SingleQuestion>]
      ) : never
    )
  ) : never
) : (
    T extends [infer FirstQuestion, ...infer OtherQuestion] ? [
      FirstQuestion extends AllQuestion ? (
        FirstQuestion extends TextQuestion | PasswordQuestion ? TextAnswer : (
          FirstQuestion extends SingleChoiceQuestion | MultipleChoiceQuestion ? (
            GetChoiceQuestionResult<FirstQuestion>
          ) : never
        )
      ) : never
      , ...Answer<OtherQuestion>
    ] : never
  )

/** 重写 createInterface 返回的类型  */
export type CreateInterfaceReturn = {
  // 添加上 openWrite 和 closeWrite 方法
  output: NodeJS.WritableStream & Pick<InstanceType<MuteStreamType>, 'openWrite' | 'closeWrite'>
} & Interface

/** 自定义 MuteStream 类 */
export type MuteStreamType = typeof MuteStream

/** 切割字符串返回的值类型 */
export interface SpliceStr {
  beforeStr: string
  deleteStr?: string
  afterStr: string
  newStr: string
}

/** 插入字符串返回的类型 */
export interface InsertStr {
  beforeStr: string
  insertStr: string
  afterStr: string
  newStr: string
}

// declare function quiz<T extends Question[]>(params: T): Answer<T>

// enum Test {
//   A,
//   B,
//   C
// }

// const Answer2 = quiz<[
//   SingleChoiceQuestion<string>,
//   SingleChoiceQuestion<number>,
//   TextQuestion,
//   MultipleChoiceQuestion<Test>
// ]>([
//   {
//     type:  CLI_TYPE.SINGLE_CHOICE,
//     title: '单选问题',
//     list:  [
//       { id: '1', label: 'xx' }
//     ]
//   },
//   {
//     type:  CLI_TYPE.SINGLE_CHOICE,
//     title: '单选问题',
//     list:  []
//   },
//   {
//     type:  CLI_TYPE.TEXT,
//     title: '文本问题'
//   },
//   {
//     type:  CLI_TYPE.MULTIPLE_CHOICE,
//     title: '多选问题',
//     list:  []
//   }
// ])