<template>
<view class="adultMask" v-if="show" @click="()=>{}">
  <view class="adultWrap">
    <view class="imgWrap">
      <image src="/static/images/logo.png" mode="heightFix"></image>
    </view>

    <view class="adultBlock" v-if="!verify">
      <view class="content">您必须年满18周岁才能购买本产品</view>
      <view class="btnWrap">
        <view class="btn btnConfirm" @click.stop="()=>{ verify = true }">我18周岁以上，同意年龄验证</view>
          <view class="btn btnCancel" @click.stop="cancel">我未满18周岁</view>
      </view>  
    </view>

    <view class="adultForm" v-else>
      <view class="formItem">
        <view class="label">姓名</view>
        <view class="input">
          <input type="text" :value="form.name" placeholder="请输入真实姓名" placeholder-style="color: #aaa" @input="inputChange" data-name="name"/>
        </view>
      </view>
      <view class="formItem">
        <view class="label">身份证</view>
        <view class="input">
          <input type="idcard" :value="form.idCard" placeholder="请输入真实身份证号码" placeholder-style="color: #aaa" @input="inputChange" data-name="idCard"/>
        </view>
      </view>
      <view class="formItem">
        <view class="label">手机号</view>
        <view class="input">
          <input type="number" :value="form.phone" placeholder="请输入手机号码" placeholder-style="color: #aaa" @input="inputChange" data-name="phone" :disabled="codeIs"/>
        </view>
      </view>
      <view class="formItem">
        <view class="label">验证码</view>
        <view class="input">
          <input type="number" :value="form.verify" placeholder="请输入验证码" placeholder-style="color: #aaa" @input="inputChange" data-name="verify"/>
        </view>
        <view :class="[codeTimer>0? 'codeDisable code' : 'code']" @click="sendCode">{{codeTimer>0? codeNum+'s' : '发送'}}</view>
      </view>
      <view class="btnWrap">
        <view class="btn btnConfirm" @click="formSubmit">提交</view>
      </view>
    </view> 

    <view class="iconWrap">
      <view class="img">
        <image src="/static/images/adult.png"></image>
      </view> 
      <view class="text">未成年人禁止购买</view>
    </view>
  </view>
</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from "vue-property-decorator";
  import { checkPhone, sendVerify, checkAdult } from '@/api/user';
  import {  CommonModule } from '@/store/modules/common';
 
  @Component
  export default class extends Vue{
    @Prop({ default:false }) show!:boolean;

    private verify:boolean = false;         // false-验证页面 true-表单页面
    private codeTimer:any = null;           // 验证码计时器
    private codeNum:number = 60;            // 验证码倒计时
    private codeIs:boolean = false;         // 验证码是否发送
    private form = {
      name: '', idCard: '', phone: '', verify: ''
    }

    @Emit()
    cancel() {
      return; 
    }

    /**
     * 发送验证码
     */
    private sendCode() {
      let that = this;
      if(that.codeIs) return
      that.codeIs = true
      if(that.codeTimer > 0) return
      const phoneReg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
      if(!phoneReg.test(that.form.phone)) {
        wx.showToast({
          title: '请输入正确的手机号码',
          icon: 'none'
        })
        that.codeIs = false
        return
      }
      this.phoneCheck();
    }

    /**
     * 验证码计时
     */
    private codeRun() {
      console.log('创建定时器')
      let that = this
      let timer = setInterval(() => {
        that.codeNum = that.codeNum-1
        if(that.codeNum === 0) {
          clearInterval(that.codeTimer);
          that.codeTimer = null;
          that.codeNum = 60;
          that.codeIs = false;
        }
      }, 1000)
      that.codeTimer = timer
      that.codeIs = false
    }

    /**
     * 手机号验证 & 发送验证码
     */
    phoneCheck() {
      let that = this;
      let data = {
        mobile: that.form.phone
      }
      checkPhone(data).then((res:any) => {
        if(res.code === 200) {
          sendVerify(data).then((ress) => {
            that.codeRun()
          }).catch((err)=>{
            that.codeIs = false
          });
        }
      }).catch((err)=>{
        that.codeIs = false
      })
    }

    // input输入
    inputChange(e:any) {
      let name = e.target.dataset.name;
      let value = e.detail.value;
      //@ts-ignore
      this.form[name] = value
    }

    // 表单提交
    formSubmit() {
      let that = this
      let form = that.form
      let data = {
        user_card_no: form.idCard,
        user_card_name: form.name,
        user_mobile: form.phone,
        code: form.verify
      }
      checkAdult(data).then((res:any) => {
        if(res.code === 200) {
          uni.showToast({
            title: res.msg,
            icon: 'success'
          })
          CommonModule.SET_ADULT(1);
          that.cancel();
        }
      })
    }

  }
</script>

<style lang="scss">
.adultMask{
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, .7);
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.adultWrap{
  width: 84%;
  max-width: 630rpx;
  padding: 80rpx 65rpx;
  background-color: #fff;
  text-align: center;
  border-radius: 24rpx;
  box-sizing: border-box;
  position: relative;
}
.adultWrap .imgWrap{
  height: 90rpx;
  margin-bottom: 40rpx;
}
.adultWrap .imgWrap image{
  height: 100%;
  background-size: auto 100%;
  background-position: center;
}
.adultWrap .content{
  padding: 0 0 100rpx;
  font-size: 32rpx;
}
.adultWrap .btnWrap .btn{
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  color: #fafafa;
  border-radius: 6rpx;
}
.adultWrap .btnWrap .btnConfirm{
  background-color: #e64240;
}
.adultWrap .btnWrap .btnCancel{
  background-color: #cccccc;
  margin-top: 30rpx;
}
.adultWrap .iconWrap{
  position: absolute;
  left: 0;
  top: -64rpx;
  height: 60rpx;
  line-height: 60rpx;
  display: flex;
  color: #fafafa;
  font-size: 34rpx;
  display: flex;
  align-items: center;
}
.adultWrap .iconWrap .img{
  width: 52rpx;
  height: 52rpx;
  margin-right: 12rpx;
}


.adultForm .formItem{
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  line-height: 100rpx;
  text-align: left;
}
.adultForm .formItem .label{
  min-width: 120rpx;
}
.adultForm .formItem .input{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.adultForm .formItem .code{
  min-width: 120rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  background-color: #e64240;
  color: #f5f5f5;
  border-radius: 0 6rpx 6rpx 0;
}
.adultForm .formItem .codeDisable{
  background-color: #b33432;
  color: #e5e5e5;
}
.adultForm .formItem .input input{
  border: 1px solid #e5e5e5;
  width: 100%;
  padding: 6rpx 12rpx;
  height: 60rpx;
  line-height: 60rpx;
  box-sizing: border-box;
  color: #808080;
}
.adultForm .btnWrap{
  margin-top: 60rpx;
}

</style>