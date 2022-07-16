import { clc } from '.'

function info(content: string) {
  console.log(content)
}

function success(content: string) {
  console.log(clc.greenBG('成功：'), clc.green(content))
}

function error(title: string, content: unknown) {
  console.log(`${clc.redBG('失败')}：${clc.red(title)}`)
  console.log(content instanceof Error ? content.message : content)
}

function warn(title: string){
  console.log(`[${clc.yellow('警告')}]：${title}`)
}

const message = {
  info,
  success,
  error,
  warn
}

export default message