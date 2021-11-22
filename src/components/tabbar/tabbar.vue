<template>
  <u-tabbar v-model="current" :list="tabList" inactive-color="#808080" active-color="#e64240" :before-switch="beforeSwitch"></u-tabbar>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";
  import { CommonModule } from '@/store/modules/common';

  @Component
	export default class extends Vue{
    @Prop({ default: 0 }) current!:0;

    private tabList = CommonModule.tabbarList

    beforeSwitch(index:number) {
      console.log(CommonModule.tabbarList);
      if(index === this.current) {
        return false
      } else {
        return true
      }
    }
  }
</script>

<style lang="scss" scoped>


</style>