import Bluetooth from './base';
import { returnHex, updateBattery } from '@/api/user';
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

  protected onReturnHandler:onReturnFunction = (data) => {};      // 设备信息返回

  private cmd = {
    auth: '',           // 验证指令
    setNowTime: '',     // 设置当前时间
    lightOpen: '',      // 打开灯光
    lightClose: '',     // 关闭灯光
  }

  private command = {
    common: {
      service: '0B49ABF0-C6FC-411D-8456-535AF817DAC8',
      character: {
        auth: '0B49ABF1-C6FC-411D-8456-535AF817DAC8',       // 校验服务 w,n
        common: '0B49ABF2-C6FC-411D-8456-535AF817DAC8',     // 通用服务 w
        return: '0B49ABF3-C6FC-411D-8456-535AF817DAC8',     // 回调服务 n
      }
    },
    battery: {
      service: '0000180F-0000-1000-8000-00805F9B34FB',
      character: {
        battery: '00002A19-0000-1000-8000-00805F9B34FB',    // 电池服务 r, n
      }
    }
  }

  private returnType:1|2|3 = 1    // 设备返回数据处理 1-购买 2-测试 3-补货

  constructor(searchName:string) {
    super();
    let that = this;
    // 搜索设备规则
    let code = searchName.slice(-8);
    that.onFindBluetooth = ((devicesList:any) => {
      for(let item of devicesList.devices) {
        // if(item.name === 'LJL0003431567') {
        if(item.localName === code) {
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
      if(!res.value || !res.characteristicId) return;
      let character = res.characteristicId.toUpperCase();
      let hex = this.AB2Hex(res.value);
      if(character === this.command.common.character.return) {
        // 通常指令
        returnHex({
          code: CommonModule.machineCode,
          hex,
          machine_id: CommonModule.machineId,
          order_id: CommonModule.order.id + '',
          type: this.returnType
        }).then(res => {
          console.log('指令返回', res)
          if(res.msg === '补货成功') {
            let data = {
              cmd: "d2",
              hex: res.data
            }
            that.onReturnHandler({type:'feedback', data:data});
            return
          }
          if(res.data.cmd === 'd2') {
            that.onReturnHandler({type:'feedback', data:res.data});
          }
        }).catch(err => {
          console.log(err, '指令解析出错')
        })
      } else if (character === this.command.battery.character.battery) {
        // 电池返回
        let battery = Number(this.Hex2Int(hex));
        if(this.battery === battery) return
        this.battery = battery;
        updateBattery({ battery }).catch(err => {
          console.log(err)
        });
        that.onReturnHandler({type: 'battery', data: battery});
        
        console.log('返回电池', battery)
      } else if (character === this.command.common.character.auth) {
        console.log('校验返回', hex);
      }
    })
  }

  /**
   * 连接后操作
   * @param data 
   */
  protected async onConnectAfter(data:any) {
    this.setCmd(data);
    await this.writeData('', 'auth');
    await this.writeData('', 'time');
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
        return super.writeBluetooth(this.cmd.auth, this.command.common.service, this.command.common.character.auth);
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
    await super.notifyBluetooth(this.command.common.service, this.command.common.character.auth);   // 校验回调订阅
    await super.notifyBluetooth(this.command.battery.service, this.command.battery.character.battery);   // 电池信息订阅
    await super.notifyBluetooth(this.command.common.service, this.command.common.character.return);   // 常规指令订阅
    return Promise.resolve();
  }

  /**
   * 读取指令
   * @param value 
   * @param type 
   * @returns 
   */
  protected readData(value:string, type:string) {
    
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