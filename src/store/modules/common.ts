import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators';
import store from '@/store';

export interface CommonStore{

}

@Module({ namespaced: true, name: 'common', dynamic: true, store })
class Common extends VuexModule implements CommonStore {
  public session:string|null = null       // 请求凭借
  public navHeight:number = 0             // 导航栏高度
  public imgUrl:string = 'https://cd.cdwkwh.com'    // 图片地址前缀
  public machineId:string = '0'             // 设备ID
  public adult:0|1|2 = 2                  // 成人验证 0-未通过 1-通过 2-未检查
  public orderId:string = ''              // 订单ID
  public orderCode:string = ''            // 结算订单编号
  public orderPrice:string = ''           // 结算订单金额
  public userType:0|1 = 0                 // 用户类型 0-用户  1-补货员
  public payTime:boolean = false                // 支付时间
  public payTimer:any = null                    // 支付定循计时器
  public connect:boolean = false                // 连接状态
  public unLoad:boolean = false                 // 小程序是否在后台
  public findBT:boolean = false                 // 是否已搜索蓝牙设备 

  @Mutation
  public SET_SESSION(data:string) {
    this.session = data
  }

  @Mutation
  public SET_NAVHEIGHT(data:number) {
    this.navHeight = data
  }

  @Mutation
  public SET_ORDER(data:{price:string, code:string, orderId:string}) {
    this.orderCode = data.code;
    this.orderPrice = data.price;
    this.orderId = data.orderId;
  }

  @Mutation
  public SET_ADULT(data:0|1|2) {
    this.adult = data;
  }

  @Mutation
  public SET_INFO(data:{machineId:string, userType:0|1}) {
    this.machineId = data.machineId;
    this.userType = data.userType;
  }

  @Mutation
  public SET_PAYTIME(data:boolean)  {
    this.payTime = data;
  }

  @Mutation
  public SET_PAYTIMER(data:any) {
    if(data === 'clear') {
      // 清除支付监听定时器 & loading toast
      wx.hideLoading();
      clearInterval(this.payTimer)
      this.payTimer = null
    } else {
      this.payTimer = data;
    }
  }

  @Mutation
  public SET_CONNECT(data:boolean) {
    this.connect = data;
  }

  @Mutation
  public SET_UNLOAD(data:boolean) {
    this.unLoad = data;
  }

  @Mutation
  public SET_FINDBT(data:boolean) {
    this.findBT = data
  }
}



export const CommonModule = getModule(Common);