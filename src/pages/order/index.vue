<template>
  <view>
    <navbar :params="{title: '历史订单'}"/>

    <view class="orderList">

      <view class="order p30" v-for="(item, index) in orderlist" :key="index">
        <view class="header">
          <view class="time font-gray">{{item.order_create_time}}</view>
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

      <view class="noMore font-gray" v-if="page >= lastPage">
        亲~已经没有更多数据了！
      </view>

    </view>
  </view>
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import navbar from '@/components/navbar/navbar.vue';
import { getOrder } from '@/api/user';
import { BluetoothModule } from "@/store/modules/bluetooth";

@Component({
  components: { navbar }
})
export default class extends Vue{
  private orderlist:Array<Object> = []
  private page:number = 1
  private lastPage:number = 99

  /**
   * 获取历史订单
   */
  getOrder() {
    let that = this;
    let data = {
      page: that.page
    }
    getOrder(data).then(res => {
      let list = [...that.orderlist, ...res.data.data];
      that.orderlist = list;
      that.lastPage = res.data.last_page;
      that.page++
    })
  }

  onLoad() {
    this.getOrder();
  }

  onReachBottom() {
    if(this.page < this.lastPage) {
      this.getOrder();
    }
  }

}
</script>


<style lang="scss">
.orderList{
  padding-bottom: 20rpx;
}

.order{
  background-color: #fff;
  margin-top: 20rpx;
}
.order .header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 26rpx;
  border-bottom: 1px solid #eee;
}
.order .header .status{
  color: #fff;
  width: 130rpx;
  height: 50rpx;
  line-height: 50rpx;
  text-align: center;
  font-size: 24rpx;
  border-radius: 8rpx;
}
.order .content{
  padding: 20rpx 0 ;
}
.order .content .label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60rpx;
  line-height: 60rpx;
}
.order .content .label .val{
  color: #545454;
}
.noMore{
  margin-top: 30rpx;
  font-size: 24rpx;
  text-align: center;
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

</style>