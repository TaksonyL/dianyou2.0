<template>
<view>
  <!--pages/setting/index.wxml-->
  <navbar :params="{title: '设置', shadow: false}"/>
  <view class="header p30 font-gray">
  <view class="item name">大可马科技</view>
  <view class="item"><text>设备ID：</text>{{deviceCode || '暂无设备'}}</view>
  <!-- <view class="item"><text>所属点位：</text>大可马</view> -->
  <!-- <view class="item"><text>二维码号：</text>1609223387429</view> -->
  <view class="status">
    <view class="icon">
      <image v-if="bluetooth" src="/static/images/bluetooth.svg" mode="aspectFill"></image>
      <image v-else src="/static/images/bluetooth-off.svg" mode="aspectFill"></image>
    </view>
      <battery :number="battery" />
    </view>
  </view>

  <!-- 权限蒙层 -->
  <view v-if="permission" class="permission" @click="()=>{}"></view>

  <view class="contentWrap p30">
    <!-- <view class="item formItem" bindtap="dialogOpen" data-index="{{0}}">
      <view>设备名称</view>
      <view class="iconfont icon-arrow-right-bold icon"></view>
    </view> -->
    <view class="item formItem" @click="dialogOpen" data-index="1">
      <view>开柜测试</view>
      <view class="iconfont icon-arrow-right-bold icon"></view>
    </view>
    <view class="item formItem" @click="dialogOpen" data-index="2">
      <view>时间校准</view>
      <view class="iconfont icon-arrow-right-bold icon"></view>
    </view>
    <view class="item formItem" @click="dialogOpen" data-index="3">
      <view>灯光测试</view>
      <view class="iconfont icon-arrow-right-bold icon"></view>
    </view>
    <view class="item formItem" @click="dialogOpen" data-index="4">
      <view>灯光定时</view>
      <view class="iconfont icon-arrow-right-bold icon"></view>
    </view>
    <view class="item formItem" @click="getRestoration">
      <view>设备复位</view>
      <view class="iconfont icon-arrow-right-bold icon"></view>
    </view>
  </view>


  <view :class="[dialogShow? 'dialog dialogShow' : 'dialog']" @click="dialogClose">
    <view class="dialogWrap" @click="() => {}">
      <view class="title">{{dialogInfo[dialogIndex].title}}</view>
      <view class="content">

        <view v-if="dialogIndex === 0" class="tag">
          <view class="name">设备名称</view>
          <view class="inputWrap">
            <input type="text" />
          </view>
        </view>

        <view v-else-if="dialogIndex === 1" class="testWrap">
          <block v-for="(item, index) in channelList" :key="index">
            <view class="item" :data-code="item.number" @click.stop="openTest">{{item.name}}</view>
          </block>
        </view>

        <view v-else-if="dialogIndex === 2" class="timeWrap">
          <view class="name">当前时间：{{nowTime}}</view>
          <view class="timeBtn p30">
            <button @click.stop="timeAdjust">时间校准</button>
          </view>
        </view>

        <view v-else-if="dialogIndex === 3" class="lightTest">
          <button class="lightOpen" @click.stop="lightOpen">开灯</button>
          <button class="lightClose" @click.stop="lightClose">关灯</button>
        </view>

        <view v-else-if="dialogIndex === 4" class="lightTask">
          <view class="item" @click.stop="() => {}">
            <view class="text">开灯时间：</view>
            <picker mode="time" :value="lightTime.begin" @change="lightOpenChange">
              <view class="pick">{{lightTime.begin + ':00'}}</view>
            </picker>                                                               
          </view>
          <view class="item" @click.stop="() => {}">
            <view class="text">关灯时间：</view>
            <picker mode="time" :value="lightTime.end" @change="lightCloseChange">
              <view class="pick">{{lightTime.end + ':00'}}</view>
            </picker>   
          </view>
        </view>

      </view>
      <view class="btnWrap">
        <view class="btn cancel" @click.stop="dialogClose">取消</view>
        <view class="btn confirm" v-if="dialogInfo[dialogIndex].submit" @click="settingSubmit">确认</view>
      </view>
    </view>
  </view>

</view>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import navbar from '@/components/navbar/navbar.vue';

import { CommonModule } from '@/store/modules/common';
import { BluetoothModule } from '@/store/modules/bluetooth';

import { writeData } from '@/api/bluetooth';
import { testChannel, getEncrypt, getTimeHex, getRestoration } from '@/api/setting';
import { Time2Hex, Hex2Int } from '@/utils/util';
import getBT from '@/utils/getBT';
import { reconnectBT } from '@/utils/bluetooth';

@Component({
  components: {
    navbar
  }
})
export default class extends Vue {
  private deviceCode:any = BluetoothModule.deviceCode
  private bluetooth:boolean = false;        // 蓝牙
  private battery:number|string = '?';             // 电量
  private permission:boolean = true;        // 权限

  private dialogShow:boolean = false;
  private dialogIndex:number = 0;
  private dialogInfo:Array<object> = [
    { title: '名称设置', submit: true },
    { title: '开柜测试' },
    { title: '时间校准' },
    { title: '灯光测试' },
    { title: '灯光定时', submit: true }
  ];
  private channelList:Array<{name:string, number:string}> = [
    {name: "1号格子", number: '01'},{name: "2号格子", number: '02'},{name: "3号格子", number: '03'},
    {name: "4号格子", number: '04'},{name: "5号格子", number: '05'},{name: "6号格子", number: '06'},
    {name: "7号格子", number: '07'},{name: "8号格子", number: '08'},{name: "9号格子", number: '09'}
  ];
  private lightTime:any = {begin: '10:00', end: '22:00'};
  private nowTime:string = '00-00-00';
  
  // 弹窗打开
  dialogOpen(e:any) {
    let index = e.currentTarget.dataset.index;
    this.dialogShow = true
    this.dialogIndex = Number(index)
  }
  // 弹窗关闭
  dialogClose() {
    this.dialogShow = false
  }

  // 灯光定时
  lightOpenChange(e:any) {
    let value = e.detail.value;
    this.lightTime.begin = value
  }
  lightCloseChange(e:any){
    let value = e.detail.value;
    this.lightTime.end = value
  }

  // 测试开门
  openTest(e:any) {
    let data = {
      channel:  e.currentTarget.dataset.code
    }
    BluetoothModule.SET_RETURNTYPE(2);
    testChannel(data).then((res:any) => {
      let hex = res.data;
      writeData(hex)
    })
  }

  // 获取当前时间
  getNowTime() {
    let date = new Date();
    let hour:any = date.getHours();
    if(hour<10) hour = '0' + hour;
    let minute:any = date.getMinutes();
    if(minute<10) minute = '0' + minute;
    let second:any = date.getSeconds();
    if(second<10) second = '0' + second;
    let dateCode = hour + '-' + minute + '-' + second;
    this.nowTime = dateCode
    return dateCode
  }
  // 时间校准
  timeAdjust() {
    this.getNowTime();
    this.nowTimeSet();
  }

  /**
   * 提交设置
   */
  settingSubmit() {
    switch(this.dialogIndex) {
      case 4:
        this.lightTimerSet();
        break;
    }
  }

    /**
   * 提交灯光定时
   */
  lightTimerSet() {
    let that = this;
    let data = {
      type: 1,
      machine_id: CommonModule.machineId,
      code: BluetoothModule.deviceCode,
      start: that.lightTimeHandler(that.lightTime.begin),
      end: that.lightTimeHandler(that.lightTime.end)
    }

    getEncrypt(data).then(async (res) => {
      wx.showToast({
        title: '设置成功',
        icon: 'success'
      })
      writeData(res.data);
      let callback = await getTimeHex({hex_name: 'readTiming'})
      writeData(callback.data);
      that.dialogClose();
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

  /**
   * 提交设置当前时间
   */
  nowTimeSet() {
    let timeArr = this.nowTime.split('-');
    let time = ''
    for(let item of timeArr) {
      time += Time2Hex(item)
    }
    let data = {
      type: 2,
      code: BluetoothModule.deviceCode,
      machine_id: CommonModule.machineId,
      time
    }
    getEncrypt(data).then(async (res) => {
      writeData(res.data)
      let callback = await getTimeHex({hex_name: 'readNowTime'})
      writeData(callback.data);
    })
  }

  /**
   * 开灯 
   */
  lightOpen() {
    writeData(BluetoothModule.lightSwitch.open)
  }

  /**
   * 关灯
   */
  lightClose() {
    writeData(BluetoothModule.lightSwitch.close)
  }

  /**
   * 获取设备复位
   */
  getRestoration() {
    getRestoration({}).then(async (res) => {
      await writeData(res.data);
      getBT();
    })
  }

  onLoad(options:any) {
    this.getNowTime()

    getTimeHex({hex_name: 'readTiming'}).then(res => {
      writeData(res.data);
    })
  }

  onShow() {
    reconnectBT();
    if(BluetoothModule.battery) {
      this.battery = Number(BluetoothModule.battery);
    }
    this.bluetooth = BluetoothModule.launch
    // if(false) {
    if(CommonModule.userType === 0) {
      wx.showToast({
        title: '您暂时没有权限',
        icon: 'none',
        duration: 1000
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index',
        })
      }, 800)
    } else {
      this.permission = false
    }
  }

  onBluetooth(e:any) {
    console.log(e)
    if(e.type === 'feedback' && e.value.cmd === 'e3') {
      let timeHex = e.value.hex
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
      this.lightTime.begin = timeBegin;
      this.lightTime.end = timeEnd;
    }
  }
}
</script>

<style lang="scss">

.header{
  background-color: #fff;
  font-size: 26rpx;
  padding-bottom: 30rpx;
  position: relative;
}
.header .name{
  font-size: 32rpx;
  color: #333;
}
.header .item{
  line-height: 50rpx;
}
.header .item text{
  display: inline-block;
  width: 140rpx;
}
.header .status{
  position: absolute;
  top: 6rpx;
  right: 30rpx;
  display: flex;
  align-items: center;
}
.header .status .icon{
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.contentWrap{
  background-color: #fff;
  margin-top: 30rpx;
}
.contentWrap .item .icon{
  font-size: 24rpx;
  color: #999999;
}
.contentWrap .item~.item{
  border-top: 1px solid #eee;
}


.dialog{
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, .5);
  z-index: -9;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all .3s;
}
.dialogShow{
  opacity: 1;
  z-index: 9999;
}
.dialog .dialogWrap{
  width: 640rpx;
  /* height: 500rpx; */
  background-color: #fff;
  border-radius: 20rpx;
  font-size: 28rpx;
}
.dialog .dialogWrap .title{
  font-size: 30rpx;
  text-align: center;
  line-height: 80rpx;
  color: #545454;
  /* border-bottom: 1px solid #f2f2f2; */
}
.dialog .dialogWrap .btnWrap{
  display: flex;
  line-height: 100rpx;
  border-top: 1px solid #eee;
}
.dialog .dialogWrap .btnWrap .btn{
  flex: 1;
  text-align: center;
}
.dialog .dialogWrap .btnWrap .cancel{
  color: #999;
}
.dialog .dialogWrap .btnWrap .confirm{
  border-left: 1px solid #eee;
}

/* 设备名称 */
.dialog .dialogWrap .content .tag{
  padding: 40rpx 0 80rpx;
}
.dialog .dialogWrap .content .tag .name{
  text-align: center;
}
.dialog .dialogWrap .content .tag .inputWrap{
  width: 70%;
  margin: 30rpx auto 0;
  padding: 10rpx 16rpx;
  border: 1px #e5e5e5 solid;
}

/* 柜门测试 */
.dialog .dialogWrap .content .testWrap{
  padding: 40rpx 30rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.dialog .dialogWrap .content .testWrap .item{
  font-size: 26rpx;
  background-color: #e64240;
  width: 28%;
  line-height: 80rpx;
  text-align: center;
  margin-bottom: 30rpx;
  color: #f2f2f2;
}

/* 时间校准 */
.dialog .dialogWrap .content .timeWrap{
  text-align: center;
  padding: 40rpx 0 80rpx;
  color: #545454;
}
.dialog .dialogWrap .content .timeBtn button{
  background-color: #e64240;
  color: #f2f2f2;
  margin-top: 30rpx;
  width: 60%;
  height: 80rpx;
  line-height: 80rpx;
}

/* 灯光测试 */
.dialog .dialogWrap .content .lightTest{
  text-align: center;
  padding: 40rpx 0 80rpx;
}
.dialog .dialogWrap .content .lightTest button{
  background-color: #e64240;
  color: #f2f2f2;
  margin-top: 30rpx;
  font-weight: normal;
  font-size: 28rpx;
  line-height: 48rpx;
  height: 80rpx;
  line-height: 80rpx;
  width: 60%;
}
.dialog .dialogWrap .content .lightTest .lightClose{
  background-color: #ccc;
  color: #545454;
}

/* 灯光定时 */
.dialog .dialogWrap .content .lightTask{
  padding: 30rpx 100rpx;
}
.dialog .dialogWrap .content .lightTask .item{
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
}
.dialog .dialogWrap .content .lightTask .item .text{
  min-width: 160rpx;
}
.dialog .dialogWrap .content .lightTask .item picker{
  width: 100%;
}
.dialog .dialogWrap .content .lightTask .item .pick{
  width: 100%;
  border: 1px solid #ccc;
  padding: 6rpx 18rpx;
  color: #777;
  font-size: 26rpx;
  box-sizing: border-box;
}


.permission{
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, .7);
  z-index: 999;
}

</style>