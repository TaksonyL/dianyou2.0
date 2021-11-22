<template>
<view class="goodsItem" @click="goDetail">
  <view class="imgWrap">
    <DkmImage :class="isStock?'img':'img imgOut'" :isPrefix="true"
     :src="item.goods_pic" />
     <image v-if="!isStock" class="saleOut" src="/static/images/sale_out.png" mode="widthFix" />
  </view>
  <view class="textWrap">
    <view class="name">{{item.goods_name}}</view>

    <!-- 购买 -->
    <view v-if="mode === 0" class="info block-between">
      <view class="price font-color-price">{{item.goods_price}}</view>
      <view :class="isStock&&isAble?'btnBlock btn-color-main':'btnBlock btn-color-ban'" @click.stop="goBuy">购买</view>
    </view>
    <!-- 补货 -->
    <view v-else-if="mode === 1" class="rep block-between">
      <view :class="isAble?'btnBlock btn-color-primary':'btnBlock btn-color-ban'" @click.stop="goChange(item.channel_id)">置换商品</view>
      <view :class="isAble?'btnBlock btn-color-primary':'btnBlock btn-color-ban'" @click.stop="goRep()">货道补货</view>
    </view>
  </view>
</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from "vue-property-decorator";
  import DkmImage from '@/components/dkmImage/dkmImage.vue';

  import { CommonModule } from '@/store/modules/common';
  import { repChannel } from '@/api/setting';
  import buyApi from '@/utils/pay';

  @Component({
    components: {
      DkmImage
    }
  })
	export default class extends Vue{
    @Prop({ default: 0 }) mode:0|1 = 0        // 0-购买 1-补货
    @Prop({ default: {} }) item!:any       // 商品信息

    @Emit()
    update() {  }   // 通知主页更新

    @Emit()
    adult()  {  }   // 通知成人验证

    goBuy() {
      if(this.isStock && this.isAble) {
        let data = {
          goodsList: [
            {
              channel_id: this.item.channel_id,
              goods_num: 1
            }
          ]
        }
        buyApi(data, this.item.goods_price);
        this.update();
      } else {
        this.$dkm.tips('货道异常')
      }
    }

    // 是否有库存
    get isStock() {
      return this.item.channel_stock > 0;
    }

    // 是否存于可用状态
    get isAble() {
      return this.item.channel_status === 1;
    }

    // 置换商品
    goChange(id:number) {
      if(this.isAble) {
        CommonModule.SET_GOODS_UPDATE(true);
        uni.navigateTo({
          url: '/pages/goods_change/index?id=' + id
        })
      }
    }

    // 补货
    goRep() {
      if(!this.isAble) {
        return this.$dkm.tips('货道暂时不可用');
      }
      let data = {
        channel: this.item.channel_code
      }
      let that = this;
      repChannel(data).then((res:any) => {
        CommonModule.bt.zuoan.repChannel = data.channel;
        CommonModule.bt.writeRep(res.data);
        that.update();
      })
    }

    // 前往详情页
    goDetail() {
      let that = this
      uni.navigateTo({
        url: `/pages/goods_detail/index?id=${that.item.channel_goods_id}&channelId=${that.item.channel_id}&stock=${that.item.channel_stock}`
      })
    }

    // 成人验证
    adultCheck() {
      if(CommonModule.adult === 2) return false;
      let adult = CommonModule.adult === 0
      this.adult();
      return adult
    }

}
</script>

<style lang="scss" scoped>
.goodsItem{
  width: 330rpx;
  padding: 20rpx;
  border: 1px solid #ccc;
  border-radius: 8rpx;
  margin-bottom: 30rpx;
  box-sizing: border-box;
  .imgWrap{
    height: 290rpx;
    overflow: hidden;
    position: relative;
    z-index: 0;
    border-radius: 8rpx;
    .img{
      width: 100%;
      height: 100%;
    }
    .saleOut{
      position: absolute;
      width: 100%;
      top: 20%;
      left: 0;
      width: 100%;
      z-index: 9;
    }
    .imgOut{
      &:after{
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba($color: #333, $alpha: .8);
      }
    }
  }
  .textWrap{
    text-align: center;
    .name{
      line-height: 60rpx;
    }
    .info{
      font-size: 24rpx;
      .price{
        &:before{
          content: '¥';
        }
      }
    }
  }
  .btnBlock{
    width: 120rpx;
    line-height: 46rpx;
    font-size: 24rpx;
  }
}
</style>