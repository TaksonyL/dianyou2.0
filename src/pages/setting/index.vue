<template>
	<view class="settingPage">
    <Navbar :params="{title: '设置', shadow:false}" :back="false" />

    <view class="headerWrap p30">
      <view class="item name">大可马科技</view>
      <view class="item">设备ID：<text>{{deviceCode || '暂无设备'}}</text></view>
      <view class="status">
        <view class="icon">
          <image v-if="bluetooth" src="/static/images/bluetooth.svg" mode="aspectFill"></image>
          <image v-else src="/static/images/bluetooth-off.svg" mode="aspectFill"></image>
        </view>
        <Battery :number="battery" />
      </view>
    </view>

    <!-- 调试菜单 -->
    <view class="menusWrap p30">

      <view class="item" v-for="(item, index) in menus" :key="index" @click="menuOpen(item.value)">
        <view class="label">{{item.name}}</view>
        <view class="icon">
          <u-icon name="arrow-right" size="28" color="#808080"></u-icon>
        </view>
      </view>

    </view>

    <u-modal v-model="show" :show-title="false" confirm-color="#d7000f" :mask-close-able="true"
     :show-confirm-button="false">
     <view class="modalWrap">
        <MenusChannel v-if="menusValue === 0" />
        <MenusTimeConfirm v-else-if="menusValue === 1" />
        <MenusLightSwitch v-else-if="menusValue === 2" />
        <MenusLightTimer v-else-if="menusValue === 3" />
        <view class="closeWrap" @click="show = false">
          <u-icon name="close" color="#aaa" size="28"></u-icon>
        </view>
     </view>
    </u-modal>

    <Tabbar :current="1" />
	</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";
  import Navbar from '@/components/navbar/navbar.vue';
  import Battery from '@/components/battery/battery.vue';
  import Tabbar from '@/components/tabbar/tabbar.vue';

  import { CommonModule } from '@/store/modules/common';
  import MenusChannel from './menusChannel.vue';
  import MenusTimeConfirm from './menusTimeConfirm.vue';
  import MenusLightSwitch from './menusLightSwitch.vue';
  import MenusLightTimer from './menusLightTimer.vue';

  @Component({
    components: {
      Navbar, Battery, Tabbar, MenusChannel, MenusTimeConfirm, MenusLightSwitch, MenusLightTimer
    }
  })
  export default class extends Vue{
    private deviceCode:string = CommonModule.machineCode;
    private battery:number = 0;             // 电量
    private bluetooth:boolean = false;      // 是否开启蓝牙
    private menus:any[] = [
      // { name: '货道测试', value: 0 }, { name: '时间校准', value: 1 }, { name: '灯光测试', value: 2 }, { name: '灯光定时', value: 3 }, { name: '设备复位', value: 4 }
      // { name: '货道测试', value: 0 }, { name: '时间校准', value: 1 }, { name: '灯光测试', value: 2 }, { name: '灯光定时', value: 3 }
      { name: '货道测试', value: 0 }
    ];                // 菜单列表
    private show:boolean = false;           // 对话框显示
    private menusValue:number = 0;         // 菜单选择下标

    menuOpen(e:number) {
      this.menusValue = e;
      if(this.menusValue === 4) {
        // 复位
      } else {
        this.show = true;
      }
    }


    onShow() {
      this.battery = CommonModule.bt.battery;
      this.bluetooth = CommonModule.bt.status.init;
    }
  }
</script>

<style lang="scss" scoped>
.settingPage{
  .headerWrap{
    background-color: $back-color;
    font-size: 26rpx;
    padding-bottom: 30rpx;
    position: relative;
    .name{ font-size: 32rpx; }
    .item{
      line-height: 50rpx;
      text{
        display: inline-block;
        width: 140rpx;
      }
    }
    .status{
      position: absolute;
      top: 6rpx;
      right: 30rpx;
      display: flex;
      align-items: center;
      font-size: 24rpx;
      .icon{
        width: 40rpx;
        height: 40rpx;
        margin-right: 20rpx;
        image{
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .menusWrap{
    margin-top: 20rpx;
    background-color: $back-color;
    .item{
      line-height: 90rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item~.item{
      border-top: 1px solid #eee;
    }
  }
}

.modalWrap{
  position: relative;
  .closeWrap{
    position: absolute;
    top: 26rpx;
    right: 30rpx;
  }
}


</style>
