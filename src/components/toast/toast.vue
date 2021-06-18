<template>
  <view class="toast-mask" v-if="show" @click="maskClick">
    <view class="toast-wrap" @click.stop="()=>{}">
      <view class="toast-header">
        <image src="/static/images/logo-black.png" mode="heightFix"></image>
      </view>
      <view class="toast-content">请选打开蓝牙设备</view>
      <view class="toast-footer" @click.stop="confirm">确认</view>
    </view>  
  </view>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component
export default class extends Vue {
  @Prop({ default:false }) show!:boolean;

  // 确认时回调
  @Emit()
  confirm() {
    return
  }

  // 点击遮罩回调
  @Emit()
  public maskClick() {
    return;
  }
}
</script>

<style lang="scss" scoped>
/* components/toast/index.wxss */
.toast-mask{
  background-color: rgba(0, 0, 0, .5);
  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: 9999;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.toast-wrap{
  width: 85%;
  background-color: #fff;
  border-radius: 25rpx;
  text-align: center;
  padding: 80rpx 65rpx;
  box-sizing: border-box;
}
.toast-header{
  width: 343rpx;
  height: 90rpx;
  display: inline-block;
}
.toast-header image{
  background-size: auto 100%;
  background-position: center;
}
.toast-content{
  font-size: 32rpx;
  margin: 40rpx 0 100rpx;
}
.toast-footer{
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  color: #fafafa;
  background-color: #e64240;
  border-radius: 10rpx;
}
</style>