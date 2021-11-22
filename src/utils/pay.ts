import { goPay, pay, listenPay } from '../api/user';
import { CommonModule } from "@/store/modules/common";
import { getProvider } from '@/utils/util';

let loading = false;      // 支付请求等待

/**
 * 支付聚合请求
 * @param data 
 * @param price 价格
 */
export default function buy(data:any, price:string = '0') {
  let statusBt = CommonModule.bt.payCheck();
  if(!statusBt.status) return modal(statusBt.msg)
  if(loading) return;
  loading = true;
  uni.setStorageSync('PRICE', price)
  goPay(data).then(res => {
    CommonModule.SET_ORDER({
      price,
      code: res.data.order_trade_no,
      id: res.data.order_id
    })
    pay({id: res.data.order_id}).then(async (res) => {
      loading = false;
      let { provider } = await getProvider('payment');
      let json = JSON.parse(res.data.json);
      let options = {}
      switch(provider[0]) {
        case 'wxpay':
          options = {
            timeStamp: json.timeStamp,
            nonceStr: json.nonceStr,
            package: json.package,
            signType: json.signType,
            paySign: json.paySign
          }
          break;
        case 'alipay':
          options = {
            orderInfo: json.data.trade_no
          }
        break;
      }
      settle(options, provider[0]);
    }).catch(err => {
      loading = false;
    })
  })
}

/**
 * 发起支付
 * @param json
 * @param provider
 */
async function settle(json:object, provider:string) {
  orderCheck();
  let option = {
    provider,
    success(res:any) {
      console.log(res, '支付回调')
      if(res.resultCode === "6001") {
        CommonModule.SET_PAYTIMER('clear');
        uni.hideLoading();
        uni.showToast({
          title: '放弃支付',
          icon: 'none'
        })
        return
      }
      console.log(res, '支付成功')
      uni.redirectTo({
        url: '/pages/pay_status/index',
        success(res) {
          console.log(res, '跳转成功')
        },
        fail(err) {
          console.log(err, '跳转失败')
          CommonModule.SET_PAYTIME(false);
          CommonModule.SET_PAYTIMER('clear');
        } 
      })
    },
    fail(err:any) {
      CommonModule.SET_PAYTIMER('clear');
      CommonModule.SET_PAYTIME(false);
      uni.showToast({
        title: err,
        icon: 'none'
      })
      console.log(err, '支付失败')
    }
  }
  let options = {...json, ...option}
  //@ts-ignore
  uni.requestPayment(options);
}

/**
 * 定时查询订单
 */
function orderCheck() {
  if(CommonModule.payTimer > 0) {
    CommonModule.SET_PAYTIMER('clear');
  }
  CommonModule.SET_PAYTIME(true);
  CommonModule.SET_PAYTIMER(setInterval(()=>{
    uni.showLoading({
      title: '等待出货'
    })
    listenPay({}).then(async (res:any) => {
      if(res.code === 205) {
        uni.hideLoading();
        uni.showToast({
          title: '出货成功',
          icon: 'success'
        })
        CommonModule.SET_GOODS_UPDATE(true);      // 需要更新商品
        CommonModule.SET_PAYTIMER('clear');
        CommonModule.SET_PAYTIME(false);
        await CommonModule.bt.writeBuy(res.data.hex[0]);
      }
    }).catch(err => {
      uni.hideLoading();
    })
  }, 2000))
}


/**
 * 对话框提醒
 * @param msg 
 * @param title 
 */
 function modal (msg:string = '提示语句', title:string = '提示') {
  uni.showModal({
    title: title,
    content: msg,
    showCancel: false,
    confirmColor: '#d7000f'
  })
}