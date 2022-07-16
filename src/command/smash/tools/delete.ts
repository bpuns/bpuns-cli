import path from 'path'
import fs from 'fs'
import { message } from 'src/utils'

type CallBack = (...args: any[]) => void
type FilePath = string
type Options = { isNodeModule: boolean }

/**
 * 入口
 * @param files    要删除的文件
 * @param cb       删除完成后的回调
 * @param options  配置
 */
export default function smash(
  files: FilePath[],
  cb: CallBack,
  options: Options = { isNodeModule: false }
) {

  // 要删除的数量
  let deleteCount = files.length

  // 如果要删除的文件长度为0，不执行
  if (deleteCount === 0) {
    cb()
  }
  // 要删除多个文件
  else {
    // 遍历
    files.forEach(file => {
      _smash(file, function (err) {
        // 如果存在错误，直接结束
        if (err) {
          cb(err)
        } else {
          // 删除完成就会调用这个会调，判断是否全部删除完成，删除完成就调用回调
          --deleteCount === 0 && cb()
        }
      }, options)
    })
  }
}

/**
 * 在这个函数中判断改文件是文件夹还是文件
 * 如果是文件直接删除
 * 如果是文件夹，调用删除文件夹的操作
 * @param file 
 * @param cb 
 */
function _smash(file: FilePath, cb: CallBack, options: Options) {
  fs.lstat(file, (err, stat) => {
    if (err) {
      cb(err)
      // return message.error('删除错误', err.message)
    } else {
      // 如果是文件夹，调用删除文件夹的函数
      if (stat.isDirectory()) {
        if (options.isNodeModule) {
          rmdirS(file, cb, options)
        } else {
          rmdir(file, cb, options)
        }
      } else {
        // 如果是文件，直接删除
        fs.unlink(file, (err) => {
          cb(err)
          // if (err) {
          //   return message.error('删除错误', err.message)
          // } else {
          //   cb()
          // }
        })
      }
    }
  })
}

/** 删除文件夹 */
function rmdir(folder: FilePath, cb: CallBack, options: Options) {
  fs.rmdir(folder, err => {
    if (err && (err.code === 'ENOTEMPTY' || err.code === 'EEXIST' || err.code === 'EPERM')) {
      rmdirS(folder, cb, options)
    } else {
      cb(err)
    }
  })
}

/** 读取之后，才删除文件夹 */
function rmdirS(folder: FilePath, cb: CallBack, options: Options) {
  fs.readdir(folder, (er, files) => {
    let n = files.length
    // 如果子文件夹不存在子项，那么直接删除它
    if (n === 0) return fs.rmdir(folder, cb)
    files.forEach(f => {
      _smash(path.join(folder, f), err => {
        // if (err) {
        //   message.error('删除错误', err.message)
        // }
        if (er) {
          cb(err)
        } else {
          if (--n === 0) {
            rmdir(folder, cb, options)
          }
        }
      }, options)
    })
  })
}