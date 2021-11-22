<template>
  <view class="container">
    <view class="title">灯光开关</view>
    <view class="btnWrap block-between">
      <view class="btn btn-color-main" @click="lightOpen">开灯</view>
      <view class="btn btn-color-ban" @click="lightClose">关灯</view>
    </view>
  </view>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from "vue-property-decorator";
  import { CommonModule } from '@/store/modules/common';

  @Component({})
	export default class extends Vue{

    lightOpen() {
      CommonModule.bt.writeCommon('', 'lightOpen');
    }

    lightClose() {
      CommonModule.bt.writeCommon('', 'lightClose');
    }
  }
</script>

<style lang="scss" scoped>
.container{
  text-align: center;
  .title{
    line-height: 100rpx;
  }
  .btnWrap{
    padding: 30rpx 100rpx 60rpx;
    font-size: 24rpx;
    .btn{
      width: 160rpx;
      line-height: 60rpx;
    }
  }
}
</style>