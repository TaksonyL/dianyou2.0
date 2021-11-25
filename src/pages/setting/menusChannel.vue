<template>
    <view class="channelTest">
      <view class="title">货道测试</view>
      <view class="channelList block-between p30">
        <view class="item" v-for="(item, index) in channelList" :key="index"
         @click="testChannel(item.code)">{{item.name}}</view>
      </view>  
    </view>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from "vue-property-decorator";
  import { CommonModule } from "@/store/modules/common";

  import { testChannel } from '@/api/setting';

  @Component({
  })
	export default class extends Vue{
  private channelList:any[] = [        // 测试货道列表
    // {name: '货道一', code: '01'}, {name: '货道二', code: '02'}, {name: '货道三', code: '03'},
    // {name: '货道四', code: '04'}, {name: '货道五', code: '05'}, {name: '货道六', code: '06'},
    // {name: '货道七', code: '07'}, {name: '货道八', code: '08'}, {name: '货道九', code: '09'},
    {name: '货道一', code: '01'}, {name: '货道二', code: '02'}, {name: '货道三', code: '03'},
    {name: '货道四', code: '04'}, {name: '货道五', code: '05'}, {name: '货道六', code: '06'},
    {name: '货道七', code: '07'},
  ]

  // 货道测试
  testChannel(code:string) {
    // testChannel({ channel: code }).then(res => {
    //   let hex = res.data;
    //   CommonModule.bt.writeTest(hex);
    // })
    CommonModule.bt.writeTest('A502'+code+'02');
  }
}
</script>

<style lang="scss" scoped>
.channelTest{
  text-align: center;
  .title{
    line-height: 100rpx;
  }
  .channelList{
    flex-wrap: wrap;
    padding-top: 20rpx;
    padding-bottom: 20rpx;
    .item{
      width: 30%;
      line-height: 60rpx;
      font-size: 24rpx;
      background-color: $main-color;
      color: #fafafa;
      border-radius: 10rpx;
      margin-bottom: 
      20rpx;
    }
  }
}
</style>