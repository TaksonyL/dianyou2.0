import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators';
import store from '@/store';

export interface BluetoothStore{

}

@Module({ namespaced: true, name: 'bluetooth', dynamic: true, store })
class Bluetooth extends VuexModule implements BluetoothStore {
  public deviceId:string = ''                   // 设备ID
  public deviceCode:string = ''                 // 设备编号
  public deviceInfo:string = ''                 // 设备广播值
  public init:boolean = false                   // 蓝牙初始化
  public launch:boolean = false                 // 蓝牙实例
  public localName:string|null = null           // 设备编号
  public battery:number|string = 0              // 设备电量 
  public auth:string = ''                       // 验证指令
  public returnType:1|2|3= 1                   // 设备返回类型值 1-购买 2-测试 3-补货
  public lightSwitch:{open:string, close:string} = {open: '',close: ''}   // 开关灯指令

  @Mutation
  public SET_BLUETOOTH(data:any) {
    if(data.deviceId) this.deviceId = data.deviceId
    if(data.deviceCode) {
      this.deviceCode = data.deviceCode
      this.localName = data.deviceCode.slice(-8)
    }
    if(data.deviceInfo) this.deviceInfo = data.deviceInfo
    if(data.init) this.init = data.init
    if(data.launch) this.launch = data.launch
    if(data.localName) this.localName = data.localName
    if(data.battery) this.battery = data.battery
    if(data.auth) this.auth = data.auth
    if(data.lightSwitch) this.lightSwitch = data.lightSwitch
  }

  @Mutation
  public SET_LAUNCH(data:boolean) {
    this.launch = data
  }

  @Mutation
  public SET_RETURNTYPE(data:1|2|3) {
    this.returnType = data;
  }
}



export const BluetoothModule = getModule(Bluetooth);