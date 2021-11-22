<template>
  <view class="container">
    <view class="title">灯光定时</view>
    <view class="wrap">
      <view class="item">开灯时间：
        <picker mode="time" :value="timeStart" @change="timeStartChange">
          <view class="pick">{{timeStart + ':00'}}</view>
        </picker>      
      </view>
      <view class="item">关灯时间：
        <picker mode="time" :value="timeEnd" @change="timeEndChange">
          <view class="pick">{{timeEnd + ':00'}}</view>
        </picker>
      </view>
    </view>
    <view class="btnWrap">
      <DkmButton text="确认" height="70" fontSize="28" @click="submit"/>
    </view>

  </view>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from "vue-property-decorator";
  import DkmButton from '@/components/dkmButton/dkmButton.vue';

  import { getTimeHex, getEncrypt } from '@/api/setting';
  import { CommonModule } from "@/store/modules/common";
  import { Hex2Int, Time2Hex } from '@/utils/util';


  @Component({
    components: {
      DkmButton
    }
  })
	export default class extends Vue{
    private timeStart:string = '00:00';
    private timeEnd:string = '00:00';

    timeStartChange(e:any) {
      this.timeStart = e.detail.value;
    }

    timeEndChange(e:any) {
      this.timeEnd = e.detail.value;
    }

    // 提交
    submit() {
      let that = this;
    let data = {
      type: 1,
      machine_id: CommonModule.machineId,
      code: CommonModule.machineCode,
      start: that.lightTimeHandler(that.timeStart),
      end: that.lightTimeHandler(that.timeEnd)
    }

    getEncrypt(data).then(async (res) => {
        wx.showToast({
          title: '设置成功',
          icon: 'success'
        })
        CommonModule.bt.writeCommon(res.data, 'lightTimer');
        let callback = await getTimeHex({hex_name: 'readTiming'});
        CommonModule.bt.writeCommon(callback.data, 'lightTimer');
      })
    }

    // 定时格式处理
    lightTimeHandler(time:any) {
      let arr = time.split(':');
      let hex = '';
      for(let item of arr) {
        hex += Time2Hex(item);
      }
      return hex
    }


    created() {
      let that = this;

      CommonModule.bt.onReturn((res) => {
        if(res.type === 'feedback' && res.data.cmd === 'e3') {
          let timeHex = res.data.hex
          let timeBegin = Hex2Int(timeHex.slice(-8, -6)) + ':'
          let timeBeginMin = Hex2Int(timeHex.slice(-6, -4));
          if(timeBeginMin < 10) {
            timeBegin += '0' + timeBeginMin
          } else {
            timeBegin += timeBeginMin
          }
          let timeEnd = Hex2Int(timeHex.slice(-4, -2)) + ':';
          let timeEndMin = Hex2Int(timeHex.slice(-2));
          if(timeEndMin < 10) {
            timeEnd += '0' + timeEndMin
          } else {
            timeEnd += timeEndMin
          }
          that.timeStart = timeBegin;
          that.timeEnd = timeEnd;
        }
      })

      // 获取灯光定时
      getTimeHex({hex_name: 'readTiming'}).then(res => {
        CommonModule.bt.writeCommon(res.data, 'lightTimer');
      })
    }
  }
</script>

<style lang="scss" scoped>
.container{
  text-align: center;
  .title{
    line-height: 100rpx;
  }
  .wrap{
    padding-top: 10rpx;
    padding-bottom: 10rpx;
    font-size: 28rpx;
    color: #808080;
    .item{
      line-height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon{
      margin-left: 20rpx;
    }
  }
  .btnWrap{
    padding: 30rpx 100rpx
  }
}
</style>