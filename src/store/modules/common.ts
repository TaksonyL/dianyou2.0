import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators';
import { BluetoothModal } from '@/bluetooth/index';
import store from '@/store';

export interface CommonStore{

}

@Module({ namespaced: true, name: 'common', dynamic: true, store })
class Common extends VuexModule implements CommonStore {
  //@ts-ignore
  public bt:BluetoothModal = null                 // 蓝牙模块
  public url:string = 'https://zuoan.dakemakeji.com'     // 服务器域名
  public session:string|null = uni.getStorageSync('SESSION')               // 登录凭证
  public machineCode:string = ''                  // 设备编号
  public machineId:string = ''                    // 设备ID
  public navHeight:number = 0                     // 导航栏高度
  public userInfo:Object|null = null              // 用户信息
  public userType:0|1 = 0                         // 用户类型 0-用户 1-补货员
  public adult:0|1|2 = 2                          // 成人验证 0-未通过 1-通过 2-未检查
  public order:{code:string, price:string, id:number} = {                   // 请求订单
    price: '',                                    // 总价
    code: '',                                     // 订单号
    id: 0,                                        // 订单ID
  }
  public payTime:boolean = false                  // 支付时间
  public payTimer:any = null                      // 支付定时器
  
  public goodsUpdate:boolean = false              // 首页商品是否需要更新
  public tabbarList:any[] = [                     // 底部导航栏
    {
      pagePath: "/pages/index/index",
      iconPath: "/static/images/home.png",
      selectedIconPath: "/static/images/home_active.png",
      text: "首页",
      customIcon: false,
    },
    {
      pagePath: "/pages/setting/index",
      iconPath: "/static/images/setting.png",
      selectedIconPath: "/static/images/setting_active.png",
      text: "设置",
      customIcon: false,
    },
    {
      pagePath: "/pages/order/index",
      iconPath: "/static/images/order.png",
      selectedIconPath: "/static/images/order_active.png",
      text: "订单",
      customIcon: false,
    }
  ]

  @Mutation
  public SET_SESSION(data:string) {
    uni.setStorageSync('SESSION', data);
    this.session = data
  }

  @Mutation
  public SET_BT(data:string) {
    this.bt = new BluetoothModal(data);
    console.log(this.bt)
  }
  
  @Mutation
  public REMOVE_BT() {
    //@ts-ignore
    this.bt = null;
  }

  @Mutation
  public SET_NAVHEIGHT(data:number) {
    this.navHeight = data
  }

  @Mutation
  public SET_USERINFO(data:any) {
    uni.setStorageSync('USERINFO', data);
    this.userInfo = data;
  }

  @Mutation
  public SET_MACHINE_CODE(data:string) {
    this.machineCode = data;
  }

  @Mutation
  public SET_MACHINE_ID(data:string) {
    this.machineId = data;
  }

  @Mutation
  public SET_ORDER(data:{price?:string, code?:string, id?:number}) {
    if(data.price) this.order.price = data.price;
    if(data.code) this.order.code = data.code;
    if(data.id) this.order.id = data.id;
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
  public SET_ADULT(data:0|1|2) {
    this.adult = data;
  }

  @Mutation
  public SET_GOODS_UPDATE(data:boolean) {
    this.goodsUpdate = data;
  }

  @Mutation
  public SET_USERTYPE(data:0|1) {
    if(data === 0) {
      this.tabbarList = [
        {
          pagePath: "/pages/index/index",
          iconPath: "/static/images/home.png",
          selectedIconPath: "/static/images/home_active.png",
          text: "首页",
          customIcon: false,
        },
        {
          pagePath: "/pages/order/index",
          iconPath: "/static/images/order.png",
          selectedIconPath: "/static/images/order_active.png",
          text: "订单",
          customIcon: false,
        }
      ]
    } else if (data === 1) {
      this.tabbarList = [
        {
          pagePath: "/pages/index/index",
          iconPath: "/static/images/home.png",
          selectedIconPath: "/static/images/home_active.png",
          text: "首页",
          customIcon: false,
        },
        {
          pagePath: "/pages/setting/index",
          iconPath: "/static/images/setting.png",
          selectedIconPath: "/static/images/setting_active.png",
          text: "设置",
          customIcon: false,
        },
        {
          pagePath: "/pages/order/index",
          iconPath: "/static/images/order.png",
          selectedIconPath: "/static/images/order_active.png",
          text: "订单",
          customIcon: false,
        }
      ]
    }
    this.userType = data;
  }
}

export const CommonModule = getModule(Common);