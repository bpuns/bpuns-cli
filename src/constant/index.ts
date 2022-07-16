import path from 'path'

/**
 * 所有常量
 */
export enum COMMAND {
  /** 输出版本号 */
  VERSION = 'version',

  /** 提示如何使用 */
  TIP = 'tip',

  /** npm的一系列操作 */
  NPM = 'npm',
  /** npm添加 */
  NPM_ADD = 'add',
  /** npm移除 */
  NPM_REMOVE = 'remove',
  /** npm使用 */
  NPM_USE = 'use',
  /** 查看npm list */
  NPM_LIST = 'ls',

  /** 删除文件 */
  SMASH = 'smash',
  SMASH_T = '-t',

  /** 启动项目 */
  START = 's',

  /** 测试 */
  TEST = 'test',

  /** 重置文件时间 */
  UTIME = 'utime',

  /** 创建项目 */
  CREATE = 'create',

  /** 解决windows端口占用 */
  KILL = 'kill',

  /** 修改图片名字 */
  QC = 'qc',

  /** 快速打开一个项目 */
  FAST = 'fast',
  /** 持久化一个快速打开一个项目 */
  FAST_ADD = 'add',
  /** 移除一个快速打开一个项目 */
  FAST_REMOVE = 'remove',
  /** 查看现在存在的快速打开一个项目列表 */
  FAST_LS = 'ls',

  /** 编译bp源码 */
  DEV = 'dev'

  // PUSH_GIT = 'push',                 // commit push git
  // CREATE_PATH = 'createPath',        // 创建路径
  // PWD = 'pwd'                        // 查看脚本执行目录
}

/** 这个cli工具的执行命令 */
export const EXEC_NAME = Object.keys(require('../../package.json').bin)[0]

/** npm默认配置类型 */
export type INpmList = Record<'registryName' | 'registryUrl', string>

/** npm仓库地址 */
export const DEFAULT_NPM_LIST: INpmList[] = [
  { registryName: 'npm', registryUrl: 'https://registry.npmjs.org/' },
  { registryName: 'cnpm', registryUrl: 'http://r.cnpmjs.org/' },
  { registryName: 'taobao', registryUrl: 'https://registry.npm.taobao.org/' },
  { registryName: 'rednpm', registryUrl: 'http://registry.mirror.cqupt.edu.cn/' },
  { registryName: 'npmMirror', registryUrl: 'https://skimdb.npmjs.com/registry/' }
]

/** 前端项目git地址 */
export const GIT_URL = {
  react: 'https://gitee.com/bpuns/bpuns-component-ts.git'
}

/** 当前项目所在地址 */
export const PROJECT_PATH = path.join(__dirname, '../../')

/** 快速打开项目默认配置类型 */
export type IFastList = Record<'index' | 'path' | 'remark', string>

/** 默认的快速打开路径 */
export const DEFAULT_FAST_LIST: IFastList[] = [
  { index: 'bp', path: PROJECT_PATH, remark: 'bp cli工具' }
]
