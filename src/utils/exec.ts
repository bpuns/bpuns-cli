import cp from 'child_process'

const isWin = process.platform === 'win32'

/** 处理参数
 * @param arg    参数
 * @param quote  主命令是否是echo，如果是，把这些参数全部转成字符串
 * @returns 
 */
function escapeArg(arg: string, quote: boolean) {
  arg = '' + arg
  if (!quote) {
    arg = arg.replace(/([\(\)%!\^<>&|;,"' ])/g, '^$1')
  } else {
    arg = arg.replace(/(\\*)"/gi, '$1$1\\"')
    arg = arg.replace(/(\\*)$/, '$1$1')
    arg = '"' + arg + '"'
  }
  return arg
}

/** 获取参数
 * @param command 
 * @param args 
 * @param options 
 * @returns 
 */
const getParams = (command: string, args: string[] = [], options: Parameters<typeof cp.spawn>[2] = {}) => {
  if (isWin) {
    // window需要特殊处理
    // 把 command 中的 ( ) % ! ^ < > & | ; , 字符前面加上 ^  
    command = command.replace(/([\(\)%!\^<>&|;, ])/g, '^$1')
    args = (args || []).map(function (arg) {
      return escapeArg(arg, command !== 'echo')
    })
    args = [ '/s', '/c', '"' + command + (args.length ? ' ' + args.join(' ') : '') + '"' ]
    command = 'cmd'
    options = options || {}
    options.windowsVerbatimArguments = true
  }
  return { command, args, options }
}

/** 执行命令
 * @param _command 
 * @param _args 
 * @param _options 
 * @returns 
 */
export default function exec(_command: string, _args?: string[], _options?: Parameters<typeof cp.spawn>[2]) {

  return new Promise<Buffer>((resolve, reject) => {

    let { command, args, options } = getParams(_command, _args, _options)

    const childProcess = cp.spawn(command, args, options)

    const buffer: Buffer[] = []
    childProcess.stdout && childProcess.stdout.on('data', buffer.push.bind(buffer))
    childProcess.addListener('error', reject)
    childProcess.addListener('exit', () => {
      resolve(Buffer.concat(buffer))
    })

  })

}

type params = Parameters<typeof getParams>

/** 执行两个命令，a命令 pipe 给 b命令
 * @param param1 
 * @param param2 
 * @returns 
 */
export function exec_pipe(param1: params, param2: params) {

  return new Promise<Buffer>((resolve, reject) => {
    try {
      const o1 = getParams(...param1)
      const o2 = getParams(...param2)

      const exec1 = cp.spawn(
        o1.command,
        o1.args,
        o1.options
      )
      const exec2 = cp.spawn(
        o2.command,
        o2.args,
        o2.options
      )

      exec1.stdout!.pipe(exec2.stdin!)

      const buffer: Buffer[] = []
      exec2.stdout!.on('data', buffer.push.bind(buffer))

      exec2.addListener('exit', () => {
        resolve(Buffer.concat(buffer))
      })

    } catch (e) {
      reject(e)
    }
  })

}