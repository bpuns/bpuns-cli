import { COMMAND, EXEC_NAME } from 'src/constant'
import { CommandAbs } from 'src/command/Command'
import { quiz, QUIZ_TYPE } from 'src/quiz'
import type {
  TextQuestion,
  PasswordQuestion,
  SingleChoiceQuestion,
  MultipleChoiceQuestion
} from 'src/quiz'

/** 测试 */
export default class TestCommand extends CommandAbs {

  public description = '测试'
  public execFormat: string = `${EXEC_NAME} ${COMMAND.TEST}`
  public commandName: COMMAND = COMMAND.TEST
  public childrenCommand?: Partial<Record<COMMAND, CommandAbs>> | undefined

  public exec(command: string[]) {

    enum SingleType {
      REACT = 'react项目',
      VUE = 'vue项目',
    }
    
    enum MultipleType {
      ESLINT = 'eslint',
      TYPESCRIPT = 'typescript支持'
    }

    quiz<[
      TextQuestion,
      PasswordQuestion,
      SingleChoiceQuestion<SingleType>,
      MultipleChoiceQuestion<MultipleType>,
    ]>([
      {
        type:     QUIZ_TYPE.TEXT,
        title:    '文本问题',
        default:  '',
        required: true
      },
      {
        type:     QUIZ_TYPE.PASSWORD,
        title:    '密码',
        required: true
      },
      {
        type:  QUIZ_TYPE.SINGLE_CHOICE,
        title: '单选',
        list:  [
          { id: SingleType.VUE, label: 'vue项目' },
          { id: SingleType.REACT, label: 'react项目' }
        ]
      },
      {
        type:     QUIZ_TYPE.MULTIPLE_CHOICE,
        title:    '多选',
        required: true,
        default:  [ MultipleType.TYPESCRIPT ],
        list:     [
          { id: MultipleType.ESLINT, label: 'vue项目' },
          { id: MultipleType.TYPESCRIPT, label: 'react项目' }
        ]
      }
    ]).then(res => {
      console.log(res)
    })

  }

}