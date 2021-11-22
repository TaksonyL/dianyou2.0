<template>
<view class="orderItem p30">
  <view class="headerWrap block-between">
    <view>{{item.order_create_time}}</view>
    <view v-if="item.order_pay_status === 3" class="status refund">已退款</view>
    <view v-else-if="item.order_out_status === 1" class="status success">出货成功</view>
    <view v-else-if="item.order_out_status === 2" class="status fail">出货失败</view>
    <view v-else-if="item.order_out_status === 3" class="status pending">等待出货</view>
    <view v-else-if="item.order_out_status === 4" class="status falut">故障</view>
    <view v-else-if="item.order_out_status === 5" class="status timeout">超时</view>
  </view>

  <view class="content">
    <view class="label">
      <view class="text">订单ID</view>
      <view class="val">{{item.order_id}}</view>
    </view>
    <view class="label">
      <view class="text">订单编号</view>
      <view class="val">{{item.order_trade_no}}</view>
    </view>
    <view class="label">
      <view class="text">订单设备</view>
      <view class="val">{{item.order_machine}}</view>
    </view>
    <view class="label">
      <view class="text">购买方式</view>
      <!-- <view class="val">{{item.order_pay_type}}</view> -->
      <view class="val">京东支付</view>
    </view>
    <view class="label">
      <view class="text">支付金额</view>
      <view class="val">{{item.order_money}}</view>
    </view>
  </view>
</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from "vue-property-decorator";

  @Component
	export default class extends Vue{
    @Prop({ default:{} }) item!:object;
  }
</script>

<style lang="scss" scoped>
.orderItem{
  background-color: $back-color;
  margin-top: 20rpx;

  .headerWrap{
    height: 80rpx;
    line-height: 80rpx;
    font-size: 26rpx;
    border-bottom: 1px solid #eee;
    .status{
      color: #fafafa;
      width: 130rpx;
      height: 50rpx;
      line-height: 50rpx;
      text-align: center;
      font-size: 24rpx;
      border-radius: 8rpx;
    }
  }

  .content{
    padding: 20rpx 0;
    .label{
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 60rpx;
      line-height: 60rpx;
    }
    .val{
      color: #999;
    }
  }

  .success{
    background-color: #07c160;
  }
  .fail{
    background-color: #576b95;
  }
  .pending{
    background-color: #1485ee;
  }
  .fault{
    background-color: #fa5151;
  }
  .timeout{
    background-color: #ffc300;
  }
  .refund{
    background-color: #ff8500;
  }
}
</style>