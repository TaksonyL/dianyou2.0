<template>
  <view>
    <navbar :params="{title: '订单完成', shadow: false, class: 1}"  :back="false"/>

    <view class="headerWrap p30">
      <view class="content">
        <view class="imgWrap">
          <image v-if="success" src="/static/images/success.png"></image>
          <image v-else src="/static/images/fail.png"></image>
        </view>
        <view class="textWrap">
          <view class="status">{{success? '支付成功' : '支付失败'}}！</view>
          <view class="text">{{success? '感谢您的购买' : '请联系客服'}}</view>
        </view>
      </view>
    </view>

    <view class="orderWrap">
      <view class="block"></view>
      <view class="order">
        <view class="price">{{price || '0.00'}}</view>
        <view class="detail">
          <view class="item">
            <text class="font-gray">订单编号：</text>{{orderCode || '--'}}
          </view>
          <view class="item">
            <text class="font-gray">下单时间：</text>{{nowTime}}
          </view>
          <view class="item">
            <text class="font-gray">支付方式：</text>微信支付
          </view>
        </view>
      </view>
    </view>

    <view class="btnWrap">
      <DkmButton class="btn" text="返回首页" fontSize="28" @click="goHome"/>
    </view>
  </view>
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import navbar from '@/components/navbar/navbar.vue';
import DkmButton from '@/components/dkmButton/dkmButton.vue';

import { CommonModule } from '@/store/modules/common';
import { formatTime } from '@/utils/util';

@Component({
  components: { navbar, DkmButton }
})
export default class extends Vue{
  private success:boolean = true
  private nowTime:string = ''
  private orderCode:string = CommonModule.order.code
  private price:string = CommonModule.order.price

  onLoad() {
    let date = new Date();
    this.nowTime = formatTime(date); 
  }

  goHome() {
    uni.switchTab({
      url: '/pages/index/index',
      fail(err) {
        console.log(err)
      }
    })
  }
}
</script>


<style lang="scss">
.headerWrap{
  background: linear-gradient(to bottom, $main-color ,#eb6866);
  height: 300rpx;
  box-sizing: border-box;
  padding-bottom: 100rpx;
}
.headerWrap .content{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.headerWrap .content .imgWrap{
  width: 100rpx;
  height: 100rpx;
  margin-right: 20rpx;
}
.headerWrap .content .textWrap{
  color: #ffffff;
}
.headerWrap .content .textWrap .status{
  font-size: 34rpx;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 4rpx;
}


.orderWrap{
  padding: 0 15rpx;
  margin-top: -40rpx;
}
.orderWrap .block{
  height: 20rpx;
  background-color: #99302e;
  border-radius: 20rpx;
}
.orderWrap .order{
  background-color: #fff;
  margin: 0 15rpx;
  margin-top: -10rpx;
  position: relative;
  box-shadow: 0 1px 3px 0px rgba(0, 0, 0, .1);
  color: #545454;
}
.orderWrap .order::before{
  content: '';
  position: absolute;
  width: 100%;
  height: 20rpx;
  top: 0;
  left: 0;
  background: linear-gradient(to bottom, #f5b3b3 ,#fff);
}
.orderWrap .order .price{
  padding-top: 30rpx;
  height: 120rpx;
  line-height: 120rpx;
  font-size: 48rpx;
  font-weight: bold;
  border-bottom: 1px dotted #e5e5e5;
  text-align: center;
}
.orderWrap .order .price::before{
  content: '¥';
  font-size: 28rpx;
  font-weight: normal;
}
.orderWrap .order .detail{
  padding: 30rpx 30rpx 50rpx;
}
.orderWrap .order .detail .item{
  line-height: 60rpx;
  height: 60rpx;
}

.btnWrap{
  text-align: center;
  padding: 80rpx 100rpx 0;
}
.btnWrap .btn{
  display: inline-block;
  width: 350rpx;
  height: 80rpx;
  line-height: 80rpx;
  color: #fff;
  border-radius: 40rpx;
}
</style>