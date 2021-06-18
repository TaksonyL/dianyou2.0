import request from '../utils/request';

/**
 * 获取用户信息，设备信息，商品列表
 * @param {code, mf_data, machineCode, userInfo} data
 * @code {string} 登录验证code
 * @mf_data {string} 设备广播信息
 * @machineCode {string} 设备编号 
 * @userInfo {object} 用户信息
 */
export function getInfo(data:{code:string, mf_data:string, machineCode:string, userInfo:object}) {
  return request('/machine/getInfo', data, true, 'POST');
}

/**
 * 获取设备广告
 * @param {machine_code}
 * @machine_code {string} 设备编号
 * @returns 
 */
export function getBanner(data:{machine_code:string}) {
  return request('/machine/getAdvList', data, false, 'POST');
}

/**
 * 获取商品详情
 * @param {id} 
 * @id {int} 商品id 
 */
export function getDetail(data:{id:string|number}) {
  return request('/machine/goods_details', data, true, 'POST')
}

/**
 * 提交购物数据
 * @param {goodsList} data 
 * @goodsList {Array<{channel_id, goods_num}>} 购物商品数据
 * @channel_id {int} 货道ID
 * @goods_num {int} 购买数量
 */
export function goPay(data:{goodsList:[{channel_id:number, goods_num:number}], channel_id: number, goods_num:number}) {
  return request('/machine/sub_goods', data, true, 'POST')
}

/**
 * 获取支付页面
 * @param {id} data
 * @id {string} 订单ID 
 */
export function pay(data:{id:string}) {
  return request('/machine/buy_goods', data, true, 'POST')
}

/**
 * 监听订单状态
 * @param {*} data 
 */
export function listenPay(data:any) {
  return request('/machine/monitor_order', data, false, 'POST')
}

/**
 * 返回设备指令解密
 * @param {code, hex, type} data
 * @code {string} 设备编号
 * @hex {string} 设备返回指令 
 * @type {int} 指令类型 (default)1-购买出货反馈  2-测试出货反馈  3-补货结果反馈
 */
export function returnHex(data:{code:string, hex:string, type?:number, machine_id?:string, order_id?:string}) {
  return request('/machine/decryptHex', data, false, 'POST')
}

/**
 * 校验手机号
 * @param {mobile} 
 * @mobile {string} 手机号码 
 */
export function checkPhone(data:{mobile: string}) {
  return request('/machine/check_mobile', data, false, 'POST')
}

/**
 * 发送验证码
 * @param {mobile} data
 * @mobile {string} 手机号码 
 */
export function sendVerify(data:{mobile: string}) {
  return request('/common/sendSMS', data, false, 'POST')
}

/**
 * 成年人验证
 * @param {user_card_no, user_card_name, user_card_mobile, code} data 
 * @user_card_no {string} 身份证
 * @user_card_name {string} 姓名
 * @user_mobile {string} 手机号码
 * @code {string} 验证码
 */
export function checkAdult(data:{user_card_no:string, user_card_name:string, user_mobile:string, code:string}) {
  return request('/machine/info', data, true, 'POST')
}

/**
 * 获取商品列表
 * @param {*} data 
 */
export function getGoodsList(data:any) {
  return request('/machine/getGoodsList', data, true, 'POST')
}

/**
 * 更换货道商品
 * @param {channel_id, goods_id} data 
 * @channel_id {string} 货道ID
 * @goods_id {string} 商品ID
 */
export function changeGood(data:{channel_id:string|number, goods_id:string|number}) {
  return request('/machine/replaceGoods', data, true, 'POST')
}

/**
 * 获取历史订单
 * @param {*} data 
 */
export function getOrder(data:any) {
  return request('/machine/getOrderList', data, true, 'POST')
}

/**
 * 修改电池电量
 * @param {battery} data
 * @battery {string} 电池电量 
 */
export function updateBattery(data:{battery:string|number}) {
  return request('/machine/updateBattery', data, false, 'POST')
}

/**
 * 设备离线
 * @param {id} data
 * @id {string} 设备ID 
 */
export function offLine(data:{id:string}) {
  return request('/machine/offLine', data, false, 'POST')
}


/**
 * id2devcode
 * @param {id}
 * @id {string} 扫码获取ID 
 * @returns 
 */
export function getDevcode(data:{id:string}) {
  return request('/machine/idToCode', data, true, 'POST')
}