import { Key } from 'readline'
import { SingleChoice } from './SingleChoice'

export class MultipleChoice extends SingleChoice {
  
  /** 标识当前是多选 */
  SingleChoice = false

}