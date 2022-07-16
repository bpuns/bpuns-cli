import type { Stats } from 'fs'
import path from 'path'
import { promises as fs } from 'fs'
import { message } from '.'

interface IOptions {
  /** 是否输出根节点 */
  printRoot?: boolean
}

type TraversalCallBack = (stat: Stats, path: string)=>void

/** 后序遍历某一个文件夹下的所有文件
 * @param rootPath  根节点
 * @param callback  回调
 */
async function traversalFile(rootPath: string):Promise<void>
async function traversalFile(rootPath: string, callback: TraversalCallBack):Promise<void>
async function traversalFile(rootPath: string, options: IOptions, callback: TraversalCallBack):Promise<void>
async function traversalFile(rootPath: string, options?: IOptions | TraversalCallBack, callback?: TraversalCallBack):Promise<void>{

  // 处理函数重载的参数
  if (callback === undefined && options instanceof Function){
    callback = options
    options = { printRoot: true }
  }

  try {
    const stat = await fs.stat(rootPath)
    if (stat.isDirectory()){
      readAsset(rootPath, stat, options as IOptions, callback as TraversalCallBack)
    } else {
      throw new Error(`${rootPath}不是一个文件夹`)
    }
  } catch (e){
    message.error('traversalFile', (e as Error).message)
    process.exit()
  }
}

/**
 * 读取资源
 * @param folderPath 
 * @param stat 
 * @param callback 
 */
let deepDepth = 0

async function readAsset(folderPath:string, stat:Stats, options: IOptions, callback:(stat: Stats, path: string)=>void){
  try {
    deepDepth++
    const dir = await fs.readdir(folderPath)
    for ( let child of dir ){
      const childPath = path.join(folderPath, child)
      const stat = await fs.stat(childPath)
      if (stat.isDirectory()){
        await readAsset(childPath, stat, options, callback)
      } else {
        callback(stat, childPath)
      }
    }
    deepDepth--
    if (deepDepth !== 0 && !options.printRoot){
      callback(stat, folderPath)
    }
  } catch (e){
    message.error('traversalFile:readFolder', (e as Error).message)
    process.exit()
  }
}

export default traversalFile