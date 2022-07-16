import { Text } from './Text'

export class Password extends Text {

  reDraw = () => ''.padStart(this.answer.length, '*')

}