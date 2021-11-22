import { BluetoothModal as bt, onReturnFunction } from './zuoan';

/**
 * 主要向外部暴露API
 */
export class BluetoothModal extends bt {

  /**
   * 构造函数
   * @param searchName  设备编号 
   */
  constructor(searchName:string) {
    super(searchName);
  }

  /**
   * 初始化蓝牙
   * @returns 
   */
  public init() {
    return super.initBluetooth();
  }

  /**
   * 开始寻找蓝牙
   * @returns 
   */
  public search() {
    return super.searchBluetooth();
  }

  /**
   * 获取蓝牙全部服务和特征
   * @returns 
   */
  public getAllCommand() {
    return super.getCommandBluetooth();
  }

  /**
   * 监听状态返回
   * @param fn 
   */
  public getStatus(fn:Function) {
    fn(this.status);
    this.onStatusBluetooth = fn;
  }

  /**
   * 监听连接回调
   * @param fn 
   */
  public getConnect(fn:Function) {
    this.onConnectBluetooth = (res:boolean) => {
      if(res) {
        // 连接成功
        fn();
      }
    };
  }

  /**
   * 连接后操作
   * @param authHex 验证指令
   */
  public async connectHandler(data:any) {
    await this.notifyAll();
    super.onConnectAfter(data);
  }

  /**
   * 购买出货指令
   * @param value 
   * @returns 
   */
  public writeBuy(value:string) {
    return super.writeData(value, 'channel');
  }

  /**
   * 测试出货指令
   * @param value 
   * @returns 
   */
  public writeTest(value:string) {
    return super.writeData(value, 'test');
  }

  /**
   * 补货开门指令
   * @param value 
   * @returns 
   */
  public writeRep(value:string) {
    return super.writeData(value, 'rep');
  }

  /**
   * 写入当前时间
   * @param value 
   * @returns 
   */
  public writeTime(value:string = '') {
    return super.writeData(value, 'time');
  }

  /**
   * 校验指令
   * @param value 
   * @returns 
   */
  public writeAuth() {
    return super.writeData('', 'auth');
  }

  /**
   * 写入其他指令（主要用于设备其他功能控制）
   * @param value 
   * @param type 
   * @returns 
   */
  public writeCommon(value:string, type:string) {
    return super.writeData(value, type);
  }

  /**
   * 订阅指令
   * @returns 
   */
  public notifyAll() {
    return super.notifyData();
  }

  /**
   * 监听信息返回
   * @param fn 
   */
  public onReturn(fn:onReturnFunction) {
    this.onReturnHandler = fn
  }

  /**
   * 设备离线
   * @returns 
   */
  public close() {
    return super.closeBluetooth();
  }

  /**
   * 重连
   * @returns 
   */
  public reconnect() {
    return super.reConnectBluetooth();
  }


  /**
   * 蓝牙购买前检测
   * @returns 
   */
   public payCheck():{status:boolean, msg:string} {
    if(!this.status.connect) return {status: false, msg: '蓝牙连接断开'};
    if(this.battery < 10) return {status: false, msg: '电量不足'};
    return {status: true, msg: '蓝牙正常'};
  }
  
}