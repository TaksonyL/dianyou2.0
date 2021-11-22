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
    <button class="confirm" open-type="getAuthorize" @getAuthorize="onGetAuthorize" scope='userInfo' @error="onAuthError">知道了</button>
    <!-- <button class="confirm" @click="onGetAuthorize">知道了</button> -->
    <!-- #endif -->
    </view>
  </view>
</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from "vue-property-decorator";
  import { CommonModule } from '@/store/modules/common';

  @Component
	export default class extends Vue{
    public show:boolean = false;
    private loading:boolean = false;

    // 获取用户信息 - weixin
    getUserInfo() {
      if(this.loading) return;
      this.loading = true;
      let that = this;
      uni.getUserProfile({
        lang: 'zh_CN',
        desc: '用于完善会员信息',
        success(res) {
          console.log(res, '成功');
          that.userLogin(res.userInfo)
        },
        fail(err) {
          that.$dkm.tips('授权失败');
          console.log(err, '失败');
        },
        complete() {
          that.loading = false;
        }
      })
    }

    // 获取用户信息 - alipay
    onGetAuthorize(e:any) {
      this.getUserInfo();
    }

    // 用户登录
    @Emit('login')
    async userLogin(userInfo:any) {
      CommonModule.SET_USERINFO(userInfo);
      this.show = false;
      return { userInfo }
    }

    created() {
      let userInfo = uni.getStorageSync('USERINFO');
      if(userInfo) {
        this.userLogin(userInfo);
      } else {
        this.show = true;
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
