export function formatTime(date:any) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

export function formatNumber(n:string | number) {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * ArrayBuffer to 16进制
 * @data {ArrayBuffer}
 */
export function AB2Hex(data:ArrayBuffer) {
  if(typeof(data) === 'string') {
    return data;
  }
  return Array.prototype.map.call(new Uint8Array(data), (x) => ('00' + x.toString(16)).slice(-2)).join('');
}

/**
 * 16进制 to ArrayBuffer
 * @data {Hex}
 */
export function Hex2AB(data:string) {
  let arr = data.match(/[\da-f]{2}/gi);
  if(arr === null) return;
  return new Uint8Array(
    arr.map(
      (bit) => {return parseInt(bit, 16)})
  ).buffer
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
 * 10进制 to 16进制
 * @str {string}
 */
export function Str2Hex(str:any) {
  if(str === '') return '';
  let hex = '';
  for(let i in str) {
    hex += str.charCodeAt(i).toString(16);
  }
  return hex;
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

/**
 * 小程序login封装
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

