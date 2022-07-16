/**
 * 时间格式
 */
const invalid = 'Invalid Date'

export const dateFormat = 'yyyy-MM-dd'
export const timeFormat = 'HH:mm:ss'

type dateType = Omit<Date, 'toString' | 'constructor'>;

export interface IXDate<N = number, S = string> extends dateType {
  date: Date
  dateObj: {
    [key in 'date' | 'hours' | 'minutes' | 'month' | 'seconds' | 'year']: N
  }
  formatObj: {
    [key in 'HH' | 'MM' | 'Y' | 'd' | 'dd' | 'm' | 'mm' | 'ss' | 'yy' | 'yyyy']: S
  }
  toString: (format?: string) => string
  format: (
    format?: 'yyyy-MM-dd' | 'HH:mm:ss' | 'yyyy' | 'MM' | 'yyyy/MM/dd' | 'yyyy/MM' | 'MM/dd'
      | 'dd' | 'HH' | 'mm' | 'ss' | 'yyyy-MM' | 'MM-dd' | 'HH-mm'
  ) => string
}

function xDate(this: any, date: string | Date | number = new Date()): IXDate {
  return init((this instanceof xDate) ? this : new (xDate as any)(), date) as IXDate
}

xDate.prototype.format = function (_format) {
  return this.toString(_format)
}

xDate.prototype.toString = function (_format = `${dateFormat} ${timeFormat}`) {
  let z = /(yyyy|yy|MM|dd|HH|mm|ss|Y|m|d)/g
  return _format.replace(z, (...args) => {
    return this.formatObj[args[1]]
  })
}

function init(xdate: any, date: string | Date | number) {
  xdate.date = convertDate(date);
  [ xdate.formatObj, xdate.dateObj ] = coerceToObj(xdate.date)
  return xdate
}

function convertDate(_date) {
  // 如果传进来的是xDate实例的话，获取到里面的date
  if (_date instanceof xDate) {
    return (_date as any).date
  }
  // 如果传进来的是时间类型的话
  if (_date instanceof Date) return _date
  const currentDate = new Date()
  // 如果传进来的是字符类型的话
  if (typeof _date === 'number') {
    return new Date(_date)
  }
  // 如果传进来的是字符串的话
  if (_date instanceof String || typeof _date === 'string') {
    // 对传进来的时间字符串进行处理
    let timestr = _date.replace(/-/g, '/')
    let findPoint = timestr.indexOf('.')
    if (!Object.is(findPoint, -1)) {
      timestr = timestr.slice(0, findPoint)
    }
    // 处理完成之后返回
    const possibleDate = new Date(timestr)
    if (Object.is(String(possibleDate), invalid)) {
      throw new Error(invalid)
    } else {
      return possibleDate
    }
  }
  return currentDate
}

function coerceToObj(date) {
  const dateObj = {
    year:    date.getFullYear(),
    month:   date.getMonth(),
    date:    date.getDate(),
    hours:   date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
  }
  const d = {
    yyyy: String(dateObj.year),
    yy:   String(dateObj.year).slice(2, 4),
    MM:   zeroPad(dateObj.month + 1),
    dd:   zeroPad(dateObj.date),
    HH:   zeroPad(dateObj.hours),
    mm:   zeroPad(dateObj.minutes),
    ss:   zeroPad(dateObj.seconds)
  }
  return [
    {
      ...d,
      Y: d.yyyy,
      m: d.MM,
      d: d.dd
    },
    dateObj
  ]
}

export function zeroPad(n: number | string, len = 2): string {
  return String(n).padStart(len, '0')
}

// 给xDate类挂载上所有Date实例上的函数
const dateProtoTypeFunctions = Object.getOwnPropertyNames(Date.prototype).filter(
  item => item !== 'constructor' && item !== 'toString' && item !== 'format'
)
dateProtoTypeFunctions.forEach((item) => {
  xDate.prototype[item] = function () {
    let result = Date['prototype'][item].apply(this.date, arguments)
    if (item.indexOf('set') !== -1) [ this.formatObj, this.dateObj ] = coerceToObj(this.date)
    return result
  }
})

export default xDate