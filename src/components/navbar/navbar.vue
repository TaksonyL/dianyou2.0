<template>
<view class="navbar">
  <!-- #ifdef MP-WEIXIN -->  
  <view :class="[shadow? 'navWrap shadow' : 'navWrap']" :style="{ height: navH + 'rpx', backgroundColor: background, color: color }">
    <view v-if="back" class="return">
      <u-icon name="arrow-left" color="#808080" size="36" @click="goReturn"></u-icon>
    </view>
    <view class="text">{{params.title}}</view>
  </view>
  <view class="navBlock" :style="'height:' + navH + 'rpx'"></view>
  <!-- #endif -->
</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";
  import { CommonModule } from '@/store/modules/common';

  interface paramsType {
    title:string,     // 标题
    return:boolean,   // 是否存在返回按钮
    class:number,     // 主题颜色
    shadow:boolean    // 是否有底部阴影
  }

  @Component
	export default class extends Vue{
    private navH:number = CommonModule.navHeight;
    private color:string = '#333';
    private background:string = '#fff';
    private shadow:boolean = true;
    private back:boolean = false;

    @Prop({ default:{title: '标题', return: false, class: 0, shadow: true} }) params!:paramsType;

    // 返回按钮 
    private goReturn() {
      console.log('test')
      uni.navigateBack({});
    }
    
    created() {
      let pages = getCurrentPages();
      this.back = this.params.return;
      if(pages.length <= 1) this.back = false;
      if(this.params.shadow === false) this.shadow = false
      switch(this.params.class) {
        case 1:
          this.background = '#e64240'
          this.color = "#fff"
          break;
      }
    }
  }
</script>

<style scoped>
.navWrap{
  text-align: center;
  width: 100vw;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
}
.shadow{
  box-shadow: 1px 1px 2px 0 #eeeeee;
}
.navWrap .text{
  text-align: center;
  height: 100rpx;
  line-height: 100rpx;
  width: 100%;
  text-align: center;
  font-size: 34rpx;
  letter-spacing: 4rpx;
  font-weight: bolder;
}
.navWrap .return{
  position: absolute;
  height: 100rpx;
  line-height: 100rpx;
  width: 40rpx;
  left: 30rpx;
  bottom: 0;
  text-align: left;
}

</style>