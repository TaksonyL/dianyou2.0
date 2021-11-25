/**
 * 蓝牙模块底层封装
 */
export default class Bluetooth{
  private mistake:number = 0;       // 重连次数
  private deviceId = ''             // 蓝牙设备ID
  readonly debug:boolean = false;    // 调试模式

  protected onConnectBluetooth:Function = () => {};         // 连接回调函数
  protected onStatusBluetooth:Function = () => {};          // 状态回调函数
  protected onSwithcBluetooth:Function = () => {};          // 蓝牙开关回调
  protected onFindBluetooth:Function = () => {};            // 寻找设备回调函数

  public battery:number = 100;    // 设备电量
  public status = {             // 蓝牙模块状态
    launch: false,              // 蓝牙是否已经初始化
    init: false,                // 是否开启蓝牙
    // adapter: false,          // 是否存在蓝牙设备
    find: false,                // 蓝牙是否在搜索
    connect: false,             // 蓝牙是否链接
  }
  public commandBluetooth:{service:string, character:any }[] = []    // 蓝牙设备服务协议 - services

  constructor() {
    let that = this
    // 监听蓝牙设备变化
    uni.onBluetoothAdapterStateChange((res) => {
      that.returnStatus('init', res.available);
      that.returnStatus('find', res.discovering);
    })
    // 监听蓝牙链接状态
    uni.onBLEConnectionStateChange((res) => {
      that.returnStatus('connect', res.connected);
    })
    // 监听寻找设备返回
    uni.onBluetoothDeviceFound((res) => {
      let item = that.onFindBluetooth(res);
      if(item) {
        that.searchStopBluetooth();
        that.deviceId = item.deviceId;
        that.connectBluetooth();
      }
    })
  }

  /**
   * 初始化蓝牙设备
   * @returns 
   */
  protected initBluetooth() {
    let that = this;
    
    return new Promise((resolve, reject) => {
      uni.openBluetoothAdapter({
        success(res) {
          that.log('蓝牙打开', res);
          that.returnStatus('launch', true);
          that.returnStatus('init', true);
          resolve(res);
        },
        fail(err) {
          that.log('初始化失败', err);
          that.log('请打开蓝牙');
          reject(err);
        }
      })
    })
  }

  /**
   * 寻找设备
   * @returns 
   */
  protected searchBluetooth() {
    let that = this;
    if(!that.status.init) return this.log('蓝牙设备未打开');
    if(that.status.find) return this.log('搜索已经打开');
    return new Promise((resolve, reject) => {
      uni.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: false,
        interval: 0,
        success(res) {
          resolve(res);
        },
        fail(err) {
          reject(err)
        }
      })
    })
  }

  /**
   * 获取已找到设备
   * @returns 
   */
  protected getSearchDevBluetooth() {
    let that = this;
    return new Promise((resolve, reject) => {
      uni.getBluetoothDevices({
        success(res) {
          that.log('已找到设备', res.devices);

          if(res.devices.length === 0) {
            return that.searchBluetooth();
          }
          let item = that.onFindBluetooth(res);
          if(item) {
            that.deviceId = item.deviceId;
            that.connectBluetooth();
          } else {
            that.searchBluetooth();
          }
          
        }
      })
    })
  }

  /**
   * 停止蓝牙搜索
   */
  private searchStopBluetooth() {
    let that = this
    if(!that.status.find) return
    uni.stopBluetoothDevicesDiscovery({
      success(res) {
        that.log('触发停止搜索' ,res)
      },
      fail(err) {
        that.log('蓝牙搜索停止失败', err)
      }
    })
  }

  /**
   * 连接蓝牙
   * @returns
   */
  private connectBluetooth() {
    let that = this;
    uni.showLoading({
      title: '连接中...'
    })
    return new Promise((resolve, reject) => {
      uni.createBLEConnection({
        deviceId: that.deviceId,
        success(res) {
          uni.hideLoading();
          that.log('连接成功')
        },
        fail(err) {
          uni.hideLoading();
          that.mistake++;
          if(that.mistake < 5) {
            that.log('重新连接' + that.mistake);
            return that.connectBluetooth()
          } else {
            that.log('连接失败')
          }
        }
      })  
    })
  }


  /**
   * 蓝牙重连
   * @returns 
   */
  protected reConnectBluetooth() {
    this.log('重连')
    this.getSearchDevBluetooth();
  }

  /**
   * 获取蓝牙服务命令列表
   */
  protected async getCommandBluetooth() {
    let that = this;
    if(that.commandBluetooth.length === 0) {
      await that.getServicesBluetooth();
    }
    return that.commandBluetooth;
  }

  /**
   * 获取蓝牙设备所有服务
   */
  private getServicesBluetooth() {
    let that = this;
    return new Promise((resolve, reject) => {
      uni.getBLEDeviceServices({
        deviceId: that.deviceId,
        async success(res) {
          that.log('蓝牙服务', res)
          let list = [];
          for(let item of res.services) {
            list.push({
              service: item.uuid,
              character: await that.getCharacterBluetooth(item.uuid)
            })
          }
          that.log('蓝牙设备服务协议表', list);
          that.commandBluetooth = list;
          resolve(list);
        },
        fail(err) {
          that.log('获取蓝牙服务失败', err);
          reject(err);
        }
      })  
    })
  }

  /**
   * 获取服务的特征值
   * @param services 
   * @returns 
   */
  private getCharacterBluetooth(services:string) {
    let that = this;
    return new Promise((resolve, reject) => {
      uni.getBLEDeviceCharacteristics({
        deviceId: that.deviceId,
        serviceId: services,
        success(res) {
          resolve(res.characteristics);
        },
        fail(err) {
          that.log('获取特征值失败', err)
          resolve([]);
        }
      })
    })
  }

  /**
   * 写入蓝牙设备数据
   * @param value 
   * @returns 
   */
  protected async writeBluetooth(value:string, serviceId:string, character:string) {
    let that = this;
    //#ifdef MP-ALIPAY
    // await this.getCharacterBluetooth(serviceId);
    //#endif
    return new Promise((resolve, reject) => {
      uni.writeBLECharacteristicValue({
        deviceId: that.deviceId,
        serviceId: serviceId,
        characteristicId: character,
        value: that.Hex2AB(value),
        success(res) {
          that.log('数据写入成功', value)
          resolve(res)
        },
        fail(err) {
          that.modal('蓝牙异常');
          that.log('数据写入失败', err)
        }
      })
    })
  }

  /**
   * 订阅蓝牙设备信息
   * @param service 
   * @param character 
   * @returns 
   */
  protected notifyBluetooth(service:string, character:string) {
    let that = this;
    return new Promise((resolve, reject) => {
      uni.notifyBLECharacteristicValueChange({
        deviceId: that.deviceId,
        serviceId: service,
        characteristicId: character,
        state: true,
        success(res) {
          that.log('订阅成功', res);
          resolve(res)
        },
        fail(err) {
          that.modal('蓝牙异常');
          that.log('订阅失败', err);
        }
      })
    })
  }

  /**
   * 读取蓝牙设备信息
   * @param service 
   * @param character 
   * @returns 
   */
  protected readBluetooth(service:string, character:string) {
    let that = this;
    return new Promise((resolve, reject) => {
      uni.readBLECharacteristicValue({
        deviceId: that.deviceId,
        serviceId: service,
        characteristicId: character,
        success(res) {
          that.log('读取成功', res);
          resolve(res)
        },
        fail(err) {
          that.modal('蓝牙异常');
          that.log('读取失败', err);
        }
      })
    }) 
  }

  /**
   * 蓝牙返回信息
   * @param fn 回调函数
   */
  protected returnBluetooth(fn:Function) {
    let that = this;
    uni.onBLECharacteristicValueChange((res) => {
      fn(res);
      that.log('蓝牙设备返回信息', res);
    })
  }

  /**
   * 设置并返回 蓝牙设备状态值  
   * @param type    状态名称
   * @param value   状态值得
   */
  private returnStatus(type:string, value:boolean) {
    //@ts-ignore
    if(this.status[type] === value) return
    //@ts-ignore
    this.status[type] = value;
    //@ts-ignore
    this.log('蓝牙设备状态', type, this.status[type]);
    this.onStatusBluetooth(this.status);
    switch(type) {
      case 'connect':
        this.onConnectBluetooth(value);
        break;
      case 'init':
        this.onSwithcBluetooth(value);
        break;
    }

    if(type==='init' && !value) this.modal('蓝牙关闭');
    if(type==='find') {
      if(value) {
        uni.showLoading({
          title: '搜索设备中...',
          mask: false
        })
      } else {
        uni.hideLoading();
      }
    }
    // if(type==='connect' && !value) this.modal('蓝牙断开');
  }

  /**
   * 关闭蓝牙
   * @returns 
   */
  protected closeBluetooth() {
    let that = this;
    if(!that.status.launch || !that.status.connect) {
      that.log('蓝牙未连接');
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      uni.closeBLEConnection({
        deviceId: that.deviceId,
        success(res) {
          that.log('关闭蓝牙成功', res);
          resolve(res);
        },
        fail(err) {
          that.log('关闭蓝牙失败', err);
        }
      })
    })
  }

  /**
   * 信息调试打印
   * @param args 
   */
  private log(...args:any[]) {
    if(this.debug) {
      console.log('base', ...args);
    }
  }

  /**
   * 提示框
   * @param text 
   */
  private modal(text:string) {
    uni.showModal({
      title: '提示',
      content: text,
      showCancel: false
    })
  }

  /**
  * 16进制 to ArrayBuffer
  * @data {Hex}
  */
  protected Hex2AB(data:string):any {
    let arr = data.match(/[\da-f]{2}/gi);
    if(arr === null) return;
    return new Uint8Array(
      arr.map(
        (bit) => {return parseInt(bit, 16)})
    ).buffer
  }

  /**
   * ArrayBuffer to 16进制
   * @data {ArrayBuffer}
   */
    protected AB2Hex(data:ArrayBuffer) {
    if(typeof(data) === 'string') {
      return data;
    }
    return Array.prototype.map.call(new Uint8Array(data), (x) => ('00' + x.toString(16)).slice(-2)).join('');
  }

  /**
   * 16进制 to 10进制
   * @hex {Hex}
   */
  protected Hex2Int(hex:string) {
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
}




