<template>
  <u-image :width="width" :height="height" :border-radius="radius" :src="isPrefix?prefix+src:src" :mode="mode" @click="imgClick">
    <view class="error" slot="error">
      <image :style="{width: width, height: height, borderRadius: radius+'rpx'}" :src="error" :mode="mode" />
    </view>
  </u-image>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from "vue-property-decorator";
  import { CommonModule } from '@/store/modules/common';

  @Component
	export default class extends Vue{
    public prefix:string = CommonModule.url;

    @Prop({ default:'' }) src!:string;
    @Prop({ default:'100%' }) width!:string;
    @Prop({ default:'300rpx' }) height!:string;
    @Prop({ default:'0' }) radius!:string;
    @Prop({ default:'aspectFill' }) mode!:string;
    @Prop({ default:'/static/images/product.png' }) error!:string;
    @Prop({ default:true }) isPrefix!:boolean;

    @Emit('click')
    public imgClick() {
      return
    }
  }
</script>

<style lang="scss" scoped>
.error{
  width: 100%;
  height: 100%;
}
/deep/.u-image__image{
  pointer-events: auto!important;;
}
</style>
