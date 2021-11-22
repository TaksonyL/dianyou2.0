<template>
  <u-button v-if="disable" shape="circle" type="default" @click="click" :disabled="true" hover-class="none"
   :custom-style="{backgroundColor: '#808080', color: '#fafafa', lineHeight: height+'rpx', height: height+'rpx', fontSize: fontSize+'rpx'}">{{text}}</u-button>
  <u-button v-else shape="circle" type="error" @click="click"
   :custom-style="{backgroundColor: '#d7000f', color: '#fafafa', lineHeight: height+'rpx', height: height+'rpx', fontSize: fontSize+'rpx'}">{{text}}</u-button>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from "vue-property-decorator";

  @Component
	export default class extends Vue{
    @Prop({ default: '主要按钮' }) text!:string;
    @Prop({ default: '80' }) height!:string;
    @Prop({ default: '32' }) fontSize!:string;
    @Prop({ default: false }) disable!:boolean;

    @Emit()
    click(e:any) { return e }
  }
</script>

<style lang="scss" scoped>

</style>
