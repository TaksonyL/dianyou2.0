import { goPay, pay, listenPay } from '../api/user';
import { writeData } from '../api/bluetooth';
import { CommonModule } from '@/store/modules/common';
import { getProvider } from '@/utils/util';
import { BluetoothModule } from '@/store/modules/bluetooth';

let loading = false
export default function buy(data:any, price:string = '0') {
  if(!CommonModule.connect) {
    uni.showModal({
      title: '提示',
      content: '蓝牙异常，请重连',
      showCancel: false,
    })
    return
  }
  if(loading) return;
  loading = true
  uni.setStorageSync('PRICE', price)
  goPay(data).then(res => {
    CommonModule.SET_ORDER({
      price,
      code: res.data.order_trade_no,
      orderId: res.data.order_id
    })
    BluetoothModule.SET_RETURNTYPE(1);
    pay({id: res.data.order_id}).then(async (res) => {
      loading = false
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
    }).catch(err =>{
      loading = false
    })
  }).catch(err => {
    console.log(err)
    loading = false
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
          CommonModule.SET_PAYTIMER('clear');
        } 
      })
    },
    fail(err:any) {
      CommonModule.SET_PAYTIMER('clear');
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
    wx.showLoading({
      title: '等待出货'
    })
    listenPay({}).then(async (res:any) => {
      if(res.code === 205) {
        wx.hideLoading();
        wx.showToast({
          title: '出货成功',
          icon: 'success'
        })
        CommonModule.SET_PAYTIMER('clear');
        await writeData(res.data.hex[0]);
      }
    }).catch(err => {
      wx.hideLoading();
    })
  }, 2000))
}