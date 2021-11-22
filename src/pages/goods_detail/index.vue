<template>
	<view class="goodsDetail">
    <Navbar :params="{title: '商品详情'}" />

    <view class="imgWrap" v-if="detail.goods_pic">
      <DkmImage height="100%" :isPrefix="true" :src="detail.goods_pic"/>
    </view>

    <view class="textWrap p30">
      <view class="name">{{detail.goods_name}}</view>
      <view class="info">
        <view class="price font-color-price"><text>{{detail.goods_retail_price}}</text>/件</view>
        <view class="stock">剩余库存：{{stock}}件</view>
      </view>
      <view class="content">
        <u-parse v-if="detail.goods_desc" :html="detail.goods_desc"></u-parse>
        <view class="tips" v-else>亲~暂无商品详细描述!</view>
      </view>
    </view>

    <view class="btnWrap p30">
      <DkmButton :disable="stock === 0" text="立即购买" @click="goBuy"/>
    </view>

    <!-- 成人验证 -->
    <Adult :show="adultShow" @cancel="()=>{adultShow = false}"/>
	</view>
</template>

<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  import Navbar from '@/components/navbar/navbar.vue';
  import DkmImage from '@/components/dkmImage/dkmImage.vue';
  import DkmButton from '@/components/dkmButton/dkmButton.vue';
  import Adult from '@/components/adult/adult.vue';

  import { getDetail } from '@/api/user';
  import { CommonModule } from "@/store/modules/common";
  import buy from '@/utils/pay';

  @Component({
    components: {
      Navbar, DkmImage, DkmButton, Adult
    }
  })
  export default class extends Vue{
    private detail:any = {};
    private goodId:number = 0;                  // 商品ID
    private channelId:number = 0;               // 货道ID
    private stock:number = 0;                   // 库存
    private url:string = CommonModule.url;      // 根目录地址
    private adultShow:boolean = false;          // 成人验证

    // 是否有库存
    get isStock() {
      return this.detail.channel_stock > 0;
    }

    // 是否存于可用状态
    get isAble() {
      return this.detail.channel_status === 1;
    }

    // 获取商品详情
    getDetail() {
      let that = this;
      getDetail({id: that.goodId}).then(res => {
        if(res.data.goods_desc) {
          res.data.goods_desc = res.data.goods_desc.replace(/img/gi, 'img width="100%"');
        }
        this.detail = res.data;
        console.log(this.detail);
      }).catch(err => {
        that.$dkm.tips('查无商品信息', false, true);
      })
    }

    // 购买商品
    goBuy() {
      let adult = this.adultCheck();
      if(adult) return;
      let that = this;
      let data = {
        goodsList: [
          {
            channel_id: that.channelId,
            goods_num: 1
          }
        ]
      }
      buy(data, that.detail.goods_retail_price);
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
      if(options.id) {
        this.goodId = Number(options.id);
        this.channelId = Number(options.channelId);
        this.stock = Number(options.stock);
        this.getDetail();
      }
    }
  }
</script>

<style lang="scss" scoped>
.goodsDetail{
  .imgWrap{
    height: 660rpx;
  }

  .textWrap{
    padding-top: 30rpx;
    .name{
      font-size: 32rpx;
    }
    .info{
      display: flex;
      align-items: flex-end;
      color: #808080;
      line-height: 90rpx;
      border-bottom: 1rpx solid #ccc;
      .price{
        font-size: 36rpx;
        margin-right: 40rpx;
        &:before{
          content: '¥';
        }
      }
    }
    .content{
      padding-top: 30rpx;
      .tips{
        color: #808080;
      }
    }
  }

  .btnWrap{
    background-color: $back-color;
    padding-top: 20rpx;
    padding-bottom: 20rpx;
    width: 100vw;
    position: fixed;
    bottom: 0;
    left: 0;
  }
}
</style>
