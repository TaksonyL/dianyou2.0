<template>
<view class="authMask" v-if="show">
  <view class="authWrap">
    <view class="header">提示</view>
    <view class="content">
      <view>为了更好地提供服务</view>
      <view>稍后需要您的授权</view>
      <view>请在提示框中点击“允许”</view>
    </view>
    <view class="footer">
    <!-- #ifdef MP-WEIXIN -->  
    <button class="confirm" @click="getUserInfo">知道了</button>
    <!-- #endif -->

    <!-- #ifdef MP-ALIPAY -->  
    <!-- <button class="confirm" open-type="getAuthorize" @getAuthorize="onGetAuthorize" scope='userInfo' @error="onAuthError">知道了</button> -->
    <button class="confirm" @click="onGetAuthorize">知道了</button>
    <!-- #endif -->
    </view>
  </view>
</view>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import { login } from '@/utils/util';
import { getInfo } from '@/api/user';
import { BluetoothModule } from '@/store/modules/bluetooth';

@Component
export default class extends Vue {
  private show:boolean = false;
  private loading:boolean = false;

  getUserInfo() {
    if(this.loading) return
    this.loading = true
    let that = this
    uni.getUserProfile({
      lang: 'zh_CN',
      desc: '用于完善会员信息',
      success:(res) => {
        that.loading = false
        uni.setStorage({
          key: 'USER_INFO',
          data: res.userInfo
        });  // 存入用户信息用作登录缓存
        that.getInfo(res.userInfo);
      },
      fail(err) {
        that.loading = false
        uni.showToast({
          title: '授权失败',
          icon: 'none'
        })
      }
    })
  }

  onGetAuthorize(e:any) {
    if(this.loading) return
    this.loading = true
    this.getInfo({});
    this.loading = false
  }

  onAuthError(e:any) {
    uni.showToast({
      title: "授权失败",
      icon: 'none'
    })
  }


  @Emit()
  async getInfo(userInfo:any) {
    let that = this;
    let { code } = await login();
    let data = {
      code, 
      machineCode: BluetoothModule.deviceCode,
      mf_data: BluetoothModule.deviceInfo,
      // mf_data: '0201070702d307018b2ff302032002042702050203069d3404ff464452',
      userInfo
    }
    let info = await getInfo(data)

    //#ifdef MP-ALIPAY
    uni.setStorage({
      key: 'USER_INFO',
      data: info.data.user
    })
    //#endif

    that.show = false
    return info
  }

  created() {
    let userInfo = uni.getStorageSync('USER_INFO') || null;
    if(userInfo) {
      this.getInfo(userInfo);
    } else {
      this.show = true
    }
  }
}
</script>

<style lang="scss" scoped>
.authMask{
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, .5);
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.authWrap{
  width: 480rpx;
  text-align: center;
  background-color: #fff;
  border-radius: 20rpx;
  padding-bottom: 60rpx;
}

.header{
  color: #333;
  padding: 40rpx 0 20rpx;
}
.content{
  color: #777777;
}
.footer{
  padding-top: 40rpx;
  text-align: center;
}
.footer .confirm{
  display: inline-block;
  background-color: #c80008;
  border-radius: 30rpx;
  width: 300rpx;
  min-height: 60rpx;
  line-height: 60rpx;
  height: 60rpx;
  color: #fff;
  padding: 0;
  font-size: 30rpx;
  font-weight: normal;
}
</style>