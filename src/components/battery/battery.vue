<template>
  <view class="batteryWrap">
    <view class="battery">
      <view class="energy" :style="{width: number + '%', backgroundColor: color(number)}"></view>
      <view class="text">{{number}}</view>
    </view>
    <view class="cap"></view>
  </view>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";

  @Component
	export default class extends Vue{
    @Prop({ default:100 }) number!:number|string;

    // 颜色变化
    private color(num:number|string):string {
      if(num === '?') {
        return '#808080';
      }
      num = Number(num);
      let val = '#fa5151';
      if(num<60 && num>20) {
        val = '#ffc300';
      } else if (num > 60) {
        val = '#00c049'
      }
      return val;
    }
  }
</script>

<style lang="scss" scoped>
.batteryWrap{
  display: flex;
  align-items: center;
  .battery{
    width: 40rpx;
    height: 26rpx;
    border: 1px solid #606060;
    padding: 2rpx;
    border-radius: 2rpx;
    position: relative;
    .energy{
      height: 100%;
      display: flex;
      align-items: center;
    }
    .text{
      position: absolute;
      width: 100%;
      height: 100%;
      text-align: center;
      top: 0;
      left: 0;
      font-size: 18rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .cap{
    width: 2rpx;
    height: 18rpx;
    border: 1px solid #606060;
    border-left-color: transparent;
  }
}
</style>