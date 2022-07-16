import { Answer, SingleChoiceQuestion } from 'src/quiz'

export enum USE_FRAME { VUE2, VUE3, REACT17, REACT18 }
export enum USE_TS { YES, NO }
export enum USE_ESLINT { YES, NO }
export enum USE_YARN { YES, NO }
export enum USE_CSS_PREPROCESSOR { NO, LESS, SCSS }
export type CreateQuestion = [
  SingleChoiceQuestion<USE_FRAME>,
  SingleChoiceQuestion<USE_TS>,
  SingleChoiceQuestion<USE_ESLINT>,
  SingleChoiceQuestion<USE_CSS_PREPROCESSOR>,
  SingleChoiceQuestion<USE_YARN>,
]
export type CreateAnswer = Answer<CreateQuestion>
