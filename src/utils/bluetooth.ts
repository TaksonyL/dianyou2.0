import { CommonModule } from '@/store/modules/common';
import { BluetoothModule } from '@/store/modules/bluetooth';
import { offLine } from '@/api/user';
import { AB2Hex } from '@/utils/util';
import getBT from '@/utils/getBT';


/**
 * 蓝牙回调页面参数 onBluetooth
 * @onBluetooth onBluetooth(type, value)
 * 
 * @close 蓝牙关闭
 * 
 * @connect 蓝牙连接
 * 
 * @feedback 出货回调
 * @value {hex} 回调指令
 * 
 * @battery 电池回调
 * @value {string} 当前电量
 */


/**
 * 初始化蓝牙
 */
 export function initBT () {
  return new Promise((resolve, reject) => {
    uni.openBluetoothAdapter({
      success(res) {
        console.log('初始化蓝牙')
        resolve(res);
      },
      fail(err) {
        console.log('初始化失败')
        reject(err);
      }
    })
  })
}

/**
 * 找到蓝牙
 */
export async function findBT () {
  if(!BluetoothModule.localName) {
    console.log('搜索设备号为空')
    return
  } else if (!BluetoothModule.launch) {
    console.log('蓝牙未打开')
    return
  }
  console.log(BluetoothModule.localName, '搜索设备号');
  let searchData:any = await searchBT();
  // 定义设备基本参数
  BluetoothModule.SET_BLUETOOTH({
    deviceId: searchData.deviceId,
    deviceInfo: AB2Hex(searchData.advertisData)
  })

  // connectDev();
  remindPage('connect'); 
}


/**
 * 蓝牙搜索
 */
export function searchBT () {
  uni.showLoading({
    title: '搜索设备...'
  })
  return new Promise((resolve, reject) => {
    if(CommonModule.findBT) reject();
    // 开启搜索功能
    CommonModule.SET_FINDBT(true);
    uni.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      interval: 2000,
      success(res) {
        CommonModule.SET_FINDBT(false);

        //#ifdef MP-ALIPAY
        uni.getBluetoothDevices({
          success(dev) {
            for(let item of dev.devices) {
              if(item.localName === BluetoothModule.localName) {
                console.log(dev, '找到设备', BluetoothModule.localName)
                uni.hideLoading();
                // 匹配成功 (关闭功能)
                uni.stopBluetoothDevicesDiscovery({});
                // 返回设备信息
                resolve(item);
              }
            }
            // 搜索匹配设备
            uni.onBluetoothDeviceFound((result) => {
              for(let item of result.devices) {
                if(item.localName === BluetoothModule.localName) {
                  console.log(result, '找到设备', BluetoothModule.localName)
                  uni.hideLoading();
                  // 匹配成功 (关闭功能)
                  uni.stopBluetoothDevicesDiscovery({});
                  // 返回设备信息
                  resolve(item);
                }
              }
            })
          }
        })
        //#endif

        // 搜索匹配设备
        //#ifdef  MP-WEIXIN
        uni.onBluetoothDeviceFound((result) => {
          for(let item of result.devices) {
            if(item.localName === BluetoothModule.localName) {
              console.log(result, '找到设备', BluetoothModule.localName)
              uni.hideLoading();
              // 匹配成功 (关闭功能)
              uni.stopBluetoothDevicesDiscovery({});
              // 返回设备信息
              resolve(item);
            }
          }
        })
        //#endif

      },
      fail(err) {
        CommonModule.SET_FINDBT(false);
        uni.hideLoading();
        console.log(err);
        reject(err);
      } 
    })  
  })
}

/**
 * 重新搜索蓝牙
 * @name {string} 设备localname 用于搜索设备
 */
export function devicesBT(name: string) {
  uni.showLoading({
    title: '搜索设备...'
  })
  return new Promise((resolve, reject) => {
    uni.getBluetoothDevices({
      success(res) {
        let { devices } = res;
        for(let item of devices) {
          if(item.localName === name) {
            console.log(devices, '重新找到设备')
            // 返回设备信息
            resolve(item);
          }
        }
      },
      complete() {
        uni.hideLoading()
      }
    })
  })
}

/**
 * 蓝牙连接
 * @deviceId {string} deviceId 
 */
let mistake = 0;
export function connectBT (deviceId:string) {
  uni.onBLEConnectionStateChange((result) => {
    console.log('蓝牙连接状态', result);
    if(!result.connected) {
      uni.showToast({
        title: '蓝牙已断开',
        icon: 'none'
      })
      if(CommonModule.machineId && CommonModule.connect) {
        offLine({id: CommonModule.machineId})
      }
      CommonModule.SET_CONNECT(false)
    } else {
      CommonModule.SET_CONNECT(true)
    }
  })

  return new Promise((resolve, reject) => {
    uni.showLoading({
      title: "正在连接..."
    })
    uni.createBLEConnection({
      deviceId,
      success(res) {
        console.log(res, '蓝牙连接成功');
        mistake = 0
        uni.hideLoading();

        // remindPage('connect');   // 回调当前页面连接成功

        resolve(res);
      },
      fail(err) {
        console.log(err, deviceId, mistake, '蓝牙连接失败');
        // 重连
        mistake++
        if(mistake >= 5) {
          uni.hideLoading();
          uni.showModal({
            title: '提示',
            content: '蓝牙在忙，请稍后重试！',
            showCancel: false
          })
          reject()
        } else {
          remindPage('reConnect'); 
        }
      }
    })  
  })
}

/**
 * 蓝牙重连
 * @param {refind} 是否重新寻找蓝牙
 */
export async function reconnectBT(refind:boolean = false) {
  if(CommonModule.unLoad) {
    CommonModule.SET_UNLOAD(false);
    if(CommonModule.connect) return;
    if(CommonModule.payTime) {
      // 支付保持连接
      // CommonModule.SET_PAYTIME(false)
    } else {
      if(BluetoothModule.launch && BluetoothModule.auth) {

        if(refind) {
          findBT();
        } else if (BluetoothModule.deviceId) {
          getBT();
        } else {
          findBT();
        }
      }
    }  
  }
}


/**
 * 关闭蓝牙
 * @app {object} 
 * @remove {boolean} 是否关闭蓝牙实例
 */
export function closeBT (deviceId:string, remove:boolean = false) {
  return new Promise((resolve, reject) => {
    // 关闭监听
    // uni.offBLECharacteristicValueChange();

    // 断开连接
    uni.closeBLEConnection({
      deviceId,
      success(res) {
        if(remove) {
          uni.closeBluetoothAdapter({
            success(res) {
              BluetoothModule.SET_BLUETOOTH({init: false})
              resolve(res);
            },
            fail(err) {
              reject(err);
            }
          })
        } else {
          resolve(res);
        }
      },
      fail(err) {
        reject(err);
      }
    })  
  })
}


/**
 * 监听蓝牙特征值回调
 * @channel {function} 出货回调
 * @battery {function} 电池回调
 */
export function listenBT(channel= (e:any)=>{}, battery= (e:any)=>{}) {
  uni.onBLECharacteristicValueChange((result) => {
    if(result.characteristicId === '0B49ABF3-C6FC-411D-8456-535AF817DAC8' || result.characteristicId === "0b49abf3-c6fc-411d-8456-535af817dac8") {
      channel(result);
    } else if (result.characteristicId === '00002A19-0000-1000-8000-00805F9B34FB' || result.characteristicId === "00002a19-0000-1000-8000-00805f9b34fb") {
      battery(result);
    }
  })
}

/**
 * 回调当前页面
 * @type {string} 回调类型
 * @value {any}   回调参数
 */
export function remindPage(type:string, value:any = '') {
  try{
    let page:any = getCurrentPages();
    page = page[page.length-1].$vm;
    // 蓝牙关闭后回调页面蓝牙关闭操作
    page.onBluetooth({type, value});
  } catch (err) {
    console.log(err, '没有回调页面');
  }
}


