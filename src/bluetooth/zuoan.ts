import Bluetooth from './base';
import { returnHex } from '@/api/user';
import { repReturn } from '@/api/setting';
import { CommonModule } from '@/store/modules/common';

interface bluetoothDeviceType {
  id: string,
  localName: string,
  name: string,
  advertisData: string
}

export interface onReturnFunction {
  (data:{type:string, data:any}):void
}

export interface zuoanType {
  repChannel:string
}

/**
 * 协议中间层
 */
export class BluetoothModal extends Bluetooth {
  public device:bluetoothDeviceType = {
    id: '',                 // deviceId
    localName: '',           
    name: '',               
    advertisData: '',      // 广播信息
  }

  // 左岸特有参数
  public zuoan = {
    repChannel: ''
  }

  protected onReturnHandler:onReturnFunction = (data) => {};      // 设备信息返回

  private cmd = {
    auth: '',           // 验证指令
    setNowTime: '',     // 设置当前时间
    lightOpen: '',      // 打开灯光
    lightClose: '',     // 关闭灯光
  }

  private command = {
    common: {
      service: '0000FCF0-0000-1000-8000-00805F9B34FB',
      character: {
        common: '0000FCF2-0000-1000-8000-00805F9B34FB',     // 通用服务 w
        return: '0000FCF1-0000-1000-8000-00805F9B34FB',     // 通用监听 n,r
      }
    }
  }

  private batteryTimer:any = null     // 电量检测定时器

  private returnType:1|2|3 = 1    // 设备返回数据处理 1-购买 2-测试 3-补货

  constructor(searchName:string) {
    super();
    let that = this;
    // 搜索设备规则
    super.findBluetooth((devicesList:any) => {
      for(let item of devicesList.devices) {
        // if(item.name === 'LJL0003431567') {
        if(item.localName === searchName) {
          console.log('找到设备', item)
          that.device = {
            id: item.deviceId,
            localName: item.localName,
            name: item.name,
            advertisData: that.AB2Hex(item.advertisData)
          }
          return item;
        }
      }
      return null;
    })

    // 返回信息处理
    super.returnBluetooth((res:any) => {
      let that = this;
      let hex = this.AB2Hex(res.value);
      console.log('蓝牙返回信息', res, hex)
      if(hex.length <= 2) {
        if(this.returnType === 1) {
          returnHex({
            code: CommonModule.machineCode,
            hex,
            machine_id: CommonModule.machineId,
            order_id: CommonModule.order.id + '',
            type: this.returnType
          }).then(res => {
            let data = {
              cmd: 'd2',
              hex
            }
            that.onReturnHandler({type:'feedback', data:data});
          }).catch(err=> { console.log(err) })  
        } else if (this.returnType === 3) {
          let status:0|1 = Number(hex)>0?1:0;
          repReturn({
            status,
            channel: this.zuoan.repChannel
          }).then(res => {
            let data = {
              cmd: 'd2',
              hex
            }
            that.onReturnHandler({type:'feedback', data:data});
          }).catch(err => { console.log(err) })
        }
      }
    })
  }

  /**
   * 连接后操作
   * @param data 
   */
  protected async onConnectAfter(data:any) {
    // to do something after connection...
    let that = this;
    if(this.batteryTimer) clearInterval(this.batteryTimer);
    this.readData();
    this.batteryTimer = setInterval(() => {
      that.readData();
    }, 10000)
  }
  
  /**
   * 写入操作指令
   * @param value 写入数据
   * @param type  命令标识
   * @returns 
   */
  protected writeData(value:string, type:string) {
    switch(type) {
      case 'channel':
        this.returnType = 1;
        return super.writeBluetooth(value, this.command.common.service, this.command.common.character.common);
      case 'test':
        this.returnType = 2;
        return super.writeBluetooth(value, this.command.common.service, this.command.common.character.common);
      case 'rep':
        this.returnType = 3;
        return super.writeBluetooth(value, this.command.common.service, this.command.common.character.common);
      case 'auth':
        return super.writeBluetooth(this.cmd.auth, this.command.common.service, this.command.common.character.common);
      case 'time':
        if(!value) value = this.cmd.setNowTime;
        return super.writeBluetooth(value, this.command.common.service, this.command.common.character.common);
      case 'lightOpen':
        if(!value) value = this.cmd.setNowTime;
        return super.writeBluetooth(value, this.command.common.service, this.command.common.character.common);
      case 'lightClose':
        if(!value) value = this.cmd.setNowTime;
        return super.writeBluetooth(value, this.command.common.service, this.command.common.character.common);
      case 'lightTimer':
        return super.writeBluetooth(value, this.command.common.service, this.command.common.character.common);
    }
    
    uni.showToast({
      title: "协议不存在",
      icon: 'none',
    })
    return
  }

  /**
   * 订阅指令
   * @param value 
   * @param type 
   * @returns 
   */
  protected async notifyData() {
    await super.notifyBluetooth(this.command.common.service, this.command.common.character.return);   // 常规指令订阅
    return Promise.resolve();
  }

  /**
   * 读取指令
   * @param value 
   * @param type 
   * @returns 
   */
  protected readData(value:string='', type:string='') {
    if(!this.status.connect) return Promise.resolve();
    return super.readBluetooth(this.command.common.service, this.command.common.character.return);    // 读取电量信息
  }


  /**
   * 存储特有指令
   * @param data 
   */
  private setCmd(data:any) {
    this.cmd.auth = data.auth || '';
    this.cmd.setNowTime = data.setNowTime || '';
    if(data.toggleLight) {
      this.cmd.lightOpen = data.toggleLight.open || '';
      this.cmd.lightClose = data.toggleLight.close || '';  
    }
  }

}