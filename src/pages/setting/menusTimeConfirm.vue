<template>
  <view class="container">
    <view class="title">时间校准</view>
    <view class="wrap">
      当前时间：{{time}}
      <!-- <u-icon class="icon" name="reload" size="32" color="#d7000f" @click="getNowTime"></u-icon> -->
    </view>
    <view class="btnWrap">
      <DkmButton text="确认" height="70" fontSize="28" @click="submit"/>
    </view>
  </view>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from "vue-property-decorator";
  import DkmButton from '@/components/dkmButton/dkmButton.vue';

  import { formatTime, Time2Hex } from '@/utils/util';
  import { CommonModule } from '@/store/modules/common';
  import { getTimeHex, getEncrypt } from '@/api/setting';

  @Component({
    components: {
      DkmButton
    }
  })
	export default class extends Vue{
    private time:string = '';               // 当前时间


    getNowTime() {
      let date = new Date();
      this.time = formatTime(date, 'hh:mm:ss');
    }

    // 提交
    submit() {
      this.getNowTime();
      this.nowTimeSet();
    }

    /**
     * 提交设置当前时间
     */
    nowTimeSet() {
      let timeArr = this.time.split('-');
      let time = ''
      for(let item of timeArr) {
        time += Time2Hex(item)
      }
      let data = {
        type: 2,
        code: CommonModule.machineCode,
        machine_id: CommonModule.machineId,
        time
      }
      getEncrypt(data).then(async (res) => {
        CommonModule.bt.writeCommon(res.data, 'time');
      })
    }
    
    created() {
      this.getNowTime();
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
    padding-top: 20rpx;
    padding-bottom: 20rpx;
    font-size: 28rpx;
    color: #808080;
    .icon{
      margin-left: 20rpx;
    }
  }
  .btnWrap{
    padding: 30rpx 100rpx
  }
}
</style>