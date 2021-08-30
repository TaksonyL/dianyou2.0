<template>
  <view>
    <navbar :params="{title: '商品详情', return: true}"/>

    <view class="goodsImg">
      <image v-if="goodDetail.goods_pic" :src="imgUrl + goodDetail.goods_pic" mode="aspectFill"></image>
      <image v-else src="/static/images/product.png" mode="aspectFill"></image>
    </view>

    <view class="goodsWrap p30">
      <view class="goodsHeader">
        <view class="name">{{goodDetail.goods_name}}</view>
        <view class="info">
          <view class="price font-red">¥{{goodDetail.goods_retail_price}}</view>
          <view class="stock font-gray">剩余库存：{{stock}}件</view>
        </view>
      </view>
      <view class="goodsContent">
        <!-- <text>商品描述：SMISS电子烟口感清新舒爽，时时刻刻展现独特风采</text> -->
        <view class="title">商品描述</view>
        <!-- <view>SMISS电子烟口感清新舒爽，时时刻刻展现独特风采</view> -->
        <rich-text v-if="goodDetail.goods_desc" :nodes="goodDetail.goods_desc"></rich-text>
        <view class="font-gray" v-else>暂无商品详细描述~</view>
      </view>
    </view>

    <view class="footer p30">
      <button :class="[stock === 0?  'back-gray buy' : 'back-red buy']" @click="goBuy">立即购买</button>
    </view>

    <adult :show="adultShow" @cancel="()=>{adultShow = false}"/>
  </view>
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import navbar from '@/components/navbar/navbar.vue';

import { CommonModule } from '@/store/modules/common';

import { getDetail } from '@/api/user';
import buy from '@/utils/buy';
import { reconnectBT } from '@/utils/bluetooth';

@Component({
  components: { navbar }
})
export default class extends Vue{
  private goodId:number|string = 0        // 商品ID
  private channelId:number|string = 0     // 货道ID
  private goodDetail:any = []             // 商品详情
  private imgUrl:string = CommonModule.imgUrl
  private adultShow:boolean = false       // 是否成人验证
  private stock:number = 0                // 库存


  /**
   * 获取商品详情
   */
  getDetail() {
    let that = this;
    getDetail({id: that.goodId}).then(res => {
      if(res.data.goods_desc) {
        res.data.goods_desc = res.data.goods_desc.replace(/\/uploads/gi, that.imgUrl + '/uploads');
        res.data.goods_desc = res.data.goods_desc.replace(/img/gi, 'img width="100%"');
      }
      that.goodDetail = res.data
    }).catch(err => {
      setTimeout(()=>{
        uni.navigateBack({})
      }, 1000)
    })
  }

  /**
   * 购买商品
   */
  goBuy() {
    if(this.stock === 0) {
      wx.showModal({
        title: "提示",
        content: "货道库存不足",
        showCancel: false
      })
      return
    }
    let adult = this.adultCheck();
    if(adult) return;
    let price = this.goodDetail.goods_retail_price
    let data = {
      goodsList: [
        {
          channel_id: this.channelId, 
          goods_num: 1
        }
      ]
    }
    this.emitCode();
    buy(data, price);
  }

  //返回补货参数
  emitCode() {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    //@ts-ignore
    prevPage.$vm.goodsUpdate = true
  }


  /**
   * 成人验证
   * @return {boolean} true-需要成人验证  false-不需要成人验证
   */
  adultCheck() {
    if(CommonModule.adult === 2) return false;
    let adult = CommonModule.adult === 0
    this.adultShow = adult
    return adult
  }


  onLoad(options:any) {
    if(options.id>0 && options.channelId>0) {
      this.goodId = options.id;
      this.channelId = options.channelId;
      this.stock = Number(options.stock)
      this.getDetail();
    } else {
      uni.showToast({
        title: '查无商品',
        icon: 'none'
      })
      setTimeout(()=>{
        uni.navigateBack({})
      }, 1000)
    }
  }

  onShow() {
    reconnectBT();
  }

}
</script>


<style lang="scss">
.goodsImg{
  height: 665rpx;
}

.goodsWrap .goodsHeader{
  padding: 40rpx 0 30rpx;
  border-bottom: 1px solid #cccccc;
}
.goodsWrap .goodsHeader .title{
  font-size: 32rpx;
  color: #333;
}
.goodsWrap .goodsHeader .info{
  display: flex;
  align-items: flex-end;
  margin-top: 20rpx;
}
.goodsWrap .goodsHeader .info .price{
  font-size: 36rpx;
}
.goodsWrap .goodsHeader .info .price::after{
  content: '/件';
  color: #808080;
  font-size: 24rpx;
}
.goodsWrap .goodsHeader .info .stock{
  font-size: 24rpx;
  margin-left: 40rpx;
}
.goodsWrap .goodsContent{
  padding-top: 30rpx;
  padding-bottom: 140rpx;
}

.goodsWrap .goodsContent .title{
  font-size: 32rpx;
  margin-bottom: 20rpx;
}


.footer{
  position: fixed;
  bottom: 0;
  width: 100vw;
  height: 120rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.footer .buy{
  width: 100%;
  border-radius: 40rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 32rpx;
  font-weight: 500;
}
</style>