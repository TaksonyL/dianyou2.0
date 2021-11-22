<template>
	<view class="orderPage">
    <Navbar :params="{title: '订单列表'}" :back="false"/>
    
    <view class="orderList p30">

      <block v-for="(item, index) in list" :key="index">
        <OrderItem :item="item" />
      </block>

    </view>

    <Tabbar :current="2" />
	</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Mixins } from "vue-property-decorator";
  import Navbar from '@/components/navbar/navbar.vue';
  import Tabbar from '@/components/tabbar/tabbar.vue';
  import OrderItem from './orderItem.vue';

  import { getOrder } from '@/api/user';

  @Component({
    components: {
      Navbar, OrderItem, Tabbar
    }
  })
  export default class extends Vue{
    private page:number = 1;
    private lastPage:number = 99;
    private list:any[] = [];
    private loading:boolean = false;


    getData() {
      let that = this;
      if(that.loading) return
      if(that.page > that.lastPage) return
      that.loading = true;
      let request = {
        page: that.page
      }
      getOrder(request).then(res => {
        that.loading = false
        that.page++;
        that.lastPage = res.data.last_page;
        that.list = [ ...that.list, ...res.data.data]
      }).catch(err => {
        that.loading = false
      })
    }

    onShow() {
      this.page = 0;
      this.lastPage = 99;
      this.list = [];
      this.getData();
    }

    onReachBottom() {
      this.getData();
    }
    
  }
</script>

<style>

</style>
