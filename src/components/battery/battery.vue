<template>
<view class="batteryWrap">
  <view class="battery">
    <view class="energy" :style="{width: number + '%', backgroundColor: color(number)}"></view>
    <view class="text">{{number}}</view>
  </view>
</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";

  @Component
	export default class extends Vue{
    @Prop({ default:'?' }) number!:number|string;

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

<style scoped>
/* components/battery/index.wxss */
.batteryWrap{
  width: 50rpx;
  height: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.batteryWrap .battery{
  height: 26rpx;
  width: 40rpx;
  border: 1px solid #606060;
  position: relative;
  padding: 2rpx;
}
.batteryWrap .battery::before{
  content: '';
  display: block;
  position: absolute;
  height: 16rpx;
  width: 2rpx;
  border: 1px solid #606060;
  border-left-color: transparent;
  right: -6rpx;
  top: 50%;
  margin-top: -8rpx;
}
.batteryWrap .battery .energy{
  /* background-color: #00c049; */
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18rpx;
  color: #333;
}
.batteryWrap .battery .text{
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  text-align: center;
}/* components/battery/index.wxss */
.batteryWrap{
  width: 50rpx;
  height: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.batteryWrap .battery{
  height: 26rpx;
  width: 40rpx;
  border: 1px solid #606060;
  position: relative;
  padding: 2rpx;
  font-size: 18rpx;
}
.batteryWrap .battery::before{
  content: '';
  display: block;
  position: absolute;
  height: 16rpx;
  width: 2rpx;
  border: 1px solid #606060;
  border-left-color: transparent;
  right: -6rpx;
  top: 50%;
  margin-top: -8rpx;
}
.batteryWrap .battery .energy{
  /* background-color: #00c049; */
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
}
.batteryWrap .battery .text{
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  text-align: center;
}/* components/battery/index.wxss */
.batteryWrap{
  width: 50rpx;
  height: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.batteryWrap .battery{
  height: 26rpx;
  width: 40rpx;
  border: 1px solid #606060;
  position: relative;
  padding: 2rpx;
}
.batteryWrap .battery::before{
  content: '';
  display: block;
  position: absolute;
  height: 16rpx;
  width: 2rpx;
  border: 1px solid #606060;
  border-left-color: transparent;
  right: -6rpx;
  top: 50%;
  margin-top: -8rpx;
}
.batteryWrap .battery .energy{
  /* background-color: #00c049; */
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18rpx;
  color: #333;
}
.batteryWrap .battery .text{
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  text-align: center;
}
</style>