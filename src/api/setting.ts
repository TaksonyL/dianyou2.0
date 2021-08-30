import request from '../utils/request';

/**
 * 绑定补货员
 * @data {code, users_id, userInfo} 
 * @code {string} 用户登录code
 * @users_id {string} 补货员ID
 * @userInfo {object} 用户信息
 */
export function userBind(data:{code:string, users_id:string, userInfo:any}) {
  return request('/machine_auth/binding', data, true, 'POST')
}

/**
 * 获取 灯光定时开关 or 设置当前时间
 * @param {type, code, start, end, time} data
 * @type {int} 1-灯光定时开关  2-设置当前时间
 * @machine_id {string} 设备ID
 * @code {string} 设备编号
 * 
 *  type === 1
 * @start {string} 开始时间 HH-MM
 * @end {string} 结束时间 HH-MM
 * 
 *  type === 2
 * @time {string} 当前时间 HH-MM-SS
 */
export function getEncrypt(data:{type:1|2|number, machine_id:string, code:string, start?:string, end?:string, time?:string}) {
  return request('/machine/encryptHex', data, true, 'POST')
}

/**
 * 获取货道测试指令
 * @param {channel} data
 * @channel {string} 货道号 
 */
export function testChannel(data:{channel:string}) {
  return request('/machine/channel_test', data, true, 'POST')
}

/**
 * 获取补货指令
 * @param {channel} data
 * @channel {string} 货道号
 */
export function repChannel(data:{channel:string}) {
  return request('/machine/getRepHex', data, false, 'POST')
}

/**
 * 置换商品
 * @param {channel_id, goods_id} data
 * @channel_id {string} 货道ID
 * @goods_id {string} 商品ID 
 */
export function changeGoods(data:{channel_id:string, goods_id:string}) {
  return request('/machine/replaceGood', data, true, 'POST')
}

/**
 * 获取读取时间回调指令
 * @param {hex_name} data
 * @hex_name {readTiming | readNowTiming} readTiming-获取定时时间, readNowTime-获取当前时间
 */
export function getTimeHex(data:{hex_name:'readTiming'|'readNowTime'}) {
  return request('/machine/getReadTimeHex', data, true, 'POST')
}

/**
 * 获取复位指令
 * @param {*} data 
 */
export function getRestoration(data:any) {
  return request('/machine/getRestoration', data, true, 'POST')
}