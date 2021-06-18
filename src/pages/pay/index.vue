<template>
  <view> 
    <web-view v-if="url" :src="url">

    </web-view>
  </view> 
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { listenPay } from '@/api/user';
import { writeData } from '@/api/bluetooth';
import { reconnectBT } from '@/utils/bluetooth';

@Component({})
export default class extends Vue{
  private timer:any = null
  private hex:string = ''
  private url:string = ''

  /**
   * 监听订单状态
   */
  listenPay() {
    if(this.timer > 0) {
      clearInterval(this.timer)
    }
    let that = this
    this.timer = null;
    this.timer = setInterval(() => {
      listenPay({}).then((res:any) => {
        if(res.code === 205) {
          clearInterval(that.timer);
          that.timer = 0;
          that.hex = res.data.hex;
          writeData(res.data.hex[0])
        }
      }).catch(err => {
        console.log(err)
      })
    }, 2000)
  }


  // 蓝牙回调
  onBluetooth(e:any) {
    if(e.type === 'feedback') {
      if(e.value.cmd === "d2") {
        uni.redirectTo({
          url: '/pages/pay_status/index',
        })
      }
    }
  }


  onLoad(options:any) {
    this.url = options.url
    this.listenPay();
  }

  onShow() {
    reconnectBT();
  }

  onUnload() {
    clearInterval(this.timer);
    this.timer = null
    console.log(this.timer, '清除定时器')
  }
}
</script>


<style lang="scss">

</style>