<template>
	<view class="goodsChange">
    <Navbar :params="{title: '商品置换'}" />
    
    <view class="content p30">

      <view class="item" v-for="(item, index) in list" :key="index">
        <view class="imgWrap">
          <DkmImage width="100%" height="100%" :src="item.goods_pic" />
        </view>
        <view class="textWrap block-between">
          <view class="title">{{item.goods_name}}</view>
          <view class="info block-between">
            <view class="price font-color-price">{{item.goods_retail_price}}</view>
            <view class="btn btn-color-main" @click="changeGood(item.goods_id)">上架</view>
          </view>
        </view>
      </view>

    </view>

	</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";
  import Navbar from '@/components/navbar/navbar.vue';
  import DkmImage from '@/components/dkmImage/dkmImage.vue';

  import { getGoodsList, changeGood } from '@/api/user';

  @Component({
    components: {
      Navbar, DkmImage
    }
  })
  export default class extends Vue{
    public list:any[] = [];         // 商品列表
    public channelId:number = 0;    // 货道ID

    // 置换商品
    changeGood(goodsId:number) {
      let that = this;
      let request = {
        channel_id: that.channelId,
        goods_id: goodsId
      }
      changeGood(request).then(res => {
        that.$dkm.tips('操作成功', true, true);
      })
    }

    // 获取商品列表
    getGoodsList() {
      let that = this;
      getGoodsList({}).then(res => {
        that.list = res.data
      })
    }


    onLoad(options:any) {
      if(options.id) {
        this.channelId = Number(options.id);
        this.getGoodsList();
      } else {
        this.$dkm.tips('参数错误', false, true);
      }
    }
  }
</script>

<style lang="scss" scoped>
.goodsChange{
  .content{
    padding-bottom: 30rpx;
    .item{
      background-color: $back-color;
      display: flex;
      padding: 20rpx 30rpx;
      border-radius: 20rpx;
      margin-top: 20rpx;
      .imgWrap{
        min-width: 200rpx;
        height: 200rpx;
        border-radius: 20rpx;
        margin-right: 30rpx;
      }
      .textWrap{
        padding: 20rpx 0;
        flex-direction: column;
        width: 100%;
        .title{
          font-size: 32rpx;
          width: 100%;
        }
        .info{
          width: 100%;
        }
        .price{
          font-size: 34rpx;
          &:before{
            content: '¥';
            font-size: 28rpx;
          }
        }
        .btn{
          text-align: center;
          height: 50rpx;
          line-height: 50rpx;
          width: 120rpx;
          border-radius: 8rpx;
        }
      }
    }
  }
}
</style>
