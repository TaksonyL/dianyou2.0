import Vue from 'vue'
import App from './App.vue'
import uView from 'uview-ui'

Vue.config.productionTip = false
Vue.use(uView);

/**
 * 文字提示
 * @param msg   提示语
 * @param status  是否显示成功图标
 * @param back    是否返回
 */
const tips = (msg:string, status:boolean = false, back:boolean = false) => {
  uni.showToast({
    title: msg,
    icon: status?'success':'none',
    mask: true,
    duration: 1200,
    complete() {
      if(back) {
        uni.navigateBack({})
      }
    }
  })
}

/**
 * 对话框提醒
 * @param msg   提示语 
 * @param title   标题
 */
const modal = (msg:string = '提示语句', title:string = '提示') => {
  uni.showModal({
    title: title,
    content: msg,
    showCancel: false,
    confirmColor: '#d7000f'
  })
}

Vue.prototype.$dkm = { tips, modal }

new App().$mount()
