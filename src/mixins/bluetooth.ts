import { Component, Vue } from 'vue-property-decorator';
import { CommonModule } from '@/store/modules/common';
import { getDevcode } from '@/api/user';

@Component
export default class Bluetooth extends Vue {

  async btHandler() {
    uni.showLoading({
      title:'蓝牙初始化'
    })
    CommonModule.bt.init().then(res => {
      uni.hideLoading();
      CommonModule.bt.search();
    }).catch(err => {
      uni.hideLoading();
      uni.showToast({
        title: "请打开蓝牙",
        icon: 'none',
        mask: true
      })
    })
  }

  /**
   * 蓝牙模块启动
   * @param options 
   */
  async onBluetooth(options:any) {
    if(options) CommonModule.REMOVE_BT();
    options.q = 'https://zuoan.dakemakeji.com/machine/entrance/index/id/211';

    // 微信扫码
    // #ifdef MP-WEIXIN
    if(options.q) {
      let param = options.q;
      param = decodeURIComponent(param)
      let arr = param.split('/');
      let id = arr[arr.length-1]
      let { data } = await getDevcode({id})
      options.localName = data;
    } 
    // #endif
    

    console.log(options, 'bluetooth-onLoad')
    // let machineCode = 'LD0517811899';
    // let machineCode = 'LJL0003431568';
    let machineCode = ''

    if(options.localName) {
      machineCode = options.localName
      CommonModule.SET_MACHINE_CODE(machineCode);  
    } else {
      this.$dkm.modal('无效设备号');
    }

    CommonModule.SET_BT(machineCode);
    CommonModule.bt.getStatus((res:any) => {
      if(!res.launch && res.init) {
        this.btHandler();
      } else if (res.launch && res.init) {
        CommonModule.bt.reconnect();
      }
    })
    if(machineCode) this.btHandler();
    return Promise.resolve();
  }

}