<template>
	<view class="content">

    <block v-for="(item, index) in list" :key="index">
      <view class="item">
        <view class="service">
          <view>
            <view>服务</view>
            <view>UUID：{{item.service}}</view>    
          </view>
          <view class="expand" @click="expand(index)">
            v
          </view>
        </view>
        <view class="character" v-if="indexExpand === index">
          <view class="cell" v-for="(ite, i) in item.character" :key="i">
            <view>
              <view>特征值</view>
              <view>UUID：{{ite.uuid}}</view>
            </view>
            <view class="btnWrap">
              <view class="btn" v-if="ite.properties.read" @click="read(item.service, ite.uuid)">R</view>
              <view class="btn" v-if="ite.properties.notify" @click="notify(item.service, ite.uuid)">N</view>
              <view class="btn" v-if="ite.properties.write" @click="writeOpen(item.service, ite.uuid)">W</view>
            </view>
          </view>
        </view>
      </view>  
    </block>

    <u-modal v-model="writeShow" @confirm="writeSubmit">
      <u-field v-model="writeForm.value" label="Hex" placeholder="请填写16位指令">
      </u-field>
    </u-modal>

	</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";
  import Bluetooth from '@/bluetooth/base';
  import { CommonModule } from '@/store/modules/common';

  @Component({})
  export default class extends Vue{
    private bluetooth:any = null;
    private indexExpand:number = -1;
    private list:any = CommonModule.bt.commandBluetooth;

    private writeShow:boolean = false;
    private writeForm = {
      value: '',
      service: '',
      character: '',
    }


    private writeOpen(service:string, character:string) {
      this.writeForm.service = service;
      this.writeForm.character = character;
      this.writeShow = true
    }

    private writeSubmit() {
      this.bluetooth.write(this.writeForm.value, this.writeForm.service, this.writeForm.character);
    }

    private read(service:string, character:string) {
      this.bluetooth.read(service, character);
    }

    private notify(service:string, character:string) {
      this.bluetooth.notify(service, character);
    }

    private expand(index:number) {
      this.indexExpand = index;
    }

    

    onLoad() {
      // let that = this
      // this.bluetooth = new Bluetooth();
      // that.btHandler();
    }
  }
</script>

<style>
page{
  background-color: #f2f2f2;
}
.content{
  padding: 30rpx;
  font-size: 28rpx;
}
.item{
  background-color: #fff;
  border-radius: 8rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}
.item .service{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}
.item .character .cell{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20rpx;
  border-top: 1px solid #e5e5e5;
}

.btnWrap{
  display: flex;
}
.btnWrap .btn{
  width: 50rpx;
  height: 50rpx;
  line-height: 50rpx;
  text-align: center;
  border-radius: 50%;
  background-color: #d7000f;
  color: #fff;
  margin-left: 20rpx;
}
.expand{
  height: 100%;
  min-width: 80rpx;
  text-align: center;
}
</style>
