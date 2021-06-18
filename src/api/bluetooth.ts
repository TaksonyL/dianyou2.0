import {writeBT, listenBT} from '../utils/handlerBT';

/**
 * 检验指令
 */
export function getAuth(value:string) {
  return writeBT('0B49ABF0-C6FC-411D-8456-535AF817DAC8', '0B49ABF1-C6FC-411D-8456-535AF817DAC8', value);
}

/**
 * 写入数据(通用)
 */
export function writeData(value:string) {
  return writeBT('0B49ABF0-C6FC-411D-8456-535AF817DAC8', '0B49ABF2-C6FC-411D-8456-535AF817DAC8', value);
}

/**
 * 电池信息
 */
export function notifyBattery() {
  return listenBT('0000180F-0000-1000-8000-00805F9B34FB', '00002A19-0000-1000-8000-00805F9B34FB');
}

/**
 * 监听指令回调
 */
export function notifyService() {
  return listenBT('0B49ABF0-C6FC-411D-8456-535AF817DAC8', '0B49ABF3-C6FC-411D-8456-535AF817DAC8')
}

/**
 * 监听校验回调
 */
export function notifyAuth() {
  return listenBT('0B49ABF0-C6FC-411D-8456-535AF817DAC8', '0B49ABF1-C6FC-411D-8456-535AF817DAC8')
}

