/**
 * 获取控制台显示中文时展示的长度
 * @param str 
 * @returns 
 */
export function getPrintSize(str: string) {
  // 中文在控制台占用两位
  return str.replace(/[^\u0000-\u00ff]/g, '--').length
}

/**
 * 获取一个字符串中文个数
 * @param str 
 * @returns 
 */
export function getChineseSize(str: string) {

  const matchArr = str.match(/[^\u0000-\u00ff]/g)

  return matchArr ? matchArr.length : 0

}

/** 判断当前字符是否是中文
 * @param str 
 * @returns 
 */
export function isChinese(str: string) {
  return /[^\u0000-\u00ff]/.test(str)
}