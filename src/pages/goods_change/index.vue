<template>
  <view>
    <navbar :params="{title: '商品置换', return: true}"/>

    <view class="goodlist p30">

      <view class="item" v-for="(item, index) in goodlist" :key="index">
        <view class="imgWrap">
          <image v-if="item.goods_pic" :src="imgUrl + item.goods_pic"></image>
          <image v-else src="/images/product.png" mode="aspectFill"></image>
        </view>
        <view class="textWrap">
          <view class="title">{{item.goods_name}}</view>
          <view class="info">
            <view class="price font-red">{{item.goods_retail_price}}</view>
            <view class="btn back-red" @click="changeGood" :data-goodsId="item.goods_id">上架</view>
          </view>
        </view>
      </view>

    </view>
  </view>
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import navbar from '@/components/navbar/navbar.vue';

import { CommonModule } from '@/store/modules/common';
import { getGoodsList, changeGood } from '@/api/user';
import { reconnectBT } from '@/utils/bluetooth';


@Component({
  components: { navbar }
})
export default class extends Vue{
  private channelId:number = 0;
  private code:number = 0;
  private goodlist:Array<object> = [];
  private imgUrl:string = CommonModule.imgUrl;

  /**
   * 获取商品列表
   */
  getGoodsList() {
    let that = this;
    getGoodsList({}).then(res => {
      that.goodlist = res.data
    })
  }

  /**
   * 置换商品
   */
  changeGood(e:any) {
    let that = this;
    let goodsId = e.currentTarget.dataset.goodsid;
    let data = {
      channel_id: this.channelId,
      goods_id:　goodsId
    }
    changeGood(data).then(res => {
      that.emitCode()
      uni.navigateBack({})
    })
  }

  //返回补货参数
  emitCode() {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    //@ts-ignore
    prevPage.$vm.goodsChangeChannel = this.code
  }

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options:any) {
    if(options.channelId > 0) {
      this.channelId = options.channelId
      this.code = options.code
    } else {
      uni.showToast({
        title: '暂无货道信息',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack({});
      }, 1000)
    }
    this.getGoodsList();
  }

  onShow() {
    reconnectBT();
  }
}
</script>


<style lang="scss">
.goodlist{
  padding-bottom: 30rpx;
}
.goodlist .item{
  background-color: #ffffff;
  display: flex;
  padding: 20rpx 30rpx;
  border-radius: 20rpx;
  margin-top: 20rpx;
}
.goodlist .item .imgWrap{
  min-width: 200rpx;
  height: 200rpx;
  border-radius: 20rpx;
  margin-right: 30rpx;
}
.goodlist .item .textWrap{
  padding: 20rpx 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
}
.goodlist .item .textWrap .title{
  font-size: 32rpx;
}
.goodlist .item .textWrap .info{
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
}
.goodlist .item .textWrap .info .price{
  font-size: 34rpx;
}
.goodlist .item .textWrap .info .price::before{
  content: '¥';
  font-size: 28rpx;
}
.goodlist .item .textWrap .info .btn{
  text-align: center;
  height: 50rpx;
  line-height: 50rpx;
  width: 120rpx;
  border-radius: 8rpx;
}
</style>