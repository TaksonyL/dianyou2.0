/**
 * 小程序Login封装
 * @returns 
 */
export function login():Promise<{authResult:any, code:string, errMsg:string}> {
  return new Promise((resolve, reject) => {
    uni.login({
      scopes: 'auth_user',
      success(res) {
        resolve(res);
      },
      fail(err) {
        reject();
      }
    })
  })
}

/**
 * 获取用户平台
 * @param {string} service 服务类型 oauth|share|payment|push
 */
 export function getProvider(service:'oauth'|'share'|'payment'|'push'):Promise<{service:string, provider:string[], errMsg:string}> {
  return new Promise((resolve, reject) => {
    uni.getProvider({
      service,
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

/**
 * 生成时间
 * @param date 
 * @param form  时间格式 
 * @returns 
 */
export function formatTime(date:any, form:string = 'YY-MM-DD hh:mm:ss') {
  const year = formatNumber(date.getFullYear())
  const month = formatNumber(date.getMonth() + 1)
  const day = formatNumber(date.getDate())
  const hour = formatNumber(date.getHours())
  const minute = formatNumber(date.getMinutes())
  const second = formatNumber(date.getSeconds())

  return form.replace('YY', year).replace('MM', month).replace('DD', day).replace('hh',hour).replace('mm', minute).replace('ss', second);

  // return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

function formatNumber(n:string | number) {
  n = n.toString()
  return n[1] ? n : `0${n}`
}


/**
 * 16进制 to 10进制
 * @hex {Hex}
 */
 export function Hex2Int(hex:string) {
  var len = hex.length, 
  a = new Array(len), code;
  for (var i = 0; i < len; i++) {
    code = hex.charCodeAt(i);
    if (48<=code && code < 58) {
        code -= 48;
    } else {
        code = (code & 0xdf) - 65 + 10;
    }
    a[i] = code;
  }
  return a.reduce(function(acc, c) {
    acc = 16 * acc + c;
    return acc;
  }, 0);
}

/**
 * 时间 to 协议16进制
 * @time {string} 时  
 */
 export function Time2Hex(time:string | number) {
  time = Number(time);
  let timeHex = time.toString(16);
  if(time < 16) timeHex = '0' + timeHex;
  return timeHex;
}