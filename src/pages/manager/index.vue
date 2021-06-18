<template>
<view class="wrap">
  <view class="loginWrap">

    <block v-if="!bind">
      <view class="imgWrap">
        <image src="/static/manager/logo.png" mode="aspectFit"></image>
      </view>
      <view class="textWrap">
        <view>请允许授权微信信息</view>
        <view>授权后自动绑定补货员</view>
      </view>
      <view class="btnWrap">
        <button class="btn" @click="getUserInfo">授权并绑定</button>
      </view>  
    </block>
    
    <block v-else-if="bind">
      <view class="statusWrap">
        <image src="/static/manager/success.png" mode="scaleToFill"></image>
      </view>
      <view class="statusText">
        <view>绑定成功</view>
      </view>
    </block>

  </view>

  <view class="backImg">
    <image src="/static/manager/loginBack2.jpg" mode="heightFix"></image>
  </view>
</view>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { login } from '@/utils/util';
import { userBind } from '@/api/setting';

@Component({})
export default class extends Vue{
  private bind:boolean = false
  private users_id:string = '0'

  /**
   * 获取用户信息
   */
  getUserInfo() {
    let that = this;
    uni.getUserProfile({
      lang: 'zh_CN',
      desc: '用于完善会员信息',
      success:async (res) => {
        uni.setStorage({
          key: 'USER_INFO',
          data: res.userInfo
        });  // 存入用户信息用作登录缓存
        let { code } = await login();
        let data = {
          code,
          users_id: that.users_id,
          userInfo: res.userInfo
        }
        userBind(data).then(result=>{
          that.bind = true
        })
      },
      fail(err) {
        console.log(err)
        uni.showToast({
          title: '授权失败',
          icon: 'none'
        })
      }
    })
  }

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options:any) {
    if(options.users_id > 0) {
      this.users_id = options.users_id
    } else {
      uni.showToast({
        title: '无效二维码',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss">
.wrap{
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #545454;
}
.wrap .backImg{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.wrap .backImg image{
  width: 100%;
  height: 100%;
}
.wrap .loginWrap{
  position: relative;
  padding: 80rpx 30rpx 100rpx;
  z-index: 99;
  background-color: #fff;
  width: 600rpx;
  border-radius: 20rpx;
  margin-top: -10vh;
  box-sizing: border-box;
  text-align: center;
}
.wrap .loginWrap .imgWrap{
  height: 100rpx;
  width: 100%;
  margin-bottom: 60rpx;
}
.wrap .loginWrap .imgWrap image{
  height: 100%;
  width: 100%;
}
.wrap .btnWrap{
  text-align: center;
  margin-top: 60rpx;
}
.wrap .btnWrap .btn{
  width: 100%;
  border-radius: 80rpx;
  background: linear-gradient(to right, #eb6866, #e64240);
  color: #fff;
  text-align: center;
  font-weight: normal;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
}

.wrap .statusWrap{
  height: 300rpx;
  text-align: center;
  margin-bottom: 30rpx;
}
.wrap .statusWrap image{
  height: 300rpx;
  width: 300rpx;
}
.wrap .statusText{
  font-size: 34rpx;
  font-weight: 600;
}
</style>