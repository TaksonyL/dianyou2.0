import { Hex2AB } from './util';
import { BluetoothModule } from '@/store/modules/bluetooth';
import { CommonModule } from '@/store/modules/common';

/**
 * 蓝牙数据写入
 * @param {string} serviceId            // 蓝牙服务uuid 
 * @param {string} characteristicId     // 蓝牙特征值
 * @param {string} value           // 16进制指令
 */
export async function writeBT(serviceId:string, characteristicId:string, value:string) {
  if(!CommonModule.connect) {
    uni.showModal({
      title: '提示',
      content: '蓝牙异常，请重连',
      showCancel: false,
    })
    return
  }
  await charactBT(BluetoothModule.deviceId, serviceId)
  let valueAB:any =  Hex2AB(value)
  return new Promise((resolve, rejects) => {
    uni.writeBLECharacteristicValue({
      deviceId: BluetoothModule.deviceId,
      serviceId,
      characteristicId,
      value:valueAB,
      success(res) {
        console.log(res, '蓝牙写入成功')
        resolve(res);
      },
      fail(err) {
        console.log(err, '蓝牙写入失败')
        rejects(err);
      }
    })
  })
}

/**
 * 监听蓝牙服务数据回调
 * @param {string} serviceId          // 蓝牙服务uuid
 * @param {string} characteristicId   // 蓝牙特征值
 */
export async function listenBT(serviceId:string, characteristicId:string) {
  await charactBT(BluetoothModule.deviceId, serviceId)
  // 开启notify
  return new Promise((resolve, reject) => {
    uni.notifyBLECharacteristicValueChange({
      deviceId: BluetoothModule.deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      state: true,
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err);
      }
    })  
  })
}

/**
 * 获取蓝牙设备所有服务
 * @deviceId {string} 蓝牙设备ID 
 */
export function servicesBT(deviceId:string) {
  return new Promise((resolve, reject) => {
    uni.getBLEDeviceServices({
      deviceId,
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
 * 获取蓝牙设备特征值
 * @deviceId {string} 蓝牙设备ID 
 * @serviceId {string} 蓝牙服务值 
 */
export function charactBT(deviceId:string, serviceId:string) {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success(res) {
        resolve(res)
      },
      fail(err) {
        console.log(err)
        reject(err)
      }
    })
  })
}